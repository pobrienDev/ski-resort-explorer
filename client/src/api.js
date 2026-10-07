import axios from "axios";

// Base URL for the Flask API.
//
// In development it is always empty: requests go to relative /api/* paths and
// the Vite dev server proxies them to Flask (see vite.config.js, which uses
// VITE_API_BASE_URL as the proxy target). In a production build there is no
// proxy, so VITE_API_BASE_URL must point at the public API origin.
export const API_BASE = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL || "";

/** All resorts. Resolves to an array; rejects if the payload is not shaped as expected. */
export async function fetchResorts() {
    const { data } = await axios.get(`${API_BASE}/api/resorts`);
    if (!data || !Array.isArray(data.resorts)) {
        throw new Error("Invalid data format from the server.");
    }
    return data.resorts;
}

/** Current conditions for a coordinate, proxied through Flask. */
export async function fetchWeather(lat, lon) {
    const { data } = await axios.get(`${API_BASE}/api/weather`, { params: { lat, lon } });
    return data;
}

/** Tile URL template for the radar overlay (Leaflet substitutes {z}/{x}/{y}). */
export const WEATHER_TILE_URL = `${API_BASE}/api/weather/tiles/{z}/{x}/{y}.png`;
