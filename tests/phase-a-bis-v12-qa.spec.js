/**
 * @fileoverview Phase A-bis V12 마이그레이션 QA 전용 테스트.
 * 게이트 조건 + 능동적 엣지케이스 + 회귀 검증.
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
}

// ── 게이트 5: 24석 총원 (createSeatingState 호출 직접 검증) ──

test.describe('Gate: 24석 총원', () => {
  test('createSeatingState() 결과 4 quad x 6 슬롯 = 24석 확인', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      const total = state.reduce((acc, set) => acc + set.left.length + set.right.length, 0);
      return { quadCount: state.length, total };
    });
    expect(result.quadCount).toBe(4);
    expect(result.total).toBe(24);
  });
});

// ── 게이트 6: 4 quad 좌표 ──

test.describe('Gate: 4 quad 좌표', () => {
  test('TABLE_SET_ANCHORS 4 엔트리 (tl/tr/bl/br) 확인', async ({ page }) => {
    await waitForTavernScene(page);
    const anchors = await page.evaluate(() => window.__tavernLayout.TABLE_SET_ANCHORS);
    expect(anchors).toHaveLength(4);
    expect(anchors.map(a => a.key)).toEqual(['tl', 'tr', 'bl', 'br']);
  });
});

// ── 게이트 7: 세로 통로 20px ──

test.describe('Gate: 세로 통로 20px', () => {
  test('quad.tl right(230) ~ quad.tr left(250) = 20px', async ({ page }) => {
    await waitForTavernScene(page);
    const gap = await page.evaluate(() => {
      const a = window.__tavernLayout.TABLE_SET_ANCHORS;
      const tl = a.find(q => q.key === 'tl');
      const tr = a.find(q => q.key === 'tr');
      return tr.quadLeft - (tl.quadLeft + 100);
    });
    expect(gap).toBe(20);
  });
});

// ── 게이트 8: 가로 통로 40px ──

test.describe('Gate: 가로 통로 40px', () => {
  test('quad.tl bottom(210) ~ quad.bl top(250) = 40px', async ({ page }) => {
    await waitForTavernScene(page);
    const gap = await page.evaluate(() => {
      const a = window.__tavernLayout.TABLE_SET_ANCHORS;
      const tl = a.find(q => q.key === 'tl');
      const bl = a.find(q => q.key === 'bl');
      return bl.quadTop - (tl.quadTop + 120);
    });
    expect(gap).toBe(40);
  });
});

// ── 게이트 9: 카운터 V12 (40x100, top=90, left=80) ──

test.describe('Gate: 카운터 V12', () => {
  test('COUNTER_ANCHOR 좌표 및 크기 확인', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      // tavernLayoutData에서 export된 값이 window.__tavernLayout에는 없으므로
      // 소스에서 직접 확인하는 대신 씬 렌더링을 통해 간접 검증
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // COUNTER_ANCHOR 상수는 TavernServiceScene의 import로 가져옴
      // 런타임에서 카운터 사각형을 찾아 좌표 확인
      const children = scene.children.list;
      // 카운터는 counter_v12 텍스처 또는 갈색 사각형
      // _placeImageOrRect로 배치됨: x=COUNTER_ANCHOR.x - COUNTER_W/2 = 100-20=80, y=90
      // Image인 경우 origin(0,0) 기준이므로 x=80, y=90
      for (const child of children) {
        if (child.texture && child.texture.key === 'tavern_dummy_counter_v12') {
          return {
            x: child.x,
            y: child.y,
            displayWidth: child.displayWidth,
            displayHeight: child.displayHeight,
          };
        }
      }
      return null;
    });
    expect(result).not.toBeNull();
    expect(result.x).toBe(80);       // left = 80
    expect(result.y).toBe(90);       // top = 90
    expect(result.displayWidth).toBe(40);
    expect(result.displayHeight).toBe(100);
  });
});

// ── 게이트 10: 셰프 2명 (top=100, top=148) ──

test.describe('Gate: 셰프 2명', () => {
  test('셰프 2명이 배치되고 y좌표가 100, 148이다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._chefs.map(c => ({
        y: c.anchor.y,
        x: c.anchor.x,
      }));
    });
    expect(result).toHaveLength(2);
    expect(result[0].y).toBe(100);
    expect(result[1].y).toBe(148);
    // 카운터 범위(top=90, height=100 -> 90~190) 내에 있는지
    for (const chef of result) {
      expect(chef.y).toBeGreaterThanOrEqual(90);
      expect(chef.y).toBeLessThanOrEqual(190);
    }
  });

  test('셰프-0만 인터랙티브, 셰프-1은 비인터랙티브', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        chef0Interactive: scene._chefs[0].sprite.input !== null && scene._chefs[0].sprite.input !== undefined,
        chef1Interactive: scene._chefs[1].sprite.input !== null && scene._chefs[1].sprite.input !== undefined,
      };
    });
    expect(result.chef0Interactive).toBe(true);
    expect(result.chef1Interactive).toBe(false);
  });
});

// ── 게이트 11: 입구 ──

test.describe('Gate: 입구', () => {
  test('entrance_v12 등록 + 좌하단 배치 (DOOR_ANCHOR x=60, y=480)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      for (const child of children) {
        if (child.texture && child.texture.key === 'tavern_dummy_entrance_v12') {
          return {
            x: child.x,
            y: child.y,
            displayWidth: child.displayWidth,
            displayHeight: child.displayHeight,
          };
        }
      }
      return null;
    });
    expect(result).not.toBeNull();
    // left = DOOR_ANCHOR.x - 16 = 60 - 16 = 44
    expect(result.x).toBe(44);
    expect(result.y).toBe(480);
    expect(result.displayWidth).toBe(32);
    expect(result.displayHeight).toBe(40);
  });
});

// ── 게이트 12: V12 placeholder 5종 존재 ──

test.describe('Gate: V12 placeholder 5종', () => {
  const assets = [
    'counter_v12',
    'table_vertical_v12',
    'bench_vertical_l_v12',
    'bench_vertical_r_v12',
    'entrance_v12',
  ];

  for (const name of assets) {
    test(`assets/tavern_dummy/${name}.png HTTP 200 확인`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern_dummy/${name}.png`);
      expect(response.status()).toBe(200);
    });
  }

  test('씬 preload에서 V12 텍스처 5종 로드 성공', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const keys = [
        'tavern_dummy_counter_v12',
        'tavern_dummy_table_vertical_v12',
        'tavern_dummy_bench_vertical_l_v12',
        'tavern_dummy_bench_vertical_r_v12',
        'tavern_dummy_entrance_v12',
      ];
      return keys.map(k => ({ key: k, exists: scene.textures.exists(k) }));
    });
    for (const r of result) {
      expect(r.exists, `텍스처 ${r.key} 로드 실패`).toBe(true);
    }
  });
});

// ── 능동적 엣지케이스 ──

test.describe('능동적 엣지케이스', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    const consoleWarnings = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleWarnings.push(msg.text());
    });
    await waitForTavernScene(page);
    // 렌더링 안정화
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
    // Phaser 경고 중 scaleY/flipY 관련 없는지 확인
    for (const w of consoleWarnings) {
      expect(w).not.toContain('scaleY');
      expect(w).not.toContain('flipY');
    }
  });

  test('BENCH_SLOTS lv0(3슬롯)/lv3(4슬롯)/lv4(5슬롯) 레벨별 슬롯 수 확인', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const cs = window.__tavernLayout.createSeatingState;
      const lv0 = cs('lv0');
      const lv3 = cs('lv3');
      const lv4 = cs('lv4');
      const count = (state) => state.reduce((a, s) => a + s.left.length + s.right.length, 0);
      // 복원: lv0으로 재설정
      cs('lv0');
      return {
        lv0: count(lv0),
        lv3: count(lv3),
        lv4: count(lv4),
        lv0PerQuad: lv0[0].left.length + lv0[0].right.length,
        lv3PerQuad: lv3[0].left.length + lv3[0].right.length,
        lv4PerQuad: lv4[0].left.length + lv4[0].right.length,
      };
    });
    expect(result.lv0).toBe(24);     // 4 * (3+3) = 24
    expect(result.lv3).toBe(32);     // 4 * (4+4) = 32
    expect(result.lv4).toBe(40);     // 4 * (5+5) = 40
    expect(result.lv0PerQuad).toBe(6);
    expect(result.lv3PerQuad).toBe(8);
    expect(result.lv4PerQuad).toBe(10);
  });

  test('findFreeSlot()이 left/right 모두 탐색한다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const { occupySlot, findFreeSlot, vacateSlot, createSeatingState } = window.__tavernLayout;
      // 리셋
      createSeatingState('lv0');
      // quad 0의 left 3슬롯 모두 점유
      for (let s = 0; s < 3; s++) {
        occupySlot(0, 'left', s, `fill-left-${s}`);
      }
      // findFreeSlot은 quad 0의 right를 찾아야 함
      const free = findFreeSlot();
      // 정리
      for (let s = 0; s < 3; s++) {
        vacateSlot(0, 'left', s);
      }
      return free;
    });
    expect(result).not.toBeNull();
    expect(result.tableSetIdx).toBe(0);
    expect(result.side).toBe('right');
    expect(result.slotIdx).toBe(0);
  });

  test('getSlotWorldPos() 4 quad x 6 슬롯 = 24개 좌표 모두 정수 픽셀', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const { getSlotWorldPos, createSeatingState } = window.__tavernLayout;
      createSeatingState('lv0');
      const coords = [];
      for (let q = 0; q < 4; q++) {
        for (const side of ['left', 'right']) {
          for (let s = 0; s < 3; s++) {
            const pos = getSlotWorldPos(q, side, s);
            coords.push({
              quad: q, side, slot: s,
              x: pos.x, y: pos.y,
              xIsInt: Number.isInteger(pos.x),
              yIsInt: Number.isInteger(pos.y),
            });
          }
        }
      }
      return coords;
    });
    expect(result).toHaveLength(24);
    for (const coord of result) {
      expect(coord.xIsInt, `quad=${coord.quad} side=${coord.side} slot=${coord.slot} x=${coord.x} 정수 아님`).toBe(true);
      expect(coord.yIsInt, `quad=${coord.quad} side=${coord.side} slot=${coord.slot} y=${coord.y} 정수 아님`).toBe(true);
    }
  });

  test('createSeatingState에 잘못된 benchLevel 전달 시 빈 배열 반환', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const cs = window.__tavernLayout.createSeatingState;
      const bad = cs('lv99');
      // 복원
      cs('lv0');
      return { length: bad.length, isArray: Array.isArray(bad) };
    });
    expect(result.isArray).toBe(true);
    expect(result.length).toBe(0);
  });
});

// ── 회귀 테스트 ──

test.describe('회귀: ChefState/CustomerState enum 무변경', () => {
  test('ChefState 7개 값 동일', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => Object.values(window.__ChefState));
    expect(states).toHaveLength(7);
    expect(states.sort()).toEqual(
      ['idle_side', 'walk_l', 'walk_r', 'cook', 'carry_l', 'carry_r', 'serve'].sort()
    );
  });

  test('CustomerState 7개 값 동일', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => Object.values(window.__CustomerState));
    expect(states).toHaveLength(7);
    expect(states.sort()).toEqual(
      ['enter', 'queue', 'sit_down', 'sit_up', 'eat_down', 'eat_up', 'leave'].sort()
    );
  });
});

test.describe('회귀: main.js 씬 등록 변경 0건', () => {
  test('TavernServiceScene이 main.js에 등록되어 있다', async ({ page }) => {
    const response = await page.request.get('http://localhost:5173/js/main.js');
    const source = await response.text();
    expect(source).toContain('TavernServiceScene');
    // ServiceScene도 등록 유지 확인
    expect(source).toContain('ServiceScene');
  });
});

test.describe('회귀: DevHelper ?scene=tavern 처리', () => {
  test('?scene=tavern으로 TavernServiceScene 진입 가능', async ({ page }) => {
    await waitForTavernScene(page);
    const isActive = await page.evaluate(() => {
      return window.__game.scene.isActive('TavernServiceScene');
    });
    expect(isActive).toBe(true);
  });
});

// ── 스크린샷 ──

test.describe('QA 스크린샷', () => {
  test('V12 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/v12-qa-full-layout.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });

  test('V12 카운터+셰프 영역 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/v12-qa-counter-chef.png',
      clip: { x: 0, y: 60, width: 130, height: 200 },
    });
  });

  test('V12 입구 영역 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/v12-qa-entrance.png',
      clip: { x: 20, y: 460, width: 100, height: 80 },
    });
  });

  test('V12 하단 quad 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/v12-qa-bottom-quads.png',
      clip: { x: 120, y: 240, width: 240, height: 140 },
    });
  });
});
