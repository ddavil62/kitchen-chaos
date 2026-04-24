/**
 * @fileoverview Phase 67 AD 모드3 스크린샷 캡처 (CJS)
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

  const results = {};

  try {
    // ── 1. MenuScene (초기 화면) ──
    console.log('[1/7] MenuScene 로드...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);

    const fontLoaded = await page.evaluate(() => {
      return document.fonts.ready.then(() => {
        return document.fonts.check('16px "NeoDunggeunmoPro"');
      });
    });
    console.log(`폰트 로드 상태 (document.fonts.check): ${fontLoaded}`);
    results.fontLoaded = fontLoaded;

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-menu.png` });
    console.log('[1/7] MenuScene 저장');

    // ── 2. WorldMapScene ──
    console.log('[2/7] WorldMapScene...');
    await page.evaluate(() => {
      try { window.__game.scene.start('WorldMapScene', { fromMenu: true }); } catch(e) { console.warn('WMS err:', e.message); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-worldmap.png` });
    console.log('[2/7] WorldMapScene 저장');

    // ── 3. ShopScene ──
    console.log('[3/7] ShopScene...');
    await page.evaluate(() => {
      try { window.__game.scene.start('ShopScene', {}); } catch(e) { console.warn('ShopScene err:', e.message); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-shop.png` });
    console.log('[3/7] ShopScene 저장');

    // ── 4. MerchantScene ──
    console.log('[4/7] MerchantScene...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('MerchantScene', {
          stageKey: 'stage_1_1',
          chefId: 'chef_mimi',
        });
      } catch(e) { console.warn('MerchantScene err:', e.message); }
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-merchant.png` });
    console.log('[4/7] MerchantScene 저장');

    // ── 5. ResultScene ──
    console.log('[5/7] ResultScene...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('ResultScene', {
          stageKey: 'stage_1_1',
          chefId: 'chef_mimi',
          score: 1500,
          grade: 'S',
          coins: 300,
          isNewRecord: false
        });
      } catch(e) { console.warn('ResultScene err:', e.message); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-result.png` });
    console.log('[5/7] ResultScene 저장');

    // ── 6. 설정 패널 ──
    console.log('[6/7] MenuScene + 설정 패널...');
    await page.evaluate(() => {
      try { window.__game.scene.start('MenuScene', {}); } catch(e) { console.warn(e.message); }
    });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      try {
        const s = window.__game.scene.getScene('MenuScene');
        if (!s) return;
        // 설정 버튼 오브젝트 탐색
        const children = s.children && s.children.list ? s.children.list : [];
        for (const o of children) {
          if (o.text && (o.text.includes('설정') || o.text.includes('⚙') || o.text.includes('SETTING'))) {
            o.emit('pointerdown');
            o.emit('pointerup');
            break;
          }
        }
      } catch(e) { console.warn(e.message); }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-settings.png` });
    console.log('[6/7] 설정 패널 저장');

    // ── 7. 쿠폰 패널 ──
    console.log('[7/7] 쿠폰 패널...');
    await page.evaluate(() => {
      try {
        const s = window.__game.scene.getScene('MenuScene');
        if (!s) return;
        const children = s.children && s.children.list ? s.children.list : [];
        for (const o of children) {
          if (o.text && (o.text.includes('쿠폰') || o.text.includes('COUPON'))) {
            o.emit('pointerdown');
            o.emit('pointerup');
            break;
          }
        }
      } catch(e) { console.warn(e.message); }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-coupon.png` });
    console.log('[7/7] 쿠폰 패널 저장');

    results.allCaptured = true;

  } catch (err) {
    console.error('오류:', err.message);
    results.error = err.message;
    try { await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-error.png` }); } catch(_){}
  }

  await browser.close();
  console.log('=== 완료 ===');
  console.log(JSON.stringify(results, null, 2));
})();
