import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    viteSingleFile()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    outDir: 'football-manager',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(import.meta.dirname, 'football.html')
      },
      output: {
        format: 'iife',
        name: 'PitchCoreApp',
        inlineDynamicImports: true
      }
    }
  }
});
