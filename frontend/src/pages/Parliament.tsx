import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { LokSabhaData } from "../types/data";

export function Parliament() {
  const { data, loading, error } = useJsonData<LokSabhaData>("data/parliament/lok_sabha_reserved_seats.json");

  return (
    <div>
      <h1 className="page-title">Parliamentary Representation</h1>
      <p className="page-subtitle">
        SC/ST seat reservation in the Lok Sabha under Article 330 — a structural entitlement, not an annual trend.
        It only changes at delimitation events, which are infrequent.
      </p>

      <div className="caveat-banner">
        <strong>This is reserved-seat allocation, not actual elected representation.</strong> SC/ST candidates also
        win unreserved/general seats, so total SC/ST representation in the Lok Sabha exceeds these figures — no
        official, continuously-updated dataset compiling that broader number (across every winning candidate, every
        election) was found. These numbers describe the constitutional entitlement only.
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="card">
            <h2>Reserved seats by delimitation era</h2>
            <ChartHelp>
              <p>
                Bar chart, one bar pair (SC, ST) per delimitation era — a period during which seat allocation stayed
                fixed. Height = reserved seats as a % of all 543 Lok Sabha seats. This changes only when
                constituencies are redrawn nationally (last: 2008), not year to year, so don't expect movement
                between elections within the same era.
              </p>
            </ChartHelp>
            <p className="card-note">
              Total Lok Sabha strength has been frozen at 543 since 1977. Only the SC/ST reserved-seat allocation
              among states changed at the 2008 delimitation, based on the 2001 Census — frozen again until after the
              next census following 2026.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.delimitation_eras.map((era) => ({
                  era: era.era_label.split(" (")[0],
                  SC: era.sc_pct_of_seats,
                  ST: era.st_pct_of_seats,
                }))}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="era" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={40} unit="%" />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="SC" fill={CATEGORY_COLOR.SC} />
                <Bar dataKey="ST" fill={CATEGORY_COLOR.ST} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>

            {(() => {
              const first = data.delimitation_eras[0];
              const last = data.delimitation_eras[data.delimitation_eras.length - 1];
              return (
                <GraphVerdict direction="up" tone="positive">
                  Seat share risen in line with population growth: SC {first.sc_pct_of_seats}%→
                  {last.sc_pct_of_seats}%, ST {first.st_pct_of_seats}%→{last.st_pct_of_seats}% — but this changes
                  only at delimitation events, not year by year
                </GraphVerdict>
              );
            })()}

            <div className="table-scroll">
            <table className="data-table" style={{ marginTop: 20 }}>
              <thead>
                <tr>
                  <th>Era</th>
                  <th>Applicable elections</th>
                  <th>Total seats</th>
                  <th>SC reserved</th>
                  <th>SC % of seats</th>
                  <th>ST reserved</th>
                  <th>ST % of seats</th>
                </tr>
              </thead>
              <tbody>
                {data.delimitation_eras.map((era) => (
                  <tr key={era.era_label}>
                    <td>{era.era_label}</td>
                    <td>{era.applicable_elections}</td>
                    <td>{era.total_seats}</td>
                    <td>{era.sc_reserved_seats}</td>
                    <td>{era.sc_pct_of_seats}%</td>
                    <td>{era.st_reserved_seats}</td>
                    <td>{era.st_pct_of_seats}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          <div className="card">
            <h2>What's not covered here, and why</h2>
            <p className="card-note" style={{ marginBottom: 12 }}>
              Same standard as the rest of this dashboard: confirmed dead ends are stated plainly, not left as silent
              gaps.
            </p>
            <p style={{ fontSize: 13, marginBottom: 10 }}>
              <strong>Rajya Sabha:</strong> {data.scope_notes.rajya_sabha}
            </p>
            <p style={{ fontSize: 13, marginBottom: 10 }}>
              <strong>OBC:</strong> {data.scope_notes.obc}
            </p>
            <p style={{ fontSize: 13, marginBottom: 10 }}>
              <strong>State Assemblies:</strong> {data.scope_notes.state_assemblies}
            </p>
            <p style={{ fontSize: 13 }}>
              <strong>Actual elected representation beyond reserved seats:</strong>{" "}
              {data.scope_notes.actual_elected_beyond_reserved_seats}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
