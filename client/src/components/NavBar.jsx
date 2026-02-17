import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">ThreatWatch</div>

      <div className="nav-links">
        <Link className={pathname === "/" ? "active" : ""} to="/">Dashboard</Link>
        <Link className={pathname === "/users" ? "active" : ""} to="/users">Users</Link>
        <Link className={pathname === "/alerts" ? "active" : ""} to="/alerts">Alerts</Link>
      </div>
    </nav>
  );
}
