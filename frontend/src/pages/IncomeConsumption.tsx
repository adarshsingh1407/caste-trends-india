import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { MpceData } from "../types/data";

const YEARS = ["2004-05", "2009-10", "2011-12", "2022-23"] as const;

function GapChart({ data, sector }: { data: MpceData; sector: "rural" | "urban" }) {
  const chartData = YEARS.map((year) => ({
    year,
    ST: data.pct_gap_from_average[sector][year].ST,
    SC: data.pct_gap_from_average[sector][year].SC,
    OBC: data.pct_gap_from_average[sector][year].OBC,
    Others: data.pct_gap_from_average[sector][year].Others,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={44} unit="%" />
        <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`} />
        <Line type="monotone" dataKey="ST" stroke={CATEGORY_COLOR.ST} strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="SC" stroke={CATEGORY_COLOR.SC} strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="OBC" stroke={CATEGORY_COLOR.OBC} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Others" stroke={CATEGORY_COLOR.Others} strokeWidth={2} dot={{ r: 3 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function IncomeConsumption() {
  const { data, loading, error } = useJsonData<MpceData>("data/consumption/mpce_by_social_group.json");

  return (
    <div>
      <h1 className="page-title">Income &amp; Consumption</h1>
      <p className="page-subtitle">
        Monthly Per Capita Consumption Expenditure (MPCE) by social group — the financial-strength proxy this
        dashboard's education and employment tracks explicitly are not. Sourced from official NSS/HCES surveys.
      </p>

      <div className="caveat-banner">
        <strong>This is consumption, not income or wealth.</strong> MPCE measures what households spend, not what
        they earn or own — it doesn't capture land, assets, savings, or debt. It also isn't the same axis as the
        crime or representation tracks; read this alongside them, not as confirming or explaining either.
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="caveat-banner">
            <strong>11-year gap in official data, and a methodology change.</strong> {data.critical_caveat}
          </div>

          <div className="card">
            <h2>Gap from average MPCE, rural</h2>
            <ChartHelp>
              <p>
                Line chart — each line is one group's % difference from the all-group average, same year, same
                sector. 0% would mean spending exactly at the average; negative means below average. A line moving
                toward 0% is narrowing the gap, not necessarily rising in absolute rupee terms.
              </p>
            </ChartHelp>
            <p className="card-note">
              Each group's average MPCE as a % difference from the all-social-groups average, same year, same
              sector. Negative = below average.
            </p>
            <GapChart data={data} sector="rural" />
            {(() => {
              const first = data.pct_gap_from_average.rural["2004-05"];
              const last = data.pct_gap_from_average.rural["2022-23"];
              return (
                <GraphVerdict direction="up" tone="positive">
                  Gap narrowing (less negative): ST {first.ST}%→{last.ST}%, SC {first.SC}%→{last.SC}% (2004-05–2022-23,
                  but see methodology caveat above)
                </GraphVerdict>
              );
            })()}
          </div>

          <div className="card">
            <h2>Gap from average MPCE, urban</h2>
            <ChartHelp>
              <p>
                Same measure as the rural chart above — % difference from the all-group average, urban sector this
                time. 0% is average; a line closer to 0% is a smaller gap, regardless of which direction it started
                from.
              </p>
            </ChartHelp>
            <p className="card-note">
              Same measure, urban sector. Note SC has historically been the <em>most</em> below-average group in
              urban areas — more so than ST — the reverse of the rural pattern.
            </p>
            <GapChart data={data} sector="urban" />
            {(() => {
              const first = data.pct_gap_from_average.urban["2004-05"];
              const last = data.pct_gap_from_average.urban["2022-23"];
              return (
                <GraphVerdict direction="up" tone="positive">
                  Gap narrowing (less negative): ST {first.ST}%→{last.ST}%, SC {first.SC}%→{last.SC}% (2004-05–2022-23,
                  but see methodology caveat above)
                </GraphVerdict>
              );
            })()}
          </div>

          <div className="card">
            <h2>Average MPCE in rupees, latest survey (2022-23)</h2>
            <ChartHelp>
              <p>
                Actual rupee amounts (not %), for the latest survey only, split rural/urban. Compare each row directly
                against the "All groups" row to see the absolute gap in rupees — the two charts above show this same
                gap as a %, over time.
              </p>
            </ChartHelp>
            <p className="card-note">{data.absolute_mpce_rs.note}</p>
            <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Social group</th>
                  <th>Rural MPCE (₹)</th>
                  <th>Urban MPCE (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(["ST", "SC", "OBC", "Others"] as const).map((g) => (
                  <tr key={g}>
                    <td>{g}</td>
                    <td>₹{data.absolute_mpce_rs["2022_23"].rural[g].toLocaleString("en-IN")}</td>
                    <td>₹{data.absolute_mpce_rs["2022_23"].urban[g].toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                <tr>
                  <td>All groups</td>
                  <td>₹{data.absolute_mpce_rs["2022_23"].rural.all?.toLocaleString("en-IN")}</td>
                  <td>₹{data.absolute_mpce_rs["2022_23"].urban.all?.toLocaleString("en-IN")}</td>
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
