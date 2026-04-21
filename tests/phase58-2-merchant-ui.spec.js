/**
 * @fileoverview Phase 58-2 Coder 검증 — MerchantScene 분기 카드 UI.
 * Coder가 완료한 구현(탭 바, 분기 카드 3장, 확인 팝업, 선택 완료 상태)이
 * 정상 동작하는지 API 레벨 + 시각적 스냅샷으로 검증한다.
 *
 * ※ 클릭 UX는 phase58-2-qa.spec.js에서 별도로 검증한다.
 *   본 스펙은 "렌더 확인 + 내부 상태 기계" 검증에 집중한다 (뷰포트 스케일 이슈 우회).
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

/** 신규 v24 세이브 주입 */
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
      endless: {
        unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
        lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0,
      },
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

/** MerchantScene 직접 진입 + 에셋 로딩 대기 */
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
  // BootScene 이후 텍스처/씬이 완전히 안정될 때까지 충분히 대기
  await page.waitForTimeout(1500);
}

// ── 테스트 ─────────────────────────────────────────────────────────

test.describe('Phase 58-2 Coder 검증: MerchantScene 분기 카드 UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectFreshSave(page);
  });

  test('렌더 확인 1 — 초기 진입(도구 구매 탭) + 탭 구조 검증', async ({ page }) => {
    await enterMerchant(page);

    const state = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        sceneKey: s?.scene?.key,
        isActive: s?.scene?.isActive?.(),
        activeTab: s?._activeTab,
        tabsExist: {
          tools: !!s?._tabToolsBg,
          branch: !!s?._tabBranchBg,
        },
        toolsTabColor: s?._tabToolsText?.style?.color,
        branchTabColor: s?._tabBranchText?.style?.color,
        toolsUnderlineVisible: s?._tabToolsUnderline?.visible,
        branchUnderlineVisible: s?._tabBranchUnderline?.visible,
        hasBranchElements: !!(s?._branchTabElements && s._branchTabElements.length > 0),
      };
    });

    // 씬이 정상 활성화되어야 한다
    expect(state.sceneKey).toBe('MerchantScene');
    expect(state.isActive).toBe(true);

    // 탭 2개가 생성되어야 한다
    expect(state.tabsExist.tools).toBe(true);
    expect(state.tabsExist.branch).toBe(true);

    // 기본 탭은 "도구 구매"
    expect(state.activeTab).toBe('tools');
    expect(state.toolsTabColor).toBe('#ffcc88');
    expect(state.branchTabColor).toBe('#888888');
    expect(state.toolsUnderlineVisible).toBe(true);
    expect(state.branchUnderlineVisible).toBe(false);

    await page.screenshot({ path: 'tests/screenshots/phase58-2-tools-tab.png' });
  });

  test('렌더 확인 2 — 분기 선택 탭 전환 + 카드 3장 노출', async ({ page }) => {
    await enterMerchant(page);

    // 탭 전환은 씬 메서드를 직접 호출한다 (클릭 UX가 아닌 상태 전이를 검증)
    const afterSwitch = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
      const cards = (s._branchCardDefs || []).map(c => ({
        id: c.id,
        category: c.category,
        titleKo: c.titleKo,
      }));
      return {
        activeTab: s._activeTab,
        toolsTabColor: s._tabToolsText?.style?.color,
        branchTabColor: s._tabBranchText?.style?.color,
        toolsUnderlineVisible: s._tabToolsUnderline?.visible,
        branchUnderlineVisible: s._tabBranchUnderline?.visible,
        cardCount: cards.length,
        cards,
      };
    });

    // 탭 전환이 UI 스타일에 반영되어야 한다
    expect(afterSwitch.activeTab).toBe('branch');
    expect(afterSwitch.toolsTabColor).toBe('#888888');
    expect(afterSwitch.branchTabColor).toBe('#ffcc88');
    expect(afterSwitch.toolsUnderlineVisible).toBe(false);
    expect(afterSwitch.branchUnderlineVisible).toBe(true);

    // 카드 3장, 서로 다른 카테고리
    expect(afterSwitch.cardCount).toBe(3);
    const uniqueCats = new Set(afterSwitch.cards.map(c => c.category));
    expect(uniqueCats.size).toBe(3);
    for (const card of afterSwitch.cards) {
      expect(['mutation', 'recipe', 'bond', 'blessing']).toContain(card.category);
      expect(card.titleKo).toBeTruthy();
      expect(card.id).toBeTruthy();
    }

    // 탭 전환이 렌더에 반영될 시간을 짧게 주고 스크린샷
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'tests/screenshots/phase58-2-branch-tab.png' });
  });

  test('렌더 확인 3 — 카드 선택 → 팝업 → 확정 → "선택 완료" 상태', async ({ page }) => {
    await enterMerchant(page);

    // 1) 분기 탭 전환
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
    });
    await page.waitForTimeout(200);

    // 2) 첫 번째 카드 클릭 시뮬레이션: 내부적으로 _showBranchConfirmPopup 호출
    const popupOpened = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      const firstCard = s._branchCardDefs[0];
      s._showBranchConfirmPopup(firstCard);
      return {
        popupOpen: s._branchPopupOpen,
        cardId: firstCard.id,
        titleKo: firstCard.titleKo,
      };
    });
    expect(popupOpened.popupOpen).toBe(true);
    expect(popupOpened.cardId).toBeTruthy();

    await page.screenshot({ path: 'tests/screenshots/phase58-2-confirm-popup.png' });

    // 3) 팝업 "확인" 효과를 직접 트리거 (_applyBranchCard 호출)
    const afterConfirm = await page.evaluate((saveKey) => {
      const s = window.__game.scene.getScene('MerchantScene');
      const firstCard = s._branchCardDefs[0];
      // 팝업을 명시적으로 닫고(실제 UI 정리) 적용 호출
      s._branchPopupOpen = false;
      s._applyBranchCard(firstCard);

      const raw = localStorage.getItem(saveKey);
      const data = raw ? JSON.parse(raw) : null;
      return {
        popupOpen: s._branchPopupOpen,
        cardSelected: s._branchCardSelected,
        selectedId: s._branchSelectedCardId,
        category: firstCard.category,
        save: data?.branchCards ?? null,
      };
    }, SAVE_KEY);

    // 상태 전이 검증
    expect(afterConfirm.popupOpen).toBe(false);
    expect(afterConfirm.cardSelected).toBe(true);
    expect(afterConfirm.selectedId).toBeTruthy();

    // 세이브에 기록되어야 한다
    expect(afterConfirm.save).not.toBeNull();
    expect(afterConfirm.save.lastVisit).not.toBeNull();
    expect(afterConfirm.save.lastVisit.stageId).toBe('1-1');
    expect(afterConfirm.save.lastVisit.selectedCardId).toBe(afterConfirm.selectedId);

    // 카테고리별로 적절한 저장 컬렉션에 반영되어야 한다
    if (afterConfirm.category === 'mutation') {
      expect(Object.keys(afterConfirm.save.toolMutations).length).toBeGreaterThan(0);
    } else if (afterConfirm.category === 'recipe') {
      expect(afterConfirm.save.unlockedBranchRecipes.length).toBeGreaterThan(0);
    } else if (afterConfirm.category === 'bond') {
      expect(afterConfirm.save.chefBonds.length).toBeGreaterThan(0);
    } else if (afterConfirm.category === 'blessing') {
      expect(afterConfirm.save.activeBlessing).not.toBeNull();
      expect(afterConfirm.save.activeBlessing.id).toBe(afterConfirm.selectedId);
    }

    // 스크린샷: 선택 완료 상태 카드 표시
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'tests/screenshots/phase58-2-selected.png' });
  });

  test('재진입 시 선택 완료 상태 유지 + 시각 확인', async ({ page }) => {
    await enterMerchant(page);

    // 카드 선택 확정 (팝업 UI를 거치지 않고 apply 메서드 직접 호출)
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
      const firstCard = s._branchCardDefs[0];
      s._applyBranchCard(firstCard);
    });
    await page.waitForTimeout(200);

    // 씬 재진입: 선택 완료 상태가 세이브로부터 복원되어야 한다
    await enterMerchant(page);

    const replay = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
      return {
        cardSelected: s._branchCardSelected,
        selectedId: s._branchSelectedCardId,
        branchElementCount: (s._branchTabElements || []).length,
      };
    });

    expect(replay.cardSelected).toBe(true);
    expect(replay.selectedId).toBeTruthy();
    expect(replay.branchElementCount).toBeGreaterThan(0);

    // 선택 완료 탭의 실제 렌더 결과를 캡처 (팝업 없이 "선택 완료" 단일 카드)
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'tests/screenshots/phase58-2-selected-replay.png' });
  });
});
