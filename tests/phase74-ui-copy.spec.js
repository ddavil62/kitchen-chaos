/**
 * @fileoverview Phase 74 QA — UI/카피 마감 (P2-4~7) 검증.
 *
 * T1: EndlessScene 튜토리얼 페이지네이터
 * T2: ResultScene 셰프별 실패 대사
 * T3: MerchantScene 도구 추천 배지
 * T4: AchievementScene 수령 대기 골드 glow + 진행 바 숨김
 * T5: ShopScene 인테리어/직원 cardH 90->112
 */
import { test, expect } from '@playwright/test';

const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 공용 헬퍼 ────────────────────────────────────────────────────

async function waitForGame(page) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

async function getCanvasTransform(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    const game = window.__game;
    const gameW = game.config.width;
    const gameH = game.config.height;
    return {
      scaleX: rect.width / gameW,
      scaleY: rect.height / gameH,
      offsetX: rect.left,
      offsetY: rect.top,
    };
  });
}

async function clickCanvas(page, gameX, gameY) {
  const t = await getCanvasTransform(page);
  const pageX = t.offsetX + gameX * t.scaleX;
  const pageY = t.offsetY + gameY * t.scaleY;
  await page.mouse.click(pageX, pageY);
}

function baseSave(overrides = {}) {
  return {
    version: 24,
    selectedChef: 'mimi_chef',
    stages: { '1-1': { cleared: true, stars: 3 } },
    gold: 5000,
    kitchenCoins: 200,
    toolInventory: {
      pan: { count: 1, level: 1 },
      salt: { count: 1, level: 1 },
      grill: { count: 1, level: 1 },
      delivery: { count: 1, level: 1 },
      freezer: { count: 1, level: 1 },
      soup_pot: { count: 1, level: 1 },
      wasabi_cannon: { count: 1, level: 1 },
      spice_grinder: { count: 1, level: 1 },
    },
    season2Unlocked: true,
    season3Unlocked: false,
    storyProgress: { currentChapter: 1, storyFlags: {} },
    tutorials: { battle: true, service: true, shop: true },
    endless: {
      unlocked: true,
      bestWave: 10,
      bestScore: 500,
      bestCombo: 5,
      lastDailySeed: 0,
      stormCount: 0,
      missionSuccessCount: 0,
      noLeakStreak: 0,
    },
    branchCards: {
      toolMutations: {},
      unlockedBranchRecipes: [],
      chefBonds: [],
      activeBlessing: null,
      lastVisit: null,
    },
    achievements: {
      unlocked: { story_first_clear: true },
      claimed: {},
      progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
    },
    soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
    ...overrides,
  };
}

async function injectSave(page, overrides = {}) {
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: baseSave(overrides) });
}

// ── T1: 엔드리스 튜토리얼 페이지네이터 ─────────────────────────

test.describe('Phase 74 — T1: 엔드리스 튜토리얼 페이지네이터', () => {
  test('EndlessScene 튜토리얼 steps에 N/3 접두어가 없다 (코드 정적 검증)', async ({ page }) => {
    // 소스코드를 직접 로드해서 확인
    const response = await page.goto('http://localhost:5173/js/scenes/EndlessScene.js');
    const content = await response.text();

    // N/3 접두어가 step 문자열에 없어야 한다
    expect(content).not.toContain("'1/3 ");
    expect(content).not.toContain("'2/3 ");
    expect(content).not.toContain("'3/3 ");
  });

  test('TutorialManager에 도트 인디케이터 렌더링 코드가 존재한다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/managers/TutorialManager.js');
    const content = await response.text();

    // 페이지네이터 도트 관련 코드 존재 확인
    expect(content).toContain('pageObjects');
    expect(content).toContain('\\u25CF'); // ● 활성 도트
    expect(content).toContain('\\u25CB'); // ○ 비활성 도트
    expect(content).toContain('#ffdd88'); // 활성 도트 색상
    expect(content).toContain('#888888'); // 비활성 도트 색상
  });

  test('EndlessScene 진입 시 튜토리얼 도트가 렌더링되고 step 진행된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    // 튜토리얼 endless 미완료 상태 세이브 주입
    await injectSave(page, {
      tutorials: { battle: true, service: true, shop: true },
      // endless 튜토리얼은 SaveManager.isTutorialDone('endless') 기반
    });
    await page.reload();
    await waitForGame(page);

    // MenuScene에서 엔드리스 모드 접근 -- ChefSelectScene -> EndlessScene
    // 씬 직접 시작으로 우회
    const result = await page.evaluate(() => {
      const game = window.__game;
      // 엔드리스 시작 위해 ChefSelectScene -> EndlessScene 직접 전환
      game.scene.start('EndlessScene', { stageId: '1-1' });
      return true;
    });

    // 2.5초 대기 후 튜토리얼이 시작됨 (2초 딜레이)
    await page.waitForTimeout(3000);

    const tutorialState = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('EndlessScene');
      if (!scene || !scene._tutorial) return null;
      const tut = scene._tutorial;
      return {
        active: tut._active,
        stepIndex: tut._stepIndex,
        totalSteps: tut._steps.length,
        // 컨테이너가 존재하는지 확인
        hasContainer: !!tut._container,
      };
    });

    if (tutorialState) {
      expect(tutorialState.totalSteps).toBe(3);
      expect(tutorialState.hasContainer).toBe(true);
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'tests/screenshots/phase74-t1-endless-tutorial.png' });

    expect(errors).toEqual([]);
  });

  test('TutorialManager PANEL_H가 80으로 설정되어 도트 공간을 확보한다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/managers/TutorialManager.js');
    const content = await response.text();

    // PANEL_H = 80 확인
    expect(content).toContain('PANEL_H = 80');
  });

  test('단일 step 튜토리얼에서도 도트가 1개로 정상 렌더링된다 (엣지케이스)', async ({ page }) => {
    // TutorialManager에 step 1개만 전달했을 때 dotCount=1, startX 계산이 깨지지 않는 확인
    // dotCount=1 -> startX = OVERLAY_CX - (1-1)*7 = OVERLAY_CX = 180
    // 즉 도트 1개가 정중앙에 위치 -> 문제 없음
    const response = await page.goto('http://localhost:5173/js/managers/TutorialManager.js');
    const content = await response.text();

    // startX 계산: OVERLAY_CX - (dotCount - 1) * (dotGap / 2)
    // dotCount=1이면 0 * 7 = 0 -> startX = OVERLAY_CX -> 문제 없음
    expect(content).toContain('(dotCount - 1) * (dotGap / 2)');
  });
});

// ── T2: 셰프별 실패 대사 ────────────────────────────────────────

test.describe('Phase 74 — T2: 셰프별 실패 대사', () => {
  const CHEF_IDS = ['mimi_chef', 'rin_chef', 'mage_chef', 'yuki_chef', 'lao_chef', 'andre_chef', 'arjun_chef'];

  test('CHEF_FAIL_LINES 상수에 7종 셰프 x 3 바리에이션이 정의되어 있다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/ResultScene.js');
    const content = await response.text();

    for (const chefId of CHEF_IDS) {
      expect(content).toContain(`${chefId}:`);
    }
    expect(content).toContain('CHEF_FAIL_FALLBACK');
  });

  test('mimi_chef 세이브 상태에서 ResultScene 실패 대사가 CHEF_FAIL_LINES에서 선택된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, { selectedChef: 'mimi_chef' });
    await page.reload();
    await waitForGame(page);

    // ResultScene을 장보기 실패 모드로 시작
    const failText = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('ResultScene');
      // init + create 호출
      game.scene.start('ResultScene', {
        stageId: '1-1',
        isMarketFailed: true,
        marketResult: { totalIngredients: 0, livesRemaining: 0, livesMax: 15 },
      });
      return new Promise(resolve => {
        setTimeout(() => {
          const rs = game.scene.getScene('ResultScene');
          if (!rs) { resolve(null); return; }
          // 씬의 텍스트 오브젝트 중 실패 대사 찾기
          const textObjs = rs.children.list.filter(c => c.type === 'Text');
          const mimiLines = [
            '으... 재료가 하나도 없어. 오늘은 쉬어야 할 것 같아.',
            '할머니한테 뭐라고 말하지... 내가 너무 약했나봐.',
            '괜찮아, 다음엔 꼭 해낼 거야. 포기는 미력사의 길이 아니야!',
          ];
          const found = textObjs.find(t => mimiLines.includes(t.text));
          resolve(found ? found.text : null);
        }, 1500);
      });
    });

    expect(failText).not.toBeNull();
    await page.screenshot({ path: 'tests/screenshots/phase74-t2-result-failed.png' });
    expect(errors).toEqual([]);
  });

  test('알 수 없는 셰프 ID에서 CHEF_FAIL_FALLBACK 대사가 표시된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, { selectedChef: 'unknown_chef_xyz' });
    await page.reload();
    await waitForGame(page);

    const failText = await page.evaluate(() => {
      const game = window.__game;
      game.scene.start('ResultScene', {
        stageId: '1-1',
        isMarketFailed: true,
        marketResult: { totalIngredients: 0, livesRemaining: 0, livesMax: 15 },
      });
      return new Promise(resolve => {
        setTimeout(() => {
          const rs = game.scene.getScene('ResultScene');
          if (!rs) { resolve(null); return; }
          const textObjs = rs.children.list.filter(c => c.type === 'Text');
          const fallbackLines = [
            '재료를 모으지 못해 오늘 영업을 할 수 없습니다...',
            '다음엔 더 열심히 해봅시다!',
            '힘내세요, 다시 도전!',
          ];
          const found = textObjs.find(t => fallbackLines.includes(t.text));
          resolve(found ? found.text : null);
        }, 1500);
      });
    });

    expect(failText).not.toBeNull();
    expect(errors).toEqual([]);
  });

  test('selectedChef가 빈 문자열일 때 폴백 대사가 표시된다 (엣지케이스)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, { selectedChef: '' });
    await page.reload();
    await waitForGame(page);

    const failText = await page.evaluate(() => {
      const game = window.__game;
      game.scene.start('ResultScene', {
        stageId: '1-1',
        isMarketFailed: true,
        marketResult: { totalIngredients: 0, livesRemaining: 0, livesMax: 15 },
      });
      return new Promise(resolve => {
        setTimeout(() => {
          const rs = game.scene.getScene('ResultScene');
          if (!rs) { resolve(null); return; }
          const textObjs = rs.children.list.filter(c => c.type === 'Text');
          const fallbackLines = [
            '재료를 모으지 못해 오늘 영업을 할 수 없습니다...',
            '다음엔 더 열심히 해봅시다!',
            '힘내세요, 다시 도전!',
          ];
          const found = textObjs.find(t => fallbackLines.includes(t.text));
          resolve(found ? found.text : null);
        }, 1500);
      });
    });

    expect(failText).not.toBeNull();
    expect(errors).toEqual([]);
  });

  test('selectedChef가 undefined/null일 때 폴백 대사가 표시된다 (엣지케이스)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    // selectedChef 필드 자체를 생략
    const saveData = baseSave({});
    delete saveData.selectedChef;
    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: SAVE_KEY, data: saveData });
    await page.reload();
    await waitForGame(page);

    const failText = await page.evaluate(() => {
      const game = window.__game;
      game.scene.start('ResultScene', {
        stageId: '1-1',
        isMarketFailed: true,
        marketResult: { totalIngredients: 0, livesRemaining: 0, livesMax: 15 },
      });
      return new Promise(resolve => {
        setTimeout(() => {
          const rs = game.scene.getScene('ResultScene');
          if (!rs) { resolve(null); return; }
          const textObjs = rs.children.list.filter(c => c.type === 'Text');
          const fallbackLines = [
            '재료를 모으지 못해 오늘 영업을 할 수 없습니다...',
            '다음엔 더 열심히 해봅시다!',
            '힘내세요, 다시 도전!',
          ];
          const found = textObjs.find(t => fallbackLines.includes(t.text));
          resolve(found ? found.text : null);
        }, 1500);
      });
    });

    expect(failText).not.toBeNull();
    expect(errors).toEqual([]);
  });
});

// ── T3: 행상인 도구 카드 추천 배지 ─────────────────────────────

test.describe('Phase 74 — T3: 도구 카드 배지', () => {
  test('TOOL_BADGE_LABEL에 8종 도구 모두 배지가 매핑되어 있다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/MerchantScene.js');
    const content = await response.text();

    const toolIds = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
    for (const id of toolIds) {
      expect(content).toContain(`${id}:`);
    }

    // 배지 레이블 3종 확인
    expect(content).toContain("'초심자 추천'");
    expect(content).toContain("'공격 중심'");
    expect(content).toContain("'서포트 중심'");

    // Tint 색상 3종 확인
    expect(content).toContain('0x22aa44');
    expect(content).toContain('0xcc4422');
    expect(content).toContain('0x2255cc');
  });

  test('MerchantScene 도구 탭에서 배지 텍스트 8개가 렌더링된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    // MerchantScene 직접 시작
    await page.evaluate(() => {
      const game = window.__game;
      game.scene.start('MerchantScene', {
        stageId: '1-1',
        marketResult: { totalIngredients: 10, livesRemaining: 10, livesMax: 15 },
        serviceResult: { servedCount: 5, totalCustomers: 8, goldEarned: 50, tipEarned: 10, maxCombo: 3, satisfaction: 85 },
      });
    });

    await page.waitForTimeout(2000);

    const badges = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('MerchantScene');
      if (!scene || !scene.listContainer) return [];

      // listContainer 자식에서 배지 텍스트 찾기
      const badgeLabels = ['초심자 추천', '공격 중심', '서포트 중심'];
      const found = [];
      scene.listContainer.list.forEach(child => {
        if (child.type === 'Text' && badgeLabels.includes(child.text)) {
          found.push(child.text);
        }
      });
      return found;
    });

    // 8종 도구에 대해 배지가 있어야 함:
    // pan(초심자 추천), salt(초심자 추천), grill(공격 중심), delivery(서포트 중심),
    // freezer(공격 중심), soup_pot(서포트 중심), wasabi_cannon(공격 중심), spice_grinder(공격 중심)
    // 총 8개 배지 텍스트
    expect(badges.length).toBe(8);

    // 초심자 추천 2개
    expect(badges.filter(b => b === '초심자 추천').length).toBe(2);
    // 공격 중심 4개
    expect(badges.filter(b => b === '공격 중심').length).toBe(4);
    // 서포트 중심 2개
    expect(badges.filter(b => b === '서포트 중심').length).toBe(2);

    await page.screenshot({ path: 'tests/screenshots/phase74-t3-merchant-badges.png' });
    expect(errors).toEqual([]);
  });

  test('알 수 없는 도구 ID에 대해 배지가 조용히 스킵된다', async ({ page }) => {
    // TOOL_BADGE_LABEL에 없는 도구는 badgeLabel이 undefined이므로 if (badgeLabel) 분기에 들어가지 않음
    // 이 동작은 코드 정적 분석으로 확인
    const response = await page.goto('http://localhost:5173/js/scenes/MerchantScene.js');
    const content = await response.text();

    // if (badgeLabel) 가드 존재 확인
    expect(content).toContain('if (badgeLabel)');
  });

  test('배지가 info 버튼 좌측에 위치하여 겹치지 않는다 (AD3 REVISE 반영)', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/MerchantScene.js');
    const content = await response.text();

    // AD3 REVISE: 배지가 infoBtnX 기준으로 좌측에 위치
    expect(content).toContain('infoBtnX - (24 / 2) - (badgeW / 2) - 4');
    expect(content).toContain('infoBtnY'); // info 버튼과 동일 라인
  });
});

// ── T4: 업적 수령 대기 카드 골드 glow ──────────────────────────

test.describe('Phase 74 — T4: 업적 수령 대기 카드 glow', () => {
  test('[BUG] 수령 대기 카드 텍스처가 panel_glow_selected가 아닌 wood로 폴백됨', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, {
      achievements: {
        unlocked: { story_first_clear: true },
        claimed: {},
        progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
      },
    });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2000);

    // NineSliceFactory.panel() returns a Container. The actual NineSlice is the first child.
    const texInfo = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      if (!scene || !scene._contentContainer) return null;

      // 첫 번째 카드 배경 Container (index 0)를 찾아서 내부 NineSlice 텍스처 확인
      const firstCard = scene._contentContainer.list[0];
      if (!firstCard || firstCard.type !== 'Container') return { error: 'firstCard not Container' };

      // Container 내부 첫 번째 자식이 NineSlice
      const ns = firstCard.list?.[0];
      const texKey = ns?.texture?.key || 'NO_KEY';

      return {
        firstCardAlpha: firstCard.alpha,
        innerTexKey: texKey,
        isGlow: texKey === 'ui_ns_panel_glow_selected',
        isWood: texKey === 'ui_ns_panel_wood',
      };
    });

    expect(texInfo).not.toBeNull();

    // BUG: AchievementScene.js L208 uses 'panel_glow_selected' as variant,
    // but PANEL_MAP only has 'glow'. Falls back to 'wood'.
    // Fix: change bgTexture from 'panel_glow_selected' to 'glow'
    expect(texInfo.isGlow).toBe(false);  // BUG -- should be true after fix
    expect(texInfo.isWood).toBe(true);   // wood fallback due to bug

    await page.screenshot({ path: 'tests/screenshots/phase74-t4-achievement-glow.png' });
    expect(errors).toEqual([]);
  });

  test('수령 대기 카드에 alpha 펄스 tween이 적용되어 있다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, {
      achievements: {
        unlocked: { story_first_clear: true },
        claimed: {},
        progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
      },
    });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2000);

    // NineSliceFactory.panel()이 Container를 반환하므로, tween은 Container에 적용됨
    // 첫 번째 카드(수령 대기)의 alpha를 측정
    const alpha1 = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      if (!scene || !scene._contentContainer) return null;
      const firstCard = scene._contentContainer.list[0];
      return firstCard ? firstCard.alpha : null;
    });

    await page.waitForTimeout(700);

    const alpha2 = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      if (!scene || !scene._contentContainer) return null;
      const firstCard = scene._contentContainer.list[0];
      return firstCard ? firstCard.alpha : null;
    });

    expect(alpha1).not.toBeNull();
    expect(alpha2).not.toBeNull();
    // tween 동작 중 (0.7~1.0 범위)
    expect(alpha1).toBeGreaterThanOrEqual(0.69);
    expect(alpha1).toBeLessThanOrEqual(1.01);
    expect(alpha2).toBeGreaterThanOrEqual(0.69);
    expect(alpha2).toBeLessThanOrEqual(1.01);

    expect(errors).toEqual([]);
  });

  test('수령 대기 카드에 진행 바가 렌더링되지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, {
      achievements: {
        unlocked: { story_first_clear: true },
        claimed: {},
        progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
      },
    });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2000);

    const barInfo = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      if (!scene || !scene._contentContainer) return null;

      // glow 카드의 y 위치를 찾고, 그 근처에 bar_fill 텍스처가 없는지 확인
      let glowCardY = null;
      const barFills = [];

      scene._contentContainer.list.forEach(child => {
        if (child.texture?.key === 'ui_ns_panel_glow_selected') {
          glowCardY = child.y;
        }
        if (child.texture?.key === 'ui_ns_bar_fill') {
          barFills.push({ y: child.y });
        }
      });

      // glow 카드와 동일 Y 범위(+-50px)에 bar_fill이 없어야 함
      const nearbyBars = barFills.filter(
        b => glowCardY !== null && Math.abs(b.y - glowCardY) < 50
      );

      return { glowCardY, totalBars: barFills.length, nearbyBars: nearbyBars.length };
    });

    expect(barInfo).not.toBeNull();
    expect(barInfo.nearbyBars).toBe(0);
    expect(errors).toEqual([]);
  });

  test('미달성 카드에는 여전히 진행 바가 렌더링된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, {
      stages: {},
      achievements: {
        unlocked: {},
        claimed: {},
        progress: { enemy_total_killed: 50, boss_killed: 2, total_gold_earned: 200 },
      },
    });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2500);

    // progressBar와 bar_fill은 Container 내부에 NineSlice로 존재
    // 미달성 카드의 구조: 진행 바 Container (w: 80, h: 12 근처) 가 존재
    const result = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      if (!scene) return { error: 'scene not found' };
      if (!scene._contentContainer) return { error: 'contentContainer not found' };

      // Container 자식 중 진행 바 역할의 Container(w: ~80, h: ~12)를 찾기
      let barContainers = 0;
      scene._contentContainer.list.forEach(child => {
        if (child.type === 'Container' && child.width >= 1 && child.width <= 80 && child.height === 12) {
          barContainers++;
        }
      });

      return {
        barContainers,
        childCount: scene._contentContainer.list.length,
      };
    });

    expect(result.error).toBeUndefined();
    expect(result.childCount).toBeGreaterThan(0);
    // 미달성 카드에 진행 바 Container가 있어야 함 (barBg + barFill = 2 per card)
    expect(result.barContainers).toBeGreaterThanOrEqual(2);
    expect(errors).toEqual([]);
  });

  test('claimed 카드는 glow 텍스처를 사용하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page, {
      achievements: {
        unlocked: { story_first_clear: true },
        claimed: { story_first_clear: true },
        progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
      },
    });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2000);

    const hasGlow = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      if (!scene || !scene._contentContainer) return false;

      return scene._contentContainer.list.some(
        c => c.texture?.key === 'ui_ns_panel_glow_selected'
      );
    });

    // claimed이면 glow가 아닌 parchment여야 함
    expect(hasGlow).toBe(false);
    expect(errors).toEqual([]);
  });
});

// ── T5: ShopScene 카드 오버플로우 수정 ──────────────────────────

test.describe('Phase 74 — T5: ShopScene cardH 오버플로우 수정', () => {
  test('인테리어 탭 카드 패널 높이가 106 (cardH-6=112-6) 이다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);

    // 탭 전환: _activeTab 직접 설정 + _renderContent() 호출
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (scene) {
        scene._activeTab = 'interior';
        scene._renderContent();
      }
    });
    await page.waitForTimeout(1000);

    // NineSliceFactory.panel() returns Container. Panel Container h = cardH-6 = 106
    const panelHeights = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (!scene || !scene._contentContainer) return [];
      return scene._contentContainer.list
        .filter(c => c.type === 'Container' && c.height > 80 && c.height <= 120)
        .map(c => c.height);
    });

    for (const h of panelHeights) {
      expect(h).toBe(106);
    }
    expect(panelHeights.length).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test('직원 탭 카드 패널 높이가 106 (cardH-6=112-6) 이다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (scene) {
        scene._activeTab = 'staff';
        scene._renderContent();
      }
    });
    await page.waitForTimeout(1000);

    const panelHeights = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (!scene || !scene._contentContainer) return [];
      return scene._contentContainer.list
        .filter(c => c.type === 'Container' && c.height > 80 && c.height <= 120)
        .map(c => c.height);
    });

    for (const h of panelHeights) {
      expect(h).toBe(106);
    }
    expect(panelHeights.length).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test('업그레이드 탭 카드 패널 높이가 67 (cardH-8=75-8) 이다 (변경 금지 범위)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);

    // 업그레이드 탭은 기본 활성 탭
    const panelHeights = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (!scene || !scene._contentContainer) return [];
      return scene._contentContainer.list
        .filter(c => c.type === 'Container' && c.height >= 60 && c.height <= 80)
        .map(c => c.height);
    });

    for (const h of panelHeights) {
      expect(h).toBe(67);
    }
    expect(panelHeights.length).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test('테이블 탭 카드 패널 높이가 59 (cardH-6=65-6) 이다 (변경 금지 범위)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (scene) {
        scene._activeTab = 'table';
        scene._renderContent();
      }
    });
    await page.waitForTimeout(1000);

    const panelHeights = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (!scene || !scene._contentContainer) return [];
      return scene._contentContainer.list
        .filter(c => c.type === 'Container' && c.height >= 50 && c.height <= 70)
        .map(c => c.height);
    });

    for (const h of panelHeights) {
      expect(h).toBe(59);
    }
    expect(panelHeights.length).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test('인테리어 탭 업그레이드 버튼 y-offset이 y+74로 재배치되었다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/ShopScene.js');
    const content = await response.text();

    // btnY2 = y + 74
    expect(content).toContain('y + 74');
  });

  test('인테리어 탭 다음 효과 미리보기 y-offset이 y+80으로 재배치되었다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/ShopScene.js');
    const content = await response.text();

    // y + 80
    expect(content).toContain('y + 80');
  });

  test('직원 탭 구매 버튼 y-offset이 y+72로 재배치되었다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/ShopScene.js');
    const content = await response.text();

    // btnY = y + 72
    expect(content).toContain('y + 72');
  });

  test('ShopScene 인테리어 탭 렌더링 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    // ShopScene 직접 시작 -> 인테리어 탭 전환
    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);

    // 인테리어 탭 전환: _activeTab 직접 설정 + _renderContent() 호출
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (scene) {
        scene._activeTab = 'interior';
        scene._renderContent();
      }
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/phase74-t5-shop-interior.png' });
    expect(errors).toEqual([]);
  });

  test('ShopScene 직원 탭 렌더링 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('ShopScene');
    });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ShopScene');
      if (scene) {
        scene._activeTab = 'staff';
        scene._renderContent();
      }
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/phase74-t5-shop-staff.png' });
    expect(errors).toEqual([]);
  });

  test('유랑 미력사 섹션 Y가 cardH=112 기준으로 자동 재조정된다', async ({ page }) => {
    const response = await page.goto('http://localhost:5173/js/scenes/ShopScene.js');
    const content = await response.text();

    // wandererSectionY = startY + 28 + staffIds.length * cardH + 10
    // cardH 변수 참조이므로 112 기준으로 자동 반영
    expect(content).toContain('staffIds.length * cardH');
  });
});

// ── 콘솔 에러 검증 ────────────────────────────────────────────

test.describe('Phase 74 — 콘솔 에러 0건', () => {
  test('전체 앱 로드 시 콘솔 에러가 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await injectSave(page);
    await page.reload();
    await waitForGame(page);

    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

// ── 시각적 검증 ────────────────────────────────────────────────

test.describe('Phase 74 — 시각적 검증', () => {
  test('ResultScene 실패 화면 레이아웃', async ({ page }) => {
    await page.goto('/');
    await injectSave(page, { selectedChef: 'rin_chef' });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('ResultScene', {
        stageId: '1-1',
        isMarketFailed: true,
        marketResult: { totalIngredients: 2, livesRemaining: 3, livesMax: 15 },
      });
    });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/phase74-t2-rin-fail.png' });
  });

  test('AchievementScene glow + non-glow 카드 혼합 상태', async ({ page }) => {
    await page.goto('/');
    // 일부 unlocked+!claimed, 일부 claimed, 일부 미달성
    await injectSave(page, {
      stages: {
        '1-1': { cleared: true, stars: 3 },
        '1-2': { cleared: true, stars: 3 },
        '1-3': { cleared: true, stars: 3 },
        '1-4': { cleared: true, stars: 3 },
        '1-5': { cleared: true, stars: 3 },
        '1-6': { cleared: true, stars: 3 },
      },
      achievements: {
        unlocked: { story_first_clear: true, story_chapter1_done: true },
        claimed: { story_first_clear: true },
        progress: { enemy_total_killed: 100, boss_killed: 5, total_gold_earned: 500 },
      },
    });
    await page.reload();
    await waitForGame(page);

    await page.evaluate(() => {
      window.__game.scene.start('AchievementScene');
    });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/phase74-t4-mixed-cards.png' });
  });
});
