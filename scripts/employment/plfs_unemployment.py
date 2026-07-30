"""Transform manually-transcribed PLFS unemployment-rate data into the frontend's
static JSON file. Source is data/raw/employment/plfs_unemployment_transcribed.json
(hand-transcribed from three official PLFS Annual Report PDFs -- see /docs/data-sources.md).
This script does not parse PDFs itself; it reshapes the already-verified transcribed
values, unchanged, into the shape the frontend expects.

population_by_sector comes from data/reference/population_by_sector_2017_18.json, a
shared reference file also used by scripts/wealth/clean.py -- same underlying PLFS
table, not re-transcribed per topic.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_FILE = ROOT / "data" / "raw" / "employment" / "plfs_unemployment_transcribed.json"
POPULATION_BY_SECTOR_FILE = ROOT / "data" / "reference" / "population_by_sector_2017_18.json"
OUTPUT_DIR = ROOT / "frontend" / "public" / "data" / "employment"


def main() -> None:
    raw = json.loads(RAW_FILE.read_text())
    population_by_sector = json.loads(POPULATION_BY_SECTOR_FILE.read_text())

    output = {
        "description": raw["description"],
        "scope_note": raw["scope_note"],
        "methodology_note": raw["methodology_note"],
        "data_integrity_note": raw["data_integrity_note"],
        "population_by_sector": {**population_by_sector, "note": raw["population_by_sector_note"]},
        "lfpr_wpr_2023_24": raw["lfpr_wpr_2023_24"],
        "years": raw["years"],
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "plfs_unemployment.json").write_text(json.dumps(output, indent=2))
    print(f"Wrote {len(output['years'])} years of PLFS unemployment data to {OUTPUT_DIR / 'plfs_unemployment.json'}")


if __name__ == "__main__":
    main()
