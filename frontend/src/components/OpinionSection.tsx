import { Link } from "react-router-dom";
import { ThumbIcon } from "./ThumbIcon";

interface Props {
  latestCrimeYear: number;
  scRateDelta: number;
  stRateDelta: number;
  scGap2014: number;
  scGapNow: number;
  stGap2014: number;
  stGapNow: number;
  gerLatestYear: string;
  scGroupAGapNow: number;
  stGroupAGapNow: number;
  incomeFirstYear: string;
  incomeLastYear: string;
  scAssetPctOfOthers: number;
  stAssetPctOfOthers: number;
}

export function OpinionSection(props: Props) {
  const {
    latestCrimeYear,
    scRateDelta,
    stRateDelta,
    scGap2014,
    scGapNow,
    stGap2014,
    stGapNow,
    gerLatestYear,
    scGroupAGapNow,
    stGroupAGapNow,
    incomeFirstYear,
    incomeLastYear,
    scAssetPctOfOthers,
    stAssetPctOfOthers,
  } = props;

  return (
    <div className="opinion-card">
      <span className="opinion-label">Interpretation, not a finding</span>
      <h2>One reading of this data</h2>
      <p>
        Everything else here is a <strong>trend verdict</strong> — rising, falling, narrowing. This is different:
        one way of weighing those trends, not a conclusion the data produces. A reasonable reader could weigh the
        same six tracks differently. See <Link to="/data-sources">Data Sources</Link> for what backs each claim.
      </p>

      <h3>Four threads</h3>
      <div className="opinion-threads">
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-positive)" }}>
          <div
            className="opinion-thread-title"
            style={{ color: "var(--color-positive)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
          >
            <span>▲ Representation is improving</span>
            <ThumbIcon tone="positive" size={14} />
          </div>
          <div className="opinion-thread-stat">
            Education gap: {scGap2014.toFixed(1)}→{scGapNow.toFixed(1)} pts (SC), {stGap2014.toFixed(1)}→
            {stGapNow.toFixed(1)} pts (ST) · 2014-15–{gerLatestYear}
          </div>
        </div>
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-negative)" }}>
          <div
            className="opinion-thread-title"
            style={{ color: "var(--color-negative)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
          >
            <span>▼ But it has a ceiling</span>
            <ThumbIcon tone="negative" size={14} />
          </div>
          <div className="opinion-thread-stat">
            Senior (Group A) roles below quota every year checked ({scGroupAGapNow.toFixed(2)} pts SC,{" "}
            {stGroupAGapNow.toFixed(2)} pts ST) — junior roles exceed it throughout
          </div>
        </div>
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-negative)" }}>
          <div
            className="opinion-thread-title"
            style={{ color: "var(--color-negative)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
          >
            <span>▼ Wealth is the starkest gap</span>
            <ThumbIcon tone="negative" size={14} />
          </div>
          <div className="opinion-thread-stat">
            SC/ST hold only ~{scAssetPctOfOthers}%/{stAssetPctOfOthers}% of "Others'" asset value (2019 snapshot, no
            trend). Consumption narrowed ({incomeFirstYear}→{incomeLastYear}) but is a weaker proxy.
          </div>
        </div>
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-text-muted)" }}>
          <div className="opinion-thread-title" style={{ color: "var(--color-text-muted)" }}>
            ▲ Crime reported has increased
          </div>
          <div className="opinion-thread-stat">
            Rates rose {scRateDelta.toFixed(0)}%/{stRateDelta.toFixed(0)}% (2017–{latestCrimeYear}) alongside rising
            convictions and a near-doubled backlog — the rise itself isn't in doubt, but whether it's more
            atrocities, better reporting, or both, can't be told from this data.
          </div>
        </div>
      </div>

      <h3>What it doesn't settle: whether reservation policy should change</h3>
      <p className="opinion-lead">
        These four threads narrow the range of honest positions on SC/ST/OBC reservation in education and government
        jobs — they don't pick one for you:
      </p>
      <div className="opinion-positions">
        <div className="opinion-position">
          <span className="opinion-position-label">
            <span className="opinion-position-badge">A</span>
            <strong>Keep reservation as it is</strong>
          </span>
          <span>the representation gains are real and took decades.</span>
        </div>
        <div className="opinion-position">
          <span className="opinion-position-label">
            <span className="opinion-position-badge">B</span>
            <strong>Add a wealth test to reservation</strong>
          </span>
          <span>representation hasn't closed the asset gap.</span>
        </div>
      </div>
      <p className="opinion-aside">
        I wouldn't trust a reading that landed on just one of these. Form your own from the tracks below.
      </p>
    </div>
  );
}
