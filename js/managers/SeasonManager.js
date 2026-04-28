/**
 * @fileoverview 시즌 패스 매니저.
 * Phase 89: 50단계 XP 진행 시스템. SaveManager.getSeasonPass()로 상태를 읽고,
 * 단계 보상을 지급한다.
 *
 * 정적 클래스 패턴 (WeeklyEventManager/EnergyManager와 동일).
 * SaveManager만 참조하며 IAPManager는 isSeasonPassOwned()로만 참조한다.
 */

import { SaveManager } from './SaveManager.js';
import { IAPManager } from './IAPManager.js';
import { WeeklyEventManager } from './WeeklyEventManager.js';

// ── XP 획득 소스별 기본 XP 테이블 ──

/** @type {Object<string, number>} */
const SEASON_XP_TABLE = {
  stage_clear_1star: 10,
  stage_clear_2star: 10,
  stage_clear_3star: 30,
  daily_mission:     20,
  endless_best_wave: 15,
  event_bonus:       5,
};

// ── 50단계 보상 정의 ──

/**
 * 시즌 보상 테이블 (50단계).
 * 각 항목: { tier, free: {type, amount, extra?}, paid: {type, amount, extra?} }
 * type: 'gold' | 'kitchenCoins' | 'mireukEssence' | 'mimiSkinCoupon'
 * @type {Array<{tier: number, free: {type: string, amount: number, extra?: {type: string, amount: number}}, paid: {type: string, amount: number, extra?: {type: string, amount: number}}}>}
 */
const SEASON_REWARDS = [
  { tier: 1,  free: { type: 'gold',         amount: 100  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 2,  free: { type: 'kitchenCoins', amount: 2   }, paid: { type: 'gold',         amount: 150 } },
  { tier: 3,  free: { type: 'gold',         amount: 100  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 4,  free: { type: 'kitchenCoins', amount: 2   }, paid: { type: 'gold',         amount: 150 } },
  { tier: 5,  free: { type: 'gold',         amount: 300  }, paid: { type: 'mireukEssence', amount: 10 } },
  { tier: 6,  free: { type: 'gold',         amount: 100  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 7,  free: { type: 'kitchenCoins', amount: 2   }, paid: { type: 'gold',         amount: 150 } },
  { tier: 8,  free: { type: 'gold',         amount: 100  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 9,  free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 200 } },
  { tier: 10, free: { type: 'kitchenCoins', amount: 5   }, paid: { type: 'kitchenCoins', amount: 10 } },
  { tier: 11, free: { type: 'gold',         amount: 150  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 12, free: { type: 'kitchenCoins', amount: 2   }, paid: { type: 'gold',         amount: 200 } },
  { tier: 13, free: { type: 'gold',         amount: 150  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 14, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 200 } },
  { tier: 15, free: { type: 'gold',         amount: 500  }, paid: { type: 'kitchenCoins', amount: 10 } },
  { tier: 16, free: { type: 'gold',         amount: 150  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 17, free: { type: 'kitchenCoins', amount: 2   }, paid: { type: 'gold',         amount: 200 } },
  { tier: 18, free: { type: 'gold',         amount: 150  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 19, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 20, free: { type: 'mireukEssence', amount: 20 }, paid: { type: 'gold',         amount: 1000 } },
  { tier: 21, free: { type: 'gold',         amount: 150  }, paid: { type: 'kitchenCoins', amount: 2  } },
  { tier: 22, free: { type: 'kitchenCoins', amount: 2   }, paid: { type: 'gold',         amount: 200 } },
  { tier: 23, free: { type: 'gold',         amount: 150  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 24, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 25, free: { type: 'kitchenCoins', amount: 8   }, paid: { type: 'kitchenCoins', amount: 15 } },
  { tier: 26, free: { type: 'gold',         amount: 200  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 27, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 28, free: { type: 'gold',         amount: 200  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 29, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 30, free: { type: 'gold',         amount: 800  }, paid: { type: 'gold',         amount: 1200 } },
  { tier: 31, free: { type: 'gold',         amount: 200  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 32, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 33, free: { type: 'gold',         amount: 200  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 34, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 35, free: { type: 'mireukEssence', amount: 30 }, paid: { type: 'kitchenCoins', amount: 15 } },
  { tier: 36, free: { type: 'gold',         amount: 200  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 37, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 38, free: { type: 'gold',         amount: 200  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 39, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 250 } },
  { tier: 40, free: { type: 'kitchenCoins', amount: 12  }, paid: { type: 'mimiSkinCoupon', amount: 1 } },
  { tier: 41, free: { type: 'gold',         amount: 250  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 42, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 300 } },
  { tier: 43, free: { type: 'gold',         amount: 250  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 44, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 300 } },
  { tier: 45, free: { type: 'gold',         amount: 250  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 46, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 300 } },
  { tier: 47, free: { type: 'gold',         amount: 250  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 48, free: { type: 'kitchenCoins', amount: 3   }, paid: { type: 'gold',         amount: 300 } },
  { tier: 49, free: { type: 'gold',         amount: 250  }, paid: { type: 'kitchenCoins', amount: 3  } },
  { tier: 50, free: { type: 'gold',         amount: 2000, extra: { type: 'kitchenCoins', amount: 20 } },
              paid: { type: 'kitchenCoins', amount: 30,  extra: { type: 'mireukEssence', amount: 50 } } },
];

export class SeasonManager {
  // ── XP 적립 ──

  /**
   * XP를 적립하고 단계를 갱신한다.
   * @param {string} source - 'stage_clear' | 'daily_mission' | 'endless_best_wave'
   * @param {number} detail - stage_clear: stars(1~3), daily_mission: 1, endless_best_wave: 1
   */
  static addXP(source, detail = 1) {
    const sp = SaveManager.getSeasonPass();

    // 이미 최대 단계(50) 도달 시 XP 적립 불가
    if (sp.currentTier >= 50) return;

    // XP 계산
    let xpGain = 0;
    if (source === 'stage_clear') {
      const stars = detail || 1;
      xpGain = stars >= 3 ? SEASON_XP_TABLE.stage_clear_3star : SEASON_XP_TABLE.stage_clear_1star;
    } else if (source === 'daily_mission') {
      xpGain = SEASON_XP_TABLE.daily_mission;
    } else if (source === 'endless_best_wave') {
      xpGain = SEASON_XP_TABLE.endless_best_wave;
    }

    if (xpGain <= 0) return;

    // 주간 이벤트 보너스: 향후 'season_xp_bonus' 이벤트 추가 시 +5 적용
    // 현재 이벤트 풀에 없으므로 항상 false이지만 훅은 준비해 둔다
    try {
      if (WeeklyEventManager.isActive('season_xp_bonus')) {
        xpGain += SEASON_XP_TABLE.event_bonus;
      }
    } catch { /* WeeklyEventManager 로드 실패 시 무시 */ }

    // XP 갱신
    const newXP = sp.currentXP + xpGain;
    const newTier = SeasonManager._calcTier(newXP);

    // 단계 상승 로깅
    if (newTier > sp.currentTier) {
      console.log(`[SeasonManager] 단계 상승: ${sp.currentTier} -> ${newTier}`);
    }

    SaveManager.updateSeasonXP(newXP, newTier);
  }

  // ── 상태 조회 ──

  /**
   * 현재 시즌 패스 데이터를 반환한다.
   * @returns {{ currentXP: number, currentTier: number, hasPaidPass: boolean, claimedFree: number[], claimedPaid: number[], seasonId: string }}
   */
  static getState() {
    const sp = SaveManager.getSeasonPass();
    // hasPaidPass는 IAPManager의 상태와 동기화
    sp.hasPaidPass = IAPManager.isSeasonPassOwned();
    return sp;
  }

  /**
   * 현재 단계 반환.
   * @returns {number} 0~50
   */
  static getTier() {
    return SaveManager.getSeasonPass().currentTier;
  }

  /**
   * 현재 XP 반환.
   * @returns {number}
   */
  static getXP() {
    return SaveManager.getSeasonPass().currentXP;
  }

  /**
   * 다음 단계까지 필요한 XP를 반환한다.
   * @returns {number} 다음 단계 달성까지 남은 XP (최대 단계 시 0)
   */
  static getNextTierXP() {
    const sp = SaveManager.getSeasonPass();
    if (sp.currentTier >= 50) return 0;
    const nextTierTotal = SeasonManager._getCumulativeXPForTier(sp.currentTier + 1);
    return Math.max(0, nextTierTotal - sp.currentXP);
  }

  /**
   * 특정 단계의 보상 정의를 반환한다.
   * @param {number} tier - 1~50
   * @returns {{ tier: number, free: object, paid: object } | null}
   */
  static getRewardDef(tier) {
    return SEASON_REWARDS.find((r) => r.tier === tier) ?? null;
  }

  // ── 보상 수령 ──

  /**
   * 무료 보상 수령 가능 여부.
   * @param {number} tier - 1~50
   * @returns {boolean}
   */
  static canClaimFree(tier) {
    const sp = SaveManager.getSeasonPass();
    return sp.currentTier >= tier && !sp.claimedFree.includes(tier);
  }

  /**
   * 유료 보상 수령 가능 여부 (유료 패스 보유 필수).
   * @param {number} tier - 1~50
   * @returns {boolean}
   */
  static canClaimPaid(tier) {
    const sp = SaveManager.getSeasonPass();
    return sp.currentTier >= tier &&
           !sp.claimedPaid.includes(tier) &&
           IAPManager.isSeasonPassOwned();
  }

  /**
   * 무료 또는 유료 보상을 수령한다.
   * @param {number} tier - 1~50
   * @param {'free'|'paid'} track
   * @returns {boolean} 수령 성공 여부
   */
  static claimReward(tier, track) {
    const data = SaveManager.load();
    if (!data.seasonPass) return false;

    const sp = data.seasonPass;
    const rewardDef = SeasonManager.getRewardDef(tier);
    if (!rewardDef) return false;

    if (track === 'free') {
      if (sp.currentTier < tier) return false;
      if (sp.claimedFree.includes(tier)) return false;
      SeasonManager._grantSeasonReward(data, rewardDef.free);
      sp.claimedFree.push(tier);
    } else if (track === 'paid') {
      if (sp.currentTier < tier) return false;
      if (sp.claimedPaid.includes(tier)) return false;
      if (!IAPManager.isSeasonPassOwned()) return false;
      SeasonManager._grantSeasonReward(data, rewardDef.paid);
      sp.claimedPaid.push(tier);
    } else {
      return false;
    }

    SaveManager.save(data);
    return true;
  }

  /**
   * 수령 가능한 보상 목록을 반환한다 (달성 단계 범위 + 미수령).
   * @returns {{ tier: number, track: 'free'|'paid' }[]}
   */
  static getClaimable() {
    const sp = SaveManager.getSeasonPass();
    const hasPaid = IAPManager.isSeasonPassOwned();
    const result = [];

    for (let t = 1; t <= sp.currentTier && t <= 50; t++) {
      if (!sp.claimedFree.includes(t)) {
        result.push({ tier: t, track: 'free' });
      }
      if (hasPaid && !sp.claimedPaid.includes(t)) {
        result.push({ tier: t, track: 'paid' });
      }
    }
    return result;
  }

  /**
   * 수령 가능한 보상 개수를 반환한다 (배지 표시용).
   * @returns {number}
   */
  static getPendingCount() {
    return SeasonManager.getClaimable().length;
  }

  // ── 내부 헬퍼 ──

  /**
   * 보상을 실제 지급한다 (내부 전용).
   * @param {object} data - 세이브 데이터 (직접 수정)
   * @param {{ type: string, amount: number, extra?: {type: string, amount: number} }} reward
   * @private
   */
  static _grantSeasonReward(data, reward) {
    switch (reward.type) {
      case 'gold':
        data.gold = (data.gold || 0) + reward.amount;
        break;
      case 'kitchenCoins':
        data.kitchenCoins = (data.kitchenCoins || 0) + reward.amount;
        break;
      case 'mireukEssence':
        data.mireukEssence = Math.min(999, (data.mireukEssence ?? 0) + reward.amount);
        data.mireukEssenceTotal = (data.mireukEssenceTotal ?? 0) + reward.amount;
        break;
      case 'mimiSkinCoupon':
        data.mimiSkinCoupons = (data.mimiSkinCoupons || 0) + reward.amount;
        break;
      default:
        console.warn(`[SeasonManager] 알 수 없는 보상 타입: ${reward.type}`);
    }

    // 복합 보상 (tier 50 등) 처리: extra 필드가 있으면 추가 지급
    if (reward.extra) {
      SeasonManager._grantSeasonReward(data, reward.extra);
    }
  }

  /**
   * 누적 XP에서 현재 단계를 계산한다.
   * @param {number} xp - 누적 XP
   * @returns {number} 달성 단계 (0~50)
   * @private
   */
  static _calcTier(xp) {
    for (let tier = 1; tier <= 50; tier++) {
      if (xp < SeasonManager._getCumulativeXPForTier(tier)) {
        return tier - 1;
      }
    }
    return 50; // 모든 단계 달성
  }

  /**
   * 특정 단계 달성에 필요한 총 누적 XP를 반환한다.
   * @param {number} tier - 1~50
   * @returns {number}
   * @private
   */
  static _getCumulativeXPForTier(tier) {
    let total = 0;
    for (let t = 1; t <= tier; t++) {
      if (t <= 10) total += 100;
      else if (t <= 25) total += 150;
      else if (t <= 40) total += 200;
      else total += 250;
    }
    return total;
  }

  /**
   * 현재 단계 내 진행 XP와 현재 단계 소요 XP를 반환한다 (진행 바 렌더링용).
   * @returns {{ currentInTier: number, tierXP: number }}
   */
  static getProgressInTier() {
    const sp = SaveManager.getSeasonPass();
    if (sp.currentTier >= 50) return { currentInTier: 0, tierXP: 0 };

    const prevCumulative = sp.currentTier > 0
      ? SeasonManager._getCumulativeXPForTier(sp.currentTier)
      : 0;
    const nextCumulative = SeasonManager._getCumulativeXPForTier(sp.currentTier + 1);
    const tierXP = nextCumulative - prevCumulative;
    const currentInTier = sp.currentXP - prevCumulative;

    return { currentInTier: Math.max(0, currentInTier), tierXP };
  }
}
