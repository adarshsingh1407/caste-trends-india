import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { CrimeYearRow, ConvictionDisposalData } from "../types/data";

type Metric = "total_cases" | "rate_per_lakh_population";

export function CrimeTrends() {
  const { data, loading, error } = useJsonData<CrimeYearRow[]>("data/crime/sc_st_crime_national.json");
  const conviction = useJsonData<ConvictionDisposalData>("data/crime/sc_st_conviction_disposal.json");
  const [metric, setMetric] = useState<Metric>("total_cases");

  const chartData = useMemo(() => {
    if (!data) return [];
    const years = Array.from(new Set(data.map((r) => r.year))).sort();
    return years.map((year) => {
      const sc = data.find((r) => r.category === "SC" && r.year === year);
      const st = data.find((r) => r.category === "ST" && r.year === year);
      return {
        year,
        SC: sc?.[metric] ?? null,
        ST: st?.[metric] ?? null,
      };
    });
  }, [data, metric]);

  // Rate-per-lakh verdict always compares 2017 (first post-schema-break year) to the
  // latest year, regardless of which metric toggle is active -- keeps the verdict stable
  // and comparable rather than flipping definitions with the raw/rate toggle.
  const rateDelta = useMemo(() => {
    if (!data) return null;
    const latestYear = Math.max(...data.map((r) => r.year));
    const sc17 = data.find((r) => r.category === "SC" && r.year === 2017)?.rate_per_lakh_population;
    const scLatest = data.find((r) => r.category === "SC" && r.year === latestYear)?.rate_per_lakh_population;
    const st17 = data.find((r) => r.category === "ST" && r.year === 2017)?.rate_per_lakh_population;
    const stLatest = data.find((r) => r.category === "ST" && r.year === latestYear)?.rate_per_lakh_population;
    if (!sc17 || !scLatest || !st17 || !stLatest) return null;
    return {
      scPct: ((scLatest - sc17) / sc17) * 100,
      stPct: ((stLatest - st17) / st17) * 100,
      latestYear,
    };
  }, [data]);

  return (
    <div>
      <h1 className="page-title">Crime &amp; Atrocity Trends</h1>
      <p className="page-subtitle">
        Registered cases against Scheduled Castes and Scheduled Tribes, national totals, 2016–2022. No OBC category
        exists (no equivalent legal atrocities act); no city-tier breakdown exists (NCRB doesn't produce one).
      </p>

      <div className="caveat-banner">
        <strong>Cases registered, not incidents occurred.</strong> Undercounting of caste-based crime is
        well-documented — treat every number here as a lower bound. The category definitions underlying this data
        changed with the 2018 SC/ST PoA Act amendment (marked below), so the 2016 point isn't strictly
        apples-to-apples with 2017 onward.
      </div>

      <div className="card">
        <h2>National totals by year</h2>
        <ChartHelp>
          <p>
            Line chart, one line per group (SC, ST), years along the bottom. <strong>Raw cases</strong> is the actual
            count of registered cases each year — bigger just means more cases were filed, not a bigger population.{" "}
            <strong>Rate per lakh population</strong> divides that count by each group's population (per 100,000
            people), so you can compare SC to ST fairly despite their very different sizes, and compare across years
            even as population grows.
          </p>
          <p>
            A rising line means more cases (or a higher rate) were <em>registered</em> — not necessarily that more
            crime occurred (see the caveat above).
          </p>
        </ChartHelp>
        <p className="card-note">
          Raw counts favor states/years with larger populations. Rate per lakh normalizes by SC/ST population
          (post-2011 years use a projected population — see About this data).
        </p>

        <div className="toggle-group">
          <button className={metric === "total_cases" ? "active" : ""} onClick={() => setMetric("total_cases")}>
            Raw cases
          </button>
          <button
            className={metric === "rate_per_lakh_population" ? "active" : ""}
            onClick={() => setMetric("rate_per_lakh_population")}
          >
            Rate per lakh population
          </button>
        </div>

        {loading && <p className="loading">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 18, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12.5 }}
                label={{ value: "Year", position: "insideBottom", offset: -12, fontSize: 11.5, fill: "var(--color-text-muted)" }}
              />
              <YAxis
                tick={{ fontSize: 12.5 }}
                width={60}
                label={{
                  value: metric === "rate_per_lakh_population" ? "Rate per lakh population" : "Cases registered",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11.5,
                  fill: "var(--color-text-muted)",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip
                contentStyle={{ fontSize: 13, borderRadius: 8 }}
                formatter={(value: number) =>
                  metric === "rate_per_lakh_population" ? value?.toFixed(2) : value?.toLocaleString("en-IN")
                }
              />
              <ReferenceLine
                x={2017}
                stroke="var(--color-caveat-border)"
                strokeDasharray="4 4"
                label={{ value: "2018 PoA Act amendment", position: "insideTopLeft", fontSize: 11, fill: "var(--color-caveat-text)" }}
              />
              <Line type="monotone" dataKey="SC" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ST" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="legend-row">
          <span>
            <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} />
            SC
          </span>
          <span>
            <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} />
            ST
          </span>
        </div>

        {rateDelta && (
          <GraphVerdict direction="up" tone="negative">
            Rate per lakh risen: SC +{rateDelta.scPct.toFixed(0)}%, ST +{rateDelta.stPct.toFixed(0)}% (2017–
            {rateDelta.latestYear})
          </GraphVerdict>
        )}
      </div>

      <div className="card">
        <h2>Conviction rate &amp; case backlog, 2018–2022</h2>
        <ChartHelp>
          <p>
            Line chart, % on the vertical axis. <strong>Conviction rate</strong> is the share of decided cases ending
            in conviction, not the number of cases. A rising line is generally good news — but read it with the
            backlog note below: a rising conviction rate can still coexist with a growing pile of unresolved cases if
            new cases arrive faster than courts close them.
          </p>
        </ChartHelp>
        <p className="card-note">
          A separate official compilation (Rajya Sabha reply, MHA, July 2024) from the crime totals above — see
          About this data. Shows whether registered cases actually result in conviction, not just how many are
          registered.
        </p>
        {conviction.loading && <p className="loading">Loading…</p>}
        {conviction.error && <p className="error-text">{conviction.error}</p>}
        {conviction.data && (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={conviction.data.sc.map((row, i) => ({
                  year: row.year,
                  "SC conviction rate": row.conviction_rate_pct,
                  "ST conviction rate": conviction.data!.st[i].conviction_rate_pct,
                }))}
                margin={{ top: 10, right: 20, bottom: 18, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12.5 }}
                  label={{ value: "Year", position: "insideBottom", offset: -12, fontSize: 11.5, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12.5 }}
                  width={48}
                  unit="%"
                  label={{
                    value: "Conviction rate (%)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11.5,
                    fill: "var(--color-text-muted)",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="SC conviction rate" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ST conviction rate" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>

            <GraphVerdict direction="up" tone="positive">
              Conviction rate risen: SC +
              {(conviction.data.sc[conviction.data.sc.length - 1].conviction_rate_pct - conviction.data.sc[0].conviction_rate_pct).toFixed(1)}
              pts, ST +
              {(conviction.data.st[conviction.data.st.length - 1].conviction_rate_pct - conviction.data.st[0].conviction_rate_pct).toFixed(1)}
              pts (2018–2022) — but see backlog note below
            </GraphVerdict>

            <p className="card-note" style={{ marginTop: 10 }}>
              Conviction rate as reported by the source (methodology not detailed in the reply). "Cases pending
              trial at year end" is a cumulative backlog, not that year's new cases — it grew from{" "}
              {conviction.data.sc[0].cases_pending_trial_year_end.toLocaleString("en-IN")} to{" "}
              {conviction.data.sc[conviction.data.sc.length - 1].cases_pending_trial_year_end.toLocaleString("en-IN")}{" "}
              for SC over this period, i.e. cases are entering the system faster than courts are resolving them.
            </p>
            <div className="table-scroll">
            <table className="data-table" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>SC conviction %</th>
                  <th>SC chargesheet %</th>
                  <th>SC pending trial (backlog)</th>
                  <th>ST conviction %</th>
                  <th>ST chargesheet %</th>
                  <th>ST pending trial (backlog)</th>
                </tr>
              </thead>
              <tbody>
                {conviction.data.sc.map((row, i) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{row.conviction_rate_pct}%</td>
                    <td>{row.chargesheet_rate_pct}%</td>
                    <td>{row.cases_pending_trial_year_end.toLocaleString("en-IN")}</td>
                    <td>{conviction.data!.st[i].conviction_rate_pct}%</td>
                    <td>{conviction.data!.st[i].chargesheet_rate_pct}%</td>
                    <td>{conviction.data!.st[i].cases_pending_trial_year_end.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      {data && (
        <div className="card">
          <h2>Full data</h2>
          <ChartHelp>
            <p>
              Same numbers as the chart above, one row per year, for checking exact values.{" "}
              <strong>Population basis</strong> flags which years use the actual Census count vs. a projected
              estimate (see Data Sources) — this affects the "rate per lakh" column but not raw cases.
            </p>
          </ChartHelp>
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>SC cases</th>
                <th>SC per lakh</th>
                <th>ST cases</th>
                <th>ST per lakh</th>
                <th>Population basis</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => {
                const sc = data.find((r) => r.category === "SC" && r.year === row.year);
                const st = data.find((r) => r.category === "ST" && r.year === row.year);
                return (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{sc?.total_cases.toLocaleString("en-IN")}</td>
                    <td>{sc?.rate_per_lakh_population?.toFixed(2)}</td>
                    <td>{st?.total_cases.toLocaleString("en-IN")}</td>
                    <td>{st?.rate_per_lakh_population?.toFixed(2)}</td>
                    <td>{sc?.population_is_projected ? "Projected" : "Census"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
