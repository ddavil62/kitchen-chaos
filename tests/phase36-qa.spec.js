/**
 * @fileoverview Phase 36 QA 검증 — 22장 슈가 드림랜드 게임 로드 + 콘솔 에러 + 스크린샷
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5183';

test.describe('Phase 36 QA 검증', () => {
  test('게임 로드 + 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    const warnings = [];
    const failedRequests = [];

    // 콘솔 에러 수집
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // 404 리소스 수집
    page.on('response', response => {
      if (response.status() === 404) {
        failedRequests.push(response.url());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Phaser 게임 로드 대기
    await page.waitForTimeout(5000);

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/phase36_ad3_20260416.png',
      fullPage: true,
    });

    // 콘솔 에러 출력
    if (errors.length > 0) {
      console.log('=== CONSOLE ERRORS ===');
      errors.forEach(e => console.log('  ERROR:', e));
    }
    if (warnings.length > 0) {
      console.log('=== CONSOLE WARNINGS ===');
      warnings.forEach(w => console.log('  WARN:', w));
    }
    if (failedRequests.length > 0) {
      console.log('=== 404 REQUESTS ===');
      failedRequests.forEach(u => console.log('  404:', u));
    }

    // candy_soldier, cake_witch, cacao, vanilla 관련 404 필터
    const phase36_404s = failedRequests.filter(url =>
      url.includes('candy_soldier') ||
      url.includes('cake_witch') ||
      url.includes('cacao') ||
      url.includes('vanilla')
    );

    if (phase36_404s.length > 0) {
      console.log('=== Phase 36 관련 404 에러 ===');
      phase36_404s.forEach(u => console.log('  PHASE36_404:', u));
    }

    // Phase 36 신규 에셋 관련 404가 없어야 함
    expect(phase36_404s).toEqual([]);

    // 치명적 JS 에러가 없어야 함
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') && // 무시 가능한 브라우저 경고
      !e.includes('favicon')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('모바일 뷰포트에서 로드', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: 'tests/screenshots/phase36_mobile_viewport.png',
      fullPage: true,
    });

    const criticalErrors = errors.filter(e => !e.includes('ResizeObserver'));
    expect(criticalErrors).toEqual([]);
  });
});
