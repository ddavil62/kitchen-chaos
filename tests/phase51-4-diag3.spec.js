/**
 * @fileoverview Phase 51-4 진단 3: 타이밍 분석 + 실제 게임 흐름 통한 검증
 */
import { test, expect } from '@playwright/test';

test('BootScene 완료 후 텍스처 존재 확인 (직접 접근)', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });

  // Wait for BootScene to fully complete loading
  await page.waitForTimeout(12000);

  const bootResult = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return { error: 'no game' };

    const allKeys = game.textures.getTextureKeys();
    const floorKeys = allKeys.filter(k => k.startsWith('floor_hall'));
    const wallKeys = allKeys.filter(k => k.startsWith('wall_back'));
    const activeScene = game.scene.getScenes(true).map(s => s.scene.key);

    return {
      totalKeys: allKeys.length,
      floorKeys,
      wallKeys,
      activeScene,
    };
  });

  console.log('After 12s boot wait:', JSON.stringify(bootResult, null, 2));

  // Now start ServiceScene and check DURING create
  const sceneResult = await page.evaluate(() => {
    const game = window.__game;

    // Patch _createTables to log texture check
    const ServiceSceneProto = game.scene.getScene('ServiceScene').__proto__;
    const origCreateTables = ServiceSceneProto._createTables;

    let createTablesLog = null;
    ServiceSceneProto._createTables = function() {
      const floorKey = this._getHallFloorKey();
      const floorExists = this.textures.exists(floorKey);
      let frameInfo = null;
      if (floorExists) {
        const tex = this.textures.get(floorKey);
        const frame = tex.get();
        frameInfo = { width: frame?.width, height: frame?.height };
      }
      const fallbackExists = this.textures.exists('floor_hall');

      // Import SpriteLoader check
      let hasTextureResult = false;
      if (floorExists) {
        const tex = this.textures.get(floorKey);
        const frame = tex.get();
        hasTextureResult = frame && frame.width > 1 && frame.height > 1;
      }

      createTablesLog = {
        floorKey,
        floorExists,
        frameInfo,
        fallbackExists,
        hasTextureResult,
        chapter: this.chapter,
        isEndless: this.isEndless,
      };

      // Call original
      origCreateTables.call(this);
    };

    // Start ServiceScene
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) game.scene.stop(s.scene.key);
    game.scene.start('ServiceScene', {
      stageId: '1-1',
      inventory: { carrot: 10, meat: 8, flour: 6 },
      gold: 500,
      lives: 10,
      isEndless: false,
    });

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          createTablesLog,
        });
      }, 3000);
    });
  });

  console.log('_createTables call-time data:', JSON.stringify(sceneResult, null, 2));
});
