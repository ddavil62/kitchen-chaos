import { test, expect } from '@playwright/test';

test('debug: wait for MenuScene to become active', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });

  // Wait for MenuScene to become running (status=5)
  console.log('Waiting for MenuScene...');
  const start = Date.now();

  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const menu = game.scene.getScene('MenuScene');
    // Phaser status: 0=PENDING, 1=INIT, 2=START, 3=LOADING, 4=CREATING, 5=RUNNING
    return menu && menu.sys.settings.status >= 5;
  }, { timeout: 120000 });

  console.log(`MenuScene active in ${Date.now() - start}ms`);

  const info = await page.evaluate(() => {
    const game = window.__game;
    const menu = game.scene.getScene('MenuScene');
    return {
      status: menu.sys.settings.status,
      active: menu.sys.settings.active,
    };
  });

  console.log('MenuScene:', JSON.stringify(info));
  await page.screenshot({ path: 'tests/screenshots/debug-menu-active.png' });
});
