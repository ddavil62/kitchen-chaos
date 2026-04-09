/**
 * @fileoverview 세이브 매니저.
 * Phase 5: v2 마이그레이션 — kitchenCoins, upgrades, unlockedRecipes 추가.
 * Phase 6: v3 마이그레이션 — selectedChef, completedOrders 추가.
 * Phase 7-3: v4 마이그레이션 — cookingSlots, bestSatisfaction 추가.
 */

import { STAGE_ORDER } from '../data/stageData.js';

const SAVE_KEY = 'kitchenChaos_save';
const SAVE_VERSION = 4;

/** 기본 세이브 데이터 */
function createDefault() {
  return {
    version: SAVE_VERSION,
    stages: {},
    totalGoldEarned: 0,
    tutorialDone: false,
    // ── Phase 5 추가 ──
    kitchenCoins: 0,
    upgrades: {
      fridge: 0,
      knife: 0,
      delivery_speed: 0,
      cook_training: 0,
    },
    unlockedRecipes: [],  // 해금한 레시피 ID 목록 (스타터 12종은 코드에서 항상 해금)
    // ── Phase 6 추가 ──
    selectedChef: null,       // 'petit_chef' | 'flame_chef' | 'ice_chef'
    completedOrders: [],      // 완료된 오더 통계용
    // ── Phase 7-3 추가 ──
    cookingSlots: 2,          // 동시 조리 슬롯 수 (기본 2)
    bestSatisfaction: {},     // { stageId: 최고 만족도 % }
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
   * 스테이지 클리어 기록 + 주방 코인 지급.
   * 최고 별점만 갱신한다.
   * Phase 7-3: 만족도 기반 별점 체계에 맞춰 코인 보상 조정.
   *   - ★ +5, ★★ +10, ★★★ +15
   *   - 첫 클리어 보너스: +5
   *   - 이미 획득한 별점분은 중복 지급하지 않음
   * @param {string} stageId
   * @param {number} stars - 1~3
   * @returns {number} 이번에 지급된 코인 수
   */
  static clearStage(stageId, stars) {
    const data = SaveManager.load();
    const prev = data.stages[stageId];
    const prevStars = prev?.stars || 0;
    const isFirstClear = !prev?.cleared;

    // 별점 갱신
    if (!prev || stars > prevStars) {
      data.stages[stageId] = { cleared: true, stars };
    }

    // 별점별 기본 코인 보상
    const coinByStars = { 1: 5, 2: 10, 3: 15 };
    let coinsEarned = 0;

    if (isFirstClear) {
      // 최초 클리어: 별점 보상 + 첫 클리어 보너스
      coinsEarned = (coinByStars[stars] || 0) + 5;
    } else if (stars > prevStars) {
      // 더 높은 별점: 차이분 보상
      coinsEarned = (coinByStars[stars] || 0) - (coinByStars[prevStars] || 0);
    } else {
      // 재클리어: 별점 기반 소량 보상
      coinsEarned = Math.max(1, Math.floor((coinByStars[stars] || 0) * 0.2));
    }

    data.kitchenCoins = (data.kitchenCoins || 0) + coinsEarned;
    SaveManager.save(data);
    return coinsEarned;
  }

  /**
   * 주방 코인 잔고 조회.
   * @returns {number}
   */
  static getCoins() {
    return SaveManager.load().kitchenCoins || 0;
  }

  /**
   * 주방 코인 차감.
   * @param {number} amount
   * @returns {boolean} 성공 여부
   */
  static spendCoins(amount) {
    const data = SaveManager.load();
    if ((data.kitchenCoins || 0) < amount) return false;
    data.kitchenCoins -= amount;
    SaveManager.save(data);
    return true;
  }

  // ── 만족도 기록 ──

  /**
   * 스테이지 최고 만족도를 갱신한다. 기존 값보다 높을 때만 저장.
   * @param {string} stageId
   * @param {number} satisfaction - 만족도 (0~100)
   */
  static updateBestSatisfaction(stageId, satisfaction) {
    const data = SaveManager.load();
    if (!data.bestSatisfaction) data.bestSatisfaction = {};
    const prev = data.bestSatisfaction[stageId] || 0;
    if (satisfaction > prev) {
      data.bestSatisfaction[stageId] = satisfaction;
      SaveManager.save(data);
    }
  }

  /**
   * 스테이지 최고 만족도 조회.
   * @param {string} stageId
   * @returns {number} 0~100
   */
  static getBestSatisfaction(stageId) {
    const data = SaveManager.load();
    return (data.bestSatisfaction || {})[stageId] || 0;
  }

  // ── 레시피 해금 ──

  /**
   * 레시피 해금 여부 확인.
   * @param {string} recipeId
   * @returns {boolean}
   */
  static isRecipeUnlocked(recipeId) {
    const data = SaveManager.load();
    return (data.unlockedRecipes || []).includes(recipeId);
  }

  /**
   * 레시피 해금 기록.
   * @param {string} recipeId
   */
  static unlockRecipe(recipeId) {
    const data = SaveManager.load();
    if (!data.unlockedRecipes) data.unlockedRecipes = [];
    if (!data.unlockedRecipes.includes(recipeId)) {
      data.unlockedRecipes.push(recipeId);
      SaveManager.save(data);
    }
  }

  /**
   * 해금된 레시피 ID 목록.
   * @returns {string[]}
   */
  static getUnlockedRecipes() {
    return SaveManager.load().unlockedRecipes || [];
  }

  // ── 기존 메서드 ──

  /**
   * 스테이지 해금 여부.
   * @param {string} stageId
   * @returns {boolean}
   */
  static isUnlocked(stageId) {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx <= 0) return true;
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
   * 누적 별점 합계.
   * @returns {{ current: number, max: number }}
   */
  static getTotalStars() {
    const data = SaveManager.load();
    let current = 0;
    for (const stageId of STAGE_ORDER) {
      current += data.stages[stageId]?.stars || 0;
    }
    return { current, max: STAGE_ORDER.length * 3 };
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

    // v1 → v2: 주방 코인, 업그레이드, 레시피 해금 추가
    if (data.version < 2) {
      data.kitchenCoins = data.kitchenCoins || 0;
      data.upgrades = data.upgrades || {
        fridge: 0,
        knife: 0,
        delivery_speed: 0,
        cook_training: 0,
      };
      data.unlockedRecipes = data.unlockedRecipes || [];
      data.version = 2;
    }

    // v2 → v3: 셰프 선택, 오더 기록 추가
    if (data.version < 3) {
      data.selectedChef = data.selectedChef || null;
      data.completedOrders = data.completedOrders || [];
      data.version = 3;
    }

    // v3 → v4: 조리 슬롯, 최고 만족도 추가
    if (data.version < 4) {
      data.cookingSlots = data.cookingSlots || 2;
      data.bestSatisfaction = data.bestSatisfaction || {};
      data.version = 4;
    }

    return data;
  }
}
