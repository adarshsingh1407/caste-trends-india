"""Transform transcribed academic-study wealth-concentration data into frontend JSON.

Answers a natural follow-up to the AIDIS wealth page: is the caste wealth gap
narrowing over time? This dashboard's own AIDIS data (aidis.json) is a single
2019 snapshot and can't say. This instead transcribes a genuinely multi-round
series from an external academic study (Bharti 2018, NSS-AIDIS
1991/2002/2012) so the trend can actually be plotted. See
data/raw/wealth/academic_studies_transcribed.json and
docs/data-sources.md (section 1c) for the second corroborating study
(Anand 2023) that is cited but not charted, since its numbers exist only as
a chart image, not a data table.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "wealth"
OUTPUT_FILE = ROOT / "frontend" / "public" / "data" / "wealth" / "academic_wealth_concentration.json"


def main() -> None:
    raw = json.loads((RAW_DIR / "academic_studies_transcribed.json").read_text())
    output = {
        "wealth_concentration_gap": raw["wealth_concentration_gap"],
        "corroborating_study_not_charted": raw["corroborating_study_not_charted"],
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"Wrote academic wealth-concentration data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
