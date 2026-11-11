import { configureStore, createSlice } from '@reduxjs/toolkit';

const safeParse = (v) => {
  try { return v ? JSON.parse(v) : null; } catch { return null; }
};
const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const safeRemove = (k) => { try { localStorage.removeItem(k); } catch { /* noop */ } };

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: safeGet('token') || null, user: safeParse(safeGet('user')) },
  reducers: {
    setCredentials: (s, a) => { s.token = a.payload.token; s.user = a.payload.user; safeSet('token', a.payload.token); safeSet('user', JSON.stringify(a.payload.user)); },
    logout: (s) => { s.token = null; s.user = null; safeRemove('token'); safeRemove('user'); }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
export const selectUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.token;
