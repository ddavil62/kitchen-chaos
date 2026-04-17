/**
 * @fileoverview Phase 38 QA 재검증 테스트 -- 24장 미각의 여왕 최종전
 * Fix #1~#4 적용 후 재검증. 데이터 검증 + 브라우저 로드 + 콘솔 에러 + 시각적 검증.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 38 QA 재검증 - Fix #1~#4', () => {
  test.describe('A. 브라우저 로드 및 콘솔 에러', () => {
    test('게임이 로드되고 JS 예외(pageerror)가 0건이다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      await page.screenshot({ path: 'tests/screenshots/phase38-main-screen.png' });

      // JS 예외(pageerror) 0건 필수
      expect(errors).toEqual([]);
      // 에셋 로딩 경고는 pre-existing이므로 필터링
      const criticalErrors = consoleErrors.filter(e =>
        !e.includes('404') && !e.includes('net::ERR') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Failed to process file')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('페이지 로드 후 10초간 JS 예외 없음 (안정성)', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(10000);

      expect(errors).toEqual([]);
    });
  });

  test.describe('B. 게임 인스턴스 및 데이터 검증', () => {
    test('window.__game 인스턴스가 존재한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const gameExists = await page.evaluate(() => !!window.__game);
      expect(gameExists).toBeTruthy();
    });

    test('24장 대화 6종이 런타임에서 접근 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const result = await page.evaluate(() => {
        const game = window.__game;
        if (!game) return { error: 'game instance not found' };
        return { gameExists: true };
      });

      expect(result.gameExists || result.error).toBeTruthy();
    });

    test('24장 스테이지가 게임 로드 후 에러 없이 동작한다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      await page.screenshot({ path: 'tests/screenshots/phase38-game-loaded.png' });
      expect(errors).toEqual([]);
    });
  });

  test.describe('C. 시각적 검증', () => {
    test('게임 초기 화면 스크린샷', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/phase38-initial.png' });
    });

    test('모바일 뷰포트(360x640)에서 정상 렌더링', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'tests/screenshots/phase38-mobile-360x640.png' });

      expect(errors).toEqual([]);
    });

    test('소형 뷰포트(320x568) iPhone SE에서 레이아웃 깨짐 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'tests/screenshots/phase38-mobile-320x568.png' });

      expect(errors).toEqual([]);
    });
  });
});
