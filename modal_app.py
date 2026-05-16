"""Pathos — Modal app, image, volume, dict, secret, agent registry.

Single source of truth for shared Modal resources. Function modules import
from here; this module imports them at the bottom so their decorators
register on the app.
"""
import modal

app = modal.App("pathos")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("anthropic>=0.40.0", "fastapi[standard]")
    .add_local_dir("data/fixtures", "/fixtures", copy=True)
    .add_local_python_source("functions", "modal_app")
)

volume = modal.Volume.from_name("pathos_data", create_if_missing=True)
leaderboard = modal.Dict.from_name("pathos_leaderboard", create_if_missing=True)
anthropic_secret = modal.Secret.from_name("anthropic")

VOLUME_MOUNT = "/data"

AGENT_NAMES = [
    "strict_rule",
    "functional_first",
    "insilico_first",
    "population_first",
    "conservative",
]

DEFAULT_MODEL = "claude-sonnet-4-6"

from functions.agents import base  # noqa: E402,F401
from functions import orchestrator  # noqa: E402,F401
from functions import score_round   # noqa: E402,F401
from functions import scheduler     # noqa: E402,F401
from functions import api           # noqa: E402,F401
