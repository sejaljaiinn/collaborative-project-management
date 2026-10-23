import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

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

    const fetchTasks = async () => {
      try {
        const response = await api.get(`/tasks/project/${id}/tasks`);
        setTasks(response.data.data || []);
      } catch (error) {
        console.error('Tasks fetch failed', error);
      }
    };

    fetchProject();
    fetchTasks();
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
            {members.length ? members.map((member) => (
              <div key={member._id} className="list-item">
                <div>
                  <strong>{member.userId?.fullName || 'User'}</strong>
                  <p>{member.role}</p>
                </div>
              </div>
            )) : <p>No members in this project yet.</p>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Tasks</h3>
          </div>
          <div className="list-box">
            {tasks.length ? tasks.map((task) => (
              <div key={task._id} className="list-item">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.status} • {task.priority}</p>
                </div>
                <Link className="link-button" to={`/tasks/${task._id}`}>Open</Link>
              </div>
            )) : <p>No tasks created for this project yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
