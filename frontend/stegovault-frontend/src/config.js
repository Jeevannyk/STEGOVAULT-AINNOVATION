// API base URL.
//
// Default: a relative "/api" path. The Vite dev server proxies /api → the Django
// backend (see vite.config.js), so the browser only ever talks to the SAME origin
// the page was loaded from. This means only ONE port needs to be forwarded/tunnelled
// — your friend hitting http://<your-host>:5173 reaches the backend through the proxy,
// with no separate port 8000 to expose.
//
// Override: set VITE_API_URL in a .env file if you want to point at a backend on a
// different origin (e.g. VITE_API_URL=https://api.example.com).
const envUrl = import.meta.env?.VITE_API_URL

export const API = envUrl ? envUrl.replace(/\/+$/, '') + '/api' : '/api'
