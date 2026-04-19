/**
 * @fileoverview Phase 51-4 진단 테스트: 텍스처 로드 상태 심층 분석
 */
import { test, expect } from '@playwright/test';

test('floor_hall_g1 텍스처 로드 상태 심층 분석', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(10000);

  const result = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return { error: 'no __game' };

    const texManager = game.textures;
    const allKeys = texManager.getTextureKeys();
    const floorKeys = allKeys.filter(k => k.includes('floor_hall'));
    const wallKeys = allKeys.filter(k => k.includes('wall_back'));

    // Check if ServiceScene has been loaded (BootScene preloads)
    const scenes = game.scene.getScenes(false).map(s => s.scene.key);

    // Check for specific textures
    const g1Exists = texManager.exists('floor_hall_g1');
    const floorExists = texManager.exists('floor_hall');
    const wallExists = texManager.exists('wall_back');

    // Try to load the scene and check after
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);

    return {
      totalTextureKeys: allKeys.length,
      floorKeys,
      wallKeys,
      g1Exists,
      floorExists,
      wallExists,
      scenes,
      activeScenes,
      sampleKeys: allKeys.slice(0, 30),
    };
  });

  console.log('Diagnostic result:', JSON.stringify(result, null, 2));

  // If floor keys are empty, check if BootScene preload completed
  if (result.floorKeys.length === 0) {
    console.log('WARNING: No floor_hall_* textures found. Checking BootScene...');
  }

  // Check if ServiceScene even starts properly
  const sceneResult = await page.evaluate(() => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) game.scene.stop(s.scene.key);
    game.scene.start('ServiceScene', {
      stageId: '1-1',
      inventory: { carrot: 10 },
      gold: 100,
      lives: 5,
      isEndless: false,
    });
    return new Promise(resolve => {
      setTimeout(() => {
        const svc = game.scene.getScene('ServiceScene');
        if (!svc) return resolve({ error: 'scene not found' });

        // Check textures again AFTER ServiceScene loads
        const texManager = game.textures;
        const allKeys = texManager.getTextureKeys();
        const floorKeys = allKeys.filter(k => k.includes('floor_hall'));

        // Check children
        const children = svc.children.list;
        const types = {};
        for (const c of children) {
          types[c.type] = (types[c.type] || 0) + 1;
        }

        // Look for depth 0 items
        const depth0Items = children.filter(c => c.depth === 0).map(c => ({
          type: c.type,
          textureKey: c.texture?.key,
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
        }));

        return resolve({
          floorKeys,
          childTypes: types,
          depth0Items,
          chapter: svc.chapter,
          floorKey: svc._getHallFloorKey(),
        });
      }, 3000);
    });
  });

  console.log('Scene result:', JSON.stringify(sceneResult, null, 2));
});
