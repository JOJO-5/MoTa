import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@modern-mota/core': path.resolve(__dirname, '../../packages/core/src'),
      '@modern-mota/data': path.resolve(__dirname, '../../packages/data/src'),
      '@modern-mota/render': path.resolve(__dirname, '../../packages/render/src'),
      '@modern-mota/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@modern-mota/persistence': path.resolve(__dirname, '../../packages/persistence/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
    rollupOptions: {
      external: [],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})
