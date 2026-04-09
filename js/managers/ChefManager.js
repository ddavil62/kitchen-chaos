/**
 * @fileoverview 셰프 관리자. 선택, 패시브 조회, 스킬 발동.
 * Phase 7-2: 영업 패시브 메서드 추가 (조리시간, 그릴보상, 인내심).
 * Phase 8-6: 영업 액티브 스킬 조회 (getServiceSkill).
 */

import { CHEF_TYPES } from '../data/chefData.js';
import { SaveManager } from './SaveManager.js';

export class ChefManager {
  /** 현재 선택된 셰프 ID 반환 */
  static getSelectedChef() {
    return SaveManager.load().selectedChef || null;
  }

  /**
   * 셰프 선택 (세이브에 저장).
   * @param {string} chefId
   */
  static selectChef(chefId) {
    if (!CHEF_TYPES[chefId]) return;
    const data = SaveManager.load();
    data.selectedChef = chefId;
    SaveManager.save(data);
  }

  /**
   * 현재 셰프 데이터 반환 (없으면 null).
   * @returns {object|null}
   */
  static getChefData() {
    const id = ChefManager.getSelectedChef();
    return id ? CHEF_TYPES[id] : null;
  }

  /**
   * 패시브 값 조회 (해당 타입이면 value, 아니면 0).
   * @param {string} passiveType
   * @returns {number}
   */
  static getPassiveValue(passiveType) {
    const chef = ChefManager.getChefData();
    if (!chef || chef.passiveType !== passiveType) return 0;
    return chef.passiveValue;
  }

  /**
   * 수거 범위 보너스 (petit_chef).
   * @returns {number} 1.0 ~ 1.3
   */
  static getCollectRangeBonus() {
    return 1 + ChefManager.getPassiveValue('collect_range');
  }

  /**
   * 그릴 피해 보너스 (flame_chef).
   * @returns {number} 1.0 ~ 1.2
   */
  static getGrillDamageBonus() {
    return 1 + ChefManager.getPassiveValue('grill_damage');
  }

  /**
   * CC 지속 보너스 (ice_chef).
   * @returns {number} 1.0 ~ 1.25
   */
  static getCCDurationBonus() {
    return 1 + ChefManager.getPassiveValue('cc_duration');
  }

  // ── 영업 패시브 (Phase 7-2) ──

  /**
   * 조리 시간 배율 (petit_chef 선택 시 -15%).
   * @returns {number} 0.85 또는 1.0
   */
  static getCookTimeBonus() {
    const id = ChefManager.getSelectedChef();
    return id === 'petit_chef' ? 0.85 : 1.0;
  }

  /**
   * 그릴 카테고리 요리 보상 배율 (flame_chef 선택 시 +25%).
   * @returns {number} 1.25 또는 1.0
   */
  static getGrillRewardBonus() {
    const id = ChefManager.getSelectedChef();
    return id === 'flame_chef' ? 1.25 : 1.0;
  }

  /**
   * 손님 인내심 배율 (ice_chef 선택 시 +20%).
   * @returns {number} 1.20 또는 1.0
   */
  static getPatienceBonus() {
    const id = ChefManager.getSelectedChef();
    return id === 'ice_chef' ? 1.20 : 1.0;
  }

  // ── 영업 액티브 스킬 (Phase 8-6) ──

  /**
   * 현재 셰프의 영업 액티브 스킬 데이터 반환 (없으면 null).
   * @returns {{ name: string, desc: string, type: string, value?: number, cooldown: number }|null}
   */
  static getServiceSkill() {
    const chef = ChefManager.getChefData();
    return chef?.serviceSkill || null;
  }
}
