/**
 * @fileoverview Phase 21 QA - 8장 용의 주방 검증 테스트.
 * 재료/적/레시피/스테이지/스토리 데이터 정합성 + 기믹 로직 + 회귀 테스트.
 */

import { test, expect } from '@playwright/test';

// ── 게임 로드 대기 헬퍼 ──
async function waitForGameReady(page, timeout = 15000) {
  await page.goto('/');
  // Phaser game 객체가 로드될 때까지 대기
  await page.waitForFunction(() => {
    return typeof window !== 'undefined' &&
      window.game &&
      window.game.scene &&
      window.game.scene.scenes &&
      window.game.scene.scenes.length > 0;
  }, { timeout });
}

// ── GAME_DATA 평가 헬퍼 (ES 모듈 임포트) ──
async function importGameData(page) {
  return page.evaluate(async () => {
    const mod = await import('/js/data/gameData.js');
    return {
      ENEMY_TYPES: JSON.parse(JSON.stringify(mod.ENEMY_TYPES)),
      INGREDIENT_TYPES: JSON.parse(JSON.stringify(mod.INGREDIENT_TYPES)),
      SERVING_RECIPES: JSON.parse(JSON.stringify(mod.SERVING_RECIPES)),
      BUFF_RECIPES: JSON.parse(JSON.stringify(mod.BUFF_RECIPES)),
    };
  });
}

async function importStageData(page) {
  return page.evaluate(async () => {
    const mod = await import('/js/data/stageData.js');
    return {
      STAGES: JSON.parse(JSON.stringify(mod.STAGES)),
      STAGE_ORDER: mod.STAGE_ORDER,
    };
  });
}

async function importDialogueData(page) {
  return page.evaluate(async () => {
    const mod = await import('/js/data/dialogueData.js');
    return {
      DIALOGUES: JSON.parse(JSON.stringify(mod.DIALOGUES)),
      CHARACTERS: JSON.parse(JSON.stringify(mod.CHARACTERS)),
    };
  });
}

async function importStoryData(page) {
  return page.evaluate(async () => {
    const mod = await import('/js/data/storyData.js');
    // STORY_TRIGGERS 는 함수 포함이므로 직렬화 불가 -> 개수와 트리거 포인트만 추출
    const triggers = mod.STORY_TRIGGERS.map(t => ({
      triggerPoint: t.triggerPoint,
      dialogueId: t.dialogueId,
      once: t.once,
      hasCondition: typeof t.condition === 'function',
      hasOnComplete: typeof t.onComplete === 'function',
      delay: t.delay,
    }));
    return { triggers };
  });
}

// ══════════════════════════════════════════════════════════════
// 21-1: 재료 데이터
// ══════════════════════════════════════════════════════════════
test.describe('21-1: 재료 데이터', () => {
  test('tofu 재료가 INGREDIENT_TYPES에 존재하고 필수 필드를 포함한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const tofu = data.INGREDIENT_TYPES.tofu;
    expect(tofu).toBeDefined();
    expect(tofu.id).toBe('tofu');
    expect(tofu.nameKo).toBe('두부');
    expect(tofu.icon).toBeTruthy();
    expect(tofu.color).toBeTruthy();
  });

  test('cilantro 재료가 INGREDIENT_TYPES에 존재하고 필수 필드를 포함한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const cilantro = data.INGREDIENT_TYPES.cilantro;
    expect(cilantro).toBeDefined();
    expect(cilantro.id).toBe('cilantro');
    expect(cilantro.nameKo).toBe('고수');
    expect(cilantro.icon).toBeTruthy();
    expect(cilantro.color).toBeTruthy();
  });

  test('재료 총 수가 19종이다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const count = Object.keys(data.INGREDIENT_TYPES).length;
    expect(count).toBe(19);
  });
});

// ══════════════════════════════════════════════════════════════
// 21-2: 적 데이터 + 기믹
// ══════════════════════════════════════════════════════════════
test.describe('21-2: 적 데이터 + 기믹', () => {
  test('dumpling_warrior 타입이 존재하고 분열 기믹 필드가 올바르다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const dw = data.ENEMY_TYPES.dumpling_warrior;
    expect(dw).toBeDefined();
    expect(dw.id).toBe('dumpling_warrior');
    expect(dw.nameKo).toBe('만두 전사');
    expect(dw.hp).toBe(280);
    expect(dw.speed).toBe(50);
    expect(dw.ingredient).toBe('tofu');
    expect(dw.split).toBe(true);
    expect(dw.splitCount).toBe(2);
    expect(dw.splitType).toBe('mini_dumpling');
  });

  test('mini_dumpling 타입이 존재하고 split: false (무한 분열 방지)', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const md = data.ENEMY_TYPES.mini_dumpling;
    expect(md).toBeDefined();
    expect(md.id).toBe('mini_dumpling');
    expect(md.hp).toBe(60);
    expect(md.speed).toBe(65);
    expect(md.ingredient).toBe('tofu');
    // CRITICAL: 무한 분열 방지
    expect(md.split).toBe(false);
  });

  test('wok_phantom 타입이 존재하고 화염 장판 기믹 필드가 올바르다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const wp = data.ENEMY_TYPES.wok_phantom;
    expect(wp).toBeDefined();
    expect(wp.id).toBe('wok_phantom');
    expect(wp.nameKo).toBe('웍 유령');
    expect(wp.hp).toBe(320);
    expect(wp.speed).toBe(40);
    expect(wp.ingredient).toBe('cilantro');
    expect(wp.fireZone).toBe(true);
    expect(wp.fireZoneInterval).toBe(4000);
    expect(wp.fireZoneRadius).toBe(55);
    expect(wp.fireZoneDuration).toBe(3500);
    expect(wp.fireZoneDebuffDuration).toBe(2500);
  });

  test('dragon_wok 보스 타입이 존재하고 3페이즈 기믹 필드가 올바르다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const dw = data.ENEMY_TYPES.dragon_wok;
    expect(dw).toBeDefined();
    expect(dw.id).toBe('dragon_wok');
    expect(dw.nameKo).toBe('드래곤 웍');
    expect(dw.hp).toBe(7000);
    expect(dw.speed).toBe(22);
    expect(dw.ingredient).toBeNull();
    expect(dw.isBoss).toBe(true);
    expect(dw.fireBreath).toBe(true);
    expect(dw.fireBreathPhases).toHaveLength(3);
    // 페이즈별 HP 임계치
    expect(dw.fireBreathPhases[0].hpThreshold).toBe(1.0);
    expect(dw.fireBreathPhases[1].hpThreshold).toBe(0.70);
    expect(dw.fireBreathPhases[2].hpThreshold).toBe(0.35);
    // 페이즈 2: mini_dumpling 소환
    expect(dw.fireBreathPhases[1].summonMini).toBe(3);
    expect(dw.fireBreathPhases[1].speedBonus).toBe(0.15);
    // 페이즈 3: 즉발 화염 장판
    expect(dw.fireBreathPhases[2].instantFireZones).toBe(2);
    // 보스 보상
    expect(dw.bossReward).toBe(400);
    expect(dw.bossDrops).toEqual([
      { ingredient: 'tofu', count: 4 },
      { ingredient: 'cilantro', count: 4 },
    ]);
  });

  test('mini_dumpling의 splitType이 존재하지 않는 적을 참조하지 않는다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    // mini_dumpling에 splitType이 있다면, 그 타입이 ENEMY_TYPES에 존재해야 한다
    const md = data.ENEMY_TYPES.mini_dumpling;
    if (md.splitType) {
      expect(data.ENEMY_TYPES[md.splitType]).toBeDefined();
    }
    // dumpling_warrior의 splitType이 실존하는지도 확인
    const dw = data.ENEMY_TYPES.dumpling_warrior;
    expect(data.ENEMY_TYPES[dw.splitType]).toBeDefined();
  });

  test('적 총 수가 29종이다 (일반 21 + 보스 8)', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const enemies = Object.values(data.ENEMY_TYPES);
    const total = enemies.length;
    const bosses = enemies.filter(e => e.isBoss).length;
    const normals = total - bosses;
    expect(total).toBe(29);
    expect(bosses).toBe(8);
    expect(normals).toBe(21);
  });
});

// ══════════════════════════════════════════════════════════════
// 21-3: 스테이지 데이터
// ══════════════════════════════════════════════════════════════
test.describe('21-3: 스테이지 데이터 (8-1 ~ 8-6)', () => {
  test('8-1 ~ 8-6 스테이지가 STAGES에 존재한다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    for (let i = 1; i <= 6; i++) {
      expect(STAGES[`8-${i}`]).toBeDefined();
    }
  });

  test('8-1 ~ 8-6 모두 theme: chinese_palace_kitchen 이다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    for (let i = 1; i <= 6; i++) {
      expect(STAGES[`8-${i}`].theme).toBe('chinese_palace_kitchen');
    }
  });

  test('8-1 ~ 8-5 웨이브에 dumpling_warrior가 포함되어 있다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    for (let i = 1; i <= 5; i++) {
      const stage = STAGES[`8-${i}`];
      const hasDumpling = stage.waves.some(w =>
        w.enemies.some(e => e.type === 'dumpling_warrior')
      );
      expect(hasDumpling).toBe(true);
    }
  });

  test('8-1 ~ 8-5 웨이브에 wok_phantom이 포함되어 있다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    // 8-1은 wave 4부터, 8-2~8-5 전부에 wok_phantom이 있어야 한다
    for (let i = 1; i <= 5; i++) {
      const stage = STAGES[`8-${i}`];
      const hasWok = stage.waves.some(w =>
        w.enemies.some(e => e.type === 'wok_phantom')
      );
      expect(hasWok).toBe(true);
    }
  });

  test('8-6 최종 웨이브에 dragon_wok(count:1)이 있다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    const stage86 = STAGES['8-6'];
    const lastWave = stage86.waves[stage86.waves.length - 1];
    const dragonEntry = lastWave.enemies.find(e => e.type === 'dragon_wok');
    expect(dragonEntry).toBeDefined();
    expect(dragonEntry.count).toBe(1);
  });

  test('8-1 ~ 8-6 서비스 설정: customerPatience 범위 21~27', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    const patienceValues = [];
    for (let i = 1; i <= 6; i++) {
      const patience = STAGES[`8-${i}`].service.customerPatience;
      patienceValues.push(patience);
      expect(patience).toBeGreaterThanOrEqual(21);
      expect(patience).toBeLessThanOrEqual(27);
    }
    // 인내심이 감소 추세여야 한다 (최소한 비증가)
    for (let i = 1; i < patienceValues.length; i++) {
      expect(patienceValues[i]).toBeLessThanOrEqual(patienceValues[i - 1]);
    }
  });

  test('STAGE_ORDER에 8-1 ~ 8-6이 포함되어 있다', async ({ page }) => {
    await page.goto('/');
    const { STAGE_ORDER } = await importStageData(page);
    for (let i = 1; i <= 6; i++) {
      expect(STAGE_ORDER).toContain(`8-${i}`);
    }
  });

  test('8장 웨이브에 사용된 모든 적 타입이 ENEMY_TYPES에 존재한다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    const gameData = await importGameData(page);
    const allEnemyIds = new Set(Object.keys(gameData.ENEMY_TYPES));
    const usedTypes = new Set();
    for (let i = 1; i <= 6; i++) {
      const stage = STAGES[`8-${i}`];
      stage.waves.forEach(w => {
        w.enemies.forEach(e => usedTypes.add(e.type));
      });
    }
    for (const type of usedTypes) {
      expect(allEnemyIds.has(type)).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════════
// 21-4: 레시피 데이터
// ══════════════════════════════════════════════════════════════
test.describe('21-4: 레시피 데이터', () => {
  const servingRecipeIds = [
    'mapo_tofu', 'cilantro_tofu_steam', 'dim_sum', 'wok_noodles',
    'tofu_hotpot', 'cilantro_shrimp_soup', 'peking_duck', 'dragon_feast',
  ];
  const buffRecipeIds = ['dragon_qi', 'wok_aura'];

  test('서빙 레시피 8종이 SERVING_RECIPES에 존재한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const existingIds = data.SERVING_RECIPES.map(r => r.id);
    for (const id of servingRecipeIds) {
      expect(existingIds).toContain(id);
    }
  });

  test('버프 레시피 2종이 BUFF_RECIPES에 존재한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const existingIds = data.BUFF_RECIPES.map(r => r.id);
    for (const id of buffRecipeIds) {
      expect(existingIds).toContain(id);
    }
  });

  test('서빙 레시피가 baseReward와 cookTime 필드를 포함한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    for (const id of servingRecipeIds) {
      const recipe = data.SERVING_RECIPES.find(r => r.id === id);
      expect(recipe.baseReward).toBeGreaterThan(0);
      expect(recipe.cookTime).toBeGreaterThan(0);
      expect(recipe.ingredients).toBeTruthy();
      expect(recipe.nameKo).toBeTruthy();
    }
  });

  test('버프 레시피가 effectType과 duration 필드를 포함한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    for (const id of buffRecipeIds) {
      const recipe = data.BUFF_RECIPES.find(r => r.id === id);
      expect(recipe.effectType).toBeTruthy();
      expect(recipe.effectValue).toBeGreaterThan(0);
      expect(recipe.duration).toBeGreaterThan(0);
      expect(recipe.ingredients).toBeTruthy();
    }
  });

  test('레시피 ingredients에 사용된 재료가 모두 INGREDIENT_TYPES에 존재한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const validIngredients = new Set(Object.keys(data.INGREDIENT_TYPES));
    const allRecipes = [...data.SERVING_RECIPES, ...data.BUFF_RECIPES];
    for (const recipe of allRecipes) {
      for (const ing of Object.keys(recipe.ingredients)) {
        expect(validIngredients.has(ing)).toBe(true);
      }
    }
  });

  test('wok_aura의 effectType이 유효하다 (buff_both 또는 buff_attack_speed)', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const wokAura = data.BUFF_RECIPES.find(r => r.id === 'wok_aura');
    // 스펙: buff_attack_speed가 없으면 buff_both로 대체
    expect(['buff_both', 'buff_attack_speed']).toContain(wokAura.effectType);
  });
});

// ══════════════════════════════════════════════════════════════
// 스토리 데이터
// ══════════════════════════════════════════════════════════════
test.describe('스토리 데이터', () => {
  test('chapter8 대화 4종이 DIALOGUES에 존재한다', async ({ page }) => {
    await page.goto('/');
    const { DIALOGUES } = await importDialogueData(page);
    const requiredIds = ['chapter8_intro', 'chapter8_lao_joins', 'chapter8_clear', 'lao_side_8'];
    for (const id of requiredIds) {
      expect(DIALOGUES[id]).toBeDefined();
      expect(DIALOGUES[id].id).toBe(id);
      expect(DIALOGUES[id].lines).toBeDefined();
      expect(DIALOGUES[id].lines.length).toBeGreaterThan(0);
    }
  });

  test('대화 스크립트에 speaker/portrait/text 필드가 모두 있다', async ({ page }) => {
    await page.goto('/');
    const { DIALOGUES } = await importDialogueData(page);
    const ids = ['chapter8_intro', 'chapter8_lao_joins', 'chapter8_clear', 'lao_side_8'];
    for (const id of ids) {
      for (const line of DIALOGUES[id].lines) {
        expect(line.speaker).toBeDefined();
        expect(line).toHaveProperty('portrait');
        expect(line.text).toBeTruthy();
      }
    }
  });

  test('STORY_TRIGGERS에 8장 관련 트리거 4건이 존재한다', async ({ page }) => {
    await page.goto('/');
    const { triggers } = await importStoryData(page);
    const ch8Triggers = triggers.filter(t =>
      ['chapter8_intro', 'chapter8_lao_joins', 'chapter8_clear', 'lao_side_8']
        .includes(t.dialogueId)
    );
    expect(ch8Triggers.length).toBe(4);
  });

  test('chapter8_intro 트리거가 gathering_enter에서 발동한다', async ({ page }) => {
    await page.goto('/');
    const { triggers } = await importStoryData(page);
    const t = triggers.find(t => t.dialogueId === 'chapter8_intro');
    expect(t.triggerPoint).toBe('gathering_enter');
    expect(t.once).toBe(true);
  });

  test('chapter8_lao_joins 트리거가 result_clear에서 발동한다', async ({ page }) => {
    await page.goto('/');
    const { triggers } = await importStoryData(page);
    const t = triggers.find(t => t.dialogueId === 'chapter8_lao_joins');
    expect(t.triggerPoint).toBe('result_clear');
    expect(t.once).toBe(true);
  });

  test('chapter8_clear 트리거에 onComplete 콜백이 있다 (플래그 설정)', async ({ page }) => {
    await page.goto('/');
    const { triggers } = await importStoryData(page);
    const t = triggers.find(t => t.dialogueId === 'chapter8_clear');
    expect(t.triggerPoint).toBe('result_clear');
    expect(t.hasOnComplete).toBe(true);
  });

  test('lao_side_8 트리거가 merchant_enter에서 발동한다', async ({ page }) => {
    await page.goto('/');
    const { triggers } = await importStoryData(page);
    const t = triggers.find(t => t.dialogueId === 'lao_side_8');
    expect(t.triggerPoint).toBe('merchant_enter');
    expect(t.once).toBe(true);
  });

  test('stage_first_clear 트리거의 제외 목록에 8-1, 8-3, 8-6이 포함된다', async ({ page }) => {
    await page.goto('/');
    // 스토리 트리거에서 stage_first_clear 조건 함수를 직접 테스트
    const exclusions = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      // stage_first_clear 중 once: false인 일반 첫 클리어 트리거 찾기
      const generalClear = mod.STORY_TRIGGERS.find(t =>
        t.dialogueId === 'stage_first_clear' && t.once === false &&
        // 일반 첫 클리어 (1-6 전용이 아닌 것)
        !t.chain
      );
      if (!generalClear) return { found: false };
      // 8-1, 8-3, 8-6이 제외되는지 확인
      const test81 = generalClear.condition({ isFirstClear: true, stars: 3, stageId: '8-1' });
      const test83 = generalClear.condition({ isFirstClear: true, stars: 3, stageId: '8-3' });
      const test86 = generalClear.condition({ isFirstClear: true, stars: 3, stageId: '8-6' });
      // 포함된 스테이지는 true 반환
      const test82 = generalClear.condition({ isFirstClear: true, stars: 3, stageId: '8-2' });
      return { found: true, excluded81: !test81, excluded83: !test83, excluded86: !test86, included82: test82 };
    });
    expect(exclusions.found).toBe(true);
    expect(exclusions.excluded81).toBe(true);
    expect(exclusions.excluded83).toBe(true);
    expect(exclusions.excluded86).toBe(true);
    expect(exclusions.included82).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// SpriteLoader 등록
// ══════════════════════════════════════════════════════════════
test.describe('SpriteLoader 등록', () => {
  test('SpriteLoader에 dumpling_warrior, mini_dumpling, wok_phantom ENEMY_IDS가 등록되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/managers/SpriteLoader.js')).text();
      return {
        hasDumplingWarrior: text.includes("'dumpling_warrior'"),
        hasMiniDumpling: text.includes("'mini_dumpling'"),
        hasWokPhantom: text.includes("'wok_phantom'"),
      };
    });
    expect(result.hasDumplingWarrior).toBe(true);
    expect(result.hasMiniDumpling).toBe(true);
    expect(result.hasWokPhantom).toBe(true);
  });

  test('SpriteLoader에 dragon_wok BOSS_IDS가 등록되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/managers/SpriteLoader.js')).text();
      return text.includes("'dragon_wok'");
    });
    expect(result).toBe(true);
  });

  test('SpriteLoader에 chinese_palace_kitchen TILESET_IDS가 등록되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/managers/SpriteLoader.js')).text();
      return text.includes("'chinese_palace_kitchen'");
    });
    expect(result).toBe(true);
  });

  test('SpriteLoader INGREDIENT_FILE_MAP에 tofu, cilantro가 등록되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/managers/SpriteLoader.js')).text();
      return {
        hasTofu: text.includes('tofu:') && text.includes("'tofu'"),
        hasCilantro: text.includes('cilantro:') && text.includes("'cilantro'"),
      };
    });
    expect(result.hasTofu).toBe(true);
    expect(result.hasCilantro).toBe(true);
  });

  test('dumpling_warrior 걷기 애니메이션 해시가 등록되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/managers/SpriteLoader.js')).text();
      return text.includes('animating-1e8cfa3d');
    });
    expect(result).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// Enemy.js 기믹 로직 정적 분석 (소스 코드 검증)
// ══════════════════════════════════════════════════════════════
test.describe('Enemy.js 기믹 로직 정적 검증', () => {
  test('Enemy.js에 split 분열 로직이 _die()에 구현되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/entities/Enemy.js')).text();
      return {
        hasSplitCheck: text.includes("this.data_.split === true"),
        hasEmitSplit: text.includes("'enemy_deterministic_split'"),
        hasSplitExecuted: text.includes("this._splitExecuted"),
      };
    });
    expect(result.hasSplitCheck).toBe(true);
    expect(result.hasEmitSplit).toBe(true);
    expect(result.hasSplitExecuted).toBe(true);
  });

  test('Enemy.js에 fireZone 화염 장판 로직이 구현되어 있다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/entities/Enemy.js')).text();
      return {
        hasFireZoneUpdate: text.includes('_updateFireZone'),
        hasFireZoneTimer: text.includes('_fireZoneTimer'),
        hasEmitFireZone: text.includes("'enemy_fire_zone'"),
      };
    });
    expect(result.hasFireZoneUpdate).toBe(true);
    expect(result.hasFireZoneTimer).toBe(true);
    expect(result.hasEmitFireZone).toBe(true);
  });

  test('Enemy.js에 3페이즈 전환 로직이 구현되어 있다 (BUG-01 방지)', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/entities/Enemy.js')).text();
      return {
        hasPhaseField: text.includes('this._phase'),
        hasEnterPhase: text.includes('_enterPhase'),
        hasFireBreathUpdate: text.includes('_updateFireBreath'),
        hasPhaseTransitioned: text.includes('_phaseTransitioned'),
        // BUG-01 방지: 페이즈 체크가 _updateFireBreath 밖, update() 내에서 호출됨
        hasPhaseCheckInUpdate: text.includes('if (this.data_.fireBreath)') &&
          text.includes('if (this._phase < 2 && hpRatio <= 0.70)'),
      };
    });
    expect(result.hasPhaseField).toBe(true);
    expect(result.hasEnterPhase).toBe(true);
    expect(result.hasFireBreathUpdate).toBe(true);
    expect(result.hasPhaseTransitioned).toBe(true);
    expect(result.hasPhaseCheckInUpdate).toBe(true);
  });

  test('_enterPhase(2)에서 mini_dumpling 소환과 속도 증가가 처리된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/entities/Enemy.js')).text();
      return {
        hasSpeedBonus: text.includes('this.data_.speed * 1.15'),
        hasMiniSummon: text.includes("type: 'mini_dumpling'"),
      };
    });
    expect(result.hasSpeedBonus).toBe(true);
    expect(result.hasMiniSummon).toBe(true);
  });

  test('_enterPhase(3)에서 즉발 fireZone 생성과 분노 상태가 처리된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/entities/Enemy.js')).text();
      return {
        hasPhase3Speed: text.includes('this.data_.speed * 1.30'),
        hasFireZoneEmit: text.includes("this.scene.events.emit('enemy_fire_zone'"),
        hasEnraged: text.includes('this._enraged = true'),
      };
    });
    expect(result.hasPhase3Speed).toBe(true);
    expect(result.hasFireZoneEmit).toBe(true);
    expect(result.hasEnraged).toBe(true);
  });

  test('카메라 셰이크 + VFX 스크린 플래시가 페이즈 전환 시 호출된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/entities/Enemy.js')).text();
      return {
        hasCameraShake: text.includes('cameras.main.shake'),
        hasScreenFlash: text.includes('vfx?.screenFlash') || text.includes('vfx.screenFlash'),
      };
    });
    expect(result.hasCameraShake).toBe(true);
    expect(result.hasScreenFlash).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// GatheringScene 이벤트 핸들러 검증
// ══════════════════════════════════════════════════════════════
test.describe('GatheringScene 이벤트 핸들러', () => {
  test('GatheringScene에 enemy_deterministic_split 이벤트 리스너가 등록/해제된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/scenes/GatheringScene.js')).text();
      const registered = text.includes("'enemy_deterministic_split', this._onDeterministicSplit");
      const unregistered = text.includes("events.off('enemy_deterministic_split'");
      return { registered, unregistered };
    });
    expect(result.registered).toBe(true);
    expect(result.unregistered).toBe(true);
  });

  test('GatheringScene에 enemy_fire_zone 이벤트 리스너가 등록/해제된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/scenes/GatheringScene.js')).text();
      const registered = text.includes("'enemy_fire_zone', this._onEnemyFireZone");
      const unregistered = text.includes("events.off('enemy_fire_zone'");
      return { registered, unregistered };
    });
    expect(result.registered).toBe(true);
    expect(result.unregistered).toBe(true);
  });

  test('GatheringScene에 dragon_fire_breath 이벤트 리스너가 등록/해제된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/scenes/GatheringScene.js')).text();
      const registered = text.includes("'dragon_fire_breath', this._onDragonFireBreath");
      const unregistered = text.includes("events.off('dragon_fire_breath'");
      return { registered, unregistered };
    });
    expect(result.registered).toBe(true);
    expect(result.unregistered).toBe(true);
  });

  test('GatheringScene shutdown()에서 _fireZones 정리가 실행된다', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const text = await (await fetch('/js/scenes/GatheringScene.js')).text();
      return text.includes('this._fireZones = []') && text.includes('zone.gfx?.destroy()');
    });
    expect(result).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// 기존 기능 회귀 테스트
// ══════════════════════════════════════════════════════════════
test.describe('기존 기능 회귀', () => {
  test('7장 사쿠라 이자카야 스테이지 데이터가 여전히 존재한다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    for (let i = 1; i <= 6; i++) {
      expect(STAGES[`7-${i}`]).toBeDefined();
      expect(STAGES[`7-${i}`].theme).toBe('sakura_izakaya');
    }
  });

  test('Phase 20 적 타입 (sushi_ninja, tempura_monk, sake_oni)이 여전히 존재한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    expect(data.ENEMY_TYPES.sushi_ninja).toBeDefined();
    expect(data.ENEMY_TYPES.tempura_monk).toBeDefined();
    expect(data.ENEMY_TYPES.sake_oni).toBeDefined();
  });

  test('Phase 20 재료 (sashimi_tuna, wasabi)가 여전히 존재한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    expect(data.INGREDIENT_TYPES.sashimi_tuna).toBeDefined();
    expect(data.INGREDIENT_TYPES.wasabi).toBeDefined();
  });

  test('기존 시즌 1 스테이지 (1-1 ~ 6-3)가 여전히 존재한다', async ({ page }) => {
    await page.goto('/');
    const { STAGES } = await importStageData(page);
    expect(STAGES['1-1']).toBeDefined();
    expect(STAGES['6-3']).toBeDefined();
  });

  test('기존 시즌 1 보스 타입이 여전히 존재한다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const bossIds = ['pasta_boss', 'dragon_ramen', 'seafood_kraken', 'lava_dessert_golem', 'master_patissier', 'cuisine_god'];
    for (const id of bossIds) {
      expect(data.ENEMY_TYPES[id]).toBeDefined();
      expect(data.ENEMY_TYPES[id].isBoss).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════════
// 콘솔 에러 검사
// ══════════════════════════════════════════════════════════════
test.describe('브라우저 안정성', () => {
  test('게임 로드 시 JS 예외가 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    // Phaser 초기화 대기
    await page.waitForTimeout(3000);
    // Phaser WebGL 경고 등은 pageerror가 아니므로 무시
    const criticalErrors = errors.filter(e =>
      !e.includes('WebGL') && !e.includes('AudioContext')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('콘솔 에러 로그가 없다 (심각 수준)', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // 에셋 404는 개발 환경에서 허용 (fallback 처리 존재)
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('404') && !e.includes('net::ERR') &&
      !e.includes('WebGL') && !e.includes('AudioContext')
    );
    expect(criticalErrors).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════
// 엣지케이스 및 예외 시나리오
// ══════════════════════════════════════════════════════════════
test.describe('엣지케이스', () => {
  test('cilantro와 wasabi 이모지가 동일해도 색상으로 구분 가능하다', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const cilantro = data.INGREDIENT_TYPES.cilantro;
    const wasabi = data.INGREDIENT_TYPES.wasabi;
    // 둘 다 icon이 같을 수 있으나, 색상이 달라야 구분 가능
    if (cilantro.icon === wasabi.icon) {
      expect(cilantro.color).not.toBe(wasabi.color);
    }
  });

  test('dragon_wok의 enrageHpThreshold와 페이즈3 임계치가 동일하다 (별도 분노 처리 불필요)', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const dw = data.ENEMY_TYPES.dragon_wok;
    expect(dw.enrageHpThreshold).toBe(dw.fireBreathPhases[2].hpThreshold);
  });

  test('dumpling_warrior의 bodyColor와 mini_dumpling의 bodyColor가 동일하다 (분열 관계 시각화)', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    expect(data.ENEMY_TYPES.dumpling_warrior.bodyColor)
      .toBe(data.ENEMY_TYPES.mini_dumpling.bodyColor);
  });

  test('dragon_feast 레시피의 재료 비용이 가장 높다 (tofu:2, cilantro:2, meat:1)', async ({ page }) => {
    await page.goto('/');
    const data = await importGameData(page);
    const df = data.SERVING_RECIPES.find(r => r.id === 'dragon_feast');
    expect(df.ingredients).toEqual({ tofu: 2, cilantro: 2, meat: 1 });
    expect(df.baseReward).toBe(130);
    expect(df.cookTime).toBe(13000);
  });
});
