/**
 * @fileoverview Phase 27-2 QA 테스트: wine_specter, foie_gras_knight 적 에셋 + bistro_parisian 타일셋 + truffle 재료.
 * SpriteLoader.js 등록 정합성 + 파일 시스템 검증 + 로딩 로직 + 엣지케이스 + 회귀 테스트.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ROOT = 'C:/antigravity/kitchen-chaos';
const SPRITE_LOADER_PATH = resolve(PROJECT_ROOT, 'js/managers/SpriteLoader.js');

// ── 헬퍼 ──

async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scenes = game.scene.scenes;
    return scenes && scenes.length > 0;
  }, { timeout });
}

const WALK_DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

// ── 1. SpriteLoader.js 등록 정합성 검증 ──

test.describe('1. SpriteLoader.js 등록 정합성', () => {
  let content;

  test.beforeAll(() => {
    content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
  });

  test('AC-1: ENEMY_IDS에 wine_specter 포함', () => {
    const match = content.match(/const ENEMY_IDS\s*=\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    expect(match[1]).toContain("'wine_specter'");
  });

  test('AC-2: ENEMY_IDS에 foie_gras_knight 포함', () => {
    const match = content.match(/const ENEMY_IDS\s*=\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    expect(match[1]).toContain("'foie_gras_knight'");
  });

  test('AC-3: ENEMY_WALK_HASHES에 wine_specter = animating-aaf41951', () => {
    expect(content).toContain("wine_specter: 'animating-aaf41951'");
  });

  test('AC-4: ENEMY_WALK_HASHES에 foie_gras_knight = animating-d9b31bcd', () => {
    expect(content).toContain("foie_gras_knight: 'animating-d9b31bcd'");
  });

  test('AC-5: TILESET_IDS에 bistro_parisian 포함', () => {
    const match = content.match(/const TILESET_IDS\s*=\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    expect(match[1]).toContain("'bistro_parisian'");
  });

  test('AC-6: INGREDIENT_FILE_MAP에 truffle: truffle 포함', () => {
    expect(content).toContain("truffle: 'truffle'");
  });

  test('AC-7: ENEMY_IDS 총 27종 (기존 25 + 신규 2)', () => {
    const match = content.match(/const ENEMY_IDS\s*=\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const ids = match[1].match(/'([^']+)'/g);
    expect(ids.length).toBe(27);
  });

  test('AC-8: TILESET_IDS 총 11종 (기존 10 + 신규 1)', () => {
    const match = content.match(/const TILESET_IDS\s*=\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const ids = match[1].match(/'([^']+)'/g);
    expect(ids.length).toBe(11);
  });

  test('AC-9: INGREDIENT_FILE_MAP 총 22키 (기존 21 + truffle)', () => {
    const match = content.match(/const INGREDIENT_FILE_MAP\s*=\s*\{([\s\S]*?)\}/);
    expect(match).not.toBeNull();
    const keys = match[1].match(/(\w+)\s*:/g);
    expect(keys.length).toBe(22);
  });
});

// ── 2. 파일 구조 검증 ──

test.describe('2. 파일 구조 검증', () => {

  test.describe('wine_specter', () => {
    test('rotations/south.png 존재', () => {
      const p = resolve(PROJECT_ROOT, 'assets/enemies/wine_specter/rotations/south.png');
      expect(existsSync(p)).toBe(true);
    });

    test('animations/animating-aaf41951/ 디렉토리 존재', () => {
      const p = resolve(PROJECT_ROOT, 'assets/enemies/wine_specter/animations/animating-aaf41951');
      expect(existsSync(p)).toBe(true);
    });

    test('8방향 x 8프레임 = 64개 프레임 파일 존재', () => {
      const baseDir = resolve(PROJECT_ROOT, 'assets/enemies/wine_specter/animations/animating-aaf41951');
      let totalFrames = 0;
      for (const dir of WALK_DIRS) {
        const dirPath = resolve(baseDir, dir);
        expect(existsSync(dirPath), `${dir} 디렉토리 존재`).toBe(true);
        const files = readdirSync(dirPath).filter(f => f.startsWith('frame_') && f.endsWith('.png'));
        expect(files.length, `${dir} 프레임 수`).toBe(8);
        totalFrames += files.length;
      }
      expect(totalFrames).toBe(64);
    });

    test('8방향 rotation 이미지 모두 존재', () => {
      for (const dir of WALK_DIRS) {
        const p = resolve(PROJECT_ROOT, `assets/enemies/wine_specter/rotations/${dir}.png`);
        expect(existsSync(p), `rotations/${dir}.png`).toBe(true);
      }
    });
  });

  test.describe('foie_gras_knight', () => {
    test('rotations/south.png 존재', () => {
      const p = resolve(PROJECT_ROOT, 'assets/enemies/foie_gras_knight/rotations/south.png');
      expect(existsSync(p)).toBe(true);
    });

    test('animations/animating-d9b31bcd/ 디렉토리 존재', () => {
      const p = resolve(PROJECT_ROOT, 'assets/enemies/foie_gras_knight/animations/animating-d9b31bcd');
      expect(existsSync(p)).toBe(true);
    });

    test('8방향 x 8프레임 = 64개 프레임 파일 존재', () => {
      const baseDir = resolve(PROJECT_ROOT, 'assets/enemies/foie_gras_knight/animations/animating-d9b31bcd');
      let totalFrames = 0;
      for (const dir of WALK_DIRS) {
        const dirPath = resolve(baseDir, dir);
        expect(existsSync(dirPath), `${dir} 디렉토리 존재`).toBe(true);
        const files = readdirSync(dirPath).filter(f => f.startsWith('frame_') && f.endsWith('.png'));
        expect(files.length, `${dir} 프레임 수`).toBe(8);
        totalFrames += files.length;
      }
      expect(totalFrames).toBe(64);
    });

    test('8방향 rotation 이미지 모두 존재', () => {
      for (const dir of WALK_DIRS) {
        const p = resolve(PROJECT_ROOT, `assets/enemies/foie_gras_knight/rotations/${dir}.png`);
        expect(existsSync(p), `rotations/${dir}.png`).toBe(true);
      }
    });
  });

  test.describe('bistro_parisian', () => {
    test('bistro_parisian.png 존재 및 128x128px', () => {
      const p = resolve(PROJECT_ROOT, 'assets/tilesets/bistro_parisian.png');
      expect(existsSync(p)).toBe(true);
      const buf = readFileSync(p);
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      expect(w).toBe(128);
      expect(h).toBe(128);
    });

    test('bistro_parisian.json 존재 및 유효한 JSON', () => {
      const p = resolve(PROJECT_ROOT, 'assets/tilesets/bistro_parisian.json');
      expect(existsSync(p)).toBe(true);
      const data = JSON.parse(readFileSync(p, 'utf-8'));
      expect(data).toHaveProperty('tileset_data');
      expect(data).toHaveProperty('tile_size');
      expect(data.tile_size.width).toBe(32);
      expect(data.tile_size.height).toBe(32);
    });

    test('bistro_parisian.json tileset15 형식 (16타일)', () => {
      const data = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'assets/tilesets/bistro_parisian.json'), 'utf-8'));
      expect(data.format).toBe('tileset15');
      expect(data.tileset_data.total_tiles).toBe(16);
      expect(data.tileset_data.tiles.length).toBe(16);
    });

    test('bistro_parisian.json 구조가 기존 pasta_field.json과 동일', () => {
      const bp = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'assets/tilesets/bistro_parisian.json'), 'utf-8'));
      const pf = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'assets/tilesets/pasta_field.json'), 'utf-8'));
      // 동일한 top-level key set
      const bpKeys = Object.keys(bp).sort();
      const pfKeys = Object.keys(pf).sort();
      expect(bpKeys).toEqual(pfKeys);
    });
  });

  test.describe('truffle', () => {
    test('truffle.png 존재 및 32x32px', () => {
      const p = resolve(PROJECT_ROOT, 'assets/ingredients/truffle.png');
      expect(existsSync(p)).toBe(true);
      const buf = readFileSync(p);
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      expect(w).toBe(32);
      expect(h).toBe(32);
    });
  });
});

// ── 3. SpriteLoader 로딩 로직 검증 (HTTP 요청) ──

test.describe('3. SpriteLoader 로딩 로직 검증', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    await page.goto('/');
    await waitForGame(page);
  });

  test('wine_specter south.png HTTP 200', async ({ page }) => {
    const resp = await page.request.get('/sprites/enemies/wine_specter/rotations/south.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('image/png');
  });

  test('foie_gras_knight south.png HTTP 200', async ({ page }) => {
    const resp = await page.request.get('/sprites/enemies/foie_gras_knight/rotations/south.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('image/png');
  });

  test('wine_specter 걷기 프레임 000~005 (WALK_FRAME_COUNT=6) south 방향 HTTP 200', async ({ page }) => {
    for (let f = 0; f < 6; f++) {
      const frameName = `frame_${String(f).padStart(3, '0')}.png`;
      const url = `/sprites/enemies/wine_specter/animations/animating-aaf41951/south/${frameName}`;
      const resp = await page.request.get(url);
      expect(resp.status(), `wine_specter south ${frameName}`).toBe(200);
    }
  });

  test('foie_gras_knight 걷기 프레임 000~005 south 방향 HTTP 200', async ({ page }) => {
    for (let f = 0; f < 6; f++) {
      const frameName = `frame_${String(f).padStart(3, '0')}.png`;
      const url = `/sprites/enemies/foie_gras_knight/animations/animating-d9b31bcd/south/${frameName}`;
      const resp = await page.request.get(url);
      expect(resp.status(), `foie_gras_knight south ${frameName}`).toBe(200);
    }
  });

  test('wine_specter 8방향 모든 frame_000 HTTP 200', async ({ page }) => {
    for (const dir of WALK_DIRS) {
      const url = `/sprites/enemies/wine_specter/animations/animating-aaf41951/${dir}/frame_000.png`;
      const resp = await page.request.get(url);
      expect(resp.status(), `wine_specter ${dir}/frame_000`).toBe(200);
    }
  });

  test('foie_gras_knight 8방향 모든 frame_000 HTTP 200', async ({ page }) => {
    for (const dir of WALK_DIRS) {
      const url = `/sprites/enemies/foie_gras_knight/animations/animating-d9b31bcd/${dir}/frame_000.png`;
      const resp = await page.request.get(url);
      expect(resp.status(), `foie_gras_knight ${dir}/frame_000`).toBe(200);
    }
  });

  test('bistro_parisian.png tileset HTTP 200', async ({ page }) => {
    const resp = await page.request.get('/sprites/tilesets/bistro_parisian.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('image/png');
  });

  test('truffle.png ingredient HTTP 200', async ({ page }) => {
    const resp = await page.request.get('/sprites/ingredients/truffle.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toContain('image/png');
  });
});

// ── 4. 엣지케이스 검증 ──

test.describe('4. 엣지케이스 검증', () => {

  test('animating- prefix hash가 walking- prefix와 동일 로직으로 처리됨 (코드 분석)', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    // _loadEnemyWalkFrames에서 hash prefix 구분 로직이 없는지 확인
    // hash가 null이 아니면 그대로 경로에 사용하므로 prefix 무관
    expect(content).not.toMatch(/if.*hash.*startsWith.*walking/);
    expect(content).not.toMatch(/if.*hash.*startsWith.*animating/);
    // hash를 그대로 경로에 사용하는 패턴 확인
    expect(content).toContain('animations/${hash}/${dir}/frame_');
  });

  test('WALK_FRAME_COUNT=6이지만 animating- 에셋은 8프레임 (프레임 6,7 미로드 확인)', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    const frameCountMatch = content.match(/const WALK_FRAME_COUNT\s*=\s*(\d+)/);
    expect(frameCountMatch).not.toBeNull();
    expect(parseInt(frameCountMatch[1])).toBe(6);

    // animating- 에셋의 실제 프레임 수 확인
    const wineFrames = readdirSync(resolve(PROJECT_ROOT,
      'assets/enemies/wine_specter/animations/animating-aaf41951/south'))
      .filter(f => f.startsWith('frame_'));
    expect(wineFrames.length).toBe(8);
    // 코드는 0~5만 로드하므로 frame_006, frame_007은 dead asset
  });

  test('gameData.js에 wine_specter/foie_gras_knight enemyData 미존재 시 SpriteLoader 독립성', () => {
    // SpriteLoader는 ENEMY_IDS 배열을 순회할 뿐 gameData를 참조하지 않음
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    // gameData.js import가 없는지 확인
    expect(content).not.toContain("import.*gameData");
    expect(content).not.toContain("require.*gameData");
    // ENEMY_TYPES 참조가 없는지 확인
    expect(content).not.toContain('ENEMY_TYPES');
  });

  test('bistro_parisian이 32px 타일로 로드됨 (16px 예외 목록에 미포함)', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    // TILESET_16PX에 bistro_parisian이 포함되지 않았는지 확인
    const match16px = content.match(/const TILESET_16PX\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
    expect(match16px).not.toBeNull();
    expect(match16px[1]).not.toContain('bistro_parisian');
    // izakaya_underground만 16px인지 확인
    expect(match16px[1]).toContain('izakaya_underground');
  });
});

// ── 5. 회귀 테스트: 기존 에셋 무결성 ──

test.describe('5. 회귀 테스트', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    await page.goto('/');
    await waitForGame(page);
  });

  test('REG-1: 기존 ENEMY_IDS 25종 유지', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    const existingEnemies = [
      'carrot_goblin', 'meat_ogre', 'octopus_mage', 'chili_demon',
      'cheese_golem', 'flour_ghost', 'egg_sprite', 'rice_slime',
      'fish_knight', 'mushroom_scout', 'cheese_rat', 'shrimp_samurai',
      'tomato_bomber', 'butter_ghost', 'sugar_fairy', 'milk_phantom',
      'sushi_ninja', 'tempura_monk',
      'dumpling_warrior', 'mini_dumpling', 'wok_phantom',
      'sake_specter', 'oni_minion',
      'shadow_dragon_spawn', 'wok_guardian',
    ];
    for (const id of existingEnemies) {
      expect(content, `ENEMY_IDS에 ${id} 포함`).toContain(`'${id}'`);
    }
  });

  test('REG-2: 기존 ENEMY_WALK_HASHES 유지', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    // Phase 25-2에서 추가된 최신 기존 hash
    expect(content).toContain("shadow_dragon_spawn: 'walking-dde29672'");
    expect(content).toContain("wok_guardian: 'walking-bc1aca17'");
    // Phase 21 animating prefix
    expect(content).toContain("dumpling_warrior: 'animating-1e8cfa3d'");
  });

  test('REG-3: 기존 TILESET_IDS 10종 유지', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    const existingTilesets = [
      'pasta_field', 'oriental_bamboo', 'seafood_beach', 'volcano_lava',
      'dessert_cafe', 'grand_finale', 'sakura_izakaya',
      'chinese_palace_kitchen', 'izakaya_underground', 'dragon_lair',
    ];
    for (const id of existingTilesets) {
      expect(content, `TILESET_IDS에 ${id} 포함`).toContain(`'${id}'`);
    }
  });

  test('REG-4: 기존 재료 21종 유지', () => {
    const content = readFileSync(SPRITE_LOADER_PATH, 'utf-8');
    const existingIngredients = [
      'carrot', 'meat', 'squid', 'pepper', 'cheese', 'flour', 'egg', 'rice',
      'fish', 'mushroom', 'shrimp', 'tomato', 'butter', 'sugar', 'milk',
      'sashimi_tuna', 'wasabi', 'tofu', 'cilantro', 'sake', 'star_anise',
    ];
    for (const id of existingIngredients) {
      expect(content, `INGREDIENT_FILE_MAP에 ${id} 포함`).toContain(`${id}:`);
    }
  });

  test('REG-5: 기존 carrot_goblin south.png 정상 로드', async ({ page }) => {
    const resp = await page.request.get('/sprites/enemies/carrot_goblin/rotations/south.png');
    expect(resp.status()).toBe(200);
  });

  test('REG-6: 기존 pasta_field.png tileset 정상 로드', async ({ page }) => {
    const resp = await page.request.get('/sprites/tilesets/pasta_field.png');
    expect(resp.status()).toBe(200);
  });

  test('REG-7: 기존 carrot.png ingredient 정상 로드', async ({ page }) => {
    const resp = await page.request.get('/sprites/ingredients/carrot.png');
    expect(resp.status()).toBe(200);
  });
});

// ── 6. 시각적 검증 ──

test.describe('6. 시각적 검증', () => {
  test('wine_specter south.png 스크린샷 캡처', async ({ page }) => {
    await page.goto('/sprites/enemies/wine_specter/rotations/south.png');
    await page.screenshot({ path: 'tests/screenshots/phase27-2-wine_specter_south.png' });
  });

  test('foie_gras_knight south.png 스크린샷 캡처', async ({ page }) => {
    await page.goto('/sprites/enemies/foie_gras_knight/rotations/south.png');
    await page.screenshot({ path: 'tests/screenshots/phase27-2-foie_gras_knight_south.png' });
  });

  test('bistro_parisian.png 스크린샷 캡처', async ({ page }) => {
    await page.goto('/sprites/tilesets/bistro_parisian.png');
    await page.screenshot({ path: 'tests/screenshots/phase27-2-bistro_parisian.png' });
  });

  test('truffle.png 스크린샷 캡처', async ({ page }) => {
    await page.goto('/sprites/ingredients/truffle.png');
    await page.screenshot({ path: 'tests/screenshots/phase27-2-truffle.png' });
  });

  test('wine_specter walk frame_000 캡처', async ({ page }) => {
    await page.goto('/sprites/enemies/wine_specter/animations/animating-aaf41951/south/frame_000.png');
    await page.screenshot({ path: 'tests/screenshots/phase27-2-wine_specter_walk_frame0.png' });
  });

  test('foie_gras_knight walk frame_000 캡처', async ({ page }) => {
    await page.goto('/sprites/enemies/foie_gras_knight/animations/animating-d9b31bcd/south/frame_000.png');
    await page.screenshot({ path: 'tests/screenshots/phase27-2-foie_gras_knight_walk_frame0.png' });
  });
});

// ── 7. UI 안정성: 콘솔 에러 검증 ──

test.describe('7. UI 안정성', () => {
  test('게임 부팅 시 크리티컬 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await waitForGame(page);
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('favicon.ico')
    );
    expect(criticalErrors).toEqual([]);
  });
});
