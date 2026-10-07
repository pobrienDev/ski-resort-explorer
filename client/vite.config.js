import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Flask's dev server binds 127.0.0.1 (IPv4 only), but Node may resolve
// "localhost" to ::1 first, which can be a different listener entirely (for
// example a Docker-published port). Pin the proxy target to IPv4 so a
// "localhost" setting always reaches the local Flask.
const apiTarget = (configured) => {
  const url = new URL(configured || 'http://127.0.0.1:8080')
  if (url.hostname === 'localhost') url.hostname = '127.0.0.1'
  return url.origin
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
    },
    server: {
      // Honor PORT when a tool assigns one; otherwise Vite's default 5173.
      port: Number(process.env.PORT) || 5173,
      // Forward /api/* to Flask so the browser only ever talks to the Vite
      // origin in development. No CORS needed.
      proxy: {
        '/api': {
          target: apiTarget(env.VITE_API_BASE_URL),
          changeOrigin: true,
        },
      },
    },
  }
})
