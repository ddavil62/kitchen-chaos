import { test, expect } from '@playwright/test';

const SAVE_KEY = 'kitchenChaosTycoon_save';

async function waitForGame(page) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

function baseSave(overrides = {}) {
  return {
    version: 24,
    selectedChef: 'mimi_chef',
    stages: { '1-1': { cleared: true, stars: 3 } },
    gold: 5000,
    kitchenCoins: 200,
    toolInventory: {
      pan: { count: 1, level: 1 },
      salt: { count: 1, level: 1 },
      grill: { count: 1, level: 1 },
      delivery: { count: 1, level: 1 },
      freezer: { count: 1, level: 1 },
      soup_pot: { count: 1, level: 1 },
      wasabi_cannon: { count: 1, level: 1 },
      spice_grinder: { count: 1, level: 1 },
    },
    season2Unlocked: true,
    season3Unlocked: false,
    storyProgress: { currentChapter: 1, storyFlags: {} },
    tutorials: { battle: true, service: true, shop: true },
    endless: {
      unlocked: true, bestWave: 10, bestScore: 500, bestCombo: 5,
      lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0,
    },
    branchCards: {
      toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
      activeBlessing: null, lastVisit: null,
    },
    achievements: {
      unlocked: { story_first_clear: true },
      claimed: {},
      progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
    },
    soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
    ...overrides,
  };
}

test('DIAG: AchievementScene texture keys dump', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: baseSave() });
  await page.reload();
  await waitForGame(page);

  await page.evaluate(() => {
    window.__game.scene.start('AchievementScene');
  });
  await page.waitForTimeout(3000);

  const dump = await page.evaluate(() => {
    const game = window.__game;
    const scene = game.scene.getScene('AchievementScene');
    if (!scene) return { error: 'no scene' };
    if (!scene._contentContainer) return { error: 'no container' };

    const children = [];
    scene._contentContainer.list.forEach((child, i) => {
      children.push({
        i,
        type: child.type || child.constructor?.name,
        texKey: child.texture?.key || 'NO_TEX',
        w: child.width,
        h: child.height,
        x: Math.round(child.x),
        y: Math.round(child.y),
        alpha: child.alpha,
      });
    });

    return { childCount: children.length, children };
  });

  console.log('AchievementScene dump:', JSON.stringify(dump, null, 2));
  expect(dump.error).toBeUndefined();
  expect(dump.childCount).toBeGreaterThan(0);
});

test('DIAG: ShopScene interior tab panel dump', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: baseSave() });
  await page.reload();
  await waitForGame(page);

  await page.evaluate(() => {
    window.__game.scene.start('ShopScene');
  });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('ShopScene');
    if (scene && scene._switchTab) scene._switchTab('interior');
  });
  await page.waitForTimeout(1000);

  const dump = await page.evaluate(() => {
    const game = window.__game;
    const scene = game.scene.getScene('ShopScene');
    if (!scene) return { error: 'no scene' };
    if (!scene._contentContainer) return { error: 'no container' };

    const children = [];
    scene._contentContainer.list.forEach((child, i) => {
      children.push({
        i,
        type: child.type || child.constructor?.name,
        texKey: child.texture?.key || 'NO_TEX',
        w: child.width,
        h: child.height,
        displayW: child.displayWidth,
        displayH: child.displayHeight,
        x: Math.round(child.x),
        y: Math.round(child.y),
      });
    });

    return { childCount: children.length, children: children.slice(0, 30) };
  });

  console.log('ShopScene interior dump:', JSON.stringify(dump, null, 2));
  expect(dump.error).toBeUndefined();
  expect(dump.childCount).toBeGreaterThan(0);
});
