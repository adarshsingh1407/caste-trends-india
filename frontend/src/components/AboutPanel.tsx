import { Link } from "react-router-dom";

interface Props {
  onClose: () => void;
}

const SOURCES = [
  {
    title: "Crime & Atrocities",
    desc: "NCRB district-level SC/ST case data (2016–2022) + conviction/disposal rates (2018–2022). SC + ST only — no OBC category exists.",
    anchor: "crime",
  },
  {
    title: "Everyday Discrimination",
    desc: "Self-reported practice of untouchability by social group (IHDS-II, 2011-12) — the 'soft'/everyday counterpart to registered crime data. A single snapshot, not a trend.",
    anchor: "attitudes",
  },
  {
    title: "Education (AISHE)",
    desc: "Enrolment share and Gross Enrolment Ratio by category, 2014-15–2023-24. No OBC GER series published.",
    anchor: "education",
  },
  {
    title: "Employment (DoPT)",
    desc: "Central government representation by Group A/B/C, 2016/2021/2024. 2021 is a confirmed low-coverage year.",
    anchor: "employment",
  },
  {
    title: "Parliament",
    desc: "Lok Sabha SC/ST reserved seats across two delimitation eras — a structural entitlement, not an annual trend.",
    anchor: "parliament",
  },
  {
    title: "Income & Consumption",
    desc: "MPCE by social group, 2004-05–2022-23. An 11-year gap in official surveys, flagged where it applies.",
    anchor: "income",
  },
  {
    title: "Land, Assets & Debt",
    desc: "AIDIS asset value (2019) and debt (2012-13 vs. 2019) by social group — the closest official wealth measure.",
    anchor: "wealth",
  },
  {
    title: "Population reference",
    desc: "Census 2001/2011 SC/ST figures. Years after 2011 use a projected estimate, clearly flagged wherever shown.",
    anchor: "population",
  },
];

export function AboutPanel({ onClose }: Props) {
  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-panel" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" onClick={onClose}>
          Close
        </button>
        <h2>About this data</h2>
        <p style={{ marginBottom: 18, fontSize: 13, color: "var(--color-text-muted)" }}>
          This dashboard tracks separate, distinct evidence tracks — they're never combined into one score. Every
          figure traces back to a specific official report; here's what was used.
        </p>

        {SOURCES.map((s) => (
          <div key={s.title} style={{ marginBottom: 14 }}>
            <Link
              to={`/data-sources#${s.anchor}`}
              onClick={onClose}
              style={{ fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}
            >
              {s.title}
            </Link>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "2px 0 0" }}>{s.desc}</p>
          </div>
        ))}

        <Link
          to="/data-sources"
          onClick={onClose}
          className="about-button"
          style={{ display: "inline-block", textDecoration: "none", marginTop: 8 }}
        >
          Full data sources &amp; methodology →
        </Link>

        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 20, lineHeight: 1.6 }}>
          The full page also covers what was checked and ruled out (OBC crime, city-tier crime, EWS data, private
          sector employment, and more), and marks exactly which figures are directly reported vs. computed vs.
          projected estimates.
        </p>
      </div>
    </div>
  );
}
