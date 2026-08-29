export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

export const DEMO_AUTH_ENABLED = import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true';
