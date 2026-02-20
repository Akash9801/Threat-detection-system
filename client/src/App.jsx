import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Alerts from "./pages/Alerts";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <nav className="navbar">
          <div className="logo">Insider Threat Monitor</div>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? "active-link" : ""}>
              Dashboard
            </NavLink>

            <NavLink to="/users" className={({ isActive }) => isActive ? "active-link" : ""}>
              Users
            </NavLink>

            <NavLink to="/alerts" className={({ isActive }) => isActive ? "active-link" : ""}>
              Alerts
            </NavLink>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
