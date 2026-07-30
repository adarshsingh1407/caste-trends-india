import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { PlfsUnemploymentData } from "../types/data";

export function Unemployment() {
  const { data, loading, error } = useJsonData<PlfsUnemploymentData>("data/employment/plfs_unemployment.json");

  return (
    <div>
      <h1 className="page-title">Unemployment Rate (PLFS)</h1>
      <p className="page-subtitle">
        Unemployment rate by social group, national — a labour-market outcome, distinct from the government-job
        representation tracked on the Education &amp; Employment page.
      </p>

      <div className="caveat-banner">
        <strong>2020-21 isn't in this series.</strong> None of the three official PLFS Annual Reports used to build
        this chart carries a year-by-year comparison table reaching back that far, so this dashboard skips it rather
        than estimate it. The six years actually shown (2017-18, 2018-19, 2019-20, 2021-22, 2022-23, 2023-24) are
        plotted at even spacing regardless of the 2-year gap — read the x-axis as a sequence of surveyed years, not a
        strictly proportional timeline.
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="card">
            <h2>Unemployment rate by social group, 2017-18–2023-24</h2>
            <ChartHelp>
              <p>
                Line chart — % of the labour force that's unemployed (usual status), one line per social group.
                "Rural+urban" is PLFS's own national combined estimate, not a simple average of separate rural and
                urban figures. Falling lines mean a smaller share of each group's labour force was unemployed that
                year — note the overall decline shown here happened across every group, not just one.
              </p>
            </ChartHelp>
            <p className="card-note">{data.methodology_note}</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.years.map((y) => ({ year: y.year, ...y.ur_pct }))}
                margin={{ top: 10, right: 20, bottom: 18, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Survey year", position: "insideBottom", offset: -12, fontSize: 11.5, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={44}
                  unit="%"
                  label={{
                    value: "Unemployment rate (%)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11.5,
                    fill: "var(--color-text-muted)",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="ST" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SC" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="OBC" stroke={CATEGORY_COLOR.OBC} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Others" stroke={CATEGORY_COLOR.Others} strokeWidth={2} dot={{ r: 3 }} />
                <Line
                  type="monotone"
                  dataKey="All"
                  stroke={CATEGORY_COLOR.All}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="legend-row">
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} /> ST
              </span>
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} /> SC
              </span>
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.OBC }} /> OBC
              </span>
              <span>
                <span className="swatch" style={{ background: CATEGORY_COLOR.Others }} /> Others
              </span>
              <span style={{ fontStyle: "italic" }}>
                <span className="swatch" style={{ background: CATEGORY_COLOR.All }} /> All (dashed)
              </span>
            </div>
            {(() => {
              const first = data.years[0];
              const last = data.years[data.years.length - 1];
              return (
                <GraphVerdict direction="down" tone="positive">
                  Fell across every group, {first.year}–{last.year}: ST {first.ur_pct.ST}%→{last.ur_pct.ST}%, SC{" "}
                  {first.ur_pct.SC}%→{last.ur_pct.SC}%, OBC {first.ur_pct.OBC}%→{last.ur_pct.OBC}%, Others{" "}
                  {first.ur_pct.Others}%→{last.ur_pct.Others}% — but 2020-21 (COVID) isn't in this series, see caveat
                  above
                </GraphVerdict>
              );
            })()}
          </div>

          <div className="card">
            <h2>Full data</h2>
            <ChartHelp>
              <p>Same numbers as the chart above, one row per year, for checking exact values.</p>
            </ChartHelp>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>ST</th>
                    <th>SC</th>
                    <th>OBC</th>
                    <th>Others</th>
                    <th>All</th>
                  </tr>
                </thead>
                <tbody>
                  {data.years.map((y) => (
                    <tr key={y.year}>
                      <td>{y.year}</td>
                      <td>{y.ur_pct.ST}%</td>
                      <td>{y.ur_pct.SC}%</td>
                      <td>{y.ur_pct.OBC}%</td>
                      <td>{y.ur_pct.Others}%</td>
                      <td>{y.ur_pct.All}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>Sources</h2>
            <p className="card-note">{data.scope_note}</p>
            {data.years
              .map((y) => y.source)
              .filter((src, i, arr) => arr.findIndex((s) => s.report === src.report) === i)
              .map((src) => (
                <p key={src.report} style={{ fontSize: 12.5, marginBottom: 8 }}>
                  <strong>{src.report}</strong> ({src.publisher}) — {src.table_location} —{" "}
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
