import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function UserDetail() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await API.get(`/users/${id}/logs`);
    setLogs(res.data);
  };

  return (
    <div>
      <h1>User Activity: {id}</h1>
      <h3>Last 30 Days</h3>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Login Hour</th>
            <th>Files</th>
            <th>Download</th>
            <th>Sensitive</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.log_id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.login_hour}</td>
              <td>{log.files_accessed}</td>
              <td>{log.download_mb}</td>
              <td>{log.sensitive_access ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
