# Ski Resort Explorer — client

React 19 + Vite frontend for the Ski Resort Explorer. See the [root README](../README.md) for the full setup, including the Flask API and MySQL database this app talks to.

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to the Flask server
npm run lint
npm run build    # outputs to dist/
```

In development, Vite proxies `/api/*` to the Flask server (default `http://localhost:8080`, override with `VITE_API_BASE_URL` in `.env`). For a production build, set `VITE_API_BASE_URL` to the API origin and serve `dist/` from any static host.
