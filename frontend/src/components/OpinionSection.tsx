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
      <ul>
        <li>
          <strong>Representation is genuinely improving:</strong> the education gap narrowed from{" "}
          {scGap2014.toFixed(1)}→{scGapNow.toFixed(1)} pts (SC) and {stGap2014.toFixed(1)}→{stGapNow.toFixed(1)} pts
          (ST), 2014-15–{gerLatestYear}.
        </li>
        <li>
          <strong>But it has a ceiling:</strong> senior (Group A) roles stayed below quota every year checked
          ({scGroupAGapNow.toFixed(2)} pts SC, {stGroupAGapNow.toFixed(2)} pts ST below, as of the latest data)
          while junior roles exceeded it throughout.
        </li>
        <li>
          <strong>Wealth is the starkest, least-closing gap:</strong> SC/ST hold only ~{scAssetPctOfOthers}%/
          {stAssetPctOfOthers}% of "Others'" asset value — a single 2019 snapshot, no trend data exists. Consumption
          narrowed ({incomeFirstYear}→{incomeLastYear}), but that's a weaker proxy than actual wealth.
        </li>
        <li>
          <strong>Crime data is genuinely ambiguous:</strong> rates rose {scRateDelta.toFixed(0)}%/
          {stRateDelta.toFixed(0)}% (2017–{latestCrimeYear}) alongside rising convictions and a near-doubled
          backlog — can't tell if that's more atrocities, better reporting, or both.
        </li>
      </ul>

      <h3>What it doesn't settle</h3>
      <p>This narrows the range of honest positions — it doesn't pick one for you:</p>
      <ul>
        <li><strong>Continue as-is</strong> — the representation gains are real and took decades.</li>
        <li><strong>Add a wealth-tested layer</strong> — representation hasn't closed the asset gap.</li>
      </ul>
      <p>I wouldn't trust a reading that landed on just one of these. Form your own from the tracks below.</p>
    </div>
  );
}
