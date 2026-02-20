import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, logs: 0, anomalies: 0 });
  const [alerts, setAlerts] = useState([]);
  const [riskData, setRiskData] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/logs/stats");
      const alertsRes = await API.get("/logs/alerts");

      setStats(statsRes.data);
      setAlerts(alertsRes.data);

      const grouped = {};
      alertsRes.data.forEach(a => {
        grouped[a.user_id] = Math.max(
          grouped[a.user_id] || 0,
          Math.abs(a.anomaly_score)
        );
      });

      const chart = Object.keys(grouped).map(user => ({
        user,
        score: grouped[user]
      }));

      setRiskData(chart);
    } catch (err) {
      console.error(err);
    }
  };

  const simulateAttack = async () => {
    await API.post("/logs/simulate");
    fetchData();
  };

  const getHeatColor = (score) => {
    const normalized = Math.min(score, 1);
    const red = Math.floor(255 * normalized);
    const blue = Math.floor(255 * (1 - normalized));
    return `rgb(${red}, 60, ${blue})`;
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>AI‑Powered Insider Threat Dashboard</h1>
        <button className="attack-btn" onClick={simulateAttack}>
          Simulate Attack
        </button>
      </div>

      <div className="card-container">
        <div className="card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>

        <div className="card">
          <h3>Total Logs</h3>
          <p>{stats.logs}</p>
        </div>

        <div className="card danger">
          <h3>Anomalies</h3>
          <p>{stats.anomalies}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h3>User Risk Intensity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <XAxis dataKey="user" stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="score">
                {riskData.map((entry, index) => (
                  <Cell key={index} fill={getHeatColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="leaderboard">
          <h3>Risk Leaderboard</h3>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {riskData
                .sort((a, b) => b.score - a.score)
                .map((u, i) => (
                  <tr key={i}>
                    <td>{u.user}</td>
                    <td>{u.score.toFixed(2)}</td>
                    <td style={{ color: getHeatColor(u.score) }}>
                      {u.score > 0.7
                        ? "Critical"
                        : u.score > 0.4
                        ? "High"
                        : u.score > 0.2
                        ? "Medium"
                        : "Low"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
