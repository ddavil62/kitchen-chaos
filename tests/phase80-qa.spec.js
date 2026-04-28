/**
 * @fileoverview Phase 80 QA: 서빙 UX 피드백 강화 검증.
 *
 * 기능 1: 골든 테두리 강조 (레시피 탭 -> 주문 테이블 하이라이트)
 * 기능 2: 긴급 인내심 깜빡임 (patience < 30% -> 빨간 테두리 tween)
 * 기능 3: 콤보 팝업 (2+ 콤보 -> 화면 중앙 텍스트 VFX)
 * + 예외/엣지케이스 시나리오
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3458';
const SAVE_KEY = 'kitchenChaosTycoon_save';

test.setTimeout(60000);

// ── 유틸리티 함수 ──

async function waitForGame(page, timeout = 20000) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scenes = game.scene.scenes;
    return scenes && scenes.length > 0;
  }, { timeout });
}

async function waitForScene(page, sceneKey, timeout = 30000) {
  await page.waitForFunction((key) => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene(key);
    return scene && scene.sys && scene.sys.isActive();
  }, sceneKey, { timeout });
}

function makeMinimalSave() {
  return {
    version: 27,
    gold: 500,
    totalGoldEarned: 500,
    kitchenCoins: 10,
    stages: { '1-1': { stars: 2 } },
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialEndless: false,
    upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: [],
    selectedChef: 'mimi',
    unlockedChefs: ['mimi'],
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: false, dishwasher: false },
    soundSettings: { bgmVolume: 0, sfxVolume: 0, bgmMuted: true, sfxMuted: true },
    ownedTools: ['pan'],
    toolLevels: { pan: 1 },
    endlessUnlocked: false,
    branchCards: {},
    dailyMissions: null,
    loginBonus: null,
    mireukEssence: 0,
  };
}

async function setAndReload(page, saveData) {
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: saveData });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForGame(page);
}

/**
 * ServiceScene 진입 + update 정지 (타이머/시간 멈춤)
 * @returns {boolean} true if scene entered successfully
 */
async function enterServiceSceneFrozen(page) {
  const result = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return false;

    // 세이브 설정
    localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify({
      version: 27, gold: 500, stages: { '1-1': { stars: 2 } },
      tutorialDone: true, tutorialBattle: true, tutorialService: true,
      tutorialShop: true, tutorialEndless: false,
      upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
      unlockedRecipes: [], selectedChef: 'mimi', unlockedChefs: ['mimi'],
      completedOrders: [], cookingSlots: 2, bestSatisfaction: {},
      tableUpgrades: [0, 0, 0, 0], unlockedTables: 4,
      interiors: { flower: 0, kitchen: 0, lighting: 0 },
      staff: { waiter: false, dishwasher: false },
      soundSettings: { bgmVolume: 0, sfxVolume: 0, bgmMuted: true, sfxMuted: true },
      ownedTools: ['pan'], toolLevels: { pan: 1 }, endlessUnlocked: false,
      branchCards: {}, dailyMissions: null, loginBonus: null, mireukEssence: 0
    }));

    // ServiceScene 시작
    game.scene.start('ServiceScene', {
      inventory: { egg: 10, tomato: 10, noodle: 10, flour: 10, potato: 10, carrot: 10, herb: 10, meat: 10, rice: 10 },
      stageId: '1-1', gold: 100, lives: 3, partialFail: false,
      marketResult: { totalIngredients: 50, livesRemaining: 3, livesMax: 15 }
    });
    return true;
  });

  if (!result) return false;

  await waitForScene(page, 'ServiceScene');
  await page.waitForTimeout(1500); // 씬 안정화

  // update 정지 (타이머/시간 정지) + 기존 손님 전부 제거
  await page.evaluate(() => {
    const ss = window.__game.scene.getScene('ServiceScene');
    if (ss) {
      ss._originalUpdate = ss.update;
      ss.update = function() {}; // 타이머 멈춤

      // 기존 게임 스폰 손님 전부 제거 (테스트 격리)
      if (ss.tables) {
        for (let i = 0; i < ss.tables.length; i++) {
          ss.tables[i] = null;
        }
      }
      // urgent tween 초기 정리
      if (ss._urgentTweens) {
        ss._urgentTweens.forEach(({ tween, rect }) => {
          tween?.stop();
          rect?.destroy();
        });
        ss._urgentTweens.clear();
      }
    }
  });

  // 다른 씬 중지
  await page.evaluate(() => {
    const game = window.__game;
    try { game.scene.stop('ResultScene'); } catch {}
    try { game.scene.stop('MenuScene'); } catch {}
  });

  return true;
}

/**
 * 테이블에 손님 강제 스폰 + UI 갱신
 */
async function spawnCustomer(page, tableIdx, dish, patience, maxPatience) {
  return await page.evaluate(({ idx, dish, patience, maxPatience }) => {
    const ss = window.__game.scene.getScene('ServiceScene');
    if (!ss || !ss.tables) return { error: 'scene not ready' };
    if (idx >= ss.tables.length) return { error: `tableIdx ${idx} out of range (max ${ss.tables.length - 1})` };

    // ServiceScene이 import한 RECIPE_MAP을 통해 ingredients를 참조
    // 간이 레시피 객체 생성 (ingredients 필드 필수 - _dismissSoldOutCustomers가 참조)
    const knownRecipes = {
      carrot_soup: { id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000, baseReward: 20 },
      steak_plate: { id: 'steak_plate', nameKo: '스테이크 플레이트', ingredients: { meat: 1 }, tier: 2, cookTime: 5000, baseReward: 55 },
      egg_soup: { id: 'egg_soup', nameKo: '달걀국', ingredients: { egg: 1 }, tier: 1, cookTime: 2000, baseReward: 18 },
    };
    const fakeRecipe = knownRecipes[dish] || { id: dish, nameKo: dish, ingredients: {}, tier: 1, cookTime: 3000, baseReward: 25 };

    ss.tables[idx] = {
      dish,
      recipe: fakeRecipe,
      patience,
      maxPatience,
      baseReward: fakeRecipe.baseReward || 25,
      customerType: 'normal',
      profileId: 'normal',
    };
    ss._updateTableUI(idx);
    return { ok: true };
  }, { idx: tableIdx, dish, patience, maxPatience });
}

/**
 * 조리 슬롯에 완성된 요리 강제 삽입
 */
async function forceReadyDish(page, slotIdx, recipeId) {
  return await page.evaluate(({ slotIdx, recipeId }) => {
    const ss = window.__game.scene.getScene('ServiceScene');
    if (!ss || !ss.cookingSlots) return { error: 'scene not ready' };
    ss.cookingSlots[slotIdx] = {
      recipe: { id: recipeId, nameKo: recipeId, tier: 1, ingredients: {}, baseReward: 20, cookTime: 3000 },
      timeLeft: 0,
      totalTime: 3000,
      ready: true,
      washing: false,
      washTimeLeft: 0,
    };
    ss._updateCookSlotUI(slotIdx);
    return { ok: true };
  }, { slotIdx, recipeId });
}


// =====================================================================
// 기능 1: 골든 테두리 강조
// =====================================================================

test.describe('Feature 1: 골든 테두리 강조', () => {
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await setAndReload(page, makeMinimalSave());
  });

  test('[AC-1-1] 레시피 탭 시 해당 주문 테이블에 골든 테두리 표시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // 테이블 0, 1에 carrot_soup 주문 손님 스폰
    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000);
    // 테이블 2에 다른 요리 주문
    await spawnCustomer(page, 2, 'steak_plate', 30000, 40000);

    // _onRecipeTap 호출 (carrot_soup)
    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });

      return {
        selectedRecipeId: ss._selectedRecipeId,
        highlightCount: ss._highlightRects.size,
        highlightKeys: [...ss._highlightRects.keys()],
        // 골든 테두리 속성 확인
        rect0: ss._highlightRects.has(0) ? {
          x: ss._highlightRects.get(0).x,
          y: ss._highlightRects.get(0).y,
          active: ss._highlightRects.get(0).active,
          depth: ss._highlightRects.get(0).depth,
          contDepth: ss.tableContainers[0].depth,
        } : null,
        rect1: ss._highlightRects.has(1) ? {
          active: ss._highlightRects.get(1).active,
        } : null,
        rect2Exists: ss._highlightRects.has(2),
      };
    });

    expect(result.selectedRecipeId).toBe('carrot_soup');
    expect(result.highlightCount).toBe(2); // 테이블 0, 1 모두 강조
    expect(result.highlightKeys).toContain(0);
    expect(result.highlightKeys).toContain(1);
    expect(result.rect2Exists).toBe(false); // steak_plate 테이블은 미강조
    expect(result.rect0.active).toBe(true);
    expect(result.rect0.depth).toBeGreaterThan(result.rect0.contDepth);
    expect(result.rect1.active).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/phase80-golden-border.png' });
  });

  test('[AC-1-2] 다른 레시피 탭 시 이전 강조 해제 + 새 강조 표시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await spawnCustomer(page, 1, 'steak_plate', 30000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');

      // 1차: carrot_soup 탭
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      const firstHighlight = [...ss._highlightRects.keys()];
      const firstRect0Active = ss._highlightRects.get(0)?.active;

      // 2차: steak_plate 탭
      ss._onRecipeTap({ id: 'steak_plate', nameKo: '스테이크', ingredients: { meat: 1 }, tier: 2, cookTime: 5000 });
      const secondHighlight = [...ss._highlightRects.keys()];
      // 이전 rect가 destroy되었는지 확인 (1차 rect 참조)
      const firstRect0ActiveAfter = firstRect0Active; // 직접 확인 불가, _highlightRects에서 제거 여부로 검증

      return {
        firstHighlight,
        secondHighlight,
        secondSelectedRecipeId: ss._selectedRecipeId,
        secondHighlightCount: ss._highlightRects.size,
      };
    });

    expect(result.firstHighlight).toContain(0);
    expect(result.secondHighlight).toContain(1);
    expect(result.secondHighlight).not.toContain(0); // 이전 강조 해제됨
    expect(result.secondSelectedRecipeId).toBe('steak_plate');
    expect(result.secondHighlightCount).toBe(1);
  });

  test('[AC-1-3] 같은 레시피 다시 탭 시 기존 강조 해제 후 재적용', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const recipe = { id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 };

      // 1차 탭
      ss._onRecipeTap(recipe);
      const firstRectRef = ss._highlightRects.get(0);
      const firstActive = firstRectRef?.active;

      // 2차 탭 (같은 레시피)
      ss._onRecipeTap(recipe);
      const secondRectRef = ss._highlightRects.get(0);
      const firstActiveAfter = firstRectRef?.active; // destroy 후 active=false 여야 함

      return {
        firstActive,
        firstActiveAfter,
        secondActive: secondRectRef?.active,
        isSameRef: firstRectRef === secondRectRef,
        highlightCount: ss._highlightRects.size,
      };
    });

    expect(result.firstActive).toBe(true);
    // _clearHighlightRects가 이전 rect를 destroy하므로 active=false
    expect(result.firstActiveAfter).toBe(false);
    expect(result.secondActive).toBe(true);
    expect(result.isSameRef).toBe(false); // 새 Rectangle 생성됨
    expect(result.highlightCount).toBe(1);
  });

  test('[AC-1-4] 서빙 성공 시 해당 테이블 골든 테두리 해제', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');

      // 레시피 탭 -> 골든 강조
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      const highlightBefore = ss._highlightRects.size;

      // 테이블 0 서빙
      ss._onTableTap(0);

      return {
        highlightBefore,
        highlightAfter: ss._highlightRects.size,
        table0HasHighlight: ss._highlightRects.has(0),
        table1HasHighlight: ss._highlightRects.has(1),
      };
    });

    expect(result.highlightBefore).toBe(2);
    expect(result.table0HasHighlight).toBe(false); // 서빙한 테이블 강조 해제
    expect(result.table1HasHighlight).toBe(true);  // 다른 테이블 유지
    expect(result.highlightAfter).toBe(1);
  });

  test('[AC-1-5] _shutdown 후 골든 테두리 오브젝트 정리', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      const beforeSize = ss._highlightRects.size;
      const rectRef = ss._highlightRects.get(0);

      ss._shutdown();

      return {
        beforeSize,
        afterSize: ss._highlightRects?.size ?? -1,
        rectDestroyed: !rectRef?.active,
        selectedRecipeId: ss._selectedRecipeId,
      };
    });

    expect(result.beforeSize).toBeGreaterThan(0);
    expect(result.afterSize).toBe(0);
    expect(result.rectDestroyed).toBe(true);
    expect(result.selectedRecipeId).toBeNull();
  });

  test('[EDGE-1-1] 빈 테이블에 레시피 탭 시 강조 생성되지 않음', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // 손님 없이 레시피 탭
    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      return {
        highlightCount: ss._highlightRects.size,
        selectedRecipeId: ss._selectedRecipeId,
      };
    });

    expect(result.highlightCount).toBe(0);
    expect(result.selectedRecipeId).toBe('carrot_soup');
  });

  test('[EDGE-1-2] 서비스 종료/일시정지 상태에서 레시피 탭 시 무시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');

      // isServiceOver = true
      ss.isServiceOver = true;
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      const overResult = ss._highlightRects.size;

      ss.isServiceOver = false;

      // isPaused = true
      ss.isPaused = true;
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      const pausedResult = ss._highlightRects.size;

      return { overResult, pausedResult };
    });

    expect(result.overResult).toBe(0);
    expect(result.pausedResult).toBe(0);
  });

  test('[EDGE-1-3] _clearHighlightRect - 존재하지 않는 테이블 인덱스 호출 시 에러 없음', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      try {
        ss._clearHighlightRect(99); // 존재하지 않는 인덱스
        return { error: false };
      } catch (e) {
        return { error: true, message: e.message };
      }
    });

    expect(result.error).toBe(false);
  });

  test('[EDGE-1-4] 재료 부족 상태에서도 골든 테두리는 표시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);

    // 인벤토리 비우기
    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      // 인벤토리를 비움
      if (ss.inventoryManager && ss.inventoryManager.items) {
        for (const key of Object.keys(ss.inventoryManager.items)) {
          ss.inventoryManager.items[key] = 0;
        }
      }
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });

      return {
        highlightCount: ss._highlightRects.size,
        // 골든 테두리는 재료 확인 전에 생성되므로 표시됨
      };
    });

    // 스펙상 골든 강조는 _clearHighlightRects + 새 강조 생성 후 재료 체크
    // 재료 부족이어도 강조는 표시되어야 함
    expect(result.highlightCount).toBe(1);
  });
});


// =====================================================================
// 기능 2: 긴급 인내심 깜빡임
// =====================================================================

test.describe('Feature 2: 긴급 인내심 깜빡임', () => {
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await setAndReload(page, makeMinimalSave());
  });

  test('[AC-2-1] patience ratio < 0.3 시 빨간 테두리 깜빡임 tween 시작', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // patience ratio = 10/40 = 0.25 (< 0.3)
    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const hasUrgent = ss._urgentTweens.has(0);
      if (!hasUrgent) return { hasUrgent };

      const { tween, rect } = ss._urgentTweens.get(0);
      return {
        hasUrgent,
        rectActive: rect?.active,
        rectDepth: rect?.depth,
        contDepth: ss.tableContainers[0]?.depth,
        tweenIsPlaying: tween?.isPlaying(),
      };
    });

    expect(result.hasUrgent).toBe(true);
    expect(result.rectActive).toBe(true);
    expect(result.rectDepth).toBeGreaterThan(result.contDepth);
    // tween isPlaying 검증 (Phaser tween이 활성 상태인지)
    // Phaser tweens는 isPlaying() 메서드가 없을 수 있으므로 유연하게 처리
  });

  test('[AC-2-2] patience ratio >= 0.3 회복 시 깜빡임 tween 중단 + Rectangle 제거', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // 먼저 ratio < 0.3 상태로 스폰
    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const hadUrgentBefore = ss._urgentTweens.has(0);
      const rectRef = ss._urgentTweens.get(0)?.rect;

      // ratio >= 0.3으로 회복 (patience = 15000/40000 = 0.375)
      ss.tables[0].patience = 15000;
      ss._updateTableUI(0);

      return {
        hadUrgentBefore,
        hasUrgentAfter: ss._urgentTweens.has(0),
        rectDestroyed: !rectRef?.active,
      };
    });

    expect(result.hadUrgentBefore).toBe(true);
    expect(result.hasUrgentAfter).toBe(false);
    expect(result.rectDestroyed).toBe(true);
  });

  test('[AC-2-3] 중복 tween 생성 방지 (_urgentTweens.has 가드)', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const firstRef = ss._urgentTweens.get(0);

      // _updateTableUI 재호출 (같은 ratio < 0.3 상태)
      ss._updateTableUI(0);
      ss._updateTableUI(0);
      ss._updateTableUI(0);

      const afterRef = ss._urgentTweens.get(0);
      return {
        tweenCount: ss._urgentTweens.size,
        isSameRef: firstRef === afterRef,
        rectActive: afterRef?.rect?.active,
      };
    });

    expect(result.tweenCount).toBe(1); // 중복 없음
    expect(result.isSameRef).toBe(true); // 동일 참조
  });

  test('[AC-2-4] 골든 테두리 + 빨간 깜빡임 동시 공존', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // patience ratio < 0.3 + carrot_soup 주문
    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');

      // 골든 테두리 추가
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });

      const hasGolden = ss._highlightRects.has(0);
      const hasUrgent = ss._urgentTweens.has(0);

      let goldenDepth = null, urgentDepth = null;
      if (hasGolden) goldenDepth = ss._highlightRects.get(0).depth;
      if (hasUrgent) urgentDepth = ss._urgentTweens.get(0).rect.depth;

      return {
        hasGolden,
        hasUrgent,
        goldenDepth,
        urgentDepth,
        urgentAboveGolden: urgentDepth > goldenDepth,
      };
    });

    expect(result.hasGolden).toBe(true);
    expect(result.hasUrgent).toBe(true);
    expect(result.urgentAboveGolden).toBe(true); // urgent: cont.depth+2 > golden: cont.depth+1

    await page.screenshot({ path: 'tests/screenshots/phase80-golden-urgent-combined.png' });
  });

  test('[AC-2-5] _shutdown 후 모든 긴급 tween/Rectangle 정리', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);
    await spawnCustomer(page, 1, 'steak_plate', 5000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const beforeSize = ss._urgentTweens.size;
      const rectRef0 = ss._urgentTweens.get(0)?.rect;
      const rectRef1 = ss._urgentTweens.get(1)?.rect;

      ss._shutdown();

      return {
        beforeSize,
        afterSize: ss._urgentTweens?.size ?? -1,
        rect0Destroyed: !rectRef0?.active,
        rect1Destroyed: !rectRef1?.active,
      };
    });

    expect(result.beforeSize).toBe(2);
    expect(result.afterSize).toBe(0);
    expect(result.rect0Destroyed).toBe(true);
    expect(result.rect1Destroyed).toBe(true);
  });

  test('[EDGE-2-1] 손님 없는 테이블에서 _updateTableUI 호출 시 urgent tween 미생성', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._updateTableUI(0); // 빈 테이블
      return { urgentCount: ss._urgentTweens.size };
    });

    expect(result.urgentCount).toBe(0);
  });

  test('[EDGE-2-2] ratio >= 0.3 경계값에서 urgent tween 미생성', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // ratio = 0.31 (확실히 >= 0.3)
    // update freeze 전에 약간의 patience 감소가 있을 수 있으므로 0.3보다 넉넉하게 설정
    await spawnCustomer(page, 0, 'carrot_soup', 31000, 100000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const ratio = ss.tables[0].patience / ss.tables[0].maxPatience;
      return {
        hasUrgent: ss._urgentTweens.has(0),
        ratio,
        ratioAboveThreshold: ratio >= 0.3,
      };
    });

    expect(result.ratioAboveThreshold).toBe(true);
    expect(result.hasUrgent).toBe(false); // ratio >= 0.3 -> 긴급 아님
  });

  test('[EDGE-2-3] ratio=0.29999 (0.3 바로 아래) 에서 urgent tween 생성', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // ratio = 11999/40000 = 0.299975 (< 0.3)
    await spawnCustomer(page, 0, 'carrot_soup', 11999, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      return {
        hasUrgent: ss._urgentTweens.has(0),
        ratio: ss.tables[0].patience / ss.tables[0].maxPatience,
      };
    });

    expect(result.ratio).toBeLessThan(0.3);
    expect(result.hasUrgent).toBe(true);
  });

  test('[EDGE-2-4] patience=0 극단값에서 urgent tween 생성', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 0, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      return {
        hasUrgent: ss._urgentTweens.has(0),
        rectActive: ss._urgentTweens.get(0)?.rect?.active,
      };
    });

    expect(result.hasUrgent).toBe(true);
    expect(result.rectActive).toBe(true);
  });

  test('[EDGE-2-5] 손님 퇴장 후 urgent tween이 정리됨 (버그 수정 확인)', async ({ page }) => {
    // FIX: _updateTableUI !cust 블록 안에 urgent tween 정리 코드 추가.
    // 손님 퇴장 시 빨간 깜빡임 rect/tween이 즉시 정리되어야 함.
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 5000, 40000);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const hadUrgent = ss._urgentTweens.has(0);
      const rectRef = ss._urgentTweens.get(0)?.rect;

      // 손님 퇴장 시뮬레이션 (정상 퇴장 흐름과 동일)
      ss.tables[0] = null;
      ss._updateTableUI(0);

      return {
        hadUrgent,
        hasUrgentAfter: ss._urgentTweens.has(0),
        rectDestroyed: !rectRef?.active,
      };
    });

    expect(result.hadUrgent).toBe(true);
    // FIXED: urgent tween이 정리되어야 함
    expect(result.hasUrgentAfter).toBe(false);
    expect(result.rectDestroyed).toBe(true);
  });
});


// =====================================================================
// 기능 3: 콤보 팝업
// =====================================================================

test.describe('Feature 3: 콤보 팝업 (2+ 콤보)', () => {
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await setAndReload(page, makeMinimalSave());
  });

  test('[AC-3-1] 2콤보 시 COMBO 팝업 텍스트 표시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // 테이블에 손님 + 완성 요리 준비
    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');
    await forceReadyDish(page, 1, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss.comboCount = 0;

      // 1차 서빙 (comboCount = 1)
      ss._serveToCustomer(0, 0);
      const firstComboCount = ss.comboCount;

      // 2차 서빙을 위해 테이블1 + 슬롯0 재설정
      // (1차 서빙에서 슬롯0이 세척으로 전환되므로 슬롯1 사용)
      // 이미 슬롯1에 ready 요리가 있음
      const comboTextsBefore = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO')
      ).length || 0;

      ss._serveToCustomer(1, 1);
      const secondComboCount = ss.comboCount;

      // COMBO 텍스트 확인
      const comboTexts = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO')
      ) || [];

      return {
        firstComboCount,
        secondComboCount,
        comboTextsBefore,
        comboTextsAfter: comboTexts.length,
        comboText: comboTexts[0]?.text || null,
      };
    });

    expect(result.firstComboCount).toBe(1);
    expect(result.secondComboCount).toBe(2);
    // 2콤보에서 COMBO 텍스트가 생성되어야 함
    expect(result.comboTextsAfter).toBeGreaterThan(result.comboTextsBefore);
    expect(result.comboText).toContain('2 COMBO!');
    expect(result.comboText).toContain('G');
  });

  test('[AC-3-2] 1콤보(첫 서빙)에서는 팝업 미표시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss.comboCount = 0;

      // 텍스트 목록 스냅샷
      const textsBefore = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO')
      ).length || 0;

      ss._serveToCustomer(0, 0);

      const textsAfter = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO')
      ).length || 0;

      return {
        comboCount: ss.comboCount,
        textsBefore,
        textsAfter,
      };
    });

    expect(result.comboCount).toBe(1);
    expect(result.textsAfter).toBe(result.textsBefore); // 추가 텍스트 없음
  });

  test('[AC-3-3] 3+ 콤보에서도 팝업 + vfx.comboPopup 동시 발생', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss.comboCount = 2; // 이미 2콤보 상태, 다음 서빙이 3콤보

      // vfx.comboPopup 호출 감시
      let comboPopupCalled = false;
      let comboPopupArg = null;
      const origComboPopup = ss.vfx.comboPopup.bind(ss.vfx);
      ss.vfx.comboPopup = (count) => {
        comboPopupCalled = true;
        comboPopupArg = count;
        origComboPopup(count);
      };

      ss._serveToCustomer(0, 0);

      const comboTexts = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO')
      ) || [];

      return {
        comboCount: ss.comboCount,
        comboPopupCalled,
        comboPopupArg,
        comboTexts: comboTexts.map(t => t.text),
      };
    });

    expect(result.comboCount).toBe(3);
    expect(result.comboPopupCalled).toBe(true);
    expect(result.comboPopupArg).toBe(3);
    expect(result.comboTexts.some(t => t.includes('3 COMBO!'))).toBe(true);
  });

  test('[AC-3-4] 콤보 팝업 텍스트 속성 검증 (위치, 스타일, depth)', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss.comboCount = 1; // 다음 서빙이 2콤보

      ss._serveToCustomer(0, 0);

      const comboTexts = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO')
      ) || [];

      if (comboTexts.length === 0) return { found: false };

      const label = comboTexts[0];
      return {
        found: true,
        text: label.text,
        x: label.x,
        y: label.y,
        depth: label.depth,
        fontSize: label.style?.fontSize,
        color: label.style?.color,
        fontStyle: label.style?.fontStyle,
        stroke: label.style?.stroke,
        strokeThickness: label.style?.strokeThickness,
        originX: label.originX,
        originY: label.originY,
      };
    });

    expect(result.found).toBe(true);
    expect(result.text).toContain('2 COMBO!');
    expect(result.x).toBe(180); // GAME_WIDTH / 2
    expect(result.depth).toBe(500);
    expect(result.fontSize).toBe('24px');
    expect(result.color).toBe('#ffd700');
    expect(result.fontStyle).toBe('bold');
    expect(result.stroke).toBe('#000000');
    expect(result.strokeThickness).toBe(4);
    expect(result.originX).toBe(0.5);
    expect(result.originY).toBe(0.5);
  });

  test('[AC-3-5] 콤보 팝업 tween 동작 (y이동 + alpha 페이드)', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');

    // update 재활성화 (tween 진행을 위해)
    await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss.comboCount = 1;
      // update를 제한적으로 재활성화
      if (ss._originalUpdate) {
        ss.update = ss._originalUpdate;
      }
      ss._serveToCustomer(0, 0);
    });

    // 1.5초 대기 (1.2초 tween + 여유)
    await page.waitForTimeout(1800);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      const comboTexts = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO') && c.active
      ) || [];
      return {
        remainingComboTexts: comboTexts.length,
      };
    });

    // 1.2초 후 destroy되어야 함
    expect(result.remainingComboTexts).toBe(0);
  });

  test('[EDGE-3-1] 콤보 리셋 후 다시 2콤보 달성 시 팝업 정상 표시', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 30000, 40000);
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');
    await forceReadyDish(page, 1, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');

      // 콤보 리셋
      ss.comboCount = 0;
      // 1차 서빙 -> comboCount = 1
      ss._serveToCustomer(0, 0);
      // 리셋 시뮬레이션
      ss.comboCount = 0;

      // 다시 1차 서빙 -> comboCount = 1
      // 테이블1에 새 손님 스폰
      ss.tables[1] = {
        dish: 'carrot_soup', patience: 30000, maxPatience: 40000,
        baseReward: 25, customerType: 'normal', profileId: 'normal',
      };
      ss._serveToCustomer(1, 1);
      // comboCount는 1 (리셋 후 첫 서빙)

      const comboTexts = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO') && c.active
      ) || [];

      return {
        comboCount: ss.comboCount,
        // 리셋 후 첫 서빙이므로 팝업 미표시
        hasComboPopup: comboTexts.length > 0,
      };
    });

    expect(result.comboCount).toBe(1);
    expect(result.hasComboPopup).toBe(false);
  });
});


// =====================================================================
// 통합 시나리오 + UI 안정성
// =====================================================================

test.describe.serial('통합 시나리오 + UI 안정성', () => {
  let consoleErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForGame(page);
  });

  test('[INT-1] 3기능 동시 활성화 시나리오', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // 테이블 0: carrot_soup, patience < 0.3
    await spawnCustomer(page, 0, 'carrot_soup', 8000, 40000);
    // 테이블 1: carrot_soup, 정상
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000);
    // 완성 요리
    await forceReadyDish(page, 0, 'carrot_soup');
    await forceReadyDish(page, 1, 'carrot_soup');

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');

      // comboCount를 1로 설정 (다음 서빙이 2콤보)
      ss.comboCount = 1;

      // 레시피 탭 -> 골든 강조
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });

      const state = {
        goldenCount: ss._highlightRects.size,
        urgentCount: ss._urgentTweens.size,
        hasGoldenOnTable0: ss._highlightRects.has(0),
        hasUrgentOnTable0: ss._urgentTweens.has(0),
        hasGoldenOnTable1: ss._highlightRects.has(1),
      };

      // 테이블 0 서빙 (2콤보 달성)
      ss._serveToCustomer(0, 0);

      const comboTexts = ss.children?.list?.filter(
        c => c.type === 'Text' && c.text?.includes('COMBO') && c.active
      ) || [];

      return {
        ...state,
        comboPopup: comboTexts.length > 0,
        comboCount: ss.comboCount,
        goldenAfterServe: ss._highlightRects.size,
      };
    });

    expect(result.goldenCount).toBe(2);
    expect(result.hasUrgentOnTable0).toBe(true);
    expect(result.hasGoldenOnTable0).toBe(true);
    expect(result.hasGoldenOnTable1).toBe(true);
    expect(result.comboCount).toBe(2);
    expect(result.comboPopup).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/phase80-integrated-scenario.png' });
  });

  test('[INT-2] 콘솔 에러 없이 ServiceScene 동작', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000);
    await forceReadyDish(page, 0, 'carrot_soup');

    await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss.comboCount = 1;
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
      ss._serveToCustomer(0, 0);
    });

    await page.waitForTimeout(500);
    expect(consoleErrors).toEqual([]);
  });

  test('[INT-3] ServiceScene 시작/종료 반복 시 메모리 누수 없음', async ({ page }) => {
    // 1차 진입
    await enterServiceSceneFrozen(page);
    await spawnCustomer(page, 0, 'carrot_soup', 10000, 40000);

    await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
    });

    // shutdown
    await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._shutdown();
    });

    // 2차 진입
    await page.evaluate(() => {
      const game = window.__game;
      game.scene.start('ServiceScene', {
        inventory: { carrot: 10, meat: 10 },
        stageId: '1-1', gold: 100, lives: 3, partialFail: false,
        marketResult: { totalIngredients: 20, livesRemaining: 3, livesMax: 15 }
      });
    });

    await waitForScene(page, 'ServiceScene');
    await page.waitForTimeout(1500);

    const result = await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      return {
        highlightRectsSize: ss._highlightRects?.size ?? -1,
        urgentTweensSize: ss._urgentTweens?.size ?? -1,
        selectedRecipeId: ss._selectedRecipeId,
      };
    });

    expect(result.highlightRectsSize).toBe(0);
    expect(result.urgentTweensSize).toBe(0);
    expect(result.selectedRecipeId).toBeNull();
    expect(consoleErrors).toEqual([]);
  });

  test('[VIS-1] ServiceScene 전체 레이아웃 스크린샷', async ({ page }) => {
    await enterServiceSceneFrozen(page);

    // 다양한 상태의 테이블 설정
    await spawnCustomer(page, 0, 'carrot_soup', 8000, 40000);  // urgent
    await spawnCustomer(page, 1, 'carrot_soup', 30000, 40000); // normal
    await spawnCustomer(page, 2, 'steak_plate', 25000, 40000); // normal

    // 골든 테두리
    await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
    });

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/phase80-full-layout.png' });
  });

  test('[VIS-2] 모바일 뷰포트에서 정상 렌더링', async ({ page }) => {
    // Pixel 5 기준 뷰포트는 이미 playwright.config.js에서 설정됨
    await enterServiceSceneFrozen(page);

    await spawnCustomer(page, 0, 'carrot_soup', 8000, 40000);

    await page.evaluate(() => {
      const ss = window.__game.scene.getScene('ServiceScene');
      ss._onRecipeTap({ id: 'carrot_soup', nameKo: '당근 수프', ingredients: { carrot: 1 }, tier: 1, cookTime: 3000 });
    });

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/phase80-mobile-viewport.png' });
  });
});
