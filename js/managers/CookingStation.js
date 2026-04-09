/**
 * @fileoverview 조리소 매니저.
 * 레시피 쿡 및 타워 버프 효과를 관리한다.
 */

import { RECIPES } from '../data/gameData.js';

export class CookingStation {
  /**
   * @param {Phaser.Scene} scene
   * @param {IngredientManager} ingredientManager
   */
  constructor(scene, ingredientManager) {
    this.scene = scene;
    this.ingredientManager = ingredientManager;

    /** @type {{ recipe: object, timer: number }|null} 현재 활성 버프 */
    this.activeBuff = null;
  }

  /**
   * 레시피 요리 시도.
   * @param {string} recipeId
   * @returns {boolean} 성공 여부
   */
  cook(recipeId) {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;

    // 재료 소모 시도
    if (!this.ingredientManager.consume(recipe.ingredients)) return false;

    // 기존 버프 덮어쓰기 (마지막 요리가 우선)
    this.activeBuff = {
      recipe,
      timer: recipe.duration,
    };

    // 타워에 버프 적용
    this._applyBuffToTowers(recipe);

    this.scene.events.emit('buff_activated', recipe);
    return true;
  }

  /**
   * 모든 타워에 버프 적용.
   * @private
   */
  _applyBuffToTowers(recipe) {
    const towers = this.scene.towers ? this.scene.towers.getChildren() : [];
    towers.forEach(tower => {
      if (tower.applyBuff) {
        if (recipe.effectType === 'buff_speed') tower.applyBuff('speed', recipe.effectValue);
        else if (recipe.effectType === 'buff_damage') tower.applyBuff('damage', recipe.effectValue);
        else if (recipe.effectType === 'buff_both') tower.applyBuff('both', recipe.effectValue);
      }
    });
  }

  /**
   * 새로 설치된 타워에 현재 버프 적용.
   * @param {Tower} tower
   */
  applyBuffToNewTower(tower) {
    if (!this.activeBuff || !tower.applyBuff) return;
    const recipe = this.activeBuff.recipe;
    if (recipe.effectType === 'buff_speed') tower.applyBuff('speed', recipe.effectValue);
    else if (recipe.effectType === 'buff_damage') tower.applyBuff('damage', recipe.effectValue);
    else if (recipe.effectType === 'buff_both') tower.applyBuff('both', recipe.effectValue);
  }

  /**
   * 매 프레임 업데이트 - 버프 타이머 관리.
   * @param {number} delta - ms
   */
  update(delta) {
    if (!this.activeBuff) return;

    this.activeBuff.timer -= delta;
    if (this.activeBuff.timer <= 0) {
      this._removeAllBuffs();
      this.activeBuff = null;
      this.scene.events.emit('buff_expired');
    }
  }

  /**
   * 모든 타워에서 버프 해제.
   * @private
   */
  _removeAllBuffs() {
    const towers = this.scene.towers ? this.scene.towers.getChildren() : [];
    towers.forEach(tower => {
      if (tower.removeBuff) tower.removeBuff();
    });
  }

  /**
   * 현재 버프 남은 시간 비율 (0~1).
   * @returns {number}
   */
  getBuffProgress() {
    if (!this.activeBuff) return 0;
    return this.activeBuff.timer / this.activeBuff.recipe.duration;
  }

  /**
   * 현재 활성 버프 이름.
   * @returns {string|null}
   */
  getBuffName() {
    return this.activeBuff ? this.activeBuff.recipe.nameKo : null;
  }

  /** RECIPES 데이터 접근자 */
  get recipes() {
    return RECIPES;
  }
}
