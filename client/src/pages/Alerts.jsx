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

  return (
    <div className="alerts-page">
      <h1>Recent Alerts (Last 7 Days)</h1>

      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Risk Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No alerts in last 7 days
                </td>
              </tr>
            ) : (
              alerts.map(alert => (
                <tr key={alert.log_id}>
                  <td>{alert.user_id}</td>
                  <td className={
                    alert.anomaly_score > 0.7
                      ? "critical"
                      : alert.anomaly_score > 0.4
                      ? "high"
                      : "low"
                  }>
                    {alert.anomaly_score.toFixed(2)}
                  </td>
                  <td>
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
