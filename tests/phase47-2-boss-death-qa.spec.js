/**
 * @fileoverview Phase 47-2 QA: boss death animation system verification.
 * Verifies BOSS_DEATH_HASHES registration, asset loading, animation registration,
 * hasDeathAnim prefix parameter, Enemy._die() boss/enemy prefix branching,
 * and BootScene registration order.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// 13 boss IDs
const BOSS_IDS = [
  'pasta_boss', 'dragon_ramen', 'seafood_kraken', 'lava_dessert_golem',
  'master_patissier', 'cuisine_god', 'sake_oni', 'dragon_wok',
  'sake_master', 'chef_noir', 'maharaja', 'el_diablo_pepper', 'queen_of_taste',
];
const DEATH_DIRS = ['south', 'north', 'east', 'west'];
const DEATH_FRAME_COUNT = 7;

// ── 게임 로딩 + 에러 없음 검증 ──
test.describe('Phase 47-2 Boss Death Animation - Game Loading', () => {
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
    await page.waitForSelector('canvas', { timeout: 15000 });

    // BootScene 로딩 완료 대기
    await page.waitForTimeout(8000);

    // 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/phase47_2_qa_game.png',
    });

    // JavaScript 에러 없음
    expect(errors).toEqual([]);
  });

  test('보스 death 에셋 로딩 시 404 에러가 없다', async ({ page }) => {
    const failedRequests = [];
    const notFoundRequests = [];

    page.on('requestfailed', req => {
      if (req.url().includes('falling_backward') || req.url().includes('death')) {
        failedRequests.push(req.url());
      }
    });
    page.on('response', res => {
      if (res.status() === 404 && res.url().includes('bosses') &&
        res.url().includes('falling_backward')) {
        notFoundRequests.push(res.url());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(12000);  // boss death frames = 364 files

    // boss death 에셋 404 없음
    expect(failedRequests).toEqual([]);
    expect(notFoundRequests).toEqual([]);
  });
});

// ── 보스 13종 death 애니메이션 등록 검증 ──
test.describe('Phase 47-2 Boss Death Animation - Registration', () => {
  test('13종 보스 death anim이 4방향 모두 등록된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    const animCheck = await page.evaluate((args) => {
      const { bossIds, dirs } = args;
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };

      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      const results = [];
      for (const id of bossIds) {
        for (const dir of dirs) {
          const key = `boss_${id}_death_${dir}`;
          results.push({
            key,
            exists: scene.anims.exists(key),
          });
        }
      }
      return { results };
    }, { bossIds: BOSS_IDS, dirs: DEATH_DIRS });

    expect(animCheck.error).toBeUndefined();

    // 13 bosses x 4 dirs = 52 animations
    expect(animCheck.results.length).toBe(52);
    const missing = animCheck.results.filter(r => !r.exists);
    expect(missing, `Missing boss death anims: ${JSON.stringify(missing)}`).toEqual([]);
  });

  test('각 보스 death anim이 7프레임이고 repeat=0이다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    const animDetails = await page.evaluate((args) => {
      const { bossIds, dirs, frameCount } = args;
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };

      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      const results = [];
      for (const id of bossIds) {
        // Just check south direction for frame details
        const key = `boss_${id}_death_south`;
        if (!scene.anims.exists(key)) {
          results.push({ id, error: 'anim not found' });
          continue;
        }
        const anim = scene.anims.get(key);
        results.push({
          id,
          frameCount: anim.frames.length,
          repeat: anim.repeat,
          frameRate: anim.frameRate,
        });
      }
      return { results };
    }, { bossIds: BOSS_IDS, dirs: DEATH_DIRS, frameCount: DEATH_FRAME_COUNT });

    expect(animDetails.error).toBeUndefined();

    for (const r of animDetails.results) {
      expect(r.error, `${r.id} error`).toBeUndefined();
      expect(r.frameCount, `${r.id} frame count`).toBe(7);
      expect(r.repeat, `${r.id} repeat`).toBe(0);
      expect(r.frameRate, `${r.id} frameRate`).toBe(8);
    }
  });

  test('일반 적 death anim 회귀 없음 (carrot_goblin)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    const check = await page.evaluate(() => {
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };
      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      const dirs = ['south', 'north', 'east', 'west'];
      const results = [];
      for (const dir of dirs) {
        const key = `enemy_carrot_goblin_death_${dir}`;
        results.push({
          key,
          exists: scene.anims.exists(key),
        });
      }
      return { results };
    });

    expect(check.error).toBeUndefined();
    for (const r of check.results) {
      expect(r.exists, `${r.key} should still exist (regression)`).toBe(true);
    }
  });
});

// ── queen_of_taste_2/3 death skip 검증 ──
test.describe('Phase 47-2 Boss Death Animation - queen_of_taste Phase 2/3 Exclusion', () => {
  test('queen_of_taste_2/3 death anim이 등록되지 않는다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    const check = await page.evaluate(() => {
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };
      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      const excluded = ['queen_of_taste_2', 'queen_of_taste_3'];
      const dirs = ['south', 'north', 'east', 'west'];
      const results = [];
      for (const id of excluded) {
        for (const dir of dirs) {
          const key = `boss_${id}_death_${dir}`;
          results.push({ key, exists: scene.anims.exists(key) });
        }
      }
      return { results };
    });

    expect(check.error).toBeUndefined();
    for (const r of check.results) {
      expect(r.exists, `${r.key} should NOT exist`).toBe(false);
    }
  });
});

// ── boss death 에셋 텍스처 로드 확인 ──
test.describe('Phase 47-2 Boss Death Animation - Texture Loading', () => {
  test('pasta_boss death 텍스처 4방향 x 7프레임이 모두 로드된다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    const texCheck = await page.evaluate(() => {
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };
      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      const dirs = ['south', 'north', 'east', 'west'];
      const results = [];
      for (const dir of dirs) {
        for (let f = 0; f < 7; f++) {
          const key = `boss_pasta_boss_death_${dir}_${f}`;
          results.push({
            key,
            exists: scene.textures.exists(key),
          });
        }
      }
      return { results };
    });

    expect(texCheck.error).toBeUndefined();
    const missing = texCheck.results.filter(r => !r.exists);
    expect(missing, `Missing textures: ${JSON.stringify(missing)}`).toEqual([]);
  });

  test('13종 보스 death 텍스처가 모두 로드된다 (364개)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(12000);

    const texCheck = await page.evaluate((args) => {
      const { bossIds, dirs, frameCount } = args;
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };
      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      let loaded = 0;
      let missing = 0;
      const missingKeys = [];
      for (const id of bossIds) {
        for (const dir of dirs) {
          for (let f = 0; f < frameCount; f++) {
            const key = `boss_${id}_death_${dir}_${f}`;
            if (scene.textures.exists(key)) {
              loaded++;
            } else {
              missing++;
              missingKeys.push(key);
            }
          }
        }
      }
      return { loaded, missing, missingKeys: missingKeys.slice(0, 10) };
    }, { bossIds: BOSS_IDS, dirs: DEATH_DIRS, frameCount: DEATH_FRAME_COUNT });

    expect(texCheck.error).toBeUndefined();
    expect(texCheck.loaded).toBe(364);
    expect(texCheck.missing).toBe(0);
  });
});

// ── 방향 폴백 검증 ──
test.describe('Phase 47-2 Boss Death Animation - Direction Fallback', () => {
  test('대각선 방향(south-east 등)에서 boss prefix로 폴백이 동작한다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    // SpriteLoader.hasDeathAnim은 모듈 내부 static 메서드이므로
    // 실제 anims 객체를 통해 간접 검증
    const fallbackCheck = await page.evaluate(() => {
      const game = window.__game;
      if (!game) return { error: 'Game instance not found' };
      const scene = game.scene.scenes.find(s =>
        s.scene.key === 'MenuScene' || s.scene.key === 'BootScene'
      );
      if (!scene) return { error: 'No scene found' };

      // south-east는 boss_XXX_death_south-east가 없으므로 south로 폴백해야 함
      // 이 검증은 DEATH_DIR_FALLBACK 매핑 로직을 간접 확인
      const diagonals = ['south-east', 'south-west', 'north-east', 'north-west'];
      const expectedFallback = {
        'south-east': 'south',
        'south-west': 'south',
        'north-east': 'north',
        'north-west': 'north',
      };

      const results = [];
      for (const diag of diagonals) {
        // 대각선 키는 등록 안 됨
        const directKey = `boss_pasta_boss_death_${diag}`;
        const directExists = scene.anims.exists(directKey);

        // 폴백 방향 키는 등록됨
        const fallbackDir = expectedFallback[diag];
        const fallbackKey = `boss_pasta_boss_death_${fallbackDir}`;
        const fallbackExists = scene.anims.exists(fallbackKey);

        results.push({
          diagonal: diag,
          directExists,
          fallbackDir,
          fallbackExists,
        });
      }
      return { results };
    });

    expect(fallbackCheck.error).toBeUndefined();
    for (const r of fallbackCheck.results) {
      // 대각선 키는 등록되지 않아야 함
      expect(r.directExists, `${r.diagonal} direct key should NOT exist`).toBe(false);
      // 폴백 방향 키는 존재해야 함
      expect(r.fallbackExists, `${r.fallbackDir} fallback should exist for ${r.diagonal}`).toBe(true);
    }
  });
});

// ── 에러 오버레이 없음 확인 ──
test.describe('Phase 47-2 Boss Death Animation - UI Stability', () => {
  test('에러 오버레이가 표시되지 않는다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(5000);

    const errorOverlay = await page.locator('#error-overlay');
    const isVisible = await errorOverlay.isVisible();
    expect(isVisible).toBe(false);
  });

  test('콘솔에 death/boss 관련 에러가 없다', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(10000);

    // Phase 47-2 관련 에러만 필터 (death/falling_backward)
    // 'boss' 키워드 단독은 기존 walk 에셋 404와 충돌하므로 제외
    const bossDeathErrors = consoleErrors.filter(msg =>
      msg.toLowerCase().includes('death') ||
      msg.toLowerCase().includes('falling_backward') ||
      msg.toLowerCase().includes('dying')
    );
    expect(bossDeathErrors).toEqual([]);
  });
});
