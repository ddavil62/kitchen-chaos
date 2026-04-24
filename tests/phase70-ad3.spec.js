/**
 * @fileoverview Phase 68 QA: P0-2/P0-3/P0-4 핫픽스 검증.
 * - 시나리오 A: 서빙 0회 시 0별 판정
 * - 시나리오 B: DialogueScene 활성 중 버튼 잠금
 * - 시나리오 C: stageId 전달 정합성 + 누락 시 MenuScene 복귀
 */
import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

test.describe('Phase 68 -- P0-2/P0-3/P0-4 핫픽스 QA', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // ── 시나리오 A: P0-2 서빙 0회 = 0별 ──

  test('P0-2: 서빙 0회 시 ResultScene에서 0별 판정', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // ResultScene을 직접 시작 — serviceResult.servedCount = 0, satisfaction = 100 (버그 재현 조건)
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 3, livesRemaining: 5, livesMax: 15 },
        serviceResult: { servedCount: 0, totalCustomers: 0, goldEarned: 0, tipEarned: 0, maxCombo: 0, satisfaction: 100 },
        isMarketFailed: false,
      });
    });

    await page.waitForTimeout(1500);

    // 별점 텍스트 확인 — 0별(☆☆☆)이어야 한다
    const starText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      for (const obj of list) {
        if (obj.text && (obj.text.includes('\u2605') || obj.text.includes('\u2606'))) {
          return obj.text;
        }
      }
      return null;
    });
    expect(starText).toBe('\u2606\u2606\u2606');

    // 만족도 0% 확인
    const satText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      for (const obj of list) {
        if (obj.text && obj.text.includes('\uB9CC\uC871\uB3C4')) {
          return obj.text;
        }
      }
      return null;
    });
    expect(satText).toContain('0%');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p02-zero-serve.png` });
  });

  // ── 시나리오 B: P0-3 modal lock ──

  test('P0-3: DialogueScene 활성 중 ResultScene 버튼 잠금', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // ResultScene 직접 진입 (스토리 트리거가 발동될 수 있는 조건)
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 3, totalCustomers: 3, goldEarned: 60, tipEarned: 5, maxCombo: 2, satisfaction: 100 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(500);

    // DialogueScene이 열려 있으면 버튼이 잠겨 있어야 한다
    const isDialogueActive = await page.evaluate(() =>
      window.__game.scene.isActive('DialogueScene')
    );

    if (isDialogueActive) {
      const buttonsLocked = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ResultScene');
        return scene?._buttonsLocked === true;
      });
      expect(buttonsLocked).toBe(true);

      // DialogueScene을 강제 종료하여 unlock 확인
      await page.evaluate(() => {
        window.__game.scene.stop('DialogueScene');
      });
      await page.waitForTimeout(200);

      const buttonsUnlocked = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ResultScene');
        return scene?._buttonsLocked === false;
      });
      expect(buttonsUnlocked).toBe(true);
    } else {
      // 트리거 미발동 시 50ms 후 unlock 상태여야 한다
      await page.waitForTimeout(100);
      const buttonsLocked = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ResultScene');
        return scene?._buttonsLocked;
      });
      expect(buttonsLocked).toBe(false);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p03-modal-lock.png` });
  });

  // ── 시나리오 C: P0-4 stageId 정합성 ──

  test('P0-4: stageId 1-2 선택 시 ResultScene 헤더에 1-2 표시', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // GatheringScene을 stageId '1-2'로 시작하여 currentRun 설정
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(500);

    // GatheringScene이 currentRun을 설정했는지 확인
    const currentRunStageId = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('GatheringScene');
      return scene?.stageId;
    });
    expect(currentRunStageId).toBe('1-2');

    // ResultScene을 stageId 없이 시작 (currentRun 폴백 테스트)
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        // stageId 의도적으로 생략
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 2, totalCustomers: 3, goldEarned: 40, tipEarned: 3, maxCombo: 1, satisfaction: 80 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1000);

    // 헤더 stageId 텍스트 확인
    const headerText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      for (const obj of list) {
        if (obj.text && obj.text.includes('1-2')) {
          return obj.text;
        }
      }
      return null;
    });
    expect(headerText).toContain('1-2');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p04-stageid-fallback.png` });
  });

  test('P0-4: stageId 완전 누락 시 MenuScene 복귀', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // currentRun도 없고 data.stageId도 없는 최악의 케이스
    // 먼저 currentRun을 확실히 클리어
    await page.evaluate(() => {
      // SaveManager의 currentRun을 강제 초기화
      const scenes = window.__game.scene.scenes;
      // 직접 모듈 접근이 어려우므로 ResultScene을 stageId 없이 시작
      window.__game.scene.start('ResultScene', {
        marketResult: { totalIngredients: 0, livesRemaining: 0, livesMax: 15 },
        serviceResult: null,
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1000);

    // MenuScene이 활성화되어 있어야 한다
    const menuActive = await page.evaluate(() =>
      window.__game.scene.isActive('MenuScene')
    );
    expect(menuActive).toBe(true);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p04-missing-stageid.png` });
  });
});
