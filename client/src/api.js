// Base URL for the Flask API. Override with VITE_API_BASE_URL in client/.env
// when the backend is not on localhost:8080 (e.g. LAN access or production).
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
