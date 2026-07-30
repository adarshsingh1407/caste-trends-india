# Crime, Atrocity & Representation Trends — SC / ST / OBC (India)

A static, local-first dashboard tracking several separate evidence tracks for SC/ST (and OBC where data allows) in India:

1. **Protection rationale** — crime/atrocity trends (SC + ST only; no OBC crime category exists) and everyday/"soft" discrimination (self-reported practice of untouchability).
2. **Representation rationale** — education enrollment (AISHE), central government employment (DoPT), and Lok Sabha reserved seats (Article 330).
3. **Financial strength** — consumption expenditure (MPCE) and land/asset/debt holdings (AIDIS) by social group.

These are kept deliberately separate and are never combined into one "index" or blended score — see [`docs/data-sources.md`](docs/data-sources.md) for the full findings on every source, and the in-app "About this data" panel for every caveat.

## Architecture

A Python pipeline (`scripts/`) fetches/transcribes raw government data into static JSON (`frontend/public/data/`). The React frontend (`frontend/`) reads those JSON files directly — no backend, deployable as a static site.

```
/data/raw/                # untouched downloaded/transcribed source files
/data/processed/          # intermediate cleaned outputs (e.g. population projection)
/data/reference/          # fixed reference constants (census population anchors)
/scripts/crime/           # fetch + clean NCRB SC/ST crime data
/scripts/attitudes/       # clean transcribed IHDS-II untouchability-practice data
/scripts/representation/  # clean transcribed AISHE + DoPT data
/scripts/parliament/      # clean transcribed Lok Sabha reserved-seat data
/scripts/consumption/     # clean transcribed NSS/HCES consumption expenditure data
/scripts/wealth/          # clean transcribed AIDIS land/asset/debt data
/scripts/common/          # shared population projection logic
/frontend/                # React (Vite + TypeScript + Recharts) static app
/docs/data-sources.md     # full findings log: what's usable, exact URLs/citations, dead ends
```

## Running the pipeline

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/common/population_projection.py
.venv/bin/python scripts/crime/fetch.py
.venv/bin/python scripts/crime/clean.py
.venv/bin/python scripts/attitudes/clean.py
.venv/bin/python scripts/representation/clean.py
.venv/bin/python scripts/parliament/clean.py
.venv/bin/python scripts/consumption/clean.py
.venv/bin/python scripts/wealth/clean.py
```

This regenerates everything under `frontend/public/data/`.

## Running the frontend

Node version is pinned via `frontend/.nvmrc` (24.18.1):

```bash
cd frontend
nvm use
npm install
npm run dev      # dev server
npm run build    # production build to frontend/dist/
```

## Deployment

Pushing to `main` builds and deploys `frontend/` to GitHub Pages automatically via `.github/workflows/deploy.yml` (requires Pages enabled in repo Settings → Pages → Source: "GitHub Actions"). The app uses `HashRouter` and relative data fetches so it works unmodified under a project-page subpath; `frontend/vite.config.ts`'s `base` is set to match this repo's name.

## Current scope (v1)

- **Crime:** SC + ST, national totals, 2016–2022 (see `docs/data-sources.md` for why not further back/forward without a personal API key).
- **Everyday Discrimination:** self-reported practice of untouchability by social group (IHDS-II, 2011-12) — a single snapshot, deliberately not sourced by scraping news/forums (see `docs/data-sources.md` for why that method was rejected).
- **Representation:** AISHE GER trend 2014-15/2019-20–2023-24; DoPT employment 2016/2021/2024 (2021 is a confirmed low-coverage year, flagged in the UI).
- **Parliament:** Lok Sabha SC/ST reserved-seat allocation (Article 330) across the two most recent delimitation eras — a structural entitlement, not an annual series.
- **Income & Consumption:** MPCE by social group, 2004-05/2009-10/2011-12/2022-23 (NSS/HCES) — the financial-strength proxy the crime/education/employment tracks explicitly aren't. There's an 11-year official-data gap (2011-12 to 2022-23) since the 2017-18 survey was withdrawn, and a methodology change across that gap — both flagged in the UI.
- **Land, Assets & Debt:** AIDIS asset value (2019 snapshot) and debt incidence/amount (2012-13 vs. 2019) by social group — the actual wealth/land-ownership metric. ST/SC households hold roughly a third the asset value of "Others"; low ST debt is flagged as likely credit exclusion, not financial health, given the asset gap.
- **Geography:** national only — state/UT drill-down is a planned later phase (schema already retains the fields needed for it).
- **Not included:** OBC crime data, city-tier crime breakdown, EWS representation data, SECC 2011 caste data — all confirmed dead ends, documented in `docs/data-sources.md` rather than left as silent gaps.
