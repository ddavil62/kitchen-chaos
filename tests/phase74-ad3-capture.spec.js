/**
 * @fileoverview Phase 74 AD3 캡처 스펙 — 5개 UI 변경 포인트 스크린샷.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

async function freshStart(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

test.describe('Phase 74 AD3 캡처', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // ── T1: EndlessScene 튜토리얼 페이지네이터 step0 ──
  test('T1-step0: EndlessScene 튜토리얼 (●○○)', async ({ page }) => {
    await freshStart(page);
    // endless 튜토리얼 미완료 상태 유지 (freshStart로 localStorage 클리어됨)
    await page.evaluate(() => {
      window.__game.scene.start('EndlessScene', { stageId: '1-1' });
    });
    // 2초 딜레이 후 튜토리얼 start() 호출됨 → 3.5초 대기
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${DIR}/phase74-t1-step0-tutorial.png` });
  });

  // ── T1: EndlessScene 튜토리얼 페이지네이터 step1 ──
  test('T1-step1: EndlessScene 튜토리얼 (○●○)', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('EndlessScene', { stageId: '1-1' });
    });
    // 5.5초 대기 — 5초 딜레이 advance() 후
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${DIR}/phase74-t1-step1-tutorial.png` });
  });

  // ── T2: ResultScene 장보기 실패 — mimi_chef 대사 ──
  test('T2: ResultScene 장보기 실패 mimi_chef', async ({ page }) => {
    await freshStart(page);
    // selectedChef 설정
    await page.evaluate(() => {
      const save = { selectedChef: 'mimi_chef' };
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
    });
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        isMarketFailed: true,
        marketResult: { totalIngredients: 0, livesRemaining: 3, livesMax: 15 },
      });
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${DIR}/phase74-t2-result-failed.png` });
  });

  // ── T3: MerchantScene 도구 탭 배지 ──
  test('T3: MerchantScene 도구 배지', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('MerchantScene', {
        stageId: '1-1',
        isMarketFailed: false,
        isEndless: false,
      });
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${DIR}/phase74-t3-merchant-badge.png` });
  });

  // ── T4: AchievementScene 수령 대기 카드 glow ──
  test('T4: AchievementScene 수령 대기 glow', async ({ page }) => {
    await freshStart(page);
    // stage_cleared 업적: unlocked=true, claimed=false 상태 만들기
    await page.evaluate(() => {
      const save = {
        stages: { '1-1': { stars: 3 } },
        totalStagesCleared: 1,
        achievements: {
          stage_cleared: { current: 1, unlocked: true, claimed: false },
        },
      };
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
    });
    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${DIR}/phase74-t4-achievement-glow.png` });
  });

  // ── T5-A: ShopScene 인테리어 탭 ──
  test('T5-A: ShopScene 인테리어 탭', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${DIR}/phase74-t5a-shop-interior.png` });
  });

  // ── T5-B: ShopScene 직원 탭 ──
  test('T5-B: ShopScene 직원 탭', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);
    // 직원 탭 버튼 클릭 시도
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (scene && scene._onTabSelect) {
        scene._onTabSelect('staff');
      }
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${DIR}/phase74-t5b-shop-staff.png` });
  });
});
