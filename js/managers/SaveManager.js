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
 * Phase 13-1: v9 마이그레이션 — 영구 도구 시스템 (gold, tools, tutorialMerchant).
 * Phase 14-1: v10 마이그레이션 — 대화 시스템 seenDialogues 추가.
 * Phase 14-3: v11 마이그레이션 — storyProgress (챕터 진행도, 스토리 플래그) 추가.
 * Phase 19-1: v12 마이그레이션 — 신규 도구 2종(wasabi_cannon, spice_grinder) + season2Unlocked 추가.
 * Phase 19-3: v13 마이그레이션 — storyFlags 배열→객체 변환 (프로퍼티 접근 지원).
 * Phase 26-2: v16 마이그레이션 — chapter12 진행 플래그 + sake_master 스테이지 교체 관련 플래그 추가.
 * Phase 51-1: v18 마이그레이션 — mireukEssence, mireukEssenceTotal, mireukTravelerCount,
 *             mireukBossRewards, hiredMireukChefs 추가. 미력의 정수 헬퍼 메서드 4개 추가.
 */

import { STAGE_ORDER } from '../data/stageData.js';

const SAVE_KEY = 'kitchenChaosTycoon_save';
const SAVE_VERSION = 18;

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
    // ── Phase 13 추가 ──
    gold: 0,               // 영구 골드 (영업에서 누적)
    tools: {
      pan:      { count: 4, level: 1 },  // 스타터 키트: 프라이팬 4개
      salt:     { count: 0, level: 1 },
      grill:    { count: 0, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer:  { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      // ── Phase 19-1 추가 ──
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    },
    tutorialMerchant: false,  // 행상인 튜토리얼 완료 여부
    // ── Phase 19-1 추가 ──
    season2Unlocked: false,   // 시즌 2 해금 여부
    season3Unlocked: false,   // 시즌 3 해금 여부 (Phase 24-2)
    // ── Phase 14-1 추가 ──
    seenDialogues: [],        // 시청 완료한 대화 스크립트 ID 목록
    // ── Phase 14-3 추가 ──
    storyProgress: {
      currentChapter: 1,      // 플레이어가 도달한 최고 챕터 (1~6)
      storyFlags: {},         // 임의 스토리 플래그 맵 (Phase 19-3: 배열→객체 변환)
    },
    // ── Phase 42 추가 ──
    achievements: {
      unlocked: {},     // { [achievementId]: true } -- 해금 완료 목록
      claimed: {},      // { [achievementId]: true } -- 보상 수령 완료 목록
      progress: {       // 비세이브 집계 불가 누적 카운터
        enemy_total_killed: 0,
        boss_killed: 0,
        total_gold_earned: 0,
      },
    },
    // ── Phase 51-1 추가 ──
    mireukEssence: 0,          // 보유 미력의 정수 (소비 시 감소)
    mireukEssenceTotal: 0,     // 누적 획득 미력의 정수 (소비해도 감소 안 함, 업적용)
    mireukTravelerCount: 0,    // 미력 나그네 서빙 누적 횟수 (대화 트리거용)
    mireukBossRewards: {},     // { [stageId]: true } 보스 정화 정수 수령 기록
    hiredMireukChefs: [],      // 고용 중인 유랑 미력사 목록 (Phase 51-2 이후 사용)
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

  // ── 영구 골드 (Phase 13) ──

  /**
   * 영구 골드 잔액 조회.
   * @returns {number}
   */
  static getGold() {
    return SaveManager.load().gold || 0;
  }

  /**
   * 영구 골드 설정 (직접 덮어쓰기).
   * @param {number} amount
   */
  static setGold(amount) {
    const data = SaveManager.load();
    data.gold = amount;
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

  // ── 대화 시스템 (Phase 14-1) ──

  /**
   * 해당 대화를 이미 본 적 있는지 확인한다.
   * @param {string} dialogueId
   * @returns {boolean}
   */
  static hasSeenDialogue(dialogueId) {
    const data = SaveManager.load();
    return (data.seenDialogues || []).includes(dialogueId);
  }

  /**
   * 해당 대화를 본 것으로 기록한다.
   * @param {string} dialogueId
   */
  static markDialogueSeen(dialogueId) {
    const data = SaveManager.load();
    if (!data.seenDialogues) data.seenDialogues = [];
    if (!data.seenDialogues.includes(dialogueId)) {
      data.seenDialogues.push(dialogueId);
      SaveManager.save(data);
    }
  }

  // ── 미력의 정수 (Phase 51-1) ──

  /**
   * 현재 보유 미력의 정수 조회.
   * @returns {number}
   */
  static getMireukEssence() {
    return SaveManager.load().mireukEssence ?? 0;
  }

  /**
   * 미력의 정수 가산. mireukEssenceTotal도 함께 증가.
   * 최대 999 캡 적용.
   * @param {number} amount - 가산할 정수 수
   * @returns {number} 가산 후 보유량
   */
  static addMireukEssence(amount) {
    const data = SaveManager.load();
    data.mireukEssence      = Math.min(999, (data.mireukEssence ?? 0) + amount);
    data.mireukEssenceTotal = (data.mireukEssenceTotal ?? 0) + amount;
    SaveManager.save(data);
    return data.mireukEssence;
  }

  /**
   * 미력 나그네 서빙 누적 횟수 조회.
   * @returns {number}
   */
  static getMireukTravelerCount() {
    return SaveManager.load().mireukTravelerCount ?? 0;
  }

  /**
   * 미력 나그네 서빙 누적 횟수 +1 증가.
   * @returns {number} 증가 후 횟수
   */
  static incrementMireukTravelerCount() {
    const data = SaveManager.load();
    data.mireukTravelerCount = (data.mireukTravelerCount ?? 0) + 1;
    SaveManager.save(data);
    return data.mireukTravelerCount;
  }

  // ── 업적 시스템 (Phase 42) ──

  /**
   * 업적 데이터 객체 반환.
   * @returns {{ unlocked: object, claimed: object, progress: object }}
   */
  static getAchievements() {
    const data = SaveManager.load();
    return data.achievements || { unlocked: {}, claimed: {}, progress: {} };
  }

  /**
   * 업적 보상 수령 완료 기록.
   * @param {string} id - 업적 ID
   */
  static markAchievementClaimed(id) {
    const data = SaveManager.load();
    if (!data.achievements) {
      data.achievements = { unlocked: {}, claimed: {}, progress: { enemy_total_killed: 0, boss_killed: 0, total_gold_earned: 0 } };
    }
    data.achievements.claimed[id] = true;
    SaveManager.save(data);
  }

  // ── 기존 메서드 ──

  /**
   * 스테이지 해금 여부.
   * Phase 19-2: 시즌 2 첫 스테이지(7-1)는 6-3 클리어 + season2Unlocked 조건 추가.
   * @param {string} stageId
   * @returns {boolean}
   */
  static isUnlocked(stageId) {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx <= 0) return true;

    // ── 시즌 2 첫 스테이지 특수 조건 ──
    if (stageId === '7-1') {
      const data = SaveManager.load();
      return !!data.stages['6-3']?.cleared && !!data.season2Unlocked;
    }

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
   * 그룹별 별점 합계.
   * Phase 24-2: 그룹 필터 파라미터로 변경 (기존 season → group).
   * @param {number} [group=0] - 0: 전체, 1: 그룹1(1~6장), 2: 그룹2(7~15장), 3: 그룹3(16~24장)
   * @returns {{ current: number, max: number }}
   */
  static getTotalStars(group = 0) {
    const data = SaveManager.load();
    let stages;
    if (group === 1) {
      stages = STAGE_ORDER.filter(id => parseInt(id) <= 6);
    } else if (group === 2) {
      stages = STAGE_ORDER.filter(id => parseInt(id) >= 7 && parseInt(id) <= 15);
    } else if (group === 3) {
      stages = STAGE_ORDER.filter(id => parseInt(id) >= 16);
    } else {
      stages = STAGE_ORDER;
    }
    let current = 0;
    for (const stageId of stages) {
      current += data.stages[stageId]?.stars || 0;
    }
    return { current, max: stages.length * 3 };
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

    // v8 → v9: 영구 도구 시스템 + 골드 추가
    if (data.version < 9) {
      data.gold = 0;
      data.tools = {
        pan:      { count: 2, level: 1 },  // 스타터 키트
        salt:     { count: 0, level: 1 },
        grill:    { count: 0, level: 1 },
        delivery: { count: 0, level: 1 },
        freezer:  { count: 0, level: 1 },
        soup_pot: { count: 0, level: 1 },
      };
      data.tutorialMerchant = false;
      data.version = 9;
    }

    // v9 → v10: 대화 시스템 seenDialogues 추가
    if (data.version < 10) {
      data.seenDialogues = [];
      data.version = 10;
    }

    // v10 → v11: 스토리 진행도 추가
    if (data.version < 11) {
      // 기존 seenDialogues로 currentChapter를 추론하여 복원
      const seenDialogues = data.seenDialogues || [];
      let inferredChapter = 1;
      if (seenDialogues.includes('chapter3_rin_joins')) inferredChapter = 3;
      else if (seenDialogues.includes('chapter2_intro') || seenDialogues.includes('rin_first_meet')) inferredChapter = 2;

      data.storyProgress = {
        currentChapter: inferredChapter,
        storyFlags: [],
      };
      data.version = 11;
    }

    // v11 → v12: 신규 도구 2종 + 시즌 2 해금 플래그 추가
    if (data.version < 12) {
      if (data.tools) {
        if (!data.tools.wasabi_cannon) data.tools.wasabi_cannon = { count: 0, level: 1 };
        if (!data.tools.spice_grinder) data.tools.spice_grinder = { count: 0, level: 1 };
      }
      if (data.season2Unlocked === undefined) data.season2Unlocked = false;
      data.version = 12;
    }

    // v12 → v13: storyFlags를 배열에서 객체로 변환 (Phase 19-3)
    if (data.version < 13) {
      if (Array.isArray(data.storyProgress?.storyFlags)) {
        data.storyProgress.storyFlags = {};
      }
      data.version = 13;
    }

    // v13 → v14: 스타터 프라이팬 2개 → 4개 (초반 난이도 완화)
    if (data.version < 14) {
      if (data.tools?.pan && data.tools.pan.count <= 2) {
        data.tools.pan.count = 4;
      }
      data.version = 14;
    }

    // v14 → v15: chapter8 storyFlags 키를 chapter10으로 이전 + season3Unlocked 추가 (Phase 24-2)
    if (data.version < 15) {
      if (data.storyProgress?.storyFlags) {
        const flags = data.storyProgress.storyFlags;
        if ('chapter8_cleared' in flags) {
          flags.chapter10_cleared = flags.chapter8_cleared;
          delete flags.chapter8_cleared;
        }
        if ('chapter8_mid_seen' in flags) {
          flags.chapter10_mid_seen = flags.chapter8_mid_seen;
          delete flags.chapter8_mid_seen;
        }
      }
      if (data.season3Unlocked === undefined) data.season3Unlocked = false;
      data.version = 15;
    }

    // v15 → v16: chapter12 진행 플래그 + sake_master 스테이지 교체 플래그 추가 (Phase 26-2)
    if (data.version < 16) {
      // storyFlags 객체 보장
      if (!data.storyProgress) {
        data.storyProgress = { currentChapter: 1, storyFlags: {} };
      }
      if (!data.storyProgress.storyFlags || Array.isArray(data.storyProgress.storyFlags)) {
        data.storyProgress.storyFlags = {};
      }
      // chapter12 진행 플래그 기본값
      if (data.storyProgress.storyFlags.chapter12_cleared === undefined) {
        data.storyProgress.storyFlags.chapter12_cleared = false;
      }
      if (data.storyProgress.storyFlags.chapter12_mid_seen === undefined) {
        data.storyProgress.storyFlags.chapter12_mid_seen = false;
      }
      // 10-6 클리어 기록 유지 (sake_master로 보스 교체 후에도 기존 클리어 기록 보존)
      // 별도 처리 불필요 — stages['10-6'] 클리어 기록은 스테이지 데이터 변경과 독립적
      data.version = 16;
    }

    // v16 → v17: 업적 시스템 추가 (Phase 42)
    if (data.version < 17) {
      data.achievements = data.achievements || {
        unlocked: {},
        claimed: {},
        progress: {
          enemy_total_killed: 0,
          boss_killed: 0,
          total_gold_earned: 0,
        },
      };
      data.version = 17;
    }

    // v17 → v18: 미력의 정수 시스템 추가 (Phase 51-1)
    if (data.version < 18) {
      data.mireukEssence      = data.mireukEssence      ?? 0;
      data.mireukEssenceTotal = data.mireukEssenceTotal ?? 0;
      data.mireukTravelerCount= data.mireukTravelerCount?? 0;
      data.mireukBossRewards  = data.mireukBossRewards  || {};
      data.hiredMireukChefs   = data.hiredMireukChefs   || [];
      data.version = 18;
    }

    return data;
  }
}
