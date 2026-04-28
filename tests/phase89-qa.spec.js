/**
 * @fileoverview Phase 89 QA: 시즌 패스 + IAP 팩 검증.
 * AC-1~AC-7 수용 기준 + 엣지케이스 + 시각적 검증.
 *
 * 로직 테스트는 about:blank에서 Vite 모듈을 직접 import하여 수행한다.
 * 이렇게 하면 Phaser 게임이 시작되지 않아 SaveManager 경합이 발생하지 않는다.
 */
import { test, expect } from '@playwright/test';

const SAVE_KEY = 'kitchenChaosTycoon_save';
const BASE = 'http://localhost:5173';

/** 공통 v31 세이브 생성 */
function v31Save(sp = {}, extra = {}) {
  return JSON.stringify({
    version: 31, stages: {}, totalGoldEarned: 0, gold: 0, kitchenCoins: 0,
    mireukEssence: 0, mireukEssenceTotal: 0, mimiSkinCoupons: 0,
    weeklyEvent: { lastSeenEventId: null },
    seasonPass: { currentXP: 0, currentTier: 0, hasPaidPass: false,
      claimedFree: [], claimedPaid: [], seasonId: 'S1', ...sp },
    ...extra,
  });
}

test.describe('Phase 89: 시즌 패스 + IAP 팩', () => {

  test.beforeEach(async ({ page }) => {
    // /__blank__ 라우트를 인터셉트하여 게임 HTML 없이 빈 페이지로 이동.
    // 게임 모듈이 백그라운드에 로드되지 않아 속도가 빠르고 localStorage 경합이 없다.
    await page.route(`${BASE}/__blank__`, (route) => {
      route.fulfill({ contentType: 'text/html', body: '<html><head></head><body></body></html>' });
    });
    await page.goto(BASE + '/__blank__', { waitUntil: 'domcontentloaded' });
    // 테스트 간 localStorage 오염 방지
    await page.evaluate(() => localStorage.clear());
    await page.unroute(`${BASE}/__blank__`);
  });

  // ── AC-1: SeasonManager XP ──

  test.describe('AC-1: SeasonManager 핵심 로직', () => {
    test('addXP(stage_clear, 3) -> XP 30', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('stage_clear', 3);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.currentXP).toBe(30);
    });

    test('addXP(stage_clear, 1) -> XP 10', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('stage_clear', 1);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.currentXP).toBe(10);
    });

    test('addXP(stage_clear, 2) -> XP 10 (2성=1성)', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('stage_clear', 2);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.currentXP).toBe(10);
    });

    test('addXP(daily_mission, 1) -> XP 20', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('daily_mission', 1);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.currentXP).toBe(20);
    });

    test('addXP(endless_best_wave, 1) -> XP 15', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('endless_best_wave', 1);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.currentXP).toBe(15);
    });

    test('XP 90+10=100 -> tier 1 달성', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('stage_clear', 1);  // +10 -> 100
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save({ currentXP: 90 }), BASE]);
      expect(result.currentXP).toBe(100);
      expect(result.currentTier).toBe(1);
    });

    test('XP 170+30=200 -> tier 2 (다단계 동시 달성)', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('stage_clear', 3);  // +30 -> 200
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save({ currentXP: 170, currentTier: 1 }), BASE]);
      expect(result.currentXP).toBe(200);
      expect(result.currentTier).toBe(2);
    });

    test('무료 보상 수령 (tier 1 gold 100)', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        const ok = SeasonManager.claimReward(1, 'free');
        const data = SaveManager.load();
        return { ok, gold: data.gold, claimedFree: data.seasonPass.claimedFree };
      }, [SAVE_KEY, v31Save({ currentXP: 100, currentTier: 1 }, { gold: 500 }), BASE]);
      expect(result.ok).toBe(true);
      expect(result.gold).toBe(600);
      expect(result.claimedFree).toContain(1);
    });

    test('유료 보상 수령 -- 패스 미보유 시 실패', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.removeItem('kc_season_pass_owned');
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.claimReward(1, 'paid');
      }, [SAVE_KEY, v31Save({ currentXP: 100, currentTier: 1 }), BASE]);
      expect(result).toBe(false);
    });

    test('유료 보상 수령 -- 패스 보유 시 성공', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem('kc_season_pass_owned', '1');
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        const ok = SeasonManager.claimReward(1, 'paid');
        const data = SaveManager.load();
        return { ok, kitchenCoins: data.kitchenCoins, claimedPaid: data.seasonPass.claimedPaid };
      }, [SAVE_KEY, v31Save({ currentXP: 100, currentTier: 1, hasPaidPass: true }, { kitchenCoins: 5 }), BASE]);
      expect(result.ok).toBe(true);
      expect(result.kitchenCoins).toBe(8);
      expect(result.claimedPaid).toContain(1);
    });

    test('이미 수령한 보상 재수령 시 실패', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.claimReward(1, 'free');
      }, [SAVE_KEY, v31Save({ currentXP: 100, currentTier: 1, claimedFree: [1] }), BASE]);
      expect(result).toBe(false);
    });

    test('미달성 단계 보상 수령 시 실패', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.claimReward(5, 'free');
      }, [SAVE_KEY, v31Save({ currentXP: 100, currentTier: 1 }), BASE]);
      expect(result).toBe(false);
    });
  });

  // ── AC-1 엣지케이스 ──

  test.describe('AC-1 엣지케이스', () => {
    test('최대 단계(50) 도달 시 XP 적립 불가', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('stage_clear', 3);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save({ currentXP: 9000, currentTier: 50 }), BASE]);
      expect(result.currentXP).toBe(9000);
      expect(result.currentTier).toBe(50);
    });

    test('누적 XP 계산 정확성', async ({ page }) => {
      const result = await page.evaluate(async ([base]) => {
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return {
          tier10: SeasonManager._getCumulativeXPForTier(10),
          tier25: SeasonManager._getCumulativeXPForTier(25),
          tier40: SeasonManager._getCumulativeXPForTier(40),
          tier50: SeasonManager._getCumulativeXPForTier(50),
        };
      }, [BASE]);
      expect(result.tier10).toBe(1000);
      expect(result.tier25).toBe(3250);
      expect(result.tier40).toBe(6250);
      expect(result.tier50).toBe(8750);
    });

    test('알 수 없는 source -> XP 변동 없음', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        SeasonManager.addXP('unknown_source', 1);
        return SeasonManager.getState();
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.currentXP).toBe(0);
    });

    test('tier 50 무료 extra 복합 보상 지급', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        const ok = SeasonManager.claimReward(50, 'free');
        const data = SaveManager.load();
        return { ok, gold: data.gold, kitchenCoins: data.kitchenCoins };
      }, [SAVE_KEY, v31Save({ currentXP: 8750, currentTier: 50 }), BASE]);
      expect(result.ok).toBe(true);
      expect(result.gold).toBe(2000);
      expect(result.kitchenCoins).toBe(20);
    });

    test('tier 50 유료 extra 복합 보상 지급', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem('kc_season_pass_owned', '1');
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        const ok = SeasonManager.claimReward(50, 'paid');
        const data = SaveManager.load();
        return { ok, kitchenCoins: data.kitchenCoins, mireukEssence: data.mireukEssence };
      }, [SAVE_KEY, v31Save({ currentXP: 8750, currentTier: 50, hasPaidPass: true }), BASE]);
      expect(result.ok).toBe(true);
      expect(result.kitchenCoins).toBe(30);
      expect(result.mireukEssence).toBe(50);
    });

    test('getProgressInTier -- tier 0, XP=50', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.getProgressInTier();
      }, [SAVE_KEY, v31Save({ currentXP: 50 }), BASE]);
      expect(result.currentInTier).toBe(50);
      expect(result.tierXP).toBe(100);
    });

    test('getProgressInTier -- tier 50 MAX -> 0/0', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.getProgressInTier();
      }, [SAVE_KEY, v31Save({ currentXP: 9000, currentTier: 50 }), BASE]);
      expect(result.currentInTier).toBe(0);
      expect(result.tierXP).toBe(0);
    });

    test('SEASON_REWARDS 50단계 전체 정의', async ({ page }) => {
      const result = await page.evaluate(async ([base]) => {
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        let count = 0;
        for (let t = 1; t <= 50; t++) {
          if (SeasonManager.getRewardDef(t)) count++;
        }
        return {
          count,
          t0IsNull: SeasonManager.getRewardDef(0) === null,
          t51IsNull: SeasonManager.getRewardDef(51) === null,
        };
      }, [BASE]);
      expect(result.count).toBe(50);
      expect(result.t0IsNull).toBe(true);
      expect(result.t51IsNull).toBe(true);
    });

    test('getClaimable -- tier 5, free[1] claimed -> 4개', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.getClaimable();
      }, [SAVE_KEY, v31Save({ currentXP: 500, currentTier: 5, claimedFree: [1] }), BASE]);
      expect(result.length).toBe(4);
      expect(result.every((r) => r.track === 'free')).toBe(true);
    });

    test('mireukEssence 보상 999 캡', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        SeasonManager.claimReward(20, 'free');
        const data = SaveManager.load();
        return { me: data.mireukEssence, met: data.mireukEssenceTotal };
      }, [SAVE_KEY, v31Save({ currentXP: 3250, currentTier: 20 }, { mireukEssence: 990, mireukEssenceTotal: 990 }), BASE]);
      expect(result.me).toBe(999);
      expect(result.met).toBe(1010);
    });

    test('잘못된 track -> false', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { SeasonManager } = await import(base + '/js/managers/SeasonManager.js');
        return SeasonManager.claimReward(1, 'invalid_track');
      }, [SAVE_KEY, v31Save({ currentXP: 100, currentTier: 1 }), BASE]);
      expect(result).toBe(false);
    });
  });

  // ── AC-2: IAPManager 5종 체계 ──

  test.describe('AC-2: IAPManager 5종 체계', () => {
    test('isSeasonPassOwned() 미구매 시 false', async ({ page }) => {
      const result = await page.evaluate(async ([base]) => {
        localStorage.removeItem('kc_season_pass_owned');
        const { IAPManager } = await import(base + '/js/managers/IAPManager.js');
        return IAPManager.isSeasonPassOwned();
      }, [BASE]);
      expect(result).toBe(false);
    });

    test('purchaseSeasonPass() -> true + hasPaidPass 동기화', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.removeItem('kc_season_pass_owned');
        localStorage.setItem(key, save);
        const { IAPManager } = await import(base + '/js/managers/IAPManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        await IAPManager.purchaseSeasonPass();
        const owned = IAPManager.isSeasonPassOwned();
        const data = SaveManager.load();
        return { owned, hasPaidPass: data.seasonPass.hasPaidPass };
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.owned).toBe(true);
      expect(result.hasPaidPass).toBe(true);
    });

    test('purchaseCoinPack() -> kitchenCoins +30', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.setItem(key, save);
        const { IAPManager } = await import(base + '/js/managers/IAPManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        await IAPManager.purchaseCoinPack();
        return SaveManager.load().kitchenCoins;
      }, [SAVE_KEY, v31Save({}, { kitchenCoins: 10 }), BASE]);
      expect(result).toBe(40);
    });

    test('IAP 5종 메서드 전체 존재', async ({ page }) => {
      const result = await page.evaluate(async ([base]) => {
        const { IAPManager } = await import(base + '/js/managers/IAPManager.js');
        return [
          'purchaseRemoveAds', 'isAdsRemoved', 'purchaseSkin', 'isSkinOwned',
          'purchaseSeasonPass', 'isSeasonPassOwned', 'purchaseCoinPack',
        ].every(m => typeof IAPManager[m] === 'function');
      }, [BASE]);
      expect(result).toBe(true);
    });
  });

  // ── AC-6: v31 마이그레이션 ──

  test.describe('AC-6: 세이브 v31 마이그레이션', () => {
    test('v30 -> v31 + seasonPass 기본값 삽입', async ({ page }) => {
      const result = await page.evaluate(async ([key, base]) => {
        localStorage.setItem(key, JSON.stringify({
          version: 30, stages: {}, totalGoldEarned: 0,
          gold: 500, kitchenCoins: 10, mireukEssence: 50, mireukEssenceTotal: 50,
          mimiSkinCoupons: 0, weeklyEvent: { lastSeenEventId: null },
        }));
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        const data = SaveManager.load();
        return { version: data.version, sp: data.seasonPass, gold: data.gold };
      }, [SAVE_KEY, BASE]);
      expect(result.version).toBe(31);
      expect(result.sp).toBeDefined();
      expect(result.sp.currentXP).toBe(0);
      expect(result.sp.currentTier).toBe(0);
      expect(result.sp.hasPaidPass).toBe(false);
      expect(Array.isArray(result.sp.claimedFree)).toBe(true);
      expect(Array.isArray(result.sp.claimedPaid)).toBe(true);
      expect(result.sp.seasonId).toBe('S1');
      expect(result.gold).toBe(500);
    });

    test('부분 필드 누락 seasonPass 마이그레이션', async ({ page }) => {
      const result = await page.evaluate(async ([key, base]) => {
        localStorage.setItem(key, JSON.stringify({
          version: 30, stages: {}, totalGoldEarned: 0, gold: 500, kitchenCoins: 10,
          weeklyEvent: { lastSeenEventId: null },
          seasonPass: { currentXP: 100 },
        }));
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        return SaveManager.load().seasonPass;
      }, [SAVE_KEY, BASE]);
      expect(result.currentXP).toBe(100);
      expect(result.currentTier).toBe(0);
      expect(result.hasPaidPass).toBe(false);
      expect(Array.isArray(result.claimedFree)).toBe(true);
      expect(result.seasonId).toBe('S1');
    });

    test('claimedFree/claimedPaid 비배열 구 세이브 방어', async ({ page }) => {
      const result = await page.evaluate(async ([key, base]) => {
        localStorage.setItem(key, JSON.stringify({
          version: 30, stages: {}, totalGoldEarned: 0, gold: 0, kitchenCoins: 0,
          weeklyEvent: { lastSeenEventId: null },
          seasonPass: { currentXP: 0, currentTier: 0, hasPaidPass: false,
            claimedFree: 'corrupted', claimedPaid: null, seasonId: 'S1' },
        }));
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        const sp = SaveManager.load().seasonPass;
        return { freeOk: Array.isArray(sp.claimedFree), paidOk: Array.isArray(sp.claimedPaid) };
      }, [SAVE_KEY, BASE]);
      expect(result.freeOk).toBe(true);
      expect(result.paidOk).toBe(true);
    });
  });

  // ── AC-7: 시즌 패스 유료 구매 ──

  test.describe('AC-7: 시즌 패스 유료 구매', () => {
    test('purchaseSeasonPass -> localStorage + SaveManager 동기화', async ({ page }) => {
      const result = await page.evaluate(async ([key, save, base]) => {
        localStorage.removeItem('kc_season_pass_owned');
        localStorage.setItem(key, save);
        const { IAPManager } = await import(base + '/js/managers/IAPManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        await IAPManager.purchaseSeasonPass();
        return {
          ls: localStorage.getItem('kc_season_pass_owned'),
          hasPaid: SaveManager.load().seasonPass.hasPaidPass,
        };
      }, [SAVE_KEY, v31Save(), BASE]);
      expect(result.ls).toBe('1');
      expect(result.hasPaid).toBe(true);
    });
  });

  // ── AC-4/AC-5: XP 훅 존재 ──

  test.describe('AC-4/AC-5: XP 훅 존재', () => {
    test('ResultScene에 SeasonManager.addXP(stage_clear) 호출', async ({ page }) => {
      const result = await page.evaluate(async ([base]) => {
        const r = await fetch(base + '/js/scenes/ResultScene.js');
        return (await r.text()).includes("SeasonManager.addXP('stage_clear'");
      }, [BASE]);
      expect(result).toBe(true);
    });

    test('DailyMissionManager에 SeasonManager.addXP(daily_mission) 호출', async ({ page }) => {
      const result = await page.evaluate(async ([base]) => {
        const r = await fetch(base + '/js/managers/DailyMissionManager.js');
        return (await r.text()).includes("SeasonManager.addXP('daily_mission'");
      }, [BASE]);
      expect(result).toBe(true);
    });
  });

  // ── BUG-1: DailyMissionManager XP 데이터 레이스 ──

  test.describe('BUG-1: DailyMissionManager XP 데이터 레이스', () => {
    test('일일 미션 완료 시 시즌 XP 보존 여부', async ({ page }) => {
      const result = await page.evaluate(async ([key, base]) => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(key, JSON.stringify({
          version: 31, stages: {}, totalGoldEarned: 0, gold: 0, kitchenCoins: 0,
          mireukEssence: 0, mireukEssenceTotal: 0, mimiSkinCoupons: 0,
          weeklyEvent: { lastSeenEventId: null },
          seasonPass: { currentXP: 0, currentTier: 0, hasPaidPass: false,
            claimedFree: [], claimedPaid: [], seasonId: 'S1' },
          dailyMissions: {
            dateKey: today,
            selected: ['stage_clear_3'],
            progress: { stage_clear_3: 2 },
            completed: {},
            claimed: {},
          },
        }));
        const { DailyMissionManager } = await import(base + '/js/managers/DailyMissionManager.js');
        const { SaveManager } = await import(base + '/js/managers/SaveManager.js');
        DailyMissionManager.recordProgress('stage_clear', 1);
        const data = SaveManager.load();
        return {
          seasonXP: data.seasonPass.currentXP,
          completed: !!data.dailyMissions.completed.stage_clear_3,
          claimed: !!data.dailyMissions.claimed.stage_clear_3,
        };
      }, [SAVE_KEY, BASE]);
      expect(result.completed).toBe(true);
      expect(result.claimed).toBe(true);
      // BUG-1: seasonXP가 0이면 recordProgress.save(data)가 addXP 결과를 덮어쓴 것
      expect(result.seasonXP).toBe(20);
    });
  });

  // ── 시각적 검증 ──

  test.describe('UI 안정성', () => {
    test('메뉴 씬 로드 -- 크리티컬 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(BASE);
      await page.waitForTimeout(3000);
      const critical = errors.filter((e) =>
        !e.includes('404') && !e.includes('texture') && !e.includes('Failed to load') &&
        !e.includes('admob') && !e.includes('Capacitor')
      );
      expect(critical).toEqual([]);
    });

    test('메뉴 씬 스크린샷', async ({ page }) => {
      await page.goto(BASE);
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/phase89-menu-loaded.png' });
    });
  });
});
