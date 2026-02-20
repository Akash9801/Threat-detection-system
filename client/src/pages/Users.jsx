import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const filtered = users.filter(u =>
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1>Users</h1>

      <input
        type="text"
        placeholder="Search user..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p style={{ marginTop: "20px", color: "#f87171" }}>
          No such user found
        </p>
      ) : (
        <div className="user-grid">
          {filtered.map(user => (
            <div
              key={user.user_id}
              className="user-card"
              onClick={() => navigate(`/users/${user.user_id}`)}
            >
              <h3>{user.user_id}</h3>
              <p>{user.department}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
