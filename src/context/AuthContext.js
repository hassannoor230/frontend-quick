import React, { createContext, useContext, useState } from 'react';
import API from '../utils/api';
const Ctx = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('pos_user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('pos_token', data.token); localStorage.setItem('pos_user', JSON.stringify(data.user));
      setUser(data.user); return { ok: true, user: data.user };
    } catch (e) { return { ok: false, msg: e.response?.data?.message || 'Login failed' }; }
    finally { setLoading(false); }
  };
  const logout = () => { localStorage.removeItem('pos_token'); localStorage.removeItem('pos_user'); setUser(null); };
  const can = (...roles) => roles.includes(user?.role);
  return <Ctx.Provider value={{ user, login, logout, loading, can }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
