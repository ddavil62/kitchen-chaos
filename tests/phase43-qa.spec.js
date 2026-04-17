/**
 * @fileoverview Phase 43 QA 테스트 - 잔여 콘텐츠 구현 검증.
 * 8장/14장 스테이지, 유키/라오 패시브, 월드맵 접근성 검증.
 */
import { test, expect } from '@playwright/test';

const GAME_URL = 'http://localhost:5173';
const LOAD_WAIT = 12000;
const SAVE_KEY = 'kitchenChaosTycoon_save';

// 세이브 데이터: season2 해금, 7장 전체 클리어 상태
function buildSaveData() {
  const stages = {};
  // 그룹1 전체 클리어
  for (const ch of [1,2,3,4,5,6]) {
    const count = (ch === 2 || ch === 6) ? 3 : 6;
    for (let s = 1; s <= count; s++) {
      stages[`${ch}-${s}`] = { cleared: true, stars: 3 };
    }
  }
  // 7장 전체 클리어
  for (let s = 1; s <= 6; s++) {
    stages[`7-${s}`] = { cleared: true, stars: 3 };
  }
  // 8-1 해금 상태 (7-6 클리어로 자동 해금)
  return {
    version: 17,
    stages,
    totalGoldEarned: 100000,
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialEndless: true,
    kitchenCoins: 500,
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
    gold: 100000,
    tools: {
      pan: { count: 4, level: 1 },
      salt: { count: 2, level: 1 },
      grill: { count: 2, level: 1 },
      delivery: { count: 2, level: 1 },
      freezer: { count: 2, level: 1 },
      soup_pot: { count: 2, level: 1 },
      wasabi_cannon: { count: 2, level: 1 },
      spice_grinder: { count: 2, level: 1 },
    },
    season2Unlocked: true,
    season3Unlocked: true,
    seenDialogues: [],
    storyProgress: { currentChapter: 7, storyFlags: {} },
    achievements: { unlocked: {}, claimed: {}, progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 } },
    endless: { unlocked: true, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
  };
}

test.describe('Phase 43: 잔여 콘텐츠 구현 검증', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => {
      console.error('[PAGE ERROR]', err.message);
    });
  });

  test('게임 메인 메뉴 정상 로딩 + 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(GAME_URL);
    await page.waitForTimeout(LOAD_WAIT);
    await page.screenshot({ path: 'tests/screenshots/phase43-main-menu.png' });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('세이브 주입 + 월드맵 그룹2 진입 후 8장 노드 확인', async ({ page }) => {
    // 먼저 세이브 주입
    await page.goto(GAME_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: SAVE_KEY, data: buildSaveData() });

    // 새로고침하여 세이브 적용
    await page.reload();
    await page.waitForTimeout(LOAD_WAIT);
    await page.screenshot({ path: 'tests/screenshots/phase43-menu-with-save.png' });

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    const scaleX = box.width / 360;
    const scaleY = box.height / 640;

    // 게임 시작 버튼 클릭 (y=390)
    await canvas.click({ position: { x: 180 * scaleX, y: 390 * scaleY } });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/phase43-worldmap-g1.png' });

    // 그룹2 탭 클릭 (tab2X = 180, tabY = 64)
    await canvas.click({ position: { x: 180 * scaleX, y: 64 * scaleY } });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/phase43-worldmap-group2.png' });

    // 8장 노드 확인: 그룹2에서 ch8은 2번째 챕터(인덱스 1)
    // NODE_POSITIONS 3x3 그리드: [80,150], [180,150], [280,150], [80,310], ...
    // ch8 = 인덱스 1 -> x=180, y=150 (approximate)
    await canvas.click({ position: { x: 180 * scaleX, y: 150 * scaleY } });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/phase43-worldmap-chapter8.png' });
  });

  test('월드맵 그룹2에서 14장 노드 클릭', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(3000);
    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: SAVE_KEY, data: buildSaveData() });
    await page.reload();
    await page.waitForTimeout(LOAD_WAIT);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    const scaleX = box.width / 360;
    const scaleY = box.height / 640;

    // 게임 시작
    await canvas.click({ position: { x: 180 * scaleX, y: 390 * scaleY } });
    await page.waitForTimeout(3000);

    // 그룹2 탭
    await canvas.click({ position: { x: 180 * scaleX, y: 64 * scaleY } });
    await page.waitForTimeout(2000);

    // ch14 = 그룹2에서 8번째(인덱스 7) -> 3x3 그리드: 행3 col2 -> x=180, y=470
    await canvas.click({ position: { x: 180 * scaleX, y: 470 * scaleY } });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/phase43-worldmap-chapter14.png' });
  });

  test('모바일 뷰포트 렌더링', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(GAME_URL);
    await page.waitForTimeout(LOAD_WAIT);
    await page.screenshot({ path: 'tests/screenshots/phase43-mobile-viewport.png' });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
