/**
 * @fileoverview 로그인 보너스 매니저.
 * Phase 75B: 7일 연속 로그인 캘린더. D+1 미미 스킨 쿠폰, D+7 미력의 정수 100.
 *
 * DailyMissionManager와 동일한 정적 클래스 패턴.
 * 씬 생명주기와 독립적으로 동작하며 SaveManager만 참조한다.
 */

import { SaveManager } from './SaveManager.js';

// ── 7일 로그인 보상 테이블 ──

/** @type {Array<{day: number, type: string, amount: number, descKo: string}>} */
const LOGIN_REWARDS = [
  { day: 1, type: 'mimiSkinCoupons', amount: 1,   descKo: '미미 스킨 쿠폰 x1' },
  { day: 2, type: 'gold',            amount: 100,  descKo: '골드 x100' },
  { day: 3, type: 'kitchenCoins',    amount: 5,    descKo: '주방 코인 x5' },
  { day: 4, type: 'gold',            amount: 200,  descKo: '골드 x200' },
  { day: 5, type: 'kitchenCoins',    amount: 10,   descKo: '주방 코인 x10' },
  { day: 6, type: 'mireukEssence',   amount: 30,   descKo: '미력의 정수 x30' },
  { day: 7, type: 'mireukEssence',   amount: 100,  descKo: '미력의 정수 x100' },
];

export { LOGIN_REWARDS };

export class LoginBonusManager {
  // ── 내부 유틸 ──

  /**
   * 로컬 Date 기반 'YYYY-MM-DD' 날짜 키를 반환한다.
   * @returns {string}
   * @private
   */
  static _getDateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * 어제 날짜의 'YYYY-MM-DD' 키를 반환한다.
   * @returns {string}
   * @private
   */
  static _getYesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ── 공개 API ──

  /**
   * 매일 최초 접속 시 로그인 보너스를 체크하고 지급한다.
   * MenuScene.create()에서 호출한다.
   */
  static checkAndGrantDaily() {
    try {
      const data = SaveManager.load();
      if (!data.loginBonus) {
        data.loginBonus = { loginStreak: 0, lastLoginDate: '', claimedDays: [] };
      }

      const today = LoginBonusManager._getDateKey();
      const lb = data.loginBonus;

      // 이미 오늘 처리됨
      if (lb.lastLoginDate === today) return;

      const yesterday = LoginBonusManager._getYesterdayKey();

      if (lb.lastLoginDate === yesterday) {
        // 연속 로그인
        lb.loginStreak += 1;
      } else {
        // 단절 또는 첫 로그인 — streak 리셋
        lb.loginStreak = 1;
        lb.claimedDays = [];
      }

      // 보상 지급
      const currentDay = lb.loginStreak;
      const rewardDef = LOGIN_REWARDS.find((r) => r.day === currentDay);
      if (rewardDef) {
        LoginBonusManager._grantReward(data, rewardDef);
        lb.claimedDays.push(currentDay);
      }

      // D+7 완주 후 리셋
      if (lb.loginStreak >= 7) {
        lb.loginStreak = 0;
        lb.claimedDays = [];
      }

      lb.lastLoginDate = today;
      SaveManager.save(data);
    } catch (e) {
      console.warn('[LoginBonusManager] checkAndGrantDaily 오류:', e);
    }
  }

  /**
   * 로그인 보너스 현재 상태를 반환한다 (팝업 표시용).
   * @returns {{loginStreak: number, lastLoginDate: string, claimedDays: number[], rewards: Array}}
   */
  static getLoginBonusState() {
    const data = SaveManager.load();
    const lb = data.loginBonus || { loginStreak: 0, lastLoginDate: '', claimedDays: [] };
    return {
      loginStreak: lb.loginStreak,
      lastLoginDate: lb.lastLoginDate,
      claimedDays: [...lb.claimedDays],
      rewards: LOGIN_REWARDS,
    };
  }

  /**
   * 보상을 지급한다.
   * @param {object} data - 세이브 데이터 (직접 수정, 호출 측에서 save)
   * @param {{type: string, amount: number}} rewardDef - 보상 정의
   * @private
   */
  static _grantReward(data, rewardDef) {
    switch (rewardDef.type) {
      case 'mimiSkinCoupons':
        data.mimiSkinCoupons = (data.mimiSkinCoupons ?? 0) + rewardDef.amount;
        break;
      case 'gold':
        data.gold = (data.gold || 0) + rewardDef.amount;
        break;
      case 'kitchenCoins':
        data.kitchenCoins = (data.kitchenCoins || 0) + rewardDef.amount;
        break;
      case 'mireukEssence':
        data.mireukEssence = Math.min(999, (data.mireukEssence ?? 0) + rewardDef.amount);
        data.mireukEssenceTotal = (data.mireukEssenceTotal ?? 0) + rewardDef.amount;
        break;
      default:
        console.warn(`[LoginBonusManager] 알 수 없는 보상 타입: ${rewardDef.type}`);
    }
  }
}
