/**
 * @fileoverview 영업 타이쿤 씬 (ServiceScene).
 * Phase 7-2: 장보기(MarketScene)에서 수집한 재료로 레스토랑을 영업한다.
 * Phase 8-3: 동적 테이블 석수, 테이블 등급, 인테리어 글로벌 버프 반영.
 * Phase 8-4: 직원 시스템 — 세척 대기시간, 자동 서빙, 직원 아이콘 표시.
 * Phase 8-5: 특수 손님 5종(일반/VIP/미식가/급한/단체) + 영업 이벤트 4종.
 * Phase 8-6: 셰프 영업 액티브 스킬 (특급 서비스 / 화염 조리 / 시간 동결).
 * Phase 10-5: VFXManager 연동 (서빙 반짝이, 골드 플로팅, 콤보, 손님 이모지).
 * Phase 11-3c: 비활성 테이블 렌더 최적화, 씬 Tween/Timer 정리.
 * Phase 19-5: 홀 영역 테이블 배치를 flat top-down → 아이소메트릭 다이아몬드 격자로 전환.
 *             _cellToWorld(), _drawIsoFloor() 추가. depth sorting y좌표 기반 적용.
 * Phase 51-4: 챕터별 홀 바닥·뒷벽 키 헬퍼 추가, tileSprite 전환, 하단 바 색조 통일.
 * Phase 51-1: mireuk_traveler 특수 손님 타입 추가, 미력의 정수 드롭 로직, HUD 보유량 표시.
 * Phase 51-2: 유랑 미력사 패시브 스킬 적용 (_applyWanderingChefSkills), 인내심/조리시간 버프.
 * 손님 입장 -> 주문 -> 레시피 선택 -> 조리 -> 서빙 -> 골드 획득.
 *
 * 화면 구성 (360x640):
 *   0~40     HUD (골드, 영업시간, 만족도, 활성 이벤트)
 *   40~280   홀 영역 (테이블 4~8석, 동적 2행 x 2~4열)
 *   280~340  조리 슬롯 (2개)
 *   340~440  재료 재고 표시
 *   440~570  레시피 퀵슬롯
 *   570~640  하단 바 (셰프 스킬 버튼, 직원 아이콘, 일시정지)
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { STAGES } from '../data/stageData.js';
import { ALL_SERVING_RECIPES, RECIPE_MAP } from '../data/recipeData.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import { STAFF_TYPES } from '../data/staffData.js';
import { SoundManager } from '../managers/SoundManager.js';
import { VFXManager } from '../managers/VFXManager.js';
import { TutorialManager } from '../managers/TutorialManager.js';
import { ToolManager } from '../managers/ToolManager.js';
import { StoryManager } from '../managers/StoryManager.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { WANDERING_CHEFS, getWanderingChefById } from '../data/wanderingChefData.js';

// ── 레이아웃 상수 ──
const HUD_Y = 0;
const HUD_H = 40;
const HALL_Y = 40;
const HALL_H = 240;
const COOK_Y = 280;
const COOK_H = 60;
const STOCK_Y = 340;
const STOCK_H = 100;
const RECIPE_Y = 440;
const RECIPE_H = 130;
const BOTTOM_Y = 570;
const BOTTOM_H = 70;

// 테이블 그리드 — Phase 8-3: 동적 석수 (2행 x 2~4열)
const TABLE_ROWS = 2;

// 조리 슬롯 수
const MAX_COOKING_SLOTS = 2;

// ── 세척/자동서빙 상수 (Phase 8-4) ──
/** 세척 대기시간 (ms) */
const WASH_TIME_MS = 2000;
/** 자동 서빙 딜레이 (ms) */
const AUTO_SERVE_DELAY_MS = 3000;

// ── 테이블 등급별 설정 (Phase 8-3) ──

/** 등급별 팁 배율 (Lv0~4) */
const TABLE_TIP_MULTIPLIERS = [1.0, 1.1, 1.25, 1.4, 1.6];
/** 등급별 인내심 보너스 (Lv0~4) */
const TABLE_PATIENCE_BONUS = [0, 0.05, 0.10, 0.18, 0.25];
/** 등급별 테이블 배경색 */
const TABLE_COLORS = [0x8b4513, 0xa0622d, 0xccbbaa, 0xd4a017, 0xffd700];
/** 등급별 테이블 스트로크 두께 */
const TABLE_STROKE_WIDTH = [1, 1, 1, 2, 2];
/** 등급별 테이블 스트로크 색상 */
const TABLE_STROKE_COLOR = [0x5a2d0c, 0x7a4a1d, 0x998877, 0xd4a017, 0xffd700];

// ── Phase 19-5: 서비스씬 전용 아이소메트릭 상수 ──
/** 홀 최대 열 수 */
const SISO_COLS     = 4;
/** 홀 최대 행 수 */
const SISO_ROWS     = 2;
/** 다이아몬드 반너비 (px) */
const SISO_HALF_W   = 40;
/** 다이아몬드 반높이 (px) */
const SISO_HALF_H   = 30;
/** 격자 원점 절대 X 좌표 */
const SISO_ORIGIN_X = 140;
/** 격자 원점 절대 Y 좌표 (Phase 19-6: 120→100으로 상향, 뒷벽 데코 공간 확보) */
const SISO_ORIGIN_Y = 100;
/** 테이블 스프라이트 표시 너비 */
const SISO_TABLE_W  = 72;
/** 테이블 스프라이트 표시 높이 */
const SISO_TABLE_H  = 56;

// ── 인테리어 효과값 배열 (Phase 8-3) ──

/** 꽃병: 인내심 보너스 (Lv0~5) */
const FLOWER_PATIENCE_BONUS = [0, 0.05, 0.10, 0.16, 0.22, 0.30];
/** 오픈 키친: 조리속도 보너스 (Lv0~5) */
const KITCHEN_COOK_BONUS = [0, 0.05, 0.10, 0.16, 0.22, 0.30];
/** 고급 조명: 팁 보너스 (Lv0~5) */
const LIGHTING_TIP_BONUS = [0, 0.08, 0.16, 0.25, 0.35, 0.50];

// ── 특수 손님 설정 (Phase 8-5) ──

/** 손님 유형별 아이콘 */
const CUSTOMER_TYPE_ICONS = {
  normal: '\uD83D\uDE0A',   // 😊
  vip: '\uD83D\uDC51',      // 👑
  gourmet: '\uD83E\uDDD0',  // 🧐
  rushed: '\uD83D\uDE30',   // 😰
  group: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66', // 👨‍👩‍👧‍👦
  mireuk_traveler: '\uD83D\uDCAE', // 💠 (이모지 폴백)
};

/** 손님 유형별 인내심 배율 */
const CUSTOMER_PATIENCE_MULT = {
  normal: 1.0,
  vip: 0.7,
  gourmet: 1.0,
  rushed: 0.4,
  group: 1.2,
  mireuk_traveler: 1.5,   // 여유로운 여행자. 급하지 않음.
};

/** 손님 유형별 보상 배율 */
const CUSTOMER_REWARD_MULT = {
  normal: 1.0,
  vip: 1.8,
  gourmet: 1.8,
  rushed: 2.5,
  group: 2.0,
  mireuk_traveler: 0.8,   // 여행자는 돈이 없다. 골드 보상 낮음, 대신 정수 드롭.
};

/**
 * 장(chapter)별 특수 손님 출현 확률.
 * 키: 장 번호(1~3), 값: { type: 확률 }
 * 확률은 순서대로 적용 (앞 유형에 해당되면 뒤 유형은 스킵)
 */
const SPECIAL_CUSTOMER_RATES = {
  1: { vip: 0.10, gourmet: 0, rushed: 0, group: 0 },
  2: { vip: 0.15, gourmet: 0.05, rushed: 0.05, group: 0 },
  3: { vip: 0.15, gourmet: 0.10, rushed: 0.08, group: 0.05 },
};

// ── 영업 이벤트 설정 (Phase 8-5) ──

/** 이벤트 유형 정의 */
const SERVICE_EVENT_TYPES = {
  happy_hour: {
    type: 'happy_hour',
    icon: '\uD83C\uDF89',   // 🎉
    nameKo: '해피아워',
    messageKo: '\uD83C\uDF89 해피아워! 손님이 몰려옵니다!',
    bannerColor: 0xddaa00,
    duration: 30,
  },
  rainy_day: {
    type: 'rainy_day',
    icon: '\uD83C\uDF27\uFE0F', // 🌧️
    nameKo: '비 오는 날',
    messageKo: '\uD83C\uDF27\uFE0F 비 오는 날... 한가하지만 여유롭게',
    bannerColor: 0x3366aa,
    duration: 45,
  },
  food_review: {
    type: 'food_review',
    icon: '\u2B50',          // ⭐
    nameKo: '맛집 리뷰',
    messageKo: '\u2B50 맛집 리뷰 게재! VIP가 몰려옵니다!',
    bannerColor: 0x8844aa,
    duration: -1, // 시간이 아닌 서빙 5명 카운트 기반
  },
  kitchen_accident: {
    type: 'kitchen_accident',
    icon: '\uD83D\uDD25',   // 🔥
    nameKo: '주방 사고',
    messageKo: '\uD83D\uDD25 주방 사고! 조리 슬롯 1개 사용 불가!',
    bannerColor: 0xcc2222,
    duration: 30,
  },
};

/** 이벤트 최초 발생 대기시간 (초) */
const EVENT_START_DELAY = 60;
/** 이벤트 발생 최소 간격 (초) */
const EVENT_MIN_INTERVAL = 45;
/** 영업 중 최대 이벤트 발생 횟수 */
const EVENT_MAX_COUNT = 2;
/** 이벤트 배너 표시 시간 (초) */
const EVENT_BANNER_DURATION = 3;

export class ServiceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ServiceScene' });
  }

  /**
   * MarketScene에서 전달받는 데이터.
   * @param {{ inventory: Object, stageId: string, gold: number, lives: number }} data
   */
  init(data) {
    this.inventoryManager = new InventoryManager();
    // 전달받은 인벤토리 데이터를 복원
    const inv = data.inventory || {};
    for (const [type, amount] of Object.entries(inv)) {
      if (amount > 0) this.inventoryManager.add(type, amount);
    }

    this.stageId = data.stageId || '1-1';
    this.stageData = STAGES[this.stageId];
    this.serviceConfig = this.stageData?.service || {
      duration: 180, customerInterval: 6, maxCustomers: 15, customerPatience: 50,
    };

    this.marketGold = data.gold || 0;
    this.marketLives = data.lives || 0;

    // 장보기 결과 (ResultScene 전달용)
    this.marketResult = data.marketResult || {
      totalIngredients: 0,
      livesRemaining: this.marketLives,
      livesMax: 15,
    };

    // ── Phase 11-1: 엔드리스 모드 상태 ──
    this.isEndless = data.isEndless || false;
    this.endlessWave = data.endlessWave || 0;
    this.endlessScore = data.endlessScore || 0;
    this.endlessMaxCombo = data.endlessMaxCombo || 0;
    this.dailySpecials = data.dailySpecials || [];
  }

  create() {
    // ── BGM 재생 (Phase 10-4) ──
    SoundManager.playBGM('bgm_service');

    // ── VFX 매니저 (Phase 10-5) ──
    this.vfx = new VFXManager(this);

    // ── 게임 상태 ──
    this.totalGold = 0;
    this.tipTotal = 0;
    this.maxCombo = 0;
    this.satisfaction = 100;
    this.servedCount = 0;
    this.totalCustomers = 0;
    this.comboCount = 0;
    this.serviceTimeLeft = this.serviceConfig.duration;
    this.isPaused = false;
    this.isServiceOver = false;

    // ── Phase 8-3: 동적 테이블 수 결정 ──
    this.unlockedTables = SaveManager.getUnlockedTables();
    this.tableCols = Math.ceil(this.unlockedTables / TABLE_ROWS);
    this.tableCount = this.unlockedTables;

    // 테이블 등급 배열 로드
    this.tableUpgrades = [];
    for (let i = 0; i < this.tableCount; i++) {
      this.tableUpgrades.push(SaveManager.getTableUpgrade(i));
    }

    // 인테리어 레벨 로드
    this.interiorFlower = SaveManager.getInteriorLevel('flower');
    this.interiorKitchen = SaveManager.getInteriorLevel('kitchen');
    this.interiorLighting = SaveManager.getInteriorLevel('lighting');

    // 테이블 크기: 4~6석 90x80, 8석 75x70
    this.tableW = this.tableCount >= 7 ? 75 : 90;
    this.tableH = this.tableCount >= 7 ? 70 : 80;

    // ── 손님 시스템 ──
    /** @type {(object|null)[]} 동적 테이블 (4~8석) */
    this.tables = new Array(this.tableCount).fill(null);
    this.customerSpawnTimer = 0;
    this.customersSpawned = 0;

    // ── 조리 슬롯 (Phase 8-4: washing 상태 추가) ──
    /** @type {{ recipe: object|null, timeLeft: number, totalTime: number, ready: boolean, washing: boolean, washTimeLeft: number }[]} */
    this.cookingSlots = [];
    for (let i = 0; i < MAX_COOKING_SLOTS; i++) {
      this.cookingSlots.push({ recipe: null, timeLeft: 0, totalTime: 0, ready: false, washing: false, washTimeLeft: 0 });
    }

    // ── Phase 8-4: 직원 상태 ──
    this.hasWaiter = SaveManager.isStaffHired('waiter');
    this.hasDishwasher = SaveManager.isStaffHired('dishwasher');
    /** 자동 서빙 타이머 (ms) — ready 요리가 있으면 카운트다운 */
    this.autoServeTimer = 0;

    // ── Phase 8-5: 특수 손님 시스템 ──
    /** 현재 장 번호 (stageId '1-1' → 1, '3-4' → 3) */
    this.chapter = parseInt(this.stageId.split('-')[0], 10) || 1;
    /** 장별 특수 손님 출현 확률 테이블 */
    this.specialRates = SPECIAL_CUSTOMER_RATES[this.chapter] || SPECIAL_CUSTOMER_RATES[1];

    // ── Phase 8-6: 셰프 영업 액티브 스킬 상태 ──
    /** 스킬 쿨다운 남은 시간 (ms) */
    this.skillCooldownLeft = 0;
    /** 스킬 총 쿨다운 (ms) */
    this.skillCooldownMax = 0;
    /** 꼬마셰프 스킬: 남은 인내심 리셋 대상 수 */
    this.patienceResetRemaining = 0;
    /** 얼음 요리장 스킬: 인내심 정지 상태 */
    this.patienceFrozen = false;
    /** 얼음 요리장 스킬: 정지 남은 시간 (ms) */
    // ── Phase 19-1: 유키/라오 스킬 상태 ──
    /** 유키 precision_cut: 남은 즉시 조리 횟수 */
    this._precisionCutRemaining = 0;
    this.freezeTimeLeft = 0;

    // ── Phase 8-5: 영업 이벤트 시스템 ──
    /** @type {{ type: string, timeLeft: number, data: object }|null} */
    this.activeEvent = null;
    /** 이벤트 발생 횟수 */
    this.eventCount = 0;
    /** 다음 이벤트 발생까지 남은 시간 (초) */
    this.eventCooldown = 0;
    /** 최초 이벤트 발생 대기시간 (초) */
    this.eventStartDelay = EVENT_START_DELAY;
    /** 맛집 리뷰 이벤트 시 남은 VIP 강제 수 */
    this.foodReviewRemaining = 0;
    /** 주방 사고로 비활성화된 조리 슬롯 인덱스 (-1이면 없음) */
    this.accidentSlotIdx = -1;

    // ── 해금된 서빙 레시피 목록 ──
    this.availableRecipes = ALL_SERVING_RECIPES.filter(r => RecipeManager.isUnlocked(r.id));

    // ── UI 생성 ──
    this._createHUD();
    this._createTables();
    this._createCookingSlots();
    this._createInventoryPanel();
    this._createRecipeQuickSlots();
    this._createBottomBar();

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── Phase 11-1: 스페셜 레시피 팝업 표시 (엔드리스 모드) ──
    if (this.isEndless && this.dailySpecials.length > 0) {
      this.time.delayedCall(500, () => this._showDailySpecialsPopup());
    }

    // ── Phase 11-3a: 영업 튜토리얼 ──
    this._tutorial = new TutorialManager(this, 'service', [
      '1/4 \uC190\uB2D8\uC774 \uC549\uC73C\uBA74\n\uC8FC\uBB38\uC744 \uAE30\uB2E4\uB9AC\uC138\uC694!',
      '2/4 \uD558\uB2E8 \uB808\uC2DC\uD53C \uD035\uC2AC\uB86F\uC5D0\uC11C\n\uC694\uB9AC\uB97C \uC120\uD0DD\uD574 \uC870\uB9AC \uC2DC\uC791!',
      '3/4 \uC870\uB9AC\uAC00 \uC644\uB8CC\uB418\uBA74\n\uC644\uB8CC\uB41C \uC694\uB9AC\uB97C \uD0ED\uD558\uC5EC \uC11C\uBE59!',
      '4/4 \uC798 \uC11C\uBE59\uD558\uBA74 \uD301\uC744 \uBC1B\uC544\n\uB9CC\uC871\uB3C4\uAC00 \uC62C\uB77C\uAC11\uB2C8\uB2E4!',
    ]);
    // 트리거: stageId가 '1-1'이고 엔드리스 모드가 아닐 때만
    if (this.stageId === '1-1' && !this.isEndless) {
      this._tutorial.start();
    }
    // 튜토리얼 advance 조건 플래그 초기화
    this._tutAdvanced0 = false;
    this._tutAdvanced1 = false;
    this._tutAdvanced2 = false;
    this._tutAdvanced3 = false;

    // ── Phase 51-1: 미력 나그네 등장 예약 ──
    this._mireukSpawned = false;  // 세션당 1회 중복 방지 플래그
    this._scheduleMireukTraveler();

    // ── Phase 51-2: 유랑 미력사 패시브 스킬 적용 ──
    this._applyWanderingChefSkills();

    // 씬 종료 시 정리
    this.events.once('shutdown', this._shutdown, this);
  }

  // ── Phase 51-2: 유랑 미력사 패시브 스킬 적용 ──────────────────────────────

  /**
   * 고용 중인 유랑 미력사의 패시브 스킬을 세션 시작 시 일괄 적용한다.
   * 스킬 효과는 내부 버프 변수에 덧셈 합산 방식으로 적용한다.
   * @private
   */
  _applyWanderingChefSkills() {
    const wc = SaveManager.getWanderingChefs();
    const hired = wc.hired || [];

    // ── 버프 변수 초기화 ──
    /** 인내심 배율 누적 증가 (0.2 = +20%) */
    this._buffPatienceMult = 0;
    /** 급한 손님(rushed) 전용 인내심 추가 증가 */
    this._buffRushedPatienceMult = 0;
    /** 조리 시간 감소율 누적 (0.10 = -10%) */
    this._buffCookTimeReduce = 0;
    /** 조리 시간 콤보 보너스 (2연속 서빙 후 추가 감소율) */
    this._buffCookComboReduce = 0;
    /** 미식가 등장 확률 증가 (절대값) */
    this._buffGourmetRateAdd = 0;
    /** 미식가 보상 배율 증가 */
    this._buffGourmetRewardMult = 0;
    /** 서빙 처리 속도 증가율 */
    this._buffServeSpeed = 0;
    /** 세션 초반 보상 증가율 */
    this._buffEarlyBonus = 0;
    /** 세션 초반 효과 지속 시간 (초) */
    this._buffEarlyDuration = 0;
    /** 세션 초반 보상 적용 시작 시각 (create 완료 기준 0초) */
    this._buffEarlyStartTime = 0;
    /** 조리 실패 시 재료 회수율 */
    this._buffIngredientRefund = 0;
    /** 조리 실패 후 즉시 재조리 가능 플래그 */
    this._buffNoFailDelay = false;
    /** VIP 등장 확률 배율 */
    this._buffVipRateMult = 1;
    /** VIP 보상 배율 증가 */
    this._buffVipRewardMult = 0;
    /** VIP 서빙 완료 시 food_review 이벤트 확률 추가 (로살리오 3단계) */
    this._buffVipFoodReviewBonus = 0;
    /** 요코 연쇄 서빙 달성 기준 수 (0이면 비활성) */
    this._yokoChainThreshold = 0;
    /** 요코 퇴장 방지 발동 시 골드 보너스 (0.50 = +50%) */
    this._yokoChainReward = 0;
    /** 현재 연속 서빙 카운터 */
    this._yokoChainCount = 0;
    /** 다음 손님 퇴장 방지 플래그 */
    this._yokoProtectNext = false;
    /** 퇴장 방지 발동 중 플래그 (다음 서빙 시 보너스 참조용) */
    this._yokoProtectActive = false;

    if (hired.length === 0) return;

    for (const chefId of hired) {
      const def = getWanderingChefById(chefId);
      if (!def) continue;
      const level = wc.enhancements[chefId] || 1;
      const idx = level - 1;
      const v  = def.skillValues[idx];
      const v2 = def.skillValues2 ? def.skillValues2[idx] : 0;

      switch (def.skillType) {
        case 'patience_pct':
          this._buffPatienceMult += v;
          this._buffRushedPatienceMult += v2;
          break;

        case 'cook_time_reduce':
          this._buffCookTimeReduce += v;
          // 3단계 콤보 보너스는 comboCount 체크 시 _buffCookComboReduce 사용
          this._buffCookComboReduce = Math.max(this._buffCookComboReduce, v2);
          break;

        case 'gourmet_rate':
          this._buffGourmetRateAdd += v;
          this._buffGourmetRewardMult += v2;
          break;

        case 'serve_speed':
          this._buffServeSpeed += v;
          break;

        case 'early_session_bonus':
          // 여러 시엔 동시 고용 불가이나, 혹시 중복 방지 위해 최댓값 적용
          this._buffEarlyBonus    = Math.max(this._buffEarlyBonus, v);
          this._buffEarlyDuration = Math.max(this._buffEarlyDuration, v2);
          break;

        case 'ingredient_refund':
          this._buffIngredientRefund = Math.max(this._buffIngredientRefund, v);
          this._buffNoFailDelay = this._buffNoFailDelay || (v2 > 0);
          break;

        case 'vip_rate':
          this._buffVipRateMult *= v;   // 배율이므로 곱셈
          this._buffVipRewardMult += v2;
          // 로살리오 3단계: food_review 이벤트 확률 +30%
          if (level === 3) this._buffVipFoodReviewBonus += 0.30;
          break;

        case 'chain_serve':
          this._yokoChainThreshold = v;   // 단계별 기준 수 (3/2/2)
          this._yokoChainReward = v2;     // 단계별 보상 (0/0/0.50)
          break;
      }
    }

    // ── 적용: 인내심 배율 (CUSTOMER_PATIENCE_MULT 복사본 생성 후 수정) ──
    // 씬 인스턴스 변수로 덮어쓰기. 원본 상수 객체를 보호하기 위해 얕은 복사본 사용.
    if (this._buffPatienceMult > 0 || this._buffRushedPatienceMult > 0) {
      this._patienceMults = { ...CUSTOMER_PATIENCE_MULT };
      for (const type of Object.keys(this._patienceMults)) {
        this._patienceMults[type] *= (1 + this._buffPatienceMult);
      }
      if (this._buffRushedPatienceMult > 0) {
        this._patienceMults.rushed *= (1 + this._buffRushedPatienceMult);
      }
    } else {
      this._patienceMults = CUSTOMER_PATIENCE_MULT;
    }

    // ── 적용: 특수 손님 확률 (specialRates 복사본 생성) ──
    if (this._buffGourmetRateAdd > 0 || this._buffVipRateMult !== 1) {
      const base = this.specialRates || SPECIAL_CUSTOMER_RATES[this.chapter] || SPECIAL_CUSTOMER_RATES[1];
      this.specialRates = { ...base };
      if (this._buffGourmetRateAdd > 0) {
        this.specialRates.gourmet = Math.min(0.50, (base.gourmet || 0) + this._buffGourmetRateAdd);
      }
      if (this._buffVipRateMult !== 1) {
        this.specialRates.vip = Math.min(0.50, (base.vip || 0) * this._buffVipRateMult);
      }
    }

    console.log('[ServiceScene] 유랑 미력사 스킬 적용:', hired.length, '명');
  }

  // ── Phase 51-1: 미력 나그네 등장 예약 ──────────────────────────────

  /**
   * 미력 나그네 등장 예약.
   * 캠페인: 7-1 이후 + season2Unlocked 시 16% 확률.
   * 엔드리스: 무조건 8% 확률 (시즌/챕터 조건 면제).
   * 등장 시각: 세션 시작 후 60~90초 사이 무작위.
   * @private
   */
  _scheduleMireukTraveler() {
    // 잠금 해제 조건: 엔드리스가 아니면 season2Unlocked + 7-1 이후
    if (!this.isEndless) {
      const saveData = SaveManager.load();
      const isSeason2 = !!saveData.season2Unlocked;
      if (!isSeason2 && this.chapter < 7) return;
    }

    // 엔드리스 모드에서는 낮은 확률(8%)로 등장 허용
    const spawnChance = this.isEndless ? 0.08 : 0.16;
    if (Math.random() >= spawnChance) return;

    // 60~90초 사이 무작위 시각에 등장
    const delayMs = Phaser.Math.Between(60000, 90000);
    this.time.delayedCall(delayMs, () => {
      if (this.isServiceOver || this.isPaused || this._mireukSpawned) return;
      this._spawnMireukTraveler();
    });
  }

  /**
   * 미력 나그네를 홀에 스폰한다.
   * 빈 테이블이 없으면 스폰하지 않고 예약을 소비(1회 시도)한다.
   * @private
   */
  _spawnMireukTraveler() {
    const emptyIndices = [];
    for (let i = 0; i < this.tableCount; i++) {
      if (this.tables[i] === null) emptyIndices.push(i);
    }
    if (emptyIndices.length === 0) return; // 만석이면 이번 기회는 소진

    this._mireukSpawned = true;

    // 레시피 선택: 상위 30% 등급 (tier >= 3) 우선, 없으면 전체 풀
    const recipe = this._pickRecipeForType('mireuk_traveler');
    if (!recipe) return;

    // 인내심 계산 (기존 공식 동일, typeMult = 1.5 적용)
    const chefPatienceBonus = ChefManager.getPatienceBonus();
    const tableIdx = emptyIndices[0];
    const tableGrade = this.tableUpgrades[tableIdx] || 0;
    const tablePatienceBonus = TABLE_PATIENCE_BONUS[tableGrade];
    const interiorPatienceBonus = FLOWER_PATIENCE_BONUS[this.interiorFlower] || 0;
    const basePat = this.serviceConfig.customerPatience * 1000;
    const typeMult = (this._patienceMults || CUSTOMER_PATIENCE_MULT).mireuk_traveler;
    const eventPatienceMult = (this.activeEvent && this.activeEvent.type === 'rainy_day') ? 1.5 : 1.0;
    const totalPatience = basePat * chefPatienceBonus * (1 + tablePatienceBonus + interiorPatienceBonus) * typeMult * eventPatienceMult;

    const customer = {
      dish: recipe.id,
      recipe: recipe,
      patience: totalPatience,
      maxPatience: totalPatience,
      baseReward: recipe.baseReward,
      tipMultiplier: 1.5,
      vip: false,
      customerType: 'mireuk_traveler',
      tableIdx: tableIdx,
      groupPairIdx: -1,
    };

    this.tables[tableIdx] = customer;
    this.customersSpawned++;
    this.totalCustomers++;

    this._updateTableUI(tableIdx);
    this._playEntranceEffect(tableIdx);
    SoundManager.playSFX('sfx_customer_in');
  }

  // ── HUD (상단 40px) ──────────────────────────────────────────────

  /** @private */
  _createHUD() {
    // Phase 19-6: HUD 배경 웜 다크 (#1c0e00)로 통일
    // Phase 52: depth 100→600 상향 (테이블 3레이어 depth 범위 10~509와 분리)
    // Phase 60-3: primitive rectangle → nineslice panel_dark (어두운 나무결 HUD 배경).
    const hudBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, HUD_H / 2, GAME_WIDTH, HUD_H, 'dark');
    hudBg.setDepth(600);
    // HUD 하단 골드 구분선 — nineslice divider_h (2px)
    const hudDivider = NineSliceFactory.dividerH(this, GAME_WIDTH / 2, HUD_H, GAME_WIDTH, 2);
    hudDivider.setDepth(600);
    hudDivider.setAlpha(0.9);

    this.goldText = this.add.text(10, 10, `\uD83E\uDE99 ${this.totalGold}`, {
      fontSize: '14px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(601);

    this.timeText = this.add.text(GAME_WIDTH / 2, 10, this._formatTime(this.serviceTimeLeft), {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(601);

    // Phase 19-6: satText 색상 웜 앰버로 통일
    this.satText = this.add.text(GAME_WIDTH - 10, 10, `\u2B50 ${this.satisfaction}%`, {
      fontSize: '14px', color: '#e8c87a', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(601);

    this.comboText = this.add.text(GAME_WIDTH / 2, 26, '', {
      fontSize: '11px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(601);

    // Phase 8-5: 활성 이벤트 아이콘 + 남은 시간 표시
    this.eventHudText = this.add.text(GAME_WIDTH - 10, 26, '', {
      fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(601);

    // ── Phase 51-1: 미력의 정수 보유량 (chapter >= 7 또는 보유량 > 0 시 표시) ──
    this._mireukEssenceVal = SaveManager.getMireukEssence();
    this.mireukEssenceText = this.add.text(10, 26, '', {
      fontSize: '11px', color: '#b266ff', fontStyle: 'bold',
    }).setDepth(601);
    this._updateMireukHUD();
  }

  /** @private */
  _updateHUD() {
    this.goldText.setText(`\uD83E\uDE99 ${this.totalGold}`);
    this.timeText.setText(this._formatTime(this.serviceTimeLeft));
    this.satText.setText(`\u2B50 ${Math.round(this.satisfaction)}%`);

    // 콤보 표시
    if (this.comboCount >= 3) {
      this.comboText.setText(`\uCF64\uBCF4 x${this.comboCount}`);
    } else {
      this.comboText.setText('');
    }

    // Phase 8-5: 활성 이벤트 HUD 표시
    if (this.activeEvent) {
      const evtDef = SERVICE_EVENT_TYPES[this.activeEvent.type];
      if (this.activeEvent.type === 'food_review') {
        this.eventHudText.setText(`${evtDef.icon} ${this.foodReviewRemaining}\uBA85`);
      } else {
        const remain = Math.ceil(this.activeEvent.timeLeft);
        this.eventHudText.setText(`${evtDef.icon} ${remain}\uCD08`);
      }
    } else {
      this.eventHudText.setText('');
    }

    // Phase 51-1: 미력의 정수 HUD 갱신
    this._updateMireukHUD();
  }

  /**
   * 미력의 정수 HUD 텍스트를 갱신한다.
   * chapter >= 7이거나 보유량 > 0일 때만 표시한다.
   * @private
   */
  _updateMireukHUD() {
    if (!this.mireukEssenceText) return;
    const essence = SaveManager.getMireukEssence();
    if (this.chapter >= 7 || essence > 0) {
      this.mireukEssenceText.setText(`\uD83D\uDCAE ${essence}`);
    } else {
      this.mireukEssenceText.setText('');
    }
  }

  /**
   * 초 단위를 m:ss 형식으로 변환.
   * @param {number} sec
   * @returns {string}
   * @private
   */
  _formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `\uC601\uC5C5\uC2DC\uAC04 ${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── 테이블 동적 석수 (홀 영역 40~280px) ──────────────────────────

  /**
   * 아이소메트릭 격자 좌표를 화면 좌표로 변환한다.
   * @param {number} col - 열 인덱스 (0 ~ SISO_COLS-1)
   * @param {number} row - 행 인덱스 (0 ~ SISO_ROWS-1)
   * @returns {{ x: number, y: number }} 화면 중심 좌표
   * @private
   */
  _cellToWorld(col, row) {
    return {
      x: SISO_ORIGIN_X + (col - row) * SISO_HALF_W,
      y: SISO_ORIGIN_Y + (col + row) * SISO_HALF_H,
    };
  }

  /**
   * 홀 아이소메트릭 바닥 격자 테두리를 그린다.
   * floor_hall.png 이미지 위에 다이아몬드 셀 경계선 오버레이를 추가해 깊이감을 부여한다.
   * @private
   */
  _drawIsoFloor() {
    const gfx = this.add.graphics().setDepth(1);
    gfx.lineStyle(1, 0x3A2410, 0.3);
    for (let col = 0; col < SISO_COLS; col++) {
      for (let row = 0; row < SISO_ROWS; row++) {
        const { x: cx, y: cy } = this._cellToWorld(col, row);
        gfx.strokePoints([
          { x: cx,              y: cy - SISO_HALF_H },
          { x: cx + SISO_HALF_W, y: cy              },
          { x: cx,              y: cy + SISO_HALF_H },
          { x: cx - SISO_HALF_W, y: cy              },
        ], true);
      }
    }
  }

  /**
   * 현재 챕터에 맞는 홀 바닥 에셋 키를 반환한다.
   * @returns {string}
   * @private
   */
  _getHallFloorKey() {
    if (this.isEndless)      return ServiceScene._endlessFloorKey(this.endlessWave);
    if (this.chapter <= 6)   return 'floor_hall_g1';
    if (this.chapter <= 9)   return 'floor_hall_izakaya';
    if (this.chapter <= 12)  return 'floor_hall_dragon';
    if (this.chapter <= 15)  return 'floor_hall_bistro';
    if (this.chapter <= 18)  return 'floor_hall_spice';
    if (this.chapter <= 21)  return 'floor_hall_cantina';
    return 'floor_hall_dream';
  }

  /**
   * 현재 챕터에 맞는 뒷벽 에셋 키를 반환한다.
   * @returns {string}
   * @private
   */
  _getWallBackKey() {
    if (this.isEndless)      return ServiceScene._endlessWallKey(this.endlessWave);
    if (this.chapter <= 6)   return 'wall_back_g1';
    if (this.chapter <= 9)   return 'wall_back_izakaya';
    if (this.chapter <= 12)  return 'wall_back_dragon';
    if (this.chapter <= 15)  return 'wall_back_bistro';
    if (this.chapter <= 18)  return 'wall_back_spice';
    if (this.chapter <= 21)  return 'wall_back_cantina';
    return 'wall_back_dream';
  }

  /**
   * 엔드리스 웨이브 구간에 따른 홀 바닥 타일 키 반환.
   * @param {number} wave
   * @returns {string}
   * @private
   */
  static _endlessFloorKey(wave) {
    if (wave <= 20) return 'floor_hall_endless';
    if (wave <= 30) return 'floor_hall_izakaya';
    if (wave <= 40) return 'floor_hall_bistro';
    const cycle = Math.floor((wave - 41) / 10) % 3;
    return ['floor_hall_spice', 'floor_hall_cantina', 'floor_hall_dream'][cycle];
  }

  /**
   * 엔드리스 웨이브 구간에 따른 홀 뒷벽 키 반환.
   * @param {number} wave
   * @returns {string}
   * @private
   */
  static _endlessWallKey(wave) {
    if (wave <= 20) return 'wall_back_endless';
    if (wave <= 30) return 'wall_back_izakaya';
    if (wave <= 40) return 'wall_back_bistro';
    const cycle = Math.floor((wave - 41) / 10) % 3;
    return ['wall_back_spice', 'wall_back_cantina', 'wall_back_dream'][cycle];
  }

  /**
   * 홀 배경 데코 오브젝트 — 뒷벽, 화분, 입구를 배치한다.
   * 에셋 미로드 시 해당 오브젝트를 생략하고 에러를 발생시키지 않는다.
   * @private
   */
  _createHallDecor() {
    // Phase 51-4: 챕터별 뒷벽 키 우선, fallback: 기존 wall_back
    const wallKey = this._getWallBackKey();
    const activeWallKey = SpriteLoader.hasTexture(this, wallKey) ? wallKey
                        : SpriteLoader.hasTexture(this, 'wall_back') ? 'wall_back'
                        : null;
    if (activeWallKey) {
      this.add.image(GAME_WIDTH / 2, HALL_Y + 26, activeWallKey)
        .setDisplaySize(GAME_WIDTH, 52)
        .setDepth(3);
    }

    // 화분 — 좌측 코너
    if (SpriteLoader.hasTexture(this, 'decor_plant')) {
      const plantY = 120;
      this.add.image(18, plantY, 'decor_plant')
        .setDisplaySize(28, 42)
        .setDepth(10 + plantY);
      // 우측 코너 — 좌우 반전
      this.add.image(GAME_WIDTH - 18, plantY, 'decor_plant')
        .setDisplaySize(28, 42)
        .setFlipX(true)
        .setDepth(10 + plantY);
    }

    // 입구 아치 — 홀 하단 경계
    if (SpriteLoader.hasTexture(this, 'entrance_arch')) {
      this.add.image(GAME_WIDTH / 2, COOK_Y - 24, 'entrance_arch')
        .setDisplaySize(120, 40)
        .setDepth(5);
    }
  }

  /** @private */
  _createTables() {
    // Phase 51-4: 챕터별 128×128 tileable 바닥 → tileSprite. fallback: 단일 이미지 → 단색
    const floorKey = this._getHallFloorKey();
    const activeFloorKey = SpriteLoader.hasTexture(this, floorKey) ? floorKey
                         : SpriteLoader.hasTexture(this, 'floor_hall') ? 'floor_hall'
                         : null;
    // Phase 52+: 홀 배경을 밝은 베이지 계열로 변경하여 테이블과의 대비 확보
    this.add.rectangle(GAME_WIDTH / 2, HALL_Y + HALL_H / 2, GAME_WIDTH, HALL_H, 0xC8A07A)
      .setDepth(0);
    if (activeFloorKey) {
      this.add.tileSprite(GAME_WIDTH / 2, HALL_Y + HALL_H / 2, GAME_WIDTH, HALL_H, activeFloorKey)
        .setDepth(1).setAlpha(0.35);
    } else {
      this.add.rectangle(GAME_WIDTH / 2, HALL_Y + HALL_H / 2, GAME_WIDTH, HALL_H, 0xC8A07A)
        .setDepth(0);
    }
    // 아이소메트릭 격자 경계선 오버레이
    this._drawIsoFloor();
    // Phase 19-6: 홀 배경 데코 오브젝트 (뒷벽·화분·입구)
    this._createHallDecor();

    /** @type {Phaser.GameObjects.Container[]} */
    this.tableContainers = [];

    // Phase 19-5: 아이소메트릭 다이아몬드 격자 배치 (SISO_ROWS × SISO_COLS)
    for (let row = 0; row < SISO_ROWS; row++) {
      for (let col = 0; col < SISO_COLS; col++) {
        const idx = row * SISO_COLS + col;
        if (idx >= this.tableCount) break;

        const { x: cx, y: cy } = this._cellToWorld(col, row);
        const grade = this.tableUpgrades[idx] || 0;

        // Phase 52: depth 공식 — 아이소메트릭 셀별 100단위 분리
        const BASE = 10 + (col + row) * 100;

        // UI 컨테이너: statusText, bubble, pBar, hitArea 전용
        const container = this.add.container(cx, cy).setDepth(BASE);

        // Phase 52: 3레이어 분리 렌더링 (back → customer → front)
        const backKey  = `table_lv${grade}_back`;
        const frontKey = `table_lv${grade}_front`;

        if (SpriteLoader.hasTexture(this, backKey)) {
          // ── 3레이어 분리 렌더링 ──
          const tableBackImg = this.add.image(cx, cy - 4, backKey)
            .setDisplaySize(SISO_TABLE_W, Math.round(SISO_TABLE_W * 64 / 96))
            .setDepth(BASE);
          const tableFrontImg = this.add.image(cx, cy, frontKey)
            .setDisplaySize(SISO_TABLE_W, Math.round(SISO_TABLE_W * 52 / 96))
            .setDepth(BASE + 99);

          // customerImg — 3레이어 폴백용 (compositeImg 없을 때)
          const customerImg = this.add.image(cx, cy - 18, '__MISSING')
            .setDisplaySize(32, 43).setVisible(false).setDepth(BASE + 50);

          // compositeImg — 테이블+손님 통합 이미지 (waiting/seated). 있으면 3레이어 대체
          // cy-20: 64px 타일 기준으로 테이블 상단(~픽셀45) 이 cy-4에 맞는 오프셋
          const compositeImg = this.add.image(cx, cy - 10, '__MISSING')
            .setDisplaySize(72, 72).setVisible(false).setDepth(BASE + 2);

          container.setData('tableBackImg', tableBackImg);
          container.setData('tableFrontImg', tableFrontImg);
          container.setData('customerImg', customerImg);
          container.setData('compositeImg', compositeImg);
          container.setData('useLayered', true);
        } else {
          // ── fallback: 기존 단일 tableImg + custIconImg 방식 ──
          const tableKey = `table_lv${grade}`;
          if (SpriteLoader.hasTexture(this, tableKey)) {
            const tableImg = this.add.image(0, 0, tableKey)
              .setDisplaySize(SISO_TABLE_W, SISO_TABLE_H);
            container.add(tableImg);
            container.setData('tableImg', tableImg);
          } else {
            // fallback: 다이아몬드 폴리곤
            const gfx = this.add.graphics();
            gfx.fillStyle(TABLE_COLORS[grade], 0.7);
            gfx.fillPoints([
              { x: 0,              y: -SISO_HALF_H },
              { x: SISO_HALF_W,    y: 0            },
              { x: 0,              y: SISO_HALF_H  },
              { x: -SISO_HALF_W,   y: 0            },
            ], true);
            gfx.lineStyle(TABLE_STROKE_WIDTH[grade], TABLE_STROKE_COLOR[grade]);
            gfx.strokePoints([
              { x: 0,              y: -SISO_HALF_H },
              { x: SISO_HALF_W,    y: 0            },
              { x: 0,              y: SISO_HALF_H  },
              { x: -SISO_HALF_W,   y: 0            },
            ], true);
            container.add(gfx);
          }
          container.setData('useLayered', false);
        }

        // "빈 테이블" 텍스트
        const statusText = this.add.text(0, -SISO_HALF_H + 8, '\uBE48 \uD14C\uC774\uBE14', {
          fontSize: '10px', color: '#888888',
        }).setOrigin(0.5);
        container.add(statusText);

        // 말풍선 (숨겨짐)
        const bubble = this.add.rectangle(0, -SISO_HALF_H - 18, 80, 22, 0xffffff, 0.9)
          .setStrokeStyle(1, 0x000000).setVisible(false);
        container.add(bubble);
        const bubbleText = this.add.text(0, -SISO_HALF_H - 18, '', {
          fontSize: '9px', color: '#333333',
        }).setOrigin(0.5).setVisible(false);
        container.add(bubbleText);

        // 인내심 바 (숨겨짐)
        const pBarBg = this.add.rectangle(0, SISO_HALF_H + 6, 60, 6, 0x333333).setVisible(false);
        container.add(pBarBg);
        const pBarFill = this.add.rectangle(-30, SISO_HALF_H + 6, 60, 6, 0x00ff00)
          .setOrigin(0, 0.5).setVisible(false);
        container.add(pBarFill);

        // 손님 아이콘 — Phase 19-4: 스프라이트 Image + fallback Text 이중 생성
        // Phase 52: useLayered=true일 때 custIconImg는 미사용, custIconText는 이모지 폴백용 유지
        const custIconImg = this.add.image(0, -5, '__MISSING')
          .setDisplaySize(32, 32).setVisible(false);
        container.add(custIconImg);
        const custIconText = this.add.text(0, -5, '', {
          fontSize: '24px',
        }).setOrigin(0.5).setVisible(false);
        container.add(custIconText);

        // 터치 영역 (다이아몬드 외접 사각형)
        const hitArea = this.add.rectangle(0, 0, SISO_TABLE_W + 10, SISO_TABLE_H + 10, 0x000000, 0)
          .setInteractive({ useHandCursor: true });
        container.add(hitArea);
        hitArea.on('pointerdown', () => this._onTableTap(idx));

        this.tableContainers.push(container);

        // UI 참조 저장
        container.setData('statusText', statusText);
        container.setData('bubble', bubble);
        container.setData('bubbleText', bubbleText);
        container.setData('pBarBg', pBarBg);
        container.setData('pBarFill', pBarFill);
        container.setData('custIconImg', custIconImg);
        container.setData('custIconText', custIconText);
      }
    }
  }

  /**
   * 테이블 UI 업데이트.
   * @param {number} idx - 테이블 인덱스
   * @private
   */
  _updateTableUI(idx) {
    const container = this.tableContainers[idx];
    const cust = this.tables[idx];
    const statusText = container.getData('statusText');
    const bubble = container.getData('bubble');
    const bubbleText = container.getData('bubbleText');
    const pBarBg = container.getData('pBarBg');
    const pBarFill = container.getData('pBarFill');
    const custIconImg = container.getData('custIconImg');
    const custIconText = container.getData('custIconText');
    const useLayered = container.getData('useLayered');

    if (!cust) {
      // Phase 11-3c: 빈 테이블이 이미 빈 상태면 렌더 상태 변경 생략
      if (container.getData('_isEmpty')) return;
      container.setData('_isEmpty', true);

      if (useLayered) {
        // Phase 52+: 빈 테이블은 원본 table_lv0.png(밝은 갈색)를 compositeImg로 표시.
        // back/front(어두운 갈색)는 밝은 바닥 배경과 대비가 낮아 가시성 불량.
        const emptyGrade = this.tableUpgrades[idx] || 0;
        const emptyKey = `table_lv${emptyGrade}`;
        const compositeImg = container.getData('compositeImg');
        if (compositeImg && SpriteLoader.hasTexture(this, emptyKey)) {
          compositeImg.setTexture(emptyKey).setDisplaySize(90, 70).setVisible(true);
          container.getData('tableBackImg')?.setVisible(false);
          container.getData('tableFrontImg')?.setVisible(false);
        } else {
          compositeImg?.setVisible(false);
          container.getData('tableBackImg')?.setVisible(true);
          container.getData('tableFrontImg')?.setVisible(true);
        }
        container.getData('customerImg')?.setVisible(false);
      } else {
        // 빈 테이블 — 컴포짓 해제 후 empty 텍스처로 복원
        const tImgEmpty = container.getData('tableImg');
        if (tImgEmpty) {
          const emptyGrade = this.tableUpgrades[idx] || 0;
          tImgEmpty.setTexture(`table_lv${emptyGrade}`)
            .setDisplaySize(SISO_TABLE_W, SISO_TABLE_H)
            .setY(0);
        }
      }
      statusText.setText('\uBE48 \uD14C\uC774\uBE14').setVisible(true);
      bubble.setVisible(false);
      bubbleText.setVisible(false);
      pBarBg.setVisible(false);
      pBarFill.setVisible(false);
      custIconImg.setVisible(false);
      custIconText.setVisible(false);
      return;
    }

    // 손님이 앉으면 빈 상태 플래그 해제
    container.setData('_isEmpty', false);

    statusText.setVisible(false);

    // Phase 52+: 테이블 렌더링 업데이트 (복합 이미지 우선, 3레이어 폴백)
    if (useLayered) {
      const custType = cust.customerType || 'normal';
      const isServed = cust.served || (custType === 'group' && cust.groupServed);
      const state = isServed ? 'seated' : 'waiting';
      const grade = this.tableUpgrades[idx] || 0;
      const compositeKey = `table_lv${grade}_${state}`;
      const compositeImg = container.getData('compositeImg');
      const customerImg  = container.getData('customerImg');

      if (SpriteLoader.hasTexture(this, compositeKey)) {
        // ── 복합 이미지 모드: 테이블+손님 통합 에셋으로 3레이어 대체 ──
        container.getData('tableBackImg')?.setVisible(false);
        container.getData('tableFrontImg')?.setVisible(false);
        customerImg?.setVisible(false);
        // Phase 52+: 90×68 (비율 유지) — 사람이 더 크게 보임
        compositeImg?.setTexture(compositeKey).setDisplaySize(90, 68).setVisible(true);
        custIconText.setVisible(false);
      } else {
        // ── 3레이어 폴백: 기존 손님 스프라이트 (크기 확대) ──
        container.getData('tableBackImg')?.setVisible(true);
        container.getData('tableFrontImg')?.setVisible(true);
        compositeImg?.setVisible(false);
        const custSpriteKey = `customer_${custType}_${state}`;
        const fallbackKey   = `customer_${custType}`;
        if (SpriteLoader.hasTexture(this, custSpriteKey)) {
          const w = (custType === 'group') ? 52 : 40;
          const h = (custType === 'group') ? 70 : 56;
          customerImg.setTexture(custSpriteKey).setDisplaySize(w, h).setVisible(true);
          custIconText.setVisible(false);
        } else if (SpriteLoader.hasTexture(this, fallbackKey)) {
          customerImg.setTexture(fallbackKey).setDisplaySize(40, 40).setVisible(true);
          custIconText.setVisible(false);
        } else {
          customerImg.setVisible(false);
          const typeIcon = CUSTOMER_TYPE_ICONS[custType] || CUSTOMER_TYPE_ICONS.normal;
          const servedMark = (custType === 'group' && cust.groupServed) ? '\u2705' : '';
          custIconText.setText(servedMark || typeIcon).setVisible(true);
        }
      }
      custIconImg.setVisible(false);
    } else {
      // 기존 컴포짓(_occupied) + 아이콘 방식 유지
      const grade = this.tableUpgrades[idx] || 0;
      const occupiedKey = `table_lv${grade}_occupied`;
      const tImg = container.getData('tableImg');
      const useComposite = tImg && SpriteLoader.hasTexture(this, occupiedKey);

      if (useComposite) {
        // occupied 컴포짓: 높이 비율 96/80 = 1.2배, Y=-6으로 바닥 정렬 유지
        const occH = Math.round(SISO_TABLE_H * 1.2); // 67
        tImg.setTexture(occupiedKey).setDisplaySize(SISO_TABLE_W, occH).setY(-6);
        custIconImg.setVisible(false);
        custIconText.setVisible(false);
      } else {
        // fallback: 기존 손님 아이콘 방식 (컴포짓 없는 경우)
        const custType = cust.customerType || 'normal';
        const custSpriteKey = `customer_${custType}`;
        const typeIcon = CUSTOMER_TYPE_ICONS[custType] || CUSTOMER_TYPE_ICONS.normal;
        // 단체 손님 부분 서빙 완료 시 체크마크 표시
        const servedMark = (custType === 'group' && cust.groupServed) ? '\u2705' : '';

        if (!servedMark && SpriteLoader.hasTexture(this, custSpriteKey)) {
          custIconImg.setTexture(custSpriteKey).setDisplaySize(32, 32).setVisible(true);
          custIconText.setVisible(false);
        } else {
          custIconImg.setVisible(false);
          custIconText.setText(servedMark || typeIcon).setVisible(true);
        }
      }
    }

    // 말풍선 — 요리 이름
    const recipe = RECIPE_MAP[cust.dish];
    const dishName = recipe?.nameKo || cust.dish;
    bubble.setVisible(true);
    bubbleText.setText(dishName).setVisible(true);

    // 인내심 바
    pBarBg.setVisible(true);
    pBarFill.setVisible(true);
    const ratio = Math.max(0, cust.patience / cust.maxPatience);
    pBarFill.setScale(ratio, 1);

    // 색상 변경
    let pColor = 0x00ff00;
    if (ratio < 0.3) pColor = 0xff0000;
    else if (ratio < 0.6) pColor = 0xffcc00;
    pBarFill.setFillStyle(pColor);
  }

  // ── 조리 슬롯 (280~340px) ────────────────────────────────────────

  /** @private */
  _createCookingSlots() {
    // Phase 60-8: 조리·재고·레시피 공통 배경을 9-slice panel_dark로 교체
    NineSliceFactory.panel(
      this,
      GAME_WIDTH / 2,
      COOK_Y + (RECIPE_Y + RECIPE_H - COOK_Y) / 2,
      GAME_WIDTH,
      RECIPE_Y + RECIPE_H - COOK_Y,
      'dark',
    ).setDepth(0);
    // 🔥 조리 섹션 레이블
    this.add.text(10, COOK_Y + 4, '\uD83D\uDD25 \uC870\uB9AC', {
      fontSize: '10px', color: '#8B6914', fontStyle: 'bold',
    }).setDepth(10);
    // COOK↔STOCK 구분선 (Phase 60-8: 1px rect → divider_h 2px 앰버 톤)
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, STOCK_Y, GAME_WIDTH, 2).setDepth(9);

    /** @type {Phaser.GameObjects.Container[]} */
    this.cookSlotContainers = [];
    const slotW = GAME_WIDTH / MAX_COOKING_SLOTS;

    for (let i = 0; i < MAX_COOKING_SLOTS; i++) {
      const cx = slotW * i + slotW / 2;
      const cy = COOK_Y + COOK_H / 2;

      const container = this.add.container(cx, cy).setDepth(10);

      // 슬롯 배경 (Phase 60-9: rectangle → NineSliceFactory.panel 'stone')
      // 외부 panel_dark와 명도 대비를 위해 석조 텍스처 사용.
      const bgPanel = NineSliceFactory.panel(this, 0, 0, slotW - 10, COOK_H - 10, 'stone');
      container.add(bgPanel);
      if (SpriteLoader.hasTexture(this, 'counter_cooking')) {
        // 카운터 이미지를 슬롯 왼쪽에 자연 크기(비율 유지)로 배치
        const iconH = COOK_H - 14;
        const icon = this.add.image(-(slotW / 2) + iconH / 2 + 4, 0, 'counter_cooking')
          .setDisplaySize(iconH, iconH)
          .setAlpha(0.9);
        container.add(icon);
      }

      // 라벨
      const label = this.add.text(0, -12, '\uBE48 \uC2AC\uB86F', {
        fontSize: '11px', color: '#888888',
      }).setOrigin(0.5);
      container.add(label);

      // 진행 바 (Phase 60-9: progBg+progFill rect → NineSliceFactory.progressBar)
      // 높이 14로 확장(bar_frame_h insets 6+6 요구 수용). 동일 위치 유지(y=10 → y=12).
      const progBar = NineSliceFactory.progressBar(this, 0, 12, slotW - 30, 14, {
        tint: 0x44aaff,
        value: 0,
        shine: false,
        paddingX: 2,
        paddingY: 2,
      });
      container.add(progBar);

      // 버리기 버튼 — ready 상태일 때만 표시
      const discardBtnW = 60;
      const discardBtnX = (slotW - 10) / 2 - discardBtnW / 2 - 2;
      const discardBtn = this.add.rectangle(discardBtnX, -12, discardBtnW, 20, 0x662222)
        .setStrokeStyle(1, 0xaa4444)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
      container.add(discardBtn);
      const discardLabel = this.add.text(discardBtnX, -12, '🗑 버리기', {
        fontSize: '9px', color: '#ffaaaa',
      }).setOrigin(0.5).setVisible(false);
      container.add(discardLabel);
      discardBtn.on('pointerdown', () => this._discardDish(i));

      container.setData('label', label);
      // Phase 60-9: progFill 데이터키를 progressBar Container로 재사용(setValue/setTint API 기반)
      container.setData('progFill', progBar);
      container.setData('progWidth', slotW - 30);
      container.setData('discardBtn', discardBtn);
      container.setData('discardLabel', discardLabel);

      this.cookSlotContainers.push(container);
    }
  }

  /**
   * 조리 슬롯 UI 업데이트.
   * Phase 8-4: 세척 중 상태 UI 추가.
   * @param {number} idx
   * @private
   */
  _updateCookSlotUI(idx) {
    const container = this.cookSlotContainers[idx];
    const slot = this.cookingSlots[idx];
    const label = container.getData('label');
    const progFill = container.getData('progFill');
    const progWidth = container.getData('progWidth');
    const discardBtn = container.getData('discardBtn');
    const discardLabel = container.getData('discardLabel');

    // 기본적으로 버리기 버튼 숨김
    discardBtn?.setVisible(false);
    discardLabel?.setVisible(false);

    // Phase 8-5: 주방 사고로 비활성화된 슬롯
    // Phase 60-9: progFill은 progressBar Container → setValue(0~1)/setTint 사용.
    if (idx === this.accidentSlotIdx) {
      label.setText('\uD83D\uDD25 \uC0AC\uC6A9 \uBD88\uAC00').setColor('#ff4444');
      progFill.setValue(0);
      progFill.setTint(0xff4444);
      return;
    }

    // 세척 중 상태
    if (slot.washing) {
      const remain = Math.ceil(slot.washTimeLeft / 1000);
      label.setText(`\uC138\uCC99\uC911... ${remain}\uCD08`).setColor('#aaaaaa');
      const ratio = 1 - (slot.washTimeLeft / WASH_TIME_MS);
      progFill.setValue(Math.max(0, ratio));
      progFill.setTint(0x888888);
      return;
    }

    if (!slot.recipe) {
      label.setText('\uBE48 \uC2AC\uB86F').setColor('#888888');
      progFill.setValue(0);
      return;
    }

    // 조리 중/완료 모두 버리기 버튼 표시
    discardBtn?.setVisible(true);
    discardLabel?.setVisible(true);

    if (slot.ready) {
      label.setText(`\u2705 ${slot.recipe.nameKo}`).setColor('#44ff44');
      progFill.setValue(1);
      progFill.setTint(0x44ff44);
    } else {
      const remain = Math.ceil(slot.timeLeft / 1000);
      label.setText(`\uC870\uB9AC\uC911: ${slot.recipe.nameKo} ${remain}\uCD08`).setColor('#ffffff');
      const ratio = 1 - (slot.timeLeft / slot.totalTime);
      progFill.setValue(Math.max(0, ratio));
      progFill.setTint(0x44aaff);
    }
  }

  // ── 재료 재고 패널 (340~440px) ────────────────────────────────────

  /** @private */
  _createInventoryPanel() {
    // Phase 19-6: 개별 배경 제거 — _createCookingSlots() 공통 배경으로 통합
    // STOCK↔RECIPE 구분선 (Phase 60-8: 1px rect → divider_h 2px)
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, RECIPE_Y, GAME_WIDTH, 2).setDepth(9);

    this.add.text(10, STOCK_Y + 5, '\uD83E\uDD55 \uC7AC\uACE0', {
      fontSize: '11px', color: '#8B6914', fontStyle: 'bold',
    }).setDepth(10);

    /** @type {Object<string, Phaser.GameObjects.Text>} */
    this.stockTexts = {};

    const allTypes = Object.keys(INGREDIENT_TYPES);
    const cols = 5;
    const cellW = GAME_WIDTH / cols;
    const startY = STOCK_Y + 22;

    allTypes.forEach((type, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = cellW * col + 10;
      const y = startY + row * 28;

      const info = INGREDIENT_TYPES[type];
      const qty = this.inventoryManager.inventory[type] || 0;
      // Phase 19-6: 활성 텍스트 색상 → 웜 앰버
      const txt = this.add.text(x, y, `${info.icon}\u00D7${qty}`, {
        fontSize: '13px', color: qty > 0 ? '#e8c87a' : '#555555',
      }).setDepth(10);
      this.stockTexts[type] = txt;
    });
  }

  /** @private */
  _updateInventoryPanel() {
    for (const [type, txt] of Object.entries(this.stockTexts)) {
      const qty = this.inventoryManager.inventory[type] || 0;
      const info = INGREDIENT_TYPES[type];
      txt.setText(`${info.icon}\u00D7${qty}`);
      txt.setColor(qty > 0 ? '#e8c87a' : '#555555');
    }
  }

  // ── 레시피 퀵슬롯 (440~570px) ────────────────────────────────────

  /** @private */
  _createRecipeQuickSlots() {
    // Phase 19-6: 개별 배경 제거 — _createCookingSlots() 공통 배경으로 통합

    this.add.text(10, RECIPE_Y + 5, '\uD83D\uDCCB \uB808\uC2DC\uD53C', {
      fontSize: '11px', color: '#8B6914', fontStyle: 'bold',
    }).setDepth(10);

    /** @type {{ btn: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text, recipe: object }[]} */
    this.recipeButtons = [];

    const startY = RECIPE_Y + 22;
    const cols = 3;
    const btnW = 110;
    const btnH = 48;
    const gapX = (GAME_WIDTH - cols * btnW) / (cols + 1);
    const gapY = 6;

    this.availableRecipes.forEach((recipe, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gapX + col * (btnW + gapX) + btnW / 2;
      const y = startY + row * (btnH + gapY) + btnH / 2;

      // 스크롤 영역 밖이면 일단 생성은 하되 클리핑으로 처리
      // Phase 19-6: 버튼 배경 웜 다크 팔레트로 통합
      const bg = this.add.rectangle(x, y, btnW, btnH, 0x2d1a0a)
        .setStrokeStyle(1, 0x4a3520)
        .setInteractive({ useHandCursor: true })
        .setDepth(10);
      bg.on('pointerover', () => bg.setFillStyle(0x4a2e10));
      bg.on('pointerout',  () => bg.setFillStyle(0x2d1a0a));

      // 레시피 이름 + 재료 요약
      const ingStr = Object.entries(recipe.ingredients)
        .map(([t, n]) => `${INGREDIENT_TYPES[t]?.icon || t}${n}`)
        .join('');
      // Phase 19-6: 텍스트 색상 웜 앰버로 통합
      const label = this.add.text(x, y - 6, recipe.nameKo, {
        fontSize: '10px', color: '#e8c87a', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);
      const subLabel = this.add.text(x, y + 10, ingStr, {
        fontSize: '10px', color: '#b89a5a',
      }).setOrigin(0.5).setDepth(11);

      bg.on('pointerdown', () => this._onRecipeTap(recipe));

      this.recipeButtons.push({ btn: bg, text: label, subText: subLabel, recipe });
    });
  }

  /** 레시피 퀵슬롯 활성/비활성 갱신 (Phase 12: 솔드아웃 표시) */
  _updateRecipeQuickSlots() {
    for (const entry of this.recipeButtons) {
      const canMake = this.inventoryManager.hasEnough(entry.recipe.ingredients);
      if (canMake) {
        // Phase 19-6: 활성 색상 웜 팔레트
        entry.btn.setFillStyle(0x2d1a0a).setAlpha(1);
        entry.text.setColor('#e8c87a');
        if (entry.soldOutText) entry.soldOutText.setVisible(false);
      } else {
        // Phase 19-6: 비활성 색상 웜 팔레트
        entry.btn.setFillStyle(0x1c1008).setAlpha(0.5);
        entry.text.setColor('#6b4a2a');
        // 솔드아웃 라벨 표시
        if (!entry.soldOutText) {
          entry.soldOutText = this.add.text(entry.btn.x, entry.btn.y, 'SOLD OUT', {
            fontSize: '10px', fontStyle: 'bold', color: '#ff4444',
            stroke: '#000', strokeThickness: 2,
          }).setOrigin(0.5).setDepth(entry.btn.depth + 1);
        }
        entry.soldOutText.setVisible(true);
      }
    }
  }

  // ── 하단 바 (570~640px) ───────────────────────────────────────────

  /** @private */
  _createBottomBar() {
    // Phase 60-7: rectangle 배경 → 9-slice panel_dark
    NineSliceFactory.panel(this, GAME_WIDTH / 2, BOTTOM_Y + BOTTOM_H / 2, GAME_WIDTH, BOTTOM_H, 'dark')
      .setDepth(600);

    // ── Phase 8-6: 셰프 영업 액티브 스킬 버튼 ──
    const chefData = ChefManager.getChefData();
    const skill = ChefManager.getServiceSkill();

    if (chefData && skill) {
      // Phase 60-7: rectangle+text → 9-slice button (primary 변형).
      // skillBtnBg = Container, skillBtnText = 내부 라벨 (외부 참조 호환 유지).
      const skillBtn = NineSliceFactory.button(
        this, 70, BOTTOM_Y + 14, 120, 36,
        `${chefData.icon} ${skill.name}`,
        {
          variant: 'primary',
          onClick: () => this._onSkillTap(),
          textStyle: { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' },
        }
      );
      skillBtn.setDepth(601);
      this.skillBtnBg = skillBtn;
      this.skillBtnText = skillBtn._label;
    } else {
      // 셰프 미선택 시 기존 텍스트 표시
      this.skillBtnBg = null;
      this.skillBtnText = null;
      this.add.text(20, BOTTOM_Y + 14, '\uC158\uD504 \uC5C6\uC74C', {
        fontSize: '11px', color: '#aaddff',
      }).setOrigin(0, 0.5).setDepth(601);
    }

    // ── Phase 8-4: 직원 아이콘 표시 ──
    this._createStaffIcons();

    // Phase 60-5: primitive rect 버튼 → NineSliceFactory.button
    // 일시정지 버튼 (secondary 변형, 크림/나무결 톤)
    const pauseBtn = NineSliceFactory.button(
      this, GAME_WIDTH - 50, BOTTOM_Y + BOTTOM_H / 2, 80, 44,
      '\u23F8 \uC77C\uC2DC\uC815\uC9C0',
      {
        variant: 'secondary',
        onClick: () => this._togglePause(),
        textStyle: { fontSize: '11px' },
      }
    );
    pauseBtn.setDepth(601);
    this.pauseLabel = pauseBtn._label; // 외부 참조 호환 (현재 미사용이나 유지)

    // 장사 마감 버튼 — 일시정지 상태일 때만 표시 (danger 변형, 붉은 톤)
    this.closingBtn = NineSliceFactory.button(
      this, GAME_WIDTH - 145, BOTTOM_Y + BOTTOM_H / 2, 80, 44,
      '🔒 마감',
      {
        variant: 'danger',
        onClick: () => {
          if (this.isPaused && !this.isServiceOver) {
            this._endService('manual');
          }
        },
        textStyle: { fontSize: '11px' },
      }
    );
    this.closingBtn.setDepth(601).setVisible(false);
    this.closingLabel = this.closingBtn._label; // 외부 참조 호환
  }

  /**
   * 직원 아이콘 생성 (하단 바).
   * 고용된 직원은 아이콘 표시, 미고용은 잠금 아이콘.
   * @private
   */
  _createStaffIcons() {
    const staffList = [
      { id: 'waiter', icon: STAFF_TYPES.waiter.icon, lockIcon: '\uD83D\uDD12' },
      { id: 'dishwasher', icon: STAFF_TYPES.dishwasher.icon, lockIcon: '\uD83D\uDD12' },
    ];

    const iconStartX = 20;
    const iconY = BOTTOM_Y + 48;

    staffList.forEach((s, i) => {
      const x = iconStartX + i * 36;
      const hired = SaveManager.isStaffHired(s.id);
      const displayIcon = hired ? s.icon : s.lockIcon;
      const color = hired ? '#ffffff' : '#555555';

      // Phase 52: depth 101→601 상향
      const iconText = this.add.text(x, iconY, displayIcon, {
        fontSize: '18px', color: color,
      }).setOrigin(0, 0.5).setDepth(601);

      // 참조 저장 (자동 서빙 애니메이션용)
      if (s.id === 'waiter') {
        this._waiterIcon = iconText;
      }
      if (s.id === 'dishwasher') {
        this._dishwasherIcon = iconText;
      }
    });
  }

  /**
   * 셰프 영업 패시브 설명 텍스트.
   * @param {string} chefId
   * @returns {string}
   * @private
   */
  _getServicePassiveDesc(chefId) {
    switch (chefId) {
      // Phase 56: Named 셰프 ID (구 ID도 하위 호환 유지)
      case 'mimi_chef':
      case 'petit_chef': return '\uC870\uB9AC\uC2DC\uAC04 -15%';
      case 'rin_chef':
      case 'flame_chef': return '\uAD6C\uC774 \uBCF4\uC0C1 +25%';
      case 'mage_chef':
      case 'ice_chef': return '\uC778\uB0B4\uC2EC +20%';
      case 'yuki_chef': return '\uC778\uB0B4\uC2EC +20%';
      case 'lao_chef': return '\uB3C4\uAD6C \uACF5\uACA9\uB825 +15%';
      case 'andre_chef': return '\uC591\uC2DD \uC694\uB9AC \uC218\uC775 +25%';
      case 'arjun_chef': return '\uD5A5\uC2E0\uB8CC \uD0C0\uC6CC \uACF5\uACA9 \uC18D\uB3C4 +20%';
      default: return '';
    }
  }

  // ── Phase 8-6: 셰프 영업 액티브 스킬 ──────────────────────────────

  /**
   * 스킬 버튼 클릭 핸들러.
   * 쿨다운 시작 + 스킬 유형별 효과 발동.
   * @private
   */
  _onSkillTap() {
    if (this.skillCooldownLeft > 0 || this.isPaused || this.isServiceOver) return;

    const skill = ChefManager.getServiceSkill();
    if (!skill) return;

    const chefData = ChefManager.getChefData();

    // 쿨다운 시작
    this.skillCooldownLeft = skill.cooldown;
    this.skillCooldownMax = skill.cooldown;

    switch (skill.type) {
      case 'patience_reset':
        this.patienceResetRemaining = skill.value; // 3
        this._showMessage(`${chefData.icon} \uD2B9\uAE09 \uC11C\uBE44\uC2A4! \uB2E4\uC74C ${skill.value}\uBA85 \uC778\uB0B4\uC2EC \uB9AC\uC14B`);
        break;
      case 'instant_cook':
        this._activateInstantCook();
        this._showMessage(`${chefData.icon} \uD654\uC5FC \uC870\uB9AC! \uBAA8\uB4E0 \uC694\uB9AC \uC989\uC2DC \uC644\uC131!`);
        break;
      case 'freeze_patience':
        this._activateFreezePatience(skill.value); // 10000ms
        this._showMessage('\u2744\uFE0F \uC2DC\uAC04 \uB3D9\uACB0! 10\uCD08\uAC04 \uC778\uB0B4\uC2EC \uC815\uC9C0');
        break;
      case 'precision_cut':
        // 유키: 다음 N개 요리 조리시간 0
        this._precisionCutRemaining = skill.count || 5;
        this._showMessage(`${chefData.icon} \uC815\uBC00 \uC808\uB2E8! \uB2E4\uC74C ${this._precisionCutRemaining}\uAC1C \uC694\uB9AC \uc989\uc2dc \uc644\uc131`);
        break;
      case 'flame_wok':
        // 라오: 전 테이블 주문 즉시 완성 (조리 중인 모든 슬롯 완성)
        this._activateInstantCook();
        this._showMessage(`${chefData.icon} \uBD88\uAF43 \uC6F9! \uBAA8\uB4E0 \uC694\uB9AC \uC989\uC2DC \uC644\uC131!`);
        break;
    }
  }

  /**
   * 화염 조리 스킬: 조리 중인 모든 요리 즉시 완성.
   * @private
   */
  _activateInstantCook() {
    for (let i = 0; i < this.cookingSlots.length; i++) {
      const slot = this.cookingSlots[i];
      // 조리 중인 슬롯만 (세척/사고/빈 슬롯 제외)
      if (slot.recipe && !slot.ready && !slot.washing && i !== this.accidentSlotIdx) {
        slot.ready = true;
        slot.timeLeft = 0;
      }
      this._updateCookSlotUI(i);
    }
  }

  /**
   * 시간 동결 스킬: 전체 손님 인내심 일정 시간 정지.
   * @param {number} duration - 동결 지속시간 (ms)
   * @private
   */
  _activateFreezePatience(duration) {
    this.patienceFrozen = true;
    this.freezeTimeLeft = duration;
  }

  /**
   * 스킬 버튼 UI 업데이트 (쿨다운/준비 상태 반영).
   * @private
   */
  _updateSkillButton() {
    if (!this.skillBtnBg || !this.skillBtnText) return;

    const chefData = ChefManager.getChefData();
    const skill = ChefManager.getServiceSkill();
    if (!chefData || !skill) return;

    // Phase 60-7: skillBtnBg는 Container(_bg = 9-slice). setFillStyle 대신 _bg.setTint 사용.
    const bgNS = this.skillBtnBg._bg;
    if (this.skillCooldownLeft > 0) {
      // 쿨다운 중: 어둡게 + 남은 초 표시
      if (bgNS) bgNS.setTint(0x555566);
      const remainSec = Math.ceil(this.skillCooldownLeft / 1000);
      this.skillBtnText.setText(`${remainSec}\uCD08`).setColor('#888888');
    } else if (this.patienceResetRemaining > 0) {
      // 꼬마셰프: 리셋 남은 수 표시
      if (bgNS) bgNS.setTint(0x88dd88);
      this.skillBtnText.setText(`\uB9AC\uC14B \uB0A8\uC74C: ${this.patienceResetRemaining}\uBA85`).setColor('#ffffff');
    } else {
      // 준비 완료: 밝게 + 스킬 이름
      if (bgNS && bgNS.clearTint) bgNS.clearTint();
      this.skillBtnText.setText(`${chefData.icon} ${skill.name}`).setColor('#ffffff');
    }
  }

  // ── 일시정지 ──────────────────────────────────────────────────────

  /** @private */
  _togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseLabel.setText(this.isPaused ? '\u25B6 \uC7AC\uAC1C' : '\u23F8 \uC77C\uC2DC\uC815\uC9C0');
    // 마감 버튼: 일시정지 중일 때만 표시
    this.closingBtn.setVisible(this.isPaused);
    this.closingLabel.setVisible(this.isPaused);
  }

  // ── 메인 업데이트 루프 ────────────────────────────────────────────

  /**
   * @param {number} time
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.isPaused || this.isServiceOver) return;

    const dt = delta / 1000; // 초 단위

    // 영업 시간 감소
    this.serviceTimeLeft -= dt;
    if (this.serviceTimeLeft <= 0) {
      this.serviceTimeLeft = 0;
      this._endService('time');
      return;
    }

    // 손님 스폰
    this._updateCustomerSpawn(dt);

    // 손님 인내심 감소
    this._updateCustomerPatience(delta);

    // 조리 진행
    this._updateCooking(delta);

    // Phase 8-4: 자동 서빙 처리
    if (this.hasWaiter) {
      this._updateAutoServe(delta);
    }

    // Phase 8-5: 영업 이벤트 시스템 업데이트
    this._updateEvents(dt);

    // Phase 8-6: 스킬 쿨다운 감소
    if (this.skillCooldownLeft > 0) {
      this.skillCooldownLeft -= delta;
      if (this.skillCooldownLeft < 0) this.skillCooldownLeft = 0;
    }

    // Phase 8-6: 인내심 동결 타이머 감소
    if (this.patienceFrozen) {
      this.freezeTimeLeft -= delta;
      if (this.freezeTimeLeft <= 0) {
        this.patienceFrozen = false;
        this.freezeTimeLeft = 0;
      }
    }

    // Phase 8-6: 스킬 버튼 UI 갱신
    this._updateSkillButton();

    // 재료 소진 체크 — Phase 8-4: 세척 중인 슬롯도 "진행 중"으로 간주
    // Phase 12: 재고는 남아있지만 만들 수 있는 레시피가 없는 경우도 조기종료
    if (!this._hasCookingInProgress() && !this._hasReadyDish() && !this._hasWashingSlot()) {
      if (this._isAllStockEmpty()) {
        this._endService('stock');
        return;
      }
      if (!this._canMakeAnyRecipe()) {
        this._endService('no_recipe');
        return;
      }
    }

    // ── Phase 11-3a: 영업 튜토리얼 자동 진행 ──
    if (this._tutorial?.isActive()) {
      this._updateTutorialAdvance();
    }

    // HUD 갱신
    this._updateHUD();
  }

  /**
   * 영업 튜토리얼 자동 진행 조건 체크.
   * 각 단계 조건이 처음 충족될 때 advance()를 호출한다.
   * @private
   */
  _updateTutorialAdvance() {
    const step = this._tutorial._stepIndex;

    // step 0: 첫 번째 손님이 착석하면 advance
    if (step === 0 && !this._tutAdvanced0) {
      const hasSeated = this.tables.some(t => t !== null);
      if (hasSeated) {
        this._tutAdvanced0 = true;
        this._tutorial.advance();
      }
    }

    // step 1: 첫 번째 조리 슬롯에 요리가 배정되면 advance
    if (step === 1 && !this._tutAdvanced1) {
      const hasCooking = this.cookingSlots.some(s => s.recipe !== null);
      if (hasCooking) {
        this._tutAdvanced1 = true;
        this._tutorial.advance();
      }
    }

    // step 2: 첫 번째 요리가 완료(ready=true)되면 advance
    if (step === 2 && !this._tutAdvanced2) {
      const hasReady = this.cookingSlots.some(s => s.recipe && s.ready);
      if (hasReady) {
        this._tutAdvanced2 = true;
        this._tutorial.advance();
      }
    }

    // step 3: 첫 번째 서빙 완료(servedCount > 0)되면 advance → end
    if (step === 3 && !this._tutAdvanced3) {
      if (this.servedCount > 0) {
        this._tutAdvanced3 = true;
        this._tutorial.advance();
        // Phase 16-1: 첫 서빙 완료 튜토리얼 대사 트리거
        StoryManager.checkTriggers(this, 'tutorial_first_serve');
      }
    }
  }

  // ── 손님 스폰 ─────────────────────────────────────────────────────

  /**
   * 손님 스폰 타이머 관리.
   * Phase 8-5: 해피아워(간격 /2), 비 오는 날(간격 ×2) 이벤트 반영.
   * @param {number} dt - 초
   * @private
   */
  _updateCustomerSpawn(dt) {
    if (this.customersSpawned >= this.serviceConfig.maxCustomers) return;

    this.customerSpawnTimer += dt;

    // Phase 8-5: 이벤트에 따른 스폰 간격 조정
    let interval = this.serviceConfig.customerInterval;
    if (this.activeEvent) {
      if (this.activeEvent.type === 'happy_hour') {
        interval /= 2; // 2배 빈도
      } else if (this.activeEvent.type === 'rainy_day') {
        interval *= 2; // 50% 감소
      }
    }

    if (this.customerSpawnTimer >= interval) {
      this.customerSpawnTimer -= interval;
      this._spawnCustomer();
    }
  }

  /**
   * 손님 생성.
   * Phase 8-5: 특수 손님 시스템 (normal/vip/gourmet/rushed/group).
   * @private
   */
  _spawnCustomer() {
    // 빈 테이블 목록 수집
    const emptyIndices = [];
    for (let i = 0; i < this.tableCount; i++) {
      if (this.tables[i] === null) emptyIndices.push(i);
    }
    if (emptyIndices.length === 0) return; // 만석

    // ── Phase 8-5: 손님 유형 결정 ──
    let customerType = this._determineCustomerType(emptyIndices);

    // 단체 손님: 빈 테이블 2개 이상 필요
    if (customerType === 'group' && emptyIndices.length < 2) {
      customerType = 'normal';
    }

    // 단체 손님 처리
    if (customerType === 'group') {
      this._spawnGroupCustomer(emptyIndices);
      return;
    }

    // 일반/VIP/미식가/급한 손님 공통 스폰
    const emptyIdx = emptyIndices[0];
    this._spawnSingleCustomer(emptyIdx, customerType);
  }

  /**
   * 손님 유형 결정 (장별 확률 기반).
   * 맛집 리뷰 이벤트 활성 시 VIP 강제.
   * @param {number[]} emptyIndices - 빈 테이블 인덱스 목록
   * @returns {string} customerType
   * @private
   */
  _determineCustomerType(emptyIndices) {
    // 맛집 리뷰 이벤트: 남은 VIP 강제 카운트가 있으면 VIP
    if (this.foodReviewRemaining > 0) {
      return 'vip';
    }

    const roll = Math.random();
    let threshold = 0;

    // 순서: vip → gourmet → rushed → group
    threshold += this.specialRates.vip;
    if (roll < threshold) return 'vip';

    threshold += this.specialRates.gourmet;
    if (roll < threshold) return 'gourmet';

    threshold += this.specialRates.rushed;
    if (roll < threshold) return 'rushed';

    threshold += this.specialRates.group;
    if (roll < threshold && emptyIndices.length >= 2) return 'group';

    return 'normal';
  }

  /**
   * 단일 손님 스폰 (일반/VIP/미식가/급한).
   * @param {number} tableIdx - 배정할 테이블 인덱스
   * @param {string} customerType - 손님 유형
   * @private
   */
  _spawnSingleCustomer(tableIdx, customerType) {
    // 레시피 풀 결정
    const recipe = this._pickRecipeForType(customerType);
    if (!recipe) return;

    // ── 인내심 계산: 기본 * 셰프 * (1 + 테이블 + 인테리어) * 유형 배율 * 이벤트 ──
    const chefPatienceBonus = ChefManager.getPatienceBonus();
    const tableGrade = this.tableUpgrades[tableIdx] || 0;
    const tablePatienceBonus = TABLE_PATIENCE_BONUS[tableGrade];
    const interiorPatienceBonus = FLOWER_PATIENCE_BONUS[this.interiorFlower] || 0;
    const basePat = this.serviceConfig.customerPatience * 1000; // ms
    // Phase 51-2: 유랑 미력사 인내심 버프 반영 (this._patienceMults 사용)
    const patienceTable = this._patienceMults || CUSTOMER_PATIENCE_MULT;
    const typeMult = patienceTable[customerType] || 1.0;

    // 비 오는 날 이벤트: 인내심 +50%
    const eventPatienceMult = (this.activeEvent && this.activeEvent.type === 'rainy_day') ? 1.5 : 1.0;

    const totalPatience = basePat * chefPatienceBonus * (1 + tablePatienceBonus + interiorPatienceBonus) * typeMult * eventPatienceMult;

    const customer = {
      dish: recipe.id,
      recipe: recipe,
      patience: totalPatience,
      maxPatience: totalPatience,
      baseReward: recipe.baseReward,
      tipMultiplier: 1.5,
      vip: customerType === 'vip',
      customerType: customerType,
      tableIdx: tableIdx,
      groupPairIdx: -1, // 단체가 아니면 -1
    };

    // Phase 8-6: 꼬마셰프 특급 서비스 — 인내심 최대치 리셋
    if (this.patienceResetRemaining > 0) {
      customer.patience = customer.maxPatience;
      this.patienceResetRemaining--;
    }

    this.tables[tableIdx] = customer;
    this.customersSpawned++;
    this.totalCustomers++;

    // 맛집 리뷰 VIP 카운트 감소
    if (this.foodReviewRemaining > 0 && customerType === 'vip') {
      this.foodReviewRemaining--;
      if (this.foodReviewRemaining <= 0) {
        this._endEvent();
      }
    }

    this._updateTableUI(tableIdx);
    this._playEntranceEffect(tableIdx);
    SoundManager.playSFX('sfx_customer_in');
  }

  /**
   * 단체 손님 스폰 (테이블 2석 점유, 주문 2개 동시).
   * @param {number[]} emptyIndices - 빈 테이블 인덱스 목록 (2개 이상 보장)
   * @private
   */
  _spawnGroupCustomer(emptyIndices) {
    const idx1 = emptyIndices[0];
    const idx2 = emptyIndices[1];

    // 각각 다른 레시피 주문
    const recipe1 = this._pickRecipeForType('group');
    let recipe2 = this._pickRecipeForType('group');
    // 가능하면 다른 레시피 (3번까지 시도)
    for (let attempt = 0; attempt < 3 && recipe2 && recipe2.id === recipe1.id; attempt++) {
      recipe2 = this._pickRecipeForType('group');
    }
    if (!recipe1 || !recipe2) return;

    // 인내심 계산 (두 테이블 중 낮은 등급 기준, 배율 ×1.2)
    const chefPatienceBonus = ChefManager.getPatienceBonus();
    const grade1 = this.tableUpgrades[idx1] || 0;
    const grade2 = this.tableUpgrades[idx2] || 0;
    const minGrade = Math.min(grade1, grade2);
    const tablePatienceBonus = TABLE_PATIENCE_BONUS[minGrade];
    const interiorPatienceBonus = FLOWER_PATIENCE_BONUS[this.interiorFlower] || 0;
    const basePat = this.serviceConfig.customerPatience * 1000;
    const typeMult = (this._patienceMults || CUSTOMER_PATIENCE_MULT).group;
    const eventPatienceMult = (this.activeEvent && this.activeEvent.type === 'rainy_day') ? 1.5 : 1.0;

    const totalPatience = basePat * chefPatienceBonus * (1 + tablePatienceBonus + interiorPatienceBonus) * typeMult * eventPatienceMult;

    // 두 손님이 인내심을 공유 (동일 참조)
    const sharedPatience = { value: totalPatience, max: totalPatience };

    const createGroupMember = (tableIdx, recipe, pairIdx) => ({
      dish: recipe.id,
      recipe: recipe,
      patience: totalPatience,
      maxPatience: totalPatience,
      baseReward: recipe.baseReward,
      tipMultiplier: 1.5,
      vip: false,
      customerType: 'group',
      tableIdx: tableIdx,
      groupPairIdx: pairIdx,
      groupServed: false,      // 이 좌석의 서빙 완료 여부
      sharedPatience: sharedPatience, // 인내심 공유 참조
    });

    const member1 = createGroupMember(idx1, recipe1, idx2);
    const member2 = createGroupMember(idx2, recipe2, idx1);

    // Phase 8-6: 꼬마셰프 특급 서비스 — 인내심 최대치 리셋 (단체 각 멤버 개별 카운트)
    if (this.patienceResetRemaining > 0) {
      member1.patience = member1.maxPatience;
      if (member1.sharedPatience) member1.sharedPatience.value = member1.maxPatience;
      this.patienceResetRemaining--;
    }
    if (this.patienceResetRemaining > 0) {
      member2.patience = member2.maxPatience;
      // sharedPatience는 동일 참조이므로 이미 위에서 리셋됨
      this.patienceResetRemaining--;
    }

    this.tables[idx1] = member1;
    this.tables[idx2] = member2;

    this.customersSpawned += 2;
    this.totalCustomers += 2;

    this._updateTableUI(idx1);
    this._updateTableUI(idx2);
    this._playEntranceEffect(idx1);
    this._playEntranceEffect(idx2);
  }

  /**
   * 손님 유형에 맞는 레시피 선택.
   * 미식가: tier >= 3인 레시피만.
   * @param {string} customerType
   * @returns {object|null}
   * @private
   */
  _pickRecipeForType(customerType) {
    // Phase 12: 재고로 만들 수 있는 레시피만 주문 (솔드아웃 처리)
    const craftable = this.availableRecipes.filter(r =>
      this.inventoryManager.hasEnough(r.ingredients)
    );
    if (craftable.length === 0) return null;

    if (customerType === 'gourmet') {
      // 미식가: 만들 수 있는 것 중 ★★★ 이상 우선
      const highTier = craftable.filter(r => r.tier >= 3);
      const pool = highTier.length > 0 ? highTier : craftable;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Phase 51-1: 미력 나그네 — 상위 30% 등급(tier >= 3) 우선
    if (customerType === 'mireuk_traveler') {
      const highTier = craftable.filter(r => r.tier >= 3);
      const pool = highTier.length > 0 ? highTier : craftable;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // 일반/VIP/급한/단체: 만들 수 있는 레시피에서 랜덤 선택
    return craftable[Math.floor(Math.random() * craftable.length)];
  }

  /**
   * 손님 입장 이펙트.
   * @param {number} tableIdx
   * @private
   */
  _playEntranceEffect(tableIdx) {
    const cont = this.tableContainers[tableIdx];
    this.tweens.add({
      targets: cont,
      scaleX: { from: 0.8, to: 1 },
      scaleY: { from: 0.8, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  // ── 손님 인내심 ───────────────────────────────────────────────────

  /**
   * 손님 인내심 감소 처리.
   * Phase 8-5: 단체 손님 인내심 공유 + 급한 손님 퇴장 시 추가 페널티.
   * Phase 8-6: 시간 동결 스킬 활성 시 인내심 감소 스킵.
   * @param {number} delta - ms
   * @private
   */
  _updateCustomerPatience(delta) {
    // Phase 8-6: 동결 중에는 인내심 감소 스킵 (퇴장 체크도 건너뜀)
    if (this.patienceFrozen) return;

    // 단체 손님 인내심 공유: sharedPatience.value를 한 번만 감소시키기 위해 처리된 쌍 추적
    const processedGroupPairs = new Set();

    for (let i = 0; i < this.tableCount; i++) {
      const cust = this.tables[i];
      if (!cust) continue;

      // 단체 손님: sharedPatience 한 번만 감소
      if (cust.customerType === 'group' && cust.sharedPatience) {
        const pairKey = Math.min(i, cust.groupPairIdx) + '-' + Math.max(i, cust.groupPairIdx);
        if (!processedGroupPairs.has(pairKey)) {
          processedGroupPairs.add(pairKey);
          cust.sharedPatience.value -= delta;
        }
        // 공유 인내심 값을 각 멤버에 동기화
        cust.patience = cust.sharedPatience.value;
      } else {
        cust.patience -= delta;
      }

      this._updateTableUI(i);

      if (cust.patience <= 0) {
        // ── Phase 51-3: 요코 연쇄 퇴장 방지 ──
        if (this._yokoProtectNext) {
          // 인내심을 최솟값(500ms)으로 고정하여 퇴장 지연
          cust.patience = 500;
          if (cust.customerType === 'group' && cust.sharedPatience) {
            cust.sharedPatience.value = 500;
          }
          this._yokoProtectNext = false;
          this._yokoProtectActive = true;
          // VFX: 퇴장 방지 알림
          if (this.tableContainers[i] && this.vfx) {
            this.vfx.floatingText(this.tableContainers[i].x, this.tableContainers[i].y - 30, '\u26A1 \uC5F0\uC1C4 \uD1F4\uC7A5 \uBC29\uC9C0!', '#ffaa00', 16);
          }
          this._updateTableUI(i);
          continue; // 이 손님은 퇴장하지 않고 다음 테이블로 진행
        }

        // 기본 만족도 감소
        let satPenalty = 15;

        // 급한 손님 추가 페널티: -10% 추가
        if (cust.customerType === 'rushed') {
          satPenalty += 10;
        }

        // 단체 손님 퇴장: 짝 테이블도 동시 비우기
        if (cust.customerType === 'group' && cust.groupPairIdx >= 0) {
          const pairIdx = cust.groupPairIdx;
          if (this.tables[pairIdx]) {
            this.tables[pairIdx] = null;
            this._updateTableUI(pairIdx);
            this._showFloatingText(this.tableContainers[pairIdx], '\uD83D\uDE21 퇴장', '#ff4444');
          }
        }

        this.tables[i] = null;
        this.satisfaction = Math.max(0, this.satisfaction - satPenalty);
        this.comboCount = 0;

        // Phase 51-3: 손님 자연 퇴장 시 요코 카운터 리셋
        this._yokoChainCount = 0;
        this._yokoProtectNext = false;
        this._yokoProtectActive = false;

        this._updateTableUI(i);
        SoundManager.playSFX('sfx_customer_out');

        // 퇴장 이펙트
        this._showFloatingText(this.tableContainers[i], `\uD83D\uDE21 -${satPenalty}%`, '#ff4444');
        // VFX: 불만 이모지 (Phase 10-5)
        if (this.tableContainers[i]) {
          this.vfx.customerEmoji(this.tableContainers[i].x, this.tableContainers[i].y - 20, false);
        }

        // 만족도 0% 체크
        if (this.satisfaction <= 0) {
          this._endService('satisfaction');
          return;
        }
      }
    }
  }

  /**
   * 재고 소진으로 주문 불가능해진 착석 손님을 패널티 없이 퇴장시킨다.
   * consumeRecipe 직후 호출하여 이미 착석한 손님이 솔드아웃 메뉴를 무한 대기하는 문제를 해결한다.
   * 단, 이미 조리 중이거나 완성된 요리가 있는 레시피의 손님은 퇴장 제외 (재료 소비 후 즉시 쫓겨나는 버그 방지).
   * @private
   */
  _dismissSoldOutCustomers() {
    // 현재 조리 중이거나 완성 대기 중인 레시피 ID 집합
    const cookingRecipeIds = new Set(
      this.cookingSlots
        .filter(s => s && s.recipe)
        .map(s => s.recipe.id)
    );

    for (let i = 0; i < this.tableCount; i++) {
      const cust = this.tables[i];
      if (!cust) continue;
      if (this.inventoryManager.hasEnough(cust.recipe.ingredients)) continue;
      // 이 손님의 요리가 조리 중이면 퇴장 보류
      if (cookingRecipeIds.has(cust.recipe.id)) continue;

      // 단체 손님: 짝 테이블도 함께 퇴장
      if (cust.customerType === 'group' && cust.groupPairIdx >= 0) {
        const pairIdx = cust.groupPairIdx;
        if (this.tables[pairIdx]) {
          this.tables[pairIdx] = null;
          this._updateTableUI(pairIdx);
          if (this.tableContainers[pairIdx]) {
            this._showFloatingText(this.tableContainers[pairIdx], '재료 소진', '#ffaa44');
          }
        }
      }

      // 패널티 없이 퇴장 — 재고 부족은 레스토랑 측 사유
      this.tables[i] = null;
      this._updateTableUI(i);
      if (this.tableContainers[i]) {
        this._showFloatingText(this.tableContainers[i], '재료 소진', '#ffaa44');
      }
    }
  }

  // ── 조리 진행 ─────────────────────────────────────────────────────

  /**
   * 조리 진행 + 세척 카운트다운 (Phase 8-4).
   * @param {number} delta - ms
   * @private
   */
  _updateCooking(delta) {
    for (let i = 0; i < this.cookingSlots.length; i++) {
      const slot = this.cookingSlots[i];

      // Phase 8-4: 세척 중인 슬롯 카운트다운
      if (slot.washing) {
        slot.washTimeLeft -= delta;
        if (slot.washTimeLeft <= 0) {
          slot.washing = false;
          slot.washTimeLeft = 0;
        }
        this._updateCookSlotUI(i);
        continue;
      }

      if (!slot.recipe || slot.ready) {
        this._updateCookSlotUI(i);
        continue;
      }

      slot.timeLeft -= delta;
      if (slot.timeLeft <= 0) {
        slot.timeLeft = 0;
        slot.ready = true;
      }
      this._updateCookSlotUI(i);
    }
  }

  // ── 조리 슬롯 버리기 ──────────────────────────────────────────────

  /**
   * 조리 중이거나 완료된 요리를 슬롯에서 버린다.
   * Phase 51-3: 아이다 버프 활성 시 확률로 재료를 회수한다.
   * @param {number} idx 슬롯 인덱스
   * @private
   */
  _discardDish(idx) {
    if (this.isServiceOver || this.isPaused) return;
    const slot = this.cookingSlots[idx];
    if (!slot.recipe) return;

    const name = slot.recipe?.nameKo || '요리';

    // ── Phase 51-3: 아이다 재료 회수 — 조리 중(미완성) 슬롯 버릴 때 확률로 재료 반환 ──
    if (this._buffIngredientRefund > 0 && slot.recipe && !slot.ready) {
      const refundRoll = Math.random();
      if (refundRoll < this._buffIngredientRefund) {
        this.inventoryManager.addIngredients(slot.recipe.ingredients);
        this._updateInventoryPanel();
        this._updateRecipeQuickSlots();
        this._showMessage('재료 회수됨!');
      }
    }

    slot.recipe = null;
    slot.timeLeft = 0;
    slot.totalTime = 0;
    slot.ready = false;

    // Phase 51-3: 아이다 3단계 — 버린 슬롯 즉시 재사용 가능 (세척 생략)
    if (this._buffNoFailDelay) {
      slot.washing = false;
      slot.washTimeLeft = 0;
    }

    this._updateCookSlotUI(idx);
    this._showMessage(`${name} 버림`);
  }

  // ── 레시피 탭 → 조리 시작 ─────────────────────────────────────────

  /**
   * 레시피 퀵슬롯 탭 시 호출.
   * @param {object} recipe
   * @private
   */
  _onRecipeTap(recipe) {
    if (this.isServiceOver || this.isPaused) return;

    // 재료 확인
    if (!this.inventoryManager.hasEnough(recipe.ingredients)) {
      this._showMessage('\uC7AC\uB8CC \uBD80\uC871!');
      return;
    }

    // 빈 조리 슬롯 확인 — Phase 8-4: 세척 중, Phase 8-5: 사고 슬롯도 사용 불가
    const emptySlot = this.cookingSlots.findIndex((s, idx) => !s.recipe && !s.washing && idx !== this.accidentSlotIdx);
    if (emptySlot === -1) {
      this._showMessage('\uC870\uB9AC \uC2AC\uB86F\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4!');
      return;
    }

    // 재료 소비
    this.inventoryManager.consumeRecipe(recipe.ingredients);
    this._updateInventoryPanel();
    this._updateRecipeQuickSlots();

    // 조리 시작 — Phase 8-3: 인테리어 오픈키친 보너스 적용
    const cookTimeBonus = ChefManager.getCookTimeBonus();
    const kitchenBonus = KITCHEN_COOK_BONUS[this.interiorKitchen] || 0;
    // Phase 51-2: 유랑 미력사 조리 시간 감소 버프 반영
    const wanderingCookReduce = this._buffCookTimeReduce || 0;
    // precision_cut(유키 serviceSkill): 남은 카운트가 있으면 즉시 조리
    let totalTime = recipe.cookTime * cookTimeBonus * (1 - kitchenBonus) * (1 - wanderingCookReduce);
    if (this._precisionCutRemaining > 0) {
      totalTime = 0;
      this._precisionCutRemaining--;
    }
    this.cookingSlots[emptySlot] = {
      recipe: recipe,
      timeLeft: totalTime,
      totalTime: totalTime,
      ready: totalTime === 0,
      washing: false,
      washTimeLeft: 0,
    };
    this._updateCookSlotUI(emptySlot);

    // 재고 소진으로 주문 불가한 착석 손님 즉시 퇴장 (패널티 없음)
    // ⚠️ cookingSlots 할당 후 호출해야 조리 중인 레시피가 제외됨
    this._dismissSoldOutCustomers();
  }

  // ── 테이블 탭 → 서빙 ──────────────────────────────────────────────

  /**
   * 테이블 탭 시 호출.
   * 완성된 요리가 있고 해당 손님의 주문과 일치하면 서빙.
   * @param {number} tableIdx
   * @private
   */
  _onTableTap(tableIdx) {
    if (this.isServiceOver || this.isPaused) return;

    const cust = this.tables[tableIdx];
    if (!cust) return;

    // Phase 8-5: 단체 손님 이미 서빙 완료된 좌석이면 무시
    if (cust.customerType === 'group' && cust.groupServed) {
      this._showMessage('\uC774\uBBF8 \uC11C\uBE59 \uC644\uB8CC\uB41C \uC88C\uC11D\uC785\uB2C8\uB2E4');
      return;
    }

    // 완성된 요리 슬롯 찾기 (해당 주문과 일치)
    const readySlotIdx = this.cookingSlots.findIndex(
      s => s.recipe && s.ready && s.recipe.id === cust.dish
    );

    if (readySlotIdx === -1) {
      this._showMessage('\uC8FC\uBB38\uACFC \uC77C\uCE58\uD558\uB294 \uC694\uB9AC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4');
      return;
    }

    this._serveToCustomer(tableIdx, readySlotIdx);
  }

  /**
   * 서빙 로직 (수동/자동 공통).
   * Phase 8-4: 서빙 완료 후 세척 대기시간 시작.
   * Phase 8-5: 특수 손님 보상 배율, 미식가 만족도 보너스, 단체 부분 서빙.
   * @param {number} tableIdx - 테이블 인덱스
   * @param {number} slotIdx - 조리 슬롯 인덱스
   * @param {boolean} [isAutoServe=false] - 자동 서빙 여부 (아이콘 애니메이션용)
   * @private
   */
  _serveToCustomer(tableIdx, slotIdx, isAutoServe = false) {
    const cust = this.tables[tableIdx];
    if (!cust) return;

    const slot = this.cookingSlots[slotIdx];
    const recipe = slot.recipe;

    // 팁 계산
    const patienceRatio = cust.patience / cust.maxPatience;
    let tipGrade;
    if (patienceRatio >= 0.5) {
      tipGrade = cust.tipMultiplier;
    } else if (patienceRatio >= 0.3) {
      tipGrade = 1.0;
    } else {
      tipGrade = 0.7;
    }

    // 콤보 보너스
    this.comboCount++;
    const comboMult = this._getComboMultiplier();

    // Phase 8-5: 특수 손님 보상 배율 (VIP 기존 2.0 → customerType 기반)
    const typeMult = CUSTOMER_REWARD_MULT[cust.customerType] || 1.0;

    // 그릴 카테고리 보너스
    const grillBonus = (recipe.category === 'grill') ? ChefManager.getGrillRewardBonus() : 1.0;

    // 만족도 상승
    const satGain = 5 + (recipe.tier - 1) * 3;
    if (patienceRatio > 0.5) {
      this.satisfaction = Math.min(100, this.satisfaction + satGain + 5);
    } else {
      this.satisfaction = Math.min(100, this.satisfaction + satGain);
    }

    // Phase 8-5: 미식가 서빙 성공 시 만족도 +5% 추가 보너스
    if (cust.customerType === 'gourmet') {
      this.satisfaction = Math.min(100, this.satisfaction + 5);
    }

    // ── Phase 8-3: 테이블 팁 배율 + 인테리어 조명 팁 보너스 적용 ──
    const tableGrade = this.tableUpgrades[tableIdx] || 0;
    const tableTipMult = TABLE_TIP_MULTIPLIERS[tableGrade];
    const interiorTipBonus = LIGHTING_TIP_BONUS[this.interiorLighting] || 0;

    // ── Phase 11-1: 엔드리스 스페셜 레시피 보상 배율 ──
    const isSpecial = this.isEndless && this.dailySpecials.includes(recipe.id);
    const specialMultiplier = isSpecial ? 2.0 : 1.0;

    // yuki_chef 패시브: tier 3 이상 레시피 보상 +15%
    const highStarBonus = (recipe.tier >= 3) ? ChefManager.getHighStarRewardBonus() : 1.0;

    // ── Phase 51-3: 유랑 미력사 버프 배율 계산 (독립 계수 곱셈) ──

    // 시엔 세션 초반 보너스 — 경과 시간이 _buffEarlyDuration 이내이면 추가 배율
    const elapsedSec = this.serviceConfig.duration - this.serviceTimeLeft;
    const earlyMult = (this._buffEarlyBonus > 0 && elapsedSec <= this._buffEarlyDuration)
      ? (1 + this._buffEarlyBonus)
      : 1.0;

    // 로살리오 VIP 보너스 — VIP 손님 서빙 시 추가 배율
    const vipBonus = (cust.customerType === 'vip' && this._buffVipRewardMult > 0)
      ? (1 + this._buffVipRewardMult)
      : 1.0;

    // 레이라 미식가 보너스 — 미식가 손님 서빙 시 추가 배율
    const gourmetBonus = (cust.customerType === 'gourmet' && this._buffGourmetRewardMult > 0)
      ? (1 + this._buffGourmetRewardMult)
      : 1.0;

    // 요코 퇴장 방지 발동 시 골드 보너스
    const yokoProtectBonus = (this._yokoProtectActive && this._yokoChainReward > 0)
      ? (1 + this._yokoChainReward)
      : 1.0;

    // 골드 = 기본보상 * 테이블팁 * 인테리어팁 * 서빙등급 * 콤보 * 유형배율
    //       * 그릴 * 스페셜 * 고급레시피 (← 스토리 셰프/인테리어 버프)
    //       * earlyMult * vipBonus * gourmetBonus * yokoProtectBonus (← 유랑 미력사 버프, 독립 계수 곱셈)
    // 스토리 셰프 버프(ChefManager)와 미력사 버프는 독립 슬롯으로 분리되어 중첩 적용된다.
    // 참고: docs/CHEF_SKILL_REDESIGN.md 2-4절
    const baseGold = cust.baseReward;
    const totalGold = Math.floor(
      baseGold
      * tableTipMult
      * (1 + interiorTipBonus)
      * tipGrade
      * comboMult
      * typeMult
      * grillBonus
      * specialMultiplier
      * highStarBonus
      * earlyMult        // [Phase 51-3] 시엔 세션 초반 보너스
      * vipBonus         // [Phase 51-3] 로살리오 VIP 보너스
      * gourmetBonus     // [Phase 51-3] 레이라 미식가 보너스
      * yokoProtectBonus // [Phase 51-3] 요코 퇴장 방지 보너스
    );

    // 요코 연쇄 서빙 카운터 처리
    if (this._yokoChainThreshold > 0) {
      this._yokoChainCount++;
      if (this._yokoChainCount >= this._yokoChainThreshold) {
        this._yokoProtectNext = true;
        this._yokoChainCount = 0; // 카운터 리셋
      }
    }

    // 서빙 완료 후 요코 퇴장 방지 상태 리셋
    this._yokoProtectActive = false;

    this.totalGold += totalGold;
    this.servedCount++;
    SoundManager.playSFX('sfx_serve');

    // 팁 추적 (기본 보상 초과분이 팁)
    const tipAmount = Math.max(0, totalGold - baseGold);
    this.tipTotal += tipAmount;

    // 최대 콤보 추적
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }

    // ── Phase 8-4: 서빙 후 세척 대기시간 시작 ──
    const washTime = this.hasDishwasher ? 0 : WASH_TIME_MS;
    if (washTime > 0) {
      this.cookingSlots[slotIdx] = {
        recipe: null, timeLeft: 0, totalTime: 0, ready: false,
        washing: true, washTimeLeft: washTime,
      };
    } else {
      this.cookingSlots[slotIdx] = {
        recipe: null, timeLeft: 0, totalTime: 0, ready: false,
        washing: false, washTimeLeft: 0,
      };
    }
    this._updateCookSlotUI(slotIdx);

    // ── Phase 8-5: 단체 손님 부분 서빙 처리 ──
    if (cust.customerType === 'group' && cust.groupPairIdx >= 0) {
      cust.groupServed = true;
      const pairCust = this.tables[cust.groupPairIdx];

      if (pairCust && pairCust.groupServed) {
        // 짝도 서빙 완료 → 두 테이블 모두 비우기
        this.tables[tableIdx] = null;
        this.tables[cust.groupPairIdx] = null;
        this._updateTableUI(tableIdx);
        this._updateTableUI(cust.groupPairIdx);
      } else {
        // 짝 아직 미서빙 → 이 좌석만 서빙 완료 표시, 테이블은 유지
        this._updateTableUI(tableIdx);
      }
    } else {
      // 일반/VIP/미식가/급한: 테이블 즉시 비우기
      this.tables[tableIdx] = null;
      this._updateTableUI(tableIdx);
    }

    // ── Phase 51-1: 미력 나그네 서빙 완료 — 정수 드롭 ──
    if (cust.customerType === 'mireuk_traveler') {
      const essenceDrop = patienceRatio >= 0.8 ? 3 : patienceRatio >= 0.4 ? 2 : 1;
      SaveManager.addMireukEssence(essenceDrop);
      SaveManager.incrementMireukTravelerCount();

      // HUD 정수 보유량 갱신
      this._updateMireukHUD();

      // VFX: 보라색 플로팅 텍스트
      const tblCont = this.tableContainers[tableIdx];
      if (tblCont && this.vfx) {
        this.vfx.floatingText(tblCont.x, tblCont.y - 30, `\uD83D\uDCAE +${essenceDrop} \uC815\uC218!`, '#b266ff', 16);
      }
    }

    // 서빙 이펙트
    const tipStr = tipGrade > 1 ? ' +\uD301!' : '';
    this._showFloatingText(
      this.tableContainers[tableIdx],
      `+${totalGold}G${tipStr}`,
      '#ffd700'
    );

    // Phase 11-1: 스페셜 레시피 서빙 시 추가 VFX
    if (isSpecial) {
      const tblCont = this.tableContainers[tableIdx];
      if (tblCont && this.vfx) {
        this.vfx.floatingText(tblCont.x, tblCont.y - 30, `\uD83C\uDF1F \uC2A4\uD398\uC15C! +${totalGold}g`, '#ffd700', 18);
      }
    }

    // VFX: 서빙 성공 반짝이 + 손님 만족 이모지 (Phase 10-5)
    const tblContainer = this.tableContainers[tableIdx];
    if (tblContainer) {
      this.vfx.serveSuccess(tblContainer.x, tblContainer.y);
      this.vfx.customerEmoji(tblContainer.x, tblContainer.y - 20, true);
    }

    // VFX: 콤보 텍스트 (3콤보 이상)
    if (this.comboCount >= 3) {
      this.vfx.comboPopup(this.comboCount);
      SoundManager.playSFX('sfx_combo');
    }
    // VFX: 5콤보 이상 시 콤보 폭발
    if (this.comboCount >= 5) {
      this.vfx.comboBurst(GAME_WIDTH / 2, 320);
    }

    // 자동 서빙 시 직원 아이콘 반짝 애니메이션
    if (isAutoServe && this._waiterIcon) {
      this.tweens.add({
        targets: this._waiterIcon,
        alpha: { from: 0.5, to: 1.0 },
        duration: 300,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }

    // 레시피 슬롯 갱신
    this._updateRecipeQuickSlots();
    this._updateHUD();
  }

  /**
   * 콤보 보너스 배율.
   * @returns {number}
   * @private
   */
  _getComboMultiplier() {
    if (this.comboCount >= 8) return 1.50;
    if (this.comboCount >= 5) return 1.25;
    if (this.comboCount >= 3) return 1.10;
    return 1.0;
  }

  // ── Phase 11-1: 데일리 스페셜 팝업 ──────────────────────────────

  /**
   * 오늘의 스페셜 레시피 3종을 안내하는 팝업을 표시한다.
   * 팝업은 4초 후 자동으로 닫힌다. 탭으로도 닫힌다.
   * @private
   */
  _showDailySpecialsPopup() {
    const cx = GAME_WIDTH / 2;  // 180
    const panelW = 280;
    const panelH = 200;
    const panelCy = 220;

    const container = this.add.container(0, 0).setDepth(2000);

    // 반투명 오버레이
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setInteractive();
    container.add(overlay);

    // 팝업 배경
    const bg = this.add.rectangle(cx, panelCy, panelW, panelH, 0x1a0000)
      .setStrokeStyle(2, 0xffd700);
    container.add(bg);

    // 제목
    const title = this.add.text(cx, 160, '\uD83C\uDF1F \uC624\uB298\uC758 \uC2A4\uD398\uC15C \uB808\uC2DC\uD53C!', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(title);

    // 레시피 3종 리스트
    const recipeYStart = 185;
    this.dailySpecials.forEach((recipeId, i) => {
      const recipe = RECIPE_MAP[recipeId];
      if (!recipe) return;
      const txt = this.add.text(cx, recipeYStart + i * 20, `${recipe.icon || '\uD83C\uDF73'} ${recipe.nameKo}`, {
        fontSize: '14px', color: '#ffffff',
      }).setOrigin(0.5);
      container.add(txt);
    });

    // 보상 안내
    const bonusText = this.add.text(cx, 250, '\uC11C\uBE59 \uC2DC \uBCF4\uC0C1 \u00D72.0 \uD83C\uDF89', {
      fontSize: '14px', fontStyle: 'bold', color: '#ff6b35',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(bonusText);

    // 확인 버튼
    const okBtn = this.add.rectangle(cx, 278, 120, 36, 0xff6b35)
      .setInteractive({ useHandCursor: true });
    container.add(okBtn);
    const okText = this.add.text(cx, 278, '\uD655\uC778', {
      fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(okText);

    /** 팝업 닫기 */
    const closePopup = () => {
      if (autoCloseTimer) autoCloseTimer.remove();
      container.destroy();
    };

    okBtn.on('pointerdown', closePopup);
    overlay.on('pointerdown', closePopup);

    // 4초 자동 닫기
    const autoCloseTimer = this.time.delayedCall(4000, closePopup);
  }

  // ── 영업 종료 ─────────────────────────────────────────────────────

  /**
   * 영업 종료 처리.
   * @param {'time'|'stock'|'satisfaction'} reason
   * @private
   */
  _endService(reason) {
    if (this.isServiceOver) return;
    this.isServiceOver = true;

    let message;
    let isVictory = true;
    switch (reason) {
      case 'time':
        message = '\uC601\uC5C5 \uC2DC\uAC04 \uC885\uB8CC!';
        break;
      case 'stock':
        message = '\uC7AC\uB8CC \uC18C\uC9C4! \uC601\uC5C5 \uC885\uB8CC';
        break;
      case 'no_recipe':
        message = '만들 수 있는 음식이 없습니다!\n영업을 조기 종료합니다';
        break;
      case 'satisfaction':
        message = '\uB808\uC2A4\uD1A0\uB791 \uD3D0\uC1C4!';
        isVictory = true; // 보상 50% 감소이지만 실패는 아님
        break;
      case 'manual':
        message = '장사 마감!';
        break;
    }

    // 만족도 0이면 보상 50% 감소
    if (this.satisfaction <= 0) {
      this.totalGold = Math.floor(this.totalGold * 0.5);
    }

    // Phase 13-2: 영업 수입을 영구 골드에 누적
    const earnedGold = this.totalGold + this.tipTotal;
    if (earnedGold > 0) {
      ToolManager.addGold(earnedGold);

      // ── 업적: 누적 골드 카운터 + 체크 (Phase 42) ──
      AchievementManager.increment('total_gold_earned', earnedGold);
      AchievementManager.check(this, 'total_gold_earned', 0);
    }
    // ── 업적: 직원/인테리어 체크 (Phase 42) ──
    AchievementManager.check(this, 'staff_hired', 0);
    AchievementManager.check(this, 'interior_maxed', 0);

    this._showMessage(message, 2000);

    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // ── Phase 13-4: 엔드리스 모드 시 MerchantScene 경유 후 EndlessScene 복귀 ──
        if (this.isEndless) {
          const updatedMaxCombo = Math.max(this.endlessMaxCombo, this.maxCombo);
          const updatedScore = this.endlessScore + this.totalGold + this.tipTotal;

          this.scene.start('MerchantScene', {
            isEndless: true,
            endlessReturnData: {
              stageId: '1-1',
              lives: this.marketLives,
              endlessWave: this.endlessWave,
              endlessScore: updatedScore,
              endlessMaxCombo: updatedMaxCombo,
              dailySpecials: this.dailySpecials,
            },
          });
          return;
        }

        // ResultScene으로 전환 (장보기 + 영업 결과 통합)
        this.scene.start('ResultScene', {
          stageId: this.stageId,
          marketResult: this.marketResult,
          serviceResult: {
            servedCount: this.servedCount,
            totalCustomers: this.totalCustomers,
            goldEarned: this.totalGold,
            tipEarned: this.tipTotal,
            maxCombo: this.maxCombo,
            satisfaction: this.satisfaction,
          },
          isMarketFailed: false,
        });
      });
    });
  }

  // ── Phase 8-4: 자동 서빙 ─────────────────────────────────────────

  /**
   * 자동 서빙 업데이트.
   * 조리 완료 요리가 있고, 해당 주문 손님이 있으면 3초 딜레이 후 자동 서빙.
   * 가장 오래 기다린 손님 우선.
   * @param {number} delta - ms
   * @private
   */
  _updateAutoServe(delta) {
    // 완성된 요리 슬롯 찾기
    const readySlots = [];
    for (let i = 0; i < this.cookingSlots.length; i++) {
      const s = this.cookingSlots[i];
      if (s.recipe && s.ready) readySlots.push(i);
    }
    if (readySlots.length === 0) {
      this.autoServeTimer = 0;
      return;
    }

    // 해당 요리를 주문한 손님이 있는지 확인 (Phase 8-5: 이미 서빙된 단체 좌석 제외)
    let matchFound = false;
    for (const slotIdx of readySlots) {
      const dishId = this.cookingSlots[slotIdx].recipe.id;
      for (let t = 0; t < this.tableCount; t++) {
        const c = this.tables[t];
        if (c && c.dish === dishId && !(c.customerType === 'group' && c.groupServed)) {
          matchFound = true;
          break;
        }
      }
      if (matchFound) break;
    }

    if (!matchFound) {
      this.autoServeTimer = 0;
      return;
    }

    // 딜레이 카운트다운 — Phase 51-3: 무오 서빙 속도 버프 적용 (최대 80% 단축, 딜레이 최소 20% 보장)
    const effectiveServeDelay = AUTO_SERVE_DELAY_MS * (1 - Math.min(this._buffServeSpeed || 0, 0.80));
    this.autoServeTimer += delta;
    if (this.autoServeTimer < effectiveServeDelay) return;

    // 딜레이 경과 — 자동 서빙 실행
    this.autoServeTimer = 0;

    // 가장 오래 기다린 손님 (인내심이 가장 많이 소진된 = maxPatience - patience가 가장 큰) 우선
    for (const slotIdx of readySlots) {
      const dishId = this.cookingSlots[slotIdx].recipe.id;

      // 해당 주문 손님 중 가장 오래 기다린 손님 찾기
      let bestTableIdx = -1;
      let bestWaitTime = -1;

      for (let t = 0; t < this.tableCount; t++) {
        const c = this.tables[t];
        // Phase 8-5: 이미 서빙된 단체 좌석 제외
        if (c && c.dish === dishId && !(c.customerType === 'group' && c.groupServed)) {
          const waited = c.maxPatience - c.patience;
          if (waited > bestWaitTime) {
            bestWaitTime = waited;
            bestTableIdx = t;
          }
        }
      }

      if (bestTableIdx !== -1) {
        this._serveToCustomer(bestTableIdx, slotIdx, true);
        break; // 한 번에 1건만 자동 서빙
      }
    }
  }

  // ── Phase 8-5: 영업 이벤트 시스템 ────────────────────────────────

  /**
   * 이벤트 시스템 업데이트 (매 프레임).
   * - eventStartDelay 카운트다운
   * - eventCooldown 카운트다운
   * - 조건 충족 시 랜덤 이벤트 발생
   * - 활성 이벤트 timeLeft 감소, 만료 시 해제
   * @param {number} dt - 초 단위
   * @private
   */
  _updateEvents(dt) {
    // 최초 발생 대기시간 카운트다운
    if (this.eventStartDelay > 0) {
      this.eventStartDelay -= dt;
      return;
    }

    // 활성 이벤트 진행 중
    if (this.activeEvent) {
      // 시간 기반 이벤트 카운트다운 (food_review는 서빙 카운트 기반이므로 제외)
      if (this.activeEvent.type !== 'food_review') {
        this.activeEvent.timeLeft -= dt;
        if (this.activeEvent.timeLeft <= 0) {
          this._endEvent();
        }
      }
      return; // 이벤트 활성 중에는 새 이벤트 발생하지 않음
    }

    // 쿨다운 카운트다운
    if (this.eventCooldown > 0) {
      this.eventCooldown -= dt;
      return;
    }

    // 최대 발생 횟수 체크
    if (this.eventCount >= EVENT_MAX_COUNT) return;

    // 랜덤 이벤트 발생 (매 프레임 5% 확률 — 약 평균 0.33초에 1번 체크)
    if (Math.random() < 0.05 * dt) {
      this._triggerRandomEvent();
    }
  }

  /**
   * 랜덤 이벤트 발생.
   * @private
   */
  _triggerRandomEvent() {
    const types = Object.keys(SERVICE_EVENT_TYPES);
    let chosen;

    // Phase 51-3: 로살리오 3단계 — food_review 이벤트 확률 증가
    if (this._buffVipFoodReviewBonus > 0 && Math.random() < this._buffVipFoodReviewBonus) {
      chosen = 'food_review';
    } else {
      chosen = types[Math.floor(Math.random() * types.length)];
    }
    const evtDef = SERVICE_EVENT_TYPES[chosen];

    this.eventCount++;
    this.eventCooldown = EVENT_MIN_INTERVAL;

    // 이벤트 활성화
    this.activeEvent = {
      type: chosen,
      timeLeft: evtDef.duration > 0 ? evtDef.duration : 9999,
      data: {},
    };

    // 이벤트별 초기화
    switch (chosen) {
      case 'food_review':
        this.foodReviewRemaining = 5;
        break;
      case 'kitchen_accident':
        this._activateKitchenAccident();
        break;
    }

    // 이벤트 배너 표시
    this._showEventBanner(evtDef);

    // Phase 16-2: 이벤트별 캐릭터 반응 대화 트리거
    StoryManager.checkTriggers(this, 'service_event', { eventType: chosen });
  }

  /**
   * 주방 사고 이벤트: 빈 조리 슬롯 1개를 사용 불가로 설정.
   * @private
   */
  _activateKitchenAccident() {
    // 빈 슬롯 중 하나를 비활성화 (없으면 첫 번째 슬롯)
    let targetIdx = this.cookingSlots.findIndex(s => !s.recipe && !s.washing);
    if (targetIdx === -1) targetIdx = 0;
    this.accidentSlotIdx = targetIdx;
  }

  /**
   * 활성 이벤트 종료 및 효과 해제.
   * @private
   */
  _endEvent() {
    if (!this.activeEvent) return;

    // 이벤트별 정리
    switch (this.activeEvent.type) {
      case 'food_review':
        this.foodReviewRemaining = 0;
        break;
      case 'kitchen_accident':
        this.accidentSlotIdx = -1;
        break;
    }

    this.activeEvent = null;
  }

  /**
   * 이벤트 배너 팝업 표시.
   * 화면 중앙 상단에 배경색 + 아이콘 + 텍스트, 3초 후 페이드아웃.
   * @param {object} evtDef - SERVICE_EVENT_TYPES 항목
   * @private
   */
  _showEventBanner(evtDef) {
    const bannerW = GAME_WIDTH - 40;
    const bannerH = 36;
    const bannerX = GAME_WIDTH / 2;
    const bannerY = HUD_H + 30;

    // 배너 배경 (Phase 52: depth 250→700 상향)
    const bg = this.add.rectangle(bannerX, bannerY, bannerW, bannerH, evtDef.bannerColor, 0.9)
      .setStrokeStyle(1, 0xffffff)
      .setDepth(700);

    // 배너 텍스트 (Phase 52: depth 251→701 상향)
    const text = this.add.text(bannerX, bannerY, evtDef.messageKo, {
      fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(701);

    // 3초 후 페이드아웃
    this.time.delayedCall(EVENT_BANNER_DURATION * 1000, () => {
      this.tweens.add({
        targets: [bg, text],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          bg.destroy();
          text.destroy();
        },
      });
    });
  }

  // ── 유틸리티 ──────────────────────────────────────────────────────

  /**
   * 재고가 전부 비었는지 확인.
   * @returns {boolean}
   * @private
   */
  _isAllStockEmpty() {
    return this.inventoryManager.getTotal() === 0;
  }

  /**
   * 조리 중인 슬롯이 있는지 확인.
   * @returns {boolean}
   * @private
   */
  _hasCookingInProgress() {
    return this.cookingSlots.some(s => s.recipe && !s.ready);
  }

  /**
   * 완성된 요리가 있는지 확인.
   * @returns {boolean}
   * @private
   */
  _hasReadyDish() {
    return this.cookingSlots.some(s => s.recipe && s.ready);
  }

  /**
   * 세척 중인 슬롯이 있는지 확인 (Phase 8-4).
   * @returns {boolean}
   * @private
   */
  _hasWashingSlot() {
    return this.cookingSlots.some(s => s.washing);
  }

  /**
   * 현재 재고로 만들 수 있는 레시피가 하나라도 있는지 확인한다 (Phase 12).
   * @returns {boolean}
   * @private
   */
  _canMakeAnyRecipe() {
    return this.availableRecipes.some(r => this.inventoryManager.hasEnough(r.ingredients));
  }

  /**
   * 플로팅 텍스트 이펙트.
   * @param {Phaser.GameObjects.Container} target - 기준 컨테이너
   * @param {string} text
   * @param {string} color
   * @private
   */
  _showFloatingText(target, text, color) {
    // Phase 52: depth 200→750 상향
    const fx = this.add.text(target.x, target.y - 20, text, {
      fontSize: '14px', fontStyle: 'bold', color: color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(750);

    this.tweens.add({
      targets: fx,
      y: fx.y - 40,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => fx.destroy(),
    });
  }

  /**
   * 화면 중앙에 메시지 표시.
   * @param {string} text
   * @param {number} [duration=1500]
   * @private
   */
  _showMessage(text, duration = 1500) {
    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, text, {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
      backgroundColor: '#000000aa',
      padding: { x: 16, y: 8 },
      align: 'center',
    }).setOrigin(0.5).setDepth(800);

    this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: msg,
        alpha: 0,
        duration: 300,
        onComplete: () => msg.destroy(),
      });
    });
  }

  /** 씬 종료 시 정리 */
  _shutdown() {
    this.tables = [];
    this.cookingSlots = [];
    this.recipeButtons = [];
    // Phase 52: 3레이어 독립 이미지 오브젝트 해제 (메모리 누수 방지)
    for (const cont of this.tableContainers) {
      cont.getData('tableBackImg')?.destroy();
      cont.getData('tableFrontImg')?.destroy();
      cont.getData('customerImg')?.destroy();
    }
    this.tableContainers = [];
    this.cookSlotContainers = [];
    // Phase 8-5: 이벤트 정리
    this.activeEvent = null;
    this.accidentSlotIdx = -1;
    this.foodReviewRemaining = 0;
    // Phase 51-1: 미력 나그네 상태 정리
    this._mireukSpawned = false;
    // Phase 8-6: 스킬 상태 정리
    this.skillCooldownLeft = 0;
    this.skillCooldownMax = 0;
    this.patienceResetRemaining = 0;
    this.patienceFrozen = false;
    this.freezeTimeLeft = 0;
    this._precisionCutRemaining = 0;
    this.skillBtnBg = null;
    this.skillBtnText = null;
    // Phase 11-3a: 튜토리얼 정리
    this._tutorial?.end?.();

    // Phase 11-3c: 씬 전환 시 Tween/Timer 명시적 정리
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
