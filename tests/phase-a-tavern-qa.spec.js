/**
 * @fileoverview Phase A-bis 태번 영업씬 QA 테스트 (V12 마이그레이션).
 * ?scene=tavern URL 파라미터로 TavernServiceScene 진입 및 A1~A4 검증.
 * V12: 4분면(quad) 세로 테이블, 24석(4quad x 좌3+우3).
 */
import { test, expect } from '@playwright/test';

// 씬 진입 대기 헬퍼
async function waitForTavernScene(page) {
  await page.goto('http://localhost:5173/?scene=tavern');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  // TavernServiceScene이 RUNNING(status>=5) 상태가 될 때까지 대기
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
}

// ── 씬 진입 ──

test('A0: ?scene=tavern 파라미터로 TavernServiceScene에 진입된다', async ({ page }) => {
  await waitForTavernScene(page);
  const isActive = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('TavernServiceScene');
    return scene && scene.sys.isActive();
  });
  expect(isActive).toBe(true);
});

// ── A1: 레이아웃 상수 검증 ──

test('A1: TAVERN_LAYOUT 상수가 HUD_H=32, WALL_H=24, CTRL_H=80을 포함한다', async ({ page }) => {
  await waitForTavernScene(page);
  const layout = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('TavernServiceScene');
    return scene ? scene._layout : null;
  });
  expect(layout).not.toBeNull();
  expect(layout.HUD_H).toBe(32);
  expect(layout.WALL_H).toBe(24);
  expect(layout.CTRL_H).toBe(80);
});

// ── SC-1: TABLE_SET_ANCHORS 4엔트리 검증 ──

test('SC-1: TABLE_SET_ANCHORS가 4개 quad 절대 좌표를 포함한다', async ({ page }) => {
  await waitForTavernScene(page);
  const anchors = await page.evaluate(() => {
    return window.__tavernLayout.TABLE_SET_ANCHORS;
  });
  expect(anchors).toHaveLength(4);
  // tl
  expect(anchors[0].quadLeft).toBe(130);
  expect(anchors[0].quadTop).toBe(90);
  expect(anchors[0].key).toBe('tl');
  // tr
  expect(anchors[1].quadLeft).toBe(250);
  expect(anchors[1].quadTop).toBe(90);
  expect(anchors[1].key).toBe('tr');
  // bl
  expect(anchors[2].quadLeft).toBe(130);
  expect(anchors[2].quadTop).toBe(250);
  expect(anchors[2].key).toBe('bl');
  // br
  expect(anchors[3].quadLeft).toBe(250);
  expect(anchors[3].quadTop).toBe(250);
  expect(anchors[3].key).toBe('br');
});

// ── SC-2: 좌석 슬롯 수 검증 (V12: 4quad x 좌3+우3 = 24석) ──

test('SC-2: createSeatingState() 결과 4quad x 6슬롯 = 24석이다', async ({ page }) => {
  await waitForTavernScene(page);
  const totalSlots = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('TavernServiceScene');
    if (!scene) return 0;
    return scene._seatingState.reduce(
      (acc, set) => acc + set.left.length + set.right.length, 0,
    );
  });
  expect(totalSlots).toBe(24);
});

// ── A2: occupySlot / vacateSlot 동작 검증 ──

test('A2: occupySlot이 슬롯을 점유하고 vacateSlot이 해제한다', async ({ page }) => {
  await waitForTavernScene(page);
  const result = await page.evaluate(() => {
    const { occupySlot, vacateSlot } = window.__tavernLayout;
    const r1 = occupySlot(0, 'left', 0, 'customer-001');
    const r2 = occupySlot(0, 'left', 0, 'customer-002');
    vacateSlot(0, 'left', 0);
    const r3 = occupySlot(0, 'left', 0, 'customer-002');
    return { r1, r2, r3 };
  });
  expect(result.r1).toBe(true);
  expect(result.r2).toBe(false);
  expect(result.r3).toBe(true);
});

// ── A2: findFreeSlot 검증 ──

test('A2: findFreeSlot이 빈 슬롯을 반환한다', async ({ page }) => {
  await waitForTavernScene(page);
  const result = await page.evaluate(() => {
    const { findFreeSlot } = window.__tavernLayout;
    const slot = findFreeSlot();
    return slot;
  });
  expect(result).not.toBeNull();
  expect(result).toHaveProperty('tableSetIdx');
  expect(result).toHaveProperty('side');
  expect(result).toHaveProperty('slotIdx');
});

// ── A3: 상태 상수 존재 검증 ──

test('A3: ChefState에 7개 상태가 모두 정의된다', async ({ page }) => {
  await waitForTavernScene(page);
  const states = await page.evaluate(() => Object.values(window.__ChefState));
  expect(states).toHaveLength(7);
  expect(states).toContain('idle_side');
  expect(states).toContain('walk_l');
  expect(states).toContain('walk_r');
  expect(states).toContain('cook');
  expect(states).toContain('carry_l');
  expect(states).toContain('carry_r');
  expect(states).toContain('serve');
});

test('A3: CustomerState에 sit_up과 sit_down이 별개 상태로 존재한다', async ({ page }) => {
  await waitForTavernScene(page);
  const states = await page.evaluate(() => Object.values(window.__CustomerState));
  expect(states).toContain('sit_up');
  expect(states).toContain('sit_down');
  expect(states).toHaveLength(7);
});

// ── A3: scaleY(-1) 코드 부재 검증 ──

test('A3: TavernServiceScene.js에 scaleY 코드가 없다', async ({ page }) => {
  const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
  const source = await response.text();
  expect(source).not.toContain('scaleY');
  expect(source).not.toContain('flipY');
});

// ── A4: 깊이정렬 검증 ──

test('A4: y좌표가 큰 오브젝트의 depth 값이 더 크다', async ({ page }) => {
  await waitForTavernScene(page);
  const depths = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('TavernServiceScene');
    if (!scene) return [];
    return scene._customers.map(c => ({ y: c.sprite.y, depth: c.sprite.depth }));
  });
  expect(depths.length).toBeGreaterThan(0);
  const sorted = [...depths].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    expect(sorted[i].depth).toBeGreaterThanOrEqual(sorted[i - 1].depth);
  }
});

// ── A4: 구시스템 레이어 부재 검증 ──

test('A4: TavernServiceScene에 _back/_front 레이어 분리 코드가 없다', async ({ page }) => {
  const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
  const source = await response.text();
  expect(source).not.toContain('_back');
  expect(source).not.toContain('_front');
  expect(source).not.toContain('_occupied');
});

// ── V12 통로 폭 검증 ──

test('V12: 세로 통로 20px 확보 (quad.tr.left - quad.tl.right = 20)', async ({ page }) => {
  await waitForTavernScene(page);
  const gap = await page.evaluate(() => {
    const anchors = window.__tavernLayout.TABLE_SET_ANCHORS;
    const tl = anchors.find(a => a.key === 'tl');
    const tr = anchors.find(a => a.key === 'tr');
    // tl right = tl.quadLeft + 100, tr left = tr.quadLeft
    return tr.quadLeft - (tl.quadLeft + 100);
  });
  expect(gap).toBe(20);
});

test('V12: 가로 통로 40px 확보 (quad.bl.top - quad.tl.bottom = 40)', async ({ page }) => {
  await waitForTavernScene(page);
  const gap = await page.evaluate(() => {
    const anchors = window.__tavernLayout.TABLE_SET_ANCHORS;
    const tl = anchors.find(a => a.key === 'tl');
    const bl = anchors.find(a => a.key === 'bl');
    // tl bottom = tl.quadTop + 120, bl top = bl.quadTop
    return bl.quadTop - (tl.quadTop + 120);
  });
  expect(gap).toBe(40);
});

// ── 스크린샷 캡처 ──

test('SCREENSHOT: 레이아웃 전체 캡처', async ({ page }) => {
  await waitForTavernScene(page);
  // 렌더링 안정화 대기
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'tests/screenshots/phase-a-tavern-a1-layout-grid.png',
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });
});

test('SCREENSHOT: 가구 배치 캡처', async ({ page }) => {
  await waitForTavernScene(page);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'tests/screenshots/phase-a-tavern-a1-furniture-placed.png',
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });
});

test('SCREENSHOT: 벤치 슬롯 인덱스 캡처', async ({ page }) => {
  await waitForTavernScene(page);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'tests/screenshots/phase-a-tavern-a2-bench-slots.png',
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });
});

test('SCREENSHOT: 셰프+손님 전체 배치 캡처', async ({ page }) => {
  await waitForTavernScene(page);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'tests/screenshots/phase-a-tavern-a4-depth-sort.png',
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });
});
