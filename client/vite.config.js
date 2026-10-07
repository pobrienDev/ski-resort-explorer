import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
