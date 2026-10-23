import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.data || []);
      } catch (error) {
        console.error('Dashboard fetch failed', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">CPM</div>
        <nav>
          <a className="active" href="/">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/users">Users</a>
          <a href="/profile">Profile</a>
        </nav>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Welcome, {user?.fullName}</h2>
          </div>
          <div className="chip">Role: {user?.role}</div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total projects</span>
            <strong>{projects.length}</strong>
          </div>
          <div className="stat-card">
            <span>Active tasks</span>
            <strong>14</strong>
          </div>
          <div className="stat-card">
            <span>Due soon</span>
            <strong>5</strong>
          </div>
          <div className="stat-card">
            <span>Team members</span>
            <strong>12</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Projects</h3>
          </div>
          <div className="list-box">
            {projects.map((project) => (
              <div key={project._id} className="list-item">
                <div>
                  <strong>{project.name}</strong>
                  <p>{project.description || 'No description yet'}</p>
                </div>
                <span className="status-badge">{project.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
