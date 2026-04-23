/**
 * @fileoverview Phase B-2 스프라이트 전환 검증 테스트.
 * 셰프 2명 + 손님이 Image 타입으로 렌더링되는지 검증.
 * 재발주 에셋 HTTP 200, 텍스처 로드, vite 빌드 제외 확인.
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
  // 씬 안정화 대기
  await page.waitForTimeout(1000);
}

// ── 1. 재발주 에셋 4종 HTTP 200 검증 ──

test.describe('Phase B-2: 재발주 에셋 HTTP 200', () => {
  const b2Assets = [
    'customer_normal_seated_left',
    'bench_vertical_l_v12',
    'bench_vertical_r_v12',
    'chef_rin_idle_side',
  ];

  for (const name of b2Assets) {
    test(`assets/tavern/${name}.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/${name}.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 2. 두 번째 셰프 텍스처 로드 확인 ──

test.describe('Phase B-2: 텍스처 로드 검증', () => {
  test('ASSET_MODE가 real로 설정되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const mode = await page.evaluate(() => window.__tavernAssetMode);
    expect(mode).toBe('real');
  });

  test('chef_rin_idle_side 텍스처가 Phaser에 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const exists = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene.textures.exists('tavern_chef_rin_idle_side');
    });
    expect(exists).toBe(true);
  });

  test('실 에셋 9종 텍스처 키가 모두 Phaser에 등록되어 있다', async ({ page }) => {
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
        'tavern_chef_rin_idle_side',
      ];
      return keys.map(k => ({ key: k, exists: scene.textures.exists(k) }));
    });
    for (const r of result) {
      expect(r.exists, `텍스처 ${r.key} 로드 실패`).toBe(true);
    }
  });
});

// ── 3. 셰프 스프라이트 렌더링 확인 ──

test.describe('Phase B-2: 셰프 스프라이트 렌더링', () => {
  test('셰프 2명이 모두 Image 타입으로 렌더링된다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes).toBeTruthy();
    expect(spriteTypes.chefs).toHaveLength(2);
    for (const chef of spriteTypes.chefs) {
      expect(chef.type).toBe('Image');
    }
  });

  test('idx=0 셰프(린)가 chef_rin 텍스처를 사용한다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes.chefs[0].textureKey).toBe('tavern_chef_rin_idle_side');
  });

  test('idx=1 셰프(미미)가 chef_mimi 텍스처를 사용한다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes.chefs[1].textureKey).toBe('tavern_chef_mimi_idle_side');
  });
});

// ── 4. 손님 스프라이트 렌더링 확인 ──

test.describe('Phase B-2: 손님 스프라이트 렌더링', () => {
  test('손님 4명이 모두 Image 타입으로 렌더링된다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes).toBeTruthy();
    expect(spriteTypes.customers).toHaveLength(4);
    for (const cust of spriteTypes.customers) {
      expect(cust.type).toBe('Image');
    }
  });

  test('손님 초기 텍스처가 각 타입의 seated_right이다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    // B-3: DEMO_CUSTOMER_TYPES = ['normal', 'vip', 'gourmet', 'rushed']
    const expectedTypes = ['normal', 'vip', 'gourmet', 'rushed'];
    for (let i = 0; i < spriteTypes.customers.length; i++) {
      const type = expectedTypes[i] || 'normal';
      expect(spriteTypes.customers[i].textureKey).toBe(`tavern_customer_${type}_seated_right`);
    }
  });
});

// ── 5. 콘솔 에러 0건 검증 ──

test.describe('Phase B-2: 에러 없음 검증', () => {
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

// ── 6. 스크린샷 ──

test.describe('Phase B-2: QA 스크린샷', () => {
  test('B-2 실 에셋 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b2-sprite-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
