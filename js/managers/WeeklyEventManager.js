/**
 * @fileoverview 주간 이벤트 매니저.
 * Phase 88: 7일 주기 이벤트 스케줄. getActiveEvent()로 당일 이벤트를 조회한다.
 *
 * 정적 클래스 패턴 (EnergyManager와 동일).
 * SaveManager를 참조하지 않으며 config.js WEEKLY_EVENT_POOL만 참조한다.
 */

import { WEEKLY_EVENT_POOL } from '../config.js';

export class WeeklyEventManager {
  /**
   * 오늘 활성화된 이벤트 객체를 반환한다.
   * 이벤트가 없는 날은 null을 반환한다.
   * @returns {{ id: string, nameKo: string, descKo: string, days: number[] } | null}
   */
  static getActiveEvent() {
    const dayOfWeek = new Date().getDay(); // 0=일, 1=월, ..., 6=토
    return WEEKLY_EVENT_POOL.find((ev) => ev.days.includes(dayOfWeek)) ?? null;
  }

  /**
   * 특정 이벤트 ID가 오늘 활성 상태인지 확인한다.
   * @param {string} eventId
   * @returns {boolean}
   */
  static isActive(eventId) {
    const ev = WeeklyEventManager.getActiveEvent();
    return ev !== null && ev.id === eventId;
  }
}
