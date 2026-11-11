import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api, { downloadFile, getErrorMessage } from '../api/client.js';
import { setCredentials } from '../store/store.js';
import { DEMO_CREDENTIALS, DEMO_ACCOUNTS } from '../config/demo.js';
import {
  PageHeader, SkeletonCards, SkeletonTable, EmptyState, ErrorState,
  Spinner, StatusBadge, Field, StatCard, Reveal, useToasts,
  fmtMoney, fmtNum, fmtDate
} from '../components/ui.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

/* ============================== DASHBOARD ============================== */

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setError('');
    api.get('/inventory/dashboard')
      .then((r) => alive && setData(r.data.data))
      .catch((e) => alive && setError(getErrorMessage(e, 'Could not reach the API. Is the server running?')));
    return () => { alive = false; };
  }, [retry]);

  if (error && !data) return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="Live operations overview" icon="📊" />
      <ErrorState message={error} onRetry={() => setRetry((x) => x + 1)} />
    </div>
  );
  if (!data) return (
    <div className="space-y-5">
      <div className="card-dark anim-fadeUp"><div className="h-8 w-64 skeleton rounded-xl" /><div className="h-4 w-96 max-w-full skeleton rounded mt-2" /></div>
      <SkeletonCards n={8} />
    </div>
  );

  const cards = [
    { label: 'Total Products', value: fmtNum(data.totalProducts), icon: '📦', grad: 'from-indigo-500 to-blue-500', sub: 'active catalog' },
    { label: 'Inventory Value', value: fmtMoney(data.totalValue), icon: '💰', grad: 'from-emerald-500 to-teal-500', sub: 'stock × cost' },
    { label: 'Low Stock', value: fmtNum(data.lowStock), icon: '⚠️', grad: 'from-amber-500 to-orange-500', sub: 'needs reorder' },
    { label: 'Out of Stock', value: fmtNum(data.outOfStock), icon: '🚫', grad: 'from-rose-500 to-red-500', sub: 'urgent' },
    { label: "Today's Orders", value: fmtNum(data.todaysOrders), icon: '🧾', grad: 'from-violet-500 to-purple-500', sub: 'created today' },
    { label: 'Monthly Sales', value: fmtMoney(data.monthlySales), icon: '📈', grad: 'from-cyan-500 to-sky-500', sub: `${fmtNum(data.monthlyOrders)} orders / mo` },
    { label: 'Purchase Costs', value: fmtMoney(data.purchaseCosts), icon: '🏭', grad: 'from-slate-500 to-slate-700', sub: 'this month' },
    { label: 'Profit Est.', value: fmtMoney(data.profitEst), icon: '✨', grad: 'from-fuchsia-500 to-pink-500', sub: 'sales − costs' },
  ];
  const chartData = [
    { name: 'Sales', value: Number(data.monthlySales) || 0 },
    { name: 'Costs', value: Number(data.purchaseCosts) || 0 },
    { name: 'Profit', value: Number(data.profitEst) || 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="card-dark anim-fadeUp">
        <div className="blob w-64 h-64 bg-white/20 -top-10 right-10" aria-hidden />
        <div className="blob w-40 h-40 bg-fuchsia-300/30 top-10 right-64" style={{ animationDelay: '2s' }} aria-hidden />
        <div className="relative flex flex-wrap items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">Operations overview</h2>
            <p className="text-white/80 text-sm mt-1">Stock health, sales momentum and profit at a glance.</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" /> System live
            </span>
            <span className="px-3 py-2 rounded-full bg-white text-slate-900">{fmtNum(data.monthlyOrders)} orders / mo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => <StatCard key={c.label} {...c} index={i} />)}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Reveal className="card lg:col-span-3" delay={60}>
          <h3 className="font-bold text-lg">Sales vs Costs <span className="text-xs font-normal text-slate-500">(this month)</span></h3>
          <p className="text-xs text-slate-500 mb-3">Hover bars for values • refreshed on every load</p>
          <div style={{ height: 270 }} role="img" aria-label={`Sales ${data.monthlySales}, costs ${data.purchaseCosts}, profit ${data.profitEst}`}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `$${Number(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v) => fmtMoney(v)} />
                <Bar dataKey="value" radius={[10, 10, 4, 4]}>
                  <Cell fill="#6366f1" /><Cell fill="#cbd5e1" /><Cell fill="#e879f9" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
        <Reveal className="card lg:col-span-2" delay={140}>
          <h3 className="font-bold text-lg mb-1">Stock health</h3>
          <p className="text-xs text-slate-500 mb-4">Share of catalog by availability</p>
          {(data.totalProducts || 0) === 0 ? (
            <EmptyState icon="📦" title="No products yet" hint="Seed the database or add your first product to see health here." />
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Healthy', n: (data.totalProducts - data.lowStock - data.outOfStock), color: 'from-emerald-500 to-teal-500' },
                { label: 'Low stock', n: data.lowStock, color: 'from-amber-500 to-orange-500' },
                { label: 'Out of stock', n: data.outOfStock, color: 'from-rose-500 to-red-500' },
              ].map((r) => {
                const pct = data.totalProducts ? Math.round((r.n / data.totalProducts) * 100) : 0;
                return (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1.5"><span>{r.label}</span><span className="tabular-nums">{r.n} • {pct}%</span></div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${r.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2 pt-2">
                <Link to="/products" className="btn-secondary">View products →</Link>
                <Link to="/inventory" className="btn-secondary">Move stock →</Link>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
};

/* ============================== PRODUCTS ============================== */

export const Products = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { const t = setTimeout(() => setDebounced(search.trim()), 350); return () => clearTimeout(t); }, [search]);
  useEffect(() => { setPage(1); }, [debounced, filter]);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api.get('/products', {
      params: {
        search: debounced || undefined, limit: 24, page,
        ...(filter === 'low' ? { low: 'true' } : {}),
        ...(filter === 'out' ? { out: 'true' } : {}),
      }
    })
      .then((r) => { if (!alive) return; setItems(r.data.data || []); setMeta(r.data.meta || null); })
      .catch((e) => alive && setError(getErrorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [debounced, filter, page]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products" subtitle="Catalog, pricing & live stock levels" icon="📦"
        actions={<span className="badge badge-slate">{meta ? `${fmtNum(meta.total)} items` : '…'}</span>}
      />
      <div className="card anim-fadeUp">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>🔍</span>
            <input
              className="input !pl-10" placeholder="Search SKU / name / category…" value={search}
              onChange={(e) => setSearch(e.target.value)} aria-label="Search products"
            />
            {search && <button className="absolute right-2 top-1/2 -translate-y-1/2 btn-secondary" onClick={() => setSearch('')} aria-label="Clear search">✕</button>}
          </div>
          <div className="flex gap-2" role="tablist" aria-label="Stock filter">
            {[['all', 'All'], ['low', '⚠️ Low'], ['out', '🚫 Out']].map(([v, l]) => (
              <button key={v} role="tab" aria-selected={filter === v} onClick={() => setFilter(v)}
                className={`btn-secondary !px-4 !py-2.5 ${filter === v ? '!bg-slate-900 !text-white !border-slate-900' : ''}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <SkeletonTable rows={6} />
        : error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} />
        : items.length === 0 ? (
          <EmptyState
            icon="📦" title={debounced || filter !== 'all' ? 'No products match' : 'No products yet'}
            hint={debounced || filter !== 'all' ? 'Try a different search or clear the stock filter.' : 'Products created via the API appear here with live stock.'}
            action={(debounced || filter !== 'all') && <button className="btn" onClick={() => { setSearch(''); setFilter('all'); }}>Clear filters</button>}
          />
        ) : (
          <div className="card !p-0 overflow-hidden anim-fadeUp">
            <div className="table-wrap !border-0">
              <table className="table">
                <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Stock</th><th>Cost</th><th>Price</th><th>Margin</th></tr></thead>
                <tbody>
                  {items.map((p) => {
                    const low = (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= (p.minStockLevel ?? 10);
                    const out = (p.stockQuantity || 0) === 0;
                    const margin = (p.sellingPrice || 0) - (p.costPrice || 0);
                    return (
                      <tr key={p._id}>
                        <td className="font-mono text-xs font-bold text-indigo-700">{p.sku}</td>
                        <td><div className="font-semibold">{p.name}</div><div className="text-[11px] text-slate-400">{p.brand || '—'}</div></td>
                        <td><span className="badge badge-slate">{p.category}</span></td>
                        <td>
                          <span className={`badge ${out ? 'badge-rose' : low ? 'badge-amber' : 'badge-emerald'}`}>
                            {out ? '🚫 Out' : low ? `⚠️ ${p.stockQuantity}` : `✅ ${p.stockQuantity}`}
                          </span>
                        </td>
                        <td className="tabular-nums">{fmtMoney(p.costPrice)}</td>
                        <td className="tabular-nums font-semibold">{fmtMoney(p.sellingPrice)}</td>
                        <td className={`tabular-nums font-semibold ${margin < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmtMoney(margin)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
                <span className="text-slate-500">Page {meta.page} of {meta.pages} • {fmtNum(meta.total)} total</span>
                <div className="flex gap-2">
                  <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
                  <button className="btn-secondary" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

/* ============================== INVENTORY ============================== */

export const InventoryPage = () => {
  const { push, Toasts } = useToasts();
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ product: '', warehouse: '', type: 'in', quantity: 1, reason: '', toWarehouse: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    try {
      const [h, p, w] = await Promise.all([
        api.get('/inventory/history', { params: { limit: 30 } }),
        api.get('/products', { params: { limit: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get('/inventory/warehouses').catch(() => ({ data: { data: [] } })),
      ]);
      setHistory(h.data.data || []);
      const plist = p.data.data || [];
      setProducts(plist);
      const wlist = w.data.data || [];
      setWarehouses(wlist);
      setForm((f) => ({
        ...f,
        product: f.product || plist[0]?._id || '',
        warehouse: f.warehouse || wlist[0]?._id || '',
      }));
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!form.product || !form.warehouse) return push('Pick a product and warehouse', 'error');
    if (!Number.isInteger(qty) || (form.type === 'adjustment' ? qty < 0 : qty <= 0)) return push('Enter a valid quantity', 'error');
    if (form.type === 'transfer' && (!form.toWarehouse || form.toWarehouse === form.warehouse)) return push('Pick a different destination warehouse', 'error');
    setSubmitting(true);
    try {
      const payload = { ...form, quantity: qty, reason: form.reason || undefined, toWarehouse: form.type === 'transfer' ? form.toWarehouse : undefined };
      const r = await api.post('/inventory/move', payload);
      push(`Stock updated • new total ${r.data.total}`, 'success');
      setForm((f) => ({ ...f, quantity: 1, reason: '' }));
      load();
    } catch (err) { push(getErrorMessage(err), 'error'); }
    finally { setSubmitting(false); }
  };

  const productName = (h) => h.product?.name || h.product?.sku || '—';
  const warehouseName = (h) => h.warehouse?.name || h.warehouse?.code || '—';

  return (
    <div className="space-y-4">
      <Toasts />
      <PageHeader title="Inventory" subtitle="Stock moves, transfers & live history" icon="🏭" />
      <div className="grid lg:grid-cols-5 gap-4">
        <Reveal className="card lg:col-span-2 h-fit lg:sticky lg:top-24">
          <h3 className="font-bold text-lg">Move stock</h3>
          <p className="text-xs text-slate-500 mb-4">In, out, adjust or transfer between warehouses.</p>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Movement type">
              <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Movement type">
                {[['in', '📥 In'], ['out', '📤 Out'], ['adjustment', '🎚 Set'], ['transfer', '🔀 Move']].map(([v, l]) => (
                  <button type="button" key={v} role="radio" aria-checked={form.type === v} onClick={() => set('type', v)}
                    className={`btn-secondary !py-2.5 ${form.type === v ? '!bg-slate-900 !text-white !border-slate-900 shadow' : ''}`}>{l}</button>
                ))}
              </div>
            </Field>
            <Field label="Product">
              <select className="input" value={form.product} onChange={(e) => set('product', e.target.value)} required aria-label="Product">
                <option value="">Select product…</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.name} • {p.sku} ({p.stockQuantity ?? 0})</option>)}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={form.type === 'transfer' ? 'From warehouse' : 'Warehouse'}>
                <select className="input" value={form.warehouse} onChange={(e) => set('warehouse', e.target.value)} required aria-label="Warehouse">
                  <option value="">Select…</option>
                  {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
                </select>
              </Field>
              {form.type === 'transfer' && (
                <Field label="To warehouse">
                  <select className="input" value={form.toWarehouse} onChange={(e) => set('toWarehouse', e.target.value)} required aria-label="Destination warehouse">
                    <option value="">Select…</option>
                    {warehouses.filter((w) => w._id !== form.warehouse).map((w) => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
                  </select>
                </Field>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={form.type === 'adjustment' ? 'Set quantity to' : 'Quantity'} hint={form.type === 'adjustment' ? '0 allowed' : 'Positive integer'}>
                <input className="input tabular-nums" type="number" min={form.type === 'adjustment' ? 0 : 1} step={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
              </Field>
              <Field label="Reason (optional)">
                <input className="input" placeholder="e.g. cycle count" value={form.reason} onChange={(e) => set('reason', e.target.value)} maxLength={140} />
              </Field>
            </div>
            <button className="btn btn-brand w-full !py-3" disabled={submitting}>
              {submitting ? <Spinner label="Updating…" /> : '⚡ Submit movement'}
            </button>
            {products.length === 0 && !loading && <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">No products found — seed the server or create one via the API.</p>}
          </form>
        </Reveal>
        <div className="lg:col-span-3 space-y-3">
          <div className="card !p-0 overflow-hidden anim-fadeUp">
            <div className="px-5 pt-4 pb-2 flex items-center gap-2">
              <h3 className="font-bold text-lg">History</h3>
              <span className="badge badge-slate">{history.length} recent</span>
              <button className="ml-auto btn-secondary" onClick={load} aria-label="Refresh history">↻ Refresh</button>
            </div>
            {loading ? <div className="p-5"><SkeletonTable rows={6} /></div>
              : error ? <div className="p-5"><ErrorState message={error} onRetry={load} /></div>
              : history.length === 0 ? <div className="p-5"><EmptyState icon="📜" title="No movements yet" hint="Submit your first stock movement and it will appear here with product, warehouse and user." /></div>
              : (
                <div className="table-wrap !border-0">
                  <table className="table">
                    <thead><tr><th>Movement</th><th>Product</th><th>Qty</th><th>When</th></tr></thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id}>
                          <td><StatusBadge status={h.type} /><div className="text-[11px] text-slate-400 mt-0.5">{warehouseName(h)}{h.toWarehouse ? ` → ${h.toWarehouse?.name || ''}` : ''}</div></td>
                          <td><div className="font-medium">{productName(h)}</div>{h.reason && <div className="text-[11px] text-slate-400 truncate max-w-[220px]">“{h.reason}”</div>}</td>
                          <td className="tabular-nums font-bold">×{h.quantity}</td>
                          <td className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(h.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================== PURCHASING ============================== */

export const Purchasing = () => {
  const { push, Toasts } = useToasts();
  const [pos, setPos] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiving, setReceiving] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/purchasing/purchase-orders', { params: status ? { status } : {} }); setPos(r.data.data || []); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);

  const receive = async (id) => {
    setReceiving(id);
    try { await api.post(`/purchasing/purchase-orders/${id}/receive`); push('Purchase order received into stock', 'success'); load(); }
    catch (e) { push(getErrorMessage(e), 'error'); }
    finally { setReceiving(null); }
  };

  return (
    <div className="space-y-4">
      <Toasts />
      <PageHeader
        title="Purchasing" subtitle="Suppliers & inbound purchase orders" icon="🧾"
        actions={
          <div className="flex gap-2">
            {[['', 'All'], ['draft', 'Draft'], ['ordered', 'Ordered'], ['received', 'Received']].map(([v, l]) => (
              <button key={v} onClick={() => setStatus(v)} className={`btn-secondary !py-2 ${status === v ? '!bg-slate-900 !text-white !border-slate-900' : ''}`}>{l}</button>
            ))}
          </div>
        }
      />
      {loading ? <SkeletonTable rows={5} />
        : error ? <ErrorState message={error} onRetry={load} />
        : pos.length === 0 ? <EmptyState icon="🧾" title="No purchase orders" hint="Create purchase orders via the API — receiving them adds stock automatically." action={<button className="btn" onClick={load}>↻ Refresh</button>} />
        : (
          <div className="card !p-0 overflow-hidden anim-fadeUp">
            <div className="table-wrap !border-0">
              <table className="table">
                <thead><tr><th>PO</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {pos.map((p) => (
                    <tr key={p._id}>
                      <td><div className="font-mono text-xs font-bold text-indigo-700">{p.poNumber}</div><div className="text-[11px] text-slate-400">{fmtDate(p.createdAt)}</div></td>
                      <td className="font-medium">{p.supplier?.name || '—'}</td>
                      <td className="tabular-nums">{p.items?.length || 0} lines</td>
                      <td className="tabular-nums font-bold">{fmtMoney(p.totalCost)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {p.status === 'received' ? <span className="text-xs text-slate-400">✓ in stock</span>
                          : p.status === 'cancelled' ? <span className="text-xs text-slate-400">cancelled</span>
                          : (
                            <button className="btn-secondary" disabled={receiving === p._id} onClick={() => receive(p._id)}>
                              {receiving === p._id ? 'Receiving…' : '📥 Receive'}
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

/* ============================== SALES ============================== */

const NEXT_STATUS = { pending: ['confirmed', 'cancelled'], confirmed: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };

export const Sales = () => {
  const { push, Toasts } = useToasts();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get('/sales'); setOrders(r.data.data || []); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const advance = async (id, status) => {
    setActing(id + status);
    try { await api.patch(`/sales/${id}/status`, { status }); push(`Order → ${status}`, 'success'); load(); }
    catch (e) { push(getErrorMessage(e), 'error'); }
    finally { setActing(null); }
  };
  const invoice = async (o) => {
    setDownloading(o._id);
    try { await downloadFile(`/sales/${o._id}/invoice.pdf`, `${o.soNumber || 'invoice'}.pdf`); push('Invoice downloaded', 'success'); }
    catch (e) { push(getErrorMessage(e, 'Invoice download failed'), 'error'); }
    finally { setDownloading(null); }
  };

  return (
    <div className="space-y-4">
      <Toasts />
      <PageHeader title="Sales Orders" subtitle="Pipeline: pending → confirmed → processing → shipped → delivered" icon="🛒" />
      {loading ? <SkeletonTable rows={6} />
        : error ? <ErrorState message={error} onRetry={load} />
        : orders.length === 0 ? <EmptyState icon="🛒" title="No sales orders yet" hint="Create a sales order via the API. Shipping deducts stock; invoices download as PDF." />
        : (
          <div className="card !p-0 overflow-hidden anim-fadeUp">
            <div className="table-wrap !border-0">
              <table className="table">
                <thead><tr><th>SO</th><th>Customer</th><th>Total</th><th>Status</th><th>Next step</th><th>Invoice</th></tr></thead>
                <tbody>
                  {orders.map((o) => {
                    const next = NEXT_STATUS[o.status] || [];
                    return (
                      <tr key={o._id}>
                        <td><div className="font-mono text-xs font-bold text-indigo-700">{o.soNumber}</div><div className="text-[11px] text-slate-400">{fmtDate(o.createdAt)}</div></td>
                        <td className="font-medium">{o.customer?.name}</td>
                        <td className="tabular-nums font-bold">{fmtMoney(o.total)}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>
                          {next.length === 0 ? <span className="text-xs text-slate-400">— terminal —</span> : (
                            <div className="flex flex-wrap gap-1">
                              {next.map((s) => (
                                <button key={s} className={`btn-secondary ${s === 'cancelled' ? '!bg-rose-50 !border-rose-200 !text-rose-700 hover:!bg-rose-600 hover:!text-white' : ''}`}
                                  disabled={acting === o._id + s} onClick={() => advance(o._id, s)}>
                                  {acting === o._id + s ? '…' : `→ ${s}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <button className="btn-secondary" disabled={downloading === o._id} onClick={() => invoice(o)}>
                            {downloading === o._id ? '…' : '🧾 PDF'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

/* ============================== REPORTS ============================== */

export const Reports = () => {
  const { push, Toasts } = useToasts();
  const [busy, setBusy] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const dl = async (kind) => {
    setBusy(kind);
    try {
      const qs = new URLSearchParams({ format: 'csv', ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString();
      await downloadFile(`/inventory/reports/${kind}?${qs}`, `${kind}-report.csv`);
      push(`${kind === 'sales' ? 'Sales' : 'Inventory'} CSV downloaded`, 'success');
    } catch (e) { push(getErrorMessage(e, 'Export failed — check your role permissions'), 'error'); }
    finally { setBusy(null); }
  };

  const tiles = [
    { kind: 'sales', icon: '💰', title: 'Sales report', desc: 'Orders, statuses and totals. Optional date range. Exports CSV with auth.', grad: 'from-indigo-500 to-violet-500' },
    { kind: 'inventory', icon: '📦', title: 'Inventory report', desc: 'SKU, pricing, stock and reorder levels across the catalog.', grad: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-4">
      <Toasts />
      <PageHeader title="Reports" subtitle="Authenticated exports & analytics" icon="📈" />
      <div className="card anim-fadeUp">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <Field label="From"><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          {(from || to) && <button className="btn-ghost btn" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>}
          <p className="text-[11px] text-slate-400 sm:ml-auto sm:text-right">Date range applies to the sales export.<br />Inventory export is a live snapshot.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {tiles.map((t, i) => (
          <Reveal key={t.kind} className={`card card-hover stagger-${i + 1}`} delay={i * 90}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.grad} grid place-items-center text-2xl shadow-md mb-3`}>{t.icon}</div>
            <h3 className="font-bold text-lg">{t.title}</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">{t.desc}</p>
            <button className="btn btn-brand w-full" disabled={busy === t.kind} onClick={() => dl(t.kind)}>
              {busy === t.kind ? <Spinner label="Exporting…" /> : '⬇ Download CSV'}
            </button>
          </Reveal>
        ))}
      </div>
      <div className="card text-sm text-slate-600 anim-fadeUp">
        <span className="font-semibold text-slate-900">Need more?</span> Stock movement history lives under <Link to="/inventory" className="text-indigo-600 font-semibold underline">Inventory → History</Link> with product, warehouse and user context.
      </div>
    </div>
  );
};

/* ============================== 404 ============================== */

export const NotFound = () => (
  <div className="card text-center py-16 anim-pop">
    <div className="text-6xl mb-3">🧭</div>
    <h2 className="text-2xl font-extrabold">Page not found</h2>
    <p className="text-sm text-slate-500 mt-1">The link you followed doesn&apos;t exist.</p>
    <Link to="/" className="btn btn-brand mt-5">← Back to dashboard</Link>
  </div>
);

/* ============================== LOGIN + DEMO ACCESS ============================== */

const copyText = async (text, onOk, onFail) => {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    onOk?.();
  } catch { onFail?.(); }
};

export const DemoAccessPanel = ({ form, setForm, compact = false }) => {
  const [copied, setCopied] = useState(null);
  const flag = (k) => { setCopied(k); setTimeout(() => setCopied(null), 1600); };

  return (
    <section aria-label="Demo access" className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400/30 to-fuchsia-400/30 blur-2xl" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg" aria-hidden>🎭</span>
          <h3 className="font-extrabold tracking-tight">Demo Access</h3>
          <span className="badge badge-indigo ml-auto">public demo</span>
        </div>
        <p className="text-xs text-slate-600 mb-3">This is a demo — use these credentials to try the app. No signup needed.</p>

        {[
          { k: 'email', label: 'Email', value: DEMO_CREDENTIALS.email, mono: true },
          { k: 'password', label: 'Password', value: DEMO_CREDENTIALS.password, mono: true },
        ].map((row) => (
          <div key={row.k} className="flex items-center gap-2 mb-2 last:mb-0">
            <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.label}</div>
              <div className={`text-sm font-semibold truncate ${row.mono ? 'font-mono' : ''}`}>{row.value}</div>
            </div>
            <button
              type="button" onClick={() => copyText(row.value, () => flag(row.k))}
              className="btn-secondary !py-2.5 !px-3 shrink-0" aria-label={`Copy ${row.label}`}
              title={`Copy ${row.label}`}>
              {copied === row.k ? '✓ Copied' : '⧉ Copy'}
            </button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button type="button" className="btn w-full !py-2.5" onClick={() => setForm({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password })}>
            ✨ Use Demo Account
          </button>
          <button type="button" className="btn btn-brand w-full !py-2.5" onClick={() => setForm({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }, true)}>
            → Login as Demo
          </button>
        </div>
        {!compact && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.email} type="button" title={a.hint}
                onClick={() => setForm({ email: a.email, password: a.password })}
                className="btn-secondary flex-1 whitespace-nowrap">{a.icon} {a.label}</button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const Login = () => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [form, setFormState] = useState({ email: DEMO_CREDENTIALS?.email || '', password: DEMO_CREDENTIALS?.password || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const doLogin = async (e, override) => {
    e?.preventDefault();
    const payload = override || form;
    if (!payload?.email || !payload?.password) return setError('Enter your email and password.');
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      if (!data?.token) throw new Error('Login failed: no token returned');
      dispatch(setCredentials({ token: data.token, user: data.user }));
      nav('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Is the server running on :5000?'));
    } finally { setLoading(false); }
  };

  const setForm = (patch, submitNow = false) => {
    if (submitNow) {
      setFormState(patch);
      // submit on next tick with fresh values
      setTimeout(() => doLogin(null, patch), 0);
    } else setFormState(patch);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1020] flex items-center justify-center p-4">
      <a href="#login-form" className="skip-link">Skip to login form</a>
      <div className="blob w-96 h-96 bg-indigo-600 -top-10 -left-10" aria-hidden />
      <div className="blob w-[28rem] h-[28rem] bg-fuchsia-600 top-1/3 -right-20" style={{ animationDelay: '2s' }} aria-hidden />
      <div className="blob w-72 h-72 bg-cyan-500 bottom-0 left-1/3" style={{ animationDelay: '4s' }} aria-hidden />
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[.15]" aria-hidden
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' }} />

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl anim-pop border border-white/10">
        <div className="hidden md:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white relative overflow-hidden">
          <div className="blob w-56 h-56 bg-white/20 -bottom-10 -left-10" aria-hidden />
          <div className="flex items-center gap-2 font-extrabold text-lg relative">
            <span className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 grid place-items-center text-xl backdrop-blur" aria-hidden>📦</span>
            SMB Inventory Suite
          </div>
          <div className="space-y-5 anim-fadeUp relative">
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-[1.05] font-display">Warehouse,<br />orders & stock<br />in one place.</h2>
            <p className="text-white/80 text-sm max-w-xs">Real-time stock, purchase & sales pipeline, PDF invoices, low-stock alerts and one-click reports.</p>
            <ul className="space-y-2 text-sm">
              {[['⚡', 'Live stock moves & transfers'], ['🧾', 'PO receive → auto stock-in'], ['📈', 'Dashboard, CSV exports & invoices']].map(([i, t]) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 grid place-items-center" aria-hidden>{i}</span>{t}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1.5 rounded-full bg-white/15 border border-white/20">RBAC</span>
              <span className="px-2.5 py-1.5 rounded-full bg-white/15 border border-white/20">Audit logs</span>
              <span className="px-2.5 py-1.5 rounded-full bg-white/15 border border-white/20">Socket live</span>
            </div>
          </div>
          <div className="text-xs text-white/60 relative">Trusted by small-to-medium businesses • v2.0</div>
        </div>

        <div className="bg-white p-6 sm:p-8">
          <form id="login-form" onSubmit={doLogin} className="space-y-4" aria-label="Sign in">
            <div>
              <h2 className="font-extrabold text-2xl tracking-tight font-display">Welcome back 👋</h2>
              <p className="text-sm text-slate-500">Sign in to your workspace</p>
            </div>
            {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 anim-fadeIn" role="alert">{error}</div>}
            <Field label="Email" htmlFor="login-email">
              <input id="login-email" className="input mt-0" type="email" autoComplete="username" value={form.email}
                onChange={(e) => setFormState({ ...form, email: e.target.value })} placeholder="you@company.com" required />
            </Field>
            <div>
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="relative mt-1.5">
                <input id="login-password" className="input pr-20" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  value={form.password} onChange={(e) => setFormState({ ...form, password: e.target.value })} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} aria-pressed={showPw}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-white hover:bg-slate-900 transition-all">
                  {showPw ? '🙈 Hide' : '👁 Show'}
                </button>
              </div>
            </div>
            <button className="btn btn-brand w-full !py-3 text-base" disabled={loading}>
              {loading ? <Spinner label="Signing in…" /> : 'Sign in →'}
            </button>
            <DemoAccessPanel form={form} setForm={setForm} />
            <p className="text-[11px] text-slate-400 text-center">Demo data resets periodically • Never enter real production secrets here</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export const usePageMeta = () => null;
