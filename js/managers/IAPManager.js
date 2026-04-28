/**
 * @fileoverview 인앱 결제 매니저 (스텁).
 * Phase 81: "광고 제거" 상품의 기초 구조만 준비한다.
 * 실제 결제 플로우(영수증 검증 등)는 Phase 범위 밖.
 * isAdsRemoved()는 localStorage 기반 단순 플래그로 구현한다.
 */

/** 광고 제거 상품 ID (스토어 등록 후 실제 ID로 교체) */
export const REMOVE_ADS_PRODUCT_ID = 'com.lazyslime.kitchenchaos.removeads';

/** localStorage 키 */
const ADS_REMOVED_KEY = 'kc_ads_removed';

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
}
