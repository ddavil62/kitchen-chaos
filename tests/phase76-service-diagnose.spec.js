/**
 * @fileoverview Phase 76 영업씬 손님-테이블 합성 진단 캡처.
 * 신규 5종 + 기존 5종이 같이 보이도록 강제로 손님을 스폰한다.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

async function bootAndWaitMenu(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

test.describe('Phase 76 영업씬 진단', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    test.setTimeout(60000);
  });

  test('영업씬 진입 + 손님 스폰 후 캡처', async ({ page }) => {
    await bootAndWaitMenu(page);
    await page.evaluate(() => {
      window.__game.scene.start('ServiceScene', {
        stageId: '1-1',
        tableUpgrades: [1, 1, 1, 1],
        ingredients: { pasta: 30, tomato: 30, basil: 30, cheese: 30, beef: 30, lettuce: 30 },
        collectedIngredients: { pasta: 30, tomato: 30, basil: 30, cheese: 30, beef: 30, lettuce: 30 },
      });
    });
    await page.waitForTimeout(8000); // 손님이 스폰될 때까지 대기
    await page.screenshot({ path: `${DIR}/phase76-service-diagnose-default.png` });
  });

  test('영업씬 + 신규 손님 강제 스폰 (critic/regular/business)', async ({ page }) => {
    await bootAndWaitMenu(page);
    await page.evaluate(() => {
      window.__game.scene.start('ServiceScene', {
        stageId: '1-1',
        tableUpgrades: [2, 2, 2, 2],
        ingredients: { pasta: 30, tomato: 30, basil: 30, cheese: 30, beef: 30, lettuce: 30 },
        collectedIngredients: { pasta: 30, tomato: 30, basil: 30, cheese: 30, beef: 30, lettuce: 30 },
      });
    });
    await page.waitForTimeout(2000);
    // 신규 5종을 강제로 스폰
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      if (!scene || !scene.customerManager) return;
      // 4개 테이블에 critic/regular/student/business를 강제로 배치 시도
      const profiles = ['critic', 'regular', 'student', 'business'];
      profiles.forEach((profileId, idx) => {
        const customer = {
          profileId,
          tableIndex: idx,
          recipe: { id: 'pasta', nameKo: '파스타', icon: '🍝' },
          dish: 'pasta',
          patience: 30000,
          maxPatience: 30000,
        };
        // 단순 sprite render 함수 호출 시도
        if (scene._spawnCustomerToTable) {
          scene._spawnCustomerToTable(customer, idx);
        }
      });
    });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${DIR}/phase76-service-diagnose-newprofiles.png` });
  });

  test('영업씬 풀 스크롤 진입 + 자연 진행 30초', async ({ page }) => {
    await bootAndWaitMenu(page);
    await page.evaluate(() => {
      window.__game.scene.start('ServiceScene', {
        stageId: '1-3',
        tableUpgrades: [3, 3, 3, 3, 3, 3],
        ingredients: { pasta: 50, tomato: 50, basil: 50, cheese: 50, beef: 50, lettuce: 50 },
        collectedIngredients: { pasta: 50, tomato: 50, basil: 50, cheese: 50, beef: 50, lettuce: 50 },
      });
    });
    await page.waitForTimeout(15000);
    await page.screenshot({ path: `${DIR}/phase76-service-diagnose-natural.png`, fullPage: false });
  });
});
