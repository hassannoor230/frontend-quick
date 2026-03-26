import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';
import toast from 'react-hot-toast';

function StockModal({ product, onClose, onSave }) {
  const [op, setOp] = useState('add');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!qty || Number(qty) <= 0) return toast.error('Enter a valid quantity');
    setLoading(true);
    try {
      await API.patch(`/products/${product._id}/stock`, { quantity: Number(qty), operation: op });
      toast.success('Stock updated!'); onSave();
    } catch { toast.error('Failed to update stock'); }
    finally { setLoading(false); }
  };
  const newStock = op === 'add' ? product.stock + Number(qty || 0) : op === 'subtract' ? Math.max(0, product.stock - Number(qty || 0)) : Number(qty || 0);
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-head"><span className="modal-title">Update Stock</span><button className="close-btn" onClick={onClose}>{IC.x}</button></div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              {product.image ? <img src={product.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 20, height: 20, display: 'block', color: 'var(--text3)' }}>{IC.image}</span></div>}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{product.name}</div>
                <span className={`badge badge-${product.stock <= 0 ? 'red' : product.stock <= product.lowStockAlert ? 'yellow' : 'green'}`} style={{ marginTop: 5, display: 'inline-flex' }}>Current: {product.stock} {product.unit}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Operation</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'add', l: '+ Add' }, { id: 'subtract', l: '− Remove' }, { id: 'set', l: '= Set To' }].map(o => (
                  <button type="button" key={o.id} onClick={() => setOp(o.id)} className={`btn btn-sm ${op === o.id ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, justifyContent: 'center' }}>{o.l}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Quantity *</label>
              <input className="input" type="number" min="0" required value={qty} onChange={e => setQty(e.target.value)} autoFocus />
            </div>
            {qty && <div style={{ padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span className="t-sm t-muted">New level</span>
              <span style={{ fontWeight: 800, color: newStock <= 0 ? 'var(--red)' : newStock <= product.lowStockAlert ? 'var(--yellow)' : 'var(--green)', fontFamily: 'IBM Plex Mono' }}>{newStock} {product.unit}</span>
            </div>}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Stock'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); Promise.all([API.get('/products'), API.get('/products/low-stock')]).then(([p, l]) => { setProducts(p.data.products); setLowStock(l.data.products); }).finally(() => setLoading(false)); };
  useEffect(load, []);
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Layout title="Stock Management" actions={<div className="search-wrap"><span className="search-icon">{IC.search}</span><input className="input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 220 }} /></div>}>
      {lowStock.length > 0 && <div className="info-box info-box-yellow flex items-c gap10 mb16"><span style={{ width: 18, height: 18, display: 'block', flexShrink: 0 }}>{IC.warning}</span><span style={{ fontWeight: 600, fontSize: 13 }}>{lowStock.length} product(s) running low: {lowStock.slice(0, 3).map(p => p.name).join(', ')}</span></div>}
      <div className="card">
        {loading ? <div className="page-loader"><div className="spinner" /></div> :
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Product</th><th>Category</th><th>SKU</th><th>Stock</th><th>Level</th><th>Alert At</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>
                {filtered.map(p => {
                  const isLow = !p.hasVariations && p.stock <= p.lowStockAlert;
                  const isOut = !p.hasVariations && p.stock <= 0;
                  const pct = Math.min(100, Math.round((p.stock / Math.max(p.stock, 100)) * 100));
                  return (
                    <tr key={p._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{p.image ? <img src={p.image} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ width: 16, height: 16, display: 'block', color: 'var(--text3)' }}>{IC.image}</span></div>}<span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</span></div></td>
                      <td><span style={{ background: (p.category?.color || '#3b82f6') + '22', color: p.category?.color || '#3b82f6', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{p.category?.name}</span></td>
                      <td className="mono t-sm t-muted">{p.sku || '—'}</td>
                      <td><span style={{ fontWeight: 800, color: isOut ? 'var(--red)' : isLow ? 'var(--yellow)' : 'var(--text)', fontFamily: 'IBM Plex Mono' }}>{p.hasVariations ? '—' : p.stock}</span></td>
                      <td>{!p.hasVariations && <div style={{ width: 80, height: 5, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: isOut ? 'var(--red)' : isLow ? 'var(--yellow)' : 'var(--green)', borderRadius: 99 }} /></div>}</td>
                      <td className="t-muted t-sm">{p.lowStockAlert}</td>
                      <td>{p.hasVariations ? <span className="badge badge-cyan">Variants</span> : isOut ? <span className="badge badge-red">Out of Stock</span> : isLow ? <span className="badge badge-yellow">Low</span> : <span className="badge badge-green">OK</span>}</td>
                      <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-ghost btn-sm" onClick={() => setModal({ product: p })}><span style={{ width: 13, height: 13, display: 'block' }}>{IC.edit}</span> Adjust</button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-box"><span style={{ width: 48, height: 48, display: 'block' }}>{IC.stock}</span><div className="empty-box-text">No products</div></div>}
          </div>
        }
      </div>
      {modal?.product && <StockModal product={modal.product} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </Layout>
  );
}
