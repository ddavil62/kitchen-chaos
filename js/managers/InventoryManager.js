/**
 * @fileoverview 재료 인벤토리 매니저.
 * 장보기(MarketScene)에서 수집한 재료를 관리한다.
 * 영업(ServiceScene)으로 전달할 재고 데이터를 제공한다.
 */

/**
 * 재료 인벤토리를 관리하는 클래스.
 * IngredientManager와 별개로, 순수하게 재료 수량만 추적한다.
 */
export default class InventoryManager {
  constructor() {
    /** @type {Object<string, number>} 재료별 수량 */
    this.inventory = {};
  }

  /**
   * 재료를 추가한다.
   * @param {string} type - 재료 타입 ID (예: 'carrot', 'meat')
   * @param {number} [amount=1] - 추가할 수량
   */
  add(type, amount = 1) {
    this.inventory[type] = (this.inventory[type] || 0) + amount;
  }

  /**
   * 재료를 소비한다 (버프 레시피용).
   * 재료가 부족하면 소비하지 않고 false를 반환한다.
   * @param {string} type - 재료 타입 ID
   * @param {number} [amount=1] - 소비할 수량
   * @returns {boolean} 소비 성공 여부
   */
  consume(type, amount = 1) {
    if ((this.inventory[type] || 0) < amount) return false;
    this.inventory[type] -= amount;
    return true;
  }

  /**
   * 레시피 재료 요구사항을 일괄 소비한다.
   * 모든 재료가 충분해야 소비가 진행된다.
   * @param {{ [type: string]: number }} requirements - 재료 요구사항 맵
   * @returns {boolean} 소비 성공 여부
   */
  consumeRecipe(requirements) {
    if (!this.hasEnough(requirements)) return false;
    for (const [type, amount] of Object.entries(requirements)) {
      this.inventory[type] -= amount;
    }
    return true;
  }

  /**
   * 전체 재고를 복사본으로 반환한다.
   * @returns {Object<string, number>}
   */
  getAll() {
    return { ...this.inventory };
  }

  /**
   * 레시피에 필요한 재료가 충분한지 확인한다.
   * @param {{ [type: string]: number }} requirements - 재료 요구사항 맵 (예: { carrot: 2, meat: 1 })
   * @returns {boolean}
   */
  hasEnough(requirements) {
    return Object.entries(requirements).every(
      ([type, amount]) => (this.inventory[type] || 0) >= amount
    );
  }

  /**
   * 전체 재료 수의 합계를 반환한다.
   * @returns {number}
   */
  getTotal() {
    return Object.values(this.inventory).reduce((sum, n) => sum + n, 0);
  }
}
