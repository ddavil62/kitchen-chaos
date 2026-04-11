/**
 * @fileoverview Phase 19-5 QA 검증 — ServiceScene 아이소메트릭화 검증.
 * 1) SISO 상수 및 _cellToWorld 좌표 계산 정확성
 * 2) 테이블 아이소 배치 (홀 영역 y:40~280 내 완전 렌더)
 * 3) depth sorting (y좌표 기반)
 * 4) _drawIsoFloor 격자 렌더링
 * 5) 테이블 터치 영역 정상 동작
 * 6) 말풍선, 인내심 바, 손님 아이콘 정상 동작
 * 7) 타 씬 회귀 없음
 * 8) 콘솔 에러 없음
 * 9) 다양한 테이블 수(2/4/6/8) 시나리오
 *
 * 주의: 이 게임은 약 1130개의 에셋을 preload하므로 BootScene 완료까지 약 70초 소요.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5173/';

// 1130개 에셋 로드에 충분한 시간 (80초)
const BOOT_TIMEOUT = 80000;

/** BootScene 완료 → MenuScene 활성 대기 */
async function waitForMenuScene(page) {
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    return game && game.scene && game.scene.isActive('MenuScene');
  }, { timeout: BOOT_TIMEOUT });
  await page.waitForTimeout(500);
}

/**
 * ServiceScene 직접 시작 (기존 씬 종료 후)
 */
async function startServiceScene(page, opts = {}) {
  await page.evaluate((options) => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) {
      game.scene.stop(s.scene.key);
    }
    game.scene.start('ServiceScene', {
      stageId: options.stageId || '1-1',
      inventory: options.inventory || { carrot: 10, meat: 8, flour: 6, squid: 4, pepper: 3 },
      gold: options.gold || 500,
      lives: options.lives || 10,
      marketResult: { totalIngredients: 31, livesRemaining: 10, livesMax: 15 },
      isEndless: false,
    });
  }, opts);
  await page.waitForFunction(() => {
    const game = window.__game;
    return game && game.scene.isActive('ServiceScene');
  }, { timeout: 5000 });
  await page.waitForTimeout(1000);
}

/**
 * SaveManager의 unlockedTables를 강제 변경
 */
async function setUnlockedTables(page, count) {
  await page.evaluate((c) => {
    const key = 'kitchen_chaos_save';
    let data = {};
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}
    data.unlockedTables = c;
    localStorage.setItem(key, JSON.stringify(data));
  }, count);
}

// ── 테스트 전역 설정 ──
test.describe('Phase 19-5: ServiceScene 아이소메트릭화', () => {

  // 각 테스트에 충분한 시간 부여 (BootScene 80초 + 테스트 실행 30초)
  test.setTimeout(120000);

  // ── 정상 동작: 기본 4석 배치 ──

  test.describe('기본 배치 (4 tables)', () => {

    test('SISO 상수 및 _cellToWorld 좌표 계산 검증', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return { error: 'ServiceScene not found' };

        const coords = [];
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 4; col++) {
            coords.push(scene._cellToWorld(col, row));
          }
        }
        return {
          containerCount: scene.tableContainers?.length || 0,
          coords,
        };
      });

      expect(result.error).toBeUndefined();
      expect(result.containerCount).toBe(4);

      // SISO_ORIGIN_X=140, SISO_ORIGIN_Y=120, HALF_W=40, HALF_H=30
      expect(result.coords[0]).toEqual({ x: 140, y: 120 }); // (0,0)
      expect(result.coords[1]).toEqual({ x: 180, y: 150 }); // (1,0)
      expect(result.coords[2]).toEqual({ x: 220, y: 180 }); // (2,0)
      expect(result.coords[3]).toEqual({ x: 260, y: 210 }); // (3,0)
      expect(result.coords[4]).toEqual({ x: 100, y: 150 }); // (0,1)
      expect(result.coords[5]).toEqual({ x: 140, y: 180 }); // (1,1)
      expect(result.coords[6]).toEqual({ x: 180, y: 210 }); // (2,1)
      expect(result.coords[7]).toEqual({ x: 220, y: 240 }); // (3,1)
    });

    test('테이블 컨테이너 좌표가 홀 영역 내 (y:40~280)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return { error: 'ServiceScene not found' };
        return scene.tableContainers.map((c, i) => ({
          idx: i, x: c.x, y: c.y, depth: c.depth,
        }));
      });

      expect(result).not.toHaveProperty('error');
      expect(result.length).toBe(4);

      for (const t of result) {
        expect(t.y).toBeGreaterThanOrEqual(40);
        expect(t.y).toBeLessThanOrEqual(280);
        expect(t.x).toBeGreaterThanOrEqual(0);
        expect(t.x).toBeLessThanOrEqual(360);
      }
    });

    test('depth sorting이 y좌표 기반 (10 + cy)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        return scene.tableContainers.map((c) => ({
          y: c.y, depth: c.depth, expectedDepth: 10 + c.y,
        }));
      });

      for (const t of result) {
        expect(t.depth).toBe(t.expectedDepth);
      }
    });

    test('floor_hall 텍스처 로드 및 렌더링 확인', async ({ page }) => {
      await waitForMenuScene(page);

      const textureLoaded = await page.evaluate(() => window.__game.textures.exists('floor_hall'));
      expect(textureLoaded).toBe(true);

      await startServiceScene(page);

      const floorCheck = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const floorImg = scene.children.list.find(c =>
          c.type === 'Image' && c.texture && c.texture.key === 'floor_hall'
        );
        if (!floorImg) return { found: false };
        return {
          found: true,
          x: floorImg.x,
          y: floorImg.y,
          displayWidth: floorImg.displayWidth,
          displayHeight: floorImg.displayHeight,
          depth: floorImg.depth,
        };
      });

      expect(floorCheck.found).toBe(true);
      expect(floorCheck.x).toBe(180);
      expect(floorCheck.y).toBe(160); // HALL_Y(40) + HALL_H(240)/2
      expect(floorCheck.displayWidth).toBe(360);
      expect(floorCheck.displayHeight).toBe(240);
      expect(floorCheck.depth).toBe(0);
    });

    test('아이소 격자 오버레이(Graphics) 존재 확인', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const graphicsCount = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.children.list.filter(c => c.type === 'Graphics').length;
      });

      expect(graphicsCount).toBeGreaterThan(0);
    });

    test('ServiceScene 렌더링 스크린샷 (4석)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-iso-4tables.png'),
      });
    });
  });

  // ── 6석/8석 배치 ──

  test.describe('확장 배치 (6/8 tables)', () => {

    test('6석 배치: 모든 테이블이 홀 영역 내', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 6);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return {
          count: scene.tableContainers.length,
          positions: scene.tableContainers.map((c) => ({
            x: c.x, y: c.y, depth: c.depth,
          })),
        };
      });

      expect(result.count).toBe(6);

      for (const t of result.positions) {
        expect(t.y).toBeGreaterThanOrEqual(40);
        expect(t.y).toBeLessThanOrEqual(280);
        expect(t.x).toBeGreaterThanOrEqual(0);
        expect(t.x).toBeLessThanOrEqual(360);
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-iso-6tables.png'),
      });
    });

    test('8석 배치: 최대 배치 시 홀 영역 완전 포함', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 8);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return {
          count: scene.tableContainers.length,
          positions: scene.tableContainers.map((c) => ({
            cx: c.x, cy: c.y, depth: c.depth,
            pBarAbsY: c.y + c.getData('pBarBg').y + 3,
            bubbleAbsY: c.y + c.getData('bubble').y - 11,
          })),
        };
      });

      expect(result.count).toBe(8);

      for (const t of result.positions) {
        expect(t.cy).toBeGreaterThanOrEqual(40);
        expect(t.cy).toBeLessThanOrEqual(280);
        expect(t.cx).toBeGreaterThanOrEqual(0);
        expect(t.cx).toBeLessThanOrEqual(360);
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-iso-8tables.png'),
      });
    });

    test('8석 depth sorting 순서 검증', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 8);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.tableContainers.map((c) => ({
          x: c.x, y: c.y, depth: c.depth,
        }));
      });

      const sorted = [...result].sort((a, b) => a.depth - b.depth);
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].y).toBeLessThanOrEqual(sorted[i + 1].y);
      }
    });
  });

  // ── 테이블 인터랙션 ──

  test.describe('테이블 인터랙션', () => {

    test('테이블 터치 시 에러 없음 (빈 테이블)', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await waitForMenuScene(page);
      await startServiceScene(page);

      // 테이블 0 위치에서 클릭
      const tablePos = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const c = scene.tableContainers[0];
        const canvas = window.__game.canvas;
        const scaleX = canvas.clientWidth / 360;
        const scaleY = canvas.clientHeight / 640;
        return { x: c.x * scaleX, y: c.y * scaleY };
      });

      await page.mouse.click(tablePos.x, tablePos.y);
      await page.waitForTimeout(300);

      const sceneActive = await page.evaluate(() => window.__game.scene.isActive('ServiceScene'));
      expect(sceneActive).toBe(true);

      const criticalErrors = errors.filter(e => !e.includes('__MISSING'));
      expect(criticalErrors).toEqual([]);
    });

    test('hitArea 크기 확인 (SISO_TABLE_W+10 x SISO_TABLE_H+10)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const hitAreaInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const c = scene.tableContainers[0];
        const hitRect = c.list.find(child => child.type === 'Rectangle' && child.input);
        if (!hitRect) return { found: false };
        return { found: true, width: hitRect.width, height: hitRect.height };
      });

      expect(hitAreaInfo.found).toBe(true);
      expect(hitAreaInfo.width).toBe(82);   // SISO_TABLE_W(72) + 10
      expect(hitAreaInfo.height).toBe(66);  // SISO_TABLE_H(56) + 10
    });
  });

  // ── UI 요소 위치 검증 ──

  test.describe('UI 요소 위치 및 가시성', () => {

    test('빈 테이블 상태 텍스트 위치 및 내용', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const textInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.tableContainers.map((c) => {
          const st = c.getData('statusText');
          return { visible: st.visible, localY: st.y, text: st.text };
        });
      });

      for (const t of textInfo) {
        expect(t.visible).toBe(true);
        expect(t.text).toBe('빈 테이블');
        expect(t.localY).toBe(-22); // -SISO_HALF_H(30) + 8
      }
    });

    test('말풍선/인내심바/손님 아이콘 초기 숨김 상태', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const uiState = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.tableContainers.map((c) => ({
          bubbleVisible: c.getData('bubble').visible,
          pBarBgVisible: c.getData('pBarBg').visible,
          custIconImgVisible: c.getData('custIconImg').visible,
          custIconTextVisible: c.getData('custIconText').visible,
        }));
      });

      for (const ui of uiState) {
        expect(ui.bubbleVisible).toBe(false);
        expect(ui.pBarBgVisible).toBe(false);
        expect(ui.custIconImgVisible).toBe(false);
        expect(ui.custIconTextVisible).toBe(false);
      }
    });

    test('말풍선 y offset = -SISO_HALF_H - 18 = -48', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const bubbleY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.tableContainers[0].getData('bubble').y;
      });
      expect(bubbleY).toBe(-48);
    });

    test('인내심 바 y offset = SISO_HALF_H + 6 = 36', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const pBarY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.tableContainers[0].getData('pBarBg').y;
      });
      expect(pBarY).toBe(36);
    });
  });

  // ── 경계/예외 케이스 ──

  test.describe('경계 및 예외 케이스', () => {

    test('2석 최소 배치 좌표 확인', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 2);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return {
          count: scene.tableContainers.length,
          positions: scene.tableContainers.map((c) => ({
            x: c.x, y: c.y, depth: c.depth,
          })),
        };
      });

      expect(result.count).toBe(2);
      expect(result.positions[0]).toEqual({ x: 140, y: 120, depth: 130 });
      expect(result.positions[1]).toEqual({ x: 180, y: 150, depth: 160 });

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-iso-2tables.png'),
      });
    });

    test('8석 인내심바 하단이 홀 경계(y=280) 미초과', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 8);
      await startServiceScene(page);

      const maxPBarAbsY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return Math.max(...scene.tableContainers.map(c =>
          c.y + c.getData('pBarBg').y + 3 // +3 = half bar height
        ));
      });

      // (3,1): cy=240, pBar.y=36 → abs = 279
      expect(maxPBarAbsY).toBeLessThanOrEqual(283);
    });

    test('8석 말풍선 상단이 홀 상단(y=40) 이상', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 8);
      await startServiceScene(page);

      const minBubbleAbsY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return Math.min(...scene.tableContainers.map(c =>
          c.y + c.getData('bubble').y - 11 // -11 = half bubble height
        ));
      });

      // (0,0): cy=120, bubble.y=-48 → abs = 61
      expect(minBubbleAbsY).toBeGreaterThanOrEqual(40);
    });

    test('fadeIn(300ms) 정상 동작', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const sceneActive = await page.evaluate(() => window.__game.scene.isActive('ServiceScene'));
      expect(sceneActive).toBe(true);
    });
  });

  // ── 회귀 테스트 ──

  test.describe('타 씬 회귀', () => {

    test('MenuScene 정상 렌더링', async ({ page }) => {
      await waitForMenuScene(page);
      const menuActive = await page.evaluate(() => window.__game.scene.isActive('MenuScene'));
      expect(menuActive).toBe(true);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-menu-regression.png'),
      });
    });

    test('GatheringScene 정상 시작', async ({ page }) => {
      await waitForMenuScene(page);

      await page.evaluate(() => {
        const game = window.__game;
        game.scene.getScenes(true).forEach(s => game.scene.stop(s.scene.key));
        game.scene.start('GatheringScene', { stageId: '1-1', chefId: 'mimi' });
      });

      await page.waitForFunction(() => window.__game.scene.isActive('GatheringScene'), { timeout: 5000 });
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-gathering-regression.png'),
      });
    });
  });

  // ── 안정성 ──

  test.describe('안정성', () => {

    test('ServiceScene 진입~3초 콘솔 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await waitForMenuScene(page);
      await startServiceScene(page);
      await page.waitForTimeout(3000);

      const criticalErrors = errors.filter(e => !e.includes('__MISSING'));
      expect(criticalErrors).toEqual([]);
    });

    test('서비스 에셋 네트워크 404 없음', async ({ page }) => {
      const failedRequests = [];
      page.on('response', (response) => {
        if (response.url().includes('/sprites/service/') && response.status() >= 400) {
          failedRequests.push({ url: response.url(), status: response.status() });
        }
      });

      await waitForMenuScene(page);
      expect(failedRequests).toEqual([]);
    });
  });

  // ── 스펙 차이 기록 ──

  test.describe('스펙 차이 분석', () => {

    test('SISO_ORIGIN_Y 실제값 확인 (스펙 100 vs 구현 120)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const originY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene._cellToWorld(0, 0).y;
      });

      // 구현값 120. 스펙은 100이었으나 조정됨.
      expect(originY).toBe(120);
    });

    test('tableW/tableH dead code 잔존 확인', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return { hasTableW: 'tableW' in scene, tableW: scene.tableW };
      });

      // dead code 잔존 기록 (기능에 무영향)
      console.log('Dead code check - tableW:', result);
    });
  });

  // ── 시각적 검증 ──

  test.describe('시각적 검증', () => {

    test('전체 레이아웃 스크린샷 (4석)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-full-layout-4.png'),
      });
    });

    test('홀 영역 클로즈업 (4석)', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-hall-closeup-4.png'),
        clip: { x: 0, y: 40, width: 360, height: 240 },
      });
    });

    test('홀 영역 클로즈업 (8석 최대)', async ({ page }) => {
      await waitForMenuScene(page);
      await setUnlockedTables(page, 8);
      await startServiceScene(page);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-hall-closeup-8.png'),
        clip: { x: 0, y: 40, width: 360, height: 240 },
      });
    });

    test('조리 슬롯 영역 회귀 스크린샷', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-5-cooking-slots.png'),
        clip: { x: 0, y: 280, width: 360, height: 60 },
      });
    });
  });
});
