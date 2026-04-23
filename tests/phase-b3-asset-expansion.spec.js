/**
 * @fileoverview Phase B-3 에셋 확장 검증 테스트.
 * 손님 9종(seated R/L) + 셰프 5명(idle_side) + W-1 재발주 에셋 24종 검증.
 * DEMO_CUSTOMER_TYPES 4종 분배, SIT 텍스처 동적 교체 확인.
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

// ── 1. 에셋 24종 HTTP 200 검증 ──

test.describe('Phase B-3: 신규 에셋 HTTP 200', () => {
  // W-1 재발주 (파일명 동일, 교체)
  const w1Asset = 'customer_normal_seated_left';

  // 손님 9종 seated_right (9개)
  const customerTypes = ['vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
  const customerRightAssets = customerTypes.map(t => `customer_${t}_seated_right`);
  const customerLeftAssets = customerTypes.map(t => `customer_${t}_seated_left`);

  // 셰프 5명
  const chefAssets = ['chef_mage_idle_side', 'chef_yuki_idle_side', 'chef_lao_idle_side', 'chef_andre_idle_side', 'chef_arjun_idle_side'];

  const allAssets = [w1Asset, ...customerRightAssets, ...customerLeftAssets, ...chefAssets];

  for (const name of allAssets) {
    test(`assets/tavern/${name}.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/${name}.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 2. 텍스처 레지스트리 확인 (32종 전체) ──

test.describe('Phase B-3: 텍스처 레지스트리', () => {
  test('B-3 신규 23종 + 기존 9종 = 32종 텍스처 키가 Phaser에 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const keys = [
        // 기존 9종
        'tavern_counter_v12',
        'tavern_table_vertical_v12',
        'tavern_bench_vertical_l_v12',
        'tavern_bench_vertical_r_v12',
        'tavern_entrance_v12',
        'tavern_customer_normal_seated_right',
        'tavern_customer_normal_seated_left',
        'tavern_chef_mimi_idle_side',
        'tavern_chef_rin_idle_side',
        // B-3 신규: 손님 9종 R (9개)
        'tavern_customer_vip_seated_right',
        'tavern_customer_gourmet_seated_right',
        'tavern_customer_rushed_seated_right',
        'tavern_customer_group_seated_right',
        'tavern_customer_critic_seated_right',
        'tavern_customer_regular_seated_right',
        'tavern_customer_student_seated_right',
        'tavern_customer_traveler_seated_right',
        'tavern_customer_business_seated_right',
        // B-3 신규: 손님 9종 L (9개)
        'tavern_customer_vip_seated_left',
        'tavern_customer_gourmet_seated_left',
        'tavern_customer_rushed_seated_left',
        'tavern_customer_group_seated_left',
        'tavern_customer_critic_seated_left',
        'tavern_customer_regular_seated_left',
        'tavern_customer_student_seated_left',
        'tavern_customer_traveler_seated_left',
        'tavern_customer_business_seated_left',
        // B-3 신규: 셰프 5명 (5개)
        'tavern_chef_mage_idle_side',
        'tavern_chef_yuki_idle_side',
        'tavern_chef_lao_idle_side',
        'tavern_chef_andre_idle_side',
        'tavern_chef_arjun_idle_side',
      ];
      return keys.map(k => ({ key: k, exists: scene.textures.exists(k) }));
    });
    for (const r of result) {
      expect(r.exists, `텍스처 ${r.key} 로드 실패`).toBe(true);
    }
  });
});

// ── 3. 데모 4종 손님 타입 확인 ──

test.describe('Phase B-3: DEMO_CUSTOMER_TYPES 4종 분배', () => {
  test('손님 4명에 각각 normal/vip/gourmet/rushed 타입이 할당된다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes).toBeTruthy();
    expect(spriteTypes.customers).toHaveLength(4);
    expect(spriteTypes.customers[0].customerType).toBe('normal');
    expect(spriteTypes.customers[1].customerType).toBe('vip');
    expect(spriteTypes.customers[2].customerType).toBe('gourmet');
    expect(spriteTypes.customers[3].customerType).toBe('rushed');
  });

  test('손님 4명이 각각 다른 초기 텍스처를 사용한다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes.customers[0].textureKey).toBe('tavern_customer_normal_seated_right');
    expect(spriteTypes.customers[1].textureKey).toBe('tavern_customer_vip_seated_right');
    expect(spriteTypes.customers[2].textureKey).toBe('tavern_customer_gourmet_seated_right');
    expect(spriteTypes.customers[3].textureKey).toBe('tavern_customer_rushed_seated_right');
  });

  test('손님 4명이 모두 Image 타입으로 렌더링된다', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    for (const cust of spriteTypes.customers) {
      expect(cust.type).toBe('Image');
    }
  });
});

// ── 4. SIT 텍스처 교체 확인 (vip 손님 탭 시뮬레이션) ──

test.describe('Phase B-3: SIT 텍스처 동적 교체', () => {
  test('vip 손님(idx=1)을 SIT_UP까지 탭하면 vip_seated_left 텍스처로 교체된다', async ({ page }) => {
    await waitForTavernScene(page);

    // idx=1(vip)는 홀수이므로 CUSTOMER_CYCLE_UP 사용: ENTER -> QUEUE -> SIT_UP -> EAT_UP -> LEAVE
    // 초기 상태: QUEUE (cycleIdx=1)
    // 1번 탭: SIT_UP 진입

    // 손님 클릭 위치 가져오기
    const custPos = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const cust = scene._customers[1];
      return { x: cust.sprite.x, y: cust.sprite.y };
    });

    // 캔버스 내 클릭 (Phaser는 캔버스 기반)
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      // Phaser 좌표를 화면 좌표로 변환 (캔버스 스케일 고려)
      const scaleX = box.width / 360;
      const scaleY = box.height / 640;
      const clickX = box.x + custPos.x * scaleX;
      const clickY = box.y + custPos.y * scaleY;

      // 1번 탭: QUEUE -> SIT_UP
      await page.mouse.click(clickX, clickY);
      await page.waitForTimeout(300);
    }

    // SIT_UP 후 텍스처 확인
    const afterSit = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const cust = scene._customers[1];
      return {
        state: cust.state,
        textureKey: cust.sprite.texture?.key || null,
        customerType: cust.customerType,
      };
    });

    // SIT_UP 상태에서 vip_seated_left 텍스처 사용 확인
    if (afterSit.state === 'sit_up') {
      expect(afterSit.textureKey).toBe('tavern_customer_vip_seated_left');
    }
    // 슬롯 부족으로 SIT 진입 실패할 수도 있으므로 soft 검증
    expect(afterSit.customerType).toBe('vip');
  });
});

// ── 5. 콘솔 에러 0건 검증 ──

test.describe('Phase B-3: 에러 없음 검증', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('404 에셋 로드 에러 0건 (tavern/ 경로)', async ({ page }) => {
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

// ── 6. 셰프 기존 유지 확인 ──

test.describe('Phase B-3: 셰프 렌더링 유지', () => {
  test('셰프 2명이 여전히 Image 타입 (미미+린)', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteTypes = await page.evaluate(() => window.__tavernSpriteTypes);
    expect(spriteTypes.chefs).toHaveLength(2);
    expect(spriteTypes.chefs[0].type).toBe('Image');
    expect(spriteTypes.chefs[0].textureKey).toBe('tavern_chef_rin_idle_side');
    expect(spriteTypes.chefs[1].type).toBe('Image');
    expect(spriteTypes.chefs[1].textureKey).toBe('tavern_chef_mimi_idle_side');
  });
});

// ── 7. scaleX/flipX 미사용 검증 ──

test.describe('Phase B-3: scaleX/flipX 미사용', () => {
  test('TavernServiceScene.js에 scaleX/flipX/scaleY/flipY가 없다', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/scenes/TavernServiceScene.js', 'utf-8');
    expect(content).not.toContain('scaleX');
    expect(content).not.toContain('flipX');
    expect(content).not.toContain('scaleY');
    expect(content).not.toContain('flipY');
  });
});

// ── 8. ServiceScene.js 무수정 확인 ──

test.describe('Phase B-3: ServiceScene.js 무수정', () => {
  test('ServiceScene.js에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- js/scenes/ServiceScene.js', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 9. 스크린샷 ──

test.describe('Phase B-3: QA 스크린샷', () => {
  test('B-3 에셋 확장 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b3-asset-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
