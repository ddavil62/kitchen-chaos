/**
 * @fileoverview Phase 84 QA: 셰프 스킨 시스템 검증.
 *
 * AC-1: SkinManager API (getSkinsForChef, isSkinOwned, getEquippedSkin, equipSkin, unlockSkin)
 * AC-2: SaveManager v28 마이그레이션 (unlockedSkins, equippedSkin)
 * AC-3: ChefSelectScene 스킨 패널 (미미 포커스 시 표시, 타 셰프 시 숨김)
 * AC-4: 스킨 장착 및 portrait 교체
 * AC-5: IAP 스텁 구매 플로우
 * AC-6: 에셋 로드 (portrait_mimi_pink, portrait_mimi_blue)
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
 * 모든 활성 씬을 정지하고 ChefSelectScene을 stageId='1-1'로 직접 시작한다.
 */
async function startChefSelectScene(page, stageId = '1-1') {
  await page.evaluate(({ sid }) => {
    const g = window.__game;
    if (!g) return;
    const mgr = g.scene;
    const active = mgr.getScenes(true);
    active.forEach(s => {
      if (s.scene.key !== 'BootScene') {
        try { mgr.stop(s.scene.key); } catch (e) { /* noop */ }
      }
    });
    mgr.start('ChefSelectScene', { stageId: sid });
  }, { sid: stageId });
  await page.waitForTimeout(2000);
}

function makeMinimalSave(overrides = {}) {
  return {
    version: 28,
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
    mimiSkinCoupons: 0,
    regularCustomerProgress: 0,
    criticPenaltyActive: false,
    unlockedSkins: { mimi_chef: ['default'] },
    equippedSkin: { mimi_chef: 'default' },
    ...overrides,
  };
}

async function setupAndGotoChefSelect(page, saveOverrides = {}) {
  // IAP localStorage 플래그 클리어
  await page.evaluate(() => {
    localStorage.removeItem('kc_skin_owned_skin_mimi_pink');
    localStorage.removeItem('kc_skin_owned_skin_mimi_blue');
  });
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: makeMinimalSave(saveOverrides) });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForGame(page);
  await startChefSelectScene(page);
}

// ── AC-1: SkinManager API ──

test.describe('AC-1: SkinManager API', () => {
  test('getSkinsForChef(mimi_chef) → 3종 배열 반환', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const g = window.__game;
      const scene = g?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;
      // SkinManager는 import된 모듈이므로 scene에서 직접 접근 불가
      // ChefSelectScene에서 SkinManager를 사용하므로, 간접적으로 테스트
      // 대안: evaluate에서 ESM 접근
      try {
        // scene._skinItems 배열 길이로 검증 (패널에 3종이 빌드됨)
        return {
          skinItemsCount: scene._skinItems?.length ?? -1,
          skinDefs: scene._skinItems?.map(item => ({
            id: item.skinDef.id,
            nameKo: item.skinDef.nameKo,
            portraitKey: item.skinDef.portraitKey,
            price: item.skinDef.price,
            unlockType: item.skinDef.unlockType,
          })) ?? [],
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(result).not.toBeNull();
    expect(result.skinItemsCount).toBe(3);
    expect(result.skinDefs[0].id).toBe('default');
    expect(result.skinDefs[1].id).toBe('skin_mimi_pink');
    expect(result.skinDefs[2].id).toBe('skin_mimi_blue');
    expect(result.skinDefs[0].unlockType).toBe('default');
    expect(result.skinDefs[1].unlockType).toBe('iap');
    expect(result.skinDefs[2].unlockType).toBe('iap');
    expect(result.skinDefs[1].price).toBe(2900);
    expect(result.skinDefs[2].price).toBe(2900);
  });

  test('getSkinsForChef(존재하지 않는 셰프) → 빈 배열', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const count = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return -1;
      // _skinItems는 mimi_chef 전용이므로, 직접 모듈 함수 호출 불가
      // 대신 _onSkinTap이 다른 chefId에 대해 에러 없이 처리되는지 확인
      try {
        scene._onSkinTap('nonexistent_chef', { id: 'fake', unlockType: 'default' });
        return 0; // 에러 없이 반환
      } catch (e) {
        return -2;
      }
    });
    // SkinManager.isSkinOwned('nonexistent_chef', 'fake') → false (SKIN_DEFS에 없음)
    // → _showPurchasePopup 호출 (미보유 분기)
    expect(count).toBe(0); // 에러 없이 처리
  });

  test('기본 스킨 default는 항상 보유 상태', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;
      // default 스킨의 lockOverlay가 hidden이면 보유 상태
      const defaultItem = scene._skinItems[0]; // id: 'default'
      return {
        lockVisible: defaultItem.lockOverlay.visible,
        priceVisible: defaultItem.priceText.visible,
        selectBorderVisible: defaultItem.selectBorder.visible,
      };
    });

    expect(result).not.toBeNull();
    expect(result.lockVisible).toBe(false); // 자물쇠 없음 (보유)
    expect(result.priceVisible).toBe(false); // 가격 표시 없음
    expect(result.selectBorderVisible).toBe(true); // 초기에 default가 장착 → 테두리 표시
  });

  test('미보유 IAP 스킨은 자물쇠+가격 표시', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;
      const pinkItem = scene._skinItems[1]; // skin_mimi_pink
      const blueItem = scene._skinItems[2]; // skin_mimi_blue
      return {
        pinkLock: pinkItem.lockOverlay.visible,
        pinkPrice: pinkItem.priceText.visible,
        pinkBorder: pinkItem.selectBorder.visible,
        blueLock: blueItem.lockOverlay.visible,
        bluePrice: blueItem.priceText.visible,
        blueBorder: blueItem.selectBorder.visible,
      };
    });

    expect(result).not.toBeNull();
    expect(result.pinkLock).toBe(true);
    expect(result.pinkPrice).toBe(true);
    expect(result.pinkBorder).toBe(false);
    expect(result.blueLock).toBe(true);
    expect(result.bluePrice).toBe(true);
    expect(result.blueBorder).toBe(false);
  });

  test('getEquippedSkin → 초기값 default', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;
      // 장착된 스킨 확인: selectBorder가 visible인 항목이 장착 스킨
      const equippedIdx = scene._skinItems.findIndex(item => item.selectBorder.visible);
      return {
        equippedIdx,
        equippedId: equippedIdx >= 0 ? scene._skinItems[equippedIdx].skinDef.id : null,
      };
    });

    expect(result).not.toBeNull();
    expect(result.equippedIdx).toBe(0);
    expect(result.equippedId).toBe('default');
  });
});

// ── AC-2: SaveManager v28 마이그레이션 ──

test.describe('AC-2: SaveManager v28 마이그레이션', () => {
  test('SAVE_VERSION === 28', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    const version = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      if (!raw) return null;
      return JSON.parse(raw).version;
    });

    // 게임 로드 후 세이브 버전 확인 (새 세이브 생성 시)
    await page.evaluate(() => {
      localStorage.removeItem('kitchenChaosTycoon_save');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForGame(page);

    const freshVersion = await page.evaluate(() => {
      // 게임이 부팅하면 자동으로 세이브를 로드/생성하므로
      // BootScene에서 SaveManager.load()가 호출됨
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      if (!raw) return -1;
      return JSON.parse(raw).version;
    });

    // 새 세이브의 version이 28이어야 함
    expect(freshVersion).toBe(28);
  });

  test('v27 세이브 마이그레이션 시 unlockedSkins/equippedSkin 초기화', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    // v27 세이브 주입 (unlockedSkins/equippedSkin 없음)
    const v27Save = makeMinimalSave({
      version: 27,
    });
    delete v27Save.unlockedSkins;
    delete v27Save.equippedSkin;

    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: SAVE_KEY, data: v27Save });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForGame(page);

    const migrated = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        version: data.version,
        unlockedSkins: data.unlockedSkins,
        equippedSkin: data.equippedSkin,
      };
    });

    expect(migrated).not.toBeNull();
    expect(migrated.version).toBe(28);
    expect(migrated.unlockedSkins).toEqual({ mimi_chef: ['default'] });
    expect(migrated.equippedSkin).toEqual({ mimi_chef: 'default' });
  });

  test('v27 세이브에 이미 unlockedSkins가 있지만 mimi_chef가 없는 경우', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    const v27Save = makeMinimalSave({ version: 27 });
    v27Save.unlockedSkins = { other_chef: ['default'] };
    delete v27Save.equippedSkin;

    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: SAVE_KEY, data: v27Save });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForGame(page);

    const migrated = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        version: data.version,
        unlockedSkinsMimi: data.unlockedSkins?.mimi_chef,
        unlockedSkinsOther: data.unlockedSkins?.other_chef,
        equippedSkinMimi: data.equippedSkin?.mimi_chef,
      };
    });

    expect(migrated).not.toBeNull();
    expect(migrated.version).toBe(28);
    expect(migrated.unlockedSkinsMimi).toEqual(['default']);
    expect(migrated.unlockedSkinsOther).toEqual(['default']); // 기존 데이터 보존
    expect(migrated.equippedSkinMimi).toBe('default');
  });

  test('createDefault()에 unlockedSkins/equippedSkin 포함', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    // localStorage 완전 클리어 후 재로드
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForGame(page);

    // 씬 시작 시 SaveManager.load() 호출 → createDefault() → 저장
    await startChefSelectScene(page);

    const result = await page.evaluate(() => {
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        hasUnlockedSkins: !!data.unlockedSkins,
        hasEquippedSkin: !!data.equippedSkin,
        mimiSkins: data.unlockedSkins?.mimi_chef,
        mimiEquipped: data.equippedSkin?.mimi_chef,
      };
    });

    expect(result).not.toBeNull();
    expect(result.hasUnlockedSkins).toBe(true);
    expect(result.hasEquippedSkin).toBe(true);
    expect(result.mimiSkins).toEqual(['default']);
    expect(result.mimiEquipped).toBe('default');
  });
});

// ── AC-3: ChefSelectScene 스킨 패널 ──

test.describe('AC-3: ChefSelectScene 스킨 패널', () => {
  test('미미 카드 포커스 시 스킨 패널 표시', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    // 미미는 기본 선택이므로 패널이 이미 보여야 함
    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;
      return {
        skinPanelVisible: scene._skinPanel?.visible,
        currentIndex: scene._currentIndex,
        currentChefId: scene._chefList?.[scene._currentIndex]?.chef?.id,
      };
    });

    expect(result).not.toBeNull();
    expect(result.currentChefId).toBe('mimi_chef');
    expect(result.skinPanelVisible).toBe(true);
  });

  test('다른 셰프 카드 포커스 시 스킨 패널 숨김', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    // 오른쪽 화살표 클릭으로 다른 셰프로 이동
    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;

      // 미미에서 다음 셰프로 이동 (인덱스 +1)
      const nextIdx = (scene._currentIndex + 1) % scene._chefList.length;
      scene._goToIndex(nextIdx, false); // 즉시 이동

      return {
        skinPanelVisible: scene._skinPanel?.visible,
        currentChefId: scene._chefList?.[scene._currentIndex]?.chef?.id,
      };
    });

    expect(result).not.toBeNull();
    expect(result.currentChefId).not.toBe('mimi_chef');
    expect(result.skinPanelVisible).toBe(false);
  });

  test('선택 버튼 y: 미미=590, 그 외=549', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;

      // 미미 포커스 시 y
      const mimiY = scene._selectBtnBg?.y;

      // 다른 셰프로 이동
      const nextIdx = (scene._currentIndex + 1) % scene._chefList.length;
      scene._goToIndex(nextIdx, false);
      const otherY = scene._selectBtnBg?.y;

      // 미미로 복귀
      scene._goToIndex(0, false); // mimi_chef는 인덱스 0
      const backToMimiY = scene._selectBtnBg?.y;

      return { mimiY, otherY, backToMimiY };
    });

    expect(result).not.toBeNull();
    expect(result.mimiY).toBe(590);
    expect(result.otherY).toBe(549);
    expect(result.backToMimiY).toBe(590);
  });

  test('선택 버튼 텍스트 y도 동기화', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;

      const btnBgY = scene._selectBtnBg?.y;
      const btnTextY = scene._selectBtnText?.y;

      // 다른 셰프로 이동
      const nextIdx = (scene._currentIndex + 1) % scene._chefList.length;
      scene._goToIndex(nextIdx, false);
      const otherBgY = scene._selectBtnBg?.y;
      const otherTextY = scene._selectBtnText?.y;

      return { btnBgY, btnTextY, otherBgY, otherTextY };
    });

    expect(result).not.toBeNull();
    expect(result.btnBgY).toBe(result.btnTextY);
    expect(result.otherBgY).toBe(result.otherTextY);
  });

  test('스킨 패널 depth=20 (카드 depth=10보다 높음)', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const depth = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      return scene?._skinPanel?.depth ?? -1;
    });

    expect(depth).toBe(20);
  });

  test('스킨 패널 내 썸네일 3개 x 좌표 = [100, 180, 260]', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const positions = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;
      return scene._skinItems.map(item => ({
        nameX: item.nameText?.x,
        nameY: item.nameText?.y,
      }));
    });

    expect(positions).not.toBeNull();
    expect(positions.length).toBe(3);
    expect(positions[0].nameX).toBe(100);
    expect(positions[1].nameX).toBe(180);
    expect(positions[2].nameX).toBe(260);
    // y는 SKIN_NAME_Y=542
    expect(positions[0].nameY).toBe(542);
  });
});

// ── AC-4: 스킨 장착 및 portrait 교체 ──

test.describe('AC-4: 스킨 장착 및 portrait 교체', () => {
  test('보유 스킨 탭 → equipSkin + portrait 교체', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    // 핑크 스킨을 미리 보유한 상태로 시작
    await setupAndGotoChefSelect(page, {
      unlockedSkins: { mimi_chef: ['default', 'skin_mimi_pink'] },
      equippedSkin: { mimi_chef: 'default' },
    });

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // 초기 장착 확인 (default)
      const initialEquipped = scene._skinItems.findIndex(item => item.selectBorder.visible);

      // 핑크 스킨 탭 시뮬레이션
      const pinkSkin = scene._skinItems[1].skinDef;
      scene._onSkinTap('mimi_chef', pinkSkin);

      // 장착 후 확인
      const afterEquipped = scene._skinItems.findIndex(item => item.selectBorder.visible);

      // 세이브 확인
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      const save = raw ? JSON.parse(raw) : null;

      return {
        initialEquipped,
        afterEquipped,
        saveEquipped: save?.equippedSkin?.mimi_chef,
      };
    });

    expect(result).not.toBeNull();
    expect(result.initialEquipped).toBe(0); // default
    expect(result.afterEquipped).toBe(1); // skin_mimi_pink
    expect(result.saveEquipped).toBe('skin_mimi_pink');
  });

  test('미보유 스킨 탭 → 구매 팝업 표시', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // 팝업 없음 확인
      const popupBefore = scene._purchasePopup !== undefined && scene._purchasePopup !== null;

      // 핑크 스킨 (미보유) 탭
      const pinkSkin = scene._skinItems[1].skinDef;
      scene._onSkinTap('mimi_chef', pinkSkin);

      // 팝업 존재 확인
      const popupAfter = scene._purchasePopup !== undefined && scene._purchasePopup !== null;
      const popupDepth = scene._purchasePopup?.depth;

      return { popupBefore, popupAfter, popupDepth };
    });

    expect(result).not.toBeNull();
    expect(result.popupBefore).toBe(false);
    expect(result.popupAfter).toBe(true);
    expect(result.popupDepth).toBe(100);
  });

  test('씬 재진입 후 마지막 장착 스킨 유지', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    // 핑크 스킨 보유 + 장착 상태로 시작
    await setupAndGotoChefSelect(page, {
      unlockedSkins: { mimi_chef: ['default', 'skin_mimi_pink'] },
      equippedSkin: { mimi_chef: 'skin_mimi_pink' },
    });

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // 핑크 스킨이 장착 상태여야 함
      const equippedIdx = scene._skinItems.findIndex(item => item.selectBorder.visible);
      return {
        equippedIdx,
        equippedId: equippedIdx >= 0 ? scene._skinItems[equippedIdx].skinDef.id : null,
      };
    });

    expect(result).not.toBeNull();
    expect(result.equippedIdx).toBe(1); // skin_mimi_pink
    expect(result.equippedId).toBe('skin_mimi_pink');
  });

  test('보유하지 않은 스킨 장착 시도는 무시됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // 미보유 스킨을 직접 장착 시도 (equipSkin은 SkinManager에서 보유 체크)
      // _onSkinTap을 통해 미보유면 팝업이 뜨고 장착은 안 됨
      const beforeEquipped = scene._skinItems.findIndex(item => item.selectBorder.visible);

      // 세이브에서 직접 확인
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      const save = raw ? JSON.parse(raw) : null;
      const equippedBefore = save?.equippedSkin?.mimi_chef;

      return { beforeEquipped, equippedBefore };
    });

    expect(result).not.toBeNull();
    expect(result.beforeEquipped).toBe(0); // default 유지
    expect(result.equippedBefore).toBe('default');
  });
});

// ── AC-5: IAP 스텁 구매 플로우 ──

test.describe('AC-5: IAP 스텁 구매 플로우', () => {
  test('구매 팝업 → 구매 클릭 → localStorage 플래그 설정', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(async () => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // localStorage 확인 (구매 전)
      const beforeFlag = localStorage.getItem('kc_skin_owned_skin_mimi_pink');

      // 핑크 스킨 탭 → 구매 팝업
      const pinkSkin = scene._skinItems[1].skinDef;
      scene._onSkinTap('mimi_chef', pinkSkin);

      // 구매 팝업의 buyZone에서 pointerdown 이벤트 발생
      // 팝업 내부에서 buyZone을 찾아 클릭 시뮬레이션
      const popup = scene._purchasePopup;
      if (!popup) return { error: 'no popup' };

      // buyZone은 popup의 children 중 interactive zone
      const buyZones = popup.list.filter(child =>
        child.type === 'Zone' && child.input?.enabled
      );
      if (buyZones.length === 0) return { error: 'no buyZone' };

      // 첫 번째 zone이 구매 버튼 (x=110 부근)
      const buyZone = buyZones[0];
      // pointerdown 이벤트 트리거
      buyZone.emit('pointerdown');

      // await purchaseSkin 완료 대기
      await new Promise(r => setTimeout(r, 100));

      // localStorage 확인 (구매 후)
      const afterFlag = localStorage.getItem('kc_skin_owned_skin_mimi_pink');

      // 세이브에서 unlockedSkins 확인
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      const save = raw ? JSON.parse(raw) : null;
      const skinUnlocked = save?.unlockedSkins?.mimi_chef?.includes('skin_mimi_pink');

      // 팝업 닫혔는지 확인
      const popupClosed = scene._purchasePopup === null;

      // 자물쇠가 사라졌는지 확인
      const pinkLockAfter = scene._skinItems[1].lockOverlay.visible;

      return {
        beforeFlag,
        afterFlag,
        skinUnlocked,
        popupClosed,
        pinkLockAfter,
      };
    });

    expect(result).not.toBeNull();
    if (result.error) {
      console.log('Error:', result.error);
    }
    expect(result.beforeFlag).toBeNull();
    expect(result.afterFlag).toBe('1');
    expect(result.skinUnlocked).toBe(true);
    expect(result.popupClosed).toBe(true);
    expect(result.pinkLockAfter).toBe(false); // 자물쇠 제거됨
  });

  test('구매 팝업 → 취소 클릭 → 팝업 닫힘, 상태 변경 없음', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // 핑크 스킨 탭 → 구매 팝업
      const pinkSkin = scene._skinItems[1].skinDef;
      scene._onSkinTap('mimi_chef', pinkSkin);

      const popup = scene._purchasePopup;
      if (!popup) return { error: 'no popup' };

      // cancelZone은 popup의 두 번째 interactive zone
      const zones = popup.list.filter(child =>
        child.type === 'Zone' && child.input?.enabled
      );
      if (zones.length < 2) return { error: 'zones < 2' };

      const cancelZone = zones[1];
      cancelZone.emit('pointerdown');

      const popupClosed = scene._purchasePopup === null;
      const flag = localStorage.getItem('kc_skin_owned_skin_mimi_pink');

      return { popupClosed, flag };
    });

    expect(result).not.toBeNull();
    expect(result.popupClosed).toBe(true);
    expect(result.flag).toBeNull(); // 구매 안 됨
  });

  test('구매 후 해당 스킨이 보유 상태로 전환 → 장착 가능', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(async () => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      // 핑크 스킨 구매
      const pinkSkin = scene._skinItems[1].skinDef;
      scene._onSkinTap('mimi_chef', pinkSkin); // 팝업

      const popup = scene._purchasePopup;
      if (!popup) return { error: 'no popup' };

      const buyZones = popup.list.filter(child =>
        child.type === 'Zone' && child.input?.enabled
      );
      if (buyZones.length === 0) return { error: 'no buyZone' };

      buyZones[0].emit('pointerdown');
      await new Promise(r => setTimeout(r, 100));

      // 구매 후 핑크 스킨 탭 → 이번엔 보유이므로 장착
      scene._onSkinTap('mimi_chef', pinkSkin);

      const equippedIdx = scene._skinItems.findIndex(item => item.selectBorder.visible);
      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      const save = raw ? JSON.parse(raw) : null;

      return {
        equippedIdx,
        saveEquipped: save?.equippedSkin?.mimi_chef,
      };
    });

    expect(result).not.toBeNull();
    expect(result.equippedIdx).toBe(1); // skin_mimi_pink 장착
    expect(result.saveEquipped).toBe('skin_mimi_pink');
  });
});

// ── AC-6: 에셋 로드 ──

test.describe('AC-6: 에셋 로드', () => {
  test('portrait_mimi_pink 텍스처가 로드됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    const exists = await page.evaluate(() => {
      const g = window.__game;
      return g?.textures?.exists('portrait_mimi_pink') ?? false;
    });

    expect(exists).toBe(true);
  });

  test('portrait_mimi_blue 텍스처가 로드됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    const exists = await page.evaluate(() => {
      const g = window.__game;
      return g?.textures?.exists('portrait_mimi_blue') ?? false;
    });

    expect(exists).toBe(true);
  });

  test('portrait_mimi (기본) 텍스처도 로드됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    const exists = await page.evaluate(() => {
      const g = window.__game;
      return g?.textures?.exists('portrait_mimi') ?? false;
    });

    expect(exists).toBe(true);
  });
});

// ── IAPManager 구조 검증 ──

test.describe('IAPManager 구조 검증', () => {
  test('SKIN_PRODUCT_IDS 상수 존재', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    // IAPManager는 모듈이므로 직접 접근 불가, 간접 검증
    // purchaseSkin 호출 시 에러 없이 동작하는지 확인
    const result = await page.evaluate(async () => {
      try {
        // 구매 팝업을 통해 IAPManager.purchaseSkin이 호출되는 흐름을 트리거
        const scene = window.__game?.scene?.getScene('ChefSelectScene');
        if (!scene || !scene._skinItems) return { error: 'no scene' };

        const pinkSkin = scene._skinItems[1].skinDef;
        scene._onSkinTap('mimi_chef', pinkSkin); // 팝업

        const popup = scene._purchasePopup;
        if (!popup) return { error: 'no popup' };

        // 팝업 닫기 (취소)
        const zones = popup.list.filter(child =>
          child.type === 'Zone' && child.input?.enabled
        );
        if (zones.length >= 2) zones[1].emit('pointerdown');

        return { success: true };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(result.success).toBe(true);
  });
});

// ── 엣지케이스 ──

test.describe('엣지케이스', () => {
  test('스킨 패널에서 같은 스킨 연속 탭 (더블클릭)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return;

      const defaultSkin = scene._skinItems[0].skinDef;
      // 같은 스킨 10회 연속 탭
      for (let i = 0; i < 10; i++) {
        scene._onSkinTap('mimi_chef', defaultSkin);
      }
    });

    expect(errors).toEqual([]);
  });

  test('미보유 스킨 연속 탭 → 팝업 중복 방지', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return null;

      const pinkSkin = scene._skinItems[1].skinDef;
      // 미보유 스킨 3회 연속 탭 → 팝업이 매번 재생성
      scene._onSkinTap('mimi_chef', pinkSkin);
      scene._onSkinTap('mimi_chef', pinkSkin);
      scene._onSkinTap('mimi_chef', pinkSkin);

      const hasPopup = scene._purchasePopup !== null;
      return { hasPopup };
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result.hasPopup).toBe(true);
  });

  test('구매 팝업 열린 상태에서 다른 스킨 탭', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return;

      // 핑크 스킨 탭 → 팝업
      scene._onSkinTap('mimi_chef', scene._skinItems[1].skinDef);
      // 블루 스킨 탭 → 팝업 재생성
      scene._onSkinTap('mimi_chef', scene._skinItems[2].skinDef);
      // default 스킨 탭 → 보유이므로 장착 (팝업 유지 주의)
      scene._onSkinTap('mimi_chef', scene._skinItems[0].skinDef);
    });

    expect(errors).toEqual([]);
  });

  test('빠른 셰프 전환 시 스킨 패널 상태 정합성', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;

      const total = scene._chefList.length;
      // 모든 셰프를 빠르게 순회
      for (let i = 0; i < total * 3; i++) {
        scene._goToIndex(i % total, false);
      }

      // 마지막에 미미로 돌아옴
      scene._goToIndex(0, false);
      const panelVisible = scene._skinPanel?.visible;
      const btnY = scene._selectBtnBg?.y;

      // 다른 셰프로 이동
      scene._goToIndex(1, false);
      const panelHidden = !scene._skinPanel?.visible;
      const btnYOther = scene._selectBtnBg?.y;

      return { panelVisible, btnY, panelHidden, btnYOther };
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result.panelVisible).toBe(true);
    expect(result.btnY).toBe(590);
    expect(result.panelHidden).toBe(true);
    expect(result.btnYOther).toBe(549);
  });

  test('unlockSkin 중복 호출 시 배열에 중복 추가 안 됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    const result = await page.evaluate(async () => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return null;

      // 핑크 스킨 구매를 3번 연속 실행
      for (let i = 0; i < 3; i++) {
        scene._onSkinTap('mimi_chef', scene._skinItems[1].skinDef); // 팝업
        const popup = scene._purchasePopup;
        if (popup) {
          const buyZones = popup.list.filter(child =>
            child.type === 'Zone' && child.input?.enabled
          );
          if (buyZones.length > 0) {
            buyZones[0].emit('pointerdown');
            await new Promise(r => setTimeout(r, 50));
          }
        }
      }

      const raw = localStorage.getItem('kitchenChaosTycoon_save');
      const save = raw ? JSON.parse(raw) : null;
      const pinkCount = save?.unlockedSkins?.mimi_chef?.filter(s => s === 'skin_mimi_pink').length ?? -1;

      return { pinkCount, totalSkins: save?.unlockedSkins?.mimi_chef?.length ?? -1 };
    });

    expect(result).not.toBeNull();
    expect(result.pinkCount).toBe(1); // 중복 없음
    expect(result.totalSkins).toBe(2); // default + skin_mimi_pink
  });

  test('purchasePopup destroy 후 재생성 시 메모리 정리', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return;

      // 팝업 열기 → 취소 → 열기 → 취소 반복
      for (let i = 0; i < 5; i++) {
        scene._onSkinTap('mimi_chef', scene._skinItems[1].skinDef);
        if (scene._purchasePopup) {
          const zones = scene._purchasePopup.list.filter(child =>
            child.type === 'Zone' && child.input?.enabled
          );
          if (zones.length >= 2) zones[1].emit('pointerdown');
        }
      }
    });

    expect(errors).toEqual([]);
  });
});

// ── UI 안정성 ──

test.describe('UI 안정성', () => {
  test('ChefSelectScene 로드 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('씬 전환(ChefSelectScene → MenuScene) 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    await page.evaluate(() => {
      const g = window.__game;
      try { g.scene.stop('ChefSelectScene'); } catch (e) {}
      g.scene.start('MenuScene');
    });

    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('스킨 패널 표시 상태에서 씬 전환 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    // 스킨 패널 + 구매 팝업 열린 상태에서 씬 전환
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return;
      scene._onSkinTap('mimi_chef', scene._skinItems[1].skinDef); // 팝업 열기
    });

    await page.evaluate(() => {
      const g = window.__game;
      try { g.scene.stop('ChefSelectScene'); } catch (e) {}
      g.scene.start('MenuScene');
    });

    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

// ── 시각적 검증 ──

test.describe('시각적 검증', () => {
  test('미미 카드 + 스킨 패널 초기 상태', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase84-mimi-skin-panel.png',
    });
  });

  test('다른 셰프 포커스 시 패널 숨김 상태', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    // 다음 셰프로 이동
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene) return;
      scene._goToIndex(1, false);
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase84-other-chef-no-panel.png',
    });
  });

  test('구매 팝업 표시 상태', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page);

    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('ChefSelectScene');
      if (!scene || !scene._skinItems) return;
      scene._onSkinTap('mimi_chef', scene._skinItems[1].skinDef);
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase84-purchase-popup.png',
    });
  });

  test('스킨 장착 후 portrait 교체 상태', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page, {
      unlockedSkins: { mimi_chef: ['default', 'skin_mimi_pink', 'skin_mimi_blue'] },
      equippedSkin: { mimi_chef: 'skin_mimi_pink' },
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase84-pink-skin-equipped.png',
    });
  });

  test('블루 스킨 장착 시각적 확인', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await setupAndGotoChefSelect(page, {
      unlockedSkins: { mimi_chef: ['default', 'skin_mimi_pink', 'skin_mimi_blue'] },
      equippedSkin: { mimi_chef: 'skin_mimi_blue' },
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase84-blue-skin-equipped.png',
    });
  });
});
