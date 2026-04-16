import { test } from '@playwright/test';

test('Phase 35 AD3 부트씬 스크린샷', async ({ page }) => {
  await page.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: 'tests/screenshots/phase35-ad3-bootscene.png',
    fullPage: false,
  });
  console.log('스크린샷 저장: tests/screenshots/phase35-ad3-bootscene.png');
});
