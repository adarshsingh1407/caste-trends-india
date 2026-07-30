import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { AcademicWealthConcentrationData, AidisData } from "../types/data";

const GROUPS = ["ST", "SC", "OBC", "Others"] as const;

export function Wealth() {
  const { data, loading, error } = useJsonData<AidisData>("data/wealth/aidis.json");
  const academic = useJsonData<AcademicWealthConcentrationData>("data/wealth/academic_wealth_concentration.json");

  return (
    <div>
      <h1 className="page-title">Land, Assets &amp; Debt</h1>
      <p className="page-subtitle">
        Household asset value and indebtedness by social group (AIDIS/NSSO) — the land/wealth proxy this dashboard's
        Income page (consumption) explicitly is not. This is the closest official measure of financial strength by
        caste available.
      </p>

      <div className="caveat-banner">
        <strong>Assets, debt, and consumption (Income page) measure different things.</strong> A household can have
        low consumption but high land value, or vice versa. Read this page alongside Income, not as confirming it.
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="caveat-banner">{data.scope_note}</div>

          <div className="card">
            <h2>Average Value of Assets (AVA) per household, 2019</h2>
            <ChartHelp>
              <p>
                Bar chart, rupees (in lakhs — 1 lakh = 100,000) on the vertical axis. This is the average value of
                everything a household in that group owns (land, buildings, gold, etc.), not their income or
                spending. A single 2019 snapshot — there's no earlier comparable AIDIS round in this pipeline, so no
                trend line is possible.
              </p>
            </ChartHelp>
            <p className="card-note">{data.assets_2019_rs.note}</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={GROUPS.map((g) => ({
                  group: g,
                  Rural: data.assets_2019_rs.rural[g].ava_rs,
                  Urban: data.assets_2019_rs.urban[g].ava_rs,
                }))}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="group" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="Rural" fill="var(--color-rural)" />
                <Bar dataKey="Urban" fill="var(--color-urban)" />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
            {(() => {
              const scVsOthersRural = Math.round(
                (data.assets_2019_rs.rural.SC.ava_rs / data.assets_2019_rs.rural.Others.ava_rs) * 100,
              );
              const scVsOthersUrban = Math.round(
                (data.assets_2019_rs.urban.SC.ava_rs / data.assets_2019_rs.urban.Others.ava_rs) * 100,
              );
              return (
                <GraphVerdict direction="down" tone="negative">
                  SC asset value is only ~{scVsOthersRural}% (rural) / ~{scVsOthersUrban}% (urban) of "Others" — a
                  single 2019 snapshot, not a trend (see scope note above)
                </GraphVerdict>
              );
            })()}
            <p className="card-note" style={{ marginTop: 10 }}>
              ST and SC households hold roughly a third of the asset value of "Others" households in both rural and
              urban India — a starker gap than either the education or consumption tracks show. OBC sits between
              SC/ST and Others in both sectors.
            </p>
            <p className="card-note">
              <strong>Is this gap narrowing, and how fast?</strong> This dashboard's own AIDIS data is a single 2019
              snapshot, so it can't say — see the multi-round academic trend below instead.
            </p>
          </div>

          {academic.data && (
            <div className="card">
              <h2>Wealth concentration over time, by caste</h2>
              <ChartHelp>
                <p>
                  Line chart. Each line is one group's share of India's total household wealth, minus its share of
                  India's total population, in percentage points. Zero (the dashed reference line) would mean that
                  group holds exactly its "fair share" of total wealth relative to its population size. A line moving{" "}
                  <em>further</em> from zero means wealth concentration is worsening for that group; moving{" "}
                  <em>toward</em> zero means it's improving. FC (Forward Castes) sits above zero — it holds more
                  wealth than its population share — while OBC, SC, and ST sit below zero. OBC and FC only have data
                  from 2002 onward: pre-1999 surveys didn't separate them from the rest of the non-SC/ST population.
                </p>
              </ChartHelp>
              <p className="card-note">
                Source: {academic.data.wealth_concentration_gap.source.study.split("(")[0].trim()} (
                {academic.data.wealth_concentration_gap.source.table_reference}) —{" "}
                <a href={academic.data.wealth_concentration_gap.source.url} target="_blank" rel="noreferrer">
                  source PDF
                </a>
                . National (all-India) figures, computed by the source paper from NSS-AIDIS survey rounds.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={academic.data.wealth_concentration_gap.years.map((year, i) => ({
                    year,
                    FC: academic.data!.wealth_concentration_gap.series.FC[i],
                    OBC: academic.data!.wealth_concentration_gap.series.OBC[i],
                    SC: academic.data!.wealth_concentration_gap.series.SC[i],
                    ST: academic.data!.wealth_concentration_gap.series.ST[i],
                  }))}
                  margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 12.5 }} />
                  <YAxis tick={{ fontSize: 12.5 }} width={44} unit="pp" />
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v > 0 ? "+" : ""}${v}pp`} />
                  <ReferenceLine y={0} stroke="var(--color-text-muted)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="FC" stroke={CATEGORY_COLOR.General} strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="OBC" stroke={CATEGORY_COLOR.OBC} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="SC" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="ST" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </LineChart>
              </ResponsiveContainer>
              <GraphVerdict direction="up" tone="negative">
                Gap from proportional wealth share widened for FC (+14.0pp → +18.2pp) and OBC (-7.9pp → -10.2pp,
                2002–2012); SC and ST stayed roughly flat around -10 to -11pp and -1 to -3pp (1991–2012) — none of
                the four groups moved toward zero
              </GraphVerdict>
              <p className="card-note" style={{ marginTop: 10 }}>
                {academic.data.wealth_concentration_gap.source_quote}
              </p>
              <p className="card-note">
                <strong>A second, independent study agrees</strong> —{" "}
                {academic.data.corroborating_study_not_charted.study.split("(")[0].trim()}, "
                {academic.data.corroborating_study_not_charted.source_quote}" This one isn't charted here:{" "}
                {academic.data.corroborating_study_not_charted.why_not_charted.split(". ")[1] ??
                  academic.data.corroborating_study_not_charted.why_not_charted}{" "}
                <a href={academic.data.corroborating_study_not_charted.url} target="_blank" rel="noreferrer">
                  source PDF
                </a>
                .
              </p>
            </div>
          )}

          <div className="card">
            <h2>Indebtedness: 2012-13 vs. 2019</h2>
            <ChartHelp>
              <p>
                Two line charts. <strong>IOI</strong> (Incidence of Indebtedness) is the % of households in that group
                carrying any debt at all. <strong>AOD</strong> (Average Amount of Debt) is the average rupees owed
                among only the indebted households. Neither direction is inherently good or bad on its own — read
                both together with the assets chart above (the caveat banner below explains why low debt isn't
                necessarily good news).
              </p>
            </ChartHelp>
            <p className="card-note">{data.debt_by_year.note}</p>
            <div className="side-by-side">
              <div>
                <h3 style={{ fontSize: 13, marginBottom: 6 }}>Incidence of Indebtedness (IOI %), rural</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={["2012_13", "2019"].map((year) => ({
                      year: year === "2012_13" ? "2012-13" : "2019",
                      ...Object.fromEntries(GROUPS.map((g) => [g, data.debt_by_year[year as "2012_13" | "2019"].rural[g].ioi_pct])),
                    }))}
                    margin={{ top: 6, right: 10, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={32} unit="%" />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    {GROUPS.map((g) => (
                      <Line key={g} type="monotone" dataKey={g} stroke={CATEGORY_COLOR[g]} strokeWidth={2} dot={{ r: 3 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <GraphVerdict
                  direction={
                    data.debt_by_year["2019"].rural.ST.ioi_pct >= data.debt_by_year["2012_13"].rural.ST.ioi_pct
                      ? "up"
                      : "down"
                  }
                  tone="neutral"
                >
                  ST IOI: {data.debt_by_year["2012_13"].rural.ST.ioi_pct}%→{data.debt_by_year["2019"].rural.ST.ioi_pct}%
                  — not a "good/bad" direction, see caveat below
                </GraphVerdict>
              </div>
              <div>
                <h3 style={{ fontSize: 13, marginBottom: 6 }}>Average Amount of Debt (AOD ₹), rural</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={["2012_13", "2019"].map((year) => ({
                      year: year === "2012_13" ? "2012-13" : "2019",
                      ...Object.fromEntries(GROUPS.map((g) => [g, data.debt_by_year[year as "2012_13" | "2019"].rural[g].aod_rs])),
                    }))}
                    margin={{ top: 6, right: 10, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={44} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    {GROUPS.map((g) => (
                      <Line key={g} type="monotone" dataKey={g} stroke={CATEGORY_COLOR[g]} strokeWidth={2} dot={{ r: 3 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <GraphVerdict
                  direction={
                    data.debt_by_year["2019"].rural.ST.aod_rs >= data.debt_by_year["2012_13"].rural.ST.aod_rs
                      ? "up"
                      : "down"
                  }
                  tone="neutral"
                >
                  ST AOD: ₹{data.debt_by_year["2012_13"].rural.ST.aod_rs.toLocaleString("en-IN")}→₹
                  {data.debt_by_year["2019"].rural.ST.aod_rs.toLocaleString("en-IN")} — not a "good/bad" direction,
                  see caveat below
                </GraphVerdict>
              </div>
            </div>
            <p className="card-note" style={{ marginTop: 10 }}>
              <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} /> ST &nbsp;
              <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} /> SC &nbsp;
              <span className="swatch" style={{ background: CATEGORY_COLOR.OBC }} /> OBC &nbsp;
              <span className="swatch" style={{ background: CATEGORY_COLOR.Others }} /> Others
            </p>
          </div>

          <div className="caveat-banner">
            <strong>Low debt is not necessarily good news.</strong> ST households show both the lowest debt
            incidence/amount <em>and</em> by far the lowest asset value (above). Read together, this more plausibly
            reflects exclusion from formal and informal credit markets than financial security — a household with
            little to borrow against, or little access to lenders, can show up as "less indebted" while being worse
            off. Don't read the debt chart in isolation from the assets chart above it.
          </div>

          <div className="card">
            <h2>Debt-to-Asset Ratio, 2019</h2>
            <ChartHelp>
              <p>
                Total debt as a % of total asset value, for each group — combining the debt and assets numbers above
                into one ratio. Higher means more leveraged relative to what a household owns, not necessarily more
                debt in absolute rupees.
              </p>
            </ChartHelp>
            <p className="card-note">{data.debt_asset_ratio_2019_pct.note}</p>
            <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Social group</th>
                  <th>Rural DAR</th>
                  <th>Urban DAR</th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => (
                  <tr key={g}>
                    <td>{g}</td>
                    <td>{data.debt_asset_ratio_2019_pct.rural[g]}%</td>
                    <td>{data.debt_asset_ratio_2019_pct.urban[g]}%</td>
                  </tr>
                ))}
                <tr>
                  <td>All groups</td>
                  <td>{data.debt_asset_ratio_2019_pct.rural.all}%</td>
                  <td>{data.debt_asset_ratio_2019_pct.urban.all}%</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <div className="card">
            <h2>Sources</h2>
            {Object.entries(data.sources).map(([key, src]) => (
              <p key={key} style={{ fontSize: 12.5, marginBottom: 8 }}>
                <strong>{key.replace("_", "-")}:</strong> {src.report} ({src.publisher}) —{" "}
                <a href={src.url} target="_blank" rel="noreferrer">
                  source PDF
                </a>
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
