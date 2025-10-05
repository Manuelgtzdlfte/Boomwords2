import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Boomwords2/',  // ✅ Verifica que sea EXACTAMENTE el nombre de tu repo
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})