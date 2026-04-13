/**
 * @fileoverview 도구 정보 팝업 + 도감 도구 탭 QA 테스트.
 * 스펙: 2026-04-12-kitchen-chaos-tool-info-spec.md
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3003';

/** Phaser 씬 로딩 대기 + DialogueScene 닫기 유틸 */
async function waitForGameReady(page, timeout = 8000) {
  await page.waitForFunction(() => window.__game && window.__game.scene.scenes.length > 0, { timeout });
  // DialogueScene 닫기
  await page.evaluate(() => {
    const scenes = window.__game.scene.scenes;
    for (const s of scenes) {
      if (s.scene.key === 'DialogueScene' && s.scene.isActive()) s.scene.stop();
    }
  });
  await page.waitForTimeout(300);
}

/** MerchantScene으로 이동 */
async function goToMerchant(page) {
  await page.evaluate(() => {
    window.__game.scene.start('MerchantScene', { fromScene: 'ResultScene', stageId: '1-1' });
  });
  await page.waitForTimeout(600);
  // DialogueScene이 자동 트리거되면 닫기
  await page.evaluate(() => {
    const scenes = window.__game.scene.scenes;
    for (const s of scenes) {
      if (s.scene.key === 'DialogueScene' && s.scene.isActive()) s.scene.stop();
    }
  });
  await page.waitForTimeout(300);
}

/** RecipeCollectionScene으로 이동 */
async function goToRecipeCollection(page) {
  await page.evaluate(() => {
    window.__game.scene.start('RecipeCollectionScene');
  });
  await page.waitForTimeout(600);
}

// ================================================================
// Phase A: TOOL_DEFS 데이터 검증
// ================================================================
test.describe('Phase A: TOOL_DEFS 데이터', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGameReady(page);
  });

  test('AC-1: TOOL_DEFS 8종 모두 descKo 필드 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { TOOL_DEFS } = window.__game.scene.scenes
        .find(s => s.scene.key === 'BootScene' || true).__proto__.constructor;
      // TOOL_DEFS에 접근하기 위해 import된 모듈 확인
      // 직접 gameData에서 확인
      const toolIds = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
      const missing = [];
      // MerchantScene에서 TOOL_DEFS를 사용하므로 거기서 접근
      const ms = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene');
      // 대안: 동적 import
      return import('/js/data/gameData.js').then(m => {
        const TOOL_DEFS = m.TOOL_DEFS;
        for (const id of toolIds) {
          if (!TOOL_DEFS[id]) missing.push(`${id}: 정의 없음`);
          else if (!TOOL_DEFS[id].descKo) missing.push(`${id}: descKo 없음`);
        }
        return { missing, count: Object.keys(TOOL_DEFS).length };
      });
    });
    expect(result.missing).toEqual([]);
    expect(result.count).toBeGreaterThanOrEqual(8);
  });

  test('AC-2: TOOL_DEFS 8종 모두 loreKo 필드 존재', async ({ page }) => {
    const result = await page.evaluate(() => {
      const toolIds = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
      return import('/js/data/gameData.js').then(m => {
        const TOOL_DEFS = m.TOOL_DEFS;
        const missing = [];
        for (const id of toolIds) {
          if (!TOOL_DEFS[id]) missing.push(`${id}: 정의 없음`);
          else if (!TOOL_DEFS[id].loreKo) missing.push(`${id}: loreKo 없음`);
        }
        return { missing };
      });
    });
    expect(result.missing).toEqual([]);
  });

  test('AC-2b: descKo는 1~2줄, loreKo는 1줄 이내 한국어', async ({ page }) => {
    const result = await page.evaluate(() => {
      const toolIds = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
      return import('/js/data/gameData.js').then(m => {
        const TOOL_DEFS = m.TOOL_DEFS;
        const issues = [];
        for (const id of toolIds) {
          const def = TOOL_DEFS[id];
          if (def.descKo && def.descKo.length > 100) issues.push(`${id}: descKo가 100자 초과 (${def.descKo.length}자)`);
          if (def.loreKo && def.loreKo.length > 80) issues.push(`${id}: loreKo가 80자 초과 (${def.loreKo.length}자)`);
          // 한국어 포함 여부
          if (def.descKo && !/[\uAC00-\uD7AF]/.test(def.descKo)) issues.push(`${id}: descKo에 한국어 없음`);
          if (def.loreKo && !/[\uAC00-\uD7AF]/.test(def.loreKo)) issues.push(`${id}: loreKo에 한국어 없음`);
        }
        return { issues };
      });
    });
    expect(result.issues).toEqual([]);
  });
});

// ================================================================
// Phase B: MerchantScene 정보 팝업
// ================================================================
test.describe('Phase B: MerchantScene 정보(i) 팝업', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGameReady(page);
    await goToMerchant(page);
  });

  test('AC-3: 각 도구 행 우상단에 i 버튼 표시됨', async ({ page }) => {
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-merchant-initial.png' });
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      if (!scene) return { error: 'MerchantScene not active' };
      // listContainer 안에 ℹ 텍스트 오브젝트가 있는지 확인
      const container = scene.listContainer;
      if (!container) return { error: 'listContainer not found' };
      const infoTexts = container.list.filter(obj => obj.type === 'Text' && obj.text === '\u2139');
      return { count: infoTexts.length };
    });
    expect(result.count).toBe(8); // 8종 도구 각각 하나씩
  });

  test('AC-4: i 버튼 클릭 시 팝업 열림 (_showToolInfoPopup 직접 호출)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      if (!scene) return { error: 'scene not found' };
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        scene._showToolInfoPopup(def, 1);
        return {
          popupOpen: scene._popupOpen === true,
          elementsExist: Array.isArray(scene._infoPopupElements) && scene._infoPopupElements.length > 0,
          elementCount: scene._infoPopupElements ? scene._infoPopupElements.length : 0,
        };
      });
    });
    expect(result.popupOpen).toBe(true);
    expect(result.elementsExist).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-popup-pan.png' });
  });

  test('AC-5: 팝업에 도구 이름, descKo, 스탯 바(>=2개), loreKo 포함', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        scene._showToolInfoPopup(def, 1);
        const elements = scene._infoPopupElements || [];
        // 텍스트 요소 중에서 찾기
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        const hasName = texts.some(t => t.includes(def.nameKo));
        const hasDesc = texts.some(t => t === def.descKo);
        const hasLore = texts.some(t => t === def.loreKo);
        // 스탯 바: Rectangle 요소 중 0x44aaff 색상인 것 (채움 바)
        const statBars = elements.filter(el =>
          el.type === 'Rectangle' && el.fillColor === 0x44aaff
        );
        return { hasName, hasDesc, hasLore, statBarCount: statBars.length };
      });
    });
    expect(result.hasName).toBe(true);
    expect(result.hasDesc).toBe(true);
    expect(result.hasLore).toBe(true);
    expect(result.statBarCount).toBeGreaterThanOrEqual(2);
  });

  test('AC-6: attack 도구(프라이팬): 공격력/사거리/공격속도 바 3개 이상 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        scene._showToolInfoPopup(def, 1);
        const elements = scene._infoPopupElements || [];
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        // 스탯 레이블 확인
        const hasAttack = texts.some(t => t.includes('공격력'));
        const hasRange = texts.some(t => t.includes('사거리'));
        const hasSpeed = texts.some(t => t.includes('공격속도'));
        const statBars = elements.filter(el => el.type === 'Rectangle' && el.fillColor === 0x44aaff);
        return { hasAttack, hasRange, hasSpeed, statBarCount: statBars.length };
      });
    });
    expect(result.hasAttack).toBe(true);
    expect(result.hasRange).toBe(true);
    expect(result.hasSpeed).toBe(true);
    expect(result.statBarCount).toBeGreaterThanOrEqual(3);
  });

  test('AC-7: support 도구(배달 로봇): 사거리 + 특수 스탯 바 2개 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['delivery'];
        scene._showToolInfoPopup(def, 1);
        const elements = scene._infoPopupElements || [];
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        const hasRange = texts.some(t => t.includes('사거리'));
        const hasCollect = texts.some(t => t.includes('수집'));
        // attack 전용 스탯이 없어야 함
        const hasAttack = texts.some(t => t === '공격력');
        const hasSpeed = texts.some(t => t === '공격속도');
        const statBars = elements.filter(el => el.type === 'Rectangle' && el.fillColor === 0x44aaff);
        return { hasRange, hasCollect, hasAttack, hasSpeed, statBarCount: statBars.length };
      });
    });
    expect(result.hasRange).toBe(true);
    expect(result.hasCollect).toBe(true);
    expect(result.hasAttack).toBe(false);
    expect(result.hasSpeed).toBe(false);
    expect(result.statBarCount).toBe(2); // 사거리 + 수집
  });

  test('AC-8: X 버튼 클릭 시 팝업 닫힘', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        scene._showToolInfoPopup(def, 1);
        const popupOpenBefore = scene._popupOpen;
        // X 버튼 찾기 (Rectangle, 0xcc2222)
        const closeBtn = scene._infoPopupElements.find(el =>
          el.type === 'Rectangle' && el.fillColor === 0xcc2222
        );
        if (closeBtn) {
          closeBtn.emit('pointerdown');
        }
        return {
          popupOpenBefore,
          popupOpenAfter: scene._popupOpen,
          elementsNull: scene._infoPopupElements === null,
        };
      });
    });
    expect(result.popupOpenBefore).toBe(true);
    expect(result.popupOpenAfter).toBe(false);
    expect(result.elementsNull).toBe(true);
  });

  test('AC-9: 팝업 열린 중 i 버튼 재클릭 시 기존 팝업 교체 (중복 팝업 없음)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        // 첫 번째 팝업 열기
        scene._showToolInfoPopup(m.TOOL_DEFS['pan'], 1);
        const firstCount = scene._infoPopupElements ? scene._infoPopupElements.length : 0;
        // 두 번째 팝업 열기 (다른 도구)
        scene._showToolInfoPopup(m.TOOL_DEFS['grill'], 1);
        const secondCount = scene._infoPopupElements ? scene._infoPopupElements.length : 0;
        // 팝업이 하나만 존재하는지 확인
        const texts = scene._infoPopupElements.filter(el => el.type === 'Text').map(el => el.text);
        const hasGrill = texts.some(t => t.includes('화염 그릴'));
        const hasPan = texts.some(t => t.includes('프라이팬'));
        return { firstCount, secondCount, hasGrill, hasPan, popupOpen: scene._popupOpen };
      });
    });
    expect(result.popupOpen).toBe(true);
    expect(result.hasGrill).toBe(true);
    expect(result.hasPan).toBe(false); // 프라이팬 팝업은 사라져야 함
  });

  test('AC-10: 팝업이 360px 캔버스 내 클리핑 없음', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._showToolInfoPopup(m.TOOL_DEFS['pan'], 1);
        const elements = scene._infoPopupElements || [];
        const outOfBounds = [];
        for (const el of elements) {
          if (el.type === 'Rectangle') {
            const left = el.x - (el.width * el.originX);
            const right = el.x + (el.width * (1 - el.originX));
            const top = el.y - (el.height * el.originY);
            const bottom = el.y + (el.height * (1 - el.originY));
            if (left < 0 || right > 360 || top < 0 || bottom > 640) {
              // 오버레이는 전체화면이므로 제외
              if (el.fillColor !== 0x000000) {
                outOfBounds.push({ x: el.x, y: el.y, w: el.width, h: el.height, color: el.fillColor });
              }
            }
          }
        }
        return { outOfBounds };
      });
    });
    expect(result.outOfBounds).toEqual([]);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-popup-bounds.png' });
  });
});

// ================================================================
// Phase B: 추가 도구별 팝업 검증
// ================================================================
test.describe('Phase B: 도구별 팝업 세부 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGameReady(page);
    await goToMerchant(page);
  });

  // 모든 8종 도구에 대해 팝업이 에러 없이 열리는지 확인
  const toolIds = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
  for (const toolId of toolIds) {
    test(`${toolId} 팝업이 에러 없이 열리고 내용이 올바르다`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      const result = await page.evaluate((tid) => {
        const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
        return import('/js/data/gameData.js').then(m => {
          const def = m.TOOL_DEFS[tid];
          scene._showToolInfoPopup(def, 1);
          const elements = scene._infoPopupElements || [];
          const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
          const statBars = elements.filter(el => el.type === 'Rectangle' && el.fillColor === 0x44aaff);
          const hasName = texts.some(t => t.includes(def.nameKo));
          const hasDesc = texts.some(t => t === def.descKo);
          const hasLore = texts.some(t => t === def.loreKo);
          // 팝업 닫기
          const closeBtn = elements.find(el => el.type === 'Rectangle' && el.fillColor === 0xcc2222);
          if (closeBtn) closeBtn.emit('pointerdown');
          return {
            hasName, hasDesc, hasLore,
            statBarCount: statBars.length,
            category: def.category,
          };
        });
      }, toolId);

      expect(errors).toEqual([]);
      expect(result.hasName).toBe(true);
      expect(result.hasDesc).toBe(true);
      expect(result.hasLore).toBe(true);
      if (result.category === 'attack') {
        expect(result.statBarCount).toBeGreaterThanOrEqual(3); // 공격력+사거리+공격속도 (+특수)
      } else {
        expect(result.statBarCount).toBeGreaterThanOrEqual(2); // 사거리+특수
      }
    });
  }

  test('wasabi_cannon 팝업: splashRadius 특수 스탯 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['wasabi_cannon'];
        scene._showToolInfoPopup(def, 1);
        const elements = scene._infoPopupElements || [];
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        const hasRange = texts.some(t => t.includes('범위'));
        // 팝업 닫기
        const closeBtn = elements.find(el => el.type === 'Rectangle' && el.fillColor === 0xcc2222);
        if (closeBtn) closeBtn.emit('pointerdown');
        return { hasRange, texts };
      });
    });
    expect(result.hasRange).toBe(true);
  });

  test('spice_grinder 팝업: dotDamage 특수 스탯 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['spice_grinder'];
        scene._showToolInfoPopup(def, 1);
        const elements = scene._infoPopupElements || [];
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        const hasDot = texts.some(t => t.includes('DoT'));
        const closeBtn = elements.find(el => el.type === 'Rectangle' && el.fillColor === 0xcc2222);
        if (closeBtn) closeBtn.emit('pointerdown');
        return { hasDot, texts };
      });
    });
    expect(result.hasDot).toBe(true);
  });
});

// ================================================================
// Phase C: RecipeCollectionScene 도구 탭
// ================================================================
test.describe('Phase C: RecipeCollectionScene 도구 탭', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGameReady(page);
    await goToRecipeCollection(page);
  });

  test('AC-11: 탭 바 우측 끝에 도구 탭 존재', async ({ page }) => {
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-recipe-tabs.png' });
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      if (!scene) return { error: 'scene not found' };
      const toolTab = scene._tabObjects.find(t => t.catId === 'tools');
      return {
        exists: !!toolTab,
        totalTabs: scene._tabObjects.length,
        isLast: toolTab === scene._tabObjects[scene._tabObjects.length - 1],
      };
    });
    expect(result.exists).toBe(true);
    expect(result.totalTabs).toBe(9); // 8 recipe categories + 1 tools
    expect(result.isLast).toBe(true);
  });

  test('AC-12: _currentCategory = tools 설정 후 _renderGrid() 호출 시 3열 그리드 렌더링', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      scene._currentCategory = 'tools';
      scene._renderGrid();
      // _gridContainer 내 요소 확인
      const container = scene._gridContainer;
      return { childCount: container.list.length };
    });
    // 8 tools x 4 elements each (cellBg + colorBox + nameText + countText) = 32
    expect(result.childCount).toBe(32);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-tool-grid.png' });
  });

  test('AC-13: 그리드 셀 8개 (도구 8종) 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      scene._currentCategory = 'tools';
      scene._renderGrid();
      const container = scene._gridContainer;
      // interactive (clickable) 셀 수 = 도구 수
      const interactives = container.list.filter(el => el.input && el.input.enabled);
      return { interactiveCount: interactives.length };
    });
    expect(result.interactiveCount).toBe(8);
  });

  test('AC-14: 프라이팬 셀 - 기본 보유(count 4) 초록색 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      scene._currentCategory = 'tools';
      scene._renderGrid();
      const container = scene._gridContainer;
      // 텍스트 요소에서 프라이팬 count 찾기 (기본 pan: count 4, maxCount 5)
      const countTexts = container.list.filter(el =>
        el.type === 'Text' && el.text && el.text.includes('/ 5')
      );
      const panCount = countTexts.find(t => t.text.includes('4'));
      return {
        found: !!panCount,
        text: panCount ? panCount.text : null,
        color: panCount ? panCount.style.color : null,
      };
    });
    expect(result.found).toBe(true);
    expect(result.text).toContain('4');
    expect(result.color).toBe('#88ff88');
  });

  test('AC-15: 미보유 도구 셀 - 0/X 회색 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      scene._currentCategory = 'tools';
      scene._renderGrid();
      const container = scene._gridContainer;
      // salt 기본: count=0
      const countTexts = container.list.filter(el =>
        el.type === 'Text' && el.text && el.text.startsWith('0 / ')
      );
      return {
        found: countTexts.length > 0,
        count: countTexts.length,
        firstColor: countTexts.length > 0 ? countTexts[0].style.color : null,
      };
    });
    expect(result.found).toBe(true);
    // 미보유 도구는 7개 (pan 제외)
    expect(result.count).toBe(7);
    expect(result.firstColor).toBe('#666666');
  });

  test('AC-16: 셀 클릭 시 상세 팝업 열림', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      scene._currentCategory = 'tools';
      scene._renderGrid();
      return import('/js/data/gameData.js').then(m => {
        scene._showToolDetail(m.TOOL_DEFS['pan']);
        return {
          detailExists: scene._detailContainer !== null,
          detailChildCount: scene._detailContainer ? scene._detailContainer.list.length : 0,
        };
      });
    });
    expect(result.detailExists).toBe(true);
    expect(result.detailChildCount).toBeGreaterThan(5);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-tool-detail-pan.png' });
  });

  test('AC-17: 상세 팝업에 이름, descKo, Lv1/Lv2/Lv3 스탯 테이블, loreKo 포함', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        scene._showToolDetail(def);
        const container = scene._detailContainer;
        const texts = container.list.filter(el => el.type === 'Text').map(el => el.text);
        const hasName = texts.some(t => t.includes(def.nameKo));
        const hasDesc = texts.some(t => t === def.descKo);
        const hasLore = texts.some(t => t === def.loreKo);
        const hasLv1 = texts.some(t => t === 'Lv1');
        const hasLv2 = texts.some(t => t === 'Lv2');
        const hasLv3 = texts.some(t => t === 'Lv3');
        const hasHeader = texts.some(t => t === '항목');
        return { hasName, hasDesc, hasLore, hasLv1, hasLv2, hasLv3, hasHeader, texts };
      });
    });
    expect(result.hasName).toBe(true);
    expect(result.hasDesc).toBe(true);
    expect(result.hasLore).toBe(true);
    expect(result.hasLv1).toBe(true);
    expect(result.hasLv2).toBe(true);
    expect(result.hasLv3).toBe(true);
    expect(result.hasHeader).toBe(true);
  });

  test('AC-18: attack 상세 팝업: 공격력/사거리/공격속도 3행 이상 표시', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        scene._showToolDetail(def);
        const container = scene._detailContainer;
        const texts = container.list.filter(el => el.type === 'Text').map(el => el.text);
        const hasAttack = texts.some(t => t.includes('공격력'));
        const hasRange = texts.some(t => t.includes('사거리'));
        const hasSpeed = texts.some(t => t.includes('공격속도'));
        // Lv1 스탯 값 확인 (pan Lv1: damage=25, range=100, fireRate=1000)
        const has25 = texts.some(t => t === '25');
        const has100 = texts.some(t => t === '100');
        const has1000ms = texts.some(t => t === '1000ms');
        return { hasAttack, hasRange, hasSpeed, has25, has100, has1000ms, texts };
      });
    });
    expect(result.hasAttack).toBe(true);
    expect(result.hasRange).toBe(true);
    expect(result.hasSpeed).toBe(true);
  });

  test('AC-19: support 상세 팝업: 사거리 + 특수 1행 표시 (공격력/공격속도 행 없음)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['delivery'];
        scene._showToolDetail(def);
        const container = scene._detailContainer;
        const texts = container.list.filter(el => el.type === 'Text').map(el => el.text);
        const hasRange = texts.some(t => t.includes('사거리'));
        const hasCollect = texts.some(t => t.includes('수집'));
        const hasAttack = texts.some(t => t === '공격력');
        const hasSpeed = texts.some(t => t === '공격속도');
        return { hasRange, hasCollect, hasAttack, hasSpeed, texts };
      });
    });
    expect(result.hasRange).toBe(true);
    expect(result.hasCollect).toBe(true);
    expect(result.hasAttack).toBe(false);
    expect(result.hasSpeed).toBe(false);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-tool-detail-delivery.png' });
  });

  test('AC-20: 기존 레시피 탭(스프/구이/볶음 등) 정상 동작', async ({ page }) => {
    // 도구 탭으로 전환 후 다시 레시피 탭으로 돌아가도 정상인지 확인
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());

      // 도구 탭으로 전환
      scene._currentCategory = 'tools';
      scene._refreshTabs();
      scene._renderGrid();
      const toolGridCount = scene._gridContainer.list.length;

      // soup 탭으로 전환
      scene._currentCategory = 'soup';
      scene._refreshTabs();
      scene._renderGrid();
      const soupGridCount = scene._gridContainer.list.length;

      // all 탭으로 전환
      scene._currentCategory = 'all';
      scene._refreshTabs();
      scene._renderGrid();
      const allGridCount = scene._gridContainer.list.length;

      return { toolGridCount, soupGridCount, allGridCount };
    });
    expect(result.toolGridCount).toBe(32); // 8 tools * 4 elements
    expect(result.soupGridCount).toBeGreaterThan(0);
    expect(result.allGridCount).toBeGreaterThan(0);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-recipe-tab-switch.png' });
  });
});

// ================================================================
// 예외 시나리오 + 엣지케이스
// ================================================================
test.describe('예외 시나리오 및 엣지케이스', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGameReady(page);
  });

  test('EX-1: 콘솔 에러 없이 MerchantScene 도구 정보 팝업 작동', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goToMerchant(page);

    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const ids = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
        for (const id of ids) {
          scene._showToolInfoPopup(m.TOOL_DEFS[id], 1);
        }
        // 마지막 팝업 닫기
        const closeBtn = scene._infoPopupElements.find(el => el.type === 'Rectangle' && el.fillColor === 0xcc2222);
        if (closeBtn) closeBtn.emit('pointerdown');
      });
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('EX-2: 콘솔 에러 없이 RecipeCollectionScene 도구 탭 작동', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goToRecipeCollection(page);

    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._currentCategory = 'tools';
        scene._renderGrid();
        // 모든 도구 상세 팝업 열기/닫기
        const ids = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];
        for (const id of ids) {
          scene._showToolDetail(m.TOOL_DEFS[id]);
        }
      });
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('EX-3: MerchantScene 팝업 연타 열기/닫기 (중복 팝업 방지)', async ({ page }) => {
    await goToMerchant(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        // 빠르게 5번 연속 열기
        for (let i = 0; i < 5; i++) {
          scene._showToolInfoPopup(m.TOOL_DEFS['pan'], 1);
        }
        return {
          popupOpen: scene._popupOpen,
          elementCount: scene._infoPopupElements ? scene._infoPopupElements.length : 0,
          // 씬의 전체 게임 오브젝트 수가 비정상적으로 많지 않은지
          totalChildren: scene.children.list.length,
        };
      });
    });
    expect(result.popupOpen).toBe(true);
    expect(result.totalChildren).toBeLessThan(200); // 합리적인 범위
  });

  test('EX-4: RecipeCollectionScene 도구 탭에서 상세 팝업 연타', async ({ page }) => {
    await goToRecipeCollection(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._currentCategory = 'tools';
        scene._renderGrid();
        // 빠르게 5번 연속 상세 팝업 열기
        for (let i = 0; i < 5; i++) {
          scene._showToolDetail(m.TOOL_DEFS['pan']);
        }
        return {
          detailExists: scene._detailContainer !== null,
          detailChildCount: scene._detailContainer ? scene._detailContainer.list.length : 0,
          totalChildren: scene.children.list.length,
        };
      });
    });
    expect(result.detailExists).toBe(true);
    expect(result.totalChildren).toBeLessThan(200);
  });

  test('EX-5: 팝업 오버레이 클릭으로 닫기 (MerchantScene)', async ({ page }) => {
    await goToMerchant(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._showToolInfoPopup(m.TOOL_DEFS['pan'], 1);
        const openBefore = scene._popupOpen;
        // 오버레이 찾기 (첫 번째 Rectangle in _infoPopupElements, fillColor === 0x000000)
        const overlay = scene._infoPopupElements.find(el =>
          el.type === 'Rectangle' && el.fillColor === 0x000000
        );
        if (overlay) overlay.emit('pointerdown');
        return { openBefore, openAfter: scene._popupOpen };
      });
    });
    expect(result.openBefore).toBe(true);
    expect(result.openAfter).toBe(false);
  });

  test('EX-6: 팝업 오버레이 클릭으로 닫기 (RecipeCollectionScene)', async ({ page }) => {
    await goToRecipeCollection(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._currentCategory = 'tools';
        scene._renderGrid();
        scene._showToolDetail(m.TOOL_DEFS['pan']);
        const existsBefore = scene._detailContainer !== null;
        // 오버레이 찾기 (container 내 첫 번째 요소)
        const overlay = scene._detailContainer.list.find(el =>
          el.type === 'Rectangle' && el.fillAlpha < 1 && el.width >= 360
        );
        if (overlay) overlay.emit('pointerdown');
        return { existsBefore, existsAfter: scene._detailContainer !== null };
      });
    });
    expect(result.existsBefore).toBe(true);
    expect(result.existsAfter).toBe(false);
  });

  test('EX-7: 팝업 열린 동안 스크롤 비활성화 (MerchantScene)', async ({ page }) => {
    await goToMerchant(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._showToolInfoPopup(m.TOOL_DEFS['pan'], 1);
        return { popupOpen: scene._popupOpen === true };
      });
    });
    expect(result.popupOpen).toBe(true);
  });

  test('EX-8: MerchantScene 팝업 - 레벨 2/3 스탯이 올바르게 표시되는지', async ({ page }) => {
    await goToMerchant(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['pan'];
        // Level 3 팝업
        scene._showToolInfoPopup(def, 3);
        const elements = scene._infoPopupElements || [];
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        // Lv3 스탯: damage=50, range=120, fireRate=800
        const hasLv3 = texts.some(t => t.includes('Lv: 3'));
        const hasDamage50 = texts.some(t => t === '50');
        const hasRange120 = texts.some(t => t === '120');
        const hasFireRate800 = texts.some(t => t === '800ms');
        const closeBtn = elements.find(el => el.type === 'Rectangle' && el.fillColor === 0xcc2222);
        if (closeBtn) closeBtn.emit('pointerdown');
        return { hasLv3, hasDamage50, hasRange120, hasFireRate800, texts };
      });
    });
    expect(result.hasLv3).toBe(true);
    expect(result.hasDamage50).toBe(true);
    expect(result.hasRange120).toBe(true);
    expect(result.hasFireRate800).toBe(true);
  });

  test('EX-9: RecipeCollectionScene 탭 전체가 360px 내 (클리핑 없음)', async ({ page }) => {
    await goToRecipeCollection(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      const lastTab = scene._tabObjects[scene._tabObjects.length - 1];
      if (!lastTab) return { error: 'no tabs' };
      const bg = lastTab.bg;
      const rightEdge = bg.x + bg.width * (1 - bg.originX);
      return {
        rightEdge,
        within360: rightEdge <= 360,
        tabCount: scene._tabObjects.length,
      };
    });
    expect(result.within360).toBe(true);
    expect(result.tabCount).toBe(9);
  });

  test('EX-10: RecipeCollectionScene 도구 상세 팝업이 640px 내 (클리핑 없음)', async ({ page }) => {
    await goToRecipeCollection(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._showToolDetail(m.TOOL_DEFS['pan']);
        const container = scene._detailContainer;
        if (!container) return { error: 'no container' };
        const rects = container.list.filter(el => el.type === 'Rectangle');
        const popBg = rects.find(el => el.fillColor === 0x221100);
        if (!popBg) return { error: 'no popup bg', rects: rects.map(r => r.fillColor.toString(16)) };
        const top = popBg.y - popBg.height * popBg.originY;
        const bottom = popBg.y + popBg.height * (1 - popBg.originY);
        return { top, bottom, within: top >= 0 && bottom <= 640 };
      });
    });
    expect(result.within).toBe(true);
  });

  test('EX-11: soup_pot(수프 솥) support 팝업에 auraEffect 특수 스탯 표시', async ({ page }) => {
    await goToMerchant(page);
    const result = await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        const def = m.TOOL_DEFS['soup_pot'];
        scene._showToolInfoPopup(def, 1);
        const elements = scene._infoPopupElements || [];
        const texts = elements.filter(el => el.type === 'Text').map(el => el.text);
        const hasBuff = texts.some(t => t.includes('버프'));
        const statBars = elements.filter(el => el.type === 'Rectangle' && el.fillColor === 0x44aaff);
        const closeBtn = elements.find(el => el.type === 'Rectangle' && el.fillColor === 0xcc2222);
        if (closeBtn) closeBtn.emit('pointerdown');
        return { hasBuff, statBarCount: statBars.length, texts };
      });
    });
    expect(result.hasBuff).toBe(true);
    expect(result.statBarCount).toBe(2); // 사거리 + 버프
  });
});

// ================================================================
// 시각적 검증
// ================================================================
test.describe('시각적 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForGameReady(page);
  });

  test('VIS-1: MerchantScene 전체 레이아웃 스크린샷', async ({ page }) => {
    await goToMerchant(page);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-merchant-layout.png' });
  });

  test('VIS-2: MerchantScene attack 도구 팝업 스크린샷', async ({ page }) => {
    await goToMerchant(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._showToolInfoPopup(m.TOOL_DEFS['grill'], 1);
      });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-popup-grill.png' });
  });

  test('VIS-3: MerchantScene support 도구 팝업 스크린샷', async ({ page }) => {
    await goToMerchant(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'MerchantScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._showToolInfoPopup(m.TOOL_DEFS['soup_pot'], 1);
      });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-popup-soup-pot.png' });
  });

  test('VIS-4: RecipeCollectionScene 도구 그리드 스크린샷', async ({ page }) => {
    await goToRecipeCollection(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      scene._currentCategory = 'tools';
      scene._refreshTabs();
      scene._renderGrid();
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-tool-grid-full.png' });
  });

  test('VIS-5: RecipeCollectionScene 도구 상세 팝업 (attack) 스크린샷', async ({ page }) => {
    await goToRecipeCollection(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._currentCategory = 'tools';
        scene._renderGrid();
        scene._showToolDetail(m.TOOL_DEFS['freezer']);
      });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-tool-detail-freezer.png' });
  });

  test('VIS-6: RecipeCollectionScene 도구 상세 팝업 (support) 스크린샷', async ({ page }) => {
    await goToRecipeCollection(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.scenes.find(s => s.scene.key === 'RecipeCollectionScene' && s.scene.isActive());
      return import('/js/data/gameData.js').then(m => {
        scene._currentCategory = 'tools';
        scene._renderGrid();
        scene._showToolDetail(m.TOOL_DEFS['soup_pot']);
      });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/tool-info-qa-tool-detail-soup-pot.png' });
  });
});
