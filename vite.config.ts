import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  esbuild: {
    // 完全跳过类型检查
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  define: {
    // 确保构建时不会因为类型错误而失败
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://8.136.8.24:8321',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
