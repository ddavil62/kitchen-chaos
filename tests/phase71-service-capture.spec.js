/**
 * @fileoverview Phase 71 ServiceScene 테이블 스크린샷 캡처.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

async function bootAndWaitMenu(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

test.describe('Phase 71 ServiceScene 테이블', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  test('ServiceScene 1-1 직접 진입 — 테이블 lv0', async ({ page }) => {
    await bootAndWaitMenu(page);
    await page.evaluate(() => {
      const save = {
        chapterId: 1, currentStage: '1-1',
        tableUpgrades: [1, 1, 1, 1],
        ingredients: { pasta: 10, tomato: 10, basil: 10, cheese: 10 },
      };
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      window.__game.scene.start('ServiceScene', { stageId: '1-1', ingredients: { pasta: 10, tomato: 10 } });
    });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${DIR}/phase71-service-lv1-tables.png` });
  });

  test('ServiceScene 직접 강제 진입 — tableUpgrade lv1', async ({ page }) => {
    await bootAndWaitMenu(page);
    // ServiceScene을 직접 호출, tableUpgrades를 lv1로 세팅
    await page.evaluate(() => {
      window.__game.scene.start('ServiceScene', {
        stageId: '1-1',
        tableUpgrades: [1, 1, 1, 1],
        ingredients: { pasta: 5, tomato: 5 },
        collectedIngredients: { pasta: 5, tomato: 5 },
      });
    });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${DIR}/phase71-service-tables-ingame.png` });
  });
});
