/**
 * @fileoverview Phase 56 ChefSelectScene 스크린샷 캡처 스크립트.
 */
import { test, expect } from '@playwright/test';

test.setTimeout(90000);

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

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

test('Phase 56 ChefSelectScene 7종 카드 레이아웃 스크린샷', async ({ page }) => {
  await page.setViewportSize({ width: GAME_WIDTH, height: GAME_HEIGHT });
  await page.goto('/');

  // 세이브 주입 (season2 미해금 상태 — 잠금 카드 확인)
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
      season2Unlocked: false,
      season3Unlocked: false,
      storyProgress: { currentChapter: 1, completedChapters: [], flags: {} },
    };
    localStorage.setItem('kitchen_chaos_save', JSON.stringify(save));
  });

  await page.waitForFunction(() => window.__game && window.__game.isRunning, { timeout: 60000 });
  await page.waitForTimeout(2000);

  // ChefSelectScene으로 직접 전환
  await page.evaluate(() => {
    window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
  });
  await waitForScene(page, 'ChefSelectScene');

  // 스크린샷 1: 기본 상태 (season2 잠금)
  await page.screenshot({
    path: 'tests/screenshots/phase56-chef-locked.png',
    clip: { x: 0, y: 0, width: GAME_WIDTH, height: GAME_HEIGHT },
  });

  // 카드 데이터 추출
  const cardData = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('ChefSelectScene');
    if (!scene || !scene._cardBgs) return null;
    return scene._cardBgs.map((bg, i) => ({
      index: i,
      x: bg.x,
      y: bg.y,
      width: bg.width,
      height: bg.height,
      top: bg.y - bg.height / 2,
      bottom: bg.y + bg.height / 2,
    }));
  });

  console.log('Card data:', JSON.stringify(cardData, null, 2));

  // season2 해금 상태로 재테스트
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('kitchen_chaos_save'));
    save.season2Unlocked = true;
    save.season3Unlocked = true;
    save.storyProgress = { currentChapter: 20, completedChapters: [], flags: {} };
    localStorage.setItem('kitchen_chaos_save', JSON.stringify(save));
    window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
  });
  await waitForScene(page, 'ChefSelectScene');

  // 스크린샷 2: 전체 해금 상태
  await page.screenshot({
    path: 'tests/screenshots/phase56-chef-unlocked.png',
    clip: { x: 0, y: 0, width: GAME_WIDTH, height: GAME_HEIGHT },
  });
});
