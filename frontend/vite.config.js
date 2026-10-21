import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // "@/components/ui/button" means "src/components/ui/button" (used by shadcn too)
      alias: { '@': path.resolve(import.meta.dirname, 'src') },
    },
    server: {
      // The browser calls /api/... and Vite forwards it to the Express server (no CORS needed in dev).
      // If port 5000 is taken on your machine, set VITE_API_PROXY in frontend/.env.local.
      proxy: { '/api': env.VITE_API_PROXY || 'http://localhost:5000' },
    },
  }
})
