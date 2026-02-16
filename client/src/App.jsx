import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Alerts from "./pages/Alerts";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <nav className="navbar">
          <div className="logo">🔐 Insider Threat Monitor</div>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/alerts">Alerts</Link>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
