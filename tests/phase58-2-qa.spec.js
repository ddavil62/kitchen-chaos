/**
 * @fileoverview Phase 58-2 QA: MerchantScene 분기 카드 UI 검증.
 * - 상단 탭 2개 (도구 구매 / 분기 선택)
 * - 분기 선택 탭 콘텐츠 토글
 * - 카드 3장 노출 (서로 다른 카테고리)
 * - 카드 선택 시 확인 팝업
 * - 팝업 확인 후 세이브 반영 + "선택 완료" 상태 고정
 * - 재진입(scene restart) 후에도 선택 완료 상태 유지
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

/** 게임 로드 대기 */
async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

/** 신규 v24 세이브 주입 (mimi만 선택) */
async function injectFreshSave(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 24,
      selectedChef: 'mimi_chef',
      stages: {},
      gold: 500,
      toolInventory: { pan: { count: 1, level: 1 } },
      season2Unlocked: false, season3Unlocked: false,
      storyProgress: { currentChapter: 1, storyFlags: {} },
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
        lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
      branchCards: {
        toolMutations: {},
        unlockedBranchRecipes: [],
        chefBonds: [],
        activeBlessing: null,
        lastVisit: null,
      },
    }));
  }, SAVE_KEY);
}

/** MerchantScene 직접 진입 */
async function enterMerchant(page, stageId = '1-1') {
  await page.evaluate((sid) => {
    const game = window.__game;
    game.scene.scenes.forEach(s => {
      if (s.scene.isActive()) game.scene.stop(s.scene.key);
    });
    game.scene.start('MerchantScene', {
      stageId: sid,
      marketResult: null,
      serviceResult: null,
      isMarketFailed: false,
    });
  }, stageId);
  await page.waitForTimeout(800);
}

/** 게임 내 좌표 → 뷰포트 좌표 */
async function gameToViewport(page, gx, gy) {
  return page.evaluate(([x, y]) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { vx: x, vy: y };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      vx: rect.left + x * scaleX,
      vy: rect.top + y * scaleY,
    };
  }, [gx, gy]);
}

async function clickGameXY(page, gx, gy) {
  const { vx, vy } = await gameToViewport(page, gx, gy);
  await page.mouse.click(vx, vy);
}

// ── 테스트 ─────────────────────────────────────────────────────────

test.describe('Phase 58-2: MerchantScene 분기 카드 UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectFreshSave(page);
  });

  test('시나리오 1: 탭 2개 + 분기 선택 탭에서 카드 3장 노출', async ({ page }) => {
    await enterMerchant(page);

    // 탭 바 확인
    const tabState = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        activeTab: s._activeTab,
        toolsTextColor: s._tabToolsText?.style?.color,
        branchTextColor: s._tabBranchText?.style?.color,
        toolsUnderlineVisible: s._tabToolsUnderline?.visible,
        branchUnderlineVisible: s._tabBranchUnderline?.visible,
      };
    });
    expect(tabState.activeTab).toBe('tools');
    expect(tabState.toolsUnderlineVisible).toBe(true);
    expect(tabState.branchUnderlineVisible).toBe(false);

    // 분기 탭 클릭 (우측 탭: GAME_WIDTH=360, halfW=180, 우측 중심 = 180 + 90 - 10 = 260, Y=67)
    await clickGameXY(page, 260, 67);
    await page.waitForTimeout(300);

    const afterTab = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        activeTab: s._activeTab,
        cardCount: (s._branchCardDefs || []).length,
        branchUnderlineVisible: s._tabBranchUnderline?.visible,
        toolsUnderlineVisible: s._tabToolsUnderline?.visible,
        categories: (s._branchCardDefs || []).map(c => c.category),
        cardIds: (s._branchCardDefs || []).map(c => c.id),
      };
    });
    expect(afterTab.activeTab).toBe('branch');
    expect(afterTab.cardCount).toBe(3);
    expect(afterTab.branchUnderlineVisible).toBe(true);
    expect(afterTab.toolsUnderlineVisible).toBe(false);
    // 카드 3장의 카테고리가 서로 다르다
    const uniqueCats = new Set(afterTab.categories);
    expect(uniqueCats.size).toBe(afterTab.cardCount);

    await page.screenshot({ path: 'tests/screenshots/phase58-2-branch-tab.png' });
  });

  test('시나리오 2: 카드 클릭 → 확인 팝업 → 확정 → 선택 완료', async ({ page }) => {
    await enterMerchant(page);
    // 분기 탭으로 전환
    await clickGameXY(page, 260, 67);
    await page.waitForTimeout(300);

    // 첫 번째 카드 중심 좌표 계산: CARD_START_X=20, CARD_WIDTH=100, CARD_GAP=10, CARD_CENTER_Y=310
    // 첫 카드 중심 X = 20 + 100/2 = 70
    await clickGameXY(page, 70, 310);
    await page.waitForTimeout(300);

    const popupState = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return { popupOpen: s._branchPopupOpen };
    });
    expect(popupState.popupOpen).toBe(true);

    await page.screenshot({ path: 'tests/screenshots/phase58-2-confirm-popup.png' });

    // "확인" 버튼 클릭 — 팝업 내부에서 cx-60, cy+popupH/2-25 기준. popupH 기본 170 → Y ≈ 320 + 85-25 = 380 영역
    // 실제 팝업은 GAME_HEIGHT/2=320 중심. 확인 버튼은 (cx-60, cy+popupH/2-25) = (120, 320+60)=120,380
    await clickGameXY(page, 120, 380);
    await page.waitForTimeout(500);

    const afterConfirm = await page.evaluate((saveKey) => {
      const s = window.__game.scene.getScene('MerchantScene');
      const raw = localStorage.getItem(saveKey);
      const data = raw ? JSON.parse(raw) : null;
      return {
        popupOpen: s._branchPopupOpen,
        cardSelected: s._branchCardSelected,
        selectedId: s._branchSelectedCardId,
        lastVisit: data?.branchCards?.lastVisit,
        toolMutations: data?.branchCards?.toolMutations,
        unlockedBranchRecipes: data?.branchCards?.unlockedBranchRecipes,
        chefBonds: data?.branchCards?.chefBonds,
        activeBlessing: data?.branchCards?.activeBlessing,
      };
    }, SAVE_KEY);

    expect(afterConfirm.popupOpen).toBe(false);
    expect(afterConfirm.cardSelected).toBe(true);
    expect(afterConfirm.selectedId).toBeTruthy();
    expect(afterConfirm.lastVisit).not.toBeNull();
    expect(afterConfirm.lastVisit.stageId).toBe('1-1');
    expect(afterConfirm.lastVisit.selectedCardId).toBe(afterConfirm.selectedId);

    await page.screenshot({ path: 'tests/screenshots/phase58-2-selected.png' });
  });

  test('시나리오 3: 선택 후 재진입 시 선택 완료 상태 유지', async ({ page }) => {
    await enterMerchant(page);
    await clickGameXY(page, 260, 67);
    await page.waitForTimeout(300);

    // 첫 카드 클릭 → 확정
    await clickGameXY(page, 70, 310);
    await page.waitForTimeout(300);
    await clickGameXY(page, 120, 380);
    await page.waitForTimeout(400);

    // Merchant 씬 재시작
    await enterMerchant(page);
    await clickGameXY(page, 260, 67);
    await page.waitForTimeout(300);

    const replayState = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        cardSelected: s._branchCardSelected,
        selectedId: s._branchSelectedCardId,
      };
    });
    expect(replayState.cardSelected).toBe(true);
    expect(replayState.selectedId).toBeTruthy();

    await page.screenshot({ path: 'tests/screenshots/phase58-2-replay.png' });
  });

  test('시나리오 4: 배지 텍스처 4종 로드 확인', async ({ page }) => {
    await enterMerchant(page);
    const badgeLoaded = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        mutation: s.textures.exists('badge_mutation'),
        recipe:   s.textures.exists('badge_recipe'),
        bond:     s.textures.exists('badge_bond'),
        blessing: s.textures.exists('badge_blessing'),
      };
    });
    expect(badgeLoaded.mutation).toBe(true);
    expect(badgeLoaded.recipe).toBe(true);
    expect(badgeLoaded.bond).toBe(true);
    expect(badgeLoaded.blessing).toBe(true);
  });
});
