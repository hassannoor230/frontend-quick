import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';

// ─── Shared chart tooltip style ───────────────────────────────────────────────
const TT = {
  contentStyle: {
    background: '#111827', border: '1px solid #1e2d42',
    borderRadius: 10, fontSize: 12, color: '#f0f4ff',
  },
};

// ─── Preset date ranges ───────────────────────────────────────────────────────
function getPreset(key) {
  const now   = new Date();
  const fmt   = d => d.toISOString().slice(0, 10);
  const start = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };

  switch (key) {
    case 'today': {
      const d = fmt(start(now)); return { from: d, to: d };
    }
    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate()-1);
      const d = fmt(start(y)); return { from: d, to: d };
    }
    case 'week': {
      const s = new Date(now); s.setDate(s.getDate()-6);
      return { from: fmt(start(s)), to: fmt(now) };
    }
    case 'month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: fmt(s), to: fmt(now) };
    }
    case 'last_month': {
      const s = new Date(now.getFullYear(), now.getMonth()-1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(s), to: fmt(e) };
    }
    case 'year': {
      return { from: `${now.getFullYear()}-01-01`, to: fmt(now) };
    }
    default: return { from: fmt(new Date(now.setDate(now.getDate()-29))), to: fmt(new Date()) };
  }
}

const PRESETS = [
  { key: 'today',      label: 'Today'      },
  { key: 'yesterday',  label: 'Yesterday'  },
  { key: 'week',       label: 'Last 7 Days'},
  { key: 'month',      label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'year',       label: 'This Year'  },
];

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, color = '#3b82f6', icon }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon-wrap" style={{ background: color + '18', color }}>
        <span style={{ width: 22, height: 22, display: 'block' }}>{icon}</span>
      </div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change" style={{ color }}>{sub}</div>}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children, action }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        {action}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// ─── Custom Pie label ─────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Hourly Heatmap ───────────────────────────────────────────────────────────
function Heatmap({ data }) {
  // build 7×24 grid
  const grid = {};
  data.forEach(d => {
    const k = `${d.day}-${d.hour}`;
    grid[k] = (grid[k] || 0) + d.orders;
  });
  const maxVal = Math.max(1, ...Object.values(grid));

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Hour labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(24,1fr)', gap: 3, minWidth: 680 }}>
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', fontFamily: 'IBM Plex Mono', marginBottom: 4 }}>
            {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`}
          </div>
        ))}

        {/* Day rows */}
        {DAYS.map((day, di) => (
          <React.Fragment key={day}>
            <div style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', alignItems: 'center', fontFamily: 'IBM Plex Mono', fontWeight: 600 }}>{day}</div>
            {Array.from({ length: 24 }, (_, h) => {
              const val = grid[`${di+1}-${h}`] || 0;
              const intensity = val / maxVal;
              const bg = intensity === 0
                ? 'var(--bg4)'
                : `rgba(59,130,246,${0.12 + intensity * 0.88})`;
              return (
                <div key={h} title={`${day} ${h}:00 — ${val} orders`}
                  style={{ height: 20, borderRadius: 3, background: bg, cursor: val > 0 ? 'default' : 'default', transition: 'background .2s' }} />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>Less</span>
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
          <div key={v} style={{ width: 16, height: 16, borderRadius: 3, background: v === 0 ? 'var(--bg4)' : `rgba(59,130,246,${0.12 + v * 0.88})` }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>More</span>
      </div>
    </div>
  );
}

// ─── MAIN REPORTS PAGE ────────────────────────────────────────────────────────
export default function Reports() {
  const [preset, setPreset]   = useState('month');
  const [range, setRange]     = useState(getPreset('month'));
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');  // overview | products | cashiers | heatmap

  const [summary,    setSummary]    = useState(null);
  const [daily,      setDaily]      = useState([]);
  const [topProds,   setTopProds]   = useState([]);
  const [catRev,     setCatRev]     = useState([]);
  const [cashiers,   setCashiers]   = useState([]);
  const [heatmap,    setHeatmap]    = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams(range).toString();
    try {
      const [s, d, tp, cr, ca, hm] = await Promise.all([
        API.get(`/reports/sales-summary?${p}`),
        API.get(`/reports/daily-revenue?${p}`),
        API.get(`/reports/top-products?${p}&limit=10`),
        API.get(`/reports/category-revenue?${p}`),
        API.get(`/reports/cashier-performance?${p}`),
        API.get(`/reports/hourly-heatmap?${p}`),
      ]);
      setSummary(s.data.summary);
      setDaily(d.data.data);
      setTopProds(tp.data.data);
      setCatRev(cr.data.data);
      setCashiers(ca.data.data);
      setHeatmap(hm.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const applyPreset = (key) => { setPreset(key); setRange(getPreset(key)); };

  const fmtRs   = n => `Rs. ${(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  const fmtNum  = n => (n || 0).toLocaleString();
  const totalRev = summary?.totalRevenue || 0;

  const TABS = [
    { key: 'overview',  label: 'Overview'          },
    { key: 'products',  label: 'Products'           },
    { key: 'cashiers',  label: 'Cashier Performance'},
    { key: 'heatmap',   label: 'Sales Heatmap'      },
  ];

  return (
    <Layout
      title="Reports & Analytics"
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date range inputs */}
          <input type="date" className="input" style={{ width: 140 }} value={range.from}
            onChange={e => { setPreset('custom'); setRange(r => ({ ...r, from: e.target.value })); }} />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>→</span>
          <input type="date" className="input" style={{ width: 140 }} value={range.to}
            onChange={e => { setPreset('custom'); setRange(r => ({ ...r, to: e.target.value })); }} />
          <button className="btn btn-primary btn-sm" onClick={load} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> : IC.search}
            Apply
          </button>
        </div>
      }
    >
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <button key={p.key}
            className={`cat-tab${preset === p.key ? ' on' : ''}`}
            onClick={() => applyPreset(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid4 mb20" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <Stat label="Total Revenue"    value={fmtRs(summary?.totalRevenue)}   color="#3b82f6" icon={IC.cash}     sub={`Avg ${fmtRs(summary?.avgOrderValue)} / order`} />
        <Stat label="Total Orders"     value={fmtNum(summary?.totalOrders)}   color="#10b981" icon={IC.orders}   sub={`${summary?.refunded || 0} refunded`} />
        <Stat label="Total Discount"   value={fmtRs(summary?.totalDiscount)}  color="#f59e0b" icon={IC.warning}  />
        <Stat label="Tax Collected"    value={fmtRs(summary?.taxTotal)}       color="#8b5cf6" icon={IC.products} />
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? 'var(--blue)' : 'var(--text3)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--blue)' : 'transparent'}`,
              transition: 'all .15s', fontFamily: 'Sora, sans-serif',
              marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="page-loader"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      )}

      {!loading && (
        <>
          {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
          {tab === 'overview' && (
            <>
              {/* Daily Revenue Chart */}
              <Section title="Revenue & Orders — Daily">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={daily}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e2d42" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4d637f' }} />
                    <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: '#4d637f' }} orientation="left" />
                    <YAxis yAxisId="ord" tick={{ fontSize: 11, fill: '#4d637f' }} orientation="right" />
                    <Tooltip {...TT} formatter={(v, n) => [n === 'revenue' ? `Rs. ${v.toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
                    <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gRev)" dot={false} />
                    <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Section>

              {/* Payment Method Breakdown + Category Pie */}
              <div className="grid2" style={{ gap: 16, marginBottom: 16 }}>
                {/* Payment breakdown */}
                <Section title="Payment Methods">
                  {['cash','card','online'].map(m => {
                    const rev = summary?.[`${m}Revenue`] || 0;
                    const cnt = summary?.[`${m}Orders`]  || 0;
                    const pct = totalRev > 0 ? (rev / totalRev * 100).toFixed(1) : 0;
                    const colors = { cash: '#10b981', card: '#3b82f6', online: '#f59e0b' };
                    const icons  = { cash: IC.cash, card: IC.card, online: IC.phone };
                    return (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: colors[m] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors[m], flexShrink: 0 }}>
                          <span style={{ width: 18, height: 18, display: 'block' }}>{icons[m]}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{m}</span>
                            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: colors[m] }}>Rs. {rev.toLocaleString()}</span>
                          </div>
                          <div style={{ width: '100%', height: 5, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: colors[m], borderRadius: 99, transition: 'width .5s' }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{cnt} orders · {pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </Section>

                {/* Category Pie */}
                <Section title="Revenue by Category">
                  {catRev.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={catRev} dataKey="revenue" nameKey="name" cx="50%" cy="50%"
                            outerRadius={85} labelLine={false} label={renderPieLabel}>
                            {catRev.map((c, i) => (
                              <Cell key={i} fill={c.color || PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...TT} formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {catRev.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color || PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            {c.name}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="empty-box" style={{ padding: 24 }}><div className="empty-box-text">No data</div></div>}
                </Section>
              </div>
            </>
          )}

          {/* ══════════════════ PRODUCTS TAB ══════════════════ */}
          {tab === 'products' && (
            <>
              {/* Bar chart */}
              <Section title="Top Products by Revenue">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProds.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid stroke="#1e2d42" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#4d637f' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#8899bb' }} />
                    <Tooltip {...TT} formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {topProds.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : '#1a2235'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Section>

              {/* Table */}
              <div className="card">
                <div className="card-header"><span className="card-title">Product Performance</span></div>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Qty Sold</th>
                        <th>Orders</th>
                        <th className="text-right">Revenue</th>
                        <th className="text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProds.map((p, i) => {
                        const share = totalRev > 0 ? (p.revenue / totalRev * 100).toFixed(1) : 0;
                        return (
                          <tr key={i}>
                            <td>
                              <span style={{
                                width: 26, height: 26, borderRadius: '50%', display: 'inline-flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800,
                                background: i < 3 ? ['#f59e0b18','#8899bb18','#c0785018'][i] : 'var(--bg4)',
                                color: i < 3 ? ['#f59e0b','#8899bb','#c07850'][i] : 'var(--text3)',
                              }}>{i + 1}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {p.image
                                  ? <img src={p.image} alt={p.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                                  : <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span style={{ width: 16, height: 16, display: 'block', color: 'var(--text3)' }}>{IC.image}</span>
                                    </div>
                                }
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                              </div>
                            </td>
                            <td><span className="badge badge-cyan">{p.qty} units</span></td>
                            <td><span className="t-muted">{p.orders}</span></td>
                            <td className="text-right"><span className="mono t-blue" style={{ fontWeight: 700 }}>Rs. {p.revenue.toLocaleString()}</span></td>
                            <td className="text-right">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                <div style={{ width: 60, height: 5, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${share}%`, background: 'var(--blue)', borderRadius: 99 }} />
                                </div>
                                <span className="t-xs t-muted">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {topProds.length === 0 && (
                    <div className="empty-box">
                      <span style={{ width: 48, height: 48, display: 'block' }}>{IC.products}</span>
                      <div className="empty-box-text">No product data in this period</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════ CASHIERS TAB ══════════════════ */}
          {tab === 'cashiers' && (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14, marginBottom: 16 }}>
                {cashiers.map((c, i) => {
                  const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'];
                  const col = colors[i % colors.length];
                  const initials = c.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
                  return (
                    <div key={i} className="card card-p" style={{ borderTop: `3px solid ${col}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: col, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          { l: 'Revenue', v: `Rs. ${c.revenue.toLocaleString()}`, c: col },
                          { l: 'Orders',  v: c.orders, c: 'var(--text)' },
                          { l: 'Avg Order', v: `Rs. ${Math.round(c.avgOrder).toLocaleString()}`, c: 'var(--text2)' },
                        ].map((x, j) => (
                          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--text3)' }}>{x.l}</span>
                            <span style={{ fontWeight: 700, color: x.c, fontFamily: j === 0 || j === 2 ? 'IBM Plex Mono' : 'inherit' }}>{x.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison Bar Chart */}
              {cashiers.length > 0 && (
                <Section title="Revenue Comparison">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={cashiers}>
                      <CartesianGrid stroke="#1e2d42" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8899bb' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#4d637f' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip {...TT} formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
                        {cashiers.map((_, i) => <Cell key={i} fill={['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i % 5]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Section>
              )}

              {/* Detail Table */}
              <div className="card">
                <div className="card-header"><span className="card-title">Cashier Details</span></div>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr><th>Cashier</th><th>Orders</th><th>Revenue</th><th>Avg Order</th><th>Discount Given</th><th className="text-right">Revenue Share</th></tr>
                    </thead>
                    <tbody>
                      {cashiers.map((c, i) => {
                        const share = totalRev > 0 ? (c.revenue / totalRev * 100).toFixed(1) : 0;
                        return (
                          <tr key={i}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i%5], color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                                  {c.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                              </div>
                            </td>
                            <td><span className="badge badge-blue">{c.orders}</span></td>
                            <td><span className="mono t-blue" style={{ fontWeight: 700 }}>Rs. {c.revenue.toLocaleString()}</span></td>
                            <td className="mono t-muted">Rs. {Math.round(c.avgOrder).toLocaleString()}</td>
                            <td className="t-yellow mono">Rs. {(c.discount || 0).toLocaleString()}</td>
                            <td className="text-right">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                <div style={{ width: 60, height: 5, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${share}%`, background: 'var(--blue)', borderRadius: 99 }} />
                                </div>
                                <span className="t-xs t-muted">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {cashiers.length === 0 && (
                    <div className="empty-box">
                      <span style={{ width: 48, height: 48, display: 'block' }}>{IC.users}</span>
                      <div className="empty-box-text">No cashier data in this period</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════ HEATMAP TAB ══════════════════ */}
          {tab === 'heatmap' && (
            <Section title="Busiest Hours & Days (Order Volume)">
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
                Darker blue = more orders. Use this to identify peak hours and plan staffing.
              </p>
              {heatmap.length > 0
                ? <Heatmap data={heatmap} />
                : <div className="empty-box">
                    <span style={{ width: 48, height: 48, display: 'block' }}>{IC.orders}</span>
                    <div className="empty-box-text">No order data in this period</div>
                  </div>
              }
            </Section>
          )}
        </>
      )}
    </Layout>
  );
}
