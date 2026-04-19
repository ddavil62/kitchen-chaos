/**
 * @fileoverview Phase 51-4 진단 5: 모든 서비스 에셋 키 개별 확인
 */
import { test, expect } from '@playwright/test';

test('서비스 에셋 키 개별 존재 여부', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(12000);

  const result = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return { error: 'no game' };

    const serviceKeys = [
      // Tables
      'table_lv0', 'table_lv0_occupied',
      'table_lv1', 'table_lv1_occupied',
      'table_lv2', 'table_lv2_occupied',
      'table_lv3', 'table_lv3_occupied',
      'table_lv4', 'table_lv4_occupied',
      // Customers
      'customer_normal', 'customer_vip', 'customer_gourmet', 'customer_rushed', 'customer_group',
      // Other service
      'floor_hall', 'counter_cooking',
      'wall_back', 'decor_plant', 'entrance_arch',
      // New chapter variants
      'floor_hall_g1', 'floor_hall_izakaya', 'floor_hall_dragon',
      'wall_back_g1', 'wall_back_izakaya',
    ];

    const results = {};
    for (const key of serviceKeys) {
      results[key] = game.textures.exists(key);
    }

    // Also check if there were any load errors
    const loadEvents = [];
    // Can't retroactively check, but let's see total keys
    return {
      keyChecks: results,
      totalKeys: game.textures.getTextureKeys().length,
    };
  });

  console.log('Service key checks:', JSON.stringify(result, null, 2));
});

test('Phaser 로드 에러 이벤트 캡처', async ({ page }) => {
  // Intercept console to catch load errors
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.text().includes('error') || msg.text().includes('Error') ||
        msg.text().includes('Failed') || msg.text().includes('404') ||
        msg.text().includes('load')) {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  // Track network requests for service assets
  const serviceRequests = [];
  page.on('response', res => {
    if (res.url().includes('/sprites/service/')) {
      serviceRequests.push({
        url: res.url().split('/sprites/service/')[1],
        status: res.status(),
        contentType: res.headers()['content-type'],
      });
    }
  });

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(15000);

  console.log('Service asset requests:', JSON.stringify(serviceRequests, null, 2));
  console.log('Console messages with load/error:', JSON.stringify(consoleMessages.slice(0, 20), null, 2));
  console.log('Page errors:', JSON.stringify(pageErrors, null, 2));
});
