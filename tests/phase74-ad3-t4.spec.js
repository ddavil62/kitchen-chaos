/**
 * @fileoverview Phase 74 AD3 T4 캡처 — AchievementScene 수령 대기 glow.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

test('T4: AchievementScene 수령 대기 glow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  // 정상 SaveManager 포맷으로 세이브 생성
  await page.evaluate(() => {
    const save = {
      version: 24,
      stages: { '1-1': { stars: 3, cleared: true, bestSatisfaction: 100 } },
      totalStagesCleared: 1,
      gold: 0,
      coins: 0,
      achievements: {
        unlocked: { stage_cleared: true },
        claimed: {},
        progress: {
          enemy_total_killed: 0,
          boss_killed: 0,
          total_gold_earned: 0,
        },
      },
    };
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
  });
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    window.__game.scene.start('AchievementScene');
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${DIR}/phase74-t4-achievement-glow.png` });
});
