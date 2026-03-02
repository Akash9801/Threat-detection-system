import { useEffect, useState } from "react";
import API from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const res = await API.get("/logs/alerts");
    setAlerts(res.data);
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

  return (
    <div className="alerts-page">
      <h1>Recent Alerts (Last 7 Days)</h1>

      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Score</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No alerts in last 7 days
                </td>
              </tr>
            ) : (
              alerts.map(alert => {
                const risk = alert.risk_level || "low";
                const color = getRiskColor(risk);

                return (
                  <tr key={alert.log_id}>
                    <td>{alert.user_id}</td>

                    <td style={{ color: color, fontWeight: "bold" }}>
                      {Math.abs(alert.anomaly_score).toFixed(3)}
                    </td>

                    <td>
                      <span
                        style={{
                          
                          color: color,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        {risk.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}