/**
 * @fileoverview Phase 54 AD 모드3 — 쿠폰 UI 레이아웃 스크린샷 캡처
 * canvas(360x640) -> page 스케일: scaleX=1.0917, scaleY=1.0922, offsetTop=14
 * 기어 버튼 canvas(330,30) -> page(360, 47)
 * 쿠폰 버튼 canvas(180,408) -> page(196, 460)
 */
import { test } from '@playwright/test';

async function waitForScene(page, sceneKey, timeout = 12000) {
  await page.waitForFunction(
    (key) => {
      const game = window.__game;
      if (!game || !game.scene) return false;
      const s = game.scene.getScene(key);
      return s && s.sys && s.sys.isActive();
    },
    sceneKey,
    { timeout }
  );
}

test('phase54 쿠폰 UI 스크린샷', async ({ page }) => {
  await page.goto('http://localhost:5178', { waitUntil: 'networkidle' });
  await waitForScene(page, 'MenuScene');
  await page.waitForTimeout(1500);

  // 1. 타이틀 화면
  await page.screenshot({ path: 'tests/screenshots/phase54_01_title.png' });

  // 설정(기어) 버튼 — page 좌표 (360, 47)
  await page.mouse.click(360, 47);
  await page.waitForTimeout(1000);

  // 2. 설정 패널 열린 상태
  await page.screenshot({ path: 'tests/screenshots/phase54_02_settings.png' });

  // 쿠폰 버튼 — page 좌표 (196, 460)
  await page.mouse.click(196, 460);
  await page.waitForTimeout(1000);

  // 3. 쿠폰 모달 열린 상태
  await page.screenshot({ path: 'tests/screenshots/phase54_03_coupon_modal.png' });
  await page.screenshot({ path: 'tests/screenshots/phase54_coupon_ui.png' });
});
