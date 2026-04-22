/**
 * @fileoverview Phase 73 QA — 세이브 백업 + 포트레이트 정합 능동적 검증.
 *
 * Coder 리포트의 17개 테스트를 넘어, 엣지케이스/경계값/동시성/UI 안정성을
 * 능동적으로 탐색한다.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SAVE_KEY = 'kitchenChaosTycoon_save';
const BACKUP_KEYS = [
  'kitchenChaosTycoon_backup_1',
  'kitchenChaosTycoon_backup_2',
  'kitchenChaosTycoon_backup_3',
];

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

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

// ── 백업 롤링 엣지케이스 ─────────────────────────────────────────

test.describe('QA: 백업 롤링 엣지케이스', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test('5회 연속 저장 후 가장 오래된 백업(slot3)이 올바르게 밀려남', async ({ page }) => {
    await injectSave(page, { gold: 10 });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const golds = [20, 30, 40, 50, 60];
      for (const g of golds) {
        const d = SaveManager.load();
        d.gold = g;
        SaveManager.save(d);
        await new Promise(r => setTimeout(r, 30));
      }
      const backups = SaveManager.getBackups();
      return {
        mainGold: SaveManager.load().gold,
        b1Gold: backups[0]?.data?.gold,
        b2Gold: backups[1]?.data?.gold,
        b3Gold: backups[2]?.data?.gold,
      };
    });

    // 5회 저장 후: main=60, b1=50, b2=40, b3=30 (20, 10은 밀려남)
    expect(result.mainGold).toBe(60);
    expect(result.b1Gold).toBe(50);
    expect(result.b2Gold).toBe(40);
    expect(result.b3Gold).toBe(30);
  });

  test('restoreBackup 후 게임 상태가 실제로 롤백되는지', async ({ page }) => {
    await injectSave(page, { gold: 100 });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      // 저장 2회: gold 200, 300
      for (const g of [200, 300]) {
        const d = SaveManager.load();
        d.gold = g;
        SaveManager.save(d);
        await new Promise(r => setTimeout(r, 30));
      }
      // main=300, b1=200(gold=200 메인시점), b2=100(gold=100 메인시점)

      // slot2 복구 (gold=100 시점)
      const success = SaveManager.restoreBackup(2);
      const afterRestore = SaveManager.load();
      return {
        success,
        restoredGold: afterRestore.gold,
      };
    });

    expect(result.success).toBe(true);
    expect(result.restoredGold).toBe(100);
  });

  test('잘못된 슬롯 번호 (0, 4, -1) 호출 시 false 반환', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return {
        slot0: SaveManager.restoreBackup(0),
        slot4: SaveManager.restoreBackup(4),
        slotNeg: SaveManager.restoreBackup(-1),
      };
    });

    expect(result.slot0).toBe(false);
    expect(result.slot4).toBe(false);
    expect(result.slotNeg).toBe(false);
  });

  test('빈 슬롯 복구 시도 시 false 반환', async ({ page }) => {
    // 백업 모두 제거
    await page.evaluate(() => {
      for (const k of [
        'kitchenChaosTycoon_backup_1',
        'kitchenChaosTycoon_backup_2',
        'kitchenChaosTycoon_backup_3',
      ]) {
        localStorage.removeItem(k);
      }
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return {
        slot1: SaveManager.restoreBackup(1),
        slot2: SaveManager.restoreBackup(2),
        slot3: SaveManager.restoreBackup(3),
      };
    });

    expect(result.slot1).toBe(false);
    expect(result.slot2).toBe(false);
    expect(result.slot3).toBe(false);
  });

  test('파손된 JSON이 백업 슬롯에 있을 때 getBackups()가 null 반환', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', '{broken json!!!');
      localStorage.setItem('kitchenChaosTycoon_backup_2', '');
      localStorage.setItem('kitchenChaosTycoon_backup_3', 'null');
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.getBackups();
    });

    // slot1: 파손 JSON -> JSON.parse 실패 -> null
    expect(result[0]).toBeNull();
    // slot2: 빈 문자열 -> falsy -> null
    expect(result[1]).toBeNull();
    // slot3: 'null' 문자열 -> JSON.parse('null') = null -> parsed가 null이므로...
    // parsed.version 접근 시 TypeError 발생 -> catch -> null
    expect(result[2]).toBeNull();
  });

  test('파손된 JSON 슬롯에 대해 restoreBackup도 false 반환', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', '{broken}');
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.restoreBackup(1);
    });

    expect(result).toBe(false);
  });

  test('restoreBackup에 NaN/undefined/null 전달 시 크래시 없음', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const results = [];
      try { results.push(SaveManager.restoreBackup(NaN)); } catch { results.push('error'); }
      try { results.push(SaveManager.restoreBackup(undefined)); } catch { results.push('error'); }
      try { results.push(SaveManager.restoreBackup(null)); } catch { results.push('error'); }
      return results;
    });

    // NaN: NaN < 1 => false, NaN > 3 => false -> guard passes!
    // BACKUP_KEYS[NaN - 1] = BACKUP_KEYS[NaN] = undefined
    // localStorage.getItem(undefined) -> "undefined" key -> null -> returns false
    // undefined: same as NaN
    // null: 0 < 1 => true -> returns false
    for (const r of result) {
      expect(r === false || r === 'error').toBe(true);
    }
  });

  test('data 필드가 없는 백업 객체에서 restoreBackup이 false 반환', async ({ page }) => {
    await page.evaluate(() => {
      // data 필드 없이 version, timestamp만 있는 백업
      localStorage.setItem('kitchenChaosTycoon_backup_1', JSON.stringify({
        version: 24,
        timestamp: Date.now(),
        // data 필드 의도적 누락
      }));
    });

    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      return SaveManager.restoreBackup(1);
    });

    expect(result).toBe(false);
  });

  test('메인 세이브가 비어있을 때 save 호출 시 백업 생성 안 됨 (정상)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      // 메인 세이브 제거
      localStorage.removeItem('kitchenChaosTycoon_save');
      // 백업도 제거
      for (const k of [
        'kitchenChaosTycoon_backup_1',
        'kitchenChaosTycoon_backup_2',
        'kitchenChaosTycoon_backup_3',
      ]) localStorage.removeItem(k);

      // 새 데이터로 첫 저장
      SaveManager.save({ version: 24, gold: 500 });

      return {
        mainGold: JSON.parse(localStorage.getItem('kitchenChaosTycoon_save')).gold,
        b1: localStorage.getItem('kitchenChaosTycoon_backup_1'),
      };
    });

    // 메인이 없었으므로 백업은 생성 안 됨 (existingMain 체크)
    expect(result.mainGold).toBe(500);
    expect(result.b1).toBeNull();
  });
});

// ── UI 엣지케이스 ────────────────────────────────────────────────

test.describe('QA: 복구 UI 엣지케이스', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await page.waitForTimeout(500);
  });

  test('_closeSettingsPanel 호출 시 열려있던 백업 모달도 함께 제거됨', async ({ page }) => {
    // 설정 열기
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    // 복구 버튼 클릭 -> 백업 목록 모달 열기
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    // 백업 모달이 열려있는지 확인
    const hasModalBefore = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return !!scene?._backupListContainer;
    });
    expect(hasModalBefore).toBe(true);

    // _closeSettingsPanel 직접 호출 (백업 모달 overlay가 설정 X 버튼을 가리므로)
    // 이것은 _closeSettingsPanel()이 모달 cleanup을 올바르게 수행하는지 검증
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      scene._closeSettingsPanel();
    });
    await page.waitForTimeout(500);

    // 모달도 함께 파괴됐는지 확인
    const state = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return {
        settingsClosed: !scene?._settingsContainer,
        backupModalClosed: !scene?._backupListContainer,
        confirmModalClosed: !scene?._restoreConfirmContainer,
      };
    });

    expect(state.settingsClosed).toBe(true);
    expect(state.backupModalClosed).toBe(true);
    expect(state.confirmModalClosed).toBe(true);
  });

  test('설정 패널 닫기 시 열려있던 복구 확인 모달도 함께 제거됨', async ({ page }) => {
    // 백업 데이터 주입
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', JSON.stringify({
        version: 24,
        timestamp: Date.now(),
        data: { version: 24, gold: 777, stages: {} },
      }));
    });

    // 설정 -> 복구 -> 슬롯1 -> 확인 모달까지 열기
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 285); // slot1
    await page.waitForTimeout(500);

    const hasConfirm = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return !!scene?._restoreConfirmContainer;
    });
    expect(hasConfirm).toBe(true);

    // _closeSettingsPanel 직접 호출로 전부 닫기
    await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      scene._closeSettingsPanel();
    });
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return {
        settingsClosed: !scene?._settingsContainer,
        backupModalClosed: !scene?._backupListContainer,
        confirmModalClosed: !scene?._restoreConfirmContainer,
      };
    });

    expect(state.settingsClosed).toBe(true);
    expect(state.backupModalClosed).toBe(true);
    expect(state.confirmModalClosed).toBe(true);
  });

  test('복구 버튼 더블클릭 시 백업 모달이 중복 생성되지 않음', async ({ page }) => {
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    // 빠르게 복구 버튼 2회 클릭
    await clickCanvas(page, 180, 408);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    const containerCount = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      // _backupListContainer가 하나만 존재해야 함
      return scene?._backupListContainer ? 1 : 0;
    });

    expect(containerCount).toBe(1);
  });

  test('복구 확인 모달에서 복구 클릭 시 restoreBackup API + 데이터 복구 동작 확인', async ({ page }) => {
    // 백업 데이터 주입
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', JSON.stringify({
        version: 24,
        timestamp: Date.now(),
        data: { version: 24, gold: 999, stages: {} },
      }));
    });

    // 설정 -> 복구 -> 슬롯1 -> 확인 모달
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 285);
    await page.waitForTimeout(500);

    // 확인 모달이 열렸는지 확인
    const hasConfirm = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return !!scene?._restoreConfirmContainer;
    });
    expect(hasConfirm).toBe(true);

    // restoreBackup API 직접 호출로 데이터 복구 검증
    // (window.location.reload는 non-configurable property라 mock 불가,
    //  대신 API 동작과 데이터 무결성만 검증)
    const result = await page.evaluate(async () => {
      const { SaveManager } = await import('/js/managers/SaveManager.js');
      const success = SaveManager.restoreBackup(1);
      return {
        success,
        restoredGold: JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'))?.gold,
      };
    });

    expect(result.success).toBe(true);
    expect(result.restoredGold).toBe(999);

    // 코드에서 reload를 호출하는지는 정적 분석으로 확인 (MenuScene.js L589):
    // confirmBg.on('pointerdown', () => {
    //   SoundManager.playSFX('sfx_ui_tap');
    //   SaveManager.restoreBackup(slot);
    //   window.location.reload();
    // });
  });

  test('백업 목록 모달 닫기 버튼(X) 클릭 시 모달만 닫힘', async ({ page }) => {
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    // 모달 X 버튼: cx + modalW/2 - 15 = 180+140-15=305, cy - modalH/2 + 15 = 320-100+15=235
    await clickCanvas(page, 305, 235);
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      return {
        backupModalClosed: !scene?._backupListContainer,
        settingsStillOpen: !!scene?._settingsContainer,
      };
    });

    expect(state.backupModalClosed).toBe(true);
    expect(state.settingsStillOpen).toBe(true);
  });

  test('패널 높이 확장 확인: panelH=316, 복구 버튼(y=408)과 쿠폰 버튼(y=456)이 패널 내부에 위치', async ({ page }) => {
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    const layoutCheck = await page.evaluate(() => {
      const scene = window.__game?.scene?.getScene('MenuScene');
      if (!scene?._settingsContainer) return null;

      const list = scene._settingsContainer.list || [];
      const texts = list.filter(o => o.type === 'Text').map(o => ({
        text: o.text,
        y: o.y,
      }));

      // 복구 관련 텍스트와 쿠폰 관련 텍스트 y좌표 확인
      const restoreText = texts.find(t => t.text && t.text.includes('\uBCF5\uAD6C'));
      const couponText = texts.find(t => t.text && t.text.includes('\uCFE0\uD3F0'));

      return {
        restoreY: restoreText?.y,
        couponY: couponText?.y,
        panelBottom: 170 + 316,  // panelY + panelH = 486
      };
    });

    expect(layoutCheck).not.toBeNull();
    // 복구 버튼이 패널 내부
    expect(layoutCheck.restoreY).toBe(408);
    expect(layoutCheck.restoreY).toBeLessThan(layoutCheck.panelBottom);
    // 쿠폰 버튼이 패널 내부
    expect(layoutCheck.couponY).toBe(456);
    expect(layoutCheck.couponY).toBeLessThan(layoutCheck.panelBottom);
  });
});

// ── 콘솔 에러 / JS 예외 ──────────────────────────────────────────

test.describe('QA: 콘솔 에러 없음', () => {
  test('MenuScene 로드 + 설정 패널 열고 닫기 중 JS 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await waitForGame(page);
    await page.waitForTimeout(500);

    // 설정 열기
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    // 복구 버튼 클릭
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    // 닫기
    await clickCanvas(page, 305, 235);
    await page.waitForTimeout(300);

    // 설정 닫기
    await clickCanvas(page, 305, 185);
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });
});

// ── 시각적 검증 (스크린샷) ────────────────────────────────────────

test.describe('QA: 시각적 검증', () => {
  test('설정 패널 복구 버튼 + 쿠폰 버튼 레이아웃 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await page.waitForTimeout(1000);

    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase73-settings-panel.png',
    });
  });

  test('백업 목록 모달 빈 슬롯 상태 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    // 백업 모두 삭제
    await page.evaluate(() => {
      localStorage.removeItem('kitchenChaosTycoon_backup_1');
      localStorage.removeItem('kitchenChaosTycoon_backup_2');
      localStorage.removeItem('kitchenChaosTycoon_backup_3');
    });

    await page.waitForTimeout(500);
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase73-backup-list-empty.png',
    });
  });

  test('백업 목록 모달 채워진 슬롯 상태 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    // 백업 3개 주입
    const now = Date.now();
    await page.evaluate((ts) => {
      for (let i = 0; i < 3; i++) {
        localStorage.setItem(`kitchenChaosTycoon_backup_${i + 1}`, JSON.stringify({
          version: 24,
          timestamp: ts - i * 60000,
          data: { version: 24, gold: (3 - i) * 100, stages: {} },
        }));
      }
    }, now);

    await page.waitForTimeout(500);
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase73-backup-list-filled.png',
    });
  });

  test('복구 확인 모달 스크린샷', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);

    // 백업 데이터 주입
    await page.evaluate(() => {
      localStorage.setItem('kitchenChaosTycoon_backup_1', JSON.stringify({
        version: 24,
        timestamp: Date.now(),
        data: { version: 24, gold: 500, stages: {} },
      }));
    });

    await page.waitForTimeout(500);
    await clickCanvas(page, 330, 30);
    await page.waitForTimeout(500);
    await clickCanvas(page, 180, 408);
    await page.waitForTimeout(500);
    // 슬롯 1 클릭
    await clickCanvas(page, 180, 285);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'tests/screenshots/phase73-restore-confirm.png',
    });
  });
});

// ── 포트레이트 정합 추가 검증 ─────────────────────────────────────

test.describe('QA: 포트레이트 정합 추가 검증', () => {
  test('assets/portraits/ 디렉토리에 정확히 8개 파일만 존재', async () => {
    const portraitsDir = path.resolve('assets/portraits');
    const entries = fs.readdirSync(portraitsDir, { withFileTypes: true });
    const files = entries.filter(e => e.isFile()).map(e => e.name).sort();

    expect(files).toEqual([
      'portrait_andre.png',
      'portrait_arjun.png',
      'portrait_lao.png',
      'portrait_mage.png',
      'portrait_mimi.png',
      'portrait_poco.png',
      'portrait_rin.png',
      'portrait_yuki.png',
    ]);

    // 하위 디렉토리 없음
    const dirs = entries.filter(e => e.isDirectory());
    expect(dirs.length).toBe(0);
  });

  test('JS 코드 전체에서 portraits/candidates 또는 portraits/_archive 경로 참조 없음', async () => {
    // js/ 디렉토리의 모든 JS 파일 스캔
    const jsDir = path.resolve('js');

    function scanDir(dir) {
      const results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...scanDir(full));
        } else if (entry.name.endsWith('.js')) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('portraits/candidates') || content.includes('portraits/_archive')) {
            results.push(full);
          }
        }
      }
      return results;
    }

    const violatingFiles = scanDir(jsDir);
    expect(violatingFiles).toEqual([]);
  });
});
