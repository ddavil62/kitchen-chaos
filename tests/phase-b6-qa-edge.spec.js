/**
 * @fileoverview Phase B-6 QA 엣지케이스 테스트 (QA 독자 도출).
 * 정상 동작 외 경계값, 동시성, 해상도 혼재, 렌더 안정성을 공격적으로 검증.
 */
import { test, expect } from '@playwright/test';

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

// ── 1. chef_mimi / chef_rin 16x24 레거시 에셋과 32x48 신규 에셋 동시 렌더 ──

test.describe('B-6 QA Edge: 레거시+신규 해상도 혼재', () => {
  test('chef_mimi_idle_side(16x24)와 chef_mage_idle_side(32x48)가 동시 로드되어도 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    const texInfo = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return {
        mimi: scene.textures.exists('tavern_chef_mimi_idle_side'),
        mage: scene.textures.exists('tavern_chef_mage_idle_side'),
      };
    });
    expect(texInfo.mimi).toBe(true);
    expect(texInfo.mage).toBe(true);
    expect(errors).toEqual([]);
  });

  test('chef_mimi(16x24)의 setDisplaySize(32,48)가 정상 적용된다', async ({ page }) => {
    await waitForTavernScene(page);
    const chefDisplaySize = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // _chefs[1]이 mimi (idx=0은 rin, idx=1은 mimi)
      const chefSprite = scene._chefs[1]?.sprite;
      if (!chefSprite) return null;
      return {
        displayWidth: chefSprite.displayWidth,
        displayHeight: chefSprite.displayHeight,
        type: chefSprite.type,
      };
    });
    expect(chefDisplaySize).not.toBeNull();
    expect(chefDisplaySize.displayWidth).toBe(32);
    expect(chefDisplaySize.displayHeight).toBe(48);
  });
});

// ── 2. spritesheet 프레임 추출 정상 여부 (모든 30개 walk 시트에서 4프레임) ──

test.describe('B-6 QA Edge: spritesheet 프레임 추출', () => {
  test('모든 walk spritesheet에서 정확히 4프레임이 추출된다', async ({ page }) => {
    await waitForTavernScene(page);
    const frameData = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const types = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      const chefs = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      const results = [];
      for (const t of types) {
        for (const side of ['walk_r', 'walk_l']) {
          const key = `tavern_customer_${t}_${side}`;
          const tex = scene.textures.get(key);
          const frameCount = tex ? Object.keys(tex.frames).filter(k => k !== '__BASE').length : 0;
          results.push({ key, frameCount });
        }
      }
      for (const n of chefs) {
        for (const side of ['walk_r', 'walk_l']) {
          const key = `tavern_chef_${n}_${side}`;
          const tex = scene.textures.get(key);
          const frameCount = tex ? Object.keys(tex.frames).filter(k => k !== '__BASE').length : 0;
          results.push({ key, frameCount });
        }
      }
      return results;
    });
    expect(frameData.length).toBe(30);
    for (const f of frameData) {
      expect(f.frameCount, `${f.key} should have 4 frames, got ${f.frameCount}`).toBe(4);
    }
  });
});

// ── 3. W/A/S 키 연타 (B-4 walk 회귀 + B-6 크기 변경 영향) ──

test.describe('B-6 QA Edge: B-4 walk 키 연타 회귀', () => {
  test('W 키 20연타 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('W');
    }
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('W/A/S 빠른 교대 20회 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    const keys = ['W', 'A', 'S'];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press(keys[i % 3]);
    }
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});

// ── 4. 손님 상태 순환 (탭) 시 에러 없음 ──

test.describe('B-6 QA Edge: 손님 상태 순환', () => {
  test('손님 4명 전원 5단계 순환 완료 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);

    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const issues = [];
      for (let i = 0; i < 4; i++) {
        const cust = scene._customers[i];
        if (!cust) { issues.push(`customer ${i} not found`); continue; }
        // 5번 순환 (QUEUE -> SIT -> EAT -> LEAVE -> ENTER -> QUEUE)
        for (let j = 0; j < 5; j++) {
          scene._cycleCustomerState(cust);
        }
      }
      return issues;
    });
    expect(result).toEqual([]);
    expect(errors).toEqual([]);
  });
});

// ── 5. 캐릭터 배치 좌표 NaN/Infinity 검증 ──

test.describe('B-6 QA Edge: 좌표 유효성', () => {
  test('셰프 스프라이트 좌표에 NaN/Infinity 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const coords = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._chefs.map((c, i) => ({
        idx: i,
        x: c.sprite.x,
        y: c.sprite.y,
        displayWidth: c.sprite.displayWidth,
        displayHeight: c.sprite.displayHeight,
      }));
    });
    for (const c of coords) {
      expect(Number.isFinite(c.x), `chef ${c.idx} x is ${c.x}`).toBe(true);
      expect(Number.isFinite(c.y), `chef ${c.idx} y is ${c.y}`).toBe(true);
      expect(Number.isFinite(c.displayWidth), `chef ${c.idx} displayWidth is ${c.displayWidth}`).toBe(true);
      expect(Number.isFinite(c.displayHeight), `chef ${c.idx} displayHeight is ${c.displayHeight}`).toBe(true);
    }
  });

  test('손님 스프라이트 좌표에 NaN/Infinity 없음', async ({ page }) => {
    await waitForTavernScene(page);
    const coords = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene._customers.map((c, i) => ({
        idx: i,
        x: c.sprite.x,
        y: c.sprite.y,
        displayWidth: c.sprite.displayWidth,
        displayHeight: c.sprite.displayHeight,
      }));
    });
    for (const c of coords) {
      expect(Number.isFinite(c.x), `customer ${c.idx} x is ${c.x}`).toBe(true);
      expect(Number.isFinite(c.y), `customer ${c.idx} y is ${c.y}`).toBe(true);
      expect(Number.isFinite(c.displayWidth), `customer ${c.idx} displayWidth is ${c.displayWidth}`).toBe(true);
      expect(Number.isFinite(c.displayHeight), `customer ${c.idx} displayHeight is ${c.displayHeight}`).toBe(true);
    }
  });
});

// ── 6. 모바일 뷰포트 렌더 안정성 ──

test.describe('B-6 QA Edge: 모바일 뷰포트', () => {
  test('320x568 (iPhone SE) 뷰포트에서 에러 없음', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-mobile-320x568.png',
    });
  });

  test('412x915 (Galaxy S21) 뷰포트에서 에러 없음', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});

// ── 7. 전체 텍스처 키 정합성 (중복/누락) ──

test.describe('B-6 QA Edge: 텍스처 키 정합성', () => {
  test('tavern_ 접두사 텍스처 키에 중복이 없다', async ({ page }) => {
    await waitForTavernScene(page);
    const keys = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      return scene.textures.getTextureKeys().filter(k => k.startsWith('tavern_'));
    });
    const unique = new Set(keys);
    expect(keys.length).toBe(unique.size);
  });

  test('모든 B-6 대상 에셋 텍스처가 존재한다 (55장 매핑)', async ({ page }) => {
    await waitForTavernScene(page);
    const missing = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const types = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      const chefs = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      const missing = [];
      // seated 20
      for (const t of types) {
        if (!scene.textures.exists(`tavern_customer_${t}_seated_right`)) missing.push(`tavern_customer_${t}_seated_right`);
        if (!scene.textures.exists(`tavern_customer_${t}_seated_left`)) missing.push(`tavern_customer_${t}_seated_left`);
      }
      // walk customer 20
      for (const t of types) {
        if (!scene.textures.exists(`tavern_customer_${t}_walk_r`)) missing.push(`tavern_customer_${t}_walk_r`);
        if (!scene.textures.exists(`tavern_customer_${t}_walk_l`)) missing.push(`tavern_customer_${t}_walk_l`);
      }
      // chef idle 5
      for (const n of chefs) {
        if (!scene.textures.exists(`tavern_chef_${n}_idle_side`)) missing.push(`tavern_chef_${n}_idle_side`);
      }
      // chef walk 10
      for (const n of chefs) {
        if (!scene.textures.exists(`tavern_chef_${n}_walk_r`)) missing.push(`tavern_chef_${n}_walk_r`);
        if (!scene.textures.exists(`tavern_chef_${n}_walk_l`)) missing.push(`tavern_chef_${n}_walk_l`);
      }
      return missing;
    });
    expect(missing).toEqual([]);
  });
});

// ── 8. 콘솔 경고/에러 0건 (full session) ──

test.describe('B-6 QA Edge: 콘솔 클린', () => {
  test('씬 로드 + 5초 유지 시 JS 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(5000);
    expect(errors).toEqual([]);
  });

  test('모든 에셋 요청이 200 응답 (404/500 없음)', async ({ page }) => {
    const failedRequests = [];
    page.on('response', response => {
      if (response.url().includes('/assets/') && response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    await waitForTavernScene(page);
    await page.waitForTimeout(3000);
    expect(failedRequests).toEqual([]);
  });
});

// ── 9. 스크린샷 ──

test.describe('B-6 QA Edge: 스크린샷', () => {
  test('셰프 영역 클로즈업', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-chef-closeup.png',
      clip: { x: 0, y: 50, width: 150, height: 200 },
    });
  });

  test('손님 영역 클로즈업', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-customer-closeup.png',
      clip: { x: 300, y: 70, width: 60, height: 80 },
    });
  });

  test('전체 레이아웃 (QA 전용)', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-qa-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
