/**
 * @fileoverview Kitchen Chaos 개그 확장 (Phase 66-1~4) 통합 QA 테스트.
 * team_side 10개 신규, intro 14개 보강, service_event 3개 보강,
 * gathering_enter 3개 신규, 캐릭터 성격 개그 7+1개 확인.
 */
import { test, expect } from '@playwright/test';

test.describe('개그 확장 Phase 66 통합 QA', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  // ── Phase 66-1: team_side 신규 10개 존재 확인 ──

  test('[66-1] team_side_1~5, 7, 9, 11~13 대화가 DIALOGUES에 존재한다', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const ids = ['team_side_1','team_side_2','team_side_3','team_side_4','team_side_5',
          'team_side_7','team_side_9','team_side_11','team_side_12','team_side_13'];
        const missing = ids.filter(id => !d[id]);
        const details = ids.map(id => ({
          id,
          exists: !!d[id],
          skippable: d[id]?.skippable,
          lineCount: d[id]?.lines?.length || 0,
        }));
        return { missing, details };
      });
    });
    expect(result.missing).toEqual([]);
    // 각 대화는 3~11줄 (미디엄 강도)
    for (const detail of result.details) {
      expect(detail.skippable).toBe(true);
      expect(detail.lineCount).toBeGreaterThanOrEqual(3);
      expect(detail.lineCount).toBeLessThanOrEqual(12);
    }
  });

  test('[66-1] storyData에 신규 team_side merchant_enter 트리거 10개 등록', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/storyData.js').then(mod => {
        const triggers = mod.STORY_TRIGGERS;
        const ids = ['team_side_1','team_side_2','team_side_3','team_side_4','team_side_5',
          'team_side_7','team_side_9','team_side_11','team_side_12','team_side_13'];
        const found = ids.map(id => {
          const t = triggers.find(tr => tr.dialogueId === id);
          return {
            id,
            exists: !!t,
            triggerPoint: t?.triggerPoint,
            once: t?.once,
          };
        });
        const missing = found.filter(f => !f.exists);
        return { found, missing };
      });
    });
    expect(result.missing).toEqual([]);
    for (const f of result.found) {
      expect(f.triggerPoint).toBe('merchant_enter');
      expect(f.once).toBe(true);
    }
  });

  // ── Phase 66-2: intro 보강 확인 ──

  test('[66-2] 14개 chapter_intro에 개그 라인이 추가됨 (원래 라인보다 길어졌는지)', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const targets = ['chapter2_intro','chapter4_intro','chapter7_intro','chapter9_intro',
          'chapter10_intro','chapter11_intro','chapter13_intro','chapter14_intro',
          'chapter16_intro','chapter17_intro','chapter19_intro','chapter20_intro',
          'chapter22_intro','chapter23_intro'];
        return targets.map(id => ({
          id,
          exists: !!d[id],
          lineCount: d[id]?.lines?.length || 0,
        }));
      });
    });
    for (const item of result) {
      expect(item.exists).toBe(true);
      // 기본 intro는 최소 3줄, 추가로 1~5줄 = 4줄 이상이어야
      expect(item.lineCount).toBeGreaterThanOrEqual(4);
    }
  });

  test('[66-2] 금지 구간 7개(ch5/6/12/15/18/21/24)는 미변경', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        // 금지 구간의 기존 알려진 라인 수
        const expected = {
          chapter5_intro: 7,
          chapter6_intro: 7,
          chapter12_intro: 4,
          chapter15_boss: 14,
          chapter18_intro: 12,
          chapter21_intro: 3,
          chapter24_boss: 10,
        };
        const issues = [];
        for (const [id, expectedCount] of Object.entries(expected)) {
          const actual = d[id]?.lines?.length || 0;
          if (actual !== expectedCount) {
            issues.push({ id, expected: expectedCount, actual });
          }
        }
        return issues;
      });
    });
    expect(result).toEqual([]);
  });

  // ── Phase 66-2: 아르준 은닉 확인 ──

  test('[66-2] ch16/ch17 intro에서 아르준 speaker 노출 없음 (??? 사용)', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const leaks = [];
        ['chapter16_intro','chapter17_intro','chapter16_mid','chapter17_mid',
         'team_side_16','team_side_17','chapter16_epilogue'].forEach(id => {
          const dlg = d[id];
          if (!dlg) return;
          dlg.lines.forEach((line, i) => {
            if (line.portraitKey === 'arjun' && line.speaker !== '???' && line.speaker !== '아르준') {
              leaks.push({ id, lineIndex: i, speaker: line.speaker });
            }
            // 16~17장에서 아르준이 실명 노출되면 안됨
            if (line.portraitKey === 'arjun' && line.speaker === '아르준') {
              leaks.push({ id, lineIndex: i, speaker: line.speaker, issue: 'arjun name exposed in hidden zone' });
            }
          });
        });
        return leaks;
      });
    });
    expect(result).toEqual([]);
  });

  // ── Phase 66-3: service_event 보강 + gathering_enter 신규 ──

  test('[66-3] service_event 3종에 개그 라인 추가됨', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        return {
          happy_hour: d.event_happy_hour_dialogue?.lines?.length || 0,
          food_review: d.event_food_review_dialogue?.lines?.length || 0,
          kitchen_accident: d.event_kitchen_accident_dialogue?.lines?.length || 0,
        };
      });
    });
    // 원래: happy_hour 5줄, food_review 4줄, kitchen_accident 4줄
    // 추가 후: +2, +2, +3
    expect(result.happy_hour).toBe(7);
    expect(result.food_review).toBe(6);
    expect(result.kitchen_accident).toBe(7);
  });

  test('[66-3] gag_midstage_7, 10, 13 대화가 존재한다', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const ids = ['gag_midstage_7','gag_midstage_10','gag_midstage_13'];
        return ids.map(id => ({
          id,
          exists: !!d[id],
          skippable: d[id]?.skippable,
          lineCount: d[id]?.lines?.length || 0,
        }));
      });
    });
    for (const item of result) {
      expect(item.exists).toBe(true);
      expect(item.skippable).toBe(true);
      expect(item.lineCount).toBeGreaterThanOrEqual(3);
      expect(item.lineCount).toBeLessThanOrEqual(8);
    }
  });

  test('[66-3] gathering_enter 트리거 3개 storyData 등록 확인', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/storyData.js').then(mod => {
        const triggers = mod.STORY_TRIGGERS;
        const ids = ['gag_midstage_7','gag_midstage_10','gag_midstage_13'];
        return ids.map(id => {
          const t = triggers.find(tr => tr.dialogueId === id);
          return {
            id,
            exists: !!t,
            triggerPoint: t?.triggerPoint,
            once: t?.once,
            hasDelay: typeof t?.delay === 'number',
          };
        });
      });
    });
    for (const item of result) {
      expect(item.exists).toBe(true);
      expect(item.triggerPoint).toBe('gathering_enter');
      expect(item.once).toBe(true);
      expect(item.hasDelay).toBe(true);
    }
  });

  // ── Phase 66-4: 캐릭터 성격 개그 집중 확장 ──

  test('[66-4] team_side_16에 메이지 논문 폭주 + ???(아르준) 향신료 분류 대사 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.team_side_16;
        if (!d) return { error: 'not found' };
        const mageLines = d.lines.filter(l => l.portraitKey === 'mage');
        const arjunLines = d.lines.filter(l => l.portraitKey === 'arjun');
        const hasThesis = mageLines.some(l => l.text.includes('논문'));
        const hasSpiceMap = arjunLines.some(l => l.text.includes('커민') || l.text.includes('코리앤더'));
        const arjunSpeakers = arjunLines.map(l => l.speaker);
        const allHidden = arjunSpeakers.every(s => s === '???');
        return { hasThesis, hasSpiceMap, allHidden, arjunSpeakers };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.hasThesis).toBe(true);
    expect(result.hasSpiceMap).toBe(true);
    expect(result.allHidden).toBe(true);
  });

  test('[66-4] chapter17_mid에 ???(아르준) 향신료 금고 흥분 대사 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.chapter17_mid;
        if (!d) return { error: 'not found' };
        const hasSaffron = d.lines.some(l => l.text.includes('사프란'));
        const has32 = d.lines.some(l => l.text.includes('32종'));
        const arjunLines = d.lines.filter(l => l.portraitKey === 'arjun');
        const allHidden = arjunLines.every(l => l.speaker === '???');
        return { hasSaffron, has32, allHidden };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.hasSaffron).toBe(true);
    expect(result.has32).toBe(true);
    expect(result.allHidden).toBe(true);
  });

  test('[66-4] chapter22_mid에 메이지 드림랜드 분석 폭주 대사 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.chapter22_mid;
        if (!d) return { error: 'not found' };
        const hasThesis = d.lines.some(l => l.portraitKey === 'mage' && l.text.includes('논문'));
        const hasSample = d.lines.some(l => l.portraitKey === 'mage' && l.text.includes('샘플'));
        return { hasThesis, hasSample };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.hasThesis).toBe(true);
    expect(result.hasSample).toBe(true);
  });

  test('[66-4] chapter10_lao_joins에 B옵션 적용 (메타 개그 제거, 라오 실수담)', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.chapter10_lao_joins;
        if (!d) return { error: 'not found' };
        const allText = d.lines.map(l => l.text).join(' ');
        const hasMetaGag = allText.includes('8-3') || allText.includes('리넘버링');
        const hasLaoMishap = allText.includes('근육 자랑') || allText.includes('웍 하나로 온 주방을 들어올렸다');
        return { hasMetaGag, hasLaoMishap };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.hasMetaGag).toBe(false);
    expect(result.hasLaoMishap).toBe(true);
  });

  test('[66-4] team_side_23에 유키 건조한 크림 시식 반응 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.team_side_23;
        if (!d) return { error: 'not found' };
        const yukiCream = d.lines.some(l => l.portraitKey === 'yuki' && l.text.includes('시식회'));
        return { yukiCream };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.yukiCream).toBe(true);
  });

  test('[66-4] chapter14_mid에 앙드레 와인 철학 비유 추가됨', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.chapter14_mid;
        if (!d) return { error: 'not found' };
        const hasOakBarrel = d.lines.some(l => l.text.includes('오크통'));
        const hasWineDay = d.lines.some(l => l.text.includes('와인 얘기를 안 하는 날'));
        return { hasOakBarrel, hasWineDay };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.hasOakBarrel).toBe(true);
    expect(result.hasWineDay).toBe(true);
  });

  // ── 기존 대사 보존 확인 (Phase 65 시나리오 수정 보존) ──

  test('Phase 65 수정 보존: 라오 chapter10_intro "(크게 웃으며)" 유지', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES.chapter10_intro;
        if (!d) return { error: 'not found' };
        const laoFirst = d.lines.find(l => l.portraitKey === 'lao');
        return { text: laoFirst?.text, hasExpected: laoFirst?.text?.includes('크게 웃으며') };
      });
    });
    expect(result.error).toBeUndefined();
    expect(result.hasExpected).toBe(true);
  });

  test('기존 대사 삭제 없음: DIALOGUES 키 총 119개', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        return Object.keys(mod.DIALOGUES).length;
      });
    });
    expect(result).toBe(119);
  });

  // ── 톤/강도 검증 ──

  test('미디엄 강도: 신규 team_side에 B급 과장 코미디 패턴 없음', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const ids = ['team_side_1','team_side_2','team_side_3','team_side_4','team_side_5',
          'team_side_7','team_side_9','team_side_11','team_side_12','team_side_13'];
        const issues = [];
        const badPatterns = [/ㅋㅋ/, /ㅎㅎ/, /wwww/, /lol/i, /OMG/i, /세상에!{3,}/, /미친/];
        ids.forEach(id => {
          const dlg = d[id];
          if (!dlg) return;
          dlg.lines.forEach((line, i) => {
            badPatterns.forEach(pat => {
              if (pat.test(line.text)) {
                issues.push({ id, lineIndex: i, text: line.text, pattern: pat.toString() });
              }
            });
          });
        });
        return issues;
      });
    });
    expect(result).toEqual([]);
  });

  // ── 콘솔 에러 확인 ──

  test('페이지 로드 시 JavaScript 예외가 발생하지 않는다', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
  });

  // ── 데이터 무결성: 모든 대화의 lines에 빈 배열이 없음 ──

  test('데이터 무결성: 모든 DIALOGUES의 lines 배열이 비어있지 않음', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const emptyDialogues = [];
        Object.entries(d).forEach(([key, dlg]) => {
          if (!dlg.lines || dlg.lines.length === 0) {
            emptyDialogues.push(key);
          }
        });
        return emptyDialogues;
      });
    });
    expect(result).toEqual([]);
  });

  // ── 데이터 무결성: 모든 lines에 speaker/text 필수 필드 존재 ──

  test('데이터 무결성: 모든 lines에 speaker와 text 필드가 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/dialogueData.js').then(mod => {
        const d = mod.DIALOGUES;
        const issues = [];
        Object.entries(d).forEach(([key, dlg]) => {
          dlg.lines.forEach((line, i) => {
            if (!line.speaker && line.speaker !== '') {
              issues.push({ key, lineIndex: i, issue: 'missing speaker' });
            }
            if (!line.text) {
              issues.push({ key, lineIndex: i, issue: 'missing text' });
            }
          });
        });
        return issues;
      });
    });
    expect(result).toEqual([]);
  });

  // ── 트리거 충돌 검사 ──

  test('gathering_enter 트리거 충돌 없음: gag_midstage와 기존 트리거가 같은 stageId를 사용하지 않음', async ({ page }) => {
    const result = await page.evaluate(() => {
      return import('/js/data/storyData.js').then(mod => {
        const triggers = mod.STORY_TRIGGERS;
        const gatheringTriggers = triggers.filter(t => t.triggerPoint === 'gathering_enter');
        // 같은 stageId 조건에 걸리는 트리거 쌍 찾기
        const conflicts = [];
        for (let i = 0; i < gatheringTriggers.length; i++) {
          for (let j = i + 1; j < gatheringTriggers.length; j++) {
            const a = gatheringTriggers[i];
            const b = gatheringTriggers[j];
            // condition 함수 문자열 비교로 stageId 추출
            const aStr = a.condition?.toString() || '';
            const bStr = b.condition?.toString() || '';
            const aMatch = aStr.match(/stageId\s*===?\s*["']([^"']+)/);
            const bMatch = bStr.match(/stageId\s*===?\s*["']([^"']+)/);
            if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
              conflicts.push({ a: a.dialogueId, b: b.dialogueId, stageId: aMatch[1] });
            }
          }
        }
        return conflicts;
      });
    });
    expect(result).toEqual([]);
  });
});
