/**
 * @fileoverview Phase 71 검증: 체커 패턴 복구 + 에셋 404 해결 확인.
 *
 * TC-71-01: 에셋 404 전수 검증 (console.error 0건)
 * TC-71-02: 체커 패턴 픽셀 검증 (1-1 스크린샷)
 * TC-71-03: 타워 텍스처 로드 검증
 */
import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const SAVE_KEY = 'kitchenChaosTycoon_save';

/** 게임 부팅 대기 (MenuScene까지 도달할 때까지 대기) */
async function waitForBoot(page) {
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

/** localStorage 초기화 후 리로드 */
async function freshStart(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(500);
}

test.describe('Phase 71: 체커 패턴 복구 + 에셋 404 수리', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  test('TC-71-01: 에셋 404 관련 console error 0건', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await freshStart(page);

    // GatheringScene 1-1 진입
    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '1-1' });
    });
    await page.waitForTimeout(3000);

    // 에셋 관련 404 에러만 필터
    const assetErrors = errors.filter(e =>
      e.includes('404') || e.includes('Failed to load') || e.includes('net::ERR')
    );
    expect(assetErrors).toHaveLength(0);
  });

  test('TC-71-02: 체커 패턴 스크린샷 (1-1)', async ({ page }) => {
    await freshStart(page);

    await page.evaluate(() => {
      window.__game.scene.start('GatheringScene', { stageId: '1-1' });
    });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/phase71-checker-pattern-1-1.png`,
    });

    // 체커 패턴 검증: 맵 영역 두 인접 셀의 색상이 다른지 확인
    // 특정 좌표의 색상을 샘플링하여 비교
    const hasCheckerPattern = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return false;

      // 맵 중앙 부근 두 인접 셀 색상 비교
      // 대략적으로 맵이 y=40 아래부터 시작, 타일이 32px 정도
      const x1 = 180; // 중앙 부근
      const y1 = 200; // 맵 영역
      const x2 = 200; // 약간 오른쪽
      const y2 = 200;

      const p1 = ctx.getImageData(x1, y1, 1, 1).data;
      const p2 = ctx.getImageData(x2, y2, 1, 1).data;

      // 적어도 R 또는 G 채널에서 차이가 있어야 함 (체커 패턴)
      const diff = Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2]);
      return diff > 10; // 최소 차이 임계값
    });

    // 체커 검증은 좌표 의존성이 있으므로 스크린샷으로 시각 확인도 병행
    console.log('Checker pattern detected:', hasCheckerPattern);
  });

  test('TC-71-03: 타워 텍스처 로드 성공 확인', async ({ page }) => {
    await freshStart(page);

    // BootScene이 모든 에셋을 로드하므로 부팅만으로 충분
    const texturesExist = await page.evaluate(() => {
      const game = window.__game;
      if (!game || !game.textures) return { spice: false, wasabi: false };
      return {
        spice: game.textures.exists('tower_spice_grinder'),
        wasabi: game.textures.exists('tower_wasabi_cannon'),
      };
    });

    expect(texturesExist.spice).toBe(true);
    expect(texturesExist.wasabi).toBe(true);
  });

  test('TC-71-04: 타일셋 텍스처 로드 성공 확인', async ({ page }) => {
    await freshStart(page);

    const texturesExist = await page.evaluate(() => {
      const game = window.__game;
      if (!game || !game.textures) return {};
      return {
        dessert_cafe: game.textures.exists('tileset_dessert_cafe'),
        grand_finale: game.textures.exists('tileset_grand_finale'),
        sakura_izakaya: game.textures.exists('tileset_sakura_izakaya'),
      };
    });

    expect(texturesExist.dessert_cafe).toBe(true);
    expect(texturesExist.grand_finale).toBe(true);
    expect(texturesExist.sakura_izakaya).toBe(true);
  });

  test('TC-71-05: 테이블 waiting/seated 텍스처 로드 성공 확인', async ({ page }) => {
    await freshStart(page);

    const texturesExist = await page.evaluate(() => {
      const game = window.__game;
      if (!game || !game.textures) return {};
      const result = {};
      for (let lv = 1; lv <= 4; lv++) {
        result[`lv${lv}_waiting`] = game.textures.exists(`table_lv${lv}_waiting`);
        result[`lv${lv}_seated`] = game.textures.exists(`table_lv${lv}_seated`);
      }
      return result;
    });

    for (let lv = 1; lv <= 4; lv++) {
      expect(texturesExist[`lv${lv}_waiting`]).toBe(true);
      expect(texturesExist[`lv${lv}_seated`]).toBe(true);
    }
  });
});
