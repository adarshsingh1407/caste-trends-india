"""Transform manually-transcribed AISHE and DoPT source data into the
frontend's static JSON files.

Both source files (data/raw/representation/*_transcribed.json) were
transcribed by hand from PDF reports -- there is no clean CSV/API for either
(see /docs/data-sources.md). This script does not scrape or parse PDFs itself;
it reshapes the already-verified transcribed values and adds derived flags
the frontend needs (coverage-gap marking, tapering deltas), while keeping
AISHE (education) and DoPT (employment) as two separate output files. They
are never merged into one "representation index" -- see the project brief's
explicit warning against blending enrollment and employment into a single
number.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "representation"
OUTPUT_DIR = ROOT / "frontend" / "public" / "data" / "representation"
POPULATION_PROJECTED_FILE = ROOT / "data" / "processed" / "population_projected.json"

POPULATION_SHARE_NOTE = (
    "SC/ST share of total population, projected for this specific year (compound growth rate "
    "extrapolated from the 2001/2011 censuses, against a UN total-population estimate for the "
    "denominator -- see scripts/common/population_projection.py). Not held flat at the 2011 figure. "
    "No equivalent OBC/General share exists: India's census hasn't enumerated caste beyond SC/ST "
    "since 1931, so there's no recent anchor to project from -- only two old, methodologically "
    "different guesses (Mandal Commission ~52%, NSSO ~41%), not a projectable trend."
)


def load_population_share(year: int) -> dict:
    """SC/ST population share for a SPECIFIC year, reusing the crime pipeline's
    population projection (scripts/common/population_projection.py) rather than
    a flat constant. Falls back to the nearest available year if the exact year
    isn't in the projected series (e.g. AISHE's fiscal-year labels)."""
    rows = {r["year"]: r for r in json.loads(POPULATION_PROJECTED_FILE.read_text())}
    if year not in rows:
        year = min(rows, key=lambda y: abs(y - year))
    row = rows[year]
    return {"sc_pct": row["sc_pct"], "st_pct": row["st_pct"], "year": row["year"], "note": POPULATION_SHARE_NOTE}

# DoPT ministries-reporting counts below this are flagged as a coverage gap,
# i.e. not comparable to a full-coverage year. 2016 (78) and 2024 (80) are
# full coverage; 2021 (72 ministries, ~18.8 lakh of ~32.5 lakh employees) is not.
FULL_COVERAGE_MINISTRIES_THRESHOLD = 75


def with_general_category(group_stats: dict) -> dict:
    """DoPT's own table only reports SC/ST/OBC counts per group -- General
    (unreserved) is not a tracked quota category, so it's derived here as the
    residual, not transcribed. This also silently includes EWS, since EWS is
    a sub-quota carved out of the General category and DoPT does not report
    it separately (see /docs/data-sources.md) -- labelled as such in the UI.
    """
    general = group_stats["total"] - group_stats["sc"] - group_stats["st"] - group_stats["obc"]
    return {
        **group_stats,
        "general": general,
        "general_pct": round(general / group_stats["total"] * 100, 2),
    }


def build_dopt_output() -> list[dict]:
    raw = json.loads((RAW_DIR / "dopt_transcribed.json").read_text())
    rows = []
    for year_entry in raw["years"]:
        year = year_entry["year"]
        source_meta = raw["source_documents"][str(year)]
        ministries = source_meta["ministries_reporting"]
        is_coverage_gap = ministries < FULL_COVERAGE_MINISTRIES_THRESHOLD

        rows.append(
            {
                "year": year,
                "data_as_on": source_meta["data_as_on"],
                "ministries_reporting": ministries,
                "coverage_gap": is_coverage_gap,
                "groups": {group: with_general_category(stats) for group, stats in year_entry["groups"].items()},
                "statutory_quotas": raw["statutory_quotas"],
                "population_share": load_population_share(year),
            }
        )

    return sorted(rows, key=lambda r: r["year"])


def build_aishe_output() -> dict:
    raw = json.loads((RAW_DIR / "aishe_transcribed.json").read_text())
    latest = raw["enrollment_share_latest"]

    # AISHE reports SC/ST/OBC share directly but never states a General/Other
    # share -- derived here as the residual against total enrollment, which
    # the report does state explicitly ("4.50 crore" in the Executive Summary).
    total_lakh = latest["total_enrollment_crore"] * 100
    general_count_lakh = round(total_lakh - latest["sc_count_lakh"] - latest["st_count_lakh"] - latest["obc_count_crore"] * 100, 2)
    general_pct = round(general_count_lakh / total_lakh * 100, 1)

    # AISHE years are fiscal-year labels ("2023-24") -- use the second half as the
    # calendar-year lookup key for the population projection.
    latest_calendar_year = int(latest["year"].split("-")[0]) + 1

    enrollment_share_latest = {
        **latest,
        "general_pct_of_total": general_pct,
        "general_count_lakh": general_count_lakh,
        "population_share": load_population_share(latest_calendar_year),
    }

    return {
        "ger_trend": raw["ger_trend"],
        "enrollment_share_latest": enrollment_share_latest,
        "enrollment_prior_year": raw["enrollment_prior_year"],
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    dopt_output = build_dopt_output()
    (OUTPUT_DIR / "dopt_employment.json").write_text(json.dumps(dopt_output, indent=2))
    print(f"Wrote {len(dopt_output)} DoPT years to {OUTPUT_DIR / 'dopt_employment.json'}")

    aishe_output = build_aishe_output()
    (OUTPUT_DIR / "aishe_education.json").write_text(json.dumps(aishe_output, indent=2))
    print(f"Wrote AISHE data to {OUTPUT_DIR / 'aishe_education.json'}")


if __name__ == "__main__":
    main()
