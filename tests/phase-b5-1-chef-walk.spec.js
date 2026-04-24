/**
 * @fileoverview Phase B-5-1 셰프 walk 애니메이션 검증 테스트.
 * 셰프 5명 walk_l/walk_r 스프라이트시트 10장 + 애니메이션 등록 10개 + 데모 C/V 키 동작 검증.
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

const CHEF_NAMES = ['mage', 'yuki', 'lao', 'andre', 'arjun'];

// ── 1. Chef walk 시트 10개 HTTP 200 검증 ──

test.describe('Phase B-5-1: chef walk 시트 HTTP 200', () => {
  for (const name of CHEF_NAMES) {
    test(`assets/tavern/chef_${name}_walk_r.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/chef_${name}_walk_r.png`);
      expect(response.status()).toBe(200);
    });

    test(`assets/tavern/chef_${name}_walk_l.png HTTP 200`, async ({ page }) => {
      const response = await page.request.get(`http://localhost:5173/assets/tavern/chef_${name}_walk_l.png`);
      expect(response.status()).toBe(200);
    });
  }
});

// ── 2. Chef walk 텍스처 등록 확인 (10개) ──

test.describe('Phase B-5-1: chef walk 텍스처 등록', () => {
  test('5종 walk_r + walk_l = 10개 spritesheet 텍스처가 Phaser에 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const names = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      return names.flatMap(n => [
        { key: `tavern_chef_${n}_walk_r`, exists: scene.textures.exists(`tavern_chef_${n}_walk_r`) },
        { key: `tavern_chef_${n}_walk_l`, exists: scene.textures.exists(`tavern_chef_${n}_walk_l`) },
      ]);
    });
    for (const r of result) {
      expect(r.exists, `텍스처 ${r.key} 로드 실패`).toBe(true);
    }
    expect(result).toHaveLength(10);
  });
});

// ── 3. window.__tavernChefAnims 길이 10 ──

test.describe('Phase B-5-1: chef walk 애니메이션 등록', () => {
  test('window.__tavernChefAnims에 10개 애니메이션 키가 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const chefAnims = await page.evaluate(() => window.__tavernChefAnims);
    expect(chefAnims).toBeTruthy();
    expect(chefAnims).toHaveLength(10);

    const names = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
    for (const n of names) {
      expect(chefAnims).toContain(`chef_${n}_walk_r`);
      expect(chefAnims).toContain(`chef_${n}_walk_l`);
    }
  });

  test('각 chef walk 애니메이션이 4프레임, 8fps, 무한반복으로 등록되어 있다', async ({ page }) => {
    await waitForTavernScene(page);
    const animDetails = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const names = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      const details = [];
      for (const n of names) {
        for (const side of ['walk_r', 'walk_l']) {
          const key = `chef_${n}_${side}`;
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
    expect(animDetails).toHaveLength(10);
    for (const d of animDetails) {
      expect(d.frameCount, `${d.key} 프레임 수`).toBe(4);
      expect(d.frameRate, `${d.key} frameRate`).toBe(8);
      expect(d.repeat, `${d.key} repeat`).toBe(-1);
    }
  });
});

// ── 4. Spritesheet 프레임 크기 검증 (16x24) ──

test.describe('Phase B-5-1: chef spritesheet 프레임 규격', () => {
  test('chef walk spritesheet의 frameWidth=16, frameHeight=24', async ({ page }) => {
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
    expect(frameSizes.length).toBeGreaterThanOrEqual(10);
    for (const f of frameSizes) {
      expect(f.width, `${f.key} frameWidth`).toBe(16);
      expect(f.height, `${f.key} frameHeight`).toBe(24);
    }
  });
});

// ── 5. preload 수량 확인 (기존 52 + 신규 10 = 62 이상) ──

test.describe('Phase B-5-1: preload 수량', () => {
  test('ASSET_MODE=real 상태에서 기존 52개 + chef walk 10개 = 62개 이상 로드', async ({ page }) => {
    await waitForTavernScene(page);
    const textureCount = await page.evaluate(() => {
      const scene = window.__game.scene.getScene('TavernServiceScene');
      const allKeys = scene.textures.getTextureKeys();
      const tavernKeys = allKeys.filter(k => k.startsWith('tavern_'));
      return tavernKeys.length;
    });
    // 기존 32개 image + walk 20개 customer spritesheet + 10개 chef spritesheet = 62개
    expect(textureCount).toBeGreaterThanOrEqual(62);
  });
});

// ── 6. C 키 입력 시 에러 없음 ──

test.describe('Phase B-5-1: 데모 키 동작', () => {
  test('C 키 입력 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.keyboard.press('C');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('V 키 입력 시 콘솔 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.keyboard.press('V');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});

// ── 7. 에러 0건 ──

test.describe('Phase B-5-1: 에러 없음', () => {
  test('?scene=tavern 진입 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('chef walk 에셋 404 0건 (tavern/ 경로)', async ({ page }) => {
    const failedRequests = [];
    page.on('response', response => {
      if (response.url().includes('/assets/tavern/chef_') && response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    await waitForTavernScene(page);
    await page.waitForTimeout(2000);
    expect(failedRequests).toEqual([]);
  });
});

// ── 8. scaleX/flipX 미사용 검증 ──

test.describe('Phase B-5-1: scaleX/flipX 미사용', () => {
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

test.describe('Phase B-5-1: ServiceScene.js 무수정', () => {
  test('ServiceScene.js에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- js/scenes/ServiceScene.js', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 10. tavern_dummy/ 변경 0건 확인 ──

test.describe('Phase B-5-1: tavern_dummy 무수정', () => {
  test('tavern_dummy/ 디렉토리에 git diff 0줄', async () => {
    const { execSync } = await import('child_process');
    const diff = execSync('git diff HEAD -- assets/tavern_dummy/', { encoding: 'utf-8' });
    expect(diff.trim()).toBe('');
  });
});

// ── 11. 스크린샷 ──

test.describe('Phase B-5-1: QA 스크린샷', () => {
  test('B-5-1 chef walk 에셋 전체 레이아웃 캡처', async ({ page }) => {
    await waitForTavernScene(page);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'tests/screenshots/phase-b5-1-chef-walk-full.png',
      clip: { x: 0, y: 0, width: 360, height: 640 },
    });
  });
});
