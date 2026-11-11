// ---------------------------------------------------------------------------
// Public demo account — intentionally public credentials for demonstration only.
// This file is the single source of truth for the login-page demo panel.
// DO NOT put real secrets, API keys, or production passwords here.
// The demo account has limited demo permissions (see server seed roles).
// ---------------------------------------------------------------------------
export const DEMO_CREDENTIALS = Object.freeze({
  email: 'admin@company.com',
  password: 'Admin123!',
  label: 'Super Admin (demo)',
});

export const DEMO_ACCOUNTS = Object.freeze([
  { email: 'admin@company.com', password: 'Admin123!', label: 'Admin', icon: '👑', hint: 'Full access demo' },
  { email: 'sales@company.com', password: 'Admin123!', label: 'Sales', icon: '💼', hint: 'Sales pipeline demo' },
  { email: 'warehouse@company.com', password: 'Admin123!', label: 'Warehouse', icon: '🏭', hint: 'Stock & PO demo' },
]);
