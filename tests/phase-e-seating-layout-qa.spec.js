/**
 * @fileoverview Phase E 착석 레이아웃 재설계 QA 테스트.
 * SC-1 ~ SC-8 수용 기준 검증 + 예외 시나리오.
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

test.describe('Phase E 착석 레이아웃 재설계 QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForScene(page);
    // 씬 안정화 대기
    await page.waitForTimeout(1000);
  });

  // ── SC-1: seated_south 에셋 10종 존재 확인 ──
  test.describe('SC-1: seated_south 에셋 10종', () => {
    test('10종 에셋 파일이 모두 존재한다', async ({ page }) => {
      const types = [
        'normal', 'vip', 'gourmet', 'rushed', 'group',
        'critic', 'regular', 'student', 'traveler', 'business',
      ];
      const results = await page.evaluate((typeList) => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        return typeList.map(t => ({
          type: t,
          exists: scene.textures.exists(`tavern_customer_${t}_seated_south`),
        }));
      }, types);

      for (const r of results) {
        expect(r.exists, `tavern_customer_${r.type}_seated_south 텍스처가 로드되어야 한다`).toBe(true);
      }
    });
  });

  // ── SC-2: tavernLayoutData.js lv0 슬롯 dx/dy 오프셋 ──
  test.describe('SC-2: lv0 슬롯 오프셋', () => {
    test('lv0 슬롯이 dx/dy 오프셋을 가진다', async ({ page }) => {
      const slotData = await page.evaluate(() => {
        const config = window.__tavernBenchConfig;
        // BENCH_SLOTS는 직접 노출되지 않으므로 createSeatingState를 통해 검증
        const state = window.__tavernLayout.createSeatingState('lv0');
        return {
          config: {
            SEAT_CENTER_OFFSET_X: config.SEAT_CENTER_OFFSET_X,
            SEAT_OFFSET_Y: config.SEAT_OFFSET_Y,
            SEAT_SPACING_Y: config.SEAT_SPACING_Y,
            TABLE_DEPTH_OFFSET: config.TABLE_DEPTH_OFFSET,
          },
          topQuadSlots: state[0].front.map(s => ({
            worldX: s.worldX,
            worldY: s.worldY,
            slotIdx: s.slotIdx,
            facingSouth: s.facingSouth,
            side: s.side,
          })),
          bottomQuadSlots: state[1].front.map(s => ({
            worldX: s.worldX,
            worldY: s.worldY,
            slotIdx: s.slotIdx,
          })),
        };
      });

      // Phase E 상수 검증
      expect(slotData.config.SEAT_CENTER_OFFSET_X).toBe(116);
      expect(slotData.config.TABLE_DEPTH_OFFSET).toBe(212);

      // 슬롯 구조: front 배열이 존재하고 3개 슬롯
      expect(slotData.topQuadSlots.length).toBe(3);
      expect(slotData.bottomQuadSlots.length).toBe(3);

      // facingSouth 확인
      for (const slot of slotData.topQuadSlots) {
        expect(slot.facingSouth).toBe(true);
        expect(slot.side).toBe('front');
      }

      // 실제 dy 값 확인 (quadTop=64 기준)
      const topDy = slotData.topQuadSlots.map(s => s.worldY - 64);
      console.log('Top quad dy values:', topDy);

      // 실제 dx 값 확인 (quadLeft=128, SEAT_CENTER_OFFSET_X=116 기준)
      const topDx = slotData.topQuadSlots.map(s => s.worldX - (128 + 116));
      console.log('Top quad dx values:', topDx);
    });

    test('슬롯에 dy=36 오프셋이 적용되어 있다', async ({ page }) => {
      const state = await page.evaluate(() => {
        const state = window.__tavernLayout.createSeatingState('lv0');
        return {
          top: state[0].front.map(s => ({ x: s.worldX, y: s.worldY })),
          bottom: state[1].front.map(s => ({ x: s.worldX, y: s.worldY })),
        };
      });

      // quadTop=64, dy=36 for all slots
      for (const s of state.top) {
        expect(s.y).toBe(64 + 36); // dy=36
      }
      // quadTop=328, dy=36 for all slots
      for (const s of state.bottom) {
        expect(s.y).toBe(328 + 36); // dy=36
      }
    });
  });

  // ── SC-3: 테이블 depth = quadTop + 212 ──
  test.describe('SC-3: 테이블 depth 고정', () => {
    test('테이블 depth가 quadTop + 212이다', async ({ page }) => {
      const tableDepths = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const children = scene.children.list;
        const tables = [];
        for (const c of children) {
          if (c._fixedDepth === true) {
            tables.push({
              x: c.x,
              y: c.y,
              depth: c.depth,
              fixedDepth: c._fixedDepth,
              type: c.type,
            });
          }
        }
        return tables;
      });

      expect(tableDepths.length).toBe(2); // 2 quads

      // top quad: quadTop=64 + 212 = 276
      const topTable = tableDepths.find(t => t.depth === 276);
      expect(topTable, 'top quad 테이블 depth=276이어야 한다').toBeTruthy();
      expect(topTable._fixedDepth || topTable.fixedDepth).toBe(true);

      // bottom quad: quadTop=328 + 212 = 540
      const bottomTable = tableDepths.find(t => t.depth === 540);
      expect(bottomTable, 'bottom quad 테이블 depth=540이어야 한다').toBeTruthy();
    });
  });

  // ── SC-4: SIT 상태 시 seated_south 텍스처 키 ──
  test.describe('SC-4: SIT 상태 seated_south 텍스처', () => {
    test('손님이 SIT 상태 진입 시 seated_south 텍스처를 사용한다', async ({ page }) => {
      // 손님 0번(normal, 짝수=SIT_DOWN 사이클)을 QUEUE -> SIT_DOWN으로 전환
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const cust = scene._customers[0];
        if (!cust) return { error: 'no customer 0' };

        // 현재 QUEUE 상태 확인
        const beforeState = cust.state;
        const beforeTexture = cust.sprite.texture?.key || 'unknown';

        // 한 번 탭하여 SIT_DOWN 진입
        scene._cycleCustomerState(cust);

        const afterState = cust.state;
        const afterTexture = cust.sprite.texture?.key || 'unknown';

        return {
          beforeState,
          beforeTexture,
          afterState,
          afterTexture,
          customerType: cust.customerType,
        };
      });

      expect(result.afterState).toBe('sit_down');
      expect(result.afterTexture).toBe(`tavern_customer_${result.customerType}_seated_south`);
    });

    test('다른 타입(vip) 손님도 seated_south 텍스처를 사용한다', async ({ page }) => {
      // 손님 1번(vip, 홀수=SIT_UP 사이클)
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const cust = scene._customers[1]; // vip
        if (!cust) return { error: 'no customer 1' };

        const beforeState = cust.state;
        scene._cycleCustomerState(cust); // QUEUE -> SIT_UP

        return {
          afterState: cust.state,
          afterTexture: cust.sprite.texture?.key || 'unknown',
          customerType: cust.customerType,
        };
      });

      expect(result.afterState).toBe('sit_up');
      expect(result.afterTexture).toBe('tavern_customer_vip_seated_south');
    });
  });

  // ── SC-5: 손님 슬롯 worldX/worldY 좌표 ──
  test.describe('SC-5: 슬롯 worldX/worldY', () => {
    test('슬롯 좌표가 quadLeft + SEAT_CENTER_OFFSET_X + dx, quadTop + dy이다', async ({ page }) => {
      const slots = await page.evaluate(() => {
        const state = window.__tavernLayout.createSeatingState('lv0');
        const anchors = window.__tavernLayout.TABLE_SET_ANCHORS;
        return {
          anchors: anchors.map(a => ({ quadLeft: a.quadLeft, quadTop: a.quadTop })),
          topSlots: state[0].front.map(s => ({
            worldX: s.worldX,
            worldY: s.worldY,
          })),
          bottomSlots: state[1].front.map(s => ({
            worldX: s.worldX,
            worldY: s.worldY,
          })),
        };
      });

      // quadLeft=128, SEAT_CENTER_OFFSET_X=116
      const baseCenterX = 128 + 116; // 244

      // top quad (quadTop=64)
      // dx values: -22, +22, 0
      expect(slots.topSlots[0].worldX).toBe(baseCenterX - 22); // 222
      expect(slots.topSlots[1].worldX).toBe(baseCenterX + 22); // 266
      expect(slots.topSlots[2].worldX).toBe(baseCenterX);       // 244

      // dy=36 for all
      expect(slots.topSlots[0].worldY).toBe(64 + 36);  // 100
      expect(slots.topSlots[1].worldY).toBe(64 + 36);  // 100
      expect(slots.topSlots[2].worldY).toBe(64 + 36);  // 100

      // bottom quad (quadTop=328)
      expect(slots.bottomSlots[0].worldX).toBe(baseCenterX - 22);
      expect(slots.bottomSlots[1].worldX).toBe(baseCenterX + 22);
      expect(slots.bottomSlots[2].worldX).toBe(baseCenterX);

      expect(slots.bottomSlots[0].worldY).toBe(328 + 36); // 364
      expect(slots.bottomSlots[1].worldY).toBe(328 + 36); // 364
      expect(slots.bottomSlots[2].worldY).toBe(328 + 36); // 364
    });
  });

  // ── SC-6: _applyDepthSort 후 테이블 depth 불변 ──
  test.describe('SC-6: _fixedDepth 마커 동작', () => {
    test('_applyDepthSort 실행 후 테이블 depth가 변경되지 않는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const children = scene.children.list;

        // depth 고정 테이블 찾기
        const tables = children.filter(c => c._fixedDepth === true);
        const depthsBefore = tables.map(t => t.depth);

        // _applyDepthSort 강제 실행
        scene._applyDepthSort();

        const depthsAfter = tables.map(t => t.depth);

        return {
          count: tables.length,
          depthsBefore,
          depthsAfter,
          unchanged: depthsBefore.every((d, i) => d === depthsAfter[i]),
        };
      });

      expect(result.count).toBe(2);
      expect(result.unchanged).toBe(true);
      expect(result.depthsBefore).toEqual([276, 540]);
      expect(result.depthsAfter).toEqual([276, 540]);
    });

    test('_applyDepthSort를 100회 연속 실행해도 테이블 depth가 유지된다', async ({ page }) => {
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const tables = scene.children.list.filter(c => c._fixedDepth === true);
        const initialDepths = tables.map(t => t.depth);

        for (let i = 0; i < 100; i++) {
          scene._applyDepthSort();
        }

        return {
          initialDepths,
          finalDepths: tables.map(t => t.depth),
        };
      });

      expect(result.initialDepths).toEqual(result.finalDepths);
    });
  });

  // ── SC-7: 손님 depth < 테이블 depth (모든 슬롯) ──
  test.describe('SC-7: 손님 depth < 테이블 depth', () => {
    test('SIT 상태 손님의 depth가 테이블 depth보다 작다', async ({ page }) => {
      // 4명 모두 SIT 상태로 전환하고 depth 비교
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');

        // 4명 손님 모두 SIT 상태로 전환
        for (const cust of scene._customers) {
          scene._cycleCustomerState(cust); // QUEUE -> SIT
        }
        scene._applyDepthSort();

        // 테이블 depth 수집
        const tables = scene.children.list.filter(c => c._fixedDepth === true);
        const tableDepths = tables.map(t => t.depth).sort((a, b) => a - b);

        // 손님 depth 수집
        const customerDepths = scene._customers.map(c => ({
          type: c.customerType,
          depth: c.sprite.depth,
          y: c.sprite.y,
          state: c.state,
          slotRef: c.slotRef,
        }));

        // 각 손님이 소속 quad의 테이블보다 depth가 작은지 검증
        const violations = [];
        for (const cust of customerDepths) {
          if (!cust.slotRef) continue;
          const quadIdx = cust.slotRef.tableSetIdx;
          const tableDepth = tableDepths[quadIdx];
          if (cust.depth >= tableDepth) {
            violations.push({
              type: cust.type,
              custDepth: cust.depth,
              tableDepth,
            });
          }
        }

        return {
          tableDepths,
          customerDepths,
          violations,
        };
      });

      expect(result.violations.length, `손님 depth가 테이블 depth보다 커야 하는 위반이 없어야 한다: ${JSON.stringify(result.violations)}`).toBe(0);
    });

    test('3슬롯 모두 이론적으로 depth < 테이블 depth 성립', async ({ page }) => {
      const result = await page.evaluate(() => {
        const state = window.__tavernLayout.createSeatingState('lv0');
        const config = window.__tavernBenchConfig;
        const results = [];

        for (const set of state) {
          const tableDepth = set.quadTop + config.TABLE_DEPTH_OFFSET;
          for (const slot of set.front) {
            // depth = y (depth sorting)
            results.push({
              quad: set.key,
              slotIdx: slot.slotIdx,
              slotY: slot.worldY,
              tableDepth,
              valid: slot.worldY < tableDepth,
            });
          }
        }
        return results;
      });

      for (const r of result) {
        expect(r.valid, `${r.quad} 슬롯${r.slotIdx}: y=${r.slotY} < tableDepth=${r.tableDepth}`).toBe(true);
      }
    });
  });

  // ── SC-8: 콘솔 에러 0건 (기존 5건 제외) ──
  test.describe('SC-8: 콘솔 에러 검증', () => {
    test('씬 진입 시 Phase E 관련 콘솔 에러가 없다', async ({ page, }, testInfo) => {
      testInfo.setTimeout(60000);
      const errors = [];
      const knownLegacyPatterns = [
        'customer_critic',
        'customer_regular',
        'customer_student',
        'customer_traveler',
        'customer_business',
      ];

      page.on('pageerror', err => {
        errors.push(err.message);
      });

      // 콘솔 에러(이미지 로드 실패 등)도 캡처
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // 기존 이슈 5건 제외
          const isKnown = knownLegacyPatterns.some(p => text.includes(p) && !text.includes('seated_south'));
          if (!isKnown) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto(BASE_URL);
      await waitForScene(page);
      await page.waitForTimeout(2000);

      // Phase E 관련 에러만 필터
      const phaseEErrors = consoleErrors.filter(e =>
        e.includes('seated_south') ||
        e.includes('fixedDepth') ||
        e.includes('front') ||
        e.includes('SEAT_CENTER')
      );

      expect(phaseEErrors.length, `Phase E 에러: ${phaseEErrors.join(', ')}`).toBe(0);
    });

    test('손님 상태 전체 순환 시 에러가 없다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const errors = [];

        try {
          // 4명 손님을 전체 사이클 순환
          for (const cust of scene._customers) {
            const cycleLength = cust.cycle.length;
            for (let j = 0; j < cycleLength; j++) {
              try {
                scene._cycleCustomerState(cust);
              } catch (e) {
                errors.push(`${cust.customerType} 상태 순환 중 에러: ${e.message}`);
              }
            }
          }
        } catch (e) {
          errors.push(`전체 순환 에러: ${e.message}`);
        }

        return { errors };
      });

      expect(result.errors.length).toBe(0);
      expect(errors.length).toBe(0);
    });
  });

  // ── 예외 시나리오: 엣지케이스 ──
  test.describe('예외 및 엣지케이스', () => {
    test('만석 시 findFreeSlot이 null을 반환한다', async ({ page }) => {
      const result = await page.evaluate(() => {
        // 모든 슬롯 점유
        const state = window.__tavernLayout.createSeatingState('lv0');
        for (let q = 0; q < state.length; q++) {
          for (let s = 0; s < state[q].front.length; s++) {
            window.__tavernLayout.occupySlot(q, 'front', s, `test-${q}-${s}`);
          }
        }
        const freeSlot = window.__tavernLayout.findFreeSlot();
        return { freeSlot };
      });

      expect(result.freeSlot).toBeNull();
    });

    test('레거시 side="left"/"right" 접근이 front로 fallback된다', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');

        // 레거시 side='left'로 occupy 시도 -> front fallback
        const occupyResult = window.__tavernLayout.occupySlot(0, 'left', 0, 'legacy-test');
        const pos = window.__tavernLayout.getSlotWorldPos(0, 'left', 0);

        // vacate
        window.__tavernLayout.vacateSlot(0, 'left', 0);
        const posAfterVacate = window.__tavernLayout.getSlotWorldPos(0, 'left', 0);

        return {
          occupyResult,
          pos,
          posAfterVacate,
        };
      });

      expect(result.occupyResult).toBe(true);
      expect(result.pos).not.toBeNull();
      // worldX = 128 + 116 + (-22) = 222 for slot 0
      expect(result.pos.x).toBe(222);
    });

    test('잘못된 tableSetIdx로 접근해도 크래시하지 않는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        const r1 = window.__tavernLayout.occupySlot(99, 'front', 0, 'bad');
        const r2 = window.__tavernLayout.getSlotWorldPos(-1, 'front', 0);
        const r3 = window.__tavernLayout.vacateSlot(5, 'front', 0);
        return { r1, r2, r3 };
      });

      expect(result.r1).toBe(false);
      expect(result.r2).toBeNull();
      // vacateSlot returns undefined (void)
    });

    test('잘못된 slotIdx로 접근해도 크래시하지 않는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        const r1 = window.__tavernLayout.occupySlot(0, 'front', 99, 'bad');
        const r2 = window.__tavernLayout.getSlotWorldPos(0, 'front', -1);
        return { r1, r2 };
      });

      expect(result.r1).toBe(false);
      expect(result.r2).toBeNull();
    });

    test('createSeatingState를 여러 번 호출해도 정상 동작한다', async ({ page }) => {
      const result = await page.evaluate(() => {
        const s1 = window.__tavernLayout.createSeatingState('lv0');
        const s2 = window.__tavernLayout.createSeatingState('lv0');
        return {
          s1Length: s1.length,
          s2Length: s2.length,
          s1FrontLength: s1[0].front.length,
          s2FrontLength: s2[0].front.length,
        };
      });

      expect(result.s1Length).toBe(2);
      expect(result.s2Length).toBe(2);
    });

    test('존재하지 않는 benchLevel로 생성 시 빈 배열 반환', async ({ page }) => {
      const result = await page.evaluate(() => {
        const state = window.__tavernLayout.createSeatingState('nonexistent');
        return { length: state.length };
      });

      expect(result.length).toBe(0);
    });

    test('동일 슬롯에 이중 점유 시도 시 false 반환', async ({ page }) => {
      const result = await page.evaluate(() => {
        window.__tavernLayout.createSeatingState('lv0');
        const first = window.__tavernLayout.occupySlot(0, 'front', 0, 'user-1');
        const second = window.__tavernLayout.occupySlot(0, 'front', 0, 'user-2');
        return { first, second };
      });

      expect(result.first).toBe(true);
      expect(result.second).toBe(false);
    });

    test('손님 빠른 연타 상태 전환 시 크래시하지 않는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const errors = [];
        try {
          const cust = scene._customers[0];
          // 20번 빠르게 상태 순환
          for (let i = 0; i < 20; i++) {
            scene._cycleCustomerState(cust);
          }
        } catch (e) {
          errors.push(e.message);
        }
        return { errors, success: errors.length === 0 };
      });

      expect(result.success).toBe(true);
    });

    test('S 키 데모가 seated_south 텍스처로 변경한다', async ({ page }) => {
      const beforeTexture = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        return scene._customers[0]?.sprite?.texture?.key || 'unknown';
      });

      await page.keyboard.press('s');
      await page.waitForTimeout(500);

      const afterTexture = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        return scene._customers[0]?.sprite?.texture?.key || 'unknown';
      });

      expect(afterTexture).toBe('tavern_customer_normal_seated_south');
    });
  });

  // ── 디버그 HUD 검증 ──
  test.describe('디버그 HUD', () => {
    test('총 슬롯 수가 6으로 표시된다', async ({ page }) => {
      const debugText = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        return scene._debugText?.text || '';
      });

      expect(debugText).toContain('Seats: 0/6');
    });
  });

  // ── 시각적 검증 ──
  test.describe('시각적 검증', () => {
    test('씬 초기 상태 스크린샷', async ({ page }) => {
      await page.screenshot({
        path: 'tests/screenshots/phase_e_initial.png',
      });
    });

    test('손님 착석 후 스크린샷', async ({ page }) => {
      // 4명 모두 SIT 상태로 전환
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        for (const cust of scene._customers) {
          scene._cycleCustomerState(cust);
        }
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/screenshots/phase_e_seated.png',
      });
    });

    test('테이블 영역 확대 스크린샷 (top quad)', async ({ page }) => {
      // 손님 착석 후 top quad 영역만 클립
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        for (const cust of scene._customers) {
          scene._cycleCustomerState(cust);
        }
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'tests/screenshots/phase_e_top_quad_zoom.png',
        clip: { x: 128, y: 40, width: 232, height: 260 },
      });
    });
  });

  // ── BENCH_CONFIG 상수 검증 ──
  test.describe('BENCH_CONFIG 상수 검증', () => {
    test('Phase E 상수 4개가 올바르게 설정되어 있다', async ({ page }) => {
      const config = await page.evaluate(() => window.__tavernBenchConfig);

      expect(config.SEAT_CENTER_OFFSET_X).toBe(116);
      expect(config.SEAT_OFFSET_Y).toBe(24);
      expect(config.SEAT_SPACING_Y).toBe(50);
      expect(config.TABLE_DEPTH_OFFSET).toBe(212);
    });
  });

  // ── REAL_KEY_MAP seated_south 매핑 검증 ──
  test.describe('REAL_KEY_MAP 매핑', () => {
    test('seated_south 10종 텍스처가 모두 로드된다', async ({ page }) => {
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const types = [
          'normal', 'vip', 'gourmet', 'rushed', 'group',
          'critic', 'regular', 'student', 'traveler', 'business',
        ];
        return types.map(t => ({
          type: t,
          loaded: scene.textures.exists(`tavern_customer_${t}_seated_south`),
        }));
      });

      for (const r of result) {
        expect(r.loaded, `${r.type} seated_south 텍스처`).toBe(true);
      }
    });
  });

  // ── _fixedDepth가 테이블만 적용되는지 확인 ──
  test.describe('_fixedDepth 범위 확인', () => {
    test('_fixedDepth는 테이블 스프라이트에만 설정된다', async ({ page }) => {
      const result = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const fixedItems = scene.children.list.filter(c => c._fixedDepth === true);
        return fixedItems.map(item => ({
          type: item.type,
          depth: item.depth,
          x: item.x,
          y: item.y,
          displayWidth: item.displayWidth,
          displayHeight: item.displayHeight,
        }));
      });

      expect(result.length).toBe(2);
      // 테이블 크기: 64x200
      for (const item of result) {
        expect(item.displayWidth).toBe(64);
        expect(item.displayHeight).toBe(200);
      }
    });
  });
});
