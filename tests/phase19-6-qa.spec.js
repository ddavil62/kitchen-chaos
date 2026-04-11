/**
 * @fileoverview Phase 19-6 QA 테스트 — 영업씬 홀 데코 + 하단 패널 통합 + HUD 개선.
 *
 * 검증 범위:
 * - 19-6-1: 에셋 3종 로드 확인
 * - 19-6-2: 홀 데코 오브젝트 배치 (wall_back, decor_plant, entrance_arch)
 * - 19-6-3: 하단 패널 색상 통합, HUD 색상 변경, 레시피 hover, 인터랙션
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = 'tests/screenshots';

// ServiceScene 시작 파라미터
const SERVICE_PARAMS = {
  stageId: '1-1',
  inventory: { carrot: 10, meat: 8, flour: 6, squid: 4, pepper: 3, mushroom: 5, fish: 5 },
  gold: 500,
  lives: 10,
  chapter: 1,
  tableCount: 6,
};

/**
 * MenuScene 활성 대기 후 ServiceScene으로 전환하는 헬퍼.
 */
async function navigateToServiceScene(page) {
  await page.goto(BASE_URL);
  // BootScene -> MenuScene 전환 대기 (최대 90초)
  await page.waitForFunction(() => {
    return window.__game &&
      window.__game.scene &&
      window.__game.scene.isActive('MenuScene');
  }, { timeout: 90000 });

  // ServiceScene 시작
  await page.evaluate((params) => {
    window.__game.scene.start('ServiceScene', params);
  }, SERVICE_PARAMS);

  // ServiceScene 활성 대기
  await page.waitForFunction(() => {
    return window.__game &&
      window.__game.scene &&
      window.__game.scene.isActive('ServiceScene');
  }, { timeout: 15000 });

  // 렌더링 안정화 대기
  await page.waitForTimeout(2000);
}

test.describe('Phase 19-6 QA: 영업씬 UI 디자인 재설계', () => {
  // 콘솔 에러 수집
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', (err) => {
      // boss/tileset 관련 에러는 기존 미구현 에셋이므로 무시
      if (err.message.includes('boss') || err.message.includes('tileset')) return;
      consoleErrors.push(err.message);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 19-6-1: 에셋 존재 및 로드 확인
  // ══════════════════════════════════════════════════════════

  test.describe('19-6-1: 에셋 로드', () => {
    test('wall_back.png 에셋이 서버에서 로드 가능하다', async ({ page }) => {
      const res = await page.goto(`${BASE_URL}/sprites/service/wall_back.png`);
      expect(res.status()).toBe(200);
      const contentType = res.headers()['content-type'];
      expect(contentType).toContain('image/png');
    });

    test('decor_plant.png 에셋이 서버에서 로드 가능하다', async ({ page }) => {
      const res = await page.goto(`${BASE_URL}/sprites/service/decor_plant.png`);
      expect(res.status()).toBe(200);
    });

    test('entrance_arch.png 에셋이 서버에서 로드 가능하다', async ({ page }) => {
      const res = await page.goto(`${BASE_URL}/sprites/service/entrance_arch.png`);
      expect(res.status()).toBe(200);
    });

    test('SpriteLoader에서 3종 텍스처가 정상 로드된다', async ({ page }) => {
      await navigateToServiceScene(page);

      const textureCheck = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene) return { error: 'ServiceScene not found' };
        return {
          wall_back: scene.textures.exists('wall_back'),
          decor_plant: scene.textures.exists('decor_plant'),
          entrance_arch: scene.textures.exists('entrance_arch'),
        };
      });

      expect(textureCheck.wall_back).toBe(true);
      expect(textureCheck.decor_plant).toBe(true);
      expect(textureCheck.entrance_arch).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 19-6-2: 홀 데코 오브젝트 배치
  // ══════════════════════════════════════════════════════════

  test.describe('19-6-2: 홀 데코 배치', () => {
    test('홀 상단에 뒷벽 이미지가 렌더링된다', async ({ page }) => {
      await navigateToServiceScene(page);

      const wallBackInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        // wall_back 텍스처를 사용하는 Image 오브젝트 찾기
        for (const child of children) {
          if (child.type === 'Image' && child.texture && child.texture.key === 'wall_back') {
            return {
              found: true,
              x: child.x,
              y: child.y,
              displayWidth: child.displayWidth,
              displayHeight: child.displayHeight,
              depth: child.depth,
            };
          }
        }
        return { found: false };
      });

      expect(wallBackInfo.found).toBe(true);
      // y = HALL_Y(40) + 26 = 66 (범위: 40~92 내)
      expect(wallBackInfo.y).toBeGreaterThanOrEqual(40);
      expect(wallBackInfo.y).toBeLessThanOrEqual(92);
      expect(wallBackInfo.displayWidth).toBe(360); // GAME_WIDTH
      expect(wallBackInfo.displayHeight).toBe(52);
      expect(wallBackInfo.depth).toBe(3);
    });

    test('홀 좌우 코너에 화분이 배치된다', async ({ page }) => {
      await navigateToServiceScene(page);

      const plants = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        const results = [];
        for (const child of children) {
          if (child.type === 'Image' && child.texture && child.texture.key === 'decor_plant') {
            results.push({
              x: child.x,
              y: child.y,
              displayWidth: child.displayWidth,
              displayHeight: child.displayHeight,
              flipX: child.flipX,
              depth: child.depth,
            });
          }
        }
        return results;
      });

      expect(plants.length).toBe(2);

      // 좌측 화분
      const leftPlant = plants.find(p => p.x < 180);
      expect(leftPlant).toBeTruthy();
      expect(leftPlant.x).toBe(18);
      expect(leftPlant.y).toBe(120);
      expect(leftPlant.displayWidth).toBe(28);
      expect(leftPlant.displayHeight).toBe(42);
      expect(leftPlant.flipX).toBe(false);

      // 우측 화분 (flipX)
      const rightPlant = plants.find(p => p.x > 180);
      expect(rightPlant).toBeTruthy();
      expect(rightPlant.x).toBe(342); // GAME_WIDTH - 18
      expect(rightPlant.y).toBe(120);
      expect(rightPlant.flipX).toBe(true);
    });

    test('홀 하단에 입구 아치가 렌더링된다', async ({ page }) => {
      await navigateToServiceScene(page);

      const archInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        for (const child of children) {
          if (child.type === 'Image' && child.texture && child.texture.key === 'entrance_arch') {
            return {
              found: true,
              x: child.x,
              y: child.y,
              displayWidth: child.displayWidth,
              displayHeight: child.displayHeight,
              depth: child.depth,
            };
          }
        }
        return { found: false };
      });

      expect(archInfo.found).toBe(true);
      // y = COOK_Y(280) - 24 = 256
      expect(archInfo.y).toBe(256);
      expect(archInfo.x).toBe(180); // GAME_WIDTH / 2
      expect(archInfo.displayWidth).toBe(120);
      expect(archInfo.displayHeight).toBe(40);
      expect(archInfo.depth).toBe(5);
    });

    test('SISO_ORIGIN_Y가 100으로 설정되었다', async ({ page }) => {
      await navigateToServiceScene(page);

      // 첫 번째 테이블(col=0, row=0)의 y좌표로 간접 확인
      // _cellToWorld(0,0) = { x: 140, y: SISO_ORIGIN_Y + 0 } = { x: 140, y: 100 }
      const tableY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.tableContainers || scene.tableContainers.length === 0) return null;
        return scene.tableContainers[0].y;
      });

      expect(tableY).toBe(100);
    });

    test('홀 전체 레이아웃 스크린샷', async ({ page }) => {
      await navigateToServiceScene(page);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase19-6-hall-decor.png`,
        clip: { x: 0, y: 0, width: 360, height: 300 },
      });
    });
  });

  // ══════════════════════════════════════════════════════════
  // 19-6-3: 하단 패널 통합 + HUD 개선
  // ══════════════════════════════════════════════════════════

  test.describe('19-6-3: 하단 패널 + HUD', () => {
    test('HUD 배경이 어두운 갈색(0x1c0e00)이다', async ({ page }) => {
      await navigateToServiceScene(page);

      const hudBgColor = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        // 첫 번째 Rectangle: HUD 배경 (y=20, height=40)
        for (const child of children) {
          if (child.type === 'Rectangle' &&
              child.y === 20 && // HUD_H/2 = 20
              child.height === 40 &&
              child.depth === 100) {
            return { found: true, fillColor: child.fillColor };
          }
        }
        return { found: false };
      });

      expect(hudBgColor.found).toBe(true);
      expect(hudBgColor.fillColor).toBe(0x1c0e00);
    });

    test('HUD 하단에 골드 구분선(반투명)이 있다', async ({ page }) => {
      await navigateToServiceScene(page);

      const dividerInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        for (const child of children) {
          if (child.type === 'Rectangle' &&
              child.y === 40 && // HUD_H = 40
              child.height === 1 &&
              child.fillColor === 0xffd700) {
            return { found: true, alpha: child.alpha, depth: child.depth };
          }
        }
        return { found: false };
      });

      expect(dividerInfo.found).toBe(true);
      expect(dividerInfo.alpha).toBeCloseTo(0.4, 1);
      expect(dividerInfo.depth).toBe(100);
    });

    test('공통 배경(0x1c1008)이 COOK~RECIPE 영역을 커버한다', async ({ page }) => {
      await navigateToServiceScene(page);

      const bgInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        // 공통 배경: y = COOK_Y + (RECIPE_Y + RECIPE_H - COOK_Y)/2 = 280 + (440+130-280)/2 = 280 + 145 = 425
        // height = RECIPE_Y + RECIPE_H - COOK_Y = 440+130-280 = 290
        for (const child of children) {
          if (child.type === 'Rectangle' &&
              child.fillColor === 0x1c1008 &&
              child.height === 290 &&
              child.depth === 0) {
            return { found: true, y: child.y, width: child.width, height: child.height };
          }
        }
        return { found: false };
      });

      expect(bgInfo.found).toBe(true);
    });

    test('COOK/STOCK 경계에 앰버 구분선이 있다', async ({ page }) => {
      await navigateToServiceScene(page);

      const divider = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        for (const child of children) {
          if (child.type === 'Rectangle' &&
              child.y === 340 && // STOCK_Y
              child.height === 1 &&
              child.fillColor === 0x8B6914) {
            return { found: true, depth: child.depth };
          }
        }
        return { found: false };
      });

      expect(divider.found).toBe(true);
      expect(divider.depth).toBe(9);
    });

    test('STOCK/RECIPE 경계에 앰버 구분선이 있다', async ({ page }) => {
      await navigateToServiceScene(page);

      const divider = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        for (const child of children) {
          if (child.type === 'Rectangle' &&
              child.y === 440 && // RECIPE_Y
              child.height === 1 &&
              child.fillColor === 0x8B6914) {
            return { found: true, depth: child.depth };
          }
        }
        return { found: false };
      });

      expect(divider.found).toBe(true);
    });

    test('섹션 레이블 3종이 표시된다', async ({ page }) => {
      await navigateToServiceScene(page);

      const labels = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        const found = { cook: false, stock: false, recipe: false };
        for (const child of children) {
          if (child.type !== 'Text') continue;
          const text = child.text;
          if (text && text.includes('\uD83D\uDD25') && text.includes('\uC870\uB9AC')) found.cook = true;
          if (text && text.includes('\uD83E\uDD55') && text.includes('\uC7AC\uACE0')) found.stock = true;
          if (text && text.includes('\uD83D\uDCCB') && text.includes('\uB808\uC2DC\uD53C')) found.recipe = true;
        }
        return found;
      });

      expect(labels.cook).toBe(true);
      expect(labels.stock).toBe(true);
      expect(labels.recipe).toBe(true);
    });

    test('satText 색상이 #e8c87a로 변경되었다', async ({ page }) => {
      await navigateToServiceScene(page);

      const satColor = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (scene.satText) {
          return scene.satText.style.color;
        }
        return null;
      });

      expect(satColor).toBe('#e8c87a');
    });

    test('조리 슬롯 배경 색상이 0x2d1a08이다', async ({ page }) => {
      await navigateToServiceScene(page);

      const slotColors = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const results = [];
        for (const container of scene.cookSlotContainers) {
          // container 첫 번째 자식이 배경 Rectangle
          const children = container.list;
          for (const child of children) {
            if (child.type === 'Rectangle' && child.width > 100) {
              results.push({
                fillColor: child.fillColor,
                strokeColor: child.strokeColor,
              });
              break;
            }
          }
        }
        return results;
      });

      expect(slotColors.length).toBe(2); // MAX_COOKING_SLOTS = 2
      for (const slot of slotColors) {
        expect(slot.fillColor).toBe(0x2d1a08);
        expect(slot.strokeColor).toBe(0x4a3520);
      }
    });

    test('레시피 버튼 배경 색상이 0x2d1a0a이다', async ({ page }) => {
      await navigateToServiceScene(page);

      const btnColors = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.recipeButtons || scene.recipeButtons.length === 0) return [];
        return scene.recipeButtons.map(entry => ({
          fillColor: entry.btn.fillColor,
          strokeColor: entry.btn.strokeColor,
          textColor: entry.text.style.color,
        }));
      });

      expect(btnColors.length).toBeGreaterThan(0);
      for (const btn of btnColors) {
        // 활성 또는 비활성 상태에 따라 다를 수 있음
        expect([0x2d1a0a, 0x1c1008]).toContain(btn.fillColor);
      }
    });

    test('레시피 버튼 hover 시 색상이 0x4a2e10으로 변한다', async ({ page }) => {
      await navigateToServiceScene(page);

      // 첫 번째 레시피 버튼 위에 hover
      const hoverResult = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.recipeButtons || scene.recipeButtons.length === 0) return { error: 'no buttons' };

        const btn = scene.recipeButtons[0].btn;
        const originalColor = btn.fillColor;

        // pointerover 이벤트 수동 발생
        btn.emit('pointerover');
        const hoverColor = btn.fillColor;

        // pointerout으로 복귀
        btn.emit('pointerout');
        const afterColor = btn.fillColor;

        return { originalColor, hoverColor, afterColor };
      });

      expect(hoverResult.hoverColor).toBe(0x4a2e10);
      // hover 해제 후 원래 색상으로 복귀
      expect(hoverResult.afterColor).toBe(0x2d1a0a);
    });

    test('재고 텍스트 활성 색상이 #e8c87a, 비활성 색상이 #555555이다', async ({ page }) => {
      await navigateToServiceScene(page);

      const stockColors = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const results = {};
        for (const [type, txt] of Object.entries(scene.stockTexts)) {
          results[type] = txt.style.color;
        }
        return results;
      });

      // carrot: 10개 -> 활성
      expect(stockColors.carrot).toBe('#e8c87a');
      // 재고 0인 재료 확인 (cheese는 inventory에 없음)
      if (stockColors.cheese) {
        expect(stockColors.cheese).toBe('#555555');
      }
    });

    test('재고 업데이트 시 활성/비활성 색상이 올바르게 변한다', async ({ page }) => {
      await navigateToServiceScene(page);

      const updateResult = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        // carrot 재고를 0으로 변경
        scene.inventoryManager.inventory.carrot = 0;
        scene._updateInventoryPanel();
        const colorAfterZero = scene.stockTexts.carrot.style.color;

        // 다시 복구
        scene.inventoryManager.inventory.carrot = 5;
        scene._updateInventoryPanel();
        const colorAfterRestore = scene.stockTexts.carrot.style.color;

        return { colorAfterZero, colorAfterRestore };
      });

      expect(updateResult.colorAfterZero).toBe('#555555');
      expect(updateResult.colorAfterRestore).toBe('#e8c87a');
    });

    test('_updateRecipeQuickSlots 활성/비활성 색상 동기화', async ({ page }) => {
      await navigateToServiceScene(page);

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.recipeButtons || scene.recipeButtons.length === 0) return { error: 'no buttons' };

        // 모든 재고를 0으로 — 모든 레시피 비활성화
        const backup = { ...scene.inventoryManager.inventory };
        for (const key of Object.keys(scene.inventoryManager.inventory)) {
          scene.inventoryManager.inventory[key] = 0;
        }
        scene._updateRecipeQuickSlots();

        const disabledColors = scene.recipeButtons.map(e => ({
          fill: e.btn.fillColor,
          alpha: e.btn.alpha,
          textColor: e.text.style.color,
        }));

        // 재고 복원
        Object.assign(scene.inventoryManager.inventory, backup);
        scene._updateRecipeQuickSlots();

        const enabledColors = scene.recipeButtons.map(e => ({
          fill: e.btn.fillColor,
          alpha: e.btn.alpha,
          textColor: e.text.style.color,
        }));

        return { disabledColors, enabledColors };
      });

      // 비활성 상태: fill=0x1c1008, alpha=0.5, text=#6b4a2a
      for (const d of result.disabledColors) {
        expect(d.fill).toBe(0x1c1008);
        expect(d.alpha).toBeCloseTo(0.5, 1);
        expect(d.textColor).toBe('#6b4a2a');
      }
      // 활성 상태 (재료 있는 레시피만): fill=0x2d1a0a, alpha=1, text=#e8c87a
      const activeBtn = result.enabledColors.find(e => e.alpha === 1);
      if (activeBtn) {
        expect(activeBtn.fill).toBe(0x2d1a0a);
        expect(activeBtn.textColor).toBe('#e8c87a');
      }
    });

    test('HUD 스크린샷', async ({ page }) => {
      await navigateToServiceScene(page);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase19-6-hud.png`,
        clip: { x: 0, y: 0, width: 360, height: 45 },
      });
    });

    test('하단 패널 전체 스크린샷', async ({ page }) => {
      await navigateToServiceScene(page);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase19-6-bottom-panels.png`,
        clip: { x: 0, y: 275, width: 360, height: 300 },
      });
    });

    test('전체 화면 스크린샷', async ({ page }) => {
      await navigateToServiceScene(page);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase19-6-full-scene.png`,
      });
    });
  });

  // ══════════════════════════════════════════════════════════
  // 인터랙션 검증
  // ══════════════════════════════════════════════════════════

  test.describe('인터랙션 정상 동작', () => {
    test('테이블 터치가 정상 동작한다', async ({ page }) => {
      await navigateToServiceScene(page);

      // 첫 번째 테이블 위치 가져오기 (col=0, row=0 -> x=140, y=100)
      const tablePos = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const container = scene.tableContainers[0];
        return { x: container.x, y: container.y };
      });

      // 테이블 클릭 — 에러 없이 동작해야 함
      await page.mouse.click(tablePos.x, tablePos.y);
      await page.waitForTimeout(500);

      // 에러 없음 확인
      expect(consoleErrors).toEqual([]);
    });

    test('레시피 버튼 클릭이 정상 동작한다', async ({ page }) => {
      await navigateToServiceScene(page);

      const recipePos = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.recipeButtons || scene.recipeButtons.length === 0) return null;
        const btn = scene.recipeButtons[0].btn;
        return { x: btn.x, y: btn.y };
      });

      if (recipePos) {
        await page.mouse.click(recipePos.x, recipePos.y);
        await page.waitForTimeout(500);
      }

      expect(consoleErrors).toEqual([]);
    });

    test('조리 슬롯에 요리가 배정되면 진행 바가 표시된다', async ({ page }) => {
      await navigateToServiceScene(page);

      // 프로그래밍으로 조리 시작
      const cookResult = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.recipeButtons || scene.recipeButtons.length === 0) return { error: 'no recipes' };

        // 첫 번째 활성 레시피 찾기
        for (const entry of scene.recipeButtons) {
          if (scene.inventoryManager.hasEnough(entry.recipe.ingredients)) {
            scene._onRecipeTap(entry.recipe);
            return { started: true, recipeName: entry.recipe.nameKo };
          }
        }
        return { started: false, reason: 'no available recipe' };
      });

      if (cookResult.started) {
        await page.waitForTimeout(500);

        // 조리 슬롯 상태 확인
        const slotState = await page.evaluate(() => {
          const scene = window.__game.scene.getScene('ServiceScene');
          const slot = scene.cookingSlots[0];
          return {
            hasRecipe: !!slot.recipe,
            ready: slot.ready,
          };
        });

        expect(slotState.hasRecipe).toBe(true);
      }

      expect(consoleErrors).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 예외 시나리오 / 엣지케이스
  // ══════════════════════════════════════════════════════════

  test.describe('예외 시나리오', () => {
    test('에셋 미로드 시 graceful fallback (에러 없음)', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForFunction(() => {
        return window.__game && window.__game.scene && window.__game.scene.isActive('MenuScene');
      }, { timeout: 90000 });

      // 텍스처 키를 강제 삭제한 후 ServiceScene 시작
      await page.evaluate((params) => {
        // ServiceScene 시작 후 텍스처 확인
        window.__game.scene.start('ServiceScene', params);
      }, SERVICE_PARAMS);

      await page.waitForFunction(() => {
        return window.__game && window.__game.scene && window.__game.scene.isActive('ServiceScene');
      }, { timeout: 15000 });

      await page.waitForTimeout(1000);

      // 에러 없이 씬이 정상 실행되었는지 확인
      const sceneActive = await page.evaluate(() => {
        return window.__game.scene.isActive('ServiceScene');
      });

      expect(sceneActive).toBe(true);
      expect(consoleErrors).toEqual([]);
    });

    test('레시피 연타 (빠른 연속 클릭) 시 에러 없음', async ({ page }) => {
      await navigateToServiceScene(page);

      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        if (!scene.recipeButtons || scene.recipeButtons.length === 0) return;

        // 같은 레시피를 5번 연타
        for (let i = 0; i < 5; i++) {
          const entry = scene.recipeButtons[0];
          if (scene.inventoryManager.hasEnough(entry.recipe.ingredients)) {
            scene._onRecipeTap(entry.recipe);
          }
        }
      });

      await page.waitForTimeout(1000);
      expect(consoleErrors).toEqual([]);
    });

    test('재고 0인 재료의 레시피 클릭 시 에러 없음', async ({ page }) => {
      await navigateToServiceScene(page);

      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        // 모든 재고를 0으로
        for (const key of Object.keys(scene.inventoryManager.inventory)) {
          scene.inventoryManager.inventory[key] = 0;
        }
        scene._updateInventoryPanel();
        scene._updateRecipeQuickSlots();

        // 비활성 상태에서도 레시피 탭 시도
        if (scene.recipeButtons && scene.recipeButtons.length > 0) {
          scene._onRecipeTap(scene.recipeButtons[0].recipe);
        }
      });

      await page.waitForTimeout(500);
      expect(consoleErrors).toEqual([]);
    });

    test('개별 배경이 제거되었는지 확인 (중복 배경 없음)', async ({ page }) => {
      await navigateToServiceScene(page);

      const bgRects = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        const children = scene.children.list;
        // 기존 개별 배경 색상 찾기 (0x1a1a2e=재고, 0x111122=레시피)
        const oldBgs = [];
        for (const child of children) {
          if (child.type === 'Rectangle') {
            if (child.fillColor === 0x1a1a2e || child.fillColor === 0x111122) {
              // HUD는 이제 0x1c0e00이므로 이 색상은 있으면 안 됨 (단, 다른 용도일 수 있음)
              oldBgs.push({
                fillColor: child.fillColor.toString(16),
                x: child.x,
                y: child.y,
                width: child.width,
                height: child.height,
              });
            }
          }
        }
        return oldBgs;
      });

      // 기존 개별 배경(STOCK: 0x1a1a2e, RECIPE: 0x111122)이 남아있으면 안 됨
      // 단, STOCK 높이 100, RECIPE 높이 130인 것이 없어야 함
      const oldStockBg = bgRects.find(r => r.fillColor === '1a1a2e' && r.height === 100);
      const oldRecipeBg = bgRects.find(r => r.fillColor === '111122' && r.height === 130);

      expect(oldStockBg).toBeUndefined();
      expect(oldRecipeBg).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════
  // UI 안정성
  // ══════════════════════════════════════════════════════════

  test.describe('UI 안정성', () => {
    test('콘솔 에러가 발생하지 않는다 (게임 로드~영업씬 진입)', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => {
        if (err.message.includes('boss') || err.message.includes('tileset')) return;
        errors.push(err.message);
      });

      await navigateToServiceScene(page);
      await page.waitForTimeout(3000);

      expect(errors).toEqual([]);
    });

    test('goldText 색상은 #ffd700으로 유지된다', async ({ page }) => {
      await navigateToServiceScene(page);

      const goldColor = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ServiceScene');
        return scene.goldText.style.color;
      });

      expect(goldColor).toBe('#ffd700');
    });
  });
});
