/**
 * @fileoverview Phase 51-2 AD3 UI 레이아웃 검수용 스크린샷 스펙.
 */
import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

async function waitForGame(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

function makeSave() {
  return {
    version: 19,
    stages: {
      '7-1': { cleared: true, stars: 3 },
      '9-3': { cleared: true, stars: 2 },
      '10-3': { cleared: true, stars: 2 },
      '12-3': { cleared: true, stars: 1 },
    },
    mireukEssence: 50,
    season2Unlocked: true,
    currentChapter: 9,
    coins: 500,
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    wanderingChefs: {
      hired: [],
      unlocked: [],
      enhancements: {},
    },
  };
}

test('AD3-1: ShopScene 직원 탭 전체 레이아웃', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await waitForGame(page);

  await page.evaluate((save) => {
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
  }, makeSave());

  await page.evaluate(() => {
    window.__game.scene.start('ShopScene');
  });
  await page.waitForTimeout(2000);

  // 직원 탭 클릭 (5번째 탭)
  // tabW = Math.floor((360-10)/5) = 70
  // x = 5 + 4*70 + 70/2 = 320, y = 60
  await page.click('canvas', { position: { x: 320, y: 60 } });
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'C:/antigravity/kitchen-chaos/tests/screenshots/p51-2-ad3-shop-staff-tab.png',
    fullPage: false,
  });
});

test('AD3-2: WanderingChefModal 전체 레이아웃', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await waitForGame(page);

  await page.evaluate((save) => {
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
  }, makeSave());

  await page.evaluate(() => {
    window.__game.scene.start('ShopScene');
  });
  await page.waitForTimeout(1500);

  // 직원 탭 클릭
  await page.click('canvas', { position: { x: 320, y: 60 } });
  await page.waitForTimeout(800);

  // '고용 화면 열기' 버튼 클릭
  // wandererSectionY = 90 + 28 + 2*90 + 10 = 308
  // wBtnY = 308 + 44 = 352
  // openBtnY2 = 352 + 12 = 364, openBtnX = 180
  await page.click('canvas', { position: { x: 180, y: 364 } });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: 'C:/antigravity/kitchen-chaos/tests/screenshots/p51-2-ad3-modal-full.png',
    fullPage: false,
  });
});

test('AD3-3: WanderingChefModal 고용 중 상태 (1명 고용)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await waitForGame(page);

  const save = makeSave();
  // 하루카 고용 완료 상태
  save.wanderingChefs.hired = ['wanderer_haruka'];
  save.wanderingChefs.unlocked = ['wanderer_haruka'];
  save.wanderingChefs.enhancements = { wanderer_haruka: 1 };
  save.mireukEssence = 30;

  await page.evaluate((s) => {
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
  }, save);

  await page.evaluate(() => {
    window.__game.scene.start('ShopScene');
  });
  await page.waitForTimeout(1500);

  await page.click('canvas', { position: { x: 320, y: 60 } });
  await page.waitForTimeout(800);

  await page.click('canvas', { position: { x: 180, y: 364 } });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: 'C:/antigravity/kitchen-chaos/tests/screenshots/p51-2-ad3-modal-hired.png',
    fullPage: false,
  });
});

test('AD3-4: ShopScene 직원탭 하단 크롭 확인 (유랑 미력사 섹션 헤더)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await waitForGame(page);

  await page.evaluate((save) => {
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
  }, makeSave());

  await page.evaluate(() => {
    window.__game.scene.start('ShopScene');
  });
  await page.waitForTimeout(1500);

  await page.click('canvas', { position: { x: 320, y: 60 } });
  await page.waitForTimeout(800);

  // 유랑 미력사 섹션 부분만 크롭 (y=280~420 범위)
  await page.screenshot({
    path: 'C:/antigravity/kitchen-chaos/tests/screenshots/p51-2-ad3-shop-wanderer-section.png',
    clip: { x: 0, y: 280, width: 360, height: 160 },
  });
});

test('AD3-5: WanderingChefModal 헤더 영역 크롭', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await waitForGame(page);

  await page.evaluate((save) => {
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
  }, makeSave());

  await page.evaluate(() => {
    window.__game.scene.start('ShopScene');
  });
  await page.waitForTimeout(1500);

  await page.click('canvas', { position: { x: 320, y: 60 } });
  await page.waitForTimeout(800);

  await page.click('canvas', { position: { x: 180, y: 364 } });
  await page.waitForTimeout(1500);

  // 헤더 영역 크롭
  await page.screenshot({
    path: 'C:/antigravity/kitchen-chaos/tests/screenshots/p51-2-ad3-modal-header-crop.png',
    clip: { x: 0, y: 0, width: 360, height: 100 },
  });

  // 첫 번째 카드 영역 크롭
  await page.screenshot({
    path: 'C:/antigravity/kitchen-chaos/tests/screenshots/p51-2-ad3-modal-card1-crop.png',
    clip: { x: 0, y: 80, width: 360, height: 100 },
  });
});
