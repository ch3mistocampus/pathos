"""Round scheduler.

Modal-scheduled tick: picks a random fixture from the image-baked
`/fixtures` directory, strips ground truth, and runs one round via the
orchestrator.
"""
import json
import random
from pathlib import Path

import modal

from modal_app import (
    VOLUME_MOUNT,
    anthropic_secret,
    app,
    image,
    volume,
)

FIXTURES_DIR = Path("/fixtures")


@app.function(
    image=image,
    volumes={VOLUME_MOUNT: volume},
    secrets=[anthropic_secret],
    schedule=modal.Period(seconds=90),
    timeout=600,
)
def tick() -> dict:
    """Run one scheduled round against a random fixture."""
    from functions.orchestrator import run_round  # lazy import: avoids module-init cycle

    fixtures = sorted(FIXTURES_DIR.glob("*.json"))
    if not fixtures:
        return {"error": "no fixtures available", "fixtures_dir": str(FIXTURES_DIR)}

    path = random.choice(fixtures)
    with path.open() as f:
        variant = json.load(f)
    truth = variant.pop("_ground_truth", None)
    if truth is None:
        return {"error": "fixture missing _ground_truth", "fixture": path.stem}

    result = run_round.remote(variant, truth)
    return {
        "round_id": result["round_id"],
        "fixture": path.stem,
        "scores": {a: s["score"] for a, s in result.get("scores", {}).items()},
    }


@app.local_entrypoint()
def main():
    """One-shot manual tick for testing."""
    print(json.dumps(tick.remote(), indent=2))
