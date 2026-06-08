import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Bind on all interfaces so the dev server is reachable over LAN / port forwarding.
    host: true,
    // Accept any Host header (ngrok / Cloudflare / VS Code tunnels send their own hostname).
    allowedHosts: true,
    // Proxy API calls to Django so the browser only ever makes same-origin requests.
    // This removes cross-origin CORS entirely and means only the frontend port needs
    // to be forwarded — the backend is reached server-side through this proxy.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
