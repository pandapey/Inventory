import { useEffect, useRef, useState } from 'react';

/* Reusable design-system primitives: cards, buttons are CSS classes in index.css.
   This file adds accessible, animated building blocks used by every page. */

export const useReveal = (options = { threshold: 0.12 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-visible')),
      options
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
};

export const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
};

export const PageHeader = ({ title, subtitle, actions, icon }) => (
  <div className="flex flex-wrap items-end gap-4 anim-fadeUp">
    <div className="flex items-center gap-3 min-w-0">
      {icon && (
        <div className="w-12 h-12 rounded-2xl grid place-items-center text-2xl text-white shadow-pop shrink-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const SkeletonCards = ({ n = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Loading" role="status">
    {[...Array(n)].map((_, i) => (
      <div key={i} className="card h-28 skeleton" />
    ))}
    <span className="sr-only">Loading…</span>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card" role="status" aria-label="Loading table">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-11 rounded-xl skeleton mb-2 last:mb-0" style={{ animationDelay: `${i * 80}ms` }} />
    ))}
    <span className="sr-only">Loading…</span>
  </div>
);

export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', hint, action }) => (
  <div className="card text-center py-12 anim-pop">
    <div className="text-5xl mb-3">{icon}</div>
    <h3 className="font-bold text-lg">{title}</h3>
    {hint && <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{hint}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export const ErrorState = ({ message = 'Failed to load', onRetry }) => (
  <div className="card text-center py-10 border-rose-200 bg-rose-50/50 anim-pop" role="alert">
    <div className="text-4xl mb-2">⚠️</div>
    <h3 className="font-bold">Something went wrong</h3>
    <p className="text-sm text-slate-600 mt-1">{message}</p>
    {onRetry && (
      <button className="btn mt-4" onClick={onRetry}>
        ↻ Try again
      </button>
    )}
  </div>
);

export const Spinner = ({ label = 'Loading…' }) => (
  <span className="inline-flex items-center gap-2" role="status">
    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
    {label}
  </span>
);

export const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-amber', confirmed: 'badge-cyan', processing: 'badge-indigo',
    shipped: 'badge-slate', delivered: 'badge-emerald', cancelled: 'badge-rose',
    received: 'badge-emerald', draft: 'badge-slate', ordered: 'badge-indigo', partial: 'badge-amber',
    in: 'badge-emerald', out: 'badge-amber', transfer: 'badge-cyan', adjustment: 'badge-indigo',
    low_stock: 'badge-amber', out_of_stock: 'badge-rose'
  };
  const dot = { pending: '🕐', confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '📬', cancelled: '🚫', received: '📥', draft: '📝', ordered: '🧾', partial: '◐' };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{dot[status] ? `${dot[status]} ` : ''}{status}</span>;
};

export const Field = ({ label, children, hint, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className="field-label">{label}</label>
    <div className="mt-1.5">{children}</div>
    {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

// Tiny toast system (no dependency)
let toastId = 0;
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const push = (message, kind = 'info') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  const Toasts = () => (
    <div className="fixed bottom-4 right-4 z-[90] space-y-2 max-w-sm" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`anim-pop px-4 py-3 rounded-2xl text-sm font-medium shadow-2xl border backdrop-blur ${
            t.kind === 'success' ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700'
            : t.kind === 'error' ? 'bg-rose-900/95 text-rose-50 border-rose-700'
            : 'bg-slate-900/95 text-white border-white/10'
          }`}
        >
          {t.kind === 'success' ? '✅ ' : t.kind === 'error' ? '⛔ ' : 'ℹ️ '}{t.message}
        </div>
      ))}
    </div>
  );
  return { push, Toasts };
};

export const StatCard = ({ label, value, icon, grad, index = 0, sub }) => (
  <div className={`card card-hover anim-fadeUp stagger-${(index % 8) + 1} group cursor-default`}>
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} grid place-items-center text-xl shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}>
      {icon}
    </div>
    <div className="text-[11px] text-slate-500 mt-3 font-bold uppercase tracking-widest">{label}</div>
    <div className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</div>
    {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
  </div>
);

export const fmtMoney = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0);
export const fmtNum = (n) => new Intl.NumberFormat('en-US').format(Number(n) || 0);
export const fmtDate = (d) => { try { return new Date(d).toLocaleString(); } catch { return '—'; } };
