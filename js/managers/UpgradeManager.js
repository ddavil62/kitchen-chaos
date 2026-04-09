/**
 * @fileoverview 업그레이드 매니저.
 * Phase 5: 현재 업그레이드 레벨 조회, 효과값 계산, 구매 처리.
 */

import { UPGRADE_DEFS } from '../data/upgradeData.js';
import { SaveManager } from './SaveManager.js';

export class UpgradeManager {
  /**
   * 현재 업그레이드 레벨 조회.
   * @param {string} upgradeId
   * @returns {number} 0 ~ maxLevel
   */
  static getLevel(upgradeId) {
    const data = SaveManager.load();
    return data.upgrades?.[upgradeId] || 0;
  }

  /**
   * 다음 레벨 구매 비용. 맥스 레벨이면 -1 반환.
   * @param {string} upgradeId
   * @returns {number}
   */
  static getNextCost(upgradeId) {
    const def = UPGRADE_DEFS[upgradeId];
    if (!def) return -1;
    const lvl = UpgradeManager.getLevel(upgradeId);
    if (lvl >= def.maxLevel) return -1;
    return def.costs[lvl];
  }

  /**
   * 업그레이드 구매 시도.
   * @param {string} upgradeId
   * @returns {boolean} 구매 성공 여부
   */
  static purchase(upgradeId) {
    const cost = UpgradeManager.getNextCost(upgradeId);
    if (cost < 0) return false;

    const data = SaveManager.load();
    if ((data.kitchenCoins || 0) < cost) return false;

    data.kitchenCoins -= cost;
    if (!data.upgrades) data.upgrades = {};
    data.upgrades[upgradeId] = (data.upgrades[upgradeId] || 0) + 1;
    SaveManager.save(data);
    return true;
  }

  // ── 효과값 계산 헬퍼 ──

  /**
   * 냉장고 확장: 재료 최대 보유량 추가분.
   * @returns {number} 기본값에 더할 보유량 (0, 2, 4, 6, 8, 10)
   */
  static getFridgeBonus() {
    return UpgradeManager.getLevel('fridge') * UPGRADE_DEFS.fridge.effectPerLevel;
  }

  /**
   * 예리한 칼: 공격속도 보너스 배율.
   * @returns {number} 1.0 ~ 1.25 (fireRate를 나눌 값)
   */
  static getKnifeMultiplier() {
    return 1 + UpgradeManager.getLevel('knife') * UPGRADE_DEFS.knife.effectPerLevel;
  }

  /**
   * 빠른 배달: 수거 속도 보너스 배율.
   * @returns {number} 1.0 ~ 1.6 (collectInterval을 나눌 값)
   */
  static getDeliverySpeedMultiplier() {
    return 1 + UpgradeManager.getLevel('delivery_speed') * UPGRADE_DEFS.delivery_speed.effectPerLevel;
  }

  /**
   * 조리 특훈: 조리 시간 감소 배율.
   * @returns {number} 1.0 ~ 0.7 (cookTime에 곱할 값)
   */
  static getCookTrainingMultiplier() {
    return 1 - UpgradeManager.getLevel('cook_training') * UPGRADE_DEFS.cook_training.effectPerLevel;
  }
}
