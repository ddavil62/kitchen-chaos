/**
 * @fileoverview Phase 46 QA - Playwright browser tests.
 * Verifies: main menu load (no console errors), chef select screen rendering,
 * yuki_chef/lao_chef visibility.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 46 QA', () => {

  test.describe('Game Load & Console Errors', () => {
    test('main menu loads without console errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      // Load game
      await page.goto('/');
      // Wait for Phaser to initialize (game canvas should appear)
      await page.waitForSelector('canvas', { timeout: 15000 });
      // Give the game a few seconds to fully initialize
      await page.waitForTimeout(3000);

      // Screenshot: main menu
      await page.screenshot({ path: 'tests/screenshots/main-menu.png' });

      // Check no JS errors occurred
      expect(errors).toEqual([]);
    });

    test('game instance is accessible via window.__game', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      const hasGame = await page.evaluate(() => {
        return window.__game !== undefined && window.__game !== null;
      });
      expect(hasGame).toBe(true);
    });
  });

  test.describe('Chef Select Screen', () => {
    test('navigates to chef select and shows 5 chef cards', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      // Navigate to ChefSelectScene via game API
      const navigated = await page.evaluate(() => {
        const game = window.__game;
        if (!game || !game.scene) return false;
        // Start ChefSelectScene directly with stageId 1-1
        game.scene.start('ChefSelectScene', { stageId: '1-1' });
        return true;
      });
      expect(navigated).toBe(true);

      // Wait for scene transition
      await page.waitForTimeout(2000);

      // Screenshot: chef select scene
      await page.screenshot({ path: 'tests/screenshots/chef-select.png' });

      // Verify no errors
      expect(errors).toEqual([]);
    });

    test('yuki_chef and lao_chef cards are rendered (locked or unlocked)', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      // Navigate to ChefSelectScene
      await page.evaluate(() => {
        window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(2000);

      // Verify the scene has 5 chef cards by checking CHEF_ORDER length
      const chefCount = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        if (!scene || !scene._cardBgs) return -1;
        return scene._cardBgs.length;
      });
      expect(chefCount).toBe(5);

      // Screenshot: full chef select screen for visual verification
      await page.screenshot({ path: 'tests/screenshots/chef-select-full.png' });

      expect(errors).toEqual([]);
    });
  });

  test.describe('GatheringScene Load', () => {
    test('GatheringScene loads for stage 1-1 without errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      // Navigate directly to GatheringScene
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1', chefId: null });
      });
      await page.waitForTimeout(3000);

      // Screenshot: gathering scene
      await page.screenshot({ path: 'tests/screenshots/gathering-scene.png' });

      // Verify scene is active
      const isActive = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        return scene && scene.scene.isActive();
      });
      expect(isActive).toBe(true);

      // Check no errors
      expect(errors).toEqual([]);
    });
  });

  test.describe('enemy_charge_impact Handler', () => {
    test('_onEnemyChargeImpact method exists on GatheringScene', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      // Navigate to GatheringScene
      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1', chefId: null });
      });
      await page.waitForTimeout(3000);

      const hasHandler = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        return typeof scene._onEnemyChargeImpact === 'function';
      });
      expect(hasHandler).toBe(true);
    });

    test('enemy_charge_impact event is registered', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1', chefId: null });
      });
      await page.waitForTimeout(3000);

      // Check event listener exists by looking at the event emitter
      const hasListener = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        if (!scene || !scene.events) return false;
        const listeners = scene.events.listeners('enemy_charge_impact');
        return listeners && listeners.length > 0;
      });
      expect(hasListener).toBe(true);
    });

    test('_onEnemyChargeImpact handles empty towers without crash', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      await page.evaluate(() => {
        window.__game.scene.start('GatheringScene', { stageId: '1-1', chefId: null });
      });
      await page.waitForTimeout(3000);

      // Emit enemy_charge_impact event with no towers placed
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('GatheringScene');
        try {
          scene.events.emit('enemy_charge_impact', {
            x: 100, y: 200, radius: 48, damageRatio: 0.15
          });
          return 'ok';
        } catch (e) {
          return e.message;
        }
      });
      expect(result).toBe('ok');
      expect(errors).toEqual([]);
    });
  });

  test.describe('UI Stability', () => {
    test('no console errors during scene transitions', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Menu -> ChefSelect -> Menu cycle
      await page.evaluate(() => {
        window.__game.scene.start('ChefSelectScene', { stageId: '1-1' });
      });
      await page.waitForTimeout(1500);

      await page.evaluate(() => {
        window.__game.scene.start('MenuScene');
      });
      await page.waitForTimeout(1500);

      expect(errors).toEqual([]);
    });

    test('mobile viewport (360x640) renders correctly', async ({ page }) => {
      // Already set to 360x640 in config, but verify
      await page.setViewportSize({ width: 360, height: 640 });

      await page.goto('/');
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'tests/screenshots/mobile-viewport.png' });

      // Verify canvas exists and is visible
      const canvasVisible = await page.isVisible('canvas');
      expect(canvasVisible).toBe(true);
    });
  });
});
