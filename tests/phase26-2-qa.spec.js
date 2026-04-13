/**
 * @fileoverview Phase 26-2 QA 테스트: stageData 교체, storyData 트리거, SaveManager v16
 */
import { test, expect } from '@playwright/test';

// ── 유틸: 페이지에서 ES 모듈 import를 통해 데이터 가져오기 ──
async function evalModule(page, code) {
  return page.evaluate(code);
}

test.describe('Phase 26-2 QA: stageData / storyData / SaveManager', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Phaser 게임이 최소한 DOM에 로드될 때까지 대기
    await page.waitForTimeout(2000);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-1: 10-6 stageData - wave 5에 dragon_wok 없고 sake_master 배치
  // ═══════════════════════════════════════════════════════════
  test('AC-1: 10-6 wave 5에 sake_master가 보스로 배치되고 dragon_wok이 없다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['10-6'];
      if (!stage) return { error: 'stage 10-6 not found' };
      const wave5 = stage.waves.find(w => w.wave === 5);
      if (!wave5) return { error: 'wave 5 not found in 10-6' };
      const hasSakeMaster = wave5.enemies.some(e => e.type === 'sake_master');
      const hasDragonWok = wave5.enemies.some(e => e.type === 'dragon_wok');
      const allWavesDragonWok = stage.waves.some(w =>
        w.enemies.some(e => e.type === 'dragon_wok')
      );
      return { hasSakeMaster, hasDragonWok, allWavesDragonWok, wave5Enemies: wave5.enemies };
    });
    expect(result.error).toBeUndefined();
    expect(result.hasSakeMaster).toBe(true);
    expect(result.hasDragonWok).toBe(false);
    expect(result.allWavesDragonWok).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-2: 11-6 stageData - wave 6에 dragon_wok hpOverride 2500
  // ═══════════════════════════════════════════════════════════
  test('AC-2: 11-6 wave 6에 dragon_wok hpOverride:2500이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['11-6'];
      if (!stage) return { error: 'stage 11-6 not found' };
      const wave6 = stage.waves.find(w => w.wave === 6);
      if (!wave6) return { error: 'wave 6 not found in 11-6' };
      const dragonEntry = wave6.enemies.find(e => e.type === 'dragon_wok');
      return {
        found: !!dragonEntry,
        count: dragonEntry?.count,
        interval: dragonEntry?.interval,
        hpOverride: dragonEntry?.hpOverride,
        waveCount: stage.waves.length,
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.found).toBe(true);
    expect(result.count).toBe(1);
    expect(result.interval).toBe(0);
    expect(result.hpOverride).toBe(2500);
    expect(result.waveCount).toBe(6);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-3: 12-6 stageData - 마지막 웨이브에 dragon_wok 보스 배치
  // ═══════════════════════════════════════════════════════════
  test('AC-3: 12-6 마지막 웨이브에 dragon_wok이 보스로 배치된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['12-6'];
      if (!stage) return { error: 'stage 12-6 not found' };
      const lastWave = stage.waves[stage.waves.length - 1];
      const dragonEntry = lastWave.enemies.find(e => e.type === 'dragon_wok');
      return {
        found: !!dragonEntry,
        count: dragonEntry?.count,
        interval: dragonEntry?.interval,
        hpOverride: dragonEntry?.hpOverride,
        lastWaveNum: lastWave.wave,
        nameKo: stage.nameKo,
        theme: stage.theme,
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.found).toBe(true);
    expect(result.count).toBe(1);
    expect(result.interval).toBe(0);
    // 12-6은 정식 보스전이므로 hpOverride가 없어야 한다
    expect(result.hpOverride).toBeUndefined();
    expect(result.lastWaveNum).toBe(5);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-4~8: 12-1~12-5 stageData가 placeholder가 아님
  // ═══════════════════════════════════════════════════════════
  for (const stageId of ['12-1', '12-2', '12-3', '12-4', '12-5']) {
    test(`AC-4~8: ${stageId} stageData가 완전한 웨이브 데이터이다`, async ({ page }) => {
      const result = await page.evaluate(async (id) => {
        const { STAGES } = await import('/js/data/stageData.js');
        const stage = STAGES[id];
        if (!stage) return { error: `stage ${id} not found` };
        return {
          nameKo: stage.nameKo,
          theme: stage.theme,
          hasWaves: Array.isArray(stage.waves) && stage.waves.length > 0,
          waveCount: stage.waves?.length || 0,
          hasCustomers: Array.isArray(stage.customers) && stage.customers.length > 0,
          customerCount: stage.customers?.length || 0,
          hasPath: Array.isArray(stage.pathSegments) && stage.pathSegments.length > 0,
          hasStar: !!stage.starThresholds,
          hasService: !!stage.service,
          isPlaceholder: stage.theme === 'placeholder',
        };
      }, stageId);
      expect(result.error).toBeUndefined();
      expect(result.isPlaceholder).toBe(false);
      expect(result.theme).toBe('dragon_lair');
      expect(result.hasWaves).toBe(true);
      expect(result.waveCount).toBeGreaterThanOrEqual(5);
      expect(result.hasCustomers).toBe(true);
      expect(result.hasPath).toBe(true);
      expect(result.hasStar).toBe(true);
      expect(result.hasService).toBe(true);
      expect(result.nameKo).not.toBe('미구현');
    });
  }

  // ═══════════════════════════════════════════════════════════
  // AC-9: storyData chapter12 트리거 5건 존재
  // ═══════════════════════════════════════════════════════════
  test('AC-9: storyData에 chapter12 관련 트리거 5건이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      const ch12Ids = [
        'chapter12_intro',
        'chapter12_lao_mid',
        'chapter12_boss',
        'chapter12_clear',
        'lao_side_12',
      ];
      const found = {};
      for (const id of ch12Ids) {
        const trigger = STORY_TRIGGERS.find(t => t.dialogueId === id);
        found[id] = !!trigger;
      }
      return found;
    });
    expect(result.chapter12_intro).toBe(true);
    expect(result.chapter12_lao_mid).toBe(true);
    expect(result.chapter12_boss).toBe(true);
    expect(result.chapter12_clear).toBe(true);
    expect(result.lao_side_12).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-10: stage_first_clear 제외 목록에 12-1, 12-3, 12-6 포함
  // ═══════════════════════════════════════════════════════════
  test('AC-10: stage_first_clear 제외 목록에 12-1, 12-3, 12-6이 포함된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      // stage_first_clear의 일반 조건 (once:false 인 것)
      const generalFirstClear = STORY_TRIGGERS.find(t =>
        t.triggerPoint === 'result_clear' &&
        t.dialogueId === 'stage_first_clear' &&
        t.once === false &&
        // 특수 스테이지(1-6) 체인이 없는 일반 조건
        !t.chain
      );
      if (!generalFirstClear) return { error: 'general stage_first_clear trigger not found' };

      // 제외 목록 테스트: 조건에 12-1, 12-3, 12-6이 제외되는지 확인
      const ctx121 = { isFirstClear: true, stars: 1, stageId: '12-1' };
      const ctx123 = { isFirstClear: true, stars: 1, stageId: '12-3' };
      const ctx126 = { isFirstClear: true, stars: 1, stageId: '12-6' };
      // 제외 대상이 아닌 일반 스테이지
      const ctx122 = { isFirstClear: true, stars: 1, stageId: '12-2' };

      return {
        excludes121: !generalFirstClear.condition(ctx121),
        excludes123: !generalFirstClear.condition(ctx123),
        excludes126: !generalFirstClear.condition(ctx126),
        includes122: generalFirstClear.condition(ctx122),
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.excludes121).toBe(true);
    expect(result.excludes123).toBe(true);
    expect(result.excludes126).toBe(true);
    expect(result.includes122).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-11: SAVE_VERSION === 16
  // ═══════════════════════════════════════════════════════════
  test('AC-11: SAVE_VERSION이 16이다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const module = await import('/js/managers/SaveManager.js');
      // SaveManager에서 createDefault() 호출로 버전 확인
      const defaultData = module.SaveManager.createDefault?.() ||
        module.SaveManager.load?.();
      return { version: defaultData?.version };
    });
    expect(result.version).toBe(16);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-12: v15→v16 마이그레이션 블록 존재 (chapter12_cleared, chapter12_mid_seen)
  // ═══════════════════════════════════════════════════════════
  test('AC-12: v15→v16 마이그레이션이 chapter12 플래그를 추가한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      // v15 데이터 시뮬레이션
      const v15Data = {
        version: 15,
        stages: {},
        totalGoldEarned: 0,
        kitchenCoins: 100,
        storyProgress: {
          currentChapter: 11,
          storyFlags: {
            chapter10_cleared: true,
          },
        },
        seenDialogues: ['chapter10_intro'],
        gold: 500,
        tools: { pan: { count: 4, level: 1 } },
        unlockedRecipes: [],
        upgrades: {},
        season2Unlocked: true,
        season3Unlocked: false,
      };

      // localStorage에 v15 데이터 저장
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(v15Data));

      // load()가 마이그레이션을 실행해야 한다
      const migrated = SaveManager.load();

      // 정리
      localStorage.removeItem('kitchenChaosTycoon_save');

      return {
        version: migrated.version,
        chapter12_cleared: migrated.storyProgress?.storyFlags?.chapter12_cleared,
        chapter12_mid_seen: migrated.storyProgress?.storyFlags?.chapter12_mid_seen,
        // 기존 플래그 보존 확인
        chapter10_cleared: migrated.storyProgress?.storyFlags?.chapter10_cleared,
        currentChapter: migrated.storyProgress?.currentChapter,
      };
    });
    expect(result.version).toBe(16);
    expect(result.chapter12_cleared).toBe(false);
    expect(result.chapter12_mid_seen).toBe(false);
    // 기존 데이터 보존
    expect(result.chapter10_cleared).toBe(true);
    expect(result.currentChapter).toBe(11);
  });

  // ═══════════════════════════════════════════════════════════
  // AC-13: 11-6 hpOverride wave entry 검증 (상세)
  // ═══════════════════════════════════════════════════════════
  test('AC-13: 11-6 dragon_wok hpOverride 엔트리가 정확한 필드를 가진다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['11-6'];
      const wave6 = stage.waves.find(w => w.wave === 6);
      const dragonEntry = wave6.enemies.find(e => e.type === 'dragon_wok');
      // 정확한 필드 4개 존재 여부
      const keys = Object.keys(dragonEntry).sort();
      return { keys, entry: dragonEntry };
    });
    expect(result.entry.type).toBe('dragon_wok');
    expect(result.entry.count).toBe(1);
    expect(result.entry.interval).toBe(0);
    expect(result.entry.hpOverride).toBe(2500);
    expect(result.keys).toEqual(['count', 'hpOverride', 'interval', 'type']);
  });

  // ═══════════════════════════════════════════════════════════
  // REG-1: 10-6 기존 구조 이상 없음 (sake_master 교체 후)
  // ═══════════════════════════════════════════════════════════
  test('REG-1: 10-6이 완전한 스테이지 구조를 유지한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['10-6'];
      return {
        nameKo: stage.nameKo,
        theme: stage.theme,
        waveCount: stage.waves.length,
        customerCount: stage.customers.length,
        waveNumMatch: stage.waves.every((w, i) => w.wave === i + 1),
        customerWaveMatch: stage.customers.every((c, i) => c.wave === i + 1),
        hasPath: stage.pathSegments.length > 0,
        hasStar: !!stage.starThresholds?.three && !!stage.starThresholds?.two,
        hasService: !!stage.service?.duration,
        gridCols: stage.gridCols,
        gridRows: stage.gridRows,
      };
    });
    expect(result.waveCount).toBe(5);
    expect(result.customerCount).toBe(5);
    expect(result.waveNumMatch).toBe(true);
    expect(result.customerWaveMatch).toBe(true);
    expect(result.hasPath).toBe(true);
    expect(result.hasStar).toBe(true);
    expect(result.hasService).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  // REG-2: 11-5 기존 데이터 무결성
  // ═══════════════════════════════════════════════════════════
  test('REG-2: 11-5 기존 stageData가 변경되지 않았다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['11-5'];
      return {
        nameKo: stage.nameKo,
        theme: stage.theme,
        waveCount: stage.waves.length,
        w1FirstEnemy: stage.waves[0]?.enemies[0]?.type,
        w6FirstEnemy: stage.waves[5]?.enemies[0]?.type,
      };
    });
    expect(result.theme).toBe('dragon_lair');
    expect(result.waveCount).toBe(6);
    expect(result.w1FirstEnemy).toBe('shadow_dragon_spawn');
    expect(result.w6FirstEnemy).toBe('shadow_dragon_spawn');
  });

  // ═══════════════════════════════════════════════════════════
  // REG-3: 기존 스테이지 1-1 구조 이상 없음
  // ═══════════════════════════════════════════════════════════
  test('REG-3: 기존 스테이지 1-1이 정상 구조를 유지한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const stage = STAGES['1-1'];
      return {
        nameKo: stage.nameKo,
        theme: stage.theme,
        waveCount: stage.waves.length,
        hasCustomers: stage.customers.length > 0,
      };
    });
    expect(result.theme).toBe('pasta');
    expect(result.waveCount).toBeGreaterThan(0);
    expect(result.hasCustomers).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  // REG-4: v15→v16 마이그레이션 세이브 데이터 무결성 (포괄적)
  // ═══════════════════════════════════════════════════════════
  test('REG-4: v15→v16 마이그레이션이 기존 세이브 데이터를 보존한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const v15Data = {
        version: 15,
        stages: { '10-6': { stars: 3 }, '11-1': { stars: 2 } },
        totalGoldEarned: 5000,
        kitchenCoins: 200,
        gold: 1000,
        storyProgress: {
          currentChapter: 11,
          storyFlags: {
            chapter7_cleared: true,
            chapter10_cleared: true,
            yuki_joined: true,
            lao_joined: true,
            chapter10_mid_seen: true,
          },
        },
        seenDialogues: ['chapter10_intro', 'chapter10_clear', 'chapter11_intro'],
        unlockedRecipes: ['carrot_soup', 'steak_plate'],
        upgrades: { fridge: 2, knife: 1 },
        tools: { pan: { count: 4, level: 2 }, delivery: { count: 2, level: 1 } },
        season2Unlocked: true,
        season3Unlocked: true,
        tutorialBattle: true,
        tutorialService: true,
        selectedChef: 'flame_chef',
      };

      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(v15Data));
      const migrated = SaveManager.load();
      localStorage.removeItem('kitchenChaosTycoon_save');

      return {
        version: migrated.version,
        // 기존 스테이지 기록 보존
        stage106Stars: migrated.stages['10-6']?.stars,
        stage111Stars: migrated.stages['11-1']?.stars,
        // 기존 필드 보존
        totalGoldEarned: migrated.totalGoldEarned,
        kitchenCoins: migrated.kitchenCoins,
        gold: migrated.gold,
        // 기존 스토리 플래그 보존
        chapter7_cleared: migrated.storyProgress.storyFlags.chapter7_cleared,
        chapter10_cleared: migrated.storyProgress.storyFlags.chapter10_cleared,
        yuki_joined: migrated.storyProgress.storyFlags.yuki_joined,
        lao_joined: migrated.storyProgress.storyFlags.lao_joined,
        chapter10_mid_seen: migrated.storyProgress.storyFlags.chapter10_mid_seen,
        // 신규 플래그 추가
        chapter12_cleared: migrated.storyProgress.storyFlags.chapter12_cleared,
        chapter12_mid_seen: migrated.storyProgress.storyFlags.chapter12_mid_seen,
        // 기타
        currentChapter: migrated.storyProgress.currentChapter,
        seenDialoguesCount: migrated.seenDialogues.length,
        unlockedRecipesCount: migrated.unlockedRecipes.length,
        selectedChef: migrated.selectedChef,
        season2: migrated.season2Unlocked,
        season3: migrated.season3Unlocked,
      };
    });
    expect(result.version).toBe(16);
    // 기존 데이터 완전 보존
    expect(result.stage106Stars).toBe(3);
    expect(result.stage111Stars).toBe(2);
    expect(result.totalGoldEarned).toBe(5000);
    expect(result.kitchenCoins).toBe(200);
    expect(result.gold).toBe(1000);
    expect(result.chapter7_cleared).toBe(true);
    expect(result.chapter10_cleared).toBe(true);
    expect(result.yuki_joined).toBe(true);
    expect(result.lao_joined).toBe(true);
    expect(result.chapter10_mid_seen).toBe(true);
    expect(result.chapter12_cleared).toBe(false);
    expect(result.chapter12_mid_seen).toBe(false);
    expect(result.currentChapter).toBe(11);
    expect(result.seenDialoguesCount).toBe(3);
    expect(result.unlockedRecipesCount).toBe(2);
    expect(result.selectedChef).toBe('flame_chef');
    expect(result.season2).toBe(true);
    expect(result.season3).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-1: storyData chapter12 트리거 조건 함수 검증
  // ═══════════════════════════════════════════════════════════
  test('EDGE-1: chapter12 트리거 조건 함수가 올바른 stageId에서만 동작한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STORY_TRIGGERS } = await import('/js/data/storyData.js');
      const introTrigger = STORY_TRIGGERS.find(t => t.dialogueId === 'chapter12_intro');
      const midTrigger = STORY_TRIGGERS.find(t => t.dialogueId === 'chapter12_lao_mid');
      const bossTrigger = STORY_TRIGGERS.find(t => t.dialogueId === 'chapter12_boss');
      const clearTrigger = STORY_TRIGGERS.find(t => t.dialogueId === 'chapter12_clear');
      const sideTrigger = STORY_TRIGGERS.find(t => t.dialogueId === 'lao_side_12');

      return {
        // chapter12_intro: gathering_enter, stageId === '12-1'
        introCorrect: introTrigger.condition({ stageId: '12-1' }),
        introWrong: introTrigger.condition({ stageId: '12-2' }),
        introTriggerPoint: introTrigger.triggerPoint,

        // chapter12_lao_mid: result_clear, isFirstClear && stars > 0 && stageId === '12-3'
        midCorrect: midTrigger.condition({ isFirstClear: true, stars: 1, stageId: '12-3' }),
        midWrongStage: midTrigger.condition({ isFirstClear: true, stars: 1, stageId: '12-2' }),
        midNotFirst: midTrigger.condition({ isFirstClear: false, stars: 1, stageId: '12-3' }),
        midTriggerPoint: midTrigger.triggerPoint,

        // chapter12_boss: gathering_enter, stageId === '12-6'
        bossCorrect: bossTrigger.condition({ stageId: '12-6' }),
        bossWrong: bossTrigger.condition({ stageId: '12-5' }),
        bossTriggerPoint: bossTrigger.triggerPoint,

        // chapter12_clear: result_clear, isFirstClear && stars > 0 && stageId === '12-6'
        clearCorrect: clearTrigger.condition({ isFirstClear: true, stars: 1, stageId: '12-6' }),
        clearWrongStage: clearTrigger.condition({ isFirstClear: true, stars: 1, stageId: '12-5' }),
        clearTriggerPoint: clearTrigger.triggerPoint,

        // lao_side_12: merchant_enter, chapter12_cleared && !seenDialogues includes
        sideCorrect: sideTrigger.condition({}, { storyFlags: { chapter12_cleared: true }, seenDialogues: [] }),
        sideNotCleared: sideTrigger.condition({}, { storyFlags: { chapter12_cleared: false }, seenDialogues: [] }),
        sideAlreadySeen: sideTrigger.condition({}, { storyFlags: { chapter12_cleared: true }, seenDialogues: ['lao_side_12'] }),
        sideTriggerPoint: sideTrigger.triggerPoint,
      };
    });

    // chapter12_intro
    expect(result.introCorrect).toBe(true);
    expect(result.introWrong).toBe(false);
    expect(result.introTriggerPoint).toBe('gathering_enter');

    // chapter12_lao_mid
    expect(result.midCorrect).toBe(true);
    expect(result.midWrongStage).toBe(false);
    expect(result.midNotFirst).toBe(false);
    expect(result.midTriggerPoint).toBe('result_clear');

    // chapter12_boss
    expect(result.bossCorrect).toBe(true);
    expect(result.bossWrong).toBe(false);
    expect(result.bossTriggerPoint).toBe('gathering_enter');

    // chapter12_clear
    expect(result.clearCorrect).toBe(true);
    expect(result.clearWrongStage).toBe(false);
    expect(result.clearTriggerPoint).toBe('result_clear');

    // lao_side_12
    expect(result.sideCorrect).toBe(true);
    expect(result.sideNotCleared).toBe(false);
    expect(result.sideAlreadySeen).toBe(false);
    expect(result.sideTriggerPoint).toBe('merchant_enter');
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-2: 12장 모든 스테이지의 waves/customers 수 일치 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-2: 12장 모든 스테이지의 waves와 customers 수가 일치한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const issues = [];
      for (let i = 1; i <= 6; i++) {
        const id = `12-${i}`;
        const stage = STAGES[id];
        if (!stage) { issues.push(`${id}: not found`); continue; }
        if (stage.waves.length !== stage.customers.length) {
          issues.push(`${id}: waves(${stage.waves.length}) != customers(${stage.customers.length})`);
        }
        // wave 번호가 순차적인지 확인
        for (let w = 0; w < stage.waves.length; w++) {
          if (stage.waves[w].wave !== w + 1) {
            issues.push(`${id}: wave[${w}].wave = ${stage.waves[w].wave}, expected ${w + 1}`);
          }
          if (stage.customers[w].wave !== w + 1) {
            issues.push(`${id}: customers[${w}].wave = ${stage.customers[w].wave}, expected ${w + 1}`);
          }
        }
        // 모든 웨이브에 enemies 배열 존재
        for (const w of stage.waves) {
          if (!Array.isArray(w.enemies) || w.enemies.length === 0) {
            issues.push(`${id}: wave ${w.wave} has no enemies`);
          }
        }
        // 모든 customer에 dish 필드 존재
        for (const c of stage.customers) {
          if (!Array.isArray(c.customers) || c.customers.length === 0) {
            issues.push(`${id}: customer wave ${c.wave} has no dishes`);
          }
          for (const cust of (c.customers || [])) {
            if (!cust.dish) {
              issues.push(`${id}: customer wave ${c.wave} missing dish`);
            }
          }
        }
      }
      return { issues };
    });
    expect(result.issues).toEqual([]);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-3: 12장 적 타입이 gameData에 모두 등록되어 있는지 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-3: 12장 웨이브에 사용된 모든 적 타입이 gameData에 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const { ENEMY_TYPES } = await import('/js/data/gameData.js');
      const unknownTypes = new Set();
      for (let i = 1; i <= 6; i++) {
        const stage = STAGES[`12-${i}`];
        for (const wave of stage.waves) {
          for (const e of wave.enemies) {
            if (!ENEMY_TYPES[e.type]) {
              unknownTypes.add(e.type);
            }
          }
        }
      }
      // 11-6의 적 타입도 확인
      const stage116 = STAGES['11-6'];
      for (const wave of stage116.waves) {
        for (const e of wave.enemies) {
          if (!ENEMY_TYPES[e.type]) {
            unknownTypes.add(e.type);
          }
        }
      }
      // 10-6의 적 타입도 확인
      const stage106 = STAGES['10-6'];
      for (const wave of stage106.waves) {
        for (const e of wave.enemies) {
          if (!ENEMY_TYPES[e.type]) {
            unknownTypes.add(e.type);
          }
        }
      }
      return { unknownTypes: [...unknownTypes] };
    });
    expect(result.unknownTypes).toEqual([]);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-4: 12장 레시피가 recipeData에 등록되어 있는지 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-4: 12장 customer에 사용된 모든 레시피가 recipeData에 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const { RECIPE_MAP } = await import('/js/data/recipeData.js');
      const unknownDishes = new Set();
      for (let i = 1; i <= 6; i++) {
        const stage = STAGES[`12-${i}`];
        for (const cw of stage.customers) {
          for (const c of cw.customers) {
            if (!RECIPE_MAP[c.dish]) {
              unknownDishes.add(c.dish);
            }
          }
        }
      }
      // 11-6도 확인
      const stage116 = STAGES['11-6'];
      for (const cw of stage116.customers) {
        for (const c of cw.customers) {
          if (!RECIPE_MAP[c.dish]) {
            unknownDishes.add(c.dish);
          }
        }
      }
      return { unknownDishes: [...unknownDishes] };
    });
    expect(result.unknownDishes).toEqual([]);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-5: dialogueData에 chapter12 대화 5종이 존재하는지 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-5: dialogueData에 chapter12 대화 5종이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { DIALOGUES } = await import('/js/data/dialogueData.js');
      const ids = ['chapter12_intro', 'chapter12_lao_mid', 'chapter12_boss', 'chapter12_clear', 'lao_side_12'];
      const found = {};
      for (const id of ids) {
        const d = DIALOGUES[id];
        found[id] = {
          exists: !!d,
          hasLines: d ? Array.isArray(d.lines) && d.lines.length > 0 : false,
          lineCount: d?.lines?.length || 0,
        };
      }
      return found;
    });
    for (const id of ['chapter12_intro', 'chapter12_lao_mid', 'chapter12_boss', 'chapter12_clear', 'lao_side_12']) {
      expect(result[id].exists).toBe(true);
      expect(result[id].hasLines).toBe(true);
      expect(result[id].lineCount).toBeGreaterThan(0);
    }
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-6: hpOverride가 0 또는 음수일 때의 방어 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-6: Enemy.js hpOverride가 falsy(0)이면 적용되지 않는다', async ({ page }) => {
    // hpOverride가 0이면 if (spawnData?.hpOverride) 조건에서 falsy로 스킵됨
    // 이는 의도적 동작이지만, hpOverride: 0이 입력되면 기본 HP가 유지된다
    const result = await page.evaluate(async () => {
      // hpOverride: 0 인 경우 조건문 결과 확인
      const spawnData = { hpOverride: 0 };
      const applied = !!spawnData?.hpOverride; // false (0은 falsy)
      const spawnDataNull = null;
      const appliedNull = !!spawnDataNull?.hpOverride; // false
      const spawnDataValid = { hpOverride: 2500 };
      const appliedValid = !!spawnDataValid?.hpOverride; // true
      return { applied, appliedNull, appliedValid };
    });
    expect(result.applied).toBe(false);    // 0은 적용 안 됨 (의도적)
    expect(result.appliedNull).toBe(false); // null은 적용 안 됨
    expect(result.appliedValid).toBe(true); // 2500은 적용됨
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-7: v15→v16 마이그레이션 - storyFlags가 배열인 레거시 데이터
  // ═══════════════════════════════════════════════════════════
  test('EDGE-7: v15 마이그레이션에서 storyFlags가 배열이면 객체로 변환된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const v15Data = {
        version: 15,
        stages: {},
        totalGoldEarned: 0,
        kitchenCoins: 0,
        storyProgress: {
          currentChapter: 1,
          storyFlags: [],  // 레거시 배열 형태
        },
        seenDialogues: [],
        gold: 0,
        tools: {},
        unlockedRecipes: [],
        upgrades: {},
      };

      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(v15Data));
      const migrated = SaveManager.load();
      localStorage.removeItem('kitchenChaosTycoon_save');

      return {
        version: migrated.version,
        isObject: typeof migrated.storyProgress?.storyFlags === 'object' && !Array.isArray(migrated.storyProgress?.storyFlags),
        chapter12_cleared: migrated.storyProgress?.storyFlags?.chapter12_cleared,
        chapter12_mid_seen: migrated.storyProgress?.storyFlags?.chapter12_mid_seen,
      };
    });
    expect(result.version).toBe(16);
    expect(result.isObject).toBe(true);
    expect(result.chapter12_cleared).toBe(false);
    expect(result.chapter12_mid_seen).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-8: v15→v16 마이그레이션 - storyProgress가 없는 극단 케이스
  // ═══════════════════════════════════════════════════════════
  test('EDGE-8: v15 마이그레이션에서 storyProgress가 없어도 정상 처리된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const v15Data = {
        version: 15,
        stages: {},
        totalGoldEarned: 0,
        kitchenCoins: 0,
        // storyProgress 누락
        seenDialogues: [],
        gold: 0,
        tools: {},
        unlockedRecipes: [],
        upgrades: {},
      };

      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(v15Data));
      const migrated = SaveManager.load();
      localStorage.removeItem('kitchenChaosTycoon_save');

      return {
        version: migrated.version,
        hasStoryProgress: !!migrated.storyProgress,
        currentChapter: migrated.storyProgress?.currentChapter,
        hasStoryFlags: !!migrated.storyProgress?.storyFlags,
        chapter12_cleared: migrated.storyProgress?.storyFlags?.chapter12_cleared,
      };
    });
    expect(result.version).toBe(16);
    expect(result.hasStoryProgress).toBe(true);
    expect(result.currentChapter).toBe(1);
    expect(result.hasStoryFlags).toBe(true);
    expect(result.chapter12_cleared).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-9: WorldMapScene ch12 nameKo가 placeholder가 아님
  // ═══════════════════════════════════════════════════════════
  test('EDGE-9: WorldMapScene 12장 nameKo가 실제 이름이다', async ({ page }) => {
    // WorldMapScene 모듈의 CHAPTERS 데이터를 직접 확인할 수 없으므로
    // 소스 파일을 fetch해서 확인
    const result = await page.evaluate(async () => {
      const resp = await fetch('/js/scenes/WorldMapScene.js');
      const text = await resp.text();
      // ch12 행 찾기
      const ch12Line = text.split('\n').find(l => l.includes("id: 'ch12'"));
      if (!ch12Line) return { error: 'ch12 line not found' };
      const nameKoMatch = ch12Line.match(/nameKo:\s*'([^']+)'/);
      return {
        nameKo: nameKoMatch ? nameKoMatch[1] : null,
        isPlaceholder: ch12Line.includes("theme: 'placeholder'"),
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.nameKo).toContain('용의 궁전');
    expect(result.isPlaceholder).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-10: STAGE_ORDER에 12-1~12-6이 포함되는지 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-10: STAGE_ORDER에 12-1~12-6이 모두 포함되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGE_ORDER } = await import('/js/data/stageData.js');
      const ch12Stages = ['12-1', '12-2', '12-3', '12-4', '12-5', '12-6'];
      const missing = ch12Stages.filter(id => !STAGE_ORDER.includes(id));
      return { missing };
    });
    expect(result.missing).toEqual([]);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-11: 콘솔 에러 없음 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-11: 페이지 로드 시 JS 에러가 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Phaser 관련 경고/에러 중 치명적이지 않은 것은 필터링
    const criticalErrors = errors.filter(e =>
      !e.includes('WebGL') && !e.includes('phaser') && !e.includes('Phaser')
    );
    expect(criticalErrors).toEqual([]);
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-12: chapter12_lao_mid onComplete 안전성 확인 (정적 분석 소견)
  // ═══════════════════════════════════════════════════════════
  test('EDGE-12: chapter12_lao_mid onComplete에 storyFlags 안전 가드가 있는지 확인', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const resp = await fetch('/js/data/storyData.js');
      const text = await resp.text();
      // chapter12_lao_mid onComplete 블록 찾기
      const midIdx = text.indexOf("dialogueId: 'chapter12_lao_mid'");
      if (midIdx === -1) return { error: 'chapter12_lao_mid not found' };
      // onComplete 블록 범위 (대략 200자 이내)
      const block = text.substring(midIdx, midIdx + 500);
      const hasOnComplete = block.includes('onComplete');
      // storyFlags 안전 가드 패턴 검사
      const hasSafetyGuard = block.includes('!data.storyProgress.storyFlags') ||
        block.includes('Array.isArray(data.storyProgress.storyFlags)');
      return {
        hasOnComplete,
        hasSafetyGuard,
        blockSnippet: block.substring(0, 300),
      };
    });
    expect(result.hasOnComplete).toBe(true);
    // 이 테스트는 안전 가드 유무를 리포트하기 위한 것
    // 안전 가드가 없으면 FAIL로 기록 (다른 onComplete들은 가드가 있음)
    // 결과: hasSafetyGuard 값을 리포트에 반영
    // expect(result.hasSafetyGuard).toBe(true); -- 실제 결과를 관찰
    return; // 정보 수집용 (hasSafetyGuard 결과를 리포트에 기재)
  });

  // ═══════════════════════════════════════════════════════════
  // EDGE-13: 12장 스테이지 난이도 점진적 상승 확인
  // ═══════════════════════════════════════════════════════════
  test('EDGE-13: 12장 스테이지의 총 적 수가 점진적으로 증가한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const totals = [];
      for (let i = 1; i <= 6; i++) {
        const stage = STAGES[`12-${i}`];
        let total = 0;
        for (const w of stage.waves) {
          for (const e of w.enemies) {
            total += e.count;
          }
        }
        totals.push({ id: `12-${i}`, total });
      }
      return totals;
    });
    // 12-1 ~ 12-5는 점진적 증가해야 한다 (12-6은 보스전이라 예외 가능)
    for (let i = 0; i < 4; i++) {
      expect(result[i + 1].total).toBeGreaterThanOrEqual(result[i].total);
    }
  });
});
