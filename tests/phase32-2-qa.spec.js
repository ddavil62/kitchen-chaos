/**
 * @fileoverview Phase 32-2 QA 테스트 — 17장 신규 에셋 4종 검증.
 * incense_specter, spice_elemental 적 등록 + chai 재료 + spice_palace_interior 타일셋.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 32-2 에셋 등록 검증', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 수집
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Phaser 게임 로드 대기 (BootScene 완료)
    await page.waitForTimeout(5000);
  });

  test('게임이 크래시 없이 로드된다 (에셋 로드 포함)', async ({ page }) => {
    // BootScene에서 에셋 로드 에러가 나면 콘솔에 에러가 찍힘
    // 5초 이후 추가 대기
    await page.waitForTimeout(3000);

    // 스크린샷 캡처
    await page.screenshot({
      path: 'tests/screenshots/game-loaded.png',
    });

    // 치명적 에러가 없어야 함
    const fatalErrors = page._consoleErrors.filter(
      e => e.includes('Failed to load') ||
           e.includes('404') ||
           e.includes('incense_specter') ||
           e.includes('spice_elemental') ||
           e.includes('chai') ||
           e.includes('spice_palace_interior')
    );
    expect(fatalErrors).toEqual([]);
  });

  test('신규 에셋 URL이 200 응답을 반환한다 (incense_specter rotations)', async ({ page }) => {
    const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (const dir of directions) {
      const resp = await page.request.get(`/sprites/enemies/incense_specter/rotations/${dir}.png`);
      expect(resp.status(), `incense_specter rotation ${dir}`).toBe(200);
      const body = await resp.body();
      expect(body.length, `incense_specter rotation ${dir} not empty`).toBeGreaterThan(0);
    }
  });

  test('신규 에셋 URL이 200 응답을 반환한다 (spice_elemental rotations)', async ({ page }) => {
    const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (const dir of directions) {
      const resp = await page.request.get(`/sprites/enemies/spice_elemental/rotations/${dir}.png`);
      expect(resp.status(), `spice_elemental rotation ${dir}`).toBe(200);
      const body = await resp.body();
      expect(body.length, `spice_elemental rotation ${dir} not empty`).toBeGreaterThan(0);
    }
  });

  test('신규 에셋 URL이 200 응답을 반환한다 (incense_specter animations)', async ({ page }) => {
    const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (const dir of directions) {
      for (let f = 0; f < 8; f++) {
        const frame = String(f).padStart(3, '0');
        const resp = await page.request.get(
          `/sprites/enemies/incense_specter/animations/animating-7f60bab8/${dir}/frame_${frame}.png`
        );
        expect(resp.status(), `incense_specter anim ${dir} frame_${frame}`).toBe(200);
      }
    }
  });

  test('신규 에셋 URL이 200 응답을 반환한다 (spice_elemental animations)', async ({ page }) => {
    const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (const dir of directions) {
      for (let f = 0; f < 8; f++) {
        const frame = String(f).padStart(3, '0');
        const resp = await page.request.get(
          `/sprites/enemies/spice_elemental/animations/animating-6e040724/${dir}/frame_${frame}.png`
        );
        expect(resp.status(), `spice_elemental anim ${dir} frame_${frame}`).toBe(200);
      }
    }
  });

  test('타일셋 spice_palace_interior.png가 서빙된다', async ({ page }) => {
    const resp = await page.request.get('/sprites/tilesets/spice_palace_interior.png');
    expect(resp.status()).toBe(200);
    const body = await resp.body();
    expect(body.length).toBeGreaterThan(100); // 최소한의 PNG 크기
  });

  test('재료 아이콘 chai.png가 서빙된다', async ({ page }) => {
    const resp = await page.request.get('/sprites/ingredients/chai.png');
    expect(resp.status()).toBe(200);
    const body = await resp.body();
    expect(body.length).toBeGreaterThan(100);
  });

  test('콘솔에 에셋 로드 관련 에러가 없다', async ({ page }) => {
    // 추가 대기로 모든 에셋 로드 완료
    await page.waitForTimeout(5000);

    // 404 또는 Failed to load 에러 필터
    const assetErrors = page._consoleErrors.filter(
      e => e.includes('404') || e.includes('Failed to load') || e.includes('net::ERR')
    );

    if (assetErrors.length > 0) {
      console.log('Asset loading errors:', assetErrors);
    }

    // Phase 32-2 관련 에셋 에러만 FAIL 처리
    const phase32Errors = assetErrors.filter(
      e => e.includes('incense_specter') ||
           e.includes('spice_elemental') ||
           e.includes('chai') ||
           e.includes('spice_palace_interior')
    );
    expect(phase32Errors).toEqual([]);
  });

  test('gameData.js에 incense_specter/spice_elemental이 올바르게 등록되었다', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Phaser 게임에서 gameData 모듈을 직접 접근할 수 없으므로
      // 동적 import 시도
      return import('/js/data/gameData.js').then(mod => {
        const is = mod.ENEMY_TYPES.incense_specter;
        const se = mod.ENEMY_TYPES.spice_elemental;
        const ch = mod.INGREDIENT_TYPES?.chai;
        return { is, se, ch };
      });
    });

    // incense_specter 검증
    expect(result.is).toBeDefined();
    expect(result.is.hp).toBe(420);
    expect(result.is.confuseOnHit).toBe(true);
    expect(result.is.canvasSize).toBe(176);
    expect(result.is.ingredient).toBe('chai');

    // spice_elemental 검증
    expect(result.se).toBeDefined();
    expect(result.se.hp).toBe(500);
    expect(result.se.elementalResistance).toBe(true);
    expect(result.se.canvasSize).toBe(164);
    expect(result.se.resistTypes).toContain('freezer');
    expect(result.se.resistTypes).toContain('wasabi_cannon');

    // chai 재료 검증
    expect(result.ch).toBeDefined();
    expect(result.ch.id).toBe('chai');
  });
});
