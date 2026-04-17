/**
 * @fileoverview Phase 41 QA -- 23-6 여왕의 호위대 구현 + storyData 트리거 이동 검증.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Phase 41: 23-6 여왕의 호위대', () => {

  // ── 1. 게임 로드 + pageerror 0건 ──

  test('게임 로드 시 콘솔 에러 0건', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // Phaser 초기화 대기
    await page.waitForTimeout(4000);
    expect(errors).toEqual([]);
  });

  // ── 2. stageData.js 23-6 데이터 검증 ──

  test('stageData 23-6: placeholder 제거, theme=dream_deep', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const stage = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'];
    });
    expect(stage).toBeTruthy();
    expect(stage.theme).not.toBe('placeholder');
    expect(stage.theme).toBe('dream_deep');
  });

  test('stageData 23-6: nameKo=여왕의 호위대', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const stage = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'];
    });
    expect(stage.nameKo).toBe('여왕의 호위대');
  });

  test('stageData 23-6: pathSegments 3개', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const stage = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'];
    });
    expect(stage.pathSegments).toHaveLength(3);
  });

  test('stageData 23-6: waves 3개', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const stage = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'];
    });
    expect(stage.waves).toHaveLength(3);
  });

  test('stageData 23-6: customers 3개', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const stage = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'];
    });
    expect(stage.customers).toHaveLength(3);
  });

  test('stageData 23-6: macaron_knight, sugar_specter, candy_soldier, cake_witch 포함', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const enemyTypes = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const stage = mod.STAGES['23-6'];
      const types = new Set();
      stage.waves.forEach(w => w.enemies.forEach(e => types.add(e.type)));
      return [...types];
    });
    expect(enemyTypes).toContain('macaron_knight');
    expect(enemyTypes).toContain('sugar_specter');
    expect(enemyTypes).toContain('candy_soldier');
    expect(enemyTypes).toContain('cake_witch');
  });

  test('stageData 23-6: starThresholds.three > starThresholds.two', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const thresholds = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'].starThresholds;
    });
    expect(thresholds.three).toBeGreaterThan(thresholds.two);
  });

  // ── 3. storyData.js 트리거 검증 ──

  test('storyData: chapter23_cleared 트리거가 23-6에서만 발동', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const triggers = mod.STORY_TRIGGERS;

      // chapter23_cleared를 설정하는 트리거 찾기
      // result_clear triggerPoint에서 onComplete로 chapter23_cleared를 설정하는 항목
      const chapter23Triggers = triggers.filter(t => {
        if (t.triggerPoint !== 'result_clear') return false;
        // onComplete 함수 소스에 chapter23_cleared 포함 확인
        if (t.onComplete && t.onComplete.toString().includes('chapter23_cleared')) return true;
        return false;
      });

      // 각 트리거의 condition을 23-5와 23-6에 대해 테스트
      const results = [];
      for (const trigger of chapter23Triggers) {
        // 23-5 ctx
        const fires235 = trigger.condition(
          { isFirstClear: true, stars: 3, stageId: '23-5' },
          { storyProgress: { currentChapter: 23 } }
        );
        // 23-6 ctx
        const fires236 = trigger.condition(
          { isFirstClear: true, stars: 3, stageId: '23-6' },
          { storyProgress: { currentChapter: 23 } }
        );
        results.push({ fires235, fires236 });
      }

      return { count: chapter23Triggers.length, results };
    });

    // 정확히 1개의 chapter23_cleared 트리거가 있어야 함
    expect(result.count).toBe(1);
    // 23-5에서는 발동하지 않아야 함
    expect(result.results[0].fires235).toBe(false);
    // 23-6에서는 발동해야 함
    expect(result.results[0].fires236).toBe(true);
  });

  test('storyData: 23-5 stageId 조건이 코드에 없음 (주석 제외)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const hasStageId235InCondition = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const triggers = mod.STORY_TRIGGERS;

      // 모든 트리거의 condition 함수 소스를 검사하여 '23-5' stageId 참조 확인
      for (const t of triggers) {
        if (t.condition) {
          const src = t.condition.toString();
          if (src.includes("'23-5'") || src.includes('"23-5"')) {
            return true;
          }
        }
      }
      return false;
    });

    expect(hasStageId235InCondition).toBe(false);
  });

  // ── 4. 추가 엣지케이스: starThresholds 양수 검증 ──

  test('stageData 23-6: starThresholds가 양수', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const thresholds = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'].starThresholds;
    });
    expect(thresholds.two).toBeGreaterThan(0);
    expect(thresholds.three).toBeGreaterThan(0);
  });

  // ── 5. 추가 엣지케이스: enemy count/interval 양수 검증 ──

  test('stageData 23-6: 모든 웨이브 enemy count/interval이 양수', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const issues = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const stage = mod.STAGES['23-6'];
      const problems = [];
      stage.waves.forEach((w, wi) => {
        w.enemies.forEach((e, ei) => {
          if (e.count <= 0) problems.push(`wave ${wi + 1} enemy ${ei}: count=${e.count}`);
          if (e.interval <= 0) problems.push(`wave ${wi + 1} enemy ${ei}: interval=${e.interval}`);
        });
      });
      return problems;
    });
    expect(issues).toEqual([]);
  });

  // ── 6. 추가 엣지케이스: STAGE_ORDER에 23-6 포함 확인 ──

  test('stageData: STAGE_ORDER에 23-6 포함', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const included = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGE_ORDER?.includes('23-6') ?? false;
    });
    expect(included).toBe(true);
  });

  // ── 7. 추가 엣지케이스: wave 번호 연속성 ──

  test('stageData 23-6: wave 번호가 1, 2, 3 순서', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const waveNumbers = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-6'].waves.map(w => w.wave);
    });
    expect(waveNumbers).toEqual([1, 2, 3]);
  });

  // ── 8. 추가 엣지케이스: customer wave 번호 매칭 ──

  test('stageData 23-6: customer wave 번호가 waves와 일치', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const data = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const s = mod.STAGES['23-6'];
      return {
        waveNums: s.waves.map(w => w.wave),
        custWaveNums: s.customers.map(c => c.wave),
      };
    });
    expect(data.custWaveNums).toEqual(data.waveNums);
  });

  // ── 9. 23-6 첫 클리어 시 currentChapter가 24로 올라가지 않을 조건 (isFirstClear=false) ──

  test('storyData: 23-6 재클리어(isFirstClear=false) 시 chapter23_cleared 트리거 미발동', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const fires = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const triggers = mod.STORY_TRIGGERS;
      const t = triggers.find(tr =>
        tr.triggerPoint === 'result_clear' &&
        tr.onComplete && tr.onComplete.toString().includes('chapter23_cleared')
      );
      if (!t) return 'NOT_FOUND';
      return t.condition(
        { isFirstClear: false, stars: 3, stageId: '23-6' },
        { storyProgress: { currentChapter: 23 } }
      );
    });

    expect(fires).toBe(false);
  });

  // ── 10. 기존 23-5 스테이지가 여전히 존재하는지 (회귀 방지) ──

  test('stageData: 23-5 스테이지가 여전히 정상 존재', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const stage = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      return mod.STAGES['23-5'];
    });
    expect(stage).toBeTruthy();
    expect(stage.theme).not.toBe('placeholder');
  });
});
