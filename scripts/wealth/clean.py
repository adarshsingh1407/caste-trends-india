"""Transform the transcribed AIDIS data into the frontend's static JSON.

This is the land/asset/debt-by-caste data the project brief called for as a
genuine wealth metric, distinct from the MPCE consumption track
(scripts/consumption/) and from enrollment/employment share. See
/docs/data-sources.md and data/raw/wealth/aidis_transcribed.json for the
scope note: asset holdings by social group are a single 2019 snapshot (the
prior round's summary report doesn't break assets down by social group),
while debt (IOI/AOD) has a genuine 2012-13 to 2019 trend.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "wealth"
OUTPUT_FILE = ROOT / "frontend" / "public" / "data" / "wealth" / "aidis.json"


def main() -> None:
    raw = json.loads((RAW_DIR / "aidis_transcribed.json").read_text())
    output = {
        "scope_note": raw["scope_note"],
        "sources": raw["sources"],
        "assets_2019_rs": raw["assets_2019_rs"],
        "debt_by_year": raw["debt_by_year"],
        "debt_asset_ratio_2019_pct": raw["debt_asset_ratio_2019_pct"],
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"Wrote AIDIS data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
