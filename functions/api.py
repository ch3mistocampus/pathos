"""FastAPI app served by Modal.

Single ASGI app mounting three GET routes under one Modal URL:
- GET /leaderboard         -> list[LeaderboardEntry]
- GET /rounds?limit=N      -> list[RoundSummary]
- GET /rounds/{round_id}   -> Round (404 if missing, 400 if id is malformed)

CORS-permissive for the demo frontend.
"""
import json
import re
from pathlib import Path

import modal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from modal_app import (
    AGENT_NAMES,
    VOLUME_MOUNT,
    app,
    image,
    leaderboard as leaderboard_dict,
    volume,
)

CLINVAR_TO_CODE = {
    "Pathogenic": "P",
    "Likely_pathogenic": "LP",
    "Uncertain_significance": "VUS",
    "Likely_benign": "LB",
    "Benign": "B",
}

# Matches the orchestrator's round_id format (round_{int(time.time())}).
# Guards round_detail() against path traversal via .. segments.
ROUND_ID_RE = re.compile(r"^round_\d+$")


def _build_app() -> FastAPI:
    fastapi_app = FastAPI(title="Pathos API")
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["*"],
    )

    @fastapi_app.get("/leaderboard")
    def leaderboard():
        """5-agent leaderboard, sorted by EMA descending."""
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
        return entries

    @fastapi_app.get("/rounds")
    def rounds(limit: int = 20):
        """Recent round summaries, newest first."""
        limit = max(1, min(limit, 100))
        volume.reload()
        rounds_dir = Path(VOLUME_MOUNT) / "rounds"
        if not rounds_dir.exists():
            return []
        loaded = []
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

        summaries = []
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
            summaries.append({
                "round_id": round_dict.get("round_id"),
                "variant_id": variant.get("variant_id"),
                "timestamp": round_dict.get("timestamp"),
                "truth_classification": CLINVAR_TO_CODE.get(truth_long, "VUS"),
                "top_agent": top_agent,
                "top_score": round(float(top_entry.get("score", 0.0)), 3),
            })
        return summaries

    @fastapi_app.get("/rounds/{round_id}")
    def round_detail(round_id: str):
        """One round's full Round-shaped payload."""
        if not ROUND_ID_RE.fullmatch(round_id):
            raise HTTPException(status_code=400, detail="invalid round_id format")
        volume.reload()
        round_path = Path(VOLUME_MOUNT) / "rounds" / round_id / "round.json"
        if not round_path.exists():
            raise HTTPException(status_code=404, detail=f"Round {round_id} not found")
        try:
            with round_path.open() as f:
                return json.load(f)
        except (OSError, json.JSONDecodeError):
            raise HTTPException(status_code=404, detail=f"Round {round_id} not found")

    return fastapi_app


@app.function(image=image, volumes={VOLUME_MOUNT: volume})
@modal.asgi_app()
def fastapi_app() -> FastAPI:
    return _build_app()
