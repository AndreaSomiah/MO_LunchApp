import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import process from 'node:process';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/MO_LunchApp/' : '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
  },
});
