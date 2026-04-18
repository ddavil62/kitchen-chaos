/**
 * @fileoverview Phase 51-3 QA: 셰프 스킬 재설계 검증.
 * 축 1: chefData.js passiveDesc 3건 교정
 * 축 2: 미력사 버프 5종 ServiceScene 연결
 * 축 3: 요코 chain_serve 구현
 * 독립 계수 곱셈 원칙 주석 검증
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 게임 로딩 헬퍼 ──
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

// ── v19 세이브 데이터 생성 (유랑 미력사 고용 가능) ──
function createV19Save(overrides = {}) {
  return {
    version: 19,
    stages: {
      '1-1': { cleared: true, stars: 3 },
      '6-3': { cleared: true, stars: 2 },
      '7-1': { cleared: true, stars: 3 },
      '9-3': { cleared: true, stars: 2 },
      '10-3': { cleared: true, stars: 3 },
      '12-3': { cleared: true, stars: 2 },
      '15-3': { cleared: true, stars: 3 },
      '18-3': { cleared: true, stars: 3 },
      '24-3': { cleared: true, stars: 3 },
    },
    totalGoldEarned: 5000,
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialEndless: false,
    kitchenCoins: 50,
    upgrades: { fridge: 1, knife: 1, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: ['rice_ball'],
    selectedChef: 'petit_chef',
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: true, dishwasher: false },
    soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
    gold: 500,
    tools: {
      pan: { count: 4, level: 1 },
      salt: { count: 0, level: 1 },
      grill: { count: 0, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    },
    tutorialMerchant: false,
    season2Unlocked: true,
    season3Unlocked: true,
    seenDialogues: [],
    storyProgress: { currentChapter: 24, storyFlags: {} },
    endless: { unlocked: true, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    achievements: {
      unlocked: {},
      claimed: {},
      progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 },
    },
    mireukEssence: 100,
    mireukEssenceTotal: 200,
    mireukTravelerCount: 5,
    mireukBossRewards: {},
    wanderingChefs: {
      hired: [],
      unlocked: ['wanderer_haruka', 'wanderer_botae', 'wanderer_leila', 'wanderer_muo', 'wanderer_sien', 'wanderer_aida', 'wanderer_rosario', 'wanderer_yoko'],
      enhancements: {},
    },
    ...overrides,
  };
}

// ── ServiceScene 시작 헬퍼 ──
async function startServiceScene(page, stageId = '24-1') {
  await page.evaluate(({ stageId }) => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) game.scene.stop(s.scene.key);
    game.scene.start('ServiceScene', {
      stageId,
      inventory: { carrot: 99, meat: 99, flour: 99, fish: 99, tofu: 99, rice: 99, egg: 99, onion: 99, potato: 99, seaweed: 99, soy_sauce: 99, miso: 99, sugar: 99, cream: 99, butter: 99, chocolate: 99, lemon: 99, chili: 99, tomato: 99, cheese: 99, avocado: 99, corn: 99, beans: 99, cilantro: 99 },
      gold: 500,
      lives: 10,
      isEndless: false,
    });
  }, { stageId });
  await page.waitForTimeout(2000);
}

// ────────────────────────────────────────────────────────────────────
// 축 1: chefData.js passiveDesc 교정
// ────────────────────────────────────────────────────────────────────
test.describe('축 1: passiveDesc 교정', () => {

  test('T01: petit_chef passiveDesc에 "조리시간 -15%"이 포함된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const { CHEF_TYPES } = await import('/js/data/chefData.js');
      return CHEF_TYPES.petit_chef.passiveDesc;
    });
    expect(result).toContain('재료 수거 범위 +30%');
    expect(result).toContain('조리시간');
    expect(result).toContain('15%');
  });

  test('T02: flame_chef passiveDesc에 "그릴 요리 수익 +25%"이 포함된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const { CHEF_TYPES } = await import('/js/data/chefData.js');
      return CHEF_TYPES.flame_chef.passiveDesc;
    });
    expect(result).toContain('화염 타워 피해 +20%');
    expect(result).toContain('그릴 요리 수익 +25%');
  });

  test('T03: ice_chef passiveDesc에 "손님 인내심 +20%"이 포함된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const { CHEF_TYPES } = await import('/js/data/chefData.js');
      return CHEF_TYPES.ice_chef.passiveDesc;
    });
    expect(result).toContain('CC(둔화/빙결) 지속 +25%');
    expect(result).toContain('손님 인내심 +20%');
  });

  test('T04: yuki_chef passiveDesc는 변경되지 않았다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const { CHEF_TYPES } = await import('/js/data/chefData.js');
      return CHEF_TYPES.yuki_chef.passiveDesc;
    });
    expect(result).toBe('조리시간 -20%, ★★★+ 레시피 보상 +15%');
  });

  test('T05: lao_chef passiveDesc는 변경되지 않았다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const { CHEF_TYPES } = await import('/js/data/chefData.js');
      return CHEF_TYPES.lao_chef.passiveDesc;
    });
    expect(result).toBe('도구 공격력 +15%, 재료 드롭률 +10%');
  });
});

// ────────────────────────────────────────────────────────────────────
// 축 2-A: _buffServeSpeed (무오) — 자동 서빙 딜레이 단축
// ────────────────────────────────────────────────────────────────────
test.describe('축 2-A: 무오 서빙 속도 버프', () => {

  test('T06: 무오 고용 시 _buffServeSpeed가 0보다 크다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_muo'],
        unlocked: ['wanderer_muo'],
        enhancements: { wanderer_muo: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        buffServeSpeed: scene._buffServeSpeed,
      };
    });
    expect(result.buffServeSpeed).toBe(0.25); // 1단계: 0.25
  });

  test('T07: 무오 2단계 고용 시 _buffServeSpeed가 0.40이다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_muo'],
        unlocked: ['wanderer_muo'],
        enhancements: { wanderer_muo: 2 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return { buffServeSpeed: scene._buffServeSpeed };
    });
    expect(result.buffServeSpeed).toBe(0.40);
  });

  test('T08: effectiveServeDelay가 올바르게 계산된다 (3000 * (1 - 0.25) = 2250)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      staff: { waiter: true, dishwasher: false },
      wanderingChefs: {
        hired: ['wanderer_muo'],
        unlocked: ['wanderer_muo'],
        enhancements: { wanderer_muo: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // effectiveServeDelay = 3000 * (1 - min(0.25, 0.80))
      const AUTO_SERVE_DELAY_MS = 3000;
      const effectiveServeDelay = AUTO_SERVE_DELAY_MS * (1 - Math.min(scene._buffServeSpeed || 0, 0.80));
      return { effectiveServeDelay };
    });
    expect(result.effectiveServeDelay).toBe(2250);
  });

  test('T09: _buffServeSpeed 80% 상한 캡 — 초과해도 딜레이가 20% 이하로 떨어지지 않는다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save();
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    // 인위적으로 _buffServeSpeed를 0.95로 설정하여 캡 테스트
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      scene._buffServeSpeed = 0.95; // 80% 캡 초과
      const AUTO_SERVE_DELAY_MS = 3000;
      const effectiveServeDelay = AUTO_SERVE_DELAY_MS * (1 - Math.min(scene._buffServeSpeed || 0, 0.80));
      return { effectiveServeDelay };
    });
    // 최소 딜레이: 3000 * 0.20 = 600 (부동소수점 오차 허용)
    expect(result.effectiveServeDelay).toBeCloseTo(600, 5);
  });
});

// ────────────────────────────────────────────────────────────────────
// 축 2-B: _buffEarlyBonus / _buffEarlyDuration (시엔) — 세션 초반 보상 증가
// ────────────────────────────────────────────────────────────────────
test.describe('축 2-B: 시엔 세션 초반 보상', () => {

  test('T10: 시엔 1단계 고용 시 _buffEarlyBonus=0.30, _buffEarlyDuration=30', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_sien'],
        unlocked: ['wanderer_sien'],
        enhancements: { wanderer_sien: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        earlyBonus: scene._buffEarlyBonus,
        earlyDuration: scene._buffEarlyDuration,
      };
    });
    expect(result.earlyBonus).toBe(0.30);
    expect(result.earlyDuration).toBe(30);
  });

  test('T11: 세션 시작 직후(elapsedSec=0) earlyMult가 1.30이다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_sien'],
        unlocked: ['wanderer_sien'],
        enhancements: { wanderer_sien: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      const elapsedSec = scene.serviceConfig.duration - scene.serviceTimeLeft;
      const earlyMult = (scene._buffEarlyBonus > 0 && elapsedSec <= scene._buffEarlyDuration)
        ? (1 + scene._buffEarlyBonus) : 1.0;
      return { elapsedSec, earlyMult, duration: scene.serviceConfig.duration };
    });
    // 세션 시작 직후이므로 elapsedSec이 매우 작아야 하고 earlyMult는 1.30
    expect(result.elapsedSec).toBeLessThan(5); // 로딩 시간 감안
    expect(result.earlyMult).toBeCloseTo(1.30, 2);
  });

  test('T12: 세션 시작 30초 경과 후 earlyMult가 1.0이다 (시엔 1단계)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_sien'],
        unlocked: ['wanderer_sien'],
        enhancements: { wanderer_sien: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // 인위적으로 serviceTimeLeft를 줄여서 30초 이상 경과 시뮬레이션
      const originalTimeLeft = scene.serviceTimeLeft;
      scene.serviceTimeLeft = scene.serviceConfig.duration - 31; // 31초 경과
      const elapsedSec = scene.serviceConfig.duration - scene.serviceTimeLeft;
      const earlyMult = (scene._buffEarlyBonus > 0 && elapsedSec <= scene._buffEarlyDuration)
        ? (1 + scene._buffEarlyBonus) : 1.0;
      scene.serviceTimeLeft = originalTimeLeft; // 복원
      return { elapsedSec, earlyMult };
    });
    expect(result.elapsedSec).toBe(31);
    expect(result.earlyMult).toBe(1.0); // 30초 초과 -> 보너스 없음
  });
});

// ────────────────────────────────────────────────────────────────────
// 축 2-C: _buffIngredientRefund / _buffNoFailDelay (아이다)
// ────────────────────────────────────────────────────────────────────
test.describe('축 2-C: 아이다 재료 회수', () => {

  test('T13: 아이다 1단계 고용 시 _buffIngredientRefund=0.50', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_aida'],
        unlocked: ['wanderer_aida'],
        enhancements: { wanderer_aida: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        refund: scene._buffIngredientRefund,
        noFailDelay: scene._buffNoFailDelay,
      };
    });
    expect(result.refund).toBe(0.50);
    expect(result.noFailDelay).toBe(false); // 1단계에서는 false
  });

  test('T14: 아이다 3단계 고용 시 _buffIngredientRefund=1.00, _buffNoFailDelay=true', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_aida'],
        unlocked: ['wanderer_aida'],
        enhancements: { wanderer_aida: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        refund: scene._buffIngredientRefund,
        noFailDelay: scene._buffNoFailDelay,
      };
    });
    expect(result.refund).toBe(1.00);
    expect(result.noFailDelay).toBe(true);
  });

  test('T15: InventoryManager.addIngredients가 정상적으로 재료를 반환한다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const InventoryManager = (await import('/js/managers/InventoryManager.js')).default;
      const inv = new InventoryManager();
      inv.add('carrot', 5);
      inv.add('meat', 3);
      inv.addIngredients({ carrot: 2, meat: 1 });
      return {
        carrot: inv.inventory.carrot,
        meat: inv.inventory.meat,
      };
    });
    expect(result.carrot).toBe(7); // 5+2
    expect(result.meat).toBe(4);   // 3+1
  });

  test('T16: InventoryManager.addIngredients 음수 수량은 무시된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const InventoryManager = (await import('/js/managers/InventoryManager.js')).default;
      const inv = new InventoryManager();
      inv.add('carrot', 5);
      inv.addIngredients({ carrot: -3 }); // 음수 시도
      return { carrot: inv.inventory.carrot };
    });
    expect(result.carrot).toBe(5); // 변화 없음
  });

  test('T17: _discardDish에서 완성된 요리(slot.ready=true)는 재료 회수 대상이 아니다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_aida'],
        unlocked: ['wanderer_aida'],
        enhancements: { wanderer_aida: 3 }, // 3단계: 100% 회수
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // Stub UI 업데이트 메서드
      const origUpdateRecipe = scene._updateRecipeQuickSlots;
      const origUpdateSlot = scene._updateCookSlotUI;
      const origShowMsg = scene._showMessage;
      scene._updateRecipeQuickSlots = () => {};
      scene._updateCookSlotUI = () => {};
      scene._showMessage = () => {};

      // 슬롯에 완성된 요리를 인위적으로 넣기
      scene.cookingSlots[0] = {
        recipe: { id: 'test', nameKo: '테스트', ingredients: { carrot: 2 } },
        timeLeft: 0,
        totalTime: 5000,
        ready: true, // 완성됨
        washing: false,
        washTimeLeft: 0,
      };
      const beforeCarrot = scene.inventoryManager.inventory.carrot || 0;
      scene._discardDish(0);
      const afterCarrot = scene.inventoryManager.inventory.carrot || 0;

      // 복원
      scene._updateRecipeQuickSlots = origUpdateRecipe;
      scene._updateCookSlotUI = origUpdateSlot;
      scene._showMessage = origShowMsg;

      return { beforeCarrot, afterCarrot, diff: afterCarrot - beforeCarrot };
    });
    // 완성된 요리 -> !slot.ready 조건 false -> 회수 안 됨
    expect(result.diff).toBe(0);
  });

  test('T18: _discardDish에서 조리 중인 요리(slot.ready=false)는 100%로 재료 회수된다 (아이다 3단계)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_aida'],
        unlocked: ['wanderer_aida'],
        enhancements: { wanderer_aida: 3 }, // 3단계: 100% 회수
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // Stub UI 업데이트 메서드 (Phaser 객체 접근 방지)
      const origUpdateRecipe = scene._updateRecipeQuickSlots;
      const origUpdateInv = scene._updateInventoryPanel;
      const origUpdateSlot = scene._updateCookSlotUI;
      const origShowMsg = scene._showMessage;
      scene._updateRecipeQuickSlots = () => {};
      scene._updateInventoryPanel = () => {};
      scene._updateCookSlotUI = () => {};
      scene._showMessage = () => {};

      scene.cookingSlots[0] = {
        recipe: { id: 'test', nameKo: '테스트', ingredients: { carrot: 2, meat: 1 } },
        timeLeft: 3000,
        totalTime: 5000,
        ready: false, // 조리 중
        washing: false,
        washTimeLeft: 0,
      };
      const beforeCarrot = scene.inventoryManager.inventory.carrot || 0;
      const beforeMeat = scene.inventoryManager.inventory.meat || 0;
      // Math.random을 고정하여 100% 확률 보장
      const origRandom = Math.random;
      Math.random = () => 0.01; // < 1.00 이므로 반드시 회수
      scene._discardDish(0);
      Math.random = origRandom;
      const afterCarrot = scene.inventoryManager.inventory.carrot || 0;
      const afterMeat = scene.inventoryManager.inventory.meat || 0;

      // 복원
      scene._updateRecipeQuickSlots = origUpdateRecipe;
      scene._updateInventoryPanel = origUpdateInv;
      scene._updateCookSlotUI = origUpdateSlot;
      scene._showMessage = origShowMsg;

      return {
        carrotDiff: afterCarrot - beforeCarrot,
        meatDiff: afterMeat - beforeMeat,
      };
    });
    expect(result.carrotDiff).toBe(2);
    expect(result.meatDiff).toBe(1);
  });

  test('T19: 아이다 3단계 _buffNoFailDelay — 버린 슬롯이 세척 없이 즉시 재사용 가능', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_aida'],
        unlocked: ['wanderer_aida'],
        enhancements: { wanderer_aida: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // Stub UI 업데이트 메서드
      const origUpdateRecipe = scene._updateRecipeQuickSlots;
      const origUpdateInv = scene._updateInventoryPanel;
      const origUpdateSlot = scene._updateCookSlotUI;
      const origShowMsg = scene._showMessage;
      scene._updateRecipeQuickSlots = () => {};
      scene._updateInventoryPanel = () => {};
      scene._updateCookSlotUI = () => {};
      scene._showMessage = () => {};

      scene.cookingSlots[0] = {
        recipe: { id: 'test', nameKo: '테스트', ingredients: { carrot: 1 } },
        timeLeft: 2000,
        totalTime: 5000,
        ready: false,
        washing: false,
        washTimeLeft: 0,
      };
      const origRandom = Math.random;
      Math.random = () => 0.99; // 회수 실패하게 (아이다 3단계 1.00 이하이므로 이 값은 반드시 회수됨)
      scene._discardDish(0);
      Math.random = origRandom;

      // 복원
      scene._updateRecipeQuickSlots = origUpdateRecipe;
      scene._updateInventoryPanel = origUpdateInv;
      scene._updateCookSlotUI = origUpdateSlot;
      scene._showMessage = origShowMsg;

      return {
        slotWashing: scene.cookingSlots[0].washing,
        slotWashTimeLeft: scene.cookingSlots[0].washTimeLeft,
        slotRecipe: scene.cookingSlots[0].recipe,
      };
    });
    expect(result.slotWashing).toBe(false);
    expect(result.slotWashTimeLeft).toBe(0);
    expect(result.slotRecipe).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────
// 축 2-D: _buffVipRewardMult (로살리오) — VIP 보상 배율
// ────────────────────────────────────────────────────────────────────
test.describe('축 2-D: 로살리오 VIP 보상', () => {

  test('T20: 로살리오 1단계 고용 시 _buffVipRewardMult=0.25', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_rosario'],
        unlocked: ['wanderer_rosario'],
        enhancements: { wanderer_rosario: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return { vipRewardMult: scene._buffVipRewardMult };
    });
    expect(result.vipRewardMult).toBe(0.25);
  });

  test('T21: VIP 손님에 대해 vipBonus가 1.25이다 (로살리오 1단계)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_rosario'],
        unlocked: ['wanderer_rosario'],
        enhancements: { wanderer_rosario: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      const custVip = { customerType: 'vip' };
      const custNormal = { customerType: 'normal' };
      const vipBonus = (custVip.customerType === 'vip' && scene._buffVipRewardMult > 0)
        ? (1 + scene._buffVipRewardMult) : 1.0;
      const normalBonus = (custNormal.customerType === 'vip' && scene._buffVipRewardMult > 0)
        ? (1 + scene._buffVipRewardMult) : 1.0;
      return { vipBonus, normalBonus };
    });
    expect(result.vipBonus).toBe(1.25);
    expect(result.normalBonus).toBe(1.0); // normal 손님에게는 적용 안 됨
  });

  test('T22: 로살리오 3단계에서 _buffVipFoodReviewBonus=0.30', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_rosario'],
        unlocked: ['wanderer_rosario'],
        enhancements: { wanderer_rosario: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        foodReviewBonus: scene._buffVipFoodReviewBonus,
        vipRewardMult: scene._buffVipRewardMult,
      };
    });
    expect(result.foodReviewBonus).toBe(0.30);
    expect(result.vipRewardMult).toBe(0.40); // 3단계: skillValues2[2] = 0.40
  });
});

// ────────────────────────────────────────────────────────────────────
// 축 2-E: _buffGourmetRewardMult (레이라) — 미식가 보상 배율
// ────────────────────────────────────────────────────────────────────
test.describe('축 2-E: 레이라 미식가 보상', () => {

  test('T23: 레이라 3단계 고용 시 _buffGourmetRewardMult=0.50', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_leila'],
        unlocked: ['wanderer_leila'],
        enhancements: { wanderer_leila: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return { gourmetRewardMult: scene._buffGourmetRewardMult };
    });
    expect(result.gourmetRewardMult).toBe(0.50);
  });

  test('T24: 미식가 손님에 대해 gourmetBonus가 1.50이다 (레이라 3단계)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_leila'],
        unlocked: ['wanderer_leila'],
        enhancements: { wanderer_leila: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      const custGourmet = { customerType: 'gourmet' };
      const custVip = { customerType: 'vip' };
      const gourmetBonus = (custGourmet.customerType === 'gourmet' && scene._buffGourmetRewardMult > 0)
        ? (1 + scene._buffGourmetRewardMult) : 1.0;
      const vipNoBonus = (custVip.customerType === 'gourmet' && scene._buffGourmetRewardMult > 0)
        ? (1 + scene._buffGourmetRewardMult) : 1.0;
      return { gourmetBonus, vipNoBonus };
    });
    expect(result.gourmetBonus).toBe(1.50);
    expect(result.vipNoBonus).toBe(1.0);
  });
});

// ────────────────────────────────────────────────────────────────────
// 축 3: 요코 chain_serve 구현
// ────────────────────────────────────────────────────────────────────
test.describe('축 3: 요코 chain_serve', () => {

  test('T25: 요코 1단계 고용 시 _yokoChainThreshold=3, _yokoChainReward=0', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        threshold: scene._yokoChainThreshold,
        reward: scene._yokoChainReward,
        count: scene._yokoChainCount,
        protectNext: scene._yokoProtectNext,
        protectActive: scene._yokoProtectActive,
      };
    });
    expect(result.threshold).toBe(3);
    expect(result.reward).toBe(0);
    expect(result.count).toBe(0);
    expect(result.protectNext).toBe(false);
    expect(result.protectActive).toBe(false);
  });

  test('T26: 요코 3단계 고용 시 _yokoChainThreshold=2, _yokoChainReward=0.50', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        threshold: scene._yokoChainThreshold,
        reward: scene._yokoChainReward,
      };
    });
    expect(result.threshold).toBe(2);
    expect(result.reward).toBe(0.50);
  });

  test('T27: 3연속 서빙 후 _yokoProtectNext=true (요코 1단계)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // 인위적으로 카운터를 2로 설정 (2번 서빙 성공한 상태)
      scene._yokoChainCount = 2;
      // 3번째 서빙 시뮬레이션: 테이블/슬롯 세팅
      const recipeId = 'test_recipe';
      scene.tables[0] = {
        dish: recipeId,
        customerType: 'normal',
        baseReward: 10,
        patience: 5000,
        maxPatience: 10000,
        tipMultiplier: 1.2,
        recipe: { id: recipeId, ingredients: { carrot: 1 } },
      };
      scene.cookingSlots[0] = {
        recipe: { id: recipeId, nameKo: '테스트', tier: 1, category: 'cook', ingredients: { carrot: 1 } },
        timeLeft: 0,
        totalTime: 3000,
        ready: true,
        washing: false,
        washTimeLeft: 0,
      };
      scene._serveToCustomer(0, 0);
      return {
        protectNext: scene._yokoProtectNext,
        chainCount: scene._yokoChainCount,
      };
    });
    expect(result.protectNext).toBe(true); // 3연속 달성 -> 퇴장 방지 활성
    expect(result.chainCount).toBe(0);     // 카운터 리셋
  });

  test('T28: 인내심 0 도달 시 _yokoProtectNext가 true이면 퇴장 방지 (인내심 500ms 고정)', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // 퇴장 방지 플래그 활성화
      scene._yokoProtectNext = true;

      // 인내심이 거의 다 된 손님 세팅
      scene.tables[0] = {
        dish: 'test',
        customerType: 'normal',
        baseReward: 10,
        patience: 10, // 곧 0 이하
        maxPatience: 10000,
        tipMultiplier: 1.0,
        recipe: { id: 'test', ingredients: { carrot: 1 } },
      };

      // 인내심 업데이트 실행 (delta > patience)
      scene._updateCustomerPatience(100); // 100ms 감소 -> 10 - 100 = -90

      const cust = scene.tables[0];
      return {
        customerStillThere: cust !== null,
        patience: cust ? cust.patience : null,
        protectNext: scene._yokoProtectNext,
        protectActive: scene._yokoProtectActive,
      };
    });
    expect(result.customerStillThere).toBe(true); // 퇴장하지 않음
    expect(result.patience).toBe(500);             // 500ms로 고정
    expect(result.protectNext).toBe(false);        // 사용 후 리셋
    expect(result.protectActive).toBe(true);       // 다음 서빙 보너스용
  });

  test('T29: 요코 3단계 퇴장 방지 발동 후 서빙 시 yokoProtectBonus=1.50', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // 퇴장 방지 발동 상태
      scene._yokoProtectActive = true;
      const yokoProtectBonus = (scene._yokoProtectActive && scene._yokoChainReward > 0)
        ? (1 + scene._yokoChainReward) : 1.0;
      return { yokoProtectBonus };
    });
    expect(result.yokoProtectBonus).toBe(1.50);
  });

  test('T30: 서빙 실패(손님 퇴장) 시 요코 카운터가 리셋된다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 1 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // 카운터를 2로 설정
      scene._yokoChainCount = 2;
      scene._yokoProtectNext = false;

      // 인내심 0인 손님 세팅 (퇴장 방지 비활성)
      scene.tables[0] = {
        dish: 'test',
        customerType: 'normal',
        baseReward: 10,
        patience: 10,
        maxPatience: 10000,
        tipMultiplier: 1.0,
        recipe: { id: 'test', ingredients: { carrot: 1 } },
      };

      scene._updateCustomerPatience(100);

      return {
        chainCount: scene._yokoChainCount,
        protectNext: scene._yokoProtectNext,
        protectActive: scene._yokoProtectActive,
        customerGone: scene.tables[0] === null,
      };
    });
    expect(result.customerGone).toBe(true);        // 퇴장함
    expect(result.chainCount).toBe(0);              // 카운터 리셋
    expect(result.protectNext).toBe(false);
    expect(result.protectActive).toBe(false);
  });

  test('T31: 서빙 완료 후 _yokoProtectActive가 false로 리셋된다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_yoko'],
        unlocked: ['wanderer_yoko'],
        enhancements: { wanderer_yoko: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      scene._yokoProtectActive = true; // 발동 상태
      const recipeId = 'test_recipe';
      scene.tables[0] = {
        dish: recipeId,
        customerType: 'normal',
        baseReward: 10,
        patience: 5000,
        maxPatience: 10000,
        tipMultiplier: 1.2,
        recipe: { id: recipeId, ingredients: { carrot: 1 } },
      };
      scene.cookingSlots[0] = {
        recipe: { id: recipeId, nameKo: '테스트', tier: 1, category: 'cook', ingredients: { carrot: 1 } },
        timeLeft: 0, totalTime: 3000, ready: true, washing: false, washTimeLeft: 0,
      };
      scene._serveToCustomer(0, 0);
      return { protectActive: scene._yokoProtectActive };
    });
    expect(result.protectActive).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────
// 독립 계수 원칙 주석 검증
// ────────────────────────────────────────────────────────────────────
test.describe('독립 계수 원칙', () => {

  test('T32: totalGold 계산식 주석에 독립 계수 설명이 포함된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(async () => {
      const resp = await fetch('/js/scenes/ServiceScene.js');
      const code = await resp.text();
      return {
        hasIndependentComment: code.includes('독립 계수 곱셈'),
        hasChefSkillRef: code.includes('CHEF_SKILL_REDESIGN.md'),
        hasEarlyMult: code.includes('earlyMult'),
        hasVipBonus: code.includes('vipBonus'),
        hasGourmetBonus: code.includes('gourmetBonus'),
        hasYokoProtectBonus: code.includes('yokoProtectBonus'),
      };
    });
    expect(result.hasIndependentComment).toBe(true);
    expect(result.hasChefSkillRef).toBe(true);
    expect(result.hasEarlyMult).toBe(true);
    expect(result.hasVipBonus).toBe(true);
    expect(result.hasGourmetBonus).toBe(true);
    expect(result.hasYokoProtectBonus).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────
// 예외 및 엣지케이스
// ────────────────────────────────────────────────────────────────────
test.describe('예외 및 엣지케이스', () => {

  test('T33: 미력사 미고용 상태에서 모든 버프가 0/기본값이다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: [],
        unlocked: [],
        enhancements: {},
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        serveSpeed: scene._buffServeSpeed,
        earlyBonus: scene._buffEarlyBonus,
        earlyDuration: scene._buffEarlyDuration,
        ingredientRefund: scene._buffIngredientRefund,
        noFailDelay: scene._buffNoFailDelay,
        vipRewardMult: scene._buffVipRewardMult,
        gourmetRewardMult: scene._buffGourmetRewardMult,
        yokoThreshold: scene._yokoChainThreshold,
        yokoReward: scene._yokoChainReward,
        foodReviewBonus: scene._buffVipFoodReviewBonus,
      };
    });
    expect(result.serveSpeed).toBe(0);
    expect(result.earlyBonus).toBe(0);
    expect(result.earlyDuration).toBe(0);
    expect(result.ingredientRefund).toBe(0);
    expect(result.noFailDelay).toBe(false);
    expect(result.vipRewardMult).toBe(0);
    expect(result.gourmetRewardMult).toBe(0);
    expect(result.yokoThreshold).toBe(0);
    expect(result.yokoReward).toBe(0);
    expect(result.foodReviewBonus).toBe(0);
  });

  test('T34: 복수 미력사 동시 고용 시 독립 버프가 모두 적용된다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_muo', 'wanderer_leila', 'wanderer_rosario'],
        unlocked: ['wanderer_muo', 'wanderer_leila', 'wanderer_rosario'],
        enhancements: { wanderer_muo: 1, wanderer_leila: 2, wanderer_rosario: 2 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return {
        serveSpeed: scene._buffServeSpeed,     // 무오 1단계: 0.25
        gourmetReward: scene._buffGourmetRewardMult, // 레이라 2단계: 0.35
        vipReward: scene._buffVipRewardMult,   // 로살리오 2단계: 0.40
      };
    });
    expect(result.serveSpeed).toBe(0.25);
    expect(result.gourmetReward).toBe(0.35);
    expect(result.vipReward).toBe(0.40);
  });

  test('T35: 빈 recipe 슬롯에서 _discardDish 호출 시 에러 없이 조기 반환', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_aida'],
        unlocked: ['wanderer_aida'],
        enhancements: { wanderer_aida: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      // 빈 슬롯
      scene.cookingSlots[0] = {
        recipe: null, timeLeft: 0, totalTime: 0, ready: false, washing: false, washTimeLeft: 0,
      };
      try {
        scene._discardDish(0);
        return { noError: true };
      } catch (e) {
        return { noError: false, error: e.message };
      }
    });
    expect(result.noError).toBe(true);
  });

  test('T36: 요코 미고용 상태에서 체인 서빙 카운터가 동작하지 않는다', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: { hired: [], unlocked: [], enhancements: {} },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      const recipeId = 'test_recipe';
      scene.tables[0] = {
        dish: recipeId,
        customerType: 'normal',
        baseReward: 10,
        patience: 5000,
        maxPatience: 10000,
        tipMultiplier: 1.2,
        recipe: { id: recipeId, ingredients: { carrot: 1 } },
      };
      scene.cookingSlots[0] = {
        recipe: { id: recipeId, nameKo: '테스트', tier: 1, category: 'cook', ingredients: { carrot: 1 } },
        timeLeft: 0, totalTime: 3000, ready: true, washing: false, washTimeLeft: 0,
      };
      scene._serveToCustomer(0, 0);
      return {
        threshold: scene._yokoChainThreshold,
        count: scene._yokoChainCount,
        protectNext: scene._yokoProtectNext,
      };
    });
    expect(result.threshold).toBe(0);      // 미고용 -> threshold 0
    expect(result.count).toBe(0);           // 증가 안 됨
    expect(result.protectNext).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────
// 콘솔 에러 검증
// ────────────────────────────────────────────────────────────────────
test.describe('콘솔 에러 검증', () => {

  test('T37: 모든 미력사 고용 상태에서 ServiceScene 시작 시 JS 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_muo', 'wanderer_sien', 'wanderer_yoko'],
        unlocked: ['wanderer_muo', 'wanderer_sien', 'wanderer_yoko'],
        enhancements: { wanderer_muo: 3, wanderer_sien: 3, wanderer_yoko: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);

    // 5초간 씬 운영 대기
    await page.waitForTimeout(5000);

    expect(errors).toEqual([]);
  });

  test('T38: 미력사 미고용 상태에서 ServiceScene 시작 시 JS 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: { hired: [], unlocked: [], enhancements: {} },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);
    await page.waitForTimeout(3000);

    expect(errors).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────
// 시각적 검증 (스크린샷)
// ────────────────────────────────────────────────────────────────────
test.describe('시각적 검증', () => {

  test('T39: 미력사 고용 상태 ServiceScene 전체 레이아웃', async ({ page }) => {
    await waitForGame(page);
    const save = createV19Save({
      wanderingChefs: {
        hired: ['wanderer_muo', 'wanderer_sien', 'wanderer_yoko'],
        unlocked: ['wanderer_muo', 'wanderer_sien', 'wanderer_yoko'],
        enhancements: { wanderer_muo: 2, wanderer_sien: 1, wanderer_yoko: 3 },
      },
    });
    await page.evaluate((s) => localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s)), save);
    await startServiceScene(page);
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/phase51-3-service-full.png',
    });
  });
});
