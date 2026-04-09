import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, copyFileSync } from 'fs';

/**
 * 디렉토리를 재귀 복사하되 .zip 파일은 제외한다.
 * @param {string} src
 * @param {string} dest
 */
function copyDirFiltered(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = resolve(src, entry);
    const destPath = resolve(dest, entry);
    const st = statSync(srcPath);
    if (st.isDirectory()) {
      copyDirFiltered(srcPath, destPath);
    } else if (!entry.endsWith('.zip')) {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 게임 스프라이트 에셋 플러그인.
 * - dev 서버: /sprites/* 요청을 프로젝트 루트 assets/ 에서 정적 서빙
 * - build: assets/ 전체를 dist/sprites/ 에 복사 (.zip 제외)
 */
function spriteAssetsPlugin() {
  const assetsRoot = resolve(import.meta.dirname || '.', 'assets');

  return {
    name: 'sprite-assets',
    configureServer(server) {
      // dev 서버 미들웨어: /sprites/ 경로를 assets/ 디렉토리에서 직접 서빙
      server.middlewares.use('/sprites', (req, res, next) => {
        const filePath = resolve(assetsRoot, decodeURIComponent(req.url).replace(/^\//, ''));
        try {
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            const ext = filePath.split('.').pop().toLowerCase();
            const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', json: 'application/json' };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'max-age=3600');
            res.end(readFileSync(filePath));
            return;
          }
        } catch { /* 파일 접근 오류 시 next */ }
        next();
      });
    },
    closeBundle() {
      // build 시: assets/ → dist/sprites/ 복사 (.zip 파일 제외)
      if (existsSync(assetsRoot)) {
        const dest = resolve(import.meta.dirname || '.', 'dist', 'sprites');
        copyDirFiltered(assetsRoot, dest);
      }
    },
  };
}

export default defineConfig({
  root: '.',
  base: '/',  // Capacitor Android WebView는 상대경로(./)가 아닌 절대경로(/) 필요
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Android WebView 청크 로딩 순서 문제 방지 — 단일 번들로 빌드
        manualChunks: () => 'index',
      },
    },
  },
  server: {
    port: 5173,
    host: true,  // 0.0.0.0 바인딩 — 로컬 네트워크 외부 접근 허용
    open: false,
  },
  plugins: [spriteAssetsPlugin()],
});
