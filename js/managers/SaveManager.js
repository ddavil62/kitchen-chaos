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
 * Phase 51-2: v19 마이그레이션 — hiredMireukChefs → wanderingChefs 구조체 이관.
 *             spendMireukEssence + 유랑 미력사 헬퍼 메서드 7개 추가.
 * Phase 54: v20 마이그레이션 — giftIngredients 추가.
 *           addGiftIngredients, consumeGiftIngredients 헬퍼 추가.
 * Phase 55-4: v21 마이그레이션 — endless.stormCount, missionSuccessCount, noLeakStreak 추가.
 *             incrementEndlessStormCount, incrementEndlessMissionSuccess, updateEndlessNoLeakStreak 헬퍼 추가.
 * Phase 58-1: v24 마이그레이션 — 행상인 분기 카드 시스템 branchCards 필드 추가
 *             (toolMutations, unlockedBranchRecipes, chefBonds, activeBlessing).
 *             분기 카드 헬퍼 메서드 9개 추가.
 * Phase 68: currentRun 인메모리 필드 + setCurrentRun/getCurrentRun/clearCurrentRun 추가.
 *           런타임 전용 (localStorage 저장 없음). SAVE_VERSION 불변.
 * Phase 73: 세이브 백업 롤링 시스템 추가 (슬롯 3개 자동 순환).
 *           getBackups, restoreBackup 정적 메서드 추가.
 * Phase 75B: v25 마이그레이션 — dailyMissions, loginBonus, mimiSkinCoupons 추가.
 * Phase 76: v26 마이그레이션 — 손님 프로필 시스템 (regularCustomerProgress, criticPenaltyActive).
 *           getRegularProgress, setRegularProgress, getCriticPenalty, setCriticPenalty 헬퍼 추가.
 */

import { STAGE_ORDER } from '../data/stageData.js';

const SAVE_KEY = 'kitchenChaosTycoon_save';
const SAVE_VERSION = 26;

// ── Phase 73: 세이브 백업 슬롯 키 (3개 롤링) ──
const BACKUP_KEYS = [
  'kitchenChaosTycoon_backup_1',
  'kitchenChaosTycoon_backup_2',
  'kitchenChaosTycoon_backup_3',
];

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
    selectedChef: null,       // 'mimi_chef' | 'rin_chef' | 'mage_chef' | 'yuki_chef' | 'lao_chef' | 'andre_chef' | 'arjun_chef'
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
    // ── Phase 51-2 추가: 유랑 미력사 고용 시스템 ──
    wanderingChefs: {
      hired: [],           // 현재 고용 중인 미력사 ID 목록 (예: ['wanderer_haruka'])
      unlocked: [],        // 도감 해금 목록 (고용 이력)
      enhancements: {},    // { [chefId]: 1|2|3 } -- 강화 단계. 미기재 시 1로 간주
    },
    // ── Phase 54 추가 ──
    giftIngredients: {},     // 쿠폰으로 지급된 재료 (GatheringScene 진입 시 소비)
    // ── Phase 11-1 추가 ──
    endless: {
      unlocked: false,            // 24-6 클리어 시 true
      bestWave: 0,                // 최고 도달 웨이브
      bestScore: 0,               // 최고 누적 골드
      bestCombo: 0,               // 최고 연속 콤보
      lastDailySeed: 0,           // 마지막 플레이한 데일리 시드
      // ── Phase 55-4 추가 ──
      stormCount: 0,              // 누적 미력 폭풍의 눈 클리어 횟수
      missionSuccessCount: 0,     // 누적 정화 임무 성공 횟수
      noLeakStreak: 0,            // 현재 라이프 손실 없이 연속 클리어 중인 웨이브 수
    },
    // ── Phase 75B 추가: 일일 미션 + 로그인 보너스 ──
    dailyMissions: {
      dateKey: '',
      selected: [],
      progress: {},
      completed: {},
      claimed: {},
    },
    loginBonus: {
      loginStreak: 0,
      lastLoginDate: '',
      claimedDays: [],
    },
    mimiSkinCoupons: 0,  // Phase 77 SkinManager 의존 전까지 카운터만 보관
    // ── Phase 76 추가: 손님 프로필 시스템 ──
    regularCustomerProgress: 0,   // 단골 서빙 누적 횟수 (5회 달성 시 팁 +20% 버프)
    criticPenaltyActive: false,   // 평론가 혹평 패널티 (다음 영업 골드 -10%)
    // ── Phase 58-1 추가: 분기 카드 시스템 ──
    branchCards: {
      toolMutations: {},          // { [toolId]: mutationId } — 변이된 도구 맵 (도구당 1개, 되돌릴 수 없음)
      unlockedBranchRecipes: [],  // 해금된 분기 레시피 ID 배열
      chefBonds: [],              // 해금된 인연 카드 ID 배열 (예: ['bond_lao_grill'])
      activeBlessing: null,       // { id: string, remainingStages: number } | null — 활성 축복
      // ── Phase 58-2 추가: 방문별 선택 완료 상태 ──
      lastVisit: null,            // { stageId: string, selectedCardId: string } | null — 마지막 행상인 방문에서 이미 선택한 카드
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
    // ── Phase 73: 메인 저장 전에 롤링 백업 수행 ──
    // 순서: slot2→slot3, slot1→slot2, 현재 메인→slot1
    // 각 단계를 독립 try-catch로 감싸 quota 초과 시에도 메인 저장에 영향 없음
    try {
      const existingMain = localStorage.getItem(SAVE_KEY);
      if (existingMain) {
        // slot2 → slot3
        try {
          const s2 = localStorage.getItem(BACKUP_KEYS[1]);
          if (s2) localStorage.setItem(BACKUP_KEYS[2], s2);
        } catch { /* quota 초과 시 slot3 쓰기 포기 */ }

        // slot1 → slot2
        try {
          const s1 = localStorage.getItem(BACKUP_KEYS[0]);
          if (s1) localStorage.setItem(BACKUP_KEYS[1], s1);
        } catch { /* quota 초과 시 slot2 쓰기 포기 */ }

        // 현재 메인 → slot1
        try {
          const mainData = JSON.parse(existingMain);
          localStorage.setItem(BACKUP_KEYS[0], JSON.stringify({
            version: mainData.version ?? SAVE_VERSION,
            timestamp: Date.now(),
            data: mainData,
          }));
        } catch { /* quota 초과 시 slot1 쓰기 포기 */ }
      }
    } catch { /* 백업 전체 실패 — 메인 저장은 아래에서 계속 */ }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // localStorage 쓰기 실패 시 무시
    }
  }

  // ── Phase 73: 세이브 백업 조회/복구 ──

  /**
   * 백업 슬롯 3개의 데이터를 조회한다.
   * @returns {Array<{slot: number, version: number, timestamp: number, data: object}|null>}
   *          3원소 배열. null = 해당 슬롯 비어있음.
   */
  static getBackups() {
    const result = [];
    for (let i = 0; i < BACKUP_KEYS.length; i++) {
      try {
        const raw = localStorage.getItem(BACKUP_KEYS[i]);
        if (!raw) {
          result.push(null);
          continue;
        }
        const parsed = JSON.parse(raw);
        result.push({
          slot: i + 1,
          version: parsed.version ?? 0,
          timestamp: parsed.timestamp ?? 0,
          data: parsed.data ?? {},
        });
      } catch {
        result.push(null);
      }
    }
    return result;
  }

  /**
   * 지정 슬롯의 백업 데이터를 메인 세이브에 복원한다.
   * @param {number} slot - 1~3 (1-indexed)
   * @returns {boolean} 성공 여부
   */
  static restoreBackup(slot) {
    if (slot < 1 || slot > 3) return false;
    try {
      const raw = localStorage.getItem(BACKUP_KEYS[slot - 1]);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed.data) return false;
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed.data));
      return true;
    } catch {
      return false;
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

    // ── Phase 11-1: 최종 스테이지(24-6) 클리어 시 엔드리스 해금 ──
    if (stageId === '24-6' && stars > 0) {
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

  // ── 쿠폰 선물 재료 (Phase 54) ──

  /**
   * 쿠폰으로 지급된 재료를 기존 giftIngredients에 누적 저장한다.
   * @param {{ [ingredientId: string]: number }} ingredients - 재료 맵 (예: { carrot: 5, meat: 3 })
   */
  static addGiftIngredients(ingredients) {
    const data = SaveManager.load();
    if (!data.giftIngredients) data.giftIngredients = {};
    for (const [id, amount] of Object.entries(ingredients)) {
      if (amount > 0) {
        data.giftIngredients[id] = (data.giftIngredients[id] || 0) + amount;
      }
    }
    SaveManager.save(data);
  }

  /**
   * giftIngredients를 전체 소진 후 반환한다.
   * GatheringScene 시작 시 호출하여 InventoryManager에 합산한다.
   * @returns {{ [ingredientId: string]: number }} 소진된 재료 맵 (빈 경우 빈 객체)
   */
  static consumeGiftIngredients() {
    const data = SaveManager.load();
    const gifts = data.giftIngredients || {};
    if (Object.keys(gifts).length === 0) return {};
    data.giftIngredients = {};
    SaveManager.save(data);
    return gifts;
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
   * 엔드리스 모드 해금 기록. 24-6 클리어 시 clearStage에서 자동 호출됨.
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

  /**
   * 미력의 정수 소비. 잔액이 amount보다 적으면 false 반환 (음수 방어 포함).
   * @param {number} amount - 소비할 정수 수
   * @returns {boolean} 성공 여부
   */
  static spendMireukEssence(amount) {
    if (amount <= 0) return false;
    const data = SaveManager.load();
    if ((data.mireukEssence ?? 0) < amount) return false;
    data.mireukEssence -= amount;
    SaveManager.save(data);
    return true;
  }

  // ── 엔드리스 확장 통계 (Phase 55-4) ──

  /**
   * 폭풍 클리어 횟수 +1 증가 후 저장.
   * @returns {number} 증가 후 횟수
   */
  static incrementEndlessStormCount() {
    const data = SaveManager.load();
    if (!data.endless) data.endless = { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
    data.endless.stormCount = (data.endless.stormCount ?? 0) + 1;
    SaveManager.save(data);
    return data.endless.stormCount;
  }

  /**
   * 임무 성공 횟수 +1 증가 후 저장.
   * @returns {number} 증가 후 횟수
   */
  static incrementEndlessMissionSuccess() {
    const data = SaveManager.load();
    if (!data.endless) data.endless = { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
    data.endless.missionSuccessCount = (data.endless.missionSuccessCount ?? 0) + 1;
    SaveManager.save(data);
    return data.endless.missionSuccessCount;
  }

  /**
   * noLeakStreak 갱신. noLeak=true이면 ++, false이면 0으로 리셋 후 저장.
   * @param {boolean} noLeak - 해당 웨이브에서 라이프 손실 없이 클리어했는지 여부
   * @returns {number} 갱신 후 streak 값
   */
  static updateEndlessNoLeakStreak(noLeak) {
    const data = SaveManager.load();
    if (!data.endless) data.endless = { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
    if (noLeak) {
      data.endless.noLeakStreak = (data.endless.noLeakStreak ?? 0) + 1;
    } else {
      data.endless.noLeakStreak = 0;
    }
    SaveManager.save(data);
    return data.endless.noLeakStreak;
  }

  // ── 유랑 미력사 (Phase 51-2) ──

  /**
   * wanderingChefs 구조체 전체 반환.
   * @returns {{ hired: string[], unlocked: string[], enhancements: object }}
   */
  static getWanderingChefs() {
    const data = SaveManager.load();
    return data.wanderingChefs || { hired: [], unlocked: [], enhancements: {} };
  }

  /**
   * 유랑 미력사 고용 처리. hired 추가 + unlocked에 신규 등록 + 정수 소비.
   * @param {string} chefId
   * @param {number} cost - 고용(또는 재고용) 비용
   * @returns {boolean} 성공 여부
   */
  static hireWanderingChef(chefId, cost) {
    const data = SaveManager.load();
    if (!data.wanderingChefs) data.wanderingChefs = { hired: [], unlocked: [], enhancements: {} };
    if ((data.mireukEssence ?? 0) < cost) return false;
    data.mireukEssence -= cost;
    if (!data.wanderingChefs.hired.includes(chefId)) {
      data.wanderingChefs.hired.push(chefId);
    }
    if (!data.wanderingChefs.unlocked.includes(chefId)) {
      data.wanderingChefs.unlocked.push(chefId);
    }
    if (!data.wanderingChefs.enhancements[chefId]) {
      data.wanderingChefs.enhancements[chefId] = 1;
    }
    SaveManager.save(data);
    return true;
  }

  /**
   * 유랑 미력사 해고 처리. hired에서 제거. 환급 없음.
   * @param {string} chefId
   */
  static fireWanderingChef(chefId) {
    const data = SaveManager.load();
    if (!data.wanderingChefs) return;
    data.wanderingChefs.hired = data.wanderingChefs.hired.filter(id => id !== chefId);
    SaveManager.save(data);
  }

  /**
   * 유랑 미력사 강화. 최대 3단계. 비용 소비 후 단계 +1.
   * @param {string} chefId
   * @param {number} cost - 강화 비용
   * @returns {boolean} 성공 여부
   */
  static upgradeWanderingChef(chefId, cost) {
    const data = SaveManager.load();
    if (!data.wanderingChefs) return false;
    const curLevel = data.wanderingChefs.enhancements[chefId] || 1;
    if (curLevel >= 3) return false;
    if ((data.mireukEssence ?? 0) < cost) return false;
    data.mireukEssence -= cost;
    data.wanderingChefs.enhancements[chefId] = curLevel + 1;
    SaveManager.save(data);
    return true;
  }

  /**
   * 유랑 미력사 고용 여부 확인.
   * @param {string} chefId
   * @returns {boolean}
   */
  static isWanderingChefHired(chefId) {
    const data = SaveManager.load();
    return !!(data.wanderingChefs?.hired?.includes(chefId));
  }

  /**
   * 현재 동시 고용 상한 반환. storyProgress.currentChapter 기반.
   * - chapter 7~12 -> 1명
   * - chapter 13~18 -> 2명
   * - chapter 19+ -> 3명
   * - 7 미만 -> 0 (고용 불가)
   * @returns {number}
   */
  static getHireLimit() {
    const data = SaveManager.load();
    const ch = data.storyProgress?.currentChapter || 1;
    if (ch < 7) return 0;
    if (ch <= 12) return 1;
    if (ch <= 18) return 2;
    return 3;
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

  // ── 분기 카드 시스템 (Phase 58-1) ──

  /**
   * branchCards 필드를 안전하게 조회한다. 마이그레이션 누락 등 예외 상황 방어용.
   * @returns {{ toolMutations: object, unlockedBranchRecipes: string[], chefBonds: string[], activeBlessing: object|null }}
   * @private
   */
  static _getBranchCards() {
    const data = SaveManager.load();
    if (!data.branchCards) {
      data.branchCards = {
        toolMutations: {},
        unlockedBranchRecipes: [],
        chefBonds: [],
        activeBlessing: null,
        lastVisit: null,
      };
      SaveManager.save(data);
    }
    // Phase 58-2: lastVisit 필드 누락 방어 (v24 기존 세이브 호환)
    if (data.branchCards.lastVisit === undefined) {
      data.branchCards.lastVisit = null;
    }
    return data.branchCards;
  }

  /**
   * 변이된 도구 맵 반환.
   * @returns {{ [toolId: string]: string }} 예: { pan: 'mut_pan_flame' }
   */
  static getToolMutations() {
    return { ...SaveManager._getBranchCards().toolMutations };
  }

  /**
   * 도구에 변이를 적용한다. 이미 변이가 있으면 덮어쓰지 않는다 (되돌릴 수 없음).
   * @param {string} toolId
   * @param {string} mutationId
   * @returns {boolean} 신규 적용 성공 여부 (이미 변이가 있으면 false)
   */
  static applyToolMutation(toolId, mutationId) {
    const data = SaveManager.load();
    if (!data.branchCards) {
      data.branchCards = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
    }
    if (data.branchCards.toolMutations[toolId]) {
      return false; // 이미 변이 적용됨 (되돌릴 수 없음 규칙)
    }
    data.branchCards.toolMutations[toolId] = mutationId;
    SaveManager.save(data);
    return true;
  }

  /**
   * 해금된 분기 레시피 ID 목록 반환.
   * @returns {string[]}
   */
  static getUnlockedBranchRecipes() {
    return [...SaveManager._getBranchCards().unlockedBranchRecipes];
  }

  /**
   * 분기 레시피 해금 추가. 중복 방지.
   * @param {string} recipeId
   * @returns {boolean} 신규 해금 여부
   */
  static unlockBranchRecipe(recipeId) {
    const data = SaveManager.load();
    if (!data.branchCards) {
      data.branchCards = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
    }
    if (data.branchCards.unlockedBranchRecipes.includes(recipeId)) return false;
    data.branchCards.unlockedBranchRecipes.push(recipeId);
    SaveManager.save(data);
    return true;
  }

  /**
   * 반복 등장 가능 분기 레시피 상수.
   * recipeId → 최대 등장 횟수 (이 값이 0이 되면 해금 목록에서 제거).
   * @type {{ [recipeId: string]: number }}
   */
  static REPEATABLE_BRANCH_RECIPES = {
    branch_chaos_ramen: 3,
    branch_spice_bomb: 2,
  };

  /**
   * 분기 레시피 소비 처리.
   * 반복 등장 레시피(chaos_ramen 3회, spice_bomb 2회)는 카운트를 감산하고,
   * 카운트가 0이 되면 해금 목록에서 제거한다.
   * 나머지 레시피는 기존과 동일하게 즉시 제거한다.
   * @param {string} recipeId
   * @returns {boolean} 실제 소비(감산 또는 제거) 여부
   */
  static consumeBranchRecipe(recipeId) {
    const data = SaveManager.load();
    if (!data.branchCards || !Array.isArray(data.branchCards.unlockedBranchRecipes)) return false;
    const idx = data.branchCards.unlockedBranchRecipes.indexOf(recipeId);
    if (idx === -1) return false;

    // recipeRepeatCounts 필드 초기화 방어
    if (!data.branchCards.recipeRepeatCounts) {
      data.branchCards.recipeRepeatCounts = {};
    }

    const maxCount = SaveManager.REPEATABLE_BRANCH_RECIPES[recipeId];
    if (maxCount) {
      // 반복 등장 레시피: 카운트 감산
      if (data.branchCards.recipeRepeatCounts[recipeId] === undefined) {
        data.branchCards.recipeRepeatCounts[recipeId] = maxCount;
      }
      data.branchCards.recipeRepeatCounts[recipeId]--;
      if (data.branchCards.recipeRepeatCounts[recipeId] <= 0) {
        // 카운트 소진 → 해금 목록에서 제거
        data.branchCards.unlockedBranchRecipes.splice(idx, 1);
        delete data.branchCards.recipeRepeatCounts[recipeId];
      }
    } else {
      // 일반 레시피: 즉시 제거 (1회 소비)
      data.branchCards.unlockedBranchRecipes.splice(idx, 1);
    }

    SaveManager.save(data);
    return true;
  }

  /**
   * 해금된 인연 카드 ID 목록 반환.
   * @returns {string[]}
   */
  static getChefBonds() {
    return [...SaveManager._getBranchCards().chefBonds];
  }

  /**
   * 인연 카드 해금 추가. 중복 방지.
   * @param {string} bondId - 카드 자체의 ID (예: 'bond_lao_grill')
   * @returns {boolean} 신규 해금 여부
   */
  static unlockChefBond(bondId) {
    const data = SaveManager.load();
    if (!data.branchCards) {
      data.branchCards = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
    }
    if (data.branchCards.chefBonds.includes(bondId)) return false;
    data.branchCards.chefBonds.push(bondId);
    SaveManager.save(data);
    return true;
  }

  /**
   * 현재 활성 축복을 반환한다. 없으면 null.
   * @returns {{ id: string, remainingStages: number }|null}
   */
  static getActiveBlessing() {
    const bless = SaveManager._getBranchCards().activeBlessing;
    return bless ? { ...bless } : null;
  }

  /**
   * 활성 축복을 설정한다. 기존 값을 덮어쓴다 (갱신 규칙). null 전달 시 해제.
   * @param {{ id: string, remainingStages: number }|null} blessing
   */
  static setActiveBlessing(blessing) {
    const data = SaveManager.load();
    if (!data.branchCards) {
      data.branchCards = { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null };
    }
    if (blessing === null || blessing === undefined) {
      data.branchCards.activeBlessing = null;
    } else {
      data.branchCards.activeBlessing = {
        id: blessing.id,
        remainingStages: Math.max(0, blessing.remainingStages | 0),
      };
    }
    SaveManager.save(data);
  }

  /**
   * 활성 축복의 잔여 스테이지를 1 차감한다. 0 이하가 되면 null로 초기화.
   * ResultScene 정산 직후(MerchantScene 또는 ChefSelectScene 전환 직전)에만 호출한다.
   * @returns {{ id: string, remainingStages: number }|null} 차감 후 활성 축복 (없으면 null)
   */
  static decrementBlessingStages() {
    const data = SaveManager.load();
    if (!data.branchCards || !data.branchCards.activeBlessing) return null;
    const bless = data.branchCards.activeBlessing;
    bless.remainingStages = (bless.remainingStages | 0) - 1;
    if (bless.remainingStages <= 0) {
      data.branchCards.activeBlessing = null;
      SaveManager.save(data);
      return null;
    }
    SaveManager.save(data);
    return { ...data.branchCards.activeBlessing };
  }

  /**
   * 현재 stageId 기준 방문에서 이미 선택한 카드 정보를 반환한다.
   * @param {string} stageId - 확인할 행상인 방문의 stageId
   * @returns {{ stageId: string, selectedCardId: string }|null} 같은 stageId이면 이미 선택한 카드 정보, 아니면 null
   */
  static getLastVisitSelection(stageId) {
    const visit = SaveManager._getBranchCards().lastVisit;
    if (!visit || visit.stageId !== stageId) return null;
    return { ...visit };
  }

  /**
   * 현재 행상인 방문에서 분기 카드를 선택했음을 기록한다.
   * 이후 동일 stageId로 MerchantScene에 재진입해도 "이미 선택됨" 상태가 복원된다.
   * @param {string} stageId
   * @param {string} selectedCardId
   */
  static markVisitSelection(stageId, selectedCardId) {
    const data = SaveManager.load();
    if (!data.branchCards) {
      data.branchCards = {
        toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null,
      };
    }
    data.branchCards.lastVisit = { stageId: String(stageId), selectedCardId: String(selectedCardId) };
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

  // ── Phase 68: currentRun 인메모리 단일 소스 ──

  /** @type {{ stageId: string, chapterNo: number } | null} */
  static _currentRun = null;

  /**
   * 현재 진행 중인 런 정보를 기록한다. localStorage에 저장하지 않는다.
   * GatheringScene, ServiceScene 진입 시 호출한다.
   * @param {{ stageId: string, chapterNo?: number }} data
   */
  static setCurrentRun(data) {
    SaveManager._currentRun = {
      stageId: data.stageId,
      chapterNo: data.chapterNo ?? (parseInt(data.stageId?.split('-')[0], 10) || 1),
    };
  }

  /**
   * 현재 진행 중인 런 정보를 반환한다.
   * @returns {{ stageId: string, chapterNo: number } | null}
   */
  static getCurrentRun() {
    return SaveManager._currentRun;
  }

  /**
   * 현재 런 정보를 초기화한다. ResultScene 정산 완료 후 호출한다.
   */
  static clearCurrentRun() {
    SaveManager._currentRun = null;
  }

  // ── Phase 76: 손님 프로필 시스템 헬퍼 ──

  /**
   * 단골 서빙 누적 횟수 조회.
   * @returns {number}
   */
  static getRegularProgress() {
    const data = SaveManager.load();
    return data.regularCustomerProgress ?? 0;
  }

  /**
   * 단골 서빙 누적 횟수 저장.
   * @param {number} count
   */
  static setRegularProgress(count) {
    const data = SaveManager.load();
    data.regularCustomerProgress = count;
    SaveManager.save(data);
  }

  /**
   * 평론가 혹평 패널티 활성 여부 조회.
   * @returns {boolean}
   */
  static getCriticPenalty() {
    const data = SaveManager.load();
    return data.criticPenaltyActive ?? false;
  }

  /**
   * 평론가 혹평 패널티 설정/해제.
   * @param {boolean} active
   */
  static setCriticPenalty(active) {
    const data = SaveManager.load();
    data.criticPenaltyActive = active;
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

    // v18 → v19: hiredMireukChefs 배열 → wanderingChefs 구조체로 이관 (Phase 51-2)
    if (data.version < 19) {
      const legacyHired = Array.isArray(data.hiredMireukChefs) ? data.hiredMireukChefs : [];
      data.wanderingChefs = {
        hired:        legacyHired,
        unlocked:     legacyHired.slice(),   // 이전 고용 이력을 unlocked로 소급 등록
        enhancements: {},
      };
      delete data.hiredMireukChefs;
      data.version = 19;
    }

    // v19 → v20: 쿠폰 선물 재료 필드 추가 (Phase 54)
    if (data.version < 20) {
      data.giftIngredients = data.giftIngredients || {};
      data.version = 20;
    }

    // v20 → v21: 엔드리스 확장 통계 필드 추가 (Phase 55-4)
    if (data.version < 21) {
      if (!data.endless) {
        data.endless = { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
      }
      data.endless.stormCount          = data.endless.stormCount          ?? 0;
      data.endless.missionSuccessCount = data.endless.missionSuccessCount ?? 0;
      data.endless.noLeakStreak        = data.endless.noLeakStreak        ?? 0;
      data.version = 21;
    }

    // v21 → v22: 엔드리스 해금 조건 6-3 → 24-6 변경
    if (data.version < 22) {
      // 24-6을 클리어한 경우에만 해금 유지, 아니면 초기화
      if (data.endless?.unlocked && !data.stages?.['24-6']?.cleared) {
        data.endless.unlocked = false;
      }
      data.version = 22;
    }

    // v22 → v23: TD 셰프 ID 교체 마이그레이션 (Phase 56)
    if (data.version < 23) {
      const chefIdMap = {
        'petit_chef': 'mimi_chef',
        'flame_chef': 'rin_chef',
        'ice_chef':   'mage_chef',
      };
      if (data.selectedChef && chefIdMap[data.selectedChef]) {
        data.selectedChef = chefIdMap[data.selectedChef];
      }
      data.version = 23;
    }

    // v23 → v24: 행상인 분기 카드 시스템 추가 (Phase 58-1)
    if (data.version < 24) {
      data.branchCards = data.branchCards || {
        toolMutations: {},
        unlockedBranchRecipes: [],
        chefBonds: [],
        activeBlessing: null,
      };
      // 부분 필드 누락 방어 (혹시 사용자가 수동으로 branchCards 일부만 추가한 경우)
      if (!data.branchCards.toolMutations)         data.branchCards.toolMutations = {};
      if (!data.branchCards.unlockedBranchRecipes) data.branchCards.unlockedBranchRecipes = [];
      if (!data.branchCards.chefBonds)             data.branchCards.chefBonds = [];
      if (data.branchCards.activeBlessing === undefined) data.branchCards.activeBlessing = null;
      data.version = 24;
    }

    // v24 → v25: 일일 미션 + 로그인 보너스 추가 (Phase 75B)
    if (data.version < 25) {
      data.dailyMissions = data.dailyMissions || {
        dateKey: '', selected: [], progress: {}, completed: {}, claimed: {},
      };
      data.loginBonus = data.loginBonus || {
        loginStreak: 0, lastLoginDate: '', claimedDays: [],
      };
      data.mimiSkinCoupons = data.mimiSkinCoupons ?? 0;
      data.version = 25;
    }

    // v25 → v26: 손님 프로필 시스템 추가 (Phase 76)
    if (data.version < 26) {
      data.regularCustomerProgress = data.regularCustomerProgress ?? 0;
      data.criticPenaltyActive = data.criticPenaltyActive ?? false;
      data.version = 26;
    }

    // Phase 72: recipeRepeatCounts 필드 누락 방어 (기존 v24 세이브 호환)
    if (data.branchCards && !data.branchCards.recipeRepeatCounts) {
      data.branchCards.recipeRepeatCounts = {};
    }

    return data;
  }
}
