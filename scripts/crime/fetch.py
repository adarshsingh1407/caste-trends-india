"""Download raw NCRB SC/ST crime CSVs from India Data Portal (indiadataportal.com).

No API key or login required: each resource page embeds a direct link to the
underlying CKAN backend (ckan.indiadataportal.com), which serves the CSV over
a plain HTTP GET. Verified manually before writing this script — see
/docs/data-sources.md for how these URLs were found and what they cover
(district-level, 2016 and 2017-2022; no earlier/later years without a
data.gov.in API key or dataful.in account, which this pipeline deliberately
does not depend on).
"""

import requests
from pathlib import Path

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "crime"

# Confirmed working CKAN download URLs (resolved from indiadataportal.com resource pages).
SOURCES = {
    "sc_2016.csv": "https://ckan.indiadataportal.com/dataset/337e5912-8e35-4520-9359-093262c0c1d9/resource/dfcda5ca-cd1f-4eb9-a3e0-f855a757ae02/download/districtwise-crimes-against-sc-2016.csv",
    "sc_2017_onwards.csv": "https://ckan.indiadataportal.com/dataset/337e5912-8e35-4520-9359-093262c0c1d9/resource/3c76cceb-7daa-4976-8453-ba5bba42a7dd/download/districtwise-crimes-against-sc-2017-onwards.csv",
    "st_2016.csv": "https://ckan.indiadataportal.com/dataset/337e5912-8e35-4520-9359-093262c0c1d9/resource/8807f75e-c958-4713-a738-a7e556b2cb2c/download/districtwise-crime-against-sts-2016.csv",
    "st_2017_onwards.csv": "https://ckan.indiadataportal.com/dataset/337e5912-8e35-4520-9359-093262c0c1d9/resource/53f19dd8-e354-43ed-8e45-934662dd2541/download/districtwise-crime-against-sts-2017-onwards.csv",
}

HEADERS = {"User-Agent": "Mozilla/5.0"}


def fetch_all() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    for filename, url in SOURCES.items():
        dest = RAW_DIR / filename
        print(f"Fetching {url} -> {dest}")
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        dest.write_bytes(response.content)
        print(f"  wrote {len(response.content):,} bytes")


if __name__ == "__main__":
    fetch_all()
