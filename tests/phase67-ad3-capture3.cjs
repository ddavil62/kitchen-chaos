/**
 * @fileoverview Phase 67 AD 모드3 — 설정/쿠폰 패널 전용 캡처
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
    // 새 페이지 로드 → MenuScene 진입
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);

    // 설정 아이콘 (⚙) 클릭 — 좌표 (330, 30)
    console.log('[SETTINGS] 설정 아이콘 클릭...');
    await page.mouse.click(330, 30);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-settings3.png` });
    console.log('[SETTINGS] 저장');

    // 설정 패널 내에서 쿠폰 버튼 탐색
    const settingsChildren = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MenuScene');
      if (!s) return [];
      // 현재 visible=true인 컨테이너들의 텍스트 오브젝트 탐색
      const found = [];
      const walk = (objs) => {
        if (!objs) return;
        for (const o of objs) {
          if (o.text && o.visible) found.push({ type: o.type, text: o.text, x: o.x, y: o.y });
          if (o.list) walk(o.list);
        }
      };
      walk(s.children.list);
      return found.filter(o => o.text.length > 0).slice(0, 40);
    });
    console.log('현재 화면 텍스트 오브젝트:');
    settingsChildren.forEach(o => console.log(`  [${o.type}] "${o.text}" @ (${o.x},${o.y})`));

    // 쿠폰 버튼 클릭 또는 직접 호출
    await page.evaluate(() => {
      try {
        const s = window.__game.scene.getScene('MenuScene');
        if (!s) return;
        if (typeof s._openCouponModal === 'function') {
          s._openCouponModal();
        }
      } catch(e) { console.warn(e.message); }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-coupon3.png` });
    console.log('[COUPON] 저장');

    console.log('=== 설정/쿠폰 캡처 완료 ===');

  } catch(err) {
    console.error('오류:', err.message);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/phase67-ad3-err3.png` }).catch(() => {});
  }

  await browser.close();
})();
