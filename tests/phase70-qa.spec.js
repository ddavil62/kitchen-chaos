/**
 * @fileoverview Phase 70 QA: 튜토리얼 자동 도구 지급 + 분기 카드 피드백 강화 검증.
 *
 * 시나리오 1: P1-1 자동 도구 지급 (GatheringScene)
 * 시나리오 2: P1-3 분기 카드 피드백 (MerchantScene)
 * 시나리오 3: 출발 버튼 disabled + 툴팁
 * 시나리오 4: console error 0건 회귀
 * 시나리오 5: 엣지케이스 (연타, 탭 전환, 재진입 등)
 */
import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const SAVE_KEY = 'kitchenChaosTycoon_save';

/** 게임 부팅 대기 헬퍼 */
async function waitForBoot(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
  await page.waitForTimeout(1000);
}

/** localStorage 초기화 후 리로드 */
async function freshStart(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
  await page.waitForTimeout(1000);
}

/** 세이브 데이터 강제 생성 (기본 도구 0개 상태) */
async function createSaveWithZeroTools(page) {
  await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    data.tools = {
      pan: { count: 0, level: 1 },
      salt: { count: 0, level: 1 },
      grill: { count: 0, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    };
    data.gold = data.gold || 0;
    if (!data.storyProgress) data.storyProgress = { currentChapter: 1, storyFlags: {} };
    if (!data.storyProgress.storyFlags || Array.isArray(data.storyProgress.storyFlags)) {
      data.storyProgress.storyFlags = {};
    }
    delete data.storyProgress.storyFlags.tutorial_auto_tools_shown;
    data.version = data.version || 24;
    localStorage.setItem(key, JSON.stringify(data));
  }, SAVE_KEY);
}

/** 세이브에서 도구만 0개로 설정 (플래그 유지) */
async function clearAllTools(page) {
  await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.tools) {
      Object.keys(data.tools).forEach(k => { data.tools[k].count = 0; });
    }
    localStorage.setItem(key, JSON.stringify(data));
  }, SAVE_KEY);
}

/** MerchantScene에서 분기 탭 활성화 (page.evaluate로 직접 호출) */
async function activateBranchTab(page) {
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('MerchantScene');
    if (scene && scene._tabBranchBg) {
      scene._tabBranchBg.emit('pointerdown');
    }
  });
  await page.waitForTimeout(200);
}

/** MerchantScene에서 도구 탭 활성화 */
async function activateToolsTab(page) {
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('MerchantScene');
    if (scene && scene._tabToolsBg) {
      scene._tabToolsBg.emit('pointerdown');
    }
  });
  await page.waitForTimeout(200);
}

/** MerchantScene에서 출발 버튼 클릭 */
async function clickDepartBtn(page) {
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('MerchantScene');
    if (scene && scene._departBtn) {
      scene._departBtn.emit('pointerdown');
    }
  });
  await page.waitForTimeout(200);
}

test.describe('Phase 70 QA -- 자동 도구 지급 + 분기 카드 피드백', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 1: P1-1 자동 도구 지급
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 1: 자동 도구 지급 (GatheringScene)', () => {

    test('A-1/A-2: 1-1 진입 시 도구 0개이면 프라이팬 자동 지급 + 배치', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      // 검증: 타워(프라이팬)가 배치되어 있는지
      const towerCount = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene || !scene.towers) return 0;
        return scene.towers.getChildren().filter(t => t.active).length;
      });
      expect(towerCount).toBeGreaterThanOrEqual(1);

      // 검증: ToolManager 인벤토리에 pan count >= 1
      const panCount = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        return data.tools?.pan?.count || 0;
      }, SAVE_KEY);
      expect(panCount).toBeGreaterThanOrEqual(1);

      // 검증: deployedCounts에 pan이 포함
      const deployedPan = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        return scene?.deployedCounts?.pan || 0;
      });
      expect(deployedPan).toBeGreaterThanOrEqual(1);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-auto-tool-1-1.png` });
    });

    test('A-3: storyFlags.tutorial_auto_tools_shown = true 기록', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      const flagValue = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data.storyProgress?.storyFlags?.tutorial_auto_tools_shown;
      }, SAVE_KEY);
      expect(flagValue).toBe(true);
    });

    test('A-4: "도구가 없어 프라이팬을 지급했습니다!" 알림 표시', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(500);

      const noticeExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return false;
        const list = scene.children?.list || [];
        return list.some(obj => obj.text && obj.text.includes('도구가 없어'));
      });
      expect(noticeExists).toBe(true);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-auto-tool-notice.png` });
    });

    test('A-4 보완: 알림이 2초 후 사라지는지 확인', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(500);

      const noticeExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return false;
        return scene.children.list.some(obj => obj.text && obj.text.includes('도구가 없어'));
      });
      expect(noticeExists).toBe(true);

      // 2.5초 대기 (2초 표시 + 400ms fadeOut + 100ms 여유)
      await page.waitForTimeout(2600);

      const noticeGone = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return true;
        return !scene.children.list.some(obj =>
          obj.text && obj.text.includes('도구가 없어') && obj.active !== false
        );
      });
      expect(noticeGone).toBe(true);
    });

    test('중복 지급 방지: 1-1 재진입 시 자동 지급 안 됨', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      // 1차 진입: 자동 지급 발생
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      // 플래그 확인
      const flag1 = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return JSON.parse(raw)?.storyProgress?.storyFlags?.tutorial_auto_tools_shown;
      }, SAVE_KEY);
      expect(flag1).toBe(true);

      // 도구를 다시 0개로 만들되, 플래그는 유지
      await clearAllTools(page);

      // 2차 진입
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      // 알림이 표시되지 않아야 함 (중복 지급 방지)
      const noticeExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return false;
        return scene.children.list.some(obj => obj.text && obj.text.includes('도구가 없어'));
      });
      expect(noticeExists).toBe(false);

      // pan count가 여전히 0 (재지급 안 됨)
      const panCount = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return JSON.parse(raw)?.tools?.pan?.count || 0;
      }, SAVE_KEY);
      expect(panCount).toBe(0);
    });

    test('범위 외: 1-4 스테이지에서 자동 지급 안 됨', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-4' });
      });
      await page.waitForTimeout(2000);

      const panCount = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return JSON.parse(raw)?.tools?.pan?.count || 0;
      }, SAVE_KEY);
      expect(panCount).toBe(0);

      const noticeExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return false;
        return scene.children.list.some(obj => obj.text && obj.text.includes('도구가 없어'));
      });
      expect(noticeExists).toBe(false);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-no-grant-1-4.png` });
    });

    test('1-2에서도 자동 지급 동작 확인', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-2' });
      });
      await page.waitForTimeout(2000);

      const panCount = await page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        return JSON.parse(raw)?.tools?.pan?.count || 0;
      }, SAVE_KEY);
      expect(panCount).toBeGreaterThanOrEqual(1);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-auto-tool-1-2.png` });
    });

    test('이미 도구를 보유한 경우 자동 지급 안 됨', async ({ page }) => {
      await freshStart(page);
      // 기본 세이브는 _defaultTools()로 pan:4
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      const noticeExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene) return false;
        return scene.children.list.some(obj => obj.text && obj.text.includes('도구가 없어'));
      });
      expect(noticeExists).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 2: P1-3 분기 카드 피드백 (MerchantScene)
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 2: 분기 카드 피드백 (MerchantScene)', () => {

    test('B-1: 분기 탭 클릭 시 골드 tint 플래시', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 초기 분기 탭 색상: 비활성 #888888
      const branchTabColorBefore = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return scene?._tabBranchText?.style?.color;
      });
      expect(branchTabColorBefore).toBe('#888888');

      // 분기 탭 클릭 (직접 이벤트 발동)
      await activateBranchTab(page);

      // 50ms 이내: 골드 tint 플래시 중 (#ffcc44)
      // AD3 REVISE에서 _setActiveTab 먼저 호출 후 #ffcc44 덮어쓰기 → 150ms 후 #ffcc88 복원
      // 현재 시점(200ms 후)에는 이미 #ffcc88으로 복원되었을 수 있음
      // 플래시 메커니즘 확인: 색상이 #ffcc88(활성)으로 안정화되었는지 확인
      const branchTabColorAfter = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return scene?._tabBranchText?.style?.color;
      });
      expect(branchTabColorAfter).toBe('#ffcc88');

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-branch-tab-active.png` });
    });

    test('B-1 보완: 플래시 직후 색상이 #ffcc44인지 확인', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 분기 탭 클릭 직후 즉시 색상 캡처 (rAF 내에서)
      const flashColor = await page.evaluate(() => {
        return new Promise(resolve => {
          const scene = window.__game.scene.getScene('MerchantScene');
          // 분기 탭 클릭 이벤트 발동
          scene._tabBranchBg.emit('pointerdown');
          // 즉시 색상 확인 (동기적)
          resolve(scene._tabBranchText.style.color);
        });
      });
      // AD3 수정: _setActiveTab(branch)가 먼저 실행 → #ffcc88
      // 그 다음 setColor('#ffcc44')가 덮어씀 → #ffcc44
      expect(flashColor).toBe('#ffcc44');
    });

    test('B-2: 확인 모달에 descKo 표시', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 분기 탭 활성화
      await activateBranchTab(page);
      await page.waitForTimeout(300);

      // 첫 번째 분기 카드의 cardDef를 가져와서 직접 팝업 호출
      const popupOpened = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene || !scene._branchCardDefs || scene._branchCardDefs.length === 0) return false;
        scene._showBranchConfirmPopup(scene._branchCardDefs[0]);
        return scene._branchPopupOpen === true;
      });
      expect(popupOpened).toBe(true);

      // descKo 텍스트가 씬에 존재하는지 확인
      const descKoExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene) return false;
        const list = scene.children?.list || [];
        return list.some(obj =>
          obj.type === 'Text' &&
          obj.style?.color === '#aaaaaa' &&
          obj.style?.fontSize === '11px' &&
          obj.text?.length > 0
        );
      });
      expect(descKoExists).toBe(true);

      // 경고 문구 "되돌릴 수 없습니다" 존재 확인
      const warnExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene) return false;
        return scene.children.list.some(obj =>
          obj.text && obj.text.includes('되돌릴 수 없습니다')
        );
      });
      expect(warnExists).toBe(true);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-confirm-modal-descko.png` });
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 3: 출발 버튼 disabled + 툴팁
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 3: 출발 버튼 disabled 제어', () => {

    test('B-3: 분기 탭 활성 + 카드 미선택 시 출발 버튼 disabled(회색)', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 초기 상태: 도구 탭 활성 → 출발 버튼 활성(녹색), _departDisabled = false
      const initialState = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene?._departBtn) return null;
        // NineSlice 컨테이너: 자식 이미지의 tintTopLeft 확인
        const children = scene._departBtn.list || [];
        const childTint = children.length > 0 ? children[0].tintTopLeft : null;
        return { disabled: scene._departDisabled, childTint };
      });
      expect(initialState?.disabled).toBe(false);
      expect(initialState?.childTint).toBe(0x22aa44);

      // 분기 탭 클릭
      await activateBranchTab(page);

      const disabledState = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        const children = scene._departBtn.list || [];
        const childTint = children.length > 0 ? children[0].tintTopLeft : null;
        return { disabled: scene._departDisabled, childTint };
      });
      expect(disabledState?.disabled).toBe(true);
      expect(disabledState?.childTint).toBe(0x666666);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-depart-disabled.png` });
    });

    test('B-4: disabled 상태 출발 버튼 클릭 시 토스트 표시', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await clickDepartBtn(page);

      const toastExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene) return false;
        return scene.children.list.some(obj =>
          obj.text && obj.text.includes('분기 카드를 선택하세요')
        );
      });
      expect(toastExists).toBe(true);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-depart-toast.png` });
    });

    test('B-4 보완: 토스트가 1.5초 후 사라지는지 확인', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await clickDepartBtn(page);

      const exists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return scene.children.list.some(obj =>
          obj.text && obj.text.includes('분기 카드를 선택하세요')
        );
      });
      expect(exists).toBe(true);

      // 2초 대기 (1.5초 표시 + 400ms fadeOut + 100ms 여유)
      await page.waitForTimeout(2100);

      const gone = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return !scene.children.list.some(obj =>
          obj.text && obj.text.includes('분기 카드를 선택하세요')
        );
      });
      expect(gone).toBe(true);
    });

    test('B-5: 카드 선택 완료 후 출발 버튼 녹색 복원', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);

      // disabled 상태 확인
      const disabledBefore = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return scene?._departDisabled;
      });
      expect(disabledBefore).toBe(true);

      // 첫 번째 카드로 확인 팝업 열기 + 확인
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (scene._branchCardDefs && scene._branchCardDefs.length > 0) {
          scene._showBranchConfirmPopup(scene._branchCardDefs[0]);
        }
      });
      await page.waitForTimeout(300);

      // 확인 버튼 직접 트리거 — okBtn은 NineSlice 컨테이너, depth=102
      // 자식 이미지의 tintTopLeft가 0x227722인 컨테이너를 찾는다
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        const list = scene.children.list;
        for (const obj of list) {
          if (obj.depth === 102 && obj.input && obj.list) {
            // NineSlice 컨테이너: 자식의 tint 확인
            const child = obj.list[0];
            if (child && child.tintTopLeft === 0x227722) {
              obj.emit('pointerdown');
              break;
            }
          }
        }
      });
      await page.waitForTimeout(500);

      // 카드 선택 상태 확인
      const cardSelected = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return scene?._branchCardSelected;
      });
      expect(cardSelected).toBe(true);

      // 출발 버튼 녹색 확인
      const afterState = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        const children = scene._departBtn?.list || [];
        const childTint = children.length > 0 ? children[0].tintTopLeft : null;
        return { disabled: scene._departDisabled, childTint };
      });
      expect(afterState.disabled).toBe(false);
      expect(afterState.childTint).toBe(0x22aa44);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-depart-restored.png` });
    });

    test('B-6: 도구 탭 활성 시 출발 버튼 기존 동작 유지', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      const state = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        const children = scene?._departBtn?.list || [];
        const childTint = children.length > 0 ? children[0].tintTopLeft : null;
        return { disabled: scene?._departDisabled, childTint };
      });
      expect(state.disabled).toBe(false);
      expect(state.childTint).toBe(0x22aa44);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-tools-tab-depart.png` });
    });

    test('탭 전환 시 출발 버튼 상태 올바르게 전환', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      /** 출발 버튼 상태 조회 헬퍼 */
      const getDepartState = () => page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        const children = scene?._departBtn?.list || [];
        const childTint = children.length > 0 ? children[0].tintTopLeft : null;
        return { disabled: scene?._departDisabled, childTint };
      });

      // 도구 탭 → 활성(녹색)
      let state = await getDepartState();
      expect(state.disabled).toBe(false);
      expect(state.childTint).toBe(0x22aa44);

      // 분기 탭 → disabled(회색)
      await activateBranchTab(page);
      state = await getDepartState();
      expect(state.disabled).toBe(true);
      expect(state.childTint).toBe(0x666666);

      // 다시 도구 탭 → 활성(녹색)
      await activateToolsTab(page);
      state = await getDepartState();
      expect(state.disabled).toBe(false);
      expect(state.childTint).toBe(0x22aa44);

      // 다시 분기 탭 → disabled(회색)
      await activateBranchTab(page);
      state = await getDepartState();
      expect(state.disabled).toBe(true);
      expect(state.childTint).toBe(0x666666);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 4: console error 0건 회귀
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 4: console error 회귀', () => {

    test('자동 도구 지급 시나리오에서 console error 0건', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(3000);

      expect(errors).toEqual([]);
    });

    test('MerchantScene 분기 탭 인터랙션에서 console error 0건', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 분기 탭
      await activateBranchTab(page);
      await page.waitForTimeout(300);

      // 출발 버튼 클릭 (disabled 상태)
      await clickDepartBtn(page);
      await page.waitForTimeout(300);

      // 도구 탭 복귀
      await activateToolsTab(page);
      await page.waitForTimeout(300);

      expect(errors).toEqual([]);
    });

    test('전체 흐름 console error 0건', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await freshStart(page);
      await createSaveWithZeroTools(page);

      // 1-1 GatheringScene
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      // MerchantScene 직접 전환
      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 분기 탭 + 출발 클릭 + 탭 전환
      await activateBranchTab(page);
      await clickDepartBtn(page);
      await activateToolsTab(page);
      await page.waitForTimeout(300);

      expect(errors).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시나리오 5: 엣지케이스 + 예외 시나리오
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시나리오 5: 엣지케이스', () => {

    test('토스트 연타 방지: disabled 출발 버튼 3번 클릭 시 토스트 1개만', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);

      // 출발 버튼 3번 빠르게 클릭
      await clickDepartBtn(page);
      await page.waitForTimeout(30);
      await clickDepartBtn(page);
      await page.waitForTimeout(30);
      await clickDepartBtn(page);
      await page.waitForTimeout(200);

      const toastCount = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene) return 0;
        return scene.children.list.filter(obj =>
          obj.text && obj.text.includes('분기 카드를 선택하세요')
        ).length;
      });
      expect(toastCount).toBe(1);
    });

    test('분기 탭 연속 클릭 시 크래시 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      // 분기/도구 탭 5번 빠르게 전환
      for (let i = 0; i < 5; i++) {
        await activateBranchTab(page);
        await page.waitForTimeout(30);
        await activateToolsTab(page);
        await page.waitForTimeout(30);
      }
      await page.waitForTimeout(500);

      expect(errors).toEqual([]);
    });

    test('이미 카드 선택 완료 상태에서 MerchantScene 재진입 시 출발 버튼 활성', async ({ page }) => {
      await waitForBoot(page);

      // 1차: 카드 선택
      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '2-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await page.waitForTimeout(300);

      // 카드 선택 시도
      const popupOpenResult = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene._branchCardDefs || scene._branchCardDefs.length === 0) return false;
        scene._showBranchConfirmPopup(scene._branchCardDefs[0]);
        return scene._branchPopupOpen === true;
      });

      if (popupOpenResult) {
        // 확인 클릭 (NineSlice 컨테이너, 자식 tint 0x227722, depth 102)
        await page.evaluate(() => {
          const scene = window.__game.scene.getScene('MerchantScene');
          const list = scene.children.list;
          for (const obj of list) {
            if (obj.depth === 102 && obj.input && obj.list) {
              const child = obj.list[0];
              if (child && child.tintTopLeft === 0x227722) {
                obj.emit('pointerdown');
                break;
              }
            }
          }
        });
        await page.waitForTimeout(500);
      }

      const selected = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        return scene?._branchCardSelected;
      });

      if (selected) {
        // 2차: 재진입
        await page.evaluate(() => {
          window.__game.scene.start('MerchantScene', { stageId: '2-1' });
        });
        await page.waitForTimeout(1500);

        await activateBranchTab(page);

        const reState = await page.evaluate(() => {
          const scene = window.__game.scene.getScene('MerchantScene');
          const children = scene?._departBtn?.list || [];
          return {
            disabled: scene?._departDisabled,
            childTint: children.length > 0 ? children[0].tintTopLeft : null,
            cardSelected: scene?._branchCardSelected,
          };
        });
        expect(reState.disabled).toBe(false);
        expect(reState.childTint).toBe(0x22aa44);
        expect(reState.cardSelected).toBe(true);
      }
    });

    test('확인 팝업에서 취소 클릭 시 출발 버튼 여전히 disabled', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await page.waitForTimeout(300);

      // 팝업 열기
      const popupOpened = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (!scene._branchCardDefs || scene._branchCardDefs.length === 0) return false;
        scene._showBranchConfirmPopup(scene._branchCardDefs[0]);
        return scene._branchPopupOpen === true;
      });

      if (popupOpened) {
        // 취소 버튼 클릭 (NineSlice 컨테이너, 자식 tint 0x888888, depth 102)
        await page.evaluate(() => {
          const scene = window.__game.scene.getScene('MerchantScene');
          const list = scene.children.list;
          for (const obj of list) {
            if (obj.depth === 102 && obj.input && obj.list) {
              const child = obj.list[0];
              if (child && child.tintTopLeft === 0x888888) {
                obj.emit('pointerdown');
                break;
              }
            }
          }
        });
        await page.waitForTimeout(300);

        // 출발 버튼 여전히 disabled
        const cancelState = await page.evaluate(() => {
          const scene = window.__game.scene.getScene('MerchantScene');
          const children = scene?._departBtn?.list || [];
          return {
            disabled: scene?._departDisabled,
            childTint: children.length > 0 ? children[0].tintTopLeft : null,
          };
        });
        expect(cancelState.disabled).toBe(true);
        expect(cancelState.childTint).toBe(0x666666);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 시각적 검증
  // ═══════════════════════════════════════════════════════════════════

  test.describe('시각적 검증', () => {

    test('자동 도구 지급 알림 레이아웃', async ({ page }) => {
      await freshStart(page);
      await createSaveWithZeroTools(page);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(800);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-visual-auto-tool.png` });
    });

    test('MerchantScene 분기 탭 + disabled 버튼 레이아웃', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await page.waitForTimeout(300);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-visual-branch-disabled.png` });
    });

    test('확인 모달 전체 레이아웃 (descKo 포함)', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await page.waitForTimeout(300);

      // 팝업 열기
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MerchantScene');
        if (scene._branchCardDefs && scene._branchCardDefs.length > 0) {
          scene._showBranchConfirmPopup(scene._branchCardDefs[0]);
        }
      });
      await page.waitForTimeout(500);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-visual-confirm-modal.png` });
    });

    test('출발 토스트 레이아웃', async ({ page }) => {
      await waitForBoot(page);

      await page.evaluate(() => {
        window.__game.scene.start('MerchantScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await activateBranchTab(page);
      await clickDepartBtn(page);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase70-qa-visual-depart-toast.png` });
    });
  });
});
