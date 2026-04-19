/**
 * @fileoverview Phase 51-4 진단 6: 로딩 완료 대기 후 확인
 */
import { test, expect } from '@playwright/test';

test('로딩 완료 이벤트 감지 후 텍스처 확인', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });

  // Wait for actual loading to complete by polling
  const result = await page.evaluate(() => {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const game = window.__game;
        if (!game) return;

        // Check if BootScene's load is complete by checking scene state
        const bootScene = game.scene.getScene('BootScene');
        const menuScene = game.scene.getScene('MenuScene');
        const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);

        // If MenuScene is active, BootScene finished
        if (activeScenes.includes('MenuScene') || game.textures.exists('floor_hall')) {
          clearInterval(checkInterval);
          const allKeys = game.textures.getTextureKeys();
          const serviceKeys = allKeys.filter(k =>
            k.includes('floor_hall') || k.includes('wall_back') ||
            k.includes('table_lv') || k.includes('customer_') ||
            k.includes('counter_') || k.includes('decor_') ||
            k.includes('entrance_')
          );

          resolve({
            activeScenes,
            totalKeys: allKeys.length,
            serviceKeys,
            floorHallExists: game.textures.exists('floor_hall'),
            floorHallG1Exists: game.textures.exists('floor_hall_g1'),
            wallBackExists: game.textures.exists('wall_back'),
          });
        }
      }, 500);

      // Timeout after 30s
      setTimeout(() => {
        clearInterval(checkInterval);
        const game = window.__game;
        const allKeys = game?.textures?.getTextureKeys() || [];
        const activeScenes = game?.scene?.getScenes(true)?.map(s => s.scene.key) || [];
        resolve({
          timeout: true,
          activeScenes,
          totalKeys: allKeys.length,
          floorHallExists: game?.textures?.exists('floor_hall'),
        });
      }, 30000);
    });
  });

  console.log('Loading complete result:', JSON.stringify(result, null, 2));
});
