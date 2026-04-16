/**
 * @fileoverview Phase 32-5 QA -- 18장 스테이지 + maharaja/masala_guide + cardamom + 레시피 8종 검증.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 32-5 데이터 검증', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  // ── A. 데이터 정합성 ──

  test('A1: ENEMY_TYPES에 masala_guide가 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const mg = ENEMY_TYPES.masala_guide;
      return {
        exists: !!mg,
        id: mg?.id,
        hp: mg?.hp,
        speed: mg?.speed,
        canvasSize: mg?.canvasSize,
        ingredient: mg?.ingredient,
        confuseOnHit: mg?.confuseOnHit,
        charge: mg?.charge,
      };
    });

    expect(result.exists, 'masala_guide 존재').toBe(true);
    expect(result.id).toBe('masala_guide');
    expect(result.hp).toBe(330);
    expect(result.speed).toBe(82);
    expect(result.canvasSize).toBe(108);
    expect(result.ingredient).toBe('cardamom');
    expect(result.confuseOnHit).toBe(true);
    expect(result.charge).toBe(true);
  });

  test('A2: ENEMY_TYPES에 maharaja가 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const m = ENEMY_TYPES.maharaja;
      return {
        exists: !!m,
        id: m?.id,
        hp: m?.hp,
        speed: m?.speed,
        isBoss: m?.isBoss,
        canvasSize: m?.canvasSize,
        spiceBlast: m?.spiceBlast,
        summonType: m?.summonType,
        summonCount: m?.summonCount,
        bossReward: m?.bossReward,
      };
    });

    expect(result.exists, 'maharaja 존재').toBe(true);
    expect(result.id).toBe('maharaja');
    expect(result.hp).toBe(2200);
    expect(result.speed).toBe(20);
    expect(result.isBoss).toBe(true);
    expect(result.canvasSize).toBe(212);
    expect(result.spiceBlast).toBe(true);
    expect(result.summonType).toBe('masala_guide');
    expect(result.summonCount).toBe(3);
    expect(result.bossReward).toBe(480);
  });

  test('A3: INGREDIENT_TYPES에 cardamom이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { INGREDIENT_TYPES } = await import('/js/data/gameData.js');
      const c = INGREDIENT_TYPES.cardamom;
      return {
        exists: !!c,
        id: c?.id,
        nameKo: c?.nameKo,
        icon: c?.icon,
      };
    });

    expect(result.exists, 'cardamom 존재').toBe(true);
    expect(result.id).toBe('cardamom');
    expect(result.nameKo).toBe('카다멈');
    expect(result.icon).toBe('assets/ingredients/cardamom.png');
  });

  test('A4: SpriteLoader ENEMY_IDS에 masala_guide, BOSS_IDS에 maharaja 포함', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // SpriteLoader는 import 시 internal constants를 export하지 않으므로 소스에서 직접 확인
      const resp = await fetch('/js/managers/SpriteLoader.js');
      const code = await resp.text();
      return {
        hasMasalaGuideInEnemyIds: code.includes("'masala_guide'") && code.match(/ENEMY_IDS\s*=\s*\[[\s\S]*?'masala_guide'[\s\S]*?\]/)?.[0] !== undefined,
        hasMaharajaInBossIds: code.includes("'maharaja'") && code.match(/BOSS_IDS\s*=\s*\[[\s\S]*?'maharaja'[\s\S]*?\]/)?.[0] !== undefined,
      };
    });

    expect(result.hasMasalaGuideInEnemyIds, 'masala_guide in ENEMY_IDS').toBe(true);
    expect(result.hasMaharajaInBossIds, 'maharaja in BOSS_IDS').toBe(true);
  });

  test('A5: SpriteLoader 해시값이 올바르다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const resp = await fetch('/js/managers/SpriteLoader.js');
      const code = await resp.text();
      const mgHash = code.match(/masala_guide:\s*'([^']+)'/);
      const mHash = code.match(/maharaja:\s*'([^']+)'/);
      return {
        masalaGuideHash: mgHash?.[1] || null,
        maharajaHash: mHash?.[1] || null,
      };
    });

    expect(result.masalaGuideHash).toBe('animating-3594d863');
    expect(result.maharajaHash).toBe('animating-2c666ada');
  });

  test('A6: INGREDIENT_FILE_MAP에 cardamom이 매핑되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const resp = await fetch('/js/managers/SpriteLoader.js');
      const code = await resp.text();
      return code.includes("cardamom: 'cardamom'");
    });

    expect(result, 'cardamom in INGREDIENT_FILE_MAP').toBe(true);
  });

  // ── B. 스테이지 구조 ──

  test('B1: 18-1~18-6 모두 theme=spice_palace이고 완전 구현 상태이다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stages = {};
      for (let i = 1; i <= 6; i++) {
        const s = STAGES['18-' + i];
        stages['18-' + i] = {
          exists: !!s,
          theme: s?.theme,
          hasPathSegments: Array.isArray(s?.pathSegments) && s.pathSegments.length >= 1,
          waveCount: Array.isArray(s?.waves) ? s.waves.length : 0,
          hasCustomers: Array.isArray(s?.customers) && s.customers.length > 0,
          hasStarThresholds: !!s?.starThresholds && typeof s.starThresholds.three === 'number',
          hasService: !!s?.service && typeof s.service.duration === 'number',
        };
      }
      return stages;
    });

    for (let i = 1; i <= 6; i++) {
      const k = '18-' + i;
      expect(result[k].exists, `${k} exists`).toBe(true);
      expect(result[k].theme, `${k} theme`).toBe('spice_palace');
      expect(result[k].hasPathSegments, `${k} pathSegments`).toBe(true);
      expect(result[k].waveCount, `${k} waveCount > 0`).toBeGreaterThan(0);
      expect(result[k].hasCustomers, `${k} customers`).toBe(true);
      expect(result[k].hasStarThresholds, `${k} starThresholds`).toBe(true);
      expect(result[k].hasService, `${k} service`).toBe(true);
    }
  });

  test('B2: 18-1~18-6 각 스테이지에 5개 웨이브가 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const waveCounts = {};
      for (let i = 1; i <= 6; i++) {
        waveCounts['18-' + i] = STAGES['18-' + i]?.waves?.length || 0;
      }
      return waveCounts;
    });

    for (let i = 1; i <= 6; i++) {
      expect(result['18-' + i], `18-${i} wave count`).toBe(5);
    }
  });

  test('B3: 18-6 마지막 웨이브에 maharaja가 포함된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const s = STAGES['18-6'];
      const lastWave = s.waves[s.waves.length - 1];
      return {
        waveNumber: lastWave.wave,
        enemies: lastWave.enemies.map(e => ({ type: e.type, count: e.count })),
        hasMaharaja: lastWave.enemies.some(e => e.type === 'maharaja'),
        maharajaCount: lastWave.enemies.find(e => e.type === 'maharaja')?.count,
        hasMasalaGuide: lastWave.enemies.some(e => e.type === 'masala_guide'),
        masalaGuideCount: lastWave.enemies.find(e => e.type === 'masala_guide')?.count,
      };
    });

    expect(result.waveNumber).toBe(5);
    expect(result.hasMaharaja, '18-6 wave 5 has maharaja').toBe(true);
    expect(result.maharajaCount, 'maharaja count = 1').toBe(1);
    expect(result.hasMasalaGuide, '18-6 wave 5 has masala_guide escort').toBe(true);
    expect(result.masalaGuideCount, 'masala_guide escort count = 6').toBe(6);
  });

  test('B4: masala_guide가 17-x 스테이지에 등장하지 않는다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const issues = [];
      for (let i = 1; i <= 6; i++) {
        const s = STAGES['17-' + i];
        if (!s?.waves) continue;
        for (const w of s.waves) {
          for (const e of w.enemies) {
            if (e.type === 'masala_guide') {
              issues.push('17-' + i + ' wave ' + w.wave);
            }
          }
        }
      }
      return issues;
    });

    expect(result, 'masala_guide should not appear in 17-x').toEqual([]);
  });

  test('B5: masala_guide가 18-1에서 처음 등장한다 (wave 2)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const s = STAGES['18-1'];
      return s.waves.map(w => ({
        wave: w.wave,
        hasMG: w.enemies.some(e => e.type === 'masala_guide'),
      }));
    });

    expect(result.find(w => w.wave === 1).hasMG, '18-1 wave 1 no masala_guide').toBe(false);
    expect(result.find(w => w.wave === 2).hasMG, '18-1 wave 2 has masala_guide').toBe(true);
  });

  // ── C. 에셋 파일 존재 확인 ──

  test('C1: maharaja south.png 에셋이 로드 가능하다', async ({ page }) => {
    const response = await page.goto('/sprites/bosses/maharaja/rotations/south.png');
    expect(response.status(), 'maharaja south.png HTTP 200').toBe(200);
  });

  test('C2: masala_guide south.png 에셋이 로드 가능하다', async ({ page }) => {
    const response = await page.goto('/sprites/enemies/masala_guide/rotations/south.png');
    expect(response.status(), 'masala_guide south.png HTTP 200').toBe(200);
  });

  test('C3: maharaja 걷기 프레임 south/frame_000~005.png 존재', async ({ page }) => {
    const results = [];
    for (let f = 0; f < 6; f++) {
      const resp = await page.goto(`/sprites/bosses/maharaja/animations/animating-2c666ada/south/frame_${String(f).padStart(3, '0')}.png`);
      results.push({ frame: f, status: resp.status() });
    }
    for (const r of results) {
      expect(r.status, `maharaja south frame_${r.frame}`).toBe(200);
    }
  });

  test('C4: masala_guide 걷기 프레임 south/frame_000~005.png 존재', async ({ page }) => {
    const results = [];
    for (let f = 0; f < 6; f++) {
      const resp = await page.goto(`/sprites/enemies/masala_guide/animations/animating-3594d863/south/frame_${String(f).padStart(3, '0')}.png`);
      results.push({ frame: f, status: resp.status() });
    }
    for (const r of results) {
      expect(r.status, `masala_guide south frame_${r.frame}`).toBe(200);
    }
  });

  test('C5: maharaja 8방향 걷기 프레임 전체 존재 (8dir x 6frames)', async ({ page }) => {
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
    const missing = [];
    for (const dir of dirs) {
      for (let f = 0; f < 6; f++) {
        const resp = await page.goto(`/sprites/bosses/maharaja/animations/animating-2c666ada/${dir}/frame_${String(f).padStart(3, '0')}.png`);
        if (resp.status() !== 200) {
          missing.push(`${dir}/frame_${String(f).padStart(3, '0')}`);
        }
      }
    }
    expect(missing, 'maharaja missing frames').toEqual([]);
  });

  test('C6: masala_guide 8방향 걷기 프레임 전체 존재 (8dir x 6frames)', async ({ page }) => {
    const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
    const missing = [];
    for (const dir of dirs) {
      for (let f = 0; f < 6; f++) {
        const resp = await page.goto(`/sprites/enemies/masala_guide/animations/animating-3594d863/${dir}/frame_${String(f).padStart(3, '0')}.png`);
        if (resp.status() !== 200) {
          missing.push(`${dir}/frame_${String(f).padStart(3, '0')}`);
        }
      }
    }
    expect(missing, 'masala_guide missing frames').toEqual([]);
  });

  test('C7: cardamom.png 재료 아이콘이 로드 가능하다', async ({ page }) => {
    const response = await page.goto('/sprites/ingredients/cardamom.png');
    expect(response.status(), 'cardamom.png HTTP 200').toBe(200);
  });

  // ── D. 레시피 ──

  test('D1: 서빙 레시피 7종 모두 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { RECIPE_MAP } = await import('/js/data/recipeData.js');
      const ids = [
        'cardamom_tea', 'spiced_cardamom_bread', 'cardamom_masala_bowl',
        'masala_lamb', 'maharaja_grand_platter', 'spice_throne_feast',
        'maharaja_final_banquet',
      ];
      return ids.map(id => ({ id, exists: !!RECIPE_MAP[id] }));
    });

    for (const r of result) {
      expect(r.exists, `recipe ${r.id} exists`).toBe(true);
    }
  });

  test('D2: 버프 레시피 cardamom_aura가 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { RECIPE_MAP } = await import('/js/data/recipeData.js');
      const r = RECIPE_MAP.cardamom_aura;
      return {
        exists: !!r,
        category: r?.category,
        tier: r?.tier,
        hasCardamom: r?.ingredients?.cardamom >= 1,
        hasChai: r?.ingredients?.chai >= 1,
      };
    });

    expect(result.exists, 'cardamom_aura exists').toBe(true);
    expect(result.category).toBe('buff');
    expect(result.tier).toBe(4);
    expect(result.hasCardamom).toBe(true);
    expect(result.hasChai).toBe(true);
  });

  test('D3: gateStage가 18-x인 레시피가 최소 8종이다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ALL_RECIPES } = await import('/js/data/recipeData.js');
      return ALL_RECIPES.filter(r => r.gateStage && r.gateStage.startsWith('18-')).map(r => r.id);
    });

    expect(result.length, 'gateStage 18-x recipes >= 8').toBeGreaterThanOrEqual(8);
  });

  test('D4: cardamom을 사용하는 레시피가 최소 1종이다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ALL_RECIPES } = await import('/js/data/recipeData.js');
      return ALL_RECIPES.filter(r => r.ingredients?.cardamom > 0).map(r => r.id);
    });

    expect(result.length, 'cardamom recipes >= 1').toBeGreaterThanOrEqual(1);
    // 실제로 8종 모두 cardamom을 사용해야 함
    expect(result.length, 'cardamom recipes = 8').toBe(8);
  });

  test('D5: 레시피 gateStage 분포가 스펙과 일치한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ALL_RECIPES } = await import('/js/data/recipeData.js');
      const phase32_5_ids = [
        'cardamom_tea', 'spiced_cardamom_bread', 'cardamom_masala_bowl',
        'masala_lamb', 'maharaja_grand_platter', 'spice_throne_feast',
        'maharaja_final_banquet', 'cardamom_aura',
      ];
      return phase32_5_ids.map(id => {
        const r = ALL_RECIPES.find(x => x.id === id);
        return { id, gateStage: r?.gateStage };
      });
    });

    const gateMap = Object.fromEntries(result.map(r => [r.id, r.gateStage]));
    expect(gateMap.cardamom_tea).toBe('18-1');
    expect(gateMap.spiced_cardamom_bread).toBe('18-1');
    expect(gateMap.cardamom_masala_bowl).toBe('18-2');
    expect(gateMap.masala_lamb).toBe('18-2');
    expect(gateMap.maharaja_grand_platter).toBe('18-3');
    expect(gateMap.spice_throne_feast).toBe('18-4');
    expect(gateMap.maharaja_final_banquet).toBe('18-5');
    expect(gateMap.cardamom_aura).toBe('18-3');
  });

  // ── E. 교차 참조 ──

  test('E1: 18-x 스테이지 고객 요리가 모두 레시피에 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const { RECIPE_MAP } = await import('/js/data/recipeData.js');
      const issues = [];
      for (let i = 1; i <= 6; i++) {
        const s = STAGES['18-' + i];
        if (!s?.customers) continue;
        for (const wc of s.customers) {
          for (const c of wc.customers) {
            if (!RECIPE_MAP[c.dish]) {
              issues.push({ stage: '18-' + i, wave: wc.wave, dish: c.dish });
            }
          }
        }
      }
      return issues;
    });

    expect(result, '모든 고객 요리가 레시피에 존재').toEqual([]);
  });

  test('E2: 18-x 스테이지 적 타입이 모두 ENEMY_TYPES에 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const issues = [];
      for (let i = 1; i <= 6; i++) {
        const s = STAGES['18-' + i];
        if (!s?.waves) continue;
        for (const w of s.waves) {
          for (const e of w.enemies) {
            if (!ENEMY_TYPES[e.type]) {
              issues.push({ stage: '18-' + i, wave: w.wave, type: e.type });
            }
          }
        }
      }
      return issues;
    });

    expect(result, '모든 적 타입이 ENEMY_TYPES에 존재').toEqual([]);
  });

  test('E3: maharaja의 bossDrops 재료가 모두 INGREDIENT_TYPES에 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ENEMY_TYPES, INGREDIENT_TYPES } = await import('/js/data/gameData.js');
      const m = ENEMY_TYPES.maharaja;
      if (!m?.bossDrops) return { error: 'no bossDrops' };
      const issues = [];
      for (const drop of m.bossDrops) {
        if (!INGREDIENT_TYPES[drop.ingredient]) {
          issues.push(drop.ingredient);
        }
      }
      return { issues, drops: m.bossDrops };
    });

    expect(result.issues || [], 'bossDrops 재료 정합성').toEqual([]);
    expect(result.drops.length, 'bossDrops count').toBe(3);
  });

  // ── F. 콘솔 에러 ──

  test('F1: 게임 로드 시 치명적 콘솔 에러가 없다', async ({ page }) => {
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/phase32-5-loaded.png' });

    const fatalErrors = page._consoleErrors.filter(
      e => e.includes('SyntaxError') || e.includes('ReferenceError') || e.includes('TypeError')
    );
    expect(fatalErrors, 'fatal console errors').toEqual([]);
  });

  // ── G. 레시피 총 카운트 ──

  test('G1: 전체 레시피 수가 221종이다 (서빙 180 + 버프 41)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES, ALL_RECIPES } = await import('/js/data/recipeData.js');
      return {
        serving: ALL_SERVING_RECIPES.length,
        buff: ALL_BUFF_RECIPES.length,
        total: ALL_RECIPES.length,
      };
    });

    expect(result.serving, 'serving count').toBe(180);
    expect(result.buff, 'buff count').toBe(41);
    expect(result.total, 'total count').toBe(221);
  });

  // ── H. 난이도 곡선 검증 ──

  test('H1: 18-1~18-6 웨이브당 적 수가 점진적으로 증가한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const totals = {};
      for (let i = 1; i <= 6; i++) {
        const s = STAGES['18-' + i];
        if (!s?.waves) continue;
        totals['18-' + i] = s.waves.reduce((sum, w) =>
          sum + w.enemies.reduce((ws, e) => ws + e.count, 0), 0
        );
      }
      return totals;
    });

    // 기본적으로 뒤쪽 스테이지일수록 총 적 수가 많거나 비슷해야 한다
    // 18-6은 보스전이므로 총 적 수가 줄어들 수 있음 (wave5가 보스+호위만)
    expect(result['18-1']).toBeLessThan(result['18-5']);
    expect(result['18-2']).toBeLessThan(result['18-5']);
  });

  test('H2: 18-6 경로가 대칭 구조이다 (중앙 세로-가로-중앙 세로)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const s = STAGES['18-6'];
      return s?.pathSegments;
    });

    expect(result.length).toBe(3);
    // 첫 세그먼트와 마지막 세그먼트의 col이 같아야 함 (대칭)
    expect(result[0].col).toBe(result[2].col);
    expect(result[0].type).toBe('vertical');
    expect(result[1].type).toBe('horizontal');
    expect(result[2].type).toBe('vertical');
  });

  // ── I. maharaja 보스 특수 속성 검증 ──

  test('I1: maharaja의 spiceBlast 속성이 올바르다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const m = ENEMY_TYPES.maharaja;
      return {
        spiceBlast: m?.spiceBlast,
        spiceBlastInterval: m?.spiceBlastInterval,
        spiceBlastRadius: m?.spiceBlastRadius,
        effectDamageReduction: m?.spiceBlastEffect?.damageReduction,
        effectRangeReduction: m?.spiceBlastEffect?.rangeReduction,
        effectDuration: m?.spiceBlastEffect?.duration,
      };
    });

    expect(result.spiceBlast).toBe(true);
    expect(result.spiceBlastInterval).toBe(7000);
    expect(result.spiceBlastRadius).toBe(100);
    expect(result.effectDamageReduction).toBe(0.25);
    expect(result.effectRangeReduction).toBe(0.20);
    expect(result.effectDuration).toBe(4000);
  });

  test('I2: maharaja의 분노(enrage) 속성이 올바르다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const m = ENEMY_TYPES.maharaja;
      return {
        enrageHpThreshold: m?.enrageHpThreshold,
        enrageSpeedBonus: m?.enrageSpeedBonus,
        summonThreshold: m?.summonThreshold,
      };
    });

    expect(result.enrageHpThreshold).toBe(0.30);
    expect(result.enrageSpeedBonus).toBe(35);
    expect(result.summonThreshold).toBe(0.60);
  });

  test('I3: masala_guide의 혼란+돌진 속성이 올바르다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const mg = ENEMY_TYPES.masala_guide;
      return {
        confuseOnHit: mg?.confuseOnHit,
        confuseDuration: mg?.confuseDuration,
        confuseChance: mg?.confuseChance,
        charge: mg?.charge,
        chargeHpThreshold: mg?.chargeHpThreshold,
        chargeSpeedMultiplier: mg?.chargeSpeedMultiplier,
        chargeDuration: mg?.chargeDuration,
        chargeInterval: mg?.chargeInterval,
      };
    });

    expect(result.confuseOnHit).toBe(true);
    expect(result.confuseDuration).toBe(2500);
    expect(result.confuseChance).toBe(0.25);
    expect(result.charge).toBe(true);
    expect(result.chargeHpThreshold).toBe(0.50);
    expect(result.chargeSpeedMultiplier).toBe(2.0);
    expect(result.chargeDuration).toBe(2000);
    expect(result.chargeInterval).toBe(10000);
  });
});
