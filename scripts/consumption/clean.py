"""Transform the transcribed HCES/NSS consumption expenditure data into the
frontend's static JSON.

This is the "financial upliftment" proxy the project brief explicitly said
was missing from enrollment/employment share metrics -- consumption
expenditure (MPCE) by social group, not a proxy derived from education or
employment data. See /docs/data-sources.md and
data/raw/consumption/hces_transcribed.json for the critical caveat: there is
an 11-year gap in official data (2011-12 to 2022-23) because the 2017-18
survey was conducted but never released, and the 2022-23 round used a
revised methodology not strictly comparable to earlier rounds.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "consumption"
OUTPUT_FILE = ROOT / "frontend" / "public" / "data" / "consumption" / "mpce_by_social_group.json"


def main() -> None:
    raw = json.loads((RAW_DIR / "hces_transcribed.json").read_text())
    output = {
        "critical_caveat": raw["critical_caveat"],
        "sources": raw["sources"],
        "absolute_mpce_rs": raw["absolute_mpce_rs"],
        "pct_gap_from_average": raw["pct_gap_from_average"],
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"Wrote consumption expenditure data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
