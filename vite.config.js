import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Safely load visualizer only if installed, so production builds without devDependencies don't crash
let visualizerPlugin = null
try {
  const { visualizer } = await import('rollup-plugin-visualizer')
  visualizerPlugin = visualizer({
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
    open: false,
  })
} catch {
  // Ignore if rollup-plugin-visualizer is not installed
}

export default defineConfig({
  cacheDir: '.vite',
  plugins: [
    react(),
    ...(visualizerPlugin ? [visualizerPlugin] : []),
  ],
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: true,
    watch: {
      ignored: ['**/ess-frontend/**', '**/server/**'],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_URL ?? 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
        xfwd: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/motion/')) {
            return 'motion-vendor'
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons-vendor'
          }
          if (id.includes('node_modules/jspdf/') || id.includes('node_modules/html2canvas/')) {
            return 'pdf-vendor'
          }
        },
      },
    },
  },
})
