/**
 * @fileoverview 레시피 도감 씬.
 * Phase 5: 해금된 레시피를 카테고리별로 열람, 미해금 레시피는 실루엣 표시.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { ALL_RECIPES, RECIPE_CATEGORIES, TIER_COLORS, TIER_NAMES } from '../data/recipeData.js';
import { RecipeManager } from '../managers/RecipeManager.js';

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

    // ── 뒤로가기 버튼 ──
    const backBtn = this.add.rectangle(50, 30, 70, 28, 0x555555)
      .setInteractive({ useHandCursor: true }).setDepth(10);
    this.add.text(50, 30, '← 돌아가기', {
      fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(11);
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  /** 카테고리 탭 바 생성 */
  _createCategoryTabs() {
    const startX = 10;
    const y = 82;
    let cx = startX;

    RECIPE_CATEGORIES.forEach(cat => {
      const w = cat.id === 'all' ? 36 : 42;
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

      this._tabObjects.push({ bg, label, catId: cat.id });
      cx += w + 4;
    });
  }

  /** 탭 활성 상태 갱신 */
  _refreshTabs() {
    this._tabObjects.forEach(({ bg, label, catId }) => {
      const isActive = catId === this._currentCategory;
      bg.setFillStyle(isActive ? 0xff6b35 : 0x333333);
      label.setColor(isActive ? '#ffffff' : '#888888');
    });
  }

  /** 레시피 그리드 렌더링 */
  _renderGrid() {
    this._gridContainer.removeAll(true);
    if (this._detailContainer) {
      this._detailContainer.destroy();
      this._detailContainer = null;
    }

    const recipes = RecipeManager.getRecipesByCategory(this._currentCategory);
    const cols = 5;
    const cellSize = 58;
    const startX = (GAME_WIDTH - cols * cellSize) / 2 + cellSize / 2;
    const startY = 110;

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

    // 닫기 버튼
    const closeBtn = this.add.rectangle(cx + 120, cy - 100, 40, 24, 0xff4444)
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

    this._detailContainer = container;
  }
}
