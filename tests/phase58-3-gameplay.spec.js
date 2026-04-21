/**
 * @fileoverview Phase 58-3 게임플레이 효과 적용 검증.
 *
 * 분기 카드(축복/변이/인연/레시피)가 각 게임플레이 씬에서 실제로 효과를
 * 반영하는지 검증한다. UI 조작 대신 `page.evaluate()`로 게임 내부 API를
 * 직접 호출하여 상태 전이와 효과 값을 확인한다.
 *
 * 대상 API:
 *   - Blessing 차감: SaveManager.decrementBlessingStages + ResultScene 연동
 *   - Mutation tint: BranchEffects.getMutationTint + GatheringScene `_applyMutationToTower`
 *   - Bond 효과 조회: BranchEffects.getActiveBondEffect (chef+tool 조합)
 *   - Recipe 해금: BranchEffects.getUnlockedBranchRecipes + getUnlockedBranchRecipeCards
 *
 * 유의: Playwright ESM 모드이므로 `import` 문법 사용. `require` 금지.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

/**
 * Phaser 게임 인스턴스가 로드될 때까지 대기.
 * @param {import('@playwright/test').Page} page
 * @param {number} [timeout]
 */
async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

/**
 * 지정한 분기 카드 상태를 가진 v24 세이브를 주입한다.
 * @param {import('@playwright/test').Page} page
 * @param {object} branchCards - { toolMutations, unlockedBranchRecipes, chefBonds, activeBlessing, lastVisit }
 * @param {string} [selectedChef]
 */
async function injectSave(page, branchCards, selectedChef = 'lao_chef') {
  await page.evaluate(
    ({ key, bc, chef }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 24,
          selectedChef: chef,
          stages: {},
          gold: 500,
          kitchenCoins: 100,
          toolInventory: { pan: { count: 1, level: 1 }, grill: { count: 1, level: 1 } },
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
    { key: SAVE_KEY, bc: branchCards, chef: selectedChef },
  );
}

/**
 * 특정 씬으로 전환한다. 기존 활성 씬은 모두 정지한다.
 * @param {import('@playwright/test').Page} page
 * @param {string} sceneKey
 * @param {object} [data]
 */
async function startScene(page, sceneKey, data = {}) {
  await page.evaluate(
    ({ k, d }) => {
      const game = window.__game;
      game.scene.scenes.forEach((s) => {
        if (s.scene.isActive()) game.scene.stop(s.scene.key);
      });
      game.scene.start(k, d);
    },
    { k: sceneKey, d: data },
  );
  await page.waitForTimeout(800);
}

// ── 테스트 스위트 ──────────────────────────────────────────────────

test.describe('Phase 58-3: 분기 카드 게임플레이 효과', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  // ── 1. 축복(Blessing) 차감 ─────────────────────────────────────

  test('축복 차감 — ResultScene 클리어 시 remainingStages 1 감소', async ({ page }) => {
    // 활성 축복(금전운 bles_gold_gain, remainingStages=3) 주입
    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: { id: 'bles_gold_gain', remainingStages: 3 },
      lastVisit: null,
    });

    // BranchEffects API가 활성 축복을 읽을 수 있는지 사전 확인
    const beforeDecrement = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      const s = await import('/js/managers/SaveManager.js');
      return {
        activeBlessing: s.SaveManager.getActiveBlessing(),
        goldMult: m.BranchEffects.getBlessingMultiplier('gold_gain'),
        // 타입 미스매치 타입 요청 시 기본값 1.0
        cookSpeed: m.BranchEffects.getBlessingMultiplier('cook_speed'),
      };
    });

    expect(beforeDecrement.activeBlessing).not.toBeNull();
    expect(beforeDecrement.activeBlessing.id).toBe('bles_gold_gain');
    expect(beforeDecrement.activeBlessing.remainingStages).toBe(3);
    // 'bles_gold_gain'은 gold_gain 배수 카드 (value=1.3 기준)
    expect(beforeDecrement.goldMult).toBeGreaterThan(1.0);
    // 다른 타입 조회 시 기본값(가산형이므로 0)
    expect(beforeDecrement.cookSpeed).toBe(0);

    // ResultScene을 직접 호출하지 않고 SaveManager.decrementBlessingStages만 호출
    // (ResultScene은 내부에서 SaveManager.decrementBlessingStages를 호출함 — 해당 계약만 검증)
    const afterDecrement = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const res = s.SaveManager.decrementBlessingStages();
      return {
        returned: res,
        activeBlessing: s.SaveManager.getActiveBlessing(),
      };
    });

    // 1차감 후에도 remainingStages=2로 잔존
    expect(afterDecrement.returned).not.toBeNull();
    expect(afterDecrement.returned.remainingStages).toBe(2);
    expect(afterDecrement.activeBlessing.remainingStages).toBe(2);

    // 2번 더 차감하면 0이 되어 null로 초기화
    const exhausted = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      s.SaveManager.decrementBlessingStages();
      s.SaveManager.decrementBlessingStages();
      return s.SaveManager.getActiveBlessing();
    });
    expect(exhausted).toBeNull();
  });

  // ── 2. 변이(Mutation) tint ─────────────────────────────────────

  test('변이 tint — pan 변이 카드 주입 시 getMutationTint가 색상값 반환', async ({ page }) => {
    // pan에 mut_pan_flame 변이 적용 (splash 타입 → 주황 0xff6b35)
    // grill에 mut_grill_inferno 변이 적용 (burn_stack 타입 → 진한 빨강 0xff3311)
    await injectSave(page, {
      toolMutations: {
        pan: 'mut_pan_flame',
        grill: 'mut_grill_inferno',
      },
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const mutationInfo = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      return {
        panHasMutation: m.BranchEffects.hasMutation('pan'),
        panTint: m.BranchEffects.getMutationTint('pan'),
        panEffect: m.BranchEffects.getMutationEffect('pan'),
        grillHasMutation: m.BranchEffects.hasMutation('grill'),
        grillTint: m.BranchEffects.getMutationTint('grill'),
        grillEffect: m.BranchEffects.getMutationEffect('grill'),
        // 적용되지 않은 도구는 null
        otherHas: m.BranchEffects.hasMutation('freezer'),
        otherTint: m.BranchEffects.getMutationTint('freezer'),
      };
    });

    // pan: splash 타입 → 주황 0xff6b35
    expect(mutationInfo.panHasMutation).toBe(true);
    expect(mutationInfo.panTint).toBe(0xff6b35);
    expect(mutationInfo.panEffect).not.toBeNull();
    expect(mutationInfo.panEffect.type).toBe('splash');

    // grill: burn_stack 타입 → 진한 빨강 0xff3311
    expect(mutationInfo.grillHasMutation).toBe(true);
    expect(mutationInfo.grillTint).toBe(0xff3311);
    expect(mutationInfo.grillEffect).not.toBeNull();
    expect(mutationInfo.grillEffect.type).toBe('burn_stack');

    // 변이 없는 도구는 null
    expect(mutationInfo.otherHas).toBe(false);
    expect(mutationInfo.otherTint).toBeNull();

    // pan/grill tint가 서로 달라야 한다 (타입별 고유 팔레트)
    expect(mutationInfo.panTint).not.toBe(mutationInfo.grillTint);

    // GatheringScene 메서드 `_applyMutationToTower` 존재 확인 (실제 실행은 하지 않음 — 스프라이트 생성 의존성 회피)
    const sceneHasMethod = await page.evaluate(() => {
      const s = window.__game.scene.getScene('GatheringScene');
      return typeof s?._applyMutationToTower === 'function';
    });
    expect(sceneHasMethod).toBe(true);
  });

  // ── 3. 셰프 인연(Bond) 시너지 ───────────────────────────────────

  test('셰프 인연 — lao_chef + grill 조합 시 damage_pct 효과 반환', async ({ page }) => {
    // lao_chef 선택 + bond_lao_grill 해금 (grill 도구 시너지)
    await injectSave(
      page,
      {
        toolMutations: {},
        unlockedBranchRecipes: [],
        chefBonds: ['bond_lao_grill'],
        activeBlessing: null,
        lastVisit: null,
      },
      'lao_chef',
    );

    const bondInfo = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      return {
        // 현재 셰프 기준 — grill 도구 시너지 검색 (자동으로 selectedChef=lao_chef 사용)
        grillCard: m.BranchEffects.getActiveBondCard('grill'),
        grillEffect: m.BranchEffects.getActiveBondEffect('grill'),
        // 현재 셰프가 lao이므로 pan(팬) 조합은 없어야 한다 (다른 셰프 카드)
        panEffect: m.BranchEffects.getActiveBondEffect('pan'),
        // 다른 셰프 오버라이드 사용 시 활성 카드가 없어야 한다 (lao 카드이므로)
        yukiOverrideGrill: m.BranchEffects.getActiveBondEffect('grill', 'yuki_chef'),
      };
    });

    expect(bondInfo.grillCard).not.toBeNull();
    expect(bondInfo.grillCard.category).toBe('bond');
    expect(bondInfo.grillCard.chefId).toBe('lao_chef');
    expect(bondInfo.grillCard.bondToolId).toBe('grill');

    expect(bondInfo.grillEffect).not.toBeNull();
    // lao_grill 인연은 damage_pct 타입이어야 한다 (공격력 +N%)
    expect(bondInfo.grillEffect.type).toBe('damage_pct');
    expect(typeof bondInfo.grillEffect.value).toBe('number');
    expect(bondInfo.grillEffect.value).toBeGreaterThan(0);

    // 다른 도구(pan)는 lao_grill 카드와 매칭되지 않으므로 null
    expect(bondInfo.panEffect).toBeNull();

    // 다른 셰프(yuki) 기준 조회 시 lao 카드와 매칭되지 않으므로 null
    expect(bondInfo.yukiOverrideGrill).toBeNull();
  });

  // ── 4. 레시피 해금(Recipe) ──────────────────────────────────────

  test('레시피 해금 — unlockedBranchRecipes 주입 시 해금 카드 목록 조회', async ({ page }) => {
    // 분기 레시피 해금 상태 주입
    // (recipe 카드의 recipeId를 사용해야 한다 — 카드 ID와는 별도)
    const injectedRecipeIds = await page.evaluate(async () => {
      // recipe 카테고리 카드에서 첫 번째 recipeId를 읽어와 해금 대상으로 사용
      const d = await import('/js/data/merchantBranchData.js');
      const recipeCards = d.getBranchCardsByCategory('recipe');
      return recipeCards.slice(0, 2).map((c) => c.recipeId);
    });

    expect(injectedRecipeIds.length).toBeGreaterThan(0);

    await injectSave(page, {
      toolMutations: {},
      unlockedBranchRecipes: injectedRecipeIds,
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    });

    const recipeInfo = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      const ids = m.BranchEffects.getUnlockedBranchRecipes();
      const cards = m.BranchEffects.getUnlockedBranchRecipeCards();
      return {
        ids,
        cardCount: cards.length,
        cardCategories: cards.map((c) => c.category),
        cardRecipeIds: cards.map((c) => c.recipeId),
      };
    });

    expect(recipeInfo.ids.length).toBe(injectedRecipeIds.length);
    expect(recipeInfo.ids).toEqual(injectedRecipeIds);

    // 해금된 레시피 카드가 모두 recipe 카테고리여야 한다
    expect(recipeInfo.cardCount).toBe(injectedRecipeIds.length);
    for (const cat of recipeInfo.cardCategories) {
      expect(cat).toBe('recipe');
    }
    // 카드의 recipeId는 주입한 ID와 일치해야 한다
    for (const rid of injectedRecipeIds) {
      expect(recipeInfo.cardRecipeIds).toContain(rid);
    }

    // 스크린샷: ServiceScene 진입 (레시피 풀 반영 여부는 후속 페이즈 — 본 테스트는 API 검증)
    await startScene(page, 'ServiceScene', { stageId: '1-1' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'tests/screenshots/phase58-3-service-scene.png' });
  });
});
