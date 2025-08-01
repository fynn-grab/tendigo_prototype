import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Leitet alle Anfragen von /api an den Flask-Server weiter
      '/api': {
        target: 'http://localhost:5003', // Ihr Flask-Backend-Server
        changeOrigin: true, // Notwendig für virtuelle Hosts
        secure: false,      // Wenn Ihr Backend kein HTTPS verwendet
      },
    }
  }
})