import { useEffect, useState } from "react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/logs/users");
        setUsers(res.data);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="page users-page">
      <h1>Users</h1>

      {loading && <p>Loading users...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="users-grid">
          {users.map(user => (
            <div className="user-card" key={user._id || user.user_id}>
              <h3>{user.name || "Unknown User"}</h3>
              <p><strong>ID:</strong> {user.user_id}</p>
              <p><strong>Department:</strong> {user.department || "N/A"}</p>
              <p><strong>Primary IP:</strong> {user.primary_ip || "N/A"}</p>
              <p><strong>Primary Device:</strong> {user.primary_device || "N/A"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
