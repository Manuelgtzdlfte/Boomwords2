import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Boomwords2/',  // 🆕 Con B mayúscula
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})