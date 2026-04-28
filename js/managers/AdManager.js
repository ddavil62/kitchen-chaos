/**
 * @fileoverview 광고 매니저.
 * Phase 81: Capacitor AdMob 플러그인을 추상화한다.
 * window.Capacitor 유무로 앱/웹 환경을 감지하여
 * DEV(웹) 환경에서는 광고 없이 즉시 onReward 콜백을 실행한다.
 * IAPManager.isAdsRemoved()가 true이면 항상 DEV 폴백과 동일하게 동작한다.
 */

import { IAPManager } from './IAPManager.js';

// Phase 81: 테스트 Unit ID (실 배포 전 교체 필요)
const REWARDED_AD_UNIT_ID_ANDROID = 'ca-app-pub-3940256099942544/5224354917'; // 구글 테스트 ID

export class AdManager {
  /** @private 광고 준비 완료 여부 (앱 환경에서만 유효) */
  static _adReady = false;

  /**
   * 현재 환경이 Capacitor 앱인지 반환한다.
   * @returns {boolean}
   * @private
   */
  static _isApp() {
    return !!window?.Capacitor;
  }

  /**
   * 앱 초기화 시 AdMob 플러그인 초기화 및 광고 사전 로드.
   * DEV(웹) 환경에서는 즉시 반환.
   * main.js 또는 BootScene에서 1회 호출.
   * @returns {Promise<void>}
   */
  static async initAds() {
    if (!AdManager._isApp() || IAPManager.isAdsRemoved()) {
      console.log('[AdManager] DEV/광고제거 환경 — initAds 스킵');
      return;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.initialize({ initializeForTesting: true });

      // 리워드 광고 사전 로드
      await AdMob.prepareRewardVideoAd({
        adId: REWARDED_AD_UNIT_ID_ANDROID,
      });
      AdManager._adReady = true;
      console.log('[AdManager] 리워드 광고 준비 완료');
    } catch (e) {
      console.warn('[AdManager] initAds 실패:', e);
      AdManager._adReady = false;
    }
  }

  /**
   * 광고가 재생 가능한 상태인지 반환한다.
   * DEV 환경 또는 광고 제거 구매 시 항상 true.
   * @returns {boolean}
   */
  static isAdReady() {
    if (!AdManager._isApp() || IAPManager.isAdsRemoved()) return true;
    return AdManager._adReady;
  }

  /**
   * 리워드 광고를 재생한다.
   * DEV 환경 또는 광고 제거 구매 완료 시 즉시 onReward 호출.
   * 앱 환경에서 광고 미준비 시 onFail 호출.
   * @param {Function} onReward - 광고 시청 완료 후 실행할 콜백
   * @param {Function} [onFail] - 광고 미준비/실패 시 실행할 콜백
   * @returns {void}
   */
  static showRewardedAd(onReward, onFail) {
    // DEV(웹) 환경 또는 광고 제거 구매 시 즉시 보상
    if (!AdManager._isApp() || IAPManager.isAdsRemoved()) {
      console.log('[AdManager] DEV/광고제거 — 즉시 onReward 호출');
      if (onReward) onReward();
      return;
    }

    // 앱 환경: 광고 미준비 시 onFail
    if (!AdManager._adReady) {
      console.warn('[AdManager] 광고 미준비 — onFail 호출');
      if (onFail) onFail();
      return;
    }

    // 앱 환경: AdMob 리워드 광고 노출
    (async () => {
      try {
        const { AdMob } = await import('@capacitor-community/admob');

        // 리워드 리스너 등록
        AdMob.addListener('onRewardedVideoAdReward', () => {
          if (onReward) onReward();
          // 다음 광고 사전 로드
          AdManager._adReady = false;
          AdMob.prepareRewardVideoAd({
            adId: REWARDED_AD_UNIT_ID_ANDROID,
          }).then(() => {
            AdManager._adReady = true;
          }).catch(() => {
            AdManager._adReady = false;
          });
        });

        AdMob.addListener('onRewardedVideoAdFailedToLoad', () => {
          AdManager._adReady = false;
          if (onFail) onFail();
        });

        await AdMob.showRewardVideoAd();
      } catch (e) {
        console.warn('[AdManager] showRewardedAd 실패:', e);
        AdManager._adReady = false;
        if (onFail) onFail();
      }
    })();
  }
}
