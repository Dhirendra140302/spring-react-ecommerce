import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Disable modulepreload polyfill injection — eliminates the
    // "preloaded but not used" browser warning
    modulePreload: { polyfill: false },
  },
  server: {
    port: 5173,
  },
})
