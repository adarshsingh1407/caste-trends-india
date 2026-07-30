import {
  Bar,
  BarChart,
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
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { PopulationShareTrendData, PopulationDistributionEstimateData } from "../types/data";

export function Population() {
  const population = useJsonData<PopulationShareTrendData>("data/representation/population_share_trend.json");
  const distribution = useJsonData<PopulationDistributionEstimateData>(
    "data/representation/population_distribution_estimate.json",
  );

  return (
    <div>
      <h1 className="page-title">Population Share</h1>
      <p className="page-subtitle">
        Reference context for the enrollment and employment gaps on the Education &amp; Employment page — both
        compare against this same population-share benchmark. Shown here for context only, with no trend verdict of
        its own.
      </p>

      <div className="caveat-banner">
        <strong>SC/ST population share can be projected forward; OBC/General cannot.</strong> India's census has
        measured SC/ST population at every count since 1951, most recently in 2011 — enough to derive a growth rate
        and project it forward. It hasn't enumerated caste beyond SC/ST since 1931, so there's no equivalent trend
        for OBC or General: the estimates below are two old, non-comparable guesses, not a projectable series.
      </div>

      {distribution.loading && <p className="loading">Loading…</p>}
      {distribution.error && <p className="error-text">{distribution.error}</p>}

      {distribution.data && (
        <div className="card">
          <h2>Estimated population distribution — SC, ST, OBC, General</h2>
          <ChartHelp>
            <p>
              Horizontal 100%-stacked bar, two rows — a single snapshot, not a trend. SC and ST segments are the
              exact 2011 Census share in both rows. OBC and General are two old, non-comparable estimates shown side
              by side, never averaged into one "best guess": the top row uses NSSO's ~41% OBC estimate, the bottom
              uses the Mandal Commission's ~52% estimate. Each row's General segment is just the leftover (100% −
              SC% − ST% − OBC%) under that row's own OBC assumption — so the two rows aren't comparable
              point-for-point beyond their shared SC/ST segments.
            </p>
          </ChartHelp>
          <p className="card-note">{distribution.data.note}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              layout="vertical"
              data={distribution.data.scenarios.map((s) => ({
                label: s.id === "nsso" ? "NSSO" : "Mandal Commission",
                SC: s.sc_pct,
                ST: s.st_pct,
                OBC: s.obc_pct,
                General: s.general_pct,
              }))}
              margin={{ top: 10, right: 20, bottom: 18, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 12 }}
                label={{ value: "% of population", position: "insideBottom", offset: -8, fontSize: 11.5, fill: "var(--color-text-muted)" }}
              />
              <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="SC" stackId="a" fill={CATEGORY_COLOR.SC} />
              <Bar dataKey="ST" stackId="a" fill={CATEGORY_COLOR.ST} />
              <Bar dataKey="OBC" stackId="a" fill={CATEGORY_COLOR.OBC} />
              <Bar dataKey="General" stackId="a" fill={CATEGORY_COLOR.General} />
            </BarChart>
          </ResponsiveContainer>
          <div className="legend-row">
            <span>
              <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} /> SC ({distribution.data.scenarios[0].sc_pct}%, both rows)
            </span>
            <span>
              <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} /> ST ({distribution.data.scenarios[0].st_pct}%, both rows)
            </span>
            <span>
              <span className="swatch" style={{ background: CATEGORY_COLOR.OBC }} /> OBC (estimated)
            </span>
            <span>
              <span className="swatch" style={{ background: CATEGORY_COLOR.General }} /> General/Other (residual)
            </span>
          </div>
          {distribution.data.scenarios.map((s, i) => (
            <p key={s.id} className="card-note" style={i === 0 ? { marginTop: 10 } : undefined}>
              <strong>{s.obc_source}:</strong> OBC {s.obc_pct}% → General/Other ≈{s.general_pct}%.
            </p>
          ))}
        </div>
      )}

      {population.loading && <p className="loading">Loading…</p>}
      {population.error && <p className="error-text">{population.error}</p>}

      {population.data && (
        <div className="card">
          <h2>SC/ST population share, for reference</h2>
          <ChartHelp>
            <p>
              Line chart — SC and ST's share (%) of India's total population, by year. 2011 is the measured Census
              figure; every year after that is a modeled estimate (see the dashed marker), not a new census count —
              India hasn't held one since 2011. This chart doesn't show a "trend" so much as a single measured point
              extrapolated forward — it's shown here as reference context for the enrollment and employment gaps on
              the Education &amp; Employment page, both of which compare against this same population-share
              benchmark.
            </p>
          </ChartHelp>
          <p className="card-note">{population.data.source.methodology}</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={population.data.years} margin={{ top: 10, right: 20, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                label={{ value: "Year", position: "insideBottom", offset: -8, fontSize: 11.5, fill: "var(--color-text-muted)" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                width={44}
                unit="%"
                label={{
                  value: "% of population",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11.5,
                  fill: "var(--color-text-muted)",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <ReferenceLine
                x={2011}
                stroke="var(--color-caveat-border)"
                strokeDasharray="4 4"
                label={{ value: "2011 Census — measured; after this, modeled", position: "insideTopLeft", fontSize: 11, fill: "var(--color-caveat-text)" }}
              />
              <Line type="monotone" dataKey="sc_pct" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="st_pct" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="legend-row">
            <span>
              <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} /> SC
            </span>
            <span>
              <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} /> ST
            </span>
          </div>
          <p className="card-note" style={{ marginTop: 10 }}>
            {population.data.obc_general_note}
          </p>
        </div>
      )}

      {population.data && (
        <div className="card">
          <h2>Sources</h2>
          {Object.entries(population.data.sources).map(([key, src]) => (
            <p key={key} style={{ fontSize: 12.5, marginBottom: 8 }}>
              <strong>{key.replace(/_/g, "-")}:</strong> {src.report} ({src.publisher}) —{" "}
              <a href={src.url} target="_blank" rel="noreferrer">
                source
              </a>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
