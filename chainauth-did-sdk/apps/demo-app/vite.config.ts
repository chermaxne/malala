// vite.config.ts - Vite configuration with polyfills
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add polyfills as needed
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Configure esbuild options for polyfills
    },
  },
});
