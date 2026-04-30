/**
 * @fileoverview Phase 94 (C) QA -- TavernServiceScene 테마 에셋 + HUD/VFX 검증.
 * C1 에셋 HTTP 200, C2 인내심 게이지, C3 말풍선, C4 골드 플로팅 VFX, C5 HUD 바.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/** TavernServiceScene 진입 대기 헬퍼 */
async function waitForTavernScene(page) {
  await page.goto(`${BASE_URL}/?scene=tavern`);
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
  // 추가 안정화 대기 (에셋 로드 완료)
  await page.waitForTimeout(1500);
}

// ═══════════════════════════════════════════════
// C1: 에셋 HTTP 200 + 텍스처 로드 검증
// ═══════════════════════════════════════════════

test.describe('C1: g1 테마 에셋', () => {
  test('floor_wood_tile_v14.png HTTP 200 응답', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/assets/tavern/floor_wood_tile_v14.png`);
    expect(resp.status()).toBe(200);
  });

  test('wall_horizontal_v14.png HTTP 200 응답', async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/assets/tavern/wall_horizontal_v14.png`);
    expect(resp.status()).toBe(200);
  });

  test('바닥/벽 타일 텍스처가 Phaser에 로드되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const textures = await page.evaluate(() => {
      const game = window.__game;
      return {
        floor: game.textures.exists('tavern_floor_wood_tile_v14'),
        wall: game.textures.exists('tavern_wall_horizontal_v14'),
      };
    });
    expect(textures.floor).toBe(true);
    expect(textures.wall).toBe(true);
  });

  test('더미 색상 블록(Rectangle)이 바닥/벽 영역에 노출되지 않는다', async ({ page }) => {
    await waitForTavernScene(page);
    // REAL_KEY_MAP으로 실 에셋이 매핑되어 있으므로 _resolveTextureKey가
    // real 키를 반환해야 함 (더미 키가 아닌 실 에셋 키)
    const keyResolution = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // _resolveTextureKey는 private이지만 진단용으로 직접 호출
      const floorKey = scene._resolveTextureKey('tavern_dummy_floor_wood_tile_v14');
      const wallKey = scene._resolveTextureKey('tavern_dummy_wall_horizontal_v14');
      return { floorKey, wallKey };
    });
    expect(keyResolution.floorKey).toBe('tavern_floor_wood_tile_v14');
    expect(keyResolution.wallKey).toBe('tavern_wall_horizontal_v14');
  });
});

// ═══════════════════════════════════════════════
// C2: 인내심 게이지 HUD
// ═══════════════════════════════════════════════

test.describe('C2: 인내심 게이지', () => {
  test('6개 게이지 모두 존재한다 (_patienceBarMap.size === 6)', async ({ page }) => {
    await waitForTavernScene(page);
    const size = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._patienceBarMap.size;
    });
    expect(size).toBe(6);
  });

  test('row0 게이지 barY >= 58 (벽 영역 미침범)', async ({ page }) => {
    await waitForTavernScene(page);
    const positions = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const result = [];
      scene._patienceBarMap.forEach((bar, idx) => {
        result.push({ idx, bgY: bar.bg.y, fillY: bar.fill.y });
      });
      return result;
    });
    // row0은 idx 0, 1 (quadTop=64)
    for (const pos of positions) {
      if (pos.idx === 0 || pos.idx === 1) {
        expect(pos.bgY).toBeGreaterThanOrEqual(58);
        expect(pos.fillY).toBeGreaterThanOrEqual(58);
      }
    }
  });

  test('updatePatience(0, 0.85) -> 초록색(0x44cc44)', async ({ page }) => {
    await waitForTavernScene(page);
    const color = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(0, 0.85);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const bar = scene._patienceBarMap.get(0);
      return bar.fill.fillColor;
    });
    expect(color).toBe(0x44cc44);
  });

  test('updatePatience(1, 0.45) -> 노랑색(0xffcc00)', async ({ page }) => {
    await waitForTavernScene(page);
    const color = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(1, 0.45);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const bar = scene._patienceBarMap.get(1);
      return bar.fill.fillColor;
    });
    expect(color).toBe(0xffcc00);
  });

  test('updatePatience(2, 0.15) -> 빨강색(0xff3333)', async ({ page }) => {
    await waitForTavernScene(page);
    const color = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(2, 0.15);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const bar = scene._patienceBarMap.get(2);
      return bar.fill.fillColor;
    });
    expect(color).toBe(0xff3333);
  });

  test('게이지 너비가 ratio에 비례한다 (ratio=0.5 -> width=50)', async ({ page }) => {
    await waitForTavernScene(page);
    const width = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(3, 0.5);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const bar = scene._patienceBarMap.get(3);
      return bar.fill.width;
    });
    expect(width).toBe(50);
  });

  test('경계값: ratio=0.7 -> 초록(정확한 경계)', async ({ page }) => {
    await waitForTavernScene(page);
    const color = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(0, 0.7);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._patienceBarMap.get(0).fill.fillColor;
    });
    expect(color).toBe(0x44cc44);
  });

  test('경계값: ratio=0.3 -> 노랑(정확한 경계)', async ({ page }) => {
    await waitForTavernScene(page);
    const color = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(0, 0.3);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._patienceBarMap.get(0).fill.fillColor;
    });
    expect(color).toBe(0xffcc00);
  });

  test('경계값: ratio=0.299 -> 빨강', async ({ page }) => {
    await waitForTavernScene(page);
    const color = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(0, 0.299);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._patienceBarMap.get(0).fill.fillColor;
    });
    expect(color).toBe(0xff3333);
  });

  test('엣지: ratio 클램핑 (음수 -> 0, 1 초과 -> 1)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(4, -0.5);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const widthNeg = scene._patienceBarMap.get(4).fill.width;
      window.__tavernPhaseC.updatePatience(4, 1.5);
      const widthOver = scene._patienceBarMap.get(4).fill.width;
      return { widthNeg, widthOver };
    });
    expect(result.widthNeg).toBe(0);
    expect(result.widthOver).toBe(100);
  });

  test('엣지: 존재하지 않는 인덱스(99)에 에러 없이 무시', async ({ page }) => {
    await waitForTavernScene(page);
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(99, 0.5);
    });
    expect(errors).toEqual([]);
  });

  test('게이지 depth: bg=9050, fill=9051', async ({ page }) => {
    await waitForTavernScene(page);
    const depths = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const bar = scene._patienceBarMap.get(0);
      return { bgDepth: bar.bg.depth, fillDepth: bar.fill.depth };
    });
    expect(depths.bgDepth).toBe(9050);
    expect(depths.fillDepth).toBe(9051);
  });
});

// ═══════════════════════════════════════════════
// C3: 주문 말풍선 UI
// ═══════════════════════════════════════════════

test.describe('C3: 말풍선', () => {
  test('showBubble -> 말풍선 생성, hideBubble -> 말풍선 제거', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      window.__tavernPhaseC.showBubble('test-qa');
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const created = scene._orderBubbleMap.has('test-qa');
      const bubble = scene._orderBubbleMap.get('test-qa');
      const bgVisible = bubble?.bg?.visible;
      const textContent = bubble?.text?.text;

      window.__tavernPhaseC.hideBubble('test-qa');
      const removed = !scene._orderBubbleMap.has('test-qa');
      return { created, bgVisible, textContent, removed };
    });
    expect(result.created).toBe(true);
    expect(result.bgVisible).toBe(true);
    expect(result.textContent).toContain('주문');
    expect(result.removed).toBe(true);
  });

  test('동일 ID로 showBubble 재호출 시 기존 것 제거 후 재생성', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      window.__tavernPhaseC.showBubble('dup-test');
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const first = scene._orderBubbleMap.get('dup-test');
      const firstBgActive = first.bg.active;

      window.__tavernPhaseC.showBubble('dup-test');
      const second = scene._orderBubbleMap.get('dup-test');
      const secondBgActive = second.bg.active;
      const firstDestroyed = !first.bg.active;  // destroy 후 active=false

      // 정리
      window.__tavernPhaseC.hideBubble('dup-test');
      return { firstBgActive, secondBgActive, firstDestroyed };
    });
    expect(result.firstBgActive).toBe(true);
    expect(result.secondBgActive).toBe(true);
    expect(result.firstDestroyed).toBe(true);
  });

  test('hideBubble에 존재하지 않는 ID 호출 시 에러 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.evaluate(() => {
      window.__tavernPhaseC.hideBubble('nonexistent-id');
    });
    expect(errors).toEqual([]);
  });

  test('말풍선 depth: bg=9080, text=9081', async ({ page }) => {
    await waitForTavernScene(page);
    const depths = await page.evaluate(() => {
      window.__tavernPhaseC.showBubble('depth-test');
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const bubble = scene._orderBubbleMap.get('depth-test');
      const result = { bgDepth: bubble.bg.depth, textDepth: bubble.text.depth };
      window.__tavernPhaseC.hideBubble('depth-test');
      return result;
    });
    expect(depths.bgDepth).toBe(9080);
    expect(depths.textDepth).toBe(9081);
  });
});

// ═══════════════════════════════════════════════
// C4: 골드 플로팅 VFX
// ═══════════════════════════════════════════════

test.describe('C4: 골드 플로팅 VFX', () => {
  test('goldFloat(180, 300, 99) -> "+99G" 텍스트 출현', async ({ page }) => {
    await waitForTavernScene(page);
    const text = await page.evaluate(() => {
      window.__tavernPhaseC.goldFloat(180, 300, 99);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // children에서 +99G 텍스트 찾기
      const found = scene.children.list.find(
        c => c.type === 'Text' && c.text === '+99G'
      );
      return found ? found.text : null;
    });
    expect(text).toBe('+99G');
  });

  test('goldFloat 텍스트 depth=9090, 색상=0xffd700', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      window.__tavernPhaseC.goldFloat(180, 300, 50);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const found = scene.children.list.find(
        c => c.type === 'Text' && c.text === '+50G'
      );
      return found ? { depth: found.depth, color: found.style?.color } : null;
    });
    expect(result).not.toBeNull();
    expect(result.depth).toBe(9090);
    expect(result.color).toBe('#ffd700');
  });

  test('goldFloat 1초 후 텍스트 소멸 (tween 완료)', async ({ page }) => {
    await waitForTavernScene(page);
    const initialCount = await page.evaluate(() => {
      window.__tavernPhaseC.goldFloat(180, 300, 77);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene.children.list.filter(
        c => c.type === 'Text' && c.text === '+77G'
      ).length;
    });
    expect(initialCount).toBe(1);

    // 1200ms 대기 (tween 1000ms + 여유)
    await page.waitForTimeout(1200);

    const afterCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene.children.list.filter(
        c => c.type === 'Text' && c.text === '+77G'
      ).length;
    });
    expect(afterCount).toBe(0);
  });

  test('엣지: amount=0 -> "+0G" 표시', async ({ page }) => {
    await waitForTavernScene(page);
    const text = await page.evaluate(() => {
      window.__tavernPhaseC.goldFloat(180, 300, 0);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const found = scene.children.list.find(
        c => c.type === 'Text' && c.text === '+0G'
      );
      return found ? found.text : null;
    });
    expect(text).toBe('+0G');
  });

  test('연속 호출 시 여러 플로팅 텍스트가 독립적으로 존재', async ({ page }) => {
    await waitForTavernScene(page);
    const count = await page.evaluate(() => {
      window.__tavernPhaseC.goldFloat(100, 200, 11);
      window.__tavernPhaseC.goldFloat(200, 200, 22);
      window.__tavernPhaseC.goldFloat(300, 200, 33);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene.children.list.filter(
        c => c.type === 'Text' && (c.text === '+11G' || c.text === '+22G' || c.text === '+33G')
      ).length;
    });
    expect(count).toBe(3);
  });
});

// ═══════════════════════════════════════════════
// C5: HUD 바 (타이머 + 골드)
// ═══════════════════════════════════════════════

test.describe('C5: HUD 바', () => {
  test('타이머 텍스트 "03:00" 존재, visible=true', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        text: scene._timerText?.text,
        visible: scene._timerText?.visible,
        depth: scene._timerText?.depth,
      };
    });
    expect(result.text).toBe('03:00');
    expect(result.visible).toBe(true);
    expect(result.depth).toBe(9100);
  });

  test('골드 텍스트 visible=true, 초기값 포함', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        text: scene._goldText?.text,
        visible: scene._goldText?.visible,
        depth: scene._goldText?.depth,
      };
    });
    expect(result.visible).toBe(true);
    expect(result.text).toContain('0G');
    expect(result.depth).toBe(9100);
  });

  test('updateGold(120) -> HUD 텍스트 갱신 (누적)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      window.__tavernPhaseC.updateGold(120);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._goldText?.text;
    });
    expect(result).toContain('120G');
  });

  test('updateGold 연속 호출 시 누적 합산', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      window.__tavernPhaseC.updateGold(50);
      window.__tavernPhaseC.updateGold(30);
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._goldText?.text;
    });
    // 50 + 30 = 80 (씬 초기 _goldAmount=0)
    expect(result).toContain('80G');
  });

  test('HUD depth(9100) < Back 버튼(9999)', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        timerDepth: scene._timerText?.depth,
        goldDepth: scene._goldText?.depth,
      };
    });
    expect(result.timerDepth).toBeLessThan(9999);
    expect(result.goldDepth).toBeLessThan(9999);
  });
});

// ═══════════════════════════════════════════════
// 비기능: __tavernPhaseC 진단 객체 노출
// ═══════════════════════════════════════════════

test.describe('진단 객체', () => {
  test('window.__tavernPhaseC 객체가 존재하고 5개 메서드를 포함', async ({ page }) => {
    await waitForTavernScene(page);
    const methods = await page.evaluate(() => {
      const pc = window.__tavernPhaseC;
      if (!pc) return null;
      return {
        showBubble: typeof pc.showBubble,
        hideBubble: typeof pc.hideBubble,
        goldFloat: typeof pc.goldFloat,
        updatePatience: typeof pc.updatePatience,
        updateGold: typeof pc.updateGold,
      };
    });
    expect(methods).not.toBeNull();
    expect(methods.showBubble).toBe('function');
    expect(methods.hideBubble).toBe('function');
    expect(methods.goldFloat).toBe('function');
    expect(methods.updatePatience).toBe('function');
    expect(methods.updateGold).toBe('function');
  });
});

// ═══════════════════════════════════════════════
// 비기능: 콘솔 에러 없음
// ═══════════════════════════════════════════════

test.describe('안정성', () => {
  test('씬 로드 중 JS 에러 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    // 진단 메서드 전부 호출하여 에러 여부 확인
    await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(0, 0.5);
      window.__tavernPhaseC.updatePatience(5, 0.1);
      window.__tavernPhaseC.showBubble('err-test');
      window.__tavernPhaseC.hideBubble('err-test');
      window.__tavernPhaseC.goldFloat(180, 300, 42);
      window.__tavernPhaseC.updateGold(100);
    });
    expect(errors).toEqual([]);
  });
});

// ═══════════════════════════════════════════════
// 시각적 검증: 스크린샷
// ═══════════════════════════════════════════════

test.describe('시각적 검증', () => {
  test('TavernServiceScene 초기 상태 전체 스크린샷', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: 'tests/screenshots/phase94-initial.png',
    });
  });

  test('인내심 게이지 3가지 색상 상태 스크린샷', async ({ page }) => {
    await waitForTavernScene(page);
    await page.evaluate(() => {
      window.__tavernPhaseC.updatePatience(0, 0.85); // 초록
      window.__tavernPhaseC.updatePatience(1, 0.45); // 노랑
      window.__tavernPhaseC.updatePatience(2, 0.15); // 빨강
      window.__tavernPhaseC.updatePatience(3, 0.0);  // 빨강 (빈)
      window.__tavernPhaseC.updatePatience(4, 1.0);  // 초록 (풀)
      window.__tavernPhaseC.updatePatience(5, 0.7);  // 초록 (경계)
    });
    await page.screenshot({
      path: 'tests/screenshots/phase94-patience-colors.png',
    });
  });

  test('말풍선 + 골드 플로팅 상태 스크린샷', async ({ page }) => {
    await waitForTavernScene(page);
    await page.evaluate(() => {
      window.__tavernPhaseC.showBubble('screenshot-cust');
      window.__tavernPhaseC.goldFloat(200, 250, 150);
    });
    await page.waitForTimeout(200); // VFX가 나타나도록 잠시 대기
    await page.screenshot({
      path: 'tests/screenshots/phase94-bubble-gold.png',
    });
    // 정리
    await page.evaluate(() => {
      window.__tavernPhaseC.hideBubble('screenshot-cust');
    });
  });

  test('HUD 바 (타이머 + 골드) 클로즈업 스크린샷', async ({ page }) => {
    await waitForTavernScene(page);
    await page.evaluate(() => {
      window.__tavernPhaseC.updateGold(999);
    });
    await page.screenshot({
      path: 'tests/screenshots/phase94-hud-bar.png',
      clip: { x: 0, y: 0, width: 360, height: 40 },
    });
  });
});
