/**
 * @fileoverview 손님 매니저.
 * RestaurantScene 소속. 웨이브별 손님 생성, 인내심 타이머, 서빙 처리, 콤보 시스템을 관리한다.
 */

import { WAVE_CUSTOMERS, SERVING_RECIPE_MAP } from '../data/gameData.js';

export class CustomerManager {
  /**
   * @param {Phaser.Scene} scene - RestaurantScene
   * @param {import('../managers/IngredientManager.js').IngredientManager} ingredientManager
   */
  constructor(scene, ingredientManager) {
    this.scene = scene;
    this.ingredientManager = ingredientManager;

    /** @type {(CustomerSlot|null)[]} 최대 3슬롯 */
    this.slots = [null, null, null];
    /** @type {CustomerData[]} 대기 손님 큐 */
    this.waitQueue = [];

    this.comboCount = 0;
    this.totalServed = 0;
    this.totalLeft = 0;
  }

  /**
   * 웨이브 시작 시 손님 배치.
   * @param {number} waveIndex - 0-based
   */
  spawnCustomers(waveIndex) {
    const waveData = WAVE_CUSTOMERS[waveIndex];
    if (!waveData) return;

    // 2초 간격으로 순차 등장
    waveData.customers.forEach((custData, i) => {
      this.scene.time.delayedCall(i * 2000, () => {
        this._addCustomer(custData);
      });
    });
  }

  /**
   * 손님을 빈 슬롯에 추가하거나 대기열에 넣는다.
   * @param {object} custData
   * @private
   */
  _addCustomer(custData) {
    const recipe = SERVING_RECIPE_MAP[custData.dish];
    if (!recipe) return;

    const customer = {
      dish: custData.dish,
      recipe,
      patience: custData.patience,
      maxPatience: custData.patience,
      baseReward: custData.baseReward,
      tipMultiplier: custData.tipMultiplier,
    };

    const emptySlot = this.slots.indexOf(null);
    if (emptySlot !== -1) {
      this.slots[emptySlot] = customer;
      this.scene.events.emit('customer_arrived', { slotIndex: emptySlot, customer });
    } else if (this.waitQueue.length < 2) {
      this.waitQueue.push(customer);
    }
    // 대기열 초과 시 무시
  }

  /**
   * 손님에게 서빙 시도.
   * @param {number} slotIndex - 0~2
   * @returns {{ success: boolean, totalGold?: number, baseReward?: number, tip?: number, comboBonus?: number }}
   */
  serve(slotIndex) {
    const customer = this.slots[slotIndex];
    if (!customer) return { success: false };

    const recipe = customer.recipe;

    // 재료 충족 확인
    if (!this.ingredientManager.canCook(recipe)) {
      return { success: false };
    }

    // 재료 소비
    this.ingredientManager.consume(recipe);

    // 팁 등급 계산
    const patienceRatio = customer.patience / customer.maxPatience;
    let tipGrade;
    if (patienceRatio >= 0.7) {
      tipGrade = customer.tipMultiplier;  // 대만족
    } else if (patienceRatio >= 0.4) {
      tipGrade = 1.0;                     // 보통
    } else {
      tipGrade = 0.7;                     // 불만
    }

    // 콤보 보너스
    this.comboCount++;
    const comboMult = this.getComboMultiplier();

    const baseReward = customer.baseReward;
    const tip = Math.floor(baseReward * (tipGrade - 1));
    const comboBonus = Math.floor(baseReward * tipGrade * (comboMult - 1));
    const totalGold = Math.floor(baseReward * tipGrade * comboMult);

    // 슬롯 비우기
    this.slots[slotIndex] = null;
    this.totalServed++;

    this.scene.events.emit('customer_served', {
      slotIndex,
      totalGold,
      baseReward,
      tip,
      comboBonus,
      comboCount: this.comboCount,
      patienceRatio,
    });

    // 대기열에서 다음 손님 배치
    this._promoteFromQueue(slotIndex);

    return { success: true, totalGold, baseReward, tip, comboBonus };
  }

  /**
   * 대기열의 첫 손님을 지정 슬롯에 배치.
   * @param {number} slotIndex
   * @private
   */
  _promoteFromQueue(slotIndex) {
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      this.slots[slotIndex] = next;
      this.scene.events.emit('customer_arrived', { slotIndex, customer: next });
    }
  }

  /**
   * 매 프레임 호출 — 인내심 감소 + 퇴장 처리.
   * @param {number} delta - ms
   */
  update(delta) {
    for (let i = 0; i < this.slots.length; i++) {
      const cust = this.slots[i];
      if (!cust) continue;

      cust.patience -= delta;

      if (cust.patience <= 0) {
        // 손님 퇴장
        this.slots[i] = null;
        this.totalLeft++;
        this.comboCount = 0;  // 콤보 리셋

        this.scene.events.emit('customer_left', { slotIndex: i });
        this._promoteFromQueue(i);
      }
    }
  }

  /**
   * 콤보 보너스 배율.
   * @returns {number}
   */
  getComboMultiplier() {
    if (this.comboCount >= 8) return 1.50;
    if (this.comboCount >= 5) return 1.25;
    if (this.comboCount >= 3) return 1.10;
    return 1.0;
  }

  /**
   * 모든 손님/대기열 제거.
   */
  clear() {
    this.slots = [null, null, null];
    this.waitQueue = [];
  }

  destroy() {
    this.clear();
  }
}
