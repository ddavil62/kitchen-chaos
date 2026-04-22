/**
 * @fileoverview Phase 73 P2-1: 세이브 백업 롤링 + 복구 UI 검증.
 *
 * SaveManager 백업 슬롯 3개 롤링, getBackups/restoreBackup API,
 * 설정 패널 복구 버튼, 백업 목록 모달, 복구 확인 모달을 테스트한다.
 */
import { test, expect } from '@playwright/test';

const SAVE_KEY = 'kitchenChaosTycoon_save';
const BACKUP_KEYS = [
  'kitchenChaosTycoon_backup_1',
  'kitchenChaosTycoon_backup_2',
  'kitchenChaosTycoon_backup_3',
];

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

/** Phaser 게임 인스턴스 부팅 대기 (MenuScene 활성화까지) */
async function waitForGame(page) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

/** canvas->page 좌표 변환 헬퍼 (Pixel 5 뷰포트 보정) */
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

/** 게임 좌표 → 페이지 좌표로 변환하여 클릭 */
async function clickCanvas(page, gameX, gameY) {
  const t = await getCanvasTransform(page);
  const pageX = t.offsetX + gameX * t.scaleX;
  const pageY = t.offsetY + gameY * t.scaleY;
  await page.mouse.click(pageX, pageY);
}

/**
 * v24 세이브 데이터를 직접 localStorage에 주입한다.
 * @param {import('@playwright/test').Page} page
 * @param {object} [overrides]
 */
async function injectSave(page, overrides = {}) {
  await page.evaluate(({ key, ov }) => {
    const base = {
      version: 24,
      selectedChef: 'mimi_chef',
      stages: {},
      gold: 1000,
      kitchenCoins: 50,
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
      season2Unlocked: false,
      season3Unlocked: false,
      storyProgress: { currentChapter: 1, storyFlags: {} },
      endless: {
        unlocked: false,
        bestWave: 0,
        bestScore: 0,
        bestCombo: 0,
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
      soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
      ...ov,
    };
    localStorage.setItem(key, JSON.stringify(base));
  }, { key: SAVE_KEY, ov: overrides });
}

// ── P2-1 세이브 백업 롤링 ─────────────────────────────────────────

test.describe('P2-1 세이브 백업 롤링', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('저장 1회 후 backup_1 존재, backup_2~3 null', async ({ page }) => {
    // 초기 세이브 주입 (메인만)
    await injectSave(page, { gold: 100 });

    // SaveManager.save() 호출 → 백업 롤링 실행
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const data = SaveManager.load();
      data.gold = 200;
      SaveManager.save(data);

      return {
        b1: localStorage.getItem('kitchenChaosTycoon_backup_1'),
        b2: localStorage.getItem('kitchenChaosTycoon_backup_2'),
        b3: localStorage.getItem('kitchenChaosTycoon_backup_3'),
      };
    });

    expect(result.b1).not.toBeNull();
    const b1 = JSON.parse(result.b1);
    expect(b1).toHaveProperty('version');
    expect(b1).toHaveProperty('timestamp');
    expect(b1).toHaveProperty('data');
    expect(b1.data.gold).toBe(100); // 이전 메인의 gold=100이 backup_1에
    expect(result.b2).toBeNull();
    expect(result.b3).toBeNull();
  });

  test('저장 3회 후 backup_1~3 모두 존재, 타임스탬프 역순', async ({ page }) => {
    await injectSave(page, { gold: 100 });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');

      // 저장 3회 (각 다른 gold로 구분)
      for (const g of [200, 300, 400]) {
        const d = SaveManager.load();
        d.gold = g;
        SaveManager.save(d);
        // 약간의 딜레이로 타임스탬프 차이 확보
        await new Promise(r => setTimeout(r, 50));
      }

      const backups = SaveManager.getBackups();
      return backups;
    });

    // 3슬롯 모두 존재
    expect(result[0]).not.toBeNull();
    expect(result[1]).not.toBeNull();
    expect(result[2]).not.toBeNull();

    // 슬롯1이 가장 최신
    expect(result[0].timestamp).toBeGreaterThanOrEqual(result[1].timestamp);
    expect(result[1].timestamp).toBeGreaterThanOrEqual(result[2].timestamp);
  });

  test('저장 4회 후 backup_1이 교체되어 타임스탬프 가장 최신', async ({ page }) => {
    await injectSave(page, { gold: 100 });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');

      for (const g of [200, 300, 400, 500]) {
        const d = SaveManager.load();
        d.gold = g;
        SaveManager.save(d);
        await new Promise(r => setTimeout(r, 50));
      }

      const backups = SaveManager.getBackups();
      return {
        backups,
        mainGold: SaveManager.load().gold,
      };
    });

    expect(result.mainGold).toBe(500);
    // backup_1에는 직전 메인(gold=400)이 저장
    expect(result.backups[0].data.gold).toBe(400);
    // backup_2에는 그 전(gold=300)
    expect(result.backups[1].data.gold).toBe(300);
    // backup_3에는 그 전전(gold=200)
    expect(result.backups[2].data.gold).toBe(200);
  });

  test('각 백업에 version, timestamp, data 필드 포함', async ({ page }) => {
    await injectSave(page, { gold: 100 });

    const backup = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const d = SaveManager.load();
      d.gold = 200;
      SaveManager.save(d);
      return SaveManager.getBackups()[0];
    });

    expect(backup).not.toBeNull();
    expect(backup).toHaveProperty('slot', 1);
    expect(backup).toHaveProperty('version');
    expect(typeof backup.version).toBe('number');
    expect(backup).toHaveProperty('timestamp');
    expect(typeof backup.timestamp).toBe('number');
    expect(backup.timestamp).toBeGreaterThan(0);
    expect(backup).toHaveProperty('data');
    expect(typeof backup.data).toBe('object');
  });

  test('localStorage quota 초과 mock 시 메인 세이브 정상 저장', async ({ page }) => {
    await injectSave(page, { gold: 100 });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');

      // backup 키에 대해서만 quota 초과 시뮬레이션
      const origSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = (k, v) => {
        if (k.includes('backup')) {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        }
        origSetItem(k, v);
      };

      const d = SaveManager.load();
      d.gold = 999;
      SaveManager.save(d);

      // 원복
      localStorage.setItem = origSetItem;

      return {
        mainGold: SaveManager.load().gold,
        b1: localStorage.getItem('kitchenChaosTycoon_backup_1'),
      };
    });

    // 메인 저장은 정상
    expect(result.mainGold).toBe(999);
    // 백업은 실패 (이전 백업이 없었으므로 null)
    expect(result.b1).toBeNull();
  });
});

// ── P2-1 복구 UI ──────────────────────────────────────────────────

test.describe('P2-1 복구 UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await page.waitForTimeout(500);
  });

  test('설정 패널에 세이브 복구 버튼 렌더링', async ({ page }) => {
    // 설정 기어 버튼 클릭 (게임 좌표 330, 30)
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    // Phaser 내부에서 _settingsContainer의 텍스트 오브젝트 확인
    const hasRestoreBtn = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      if (!scene || !scene._settingsContainer) return false;
      const list = scene._settingsContainer.list || [];
      return list.some(obj =>
        obj.type === 'Text' && obj.text && obj.text.includes('\uBCF5\uAD6C')
      );
    });

    expect(hasRestoreBtn).toBe(true);
  });

  test('복구 버튼 클릭 시 백업 목록 모달 오픈', async ({ page }) => {
    // 설정 열기
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    // 복구 버튼 클릭 (게임 좌표 cx=180, y=408)
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    const hasModal = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return !!scene?._backupListContainer;
    });

    expect(hasModal).toBe(true);
  });

  test('백업 없는 슬롯은 비활성 텍스트로 표시', async ({ page }) => {
    // 백업 없는 상태 확보
    await page.evaluate(() => {
      localStorage.removeItem('kitchenChaosTycoon_backup_1');
      localStorage.removeItem('kitchenChaosTycoon_backup_2');
      localStorage.removeItem('kitchenChaosTycoon_backup_3');
    });

    // 설정 열기 → 복구 버튼 클릭
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    const slotTexts = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      if (!scene?._backupListContainer) return [];
      return scene._backupListContainer.list
        .filter(obj => obj.type === 'Text' && obj.text && obj.text.includes('\uC2AC\uB86F'))
        .map(obj => ({ text: obj.text, color: obj.style?.color }));
    });

    // 3개 슬롯 모두 "(없음)" 텍스트
    expect(slotTexts.length).toBe(3);
    for (const s of slotTexts) {
      expect(s.text).toContain('(\uC5C6\uC74C)');
      expect(s.color).toBe('#555555');
    }
  });

  test('슬롯 클릭 시 확인 모달 오픈, restoreBackup API 직접 검증', async ({ page }) => {
    // 백업 데이터 주입
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', JSON.stringify({
        version: 24,
        timestamp: Date.now(),
        data: { version: 24, gold: 777, stages: {} },
      }));
    });

    // 설정 열기
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    // 복구 버튼 클릭
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    // 슬롯 1 클릭 (ROW_START_Y = cy-35 = 320-35 = 285)
    await clickCanvas(page, 180, 285);
    await page.waitForTimeout(500);

    // 확인 모달 존재 확인
    const hasConfirm = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return !!scene?._restoreConfirmContainer;
    });
    expect(hasConfirm).toBe(true);

    // restoreBackup API를 직접 호출하여 데이터 복구 검증
    // (canvas 클릭 좌표는 모달 overlay와 충돌할 수 있으므로 API 직접 테스트)
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const success = SaveManager.restoreBackup(1);
      return {
        success,
        mainGold: JSON.parse(localStorage.getItem('kitchenChaosTycoon_save') || '{}').gold,
      };
    });

    expect(result.success).toBe(true);
    expect(result.mainGold).toBe(777);
  });

  test('확인 모달 취소 버튼 클릭 시 모달 닫힘, reload 미호출', async ({ page }) => {
    // 백업 데이터 주입
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', JSON.stringify({
        version: 24,
        timestamp: Date.now(),
        data: { version: 24, gold: 555, stages: {} },
      }));
    });

    // 설정 → 복구 → 슬롯1 클릭 → 확인 모달 표시
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 285);
    await page.waitForTimeout(500);

    // reload mock
    await page.evaluate(() => {
      window.__reloadCalled = false;
      window.location.reload = () => { window.__reloadCalled = true; };
    });

    // 취소 버튼 클릭 (cx+55=235, cy+40=360)
    await clickCanvas(page, 235, 360);
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return {
        confirmClosed: !scene?._restoreConfirmContainer,
        reloadCalled: window.__reloadCalled,
      };
    });

    expect(state.confirmClosed).toBe(true);
    expect(state.reloadCalled).toBe(false);
  });
});
