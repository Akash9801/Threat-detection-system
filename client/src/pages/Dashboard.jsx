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

    const chart = Object.keys(grouped).map(user => ({
      user,
      score: grouped[user]
    }));

    setRiskData(chart);
  };

  const simulateAttack = async () => {
    await axios.post("http://localhost:5000/api/logs/simulate");
    fetchData();
  };

  return (
    <div>
      <h1>AI-Powered Insider Threat Dashboard</h1>

      <button className="attack-btn" onClick={simulateAttack}>
        🚨 Simulate Attack
      </button>

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
          <h3>User Risk Heat</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <XAxis dataKey="user" stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="score" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <AlertPanel alerts={alerts.map(a => ({
          user: a.user_id,
          score: a.anomaly_score
        }))} />
      </div>
    </div>
  );
}
