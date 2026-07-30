"""Project national SC/ST population for years between/after the two most
recent censuses, for use as the denominator in rate-per-lakh-population
calculations.

India last held a census in 2011 (the 2021 round was postponed and has not
happened as of this writing). Rather than use a flat 2011 population figure
for crime years through 2022 -- which would understate the true denominator
and overstate rates in later years -- we derive a compound annual growth
rate (CAGR) from the measured 2001 and 2011 SC/ST populations
(data/reference/sc_st_census_population.json) and extrapolate forward.

This is a MODELED ESTIMATE, not measured data. Output is flagged as such
(`is_projected: true` on every row except 2011 itself) so the frontend can
render it with a visibly different caveat from actual census figures.

Each row also carries `sc_pct`/`st_pct` -- SC/ST's projected SHARE of the
total population that year, using the UN total-population series in the
reference file as the denominator (a different source from the Census-anchored
SC/ST counts -- see the reference file's own note on why that's an acceptable
denominator swap and what the ~4% base-year discrepancy is). No equivalent
share is computed for OBC/General: see `obc_general_note` in the reference
file for why that projection isn't possible the way SC/ST's is.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REFERENCE_FILE = ROOT / "data" / "reference" / "sc_st_census_population.json"
OUTPUT_FILE = ROOT / "data" / "processed" / "population_projected.json"

PROJECT_THROUGH_YEAR = 2026


def compute_cagr(pop_start: float, pop_end: float, years: int) -> float:
    return (pop_end / pop_start) ** (1 / years) - 1


def build_projection() -> list[dict]:
    reference = json.loads(REFERENCE_FILE.read_text())
    anchors = {a["year"]: a for a in reference["anchors"]}
    y0, y1 = sorted(anchors)
    n_years = y1 - y0
    total_population_by_year = reference["total_population_by_year"]["values"]

    sc_cagr = compute_cagr(anchors[y0]["sc_population"], anchors[y1]["sc_population"], n_years)
    st_cagr = compute_cagr(anchors[y0]["st_population"], anchors[y1]["st_population"], n_years)

    rows = []
    for year in range(y1, PROJECT_THROUGH_YEAR + 1):
        n = year - y1
        sc_population = round(anchors[y1]["sc_population"] * (1 + sc_cagr) ** n)
        st_population = round(anchors[y1]["st_population"] * (1 + st_cagr) ** n)
        total_population = total_population_by_year.get(str(year))

        rows.append(
            {
                "year": year,
                "sc_population": sc_population,
                "st_population": st_population,
                "sc_pct": round(sc_population / total_population * 100, 2) if total_population else None,
                "st_pct": round(st_population / total_population * 100, 2) if total_population else None,
                "is_projected": year != y1,
                "method": "flat" if year == y1 else f"CAGR extrapolated from {y0}-{y1} census growth rate",
            }
        )
    return rows


if __name__ == "__main__":
    rows = build_projection()
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(rows, indent=2))
    print(f"Wrote {len(rows)} years of population projection to {OUTPUT_FILE}")
    for r in rows:
        print(r)
