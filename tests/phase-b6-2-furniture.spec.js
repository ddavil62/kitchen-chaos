/**
 * @fileoverview Phase B-6-2 가구 비례 업스케일 검증 테스트.
 * bench 28x96, table 44x96, BENCH_CONFIG/BENCH_SLOTS/TABLE_SET_ANCHORS 상수 갱신 검증.
 */
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── 헬퍼 ──

async function waitForTavernScene(page) {
  await page.goto('http://localhost:5173/?scene=tavern');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
  // 씬 안정화 대기
  await page.waitForTimeout(1000);
}

const FURNITURE_ASSETS = [
  { name: 'bench_vertical_l_v12.png', expW: 28, expH: 96 },
  { name: 'bench_vertical_r_v12.png', expW: 28, expH: 96 },
  { name: 'table_vertical_v12.png',   expW: 44, expH: 96 },
];

// ── TC-1: 신규 가구 에셋 HTTP 200 ──

test.describe('Phase B-6-2: 가구 에셋 HTTP 200', () => {
  for (const asset of FURNITURE_ASSETS) {
    test(`${asset.name} HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/${asset.name}`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── TC-2: 가구 에셋 픽셀 크기 검증 ──

test.describe('Phase B-6-2: 가구 에셋 픽셀 크기', () => {
  for (const asset of FURNITURE_ASSETS) {
    test(`${asset.name} naturalSize = ${asset.expW}x${asset.expH}`, async ({ page }) => {
      const size = await page.evaluate(async (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = url;
        });
      }, `http://localhost:5173/assets/tavern/${asset.name}`);
      // SC-1/SC-2/SC-3 최소 기준
      if (asset.name.includes('bench')) {
        expect(size.w, `${asset.name} width >= 24`).toBeGreaterThanOrEqual(24);
      } else {
        expect(size.w, `${asset.name} width >= 40`).toBeGreaterThanOrEqual(40);
      }
      // 정확값 검증
      expect(size.w, `${asset.name} width`).toBe(asset.expW);
      expect(size.h, `${asset.name} height`).toBe(asset.expH);
    });
  }
});

// ── TC-3: tavernLayoutData.js BENCH_CONFIG 상수값 검증 ──

test.describe('Phase B-6-2: BENCH_CONFIG 상수값', () => {
  test('BENCH_CONFIG 주요 상수 일치', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    // QUAD_W
    expect(content).toMatch(/QUAD_W:\s*104/);
    // BENCH_W
    expect(content).toMatch(/BENCH_W:\s*28/);
    // BENCH_H
    expect(content).toMatch(/BENCH_H:\s*96/);
    // BENCH_L_LEFT
    expect(content).toMatch(/BENCH_L_LEFT:\s*4/);
    // BENCH_R_LEFT
    expect(content).toMatch(/BENCH_R_LEFT:\s*72/);
    // TABLE_W
    expect(content).toMatch(/TABLE_W:\s*44/);
    // TABLE_H
    expect(content).toMatch(/TABLE_H:\s*96/);
  });
});

// ── TC-4: BENCH_SLOTS.lv0 dy 값 검증 ──

test.describe('Phase B-6-2: BENCH_SLOTS.lv0 dy', () => {
  test('lv0 slotOffsets dy = [26, 60, 94]', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    // lv0 블록에서 dy 값 추출
    const lv0Match = content.match(/lv0:\s*Object\.freeze\(\{[\s\S]*?slotOffsets:\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
    expect(lv0Match).not.toBeNull();

    const dyValues = [...lv0Match[1].matchAll(/dy:\s*(\d+)/g)].map(m => parseInt(m[1]));
    expect(dyValues).toEqual([26, 60, 94]);
  });
});

// ── TC-5: BENCH_LEFT/RIGHT_OFFSET_X 검증 ──

test.describe('Phase B-6-2: BENCH OFFSET_X', () => {
  test('BENCH_LEFT_OFFSET_X = 17, BENCH_RIGHT_OFFSET_X = 85', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const leftMatch = content.match(/BENCH_LEFT_OFFSET_X\s*=\s*(\d+)/);
    expect(leftMatch).not.toBeNull();
    expect(parseInt(leftMatch[1])).toBe(17);

    const rightMatch = content.match(/BENCH_RIGHT_OFFSET_X\s*=\s*(\d+)/);
    expect(rightMatch).not.toBeNull();
    expect(parseInt(rightMatch[1])).toBe(85);
  });
});

// ── TC-6: TABLE_SET_ANCHORS 재계산 검증 ──

test.describe('Phase B-6-2: TABLE_SET_ANCHORS quadLeft', () => {
  test('4 quad quadLeft = [132, 252, 132, 252]', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    // TABLE_SET_ANCHORS 블록에서 quadLeft 추출
    const anchorsMatch = content.match(/TABLE_SET_ANCHORS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
    expect(anchorsMatch).not.toBeNull();

    const quadLeftValues = [...anchorsMatch[1].matchAll(/quadLeft:\s*(\d+)/g)].map(m => parseInt(m[1]));
    expect(quadLeftValues).toEqual([132, 252, 132, 252]);
  });
});

// ── TC-7: .legacy-b6-2 백업 3종 존재 확인 ──

test.describe('Phase B-6-2: 레거시 백업', () => {
  test('.legacy-b6-2/ 디렉토리에 3종 백업 존재', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const legacyDir = path.resolve('assets/tavern/.legacy-b6-2');
    expect(fs.existsSync(legacyDir)).toBe(true);

    const expectedFiles = [
      'bench_vertical_l_v12.png',
      'bench_vertical_r_v12.png',
      'table_vertical_v12.png',
    ];
    for (const fname of expectedFiles) {
      const fpath = path.join(legacyDir, fname);
      expect(fs.existsSync(fpath), `${fname} 존재`).toBe(true);
    }
  });
});

// ── TC-8: 금지색 0건 (Python PIL 방식 — Canvas API CORS 우회) ──

import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

test.describe('Phase B-6-2: 금지색 검증', () => {
  for (const asset of FURNITURE_ASSETS) {
    test(`${asset.name} 금지색(magenta/pure green) 0건`, () => {
      const assetPath = resolve(__dirname, '..', 'assets', 'tavern', asset.name).replace(/\\/g, '/');
      // 임시 Python 스크립트 파일 생성 (따옴표 충돌 방지)
      const pyScript = join(tmpdir(), `check_forbidden_${asset.name.replace(/\./g, '_')}.py`);
      writeFileSync(pyScript, [
        'from PIL import Image',
        `img = Image.open("${assetPath}").convert("RGBA")`,
        'data = img.getdata()',
        'count = sum(1 for r,g,b,a in data if a>0 and ((r==255 and g==0 and b==255) or (r==0 and g==255 and b==0)))',
        'print(count)',
      ].join('\n'), 'utf8');
      let result;
      try {
        result = execSync(`python "${pyScript}"`, { encoding: 'utf8' }).trim();
      } finally {
        try { unlinkSync(pyScript); } catch (_) {}
      }
      const forbiddenCount = parseInt(result, 10);
      expect(forbiddenCount, `${asset.name} 금지색 픽셀 수`).toBe(0);
    });
  }
});

// ── TC-9: 씬 진입 후 에러 0건 ──

test.describe('Phase B-6-2: 에러 없음', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('에셋 404 0건 (tavern/ 경로)', async ({ page }) => {
    const failedRequests = [];
    page.on('response', response => {
      if (response.url().includes('/assets/tavern/') && response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(failedRequests).toEqual([]);
  });
});

// ── TC-10: QA 스크린샷 ──

test.describe('Phase B-6-2: QA 스크린샷', () => {
  test('B-6-2 가구 비례 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-2-furniture-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
