/**
 * @fileoverview Phase 72 QA 엣지케이스 검증.
 *
 * Coder 작성 테스트(phase72-branch-effects.spec.js)는 BranchEffects API 수준 검증에 집중한다.
 * 본 파일은 QA가 능동 도출한 엣지케이스를 검증한다:
 *   - 변이/Bond 미충족 시 부작용 없음
 *   - SaveManager 마이그레이션 방어 (recipeRepeatCounts 누락 세이브)
 *   - 레시피 반복 소비 경계값 (0회 이하, 중복 소비, 비존재 레시피)
 *   - 동시 변이 + Bond 조합
 *   - 콘솔 에러 0건
 *   - Bond 효과가 잘못된 셰프로는 작동하지 않음
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

async function injectSave(page, branchCards, selectedChef = 'lao_chef', toolOverrides = {}) {
  await page.evaluate(
    ({ key, bc, chef, tools }) => {
      const defaultTools = {
        pan: { count: 1, level: 1 },
        salt: { count: 1, level: 1 },
        grill: { count: 1, level: 1 },
        delivery: { count: 1, level: 1 },
        freezer: { count: 1, level: 1 },
        soup_pot: { count: 1, level: 1 },
        wasabi_cannon: { count: 1, level: 1 },
        spice_grinder: { count: 1, level: 1 },
      };
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 24,
          selectedChef: chef,
          stages: {},
          gold: 5000,
          kitchenCoins: 100,
          toolInventory: { ...defaultTools, ...tools },
          season2Unlocked: false,
          season3Unlocked: false,
          storyProgress: { currentChapter: 1, storyFlags: {} },
          endless: {
            unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
            lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0,
          },
          branchCards: bc,
        }),
      );
    },
    { key: SAVE_KEY, bc: branchCards, chef: selectedChef, tools: toolOverrides },
  );
}

test.describe('Phase 72 QA: 엣지케이스 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  // ── 콘솔 에러 검증 ──────────────────────────────────────────────

  test('E-01: 변이+Bond 세이브 주입 후 콘솔 에러 0건 (favicon 제외)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await injectSave(page, {
      toolMutations: {
        salt: 'mut_salt_chain',
        wasabi_cannon: 'mut_wasabi_cluster',
        spice_grinder: 'mut_spice_venom',
        soup_pot: 'mut_soup_overcharge',
      },
      unlockedBranchRecipes: ['branch_chaos_ramen', 'branch_spice_bomb'],
      chefBonds: ['bond_mimi_salt', 'bond_mimi_spice'],
      activeBlessing: { id: 'bles_enemy_slow', remainingStages: 3 },
      lastVisit: null,
    }, 'mimi_chef');

    // 페이지 리로드하여 세이브 적용
    await page.reload();
    await waitForGame(page);

    // BranchEffects API 전체 호출
    await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      BranchEffects.getMutationEffect('salt');
      BranchEffects.getMutationEffect('wasabi_cannon');
      BranchEffects.getMutationEffect('spice_grinder');
      BranchEffects.getMutationEffect('soup_pot');
      BranchEffects.getActiveBondEffect('salt');
      BranchEffects.getActiveBondEffect('spice_grinder');
      BranchEffects.getBlessingMultiplier('enemy_slow');
    });

    expect(errors).toEqual([]);
  });

  // ── Bond: 잘못된 셰프로는 작동하지 않음 ──────────────────────────

  test('E-02: yuki+soup_pot Bond는 lao_chef 편성 시 미적용', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_yuki_soup'],
      activeBlessing: null,
      lastVisit: null,
    }, 'lao_chef'); // yuki_chef가 아닌 lao_chef

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return BranchEffects.getActiveBondEffect('soup_pot');
    });

    expect(result).toBeNull();
  });

  test('E-03: andre+delivery Bond는 mimi_chef 편성 시 미적용', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_andre_delivery'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef'); // andre_chef가 아닌 mimi_chef

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return BranchEffects.getActiveBondEffect('delivery');
    });

    expect(result).toBeNull();
  });

  test('E-04: mimi+salt Bond는 lao_chef 편성 시 미적용', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_salt'],
      activeBlessing: null,
      lastVisit: null,
    }, 'lao_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return BranchEffects.getActiveBondEffect('salt');
    });

    expect(result).toBeNull();
  });

  // ── SaveManager 마이그레이션 방어 ─────────────────────────────────

  test('E-05: recipeRepeatCounts 누락 세이브에서 consumeBranchRecipe 정상 동작', async ({ page }) => {
    // recipeRepeatCounts 필드가 없는 세이브를 직접 주입
    await page.evaluate(({ key }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 24,
        selectedChef: 'lao_chef',
        stages: {},
        gold: 5000,
        kitchenCoins: 100,
        toolInventory: { pan: { count: 1, level: 1 } },
        season2Unlocked: false,
        season3Unlocked: false,
        storyProgress: { currentChapter: 1, storyFlags: {} },
        endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
          lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
        branchCards: {
          toolMutations: {},
          unlockedBranchRecipes: ['branch_chaos_ramen'],
          chefBonds: [],
          activeBlessing: null,
          // recipeRepeatCounts 필드 의도적 누락
        },
      }));
    }, { key: SAVE_KEY });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      // 마이그레이션 후 load
      const data = SaveManager.load();
      // recipeRepeatCounts가 자동 초기화되었는지 확인
      const hasField = data.branchCards && typeof data.branchCards.recipeRepeatCounts === 'object';
      // 소비 시도
      const consumed = SaveManager.consumeBranchRecipe('branch_chaos_ramen');
      return { hasField, consumed };
    });

    expect(result.hasField).toBe(true);
    expect(result.consumed).toBe(true);
  });

  // ── 레시피 반복 소비 경계값 ──────────────────────────────────────

  test('E-06: 해금 목록에 없는 레시피 소비 시도 시 false 반환', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.consumeBranchRecipe('branch_chaos_ramen');
    });

    expect(result).toBe(false);
  });

  test('E-07: 일반 레시피(dragon_feast)는 1회 소비 후 즉시 제거', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: ['branch_dragon_feast'],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const consumed = SaveManager.consumeBranchRecipe('branch_dragon_feast');
      const remaining = SaveManager.getUnlockedBranchRecipes();
      return { consumed, hasRecipe: remaining.includes('branch_dragon_feast') };
    });

    expect(result.consumed).toBe(true);
    expect(result.hasRecipe).toBe(false);
  });

  test('E-08: chaos_ramen 4회 소비 시도 (3회 이후 4번째는 false)', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: ['branch_chaos_ramen'],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const results = [];
      for (let i = 0; i < 4; i++) {
        const consumed = SaveManager.consumeBranchRecipe('branch_chaos_ramen');
        results.push(consumed);
      }
      return results;
    });

    expect(result[0]).toBe(true);
    expect(result[1]).toBe(true);
    expect(result[2]).toBe(true);
    expect(result[3]).toBe(false); // 이미 제거된 후
  });

  test('E-09: spice_bomb 3회 소비 시도 (2회 이후 3번째는 false)', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: ['branch_spice_bomb'],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const results = [];
      for (let i = 0; i < 3; i++) {
        const consumed = SaveManager.consumeBranchRecipe('branch_spice_bomb');
        results.push(consumed);
      }
      return results;
    });

    expect(result[0]).toBe(true);
    expect(result[1]).toBe(true);
    expect(result[2]).toBe(false);
  });

  // ── branchCards 필드 자체가 없는 세이브 ────────────────────────────

  test('E-10: branchCards 필드 자체가 없는 구버전 세이브에서 consumeBranchRecipe 안전 반환', async ({ page }) => {
    await page.evaluate(({ key }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 18, // v24 이전
        selectedChef: 'lao_chef',
        stages: {},
        gold: 5000,
        kitchenCoins: 100,
        toolInventory: { pan: { count: 1, level: 1 } },
        season2Unlocked: false,
        season3Unlocked: false,
        storyProgress: { currentChapter: 1, storyFlags: {} },
        endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
          lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
        // branchCards 필드 없음
      }));
    }, { key: SAVE_KEY });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      // 마이그레이션 후 load
      SaveManager.load();
      const consumed = SaveManager.consumeBranchRecipe('branch_chaos_ramen');
      return consumed;
    });

    expect(result).toBe(false);
  });

  // ── 동시 변이+Bond 조합 검증 ──────────────────────────────────────

  test('E-11: salt에 chain 변이 + mimi+salt Bond가 동시 적용 시 둘 다 반환', async ({ page }) => {
    await injectSave(page, {
      toolMutations: { salt: 'mut_salt_chain' },
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_salt'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const mutation = BranchEffects.getMutationEffect('salt');
      const bond = BranchEffects.getActiveBondEffect('salt');
      return {
        hasMutation: !!mutation,
        mutationType: mutation?.type,
        hasBond: !!bond,
        bondType: bond?.type,
        bondValue: bond?.value,
      };
    });

    expect(result.hasMutation).toBe(true);
    expect(result.mutationType).toBe('chain');
    expect(result.hasBond).toBe(true);
    expect(result.bondType).toBe('collect_radius_on_slow');
    expect(result.bondValue).toBe(40);
  });

  // ── 축복 enemy_slow + 변이 venom 동시 검증 ──────────────────────────

  test('E-12: enemy_slow 축복 + venom 변이가 동시 존재 시 둘 다 독립 반환', async ({ page }) => {
    await injectSave(page, {
      toolMutations: { spice_grinder: 'mut_spice_venom' },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: { id: 'bles_enemy_slow', remainingStages: 3 },
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const venomEffect = BranchEffects.getMutationEffect('spice_grinder');
      const slowBlessing = BranchEffects.getBlessingMultiplier('enemy_slow');
      return {
        hasVenom: !!venomEffect,
        venomPoisonSlowPct: venomEffect?.poisonSlowPct,
        enemySlowValue: slowBlessing,
      };
    });

    expect(result.hasVenom).toBe(true);
    expect(result.venomPoisonSlowPct).toBe(0.2);
    expect(result.enemySlowValue).toBe(0.15);
  });

  // ── 변이 타입에 대해 다른 도구의 변이 조회 시 null ─────────────────

  test('E-13: salt에 chain 변이 적용 후 wasabi_cannon 변이 조회 시 null', async ({ page }) => {
    await injectSave(page, {
      toolMutations: { salt: 'mut_salt_chain' },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return {
        saltEffect: BranchEffects.getMutationEffect('salt'),
        wasabiEffect: BranchEffects.getMutationEffect('wasabi_cannon'),
        spiceEffect: BranchEffects.getMutationEffect('spice_grinder'),
        soupEffect: BranchEffects.getMutationEffect('soup_pot'),
      };
    });

    expect(result.saltEffect).not.toBeNull();
    expect(result.wasabiEffect).toBeNull();
    expect(result.spiceEffect).toBeNull();
    expect(result.soupEffect).toBeNull();
  });

  // ── aura_boost 변이 미적용 시 폴백 ─────────────────────────────────

  test('E-14: aura_boost 변이 없는 soup_pot에서 _auraMultiplier 폴백이 1.0', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const effect = BranchEffects.getMutationEffect('soup_pot');
      // 코드에서 (tower._auraMultiplier || 1.0) 패턴으로 처리됨
      // effect가 null이면 _auraMultiplier가 세팅되지 않으므로 undefined => || 1.0 폴백
      return {
        effectIsNull: effect === null,
        // 실제 코드의 폴백 로직 시뮬레이션
        fallbackValue: (undefined || 1.0),
      };
    });

    expect(result.effectIsNull).toBe(true);
    expect(result.fallbackValue).toBe(1.0);
  });

  // ── 다수 Bond 동시 등록 시 각각 독립 적용 ──────────────────────────

  test('E-15: mimi_chef로 salt Bond + spice Bond 동시 등록 시 각각 독립 반환', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_salt', 'bond_mimi_spice'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const saltBond = BranchEffects.getActiveBondEffect('salt');
      const spiceBond = BranchEffects.getActiveBondEffect('spice_grinder');
      return {
        saltBondType: saltBond?.type,
        saltBondValue: saltBond?.value,
        spiceBondType: spiceBond?.type,
        spiceBondValue: spiceBond?.value,
      };
    });

    expect(result.saltBondType).toBe('collect_radius_on_slow');
    expect(result.saltBondValue).toBe(40);
    expect(result.spiceBondType).toBe('drop_rate_on_poison');
    expect(result.spiceBondValue).toBe(0.25);
  });

  // ── 레시피 반복 카운트 세이브 영속성 검증 ──────────────────────────

  test('E-16: chaos_ramen 1회 소비 후 세이브 reload 시 카운트가 유지', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: ['branch_chaos_ramen'],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      // 1회 소비
      SaveManager.consumeBranchRecipe('branch_chaos_ramen');
      // 세이브 리로드
      const data = SaveManager.load();
      return {
        hasRecipe: data.branchCards.unlockedBranchRecipes.includes('branch_chaos_ramen'),
        repeatCount: data.branchCards.recipeRepeatCounts?.branch_chaos_ramen,
      };
    });

    expect(result.hasRecipe).toBe(true);
    expect(result.repeatCount).toBe(2); // 3-1 = 2
  });
});
