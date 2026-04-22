/**
 * @fileoverview Phase 73 P2-3: ChefSelectScene 포트레이트 정합 검증.
 *
 * 정식 포트레이트 8종만 참조하고, candidates/_archive 경로 요청이 없으며,
 * 404 응답이 0건인지 확인한다.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SAVE_KEY = 'kitchenChaosTycoon_save';

// ── 공용 헬퍼 ───────────────────────────────────────────────────────

/** Phaser 게임 인스턴스 부팅 대기 (MenuScene 활성화까지) */
async function waitForGame(page) {
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game) return false;
    const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
    return activeScenes.includes('MenuScene');
  }, { timeout: 45000, polling: 500 });
}

/** canvas->page 좌표 변환 헬퍼 */
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

/** 게임 좌표 → 페이지 좌표로 변환하여 클릭 */
async function clickCanvas(page, gameX, gameY) {
  const t = await getCanvasTransform(page);
  const pageX = t.offsetX + gameX * t.scaleX;
  const pageY = t.offsetY + gameY * t.scaleY;
  await page.mouse.click(pageX, pageY);
}

/**
 * ChefSelectScene에 진입 가능한 세이브를 주입한다.
 */
async function injectSaveForChefSelect(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 24,
      selectedChef: 'mimi_chef',
      stages: { '1-1': { cleared: true, stars: 3 } },
      gold: 1000,
      kitchenCoins: 50,
      toolInventory: {
        pan: { count: 1, level: 1 },
        salt: { count: 1, level: 1 },
        grill: { count: 1, level: 1 },
        delivery: { count: 1, level: 1 },
        freezer: { count: 1, level: 1 },
        soup_pot: { count: 1, level: 1 },
        wasabi_cannon: { count: 1, level: 1 },
        spice_grinder: { count: 1, level: 1 },
      },
      season2Unlocked: false,
      season3Unlocked: false,
      storyProgress: { currentChapter: 1, storyFlags: {} },
      endless: {
        unlocked: false,
        bestWave: 0,
        bestScore: 0,
        bestCombo: 0,
        lastDailySeed: 0,
        stormCount: 0,
        missionSuccessCount: 0,
        noLeakStreak: 0,
      },
      branchCards: {
        toolMutations: {},
        unlockedBranchRecipes: [],
        chefBonds: [],
        activeBlessing: null,
        lastVisit: null,
      },
      soundSettings: { bgmVolume: 0, sfxVolume: 0, muted: true },
    }));
  }, SAVE_KEY);
}

// ── 포트레이트 정합 테스트 ────────────────────────────────────────

test.describe('P2-3 ChefSelectScene 포트레이트 정합', () => {
  // 씬 전환 + 네트워크 수집에 시간이 걸려 기본 30s로 부족할 수 있음
  test.setTimeout(60000);
  test('ChefSelectScene 진입 시 네트워크 요청에 candidates/ 경로 없음', async ({ page }) => {
    const requests = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.goto('/');
    await waitForGame(page);
    await injectSaveForChefSelect(page);

    // ChefSelectScene으로 직접 전환
    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(3000);

    const candidateRequests = requests.filter(url => url.includes('candidates/'));
    expect(candidateRequests.length).toBe(0);
  });

  test('ChefSelectScene 진입 시 네트워크 요청에 _archive/ 경로 없음', async ({ page }) => {
    const requests = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.goto('/');
    await waitForGame(page);
    await injectSaveForChefSelect(page);

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(3000);

    const archiveRequests = requests.filter(url => url.includes('_archive/'));
    expect(archiveRequests.length).toBe(0);
  });

  test('정식 포트레이트 7종 (ChefSelectScene 용) 모두 텍스처 로드됨', async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
    await injectSaveForChefSelect(page);

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(3000);

    // BootScene에서 이미 preload한 텍스처가 존재하는지 확인
    const textureCheck = await page.evaluate(() => {
      const ids = ['mimi', 'rin', 'mage', 'yuki', 'lao', 'andre', 'arjun'];
      const results = {};
      for (const id of ids) {
        const key = `portrait_${id}`;
        // Phaser textures.exists 또는 텍스처 매니저에 등록됐는지 확인
        results[id] = window.__game?.textures?.exists(key) || false;
      }
      return results;
    });

    const portraitIds = ['mimi', 'rin', 'mage', 'yuki', 'lao', 'andre', 'arjun'];
    for (const id of portraitIds) {
      expect(textureCheck[id], `portrait_${id} 텍스처 로드 실패`).toBe(true);
    }
  });

  test('portrait_poco.png는 ChefSelectScene에서 요청 안 됨', async ({ page }) => {
    const requests = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });

    await page.goto('/');
    await waitForGame(page);
    await injectSaveForChefSelect(page);

    // BootScene 로드 완료 후의 요청만 추적하기 위해 이전 요청 카운트 기록
    const preBootCount = requests.length;

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(3000);

    // ChefSelectScene 전환 이후에 poco가 요청됐는지 확인
    const postBootRequests = requests.slice(preBootCount);
    const pocoRequests = postBootRequests.filter(url => url.includes('portrait_poco'));
    expect(pocoRequests.length).toBe(0);
  });

  test('전 셰프 순환 탐색 시 404 요청 0건', async ({ page }) => {
    const failedResponses = [];
    page.on('response', (res) => {
      if (res.status() === 404 && res.url().includes('portrait')) {
        failedResponses.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto('/');
    await waitForGame(page);
    await injectSaveForChefSelect(page);

    await page.evaluate(() => {
      window.__game.scene.start('ChefSelectScene', { stageId: '1-2' });
    });
    await page.waitForTimeout(3000);

    // 우측 화살표로 7셰프 순환 (약 x=320, y=320)
    for (let i = 0; i < 7; i++) {
      await clickCanvas(page, 320, 320);
      await page.waitForTimeout(500);
    }

    expect(failedResponses.length).toBe(0);
  });

  test('candidates 폴더 부존재 확인 (fs.existsSync)', async () => {
    const candidatesPath = path.resolve('assets/portraits/candidates');
    expect(fs.existsSync(candidatesPath)).toBe(false);
  });

  test('_archive 폴더 부존재 확인 (fs.existsSync)', async () => {
    const archivePath = path.resolve('assets/portraits/_archive');
    expect(fs.existsSync(archivePath)).toBe(false);
  });
});
