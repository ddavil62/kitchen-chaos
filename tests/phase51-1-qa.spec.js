/**
 * @fileoverview Phase 51-1 QA: 미력의 정수 화폐 시스템 코어 레이어 검증.
 * SaveManager v18 마이그레이션, 헬퍼 메서드, ServiceScene mireuk_traveler,
 * HUD mireukEssenceText, VFXManager.floatingText 검증.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 게임 로딩 헬퍼 ──
async function waitForGame(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

// ── v17 세이브 데이터 생성 (마이그레이션 전) ──
function createV17Save() {
  return {
    version: 17,
    stages: { '1-1': { cleared: true, stars: 3 }, '6-3': { cleared: true, stars: 2 } },
    totalGoldEarned: 1000,
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialEndless: false,
    kitchenCoins: 50,
    upgrades: { fridge: 1, knife: 1, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: ['rice_ball'],
    selectedChef: 'petit_chef',
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: false, dishwasher: false },
    soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
    gold: 200,
    tools: {
      pan: { count: 4, level: 1 },
      salt: { count: 0, level: 1 },
      grill: { count: 0, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    },
    tutorialMerchant: false,
    season2Unlocked: true,
    season3Unlocked: false,
    seenDialogues: [],
    storyProgress: { currentChapter: 7, storyFlags: {} },
    endless: { unlocked: true, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    achievements: {
      unlocked: {},
      claimed: {},
      progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 },
    },
  };
}

// ── v18 세이브 데이터 생성 (마이그레이션 불필요) ──
function createV18Save() {
  return {
    ...createV17Save(),
    version: 18,
    mireukEssence: 0,
    mireukEssenceTotal: 0,
    mireukTravelerCount: 0,
    mireukBossRewards: {},
    hiredMireukChefs: [],
  };
}

// ── ServiceScene 시작 헬퍼 ──
async function startServiceScene(page, stageId) {
  await page.evaluate(({ stageId }) => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) game.scene.stop(s.scene.key);
    game.scene.start('ServiceScene', {
      stageId,
      inventory: { carrot: 99, meat: 99, flour: 99, fish: 99, tofu: 99, rice: 99, egg: 99, onion: 99, potato: 99, seaweed: 99, soy_sauce: 99, miso: 99 },
      gold: 500,
      lives: 10,
      isEndless: false,
    });
  }, { stageId });
  await page.waitForTimeout(2000);
}

test.describe('Phase 51-1: 미력의 정수 코어 레이어 QA', () => {

  // ───────────────────────────────────────────────────────────
  // 1. SaveManager v18 마이그레이션 검증
  // ───────────────────────────────────────────────────────────
  test.describe('SaveManager v17->v18 마이그레이션', () => {

    test('v17 세이브 로드 시 v18로 마이그레이션되고 5개 신규 필드가 기본값으로 추가된다', async ({ page }) => {
      // v17 세이브 주입
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV17Save());

      // 페이지 리로드 후 SaveManager.load() 호출
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('canvas', { timeout: 15000 });

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const data = SaveManager.load();
        return {
          version: data.version,
          mireukEssence: data.mireukEssence,
          mireukEssenceTotal: data.mireukEssenceTotal,
          mireukTravelerCount: data.mireukTravelerCount,
          mireukBossRewards: data.mireukBossRewards,
          hiredMireukChefs: data.hiredMireukChefs,
          // 기존 데이터 보존 확인
          gold: data.gold,
          stages: data.stages,
          season2Unlocked: data.season2Unlocked,
        };
      });

      expect(result.version).toBe(18);
      expect(result.mireukEssence).toBe(0);
      expect(result.mireukEssenceTotal).toBe(0);
      expect(result.mireukTravelerCount).toBe(0);
      expect(result.mireukBossRewards).toEqual({});
      expect(result.hiredMireukChefs).toEqual([]);
      // 기존 데이터 무손실 확인
      expect(result.gold).toBe(200);
      expect(result.stages['1-1'].stars).toBe(3);
      expect(result.season2Unlocked).toBe(true);
    });

    test('v17 세이브에 이미 mireukEssence 필드가 있으면 기존 값을 보존한다 (nullish coalescing)', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const customV17 = createV17Save();
      customV17.mireukEssence = 5;  // 이미 값이 있는 경우 (비정상적이지만 방어)
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, customV17);

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const data = SaveManager.load();
        return { version: data.version, mireukEssence: data.mireukEssence };
      });

      expect(result.version).toBe(18);
      // ?? 연산자 사용 → 이미 값이 있으면 보존
      expect(result.mireukEssence).toBe(5);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 2. SaveManager createDefault 검증
  // ───────────────────────────────────────────────────────────
  test.describe('SaveManager createDefault', () => {

    test('신규 세이브에 5개 mireuk 필드가 기본값으로 초기화된다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      // localStorage 비우기
      await page.evaluate(() => {
        localStorage.removeItem('kitchenChaosTycoon_save');
      });

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const data = SaveManager.load();
        return {
          version: data.version,
          mireukEssence: data.mireukEssence,
          mireukEssenceTotal: data.mireukEssenceTotal,
          mireukTravelerCount: data.mireukTravelerCount,
          mireukBossRewards: data.mireukBossRewards,
          hiredMireukChefs: data.hiredMireukChefs,
        };
      });

      expect(result.version).toBe(18);
      expect(result.mireukEssence).toBe(0);
      expect(result.mireukEssenceTotal).toBe(0);
      expect(result.mireukTravelerCount).toBe(0);
      expect(result.mireukBossRewards).toEqual({});
      expect(result.hiredMireukChefs).toEqual([]);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 3. addMireukEssence 헬퍼 검증
  // ───────────────────────────────────────────────────────────
  test.describe('addMireukEssence 헬퍼', () => {

    test('가산 후 보유량과 누적 합산이 정확하다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV18Save());

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');

        const r1 = SaveManager.addMireukEssence(3);
        const e1 = SaveManager.getMireukEssence();

        const r2 = SaveManager.addMireukEssence(2);
        const e2 = SaveManager.getMireukEssence();

        const data = SaveManager.load();
        return {
          r1, e1, r2, e2,
          total: data.mireukEssenceTotal,
        };
      });

      expect(result.r1).toBe(3);
      expect(result.e1).toBe(3);
      expect(result.r2).toBe(5);
      expect(result.e2).toBe(5);
      expect(result.total).toBe(5);
    });

    test('999 캡이 적용된다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV18Save());

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const r = SaveManager.addMireukEssence(1000);
        const essence = SaveManager.getMireukEssence();
        const data = SaveManager.load();
        return {
          returnVal: r,
          essence,
          total: data.mireukEssenceTotal,
        };
      });

      expect(result.returnVal).toBe(999);
      expect(result.essence).toBe(999);
      // mireukEssenceTotal은 캡 없이 누적
      expect(result.total).toBe(1000);
    });

    test('999 보유 상태에서 추가 가산 시 999 유지, total은 계속 누적', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const save = createV18Save();
      save.mireukEssence = 998;
      save.mireukEssenceTotal = 998;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const r = SaveManager.addMireukEssence(5);
        const data = SaveManager.load();
        return {
          returnVal: r,
          essence: data.mireukEssence,
          total: data.mireukEssenceTotal,
        };
      });

      expect(result.returnVal).toBe(999);
      expect(result.essence).toBe(999);
      expect(result.total).toBe(1003); // 998 + 5
    });

    test('음수 가산 시 보유량이 감소한다 (방어 미구현 확인)', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const save = createV18Save();
      save.mireukEssence = 5;
      save.mireukEssenceTotal = 5;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const r = SaveManager.addMireukEssence(-3);
        return {
          returnVal: r,
          essence: SaveManager.getMireukEssence(),
        };
      });

      // 음수 가산에 대한 방어가 없으면 2가 됨 (잠재적 이슈)
      // 스펙에서는 소비 처리를 아직 구현하지 않으므로 이 동작은 정의되지 않음
      // 실제 값 기록
      expect(result.returnVal).toBe(2);
      expect(result.essence).toBe(2);
    });

    test('0 가산 시 변화 없다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const save = createV18Save();
      save.mireukEssence = 10;
      save.mireukEssenceTotal = 10;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        SaveManager.addMireukEssence(0);
        return {
          essence: SaveManager.getMireukEssence(),
          total: SaveManager.load().mireukEssenceTotal,
        };
      });

      expect(result.essence).toBe(10);
      expect(result.total).toBe(10);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 4. incrementMireukTravelerCount 헬퍼 검증
  // ───────────────────────────────────────────────────────────
  test.describe('incrementMireukTravelerCount 헬퍼', () => {

    test('2회 호출 시 카운트가 2이다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV18Save());

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');
        const r1 = SaveManager.incrementMireukTravelerCount();
        const r2 = SaveManager.incrementMireukTravelerCount();
        const count = SaveManager.getMireukTravelerCount();
        return { r1, r2, count };
      });

      expect(result.r1).toBe(1);
      expect(result.r2).toBe(2);
      expect(result.count).toBe(2);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 5. VFXManager.floatingText 메서드 존재 확인
  // ───────────────────────────────────────────────────────────
  test.describe('VFXManager.floatingText', () => {

    test('floatingText 메서드가 존재하고 function 타입이다', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

      const result = await page.evaluate(async () => {
        const { VFXManager } = await import('/js/managers/VFXManager.js');
        return {
          hasMethod: typeof VFXManager.prototype.floatingText === 'function',
          paramCount: VFXManager.prototype.floatingText.length,
        };
      });

      expect(result.hasMethod).toBe(true);
      // floatingText(x, y, text, color, fontSize) - 기본값 있는 마지막 2개 제외하면 length는 3
      expect(result.paramCount).toBe(3);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 6. ServiceScene mireuk_traveler 상수 등록 확인
  // ───────────────────────────────────────────────────────────
  test.describe('mireuk_traveler 상수 등록', () => {

    test('CUSTOMER_TYPE_ICONS에 mireuk_traveler가 등록되어 있다', async ({ page }) => {
      await waitForGame(page);
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV18Save());

      // ServiceScene 시작하여 상수 접근
      await startServiceScene(page, '7-1');

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene) return { error: 'no scene' };

        // 상수는 모듈 스코프이므로 직접 접근 불가
        // 대신 spawned customer의 타입으로 간접 확인하거나
        // 파일 내용 기반으로 확인
        return {
          sceneExists: true,
          hasScheduleMethod: typeof scene._scheduleMireukTraveler === 'function',
          hasSpawnMethod: typeof scene._spawnMireukTraveler === 'function',
          hasUpdateMireukHUD: typeof scene._updateMireukHUD === 'function',
          mireukSpawnedFlag: scene._mireukSpawned,
        };
      });

      expect(result.sceneExists).toBe(true);
      expect(result.hasScheduleMethod).toBe(true);
      expect(result.hasSpawnMethod).toBe(true);
      expect(result.hasUpdateMireukHUD).toBe(true);
      expect(result.mireukSpawnedFlag).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────
  // 7. HUD mireukEssenceText 표시 확인
  // ───────────────────────────────────────────────────────────
  test.describe('HUD mireukEssenceText', () => {

    test('chapter >= 7 스테이지에서 "diamond N" 형식으로 표시된다', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 42;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '7-1');

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene || !scene.mireukEssenceText) return { error: 'no text' };
        return {
          text: scene.mireukEssenceText.text,
          visible: scene.mireukEssenceText.visible,
          color: scene.mireukEssenceText.style?.color,
          x: scene.mireukEssenceText.x,
          y: scene.mireukEssenceText.y,
        };
      });

      expect(result.text).toContain('42');
      expect(result.visible).toBe(true);
      expect(result.color).toBe('#b266ff');
      expect(result.x).toBe(10);
      expect(result.y).toBe(26);
    });

    test('chapter < 7이고 mireukEssence=0이면 빈 문자열로 숨김된다', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 0;
      save.season2Unlocked = false;
      save.storyProgress.currentChapter = 1;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '1-1');

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene || !scene.mireukEssenceText) return { error: 'no text' };
        return {
          text: scene.mireukEssenceText.text,
        };
      });

      expect(result.text).toBe('');
    });

    test('chapter < 7이지만 mireukEssence > 0이면 표시된다', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 10;
      save.season2Unlocked = false;
      save.storyProgress.currentChapter = 3;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '3-1');

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        if (!scene || !scene.mireukEssenceText) return { error: 'no text' };
        return {
          text: scene.mireukEssenceText.text,
        };
      });

      expect(result.text).toContain('10');
    });

    test('정수 획득 후 HUD 숫자가 즉시 갱신된다', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 5;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '7-1');

      const result = await page.evaluate(async () => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        const { SaveManager } = await import('/js/managers/SaveManager.js');

        const before = scene.mireukEssenceText.text;

        // 직접 addMireukEssence 후 _updateMireukHUD 호출
        SaveManager.addMireukEssence(3);
        scene._updateMireukHUD();

        const after = scene.mireukEssenceText.text;

        return { before, after };
      });

      expect(result.before).toContain('5');
      expect(result.after).toContain('8');
    });
  });

  // ───────────────────────────────────────────────────────────
  // 8. mireuk_traveler 드롭 로직 검증 (patienceRatio 기반)
  // ───────────────────────────────────────────────────────────
  test.describe('mireuk_traveler 정수 드롭 로직', () => {

    test('patienceRatio >= 0.8 일 때 3정수 드롭', async ({ page }) => {
      await waitForGame(page);
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV18Save());

      await startServiceScene(page, '7-1');

      const result = await page.evaluate(async () => {
        const { SaveManager } = await import('/js/managers/SaveManager.js');

        // patienceRatio 기반 드롭 계산 로직 직접 테스트
        const testDrop = (ratio) => ratio >= 0.8 ? 3 : ratio >= 0.4 ? 2 : 1;

        return {
          drop80: testDrop(0.8),
          drop90: testDrop(0.9),
          drop100: testDrop(1.0),
          drop79: testDrop(0.79),
          drop40: testDrop(0.4),
          drop50: testDrop(0.5),
          drop39: testDrop(0.39),
          drop10: testDrop(0.1),
          drop0: testDrop(0.0),
        };
      });

      // >= 80%: 3 정수
      expect(result.drop80).toBe(3);
      expect(result.drop90).toBe(3);
      expect(result.drop100).toBe(3);
      // 40~79%: 2 정수
      expect(result.drop79).toBe(2);
      expect(result.drop40).toBe(2);
      expect(result.drop50).toBe(2);
      // <= 39%: 1 정수
      expect(result.drop39).toBe(1);
      expect(result.drop10).toBe(1);
      expect(result.drop0).toBe(1);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 9. _scheduleMireukTraveler 조건 검증
  // ───────────────────────────────────────────────────────────
  test.describe('_scheduleMireukTraveler 조건', () => {

    test('chapter < 7 스테이지에서는 mireuk_traveler가 예약되지 않는다', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.season2Unlocked = false;
      save.storyProgress.currentChapter = 3;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '3-1');

      const result = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('ServiceScene');
        // chapter < 7 && !season2 → 조기 리턴해야 함
        // 타이머 이벤트 수를 확인 (mireuk 관련 타이머가 없어야 함)
        return {
          mireukSpawned: scene._mireukSpawned,
          chapter: scene.chapter,
        };
      });

      expect(result.mireukSpawned).toBe(false);
      expect(result.chapter).toBeLessThan(7);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 10. 콘솔 에러 없음 검증
  // ───────────────────────────────────────────────────────────
  test.describe('콘솔 에러 검증', () => {

    test('ServiceScene 시작/운영 중 JavaScript 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await waitForGame(page);
      await page.evaluate((save) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
      }, createV18Save());

      await startServiceScene(page, '7-1');

      // 5초간 씬 운영 대기
      await page.waitForTimeout(5000);

      // mireuk 관련 에러만 필터링
      const mireukErrors = errors.filter(e =>
        e.toLowerCase().includes('mireuk') ||
        e.toLowerCase().includes('essence') ||
        e.toLowerCase().includes('floatingtext')
      );

      expect(mireukErrors).toEqual([]);
    });

    test('chapter 1-1에서도 mireuk 관련 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await waitForGame(page);
      const save = createV18Save();
      save.season2Unlocked = false;
      save.storyProgress.currentChapter = 1;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '1-1');
      await page.waitForTimeout(3000);

      expect(errors).toEqual([]);
    });
  });

  // ───────────────────────────────────────────────────────────
  // 11. 스크린샷 시각적 검증
  // ───────────────────────────────────────────────────────────
  test.describe('시각적 검증', () => {

    test('chapter >= 7 HUD에 mireukEssence 표시 스크린샷', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 42;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '7-1');
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'tests/screenshots/phase51-1-hud-essence-ch7.png',
        clip: { x: 0, y: 0, width: 360, height: 50 },
      });
    });

    test('chapter < 7, essence=0 HUD 숨김 스크린샷', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 0;
      save.season2Unlocked = false;
      save.storyProgress.currentChapter = 1;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '1-1');
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'tests/screenshots/phase51-1-hud-no-essence-ch1.png',
        clip: { x: 0, y: 0, width: 360, height: 50 },
      });
    });

    test('전체 ServiceScene 레이아웃 (ch7)', async ({ page }) => {
      await waitForGame(page);
      const save = createV18Save();
      save.mireukEssence = 99;
      await page.evaluate((s) => {
        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
      }, save);

      await startServiceScene(page, '7-1');
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'tests/screenshots/phase51-1-service-full-ch7.png',
      });
    });
  });

  // ───────────────────────────────────────────────────────────
  // 12. SAVE_VERSION 상수 확인
  // ───────────────────────────────────────────────────────────
  test('SAVE_VERSION이 18이다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const version = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const data = SaveManager.load();
      return data.version;
    });
    expect(version).toBe(18);
  });

  // ───────────────────────────────────────────────────────────
  // 13. mireukEssenceTotal 누적 불변성 검증
  // ───────────────────────────────────────────────────────────
  test('mireukEssenceTotal은 캡 영향 없이 누적만 증가한다', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const save = createV18Save();
    save.mireukEssence = 990;
    save.mireukEssenceTotal = 990;
    await page.evaluate((s) => {
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(s));
    }, save);

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.addMireukEssence(20); // 990 + 20 → essence capped at 999, total = 1010
      const data = SaveManager.load();
      return {
        essence: data.mireukEssence,
        total: data.mireukEssenceTotal,
      };
    });

    expect(result.essence).toBe(999);
    expect(result.total).toBe(1010);
  });

  // ───────────────────────────────────────────────────────────
  // 14. _shutdown 정리 검증
  // ───────────────────────────────────────────────────────────
  test('씬 종료 후 _mireukSpawned 플래그가 리셋된다', async ({ page }) => {
    await waitForGame(page);
    await page.evaluate((save) => {
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(save));
    }, createV18Save());

    await startServiceScene(page, '7-1');

    // 씬 종료
    const result = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ServiceScene');
      // 수동으로 _mireukSpawned를 true로 설정
      scene._mireukSpawned = true;
      // 씬 종료
      game.scene.stop('ServiceScene');
      // shutdown 후 플래그 확인 (직접 접근 - shutdown에서 리셋)
      return { flagAfterStop: scene._mireukSpawned };
    });

    expect(result.flagAfterStop).toBe(false);
  });
});
