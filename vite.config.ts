import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Прокси для dev: обход CORS при прямых запросах к Aparu из браузера
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/aparu-proxy': {
        target: 'http://testtaxi3.aparu.kz',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/aparu-proxy/, ''),
      },
    },
  },
})
