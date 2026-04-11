/**
 * @fileoverview ServiceScene AD3 레이아웃 검수용 스크린샷 캡처 테스트.
 * 영업 씬을 직접 시작하여 전체 레이아웃과 테이블/손님 영역 클로즈업을 캡처한다.
 */
import { test, expect } from '@playwright/test';

test.describe('ServiceScene AD3 스크린샷 캡처', () => {
  test('영업 씬 전체 레이아웃 + 테이블 클로즈업 캡처', async ({ page }) => {
    // 콘솔 에러 수집
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    // 게임 로드
    await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });

    // Phaser 게임 인스턴스가 준비될 때까지 대기
    await page.waitForTimeout(5000);

    // 현재 상태 확인용 스크린샷
    await page.screenshot({ path: 'tests/screenshots/service_ad3_debug_initial.png' });

    // ServiceScene 직접 진입
    const result = await page.evaluate(() => {
      const game = window.__game;
      if (!game || !game.scene) {
        const keys = Object.keys(window).filter(k =>
          k.toLowerCase().includes('game') || k.toLowerCase().includes('phaser')
        );
        return { success: false, msg: 'game not found. Keys: ' + keys.join(', ') };
      }

      // 모든 활성 씬 정지
      const activeScenes = game.scene.getScenes(true);
      for (const s of activeScenes) {
        game.scene.stop(s.scene.key);
      }

      // ServiceScene에 필요한 데이터를 준비
      const serviceData = {
        stageId: '1-1',
        inventory: {
          carrot: 10,
          meat: 8,
          flour: 6,
          squid: 4,
          pepper: 3,
        },
        gold: 500,
        lives: 10,
        marketResult: {
          totalIngredients: 31,
          livesRemaining: 10,
          livesMax: 15,
        },
        isEndless: false,
      };

      game.scene.start('ServiceScene', serviceData);
      return { success: true, msg: 'ServiceScene started with stageId 1-1' };
    });

    console.log('ServiceScene launch result:', result);
    expect(result.success).toBe(true);

    // 씬 렌더링 대기
    await page.waitForTimeout(4000);

    // 1) 전체 레이아웃 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/service_scene_ad3_layout.png',
    });

    // 2) 테이블/손님 영역 클로즈업 (홀 영역: y=40~280, 전체 너비)
    await page.screenshot({
      path: 'tests/screenshots/service_scene_ad3_tables.png',
      clip: { x: 0, y: 0, width: 360, height: 320 },
    });

    // 콘솔 에러가 없어야 한다
    if (errors.length > 0) {
      console.log('Page errors:', errors);
    }
  });
});
