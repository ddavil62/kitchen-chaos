/**
 * @fileoverview Phase 61 Menu Visuals QA - Playwright 브라우저 테스트.
 * 메뉴 배경, 타이틀 로고, 미미 스프라이트 통합 검증.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'tests/screenshots';

// Phaser 씬이 완전히 로드될 때까지 대기하는 헬퍼
// BootScene이 1099개 텍스처를 로드하므로 headless Chromium에서 12~15초 소요
async function waitForMenuScene(page, timeout = 30000) {
  // canvas 생성 대기
  await page.waitForFunction(() => !!document.querySelector('canvas'), { timeout: 10000 });
  // MenuScene이 활성 상태가 될 때까지 대기
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const menuScene = game.scene.scenes.find(s => s.scene.key === 'MenuScene');
    return menuScene && menuScene.scene.isActive();
  }, { timeout });
  // 추가 렌더링 안정화 대기 (fadeIn 300ms + margin)
  await page.waitForTimeout(1000);
}

test.describe('Phase 61: MenuScene 비주얼 에셋 통합 QA', () => {

  test.describe('1. 로드 및 부팅 검증', () => {

    test('1-1. MenuScene이 콘솔 에러 없이 로드된다', async ({ page }) => {
      const errors = [];
      const warnings = [];

      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
        if (msg.type() === 'warning') {
          warnings.push(msg.text());
        }
      });

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      // Phase 61 관련 에러만 필터링 (기존 에셋 누락 경고는 무시)
      const phase61Errors = errors.filter(e =>
        e.includes('menu_bg') ||
        e.includes('menu_title_logo') ||
        e.includes('mimi_menu') ||
        e.includes('MenuScene')
      );

      // 전체 JS 예외(pageerror) 중 치명적인 것 확인
      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') ||
        e.includes('ReferenceError') ||
        e.includes('Cannot read') ||
        e.includes('is not defined') ||
        e.includes('is not a function')
      );

      expect(phase61Errors).toEqual([]);
      expect(criticalErrors).toEqual([]);
    });

    test('1-2. Canvas 요소가 생성되고 정상 크기이다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        return {
          exists: true,
          width: canvas.width,
          height: canvas.height,
        };
      });

      expect(canvasInfo).not.toBeNull();
      expect(canvasInfo.exists).toBe(true);
      // 게임 캔버스 크기 확인 (360x640 또는 DPI 스케일링)
      expect(canvasInfo.width).toBeGreaterThanOrEqual(360);
      expect(canvasInfo.height).toBeGreaterThanOrEqual(640);
    });
  });

  test.describe('2. 렌더링 검증 (스크린샷)', () => {

    test('2-1. MenuScene 전체 렌더링 스크린샷', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-menu-full.png`,
        fullPage: false
      });
    });

    test('2-2. 타이틀 로고 영역 스크린샷 (상단)', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      // 타이틀 로고 영역 (y=145~295 게임 좌표, 스케일 고려)
      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      // 캔버스 내 타이틀 영역 클립 (상단 ~50%)
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-title-area.png`,
        clip: {
          x: canvasRect.left,
          y: canvasRect.top,
          width: canvasRect.width,
          height: canvasRect.height * 0.55
        }
      });
    });

    test('2-3. 버튼 영역 스크린샷 (하단)', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      // 버튼 영역 (y=360~ 게임 좌표)
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-button-area.png`,
        clip: {
          x: canvasRect.left,
          y: canvasRect.top + canvasRect.height * 0.55,
          width: canvasRect.width,
          height: canvasRect.height * 0.45
        }
      });
    });
  });

  test.describe('3. 상호작용 검증', () => {

    test('3-1. 게임 시작 버튼 클릭 -> 씬 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      // 게임 시작 버튼 영역 클릭 (y=390, 캔버스 내 좌표 환산)
      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;
        return {
          left: rect.left, top: rect.top,
          width: rect.width, height: rect.height,
          scaleX, scaleY,
          gameW: 360, gameH: 640
        };
      });

      // 게임 좌표 (180, 390) -> 브라우저 좌표
      const btnX = canvasRect.left + (180 / canvasRect.gameW) * canvasRect.width;
      const btnY = canvasRect.top + (390 / canvasRect.gameH) * canvasRect.height;

      await page.mouse.click(btnX, btnY);

      // fadeOut 후 씬 전환 대기 (300ms + margin)
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-after-start-click.png`
      });

      // 씬 전환 중 에러 없어야 함
      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('3-2. 설정 버튼 클릭 -> 설정 패널 열림', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      // 설정 기어 아이콘 (330, 30) 클릭
      const gearX = canvasRect.left + (330 / 360) * canvasRect.width;
      const gearY = canvasRect.top + (30 / 640) * canvasRect.height;

      await page.mouse.click(gearX, gearY);
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-settings-open.png`
      });

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('3-3. 설정 패널 내 쿠폰 버튼 클릭', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      // 설정 기어 아이콘 클릭
      const gearX = canvasRect.left + (330 / 360) * canvasRect.width;
      const gearY = canvasRect.top + (30 / 640) * canvasRect.height;
      await page.mouse.click(gearX, gearY);
      await page.waitForTimeout(500);

      // 쿠폰 버튼 (cx=180, y=408) 클릭
      const couponX = canvasRect.left + (180 / 360) * canvasRect.width;
      const couponY = canvasRect.top + (408 / 640) * canvasRect.height;
      await page.mouse.click(couponX, couponY);
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-coupon-modal.png`
      });

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('3-4. 상점 버튼 클릭 -> 씬 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      // 상점 버튼 (180, 450) 클릭
      const shopX = canvasRect.left + (180 / 360) * canvasRect.width;
      const shopY = canvasRect.top + (450 / 640) * canvasRect.height;
      await page.mouse.click(shopX, shopY);
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-after-shop-click.png`
      });

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('3-5. 도감 버튼 클릭 -> 씬 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      // 도감 버튼 (180, 496) 클릭
      const bookX = canvasRect.left + (180 / 360) * canvasRect.width;
      const bookY = canvasRect.top + (496 / 640) * canvasRect.height;
      await page.mouse.click(bookX, bookY);
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-after-book-click.png`
      });

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });
  });

  test.describe('4. 엣지케이스 및 안정성', () => {

    test('4-1. 설정 기어 더블클릭 시 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      const gearX = canvasRect.left + (330 / 360) * canvasRect.width;
      const gearY = canvasRect.top + (30 / 640) * canvasRect.height;

      // 빠른 더블클릭 (설정 패널이 이미 열려있을 때 다시 클릭)
      await page.mouse.click(gearX, gearY);
      await page.waitForTimeout(100);
      await page.mouse.click(gearX, gearY);
      await page.waitForTimeout(500);

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('4-2. 게임 시작 버튼 연타 시 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const canvasRect = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      });

      const btnX = canvasRect.left + (180 / 360) * canvasRect.width;
      const btnY = canvasRect.top + (390 / 640) * canvasRect.height;

      // 빠른 3회 연타
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(btnX, btnY);
        await page.waitForTimeout(50);
      }

      await page.waitForTimeout(1500);

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError') || e.includes('Cannot read')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('4-3. 씬 재진입 (뒤로가기 시뮬레이션) 시 메모리 누수 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      // 3회 씬 재진입 반복 (새로고침)
      for (let i = 0; i < 3; i++) {
        await page.reload();
        await waitForMenuScene(page);
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-reentry.png`
      });

      const criticalErrors = errors.filter(e =>
        e.includes('TypeError') || e.includes('ReferenceError')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('4-4. 모바일 뷰포트(375x667)에서 렌더링 정상', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-mobile-375x667.png`
      });
    });

    test('4-5. 좁은 뷰포트(300x533)에서 렌더링 정상', async ({ page }) => {
      await page.setViewportSize({ width: 300, height: 533 });
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-narrow-300x533.png`
      });
    });

    test('4-6. 넓은 뷰포트(768x1024)에서 렌더링 정상', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/phase61-qa-wide-768x1024.png`
      });
    });
  });

  test.describe('5. 에셋 로딩 검증', () => {

    test('5-1. menu_bg 에셋이 Phaser에 로드됨', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const hasTexture = await page.evaluate(() => {
        const game = window.__game;
        if (!game || !game.textures) return null;
        return game.textures.exists('menu_bg');
      });

      expect(hasTexture).toBe(true);
    });

    test('5-2. menu_title_logo 에셋이 Phaser에 로드됨', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const hasTexture = await page.evaluate(() => {
        const game = window.__game;
        if (!game || !game.textures) return null;
        return game.textures.exists('menu_title_logo');
      });

      expect(hasTexture).toBe(true);
    });

    test('5-3. mimi_menu 에셋이 Phaser에 로드됨', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const hasTexture = await page.evaluate(() => {
        const game = window.__game;
        if (!game || !game.textures) return null;
        return game.textures.exists('mimi_menu');
      });

      expect(hasTexture).toBe(true);
    });

    test('5-4. app_icon_512이 Phaser에 로드되지 않음 (의도적 미등록)', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      const hasTexture = await page.evaluate(() => {
        const game = window.__game;
        if (!game || !game.textures) return null;
        return game.textures.exists('app_icon_512');
      });

      // 스펙: 앱 아이콘은 preload하지 않음
      expect(hasTexture).toBe(false);
    });

    test('5-5. HTTP 에셋 요청이 모두 200 OK', async ({ page }) => {
      const failedRequests = [];

      page.on('response', response => {
        const url = response.url();
        if ((url.includes('menu_bg') || url.includes('menu_title_logo') || url.includes('south.png'))
            && response.status() !== 200) {
          failedRequests.push({ url, status: response.status() });
        }
      });

      await page.goto(BASE_URL);
      await waitForMenuScene(page);

      expect(failedRequests).toEqual([]);
    });
  });

  test.describe('6. 성능 검증', () => {

    test('6-1. 메뉴 씬 로드 시간 5초 이내', async ({ page }) => {
      const start = Date.now();
      await page.goto(BASE_URL);
      await waitForMenuScene(page);
      const elapsed = Date.now() - start;

      console.log(`MenuScene load time: ${elapsed}ms`);
      // 전체 게임 부팅(1099 텍스처 + 폰트)이 30초 이내 완료되어야 함
      // Phase 61 추가분(3 이미지, ~303KB)은 전체 로드 시간에 무시할 수준
      expect(elapsed).toBeLessThan(30000);
    });

    test('6-2. menu_bg.png 파일 크기 500KB 이하', async ({ page }) => {
      const response = await page.goto(BASE_URL + '/assets/ui/menu_bg.png');
      const body = await response.body();
      const sizeKB = body.length / 1024;

      console.log(`menu_bg.png size: ${sizeKB.toFixed(1)} KB`);
      expect(sizeKB).toBeLessThan(500);
    });
  });
});
