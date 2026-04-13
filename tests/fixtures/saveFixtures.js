/**
 * @fileoverview Playwright 테스트용 세이브 데이터 픽스처.
 * 각 챕터 직전 상태의 세이브 데이터를 생성한다.
 *
 * 사용법:
 *   import { injectSave, FIXTURES } from './fixtures/saveFixtures.js';
 *
 *   test.beforeEach(async ({ page }) => {
 *     await page.goto('http://localhost:5173');
 *     await injectSave(page, FIXTURES.ch9_boss);
 *   });
 */

const SAVE_KEY = 'kitchenChaosTycoon_save';
const SAVE_VERSION = 15;

// ── 스테이지 순서 ──
const STAGE_ORDER = [
  '1-1','1-2','1-3','1-4','1-5','1-6',
  '2-1','2-2','2-3',
  '3-1','3-2','3-3','3-4','3-5','3-6',
  '4-1','4-2','4-3','4-4','4-5','4-6',
  '5-1','5-2','5-3','5-4','5-5','5-6',
  '6-1','6-2','6-3',
  '7-1','7-2','7-3','7-4','7-5','7-6',
  '9-1','9-2','9-3','9-4','9-5','9-6',
  '10-1','10-2','10-3','10-4','10-5','10-6',
];

const CHAPTER_FLAGS = {
  7:  {},
  9:  { chapter7_cleared: true, yuki_joined: true },
  10: { chapter7_cleared: true, chapter9_cleared: true, chapter10_cleared: true, chapter10_mid_seen: true, lao_joined: true, yuki_joined: true },
  11: { chapter7_cleared: true, chapter9_cleared: true, chapter10_cleared: true, chapter10_mid_seen: true, lao_joined: true, yuki_joined: true },
};

/**
 * 지정한 스테이지 직전 상태의 세이브 데이터를 생성한다.
 * @param {string} stageId - 목표 스테이지 (예: '9-6')
 * @returns {object} 세이브 데이터
 */
function buildSaveForStage(stageId) {
  const idx = STAGE_ORDER.indexOf(stageId);
  if (idx === -1) throw new Error(`Unknown stageId: ${stageId}`);

  const chapter = parseInt(stageId.split('-')[0], 10);
  const stages = {};
  for (let i = 0; i < idx; i++) {
    stages[STAGE_ORDER[i]] = { cleared: true, stars: 3, satisfaction: 100 };
  }

  return {
    version: SAVE_VERSION,
    stages,
    gold: 9999,
    kitchenCoins: 0,
    upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: [],
    selectedChef: 'petit_chef',
    cookingSlots: 2,
    tools: {
      pan:           { count: 3, level: 1 },
      salt:          { count: 2, level: 1 },
      grill:         { count: 2, level: 1 },
      delivery:      { count: 2, level: 1 },
      freezer:       { count: 1, level: 1 },
      soup_pot:      { count: 1, level: 1 },
      wasabi_cannon: { count: 1, level: 1 },
      spice_grinder: { count: 1, level: 1 },
    },
    tutorialBattle:  true,
    tutorialService: true,
    tutorialShop:    true,
    tutorialMerchant: true,
    tutorialEndless: true,
    season2Unlocked: chapter >= 7,
    seenDialogues:   [],
    storyProgress: {
      currentChapter: chapter,
      storyFlags: { ...(CHAPTER_FLAGS[chapter] || {}) },
    },
    endless: {
      unlocked: chapter >= 7,
      bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0,
    },
    soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
  };
}

// ── 미리 생성된 픽스처 ──
export const FIXTURES = {
  /** 7장 시작 직전 (6-3 클리어 직후) */
  ch7_start: buildSaveForStage('7-1'),

  /** 9장 시작 직전 (7-6 클리어 직후) */
  ch9_start: buildSaveForStage('9-1'),

  /** 10장 시작 직전 (9-6 클리어 직후) */
  ch10_start: buildSaveForStage('10-1'),

  /** 10장 중반 (10-3 직전) */
  ch10_mid: buildSaveForStage('10-3'),

  /** 9장 보스 직전 (9-5 클리어 직후) */
  ch9_boss: buildSaveForStage('9-6'),
};

/**
 * Playwright 페이지에 세이브 데이터를 주입한다.
 * 게임 초기화 전(goto 직후)에 호출해야 한다.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} saveData - FIXTURES 중 하나 또는 buildSaveForStage() 결과
 *
 * @example
 * test('9장 보스전 테스트', async ({ page }) => {
 *   await page.goto('http://localhost:5173');
 *   await injectSave(page, FIXTURES.ch9_boss);
 *   await page.reload();
 *   await page.waitForFunction(() => window.__game?.scene?.isActive('MenuScene'), { timeout: 80000 });
 *   // 이후 테스트...
 * });
 */
export async function injectSave(page, saveData) {
  await page.evaluate(
    ([key, data]) => localStorage.setItem(key, JSON.stringify(data)),
    [SAVE_KEY, saveData],
  );
}

/**
 * 세이브 데이터를 초기화한다.
 * @param {import('@playwright/test').Page} page
 */
export async function clearSave(page) {
  await page.evaluate(key => localStorage.removeItem(key), SAVE_KEY);
}

export { buildSaveForStage };
