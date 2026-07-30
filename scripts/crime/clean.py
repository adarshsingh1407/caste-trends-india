"""Clean and aggregate raw NCRB SC/ST district-level crime CSVs into a tidy,
national-level yearly series for the dashboard.

Scope decisions (see /docs/data-sources.md for the full rationale):
- SC + ST only. No OBC crime category exists anywhere (no PoA-Act equivalent).
- National totals only for v1 (district/state fields are dropped after
  aggregation here, not because they don't exist in the raw data, but because
  state/UT drill-down is an explicit later phase).
- No city-tier breakdown: NCRB itself states it does not produce a city-wise
  SC/ST crime table.

Each source file's columns are a distinct set of crime-head categories (the
raw schema itself changes shape in 2017, reflecting the 2018 SC/ST PoA Act
amendment broadening legal definitions -- see docs/data-sources.md). Rather than
force these differently-shaped category sets into one artificial mapping
across years, `total_cases` is computed as the sum of every crime-head column
present in that year's source file, which is how NCRB's own tables total a
year's cases. This is safe and non-double-counting because each source file's
non-identifier columns are itself a flat list of distinct offence heads (no
column is itself a subtotal of the others) -- confirmed by summing to
year-totals that match publicly reported NCRB figures before writing this
script.
"""

import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw" / "crime"
PROCESSED_DIR = ROOT / "data" / "processed"
OUTPUT_FILE = ROOT / "frontend" / "public" / "data" / "crime" / "sc_st_crime_national.json"
POPULATION_FILE = PROCESSED_DIR / "population_projected.json"

ID_COLUMNS = [
    "id",
    "year",
    "state_name",
    "state_code",
    "district_name",
    "district_code",
    "registration_circles",
]

# Files that make up each category's time series, in year order.
# The "2016" and "2017 onwards" resources are separate downloads (see
# scripts/crime/fetch.py) with different column sets -- see module docstring.
CATEGORY_FILES = {
    "SC": ["sc_2016.csv", "sc_2017_onwards.csv"],
    "ST": ["st_2016.csv", "st_2017_onwards.csv"],
}

# The raw source's own crime-head category set changes shape starting 2017,
# coinciding with the SC/ST PoA Act's 2018 amendment broadening legal
# definitions. Charted as an annotated break, not a silent continuous trend.
SCHEMA_BREAK_YEAR = 2017


def national_totals_by_year(filename: str) -> pd.DataFrame:
    df = pd.read_csv(RAW_DIR / filename)
    crime_columns = [c for c in df.columns if c not in ID_COLUMNS]
    return df.groupby("year")[crime_columns].sum().sum(axis=1).rename("total_cases").reset_index()


def build_category_series(category: str) -> pd.DataFrame:
    frames = [national_totals_by_year(f) for f in CATEGORY_FILES[category]]
    combined = pd.concat(frames, ignore_index=True).sort_values("year")
    combined["category"] = category
    return combined


def load_population() -> dict[int, dict]:
    rows = json.loads(POPULATION_FILE.read_text())
    return {r["year"]: r for r in rows}


def main() -> None:
    population = load_population()
    all_rows = []

    for category in CATEGORY_FILES:
        series = build_category_series(category)
        pop_key = "sc_population" if category == "SC" else "st_population"

        for _, row in series.iterrows():
            year = int(row["year"])
            pop_row = population.get(year)
            pop = pop_row[pop_key] if pop_row else None
            rate_per_lakh = round(row["total_cases"] / pop * 100_000, 2) if pop else None

            all_rows.append(
                {
                    "category": category,
                    "year": year,
                    "total_cases": int(row["total_cases"]),
                    "population": pop,
                    "population_is_projected": pop_row["is_projected"] if pop_row else None,
                    "rate_per_lakh_population": rate_per_lakh,
                    "schema_era": "pre_2017_definitions" if year < SCHEMA_BREAK_YEAR else "post_2017_definitions",
                }
            )

    all_rows.sort(key=lambda r: (r["category"], r["year"]))

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(all_rows, indent=2))
    print(f"Wrote {len(all_rows)} rows to {OUTPUT_FILE}")
    for r in all_rows:
        print(r)


if __name__ == "__main__":
    main()
