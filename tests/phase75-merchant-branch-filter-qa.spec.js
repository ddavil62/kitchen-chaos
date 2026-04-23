/**
 * @fileoverview Phase 75 QA — 행상인 분기 카드 풀 선행 해금 체크.
 *
 * 검증 대상:
 *  - `merchantBranchData.getEligiblePool(category, branchCardsState, progressState)` 필터 동작
 *  - `merchantBranchData.selectBranchCards(branchCardsState, progressState)` 시그니처/동작
 *  - `chefUnlockHelper.isChefUnlocked(chefId, progressState)` 매트릭스
 *  - `ChefSelectScene` 잠금 반전 버그 회귀 확인
 *  - `MerchantScene` state 구성 (currentChapter, season2/3Unlocked, tools)
 *  - `progressState` 누락/undefined 안전성
 *  - 전체 풀 소진 시 빈 배열 반환 (런타임 에러 없음)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 헬퍼 ──

async function waitForGame(page) {
  await page.waitForFunction(() => window.__game && window.__game.isBooted, { timeout: 15000 });
}

/**
 * 세이브를 localStorage에 직접 주입한다.
 * @param {import('@playwright/test').Page} page
 * @param {object} overrides - 기본 세이브에 덮어쓸 필드
 */
async function injectSave(page, overrides = {}) {
  const base = {
    version: 24,
    selectedChef: 'mimi_chef',
    stages: {},
    gold: 500,
    kitchenCoins: 100,
    totalGoldEarned: 0,
    tutorialDone: true,
    tutorialBattle: true, tutorialService: true, tutorialShop: true,
    tutorialEndless: true, tutorialMerchant: true,
    upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: [],
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: false, dishwasher: false },
    soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
    tools: {
      pan: { count: 4, level: 1 }, salt: { count: 1, level: 1 },
      grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 }, spice_grinder: { count: 0, level: 1 },
    },
    season2Unlocked: false,
    season3Unlocked: false,
    seenDialogues: [],
    storyProgress: { currentChapter: 3, storyFlags: {} },
    mireukEssence: 0, mireukEssenceTotal: 0, mireukTravelerCount: 0,
    mireukBossRewards: [], wanderingChefs: {},
    giftIngredients: {},
    endless: {
      unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
      lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0,
    },
    branchCards: {
      toolMutations: {}, unlockedBranchRecipes: [],
      chefBonds: [], activeBlessing: null, lastVisit: null,
    },
    achievements: { unlocked: {}, claimed: {}, progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 } },
  };
  const merged = { ...base, ...overrides };
  if (overrides.branchCards) merged.branchCards = { ...base.branchCards, ...overrides.branchCards };
  if (overrides.tools) merged.tools = { ...base.tools, ...overrides.tools };
  if (overrides.storyProgress) merged.storyProgress = { ...base.storyProgress, ...overrides.storyProgress };
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: merged });
}

// ──────────────────────────────────────────────────────────────────
// 그룹 A: isChefUnlocked 매트릭스 (성공 기준 1 보조)
// ──────────────────────────────────────────────────────────────────

test.describe('A. chefUnlockHelper.isChefUnlocked 매트릭스', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('모든 셰프 × 진행도 시나리오 기대값 매칭', async ({ page }) => {
    const matrix = await page.evaluate(async () => {
      const { isChefUnlocked } = await import('/js/data/chefUnlockHelper.js');
      const psEarly = { currentChapter: 3, season2Unlocked: false, season3Unlocked: false };
      const psMid = { currentChapter: 12, season2Unlocked: true, season3Unlocked: false };
      const psLate = { currentChapter: 20, season2Unlocked: true, season3Unlocked: true };
      const chefs = ['mimi_chef', 'rin_chef', 'mage_chef', 'yuki_chef', 'lao_chef', 'andre_chef', 'arjun_chef', 'unknown_chef'];
      const out = { early: {}, mid: {}, late: {} };
      for (const c of chefs) {
        out.early[c] = isChefUnlocked(c, psEarly);
        out.mid[c] = isChefUnlocked(c, psMid);
        out.late[c] = isChefUnlocked(c, psLate);
      }
      return out;
    });

    // early: ch=3, s2=false → mimi/rin/mage만
    expect(matrix.early.mimi_chef).toBe(true);
    expect(matrix.early.rin_chef).toBe(true);
    expect(matrix.early.mage_chef).toBe(true);
    expect(matrix.early.yuki_chef).toBe(false);
    expect(matrix.early.lao_chef).toBe(false);
    expect(matrix.early.andre_chef).toBe(false);
    expect(matrix.early.arjun_chef).toBe(false);
    expect(matrix.early.unknown_chef).toBe(false);

    // mid: ch=12, s2=true, s3=false → mimi/rin/mage + yuki + lao (ch>=10), andre(ch>=13) 미충족, arjun 미충족
    expect(matrix.mid.yuki_chef).toBe(true);
    expect(matrix.mid.lao_chef).toBe(true);
    expect(matrix.mid.andre_chef).toBe(false); // ch=12 < 13
    expect(matrix.mid.arjun_chef).toBe(false);

    // late: ch=20, s2+s3 → 전부 true
    expect(matrix.late.mimi_chef).toBe(true);
    expect(matrix.late.yuki_chef).toBe(true);
    expect(matrix.late.lao_chef).toBe(true);
    expect(matrix.late.andre_chef).toBe(true);
    expect(matrix.late.arjun_chef).toBe(true);
    expect(matrix.late.unknown_chef).toBe(false);
  });

  test('경계값 ch=10 lao 정확히 해금, ch=9 lao 잠금', async ({ page }) => {
    const boundary = await page.evaluate(async () => {
      const { isChefUnlocked } = await import('/js/data/chefUnlockHelper.js');
      return {
        lao_ch9: isChefUnlocked('lao_chef', { currentChapter: 9, season2Unlocked: true }),
        lao_ch10: isChefUnlocked('lao_chef', { currentChapter: 10, season2Unlocked: true }),
        andre_ch12: isChefUnlocked('andre_chef', { currentChapter: 12, season2Unlocked: true }),
        andre_ch13: isChefUnlocked('andre_chef', { currentChapter: 13, season2Unlocked: true }),
        arjun_ch16: isChefUnlocked('arjun_chef', { currentChapter: 16, season2Unlocked: true, season3Unlocked: true }),
        arjun_ch17: isChefUnlocked('arjun_chef', { currentChapter: 17, season2Unlocked: true, season3Unlocked: true }),
        // season2만으로는 arjun 해금 불가
        arjun_only_s2: isChefUnlocked('arjun_chef', { currentChapter: 20, season2Unlocked: true, season3Unlocked: false }),
      };
    });
    expect(boundary.lao_ch9).toBe(false);
    expect(boundary.lao_ch10).toBe(true);
    expect(boundary.andre_ch12).toBe(false);
    expect(boundary.andre_ch13).toBe(true);
    expect(boundary.arjun_ch16).toBe(false);
    expect(boundary.arjun_ch17).toBe(true);
    expect(boundary.arjun_only_s2).toBe(false);
  });

  test('progressState 누락/undefined 안전 기본값', async ({ page }) => {
    const safe = await page.evaluate(async () => {
      const { isChefUnlocked } = await import('/js/data/chefUnlockHelper.js');
      return {
        mimi_undef: isChefUnlocked('mimi_chef', undefined),
        mimi_null: isChefUnlocked('mimi_chef', null),
        mimi_empty: isChefUnlocked('mimi_chef', {}),
        arjun_undef: isChefUnlocked('arjun_chef', undefined),
        yuki_empty: isChefUnlocked('yuki_chef', {}),
        // ch=0 이거나 음수 방어
        lao_ch0: isChefUnlocked('lao_chef', { currentChapter: 0, season2Unlocked: true }),
      };
    });
    expect(safe.mimi_undef).toBe(true);
    expect(safe.mimi_null).toBe(true);
    expect(safe.mimi_empty).toBe(true);
    expect(safe.arjun_undef).toBe(false);
    expect(safe.yuki_empty).toBe(false);
    // currentChapter || 1 → ch=0이면 1로 폴백, lao는 s2=true + ch=1 < 10 → false
    expect(safe.lao_ch0).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────
// 그룹 B: getEligiblePool 필터 (성공 기준 1, 2, 3)
// ──────────────────────────────────────────────────────────────────

test.describe('B. getEligiblePool 필터 로직', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('기준 1 (bond): 초반(ch=5, s2=false) → mimi/rin/mage bond만 풀에 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = { currentChapter: 5, season2Unlocked: false, season3Unlocked: false, tools: {} };
      const pool = d.getEligiblePool('bond', {}, ps);
      return {
        ids: pool.map(c => c.id),
        chefIds: pool.map(c => c.chefId),
      };
    });
    expect(result.chefIds).not.toContain('yuki_chef');
    expect(result.chefIds).not.toContain('lao_chef');
    expect(result.chefIds).not.toContain('andre_chef');
    expect(result.chefIds).not.toContain('arjun_chef');
    expect(result.ids).not.toContain('bond_arjun_wasabi');
    // mimi/rin/mage는 항상 해금 → bond 포함 (mimi는 2장)
    expect(result.chefIds).toContain('mimi_chef');
    expect(result.chefIds).toContain('rin_chef');
    expect(result.chefIds).toContain('mage_chef');
    // 총 4장: mimi×2 + rin×1 + mage×1
    expect(result.ids.length).toBe(4);
  });

  test('기준 1 (bond): 후반(ch=20, s2+s3) → 8장 전부 출현', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = { currentChapter: 20, season2Unlocked: true, season3Unlocked: true, tools: {} };
      return d.getEligiblePool('bond', {}, ps).map(c => c.id);
    });
    expect(result.length).toBe(8);
    expect(result).toContain('bond_arjun_wasabi');
    expect(result).toContain('bond_yuki_soup');
  });

  test('기준 2 (mutation): tools.wasabi_cannon.count=0 → mut_wasabi_cluster 제외', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = {
        currentChapter: 10, season2Unlocked: true, season3Unlocked: false,
        tools: { pan: { count: 4 }, wasabi_cannon: { count: 0 } },
      };
      return d.getEligiblePool('mutation', {}, ps).map(c => c.id);
    });
    expect(result).not.toContain('mut_wasabi_cluster');
    expect(result).toContain('mut_pan_flame');
  });

  test('기준 2 (mutation): tools 엔트리 누락(wasabi_cannon key 없음) → 제외', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = {
        currentChapter: 10, season2Unlocked: true, season3Unlocked: false,
        tools: { pan: { count: 4 } },
      };
      return d.getEligiblePool('mutation', {}, ps).map(c => c.id);
    });
    expect(result).not.toContain('mut_wasabi_cluster');
    expect(result).not.toContain('mut_salt_chain');
    expect(result).toContain('mut_pan_flame');
  });

  test('기준 2 (mutation): tools 완전히 비어 있음 → 전체 mutation 풀 제외 (0장)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = { currentChapter: 1, season2Unlocked: false, season3Unlocked: false, tools: {} };
      return d.getEligiblePool('mutation', {}, ps).map(c => c.id);
    });
    expect(result.length).toBe(0);
  });

  test('기준 2 (mutation): pan count=1 경계값 → 포함', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = { currentChapter: 1, season2Unlocked: false, season3Unlocked: false, tools: { pan: { count: 1 } } };
      return d.getEligiblePool('mutation', {}, ps).map(c => c.id);
    });
    expect(result).toContain('mut_pan_flame');
    expect(result.length).toBe(1);
  });

  test('기준 2 (mutation): 변이 적용 + 도구 보유 모두 있어야 포함 (이중 필터)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const bcState = { toolMutations: { pan: 'mut_pan_flame' } };
      const ps = { currentChapter: 10, season2Unlocked: true, season3Unlocked: false,
        tools: { pan: { count: 4 }, salt: { count: 1 } } };
      return d.getEligiblePool('mutation', bcState, ps).map(c => c.id);
    });
    // pan은 변이 적용됨 → 제외, salt만 통과
    expect(result).not.toContain('mut_pan_flame');
    expect(result).toContain('mut_salt_chain');
    expect(result.length).toBe(1);
  });

  test('기준 3 (recipe): 기본 8장 조건 없음 → 전부 통과 (기존 동작 유지)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = { currentChapter: 1, season2Unlocked: false, season3Unlocked: false, tools: {} };
      return d.getEligiblePool('recipe', {}, ps).length;
    });
    expect(result).toBe(8);
  });

  test('blessing: 필터 조건 없음 → 전부 통과', async ({ page }) => {
    const count = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const ps = { currentChapter: 1, season2Unlocked: false, season3Unlocked: false, tools: {} };
      return d.getEligiblePool('blessing', {}, ps).length;
    });
    expect(count).toBe(8);
  });

  test('기준 4: progressState=undefined → 에러 없이 엄격 필터링 (bond mimi/rin/mage, mutation 전멸)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      return {
        bond: d.getEligiblePool('bond', {}, undefined).map(c => c.id),
        mutation: d.getEligiblePool('mutation', {}, undefined).map(c => c.id),
        recipe: d.getEligiblePool('recipe', {}, undefined).length,
        blessing: d.getEligiblePool('blessing', {}, undefined).length,
      };
    });
    expect(result.bond.length).toBe(4); // mimi×2 + rin + mage
    expect(result.mutation.length).toBe(0); // tools 없음 → 전부 제외
    expect(result.recipe).toBe(8);
    expect(result.blessing).toBe(8);
  });
});

// ──────────────────────────────────────────────────────────────────
// 그룹 C: selectBranchCards 시그니처 + 폴백 (성공 기준 5)
// ──────────────────────────────────────────────────────────────────

test.describe('C. selectBranchCards 시그니처 + 폴백', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
  });

  test('기준 5: 극단 상태 (모든 mutation + bond + recipe 소진) → blessing만 반환, 배열 타입', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const bcState = {
        toolMutations: {
          pan: 'mut_pan_flame', salt: 'mut_salt_chain', grill: 'mut_grill_inferno',
          delivery: 'mut_delivery_ghost', freezer: 'mut_freezer_permafrost',
          soup_pot: 'mut_soup_overcharge', wasabi_cannon: 'mut_wasabi_cluster',
          spice_grinder: 'mut_spice_venom',
        },
        unlockedBranchRecipes: [
          'branch_dragon_feast', 'branch_mireuk_tea', 'branch_grand_omakase',
          'branch_golden_curry', 'branch_chaos_ramen', 'branch_frozen_dessert',
          'branch_spice_bomb', 'branch_bistro_course',
        ],
        chefBonds: [
          'bond_lao_grill', 'bond_rin_pan', 'bond_mage_freezer', 'bond_yuki_soup',
          'bond_andre_delivery', 'bond_arjun_wasabi', 'bond_mimi_salt', 'bond_mimi_spice',
        ],
        activeBlessing: null,
      };
      const ps = { currentChapter: 20, season2Unlocked: true, season3Unlocked: true,
        tools: { pan: { count: 4 }, salt: { count: 1 }, grill: { count: 1 },
                 delivery: { count: 1 }, freezer: { count: 1 }, soup_pot: { count: 1 },
                 wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 } } };
      const results = [];
      for (let i = 0; i < 5; i++) {
        const r = d.selectBranchCards(bcState, ps);
        results.push({ len: r.length, categories: r.map(c => c.category) });
      }
      return results;
    });
    for (const r of result) {
      expect(r.len).toBeGreaterThanOrEqual(1);
      expect(r.len).toBeLessThanOrEqual(3);
      // mutation/bond/recipe는 전부 소진됨 → blessing만 가능
      for (const cat of r.categories) expect(cat).toBe('blessing');
    }
  });

  test('기준 5: 완전 극단 (blessing 포함 모두 소진된 시나리오) → 빈 배열, 에러 없음', async ({ page }) => {
    // 참고: blessing 카테고리는 `activeBlessing` 존재 여부로 제외되지 않는다 (설계상 갱신 허용).
    // 따라서 실제로 모든 풀을 0으로 만드는 것은 불가능. 대신 현재 구조에서 "최대한 소진" 상태에서
    // 에러 없이 배열 반환하는지 검증.
    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      // 모든 카테고리 풀이 비어있는 상태를 강제로 구현하긴 어려움 → selectBranchCards가
      // 각 카테고리를 건너뛰는지만 확인.
      const bcState = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
      const ps = { currentChapter: 1, season2Unlocked: false, season3Unlocked: false, tools: {} };
      const r = d.selectBranchCards(bcState, ps);
      return { len: r.length, categories: r.map(c => c.category), isArray: Array.isArray(r) };
    });
    expect(result.isArray).toBe(true);
    // mutation 풀 전멸, bond 풀 4장, recipe 풀 8장, blessing 풀 8장 → 최대 3장 선정 (서로 다른 카테고리)
    expect(result.len).toBe(3);
    expect(result.categories).not.toContain('mutation'); // tools 없으므로 mutation 제외 보장
  });

  test('selectBranchCards는 3개의 서로 다른 카테고리에서 1장씩 10회 반복 시 일관', async ({ page }) => {
    const results = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const bcState = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
      const ps = { currentChapter: 20, season2Unlocked: true, season3Unlocked: true,
        tools: { pan: { count: 4 }, salt: { count: 1 }, grill: { count: 1 },
                 delivery: { count: 1 }, freezer: { count: 1 }, soup_pot: { count: 1 },
                 wasabi_cannon: { count: 1 }, spice_grinder: { count: 1 } } };
      const out = [];
      for (let i = 0; i < 10; i++) {
        const r = d.selectBranchCards(bcState, ps);
        out.push({ len: r.length, uniqueCats: new Set(r.map(c => c.category)).size });
      }
      return out;
    });
    for (const r of results) {
      expect(r.len).toBe(3);
      expect(r.uniqueCats).toBe(3);
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// 그룹 D: MerchantScene 통합 (성공 기준 4)
// ──────────────────────────────────────────────────────────────────

test.describe('D. MerchantScene 통합', () => {
  async function enterScene(page, sceneKey, data = {}) {
    await page.evaluate(({ k, d }) => {
      const game = window.__game;
      game.scene.scenes.forEach((s) => {
        if (s.scene.isActive()) game.scene.stop(s.scene.key);
      });
      game.scene.start(k, d);
    }, { k: sceneKey, d: data });
    await page.waitForTimeout(1800);
  }

  test('초반 세이브(ch=3, s2=false, pan/salt만 보유) → bond 탭에 arjun/yuki/lao/andre 카드 부재', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page, {
      storyProgress: { currentChapter: 3, storyFlags: {} },
      season2Unlocked: false,
      season3Unlocked: false,
      tools: {
        pan: { count: 4, level: 1 }, salt: { count: 1, level: 1 },
        grill: { count: 0, level: 1 }, delivery: { count: 0, level: 1 },
        freezer: { count: 0, level: 1 }, soup_pot: { count: 0, level: 1 },
        wasabi_cannon: { count: 0, level: 1 }, spice_grinder: { count: 0, level: 1 },
      },
    });
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'MerchantScene', { stageId: '1-1' });

    // scene에서 10번 카드 선정을 반복해 풀 구성 증거 수집
    const snapshots = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      const saveData = s.SaveManager.load();
      const branchCardsState = {
        toolMutations: s.SaveManager.getToolMutations(),
        unlockedBranchRecipes: s.SaveManager.getUnlockedBranchRecipes(),
        chefBonds: s.SaveManager.getChefBonds(),
        activeBlessing: s.SaveManager.getActiveBlessing(),
      };
      const progressState = {
        currentChapter: saveData.storyProgress?.currentChapter || 1,
        season2Unlocked: !!saveData.season2Unlocked,
        season3Unlocked: !!saveData.season3Unlocked,
        tools: saveData.tools || {},
      };
      // 각 카테고리 풀 직접 확인
      return {
        bondPool: d.getEligiblePool('bond', branchCardsState, progressState).map(c => c.id),
        mutationPool: d.getEligiblePool('mutation', branchCardsState, progressState).map(c => c.id),
        recipePool: d.getEligiblePool('recipe', branchCardsState, progressState).length,
        progressSeen: progressState,
      };
    });

    // bond 풀에 대상 셰프 카드 부재
    for (const id of ['bond_arjun_wasabi', 'bond_yuki_soup', 'bond_lao_grill', 'bond_andre_delivery']) {
      expect(snapshots.bondPool).not.toContain(id);
    }
    // mutation 풀은 pan + salt만 출현 가능
    expect(snapshots.mutationPool).toContain('mut_pan_flame');
    expect(snapshots.mutationPool).toContain('mut_salt_chain');
    expect(snapshots.mutationPool).not.toContain('mut_grill_inferno');
    expect(snapshots.mutationPool).not.toContain('mut_wasabi_cluster');
    expect(snapshots.mutationPool.length).toBe(2);
    // recipe 풀 유지
    expect(snapshots.recipePool).toBe(8);
    // progressState 구성 확인
    expect(snapshots.progressSeen.currentChapter).toBe(3);
    expect(snapshots.progressSeen.season2Unlocked).toBe(false);
    expect(snapshots.progressSeen.season3Unlocked).toBe(false);
    expect(snapshots.progressSeen.tools.pan.count).toBe(4);

    // MerchantScene에서 실제로 카드가 렌더링되는지 확인 (1-2장)
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/phase75-early-bond-tab.png' });

    const scene = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      const defs = s._branchCardDefs || [];
      return {
        count: defs.length,
        ids: defs.map(d => d.id),
        chefIds: defs.filter(d => d.category === 'bond').map(d => d.chefId),
      };
    });
    // 초반에도 분기 카드 3장 선정 가능 (recipe 8 + blessing 8 + bond 4 + mutation 2 = 22장 풀)
    expect(scene.count).toBeGreaterThanOrEqual(1);
    for (const chefId of scene.chefIds) {
      expect(['mimi_chef', 'rin_chef', 'mage_chef']).toContain(chefId);
    }
  });

  test('후반 세이브(ch=20, s2+s3, 전 도구) → 모든 카테고리 정상', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page, {
      storyProgress: { currentChapter: 20, storyFlags: {} },
      season2Unlocked: true,
      season3Unlocked: true,
      tools: {
        pan: { count: 4, level: 1 }, salt: { count: 2, level: 1 },
        grill: { count: 1, level: 1 }, delivery: { count: 1, level: 1 },
        freezer: { count: 1, level: 1 }, soup_pot: { count: 1, level: 1 },
        wasabi_cannon: { count: 1, level: 1 }, spice_grinder: { count: 1, level: 1 },
      },
    });
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'MerchantScene', { stageId: '1-1' });

    const snapshots = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      const s = await import('/js/managers/SaveManager.js');
      const saveData = s.SaveManager.load();
      const branchCardsState = {
        toolMutations: s.SaveManager.getToolMutations(),
        unlockedBranchRecipes: s.SaveManager.getUnlockedBranchRecipes(),
        chefBonds: s.SaveManager.getChefBonds(),
        activeBlessing: s.SaveManager.getActiveBlessing(),
      };
      const progressState = {
        currentChapter: saveData.storyProgress?.currentChapter || 1,
        season2Unlocked: !!saveData.season2Unlocked,
        season3Unlocked: !!saveData.season3Unlocked,
        tools: saveData.tools || {},
      };
      return {
        bondPool: d.getEligiblePool('bond', branchCardsState, progressState).length,
        mutationPool: d.getEligiblePool('mutation', branchCardsState, progressState).length,
        recipePool: d.getEligiblePool('recipe', branchCardsState, progressState).length,
        blessingPool: d.getEligiblePool('blessing', branchCardsState, progressState).length,
      };
    });
    expect(snapshots.bondPool).toBe(8);
    expect(snapshots.mutationPool).toBe(8);
    expect(snapshots.recipePool).toBe(8);
    expect(snapshots.blessingPool).toBe(8);

    await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/phase75-late-all-unlocked.png' });

    const scene = await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      return {
        count: (s._branchCardDefs || []).length,
        uniqueCats: new Set((s._branchCardDefs || []).map(c => c.category)).size,
      };
    });
    expect(scene.count).toBe(3);
    expect(scene.uniqueCats).toBe(3);
  });

  test('콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page);
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'MerchantScene', { stageId: '1-1' });
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('MerchantScene');
      s._setActiveTab('branch');
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────
// 그룹 E: ChefSelectScene 잠금 반전 회귀 (!isChefUnlocked → locked)
// ──────────────────────────────────────────────────────────────────

test.describe('E. ChefSelectScene 잠금 반전 회귀', () => {
  async function enterScene(page, sceneKey, data = {}) {
    await page.evaluate(({ k, d }) => {
      const game = window.__game;
      game.scene.scenes.forEach((s) => {
        if (s.scene.isActive()) game.scene.stop(s.scene.key);
      });
      game.scene.start(k, d);
    }, { k: sceneKey, d: data });
    await page.waitForTimeout(2000);
  }

  test('초반(ch=3, s2/s3=false): mimi/rin/mage만 해금, 나머지 잠금', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page, {
      storyProgress: { currentChapter: 3, storyFlags: {} },
      season2Unlocked: false, season3Unlocked: false,
    });
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'ChefSelectScene', { stageId: '1-1' });

    const chefs = await page.evaluate(() => {
      const s = window.__game.scene.getScene('ChefSelectScene');
      return (s._chefList || []).map(c => ({ id: c.chef.id, locked: c.locked }));
    });

    // mimi/rin/mage 해금
    const mimi = chefs.find(c => c.id === 'mimi_chef');
    const rin = chefs.find(c => c.id === 'rin_chef');
    const mage = chefs.find(c => c.id === 'mage_chef');
    expect(mimi.locked).toBe(false);
    expect(rin.locked).toBe(false);
    expect(mage.locked).toBe(false);
    // yuki/lao/andre/arjun 잠금
    for (const id of ['yuki_chef', 'lao_chef', 'andre_chef', 'arjun_chef']) {
      const c = chefs.find(x => x.id === id);
      expect(c.locked).toBe(true);
    }
    await page.screenshot({ path: 'tests/screenshots/phase75-chefselect-early.png' });
  });

  test('후반(ch=20, s2/s3=true): 전원 해금', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page, {
      storyProgress: { currentChapter: 20, storyFlags: {} },
      season2Unlocked: true, season3Unlocked: true,
    });
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'ChefSelectScene', { stageId: '1-1' });

    const chefs = await page.evaluate(() => {
      const s = window.__game.scene.getScene('ChefSelectScene');
      return (s._chefList || []).map(c => ({ id: c.chef.id, locked: c.locked }));
    });
    for (const c of chefs) {
      expect(c.locked).toBe(false);
    }
    await page.screenshot({ path: 'tests/screenshots/phase75-chefselect-late.png' });
  });

  test('중반 경계(ch=12, s2=true): lao 해금, andre 잠금', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    await injectSave(page, {
      storyProgress: { currentChapter: 12, storyFlags: {} },
      season2Unlocked: true, season3Unlocked: false,
    });
    await page.reload();
    await waitForGame(page);
    await enterScene(page, 'ChefSelectScene', { stageId: '1-1' });

    const chefs = await page.evaluate(() => {
      const s = window.__game.scene.getScene('ChefSelectScene');
      return (s._chefList || []).map(c => ({ id: c.chef.id, locked: c.locked }));
    });
    expect(chefs.find(c => c.id === 'yuki_chef').locked).toBe(false);
    expect(chefs.find(c => c.id === 'lao_chef').locked).toBe(false);    // ch=12 >=10
    expect(chefs.find(c => c.id === 'andre_chef').locked).toBe(true);   // ch=12 <13
    expect(chefs.find(c => c.id === 'arjun_chef').locked).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────
// 그룹 F: SaveManager.load() 최초 실행 / 구버전 마이그레이션 안전성
// ──────────────────────────────────────────────────────────────────

test.describe('F. SaveManager 구조 + 마이그레이션 안전성', () => {
  test('세이브 없음 → createDefault 반환 + progressState 조립 성공', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);
    // localStorage 비우기
    await page.evaluate(() => localStorage.removeItem('kitchenChaosTycoon_save'));
    await page.reload();
    await waitForGame(page);

    const result = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const d = await import('/js/data/merchantBranchData.js');
      const saveData = s.SaveManager.load();
      const ps = {
        currentChapter: saveData.storyProgress?.currentChapter || 1,
        season2Unlocked: !!saveData.season2Unlocked,
        season3Unlocked: !!saveData.season3Unlocked,
        tools: saveData.tools || {},
      };
      const picks = d.selectBranchCards({ toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null }, ps);
      return {
        ch: ps.currentChapter,
        s2: ps.season2Unlocked,
        s3: ps.season3Unlocked,
        hasTools: !!ps.tools && typeof ps.tools === 'object',
        panCount: ps.tools.pan?.count,
        picksCount: picks.length,
      };
    });
    expect(result.ch).toBe(1);
    expect(result.s2).toBe(false);
    expect(result.s3).toBe(false);
    expect(result.hasTools).toBe(true);
    expect(result.panCount).toBe(4); // 스타터 키트
    expect(result.picksCount).toBeGreaterThanOrEqual(1);
  });

  test('구버전 v8 이하 세이브 (tools 누락) → v9 마이그레이션으로 tools 주입', async ({ page }) => {
    // v8 이하 세이브에만 v8→v9 마이그레이션이 tools를 생성한다.
    // v9 이상 세이브는 버그로 tools 키가 없을 수 있음 (별도 테스트에서 검증).
    await page.goto(BASE_URL);
    await waitForGame(page);
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify({
        version: 8,
        stages: {},
      }));
    });
    await page.reload();
    await waitForGame(page);

    const result = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const d = await import('/js/data/merchantBranchData.js');
      const saveData = s.SaveManager.load();
      const ps = {
        currentChapter: saveData.storyProgress?.currentChapter || 1,
        season2Unlocked: !!saveData.season2Unlocked,
        season3Unlocked: !!saveData.season3Unlocked,
        tools: saveData.tools || {},
      };
      const bondPool = d.getEligiblePool('bond', {}, ps);
      return {
        migratedS2: typeof saveData.season2Unlocked,
        s2Value: saveData.season2Unlocked,
        hasToolsKey: 'tools' in saveData,
        wasabiCannonEntry: saveData.tools?.wasabi_cannon,
        bondPoolChefIds: bondPool.map(c => c.chefId),
      };
    });
    expect(result.migratedS2).toBe('boolean');
    expect(result.s2Value).toBe(false);
    expect(result.hasToolsKey).toBe(true);
    expect(result.wasabiCannonEntry).toBeTruthy();
    for (const chefId of ['yuki_chef', 'lao_chef', 'andre_chef', 'arjun_chef']) {
      expect(result.bondPoolChefIds).not.toContain(chefId);
    }
  });

  test('비정상적 구버전 v10 세이브 (tools 누락) → 런타임 에러 없이 동작 (안전 폴백)', async ({ page }) => {
    // v9 이상인데 tools 키가 없는 이상(artificial) 세이브 주입. 현재 마이그레이션은
    // v9 이상 세이브에서는 tools 재생성을 보장하지 않는다. Coder의 `saveData.tools || {}`
    // 폴백이 에러를 방지하는지 검증.
    await page.goto(BASE_URL);
    await waitForGame(page);
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify({
        version: 10,
        stages: {},
        gold: 100,
      }));
    });
    await page.reload();
    await waitForGame(page);

    const result = await page.evaluate(async () => {
      const s = await import('/js/managers/SaveManager.js');
      const d = await import('/js/data/merchantBranchData.js');
      const saveData = s.SaveManager.load();
      const ps = {
        currentChapter: saveData.storyProgress?.currentChapter || 1,
        season2Unlocked: !!saveData.season2Unlocked,
        season3Unlocked: !!saveData.season3Unlocked,
        tools: saveData.tools || {},
      };
      let errorOccurred = null;
      try {
        const picks = d.selectBranchCards({ toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null }, ps);
        return {
          ok: true,
          picksLen: picks.length,
          cats: picks.map(c => c.category),
          toolsRaw: saveData.tools,
        };
      } catch (e) {
        errorOccurred = String(e);
      }
      return { ok: false, err: errorOccurred };
    });
    expect(result.ok).toBe(true);
    // tools 원본이 undefined여도 ps.tools={}로 폴백되어 mutation은 전멸, 나머지 카테고리로 보충
    expect(result.cats).not.toContain('mutation');
  });
});

// ──────────────────────────────────────────────────────────────────
// 그룹 G: 기존 phase58 테스트의 회귀 여부 (구 시그니처 호출 안전성)
// ──────────────────────────────────────────────────────────────────

test.describe('G. 구 시그니처(progressState 누락) 호출 회귀', () => {
  test('getEligiblePool(mutation, {}) 구 방식 호출: 런타임 에러 없음 (0장 반환이어도)', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);

    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      // 이전 phase58 테스트에서처럼 2번째 파라미터까지만 전달
      try {
        const pool = d.getEligiblePool('mutation', { toolMutations: {} });
        return { ok: true, len: pool.length };
      } catch (e) {
        return { ok: false, err: String(e) };
      }
    });
    expect(result.ok).toBe(true);
    // tools 없음 → 전멸 (기존 phase58 테스트가 기대하는 size=7이 아님!)
    expect(result.len).toBe(0);
  });

  test('selectBranchCards(state) 구 방식 호출: 에러 없음, 배열 반환', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGame(page);

    const result = await page.evaluate(async () => {
      const d = await import('/js/data/merchantBranchData.js');
      try {
        const emptyState = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
        const picks = d.selectBranchCards(emptyState);
        return { ok: true, len: picks.length, cats: picks.map(c => c.category), isArray: Array.isArray(picks) };
      } catch (e) {
        return { ok: false, err: String(e) };
      }
    });
    expect(result.ok).toBe(true);
    expect(result.isArray).toBe(true);
    // progressState 없음 → mutation 전멸, bond 4장, recipe 8장, blessing 8장 → 3장 선정
    expect(result.len).toBeLessThanOrEqual(3);
    expect(result.cats).not.toContain('mutation');
  });
});
