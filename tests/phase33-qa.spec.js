/**
 * @fileoverview Phase 33 QA -- 19장 선인장 칸티나 통합 검증.
 * 33-1: 대화 스크립트 3종 + storyData 트리거 3건
 * 33-2: 에셋 4종 (taco_bandit, burrito_juggernaut, cactus_cantina, jalapeno) + 코드 등록
 * 33-3: 스테이지 19-1~19-5 + 레시피 12종 + dodgeOnHit/chargeEnabled 메카닉
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 33 통합 검증', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });
    await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  // ═══════════════════════════════════════════════════════════════════
  // 33-1: 대화 스크립트
  // ═══════════════════════════════════════════════════════════════════

  test.describe('33-1: 대화 스크립트', () => {

    test('D1: chapter19_intro가 존재하고 lines가 8개 이상', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.chapter19_intro;
        return {
          exists: !!d,
          id: d?.id,
          lineCount: d?.lines?.length ?? 0,
          hasNarrator: d?.lines?.some(l => l.speaker === 'narrator' && l.portrait === ''),
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('chapter19_intro');
      expect(result.lineCount).toBeGreaterThanOrEqual(8);
      expect(result.hasNarrator).toBe(true);
    });

    test('D2: chapter19_mid가 존재하고 lines가 8개 이상', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.chapter19_mid;
        return {
          exists: !!d,
          id: d?.id,
          lineCount: d?.lines?.length ?? 0,
          hasNarrator: d?.lines?.some(l => l.speaker === 'narrator' && l.portrait === ''),
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('chapter19_mid');
      expect(result.lineCount).toBeGreaterThanOrEqual(8);
      expect(result.hasNarrator).toBe(true);
    });

    test('D3: team_side_19가 존재하고 lines가 6개 이상', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.team_side_19;
        return {
          exists: !!d,
          id: d?.id,
          lineCount: d?.lines?.length ?? 0,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('team_side_19');
      expect(result.lineCount).toBeGreaterThanOrEqual(6);
    });

    test('D4: 모든 19장 대화의 portraitKey가 기존 캐릭터와 일치한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES, CHARACTERS } = await import('/js/data/dialogueData.js');
        const charKeys = Object.keys(CHARACTERS);
        const issues = [];
        for (const dialogueId of ['chapter19_intro', 'chapter19_mid', 'team_side_19']) {
          const d = DIALOGUES[dialogueId];
          if (!d) { issues.push(`${dialogueId} not found`); continue; }
          for (let i = 0; i < d.lines.length; i++) {
            const line = d.lines[i];
            if (line.portraitKey && !charKeys.includes(line.portraitKey)) {
              issues.push(`${dialogueId}[${i}]: portraitKey '${line.portraitKey}' not in CHARACTERS`);
            }
          }
        }
        return issues;
      });
      expect(result).toEqual([]);
    });

    test('D5: narrator 대사에 portraitKey가 없다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const issues = [];
        for (const dialogueId of ['chapter19_intro', 'chapter19_mid', 'team_side_19']) {
          const d = DIALOGUES[dialogueId];
          if (!d) continue;
          for (let i = 0; i < d.lines.length; i++) {
            const line = d.lines[i];
            if (line.speaker === 'narrator') {
              if (line.portraitKey) issues.push(`${dialogueId}[${i}]: narrator has portraitKey`);
              if (line.portrait !== '') issues.push(`${dialogueId}[${i}]: narrator portrait != ''`);
            }
          }
        }
        return issues;
      });
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 33-1: storyData 트리거
  // ═══════════════════════════════════════════════════════════════════

  test.describe('33-1: storyData 트리거', () => {

    test('S1: 19-1 gathering_enter 트리거가 chapter19_intro를 가리킨다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'gathering_enter' && t.dialogueId === 'chapter19_intro');
        return {
          exists: !!trigger,
          once: trigger?.once,
          hasCondition: typeof trigger?.condition === 'function',
          delay: trigger?.delay,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.once).toBe(true);
      expect(result.hasCondition).toBe(true);
      expect(result.delay).toBe(400);
    });

    test('S2: 19-3 result_clear 트리거가 chapter19_mid를 가리키고 onComplete가 있다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'result_clear' && t.dialogueId === 'chapter19_mid');
        return {
          exists: !!trigger,
          once: trigger?.once,
          hasCondition: typeof trigger?.condition === 'function',
          hasOnComplete: typeof trigger?.onComplete === 'function',
          delay: trigger?.delay,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.once).toBe(true);
      expect(result.hasCondition).toBe(true);
      expect(result.hasOnComplete).toBe(true);
      expect(result.delay).toBe(800);
    });

    test('S3: merchant_enter 트리거가 team_side_19를 가리킨다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'merchant_enter' && t.dialogueId === 'team_side_19');
        return {
          exists: !!trigger,
          once: trigger?.once,
          hasCondition: typeof trigger?.condition === 'function',
        };
      });
      expect(result.exists).toBe(true);
      expect(result.once).toBe(true);
      expect(result.hasCondition).toBe(true);
    });

    test('S4: stage_first_clear 제외 목록에 19-1, 19-3가 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        // 일반 첫 클리어 트리거 (once: false인 것 -- 특수 스테이지용이 아닌 범용 트리거)
        const triggers = STORY_TRIGGERS.filter(t =>
          t.triggerPoint === 'result_clear' && t.dialogueId === 'stage_first_clear' && t.once === false);
        // 범용 트리거는 마지막 하나 (제외 목록이 가장 긴 것)
        const trigger = triggers[triggers.length - 1];
        if (!trigger) return { found: false };
        // 19-1과 19-3에서 false를 반환하는지 확인
        const ctx191 = { stageId: '19-1', isFirstClear: true, stars: 3 };
        const ctx193 = { stageId: '19-3', isFirstClear: true, stars: 3 };
        const ctxOther = { stageId: '19-2', isFirstClear: true, stars: 3 };
        const save = { storyProgress: { currentChapter: 19 } };
        return {
          found: true,
          blocks191: !trigger.condition(ctx191, save),
          blocks193: !trigger.condition(ctx193, save),
          allows192: trigger.condition(ctxOther, save),
        };
      });
      expect(result.found).toBe(true);
      expect(result.blocks191).toBe(true);
      expect(result.blocks193).toBe(true);
      expect(result.allows192).toBe(true);
    });

    test('S5: 트리거 dialogueId가 dialogueData 키와 전부 일치', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const ch19triggers = STORY_TRIGGERS.filter(t =>
          ['chapter19_intro', 'chapter19_mid', 'team_side_19'].includes(t.dialogueId));
        const missing = ch19triggers
          .filter(t => !DIALOGUES[t.dialogueId])
          .map(t => t.dialogueId);
        return { count: ch19triggers.length, missing };
      });
      expect(result.count).toBe(3);
      expect(result.missing).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 33-2: 에셋 + 코드 등록
  // ═══════════════════════════════════════════════════════════════════

  test.describe('33-2: 에셋 및 데이터 등록', () => {

    test('E1: taco_bandit ENEMY_TYPES 데이터가 올바르다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const e = ENEMY_TYPES.taco_bandit;
        return {
          exists: !!e,
          id: e?.id,
          hp: e?.hp,
          speed: e?.speed,
          ingredient: e?.ingredient,
          dodgeOnHit: e?.dodgeOnHit,
          dodgeChance: e?.dodgeChance,
          canvasSize: e?.canvasSize,
          group: e?.group,
          reward: e?.reward,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('taco_bandit');
      expect(result.hp).toBe(300);
      expect(result.speed).toBe(115);
      expect(result.ingredient).toBe('jalapeno');
      expect(result.dodgeOnHit).toBe(true);
      expect(result.dodgeChance).toBe(0.25);
      expect(result.canvasSize).toBeGreaterThan(0);
    });

    test('E2: burrito_juggernaut ENEMY_TYPES 데이터가 올바르다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const e = ENEMY_TYPES.burrito_juggernaut;
        return {
          exists: !!e,
          id: e?.id,
          hp: e?.hp,
          speed: e?.speed,
          ingredient: e?.ingredient,
          chargeEnabled: e?.chargeEnabled,
          chargeInterval: e?.chargeInterval,
          chargeSpeedMultiplier: e?.chargeSpeedMultiplier,
          chargeRadius: e?.chargeRadius,
          chargeTowerDamage: e?.chargeTowerDamage,
          canvasSize: e?.canvasSize,
          group: e?.group,
          reward: e?.reward,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('burrito_juggernaut');
      expect(result.hp).toBe(580);
      expect(result.speed).toBe(38);
      expect(result.ingredient).toBe('jalapeno');
      expect(result.chargeEnabled).toBe(true);
      expect(result.chargeInterval).toBe(8000);
      expect(result.chargeSpeedMultiplier).toBe(2.0);
      expect(result.chargeRadius).toBe(48);
      expect(result.chargeTowerDamage).toBe(0.15);
      expect(result.canvasSize).toBeGreaterThan(0);
    });

    test('E3: INGREDIENT_TYPES에 jalapeno가 존재한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { INGREDIENT_TYPES } = await import('/js/data/gameData.js');
        const i = INGREDIENT_TYPES.jalapeno;
        return {
          exists: !!i,
          id: i?.id,
          nameKo: i?.nameKo,
          icon: i?.icon,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('jalapeno');
      expect(result.nameKo).toBe('할라피뇨');
      expect(result.icon).toContain('jalapeno.png');
    });

    test('E4: SpriteLoader 소스에 taco_bandit, burrito_juggernaut ENEMY_IDS 등록', async ({ page }) => {
      // SpriteLoader 상수는 모듈 스코프 const라 외부 접근 불가 -- 소스 텍스트로 검증
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      expect(src).toContain("'taco_bandit'");
      expect(src).toContain("'burrito_juggernaut'");
      // ENEMY_IDS 배열 내부에 있는지 (주석이 아닌 실제 코드)
      const enemyIdsMatch = src.match(/const ENEMY_IDS\s*=\s*\[([\s\S]*?)\];/);
      expect(enemyIdsMatch).not.toBeNull();
      expect(enemyIdsMatch[1]).toContain('taco_bandit');
      expect(enemyIdsMatch[1]).toContain('burrito_juggernaut');
    });

    test('E5: SpriteLoader ENEMY_WALK_HASHES에 animating- 접두어 해시 등록', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      const tacoMatch = src.match(/taco_bandit:\s*'(animating-[0-9a-f]+)'/);
      const burritoMatch = src.match(/burrito_juggernaut:\s*'(animating-[0-9a-f]+)'/);
      expect(tacoMatch).not.toBeNull();
      expect(tacoMatch[1]).toMatch(/^animating-[0-9a-f]{8}$/);
      expect(burritoMatch).not.toBeNull();
      expect(burritoMatch[1]).toMatch(/^animating-[0-9a-f]{8}$/);
    });

    test('E6: SpriteLoader TILESET_IDS에 cactus_cantina 포함', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      const tilesetMatch = src.match(/const TILESET_IDS\s*=\s*\[([\s\S]*?)\];/);
      expect(tilesetMatch).not.toBeNull();
      expect(tilesetMatch[1]).toContain('cactus_cantina');
    });

    test('E7: SpriteLoader INGREDIENT_FILE_MAP에 jalapeno 매핑', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      const mapMatch = src.match(/const INGREDIENT_FILE_MAP\s*=\s*\{([\s\S]*?)\};/);
      expect(mapMatch).not.toBeNull();
      expect(mapMatch[1]).toContain("jalapeno: 'jalapeno'");
    });

    test('E8: 에셋 파일이 HTTP로 접근 가능하다', async ({ page }) => {
      const urls = [
        '/assets/enemies/taco_bandit/rotations/south.png',
        '/assets/enemies/burrito_juggernaut/rotations/south.png',
        '/assets/tilesets/cactus_cantina.png',
        '/assets/ingredients/jalapeno.png',
      ];
      const results = [];
      for (const url of urls) {
        const resp = await page.request.get(`http://localhost:5174${url}`);
        results.push({ url, status: resp.status() });
      }
      for (const r of results) {
        expect(r.status, `${r.url} should return 200`).toBe(200);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 33-3: 스테이지 데이터
  // ═══════════════════════════════════════════════════════════════════

  test.describe('33-3: 스테이지 데이터', () => {

    test('ST1: 19-1~19-5가 placeholder가 아닌 실제 스테이지', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const stageIds = ['19-1', '19-2', '19-3', '19-4', '19-5'];
        return stageIds.map(id => {
          const s = STAGES[id];
          return {
            id,
            exists: !!s,
            theme: s?.theme,
            isPlaceholder: s?.theme === 'placeholder',
            hasWaves: Array.isArray(s?.waves) && s.waves.length > 0,
            hasCustomers: Array.isArray(s?.customers) && s.customers.length > 0,
            hasService: !!s?.service,
            hasStarThresholds: !!s?.starThresholds,
            hasPathSegments: Array.isArray(s?.pathSegments) && s.pathSegments.length > 0,
          };
        });
      });
      for (const s of result) {
        expect(s.exists, `${s.id} exists`).toBe(true);
        expect(s.isPlaceholder, `${s.id} not placeholder`).toBe(false);
        expect(s.theme, `${s.id} theme`).toBe('cactus_cantina');
        expect(s.hasWaves, `${s.id} has waves`).toBe(true);
        expect(s.hasCustomers, `${s.id} has customers`).toBe(true);
        expect(s.hasService, `${s.id} has service`).toBe(true);
        expect(s.hasStarThresholds, `${s.id} has starThresholds`).toBe(true);
        expect(s.hasPathSegments, `${s.id} has pathSegments`).toBe(true);
      }
    });

    test('ST2: 19-6은 placeholder를 유지한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['19-6'];
        return { theme: s?.theme, nameKo: s?.nameKo };
      });
      expect(result.theme).toBe('placeholder');
    });

    test('ST3: 19-3 wave 3~5에 taco_bandit이 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['19-3'];
        return [3, 4, 5].map(w => {
          const wave = s.waves.find(wv => wv.wave === w);
          return {
            wave: w,
            hasTacoBandit: wave?.enemies?.some(e => e.type === 'taco_bandit'),
          };
        });
      });
      for (const w of result) {
        expect(w.hasTacoBandit, `wave ${w.wave} has taco_bandit`).toBe(true);
      }
    });

    test('ST4: 19-4 wave 2~5에 burrito_juggernaut이 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['19-4'];
        return [2, 3, 4, 5].map(w => {
          const wave = s.waves.find(wv => wv.wave === w);
          return {
            wave: w,
            hasBurrito: wave?.enemies?.some(e => e.type === 'burrito_juggernaut'),
          };
        });
      });
      for (const w of result) {
        expect(w.hasBurrito, `wave ${w.wave} has burrito_juggernaut`).toBe(true);
      }
    });

    test('ST5: 19-5 wave 1~5에 taco_bandit + burrito_juggernaut 양쪽 포함', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['19-5'];
        return s.waves.map(wv => ({
          wave: wv.wave,
          hasTaco: wv.enemies.some(e => e.type === 'taco_bandit'),
          hasBurrito: wv.enemies.some(e => e.type === 'burrito_juggernaut'),
        }));
      });
      for (const w of result) {
        expect(w.hasTaco, `wave ${w.wave} has taco_bandit`).toBe(true);
        expect(w.hasBurrito, `wave ${w.wave} has burrito_juggernaut`).toBe(true);
      }
    });

    test('ST6: 19-1 service.duration이 346~354 범위', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        return STAGES['19-1'].service.duration;
      });
      expect(result).toBeGreaterThanOrEqual(346);
      expect(result).toBeLessThanOrEqual(354);
    });

    test('ST7: 19-5 service.duration이 372~378 범위', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        return STAGES['19-5'].service.duration;
      });
      expect(result).toBeGreaterThanOrEqual(372);
      expect(result).toBeLessThanOrEqual(378);
    });

    test('ST8: 모든 19장 customers dish가 RECIPE_MAP에 존재', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const { ALL_SERVING_RECIPES } = await import('/js/data/recipeData.js');
        const recipeIds = new Set(ALL_SERVING_RECIPES.map(r => r.id));
        const missing = [];
        for (const stageId of ['19-1', '19-2', '19-3', '19-4', '19-5']) {
          const stage = STAGES[stageId];
          for (const cw of stage.customers) {
            for (const c of cw.customers) {
              if (!recipeIds.has(c.dish)) {
                missing.push(`${stageId} wave ${cw.wave}: ${c.dish}`);
              }
            }
          }
        }
        return missing;
      });
      expect(result).toEqual([]);
    });

    test('ST9: 19장 service 값이 단계적으로 상승한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const ids = ['19-1', '19-2', '19-3', '19-4', '19-5'];
        return ids.map(id => ({
          id,
          duration: STAGES[id].service.duration,
          maxCustomers: STAGES[id].service.maxCustomers,
        }));
      });
      // duration and maxCustomers should monotonically increase
      for (let i = 1; i < result.length; i++) {
        expect(result[i].duration, `${result[i].id} duration >= ${result[i-1].id}`)
          .toBeGreaterThanOrEqual(result[i-1].duration);
        expect(result[i].maxCustomers, `${result[i].id} maxCustomers >= ${result[i-1].id}`)
          .toBeGreaterThanOrEqual(result[i-1].maxCustomers);
      }
    });

    test('ST10: 19장 모든 wave에 사용된 적 ID가 ENEMY_TYPES에 존재', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const missing = [];
        for (const stageId of ['19-1', '19-2', '19-3', '19-4', '19-5']) {
          const stage = STAGES[stageId];
          for (const wv of stage.waves) {
            for (const e of wv.enemies) {
              if (!ENEMY_TYPES[e.type]) {
                missing.push(`${stageId} wave ${wv.wave}: enemy ${e.type} not in ENEMY_TYPES`);
              }
            }
          }
        }
        return missing;
      });
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 33-3: 레시피 데이터
  // ═══════════════════════════════════════════════════════════════════

  test.describe('33-3: 레시피 데이터', () => {

    test('R1: 서빙 레시피 10종이 ALL_SERVING_RECIPES에 존재', async ({ page }) => {
      const expectedIds = [
        'jalapeno_salsa', 'jalapeno_cornbread', 'nachos_fuego', 'guacamole_bowl',
        'taco_supreme', 'enchilada_roja', 'cantina_platter', 'burrito_grande',
        'cactus_grand_feast', 'desert_cantina_banquet',
      ];
      const result = await page.evaluate(async (ids) => {
        const { ALL_SERVING_RECIPES } = await import('/js/data/recipeData.js');
        const existingIds = new Set(ALL_SERVING_RECIPES.map(r => r.id));
        return ids.map(id => ({ id, exists: existingIds.has(id) }));
      }, expectedIds);
      for (const r of result) {
        expect(r.exists, `recipe ${r.id} exists`).toBe(true);
      }
    });

    test('R2: 버프 레시피 2종이 ALL_BUFF_RECIPES에 존재', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_BUFF_RECIPES } = await import('/js/data/recipeData.js');
        const ids = ALL_BUFF_RECIPES.map(r => r.id);
        return {
          hasSalsa: ids.includes('salsa_boost'),
          hasFuego: ids.includes('fuego_blessing'),
        };
      });
      expect(result.hasSalsa).toBe(true);
      expect(result.hasFuego).toBe(true);
    });

    test('R3: jalapeno 레시피들의 ingredients에 jalapeno이 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES } = await import('/js/data/recipeData.js');
        const allRecipes = [...ALL_SERVING_RECIPES, ...ALL_BUFF_RECIPES];
        const jalapenoRecipes = allRecipes.filter(r =>
          ['jalapeno_salsa', 'jalapeno_cornbread', 'nachos_fuego', 'guacamole_bowl',
           'taco_supreme', 'enchilada_roja', 'cantina_platter', 'burrito_grande',
           'cactus_grand_feast', 'desert_cantina_banquet', 'salsa_boost', 'fuego_blessing'
          ].includes(r.id));
        const issues = [];
        for (const r of jalapenoRecipes) {
          if (!r.ingredients?.jalapeno || r.ingredients.jalapeno < 1) {
            issues.push(`${r.id}: missing jalapeno ingredient`);
          }
        }
        return { count: jalapenoRecipes.length, issues };
      });
      expect(result.count).toBe(12);
      expect(result.issues).toEqual([]);
    });

    test('R4: gateStage가 19-x 범위 내에 있다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES } = await import('/js/data/recipeData.js');
        const phase33Ids = [
          'jalapeno_salsa', 'jalapeno_cornbread', 'nachos_fuego', 'guacamole_bowl',
          'taco_supreme', 'enchilada_roja', 'cantina_platter', 'burrito_grande',
          'cactus_grand_feast', 'desert_cantina_banquet', 'salsa_boost', 'fuego_blessing'
        ];
        const allRecipes = [...ALL_SERVING_RECIPES, ...ALL_BUFF_RECIPES];
        const issues = [];
        for (const r of allRecipes.filter(r => phase33Ids.includes(r.id))) {
          if (!r.gateStage || !r.gateStage.startsWith('19-')) {
            issues.push(`${r.id}: gateStage is ${r.gateStage}`);
          }
        }
        return issues;
      });
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 33-3: Enemy.js 메카닉
  // ═══════════════════════════════════════════════════════════════════

  test.describe('33-3: Enemy.js 메카닉 (정적 검증)', () => {

    test('M1: Enemy 클래스가 정상 임포트된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        try {
          const mod = await import('/js/entities/Enemy.js');
          return { hasEnemy: typeof mod.Enemy === 'function' || typeof mod.default === 'function' };
        } catch (e) {
          return { hasEnemy: false, error: e.message };
        }
      });
      expect(result.hasEnemy).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 브라우저 안정성
  // ═══════════════════════════════════════════════════════════════════

  test.describe('브라우저 안정성', () => {

    test('B1: 게임 로딩 후 콘솔 에러가 없다', async ({ page }) => {
      // beforeEach에서 이미 5초 대기 + 에러 수집
      expect(page._consoleErrors).toEqual([]);
    });

    test('B2: 초기 화면 스크린샷 캡처', async ({ page }) => {
      await page.screenshot({ path: 'C:/antigravity/kitchen-chaos/tests/screenshots/phase33-initial.png' });
    });
  });
});
