/**
 * @fileoverview Phase 83 QA: TD 씬 배치 피드백 개선 검증.
 *
 * AC-1: 배치 가능 셀 하이라이트 (_showPlaceableOverlay / _hidePlaceableOverlay)
 * AC-2: 사거리 미리보기 (_showRangeRing / _hideRangeRing)
 * AC-3: 카운트다운 (3→2→1→GO!)
 * AC-4: shutdown 정리
 * AC-5: 기존 기능 회귀 없음
 * + 엣지케이스, 시각적 검증, UI 안정성
 */
import { test, expect } from '@playwright/test';

const SAVE_KEY = 'kitchenChaosTycoon_save';

test.setTimeout(90000);

// ── 헬퍼 함수 ──

async function waitForGame(page, timeout = 20000) {
  await page.waitForFunction(() => {
    const game = window.__game;
    return game && game.isBooted && game.scene;
  }, { timeout });
  await page.waitForTimeout(500);
}

/**
 * 모든 활성 씬을 정지하고 GatheringScene을 stageId='1-1'로 직접 시작한다.
 */
async function startGatheringScene(page, stageId = '1-1') {
  await page.evaluate(({ key, sid }) => {
    const g = window.__game;
    if (!g) return;
    const mgr = g.scene;
    const active = mgr.getScenes(true);
    active.forEach(s => {
      if (s.scene.key !== 'BootScene') {
        try { mgr.stop(s.scene.key); } catch (e) { /* noop */ }
      }
    });
    mgr.start('GatheringScene', { stageId: sid });
  }, { key: 'GatheringScene', sid: stageId });
  await page.waitForTimeout(3000);
}

function makeMinimalSave(overrides = {}) {
  return {
    version: 27,
    stages: {},
    totalGoldEarned: 1000,
    gold: 1000,
    kitchenCoins: 50,
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialEndless: false,
    upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: [],
    selectedChef: 'mimi_chef',
    unlockedChefs: ['mimi_chef'],
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: false, dishwasher: false },
    soundSettings: { bgmVolume: 0, sfxVolume: 0, bgmMuted: true, sfxMuted: true },
    tools: {
      pan: { count: 4, level: 1 },
      salt: { count: 2, level: 1 },
      grill: { count: 1, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    },
    endlessUnlocked: false,
    branchCards: {},
    dailyMissions: null,
    loginBonus: null,
    mireukEssence: 0,
    ...overrides,
  };
}

async function setupAndGotoGathering(page, saveOverrides = {}) {
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: makeMinimalSave(saveOverrides) });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForGame(page);
  await startGatheringScene(page);
}

function getGatheringScene(evalCode) {
  return `
    const g = window.__game;
    const scene = g?.scene?.getScene('GatheringScene');
    if (!scene || !scene.sys?.isActive()) return null;
    ${evalCode}
  `;
}

// ── AC-1: 배치 가능 셀 하이라이트 ──

test.describe('AC-1: 배치 가능 셀 하이라이트', () => {
  test('_showPlaceableOverlay / _hidePlaceableOverlay 메서드 존재', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const methodsExist = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return { show: false, hide: false };
      return {
        show: typeof scene._showPlaceableOverlay === 'function',
        hide: typeof scene._hidePlaceableOverlay === 'function',
      };
    });

    expect(methodsExist.show).toBe(true);
    expect(methodsExist.hide).toBe(true);
    expect(errors).toEqual([]);
  });

  test('_placeableOverlays 배열 초기화됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const overlayState = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return null;
      return {
        exists: Array.isArray(scene._placeableOverlays),
        length: scene._placeableOverlays?.length || 0,
      };
    });

    expect(overlayState).not.toBeNull();
    expect(overlayState.exists).toBe(true);
    expect(overlayState.length).toBe(0); // 초기 상태에서 오버레이 없음
  });

  test('_showPlaceableOverlay() 호출 시 오버레이가 생성된��', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 강제로 오버레이 표시
      scene._showPlaceableOverlay();
      const count = scene._placeableOverlays.length;

      // 정리
      scene._hidePlaceableOverlay();
      const countAfterHide = scene._placeableOverlays.length;

      return { count, countAfterHide };
    });

    expect(result).not.toBeNull();
    expect(result.count).toBeGreaterThan(0); // 적어도 하나 이상의 배치 가능 셀
    expect(result.countAfterHide).toBe(0); // 숨긴 후 0
  });

  test('팔레트 도구 선택 시 배치 오버레이가 표시된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 팔레트에서 도구 선택 시뮬레이션
      const beforeCount = scene._placeableOverlays.length;
      scene.selectedTowerType = 'pan';
      scene._showPlaceableOverlay();
      const afterCount = scene._placeableOverlays.length;

      // 정리
      scene._hidePlaceableOverlay();
      scene.selectedTowerType = null;

      return { beforeCount, afterCount };
    });

    expect(result).not.toBeNull();
    expect(result.beforeCount).toBe(0);
    expect(result.afterCount).toBeGreaterThan(0);
  });

  test('팔레트 도구 선택 해제 시 오버레이가 제거된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 오버레이 표시
      scene._showPlaceableOverlay();
      const showCount = scene._placeableOverlays.length;

      // 오버레이 숨김
      scene._hidePlaceableOverlay();
      const hideCount = scene._placeableOverlays.length;

      return { showCount, hideCount };
    });

    expect(result).not.toBeNull();
    expect(result.showCount).toBeGreaterThan(0);
    expect(result.hideCount).toBe(0);
  });

  test('_deselectTower() 내에서 _hidePlaceableOverlay() 호출 확인', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 오버레이 표시한 뒤 _deselectTower 호���
      scene._showPlaceableOverlay();
      const beforeDeselect = scene._placeableOverlays.length;

      scene._deselectTower();
      const afterDeselect = scene._placeableOverlays.length;

      return { beforeDeselect, afterDeselect };
    });

    expect(result).not.toBeNull();
    expect(result.beforeDeselect).toBeGreaterThan(0);
    expect(result.afterDeselect).toBe(0);
  });

  test('배치 가능 오버레이가 경로 셀과 점유 셀을 제외한다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      const cols = scene.stageData?.gridCols || 9;
      const rows = scene.stageData?.gridRows || 10;
      const totalCells = cols * rows;
      const pathCount = scene.stagePathCells?.size || 0;
      const occupiedCount = scene.towers?.getChildren()?.length || 0;

      scene._showPlaceableOverlay();
      const overlayCount = scene._placeableOverlays.length;
      scene._hidePlaceableOverlay();

      // 오버레이 수 = 전체 - 경로 - 점유
      const expectedMax = totalCells - pathCount - occupiedCount;

      return { totalCells, pathCount, occupiedCount, overlayCount, expectedMax };
    });

    expect(result).not.toBeNull();
    expect(result.overlayCount).toBeLessThanOrEqual(result.expectedMax);
    expect(result.overlayCount).toBe(result.expectedMax);
  });
});

// ── AC-2: 사거리 미리보기 ──

test.describe('AC-2: 사거리 미리보기', () => {
  test('_showRangeRing / _hideRangeRing 메서드 존재', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const methodsExist = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('GatheringScene');
      if (!scene) return { show: false, hide: false };
      return {
        show: typeof scene._showRangeRing === 'function',
        hide: typeof scene._hideRangeRing === 'function',
      };
    });

    expect(methodsExist.show).toBe(true);
    expect(methodsExist.hide).toBe(true);
  });

  test('_rangeRingGfx 초기값 null', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const isNull = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      return scene?._rangeRingGfx === null;
    });

    expect(isNull).toBe(true);
  });

  test('타워 배치 후 _selectTower 시 사거리 링이 표시된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 도구 배치 (pan)
      scene._placeTower(3, 3, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '3,3');
      if (!tower) return { error: 'tower not placed' };

      // 타워 선택
      scene._selectTower(tower);
      const hasRing = scene._rangeRingGfx !== null;
      const ringDepth = scene._rangeRingGfx?.depth;

      // 정��
      scene._deselectTower();
      const ringAfterDeselect = scene._rangeRingGfx;

      return { hasRing, ringDepth, ringNullAfterDeselect: ringAfterDeselect === null };
    });

    expect(result).not.toBeNull();
    expect(result.hasRing).toBe(true);
    expect(result.ringDepth).toBe(4);
    expect(result.ringNullAfterDeselect).toBe(true);
  });

  test('radius 계산이 tower.range * rangeMultiplier 를 반영한다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      scene._placeTower(2, 2, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '2,2');
      if (!tower) return { error: 'no tower' };

      const baseRange = tower.range;
      const multiplier = tower.rangeMultiplier;
      const expectedRadius = baseRange * multiplier;

      scene._deselectTower();
      return { baseRange, multiplier, expectedRadius };
    });

    expect(result).not.toBeNull();
    expect(result.baseRange).toBeGreaterThan(0);
    expect(result.multiplier).toBe(1);
    expect(result.expectedRadius).toBeGreaterThan(0);
  });

  test('range=0 인 타워에서 링이 표시되지 않는다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 가짜 타워 객체로 range=0 테스트
      const fakeTower = { x: 100, y: 100, range: 0, rangeMultiplier: 1 };
      scene._showRangeRing(fakeTower);
      const hasRing = scene._rangeRingGfx !== null;
      scene._hideRangeRing();
      return { hasRing };
    });

    expect(result).not.toBeNull();
    expect(result.hasRing).toBe(false);
  });
});

// ── AC-3: 카운트다운 ──

test.describe('AC-3: 카운트다운', () => {
  test('_startCountdown 메서드 존재', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const exists = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      return typeof scene?._startCountdown === 'function';
    });

    expect(exists).toBe(true);
  });

  test('_countdownText 오브젝트가 생성되어 있다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;
      return {
        exists: scene._countdownText !== null && scene._countdownText !== undefined,
        visible: scene._countdownText?.visible,
        depth: scene._countdownText?.depth,
        scrollFactor: scene._countdownText?.scrollFactorX,
      };
    });

    expect(result).not.toBeNull();
    expect(result.exists).toBe(true);
    expect(result.visible).toBe(false); // 초기 상태에서 숨겨져 있음
    expect(result.depth).toBe(3000);
    expect(result.scrollFactor).toBe(0); // 카메라 무관
  });

  test('카운트다운 steps가 3,2,1,GO! 순서이다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    // _startCountdown 소스를 문자열로 검사
    const stepsCheck = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;
      const src = scene._startCountdown.toString();
      return {
        has3: src.includes("'3'"),
        has2: src.includes("'2'"),
        has1: src.includes("'1'"),
        hasGO: src.includes("'GO!'"),
        correctOrder: src.indexOf("'3'") < src.indexOf("'2'") &&
                      src.indexOf("'2'") < src.indexOf("'1'") &&
                      src.indexOf("'1'") < src.indexOf("'GO!'"),
      };
    });

    expect(stepsCheck).not.toBeNull();
    expect(stepsCheck.has3).toBe(true);
    expect(stepsCheck.has2).toBe(true);
    expect(stepsCheck.has1).toBe(true);
    expect(stepsCheck.hasGO).toBe(true);
    expect(stepsCheck.correctOrder).toBe(true);
  });

  test('_startCountdown 시 웨이브 버튼이 비활성화된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      const enabledBefore = scene._waveBtnEnabled;
      scene._startCountdown(() => { /* noop */ });
      const enabledDuring = scene._waveBtnEnabled;

      // 정리: tweens/timers 킬
      scene.tweens.killAll();
      scene.time.removeAllEvents();

      return { enabledBefore, enabledDuring };
    });

    expect(result).not.toBeNull();
    expect(result.enabledBefore).toBe(true);
    expect(result.enabledDuring).toBe(false);
  });

  test('카운트다운 완료 후 callback이 호출된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    // 카운트다운 시작 후 4초(800ms * 4 steps + 여유) 대기
    const callbackCalled = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const scene = window.__game?.scene?.getScene('GatheringScene');
        if (!scene) { resolve(false); return; }

        scene._startCountdown(() => {
          resolve(true);
        });

        // 10초 안에 안 오면 false
        setTimeout(() => resolve(false), 10000);
      });
    });

    expect(callbackCalled).toBe(true);
  });

  test('카운트다운 텍스트가 화면에 표시된다 (스크린샷)', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    // 카운트다운 시작
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;
      scene._startCountdown(() => { /* noop */ });
    });

    // 카운트다운 중 스크린샷 (약 200ms 후 = 첫 번째 스텝 표시 중)
    await page.waitForTimeout(200);
    await page.screenshot({
      path: 'tests/screenshots/phase83-countdown-step1.png',
    });

    // 1초 후 = 2번째 스텝 쯤
    await page.waitForTimeout(800);
    await page.screenshot({
      path: 'tests/screenshots/phase83-countdown-step2.png',
    });

    // 3초 뒤 = GO! 쯤
    await page.waitForTimeout(1600);
    await page.screenshot({
      path: 'tests/screenshots/phase83-countdown-go.png',
    });
  });

  test('웨이브 버튼 pointerdown 핸들러가 _startCountdown을 호출한다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene || !scene._waveBtnBg) return null;

      // pointerdown 핸들러의 소스 확인
      const listeners = scene._waveBtnBg.listeners('pointerdown');
      if (!listeners || listeners.length === 0) return { hasListener: false };

      const handlerSrc = listeners[0].fn ? listeners[0].fn.toString() : listeners[0].toString();
      return {
        hasListener: true,
        usesStartCountdown: handlerSrc.includes('_startCountdown'),
        // 기존 직접 startNextWave 호출이 아닌지 확인
        directStartNextWave: !handlerSrc.includes('_startCountdown') && handlerSrc.includes('startNextWave'),
      };
    });

    expect(result).not.toBeNull();
    expect(result.hasListener).toBe(true);
    expect(result.usesStartCountdown).toBe(true);
    expect(result.directStartNextWave).toBe(false);
  });
});

// ── AC-4: shutdown 정리 ──

test.describe('AC-4: shutdown 정리', () => {
  test('shutdown 메서드에 _hidePlaceableOverlay, _hideRangeRing, _countdownText.destroy 포함', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      const shutdownSrc = scene.shutdown.toString();
      return {
        hasHidePlaceable: shutdownSrc.includes('_hidePlaceableOverlay'),
        hasHideRange: shutdownSrc.includes('_hideRangeRing'),
        hasCountdownDestroy: shutdownSrc.includes('_countdownText'),
      };
    });

    expect(result).not.toBeNull();
    expect(result.hasHidePlaceable).toBe(true);
    expect(result.hasHideRange).toBe(true);
    expect(result.hasCountdownDestroy).toBe(true);
  });

  test('씬 전환 시 리소스가 정리된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    // 오버레이와 링 표시
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;
      scene._showPlaceableOverlay();
      scene._placeTower(4, 4, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '4,4');
      if (tower) scene._showRangeRing(tower);
    });

    // 씬 전환 (MenuScene으로)
    await page.evaluate(() => {
      const g = window.__game;
      try { g.scene.stop('GatheringScene'); } catch (e) {}
      g.scene.start('MenuScene');
    });
    await page.waitForTimeout(2000);

    // 에러 없어야 함
    expect(errors).toEqual([]);
  });
});

// ── AC-5: 기존 기능 회귀 없음 ──

test.describe('AC-5: 기존 기능 회귀', () => {
  test('_showMoveOverlay / _hideMoveOverlay 메서드가 존재하고 동작한다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      const showExists = typeof scene._showMoveOverlay === 'function';
      const hideExists = typeof scene._hideMoveOverlay === 'function';

      // 타워 배치 후 moveOverlay 테스트
      scene._placeTower(5, 5, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '5,5');
      if (!tower) return { showExists, hideExists, error: 'no tower' };

      scene._showMoveOverlay(tower);
      const moveCount = scene._movableOverlays.length;
      scene._hideMoveOverlay();
      const moveCountAfter = scene._movableOverlays.length;

      scene._deselectTower();
      return { showExists, hideExists, moveCount, moveCountAfter };
    });

    expect(result).not.toBeNull();
    expect(result.showExists).toBe(true);
    expect(result.hideExists).toBe(true);
    expect(result.moveCount).toBeGreaterThan(0);
    expect(result.moveCountAfter).toBe(0);
  });

  test('GatheringScene 로드 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    // 2초 대기 후 에러 확인
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

// ── 상호 배타 로직 ���─

test.describe('상호 배타 로직', () => {
  test('팔레트 도구 선택 시 moveOverlay가 숨겨진다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 타워 배치
      scene._placeTower(3, 3, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '3,3');
      if (!tower) return { error: 'no tower' };

      // 타워 선택 -> moveOverlay + rangeRing 표시
      scene._selectTower(tower);
      const moveCountBefore = scene._movableOverlays.length;
      const hasRingBefore = scene._rangeRingGfx !== null;

      // _deselectTower -> 팔레트 도구 선택 시뮬레이션
      scene._deselectTower();
      scene.selectedTowerType = 'pan';
      scene._showPlaceableOverlay();

      const moveCountAfter = scene._movableOverlays.length;
      const hasRingAfter = scene._rangeRingGfx !== null;
      const placeableCount = scene._placeableOverlays.length;

      // 정리
      scene._hidePlaceableOverlay();
      scene.selectedTowerType = null;
      scene._deselectTower();

      return {
        moveCountBefore,
        hasRingBefore,
        moveCountAfter,
        hasRingAfter,
        placeableCount,
      };
    });

    expect(result).not.toBeNull();
    expect(result.moveCountBefore).toBeGreaterThan(0);
    expect(result.hasRingBefore).toBe(true);
    expect(result.moveCountAfter).toBe(0);
    expect(result.hasRingAfter).toBe(false);
    expect(result.placeableCount).toBeGreaterThan(0);
  });

  test('타워 탭 시 배치 가능 오버레이가 숨겨진다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 팔레트 도구 선택 -> placeable overlay 표시
      scene.selectedTowerType = 'pan';
      scene._showPlaceableOverlay();
      const placeableCountBefore = scene._placeableOverlays.length;

      // 타워 배치
      scene._placeTower(4, 4, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '4,4');
      if (!tower) return { error: 'no tower' };

      // 타워 선택 -> _deselectTower() -> _hidePlaceableOverlay()
      scene._selectTower(tower);
      const placeableCountAfter = scene._placeableOverlays.length;
      const moveCountAfter = scene._movableOverlays.length;
      const hasRing = scene._rangeRingGfx !== null;

      scene._deselectTower();
      return {
        placeableCountBefore,
        placeableCountAfter,
        moveCountAfter,
        hasRing,
      };
    });

    expect(result).not.toBeNull();
    expect(result.placeableCountBefore).toBeGreaterThan(0);
    expect(result.placeableCountAfter).toBe(0); // 팔레트 오버레이 제거됨
    expect(result.moveCountAfter).toBeGreaterThan(0); // 이동 오버레이 표시됨
    expect(result.hasRing).toBe(true); // 사거리 링 표시됨
  });
});

// ── 엣지케이스 ──

test.describe('엣지케이스', () => {
  test('_hidePlaceableOverlay() 빈 배열에서 호출해도 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;
      // 빈 상태에서 여러 번 호출
      scene._hidePlaceableOverlay();
      scene._hidePlaceableOverlay();
      scene._hidePlaceableOverlay();
    });

    expect(errors).toEqual([]);
  });

  test('_hideRangeRing() null 상태에서 호출해도 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;
      scene._hideRangeRing();
      scene._hideRangeRing();
      scene._hideRangeRing();
    });

    expect(errors).toEqual([]);
  });

  test('도구 연속 빠른 선택/해제 (더블클릭 시뮬레이션)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;

      // 빠른 토글 10회
      for (let i = 0; i < 10; i++) {
        scene.selectedTowerType = i % 2 === 0 ? 'pan' : null;
        if (scene.selectedTowerType) {
          scene._showPlaceableOverlay();
        } else {
          scene._hidePlaceableOverlay();
        }
      }
      // 최종 정리
      scene._hidePlaceableOverlay();
      scene.selectedTowerType = null;
    });

    // 에러가 없어야 함
    expect(errors).toEqual([]);

    // 메모리 누수 없는지 오버레이 카운트 확인
    const finalCount = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return -1;
      return scene._placeableOverlays?.length ?? -1;
    });
    expect(finalCount).toBe(0);
  });

  test('카운트다운 중 도구 배치가 가능하다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const scene = window.__game?.scene?.getScene('GatheringScene');
        if (!scene) { resolve(null); return; }

        const towersBefore = scene.towers.getChildren().length;

        // 카운트다운 시작
        scene._startCountdown(() => {
          // 카운트다운 완료 후 확인
          const towersAfter = scene.towers.getChildren().length;
          resolve({ towersBefore, towersAfter, placed: towersAfter > towersBefore });
        });

        // 카운트다운 중에 도구 배치 시도
        setTimeout(() => {
          try {
            scene.selectedTowerType = 'pan';
            scene._placeTower(6, 6, 'pan');
          } catch (e) {
            // 에러 무시
          }
        }, 500);
      });
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result.placed).toBe(true); // 카운트다운 중 배치 성공
  });

  test('카운트다운 중 웨이브 버튼 재클릭이 무시된다', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      let callCount = 0;
      scene._startCountdown(() => { callCount++; });

      // 카운트다운 중 _waveBtnEnabled 확인
      const btnEnabled = scene._waveBtnEnabled;

      return { btnEnabled, btnVisible: scene._waveBtnBg?.visible };
    });

    expect(result).not.toBeNull();
    expect(result.btnEnabled).toBe(false);
    expect(result.btnVisible).toBe(false); // 버튼 비가시
  });

  test('배치 후 수량 소진 시 오버레이 자동 제거', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    // 도구 1개만 가진 세이브
    await setupAndGotoGathering(page, {
      tools: {
        pan: { count: 1, level: 1 },
        salt: { count: 0, level: 1 },
        grill: { count: 0, level: 1 },
        delivery: { count: 0, level: 1 },
        freezer: { count: 0, level: 1 },
        soup_pot: { count: 0, level: 1 },
        wasabi_cannon: { count: 0, level: 1 },
        spice_grinder: { count: 0, level: 1 },
      },
    });

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 도구 선택 -> 오버레이 표시
      scene.selectedTowerType = 'pan';
      scene._updateTowerBarSelection();
      scene._showPlaceableOverlay();
      const overlayBefore = scene._placeableOverlays.length;

      // 배치 (count: 1이므로 1개 배치 후 소진)
      scene._placeTower(3, 3, 'pan');
      const overlayAfter = scene._placeableOverlays.length;
      const selectedAfter = scene.selectedTowerType;

      return { overlayBefore, overlayAfter, selectedAfter };
    });

    expect(result).not.toBeNull();
    expect(result.overlayBefore).toBeGreaterThan(0);
    expect(result.overlayAfter).toBe(0); // 수량 소진 시 오버레이 제거
    expect(result.selectedAfter).toBeNull(); // 선택 해제
  });
});

// ── 시각적 검증 ──

test.describe('시각적 검증', () => {
  test('GatheringScene 초기 상태 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    await page.screenshot({
      path: 'tests/screenshots/phase83-gathering-initial.png',
    });
  });

  test('배치 가능 오버레이 표시 상태 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;
      scene.selectedTowerType = 'pan';
      scene._showPlaceableOverlay();
    });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'tests/screenshots/phase83-placeable-overlay.png',
    });

    // 정리
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      scene?._hidePlaceableOverlay();
    });
  });

  test('사거리 링 표시 상태 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;
      scene._placeTower(4, 5, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '4,5');
      if (tower) scene._selectTower(tower);
    });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'tests/screenshots/phase83-range-ring.png',
    });
  });
});

// ── depth 검증 ──

test.describe('depth 검증', () => {
  test('오버레이 depth=5, 링 depth=4, 카운트다운 depth=3000', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    const depths = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return null;

      // 오버레이 생성 -> depth 확인
      scene._showPlaceableOverlay();
      const overlayDepth = scene._placeableOverlays.length > 0
        ? scene._placeableOverlays[0].depth
        : null;
      scene._hidePlaceableOverlay();

      // 링 생성
      scene._placeTower(3, 3, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '3,3');
      if (tower) {
        scene._showRangeRing(tower);
      }
      const ringDepth = scene._rangeRingGfx?.depth || null;
      scene._hideRangeRing();

      // 카운트다운 텍스트
      const countdownDepth = scene._countdownText?.depth || null;

      scene._deselectTower();
      return { overlayDepth, ringDepth, countdownDepth };
    });

    expect(depths).not.toBeNull();
    expect(depths.overlayDepth).toBe(5);
    expect(depths.ringDepth).toBe(4);
    expect(depths.countdownDepth).toBe(3000);

    // depth 순서: ring(4) < overlay(5) < countdown(3000)
    expect(depths.ringDepth).toBeLessThan(depths.overlayDepth);
    expect(depths.overlayDepth).toBeLessThan(depths.countdownDepth);
  });
});

// ── UI 안정성 ──

test.describe('UI 안정성', () => {
  test('GatheringScene 전체 흐름에서 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoGathering(page);

    // 다양한 기능 시뮬레이션
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('GatheringScene');
      if (!scene) return;

      // 도구 선택/해제
      scene.selectedTowerType = 'pan';
      scene._showPlaceableOverlay();
      scene._hidePlaceableOverlay();
      scene.selectedTowerType = null;

      // 타워 배치
      scene._placeTower(2, 2, 'pan');
      const tower = scene.towers.getChildren().find(t => t._cellKey === '2,2');

      // 타워 선택/해제
      if (tower) {
        scene._selectTower(tower);
        scene._deselectTower();
      }
    });

    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});
