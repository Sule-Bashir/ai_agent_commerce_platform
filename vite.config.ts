import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 👇 CRITICAL for Replit hosting
  base: './',

  plugins: [react()],

  // 👇 Fixes "@/components" import errors
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 👇 Server Configuration for Replit
  server: {
    host: '0.0.0.0',    // Allows external connections
    port: 5173,         // 👈 Must match .replit file (5173, NOT 3000)
    strictPort: true,   // Will fail if port is in use
    // 👇 Allow your Replit host (update if different)
    allowedHosts: [
      'a1c7c916-3118-4c87-99b8-7a0dffdd3414-00-kntziqybqlpu.janeway.replit.dev'
    ],
    hmr: {
      overlay: true,
    },
  },

  // 👇 Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
