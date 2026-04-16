/**
 * @fileoverview Phase 32-4 QA 테스트 -- 18장 대화 스크립트 6종 + CHARACTERS + 소급 수정 검증.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 32-4 대화/스토리 데이터 검증', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  test('게임이 크래시 없이 로드된다', async ({ page }) => {
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/phase32-4-loaded.png' });

    const fatalErrors = page._consoleErrors.filter(
      e => e.includes('SyntaxError') || e.includes('ReferenceError') || e.includes('TypeError')
    );
    expect(fatalErrors).toEqual([]);
  });

  test('CHARACTERS에 masala_guide가 올바르게 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const c = mod.CHARACTERS.masala_guide;
      return {
        exists: !!c,
        id: c?.id,
        nameKo: c?.nameKo,
        portraitKey: c?.portraitKey,
        color: c?.color,
        role: c?.role,
      };
    });

    expect(result.exists).toBe(true);
    expect(result.id).toBe('masala_guide');
    expect(result.nameKo).toBe('아르준');
    expect(result.portraitKey).toBe('masala_guide');
    expect(result.color).toBe(0xd4a017);
    expect(result.role).toBe('ally');
  });

  test('CHARACTERS에 maharaja가 올바르게 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const c = mod.CHARACTERS.maharaja;
      return {
        exists: !!c,
        id: c?.id,
        nameKo: c?.nameKo,
        portraitKey: c?.portraitKey,
        color: c?.color,
        role: c?.role,
      };
    });

    expect(result.exists).toBe(true);
    expect(result.id).toBe('maharaja');
    expect(result.nameKo).toBe('마하라자');
    expect(result.portraitKey).toBe('maharaja');
    expect(result.color).toBe(0xb8860b);
    expect(result.role).toBe('boss');
  });

  test('대화 6종이 모두 존재하고 lines가 비어있지 않다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const ids = ['chapter18_intro', 'chapter18_mid', 'chapter18_boss',
        'chapter18_clear', 'chapter18_epilogue', 'team_side_18'];
      return ids.map(id => ({
        id,
        exists: !!mod.DIALOGUES[id],
        lineCount: mod.DIALOGUES[id]?.lines?.length || 0,
        hasId: mod.DIALOGUES[id]?.id === id,
        skippable: mod.DIALOGUES[id]?.skippable,
      }));
    });

    for (const d of result) {
      expect(d.exists, `${d.id} exists`).toBe(true);
      expect(d.lineCount, `${d.id} has lines`).toBeGreaterThan(0);
      expect(d.hasId, `${d.id} id matches key`).toBe(true);
      expect(d.skippable, `${d.id} skippable`).toBe(true);
    }
  });

  test('각 대화의 라인 수가 올바르다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      return {
        chapter18_intro: mod.DIALOGUES.chapter18_intro.lines.length,
        chapter18_mid: mod.DIALOGUES.chapter18_mid.lines.length,
        chapter18_boss: mod.DIALOGUES.chapter18_boss.lines.length,
        chapter18_clear: mod.DIALOGUES.chapter18_clear.lines.length,
        chapter18_epilogue: mod.DIALOGUES.chapter18_epilogue.lines.length,
        team_side_18: mod.DIALOGUES.team_side_18.lines.length,
      };
    });

    // 리포트 기준 라인 수 검증 (스펙과 약간 차이있으나 리포트 기준 정확)
    expect(result.chapter18_intro).toBe(12);
    expect(result.chapter18_mid).toBe(12);
    expect(result.chapter18_boss).toBe(10);
    expect(result.chapter18_clear).toBe(9);
    expect(result.chapter18_epilogue).toBe(11);
    expect(result.team_side_18).toBe(8);
  });

  test('모든 대화 라인에 speaker/text 필드가 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const ids = ['chapter18_intro', 'chapter18_mid', 'chapter18_boss',
        'chapter18_clear', 'chapter18_epilogue', 'team_side_18'];
      const issues = [];
      for (const id of ids) {
        const d = mod.DIALOGUES[id];
        d.lines.forEach((line, idx) => {
          if (typeof line.speaker !== 'string') issues.push(`${id}[${idx}] missing speaker`);
          if (typeof line.text !== 'string' || line.text.length === 0) issues.push(`${id}[${idx}] empty text`);
          if (typeof line.portrait !== 'string' && line.portrait !== '') issues.push(`${id}[${idx}] missing portrait`);
        });
      }
      return issues;
    });

    expect(result).toEqual([]);
  });

  test('아르준/마하라자 대사에 portraitKey가 올바르다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const ids = ['chapter18_intro', 'chapter18_mid', 'chapter18_boss',
        'chapter18_clear', 'chapter18_epilogue', 'team_side_18'];
      const issues = [];
      for (const id of ids) {
        mod.DIALOGUES[id].lines.forEach((line, idx) => {
          if (line.speaker === '아르준' && line.portraitKey !== 'masala_guide') {
            issues.push(`${id}[${idx}] arjun missing portraitKey:masala_guide`);
          }
          if (line.speaker === '마하라자' && line.portraitKey !== 'maharaja') {
            issues.push(`${id}[${idx}] maharaja missing portraitKey:maharaja`);
          }
        });
      }
      return issues;
    });

    expect(result).toEqual([]);
  });

  test('17장 소급 수정: ???/🧿 잔존 인스턴스가 0건이다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const targetIds = ['chapter16_mid', 'chapter16_epilogue', 'chapter17_intro', 'chapter17_mid'];
      const issues = [];
      for (const id of targetIds) {
        const d = mod.DIALOGUES[id];
        if (!d) { issues.push(`${id} not found`); continue; }
        d.lines.forEach((line, idx) => {
          if (line.speaker === '???' && line.portrait === '\u{1F9FF}') {
            issues.push(`${id}[${idx}] still has ???/🧿`);
          }
          if (line.portrait === '\u{1F9FF}') {
            issues.push(`${id}[${idx}] still has 🧿 portrait`);
          }
        });
      }
      return issues;
    });

    expect(result).toEqual([]);
  });

  test('소급 수정된 대사가 아르준으로 올바르게 변환되었다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      const targetIds = ['chapter16_mid', 'chapter16_epilogue', 'chapter17_intro', 'chapter17_mid'];
      let arjunCount = 0;
      for (const id of targetIds) {
        const d = mod.DIALOGUES[id];
        d.lines.forEach(line => {
          if (line.speaker === '아르준' && line.portraitKey === 'masala_guide') {
            arjunCount++;
          }
        });
      }
      return arjunCount;
    });

    // 스펙: chapter16_mid 5건, chapter16_epilogue 2건, chapter17_intro 4건, chapter17_mid 5건 = 16건
    expect(result).toBe(16);
  });

  test('storyData에 18장 트리거 5건이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const triggers = mod.STORY_TRIGGERS;
      const ids = ['chapter18_intro', 'chapter18_mid', 'chapter18_boss', 'chapter18_clear', 'team_side_18'];
      return ids.map(id => ({
        id,
        found: triggers.some(t => t.dialogueId === id),
      }));
    });

    for (const t of result) {
      expect(t.found, `trigger ${t.id} exists`).toBe(true);
    }
  });

  test('chapter18_epilogue는 storyData에 독립 트리거가 없다 (chain으로만 재생)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      return mod.STORY_TRIGGERS.some(t => t.dialogueId === 'chapter18_epilogue');
    });

    expect(result).toBe(false);
  });

  test('chapter18_clear 트리거: onComplete + chain 구조 검증', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const t = mod.STORY_TRIGGERS.find(tr => tr.dialogueId === 'chapter18_clear');
      return {
        exists: !!t,
        triggerPoint: t?.triggerPoint,
        once: t?.once,
        delay: t?.delay,
        hasOnComplete: typeof t?.onComplete === 'function',
        chainDialogueId: t?.chain?.dialogueId,
        chainDelay: t?.chain?.delay,
      };
    });

    expect(result.exists).toBe(true);
    expect(result.triggerPoint).toBe('result_clear');
    expect(result.once).toBe(true);
    expect(result.delay).toBe(800);
    expect(result.hasOnComplete).toBe(true);
    expect(result.chainDialogueId).toBe('chapter18_epilogue');
    expect(result.chainDelay).toBe(1200);
  });

  test('chapter18_intro 트리거: gathering_enter + stageId 18-1', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const t = mod.STORY_TRIGGERS.find(tr => tr.dialogueId === 'chapter18_intro');
      return {
        triggerPoint: t?.triggerPoint,
        once: t?.once,
        delay: t?.delay,
        conditionResult: t?.condition({ stageId: '18-1' }),
        wrongStage: t?.condition({ stageId: '17-1' }),
      };
    });

    expect(result.triggerPoint).toBe('gathering_enter');
    expect(result.once).toBe(true);
    expect(result.delay).toBe(400);
    expect(result.conditionResult).toBe(true);
    expect(result.wrongStage).toBe(false);
  });

  test('chapter18_mid 트리거: result_clear + stageId 18-3 + isFirstClear', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const t = mod.STORY_TRIGGERS.find(tr => tr.dialogueId === 'chapter18_mid');
      return {
        triggerPoint: t?.triggerPoint,
        conditionTrue: t?.condition({ isFirstClear: true, stars: 3, stageId: '18-3' }),
        notFirstClear: t?.condition({ isFirstClear: false, stars: 3, stageId: '18-3' }),
        wrongStage: t?.condition({ isFirstClear: true, stars: 3, stageId: '18-1' }),
        zeroStars: t?.condition({ isFirstClear: true, stars: 0, stageId: '18-3' }),
      };
    });

    expect(result.triggerPoint).toBe('result_clear');
    expect(result.conditionTrue).toBe(true);
    expect(result.notFirstClear).toBe(false);
    expect(result.wrongStage).toBe(false);
    expect(result.zeroStars).toBe(false);
  });

  test('chapter18_boss 트리거: gathering_enter + stageId 18-6 (isFirstClear 불필요)', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const t = mod.STORY_TRIGGERS.find(tr => tr.dialogueId === 'chapter18_boss');
      return {
        triggerPoint: t?.triggerPoint,
        delay: t?.delay,
        conditionTrue: t?.condition({ stageId: '18-6' }),
        wrongStage: t?.condition({ stageId: '18-5' }),
      };
    });

    expect(result.triggerPoint).toBe('gathering_enter');
    expect(result.delay).toBe(400);
    expect(result.conditionTrue).toBe(true);
    expect(result.wrongStage).toBe(false);
  });

  test('team_side_18 트리거: merchant_enter + currentChapter >= 18', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const t = mod.STORY_TRIGGERS.find(tr => tr.dialogueId === 'team_side_18');
      return {
        triggerPoint: t?.triggerPoint,
        once: t?.once,
        conditionTrue: t?.condition({}, { storyProgress: { currentChapter: 18 }, seenDialogues: [] }),
        chapterLow: t?.condition({}, { storyProgress: { currentChapter: 17 }, seenDialogues: [] }),
        alreadySeen: t?.condition({}, { storyProgress: { currentChapter: 18 }, seenDialogues: ['team_side_18'] }),
      };
    });

    expect(result.triggerPoint).toBe('merchant_enter');
    expect(result.once).toBe(true);
    expect(result.conditionTrue).toBe(true);
    expect(result.chapterLow).toBe(false);
    expect(result.alreadySeen).toBe(false);
  });

  test('stage_first_clear 제외 목록에 18-1, 18-3, 18-6 포함', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      // stage_first_clear 일반 조건 (두 번째 -- 첫 번째는 1-6 전용)
      const sfcTriggers = mod.STORY_TRIGGERS.filter(
        t => t.dialogueId === 'stage_first_clear' && t.once === false
      );
      // 일반 제외 목록 트리거는 두 번째 (조건에 여러 stageId !== 포함)
      const sfcTrigger = sfcTriggers.length > 1 ? sfcTriggers[1] : sfcTriggers[0];
      if (!sfcTrigger) return { found: false };
      return {
        found: true,
        excludes18_1: !sfcTrigger.condition({ isFirstClear: true, stars: 3, stageId: '18-1' }),
        excludes18_3: !sfcTrigger.condition({ isFirstClear: true, stars: 3, stageId: '18-3' }),
        excludes18_6: !sfcTrigger.condition({ isFirstClear: true, stars: 3, stageId: '18-6' }),
        // 확인: 다른 스테이지는 통과해야 함
        allows1_1: sfcTrigger.condition({ isFirstClear: true, stars: 3, stageId: '1-1' }),
      };
    });

    expect(result.found).toBe(true);
    expect(result.excludes18_1, '18-1 excluded').toBe(true);
    expect(result.excludes18_3, '18-3 excluded').toBe(true);
    expect(result.excludes18_6, '18-6 excluded').toBe(true);
    expect(result.allows1_1, '1-1 still allowed').toBe(true);
  });

  test('fileoverview에 누적 82종이 명시되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const resp = await fetch('/js/data/dialogueData.js');
      const text = await resp.text();
      return text.includes('누적 82종');
    });

    expect(result).toBe(true);
  });

  test('chapter18_clear onComplete가 currentChapter < 19 조건으로 19를 설정한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/storyData.js');
      const t = mod.STORY_TRIGGERS.find(tr => tr.dialogueId === 'chapter18_clear');
      // onComplete 소스 코드에서 currentChapter < 19 패턴 확인
      const src = t.onComplete.toString();
      return {
        hasChapter19Check: src.includes('currentChapter < 19'),
        hasChapter19Set: src.includes('currentChapter = 19'),
        hasChapter18Flag: src.includes('chapter18_cleared'),
      };
    });

    expect(result.hasChapter19Check).toBe(true);
    expect(result.hasChapter19Set).toBe(true);
    expect(result.hasChapter18Flag).toBe(true);
  });

  test('콘솔에 JavaScript 에러가 없다', async ({ page }) => {
    await page.waitForTimeout(3000);

    const jsErrors = page._consoleErrors.filter(
      e => e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
    );

    if (jsErrors.length > 0) {
      console.log('JS errors:', jsErrors);
    }

    expect(jsErrors).toEqual([]);
  });

  test('전체 DIALOGUES 키 수가 82종이다', async ({ page }) => {
    const count = await page.evaluate(async () => {
      const mod = await import('/js/data/dialogueData.js');
      return Object.keys(mod.DIALOGUES).length;
    });

    expect(count).toBe(82);
  });
});
