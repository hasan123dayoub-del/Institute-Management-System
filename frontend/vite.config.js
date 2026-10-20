import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The browser calls /api/... and Vite forwards it to the Express server (no CORS needed in dev).
    proxy: { '/api': 'http://localhost:5000' },
  },
})
