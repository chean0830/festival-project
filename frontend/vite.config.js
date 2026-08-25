import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client가 브라우저에 없는 Node의 global을 참조해서 필요함
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/oauth2': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
      '/ws-chat': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
})
