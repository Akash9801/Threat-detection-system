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
    try {
      const res = await API.get("/logs/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.user_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.user_id.localeCompare(b.user_id));

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Organization Users</h1>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by User ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <h2>No Users Matched</h2>
          <p>Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user, index) => (
            <div
              key={user.user_id}
              className="user-card"
              onClick={() => navigate(`/users/${user.user_id}`)}
            >
              <div className="left-section">
                <div className="user-avatar">
                  {index + 1}
                </div>

                <span className="user-name">
                  {user.user_id}
                </span>
              </div>

              <span className="user-department">
                {user.department}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}