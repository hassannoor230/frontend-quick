import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function OrderModal({ order, onClose, onRefund, canRefund }) {
  const payIcon = { cash: IC.cash, card: IC.card, online: IC.phone };
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Order #{order.orderNumber}</div>
            <div className="t-xs t-dim mt4">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Info Row */}
          <div className="grid2" style={{ gap: 10 }}>
            {[
              { label: 'Cashier', val: order.cashierName },
              { label: 'Payment', val: <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 14, height: 14, display: 'block' }}>{payIcon[order.paymentMethod]}</span><span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span></div> },
              { label: 'Status', val: <span className={`badge badge-${order.status === 'completed' ? 'green' : order.status === 'refunded' ? 'yellow' : 'red'}`}>{order.status}</span> },
              { label: 'Items', val: `${order.items?.length} products` },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div className="t-xs t-dim" style={{ marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>{x.label}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{x.val}</div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <div className="t-xs t-dim mb8" style={{ textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 700 }}>Items</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                {item.productImage
                  ? <img src={item.productImage} alt={item.productName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 16, height: 16, display: 'block', color: 'var(--text3)' }}>{IC.image}</span>
                    </div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{item.productName}</div>
                  {item.variation?.optionLabel && <div className="t-xs t-dim">{item.variation.variationName}: {item.variation.optionLabel}</div>}
                  <div className="t-xs t-dim">Rs. {item.unitPrice.toLocaleString()} × {item.quantity}</div>
                </div>
                <span className="mono t-blue" style={{ fontWeight: 700 }}>Rs. {item.totalPrice.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14, border: '1px solid var(--border2)' }}>
            <div className="total-row"><span>Subtotal</span><span className="mono">Rs. {order.subtotal?.toFixed(0)}</span></div>
            {order.taxTotal > 0 && <div className="total-row"><span>Tax</span><span className="mono">Rs. {order.taxTotal?.toFixed(0)}</span></div>}
            {order.discount > 0 && <div className="total-row" style={{ color: 'var(--green)' }}><span>Discount</span><span className="mono">−Rs. {order.discount?.toFixed(0)}</span></div>}
            <div className="total-row grand"><span>Total</span><span>Rs. {order.total?.toFixed(0)}</span></div>
            {order.paymentMethod === 'cash' && (
              <>
                <div className="total-row"><span>Received</span><span className="mono">Rs. {order.amountPaid?.toFixed(0)}</span></div>
                <div className="total-row" style={{ color: 'var(--green)' }}><span>Change</span><span className="mono">Rs. {order.change?.toFixed(0)}</span></div>
              </>
            )}
          </div>
          {order.note && <div style={{ padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>📝 {order.note}</div>}
        </div>
        <div className="modal-foot">
          {canRefund && order.status === 'completed' && (
            <button className="btn btn-danger-soft" onClick={() => { onRefund(order._id); onClose(); }}>
              <span style={{ width: 14, height: 14, display: 'block' }}>{IC.refund}</span> Refund Order
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { can } = useAuth();

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 15 });
    if (statusFilter) params.append('status', statusFilter);
    API.get(`/orders?${params}`).then(r => {
      setOrders(r.data.orders); setTotalPages(r.data.pages); setTotal(r.data.total); setPage(p);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(1); }, [statusFilter]);

  const refund = async (id) => {
    if (!window.confirm('Refund this order? Stock will be restored.')) return;
    try { await API.patch(`/orders/${id}/refund`); toast.success('Order refunded'); load(page); }
    catch (err) { toast.error(err.response?.data?.message || 'Refund failed'); }
  };

  const statusBadge = (s) => {
    const map = { completed: 'green', refunded: 'yellow', cancelled: 'red', pending: 'cyan' };
    return <span className={`badge badge-${map[s] || 'gray'}`}>{s}</span>;
  };

  return (
    <Layout title="Orders"
      actions={
        <select className="input select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      }>
      <div className="card">
        {loading
          ? <div className="page-loader"><div className="spinner" /></div>
          : <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Order #</th><th>Date & Time</th><th>Items</th><th>Total</th><th>Method</th><th>Status</th><th>Cashier</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><span className="mono t-blue" style={{ fontWeight: 700 }}>{o.orderNumber}</span></td>
                      <td className="t-sm">{new Date(o.createdAt).toLocaleString()}</td>
                      <td><span className="badge badge-gray">{o.items?.length} items</span></td>
                      <td><span className="mono" style={{ fontWeight: 700, color: 'var(--text)' }}>Rs. {o.total?.toLocaleString()}</span></td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 14, height: 14, display: 'block', color: 'var(--text3)' }}>
                            {o.paymentMethod === 'cash' ? IC.cash : o.paymentMethod === 'card' ? IC.card : IC.phone}
                          </span>
                          <span style={{ textTransform: 'capitalize', fontSize: 12 }}>{o.paymentMethod}</span>
                        </span>
                      </td>
                      <td>{statusBadge(o.status)}</td>
                      <td className="t-sm t-muted">{o.cashierName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(o)}>
                            <span style={{ width: 13, height: 13, display: 'block' }}>{IC.eye}</span> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="empty-box">
                  <span style={{ width: 48, height: 48, display: 'block' }}>{IC.orders}</span>
                  <div className="empty-box-text">No orders found</div>
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="t-xs t-dim">{total} total orders</span>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => load(page - 1)}>← Prev</button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => load(page + 1)}>Next →</button>
                </div>
              )}
            </div>
          </>
        }
      </div>
      {selected && <OrderModal order={selected} canRefund={can('admin', 'manager')} onClose={() => setSelected(null)} onRefund={refund} />}
    </Layout>
  );
}
