import { NavLink, Outlet } from "react-router-dom";
import { useOpenAbout } from "./AboutContext";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const openAbout = useOpenAbout();

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="brand">Caste Trends</div>
            <div className="brand-sub">India</div>
          </div>
          <div className="header-right">
            <nav className="nav">
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                Overview
              </NavLink>
              <span className="nav-divider" />
              <NavLink to="/crime" className={({ isActive }) => (isActive ? "active" : "")}>
                Crime Trends
              </NavLink>
              <NavLink to="/attitudes" className={({ isActive }) => (isActive ? "active" : "")}>
                Attitudes
              </NavLink>
              <span className="nav-divider" />
              <NavLink to="/representation" className={({ isActive }) => (isActive ? "active" : "")}>
                Representation
              </NavLink>
              <NavLink to="/parliament" className={({ isActive }) => (isActive ? "active" : "")}>
                Parliament
              </NavLink>
              <span className="nav-divider" />
              <NavLink to="/wealth" className={({ isActive }) => (isActive ? "active" : "")}>
                Wealth
              </NavLink>
              <NavLink to="/income" className={({ isActive }) => (isActive ? "active" : "")}>
                Income
              </NavLink>
              <span className="nav-divider" />
              <NavLink to="/juxtaposition" className={({ isActive }) => (isActive ? "active" : "")}>
                Juxtaposition
              </NavLink>
              <button className="about-button" onClick={openAbout}>
                About this data
              </button>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
