import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.data || []);
      } catch (error) {
        console.error('Failed to load projects', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">CPM</div>
        <nav>
          <a href="/">Dashboard</a>
          <a className="active" href="/projects">Projects</a>
          <a href="/users">Users</a>
          <a href="/profile">Profile</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2>Projects</h2>
          </div>
        </header>

        <section className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="card-head">
                <strong>{project.name}</strong>
                <span className="status-badge">{project.status}</span>
              </div>
              <p>{project.description || 'No description available'}</p>
              <Link className="link-button" to={`/projects/${project._id}`}>Open project</Link>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ProjectsPage;
