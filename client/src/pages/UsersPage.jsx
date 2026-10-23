import { useEffect, useState } from 'react';
import api from '../services/api.js';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data || []);
      } catch (error) {
        console.error('Users fetch failed', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">CPM</div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/projects">Projects</a>
          <a className="active" href="/users">Users</a>
          <a href="/profile">Profile</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Administration</p>
            <h2>Users</h2>
          </div>
        </header>

        <section className="panel">
          <div className="list-box">
            {users.map((user) => (
              <div key={user._id} className="list-item">
                <div>
                  <strong>{user.fullName}</strong>
                  <p>{user.email}</p>
                </div>
                <span className="status-badge">{user.role}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UsersPage;
