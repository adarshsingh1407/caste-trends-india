import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useJsonData } from "../hooks/useJsonData";
import { GraphVerdict } from "../components/GraphVerdict";
import { ChartHelp } from "../components/ChartHelp";
import { CATEGORY_COLOR, Category } from "../constants/categoryColors";
import {
  CrimeYearRow,
  DoptYearRow,
  AisheData,
  LokSabhaData,
  MpceData,
} from "../types/data";

type SeriesKey = Extract<Category, "SC" | "ST" | "OBC" | "Others">;

/** Caps floating-point subtraction artifacts (e.g. 2.1999999999999997) at 2 decimal places. */
const round2 = (n: number) => Math.round(n * 100) / 100;

function MiniChart({
  title,
  unit,
  linkTo,
  series,
  data,
  missingNote,
  howToRead,
  xLabel = "Year",
  yLabel,
}: {
  title: string;
  unit: string;
  linkTo: string;
  series: SeriesKey[];
  data: Record<string, string | number | null>[];
  missingNote?: string;
  howToRead: ReactNode;
  xLabel?: string;
  yLabel: string;
}) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h2 style={{ fontSize: 14 }}>{title}</h2>
      <ChartHelp>{howToRead}</ChartHelp>
      <ResponsiveContainer width="100%" height={195}>
        <LineChart data={data} margin={{ top: 6, right: 10, bottom: 16, left: 2 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 10.5 }}
            label={{ value: xLabel, position: "insideBottom", offset: -10, fontSize: 10, fill: "var(--color-text-muted)" }}
          />
          <YAxis
            tick={{ fontSize: 10.5 }}
            width={40}
            unit={unit}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              fontSize: 9.5,
              fill: "var(--color-text-muted)",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => round2(v)} />
          {series.map((s) => (
            <Line key={s} type="monotone" dataKey={s} stroke={CATEGORY_COLOR[s]} strokeWidth={2} dot={{ r: 2.5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {missingNote && (
        <p className="card-note" style={{ fontStyle: "italic", marginTop: 4 }}>
          {missingNote}
        </p>
      )}
      {data.length > 1 && data[0].SC !== null && data[data.length - 1].SC !== null && (
        <GraphVerdict
          direction={(data[data.length - 1].SC as number) >= (data[0].SC as number) ? "up" : "down"}
          tone="neutral"
        >
          SC: {data[0].x}→{data[data.length - 1].x}: {round2(data[0].SC as number)}
          {unit} → {round2(data[data.length - 1].SC as number)}
          {unit} (descriptive only)
        </GraphVerdict>
      )}
      <p className="card-note" style={{ marginTop: 6 }}>
        <Link to={linkTo}>Full detail →</Link>
      </p>
    </div>
  );
}

export function Juxtaposition() {
  const crime = useJsonData<CrimeYearRow[]>("data/crime/sc_st_crime_national.json");
  const dopt = useJsonData<DoptYearRow[]>("data/representation/dopt_employment.json");
  const aishe = useJsonData<AisheData>("data/representation/aishe_education.json");
  const parliament = useJsonData<LokSabhaData>("data/parliament/lok_sabha_reserved_seats.json");
  const income = useJsonData<MpceData>("data/consumption/mpce_by_social_group.json");

  const crimeData = crime.data
    ? Array.from(new Set(crime.data.map((r) => r.year)))
        .sort()
        .map((year) => ({
          x: year,
          SC: crime.data!.find((r) => r.category === "SC" && r.year === year)?.rate_per_lakh_population ?? null,
          ST: crime.data!.find((r) => r.category === "ST" && r.year === year)?.rate_per_lakh_population ?? null,
        }))
    : [];

  const educationData = aishe.data
    ? aishe.data.ger_trend.years.map((y) => ({ x: y.year, SC: round2(y.all - y.sc), ST: round2(y.all - y.st) }))
    : [];

  // OBC gap-to-quota is real, already-fetched data (DoPT reports OBC Group A % and its 27% quota),
  // unlike crime/education/parliament OBC where no data exists at all.
  const employmentData = dopt.data
    ? dopt.data.map((r) => ({
        x: r.year,
        SC: round2(r.statutory_quotas.sc_pct - r.groups.A.sc_pct),
        ST: round2(r.statutory_quotas.st_pct - r.groups.A.st_pct),
        OBC: round2(r.statutory_quotas.obc_pct - r.groups.A.obc_pct),
      }))
    : [];

  const parliamentData = parliament.data
    ? parliament.data.delimitation_eras.map((era) => ({
        x: era.era_label.split(" ")[0],
        SC: era.sc_pct_of_seats,
        ST: era.st_pct_of_seats,
      }))
    : [];

  // OBC and Others are already in the source data (HCES reports all four groups) --
  // no reason to hide them here when the other mini charts can't show OBC at all.
  const incomeData = income.data
    ? Object.entries(income.data.pct_gap_from_average.rural).map(([year, groups]) => ({
        x: year,
        SC: groups.SC,
        ST: groups.ST,
        OBC: groups.OBC,
        Others: groups.Others,
      }))
    : [];

  return (
    <div>
      <h1 className="page-title">Juxtaposition</h1>
      <p className="page-subtitle">
        Every track, side by side, at a glance — deliberately not overlaid on one shared axis, and deliberately not
        implying any of these move because of the others.
      </p>

      <div className="caveat-banner">
        <strong>This is a side-by-side view, not a causal claim.</strong> Each chart below uses its own unit, time
        window, and data source (see Full detail links) — they are placed together only so you can eyeball whether
        trends broadly align or diverge, not to suggest one explains another. Confounders (economic growth, policing
        capacity, political change, survey methodology changes) are numerous and not controlled for anywhere here.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <MiniChart
          title="Crime rate (per lakh population)"
          unit=""
          linkTo="/crime"
          series={["SC", "ST"]}
          data={crimeData}
          missingNote="OBC not shown: no OBC crime category exists (no Prevention of Atrocities Act equivalent) — a confirmed dead end, not an estimate."
          howToRead="Cases per 100,000 people in that group, not a raw case count — comparable across years despite population growth. Rising = more registered cases per capita, not necessarily more crime (see full page for the reporting caveat)."
          yLabel="Rate per lakh"
        />
        <MiniChart
          title="Education gap to All-category GER (points)"
          unit=""
          linkTo="/representation"
          series={["SC", "ST"]}
          data={educationData}
          missingNote="OBC not shown: AISHE does not publish an OBC GER series."
          howToRead="Percentage-point gap between the All-category enrolment ratio and this group's — lower means closer to parity, not lower enrolment."
          yLabel="Gap to All (pts)"
        />
        <MiniChart
          title="Employment gap to quota, Group A (points)"
          unit=""
          linkTo="/representation"
          series={["SC", "ST", "OBC"]}
          data={employmentData}
          howToRead="Percentage-point gap between the legal quota and actual Group A (senior) representation — lower means closer to meeting quota, 0 means exactly at quota."
          yLabel="Gap to quota (pts)"
        />
        <MiniChart
          title="Lok Sabha seat share (%)"
          unit="%"
          linkTo="/parliament"
          series={["SC", "ST"]}
          data={parliamentData}
          missingNote="OBC not shown: no OBC parliamentary reservation exists anywhere (only local bodies do) — a confirmed dead end, not an estimate."
          howToRead="% of all Lok Sabha seats reserved for this group. Changes only when constituencies are redrawn (delimitation), not year to year — each point is an era, not an annual reading."
          xLabel="Era"
          yLabel="% of seats"
        />
        <MiniChart
          title="MPCE gap from average, rural (%)"
          unit="%"
          linkTo="/income"
          series={["SC", "ST", "OBC", "Others"]}
          data={incomeData}
          howToRead="% difference from the all-group average consumption spending, same year. 0% = exactly average; negative = below average; moving toward 0% is narrowing, not a rupee increase."
          yLabel="% gap from avg"
        />
      </div>

      <p className="card-note" style={{ marginTop: 16 }}>
        <span className="swatch" style={{ background: CATEGORY_COLOR.SC }} /> SC &nbsp;
        <span className="swatch" style={{ background: CATEGORY_COLOR.ST }} /> ST &nbsp;
        <span className="swatch" style={{ background: CATEGORY_COLOR.OBC }} /> OBC &nbsp;
        <span className="swatch" style={{ background: CATEGORY_COLOR.General }} /> Others/General — shown only
        where the underlying source actually reports that group; a chart missing a color means that data doesn't
        exist, not that it was omitted for space. Lower is "closer to parity" for the gap-based charts (education,
        employment, income); for crime rate, lower is fewer registered cases per lakh population.
      </p>
    </div>
  );
}
