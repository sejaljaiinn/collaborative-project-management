import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data.data.project);
        setMembers(response.data.data.members || []);
      } catch (error) {
        console.error('Project fetch failed', error);
      }
    };

    fetchProject();
  }, [id]);

  if (!project) return <div className="loading-state">Loading project...</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">CPM</div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/users">Users</a>
          <a href="/profile">Profile</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Project</p>
            <h2>{project.name}</h2>
          </div>
          <span className="status-badge">{project.status}</span>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h3>Project overview</h3>
          </div>

          <p>{project.description || 'No description provided.'}</p>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Members</h3>
          </div>
          <div className="list-box">
            {members.map((member) => (
              <div key={member._id} className="list-item">
                <div>
                  <strong>{member.userId?.fullName || 'User'}</strong>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
