import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { useJsonData } from "../hooks/useJsonData";
import { OpinionSection } from "../components/OpinionSection";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import {
  CrimeYearRow,
  DoptYearRow,
  AisheData,
  LokSabhaData,
  MpceData,
  AidisData,
  UntouchabilityData,
} from "../types/data";

type Tone = "positive" | "negative" | "neutral";
type Direction = "up" | "down";

/** Compact KPI widget: a label, one or two big numbers, and a single color-coded verdict line. */
function TrackWidget({
  label,
  linkTo,
  values,
  direction,
  tone,
  verdict,
  howToRead,
}: {
  label: string;
  linkTo: string;
  values: { value: string; sub: string; color: string }[];
  direction: Direction;
  tone: Tone;
  verdict: ReactNode;
  howToRead: ReactNode;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const verdictColor =
    tone === "positive" ? "var(--color-positive)" : tone === "negative" ? "var(--color-negative)" : "var(--color-text-muted)";
  const verdictThumb = tone === "positive" ? "👍 " : tone === "negative" ? "👎 " : "";
  const manyValues = values.length > 2;
  return (
    <div className="track-widget">
      <div className="track-widget-header">
        <Link to={linkTo} className="track-widget-title">
          {label}
        </Link>
        <button
          type="button"
          className="track-widget-info"
          onClick={(e) => {
            e.preventDefault();
            setShowInfo((o) => !o);
          }}
          aria-expanded={showInfo}
          aria-label="How to read this"
        >
          ⓘ
        </button>
      </div>
      {showInfo && <div className="chart-help-body" style={{ marginBottom: 8 }}>{howToRead}</div>}
      {manyValues ? (
        <div className="track-widget-rows">
          {values.map((v) => (
            <div className="track-widget-row" key={v.sub}>
              <span className="row-label" style={{ color: v.color }}>
                {v.sub}
              </span>
              <span className="row-value">{v.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="track-widget-values">
          {values.map((v) => (
            <div key={v.sub}>
              <div className="track-widget-value" style={{ color: v.color }}>
                {v.value}
              </div>
              <div className="track-widget-sub">{v.sub}</div>
            </div>
          ))}
        </div>
      )}
      <div className="track-widget-verdict" style={{ color: verdictColor }}>
        {direction === "up" ? "▲" : "▼"} {verdictThumb}
        {verdict}
      </div>
    </div>
  );
}

function AxisLabel({ children }: { children: ReactNode }) {
  return <div className="axis-label">{children}</div>;
}

export function Overview() {
  const crime = useJsonData<CrimeYearRow[]>("data/crime/sc_st_crime_national.json");
  const attitudes = useJsonData<UntouchabilityData>("data/attitudes/ihds_untouchability.json");
  const dopt = useJsonData<DoptYearRow[]>("data/representation/dopt_employment.json");
  const aishe = useJsonData<AisheData>("data/representation/aishe_education.json");
  const parliament = useJsonData<LokSabhaData>("data/parliament/lok_sabha_reserved_seats.json");
  const income = useJsonData<MpceData>("data/consumption/mpce_by_social_group.json");
  const wealth = useJsonData<AidisData>("data/wealth/aidis.json");

  // --- Crime ---
  const latestCrimeYear = crime.data ? Math.max(...crime.data.map((r) => r.year)) : null;
  const scLatest = crime.data?.find((r) => r.category === "SC" && r.year === latestCrimeYear);
  const stLatest = crime.data?.find((r) => r.category === "ST" && r.year === latestCrimeYear);
  const scBaseline = crime.data?.find((r) => r.category === "SC" && r.year === 2017);
  const stBaseline = crime.data?.find((r) => r.category === "ST" && r.year === 2017);
  const scRateDelta =
    scLatest?.rate_per_lakh_population && scBaseline?.rate_per_lakh_population
      ? ((scLatest.rate_per_lakh_population - scBaseline.rate_per_lakh_population) / scBaseline.rate_per_lakh_population) * 100
      : null;
  const stRateDelta =
    stLatest?.rate_per_lakh_population && stBaseline?.rate_per_lakh_population
      ? ((stLatest.rate_per_lakh_population - stBaseline.rate_per_lakh_population) / stBaseline.rate_per_lakh_population) * 100
      : null;

  // --- Education (AISHE) ---
  const gerYears = aishe.data?.ger_trend.years;
  const ger2014 = gerYears?.find((y) => y.year === "2014-15");
  const gerLatest = gerYears?.[gerYears.length - 1];
  const scGapNow = gerLatest ? gerLatest.all - gerLatest.sc : null;
  const scGap2014 = ger2014 ? ger2014.all - ger2014.sc : null;
  const stGapNow = gerLatest ? gerLatest.all - gerLatest.st : null;
  const stGap2014 = ger2014 ? ger2014.all - ger2014.st : null;

  // --- Employment (DoPT) ---
  const doptLatest = dopt.data ? dopt.data[dopt.data.length - 1] : null;
  const dopt2016 = dopt.data?.find((r) => r.year === 2016);
  const scGroupAGapNow = doptLatest ? doptLatest.statutory_quotas.sc_pct - doptLatest.groups.A.sc_pct : null;
  const scGroupAGap2016 = dopt2016 ? dopt2016.statutory_quotas.sc_pct - dopt2016.groups.A.sc_pct : null;
  const stGroupAGapNow = doptLatest ? doptLatest.statutory_quotas.st_pct - doptLatest.groups.A.st_pct : null;
  const stGroupAGap2016 = dopt2016 ? dopt2016.statutory_quotas.st_pct - dopt2016.groups.A.st_pct : null;

  // --- Parliament ---
  const eras = parliament.data?.delimitation_eras;
  const eraFirst = eras?.[0];
  const eraLast = eras?.[eras.length - 1];

  // --- Income (MPCE gap, rural) ---
  const incomeYears = income.data ? Object.keys(income.data.pct_gap_from_average.rural).sort() : [];
  const incomeFirstYear = incomeYears[0];
  const incomeLastYear = incomeYears[incomeYears.length - 1];
  const incomeGapSC = income.data
    ? {
        first: income.data.pct_gap_from_average.rural[incomeFirstYear]?.SC,
        last: income.data.pct_gap_from_average.rural[incomeLastYear]?.SC,
      }
    : null;
  const incomeGapST = income.data
    ? {
        first: income.data.pct_gap_from_average.rural[incomeFirstYear]?.ST,
        last: income.data.pct_gap_from_average.rural[incomeLastYear]?.ST,
      }
    : null;
  const incomeGapOBC = income.data ? income.data.pct_gap_from_average.rural[incomeLastYear]?.OBC : null;
  const incomeGapOthers = income.data ? income.data.pct_gap_from_average.rural[incomeLastYear]?.Others : null;

  // --- Wealth (AIDIS, single 2019 snapshot) ---
  const scAssetPctOfOthers = wealth.data
    ? Math.round((wealth.data.assets_2019_rs.rural.SC.ava_rs / wealth.data.assets_2019_rs.rural.Others.ava_rs) * 100)
    : null;
  const stAssetPctOfOthers = wealth.data
    ? Math.round((wealth.data.assets_2019_rs.rural.ST.ava_rs / wealth.data.assets_2019_rs.rural.Others.ava_rs) * 100)
    : null;
  const obcAssetPctOfOthers = wealth.data
    ? Math.round((wealth.data.assets_2019_rs.rural.OBC.ava_rs / wealth.data.assets_2019_rs.rural.Others.ava_rs) * 100)
    : null;

  const opinionReady =
    latestCrimeYear !== null &&
    scRateDelta !== null &&
    stRateDelta !== null &&
    scGap2014 !== null &&
    scGapNow !== null &&
    stGap2014 !== null &&
    stGapNow !== null &&
    gerLatest !== undefined &&
    scGroupAGapNow !== null &&
    stGroupAGapNow !== null &&
    incomeFirstYear !== undefined &&
    incomeLastYear !== undefined &&
    scAssetPctOfOthers !== null &&
    stAssetPctOfOthers !== null;

  return (
    <div>
      <h1 className="page-title">National Overview</h1>
      <p className="page-subtitle">
        Seven tracks across three axes for SC/ST (and OBC where data allows) — protection, representation, and
        financial strength, never combined into one score. See <Link to="/juxtaposition">Juxtaposition</Link> for
        all of them side by side, or <Link to="/data-sources">Data Sources</Link> for what's measured, computed, or
        estimated.
      </p>

      {opinionReady && (
        <OpinionSection
          latestCrimeYear={latestCrimeYear!}
          scRateDelta={scRateDelta!}
          stRateDelta={stRateDelta!}
          scGap2014={scGap2014!}
          scGapNow={scGapNow!}
          stGap2014={stGap2014!}
          stGapNow={stGapNow!}
          gerLatestYear={gerLatest!.year}
          scGroupAGapNow={scGroupAGapNow!}
          stGroupAGapNow={stGroupAGapNow!}
          incomeFirstYear={incomeFirstYear}
          incomeLastYear={incomeLastYear}
          scAssetPctOfOthers={scAssetPctOfOthers!}
          stAssetPctOfOthers={stAssetPctOfOthers!}
        />
      )}

      <AxisLabel>Protection</AxisLabel>
      <div className="widget-grid">
        {scLatest && stLatest && (
          <TrackWidget
            label="Crime rate (per lakh)"
            linkTo="/crime"
            values={[
              { value: scLatest.rate_per_lakh_population!.toFixed(1), sub: "SC", color: CATEGORY_COLOR.SC },
              { value: stLatest.rate_per_lakh_population!.toFixed(1), sub: "ST", color: CATEGORY_COLOR.ST },
            ]}
            direction="up"
            tone="negative"
            verdict={
              <>
                +{scRateDelta?.toFixed(0)}% / +{stRateDelta?.toFixed(0)}% since 2017
              </>
            }
            howToRead={
              <>
                Cases registered per 100,000 people in that group — not a raw case count — so it's comparable across
                years even as population grows. The % below compares the latest year to 2017.
              </>
            }
          />
        )}
        {attitudes.data && (
          <TrackWidget
            label="Admit practicing untouchability"
            linkTo="/attitudes"
            values={[
              { value: `${attitudes.data.table1_practice_by_social_group.sc_pct}%`, sub: "SC", color: CATEGORY_COLOR.SC },
              { value: `${attitudes.data.table1_practice_by_social_group.st_pct}%`, sub: "ST", color: CATEGORY_COLOR.ST },
              { value: `${attitudes.data.table1_practice_by_social_group.obc_pct}%`, sub: "OBC", color: CATEGORY_COLOR.OBC },
              { value: `${attitudes.data.table1_practice_by_social_group.forward_castes_pct}%`, sub: "Forward (excl. Brahmin)", color: CATEGORY_COLOR.General },
              { value: `${attitudes.data.table1_practice_by_social_group.brahmins_pct}%`, sub: "Brahmins", color: CATEGORY_COLOR.General },
            ]}
            direction="down"
            tone="neutral"
            verdict={
              <>
                Brahmins and Forward castes (Kshatriya/Vaishya, reported separately — not summable) report the{" "}
                <em>highest</em> rates — this measures who admits discriminating, not who's discriminated against.
                2011-12 snapshot only — no trend.
              </>
            }
            howToRead={
              <>
                Each row is a different social group's own admission rate (%) from a single 2011-12 survey — not a
                trend over time, and the rows aren't stacked or summable into one combined number.
              </>
            }
          />
        )}
      </div>

      <AxisLabel>Representation</AxisLabel>
      <div className="widget-grid">
        {gerLatest && (
          <TrackWidget
            label="Education GER (higher ed.)"
            linkTo="/representation"
            values={[
              { value: `${gerLatest.sc}`, sub: "SC", color: CATEGORY_COLOR.SC },
              { value: `${gerLatest.st}`, sub: "ST", color: CATEGORY_COLOR.ST },
            ]}
            direction="down"
            tone="positive"
            verdict={
              <>
                Gap {scGap2014?.toFixed(1)}→{scGapNow?.toFixed(1)} / {stGap2014?.toFixed(1)}→{stGapNow?.toFixed(1)} pts
                since 2014-15
              </>
            }
            howToRead={
              <>
                GER = enrolled students as a % of the age group that should be enrolled (18–23) — it can exceed 100%
                if older or repeat students are counted. "Gap" is the All-category GER minus this group's GER; a
                shrinking gap means this group is catching up, even while both numbers rise.
              </>
            }
          />
        )}
        {doptLatest && (
          <TrackWidget
            label="Employment, Group A (senior)"
            linkTo="/representation"
            values={[
              { value: `${doptLatest.groups.A.sc_pct}%`, sub: "SC · quota 15%", color: CATEGORY_COLOR.SC },
              { value: `${doptLatest.groups.A.st_pct}%`, sub: "ST · quota 7.5%", color: CATEGORY_COLOR.ST },
              { value: `${doptLatest.groups.A.obc_pct}%`, sub: "OBC · quota 27%", color: CATEGORY_COLOR.OBC },
              { value: `${doptLatest.groups.A.general_pct}%`, sub: "General", color: CATEGORY_COLOR.General },
            ]}
            direction="down"
            tone="positive"
            verdict={
              <>
                Gap to quota {scGroupAGap2016?.toFixed(2)}→{scGroupAGapNow?.toFixed(2)} / {stGroupAGap2016?.toFixed(2)}
                →{stGroupAGapNow?.toFixed(2)} pts since 2016 — still below quota every year
              </>
            }
            howToRead={
              <>
                % of senior (Group A) central government posts held by each group, versus that group's legal quota
                (shown next to each %). Below quota means under-represented in senior roles relative to the legal
                target — "gap to quota" tracks how far below.
              </>
            }
          />
        )}
        {eraLast && (
          <TrackWidget
            label="Lok Sabha seat share"
            linkTo="/parliament"
            values={[
              { value: `${eraLast.sc_pct_of_seats}%`, sub: "SC", color: CATEGORY_COLOR.SC },
              { value: `${eraLast.st_pct_of_seats}%`, sub: "ST", color: CATEGORY_COLOR.ST },
            ]}
            direction="up"
            tone="positive"
            verdict={
              <>
                {eraFirst?.sc_pct_of_seats}%→{eraLast.sc_pct_of_seats}% / {eraFirst?.st_pct_of_seats}%→
                {eraLast.st_pct_of_seats}% — structural, not annual
              </>
            }
            howToRead={
              <>
                % of all Lok Sabha seats reserved for this group. This only changes when constituencies are redrawn
                (delimitation) — the change shown spans decades, not year-to-year movement.
              </>
            }
          />
        )}
      </div>

      <AxisLabel>Financial strength</AxisLabel>
      <div className="widget-grid">
        {incomeGapSC && incomeGapST && (
          <TrackWidget
            label="Income gap from average (MPCE)"
            linkTo="/income"
            values={[
              { value: `${incomeGapSC.last}%`, sub: "SC", color: CATEGORY_COLOR.SC },
              { value: `${incomeGapST.last}%`, sub: "ST", color: CATEGORY_COLOR.ST },
              ...(incomeGapOBC !== null && incomeGapOBC !== undefined
                ? [{ value: `${incomeGapOBC}%`, sub: "OBC", color: CATEGORY_COLOR.OBC }]
                : []),
              ...(incomeGapOthers !== null && incomeGapOthers !== undefined
                ? [{ value: `${incomeGapOthers}%`, sub: "Others", color: CATEGORY_COLOR.Others }]
                : []),
            ]}
            direction="up"
            tone="positive"
            verdict={<>Narrowing since {incomeFirstYear} — 11-yr survey gap, read as directional</>}
            howToRead={
              <>
                % difference between this group's average monthly spending per person and the all-group average, same
                survey year. Negative means below average; moving toward 0% means the gap is narrowing, not that
                spending is falling.
              </>
            }
          />
        )}
        {scAssetPctOfOthers !== null && stAssetPctOfOthers !== null && (
          <TrackWidget
            label="Household assets, as % of &quot;Others&quot; households"
            linkTo="/wealth"
            values={[
              { value: `${scAssetPctOfOthers}%`, sub: "SC", color: CATEGORY_COLOR.SC },
              { value: `${stAssetPctOfOthers}%`, sub: "ST", color: CATEGORY_COLOR.ST },
              ...(obcAssetPctOfOthers !== null ? [{ value: `${obcAssetPctOfOthers}%`, sub: "OBC", color: CATEGORY_COLOR.OBC }] : []),
            ]}
            direction="down"
            tone="negative"
            verdict={
              <>
                Reads as: SC household assets are worth only {scAssetPctOfOthers}% of the average "Others" household's
                — the starkest gap of any track here. 2019 snapshot only, no trend.
              </>
            }
            howToRead={
              <>
                This group's average household asset value (land, buildings, gold, etc. — not income) as a % of the
                average "Others" household's asset value, from a single 2019 survey. 100% would mean equal wealth;
                lower means a bigger gap.
              </>
            }
          />
        )}
      </div>

      <div className="caveat-banner">
        <strong>The widgets above are trend verdicts, not policy verdicts.</strong> Each says whether a number is
        rising, falling, narrowing, or widening — nothing more. The "One reading of this data" section above is
        different and is labeled as such. See <Link to="/data-sources">Data Sources</Link> for exactly what's
        measured vs. computed vs. estimated before weighing either.
      </div>
    </div>
  );
}
