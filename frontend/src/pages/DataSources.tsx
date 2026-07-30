import { DataStatusTag } from "../components/DataStatusTag";

export function DataSources() {
  return (
    <div>
      <h1 className="page-title">Data Sources &amp; Methodology</h1>
      <p className="page-subtitle">
        Every figure in this dashboard traces back to a specific report, table, and page. This page lists what was
        used, what's directly reported vs. computed vs. estimated, and what was checked and ruled out.
      </p>

      <div className="card">
        <h2>How to read the tags</h2>
        <p className="card-note" style={{ marginBottom: 10 }}>
          Every dataset below is tagged with how it was obtained:
        </p>
        <p style={{ marginBottom: 6 }}>
          <DataStatusTag status="reported" /> — read directly from an official table, no math applied.
        </p>
        <p style={{ marginBottom: 6 }}>
          <DataStatusTag status="computed" /> — simple arithmetic on reported figures (e.g. a percentage, a
          residual, a sum) — low risk, shown so it's not mistaken for an official statistic.
        </p>
        <p style={{ marginBottom: 6 }}>
          <DataStatusTag status="reconstructed" /> — recovered from a source chart's rendered layout rather than a
          text table, then cross-checked against the source's own prose. Used once (AISHE GER trend).
        </p>
        <p>
          <DataStatusTag status="projected" /> — a modeled estimate standing in for a real measurement that doesn't
          exist yet (e.g. population between censuses). Flagged wherever it's used, not silently assumed.
        </p>
      </div>

      <div className="card" id="crime">
        <h2>Crime &amp; Atrocities</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
          <DataStatusTag status="computed" />
        </p>
        <p className="card-note">
          District-level SC/ST crime data, India Data Portal (CKAN backend of indiadataportal.com), 2016–2022.
          National totals are <strong>computed</strong> by summing every crime-head column per district — safe
          because each source file's columns are a flat list of distinct offences, verified against publicly known
          NCRB totals. Conviction/chargesheet/pending-trial data (2018–2022) is a separate official compilation — a
          Rajya Sabha Unstarred Question reply (MHA, July 2024) — cross-validated against the district data within
          0.6% for overlapping years. Chargesheet rate is <strong>computed</strong> (chargesheeted ÷ registered).
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Source:{" "}
          <a
            href="https://ckan.indiadataportal.com/dataset/337e5912-8e35-4520-9359-093262c0c1d9/resource/3c76cceb-7daa-4976-8453-ba5bba42a7dd/download/districtwise-crimes-against-sc-2017-onwards.csv"
            target="_blank"
            rel="noreferrer"
          >
            India Data Portal
          </a>{" "}
          (district-level CSVs) ·{" "}
          <a
            href="https://www.cvmc.in/wp-content/uploads/2024/10/20240724-RS-AU301-Crime-statistics-2018-2022.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Rajya Sabha reply
          </a>{" "}
          (conviction/disposal data)
        </p>
      </div>

      <div className="card" id="attitudes">
        <h2>Everyday Discrimination</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
        </p>
        <p className="card-note">
          Thorat &amp; Joshi (2020), Economic &amp; Political Weekly, using India Human Development Survey Round II
          (IHDS-II, 2011-12, ~42,000 households). Every figure is <strong>directly reported</strong> from the paper's
          own tables — self-reported practice of untouchability by social group, not registered crime data.
          Deliberately not sourced by scraping news/Reddit/forums: that method would carry severe selection bias
          (routine discrimination is specifically what does <em>not</em> make news), no denominator for a prevalence
          rate, a demographic skew toward urban/online populations, and real consent concerns around aggregating
          personal accounts of caste identity without consent. One number was caught and corrected during
          transcription: the source PDF's own text-extraction rendered one row as "55%" where the paper's prose
          plainly states "5%" — the prose value was used, not the corrupted table extraction. Single 2011-12
          snapshot — IHDS-III fieldwork completed June 2024, but no published analysis of this question was found
          yet. Note "Forward castes" (Kshatriya/Vaishya) and "Brahmins" are reported as two separate groups in the
          source, not one "upper caste" figure — not relabeled or combined here, since summing them validly would
          require each group's share of the sample, which the paper doesn't publish.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Source:{" "}
          <a
            href="https://socy.umd.edu/sites/socy.umd.edu/files/pubs/Thorat%20and%20Joshi%202019_The%20Continuning%20Practice%20of%20Untouchability%20in%20India.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Thorat &amp; Joshi (2020), EPW
          </a>
        </p>
      </div>

      <div className="card" id="population">
        <h2>Population reference (SC/ST)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
          <DataStatusTag status="projected" />
        </p>
        <p className="card-note">
          Census 2001 and 2011 SC/ST population figures are <strong>directly reported</strong> (last two censuses;
          India hasn't held one since 2011). Every year after 2011 — both the crime-rate denominator and the
          population-share benchmark on the Representation page — is <strong>projected</strong>: SC/ST population is
          extrapolated forward from the 2001→2011 compound growth rate, then divided by a UN World Population
          Prospects total-population estimate for that same year to get a year-specific share (not a flat 2011
          figure held constant). This is a modeled estimate, not measured data, and every chart using it says so.
          Note the UN total-population series is a different source from India's own census, so the 2011 share
          computed this way (15.97% SC) reads slightly below the exact Census-only ratio (16.63%) — a ~4% base-year
          discrepancy between the two sources, documented rather than hidden. No equivalent projection exists for
          OBC/General: the census hasn't enumerated caste beyond SC/ST since 1931, so the only OBC estimates
          available (~41% NSSO, ~52% Mandal Commission) are two old, differently-measured guesses, not two points
          on a trend that can be projected forward the way SC/ST's 2001→2011 census figures can.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Sources:{" "}
          <a href="https://censusindia.gov.in" target="_blank" rel="noreferrer">
            Census of India
          </a>{" "}
          ·{" "}
          <a href="https://www.un.org/development/desa/pd/world-population-prospects-2024" target="_blank" rel="noreferrer">
            UN World Population Prospects (2024 Revision)
          </a>{" "}
          ·{" "}
          <a href="https://microdata.gov.in/nada/index.php/catalog/90" target="_blank" rel="noreferrer">
            NSSO 55th Round
          </a>{" "}
          ·{" "}
          <a href="https://eparlib.sansad.in/handle/123456789/822932" target="_blank" rel="noreferrer">
            Mandal Commission Report
          </a>
        </p>
      </div>

      <div className="card" id="education">
        <h2>Education (AISHE)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
          <DataStatusTag status="reconstructed" />
          <DataStatusTag status="computed" />
        </p>
        <p className="card-note">
          AISHE Final Report 2023-24 (PDF, no clean CSV/API exists). The 2014-15 GER figures are{" "}
          <strong>directly reported</strong> from the report's prose. The 2019-20 through 2023-24 GER trend was{" "}
          <strong>reconstructed</strong> from a chart's rendered data-label positions (the raw PDF text extraction
          returns chart labels in jumbled order) — cross-checked against the report's own prose statements for
          2019-20, 2022-23, and 2023-24, which match exactly. General/Other enrollment share is{" "}
          <strong>computed</strong> as a residual against the report's stated total enrollment (4.50 crore) — AISHE
          doesn't state a General share directly. No OBC GER series exists in this report at all.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Source:{" "}
          <a
            href="https://cdnbbsr.s3waas.gov.in/s392049debbe566ca5782a3045cf300a3c/uploads/2026/07/202607131602421770.pdf"
            target="_blank"
            rel="noreferrer"
          >
            AISHE Final Report 2023-24
          </a>
        </p>
      </div>

      <div className="card" id="employment">
        <h2>Employment (DoPT)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
          <DataStatusTag status="computed" />
        </p>
        <p className="card-note">
          Three DoPT Annual Reports, manually transcribed (PDF-only, no clean CSV/API): data "as on" 01.01.2016
          (78 ministries reporting), 01.01.2021 (only 72 ministries — a confirmed coverage-gap year, not comparable
          to the other two), and 01.01.2024 (80 ministries). Group A/B/C/Safai Karamchari figures are{" "}
          <strong>directly reported</strong>. General/Other is <strong>computed</strong> as a residual (total − SC −
          ST − OBC) — this silently includes EWS, since DoPT doesn't report EWS separately. No EWS representation
          data has ever been published by DoPT, in any year checked.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Sources:{" "}
          <a href="https://dopt.gov.in/sites/default/files/AR%202018-19%20English.pdf" target="_blank" rel="noreferrer">
            2018-19
          </a>{" "}
          ·{" "}
          <a href="https://dopt.gov.in/sites/default/files/AR%202021-22%20English.pdf" target="_blank" rel="noreferrer">
            2021-22
          </a>{" "}
          ·{" "}
          <a href="https://dopt.gov.in/sites/default/files/AR2024-25English.pdf" target="_blank" rel="noreferrer">
            2024-25
          </a>{" "}
          DoPT Annual Reports
        </p>
      </div>

      <div className="card" id="parliament">
        <h2>Parliament (Lok Sabha)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
          <DataStatusTag status="computed" />
        </p>
        <p className="card-note">
          SC/ST reserved-seat counts for the two most recent delimitation eras (79 SC/41 ST seats, 1977–2004
          elections; 84 SC/47 ST seats, 2009–2024 elections) are <strong>directly reported</strong>, cross-validated
          across two independent sources. Seat-share percentages are <strong>computed</strong> (simple division by
          543 total seats). This is a structural entitlement, not an annual series — it only changes at delimitation
          events. No Rajya Sabha or OBC parliamentary reservation exists anywhere; actual elected SC/ST
          representation beyond reserved seats isn't tracked by any single official source.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          No single official document link here — the seat counts were cross-validated across multiple independent
          sources reporting the 2008 Delimitation Commission order, not read off one document.
        </p>
      </div>

      <div className="card" id="income">
        <h2>Income &amp; Consumption (MPCE)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
          <DataStatusTag status="computed" />
        </p>
        <p className="card-note">
          Two NSS/HCES reports (MoSPI): 2011-12 (Report No. 562) and 2022-23 (Report No. 591). The 2004-05, 2009-10,
          and 2011-12 "% gap from average" figures are <strong>directly reported</strong> from the 2011-12 report's
          own historical series (Statement 3.11). The <strong>2022-23 gap figure was computed here</strong>, not
          stated in either source — using the identical formula for methodological consistency, since the 2022-23
          report doesn't include this framing. There is an 11-year gap in official data: the 2017-18 survey was
          conducted but never released (withdrawn over disputed "data quality issues"), and the 2022-23 round used a
          revised methodology — so that jump should be read as directional, not precisely comparable to the earlier
          three points.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Sources:{" "}
          <a
            href="https://www.mospi.gov.in/sites/default/files/publication_reports/nss_rep_562_27feb15.pdf"
            target="_blank"
            rel="noreferrer"
          >
            NSS Report No. 562 (2011-12)
          </a>{" "}
          ·{" "}
          <a
            href="https://www.mospi.gov.in/sites/default/files/publication_reports/Report_591_HCES_2022-23New.pdf"
            target="_blank"
            rel="noreferrer"
          >
            HCES Report No. 591 (2022-23)
          </a>
        </p>
      </div>

      <div className="card" id="wealth">
        <h2>Land, Assets &amp; Debt (AIDIS)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
        </p>
        <p className="card-note">
          Two AIDIS reports (NSSO/MoSPI): 2019 (Report No. 588) and 2012-13 (Key Indicators 70/18.2). All figures
          shown — asset value, debt incidence, debt amount, debt-to-asset ratio — are <strong>directly reported</strong>{" "}
          from official statement tables. Asset value by social group is a single 2019 snapshot: the 2012-13
          report's asset table is broken down by occupational category, not social group, so no comparable earlier
          data point exists for assets. Debt does have a real 2012-13 → 2019 comparison.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8, marginBottom: 8 }}>
          Sources:{" "}
          <a
            href="https://mospi.gov.in/sites/default/files/publication_reports/Report%20no.%20588-AIDIS-77Rm-Sept.pdf"
            target="_blank"
            rel="noreferrer"
          >
            AIDIS Report No. 588 (2019)
          </a>{" "}
          ·{" "}
          <a
            href="https://www.mospi.gov.in/sites/default/files/publication_reports/KI_70_18.2_19dec14.pdf"
            target="_blank"
            rel="noreferrer"
          >
            AIDIS Key Indicators 70/18.2 (2012-13)
          </a>
        </p>
        <p className="card-note">
          <strong>Is the wealth gap narrowing, and how fast?</strong> No published research supports a "years to
          parity" estimate. The two academic studies that track this across multiple AIDIS rounds — which this
          single-snapshot data can't do — find no clean convergence: Ishan Anand (IIT Delhi/World Bank, 2023)
          concludes "no convergence in sight" after tracking the Forward-Caste/SC wealth ratio 2002–2019; Nitin
          Kumar Bharti (World Inequality Lab, 2018, using AIDIS 1961–2012) finds forward castes' wealth growing
          <em> faster</em> than lower castes', not slower. Full detail and citations in Data Sources.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Sources:{" "}
          <a href="https://thedocs.worldbank.org/en/doc/24e9d8b96858e6e947d34a0c81f4bc6a-0310022023/related/Ishan-Anand.pdf" target="_blank" rel="noreferrer">
            Anand (2023)
          </a>{" "}
          ·{" "}
          <a href="https://wid.world/www-site/uploads/2018/11/WID_WORKING_PAPER_2018_14_India_wealth.pdf" target="_blank" rel="noreferrer">
            Bharti (2018)
          </a>
        </p>
      </div>

      <div className="card" id="unemployment">
        <h2>Unemployment Rate (PLFS)</h2>
        <p style={{ marginBottom: 8 }}>
          <DataStatusTag status="reported" />
        </p>
        <p className="card-note">
          Three PLFS Annual Reports (MoSPI/NSO), each report's own "Statement" table, hand-transcribed since no
          clean CSV/API exists — six years <strong>directly reported</strong>: 2017-18 (its own report), 2018-19 and
          2019-20 (from the 2019-20 report's 3-year comparison table, cross-checked against the 2017-18 report's own
          figure, which matches exactly), and 2021-22/2022-23/2023-24 (from the 2023-24 report's 3-year comparison
          table). 2020-21 is a confirmed gap — none of the three reports reaches back that far. The 2017-18 report
          was itself the subject of a 2019 release-suppression controversy (two National Statistical Commission
          members resigned alleging the government withheld it ahead of the 2019 election) — a fact about the
          source's release history, not the survey numbers.
        </p>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>
          Sources:{" "}
          <a
            href="https://www.mospi.gov.in/sites/default/files/publication_reports/Annual%20Report,%20PLFS%202017-18_31052019.pdf"
            target="_blank"
            rel="noreferrer"
          >
            2017-18
          </a>{" "}
          ·{" "}
          <a
            href="https://mospi.gov.in/sites/default/files/publication_reports/Annual_Report_PLFS_2019_20F1.pdf"
            target="_blank"
            rel="noreferrer"
          >
            2019-20
          </a>{" "}
          ·{" "}
          <a
            href="https://mospi.gov.in/sites/default/files/publication_reports/AnnualReport_PLFS2023-24L2.pdf"
            target="_blank"
            rel="noreferrer"
          >
            2023-24
          </a>{" "}
          PLFS Annual Reports
        </p>
      </div>

      <div className="card">
        <h2>Checked and ruled out</h2>
        <p className="card-note" style={{ marginBottom: 10 }}>
          Confirmed dead ends — stated here so they read as deliberate scope decisions, not gaps that were missed.
        </p>
        <ul style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.7, paddingLeft: 20 }}>
          <li>City-tier caste crime — NCRB itself states it doesn't produce this breakdown.</li>
          <li>OBC crime data — no legal category (no Prevention of Atrocities Act equivalent) exists for OBC.</li>
          <li>EWS crime, population, or employment data — no baseline has ever been published.</li>
          <li>Rajya Sabha or OBC parliamentary/state-assembly reservation — doesn't exist in law.</li>
          <li>SECC 2011 caste-wise asset data — the Supreme Court upheld non-disclosure; the caste enumeration was ruled unusable by the government's own admission.</li>
          <li>Private-sector employment by caste — no legal mandate means no official reporting requirement exists.</li>
          <li>Elite-institution (IIT/IIM/NIT) enrollment by caste — confirmed to exist in Parliamentary Q&amp;A replies, but not yet built (would need its own transcription pass).</li>
        </ul>
      </div>
    </div>
  );
}
