import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',  // Capacitor Android WebView는 상대경로(./)가 아닌 절대경로(/) 필요
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,  // 0.0.0.0 바인딩 — 로컬 네트워크 외부 접근 허용
    open: false,
  },
});
