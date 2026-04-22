/**
 * @fileoverview Phase 67 AD 모드3 — ResultScene 전용 캡처
 */
const { chromium } = require('@playwright/test');
const path = require('path');

const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 360, height: 640 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);

    // ResultScene — marketResult + serviceResult 포함
    console.log('[RESULT] ResultScene 전환...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('ResultScene', {
          stageId: '1-1',
          marketResult: { totalIngredients: 28, livesRemaining: 12, livesMax: 15 },
          serviceResult: {
            earnedGold: 1500,
            servedCustomers: 20,
            averageSatisfaction: 85,
            totalOrders: 22,
            menuStats: {}
          },
          isMarketFailed: false,
          isEndless: false
        });
      } catch(e) { console.warn('ResultScene err:', e.message); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-result3.png` });
    console.log('[RESULT] 저장');

    // 현재 씬 텍스트 오브젝트 확인
    const texts = await page.evaluate(() => {
      const s = window.__game.scene.getScene('ResultScene');
      if (!s) return ['ResultScene 없음'];
      const found = [];
      const walk = (objs) => {
        if (!objs) return;
        for (const o of objs) {
          if (o.text && o.visible) found.push(o.text);
          if (o.list) walk(o.list);
        }
      };
      walk(s.children.list);
      return found;
    });
    console.log('ResultScene 텍스트:', texts.slice(0, 20));

    console.log('=== 완료 ===');
  } catch(err) {
    console.error('오류:', err.message);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-err4.png` }).catch(() => {});
  }
  await browser.close();
})();
