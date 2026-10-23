import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cp_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('cp_token') || '');

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('cp_user', JSON.stringify(userData));
    localStorage.setItem('cp_token', newToken);
    setUser(userData);
    setToken(newToken);
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('cp_user', JSON.stringify(userData));
    localStorage.setItem('cp_token', newToken);
    setUser(userData);
    setToken(newToken);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_token');
    setUser(null);
    setToken('');
  };

  useEffect(() => {
    if (!token) return;
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
