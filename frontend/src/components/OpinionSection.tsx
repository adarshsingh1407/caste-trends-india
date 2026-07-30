import { Link } from "react-router-dom";

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
          <div className="opinion-thread-title" style={{ color: "var(--color-positive)" }}>
            ▲ 👍 Representation is improving
          </div>
          <div className="opinion-thread-stat">
            Education gap: {scGap2014.toFixed(1)}→{scGapNow.toFixed(1)} pts (SC), {stGap2014.toFixed(1)}→
            {stGapNow.toFixed(1)} pts (ST) · 2014-15–{gerLatestYear}
          </div>
        </div>
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-negative)" }}>
          <div className="opinion-thread-title" style={{ color: "var(--color-negative)" }}>
            ▼ 👎 But it has a ceiling
          </div>
          <div className="opinion-thread-stat">
            Senior (Group A) roles below quota every year checked ({scGroupAGapNow.toFixed(2)} pts SC,{" "}
            {stGroupAGapNow.toFixed(2)} pts ST) — junior roles exceed it throughout
          </div>
        </div>
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-negative)" }}>
          <div className="opinion-thread-title" style={{ color: "var(--color-negative)" }}>
            ▼ 👎 Wealth is the starkest gap
          </div>
          <div className="opinion-thread-stat">
            SC/ST hold only ~{scAssetPctOfOthers}%/{stAssetPctOfOthers}% of "Others'" asset value (2019 snapshot, no
            trend). Consumption narrowed ({incomeFirstYear}→{incomeLastYear}) but is a weaker proxy.
          </div>
        </div>
        <div className="opinion-thread" style={{ borderLeftColor: "var(--color-text-muted)" }}>
          <div className="opinion-thread-title" style={{ color: "var(--color-text-muted)" }}>
            ▲ Crime data is ambiguous
          </div>
          <div className="opinion-thread-stat">
            Rates rose {scRateDelta.toFixed(0)}%/{stRateDelta.toFixed(0)}% (2017–{latestCrimeYear}) alongside rising
            convictions and a near-doubled backlog — more atrocities, better reporting, or both, can't tell.
          </div>
        </div>
      </div>

      <h3>What it doesn't settle</h3>
      <p className="opinion-lead">This narrows the range of honest positions — it doesn't pick one for you:</p>
      <div className="opinion-positions">
        <div className="opinion-position">
          <strong>Continue as-is</strong>
          <span>the representation gains are real and took decades.</span>
        </div>
        <div className="opinion-position">
          <strong>Add a wealth-tested layer</strong>
          <span>representation hasn't closed the asset gap.</span>
        </div>
      </div>
      <p className="opinion-lead">
        I wouldn't trust a reading that landed on just one of these. Form your own from the tracks below.
      </p>
    </div>
  );
}
