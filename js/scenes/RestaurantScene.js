/**
 * @fileoverview 레스토랑 씬.
 * Phase 3: 조리 시간 시스템 추가. 요리 시작→타이머→완성→서빙.
 * readyDishes 배열로 완성된 요리를 관리한다.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, RESTAURANT_HEIGHT } from '../config.js';
import { BUFF_RECIPES, SERVING_RECIPE_MAP } from '../data/gameData.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { GameEventBus } from '../events/GameEventBus.js';
import { CustomerManager } from '../managers/CustomerManager.js';
import { CustomerZoneUI } from '../ui/CustomerZoneUI.js';
import { KitchenPanelUI } from '../ui/KitchenPanelUI.js';

export class RestaurantScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RestaurantScene' });
  }

  /** @param {{ ingredientManager: IngredientManager, customers?: object[] }} data */
  create(data) {
    this.cameras.main.setViewport(0, 420, GAME_WIDTH, RESTAURANT_HEIGHT);
    this.cameras.main.setScroll(0, 0);

    this.ingredientManager = data.ingredientManager;

    // ── 조리 시스템 ──
    /** @type {{ recipeId: string, timer: number, totalTime: number }|null} */
    this.cookingSlot = null;
    /** @type {string[]} 완성된 요리 ID 목록 (최대 2개) */
    this.readyDishes = [];

    // ── 매니저 ──
    this.customerManager = new CustomerManager(this, this.ingredientManager, data.customers);

    // ── 버프 상태 ──
    this.activeBuff = null;

    // ── UI ──
    this.customerZoneUI = new CustomerZoneUI(this, {
      onServe: (slotIndex) => this._onServe(slotIndex),
    });

    this.kitchenPanelUI = new KitchenPanelUI(this, {
      onServeRecipe: (recipeId) => this._onServeRecipe(recipeId),
      onBuffRecipe: (recipeId) => this._onBuffRecipe(recipeId),
    }, this.ingredientManager);

    // ── GameEventBus ──
    GameEventBus.on('ingredient_collected', this._onIngredientCollected, this);
    GameEventBus.on('wave_started', this._onWaveStarted, this);
    GameEventBus.on('game_over', this._onGameOver, this);

    this.kitchenPanelUI.updateIngredients();

    // 씬 종료 시 정리
    this.events.once('shutdown', this.shutdown, this);
  }

  // ── GameEventBus 핸들러 ──

  _onWaveStarted({ waveNum }) {
    this.customerManager.spawnCustomers(waveNum - 1);
  }

  _onIngredientCollected() {
    this.kitchenPanelUI.updateIngredients();
    this._updateAllButtons();
  }

  _onGameOver() {
    this.customerManager.clear();
  }

  // ── 조리 시스템 ──

  /**
   * 서빙 레시피 버튼 탭 → 조리 시작.
   * @param {string} recipeId
   */
  _onServeRecipe(recipeId) {
    // 이미 조리 중이면 무시
    if (this.cookingSlot) return;
    // 완성 요리 2개 제한
    if (this.readyDishes.length >= 2) return;

    const recipe = SERVING_RECIPE_MAP[recipeId];
    if (!recipe) return;

    // 재료 확인 + 소비
    if (!this.ingredientManager.canCook(recipe)) return;
    this.ingredientManager.consume(recipe);

    // 조리 시작 (cook_training 업그레이드 반영)
    const cookMult = UpgradeManager.getCookTrainingMultiplier();
    const effectiveCookTime = Math.round((recipe.cookTime || 3000) * cookMult);
    this.cookingSlot = {
      recipeId,
      timer: effectiveCookTime,
      totalTime: effectiveCookTime,
    };

    this.kitchenPanelUI.updateIngredients();
    this._updateAllButtons();
  }

  /**
   * 손님 슬롯 서빙 버튼 탭 → 완성된 요리로 서빙.
   * @param {number} slotIndex
   */
  _onServe(slotIndex) {
    const customer = this.customerManager.slots[slotIndex];
    if (!customer) return;

    // 완성된 요리 중 일치하는 것 찾기
    const dishIdx = this.readyDishes.indexOf(customer.dish);
    if (dishIdx === -1) return;

    // 요리 소비
    this.readyDishes.splice(dishIdx, 1);

    // 서빙 처리
    const result = this.customerManager.serve(slotIndex);
    if (result.success) {
      GameEventBus.emit('gold_earned', { amount: result.totalGold, source: 'serving' });
      GameEventBus.emit('combo_changed', { count: this.customerManager.comboCount });
      GameEventBus.emit('serve_success');
      this._showGoldPopup(result.totalGold, result.tip, result.comboBonus);
    }

    this.kitchenPanelUI.updateIngredients();
    this._updateAllButtons();
  }

  /**
   * 버프 레시피 탭.
   * @param {string} recipeId
   */
  _onBuffRecipe(recipeId) {
    const recipe = BUFF_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    if (!this.ingredientManager.consume(recipe.ingredients)) return;

    this.activeBuff = { recipe, timer: recipe.duration };
    GameEventBus.emit('buff_activated', {
      effectType: recipe.effectType,
      effectValue: recipe.effectValue,
      duration: recipe.duration,
    });

    this.kitchenPanelUI.showActiveBuff(recipe.nameKo);
    this.kitchenPanelUI.updateIngredients();
    this._updateAllButtons();
  }

  /** 서빙 버튼 + 레시피 버튼 상태 일괄 갱신 */
  _updateAllButtons() {
    this.customerZoneUI.updateButtonStates(this.ingredientManager, this.readyDishes);
    this.kitchenPanelUI.updateCookingState(this.cookingSlot, this.readyDishes);
  }

  // ── 이펙트 ──

  _showGoldPopup(total, tip, comboBonus) {
    let text = `+${total}g`;
    if (tip > 0) text += ` (팁 +${tip})`;
    if (comboBonus > 0) text += ` 콤보!`;

    const popup = this.add.text(GAME_WIDTH / 2, 50, text, {
      fontSize: '16px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: popup, y: popup.y - 40, alpha: 0,
      duration: 1000,
      onComplete: () => popup.destroy(),
    });
  }

  // ── 메인 루프 ──

  update(time, delta) {
    // 손님 인내심 감소
    this.customerManager.update(delta);
    this.customerZoneUI.update();

    // 조리 타이머
    if (this.cookingSlot) {
      this.cookingSlot.timer -= delta;
      if (this.cookingSlot.timer <= 0) {
        // 조리 완성
        this.readyDishes.push(this.cookingSlot.recipeId);
        this.cookingSlot = null;
        this._updateAllButtons();
      }
      // 진행률 UI 갱신
      this.kitchenPanelUI.updateCookingState(this.cookingSlot, this.readyDishes);
    }

    // 버프 타이머
    if (this.activeBuff) {
      this.activeBuff.timer -= delta;
      if (this.activeBuff.timer <= 0) {
        this.activeBuff = null;
        GameEventBus.emit('buff_expired');
        this.kitchenPanelUI.clearBuffText();
      }
    }
  }

  shutdown() {
    GameEventBus.off('ingredient_collected', this._onIngredientCollected, this);
    GameEventBus.off('wave_started', this._onWaveStarted, this);
    GameEventBus.off('game_over', this._onGameOver, this);
    this.customerManager?.destroy();
    this.customerZoneUI?.destroy();
    this.kitchenPanelUI?.destroy();
  }
}
