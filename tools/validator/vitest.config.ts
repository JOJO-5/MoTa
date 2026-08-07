import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@modern-mota/data': resolve(__dirname, '../../packages/data/src'),
    },
  },
})
