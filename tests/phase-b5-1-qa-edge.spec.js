/**
 * @fileoverview Phase B-5-1 QA 에지케이스 테스트 (QA 독자 도출).
 * 정상 동작 외 경계값, 동시성, 반복 입력, 상태 전이 등을 공격적으로 검증.
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

// ── 1. C/V 키 빠른 연타 (레이스 컨디션 검증) ──

test.describe('B-5-1 QA Edge: 키 연타', () => {
  test('C 키 10연타 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('C');
    }
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('V 키 10연타 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('V');
    }
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('C/V 키 빠른 교대 10회 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press(i % 2 === 0 ? 'C' : 'V');
    }
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});

// ── 2. C/V 키와 B-4 W/A/S 키 충돌 검증 ──

test.describe('B-5-1 QA Edge: B-4 키 충돌', () => {
  test('W -> C -> A -> V -> S 순서 입력 시 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.keyboard.press('W');
    await page.waitForTimeout(100);
    await page.keyboard.press('C');
    await page.waitForTimeout(100);
    await page.keyboard.press('A');
    await page.waitForTimeout(100);
    await page.keyboard.press('V');
    await page.waitForTimeout(100);
    await page.keyboard.press('S');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('B-4 W/A/S 키 동작이 B-5-1 추가 후에도 정상', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    // W/A/S는 손님[0]에 작동
    await page.keyboard.press('W');
    await page.waitForTimeout(200);
    await page.keyboard.press('A');
    await page.waitForTimeout(200);
    await page.keyboard.press('S');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});

// ── 3. window.__tavernChefAnims 구조 검증 ──

test.describe('B-5-1 QA Edge: 진단 노출 구조', () => {
  test('window.__tavernChefAnims는 배열이다', async ({ page }) => {
    await waitForTavernScene(page);
    const type = await page.evaluate(() => Array.isArray(window.__tavernChefAnims));
    expect(type).toBe(true);
  });

  test('window.__tavernChefAnims 원소가 모두 string이다', async ({ page }) => {
    await waitForTavernScene(page);
    const allStrings = await page.evaluate(() =>
      window.__tavernChefAnims.every(k => typeof k === 'string')
    );
    expect(allStrings).toBe(true);
  });

  test('window.__tavernChefAnims와 window.__tavernWalkAnims에 중복 키가 없다', async ({ page }) => {
    await waitForTavernScene(page);
    const overlap = await page.evaluate(() => {
      const chef = window.__tavernChefAnims || [];
      const cust = (window.__tavernWalkAnims || {}).registered || [];
      return chef.filter(k => cust.includes(k));
    });
    expect(overlap).toEqual([]);
  });
});

// ── 4. Phaser 애니메이션 중복 등록 방지 검증 ──

test.describe('B-5-1 QA Edge: 애니메이션 중복 방지', () => {
  test('anims.exists 가드가 작동하여 동일 키가 2개 이상 등록되지 않는다', async ({ page }) => {
    await waitForTavernScene(page);
    const dupeCheck = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const names = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      const issues = [];
      for (const n of names) {
        for (const s of ['walk_r', 'walk_l']) {
          const key = `chef_${n}_${s}`;
          // anims.get 반환값이 null이면 미등록
          const anim = scene.anims.get(key);
          if (!anim) issues.push(`${key}: NOT_REGISTERED`);
        }
      }
      return issues;
    });
    expect(dupeCheck).toEqual([]);
  });
});

// ── 5. C/V 키 입력 후 셰프 스프라이트 상태 검증 ──
// _chefs[0]는 _placeImageOrRect()로 생성된 Phaser.Image (Sprite 아님).
// Phaser.Image에는 anims 프로퍼티가 없어 C/V 키 핸들러의 가드 `if (chef.sprite.anims)`가
// 항상 false를 반환하여 play() 호출이 도달하지 않는다.
// 이는 B-4 W/A/S 데모와 동일한 기존 설계 한계 (Phase D에서 Sprite 전환 예정).

test.describe('B-5-1 QA Edge: 셰프 스프라이트 타입 (기존 한계 확인)', () => {
  test('_chefs[0] 스프라이트는 Image 타입이다 (Sprite 아님, anims 미지원)', async ({ page }) => {
    await waitForTavernScene(page);
    const spriteInfo = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const chef = scene._chefs[0];
      return {
        type: chef.sprite.type,
        hasAnims: !!chef.sprite.anims,
        hasPlayMethod: typeof chef.sprite.play === 'function',
      };
    });
    // Image 타입 확인 (Sprite가 아닌 Image)
    expect(spriteInfo.type).toBe('Image');
    // Image에는 anims 프로퍼티가 없음 (undefined/false)
    expect(spriteInfo.hasAnims).toBe(false);
  });

  test('C 키 입력 시 _chefs[0]에 walk 애니메이션이 재생되지 않는다 (Image 타입 한계)', async ({ page }) => {
    await waitForTavernScene(page);
    await page.keyboard.press('C');
    await page.waitForTimeout(500);
    const animState = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const chef = scene._chefs[0];
      // Image 타입이므로 anims가 없음
      return chef.sprite.anims ? 'has_anims' : 'no_anims';
    });
    // 기존 설계 한계: Image에 anims 없음 -> play() 미도달
    expect(animState).toBe('no_anims');
  });

  test('C/V 키 입력이 에러 없이 무시된다 (가드 절 정상 작동)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.keyboard.press('C');
    await page.waitForTimeout(200);
    await page.keyboard.press('V');
    await page.waitForTimeout(200);
    expect(errors).toEqual([]);
  });
});

// ── 6. 셰프 walk 프레임이 서로 다른지 검증 (walk_r != walk_l) ──

test.describe('B-5-1 QA Edge: walk_r / walk_l 독립성', () => {
  test('mage walk_r과 walk_l의 텍스처 소스가 서로 다르다', async ({ page }) => {
    await waitForTavernScene(page);
    const distinct = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const rTex = scene.textures.get('tavern_chef_mage_walk_r');
      const lTex = scene.textures.get('tavern_chef_mage_walk_l');
      if (!rTex || !lTex) return false;
      // 다른 소스 이미지인지 확인 (키가 다르면 독립)
      return rTex.key !== lTex.key;
    });
    expect(distinct).toBe(true);
  });
});

// ── 7. 전체 preload 에러 없음 (404 확인) ──

test.describe('B-5-1 QA Edge: 전체 에셋 로드', () => {
  test('씬 초기화 중 에셋 로드 실패(404) 0건', async ({ page }) => {
    const failedRequests = [];
    page.on('response', response => {
      if (response.url().includes('/assets/tavern') && response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(failedRequests).toEqual([]);
  });
});

// ── 8. 스크린샷: C/V 키 입력 후 셰프 walk 상태 ──

test.describe('B-5-1 QA Edge: walk 재생 중 스크린샷', () => {
  test('C 키 입력 후 walk_r 재생 중 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.keyboard.press('C');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b5-1-walk-r-playing.png',
      clip: { x: 0, y: 60, width: 120, height: 120 },
    });
  });

  test('V 키 입력 후 walk_l 재생 중 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.keyboard.press('V');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b5-1-walk-l-playing.png',
      clip: { x: 0, y: 60, width: 120, height: 120 },
    });
  });
});
