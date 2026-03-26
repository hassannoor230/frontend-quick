import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IC } from '../../components/Icons';
import Sidebar from '../../components/layout/Sidebar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

/* ---- Variation Picker Modal ---- */
function VarModal({ product, onClose, onAdd }) {
  const [sel, setSel] = useState({});
  const confirm = () => {
    for (const v of product.variations) {
      if (!sel[v.name]) return toast.error(`Select ${v.name}`);
    }
    const opt = product.variations[0].options.find(o => o.label === sel[product.variations[0].name]);
    onAdd(product, { variationName: product.variations[0].name, optionLabel: opt.label, priceModifier: opt.priceModifier || 0 });
    onClose();
  };
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <span className="modal-title">Choose Options</span>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            {product.image
              ? <img src={product.image} alt={product.name} style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}><span style={{ width: 28, height: 28 }}>{IC.image}</span></div>
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{product.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{product.description || 'Select your preference below'}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue)', marginTop: 6, fontFamily: 'IBM Plex Mono' }}>Rs. {product.basePrice.toLocaleString()}</div>
            </div>
          </div>
          {product.variations.map(v => (
            <div key={v.name} className="var-group">
              <div className="var-group-name">{v.name}</div>
              <div className="var-opts">
                {v.options.map(opt => (
                  <button key={opt.label} className={`var-opt${sel[v.name] === opt.label ? ' picked' : ''}`}
                    onClick={() => setSel({ ...sel, [v.name]: opt.label })}>
                    {opt.label}
                    {opt.priceModifier !== 0 && <span style={{ marginLeft: 4, opacity: .7 }}>({opt.priceModifier > 0 ? '+' : ''}Rs.{opt.priceModifier})</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={confirm}>{IC.plus} Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

/* ---- Invoice Modal ---- */
const INVOICE_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; background: #fff; color: #111; padding: 32px; font-size: 13px; }
  .inv-wrap { max-width: 560px; margin: 0 auto; }
  .inv-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #111; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .brand-sub { font-size: 11px; color: #666; margin-top: 3px; }
  .inv-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .8px; font-weight: 700; }
  .inv-num { font-size: 20px; font-weight: 800; font-family: 'IBM Plex Mono'; color: #111; margin-top: 4px; }
  .inv-date { font-size: 11px; color: #888; margin-top: 4px; }
  .meta-row { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
  .meta-cell { flex: 1; padding: 12px 16px; border-right: 1px solid #e5e7eb; }
  .meta-cell:last-child { border-right: none; }
  .meta-key { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: .7px; font-weight: 700; margin-bottom: 4px; }
  .meta-val { font-size: 13px; font-weight: 700; color: #111; text-transform: capitalize; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #f3f4f6; }
  th { text-align: left; padding: 9px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: #666; }
  th:last-child, td:last-child { text-align: right; }
  td { padding: 11px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
  .prod-name { font-weight: 600; color: #111; }
  .prod-var { font-size: 11px; color: #999; margin-top: 2px; }
  .totals { border-top: 1px solid #e5e7eb; padding-top: 14px; }
  .tot-row { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 7px; }
  .tot-row.grand { font-size: 17px; font-weight: 800; color: #111; font-family: 'IBM Plex Mono'; border-top: 2px solid #111; padding-top: 10px; margin-top: 8px; }
  .tot-row.disc { color: #16a34a; }
  .change-row { margin-top: 10px; padding: 10px 14px; background: #f0fdf4; border-radius: 8px; display: flex; justify-content: space-between; font-weight: 700; color: #16a34a; font-size: 14px; }
  .footer { margin-top: 32px; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; line-height: 1.8; }
  .note-box { margin-top: 14px; padding: 10px 14px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #666; border-left: 3px solid #d1d5db; }
  @media print {
    body { padding: 16px; }
    .no-print { display: none !important; }
  }
`;

function InvoiceModal({ order, onClose, onNewOrder }) {
  if (!order) return null;

  const printInvoice = () => {
    const win = window.open('', '_blank', 'width=680,height=820');
    const subtotal = order.subtotal || 0;
    const tax      = order.taxTotal || 0;
    const discount = order.discount || 0;
    const total    = order.total || 0;
    const paid     = order.amountPaid || 0;
    const change   = order.change || 0;
    const dateStr  = new Date(order.createdAt || Date.now()).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const payIcon = { cash: '💵', card: '💳', online: '📱' };

    const itemRows = (order.items || []).map(item => `
      <tr>
        <td>
          <div class="prod-name">${item.productName}</div>
          ${item.variation?.optionLabel ? `<div class="prod-var">${item.variation.variationName}: ${item.variation.optionLabel}</div>` : ''}
        </td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">Rs. ${item.unitPrice.toLocaleString()}</td>
        <td style="font-weight:700; color:#111">Rs. ${item.totalPrice.toLocaleString()}</td>
      </tr>
    `).join('');

    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Invoice — ${order.orderNumber}</title>
      <style>${INVOICE_STYLE}</style>
    </head><body>
    <div class="inv-wrap">
      <div class="inv-head">
        <div>
          <div class="brand">🏪 QuickPOS</div>
          <div class="brand-sub">Point of Sale System</div>
        </div>
        <div style="text-align:right">
          <div class="inv-label">Invoice</div>
          <div class="inv-num">${order.orderNumber}</div>
          <div class="inv-date">${dateStr}</div>
        </div>
      </div>

      <div class="meta-row">
        <div class="meta-cell">
          <div class="meta-key">Cashier</div>
          <div class="meta-val">${order.cashierName || '—'}</div>
        </div>
        <div class="meta-cell">
          <div class="meta-key">Payment</div>
          <div class="meta-val">${payIcon[order.paymentMethod] || ''} ${order.paymentMethod}</div>
        </div>
        <div class="meta-cell">
          <div class="meta-key">Items</div>
          <div class="meta-val">${(order.items || []).length} products</div>
        </div>
        <div class="meta-cell">
          <div class="meta-key">Status</div>
          <div class="meta-val" style="color:#16a34a">✓ ${order.status}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals">
        <div class="tot-row"><span>Subtotal</span><span>Rs. ${subtotal.toLocaleString()}</span></div>
        ${tax > 0 ? `<div class="tot-row"><span>Tax</span><span>Rs. ${tax.toLocaleString()}</span></div>` : ''}
        ${discount > 0 ? `<div class="tot-row disc"><span>Discount</span><span>− Rs. ${discount.toLocaleString()}</span></div>` : ''}
        <div class="tot-row grand"><span>Total</span><span>Rs. ${total.toLocaleString()}</span></div>
      </div>

      ${order.paymentMethod === 'cash' ? `
        <div style="margin-top:12px; display:flex; flex-direction:column; gap:6px">
          <div class="tot-row" style="font-size:13px; color:#555"><span>Cash Received</span><span>Rs. ${paid.toLocaleString()}</span></div>
          <div class="change-row"><span>Change Returned</span><span>Rs. ${change.toLocaleString()}</span></div>
        </div>` : ''}

      ${order.note ? `<div class="note-box">📝 Note: ${order.note}</div>` : ''}

      <div class="footer">
        Thank you for your purchase!<br/>
        ${order.orderNumber} · ${dateStr}<br/>
        <strong>QuickPOS</strong> — Powered by QuickPOS v2.0
      </div>
    </div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
    win.document.close();
  };

  const subtotal = order.subtotal || 0;
  const discount = order.discount || 0;
  const tax      = order.taxTotal || 0;
  const total    = order.total || 0;
  const change   = order.change || 0;

  return (
    <div className="overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 500 }}>
        {/* Header */}
        <div className="modal-head" style={{ background: 'var(--green-bg)', borderBottom: '1px solid rgba(16,185,129,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 18, height: 18, display: 'block', color: '#fff' }}>{IC.check}</span>
            </div>
            <div>
              <div className="modal-title" style={{ color: 'var(--green)' }}>Order Successful!</div>
              <div className="t-xs t-dim">{order.orderNumber}</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Meta info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { k: 'Order #',   v: order.orderNumber,    mono: true  },
              { k: 'Cashier',   v: order.cashierName              },
              { k: 'Payment',   v: order.paymentMethod,  cap: true   },
              { k: 'Date',      v: new Date(order.createdAt || Date.now()).toLocaleString() },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div className="t-xs t-dim" style={{ textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700, marginBottom: 3 }}>{x.k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: x.cap ? 'capitalize' : 'none', fontFamily: x.mono ? 'IBM Plex Mono' : 'Sora' }}>{x.v}</div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div style={{ background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px' }}>
              Items ({(order.items || []).length})
            </div>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {item.productImage
                  ? <img src={item.productImage} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: 14, height: 14, display: 'block', color: 'var(--text3)' }}>{IC.image}</span>
                    </div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</div>
                  {item.variation?.optionLabel && <div className="t-xs t-dim">{item.variation.variationName}: {item.variation.optionLabel}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="t-xs t-dim">×{item.quantity}</div>
                  <div style={{ fontWeight: 700, color: 'var(--blue)', fontFamily: 'IBM Plex Mono', fontSize: 13 }}>Rs. {item.totalPrice.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
            {[
              { l: 'Subtotal', v: `Rs. ${subtotal.toLocaleString()}`, show: true },
              { l: 'Tax',      v: `Rs. ${tax.toLocaleString()}`,      show: tax > 0 },
              { l: 'Discount', v: `− Rs. ${discount.toLocaleString()}`, show: discount > 0, color: 'var(--green)' },
            ].filter(x => x.show).map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: x.color || 'var(--text2)', marginBottom: 6 }}>
                <span>{x.l}</span><span className="mono">{x.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
              <span>Total</span><span className="mono t-blue">Rs. {total.toLocaleString()}</span>
            </div>
            {order.paymentMethod === 'cash' && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--green-bg)', borderRadius: 8, border: '1px solid rgba(16,185,129,.2)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--green)' }}>
                <span>Change Returned</span>
                <span className="mono">Rs. {change.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="modal-foot" style={{ gap: 10 }}>
          <button className="btn btn-ghost" onClick={onNewOrder} style={{ gap: 6 }}>
            <span style={{ width: 14, height: 14, display: 'block' }}>{IC.plus}</span>
            New Order
          </button>
          <button className="btn btn-primary btn-lg" onClick={printInvoice} style={{ gap: 8, flex: 1, justifyContent: 'center' }}>
            <span style={{ width: 16, height: 16, display: 'block' }}>{IC.orders}</span>
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Checkout Modal ---- */
function CheckoutModal({ cart, onClose, onSuccess }) {
  const [method, setMethod] = useState('cash');
  const [paid, setPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [discType, setDiscType] = useState('fixed');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discAmt = discount ? (discType === 'percentage' ? subtotal * (Number(discount) / 100) : Number(discount)) : 0;
  const total = Math.max(0, subtotal - discAmt);
  const change = method === 'cash' && paid ? Number(paid) - total : 0;

  const checkout = async () => {
    if (method === 'cash' && Number(paid) < total) return toast.error('Amount received is less than total');
    setLoading(true);
    try {
      const { data } = await API.post('/orders', {
        items: cart.map(i => ({ product: i._id, variation: i.variation || {}, quantity: i.qty })),
        discount, discountType: discType, paymentMethod: method,
        amountPaid: method === 'cash' ? Number(paid) : total, note
      });
      toast.success('Order placed successfully!');
      onSuccess(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setLoading(false); }
  };

  const payMethods = [
    { id: 'cash', icon: IC.cash, label: 'Cash' },
    { id: 'card', icon: IC.card, label: 'Card' },
    { id: 'online', icon: IC.phone, label: 'Online' },
  ];

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <span className="modal-title">Checkout — {cart.reduce((s, i) => s + i.qty, 0)} items</span>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Payment method */}
          <div className="form-group">
            <label className="label">Payment Method</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {payMethods.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`btn ${method === m.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 16, display: 'block' }}>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div className="grid2" style={{ gap: 10 }}>
            <div className="form-group">
              <label className="label">Discount</label>
              <input className="input" type="number" min="0" placeholder="0"
                value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Type</label>
              <select className="input select" value={discType} onChange={e => setDiscType(e.target.value)}>
                <option value="fixed">Fixed (Rs)</option>
                <option value="percentage">Percent (%)</option>
              </select>
            </div>
          </div>

          {/* Cash received */}
          {method === 'cash' && (
            <div className="form-group">
              <label className="label">Amount Received</label>
              <input className="input" type="number" min="0" placeholder="Enter cash amount"
                value={paid} onChange={e => setPaid(e.target.value)} autoFocus />
            </div>
          )}

          <div className="form-group">
            <label className="label">Order Note (optional)</label>
            <input className="input" type="text" placeholder="Any special note..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, border: '1px solid var(--border2)' }}>
            <div className="total-row"><span>Subtotal</span><span className="mono">Rs. {subtotal.toLocaleString()}</span></div>
            {discAmt > 0 && <div className="total-row" style={{ color: 'var(--green)' }}><span>Discount</span><span className="mono">−Rs. {discAmt.toFixed(0)}</span></div>}
            <div className="total-row grand"><span>Total</span><span>Rs. {total.toFixed(0)}</span></div>
            {method === 'cash' && paid && (
              <div className="total-row" style={{ color: change >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 6 }}>
                <span>Change</span><span className="mono">Rs. {change.toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={checkout} disabled={loading}
            style={{ minWidth: 160, justifyContent: 'center' }}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> Processing...</>
              : <>{IC.check} Confirm — Rs. {total.toFixed(0)}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Main POS ---- */
export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [varModal, setVarModal] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const searchRef = useRef();

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories));
    API.get('/products').then(r => setProducts(r.data.products));
  }, []);

  const filtered = products.filter(p => {
    const catMatch = activeCat === 'all' || p.category?._id === activeCat;
    const srch = p.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && srch;
  });

  const addToCart = (product, variation = null) => {
    const key = `${product._id}-${variation ? `${variation.variationName}:${variation.optionLabel}` : 'base'}`;
    const unitPrice = product.basePrice + (variation?.priceModifier || 0);
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === key);
      if (existing) return prev.map(i => i.cartKey === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, cartKey: key, qty: 1, unitPrice, variation }];
    });
  };

  const clickProduct = (p) => {
    if (p.hasVariations && p.variations?.length) return setVarModal(p);
    if (p.stock <= 0) return toast.error('Out of stock');
    addToCart(p);
    toast.success(`${p.name} added`, { duration: 700, icon: '✓' });
  };

  const updateQty = (key, delta) => {
    setCart(prev => prev.map(i => i.cartKey === key
      ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };
  const remove = (key) => setCart(prev => prev.filter(i => i.cartKey !== key));
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const stockColor = (p) => {
    if (p.stock <= 0) return 'var(--red)';
    if (p.stock <= p.lowStockAlert) return 'var(--yellow)';
    return 'var(--green)';
  };

  const hasSidebar = user?.role === 'admin' || user?.role === 'manager';
  const sidebarW   = hasSidebar ? 248 : 0;

  return (
    <div className="app-layout">
      {/* Sidebar — only admin & manager */}
      {hasSidebar && <Sidebar />}

      {/* Minimal topbar */}
      <div style={{ position: 'fixed', top: 0, left: sidebarW, right: 0, height: 58, background: 'var(--bg1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasSidebar && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ gap: 6 }}>
                <span style={{ width: 14, height: 14 }}>{IC.dashboard}</span> Back
              </button>
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            </>
          )}
          <span style={{ fontWeight: 700, fontSize: 15 }}>POS Terminal</span>
          <span className="badge badge-green" style={{ fontSize: 10 }}>● Live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="t-sm t-muted">Cashier: <strong style={{ color: 'var(--text)' }}>{user?.name}</strong></span>
          <span className={`badge badge-${user?.role === 'admin' ? 'blue' : user?.role === 'manager' ? 'yellow' : 'green'}`}>{user?.role}</span>
          {!hasSidebar && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ gap: 6, color: 'var(--red)', borderColor: 'rgba(239,68,68,.25)', background: 'var(--red-bg)' }}
              onClick={() => {
                if (window.confirm('Logout karna chahte hain?')) {
                  logout();
                  toast.success('Logged out successfully');
                  navigate('/login');
                }
              }}
            >
              <span style={{ width: 14, height: 14, display: 'block' }}>{IC.logout}</span>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* POS Body */}
      <div style={{ marginTop: 58, marginLeft: sidebarW, display: 'grid', gridTemplateColumns: '1fr 380px', height: 'calc(100vh - 58px)', overflow: 'hidden' }}>
        {/* LEFT: Products */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg0)' }}>
          {/* Toolbar */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg1)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <div className="search-wrap" style={{ flex: 1 }}>
              <span className="search-icon">{IC.search}</span>
              <input ref={searchRef} className="input" placeholder="Search products by name or SKU..."
                value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="cat-tabs">
            <button className={`cat-tab${activeCat === 'all' ? ' on' : ''}`} onClick={() => setActiveCat('all')}>
              All Products
            </button>
            {categories.map(c => (
              <button key={c._id} className={`cat-tab${activeCat === c._id ? ' on' : ''}`}
                onClick={() => setActiveCat(c._id)}
                style={{ borderColor: activeCat === c._id ? c.color : undefined, background: activeCat === c._id ? c.color : undefined }}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="prod-grid">
            {filtered.map(p => (
              <div key={p._id} className={`prod-card${p.stock <= 0 && !p.hasVariations ? ' oos' : ''}`}
                onClick={() => clickProduct(p)}>
                {p.hasVariations && <span className="prod-card-var-badge">Options</span>}
                {p.image
                  ? <img src={p.image} alt={p.name} className="prod-card-img" loading="lazy" />
                  : <div className="prod-card-img-placeholder"><span style={{ width: 32, height: 32, display: 'block' }}>{IC.image}</span></div>
                }
                <div className="prod-card-body">
                  <div className="prod-card-name">{p.name}</div>
                  <div className="prod-card-cat" style={{ color: p.category?.color || 'var(--text3)' }}>
                    {p.category?.name}
                  </div>
                  <div className="prod-card-price">Rs. {p.basePrice.toLocaleString()}</div>
                  {!p.hasVariations && (
                    <div className="prod-card-stock" style={{ color: stockColor(p) }}>
                      ● {p.stock <= 0 ? 'Out of stock' : `${p.stock} ${p.unit}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-box" style={{ gridColumn: '1 / -1' }}>
                <span style={{ width: 52, height: 52, display: 'block', color: 'var(--text3)', opacity: .3 }}>{IC.products}</span>
                <div className="empty-box-text">No products found</div>
                <div className="empty-box-sub">Try a different search or category</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div className="cart-panel">
          <div className="cart-head">
            <span className="cart-head-title">{IC.cart} Cart {totalQty > 0 && <span className="badge badge-blue" style={{ marginLeft: 6 }}>{totalQty}</span>}</span>
            {cart.length > 0 && (
              <button className="btn btn-danger-soft btn-sm" onClick={() => setCart([])}>Clear All</button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <span style={{ width: 48, height: 48, display: 'block' }}>{IC.cart}</span>
              <div className="cart-empty-text">Your cart is empty</div>
              <div className="cart-empty-sub">Click on products to add them here</div>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.cartKey} className="cart-item">
                  <div className="cart-item-top">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="cart-item-thumb" />
                      : <div className="cart-item-thumb-ph"><span style={{ width: 20, height: 20, display: 'block' }}>{IC.image}</span></div>
                    }
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      {item.variation && (
                        <div className="cart-item-var">{item.variation.variationName}: {item.variation.optionLabel}</div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--blue)', fontFamily: 'IBM Plex Mono', marginTop: 3 }}>
                        Rs. {item.unitPrice.toLocaleString()} each
                      </div>
                    </div>
                    <button className="cart-remove" onClick={() => remove(item.cartKey)}>
                      <span style={{ width: 14, height: 14, display: 'block' }}>{IC.x}</span>
                    </button>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => item.qty === 1 ? remove(item.cartKey) : updateQty(item.cartKey, -1)}>
                        <span style={{ width: 14, height: 14, display: 'block' }}>{IC.minus}</span>
                      </button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.cartKey, 1)}>
                        <span style={{ width: 14, height: 14, display: 'block' }}>{IC.plus}</span>
                      </button>
                    </div>
                    <span className="cart-item-price">Rs. {(item.unitPrice * item.qty).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cart Footer */}
          <div className="cart-foot">
            <div className="total-rows">
              <div className="total-row"><span>Items</span><span>{totalQty}</span></div>
              <div className="total-row grand"><span>Total</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            </div>
            <button className="btn btn-primary btn-lg w-full"
              style={{ justifyContent: 'center' }}
              disabled={cart.length === 0}
              onClick={() => setCheckout(true)}>
              {IC.card} Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {varModal && (
        <VarModal product={varModal} onClose={() => setVarModal(null)}
          onAdd={(p, v) => { addToCart(p, v); toast.success(`${p.name} (${v.optionLabel}) added`, { duration: 800 }); }} />
      )}
      {checkout && (
        <CheckoutModal cart={cart} onClose={() => setCheckout(false)}
          onSuccess={(order) => {
            setCart([]);
            setCheckout(false);
            setInvoiceOrder(order);
          }} />
      )}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          onNewOrder={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}