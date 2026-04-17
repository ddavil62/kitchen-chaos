/**
 * @fileoverview 업적 매니저.
 * Phase 42: 업적 해금 조건 판정, 진행도 추적, 토스트 알림 발행. 보상은 AchievementScene에서 수령 시 지급.
 *
 * StoryManager 패턴을 답습한 정적 클래스.
 * 씬 생명주기와 독립적으로 동작하며 SaveManager만 참조한다.
 */

import { ACHIEVEMENTS } from '../data/achievementData.js';
import { SaveManager } from './SaveManager.js';
import { VFXManager } from './VFXManager.js';

export class AchievementManager {
  /**
   * 업적 조건 체크 진입점.
   * 지정된 type에 해당하는 업적들을 순회하며 조건 충족 시 해금 처리한다.
   * @param {Phaser.Scene|null} scene - 토스트 알림을 표시할 씬 (null이면 토스트 생략)
   * @param {string} type - 조건 유형 식별자 (예: 'stage_cleared')
   * @param {number} [value=0] - chapter_cleared에서 최고 챕터 번호 등 외부 전달 값
   */
  static check(scene, type, value = 0) {
    const data = SaveManager.load();
    // achievements 필드 보장
    if (!data.achievements) {
      data.achievements = { unlocked: {}, claimed: {}, progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 } };
    }

    const candidates = ACHIEVEMENTS.filter(a => a.condition.type === type);

    for (const ach of candidates) {
      // 이미 해금된 항목은 건너뜀
      if (data.achievements.unlocked[ach.id]) continue;

      if (AchievementManager._evaluate(data, ach, value)) {
        AchievementManager._unlock(scene, data, ach);
      }
    }
  }

  /**
   * 누적 진행도 카운터 업데이트.
   * enemy_total_killed, boss_killed, total_gold_earned 등 이벤트 발생 시 호출.
   * @param {string} type - 카운터 키
   * @param {number} [amount=1] - 증가량
   */
  static increment(type, amount = 1) {
    const data = SaveManager.load();
    if (!data.achievements) {
      data.achievements = { unlocked: {}, claimed: {}, progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 } };
    }
    if (!data.achievements.progress) {
      data.achievements.progress = { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 };
    }
    data.achievements.progress[type] = (data.achievements.progress[type] || 0) + amount;
    SaveManager.save(data);
  }

  /**
   * 업적 목록과 현재 진행도를 반환한다 (AchievementScene 렌더링용).
   * @returns {Array<{
   *   id: string, nameKo: string, descKo: string, category: string, icon: string,
   *   condition: object, reward: object,
   *   unlocked: boolean, claimed: boolean, current: number, threshold: number
   * }>}
   */
  static getProgress() {
    const data = SaveManager.load();
    const ach = data.achievements || { unlocked: {}, claimed: {}, progress: {} };

    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: !!ach.unlocked[a.id],
      claimed: !!ach.claimed[a.id],
      current: AchievementManager._getCurrentValue(data, a),
      threshold: a.condition.threshold,
    }));
  }

  // ── 내부 메서드 ──

  /**
   * 단일 업적의 조건 충족 여부를 평가한다.
   * @param {object} data - 세이브 데이터
   * @param {object} ach - 업적 정의
   * @param {number} value - 외부 전달 값
   * @returns {boolean}
   * @private
   */
  static _evaluate(data, ach, value) {
    const { type, threshold } = ach.condition;
    const current = AchievementManager._getCurrentValue(data, ach);
    return current >= threshold;
  }

  /**
   * 업적의 현재 진행 값을 데이터에서 산출한다.
   * @param {object} data - 세이브 데이터
   * @param {object} ach - 업적 정의
   * @returns {number}
   * @private
   */
  static _getCurrentValue(data, ach) {
    const { type } = ach.condition;
    const progress = data.achievements?.progress || {};

    switch (type) {
      case 'stage_cleared':
        return Object.values(data.stages || {}).filter(s => s.cleared).length;

      case 'chapter_cleared': {
        // 클리어된 스테이지에서 최고 챕터 추출
        let maxChapter = 0;
        for (const stageId of Object.keys(data.stages || {})) {
          if (data.stages[stageId]?.cleared) {
            const ch = parseInt(stageId.split('-')[0]);
            if (ch > maxChapter) maxChapter = ch;
          }
        }
        return maxChapter;
      }

      case 'three_star_count':
        return Object.values(data.stages || {}).filter(s => s.stars === 3).length;

      case 'enemy_total_killed':
        return progress.enemy_total_killed || 0;

      case 'boss_killed':
        return progress.boss_killed || 0;

      case 'tool_count_placed':
        return AchievementManager._countToolTypes(data);

      case 'recipe_unlocked':
        return (data.unlockedRecipes || []).length;

      case 'total_gold_earned':
        return progress.total_gold_earned || 0;

      case 'staff_hired':
        return AchievementManager._countStaffHired(data);

      case 'interior_maxed':
        return AchievementManager._countInteriorMaxed(data);

      case 'endless_wave':
        return data.endless?.bestWave || 0;

      case 'endless_score':
        return data.endless?.bestScore || 0;

      default:
        return 0;
    }
  }

  /**
   * 업적 해금 처리 + 세이브 + 토스트. 보상은 AchievementScene._claimReward()에서 지급.
   * @param {Phaser.Scene|null} scene
   * @param {object} data
   * @param {object} ach
   * @private
   */
  static _unlock(scene, data, ach) {
    data.achievements.unlocked[ach.id] = true;

    // 보상은 _claimReward()에서만 지급 (이중 지급 방지)
    SaveManager.save(data);

    // 토스트 알림 (씬이 활성 상태일 때만)
    if (scene) {
      VFXManager.achievementToast(scene, ach.nameKo);
    }
  }

  /**
   * tools 객체에서 count > 0인 종류 수를 센다.
   * @param {object} data
   * @returns {number}
   * @private
   */
  static _countToolTypes(data) {
    if (!data.tools) return 0;
    return Object.values(data.tools).filter(t => t.count > 0).length;
  }

  /**
   * staff 객체에서 고용된 직원 수를 센다.
   * @param {object} data
   * @returns {number}
   * @private
   */
  static _countStaffHired(data) {
    if (!data.staff) return 0;
    return Object.values(data.staff).filter(v => v === true).length;
  }

  /**
   * interiors 객체에서 Lv5인 항목 수를 센다.
   * @param {object} data
   * @returns {number}
   * @private
   */
  static _countInteriorMaxed(data) {
    if (!data.interiors) return 0;
    return Object.values(data.interiors).filter(v => v >= 5).length;
  }
}
