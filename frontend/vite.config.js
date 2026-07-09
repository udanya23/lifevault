import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * vite.config.js — Vite build configuration
 *
 * Key features:
 * 1. `@` alias → resolves to `./src` for clean imports
 *    Instead of: import Button from '../../components/common/Button'
 *    You write:  import Button from '@/components/common/Button'
 *
 * 2. API proxy → in development, any request to /api/*
 *    is forwarded to the backend (port 5000) — no CORS issues in dev.
 *
 * 3. Build config → code splitting + sourcemaps for production debugging
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // Proxy API calls to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Warn if a chunk exceeds 500kB (helps catch bloat early)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
      // Manual chunk splitting using function format (required for Vite 8 / Rolldown)
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor';
              }
              if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
                return 'redux';
              }
              if (id.includes('framer-motion') || id.includes('react-icons') || id.includes('react-toastify')) {
                return 'ui';
              }
              if (id.includes('recharts')) {
                return 'charts';
              }
            }
          },
      },
    },
    sourcemap: true, // Enable for production error tracing (optional)
  },
})
