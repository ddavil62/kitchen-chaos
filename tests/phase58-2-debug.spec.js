/**
 * @fileoverview Phase 58-2 debug — 탭 클릭 인터랙션 진단.
 */
import { test, expect } from '@playwright/test';
const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

async function injectFreshSave(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 24, selectedChef: 'mimi_chef', stages: {}, gold: 500,
      toolInventory: { pan: { count: 1, level: 1 } },
      season2Unlocked: false, season3Unlocked: false,
      storyProgress: { currentChapter: 1, storyFlags: {} },
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
        lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
      branchCards: { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null },
    }));
  }, SAVE_KEY);
}

test('debug: 탭 위치 + 텍스처 확인', async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForGame(page);
  await injectFreshSave(page);

  await page.evaluate(() => {
    const game = window.__game;
    game.scene.scenes.forEach(s => { if (s.scene.isActive()) game.scene.stop(s.scene.key); });
    game.scene.start('MerchantScene', { stageId: '1-1' });
  });
  await page.waitForTimeout(1200);

  const diag = await page.evaluate(() => {
    const s = window.__game.scene.getScene('MerchantScene');
    return {
      activeScene: s?.scene?.key,
      isActive: s?.scene?.isActive?.(),
      activeTab: s?._activeTab,
      tabsCreated: {
        tools: !!s?._tabToolsBg,
        branch: !!s?._tabBranchBg,
      },
      toolsBg: s?._tabToolsBg ? { x: s._tabToolsBg.x, y: s._tabToolsBg.y, w: s._tabToolsBg.width, h: s._tabToolsBg.height, visible: s._tabToolsBg.visible, alpha: s._tabToolsBg.alpha, interactive: !!s._tabToolsBg.input } : null,
      branchBg: s?._tabBranchBg ? { x: s._tabBranchBg.x, y: s._tabBranchBg.y, w: s._tabBranchBg.width, h: s._tabBranchBg.height, visible: s._tabBranchBg.visible, alpha: s._tabBranchBg.alpha, interactive: !!s._tabBranchBg.input } : null,
      badges: {
        mutation: s?.textures.exists('badge_mutation'),
        recipe:   s?.textures.exists('badge_recipe'),
        bond:     s?.textures.exists('badge_bond'),
        blessing: s?.textures.exists('badge_blessing'),
      },
    };
  });
  console.log(JSON.stringify(diag, null, 2));

  // 캔버스 좌표 vs 실제 페이지 좌표 확인
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();
    return {
      canvasW: canvas.width, canvasH: canvas.height,
      rectLeft: rect.left, rectTop: rect.top, rectW: rect.width, rectH: rect.height,
      scaleX: rect.width / canvas.width, scaleY: rect.height / canvas.height,
    };
  });
  console.log('canvas:', JSON.stringify(canvasInfo, null, 2));

  // 직접 씬 메서드 호출로 탭 전환 확인 (핸들러 자체는 정상 동작하는지)
  const direct = await page.evaluate(() => {
    const s = window.__game.scene.getScene('MerchantScene');
    s._setActiveTab('branch');
    return { activeTab: s._activeTab, cardDefs: s._branchCardDefs?.map(c => ({ id: c.id, category: c.category })) };
  });
  console.log('direct:', JSON.stringify(direct, null, 2));

  await page.screenshot({ path: 'tests/screenshots/phase58-2-debug.png' });
  expect(true).toBe(true);
});
