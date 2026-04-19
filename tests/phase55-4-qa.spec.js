/**
 * @fileoverview Phase 55-4 QA 테스트: 배경 테마 전환 + 업적 확장 + SaveManager v21
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 55-4 검증', () => {

  test.describe('게임 로드 및 콘솔 에러', () => {
    test('페이지 로드 시 JS 에러가 없다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('net::ERR') &&
        !e.includes('404')
      );
      expect(criticalErrors).toEqual([]);
    });
  });

  test.describe('배경 테마 전환 - _endlessFloorKey 정적 헬퍼', () => {
    test('_endlessFloorKey 정적 메서드가 존재한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const exists = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        return typeof mod.ServiceScene._endlessFloorKey === 'function';
      });
      expect(exists).toBe(true);
    });

    test('_endlessWallKey 정적 메서드가 존재한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const exists = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        return typeof mod.ServiceScene._endlessWallKey === 'function';
      });
      expect(exists).toBe(true);
    });

    test('wave 1~20 → floor_hall_endless', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave1: fn(1),
          wave10: fn(10),
          wave20: fn(20),
        };
      });
      expect(results.wave1).toBe('floor_hall_endless');
      expect(results.wave10).toBe('floor_hall_endless');
      expect(results.wave20).toBe('floor_hall_endless');
    });

    test('wave 21~30 → floor_hall_izakaya', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave21: fn(21),
          wave25: fn(25),
          wave30: fn(30),
        };
      });
      expect(results.wave21).toBe('floor_hall_izakaya');
      expect(results.wave25).toBe('floor_hall_izakaya');
      expect(results.wave30).toBe('floor_hall_izakaya');
    });

    test('wave 31~40 → floor_hall_bistro', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave31: fn(31),
          wave35: fn(35),
          wave40: fn(40),
        };
      });
      expect(results.wave31).toBe('floor_hall_bistro');
      expect(results.wave35).toBe('floor_hall_bistro');
      expect(results.wave40).toBe('floor_hall_bistro');
    });

    test('wave 41~50 → floor_hall_spice', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave41: fn(41),
          wave45: fn(45),
          wave50: fn(50),
        };
      });
      expect(results.wave41).toBe('floor_hall_spice');
      expect(results.wave45).toBe('floor_hall_spice');
      expect(results.wave50).toBe('floor_hall_spice');
    });

    test('wave 51~60 → floor_hall_cantina', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave51: fn(51),
          wave55: fn(55),
          wave60: fn(60),
        };
      });
      expect(results.wave51).toBe('floor_hall_cantina');
      expect(results.wave55).toBe('floor_hall_cantina');
      expect(results.wave60).toBe('floor_hall_cantina');
    });

    test('wave 61~70 → floor_hall_dream', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave61: fn(61),
          wave65: fn(65),
          wave70: fn(70),
        };
      });
      expect(results.wave61).toBe('floor_hall_dream');
      expect(results.wave65).toBe('floor_hall_dream');
      expect(results.wave70).toBe('floor_hall_dream');
    });

    test('wave 71+ 순환: 41 패턴 반복 (spice→cantina→dream)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave71: fn(71),
          wave80: fn(80),
          wave81: fn(81),
          wave90: fn(90),
          wave91: fn(91),
          wave100: fn(100),
          wave101: fn(101),
          wave110: fn(110),
        };
      });
      // 71~80: cycle 3%3=0 → spice
      expect(results.wave71).toBe('floor_hall_spice');
      expect(results.wave80).toBe('floor_hall_spice');
      // 81~90: cycle 4%3=1 → cantina
      expect(results.wave81).toBe('floor_hall_cantina');
      expect(results.wave90).toBe('floor_hall_cantina');
      // 91~100: cycle 5%3=2 → dream
      expect(results.wave91).toBe('floor_hall_dream');
      expect(results.wave100).toBe('floor_hall_dream');
      // 101~110: cycle 6%3=0 → spice (다시 순환)
      expect(results.wave101).toBe('floor_hall_spice');
      expect(results.wave110).toBe('floor_hall_spice');
    });

    test('경계값: wave 0 / 음수 / 매우 큰 수 처리', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        return {
          wave0: fn(0),
          waveNeg: fn(-1),
          wave9999: fn(9999),
        };
      });
      // wave <= 20 조건에 0과 -1은 true이므로 'floor_hall_endless'
      expect(results.wave0).toBe('floor_hall_endless');
      expect(results.waveNeg).toBe('floor_hall_endless');
      // 매우 큰 수는 순환 패턴을 따라야 한다 (에러 없이)
      expect(['floor_hall_spice', 'floor_hall_cantina', 'floor_hall_dream']).toContain(results.wave9999);
    });
  });

  test.describe('배경 테마 전환 - _endlessWallKey 정적 헬퍼', () => {
    test('벽 키가 바닥 키와 동일한 구간 패턴을 따른다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessWallKey;
        return {
          wave1: fn(1),
          wave20: fn(20),
          wave21: fn(21),
          wave30: fn(30),
          wave31: fn(31),
          wave40: fn(40),
          wave41: fn(41),
          wave50: fn(50),
          wave51: fn(51),
          wave60: fn(60),
          wave61: fn(61),
          wave70: fn(70),
          wave71: fn(71),
          wave80: fn(80),
        };
      });
      expect(results.wave1).toBe('wall_back_endless');
      expect(results.wave20).toBe('wall_back_endless');
      expect(results.wave21).toBe('wall_back_izakaya');
      expect(results.wave30).toBe('wall_back_izakaya');
      expect(results.wave31).toBe('wall_back_bistro');
      expect(results.wave40).toBe('wall_back_bistro');
      expect(results.wave41).toBe('wall_back_spice');
      expect(results.wave50).toBe('wall_back_spice');
      expect(results.wave51).toBe('wall_back_cantina');
      expect(results.wave60).toBe('wall_back_cantina');
      expect(results.wave61).toBe('wall_back_dream');
      expect(results.wave70).toBe('wall_back_dream');
      expect(results.wave71).toBe('wall_back_spice');
      expect(results.wave80).toBe('wall_back_spice');
    });
  });

  test.describe('SaveManager v21', () => {
    test('SAVE_VERSION === 21', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const version = await page.evaluate(async () => {
        const mod = await import('/js/managers/SaveManager.js');
        // 새 게임 데이터를 생성하여 version 확인
        // SaveManager.load()는 없으면 createDefault() 반환
        const data = mod.SaveManager.load();
        return data.version;
      });
      expect(version).toBe(21);
    });

    test('v20 → v21 마이그레이션: 3개 필드가 추가된다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/SaveManager.js');
        // v20 세이브 시뮬레이션: localStorage에 v20 데이터 직접 저장
        const fakeV20 = {
          version: 20,
          stages: {},
          totalGoldEarned: 0,
          kitchenCoins: 0,
          upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
          unlockedRecipes: [],
          selectedChef: null,
          completedOrders: [],
          cookingSlots: 2,
          bestSatisfaction: {},
          tableUpgrades: [0, 0, 0, 0],
          unlockedTables: 4,
          interiors: { flower: 0, kitchen: 0, lighting: 0 },
          staff: { waiter: false, dishwasher: false },
          soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
          gold: 500,
          tools: { pan: { count: 4, level: 1 } },
          tutorialDone: true,
          tutorialBattle: true,
          tutorialService: true,
          tutorialShop: true,
          tutorialEndless: true,
          tutorialMerchant: true,
          seenDialogues: [],
          storyProgress: { chapter: 6, flags: {} },
          season2Unlocked: true,
          mireukEssence: 100,
          mireukEssenceTotal: 200,
          mireukTravelerCount: 5,
          mireukBossRewards: {},
          wanderingChefs: { hired: [], unlocked: [], enhancements: {} },
          giftIngredients: {},
          endless: {
            unlocked: true,
            bestWave: 35,
            bestScore: 5000,
            bestCombo: 12,
            lastDailySeed: 12345,
          },
        };

        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(fakeV20));

        // load()를 호출하면 마이그레이션이 실행됨
        const migrated = mod.SaveManager.load();

        return {
          version: migrated.version,
          hasStormCount: 'stormCount' in migrated.endless,
          hasMissionSuccessCount: 'missionSuccessCount' in migrated.endless,
          hasNoLeakStreak: 'noLeakStreak' in migrated.endless,
          stormCount: migrated.endless.stormCount,
          missionSuccessCount: migrated.endless.missionSuccessCount,
          noLeakStreak: migrated.endless.noLeakStreak,
          // 기존 데이터 보존 확인
          bestWave: migrated.endless.bestWave,
          bestScore: migrated.endless.bestScore,
        };
      });

      expect(result.version).toBe(21);
      expect(result.hasStormCount).toBe(true);
      expect(result.hasMissionSuccessCount).toBe(true);
      expect(result.hasNoLeakStreak).toBe(true);
      expect(result.stormCount).toBe(0);
      expect(result.missionSuccessCount).toBe(0);
      expect(result.noLeakStreak).toBe(0);
      // 기존 데이터 무결성
      expect(result.bestWave).toBe(35);
      expect(result.bestScore).toBe(5000);
    });

    test('v20 → v21 마이그레이션: endless 필드가 없던 세이브도 처리', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/SaveManager.js');
        // endless 객체가 없는 v20 세이브
        const fakeV20NoEndless = {
          version: 20,
          stages: {},
          totalGoldEarned: 0,
          kitchenCoins: 0,
          upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
          unlockedRecipes: [],
          gold: 0,
          tools: { pan: { count: 4, level: 1 } },
          giftIngredients: {},
          // endless 필드 없음
        };

        localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(fakeV20NoEndless));
        const migrated = mod.SaveManager.load();

        return {
          version: migrated.version,
          endlessExists: !!migrated.endless,
          unlocked: migrated.endless?.unlocked,
          bestWave: migrated.endless?.bestWave,
          stormCount: migrated.endless?.stormCount,
          missionSuccessCount: migrated.endless?.missionSuccessCount,
          noLeakStreak: migrated.endless?.noLeakStreak,
        };
      });

      expect(result.version).toBe(21);
      expect(result.endlessExists).toBe(true);
      expect(result.unlocked).toBe(false);
      expect(result.bestWave).toBe(0);
      expect(result.stormCount).toBe(0);
      expect(result.missionSuccessCount).toBe(0);
      expect(result.noLeakStreak).toBe(0);
    });

    test('incrementEndlessStormCount 헬퍼 동작', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/SaveManager.js');
        // 클린 세이브 설정
        localStorage.removeItem('kitchenChaosTycoon_save');
        const initial = mod.SaveManager.load();

        const count1 = mod.SaveManager.incrementEndlessStormCount();
        const count2 = mod.SaveManager.incrementEndlessStormCount();
        const count3 = mod.SaveManager.incrementEndlessStormCount();

        return { initial: initial.endless.stormCount, count1, count2, count3 };
      });

      expect(result.initial).toBe(0);
      expect(result.count1).toBe(1);
      expect(result.count2).toBe(2);
      expect(result.count3).toBe(3);
    });

    test('incrementEndlessMissionSuccess 헬퍼 동작', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/SaveManager.js');
        localStorage.removeItem('kitchenChaosTycoon_save');
        mod.SaveManager.load(); // 초기화

        const c1 = mod.SaveManager.incrementEndlessMissionSuccess();
        const c2 = mod.SaveManager.incrementEndlessMissionSuccess();

        return { c1, c2 };
      });

      expect(result.c1).toBe(1);
      expect(result.c2).toBe(2);
    });

    test('updateEndlessNoLeakStreak: 연속 true → 누적, false → 리셋', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/SaveManager.js');
        localStorage.removeItem('kitchenChaosTycoon_save');
        mod.SaveManager.load();

        const s1 = mod.SaveManager.updateEndlessNoLeakStreak(true);
        const s2 = mod.SaveManager.updateEndlessNoLeakStreak(true);
        const s3 = mod.SaveManager.updateEndlessNoLeakStreak(true);
        const sReset = mod.SaveManager.updateEndlessNoLeakStreak(false);
        const s4 = mod.SaveManager.updateEndlessNoLeakStreak(true);

        return { s1, s2, s3, sReset, s4 };
      });

      expect(result.s1).toBe(1);
      expect(result.s2).toBe(2);
      expect(result.s3).toBe(3);
      expect(result.sReset).toBe(0);
      expect(result.s4).toBe(1);
    });
  });

  test.describe('업적 데이터 검증', () => {
    test('엔드리스 카테고리 업적 6개 존재', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/achievementData.js');
        const endlessAch = mod.ACHIEVEMENTS.filter(a => a.category === 'endless');
        return {
          count: endlessAch.length,
          ids: endlessAch.map(a => a.id),
        };
      });

      expect(result.count).toBe(6);
      expect(result.ids).toContain('endless_wave20');
      expect(result.ids).toContain('endless_wave50');
      expect(result.ids).toContain('endless_wave100');
      expect(result.ids).toContain('endless_storm10');
      expect(result.ids).toContain('endless_mission30');
      expect(result.ids).toContain('endless_no_leak10');
    });

    test('endless_wave100 조건 타입이 endless_wave + threshold 100', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/achievementData.js');
        const ach = mod.ACHIEVEMENTS.find(a => a.id === 'endless_wave100');
        return ach ? { type: ach.condition.type, threshold: ach.condition.threshold, reward: ach.reward } : null;
      });

      expect(result).not.toBeNull();
      expect(result.type).toBe('endless_wave');
      expect(result.threshold).toBe(100);
      expect(result.reward.gold).toBe(3000);
    });

    test('endless_storm10 조건: endless_storm_cleared, threshold 10', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/achievementData.js');
        const ach = mod.ACHIEVEMENTS.find(a => a.id === 'endless_storm10');
        return ach ? { type: ach.condition.type, threshold: ach.condition.threshold, reward: ach.reward } : null;
      });

      expect(result).not.toBeNull();
      expect(result.type).toBe('endless_storm_cleared');
      expect(result.threshold).toBe(10);
      expect(result.reward.coin).toBe(30);
    });

    test('endless_mission30 보상에 mireukEssence: 50이 있다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/achievementData.js');
        const ach = mod.ACHIEVEMENTS.find(a => a.id === 'endless_mission30');
        return ach ? { type: ach.condition.type, threshold: ach.condition.threshold, reward: ach.reward } : null;
      });

      expect(result).not.toBeNull();
      expect(result.type).toBe('endless_mission_success');
      expect(result.threshold).toBe(30);
      expect(result.reward.mireukEssence).toBe(50);
    });

    test('endless_no_leak10 조건: endless_no_leak_streak, threshold 10', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/achievementData.js');
        const ach = mod.ACHIEVEMENTS.find(a => a.id === 'endless_no_leak10');
        return ach ? { type: ach.condition.type, threshold: ach.condition.threshold, reward: ach.reward } : null;
      });

      expect(result).not.toBeNull();
      expect(result.type).toBe('endless_no_leak_streak');
      expect(result.threshold).toBe(10);
      expect(result.reward.gold).toBe(2000);
    });
  });

  test.describe('AchievementManager 조건 처리 검증', () => {
    test('_getCurrentValue가 endless_storm_cleared를 올바르게 반환한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const saveMod = await import('/js/managers/SaveManager.js');
        const achMod = await import('/js/managers/AchievementManager.js');

        // 테스트 데이터 설정
        localStorage.removeItem('kitchenChaosTycoon_save');
        saveMod.SaveManager.load();

        // stormCount를 5로 설정
        for (let i = 0; i < 5; i++) saveMod.SaveManager.incrementEndlessStormCount();

        const data = saveMod.SaveManager.load();
        const fakeAch = { condition: { type: 'endless_storm_cleared', threshold: 10 } };
        const value = achMod.AchievementManager._getCurrentValue(data, fakeAch);
        return value;
      });

      expect(result).toBe(5);
    });

    test('_getCurrentValue가 endless_mission_success를 올바르게 반환한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const saveMod = await import('/js/managers/SaveManager.js');
        const achMod = await import('/js/managers/AchievementManager.js');

        localStorage.removeItem('kitchenChaosTycoon_save');
        saveMod.SaveManager.load();

        for (let i = 0; i < 30; i++) saveMod.SaveManager.incrementEndlessMissionSuccess();

        const data = saveMod.SaveManager.load();
        const fakeAch = { condition: { type: 'endless_mission_success', threshold: 30 } };
        const value = achMod.AchievementManager._getCurrentValue(data, fakeAch);
        return value;
      });

      expect(result).toBe(30);
    });

    test('_getCurrentValue가 endless_no_leak_streak를 올바르게 반환한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const saveMod = await import('/js/managers/SaveManager.js');
        const achMod = await import('/js/managers/AchievementManager.js');

        localStorage.removeItem('kitchenChaosTycoon_save');
        saveMod.SaveManager.load();

        for (let i = 0; i < 7; i++) saveMod.SaveManager.updateEndlessNoLeakStreak(true);

        const data = saveMod.SaveManager.load();
        const fakeAch = { condition: { type: 'endless_no_leak_streak', threshold: 10 } };
        const value = achMod.AchievementManager._getCurrentValue(data, fakeAch);
        return value;
      });

      expect(result).toBe(7);
    });

    test('endless_wave100: bestWave가 100 이상이면 해금된다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const saveMod = await import('/js/managers/SaveManager.js');
        const achMod = await import('/js/managers/AchievementManager.js');

        localStorage.removeItem('kitchenChaosTycoon_save');
        const data = saveMod.SaveManager.load();
        data.endless.bestWave = 100;
        data.achievements = { unlocked: {}, claimed: {}, progress: {} };
        saveMod.SaveManager.save(data);

        // check 호출 (scene=null이므로 토스트 생략)
        achMod.AchievementManager.check(null, 'endless_wave', 0);

        const afterData = saveMod.SaveManager.load();
        return {
          unlocked: !!afterData.achievements.unlocked['endless_wave100'],
          wave20Unlocked: !!afterData.achievements.unlocked['endless_wave20'],
          wave50Unlocked: !!afterData.achievements.unlocked['endless_wave50'],
        };
      });

      expect(result.unlocked).toBe(true);
      // bestWave 100은 20, 50도 만족시킴
      expect(result.wave20Unlocked).toBe(true);
      expect(result.wave50Unlocked).toBe(true);
    });
  });

  test.describe('AchievementScene - mireukEssence 보상 처리', () => {
    test('AchievementScene._claimReward가 reward.mireukEssence를 처리한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/scenes/AchievementScene.js');
        // _claimReward 함수의 mireukEssence 분기 존재를 소스 코드 레벨로 확인
        const src = mod.AchievementScene.prototype._claimReward.toString();
        return {
          hasMireukEssenceBranch: src.includes('mireukEssence'),
          hasAddMireukEssence: src.includes('addMireukEssence'),
        };
      });

      expect(result.hasMireukEssenceBranch).toBe(true);
      expect(result.hasAddMireukEssence).toBe(true);
    });
  });

  test.describe('엣지케이스 및 안정성', () => {
    test('_endlessFloorKey: undefined/null/NaN 입력 시 크래시하지 않는다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/scenes/ServiceScene.js');
        const fn = mod.ServiceScene._endlessFloorKey;
        try {
          const r1 = fn(undefined);
          const r2 = fn(null);
          const r3 = fn(NaN);
          return { crashed: false, r1, r2, r3 };
        } catch (e) {
          return { crashed: true, error: e.message };
        }
      });

      expect(result.crashed).toBe(false);
      // undefined/null/NaN은 <= 20 비교에서 false이므로 cycle 계산으로 넘어갈 수 있음
      // NaN <= 20 → false, NaN <= 30 → false, NaN <= 40 → false
      // Math.floor((NaN - 41)/10) → NaN, NaN % 3 → NaN
      // array[NaN] → undefined 반환할 수 있음
      // 이 경우 undefined를 반환하면 에셋 로드 시 문제가 됨
    });

    test('updateEndlessNoLeakStreak: 연속 false 호출 시 항상 0', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const saveMod = await import('/js/managers/SaveManager.js');
        localStorage.removeItem('kitchenChaosTycoon_save');
        saveMod.SaveManager.load();

        const r1 = saveMod.SaveManager.updateEndlessNoLeakStreak(false);
        const r2 = saveMod.SaveManager.updateEndlessNoLeakStreak(false);
        const r3 = saveMod.SaveManager.updateEndlessNoLeakStreak(false);
        return { r1, r2, r3 };
      });

      expect(result.r1).toBe(0);
      expect(result.r2).toBe(0);
      expect(result.r3).toBe(0);
    });

    test('전체 업적 수가 34개이다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const count = await page.evaluate(async () => {
        const mod = await import('/js/data/achievementData.js');
        return mod.ACHIEVEMENTS.length;
      });

      expect(count).toBe(34);
    });
  });
});
