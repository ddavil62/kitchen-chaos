/**
 * @fileoverview Phase 34 QA -- 20장 칸티나 심층부 통합 검증.
 * 34-1: 대화 스크립트 3종 + storyData 트리거 3건
 * 34-2: 에셋 3종 (cactus_wraith, luchador_ghost, avocado) + 코드 등록 + Enemy.js 메카닉
 * 34-3: 스테이지 20-1~20-5 + 레시피 11종 + 19-5 currentChapter 갱신 트리거
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 34 통합 검증', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  // =====================================================================
  // 34-1: 대화 스크립트
  // =====================================================================

  test.describe('34-1: 대화 스크립트', () => {

    test('D1: chapter20_intro가 존재하고 lines가 10개 이상', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.chapter20_intro;
        return {
          exists: !!d,
          id: d?.id,
          lineCount: d?.lines?.length ?? 0,
          hasNarrator: d?.lines?.some(l => l.speaker === 'narrator' && l.portrait === ''),
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('chapter20_intro');
      expect(result.lineCount).toBeGreaterThanOrEqual(10);
      expect(result.hasNarrator).toBe(true);
    });

    test('D2: chapter20_mid가 존재하고 lines가 11개 이상, El Diablo 대사 포함', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.chapter20_mid;
        const elDiabloLines = d?.lines?.filter(l => l.speaker === 'El Diablo') ?? [];
        return {
          exists: !!d,
          id: d?.id,
          lineCount: d?.lines?.length ?? 0,
          hasNarrator: d?.lines?.some(l => l.speaker === 'narrator' && l.portrait === ''),
          elDiabloCount: elDiabloLines.length,
          elDiabloPortrait: elDiabloLines[0]?.portrait,
          elDiabloHasNoPortraitKey: elDiabloLines.every(l => !l.portraitKey),
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('chapter20_mid');
      expect(result.lineCount).toBeGreaterThanOrEqual(11);
      expect(result.hasNarrator).toBe(true);
      expect(result.elDiabloCount).toBeGreaterThanOrEqual(1);
      expect(result.elDiabloPortrait).toContain('\u{1F608}'); // devil emoji
      expect(result.elDiabloHasNoPortraitKey).toBe(true);
    });

    test('D3: team_side_20가 존재하고 lines가 8개 이상', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.team_side_20;
        return {
          exists: !!d,
          id: d?.id,
          lineCount: d?.lines?.length ?? 0,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('team_side_20');
      expect(result.lineCount).toBeGreaterThanOrEqual(8);
    });

    test('D4: 20장 대화의 portraitKey가 기존 캐릭터와 일치한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES, CHARACTERS } = await import('/js/data/dialogueData.js');
        const charKeys = Object.keys(CHARACTERS);
        const issues = [];
        for (const dialogueId of ['chapter20_intro', 'chapter20_mid', 'team_side_20']) {
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

    test('D5: narrator 대사에 portraitKey가 없고 portrait가 빈 문자열', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const issues = [];
        for (const dialogueId of ['chapter20_intro', 'chapter20_mid', 'team_side_20']) {
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

    test('D6: fileoverview에 88종 표기 확인', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/data/dialogueData.js');
        return resp.text();
      });
      expect(src).toContain('88');
      expect(src).toContain('Phase 34-1');
    });

    test('D7: El Diablo 대사에 portraitKey가 없다 (스펙 명시)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const d = DIALOGUES.chapter20_mid;
        const elDiabloLines = d?.lines?.filter(l => l.speaker === 'El Diablo') ?? [];
        return elDiabloLines.map((l, i) => ({
          index: i,
          hasPortraitKey: !!l.portraitKey,
          portrait: l.portrait,
        }));
      });
      for (const line of result) {
        expect(line.hasPortraitKey, `El Diablo line ${line.index} should not have portraitKey`).toBe(false);
      }
    });

    test('D8: 기존 19장 대화 스크립트가 변경되지 않았다 (회귀 검증)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        return {
          ch19IntroExists: !!DIALOGUES.chapter19_intro,
          ch19MidExists: !!DIALOGUES.chapter19_mid,
          side19Exists: !!DIALOGUES.team_side_19,
          ch19IntroLines: DIALOGUES.chapter19_intro?.lines?.length ?? 0,
          ch19MidLines: DIALOGUES.chapter19_mid?.lines?.length ?? 0,
          side19Lines: DIALOGUES.team_side_19?.lines?.length ?? 0,
        };
      });
      expect(result.ch19IntroExists).toBe(true);
      expect(result.ch19MidExists).toBe(true);
      expect(result.side19Exists).toBe(true);
      expect(result.ch19IntroLines).toBeGreaterThanOrEqual(8);
      expect(result.ch19MidLines).toBeGreaterThanOrEqual(8);
      expect(result.side19Lines).toBeGreaterThanOrEqual(6);
    });
  });

  // =====================================================================
  // 34-1: storyData 트리거
  // =====================================================================

  test.describe('34-1: storyData 트리거', () => {

    test('S1: 20-1 gathering_enter 트리거가 chapter20_intro를 가리킨다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'gathering_enter' && t.dialogueId === 'chapter20_intro');
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

    test('S2: 20-3 result_clear 트리거가 chapter20_mid를 가리키고 onComplete가 있다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'result_clear' && t.dialogueId === 'chapter20_mid');
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

    test('S3: merchant_enter 트리거가 team_side_20를 가리킨다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'merchant_enter' && t.dialogueId === 'team_side_20');
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

    test('S4: stage_first_clear 제외 목록에 20-1, 20-3가 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const triggers = STORY_TRIGGERS.filter(t =>
          t.triggerPoint === 'result_clear' && t.dialogueId === 'stage_first_clear' && t.once === false);
        const trigger = triggers[triggers.length - 1];
        if (!trigger) return { found: false };
        const ctx201 = { stageId: '20-1', isFirstClear: true, stars: 3 };
        const ctx203 = { stageId: '20-3', isFirstClear: true, stars: 3 };
        const ctxOther = { stageId: '20-2', isFirstClear: true, stars: 3 };
        const save = { storyProgress: { currentChapter: 20 } };
        return {
          found: true,
          blocks201: !trigger.condition(ctx201, save),
          blocks203: !trigger.condition(ctx203, save),
          allows202: trigger.condition(ctxOther, save),
        };
      });
      expect(result.found).toBe(true);
      expect(result.blocks201).toBe(true);
      expect(result.blocks203).toBe(true);
      expect(result.allows202).toBe(true);
    });

    test('S5: 20장 트리거 dialogueId가 dialogueData 키와 일치', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { DIALOGUES } = await import('/js/data/dialogueData.js');
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const ch20triggers = STORY_TRIGGERS.filter(t =>
          ['chapter20_intro', 'chapter20_mid', 'team_side_20'].includes(t.dialogueId));
        const missing = ch20triggers
          .filter(t => !DIALOGUES[t.dialogueId])
          .map(t => t.dialogueId);
        return { count: ch20triggers.length, missing };
      });
      expect(result.count).toBe(3);
      expect(result.missing).toEqual([]);
    });

    test('S6: 20-1 gathering_enter condition이 stageId 20-1에서만 true 반환', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'gathering_enter' && t.dialogueId === 'chapter20_intro');
        if (!trigger) return { found: false };
        return {
          found: true,
          trueFor201: trigger.condition({ stageId: '20-1' }),
          falseFor202: !trigger.condition({ stageId: '20-2' }),
          falseFor191: !trigger.condition({ stageId: '19-1' }),
          falseForNull: !trigger.condition({ stageId: null }),
        };
      });
      expect(result.found).toBe(true);
      expect(result.trueFor201).toBe(true);
      expect(result.falseFor202).toBe(true);
      expect(result.falseFor191).toBe(true);
      expect(result.falseForNull).toBe(true);
    });

    test('S7: chapter20_mid onComplete이 el_diablo_appeared 플래그를 설정 (소스 검증)', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/data/storyData.js');
        return resp.text();
      });
      expect(src).toContain('el_diablo_appeared');
      expect(src).toContain('chapter20_mid_seen');
    });
  });

  // =====================================================================
  // 34-2: 에셋 및 코드 등록
  // =====================================================================

  test.describe('34-2: 에셋 및 데이터 등록', () => {

    test('E1: cactus_wraith ENEMY_TYPES 데이터가 올바르다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const e = ENEMY_TYPES.cactus_wraith;
        return {
          exists: !!e,
          id: e?.id,
          hp: e?.hp,
          ingredient: e?.ingredient,
          thornReflect: e?.thornReflect,
          thornReflectDamage: e?.thornReflectDamage,
          canvasSize: e?.canvasSize,
          group: e?.group,
          reward: e?.reward,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('cactus_wraith');
      expect(result.hp).toBe(430);
      expect(result.ingredient).toBe('avocado');
      expect(result.thornReflect).toBe(true);
      expect(result.thornReflectDamage).toBe(15);
      expect(result.canvasSize).toBeGreaterThan(0);
    });

    test('E2: luchador_ghost ENEMY_TYPES 데이터가 올바르다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const e = ENEMY_TYPES.luchador_ghost;
        return {
          exists: !!e,
          id: e?.id,
          hp: e?.hp,
          ingredient: e?.ingredient,
          dodgeOnHit: e?.dodgeOnHit,
          dodgeChance: e?.dodgeChance,
          tauntEnabled: e?.tauntEnabled,
          tauntRadius: e?.tauntRadius,
          tauntInterval: e?.tauntInterval,
          canvasSize: e?.canvasSize,
          group: e?.group,
          reward: e?.reward,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('luchador_ghost');
      expect(result.hp).toBe(460);
      expect(result.ingredient).toBe('avocado');
      expect(result.dodgeOnHit).toBe(true);
      expect(result.dodgeChance).toBe(0.30);
      expect(result.tauntEnabled).toBe(true);
      expect(result.tauntRadius).toBe(150);
      expect(result.tauntInterval).toBe(5000);
      expect(result.canvasSize).toBeGreaterThan(0);
    });

    test('E3: INGREDIENT_TYPES에 avocado가 존재한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { INGREDIENT_TYPES } = await import('/js/data/gameData.js');
        const i = INGREDIENT_TYPES.avocado;
        return {
          exists: !!i,
          id: i?.id,
          nameKo: i?.nameKo,
          icon: i?.icon,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.id).toBe('avocado');
      expect(result.nameKo).toContain('아보카도');
      expect(result.icon).toContain('avocado.png');
    });

    test('E4: SpriteLoader ENEMY_IDS에 cactus_wraith, luchador_ghost 등록', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      const enemyIdsMatch = src.match(/const ENEMY_IDS\s*=\s*\[([\s\S]*?)\];/);
      expect(enemyIdsMatch).not.toBeNull();
      expect(enemyIdsMatch[1]).toContain('cactus_wraith');
      expect(enemyIdsMatch[1]).toContain('luchador_ghost');
    });

    test('E5: SpriteLoader ENEMY_IDS가 39종', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      // 39종 주석 확인
      expect(src).toContain('39종');
    });

    test('E6: SpriteLoader ENEMY_WALK_HASHES에 animating- 접두어 해시 등록', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      const cactusMatch = src.match(/cactus_wraith:\s*'(animating-[0-9a-f]+)'/);
      const luchadorMatch = src.match(/luchador_ghost:\s*'(animating-[0-9a-f]+)'/);
      expect(cactusMatch).not.toBeNull();
      expect(cactusMatch[1]).toBe('animating-377c9fa7');
      expect(luchadorMatch).not.toBeNull();
      expect(luchadorMatch[1]).toBe('animating-0469ac97');
    });

    test('E7: SpriteLoader INGREDIENT_FILE_MAP에 avocado 매핑', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/managers/SpriteLoader.js');
        return resp.text();
      });
      const mapMatch = src.match(/const INGREDIENT_FILE_MAP\s*=\s*\{([\s\S]*?)\};/);
      expect(mapMatch).not.toBeNull();
      expect(mapMatch[1]).toContain("avocado: 'avocado'");
    });

    test('E8: 에셋 파일이 HTTP로 접근 가능하다', async ({ page }) => {
      const urls = [
        '/assets/enemies/cactus_wraith/rotations/south.png',
        '/assets/enemies/luchador_ghost/rotations/south.png',
        '/assets/ingredients/avocado.png',
      ];
      const results = [];
      for (const url of urls) {
        const resp = await page.request.get(url);
        results.push({ url, status: resp.status() });
      }
      for (const r of results) {
        expect(r.status, `${r.url} should return 200`).toBe(200);
      }
    });

    test('E9: cactus_wraith 8방향 rotations 모두 접근 가능', async ({ page }) => {
      const dirs = ['south', 'south-east', 'south-west', 'north', 'north-east', 'north-west', 'east', 'west'];
      const results = [];
      for (const dir of dirs) {
        const resp = await page.request.get(`/assets/enemies/cactus_wraith/rotations/${dir}.png`);
        results.push({ dir, status: resp.status() });
      }
      for (const r of results) {
        expect(r.status, `cactus_wraith rotation ${r.dir} should return 200`).toBe(200);
      }
    });

    test('E10: luchador_ghost 8방향 rotations 모두 접근 가능', async ({ page }) => {
      const dirs = ['south', 'south-east', 'south-west', 'north', 'north-east', 'north-west', 'east', 'west'];
      const results = [];
      for (const dir of dirs) {
        const resp = await page.request.get(`/assets/enemies/luchador_ghost/rotations/${dir}.png`);
        results.push({ dir, status: resp.status() });
      }
      for (const r of results) {
        expect(r.status, `luchador_ghost rotation ${r.dir} should return 200`).toBe(200);
      }
    });

    test('E11: cactus_wraith 애니메이션 프레임 접근 가능 (south 방향 8프레임)', async ({ page }) => {
      const results = [];
      for (let i = 0; i < 8; i++) {
        const frame = String(i).padStart(3, '0');
        const resp = await page.request.get(`/assets/enemies/cactus_wraith/animations/animating-377c9fa7/south/frame_${frame}.png`);
        results.push({ frame, status: resp.status() });
      }
      for (const r of results) {
        expect(r.status, `cactus_wraith frame_${r.frame} should return 200`).toBe(200);
      }
    });

    test('E12: luchador_ghost 애니메이션 프레임 접근 가능 (south 방향 8프레임)', async ({ page }) => {
      const results = [];
      for (let i = 0; i < 8; i++) {
        const frame = String(i).padStart(3, '0');
        const resp = await page.request.get(`/assets/enemies/luchador_ghost/animations/animating-0469ac97/south/frame_${frame}.png`);
        results.push({ frame, status: resp.status() });
      }
      for (const r of results) {
        expect(r.status, `luchador_ghost frame_${r.frame} should return 200`).toBe(200);
      }
    });
  });

  // =====================================================================
  // 34-2: Enemy.js 메카닉 (정적 검증)
  // =====================================================================

  test.describe('34-2: Enemy.js 메카닉', () => {

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

    test('M2: Enemy.js takeDamage 시그니처에 attackerRef 파라미터 존재', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/entities/Enemy.js');
        return resp.text();
      });
      expect(src).toMatch(/takeDamage\s*\(\s*amount\s*,\s*towerType\s*=\s*null\s*,\s*attackerRef\s*=\s*null\s*\)/);
    });

    test('M3: Enemy.js에 thornReflect 처리 코드 존재', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/entities/Enemy.js');
        return resp.text();
      });
      expect(src).toContain('thornReflect');
      expect(src).toContain('thornReflectDamage');
      expect(src).toContain('attackerRef');
    });

    test('M4: Enemy.js에 tauntEnabled 처리 코드 존재 + enemy_taunt 이벤트 emit', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/entities/Enemy.js');
        return resp.text();
      });
      expect(src).toContain('tauntEnabled');
      expect(src).toContain("'enemy_taunt'");
      expect(src).toContain('tauntRadius');
      expect(src).toContain('tauntInterval');
      expect(src).toContain('tauntTimer_');
    });

    test('M5: thornReflect 가시 반격은 dodgeOnHit 이후 위치에 있다 (로직 순서)', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/entities/Enemy.js');
        return resp.text();
      });
      const dodgeIdx = src.indexOf('dodgeOnHit');
      const thornIdx = src.indexOf('thornReflect', dodgeIdx);
      expect(thornIdx).toBeGreaterThan(dodgeIdx);
    });
  });

  // =====================================================================
  // 34-3: 스테이지 데이터
  // =====================================================================

  test.describe('34-3: 스테이지 데이터', () => {

    test('ST1: 20-1~20-5가 placeholder가 아닌 실제 스테이지', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const stageIds = ['20-1', '20-2', '20-3', '20-4', '20-5'];
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

    test('ST2: 20-6은 placeholder를 유지한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-6'];
        return { theme: s?.theme, nameKo: s?.nameKo };
      });
      expect(result.theme).toBe('placeholder');
    });

    test('ST3: 20-3 wave 3~5에 cactus_wraith가 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-3'];
        return [3, 4, 5].map(w => {
          const wave = s.waves.find(wv => wv.wave === w);
          return {
            wave: w,
            hasCactusWraith: wave?.enemies?.some(e => e.type === 'cactus_wraith'),
          };
        });
      });
      for (const w of result) {
        expect(w.hasCactusWraith, `wave ${w.wave} has cactus_wraith`).toBe(true);
      }
    });

    test('ST4: 20-4 wave 2~5에 luchador_ghost가 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-4'];
        return [2, 3, 4, 5].map(w => {
          const wave = s.waves.find(wv => wv.wave === w);
          return {
            wave: w,
            hasLuchadorGhost: wave?.enemies?.some(e => e.type === 'luchador_ghost'),
          };
        });
      });
      for (const w of result) {
        expect(w.hasLuchadorGhost, `wave ${w.wave} has luchador_ghost`).toBe(true);
      }
    });

    test('ST5: 20-5 wave 1~5에 cactus_wraith + luchador_ghost + taco_bandit + burrito_juggernaut 양쪽 포함', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-5'];
        return s.waves.map(wv => ({
          wave: wv.wave,
          hasCactus: wv.enemies.some(e => e.type === 'cactus_wraith'),
          hasLuchador: wv.enemies.some(e => e.type === 'luchador_ghost'),
          hasTaco: wv.enemies.some(e => e.type === 'taco_bandit'),
          hasBurrito: wv.enemies.some(e => e.type === 'burrito_juggernaut'),
        }));
      });
      for (const w of result) {
        expect(w.hasCactus, `wave ${w.wave} has cactus_wraith`).toBe(true);
        expect(w.hasLuchador, `wave ${w.wave} has luchador_ghost`).toBe(true);
        expect(w.hasTaco, `wave ${w.wave} has taco_bandit`).toBe(true);
        expect(w.hasBurrito, `wave ${w.wave} has burrito_juggernaut`).toBe(true);
      }
    });

    test('ST6: 20-1 service.duration이 387~393 범위', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        return STAGES['20-1'].service.duration;
      });
      expect(result).toBeGreaterThanOrEqual(387);
      expect(result).toBeLessThanOrEqual(393);
    });

    test('ST7: 20-5 service.duration이 412~418 범위', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        return STAGES['20-5'].service.duration;
      });
      expect(result).toBeGreaterThanOrEqual(412);
      expect(result).toBeLessThanOrEqual(418);
    });

    test('ST8: 20장 모든 customers dish가 ALL_SERVING_RECIPES에 존재 (RECIPE_MAP 무결성)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const { ALL_SERVING_RECIPES } = await import('/js/data/recipeData.js');
        const recipeIds = new Set(ALL_SERVING_RECIPES.map(r => r.id));
        const missing = [];
        for (const stageId of ['20-1', '20-2', '20-3', '20-4', '20-5']) {
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

    test('ST9: 20장 service 값이 단계적으로 상승한다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const ids = ['20-1', '20-2', '20-3', '20-4', '20-5'];
        return ids.map(id => ({
          id,
          duration: STAGES[id].service.duration,
          maxCustomers: STAGES[id].service.maxCustomers,
        }));
      });
      for (let i = 1; i < result.length; i++) {
        expect(result[i].duration, `${result[i].id} duration >= ${result[i-1].id}`)
          .toBeGreaterThanOrEqual(result[i-1].duration);
        expect(result[i].maxCustomers, `${result[i].id} maxCustomers >= ${result[i-1].id}`)
          .toBeGreaterThanOrEqual(result[i-1].maxCustomers);
      }
    });

    test('ST10: 20장 모든 wave에 사용된 적 ID가 ENEMY_TYPES에 존재', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const missing = [];
        for (const stageId of ['20-1', '20-2', '20-3', '20-4', '20-5']) {
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

    test('ST11: 20-3 W자형 pathSegments 끝점이 row 9 도달 (출구 검증)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-3'];
        const lastSeg = s.pathSegments[s.pathSegments.length - 1];
        return {
          lastSegType: lastSeg.type,
          rowEnd: lastSeg.rowEnd,
          gridRows: s.gridRows,
        };
      });
      // 마지막 세그먼트가 row 9(gridRows 10 기준 마지막)에 도달해야 한다
      expect(result.lastSegType).toBe('vertical');
      expect(result.rowEnd).toBe(result.gridRows - 1);
    });
  });

  // =====================================================================
  // 34-3: 레시피 데이터
  // =====================================================================

  test.describe('34-3: 레시피 데이터', () => {

    test('R1: 서빙 레시피 9종이 ALL_SERVING_RECIPES에 존재', async ({ page }) => {
      const expectedIds = [
        'guacamole', 'avocado_toast', 'avocado_burrito', 'avocado_taco',
        'avocado_salad', 'avocado_quesadilla', 'avocado_soup', 'avocado_rice_bowl',
        'diablo_feast',
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
          hasArmor: ids.includes('avocado_armor_boost'),
          hasFury: ids.includes('guacamole_fury'),
        };
      });
      expect(result.hasArmor).toBe(true);
      expect(result.hasFury).toBe(true);
    });

    test('R3: avocado 레시피들의 ingredients에 avocado가 포함된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES } = await import('/js/data/recipeData.js');
        const allRecipes = [...ALL_SERVING_RECIPES, ...ALL_BUFF_RECIPES];
        const avocadoRecipeIds = [
          'guacamole', 'avocado_toast', 'avocado_burrito', 'avocado_taco',
          'avocado_salad', 'avocado_quesadilla', 'avocado_soup', 'avocado_rice_bowl',
          'diablo_feast', 'avocado_armor_boost', 'guacamole_fury',
        ];
        const avocadoRecipes = allRecipes.filter(r => avocadoRecipeIds.includes(r.id));
        const issues = [];
        for (const r of avocadoRecipes) {
          if (!r.ingredients?.avocado || r.ingredients.avocado < 1) {
            issues.push(`${r.id}: missing avocado ingredient`);
          }
        }
        return { count: avocadoRecipes.length, issues };
      });
      expect(result.count).toBe(11);
      expect(result.issues).toEqual([]);
    });

    test('R4: gateStage가 20-x 범위 내에 있다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES } = await import('/js/data/recipeData.js');
        const phase34Ids = [
          'guacamole', 'avocado_toast', 'avocado_burrito', 'avocado_taco',
          'avocado_salad', 'avocado_quesadilla', 'avocado_soup', 'avocado_rice_bowl',
          'diablo_feast', 'avocado_armor_boost', 'guacamole_fury',
        ];
        const allRecipes = [...ALL_SERVING_RECIPES, ...ALL_BUFF_RECIPES];
        const issues = [];
        for (const r of allRecipes.filter(r => phase34Ids.includes(r.id))) {
          if (!r.gateStage || !r.gateStage.startsWith('20-')) {
            issues.push(`${r.id}: gateStage is ${r.gateStage}`);
          }
        }
        return issues;
      });
      expect(result).toEqual([]);
    });

    test('R5: recipeData fileoverview에 244종 표기', async ({ page }) => {
      const src = await page.evaluate(async () => {
        const resp = await fetch('/js/data/recipeData.js');
        return resp.text();
      });
      expect(src).toContain('244');
      expect(src).toContain('Phase 34-3');
    });

    test('R6: diablo_feast가 5성이고 avocado 2개 이상 사용', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES } = await import('/js/data/recipeData.js');
        const recipe = ALL_SERVING_RECIPES.find(r => r.id === 'diablo_feast');
        return {
          exists: !!recipe,
          tier: recipe?.tier,
          avocadoCount: recipe?.ingredients?.avocado,
        };
      });
      expect(result.exists).toBe(true);
      expect(result.tier).toBe(5);
      expect(result.avocadoCount).toBeGreaterThanOrEqual(2);
    });
  });

  // =====================================================================
  // 34-3: 19-5 currentChapter 갱신 트리거
  // =====================================================================

  test.describe('34-3: currentChapter 갱신 트리거', () => {

    test('CT1: 19-5 result_clear 시 currentChapter를 20으로 갱신하는 트리거 존재', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        // dialogueId가 null이고 19-5 클리어 조건인 트리거 검색
        const trigger = STORY_TRIGGERS.find(t => {
          if (t.triggerPoint !== 'result_clear') return false;
          if (typeof t.condition !== 'function') return false;
          if (typeof t.onComplete !== 'function') return false;
          try {
            const matches = t.condition({ stageId: '19-5', isFirstClear: true, stars: 3 });
            return matches;
          } catch { return false; }
        });
        if (!trigger) return { found: false };
        const onCompleteSrc = trigger.onComplete.toString();
        return {
          found: true,
          once: trigger.once,
          dialogueId: trigger.dialogueId,
          hasCurrentChapter20: onCompleteSrc.includes('20'),
        };
      });
      expect(result.found, '19-5 result_clear trigger for currentChapter 20 should exist').toBe(true);
      expect(result.once).toBe(true);
      expect(result.hasCurrentChapter20).toBe(true);
    });
  });

  // =====================================================================
  // 예외 시나리오 및 엣지케이스
  // =====================================================================

  test.describe('예외 시나리오', () => {

    test('EX1: 20-3 wave 1~2에 cactus_wraith가 없다 (첫 등장은 wave 3)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-3'];
        return [1, 2].map(w => {
          const wave = s.waves.find(wv => wv.wave === w);
          return {
            wave: w,
            hasCactusWraith: wave?.enemies?.some(e => e.type === 'cactus_wraith') ?? false,
          };
        });
      });
      for (const w of result) {
        expect(w.hasCactusWraith, `wave ${w.wave} should NOT have cactus_wraith`).toBe(false);
      }
    });

    test('EX2: 20-4 wave 1에 luchador_ghost가 없다 (첫 등장은 wave 2)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const s = STAGES['20-4'];
        const wave1 = s.waves.find(wv => wv.wave === 1);
        return {
          hasLuchador: wave1?.enemies?.some(e => e.type === 'luchador_ghost') ?? false,
        };
      });
      expect(result.hasLuchador).toBe(false);
    });

    test('EX3: 동일 레시피 ID 충돌 없음 (모든 레시피 ID 유니크)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES } = await import('/js/data/recipeData.js');
        const allIds = [...ALL_SERVING_RECIPES.map(r => r.id), ...ALL_BUFF_RECIPES.map(r => r.id)];
        const seen = new Set();
        const duplicates = [];
        for (const id of allIds) {
          if (seen.has(id)) duplicates.push(id);
          seen.add(id);
        }
        return duplicates;
      });
      expect(result).toEqual([]);
    });

    test('EX4: 동일 적 ID 충돌 없음 (ENEMY_TYPES 키 유니크)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ENEMY_TYPES } = await import('/js/data/gameData.js');
        const keys = Object.keys(ENEMY_TYPES);
        return { count: keys.length, uniqueCount: new Set(keys).size };
      });
      expect(result.count).toBe(result.uniqueCount);
    });

    test('EX5: chapter20_mid condition이 20-3 이외 스테이지에서 false', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'result_clear' && t.dialogueId === 'chapter20_mid');
        if (!trigger) return { found: false };
        return {
          found: true,
          falseFor201: !trigger.condition({ stageId: '20-1', isFirstClear: true, stars: 3 }),
          falseFor204: !trigger.condition({ stageId: '20-4', isFirstClear: true, stars: 3 }),
          falseForNotFirst: !trigger.condition({ stageId: '20-3', isFirstClear: false, stars: 3 }),
          falseForZeroStars: !trigger.condition({ stageId: '20-3', isFirstClear: true, stars: 0 }),
        };
      });
      expect(result.found).toBe(true);
      expect(result.falseFor201).toBe(true);
      expect(result.falseFor204).toBe(true);
      expect(result.falseForNotFirst).toBe(true);
      expect(result.falseForZeroStars).toBe(true);
    });

    test('EX6: team_side_20 condition이 currentChapter < 20이면 false', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
        const trigger = STORY_TRIGGERS.find(t =>
          t.triggerPoint === 'merchant_enter' && t.dialogueId === 'team_side_20');
        if (!trigger) return { found: false };
        const saveChapter19 = { storyProgress: { currentChapter: 19 }, seenDialogues: [] };
        const saveChapter20 = { storyProgress: { currentChapter: 20 }, seenDialogues: [] };
        return {
          found: true,
          falseFor19: !trigger.condition({}, saveChapter19),
          trueFor20: trigger.condition({}, saveChapter20),
        };
      });
      expect(result.found).toBe(true);
      expect(result.falseFor19).toBe(true);
      expect(result.trueFor20).toBe(true);
    });

    test('EX7: guacamole와 guacamole_bowl이 다른 레시피 ID (19장과 충돌 없음)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { ALL_SERVING_RECIPES } = await import('/js/data/recipeData.js');
        const guac = ALL_SERVING_RECIPES.find(r => r.id === 'guacamole');
        const guacBowl = ALL_SERVING_RECIPES.find(r => r.id === 'guacamole_bowl');
        return {
          guacExists: !!guac,
          guacBowlExists: !!guacBowl,
          different: guac?.id !== guacBowl?.id,
        };
      });
      expect(result.guacExists).toBe(true);
      expect(result.guacBowlExists).toBe(true);
      expect(result.different).toBe(true);
    });

    test('EX8: 20장 wave enemy count가 양수이고 interval이 양수', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const issues = [];
        for (const stageId of ['20-1', '20-2', '20-3', '20-4', '20-5']) {
          const stage = STAGES[stageId];
          for (const wv of stage.waves) {
            for (const e of wv.enemies) {
              if (e.count <= 0) issues.push(`${stageId} wave ${wv.wave} ${e.type}: count <= 0`);
              if (e.interval <= 0) issues.push(`${stageId} wave ${wv.wave} ${e.type}: interval <= 0`);
            }
          }
        }
        return issues;
      });
      expect(result).toEqual([]);
    });

    test('EX9: 20장 customers의 patience, baseReward가 양수', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const issues = [];
        for (const stageId of ['20-1', '20-2', '20-3', '20-4', '20-5']) {
          const stage = STAGES[stageId];
          for (const cw of stage.customers) {
            for (const c of cw.customers) {
              if (c.patience <= 0) issues.push(`${stageId} wave ${cw.wave}: patience <= 0`);
              if (c.baseReward <= 0) issues.push(`${stageId} wave ${cw.wave}: baseReward <= 0`);
            }
          }
        }
        return issues;
      });
      expect(result).toEqual([]);
    });

    test('EX10: 19장 이하 스테이지/레시피 회귀 검증 (변경 없음)', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const { STAGES } = await import('/js/data/stageData.js');
        const { ALL_SERVING_RECIPES } = await import('/js/data/recipeData.js');
        // 19장 스테이지 존재 확인
        const stage191 = STAGES['19-1'];
        const stage195 = STAGES['19-5'];
        // 19장 레시피 존재 확인
        const ph33Recipes = ['jalapeno_salsa', 'jalapeno_cornbread', 'taco_supreme'];
        const recipeIds = new Set(ALL_SERVING_RECIPES.map(r => r.id));
        return {
          stage191Theme: stage191?.theme,
          stage195Theme: stage195?.theme,
          stage191HasService: !!stage191?.service,
          stage195HasService: !!stage195?.service,
          ph33RecipesExist: ph33Recipes.every(id => recipeIds.has(id)),
        };
      });
      expect(result.stage191Theme).toBe('cactus_cantina');
      expect(result.stage195Theme).toBe('cactus_cantina');
      expect(result.stage191HasService).toBe(true);
      expect(result.stage195HasService).toBe(true);
      expect(result.ph33RecipesExist).toBe(true);
    });
  });

  // =====================================================================
  // 브라우저 안정성
  // =====================================================================

  test.describe('브라우저 안정성', () => {

    test('B1: 게임 로딩 후 콘솔 에러가 없다', async ({ page }) => {
      expect(page._consoleErrors).toEqual([]);
    });

    test('B2: 초기 화면 스크린샷 캡처', async ({ page }) => {
      await page.screenshot({ path: 'C:/antigravity/kitchen-chaos/tests/screenshots/phase34-initial.png' });
    });
  });
});
