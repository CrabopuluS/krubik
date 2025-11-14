import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './frontend/postcss.config.cjs',
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
});
