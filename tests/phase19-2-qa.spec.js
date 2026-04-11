/**
 * @fileoverview Phase 19-2 QA 테스트: UI 확장 검증.
 * ChefSelectScene 5종 카드 리레이아웃 + WorldMapScene 시즌 탭 시스템.
 */
import { test, expect } from '@playwright/test';

// 에셋 로딩에 시간이 오래 걸리므로 글로벌 타임아웃을 충분히 높게 설정
test.setTimeout(120000);

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

/**
 * Phaser 씬이 활성화될 때까지 기다린다.
 * @param {import('@playwright/test').Page} page
 * @param {string} sceneKey
 * @param {number} timeout
 */
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
  await page.waitForTimeout(800);
}

/**
 * 페이지를 로드하고 세이브 데이터를 주입한 뒤, 게임이 MenuScene까지 로드되도록 기다린다.
 * 중복 코드를 줄이기 위한 유틸리티.
 * @param {import('@playwright/test').Page} page
 * @param {object} saveOverrides
 */
async function setupGame(page, saveOverrides = {}) {
  // 1. 페이지 로드
  await page.goto('/');
  // 2. 세이브 주입 (게임 로드 전에)
  await page.evaluate((overrides) => {
    const defaultSave = {
      version: 12,
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
      selectedChef: null,
      completedOrders: [],
      cookingSlots: 2,
      bestSatisfaction: {},
      tableUpgrades: [0, 0, 0, 0],
      unlockedTables: 4,
      interiors: { flower: 0, kitchen: 0, lighting: 0 },
      staff: { waiter: false, dishwasher: false },
      soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
      gold: 500,
      tools: {
        pan: { count: 2, level: 1 },
        salt: { count: 1, level: 1 },
        grill: { count: 0, level: 1 },
        delivery: { count: 0, level: 1 },
        freezer: { count: 0, level: 1 },
        soup_pot: { count: 0, level: 1 },
        wasabi_cannon: { count: 0, level: 1 },
        spice_grinder: { count: 0, level: 1 },
      },
      tutorialMerchant: true,
      season2Unlocked: false,
      seenDialogues: ['intro_welcome', 'chapter1_start', 'chapter2_intro',
        'rin_first_meet', 'mage_introduction', 'merchant_first_meet',
        'poco_discount_fail', 'stage_boss_warning', 'after_first_loss',
        'chapter3_rin_joins', 'mage_research_hint', 'chapter1_clear',
        'stage_first_clear'],
      storyProgress: { currentChapter: 6, storyFlags: [] },
      endless: { unlocked: true, bestWave: 5, bestScore: 1000, bestCombo: 3, lastDailySeed: 0 },
    };
    const merged = { ...defaultSave, ...overrides };
    if (overrides.stages) merged.stages = { ...defaultSave.stages, ...overrides.stages };
    if (overrides.tools) merged.tools = { ...defaultSave.tools, ...overrides.tools };
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(merged));
  }, saveOverrides);

  // 3. 리로드하여 세이브가 적용된 상태로 게임 시작
  await page.reload();

  // 4. MenuScene 활성화 대기
  await waitForScene(page, 'MenuScene');
}

// ========================================
// 1. ChefSelectScene 5종 카드 검증
// ========================================
test.describe('ChefSelectScene 5종 카드 레이아웃', () => {

  test('5장 카드가 640px 뷰포트 내에 모두 표시된다', async ({ page }) => {
    await setupGame(page, {});

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
    });
    await waitForScene(page, 'ChefSelectScene');

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-chefselect-5cards.png',
    });

    const cardCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ChefSelectScene');
      return scene._cardBgs ? scene._cardBgs.length : 0;
    });
    expect(cardCount).toBe(5);

    const lastCardBottom = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ChefSelectScene');
      const bgs = scene._cardBgs;
      const last = bgs[bgs.length - 1];
      return last.y + last.height / 2;
    });
    expect(lastCardBottom).toBeLessThan(GAME_HEIGHT);
  });

  test('season2Unlocked=false 시 yuki_chef, lao_chef 잠금 표시', async ({ page }) => {
    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
    });
    await waitForScene(page, 'ChefSelectScene');

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-chefselect-locked.png',
    });

    const interactiveStates = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ChefSelectScene');
      return scene._cardBgs.map((bg) => bg.input ? bg.input.enabled : false);
    });
    expect(interactiveStates[0]).toBe(true);
    expect(interactiveStates[1]).toBe(true);
    expect(interactiveStates[2]).toBe(true);
    expect(interactiveStates[3]).toBe(false);
    expect(interactiveStates[4]).toBe(false);
  });

  test('잠금 카드 클릭 시 아무 일도 일어나지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
    });
    await waitForScene(page, 'ChefSelectScene');

    // 4번째 카드(yuki_chef) 위치 클릭 -- cy = 55 + 3*(108) + 50 = 429
    await page.click('canvas', { position: { x: 180, y: 429 } });
    await page.waitForTimeout(500);

    const activeScene = await page.evaluate(() => {
      const game = window.__game;
      const scenes = game.scene.getScenes(true);
      return scenes.map((s) => s.scene.key);
    });
    expect(activeScene).toContain('ChefSelectScene');
    expect(errors).toEqual([]);
  });

  test('season2Unlocked=true 시 모든 카드 인터랙티브', async ({ page }) => {
    await setupGame(page, { season2Unlocked: true });

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
    });
    await waitForScene(page, 'ChefSelectScene');

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-chefselect-unlocked.png',
    });

    const interactiveStates = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ChefSelectScene');
      return scene._cardBgs.map((bg) => bg.input ? bg.input.enabled : false);
    });
    expect(interactiveStates).toEqual([true, true, true, true, true]);
  });
});

// ========================================
// 2. WorldMapScene 시즌 탭 검증
// ========================================
test.describe('WorldMapScene 시즌 탭 시스템', () => {

  test('시�� 1/2 탭이 표시된다 (season2 잠금)', async ({ page }) => {
    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-worldmap-tabs-locked.png',
    });

    const tab2Interactive = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._tab2Bg.input ? scene._tab2Bg.input.enabled : false;
    });
    expect(tab2Interactive).toBe(false);

    const currentSeason = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._currentSeason;
    });
    expect(currentSeason).toBe(1);
  });

  test('season2Unlocked=true 시 시즌 2 탭 활성화 및 전환', async ({ page }) => {
    await setupGame(page, {
      season2Unlocked: true,
      stages: {
        '1-1': { cleared: true, stars: 3 },
        '6-3': { cleared: true, stars: 3 },
      },
    });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-worldmap-season1.png',
    });

    const tab2Interactive = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._tab2Bg.input ? scene._tab2Bg.input.enabled : false;
    });
    expect(tab2Interactive).toBe(true);

    // 시즌 2로 직접 전환 (클릭 좌표 계산이 Pixel 5 뷰포트에서 달라질 수 있으므로)
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._switchSeason(2);
    });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-worldmap-season2.png',
    });

    const currentSeason = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._currentSeason;
    });
    expect(currentSeason).toBe(2);

    // 시즌 1로 복귀
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._switchSeason(1);
    });
    await page.waitForTimeout(500);

    const backToSeason1 = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._currentSeason;
    });
    expect(backToSeason1).toBe(1);
  });

  test('시즌 2 맵에 6개 노드 표시', async ({ page }) => {
    await setupGame(page, {
      season2Unlocked: true,
      stages: { '6-3': { cleared: true, stars: 3 } },
    });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._switchSeason(2);
    });
    await page.waitForTimeout(500);

    const chapterCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._chapterStates ? scene._chapterStates.length : 0;
    });
    expect(chapterCount).toBe(6);

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-worldmap-season2-nodes.png',
    });
  });

  test('시즌 2 잠금 탭 클릭 시 아무 반응 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    // Phaser input에 직접 이벤트 전달로 시즌2 탭 클릭 시뮬레이션
    // tab2Bg에 input이 없으므로 클릭이 전달되지 않아야 함
    const tab2HasInput = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return !!scene._tab2Bg.input;
    });
    expect(tab2HasInput).toBe(false);

    const currentSeason = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._currentSeason;
    });
    expect(currentSeason).toBe(1);
    expect(errors).toEqual([]);
  });
});

// ========================================
// 3. SaveManager 로직 검증
// ========================================
test.describe('SaveManager 로직 검증', () => {

  test('isUnlocked(7-1): season2Unlocked=false + 6-3 cleared -> false', async ({ page }) => {
    await setupGame(page, {
      season2Unlocked: false,
      stages: { '6-3': { cleared: true, stars: 3 } },
    });

    const result = await page.evaluate(() => {
      return import('/js/managers/SaveManager.js').then((mod) => {
        return mod.SaveManager.isUnlocked('7-1');
      });
    });
    expect(result).toBe(false);
  });

  test('isUnlocked(7-1): season2Unlocked=true + 6-3 cleared -> true', async ({ page }) => {
    await setupGame(page, {
      season2Unlocked: true,
      stages: { '6-3': { cleared: true, stars: 3 } },
    });

    const result = await page.evaluate(() => {
      return import('/js/managers/SaveManager.js').then((mod) => {
        return mod.SaveManager.isUnlocked('7-1');
      });
    });
    expect(result).toBe(true);
  });

  test('isUnlocked(7-1): season2Unlocked=true + 6-3 NOT cleared -> false', async ({ page }) => {
    await setupGame(page, {
      season2Unlocked: true,
      stages: {},
    });

    const result = await page.evaluate(() => {
      return import('/js/managers/SaveManager.js').then((mod) => {
        return mod.SaveManager.isUnlocked('7-1');
      });
    });
    expect(result).toBe(false);
  });

  test('getTotalStars(1): 시즌 1만 필터', async ({ page }) => {
    await setupGame(page, {
      stages: {
        '1-1': { cleared: true, stars: 3 },
        '2-1': { cleared: true, stars: 2 },
        '7-1': { cleared: true, stars: 3 },
      },
    });

    const result = await page.evaluate(() => {
      return import('/js/managers/SaveManager.js').then((mod) => {
        return mod.SaveManager.getTotalStars(1);
      });
    });
    expect(result.current).toBe(5);
    expect(result.max).toBe(90);
  });

  test('getTotalStars(2): 시즌 2만 필터', async ({ page }) => {
    await setupGame(page, {
      stages: {
        '1-1': { cleared: true, stars: 3 },
        '7-1': { cleared: true, stars: 2 },
        '8-1': { cleared: true, stars: 1 },
      },
    });

    const result = await page.evaluate(() => {
      return import('/js/managers/SaveManager.js').then((mod) => {
        return mod.SaveManager.getTotalStars(2);
      });
    });
    expect(result.current).toBe(3);
    expect(result.max).toBe(108);
  });

  test('getTotalStars(): 인수 없이 호출 시 전체 합계 (하위 호환)', async ({ page }) => {
    await setupGame(page, {
      stages: {
        '1-1': { cleared: true, stars: 3 },
        '7-1': { cleared: true, stars: 2 },
      },
    });

    const result = await page.evaluate(() => {
      return import('/js/managers/SaveManager.js').then((mod) => {
        return mod.SaveManager.getTotalStars();
      });
    });
    expect(result.current).toBe(5);
    expect(result.max).toBe(198);
  });
});

// ========================================
// 4. stageData.js 데이터 정합성 검증
// ========================================
test.describe('stageData.js 시즌 2 데이터 검증', () => {

  test('STAGE_ORDER에 7-1 ~ 12-6이 포함되어 있다', async ({ page }) => {
    await setupGame(page, {});

    const result = await page.evaluate(() => {
      return import('/js/data/stageData.js').then((mod) => {
        const order = mod.STAGE_ORDER;
        const season2 = order.filter((id) => parseInt(id) >= 7);
        return {
          totalCount: order.length,
          season2Count: season2.length,
          hasFirst: order.includes('7-1'),
          hasLast: order.includes('12-6'),
        };
      });
    });
    expect(result.totalCount).toBe(66);
    expect(result.season2Count).toBe(36);
    expect(result.hasFirst).toBe(true);
    expect(result.hasLast).toBe(true);
  });

  test('STAGES에 시즌 2 36개 엔트리가 모두 존재한다', async ({ page }) => {
    await setupGame(page, {});

    const result = await page.evaluate(() => {
      return import('/js/data/stageData.js').then((mod) => {
        const stages = mod.STAGES;
        const season2Ids = mod.STAGE_ORDER.filter((id) => parseInt(id) >= 7);
        const missing = season2Ids.filter((id) => !stages[id]);
        const noWaves = season2Ids.filter((id) => stages[id] && (!stages[id].waves || stages[id].waves.length === 0));
        const noName = season2Ids.filter((id) => stages[id] && !stages[id].nameKo);
        return { missing, noWaves, noName, season2Count: season2Ids.length };
      });
    });
    expect(result.missing).toEqual([]);
    expect(result.noWaves).toEqual([]);
    expect(result.noName).toEqual([]);
    expect(result.season2Count).toBe(36);
  });
});

// ========================================
// 5. 시즌 1 회귀 테스트
// ========================================
test.describe('시즌 1 회귀 테스트', () => {

  test('시즌 1 게임플로: WorldMap -> 노드 클릭 -> 패널', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    // Phaser API로 직접 1장 노드 열기
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._openStagePanel(0);
    });
    await page.waitForTimeout(600);

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-regression-panel.png',
    });

    const panelExists = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._panelContainer !== null;
    });
    expect(panelExists).toBe(true);
    expect(errors).toEqual([]);
  });

  test('시즌 1에서 이전과 동일한 6노드가 표시된다', async ({ page }) => {
    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    const chapterCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._chapterStates.length;
    });
    expect(chapterCount).toBe(6);
  });
});

// ========================================
// 6. UI 안정성 테스트
// ========================================
test.describe('UI 안정성', () => {

  test('콘솔 에러 없이 WorldMapScene 로드', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });

  test('콘솔 에러 없이 ChefSelectScene 로드', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, { season2Unlocked: false });

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
    });
    await waitForScene(page, 'ChefSelectScene');
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });

  test('시즌 탭 빠른 연타 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, {
      season2Unlocked: true,
      stages: { '6-3': { cleared: true, stars: 3 } },
    });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    // 빠른 탭 전환 10회 (Phaser API 직접 호출)
    for (let i = 0; i < 10; i++) {
      await page.evaluate((s) => {
        const scene = window.__game.scene.getScene('WorldMapScene');
        scene._switchSeason(s);
      }, i % 2 === 0 ? 2 : 1);
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('패널 열린 상태에서 시즌 전환 시 패널 닫힘', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, {
      season2Unlocked: true,
      stages: { '6-3': { cleared: true, stars: 3 } },
    });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    // 패널 열기
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._openStagePanel(0);
    });
    await page.waitForTimeout(600);

    const panelBefore = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._panelContainer !== null;
    });
    expect(panelBefore).toBe(true);

    // 시즌 전환
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._switchSeason(2);
    });
    await page.waitForTimeout(500);

    const panelAfter = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._panelContainer === null;
    });
    expect(panelAfter).toBe(true);
    expect(errors).toEqual([]);
  });
});

// ========================================
// 7. HUD 별점 시즌 필터 검증
// ========================================
test.describe('HUD 별점 시즌별 표시', () => {

  test('시즌 전환 시 HUD 별점이 갱신된다', async ({ page }) => {
    await setupGame(page, {
      season2Unlocked: true,
      stages: {
        '1-1': { cleared: true, stars: 3 },
        '1-2': { cleared: true, stars: 2 },
        '6-3': { cleared: true, stars: 3 },
        '7-1': { cleared: true, stars: 1 },
      },
    });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    const season1Stars = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._hudStarText.text;
    });
    expect(season1Stars).toContain('8/90');

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._switchSeason(2);
    });
    await page.waitForTimeout(300);

    const season2Stars = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._hudStarText.text;
    });
    expect(season2Stars).toContain('1/108');
  });
});

// ========================================
// 8. 엣지 케이스
// ========================================
test.describe('엣지 케이스', () => {

  test('새 게임 (세이브 없음) 시 ChefSelectScene 정상 로드', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('kitchenChaosTycoon_save');
    });
    await page.reload();
    await waitForScene(page, 'MenuScene');

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
    });
    await waitForScene(page, 'ChefSelectScene');

    const states = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ChefSelectScene');
      return scene._cardBgs.map((bg) => bg.input ? bg.input.enabled : false);
    });
    expect(states).toEqual([true, true, true, false, false]);
    expect(errors).toEqual([]);
  });

  test('새 게임 시 WorldMapScene 시즌 2 탭 잠금', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('kitchenChaosTycoon_save');
    });
    await page.reload();
    await waitForScene(page, 'MenuScene');

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    const tab2HasInput = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return !!scene._tab2Bg.input;
    });
    expect(tab2HasInput).toBe(false);
    expect(errors).toEqual([]);
  });

  test('시즌 2 노드 클릭 -> 스테이지 패널', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await setupGame(page, {
      season2Unlocked: true,
      stages: { '6-3': { cleared: true, stars: 3 } },
    });

    await page.evaluate(() => {
      window.__game.scene.start('WorldMapScene');
    });
    await waitForScene(page, 'WorldMapScene');

    // 시즌 2 전환 + 7장 패널 열기
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._switchSeason(2);
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      scene._openStagePanel(0);
    });
    await page.waitForTimeout(600);

    const panelExists = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('WorldMapScene');
      return scene._panelContainer !== null;
    });
    expect(panelExists).toBe(true);

    await page.screenshot({
      path: 'tests/screenshots/phase19-2-season2-panel.png',
    });

    expect(errors).toEqual([]);
  });
});
