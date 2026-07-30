import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { AisheData, DoptYearRow } from "../types/data";

const GROUP_ORDER = ["A", "B", "C_excl_safai_karamchari", "C_safai_karamchari"] as const;
const GROUP_LABEL: Record<(typeof GROUP_ORDER)[number], string> = {
  A: "Group A",
  B: "Group B",
  C_excl_safai_karamchari: "Group C",
  C_safai_karamchari: "Group C — Safai Karamchari",
};

export function Representation() {
  const aishe = useJsonData<AisheData>("data/representation/aishe_education.json");
  const dopt = useJsonData<DoptYearRow[]>("data/representation/dopt_employment.json");

  return (
    <div>
      <h1 className="page-title">Representation &amp; Socioeconomic Trends</h1>
      <p className="page-subtitle">
        Education enrollment and central government employment, kept as separate tracks. Neither is a proxy for
        financial upliftment — see the caveat below.
      </p>

      <div className="caveat-banner">
        <strong>Enrollment share and employment share are not economic outcomes.</strong> They measure access and
        workforce representation, not income or asset levels. This dashboard has no income/consumption data — treat
        rising enrollment or employment share as evidence about access, not about financial upliftment.
      </div>

      <p className="card-note">
        Both charts below compare against SC/ST's population share — see <Link to="/population">Population Share</Link>{" "}
        for that benchmark charted on its own, plus an estimated OBC/General breakdown.
      </p>

      <div className="card">
        <h2>Higher education — Gross Enrolment Ratio (AISHE)</h2>
        <ChartHelp>
          <p>
            Line chart — "All categories", SC, and ST enrolment ratios over years. GER can exceed 100% since it
            counts anyone enrolled in that age bracket's courses, including older or repeat students, against the
            official 18–23 population estimate. The gap between the "All" line and the SC/ST lines is what matters
            most: a narrowing gap means SC/ST enrolment is catching up to the national average, even while all three
            lines rise together.
          </p>
        </ChartHelp>
        <p className="card-note">
          Age 18–23, based on 2011 Census population projection. No OBC GER series is published by AISHE — only
          All/SC/ST.
        </p>
        {aishe.loading && <p className="loading">Loading…</p>}
        {aishe.error && <p className="error-text">{aishe.error}</p>}
        {aishe.data && (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aishe.data.ger_trend.years} margin={{ top: 10, right: 20, bottom: 18, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12.5 }}
                  label={{ value: "Year", position: "insideBottom", offset: -12, fontSize: 11.5, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12.5 }}
                  width={48}
                  domain={[0, "dataMax + 5"]}
                  label={{
                    value: "Gross Enrolment Ratio (%)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11.5,
                    fill: "var(--color-text-muted)",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                <Line type="monotone" dataKey="all" name="All categories" stroke={CATEGORY_COLOR.All} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sc" name="SC" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="st" name="ST" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="legend-row">
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.All }} /> All categories
              </span>
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} /> SC
              </span>
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} /> ST
              </span>
              <span style={{ fontStyle: "italic" }}>
                <span className="swatch" style={{ background: "var(--color-border)" }} /> OBC — not shown: AISHE
                does not publish an OBC GER series
              </span>
            </div>

            {(() => {
              const years = aishe.data.ger_trend.years;
              const first = years[0];
              const last = years[years.length - 1];
              const scGapFirst = first.all - first.sc;
              const scGapLast = last.all - last.sc;
              const stGapFirst = first.all - first.st;
              const stGapLast = last.all - last.st;
              return (
                <GraphVerdict direction="down" tone="positive">
                  Gap to All-category narrowing: SC {scGapFirst.toFixed(1)}→{scGapLast.toFixed(1)} pts, ST{" "}
                  {stGapFirst.toFixed(1)}→{stGapLast.toFixed(1)} pts ({first.year}–{last.year})
                </GraphVerdict>
              );
            })()}

            <h2 style={{ marginTop: 24 }}>Enrollment share, {aishe.data.enrollment_share_latest.year}</h2>
            <ChartHelp>
              <p>
                Each tile is this group's share (%) of all students enrolled nationally, with its share of the total
                population shown just below it for comparison (not shown for OBC — see note below the tiles). If a
                group's enrollment share is below its population share, that group is under-represented among
                students relative to its size in the country.
              </p>
            </ChartHelp>
            <p className="card-note">
              Out of {aishe.data.enrollment_share_latest.total_enrollment_crore} crore total students. General/Other
              is shown for visual scale — it's a derived residual (not stated directly by AISHE) and includes
              categories outside SC/ST/OBC.
            </p>
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="label" style={{ color: CATEGORY_COLOR.SC }}>SC</div>
                <div className="value">{aishe.data.enrollment_share_latest.sc_pct_of_total}%</div>
                <div className="sub">{aishe.data.enrollment_share_latest.sc_count_lakh} lakh students</div>
                <div className="sub">
                  vs. {aishe.data.enrollment_share_latest.population_share.sc_pct}% population share
                </div>
              </div>
              <div className="stat-tile">
                <div className="label" style={{ color: CATEGORY_COLOR.ST }}>ST</div>
                <div className="value">{aishe.data.enrollment_share_latest.st_pct_of_total}%</div>
                <div className="sub">{aishe.data.enrollment_share_latest.st_count_lakh} lakh students</div>
                <div className="sub">
                  vs. {aishe.data.enrollment_share_latest.population_share.st_pct}% population share
                </div>
              </div>
              <div className="stat-tile">
                <div className="label" style={{ color: CATEGORY_COLOR.OBC }}>OBC</div>
                <div className="value">{aishe.data.enrollment_share_latest.obc_pct_of_total}%</div>
                <div className="sub">{aishe.data.enrollment_share_latest.obc_count_crore} crore students</div>
              </div>
              <div className="stat-tile">
                <div className="label" style={{ color: CATEGORY_COLOR.General }}>General / Other</div>
                <div className="value">{aishe.data.enrollment_share_latest.general_pct_of_total}%</div>
                <div className="sub">{(aishe.data.enrollment_share_latest.general_count_lakh / 100).toFixed(2)} crore students</div>
              </div>
            </div>
            <p className="card-note" style={{ marginTop: 10 }}>
              {aishe.data.enrollment_share_latest.note}
            </p>
            <p className="card-note">
              Population share is SC/ST's projected share of India's total population as of{" "}
              {aishe.data.enrollment_share_latest.population_share.year} (compound growth extrapolated from the
              2001/2011 censuses — not held flat at the 2011 figure). No equivalent OBC population share exists: the
              census hasn't enumerated caste beyond SC/ST since 1931; commonly-cited figures (~41% NSSO, ~52% Mandal
              Commission) are two old, differently-measured guesses, not a projectable trend — so no "vs. population"
              comparison is shown for OBC. See <Link to="/data-sources">Data Sources</Link> for the full methodology.
            </p>
          </>
        )}
      </div>

      <div className="card">
        <h2>Central government employment (DoPT)</h2>
        <ChartHelp>
          <p>
            Bar chart per year: height = % of posts in that job grade (Group A/B/C) held by each group. The dashed
            lines mark the legal quota for SC/ST/OBC; the fainter dotted lines mark SC/ST's share of India's
            population that year. A bar above its dashed line means that group is meeting or exceeding quota in that
            grade — compare Group A (senior) against Group C (junior) across the charts to see the "tapering"
            pattern described below them.
          </p>
        </ChartHelp>
        <p className="card-note">
          Group A/B/C representation vs. statutory quota (SC 15%, ST 7.5%, OBC 27%), by year. The Safai Karamchari
          sub-category within Group C is kept separate — folding it in would hide how concentrated its SC share is.
        </p>
        {dopt.loading && <p className="loading">Loading…</p>}
        {dopt.error && <p className="error-text">{dopt.error}</p>}
        {dopt.data?.map((yearRow) => (
          <div key={yearRow.year} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13.5, marginBottom: 2 }}>
              As on {yearRow.data_as_on}
              {yearRow.coverage_gap && (
                <span className="gap-flag"> — coverage gap: only {yearRow.ministries_reporting} ministries reporting</span>
              )}
            </h3>
            <p className="card-note" style={{ marginBottom: 8 }}>
              Total employees covered: {yearRow.groups.Total.total.toLocaleString("en-IN")}
              {yearRow.coverage_gap && " (not comparable to full-coverage years)"}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={GROUP_ORDER.map((g) => ({
                  group: GROUP_LABEL[g],
                  SC: yearRow.groups[g].sc_pct,
                  ST: yearRow.groups[g].st_pct,
                  OBC: yearRow.groups[g].obc_pct,
                  "General/Other": yearRow.groups[g].general_pct,
                }))}
                margin={{ top: 10, right: 20, bottom: 0, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={44}
                  unit="%"
                  label={{
                    value: "% of posts held",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    fill: "var(--color-text-muted)",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                <ReferenceLine y={yearRow.statutory_quotas.sc_pct} stroke={CATEGORY_COLOR.SC} strokeDasharray="3 3" />
                <ReferenceLine y={yearRow.statutory_quotas.st_pct} stroke={CATEGORY_COLOR.ST} strokeDasharray="3 3" />
                <ReferenceLine y={yearRow.statutory_quotas.obc_pct} stroke={CATEGORY_COLOR.OBC} strokeDasharray="3 3" />
                <ReferenceLine y={yearRow.population_share.sc_pct} stroke={CATEGORY_COLOR.SC} strokeDasharray="1 3" strokeWidth={1.5} />
                <ReferenceLine y={yearRow.population_share.st_pct} stroke={CATEGORY_COLOR.ST} strokeDasharray="1 3" strokeWidth={1.5} />
                <Bar dataKey="SC" fill={CATEGORY_COLOR.SC} />
                <Bar dataKey="ST" fill={CATEGORY_COLOR.ST} />
                <Bar dataKey="OBC" fill={CATEGORY_COLOR.OBC} />
                <Bar dataKey="General/Other" fill={CATEGORY_COLOR.General} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}

        {dopt.data && dopt.data.length > 1 && (() => {
          const first = dopt.data![0];
          const last = dopt.data![dopt.data!.length - 1];
          const scGapFirst = first.statutory_quotas.sc_pct - first.groups.A.sc_pct;
          const scGapLast = last.statutory_quotas.sc_pct - last.groups.A.sc_pct;
          const stGapFirst = first.statutory_quotas.st_pct - first.groups.A.st_pct;
          const stGapLast = last.statutory_quotas.st_pct - last.groups.A.st_pct;
          return (
            <GraphVerdict direction="down" tone="positive">
              Group A (senior) gap to quota narrowing: SC {scGapFirst.toFixed(2)}→{scGapLast.toFixed(2)} pts, ST{" "}
              {stGapFirst.toFixed(2)}→{stGapLast.toFixed(2)} pts ({first.year}–{last.year}, 2021 excluded — coverage
              gap) — but still below quota in every year shown
            </GraphVerdict>
          );
        })()}

        <p className="card-note" style={{ marginTop: 10 }}>
          Dashed lines mark the statutory quota for each category (SC 15%, ST 7.5%); the fainter dotted lines mark
          SC/ST's projected share of India's population <em>in that year</em> (compound growth extrapolated from the
          2001/2011 censuses, not a flat 2011 figure — see <Link to="/data-sources">Data Sources</Link>). Notice the
          quota itself sits <em>below</em> population share in every year shown, and the gap widens over time as
          population share keeps growing while the quota stays fixed — so "meeting quota" is a lower, and slowly
          falling, bar relative to full proportional representation. No population-share line is shown for OBC: the
          census hasn't enumerated caste beyond SC/ST since 1931, so no projectable figure exists to plot.
        </p>
        <p className="card-note">
          Note SC/ST sitting below quota in Group A (senior roles) while above quota in Group C (junior roles) — the
          "tapering" pattern — across every year shown. General/Other is a derived residual (DoPT doesn't report it
          directly) and includes EWS, since DoPT doesn't break EWS out separately — notice it runs the opposite
          direction of SC/ST, highest in Group A and lowest in Group C.
        </p>
      </div>

      <div className="caveat-banner">
        <strong>EWS (10% quota, since 2019) has no published representation data</strong> in any DoPT report checked
        — a genuine, government-acknowledged gap, not a missing chart here.
      </div>
    </div>
  );
}
