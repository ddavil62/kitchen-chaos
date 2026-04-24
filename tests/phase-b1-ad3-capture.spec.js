import { test } from '@playwright/test';

async function waitForTavernScene(page) {
  await page.goto('http://localhost:5173/?scene=tavern');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
}

test('B1 AD3 - 타임스탬프 전체 레이아웃', async ({ page }) => {
  await waitForTavernScene(page);
  await page.waitForTimeout(2000);
  const ts = 1745394000000;
  await page.screenshot({
    path: `tests/screenshots/phase-b1-real-assets-${ts}.png`,
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });
  await page.screenshot({
    path: `tests/screenshots/phase-b1-counter-closeup.png`,
    clip: { x: 70, y: 80, width: 230, height: 130 },
  });
  await page.screenshot({
    path: `tests/screenshots/phase-b1-lower-quads.png`,
    clip: { x: 120, y: 240, width: 240, height: 140 },
  });
  await page.screenshot({
    path: `tests/screenshots/phase-b1-entrance.png`,
    clip: { x: 20, y: 460, width: 120, height: 80 },
  });
});
