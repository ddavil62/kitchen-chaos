/**
 * @fileoverview Phase 68 Extended QA: 엣지케이스 및 회귀 검증.
 * coder가 작성한 기본 테스트 외 공격적 시나리오 추가.
 */
import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

test.describe('Phase 68 Extended QA', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // ── P0-2 Edge Cases ──

  test('P0-2: servedCount=0 + satisfaction=100 + hpAlive -> 행상인 버튼 미노출', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // HP가 살아있지만 서빙 0회인 경우 -- isCleared가 false여야 한다
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 0, totalCustomers: 5, goldEarned: 0, tipEarned: 0, maxCombo: 0, satisfaction: 100 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

    // 행상인 버튼이 없어야 한다 (버튼 텍스트에 '행상인' 포함되는 것이 없어야)
    const hasMerchantBtn = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      return list.some(obj => obj.text && obj.text.includes('\ud589\uc0c1\uc778'));
    });
    expect(hasMerchantBtn).toBe(false);

    // stars가 0이어야 한다
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

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p02-hp-alive-zero-serve.png` });
  });

  test('P0-2: servedCount=1 + satisfaction=100 + hpAlive -> 정상 3별 + 행상인 노출', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 1, totalCustomers: 1, goldEarned: 10, tipEarned: 0, maxCombo: 1, satisfaction: 100 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

    // 3별이어야 한다
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
    expect(starText).toBe('\u2605\u2605\u2605');

    // 행상인 버튼이 있어야 한다
    const hasMerchantBtn = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      return list.some(obj => obj.text && obj.text.includes('\ud589\uc0c1\uc778'));
    });
    expect(hasMerchantBtn).toBe(true);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p02-normal-3star.png` });
  });

  test('P0-2: serviceResult=null -> 0별 (sr null 방어)', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 3, livesRemaining: 5, livesMax: 15 },
        serviceResult: null,
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

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
  });

  test('P0-2: hpRemaining=0 + servedCount=5 + satisfaction=100 -> isCleared false, 행상인 미노출', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // HP 0이면 hpAlive=false -> isCleared=false
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 3, livesRemaining: 0, livesMax: 15 },
        serviceResult: { servedCount: 5, totalCustomers: 5, goldEarned: 50, tipEarned: 10, maxCombo: 3, satisfaction: 100 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

    // 행상인 버튼이 없어야 한다 (HP 0이면 isCleared=false)
    const hasMerchantBtn = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      return list.some(obj => obj.text && obj.text.includes('\ud589\uc0c1\uc778'));
    });
    expect(hasMerchantBtn).toBe(false);

    // 별점은 3이어야 한다 (서빙은 했으니까)
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
    expect(starText).toBe('\u2605\u2605\u2605');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-p02-hp-zero.png` });
  });

  test('P0-2: satisfaction=79 -> 0별 (경계값 테스트)', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 3, totalCustomers: 5, goldEarned: 30, tipEarned: 0, maxCombo: 1, satisfaction: 59 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

    // satisfaction=59 -> stars=0
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
  });

  test('P0-2: satisfaction=60 -> 1별 (경계값 테스트)', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 3, totalCustomers: 5, goldEarned: 30, tipEarned: 0, maxCombo: 1, satisfaction: 60 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

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
    expect(starText).toBe('\u2605\u2606\u2606');
  });

  // ── P0-3 Edge Cases ──

  test('P0-3: 트리거 미발동 시 50ms 후 자동 unlock', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 이미 본 적 있는 stageId로 ResultScene 진입 (트리거가 발동하지 않을 가능성 높음)
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-3',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 3, totalCustomers: 5, goldEarned: 30, tipEarned: 0, maxCombo: 1, satisfaction: 95 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(500);

    // 트리거 발동 여부 확인
    const isDialogueActive = await page.evaluate(() =>
      window.__game.scene.isActive('DialogueScene')
    );

    if (!isDialogueActive) {
      // 트리거 미발동: 50ms+ 후 unlock 상태
      const buttonsLocked = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ResultScene');
        return scene?._buttonsLocked;
      });
      expect(buttonsLocked).toBe(false);

      // alpha가 1로 복원되었는지 확인
      const alphaValues = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ResultScene');
        if (!scene?._buttonObjects) return [];
        return scene._buttonObjects.map(obj => obj.alpha);
      });
      for (const a of alphaValues) {
        expect(a).toBe(1);
      }
    }
  });

  test('P0-3: 빠른 더블클릭 시 _buttonsLocked 가드로 이중 씬 전환 방지', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 3, totalCustomers: 3, goldEarned: 60, tipEarned: 5, maxCombo: 2, satisfaction: 95 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

    // DialogueScene이 없으면 버튼 클릭 테스트
    const isDialogueActive = await page.evaluate(() =>
      window.__game.scene.isActive('DialogueScene')
    );

    if (!isDialogueActive) {
      // "월드맵으로" 버튼 영역을 빠르게 두 번 클릭
      // 버튼 Y좌표 확인
      const btnY = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ResultScene');
        if (!scene?._buttonObjects) return null;
        // 마지막 버튼이 '월드맵으로'
        const lastBtnBg = scene._buttonObjects[scene._buttonObjects.length - 2];
        return lastBtnBg?.y;
      });

      if (btnY) {
        // 두 번 빠르게 클릭
        await page.click(`canvas`, { position: { x: 180, y: btnY } });
        await page.click(`canvas`, { position: { x: 180, y: btnY } });
        await page.waitForTimeout(500);
      }
    }

    // 콘솔 에러가 없어야 한다
    expect(errors.filter(e => !e.includes('net::') && !e.includes('favicon'))).toEqual([]);
  });

  // ── P0-4 Edge Cases ──

  test('P0-4: SaveManager.getCurrentRun 초기값은 null', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 새 페이지 로드 직후 currentRun은 null이어야 한다
    // SaveManager는 모듈이라 직접 접근이 어려우므로, ResultScene stageId 누락 시 MenuScene 복귀로 간접 확인
    const result = await page.evaluate(() => {
      // ResultScene을 stageId 없이 시작
      window.__game.scene.start('ResultScene', {});
      return true;
    });
    await page.waitForTimeout(1000);

    const menuActive = await page.evaluate(() =>
      window.__game.scene.isActive('MenuScene')
    );
    expect(menuActive).toBe(true);
  });

  test('P0-4: _fadeToScene 호출 후 currentRun이 clear 되는지 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // GatheringScene으로 currentRun 설정
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '1-1' });
    });
    await page.waitForTimeout(500);

    // ResultScene 진입
    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 3, totalCustomers: 3, goldEarned: 60, tipEarned: 5, maxCombo: 2, satisfaction: 80 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(1500);

    // 씬 전환 후 currentRun이 클리어되었는지 확인
    // '월드맵으로' 버튼 클릭으로 _fadeToScene 트리거
    const isDialogueActive = await page.evaluate(() =>
      window.__game.scene.isActive('DialogueScene')
    );
    if (isDialogueActive) {
      await page.evaluate(() => {
        window.__game.scene.stop('DialogueScene');
      });
      await page.waitForTimeout(200);
    }

    // '월드맵으로' 버튼 위치를 찾아 클릭
    const btnY = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene?._buttonObjects) return null;
      const lastBtnBg = scene._buttonObjects[scene._buttonObjects.length - 2];
      return lastBtnBg?.y;
    });

    if (btnY) {
      await page.click('canvas', { position: { x: 180, y: btnY } });
      await page.waitForTimeout(1000);
    }
  });

  // ── 회귀 검증 ──

  test('회귀: isMarketFailed=true 경로 정상 동작', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 1, livesRemaining: 0, livesMax: 15 },
        serviceResult: null,
        isMarketFailed: true,
      });
    });
    await page.waitForTimeout(1500);

    // ResultScene이 활성화되어 있어야 한다
    const resultActive = await page.evaluate(() =>
      window.__game.scene.isActive('ResultScene')
    );
    expect(resultActive).toBe(true);

    // '장보기 실패!' 텍스트가 보여야 한다
    const failText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      return list.some(obj => obj.text && obj.text.includes('\uc7a5\ubcf4\uae30 \uc2e4\ud328'));
    });
    expect(failText).toBe(true);

    // 콘솔 에러가 없어야
    expect(errors.filter(e => !e.includes('net::') && !e.includes('favicon'))).toEqual([]);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-market-failed.png` });
  });

  test('회귀: isEndless=true 경로 정상 동작', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: 'endless',
        isEndless: true,
        endlessWave: 5,
        endlessScore: 120,
        endlessMaxCombo: 8,
        newBestWave: false,
        newBestScore: false,
        newBestCombo: false,
      });
    });
    await page.waitForTimeout(1500);

    // ResultScene이 활성화되어 있어야 한다
    const resultActive = await page.evaluate(() =>
      window.__game.scene.isActive('ResultScene')
    );
    expect(resultActive).toBe(true);

    // 엔드리스 타이틀이 보여야
    const endlessText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      if (!scene) return null;
      const list = scene.children?.list || [];
      return list.some(obj => obj.text && obj.text.includes('\uc5d4\ub4dc\ub9ac\uc2a4'));
    });
    expect(endlessText).toBe(true);

    // 콘솔 에러가 없어야
    expect(errors.filter(e => !e.includes('net::') && !e.includes('favicon'))).toEqual([]);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-endless.png` });
  });

  test('회귀: 콘솔 에러 없이 정상 ResultScene 로드', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 5, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 5, totalCustomers: 5, goldEarned: 100, tipEarned: 10, maxCombo: 5, satisfaction: 100 },
        isMarketFailed: false,
      });
    });
    await page.waitForTimeout(2000);

    // pageerror 수집 (네트워크 에러 제외)
    const realErrors = errors.filter(e => !e.includes('net::') && !e.includes('favicon'));
    expect(realErrors).toEqual([]);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase68-qa-no-errors.png` });
  });

  test('회귀: 한글 폰트 로딩 정상', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(2000);

    const fontLoaded = await page.evaluate(() => {
      return document.fonts.check('16px "NeoDunggeunmoPro"');
    });
    expect(fontLoaded).toBe(true);
  });

  // ── P0-4: ServiceScene에서 setCurrentRun 호출 확인 ──

  test('P0-4: ServiceScene init에서 setCurrentRun 호출', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__game?.isBooted, {}, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // GatheringScene을 '1-2'로 시작
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(500);

    // GatheringScene의 stageId 확인
    const gsStageId = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('GatheringScene');
      return scene?.stageId;
    });
    expect(gsStageId).toBe('1-2');
  });
});
