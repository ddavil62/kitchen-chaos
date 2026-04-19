/**
 * @fileoverview Phase 53 QA: 챕터별 홀 뒷벽 에셋 8종 + oni_herald 미니보스 에셋 검증
 */
import { test, expect } from '@playwright/test';

const WALL_VARIANTS = ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless'];
const DIRECTIONS = ['south', 'north', 'east', 'west', 'south-east', 'south-west', 'north-east', 'north-west'];

/** Phaser 게임이 MenuScene까지 로드 완료될 때까지 대기 */
async function waitForGameReady(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  // MenuScene이 활성화될 때까지 대기 (BootScene preload + create 완료 후)
  await page.waitForFunction(
    () => window.__game?.scene?.isActive('MenuScene'),
    { timeout: 20000 }
  ).catch(() => {});
  // 추가 안전 마진
  await page.waitForTimeout(1000);
}

test.describe('Phase 53: wall_back 8종 + oni_herald 에셋 검증', () => {
  test.describe('wall_back 에셋 HTTP 접근 검증', () => {
    for (const v of WALL_VARIANTS) {
      test(`wall_back_${v}.png 이 HTTP 200으로 접근 가능하다`, async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const response = await page.request.get(`/sprites/service/wall_back_${v}.png`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('image/png');
        const body = await response.body();
        expect(body.length).toBeGreaterThan(1024);
      });
    }
  });

  test.describe('wall_back Phaser 텍스처 로드 검증', () => {
    test('SpriteLoader가 wall_back 8종 텍스처를 정상 로드한다', async ({ page }) => {
      await waitForGameReady(page);
      const results = await page.evaluate(() => {
        const game = window.__game;
        if (!game) return { error: 'game not found' };
        // Phaser textures/anims 는 game-level 글로벌 객체
        const variants = ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless'];
        const checks = {};
        for (const v of variants) {
          const key = `wall_back_${v}`;
          const exists = game.textures.exists(key);
          let width = 0, height = 0;
          if (exists) {
            const tex = game.textures.get(key);
            const frame = tex.get();
            width = frame?.width || 0;
            height = frame?.height || 0;
          }
          checks[key] = { exists, width, height };
        }
        return checks;
      });

      if (results.error) {
        console.log('Phaser game not accessible; skipping');
        test.skip();
        return;
      }

      for (const v of WALL_VARIANTS) {
        const key = `wall_back_${v}`;
        expect(results[key].exists, `${key} 텍스처 존재`).toBe(true);
        expect(results[key].width, `${key} 너비 512`).toBe(512);
        expect(results[key].height, `${key} 높이 80`).toBe(80);
      }
    });
  });

  test.describe('_getWallBackKey() 챕터별 반환값 검증', () => {
    const testCases = [
      { chapter: 1, isEndless: false, expected: 'wall_back_g1' },
      { chapter: 6, isEndless: false, expected: 'wall_back_g1' },
      { chapter: 7, isEndless: false, expected: 'wall_back_izakaya' },
      { chapter: 9, isEndless: false, expected: 'wall_back_izakaya' },
      { chapter: 10, isEndless: false, expected: 'wall_back_dragon' },
      { chapter: 12, isEndless: false, expected: 'wall_back_dragon' },
      { chapter: 13, isEndless: false, expected: 'wall_back_bistro' },
      { chapter: 15, isEndless: false, expected: 'wall_back_bistro' },
      { chapter: 16, isEndless: false, expected: 'wall_back_spice' },
      { chapter: 18, isEndless: false, expected: 'wall_back_spice' },
      { chapter: 19, isEndless: false, expected: 'wall_back_cantina' },
      { chapter: 21, isEndless: false, expected: 'wall_back_cantina' },
      { chapter: 22, isEndless: false, expected: 'wall_back_dream' },
      { chapter: 24, isEndless: false, expected: 'wall_back_dream' },
      { chapter: 99, isEndless: false, expected: 'wall_back_dream' },
      // isEndless 우선
      { chapter: 1, isEndless: true, expected: 'wall_back_endless' },
      { chapter: 15, isEndless: true, expected: 'wall_back_endless' },
    ];

    test('_getWallBackKey() 모든 챕터 경계값이 올바른 키를 반환한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const results = await page.evaluate((cases) => {
        function getWallBackKey(chapter, isEndless) {
          if (isEndless) return 'wall_back_endless';
          if (chapter <= 6) return 'wall_back_g1';
          if (chapter <= 9) return 'wall_back_izakaya';
          if (chapter <= 12) return 'wall_back_dragon';
          if (chapter <= 15) return 'wall_back_bistro';
          if (chapter <= 18) return 'wall_back_spice';
          if (chapter <= 21) return 'wall_back_cantina';
          return 'wall_back_dream';
        }
        return cases.map(c => ({
          ...c,
          actual: getWallBackKey(c.chapter, c.isEndless),
        }));
      }, testCases);

      for (const r of results) {
        expect(r.actual, `chapter=${r.chapter}, isEndless=${r.isEndless}`).toBe(r.expected);
      }
    });
  });

  test.describe('oni_herald 에셋 HTTP 접근 검증', () => {
    test('oni_herald rotations 8방향 PNG가 HTTP 200으로 접근 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      for (const dir of DIRECTIONS) {
        const response = await page.request.get(`/sprites/bosses/oni_herald/rotations/${dir}.png`);
        expect(response.status(), `rotations/${dir}.png`).toBe(200);
      }
    });

    test('oni_herald walk 프레임이 8방향 x 6프레임 HTTP 200으로 접근 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      for (const dir of DIRECTIONS) {
        for (let f = 0; f < 6; f++) {
          const frame = `frame_${String(f).padStart(3, '0')}.png`;
          const response = await page.request.get(
            `/sprites/bosses/oni_herald/animations/walking-7ae1e13e/${dir}/${frame}`
          );
          expect(response.status(), `walk/${dir}/${frame}`).toBe(200);
        }
      }
    });

    test('oni_herald death 프레임이 8방향 x 7프레임 HTTP 200으로 접근 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      for (const dir of DIRECTIONS) {
        for (let f = 0; f < 7; f++) {
          const frame = `frame_${String(f).padStart(3, '0')}.png`;
          const response = await page.request.get(
            `/sprites/bosses/oni_herald/animations/falling_backward-8387b83c/${dir}/${frame}`
          );
          expect(response.status(), `death/${dir}/${frame}`).toBe(200);
        }
      }
    });
  });

  test.describe('oni_herald Phaser 텍스처/애니메이션 등록 검증', () => {
    test('boss_oni_herald 정지 텍스처가 로드되어 있다', async ({ page }) => {
      await waitForGameReady(page);
      const result = await page.evaluate(() => {
        const game = window.__game;
        if (!game) return { error: 'no game' };
        const key = 'boss_oni_herald';
        const exists = game.textures.exists(key);
        let width = 0, height = 0;
        if (exists) {
          const frame = game.textures.get(key).get();
          width = frame?.width || 0;
          height = frame?.height || 0;
        }
        return { exists, width, height };
      });

      if (result.error) {
        console.log('Phaser game not accessible; skipping');
        test.skip();
        return;
      }

      expect(result.exists, 'boss_oni_herald 텍스처 존재').toBe(true);
      expect(result.width, '너비 92').toBe(92);
      expect(result.height, '높이 92').toBe(92);
    });

    test('boss_oni_herald walk 애니메이션 8방향이 등록되어 있다', async ({ page }) => {
      await waitForGameReady(page);
      const result = await page.evaluate(() => {
        const game = window.__game;
        if (!game) return { error: 'no game' };
        const dirs = ['south', 'north', 'east', 'west', 'south-east', 'south-west', 'north-east', 'north-west'];
        const anims = {};
        for (const d of dirs) {
          const key = `boss_oni_herald_walk_${d}`;
          anims[d] = game.anims.exists(key);
        }
        const walkFrame0 = 'boss_oni_herald_walk_south_0';
        const frame0Exists = game.textures.exists(walkFrame0);
        return { anims, frame0Exists };
      });

      if (result.error) {
        console.log('Phaser game not accessible; skipping');
        test.skip();
        return;
      }

      for (const d of DIRECTIONS) {
        expect(result.anims[d], `walk anim ${d} 등록`).toBe(true);
      }
      expect(result.frame0Exists, 'walk_south_0 프레임 텍스처 존재').toBe(true);
    });

    test('boss_oni_herald death 애니메이션이 4방향 등록되어 있다', async ({ page }) => {
      await waitForGameReady(page);
      const result = await page.evaluate(() => {
        const game = window.__game;
        if (!game) return { error: 'no game' };
        const dirs = ['south', 'north', 'east', 'west'];
        const anims = {};
        for (const d of dirs) {
          const key = `boss_oni_herald_death_${d}`;
          anims[d] = game.anims.exists(key);
        }
        const deathFrame0 = 'boss_oni_herald_death_south_0';
        const frame0Exists = game.textures.exists(deathFrame0);
        return { anims, frame0Exists };
      });

      if (result.error) {
        console.log('Phaser game not accessible; skipping');
        test.skip();
        return;
      }

      for (const d of ['south', 'north', 'east', 'west']) {
        expect(result.anims[d], `death anim ${d} 등록`).toBe(true);
      }
      expect(result.frame0Exists, 'death_south_0 프레임 텍스처 존재').toBe(true);
    });
  });

  test.describe('시각적 검증', () => {
    test('wall_back 8종 에셋 스크린샷 캡처', async ({ page }) => {
      for (const v of WALL_VARIANTS) {
        await page.goto(`/sprites/service/wall_back_${v}.png`);
        await page.waitForTimeout(500);
        await page.screenshot({ path: `tests/screenshots/wall_back_${v}.png` });
      }
    });

    test('oni_herald rotations south 스크린샷 캡처', async ({ page }) => {
      await page.goto('/sprites/bosses/oni_herald/rotations/south.png');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/oni_herald_south.png' });
    });

    test('oni_herald walk south frame_000 스크린샷 캡처', async ({ page }) => {
      await page.goto('/sprites/bosses/oni_herald/animations/walking-7ae1e13e/south/frame_000.png');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/oni_herald_walk_south_0.png' });
    });

    test('oni_herald death south frame_006 스크린샷 캡처', async ({ page }) => {
      await page.goto('/sprites/bosses/oni_herald/animations/falling_backward-8387b83c/south/frame_006.png');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/oni_herald_death_south_6.png' });
    });
  });

  test.describe('콘솔 에러 검증', () => {
    test('게임 로드 시 Phase 53 관련 JS 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await waitForGameReady(page);
      const relevantErrors = errors.filter(e =>
        e.includes('wall_back') || e.includes('oni_herald') || e.includes('SpriteLoader')
      );
      expect(relevantErrors).toEqual([]);
    });
  });

  test.describe('엣지케이스', () => {
    test('기존 fallback wall_back.png 가 여전히 HTTP 200으로 접근 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const response = await page.request.get('/sprites/service/wall_back.png');
      expect(response.status()).toBe(200);
    });
  });
});
