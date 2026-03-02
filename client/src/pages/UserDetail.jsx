import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function UserDetail() {
  const { userId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchActivity();
  }, [userId]);

  const fetchActivity = async () => {
    try {
      const res = await API.get(`/logs/user/${userId}?days=30`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatHour = (decimalHour) => {
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour - hours) * 60);

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
};

  if (!data) return <div>Loading...</div>;

  const { summary, logs } = data;

  return (
    <div className="user-activity-container">
      <h1>{userId} - Last 30 Days Activity</h1>

      <div className="activity-summary">
        <div className="activity-card">
          <h3>Total Sessions</h3>
          <p>{summary.total_sessions}</p>
        </div>

        <div className="activity-card">
          <h3>Total Anomalies</h3>
          <p>{summary.total_anomalies}</p>
        </div>

        <div className="activity-card">
          <h3>Avg Login Hour</h3>
          <p>{summary.avg_login_hour}</p>
        </div>

        <div className="activity-card">
          <h3>Total Download (MB)</h3>
          <p>{summary.total_download}</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Login Time</th>
              <th>Files</th>
              <th>Download (MB)</th>
              <th>IP</th>
              <th>Device</th>
              <th>Sensitive</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No activity in last 30 days
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.log_id}>
                  <td>{new Date(log.timestamp).toLocaleDateString()}</td>
                  <td>{formatHour(log.login_hour)}</td>
                  <td>{Math.floor(log.files_accessed)}</td>
                  <td>{log.download_mb.toFixed(2)}</td>
                  <td>{log.ip_address}</td>
                  <td>{log.device_id}</td>
                  <td>{log.sensitive_access ? "Yes" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}