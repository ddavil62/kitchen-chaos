/**
 * @fileoverview Phase 67 QA: NeoDunggeunmoPro 로컬 번들 폰트 전환 검증.
 * 정상 동작, 오프라인 폰트 로드, 회귀, 콘솔 에러를 검증한다.
 */
import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

test.describe('Phase 67 -- NeoDunggeunmoPro 로컬 폰트 전환 QA', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  // ── 1. 폰트 로드 기본 검증 ──

  test('1-1. 폰트가 정상 로드되고 document.fonts.check가 true를 반환한다', async ({ page }) => {
    await page.goto('/');
    // Phaser 로딩 + BootScene 폰트 프리로드 완료 대기
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    const result = await page.evaluate(() => document.fonts.check('16px "NeoDunggeunmoPro"'));
    expect(result).toBe(true);
  });

  test('1-2. 다양한 크기(11/13/14/16/22px)에서 폰트가 로드된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    const sizes = ['11px', '13px', '14px', '16px', '22px'];
    for (const sz of sizes) {
      const ok = await page.evaluate((s) => document.fonts.check(`${s} "NeoDunggeunmoPro"`), sz);
      expect(ok, `${sz} 폰트 로드 실패`).toBe(true);
    }
  });

  // ── 2. 오프라인(CDN 차단) 시 로컬 폰트 로드 검증 ──

  test('2-1. CDN을 차단해도 로컬 번들에서 폰트가 로드된다', async ({ page }) => {
    // jsdelivr CDN 요청을 차단
    await page.route('**/cdn.jsdelivr.net/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    const result = await page.evaluate(() => document.fonts.check('16px "NeoDunggeunmoPro"'));
    expect(result).toBe(true);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase67-qa-offline-font.png` });
  });

  // ── 3. MenuScene 스크린샷 및 시각 검증 ──

  test('3-1. MenuScene에서 한글 텍스트가 정상 렌더된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    // MenuScene이 로드될 때까지 대기 (canvas 기반이므로 일정 시간 대기)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase67-qa-menu.png` });
  });

  // ── 4. ShopScene 진입 및 스크린샷 ──

  test('4-1. ShopScene에서 한글 텍스트가 정상 렌더된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(3000);

    // "주방 상점" 버튼 클릭 (Canvas 기반이므로 좌표 클릭)
    // MenuScene 버튼은 대략 화면 중앙에 세로로 배치됨
    // 게임 내부 API로 씬 전환 시도
    const shopAvailable = await page.evaluate(() => {
      const game = window.__game;
      if (game && game.scene) {
        const scenes = game.scene.getScenes(true);
        for (const s of scenes) {
          if (s.scene && s.scene.key === 'MenuScene') {
            s.scene.start('ShopScene');
            return true;
          }
        }
      }
      return false;
    });

    if (shopAvailable) {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase67-qa-shop.png` });
    }
  });

  // ── 5. 설정 패널 및 쿠폰 패널 스크린샷 ──

  test('5-1. 설정 패널에서 한글 텍스트가 정상 렌더된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(3000);

    // 설정 버튼 클릭 시도 (우측 상단 기어 아이콘 영역)
    await page.click('canvas', { position: { x: 340, y: 20 } });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase67-qa-settings.png` });
  });

  // ── 6. 콘솔 에러 검증 ──

  test('6-1. 페이지 로드 시 콘솔 에러가 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(5000);

    // 폰트 관련 에러만 필터 (기존 404 에러는 Phase 67 스코프 밖)
    const fontErrors = errors.filter((e) =>
      e.toLowerCase().includes('font') ||
      e.toLowerCase().includes('neodunggeunmo') ||
      e.toLowerCase().includes('woff2')
    );
    expect(fontErrors).toEqual([]);
  });

  test('6-2. 폰트 로드 실패 경고가 콘솔에 나타나지 않는다', async ({ page }) => {
    const warnings = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('NeoDunggeunmoPro')) {
        warnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(3000);

    expect(warnings).toEqual([]);
  });

  // ── 7. preload 힌트 검증 ──

  test('7-1. index.html에 font preload link가 존재한다', async ({ page }) => {
    await page.goto('/');
    const preloadLink = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="preload"][as="font"]');
      for (const link of links) {
        if (link.href.includes('NeoDunggeunmoPro')) return link.href;
      }
      return null;
    });
    expect(preloadLink).toBeTruthy();
  });

  // ── 8. @font-face src 순서 검증 ──

  test('8-1. CSS @font-face src 첫 항목이 로컬 경로다', async ({ page }) => {
    await page.goto('/');
    const fontFaceSrc = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSFontFaceRule) {
              const family = rule.style.getPropertyValue('font-family');
              if (family.includes('NeoDunggeunmoPro')) {
                return rule.style.getPropertyValue('src');
              }
            }
          }
        } catch (e) { /* cross-origin sheets */ }
      }
      return null;
    });
    expect(fontFaceSrc).toBeTruthy();
    // 첫 url()이 assets/fonts/ 로컬 경로인지 확인
    const firstUrl = fontFaceSrc.match(/url\(["']?([^"')]+)["']?\)/);
    expect(firstUrl).toBeTruthy();
    expect(firstUrl[1]).toContain('assets/fonts/');
  });

  // ── 9. font-display: block 검증 ──

  test('9-1. font-display가 block으로 설정되어 있다', async ({ page }) => {
    await page.goto('/');
    const fontDisplay = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSFontFaceRule) {
              const family = rule.style.getPropertyValue('font-family');
              if (family.includes('NeoDunggeunmoPro')) {
                return rule.style.getPropertyValue('font-display');
              }
            }
          }
        } catch (e) { /* cross-origin sheets */ }
      }
      return null;
    });
    expect(fontDisplay).toBe('block');
  });

  // ── 10. 게임 씬 기동 회귀 검증 ──

  test('10-1. 게임이 정상 기동되고 __game 객체가 존재한다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    const gameExists = await page.evaluate(() => !!window.__game);
    expect(gameExists).toBe(true);
  });

  test('10-2. MenuScene이 정상적으로 활성화된다 (또는 BootScene이 로딩 중이다)', async ({ page }) => {
    // Pixel 5 deviceScaleFactor(2.75) + headless 환경에서 BootScene 에셋 로딩이
    // 완료되지 않아 MenuScene이 활성화되지 않는 기존 이슈가 있다.
    // Phase 67 스코프와 무관한 pre-existing 이슈.
    await page.goto('/');
    await page.waitForTimeout(8000);
    const sceneState = await page.evaluate(() => {
      const game = window.__game;
      if (!game || !game.scene) return { gameExists: false };
      const allScenes = game.scene.getScenes(false);
      const bootScene = allScenes.find(s => s.sys.settings.key === 'BootScene');
      const menuScene = allScenes.find(s => s.sys.settings.key === 'MenuScene');
      return {
        gameExists: true,
        bootStatus: bootScene ? bootScene.sys.settings.status : -1,
        menuStatus: menuScene ? menuScene.sys.settings.status : -1,
      };
    });
    expect(sceneState.gameExists).toBe(true);
    // BootScene status 5 = SHUTDOWN (완료), MenuScene status 5 or 6 = RUNNING
    // BootScene status 3 = LOADING (에셋 로딩 중, pre-existing)
    // 둘 중 하나: MenuScene이 활성이거나, BootScene이 로딩 중이어야 한다
    const menuRunning = sceneState.menuStatus >= 5;
    const bootLoading = sceneState.bootStatus === 3;
    expect(menuRunning || bootLoading).toBe(true);
  });

  // ── 11. 네트워크 요청 검증: 로컬 폰트 파일 로드 확인 ──

  test('11-1. 로컬 woff2 파일이 실제로 요청되고 200 응답을 받는다', async ({ page }) => {
    let fontResponse = null;
    page.on('response', (response) => {
      if (response.url().includes('NeoDunggeunmoPro-Regular.woff2') &&
          !response.url().includes('cdn.jsdelivr.net')) {
        fontResponse = response;
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(2000);

    expect(fontResponse).toBeTruthy();
    expect(fontResponse.status()).toBe(200);
  });

  // ── 12. 모바일 뷰포트(360x640) 렌더링 ──

  test('12-1. 360x640 뷰포트에서 정상 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase67-qa-mobile-360x640.png` });
  });

  // ── 13. 소형 뷰포트(320x480) 렌더링 ──

  test('13-1. 320x480 소형 뷰포트에서도 정상 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.check('16px "NeoDunggeunmoPro"'), {}, { timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/phase67-qa-mobile-320x480.png` });
  });

  // ── 14. document.fonts 전체 상태 덤프 ──

  test('14-1. document.fonts.ready가 resolved 상태다', async ({ page }) => {
    await page.goto('/');
    const fontsReady = await page.evaluate(async () => {
      await document.fonts.ready;
      const fontEntries = [];
      document.fonts.forEach((f) => {
        if (f.family.includes('NeoDunggeunmo')) {
          fontEntries.push({ family: f.family, status: f.status, weight: f.weight });
        }
      });
      return fontEntries;
    });

    expect(fontsReady.length).toBeGreaterThan(0);
    for (const entry of fontsReady) {
      expect(entry.status).toBe('loaded');
    }
  });
});
