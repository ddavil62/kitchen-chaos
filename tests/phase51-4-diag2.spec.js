/**
 * @fileoverview Phase 51-4 진단 테스트 2: hasTexture 검증 심층 분석
 */
import { test, expect } from '@playwright/test';

test('hasTexture가 floor_hall_g1에서 false를 반환하는 원인 분석', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(10000);

  const result = await page.evaluate(() => {
    const game = window.__game;

    // Start ServiceScene
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

        const texManager = game.textures;

        // Check floor_hall_g1 texture deeply
        const keys = ['floor_hall_g1', 'floor_hall', 'floor_hall_izakaya', 'enemy_carrot_goblin'];
        const details = {};

        for (const key of keys) {
          const exists = texManager.exists(key);
          if (!exists) {
            details[key] = { exists: false };
            continue;
          }

          const tex = texManager.get(key);
          const frame = tex.get();
          details[key] = {
            exists: true,
            texType: tex.constructor.name,
            sourceCount: tex.source?.length,
            frameWidth: frame?.width,
            frameHeight: frame?.height,
            frameValid: frame && frame.width > 1 && frame.height > 1,
            isMissing: tex.key === '__MISSING',
          };
        }

        // Also check what hasTexture says via SpriteLoader directly
        // Import SpriteLoader is not accessible directly, simulate
        const hasTextureSimulated = {};
        for (const key of keys) {
          if (!texManager.exists(key)) {
            hasTextureSimulated[key] = false;
            continue;
          }
          const tex = texManager.get(key);
          const frame = tex.get();
          hasTextureSimulated[key] = frame && frame.width > 1 && frame.height > 1;
        }

        // Check if ServiceScene's own hasTexture call
        // Try calling from scene context
        const sceneHasTexture = {};
        for (const key of keys) {
          if (!svc.textures.exists(key)) {
            sceneHasTexture[key] = { exists: false };
            continue;
          }
          const tex = svc.textures.get(key);
          const frame = tex.get();
          sceneHasTexture[key] = {
            exists: true,
            width: frame?.width,
            height: frame?.height,
            valid: frame && frame.width > 1 && frame.height > 1,
          };
        }

        // Check all depth 0 children
        const depth0 = svc.children.list.filter(c => c.depth === 0);
        const depth0Detail = depth0.map(c => ({
          type: c.type,
          textureKey: c.texture?.key || 'none',
          fillColor: c.fillColor,
          x: c.x, y: c.y, w: c.width, h: c.height,
        }));

        return resolve({
          gameTextures: details,
          hasTextureSimulated,
          sceneHasTexture,
          depth0Detail,
          chapter: svc.chapter,
          floorKey: svc._getHallFloorKey(),
          isEndless: svc.isEndless,
        });
      }, 3000);
    });
  });

  console.log('Deep diagnostic:', JSON.stringify(result, null, 2));
});
