/**
 * @fileoverview 레스토랑 씬.
 * GameScene과 병렬 실행. 손님 관리, 서빙, 버프 요리를 처리한다.
 * 화면 하단 220px (Y: 420~640) 영역을 소유한다.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, RESTAURANT_HEIGHT } from '../config.js';
import { BUFF_RECIPES, SERVING_RECIPE_MAP } from '../data/gameData.js';
import { GameEventBus } from '../events/GameEventBus.js';
import { CustomerManager } from '../managers/CustomerManager.js';
import { CustomerZoneUI } from '../ui/CustomerZoneUI.js';
import { KitchenPanelUI } from '../ui/KitchenPanelUI.js';

export class RestaurantScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RestaurantScene' });
  }

  /**
   * @param {{ ingredientManager: import('../managers/IngredientManager.js').IngredientManager }} data
   */
  create(data) {
    // 카메라를 하단 220px 영역에만 렌더링
    this.cameras.main.setViewport(0, 420, GAME_WIDTH, RESTAURANT_HEIGHT);
    this.cameras.main.setScroll(0, 0);

    // IngredientManager는 GameScene 소속이지만 참조를 받아 사용
    this.ingredientManager = data.ingredientManager;

    // ── 매니저 ──
    this.customerManager = new CustomerManager(this, this.ingredientManager);

    // ── 버프 상태 (CookingStation 로직을 인라인으로 간소화) ──
    this.activeBuff = null;

    // ── UI ──
    this.customerZoneUI = new CustomerZoneUI(this, {
      onServe: (slotIndex) => this._onServe(slotIndex),
    });

    this.kitchenPanelUI = new KitchenPanelUI(this, {
      onServeRecipe: (recipeId) => this._onServeRecipe(recipeId),
      onBuffRecipe: (recipeId) => this._onBuffRecipe(recipeId),
    }, this.ingredientManager);

    // ── GameEventBus 이벤트 리스닝 ──
    GameEventBus.on('ingredient_collected', this._onIngredientCollected, this);
    GameEventBus.on('wave_started', this._onWaveStarted, this);
    GameEventBus.on('game_over', this._onGameOver, this);

    // 초기 재료 UI 갱신
    this.kitchenPanelUI.updateIngredients();
  }

  // ── GameEventBus 핸들러 ──

  /** 웨이브 시작 → 손님 배치 */
  _onWaveStarted({ waveNum }) {
    this.customerManager.spawnCustomers(waveNum - 1);
  }

  /** 재료 수거 → UI 갱신 */
  _onIngredientCollected() {
    this.kitchenPanelUI.updateIngredients();
    this.customerZoneUI.updateButtonStates(this.ingredientManager);
  }

  /** 게임 종료 → 정리 */
  _onGameOver() {
    this.customerManager.clear();
  }

  // ── 서빙 처리 ──

  /**
   * 손님 슬롯 서빙 버튼 탭.
   * @param {number} slotIndex
   */
  _onServe(slotIndex) {
    const result = this.customerManager.serve(slotIndex);
    if (result.success) {
      // 골드를 GameScene에 전달
      GameEventBus.emit('gold_earned', {
        amount: result.totalGold,
        source: 'serving',
      });
      GameEventBus.emit('combo_changed', {
        count: this.customerManager.comboCount,
      });

      // 서빙 성공 이펙트
      this._showGoldPopup(result.totalGold, result.tip, result.comboBonus);

      // UI 갱신
      this.kitchenPanelUI.updateIngredients();
      this.customerZoneUI.updateButtonStates(this.ingredientManager);
    }
  }

  /**
   * 주방 패널에서 서빙 레시피 직접 탭 → 해당 주문의 손님에게 서빙.
   * @param {string} recipeId
   */
  _onServeRecipe(recipeId) {
    // 해당 요리를 주문한 손님 찾기
    for (let i = 0; i < this.customerManager.slots.length; i++) {
      const cust = this.customerManager.slots[i];
      if (cust && cust.dish === recipeId) {
        this._onServe(i);
        return;
      }
    }
  }

  /**
   * 버프 레시피 탭 → 타워 버프 적용.
   * @param {string} recipeId
   */
  _onBuffRecipe(recipeId) {
    const recipe = BUFF_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    // 재료 소비
    if (!this.ingredientManager.consume(recipe.ingredients)) return;

    // 기존 버프 덮어쓰기
    this.activeBuff = { recipe, timer: recipe.duration };

    // GameScene에 버프 전달
    GameEventBus.emit('buff_activated', {
      effectType: recipe.effectType,
      effectValue: recipe.effectValue,
      duration: recipe.duration,
    });

    this.kitchenPanelUI.showActiveBuff(recipe.nameKo);
    this.kitchenPanelUI.updateIngredients();
    this.customerZoneUI.updateButtonStates(this.ingredientManager);
  }

  // ── 이펙트 ──

  /**
   * 골드 획득 팝업.
   * @param {number} total
   * @param {number} tip
   * @param {number} comboBonus
   */
  _showGoldPopup(total, tip, comboBonus) {
    let text = `+${total}g`;
    if (tip > 0) text += ` (팁 +${tip})`;
    if (comboBonus > 0) text += ` 콤보!`;

    const popup = this.add.text(GAME_WIDTH / 2, 50, text, {
      fontSize: '16px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: popup,
      y: popup.y - 40, alpha: 0,
      duration: 1000,
      onComplete: () => popup.destroy(),
    });
  }

  // ── 메인 루프 ──

  update(time, delta) {
    // 손님 인내심 감소
    this.customerManager.update(delta);

    // 손님 게이지 UI 갱신
    this.customerZoneUI.update();

    // 버프 타이머
    if (this.activeBuff) {
      this.activeBuff.timer -= delta;
      if (this.activeBuff.timer <= 0) {
        this.activeBuff = null;
        GameEventBus.emit('buff_expired');
        this.kitchenPanelUI.clearBuffText();
      }
    }

    // 콤보 리셋 감지 (customer_left 이벤트로 처리되므로 여기서는 HUD만 갱신)
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
