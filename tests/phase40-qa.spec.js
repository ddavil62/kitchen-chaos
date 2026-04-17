/**
 * @fileoverview Phase 40 QA -- 그룹3 6스테이지 placeholder 5종 구현 검증
 * 16-6, 17-6, 19-6, 20-6, 22-6 스테이지 데이터 무결성 + storyData 트리거 이동 + 콘솔 에러 검증.
 */
import { test, expect } from '@playwright/test';

// ── 대상 스테이지 ID ──
const TARGET_STAGES = ['16-6', '17-6', '19-6', '20-6', '22-6'];

test.describe('Phase 40 QA -- 그룹3 placeholder 5종 구현', () => {

  // ── A. 브라우저 로드 + 콘솔 에러 ──────────────────────────────────────
  test.describe('A. 브라우저 로드 및 콘솔 에러', () => {
    test('게임이 로드되고 JS pageerror 0건이다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      await page.screenshot({ path: 'tests/screenshots/phase40-main-screen.png' });

      expect(errors).toEqual([]);
      const criticalErrors = consoleErrors.filter(e =>
        !e.includes('404') && !e.includes('net::ERR') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Failed to process file')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('10초간 안정성 -- JS 예외 없음', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(10000);

      expect(errors).toEqual([]);
    });

    test('window.__game 인스턴스 존재 확인', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(4000);

      const gameExists = await page.evaluate(() => !!window.__game);
      expect(gameExists).toBeTruthy();
    });
  });

  // ── B. stageData 동적 import로 5개 스테이지 데이터 무결성 검증 ──────────
  test.describe('B. 스테이지 데이터 무결성 (동적 import)', () => {
    test('5개 스테이지가 stageData에 존재하고 placeholder가 아닌지 확인', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        try {
          const mod = await import('/js/data/stageData.js');
          const stages = mod.STAGES;
          const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
          const results = {};
          for (const id of ids) {
            const s = stages[id];
            if (!s) {
              results[id] = { exists: false };
              continue;
            }
            results[id] = {
              exists: true,
              theme: s.theme,
              isPlaceholder: s.theme === 'placeholder',
              nameKo: s.nameKo,
              hasPathSegments: Array.isArray(s.pathSegments) && s.pathSegments.length > 0,
              hasWaves: Array.isArray(s.waves) && s.waves.length > 0,
              waveCount: s.waves ? s.waves.length : 0,
              hasCustomers: Array.isArray(s.customers) && s.customers.length > 0,
              hasStarThresholds: !!s.starThresholds,
              hasService: !!s.service,
            };
          }
          return results;
        } catch (e) {
          return { error: e.message };
        }
      });

      expect(result.error).toBeUndefined();
      for (const id of TARGET_STAGES) {
        expect(result[id].exists, `${id} should exist`).toBe(true);
        expect(result[id].isPlaceholder, `${id} should not be placeholder`).toBe(false);
        expect(result[id].hasPathSegments, `${id} should have pathSegments`).toBe(true);
        expect(result[id].hasWaves, `${id} should have waves`).toBe(true);
        expect(result[id].hasCustomers, `${id} should have customers`).toBe(true);
        expect(result[id].hasStarThresholds, `${id} should have starThresholds`).toBe(true);
        expect(result[id].hasService, `${id} should have service`).toBe(true);
      }
    });

    test('16-6: 향신료 궁전의 관문, spice_palace, 3웨이브, maharaja 보스', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const s = mod.STAGES['16-6'];
        if (!s) return { error: 'stage not found' };
        const wave3 = s.waves.find(w => w.wave === 3);
        const hasMaharaja = wave3 && wave3.enemies.some(e => e.type === 'maharaja' && e.count === 1);
        return {
          nameKo: s.nameKo,
          theme: s.theme,
          waveCount: s.waves.length,
          hasMaharaja,
          customerCount: s.customers.length,
        };
      });

      expect(result.error).toBeUndefined();
      expect(result.nameKo).toBe('향신료 궁전의 관문');
      expect(result.theme).toBe('spice_palace');
      expect(result.waveCount).toBe(3);
      expect(result.hasMaharaja).toBe(true);
      expect(result.customerCount).toBe(3);
    });

    test('17-6: 향신료 심층부의 폭풍, spice_palace, 2웨이브, maharaja 없음', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const s = mod.STAGES['17-6'];
        if (!s) return { error: 'stage not found' };
        const hasAnyMaharaja = s.waves.some(w =>
          w.enemies.some(e => e.type === 'maharaja')
        );
        return {
          nameKo: s.nameKo,
          theme: s.theme,
          waveCount: s.waves.length,
          hasAnyMaharaja,
          customerCount: s.customers.length,
        };
      });

      expect(result.error).toBeUndefined();
      expect(result.nameKo).toBe('향신료 심층부의 폭풍');
      expect(result.theme).toBe('spice_palace');
      expect(result.waveCount).toBe(2);
      expect(result.hasAnyMaharaja).toBe(false);
      expect(result.customerCount).toBe(2);
    });

    test('19-6: 칸티나의 최후 방어선, cactus_cantina, 2웨이브', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const s = mod.STAGES['19-6'];
        if (!s) return { error: 'stage not found' };
        return {
          nameKo: s.nameKo,
          theme: s.theme,
          waveCount: s.waves.length,
          customerCount: s.customers.length,
        };
      });

      expect(result.error).toBeUndefined();
      expect(result.nameKo).toBe('칸티나의 최후 방어선');
      expect(result.theme).toBe('cactus_cantina');
      expect(result.waveCount).toBe(2);
      expect(result.customerCount).toBe(2);
    });

    test('20-6: 균열의 심장, cactus_cantina, 4웨이브, el_diablo_pepper 보스', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const s = mod.STAGES['20-6'];
        if (!s) return { error: 'stage not found' };
        const wave4 = s.waves.find(w => w.wave === 4);
        const hasDiablo = wave4 && wave4.enemies.some(e => e.type === 'el_diablo_pepper' && e.count === 1);
        return {
          nameKo: s.nameKo,
          theme: s.theme,
          waveCount: s.waves.length,
          hasDiablo,
          customerCount: s.customers.length,
        };
      });

      expect(result.error).toBeUndefined();
      expect(result.nameKo).toBe('균열의 심장');
      expect(result.theme).toBe('cactus_cantina');
      expect(result.waveCount).toBe(4);
      expect(result.hasDiablo).toBe(true);
      expect(result.customerCount).toBe(4);
    });

    test('22-6: 케이크 위치의 연회, dream_candy, 3웨이브, cake_witch 다수', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const s = mod.STAGES['22-6'];
        if (!s) return { error: 'stage not found' };
        // cake_witch가 모든 웨이브에 등장, isBoss: false (다수 사용)
        const cakeWitchCounts = s.waves.map(w => {
          const cw = w.enemies.find(e => e.type === 'cake_witch');
          return cw ? cw.count : 0;
        });
        const totalCakeWitch = cakeWitchCounts.reduce((a, b) => a + b, 0);
        // candy_soldier도 모든 웨이브에 등장
        const candySoldierPresent = s.waves.every(w =>
          w.enemies.some(e => e.type === 'candy_soldier')
        );
        return {
          nameKo: s.nameKo,
          theme: s.theme,
          waveCount: s.waves.length,
          cakeWitchCounts,
          totalCakeWitch,
          candySoldierPresent,
          customerCount: s.customers.length,
        };
      });

      expect(result.error).toBeUndefined();
      expect(result.nameKo).toBe('케이크 위치의 연회');
      expect(result.theme).toBe('dream_candy');
      expect(result.waveCount).toBe(3);
      expect(result.totalCakeWitch).toBeGreaterThan(1); // 다수 사용 (isBoss: false)
      expect(result.candySoldierPresent).toBe(true);
      expect(result.customerCount).toBe(3);
    });
  });

  // ── C. storyData 트리거 이동 검증 ─────────────────────────────────────
  test.describe('C. storyData 트리거 검증', () => {
    test('chapter22_cleared 트리거가 22-6에서 발동, 22-5에서는 발동하지 않음', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/storyData.js');
        const triggers = mod.STORY_TRIGGERS;
        // result_clear 트리거 중 onComplete 내에서 chapter22_cleared를 설정하는 트리거를 찾는다.
        // 이 트리거만 22-6에서 발동하고, 22-5에서는 발동하지 않아야 한다.
        // onComplete가 있고 dialogueId가 null인 result_clear 트리거 중 22-6 조건인 것만 필터
        const chapterTriggers = triggers.filter(t =>
          t.triggerPoint === 'result_clear' && t.onComplete && t.dialogueId === null
        );
        // 22-5로 조건 평가
        const fires22_5 = chapterTriggers.some(t => {
          try {
            const ctx = { isFirstClear: true, stars: 3, stageId: '22-5' };
            return t.condition(ctx, { storyProgress: { currentChapter: 22, storyFlags: {} } });
          } catch { return false; }
        });
        // 22-6으로 조건 평가
        const fires22_6 = chapterTriggers.some(t => {
          try {
            const ctx = { isFirstClear: true, stars: 3, stageId: '22-6' };
            return t.condition(ctx, { storyProgress: { currentChapter: 22, storyFlags: {} } });
          } catch { return false; }
        });
        return { fires22_5, fires22_6, count: chapterTriggers.length };
      });

      // chapter22_cleared 트리거가 22-5에서 발동하면 안 됨 (22-6으로 이동됨)
      expect(result.fires22_5, '22-5 should NOT trigger chapter22_cleared').toBe(false);
      expect(result.fires22_6, '22-6 should trigger chapter22_cleared').toBe(true);
    });
  });

  // ── D. 전체 placeholder 잔존 검증 ─────────────────────────────────────
  test.describe('D. placeholder 잔존 검증', () => {
    test('대상 5개 스테이지에 placeholder theme 없음', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const stages = mod.STAGES;
        const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
        const placeholders = ids.filter(id => stages[id]?.theme === 'placeholder');
        return { placeholders };
      });

      expect(result.placeholders).toEqual([]);
    });
  });

  // ── E. 보스 패턴 일관성 (18-6, 21-6과 비교) ──────────────────────────
  test.describe('E. 보스 패턴 일관성', () => {
    test('maharaja 16-6 보스 패턴이 18-6과 동일 (count:1, interval:0)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const stages = mod.STAGES;
        // 16-6 보스 웨이브
        const s16 = stages['16-6'];
        const boss16 = s16.waves.find(w => w.wave === 3)?.enemies
          .find(e => e.type === 'maharaja');
        // 18-6 보스 웨이브 (기존 보스전 -- 비교 대상)
        const s18 = stages['18-6'];
        const lastWave18 = s18.waves[s18.waves.length - 1];
        const boss18 = lastWave18?.enemies.find(e => e.type === 'maharaja');
        return {
          boss16: boss16 ? { count: boss16.count, interval: boss16.interval } : null,
          boss18: boss18 ? { count: boss18.count, interval: boss18.interval } : null,
        };
      });

      expect(result.boss16).toBeTruthy();
      expect(result.boss16.count).toBe(1);
      expect(result.boss16.interval).toBe(0);
      // 18-6도 동일 패턴인지 확인
      expect(result.boss18).toBeTruthy();
      expect(result.boss18.count).toBe(1);
      expect(result.boss18.interval).toBe(0);
    });

    test('el_diablo_pepper 20-6 보스 패턴이 21-6과 동일 (count:1, interval:0)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const stages = mod.STAGES;
        // 20-6 보스 웨이브
        const s20 = stages['20-6'];
        const boss20 = s20.waves.find(w => w.wave === 4)?.enemies
          .find(e => e.type === 'el_diablo_pepper');
        // 21-6 보스 웨이브 (기존 보스전 -- 비교 대상)
        const s21 = stages['21-6'];
        const lastWave21 = s21.waves[s21.waves.length - 1];
        const boss21 = lastWave21?.enemies.find(e => e.type === 'el_diablo_pepper');
        return {
          boss20: boss20 ? { count: boss20.count, interval: boss20.interval } : null,
          boss21: boss21 ? { count: boss21.count, interval: boss21.interval } : null,
        };
      });

      expect(result.boss20).toBeTruthy();
      expect(result.boss20.count).toBe(1);
      expect(result.boss20.interval).toBe(0);
      expect(result.boss21).toBeTruthy();
      expect(result.boss21.count).toBe(1);
      expect(result.boss21.interval).toBe(0);
    });

    test('cake_witch isBoss: false 확인 (gameData)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/gameData.js');
        const enemies = mod.ENEMY_TYPES || mod.ENEMIES;
        // gameData에서 cake_witch 찾기
        const cw = enemies?.cake_witch;
        return { isBoss: cw?.isBoss, exists: !!cw };
      });

      expect(result.exists).toBe(true);
      expect(result.isBoss).toBe(false);
    });
  });

  // ── F. 웨이브-고객 수 매칭 검증 ───────────────────────────────────────
  test.describe('F. 웨이브-고객 매칭 검증', () => {
    test('각 스테이지의 웨이브 수와 고객 수가 일치', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const stages = mod.STAGES;
        const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
        const mismatches = [];
        for (const id of ids) {
          const s = stages[id];
          if (!s) { mismatches.push({ id, error: 'not found' }); continue; }
          if (s.waves.length !== s.customers.length) {
            mismatches.push({
              id,
              waveCount: s.waves.length,
              customerCount: s.customers.length,
            });
          }
        }
        return { mismatches };
      });

      expect(result.mismatches).toEqual([]);
    });
  });

  // ── G. stageOrder 배열 등록 검증 ──────────────────────────────────────
  test.describe('G. stageOrder 등록 확인', () => {
    test('5개 스테이지가 STAGE_ORDER에 등록', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const order = mod.STAGE_ORDER;
        const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
        const missing = ids.filter(id => !order.includes(id));
        return { missing };
      });

      expect(result.missing).toEqual([]);
    });
  });

  // ── H. 엣지 케이스: 적 유형 gameData 등록 여부 ────────────────────────
  test.describe('H. 적 유형 gameData 등록 여부', () => {
    test('5개 스테이지에 사용된 모든 적 유형이 gameData에 정의', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const stageMod = await import('/js/data/stageData.js');
        const gameMod = await import('/js/data/gameData.js');
        const stages = stageMod.STAGES;
        const enemies = gameMod.ENEMY_TYPES || gameMod.ENEMIES;
        const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
        const undefinedEnemies = [];
        for (const id of ids) {
          const s = stages[id];
          if (!s) continue;
          for (const w of s.waves) {
            for (const e of w.enemies) {
              if (!enemies[e.type]) {
                undefinedEnemies.push({ stage: id, wave: w.wave, type: e.type });
              }
            }
          }
        }
        return { undefinedEnemies };
      });

      expect(result.undefinedEnemies).toEqual([]);
    });
  });

  // ── I. pathSegments 유효성 검증 ───────────────────────────────────────
  test.describe('I. pathSegments 유효성', () => {
    test('모든 pathSegment가 gridCols/gridRows 범위 내', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const stages = mod.STAGES;
        const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
        const issues = [];
        for (const id of ids) {
          const s = stages[id];
          if (!s) continue;
          for (const seg of s.pathSegments) {
            if (seg.type === 'vertical') {
              if (seg.col < 0 || seg.col >= s.gridCols)
                issues.push({ id, seg, error: 'col out of range' });
              if (seg.rowStart < 0 || seg.rowEnd >= s.gridRows)
                issues.push({ id, seg, error: 'row out of range' });
            } else if (seg.type === 'horizontal') {
              if (seg.row < 0 || seg.row >= s.gridRows)
                issues.push({ id, seg, error: 'row out of range' });
              if (seg.colStart < 0 || seg.colEnd >= s.gridCols)
                issues.push({ id, seg, error: 'col out of range' });
            }
          }
        }
        return { issues };
      });

      expect(result.issues).toEqual([]);
    });
  });

  // ── J. starThresholds 양수 + three > two 검증 ─────────────────────────
  test.describe('J. starThresholds 유효성', () => {
    test('starThresholds.three > starThresholds.two (양수)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/data/stageData.js');
        const stages = mod.STAGES;
        const ids = ['16-6', '17-6', '19-6', '20-6', '22-6'];
        const issues = [];
        for (const id of ids) {
          const s = stages[id];
          if (!s) continue;
          const { three, two } = s.starThresholds;
          if (three <= 0 || two <= 0) issues.push({ id, error: 'non-positive' });
          if (three <= two) issues.push({ id, error: `three(${three}) <= two(${two})` });
        }
        return { issues };
      });

      expect(result.issues).toEqual([]);
    });
  });
});
