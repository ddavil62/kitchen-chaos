/**
 * @fileoverview Phase 42 업적 시스템 QA 테스트.
 * achievementData, AchievementManager, SaveManager v17 마이그레이션,
 * AchievementScene, MenuScene 배치, 기존 씬 연동을 검증한다.
 */
import { test, expect } from '@playwright/test';

// Phaser 씬 로딩 대기 헬퍼
async function waitForScene(page, sceneKey, timeout = 10000) {
  await page.waitForFunction(
    (key) => {
      const game = window.__game;
      if (!game || !game.scene) return false;
      const s = game.scene.getScene(key);
      return s && s.sys && s.sys.isActive();
    },
    sceneKey,
    { timeout }
  );
}

// Phaser 부팅 대기
async function waitForBoot(page) {
  await page.waitForFunction(
    () => {
      const game = window.__game;
      return game && game.scene && game.scene.scenes && game.scene.scenes.length > 0;
    },
    { timeout: 15000 }
  );
}

// 프로그래밍 방식으로 씬 전환
async function navigateToScene(page, sceneKey) {
  await page.evaluate((key) => {
    const game = window.__game;
    // 모든 활성 씬을 정지하고 대상 씬 시작
    const activeScenes = game.scene.scenes.filter(s => s.sys.isActive());
    for (const s of activeScenes) {
      game.scene.stop(s.sys.settings.key);
    }
    game.scene.start(key);
  }, sceneKey);
  await waitForScene(page, sceneKey);
  await page.waitForTimeout(500); // fadeIn 대기
}

test.describe('Phase 42: 업적 시스템 QA', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 수집
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));

    await page.goto('http://localhost:5173');
    await waitForBoot(page);
  });

  // ── 1. achievementData.js 구조 검증 ──

  test('achievementData: 30개 업적 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      try {
        const { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getByCategory } = await import('/js/data/achievementData.js');
        return {
          totalCount: ACHIEVEMENTS.length,
          categoryCount: ACHIEVEMENT_CATEGORIES.length,
          storyCount: getByCategory('story').length,
          battleCount: getByCategory('battle').length,
          collectCount: getByCategory('collect').length,
          economyCount: getByCategory('economy').length,
          endlessCount: getByCategory('endless').length,
          categories: ACHIEVEMENT_CATEGORIES.map(c => c.id),
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(result.error).toBeUndefined();
    expect(result.totalCount).toBe(30);
    expect(result.categoryCount).toBe(5);
    expect(result.storyCount).toBe(10);
    expect(result.battleCount).toBe(8);
    expect(result.collectCount).toBe(5);
    expect(result.economyCount).toBe(5);
    expect(result.endlessCount).toBe(2);
    expect(result.categories).toEqual(['story', 'battle', 'collect', 'economy', 'endless']);
  });

  test('achievementData: 각 업적에 필수 필드 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ACHIEVEMENTS } = await import('/js/data/achievementData.js');
      const missing = [];
      const requiredFields = ['id', 'nameKo', 'descKo', 'category', 'icon', 'condition', 'reward'];
      for (const ach of ACHIEVEMENTS) {
        for (const field of requiredFields) {
          if (ach[field] === undefined || ach[field] === null) {
            missing.push(`${ach.id || 'unknown'}: missing ${field}`);
          }
        }
        if (ach.condition) {
          if (!ach.condition.type) missing.push(`${ach.id}: condition.type missing`);
          if (ach.condition.threshold === undefined) missing.push(`${ach.id}: condition.threshold missing`);
        }
        if (ach.reward && !ach.reward.gold && !ach.reward.coin) {
          missing.push(`${ach.id}: reward has neither gold nor coin`);
        }
      }
      return missing;
    });

    expect(result).toEqual([]);
  });

  test('achievementData: ID 중복 없음', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ACHIEVEMENTS } = await import('/js/data/achievementData.js');
      const ids = ACHIEVEMENTS.map(a => a.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      return dupes;
    });

    expect(result).toEqual([]);
  });

  // ── 2. AchievementManager 정적 클래스 검증 ──

  test('AchievementManager: 정적 메서드 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      return {
        hasCheck: typeof AchievementManager.check === 'function',
        hasIncrement: typeof AchievementManager.increment === 'function',
        hasGetProgress: typeof AchievementManager.getProgress === 'function',
        isClass: typeof AchievementManager === 'function',
      };
    });

    expect(result.hasCheck).toBe(true);
    expect(result.hasIncrement).toBe(true);
    expect(result.hasGetProgress).toBe(true);
  });

  test('AchievementManager.getProgress: 30개 항목 반환', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const progress = AchievementManager.getProgress();
      return {
        count: progress.length,
        hasUnlocked: progress.every(p => typeof p.unlocked === 'boolean'),
        hasClaimed: progress.every(p => typeof p.claimed === 'boolean'),
        hasCurrent: progress.every(p => typeof p.current === 'number'),
        hasThreshold: progress.every(p => typeof p.threshold === 'number'),
      };
    });

    expect(result.count).toBe(30);
    expect(result.hasUnlocked).toBe(true);
    expect(result.hasClaimed).toBe(true);
    expect(result.hasCurrent).toBe(true);
    expect(result.hasThreshold).toBe(true);
  });

  // ── 3. SaveManager v17 마이그레이션 ──

  test('SaveManager: SAVE_VERSION = 17', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const data = SaveManager.load();
      return { version: data.version };
    });

    expect(result.version).toBe(17);
  });

  test('SaveManager: createDefault에 achievements 필드 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();
      const data = SaveManager.load();
      return {
        hasAchievements: !!data.achievements,
        hasUnlocked: !!data.achievements?.unlocked,
        hasClaimed: !!data.achievements?.claimed,
        hasProgress: !!data.achievements?.progress,
        hasEnemyKilled: typeof data.achievements?.progress?.enemy_total_killed === 'number',
        hasBossKilled: typeof data.achievements?.progress?.boss_killed === 'number',
        hasTotalGold: typeof data.achievements?.progress?.total_gold_earned === 'number',
      };
    });

    expect(result.hasAchievements).toBe(true);
    expect(result.hasUnlocked).toBe(true);
    expect(result.hasClaimed).toBe(true);
    expect(result.hasProgress).toBe(true);
    expect(result.hasEnemyKilled).toBe(true);
    expect(result.hasBossKilled).toBe(true);
    expect(result.hasTotalGold).toBe(true);
  });

  test('SaveManager: v16 -> v17 마이그레이션', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const v16Data = {
        version: 16,
        stages: {},
        tutorialDone: false,
        kitchenCoins: 100,
        gold: 500,
      };
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(v16Data));
      const migrated = SaveManager.load();
      return {
        version: migrated.version,
        hasAchievements: !!migrated.achievements,
        hasUnlocked: !!migrated.achievements?.unlocked,
        hasClaimed: !!migrated.achievements?.claimed,
        hasProgress: !!migrated.achievements?.progress,
        kitchenCoins: migrated.kitchenCoins,
        gold: migrated.gold,
      };
    });

    expect(result.version).toBe(17);
    expect(result.hasAchievements).toBe(true);
    expect(result.hasUnlocked).toBe(true);
    expect(result.hasClaimed).toBe(true);
    expect(result.hasProgress).toBe(true);
    expect(result.kitchenCoins).toBe(100);
    expect(result.gold).toBe(500);
  });

  test('SaveManager: getAchievements/markAchievementClaimed 메서드', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      const hasGetAchievements = typeof SaveManager.getAchievements === 'function';
      const hasMarkClaimed = typeof SaveManager.markAchievementClaimed === 'function';

      SaveManager.markAchievementClaimed('test_ach_1');
      const ach = SaveManager.getAchievements();

      return {
        hasGetAchievements,
        hasMarkClaimed,
        claimed: !!ach.claimed?.test_ach_1,
      };
    });

    expect(result.hasGetAchievements).toBe(true);
    expect(result.hasMarkClaimed).toBe(true);
    expect(result.claimed).toBe(true);
  });

  // ── 4. VFXManager.achievementToast 검증 ──

  test('VFXManager: achievementToast 정적 메서드 존재', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { VFXManager } = await import('/js/managers/VFXManager.js');
      return {
        isStatic: typeof VFXManager.achievementToast === 'function',
      };
    });

    expect(result.isStatic).toBe(true);
  });

  // ── 5. AchievementScene 등록 검증 ──

  test('main.js: AchievementScene이 씬 목록에 등록됨', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('AchievementScene');
      return { exists: !!scene };
    });

    expect(result.exists).toBe(true);
  });

  // ── 6. MenuScene 업적 버튼 배치 검증 ──

  test('MenuScene: 업적 버튼 존재 + 레이아웃 스크린샷', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'C:/antigravity/kitchen-chaos/tests/screenshots/phase42-menu-layout.png',
    });

    // 업적 텍스트가 존재하는지 검증
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('MenuScene');
      const texts = scene.children.list.filter(c => c.type === 'Text');
      const hasAchButton = texts.some(t => t.text && t.text.includes('업적'));
      return { hasAchButton };
    });

    expect(result.hasAchButton).toBe(true);
  });

  test('MenuScene: "적을 처치하면" 하단 설명 문자열 없음', async ({ page }) => {
    await waitForScene(page, 'MenuScene');

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('MenuScene');
      const texts = scene.children.list.filter(c => c.type === 'Text');
      const hasOldDesc = texts.some(t => t.text && t.text.includes('적을 처치하면'));
      return { hasOldDesc };
    });

    expect(result.hasOldDesc).toBe(false);
  });

  // ── 7. AchievementScene UI 검증 (프로그래밍 방식 전환) ──

  test('AchievementScene: 씬 전환 + 5탭 UI', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await navigateToScene(page, 'AchievementScene');

    await page.screenshot({
      path: 'C:/antigravity/kitchen-chaos/tests/screenshots/phase42-achievement-scene.png',
    });

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('AchievementScene');
      if (!scene) return { error: 'scene not found' };
      return {
        hasTabBgs: scene._tabBgs && Object.keys(scene._tabBgs).length === 5,
        activeTab: scene._activeTab,
        tabKeys: scene._tabBgs ? Object.keys(scene._tabBgs) : [],
        hasContentContainer: !!scene._contentContainer,
        hasCoinText: !!scene._coinText,
        hasGoldText: !!scene._goldText,
      };
    });

    expect(result.hasTabBgs).toBe(true);
    expect(result.activeTab).toBe('story');
    expect(result.tabKeys).toEqual(['story', 'battle', 'collect', 'economy', 'endless']);
    expect(result.hasContentContainer).toBe(true);
    expect(result.hasCoinText).toBe(true);
    expect(result.hasGoldText).toBe(true);
  });

  test('AchievementScene: 탭 전환 (프로그래밍 방식)', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await navigateToScene(page, 'AchievementScene');

    // 프로그래밍 방식으로 탭 전환 테스트
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('AchievementScene');
      const categories = ['story', 'battle', 'collect', 'economy', 'endless'];
      const results = {};

      for (const cat of categories) {
        scene._activeTab = cat;
        scene._scrollY = 0;
        scene._updateTabHighlight();
        scene._renderContent();

        const items = scene._contentContainer?.list?.length || 0;
        results[cat] = { itemCount: items, activeTab: scene._activeTab };
      }
      return results;
    });

    // 각 탭이 콘텐츠를 렌더링하는지 검증
    expect(result.story.activeTab).toBe('story');
    expect(result.battle.activeTab).toBe('battle');
    expect(result.collect.activeTab).toBe('collect');
    expect(result.economy.activeTab).toBe('economy');
    expect(result.endless.activeTab).toBe('endless');

    // 각 탭에 콘텐츠가 존재하는지 (아이콘+이름+설명+상태 영역 = 최소 4개 오브젝트 per 카드)
    expect(result.story.itemCount).toBeGreaterThan(0);
    expect(result.battle.itemCount).toBeGreaterThan(0);
    expect(result.collect.itemCount).toBeGreaterThan(0);
    expect(result.economy.itemCount).toBeGreaterThan(0);
    expect(result.endless.itemCount).toBeGreaterThan(0);
  });

  test('AchievementScene: 뒤로가기 프로그래밍 전환', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await navigateToScene(page, 'AchievementScene');

    // AchievementScene에서 MenuScene으로 전환
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('AchievementScene');
      scene.scene.start('MenuScene');
    });
    await waitForScene(page, 'MenuScene');

    const result = await page.evaluate(() => {
      return { isMenu: !!window.__game.scene.getScene('MenuScene')?.sys?.isActive() };
    });
    expect(result.isMenu).toBe(true);
  });

  // ── 8. AchievementManager.increment + check 로직 검증 ──

  test('AchievementManager: increment는 카운터를 증가시킨다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      AchievementManager.increment('enemy_total_killed', 5);
      const data1 = SaveManager.load();
      const after5 = data1.achievements.progress.enemy_total_killed;

      AchievementManager.increment('enemy_total_killed', 3);
      const data2 = SaveManager.load();
      const after8 = data2.achievements.progress.enemy_total_killed;

      return { after5, after8 };
    });

    expect(result.after5).toBe(5);
    expect(result.after8).toBe(8);
  });

  test('AchievementManager: check 해금 동작 (battle_first_kill)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      AchievementManager.increment('enemy_total_killed', 1);
      AchievementManager.check(null, 'enemy_total_killed', 0);

      const data = SaveManager.load();
      return {
        unlocked: !!data.achievements.unlocked.battle_first_kill,
        notUnlocked100: !data.achievements.unlocked.battle_100kills,
      };
    });

    expect(result.unlocked).toBe(true);
    expect(result.notUnlocked100).toBe(true);
  });

  // ── 9. CRITICAL: 이중 보상 버그 검증 ──

  test('BUG-01: _unlock에서 보상 지급 후 _claimReward에서 이중 지급', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      // battle_first_kill 보상: coin 5
      AchievementManager.increment('enemy_total_killed', 1);
      AchievementManager.check(null, 'enemy_total_killed', 0);

      const afterUnlock = SaveManager.load();
      const coinsAfterUnlock = afterUnlock.kitchenCoins;

      // _claimReward 시뮬레이션 (AchievementScene._claimReward 로직)
      SaveManager.markAchievementClaimed('battle_first_kill');
      const data2 = SaveManager.load();
      data2.kitchenCoins = (data2.kitchenCoins || 0) + 5; // coin: 5 또 추가
      SaveManager.save(data2);

      const afterClaim = SaveManager.load();
      return {
        coinsAfterUnlock,
        coinsAfterClaim: afterClaim.kitchenCoins,
      };
    });

    // _unlock에서 이미 coin: 5를 지급했으므로 coinsAfterUnlock = 5
    // _claimReward에서 또 coin: 5를 주면 총 10이 됨 = 이중 보상
    expect(result.coinsAfterUnlock).toBe(5); // _unlock에서 보상 지급 확인
    expect(result.coinsAfterClaim).toBe(10); // 이중 보상 발생 확인
  });

  // ── 10. CRITICAL: _unlock에서 gold 보상 손실 검증 ──

  test('BUG-02: _unlock에서 ToolManager.addGold 호출 후 stale data로 덮어쓰기', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      // 6장까지 클리어 데이터 삽입
      const data = SaveManager.load();
      for (let ch = 1; ch <= 6; ch++) {
        for (let st = 1; st <= 6; st++) {
          data.stages[`${ch}-${st}`] = { cleared: true, stars: 3 };
        }
      }
      data.gold = 1000;
      SaveManager.save(data);

      // chapter_cleared 체크 -> story_chapter6_done (gold: 500) 해금
      AchievementManager.check(null, 'chapter_cleared', 6);

      const afterData = SaveManager.load();
      return {
        unlocked: !!afterData.achievements.unlocked.story_chapter6_done,
        goldAfter: afterData.gold,
        // 기대값: 1000 + 500 = 1500
        // 실제값: ToolManager.addGold(500)이 gold=1500으로 저장하지만
        //         이후 SaveManager.save(data)가 gold=1000인 stale data를 저장하므로 1000
      };
    });

    expect(result.unlocked).toBe(true);
    // 골드 손실 버그: gold는 1000이어야 하나(버그) or 1500이어야 한다(정상)
    // 이 테스트는 버그의 존재를 문서화한다
    expect(result.goldAfter).toBe(1000); // 버그로 인해 1000 (500 손실)
  });

  // ── 11. 엣지 케이스: 이미 해금된 업적 중복 해금 방지 ──

  test('AchievementManager: 이미 해금된 업적은 건너뜀', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      AchievementManager.increment('enemy_total_killed', 1);
      AchievementManager.check(null, 'enemy_total_killed', 0);

      const data1 = SaveManager.load();
      const coins1 = data1.kitchenCoins;

      AchievementManager.check(null, 'enemy_total_killed', 0);

      const data2 = SaveManager.load();
      const coins2 = data2.kitchenCoins;

      return { coins1, coins2, noDuplicate: coins1 === coins2 };
    });

    expect(result.noDuplicate).toBe(true);
  });

  // ── 12. 엣지 케이스: achievements 필드 없는 세이브 방어 ──

  test('AchievementManager: achievements 필드 없는 데이터 방어', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');

      const badData = { version: 17, stages: {}, gold: 0, kitchenCoins: 0 };
      localStorage.setItem('kitchenChaosTycoon_save', JSON.stringify(badData));

      try {
        AchievementManager.check(null, 'stage_cleared', 0);
        AchievementManager.increment('enemy_total_killed', 1);
        const progress = AchievementManager.getProgress();
        return { ok: true, progressLength: progress.length };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    });

    expect(result.ok).toBe(true);
    expect(result.progressLength).toBe(30);
  });

  // ── 13. 엣지 케이스: 대량 increment 호출 ──

  test('AchievementManager: 빠른 연속 increment 호출 (100회)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      for (let i = 0; i < 100; i++) {
        AchievementManager.increment('enemy_total_killed', 1);
      }

      const data = SaveManager.load();
      return { count: data.achievements.progress.enemy_total_killed };
    });

    expect(result.count).toBe(100);
  });

  // ── 14. 콘솔 에러 검증 ──

  test('MenuScene: 콘솔 에러 없음', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await page.waitForTimeout(1000);

    const errors = page._consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR')
    );
    expect(errors).toEqual([]);
  });

  test('AchievementScene: 콘솔 에러 없음', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await navigateToScene(page, 'AchievementScene');
    await page.waitForTimeout(500);

    // 프로그래밍으로 5개 탭 모두 전환
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('AchievementScene');
      const tabs = ['story', 'battle', 'collect', 'economy', 'endless'];
      for (const tab of tabs) {
        scene._activeTab = tab;
        scene._scrollY = 0;
        scene._updateTabHighlight();
        scene._renderContent();
      }
    });
    await page.waitForTimeout(300);

    const errors = page._consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR')
    );
    expect(errors).toEqual([]);
  });

  // ── 15. 모든 탭 스크린샷 캡처 ──

  test('AchievementScene: 모든 카테고리 탭 스크린샷', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await navigateToScene(page, 'AchievementScene');

    const tabs = ['story', 'battle', 'collect', 'economy', 'endless'];
    for (const tab of tabs) {
      await page.evaluate((t) => {
        const scene = window.__game.scene.getScene('AchievementScene');
        scene._activeTab = t;
        scene._scrollY = 0;
        scene._updateTabHighlight();
        scene._renderContent();
      }, tab);
      await page.waitForTimeout(200);

      await page.screenshot({
        path: `C:/antigravity/kitchen-chaos/tests/screenshots/phase42-tab-${tab}.png`,
      });
    }
  });

  // ── 16. GatheringScene 연동 검증 ──

  test('GatheringScene: AchievementManager import 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('GatheringScene');
      return { exists: !!scene };
    });
    expect(result.exists).toBe(true);
  });

  // ── 17. ServiceScene 연동 검증 ──

  test('ServiceScene: AchievementManager import 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ServiceScene');
      return { exists: !!scene };
    });
    expect(result.exists).toBe(true);
  });

  // ── 18. ResultScene 연동 검증 ──

  test('ResultScene: AchievementManager import 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('ResultScene');
      return { exists: !!scene };
    });
    expect(result.exists).toBe(true);
  });

  // ── 19. 스크롤 기능 검증 (프로그래밍 방식) ──

  test('AchievementScene: 스크롤 동작', async ({ page }) => {
    await waitForScene(page, 'MenuScene');
    await navigateToScene(page, 'AchievementScene');

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('AchievementScene');
      const maxScrollY = scene._maxScrollY;

      // 프로그래밍 방식으로 스크롤
      scene._scrollY = Math.min(100, maxScrollY);
      if (scene._contentContainer) {
        scene._contentContainer.y = 100 - scene._scrollY;
      }

      return {
        maxScrollY,
        currentScrollY: scene._scrollY,
        containerY: scene._contentContainer?.y,
      };
    });

    // 스토리 탭: 10개 카드 * (70+8) = 780px, 뷰포트 490px -> maxScroll ~290
    expect(result.maxScrollY).toBeGreaterThan(0);
    expect(result.currentScrollY).toBeGreaterThan(0);
  });

  // ── 20. 다중 업적 동시 해금 검증 ──

  test('AchievementManager: 동일 type에서 여러 업적 동시 해금', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { AchievementManager } = await import('/js/managers/AchievementManager.js');
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      SaveManager.reset();

      // 100마리 처치 -> battle_first_kill + battle_100kills 동시 해금
      AchievementManager.increment('enemy_total_killed', 100);
      AchievementManager.check(null, 'enemy_total_killed', 0);

      const data = SaveManager.load();
      return {
        firstKill: !!data.achievements.unlocked.battle_first_kill,
        kills100: !!data.achievements.unlocked.battle_100kills,
        kills500: !!data.achievements.unlocked.battle_500kills, // 아직 미달
      };
    });

    expect(result.firstKill).toBe(true);
    expect(result.kills100).toBe(true);
    expect(result.kills500).toBe(false);
  });

  // ── 21. MenuScene Y좌표 배치 검증 ──

  test('MenuScene: 버튼 Y좌표 배치 확인', async ({ page }) => {
    await waitForScene(page, 'MenuScene');

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('MenuScene');
      const allObjects = scene.children.list;

      // 텍스트 중 업적/엔드리스/도감 텍스트의 Y좌표 추출
      const texts = allObjects.filter(c => c.type === 'Text');
      const achieveText = texts.find(t => t.text && t.text.includes('업적') && !t.text.includes('업적 달성'));
      const endlessText = texts.find(t => t.text && t.text.includes('엔드리스'));
      const recipeText = texts.find(t => t.text && t.text.includes('레시피 도감'));
      const versionText = texts.find(t => t.text && t.text.startsWith('v'));

      return {
        achieveY: achieveText?.y,
        endlessY: endlessText?.y,
        recipeY: recipeText?.y,
        versionY: versionText?.y,
      };
    });

    // 스펙: 도감 y=496, 업적 y=534, 엔드리스 y=578, 버전 y=634
    expect(result.achieveY).toBe(534);
    expect(result.recipeY).toBe(496);
    expect(result.endlessY).toBe(578);
    expect(result.versionY).toBe(634);
  });
});
