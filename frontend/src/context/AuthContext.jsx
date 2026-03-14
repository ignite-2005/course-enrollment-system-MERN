import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) { // used AuthProvider to wrap the entire React app
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await apiGet('/auth/me');
        setUser(me);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function login(email, password) {
    const { token: t, user: u } = await apiPost('/auth/login', { email, password });
    localStorage.setItem('token', t);
    setUser(u);
  }

  async function register(payload) {
    const { token: t, user: u } = await apiPost('/auth/register', payload);
    localStorage.setItem('token', t);
    setUser(u);
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


