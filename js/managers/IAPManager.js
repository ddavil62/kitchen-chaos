/**
 * @fileoverview 인앱 결제 매니저 (스텁).
 * Phase 81: "광고 제거" 상품의 기초 구조만 준비한다.
 * Phase 84: 스킨 구매 스텁 메서드 및 상품 ID 추가.
 * 실제 결제 플로우(영수증 검증 등)는 Phase 범위 밖.
 * isAdsRemoved()는 localStorage 기반 단순 플래그로 구현한다.
 */

import { SkinManager } from './SkinManager.js';

/** 광고 제거 상품 ID (스토어 등록 후 실제 ID로 교체) */
export const REMOVE_ADS_PRODUCT_ID = 'com.lazyslime.kitchenchaos.removeads';

/** 스킨 상품 ID 맵 */
export const SKIN_PRODUCT_IDS = {
  skin_mimi_pink: 'com.lazyslime.kitchenchaos.skin.mimi.pink',
  skin_mimi_blue: 'com.lazyslime.kitchenchaos.skin.mimi.blue',
};

/** localStorage 키 */
const ADS_REMOVED_KEY = 'kc_ads_removed';

/** 스킨별 localStorage 플래그 키 생성 헬퍼 */
const skinKey = (skinId) => `kc_skin_owned_${skinId}`;

export class IAPManager {
  /**
   * 광고 제거 상품을 구매한다 (스텁).
   * Phase 81 범위: 콘솔 로그만 출력한다.
   * 실제 구현 시 @capacitor-community/in-app-purchases 연동 필요.
   * @returns {Promise<void>}
   */
  static async purchaseRemoveAds() {
    console.log('[IAPManager] purchaseRemoveAds() 호출 — 스텁 (미구현)');
  }

  /**
   * 광고 제거 구매 여부를 반환한다.
   * @returns {boolean}
   */
  static isAdsRemoved() {
    return localStorage.getItem(ADS_REMOVED_KEY) === '1';
  }

  /**
   * 스킨을 구매한다 (스텁).
   * Phase 84 범위: localStorage 플래그 즉시 소유 처리 + SkinManager.unlockSkin() 호출.
   * 실제 구현 시 @capacitor-community/in-app-purchases 연동 필요.
   * @param {string} chefId - 셰프 ID
   * @param {string} skinId - 스킨 ID
   * @returns {Promise<boolean>} 성공 여부 (스텁은 항상 true)
   */
  static async purchaseSkin(chefId, skinId) {
    console.log('[IAPManager] purchaseSkin()', chefId, skinId, '— 스텁');
    localStorage.setItem(skinKey(skinId), '1');
    SkinManager.unlockSkin(chefId, skinId);
    return true;
  }

  /**
   * 스킨 구매 여부를 반환한다.
   * localStorage 플래그 또는 SaveManager.unlockedSkins 양쪽을 체크한다.
   * @param {string} chefId
   * @param {string} skinId
   * @returns {boolean}
   */
  static isSkinOwned(chefId, skinId) {
    if (localStorage.getItem(skinKey(skinId)) === '1') return true;
    return SkinManager.isSkinOwned(chefId, skinId);
  }
}
