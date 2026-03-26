import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';

const TOOLTIP_STYLE = { background: 'var(--bg2)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 10, fontSize: 12, color: 'var(--text)' };

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon-wrap" style={{ background: bg, color }}>
        <span style={{ width: 22, height: 22, display: 'block' }}>{icon}</span>
      </div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/stats')
      .then(r => { setStats(r.data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div className="page-loader"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
    </Layout>
  );

  const todayRev = stats?.todayRevenue || 0;
  const monthRev = stats?.monthRevenue || 0;
  const totalRev = stats?.totalRevenue || 0;

  const statCards = [
    { label: "Today's Revenue", value: `Rs. ${todayRev.toLocaleString()}`, icon: IC.cash, color: 'var(--gold-light)', bg: 'var(--gold-glow)' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: IC.orders, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Month Revenue', value: `Rs. ${monthRev.toLocaleString()}`, icon: IC.stock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'All Time Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: IC.products, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ];

  return (
    <Layout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid4 mb20">
        {statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid2" style={{ gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue — Last 7 Days</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={stats?.last7 || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(201,168,76,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Orders — Last 7 Days</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats?.last7 || []}>
                <CartesianGrid stroke="rgba(201,168,76,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {(stats?.last7 || []).map((_, i) => (
                    <Cell key={i} fill={i === 6 ? 'var(--gold)' : 'var(--bg4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats?.topProducts?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Selling Products</span>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Qty Sold</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#f59e0b22' : 'var(--bg4)', color: i === 0 ? '#f59e0b' : 'var(--text3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text)', fontWeight: 600 }}>{p._id}</td>
                    <td><span className="badge badge-blue">{p.qty} units</span></td>
                    <td className="text-right"><span className="mono t-blue" style={{ fontWeight: 700 }}>Rs. {p.total.toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
