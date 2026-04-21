/**
 * @fileoverview Phase 52 AD 모드2 - 에셋 시각 검증 스크린샷
 */
import { test, expect } from '@playwright/test';

test('Phase52 - 테이블 back 등급 비교 dark bg', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 300 });
  await page.setContent('<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:8px; align-items:flex-end;">' +
    [0,1,2,3,4].map(lv =>
      '<div style="text-align:center;">' +
      '<img src="file:///C:/antigravity/kitchen-chaos/assets/service/table_lv' + lv + '_back.png" ' +
      'width="96" height="64" style="image-rendering:pixelated; display:block; border:1px solid #555;">' +
      '<div style="color:#fff; font-size:10px; font-family:monospace;">lv' + lv + ' back</div>' +
      '</div>'
    ).join('') +
  '</body></html>');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/phase52_table_back_dark.png' });
});

test('Phase52 - 테이블 합성 갈색배경', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 250 });
  await page.setContent('<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:16px;">' +
    [0,1,2,3,4].map(lv =>
      '<div style="text-align:center; background:#8B4513; padding:4px;">' +
      '<div style="position:relative; width:96px; height:80px;">' +
      '<img src="file:///C:/antigravity/kitchen-chaos/assets/service/table_lv' + lv + '_back.png" ' +
      'width="96" height="64" style="image-rendering:pixelated; position:absolute; top:0; left:0;">' +
      '<img src="file:///C:/antigravity/kitchen-chaos/assets/service/table_lv' + lv + '_front.png" ' +
      'width="96" height="52" style="image-rendering:pixelated; position:absolute; bottom:0; left:0;">' +
      '</div>' +
      '<div style="color:#fff; font-size:10px; font-family:monospace;">lv' + lv + '</div>' +
      '</div>'
    ).join('') +
  '</body></html>');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/phase52_table_composite.png' });
});

test('Phase52 - 손님 waiting 5종 비교', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 200 });
  const types = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
  await page.setContent('<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:8px; align-items:flex-end;">' +
    types.map(t =>
      '<div style="text-align:center;">' +
      '<img src="file:///C:/antigravity/kitchen-chaos/assets/service/customer_' + t + '_waiting.png" ' +
      'style="image-rendering:pixelated; display:block; border:1px solid #555;" ' +
      'width="' + (t === 'group' ? 64 : 48) + '" height="64">' +
      '<div style="color:#fff; font-size:9px; font-family:monospace;">' + t + '</div>' +
      '</div>'
    ).join('') +
  '</body></html>');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/phase52_customers_waiting.png' });
});

test('Phase52 - 손님 wait vs seated 비교', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 350 });
  const types = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
  await page.setContent('<html><body style="background:#2a2a2a; margin:8px;">' +
    '<div style="color:#00FFD4; font-size:12px; font-family:monospace; margin-bottom:8px;">waiting vs seated</div>' +
    '<div style="display:flex; gap:12px; margin-bottom:4px;">' +
    types.map(t =>
      '<div style="text-align:center;">' +
      '<img src="file:///C:/antigravity/kitchen-chaos/assets/service/customer_' + t + '_waiting.png" ' +
      'style="image-rendering:pixelated; display:block; border:1px solid #666;" ' +
      'width="' + (t === 'group' ? 64 : 48) + '" height="64">' +
      '<img src="file:///C:/antigravity/kitchen-chaos/assets/service/customer_' + t + '_seated.png" ' +
      'style="image-rendering:pixelated; display:block; border:1px solid #FF6B35; margin-top:4px;" ' +
      'width="' + (t === 'group' ? 64 : 48) + '" height="64">' +
      '<div style="color:#aaa; font-size:9px; font-family:monospace;">' + t + '</div>' +
      '</div>'
    ).join('') +
    '</div>' +
  '</body></html>');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/phase52_wait_vs_seated.png' });
});

test('Phase52 - 기존 vs 신규 비교 (갈색배경)', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 350 });
  await page.setContent('<html><body style="background:#1a1a1a; margin:8px; font-family:monospace;">' +
    '<div style="color:#FFD700; font-size:12px; margin-bottom:8px;">기존(레거시) vs 신규</div>' +
    '<div style="display:flex; gap:24px; align-items:flex-end;">' +
    '<div>' +
    '<div style="color:#00FFD4; font-size:11px; margin-bottom:4px;">레거시 (투명 배경)</div>' +
    '<div style="display:flex; gap:4px; background:#8B4513; padding:8px;">' +
    '<div style="text-align:center;"><img src="file:///C:/antigravity/kitchen-chaos/assets/service/table_lv0.png" width="96" height="80" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">table_lv0</div></div>' +
    '<div style="text-align:center;"><img src="file:///C:/antigravity/kitchen-chaos/assets/service/customer_normal.png" width="48" height="48" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">customer_normal</div></div>' +
    '</div></div>' +
    '<div style="color:#FF6B35; font-size:20px; align-self:center;">VS</div>' +
    '<div>' +
    '<div style="color:#FF6B35; font-size:11px; margin-bottom:4px;">신규 에셋</div>' +
    '<div style="display:flex; gap:4px; background:#8B4513; padding:8px;">' +
    '<div style="text-align:center;"><img src="file:///C:/antigravity/kitchen-chaos/assets/service/table_lv0_back.png" width="96" height="64" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">lv0_back</div></div>' +
    '<div style="text-align:center;"><img src="file:///C:/antigravity/kitchen-chaos/assets/service/table_lv0_front.png" width="96" height="52" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">lv0_front</div></div>' +
    '<div style="text-align:center;"><img src="file:///C:/antigravity/kitchen-chaos/assets/service/customer_normal_waiting.png" width="48" height="64" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">normal_wait</div></div>' +
    '<div style="text-align:center;"><img src="file:///C:/antigravity/kitchen-chaos/assets/service/customer_normal_seated.png" width="48" height="64" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">normal_seat</div></div>' +
    '</div></div>' +
    '</div>' +
  '</body></html>');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/phase52_legacy_vs_new.png' });
});
