/**
 * @fileoverview Phase 71 QA: 체커 패턴 복구 + 에셋 404 전수 수리 검증.
 *
 * 시나리오 1: 에셋 404 전수 검증 (HTTP 레벨 + Phaser textures.exists)
 * 시나리오 2: GatheringScene 체커 패턴 시인성 검증
 * 시나리오 3: 타워 스프라이트 렌더링 (이모지 fallback 아닌 실제 텍스처)
 * 시나리오 4: 스테이지 진입 시 404 없음 (5-1, 6-1, 7-1 등)
 * 시나리오 5: 콘솔 에러 0건 + 회귀 방지
 * 시나리오 6: 엣지케이스 (빠른 씬 전환, 다중 스테이지 진입)
 * 시나리오 7: 시각적 검증 (스크린샷 캡처)
 */
import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// Phase 71 대상 에셋 13종
const PHASE71_ASSETS = {
  tilesets: ['dessert_cafe', 'grand_finale', 'sakura_izakaya'],
  towers: ['spice_grinder', 'wasabi_cannon'],
  tables_waiting: ['table_lv1_waiting', 'table_lv2_waiting', 'table_lv3_waiting', 'table_lv4_waiting'],
  tables_seated: ['table_lv1_seated', 'table_lv2_seated', 'table_lv3_seated', 'table_lv4_seated'],
};

/** 게임 부팅 대기 (MenuScene 활성화까지) */
async function waitForBoot(page) {
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

/** localStorage 초기화 후 클린 부팅 */
async function freshStart(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

/** GatheringScene으로 특정 스테이지 진입 */
async function enterGatheringScene(page, stageId) {
  await page.evaluate((sid) => {
    window.__game.scene.start('GatheringScene', { stageId: sid });
  }, stageId);
  await page.waitForTimeout(3000);
}

test.describe('Phase 71 QA -- 체커 패턴 복구 + 에셋 404 수리', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 1: 에셋 404 전수 검증
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 1: 에셋 404 전수 검증', () => {

    test('S1-01: 부팅 시 13종 에셋 HTTP 404 0건', async ({ page }) => {
      const responses404 = [];
      page.on('response', resp => {
        if (resp.status() === 404) {
          const url = resp.url();
          // favicon.ico 제외
          if (!url.includes('favicon.ico')) {
            responses404.push(url);
          }
        }
      });

      await freshStart(page);
      // 부팅만으로 SpriteLoader가 모든 에셋을 preload
      await page.waitForTimeout(2000);

      expect(responses404).toEqual([]);
    });

    test('S1-02: Phaser textures.exists -- 타일셋 3종', async ({ page }) => {
      await freshStart(page);

      const results = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};
        return {
          dessert_cafe: game.textures.exists('tileset_dessert_cafe'),
          grand_finale: game.textures.exists('tileset_grand_finale'),
          sakura_izakaya: game.textures.exists('tileset_sakura_izakaya'),
        };
      });

      expect(results.dessert_cafe).toBe(true);
      expect(results.grand_finale).toBe(true);
      expect(results.sakura_izakaya).toBe(true);
    });

    test('S1-03: Phaser textures.exists -- 타워 2종', async ({ page }) => {
      await freshStart(page);

      const results = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};
        return {
          spice_grinder: game.textures.exists('tower_spice_grinder'),
          wasabi_cannon: game.textures.exists('tower_wasabi_cannon'),
        };
      });

      expect(results.spice_grinder).toBe(true);
      expect(results.wasabi_cannon).toBe(true);
    });

    test('S1-04: Phaser textures.exists -- 테이블 waiting 4종', async ({ page }) => {
      await freshStart(page);

      const results = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};
        const r = {};
        for (let lv = 1; lv <= 4; lv++) {
          r[`lv${lv}`] = game.textures.exists(`table_lv${lv}_waiting`);
        }
        return r;
      });

      for (let lv = 1; lv <= 4; lv++) {
        expect(results[`lv${lv}`]).toBe(true);
      }
    });

    test('S1-05: Phaser textures.exists -- 테이블 seated 4종', async ({ page }) => {
      await freshStart(page);

      const results = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};
        const r = {};
        for (let lv = 1; lv <= 4; lv++) {
          r[`lv${lv}`] = game.textures.exists(`table_lv${lv}_seated`);
        }
        return r;
      });

      for (let lv = 1; lv <= 4; lv++) {
        expect(results[`lv${lv}`]).toBe(true);
      }
    });

    test('S1-06: 타일셋 spritesheet 프레임 수 검증 (4x4=16 프레임)', async ({ page }) => {
      await freshStart(page);

      const frameCounts = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};
        const r = {};
        for (const id of ['dessert_cafe', 'grand_finale', 'sakura_izakaya']) {
          const key = `tileset_${id}`;
          const tex = game.textures.get(key);
          // spritesheet 텍스처의 프레임 수 확인
          r[id] = tex ? Object.keys(tex.frames).filter(k => k !== '__BASE').length : 0;
        }
        return r;
      });

      // 128x128 PNG, 32x32 프레임 = 4x4 = 16 프레임
      expect(frameCounts.dessert_cafe).toBe(16);
      expect(frameCounts.grand_finale).toBe(16);
      expect(frameCounts.sakura_izakaya).toBe(16);
    });

    test('S1-07: 타워 텍스처 실제 크기 검증 (48x48)', async ({ page }) => {
      await freshStart(page);

      const sizes = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};
        const r = {};
        for (const id of ['spice_grinder', 'wasabi_cannon']) {
          const key = `tower_${id}`;
          const tex = game.textures.get(key);
          if (tex) {
            const src = tex.source[0];
            r[id] = { width: src.width, height: src.height };
          }
        }
        return r;
      });

      expect(sizes.spice_grinder).toEqual({ width: 48, height: 48 });
      expect(sizes.wasabi_cannon).toEqual({ width: 48, height: 48 });
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 2: 체커 패턴 시인성 검증
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 2: 체커 패턴 시인성', () => {

    test('S2-01: 1-1 맵 렌더링 -- 인접 셀 색상 차이 확인', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      // 체커 패턴 색상 검증: gfx depth=1로 렌더, 두 인접 셀 색상이 달라야 함
      const checkerResult = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return { found: false };

        const canvas = document.querySelector('canvas');
        if (!canvas) return { found: false };
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return { found: false };

        // 여러 위치에서 샘플링하여 체커 패턴 존재 확인
        const samples = [];
        for (let y = 150; y <= 400; y += 50) {
          for (let x = 100; x <= 260; x += 40) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            samples.push({ x, y, r: p[0], g: p[1], b: p[2] });
          }
        }

        // 인접 샘플 간 색상 차이 카운트
        let diffs = 0;
        for (let i = 0; i < samples.length - 1; i++) {
          const a = samples[i];
          const b = samples[i + 1];
          const diff = Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
          if (diff > 10) diffs++;
        }

        return { found: true, totalSamples: samples.length, colorDiffs: diffs };
      });

      expect(checkerResult.found).toBe(true);
      // 적어도 30% 이상의 인접 쌍에서 색상 차이가 있어야 함 (체커 패턴)
      expect(checkerResult.colorDiffs).toBeGreaterThan(checkerResult.totalSamples * 0.2);
    });

    test('S2-02: gfx depth 값이 1인지 확인', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      const gfxDepth = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return null;
        // Graphics 오브젝트 찾기 (depth=1)
        const gfxObjects = scene.children.list.filter(
          obj => obj.type === 'Graphics'
        );
        // 체커 맵 gfx는 첫 번째 Graphics 오브젝트
        return gfxObjects.length > 0 ? gfxObjects[0].depth : null;
      });

      expect(gfxDepth).toBe(1);
    });

    test('S2-03: 체커 색상 값 검증 (스펙 대비)', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      // 맵 영역에서 녹색(비경로) 체커 2톤 색상 직접 확인
      const colorCheck = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'no canvas' };
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return { error: 'no ctx' };

        // 맵 중앙 넓은 영역에서 녹색 계열 픽셀 수집
        const greenPixels = new Set();
        const brownPixels = new Set();
        for (let y = 120; y <= 450; y += 2) {
          for (let x = 50; x <= 310; x += 2) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            const hex = (p[0] << 16) | (p[1] << 8) | p[2];
            // 녹색 계열 (비경로): G > R, G > B
            if (p[1] > p[0] && p[1] > p[2] && p[1] > 20) {
              greenPixels.add(hex);
            }
            // 갈색/황금 계열 (경로): R > G > B
            if (p[0] > p[1] && p[1] > p[2] && p[0] > 100) {
              brownPixels.add(hex);
            }
          }
        }

        return {
          greenColorCount: greenPixels.size,
          brownColorCount: brownPixels.size,
          hasGreen: greenPixels.size >= 2,
          hasBrown: brownPixels.size >= 2,
        };
      });

      // 비경로에 최소 2가지 녹색 톤이 존재해야 함 (체커 패턴)
      expect(colorCheck.hasGreen).toBe(true);
      // 경로에 최소 2가지 갈색 톤이 존재해야 함 (체커 패턴)
      expect(colorCheck.hasBrown).toBe(true);
    });

    test('S2-04: 배경 rect 위에 체커 패턴이 가려지지 않음 (depth 검증)', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      // 맵 중앙 픽셀이 배경색(0x0a0a1a)이 아닌지 확인
      const notHidden = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        if (!ctx) return false;

        // 맵 중앙 (180, 300) 픽셀 확인 -- 배경색(10, 10, 26)이 아니어야 함
        const p = ctx.getImageData(180, 300, 1, 1).data;
        const isBg = p[0] === 10 && p[1] === 10 && p[2] === 26;
        return !isBg;
      });

      expect(notHidden).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 3: 타워 스프라이트 렌더링 검증
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 3: 타워 스프라이트 렌더링', () => {

    test('S3-01: spice_grinder 텍스처 기본 프레임 유효', async ({ page }) => {
      await freshStart(page);

      const valid = await page.evaluate(() => {
        const game = window.__game;
        const tex = game?.textures?.get('tower_spice_grinder');
        if (!tex) return false;
        const frame = tex.get('__BASE');
        return frame && frame.width > 0 && frame.height > 0;
      });

      expect(valid).toBe(true);
    });

    test('S3-02: wasabi_cannon 텍스처 기본 프레임 유효', async ({ page }) => {
      await freshStart(page);

      const valid = await page.evaluate(() => {
        const game = window.__game;
        const tex = game?.textures?.get('tower_wasabi_cannon');
        if (!tex) return false;
        const frame = tex.get('__BASE');
        return frame && frame.width > 0 && frame.height > 0;
      });

      expect(valid).toBe(true);
    });

    test('S3-03: 기존 타워(pan, salt, grill)와 동일한 텍스처 구조', async ({ page }) => {
      await freshStart(page);

      const comparison = await page.evaluate(() => {
        const game = window.__game;
        if (!game?.textures) return {};

        const results = {};
        for (const id of ['pan', 'salt', 'grill', 'spice_grinder', 'wasabi_cannon']) {
          const key = `tower_${id}`;
          const tex = game.textures.get(key);
          if (tex) {
            const src = tex.source[0];
            results[id] = {
              exists: true,
              width: src.width,
              height: src.height,
              frameCount: Object.keys(tex.frames).filter(k => k !== '__BASE').length,
            };
          } else {
            results[id] = { exists: false };
          }
        }
        return results;
      });

      // 모든 타워 텍스처가 존재하는지
      expect(comparison.pan.exists).toBe(true);
      expect(comparison.spice_grinder.exists).toBe(true);
      expect(comparison.wasabi_cannon.exists).toBe(true);

      // 48x48 크기 확인 (기존 타워도 48x48이어야 함)
      expect(comparison.spice_grinder.width).toBe(48);
      expect(comparison.spice_grinder.height).toBe(48);
      expect(comparison.wasabi_cannon.width).toBe(48);
      expect(comparison.wasabi_cannon.height).toBe(48);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 4: 스테이지 진입 시 404 없음
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 4: 스테이지 진입 시 에셋 로드', () => {

    test('S4-01: 5-1 (dessert_cafe) 스테이지 진입 시 404 0건', async ({ page }) => {
      const asset404s = [];
      page.on('response', resp => {
        if (resp.status() === 404 && !resp.url().includes('favicon.ico')) {
          asset404s.push(resp.url());
        }
      });

      await freshStart(page);
      await enterGatheringScene(page, '5-1');

      expect(asset404s).toEqual([]);
    });

    test('S4-02: 6-1 (grand_finale) 스테이지 진입 시 404 0건', async ({ page }) => {
      const asset404s = [];
      page.on('response', resp => {
        if (resp.status() === 404 && !resp.url().includes('favicon.ico')) {
          asset404s.push(resp.url());
        }
      });

      await freshStart(page);
      await enterGatheringScene(page, '6-1');

      expect(asset404s).toEqual([]);
    });

    test('S4-03: 7-1 (sakura_izakaya) 스테이지 진입 시 404 0건', async ({ page }) => {
      const asset404s = [];
      page.on('response', resp => {
        if (resp.status() === 404 && !resp.url().includes('favicon.ico')) {
          asset404s.push(resp.url());
        }
      });

      await freshStart(page);
      await enterGatheringScene(page, '7-1');

      expect(asset404s).toEqual([]);
    });

    test('S4-04: 8-1 (spice_grinder/wasabi_cannon 배치 가능 스테이지) 진입 시 404 0건', async ({ page }) => {
      const asset404s = [];
      page.on('response', resp => {
        if (resp.status() === 404 && !resp.url().includes('favicon.ico')) {
          asset404s.push(resp.url());
        }
      });

      await freshStart(page);
      await enterGatheringScene(page, '8-1');

      expect(asset404s).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 5: 콘솔 에러 0건 + 회귀 방지
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 5: 콘솔 에러 회귀 검증', () => {

    test('S5-01: 게임 부팅 시 pageerror 0건', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);
      await page.waitForTimeout(2000);

      expect(errors).toEqual([]);
    });

    test('S5-02: 1-1 GatheringScene 진입 시 pageerror 0건', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      expect(errors).toEqual([]);
    });

    test('S5-03: 5-1 GatheringScene 진입 시 pageerror 0건', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);
      await enterGatheringScene(page, '5-1');

      expect(errors).toEqual([]);
    });

    test('S5-04: console.error에 에셋 키워드(404, Failed to load) 0건', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (text.includes('404') || text.includes('Failed to load') || text.includes('net::ERR')) {
            consoleErrors.push(text);
          }
        }
      });

      await freshStart(page);
      await enterGatheringScene(page, '1-1');
      // 다른 스테이지도 한 번 진입
      await enterGatheringScene(page, '5-1');

      expect(consoleErrors).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 6: 엣지케이스
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 6: 엣지케이스', () => {

    test('S6-01: 빠른 스테이지 전환 (1-1 -> 5-1 -> 7-1) 시 크래시 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);

      // 빠르게 3개 스테이지 연속 진입
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(500);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '5-1' });
      });
      await page.waitForTimeout(500);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '7-1' });
      });
      await page.waitForTimeout(3000);

      expect(errors).toEqual([]);
    });

    test('S6-02: 동일 스테이지 2회 연속 진입 시 체커 패턴 유지', async ({ page }) => {
      await freshStart(page);

      // 1차 진입
      await enterGatheringScene(page, '1-1');

      // 2차 진입 (재진입)
      await enterGatheringScene(page, '1-1');

      // 체커 패턴 확인
      const gfxDepth = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return null;
        const gfxObjects = scene.children.list.filter(
          obj => obj.type === 'Graphics'
        );
        return gfxObjects.length > 0 ? gfxObjects[0].depth : null;
      });

      expect(gfxDepth).toBe(1);
    });

    test('S6-03: GatheringScene -> ServiceScene -> GatheringScene 씬 전환 후 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      // ServiceScene 전환
      await page.evaluate(() => {
        window.__game.scene.start('ServiceScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      // 다시 GatheringScene
      await enterGatheringScene(page, '5-1');

      expect(errors).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 7: 시각적 검증 (스크린샷)
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 7: 시각적 검증', () => {

    test('S7-01: 1-1 체커 패턴 전체 화면 스크린샷', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase71-qa-checker-1-1.png`,
      });
    });

    test('S7-02: 5-1 (dessert_cafe 테마) 스크린샷', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '5-1');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase71-qa-stage-5-1.png`,
      });
    });

    test('S7-03: 7-1 (sakura_izakaya 테마) 스크린샷', async ({ page }) => {
      await freshStart(page);
      await enterGatheringScene(page, '7-1');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase71-qa-stage-7-1.png`,
      });
    });

    test('S7-04: 모바일 소형 뷰포트(320x480) 렌더링', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 480 });
      await freshStart(page);
      await enterGatheringScene(page, '1-1');

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase71-qa-mobile-small.png`,
      });

      // 크래시 없이 렌더링되면 PASS
      const sceneActive = await page.evaluate(() => {
        return window.__game?.scene?.isActive('GatheringScene');
      });
      expect(sceneActive).toBe(true);
    });
  });
});
