import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('counter zoom', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__game?.scene?.isActive('MenuScene'), { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const game = window.__game;
    game.scene.getScenes(true).forEach(s => game.scene.stop(s.scene.key));
    game.scene.start('ServiceScene', {
      stageId: '1-1', inventory: {carrot:10,meat:8,flour:6,squid:4,pepper:3},
      gold:500, lives:10, marketResult:{totalIngredients:31,livesRemaining:10,livesMax:15}, isEndless:false
    });
  });
  await page.waitForTimeout(3000);
  // cooking zone 확대 (y=275~350)
  await page.screenshot({ path: path.join(__dirname, 'screenshots/counter_zoom.png'), clip: {x:0, y:275, width:360, height:75} });
});
