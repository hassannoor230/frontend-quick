import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';
import toast from 'react-hot-toast';

function ProductModal({ item, categories, onClose, onSave }) {
  const blank = { name: '', description: '', category: '', basePrice: '', sku: '', stock: 0, unit: 'pcs', taxRate: 0, lowStockAlert: 10, hasVariations: false, variations: [], image: '', isActive: true };
  const [form, setForm] = useState(item ? { ...item, category: item.category?._id || item.category } : blank);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const addVar = () => setForm(f => ({ ...f, variations: [...f.variations, { name: '', options: [{ label: '', priceModifier: 0, stock: 0 }] }] }));
  const removeVar = vi => setForm(f => ({ ...f, variations: f.variations.filter((_, i) => i !== vi) }));
  const setVarName = (vi, val) => setForm(f => ({ ...f, variations: f.variations.map((v, i) => i === vi ? { ...v, name: val } : v) }));
  const addOpt = vi => setForm(f => ({ ...f, variations: f.variations.map((v, i) => i === vi ? { ...v, options: [...v.options, { label: '', priceModifier: 0, stock: 0 }] } : v) }));
  const removeOpt = (vi, oi) => setForm(f => ({ ...f, variations: f.variations.map((v, i) => i === vi ? { ...v, options: v.options.filter((_, j) => j !== oi) } : v) }));
  const setOpt = (vi, oi, field, val) => setForm(f => ({ ...f, variations: f.variations.map((v, i) => i === vi ? { ...v, options: v.options.map((o, j) => j === oi ? { ...o, [field]: val } : o) } : v) }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (item) await API.put(`/products/${item._id}`, form);
      else await API.post('/products', form);
      toast.success(item ? 'Product updated!' : 'Product created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay">
      <div className="modal modal-lg">
        <div className="modal-head">
          <span className="modal-title">{item ? 'Edit Product' : 'New Product'}</span>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Image URL */}
            <div className="form-group">
              <label className="label">Product Image URL</label>
              <input className="input" type="url" placeholder="https://images.unsplash.com/..."
                value={form.image} onChange={e => { setForm({ ...form, image: e.target.value }); setImgError(false); }} />
              {form.image && !imgError
                ? <img src={form.image} alt="preview" className="img-preview" onError={() => setImgError(true)} style={{ marginTop: 8 }} />
                : <div className="img-placeholder" style={{ marginTop: 8 }}>
                    <span style={{ width: 32, height: 32, display: 'block' }}>{IC.image}</span>
                    <span className="t-xs t-dim">Paste an image URL above to preview</span>
                  </div>
              }
            </div>

            <div className="grid2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="label">Product Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cappuccino" />
              </div>
              <div className="form-group">
                <label className="label">Category *</label>
                <select className="input select" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short product description" />
            </div>

            <div className="grid2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="label">Base Price (Rs) *</label>
                <input className="input" type="number" min="0" required value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">SKU</label>
                <input className="input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. BEV001" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="label">Stock</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Unit</label>
                <select className="input select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  {['pcs','kg','g','l','ml','cup','glass','ltr','btl','pack','box'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Tax Rate %</label>
                <input className="input" type="number" min="0" max="100" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Low Stock Alert</label>
                <input className="input" type="number" min="0" value={form.lowStockAlert} onChange={e => setForm({ ...form, lowStockAlert: e.target.value })} />
              </div>
            </div>

            {/* Variations Toggle */}
            <label className="toggle-row">
              <input type="checkbox" checked={form.hasVariations} onChange={e => setForm({ ...form, hasVariations: e.target.checked })} />
              <div>
                <div className="toggle-label">This product has variations</div>
                <div className="t-xs t-dim">Enable for products with sizes, colors, flavors, etc.</div>
              </div>
            </label>

            {/* Variations Builder */}
            {form.hasVariations && (
              <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, border: '1px solid var(--border2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>Variation Groups</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addVar}>{IC.plus} Add Group</button>
                </div>
                {form.variations.map((v, vi) => (
                  <div key={vi} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                      <input className="input" placeholder="Variation name (e.g. Size, Color, Flavor)"
                        value={v.name} onChange={e => setVarName(vi, e.target.value)} style={{ flex: 1 }} />
                      <button type="button" className="btn btn-danger-soft btn-sm" onClick={() => removeVar(vi)}>
                        <span style={{ width: 14, height: 14, display: 'block' }}>{IC.trash}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
                      Label · ±Price (Rs) · Stock
                    </div>
                    {v.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr auto', gap: 8, marginBottom: 8 }}>
                        <input className="input" placeholder="e.g. Small" value={opt.label} onChange={e => setOpt(vi, oi, 'label', e.target.value)} />
                        <input className="input" type="number" placeholder="0" value={opt.priceModifier} onChange={e => setOpt(vi, oi, 'priceModifier', Number(e.target.value))} />
                        <input className="input" type="number" placeholder="0" value={opt.stock} min="0" onChange={e => setOpt(vi, oi, 'stock', Number(e.target.value))} />
                        <button type="button" className="btn-icon" onClick={() => removeOpt(vi, oi)} style={{ color: 'var(--red)' }}>
                          <span style={{ width: 14, height: 14, display: 'block' }}>{IC.x}</span>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => addOpt(vi)}>
                      {IC.plus} Add Option
                    </button>
                  </div>
                ))}
                {form.variations.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text3)', fontSize: 12 }}>
                    Click "Add Group" to create a variation group (e.g. Size, Color)
                  </div>
                )}
              </div>
            )}

            {/* Active toggle */}
            <label className="toggle-row">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <div className="toggle-label">Active (visible in POS)</div>
            </label>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : <>{IC.check} {item ? 'Update Product' : 'Create Product'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([API.get('/products'), API.get('/categories')])
      .then(([p, c]) => { setProducts(p.data.products); setCategories(c.data.categories); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const del = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    await API.delete(`/products/${id}`); toast.success('Product deleted'); load();
  };

  const stockBadge = (p) => {
    if (p.stock <= 0 && !p.hasVariations) return <span className="badge badge-red">Out of Stock</span>;
    if (p.stock <= p.lowStockAlert && !p.hasVariations) return <span className="badge badge-yellow">Low: {p.stock}</span>;
    if (p.hasVariations) return <span className="badge badge-cyan">Variations</span>;
    return <span className="badge badge-green">{p.stock} {p.unit}</span>;
  };

  return (
    <Layout title="Products"
      actions={
        <>
          <div className="search-wrap">
            <span className="search-icon">{IC.search}</span>
            <input className="input" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 220 }} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ open: true })}>
            {IC.plus} New Product
          </button>
        </>
      }>
      <div className="card">
        {loading
          ? <div className="page-loader"><div className="spinner" /></div>
          : <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Tax</th><th>Status</th><th>Variations</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {p.image
                            ? <img src={p.image} alt={p.name} style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ width: 18, height: 18, display: 'block', color: 'var(--text3)' }}>{IC.image}</span>
                              </div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                            <div className="t-xs t-dim">{p.sku || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: (p.category?.color || '#3b82f6') + '22', color: p.category?.color || '#3b82f6', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                          {p.category?.name || '—'}
                        </span>
                      </td>
                      <td><span className="mono t-blue" style={{ fontWeight: 800 }}>Rs. {p.basePrice.toLocaleString()}</span></td>
                      <td>{stockBadge(p)}</td>
                      <td><span className="t-dim">{p.taxRate}%</span></td>
                      <td><span className={`badge badge-${p.isActive ? 'green' : 'red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        {p.hasVariations
                          ? <span className="badge badge-purple">{p.variations?.length} group{p.variations?.length !== 1 ? 's' : ''}</span>
                          : <span className="badge badge-gray">None</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn-icon" title="Edit" onClick={() => setModal({ open: true, item: p })}>
                            <span style={{ width: 14, height: 14, display: 'block' }}>{IC.edit}</span>
                          </button>
                          <button className="btn-icon" title="Delete" onClick={() => del(p._id)}
                            style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,.2)', background: 'var(--red-bg)' }}>
                            <span style={{ width: 14, height: 14, display: 'block' }}>{IC.trash}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-box">
                  <span style={{ width: 52, height: 52, display: 'block' }}>{IC.products}</span>
                  <div className="empty-box-text">No products found</div>
                </div>
              )}
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="t-xs t-dim">{filtered.length} products</span>
            </div>
          </>
        }
      </div>
      {modal?.open && <ProductModal item={modal.item} categories={categories} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </Layout>
  );
}
