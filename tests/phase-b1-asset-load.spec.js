/**
 * @fileoverview Phase B-1 실 에셋 로드 검증 테스트.
 * 에셋 8종 HTTP 200 + Phaser 텍스처 로드 성공 + ASSET_MODE 토글 검증.
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

// ── 실 에셋 HTTP 200 검증 (8종) ──

test.describe('Phase B-1: 실 에셋 HTTP 200 검증', () => {
  const realAssets = [
    'customer_normal_seated_right',
    'customer_normal_seated_left',
    'chef_mimi_idle_side',
    'counter_v12',
    'table_vertical_v12',
    'bench_vertical_l_v12',
    'bench_vertical_r_v12',
    'entrance_v12',
  ];

  for (const name of realAssets) {
    test(`assets/tavern/${name}.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/${name}.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── Phaser 텍스처 로드 성공 검증 ──

test.describe('Phase B-1: Phaser 텍스처 로드 검증', () => {
  test('ASSET_MODE가 real로 설정되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const mode = await page.evaluate(() => window.__tavernAssetMode);
    expect(mode).toBe('real');
  });

  test('실 에셋 8종 텍스처 키가 Phaser에 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const keys = [
        'tavern_counter_v12',
        'tavern_table_vertical_v12',
        'tavern_bench_vertical_l_v12',
        'tavern_bench_vertical_r_v12',
        'tavern_entrance_v12',
        'tavern_customer_normal_seated_right',
        'tavern_customer_normal_seated_left',
        'tavern_chef_mimi_idle_side',
      ];
      return keys.map(k => ({ key: k, exists: scene.textures.exists(k) }));
    });
    for (const r of result) {
      expect(r.exists, `텍스처 ${r.key} 로드 실패`).toBe(true);
    }
  });

  test('더미 에셋 텍스처도 fallback용으로 공존한다', async ({ page }) => {
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
      expect(r.exists, `더미 텍스처 ${r.key} 소실`).toBe(true);
    }
  });
});

// ── 가구 실 에셋 렌더링 검증 ──

test.describe('Phase B-1: 가구 실 에셋 렌더링', () => {
  test('카운터에 실 에셋 텍스처가 사용된다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      for (const child of children) {
        if (child.texture && child.texture.key === 'tavern_counter_v12') {
          return {
            key: child.texture.key,
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
    expect(result.key).toBe('tavern_counter_v12');
    expect(result.x).toBe(80);       // left = COUNTER_ANCHOR.x - COUNTER_W/2 = 100-20=80
    expect(result.y).toBe(90);       // top = 90
    expect(result.displayWidth).toBe(40);
    expect(result.displayHeight).toBe(100);
  });

  test('입구에 실 에셋 텍스처가 사용된다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      for (const child of children) {
        if (child.texture && child.texture.key === 'tavern_entrance_v12') {
          return {
            key: child.texture.key,
            x: child.x,
            y: child.y,
          };
        }
      }
      return null;
    });
    expect(result).not.toBeNull();
    expect(result.key).toBe('tavern_entrance_v12');
  });

  test('4 quad 세트에 실 에셋 벤치/테이블이 사용된다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const children = scene.children.list;
      let benchL = 0, benchR = 0, table = 0;
      for (const child of children) {
        if (!child.texture) continue;
        if (child.texture.key === 'tavern_bench_vertical_l_v12') benchL++;
        if (child.texture.key === 'tavern_bench_vertical_r_v12') benchR++;
        if (child.texture.key === 'tavern_table_vertical_v12') table++;
      }
      return { benchL, benchR, table };
    });
    // 4 quad x 1 bench-l + 1 bench-r + 1 table = 4 each
    expect(result.benchL).toBe(4);
    expect(result.benchR).toBe(4);
    expect(result.table).toBe(4);
  });
});

// ── 콘솔 에러 0건 검증 ──

test.describe('Phase B-1: 에러 없음 검증', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('404 에셋 로드 에러 0건', async ({ page }) => {
    const failedRequests = [];
    page.on('response', response => {
      if (response.url().includes('/assets/tavern/') && response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(failedRequests).toEqual([]);
  });
});

// ── 스크린샷 ──

test.describe('Phase B-1: QA 스크린샷', () => {
  test('실 에셋 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b1-full-layout.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });

  test('실 에셋 카운터+주방 영역 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/phase-b1-counter-kitchen.png',
      clip: { x: 0, y: 60, width: 130, height: 200 },
    });
  });

  test('실 에셋 다이닝홀 상단 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'tests/screenshots/phase-b1-dining-top.png',
      clip: { x: 120, y: 80, width: 240, height: 140 },
    });
  });
});
