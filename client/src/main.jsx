import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { Protected, Layout } from './components/Shell.jsx';
import { Dashboard, Products, InventoryPage, Purchasing, Sales, Reports, Login, NotFound } from './pages/pages.jsx';
import './index.css';

class RouteErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[RouteErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error);
      const isChunkFailure = /dynamically imported module|importing a module|ChunkLoadError|Loading chunk/i.test(msg);
      return (
        <div className="min-h-screen grid place-items-center bg-slate-100 p-6">
          <div className="card max-w-md text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h1 className="font-extrabold text-xl">Something crashed</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isChunkFailure
                ? 'A new version was deployed. Reload to fetch fresh files.'
                : 'Please reload the page. Your session is safe.'}
            </p>
            {import.meta.env.DEV && <pre className="text-left text-[11px] bg-slate-900 text-rose-200 rounded-xl p-3 mt-3 overflow-auto max-h-40">{msg}</pre>}
            <div className="flex gap-2 justify-center mt-4">
              <button className="btn" onClick={() => this.setState({ error: null })}>↻ Try again</button>
              <button className="btn btn-ghost" onClick={() => window.location.reload()}>Reload page</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/purchasing" element={<Purchasing />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RouteErrorBoundary>
    </BrowserRouter>
  </Provider>
);
