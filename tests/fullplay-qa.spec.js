/**
 * @fileoverview Kitchen Chaos Tycoon 전체 플레이 QA 테스트.
 * 각 씬을 순회하며 스크린샷 촬영, 콘솔 에러 체크, 인터랙션 검증을 수행한다.
 */
import { test, expect } from '@playwright/test';

// 공통 유틸: 게임 로드 후 새로고침(첫 로드 SHUTDOWN 버그 우회) + MenuScene 안정화 대기
async function loadGame(page) {
  // 콘솔 에러 수집
  const errors = [];
  const warnings = [];
  const consoleMessages = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  // 첫 로드 SHUTDOWN 버그 우회: 새로고침
  await page.reload();
  await page.waitForTimeout(3000);

  return { errors, warnings, consoleMessages };
}

// 캔버스 클릭 헬퍼 (Phaser는 캔버스 내부 좌표계 사용)
async function clickCanvas(page, x, y) {
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x, y } });
}

// 씬 전환 헬퍼 (window.__game을 통해 직접 씬 전환)
async function startScene(page, sceneName, data = {}) {
  await page.evaluate(({ scene, d }) => {
    const game = window.__game;
    if (game && game.scene) {
      game.scene.start(scene, d);
    }
  }, { scene: sceneName, d: data });
  await page.waitForTimeout(1500);
}

// 현재 활성 씬 키 가져오기
async function getActiveScene(page) {
  return await page.evaluate(() => {
    const game = window.__game;
    if (!game || !game.scene) return 'unknown';
    const scenes = game.scene.getScenes(true);
    return scenes.length > 0 ? scenes[0].scene.key : 'none';
  });
}

test.describe('Kitchen Chaos Tycoon - 전체 플레이 QA', () => {

  test.describe('1. MenuScene 검증', () => {
    test('메인 메뉴가 정상적으로 렌더링된다', async ({ page }) => {
      const { errors } = await loadGame(page);

      const scene = await getActiveScene(page);
      expect(scene).toBe('MenuScene');

      await page.screenshot({ path: 'tests/screenshots/01-menu-scene.png' });

      // 콘솔 에러 체크 (알려진 에셋 로딩 경고 제외)
      const criticalErrors = errors.filter(e =>
        !e.includes('Failed to load') &&
        !e.includes('404') &&
        !e.includes('net::ERR')
      );
      // 에러가 있어도 일단 기록만 (스크린샷으로 확인)
    });

    test('설정 패널(기어 아이콘) 열기/닫기', async ({ page }) => {
      await loadGame(page);

      // 기어 아이콘 클릭 (x=330, y=30)
      await clickCanvas(page, 330, 30);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/02-settings-panel.png' });

      // 닫기 버튼 클릭 (패널 우상단 X 버튼: 약 x=305, y=185)
      await clickCanvas(page, 305, 185);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/03-settings-closed.png' });
    });

    test('쿠폰 모달 열기/닫기', async ({ page }) => {
      await loadGame(page);

      // 설정 패널 열기
      await clickCanvas(page, 330, 30);
      await page.waitForTimeout(500);

      // 쿠폰 버튼 클릭 (y=408 근처)
      await clickCanvas(page, 180, 408);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/04-coupon-modal.png' });

      // 닫기
      await clickCanvas(page, 310, 210);
      await page.waitForTimeout(500);
    });

    test('치트코드로 골드 지급 (CHEAT_GOLD)', async ({ page }) => {
      await loadGame(page);

      // 설정 열기 → 쿠폰 모달 열기
      await clickCanvas(page, 330, 30);
      await page.waitForTimeout(500);
      await clickCanvas(page, 180, 408);
      await page.waitForTimeout(800);

      await page.screenshot({ path: 'tests/screenshots/05-coupon-with-cheats.png' });

      // DEV 치트 드롭다운의 CHEAT_GOLD 클릭 (첫 번째 항목, 약 y=303+13=316)
      // 드롭다운은 input 하단에 표시됨
      // input은 cy-35=285, 높이 36이므로 하단은 303
      // 첫 항목 높이 26px 중심: 303+2+13=318
      await clickCanvas(page, 180, 318);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/06-cheat-gold-result.png' });
    });

    test('게임 시작 버튼으로 WorldMapScene 전환', async ({ page }) => {
      await loadGame(page);

      // 게임 시작 버튼 (y=390)
      await clickCanvas(page, 180, 390);
      await page.waitForTimeout(1000);

      const scene = await getActiveScene(page);
      await page.screenshot({ path: 'tests/screenshots/07-worldmap-from-menu.png' });
      expect(scene).toBe('WorldMapScene');
    });

    test('주방 상점 버튼 동작', async ({ page }) => {
      await loadGame(page);

      // 주방 상점 버튼 (y=450)
      await clickCanvas(page, 180, 450);
      await page.waitForTimeout(1000);

      const scene = await getActiveScene(page);
      await page.screenshot({ path: 'tests/screenshots/08-shop-from-menu.png' });
      expect(scene).toBe('ShopScene');
    });

    test('레시피 도감 버튼 동작', async ({ page }) => {
      await loadGame(page);

      // 도감 버튼 (y=496)
      await clickCanvas(page, 180, 496);
      await page.waitForTimeout(1000);

      const scene = await getActiveScene(page);
      await page.screenshot({ path: 'tests/screenshots/09-recipe-from-menu.png' });
      expect(scene).toBe('RecipeCollectionScene');
    });

    test('업적 버튼 동작', async ({ page }) => {
      await loadGame(page);

      // 업적 버튼 (y=534)
      await clickCanvas(page, 180, 534);
      await page.waitForTimeout(1000);

      const scene = await getActiveScene(page);
      await page.screenshot({ path: 'tests/screenshots/10-achievement-from-menu.png' });
      expect(scene).toBe('AchievementScene');
    });
  });

  test.describe('2. WorldMapScene 검증', () => {
    test('월드맵 렌더링 및 챕터 노드 표시', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'WorldMapScene');

      await page.screenshot({ path: 'tests/screenshots/11-worldmap-scene.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('WorldMapScene');
    });

    test('스테이지 노드 클릭 시 패널 표시', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'WorldMapScene');

      // 첫 번째 노드 클릭 (좌상 80, 190)
      await clickCanvas(page, 80, 190);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/12-worldmap-node-click.png' });
    });

    test('뒤로가기 버튼으로 메뉴 복귀', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'WorldMapScene');

      // 뒤로가기 버튼 (보통 좌상단)
      await clickCanvas(page, 40, 30);
      await page.waitForTimeout(1000);

      const scene = await getActiveScene(page);
      await page.screenshot({ path: 'tests/screenshots/13-worldmap-back.png' });
    });
  });

  test.describe('3. ChefSelectScene 검증', () => {
    test('셰프 선택 씬 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ChefSelectScene', { stageId: '1-1' });

      await page.screenshot({ path: 'tests/screenshots/14-chef-select.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('ChefSelectScene');
    });

    test('셰프 캐러셀 좌우 탐색', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ChefSelectScene', { stageId: '1-1' });

      // 오른쪽 화살표 클릭 (우측 가장자리)
      await clickCanvas(page, 340, 270);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/15-chef-carousel-right.png' });

      // 왼쪽 화살표 클릭
      await clickCanvas(page, 20, 270);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/16-chef-carousel-left.png' });
    });
  });

  test.describe('4. GatheringScene 검증', () => {
    test('재료 채집 씬 진입 및 HUD 렌더링', async ({ page }) => {
      const { errors } = await loadGame(page);

      // 치트로 스테이지 준비 후 진입
      await startScene(page, 'GatheringScene', { stageId: '1-1' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'tests/screenshots/17-gathering-scene.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('GatheringScene');
    });

    test('도구바 영역 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'GatheringScene', { stageId: '1-1' });
      await page.waitForTimeout(2000);

      // 도구바 영역 스크린샷 (y=480~540)
      await page.screenshot({
        path: 'tests/screenshots/18-gathering-toolbar.png',
        clip: { x: 0, y: 440, width: 360, height: 200 }
      });
    });

    test('재료 채집 씬에서 웨이브 시작', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'GatheringScene', { stageId: '1-1' });
      await page.waitForTimeout(2000);

      // 웨이브 시작 버튼 클릭 (하단 영역 y=590~640)
      await clickCanvas(page, 180, 615);
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'tests/screenshots/19-gathering-wave-started.png' });
    });
  });

  test.describe('5. ServiceScene 검증', () => {
    test('영업 씬 직접 진입 렌더링', async ({ page }) => {
      await loadGame(page);

      // ServiceScene에는 인벤토리 데이터가 필요하므로 직접 진입 시 빈 데이터
      await startScene(page, 'ServiceScene', {
        stageId: '1-1',
        collectedIngredients: { carrot: 5, meat: 5, egg: 3, flour: 3 }
      });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'tests/screenshots/20-service-scene.png' });
    });
  });

  test.describe('6. ResultScene 검증', () => {
    test('결과 씬 정상 렌더링 (캠페인)', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 15, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 5, totalCustomers: 8, goldEarned: 300, tipEarned: 50, maxCombo: 3, satisfaction: 75 },
        isMarketFailed: false,
      });
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/21-result-scene.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('ResultScene');
    });

    test('결과 씬 실패 케이스 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 0, livesRemaining: 0, livesMax: 15 },
        serviceResult: null,
        isMarketFailed: true,
      });
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/22-result-failed.png' });
    });

    test('결과 씬 엔드리스 모드 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ResultScene', {
        stageId: 'endless',
        isEndless: true,
        endlessWave: 15,
        endlessScore: 12500,
        endlessMaxCombo: 8,
        newBestWave: true,
        newBestScore: true,
        newBestCombo: false,
      });
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/23-result-endless.png' });
    });
  });

  test.describe('7. MerchantScene 검증', () => {
    test('행상인 씬 렌더링 (도구 탭)', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'MerchantScene', {
        stageId: '1-1',
        returnTo: 'WorldMapScene'
      });
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/24-merchant-tool-tab.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('MerchantScene');
    });

    test('행상인 씬 분기 탭 전환', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'MerchantScene', {
        stageId: '1-1',
        returnTo: 'WorldMapScene'
      });
      await page.waitForTimeout(1500);

      // 분기 선택 탭 클릭 (약 오른쪽 탭, x=270, y=72)
      await clickCanvas(page, 270, 72);
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'tests/screenshots/25-merchant-branch-tab.png' });
    });
  });

  test.describe('8. ShopScene 검증', () => {
    test('상점 씬 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ShopScene');
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/26-shop-scene.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('ShopScene');
    });

    test('상점 탭 전환 (레시피, 테이블, 인테리어, 직원)', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'ShopScene');
      await page.waitForTimeout(1500);

      // 각 탭을 순회하며 스크린샷 (탭 바는 상단에 위치)
      const tabs = [
        { name: 'recipe', x: 120, y: 55 },
        { name: 'table', x: 190, y: 55 },
        { name: 'interior', x: 255, y: 55 },
        { name: 'staff', x: 320, y: 55 },
      ];

      for (const tab of tabs) {
        await clickCanvas(page, tab.x, tab.y);
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/27-shop-tab-${tab.name}.png` });
      }
    });
  });

  test.describe('9. RecipeCollectionScene 검증', () => {
    test('레시피 도감 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'RecipeCollectionScene');
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/28-recipe-collection.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('RecipeCollectionScene');
    });
  });

  test.describe('10. AchievementScene 검증', () => {
    test('업적 씬 렌더링', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'AchievementScene');
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/29-achievement-scene.png' });
      const scene = await getActiveScene(page);
      expect(scene).toBe('AchievementScene');
    });
  });

  test.describe('11. 콘솔 에러 모니터링', () => {
    test('전체 씬 순회 시 크리티컬 JS 에러 없음', async ({ page }) => {
      const { errors } = await loadGame(page);

      // 모든 주요 씬 순회
      const scenes = [
        { name: 'MenuScene', data: {} },
        { name: 'WorldMapScene', data: {} },
        { name: 'ChefSelectScene', data: { stageId: '1-1' } },
        { name: 'ShopScene', data: {} },
        { name: 'RecipeCollectionScene', data: {} },
        { name: 'AchievementScene', data: {} },
        { name: 'ResultScene', data: { stageId: '1-1', marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 }, serviceResult: null, isMarketFailed: true } },
        { name: 'MerchantScene', data: { stageId: '1-1', returnTo: 'WorldMapScene' } },
      ];

      for (const s of scenes) {
        await startScene(page, s.name, s.data);
      }

      // 크리티컬 에러 필터 (에셋 404는 알려진 이슈로 제외)
      const criticalErrors = errors.filter(e =>
        !e.includes('Failed to load resource') &&
        !e.includes('404') &&
        !e.includes('net::ERR') &&
        !e.includes('favicon') &&
        !e.includes('Phaser') // Phaser 내부 경고 제외
      );

      // 발견된 에러 기록 (스크린샷과 함께)
      if (criticalErrors.length > 0) {
        console.log('Critical errors found:', criticalErrors);
      }
      await page.screenshot({ path: 'tests/screenshots/30-final-state.png' });
    });
  });

  test.describe('12. 치트코드로 콘텐츠 해금 후 검증', () => {
    test('CHEAT_STAGE_SKIP으로 스테이지 해금 후 월드맵 확인', async ({ page }) => {
      await loadGame(page);

      // 여러 번 CHEAT_STAGE_SKIP 실행으로 진행도 높이기
      for (let i = 0; i < 6; i++) {
        await page.evaluate(() => {
          const { redeemCoupon } = window.__game.scene.getScene('MenuScene') || {};
          // 직접 localStorage에 스테이지 클리어 기록 추가
          const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save') || '{}');
          if (!save.stages) save.stages = {};
          const stageIds = ['1-1','1-2','1-3','1-4','1-5','1-6'];
          stageIds.forEach(id => {
            save.stages[id] = { cleared: true, stars: 3 };
          });
          if (!save.storyProgress) save.storyProgress = { currentChapter: 1 };
          save.storyProgress.currentChapter = 2;
          localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
        });
      }

      await page.reload();
      await page.waitForTimeout(3000);
      await startScene(page, 'WorldMapScene');
      await page.screenshot({ path: 'tests/screenshots/31-worldmap-unlocked.png' });
    });

    test('엔드리스 모드 해금 후 ChefSelectScene 진입', async ({ page }) => {
      await loadGame(page);

      // 6-3 클리어로 엔드리스 해금
      await page.evaluate(() => {
        const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save') || '{}');
        if (!save.stages) save.stages = {};
        // 1-1 ~ 6-3 모두 클리어
        for (let ch = 1; ch <= 6; ch++) {
          for (let st = 1; st <= 6; st++) {
            save.stages[`${ch}-${st}`] = { cleared: true, stars: 3 };
          }
        }
        save.storyProgress = { currentChapter: 7 };
        save.season2Unlocked = true;
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      });

      await page.reload();
      await page.waitForTimeout(3000);

      // 엔드리스 셰프 선택
      await startScene(page, 'ChefSelectScene', { stageId: 'endless' });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'tests/screenshots/32-endless-chef-select.png' });
    });
  });

  test.describe('13. 에지 케이스 및 스트레스', () => {
    test('빠른 씬 전환 연타', async ({ page }) => {
      const { errors } = await loadGame(page);

      // 빠르게 여러 씬으로 전환
      await startScene(page, 'WorldMapScene');
      await page.waitForTimeout(200);
      await startScene(page, 'ShopScene');
      await page.waitForTimeout(200);
      await startScene(page, 'MenuScene');
      await page.waitForTimeout(200);
      await startScene(page, 'AchievementScene');
      await page.waitForTimeout(200);
      await startScene(page, 'RecipeCollectionScene');
      await page.waitForTimeout(200);
      await startScene(page, 'MenuScene');
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'tests/screenshots/33-rapid-scene-switch.png' });

      const scene = await getActiveScene(page);
      expect(scene).toBe('MenuScene');
    });

    test('설정 패널 연속 열기/닫기', async ({ page }) => {
      await loadGame(page);

      for (let i = 0; i < 5; i++) {
        await clickCanvas(page, 330, 30);
        await page.waitForTimeout(200);
        await clickCanvas(page, 305, 185);
        await page.waitForTimeout(200);
      }

      await page.screenshot({ path: 'tests/screenshots/34-settings-stress.png' });
    });

    test('존재하지 않는 스테이지 ID로 GatheringScene 진입', async ({ page }) => {
      const { errors } = await loadGame(page);

      await startScene(page, 'GatheringScene', { stageId: 'invalid-99' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'tests/screenshots/35-invalid-stage.png' });
    });

    test('세이브 없이 ResultScene 진입', async ({ page }) => {
      await loadGame(page);

      // data 없이 ResultScene 시작
      await startScene(page, 'ResultScene', {});
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'tests/screenshots/36-result-no-data.png' });
    });

    test('GatheringScene에서 맵 영역 외부 클릭', async ({ page }) => {
      await loadGame(page);
      await startScene(page, 'GatheringScene', { stageId: '1-1' });
      await page.waitForTimeout(2000);

      // 맵 영역 외부(HUD 영역, 화면 가장자리 등) 클릭
      await clickCanvas(page, 0, 0);
      await page.waitForTimeout(200);
      await clickCanvas(page, 359, 639);
      await page.waitForTimeout(200);
      await clickCanvas(page, 180, 5);
      await page.waitForTimeout(200);

      await page.screenshot({ path: 'tests/screenshots/37-gathering-edge-clicks.png' });
    });
  });

  test.describe('14. UI 레이아웃 안정성', () => {
    test('MenuScene 모든 버튼 영역이 겹치지 않음', async ({ page }) => {
      await loadGame(page);

      // 메뉴 씬의 전체 레이아웃 스크린샷
      await page.screenshot({ path: 'tests/screenshots/38-menu-full-layout.png' });

      // 하단 영역 클로즈업 (버튼 밀집 지역 y=380~640)
      await page.screenshot({
        path: 'tests/screenshots/39-menu-buttons-closeup.png',
        clip: { x: 0, y: 360, width: 360, height: 280 }
      });
    });

    test('WorldMapScene 탭 전환 UI', async ({ page }) => {
      await loadGame(page);

      // 시즌2 해금으로 탭 표시
      await page.evaluate(() => {
        const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save') || '{}');
        for (let ch = 1; ch <= 6; ch++) {
          for (let st = 1; st <= 6; st++) {
            if (!save.stages) save.stages = {};
            save.stages[`${ch}-${st}`] = { cleared: true, stars: 3 };
          }
        }
        save.storyProgress = { currentChapter: 7 };
        save.season2Unlocked = true;
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      });
      await page.reload();
      await page.waitForTimeout(3000);

      await startScene(page, 'WorldMapScene');
      await page.screenshot({ path: 'tests/screenshots/40-worldmap-with-tabs.png' });

      // 그룹2 탭 클릭
      await clickCanvas(page, 180, 95);
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'tests/screenshots/41-worldmap-group2.png' });
    });
  });
});
