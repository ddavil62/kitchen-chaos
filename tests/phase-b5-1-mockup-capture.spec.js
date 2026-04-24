/**
 * @fileoverview Phase B-5-1 시안 점검용 캡처. 영업씬 + 데모 키 walk 재생 캡처.
 */
import { test } from '@playwright/test';
import path from 'node:path';

const SHOTS = 'tests/screenshots';

async function waitForTavernScene(page) {
  await page.goto('http://localhost:5173/?scene=tavern');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
  await page.waitForTimeout(1500);
}

test('B-5-1 mockup: tavern overview', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await waitForTavernScene(page);
  await page.screenshot({ path: path.join(SHOTS, 'phase-b5-1-mockup-overview.png'), fullPage: false });
});

test('B-5-1 mockup: walk_r demo (W key + C key)', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await waitForTavernScene(page);
  // 손님 walk_r (W)
  await page.keyboard.press('w');
  await page.waitForTimeout(300);
  // 셰프 walk_r (C)
  await page.keyboard.press('c');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'phase-b5-1-mockup-walk-r.png'), fullPage: false });
});

test('B-5-1 mockup: walk_l demo (A key + V key)', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await waitForTavernScene(page);
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  await page.keyboard.press('v');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'phase-b5-1-mockup-walk-l.png'), fullPage: false });
});
