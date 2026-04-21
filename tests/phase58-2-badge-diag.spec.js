import { test, expect } from '@playwright/test';

test('badge load diag v2', async ({ page }) => {
  const requests = [];
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/assets/') || url.includes('/sprites/')) {
      requests.push(url);
    }
  });

  await page.goto('http://localhost:5173');
  await page.waitForFunction(() => window.__game && window.__game.scene && window.__game.scene.scenes.length > 0, { timeout: 15000 });
  await page.waitForTimeout(5000);

  const assetsReqs = requests.filter(u => u.includes('/assets/'));
  console.log('Total requests:', requests.length);
  console.log('Assets requests:', assetsReqs.length);
  console.log('Sample assets:', assetsReqs.slice(0, 20).join('\n'));
  console.log('Badge requests:', requests.filter(u => u.includes('badge')).join('\n'));
  console.log('Icon requests:', requests.filter(u => u.includes('icon_')).join('\n'));
  expect(true).toBe(true);
});
