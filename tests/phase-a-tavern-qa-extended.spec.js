/**
 * @fileoverview Phase A-bis 태번 영업씬 확장 QA 테스트 (V12 마이그레이션).
 * 정상 케이스(Coder 테스트 보완) + 엣지케이스 + 깊이정렬 집중 검증.
 * V12: 4분면(quad) 세로 테이블, 24석(4quad x 좌3+우3).
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

// ── 게이트 1: 절대 준수 사항 ──

test.describe('Gate 1: 절대 준수 사항', () => {
  test('TavernServiceScene.js에 scaleY/flipY 호출이 없다', async ({ page }) => {
    // 주석 내 문구는 제외하고 실제 호출 패턴만 검사한다.
    const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
    const source = await response.text();
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(stripped).not.toMatch(/\.scaleY\b/);
    expect(stripped).not.toMatch(/scaleY\s*[:=]/);
    expect(stripped).not.toMatch(/\.flipY\b/);
    expect(stripped).not.toMatch(/flipY\s*[:=]/);
  });

  test('TavernServiceScene.js에 _back/_front/_occupied 레이어 분리 패턴이 없다', async ({ page }) => {
    const response = await page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js');
    const source = await response.text();
    expect(source).not.toContain('_back');
    expect(source).not.toContain('_front');
    expect(source).not.toContain('_occupied');
  });

  test('tavernLayoutData.js에 scaleY/flipY 호출이 없다', async ({ page }) => {
    // 주석 내 문구는 제외하고 실제 호출 패턴만 검사한다.
    const response = await page.request.get('http://localhost:5173/js/data/tavernLayoutData.js');
    const source = await response.text();
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(stripped).not.toMatch(/\.scaleY\b/);
    expect(stripped).not.toMatch(/scaleY\s*[:=]/);
    expect(stripped).not.toMatch(/\.flipY\b/);
    expect(stripped).not.toMatch(/flipY\s*[:=]/);
  });

  test('tavernStateData.js에 scaleY/flipY 호출이 없다', async ({ page }) => {
    // JSDoc 주석에는 "scaleY(-1) 미러링 금지" 같은 문구가 포함될 수 있으므로
    // 단순 텍스트가 아닌 실제 코드 호출 패턴(.scaleY, scaleY: ..., setScale 등)만 검사한다.
    const response = await page.request.get('http://localhost:5173/js/data/tavernStateData.js');
    const source = await response.text();
    // 주석(/** ... */, // ...) 전부 제거 후 검사
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(stripped).not.toMatch(/\.scaleY\b/);
    expect(stripped).not.toMatch(/scaleY\s*[:=]/);
    expect(stripped).not.toMatch(/\.flipY\b/);
    expect(stripped).not.toMatch(/flipY\s*[:=]/);
  });

  test('PixelLab/SD API 호출 코드가 없다', async ({ page }) => {
    const sources = await Promise.all([
      page.request.get('http://localhost:5173/js/scenes/TavernServiceScene.js').then(r => r.text()),
      page.request.get('http://localhost:5173/js/data/tavernLayoutData.js').then(r => r.text()),
      page.request.get('http://localhost:5173/js/data/tavernStateData.js').then(r => r.text()),
    ]);
    for (const src of sources) {
      expect(src).not.toContain('pixellab');
      expect(src).not.toContain('PixelLab');
      expect(src).not.toContain('sdapi');
      expect(src).not.toContain('SD Forge');
    }
  });
});

// ── 게이트 2: 스펙 준수 (성공 기준) ──

test.describe('Gate 2-A1: 레이아웃 영역 상수', () => {
  test('?scene=tavern 파라미터로 TavernServiceScene에 진입된다', async ({ page }) => {
    await waitForTavernScene(page);
    const isActive = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene && scene.sys.isActive();
    });
    expect(isActive).toBe(true);
  });

  test('TAVERN_LAYOUT 상수 전체 값 검증', async ({ page }) => {
    await waitForTavernScene(page);
    const layout = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene ? scene._layout : null;
    });
    expect(layout).not.toBeNull();
    expect(layout.GAME_W).toBe(360);
    expect(layout.GAME_H).toBe(640);
    expect(layout.HUD_H).toBe(32);
    expect(layout.WALL_H).toBe(24);
    expect(layout.CTRL_H).toBe(80);
    expect(layout.ROOM_Y).toBe(32);
    expect(layout.ROOM_CONTENT_Y).toBe(56);
    expect(layout.ROOM_BOTTOM_Y).toBe(560);
    expect(layout.KITCHEN_X).toBe(8);
    expect(layout.KITCHEN_W).toBe(120);
    expect(layout.DINING_X).toBe(128);
    expect(layout.DINING_W).toBe(224);
  });

  test('수직 영역 합산이 640px이다', async ({ page }) => {
    await waitForTavernScene(page);
    const layout = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene ? scene._layout : null;
    });
    const sum = layout.HUD_H + layout.WALL_H
      + (layout.ROOM_BOTTOM_Y - layout.ROOM_CONTENT_Y)
      + layout.CTRL_H;
    // HUD(32) + WALL(24) + ROOM(504) + CTRL(80) = 640
    expect(sum).toBe(640);
  });
});

test.describe('Gate 2-A2: 좌석 슬롯 데이터 모델 (V12)', () => {
  test('lv0 벤치 기준 전체 24석', async ({ page }) => {
    await waitForTavernScene(page);
    const total = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._seatingState.reduce(
        (acc, set) => acc + set.left.length + set.right.length, 0,
      );
    });
    expect(total).toBe(24);
  });

  test('각 quad가 left 3슬롯 + right 3슬롯 = 6석', async ({ page }) => {
    await waitForTavernScene(page);
    const setCounts = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._seatingState.map(s => ({
        left: s.left.length,
        right: s.right.length,
      }));
    });
    for (const sc of setCounts) {
      expect(sc.left).toBe(3);
      expect(sc.right).toBe(3);
    }
  });

  test('left 슬롯은 facingRight=true, right 슬롯은 facingLeft=true', async ({ page }) => {
    await waitForTavernScene(page);
    const flags = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const result = { leftFacingRight: true, rightFacingLeft: true };
      for (const set of scene._seatingState) {
        for (const slot of set.left) {
          if (!slot.facingRight || slot.facingLeft) result.leftFacingRight = false;
        }
        for (const slot of set.right) {
          if (slot.facingRight || !slot.facingLeft) result.rightFacingLeft = false;
        }
      }
      return result;
    });
    expect(flags.leftFacingRight).toBe(true);
    expect(flags.rightFacingLeft).toBe(true);
  });

  test('occupySlot 성공 시 true, 이미 점유 시 false', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const { occupySlot, vacateSlot } = window.__tavernLayout;
      const r1 = occupySlot(0, 'left', 0, 'c1');
      const r2 = occupySlot(0, 'left', 0, 'c2');
      vacateSlot(0, 'left', 0);
      const r3 = occupySlot(0, 'left', 0, 'c2');
      vacateSlot(0, 'left', 0);
      return { r1, r2, r3 };
    });
    expect(result.r1).toBe(true);
    expect(result.r2).toBe(false);
    expect(result.r3).toBe(true);
  });

  test('findFreeSlot이 비어있는 슬롯을 반환한다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const { findFreeSlot } = window.__tavernLayout;
      return findFreeSlot();
    });
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('tableSetIdx');
    expect(result).toHaveProperty('side');
    expect(result).toHaveProperty('slotIdx');
  });

  test('getSlotWorldPos가 올바른 V12 좌표를 반환한다', async ({ page }) => {
    await waitForTavernScene(page);
    const pos = await page.evaluate(() => {
      const { getSlotWorldPos } = window.__tavernLayout;
      return getSlotWorldPos(0, 'left', 0);
    });
    expect(pos).not.toBeNull();
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
    // V12: quadLeft=130 + BENCH_LEFT_OFFSET_X=7 = 137
    expect(pos.x).toBe(137);
    // V12: quadTop=90 + slotOffsets[0].dy=20 = 110
    expect(pos.y).toBe(110);
  });
});

test.describe('Gate 2-A3: 상태머신', () => {
  test('ChefState 7개 상태 정의', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => Object.values(window.__ChefState));
    expect(states).toHaveLength(7);
    const expected = ['idle_side', 'walk_l', 'walk_r', 'cook', 'carry_l', 'carry_r', 'serve'];
    for (const s of expected) {
      expect(states).toContain(s);
    }
  });

  test('CustomerState 7개 상태 정의, sit_up/sit_down 별개', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => Object.values(window.__CustomerState));
    expect(states).toHaveLength(7);
    const expected = ['enter', 'queue', 'sit_down', 'sit_up', 'eat_down', 'eat_up', 'leave'];
    for (const s of expected) {
      expect(states).toContain(s);
    }
  });

  test('셰프 탭 시 상태 순환 동작', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const results = [scene._chefState];
      // 4번 탭 = idle_side -> cook -> carry_r -> serve -> idle_side
      for (let i = 0; i < 4; i++) {
        scene._chefSprite.emit('pointerdown');
        results.push(scene._chefState);
      }
      return results;
    });
    expect(states).toEqual(['idle_side', 'cook', 'carry_r', 'serve', 'idle_side']);
  });

  test('손님 탭 시 상태 순환 동작 (facing-down 경로)', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const cust = scene._customers[0]; // 짝수 -> facing-down cycle
      const results = [cust.state];
      // queue -> sit_down -> eat_down -> leave -> enter
      for (let i = 0; i < 4; i++) {
        cust.sprite.emit('pointerdown');
        results.push(cust.state);
      }
      return results;
    });
    expect(states).toEqual(['queue', 'sit_down', 'eat_down', 'leave', 'enter']);
  });

  test('손님 탭 시 상태 순환 동작 (facing-up 경로)', async ({ page }) => {
    await waitForTavernScene(page);
    const states = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const cust = scene._customers[1]; // 홀수 -> facing-up cycle
      const results = [cust.state];
      for (let i = 0; i < 4; i++) {
        cust.sprite.emit('pointerdown');
        results.push(cust.state);
      }
      return results;
    });
    expect(states).toEqual(['queue', 'sit_up', 'eat_up', 'leave', 'enter']);
  });
});

test.describe('Gate 2-A4: Y축 깊이정렬', () => {
  test('손님 4명의 depth가 y좌표 순서와 일치한다', async ({ page }) => {
    await waitForTavernScene(page);
    const depths = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._customers.map(c => ({ y: c.sprite.y, depth: c.sprite.depth }));
    });
    expect(depths.length).toBe(4);
    const sorted = [...depths].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].depth).toBeGreaterThanOrEqual(sorted[i - 1].depth);
    }
  });

  test('셰프와 손님의 depth를 포함한 전체 깊이정렬 검증', async ({ page }) => {
    await waitForTavernScene(page);
    const allDepths = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const items = [];
      items.push({ label: 'chef', y: scene._chefSprite.y, depth: scene._chefSprite.depth });
      for (const c of scene._customers) {
        items.push({ label: c.id, y: c.sprite.y, depth: c.sprite.depth });
      }
      return items;
    });
    const sorted = [...allDepths].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].depth).toBeGreaterThanOrEqual(sorted[i - 1].depth);
    }
  });

  test('손님이 슬롯에 착석 후에도 depth가 y좌표에 맞게 갱신된다', async ({ page }) => {
    await waitForTavernScene(page);
    // 손님 0번을 sit_down 상태로 전환
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const cust = scene._customers[0];
      cust.sprite.emit('pointerdown'); // queue -> sit_down
      // update() 수동 호출
      scene.update();
      return {
        state: cust.state,
        y: cust.sprite.y,
        depth: cust.sprite.depth,
        yMatchesDepth: cust.sprite.depth === cust.sprite.y,
      };
    });
    expect(result.state).toBe('sit_down');
    expect(result.yMatchesDepth).toBe(true);
  });
});

// ── 게이트 3: 엣지케이스 ──

test.describe('Gate 3: 엣지케이스', () => {
  test('?scene 파라미터 없이 기존 MenuScene 진입 정상', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
    await page.waitForTimeout(3000);
    const scenes = await page.evaluate(() => {
      const game = window.__game;
      if (!game || !game.scene) return {};
      return {
        menuActive: game.scene.isActive('MenuScene'),
        tavernActive: game.scene.isActive('TavernServiceScene'),
      };
    });
    // MenuScene 또는 BootScene이 활성화. TavernServiceScene은 비활성.
    expect(scenes.tavernActive).toBe(false);
  });

  test('이미 점유된 슬롯에 occupy 호출 시 false 반환', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const { occupySlot, vacateSlot } = window.__tavernLayout;
      occupySlot(1, 'right', 2, 'x1');
      const dup = occupySlot(1, 'right', 2, 'x2');
      vacateSlot(1, 'right', 2);
      return dup;
    });
    expect(result).toBe(false);
  });

  test('점유 안 된 슬롯에 vacateSlot 호출 시 에러 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const noError = await page.evaluate(() => {
      try {
        const { vacateSlot } = window.__tavernLayout;
        vacateSlot(0, 'left', 2); // 점유 안 된 슬롯
        vacateSlot(2, 'right', 0); // 점유 안 된 슬롯
        return true;
      } catch {
        return false;
      }
    });
    expect(noError).toBe(true);
  });

  test('존재하지 않는 tableSetIdx로 occupy 호출 시 false (크래시 없음)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      try {
        const { occupySlot } = window.__tavernLayout;
        return occupySlot(99, 'left', 0, 'bad');
      } catch {
        return 'ERROR';
      }
    });
    expect(result).toBe(false);
  });

  test('존재하지 않는 side로 occupy 호출 시 false (크래시 없음)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      try {
        const { occupySlot } = window.__tavernLayout;
        return occupySlot(0, 'invalid_side', 0, 'bad');
      } catch {
        return 'ERROR';
      }
    });
    expect(result).toBe(false);
  });

  test('존재하지 않는 slotIdx로 occupy 호출 시 false (크래시 없음)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      try {
        const { occupySlot } = window.__tavernLayout;
        return occupySlot(0, 'left', 99, 'bad');
      } catch {
        return 'ERROR';
      }
    });
    expect(result).toBe(false);
  });

  test('getSlotWorldPos에 잘못된 인덱스 시 null 반환 (크래시 없음)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      try {
        const { getSlotWorldPos } = window.__tavernLayout;
        return {
          bad1: getSlotWorldPos(99, 'left', 0),
          bad2: getSlotWorldPos(0, 'xxx', 0),
          bad3: getSlotWorldPos(0, 'left', 99),
        };
      } catch {
        return 'ERROR';
      }
    });
    expect(result).not.toBe('ERROR');
    expect(result.bad1).toBeNull();
    expect(result.bad2).toBeNull();
    expect(result.bad3).toBeNull();
  });

  test('24개 슬롯 모두 점유 후 findFreeSlot이 null 반환', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const { occupySlot, findFreeSlot, vacateSlot } = window.__tavernLayout;
      // 24개 슬롯 전부 점유 (V12: 4 quad x left/right x 3슬롯)
      for (let t = 0; t < 4; t++) {
        for (const side of ['left', 'right']) {
          for (let s = 0; s < 3; s++) {
            occupySlot(t, side, s, `fill-${t}-${side}-${s}`);
          }
        }
      }
      const freeAfterFull = findFreeSlot();
      // 정리: 전부 해제
      for (let t = 0; t < 4; t++) {
        for (const side of ['left', 'right']) {
          for (let s = 0; s < 3; s++) {
            vacateSlot(t, side, s);
          }
        }
      }
      return freeAfterFull;
    });
    expect(result).toBeNull();
  });

  test('24개 슬롯 모두 점유 상태에서 손님 SIT 전환 시 슬롯 없어도 크래시 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const noError = await page.evaluate(() => {
      try {
        const { occupySlot, vacateSlot } = window.__tavernLayout;
        const scene = window.__game.scene.getScene('TavernServiceScene');
        // 24개 슬롯 전부 점유 (V12: 4 quad x left/right x 3슬롯)
        for (let t = 0; t < 4; t++) {
          for (const side of ['left', 'right']) {
            for (let s = 0; s < 3; s++) {
              occupySlot(t, side, s, `block-${t}-${side}-${s}`);
            }
          }
        }
        // 새 손님 0 탭 (queue -> sit 시도)
        const cust = scene._customers[0];
        // 이미 큐 상태에서 한 번 더 탭하면 sit 시도
        cust.sprite.emit('pointerdown');
        // 크래시 없이 여기까지 도달하면 성공

        // 정리: 전부 해제
        for (let t = 0; t < 4; t++) {
          for (const side of ['left', 'right']) {
            for (let s = 0; s < 3; s++) {
              vacateSlot(t, side, s);
            }
          }
        }
        return true;
      } catch (e) {
        return e.message;
      }
    });
    expect(noError).toBe(true);
  });

  test('셰프 연타(5번 빠른 클릭) 시 크래시 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      try {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        for (let i = 0; i < 5; i++) {
          scene._chefSprite.emit('pointerdown');
        }
        return scene._chefState;
      } catch {
        return 'ERROR';
      }
    });
    expect(result).not.toBe('ERROR');
    // 5번 클릭 후: idle -> cook -> carry_r -> serve -> idle -> cook
    expect(result).toBe('cook');
  });

  test('손님 연타(8번 빠른 클릭) 시 크래시 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      try {
        const scene = window.__game.scene.getScene('TavernServiceScene');
        const cust = scene._customers[0];
        for (let i = 0; i < 8; i++) {
          cust.sprite.emit('pointerdown');
        }
        return cust.state;
      } catch (e) {
        return 'ERROR: ' + e.message;
      }
    });
    expect(result).not.toContain('ERROR');
  });

  test('콘솔 에러가 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    // 몇 가지 인터랙션 수행
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      scene._chefSprite.emit('pointerdown');
      scene._customers[0].sprite.emit('pointerdown');
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('Back 버튼 클릭 시 MenuScene으로 복귀', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => {
      const game = window.__game;
      const scene = game.scene.getScene('TavernServiceScene');
      // Back 버튼 찾기 (첫 번째 Text 오브젝트 중 '< BACK' 텍스트)
      const children = scene.children.list;
      for (const child of children) {
        if (child.type === 'Text' && child.text === '< BACK') {
          child.emit('pointerdown');
          break;
        }
      }
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            tavernActive: game.scene.isActive('TavernServiceScene'),
            menuActive: game.scene.isActive('MenuScene'),
          });
        }, 500);
      });
    });
    expect(result.tavernActive).toBe(false);
    expect(result.menuActive).toBe(true);
  });
});

// ── 게이트 4: 시각 검증 ──

test.describe('Gate 4: 시각 검증', () => {
  test('전체 레이아웃 스크린샷 (V12)', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-a-qa-layout-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });

  test('좌상 quad 상세 캡처 (V12 bench-table 간격 검증)', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    // quad.tl: left=130, top=90, 100x120
    await page.screenshot({
      path: 'tests/screenshots/phase-a-qa-quad-tl-detail.png',
      clip: { x: 120, y: 80, width: 130, height: 140 },
    });
  });

  test('셰프 상태별 컬러 순환 시각 확인', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    // 셰프 idle 상태
    await page.screenshot({
      path: 'tests/screenshots/phase-a-qa-chef-idle.png',
      clip: { x: 0, y: 50, width: 130, height: 160 },
    });
    // cook으로 전환
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      scene._chefSprite.emit('pointerdown');
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'tests/screenshots/phase-a-qa-chef-cook.png',
      clip: { x: 0, y: 50, width: 130, height: 160 },
    });
  });

  test('손님 sit_down/sit_up 컬러 구분 시각 확인', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    // 손님 0(짝수): queue -> sit_down
    // 손님 1(홀수): queue -> sit_up
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      scene._customers[0].sprite.emit('pointerdown'); // sit_down
      scene._customers[1].sprite.emit('pointerdown'); // sit_up
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'tests/screenshots/phase-a-qa-sit-states.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });

  test('깊이정렬: 3명 + 셰프 동일 화면 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    // 손님 0, 1, 2를 좌석에 앉혀 y좌표 다르게 배치
    await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      scene._customers[0].sprite.emit('pointerdown'); // sit_down
      scene._customers[1].sprite.emit('pointerdown'); // sit_up
      scene._customers[2].sprite.emit('pointerdown'); // sit_down
      scene.update(); // depth 갱신
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'tests/screenshots/phase-a-qa-depth-3plus1.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
