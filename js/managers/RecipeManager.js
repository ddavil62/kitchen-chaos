/**
 * @fileoverview 레시피 매니저.
 * Phase 5: 레시피 해금 상태 관리, 해금 가능 여부 판정, 필터링.
 */

import { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES, ALL_RECIPES, STARTER_RECIPE_IDS, RECIPE_MAP } from '../data/recipeData.js';
import { SaveManager } from './SaveManager.js';

export class RecipeManager {
  /**
   * 레시피가 해금되었는지 확인.
   * 스타터 레시피는 항상 해금.
   * @param {string} recipeId
   * @returns {boolean}
   */
  static isUnlocked(recipeId) {
    if (STARTER_RECIPE_IDS.includes(recipeId)) return true;
    return SaveManager.isRecipeUnlocked(recipeId);
  }

  /**
   * 레시피가 상점에서 해금 가능한지 (게이트 스테이지 클리어 여부).
   * 이미 해금된 레시피는 false 반환.
   * @param {string} recipeId
   * @returns {boolean}
   */
  static canUnlock(recipeId) {
    if (RecipeManager.isUnlocked(recipeId)) return false;

    const recipe = RECIPE_MAP[recipeId];
    if (!recipe) return false;

    // 게이트 스테이지 확인
    if (recipe.gateStage) {
      const data = SaveManager.load();
      if (!data.stages[recipe.gateStage]?.cleared) return false;
    }

    return true;
  }

  /**
   * 레시피가 상점에 표시되어야 하는지 (게이트 충족 여부만).
   * 해금 여부와 무관하게 게이트를 통과했으면 표시.
   * @param {string} recipeId
   * @returns {boolean}
   */
  static isVisible(recipeId) {
    const recipe = RECIPE_MAP[recipeId];
    if (!recipe) return false;
    if (recipe.starter) return true;

    if (recipe.gateStage) {
      const data = SaveManager.load();
      return !!data.stages[recipe.gateStage]?.cleared;
    }
    return true; // 게이트 없으면 항상 표시
  }

  /**
   * 코인으로 레시피 해금 시도.
   * @param {string} recipeId
   * @returns {boolean} 성공 여부
   */
  static purchaseRecipe(recipeId) {
    if (!RecipeManager.canUnlock(recipeId)) return false;

    const recipe = RECIPE_MAP[recipeId];
    if (!recipe || recipe.unlockCost <= 0) return false;

    const data = SaveManager.load();
    if ((data.kitchenCoins || 0) < recipe.unlockCost) return false;

    data.kitchenCoins -= recipe.unlockCost;
    if (!data.unlockedRecipes) data.unlockedRecipes = [];
    data.unlockedRecipes.push(recipeId);
    SaveManager.save(data);
    return true;
  }

  /**
   * 현재 해금된 서빙 레시피 목록.
   * @returns {object[]}
   */
  static getUnlockedServingRecipes() {
    return ALL_SERVING_RECIPES.filter(r => RecipeManager.isUnlocked(r.id));
  }

  /**
   * 현재 해금된 버프 레시피 목록.
   * @returns {object[]}
   */
  static getUnlockedBuffRecipes() {
    return ALL_BUFF_RECIPES.filter(r => RecipeManager.isUnlocked(r.id));
  }

  /**
   * 컬렉션 진행률.
   * @returns {{ unlocked: number, total: number, percent: number }}
   */
  static getCollectionProgress() {
    const total = ALL_RECIPES.length;
    const unlocked = ALL_RECIPES.filter(r => RecipeManager.isUnlocked(r.id)).length;
    return {
      unlocked,
      total,
      percent: Math.round((unlocked / total) * 100 * 10) / 10,
    };
  }

  /**
   * 카테고리별 필터링된 전체 레시피.
   * @param {string} category - 'all' 또는 카테고리 ID
   * @returns {object[]}
   */
  static getRecipesByCategory(category) {
    if (category === 'all') return ALL_RECIPES;
    return ALL_RECIPES.filter(r => r.category === category);
  }
}
