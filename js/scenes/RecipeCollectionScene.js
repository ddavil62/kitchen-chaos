/**
 * @fileoverview 레시피 도감 씬.
 * Phase 5: 해금된 레시피를 카테고리별로 열람, 미해금 레시피는 실루엣 표시.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { ALL_RECIPES, RECIPE_CATEGORIES, TIER_COLORS, TIER_NAMES } from '../data/recipeData.js';
import { TOOL_DEFS } from '../data/gameData.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { ToolManager } from '../managers/ToolManager.js';

export class RecipeCollectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RecipeCollectionScene' });
  }

  create() {
    this._currentCategory = 'all';
    this._detailContainer = null;

    // ── 배경 ──
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a00);

    // ── 헤더 ──
    this.add.text(GAME_WIDTH / 2, 30, '📖 레시피 도감', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    const { unlocked, total, percent } = RecipeManager.getCollectionProgress();
    this.add.text(GAME_WIDTH / 2, 58, `${unlocked}/${total} 수집 (${percent}%)`, {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // ── 카테고리 탭 ──
    this._tabObjects = [];
    this._createCategoryTabs();

    // ── 레시피 그리드 ──
    this._gridContainer = this.add.container(0, 0).setDepth(1);
    this._renderGrid();

    // ── 뒤로가기 버튼 (Phase 11-3b: Disabled 팔레트 + 터치 피드백 + fadeOut) ──
    const backBtn = this.add.rectangle(50, 30, 70, 28, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(50, 30, '← 돌아가기', {
      fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(11);
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x666666));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x444444));

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  /** 카테고리 탭 바 생성 (레시피 카테고리 + 도구 탭) */
  _createCategoryTabs() {
    const startX = 10;
    const y = 82;
    let cx = startX;
    // 간격: 3px, 너비: all=28, 나머지=34 (도구 탭 포함 9개 적합)
    const gap = 3;

    // 레시피 카테고리 탭
    RECIPE_CATEGORIES.forEach(cat => {
      const w = cat.id === 'all' ? 28 : 34;
      const isActive = cat.id === this._currentCategory;
      const bg = this.add.rectangle(cx + w / 2, y, w, 20,
        isActive ? 0xff6b35 : 0x333333
      ).setInteractive({ useHandCursor: true });

      const label = this.add.text(cx + w / 2, y, `${cat.icon}`, {
        fontSize: '11px', color: isActive ? '#ffffff' : '#888888',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        this._currentCategory = cat.id;
        this._refreshTabs();
        this._renderGrid();
      });
      // Phase 11-3b: 탭 터치 피드백
      bg.on('pointerover', () => {
        if (cat.id !== this._currentCategory) bg.setFillStyle(0x444444);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(cat.id === this._currentCategory ? 0xff6b35 : 0x333333);
      });

      this._tabObjects.push({ bg, label, catId: cat.id });
      cx += w + gap;
    });

    // 도구 탭 추가
    const toolTab = { id: 'tools', nameKo: '\uB3C4\uAD6C', icon: '\uD83D\uDD27' };
    const tw = 34;
    const isToolActive = this._currentCategory === 'tools';
    const toolBg = this.add.rectangle(cx + tw / 2, y, tw, 20,
      isToolActive ? 0xff6b35 : 0x333333
    ).setInteractive({ useHandCursor: true });

    const toolLabel = this.add.text(cx + tw / 2, y, toolTab.icon, {
      fontSize: '11px', color: isToolActive ? '#ffffff' : '#888888',
    }).setOrigin(0.5);

    toolBg.on('pointerdown', () => {
      this._currentCategory = 'tools';
      this._refreshTabs();
      this._renderGrid();
    });
    toolBg.on('pointerover', () => {
      if (this._currentCategory !== 'tools') toolBg.setFillStyle(0x444444);
    });
    toolBg.on('pointerout', () => {
      toolBg.setFillStyle(this._currentCategory === 'tools' ? 0xff6b35 : 0x333333);
    });

    this._tabObjects.push({ bg: toolBg, label: toolLabel, catId: 'tools' });
  }

  /** 탭 활성 상태 갱신 */
  _refreshTabs() {
    this._tabObjects.forEach(({ bg, label, catId }) => {
      const isActive = catId === this._currentCategory;
      bg.setFillStyle(isActive ? 0xff6b35 : 0x333333);
      label.setColor(isActive ? '#ffffff' : '#888888');
    });
  }

  /** 레시피 그리드 렌더링 (카테고리별 분기) */
  _renderGrid() {
    this._gridContainer.removeAll(true);
    if (this._detailContainer) {
      this._detailContainer.destroy();
      this._detailContainer = null;
    }

    // 도구 탭일 때는 도구 그리드를 렌더링
    if (this._currentCategory === 'tools') {
      this._renderToolGrid();
      return;
    }

    const recipes = RecipeManager.getRecipesByCategory(this._currentCategory);
    const cols = 5;
    const cellSize = 58;
    const startX = (GAME_WIDTH - cols * cellSize) / 2 + cellSize / 2;
    const startY = 128;

    recipes.forEach((recipe, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellSize;
      const y = startY + row * (cellSize + 8);

      const unlocked = RecipeManager.isUnlocked(recipe.id);
      const tierColor = TIER_COLORS[recipe.tier] || 0xcccccc;

      // 테두리
      const border = this.add.rectangle(x, y, 50, 50, tierColor, 0.3)
        .setStrokeStyle(2, tierColor);
      this._gridContainer.add(border);

      if (unlocked) {
        // 아이콘
        const icon = this.add.text(x, y - 6, recipe.icon, {
          fontSize: '22px',
        }).setOrigin(0.5);
        this._gridContainer.add(icon);

        // 등급 별
        const tier = this.add.text(x, y + 18, TIER_NAMES[recipe.tier], {
          fontSize: '7px', color: `#${tierColor.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5);
        this._gridContainer.add(tier);
      } else {
        // 미해금: 물음표
        const locked = this.add.text(x, y, '?', {
          fontSize: '24px', color: '#444444', fontStyle: 'bold',
        }).setOrigin(0.5);
        this._gridContainer.add(locked);
      }

      // 클릭 → 상세
      border.setInteractive({ useHandCursor: true });
      border.on('pointerdown', () => this._showDetail(recipe, unlocked));
    });
  }

  /**
   * 레시피 상세 패널 표시.
   * @param {object} recipe
   * @param {boolean} unlocked
   */
  _showDetail(recipe, unlocked) {
    if (this._detailContainer) {
      this._detailContainer.destroy();
      this._detailContainer = null;
    }

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 + 60;
    const container = this.add.container(0, 0).setDepth(50);

    // 반투명 오버레이
    const overlay = this.add.rectangle(cx, cy, 300, 240, 0x000000, 0.9)
      .setStrokeStyle(2, TIER_COLORS[recipe.tier] || 0xcccccc);
    container.add(overlay);

    if (unlocked) {
      // 해금된 레시피: 모든 정보 표시
      container.add(this.add.text(cx, cy - 90, `${recipe.icon} ${recipe.nameKo}`, {
        fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5));

      container.add(this.add.text(cx, cy - 65, `${TIER_NAMES[recipe.tier]}  ${recipe.category}`, {
        fontSize: '11px', color: `#${(TIER_COLORS[recipe.tier] || 0xcccccc).toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5));

      // 재료
      const ingStr = Object.entries(recipe.ingredients)
        .map(([id, cnt]) => `${id} ×${cnt}`)
        .join('  ');
      container.add(this.add.text(cx, cy - 40, `재료: ${ingStr}`, {
        fontSize: '11px', color: '#cccccc',
      }).setOrigin(0.5));

      // 보상/효과
      if (recipe.baseReward) {
        container.add(this.add.text(cx, cy - 18, `보상: ${recipe.baseReward}g   조리: ${(recipe.cookTime / 1000).toFixed(1)}초`, {
          fontSize: '11px', color: '#88ff88',
        }).setOrigin(0.5));
      }
      if (recipe.effectDesc) {
        container.add(this.add.text(cx, cy - 18, `효과: ${recipe.effectDesc}`, {
          fontSize: '11px', color: '#88ccff',
        }).setOrigin(0.5));
      }
    } else {
      // 미해금 레시피
      container.add(this.add.text(cx, cy - 60, '???', {
        fontSize: '36px', fontStyle: 'bold', color: '#444444',
      }).setOrigin(0.5));

      container.add(this.add.text(cx, cy - 10, '아직 발견하지 못한 레시피', {
        fontSize: '13px', color: '#888888',
      }).setOrigin(0.5));

      if (recipe.gateStage) {
        container.add(this.add.text(cx, cy + 15, `스테이지 ${recipe.gateStage} 클리어 후 상점에서 해금`, {
          fontSize: '10px', color: '#666666',
        }).setOrigin(0.5));
      } else {
        container.add(this.add.text(cx, cy + 15, '상점에서 해금 가능', {
          fontSize: '10px', color: '#666666',
        }).setOrigin(0.5));
      }
    }

    // 닫기 버튼 (Phase 11-3b: Danger 팔레트 + 터치 피드백)
    const closeBtn = this.add.rectangle(cx + 120, cy - 100, 40, 24, 0xcc2222)
      .setInteractive({ useHandCursor: true });
    container.add(closeBtn);
    const closeText = this.add.text(cx + 120, cy - 100, '✕', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);
    container.add(closeText);
    closeBtn.on('pointerdown', () => {
      container.destroy();
      this._detailContainer = null;
    });
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xff3333));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xcc2222));

    this._detailContainer = container;
  }

  // ── 도구 탭 그리드 + 상세 팝업 ────────────────────────────────────

  /** 도구 아이콘 이모지 (MerchantScene과 동일) */
  static TOOL_ICONS = {
    pan: '\uD83C\uDF73', salt: '\uD83E\uDDC2', grill: '\uD83D\uDD25',
    delivery: '\uD83E\uDD16', freezer: '\u2744\uFE0F', soup_pot: '\uD83C\uDF72',
    wasabi_cannon: '\uD83D\uDFE2', spice_grinder: '\uD83D\uDFE0',
  };

  /** 도구 표시 순서 */
  static TOOL_ORDER = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];

  /**
   * 도구 탭 3열 그리드를 렌더링한다.
   * @private
   */
  _renderToolGrid() {
    const cols = 3;
    const cellSize = 90;
    const startX = 90;  // (360 - 3*90)/2 + 45 = 90
    const startY = 128;
    const rowGap = 100;
    const inventory = ToolManager.getToolInventory();

    RecipeCollectionScene.TOOL_ORDER.forEach((toolId, i) => {
      const def = TOOL_DEFS[toolId];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellSize;
      const y = startY + row * rowGap;
      const count = (inventory[toolId] || { count: 0 }).count;

      // 셀 배경 + 테두리
      const cellBg = this.add.rectangle(x, y, 80, 80, 0x1a1000)
        .setStrokeStyle(1, 0x444444);
      this._gridContainer.add(cellBg);

      // 색상 박스 (38x38)
      const colorBox = this.add.rectangle(x, y - 10, 38, 38, def.color)
        .setStrokeStyle(1, 0xffffff, 0.4);
      this._gridContainer.add(colorBox);

      // 도구 이름
      const nameTxt = this.add.text(x, y + 22, def.nameKo, {
        fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      this._gridContainer.add(nameTxt);

      // 보유 수 / 최대 수
      const countStr = `${count} / ${def.maxCount}`;
      const countTxt = this.add.text(x, y + 30, countStr, {
        fontSize: '10px', color: count > 0 ? '#88ff88' : '#666666',
      }).setOrigin(0.5);
      this._gridContainer.add(countTxt);

      // 셀 클릭 → 상세 팝업
      cellBg.setInteractive({ useHandCursor: true });
      cellBg.on('pointerdown', () => this._showToolDetail(def));
    });
  }

  /**
   * 도구 상세 팝업을 표시한다. 이미 열린 팝업이 있으면 먼저 파괴한다.
   * @param {object} toolDef - TOOL_DEFS 항목
   * @private
   */
  _showToolDetail(toolDef) {
    if (this._detailContainer) {
      this._detailContainer.destroy();
      this._detailContainer = null;
    }

    const cx = GAME_WIDTH / 2;

    // ── 스탯 행 수를 미리 계산하여 팝업 높이를 동적으로 결정 ──
    let rowCount = 1; // 사거리 항상 포함
    if (toolDef.category === 'attack') rowCount += 2; // 공격력 + 공격속도
    const specialKey = this._findSpecialStatKey(toolDef.stats[1]);
    if (specialKey) rowCount += 1;

    // 높이 = 상단패딩(15) + 헤더(30) + sep(10) + descKo(50) + sep(10) + 스탯헤더행(20) + 행당18px + sep(10) + loreKo(50) + 하단패딩(25)
    const popupH = 15 + 30 + 10 + 50 + 10 + 20 + rowCount * 18 + 10 + 50 + 25;
    // cy를 화면 중앙(+10)에 두되, 팝업이 화면 밖으로 나가지 않도록 clamp
    const cy = Math.max(popupH / 2 + 10, Math.min(GAME_HEIGHT - popupH / 2 - 10, GAME_HEIGHT / 2 + 10));

    const container = this.add.container(0, 0).setDepth(50);

    // 오버레이 (탭으로 닫기)
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setInteractive();
    container.add(overlay);

    // 팝업 배경 (320 x 동적 높이)
    const popBg = this.add.rectangle(cx, cy, 320, popupH, 0x221100)
      .setStrokeStyle(2, toolDef.color);
    container.add(popBg);

    // ── 팝업 상단 기준 Y 좌표 ──
    const topY = cy - popupH / 2;

    // 헤더: 아이콘 + 이름
    const icon = RecipeCollectionScene.TOOL_ICONS[toolDef.id] || '\uD83D\uDD27';
    container.add(this.add.text(cx - 110, topY + 20, `${icon} ${toolDef.nameKo}`, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }));

    // 닫기 버튼 (X)
    const closeBtn = this.add.rectangle(cx + 130, topY + 20, 36, 24, 0xcc2222)
      .setInteractive({ useHandCursor: true });
    container.add(closeBtn);
    container.add(this.add.text(cx + 130, topY + 20, '\u2715', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5));

    // 구분선
    container.add(this.add.rectangle(cx, topY + 42, 280, 1, 0x444444));

    // 기능 설명 (descKo)
    container.add(this.add.text(cx, topY + 54, toolDef.descKo || '', {
      fontSize: '12px', color: '#cccccc', wordWrap: { width: 270 }, lineSpacing: 3,
    }).setOrigin(0.5, 0));

    // 구분선
    container.add(this.add.rectangle(cx, topY + 94, 280, 1, 0x444444));

    // 스탯 비교표 헤더
    const tableX = cx - 120;
    let rowY = topY + 108;
    const colOffsets = [0, 100, 150, 200];  // 항목, Lv1, Lv2, Lv3
    const headerLabels = ['\uD56D\uBAA9', 'Lv1', 'Lv2', 'Lv3'];
    headerLabels.forEach((h, i) => {
      container.add(this.add.text(tableX + colOffsets[i], rowY, h, {
        fontSize: '10px', fontStyle: 'bold', color: '#ffd700',
      }).setOrigin(0, 0.5));
    });
    rowY += 18;

    // 공격력 행 (attack 카테고리만)
    if (toolDef.category === 'attack') {
      this._addStatTableRow(container, tableX, rowY, colOffsets, '\uACF5\uACA9\uB825', toolDef, 'damage');
      rowY += 18;
    }

    // 사거리 행 (항상)
    this._addStatTableRow(container, tableX, rowY, colOffsets, '\uC0AC\uAC70\uB9AC', toolDef, 'range');
    rowY += 18;

    // 공격속도 행 (attack 카테고리만)
    if (toolDef.category === 'attack') {
      this._addStatTableRow(container, tableX, rowY, colOffsets, '\uACF5\uACA9\uC18D\uB3C4', toolDef, 'fireRate', 'ms');
      rowY += 18;
    }

    // 특수 스탯 행 (존재하는 첫 번째 항목, 위에서 이미 계산됨)
    if (specialKey) {
      const specialLabel = this._getSpecialLabel(specialKey);
      const suffix = this._getSpecialSuffix(specialKey);
      this._addStatTableRow(container, tableX, rowY, colOffsets, specialLabel, toolDef, specialKey.key, suffix, specialKey.transform);
      rowY += 18;
    }

    // 구분선
    container.add(this.add.rectangle(cx, rowY + 12, 280, 1, 0x444444));

    // 로어 (loreKo)
    container.add(this.add.text(cx, rowY + 22, toolDef.loreKo || '', {
      fontSize: '11px', fontStyle: 'italic', color: '#aaaaaa',
      wordWrap: { width: 270 }, lineSpacing: 2,
    }).setOrigin(0.5, 0));

    // 닫기 콜백
    const closeFn = () => {
      container.destroy();
      this._detailContainer = null;
    };
    closeBtn.on('pointerdown', closeFn);
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xff3333));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xcc2222));
    overlay.on('pointerdown', closeFn);

    this._detailContainer = container;
  }

  /**
   * 스탯 테이블 행 1줄을 컨테이너에 추가한다.
   * @param {Phaser.GameObjects.Container} container
   * @param {number} tableX - 테이블 시작 X
   * @param {number} y - 행 Y
   * @param {number[]} colOffsets - 열 오프셋 배열
   * @param {string} label - 스탯 이름
   * @param {object} toolDef - 도구 정의
   * @param {string} statKey - 스탯 키
   * @param {string} [suffix=''] - 접미사
   * @param {Function} [transform] - 값 변환 함수
   * @private
   */
  _addStatTableRow(container, tableX, y, colOffsets, label, toolDef, statKey, suffix = '', transform) {
    container.add(this.add.text(tableX + colOffsets[0], y, label, {
      fontSize: '10px', color: '#aaaaaa',
    }).setOrigin(0, 0.5));

    for (let lv = 1; lv <= 3; lv++) {
      const stats = toolDef.stats[lv];
      let val = stats[statKey];
      if (val === undefined) val = '-';
      else if (transform) val = transform(val);
      container.add(this.add.text(tableX + colOffsets[lv], y, `${val}${val !== '-' ? suffix : ''}`, {
        fontSize: '10px', color: '#ffffff',
      }).setOrigin(0, 0.5));
    }
  }

  /**
   * 스탯 객체에서 특수 스탯 키를 찾는다 (우선순위 기반).
   * @param {object} stats - Lv1 스탯 객체
   * @returns {{ key: string, transform?: Function }|null}
   * @private
   */
  _findSpecialStatKey(stats) {
    if (stats.slowFactor !== undefined) return { key: 'slowFactor', transform: v => `${Math.round(v * 100)}%` };
    if (stats.burnDamage !== undefined) return { key: 'burnDamage' };
    if (stats.freezeDuration !== undefined) return { key: 'freezeDuration', transform: v => `${v / 1000}` };
    if (stats.collectInterval !== undefined) return { key: 'collectInterval', transform: v => `${v / 1000}` };
    if (stats.auraEffect !== undefined) return { key: 'auraEffect', transform: v => `${Math.round(v * 100)}%` };
    if (stats.splashRadius !== undefined) return { key: 'splashRadius' };
    if (stats.dotDamage !== undefined) return { key: 'dotDamage' };
    return null;
  }

  /**
   * 특수 스탯 키에 대응하는 한국어 레이블을 반환한다.
   * @param {{ key: string }} special
   * @returns {string}
   * @private
   */
  _getSpecialLabel(special) {
    const map = {
      slowFactor: '\uB454\uD654',
      burnDamage: '\uD654\uC0C1',
      freezeDuration: '\uBE59\uACB0',
      collectInterval: '\uC218\uC9D1',
      auraEffect: '\uBC84\uD504',
      splashRadius: '\uBC94\uC704',
      dotDamage: 'DoT',
    };
    return map[special.key] || special.key;
  }

  /**
   * 특수 스탯 키에 대응하는 접미사를 반환한다.
   * @param {{ key: string, transform?: Function }} special
   * @returns {string}
   * @private
   */
  _getSpecialSuffix(special) {
    // transform이 있으면 접미사를 transform이 처리하므로 빈 문자열
    if (special.transform) return '';
    const map = {
      burnDamage: 'dmg',
      splashRadius: 'px',
      dotDamage: 'dmg',
    };
    return map[special.key] || '';
  }

  /**
   * 하드웨어 뒤로가기 핸들러.
   * 상세 패널이 열려있으면 닫고, 아니면 메뉴로 복귀한다.
   */
  _onBack() {
    if (this._detailContainer) {
      this._detailContainer.destroy();
      this._detailContainer = null;
      return;
    }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
}
