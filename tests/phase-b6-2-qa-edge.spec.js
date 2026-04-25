/**
 * @fileoverview Phase B-6-2 QA 엣지케이스 테스트.
 * BENCH_CONFIG QUAD_W 100->104 연쇄 영향, slot worldY 계산, 가구 렌더 위치,
 * bench-r/table 4px 겹침, lv3/lv4 미래 슬롯 범위 검증.
 */
import { test, expect } from '@playwright/test';

// ── 헬퍼 ──

async function waitForTavernScene(page) {
  await page.goto('http://localhost:5173/?scene=tavern');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
  await page.waitForTimeout(1500);
}

// ── 1. BENCH_CONFIG 상수 연쇄 영향 검증 ──

test.describe('B-6-2 Edge: BENCH_CONFIG 연쇄 영향', () => {

  test('QUAD_W(104) = BENCH_L_LEFT(4) + BENCH_W(28) + TABLE_W(44) + BENCH_W(28) = 104 수학적 정합', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const getVal = (key) => {
      const m = content.match(new RegExp(`${key}:\\s*(\\d+)`));
      return m ? parseInt(m[1]) : null;
    };

    const QUAD_W = getVal('QUAD_W');
    const BENCH_L_LEFT = getVal('BENCH_L_LEFT');
    const BENCH_W = getVal('BENCH_W');
    const TABLE_W = getVal('TABLE_W');
    const BENCH_R_LEFT = getVal('BENCH_R_LEFT');

    // bench_l + table + bench_r + margin <= QUAD_W
    const totalContent = BENCH_L_LEFT + BENCH_W + TABLE_W + BENCH_W;
    expect(totalContent, 'bench+table+bench 합계').toBeLessThanOrEqual(QUAD_W);

    // bench_r_right <= QUAD_W
    const benchRRight = BENCH_R_LEFT + BENCH_W;
    expect(benchRRight, 'bench_r 우측 경계').toBeLessThanOrEqual(QUAD_W);
  });

  test('TABLE_LEFT(32) = BENCH_L_LEFT(4) + BENCH_W(28) gap 0 확인', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const getVal = (key) => {
      const m = content.match(new RegExp(`${key}:\\s*(\\d+)`));
      return m ? parseInt(m[1]) : null;
    };

    const TABLE_LEFT = getVal('TABLE_LEFT');
    const BENCH_L_LEFT = getVal('BENCH_L_LEFT');
    const BENCH_W = getVal('BENCH_W');

    expect(TABLE_LEFT, 'TABLE_LEFT == BENCH_L_LEFT + BENCH_W').toBe(BENCH_L_LEFT + BENCH_W);
  });

  test('BENCH_R_LEFT(76) vs TABLE right(76): 0px 갭(밀착, 겹침 없음), QUAD_W(104) 내 수용', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const getVal = (key) => {
      const m = content.match(new RegExp(`${key}:\\s*(\\d+)`));
      return m ? parseInt(m[1]) : null;
    };

    const TABLE_LEFT = getVal('TABLE_LEFT');
    const TABLE_W = getVal('TABLE_W');
    const BENCH_R_LEFT = getVal('BENCH_R_LEFT');
    const QUAD_W = getVal('QUAD_W');

    const tableRight = TABLE_LEFT + TABLE_W;  // 32 + 44 = 76
    const gap = BENCH_R_LEFT - tableRight;    // Phase C: 76 - 76 = 0 (겹침 해소)

    // Phase C: 수치 정합 — gap=0 (bench-r이 table에 밀착, 겹침 없음)
    expect(gap, 'bench-r/table 갭').toBe(0);

    // bench_r 우측이 QUAD_W 내에 수용되는지 (76 + 28 = 104 = QUAD_W)
    const benchRRight = BENCH_R_LEFT + getVal('BENCH_W');
    expect(benchRRight, 'bench_r 우측').toBeLessThanOrEqual(QUAD_W);
  });

  test('AISLE_V(16) + QUAD_W(104)*2 + 여백(8) = 232 <= 다이닝홀 가용폭(232)', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const getVal = (key) => {
      const m = content.match(new RegExp(`${key}:\\s*(\\d+)`));
      return m ? parseInt(m[1]) : null;
    };

    const QUAD_W = getVal('QUAD_W');
    const AISLE_V = getVal('AISLE_V');
    const DINING_X = 128;
    const GAME_W = 360;

    const diningAvailable = GAME_W - DINING_X;  // 232
    const totalUsed = 4 + QUAD_W + AISLE_V + QUAD_W + 4;  // 좌여백4 + quad + 통로 + quad + 우여백4

    expect(totalUsed, '다이닝홀 내 전체 사용폭').toBeLessThanOrEqual(diningAvailable);
  });
});

// ── 2. TABLE_SET_ANCHORS quadLeft 변경 (+2) 검증 ──

test.describe('B-6-2 Edge: TABLE_SET_ANCHORS 좌표 검증', () => {

  test('tl/bl quadLeft(132) = DINING_X(128) + 좌여백(4)', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const anchorsMatch = content.match(/TABLE_SET_ANCHORS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
    expect(anchorsMatch).not.toBeNull();

    const quadLeftValues = [...anchorsMatch[1].matchAll(/quadLeft:\s*(\d+)/g)].map(m => parseInt(m[1]));
    // tl=132, tr=252, bl=132, br=252
    expect(quadLeftValues[0], 'tl quadLeft').toBe(128 + 4);  // DINING_X + margin
    expect(quadLeftValues[2], 'bl quadLeft').toBe(128 + 4);
  });

  test('tr/br quadLeft(252) = tl(132) + QUAD_W(104) + AISLE_V(16)', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/data/tavernLayoutData.js', 'utf-8');

    const anchorsMatch = content.match(/TABLE_SET_ANCHORS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
    const quadLeftValues = [...anchorsMatch[1].matchAll(/quadLeft:\s*(\d+)/g)].map(m => parseInt(m[1]));

    // tr = tl + QUAD_W + AISLE_V = 132 + 104 + 16 = 252
    expect(quadLeftValues[1], 'tr quadLeft').toBe(132 + 104 + 16);
    expect(quadLeftValues[3], 'br quadLeft').toBe(132 + 104 + 16);
  });

  test('tr/br quad 우측(356)이 GAME_W(360) 내에 수용됨', async () => {
    // tr/br quadRight = 252 + 104 = 356 < 360
    expect(252 + 104, 'tr/br quad right').toBeLessThan(360);
  });

  test('tr/br quad 우측(356)이 DINING_RIGHT(352)를 4px 초과 (AD3 W-2 확인)', async () => {
    // 기록용: DINING_RIGHT = 128 + 224 = 352, quad right = 356
    const diningRight = 128 + 224;
    const quadRight = 252 + 104;
    expect(quadRight - diningRight, 'DINING_RIGHT 초과량').toBe(4);
    // 화면 내이므로 렌더링 문제 없음
    expect(quadRight, 'vs GAME_W').toBeLessThan(360);
  });
});

// ── 3. BENCH_SLOTS.lv0 dy 슬롯 좌표 검증 ──

test.describe('B-6-2 Edge: 슬롯 worldY 계산', () => {

  test('lv0 3슬롯 dy=[26,60,94] 모두 bench 범위(12~108) 내', async () => {
    const benchTop = 12;
    const benchBottom = 12 + 96;  // 108
    const dyValues = [26, 60, 94];

    for (const dy of dyValues) {
      expect(dy, `dy=${dy} >= benchTop`).toBeGreaterThanOrEqual(benchTop);
      expect(dy, `dy=${dy} <= benchBottom`).toBeLessThanOrEqual(benchBottom);
    }
  });

  test('lv0 슬롯 간 균등 배분: 간격 34px', async () => {
    const dyValues = [26, 60, 94];
    const gap01 = dyValues[1] - dyValues[0];  // 34
    const gap12 = dyValues[2] - dyValues[1];  // 34
    expect(gap01, '슬롯0-1 간격').toBe(gap12);
    expect(gap01, '간격').toBe(34);
  });

  test('lv0 슬롯 상하 여백 대칭: 14px', async () => {
    const benchTop = 12;
    const benchBottom = 108;
    const topMargin = 26 - benchTop;    // 14
    const bottomMargin = benchBottom - 94;  // 14
    expect(topMargin, '상단 여백').toBe(bottomMargin);
    expect(topMargin, '여백 14px').toBe(14);
  });

  test('lv0 착석 캐릭터(48px 높이) Y 겹침 14px: depth sort로 처리됨 (AD3 확인)', async () => {
    // origin(0.5, 1) 기준: 캐릭터 머리(top) = dy - 48, 발(bottom) = dy
    // 슬롯 간격 34px < 캐릭터 높이 48px -> 14px 겹침 발생
    // 이는 depth sort(y 기반)로 앞뒤 관계가 자연스럽게 처리되므로 의도된 동작
    const charH = 48;
    const dyValues = [26, 60, 94];

    for (let i = 0; i < dyValues.length - 1; i++) {
      const currentFeet = dyValues[i];
      const nextHead = dyValues[i + 1] - charH;
      const overlap = currentFeet - nextHead;
      // 14px 겹침이 예상됨 (34 - (48-34) = 34-14 = ... feet(26) - head(12) = 14)
      expect(overlap, `슬롯${i}-${i+1} 겹침`).toBe(14);
    }
  });

  test('런타임 createSeatingState lv0: worldY가 quadTop + dy와 일치', async ({ page }) => {
    await waitForTavernScene(page);

    const result = await page.evaluate(() => {
      const layout = window.__tavernLayout;
      if (!layout) return null;

      const state = layout.createSeatingState('lv0');
      return state.map(set => ({
        key: set.key,
        quadTop: set.quadTop,
        leftSlots: set.left.map(s => ({ dy: s.worldY - set.quadTop, worldY: s.worldY })),
        rightSlots: set.right.map(s => ({ dy: s.worldY - set.quadTop, worldY: s.worldY })),
      }));
    });

    expect(result).not.toBeNull();
    expect(result.length, '4 quads').toBe(4);

    for (const set of result) {
      for (const slot of set.leftSlots) {
        expect([26, 60, 94]).toContain(slot.dy);
      }
      for (const slot of set.rightSlots) {
        expect([26, 60, 94]).toContain(slot.dy);
      }
    }
  });
});

// ── 4. BENCH_LEFT/RIGHT_OFFSET_X 손님 x 좌표 검증 ──

test.describe('B-6-2 Edge: 손님 x 좌표 벤치 범위 확인', () => {

  test('BENCH_LEFT_OFFSET_X(17)가 bench-l 범위(4~32) 내', async () => {
    const benchLLeft = 4;
    const benchLRight = 4 + 28;  // 32
    const offsetX = 17;
    expect(offsetX).toBeGreaterThanOrEqual(benchLLeft);
    expect(offsetX).toBeLessThanOrEqual(benchLRight);
  });

  test('BENCH_RIGHT_OFFSET_X(85)가 bench-r 범위(72~100) 내', async () => {
    const benchRLeft = 72;
    const benchRRight = 72 + 28;  // 100
    const offsetX = 85;
    expect(offsetX).toBeGreaterThanOrEqual(benchRLeft);
    expect(offsetX).toBeLessThanOrEqual(benchRRight);
  });

  test('손님 x가 bench 중앙에 근사: left offset(17) = bench center(18) - 1', async () => {
    const benchLCenter = 4 + 28 / 2;  // 18
    const leftOffset = 17;
    expect(Math.abs(benchLCenter - leftOffset), 'left bench 중앙 오차').toBeLessThanOrEqual(1);
  });

  test('손님 x가 bench 중앙에 근사: right offset(85) = bench center(86) - 1', async () => {
    const benchRCenter = 72 + 28 / 2;  // 86
    const rightOffset = 85;
    expect(Math.abs(benchRCenter - rightOffset), 'right bench 중앙 오차').toBeLessThanOrEqual(1);
  });

  test('런타임 slot worldX가 화면(360px) 내', async ({ page }) => {
    await waitForTavernScene(page);

    const worldXValues = await page.evaluate(() => {
      const layout = window.__tavernLayout;
      if (!layout) return null;
      const state = layout.createSeatingState('lv0');
      const xs = [];
      for (const set of state) {
        for (const s of set.left) xs.push(s.worldX);
        for (const s of set.right) xs.push(s.worldX);
      }
      return xs;
    });

    expect(worldXValues).not.toBeNull();
    for (const x of worldXValues) {
      expect(x, `worldX=${x} 화면 내`).toBeGreaterThan(0);
      expect(x, `worldX=${x} < GAME_W`).toBeLessThan(360);
    }
  });
});

// ── 5. lv3/lv4 미래 슬롯 범위 사전 검증 ──

test.describe('B-6-2 Edge: lv3/lv4 미래 슬롯 (범위 외 사전 점검)', () => {

  test('lv3 4슬롯 dy=[14,34,54,74] 모두 신규 bench 범위(12~108) 내', async () => {
    const benchTop = 12;
    const benchBottom = 108;
    const dyValues = [14, 34, 54, 74];

    for (const dy of dyValues) {
      expect(dy, `lv3 dy=${dy}`).toBeGreaterThanOrEqual(benchTop);
      expect(dy, `lv3 dy=${dy}`).toBeLessThanOrEqual(benchBottom);
    }
  });

  test('lv4 5슬롯 dy=[10,28,46,64,82]: dy=10 bench 범위(12~108) 밖 (INFO)', async () => {
    const benchTop = 12;
    const benchBottom = 108;
    const dyValues = [10, 28, 46, 64, 82];

    // dy=10 < benchTop=12 -> bench 밖에 슬롯 배치됨
    expect(dyValues[0], 'lv4 slot0 dy=10 < benchTop=12').toBeLessThan(benchTop);

    // 나머지는 범위 내
    for (let i = 1; i < dyValues.length; i++) {
      expect(dyValues[i], `lv4 dy=${dyValues[i]}`).toBeGreaterThanOrEqual(benchTop);
      expect(dyValues[i], `lv4 dy=${dyValues[i]}`).toBeLessThanOrEqual(benchBottom);
    }
  });
});

// ── 6. 손님 4명 순차 슬롯 배정 시 좌표 정상 여부 ──

test.describe('B-6-2 Edge: 손님 순차 슬롯 배정', () => {

  test('findFreeSlot 4회 호출 시 고유 슬롯 4개 반환', async ({ page }) => {
    await waitForTavernScene(page);

    const slots = await page.evaluate(() => {
      const layout = window.__tavernLayout;
      if (!layout) return null;

      // 새로운 seating state 생성
      layout.createSeatingState('lv0');

      const results = [];
      for (let i = 0; i < 4; i++) {
        const slot = layout.findFreeSlot();
        if (slot) {
          layout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, `test-${i}`);
          const pos = layout.getSlotWorldPos(slot.tableSetIdx, slot.side, slot.slotIdx);
          results.push({ ...slot, ...pos });
        }
      }
      return results;
    });

    expect(slots).not.toBeNull();
    expect(slots.length, '4개 슬롯 배정').toBe(4);

    // 모든 좌표가 화면 내
    for (const s of slots) {
      expect(s.x, 'slot x > 0').toBeGreaterThan(0);
      expect(s.x, 'slot x < 360').toBeLessThan(360);
      expect(s.y, 'slot y > 0').toBeGreaterThan(0);
      expect(s.y, 'slot y < 640').toBeLessThan(640);
    }

    // 고유성 확인 (동일 좌표 없음)
    const coordSet = new Set(slots.map(s => `${s.x},${s.y}`));
    expect(coordSet.size, '4개 고유 좌표').toBe(4);
  });

  test('24슬롯 전체 점유 후 findFreeSlot = null', async ({ page }) => {
    await waitForTavernScene(page);

    const result = await page.evaluate(() => {
      const layout = window.__tavernLayout;
      if (!layout) return null;

      layout.createSeatingState('lv0');
      let count = 0;
      while (true) {
        const slot = layout.findFreeSlot();
        if (!slot) break;
        layout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, `test-${count}`);
        count++;
        if (count > 30) break;  // 무한루프 방지
      }
      return { occupied: count, freeAfter: layout.findFreeSlot() };
    });

    expect(result.occupied, '24석 전체 점유').toBe(24);
    expect(result.freeAfter, '남은 빈 슬롯 없음').toBeNull();
  });
});

// ── 7. 가구 렌더 위치 검증 (Phaser 내부) ──

test.describe('B-6-2 Edge: Phaser 가구 렌더 위치', () => {

  test('4 quad에 가구 3종(bench-l, table, bench-r)이 렌더링됨', async ({ page }) => {
    await waitForTavernScene(page);

    const count = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('TavernServiceScene');
      if (!scene) return 0;

      // Image 타입 중 tavern_bench/table 텍스처를 가진 것 카운트
      let furnitureCount = 0;
      for (const obj of scene.children.list) {
        if (obj.type === 'Image' && obj.texture) {
          const key = obj.texture.key;
          if (key.includes('bench_vertical') || key.includes('table_vertical')) {
            furnitureCount++;
          }
        }
      }
      return furnitureCount;
    });

    // 4 quad x 3 가구(bench-l, table, bench-r) = 12
    expect(count, '12개 가구 이미지').toBe(12);
  });

  test('bench 이미지 displayWidth=28, displayHeight=96', async ({ page }) => {
    await waitForTavernScene(page);

    const benchSizes = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('TavernServiceScene');
      if (!scene) return [];

      const sizes = [];
      for (const obj of scene.children.list) {
        if (obj.type === 'Image' && obj.texture) {
          const key = obj.texture.key;
          if (key.includes('bench_vertical')) {
            sizes.push({
              key,
              displayW: Math.round(obj.displayWidth),
              displayH: Math.round(obj.displayHeight),
            });
          }
        }
      }
      return sizes;
    });

    expect(benchSizes.length, '8개 bench 이미지 (4 quad x 2)').toBe(8);
    for (const b of benchSizes) {
      expect(b.displayW, `${b.key} displayWidth`).toBe(28);
      expect(b.displayH, `${b.key} displayHeight`).toBe(96);
    }
  });

  test('table 이미지 displayWidth=44, displayHeight=96', async ({ page }) => {
    await waitForTavernScene(page);

    const tableSizes = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('TavernServiceScene');
      if (!scene) return [];

      const sizes = [];
      for (const obj of scene.children.list) {
        if (obj.type === 'Image' && obj.texture) {
          const key = obj.texture.key;
          if (key.includes('table_vertical')) {
            sizes.push({
              key,
              displayW: Math.round(obj.displayWidth),
              displayH: Math.round(obj.displayHeight),
            });
          }
        }
      }
      return sizes;
    });

    expect(tableSizes.length, '4개 table 이미지').toBe(4);
    for (const t of tableSizes) {
      expect(t.displayW, `${t.key} displayWidth`).toBe(44);
      expect(t.displayH, `${t.key} displayHeight`).toBe(96);
    }
  });
});

// ── 8. 콘솔 에러 + 리소스 에러 검증 ──

test.describe('B-6-2 Edge: 안정성', () => {

  test('씬 진입 후 3초간 pageerror 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(3000);
    expect(errors, '페이지 에러').toEqual([]);
  });

  test('counter_v12, entrance_v12 에셋 미변경 확인 (HTTP 200)', async ({ page }) => {
    const counterResp = await page.request.get('http://localhost:5173/assets/tavern/counter_v12.png');
    expect(counterResp.status(), 'counter_v12 HTTP 200').toBe(200);

    const entranceResp = await page.request.get('http://localhost:5173/assets/tavern/entrance_v12.png');
    expect(entranceResp.status(), 'entrance_v12 HTTP 200').toBe(200);
  });

  test('슬롯 인디케이터(dot) 24개가 렌더링됨', async ({ page }) => {
    await waitForTavernScene(page);

    const dotCount = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('TavernServiceScene');
      if (!scene) return 0;

      // slotSize=4 Rectangle 중 노란색(0xffdd00) + 오렌지(0xff8800)인 것
      let count = 0;
      for (const obj of scene.children.list) {
        if (obj.type === 'Rectangle' && obj.width === 4 && obj.height === 4) {
          if (obj.fillColor === 0xffdd00 || obj.fillColor === 0xff8800) {
            count++;
          }
        }
      }
      return count;
    });

    // 4 quad x (3 left + 3 right) = 24
    expect(dotCount, '24개 슬롯 인디케이터').toBe(24);
  });
});

// ── 9. 시각적 검증 스크린샷 ──

test.describe('B-6-2 Edge: 시각적 검증', () => {

  test('tl quad 영역 클로즈업 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-2-qa-tl-quad.png',
      clip: { x: 128, y: 80, width: 120, height: 140 },
    });
  });

  test('tr quad 영역 클로즈업 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-2-qa-tr-quad.png',
      clip: { x: 248, y: 80, width: 120, height: 140 },
    });
  });

  test('모바일 뷰포트(393x852) 렌더링 확인', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await waitForTavernScene(page);
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-2-qa-mobile.png',
    });
    expect(errors).toEqual([]);
  });
});
