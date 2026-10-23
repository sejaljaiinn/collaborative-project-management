import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile(response.data.data || user);
      } catch (error) {
        console.error('Profile fetch failed', error);
        setProfile(user);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  if (!profile) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">CPM</div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/projects">Projects</a>
          <a href="/users">Users</a>
          <a className="active" href="/profile">Profile</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Profile</p>
            <h2>{profile.fullName}</h2>
          </div>
        </header>

        <section className="panel profile-panel">
          <div>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Status:</strong> {profile.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
