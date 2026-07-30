"""Transform the transcribed IHDS-II untouchability-practice data into the
frontend's static JSON.

This is the "soft"/everyday-discrimination track, distinct from the
registered-crime data in scripts/crime/ -- it measures self-reported practice
of untouchability (the perpetrator side), not registered legal cases. See
/docs/data-sources.md and
data/raw/attitudes/ihds_untouchability_transcribed.json for the full
methodology note on why this was sourced from a nationally representative
survey rather than by scraping news/forums.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "attitudes"
OUTPUT_FILE = ROOT / "frontend" / "public" / "data" / "attitudes" / "ihds_untouchability.json"


def main() -> None:
    raw = json.loads((RAW_DIR / "ihds_untouchability_transcribed.json").read_text())
    output = {
        "methodology_note": raw["methodology_note"],
        "source": raw["source"],
        "table1_practice_by_social_group": raw["table1_practice_by_social_group"],
        "table2_specific_practice": raw["table2_specific_practice"],
        "rural_urban": raw["rural_urban"],
        "income_quintile": raw["income_quintile"],
        "regional": raw["regional"],
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"Wrote untouchability-practice data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
