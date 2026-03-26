import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLE_INFO = {
  admin: {
    color: '#3b82f6', badge: 'badge-blue', label: 'Administrator',
    perms: ['Full system access', 'Manage all users', 'Delete any record', 'View all reports & stats', 'Manage products & categories', 'Refund orders']
  },
  manager: {
    color: '#f59e0b', badge: 'badge-yellow', label: 'Manager',
    perms: ['POS terminal access', 'View all orders', 'Manage products & categories', 'Stock management', 'View dashboard & reports', 'Refund orders', '✗ Cannot manage users']
  },
  cashier: {
    color: '#10b981', badge: 'badge-green', label: 'Cashier',
    perms: ['POS terminal access', 'View own orders only', '✗ No inventory access', '✗ No dashboard stats', '✗ No refund capability', '✗ No user management']
  },
};

function UserModal({ editUser, onClose, onSave }) {
  const blank = { name: '', email: '', password: '', role: 'cashier', isActive: true, phone: '' };
  const [form, setForm] = useState(editUser ? { ...editUser, password: '' } : blank);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form };
      if (editUser && !payload.password) delete payload.password;
      if (editUser) await API.put(`/users/${editUser._id}`, payload);
      else await API.post('/users', payload);
      toast.success(editUser ? 'User updated!' : 'User created!'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const roleInfo = ROLE_INFO[form.role];

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-head">
          <span className="modal-title">{editUser ? 'Edit User' : 'New User'}</span>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+92-300-..." />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Email Address *</label>
              <div className="input-wrap">
                <span className="input-icon"><span style={{ width: 15, height: 15, display: 'block' }}>{IC.users}</span></span>
                <input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@company.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">{editUser ? 'New Password (blank = keep current)' : 'Password *'}</label>
              <input className="input" type="password" required={!editUser} minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={editUser ? 'Leave blank to keep current password' : 'Minimum 6 characters'} />
            </div>
            <div className="form-group">
              <label className="label">Role *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(ROLE_INFO).map(([role, info]) => (
                  <button type="button" key={role} onClick={() => setForm({ ...form, role })}
                    className={`btn ${form.role === role ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1, justifyContent: 'center', borderColor: form.role === role ? undefined : info.color + '44', fontSize: 12 }}>
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Preview */}
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, border: `1px solid ${roleInfo.color}33` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: roleInfo.color, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
                {roleInfo.label} Permissions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {roleInfo.perms.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: p.startsWith('✗') ? 'var(--text3)' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: p.startsWith('✗') ? 'var(--text3)' : roleInfo.color, flexShrink: 0 }}>
                      {p.startsWith('✗') ? '✗' : '✓'}
                    </span>
                    {p.replace('✗ ', '')}
                  </div>
                ))}
              </div>
            </div>

            <label className="toggle-row">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <div>
                <div className="toggle-label">Account Active</div>
                <div className="t-xs t-dim">Inactive users cannot log in</div>
              </div>
            </label>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: me } = useAuth();

  const load = () => { setLoading(true); API.get('/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const del = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try { await API.delete(`/users/${id}`); toast.success('User deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const roleCount = (role) => users.filter(u => u.role === role).length;

  return (
    <Layout title="User Management"
      actions={<button className="btn btn-primary" onClick={() => setModal({ open: true })}>{IC.plus} New User</button>}>

      {/* Role Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {Object.entries(ROLE_INFO).map(([role, info]) => (
          <div key={role} className="stat-card" style={{ '--accent-color': info.color }}>
            <div className="stat-icon-wrap" style={{ background: info.color + '18', color: info.color }}>
              <span style={{ width: 22, height: 22, display: 'block' }}>{IC.users}</span>
            </div>
            <div className="stat-val">{roleCount(role)}</div>
            <div className="stat-label">{info.label}s</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading
          ? <div className="page-loader"><div className="spinner" /></div>
          : <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Last Login</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const info = ROLE_INFO[u.role];
                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: info.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {u.name}
                                {u._id === me?._id && <span className="badge badge-blue" style={{ fontSize: 9 }}>You</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="t-sm t-muted">{u.email}</td>
                        <td className="t-sm t-muted">{u.phone || '—'}</td>
                        <td><span className={`badge ${info.badge}`}>{info.label}</span></td>
                        <td><span className={`badge badge-${u.isActive ? 'green' : 'red'}`}>{u.isActive ? '● Active' : '○ Inactive'}</span></td>
                        <td className="t-xs t-dim">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                        <td className="t-xs t-dim">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u._id !== me?._id
                            ? <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button className="btn-icon" onClick={() => setModal({ open: true, user: u })}>
                                  <span style={{ width: 14, height: 14, display: 'block' }}>{IC.edit}</span>
                                </button>
                                <button className="btn-icon" onClick={() => del(u._id, u.name)}
                                  style={{ color: 'var(--red)', background: 'var(--red-bg)', borderColor: 'rgba(239,68,68,.2)' }}>
                                  <span style={{ width: 14, height: 14, display: 'block' }}>{IC.trash}</span>
                                </button>
                              </div>
                            : <span className="t-xs t-dim" style={{ float: 'right' }}>—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {users.length === 0 && <div className="empty-box"><span style={{ width: 48, height: 48, display: 'block' }}>{IC.users}</span><div className="empty-box-text">No users found</div></div>}
            </div>
        }
      </div>
      {modal?.open && <UserModal editUser={modal.user} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </Layout>
  );
}
