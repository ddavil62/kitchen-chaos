/**
 * @fileoverview Phase 75B AD/QA 캡처 — MenuScene 배너 + 팝업 모달 + 캘린더.
 */
import { test } from '@playwright/test';

const DIR = 'tests/screenshots';

async function freshStart(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await page.waitForFunction(() => {
    const g = window.__game;
    return g?.isBooted && g.scene?.isActive('MenuScene');
  }, {}, { timeout: 20000 });
  await page.waitForTimeout(800);
}

test.describe('Phase 75B 캡처', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
  });

  test('M1: MenuScene 전체 (배너 포함)', async ({ page }) => {
    await freshStart(page);
    await page.screenshot({ path: `${DIR}/phase75B-m1-menu.png` });
  });

  test('M2: 배너 클릭 → 미션 팝업', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('MenuScene');
      scene._openDailyMissionModal();
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/phase75B-m2-mission-modal.png` });
  });

  test('M3: 캘린더 탭', async ({ page }) => {
    await freshStart(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('MenuScene');
      scene._openDailyMissionModal();
    });
    await page.waitForTimeout(500);
    // 캘린더 탭 클릭 — 모달 중앙 + 70 좌표
    // GAME_WIDTH=360 → cx=180, cy=320, TAB_Y = 320 - 220 + 36 = 136
    await page.mouse.click(250, 136);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/phase75B-m3-calendar.png` });
  });

  test('M4: 미션 진행 상태(2개 완료) 표시', async ({ page }) => {
    test.setTimeout(60000);
    page.on('pageerror', (e) => console.log('[PAGE ERROR]', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.log('[CONSOLE]', m.text()); });
    await freshStart(page);
    // 메뉴 진입 후 세이브 데이터 직접 조작 → 리로드 (기존 save 머지)
    await page.evaluate(() => {
      const KEY = 'kitchenChaosTycoon_save';
      const raw = localStorage.getItem(KEY);
      const save = raw ? JSON.parse(raw) : {};
      const today = new Date().toISOString().slice(0, 10);
      save.dailyMissions = {
        lastResetDate: today,
        list: [
          { id: 'serve_5', type: 'orders_complete', target: 5, progress: 5, completed: true, claimed: false, descKo: '\uC8FC\uBB38 5\uD68C \uC644\uB8CC', reward: { gold: 200 } },
          { id: 'gold_500', type: 'gold_earn', target: 500, progress: 500, completed: true, claimed: false, descKo: '\uACE8\uB4DC 500g \uD68D\uB4DD', reward: { kitchenCoins: 5 } },
          { id: 'clear_3', type: 'stage_clear', target: 3, progress: 1, completed: false, claimed: false, descKo: '\uC2A4\uD14C\uC774\uC9C0 3\uD68C \uD074\uB9AC\uC5B4', reward: { gold: 300 } },
        ],
      };
      localStorage.setItem(KEY, JSON.stringify(save));
    });
    await page.reload();
    await page.waitForFunction(() => {
      const g = window.__game;
      return g?.isBooted && g.scene?.isActive('MenuScene');
    }, {}, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/phase75B-m4-menu-progress.png` });
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('MenuScene');
      scene._openDailyMissionModal();
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/phase75B-m4-modal-progress.png` });
  });
});
