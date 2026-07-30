import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { UntouchabilityData } from "../types/data";

const GROUP_COLOR: Record<string, string> = {
  Brahmins: "var(--color-general)",
  Forward: "var(--color-all)",
  OBC: "var(--color-obc)",
  SC: "var(--color-sc)",
  ST: "var(--color-st)",
};

export function SocialAttitudes() {
  const { data, loading, error } = useJsonData<UntouchabilityData>("data/attitudes/ihds_untouchability.json");

  return (
    <div>
      <h1 className="page-title">Everyday Discrimination</h1>
      <p className="page-subtitle">
        How common is "soft," everyday caste discrimination — the kind that never becomes a registered case? This
        measures the perpetrator side: households admitting they themselves practice untouchability.
      </p>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="caveat-banner">
            <strong>Why this wasn't sourced by scraping news or forums.</strong> {data.methodology_note}
          </div>

          <div className="caveat-banner">
            <strong>Single snapshot, 2011-12 — not a trend.</strong> {data.source.single_round_caveat}
          </div>

          <div className="card">
            <h2>Who admits to practicing untouchability?</h2>
            <ChartHelp>
              <p>
                Bar chart — one bar per social group, height = % of households in that group who admitted (in a
                2011-12 survey) that they still practice untouchability. This measures who admits to discriminating,
                not who experiences discrimination. Bars are each a separate group's self-report and aren't summable
                into one combined "total affected" figure.
              </p>
            </ChartHelp>
            <p className="card-note">
              "{data.table1_practice_by_social_group.question}" — {data.table1_practice_by_social_group.note}
            </p>
            <p className="card-note">
              "Forward" here means Kshatriya/Vaishya castes only — the paper reports Brahmins as a separate group
              (shown alongside), not folded into "forward"/"upper caste." The two bars aren't summable into a single
              "upper caste" figure: doing so would need each group's share of the survey sample, which the paper
              doesn't report — the same reason this project doesn't estimate an OBC/General population share
              elsewhere (see <Link to="/data-sources">Data Sources</Link>).
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { group: "Brahmins", pct: data.table1_practice_by_social_group.brahmins_pct },
                  { group: "Forward", pct: data.table1_practice_by_social_group.forward_castes_pct },
                  { group: "OBC", pct: data.table1_practice_by_social_group.obc_pct },
                  { group: "SC", pct: data.table1_practice_by_social_group.sc_pct },
                  { group: "ST", pct: data.table1_practice_by_social_group.st_pct },
                ]}
                margin={{ top: 10, right: 20, bottom: 18, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="group"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Social group", position: "insideBottom", offset: -12, fontSize: 11.5, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={44}
                  unit="%"
                  label={{
                    value: "% admitting practice",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11.5,
                    fill: "var(--color-text-muted)",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                <Bar
                  dataKey="pct"
                  fill="var(--color-sc)"
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    return <rect x={x} y={y} width={width} height={height} fill={GROUP_COLOR[payload.group]} rx={3} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
            <GraphVerdict direction="down" tone="negative">
              SC (11%) and ST (17%) report the lowest self-practice rates — but Brahmins (44%), OBC (26%), and
              Forward castes (18%, Kshatriya/Vaishya only) all report higher rates of practicing untouchability,
              mostly against SC/ST. National total: {data.table1_practice_by_social_group.table_total_pct}% (this
              table) — the same paper separately states a{" "}
              {data.table1_practice_by_social_group.prose_headline_total_pct}% headline figure; both are reported as
              they appear in the source.
            </GraphVerdict>
          </div>

          <div className="card">
            <h2>A more specific question: SC entering the kitchen</h2>
            <ChartHelp>
              <p>
                Same bar-chart format as above, but a narrower, concrete question ("would you let an SC person prepare
                food in your kitchen") instead of the abstract "do you practice untouchability." Concrete questions
                like this typically get lower self-admission rates across every group — that's an expected pattern in
                social-attitude surveys, not a data error.
              </p>
            </ChartHelp>
            <p className="card-note">"{data.table2_specific_practice.question}" — {data.table2_specific_practice.note}</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  { group: "Brahmins", pct: data.table2_specific_practice.brahmins_pct },
                  { group: "Forward", pct: data.table2_specific_practice.forward_castes_pct },
                  { group: "OBC", pct: data.table2_specific_practice.obc_pct },
                  { group: "SC", pct: data.table2_specific_practice.sc_pct },
                  { group: "ST", pct: data.table2_specific_practice.st_pct },
                  { group: "Others", pct: data.table2_specific_practice.others_pct },
                ]}
                margin={{ top: 10, right: 20, bottom: 18, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="group"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Social group", position: "insideBottom", offset: -12, fontSize: 11.5, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={44}
                  unit="%"
                  label={{
                    value: "% saying yes",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11.5,
                    fill: "var(--color-text-muted)",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                <Bar
                  dataKey="pct"
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    return (
                      <rect x={x} y={y} width={width} height={height} fill={GROUP_COLOR[payload.group] ?? "var(--color-all)"} rx={3} />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="card-note" style={{ marginTop: 10 }}>
              National total: {data.table2_specific_practice.total_pct}%. Lower across the board than Table 1's
              general question — a concrete scenario gets a more conservative answer than an abstract one, a common
              pattern in social-attitude surveys.
            </p>
          </div>

          <div className="card">
            <h2>Rural vs. urban, and by income</h2>
            <ChartHelp>
              <p>
                Each tile is a single %, not a chart — the share of households in that subgroup (rural/urban, or
                income quintile) admitting the same untouchability practice from the first table above, sliced a
                different way instead of by caste group.
              </p>
            </ChartHelp>
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="label">Rural</div>
                <div className="value">{data.rural_urban.rural_pct}%</div>
              </div>
              <div className="stat-tile">
                <div className="label">Urban</div>
                <div className="value">{data.rural_urban.urban_pct}%</div>
              </div>
              <div className="stat-tile">
                <div className="label">Poorest quintile</div>
                <div className="value">{data.income_quintile.poorest_pct}%</div>
              </div>
              <div className="stat-tile">
                <div className="label">Richest quintile</div>
                <div className="value">{data.income_quintile.richest_pct}%</div>
              </div>
            </div>
            <p className="card-note" style={{ marginTop: 10 }}>
              {data.income_quintile.note}
            </p>
          </div>

          <div className="card">
            <h2>Regional variation</h2>
            <ChartHelp>
              <p>
                Same self-admission %, this time split by region instead of caste group or income. Compare a region's
                tile against the national figures in the first table — this doesn't identify which castes within a
                region are responsible.
              </p>
            </ChartHelp>
            <p className="card-note">{data.regional.note}</p>
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="label">Central Plains</div>
                <div className="value">{data.regional.central_plains_pct}%</div>
              </div>
              <div className="stat-tile">
                <div className="label">North</div>
                <div className="value">{data.regional.north_pct}%</div>
              </div>
              <div className="stat-tile">
                <div className="label">Hills</div>
                <div className="value">{data.regional.hills_pct}%</div>
              </div>
            </div>
            <p className="card-note" style={{ marginTop: 10 }}>
              South/East/West: {data.regional.south_east_west_note}
            </p>
          </div>

          <div className="card">
            <h2>Source</h2>
            <p style={{ fontSize: 13.5 }}>
              {data.source.paper}
              <br />
              Underlying survey: {data.source.underlying_survey}
              <br />
              <a href={data.source.url} target="_blank" rel="noreferrer">
                Source PDF
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
