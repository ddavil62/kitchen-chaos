import { test, expect } from '@playwright/test';

test('debug: check game loads', async ({ page }) => {
  const logs = [];
  page.on('console', (msg) => logs.push(msg.text()));
  page.on('pageerror', (err) => logs.push('ERROR: ' + err.message));

  await page.goto('/');

  // Wait for game to exist
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });

  // Check what scenes exist at various timepoints
  for (let sec = 1; sec <= 15; sec++) {
    await page.waitForTimeout(1000);
    const info = await page.evaluate((t) => {
      const game = window.__game;
      const active = game.scene.getScenes(true).map(s => s.scene.key);
      const boot = game.scene.getScene('BootScene');
      const bootStatus = boot ? boot.scene.settings.status : 'N/A';
      const menu = game.scene.getScene('MenuScene');
      const menuStatus = menu ? menu.scene.settings.status : 'N/A';
      return { active, bootStatus, menuStatus, time: t };
    }, sec);
    console.log(`t=${info.time}s: active=${JSON.stringify(info.active)} boot=${info.bootStatus} menu=${info.menuStatus}`);

    if (info.active.includes('MenuScene')) {
      console.log('MenuScene is active!');
      break;
    }
  }

  // Print browser console logs
  for (const log of logs.slice(0, 20)) {
    console.log('BROWSER:', log);
  }

  expect(true).toBe(true);
});
