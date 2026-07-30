"""Transform the transcribed conviction/disposal data into the frontend's
static JSON.

Source is a Rajya Sabha Unstarred Question reply (MHA), not the district-level
NCRB CSVs used by clean.py -- see data/raw/crime/conviction_disposal_transcribed.json
and /docs/data-sources.md for why these are kept as two separate outputs
rather than merged (different official compilation, though they cross-validate
closely for overlapping years).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "crime"
OUTPUT_FILE = ROOT / "frontend" / "public" / "data" / "crime" / "sc_st_conviction_disposal.json"


def with_chargesheet_rate(row: dict) -> dict:
    """Chargesheet rate isn't in the source table directly -- derived here
    (cases_chargesheeted / cases_registered) since it's a natural companion
    to the source's own conviction_rate_pct."""
    return {
        **row,
        "chargesheet_rate_pct": round(row["cases_chargesheeted"] / row["cases_registered"] * 100, 1),
    }


def main() -> None:
    raw = json.loads((RAW_DIR / "conviction_disposal_transcribed.json").read_text())
    output = {
        "source": raw["source_document"],
        "field_definitions": raw["field_definitions"],
        "sc": [with_chargesheet_rate(r) for r in raw["sc"]],
        "st": [with_chargesheet_rate(r) for r in raw["st"]],
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"Wrote conviction/disposal data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
