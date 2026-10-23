import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'admin@projecthub.com',
    password: 'admin123'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Collaborative PM</p>
          <h1>Sign in</h1>
          <p className="muted">Welcome back. Manage projects, tasks, and team work securely.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo users</strong>
          <p>admin@projecthub.com / admin123</p>
          <p>manager@projecthub.com / manager123</p>
          <p>member@projecthub.com / member123</p>
        </div>

        <Link to="/projects" className="link-button">Browse projects</Link>
      </div>
    </div>
  );
};

export default LoginPage;
