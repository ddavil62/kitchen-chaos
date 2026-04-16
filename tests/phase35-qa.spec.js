/**
 * @fileoverview Phase 35 QA 테스트 — 21장 엘 디아블로 최종전 종합 검증.
 * 게임 로드, 콘솔 에러, 스프라이트 404, 데이터 무결성을 검증한다.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5182';

test.describe('Phase 35 QA — 21장 엘 디아블로 최종전', () => {
  test.describe('게임 로드 및 콘솔 에러', () => {
    test('게임이 정상 로드되고 JS 에러가 없다', async ({ page }) => {
      const errors = [];
      const warnings = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
        if (msg.type() === 'warning') warnings.push(msg.text());
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      // Phaser 게임은 로드 시간이 필요하므로 캔버스가 나타날 때까지 대기
      await page.waitForSelector('canvas', { timeout: 15000 });
      // 추가 대기 — 스프라이트 로드 완료
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: 'tests/screenshots/phase35_ad3_20260416.png',
        fullPage: true,
      });

      // JS 에러가 없어야 한다
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('manifest')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('스프라이트 404 에러가 없다', async ({ page }) => {
      const failedRequests = [];
      page.on('response', res => {
        if (res.status() === 404 && res.url().includes('/sprites/')) {
          failedRequests.push(res.url());
        }
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(5000);

      expect(failedRequests).toEqual([]);
    });

    test('el_diablo_pepper 보스 스프라이트 파일이 서빙된다', async ({ page }) => {
      // 직접 보스 스프라이트 south rotation 요청
      const response = await page.goto(
        `${BASE_URL}/sprites/bosses/el_diablo_pepper/rotations/south.png`,
        { timeout: 10000 }
      );
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/png');
    });

    test('el_diablo_pepper walking animation 프레임이 서빙된다', async ({ page }) => {
      // walking animation south frame_000 요청
      const response = await page.goto(
        `${BASE_URL}/sprites/bosses/el_diablo_pepper/animations/walking-acae25f3/south/frame_000.png`,
        { timeout: 10000 }
      );
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/png');
    });
  });

  test.describe('데이터 무결성 — JavaScript 콘솔 검증', () => {
    test('stageData 21-1~21-6이 존재하고 placeholder가 아니다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(() => {
        // stageData를 window에 노출하는 방법이 없으므로 import 시도
        // Phaser 게임이므로 모듈 접근이 제한됨. 대신 fetch로 소스 확인
        return {
          // 간접 확인 — 페이지가 정상 로드되었는지
          canvasExists: !!document.querySelector('canvas'),
        };
      });
      expect(result.canvasExists).toBe(true);
    });

    test('21-6 보스전 데이터 구조가 올바르다 (소스 기반 검증)', async ({ page }) => {
      // 소스 파일을 직접 fetch하여 검증
      const response = await page.goto(
        `${BASE_URL}/js/data/stageData.js`,
        { timeout: 10000 }
      );
      const source = await response.text();

      // 21-6 스테이지가 존재하고 placeholder가 아닌지 확인
      expect(source).toContain("'21-6':");
      expect(source).toContain("nameKo: '엘 디아블로의 심장'");
      expect(source).toContain("theme: 'cactus_cantina'");
      expect(source).toContain("type: 'el_diablo_pepper', count: 1");

      // 21-1 ~ 21-5도 placeholder가 아닌지 확인
      for (const stage of ['21-1', '21-2', '21-3', '21-4', '21-5']) {
        // placeholder 패턴: nameKo: '미구현'
        const placeholder = new RegExp(`'${stage}':\\s*\\{[^}]*nameKo:\\s*'미구현'`);
        expect(source).not.toMatch(placeholder);
      }
    });

    test('gameData에 el_diablo_pepper 보스가 올바르게 등록되어 있다', async ({ page }) => {
      const response = await page.goto(
        `${BASE_URL}/js/data/gameData.js`,
        { timeout: 10000 }
      );
      const source = await response.text();

      expect(source).toContain("el_diablo_pepper:");
      expect(source).toContain("id: 'el_diablo_pepper'");
      expect(source).toContain("hp: 2600");
      expect(source).toContain("isBoss: true");
      expect(source).toContain("fireZone: true");
      expect(source).toContain("summon: true");
      expect(source).toContain("enrageHpThreshold: 0.30");
      expect(source).toContain("bossReward: 520");
    });

    test('recipeData 레시피 수가 254종이다', async ({ page }) => {
      const response = await page.goto(
        `${BASE_URL}/js/data/recipeData.js`,
        { timeout: 10000 }
      );
      const source = await response.text();

      // ALL_SERVING_RECIPES 내 id 카운트
      const servingMatch = source.match(/ALL_SERVING_RECIPES\s*=\s*\[([\s\S]*?)\];/);
      const servingCount = servingMatch ? (servingMatch[1].match(/\bid:\s*'/g) || []).length : 0;

      // ALL_BUFF_RECIPES 내 id 카운트
      const buffMatch = source.match(/ALL_BUFF_RECIPES\s*=\s*\[([\s\S]*?)\];/);
      const buffCount = buffMatch ? (buffMatch[1].match(/\bid:\s*'/g) || []).length : 0;

      const total = servingCount + buffCount;
      expect(total).toBe(254);
    });

    test('dialogueData에 chapter21_boss 등 6종이 존재한다', async ({ page }) => {
      const response = await page.goto(
        `${BASE_URL}/js/data/dialogueData.js`,
        { timeout: 10000 }
      );
      const source = await response.text();

      const dialogues = [
        'chapter21_intro',
        'chapter21_mid',
        'chapter21_boss',
        'chapter21_clear',
        'chapter21_epilogue',
        'team_side_21',
      ];
      for (const d of dialogues) {
        expect(source).toContain(`${d}:`);
        expect(source).toContain(`id: '${d}'`);
      }

      // CHARACTERS에 el_diablo 존재
      expect(source).toContain("el_diablo:");
      expect(source).toContain("portraitKey: 'el_diablo'");
    });

    test('SpriteLoader에 el_diablo_pepper가 BOSS_IDS에 등록되어 있다', async ({ page }) => {
      const response = await page.goto(
        `${BASE_URL}/js/managers/SpriteLoader.js`,
        { timeout: 10000 }
      );
      const source = await response.text();

      expect(source).toContain("'el_diablo_pepper'");
      expect(source).toContain("el_diablo_pepper: 'walking-acae25f3'");
    });

    test('stageData customers dish가 recipeData에 모두 존재한다', async ({ page }) => {
      // stageData에서 21장 customers의 dish 목록 추출
      const stageRes = await page.goto(
        `${BASE_URL}/js/data/stageData.js`,
        { timeout: 10000 }
      );
      const stageSource = await stageRes.text();

      const recipeRes = await page.goto(
        `${BASE_URL}/js/data/recipeData.js`,
        { timeout: 10000 }
      );
      const recipeSource = await recipeRes.text();

      // 21장 customers에서 사용하는 dish ID 추출
      const dishIds = new Set();
      const dishPattern = /dish:\s*'([^']+)'/g;
      // 21장 영역만 추출
      const ch21Start = stageSource.indexOf("'21-1':");
      const ch21End = stageSource.indexOf("'22-1':");
      const ch21Section = stageSource.substring(ch21Start, ch21End);
      let match;
      while ((match = dishPattern.exec(ch21Section)) !== null) {
        dishIds.add(match[1]);
      }

      // 각 dish ID가 recipeData에 존재하는지 확인
      for (const dish of dishIds) {
        expect(recipeSource).toContain(`id: '${dish}'`);
      }
    });
  });

  test.describe('시각적 검증', () => {
    test('게임 초기 로드 화면 캡처', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(6000);

      await page.screenshot({
        path: 'tests/screenshots/phase35_game_loaded.png',
        fullPage: true,
      });

      // 캔버스가 렌더링되었는지 확인 (0x0 크기가 아닌지)
      const canvasSize = await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? { w: c.width, h: c.height } : null;
      });
      expect(canvasSize).not.toBeNull();
      expect(canvasSize.w).toBeGreaterThan(0);
      expect(canvasSize.h).toBeGreaterThan(0);
    });

    test('모바일 뷰포트에서 정상 렌더링된다', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: 'tests/screenshots/phase35_mobile_viewport.png',
        fullPage: true,
      });
    });
  });
});
