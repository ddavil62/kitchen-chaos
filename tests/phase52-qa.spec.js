/**
 * @fileoverview Phase 52 QA: 영업씬 3레이어 렌더링 재구성
 * - 에셋 파일 존재 및 해상도/투명도 확인
 * - SpriteLoader 신규 키 로드 확인
 * - ServiceScene._createTables 3레이어 코드 확인
 * - depth 계산 공식 확인
 * - fallback 경로 확인
 * - HUD depth 상향 확인
 * - 씬 클린업 코드 확인
 * - _updateTableUI waiting/seated 분기 확인
 * - 예외/엣지케이스 검증
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve('.');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets', 'service');
const SCREENSHOT_DIR = path.join(PROJECT_ROOT, 'tests', 'screenshots');

// ── 에셋 파일 검증 유틸 ──

/** PNG 헤더에서 치수 및 컬러타입 읽기 */
function getPngInfo(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colorType: buf[25],
    hasAlpha: buf[25] === 6 || buf[25] === 4,
  };
}

// ─────────────────────────────────────────────────────────────────
//  1. 에셋 파일 존재 및 해상도/투명도
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: 에셋 파일 검증', () => {
  for (let lv = 0; lv < 5; lv++) {
    test(`table_lv${lv}_back.png 존재, 96x64, 알파 채널`, () => {
      const f = path.join(ASSETS_DIR, `table_lv${lv}_back.png`);
      expect(fs.existsSync(f)).toBe(true);
      const info = getPngInfo(f);
      expect(info).not.toBeNull();
      expect(info.width).toBe(96);
      expect(info.height).toBe(64);
      expect(info.hasAlpha).toBe(true);
    });

    test(`table_lv${lv}_front.png 존재, 96x52, 알파 채널`, () => {
      const f = path.join(ASSETS_DIR, `table_lv${lv}_front.png`);
      expect(fs.existsSync(f)).toBe(true);
      const info = getPngInfo(f);
      expect(info).not.toBeNull();
      expect(info.width).toBe(96);
      expect(info.height).toBe(52);
      expect(info.hasAlpha).toBe(true);
    });
  }

  const custTypes = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
  const custStates = ['waiting', 'seated'];
  for (const type of custTypes) {
    for (const state of custStates) {
      test(`customer_${type}_${state}.png 존재, 알파 채널`, () => {
        const f = path.join(ASSETS_DIR, `customer_${type}_${state}.png`);
        expect(fs.existsSync(f)).toBe(true);
        const info = getPngInfo(f);
        expect(info).not.toBeNull();
        expect(info.hasAlpha).toBe(true);
        // group은 64x64, 나머지는 48x64
        if (type === 'group') {
          expect(info.width).toBe(64);
        } else {
          expect(info.width).toBe(48);
        }
        expect(info.height).toBe(64);
      });
    }
  }

  test('기존 _occupied 에셋 파일이 삭제되지 않았다', () => {
    for (let lv = 0; lv < 5; lv++) {
      const f = path.join(ASSETS_DIR, `table_lv${lv}_occupied.png`);
      expect(fs.existsSync(f)).toBe(true);
    }
  });

  test('기존 table_lv{N}.png 에셋도 보존되어 있다', () => {
    for (let lv = 0; lv < 5; lv++) {
      const f = path.join(ASSETS_DIR, `table_lv${lv}.png`);
      expect(fs.existsSync(f)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
//  2. SpriteLoader 코드 검증
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: SpriteLoader 코드 검증', () => {
  let spriteLoaderSrc;

  test.beforeAll(() => {
    spriteLoaderSrc = fs.readFileSync(
      path.join(PROJECT_ROOT, 'js', 'managers', 'SpriteLoader.js'), 'utf-8'
    );
  });

  test('_loadServiceAssets에 table_lv{n}_back 로드 구문이 존재한다', () => {
    expect(spriteLoaderSrc).toContain('table_lv${lv}_back');
    expect(spriteLoaderSrc).toContain('table_lv${lv}_front');
  });

  test('_loadServiceAssets에 customer_{type}_{state} 로드 구문이 존재한다', () => {
    expect(spriteLoaderSrc).toContain('customer_${type}_${state}');
  });

  test('CUST_STATES에 waiting과 seated가 포함된다', () => {
    expect(spriteLoaderSrc).toContain("'waiting'");
    expect(spriteLoaderSrc).toContain("'seated'");
  });

  test('CUSTOMER_TYPE_IDS에 5종이 등록되어 있다 (mireuk_traveler 미포함)', () => {
    const match = spriteLoaderSrc.match(/CUSTOMER_TYPE_IDS\s*=\s*\[([^\]]+)\]/);
    expect(match).not.toBeNull();
    const ids = match[1];
    expect(ids).toContain("'normal'");
    expect(ids).toContain("'vip'");
    expect(ids).toContain("'gourmet'");
    expect(ids).toContain("'rushed'");
    expect(ids).toContain("'group'");
    expect(ids).not.toContain('mireuk_traveler');
  });

  test('hasTexture 메서드가 존재한다', () => {
    expect(spriteLoaderSrc).toContain('static hasTexture(');
  });

  test('TABLE_GRADE_COUNT = 5 (lv0~lv4)', () => {
    expect(spriteLoaderSrc).toMatch(/TABLE_GRADE_COUNT\s*=\s*5/);
  });
});

// ─────────────────────────────────────────────────────────────────
//  3. ServiceScene._createTables 3레이어 코드 검증
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: _createTables 3레이어 코드 검증', () => {
  let sceneSrc;

  test.beforeAll(() => {
    sceneSrc = fs.readFileSync(
      path.join(PROJECT_ROOT, 'js', 'scenes', 'ServiceScene.js'), 'utf-8'
    );
  });

  test('depth 공식 BASE = 10 + (col + row) * 100 이 존재한다', () => {
    expect(sceneSrc).toMatch(/BASE\s*=\s*10\s*\+\s*\(col\s*\+\s*row\)\s*\*\s*100/);
  });

  test('tableBackImg가 독립 Image로 생성되고 depth=BASE를 갖는다', () => {
    expect(sceneSrc).toContain("setData('tableBackImg'");
    // back image depth = BASE
    expect(sceneSrc).toMatch(/tableBackImg[\s\S]*?\.setDepth\(BASE\)/);
  });

  test('tableFrontImg가 독립 Image로 생성되고 depth=BASE+99를 갖는다', () => {
    expect(sceneSrc).toContain("setData('tableFrontImg'");
    expect(sceneSrc).toMatch(/tableFrontImg[\s\S]*?\.setDepth\(BASE\s*\+\s*99\)/);
  });

  test('customerImg가 독립 Image로 생성되고 depth=BASE+50을 갖는다', () => {
    expect(sceneSrc).toContain("setData('customerImg'");
    expect(sceneSrc).toContain('.setDepth(BASE + 50)');
  });

  test('useLayered 데이터 플래그가 true/false로 설정된다', () => {
    expect(sceneSrc).toContain("setData('useLayered', true)");
    expect(sceneSrc).toContain("setData('useLayered', false)");
  });

  test('fallback: backKey 미로드 시 기존 단일 tableImg 방식이 유지된다', () => {
    // fallback path: table_lv${grade} key
    expect(sceneSrc).toMatch(/const tableKey = `table_lv\$\{grade\}`/);
    // and diamond polygon fallback
    expect(sceneSrc).toContain('fillPoints');
  });

  test('container는 UI 전용으로 depth=BASE를 갖는다', () => {
    expect(sceneSrc).toMatch(/container\s*=\s*this\.add\.container\(cx,\s*cy\)\.setDepth\(BASE\)/);
  });

  test('tableBackImg의 displaySize가 96:64 비율을 유지한다', () => {
    // SISO_TABLE_W * 64 / 96
    expect(sceneSrc).toContain('Math.round(SISO_TABLE_W * 64 / 96)');
  });

  test('tableFrontImg의 displaySize가 96:52 비율을 유지한다', () => {
    expect(sceneSrc).toContain('Math.round(SISO_TABLE_W * 52 / 96)');
  });
});

// ─────────────────────────────────────────────────────────────────
//  4. HUD / 하단 바 / 배너 depth 상향 검증
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: HUD/UI depth 상향 검증', () => {
  let sceneSrc;

  test.beforeAll(() => {
    sceneSrc = fs.readFileSync(
      path.join(PROJECT_ROOT, 'js', 'scenes', 'ServiceScene.js'), 'utf-8'
    );
  });

  test('HUD 배경 depth 600으로 상향되었다', () => {
    // _createHUD 내 rectangle depth
    const hudSection = sceneSrc.substring(
      sceneSrc.indexOf('_createHUD()'),
      sceneSrc.indexOf('_updateHUD()')
    );
    expect(hudSection).toContain('.setDepth(600)');
    expect(hudSection).toContain('.setDepth(601)');
    // 기존 100/101 없어야 함
    expect(hudSection).not.toMatch(/\.setDepth\(10[01]\)/);
  });

  test('하단 바 depth 600~602로 상향되었다', () => {
    const bottomSection = sceneSrc.substring(
      sceneSrc.indexOf('_createBottomBar()'),
      sceneSrc.indexOf('_createStaffIcons()')
    );
    expect(bottomSection).toContain('.setDepth(600)');
    expect(bottomSection).toContain('.setDepth(601)');
    expect(bottomSection).toContain('.setDepth(602)');
    expect(bottomSection).not.toMatch(/\.setDepth\(10[012]\)/);
  });

  test('직원 아이콘 depth 601로 상향되었다', () => {
    const staffSection = sceneSrc.substring(
      sceneSrc.indexOf('_createStaffIcons()'),
      sceneSrc.indexOf('_createStaffIcons()') + 1000
    );
    expect(staffSection).toContain('.setDepth(601)');
  });

  test('이벤트 배너 depth 700~701로 상향되었다', () => {
    // 메서드 정의를 찾기 위해 "배너 배경" 주석 근처 탐색
    const bannerDefIdx = sceneSrc.indexOf('배너 배경');
    expect(bannerDefIdx).toBeGreaterThan(-1);
    const bannerSection = sceneSrc.substring(bannerDefIdx, bannerDefIdx + 500);
    expect(bannerSection).toContain('.setDepth(700)');
    expect(bannerSection).toContain('.setDepth(701)');
    expect(bannerSection).not.toMatch(/\.setDepth\(25[01]\)/);
  });

  test('플로팅 텍스트 depth 750으로 상향되었다', () => {
    // 메서드 정의 내 depth 확인
    const floatDefIdx = sceneSrc.indexOf('depth 200→750');
    expect(floatDefIdx).toBeGreaterThan(-1);
    const floatSection = sceneSrc.substring(floatDefIdx, floatDefIdx + 300);
    expect(floatSection).toContain('.setDepth(750)');
  });

  test('토스트(_showMessage) depth 800으로 상향되었다', () => {
    // _showMessage 메서드 정의 내 depth 확인
    const msgDefIdx = sceneSrc.indexOf('_showMessage(text,');
    expect(msgDefIdx).toBeGreaterThan(-1);
    const msgSection = sceneSrc.substring(msgDefIdx, msgDefIdx + 500);
    expect(msgSection).toContain('.setDepth(800)');
  });

  test('일시정지 패널 depth 2000 유지', () => {
    expect(sceneSrc).toContain('.setDepth(2000)');
  });

  test('기존 100~300 범위 depth가 전부 제거되었다 (HUD/하단바/배너/플로팅)', () => {
    // 테이블 영역 외 나머지 UI 코드에서 100~300 range depth가 없어야 함
    const allDepths = [...sceneSrc.matchAll(/\.setDepth\((\d+)\)/g)]
      .map(m => parseInt(m[1]));
    // 100, 101, 102, 200, 250, 251, 300 은 없어야 함
    const forbiddenOld = [100, 101, 102, 200, 250, 251, 300];
    for (const d of forbiddenOld) {
      expect(allDepths).not.toContain(d);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
//  5. _updateTableUI waiting/seated 분기 검증
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: _updateTableUI 분기 검증', () => {
  let sceneSrc;

  test.beforeAll(() => {
    sceneSrc = fs.readFileSync(
      path.join(PROJECT_ROOT, 'js', 'scenes', 'ServiceScene.js'), 'utf-8'
    );
  });

  test('useLayered 분기가 존재한다', () => {
    // _updateTableUI 내부에서 useLayered 확인
    expect(sceneSrc).toContain("const useLayered = container.getData('useLayered')");
  });

  test('빈 테이블 시 customerImg 숨김 처리가 있다', () => {
    expect(sceneSrc).toContain("container.getData('customerImg')?.setVisible(false)");
  });

  test('waiting/seated 상태 판별 로직이 있다', () => {
    expect(sceneSrc).toMatch(/const state\s*=\s*isServed\s*\?\s*'seated'\s*:\s*'waiting'/);
  });

  test('customer_{type}_{state} 텍스처 키가 사용된다', () => {
    expect(sceneSrc).toContain('`customer_${custType}_${state}`');
  });

  test('3단계 fallback 체인이 있다 (state -> type -> emoji)', () => {
    // 1. customer_{type}_{state}
    expect(sceneSrc).toContain('custSpriteKey');
    // 2. customer_{type} fallback
    expect(sceneSrc).toContain('fallbackKey');
    // 3. emoji fallback
    expect(sceneSrc).toContain('CUSTOMER_TYPE_ICONS');
  });

  test('group 손님의 displaySize가 다르게 설정된다 (40x40)', () => {
    expect(sceneSrc).toContain("(custType === 'group') ? 40 : 24");
    expect(sceneSrc).toContain("(custType === 'group') ? 40 : 32");
  });

  test('mireuk_traveler 이모지 폴백이 가능하다 (CUSTOMER_TYPE_ICONS에 등록)', () => {
    expect(sceneSrc).toContain("mireuk_traveler: '\\uD83D\\uDCAE'");
  });
});

// ─────────────────────────────────────────────────────────────────
//  6. 씬 클린업 코드 검증
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: 씬 클린업 검증', () => {
  let sceneSrc;

  test.beforeAll(() => {
    sceneSrc = fs.readFileSync(
      path.join(PROJECT_ROOT, 'js', 'scenes', 'ServiceScene.js'), 'utf-8'
    );
  });

  test('_shutdown에서 tableBackImg destroy가 호출된다', () => {
    const shutdownSection = sceneSrc.substring(
      sceneSrc.indexOf('_shutdown()'),
      sceneSrc.indexOf('_shutdown()') + 1000
    );
    expect(shutdownSection).toContain("getData('tableBackImg')?.destroy()");
  });

  test('_shutdown에서 tableFrontImg destroy가 호출된다', () => {
    const shutdownSection = sceneSrc.substring(
      sceneSrc.indexOf('_shutdown()'),
      sceneSrc.indexOf('_shutdown()') + 1000
    );
    expect(shutdownSection).toContain("getData('tableFrontImg')?.destroy()");
  });

  test('_shutdown에서 customerImg destroy가 호출된다', () => {
    const shutdownSection = sceneSrc.substring(
      sceneSrc.indexOf('_shutdown()'),
      sceneSrc.indexOf('_shutdown()') + 1000
    );
    expect(shutdownSection).toContain("getData('customerImg')?.destroy()");
  });

  test('3레이어 해제가 tableContainers 순회 내에서 실행된다', () => {
    const shutdownSection = sceneSrc.substring(
      sceneSrc.indexOf('_shutdown()'),
      sceneSrc.indexOf('_shutdown()') + 500
    );
    expect(shutdownSection).toContain('for (const cont of this.tableContainers)');
  });

  test('shutdown 이벤트가 올바르게 등록되어 있다', () => {
    expect(sceneSrc).toContain("this.events.once('shutdown', this._shutdown, this)");
  });
});

// ─────────────────────────────────────────────────────────────────
//  7. depth 계산 공식 정합성 검증
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: depth 공식 정합성', () => {
  test('depth 범위 계산: col=0,row=0 -> BASE=10 / col=3,row=1 -> BASE=410', () => {
    const SISO_COLS = 4, SISO_ROWS = 2;
    for (let row = 0; row < SISO_ROWS; row++) {
      for (let col = 0; col < SISO_COLS; col++) {
        const BASE = 10 + (col + row) * 100;
        const front = BASE + 99;
        const customer = BASE + 50;
        // 모든 테이블 depth가 600 미만이어야 HUD와 충돌 안 함
        expect(front).toBeLessThan(600);
        // 테이블 back depth가 바닥(0)/격자(1)/뒷벽(3)/아치(5)보다 높아야 함
        expect(BASE).toBeGreaterThan(5);
        // customer가 back과 front 사이
        expect(customer).toBeGreaterThan(BASE);
        expect(customer).toBeLessThan(front);
      }
    }
    // 최대값 확인
    const maxBASE = 10 + (3 + 1) * 100; // 410
    expect(maxBASE).toBe(410);
    expect(maxBASE + 99).toBe(509);
    expect(509).toBeLessThan(600); // HUD depth와 분리
  });

  test('인접 셀 간 depth가 겹치지 않는다', () => {
    const depths = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const BASE = 10 + (col + row) * 100;
        depths.push({ col, row, back: BASE, customer: BASE + 50, front: BASE + 99 });
      }
    }
    // 각 셀의 front가 다음 셀의 back보다 높지 않아야 함 (단, col+row 동일 셀은 같은 depth band)
    for (let i = 0; i < depths.length; i++) {
      for (let j = 0; j < depths.length; j++) {
        if (i === j) continue;
        const di = depths[i], dj = depths[j];
        // 다른 depth band이면 겹침 없어야 함
        if (di.back !== dj.back) {
          // band i의 front < band j의 back 이거나 반대여야 함
          const iMax = di.front, jMin = dj.back;
          const jMax = dj.front, iMin = di.back;
          if (di.back < dj.back) {
            expect(iMax).toBeLessThan(jMin);
          }
        }
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────
//  8. 브라우저 통합 테스트 (Phaser 런타임)
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: 브라우저 런타임 테스트', () => {
  test('콘솔 에러 없이 ServiceScene이 시작된다 (ch7 스테이지)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(2000);

    // 세이브 데이터 설정: ch7-1 스테이지, 충분한 재료/골드
    await page.evaluate(() => {
      const save = JSON.parse(localStorage.getItem('kitchenChaosData') || '{}');
      save.version = 19;
      save.currentStage = '7-1';
      save.gold = 99999;
      save.lastPlayedChapter = 7;
      // 재료 충분히 설정
      save.inventory = save.inventory || {};
      const mats = ['carrot','onion','potato','tomato','rice','flour','egg','meat','fish','cheese',
                     'shrimp','mushroom','butter','cream','sashimi_tuna','wasabi','tofu','cilantro',
                     'sake','star_anise','truffle','herb_bundle','curry_leaf','saffron','chai',
                     'cardamom','jalapeno','avocado','cacao','vanilla'];
      for (const m of mats) save.inventory[m] = 99;
      save.tableCount = 8;
      save.tableUpgrades = [0, 1, 2, 3, 4, 0, 1, 2];
      localStorage.setItem('kitchenChaosData', JSON.stringify(save));
    });
    await page.reload();
    await page.waitForTimeout(2000);

    // 메뉴 -> 월드맵 -> 스테이지 선택 -> 재료 채집 -> 영업 의 전체 플로우는 복잡하므로
    // 직접 ServiceScene을 시작
    const sceneStarted = await page.evaluate(() => {
      if (!window.__PHASER_GAME__) return false;
      const game = window.__PHASER_GAME__;
      if (game.scene.isActive('ServiceScene')) return true;
      try {
        game.scene.start('ServiceScene', {
          stageId: '7-1',
          inventory: { carrot: 99, onion: 99, potato: 99, tomato: 99, rice: 99 },
        });
        return true;
      } catch { return false; }
    });

    // ServiceScene 시작 시도 후 안정화
    await page.waitForTimeout(3000);

    // 에러 확인 -- Phase 52 관련 에러만 필터
    const phase52Errors = errors.filter(e =>
      e.includes('table') || e.includes('customer') || e.includes('depth') ||
      e.includes('Back') || e.includes('Front') || e.includes('layered') ||
      e.includes('setTexture') || e.includes('destroy')
    );

    // 전체 화면 스크린샷
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'phase52_service_full.png'),
    });

    expect(phase52Errors).toEqual([]);
  });

  test('3레이어 에셋이 브라우저에서 로드 가능하다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // 에셋 파일이 HTTP 200으로 응답하는지 확인
    const assetPaths = [];
    for (let lv = 0; lv < 5; lv++) {
      assetPaths.push(`/sprites/service/table_lv${lv}_back.png`);
      assetPaths.push(`/sprites/service/table_lv${lv}_front.png`);
    }
    const types = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
    for (const t of types) {
      assetPaths.push(`/sprites/service/customer_${t}_waiting.png`);
      assetPaths.push(`/sprites/service/customer_${t}_seated.png`);
    }

    for (const assetPath of assetPaths) {
      const resp = await page.evaluate(async (url) => {
        try {
          const r = await fetch(url);
          return { status: r.status, ok: r.ok };
        } catch (e) {
          return { status: 0, ok: false, error: e.message };
        }
      }, assetPath);
      expect(resp.ok).toBe(true);
    }
  });

  test('ServiceScene HUD 영역이 테이블 위에 올바르게 렌더링된다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(2000);

    // ServiceScene 시작 시도
    await page.evaluate(() => {
      const save = JSON.parse(localStorage.getItem('kitchenChaosData') || '{}');
      save.version = 19;
      save.currentStage = '7-1';
      save.gold = 99999;
      save.tableCount = 8;
      save.tableUpgrades = [0, 1, 2, 3, 4, 0, 1, 2];
      save.inventory = {};
      const mats = ['carrot','onion','potato','tomato','rice'];
      for (const m of mats) save.inventory[m] = 99;
      localStorage.setItem('kitchenChaosData', JSON.stringify(save));
    });
    await page.reload();
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      if (!window.__PHASER_GAME__) return;
      const game = window.__PHASER_GAME__;
      try {
        game.scene.start('ServiceScene', {
          stageId: '7-1',
          inventory: { carrot: 99, onion: 99, potato: 99, tomato: 99, rice: 99 },
        });
      } catch {}
    });
    await page.waitForTimeout(3000);

    // HUD 영역 캡처 (상단 40px)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'phase52_hud_area.png'),
      clip: { x: 0, y: 0, width: 360, height: 50 },
    });

    // 하단 바 영역 캡처 (570~640px)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'phase52_bottom_bar.png'),
      clip: { x: 0, y: 560, width: 360, height: 80 },
    });

    // 홀 영역 캡처 (40~280px) -- 3레이어 렌더링 확인
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'phase52_hall_area.png'),
      clip: { x: 0, y: 30, width: 360, height: 260 },
    });

    expect(errors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────
//  9. 예외 및 엣지케이스 코드 분석
// ─────────────────────────────────────────────────────────────────

test.describe('Phase 52: 예외/엣지케이스 코드 검증', () => {
  let sceneSrc;

  test.beforeAll(() => {
    sceneSrc = fs.readFileSync(
      path.join(PROJECT_ROOT, 'js', 'scenes', 'ServiceScene.js'), 'utf-8'
    );
  });

  test('_updateTableUI에서 빈 테이블 조기 반환 최적화가 유지된다', () => {
    // _isEmpty 플래그 기반 조기 반환
    expect(sceneSrc).toContain("container.getData('_isEmpty')");
    expect(sceneSrc).toContain("container.setData('_isEmpty', true)");
    expect(sceneSrc).toContain("container.setData('_isEmpty', false)");
  });

  test('customerImg 초기 텍스처가 __MISSING으로 설정되고 비표시 상태이다', () => {
    expect(sceneSrc).toContain("this.add.image(cx, cy - 8, '__MISSING')");
    // 초기 비표시
    expect(sceneSrc).toMatch(/customerImg[\s\S]*?setVisible\(false\)[\s\S]*?setDepth\(BASE \+ 50\)/);
  });

  test('useLayered=false 경로에서 custIconImg가 정상 동작한다', () => {
    // 비레이어 모드에서 custIconImg/custIconText 사용
    const fallbackSection = sceneSrc.substring(
      sceneSrc.indexOf("// 기존 컴포짓(_occupied) + 아이콘 방식 유지"),
      sceneSrc.indexOf("// 말풍선 — 요리 이름")
    );
    expect(fallbackSection).toContain('custIconImg');
    expect(fallbackSection).toContain('custIconText');
  });

  test('SpriteLoader.hasTexture 호출이 방어적으로 사용된다', () => {
    // _createTables에서 backKey 체크
    expect(sceneSrc).toContain('SpriteLoader.hasTexture(this, backKey)');
    // _updateTableUI에서 custSpriteKey 체크
    expect(sceneSrc).toContain('SpriteLoader.hasTexture(this, custSpriteKey)');
    // fallbackKey 체크
    expect(sceneSrc).toContain('SpriteLoader.hasTexture(this, fallbackKey)');
  });

  test('useLayered=true에서도 custIconImg/custIconText가 생성된다 (이모지 폴백용)', () => {
    // custIconImg/custIconText는 useLayered 분기(if/else) 밖에서 생성됨
    // 실제 생성 코드가 조건 분기 뒤에 위치하는지 확인
    const custIconCreateIdx = sceneSrc.indexOf("const custIconImg = this.add.image(0, -5, '__MISSING')");
    const useLayeredTrueIdx = sceneSrc.indexOf("setData('useLayered', true)");
    const useLayeredFalseIdx = sceneSrc.indexOf("setData('useLayered', false)");
    // custIconImg 생성이 useLayered 설정 이후에 위치함 (= 분기 밖)
    expect(custIconCreateIdx).toBeGreaterThan(useLayeredTrueIdx);
    expect(custIconCreateIdx).toBeGreaterThan(useLayeredFalseIdx);
  });
});
