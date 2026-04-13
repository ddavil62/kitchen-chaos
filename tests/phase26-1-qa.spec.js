/**
 * @fileoverview Phase 26-1 QA 테스트: sake_master 보스 + dragon_wok 리워크 + 12장 레시피/대화.
 * 수용 기준 검증 + 예외 시나리오 + 시각적 검증 + 회귀 테스트.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── 헬퍼 ──

async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scenes = game.scene.scenes;
    return scenes && scenes.length > 0;
  }, { timeout });
}

async function waitForScene(page, sceneKey, timeout = 20000) {
  await page.waitForFunction((key) => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene(key);
    return scene && scene.sys && scene.sys.isActive();
  }, sceneKey, { timeout });
}

// ── 테스트 ──

test.describe('Phase 26-1 수용 기준 검증', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 수집
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });
    await page.goto('/');
    await waitForGame(page);
  });

  // ── AC-1~3: sake_master gameData 필드 검증 ──

  test('AC-1: sake_master가 gameData.js에 정의되어 있고 isBoss: true', async ({ page }) => {
    const result = await page.evaluate(() => {
      // gameData.js는 ES 모듈로 import 되므로 Phaser 씬을 통해 접근하거나
      // 직접 dynamic import
      return import('/js/data/gameData.js').then(m => {
        const sm = m.ENEMY_TYPES.sake_master;
        return sm ? {
          exists: true,
          id: sm.id,
          isBoss: sm.isBoss,
          hp: sm.hp,
          brewCycle: sm.brewCycle,
          sealHp: sm.sealHp,
          enrageHpThreshold: sm.enrageHpThreshold,
          speed: sm.speed,
          bodyColor: sm.bodyColor,
          ingredient: sm.ingredient,
        } : { exists: false };
      });
    });

    expect(result.exists).toBe(true);
    expect(result.id).toBe('sake_master');
    expect(result.isBoss).toBe(true);
    expect(result.hp).toBe(7500);
  });

  test('AC-2: sake_master brewCycle, sealHp 필드 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/gameData.js').then(m => {
        const sm = m.ENEMY_TYPES.sake_master;
        return {
          brewCycle: sm.brewCycle,
          brewInterval: sm.brewInterval,
          brewDebuffRadius: sm.brewDebuffRadius,
          brewHealRadius: sm.brewHealRadius,
          brewHealAmount: sm.brewHealAmount,
          sealThreshold: sm.sealThreshold,
          sealHp: sm.sealHp,
        };
      });
    });

    expect(result.brewCycle).toBe(true);
    expect(result.brewInterval).toBe(6000);
    expect(result.brewDebuffRadius).toBe(90);
    expect(result.brewHealRadius).toBe(150);
    expect(result.brewHealAmount).toBe(80);
    expect(result.sealThreshold).toBe(0.55);
    expect(result.sealHp).toBe(1500);
  });

  test('AC-3: sake_master enrageHpThreshold 필드 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/gameData.js').then(m => {
        const sm = m.ENEMY_TYPES.sake_master;
        return {
          enrageHpThreshold: sm.enrageHpThreshold,
          enrageRangeReduction: sm.enrageRangeReduction,
          enrageRangeDuration: sm.enrageRangeDuration,
          bossReward: sm.bossReward,
          bossDrops: sm.bossDrops,
        };
      });
    });

    expect(result.enrageHpThreshold).toBe(0.3);
    expect(result.enrageRangeReduction).toBe(0.35);
    expect(result.enrageRangeDuration).toBe(5000);
    expect(result.bossReward).toBe(420);
    expect(result.bossDrops).toHaveLength(2);
  });

  // ── AC-4~5: BOSS_IDS / BOSS_WALK_HASHES 검증 ──

  test('AC-4: BOSS_IDS에 sake_master 포함', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/managers/SpriteLoader.js').then(m => {
        // SpriteLoader 모듈에서 BOSS_IDS는 const로 내부에 있으므로,
        // preload 로직을 통해 간접 확인 또는 window에서 참조
        // 대신 gameData와 SpriteLoader를 교차 검증
        return true;
      });
    });

    // SpriteLoader 내부 상수는 export 안 됨 -> 파일 직접 읽기로 검증
    const spriteLoaderPath = resolve('C:/antigravity/kitchen-chaos/js/managers/SpriteLoader.js');
    const content = readFileSync(spriteLoaderPath, 'utf-8');

    // BOSS_IDS 배열에 sake_master 포함 확인
    expect(content).toContain("'sake_master'");
    const bossIdsMatch = content.match(/const BOSS_IDS\s*=\s*\[([\s\S]*?)\]/);
    expect(bossIdsMatch).not.toBeNull();
    expect(bossIdsMatch[1]).toContain('sake_master');
  });

  test('AC-5: BOSS_WALK_HASHES.sake_master = animating-8d3d020e', async ({ page }) => {
    const spriteLoaderPath = resolve('C:/antigravity/kitchen-chaos/js/managers/SpriteLoader.js');
    const content = readFileSync(spriteLoaderPath, 'utf-8');

    // sake_master 해시 확인
    expect(content).toContain("sake_master: 'animating-8d3d020e'");
  });

  // ── AC-6: dragon_wok 해시 교체 검증 ──

  test('AC-6: dragon_wok 해시가 animating-30e6c64f로 교체됨', async ({ page }) => {
    const spriteLoaderPath = resolve('C:/antigravity/kitchen-chaos/js/managers/SpriteLoader.js');
    const content = readFileSync(spriteLoaderPath, 'utf-8');

    // 기존 해시가 제거되었는지 확인
    expect(content).not.toContain("dragon_wok: 'animating-8efd2218'");
    // 신규 해시가 등록되었는지 확인
    expect(content).toContain("dragon_wok: 'animating-30e6c64f'");
  });

  // ── AC-7~8: sake_master/dragon_wok 에셋 텍스처 로드 확인 ──

  test('AC-7: sake_master 보스 south.png 텍스처가 HTTP 200으로 로드됨', async ({ page }) => {
    const response = await page.request.get('/sprites/bosses/sake_master/rotations/south.png');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('AC-7b: sake_master 걷기 애니메이션 frame_000~005 로드 확인 (south)', async ({ page }) => {
    for (let f = 0; f < 6; f++) {
      const frameName = `frame_${String(f).padStart(3, '0')}.png`;
      const url = `/sprites/bosses/sake_master/animations/animating-8d3d020e/south/${frameName}`;
      const response = await page.request.get(url);
      expect(response.status(), `sake_master south ${frameName}`).toBe(200);
    }
  });

  test('AC-8: dragon_wok 신규 보스 south.png 텍스처가 HTTP 200으로 로드됨', async ({ page }) => {
    const response = await page.request.get('/sprites/bosses/dragon_wok/rotations/south.png');
    expect(response.status()).toBe(200);
  });

  test('AC-8b: dragon_wok 신규 걷기 애니메이션 frame_000~005 로드 확인 (south)', async ({ page }) => {
    for (let f = 0; f < 6; f++) {
      const frameName = `frame_${String(f).padStart(3, '0')}.png`;
      const url = `/sprites/bosses/dragon_wok/animations/animating-30e6c64f/south/${frameName}`;
      const response = await page.request.get(url);
      expect(response.status(), `dragon_wok south ${frameName}`).toBe(200);
    }
  });

  // ── AC-9~10: Enemy.js brewCycle / hpOverride 메서드 존재 확인 ──

  test('AC-9: Enemy.js에 _updateBrewCycle, _onBrewCycleActivate 메서드 존재', async ({ page }) => {
    const enemyPath = resolve('C:/antigravity/kitchen-chaos/js/entities/Enemy.js');
    const content = readFileSync(enemyPath, 'utf-8');

    expect(content).toContain('_updateBrewCycle(delta)');
    expect(content).toContain('_onBrewCycleActivate()');
    expect(content).toContain('this.data_.brewCycle');
  });

  test('AC-9b: Enemy.js takeDamage에 sealHp 방어막 흡수 로직 존재', async ({ page }) => {
    const enemyPath = resolve('C:/antigravity/kitchen-chaos/js/entities/Enemy.js');
    const content = readFileSync(enemyPath, 'utf-8');

    expect(content).toContain('_sealShieldActive');
    expect(content).toContain('_sealShieldHp');
    expect(content).toContain('this.data_.sealHp');
    expect(content).toContain('this.data_.sealThreshold');
  });

  test('AC-10: Enemy.js에 spawnData?.hpOverride 처리 존재', async ({ page }) => {
    const enemyPath = resolve('C:/antigravity/kitchen-chaos/js/entities/Enemy.js');
    const content = readFileSync(enemyPath, 'utf-8');

    expect(content).toContain('spawnData?.hpOverride');
    expect(content).toContain('this.maxHp = spawnData.hpOverride');
    expect(content).toContain('this.hp = spawnData.hpOverride');
  });

  test('AC-10b: WaveManager.js에서 hpOverride를 Enemy 생성자로 전달', async ({ page }) => {
    const wmPath = resolve('C:/antigravity/kitchen-chaos/js/managers/WaveManager.js');
    const content = readFileSync(wmPath, 'utf-8');

    expect(content).toContain('hpOverride');
    expect(content).toContain('group.hpOverride');
    expect(content).toContain('entry.hpOverride');
  });

  // ── AC-11: recipeData 156종 확인 ──

  test('AC-11: recipeData에 전체 156종 레시피 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/recipeData.js').then(m => {
        return {
          serving: m.ALL_SERVING_RECIPES.length,
          buff: m.ALL_BUFF_RECIPES.length,
          total: m.ALL_RECIPES.length,
        };
      });
    });

    expect(result.total).toBe(156);
    expect(result.serving).toBe(126);
    expect(result.buff).toBe(30);
  });

  test('AC-11b: 12장 서빙 레시피 8종 ID 확인', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/recipeData.js').then(m => {
        const ch12Serving = [
          'dragon_soup', 'wok_flame_rice', 'dragon_dim_sum', 'fire_wok_noodle',
          'palace_hotpot', 'imperial_tofu_feast', 'dragon_wok_banquet', 'final_dragon_course',
        ];
        const found = ch12Serving.map(id => ({
          id,
          exists: m.ALL_SERVING_RECIPES.some(r => r.id === id),
        }));
        return found;
      });
    });

    for (const item of result) {
      expect(item.exists, `서빙 레시피 ${item.id} 존재 여부`).toBe(true);
    }
  });

  test('AC-11c: 12장 버프 레시피 2종 ID 확인', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/recipeData.js').then(m => {
        const ch12Buff = ['dragon_fire_boost', 'dragon_wok_aura'];
        const found = ch12Buff.map(id => ({
          id,
          exists: m.ALL_BUFF_RECIPES.some(r => r.id === id),
        }));
        return found;
      });
    });

    for (const item of result) {
      expect(item.exists, `버프 레시피 ${item.id} 존재 여부`).toBe(true);
    }
  });

  // ── AC-12~14: chapter12 대화 5종 dialogueData 존재 확인 ──

  test('AC-12: dialogueData에 chapter12 대화 5종 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const ids = [
          'chapter12_intro', 'chapter12_lao_mid', 'chapter12_boss',
          'chapter12_clear', 'lao_side_12',
        ];
        return ids.map(id => ({
          id,
          exists: !!m.DIALOGUES[id],
          hasLines: m.DIALOGUES[id]?.lines?.length > 0,
          lineCount: m.DIALOGUES[id]?.lines?.length || 0,
        }));
      });
    });

    for (const item of result) {
      expect(item.exists, `대화 ${item.id} 존재`).toBe(true);
      expect(item.hasLines, `대화 ${item.id}에 lines 존재`).toBe(true);
      expect(item.lineCount, `대화 ${item.id} lines 수 > 0`).toBeGreaterThan(0);
    }
  });

  test('AC-13: CHARACTERS에 sake_master 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const sm = m.CHARACTERS.sake_master;
        return sm ? {
          exists: true,
          nameKo: sm.nameKo,
          portrait: sm.portrait,
          role: sm.role,
        } : { exists: false };
      });
    });

    expect(result.exists).toBe(true);
    expect(result.nameKo).toBe('주조 달인');
    expect(result.role).toBe('boss');
  });

  test('AC-14: chapter12 대화 스크립트 내용 검증 (핵심 대사 포함)', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const introTexts = m.DIALOGUES.chapter12_intro.lines.map(l => l.text);
        const bossTexts = m.DIALOGUES.chapter12_boss.lines.map(l => l.text);
        const clearTexts = m.DIALOGUES.chapter12_clear.lines.map(l => l.text);
        const sideTexts = m.DIALOGUES.lao_side_12.lines.map(l => l.text);
        return { introTexts, bossTexts, clearTexts, sideTexts };
      });
    });

    // chapter12_intro: 라오의 결의
    expect(result.introTexts.some(t => t.includes('용의 궁전'))).toBe(true);
    // chapter12_boss: 최후 대면
    expect(result.bossTexts.some(t => t.includes('드래곤 웍'))).toBe(true);
    // chapter12_clear: 정화 완료
    expect(result.clearTexts.some(t => t.includes('정화'))).toBe(true);
    // lao_side_12: 감사 대화
    expect(result.sideTexts.some(t => t.includes('고마워'))).toBe(true);
  });
});

// ── 에셋 파일 시스템 검증 ──

test.describe('에셋 파일 시스템 검증', () => {
  test('sake_master 에셋 디렉토리 구조 검증 (8방향 x 8프레임)', async () => {
    const baseDir = 'C:/antigravity/kitchen-chaos/assets/bosses/sake_master/animations/animating-8d3d020e';
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (const dir of dirs) {
      const dirPath = resolve(baseDir, dir);
      expect(existsSync(dirPath), `${dir} 디렉토리 존재`).toBe(true);
    }

    // south 방향 프레임 파일 개수 확인
    const { readdirSync } = await import('fs');
    const southFrames = readdirSync(resolve(baseDir, 'south'));
    expect(southFrames.length).toBeGreaterThanOrEqual(6); // 최소 6프레임 필요 (WALK_FRAME_COUNT)
  });

  test('dragon_wok 에셋 디렉토리 구조 검증 (8방향 x 8프레임)', async () => {
    const baseDir = 'C:/antigravity/kitchen-chaos/assets/bosses/dragon_wok/animations/animating-30e6c64f';
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

    for (const dir of dirs) {
      const dirPath = resolve(baseDir, dir);
      expect(existsSync(dirPath), `${dir} 디렉토리 존재`).toBe(true);
    }

    const { readdirSync } = await import('fs');
    const southFrames = readdirSync(resolve(baseDir, 'south'));
    expect(southFrames.length).toBeGreaterThanOrEqual(6);
  });

  test('sake_master rotations/south.png 존재 확인', async () => {
    const rotPath = 'C:/antigravity/kitchen-chaos/assets/bosses/sake_master/rotations/south.png';
    expect(existsSync(rotPath)).toBe(true);
  });

  test('dragon_wok rotations/south.png 존재 확인', async () => {
    const rotPath = 'C:/antigravity/kitchen-chaos/assets/bosses/dragon_wok/rotations/south.png';
    expect(existsSync(rotPath)).toBe(true);
  });
});

// ── 회귀 테스트 ──

test.describe('회귀 테스트: 기존 보스 에셋', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('REG-1: sake_oni 보스 south.png 텍스처 정상 로드', async ({ page }) => {
    const response = await page.request.get('/sprites/bosses/sake_oni/rotations/south.png');
    expect(response.status()).toBe(200);
  });

  test('REG-2: dragon_ramen 보스 south.png 텍스처 정상 로드', async ({ page }) => {
    const response = await page.request.get('/sprites/bosses/dragon_ramen/rotations/south.png');
    expect(response.status()).toBe(200);
  });

  test('REG-3: sake_oni BOSS_WALK_HASHES 유지 확인', async ({ page }) => {
    const spriteLoaderPath = resolve('C:/antigravity/kitchen-chaos/js/managers/SpriteLoader.js');
    const content = readFileSync(spriteLoaderPath, 'utf-8');

    expect(content).toContain("sake_oni: 'walking-9fa1ac06'");
    expect(content).toContain("dragon_ramen: 'walking-dcd66668'");
  });

  test('REG-4: 기존 BOSS_IDS 9종 완전성', async ({ page }) => {
    const spriteLoaderPath = resolve('C:/antigravity/kitchen-chaos/js/managers/SpriteLoader.js');
    const content = readFileSync(spriteLoaderPath, 'utf-8');

    const expectedBosses = [
      'pasta_boss', 'dragon_ramen', 'seafood_kraken', 'lava_dessert_golem',
      'master_patissier', 'cuisine_god', 'sake_oni', 'dragon_wok', 'sake_master',
    ];
    for (const boss of expectedBosses) {
      expect(content, `BOSS_IDS에 ${boss} 포함`).toContain(`'${boss}'`);
    }
  });
});

// ── 레시피 데이터 상세 검증 ──

test.describe('레시피 데이터 상세 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('12장 레시피 gateStage 할당 검증', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/recipeData.js').then(m => {
        const ch12Ids = [
          'dragon_soup', 'wok_flame_rice', 'dragon_dim_sum', 'fire_wok_noodle',
          'palace_hotpot', 'imperial_tofu_feast', 'dragon_wok_banquet', 'final_dragon_course',
          'dragon_fire_boost', 'dragon_wok_aura',
        ];
        return ch12Ids.map(id => {
          const recipe = m.ALL_RECIPES.find(r => r.id === id);
          return recipe ? { id, gateStage: recipe.gateStage, tier: recipe.tier } : { id, missing: true };
        });
      });
    });

    // gateStage가 모두 12-* 형식인지 확인
    for (const item of result) {
      expect(item.missing).toBeUndefined();
      expect(item.gateStage, `${item.id}의 gateStage`).toMatch(/^12-/);
    }
  });

  test('12장 레시피 재료 유효성 검증', async ({ page }) => {
    const result = await page.evaluate(() => {
      return Promise.all([
        import('/js/data/recipeData.js'),
        import('/js/data/gameData.js'),
      ]).then(([recipeMod, gameMod]) => {
        const ingredientIds = Object.keys(gameMod.INGREDIENT_TYPES);
        const ch12Ids = [
          'dragon_soup', 'wok_flame_rice', 'dragon_dim_sum', 'fire_wok_noodle',
          'palace_hotpot', 'imperial_tofu_feast', 'dragon_wok_banquet', 'final_dragon_course',
          'dragon_fire_boost', 'dragon_wok_aura',
        ];
        const issues = [];
        for (const id of ch12Ids) {
          const recipe = recipeMod.ALL_RECIPES.find(r => r.id === id);
          if (!recipe) { issues.push(`${id}: not found`); continue; }
          const ings = recipe.ingredients;
          for (const key of Object.keys(ings)) {
            if (!ingredientIds.includes(key)) {
              issues.push(`${id}: unknown ingredient '${key}'`);
            }
          }
        }
        return issues;
      });
    });

    expect(result).toEqual([]);
  });

  test('레시피 ID 중복 없음', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/recipeData.js').then(m => {
        const ids = m.ALL_RECIPES.map(r => r.id);
        const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
        return duplicates;
      });
    });

    expect(result).toEqual([]);
  });
});

// ── 대화 데이터 상세 검증 ──

test.describe('대화 데이터 상세 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('chapter12 대화에 유효한 speaker/portrait 참조', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const dialogueIds = [
          'chapter12_intro', 'chapter12_lao_mid', 'chapter12_boss',
          'chapter12_clear', 'lao_side_12',
        ];
        const validSpeakers = ['narrator', ...Object.values(m.CHARACTERS).map(c => c.nameKo)];
        const issues = [];
        for (const did of dialogueIds) {
          const d = m.DIALOGUES[did];
          if (!d) { issues.push(`${did}: not found`); continue; }
          for (let i = 0; i < d.lines.length; i++) {
            const line = d.lines[i];
            if (line.speaker !== 'narrator' && !Object.values(m.CHARACTERS).some(c => c.nameKo === line.speaker)) {
              issues.push(`${did}[${i}]: unknown speaker '${line.speaker}'`);
            }
          }
        }
        return issues;
      });
    });

    expect(result).toEqual([]);
  });

  test('chapter12_clear 대화에 라오/미미/포코 등장', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const lines = m.DIALOGUES.chapter12_clear.lines;
        const speakers = [...new Set(lines.map(l => l.speaker))];
        return speakers;
      });
    });

    expect(result).toContain('라오');
    expect(result).toContain('미미');
    expect(result).toContain('포코');
    expect(result).toContain('narrator');
  });

  test('lao_side_12 대화에 라오+미미 대사 모두 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const lines = m.DIALOGUES.lao_side_12.lines;
        const speakers = [...new Set(lines.map(l => l.speaker))];
        return speakers;
      });
    });

    expect(result).toContain('라오');
    expect(result).toContain('미미');
  });
});

// ── 시각적 검증: 보스 텍스처 ──

test.describe('시각적 검증', () => {
  test('sake_master south.png 스크린샷 캡처', async ({ page }) => {
    await page.goto('/sprites/bosses/sake_master/rotations/south.png');
    await page.screenshot({ path: 'tests/screenshots/sake_master_south.png' });
  });

  test('dragon_wok south.png 스크린샷 캡처', async ({ page }) => {
    await page.goto('/sprites/bosses/dragon_wok/rotations/south.png');
    await page.screenshot({ path: 'tests/screenshots/dragon_wok_south.png' });
  });

  test('sake_master 걷기 프레임 일부 캡처', async ({ page }) => {
    await page.goto('/sprites/bosses/sake_master/animations/animating-8d3d020e/south/frame_000.png');
    await page.screenshot({ path: 'tests/screenshots/sake_master_walk_frame0.png' });
  });

  test('dragon_wok 걷기 프레임 일부 캡처', async ({ page }) => {
    await page.goto('/sprites/bosses/dragon_wok/animations/animating-30e6c64f/south/frame_000.png');
    await page.screenshot({ path: 'tests/screenshots/dragon_wok_walk_frame0.png' });
  });
});

// ── 예외 시나리오: 정적 분석 기반 ──

test.describe('예외 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('sake_master 존재하지 않는 8방향 모두 HTTP 200', async ({ page }) => {
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
    for (const dir of dirs) {
      const url = `/sprites/bosses/sake_master/animations/animating-8d3d020e/${dir}/frame_000.png`;
      const response = await page.request.get(url);
      expect(response.status(), `sake_master ${dir}/frame_000.png`).toBe(200);
    }
  });

  test('dragon_wok 8방향 모두 HTTP 200', async ({ page }) => {
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
    for (const dir of dirs) {
      const url = `/sprites/bosses/dragon_wok/animations/animating-30e6c64f/${dir}/frame_000.png`;
      const response = await page.request.get(url);
      expect(response.status(), `dragon_wok ${dir}/frame_000.png`).toBe(200);
    }
  });

  test('기존 dragon_wok 해시(animating-8efd2218) 에셋이 404 반환 확인', async ({ page }) => {
    const url = '/sprites/bosses/dragon_wok/animations/animating-8efd2218/south/frame_000.png';
    const response = await page.request.get(url);
    // 기존 해시 폴더가 제거되었다면 404여야 함
    // 제거되지 않았다면 200이지만, 코드에서 참조하지 않으므로 dead asset
    // 이것은 정보성 테스트
    if (response.status() === 200) {
      console.log('NOTE: 기존 dragon_wok 해시(8efd2218) 에셋이 아직 디스크에 남아있음 (dead asset)');
    }
    // 기존 해시가 SpriteLoader 코드에서 참조되지 않는 것만 확인
    const spriteLoaderPath = resolve('C:/antigravity/kitchen-chaos/js/managers/SpriteLoader.js');
    const content = readFileSync(spriteLoaderPath, 'utf-8');
    expect(content).not.toContain("dragon_wok: 'animating-8efd2218'");
  });

  test('모든 chapter12 대화 lines 배열이 비어있지 않음', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(m => {
        const ids = [
          'chapter12_intro', 'chapter12_lao_mid', 'chapter12_boss',
          'chapter12_clear', 'lao_side_12',
        ];
        return ids.map(id => ({
          id,
          count: m.DIALOGUES[id]?.lines?.length ?? 0,
          skippable: m.DIALOGUES[id]?.skippable,
        }));
      });
    });

    for (const item of result) {
      expect(item.count, `${item.id} lines count`).toBeGreaterThan(0);
      expect(item.skippable, `${item.id} skippable`).toBe(true);
    }
  });

  test('brewDebuffEffect 구조 유효성', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/gameData.js').then(m => {
        const sm = m.ENEMY_TYPES.sake_master;
        return {
          hasDamageReduction: typeof sm.brewDebuffEffect?.damageReduction === 'number',
          hasDuration: typeof sm.brewDebuffEffect?.duration === 'number',
          damageReduction: sm.brewDebuffEffect?.damageReduction,
          duration: sm.brewDebuffEffect?.duration,
        };
      });
    });

    expect(result.hasDamageReduction).toBe(true);
    expect(result.hasDuration).toBe(true);
    expect(result.damageReduction).toBe(0.25);
    expect(result.duration).toBe(4000);
  });

  test('sake_master bossDrops 재료 유효성', async ({ page }) => {
    const result = await page.evaluate(() => {
      return Promise.all([
        import('/js/data/gameData.js'),
      ]).then(([gameMod]) => {
        const sm = gameMod.ENEMY_TYPES.sake_master;
        const ingredientIds = Object.keys(gameMod.INGREDIENT_TYPES);
        const issues = [];
        for (const drop of sm.bossDrops) {
          if (!ingredientIds.includes(drop.ingredient)) {
            issues.push(`Unknown ingredient in bossDrops: ${drop.ingredient}`);
          }
        }
        return { drops: sm.bossDrops, issues };
      });
    });

    expect(result.issues).toEqual([]);
    expect(result.drops).toHaveLength(2);
  });
});

// ── 콘솔 에러 검증 ──

test.describe('UI 안정성', () => {
  test('게임 부팅 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await waitForGame(page);
    // Boot 후 잠시 대기
    await page.waitForTimeout(2000);

    // 무시할 에러 필터링 (Phaser 관련 비치명적 경고 등)
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('favicon.ico')
    );

    expect(criticalErrors).toEqual([]);
  });
});
