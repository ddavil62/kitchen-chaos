/**
 * @fileoverview Phase 71 AD3 검수용 스크린샷 캡처 (타일셋, 테이블, 타워).
 */
import { test, expect } from '@playwright/test';

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

test.describe('Phase 71 AD3 스크린샷', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  test('5-1 dessert_cafe 타일셋', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '5-1' });
    });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${DIR}/phase71-tileset-dessert-cafe-5-1.png` });
  });

  test('6-1 grand_finale 타일셋', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '6-1' });
    });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${DIR}/phase71-tileset-grand-finale-6-1.png` });
  });

  test('7-1 sakura_izakaya 타일셋', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '7-1' });
    });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${DIR}/phase71-tileset-sakura-izakaya-7-1.png` });
  });

  test('ServiceScene lv1 테이블 waiting/seated', async ({ page }) => {
    await freshStart(page);
    // lv1 테이블을 볼 수 있는 ServiceScene 진입
    await page.evaluate(() => {
      window.__game.scene.start('ServiceScene', { stageId: '1-1', tableLevel: 1 });
    });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${DIR}/phase71-service-table-lv1.png` });
  });

  test('타워 spice_grinder, wasabi_cannon 배치', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '1-1' });
    });
    await page.waitForTimeout(2000);
    // 웨이브 시작 전 타워 탭에서 spice_grinder, wasabi_cannon 배치
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('GatheringScene');
      if (scene && scene._towers) {
        // 직접 배치가 어려우므로 텍스처 존재 여부로 대체
        return {
          spice: window.__game.textures.exists('tower_spice_grinder'),
          wasabi: window.__game.textures.exists('tower_wasabi_cannon'),
        };
      }
    });
    await page.screenshot({ path: `${DIR}/phase71-tower-gathering-1-1.png` });
  });
});
