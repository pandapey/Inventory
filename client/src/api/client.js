import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 15000 });
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* SSR-safe */ }
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch { /* noop */ }
      // only redirect if we had a token (i.e. session expired), not on login failure itself
      if (err.config?.url && !err.config.url.includes('/auth/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Authenticated file download (fixes broken <a href> CSV/PDF that sent no token)
export const downloadFile = async (path, filename) => {
  const res = await api.get(path, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || path.split('/').pop() || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const getErrorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.response?.data?.errors?.join?.(', ') || err?.message || fallback;

export default api;
