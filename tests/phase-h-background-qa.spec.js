/**
 * @fileoverview Phase H QA -- 배경 현대 레스토랑 리디자인 검증.
 * H-1: v14 에셋 로드, H-2: 팔레트 색상 검증, H-3: 기존 테스트 회귀 없음, H-4: 렌더링 스크린샷.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/?scene=tavern';

/** Phaser 씬이 create()를 완료할 때까지 대기 */
async function waitForScene(page, timeout = 20000) {
  await page.waitForFunction(() => {
    const g = window.__game;
    if (!g) return false;
    const scene = g.scene.getScene('TavernServiceScene');
    return scene && scene.children && scene.children.list.length > 0;
  }, { timeout });
}

test.describe('Phase H 배경 현대 레스토랑 QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForScene(page);
    await page.waitForTimeout(1000);
  });

  // ====================================================
  // H-1: v14 에셋 로드 (404 없음)
  // ====================================================
  test('H-1: v14 배경 에셋 2종 Phaser 텍스처 로드 성공', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        floorDummy: scene.textures.exists('tavern_dummy_floor_wood_tile_v14'),
        wallDummy: scene.textures.exists('tavern_dummy_wall_horizontal_v14'),
        floorReal: scene.textures.exists('tavern_floor_wood_tile_v14'),
        wallReal: scene.textures.exists('tavern_wall_horizontal_v14'),
      };
    });
    // dummy 경로와 real 경로 모두 로드 성공
    expect(result.floorDummy).toBe(true);
    expect(result.wallDummy).toBe(true);
    expect(result.floorReal).toBe(true);
    expect(result.wallReal).toBe(true);
  });

  test('H-1a: v14 에셋 HTTP 404 없음', async ({ page }) => {
    const failures = [];
    page.on('response', response => {
      if (response.status() === 404 && response.url().includes('v14')) {
        failures.push(response.url());
      }
    });
    // 새로 로드하여 네트워크 응답 확인
    await page.goto(BASE_URL);
    await waitForScene(page);
    await page.waitForTimeout(500);
    expect(failures).toEqual([]);
  });

  // ====================================================
  // H-2: 배경 색상 팔레트 검증 (소스코드 기반)
  // ====================================================
  test('H-2: _buildLayout fillStyle 색상이 Phase H 팔레트와 일치', async ({ page }) => {
    // TavernServiceScene.js 소스에서 fillStyle 값 검증
    const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
    const source = await response.text();

    // HUD: 0x2c2c2c
    expect(source).toContain('0x2c2c2c');
    // 벽: 0xe8dcc8
    expect(source).toContain('0xe8dcc8');
    // 주방: 0xb8c5c8
    expect(source).toContain('0xb8c5c8');
    // 다이닝홀: 0xfff8f0
    expect(source).toContain('0xfff8f0');
    // 컨트롤바: 0x37474f
    expect(source).toContain('0x37474f');

    // 구 팔레트가 더 이상 fillStyle에 사용되지 않는지 검증
    // (REAL_KEY_MAP 등 다른 곳에서 사용될 수 있으므로 fillStyle 문맥만 확인)
    const fillStyleLines = source.split('\n').filter(line => line.includes('fillStyle'));
    const oldPaletteInFill = fillStyleLines.some(line =>
      line.includes('0x3a1a0a') || line.includes('0x555555') ||
      line.includes('0x3d2810') || line.includes('0x5a3d20') ||
      line.includes('0x15100a')
    );
    expect(oldPaletteInFill).toBe(false);
  });

  test('H-2a: 경계선 lineStyle 중립 회색 변경 확인', async ({ page }) => {
    const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
    const source = await response.text();
    // Phase H: 0xaaaaaa, 0.4
    expect(source).toContain('0xaaaaaa');
    // 구 금색(0xffd166) lineStyle 제거 검증
    const lineStyleLines = source.split('\n').filter(line => line.includes('lineStyle'));
    const oldGoldInLine = lineStyleLines.some(line => line.includes('0xffd166'));
    expect(oldGoldInLine).toBe(false);
  });

  test('H-2b: 바닥/벽 타일 alpha 조정 검증', async ({ page }) => {
    const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
    const source = await response.text();
    // 바닥 타일 alpha 0.55
    expect(source).toContain('setAlpha(0.55)');
    // 벽 타일 alpha 0.85
    expect(source).toContain('setAlpha(0.85)');
  });

  // ====================================================
  // H-2c: REAL_KEY_MAP v14 매핑 검증
  // ====================================================
  test('H-2c: REAL_KEY_MAP에 v14 키 매핑 존재', async ({ page }) => {
    const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
    const source = await response.text();
    expect(source).toContain("'tavern_dummy_floor_wood_tile_v14'");
    expect(source).toContain("'tavern_floor_wood_tile_v14'");
    expect(source).toContain("'tavern_dummy_wall_horizontal_v14'");
    expect(source).toContain("'tavern_wall_horizontal_v14'");
  });

  // ====================================================
  // H-3: 기존 Phase G/A 회귀 없음 (핵심 데이터 검증)
  // ====================================================
  test('H-3: TAVERN_LAYOUT 좌표 수치 변경 없음', async ({ page }) => {
    const layout = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._layout;
    });
    expect(layout.HUD_H).toBe(32);
    expect(layout.WALL_H).toBe(24);
    expect(layout.CTRL_H).toBe(80);
    expect(layout.ROOM_Y).toBe(32);
    expect(layout.ROOM_CONTENT_Y).toBe(56);
    expect(layout.ROOM_BOTTOM_Y).toBe(560);
    expect(layout.KITCHEN_X).toBe(8);
    expect(layout.KITCHEN_W).toBe(120);
    expect(layout.DINING_X).toBe(128);
    expect(layout.DINING_W).toBe(232);
    expect(layout.GAME_W).toBe(360);
    expect(layout.GAME_H).toBe(640);
  });

  test('H-3a: v13 가구 에셋 로드 유지 (Phase G 회귀 없음)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        table: scene.textures.exists('tavern_table_4p_v13'),
        chairBack: scene.textures.exists('tavern_chair_back_v13'),
        chairFront: scene.textures.exists('tavern_chair_front_v13'),
      };
    });
    expect(result.table).toBe(true);
    expect(result.chairBack).toBe(true);
    expect(result.chairFront).toBe(true);
  });

  test('H-3b: 콘솔 치명적 에러 없음', { timeout: 60000 }, async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE_URL);
    await waitForScene(page);
    await page.waitForTimeout(1000);
    // 레거시 에러(customer_ 관련 파일 로드 실패) 필터링
    const criticalErrors = errors.filter(e => !e.includes('Failed to process file'));
    expect(criticalErrors).toEqual([]);
  });

  // ====================================================
  // H-4: 렌더링 스크린샷 검증
  // ====================================================
  test('H-4: Phase H 전체 렌더링 + 다이닝 클로즈업 스크린샷', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/phase-h-full-rendering.png',
    });
    await page.screenshot({
      path: 'tests/screenshots/phase-h-dining-closeup.png',
      clip: { x: 128, y: 56, width: 232, height: 240 },
    });
  });
});
