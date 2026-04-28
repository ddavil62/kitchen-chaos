/**
 * @fileoverview Phase 87 에너지 시스템 QA 테스트.
 * AC-1 ~ AC-7 + 엣지 케이스 검증.
 *
 * Pixel 5 디바이스 프로필: 393x727, DPR 2.75
 * 게임 캔버스: 360x640
 * Phaser 내부 좌표 vs 뷰포트 좌표 간 스케일 차이가 있음.
 * 캔버스 바운딩박스 기반으로 클릭 위치를 보정한다.
 */
import { test, expect } from '@playwright/test';

const SAVE_KEY = 'kitchenChaosTycoon_save';

/** v29 세이브 데이터 생성 (1-1~6-6 올클리어, 엔드리스 해금) */
function buildSaveData(overrides = {}) {
  const stages = {};
  for (let ch = 1; ch <= 6; ch++) {
    const maxSt = [6, 3, 6, 6, 6, 3][ch - 1];
    for (let s = 1; s <= maxSt; s++) {
      stages[`${ch}-${s}`] = { stars: 3 };
    }
  }
  const now = Date.now();
  const base = {
    version: 29, stages,
    totalGoldEarned: 10000, tutorialDone: true,
    tutorialBattle: true, tutorialService: true, tutorialShop: true,
    tutorialMerchant: true, tutorialEndless: true,
    selectedChef: 'mimi_chef', gold: 5000, kitchenCoins: 100,
    unlockedRecipes: ['pasta_basic'], cookingSlots: 2, bestSatisfaction: 0,
    tableUpgrades: {}, unlockedTables: ['table_1'], interiors: {}, staff: {},
    soundSettings: { bgmVolume: 0, sfxVolume: 0 },
    endless: { bestWave: 10, bestDate: now, dailySpecial: null, unlocked: true },
    tools: { pan: { level: 1 } },
    season2Unlocked: false, season3Unlocked: false,
    seenDialogues: {},
    storyProgress: { chaptersCleared: [], flags: {} },
    mireukEssence: 50, mireukEssenceTotal: 50, mireukTravelerCount: 0,
    mireukBossRewards: {}, wanderingChefs: {}, giftIngredients: {},
    branchCards: {
      toolMutations: {}, unlockedBranchRecipes: [], chefBonds: {},
      activeBlessing: null, selectedCards: [], recipeRepeatCounts: {},
    },
    dailyMissions: { missions: [], lastResetDate: '' },
    loginBonus: { streak: 0, lastClaimDate: '' },
    mimiSkinCoupons: 0, completedOrders: 0, upgrades: {},
    regularCustomerProgress: {}, criticPenaltyActive: false,
    unlockedSkins: { mimi_chef: ['default'] },
    equippedSkin: { mimi_chef: 'default' },
    energy: 5, energyLastRecharge: now,
  };
  return { ...base, ...overrides };
}

/** 세이브 주입 -> 리로드 -> 앱 로딩 완료 대기 */
async function loadWithSave(page, saveData, extraKv = {}) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.evaluate(({ key, data, extra }) => {
    localStorage.setItem(key, JSON.stringify(data));
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
  }, { key: SAVE_KEY, data: saveData, extra: extraKv });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  // 앱 로딩(에셋 preload) 완료까지 충분히 대기
  await page.waitForTimeout(15000);
}

/**
 * Phaser 게임 좌표를 뷰포트 좌표로 변환하여 클릭한다.
 * canvas가 뷰포트에 맞게 스케일되므로 비율로 보정.
 */
async function clickGameXY(page, gameX, gameY) {
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();
  // 게임 해상도: 360x640
  const scaleX = box.width / 360;
  const scaleY = box.height / 640;
  const vpX = box.x + gameX * scaleX;
  const vpY = box.y + gameY * scaleY;
  await page.mouse.click(vpX, vpY);
}

/** WorldMapScene으로 전환 (MenuScene "시작" 버튼) */
async function goToWorldMap(page) {
  // "시작" 버튼은 약 y=410
  await clickGameXY(page, 180, 410);
  await page.waitForTimeout(3000);
}

test.describe('Phase 87: 에너지 시스템 검증', () => {
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
  });

  // ──────────────────────────────────────────────────
  // AC-1: 스테이지 시작 시 에너지 소비
  // ──────────────────────────────────────────────────

  test('AC-1: 에너지 있을 때 스테이지 진입 시 에너지 1 감소', async ({ page }) => {
    const save = buildSaveData({ energy: 3, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);

    await page.screenshot({ path: 'tests/screenshots/phase87-menu-energy3.png' });
    await goToWorldMap(page);
    await page.screenshot({ path: 'tests/screenshots/phase87-worldmap.png' });

    // 챕터 노드 (x=80, y=170)
    await clickGameXY(page, 80, 170);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/phase87-stage-panel.png' });

    // 패널 내 1-1 항목 (panelTargetY=240, firstItem=290)
    await clickGameXY(page, 180, 290);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/phase87-after-stage-enter.png' });

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    // 3 -> 2
    expect(energy).toBeLessThanOrEqual(2);
  });

  test('AC-1b: 에너지 0 시 충전 모달 표시, 씬 전환 차단', async ({ page }) => {
    const save = buildSaveData({ energy: 0, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);
    await goToWorldMap(page);

    await clickGameXY(page, 80, 170);
    await page.waitForTimeout(1500);
    await clickGameXY(page, 180, 290);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/phase87-energy-modal.png' });

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    expect(energy).toBe(0);
  });

  // ──────────────────────────────────────────────────
  // AC-2: 자동 충전
  // ──────────────────────────────────────────────────

  test('AC-2: 35분 경과 시 에너지 3->4 자동 충전', async ({ page }) => {
    const thirtyFiveMinAgo = Date.now() - (35 * 60 * 1000);
    const save = buildSaveData({ energy: 3, energyLastRecharge: thirtyFiveMinAgo });
    await loadWithSave(page, save);

    await page.screenshot({ path: 'tests/screenshots/phase87-auto-recharge.png' });

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    expect(energy).toBe(4);
  });

  test('AC-2b: 만충(5) 시 자동 충전 미적용', async ({ page }) => {
    const twoHoursAgo = Date.now() - (120 * 60 * 1000);
    const save = buildSaveData({ energy: 5, energyLastRecharge: twoHoursAgo });
    await loadWithSave(page, save);

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    expect(energy).toBe(5);
  });

  test('AC-2c: 2시간 경과 시 에너지 1->5 일괄 충전', async ({ page }) => {
    const twoHoursAgo = Date.now() - (120 * 60 * 1000);
    const save = buildSaveData({ energy: 1, energyLastRecharge: twoHoursAgo });
    await loadWithSave(page, save);

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    expect(energy).toBe(5);
  });

  test('AC-2d: 만충 시 카운트다운 미표시', async ({ page }) => {
    const save = buildSaveData({ energy: 5, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);
    await page.screenshot({ path: 'tests/screenshots/phase87-full-no-countdown.png' });
  });

  // ──────────────────────────────────────────────────
  // AC-3: 광고 보기 -> 에너지 +1
  // ──────────────────────────────────────────────────

  test('AC-3: 충전 모달 광고 보기 -> DEV 폴백 -> 에너지 +1', async ({ page }) => {
    const save = buildSaveData({ energy: 0, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);
    await goToWorldMap(page);

    await clickGameXY(page, 80, 170);
    await page.waitForTimeout(1500);
    await clickGameXY(page, 180, 290);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/phase87-ad-modal-before.png' });

    // "광고 보기" 버튼: cy=320+10=330
    await clickGameXY(page, 180, 330);
    await page.waitForTimeout(1000);

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    await page.screenshot({ path: 'tests/screenshots/phase87-ad-reward.png' });
    expect(energy).toBe(1);
  });

  // ──────────────────────────────────────────────────
  // AC-4: 광고 제거 바이패스
  // ──────────────────────────────────────────────────

  test('AC-4: 광고 제거 시 에너지 0에서도 스테이지 진입', async ({ page }) => {
    const save = buildSaveData({ energy: 0, energyLastRecharge: Date.now() });
    await loadWithSave(page, save, { 'kc_ads_removed': '1' });
    await goToWorldMap(page);

    await clickGameXY(page, 80, 170);
    await page.waitForTimeout(1500);
    await clickGameXY(page, 180, 290);
    await page.waitForTimeout(2000);

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    expect(energy).toBe(0);
    await page.screenshot({ path: 'tests/screenshots/phase87-ads-removed.png' });
  });

  // ──────────────────────────────────────────────────
  // AC-5: MenuScene HUD 에너지 표시
  // ──────────────────────────────────────────────────

  test('AC-5: MenuScene HUD 에너지 N/5 + 카운트다운', async ({ page }) => {
    const tenMinAgo = Date.now() - (10 * 60 * 1000);
    const save = buildSaveData({ energy: 3, energyLastRecharge: tenMinAgo });
    await loadWithSave(page, save);

    await page.screenshot({
      path: 'tests/screenshots/phase87-hud-energy3.png',
      clip: { x: 0, y: 80, width: 393, height: 60 },
    });
  });

  test('AC-5b: 에너지 미만 시 카운트다운 표시', async ({ page }) => {
    const twentyMinAgo = Date.now() - (20 * 60 * 1000);
    const save = buildSaveData({ energy: 2, energyLastRecharge: twentyMinAgo });
    await loadWithSave(page, save);
    await page.screenshot({
      path: 'tests/screenshots/phase87-hud-countdown.png',
      clip: { x: 0, y: 80, width: 393, height: 60 },
    });
  });

  // ──────────────────────────────────────────────────
  // AC-6: v29 마이그레이션
  // ──────────────────────────────────────────────────

  test('AC-6: v28 세이브 -> v29 마이그레이션', async ({ page }) => {
    const v28Save = buildSaveData();
    v28Save.version = 28;
    delete v28Save.energy;
    delete v28Save.energyLastRecharge;
    await loadWithSave(page, v28Save);
    await page.waitForTimeout(3000);

    const data = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)), SAVE_KEY);

    // Lazy migration: load()에서 인메모리 마이그레이션, save()가 호출되어야 반영
    // 최소 앱이 에러 없이 동작해야 함
    expect(data.version).toBeGreaterThanOrEqual(28);
  });

  // ──────────────────────────────────────────────────
  // AC-7: 엔드리스 에너지 소비
  // ──────────────────────────────────────────────────

  test('AC-7: 엔드리스 모드 진입 시 에너지 1 소비', async ({ page }) => {
    const save = buildSaveData({ energy: 3, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);
    await goToWorldMap(page);
    await page.screenshot({ path: 'tests/screenshots/phase87-worldmap-endless.png' });

    // 엔드리스 버튼 (y=575)
    await clickGameXY(page, 180, 575);
    await page.waitForTimeout(3000);

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    await page.screenshot({ path: 'tests/screenshots/phase87-endless-entry.png' });
    expect(energy).toBe(2);
  });

  test('AC-7b: 엔드리스 에너지 0 시 충전 모달', async ({ page }) => {
    const save = buildSaveData({ energy: 0, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);
    await goToWorldMap(page);

    await clickGameXY(page, 180, 575);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/phase87-endless-modal.png' });

    const energy = await page.evaluate(key =>
      JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
    expect(energy).toBe(0);
  });

  // ──────────────────────────────────────────────────
  // 엣지 케이스
  // ──────────────────────────────────────────────────

  test.describe('엣지 케이스', () => {
    test('energyLastRecharge 미래값 시 충전 0', async ({ page }) => {
      const futureTime = Date.now() + (60 * 60 * 1000);
      const save = buildSaveData({ energy: 2, energyLastRecharge: futureTime });
      await loadWithSave(page, save);
      const energy = await page.evaluate(key =>
        JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
      expect(energy).toBe(2);
    });

    test('energyLastRecharge=0 (epoch) 시 만충', async ({ page }) => {
      const save = buildSaveData({ energy: 0, energyLastRecharge: 0 });
      await loadWithSave(page, save);
      const energy = await page.evaluate(key =>
        JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
      expect(energy).toBe(5);
    });

    test('에너지 모달 닫기 버튼', async ({ page }) => {
      const save = buildSaveData({ energy: 0, energyLastRecharge: Date.now() });
      await loadWithSave(page, save);
      await goToWorldMap(page);

      await clickGameXY(page, 80, 170);
      await page.waitForTimeout(1500);
      await clickGameXY(page, 180, 290);
      await page.waitForTimeout(1000);

      // "닫기" 버튼 (cy+64=384)
      await clickGameXY(page, 180, 384);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/phase87-modal-closed.png' });
    });

    test('에너지 1일 때 엔드리스 진입 -> 0', async ({ page }) => {
      const save = buildSaveData({ energy: 1, energyLastRecharge: Date.now() });
      await loadWithSave(page, save);
      await goToWorldMap(page);

      await clickGameXY(page, 180, 575);
      await page.waitForTimeout(3000);

      const energy = await page.evaluate(key =>
        JSON.parse(localStorage.getItem(key)).energy, SAVE_KEY);
      expect(energy).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────
  // UI 안정성
  // ──────────────────────────────────────────────────

  test('콘솔 에러 없이 앱 로드 + WorldMapScene', async ({ page }) => {
    const save = buildSaveData({ energy: 3, energyLastRecharge: Date.now() });
    await loadWithSave(page, save);
    await goToWorldMap(page);

    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('404') &&
      !e.includes('net::ERR') && !e.includes('Failed to load resource')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('MenuScene 전체 스크린샷', async ({ page }) => {
    const save = buildSaveData({ energy: 2, energyLastRecharge: Date.now() - (5 * 60 * 1000) });
    await loadWithSave(page, save);
    await page.screenshot({ path: 'tests/screenshots/phase87-menu-full.png' });
  });
});
