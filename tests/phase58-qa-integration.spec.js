/**
 * @fileoverview Phase 58 통합 QA — 행상인 로그라이크 분기 선택.
 *
 * 범위:
 *   - 5개 성공 기준 전부 검증
 *   - 집중 검증 4항목 (레시피 해금 실효 / 변이 실효 / Bond 실효 / Blessing 실효)
 *   - 엣지 케이스 (마이그레이션, 축복 교체, 변이 풀 제외, 축복 만료 자동 null)
 *   - 리그레션 (기존 도구 구매 + Phase 57 이전 기능)
 *
 * 전략: MerchantScene의 Phaser pointerdown 좌표 이슈 우회 위해 API 직접 호출.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

async function injectSave(page, overrides = {}) {
  const base = {
    version: 24,
    selectedChef: 'mimi_chef',
    stages: {},
    gold: 500,
    kitchenCoins: 100,
    totalGoldEarned: 0,
    tutorialDone: true,
    tutorialBattle: true, tutorialService: true, tutorialShop: true,
    tutorialEndless: true, tutorialMerchant: true,
    upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: [],
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: false, dishwasher: false },
    soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
    tools: {
      pan: { count: 1, level: 1 }, salt: { count: 0, level: 1 },
      grill: { count: 1, level: 1 }, delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 }, spice_grinder: { count: 0, level: 1 },
    },
    season2Unlocked: false,
    season3Unlocked: false,
    seenDialogues: [],
    storyProgress: { currentChapter: 1, storyFlags: {} },
    mireukEssence: 0, mireukEssenceTotal: 0, mireukTravelerCount: 0,
    mireukBossRewards: [], wanderingChefs: {},
    giftIngredients: {},
    endless: {
      unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
      lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0,
    },
    branchCards: {
      toolMutations: {}, unlockedBranchRecipes: [],
      chefBonds: [], activeBlessing: null, lastVisit: null,
    },
  };
  const merged = { ...base, ...overrides };
  if (overrides.branchCards) {
    merged.branchCards = { ...base.branchCards, ...overrides.branchCards };
  }
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: merged });
}

async function enterScene(page, sceneKey, data = {}) {
  await page.evaluate(({ k, d }) => {
    const game = window.__game;
    game.scene.scenes.forEach((s) => {
      if (s.scene.isActive()) game.scene.stop(s.scene.key);
    });
    game.scene.start(k, d);
  }, { k: sceneKey, d: data });
  // BootScene 텍스처 로드 완료 대기 (MerchantScene 배경/버튼 NineSlice용)
  await page.waitForTimeout(1800);
}

// ──────────────────────────────────────────────────────────────────
// 성공 기준 1: MerchantScene 분기 카드 UI 존재
// ──────────────────────────────────────────────────────────────────

test.describe('성공 기준 1: 분기 카드 UI 존재', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page);
  });

  test('기존 도구 구매 UI + 분기 카드 3장 탭 배치', async ({ page }) => {
    // 세이브 반영을 위해 페이지 리로드 후 씬 진입
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'MerchantScene', { stageId: '1-1' });

    const state = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
      return {
        tabsToolsExists: !!s._tabToolsBg,
        tabsBranchExists: !!s._tabBranchBg,
        hasBranchCards: Array.isArray(s._branchCardDefs) && s._branchCardDefs.length > 0,
        cardCount: (s._branchCardDefs || []).length,
        categoriesUnique: new Set((s._branchCardDefs || []).map(c => c.category)).size,
      };
    });

    expect(state.tabsToolsExists).toBe(true);
    expect(state.tabsBranchExists).toBe(true);
    expect(state.hasBranchCards).toBe(true);
    expect(state.cardCount).toBe(3);
    expect(state.categoriesUnique).toBe(3);

    await page.screenshot({ path: 'tests/screenshots/phase58-qa-criterion1-branch-ui.png' });
  });
});

// ──────────────────────────────────────────────────────────────────
// 성공 기준 2: 4카테고리 × 8장 이상 + 카테고리 분산 3장
// ──────────────────────────────────────────────────────────────────

test.describe('성공 기준 2: 카드 데이터 충분성 + 카테고리 분산', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page);
  });

  test('각 카테고리 최소 8장 + 총 32장', async ({ page }) => {
    const cardInfo = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      return {
        total: d.BRANCH_CARDS.length,
        mutation: d.getBranchCardsByCategory('mutation').length,
        recipe: d.getBranchCardsByCategory('recipe').length,
        bond: d.getBranchCardsByCategory('bond').length,
        blessing: d.getBranchCardsByCategory('blessing').length,
        categories: d.BRANCH_CATEGORIES,
      };
    });

    expect(cardInfo.total).toBeGreaterThanOrEqual(32);
    expect(cardInfo.mutation).toBeGreaterThanOrEqual(8);
    expect(cardInfo.recipe).toBeGreaterThanOrEqual(8);
    expect(cardInfo.bond).toBeGreaterThanOrEqual(8);
    expect(cardInfo.blessing).toBeGreaterThanOrEqual(8);
    expect(cardInfo.categories).toEqual(['mutation', 'recipe', 'bond', 'blessing']);
  });

  test('10회 반복 호출 시 카테고리 분산 규칙 유지 (항상 3장, 서로 다른 카테고리)', async ({ page }) => {
    const runs = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const results = [];
      const emptyState = {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null,
      };
      // Phase 75: selectBranchCards에 progressState 추가, 완전 해금 상태로 기존 의도(3장·3카테고리) 복원
      const fullyUnlocked = {
        currentChapter: 99,
        season2Unlocked: true,
        season3Unlocked: true,
        tools: {
          pan: { count: 1 }, salt: { count: 1 }, grill: { count: 1 }, delivery: { count: 1 },
          freezer: { count: 1 }, soup_pot: { count: 1 }, wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 },
        },
      };
      for (let i = 0; i < 10; i++) {
        const picks = d.selectBranchCards(emptyState, fullyUnlocked);
        results.push({
          count: picks.length,
          cats: picks.map(c => c.category),
          uniqueCats: new Set(picks.map(c => c.category)).size,
        });
      }
      return results;
    });

    for (const r of runs) {
      expect(r.count).toBe(3);
      expect(r.uniqueCats).toBe(3); // 카테고리 중복 없음
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// 성공 기준 3: 선택 즉시 적용 + 재선택 불가
// ──────────────────────────────────────────────────────────────────

test.describe('성공 기준 3: 확인 팝업 + 즉시 적용 + 재선택 불가', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page);
  });

  test('카드 선택 → 팝업 → 확정 → 재선택 시도 차단', async ({ page }) => {
    await enterScene(page, 'MerchantScene', { stageId: '1-1' });

    // 1) 분기 탭 전환 + 카드 선정
    const before = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
      return {
        cardCount: (s._branchCardDefs || []).length,
        selected: s._branchCardSelected,
      };
    });
    expect(before.cardCount).toBe(3);
    expect(before.selected).toBe(false);

    // 2) 팝업 오픈
    const popup = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      const first = s._branchCardDefs[0];
      s._showBranchConfirmPopup(first);
      return { popupOpen: s._branchPopupOpen, cardId: first.id, cat: first.category };
    });
    expect(popup.popupOpen).toBe(true);

    // 3) 팝업 확인 → 선택 완료 상태로 전환
    const after = await page.evaluate((saveKey) => {
      const s = window.__game.scene.getScene('MerchantScene');
      const first = s._branchCardDefs[0];
      s._branchPopupOpen = false;
      s._applyBranchCard(first);
      const raw = localStorage.getItem(saveKey);
      return {
        cardSelected: s._branchCardSelected,
        selectedId: s._branchSelectedCardId,
        category: first.category,
        save: raw ? JSON.parse(raw).branchCards : null,
      };
    }, SAVE_KEY);
    expect(after.cardSelected).toBe(true);
    expect(after.selectedId).toBe(popup.cardId);
    expect(after.save.lastVisit.stageId).toBe('1-1');
    expect(after.save.lastVisit.selectedCardId).toBe(popup.cardId);

    // 4) 재선택 시도: 이미 선택 완료 상태 → 추가 카드 클릭 가드
    const reselect = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      // 다른 카드로 두 번째 선택을 시도 — 가드 조건 확인
      // (MerchantScene._renderBranchCard에서 카드 클릭 핸들러가
      //   `if (this._branchCardSelected || this._branchPopupOpen) return;`
      //  조건으로 팝업 오픈을 막는다.)
      const guardActive = s._branchCardSelected === true;
      // 렌더된 상태 — _renderSelectedBranchSummary 경로로 한 장만 남아야 한다
      return {
        guardActive,
        currentElementCount: (s._branchTabElements || []).length,
      };
    });
    expect(reselect.guardActive).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────
// 성공 기준 4: 변이 도구 오버레이 + 효과 반영 (집중 검증)
// ──────────────────────────────────────────────────────────────────

test.describe('성공 기준 4 + 집중 검증 2: 변이 tint + 효과 반영', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('mut_pan_flame (splash) — splashRadius 가산 효과', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: { pan: 'mut_pan_flame' },
        unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null,
      },
    });

    const result = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      return {
        tint: m.BranchEffects.getMutationTint('pan'),
        effect: m.BranchEffects.getMutationEffect('pan'),
      };
    });

    expect(result.tint).toBe(0xff6b35); // splash orange
    expect(result.effect.type).toBe('splash');
    expect(result.effect.splashRadius).toBe(30);
  });

  test('mut_grill_inferno (burn_stack) — 중첩 배수 효과', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: { grill: 'mut_grill_inferno' },
        unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null,
      },
    });

    const result = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      return {
        tint: m.BranchEffects.getMutationTint('grill'),
        effect: m.BranchEffects.getMutationEffect('grill'),
      };
    });

    expect(result.tint).toBe(0xff3311);
    expect(result.effect.type).toBe('burn_stack');
    expect(result.effect.maxStacks).toBe(3);
    expect(result.effect.stackMultiplier).toBe(3);
  });

  test('8종 변이 모두 BranchEffects가 정의된 tint/효과 반환', async ({ page }) => {
    const allMutations = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const muts = d.getBranchCardsByCategory('mutation');
      return muts.map(m => ({
        id: m.id,
        targetToolId: m.targetToolId,
        effectType: m.mutationEffect.type,
      }));
    });

    expect(allMutations.length).toBe(8);

    const eachResult = await page.evaluate(async (mutList) => {
      const m = await import('/js/managers/BranchEffects.js');
      const s = await import('/js/managers/SaveManager.js');
      const results = [];
      for (const mut of mutList) {
        // 각 변이를 순차로 세팅하고 tint/effect 확인
        const data = s.SaveManager.load();
        data.branchCards.toolMutations = { [mut.targetToolId]: mut.id };
        s.SaveManager.save(data);
        results.push({
          id: mut.id,
          tint: m.BranchEffects.getMutationTint(mut.targetToolId),
          effect: m.BranchEffects.getMutationEffect(mut.targetToolId),
        });
      }
      return results;
    }, allMutations);

    for (const r of eachResult) {
      expect(r.tint).not.toBeNull();
      expect(typeof r.tint).toBe('number');
      expect(r.effect).not.toBeNull();
      expect(typeof r.effect.type).toBe('string');
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// 성공 기준 5: 세이브 저장 + 재시작 유지 + 마이그레이션
// ──────────────────────────────────────────────────────────────────

test.describe('성공 기준 5: 세이브 v24 저장/로드 + v23→v24 마이그레이션', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('v23 세이브 → v24 마이그레이션 시 branchCards 필드 초기화', async ({ page }) => {
    // v23 세이브 주입 (branchCards 없음)
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({
        version: 23,
        selectedChef: 'mimi_chef',
        stages: {},
        gold: 100, kitchenCoins: 0,
      }));
    }, SAVE_KEY);

    const migrated = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const data = s.SaveManager.load();
      return { version: data.version, branchCards: data.branchCards };
    });

    expect(migrated.version).toBe(24);
    expect(migrated.branchCards).not.toBeNull();
    expect(migrated.branchCards).not.toBeUndefined();
    expect(migrated.branchCards.toolMutations).toEqual({});
    expect(migrated.branchCards.unlockedBranchRecipes).toEqual([]);
    expect(migrated.branchCards.chefBonds).toEqual([]);
    expect(migrated.branchCards.activeBlessing).toBeNull();
  });

  test('v18 → v24 전체 체인 마이그레이션 (셰프 ID 교체 + branchCards)', async ({ page }) => {
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({
        version: 18,
        selectedChef: 'petit_chef', // 구 ID
        stages: {},
      }));
    }, SAVE_KEY);

    const result = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const data = s.SaveManager.load();
      return {
        version: data.version,
        selectedChef: data.selectedChef,
        hasBranchCards: !!data.branchCards,
      };
    });

    expect(result.version).toBe(24);
    expect(result.selectedChef).toBe('mimi_chef'); // v23 마이그레이션으로 교체
    expect(result.hasBranchCards).toBe(true);
  });

  test('분기 카드 선택 후 재로드 시 상태 유지', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: { pan: 'mut_pan_flame' },
        unlockedBranchRecipes: ['branch_dragon_feast'],
        chefBonds: ['bond_lao_grill'],
        activeBlessing: { id: 'bles_gold_gain', remainingStages: 2 },
        lastVisit: { stageId: '1-1', selectedCardId: 'mut_pan_flame' },
      },
    });

    // 페이지 리로드
    await page.reload();
    await waitForGame(page);

    const restored = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const data = s.SaveManager.load();
      return data.branchCards;
    });

    expect(restored.toolMutations.pan).toBe('mut_pan_flame');
    expect(restored.unlockedBranchRecipes).toContain('branch_dragon_feast');
    expect(restored.chefBonds).toContain('bond_lao_grill');
    expect(restored.activeBlessing.id).toBe('bles_gold_gain');
    expect(restored.activeBlessing.remainingStages).toBe(2);
    expect(restored.lastVisit.stageId).toBe('1-1');
  });
});

// ──────────────────────────────────────────────────────────────────
// 집중 검증 1: 분기 레시피 해금 실효 (CRITICAL)
// ──────────────────────────────────────────────────────────────────

test.describe('집중 검증 1: 분기 레시피 실효 (주문 풀 반영 여부)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('해금된 분기 레시피 ID가 ServiceScene 주문 풀에 실제 등장하는가', async ({ page }) => {
    // 드래곤 연회 해금 상태 주입
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: ['branch_dragon_feast', 'branch_golden_curry'],
        chefBonds: [], activeBlessing: null, lastVisit: null,
      },
    });

    // ServiceScene 진입 후 availableRecipes에 branch 레시피가 포함되는지 확인
    await enterScene(page, 'ServiceScene', { stageId: '1-1', marketResult: { ingredients: {} } });

    const servicePool = await page.evaluate(() => {
      const s = window.__game.scene.getScene('ServiceScene');
      const recipes = s?.availableRecipes || [];
      return {
        sceneActive: s?.scene?.isActive?.(),
        recipeCount: recipes.length,
        recipeIds: recipes.map(r => r.id),
        branchRecipeCount: recipes.filter(r =>
          String(r.id).startsWith('branch_')).length,
      };
    });

    // Phase 58 스펙상 — 분기 레시피가 해금되면 ServiceScene에서 등장해야 함
    // FAIL 예상: 현재 ServiceScene은 RecipeManager.isUnlocked 기반이므로
    // branchCards.unlockedBranchRecipes를 읽지 않음
    console.log('[DEBUG] servicePool:', JSON.stringify(servicePool));
    // 실효 여부 검증 (FAIL 시 기록됨)
    expect(servicePool.branchRecipeCount, '분기 레시피가 주문 풀에 포함되지 않음').toBeGreaterThan(0);
  });

  test('해금된 분기 레시피 recipeId가 recipeData.js에 정의되어 있는가', async ({ page }) => {
    const defined = await page.evaluate(async () => {
      const d = await import('/js/data/recipeData.js');
      // 분기 레시피 8종 ID 모두 확인
      const branchIds = [
        'branch_dragon_feast', 'branch_mireuk_tea', 'branch_grand_omakase',
        'branch_golden_curry', 'branch_chaos_ramen', 'branch_frozen_dessert',
        'branch_spice_bomb', 'branch_bistro_course',
      ];
      return branchIds.map(id => ({
        id,
        exists: !!(d.RECIPE_MAP && d.RECIPE_MAP[id]),
      }));
    });

    for (const item of defined) {
      expect(item.exists, `분기 레시피 '${item.id}' 정의 부재`).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// 집중 검증 3: 셰프 인연 효과 (상세 type별)
// ──────────────────────────────────────────────────────────────────

test.describe('집중 검증 3: 셰프 인연 type별 효과', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('8종 Bond 카드 모두 BranchEffects API로 조회 가능', async ({ page }) => {
    const allBonds = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      return d.getBranchCardsByCategory('bond').map(b => ({
        id: b.id, chefId: b.chefId, bondToolId: b.bondToolId, effectType: b.bondEffect.type,
      }));
    });

    expect(allBonds.length).toBe(8);

    const resolved = await page.evaluate(async (bonds) => {
      const m = await import('/js/managers/BranchEffects.js');
      const s = await import('/js/managers/SaveManager.js');
      const results = [];
      for (const b of bonds) {
        const data = s.SaveManager.load();
        data.branchCards.chefBonds = [b.id];
        data.selectedChef = b.chefId;
        s.SaveManager.save(data);
        const card = m.BranchEffects.getActiveBondCard(b.bondToolId);
        const effect = m.BranchEffects.getActiveBondEffect(b.bondToolId);
        results.push({
          id: b.id,
          cardFound: !!card,
          effectType: effect?.type,
          value: effect?.value,
        });
      }
      return results;
    }, allBonds);

    // 모든 bond가 조회 가능해야 함
    for (const r of resolved) {
      expect(r.cardFound, `Bond ${r.id} 조회 실패`).toBe(true);
      expect(r.effectType, `Bond ${r.id} 효과 type 없음`).toBeTruthy();
    }
  });

  test('damage_pct (lao_grill) — 실제 tower.damageMultiplier 반영되는가', async ({ page }) => {
    // GatheringScene은 직접 tower 생성하므로 API로 _applyBondToTower 검증
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [],
        chefBonds: ['bond_lao_grill'], activeBlessing: null, lastVisit: null,
      },
      selectedChef: 'lao_chef',
      tools: {
        pan: { count: 1, level: 1 }, salt: { count: 0, level: 1 },
        grill: { count: 1, level: 1 }, delivery: { count: 0, level: 1 },
        freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 },
        wasabi_cannon: { count: 0, level: 1 }, spice_grinder: { count: 0, level: 1 },
      },
    });

    const applied = await page.evaluate(async () => {
      // 가짜 tower 객체를 만들어 _applyBondToTower에 전달
      const s = window.__game.scene.getScene('GatheringScene');
      const mockTower = {
        data_: { damage: 10, splashRadius: 0 },
        damageMultiplier: 1.0,
      };
      s._applyBondToTower(mockTower, 'grill');
      return {
        damageMultiplier: mockTower.damageMultiplier,
      };
    });

    // damage_pct value=0.5이므로 damageMultiplier = 1.0 * (1 + 0.5) = 1.5
    expect(applied.damageMultiplier).toBeCloseTo(1.5, 2);
  });
});

// ──────────────────────────────────────────────────────────────────
// 집중 검증 4: 축복 실효 (type별 수치 반영)
// ──────────────────────────────────────────────────────────────────

test.describe('집중 검증 4: 축복 type별 수치 반영', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('gold_gain — 1.3배 정상 반환', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [],
        chefBonds: [],
        activeBlessing: { id: 'bles_gold_gain', remainingStages: 2 },
        lastVisit: null,
      },
    });

    const mult = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      return m.BranchEffects.getBlessingMultiplier('gold_gain');
    });

    expect(mult).toBeCloseTo(1.3, 2);
  });

  test('cook_speed (0.2 감소) / patron_patience (0.25 증가) / exp_gain (+5 가산)', async ({ page }) => {
    const tests = [
      { id: 'bles_cook_speed', type: 'cook_speed', expected: 0.2 },
      { id: 'bles_patron_rush', type: 'patron_patience', expected: 0.25 },
      { id: 'bles_exp_boost', type: 'exp_gain', expected: 5 },
      { id: 'bles_ingredient_rich', type: 'ingredient_drop_count', expected: 1 },
      { id: 'bles_enemy_slow', type: 'enemy_slow', expected: 0.15 },
      { id: 'bles_essence_rain', type: 'mireuk_traveler_chance', expected: 0.15 },
    ];

    for (const t of tests) {
      await injectSave(page, {
        branchCards: {
          toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
          activeBlessing: { id: t.id, remainingStages: 2 },
          lastVisit: null,
        },
      });
      const mult = await page.evaluate(async (type) => {
        const m = await import('/js/managers/BranchEffects.js');
        return m.BranchEffects.getBlessingMultiplier(type);
      }, t.type);
      expect(mult, `축복 ${t.id} 효과`).toBeCloseTo(t.expected, 2);
    }
  });

  test('drop_rate_carrot — target 일치 시 배수 반환, 불일치 시 1.0', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
        activeBlessing: { id: 'bles_drop_carrot', remainingStages: 3 },
        lastVisit: null,
      },
    });

    const result = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      return {
        carrot: m.BranchEffects.getBlessingDropRateFor('carrot'),
        mushroom: m.BranchEffects.getBlessingDropRateFor('mushroom'),
      };
    });

    expect(result.carrot).toBe(2.0);
    expect(result.mushroom).toBe(1.0); // target 불일치
  });
});

// ──────────────────────────────────────────────────────────────────
// 엣지 케이스
// ──────────────────────────────────────────────────────────────────

test.describe('엣지 케이스', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('이미 변이된 도구는 mutation 풀에서 제외', async ({ page }) => {
    // pan만 변이 적용 상태
    await injectSave(page, {
      branchCards: {
        toolMutations: { pan: 'mut_pan_flame' },
        unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null,
      },
    });

    const pool = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      // Phase 75: getEligiblePool에 progressState 추가, 완전 해금 상태로 기존 기대값(7) 복원
      const fullyUnlocked = {
        currentChapter: 99,
        season2Unlocked: true,
        season3Unlocked: true,
        tools: {
          pan: { count: 1 }, salt: { count: 1 }, grill: { count: 1 }, delivery: { count: 1 },
          freezer: { count: 1 }, soup_pot: { count: 1 }, wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 },
        },
      };
      const pool = d.getEligiblePool('mutation', s.SaveManager.load().branchCards, fullyUnlocked);
      return {
        size: pool.length,
        ids: pool.map(p => p.id),
        hasPan: pool.some(p => p.targetToolId === 'pan'),
      };
    });

    expect(pool.size).toBe(7); // 8-1=7
    expect(pool.hasPan).toBe(false);
  });

  test('이미 해금된 Bond 카드는 pool에서 제외', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [],
        chefBonds: ['bond_lao_grill'],
        activeBlessing: null, lastVisit: null,
      },
    });

    const pool = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      // Phase 75: getEligiblePool에 progressState 추가, 완전 해금 상태로 기존 기대값(7) 복원
      const fullyUnlocked = {
        currentChapter: 99,
        season2Unlocked: true,
        season3Unlocked: true,
        tools: {
          pan: { count: 1 }, salt: { count: 1 }, grill: { count: 1 }, delivery: { count: 1 },
          freezer: { count: 1 }, soup_pot: { count: 1 }, wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 },
        },
      };
      const pool = d.getEligiblePool('bond', s.SaveManager.load().branchCards, fullyUnlocked);
      return { size: pool.length, ids: pool.map(p => p.id) };
    });

    expect(pool.size).toBe(7);
    expect(pool.ids).not.toContain('bond_lao_grill');
  });

  test('활성 축복이 있어도 blessing pool에서 새 카드 뽑을 수 있음 (갱신 규칙)', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
        activeBlessing: { id: 'bles_gold_gain', remainingStages: 2 },
        lastVisit: null,
      },
    });

    const pool = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      // Phase 75: getEligiblePool에 progressState 추가 (blessing은 필터 변경 없지만 시그니처 일관성 유지)
      const fullyUnlocked = {
        currentChapter: 99,
        season2Unlocked: true,
        season3Unlocked: true,
        tools: {
          pan: { count: 1 }, salt: { count: 1 }, grill: { count: 1 }, delivery: { count: 1 },
          freezer: { count: 1 }, soup_pot: { count: 1 }, wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 },
        },
      };
      const pool = d.getEligiblePool('blessing', s.SaveManager.load().branchCards, fullyUnlocked);
      return { size: pool.length };
    });

    // 활성 축복이 있어도 blessing 풀은 전체 유지
    expect(pool.size).toBe(8);
  });

  test('축복 만료 (remainingStages=1 → 차감 후 null)', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
        activeBlessing: { id: 'bles_gold_gain', remainingStages: 1 },
        lastVisit: null,
      },
    });

    const afterDecrement = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const res = s.SaveManager.decrementBlessingStages();
      return { result: res, active: s.SaveManager.getActiveBlessing() };
    });
    expect(afterDecrement.result).toBeNull();
    expect(afterDecrement.active).toBeNull();

    // null 상태에서 또 호출해도 문제 없음
    const second = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      return s.SaveManager.decrementBlessingStages();
    });
    expect(second).toBeNull();
  });

  test('activeBlessing 교체 (기존 덮어쓰기)', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
        activeBlessing: { id: 'bles_gold_gain', remainingStages: 2 },
        lastVisit: null,
      },
    });

    const replaced = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      s.SaveManager.setActiveBlessing({ id: 'bles_cook_speed', remainingStages: 2 });
      return s.SaveManager.getActiveBlessing();
    });

    expect(replaced.id).toBe('bles_cook_speed');
    expect(replaced.remainingStages).toBe(2);
  });

  test('applyToolMutation 중복 호출 시 두 번째는 false (되돌릴 수 없음)', async ({ page }) => {
    await injectSave(page);

    const result = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const first = s.SaveManager.applyToolMutation('pan', 'mut_pan_flame');
      const second = s.SaveManager.applyToolMutation('pan', 'mut_pan_other'); // 덮어쓰기 시도
      const muts = s.SaveManager.getToolMutations();
      return { first, second, panMut: muts.pan };
    });

    expect(result.first).toBe(true);
    expect(result.second).toBe(false); // 차단
    expect(result.panMut).toBe('mut_pan_flame'); // 원본 유지
  });

  test('모든 변이 적용 상태 → mutation pool 0', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {
          pan: 'mut_pan_flame', salt: 'mut_salt_chain', grill: 'mut_grill_inferno',
          delivery: 'mut_delivery_ghost', freezer: 'mut_freezer_permafrost',
          soup_pot: 'mut_soup_overcharge', wasabi_cannon: 'mut_wasabi_cluster',
          spice_grinder: 'mut_spice_venom',
        },
        unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null,
      },
    });

    const pool = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      // Phase 75: getEligiblePool에 progressState 추가, 완전 해금 상태여도 toolMutations가 꽉 차 있어 0장 유지
      const fullyUnlocked = {
        currentChapter: 99,
        season2Unlocked: true,
        season3Unlocked: true,
        tools: {
          pan: { count: 1 }, salt: { count: 1 }, grill: { count: 1 }, delivery: { count: 1 },
          freezer: { count: 1 }, soup_pot: { count: 1 }, wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 },
        },
      };
      return d.getEligiblePool('mutation', s.SaveManager.load().branchCards, fullyUnlocked).length;
    });

    expect(pool).toBe(0);

    // 이 상태에서 selectBranchCards는 3장 채우기 위해 나머지 카테고리로 보충
    const picks = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      const state = s.SaveManager.load().branchCards;
      // Phase 75: selectBranchCards에 progressState 추가, 완전 해금 상태로 기존 의도(mutation 제외 보충 로직) 유지
      const fullyUnlocked = {
        currentChapter: 99,
        season2Unlocked: true,
        season3Unlocked: true,
        tools: {
          pan: { count: 1 }, salt: { count: 1 }, grill: { count: 1 }, delivery: { count: 1 },
          freezer: { count: 1 }, soup_pot: { count: 1 }, wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 },
        },
      };
      // 여러 번 호출해 결과 수집
      const results = [];
      for (let i = 0; i < 5; i++) {
        const r = d.selectBranchCards(state, fullyUnlocked);
        results.push(r.map(c => c.category));
      }
      return results;
    });

    // 모든 선정 결과에서 mutation 카테고리 카드는 없어야 함
    for (const pick of picks) {
      expect(pick).not.toContain('mutation');
      expect(pick.length).toBeLessThanOrEqual(3);
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// 리그레션 검증
// ──────────────────────────────────────────────────────────────────

test.describe('리그레션: 기존 기능 유지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page);
  });

  test('기존 도구 구매 탭이 정상 동작 (분기 시스템과 독립)', async ({ page }) => {
    await enterScene(page, 'MerchantScene', { stageId: '1-1' });

    const state = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        activeTab: s._activeTab,
        toolsTabVisible: !!s._tabToolsBg,
        toolListExists: Array.isArray(s._toolCardBgs) || !!s._toolListContainer || !!s._toolListElements,
      };
    });

    // 기본 탭은 "tools"
    expect(state.activeTab).toBe('tools');
    expect(state.toolsTabVisible).toBe(true);
  });

  test('Enemy.js BranchEffects ESM import 정상 (축복 enemy_slow 런타임 작동)', async ({ page }) => {
    await injectSave(page, {
      branchCards: {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [],
        activeBlessing: { id: 'bles_enemy_slow', remainingStages: 2 },
        lastVisit: null,
      },
    });

    const info = await page.evaluate(async () => {
      const m = await import('/js/managers/BranchEffects.js');
      const enemyMod = await import('/js/entities/Enemy.js');
      return {
        slow: m.BranchEffects.getBlessingMultiplier('enemy_slow'),
        hasEnemyClass: typeof enemyMod.Enemy === 'function',
      };
    });

    expect(info.slow).toBeCloseTo(0.15, 2);
    expect(info.hasEnemyClass).toBe(true);
  });

  test('콘솔 에러 없음 (MerchantScene 진입 후)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await enterScene(page, 'MerchantScene', { stageId: '1-1' });
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
      s._setActiveTab('tools');
      s._setActiveTab('branch');
    });
    await page.waitForTimeout(500);

    // 빈 에러만 허용
    const filtered = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('DevTools') &&
      !/404/.test(e),
    );
    console.log('Captured errors:', filtered);
    expect(filtered.length, `콘솔 에러: ${filtered.join('\n')}`).toBe(0);
  });
});
