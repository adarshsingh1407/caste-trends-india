import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useOpenAbout } from "./AboutContext";
import { ThemeToggle } from "./ThemeToggle";
import { BrandIcon } from "./BrandIcon";

type NavEntry =
  | { type: "link"; to: string; label: string }
  | { type: "group"; label: string; items: { to: string; label: string }[] };

/** Mirrors the three axes Overview.tsx groups its widgets under (Protection / Representation / Financial strength). */
const NAV_STRUCTURE: NavEntry[] = [
  { type: "link", to: "/", label: "Overview" },
  {
    type: "group",
    label: "Protection",
    items: [
      { to: "/crime", label: "Crime Trends" },
      { to: "/attitudes", label: "Attitudes" },
    ],
  },
  {
    type: "group",
    label: "Representation",
    items: [
      { to: "/population", label: "Population Share" },
      { to: "/representation", label: "Education & Employment" },
      { to: "/parliament", label: "Parliament" },
    ],
  },
  {
    type: "group",
    label: "Financial strength",
    items: [
      { to: "/wealth", label: "Wealth" },
      { to: "/income", label: "Income" },
    ],
  },
  { type: "link", to: "/juxtaposition", label: "Juxtaposition" },
];

export function Layout() {
  const openAbout = useOpenAbout();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-block">
            <BrandIcon />
            <div>
              <div className="brand">Caste Trends</div>
              <div className="brand-sub">India</div>
            </div>
          </div>
          <div className="header-right">
            <button
              className="nav-toggle"
              onClick={() => setIsNavOpen((open) => !open)}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={isNavOpen}
            >
              {isNavOpen ? "✕" : "☰"}
            </button>
            <nav className={`nav${isNavOpen ? " nav-open" : ""}`} onClick={() => setIsNavOpen(false)}>
              {NAV_STRUCTURE.map((entry) =>
                entry.type === "link" ? (
                  <NavLink
                    key={entry.to}
                    to={entry.to}
                    end={entry.to === "/"}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    {entry.label}
                  </NavLink>
                ) : (
                  <div className="nav-group" key={entry.label}>
                    <span className={`nav-group-label${entry.items.some((i) => i.to === pathname) ? " active" : ""}`}>
                      {entry.label}
                    </span>
                    <div className="nav-dropdown">
                      {entry.items.map((item) => (
                        <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ),
              )}
              <button className="about-button" onClick={openAbout}>
                About this data
              </button>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {isNavOpen && <div className="nav-overlay" onClick={() => setIsNavOpen(false)} />}
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
