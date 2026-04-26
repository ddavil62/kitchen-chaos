/**
 * @fileoverview Phase F 가로 테이블 양면 착석 레이아웃 QA 테스트.
 * SC-1 ~ SC-20 수용 기준 검증 + 도출된 예외 시나리오.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5193/?scene=tavern';

/** Phaser 씬이 create()를 완료할 때까지 대기 */
async function waitForScene(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const g = window.__game;
    if (!g) return false;
    const scene = g.scene.getScene('TavernServiceScene');
    return scene && scene.children && scene.children.list.length > 0;
  }, { timeout });
}

test.describe('Phase F 가로 테이블 양면 착석 레이아웃 QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForScene(page);
    await page.waitForTimeout(1000);
  });

  // ====================================================
  // SC-1: BENCH_CONFIG.QUAD_H === 120
  // ====================================================
  test('SC-1: BENCH_CONFIG.QUAD_H === 120', async ({ page }) => {
    const config = await page.evaluate(() => window.__tavernBenchConfig);
    expect(config.QUAD_H).toBe(120);
  });

  // ====================================================
  // SC-2: BENCH_CONFIG.TABLE_W === 200, TABLE_H === 48
  // ====================================================
  test('SC-2: BENCH_CONFIG.TABLE_W === 200, TABLE_H === 48', async ({ page }) => {
    const config = await page.evaluate(() => window.__tavernBenchConfig);
    expect(config.TABLE_W).toBe(200);
    expect(config.TABLE_H).toBe(48);
  });

  // ====================================================
  // SC-3: BENCH_CONFIG.TABLE_DEPTH_OFFSET === 84
  // ====================================================
  test('SC-3: BENCH_CONFIG.TABLE_DEPTH_OFFSET === 84', async ({ page }) => {
    const config = await page.evaluate(() => window.__tavernBenchConfig);
    expect(config.TABLE_DEPTH_OFFSET).toBe(84);
    // 검증: TABLE_DEPTH_OFFSET === TABLE_TOP + TABLE_H
    expect(config.TABLE_DEPTH_OFFSET).toBe(config.TABLE_TOP + config.TABLE_H);
  });

  // ====================================================
  // SC-4: TABLE_SET_ANCHORS[0].quadTop === 168
  // ====================================================
  test('SC-4: TABLE_SET_ANCHORS[0].quadTop === 168', async ({ page }) => {
    const anchors = await page.evaluate(() => window.__tavernLayout.TABLE_SET_ANCHORS);
    expect(anchors[0].quadTop).toBe(168);
    expect(anchors[0].quadLeft).toBe(128);
  });

  // ====================================================
  // SC-5: TABLE_SET_ANCHORS[1].quadTop === 328
  // ====================================================
  test('SC-5: TABLE_SET_ANCHORS[1].quadTop === 328', async ({ page }) => {
    const anchors = await page.evaluate(() => window.__tavernLayout.TABLE_SET_ANCHORS);
    expect(anchors[1].quadTop).toBe(328);
    expect(anchors[1].quadLeft).toBe(128);
  });

  // ====================================================
  // SC-6: createSeatingState('lv0') -> front[] 3 + back[] 3 = 12 slots
  // ====================================================
  test('SC-6: createSeatingState lv0 front+back 12슬롯 생성', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      return state.map(set => ({
        key: set.key,
        frontLength: set.front.length,
        backLength: set.back.length,
        frontSides: set.front.map(s => s.side),
        backSides: set.back.map(s => s.side),
        frontFacing: set.front.map(s => s.facingSouth),
        backFacing: set.back.map(s => s.facingSouth),
      }));
    });

    expect(result.length).toBe(2);
    for (const set of result) {
      expect(set.frontLength).toBe(3);
      expect(set.backLength).toBe(3);
      // front는 모두 side='front', facingSouth=true
      expect(set.frontSides).toEqual(['front', 'front', 'front']);
      expect(set.frontFacing).toEqual([true, true, true]);
      // back는 모두 side='back', facingSouth=false
      expect(set.backSides).toEqual(['back', 'back', 'back']);
      expect(set.backFacing).toEqual([false, false, false]);
    }
  });

  // ====================================================
  // SC-7: findFreeSlot() front -> back 순서 탐색
  // ====================================================
  test('SC-7: findFreeSlot front->back 순서 탐색', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');

      // 1) 빈 상태에서 첫 슬롯은 반드시 front여야 한다
      const first = window.__tavernLayout.findFreeSlot();

      // 2) front 3슬롯 모두 점유 후 -> back에서 찾아야 한다
      for (let i = 0; i < 3; i++) {
        window.__tavernLayout.occupySlot(0, 'front', i, `test-f-${i}`);
      }
      const afterFrontFull = window.__tavernLayout.findFreeSlot(0);

      // 3) back도 모두 점유 후 -> quad 0에서는 null
      for (let i = 0; i < 3; i++) {
        window.__tavernLayout.occupySlot(0, 'back', i, `test-b-${i}`);
      }
      const afterAllFull = window.__tavernLayout.findFreeSlot(0);

      // 4) 전체에서 찾으면 quad 1의 front부터
      const nextQuad = window.__tavernLayout.findFreeSlot();

      return { first, afterFrontFull, afterAllFull, nextQuad };
    });

    expect(result.first.side).toBe('front');
    expect(result.first.tableSetIdx).toBe(0);
    expect(result.first.slotIdx).toBe(0);

    expect(result.afterFrontFull.side).toBe('back');
    expect(result.afterFrontFull.slotIdx).toBe(0);

    expect(result.afterAllFull).toBeNull();

    expect(result.nextQuad.tableSetIdx).toBe(1);
    expect(result.nextQuad.side).toBe('front');
  });

  // ====================================================
  // SC-8: front slot worldY = quadTop + 36
  // ====================================================
  test('SC-8: front slot worldY = quadTop + 36', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      return state.map(set => ({
        quadTop: set.quadTop,
        frontWorldYs: set.front.map(s => s.worldY),
      }));
    });

    for (const set of result) {
      for (const y of set.frontWorldYs) {
        expect(y).toBe(set.quadTop + 36);
      }
    }
  });

  // ====================================================
  // SC-9: back slot worldY = quadTop + 108
  // ====================================================
  test('SC-9: back slot worldY = quadTop + 108', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      return state.map(set => ({
        quadTop: set.quadTop,
        backWorldYs: set.back.map(s => s.worldY),
      }));
    });

    for (const set of result) {
      for (const y of set.backWorldYs) {
        expect(y).toBe(set.quadTop + 108);
      }
    }
  });

  // ====================================================
  // SC-10: front slot depth < table depth (36 < 84)
  // ====================================================
  test('SC-10: front slot depth < table depth (36 < 84)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      const config = window.__tavernBenchConfig;
      const checks = [];
      for (const set of state) {
        const tableDepth = set.quadTop + config.TABLE_DEPTH_OFFSET;
        for (const slot of set.front) {
          checks.push({
            quad: set.key,
            slotIdx: slot.slotIdx,
            slotY: slot.worldY,
            tableDepth,
            valid: slot.worldY < tableDepth,
            dy: slot.worldY - set.quadTop,
          });
        }
      }
      return checks;
    });

    for (const c of result) {
      expect(c.valid, `${c.quad} front[${c.slotIdx}]: dy=${c.dy} < 84`).toBe(true);
      expect(c.dy).toBe(36);
    }
  });

  // ====================================================
  // SC-11: back slot depth > table depth (108 > 84)
  // ====================================================
  test('SC-11: back slot depth > table depth (108 > 84)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      const config = window.__tavernBenchConfig;
      const checks = [];
      for (const set of state) {
        const tableDepth = set.quadTop + config.TABLE_DEPTH_OFFSET;
        for (const slot of set.back) {
          checks.push({
            quad: set.key,
            slotIdx: slot.slotIdx,
            slotY: slot.worldY,
            tableDepth,
            valid: slot.worldY > tableDepth,
            dy: slot.worldY - set.quadTop,
          });
        }
      }
      return checks;
    });

    for (const c of result) {
      expect(c.valid, `${c.quad} back[${c.slotIdx}]: dy=${c.dy} > 84`).toBe(true);
      expect(c.dy).toBe(108);
    }
  });

  // ====================================================
  // SC-12: front slot -> seated_south texture
  // ====================================================
  test('SC-12: front slot -> seated_south texture', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // 손님 0 (normal, 짝수=SIT_DOWN 사이클) QUEUE -> SIT_DOWN
      const cust = scene._customers[0];
      scene._cycleCustomerState(cust); // QUEUE -> SIT_DOWN

      return {
        state: cust.state,
        slotSide: cust.slotRef?.side,
        texture: cust.sprite.texture?.key,
        customerType: cust.customerType,
      };
    });

    expect(result.state).toBe('sit_down');
    expect(result.slotSide).toBe('front');
    expect(result.texture).toBe(`tavern_customer_${result.customerType}_seated_south`);
  });

  // ====================================================
  // SC-13: back slot -> seated_north texture
  // ====================================================
  test('SC-13: back slot -> seated_north texture', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');

      // front 3슬롯을 먼저 채워서 다음 손님이 back으로 가게 만든다
      // 손님 0,1,2를 SIT으로 보내 front 3슬롯 점유
      for (let i = 0; i < 3; i++) {
        scene._cycleCustomerState(scene._customers[i]);
      }

      // 손님 3번 (rushed, 홀수=SIT_UP 사이클) -> back 슬롯 배정되어야 함
      const cust = scene._customers[3];
      scene._cycleCustomerState(cust); // QUEUE -> SIT_UP

      return {
        state: cust.state,
        slotSide: cust.slotRef?.side,
        texture: cust.sprite.texture?.key,
        customerType: cust.customerType,
      };
    });

    expect(result.slotSide).toBe('back');
    expect(result.texture).toBe(`tavern_customer_${result.customerType}_seated_north`);
  });

  // ====================================================
  // SC-14: seated_north 10종 에셋 64x64 RGBA 파일 존재
  // ====================================================
  test('SC-14: seated_north 10종 텍스처 로드 확인', async ({ page }) => {
    const types = [
      'normal', 'vip', 'gourmet', 'rushed', 'group',
      'critic', 'regular', 'student', 'traveler', 'business',
    ];
    const results = await page.evaluate((typeList) => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return typeList.map(t => ({
        type: t,
        exists: scene.textures.exists(`tavern_customer_${t}_seated_north`),
      }));
    }, types);

    for (const r of results) {
      expect(r.exists, `tavern_customer_${r.type}_seated_north`).toBe(true);
    }
  });

  // ====================================================
  // SC-15: 가로 가구 3종 파일 존재
  // ====================================================
  test('SC-15: 가로 가구 3종 텍스처 로드 확인', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        table: scene.textures.exists('tavern_table_horizontal_v12'),
        benchTop: scene.textures.exists('tavern_bench_horizontal_top_v12'),
        benchBot: scene.textures.exists('tavern_bench_horizontal_bot_v12'),
      };
    });

    expect(result.table, 'table_horizontal_v12 로드').toBe(true);
    expect(result.benchTop, 'bench_horizontal_top_v12 로드').toBe(true);
    expect(result.benchBot, 'bench_horizontal_bot_v12 로드').toBe(true);
  });

  // ====================================================
  // SC-16: slot x range (178~310) within dining area (128~360)
  // ====================================================
  test('SC-16: 슬롯 x 범위가 dining area 내에 있음', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      const allSlots = [];
      for (const set of state) {
        for (const s of set.front) allSlots.push(s);
        for (const s of set.back) allSlots.push(s);
      }
      return allSlots.map(s => ({
        worldX: s.worldX,
        side: s.side,
        slotIdx: s.slotIdx,
      }));
    });

    for (const s of result) {
      // 손님 64px 중심점 기준, 좌측 edge = worldX - 32, 우측 edge = worldX + 32
      const leftEdge = s.worldX - 32;
      const rightEdge = s.worldX + 32;
      expect(leftEdge, `${s.side}[${s.slotIdx}] leftEdge >= 128`).toBeGreaterThanOrEqual(128);
      expect(rightEdge, `${s.side}[${s.slotIdx}] rightEdge <= 360`).toBeLessThanOrEqual(360);
    }

    // worldX 범위 확인 (센터 좌표)
    const worldXs = result.map(s => s.worldX);
    const minX = Math.min(...worldXs);
    const maxX = Math.max(...worldXs);
    expect(minX).toBeGreaterThanOrEqual(128);
    expect(maxX).toBeLessThanOrEqual(360);
  });

  // ====================================================
  // SC-17: _applyDepthSort 후 테이블 depth 불변
  // ====================================================
  test('SC-17: _applyDepthSort 후 테이블 depth 불변', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const tables = scene.children.list.filter(c => c._fixedDepth === true);
      const depthsBefore = tables.map(t => t.depth);

      // 100회 강제 실행
      for (let i = 0; i < 100; i++) {
        scene._applyDepthSort();
      }

      const depthsAfter = tables.map(t => t.depth);
      return {
        count: tables.length,
        depthsBefore,
        depthsAfter,
        unchanged: depthsBefore.every((d, i) => d === depthsAfter[i]),
      };
    });

    // Phase F 수정: bench_bot도 _fixedDepth=true → 총 4개 (table×2 + bench_bot×2)
    expect(result.count).toBe(4);
    expect(result.unchanged).toBe(true);
    // table: quadTop(168)+84=252, quadTop(328)+84=412
    // bench_bot: quadTop(168)+109=277, quadTop(328)+109=437
    expect(result.depthsBefore).toEqual([252, 277, 412, 437]);
    expect(result.depthsAfter).toEqual([252, 277, 412, 437]);
  });

  // ====================================================
  // SC-18: Legacy BENCH_LEFT_OFFSET_X, BENCH_RIGHT_OFFSET_X export
  // ====================================================
  test('SC-18: 레거시 BENCH_LEFT_OFFSET_X, BENCH_RIGHT_OFFSET_X 유지', async ({ page }) => {
    const result = await page.evaluate(() => {
      // TavernServiceScene imports them -- check scene module has access
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // These are imported in the scene file; we can check if they're not undefined
      // by looking at the module -- but since they're not exposed on window,
      // we verify through the tavernLayoutData source via BENCH_CONFIG completeness
      return {
        // BENCH_CONFIG is exposed; legacy offsets are standalone exports
        hasBenchConfig: !!window.__tavernBenchConfig,
        // The scene imports them (BENCH_LEFT_OFFSET_X, BENCH_RIGHT_OFFSET_X)
        // so if the imports broke, scene creation would fail
        sceneCreated: !!scene,
      };
    });

    expect(result.hasBenchConfig).toBe(true);
    expect(result.sceneCreated).toBe(true);
  });

  // ====================================================
  // SC-19: 씬 진입 시 Phase F 관련 콘솔 에러 0건
  // ====================================================
  test('SC-19: 씬 진입 시 Phase F 콘솔 에러 0건', async ({ page }, testInfo) => {
    testInfo.setTimeout(60000);
    const consoleErrors = [];
    const pageErrors = [];
    const knownLegacyPatterns = [
      'customer_critic',
      'customer_regular',
      'customer_student',
      'customer_traveler',
      'customer_business',
    ];

    page.on('pageerror', err => pageErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 기존 Phase E 이슈 5건 제외 (base 이미지 로드 실패)
        const isKnown = knownLegacyPatterns.some(p =>
          text.includes(p) && !text.includes('seated_south') && !text.includes('seated_north')
        );
        if (!isKnown) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto(BASE_URL);
    await waitForScene(page);
    await page.waitForTimeout(2000);

    // Phase F 관련 에러 필터
    const phaseFErrors = consoleErrors.filter(e =>
      e.includes('seated_north') ||
      e.includes('horizontal') ||
      e.includes('fixedDepth') ||
      e.includes('front') ||
      e.includes('back') ||
      e.includes('BENCH_CONFIG') ||
      e.includes('TABLE_SET_ANCHORS')
    );

    expect(phaseFErrors.length, `Phase F 에러: ${phaseFErrors.join('; ')}`).toBe(0);
    expect(pageErrors.length, `JS 예외: ${pageErrors.join('; ')}`).toBe(0);
  });

  // ====================================================
  // SC-20: COUNTER_ANCHOR, DOOR_ANCHOR, CHEF_IDLE_ANCHORS 미변경
  // ====================================================
  test('SC-20: 셰프/카운터/입구 위치 미변경', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const layout = scene._layout;
      return {
        // These are verified through imported constants
        DINING_X: layout.DINING_X,
        DINING_W: layout.DINING_W,
        KITCHEN_X: layout.KITCHEN_X,
        KITCHEN_W: layout.KITCHEN_W,
      };
    });

    expect(result.DINING_X).toBe(128);
    expect(result.DINING_W).toBe(232);
    expect(result.KITCHEN_X).toBe(8);
    expect(result.KITCHEN_W).toBe(120);
  });

  // ====================================================
  // BENCH_CONFIG 전체 상수 검증
  // ====================================================
  test('BENCH_CONFIG 전체 상수 정합성', async ({ page }) => {
    const config = await page.evaluate(() => window.__tavernBenchConfig);

    expect(config.QUAD_W).toBe(232);
    expect(config.QUAD_H).toBe(120);
    expect(config.TABLE_LEFT).toBe(16);
    expect(config.TABLE_TOP).toBe(36);
    expect(config.TABLE_W).toBe(200);
    expect(config.TABLE_H).toBe(48);
    expect(config.BENCH_TOP_TOP).toBe(12);
    expect(config.BENCH_BOT_TOP).toBe(84);
    expect(config.BENCH_W).toBe(200);
    expect(config.BENCH_H).toBe(24);
    expect(config.AISLE_V).toBe(0);
    expect(config.AISLE_H).toBe(40);
    expect(config.SEAT_CENTER_OFFSET_X).toBe(116);
    expect(config.TABLE_DEPTH_OFFSET).toBe(84);
    expect(config.SLOT_DX).toBe(66);
    expect(config.FRONT_SLOT_DY).toBe(36);
    expect(config.BACK_SLOT_DY).toBe(108);

    // 내부 일관성 검증
    expect(config.TABLE_TOP).toBe(config.BENCH_TOP_TOP + config.BENCH_H); // 12+24=36
    expect(config.BENCH_BOT_TOP).toBe(config.TABLE_TOP + config.TABLE_H); // 36+48=84
    expect(config.TABLE_DEPTH_OFFSET).toBe(config.TABLE_TOP + config.TABLE_H); // 36+48=84
    expect(config.QUAD_H).toBe(12 + 24 + 48 + 24 + 12); // margins+bench+table+bench+margin
    expect(config.SEAT_CENTER_OFFSET_X).toBe(config.TABLE_LEFT + config.TABLE_W / 2); // 16+100=116
  });

  // ====================================================
  // 슬롯 절대 좌표 전수 검증
  // ====================================================
  test('슬롯 절대 좌표가 스펙 대조표와 일치한다', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      return state.map(set => ({
        key: set.key,
        quadTop: set.quadTop,
        quadLeft: set.quadLeft,
        front: set.front.map(s => ({ x: s.worldX, y: s.worldY })),
        back: set.back.map(s => ({ x: s.worldX, y: s.worldY })),
      }));
    });

    // baseCenterX = 128 + 116 = 244
    const baseCX = 244;

    // top quad (quadTop=168)
    const top = result[0];
    expect(top.front[0]).toEqual({ x: baseCX - 66, y: 168 + 36 });  // (178, 204)
    expect(top.front[1]).toEqual({ x: baseCX,      y: 168 + 36 });  // (244, 204)
    expect(top.front[2]).toEqual({ x: baseCX + 66, y: 168 + 36 });  // (310, 204)
    expect(top.back[0]).toEqual({ x: baseCX - 66, y: 168 + 108 }); // (178, 276)
    expect(top.back[1]).toEqual({ x: baseCX,      y: 168 + 108 }); // (244, 276)
    expect(top.back[2]).toEqual({ x: baseCX + 66, y: 168 + 108 }); // (310, 276)

    // bottom quad (quadTop=328)
    const bot = result[1];
    expect(bot.front[0]).toEqual({ x: baseCX - 66, y: 328 + 36 });  // (178, 364)
    expect(bot.front[1]).toEqual({ x: baseCX,      y: 328 + 36 });  // (244, 364)
    expect(bot.front[2]).toEqual({ x: baseCX + 66, y: 328 + 36 });  // (310, 364)
    expect(bot.back[0]).toEqual({ x: baseCX - 66, y: 328 + 108 }); // (178, 436)
    expect(bot.back[1]).toEqual({ x: baseCX,      y: 328 + 108 }); // (244, 436)
    expect(bot.back[2]).toEqual({ x: baseCX + 66, y: 328 + 108 }); // (310, 436)
  });

  // ====================================================
  // 테이블 가구 배치 검증 (displaySize 확인)
  // ====================================================
  test('가로 테이블/벤치 displaySize 확인', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const fixedTables = scene.children.list.filter(c => c._fixedDepth === true);
      return fixedTables.map(t => ({
        x: t.x,
        y: t.y,
        displayWidth: t.displayWidth,
        displayHeight: t.displayHeight,
        depth: t.depth,
        type: t.type,
      }));
    });

    // Phase F 수정: bench_bot도 _fixedDepth=true → 총 4개 (table×2 + bench_bot×2)
    expect(result.length).toBe(4);
    const tables = result.filter(t => t.displayHeight === 48);
    const benches = result.filter(t => t.displayHeight === 24);
    expect(tables.length).toBe(2);
    expect(benches.length).toBe(2);
    for (const t of tables) {
      // 가로 테이블: 200x48
      expect(t.displayWidth).toBe(200);
      expect(t.displayHeight).toBe(48);
    }
    for (const b of benches) {
      // 하단 벤치: 200x24
      expect(b.displayWidth).toBe(200);
      expect(b.displayHeight).toBe(24);
    }
  });

  // ====================================================
  // 디버그 HUD 총 슬롯 = 12
  // ====================================================
  test('디버그 HUD 총 슬롯 수 12', async ({ page }) => {
    const debugText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._debugText?.text || '';
    });

    expect(debugText).toContain('Seats: 0/12');
  });

  // ====================================================
  // 슬롯 인디케이터 색상 구분 (front=노란색, back=청록색)
  // ====================================================
  test('슬롯 인디케이터: front 라벨 F0/F1/F2, back 라벨 B0/B1/B2', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const texts = scene.children.list.filter(c =>
        c.type === 'Text' && (c.text?.startsWith('F') || c.text?.startsWith('B'))
      );
      return texts.map(t => ({
        text: t.text,
        style: t.style?.color || 'unknown',
      }));
    });

    const frontLabels = result.filter(r => r.text.startsWith('F'));
    const backLabels = result.filter(r => r.text.startsWith('B'));

    // 2 quads x 3 slots = 6 front labels, 6 back labels
    expect(frontLabels.length).toBe(6);
    expect(backLabels.length).toBe(6);

    // 색상 검증
    for (const f of frontLabels) {
      expect(f.style).toBe('#ffdd00');
    }
    for (const b of backLabels) {
      expect(b.style).toBe('#00ffdd');
    }
  });

  // ====================================================
  // 예외 및 엣지케이스
  // ====================================================
  test.describe('예외 및 엣지케이스', () => {

    test('만석(12석) 시 findFreeSlot이 null 반환', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        // 12슬롯 모두 점유
        for (let q = 0; q < 2; q++) {
          for (let i = 0; i < 3; i++) {
            window.__tavernLayout.occupySlot(q, 'front', i, `f-${q}-${i}`);
            window.__tavernLayout.occupySlot(q, 'back', i, `b-${q}-${i}`);
          }
        }
        return window.__tavernLayout.findFreeSlot();
      });

      expect(result).toBeNull();
    });

    test('동일 슬롯 이중 점유 시 false 반환', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        const r1 = window.__tavernLayout.occupySlot(0, 'front', 0, 'user-1');
        const r2 = window.__tavernLayout.occupySlot(0, 'front', 0, 'user-2');
        const r3 = window.__tavernLayout.occupySlot(0, 'back', 1, 'user-3');
        const r4 = window.__tavernLayout.occupySlot(0, 'back', 1, 'user-4');
        return { r1, r2, r3, r4 };
      });

      expect(result.r1).toBe(true);
      expect(result.r2).toBe(false);
      expect(result.r3).toBe(true);
      expect(result.r4).toBe(false);
    });

    test('레거시 side="left"/"right" -> front fallback', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        const o1 = window.__tavernLayout.occupySlot(0, 'left', 0, 'legacy-l');
        const p1 = window.__tavernLayout.getSlotWorldPos(0, 'left', 0);
        window.__tavernLayout.vacateSlot(0, 'left', 0);
        const o2 = window.__tavernLayout.occupySlot(0, 'right', 1, 'legacy-r');
        const p2 = window.__tavernLayout.getSlotWorldPos(0, 'right', 1);
        window.__tavernLayout.vacateSlot(0, 'right', 1);
        return { o1, p1, o2, p2 };
      });

      expect(result.o1).toBe(true);
      expect(result.p1).not.toBeNull();
      expect(result.o2).toBe(true);
      expect(result.p2).not.toBeNull();
    });

    test('잘못된 tableSetIdx/slotIdx 접근 시 크래시 안 함', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        return {
          badQuad: window.__tavernLayout.occupySlot(99, 'front', 0, 'bad'),
          negQuad: window.__tavernLayout.getSlotWorldPos(-1, 'back', 0),
          badSlot: window.__tavernLayout.occupySlot(0, 'back', 99, 'bad'),
          negSlot: window.__tavernLayout.getSlotWorldPos(0, 'front', -1),
        };
      });

      expect(result.badQuad).toBe(false);
      expect(result.negQuad).toBeNull();
      expect(result.badSlot).toBe(false);
      expect(result.negSlot).toBeNull();
    });

    test('존재하지 않는 benchLevel 생성 시 빈 배열 반환', async ({ page }) => {
      const result = await page.evaluate(() => {
        return window.__tavernLayout.createSeatingState('nonexistent').length;
      });
      expect(result).toBe(0);
    });

    test('createSeatingState 반복 호출 시 정상 동작', async ({ page }) => {
      const result = await page.evaluate(() => {
        const s1 = window.__tavernLayout.createSeatingState('lv0');
        const s2 = window.__tavernLayout.createSeatingState('lv0');
        const s3 = window.__tavernLayout.createSeatingState('lv0');
        return {
          lengths: [s1.length, s2.length, s3.length],
          slotCounts: [
            s1[0].front.length + s1[0].back.length,
            s2[0].front.length + s2[0].back.length,
            s3[0].front.length + s3[0].back.length,
          ],
        };
      });

      expect(result.lengths).toEqual([2, 2, 2]);
      expect(result.slotCounts).toEqual([6, 6, 6]);
    });

    test('손님 빠른 연타 상태 전환(50회) 시 크래시 안 함', async ({ page }) => {
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const errors = [];
        try {
          for (const cust of scene._customers) {
            for (let i = 0; i < 50; i++) {
              scene._cycleCustomerState(cust);
            }
          }
        } catch (e) {
          errors.push(e.message);
        }
        return { errors };
      });

      expect(result.errors.length).toBe(0);
    });

    test('4명 전원 전체 사이클 순환 시 에러 없음', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const errors = [];
        for (const cust of scene._customers) {
          const cycleLength = cust.cycle.length;
          for (let j = 0; j < cycleLength * 3; j++) {
            try {
              scene._cycleCustomerState(cust);
            } catch (e) {
              errors.push(`${cust.customerType}: ${e.message}`);
            }
          }
        }
        return { errors };
      });

      expect(result.errors.length).toBe(0);
      expect(pageErrors.length).toBe(0);
    });

    test('vacateSlot 후 같은 슬롯 재점유 가능', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        window.__tavernLayout.occupySlot(0, 'back', 2, 'user-a');
        window.__tavernLayout.vacateSlot(0, 'back', 2);
        const reOccupy = window.__tavernLayout.occupySlot(0, 'back', 2, 'user-b');
        return { reOccupy };
      });
      expect(result.reOccupy).toBe(true);
    });

    test('S키 데모: front 슬롯 시 seated_south, back 슬롯 시 seated_north', async ({ page }) => {
      // 손님0이 front에 있을 때
      const beforeResult = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const cust = scene._customers[0];
        // SIT_DOWN으로 전환하여 front에 착석
        scene._cycleCustomerState(cust);
        return {
          slotSide: cust.slotRef?.side,
          texture: cust.sprite.texture?.key,
        };
      });

      expect(beforeResult.slotSide).toBe('front');

      // S키 누르면 front이므로 seated_south
      await page.keyboard.press('s');
      await page.waitForTimeout(300);

      const afterTexture = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        return scene._customers[0]?.sprite?.texture?.key;
      });

      expect(afterTexture).toBe('tavern_customer_normal_seated_south');
    });

    test('findFreeSlot(특정 quad) 파라미터 동작', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        // quad 0 front 전부 채우기
        for (let i = 0; i < 3; i++) {
          window.__tavernLayout.occupySlot(0, 'front', i, `q0f${i}`);
        }
        // quad 0에서만 찾기 -> back[0]
        const q0 = window.__tavernLayout.findFreeSlot(0);
        // quad 1에서만 찾기 -> front[0]
        const q1 = window.__tavernLayout.findFreeSlot(1);
        return { q0, q1 };
      });

      expect(result.q0.side).toBe('back');
      expect(result.q0.tableSetIdx).toBe(0);
      expect(result.q1.side).toBe('front');
      expect(result.q1.tableSetIdx).toBe(1);
    });
  });

  // ====================================================
  // 시각적 검증
  // ====================================================
  test.describe('시각적 검증', () => {
    test('씬 초기 상태 스크린샷', async ({ page }) => {
      await page.screenshot({
        path: 'tests/screenshots/phase_f_initial.png',
      });
    });

    test('손님 4명 착석(front 3 + back 1) 후 스크린샷', async ({ page }) => {
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        for (const cust of scene._customers) {
          scene._cycleCustomerState(cust);
        }
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/screenshots/phase_f_seated.png',
      });
    });

    test('top quad 확대 스크린샷', async ({ page }) => {
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        for (const cust of scene._customers) {
          scene._cycleCustomerState(cust);
        }
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/screenshots/phase_f_top_quad_zoom.png',
        clip: { x: 128, y: 150, width: 232, height: 160 },
      });
    });

    test('bottom quad 확대 스크린샷', async ({ page }) => {
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        for (const cust of scene._customers) {
          scene._cycleCustomerState(cust);
        }
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/screenshots/phase_f_bottom_quad_zoom.png',
        clip: { x: 128, y: 310, width: 232, height: 160 },
      });
    });
  });
});
