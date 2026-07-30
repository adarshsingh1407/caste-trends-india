"""Transform the transcribed Lok Sabha SC/ST reserved-seat data into the
frontend's static JSON.

This is a structural entitlement (seats reserved under Article 330), not an
annually-measured trend -- it only changes at delimitation events, which are
infrequent (the current allocation has been frozen since 2008, itself only
the second change since 1976). See /docs/data-sources.md for the two
confirmed dead ends this dataset does NOT cover: Rajya Sabha (no SC/ST
reservation exists there) and OBC (no parliamentary reservation exists for
OBC at any level -- only local bodies).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "parliament"
OUTPUT_DIR = ROOT / "frontend" / "public" / "data" / "parliament"


def build_output() -> dict:
    raw = json.loads((RAW_DIR / "lok_sabha_reserved_seats.json").read_text())
    eras = []
    for era in raw["delimitation_eras"]:
        eras.append(
            {
                **era,
                "sc_pct_of_seats": round(era["sc_reserved_seats"] / era["total_seats"] * 100, 2),
                "st_pct_of_seats": round(era["st_reserved_seats"] / era["total_seats"] * 100, 2),
            }
        )
    return {"scope_notes": raw["scope_notes"], "delimitation_eras": eras}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output = build_output()
    (OUTPUT_DIR / "lok_sabha_reserved_seats.json").write_text(json.dumps(output, indent=2))
    print(f"Wrote Lok Sabha data to {OUTPUT_DIR / 'lok_sabha_reserved_seats.json'}")


if __name__ == "__main__":
    main()
