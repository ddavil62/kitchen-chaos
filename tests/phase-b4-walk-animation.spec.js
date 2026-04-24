/**
 * @fileoverview Phase B-4 walk 애니메이션 검증 테스트.
 * 손님 10종 walk_l/walk_r 스프라이트시트 20장 + 애니메이션 등록 20개 + 데모 키 동작 검증.
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

const WALK_TYPES = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];

// ── 1. Walk 시트 20개 HTTP 200 검증 ──

test.describe('Phase B-4: walk 시트 HTTP 200', () => {
  for (const t of WALK_TYPES) {
    test(`assets/tavern/customer_${t}_walk_r.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/customer_${t}_walk_r.png`);
      expect(response.status()).toBe(200);
    });

    test(`assets/tavern/customer_${t}_walk_l.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/customer_${t}_walk_l.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 2. Walk 텍스처 등록 확인 (20개) ──

test.describe('Phase B-4: walk 텍스처 등록', () => {
  test('10종 walk_r + walk_l = 20개 spritesheet 텍스처가 Phaser에 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const types = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      return types.flatMap(t => [
        { key: `tavern_customer_${t}_walk_r`, exists: scene.textures.exists(`tavern_customer_${t}_walk_r`) },
        { key: `tavern_customer_${t}_walk_l`, exists: scene.textures.exists(`tavern_customer_${t}_walk_l`) },
      ]);
    });
    for (const r of result) {
      expect(r.exists, `텍스처 ${r.key} 로드 실패`).toBe(true);
    }
    expect(result).toHaveLength(20);
  });
});

// ── 3. Walk 애니메이션 등록 확인 (window.__tavernWalkAnims) ──

test.describe('Phase B-4: walk 애니메이션 등록', () => {
  test('window.__tavernWalkAnims에 20개 애니메이션 키가 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const walkAnims = await page.evaluate(() => window.__tavernWalkAnims);
    expect(walkAnims).toBeTruthy();
    expect(walkAnims.registered).toHaveLength(20);

    const types = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
    for (const t of types) {
      expect(walkAnims.exists[t].walk_l, `${t} walk_l 애니메이션 미등록`).toBe(true);
      expect(walkAnims.exists[t].walk_r, `${t} walk_r 애니메이션 미등록`).toBe(true);
    }
  });

  test('각 walk 애니메이션이 4프레임, 8fps, 무한반복으로 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const animDetails = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const types = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      const details = [];
      for (const t of types) {
        for (const side of ['walk_r', 'walk_l']) {
          const key = `customer_${t}_${side}`;
          const anim = scene.anims.get(key);
          if (anim) {
            details.push({
              key,
              frameCount: anim.frames.length,
              frameRate: anim.frameRate,
              repeat: anim.repeat,
            });
          } else {
            details.push({ key, frameCount: 0, frameRate: 0, repeat: 0 });
          }
        }
      }
      return details;
    });
    expect(animDetails).toHaveLength(20);
    for (const d of animDetails) {
      expect(d.frameCount, `${d.key} 프레임 수`).toBe(4);
      expect(d.frameRate, `${d.key} frameRate`).toBe(8);
      expect(d.repeat, `${d.key} repeat`).toBe(-1);
    }
  });
});

// ── 4. Spritesheet 프레임 크기 검증 (16x24) ──

test.describe('Phase B-4: spritesheet 프레임 규격', () => {
  test('walk spritesheet의 frameWidth=16, frameHeight=24', async ({ page }) => {
    await waitForTavernScene(page);
    const frameSizes = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const types = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      const sizes = [];
      for (const t of types) {
        for (const side of ['walk_r', 'walk_l']) {
          const key = `tavern_customer_${t}_${side}`;
          const tex = scene.textures.get(key);
          if (tex && tex.frames && tex.frames['0']) {
            const frame = tex.frames['0'];
            sizes.push({
              key,
              width: frame.width,
              height: frame.height,
            });
          }
        }
      }
      return sizes;
    });
    expect(frameSizes.length).toBeGreaterThanOrEqual(20);
    for (const f of frameSizes) {
      expect(f.width, `${f.key} frameWidth`).toBe(16);
      expect(f.height, `${f.key} frameHeight`).toBe(24);
    }
  });
});

// ── 5. preload realAssets 총 수량 확인 ──

test.describe('Phase B-4: preload 수량', () => {
  test('ASSET_MODE=real 상태에서 기존 32개 image + walk 20개 spritesheet = 52개 이상 로드', async ({ page }) => {
    await waitForTavernScene(page);
    const textureCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      // tavern_ 접두사 텍스처 모두 세기
      const allKeys = scene.textures.getTextureKeys();
      const tavernKeys = allKeys.filter(k => k.startsWith('tavern_'));
      return tavernKeys.length;
    });
    // 기존 32개 image + walk 20개 spritesheet = 52개
    expect(textureCount).toBeGreaterThanOrEqual(52);
  });
});

// ── 6. 콘솔 에러 0건 ──

test.describe('Phase B-4: 에러 없음', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('walk 에셋 404 0건 (tavern/ 경로)', async ({ page }) => {
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

// ── 7. scaleX/flipX 미사용 검증 ──

test.describe('Phase B-4: scaleX/flipX 미사용', () => {
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

test.describe('Phase B-4: ServiceScene.js 무수정', () => {
  test('ServiceScene.js에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- js/scenes/ServiceScene.js', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 9. tavern_dummy/ 변경 0건 확인 ──

test.describe('Phase B-4: tavern_dummy 무수정', () => {
  test('tavern_dummy/ 디렉토리에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- assets/tavern_dummy/', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 10. 스크린샷 ──

test.describe('Phase B-4: QA 스크린샷', () => {
  test('B-4 walk 에셋 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b4-walk-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
