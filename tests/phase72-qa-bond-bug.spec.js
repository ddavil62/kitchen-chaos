/**
 * @fileoverview Phase 72 QA: Bond-only (변이 없이) 시나리오 검증.
 *
 * _applyBondToTower()가 _applyMutationToTower() 내부에서 호출되는데,
 * 변이가 없으면 `if (!effect) return;`으로 인해 Bond 적용도 건너뛰는 문제가 있는지 검증.
 *
 * 결론: mimi+salt Bond는 tower flag(_collectRadiusOnSlow)에 의존하므로 변이 없으면 미적용.
 *       나머지 3쌍은 BranchEffects API를 직접 조회하므로 영향 없음.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

async function injectSave(page, branchCards, selectedChef = 'lao_chef') {
  await page.evaluate(
    ({ key, bc, chef }) => {
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
          toolInventory: defaultTools,
          season2Unlocked: false,
          season3Unlocked: false,
          storyProgress: { currentChapter: 1, storyFlags: {} },
          endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
            lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
          branchCards: bc,
        }),
      );
    },
    { key: SAVE_KEY, bc: branchCards, chef: selectedChef },
  );
}

test.describe('Phase 72 QA: Bond-only (변이 없이) 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('BUG-01: mimi+salt Bond만 있고 salt 변이 없을 때 — BranchEffects API는 정상 반환', async ({ page }) => {
    // Bond만 등록, 변이 없음
    await injectSave(page, {
      toolMutations: {},  // salt 변이 없음
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_salt'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      // BranchEffects API는 SaveManager에서 직접 조회하므로 정상 반환해야 함
      const bond = BranchEffects.getActiveBondEffect('salt');
      return {
        hasEffect: !!bond,
        type: bond?.type,
        value: bond?.value,
      };
    });

    // BranchEffects API는 변이 유무와 무관하게 Bond 정보를 반환해야 함
    expect(result.hasEffect).toBe(true);
    expect(result.type).toBe('collect_radius_on_slow');
    expect(result.value).toBe(40);
  });

  test('BUG-02: _applyMutationToTower에서 effect가 null이면 _applyBondToTower 호출 안됨 — 코드 구조 확인', async ({ page }) => {
    // 이 테스트는 코드 구조를 문서화하는 용도.
    // salt 변이 없이 Bond만 등록한 경우:
    //   - _applyMutationToTower('salt') 호출 → effect = null → return
    //   - _applyBondToTower('salt') 호출되지 않음
    //   - tower._collectRadiusOnSlow 세팅되지 않음
    //   - _updateDeliveryTowers에서 saltCollectBonus = 0
    //
    // 반면 ServiceScene의 yuki+soup_pot, andre+delivery,
    // IngredientManager의 mimi+spice는 BranchEffects.getActiveBondEffect() API를
    // 직접 호출하므로 tower 플래그에 의존하지 않아 문제 없음.

    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: ['bond_mimi_salt'],
      activeBlessing: null,
      lastVisit: null,
    }, 'mimi_chef');

    const result = await page.evaluate(async () => {
      const { BranchEffects } = await import('/js/managers/BranchEffects.js');
      // getMutationEffect는 변이 없으므로 null
      const mutEffect = BranchEffects.getMutationEffect('salt');
      // getActiveBondEffect는 SaveManager 직접 조회이므로 정상 반환
      const bondEffect = BranchEffects.getActiveBondEffect('salt');
      return {
        mutationIsNull: mutEffect === null,
        bondHasValue: !!bondEffect,
        // 실제 GatheringScene에서 tower._collectRadiusOnSlow는 세팅 안됨
        // 왜냐하면 _applyMutationToTower에서 if(!effect) return 으로 빠져나가므로
      };
    });

    expect(result.mutationIsNull).toBe(true);
    expect(result.bondHasValue).toBe(true);
    // 이 불일치가 버그의 근본 원인:
    // BranchEffects API는 Bond를 알고 있지만,
    // _updateDeliveryTowers는 tower._collectRadiusOnSlow를 조회하는데 이 플래그가 세팅 안 됨
  });
});
