/**
 * @fileoverview 세이브 매니저.
 * Phase 5: v2 마이그레이션 — kitchenCoins, upgrades, unlockedRecipes 추가.
 * Phase 6: v3 마이그레이션 — selectedChef, completedOrders 추가.
 * Phase 7-3: v4 마이그레이션 — cookingSlots, bestSatisfaction 추가.
 * Phase 8-3: v5 마이그레이션 — tableUpgrades, unlockedTables, interiors, staff 추가.
 * Phase 8-4: isStaffHired, hireStaff 메서드 추가.
 * Phase 10-6: v6 마이그레이션 — soundSettings 추가.
 * Phase 11-1: v7 마이그레이션 — endless 엔드리스 기록 추가.
 * Phase 11-3a: v8 마이그레이션 — tutorialBattle/Service/Shop/Endless 4개 플래그로 분리.
 */

import { STAGE_ORDER } from '../data/stageData.js';

const SAVE_KEY = 'kitchenChaosTycoon_save';
const SAVE_VERSION = 8;

/** 기본 세이브 데이터 */
function createDefault() {
  return {
    version: SAVE_VERSION,
    stages: {},
    totalGoldEarned: 0,
    tutorialDone: false,
    // ── Phase 11-3a 추가 ──
    tutorialBattle: false,   // 전투(MarketScene) 튜토리얼 완료
    tutorialService: false,  // 영업(ServiceScene) 튜토리얼 완료
    tutorialShop: false,     // 상점(ShopScene) 튜토리얼 완료
    tutorialEndless: false,  // 엔드리스(EndlessScene) 튜토리얼 완료
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
    // ── Phase 8-3 추가 ──
    tableUpgrades: [0, 0, 0, 0],  // 테이블별 등급 Lv0~4 (초기 4석)
    unlockedTables: 4,             // 해금된 테이블 수 (기본 4, 최대 8)
    interiors: {
      flower: 0,                   // 꽃병 Lv0~5
      kitchen: 0,                  // 오픈 키친 Lv0~5
      lighting: 0,                 // 고급 조명 Lv0~5
    },
    staff: {
      waiter: false,               // 서빙 도우미 영구 해금 여부
      dishwasher: false,           // 세척 도우미 영구 해금 여부
    },
    // ── Phase 10-6 추가 ──
    soundSettings: {
      bgmVolume: 0.7,             // BGM 볼륨 (0.0~1.0)
      sfxVolume: 0.8,             // SFX 볼륨 (0.0~1.0)
      muted: false,               // 전체 음소거 여부
    },
    // ── Phase 11-1 추가 ──
    endless: {
      unlocked: false,            // 6-3 클리어 시 true
      bestWave: 0,                // 최고 도달 웨이브
      bestScore: 0,               // 최고 누적 골드
      bestCombo: 0,               // 최고 연속 콤보
      lastDailySeed: 0,           // 마지막 플레이한 데일리 시드
    },
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

    // ── Phase 11-1: 6-3 클리어 시 엔드리스 해금 ──
    if (stageId === '6-3' && stars > 0) {
      data.endless = data.endless || { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
      data.endless.unlocked = true;
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

  // ── 테이블 업그레이드 (Phase 8-3) ──

  /**
   * 테이블 등급 반환.
   * @param {number} idx - 테이블 인덱스 (0-based)
   * @returns {number} 0~4
   */
  static getTableUpgrade(idx) {
    const data = SaveManager.load();
    return (data.tableUpgrades || [])[idx] || 0;
  }

  /**
   * 테이블 등급 +1 업그레이드 (최대 4).
   * @param {number} idx - 테이블 인덱스
   * @returns {boolean} 성공 여부
   */
  static upgradeTable(idx) {
    const data = SaveManager.load();
    if (!data.tableUpgrades) data.tableUpgrades = [0, 0, 0, 0];
    if (idx < 0 || idx >= data.tableUpgrades.length) return false;
    if (data.tableUpgrades[idx] >= 4) return false;
    data.tableUpgrades[idx]++;
    SaveManager.save(data);
    return true;
  }

  /**
   * 해금된 테이블 수 반환.
   * @returns {number} 4~8
   */
  static getUnlockedTables() {
    return SaveManager.load().unlockedTables || 4;
  }

  /**
   * 테이블 +1 해금 (최대 8). tableUpgrades에 0을 push한다.
   * @returns {boolean} 성공 여부
   */
  static unlockTable() {
    const data = SaveManager.load();
    if ((data.unlockedTables || 4) >= 8) return false;
    data.unlockedTables = (data.unlockedTables || 4) + 1;
    if (!data.tableUpgrades) data.tableUpgrades = [0, 0, 0, 0];
    data.tableUpgrades.push(0);
    SaveManager.save(data);
    return true;
  }

  // ── 인테리어 (Phase 8-3) ──

  /**
   * 인테리어 레벨 반환.
   * @param {'flower'|'kitchen'|'lighting'} type
   * @returns {number} 0~5
   */
  static getInteriorLevel(type) {
    const data = SaveManager.load();
    return (data.interiors || {})[type] || 0;
  }

  /**
   * 인테리어 레벨 +1 업그레이드 (최대 5).
   * @param {'flower'|'kitchen'|'lighting'} type
   * @returns {boolean} 성공 여부
   */
  static upgradeInterior(type) {
    const data = SaveManager.load();
    if (!data.interiors) data.interiors = { flower: 0, kitchen: 0, lighting: 0 };
    if ((data.interiors[type] || 0) >= 5) return false;
    data.interiors[type] = (data.interiors[type] || 0) + 1;
    SaveManager.save(data);
    return true;
  }

  // ── 직원 (Phase 8-4) ──

  /**
   * 직원 고용 여부 확인.
   * @param {'waiter'|'dishwasher'} staffId
   * @returns {boolean}
   */
  static isStaffHired(staffId) {
    const data = SaveManager.load();
    return !!(data.staff || {})[staffId];
  }

  /**
   * 직원 영구 고용 처리. staff[staffId] = true로 설정하고 저장.
   * @param {'waiter'|'dishwasher'} staffId
   */
  static hireStaff(staffId) {
    const data = SaveManager.load();
    if (!data.staff) data.staff = { waiter: false, dishwasher: false };
    data.staff[staffId] = true;
    SaveManager.save(data);
  }

  // ── 사운드 설정 (Phase 10-6) ──

  /**
   * 저장된 사운드 설정 반환.
   * 세이브 데이터에 값이 없으면 기본값을 반환한다.
   * @returns {{ bgmVolume: number, sfxVolume: number, muted: boolean }}
   */
  static getSoundSettings() {
    const data = SaveManager.load();
    return data.soundSettings || { bgmVolume: 0.7, sfxVolume: 0.8, muted: false };
  }

  /**
   * 사운드 설정을 세이브 데이터에 저장한다.
   * @param {{ bgmVolume?: number, sfxVolume?: number, muted?: boolean }} settings
   */
  static saveSoundSettings(settings) {
    const data = SaveManager.load();
    if (!data.soundSettings) {
      data.soundSettings = { bgmVolume: 0.7, sfxVolume: 0.8, muted: false };
    }
    if (typeof settings.bgmVolume === 'number') {
      data.soundSettings.bgmVolume = settings.bgmVolume;
    }
    if (typeof settings.sfxVolume === 'number') {
      data.soundSettings.sfxVolume = settings.sfxVolume;
    }
    if (typeof settings.muted === 'boolean') {
      data.soundSettings.muted = settings.muted;
    }
    SaveManager.save(data);
  }

  // ── 엔드리스 모드 (Phase 11-1) ──

  /**
   * 엔드리스 모드 해금 여부 확인.
   * @returns {boolean}
   */
  static isEndlessUnlocked() {
    const data = SaveManager.load();
    return !!(data.endless?.unlocked);
  }

  /**
   * 엔드리스 모드 해금 기록. 6-3 클리어 시 clearStage에서 자동 호출됨.
   */
  static unlockEndless() {
    const data = SaveManager.load();
    if (!data.endless) data.endless = { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
    data.endless.unlocked = true;
    SaveManager.save(data);
  }

  /**
   * 엔드리스 기록 저장. 기존 최고 기록보다 높을 때만 갱신.
   * @param {{ wave: number, score: number, combo: number }} record
   * @returns {{ newBestWave: boolean, newBestScore: boolean, newBestCombo: boolean }}
   */
  static saveEndlessRecord({ wave, score, combo }) {
    const data = SaveManager.load();
    if (!data.endless) data.endless = { unlocked: true, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };

    const result = { newBestWave: false, newBestScore: false, newBestCombo: false };

    if (wave > data.endless.bestWave) {
      data.endless.bestWave = wave;
      result.newBestWave = true;
    }
    if (score > data.endless.bestScore) {
      data.endless.bestScore = score;
      result.newBestScore = true;
    }
    if (combo > data.endless.bestCombo) {
      data.endless.bestCombo = combo;
      result.newBestCombo = true;
    }
    data.endless.lastDailySeed = Math.floor(Date.now() / 86400000);
    SaveManager.save(data);
    return result;
  }

  /**
   * 엔드리스 최고 기록 조회.
   * @returns {{ bestWave: number, bestScore: number, bestCombo: number }}
   */
  static getEndlessRecord() {
    const data = SaveManager.load();
    return {
      bestWave: data.endless?.bestWave || 0,
      bestScore: data.endless?.bestScore || 0,
      bestCombo: data.endless?.bestCombo || 0,
    };
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
   * 씬별 튜토리얼 완료 여부 확인.
   * @param {'battle'|'service'|'shop'|'endless'} key
   * @returns {boolean}
   */
  static isTutorialDone(key) {
    if (key === undefined) {
      // @deprecated 인수 없는 레거시 호출 — tutorialDone 참조
      return SaveManager.load().tutorialDone;
    }
    const data = SaveManager.load();
    const field = `tutorial${key.charAt(0).toUpperCase() + key.slice(1)}`;
    return !!data[field];
  }

  /**
   * 씬별 튜토리얼 완료 기록.
   * @param {'battle'|'service'|'shop'|'endless'} key
   */
  static completeTutorial(key) {
    if (key === undefined) {
      // @deprecated 인수 없는 레거시 호출 — tutorialDone 기록
      const data = SaveManager.load();
      data.tutorialDone = true;
      SaveManager.save(data);
      return;
    }
    const data = SaveManager.load();
    const field = `tutorial${key.charAt(0).toUpperCase() + key.slice(1)}`;
    data[field] = true;
    SaveManager.save(data);
  }

  // ── localStorage 용량 체크 (Phase 11-3d) ──

  /**
   * 현재 세이브 데이터의 localStorage 점유 크기를 바이트 단위로 반환한다.
   * JavaScript 문자열은 UTF-16이므로 문자 수 x 2 바이트로 산출한다.
   * @returns {{ bytes: number, kb: string }} bytes와 KB 문자열
   */
  static getStorageSize() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { bytes: 0, kb: '0.00' };
      // UTF-16 인코딩 기준: 1문자 = 2바이트
      const bytes = raw.length * 2;
      return { bytes, kb: (bytes / 1024).toFixed(2) };
    } catch {
      return { bytes: 0, kb: '0.00' };
    }
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

    // v4 → v5: 테이블 업그레이드, 인테리어, 직원 추가
    if (data.version < 5) {
      data.tableUpgrades = data.tableUpgrades || [0, 0, 0, 0];
      data.unlockedTables = data.unlockedTables || 4;
      data.interiors = data.interiors || { flower: 0, kitchen: 0, lighting: 0 };
      data.staff = data.staff || { waiter: false, dishwasher: false };
      data.version = 5;
    }

    // v5 → v6: 사운드 설정 추가
    if (data.version < 6) {
      data.soundSettings = data.soundSettings || {
        bgmVolume: 0.7,
        sfxVolume: 0.8,
        muted: false,
      };
      data.version = 6;
    }

    // v6 → v7: 엔드리스 모드 기록 추가
    if (data.version < 7) {
      data.endless = data.endless || {
        unlocked: false,
        bestWave: 0,
        bestScore: 0,
        bestCombo: 0,
        lastDailySeed: 0,
      };
      // 이미 6-3을 클리어한 플레이어는 자동 해금
      if (data.stages?.['6-3']?.cleared) {
        data.endless.unlocked = true;
      }
      data.version = 7;
    }

    // v7 → v8: 튜토리얼 플래그 분리
    if (data.version < 8) {
      // 기존 tutorialDone:true → tutorialBattle:true 자동 변환
      data.tutorialBattle = data.tutorialDone === true ? true : (data.tutorialBattle || false);
      data.tutorialService = data.tutorialService || false;
      data.tutorialShop = data.tutorialShop || false;
      data.tutorialEndless = data.tutorialEndless || false;
      // 구 플래그 제거하지 않음 (하위 호환 유지)
      data.version = 8;
    }

    return data;
  }
}
