/**
 * @fileoverview Phase 51-4 진단 4: 텍스처 키 검색 + 직접 로드 테스트
 */
import { test, expect } from '@playwright/test';

test('텍스처 키 중 floor/wall/service 관련 키 모두 덤프', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(12000);

  const result = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return { error: 'no game' };

    const allKeys = game.textures.getTextureKeys();

    // Search for anything related to service assets
    const serviceKeys = allKeys.filter(k =>
      k.includes('floor') || k.includes('wall') || k.includes('table') ||
      k.includes('counter') || k.includes('customer') || k.includes('decor') ||
      k.includes('entrance') || k.includes('service')
    );

    // Also check if the texture was actually queued for loading
    // by checking if game.load has any info
    const existsFloorHall = game.textures.exists('floor_hall');
    const existsFloorHallG1 = game.textures.exists('floor_hall_g1');

    // Check MenuScene status
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);

    return {
      serviceKeys,
      existsFloorHall,
      existsFloorHallG1,
      activeScenes,
      totalKeys: allKeys.length,
    };
  });

  console.log('Service-related keys:', JSON.stringify(result, null, 2));
});

test('ServiceScene preload가 있는지 확인하고 직접 로드 후 텍스처 확인', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(10000);

  const result = await page.evaluate(() => {
    const game = window.__game;

    // Check if ServiceScene has its own preload
    const svcScene = game.scene.getScene('ServiceScene');
    const hasPreload = typeof svcScene.preload === 'function';

    // Manually check the ServiceScene class for preload
    const proto = Object.getPrototypeOf(svcScene);
    const methods = Object.getOwnPropertyNames(proto);
    const hasPreloadMethod = methods.includes('preload');

    return {
      hasPreload,
      hasPreloadMethod,
      protoMethods: methods.filter(m => m.startsWith('pre') || m.startsWith('create') || m.startsWith('init')),
    };
  });

  console.log('ServiceScene methods:', JSON.stringify(result, null, 2));
});
