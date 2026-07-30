# Data Sources — Findings Log

This is the durable record of what was actually verified about every data source for this project, kept separate from code so it survives across sessions. It supersedes the original Phase 0 research pass wherever the two disagree — everything below was checked by actually attempting a download or reading the primary PDF directly, not inferred from secondary sources.

Cross-reference: `/data/raw/` holds the actual downloaded/transcribed files this document describes; the Python scripts under `/scripts/` that consume them cite specific sections of this doc in their module docstrings.

---

## 1. Crime data — SC/ST (NCRB)

### Scope decisions (dead ends, confirmed)
- **No city-tier breakdown exists.** NCRB's own *Crime in India 2022* report states it does not produce a city-wise breakdown for the SC/ST crime category (the general 19–53 metro city tables are for other crime categories only). No state police/home department was found publishing this either. The only near-miss — NCRB *district*-level data happening to resolve to city level for single-district metros (Mumbai City, Bengaluru Urban) — is an accident of administrative geography, not a real city-tier variable, and was not used.
- **No OBC crime category exists.** There is no Prevention-of-Atrocities-Act equivalent for OBCs, and no government body (NCRB, state home departments, Parliamentary Q&A replies) compiles OBC-specific crime data. Crime track is scoped to **SC + ST only**.

### What's actually usable, and where
Three candidate sources were checked by attempting real downloads, not just reading about them:

| Source | Result |
|---|---|
| **dataful.in** (claimed 2001–2023 consolidated CSV) | **Login-gated.** Page shows an auth modal; no direct file link is exposed anywhere in the page source. Not usable without creating an account. |
| **data.gov.in** (Open Government Data Platform) | **API-key-gated.** The site requires a free, self-registered API key via `api.data.gov.in` (confirmed: page renders a login/API-key modal, Janparichay SSO). Registration is free (~2 min) but is a manual step tied to a personal account — not something this pipeline can do on its own. |
| **indiadataportal.com** | **Confirmed working, no login.** Each resource page is a Next.js app that embeds a direct link to the underlying CKAN backend, e.g. `https://ckan.indiadataportal.com/dataset/<id>/resource/<id>/download/<file>.csv`. These URLs were extracted from the page's embedded `__NEXT_DATA__` JSON and downloaded directly with a plain `curl`/`requests.get()` — no auth needed. **This is the pipeline's actual source.** |

### Exact URLs in use (see `scripts/crime/fetch.py`)
```
sc_2016.csv            https://ckan.indiadataportal.com/dataset/337e5912-.../resource/dfcda5ca-.../download/districtwise-crimes-against-sc-2016.csv
sc_2017_onwards.csv    https://ckan.indiadataportal.com/dataset/337e5912-.../resource/3c76cceb-.../download/districtwise-crimes-against-sc-2017-onwards.csv
st_2016.csv            https://ckan.indiadataportal.com/dataset/337e5912-.../resource/8807f75e-.../download/districtwise-crime-against-sts-2016.csv
st_2017_onwards.csv    https://ckan.indiadataportal.com/dataset/337e5912-.../resource/53f19dd8-.../download/districtwise-crime-against-sts-2017-onwards.csv
```
(Full UUIDs are in `scripts/crime/fetch.py` — omitted here for brevity, not because they're secret.)

### Coverage and schema
- **Years covered: 2016–2022** (district-level), aggregated to national totals for v1. This is narrower than the "2001–2023" figure from the initial research pass — that fuller range lives behind dataful.in's login wall. Extending back to 2001 or forward to 2023 is a documented, optional future step (needs a free data.gov.in API key or a dataful.in account), not a v1 blocker.
- **The raw schema itself changes shape starting 2017**: the 2016 file has 15 crime-head columns (murder, rape, kidnapping/abduction, dacoity, robbery, arson, grievous hurt, riots, PCR Act, SC/ST PoA Act, other IPC crimes — this is essentially NCRB's classic crime-head table structure). The 2017-onwards file has 38 columns, reflecting the finer-grained offense categories introduced by the 2018 SC/ST PoA Act amendment (acid attack, POCSO-adjacent categories, stalking, voyeurism, etc. all broken out separately). **This is charted as an annotated trend-break at 2017/2018, not smoothed into one continuous category series.**
- **`total_cases` is computed as the sum of every crime-head column in that year's file.** This is safe (no double-counting) because each file's non-identifier columns are a flat list of distinct offence heads — verified by checking that the resulting national yearly totals match the SC/ST crime figures NCRB itself has publicly reported for these years (e.g. ~50,900 SC cases in 2021, ~8,846 ST cases in 2021) before writing the cleaning script.

### Population denominator (for rate-per-lakh)
- India has not held a census since 2011 (2021 round postponed indefinitely). Using a flat 2011 population figure for 2016–2022 crime rates would understate the true denominator in later years.
- **Methodology:** derived a compound annual growth rate (CAGR) from the two most recent measured census points (2001 and 2011), then extrapolated forward year by year. See `data/reference/sc_st_census_population.json` (the two raw anchor points) and `scripts/common/population_projection.py` (the projection logic).
- **Anchor figures used** (verified via web search, cross-checked against the independently-known "SC grew 20.8% 2001–2011" figure, which the computed CAGR reproduces exactly):
  - SC: 166,635,700 (2001) → 201,378,086 (2011) → CAGR 1.912%/yr
  - ST: 84,326,240 (2001) → 104,281,034 (2011) → CAGR 2.147%/yr
- Every projected-year row in the output is flagged `population_is_projected: true` (only the 2011 anchor itself is `false`), so the frontend can visually distinguish a modeled estimate from measured census data.

---

## 2. Representation data — AISHE (education) and DoPT (employment)

Both are **PDF-only** — no clean CSV/API exists for either (an earlier research pass suggested AISHE had Excel tables available; checking the actual `aishe.gov.in` homepage download links directly showed PDF only, so this was corrected before building the pipeline). Both were extracted by directly reading/parsing the primary-source PDF, not by trusting a secondary summary.

### AISHE (higher education enrollment)
- **Source:** AISHE Final Report 2023-24, downloaded directly from the government CDN, no login: `https://cdnbbsr.s3waas.gov.in/s392049debbe566ca5782a3045cf300a3c/uploads/2026/07/202607131602421770.pdf`
- **GER (Gross Enrolment Ratio) trend, 2019-20 through 2023-24, for All/SC/ST categories**, reconstructed from Figure 64 (page ~60): pdfplumber's raw text extraction returns chart data-labels in a jumbled, non-chronological order (charts render text at arbitrary (x,y) positions). The actual values were recovered by extracting each number's `(x0, top)` word position and sorting by x-coordinate within the chart's plot area (excluding y-axis labels at a fixed x0), which groups the 15 data-labels into three clean clusters of 5 (All / SC / ST) in chronological left-to-right order. **Cross-validated**: the reconstructed 2019-20, 2022-23, and 2023-24 values for every category match the report's own prose sentences exactly (e.g. "GER for SC-Category has increased to 27.8 in 2023-24 from 27.3 in 2022-23 and 22.3 in 2019-20" — matches the reconstructed series exactly).
- **2014-15 anchor point** for each category comes directly from prose (e.g. "Since 2014-15, SC GER has increased by 8.9 points from 18.9").
- **No OBC GER series is published** in this report — only All/SC/ST. Enrollment *share* (not GER) is available for OBC as a latest-year snapshot only.
- Full transcribed values, with page/figure citations: `data/raw/representation/aishe_transcribed.json`.
- **General/Other category is derived, not transcribed.** AISHE states SC/ST/OBC share directly but never a General share. `scripts/representation/clean.py` computes it as the residual against total enrollment (`4.50 crore`, transcribed from the Executive Summary, page ~21) and outputs `general_pct_of_total` / `general_count_lakh`. Shown in the UI for visual scale, explicitly labeled as derived.

### DoPT (central government employment)
- **Source:** three actual DoPT Annual Report PDFs, downloaded directly (no login) from `dopt.gov.in/sites/default/files/`. Note: the listing page uses `%20`-encoded URLs with literal spaces in some filenames (e.g. `AR%202018-19%20English.pdf`) — a naive re-typed URL without the spaces gets rejected by the server's WAF; use the href exactly as listed.
  - 2018-19 report → data "as on 01.01.2016"
  - 2021-22 report → data "as on 01.01.2021"
  - 2024-25 report → data "as on 01.01.2024"
- **Table location in every report:** Chapter 4, "Reservation in the Central Government Services," in a numbered paragraph (4.8 or 4.12 depending on the year) — a compact Group A/B/C/Safai-Karamchari table, directly transcribed rather than parsed, since it's a handful of rows per year and PDF table layout drifts year to year.
- **Coverage-gap finding, corrected against primary sources:** the initial research pass characterized 2024-25 as a "jump" from a smaller 2019-2023 base. Reading the actual reports shows a **dip-and-recovery**, not a one-way increase:
  - 2016 (78 ministries reporting): **3,258,663** employees
  - 2021 (only **72** ministries reporting): **1,878,822** employees — the confirmed low-coverage point
  - 2024 (80 ministries reporting): **3,252,152** employees
  - 2016 and 2024 are similarly comprehensive; 2021 sits on a much smaller reporting base and is **not comparable** to either — flagged `coverage_gap: true` in the pipeline output.
- **The "tapering" pattern is directly visible in the transcribed data**, not just alluded to: SC representation in Group A (senior) was 13.38% (2016) → 13.01% (2021) → 14.20% (2024), under the 15% quota in every single year, while Group C excl. Safai Karamchari (junior) was 17.28% → 17.36% → 16.75%, above quota throughout.
- **Safai Karamchari (manual scavenging) sub-category kept separate**, not folded into Group C: SC share there is 45.16% / 32.56% / 36.75% across the three years — dramatically higher than the rest of Group C, reflecting the historical caste-occupation link. Averaging it into Group C would hide this.
- **EWS confirmed absent**: no EWS column exists in this table in any of the three transcribed years, consistent with the government's own acknowledgment (Rajya Sabha reply, Dec 2019) that no population baseline has ever been established for the EWS category.
- **General/Other category is derived, not transcribed.** DoPT's table only reports SC/ST/OBC counts per group; General (unreserved) is computed in `scripts/representation/clean.py` as the residual (`total - sc - st - obc`) per group. This residual silently includes EWS employees too, since EWS isn't broken out separately — labeled as such in the UI. Shown per-group alongside SC/ST/OBC for visual scale: it runs the *opposite* direction of the tapering pattern (highest in Group A, lowest in Group C), which is the flip side of the same finding.
- Full transcribed values, with report/page citations: `data/raw/representation/dopt_transcribed.json`.

---

## 0a. Everyday Discrimination — self-reported practice of untouchability (IHDS-II)

Added to answer directly: how common is "soft"/everyday caste discrimination — the kind that never becomes a registered case? This is the flip side of the crime data: instead of registered atrocities, it measures the **perpetrator side** — households self-reporting whether they practice untouchability.

- **Source:** Thorat, Amit and Joshi, Omkar (2020), "The Continuing Practice of Untouchability in India: Patterns and Mitigating Influences," *Economic & Political Weekly*, Vol LV No 2. Uses India Human Development Survey Round II (IHDS-II, 2011-12, NCAER + University of Maryland, ~42,000 nationally representative households).
- **Deliberately NOT sourced by scraping news/Reddit/forums.** That approach was considered and rejected: (1) severe selection bias — routine, everyday discrimination is specifically the kind of thing that does *not* make news, so scraping news would capture only the extreme tail, not the baseline; (2) no denominator — a scraped incident count can't produce a prevalence rate the way a representative household survey can; (3) demographic skew — Reddit/forum populations skew urban, English-speaking, and online, unrepresentative of where this practice has been documented as most prevalent (rural India); (4) real consent/privacy concerns around aggregating personal accounts of caste identity and discrimination without consent. A nationally representative survey is the correct instrument for a prevalence question, and one already exists at scale.
- **Headline finding:** 21% of households (this table's own total; the same paper separately states a 27% headline figure elsewhere — both reported, discrepancy is in the source itself) admit to practicing untouchability. By social group: Brahmins 44%, OBC 26%, Forward castes 18%, ST 17%, SC 11% — i.e., SC/ST report the *lowest* self-practice rates, consistent with being the group discriminated against rather than discriminating, though the paper notes a nontrivial 11-17% of SC/ST also admit practicing it against other sub-castes.
- **"Forward castes" is not the same as "upper caste."** The paper defines "Forward castes" narrowly as Kshatriya/Vaishya only, and reports Brahmins as a separate group — not folded into "forward"/"upper caste" the way it might be in casual usage. We deliberately did **not** relabel this as "Upper Caste" in the UI, since that would misleadingly suggest the 18% figure already includes Brahmins when it explicitly excludes them (Brahmins report 44% separately). We also did **not** add the two figures into a combined "upper caste" number: a valid combined rate would need a weighted average by each group's share of the ~42,000-household sample, and the paper never publishes that breakdown (only the total N). A naive average of 44% and 18% would silently assume the two subgroups are equal-sized, which is almost certainly false — the same kind of unjustified precision this project avoids elsewhere (see the OBC/General population-share non-projectability note above).
- **The paper's own authors flag the OBC-vs-Forward-castes ordering as a surprise**: OBCs (26%) report *higher* self-practice than forward castes (18%), the reverse of what caste hierarchy alone would predict. They offer two candidate explanations — "Sanskritisation" (OBCs adopting upper-caste practices as they rise economically via reservation) and rising OBC–SC competition for land/resources in some regions — neither of which the paper resolves definitively. Their regression (which controls for other factors, using SC as the reference group) actually reverses this ordering again — forward castes score higher than OBCs once other factors are held constant — so the raw crosstab and the controlled regression disagree on which group is "worse," a nuance visible in the source paper's own tables but not something this project's UI resolves either.
- **A transcription catch worth noting:** the source PDF's raw text extraction rendered the SC row of a second table as "55%" (No 95, Yes 55, Total 100 — doesn't sum to 100, a clear artifact). The paper's own prose states "only 5% of the SC households responded in the affirmative" — the prose value (5%) was used, not the corrupted table extraction, after checking both against each other. A good example of why every number in this project gets cross-checked against at least one other passage before use.
- **Single 2011-12 snapshot, not a trend.** IHDS-III field data collection completed June 2024, but no published analysis of this specific question could be found as of this writing — a future update could add a second data point if one is published.
- Full transcribed values, with exact table/citation: `data/raw/attitudes/ihds_untouchability_transcribed.json`.

---

## 1a. Population share as a representation benchmark (SC/ST only)

Added alongside the statutory-quota reference lines on the Representation page, reusing the same population reference data already verified for the crime pipeline's rate-per-lakh calculation (`data/reference/sc_st_census_population.json`) — no new source needed.

- **Census anchors (verified):** 2001 — SC 166,635,700; ST 84,326,240. 2011 — total population 1,210,854,977; SC 201,378,086 (16.63%); ST 104,281,034 (8.61%).
- **Projected per year, not held flat.** Population share is now computed **for the specific year each dataset refers to** (DoPT's 2016/2021/2024, AISHE's latest year), rather than using a single flat 2011 figure everywhere. SC/ST absolute population is extrapolated forward from the 2001→2011 census compound annual growth rate (CAGR); that projected count is then divided by a **UN World Population Prospects (2024 Revision)** total-population estimate for the same year to get the share. See `scripts/common/population_projection.py` and `data/reference/sc_st_census_population.json`.
- **Why a UN denominator, not a Census one:** India has no census total-population figure after 2011 to divide by. UN WPP mid-year estimates are the standard independent source used to fill this gap, but they're a methodologically different measurement from India's own census (different reference date, different estimation approach) — the Census 2011 total (~1.211 billion, taken around March) and UN's mid-2011 estimate (~1.261 billion, a July 1 estimate) differ by about 4% purely from that difference, not from any error. This is why the 2011 population-share figure shown in the app (15.97% SC using the UN denominator) reads slightly lower than the exact Census-only ratio (16.63%) — both are documented, and the gap is disclosed rather than hidden.
- **Why it matters:** the statutory quotas (15% SC, 7.5% ST) were set decades ago and have never been revised upward, while SC/ST's population share keeps growing — so the gap between "quota" and "actual population share" widens over time rather than staying fixed. Projecting per year (instead of using one flat historical number) makes that widening visible instead of implying the benchmark itself is static.
- **No OBC/General population share exists, and none can be projected.** India's census has not enumerated caste beyond SC/ST since 1931. The commonly-cited OBC figures — ~52% from the Mandal Commission (1980, itself an extrapolation from the 1931 count) and ~41% from NSSO sample surveys (1999-2000/2006) — are two different old estimates using different methods, not two points on a trend the way SC/ST's 2001→2011 census figures are. Treating either as a projectable anchor would be fabricating a trend from a single contested guess. "General/Other" as a residual (100% − SC% − ST% − OBC%) inherits the same problem: the NSSO figure implies ~34% General, Mandal's implies ~23% — an 11-point swing depending purely on which decades-old OBC estimate is picked. This is why no population-share line is plotted for OBC anywhere in the app, and it's stated explicitly in the UI rather than silently omitted.
- **Full trend now charted on its own page, for reference.** A standalone **Population Share** page (nav: Representation ▾ → Population Share) has a "SC/ST population share, for reference" chart plotting every year 2011–2026 (the full range `scripts/common/population_projection.py` already computes), not just the single years DoPT/AISHE happen to need. This isn't a new finding — it's the same benchmark used elsewhere, shown in full so a reader can see the whole projected curve and where the 2011 Census/modeled-estimate boundary sits. Generated by `build_population_trend_output()` in `scripts/representation/clean.py`, written to `frontend/public/data/representation/population_share_trend.json`.
- **Estimated OBC/General distribution, shown as two scenarios, never blended.** The same Population Share page also has a "how would the full population split look" horizontal 100%-stacked bar with two rows — one per OBC estimate (NSSO ~41%, Mandal ~52%) — using the *exact* 2011 Census SC/ST shares (16.63% SC, 8.61% ST, not the UN-denominator-adjusted per-year figures used in the trend chart above) with OBC and General/Other filled in per scenario. The two rows are deliberately never averaged into one "best guess" number — doing so would imply a false precision neither source supports. Scenario inputs live in `data/reference/sc_st_census_population.json`'s `obc_general_estimates`; computed and written by `build_population_distribution_output()` in `scripts/representation/clean.py` to `frontend/public/data/representation/population_distribution_estimate.json`.

---

## 1b. Income & Consumption — MPCE by social group (the "financial upliftment" proxy)

This directly answers the project brief's own call-out that enrollment/employment share aren't proxies for financial upliftment — a genuinely separate metric was needed, and one exists: Monthly Per Capita Consumption Expenditure (MPCE) by social group, from two official NSS/HCES (Ministry of Statistics and Programme Implementation) reports, both downloaded directly with no login required.

- **2022-23** (NSS Report No. 591, `mospi.gov.in`): Table 3.21, All-India MPCE (₹) by social group (ST/SC/OBC/Others), rural and urban, "with imputation" (includes free items received via welfare schemes — the report's preferred headline figure). Also has a "major states" breakdown (Table 3.12/3.21) not yet transcribed (national-only v1 scope).
- **2011-12** (NSS Report No. 562, `mospi.gov.in`): Statement 3.1 gives the same absolute-MPCE breakdown for that year (all states/UTs, not just major ones, in the source). **Statement 3.11 is the real find**: an official historical series giving each group's % difference from the all-groups average MPCE for **2004-05, 2009-10, and 2011-12** — a genuine 3-point trend already compiled by the source itself, not something reconstructed from scattered citations.
- **Cross-validation**: recomputing the 2011-12 percentage-gap figures from the absolute MPCE table (Statement 3.1) reproduces Statement 3.11's own stated percentages exactly (e.g. rural ST: (1122-1430)/1430×100 = -21.5%, matching the source's stated -21.5%) — strong confidence in both tables and the methodology.
- **A 4th point (2022-23) was computed here**, not stated in either source, using the identical formula for methodological consistency — documented as computed, not transcribed, in `data/raw/consumption/hces_transcribed.json`.
- **Critical caveat, impossible to overstate**: there is a genuine 11-year gap in official Indian consumption data. The 2017-18 NSS consumption survey was conducted but **never officially released** — the government withdrew it citing "data quality issues," a widely-reported and disputed decision (commonly interpreted as the survey showing an unwelcome consumption decline). Additionally, MoSPI itself has acknowledged HCES 2022-23 used a revised methodology (modified questionnaire, different item recall periods) versus earlier NSS rounds — so the jump from 2011-12 to 2022-23 in the trend chart should be read as directionally informative, not a precisely comparable measurement the way 2004-05→2009-10→2011-12 (all same methodology) can be.
- **Scope note**: MPCE is consumption, not income, wealth, land, or assets. It's the best available official proxy for "financial strength by caste" but is not the same thing as AIDIS-style asset/debt data (still not built — see section 6).
- Full transcribed and computed values, with exact table/page citations: `data/raw/consumption/hces_transcribed.json`.

---

## 1c. Land, Assets & Debt — AIDIS (the actual wealth metric)

Requested explicitly as the true "land ownership / financial strength" data point, distinct from MPCE consumption. Found via the All India Debt & Investment Survey (AIDIS), NSSO/MoSPI — the standard official source for household wealth by social group in India.

- **2019** (NSS Report No. 588, AIDIS 77th Round, `mospi.gov.in`, 1,919 pages — first download attempt was truncated at 29MB by a curl timeout against the actual 46MB file; caught by comparing against the server's `Content-Length` header, redownloaded in full): Statement 3.3 (Average Value of Assets by social group), Statement 3.9 (debt incidence/amount by social group), Statement 3.19 (debt-to-asset ratio by social group) — all national, rural/urban, ST/SC/OBC/Others.
- **2012-13** (NSS KI 70/18.2, `mospi.gov.in`, 116 pages): Statement 3.6 gives debt (IOI/AOD) by social group — a genuine 2012-13 to 2019 comparison point for debt. **Its asset table (Statement 3.1) is only broken down by occupational category (cultivator/non-cultivator), not by social group** — so asset holdings stay a single 2019 snapshot, not a trend. This asymmetry is real (confirmed by reading the actual table), not a research gap.
- **Headline finding**: ST and SC households hold roughly a third of the average asset value of "Others" households, in both rural and urban India — a starker gap than either the education (AISHE) or consumption (HCES) tracks show.
- **Important interpretive caveat, stated explicitly in the UI**: ST households show the *lowest* debt incidence and amount of any group — but combined with by far the lowest asset base, this is far more likely to reflect exclusion from credit markets (formal and informal) than financial health. The dashboard explicitly warns against reading the debt chart as good news in isolation from the asset chart.
- Full transcribed values, with exact statement/page citations: `data/raw/wealth/aidis_transcribed.json`.
- **Is the gap narrowing, and how fast? No published research supports a "years to parity" estimate, and the two academic studies that actually track this over multiple AIDIS rounds (which this dashboard's own single-snapshot data can't do) find no clean convergence to extrapolate from:**
  - Ishan Anand (IIT Delhi, in a 2023 World Bank comparative India/US paper) tracks the Forward-Caste/SC wealth ratio 2002→2012→2018-19: the *mean* ratio widened then narrowed (3.6 → 4.3 → 3.2) while the *median* narrowed more steadily but slowly (2.9 → 2.5 → 2.4) — nowhere near parity after 16 years. His own stated conclusion: "Ownership rates: slow progress; no convergence in sight." He flags the mean series as possibly a survey-methodology artefact rather than a real trend.
  - Nitin Kumar Bharti (World Inequality Lab working paper, 2018, using AIDIS 1961–2012) reaches the same conclusion independently over a much longer window: "The data shows that the situation of every caste has improved over time, but there is no convergence between upper and lower castes. The rate of growth of forward/upper castes in terms of acquiring wealth or consumption is higher than the lower castes." His representational-inequality measure (each caste's share of the top wealth decile relative to its population share) actually *worsened* for SC between 2002 and 2012.
  - Both papers also find rising *within-group* inequality (the top 1% within FC, and within SC/ST, pulling away from the rest of their own group), which makes even a simple group-average comparison a moving target. This is the same reasoning this project already applies elsewhere (e.g. not projecting an OBC population share) — extrapolating a "time to parity" figure from a trend this noisy would fabricate precision the data doesn't support.
- **This trend is now actually charted in the UI** ("Wealth concentration over time, by caste" card on the Wealth page), using Bharti's Table 20 (p.40) — the one dataset above with exact printed, multi-round, caste-specific numbers (India, 1991/2002/2012 for ST/SC; 2002/2012 only for OBC/FC, since pre-1999 NSS surveys didn't separate OBC from Forward Caste). Transcribed to `data/raw/wealth/academic_studies_transcribed.json`, processed by `scripts/wealth/academic_studies.py`. Anand's finding is cited alongside it as corroborating text, deliberately **not charted**: his numbers exist only as a chart image in a slide deck, not a printed table, and plotting estimated pixel-readings as exact figures would fabricate precision his own source doesn't provide.

---

## 1d. Unemployment rate — PLFS (labour-market outcome, its own page)

Requested as a genuine labour-market outcome distinct from DoPT's central-government-employment representation and from Income/Wealth's consumption and asset measures. Filed under "Financial strength" in the nav, not "Representation" — unemployment status is an economic-security outcome, closer in kind to income/wealth than to institutional representation.

- **Source: official PLFS ("Periodic Labour Force Survey") Annual Reports, MoSPI/NSO** — the standard, authoritative source for India's unemployment rate, hand-transcribed directly from each report's own "Statement" table (the same rigor as AISHE/DoPT: primary-source PDFs, not a third-party aggregator). A cleaner-looking pre-tabulated version of the same data exists on `dataful.in` ("PLFS: Year, Region, Gender, and Social Group wise Unemployment Rate", 2004-05 to 2025), but its full historical CSV is paywalled/download-gated behind an account — only a small page preview is public — so the official PDFs were used instead.
- **What it has:** Unemployment Rate (UR, %) according to usual status (ps+ss), by social group (ST/SC/OBC/Others/All), national, "rural+urban" (PLFS's own combined estimate, not a simple average of separate rural/urban figures) and "person" (male+female combined) columns specifically, for six years: 2017-18, 2018-19, 2019-20, 2021-22, 2022-23, 2023-24.
- **Three reports were needed to assemble six years without gaps**, since each Annual Report's own comparison table only reaches back 2-3 years: PLFS 2017-18 (Statement 44, its own first-year figure), PLFS 2019-20 (Statement 36, covering 2017-18/2018-19/2019-20 together — cross-checked against the 2017-18 report's own figure for that year, which matched exactly), and PLFS 2023-24 (Statement 19, covering 2021-22/2022-23/2023-24 together).
- **2020-21 (the COVID year) is a confirmed gap, not a silent omission**: no report among the three used has a comparison table reaching back that far, and downloading a fourth full annual report (500+ pages each) just for one data point wasn't judged worth the added pipeline complexity. Stated explicitly in the UI.
- **Sample design caveat, stated in every PLFS report itself**: social group is recorded once per household (based on the head of household), applied to every member regardless of their own individual category, and the survey isn't stratified to specifically oversample SC/ST/OBC populations — which is also why MoSPI doesn't publish state/UT-level breakdowns by social group (an official-source limitation, not one introduced by this project).
- Full transcribed values, with exact statement/page citations per year: `data/raw/employment/plfs_unemployment_transcribed.json`. Processed by `scripts/employment/plfs_unemployment.py`.

---

## 2a. Crime data — conviction rate & case disposal (separate from case-count trend)

The main crime pipeline (section 1) only had case-registration counts, not what happens after — chargesheet rate, conviction rate, case backlog. Found via a Rajya Sabha Unstarred Question reply (No. 301, answered 24 July 2024, Ministry of Home Affairs, in response to a question from Shri Mukul Balkrishna Wasnik), hosted at `cvmc.in` (a non-government mirror, but the PDF itself is an authentic MHA parliamentary reply, no login needed).

- **What it has:** State/UT-wise Cases Registered, Chargesheeted, Convicted, Conviction Rate, and Cases Pending Trial (year-end), separately for SC (Annexure-I) and ST (Annexure-II), for 2018–2022. National `TOTAL (ALL INDIA)` row transcribed for each year.
- **This is a DIFFERENT official compilation from the district-level CSVs** used in `scripts/crime/clean.py` — not the same table. They cross-validate closely though: national SC cases registered in 2018 is 42,539 here vs. 42,793 in the district-CSV pipeline (within 0.6%), which is reassuring rather than concerning — same underlying reality, slightly different official tabulation.
- **"Cases pending trial at year end" is cumulative**, not that year's new cases — it grew from ~172,794 (2018) to ~282,428 (2022) for SC, i.e. cases are entering the system faster than courts are resolving them. Labeled as such in the UI to avoid misreading it as an annual figure.
- Full transcribed values: `data/raw/crime/conviction_disposal_transcribed.json`.

---

## 3. Parliamentary representation — Lok Sabha reserved seats (Article 330)

- **What it is:** SC/ST seats are constitutionally reserved in the Lok Sabha under Article 330, allocated per state roughly in proportion to SC/ST population share. This is a **structural entitlement, not an annual trend** — it only changes at delimitation events, which are infrequent (frozen since 1976, changed once in 2008, frozen again until after the census following 2026).
- **Figures used, cross-validated across two independent web searches:**
  - Pre-2008 delimitation (applicable 1977–2004 general elections, 6th–14th Lok Sabha): **79 SC / 41 ST** reserved seats out of 543 total.
  - Post-2008 delimitation (applicable 2009–2024 general elections, 15th–18th Lok Sabha): **84 SC / 47 ST** reserved seats out of 543 total.
- **Confirmed dead ends:**
  - **Rajya Sabha has no SC/ST reservation at all** — Article 330 covers only the Lok Sabha; Rajya Sabha members are indirectly elected by state legislatures with no reservation mechanism.
  - **No OBC reservation exists in Parliament at any level.** OBC reservation in Indian law applies only to local bodies (Panchayati Raj institutions, municipalities) under the 73rd/74th Constitutional Amendments — a different tier of government, not Parliament or State Assemblies.
  - **Actual SC/ST MPs elected (including those who won unreserved/general seats) is not tracked here.** This exceeds the reserved-seat count in practice, but no single official, continuously-updated dataset compiling every winning candidate's self-declared category across elections was found — would need constituency-by-constituency compilation, similar in kind to the OBC-crime-data dead end. Only reserved-seat *allocation* is in this dataset, not actual elected representation.
  - **State Legislative Assemblies** also have SC/ST reservation (Article 332) but are out of scope for this national-only v1, consistent with the crime/representation tracks' scope decision.
- Full transcribed values, with source notes: `data/raw/parliament/lok_sabha_reserved_seats.json`.

---

## 4. Elite/institution-tier education data — checked, not yet built

The project brief itself flags that a national AISHE enrollment-share headline number can mask a more complicated picture — elite vs. general institution mix being one dimension. Checked whether this is available:

- **Confirmed to exist**: Lok Sabha unstarred question replies from the Ministry of Education do contain SC/ST/OBC-specific figures for IITs, IIMs, and central universities specifically — e.g. a Dec 2023 reply (MoS Subhas Sarkar) covering SC/ST/OBC dropout counts at IITs/IIMs/central universities over 5 years, and separate replies covering SC/ST/OBC faculty representation share at IITs and IIMs.
- **Not yet built.** This would be its own transcription effort (finding and reading specific Parliament Q&A PDFs/Lok Sabha replies, likely across several different questions/years to get a usable series), comparable in effort to the AISHE/DoPT work already done — not a quick addition. Flagged here so the option isn't lost, pending a decision on whether to prioritize it.

---

## 5. Other sources — checked, not used

- **PLFS organized/unorganized (formal/informal) sector share by social group**: PLFS microdata supports this cross-tab, but no official pre-tabulated table for it was found (unlike unemployment rate, which is charted — see section 1d) — it would need raw unit-level microdata tabulation, a heavier lift than the "one more table from an existing report" case. Flagged as a follow-up, not built.
- **SECC 2011** (caste-wise asset data): confirmed dead end. The Solicitor General told the Supreme Court in 2021 that the caste enumeration was unusable (e.g. Maharashtra alone had 4.28 lakh distinct caste-name string variants, only 494 of which mapped to real OBC categories); the Court upheld non-disclosure. Excluded entirely.
- **EWS crime or population data:** no baseline exists anywhere; not tracked.

---

## 6. If extending this later

- **Crime data back to 2001 or forward to 2023:** requires either a free `data.gov.in` API key (self-registered, ~2 min) or a `dataful.in` account. Not automated by design, to keep the pipeline dependency-free of personal credentials.
- **State/UT drill-down:** the crime schema already retains district/state fields before national aggregation (just not surfaced in the v1 UI) — extending is a UI + aggregation-level change, not a new data-fetch problem.
- **Intervening DoPT years (2017-18 through 2023, excl. 2021):** would need the same manual chapter-4 transcription repeated per report; the three years already done (2016, 2021, 2024) were chosen specifically to bound the confirmed coverage-gap era.
