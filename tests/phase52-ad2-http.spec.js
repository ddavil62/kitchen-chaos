/**
 * @fileoverview Phase 52 AD 모드2 - 에셋 시각 검증 (HTTP 서버 경유)
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:9876';

test('Phase52 - 테이블 back 등급 비교', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 180 });
  const imgs = [0,1,2,3,4].map(lv =>
    `<div style="text-align:center;">` +
    `<img src="${BASE}/assets/service/table_lv${lv}_back.png" ` +
    `width="96" height="64" style="image-rendering:pixelated; display:block; border:1px solid #555;">` +
    `<div style="color:#fff; font-size:10px; font-family:monospace;">lv${lv} back</div>` +
    `</div>`
  ).join('');
  await page.setContent(`<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:8px; align-items:flex-end;">${imgs}</body></html>`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/phase52_table_back_dark.png' });
});

test('Phase52 - 테이블 front 등급 비교', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 150 });
  const imgs = [0,1,2,3,4].map(lv =>
    `<div style="text-align:center;">` +
    `<img src="${BASE}/assets/service/table_lv${lv}_front.png" ` +
    `width="96" height="52" style="image-rendering:pixelated; display:block; border:1px solid #555;">` +
    `<div style="color:#fff; font-size:10px; font-family:monospace;">lv${lv} front</div>` +
    `</div>`
  ).join('');
  await page.setContent(`<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:8px; align-items:flex-end;">${imgs}</body></html>`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/phase52_table_front_dark.png' });
});

test('Phase52 - 테이블 합성 갈색배경', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 220 });
  const imgs = [0,1,2,3,4].map(lv =>
    `<div style="text-align:center; background:#8B4513; padding:4px;">` +
    `<div style="position:relative; width:96px; height:80px;">` +
    `<img src="${BASE}/assets/service/table_lv${lv}_back.png" ` +
    `width="96" height="64" style="image-rendering:pixelated; position:absolute; top:0; left:0;">` +
    `<img src="${BASE}/assets/service/table_lv${lv}_front.png" ` +
    `width="96" height="52" style="image-rendering:pixelated; position:absolute; bottom:0; left:0;">` +
    `</div>` +
    `<div style="color:#fff; font-size:10px; font-family:monospace;">lv${lv}</div>` +
    `</div>`
  ).join('');
  await page.setContent(`<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:16px;">${imgs}</body></html>`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/phase52_table_composite.png' });
});

test('Phase52 - 손님 waiting 5종 비교', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 180 });
  const types = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
  const imgs = types.map(t =>
    `<div style="text-align:center;">` +
    `<img src="${BASE}/assets/service/customer_${t}_waiting.png" ` +
    `style="image-rendering:pixelated; display:block; border:1px solid #555;" ` +
    `width="${t === 'group' ? 64 : 48}" height="64">` +
    `<div style="color:#fff; font-size:9px; font-family:monospace;">${t}</div>` +
    `</div>`
  ).join('');
  await page.setContent(`<html><body style="background:#2a2a2a; margin:8px; display:flex; gap:8px; align-items:flex-end;">${imgs}</body></html>`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/phase52_customers_waiting.png' });
});

test('Phase52 - 손님 wait vs seated 비교', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 280 });
  const types = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
  const cols = types.map(t =>
    `<div style="text-align:center;">` +
    `<img src="${BASE}/assets/service/customer_${t}_waiting.png" ` +
    `style="image-rendering:pixelated; display:block; border:1px solid #666;" ` +
    `width="${t === 'group' ? 64 : 48}" height="64">` +
    `<img src="${BASE}/assets/service/customer_${t}_seated.png" ` +
    `style="image-rendering:pixelated; display:block; border:1px solid #FF6B35; margin-top:4px;" ` +
    `width="${t === 'group' ? 64 : 48}" height="64">` +
    `<div style="color:#aaa; font-size:9px; font-family:monospace;">${t}</div>` +
    `</div>`
  ).join('');
  await page.setContent(`<html><body style="background:#2a2a2a; margin:8px;"><div style="color:#00FFD4; font-size:12px; font-family:monospace; margin-bottom:4px;">위: waiting / 아래: seated</div><div style="display:flex; gap:12px;">${cols}</div></body></html>`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/phase52_wait_vs_seated.png' });
});

test('Phase52 - 기존 vs 신규 비교 갈색배경', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 300 });
  const legacyImgs = 
    `<div style="text-align:center;"><img src="${BASE}/assets/service/table_lv0.png" width="96" height="80" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">table_lv0</div></div>` +
    `<div style="text-align:center;"><img src="${BASE}/assets/service/customer_normal.png" width="48" height="48" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">normal</div></div>`;
  const newImgs =
    `<div style="text-align:center;"><img src="${BASE}/assets/service/table_lv0_back.png" width="96" height="64" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">lv0_back</div></div>` +
    `<div style="text-align:center;"><img src="${BASE}/assets/service/table_lv0_front.png" width="96" height="52" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">lv0_front</div></div>` +
    `<div style="text-align:center;"><img src="${BASE}/assets/service/customer_normal_waiting.png" width="48" height="64" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">wait</div></div>` +
    `<div style="text-align:center;"><img src="${BASE}/assets/service/customer_normal_seated.png" width="48" height="64" style="image-rendering:pixelated;"><div style="color:#fff; font-size:9px;">seat</div></div>`;
  await page.setContent(
    `<html><body style="background:#1a1a1a; margin:8px; font-family:monospace;">` +
    `<div style="color:#FFD700; font-size:12px; margin-bottom:8px;">기존(레거시) vs 신규</div>` +
    `<div style="display:flex; gap:24px; align-items:flex-end;">` +
    `<div><div style="color:#00FFD4; font-size:11px; margin-bottom:4px;">레거시</div>` +
    `<div style="display:flex; gap:4px; background:#8B4513; padding:8px;">${legacyImgs}</div></div>` +
    `<div style="color:#FF6B35; font-size:20px; align-self:center;">VS</div>` +
    `<div><div style="color:#FF6B35; font-size:11px; margin-bottom:4px;">신규</div>` +
    `<div style="display:flex; gap:4px; background:#8B4513; padding:8px;">${newImgs}</div></div>` +
    `</div></body></html>`
  );
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/phase52_legacy_vs_new.png' });
});
