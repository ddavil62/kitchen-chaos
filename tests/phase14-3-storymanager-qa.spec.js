/**
 * @fileoverview Phase 14-3 StoryManager QA 검증 테스트.
 * StoryManager 중앙화, storyData 트리거, SaveManager v11 마이그레이션 검증.
 */
import { test, expect } from '@playwright/test';

// 에셋 로드가 많아 120s 타임아웃
test.setTimeout(120000);

// ── 헬퍼 ──

/** Phaser 게임 준비 대기 (BootScene preload 완료 후 아무 씬 활성) */
async function waitForGame(page, timeout = 90000) {
  await page.waitForFunction(() => {
    const g = window.__game;
    if (!g || !g.scene) return false;
    return g.scene.scenes.some(s => s.scene.isActive());
  }, { timeout });
}

/** 씬이 활성화될 때까지 대기 */
async function waitForScene(page, sceneKey, timeout = 15000) {
  await page.waitForFunction((key) => {
    const g = window.__game;
    if (!g || !g.scene) return false;
    const s = g.scene.getScene(key);
    return s && s.scene.isActive();
  }, sceneKey, { timeout });
}

/** 씬으로 직접 전환 */
async function startScene(page, sceneKey, data = {}) {
  await page.evaluate(({ key, d }) => {
    const g = window.__game;
    const active = g.scene.scenes.find(s => s.scene.isActive());
    if (active) {
      active.scene.start(key, d);
    }
  }, { key: sceneKey, d: data });
}

/** localStorage 초기화 (새 게임) */
async function clearSave(page) {
  await page.evaluate(() => localStorage.removeItem('kitchenChaosTycoon_save'));
}

/** 세이브 데이터 직접 주입 */
async function injectSave(page, saveData) {
  await page.evaluate((data) => {
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(data));
  }, saveData);
}

/** DialogueScene 활성 여부 확인 */
async function isDialogueActive(page) {
  return page.evaluate(() => {
    const g = window.__game;
    const ds = g.scene.getScene('DialogueScene');
    return ds && ds.scene.isActive();
  });
}

/** DialogueScene 탭 (대화 진행) */
async function tapDialogue(page) {
  await page.evaluate(() => {
    const ds = window.__game.scene.getScene('DialogueScene');
    if (ds && ds.scene.isActive()) ds._onTap();
  });
}

/** 대화 전체 스킵 (탭으로 빠르게 넘기기) */
async function skipDialogue(page) {
  for (let i = 0; i < 60; i++) {
    const still = await isDialogueActive(page);
    if (!still) break;
    await tapDialogue(page);
    await page.waitForTimeout(60);
  }
}

/** 기본 v11 세이브 템플릿 */
function makeV11Save(overrides = {}) {
  return {
    version: 11,
    stages: {},
    seenDialogues: [],
    storyProgress: { currentChapter: 1, storyFlags: [] },
    kitchenCoins: 0,
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
    soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
    gold: 0,
    tools: {
      pan: { count: 2, level: 1 }, salt: { count: 0, level: 1 },
      grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 },
    },
    tutorialMerchant: false, tutorialDone: false, tutorialBattle: false,
    tutorialService: false, tutorialShop: false, tutorialEndless: false,
    endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    ...overrides,
  };
}


// ══════════════════════════════════════════════════════════
// 1. 코드 정적 검증
// ══════════════════════════════════════════════════════════

test.describe('Phase 14-3 StoryManager 코드 검증', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await clearSave(page);
  });

  test('StoryManager 클래스가 로드되고 필수 메서드를 export한다', async ({ page }) => {
    const methods = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      return {
        checkTriggers: typeof StoryManager.checkTriggers,
        advanceChapter: typeof StoryManager.advanceChapter,
        setFlag: typeof StoryManager.setFlag,
        hasFlag: typeof StoryManager.hasFlag,
        getProgress: typeof StoryManager.getProgress,
      };
    });
    expect(methods.checkTriggers).toBe('function');
    expect(methods.advanceChapter).toBe('function');
    expect(methods.setFlag).toBe('function');
    expect(methods.hasFlag).toBe('function');
    expect(methods.getProgress).toBe('function');
  });

  test('STORY_TRIGGERS 배열이 export되고 필수 트리거를 포함한다', async ({ page }) => {
    const info = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      return {
        isArray: Array.isArray(STORY_TRIGGERS),
        length: STORY_TRIGGERS.length,
        dialogueIds: STORY_TRIGGERS.map(t => t.dialogueId),
        triggerPoints: [...new Set(STORY_TRIGGERS.map(t => t.triggerPoint))],
      };
    });
    expect(info.isArray).toBe(true);
    expect(info.length).toBeGreaterThanOrEqual(11);

    expect(info.triggerPoints).toContain('worldmap_enter');
    expect(info.triggerPoints).toContain('merchant_enter');
    expect(info.triggerPoints).toContain('gathering_enter');
    expect(info.triggerPoints).toContain('result_clear');
    expect(info.triggerPoints).toContain('result_market_failed');

    const requiredIds = [
      'intro_welcome', 'chapter2_intro', 'mage_introduction', 'mage_research_hint',
      'merchant_first_meet', 'poco_discount_fail', 'stage_boss_warning',
      'stage_first_clear', 'rin_first_meet', 'chapter3_rin_joins', 'after_first_loss',
    ];
    for (const id of requiredIds) {
      expect(info.dialogueIds).toContain(id);
    }
  });

  test('STORY_TRIGGERS에서 1-6 특수 조건이 일반 stage_first_clear보다 앞에 위치한다', async ({ page }) => {
    const indices = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      const resultClear = STORY_TRIGGERS.filter(t => t.triggerPoint === 'result_clear');
      const specialIdx = resultClear.findIndex(t =>
        t.dialogueId === 'stage_first_clear' && t.chain?.dialogueId === 'chapter1_clear'
      );
      const generalIdx = resultClear.findIndex(t =>
        t.dialogueId === 'stage_first_clear' && !t.chain
      );
      return { specialIdx, generalIdx };
    });
    expect(indices.specialIdx).toBeLessThan(indices.generalIdx);
  });

  test('SaveManager SAVE_VERSION이 11이다', async ({ page }) => {
    const version = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.load().version;
    });
    expect(version).toBe(11);
  });

  test('createDefault()에 storyProgress 필드가 존재한다', async ({ page }) => {
    const sp = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.load().storyProgress;
    });
    expect(sp).toBeDefined();
    expect(sp.currentChapter).toBe(1);
    expect(sp.storyFlags).toEqual([]);
  });
});


// ══════════════════════════════════════════════════════════
// 2. SaveManager v10 -> v11 마이그레이션 검증
// ══════════════════════════════════════════════════════════

test.describe('SaveManager v10 -> v11 마이그레이션', () => {

  test('v10 세이브 로드 시 storyProgress가 자동 주입된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, {
      version: 10, stages: { '1-1': { cleared: true, stars: 2 } },
      seenDialogues: [], kitchenCoins: 100,
      upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
      unlockedRecipes: [], selectedChef: null, completedOrders: [], cookingSlots: 2,
      bestSatisfaction: {}, tableUpgrades: [0, 0, 0, 0], unlockedTables: 4,
      interiors: { flower: 0, kitchen: 0, lighting: 0 },
      staff: { waiter: false, dishwasher: false },
      soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
      gold: 50,
      tools: { pan: { count: 2, level: 1 }, salt: { count: 0, level: 1 }, grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 }, freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 } },
      tutorialMerchant: false, tutorialDone: true, tutorialBattle: true,
      tutorialService: false, tutorialShop: false, tutorialEndless: false,
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const data = SaveManager.load();
      return { version: data.version, sp: data.storyProgress, coins: data.kitchenCoins };
    });
    expect(result.version).toBe(11);
    expect(result.sp).toBeDefined();
    expect(result.sp.currentChapter).toBe(1);
    expect(result.sp.storyFlags).toEqual([]);
    expect(result.coins).toBe(100);
  });

  test('v10 세이브에 chapter2_intro 시청 -> currentChapter=2 추론', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, {
      version: 10, stages: {},
      seenDialogues: ['intro_welcome', 'chapter1_start', 'chapter2_intro'],
      kitchenCoins: 0, upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
      unlockedRecipes: [], selectedChef: null, completedOrders: [], cookingSlots: 2,
      bestSatisfaction: {}, tableUpgrades: [0, 0, 0, 0], unlockedTables: 4,
      interiors: { flower: 0, kitchen: 0, lighting: 0 },
      staff: { waiter: false, dishwasher: false },
      soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
      gold: 0,
      tools: { pan: { count: 2, level: 1 }, salt: { count: 0, level: 1 }, grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 }, freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 } },
      tutorialMerchant: false, tutorialDone: false, tutorialBattle: false,
      tutorialService: false, tutorialShop: false, tutorialEndless: false,
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    });

    const ch = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.load().storyProgress.currentChapter;
    });
    expect(ch).toBe(2);
  });

  test('v10 세이브에 chapter3_rin_joins 시청 -> currentChapter=3 추론', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, {
      version: 10, stages: {},
      seenDialogues: ['intro_welcome', 'chapter3_rin_joins'],
      kitchenCoins: 0, upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
      unlockedRecipes: [], selectedChef: null, completedOrders: [], cookingSlots: 2,
      bestSatisfaction: {}, tableUpgrades: [0, 0, 0, 0], unlockedTables: 4,
      interiors: { flower: 0, kitchen: 0, lighting: 0 },
      staff: { waiter: false, dishwasher: false },
      soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
      gold: 0,
      tools: { pan: { count: 2, level: 1 }, salt: { count: 0, level: 1 }, grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 }, freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 } },
      tutorialMerchant: false, tutorialDone: false, tutorialBattle: false,
      tutorialService: false, tutorialShop: false, tutorialEndless: false,
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    });

    const ch = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.load().storyProgress.currentChapter;
    });
    expect(ch).toBe(3);
  });

  test('v10 세이브에 rin_first_meet만 -> currentChapter=2 추론', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, {
      version: 10, stages: {},
      seenDialogues: ['intro_welcome', 'rin_first_meet'],
      kitchenCoins: 0, upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
      unlockedRecipes: [], selectedChef: null, completedOrders: [], cookingSlots: 2,
      bestSatisfaction: {}, tableUpgrades: [0, 0, 0, 0], unlockedTables: 4,
      interiors: { flower: 0, kitchen: 0, lighting: 0 },
      staff: { waiter: false, dishwasher: false },
      soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
      gold: 0,
      tools: { pan: { count: 2, level: 1 }, salt: { count: 0, level: 1 }, grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 }, freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 } },
      tutorialMerchant: false, tutorialDone: false, tutorialBattle: false,
      tutorialService: false, tutorialShop: false, tutorialEndless: false,
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    });

    const ch = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.load().storyProgress.currentChapter;
    });
    expect(ch).toBe(2);
  });
});


// ══════════════════════════════════════════════════════════
// 3. StoryManager 기능 단위 테스트
// ══════════════════════════════════════════════════════════

test.describe('StoryManager 기능 검증', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await clearSave(page);
  });

  test('getProgress()가 기본값을 올바르게 반환한다', async ({ page }) => {
    const p = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      return StoryManager.getProgress();
    });
    expect(p.currentChapter).toBe(1);
    expect(p.storyFlags).toEqual([]);
    expect(p.seenDialogues).toEqual([]);
  });

  test('setFlag / hasFlag가 정상 동작한다', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      const before = StoryManager.hasFlag('test_flag');
      StoryManager.setFlag('test_flag');
      const after = StoryManager.hasFlag('test_flag');
      StoryManager.setFlag('test_flag'); // 중복
      const count = StoryManager.getProgress().storyFlags.filter(f => f === 'test_flag').length;
      return { before, after, count };
    });
    expect(r.before).toBe(false);
    expect(r.after).toBe(true);
    expect(r.count).toBe(1);
  });

  test('advanceChapter(1-1)이 currentChapter를 변경하지 않는다', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      const before = StoryManager.getProgress().currentChapter;
      StoryManager.advanceChapter('1-1');
      return { before, after: StoryManager.getProgress().currentChapter };
    });
    expect(r.before).toBe(1);
    expect(r.after).toBe(1);
  });

  test('advanceChapter(2-1)이 currentChapter를 2로 갱신한다', async ({ page }) => {
    const ch = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      StoryManager.advanceChapter('2-1');
      return StoryManager.getProgress().currentChapter;
    });
    expect(ch).toBe(2);
  });

  test('advanceChapter는 더 낮은 챕터로 역행하지 않는다', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      StoryManager.advanceChapter('3-1');
      const at3 = StoryManager.getProgress().currentChapter;
      StoryManager.advanceChapter('1-1');
      return { at3, after: StoryManager.getProgress().currentChapter };
    });
    expect(r.at3).toBe(3);
    expect(r.after).toBe(3);
  });

  test('advanceChapter에 비정상 stageId 전달 시 에러 없음', async ({ page }) => {
    const ch = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      StoryManager.advanceChapter('99-99');
      StoryManager.advanceChapter('');
      StoryManager.advanceChapter(null);
      StoryManager.advanceChapter(undefined);
      return StoryManager.getProgress().currentChapter;
    });
    expect(ch).toBe(1);
  });

  test('setFlag에 빈 문자열도 에러 없이 처리', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      StoryManager.setFlag('');
      return StoryManager.hasFlag('');
    });
    expect(r).toBe(true);
  });
});


// ══════════════════════════════════════════════════════════
// 4. 대화 트리거 동작 검증
// ══════════════════════════════════════════════════════════

test.describe('대화 트리거 동작 검증', () => {

  test('신규 게임: WorldMap 진입 시 intro_welcome 자동 트리거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await clearSave(page);

    await startScene(page, 'WorldMapScene');
    await waitForScene(page, 'WorldMapScene');
    await page.waitForTimeout(500);

    const active = await isDialogueActive(page);
    expect(active).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/phase14-3-worldmap-dialogue.png' });
  });

  test('intro_welcome 완료 후 chapter1_start 연쇄 트리거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await clearSave(page);

    await startScene(page, 'WorldMapScene');
    await waitForScene(page, 'WorldMapScene');
    await page.waitForTimeout(500);

    // intro_welcome 스킵
    await skipDialogue(page);
    await page.waitForTimeout(500);

    // chain 확인
    const seen = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      return raw ? JSON.parse(raw).seenDialogues : [];
    });
    expect(seen).toContain('intro_welcome');

    // chapter1_start가 chain으로 시작되었을 수 있음
    const chainActive = await isDialogueActive(page);
    if (chainActive) {
      await page.screenshot({ path: 'tests/screenshots/phase14-3-chapter1-chain.png' });
      await skipDialogue(page);
      await page.waitForTimeout(300);
    }

    const seenAfter = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      return raw ? JSON.parse(raw).seenDialogues : [];
    });
    expect(seenAfter).toContain('intro_welcome');
    expect(seenAfter).toContain('chapter1_start');
  });

  test('이미 본 대화는 재생되지 않는다 (once: true)', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      seenDialogues: ['intro_welcome', 'chapter1_start'],
    }));

    await startScene(page, 'WorldMapScene');
    await waitForScene(page, 'WorldMapScene');
    await page.waitForTimeout(800);

    const active = await isDialogueActive(page);
    expect(active).toBe(false);
  });

  test('MerchantScene 최초 방문 시 merchant_first_meet 트리거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      stages: { '1-1': { cleared: true, stars: 2 } },
      seenDialogues: ['intro_welcome', 'chapter1_start'],
      gold: 50,
      tutorialMerchant: true, tutorialDone: true, tutorialBattle: true,
      tutorialService: true, tutorialShop: true,
    }));

    await startScene(page, 'MerchantScene', {
      stageId: '1-1',
      marketResult: { totalIngredients: 10, livesRemaining: 5, livesMax: 15 },
      serviceResult: { servedCount: 5, totalCustomers: 8, goldEarned: 100, tipEarned: 20, maxCombo: 3, satisfaction: 85 },
      isMarketFailed: false,
    });
    await waitForScene(page, 'MerchantScene');
    await page.waitForTimeout(500);

    const active = await isDialogueActive(page);
    expect(active).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/phase14-3-merchant-dialogue.png' });
  });

  test('2회차 MerchantScene 방문 시 poco_discount_fail 트리거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      stages: { '1-1': { cleared: true, stars: 2 } },
      seenDialogues: ['intro_welcome', 'chapter1_start', 'merchant_first_meet'],
      gold: 50,
      tutorialMerchant: true, tutorialDone: true, tutorialBattle: true,
      tutorialService: true, tutorialShop: true,
    }));

    await startScene(page, 'MerchantScene', {
      stageId: '1-1',
      marketResult: { totalIngredients: 10, livesRemaining: 5, livesMax: 15 },
      serviceResult: { servedCount: 5, totalCustomers: 8, goldEarned: 100, tipEarned: 20, maxCombo: 3, satisfaction: 85 },
      isMarketFailed: false,
    });
    await waitForScene(page, 'MerchantScene');
    await page.waitForTimeout(500);

    const active = await isDialogueActive(page);
    expect(active).toBe(true);

    await skipDialogue(page);
    await page.waitForTimeout(300);

    const seen = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      return raw ? JSON.parse(raw).seenDialogues : [];
    });
    expect(seen).toContain('poco_discount_fail');
  });

  test('ResultScene에서 advanceChapter 호출 (2-1 클리어 -> chapter 2)', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      stages: {
        '1-1': { cleared: true, stars: 3 }, '1-2': { cleared: true, stars: 3 },
        '1-3': { cleared: true, stars: 3 }, '1-4': { cleared: true, stars: 3 },
        '1-5': { cleared: true, stars: 3 }, '1-6': { cleared: true, stars: 3 },
      },
      seenDialogues: ['intro_welcome', 'chapter1_start', 'merchant_first_meet', 'stage_first_clear'],
      gold: 100, kitchenCoins: 50,
      tutorialMerchant: true, tutorialDone: true, tutorialBattle: true,
      tutorialService: true, tutorialShop: true,
    }));

    await startScene(page, 'ResultScene', {
      stageId: '2-1',
      marketResult: { totalIngredients: 15, livesRemaining: 10, livesMax: 15 },
      serviceResult: { servedCount: 8, totalCustomers: 10, goldEarned: 200, tipEarned: 50, maxCombo: 5, satisfaction: 90 },
      isMarketFailed: false,
    });
    await waitForScene(page, 'ResultScene');
    await page.waitForTimeout(500);

    const ch = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      return raw ? JSON.parse(raw).storyProgress?.currentChapter : null;
    });
    expect(ch).toBe(2);
  });
});


// ══════════════════════════════════════════════════════════
// 5. 엣지케이스 및 예외 시나리오
// ══════════════════════════════════════════════════════════

test.describe('엣지케이스 및 예외 시나리오', () => {

  test('checkTriggers에 존재하지 않는 triggerPoint 전달 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await clearSave(page);

    await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      const scene = window.__game.scene.scenes.find(s => s.scene.isActive());
      StoryManager.checkTriggers(scene, 'nonexistent_trigger', {});
      StoryManager.checkTriggers(scene, '', {});
    });

    expect(errors.length).toBe(0);
  });

  test('storyProgress 누락 세이브에서 StoryManager 안전 동작', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    const save = makeV11Save();
    delete save.storyProgress;
    await injectSave(page, save);

    const r = await page.evaluate(async () => {
      const { StoryManager } = await import('/js/managers/StoryManager.js');
      StoryManager.setFlag('test');
      StoryManager.advanceChapter('2-1');
      return {
        chapter: StoryManager.getProgress().currentChapter,
        hasFlag: StoryManager.hasFlag('test'),
      };
    });
    expect(r.chapter).toBe(2);
    expect(r.hasFlag).toBe(true);
  });

  test('GatheringScene 보스 스테이지 경고 (x-6 패턴)', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      stages: {
        '1-1': { cleared: true, stars: 3 }, '1-2': { cleared: true, stars: 3 },
        '1-3': { cleared: true, stars: 3 }, '1-4': { cleared: true, stars: 3 },
        '1-5': { cleared: true, stars: 3 },
      },
      seenDialogues: ['intro_welcome', 'chapter1_start', 'merchant_first_meet', 'stage_first_clear'],
      selectedChef: 'petit_chef',
      gold: 100, kitchenCoins: 50,
      tutorialMerchant: true, tutorialDone: true, tutorialBattle: true,
      tutorialService: true, tutorialShop: true,
    }));

    await startScene(page, 'GatheringScene', { stageId: '1-6' });
    await waitForScene(page, 'GatheringScene');
    await page.waitForTimeout(800); // delay: 400ms + buffer

    const active = await isDialogueActive(page);
    expect(active).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/phase14-3-boss-warning.png' });
  });

  test('장보기 실패 시 after_first_loss 트리거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      seenDialogues: ['intro_welcome', 'chapter1_start'],
      tutorialDone: true, tutorialBattle: true, tutorialService: true, tutorialShop: true,
    }));

    await startScene(page, 'ResultScene', {
      stageId: '1-1',
      marketResult: { totalIngredients: 2, livesRemaining: 0, livesMax: 15 },
      serviceResult: null,
      isMarketFailed: true,
    });
    await waitForScene(page, 'ResultScene');
    await page.waitForTimeout(1200); // delay: 800ms + buffer

    const active = await isDialogueActive(page);
    expect(active).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/phase14-3-market-failed.png' });
  });

  test('chapter2 조건: currentChapter >= 2일 때 chapter2_intro 트리거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    await injectSave(page, makeV11Save({
      stages: {
        '1-1': { cleared: true, stars: 3 }, '1-2': { cleared: true, stars: 3 },
        '1-3': { cleared: true, stars: 3 }, '1-4': { cleared: true, stars: 3 },
        '1-5': { cleared: true, stars: 3 }, '1-6': { cleared: true, stars: 3 },
      },
      seenDialogues: ['intro_welcome', 'chapter1_start', 'merchant_first_meet', 'stage_first_clear', 'chapter1_clear'],
      storyProgress: { currentChapter: 2, storyFlags: [] },
      kitchenCoins: 50,
      tutorialMerchant: true, tutorialDone: true, tutorialBattle: true,
      tutorialService: true, tutorialShop: true,
    }));

    await startScene(page, 'WorldMapScene');
    await waitForScene(page, 'WorldMapScene');
    await page.waitForTimeout(500);

    const active = await isDialogueActive(page);
    expect(active).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/phase14-3-chapter2-intro.png' });
  });
});


// ══════════════════════════════════════════════════════════
// 6. 콘솔 에러 + UI 안정성
// ══════════════════════════════════════════════════════════

test.describe('UI 안정성', () => {

  test('새 게임 WorldMap 대화 완료까지 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await clearSave(page);

    await startScene(page, 'WorldMapScene');
    await waitForScene(page, 'WorldMapScene');
    await page.waitForTimeout(500);

    await skipDialogue(page);
    await page.waitForTimeout(500);
    await skipDialogue(page);
    await page.waitForTimeout(500);

    const real = errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('Non-Error')
    );
    expect(real).toEqual([]);
  });

  test('모바일 뷰포트(375x667) 정상 로드', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForGame(page);
    await page.screenshot({ path: 'tests/screenshots/phase14-3-mobile.png' });

    const running = await page.evaluate(() => window.__game?.isRunning);
    expect(running).toBe(true);
  });
});


// ══════════════════════════════════════════════════════════
// 7. storyData.js 확장성 검증
// ══════════════════════════════════════════════════════════

test.describe('storyData.js 확장성', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('모든 트리거의 condition이 함수 타입이다', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      return STORY_TRIGGERS.filter(t => typeof t.condition !== 'function').length;
    });
    expect(r).toBe(0);
  });

  test('모든 트리거의 dialogueId가 DIALOGUES에 존재한다', async ({ page }) => {
    const missing = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      const { DIALOGUES } = await import('/js/data/dialogueData.js');
      const ids = new Set();
      STORY_TRIGGERS.forEach(t => {
        ids.add(t.dialogueId);
        if (t.chain?.dialogueId) ids.add(t.chain.dialogueId);
      });
      return [...ids].filter(id => !DIALOGUES[id]);
    });
    expect(missing).toEqual([]);
  });

  test('모든 condition이 빈 인자로도 에러 없이 실행된다', async ({ page }) => {
    const errs = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      const errors = [];
      for (const t of STORY_TRIGGERS) {
        try {
          t.condition({}, { currentChapter: 1, storyFlags: [], seenDialogues: [] });
        } catch (e) {
          errors.push({ id: t.dialogueId, err: e.message });
        }
      }
      return errors;
    });
    expect(errs).toEqual([]);
  });
});
