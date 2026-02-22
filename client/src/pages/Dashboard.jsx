import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, logs: 0, anomalies: 0 });
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

      const grouped = {};

      alertsRes.data.forEach(a => {
        if (!grouped[a.user_id]) {
          grouped[a.user_id] = {
            score: 0,
            risk: "low"
          };
        }

        const absScore = Math.abs(a.anomaly_score);

        if (absScore > grouped[a.user_id].score) {
          grouped[a.user_id].score = absScore;
          grouped[a.user_id].risk = a.risk_level || "low";
        }
      });

      const chart = Object.keys(grouped).map(user => ({
        user,
        score: grouped[user].score,
        risk: grouped[user].risk
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

  const getRiskColor = (risk) => {
    switch (risk) {
      case "high":
        return "#ef4444";
      case "moderate":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#94a3b8";
    }
  };

  const severityRank = {
    high: 3,
    moderate: 2,
    low: 1
  };

  const sortedRiskData = [...riskData].sort((a, b) => {
    if (severityRank[b.risk] !== severityRank[a.risk]) {
      return severityRank[b.risk] - severityRank[a.risk];
    }
    return b.score - a.score;
  });

  const highCount = riskData.filter(u => u.risk === "high").length;
  const moderateCount = riskData.filter(u => u.risk === "moderate").length;
  const lowCount = riskData.filter(u => u.risk === "low").length;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Insider Threat Dashboard</h1>
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

      <div className="card-container">
        <div className="card" style={{ borderLeft: "6px solid #ef4444" }}>
          <h3>High Risk</h3>
          <p>{highCount}</p>
        </div>

        <div className="card" style={{ borderLeft: "6px solid #f59e0b" }}>
          <h3>Moderate Risk</h3>
          <p>{moderateCount}</p>
        </div>

        <div className="card" style={{ borderLeft: "6px solid #22c55e" }}>
          <h3>Low Risk</h3>
          <p>{lowCount}</p>
        </div>
      </div>

      <div className="leaderboard">
        <h3>Risk Leaderboard (Per user)</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRiskData.map((u, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{u.user}</td>
                <td>{u.score.toFixed(3)}</td>
                <td
                  style={{
                    color: getRiskColor(u.risk),
                    fontWeight: "bold"
                  }}
                >
                  {u.risk?.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}