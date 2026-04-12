/**
 * @fileoverview 주방 패널 UI.
 * Phase 3: 조리 시간 시스템 + 12개 레시피 컴팩트 레이아웃.
 * RestaurantScene 소속 (Y: 100~220 in scene-local 좌표).
 * 좌측 재료 보유량 + 우측 서빙/버프 레시피 버튼 + 조리 진행바.
 */

import { GAME_WIDTH, KITCHEN_PANEL_Y, KITCHEN_PANEL_HEIGHT } from '../config.js';
import { INGREDIENT_TYPES, SERVING_RECIPES, BUFF_RECIPES, SERVING_RECIPE_MAP } from '../data/gameData.js';

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
    this._createCookingBar();
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
    const x = 6;
    const y = KITCHEN_PANEL_Y + 4;

    this.scene.add.text(x, y, '재료', {
      fontSize: '10px', color: '#888888',
    }).setDepth(2);

    this.ingredientTexts = {};
    let offsetY = 16;
    for (const [id, info] of Object.entries(INGREDIENT_TYPES)) {
      const text = this.scene.add.text(x, y + offsetY, `${info.icon}${info.nameKo}: 0`, {
        fontSize: '11px', color: '#ffffff',
      }).setDepth(2);
      this.ingredientTexts[id] = text;
      offsetY += 16;
    }

    // 버프 활성 텍스트
    this._buffActiveText = this.scene.add.text(x, y + offsetY + 4, '', {
      fontSize: '9px', color: '#ffcc00',
    }).setDepth(3);
  }

  // ── 우측: 서빙/버프 레시피 (2열 컴팩트) ──

  _createRecipePanel() {
    const col1X = 100;
    const col2X = 230;
    const y = KITCHEN_PANEL_Y + 2;

    // 서빙 섹션 라벨
    this.scene.add.text(col1X, y, '서빙', {
      fontSize: '9px', color: '#ffcc00',
    }).setDepth(2);

    this.serveButtons = [];
    let offsetY = 12;
    for (const recipe of SERVING_RECIPES) {
      const btn = this._createRecipeButton(col1X, y + offsetY, recipe, 'serve');
      this.serveButtons.push(btn);
      offsetY += 18;
    }

    // 버프 섹션 라벨
    this.scene.add.text(col2X, y, '버프', {
      fontSize: '9px', color: '#88ccff',
    }).setDepth(2);

    this.buffButtons = [];
    let offsetY2 = 12;
    for (const recipe of BUFF_RECIPES) {
      const btn = this._createRecipeButton(col2X, y + offsetY2, recipe, 'buff');
      this.buffButtons.push(btn);
      offsetY2 += 18;
    }
  }

  /**
   * 레시피 버튼 하나 생성 (컴팩트).
   * @param {number} x
   * @param {number} y
   * @param {object} recipe
   * @param {'serve'|'buff'} type
   */
  _createRecipeButton(x, y, recipe, type) {
    // 필요 재료 요약 (아이콘만)
    const ingStr = Object.entries(recipe.ingredients)
      .map(([id, cnt]) => `${INGREDIENT_TYPES[id]?.icon || id}${cnt}`)
      .join('');

    const label = type === 'serve'
      ? `${recipe.icon || ''} ${recipe.nameKo} ${ingStr}`
      : `${recipe.nameKo} ${ingStr}`;

    const bg = this.scene.add.rectangle(
      x + 60, y + 7, 120, 16, 0x333355
    ).setDepth(2).setInteractive();

    const text = this.scene.add.text(x + 2, y + 1, label, {
      fontSize: '9px', color: '#ffffff',
    }).setDepth(3);

    bg.on('pointerdown', () => {
      if (type === 'serve') {
        this.callbacks.onServeRecipe(recipe.id);
      } else {
        // 탭 즉시 효과 설명 미리보기 표시 (조리 전 확인용)
        this._buffActiveText.setText(`📖 ${recipe.nameKo}\n${recipe.effectDesc}`);
        this.callbacks.onBuffRecipe(recipe.id);
      }
    });

    return { bg, text, recipe };
  }

  // ── 조리 진행 바 ──

  _createCookingBar() {
    const y = KITCHEN_PANEL_Y + KITCHEN_PANEL_HEIGHT - 18;

    // 조리 진행 배경
    this.cookBarBg = this.scene.add.rectangle(
      GAME_WIDTH / 2, y, GAME_WIDTH - 20, 12, 0x222222
    ).setDepth(2).setVisible(false);

    // 조리 진행 바
    this.cookBar = this.scene.add.rectangle(
      10, y, 0, 12, 0xff8800
    ).setOrigin(0, 0.5).setDepth(3).setVisible(false);

    // 조리 텍스트
    this.cookText = this.scene.add.text(
      GAME_WIDTH / 2, y, '', {
        fontSize: '9px', color: '#ffffff', fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(4).setVisible(false);

    // 완성 요리 표시
    this.readyText = this.scene.add.text(
      GAME_WIDTH / 2, y, '', {
        fontSize: '9px', color: '#44ff44', fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(4).setVisible(false);
  }

  /**
   * 재료 보유량 UI 갱신.
   */
  updateIngredients() {
    const inv = this.ingredientManager.inventory;
    for (const [id, info] of Object.entries(INGREDIENT_TYPES)) {
      const count = inv[id] || 0;
      if (this.ingredientTexts[id]) {
        this.ingredientTexts[id].setText(`${info.icon}${info.nameKo}: ${count}`);
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
   * 조리 상태 + 완성 요리 표시 갱신.
   * @param {{ recipeId: string, timer: number, totalTime: number }|null} cookingSlot
   * @param {string[]} readyDishes
   */
  updateCookingState(cookingSlot, readyDishes) {
    if (cookingSlot) {
      // 조리 중 → 진행 바 표시
      const recipe = SERVING_RECIPE_MAP[cookingSlot.recipeId];
      const progress = 1 - (cookingSlot.timer / cookingSlot.totalTime);
      const maxW = GAME_WIDTH - 20;

      this.cookBarBg.setVisible(true);
      this.cookBar.setVisible(true);
      this.cookBar.width = maxW * Math.max(0, Math.min(1, progress));
      this.cookText.setVisible(true);
      this.cookText.setText(
        `🍳 ${recipe?.nameKo || cookingSlot.recipeId} 조리중... ${Math.ceil(cookingSlot.timer / 1000)}초`
      );
      this.readyText.setVisible(false);
    } else if (readyDishes.length > 0) {
      // 완성 요리 있음
      this.cookBarBg.setVisible(false);
      this.cookBar.setVisible(false);
      this.cookText.setVisible(false);
      this.readyText.setVisible(true);
      const names = readyDishes.map(id => SERVING_RECIPE_MAP[id]?.nameKo || id).join(', ');
      this.readyText.setText(`✅ 완성: ${names} (${readyDishes.length}/2)`);
    } else {
      // 유휴
      this.cookBarBg.setVisible(false);
      this.cookBar.setVisible(false);
      this.cookText.setVisible(false);
      this.readyText.setVisible(false);
    }
  }

  /**
   * 버프 활성 텍스트 표시.
   * @param {string} buffName
   */
  /**
   * @param {string} buffName
   * @param {string} [effectDesc]
   */
  showActiveBuff(buffName, effectDesc) {
    const desc = effectDesc ? `\n${effectDesc}` : '';
    this._buffActiveText.setText(`⚡ ${buffName}${desc}`);
  }

  clearBuffText() {
    this._buffActiveText.setText('');
  }

  destroy() {
    // Phaser가 씬 종료 시 자동 정리하므로 추가 정리 불필요
  }
}
