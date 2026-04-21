/**
 * @fileoverview Phase 56 ChefSelectScene 전체 해금 상태 스크린샷.
 * SaveManager의 localStorage 키: kitchenChaosTycoon_save
 */
import { test } from '@playwright/test';

test.setTimeout(90000);

async function waitForScene(page, sceneKey, timeout = 60000) {
  await page.waitForFunction(
    (key) => {
      const game = window.__game;
      if (!game) return false;
      const scene = game.scene.getScene(key);
      return scene && scene.scene.isActive();
    },
    sceneKey,
    { timeout }
  );
  await page.waitForTimeout(1000);
}

test('Phase 56 ChefSelectScene 전체 해금 상태', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');

  // 전체 해금 세이브 주입 (올바른 키 사용)
  await page.evaluate(() => {
    const save = {
      version: 22,
      stages: {},
      totalGoldEarned: 0,
      tutorialDone: true,
      tutorialBattle: true,
      tutorialService: true,
      tutorialShop: true,
      tutorialEndless: true,
      kitchenCoins: 100,
      upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
      unlockedRecipes: [],
      selectedChef: 'mimi_chef',
      completedOrders: [],
      cookingSlots: 2,
      bestSatisfaction: {},
      tableUpgrades: [0, 0, 0, 0],
      currentGold: 100,
      mireukEssence: 0,
      wanderingChefs: [],
      giftIngredients: {},
      achievements: {},
      milestonesClaimed: {},
      season2Unlocked: true,
      season3Unlocked: true,
      storyProgress: { currentChapter: 20, completedChapters: [], flags: {} },
    };
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
  });

  await page.waitForFunction(() => window.__game && window.__game.isRunning, { timeout: 60000 });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
  });
  await waitForScene(page, 'ChefSelectScene');

  await page.screenshot({
    path: 'tests/screenshots/phase56-chef-all-unlocked.png',
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });
  console.log('Screenshot taken with correct save key');
});
