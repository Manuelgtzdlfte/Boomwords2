import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ← ESTO ES CLAVE: rutas relativas
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets'
  },
  publicDir: 'public'
})