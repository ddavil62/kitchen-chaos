/**
 * @fileoverview Phase D QA 검증 — 손님 64px 업그레이드 + 2 quad 1열 레이아웃 전환.
 * TC-1 ~ TC-12: 에셋 HTTP 200, 스프라이트 규격, 가구 규격, 레이아웃 상수, 런타임, 씬 에러, 스크린샷.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── 상수 ──

const CUSTOMER_TYPES = [
  'normal', 'vip', 'gourmet', 'rushed', 'group',
  'critic', 'regular', 'student', 'traveler', 'business',
];

const BASE_URL = 'http://localhost:5173';

// ── 헬퍼 ──

async function waitForTavernScene(page) {
  await page.goto(`${BASE_URL}/?scene=tavern`);
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
  await page.waitForTimeout(1500);
}

// ── TC-1: 에셋 HTTP 200 ──

test.describe('TC-1: 에셋 HTTP 200', () => {
  for (const t of CUSTOMER_TYPES) {
    for (const suffix of ['walk_r', 'walk_l']) {
      test(`customer_${t}_${suffix}.png HTTP 200`, async ({ page }) => {
        const res = await page.request.get(`${BASE_URL}/assets/tavern/customer_${t}_${suffix}.png`);
        expect(res.status(), `customer_${t}_${suffix}.png`).toBe(200);
      });
    }
  }
  for (const t of CUSTOMER_TYPES) {
    for (const suffix of ['seated_right', 'seated_left']) {
      test(`customer_${t}_${suffix}.png HTTP 200`, async ({ page }) => {
        const res = await page.request.get(`${BASE_URL}/assets/tavern/customer_${t}_${suffix}.png`);
        expect(res.status(), `customer_${t}_${suffix}.png`).toBe(200);
      });
    }
  }
});

// ── TC-2: walk 스프라이트시트 규격 256x64 ──

test.describe('TC-2: walk 스프라이트시트 규격 256x64', () => {
  for (const t of CUSTOMER_TYPES) {
    for (const suffix of ['walk_r', 'walk_l']) {
      test(`customer_${t}_${suffix}.png = 256x64`, async ({ page }) => {
        const size = await page.evaluate(async (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => reject(new Error('load failed'));
            img.src = url;
          });
        }, `${BASE_URL}/assets/tavern/customer_${t}_${suffix}.png`);
        expect(size.w, `width`).toBe(256);
        expect(size.h, `height`).toBe(64);
      });
    }
  }
});

// ── TC-3: seated 스프라이트 규격 64x64 ──

test.describe('TC-3: seated 스프라이트 규격 64x64', () => {
  for (const t of CUSTOMER_TYPES) {
    for (const suffix of ['seated_right', 'seated_left']) {
      test(`customer_${t}_${suffix}.png = 64x64`, async ({ page }) => {
        const size = await page.evaluate(async (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => reject(new Error('load failed'));
            img.src = url;
          });
        }, `${BASE_URL}/assets/tavern/customer_${t}_${suffix}.png`);
        expect(size.w, `width`).toBe(64);
        expect(size.h, `height`).toBe(64);
      });
    }
  }
});

// ── TC-4: 가구 규격 ──

test.describe('TC-4: 가구 규격', () => {
  const furnitureSpecs = [
    { name: 'bench_vertical_l_v12.png', w: 80, h: 200 },
    { name: 'bench_vertical_r_v12.png', w: 80, h: 200 },
    { name: 'table_vertical_v12.png',   w: 64, h: 200 },
  ];

  for (const f of furnitureSpecs) {
    test(`${f.name} = ${f.w}x${f.h}`, async ({ page }) => {
      const size = await page.evaluate(async (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => reject(new Error('load failed'));
          img.src = url;
        });
      }, `${BASE_URL}/assets/tavern/${f.name}`);
      expect(size.w, `${f.name} width`).toBe(f.w);
      expect(size.h, `${f.name} height`).toBe(f.h);
    });
  }
});

// ── TC-5: BENCH_CONFIG 상수 확인 ──

test.describe('TC-5: BENCH_CONFIG 상수 확인', () => {
  test('tavernLayoutData.js BENCH_CONFIG QUAD_W=232, BENCH_W=80, TABLE_W=64', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'data', 'tavernLayoutData.js'), 'utf-8',
    );
    expect(content).toMatch(/QUAD_W:\s*232/);
    expect(content).toMatch(/BENCH_W:\s*80/);
    expect(content).toMatch(/TABLE_W:\s*64/);
    expect(content).toMatch(/BENCH_H:\s*200/);
    expect(content).toMatch(/QUAD_H:\s*224/);
    expect(content).toMatch(/BENCH_R_LEFT:\s*148/);
    expect(content).toMatch(/TABLE_LEFT:\s*84/);
    expect(content).toMatch(/TABLE_H:\s*200/);
    expect(content).toMatch(/AISLE_V:\s*0/);
    expect(content).toMatch(/AISLE_H:\s*40/);
  });
});

// ── TC-6: TABLE_SET_ANCHORS 2 quad 확인 ──

test.describe('TC-6: TABLE_SET_ANCHORS 2 quad', () => {
  test('TABLE_SET_ANCHORS 길이 2, quadLeft=128, quadTop=64/328', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'data', 'tavernLayoutData.js'), 'utf-8',
    );
    // 2개 엔트리 확인
    const anchorMatches = content.match(/quadLeft:\s*128/g);
    expect(anchorMatches).not.toBeNull();
    expect(anchorMatches.length, 'quadLeft=128 2회').toBe(2);

    // quadTop 64, 328
    expect(content).toMatch(/quadTop:\s*64/);
    expect(content).toMatch(/quadTop:\s*328/);

    // key top/bottom
    expect(content).toMatch(/key:\s*'top'/);
    expect(content).toMatch(/key:\s*'bottom'/);
  });
});

// ── TC-7: BENCH_LEFT/RIGHT_OFFSET_X 확인 ──

test.describe('TC-7: BENCH_LEFT/RIGHT_OFFSET_X', () => {
  test('BENCH_LEFT_OFFSET_X=44, BENCH_RIGHT_OFFSET_X=188', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'data', 'tavernLayoutData.js'), 'utf-8',
    );
    expect(content).toMatch(/BENCH_LEFT_OFFSET_X\s*=\s*44/);
    expect(content).toMatch(/BENCH_RIGHT_OFFSET_X\s*=\s*188/);
  });
});

// ── TC-8: TavernServiceScene frameWidth/frameHeight 확인 ──

test.describe('TC-8: TavernServiceScene frameWidth/frameHeight', () => {
  test('손님 walk frameWidth=64, frameHeight=64 (코드 검증)', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'scenes', 'TavernServiceScene.js'), 'utf-8',
    );
    // 손님 walk 스프라이트시트 로드 부분에서 frameWidth:64, frameHeight:64 확인
    // 형태: { frameWidth: 64, frameHeight: 64 }
    const customerWalkRegion = content.match(
      /손님 10종 walk[\s\S]*?for \(const t of walkTypes\)[\s\S]*?frameWidth:\s*(\d+)[\s\S]*?frameHeight:\s*(\d+)/
    );
    // 두 번째 spritesheet 로드도 확인
    expect(customerWalkRegion).not.toBeNull();
    if (customerWalkRegion) {
      expect(parseInt(customerWalkRegion[1]), 'walk frameWidth').toBe(64);
      expect(parseInt(customerWalkRegion[2]), 'walk frameHeight').toBe(64);
    }
  });

  test('셰프 walk frameWidth=32, frameHeight=48 유지 (스코프 외)', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'scenes', 'TavernServiceScene.js'), 'utf-8',
    );
    // 셰프 walk 로드 부분: "Phase D 스코프 외" 주석 이후의 frameWidth/frameHeight
    const chefSection = content.match(
      /Phase D 스코프 외[\s\S]*?chefWalkTypes[\s\S]*?\{\s*frameWidth:\s*(\d+),\s*frameHeight:\s*(\d+)\s*\}/
    );
    expect(chefSection).not.toBeNull();
    if (chefSection) {
      expect(parseInt(chefSection[1]), 'chef frameWidth').toBe(32);
      expect(parseInt(chefSection[2]), 'chef frameHeight').toBe(48);
    }
  });
});

// ── TC-9: 씬 진입 에러 0건 ──

test.describe('TC-9: 씬 진입 에러 0건', () => {
  test('?scene=tavern 진입 후 3초간 pageerror 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForTavernScene(page);
    await page.waitForTimeout(3000);

    expect(errors, 'pageerror 목록').toEqual([]);
  });

  test('에셋 404 0건', async ({ page }) => {
    const notFound = [];
    page.on('response', response => {
      if (response.status() === 404 && response.url().includes('/assets/')) {
        notFound.push(response.url());
      }
    });

    await waitForTavernScene(page);
    await page.waitForTimeout(2000);

    expect(notFound, '404 에셋 목록').toEqual([]);
  });
});

// ── TC-10: 스크린샷 캡처 ──

test.describe('TC-10: 스크린샷', () => {
  test('tavern 씬 전체 스크린샷', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: resolve(__dirname, 'screenshots', 'phase-d-full.png'),
    });
  });

  test('tavern 씬 다이닝 영역 클로즈업', async ({ page }) => {
    await waitForTavernScene(page);
    await page.screenshot({
      path: resolve(__dirname, 'screenshots', 'phase-d-dining-area.png'),
      clip: { x: 128, y: 56, width: 232, height: 504 },
    });
  });
});

// ── TC-11: 2 quad 런타임 확인 ──

test.describe('TC-11: 런타임 TABLE_SET_ANCHORS', () => {
  test('TABLE_SET_ANCHORS.length === 2 (런타임)', async ({ page }) => {
    await waitForTavernScene(page);
    const anchorsLen = await page.evaluate(() => {
      return window.__tavernLayout?.TABLE_SET_ANCHORS?.length;
    });
    expect(anchorsLen, 'TABLE_SET_ANCHORS 길이').toBe(2);
  });

  test('TABLE_SET_ANCHORS keys = [top, bottom]', async ({ page }) => {
    await waitForTavernScene(page);
    const keys = await page.evaluate(() => {
      return window.__tavernLayout?.TABLE_SET_ANCHORS?.map(a => a.key);
    });
    expect(keys, 'quad keys').toEqual(['top', 'bottom']);
  });

  test('TABLE_SET_ANCHORS quadTop = [64, 328]', async ({ page }) => {
    await waitForTavernScene(page);
    const tops = await page.evaluate(() => {
      return window.__tavernLayout?.TABLE_SET_ANCHORS?.map(a => a.quadTop);
    });
    expect(tops, 'quadTop 값').toEqual([64, 328]);
  });

  test('BENCH_CONFIG 런타임 QUAD_W=232, BENCH_H=200', async ({ page }) => {
    await waitForTavernScene(page);
    const cfg = await page.evaluate(() => {
      const c = window.__tavernBenchConfig;
      return c ? { QUAD_W: c.QUAD_W, BENCH_H: c.BENCH_H, BENCH_W: c.BENCH_W, TABLE_W: c.TABLE_W } : null;
    });
    expect(cfg).not.toBeNull();
    expect(cfg.QUAD_W, 'QUAD_W').toBe(232);
    expect(cfg.BENCH_H, 'BENCH_H').toBe(200);
    expect(cfg.BENCH_W, 'BENCH_W').toBe(80);
    expect(cfg.TABLE_W, 'TABLE_W').toBe(64);
  });
});

// ── TC-12: 슬롯 dy 값 확인 ──

test.describe('TC-12: 슬롯 dy 값', () => {
  test('lv0 slotOffsets dy = [60, 116, 172]', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'data', 'tavernLayoutData.js'), 'utf-8',
    );
    // lv0 블록 내 dy 값 추출: lv0: ~ lv3: 사이 영역에서 dy 추출
    const lv0Section = content.match(/lv0:[\s\S]*?(?=lv3:)/);
    expect(lv0Section).not.toBeNull();
    const dyMatches = lv0Section[0].match(/dy:\s*(\d+)/g);
    expect(dyMatches).not.toBeNull();
    const dyValues = dyMatches.map(m => parseInt(m.replace(/dy:\s*/, '')));
    expect(dyValues, 'dy 값 목록').toEqual([60, 116, 172]);
  });

  test('createSeatingState lv0 = 12석 (런타임)', async ({ page }) => {
    await waitForTavernScene(page);
    const totalSlots = await page.evaluate(() => {
      const state = window.__tavernLayout?.createSeatingState?.('lv0');
      if (!state) return -1;
      let total = 0;
      for (const quad of state) {
        total += (quad.left?.length || 0) + (quad.right?.length || 0);
      }
      return total;
    });
    expect(totalSlots, '총 좌석 수').toBe(12);
  });
});

// ── TC-13 (추가): 손님 _placeImageOrRect 64x64 좌표 검증 ──

test.describe('TC-13: 손님 스프라이트 좌표 코드 검증', () => {
  test('손님 _placeImageOrRect(dummyKey, x-32, y-64, 64, 64, color)', async () => {
    const content = readFileSync(
      resolve(__dirname, '..', 'js', 'scenes', 'TavernServiceScene.js'), 'utf-8',
    );
    // 손님 배치 코드에서 x-32, y-64, 64, 64 패턴 확인
    expect(content).toMatch(/x\s*-\s*32,\s*y\s*-\s*64,\s*64,\s*64/);
  });
});

// ── TC-14 (추가): QUAD 경계 검증 (런타임) ──

test.describe('TC-14: QUAD 경계 검증 런타임', () => {
  test('quad 우측 경계 = GAME_W(360)', async ({ page }) => {
    await waitForTavernScene(page);
    const boundary = await page.evaluate(() => {
      const anchors = window.__tavernLayout?.TABLE_SET_ANCHORS;
      const cfg = window.__tavernBenchConfig;
      if (!anchors || !cfg) return null;
      return anchors[0].quadLeft + cfg.QUAD_W;
    });
    expect(boundary, 'quad 우측 경계').toBe(360);
  });

  test('하단 quad 하단 경계 <= ROOM_BOTTOM_Y(560)', async ({ page }) => {
    await waitForTavernScene(page);
    const bottomEdge = await page.evaluate(() => {
      const anchors = window.__tavernLayout?.TABLE_SET_ANCHORS;
      const cfg = window.__tavernBenchConfig;
      if (!anchors || !cfg) return null;
      // 하단 quad 하단 = quadTop[bottom] + QUAD_H
      return anchors[1].quadTop + cfg.QUAD_H;
    });
    expect(bottomEdge, '하단 quad 하단').toBeLessThanOrEqual(560);
  });

  test('슬롯2 하단 quad worldY(500) <= ROOM_BOTTOM_Y(560)', async ({ page }) => {
    await waitForTavernScene(page);
    const maxWorldY = await page.evaluate(() => {
      const state = window.__tavernLayout?.createSeatingState?.('lv0');
      if (!state) return -1;
      let maxY = 0;
      for (const quad of state) {
        for (const side of ['left', 'right']) {
          for (const slot of quad[side]) {
            if (slot.worldY > maxY) maxY = slot.worldY;
          }
        }
      }
      return maxY;
    });
    expect(maxWorldY, '최대 worldY').toBeLessThanOrEqual(560);
    expect(maxWorldY, '최대 worldY = 500').toBe(500);
  });
});

// ── TC-15 (추가): 콘솔 에러 없음 (모바일 뷰포트) ──

test.describe('TC-15: 모바일 뷰포트 안정성', () => {
  test('320x568 뷰포트에서 에러 없음', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`${BASE_URL}/?scene=tavern`);
    await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: resolve(__dirname, 'screenshots', 'phase-d-mobile-320x568.png'),
    });

    expect(errors, 'mobile pageerror').toEqual([]);
  });
});

// ── TC-16 (추가): 손님 walk 런타임 frameWidth/frameHeight 확인 ──

test.describe('TC-16: 런타임 frameWidth/frameHeight', () => {
  test('손님 walk_r 텍스처 frameWidth=64, frameHeight=64 (Phaser)', async ({ page }) => {
    await waitForTavernScene(page);
    const frameInfo = await page.evaluate(() => {
      const game = window.__game;
      if (!game) return null;
      const tex = game.textures.get('tavern_customer_normal_walk_r');
      if (!tex || tex.key === '__MISSING') return null;
      const frames = tex.getFrameNames();
      const frame0 = tex.get(frames[0] || 0);
      return {
        sourceW: tex.source[0]?.width,
        sourceH: tex.source[0]?.height,
        frameW: frame0?.width,
        frameH: frame0?.height,
        frameCount: frames.length || Object.keys(tex.frames).length,
      };
    });
    expect(frameInfo).not.toBeNull();
    expect(frameInfo.sourceW, 'source width').toBe(256);
    expect(frameInfo.sourceH, 'source height').toBe(64);
    expect(frameInfo.frameW, 'frame width').toBe(64);
    expect(frameInfo.frameH, 'frame height').toBe(64);
  });
});
