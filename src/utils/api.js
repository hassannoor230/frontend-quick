import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('pos_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('pos_token'); localStorage.removeItem('pos_user'); window.location.href = '/login'; }
  return Promise.reject(err);
});
export default API;
