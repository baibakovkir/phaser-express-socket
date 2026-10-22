import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/auth': process.env.VITE_SERVER_URL || 'http://localhost:3000',
      '/heroes': process.env.VITE_SERVER_URL || 'http://localhost:3000',
      '/api': process.env.VITE_SERVER_URL || 'http://localhost:3000',
    },
  },
});
