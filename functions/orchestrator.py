"""Round orchestrator.

Fans out the five agents in parallel, scores their predictions against
ground truth, persists artifacts to the volume, and updates the leaderboard
Modal Dict with an EMA per agent.
"""
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from modal_app import (
    AGENT_NAMES,
    VOLUME_MOUNT,
    anthropic_secret,
    app,
    image,
    leaderboard,
    volume,
)
from functions.score_round import score_round
# `run_agent` is imported lazily inside `run_round` to avoid the
# modal_app ↔ functions.agents.base ↔ functions.orchestrator import cycle
# that fires when a container starts with base.py or orchestrator.py as
# its entry module.

EMA_ALPHA = 0.1
HISTORY_CAP = 200


def _atomic_write(path: Path, content: str) -> None:
    """Write `content` to `path` atomically via tmp + os.replace.

    Avoids leaving a half-written round.json on disk if a Modal worker
    is OOM-killed mid-write — the readers under api.py would otherwise
    silently skip the malformed file.
    """
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(content)
    os.replace(tmp, path)


@app.function(
    image=image,
    volumes={VOLUME_MOUNT: volume},
    secrets=[anthropic_secret],
    timeout=300,
)
def classify_only(challenge: dict) -> dict:
    """Fan out the 5 agents on a user-submitted variant. No truth, no
    scoring, no leaderboard update. Persists predictions to
    /data/submissions/{submission_id}/ for later inspection.

    Returns: {"predictions": {agent_name: AgentPrediction-shaped dict}}
    """
    from functions.agents.base import run_agent  # lazy: breaks module-init cycle

    submission_id = f"sub_{int(time.time() * 1000)}"
    agent_challenge = {k: v for k, v in challenge.items() if not k.startswith("_")}

    inputs = [(agent_challenge, name) for name in AGENT_NAMES]
    results = list(run_agent.starmap(inputs, return_exceptions=True))

    predictions: dict[str, dict | None] = {}
    for name, result in zip(AGENT_NAMES, results):
        if isinstance(result, BaseException):
            predictions[name] = None
        else:
            predictions[name] = result

    timestamp = datetime.now(timezone.utc).isoformat()
    submission_record = {
        "submission_id": submission_id,
        "timestamp": timestamp,
        "variant": agent_challenge,
        "predictions": predictions,
    }

    sub_dir = Path(VOLUME_MOUNT) / "submissions" / submission_id
    sub_dir.mkdir(parents=True, exist_ok=True)
    _atomic_write(sub_dir / "submission.json", json.dumps(submission_record, indent=2))
    volume.commit()

    return {"submission_id": submission_id, "predictions": predictions}


@app.function(
    image=image,
    volumes={VOLUME_MOUNT: volume},
    secrets=[anthropic_secret],
    timeout=300,
)
def run_round(challenge: dict, truth: dict, round_id: str | None = None) -> dict:
    """One round: fan-out 5 agents, score, update leaderboard Dict, persist to volume.

    Returns a Round-shaped dict matching frontend/lib/types.ts.
    """
    from functions.agents.base import run_agent  # lazy: breaks module-init cycle

    if round_id is None:
        round_id = f"round_{int(time.time())}"

    agent_challenge = {k: v for k, v in challenge.items() if not k.startswith("_")}

    inputs = [(agent_challenge, name) for name in AGENT_NAMES]
    results = list(run_agent.starmap(inputs, return_exceptions=True))

    predictions: dict[str, dict | None] = {}
    for name, result in zip(AGENT_NAMES, results):
        if isinstance(result, BaseException):
            predictions[name] = None
        else:
            predictions[name] = result

    filtered = {n: p for n, p in predictions.items() if p is not None}
    scores = score_round(filtered, truth)

    timestamp = datetime.now(timezone.utc).isoformat()

    round_dict = {
        "round_id": round_id,
        "timestamp": timestamp,
        "variant": agent_challenge,
        "truth": truth,
        "predictions": predictions,
        "scores": scores,
    }

    round_dir = Path(VOLUME_MOUNT) / "rounds" / round_id
    round_dir.mkdir(parents=True, exist_ok=True)
    _atomic_write(round_dir / "round.json", json.dumps(round_dict, indent=2))
    _atomic_write(round_dir / "predictions.json", json.dumps(predictions, indent=2))
    _atomic_write(round_dir / "scores.json", json.dumps(scores, indent=2))
    volume.commit()

    for agent_name, score_entry in scores.items():
        score_value = score_entry["score"]
        try:
            prior = leaderboard.get(agent_name)
        except KeyError:
            prior = None

        if prior is None:
            new_ema = score_value
            rounds_count = 1
            history = []
        else:
            new_ema = (1 - EMA_ALPHA) * prior["ema"] + EMA_ALPHA * score_value
            rounds_count = prior["rounds"] + 1
            history = list(prior.get("history", []))

        history.append(
            {
                "round_id": round_id,
                "score": score_value,
                "predicted": score_entry["predicted"],
                "truth": score_entry["truth"],
                "timestamp": timestamp,
            }
        )
        history = history[-HISTORY_CAP:]

        leaderboard[agent_name] = {
            "agent": agent_name,
            "ema": round(new_ema, 3),
            "rounds": rounds_count,
            "history": history,
        }

    return round_dict


@app.local_entrypoint()
def run_fixture(fixture: str = "BRCA1_c.181T_G_p.Cys61Gly"):
    """Run one full round against a named fixture and print the result."""
    fixtures_dir = Path(__file__).parent.parent / "data" / "fixtures"
    fixture_path = fixtures_dir / f"{fixture}.json"
    with fixture_path.open() as f:
        variant = json.load(f)
    truth = variant.pop("_ground_truth", None)
    if truth is None:
        raise SystemExit(f"Fixture {fixture!r} has no _ground_truth block")

    result = run_round.remote(variant, truth)
    print(json.dumps(result, indent=2, default=str))
