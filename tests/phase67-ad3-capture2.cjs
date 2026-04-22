/**
 * @fileoverview Phase 67 AD 모드3 — 추가 씬 스크린샷 (MerchantScene, ResultScene, 설정/쿠폰 패널)
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

    // ── MerchantScene (올바른 파라미터로) ──
    console.log('[MERCHANT] MerchantScene 전환...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('MerchantScene', {
          stageId: '1-1',
          tools: [],
          gold: 999,
          serviceResult: { earnedGold: 500 }
        });
      } catch(e) { console.warn('MerchantScene err:', e.message); }
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-merchant2.png` });
    console.log('[MERCHANT] 저장');

    // ── ResultScene (올바른 파라미터로) ──
    console.log('[RESULT] ResultScene 전환...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('ResultScene', {
          stageId: '1-1',
          marketResult: { totalIngredients: 30, livesRemaining: 10, livesMax: 15 },
          serviceResult: { earnedGold: 1500, servedCustomers: 20 },
          isMarketFailed: false
        });
      } catch(e) { console.warn('ResultScene err:', e.message); }
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-result2.png` });
    console.log('[RESULT] 저장');

    // ── MenuScene + 설정 패널 (좌표로 직접 클릭) ──
    console.log('[SETTINGS] MenuScene 설정 버튼...');
    await page.evaluate(() => {
      try { window.__game.scene.start('MenuScene', {}); } catch(e) {}
    });
    await page.waitForTimeout(2000);

    // 설정 아이콘 위치 탐색
    const settingsBtnInfo = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MenuScene');
      if (!s) return null;
      const children = s.children.list;
      const results = [];
      for (const o of children) {
        if (o.type === 'Image' || o.type === 'Text' || o.type === 'Container') {
          if (o.input && o.input.enabled) {
            results.push({ type: o.type, x: o.x, y: o.y, text: o.text || '', visible: o.visible });
          }
        }
      }
      return results.slice(0, 20);
    });
    console.log('인터랙티브 오브젝트:', JSON.stringify(settingsBtnInfo));

    // 설정 아이콘(우상단 기어): 이전 디렉터 플레이테스트에서 약 (335, 30) 위치 확인
    await page.mouse.click(335, 30);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-settings2.png` });
    console.log('[SETTINGS] 저장');

    // ── 쿠폰 패널 (직접 _openCouponModal 호출) ──
    console.log('[COUPON] 쿠폰 패널...');
    await page.evaluate(() => {
      try {
        window.__game.scene.start('MenuScene', {});
      } catch(e) {}
    });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      try {
        const s = window.__game.scene.getScene('MenuScene');
        if (s && s._openCouponModal) {
          s._openCouponModal();
        }
      } catch(e) { console.warn(e.message); }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-coupon2.png` });
    console.log('[COUPON] 저장');

    console.log('=== 추가 캡처 완료 ===');

  } catch(err) {
    console.error('오류:', err.message);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-err2.png` }).catch(() => {});
  }

  await browser.close();
})();
