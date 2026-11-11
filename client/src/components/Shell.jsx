import { useSelector } from 'react-redux';
import { Navigate, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { logout } from '../store/store.js';

export const Protected = () => {
  const token = useSelector(s => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const icons = {
  '/': '📊', '/products': '📦', '/inventory': '🏭',
  '/purchasing': '🧾', '/sales': '🛒', '/reports': '📈'
};
const descriptions = {
  '/': 'Live operations overview', '/products': 'Catalog, pricing & stock levels',
  '/inventory': 'Moves, transfers & history', '/purchasing': 'Suppliers & purchase orders',
  '/sales': 'Pipeline, fulfillment & invoices', '/reports': 'Exports & analytics'
};

export const Layout = () => {
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    ['/', 'Dashboard'], ['/products', 'Products'], ['/inventory', 'Inventory'],
    ['/purchasing', 'Purchasing'], ['/sales', 'Sales'], ['/reports', 'Reports']
  ];
  const active = links.find(([to]) => loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to)));
  const title = active?.[1] || 'Dashboard';
  const subtitle = descriptions[active?.[0]] || descriptions['/'];

  // Lock body scroll when drawer open + close on Escape
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [mobileOpen]);

  const Sidebar = (
    <div className="flex flex-col h-full">
      <button onClick={() => nav('/')} className="flex items-center gap-3 px-2 mb-6 text-left group" aria-label="Go to dashboard">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 grid place-items-center text-xl shadow-pop group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">📦</div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-tight font-display">SMB Inventory</h1>
          <p className="text-[11px] text-slate-400 tracking-[.2em] uppercase">Suite • v2.0</p>
        </div>
      </button>
      <nav className="space-y-1.5 flex-1" aria-label="Primary">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${(isActive || active?.[0] === to) ? 'active' : ''}`}>
            {({ isActive: navActive }) => (
              <>
                <span className="text-lg" aria-hidden>{icons[to]}</span>
                <span>{label}</span>
                {(navActive || active?.[0] === to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/[.03] border border-white/10 anim-fadeUp">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center font-extrabold text-slate-900 shadow" aria-hidden>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user?.name || 'Demo user'}</div>
            <div className="text-[11px] text-slate-400 capitalize">{(user?.role || 'employee').replace(/_/g, ' ')}</div>
          </div>
        </div>
        <button
          className="mt-3 w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white/10 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95"
          onClick={() => { dispatch(logout()); nav('/login'); }}>
          ⎋ Logout
        </button>
      </div>
    </div>
  );
  return (
    <div className="flex min-h-screen bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(99,102,241,.12),transparent),radial-gradient(900px_500px_at_-10%_20%,rgba(217,70,239,.08),transparent),linear-gradient(to_bottom_right,#f8fafc,#eef2ff66,#faf5ff66)]">
      <a href="#main" className="skip-link">Skip to content</a>
      <aside className="w-[270px] shrink-0 bg-[#0b1020] text-white p-5 hidden md:block sticky top-0 h-screen shadow-2xl border-r border-white/5" aria-label="Sidebar">
        {Sidebar}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fadeIn" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0b1020] text-white p-5 anim-fadeUp shadow-2xl overflow-y-auto">{Sidebar}</aside>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-slate-200/70 px-4 md:px-8 py-3.5 flex items-center gap-3 anim-fadeIn">
          <button className="md:hidden btn-secondary !px-3 !py-2" onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button>
          <div className="min-w-0">
            <h2 className="font-extrabold text-lg leading-tight truncate font-display">{title}</h2>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {subtitle}{user?.name ? ` — welcome back, ${user.name.split(' ')[0]}` : ''}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />Live
            </span>
            <span className="badge !bg-slate-900 !text-white capitalize">{(user?.role || 'employee').replace(/_/g, ' ')}</span>
          </div>
        </header>
        <main id="main" className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 anim-fadeUp"><Outlet /></main>
        <footer className="px-4 md:px-8 pb-6 text-center text-[11px] text-slate-400">
          SMB Inventory Suite • Stock, orders & warehouses in one place
        </footer>
      </div>
    </div>
  );
};
