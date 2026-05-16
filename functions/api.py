"""FastAPI endpoints served by Modal.

Three GET endpoints the frontend polls: leaderboard, recent rounds, and
a single round detail. CORS-permissive via per-response headers so the
Next.js demo can fetch cross-origin.
"""
import json
from pathlib import Path

import modal
from fastapi import HTTPException
from fastapi.responses import JSONResponse

from modal_app import (
    AGENT_NAMES,
    VOLUME_MOUNT,
    app,
    image,
    leaderboard as leaderboard_dict,
    volume,
)

CORS_HEADERS = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "*",
}

CLINVAR_TO_CODE = {
    "Pathogenic": "P",
    "Likely_pathogenic": "LP",
    "Uncertain_significance": "VUS",
    "Likely_benign": "LB",
    "Benign": "B",
}


@app.function(image=image, volumes={VOLUME_MOUNT: volume})
@modal.fastapi_endpoint(method="GET")
def leaderboard() -> JSONResponse:
    """Return the 5-agent leaderboard, sorted by EMA descending."""
    entries = []
    for name in AGENT_NAMES:
        try:
            entry = leaderboard_dict.get(name)
        except KeyError:
            entry = None
        if entry is None:
            entry = {"agent": name, "ema": 0.0, "rounds": 0, "history": []}
        entries.append(entry)

    entries.sort(key=lambda e: e.get("ema", 0.0), reverse=True)
    return JSONResponse(content=entries, headers=CORS_HEADERS)


@app.function(image=image, volumes={VOLUME_MOUNT: volume})
@modal.fastapi_endpoint(method="GET")
def rounds(limit: int = 20) -> JSONResponse:
    """Return recent round summaries, newest first."""
    limit = max(1, min(limit, 100))
    volume.reload()

    rounds_dir = Path(VOLUME_MOUNT) / "rounds"
    summaries: list[dict] = []
    if not rounds_dir.exists():
        return JSONResponse(content=summaries, headers=CORS_HEADERS)

    loaded: list[dict] = []
    for entry in rounds_dir.iterdir():
        if not entry.is_dir():
            continue
        round_path = entry / "round.json"
        if not round_path.exists():
            continue
        try:
            with round_path.open() as f:
                loaded.append(json.load(f))
        except (OSError, json.JSONDecodeError):
            continue

    loaded.sort(key=lambda r: r.get("timestamp", ""), reverse=True)

    for round_dict in loaded[:limit]:
        scores = round_dict.get("scores") or {}
        if not scores:
            continue
        try:
            top_agent, top_entry = max(
                scores.items(), key=lambda kv: kv[1].get("score", 0.0)
            )
        except (ValueError, AttributeError):
            continue

        truth_long = (round_dict.get("truth") or {}).get("classification", "")
        variant = round_dict.get("variant") or {}

        summaries.append(
            {
                "round_id": round_dict.get("round_id"),
                "variant_id": variant.get("variant_id"),
                "timestamp": round_dict.get("timestamp"),
                "truth_classification": CLINVAR_TO_CODE.get(truth_long, "VUS"),
                "top_agent": top_agent,
                "top_score": round(float(top_entry.get("score", 0.0)), 3),
            }
        )

    return JSONResponse(content=summaries, headers=CORS_HEADERS)


@app.function(image=image, volumes={VOLUME_MOUNT: volume})
@modal.fastapi_endpoint(method="GET")
def round_detail(round_id: str) -> JSONResponse:
    """Return one round's full Round-shaped payload, or 404."""
    volume.reload()

    round_path = Path(VOLUME_MOUNT) / "rounds" / round_id / "round.json"
    if not round_path.exists():
        raise HTTPException(status_code=404, detail=f"Round {round_id} not found")

    try:
        with round_path.open() as f:
            round_dict = json.load(f)
    except (OSError, json.JSONDecodeError):
        raise HTTPException(status_code=404, detail=f"Round {round_id} not found")

    return JSONResponse(content=round_dict, headers=CORS_HEADERS)
