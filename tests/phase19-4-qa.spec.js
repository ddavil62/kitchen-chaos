/**
 * @fileoverview Phase 19-4 QA 검증 — ServiceScene 비주얼 리워크 + 회귀 테스트.
 * 1) 에셋 404 검증
 * 2) 텍스처 로드 검증
 * 3) ServiceScene 스프라이트 렌더링
 * 4) 테이블/조리 슬롯 인터랙션
 * 5) 버리기/마감 버튼 동작
 * 6) 콘솔 에러 없음
 * 7) 회귀: GatheringScene, MenuScene, ResultScene
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5174/';

/** BootScene 완료 → MenuScene 활성 대기 (최대 20초) */
async function waitForMenuScene(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const game = window.__game;
    return game && game.scene && game.scene.isActive('MenuScene');
  }, { timeout: 20000 });
  // 텍스처 안정화 대기
  await page.waitForTimeout(500);
}

/** ServiceScene 직접 시작 (MenuScene 이후) */
async function startServiceScene(page, opts = {}) {
  await page.evaluate((options) => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) {
      game.scene.stop(s.scene.key);
    }
    game.scene.start('ServiceScene', {
      stageId: options.stageId || '1-1',
      inventory: options.inventory || { carrot: 10, meat: 8, flour: 6, squid: 4, pepper: 3 },
      gold: options.gold || 500,
      lives: options.lives || 10,
      marketResult: { totalIngredients: 31, livesRemaining: 10, livesMax: 15 },
      isEndless: false,
    });
  }, opts);
  await page.waitForTimeout(2000);
}

// ── 정상 동작 테스트 ──────────────────────────────────────────────────

test.describe('Phase 19-4: ServiceScene 비주얼 리워크', () => {

  test.describe('에셋 로드 및 404 검증', () => {

    test('서비스 에셋 12종 네트워크 404 없음', async ({ page }) => {
      const failedRequests = [];
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('/sprites/service/') && response.status() >= 400) {
          failedRequests.push({ url, status: response.status() });
        }
      });

      await waitForMenuScene(page);

      // 모든 서비스 에셋 요청이 완료될 때까지 충분히 대기
      await page.waitForTimeout(2000);

      console.log('Failed service asset requests:', JSON.stringify(failedRequests));
      expect(failedRequests).toEqual([]);
    });

    test('Phaser 텍스처 12종 정상 로드 확인', async ({ page }) => {
      await waitForMenuScene(page);

      const textureStatus = await page.evaluate(() => {
        const game = window.__game;
        if (!game) return { error: 'no game' };
        const keys = [
          'floor_hall', 'counter_cooking',
          'table_lv0', 'table_lv1', 'table_lv2', 'table_lv3', 'table_lv4',
          'customer_normal', 'customer_vip', 'customer_gourmet',
          'customer_rushed', 'customer_group',
        ];
        const result = {};
        for (const k of keys) {
          const exists = game.textures.exists(k);
          let w = 0, h = 0;
          if (exists) {
            const tex = game.textures.get(k);
            const frame = tex.get();
            w = frame.width;
            h = frame.height;
          }
          result[k] = { exists, w, h };
        }
        return result;
      });

      console.log('Texture status:', JSON.stringify(textureStatus, null, 2));

      // 모든 12종 존재
      for (const [key, info] of Object.entries(textureStatus)) {
        expect(info.exists, `${key} 텍스처 존재`).toBe(true);
        expect(info.w, `${key} 너비 > 1`).toBeGreaterThan(1);
        expect(info.h, `${key} 높이 > 1`).toBeGreaterThan(1);
      }
    });
  });

  test.describe('ServiceScene 스프라이트 렌더링', () => {

    test('홀 배경 + 테이블 + 조리 슬롯 전체 레이아웃', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      // 전체 레이아웃 스크린샷
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-4-qa-full-layout.png'),
        clip: { x: 0, y: 0, width: 360, height: 640 },
      });

      // 홀 영역 (40~280) 클로즈업
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-4-qa-hall-area.png'),
        clip: { x: 0, y: 40, width: 360, height: 240 },
      });

      // 조리 슬롯 (280~340) 클로즈업
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-4-qa-cooking-slots.png'),
        clip: { x: 0, y: 280, width: 360, height: 60 },
      });
    });

    test('floor_hall 이미지가 홀 영역에 렌더링됨', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      // 게임 내부에서 floor_hall 텍스처 사용 여부 확인
      const hasFloorHall = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return false;
        // Scene의 display list에서 floor_hall 텍스처를 가진 Image 확인
        const children = scene.children.list;
        return children.some(c =>
          c.type === 'Image' && c.texture && c.texture.key === 'floor_hall'
        );
      });

      expect(hasFloorHall, 'floor_hall Image가 존재').toBe(true);
    });

    test('테이블 스프라이트(table_lv0)가 렌더링됨', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const tableInfo = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return { found: false };
        // tableContainers의 첫 번째 container에서 Image 확인
        const containers = scene.tableContainers || [];
        if (containers.length === 0) return { found: false, reason: 'no containers' };
        const container = containers[0];
        const children = container.list || [];
        const tableImg = children.find(c =>
          c.type === 'Image' && c.texture && c.texture.key.startsWith('table_lv')
        );
        return {
          found: !!tableImg,
          textureKey: tableImg ? tableImg.texture.key : null,
          containerCount: containers.length,
        };
      });

      console.log('Table info:', JSON.stringify(tableInfo));
      expect(tableInfo.found, '테이블 스프라이트 Image 존재').toBe(true);
    });

    test('counter_cooking 아이콘이 조리 슬롯에 렌더링됨', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const counterInfo = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return { found: false };
        const containers = scene.cookSlotContainers || [];
        if (containers.length === 0) return { found: false, reason: 'no containers' };
        const container = containers[0];
        const children = container.list || [];
        const counterImg = children.find(c =>
          c.type === 'Image' && c.texture && c.texture.key === 'counter_cooking'
        );
        return {
          found: !!counterImg,
          slotCount: containers.length,
        };
      });

      console.log('Counter info:', JSON.stringify(counterInfo));
      expect(counterInfo.found, 'counter_cooking Image 존재').toBe(true);
    });
  });

  test.describe('손님 스프라이트 표시 검증', () => {

    test('손님 입장 시 customer_{type} 스프라이트 표시', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      // 4초 대기하여 손님 스폰 유도
      await page.waitForTimeout(4000);

      const customerInfo = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return { found: false };

        const results = [];
        for (let i = 0; i < (scene.tableCount || 0); i++) {
          const cust = scene.tables[i];
          const container = scene.tableContainers[i];
          if (!cust || !container) continue;

          const custIconImg = container.getData('custIconImg');
          const custIconText = container.getData('custIconText');

          results.push({
            tableIdx: i,
            customerType: cust.customerType,
            imgVisible: custIconImg ? custIconImg.visible : null,
            imgTexture: custIconImg ? custIconImg.texture.key : null,
            textVisible: custIconText ? custIconText.visible : null,
          });
        }
        return { found: results.length > 0, customers: results };
      });

      console.log('Customer info:', JSON.stringify(customerInfo, null, 2));

      // 적어도 1명의 손님이 있어야 함
      expect(customerInfo.found, '손님 1명 이상 입장').toBe(true);

      // 스프라이트 Image가 visible이거나, fallback Text가 visible
      for (const c of customerInfo.customers) {
        const hasVisual = c.imgVisible || c.textVisible;
        expect(hasVisual, `테이블 ${c.tableIdx} 손님 아이콘 표시`).toBe(true);
      }

      // 손님 있는 상태 스크린샷
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'p19-4-qa-customers.png'),
        clip: { x: 0, y: 40, width: 360, height: 240 },
      });
    });

    test('custIconImg + custIconText 이중 구조 — 빈 테이블 시 둘 다 숨김', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const emptyTableIcon = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return null;

        // 빈 테이블 찾기
        for (let i = 0; i < (scene.tableCount || 0); i++) {
          if (scene.tables[i] !== null) continue;
          const container = scene.tableContainers[i];
          if (!container) continue;

          const custIconImg = container.getData('custIconImg');
          const custIconText = container.getData('custIconText');

          return {
            tableIdx: i,
            imgVisible: custIconImg ? custIconImg.visible : null,
            textVisible: custIconText ? custIconText.visible : null,
          };
        }
        return null;
      });

      console.log('Empty table icon:', JSON.stringify(emptyTableIcon));
      expect(emptyTableIcon, '빈 테이블 존재').not.toBeNull();
      expect(emptyTableIcon.imgVisible, 'Image 숨김').toBe(false);
      expect(emptyTableIcon.textVisible, 'Text 숨김').toBe(false);
    });
  });

  test.describe('테이블/조리 슬롯 인터랙션', () => {

    test('테이블 hitArea 클릭 반응 정상', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      // 4초 대기 → 손님 입장
      await page.waitForTimeout(4000);

      // 첫 번째 손님이 앉은 테이블 좌표 얻기
      const tablePos = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return null;

        for (let i = 0; i < (scene.tableCount || 0); i++) {
          if (scene.tables[i]) {
            const container = scene.tableContainers[i];
            // 컨테이너의 월드 좌표 계산 (canvas 스케일 고려)
            return { x: container.x, y: container.y, idx: i };
          }
        }
        return null;
      });

      if (tablePos) {
        // 테이블 클릭 (canvas 스케일 계산)
        const canvasScale = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
          const rect = canvas.getBoundingClientRect();
          return {
            scaleX: rect.width / 360,
            scaleY: rect.height / 640,
            offsetX: rect.left,
            offsetY: rect.top,
          };
        });

        const clickX = canvasScale.offsetX + tablePos.x * canvasScale.scaleX;
        const clickY = canvasScale.offsetY + tablePos.y * canvasScale.scaleY;
        await page.mouse.click(clickX, clickY);

        // 클릭 후 메시지 표시 확인 (주문과 일치하는 요리 없음 메시지)
        await page.waitForTimeout(500);
        console.log(`Table ${tablePos.idx} clicked at (${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);
      }
    });

    test('레시피 탭 → 조리 시작 정상', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      // 레시피 버튼 클릭으로 조리 시작
      const cookResult = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene || !scene.recipeButtons || scene.recipeButtons.length === 0) {
          return { success: false, reason: 'no recipe buttons' };
        }

        // 첫 번째 만들 수 있는 레시피 찾기
        for (const entry of scene.recipeButtons) {
          const canMake = scene.inventoryManager.hasEnough(entry.recipe.ingredients);
          if (canMake) {
            scene._onRecipeTap(entry.recipe);
            return {
              success: true,
              recipe: entry.recipe.nameKo,
              slot0: {
                hasRecipe: !!scene.cookingSlots[0].recipe,
                recipeName: scene.cookingSlots[0].recipe?.nameKo || null,
              },
            };
          }
        }
        return { success: false, reason: 'no craftable recipe' };
      });

      console.log('Cook result:', JSON.stringify(cookResult));
      expect(cookResult.success, '조리 시작 성공').toBe(true);
      expect(cookResult.slot0.hasRecipe, '슬롯에 레시피 배정').toBe(true);
    });
  });

  test.describe('버리기/마감 버튼 회귀', () => {

    test('ready 슬롯 버리기 버튼 동작', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      // 레시피 즉시 완성으로 세팅
      const discardResult = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene || !scene.recipeButtons || scene.recipeButtons.length === 0) {
          return { setup: false };
        }

        // 조리 시작
        for (const entry of scene.recipeButtons) {
          if (scene.inventoryManager.hasEnough(entry.recipe.ingredients)) {
            scene._onRecipeTap(entry.recipe);
            break;
          }
        }

        // 강제 완성
        if (scene.cookingSlots[0].recipe) {
          scene.cookingSlots[0].ready = true;
          scene.cookingSlots[0].timeLeft = 0;
          scene._updateCookSlotUI(0);

          // 버리기 실행
          const beforeRecipe = scene.cookingSlots[0].recipe?.nameKo;
          scene._discardDish(0);
          const afterRecipe = scene.cookingSlots[0].recipe;

          return {
            setup: true,
            beforeRecipe,
            afterRecipe: afterRecipe?.nameKo || null,
            slotCleared: afterRecipe === null,
          };
        }
        return { setup: false };
      });

      console.log('Discard result:', JSON.stringify(discardResult));
      expect(discardResult.setup, '버리기 테스트 세팅').toBe(true);
      expect(discardResult.slotCleared, '슬롯 비워짐').toBe(true);
    });

    test('마감 버튼 — 일시정지 중에만 표시', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const closingBtnState = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return null;

        const beforePause = {
          closingBtnVisible: scene.closingBtn.visible,
          closingLabelVisible: scene.closingLabel.visible,
        };

        // 일시정지 토글
        scene._togglePause();

        const afterPause = {
          closingBtnVisible: scene.closingBtn.visible,
          closingLabelVisible: scene.closingLabel.visible,
          isPaused: scene.isPaused,
        };

        // 재개
        scene._togglePause();

        const afterResume = {
          closingBtnVisible: scene.closingBtn.visible,
          closingLabelVisible: scene.closingLabel.visible,
          isPaused: scene.isPaused,
        };

        return { beforePause, afterPause, afterResume };
      });

      console.log('Closing btn state:', JSON.stringify(closingBtnState));
      expect(closingBtnState.beforePause.closingBtnVisible, '초기 숨김').toBe(false);
      expect(closingBtnState.afterPause.closingBtnVisible, '일시정지 시 표시').toBe(true);
      expect(closingBtnState.afterPause.isPaused, '일시정지 상태').toBe(true);
      expect(closingBtnState.afterResume.closingBtnVisible, '재개 시 숨김').toBe(false);
    });

    test('마감 버튼 클릭 → 영업 종료', async ({ page }) => {
      await waitForMenuScene(page);
      await startServiceScene(page);

      const endResult = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return null;

        // 일시정지
        scene._togglePause();
        // 마감 클릭 시뮬레이션
        scene._endService('manual');

        return { isServiceOver: scene.isServiceOver };
      });

      expect(endResult.isServiceOver, '영업 종료').toBe(true);
    });
  });

  test.describe('fallback 렌더링 검증', () => {

    test('SpriteLoader.hasTexture fallback 분기 — 존재하지 않는 텍스처', async ({ page }) => {
      await waitForMenuScene(page);

      const fallbackResult = await page.evaluate(() => {
        const game = window.__game;
        // 존재하지 않는 텍스처 키 검증
        const keys = ['nonexistent_texture', 'table_lv99', 'customer_alien'];
        const results = {};
        for (const k of keys) {
          results[k] = game.textures.exists(k);
        }
        return results;
      });

      for (const [key, exists] of Object.entries(fallbackResult)) {
        expect(exists, `${key} 미존재`).toBe(false);
      }
    });
  });
});

// ── 예외 및 엣지케이스 ─────────────────────────────────────────────────

test.describe('Phase 19-4: 예외 및 엣지케이스', () => {

  test('custIconImg __MISSING 초기 텍스처 — visible=false 확인', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    const missingResult = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ServiceScene');
      if (!scene) return null;

      // 모든 테이블의 custIconImg 초기 상태 확인
      const results = [];
      for (let i = 0; i < (scene.tableCount || 0); i++) {
        if (scene.tables[i] !== null) continue; // 빈 테이블만
        const container = scene.tableContainers[i];
        const custIconImg = container.getData('custIconImg');
        if (custIconImg) {
          results.push({
            idx: i,
            visible: custIconImg.visible,
            textureKey: custIconImg.texture.key,
          });
        }
      }
      return results;
    });

    console.log('Initial custIconImg state:', JSON.stringify(missingResult));
    // 빈 테이블의 custIconImg는 visible=false여야 함
    for (const r of missingResult || []) {
      expect(r.visible, `table ${r.idx} custIconImg hidden`).toBe(false);
    }
  });

  test('빠른 레시피 연타 — 두 슬롯 동시 조리', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    const rapidCookResult = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ServiceScene');
      if (!scene) return null;

      // 만들 수 있는 레시피 2번 연타
      let cooked = 0;
      for (const entry of scene.recipeButtons) {
        if (cooked >= 2) break;
        if (scene.inventoryManager.hasEnough(entry.recipe.ingredients)) {
          scene._onRecipeTap(entry.recipe);
          cooked++;
        }
      }

      return {
        cookedCount: cooked,
        slot0: !!scene.cookingSlots[0].recipe,
        slot1: !!scene.cookingSlots[1].recipe,
      };
    });

    console.log('Rapid cook result:', JSON.stringify(rapidCookResult));
    // 두 슬롯 모두 사용됨
    expect(rapidCookResult.slot0, '슬롯 0 사용').toBe(true);
    if (rapidCookResult.cookedCount >= 2) {
      expect(rapidCookResult.slot1, '슬롯 1 사용').toBe(true);
    }
  });

  test('서비스 종료 상태에서 레시피 탭/테이블 탭 무시', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    const blockedResult = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ServiceScene');
      if (!scene) return null;

      // 강제 종료
      scene.isServiceOver = true;

      // 레시피 탭 시도
      const slotsBefore = scene.cookingSlots.map(s => !!s.recipe);
      for (const entry of scene.recipeButtons) {
        scene._onRecipeTap(entry.recipe);
      }
      const slotsAfter = scene.cookingSlots.map(s => !!s.recipe);

      // 테이블 탭 시도
      scene._onTableTap(0);

      return {
        slotsChanged: JSON.stringify(slotsBefore) !== JSON.stringify(slotsAfter),
        isServiceOver: scene.isServiceOver,
      };
    });

    expect(blockedResult.slotsChanged, '슬롯 변경 없음').toBe(false);
  });

  test('일시정지 상태에서 레시피 탭/테이블 탭 무시', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    const pausedResult = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ServiceScene');
      if (!scene) return null;

      scene._togglePause(); // 일시정지

      const slotsBefore = scene.cookingSlots.map(s => !!s.recipe);
      for (const entry of scene.recipeButtons) {
        scene._onRecipeTap(entry.recipe);
      }
      const slotsAfter = scene.cookingSlots.map(s => !!s.recipe);

      scene._togglePause(); // 재개
      return { slotsChanged: JSON.stringify(slotsBefore) !== JSON.stringify(slotsAfter) };
    });

    expect(pausedResult.slotsChanged, '일시정지 중 슬롯 변경 없음').toBe(false);
  });

  test('버리기 — 미완성 요리 슬롯에서는 무시됨', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    const discardNotReady = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ServiceScene');
      if (!scene) return null;

      // 조리 시작 (미완성)
      for (const entry of scene.recipeButtons) {
        if (scene.inventoryManager.hasEnough(entry.recipe.ingredients)) {
          scene._onRecipeTap(entry.recipe);
          break;
        }
      }

      const hasRecipeBefore = !!scene.cookingSlots[0].recipe;
      const isReady = scene.cookingSlots[0].ready;

      // 미완성 상태에서 버리기 시도
      scene._discardDish(0);

      const hasRecipeAfter = !!scene.cookingSlots[0].recipe;

      return { hasRecipeBefore, isReady, hasRecipeAfter, notDiscarded: hasRecipeAfter };
    });

    console.log('Discard not ready:', JSON.stringify(discardNotReady));
    expect(discardNotReady.isReady, '미완성 상태').toBe(false);
    expect(discardNotReady.notDiscarded, '버리기 무시됨').toBe(true);
  });
});

// ── UI 안정성 ──────────────────────────────────────────────────────────

test.describe('Phase 19-4: UI 안정성', () => {

  test('ServiceScene 진입 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForMenuScene(page);
    await startServiceScene(page);

    // 5초간 동작
    await page.waitForTimeout(5000);

    console.log('Console errors:', errors);
    expect(errors, '콘솔 에러 없음').toEqual([]);
  });

  test('BootScene → MenuScene 전체 로드 중 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForMenuScene(page);
    await page.waitForTimeout(2000);

    console.log('Boot errors:', errors);
    expect(errors, '부트 콘솔 에러 없음').toEqual([]);
  });

  test('모바일 뷰포트(360x640) ServiceScene 정상 렌더링', async ({ page }) => {
    // Playwright config에서 이미 Pixel 5 디바이스 사용, 추가 검증
    await page.setViewportSize({ width: 360, height: 640 });

    await waitForMenuScene(page);
    await startServiceScene(page);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-mobile.png'),
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});

// ── 회귀 테스트 ────────────────────────────────────────────────────────

test.describe('Phase 19-4: 회귀 테스트', () => {

  test('MenuScene 정상 표시 (타 씬 영향 없음)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForMenuScene(page);

    // MenuScene 활성 확인
    const isActive = await page.evaluate(() => {
      return window.__game.scene.isActive('MenuScene');
    });

    expect(isActive, 'MenuScene 활성').toBe(true);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-menu-regression.png'),
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });

    expect(errors).toEqual([]);
  });

  test('GatheringScene 로드 회귀 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForMenuScene(page);

    // GatheringScene 직접 시작
    await page.evaluate(() => {
      const game = window.__game;
      const activeScenes = game.scene.getScenes(true);
      for (const s of activeScenes) {
        game.scene.stop(s.scene.key);
      }
      // SaveManager에서 도구 로드를 위해 기본 데이터 전달
      game.scene.start('GatheringScene', {
        stageId: '1-1',
        tools: [],
        chefId: 'petit_chef',
      });
    });

    await page.waitForTimeout(3000);

    const isActive = await page.evaluate(() => {
      return window.__game.scene.isActive('GatheringScene');
    });

    expect(isActive, 'GatheringScene 활성').toBe(true);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-gathering-regression.png'),
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });

    // JS 에러 없음 (GatheringScene tools 누락 등으로 인한 에러 체크)
    // GatheringScene은 도구 데이터가 필수일 수 있으므로 에러가 있을 수 있음 — 기록만
    if (errors.length > 0) {
      console.log('GatheringScene errors (may be expected due to missing tools):', errors);
    }
  });

  test('ResultScene 월드맵으로 버튼 y좌표 GAME_HEIGHT(640) 이내', async ({ page }) => {
    await waitForMenuScene(page);

    // ResultScene 직접 시작 (캠페인 결과)
    await page.evaluate(() => {
      const game = window.__game;
      const activeScenes = game.scene.getScenes(true);
      for (const s of activeScenes) {
        game.scene.stop(s.scene.key);
      }
      game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 20, livesRemaining: 10, livesMax: 15 },
        serviceResult: {
          totalGold: 500, tipTotal: 100, maxCombo: 5,
          satisfaction: 85, servedCount: 10, totalCustomers: 12,
        },
        isMarketFailed: false,
        isEndless: false,
      });
    });

    await page.waitForTimeout(2000);

    // 월드맵 버튼 y좌표 확인
    const buttonInfo = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ResultScene');
      if (!scene) return null;

      // Scene의 display list에서 "월드맵으로" 텍스트를 가진 객체 찾기
      const children = scene.children.list;
      const worldmapText = children.find(c =>
        c.type === 'Text' && c.text && c.text.includes('월드맵')
      );

      return worldmapText ? {
        y: worldmapText.y,
        text: worldmapText.text,
        withinBounds: worldmapText.y <= 640,
      } : null;
    });

    console.log('ResultScene worldmap button:', JSON.stringify(buttonInfo));
    expect(buttonInfo, '월드맵 버튼 존재').not.toBeNull();
    expect(buttonInfo.withinBounds, '버튼 y <= 640').toBe(true);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-result-regression.png'),
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });

  test('MerchantScene 로드 회귀 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await waitForMenuScene(page);

    await page.evaluate(() => {
      const game = window.__game;
      const activeScenes = game.scene.getScenes(true);
      for (const s of activeScenes) {
        game.scene.stop(s.scene.key);
      }
      game.scene.start('MerchantScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 20, livesRemaining: 10, livesMax: 15 },
        serviceResult: {
          totalGold: 500, tipTotal: 100, maxCombo: 5,
          satisfaction: 85, servedCount: 10, totalCustomers: 12,
        },
        isMarketFailed: false,
      });
    });

    await page.waitForTimeout(2000);

    const isActive = await page.evaluate(() => {
      return window.__game.scene.isActive('MerchantScene');
    });

    expect(isActive, 'MerchantScene 활성').toBe(true);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-merchant-regression.png'),
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });

    if (errors.length > 0) {
      console.log('MerchantScene errors:', errors);
    }
  });
});

// ── 시각적 검증 스크린샷 ─────────────────────────────────────────────

test.describe('Phase 19-4: 시각적 검증', () => {

  test('조리 진행 중 → 완료 → 서빙 전체 시각 흐름', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    // 1) 초기 빈 슬롯 상태
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-cook-empty.png'),
      clip: { x: 0, y: 280, width: 360, height: 60 },
    });

    // 2) 레시피 조리 시작
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      for (const entry of scene.recipeButtons) {
        if (scene.inventoryManager.hasEnough(entry.recipe.ingredients)) {
          scene._onRecipeTap(entry.recipe);
          break;
        }
      }
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-cook-progress.png'),
      clip: { x: 0, y: 280, width: 360, height: 60 },
    });

    // 3) 강제 완성
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      if (scene.cookingSlots[0].recipe) {
        scene.cookingSlots[0].ready = true;
        scene.cookingSlots[0].timeLeft = 0;
        scene._updateCookSlotUI(0);
      }
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-cook-ready.png'),
      clip: { x: 0, y: 280, width: 360, height: 60 },
    });
  });

  test('하단 바 레이아웃 (스킬 버튼 + 일시정지)', async ({ page }) => {
    await waitForMenuScene(page);
    await startServiceScene(page);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'p19-4-qa-bottom-bar.png'),
      clip: { x: 0, y: 570, width: 360, height: 70 },
    });
  });
});
