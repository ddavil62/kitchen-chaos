/**
 * @fileoverview 오더 매니저. 웨이브 시작 시 오더 생성, 진행 추적, 보상 판정.
 */

import { ORDER_TEMPLATES, ORDER_CHANCE, ORDER_MIN_WAVE } from '../data/orderData.js';

export class OrderManager {
  constructor() {
    /** @type {object|null} 현재 활성 오더 */
    this.currentOrder = null;
    /** @type {number} 현재 진행도 */
    this.progress = 0;
    /** @type {boolean} 완료 여부 */
    this.completed = false;
    /** @type {boolean} 실패 여부 (웨이브 종료 시 미달) */
    this.failed = false;
  }

  /**
   * 웨이브 시작 시 오더 생성 시도.
   * @param {number} waveNum 현재 웨이브 번호
   * @param {number} [maxEnemyCount=Infinity] 이번 웨이브 실제 적 총 수 (달성 불가 kill_count 필터링용)
   * @returns {object|null} 생성된 오더 또는 null
   */
  tryGenerateOrder(waveNum, maxEnemyCount = Infinity) {
    this.currentOrder = null;
    this.progress = 0;
    this.completed = false;
    this.failed = false;

    if (waveNum < ORDER_MIN_WAVE) return null;
    if (Math.random() > ORDER_CHANCE) return null;

    // kill_count 오더는 이번 웨이브 적 수 이하인 것만 허용
    const feasible = ORDER_TEMPLATES.filter(
      o => o.type !== 'kill_count' || o.target <= maxEnemyCount
    );
    if (feasible.length === 0) return null;

    const idx = Math.floor(Math.random() * feasible.length);
    this.currentOrder = { ...feasible[idx] };
    return this.currentOrder;
  }

  /**
   * 진행도 증가 (이벤트 발생 시 호출).
   * @param {string} type 이벤트 타입 (kill_count, collect_count, enemy_leaked)
   * @param {number} [amount=1] 증가량
   */
  addProgress(type, amount = 1) {
    if (!this.currentOrder || this.completed) return;
    if (this.currentOrder.type !== type) {
      // no_leak는 특별 처리: 적 통과 시 즉시 실패
      if (this.currentOrder.type === 'no_leak' && type === 'enemy_leaked') {
        this.failed = true;
      }
      return;
    }
    this.progress += amount;
    if (this.progress >= this.currentOrder.target) {
      this.completed = true;
    }
  }

  /**
   * 웨이브 종료 시 호출 -- 보상 반환 또는 null.
   * @returns {{ gold: number, coin: number, descKo: string }|null}
   */
  resolveOrder() {
    if (!this.currentOrder) return null;
    if (this.completed) {
      return {
        gold: this.currentOrder.rewardGold,
        coin: this.currentOrder.rewardCoin,
        descKo: this.currentOrder.descKo,
      };
    }
    // no_leak 타입: 실패하지 않았으면 성공
    if (this.currentOrder.type === 'no_leak' && !this.failed) {
      this.completed = true;
      return {
        gold: this.currentOrder.rewardGold,
        coin: this.currentOrder.rewardCoin,
        descKo: this.currentOrder.descKo,
      };
    }
    return null; // 미달성
  }

  /**
   * 현재 오더 정보 반환.
   * @returns {{ descKo: string, progress: number, target: number, completed: boolean, failed: boolean, type: string }|null}
   */
  getStatus() {
    if (!this.currentOrder) return null;
    return {
      descKo: this.currentOrder.descKo,
      progress: this.progress,
      target: this.currentOrder.target,
      completed: this.completed,
      failed: this.failed,
      type: this.currentOrder.type,
    };
  }
}
