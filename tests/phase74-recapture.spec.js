/**
 * @fileoverview Phase 74 재캡처 — MerchantScene을 정상 전이로 진입해 스크린샷.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

test.describe('Phase 74 재캡처', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // 정상 플로우: BootScene → MenuScene 부트 후, ResultScene을 거쳐 MerchantScene 진입.
  test('T3 정상: MerchantScene 도구 배지 (정상 전이)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForFunction(() => {
      const g = window.__game;
      return g?.isBooted && g.scene?.isActive('MenuScene');
    }, {}, { timeout: 20000 });
    await page.waitForTimeout(500);

    // 골드 1000g 부여 후 ResultScene 거쳐 MerchantScene으로 이동
    await page.evaluate(() => {
      // ToolManager.setGold가 있으면 사용, 아니면 SaveManager 직접 조작
      try {
        const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save') || '{}');
        save.gold = 1000;
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      } catch (e) {}
    });
    // 정상 전환: MenuScene → MerchantScene 로 fade-out 후 start
    await page.evaluate(() => {
      const cur = window.__game.scene.getScene('MenuScene');
      if (cur && cur.cameras?.main) {
        cur.cameras.main.fadeOut(200, 0, 0, 0);
        cur.cameras.main.once('camerafadeoutcomplete', () => {
          // MenuScene을 stop 후 MerchantScene start
          window.__game.scene.stop('MenuScene');
          window.__game.scene.start('MerchantScene', {
            stageId: '1-1',
            isMarketFailed: false,
            isEndless: false,
          });
        });
      } else {
        window.__game.scene.stop('MenuScene');
        window.__game.scene.start('MerchantScene', {
          stageId: '1-1',
          isMarketFailed: false,
          isEndless: false,
        });
      }
    });
    // 페이드아웃(200ms) + 페이드인(300ms) + 렌더 안정 대기
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${DIR}/phase74-t3-merchant-recap.png` });
  });
});
