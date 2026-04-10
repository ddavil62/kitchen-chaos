/**
 * @fileoverview Phase 15 스토리 콘텐츠 QA 테스트.
 * 대화 스크립트 13개 + 트리거 13개의 데이터 무결성 및 런타임 검증.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 15 스토리 콘텐츠 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    // Phaser 게임 로드 대기
    await page.waitForTimeout(3000);
  });

  test.describe('데이터 무결성 (런타임)', () => {
    test('dialogueData에 신규 13개 스크립트가 존재한다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const ids = Object.keys(m.DIALOGUES);
            const requiredIds = [
              'chapter2_clear', 'chapter3_clear', 'chapter4_intro',
              'chapter4_mage_joins', 'chapter4_clear', 'chapter5_intro',
              'rin_side_5', 'chapter5_clear', 'chapter6_intro',
              'team_side_6', 'chapter6_final_battle', 'chapter6_ending',
              'poco_side_4'
            ];
            const missing = requiredIds.filter(id => !ids.includes(id));
            resolve({ total: ids.length, missing, allIds: ids });
          });
        });
      });
      expect(result.missing).toEqual([]);
      expect(result.total).toBe(26); // 13 existing + 13 new
    });

    test('각 스크립트의 라인 수가 5~12 범위이다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const newIds = [
              'chapter2_clear', 'chapter3_clear', 'chapter4_intro',
              'chapter4_mage_joins', 'chapter4_clear', 'chapter5_intro',
              'rin_side_5', 'chapter5_clear', 'chapter6_intro',
              'team_side_6', 'chapter6_final_battle', 'chapter6_ending',
              'poco_side_4'
            ];
            const results = [];
            for (const id of newIds) {
              const script = m.DIALOGUES[id];
              results.push({
                id,
                lineCount: script ? script.lines.length : 0,
                valid: script && script.lines.length >= 5 && script.lines.length <= 12
              });
            }
            resolve(results);
          });
        });
      });
      for (const r of result) {
        expect(r.valid, `${r.id}: ${r.lineCount} lines`).toBe(true);
      }
    });

    test('narrator 라인에 portraitKey가 없다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const issues = [];
            for (const [id, script] of Object.entries(m.DIALOGUES)) {
              for (let i = 0; i < script.lines.length; i++) {
                const line = script.lines[i];
                if ((line.speaker === 'narrator' || line.speaker === '') && line.portraitKey) {
                  issues.push(`${id}[${i}]: narrator has portraitKey=${line.portraitKey}`);
                }
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('이모지 유니코드가 캐릭터별로 올바르다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const emojiMap = { mimi: '\u{1F467}', poco: '\u{1F431}', rin: '\u{1F525}', mage: '\u{1F9C1}' };
            const issues = [];
            const newIds = [
              'chapter2_clear', 'chapter3_clear', 'chapter4_intro',
              'chapter4_mage_joins', 'chapter4_clear', 'chapter5_intro',
              'rin_side_5', 'chapter5_clear', 'chapter6_intro',
              'team_side_6', 'chapter6_final_battle', 'chapter6_ending',
              'poco_side_4'
            ];
            for (const id of newIds) {
              const script = m.DIALOGUES[id];
              for (let i = 0; i < script.lines.length; i++) {
                const line = script.lines[i];
                if (line.portraitKey && emojiMap[line.portraitKey]) {
                  if (line.portrait !== emojiMap[line.portraitKey]) {
                    issues.push(`${id}[${i}]: expected ${emojiMap[line.portraitKey]} got ${line.portrait}`);
                  }
                }
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('storyData에 신규 트리거 13개가 존재한다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const triggers = m.STORY_TRIGGERS;
            const requiredDialogueIds = [
              'chapter2_clear', 'chapter3_clear', 'chapter4_intro',
              'chapter4_mage_joins', 'chapter4_clear', 'chapter5_intro',
              'rin_side_5', 'chapter5_clear', 'chapter6_intro',
              'team_side_6', 'chapter6_final_battle', 'chapter6_ending',
              'poco_side_4'
            ];
            const found = requiredDialogueIds.filter(id =>
              triggers.some(t => t.dialogueId === id)
            );
            const missing = requiredDialogueIds.filter(id =>
              !triggers.some(t => t.dialogueId === id)
            );
            resolve({ total: triggers.length, found: found.length, missing });
          });
        });
      });
      expect(result.missing).toEqual([]);
      expect(result.found).toBe(13);
      expect(result.total).toBe(25); // 12 existing + 13 new
    });

    test('신규 트리거 모두 once: true이다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const newIds = [
              'chapter2_clear', 'chapter3_clear', 'chapter4_intro',
              'chapter4_mage_joins', 'chapter4_clear', 'chapter5_intro',
              'rin_side_5', 'chapter5_clear', 'chapter6_intro',
              'team_side_6', 'chapter6_final_battle', 'chapter6_ending',
              'poco_side_4'
            ];
            const notOnce = [];
            for (const trigger of m.STORY_TRIGGERS) {
              if (newIds.includes(trigger.dialogueId) && trigger.once !== true) {
                notOnce.push(trigger.dialogueId);
              }
            }
            resolve(notOnce);
          });
        });
      });
      expect(result).toEqual([]);
    });
  });

  test.describe('트리거 조건 검증', () => {
    test('result_clear 트리거들이 올바른 stageId에 매핑된다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const expectedMappings = {
              'chapter2_clear': '2-3',
              'chapter3_clear': '3-6',
              'chapter4_mage_joins': '4-3',
              'chapter4_clear': '4-6',
              'rin_side_5': '5-3',
              'chapter5_clear': '5-6',
              'team_side_6': '6-2',
              'chapter6_ending': '6-3',
            };
            const issues = [];
            for (const [dialogueId, expectedStageId] of Object.entries(expectedMappings)) {
              const trigger = m.STORY_TRIGGERS.find(t => t.dialogueId === dialogueId);
              if (!trigger) { issues.push(`${dialogueId}: trigger not found`); continue; }
              // Test that it fires for the expected stageId
              const ctxMatch = { isFirstClear: true, stars: 3, stageId: expectedStageId };
              if (!trigger.condition(ctxMatch)) {
                issues.push(`${dialogueId}: should fire for ${expectedStageId} but doesn't`);
              }
              // Test that it doesn't fire for a different stageId
              const ctxMiss = { isFirstClear: true, stars: 3, stageId: '1-1' };
              if (trigger.condition(ctxMiss)) {
                issues.push(`${dialogueId}: should NOT fire for 1-1 but does`);
              }
              // Test that it doesn't fire when not first clear
              const ctxNotFirst = { isFirstClear: false, stars: 3, stageId: expectedStageId };
              if (trigger.condition(ctxNotFirst)) {
                issues.push(`${dialogueId}: should NOT fire when not firstClear but does`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('worldmap_enter 트리거들이 올바른 chapter 조건을 갖는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const expectedChapters = {
              'chapter4_intro': 4,
              'chapter5_intro': 5,
              'chapter6_intro': 6,
            };
            const issues = [];
            for (const [dialogueId, minChapter] of Object.entries(expectedChapters)) {
              const trigger = m.STORY_TRIGGERS.find(t => t.dialogueId === dialogueId);
              if (!trigger) { issues.push(`${dialogueId}: trigger not found`); continue; }

              const saveBelowMin = { currentChapter: minChapter - 1, seenDialogues: [], storyFlags: [] };
              const saveAtMin = { currentChapter: minChapter, seenDialogues: [], storyFlags: [] };
              const saveAboveMin = { currentChapter: minChapter + 1, seenDialogues: [], storyFlags: [] };

              if (trigger.condition({}, saveBelowMin)) {
                issues.push(`${dialogueId}: should NOT fire at chapter ${minChapter - 1}`);
              }
              if (!trigger.condition({}, saveAtMin)) {
                issues.push(`${dialogueId}: should fire at chapter ${minChapter}`);
              }
              if (!trigger.condition({}, saveAboveMin)) {
                issues.push(`${dialogueId}: should fire at chapter ${minChapter + 1}`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('chapter6_final_battle은 gathering_enter + stageId 6-3에서만 발화된다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const trigger = m.STORY_TRIGGERS.find(t => t.dialogueId === 'chapter6_final_battle');
            if (!trigger) { resolve(['trigger not found']); return; }
            const issues = [];
            if (trigger.triggerPoint !== 'gathering_enter') issues.push('wrong triggerPoint');
            if (!trigger.condition({ stageId: '6-3' })) issues.push('should fire for 6-3');
            if (trigger.condition({ stageId: '6-2' })) issues.push('should NOT fire for 6-2');
            if (trigger.condition({ stageId: '5-6' })) issues.push('should NOT fire for 5-6');
            if (trigger.condition({})) issues.push('should NOT fire without stageId');
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('poco_side_4 조건이 정확하다 (ch>=4 && poco_discount_fail 시청)', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const trigger = m.STORY_TRIGGERS.find(t => t.dialogueId === 'poco_side_4');
            if (!trigger) { resolve(['trigger not found']); return; }
            const issues = [];
            // ch3 + seen = should NOT fire
            if (trigger.condition({}, { currentChapter: 3, seenDialogues: ['poco_discount_fail'] }))
              issues.push('should NOT fire at ch3');
            // ch4 + not seen = should NOT fire
            if (trigger.condition({}, { currentChapter: 4, seenDialogues: [] }))
              issues.push('should NOT fire without poco_discount_fail seen');
            // ch4 + seen = should fire
            if (!trigger.condition({}, { currentChapter: 4, seenDialogues: ['poco_discount_fail'] }))
              issues.push('should fire at ch4 with poco_discount_fail seen');
            // ch6 + seen = should fire
            if (!trigger.condition({}, { currentChapter: 6, seenDialogues: ['poco_discount_fail'] }))
              issues.push('should fire at ch6 with poco_discount_fail seen');
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('일반 stage_first_clear 제외 목록이 올바르다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const rcTriggers = m.STORY_TRIGGERS.filter(t => t.triggerPoint === 'result_clear');
            // 마지막 stage_first_clear가 일반 트리거
            const generalSFC = rcTriggers[rcTriggers.length - 1];
            if (generalSFC.dialogueId !== 'stage_first_clear') {
              resolve(['last result_clear trigger is not stage_first_clear']);
              return;
            }
            const excludedIds = ['1-6', '2-1', '2-3', '3-3', '3-6', '4-3', '4-6', '5-3', '5-6', '6-2', '6-3'];
            const issues = [];
            for (const sid of excludedIds) {
              const ctx = { isFirstClear: true, stars: 3, stageId: sid };
              if (generalSFC.condition(ctx)) {
                issues.push(`${sid} should be excluded but is not`);
              }
            }
            // Normal stages should pass
            const normalIds = ['1-1', '2-2', '3-1', '4-1', '5-1', '6-1'];
            for (const sid of normalIds) {
              const ctx = { isFirstClear: true, stars: 3, stageId: sid };
              if (!generalSFC.condition(ctx)) {
                issues.push(`${sid} should NOT be excluded but is`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });
  });

  test.describe('기존 데이터 무변경 검증', () => {
    test('기존 13개 대화 스크립트가 보존되어 있다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const existingIds = [
              'intro_welcome', 'merchant_first_meet', 'stage_first_clear',
              'chapter1_start', 'chapter1_clear', 'chapter2_intro',
              'rin_first_meet', 'mage_introduction', 'poco_discount_fail',
              'stage_boss_warning', 'after_first_loss', 'chapter3_rin_joins',
              'mage_research_hint'
            ];
            const missing = existingIds.filter(id => !m.DIALOGUES[id]);
            resolve(missing);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('기존 트리거들이 보존되어 있다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const existingDialogueIds = [
              'intro_welcome', 'chapter2_intro', 'mage_introduction',
              'mage_research_hint', 'merchant_first_meet', 'poco_discount_fail',
              'stage_boss_warning', 'stage_first_clear', 'rin_first_meet',
              'chapter3_rin_joins', 'after_first_loss'
            ];
            const missing = existingDialogueIds.filter(id =>
              !m.STORY_TRIGGERS.some(t => t.dialogueId === id)
            );
            resolve(missing);
          });
        });
      });
      expect(result).toEqual([]);
    });
  });

  test.describe('UI 안정성', () => {
    test('콘솔 에러가 발생하지 않는다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      // Phaser 초기화 관련 오류만 필터 (파일 로딩 등)
      const criticalErrors = errors.filter(e =>
        !e.includes('net::ERR_') && !e.includes('Failed to fetch')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('모듈 import가 에러 없이 완료된다', async ({ page }) => {
      const result = await page.evaluate(async () => {
        try {
          const dData = await import('/js/data/dialogueData.js');
          const sData = await import('/js/data/storyData.js');
          return {
            dialogueCount: Object.keys(dData.DIALOGUES).length,
            triggerCount: sData.STORY_TRIGGERS.length,
            characterCount: Object.keys(dData.CHARACTERS).length,
            error: null
          };
        } catch (e) {
          return { error: e.message };
        }
      });
      expect(result.error).toBeNull();
      expect(result.dialogueCount).toBe(26);
      expect(result.triggerCount).toBe(25);
      expect(result.characterCount).toBe(5);
    });
  });

  test.describe('엣지 케이스', () => {
    test('퀴진 갓 라인에 portrait가 비어있고 portraitKey가 없다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const battle = m.DIALOGUES['chapter6_final_battle'];
            const issues = [];
            for (let i = 0; i < battle.lines.length; i++) {
              const line = battle.lines[i];
              if (line.speaker === '퀴진 갓') {
                if (line.portrait !== '') issues.push(`line ${i}: portrait is not empty`);
                if (line.portraitKey) issues.push(`line ${i}: has portraitKey ${line.portraitKey}`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('모든 dialogue ID가 DIALOGUES 키와 일치한다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/dialogueData.js').then(m => {
            const issues = [];
            for (const [key, script] of Object.entries(m.DIALOGUES)) {
              if (script.id !== key) {
                issues.push(`key=${key}, id=${script.id}`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('모든 트리거의 dialogueId가 DIALOGUES에 존재한다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          Promise.all([
            import('/js/data/dialogueData.js'),
            import('/js/data/storyData.js')
          ]).then(([dMod, sMod]) => {
            const dialogueIds = Object.keys(dMod.DIALOGUES);
            const missing = [];
            for (const trigger of sMod.STORY_TRIGGERS) {
              if (!dialogueIds.includes(trigger.dialogueId)) {
                missing.push(trigger.dialogueId);
              }
              // chain도 확인
              if (trigger.chain && !dialogueIds.includes(trigger.chain.dialogueId)) {
                missing.push(`chain: ${trigger.chain.dialogueId}`);
              }
            }
            resolve(missing);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('stars가 0이면 result_clear 트리거가 발화하지 않는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const rcTriggers = m.STORY_TRIGGERS.filter(t => t.triggerPoint === 'result_clear');
            const issues = [];
            for (const t of rcTriggers) {
              const ctx = { isFirstClear: true, stars: 0, stageId: '2-3' };
              if (t.condition(ctx)) {
                issues.push(`${t.dialogueId} fires with stars=0`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });

    test('isFirstClear가 false이면 신규 result_clear 트리거가 발화하지 않는다', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          import('/js/data/storyData.js').then(m => {
            const newIds = ['chapter2_clear', 'chapter3_clear', 'chapter4_mage_joins', 'chapter4_clear', 'rin_side_5', 'chapter5_clear', 'team_side_6', 'chapter6_ending'];
            const stageMap = { 'chapter2_clear': '2-3', 'chapter3_clear': '3-6', 'chapter4_mage_joins': '4-3', 'chapter4_clear': '4-6', 'rin_side_5': '5-3', 'chapter5_clear': '5-6', 'team_side_6': '6-2', 'chapter6_ending': '6-3' };
            const issues = [];
            for (const id of newIds) {
              const trigger = m.STORY_TRIGGERS.find(t => t.dialogueId === id);
              const ctx = { isFirstClear: false, stars: 3, stageId: stageMap[id] };
              if (trigger.condition(ctx)) {
                issues.push(`${id} fires with isFirstClear=false`);
              }
            }
            resolve(issues);
          });
        });
      });
      expect(result).toEqual([]);
    });
  });

  test.describe('시각적 검증', () => {
    test('게임이 정상 로드되고 메뉴 화면이 표시된다', async ({ page }) => {
      await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'tests/screenshots/p15-menu-loaded.png' });
    });
  });
});
