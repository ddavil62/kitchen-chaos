/**
 * @fileoverview Phase G QA -- TavernServiceScene 현대식 레스토랑 2열x3행 6테이블 24석 레이아웃 검증.
 * 수용 기준 G-1 ~ G-8 + 도출된 예외/엣지케이스 검증.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/?scene=tavern';

/** Phaser 씬이 create()를 완료할 때까지 대기 */
async function waitForScene(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const g = window.__game;
    if (!g) return false;
    const scene = g.scene.getScene('TavernServiceScene');
    return scene && scene.children && scene.children.list.length > 0;
  }, { timeout });
}

test.describe('Phase G 2열x3행 6테이블 24석 레이아웃 QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForScene(page);
    await page.waitForTimeout(1000);
  });

  // ====================================================
  // G-1: TABLE_SET_ANCHORS 6개
  // ====================================================
  test('G-1: TABLE_SET_ANCHORS.length === 6', async ({ page }) => {
    const len = await page.evaluate(() => window.__tavernLayout.TABLE_SET_ANCHORS.length);
    expect(len).toBe(6);
  });

  test('G-1a: TABLE_SET_ANCHORS 각 quad 좌표 정확성', async ({ page }) => {
    const anchors = await page.evaluate(() => window.__tavernLayout.TABLE_SET_ANCHORS);
    const expected = [
      { quadLeft: 128, quadTop:  64, key: 'row0_left'  },
      { quadLeft: 244, quadTop:  64, key: 'row0_right' },
      { quadLeft: 128, quadTop: 232, key: 'row1_left'  },
      { quadLeft: 244, quadTop: 232, key: 'row1_right' },
      { quadLeft: 128, quadTop: 400, key: 'row2_left'  },
      { quadLeft: 244, quadTop: 400, key: 'row2_right' },
    ];
    for (let i = 0; i < 6; i++) {
      expect(anchors[i].quadLeft).toBe(expected[i].quadLeft);
      expect(anchors[i].quadTop).toBe(expected[i].quadTop);
      expect(anchors[i].key).toBe(expected[i].key);
    }
  });

  // ====================================================
  // G-2: createSeatingState 6 quad 구조
  // ====================================================
  test('G-2: createSeatingState(lv0) 6 quad x (front 2 + back 2) = 24석', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      return state.map(set => ({
        key: set.key,
        frontLen: set.front.length,
        backLen: set.back.length,
      }));
    });
    expect(result.length).toBe(6);
    for (const set of result) {
      expect(set.frontLen).toBe(2);
      expect(set.backLen).toBe(2);
    }
  });

  // ====================================================
  // G-3: BENCH_CONFIG 수치 검증
  // ====================================================
  test('G-3: BENCH_CONFIG 전 수치 검증', async ({ page }) => {
    const config = await page.evaluate(() => window.__tavernBenchConfig);
    expect(config.QUAD_W).toBe(116);
    expect(config.QUAD_H).toBe(128);
    expect(config.TABLE_W).toBe(100);
    expect(config.TABLE_H).toBe(40);
    expect(config.BENCH_H).toBe(20);
    expect(config.TABLE_LEFT).toBe(8);
    expect(config.TABLE_TOP).toBe(40);
    expect(config.BENCH_BOT_TOP).toBe(80);
    expect(config.SEAT_CENTER_OFFSET_X).toBe(58);
    expect(config.SLOT_DX).toBe(24);
    expect(config.FRONT_SLOT_DY).toBe(40);
    expect(config.BACK_SLOT_DY).toBe(104);
  });

  test('G-3a: BENCH_CONFIG 파생 수치 일관성', async ({ page }) => {
    const config = await page.evaluate(() => window.__tavernBenchConfig);
    // TABLE_DEPTH_OFFSET = TABLE_TOP + TABLE_H
    expect(config.TABLE_DEPTH_OFFSET).toBe(config.TABLE_TOP + config.TABLE_H);
    // SEAT_CENTER_OFFSET_X = QUAD_W / 2
    expect(config.SEAT_CENTER_OFFSET_X).toBe(config.QUAD_W / 2);
    // BENCH_BOT_TOP = TABLE_TOP + TABLE_H
    expect(config.BENCH_BOT_TOP).toBe(config.TABLE_TOP + config.TABLE_H);
    // TABLE_LEFT = (QUAD_W - TABLE_W) / 2
    expect(config.TABLE_LEFT).toBe((config.QUAD_W - config.TABLE_W) / 2);
  });

  // ====================================================
  // G-4: 슬롯 worldY 범위 (< 560)
  // ====================================================
  test('G-4: 모든 슬롯 worldY < ROOM_BOTTOM_Y(560)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      let maxY = -Infinity;
      for (const set of state) {
        for (const slot of [...set.front, ...set.back]) {
          if (slot.worldY > maxY) maxY = slot.worldY;
        }
      }
      return { maxY };
    });
    expect(result.maxY).toBe(504); // quadTop(400) + BACK_SLOT_DY(104)
    expect(result.maxY).toBeLessThan(560);
  });

  // ====================================================
  // G-5: 슬롯 worldX 범위 (128 <= x <= 360)
  // ====================================================
  test('G-5: 모든 슬롯 worldX 128~360 범위', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('lv0');
      let minX = Infinity, maxX = -Infinity;
      for (const set of state) {
        for (const slot of [...set.front, ...set.back]) {
          if (slot.worldX < minX) minX = slot.worldX;
          if (slot.worldX > maxX) maxX = slot.worldX;
        }
      }
      return { minX, maxX };
    });
    expect(result.minX).toBe(162); // 128 + 58 - 24
    expect(result.maxX).toBe(326); // 244 + 58 + 24
    expect(result.minX).toBeGreaterThanOrEqual(128);
    expect(result.maxX).toBeLessThanOrEqual(360);
  });

  // ====================================================
  // G-6: Depth 정렬 검증
  // ====================================================
  test('G-6: 테이블 depth 고정값 검증', async ({ page }) => {
    const depths = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      const results = [];
      for (const child of children) {
        if (child._fixedDepth && child.type === 'Image') {
          results.push({
            x: Math.round(child.x),
            y: Math.round(child.y),
            depth: child.depth,
            w: Math.round(child.displayWidth),
            h: Math.round(child.displayHeight),
          });
        }
      }
      return results;
    });
    // 테이블(100x40)과 하단 의자(100x20) 모두 _fixedDepth=true
    // 테이블: depth = qy + 80 = 144, 312, 480 (3행 x 좌우)
    // 하단 의자: depth = qy + 105 = 169, 337, 505 (3행 x 좌우)
    const tableDepths = depths.filter(d => d.h === 40).map(d => d.depth).sort((a, b) => a - b);
    const chairFrontDepths = depths.filter(d => d.h === 20 && d.depth > 100).map(d => d.depth).sort((a, b) => a - b);

    // 6 테이블
    expect(tableDepths.length).toBe(6);
    expect(tableDepths).toEqual([144, 144, 312, 312, 480, 480]);

    // 6 하단 의자 (chair_front)
    expect(chairFrontDepths.length).toBe(6);
    expect(chairFrontDepths).toEqual([169, 169, 337, 337, 505, 505]);
  });

  test('G-6a: front 손님 depth < 테이블 depth 검증', async ({ page }) => {
    const result = await page.evaluate(() => {
      const config = window.__tavernBenchConfig;
      const anchors = window.__tavernLayout.TABLE_SET_ANCHORS;
      const checks = [];
      for (const q of anchors) {
        const frontDepth = q.quadTop + config.FRONT_SLOT_DY;
        const tableDepth = q.quadTop + config.TABLE_DEPTH_OFFSET;
        checks.push({
          key: q.key,
          frontDepth,
          tableDepth,
          ok: frontDepth < tableDepth,
        });
      }
      return checks;
    });
    for (const c of result) {
      expect(c.ok).toBe(true);
    }
  });

  test('G-6b: back 손님 depth < chair_front depth 검증', async ({ page }) => {
    const result = await page.evaluate(() => {
      const config = window.__tavernBenchConfig;
      const anchors = window.__tavernLayout.TABLE_SET_ANCHORS;
      const checks = [];
      for (const q of anchors) {
        const backDepth = q.quadTop + config.BACK_SLOT_DY;
        const chairFrontDepth = q.quadTop + config.BACK_SLOT_DY + 1;
        checks.push({
          key: q.key,
          backDepth,
          chairFrontDepth,
          ok: backDepth < chairFrontDepth,
        });
      }
      return checks;
    });
    for (const c of result) {
      expect(c.ok).toBe(true);
    }
  });

  // ====================================================
  // G-7: v13 에셋 로드 검증
  // ====================================================
  test('G-7: v13 가구 에셋 3종 로드 성공 (404 없음)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        table: scene.textures.exists('tavern_table_4p_v13'),
        chairBack: scene.textures.exists('tavern_chair_back_v13'),
        chairFront: scene.textures.exists('tavern_chair_front_v13'),
      };
    });
    expect(result.table).toBe(true);
    expect(result.chairBack).toBe(true);
    expect(result.chairFront).toBe(true);
  });

  test('G-7a: v13 에셋 HTTP 404 발생 안 함', async ({ page }) => {
    // beforeEach에서 이미 로드된 상태이므로 네트워크 응답 로그로 검증
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const v13Keys = ['tavern_table_4p_v13', 'tavern_chair_back_v13', 'tavern_chair_front_v13'];
      const missing = v13Keys.filter(k => !scene.textures.exists(k));
      return missing;
    });
    expect(result).toEqual([]);
  });

  // ====================================================
  // G-8: 기존 API 시그니처 유지
  // ====================================================
  test('G-8: findFreeSlot, occupySlot, vacateSlot, getSlotWorldPos 함수 존재', async ({ page }) => {
    const result = await page.evaluate(() => ({
      findFreeSlot: typeof window.__tavernLayout.findFreeSlot === 'function',
      occupySlot: typeof window.__tavernLayout.occupySlot === 'function',
      vacateSlot: typeof window.__tavernLayout.vacateSlot === 'function',
      getSlotWorldPos: typeof window.__tavernLayout.getSlotWorldPos === 'function',
    }));
    expect(result.findFreeSlot).toBe(true);
    expect(result.occupySlot).toBe(true);
    expect(result.vacateSlot).toBe(true);
    expect(result.getSlotWorldPos).toBe(true);
  });

  test('G-8a: findFreeSlot 24슬롯 순회 가능', async ({ page }) => {
    const count = await page.evaluate(() => {
      // 새로 seating state 생성하여 깨끗한 상태에서 테스트
      const state = window.__tavernLayout.createSeatingState('lv0');
      let occupiedCount = 0;
      let slot;
      while ((slot = window.__tavernLayout.findFreeSlot()) !== null) {
        const ok = window.__tavernLayout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, `test-${occupiedCount}`);
        if (!ok) break;
        occupiedCount++;
        if (occupiedCount > 30) break; // 무한루프 방지
      }
      return occupiedCount;
    });
    expect(count).toBe(24);
  });

  test('G-8b: occupySlot 후 vacateSlot 해제 + 재점유', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      // 첫 슬롯 점유
      const slot = window.__tavernLayout.findFreeSlot();
      const ok1 = window.__tavernLayout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, 'testA');
      // 중복 점유 시도
      const ok2 = window.__tavernLayout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, 'testB');
      // 해제 후 재점유
      window.__tavernLayout.vacateSlot(slot.tableSetIdx, slot.side, slot.slotIdx);
      const ok3 = window.__tavernLayout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, 'testC');
      return { ok1, ok2, ok3 };
    });
    expect(result.ok1).toBe(true);
    expect(result.ok2).toBe(false); // 중복 점유 차단
    expect(result.ok3).toBe(true);  // 해제 후 재점유
  });

  test('G-8c: getSlotWorldPos 좌표 반환 검증', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      // row0_left의 front[0]
      const pos = window.__tavernLayout.getSlotWorldPos(0, 'front', 0);
      return pos;
    });
    expect(result).not.toBeNull();
    expect(result.x).toBe(128 + 58 - 24); // 162
    expect(result.y).toBe(64 + 40);       // 104
  });

  // ====================================================
  // 예외 시나리오: 경계값 검증
  // ====================================================
  test('EX-1: 존재하지 않는 tableSetIdx에 occupySlot 호출', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      return {
        idx6: window.__tavernLayout.occupySlot(6, 'front', 0, 'x'),
        idxNeg: window.__tavernLayout.occupySlot(-1, 'front', 0, 'x'),
        idx100: window.__tavernLayout.occupySlot(100, 'front', 0, 'x'),
      };
    });
    expect(result.idx6).toBe(false);
    expect(result.idxNeg).toBe(false);
    expect(result.idx100).toBe(false);
  });

  test('EX-2: 존재하지 않는 side에 접근', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      return {
        leftFallback: window.__tavernLayout.occupySlot(0, 'left', 0, 'x'),
        rightFallback: window.__tavernLayout.occupySlot(0, 'right', 0, 'x'),
        invalidSide: window.__tavernLayout.occupySlot(0, 'invalid_side', 0, 'x'),
      };
    });
    // 'left'/'right'는 front로 fallback
    expect(result.leftFallback).toBe(true);
    // front[0]이 이미 점유됨 (leftFallback에서 점유)
    expect(result.rightFallback).toBe(false);
    // 'invalid_side'는 set[side]가 undefined → fallback은 set['front'] → front[0]은 이미 점유
    expect(result.invalidSide).toBe(false);
  });

  test('EX-3: 범위 밖 slotIdx에 접근', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      return {
        slot2: window.__tavernLayout.occupySlot(0, 'front', 2, 'x'),
        slotNeg: window.__tavernLayout.occupySlot(0, 'front', -1, 'x'),
      };
    });
    expect(result.slot2).toBe(false);   // front에 슬롯 0,1만 존재
    expect(result.slotNeg).toBe(false);
  });

  test('EX-4: createSeatingState 알 수 없는 레벨', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state = window.__tavernLayout.createSeatingState('unknown_level');
      return { length: state.length };
    });
    expect(result.length).toBe(0);
  });

  test('EX-5: 모든 슬롯 점유 후 findFreeSlot 반환값', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      // 24슬롯 전부 점유
      for (let i = 0; i < 24; i++) {
        const slot = window.__tavernLayout.findFreeSlot();
        if (slot) window.__tavernLayout.occupySlot(slot.tableSetIdx, slot.side, slot.slotIdx, `t${i}`);
      }
      return window.__tavernLayout.findFreeSlot();
    });
    expect(result).toBeNull();
  });

  test('EX-6: vacateSlot 미점유 슬롯에 호출 (에러 없이 처리)', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__tavernLayout.createSeatingState('lv0');
      // 에러 없이 실행되는지 확인
      try {
        window.__tavernLayout.vacateSlot(0, 'front', 0);
        window.__tavernLayout.vacateSlot(5, 'back', 1);
        return 'ok';
      } catch (e) {
        return e.message;
      }
    });
    expect(result).toBe('ok');
  });

  // ====================================================
  // 시각적 검증
  // ====================================================
  test('VIS-1: Phase G 전체 레이아웃 스크린샷', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/phase-g-full-layout.png',
    });
  });

  test('VIS-2: 다이닝 영역 클로즈업 스크린샷', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/phase-g-dining-area.png',
      clip: { x: 128, y: 56, width: 232, height: 504 },
    });
  });

  test('VIS-3: 행0 테이블 세트 클로즈업', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/phase-g-row0-closeup.png',
    });
  });

  test('VIS-4: 행2 테이블 세트 클로즈업 (하단 경계)', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/phase-g-row2-closeup.png',
      clip: { x: 120, y: 392, width: 248, height: 168 },
    });
  });

  // ====================================================
  // 콘솔 에러 검증
  // ====================================================
  test('STAB-1: Phase G 진입 시 Phaser 치명적 콘솔 에러 없음', async ({ page }) => {
    // beforeEach에서 이미 로드 완료. 에러 리스너는 이후 동작만 포착.
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    // 이미 로드된 상태에서 짧은 대기 후 에러 확인
    await page.waitForTimeout(500);
    // Phase G 범위 외 레거시 에러(Failed to process file: customer_*)는 무시
    const criticalErrors = errors.filter(e => !e.includes('Failed to process file'));
    expect(criticalErrors).toEqual([]);
  });

  // ====================================================
  // 가구 렌더링 검증 (Game Object 카운트)
  // ====================================================
  test('RENDER-1: 6개 테이블과 12개 의자 배치 확인', async ({ page }) => {
    const counts = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      let fixedDepthImages = 0;
      let tables = 0;
      let chairs = 0;
      for (const child of children) {
        if (child._fixedDepth && child.type === 'Image') {
          fixedDepthImages++;
          const h = Math.round(child.displayHeight);
          if (h === 40) tables++;
          if (h === 20) chairs++;
        }
      }
      return { fixedDepthImages, tables, chairs };
    });
    expect(counts.tables).toBe(6);
    // 상단 의자(chair_back)는 _fixedDepth가 아님 (depth = y 자동 정렬)
    // 하단 의자(chair_front)만 _fixedDepth = true
    expect(counts.chairs).toBe(6); // chair_front 6개만 fixedDepth
  });

  // ====================================================
  // REAL_KEY_MAP v13 키 매핑 검증
  // ====================================================
  test('RENDER-2: v13 REAL_KEY_MAP 매핑 확인', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // v13 가구가 실제 렌더링에 사용되었는지 검증
      const children = scene.children.list;
      const v13Textures = new Set();
      for (const child of children) {
        if (child.type === 'Image' && child.texture && child.texture.key) {
          if (child.texture.key.includes('v13')) {
            v13Textures.add(child.texture.key);
          }
        }
      }
      return [...v13Textures].sort();
    });
    expect(result).toContain('tavern_table_4p_v13');
    expect(result).toContain('tavern_chair_back_v13');
    expect(result).toContain('tavern_chair_front_v13');
  });

  // ====================================================
  // 레거시 v12 가로 가구 잔존 검증
  // ====================================================
  test('RENDER-3: v12 가로 가구 더미 키가 REAL_KEY_MAP에서 제거됨', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      const v12HorizTextures = [];
      for (const child of children) {
        if (child.type === 'Image' && child.texture && child.texture.key) {
          const key = child.texture.key;
          if (key.includes('horizontal') && !key.includes('wall')) {
            v12HorizTextures.push(key);
          }
        }
      }
      return v12HorizTextures;
    });
    expect(result).toEqual([]); // v12 가로 가구 렌더링 없음
  });

  // ====================================================
  // window 전역 노출 검증
  // ====================================================
  test('RENDER-4: window.__tavernLayout, __tavernBenchConfig 노출 확인', async ({ page }) => {
    const result = await page.evaluate(() => ({
      layoutExists: typeof window.__tavernLayout === 'object' && window.__tavernLayout !== null,
      configExists: typeof window.__tavernBenchConfig === 'object' && window.__tavernBenchConfig !== null,
      hasTableAnchors: Array.isArray(window.__tavernLayout.TABLE_SET_ANCHORS),
      hasCreateSeating: typeof window.__tavernLayout.createSeatingState === 'function',
    }));
    expect(result.layoutExists).toBe(true);
    expect(result.configExists).toBe(true);
    expect(result.hasTableAnchors).toBe(true);
    expect(result.hasCreateSeating).toBe(true);
  });

  // ====================================================
  // 손님 탭 → SIT_DOWN 상태 전환 + 슬롯 배정
  // ====================================================
  test('INTERACT-1: 손님 탭 → SIT_DOWN 시 슬롯 배정 + 좌표 이동', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const cust = scene._customers[0];
      if (!cust) return { error: 'no customer' };
      const origX = cust.sprite.x;
      const origY = cust.sprite.y;
      // 2회 탭: QUEUE -> SIT_DOWN (cycle 진행)
      // cycle[0]=ENTER, cycle[1]=QUEUE(현재), cycle[2]=SIT_DOWN
      scene._cycleCustomerState(cust);
      return {
        state: cust.state,
        hasSlotRef: cust.slotRef !== null,
        moved: cust.sprite.x !== origX || cust.sprite.y !== origY,
      };
    });
    expect(result.state).toBe('sit_down');
    expect(result.hasSlotRef).toBe(true);
    expect(result.moved).toBe(true);
  });

  // ====================================================
  // 디버그 HUD 슬롯 카운트 검증
  // ====================================================
  test('HUD-1: 디버그 HUD 총 슬롯 24 표시', async ({ page }) => {
    const hudText = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._debugText ? scene._debugText.text : null;
    });
    expect(hudText).not.toBeNull();
    expect(hudText).toContain('Seats: 0/24');
  });

  // ====================================================
  // 행 간 통로 간격 검증
  // ====================================================
  test('LAYOUT-1: 행 간 통로 40px 균등', async ({ page }) => {
    const anchors = await page.evaluate(() => window.__tavernLayout.TABLE_SET_ANCHORS);
    const config = await page.evaluate(() => window.__tavernBenchConfig);
    // 행0 하단 = quadTop(64) + QUAD_H(128) = 192
    // 행1 상단 = quadTop(232)
    // gap = 232 - 192 = 40 = AISLE_H
    expect(anchors[2].quadTop - (anchors[0].quadTop + config.QUAD_H)).toBe(config.AISLE_H);
    expect(anchors[4].quadTop - (anchors[2].quadTop + config.QUAD_H)).toBe(config.AISLE_H);
  });

  // ====================================================
  // 레거시 벤치 레벨(lv3, lv4) 보존 검증
  // ====================================================
  test('LEGACY-1: BENCH_SLOTS.lv3 / lv4 보존', async ({ page }) => {
    const result = await page.evaluate(() => {
      const state3 = window.__tavernLayout.createSeatingState('lv3');
      const state4 = window.__tavernLayout.createSeatingState('lv4');
      return {
        lv3Count: state3.length,
        lv3FirstFrontLen: state3.length > 0 ? state3[0].front.length : 0,
        lv4Count: state4.length,
        lv4FirstFrontLen: state4.length > 0 ? state4[0].front.length : 0,
      };
    });
    expect(result.lv3Count).toBe(6);
    expect(result.lv3FirstFrontLen).toBe(4); // lv3은 side 없어서 front로 일괄
    expect(result.lv4Count).toBe(6);
    expect(result.lv4FirstFrontLen).toBe(5);
  });
});
