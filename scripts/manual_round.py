"""Run one agent against one fixture locally for debugging.

Usage:
    modal run scripts/manual_round.py
    modal run scripts/manual_round.py --fixture=BRCA1_c.68_69del --agent=insilico_first
    modal run scripts/manual_round.py --all-agents
"""
import json
from pathlib import Path

from modal_app import AGENT_NAMES, app
from functions.agents.base import run_agent

FIXTURES_DIR = Path(__file__).parent.parent / "data" / "fixtures"

CLINVAR_TO_CODE = {
    "Pathogenic": "P",
    "Likely_pathogenic": "LP",
    "Uncertain_significance": "VUS",
    "Likely_benign": "LB",
    "Benign": "B",
}


def _load_fixture(fixture: str) -> tuple[dict, dict | None]:
    fixture_path = FIXTURES_DIR / f"{fixture}.json"
    if not fixture_path.exists():
        available = sorted(p.stem for p in FIXTURES_DIR.glob("*.json"))
        raise SystemExit(f"Fixture {fixture!r} not found. Available: {available}")
    with fixture_path.open() as f:
        variant = json.load(f)
    truth = variant.pop("_ground_truth", None)
    return variant, truth


def _verdict(predicted: str, truth: dict | None) -> str:
    if not truth:
        return "(no ground truth in fixture)"
    truth_code = CLINVAR_TO_CODE.get(truth["classification"], truth["classification"])
    if predicted == truth_code:
        return f"MATCH ({truth_code})"
    return f"MISS (predicted={predicted} truth={truth_code})"


@app.local_entrypoint()
def main(
    fixture: str = "BRCA1_c.181T_G_p.Cys61Gly",
    agent: str = "strict_rule",
    all_agents: bool = False,
):
    variant, truth = _load_fixture(fixture)
    print(f"Fixture: {variant.get('variant_id', fixture)}")
    if truth:
        print(f"Ground truth: {truth['classification']}")
    print()

    agents = AGENT_NAMES if all_agents else [agent]
    if not all_agents and agent not in AGENT_NAMES:
        raise SystemExit(f"Agent {agent!r} not in {AGENT_NAMES}")

    for agent_name in agents:
        print(f"=== {agent_name} ===")
        result = run_agent.remote(variant, agent_name)
        print(json.dumps({k: v for k, v in result.items() if not k.startswith("_")}, indent=2))
        usage = result.get("_usage", {})
        print(
            f"  model={result.get('_model')} "
            f"input={usage.get('input_tokens')} "
            f"output={usage.get('output_tokens')} "
            f"cache_read={usage.get('cache_read_input_tokens')} "
            f"cache_write={usage.get('cache_creation_input_tokens')}"
        )
        print(f"  {_verdict(result.get('classification'), truth)}")
        print()
