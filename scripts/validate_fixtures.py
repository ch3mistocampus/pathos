"""One-shot schema validator for BRCA1/BRCA2 ClinVar fixtures.

Checks every *.json under data/fixtures (or --dir) against the VariantChallenge
schema in frontend/lib/types.ts plus the _ground_truth (VariantTruth) block.
Reports ERR (always fatal) and WARN (fatal with --strict) per file, then prints
a summary. Exit 0 on success, 1 if any ERR or any WARN under --strict.

Usage: python scripts/validate_fixtures.py [--dir DIR] [--strict]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

VALID_CLASSIFICATIONS = {
    "Pathogenic",
    "Likely_pathogenic",
    "Uncertain_significance",
    "Likely_benign",
    "Benign",
}

REQUIRED_TOP_LEVEL = [
    "variant_id",
    "hgvs_c",
    "gene",
    "consequence",
    "chrom",
    "pos",
    "ref",
    "alt",
    "gnomad",
    "insilico",
    "mavedb_function",
    "literature",
]

REQUIRED_GNOMAD_KEYS = ["af", "af_popmax", "hom", "ac", "an"]
INSILICO_PREDICTORS = ["revel", "cadd_phred", "alphamissense", "metarnn", "spliceai_max"]
GENE_TRANSCRIPT = {"BRCA1": "NM_007294.4:", "BRCA2": "NM_000059.4:"}


def validate_fixture(path: Path) -> tuple[list[str], list[str]]:
    """Return (errors, warnings) for one fixture file."""
    errors: list[str] = []
    warnings: list[str] = []

    try:
        with path.open() as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        return ([f"file does not parse as JSON: {exc}"], [])
    except OSError as exc:
        return ([f"cannot read file: {exc}"], [])
    if not isinstance(data, dict):
        return ([f"top-level JSON must be an object, got {type(data).__name__}"], [])

    for key in REQUIRED_TOP_LEVEL:
        if key not in data:
            errors.append(f"missing required top-level field: {key}")
    if "_ground_truth" not in data:
        errors.append("missing _ground_truth block")

    gt = data.get("_ground_truth")
    if isinstance(gt, dict):
        cls = gt.get("classification")
        if cls not in VALID_CLASSIFICATIONS:
            errors.append(f"_ground_truth.classification {cls!r} not in {sorted(VALID_CLASSIFICATIONS)}")
        for opt in ("review_status", "clinvar_id", "submitter_count"):
            if opt not in gt:
                warnings.append(f"_ground_truth.{opt} missing")
    elif gt is not None:
        errors.append("_ground_truth must be an object")

    pos = data.get("pos")
    if "pos" in data and (isinstance(pos, bool) or not isinstance(pos, int) or pos <= 0):
        errors.append(f"pos must be a positive integer, got {pos!r}")
    chrom = data.get("chrom")
    if "chrom" in data and (not isinstance(chrom, str) or not chrom):
        errors.append(f"chrom must be a non-empty string, got {chrom!r}")
    for key in ("ref", "alt"):
        if key in data and (not isinstance(data[key], str) or data[key] == ""):
            errors.append(f"{key} must be a non-empty string, got {data[key]!r}")

    gnomad = data.get("gnomad")
    if "gnomad" in data and not isinstance(gnomad, dict):
        errors.append("gnomad must be an object")
    elif isinstance(gnomad, dict):
        for key in REQUIRED_GNOMAD_KEYS:
            if key not in gnomad:
                errors.append(f"gnomad missing required key: {key}")
        if gnomad.get("af_popmax") is None and "note" not in gnomad:
            warnings.append("gnomad.af_popmax is None but no gnomad.note")

    insilico = data.get("insilico")
    if "insilico" in data and not isinstance(insilico, dict):
        errors.append("insilico must be an object")
    elif isinstance(insilico, dict) and "note" not in insilico:
        none_preds = [p for p in INSILICO_PREDICTORS if insilico.get(p) is None]
        if none_preds:
            warnings.append(f"insilico predictor(s) {none_preds} is None but no insilico.note")

    lit = data.get("literature")
    if "literature" in data and not isinstance(lit, list):
        errors.append("literature must be a list")
    elif isinstance(lit, list) and not lit:
        warnings.append("literature is empty list")

    if "_difficulty" not in data:
        warnings.append("_difficulty field missing")

    gene, hgvs_c = data.get("gene"), data.get("hgvs_c")
    if gene in GENE_TRANSCRIPT and isinstance(hgvs_c, str):
        prefix = GENE_TRANSCRIPT[gene]
        if not hgvs_c.startswith(prefix):
            warnings.append(f"hgvs_c {hgvs_c!r} does not start with expected {prefix} for {gene}")

    if data.get("consequence") == "missense_variant" and data.get("hgvs_p") is None:
        warnings.append("consequence is missense_variant but hgvs_p is None")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    repo_root = Path(__file__).resolve().parent.parent
    default_dir = repo_root / "data" / "fixtures"
    parser.add_argument("--dir", type=Path, default=default_dir, help="fixtures directory")
    parser.add_argument("--strict", action="store_true", help="promote warnings to errors")
    args = parser.parse_args()

    if not args.dir.is_dir():
        print(f"ERROR: fixtures dir not found: {args.dir}", file=sys.stderr)
        return 1

    fixtures = sorted(args.dir.glob("*.json"))
    if not fixtures:
        print(f"ERROR: no *.json fixtures in {args.dir}", file=sys.stderr)
        return 1

    name_w = max(50, max(len(p.name) for p in fixtures) + 2)
    header = f"{'FILE'.ljust(name_w)}{'STATUS'.ljust(9)}{'ERR'.rjust(5)}{'WARN'.rjust(6)}"
    print(header)
    print("=" * len(header))

    results: list[tuple[Path, list[str], list[str], str]] = []
    ok = warn = fail = 0
    for path in fixtures:
        errors, warnings = validate_fixture(path)
        promoted_fail = bool(errors) or (args.strict and bool(warnings))
        if promoted_fail:
            status = "FAIL"
            fail += 1
        elif warnings:
            status = "WARN"
            warn += 1
        else:
            status = "OK"
            ok += 1
        results.append((path, errors, warnings, status))
        print(
            f"{path.name.ljust(name_w)}{status.ljust(9)}"
            f"{str(len(errors)).rjust(5)}{str(len(warnings)).rjust(6)}"
        )

    # Detail lines per file with issues.
    detail_files = [r for r in results if r[1] or r[2]]
    if detail_files:
        print()
        for path, errors, warnings, _status in detail_files:
            print(path.name)
            for msg in errors:
                print(f"  ERR:  {msg}")
            for msg in warnings:
                print(f"  WARN: {msg}")

    total = len(fixtures)
    print()
    print(f"Validated {total} fixtures: {ok} OK, {warn} WARN, {fail} FAIL")

    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
