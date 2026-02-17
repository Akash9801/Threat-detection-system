import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import AlertPanel from "../components/AlertPanel";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, logs: 0, anomalies: 0 });
  const [alerts, setAlerts] = useState([]);
  const [riskData, setRiskData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const statsRes = await axios.get("http://localhost:5000/api/logs/stats");
    const alertsRes = await axios.get("http://localhost:5000/api/logs/alerts");

    setStats(statsRes.data);
    setAlerts(alertsRes.data);

    const grouped = {};
    alertsRes.data.forEach(a => {
      grouped[a.user_id] = Math.abs(a.anomaly_score);
    });

    setRiskData(
      Object.keys(grouped).map(user => ({
        user,
        score: grouped[user]
      }))
    );
  };

  const simulateAttack = async () => {
    await axios.post("http://localhost:5000/api/logs/simulate");
    fetchData();
  };

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h1>AI-Powered Insider Threat Dashboard</h1>
        <button className="attack-btn" onClick={simulateAttack}>
          Simulate Attack
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>
        <div className="stat-card">
          <h3>Total Logs</h3>
          <p>{stats.logs}</p>
        </div>
        <div className="stat-card danger">
          <h3>Anomalies</h3>
          <p>{stats.anomalies}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h3>User Risk Heat</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <XAxis dataKey="user" />
              <Tooltip />
              <Bar dataKey="score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <AlertPanel
          alerts={alerts.map(a => ({
            user: a.user_id,
            score: a.anomaly_score
          }))}
        />
      </div>
    </div>
  );
}
