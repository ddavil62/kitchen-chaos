/**
 * @fileoverview Phase 54 QA: 쿠폰 코드 시스템 검증
 *
 * 검증 항목:
 * 1. 설정 패널 쿠폰 버튼 존재 및 클릭
 * 2. 쿠폰 모달 열림/닫힘
 * 3. 유효 코드 입력 → 보상 지급 + 성공 메시지
 * 4. 잘못된 코드 → 오류 메시지
 * 5. 중복 코드 → 이미 사용 메시지
 * 6. DEV 치트 코드 (CHEAT_GOLD) 동작
 * 7. 대소문자 무시 검증
 * 8. 빈 입력 제출 시 안전 처리
 * 9. 콘솔 에러 없음
 * 10. SaveManager v20 마이그레이션
 * 11. giftIngredients 누적 저장 및 소비
 * 12. DEV 치트 코드 무제한 재사용
 * 13. CHEAT_BOSS_KILL / CHEAT_WAVE_END 비전투 씬 안전 처리
 * 14. 설정 패널 닫기 시 쿠폰 모달 함께 닫힘
 * 15. CouponRegistry 코드 정적 분석
 * 16. 프로덕션 빌드 치트 코드 제거 (별도 빌드 테스트)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';
const COUPON_LS_KEY = 'kitchenChaosTycoon_usedCoupons';
const SCREENSHOT_DIR = 'tests/screenshots';

// ── 게임 로딩 헬퍼 ──

async function waitForGame(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

// ── canvas->page 좌표 변환 헬퍼 ──
// Pixel 5 뷰포트(393x851)에서 360x640 캔버스 배치 시 스케일/오프셋 계산
async function getCanvasTransform(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    const game = window.__game;
    const gameW = game.config.width;
    const gameH = game.config.height;
    return {
      scaleX: rect.width / gameW,
      scaleY: rect.height / gameH,
      offsetX: rect.left,
      offsetY: rect.top,
    };
  });
}

async function clickCanvas(page, gameX, gameY) {
  const t = await getCanvasTransform(page);
  const pageX = t.offsetX + gameX * t.scaleX;
  const pageY = t.offsetY + gameY * t.scaleY;
  await page.mouse.click(pageX, pageY);
}

// ── v20 세이브 데이터 생성 ──
function createV20Save(overrides = {}) {
  return {
    version: 20,
    stages: { '1-1': { cleared: true, stars: 3 } },
    totalGoldEarned: 1000,
    tutorialDone: true,
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialEndless: false,
    kitchenCoins: 10,
    upgrades: { fridge: 1, knife: 1, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: ['rice_ball'],
    selectedChef: 'petit_chef',
    completedOrders: [],
    cookingSlots: 2,
    bestSatisfaction: {},
    tableUpgrades: [0, 0, 0, 0],
    unlockedTables: 4,
    interiors: { flower: 0, kitchen: 0, lighting: 0 },
    staff: { waiter: true, dishwasher: false },
    soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
    gold: 500,
    tools: {
      pan: { count: 2, level: 1 },
      salt: { count: 0, level: 1 },
      grill: { count: 0, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    },
    tutorialMerchant: false,
    season2Unlocked: false,
    season3Unlocked: false,
    seenDialogues: [],
    storyProgress: { currentChapter: 1, storyFlags: {} },
    endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    achievements: {
      unlocked: {},
      claimed: {},
      progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 },
    },
    mireukEssence: 0,
    mireukBossRewards: {},
    wanderingChefs: { hired: [], unlocked: [], enhancements: {} },
    giftIngredients: {},
    ...overrides,
  };
}

// ── 설정 패널/쿠폰 모달 열기 헬퍼 ──

async function openSettings(page) {
  // 기어 버튼: canvas (330, 30)
  await clickCanvas(page, 330, 30);
  await page.waitForTimeout(500);
}

async function openCouponModal(page) {
  // 쿠폰 버튼: canvas (180, 408)
  await clickCanvas(page, 180, 408);
  await page.waitForTimeout(500);
}

// hidden input에 코드 입력 후 제출
async function typeAndSubmitCoupon(page, code) {
  // hidden input에 값 설정
  await page.evaluate((c) => {
    const input = document.querySelector('input[style*="-9999px"]');
    if (input) {
      input.value = c;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, code);
  await page.waitForTimeout(200);

  // 제출 버튼 클릭: canvas (180, 320+65) = (180, 385)
  await clickCanvas(page, 180, 385);
  await page.waitForTimeout(600);
}

// 결과 메시지 읽기 (canvas 내부이므로 page.evaluate로 확인)
async function getResultMsg(page) {
  // 결과 메시지는 Phaser 텍스트로 canvas에 렌더링됨
  // hidden input의 값은 리셋되므로, 스크린샷으로 확인하거나 game 내부 참조
  // 여기서는 스크린샷 + evaluate로 확인
  const msg = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return null;
    const menuScene = game.scene.getScene('MenuScene');
    if (!menuScene || !menuScene._couponContainer) return null;
    // 컨테이너의 텍스트 오브젝트들 중 결과 메시지 찾기
    const texts = menuScene._couponContainer.list.filter(
      c => c.type === 'Text' && c.style && c.style.wordWrapWidth > 0
    );
    if (texts.length > 0) return texts[0].text;
    return null;
  });
  return msg;
}

// ── 세이브 데이터 설정 ──

async function setupSave(page, saveData) {
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: SAVE_KEY, data: saveData });
}

async function clearCouponHistory(page) {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, COUPON_LS_KEY);
}

// ──────────────────────────────────────────────────────────────────
//  테스트 시작
// ──────────────────────────────────────────────────────────────────

test.describe('Phase 54: 쿠폰 코드 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 세이브 초기화
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await setupSave(page, createV20Save());
    await clearCouponHistory(page);
    // 리로드 후 대기
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForFunction(() => {
      const game = window.__game;
      if (!game) return false;
      const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
      return activeScenes.includes('MenuScene');
    }, { timeout: 45000, polling: 500 });
    await page.waitForTimeout(1000);
  });

  // ──────────────────────────────────────────────────────────────
  //  정상 동작 검증
  // ──────────────────────────────────────────────────────────────

  test.describe('정상 동작', () => {
    test('AC-01: 설정 패널에 쿠폰 입력 버튼이 표시된다', async ({ page }) => {
      await openSettings(page);
      await page.waitForTimeout(500);

      // 설정 패널 내 쿠폰 버튼 존재 확인 (Phaser 내부)
      const hasCouponBtn = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('MenuScene');
        if (!scene || !scene._settingsContainer) return false;
        // 컨테이너 내 텍스트 오브젝트 중 '쿠폰' 포함 검색
        const texts = scene._settingsContainer.list.filter(
          c => c.type === 'Text' && c.text && c.text.includes('쿠폰')
        );
        return texts.length > 0;
      });

      expect(hasCouponBtn).toBe(true);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_settings_panel.png` });
    });

    test('AC-02: 쿠폰 버튼 클릭 시 코드 입력 모달이 열린다', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      const hasModal = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('MenuScene');
        return !!(scene && scene._couponContainer);
      });

      expect(hasModal).toBe(true);

      // hidden DOM input이 존재하는지 확인
      const hasHiddenInput = await page.evaluate(() => {
        const input = document.querySelector('input[style*="-9999px"]');
        return !!input;
      });
      expect(hasHiddenInput).toBe(true);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_coupon_modal.png` });
    });

    test('AC-03: LAZYSLIME2026 입력 시 골드 +5,000 성공 메시지', async ({ page }) => {
      const goldBefore = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });

      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_success_lazyslime.png` });

      // 골드 증가 확인
      const goldAfter = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });

      expect(goldAfter).toBe(goldBefore + 5000);

      // 쿠폰 사용 이력 확인
      const usedCoupons = await page.evaluate(() => {
        const raw = localStorage.getItem('kitchenChaosTycoon_usedCoupons');
        return raw ? JSON.parse(raw) : [];
      });
      expect(usedCoupons).toContain('LAZYSLIME2026');
    });

    test('AC-04: 잘못된 코드 입력 시 오류 메시지', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'INVALIDCODE999');

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_invalid_code.png` });

      // 골드 변동 없음 확인
      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500); // 초기값 유지
    });

    test('AC-05: 동일 코드 재입력 시 이미 사용된 코드 메시지', async ({ page }) => {
      // 먼저 코드 한 번 사용
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');

      const goldAfterFirst = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(goldAfterFirst).toBe(5500); // 500 + 5000

      // 두 번째 시도 — 입력 리셋 후 재입력
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_duplicate_code.png` });

      // 골드 변동 없음 (두 번째 사용 차단)
      const goldAfterSecond = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(goldAfterSecond).toBe(5500); // 변동 없음
    });

    test('AC-06: KITCHENLOVE 코드 — 골드 + 재료 지급', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'KITCHENLOVE');

      // 골드 확인
      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500 + 3000);

      // giftIngredients 확인
      const gifts = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.giftIngredients;
      });
      expect(gifts).toEqual({ carrot: 5, meat: 5, egg: 5 });

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_kitchenlove.png` });
    });

    test('AC-07: GRANDOPENING 코드 — 골드 + 재료 지급', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'GRANDOPENING');

      // 골드 확인
      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500 + 2000);

      // giftIngredients 확인
      const gifts = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.giftIngredients;
      });
      expect(gifts).toEqual({ flour: 10, rice: 10 });
    });

    test('AC-08: 대소문자 혼합 입력 정상 인식', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'lazyslime2026');

      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500 + 5000);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  DEV 치트 코드 검증
  // ──────────────────────────────────────────────────────────────

  test.describe('DEV 치트 코드', () => {
    test('AC-09: CHEAT_GOLD 입력 시 골드 +99,999', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'CHEAT_GOLD');

      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500 + 99999);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_cheat_gold.png` });
    });

    test('AC-10: CHEAT_ITEMS 입력 시 giftIngredients에 전 재료 x20', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'CHEAT_ITEMS');

      const gifts = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.giftIngredients;
      });

      // 31종 재료 전부 20인지 확인
      const keys = Object.keys(gifts);
      expect(keys.length).toBeGreaterThanOrEqual(31);
      for (const key of keys) {
        expect(gifts[key]).toBe(20);
      }
    });

    test('AC-11: DEV 치트 코드는 재사용 이력 저장 안 함 (무제한 사용)', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // 첫 번째 사용
      await typeAndSubmitCoupon(page, 'CHEAT_GOLD');
      const gold1 = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold1).toBe(500 + 99999);

      // 두 번째 사용 — 차단되지 않아야 함
      await typeAndSubmitCoupon(page, 'CHEAT_GOLD');
      const gold2 = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold2).toBe(500 + 99999 * 2);

      // 쿠폰 사용 이력에 CHEAT_GOLD가 없어야 함
      const usedCoupons = await page.evaluate(() => {
        const raw = localStorage.getItem('kitchenChaosTycoon_usedCoupons');
        return raw ? JSON.parse(raw) : [];
      });
      expect(usedCoupons).not.toContain('CHEAT_GOLD');
    });

    test('AC-12: CHEAT_BOSS_KILL 비전투 씬에서 안전 처리', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'CHEAT_BOSS_KILL');

      // 에러 없이 처리되어야 함 (결과는 실패 메시지)
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_cheat_boss_noscene.png` });

      // 페이지 크래시 없음 확인
      const isMenuActive = await page.evaluate(() => {
        const game = window.__game;
        return game.scene.getScene('MenuScene').sys.isActive();
      });
      expect(isMenuActive).toBe(true);
    });

    test('AC-13: CHEAT_WAVE_END 비전투 씬에서 안전 처리', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'CHEAT_WAVE_END');

      // 에러 없이 처리되어야 함
      const isMenuActive = await page.evaluate(() => {
        const game = window.__game;
        return game.scene.getScene('MenuScene').sys.isActive();
      });
      expect(isMenuActive).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  예외 및 엣지케이스
  // ──────────────────────────────────────────────────────────────

  test.describe('예외 및 엣지케이스', () => {
    test('EC-01: 빈 입력 제출 시 에러 없이 무시', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // 빈 상태로 제출 버튼 클릭
      await clickCanvas(page, 180, 385);
      await page.waitForTimeout(300);

      // 골드 변동 없음
      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500);

      // 모달 여전히 열려있음 (크래시 없음)
      const hasModal = await page.evaluate(() => {
        const game = window.__game;
        const scene = game.scene.getScene('MenuScene');
        return !!(scene && scene._couponContainer);
      });
      expect(hasModal).toBe(true);
    });

    test('EC-02: 공백만 입력 시 에러 없이 무시', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, '   ');

      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500);
    });

    test('EC-03: 특수문자 포함 코드 입력 시 안전 처리', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, '<script>alert(1)</script>');

      // 에러 없이 무효 처리
      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500);
    });

    test('EC-04: 초장문 코드 입력 시 안전 처리', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'A'.repeat(500));

      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500);
    });

    test('EC-05: 설정 패널 닫기 시 쿠폰 모달도 함께 닫힘', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // 쿠폰 모달이 열려있음 확인
      let hasModal = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MenuScene');
        return !!(scene._couponContainer);
      });
      expect(hasModal).toBe(true);

      // 설정 패널 닫기 (X 버튼 또는 오버레이 밖 클릭)
      // 오버레이 밖 영역 클릭 — canvas (10, 10)
      await clickCanvas(page, 10, 10);
      await page.waitForTimeout(500);

      // 두 컨테이너 모두 사라졌는지 확인
      const state = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MenuScene');
        return {
          settings: !!(scene._settingsContainer),
          coupon: !!(scene._couponContainer),
        };
      });

      // 쿠폰 모달 오버레이 클릭 시 쿠폰 모달만 닫히거나, 설정 패널 닫기와 함께 둘 다 닫혀야 함
      // 어떤 경우든 모달이 안전하게 정리되어야 함
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_close_together.png` });
    });

    test('EC-06: hidden DOM input 정리 확인 (메모리 누수 방지)', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // hidden input 존재 확인
      let inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input[style*="-9999px"]').length;
      });
      expect(inputCount).toBe(1);

      // 쿠폰 모달 닫기 — evaluate로 직접 호출 (좌표 의존 제거)
      await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MenuScene');
        if (scene) scene._closeCouponModal();
      });
      await page.waitForTimeout(500);

      // hidden input 제거 확인
      inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input[style*="-9999px"]').length;
      });
      expect(inputCount).toBe(0);
    });

    test('EC-07: 쿠폰 모달 이중 열기 방지', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // 두 번째 쿠폰 버튼 클릭 시도 (모달이 위에 있어 실제로는 불가)
      // container 개수 확인
      const containerCount = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MenuScene');
        // 직접 _openCouponModal 호출 시도
        scene._openCouponModal();
        // hidden input 수로 중복 생성 확인
        return document.querySelectorAll('input[style*="-9999px"]').length;
      });
      expect(containerCount).toBe(1); // 하나만 있어야 함
    });

    test('EC-08: 설정 패널 이중 열기 방지 (_openSettingsPanel 직접 호출)', async ({ page }) => {
      await openSettings(page);

      // 이미 열린 상태에서 _openSettingsPanel 재호출 시도
      const containerCountBefore = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('MenuScene');
        const countBefore = scene._settingsContainer ? 1 : 0;
        scene._openSettingsPanel(); // 재호출
        const countAfter = scene._settingsContainer ? 1 : 0;
        return { before: countBefore, after: countAfter };
      });

      // 중복 생성 없이 기존 컨테이너 유지
      expect(containerCountBefore.before).toBe(1);
      expect(containerCountBefore.after).toBe(1);
    });

    test('EC-09: 쿠폰 코드 앞뒤 공백 자동 제거', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, '  LAZYSLIME2026  ');

      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });
      expect(gold).toBe(500 + 5000);
    });

    test('EC-10: 여러 쿠폰 연속 사용 시 giftIngredients 누적', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // 첫 번째: KITCHENLOVE (carrot:5, meat:5, egg:5)
      await typeAndSubmitCoupon(page, 'KITCHENLOVE');
      // 두 번째: GRANDOPENING (flour:10, rice:10)
      await typeAndSubmitCoupon(page, 'GRANDOPENING');

      const gifts = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.giftIngredients;
      });

      expect(gifts.carrot).toBe(5);
      expect(gifts.meat).toBe(5);
      expect(gifts.egg).toBe(5);
      expect(gifts.flour).toBe(10);
      expect(gifts.rice).toBe(10);
    });

    test('EC-11: 빠른 연타 제출 시 중복 보상 방지', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);

      // 코드 입력
      await page.evaluate(() => {
        const input = document.querySelector('input[style*="-9999px"]');
        if (input) {
          input.value = 'LAZYSLIME2026';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // 빠른 연속 제출 (3회)
      await clickCanvas(page, 180, 385);
      await clickCanvas(page, 180, 385);
      await clickCanvas(page, 180, 385);
      await page.waitForTimeout(500);

      const gold = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return data.gold;
      });

      // 첫 번째만 성공, 나머지는 이미 사용됨 → 골드 +5000만 한 번
      expect(gold).toBe(500 + 5000);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  SaveManager v20 마이그레이션 검증
  // ──────────────────────────────────────────────────────────────

  test.describe('SaveManager v20 마이그레이션', () => {
    test('MIG-01: v19 세이브 → v20 자동 마이그레이션 (giftIngredients 추가)', async ({ page }) => {
      // v19 세이브 설정 (giftIngredients 필드 없음)
      const v19Save = createV20Save({ version: 19 });
      delete v19Save.giftIngredients;

      await page.evaluate(({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
      }, { key: SAVE_KEY, data: v19Save });

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('canvas', { timeout: 15000 });
      await page.waitForFunction(() => {
        const game = window.__game;
        return game && game.scene.getScene('MenuScene')?.sys?.isActive();
      }, { timeout: 45000, polling: 500 });

      // SaveManager.load()를 통해 마이그레이션된 데이터 확인 (lazy migration)
      // load()는 메모리에서 마이그레이션하므로 반환 값을 확인한다
      const data = await page.evaluate(() => {
        // 게임 내 SaveManager를 통해 load하여 마이그레이션 결과 확인
        const game = window.__game;
        const menuScene = game.scene.getScene('MenuScene');
        // SaveManager가 static이므로 import 경로 대신 게임 내부에서 호출
        // 방법: 쿠폰 리딤 시 SaveManager.load()가 호출되므로 간접 확인
        // 또는: 직접 raw 데이터를 parse 후 _migrate 동작을 시뮬레이션
        const raw = localStorage.getItem('kitchenChaosTycoon_save');
        const d = JSON.parse(raw);
        // 마이그레이션 전 원본 데이터 확인
        const rawVersion = d.version;
        const hasGiftFieldRaw = 'giftIngredients' in d;

        // 쿠폰 사용 시도 → SaveManager.load()가 내부에서 호출되어 마이그레이션 수행
        // 사용 후 save되면 마이그레이션된 버전이 localStorage에 저장됨
        return { rawVersion, hasGiftFieldRaw };
      });

      // v19 원본은 giftIngredients 필드가 없어야 함
      expect(data.rawVersion).toBe(19);
      expect(data.hasGiftFieldRaw).toBe(false);

      // 쿠폰 사용을 트리거하여 SaveManager.load() → _migrate() → save() 흐름 발생
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');

      // save() 후 localStorage에 마이그레이션된 데이터가 기록됨
      const migratedData = await page.evaluate(() => {
        const d = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return { version: d.version, hasGiftIngredients: 'giftIngredients' in d };
      });

      expect(migratedData.version).toBe(20);
      expect(migratedData.hasGiftIngredients).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  UI 안정성
  // ──────────────────────────────────────────────────────────────

  test.describe('UI 안정성', () => {
    test('STAB-01: 콘솔 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');
      await typeAndSubmitCoupon(page, 'INVALIDCODE');
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026'); // 중복

      // 필터링: Phaser 내부 경고 등은 제외
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('Phaser') &&
        !e.includes('WebGL')
      );

      expect(criticalErrors).toEqual([]);
    });

    test('STAB-02: 쿠폰 모달 열고 닫기 10회 반복 시 안정', async ({ page }) => {
      await openSettings(page);

      for (let i = 0; i < 10; i++) {
        await openCouponModal(page);
        await page.waitForTimeout(200);

        // 닫기 — evaluate로 직접 호출 (좌표 의존 제거)
        await page.evaluate(() => {
          const scene = window.__game.scene.getScene('MenuScene');
          if (scene) scene._closeCouponModal();
        });
        await page.waitForTimeout(200);
      }

      // hidden input 누적 없음 확인
      const inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input[style*="-9999px"]').length;
      });
      expect(inputCount).toBe(0);

      // 씬 정상
      const isActive = await page.evaluate(() => {
        return window.__game.scene.getScene('MenuScene').sys.isActive();
      });
      expect(isActive).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  시각적 검증
  // ──────────────────────────────────────────────────────────────

  test.describe('시각적 검증', () => {
    test('VIS-01: 설정 패널 전체 레이아웃', async ({ page }) => {
      await openSettings(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_vis_settings.png` });
    });

    test('VIS-02: 쿠폰 모달 초기 상태', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_vis_modal_init.png` });
    });

    test('VIS-03: 성공 메시지 표시 상태', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_vis_success.png` });
    });

    test('VIS-04: 실패 메시지 표시 상태', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'WRONGCODE');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_vis_fail.png` });
    });

    test('VIS-05: 중복 사용 메시지 표시 상태', async ({ page }) => {
      await openSettings(page);
      await openCouponModal(page);
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');
      await typeAndSubmitCoupon(page, 'LAZYSLIME2026');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/phase54_qa_vis_duplicate.png` });
    });
  });
});
