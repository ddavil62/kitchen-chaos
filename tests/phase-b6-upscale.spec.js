/**
 * @fileoverview Phase B-6 해상도 업스케일 검증 테스트.
 * 손님 10종 + 셰프 5명 64x64 에셋 55장 + spritesheet frameWidth/frameHeight 갱신 검증.
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

const CUSTOMER_TYPES = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
const CHEF_NAMES = ['mage', 'yuki', 'lao', 'andre', 'arjun'];

// ── 1. Seated PNG 20장 HTTP 200 검증 ──

test.describe('Phase B-6: seated 에셋 HTTP 200', () => {
  for (const t of CUSTOMER_TYPES) {
    test(`customer_${t}_seated_right.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/customer_${t}_seated_right.png`);
      expect(response.status()).toBe(200);
    });

    test(`customer_${t}_seated_left.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/customer_${t}_seated_left.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 2. Chef idle_side PNG 5장 HTTP 200 검증 ──

test.describe('Phase B-6: chef idle_side 에셋 HTTP 200', () => {
  for (const name of CHEF_NAMES) {
    test(`chef_${name}_idle_side.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/chef_${name}_idle_side.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 3. Walk PNG 30장 HTTP 200 검증 ──

test.describe('Phase B-6: walk 시트 HTTP 200', () => {
  for (const t of CUSTOMER_TYPES) {
    test(`customer_${t}_walk_r.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/customer_${t}_walk_r.png`);
      expect(response.status()).toBe(200);
    });

    test(`customer_${t}_walk_l.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/customer_${t}_walk_l.png`);
      expect(response.status()).toBe(200);
    });
  }

  for (const name of CHEF_NAMES) {
    test(`chef_${name}_walk_r.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/chef_${name}_walk_r.png`);
      expect(response.status()).toBe(200);
    });

    test(`chef_${name}_walk_l.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/chef_${name}_walk_l.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 4. Spritesheet frameWidth=64, frameHeight=64 검증 (Phase D 업스케일) ──

test.describe('Phase B-6: spritesheet 프레임 규격 64x64', () => {
  test('손님 walk spritesheet frameWidth=64, frameHeight=64', async ({ page }) => {
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
            sizes.push({ key, width: frame.width, height: frame.height });
          }
        }
      }
      return sizes;
    });
    expect(frameSizes.length).toBeGreaterThanOrEqual(20);
    for (const f of frameSizes) {
      expect(f.width, `${f.key} frameWidth`).toBe(64);
      expect(f.height, `${f.key} frameHeight`).toBe(64);
    }
  });

  test('셰프 walk spritesheet frameWidth=32, frameHeight=48 (Phase D 스코프 외)', async ({ page }) => {
    await waitForTavernScene(page);
    const frameSizes = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const names = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      const sizes = [];
      for (const n of names) {
        for (const side of ['walk_r', 'walk_l']) {
          const key = `tavern_chef_${n}_${side}`;
          const tex = scene.textures.get(key);
          if (tex && tex.frames && tex.frames['0']) {
            const frame = tex.frames['0'];
            sizes.push({ key, width: frame.width, height: frame.height });
          }
        }
      }
      return sizes;
    });
    expect(frameSizes.length).toBeGreaterThanOrEqual(10);
    for (const f of frameSizes) {
      expect(f.width, `${f.key} frameWidth`).toBe(32);
      expect(f.height, `${f.key} frameHeight`).toBe(48);
    }
  });
});

// ── 5. preload 총 텍스처 수 확인 (기존 62 이상) ──

test.describe('Phase B-6: preload 수량', () => {
  test('ASSET_MODE=real 상태에서 62개 이상 tavern_ 텍스처 로드', async ({ page }) => {
    await waitForTavernScene(page);
    const textureCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const allKeys = scene.textures.getTextureKeys();
      const tavernKeys = allKeys.filter(k => k.startsWith('tavern_'));
      return tavernKeys.length;
    });
    expect(textureCount).toBeGreaterThanOrEqual(62);
  });
});

// ── 6. ASSET_MODE 확인 ──

test.describe('Phase B-6: ASSET_MODE real', () => {
  test('ASSET_MODE는 real이다', async ({ page }) => {
    await waitForTavernScene(page);
    const mode = await page.evaluate(() => window.__tavernAssetMode);
    expect(mode).toBe('real');
  });
});

// ── 7. 에러 0건 ──

test.describe('Phase B-6: 에러 없음', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('에셋 404 0건 (tavern/ 경로)', async ({ page }) => {
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

// ── 8. scaleX/flipX 미사용 검증 ──

test.describe('Phase B-6: scaleX/flipX 미사용', () => {
  test('TavernServiceScene.js에 scaleX/flipX/scaleY/flipY가 없다', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('js/scenes/TavernServiceScene.js', 'utf-8');
    expect(content).not.toContain('scaleX');
    expect(content).not.toContain('flipX');
    expect(content).not.toContain('scaleY');
    expect(content).not.toContain('flipY');
  });
});

// ── 9. ServiceScene.js 무수정 확인 ──

test.describe('Phase B-6: ServiceScene.js 무수정', () => {
  test('ServiceScene.js에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- js/scenes/ServiceScene.js', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 10. tavern_dummy/ 변경 0건 확인 ──

test.describe('Phase B-6: tavern_dummy 무수정', () => {
  test('tavern_dummy/ 디렉토리에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- assets/tavern_dummy/', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 11. 레거시 백업 검증 ──

test.describe('Phase B-6: 레거시 백업', () => {
  test('.legacy-b5/ 디렉토리에 기존 에셋 보존', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const legacyDir = path.resolve('assets/tavern/.legacy-b5');
    expect(fs.existsSync(legacyDir)).toBe(true);
    const files = fs.readdirSync(legacyDir).filter(f => f.endsWith('.png'));
    // 기존 에셋: 20 seated + 20 walk (customer) + 7 chef idle + 10 chef walk = 57
    expect(files.length).toBeGreaterThanOrEqual(40);
  });
});

// ── 12. 스크린샷 ──

test.describe('Phase B-6: QA 스크린샷', () => {
  test('B-6 업스케일 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b6-upscale-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
