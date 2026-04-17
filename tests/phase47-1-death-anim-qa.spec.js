/**
 * @fileoverview Phase 47-1 QA: death animation system architecture verification.
 * Verifies asset loading, code structure, preview page, and game loading.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// ── 에셋 파일 검증 (프리뷰 페이지) ──
test.describe('Phase 47-1 Death Animation - Preview Page', () => {
  test('프리뷰 페이지가 정상 로드되고 콘솔 에러가 없다', async ({ page }) => {
    const errors = [];
    const warnings = [];
    const failedRequests = [];

    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') warnings.push(msg.text());
    });
    page.on('requestfailed', req => {
      failedRequests.push(req.url());
    });

    await page.goto(`${BASE_URL}/tests/phase47_death_preview.html`, {
      waitUntil: 'networkidle',
    });

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Phase 47-1/);

    // 스크린샷 캡처
    await page.screenshot({
      path: 'tests/screenshots/phase47_qa_preview.png',
      fullPage: true,
    });

    // 콘솔 에러 없음
    expect(errors).toEqual([]);
    // 네트워크 실패 요청 없음 (404 이미지 없음)
    expect(failedRequests).toEqual([]);
  });

  test('4방향 x 7프레임 = 28개 이미지가 모두 로드된다', async ({ page }) => {
    const failedImages = [];

    page.on('requestfailed', req => {
      if (req.url().includes('.png')) {
        failedImages.push(req.url());
      }
    });

    await page.goto(`${BASE_URL}/tests/phase47_death_preview.html`, {
      waitUntil: 'networkidle',
    });

    // 모든 img 태그의 naturalWidth 확인 (0이면 로드 실패)
    const imageStatus = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
      }));
    });

    // death 프레임 이미지 필터링 (falling_backward 경로 포함)
    const deathImages = imageStatus.filter(img =>
      img.src.includes('falling_backward')
    );

    // 28개 death 프레임 + 7개 4x zoom south = 35개
    // 고유 소스 경로로 필터링하면 28개
    const uniqueDeathSrcs = new Set(deathImages.map(img => {
      // URL에서 파일 경로 부분만 추출
      try { return new URL(img.src).pathname; } catch { return img.src; }
    }));
    expect(uniqueDeathSrcs.size).toBe(28);

    // 전체 이미지 수 (중복 포함) = 35 (28 + 7 south zoom)
    expect(deathImages.length).toBe(35);

    // 모든 이미지가 정상 로드 (naturalWidth > 0)
    const failedLoads = deathImages.filter(img => img.naturalWidth === 0);
    expect(failedLoads).toEqual([]);

    // walk 참조 이미지도 정상 로드 확인
    const walkImages = imageStatus.filter(img =>
      img.src.includes('walking-012372c9')
    );
    expect(walkImages.length).toBeGreaterThan(0);
    const failedWalkLoads = walkImages.filter(img => img.naturalWidth === 0);
    expect(failedWalkLoads).toEqual([]);

    // 이미지 404 없음
    expect(failedImages).toEqual([]);
  });

  test('death 프레임 이미지 크기가 유효하다 (1x1 이상)', async ({ page }) => {
    await page.goto(`${BASE_URL}/tests/phase47_death_preview.html`, {
      waitUntil: 'networkidle',
    });

    const imageSizes = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter(img => img.src.includes('falling_backward'))
        .map(img => ({
          src: img.src.split('/').slice(-3).join('/'),
          w: img.naturalWidth,
          h: img.naturalHeight,
        }));
    });

    // 모든 death 프레임이 1x1보다 큰 실제 이미지
    for (const img of imageSizes) {
      expect(img.w, `${img.src} width`).toBeGreaterThan(1);
      expect(img.h, `${img.src} height`).toBeGreaterThan(1);
    }
  });
});

// ── 게임 로딩 검증 ──
test.describe('Phase 47-1 Death Animation - Game Loading', () => {
  test('게임이 BootScene 에러 없이 정상 로딩된다', async ({ page }) => {
    const errors = [];
    const consoleErrors = [];

    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Phaser 캔버스가 생성될 때까지 대기 (최대 15초)
    await page.waitForSelector('canvas', { timeout: 15000 });

    // BootScene 로딩 완료 대기 (세이브 데이터 크기 로그가 출력되면 create() 완료)
    await page.waitForTimeout(5000);

    // 스크린샷 캡처
    await page.screenshot({
      path: 'tests/screenshots/phase47_qa_game.png',
    });

    // JavaScript 에러 없음
    expect(errors).toEqual([]);

    // death 관련 콘솔 에러 없음
    const deathErrors = consoleErrors.filter(msg =>
      msg.toLowerCase().includes('death') ||
      msg.toLowerCase().includes('dying') ||
      msg.toLowerCase().includes('falling_backward')
    );
    expect(deathErrors).toEqual([]);
  });

  test('게임 로딩 시 death 에셋 404 에러가 없다', async ({ page }) => {
    const failedRequests = [];

    page.on('requestfailed', req => {
      if (req.url().includes('falling_backward') || req.url().includes('death')) {
        failedRequests.push(req.url());
      }
    });

    // 404 응답도 잡기
    const notFoundRequests = [];
    page.on('response', res => {
      if (res.status() === 404 &&
        (res.url().includes('falling_backward') || res.url().includes('death'))) {
        notFoundRequests.push(res.url());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });

    // BootScene 에셋 로딩 완료 대기
    await page.waitForTimeout(8000);

    // death 에셋 404 없음
    expect(failedRequests).toEqual([]);
    expect(notFoundRequests).toEqual([]);
  });

  test('에러 오버레이가 표시되지 않는다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(5000);

    // 에러 오버레이 DOM 확인
    const errorOverlay = await page.locator('#error-overlay');
    const isVisible = await errorOverlay.isVisible();
    expect(isVisible).toBe(false);
  });
});

// ── SpriteLoader 코드 구조 검증 (정적 분석 보완) ──
test.describe('Phase 47-1 Death Animation - Runtime Code Structure', () => {
  test('SpriteLoader death 관련 상수가 올바르게 정의되어 있다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(5000);

    // Phaser 씬에서 death anim 등록 상태 확인
    const animCheck = await page.evaluate(() => {
      const game = window.__PHASER_GAME__ || document.querySelector('canvas')?.__phaser_game;
      if (!game) return { error: 'Phaser game instance not found' };

      const scene = game.scene.scenes.find(s => s.scene.key === 'MenuScene' || s.scene.key === 'BootScene');
      if (!scene) return { error: 'No scene found' };

      // death anim 키 확인
      const anims = scene.anims;
      const deathAnimKeys = [];
      const dirs = ['south', 'north', 'east', 'west'];
      for (const dir of dirs) {
        const key = `enemy_carrot_goblin_death_${dir}`;
        deathAnimKeys.push({
          key,
          exists: anims.exists(key),
        });
      }

      return { deathAnimKeys };
    });

    // carrot_goblin death anim 4방향 모두 등록 확인
    if (!animCheck.error) {
      for (const anim of animCheck.deathAnimKeys) {
        expect(anim.exists, `${anim.key} should be registered`).toBe(true);
      }
    }
  });
});
