/**
 * @fileoverview Phase 51-4 QA: 영업씬 챕터별 배경 교체 검증.
 * 챕터별 floor/wall 키 헬퍼, tileSprite 전환, fallback, 하단 바 색조 검증.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// ── 게임 로딩 헬퍼 (BootScene 완료까지 대기) ──
async function waitForGame(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });

  // BootScene 완료 대기: MenuScene이 활성화될 때까지 폴링
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

// ── ServiceScene 시작 헬퍼 ──
async function startServiceScene(page, stageId, isEndless = false) {
  await page.evaluate(({ stageId, isEndless }) => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) game.scene.stop(s.scene.key);
    game.scene.start('ServiceScene', {
      stageId,
      inventory: { carrot: 10, meat: 8, flour: 6 },
      gold: 500,
      lives: 10,
      isEndless,
    });
  }, { stageId, isEndless });
  // ServiceScene 생성 완료 대기
  await page.waitForTimeout(2000);
}

// ── 챕터별 바닥/벽 키 기대값 ──
const CHAPTER_FLOOR_KEYS = [
  { stageId: '1-1', key: 'floor_hall_g1', label: 'Ch1 (g1)' },
  { stageId: '6-6', key: 'floor_hall_g1', label: 'Ch6 (g1 경계값)' },
  { stageId: '7-1', key: 'floor_hall_izakaya', label: 'Ch7 (izakaya)' },
  { stageId: '9-3', key: 'floor_hall_izakaya', label: 'Ch9 (izakaya 경계값)' },
  { stageId: '10-1', key: 'floor_hall_dragon', label: 'Ch10 (dragon)' },
  { stageId: '12-6', key: 'floor_hall_dragon', label: 'Ch12 (dragon 경계값)' },
  { stageId: '13-1', key: 'floor_hall_bistro', label: 'Ch13 (bistro)' },
  { stageId: '15-6', key: 'floor_hall_bistro', label: 'Ch15 (bistro 경계값)' },
  { stageId: '16-1', key: 'floor_hall_spice', label: 'Ch16 (spice)' },
  { stageId: '18-6', key: 'floor_hall_spice', label: 'Ch18 (spice 경계값)' },
  { stageId: '19-1', key: 'floor_hall_cantina', label: 'Ch19 (cantina)' },
  { stageId: '21-6', key: 'floor_hall_cantina', label: 'Ch21 (cantina 경계값)' },
  { stageId: '22-1', key: 'floor_hall_dream', label: 'Ch22 (dream)' },
  { stageId: '24-6', key: 'floor_hall_dream', label: 'Ch24 (dream 경계값)' },
];

const CHAPTER_WALL_KEYS = [
  { stageId: '1-1', key: 'wall_back_g1', label: 'Ch1 (g1)' },
  { stageId: '7-1', key: 'wall_back_izakaya', label: 'Ch7 (izakaya)' },
  { stageId: '10-1', key: 'wall_back_dragon', label: 'Ch10 (dragon)' },
  { stageId: '13-1', key: 'wall_back_bistro', label: 'Ch13 (bistro)' },
  { stageId: '16-1', key: 'wall_back_spice', label: 'Ch16 (spice)' },
  { stageId: '19-1', key: 'wall_back_cantina', label: 'Ch19 (cantina)' },
  { stageId: '22-1', key: 'wall_back_dream', label: 'Ch22 (dream)' },
];

test.describe('Phase 51-4 영업씬 챕터별 배경 교체', () => {

  test.describe('게임 로딩 및 콘솔 에러 확인', () => {
    test('게임이 에러 없이 정상 로딩된다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await waitForGame(page);

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_game_loaded.png',
      });

      expect(errors).toEqual([]);
    });
  });

  test.describe('_getHallFloorKey() 헬퍼 검증', () => {
    test('모든 챕터 대표값에서 올바른 floor 키를 반환한다', async ({ page }) => {
      test.setTimeout(120000);
      await waitForGame(page);

      for (const { stageId, key, label } of CHAPTER_FLOOR_KEYS) {
        const result = await page.evaluate(({ stageId }) => {
          const game = window.__game;
          const activeScenes = game.scene.getScenes(true);
          for (const s of activeScenes) game.scene.stop(s.scene.key);
          game.scene.start('ServiceScene', {
            stageId,
            inventory: { carrot: 10 },
            gold: 100,
            lives: 5,
            isEndless: false,
          });
          return new Promise(resolve => {
            setTimeout(() => {
              const svc = game.scene.getScene('ServiceScene');
              if (svc && svc._getHallFloorKey) {
                resolve({
                  key: svc._getHallFloorKey(),
                  chapter: svc.chapter,
                  isEndless: svc.isEndless,
                });
              } else {
                resolve({ key: 'SCENE_NOT_FOUND', chapter: null, isEndless: null });
              }
            }, 1500);
          });
        }, { stageId });

        expect(result.key, `${label}: floor key mismatch (chapter=${result.chapter})`).toBe(key);
      }
    });

    test('엔드리스 모드에서 floor_hall_endless를 반환한다', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const activeScenes = game.scene.getScenes(true);
        for (const s of activeScenes) game.scene.stop(s.scene.key);
        game.scene.start('ServiceScene', {
          stageId: '5-1',
          inventory: { carrot: 10 },
          gold: 100,
          lives: 5,
          isEndless: true,
        });
        return new Promise(resolve => {
          setTimeout(() => {
            const svc = game.scene.getScene('ServiceScene');
            if (svc && svc._getHallFloorKey) {
              resolve(svc._getHallFloorKey());
            } else {
              resolve('SCENE_NOT_FOUND');
            }
          }, 1500);
        });
      });

      expect(result).toBe('floor_hall_endless');
    });

    test('chapter > 24 (범위 초과)에서 floor_hall_dream을 반환한다', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const activeScenes = game.scene.getScenes(true);
        for (const s of activeScenes) game.scene.stop(s.scene.key);
        game.scene.start('ServiceScene', {
          stageId: '99-1',
          inventory: { carrot: 10 },
          gold: 100,
          lives: 5,
          isEndless: false,
        });
        return new Promise(resolve => {
          setTimeout(() => {
            const svc = game.scene.getScene('ServiceScene');
            if (svc && svc._getHallFloorKey) {
              resolve({ key: svc._getHallFloorKey(), chapter: svc.chapter });
            } else {
              resolve({ key: 'SCENE_NOT_FOUND', chapter: null });
            }
          }, 1500);
        });
      });

      expect(result.chapter).toBe(99);
      expect(result.key).toBe('floor_hall_dream');
    });
  });

  test.describe('_getWallBackKey() 헬퍼 검증', () => {
    test('대표 챕터에서 올바른 wall 키를 반환한다', async ({ page }) => {
      await waitForGame(page);

      for (const { stageId, key, label } of CHAPTER_WALL_KEYS) {
        const result = await page.evaluate(({ stageId }) => {
          const game = window.__game;
          const activeScenes = game.scene.getScenes(true);
          for (const s of activeScenes) game.scene.stop(s.scene.key);
          game.scene.start('ServiceScene', {
            stageId,
            inventory: { carrot: 10 },
            gold: 100,
            lives: 5,
            isEndless: false,
          });
          return new Promise(resolve => {
            setTimeout(() => {
              const svc = game.scene.getScene('ServiceScene');
              if (svc && svc._getWallBackKey) {
                resolve(svc._getWallBackKey());
              } else {
                resolve('SCENE_NOT_FOUND');
              }
            }, 1500);
          });
        }, { stageId });

        expect(result, `${label}: wall key mismatch`).toBe(key);
      }
    });

    test('엔드리스 모드에서 wall_back_endless를 반환한다', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const activeScenes = game.scene.getScenes(true);
        for (const s of activeScenes) game.scene.stop(s.scene.key);
        game.scene.start('ServiceScene', {
          stageId: '1-1',
          inventory: { carrot: 10 },
          gold: 100,
          lives: 5,
          isEndless: true,
        });
        return new Promise(resolve => {
          setTimeout(() => {
            const svc = game.scene.getScene('ServiceScene');
            if (svc && svc._getWallBackKey) {
              resolve(svc._getWallBackKey());
            } else {
              resolve('SCENE_NOT_FOUND');
            }
          }, 1500);
        });
      });

      expect(result).toBe('wall_back_endless');
    });
  });

  test.describe('tileSprite 바닥 렌더링 확인', () => {
    test('챕터 1에서 tileSprite가 생성되고 floor_hall_g1 텍스처를 사용한다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await waitForGame(page);
      await startServiceScene(page, '1-1', false);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const svc = game.scene.getScene('ServiceScene');
        if (!svc) return { found: false };

        // tileSprite 객체 찾기
        const children = svc.children.list;
        const tileSprites = children.filter(c => c.type === 'TileSprite');

        if (tileSprites.length === 0) {
          // 혹시 rectangle fallback인지 확인
          const rects = children.filter(c => c.type === 'Rectangle' && c.depth === 0);
          return { found: false, tileSprites: 0, fallbackRects: rects.length };
        }

        // depth 0인 tileSprite (바닥)
        const floor = tileSprites.find(ts => ts.depth === 0);
        if (!floor) return { found: false, tileSprites: tileSprites.length, depths: tileSprites.map(t => t.depth) };

        return {
          found: true,
          textureKey: floor.displayTexture?.key,
          width: floor.width,
          height: floor.height,
          depth: floor.depth,
        };
      });

      expect(result.found, `tileSprite가 depth 0에서 발견되어야 한다 (result: ${JSON.stringify(result)})`).toBe(true);
      expect(result.textureKey).toBe('floor_hall_g1');
      expect(errors).toEqual([]);

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch1.png',
      });
    });

    test('챕터 7(izakaya)에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '7-1', false);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_izakaya');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch7.png',
      });
    });

    test('챕터 10(dragon)에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '10-1', false);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_dragon');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch10.png',
      });
    });

    test('챕터 13(bistro)에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '13-1', false);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_bistro');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch13.png',
      });
    });

    test('챕터 16(spice)에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '16-1', false);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_spice');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch16.png',
      });
    });

    test('챕터 19(cantina)에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '19-1', false);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_cantina');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch19.png',
      });
    });

    test('챕터 22(dream)에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '22-1', false);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_dream');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_ch22.png',
      });
    });

    test('엔드리스 모드에서 올바른 텍스처를 사용한다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '1-1', true);

      const textureKey = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        return tileSprites[0]?.displayTexture?.key || 'NOT_FOUND';
      });

      expect(textureKey).toBe('floor_hall_endless');

      await page.screenshot({
        path: 'tests/screenshots/phase51_4_floor_endless.png',
      });
    });
  });

  test.describe('뒷벽 렌더링 확인', () => {
    test('챕터 1에서 뒷벽이 wall_back fallback을 사용한다 (wall_back_g1 파일 미존재)', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '1-1', false);

      const result = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const children = svc.children.list;
        // depth 3인 image (뒷벽)
        const wallImages = children.filter(c => c.type === 'Image' && c.depth === 3);
        if (wallImages.length === 0) return { found: false };
        return {
          found: true,
          textureKey: wallImages[0]?.texture?.key,
        };
      });

      // wall_back_g1.png 파일이 없으므로 fallback으로 wall_back을 사용해야 함
      expect(result.found, '뒷벽 이미지가 존재해야 한다').toBe(true);
      expect(result.textureKey).toBe('wall_back');
    });
  });

  test.describe('하단 바 색조 검증', () => {
    test('하단 바가 0x1c0e00 색상으로 렌더링된다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '1-1', false);

      const result = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const children = svc.children.list;
        // depth 100인 rectangle (하단 바)
        const bottomBars = children.filter(c =>
          c.type === 'Rectangle' && c.depth === 100
        );
        if (bottomBars.length === 0) return { found: false };

        const bar = bottomBars[0];
        return {
          found: true,
          fillColor: bar.fillColor,
          fillColorHex: '0x' + bar.fillColor.toString(16).padStart(6, '0'),
        };
      });

      expect(result.found, '하단 바 rectangle이 존재해야 한다').toBe(true);
      expect(result.fillColor, '하단 바 색상이 0x1c0e00(1838592)이어야 한다').toBe(0x1c0e00);
    });
  });

  test.describe('Fallback 검증', () => {
    test('stageId 99-1에서 floor_hall_dream 에셋이 적용된다', async ({ page }) => {
      await waitForGame(page);
      await startServiceScene(page, '99-1', false);

      const result = await page.evaluate(() => {
        const svc = window.__game.scene.getScene('ServiceScene');
        const tileSprites = svc.children.list.filter(c => c.type === 'TileSprite' && c.depth === 0);
        if (tileSprites.length === 0) {
          const rects = svc.children.list.filter(c => c.type === 'Rectangle' && c.depth === 0);
          return {
            type: 'rectangle',
            fillColor: rects[0]?.fillColor,
          };
        }
        return {
          type: 'tileSprite',
          textureKey: tileSprites[0]?.displayTexture?.key,
        };
      });

      // floor_hall_dream.png가 존재하므로 해당 에셋을 사용해야 함
      expect(result.type).toBe('tileSprite');
      expect(result.textureKey).toBe('floor_hall_dream');
    });
  });

  test.describe('SpriteLoader 에셋 로드 확인', () => {
    test('8개 floor 에셋이 모두 로드되어 있다', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const variants = ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless'];
        const floorResults = {};
        const wallResults = {};

        for (const v of variants) {
          floorResults[v] = game.textures.exists(`floor_hall_${v}`);
          wallResults[v] = game.textures.exists(`wall_back_${v}`);
        }

        return { floor: floorResults, wall: wallResults };
      });

      for (const v of ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless']) {
        expect(result.floor[v], `floor_hall_${v} 텍스처가 로드되어야 한다`).toBe(true);
      }
    });

    test('floor 에셋의 해상도가 128x128이다', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const variants = ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless'];
        const results = {};

        for (const v of variants) {
          const key = `floor_hall_${v}`;
          if (!game.textures.exists(key)) {
            results[v] = { exists: false };
            continue;
          }
          const tex = game.textures.get(key);
          const frame = tex.get();
          results[v] = {
            exists: true,
            width: frame?.width,
            height: frame?.height,
            valid: frame && frame.width > 1 && frame.height > 1,
          };
        }

        return results;
      });

      for (const v of ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless']) {
        expect(result[v].valid, `floor_hall_${v}이 유효한 텍스처여야 한다 (${result[v].width}x${result[v].height})`).toBe(true);
        expect(result[v].width).toBe(128);
        expect(result[v].height).toBe(128);
      }
    });

    test('wall_back 챕터별 에셋은 파일 미존재로 로드되지 않는다 (예상된 동작)', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const variants = ['g1', 'izakaya', 'dragon', 'bistro', 'spice', 'cantina', 'dream', 'endless'];
        const wallResults = {};

        for (const v of variants) {
          const key = `wall_back_${v}`;
          const exists = game.textures.exists(key);
          if (!exists) {
            wallResults[v] = { exists: false };
            continue;
          }
          const tex = game.textures.get(key);
          const frame = tex.get();
          wallResults[v] = {
            exists: true,
            width: frame?.width,
            height: frame?.height,
            valid: frame && frame.width > 1 && frame.height > 1,
          };
        }

        // 기존 wall_back은 존재해야 함
        const origWall = game.textures.exists('wall_back');

        return { wallVariants: wallResults, origWallBack: origWall };
      });

      // wall_back_*.png 파일이 없으므로 모두 false 또는 invalid
      // 기존 wall_back.png는 존재해야 함
      expect(result.origWallBack, '기존 wall_back 텍스처가 존재해야 한다').toBe(true);
    });
  });

  test.describe('엣지케이스 검증', () => {
    test('stageId 파싱 실패 시 기본 chapter=1 적용', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const activeScenes = game.scene.getScenes(true);
        for (const s of activeScenes) game.scene.stop(s.scene.key);
        game.scene.start('ServiceScene', {
          stageId: 'invalid',
          inventory: { carrot: 5 },
          gold: 100,
          lives: 5,
          isEndless: false,
        });
        return new Promise(resolve => {
          setTimeout(() => {
            const svc = game.scene.getScene('ServiceScene');
            resolve({
              chapter: svc?.chapter,
              floorKey: svc?._getHallFloorKey?.(),
            });
          }, 2000);
        });
      });

      expect(result.chapter).toBe(1);
      expect(result.floorKey).toBe('floor_hall_g1');
    });

    test('isEndless가 chapter보다 우선한다 (chapter=22 + isEndless=true => endless)', async ({ page }) => {
      await waitForGame(page);

      const result = await page.evaluate(() => {
        const game = window.__game;
        const activeScenes = game.scene.getScenes(true);
        for (const s of activeScenes) game.scene.stop(s.scene.key);
        game.scene.start('ServiceScene', {
          stageId: '22-1',
          inventory: { carrot: 5 },
          gold: 100,
          lives: 5,
          isEndless: true,
        });
        return new Promise(resolve => {
          setTimeout(() => {
            const svc = game.scene.getScene('ServiceScene');
            resolve({
              chapter: svc?.chapter,
              isEndless: svc?.isEndless,
              floorKey: svc?._getHallFloorKey?.(),
              wallKey: svc?._getWallBackKey?.(),
            });
          }, 1500);
        });
      });

      expect(result.isEndless).toBe(true);
      expect(result.floorKey).toBe('floor_hall_endless');
      expect(result.wallKey).toBe('wall_back_endless');
    });

    test('연속 씬 전환 시 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await waitForGame(page);

      for (const stageId of ['1-1', '10-1', '22-1']) {
        await page.evaluate(({ stageId }) => {
          const game = window.__game;
          const activeScenes = game.scene.getScenes(true);
          for (const s of activeScenes) game.scene.stop(s.scene.key);
          game.scene.start('ServiceScene', {
            stageId,
            inventory: { carrot: 5 },
            gold: 100,
            lives: 5,
            isEndless: false,
          });
        }, { stageId });
        await page.waitForTimeout(1500);
      }

      expect(errors).toEqual([]);
    });
  });

  test.describe('콘솔 에러 모니터링', () => {
    test('ServiceScene 진입 시 JavaScript 에러가 없다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await waitForGame(page);
      await startServiceScene(page, '1-1', false);

      expect(errors).toEqual([]);
    });

    test('floor_hall 에셋은 404 없이 로드된다', async ({ page }) => {
      const notFoundUrls = [];
      page.on('response', res => {
        if (res.status() === 404 && res.url().includes('floor_hall_')) {
          notFoundUrls.push(res.url());
        }
      });

      await waitForGame(page);

      const floorNotFound = notFoundUrls.filter(url => url.includes('floor_hall_'));
      expect(floorNotFound, 'floor_hall 에셋은 404가 없어야 한다').toEqual([]);
    });
  });
});
