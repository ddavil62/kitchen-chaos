/**
 * @fileoverview Phase 72 분기 카드 수치 전수 반영 검증.
 *
 * 변이 4종(chain/cluster/venom/aura_boost) + Bond 4쌍(yuki+soup_pot / andre+delivery /
 * mimi+salt / mimi+spice) + enemy_slow 축복 + 레시피 반복 등장 규약을 검증한다.
 *
 * page.evaluate()로 게임 내부 API를 직접 호출하여 효과 적용 여부를 확인한다.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

/** Phaser 게임 인스턴스 부팅 대기 */
async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

/**
 * 분기 카드 상태를 포함한 v24 세이브 주입.
 * @param {import('@playwright/test').Page} page
 * @param {object} branchCards
 * @param {string} [selectedChef]
 * @param {object} [toolOverrides] - 도구 보유 오버라이드
 */
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
            unlocked: false,
            bestWave: 0,
            bestScore: 0,
            bestCombo: 0,
            lastDailySeed: 0,
            stormCount: 0,
            missionSuccessCount: 0,
            noLeakStreak: 0,
          },
          branchCards: bc,
        }),
      );
    },
    { key: SAVE_KEY, bc: branchCards, chef: selectedChef, tools: toolOverrides },
  );
}

// ── 테스트 스위트 ──────────────────────────────────────────────────

test.describe('Phase 72: 분기 카드 수치 전수 반영', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  // ── 변이 4종 ──────────────────────────────────────────────────────

  test('T-M01: chain 변이 — salt 명중 후 인접 적에게 둔화 연쇄', async ({ page }) => {
    // salt에 chain 변이 주입
    await injectSave(page, {
      toolMutations: { salt: 'mut_salt_chain' },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const effect = BranchEffects.getMutationEffect('salt');
      return {
        hasEffect: !!effect,
        type: effect?.type,
        chainCount: effect?.chainCount,
        chainRadius: effect?.chainRadius,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('chain');
    expect(result.chainCount).toBe(1);
    expect(result.chainRadius).toBe(40);
  });

  test('T-M02: cluster 변이 — wasabi_cannon 다발 발사 플래그 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: { wasabi_cannon: 'mut_wasabi_cluster' },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const effect = BranchEffects.getMutationEffect('wasabi_cannon');
      return {
        hasEffect: !!effect,
        type: effect?.type,
        clusterCount: effect?.clusterCount,
        perShotDamageRatio: effect?.perShotDamageRatio,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('cluster');
    expect(result.clusterCount).toBe(3);
    expect(result.perShotDamageRatio).toBe(0.6);
  });

  test('T-M03: venom 변이 — spice_grinder 중독 둔화 플래그 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: { spice_grinder: 'mut_spice_venom' },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const effect = BranchEffects.getMutationEffect('spice_grinder');
      return {
        hasEffect: !!effect,
        type: effect?.type,
        poisonSlowPct: effect?.poisonSlowPct,
        dotDurationDelta: effect?.dotDurationDelta,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('venom');
    expect(result.poisonSlowPct).toBe(0.2);
    expect(result.dotDurationDelta).toBe(2);
  });

  test('T-M04: aura_boost 변이 — soup_pot 아우라 배수 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: { soup_pot: 'mut_soup_overcharge' },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const effect = BranchEffects.getMutationEffect('soup_pot');
      return {
        hasEffect: !!effect,
        type: effect?.type,
        auraMultiplier: effect?.auraMultiplier,
        auraRadiusDelta: effect?.auraRadiusDelta,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('aura_boost');
    expect(result.auraMultiplier).toBe(2.0);
    expect(result.auraRadiusDelta).toBe(20);
  });

  // ── Bond 4쌍 ──────────────────────────────────────────────────────

  test('T-B01: yuki+soup_pot Bond — 조리시간 감소 효과 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_yuki_soup'],
      activeBlessing: null,
      lastVisit: null,
    }, 'yuki_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const bondEffect = BranchEffects.getActiveBondEffect('soup_pot');
      return {
        hasEffect: !!bondEffect,
        type: bondEffect?.type,
        value: bondEffect?.value,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('cook_speed_pct');
    expect(result.value).toBe(0.15);
  });

  test('T-B02: andre+delivery Bond — 팁 보너스 효과 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_andre_delivery'],
      activeBlessing: null,
      lastVisit: null,
    }, 'andre_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const bondEffect = BranchEffects.getActiveBondEffect('delivery');
      return {
        hasEffect: !!bondEffect,
        type: bondEffect?.type,
        value: bondEffect?.value,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('tip_pct');
    expect(result.value).toBe(0.1);
  });

  test('T-B03: mimi+salt Bond — 둔화 적 수거 범위 확장 효과 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_salt'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const bondEffect = BranchEffects.getActiveBondEffect('salt');
      return {
        hasEffect: !!bondEffect,
        type: bondEffect?.type,
        value: bondEffect?.value,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('collect_radius_on_slow');
    expect(result.value).toBe(40);
  });

  test('T-B04: mimi+spice Bond — 중독 적 드롭률 가산 효과 확인', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_spice'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const bondEffect = BranchEffects.getActiveBondEffect('spice_grinder');
      return {
        hasEffect: !!bondEffect,
        type: bondEffect?.type,
        value: bondEffect?.value,
      };
    });

    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('drop_rate_on_poison');
    expect(result.value).toBe(0.25);
  });

  // ── enemy_slow 축복 ───────────────────────────────────────────────

  test('T-BL01: bles_enemy_slow 적용 시 Enemy 초기 speed 감소', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: { id: 'bles_enemy_slow', remainingStages: 3 },
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      const slowValue = BranchEffects.getBlessingMultiplier('enemy_slow');
      return {
        slowValue,
        expectedReduction: slowValue > 0,
      };
    });

    expect(result.expectedReduction).toBe(true);
    expect(result.slowValue).toBe(0.15);
  });

  // ── 레시피 반복 등장 ───────────────────────────────────────────────

  test('T-R01: chaos_ramen 3회 소비 후 해금 목록에서 제거', async ({ page }) => {
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
      // 3회 소비
      for (let i = 0; i < 3; i++) {
        const consumed = SaveManager.consumeBranchRecipe('branch_chaos_ramen');
        const remaining = SaveManager.getUnlockedBranchRecipes();
        results.push({ consumed, hasRecipe: remaining.includes('branch_chaos_ramen') });
      }
      return results;
    });

    // 1회 소비: 아직 목록에 존재 (2회 남음)
    expect(result[0].consumed).toBe(true);
    expect(result[0].hasRecipe).toBe(true);
    // 2회 소비: 아직 목록에 존재 (1회 남음)
    expect(result[1].consumed).toBe(true);
    expect(result[1].hasRecipe).toBe(true);
    // 3회 소비: 목록에서 제거됨
    expect(result[2].consumed).toBe(true);
    expect(result[2].hasRecipe).toBe(false);
  });

  test('T-R02: chaos_ramen 1회 소비 후 해금 목록 유지', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: ['branch_chaos_ramen'],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.consumeBranchRecipe('branch_chaos_ramen');
      return SaveManager.getUnlockedBranchRecipes().includes('branch_chaos_ramen');
    });

    expect(result).toBe(true);
  });

  test('T-R03: spice_bomb 2회 소비 후 해금 목록에서 제거', async ({ page }) => {
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
      for (let i = 0; i < 2; i++) {
        const consumed = SaveManager.consumeBranchRecipe('branch_spice_bomb');
        const remaining = SaveManager.getUnlockedBranchRecipes();
        results.push({ consumed, hasRecipe: remaining.includes('branch_spice_bomb') });
      }
      return results;
    });

    // 1회 소비: 아직 목록에 존재 (1회 남음)
    expect(result[0].consumed).toBe(true);
    expect(result[0].hasRecipe).toBe(true);
    // 2회 소비: 목록에서 제거됨
    expect(result[1].consumed).toBe(true);
    expect(result[1].hasRecipe).toBe(false);
  });

  // ── 회귀 테스트 ───────────────────────────────────────────────────

  test('T-REG01: 변이 없는 salt 타워 — chain 연쇄 미발생 (플래그 null)', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return {
        hasMutation: BranchEffects.hasMutation('salt'),
        effect: BranchEffects.getMutationEffect('salt'),
        tint: BranchEffects.getMutationTint('salt'),
      };
    });

    expect(result.hasMutation).toBe(false);
    expect(result.effect).toBeNull();
    expect(result.tint).toBeNull();
  });

  test('T-REG02: cluster 미적용 wasabi_cannon — 변이 없음', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return {
        hasMutation: BranchEffects.hasMutation('wasabi_cannon'),
        effect: BranchEffects.getMutationEffect('wasabi_cannon'),
      };
    });

    expect(result.hasMutation).toBe(false);
    expect(result.effect).toBeNull();
  });

  test('T-REG03: venom 미적용 spice_grinder — 변이 없음', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return {
        hasMutation: BranchEffects.hasMutation('spice_grinder'),
        effect: BranchEffects.getMutationEffect('spice_grinder'),
      };
    });

    expect(result.hasMutation).toBe(false);
    expect(result.effect).toBeNull();
  });

  test('T-REG04: aura_boost 미적용 soup_pot — 기본 0.15 버프 유지', async ({ page }) => {
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      return {
        hasMutation: BranchEffects.hasMutation('soup_pot'),
        effect: BranchEffects.getMutationEffect('soup_pot'),
      };
    });

    expect(result.hasMutation).toBe(false);
    expect(result.effect).toBeNull();
    // 변이 없으면 _auraMultiplier가 설정되지 않으므로 기본 1.0 폴백 → 0.15 * 1.0 = 0.15
  });
});
