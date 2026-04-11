import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Прокси для dev: обход CORS при прямых запросах к Aparu из браузера
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      /** Local FastAPI: `GET /api/v1/*` */
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/aparu-proxy': {
        target: 'http://testtaxi3.aparu.kz',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/aparu-proxy/, ''),
      },
    },
  },
})
