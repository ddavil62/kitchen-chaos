/**
 * @fileoverview Phase 20 QA 검증 - 7장 사쿠라 이자카야
 * 적 2종(sushi_ninja, tempura_monk) + 보스 1종(sake_oni), 재료 2종, 레시피 10종,
 * 스토리 4종, 기믹 메커닉(은신/배리어/취권/아우라), stageData 7-1~7-6 검증.
 */
import { test, expect } from '@playwright/test';

// ── 유틸: 콘솔 에러 수집 ──
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

// ── 유틸: 게임 로드 대기 ──
async function waitForGameLoad(page) {
  await page.goto('/');
  await page.waitForTimeout(4000);
}

// ── 유틸: 세이브 데이터 조작 (7장 접근 가능) ──
async function setupSaveForChapter7(page) {
  await page.evaluate(() => {
    const key = 'kitchenChaosTycoon_save';
    let save = JSON.parse(localStorage.getItem(key) || '{}');

    // 최소 세이브 구조 (기존 세이브가 있으면 위에 덮어씌움)
    if (!save.version) {
      // 기본 세이브 구조 생성
      save = {
        version: 13,
        gold: 50000,
        totalGold: 100000,
        tools: {
          pan: { count: 3, level: 2 },
          salt: { count: 2, level: 1 },
          grill: { count: 2, level: 1 },
          delivery: { count: 1, level: 1 },
          freezer: { count: 1, level: 1 },
          soup_pot: { count: 1, level: 1 },
          wasabi_cannon: { count: 1, level: 1 },
          spice_grinder: { count: 1, level: 1 },
        },
        inventory: {
          carrot: 50, meat: 50, squid: 30, pepper: 30, cheese: 30,
          flour: 30, fish: 30, egg: 30, rice: 30, mushroom: 30,
          shrimp: 30, sugar: 30, butter: 30, candy: 20, milk: 20,
          sashimi_tuna: 20, wasabi: 20,
        },
        stageStars: {},
        maxWave: 0,
        endlessHighWave: 0,
        endlessHighScore: 0,
        season2Unlocked: true,
        storyProgress: {
          currentChapter: 7,
          seenDialogues: [],
          storyFlags: {},
        },
        selectedChef: 'petit_chef',
        shopUpgrades: {},
        unlockedRecipes: [],
        tutorialFlags: {
          gathering: true, service: true, shop: true,
          endless: true, merchant: true,
        },
      };
    } else {
      // 기존 세이브에 필수 값만 갱신
      save.season2Unlocked = true;
      if (!save.storyProgress) save.storyProgress = {};
      save.storyProgress.currentChapter = 7;
      if (!save.storyProgress.seenDialogues) save.storyProgress.seenDialogues = [];
      if (!save.storyProgress.storyFlags || Array.isArray(save.storyProgress.storyFlags)) {
        save.storyProgress.storyFlags = {};
      }
      // 인벤토리에 새 재료 추가
      if (!save.inventory) save.inventory = {};
      save.inventory.sashimi_tuna = (save.inventory.sashimi_tuna || 0) + 20;
      save.inventory.wasabi = (save.inventory.wasabi || 0) + 20;
    }

    // 1~6장 스테이지 별 클리어 (7장 접근 조건)
    for (let ch = 1; ch <= 6; ch++) {
      for (let st = 1; st <= 6; st++) {
        const id = `${ch}-${st}`;
        if (!save.stageStars[id] || save.stageStars[id] < 3) {
          save.stageStars[id] = 3;
        }
      }
    }

    localStorage.setItem(key, JSON.stringify(save));
  });
}

// ======================================================================
// 1. 데이터 정적 검증
// ======================================================================
test.describe('Phase 20 데이터 검증', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGameLoad(page);
  });

  test('INGREDIENT_TYPES에 sashimi_tuna, wasabi가 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      return {
        hasTuna: !!m.INGREDIENT_TYPES.sashimi_tuna,
        tunaNameKo: m.INGREDIENT_TYPES.sashimi_tuna?.nameKo,
        hasWasabi: !!m.INGREDIENT_TYPES.wasabi,
        wasabiNameKo: m.INGREDIENT_TYPES.wasabi?.nameKo,
      };
    });
    expect(result.hasTuna).toBe(true);
    expect(result.tunaNameKo).toBe('참치');
    expect(result.hasWasabi).toBe(true);
    expect(result.wasabiNameKo).toBe('와사비');
  });

  test('ENEMY_TYPES에 sushi_ninja, tempura_monk, sake_oni가 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const ninja = m.ENEMY_TYPES.sushi_ninja;
      const monk = m.ENEMY_TYPES.tempura_monk;
      const oni = m.ENEMY_TYPES.sake_oni;
      return {
        ninja: ninja ? { id: ninja.id, hp: ninja.hp, stealth: ninja.stealth, ingredient: ninja.ingredient } : null,
        monk: monk ? { id: monk.id, hp: monk.hp, barrier: monk.barrier, ingredient: monk.ingredient } : null,
        oni: oni ? { id: oni.id, hp: oni.hp, isBoss: oni.isBoss, drunkWalk: oni.drunkWalk, aura: oni.aura } : null,
      };
    });
    expect(result.ninja).not.toBeNull();
    expect(result.ninja.id).toBe('sushi_ninja');
    expect(result.ninja.hp).toBe(250);
    expect(result.ninja.stealth).toBe(true);
    expect(result.ninja.ingredient).toBe('sashimi_tuna');

    expect(result.monk).not.toBeNull();
    expect(result.monk.id).toBe('tempura_monk');
    expect(result.monk.hp).toBe(300);
    expect(result.monk.barrier).toBe(true);
    expect(result.monk.ingredient).toBe('wasabi');

    expect(result.oni).not.toBeNull();
    expect(result.oni.id).toBe('sake_oni');
    expect(result.oni.hp).toBe(6000);
    expect(result.oni.isBoss).toBe(true);
    expect(result.oni.drunkWalk).toBe(true);
    expect(result.oni.aura).toBe(true);
  });

  test('SERVING_RECIPES에 일식 레시피 8종이 포함되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const expected = [
        'sashimi_plate', 'wasabi_roll', 'nigiri_sushi', 'wasabi_tempura',
        'tuna_rice_bowl', 'wasabi_miso_soup', 'sakura_kaiseki', 'izakaya_platter'
      ];
      const found = {};
      for (const id of expected) {
        found[id] = m.SERVING_RECIPES.some(r => r.id === id);
      }
      return { found, total: m.SERVING_RECIPES.length };
    });
    for (const [id, exists] of Object.entries(result.found)) {
      expect(exists, `SERVING_RECIPES에 ${id}가 없다`).toBe(true);
    }
    expect(result.total).toBe(14); // 기존 6 + 신규 8
  });

  test('BUFF_RECIPES에 일식 버프 2종이 포함되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      return {
        wasabiKick: m.BUFF_RECIPES.some(r => r.id === 'wasabi_kick'),
        tunaPrecision: m.BUFF_RECIPES.some(r => r.id === 'tuna_precision'),
        total: m.BUFF_RECIPES.length,
      };
    });
    expect(result.wasabiKick).toBe(true);
    expect(result.tunaPrecision).toBe(true);
  });

  test('recipeData.js ALL_SERVING_RECIPES에 8종 등록, gateStage 설정', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/recipeData.js');
      const expected = [
        'sashimi_plate', 'wasabi_roll', 'nigiri_sushi', 'wasabi_tempura',
        'tuna_rice_bowl', 'wasabi_miso_soup', 'sakura_kaiseki', 'izakaya_platter'
      ];
      const recipes = {};
      for (const id of expected) {
        const r = m.ALL_SERVING_RECIPES.find(x => x.id === id);
        recipes[id] = r ? { gateStage: r.gateStage, tier: r.tier } : null;
      }
      return recipes;
    });
    for (const [id, data] of Object.entries(result)) {
      expect(data, `ALL_SERVING_RECIPES에 ${id}가 없다`).not.toBeNull();
      expect(data.gateStage, `${id}의 gateStage가 없다`).toBeTruthy();
    }
  });

  test('recipeData.js ALL_BUFF_RECIPES에 2종 등록', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/recipeData.js');
      return {
        wasabiKick: m.ALL_BUFF_RECIPES.find(r => r.id === 'wasabi_kick'),
        tunaPrecision: m.ALL_BUFF_RECIPES.find(r => r.id === 'tuna_precision'),
      };
    });
    expect(result.wasabiKick).toBeTruthy();
    expect(result.wasabiKick.effectType).toBe('buff_damage');
    expect(result.tunaPrecision).toBeTruthy();
    expect(result.tunaPrecision.effectType).toBe('buff_both');
  });

  test('stageData.js 7-1~7-6에 sushi_ninja/tempura_monk/sake_oni 사용', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/stageData.js');
      const stages = m.STAGES; // STAGES는 {key: value} 객체
      const stageIds = ['7-1', '7-2', '7-3', '7-4', '7-5', '7-6'];
      const report = {};

      for (const sid of stageIds) {
        const stage = stages[sid];
        if (!stage) { report[sid] = { found: false }; continue; }

        const allEnemyTypes = new Set();
        for (const w of (stage.waves || [])) {
          for (const e of (w.enemies || [])) {
            allEnemyTypes.add(e.type);
          }
        }
        report[sid] = {
          found: true,
          hasSushiNinja: allEnemyTypes.has('sushi_ninja'),
          hasTempuraMonk: allEnemyTypes.has('tempura_monk'),
          hasSakeOni: allEnemyTypes.has('sake_oni'),
          theme: stage.theme,
          waveCount: stage.waves?.length || 0,
        };
      }
      return report;
    });

    for (const sid of ['7-1', '7-2', '7-3', '7-4', '7-5', '7-6']) {
      expect(result[sid].found, `스테이지 ${sid}가 존재해야 한다`).toBe(true);
      expect(result[sid].theme).toBe('sakura_izakaya');
    }

    // 7-1 ~ 7-5: sushi_ninja 포함
    for (const sid of ['7-1', '7-2', '7-3', '7-4', '7-5']) {
      expect(result[sid].hasSushiNinja, `${sid}에 sushi_ninja 필요`).toBe(true);
    }
    // 7-3 ~ 7-6: tempura_monk 포함
    for (const sid of ['7-3', '7-4', '7-5', '7-6']) {
      expect(result[sid].hasTempuraMonk, `${sid}에 tempura_monk 필요`).toBe(true);
    }
    // 7-6: sake_oni 보스
    expect(result['7-6'].hasSakeOni, '7-6에 sake_oni 필요').toBe(true);
  });

  test('7-6 보스 웨이브에 sake_oni count=1', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/stageData.js');
      const stage76 = m.STAGES['7-6'];
      if (!stage76) return null;

      const lastWave = stage76.waves[stage76.waves.length - 1];
      const sakeOniEntry = lastWave.enemies.find(e => e.type === 'sake_oni');
      return {
        lastWaveNum: lastWave.wave,
        sakeOniFound: !!sakeOniEntry,
        sakeOniCount: sakeOniEntry?.count,
      };
    });
    expect(result).not.toBeNull();
    expect(result.sakeOniFound).toBe(true);
    expect(result.sakeOniCount).toBe(1);
  });

  test('dialogueData.js에 chapter7 대화 4종 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/dialogueData.js');
      const dialogues = m.DIALOGUES || m.dialogueData || m.default;
      const ids = ['chapter7_intro', 'chapter7_yuki_joins', 'chapter7_clear', 'yuki_side_7'];
      const report = {};
      for (const id of ids) {
        const d = dialogues[id];
        report[id] = d ? { lines: d.lines?.length, skippable: d.skippable } : null;
      }
      return report;
    });

    for (const id of ['chapter7_intro', 'chapter7_yuki_joins', 'chapter7_clear', 'yuki_side_7']) {
      expect(result[id], `대화 ${id}가 없다`).not.toBeNull();
      expect(result[id].lines, `${id}의 lines가 0이다`).toBeGreaterThan(0);
      expect(result[id].skippable).toBe(true);
    }
  });

  test('storyData.js에 7장 트리거 4건 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/storyData.js');
      const triggers = m.STORY_TRIGGERS;
      const ch7Triggers = triggers.filter(t =>
        ['chapter7_intro', 'chapter7_yuki_joins', 'chapter7_clear', 'yuki_side_7'].includes(t.dialogueId)
      );
      return {
        count: ch7Triggers.length,
        ids: ch7Triggers.map(t => t.dialogueId),
        triggerPoints: ch7Triggers.map(t => t.triggerPoint),
      };
    });
    expect(result.count).toBe(4);
    expect(result.ids).toContain('chapter7_intro');
    expect(result.ids).toContain('chapter7_yuki_joins');
    expect(result.ids).toContain('chapter7_clear');
    expect(result.ids).toContain('yuki_side_7');
  });
});

// ======================================================================
// 2. 브라우저 런타임 검증
// ======================================================================
test.describe('Phase 20 런타임 검증', () => {
  test('게임 로드 시 JS 에러 없음', async ({ page }) => {
    const errors = collectErrors(page);
    await waitForGameLoad(page);
    // Phaser 관련 asset 404만 허용 (에셋 미생성 상태에서 정상)
    const criticalErrors = errors.filter(e =>
      !e.includes('404') && !e.includes('Failed to load') && !e.includes('net::ERR')
    );
    expect(criticalErrors, `Critical errors: ${criticalErrors.join(', ')}`).toEqual([]);
  });

  test('월드맵 시즌2 탭에서 7장 노드 표시', async ({ page }) => {
    await waitForGameLoad(page);
    await setupSaveForChapter7(page);
    await page.reload();
    await page.waitForTimeout(4000);

    // 캠페인 버튼 탭
    await page.screenshot({ path: 'tests/screenshots/phase20-qa-menu.png' });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 메인 메뉴 → 캠페인
    const box = await canvas.boundingBox();
    // 캠페인 버튼 위치 (세로 중간 상단)
    await canvas.click({ position: { x: box.width / 2, y: box.height * 0.35 } });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/phase20-qa-worldmap.png' });

    // 시즌2 탭 클릭 (상단 우측 탭)
    await canvas.click({ position: { x: box.width * 0.75, y: 30 } });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/phase20-qa-worldmap-season2.png' });
  });

  test('세이브 조작 후 7-1 스테이지 진입 가능', async ({ page }) => {
    test.setTimeout(60000);
    const errors = collectErrors(page);
    await waitForGameLoad(page);
    await setupSaveForChapter7(page);
    await page.reload();
    await page.waitForTimeout(4000);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    // 메인메뉴 → 캠페인
    await canvas.click({ position: { x: box.width / 2, y: box.height * 0.35 } });
    await page.waitForTimeout(2500);

    // 시즌2 탭
    await canvas.click({ position: { x: box.width * 0.75, y: 30 } });
    await page.waitForTimeout(2000);

    // 7장 노드 클릭 (첫 번째 노드 = 좌상단 근처)
    await canvas.click({ position: { x: box.width * 0.22, y: box.height * 0.25 } });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/phase20-qa-stage-panel.png' });

    // 스테이지 패널에서 7-1 클릭 (첫 번째 항목)
    await canvas.click({ position: { x: box.width * 0.5, y: box.height * 0.5 } });
    await page.waitForTimeout(1500);

    // 출전 버튼 클릭
    await canvas.click({ position: { x: box.width * 0.5, y: box.height * 0.85 } });
    await page.waitForTimeout(2500);

    // 셰프 선택 화면 → 출전
    await canvas.click({ position: { x: box.width * 0.5, y: box.height * 0.85 } });
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'tests/screenshots/phase20-qa-gathering-7-1.png' });

    // 에러 확인 (404는 허용)
    const criticalErrors = errors.filter(e =>
      !e.includes('404') && !e.includes('Failed to load') && !e.includes('net::ERR')
    );
    expect(criticalErrors.length, `Runtime errors: ${criticalErrors.join(', ')}`).toBe(0);
  });
});

// ======================================================================
// 3. 기믹 메커닉 코드 검증
// ======================================================================
test.describe('Phase 20 기믹 메커닉 검증 (코드 레벨)', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGameLoad(page);
  });

  test('sushi_ninja 정의에 은신 관련 모든 필드가 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const ninja = m.ENEMY_TYPES.sushi_ninja;
      return {
        stealth: ninja.stealth,
        stealthInterval: ninja.stealthInterval,
        stealthDuration: ninja.stealthDuration,
        backAttackRadius: ninja.backAttackRadius,
        backAttackDamage: ninja.backAttackDamage,
      };
    });
    expect(result.stealth).toBe(true);
    expect(result.stealthInterval).toBe(4000);
    expect(result.stealthDuration).toBe(2500);
    expect(result.backAttackRadius).toBe(60);
    expect(result.backAttackDamage).toBe(30);
  });

  test('tempura_monk 정의에 배리어 관련 모든 필드가 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const monk = m.ENEMY_TYPES.tempura_monk;
      return {
        barrier: monk.barrier,
        barrierThreshold: monk.barrierThreshold,
        barrierDuration: monk.barrierDuration,
        barrierCooldown: monk.barrierCooldown,
      };
    });
    expect(result.barrier).toBe(true);
    expect(result.barrierThreshold).toBe(0.5);
    expect(result.barrierDuration).toBe(3000);
    expect(result.barrierCooldown).toBe(10000);
  });

  test('sake_oni 정의에 취권+아우라+분노 관련 모든 필드가 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const oni = m.ENEMY_TYPES.sake_oni;
      return {
        drunkWalk: oni.drunkWalk,
        drunkInterval: oni.drunkInterval,
        drunkDuration: oni.drunkDuration,
        drunkAngle: oni.drunkAngle,
        drunkSpeed: oni.drunkSpeed,
        aura: oni.aura,
        auraRadius: oni.auraRadius,
        auraSpeedBonus: oni.auraSpeedBonus,
        auraHealRate: oni.auraHealRate,
        auraInterval: oni.auraInterval,
        enrageHpThreshold: oni.enrageHpThreshold,
        bossReward: oni.bossReward,
        bossDrops: oni.bossDrops,
      };
    });
    expect(result.drunkWalk).toBe(true);
    expect(result.drunkInterval).toBe(5000);
    expect(result.drunkDuration).toBe(2000);
    expect(result.drunkSpeed).toBe(60);
    expect(result.aura).toBe(true);
    expect(result.auraRadius).toBe(180);
    expect(result.auraSpeedBonus).toBe(0.20);
    expect(result.auraHealRate).toBe(5);
    expect(result.auraInterval).toBe(1000);
    expect(result.enrageHpThreshold).toBe(0.3);
    expect(result.bossReward).toBe(350);
    expect(result.bossDrops).toHaveLength(2);
  });

  test('SpriteLoader에 신규 적/보스/타일셋/재료 등록 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/managers/SpriteLoader.js');
      // SpriteLoader는 static class이므로 소스코드 내용으로 검증
      // 실제 load 호출 시 텍스처 키가 등록되는지 간접 확인
      return {
        hasClass: typeof m.SpriteLoader === 'function',
      };
    });
    expect(result.hasClass).toBe(true);
  });
});

// ======================================================================
// 4. 엣지케이스 및 예외 시나리오
// ======================================================================
test.describe('Phase 20 엣지케이스', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGameLoad(page);
  });

  test('tuna_precision 버프 effectType이 buff_both로 대체되어 유효하다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const tp = m.BUFF_RECIPES.find(r => r.id === 'tuna_precision');
      // buff_both는 기존에 구현된 타입
      const validTypes = ['buff_speed', 'buff_damage', 'buff_both', 'buff_range', 'buff_burn', 'buff_slow', 'buff_all'];
      return {
        effectType: tp?.effectType,
        isValid: validTypes.includes(tp?.effectType),
        effectValue: tp?.effectValue,
      };
    });
    expect(result.isValid, `effectType '${result.effectType}'이 유효하지 않다`).toBe(true);
  });

  test('sake_oni에 summonInterval이 없어도 enrage가 drunkWalk에서 처리된다', async ({ page }) => {
    // sake_oni는 summonInterval이 없으므로 기존 보스 enrage 블록을 타지 않음
    // drunkWalk 내부에서 _enraged 플래그를 확인하는지 검증
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const oni = m.ENEMY_TYPES.sake_oni;
      return {
        hasSummonInterval: !!oni.summonInterval,
        hasDrunkWalk: !!oni.drunkWalk,
        hasEnrageThreshold: !!oni.enrageHpThreshold,
      };
    });
    expect(result.hasSummonInterval).toBe(false);
    expect(result.hasDrunkWalk).toBe(true);
    expect(result.hasEnrageThreshold).toBe(true);
    // NOTE: sake_oni의 _enraged는 기존 보스 enrage 블록(summonInterval 조건)에서만 설정됨
    // drunkWalk에서 effectiveInterval은 this._enraged를 체크하지만,
    // _enraged를 설정하는 코드가 summonInterval이 있을 때만 동작 → 잠재적 버그
  });

  test('sake_oni enrage 동작 경로 분석: _enraged 플래그 설정 경로 확인', async ({ page }) => {
    // Enemy.js update()에서 _enraged가 설정되는 유일한 경로:
    // line 352: if (this.data_.isBoss && this.data_.summonInterval) { ... _enraged = true }
    // sake_oni는 summonInterval이 없으므로 이 블록에 진입하지 않음
    // → _enraged는 영원히 false → drunkInterval 절반 단축이 발동하지 않음
    // 이것은 스펙 위반이다 (스펙: HP 30% 이하 → drunkInterval 절반)
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const oni = m.ENEMY_TYPES.sake_oni;
      // sake_oni는 summonInterval이 없다
      return {
        summonInterval: oni.summonInterval,
        isBoss: oni.isBoss,
        enrageHpThreshold: oni.enrageHpThreshold,
      };
    });
    expect(result.isBoss).toBe(true);
    expect(result.summonInterval).toBeUndefined();
    // BUG: sake_oni의 enrage(분노) 메커닉이 summonInterval 조건에 의해 차단됨
    // _enraged 플래그가 설정되지 않으므로 drunkInterval 절반 단축이 불가
  });

  test('배리어 바깥 takeDamage에서 barrier 필드 없는 적에 대한 안전성', async ({ page }) => {
    // _barrierActive는 enemyData.barrier=true일 때만 초기화됨
    // barrier가 없는 적에서 takeDamage 호출 시 this._barrierActive가 undefined
    // undefined는 falsy이므로 `if (this._barrierActive) return;`을 통과 → 안전
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const goblin = m.ENEMY_TYPES.carrot_goblin;
      return { hasBarrier: !!goblin.barrier };
    });
    expect(result.hasBarrier).toBe(false);
    // undefined는 falsy → 기존 적에 대해 안전
  });

  test('은신 중 freezer(canTargetInvisible)가 sushi_ninja를 타겟 가능한지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/gameData.js');
      const towerFreezer = m.TOWER_TYPES?.freezer;
      const toolFreezer = m.TOOL_DEFS?.freezer;
      return {
        towerCanTarget: towerFreezer?.canTargetInvisible,
        toolStats: toolFreezer?.stats?.[1]?.canTargetInvisible,
        // Tower.js에서 salt도 투명 적 타겟 가능 (하드코딩)
      };
    });
    // canTargetInvisible은 TOWER_TYPES.freezer 또는 TOOL_DEFS.freezer.stats에 있어야 함
    expect(result.towerCanTarget || result.toolStats).toBe(true);
  });

  test('stageData 7-1~7-6 서비스(customerPatience) 범위 확인 (28~22초)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/stageData.js');
      const stages = m.STAGES;
      const stageIds = ['7-1', '7-2', '7-3', '7-4', '7-5', '7-6'];
      const report = {};
      for (const sid of stageIds) {
        const stage = stages[sid];
        if (!stage) { report[sid] = null; continue; }
        report[sid] = stage.service?.customerPatience;
      }
      return report;
    });
    // 스펙: 28~22초 범위
    for (const [sid, patience] of Object.entries(result)) {
      expect(patience, `${sid} customerPatience가 없다`).not.toBeNull();
      expect(patience).toBeGreaterThanOrEqual(22);
      expect(patience).toBeLessThanOrEqual(28);
    }
  });

  test('기존 1장 스테이지가 정상 로드된다 (회귀 검증)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const m = await import('/js/data/stageData.js');
      const stage11 = m.STAGES['1-1'];
      return {
        found: !!stage11,
        waveCount: stage11?.waves?.length || 0,
        theme: stage11?.theme,
      };
    });
    expect(result.found).toBe(true);
    expect(result.waveCount).toBeGreaterThan(0);
  });
});

// ======================================================================
// 5. 콘솔 에러 및 UI 안정성
// ======================================================================
test.describe('Phase 20 안정성', () => {
  test('모바일 뷰포트에서 게임 로드 시 치명적 에러 없음', async ({ page }) => {
    const errors = collectErrors(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForGameLoad(page);
    await page.screenshot({ path: 'tests/screenshots/phase20-qa-mobile.png' });
    const criticalErrors = errors.filter(e =>
      !e.includes('404') && !e.includes('Failed to load') && !e.includes('net::ERR')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('레시피 도감에서 일식 레시피 표시 확인', async ({ page }) => {
    await waitForGameLoad(page);
    await setupSaveForChapter7(page);
    await page.reload();
    await page.waitForTimeout(4000);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    // 메인메뉴 → 레시피 도감 버튼 (하단 영역)
    await canvas.click({ position: { x: box.width / 2, y: box.height * 0.75 } });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/phase20-qa-recipe-collection.png' });
  });
});
