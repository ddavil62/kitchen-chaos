/**
 * @fileoverview Phase 67 AD 모드3 스크린샷 캡처 스크립트
 * NeoDunggeunmoPro 로컬 번들 폰트 전환 후 한글 렌더링 검수용
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

    // 폰트 로드 확인
    const fontLoaded = await page.evaluate(() => {
      return document.fonts.ready.then(() => {
        return document.fonts.check('16px "NeoDunggeunmoPro"');
      });
    });
    console.log(`폰트 로드 상태 (document.fonts.check): ${fontLoaded}`);
    results.fontLoaded = fontLoaded;

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-menu.png` });
    console.log('[1/7] MenuScene 스크린샷 저장');

    // ── 2. WorldMapScene ──
    console.log('[2/7] WorldMapScene 전환...');
    await page.evaluate(() => {
      try { window.__game.scene.start('WorldMapScene', { fromMenu: true }); } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-worldmap.png` });
    console.log('[2/7] WorldMapScene 스크린샷 저장');

    // ── 3. ShopScene ──
    console.log('[3/7] ShopScene 전환...');
    await page.evaluate(() => {
      try { window.__game.scene.start('ShopScene', {}); } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-shop.png` });
    console.log('[3/7] ShopScene 스크린샷 저장');

    // ── 4. MerchantScene ──
    console.log('[4/7] MerchantScene 전환...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('MerchantScene', {
          stageKey: 'stage_1_1',
          chefId: 'chef_mimi',
        });
      } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-merchant.png` });
    console.log('[4/7] MerchantScene 스크린샷 저장');

    // ── 5. ResultScene ──
    console.log('[5/7] ResultScene 전환...');
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
      } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-result.png` });
    console.log('[5/7] ResultScene 스크린샷 저장');

    // ── 6. MenuScene + 설정 패널 ──
    console.log('[6/7] MenuScene + 설정 패널...');
    await page.evaluate(() => {
      try { window.__game.scene.start('MenuScene', {}); } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(2000);
    // 설정 버튼 클릭 (좌표 기반: 이전 플레이테스트에서 확인된 위치 참조)
    await page.evaluate(() => {
      try {
        const s = window.__game.scene.getScene('MenuScene');
        if (s && s._onSettingsButtonClick) s._onSettingsButtonClick();
        else if (s && s.settingsPanel) s.settingsPanel.setVisible(true);
        else {
          // 설정 버튼을 텍스트로 찾아 클릭
          const objs = s.children && s.children.list || [];
          objs.forEach(o => { if (o.text && o.text.includes('설정')) o.emit('pointerdown'); });
        }
      } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-settings.png` });
    console.log('[6/7] 설정 패널 스크린샷 저장');

    // ── 7. 쿠폰 패널 ──
    console.log('[7/7] 쿠폰 패널...');
    await page.evaluate(() => {
      try {
        const s = window.__game.scene.getScene('MenuScene');
        if (s && s._showCouponPanel) s._showCouponPanel();
        else if (s && s._openCouponModal) s._openCouponModal();
        else {
          const objs = s.children && s.children.list || [];
          objs.forEach(o => { if (o.text && (o.text.includes('쿠폰') || o.text.includes('COUPON'))) o.emit('pointerdown'); });
        }
      } catch(e) { console.warn(e); }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-coupon.png` });
    console.log('[7/7] 쿠폰 패널 스크린샷 저장');

    results.allCaptured = true;
    console.log('=== 모든 스크린샷 캡처 완료 ===');

  } catch (err) {
    console.error('오류:', err.message);
    results.error = err.message;
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-error.png` }).catch(() => {});
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
