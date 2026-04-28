/**
 * @fileoverview 일일 미션 매니저.
 * Phase 75B: 매일 자정 리셋, DAILY_MISSION_POOL에서 3개 선정, 진행도 추적, 보상 지급.
 *
 * AchievementManager.check() 동일 패턴의 정적 클래스.
 * 씬 생명주기와 독립적으로 동작하며 SaveManager만 참조한다.
 */

import { SaveManager } from './SaveManager.js';
import { WeeklyEventManager } from './WeeklyEventManager.js';
import { SeasonManager } from './SeasonManager.js';

// ── 일일 미션 풀 (20종) ──

/** @type {Array<{id: string, type: string, updateMode: string, descKo: string, target: number, reward: {type: string, amount: number}}>} */
const DAILY_MISSION_POOL = [
  { id: 'stage_clear_3',          type: 'stage_clear',          updateMode: 'sum', descKo: '스테이지 3회 클리어',       target: 3,    reward: { type: 'gold', amount: 200 } },
  { id: 'stage_clear_5',          type: 'stage_clear',          updateMode: 'sum', descKo: '스테이지 5회 클리어',       target: 5,    reward: { type: 'gold', amount: 400 } },
  { id: 'gold_earn_500',          type: 'gold_earn',            updateMode: 'sum', descKo: '골드 500 획득',             target: 500,  reward: { type: 'kitchenCoins', amount: 3 } },
  { id: 'gold_earn_1000',         type: 'gold_earn',            updateMode: 'sum', descKo: '골드 1000 획득',            target: 1000, reward: { type: 'kitchenCoins', amount: 6 } },
  { id: 'orders_complete_10',     type: 'orders_complete',      updateMode: 'sum', descKo: '주문 10건 완료',            target: 10,   reward: { type: 'kitchenCoins', amount: 2 } },
  { id: 'orders_complete_20',     type: 'orders_complete',      updateMode: 'sum', descKo: '주문 20건 완료',            target: 20,   reward: { type: 'kitchenCoins', amount: 5 } },
  { id: 'perfect_satisfaction_1', type: 'perfect_satisfaction', updateMode: 'sum', descKo: '만족도 95% 이상 1회 달성', target: 1,    reward: { type: 'mireukEssence', amount: 5 } },
  { id: 'endless_wave_5',         type: 'endless_wave',         updateMode: 'max', descKo: '엔드리스 웨이브 5 이상 도달', target: 5, reward: { type: 'mireukEssence', amount: 10 } },
  { id: 'gather_run_2',           type: 'gather_run',           updateMode: 'sum', descKo: '장보기 2회 진행',           target: 2,    reward: { type: 'kitchenCoins', amount: 3 } },
  { id: 'three_star_1',           type: 'three_star',           updateMode: 'sum', descKo: '별 3개 클리어 1회',         target: 1,    reward: { type: 'gold', amount: 150 } },
  // ── 추가 10종 (Phase 85) ──
  { id: 'stage_clear_7',          type: 'stage_clear',          updateMode: 'sum', descKo: '스테이지 7회 클리어',             target: 7,    reward: { type: 'gold', amount: 600 } },
  { id: 'stage_clear_10',         type: 'stage_clear',          updateMode: 'sum', descKo: '스테이지 10회 클리어',            target: 10,   reward: { type: 'kitchenCoins', amount: 10 } },
  { id: 'orders_complete_30',     type: 'orders_complete',      updateMode: 'sum', descKo: '주문 30건 완료',                  target: 30,   reward: { type: 'kitchenCoins', amount: 8 } },
  { id: 'orders_complete_50',     type: 'orders_complete',      updateMode: 'sum', descKo: '주문 50건 완료',                  target: 50,   reward: { type: 'mireukEssence', amount: 15 } },
  { id: 'three_star_3',           type: 'three_star',           updateMode: 'sum', descKo: '별 3개 클리어 3회',               target: 3,    reward: { type: 'gold', amount: 300 } },
  { id: 'endless_wave_10',        type: 'endless_wave',         updateMode: 'max', descKo: '엔드리스 웨이브 10 이상 도달',    target: 10,   reward: { type: 'mireukEssence', amount: 20 } },
  { id: 'vip_serve_3',            type: 'vip_serve',            updateMode: 'sum', descKo: 'VIP 손님 3명 서빙',              target: 3,    reward: { type: 'gold', amount: 250 } },
  { id: 'vip_serve_5',            type: 'vip_serve',            updateMode: 'sum', descKo: 'VIP 손님 5명 서빙',              target: 5,    reward: { type: 'kitchenCoins', amount: 5 } },
  { id: 'combo_reach_5',          type: 'combo_reach',          updateMode: 'max', descKo: '콤보 5 이상 달성',               target: 5,    reward: { type: 'kitchenCoins', amount: 4 } },
  { id: 'gold_single_run_800',    type: 'gold_single_run',      updateMode: 'max', descKo: '영업 한 판에 골드 800 이상 획득', target: 800,  reward: { type: 'kitchenCoins', amount: 6 } },
];

/** 오늘 선정할 미션 수 */
const DAILY_MISSION_COUNT = 3;

export class DailyMissionManager {
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
   * DAILY_MISSION_POOL에서 중복 없이 N개를 랜덤 선정한다.
   * @returns {string[]} 선정된 미션 ID 배열
   * @private
   */
  static _selectMissions() {
    const pool = [...DAILY_MISSION_POOL];
    const selected = [];
    for (let i = 0; i < DAILY_MISSION_COUNT && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool[idx].id);
      pool.splice(idx, 1);
    }
    return selected;
  }

  // ── 공개 API ──

  /**
   * 날짜 변경 감지 후 미션을 리셋한다.
   * MenuScene.create()에서 호출하여 자정 리셋을 처리한다.
   */
  static checkAndReset() {
    const data = SaveManager.load();
    if (!data.dailyMissions) {
      data.dailyMissions = { dateKey: '', selected: [], progress: {}, completed: {}, claimed: {} };
    }

    const today = DailyMissionManager._getDateKey();
    if (data.dailyMissions.dateKey === today) return; // 이미 오늘 선정됨

    // 새 날짜 — 미션 재선정 + 진행도 초기화
    const selected = DailyMissionManager._selectMissions();
    const progress = {};
    const completed = {};
    const claimed = {};
    for (const id of selected) {
      progress[id] = 0;
      completed[id] = false;
      claimed[id] = false;
    }

    data.dailyMissions = { dateKey: today, selected, progress, completed, claimed };
    SaveManager.save(data);
  }

  /**
   * 당일 선정된 3개 미션 + 각 진행도/완료/수령 상태를 배열로 반환한다.
   * @returns {Array<{id: string, type: string, descKo: string, target: number, reward: object, progress: number, completed: boolean, claimed: boolean}>}
   */
  static getTodayMissions() {
    const data = SaveManager.load();
    const dm = data.dailyMissions || { dateKey: '', selected: [], progress: {}, completed: {}, claimed: {} };

    return dm.selected.map((id) => {
      const def = DAILY_MISSION_POOL.find((m) => m.id === id);
      if (!def) return null;
      return {
        ...def,
        progress: dm.progress[id] || 0,
        completed: !!dm.completed[id],
        claimed: !!dm.claimed[id],
      };
    }).filter(Boolean);
  }

  /**
   * 미션 진행도를 기록한다.
   * type string으로 호출하며, 당일 선정 미션 중 해당 type 항목에 delta를 적용한다.
   * updateMode: 'max' 항목은 Math.max 갱신 방식, 'sum' 항목은 += 누적.
   * 목표 달성 시 자동으로 완료 처리 + 보상 즉시 지급.
   * @param {string} missionType - 미션 type (예: 'stage_clear', 'gold_earn')
   * @param {number} delta - 진행도 증가량 (endless_wave는 현재 웨이브 번호)
   */
  static recordProgress(missionType, delta) {
    try {
      const data = SaveManager.load();
      const dm = data.dailyMissions;
      if (!dm || !dm.selected || dm.selected.length === 0) return;

      let changed = false;
      // Phase 89: addXP는 SaveManager.save() 이후에 호출해야 data race를 방지한다.
      // _grantReward가 data를 in-place 수정한 뒤 save가 일어나기 전에 addXP가
      // 저장하면, 이후 save(data)가 addXP 결과를 덮어쓴다.
      let completedCount = 0;

      for (const id of dm.selected) {
        const def = DAILY_MISSION_POOL.find((m) => m.id === id);
        if (!def || def.type !== missionType) continue;
        if (dm.completed[id]) continue; // 이미 완료된 미션은 건너뜀

        // 진행도 갱신
        // updateMode가 없는 항목은 방어적으로 'sum'으로 처리
        if ((def.updateMode ?? 'sum') === 'max') {
          dm.progress[id] = Math.max(dm.progress[id] || 0, delta);
        } else {
          dm.progress[id] = (dm.progress[id] || 0) + delta;
        }

        // 목표 달성 판정
        if (dm.progress[id] >= def.target) {
          dm.completed[id] = true;
          dm.claimed[id] = true;
          DailyMissionManager._grantReward(data, def.reward);
          completedCount++;
          changed = true;
        } else {
          changed = true;
        }
      }

      if (changed) {
        SaveManager.save(data);
      }

      // save 이후에 addXP를 호출해야 data race 없이 XP가 올바르게 누적된다
      for (let i = 0; i < completedCount; i++) {
        try { SeasonManager.addXP('daily_mission', 1); } catch { /* noop */ }
      }
    } catch (e) {
      // 기존 흐름에 영향 없도록 조용히 실패
      console.warn('[DailyMissionManager] recordProgress 오류:', e);
    }
  }

  /**
   * 완료된 미션 보상을 수령 처리한다 (내부용, 자동 지급이므로 UI 버튼 없이 호출).
   * @param {string} missionId - 미션 ID
   */
  static claimReward(missionId) {
    const data = SaveManager.load();
    const dm = data.dailyMissions;
    if (!dm) return;

    if (dm.completed[missionId] && !dm.claimed[missionId]) {
      const def = DAILY_MISSION_POOL.find((m) => m.id === missionId);
      if (def) {
        DailyMissionManager._grantReward(data, def.reward);
        dm.claimed[missionId] = true;
        SaveManager.save(data);
        // Phase 89: save 이후 addXP 호출 (data race 방지)
        try { SeasonManager.addXP('daily_mission', 1); } catch { /* noop */ }
      }
    }
  }

  /**
   * 보상을 지급한다. reward 객체의 type에 따라 분기 처리.
   * @param {object} data - 세이브 데이터 (직접 수정하여 호출 측에서 save)
   * @param {{type: string, amount: number}} reward - 보상 정의
   * @private
   */
  static _grantReward(data, reward) {
    // ── Phase 88: 미션 더블 위크 이벤트 활성 시 보상 2배 ──
    const multiplier = WeeklyEventManager.isActive('double_mission') ? 2 : 1;
    const amount = reward.amount * multiplier;

    switch (reward.type) {
      case 'gold':
        data.gold = (data.gold || 0) + amount;
        break;
      case 'kitchenCoins':
        data.kitchenCoins = (data.kitchenCoins || 0) + amount;
        break;
      case 'mireukEssence':
        data.mireukEssence = Math.min(999, (data.mireukEssence ?? 0) + amount);
        data.mireukEssenceTotal = (data.mireukEssenceTotal ?? 0) + amount;
        break;
      default:
        console.warn(`[DailyMissionManager] 알 수 없는 보상 타입: ${reward.type}`);
    }

    // Phase 89: addXP는 save 이후 호출 측(recordProgress/claimReward)에서 처리한다.
    // 여기서 호출하면 호출 측 SaveManager.save(data)가 addXP 결과를 덮어쓰는
    // data race가 발생한다.
  }
}
