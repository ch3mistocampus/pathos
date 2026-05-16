"""Deterministic scorer.

Grades each agent's prediction against ClinVar ground truth. Runs in-process
inside the orchestrator — not a Modal function.
"""

CLINVAR_TO_CODE = {
    "Pathogenic": "P",
    "Likely_pathogenic": "LP",
    "Uncertain_significance": "VUS",
    "Likely_benign": "LB",
    "Benign": "B",
}

ORDER = ["P", "LP", "VUS", "LB", "B"]

ACCURACY_BY_DISTANCE = {0: 1.0, 1: 0.75, 2: 0.5, 3: 0.25, 4: 0.0}


def score_round(predictions: dict[str, dict], truth: dict) -> dict[str, dict]:
    """Score each agent's prediction against ground truth.

    predictions: {agent_name: {classification, applied_criteria, reasoning, ...}}
                 Missing/None entries are skipped.
    truth: ground-truth dict from fixture, with key `classification` in ClinVar
           long form ("Pathogenic", "Likely_pathogenic", "Uncertain_significance",
           "Likely_benign", "Benign").
    Returns: {agent_name: AgentScore-shaped dict matching frontend/lib/types.ts}
    """
    truth_long = truth["classification"]
    truth_code = CLINVAR_TO_CODE.get(truth_long, truth_long)
    truth_idx = ORDER.index(truth_code)

    scores: dict[str, dict] = {}
    for agent_name, prediction in predictions.items():
        if prediction is None:
            continue
        predicted = prediction.get("classification")
        if predicted is None or predicted not in ORDER:
            continue

        distance = abs(ORDER.index(predicted) - truth_idx)
        accuracy = ACCURACY_BY_DISTANCE[distance]
        decisiveness = 1.0 if predicted != "VUS" else 0.5
        # TODO: Placeholder until criterion-aware ground truth is wired.
        applied = prediction.get("applied_criteria") or []
        criterion_match = 1.0 if applied else 0.0
        composite = round(0.7 * accuracy + 0.3 * criterion_match, 3)

        scores[agent_name] = {
            "predicted": predicted,
            "truth": truth_code,
            "accuracy": accuracy,
            "decisiveness": decisiveness,
            "criterion_match": criterion_match,
            "score": composite,
        }
    return scores


if __name__ == "__main__":
    import json

    truth = {"classification": "Pathogenic"}

    cases = {
        "perfect_match": {
            "classification": "P",
            "applied_criteria": ["PS3", "PM2", "PP3"],
        },
        "off_by_one": {
            "classification": "LP",
            "applied_criteria": ["PM2", "PP3"],
        },
        "far_off": {
            "classification": "B",
            "applied_criteria": ["BA1"],
        },
        "vus_no_criteria": {
            "classification": "VUS",
            "applied_criteria": [],
        },
        "missing_agent": None,
    }

    result = score_round(cases, truth)
    print(json.dumps(result, indent=2))
