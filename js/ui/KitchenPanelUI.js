/**
 * @fileoverview 주방 패널 UI.
 * RestaurantScene 소속 (Y: 100~220 in scene-local 좌표).
 * 좌측 재료 보유량 + 우측 서빙/버프 레시피 버튼.
 */

import { GAME_WIDTH, KITCHEN_PANEL_Y, KITCHEN_PANEL_HEIGHT } from '../config.js';
import { INGREDIENT_TYPES, SERVING_RECIPES, BUFF_RECIPES } from '../data/gameData.js';

export class KitchenPanelUI {
  /**
   * @param {Phaser.Scene} scene - RestaurantScene
   * @param {object} callbacks
   * @param {function(string):void} callbacks.onServeRecipe - 서빙 레시피 탭(recipeId)
   * @param {function(string):void} callbacks.onBuffRecipe - 버프 레시피 탭(recipeId)
   * @param {import('../managers/IngredientManager.js').IngredientManager} ingredientManager
   */
  constructor(scene, callbacks, ingredientManager) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.ingredientManager = ingredientManager;

    this._createBackground();
    this._createIngredientPanel();
    this._createRecipePanel();
  }

  /** 배경 */
  _createBackground() {
    this.scene.add.rectangle(
      GAME_WIDTH / 2, KITCHEN_PANEL_Y + KITCHEN_PANEL_HEIGHT / 2,
      GAME_WIDTH, KITCHEN_PANEL_HEIGHT,
      0x0d0d1a, 1
    ).setDepth(0);

    // 구분선
    this.scene.add.rectangle(
      GAME_WIDTH / 2, KITCHEN_PANEL_Y,
      GAME_WIDTH - 20, 1, 0x444444
    ).setDepth(1);
  }

  // ── 좌측: 재료 보유량 ──

  _createIngredientPanel() {
    const x = 10;
    const y = KITCHEN_PANEL_Y + 10;

    this.scene.add.text(x, y, '재료', {
      fontSize: '12px', color: '#888888',
    }).setDepth(2);

    this.ingredientTexts = {};
    let offsetY = 24;
    for (const [id, info] of Object.entries(INGREDIENT_TYPES)) {
      const text = this.scene.add.text(x, y + offsetY, `${info.icon} ${info.nameKo}: 0`, {
        fontSize: '14px', color: '#ffffff',
      }).setDepth(2);
      this.ingredientTexts[id] = text;
      offsetY += 22;
    }

    // 재료 판매 안내 (긴급 골드)
    this.sellHint = this.scene.add.text(x, y + offsetY + 4, '', {
      fontSize: '10px', color: '#666666',
    }).setDepth(2);
  }

  // ── 우측: 서빙/버프 레시피 ──

  _createRecipePanel() {
    const panelX = 155;
    const y = KITCHEN_PANEL_Y + 6;

    // 서빙 섹션 라벨
    this.scene.add.text(panelX, y, '── 서빙 ──', {
      fontSize: '11px', color: '#ffcc00',
    }).setDepth(2);

    this.serveButtons = [];
    let offsetY = 20;
    for (const recipe of SERVING_RECIPES) {
      const btn = this._createRecipeButton(panelX, y + offsetY, recipe, 'serve');
      this.serveButtons.push(btn);
      offsetY += 26;
    }

    // 버프 섹션 라벨
    offsetY += 4;
    this.scene.add.text(panelX, y + offsetY, '── 버프 ──', {
      fontSize: '11px', color: '#88ccff',
    }).setDepth(2);
    offsetY += 16;

    this.buffButtons = [];
    for (const recipe of BUFF_RECIPES) {
      const btn = this._createRecipeButton(panelX, y + offsetY, recipe, 'buff');
      this.buffButtons.push(btn);
      offsetY += 26;
    }
  }

  /**
   * 레시피 버튼 하나 생성.
   * @param {number} x
   * @param {number} y
   * @param {object} recipe
   * @param {'serve'|'buff'} type
   */
  _createRecipeButton(x, y, recipe, type) {
    // 필요 재료 요약
    const ingStr = Object.entries(recipe.ingredients)
      .map(([id, cnt]) => `${INGREDIENT_TYPES[id]?.icon || id}×${cnt}`)
      .join(' ');

    const label = type === 'serve'
      ? `${recipe.icon || ''} ${recipe.nameKo} (${ingStr})`
      : `${recipe.nameKo} (${ingStr})`;

    const bg = this.scene.add.rectangle(
      x + 95, y + 10, 190, 22, 0x333355
    ).setDepth(2).setInteractive();

    const text = this.scene.add.text(x + 5, y + 3, label, {
      fontSize: '11px', color: '#ffffff',
      wordWrap: { width: 185 },
    }).setDepth(3);

    bg.on('pointerdown', () => {
      if (type === 'serve') {
        this.callbacks.onServeRecipe(recipe.id);
      } else {
        this.callbacks.onBuffRecipe(recipe.id);
      }
    });

    return { bg, text, recipe };
  }

  /**
   * 재료 보유량 UI 갱신.
   */
  updateIngredients() {
    const inv = this.ingredientManager.inventory;
    for (const [id, info] of Object.entries(INGREDIENT_TYPES)) {
      const count = inv[id] || 0;
      if (this.ingredientTexts[id]) {
        this.ingredientTexts[id].setText(`${info.icon} ${info.nameKo}: ${count}`);
      }
    }

    // 버튼 활성/비활성 갱신
    this._updateButtonStates();
  }

  /**
   * 레시피 버튼 색상 갱신 (재료 충족 여부).
   * @private
   */
  _updateButtonStates() {
    for (const btn of this.serveButtons) {
      const canCook = this.ingredientManager.canCook(btn.recipe);
      btn.bg.setFillStyle(canCook ? 0x336633 : 0x333355);
      btn.text.setColor(canCook ? '#ffff88' : '#666666');
    }
    for (const btn of this.buffButtons) {
      const canCook = this.ingredientManager.canCook(btn.recipe);
      btn.bg.setFillStyle(canCook ? 0x333366 : 0x333355);
      btn.text.setColor(canCook ? '#88ccff' : '#666666');
    }
  }

  /**
   * 버프 활성 텍스트 표시.
   * @param {string} buffName
   */
  showActiveBuff(buffName) {
    if (!this._buffActiveText) {
      this._buffActiveText = this.scene.add.text(
        10, KITCHEN_PANEL_Y + KITCHEN_PANEL_HEIGHT - 18,
        '', { fontSize: '10px', color: '#ffcc00' }
      ).setDepth(3);
    }
    this._buffActiveText.setText(`⚡ ${buffName}`);
  }

  clearBuffText() {
    if (this._buffActiveText) {
      this._buffActiveText.setText('');
    }
  }

  destroy() {
    // Phaser가 씬 종료 시 자동 정리하므로 추가 정리 불필요
  }
}
