import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  // Honour PORT when the harness assigns one, so the preview and the dev
  // server always agree on the origin (5173 is often taken by another app).
  server: { open: false, port: Number(process.env.PORT) || 5173 },
  build: { outDir: 'dist' },
})
