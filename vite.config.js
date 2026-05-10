import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
  }
});
