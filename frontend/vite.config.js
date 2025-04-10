import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy configuration to handle CORS issues
    // This will redirect requests to specific paths to the backend server
    proxy: {
      // Any request to /api/* will be redirected to http://localhost:8000/api/*
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true, // Changes the origin of the request to match the target URL
        secure: false // Allows insecure connections (e.g., HTTP instead of HTTPS)
      },
      // Any request to /uploads/* will be redirected to http://localhost:8000/uploads/*
      // This is used for static files like images
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})