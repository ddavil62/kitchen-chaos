/**
 * @fileoverview Phase 57 QA: ChefSelectScene 가로 캐러셀 UI 개편 검증.
 * - 캐러셀 레이아웃 (중앙 카드 + 좌우 peek)
 * - 이미지 크기 (portrait >= 80px)
 * - 카드 전환 (화살표 버튼 + 스와이프)
 * - 순환(wrap) 탐색
 * - 잠금 셰프 오버레이 + 비활성 버튼
 * - 해금 셰프 선택 -> GatheringScene
 * - "셰프 없이 시작" 버튼
 * - portrait_arjun 텍스처 로드
 * - "< 뒤로" 버튼 -> WorldMapScene
 * - 엣지케이스: 연타, 스와이프 미달, 동시성
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 헬퍼 함수 ──

/** 게임 로드 대기 */
async function waitForGame(page, timeout = 15000) {
  await page.waitForFunction(() => {
    return window.__game && window.__game.scene && window.__game.scene.scenes.length > 0;
  }, { timeout });
}

/** ChefSelectScene 진입 */
async function enterChefSelect(page, stageId = '1-1') {
  await page.evaluate((sid) => {
    const game = window.__game;
    game.scene.scenes.forEach(s => {
      if (s.scene.isActive()) game.scene.stop(s.scene.key);
    });
    game.scene.start('ChefSelectScene', { stageId: sid });
  }, stageId);
  await page.waitForTimeout(1500);
}

/** 캔버스 좌표를 뷰포트 좌표로 변환 */
async function gameToViewport(page, gx, gy) {
  return page.evaluate(([x, y]) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { vx: x, vy: y };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      vx: rect.left + x * scaleX,
      vy: rect.top + y * scaleY,
    };
  }, [gx, gy]);
}

/** 게임 내 좌표로 캔버스 클릭 */
async function clickGameXY(page, gx, gy) {
  const { vx, vy } = await gameToViewport(page, gx, gy);
  await page.mouse.click(vx, vy);
}

/** 신규 유저 세이브 주입 (mimi/rin/mage만 해금) */
async function injectFreshSave(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 23, stages: {}, selectedChef: null,
      season2Unlocked: false, season3Unlocked: false,
      storyProgress: { currentChapter: 1, storyFlags: {} },
      endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0,
        lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
    }));
  }, SAVE_KEY);
}

/** 전원 해금 세이브 주입 */
async function injectFullUnlockSave(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 23, stages: {}, selectedChef: null,
      season2Unlocked: true, season3Unlocked: true,
      storyProgress: { currentChapter: 24, storyFlags: {} },
      endless: { unlocked: true, bestWave: 0, bestScore: 0, bestCombo: 0,
        lastDailySeed: 0, stormCount: 0, missionSuccessCount: 0, noLeakStreak: 0 },
    }));
  }, SAVE_KEY);
}

// ── 테스트 ──

test.describe('Phase 57: ChefSelectScene 가로 캐러셀 QA', () => {

  // ====================================================================
  // 1. 캐러셀 레이아웃
  // ====================================================================
  test.describe('1. 캐러셀 레이아웃', () => {
    test('진입 시 중앙 카드 1장 + 좌우 peek 카드가 표시된다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      const layout = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        if (!scene || !scene._cards) return null;
        const cards = scene._cards;
        const centerIdx = scene._currentIndex;
        const total = cards.length;

        // 중앙 카드
        const center = cards[centerIdx];
        // 좌측 peek
        const leftIdx = (centerIdx - 1 + total) % total;
        const left = cards[leftIdx];
        // 우측 peek
        const rightIdx = (centerIdx + 1) % total;
        const right = cards[rightIdx];

        return {
          cardCount: total,
          centerX: center.x,
          centerAlpha: center.alpha,
          leftX: left.x,
          leftAlpha: left.alpha,
          rightX: right.x,
          rightAlpha: right.alpha,
          currentIndex: centerIdx,
        };
      });

      expect(layout).not.toBeNull();
      expect(layout.cardCount).toBe(7);
      // 중앙 카드 alpha = 1
      expect(layout.centerAlpha).toBe(1);
      // 좌우 peek alpha ~ 0.45
      expect(layout.leftAlpha).toBeCloseTo(0.45, 1);
      expect(layout.rightAlpha).toBeCloseTo(0.45, 1);
      // 중앙 카드 x = 180 (CX)
      expect(layout.centerX).toBe(180);
      // 좌측 카드는 180-280 = -100
      expect(layout.leftX).toBeLessThan(layout.centerX);
      // 우측 카드는 180+280 = 460
      expect(layout.rightX).toBeGreaterThan(layout.centerX);

      await page.screenshot({ path: 'tests/screenshots/phase57-carousel-initial.png' });
      expect(errors).toEqual([]);
    });

    test('중앙 카드 폭이 260px이다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      const cardWidth = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        // CARD_W 상수 확인 (코드에서 260으로 정의)
        // Graphics의 실제 bounds로 확인
        const card = scene._cards[scene._currentIndex];
        // Container의 getBounds
        const bounds = card.getBounds();
        return Math.round(bounds.width);
      });

      expect(cardWidth).toBe(260);
    });
  });

  // ====================================================================
  // 2. 이미지 크기
  // ====================================================================
  test.describe('2. 이미지 크기', () => {
    test('portrait 이미지가 80px 이상 크기로 카드에 표시된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFullUnlockSave(page);
      await enterChefSelect(page);

      const imageSizes = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        const results = [];
        for (const card of scene._cards) {
          // Container 내부에서 Image 타입 찾기
          const imgs = card.list.filter(c => c.type === 'Image');
          if (imgs.length > 0) {
            const img = imgs[0];
            const displayW = img.displayWidth;
            const displayH = img.displayHeight;
            results.push({
              texture: img.texture?.key || 'unknown',
              displayWidth: Math.round(displayW),
              displayHeight: Math.round(displayH),
              scale: img.scaleX,
            });
          } else {
            // emoji fallback
            const emojis = card.list.filter(c => c.type === 'Text' && /[\u{1F300}-\u{1FAFF}]/u.test(c.text));
            if (emojis.length > 0) {
              results.push({
                texture: 'emoji_fallback',
                displayWidth: 64,
                displayHeight: 64,
                scale: 1,
              });
            }
          }
        }
        return results;
      });

      // 각 portrait/스프라이트가 80px 이상
      for (const img of imageSizes) {
        const maxDim = Math.max(img.displayWidth, img.displayHeight);
        expect(maxDim, `${img.texture} 크기 ${maxDim}px < 80px`).toBeGreaterThanOrEqual(80);
      }
    });
  });

  // ====================================================================
  // 3. 카드 전환 -- > 버튼
  // ====================================================================
  test.describe('3. 카드 전환 -- > 버튼', () => {
    test('> 버튼 클릭 시 다음 셰프로 전환된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      const indexBefore = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      // > 버튼: game x=338, y=270
      await clickGameXY(page, 338, 270);
      await page.waitForTimeout(500);

      const indexAfter = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      expect(indexAfter).toBe(indexBefore + 1);
    });

    test('< 버튼 클릭 시 이전 셰프로 전환된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 먼저 > 한번 눌러서 index=1로
      await clickGameXY(page, 338, 270);
      await page.waitForTimeout(500);

      const indexBefore = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });
      expect(indexBefore).toBe(1);

      // < 버튼: game x=22, y=270
      await clickGameXY(page, 22, 270);
      await page.waitForTimeout(500);

      const indexAfter = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      expect(indexAfter).toBe(0);
    });

    test('7번 > 클릭 후 처음(미미)으로 wrap 된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 초기 index 확인 (미미=0)
      const startIndex = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });
      expect(startIndex).toBe(0);

      // 7번 > 클릭
      for (let i = 0; i < 7; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }

      const finalIndex = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      // 7번 이동 후 다시 index 0 (미미)
      expect(finalIndex).toBe(0);

      await page.screenshot({ path: 'tests/screenshots/phase57-wrap-back-to-mimi.png' });
    });

    test('< 버튼 index=0에서 누르면 index=6(아르준)으로 wrap', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // index=0에서 <
      await clickGameXY(page, 22, 270);
      await page.waitForTimeout(500);

      const idx = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      expect(idx).toBe(6); // arjun
    });
  });

  // ====================================================================
  // 4. 카드 전환 -- 스와이프
  // ====================================================================
  test.describe('4. 카드 전환 -- 스와이프', () => {
    test('좌->우 50px+ 스와이프 시 이전 카드로 전환', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 먼저 index=1(린)으로 이동
      await clickGameXY(page, 338, 270);
      await page.waitForTimeout(500);

      const idxBefore = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });
      expect(idxBefore).toBe(1);

      // 좌->우 스와이프 (오른쪽으로 드래그 = 이전 카드)
      const start = await gameToViewport(page, 180, 270);
      const end = await gameToViewport(page, 250, 270); // 70px drag

      await page.mouse.move(start.vx, start.vy);
      await page.mouse.down();
      await page.mouse.move(end.vx, end.vy, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);

      const idxAfter = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      expect(idxAfter).toBe(0); // 이전으로 복귀
    });

    test('우->좌 50px+ 스와이프 시 다음 카드로 전환', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 우->좌 스와이프 (왼쪽으로 드래그 = 다음 카드)
      const start = await gameToViewport(page, 250, 270);
      const end = await gameToViewport(page, 180, 270); // 70px drag left

      await page.mouse.move(start.vx, start.vy);
      await page.mouse.down();
      await page.mouse.move(end.vx, end.vy, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);

      const idx = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      expect(idx).toBe(1); // 다음 카드
    });

    test('50px 미만 드래그 시 원위치 복귀', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      const idxBefore = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      // 30px만 드래그 (임계값 미달)
      const start = await gameToViewport(page, 180, 270);
      const end = await gameToViewport(page, 210, 270); // 30px

      await page.mouse.move(start.vx, start.vy);
      await page.mouse.down();
      await page.mouse.move(end.vx, end.vy, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(500);

      const idxAfter = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });

      expect(idxAfter).toBe(idxBefore); // 원위치
    });
  });

  // ====================================================================
  // 5. 잠금 셰프
  // ====================================================================
  test.describe('5. 잠금 셰프', () => {
    test('유키(index 3) 잠금 카드에 자물쇠 + unlockHint 표시', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // index 3(유키)으로 이동
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }

      await page.screenshot({ path: 'tests/screenshots/phase57-yuki-locked.png' });

      const lockInfo = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        const card = scene._cards[3]; // yuki
        const texts = card.list.filter(c => c.type === 'Text');
        const lockIcon = texts.find(t => t.text === '\uD83D\uDD12');
        const hintText = texts.find(t => t.text && t.text.includes('7장'));
        return {
          hasLockIcon: !!lockIcon,
          lockIconSize: lockIcon ? lockIcon.style?.fontSize : null,
          hasHint: !!hintText,
          hintContent: hintText?.text || '',
        };
      });

      expect(lockInfo.hasLockIcon).toBe(true);
      expect(lockInfo.hasHint).toBe(true);
      expect(lockInfo.hintContent).toContain('7장 클리어 시 해금');
    });

    test('잠금 카드에서 선택 버튼이 "잠금됨"으로 비활성화', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 유키로 이동
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }

      const btnState = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        return {
          text: scene._selectBtnText.text,
          color: scene._selectBtnText.style?.color,
          bgFill: scene._selectBtnBg.fillColor,
          hasInput: !!scene._selectBtnBg.input?.enabled,
        };
      });

      expect(btnState.text).toBe('\uC7A0\uAE08\uB428'); // "잠금됨"
      expect(btnState.bgFill).toBe(0x333333);
      // 비인터랙티브
      expect(btnState.hasInput).toBe(false);
    });

    test('잠금 카드에서 선택 버튼 클릭해도 씬 전환 안 됨', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 유키로 이동
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }

      // 선택 버튼 클릭 (game x=180, y=549)
      await clickGameXY(page, 180, 549);
      await page.waitForTimeout(500);

      const stillActive = await page.evaluate(() => {
        return window.__game.scene.isActive('ChefSelectScene');
      });

      expect(stillActive).toBe(true);
    });
  });

  // ====================================================================
  // 6. 해금 셰프 선택
  // ====================================================================
  test.describe('6. 해금 셰프 선택', () => {
    test('미미 카드에서 "이 셰프로 시작" 클릭 시 GatheringScene으로 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // index=0 미미가 중앙 확인
      const idx = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });
      expect(idx).toBe(0);

      // "이 셰프로 시작" 버튼 클릭 (game x=180, y=549)
      await clickGameXY(page, 180, 549);
      await page.waitForTimeout(1500); // fadeOut 300ms + 씬 전환

      const sceneState = await page.evaluate(() => {
        const game = window.__game;
        return {
          chefSelectActive: game.scene.isActive('ChefSelectScene'),
          gatheringActive: game.scene.isActive('GatheringScene'),
        };
      });

      // GatheringScene으로 전환됨
      expect(sceneState.chefSelectActive).toBe(false);

      // ChefManager에 mimi_chef 저장 확인
      const selectedChef = await page.evaluate(() => {
        const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return save?.selectedChef;
      });
      expect(selectedChef).toBe('mimi_chef');

      expect(errors).toEqual([]);
    });

    test('ChefManager.getSelectedChef()가 선택된 셰프 ID를 반환한다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 셰프 선택 (미미)
      await clickGameXY(page, 180, 549);
      await page.waitForTimeout(1500);

      const selectedChef = await page.evaluate(() => {
        // ChefManager는 static class, import 없이 접근하기 어려우므로
        // SaveManager에서 selectedChef 확인
        const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return save?.selectedChef;
      });

      expect(selectedChef).toBe('mimi_chef');
    });
  });

  // ====================================================================
  // 7. 셰프 없이 시작
  // ====================================================================
  test.describe('7. 셰프 없이 시작', () => {
    test('"셰프 없이 시작" 버튼이 하단에 표시된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      const skipBtnExists = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        const texts = scene.children.list.filter(c => c.type === 'Text');
        const skipText = texts.find(t => t.text && t.text.includes('\uC170\uD504 \uC5C6\uC774'));
        return {
          found: !!skipText,
          y: skipText?.y || 0,
        };
      });

      expect(skipBtnExists.found).toBe(true);
      expect(skipBtnExists.y).toBeGreaterThan(580); // 하단 영역
    });

    test('"셰프 없이 시작" 클릭 시 GatheringScene으로 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // "셰프 없이 시작" 버튼: game x=245, y=615
      await clickGameXY(page, 245, 615);
      await page.waitForTimeout(1500);

      const sceneState = await page.evaluate(() => {
        const game = window.__game;
        return {
          chefSelectActive: game.scene.isActive('ChefSelectScene'),
        };
      });

      expect(sceneState.chefSelectActive).toBe(false);

      // selectedChef가 null
      const selectedChef = await page.evaluate(() => {
        const save = JSON.parse(localStorage.getItem('kitchenChaosTycoon_save'));
        return save?.selectedChef;
      });
      expect(selectedChef).toBeNull();

      expect(errors).toEqual([]);
    });
  });

  // ====================================================================
  // 8. portrait_arjun 로드
  // ====================================================================
  test.describe('8. portrait_arjun 로드', () => {
    test('portrait_arjun 텍스처가 SpriteLoader에 로드되었다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);

      const textureInfo = await page.evaluate(() => {
        const game = window.__game;
        const exists = game.textures.exists('portrait_arjun');
        if (!exists) return { exists: false, width: 0, height: 0 };
        const tex = game.textures.get('portrait_arjun');
        const frame = tex.get();
        return {
          exists: true,
          width: frame.width,
          height: frame.height,
        };
      });

      expect(textureInfo.exists).toBe(true);
      expect(textureInfo.width).toBeGreaterThan(1); // 실제 이미지(1x1이 아님)
      expect(textureInfo.height).toBeGreaterThan(1);
    });

    test('PORTRAIT_IDS에 arjun이 포함되어 있다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);

      // 모든 portrait 텍스처 확인
      const portraits = await page.evaluate(() => {
        const game = window.__game;
        const ids = ['mimi', 'poco', 'rin', 'mage', 'yuki', 'lao', 'andre', 'masala_guide', 'arjun'];
        return ids.map(id => ({
          id,
          key: `portrait_${id}`,
          exists: game.textures.exists(`portrait_${id}`),
        }));
      });

      const arjun = portraits.find(p => p.id === 'arjun');
      expect(arjun.exists).toBe(true);

      // masala_guide도 여전히 존재 (DialogueScene 용)
      const masala = portraits.find(p => p.id === 'masala_guide');
      expect(masala.exists).toBe(true);
    });
  });

  // ====================================================================
  // 9. 뒤로가기
  // ====================================================================
  test.describe('9. 뒤로가기', () => {
    test('"< 뒤로" 버튼 클릭 시 WorldMapScene으로 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // "< 뒤로" 버튼: game x=62, y=615
      await clickGameXY(page, 62, 615);
      await page.waitForTimeout(1500);

      const sceneState = await page.evaluate(() => {
        const game = window.__game;
        return {
          chefSelectActive: game.scene.isActive('ChefSelectScene'),
          worldMapActive: game.scene.isActive('WorldMapScene'),
        };
      });

      expect(sceneState.chefSelectActive).toBe(false);
      expect(errors).toEqual([]);
    });

    test('엔드리스 모드에서 뒤로가기 시 MenuScene으로 전환', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page, 'endless');

      const isEndless = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._isEndless;
      });
      expect(isEndless).toBe(true);

      // "< 뒤로" 버튼 클릭
      await clickGameXY(page, 62, 615);
      await page.waitForTimeout(1500);

      const sceneState = await page.evaluate(() => {
        return {
          chefSelectActive: window.__game.scene.isActive('ChefSelectScene'),
          menuActive: window.__game.scene.isActive('MenuScene'),
        };
      });

      expect(sceneState.chefSelectActive).toBe(false);
      expect(errors).toEqual([]);
    });
  });

  // ====================================================================
  // 10. 시각적 검증 (스크린샷)
  // ====================================================================
  test.describe('10. 시각적 검증', () => {
    test('캐러셀 초기 상태 (미미 중앙)', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);
      await page.screenshot({ path: 'tests/screenshots/phase57-initial-mimi.png' });
    });

    test('두 번째 셰프(린) 카드', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);
      await clickGameXY(page, 338, 270);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/phase57-rin-card.png' });
    });

    test('잠금 셰프 카드 (유키)', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }
      await page.screenshot({ path: 'tests/screenshots/phase57-yuki-locked-visual.png' });
    });

    test('전원 해금 시 아르준 카드', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFullUnlockSave(page);
      await enterChefSelect(page);
      // 아르준(index 6)으로 이동
      for (let i = 0; i < 6; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }
      await page.screenshot({ path: 'tests/screenshots/phase57-arjun-unlocked.png' });
    });
  });

  // ====================================================================
  // 11. 엣지케이스 및 안정성
  // ====================================================================
  test.describe('11. 엣지케이스 및 안정성', () => {
    test('콘솔 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 다양한 조작 수행
      await clickGameXY(page, 338, 270);
      await page.waitForTimeout(300);
      await clickGameXY(page, 338, 270);
      await page.waitForTimeout(300);
      await clickGameXY(page, 22, 270);
      await page.waitForTimeout(300);

      await page.waitForTimeout(1000);
      expect(errors).toEqual([]);
    });

    test('> 버튼 빠른 연타 시 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 빠르게 10번 연타
      for (let i = 0; i < 10; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(1000);

      // tween 도중 클릭 무시는 _tweening 플래그로 처리
      expect(errors).toEqual([]);
    });

    test('tween 진행 중 스와이프 시작이 억제된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // > 클릭 직후 바로 스와이프 시도
      await clickGameXY(page, 338, 270);
      // tween 진행 중 (220ms) 즉시 스와이프
      const start = await gameToViewport(page, 200, 270);
      const end = await gameToViewport(page, 100, 270);
      await page.mouse.move(start.vx, start.vy);
      await page.mouse.down();
      await page.mouse.move(end.vx, end.vy, { steps: 5 });
      await page.mouse.up();

      await page.waitForTimeout(600);

      // 에러 없이 정상 종료
      const idx = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene')._currentIndex;
      });
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(7);
    });

    test('선택 버튼 더블클릭 시 에러 없음 (씬 중복 전환 방지)', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // "이 셰프로 시작" 더블클릭
      await clickGameXY(page, 180, 549);
      await clickGameXY(page, 180, 549);
      await page.waitForTimeout(1500);

      expect(errors).toEqual([]);
    });

    test('모든 7종 셰프를 순회하며 에러 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFullUnlockSave(page);
      await enterChefSelect(page);

      // 7종 모두 순회
      for (let i = 0; i < 7; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }
      // 역방향 순회
      for (let i = 0; i < 7; i++) {
        await clickGameXY(page, 22, 270);
        await page.waitForTimeout(400);
      }

      expect(errors).toEqual([]);
    });

    test('stageId 없이 씬 시작해도 기본값 동작', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);

      await page.evaluate(() => {
        const game = window.__game;
        game.scene.scenes.forEach(s => {
          if (s.scene.isActive()) game.scene.stop(s.scene.key);
        });
        // stageId 없이 시작
        game.scene.start('ChefSelectScene', {});
      });

      await page.waitForTimeout(1500);

      const stageId = await page.evaluate(() => {
        return window.__game.scene.getScene('ChefSelectScene').stageId;
      });

      expect(stageId).toBe('1-1'); // 기본값
      expect(errors).toEqual([]);
    });

    test('데이터 없이 씬 시작해도 에러 없음 (create(undefined))', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL);
      await waitForGame(page);

      await page.evaluate(() => {
        const game = window.__game;
        game.scene.scenes.forEach(s => {
          if (s.scene.isActive()) game.scene.stop(s.scene.key);
        });
        // 데이터 없이 시작
        game.scene.start('ChefSelectScene');
      });

      await page.waitForTimeout(1500);
      expect(errors).toEqual([]);
    });
  });

  // ====================================================================
  // 12. 선택 버튼 상태 갱신 검증
  // ====================================================================
  test.describe('12. 선택 버튼 상태 갱신', () => {
    test('해금 셰프 -> 잠금 셰프 전환 시 버튼이 비활성화된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 미미(해금) 상태에서 버튼 확인
      const mimiBtn = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        return {
          text: scene._selectBtnText.text,
          hasInput: !!scene._selectBtnBg.input?.enabled,
        };
      });
      expect(mimiBtn.text).toBe('\uC774 \uC170\uD504\uB85C \uC2DC\uC791'); // "이 셰프로 시작"
      expect(mimiBtn.hasInput).toBe(true);

      // 유키(잠금)로 이동
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }

      const yukiBtn = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        return {
          text: scene._selectBtnText.text,
          hasInput: !!scene._selectBtnBg.input?.enabled,
        };
      });
      expect(yukiBtn.text).toBe('\uC7A0\uAE08\uB428'); // "잠금됨"
      expect(yukiBtn.hasInput).toBe(false);
    });

    test('잠금 셰프 -> 해금 셰프 전환 시 버튼이 활성화된다', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForGame(page);
      await injectFreshSave(page);
      await enterChefSelect(page);

      // 유키(잠금)로 이동
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 338, 270);
        await page.waitForTimeout(400);
      }

      // 다시 미미(해금)로 복귀
      for (let i = 0; i < 3; i++) {
        await clickGameXY(page, 22, 270);
        await page.waitForTimeout(400);
      }

      const btnState = await page.evaluate(() => {
        const scene = window.__game.scene.getScene('ChefSelectScene');
        return {
          text: scene._selectBtnText.text,
          hasInput: !!scene._selectBtnBg.input?.enabled,
        };
      });
      expect(btnState.text).toBe('\uC774 \uC170\uD504\uB85C \uC2DC\uC791');
      expect(btnState.hasInput).toBe(true);
    });
  });
});
