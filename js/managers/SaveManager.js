/**
 * @fileoverview 세이브 매니저.
 * Phase 4: localStorage 기반 세이브/로드, 스테이지 진행도 관리.
 */

import { STAGE_ORDER } from '../data/stageData.js';

const SAVE_KEY = 'kitchenChaos_save';
const SAVE_VERSION = 1;

/** 기본 세이브 데이터 */
function createDefault() {
  return {
    version: SAVE_VERSION,
    stages: {},
    totalGoldEarned: 0,
    tutorialDone: false,
  };
}

export class SaveManager {
  /** @returns {object} 세이브 데이터 */
  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefault();
      const data = JSON.parse(raw);
      return SaveManager._migrate(data);
    } catch {
      return createDefault();
    }
  }

  /** @param {object} data */
  static save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // localStorage 쓰기 실패 시 무시
    }
  }

  /**
   * 스테이지 클리어 기록.
   * 최고 별점만 갱신한다.
   * @param {string} stageId
   * @param {number} stars - 1~3
   */
  static clearStage(stageId, stars) {
    const data = SaveManager.load();
    const prev = data.stages[stageId];
    if (!prev || stars > prev.stars) {
      data.stages[stageId] = { cleared: true, stars };
    }
    SaveManager.save(data);
  }

  /**
   * 스테이지 해금 여부.
   * 첫 스테이지는 항상 해금, 이후는 이전 스테이지 클리어 시 해금.
   * @param {string} stageId
   * @returns {boolean}
   */
  static isUnlocked(stageId) {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx <= 0) return true; // 첫 스테이지 또는 없는 스테이지
    const prevId = STAGE_ORDER[idx - 1];
    const data = SaveManager.load();
    return !!data.stages[prevId]?.cleared;
  }

  /**
   * 스테이지 별점 조회.
   * @param {string} stageId
   * @returns {number} 0~3
   */
  static getStars(stageId) {
    const data = SaveManager.load();
    return data.stages[stageId]?.stars || 0;
  }

  /**
   * 튜토리얼 완료 여부.
   * @returns {boolean}
   */
  static isTutorialDone() {
    return SaveManager.load().tutorialDone;
  }

  /** 튜토리얼 완료 기록 */
  static completeTutorial() {
    const data = SaveManager.load();
    data.tutorialDone = true;
    SaveManager.save(data);
  }

  /** 세이브 초기화 */
  static reset() {
    localStorage.removeItem(SAVE_KEY);
  }

  /**
   * 버전 마이그레이션.
   * @param {object} data
   * @returns {object}
   * @private
   */
  static _migrate(data) {
    if (!data.version) data.version = 1;
    // 향후 마이그레이션 체인 추가
    return data;
  }
}
