import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vitest Configuration for Integration Tests
 * 
 * Integration tests may use real database connections and external services
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // Use node environment for API tests
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/integration/**/*.{test,spec}.{js,ts}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
    ],
    testTimeout: 30000, // 30 seconds for integration tests
    threads: false, // Run sequentially to avoid database conflicts
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },
})

