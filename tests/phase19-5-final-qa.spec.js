/**
 * @fileoverview Phase 19-5 최종 QA — ServiceScene 아이소메트릭화 검증.
 *
 * 검증 항목:
 *  A. 좌표 계산 정확성 (_cellToWorld, SISO 상수)
 *  B. 테이블 배치 홀 영역 내 완전 포함 (4/6/8석)
 *  C. depth sorting (10 + cy)
 *  D. floor_hall 이미지 + Graphics 오버레이
 *  E. UI 요소 offset (말풍선, 인내심바, 상태 텍스트)
 *  F. 터치 영역 / _onTableTap
 *  G. 콘솔 에러 없음
 *  H. 타 씬 회귀 (GatheringScene)
 *
 * 포트: http://localhost:3456
 * 세이브 키: kitchenChaosTycoon_save
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SS = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:3456/';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 헬퍼 ──

async function waitBoot(page) {
  await page.goto(BASE, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForFunction(() => {
    const g = window.__game;
    return g && g.scene && g.scene.isActive('MenuScene');
  }, { timeout: 90_000 });
  await page.waitForTimeout(500);
}

async function setTables(page, n) {
  await page.evaluate(({ key, count }) => {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
    d.unlockedTables = count;
    localStorage.setItem(key, JSON.stringify(d));
  }, { key: SAVE_KEY, count: n });
}

async function launchService(page) {
  await page.evaluate(() => {
    const g = window.__game;
    g.scene.getScenes(true).forEach(s => g.scene.stop(s.scene.key));
    g.scene.start('ServiceScene', {
      stageId: '1-1',
      inventory: { carrot: 10, meat: 8, flour: 6, squid: 4, pepper: 3 },
      gold: 500, lives: 10,
      marketResult: { totalIngredients: 31, livesRemaining: 10, livesMax: 15 },
      isEndless: false,
    });
  });
  await page.waitForFunction(
    () => window.__game.scene.isActive('ServiceScene'),
    { timeout: 5_000 },
  );
  await page.waitForTimeout(1_000);
}

// ── 테스트 ──

test.describe('Phase 19-5 최종 QA', () => {
  test.setTimeout(150_000); // 부팅 90s + 실행 60s

  // ================================================================
  // A. 좌표 계산 (_cellToWorld) — 4석 기본
  // ================================================================
  test('A. _cellToWorld 좌표 계산 (ORIGIN_Y=120)', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);

    const coords = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      const out = [];
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 4; c++)
          out.push(sc._cellToWorld(c, r));
      return out;
    });

    // SISO_ORIGIN_X=140, SISO_ORIGIN_Y=120, HW=40, HH=30
    const expected = [
      { x: 140, y: 120 }, { x: 180, y: 150 },
      { x: 220, y: 180 }, { x: 260, y: 210 },
      { x: 100, y: 150 }, { x: 140, y: 180 },
      { x: 180, y: 210 }, { x: 220, y: 240 },
    ];
    for (let i = 0; i < 8; i++) {
      expect(coords[i], `cell ${i}`).toEqual(expected[i]);
    }
  });

  // ================================================================
  // B-1. 4석 기본 배치 — 홀 영역 내
  // ================================================================
  test('B-1. 4석 배치: 컨테이너 좌표가 홀 영역 내', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);

    const tables = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return sc.tableContainers.map(c => ({ x: c.x, y: c.y, d: c.depth }));
    });

    expect(tables.length).toBe(4);
    for (const t of tables) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(360);
      expect(t.y).toBeGreaterThanOrEqual(40);
      expect(t.y).toBeLessThanOrEqual(280);
    }

    await page.screenshot({ path: path.join(SS, 'p19-5-qa-4tables.png') });
  });

  // ================================================================
  // B-2. 6석 배치
  // ================================================================
  test('B-2. 6석 배치: 모든 테이블 홀 영역 내', async ({ page }) => {
    await waitBoot(page);
    await setTables(page, 6);
    await launchService(page);

    const tables = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return {
        count: sc.tableContainers.length,
        positions: sc.tableContainers.map(c => ({ x: c.x, y: c.y })),
      };
    });

    expect(tables.count).toBe(6);
    for (const t of tables.positions) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(360);
      expect(t.y).toBeGreaterThanOrEqual(40);
      expect(t.y).toBeLessThanOrEqual(280);
    }

    await page.screenshot({ path: path.join(SS, 'p19-5-qa-6tables.png') });
  });

  // ================================================================
  // B-3. 8석 최대 배치
  // ================================================================
  test('B-3. 8석 최대 배치: 모든 테이블 + 부속 UI 홀 영역 내', async ({ page }) => {
    await waitBoot(page);
    await setTables(page, 8);
    await launchService(page);

    const info = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return sc.tableContainers.map(c => {
        const pb = c.getData('pBarBg');
        const bb = c.getData('bubble');
        return {
          cx: c.x, cy: c.y,
          pBarAbsBottom: c.y + pb.y + 3,
          bubbleAbsTop: c.y + bb.y - 11,
        };
      });
    });

    expect(info.length).toBe(8);
    for (const t of info) {
      expect(t.cy).toBeGreaterThanOrEqual(40);
      expect(t.cy).toBeLessThanOrEqual(280);
      expect(t.pBarAbsBottom).toBeLessThanOrEqual(285);
      expect(t.bubbleAbsTop).toBeGreaterThanOrEqual(35);
    }

    await page.screenshot({ path: path.join(SS, 'p19-5-qa-8tables.png') });
  });

  // ================================================================
  // C. depth sorting
  // ================================================================
  test('C. depth = 10 + cy (y좌표 기반)', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);

    const ok = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return sc.tableContainers.every(c => c.depth === 10 + c.y);
    });

    expect(ok).toBe(true);
  });

  // ================================================================
  // D. floor_hall 이미지 + Graphics 오버레이
  // ================================================================
  test('D-1. floor_hall 텍스처 로드 및 배치', async ({ page }) => {
    await waitBoot(page);

    const loaded = await page.evaluate(() => window.__game.textures.exists('floor_hall'));
    expect(loaded).toBe(true);

    await launchService(page);

    const floor = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      const img = sc.children.list.find(
        c => c.type === 'Image' && c.texture?.key === 'floor_hall',
      );
      if (!img) return null;
      return {
        x: img.x, y: img.y,
        dw: img.displayWidth, dh: img.displayHeight,
        depth: img.depth,
      };
    });

    expect(floor).not.toBeNull();
    expect(floor.x).toBe(180);   // GAME_WIDTH / 2
    expect(floor.y).toBe(160);   // HALL_Y + HALL_H / 2
    expect(floor.dw).toBe(360);
    expect(floor.dh).toBe(240);
    expect(floor.depth).toBe(0);
  });

  test('D-2. Graphics 오버레이 존재', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);

    const gfxCount = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return sc.children.list.filter(c => c.type === 'Graphics').length;
    });
    expect(gfxCount).toBeGreaterThan(0);
  });

  // ================================================================
  // E. UI 요소 offset 검증
  // ================================================================
  test('E-1. 빈 테이블 텍스트: y=-22, 가시', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);

    const txts = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return sc.tableContainers.map(c => {
        const st = c.getData('statusText');
        return { y: st.y, vis: st.visible, text: st.text };
      });
    });

    for (const t of txts) {
      expect(t.y).toBe(-22); // -SISO_HALF_H + 8
      expect(t.vis).toBe(true);
      expect(t.text).toBe('\uBE48 \uD14C\uC774\uBE14');
    }
  });

  test('E-2. 말풍선 y=-48, 인내심 바 y=36, 초기 숨김', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);

    const ui = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      const c = sc.tableContainers[0];
      return {
        bubbleY: c.getData('bubble').y,
        bubbleVis: c.getData('bubble').visible,
        pBarY: c.getData('pBarBg').y,
        pBarVis: c.getData('pBarBg').visible,
        iconVis: c.getData('custIconImg').visible,
      };
    });

    expect(ui.bubbleY).toBe(-48);
    expect(ui.bubbleVis).toBe(false);
    expect(ui.pBarY).toBe(36);
    expect(ui.pBarVis).toBe(false);
    expect(ui.iconVis).toBe(false);
  });

  // ================================================================
  // F. 터치 영역
  // ================================================================
  test('F. hitArea 크기 = (82 x 66), 터치 에러 없음', async ({ page }) => {
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));

    await waitBoot(page);
    await launchService(page);

    const hit = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      const c = sc.tableContainers[0];
      const r = c.list.find(ch => ch.type === 'Rectangle' && ch.input);
      return r ? { w: r.width, h: r.height } : null;
    });
    expect(hit).not.toBeNull();
    expect(hit.w).toBe(82);
    expect(hit.h).toBe(66);

    // 클릭 시 에러 없음
    const pos = await page.evaluate(() => {
      const c = window.__game.scene.getScene('ServiceScene').tableContainers[0];
      const cv = window.__game.canvas;
      return { x: c.x * cv.clientWidth / 360, y: c.y * cv.clientHeight / 640 };
    });
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(300);

    const critical = errs.filter(e => !e.includes('__MISSING'));
    expect(critical).toEqual([]);
  });

  // ================================================================
  // G. 콘솔 에러
  // ================================================================
  test('G. ServiceScene 3초간 콘솔 에러 없음', async ({ page }) => {
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));

    await waitBoot(page);
    await launchService(page);
    await page.waitForTimeout(3_000);

    const critical = errs.filter(e => !e.includes('__MISSING'));
    expect(critical).toEqual([]);
  });

  // ================================================================
  // H. 타 씬 회귀 — GatheringScene
  // ================================================================
  test('H. GatheringScene 회귀', async ({ page }) => {
    await waitBoot(page);

    await page.evaluate(() => {
      const g = window.__game;
      g.scene.getScenes(true).forEach(s => g.scene.stop(s.scene.key));
      g.scene.start('GatheringScene', { stageId: '1-1', chefId: 'mimi' });
    });
    await page.waitForFunction(
      () => window.__game.scene.isActive('GatheringScene'),
      { timeout: 5_000 },
    );
    await page.waitForTimeout(1_000);

    const active = await page.evaluate(() =>
      window.__game.scene.isActive('GatheringScene'));
    expect(active).toBe(true);

    await page.screenshot({ path: path.join(SS, 'p19-5-qa-gathering.png') });
  });

  // ================================================================
  // I. 8석 depth ordering 실제 정렬 검증
  // ================================================================
  test('I. 8석 depth 정렬 순서', async ({ page }) => {
    await waitBoot(page);
    await setTables(page, 8);
    await launchService(page);

    const data = await page.evaluate(() => {
      const sc = window.__game.scene.getScene('ServiceScene');
      return sc.tableContainers.map(c => ({ y: c.y, d: c.depth }));
    });

    const sorted = [...data].sort((a, b) => a.d - b.d);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].y).toBeGreaterThanOrEqual(sorted[i - 1].y);
    }
  });

  // ================================================================
  // J. 시각적 검증 스크린샷
  // ================================================================
  test('J. 홀 영역 클로즈업 4석', async ({ page }) => {
    await waitBoot(page);
    await launchService(page);
    await page.screenshot({
      path: path.join(SS, 'p19-5-qa-hall-4.png'),
      clip: { x: 0, y: 40, width: 360, height: 240 },
    });
  });

  test('J-2. 홀 영역 클로즈업 8석', async ({ page }) => {
    await waitBoot(page);
    await setTables(page, 8);
    await launchService(page);
    await page.screenshot({
      path: path.join(SS, 'p19-5-qa-hall-8.png'),
      clip: { x: 0, y: 40, width: 360, height: 240 },
    });
  });
});
