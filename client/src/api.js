// Base URL for the Flask API.
//
// In development it is always empty: requests go to relative /api/* paths and
// the Vite dev server proxies them to Flask (see vite.config.js, which uses
// VITE_API_BASE_URL as the proxy target). In a production build there is no
// proxy, so VITE_API_BASE_URL must point at the public API origin.
export const API_BASE = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL || "";
