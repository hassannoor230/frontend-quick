import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IC } from '../../components/Icons';
import toast from 'react-hot-toast';

const DEMOS = [
  { role: 'Admin',   email: 'admin@pos.com',   pw: 'admin123',   color: '#5dace0' },
  { role: 'Manager', email: 'manager@pos.com', pw: 'manager123', color: '#e2c27a' },
  { role: 'Cashier', email: 'cashier@pos.com', pw: 'cashier123', color: '#4db87a' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.ok) {
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } else {
      toast.error(res.msg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-grid-bg" />

      <div className="login-box fade-in">
        {/* Brand */}
        <div className="login-logo-wrap">
          <div className="login-logo">{IC.store}</div>
          <h1 className="login-title">QuickPOS</h1>
          <p className="login-sub">Point of Sale System</p>
        </div>

        {/* Card */}
        <div className="card card-p" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">{IC.users}</span>
                <input className="input" type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <div className="input-wrap">
                  <span className="input-icon">{IC.card}</span>
                  <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required style={{ paddingRight: 44 }} />
                </div>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 4, transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                  <span style={{ width: 15, height: 15, display: 'block' }}>{showPw ? IC.eyeOff : IC.eye}</span>
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
              style={{ justifyContent: 'center', marginTop: 4, letterSpacing: '.1em' }}>
              {loading
                ? <><span className="spinner" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: 'var(--obsidian)' }} /> Signing in…</>
                : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, display: 'block' }}>{IC.check}</span>
                    Sign In
                  </div>
                )}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 22 }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,var(--border2),transparent)', marginBottom: 16 }} />
            <p className="t-xs t-dim text-center mb8" style={{ textTransform: 'uppercase', letterSpacing: '.15em' }}>
              Quick Access
            </p>
            <div className="demo-row">
              {DEMOS.map(d => (
                <button key={d.role} className="demo-btn" onClick={() => setForm({ email: d.email, password: d.pw })}>
                  <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: d.color, margin: '0 auto 5px', boxShadow: `0 0 6px ${d.color}` }} />
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="t-xs t-dim text-center mt16" style={{ letterSpacing: '.1em' }}>
          QuickPOS v2.0 &mdash; Luxury Edition
        </p>
      </div>
    </div>
  );
}