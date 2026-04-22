/**
 * @fileoverview Phase 71 AD3 ServiceScene 테이블 waiting/seated 스크린샷.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

test('Phase 71 ServiceScene 테이블 lv1 스크린샷', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });

  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);

  // 활성 씬 모두 정지 후 ServiceScene 시작
  await page.evaluate(() => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) {
      game.scene.stop(s.scene.key);
    }
    game.scene.start('ServiceScene', {
      stageId: '1-1',
      tableUpgrades: [1, 1, 1, 1],
      inventory: { pasta: 10, tomato: 10, basil: 5 },
      gold: 200,
      lives: 10,
      marketResult: { totalIngredients: 25, livesRemaining: 10, livesMax: 15 },
    });
  });

  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${DIR}/phase71-service-table-lv1-ad3.png` });
});
