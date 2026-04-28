import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, copyFileSync } from 'fs';

// 빌드 번들에서 제외할 디렉토리명 (Phase B-2: _raw/ 원본 백업 제외)
const COPY_DIR_EXCLUDE = ['_raw'];
// 빌드 번들에서 제외할 파일 확장자 패턴 (Phase B-2: .py 후처리 스크립트 제외)
const COPY_FILE_EXCLUDE = ['.zip', '.py'];

/**
 * 디렉토리를 재귀 복사하되 제외 패턴에 해당하는 파일/디렉토리는 건너뛴다.
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
      // _raw 등 제외 디렉토리는 재귀 진입하지 않음
      if (!COPY_DIR_EXCLUDE.includes(entry)) {
        copyDirFiltered(srcPath, destPath);
      }
    } else if (!COPY_FILE_EXCLUDE.some(ex => entry.endsWith(ex))) {
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
      // Phase 81: Capacitor 전용 플러그인은 웹 빌드에서 제외 (앱 빌드에서만 해석됨)
      external: ['@capacitor-community/admob'],
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
