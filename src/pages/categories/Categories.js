import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { IC } from '../../components/Icons';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#84cc16'];

function CatModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState(cat || { name: '', description: '', color: '#3b82f6', isActive: true });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (cat) await API.put(`/categories/${cat._id}`, form);
      else await API.post('/categories', form);
      toast.success(cat ? 'Category updated!' : 'Category created!'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <span className="modal-title">{cat ? 'Edit Category' : 'New Category'}</span>
          <button className="close-btn" onClick={onClose}>{IC.x}</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="label">Category Name *</label>
              <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Beverages" />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="form-group">
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', transition: 'all .15s' }} />
                ))}
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, overflow: 'hidden', background: 'none' }} />
              </div>
            </div>
            {/* Preview */}
            <div style={{ padding: 14, background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div className="t-xs t-dim mb8">Preview</div>
              <span style={{ background: form.color + '22', color: form.color, padding: '5px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13, border: `1px solid ${form.color}44` }}>
                {form.name || 'Category Name'}
              </span>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : cat ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); API.get('/categories').then(r => setCats(r.data.categories)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await API.delete(`/categories/${id}`); toast.success('Deleted'); load();
  };

  return (
    <Layout title="Categories"
      actions={<button className="btn btn-primary" onClick={() => setModal({ open: true })}>{IC.plus} New Category</button>}>
      {loading
        ? <div className="page-loader"><div className="spinner" /></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {cats.map(c => (
              <div key={c._id} className="card" style={{ borderTop: `3px solid ${c.color}`, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                      <span style={{ width: 20, height: 20, display: 'block' }}>{IC.categories}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => setModal({ open: true, cat: c })}>
                        <span style={{ width: 14, height: 14, display: 'block' }}>{IC.edit}</span>
                      </button>
                      <button className="btn-icon" onClick={() => del(c._id)} style={{ color: 'var(--red)', background: 'var(--red-bg)', borderColor: 'rgba(239,68,68,.2)' }}>
                        <span style={{ width: 14, height: 14, display: 'block' }}>{IC.trash}</span>
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{c.name}</div>
                  {c.description && <div className="t-xs t-dim mt4">{c.description}</div>}
                  <div style={{ marginTop: 12 }}>
                    <span style={{ background: c.color + '22', color: c.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${c.color}44` }}>Active</span>
                  </div>
                </div>
              </div>
            ))}
            {cats.length === 0 && (
              <div className="empty-box card card-p" style={{ gridColumn: '1/-1' }}>
                <span style={{ width: 48, height: 48, display: 'block' }}>{IC.categories}</span>
                <div className="empty-box-text">No categories yet</div>
                <button className="btn btn-primary btn-sm" onClick={() => setModal({ open: true })}>{IC.plus} Add First Category</button>
              </div>
            )}
          </div>
      }
      {modal?.open && <CatModal cat={modal.cat} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </Layout>
  );
}
