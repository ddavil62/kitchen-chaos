/**
 * @fileoverview 에너지 매니저.
 * Phase 87: 스테이지 진입 게이트 역할. 최대 5개, 30분 자동 충전, 리워드 광고 즉시 충전.
 *
 * 정적 클래스 패턴 (SaveManager/LoginBonusManager와 동일).
 * 씬 생명주기와 독립적으로 동작하며 SaveManager만 참조한다.
 */

import { SaveManager } from './SaveManager.js';
import { IAPManager } from './IAPManager.js';
import { WeeklyEventManager } from './WeeklyEventManager.js';
import { ENERGY_MAX, ENERGY_RECHARGE_MINUTES } from '../config.js';

/** 1회 충전에 필요한 밀리초 */
const RECHARGE_MS = ENERGY_RECHARGE_MINUTES * 60 * 1000;

export class EnergyManager {
  // ── 내부 유틸 ──

  /**
   * 세이브에서 에너지 상태를 읽어온다.
   * @returns {{ energy: number, energyLastRecharge: number }}
   * @private
   */
  static _getState() {
    const data = SaveManager.load();
    return {
      energy: data.energy ?? ENERGY_MAX,
      energyLastRecharge: data.energyLastRecharge ?? Date.now(),
    };
  }

  /**
   * 에너지 상태를 세이브에 기록한다.
   * @param {number} energy - 현재 에너지
   * @param {number} energyLastRecharge - 마지막 충전 기록 시각 (Unix ms)
   * @private
   */
  static _saveState(energy, energyLastRecharge) {
    SaveManager.setEnergyState(energy, energyLastRecharge);
  }

  // ── 공개 API ──

  /**
   * 앱/씬 재진입 시 경과 시간 기반으로 에너지 자동 충전을 일괄 적용한다.
   * 만충 상태이면 계산을 건너뛴다.
   * @returns {number} 실제 충전된 에너지 개수
   */
  static applyAutoRecharge() {
    const state = EnergyManager._getState();
    if (state.energy >= ENERGY_MAX) return 0;

    const elapsedMs = Date.now() - state.energyLastRecharge;
    const elapsedCharge = Math.floor(elapsedMs / RECHARGE_MS);
    if (elapsedCharge <= 0) return 0;

    const newEnergy = Math.min(state.energy + elapsedCharge, ENERGY_MAX);
    const chargedCount = newEnergy - state.energy;
    // 충전된 횟수만큼 기준 시각을 전진 (만충 시 현재 시각으로 리셋)
    const newLastRecharge = newEnergy >= ENERGY_MAX
      ? Date.now()
      : state.energyLastRecharge + (elapsedCharge * RECHARGE_MS);
    EnergyManager._saveState(newEnergy, newLastRecharge);
    return chargedCount;
  }

  /**
   * 현재 에너지를 반환한다.
   * @returns {number}
   */
  static getEnergy() {
    return EnergyManager._getState().energy;
  }

  /**
   * 최대 에너지를 반환한다.
   * @returns {number}
   */
  static getMax() {
    return ENERGY_MAX;
  }

  /**
   * 플레이 가능 여부를 반환한다.
   * 광고 제거 구매자, 에너지 축제 이벤트 활성, 또는 에너지가 1 이상이면 true.
   * @returns {boolean}
   */
  static canPlay() {
    if (IAPManager.isAdsRemoved()) return true;
    // Phase 88: 에너지 축제 이벤트 활성 시 에너지 0이어도 진입 가능
    if (WeeklyEventManager.isActive('energy_festival')) return true;
    return EnergyManager._getState().energy >= 1;
  }

  /**
   * 에너지 1개를 소비한다.
   * 광고 제거 구매자는 차감 없이 true를 반환한다.
   * @returns {boolean} 소비 성공 여부
   */
  static consume() {
    if (IAPManager.isAdsRemoved()) return true;

    // ── Phase 88: 에너지 축제 이벤트 활성 시 소비 면제 ──
    if (WeeklyEventManager.isActive('energy_festival')) return true;

    const state = EnergyManager._getState();
    if (state.energy < 1) return false;

    const wasMax = state.energy >= ENERGY_MAX;
    const newEnergy = state.energy - 1;
    // 만충에서 처음 소비 시 충전 타이머를 현재 시각으로 시작
    const newLastRecharge = wasMax ? Date.now() : state.energyLastRecharge;
    EnergyManager._saveState(newEnergy, newLastRecharge);
    return true;
  }

  /**
   * 에너지를 추가한다 (광고 보상 등).
   * ENERGY_MAX를 초과하지 않는다.
   * @param {number} [amount=1] - 추가할 에너지 수
   */
  static addEnergy(amount = 1) {
    const state = EnergyManager._getState();
    const newEnergy = Math.min(state.energy + amount, ENERGY_MAX);
    // 만충 도달 시 lastRecharge를 현재 시각으로 리셋
    const newLastRecharge = newEnergy >= ENERGY_MAX
      ? Date.now()
      : state.energyLastRecharge;
    EnergyManager._saveState(newEnergy, newLastRecharge);
  }

  /**
   * 다음 에너지 1개 충전까지 남은 초를 반환한다.
   * 만충 상태이면 0을 반환한다.
   * @returns {number} 남은 초 (0 이상)
   */
  static getRechargeCountdown() {
    const state = EnergyManager._getState();
    if (state.energy >= ENERGY_MAX) return 0;

    const elapsedMs = Date.now() - state.energyLastRecharge;
    const remainMs = RECHARGE_MS - (elapsedMs % RECHARGE_MS);
    return Math.max(0, Math.ceil(remainMs / 1000));
  }
}
