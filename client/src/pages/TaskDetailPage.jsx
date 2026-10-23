import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';

const TaskDetailPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.data.task);
        setComments(response.data.data.comments || []);
      } catch (error) {
        console.error('Task fetch failed', error);
      }
    };

    fetchTask();
  }, [id]);

  if (!task) return <div className="loading-state">Loading task...</div>;

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
            <p className="eyebrow">Task</p>
            <h2>{task.title}</h2>
          </div>
          <span className="status-badge">{task.status}</span>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h3>Task overview</h3>
            <Link className="link-button" to={`/projects/${task.projectId}`}>
              Back to project
            </Link>
          </div>

          <p>{task.description || 'No task description provided.'}</p>

          <div className="list-box">
            <div className="list-item"><div><strong>Priority</strong><p>{task.priority}</p></div></div>
            <div className="list-item"><div><strong>Due date</strong><p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p></div></div>
            <div className="list-item"><div><strong>Version</strong><p>{task.version}</p></div></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Comments</h3>
          </div>
          <div className="list-box">
            {comments.length ? comments.map((comment) => (
              <div key={comment._id} className="list-item">
                <div>
                  <strong>{comment.userId?.fullName || 'User'}</strong>
                  <p>{comment.content}</p>
                </div>
              </div>
            )) : <p>No comments yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TaskDetailPage;
