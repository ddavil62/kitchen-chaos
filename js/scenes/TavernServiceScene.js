/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 -- Phase D (Phase 95).
 * A1~A4: 레이아웃, 가구, 벤치 슬롯, Y축 깊이정렬.
 * Phase C: g1 테마, 인내심 게이지, 주문 말풍선, 골드 플로팅 VFX, 영업 HUD 바.
 * Phase D: ServiceScene.js 게임 로직 전체 포팅 (D1~D12).
 *
 * 기존 ServiceScene.js와 완전 독립. import/참조 없음 (코드 복사만 허용).
 *
 * 진입: URL ?scene=tavern&stageId=1-1 또는 DevHelper 디버그 메뉴.
 * 씬 키: 'TavernServiceScene'
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config.js';
import {
  TAVERN_LAYOUT,
  COUNTER_ANCHOR, COUNTER_W, COUNTER_H,
  DOOR_ANCHOR,
  CHEF_IDLE_ANCHORS, TABLE_SET_ANCHORS,
  BENCH_SLOTS, BENCH_CONFIG,
  BENCH_LEFT_OFFSET_X, BENCH_RIGHT_OFFSET_X,
  SEAT_CENTER_OFFSET_X,
  createSeatingState, occupySlot, vacateSlot, findFreeSlot, getSlotWorldPos,
} from '../data/tavernLayoutData.js';
import {
  ChefState, CustomerState,
  CHEF_STATE_COLORS, CUSTOMER_STATE_COLORS,
} from '../data/tavernStateData.js';

// ── D1: 게임 로직 import ──
import { STAGES } from '../data/stageData.js';
import { ALL_SERVING_RECIPES, RECIPE_MAP } from '../data/recipeData.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { WANDERING_CHEFS, getWanderingChefById } from '../data/wanderingChefData.js';
import { BranchEffects } from '../managers/BranchEffects.js';
import { DailyMissionManager } from '../managers/DailyMissionManager.js';
import { getCustomerProfile } from '../data/customerProfileData.js';
import { ToolManager } from '../managers/ToolManager.js';

// ── 조리 슬롯 수 ──
const MAX_COOKING_SLOTS = 2;
/** 세척 대기시간 (ms) */
const WASH_TIME_MS = 2000;

// ── 테이블 등급별 설정 ──
const TABLE_TIP_MULTIPLIERS = [1.0, 1.1, 1.25, 1.4, 1.6];
const TABLE_PATIENCE_BONUS = [0, 0.05, 0.10, 0.18, 0.25];

// ── 인테리어 효과값 ──
const FLOWER_PATIENCE_BONUS = [0, 0.05, 0.10, 0.16, 0.22, 0.30];
const KITCHEN_COOK_BONUS = [0, 0.05, 0.10, 0.16, 0.22, 0.30];
const LIGHTING_TIP_BONUS = [0, 0.08, 0.16, 0.25, 0.35, 0.50];

// ── 손님 유형별 상수 ──
const CUSTOMER_TYPE_ICONS = {
  normal: '\uD83D\uDE0A', vip: '\uD83D\uDC51', gourmet: '\uD83E\uDDD0',
  rushed: '\uD83D\uDE30', group: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66',
  mireuk_traveler: '\uD83D\uDCAE', critic: '\uD83D\uDCDD', regular: '\uD83C\uDFE0',
  student: '\uD83C\uDF92', traveler: '\uD83E\uDDF3', business: '\uD83D\uDCBC',
};
const CUSTOMER_PATIENCE_MULT = {
  normal: 1.0, vip: 0.7, gourmet: 1.0, rushed: 0.4, group: 1.2,
  mireuk_traveler: 1.5, critic: 1.3, regular: 1.1, student: 0.9, traveler: 1.4, business: 0.6,
};
const CUSTOMER_REWARD_MULT = {
  normal: 1.0, vip: 1.8, gourmet: 1.8, rushed: 2.5, group: 2.0,
  mireuk_traveler: 0.8, critic: 1.5, regular: 1.0, student: 0.7, traveler: 1.2, business: 1.6,
};
const SPECIAL_CUSTOMER_RATES = {
  1: { vip: 0.08, gourmet: 0, rushed: 0, group: 0, critic: 0, regular: 0.05, student: 0.10, traveler: 0.05, business: 0 },
  2: { vip: 0.10, gourmet: 0.05, rushed: 0.05, group: 0, critic: 0.03, regular: 0.08, student: 0.08, traveler: 0.05, business: 0.03 },
  3: { vip: 0.10, gourmet: 0.08, rushed: 0.06, group: 0.04, critic: 0.05, regular: 0.08, student: 0.06, traveler: 0.06, business: 0.05 },
};

// ── 영업 이벤트 ──
const SERVICE_EVENT_TYPES = {
  happy_hour: { type: 'happy_hour', icon: '\uD83C\uDF89', nameKo: '해피아워', messageKo: '\uD83C\uDF89 해피아워! 손님이 몰려옵니다!', bannerColor: 0xddaa00, duration: 30 },
  rainy_day: { type: 'rainy_day', icon: '\uD83C\uDF27\uFE0F', nameKo: '비 오는 날', messageKo: '\uD83C\uDF27\uFE0F 비 오는 날... 한가하지만 여유롭게', bannerColor: 0x3366aa, duration: 45 },
  food_review: { type: 'food_review', icon: '\u2B50', nameKo: '맛집 리뷰', messageKo: '\u2B50 맛집 리뷰 게재! VIP가 몰려옵니다!', bannerColor: 0x8844aa, duration: -1 },
  kitchen_accident: { type: 'kitchen_accident', icon: '\uD83D\uDD25', nameKo: '주방 사고', messageKo: '\uD83D\uDD25 주방 사고! 조리 슬롯 1개 사용 불가!', bannerColor: 0xcc2222, duration: 30 },
};
const EVENT_START_DELAY = 60;
const EVENT_MIN_INTERVAL = 45;
const EVENT_MAX_COUNT = 2;
const EVENT_BANNER_DURATION = 3;

// ── 에셋 모드 ──
const ASSET_MODE = 'real';

// ── 실 에셋 텍스처 키 매핑 ──
const REAL_KEY_MAP = Object.freeze({
  'tavern_dummy_counter_v12': 'tavern_counter_v12',
  'tavern_dummy_entrance_v12': 'tavern_entrance_v12',
  'tavern_dummy_customer_seated_down': 'tavern_customer_normal_seated_right',
  'tavern_dummy_customer_seated_up': 'tavern_customer_normal_seated_left',
  'tavern_dummy_chef_idle_side': 'tavern_chef_mimi_idle_side',
  'tavern_dummy_chef2_idle_side': 'tavern_chef_rin_idle_side',
  'tavern_dummy_customer_vip_seated_down': 'tavern_customer_vip_seated_right',
  'tavern_dummy_customer_vip_seated_up': 'tavern_customer_vip_seated_left',
  'tavern_dummy_customer_gourmet_seated_down': 'tavern_customer_gourmet_seated_right',
  'tavern_dummy_customer_gourmet_seated_up': 'tavern_customer_gourmet_seated_left',
  'tavern_dummy_customer_rushed_seated_down': 'tavern_customer_rushed_seated_right',
  'tavern_dummy_customer_rushed_seated_up': 'tavern_customer_rushed_seated_left',
  'tavern_dummy_customer_seated_south': 'tavern_customer_normal_seated_south',
  'tavern_dummy_customer_vip_seated_south': 'tavern_customer_vip_seated_south',
  'tavern_dummy_customer_gourmet_seated_south': 'tavern_customer_gourmet_seated_south',
  'tavern_dummy_customer_rushed_seated_south': 'tavern_customer_rushed_seated_south',
  'tavern_dummy_customer_group_seated_south': 'tavern_customer_group_seated_south',
  'tavern_dummy_customer_critic_seated_south': 'tavern_customer_critic_seated_south',
  'tavern_dummy_customer_regular_seated_south': 'tavern_customer_regular_seated_south',
  'tavern_dummy_customer_student_seated_south': 'tavern_customer_student_seated_south',
  'tavern_dummy_customer_traveler_seated_south': 'tavern_customer_traveler_seated_south',
  'tavern_dummy_customer_business_seated_south': 'tavern_customer_business_seated_south',
  'tavern_dummy_customer_seated_north': 'tavern_customer_normal_seated_north',
  'tavern_dummy_customer_vip_seated_north': 'tavern_customer_vip_seated_north',
  'tavern_dummy_customer_gourmet_seated_north': 'tavern_customer_gourmet_seated_north',
  'tavern_dummy_customer_rushed_seated_north': 'tavern_customer_rushed_seated_north',
  'tavern_dummy_customer_group_seated_north': 'tavern_customer_group_seated_north',
  'tavern_dummy_customer_critic_seated_north': 'tavern_customer_critic_seated_north',
  'tavern_dummy_customer_regular_seated_north': 'tavern_customer_regular_seated_north',
  'tavern_dummy_customer_student_seated_north': 'tavern_customer_student_seated_north',
  'tavern_dummy_customer_traveler_seated_north': 'tavern_customer_traveler_seated_north',
  'tavern_dummy_customer_business_seated_north': 'tavern_customer_business_seated_north',
  'tavern_dummy_table_4p_v13': 'tavern_table_4p_v13',
  'tavern_dummy_chair_back_v13': 'tavern_chair_back_v13',
  'tavern_dummy_chair_front_v13': 'tavern_chair_front_v13',
  'tavern_dummy_floor_wood_tile_v14': 'tavern_floor_wood_tile_v14',
  'tavern_dummy_wall_horizontal_v14': 'tavern_wall_horizontal_v14',
});

const BARREL_POSITIONS = [{ x: 20, y: 160 }, { x: 50, y: 160 }];

export class TavernServiceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TavernServiceScene' });
    this._patienceBarMap = new Map();
    this._orderBubbleMap = new Map();
    this._timerText = null;
    this._goldText = null;
    this._goldAmount = 0;
  }

  // ── D1: init ──

  /** @param {Object} data - MarketScene 또는 디버그 메뉴 전달 데이터 */
  init(data = {}) {
    this.inventoryManager = new InventoryManager();
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
    this.marketResult = data.marketResult || { totalIngredients: 0, livesRemaining: this.marketLives, livesMax: 15 };

    // 부분 성공 재료 50% 컷
    this.partialFail = data.partialFail || false;
    if (this.partialFail) {
      for (const [type, qty] of Object.entries(this.inventoryManager.inventory)) {
        if (qty > 0) this.inventoryManager.inventory[type] = Math.ceil(qty * 0.5);
      }
    }

    this.isEndless = data.isEndless || false;
    this.endlessWave = data.endlessWave || 0;
    this.endlessScore = data.endlessScore || 0;
    this.endlessMaxCombo = data.endlessMaxCombo || 0;
    this.dailySpecials = data.dailySpecials || [];
  }

  // ── preload ──

  preload() {
    const dummyPath = 'assets/tavern_dummy/';
    const dummies = ['barrel', 'wall_decor_painting', 'chef_idle_side', 'customer_walk_r',
      'customer_seated_down', 'customer_seated_up', 'floor_wood_tile_v14', 'wall_horizontal_v14',
      'counter_v12', 'entrance_v12'];
    for (const name of dummies) {
      this.load.image(`tavern_dummy_${name}`, `${dummyPath}${name}.png`);
    }

    if (ASSET_MODE === 'real') {
      const realPath = 'assets/tavern/';
      const realAssets = [
        'counter_v12', 'entrance_v12',
        'customer_normal_seated_right', 'customer_normal_seated_left',
        'chef_mimi_idle_side', 'chef_rin_idle_side',
        'customer_vip_seated_right', 'customer_gourmet_seated_right', 'customer_rushed_seated_right',
        'customer_group_seated_right', 'customer_critic_seated_right', 'customer_regular_seated_right',
        'customer_student_seated_right', 'customer_traveler_seated_right', 'customer_business_seated_right',
        'customer_vip_seated_left', 'customer_gourmet_seated_left', 'customer_rushed_seated_left',
        'customer_group_seated_left', 'customer_critic_seated_left', 'customer_regular_seated_left',
        'customer_student_seated_left', 'customer_traveler_seated_left', 'customer_business_seated_left',
        'customer_normal_seated_south', 'customer_vip_seated_south', 'customer_gourmet_seated_south',
        'customer_rushed_seated_south', 'customer_group_seated_south', 'customer_critic_seated_south',
        'customer_regular_seated_south', 'customer_student_seated_south', 'customer_traveler_seated_south',
        'customer_business_seated_south',
        'customer_normal_seated_north', 'customer_vip_seated_north', 'customer_gourmet_seated_north',
        'customer_rushed_seated_north', 'customer_group_seated_north', 'customer_critic_seated_north',
        'customer_regular_seated_north', 'customer_student_seated_north', 'customer_traveler_seated_north',
        'customer_business_seated_north',
        'table_4p_v13', 'chair_back_v13', 'chair_front_v13',
        'floor_wood_tile_v14', 'wall_horizontal_v14',
        'chef_mage_idle_side', 'chef_yuki_idle_side', 'chef_lao_idle_side', 'chef_andre_idle_side', 'chef_arjun_idle_side',
      ];
      for (const name of realAssets) {
        this.load.image(`tavern_${name}`, `${realPath}${name}.png`);
      }

      // 손님 10종 walk 스프라이트시트
      const walkTypes = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      for (const t of walkTypes) {
        this.load.spritesheet(`tavern_customer_${t}_walk_r`, `${realPath}customer_${t}_walk_r.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet(`tavern_customer_${t}_walk_l`, `${realPath}customer_${t}_walk_l.png`, { frameWidth: 64, frameHeight: 64 });
      }

      // 셰프 5명 walk 스프라이트시트
      const chefWalkTypes = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      chefWalkTypes.forEach(name => {
        ['r', 'l'].forEach(side => {
          this.load.spritesheet(`tavern_chef_${name}_walk_${side}`, `${realPath}chef_${name}_walk_${side}.png`, { frameWidth: 32, frameHeight: 48 });
        });
      });
    }
  }

  // ── create ──

  create() {
    this._layout = TAVERN_LAYOUT;
    this._seatingState = createSeatingState('lv0');

    // ── 게임 상태 초기화 ──
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
    this._selectedRecipeId = null;

    // ── 테이블/인테리어 등급 로드 ──
    this.unlockedTables = SaveManager.getUnlockedTables();
    this.tableUpgrades = [];
    for (let i = 0; i < TABLE_SET_ANCHORS.length; i++) {
      this.tableUpgrades.push(SaveManager.getTableUpgrade(i));
    }
    this.interiorFlower = SaveManager.getInteriorLevel('flower');
    this.interiorKitchen = SaveManager.getInteriorLevel('kitchen');
    this.interiorLighting = SaveManager.getInteriorLevel('lighting');

    // ── D6: 손님 시스템 ──
    /** @type {(Object|null)[]} 슬롯 기반 손님 배열 (24석 -> 실제 6테이블 x 4석) */
    this._customers = [];
    this.customerSpawnTimer = 0;
    this.customersSpawned = 0;
    /** 다음 손님 ID 카운터 */
    this._nextCustomerId = 0;

    // ── D2: 조리 슬롯 ──
    this.cookingSlots = [];
    for (let i = 0; i < MAX_COOKING_SLOTS; i++) {
      this.cookingSlots.push({ recipe: null, timeLeft: 0, totalTime: 0, ready: false, washing: false, washTimeLeft: 0 });
    }

    // ── 직원 상태 ──
    this.hasWaiter = SaveManager.isStaffHired('waiter');
    this.hasDishwasher = SaveManager.isStaffHired('dishwasher');

    // ── D11: 특수 손님 + 이벤트 ──
    this.chapter = parseInt(this.stageId.split('-')[0], 10) || 1;
    this.specialRates = SPECIAL_CUSTOMER_RATES[this.chapter] || SPECIAL_CUSTOMER_RATES[3];

    // 평론가/단골
    this.criticScores = [];
    this._regularServedCount = SaveManager.getRegularProgress();
    if (SaveManager.getCriticPenalty()) {
      this._criticPenaltyApplied = true;
      SaveManager.setCriticPenalty(false);
    } else {
      this._criticPenaltyApplied = false;
    }

    // ── D9: 스킬 상태 ──
    this.skillCooldownLeft = 0;
    this.skillCooldownMax = 0;
    this.patienceResetRemaining = 0;
    this.patienceFrozen = false;
    this.freezeTimeLeft = 0;
    this._precisionCutRemaining = 0;

    // ── D11: 이벤트 상태 ──
    this.activeEvent = null;
    this.eventCount = 0;
    this.eventCooldown = 0;
    this.eventStartDelay = EVENT_START_DELAY;
    this.foodReviewRemaining = 0;
    this.accidentSlotIdx = -1;

    // ── 해금 레시피 ──
    this.availableRecipes = ALL_SERVING_RECIPES.filter(r => RecipeManager.isUnlocked(r.id));
    // 분기 레시피 추가
    this._sessionBranchRecipeIds = [];
    try {
      const unlockedBranchIds = SaveManager.getUnlockedBranchRecipes();
      for (const id of unlockedBranchIds) {
        const def = RECIPE_MAP[id];
        if (def && !this.availableRecipes.some(r => r.id === id)) {
          this.availableRecipes.push(def);
          this._sessionBranchRecipeIds.push(id);
        }
      }
    } catch { /* noop */ }

    // ── UI 생성 ──
    this._buildLayout();
    this._buildFurniture();
    this._buildBenchSlots();
    this._buildChef();
    this._buildServiceHUD();
    this._buildPatienceBars();
    this._createCookingSlots();
    this._createInventoryPanel();
    this._createRecipeQuickSlots();
    this._createSkillButton();

    // ── walk 애니메이션 등록 ──
    if (ASSET_MODE === 'real') {
      const walkTypes = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      for (const t of walkTypes) {
        for (const dir of ['r', 'l']) {
          const key = `tavern_customer_${t}_walk_${dir}`;
          const animKey = `customer_${t}_walk_${dir}`;
          if (this.textures.exists(key) && !this.anims.exists(animKey)) {
            this.anims.create({ key: animKey, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
          }
        }
      }
      const chefWalkTypes = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      chefWalkTypes.forEach(name => {
        ['r', 'l'].forEach(side => {
          const chefKey = `tavern_chef_${name}_walk_${side}`;
          if (this.textures.exists(chefKey) && !this.anims.exists(`chef_${name}_walk_${side}`)) {
            this.anims.create({ key: `chef_${name}_walk_${side}`, frames: this.anims.generateFrameNumbers(chefKey, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
          }
        });
      });
    }

    // Back 버튼
    this._buildBackButton();

    // D12: 유랑 미력사 스킬 적용
    this._applyWanderingChefSkills();

    // 미력 나그네 스폰 예약
    this._mireukSpawned = false;
    this._scheduleMireukTraveler();

    // 깊이정렬
    this._applyDepthSort();

    // 재료 0개 방어
    this.time.delayedCall(0, () => {
      if (this.inventoryManager.getTotal() === 0) {
        this._endService('stock');
      }
    });

    // 종료 시 정리
    this.events.once('shutdown', this._shutdown, this);

    // ── Playwright 전역 노출 ──
    if (typeof window !== 'undefined') {
      window.__tavernLayout = { occupySlot, vacateSlot, findFreeSlot, getSlotWorldPos, createSeatingState, TABLE_SET_ANCHORS };
      window.__tavernBenchConfig = BENCH_CONFIG;
      window.__ChefState = ChefState;
      window.__CustomerState = CustomerState;
      window.__tavernAssetMode = ASSET_MODE;
      window.__tavernSpriteTypes = {
        chefs: this._chefs.map(c => ({ type: c.sprite.type, textureKey: c.sprite.texture?.key || null })),
        customers: [],
      };
      const walkAnimTypes = ['normal', 'vip', 'gourmet', 'rushed', 'group', 'critic', 'regular', 'student', 'traveler', 'business'];
      window.__tavernWalkAnims = {
        registered: walkAnimTypes.flatMap(t => [`customer_${t}_walk_l`, `customer_${t}_walk_r`]),
        exists: walkAnimTypes.reduce((acc, t) => { acc[t] = { walk_l: this.anims.exists(`customer_${t}_walk_l`), walk_r: this.anims.exists(`customer_${t}_walk_r`) }; return acc; }, {}),
      };
      const chefAnimTypes = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      window.__tavernChefAnims = chefAnimTypes.flatMap(n => [`chef_${n}_walk_r`, `chef_${n}_walk_l`]);
      window.__tavernPhaseC = {
        showBubble: (id) => this._buildOrderBubble(id, 180, 300),
        hideBubble: (id) => this._destroyOrderBubble(id),
        goldFloat: (x, y, amt) => this._showGoldFloat(x, y, amt),
        updatePatience: (idx, ratio) => this._updatePatienceBar(idx, ratio),
        updateGold: (amt) => this._updateGoldHUD(amt),
      };
      // Phase D: 게임 상태 접근
      window.__tavernScene = this;
    }
  }

  // ── update ──

  /**
   * 메인 루프: 깊이정렬, 손님 스폰, 인내심, 조리, 이벤트, 타이머.
   * @param {number} time
   * @param {number} delta - ms
   */
  update(time, delta) {
    this._applyDepthSort();

    if (this.isPaused || this.isServiceOver) return;

    const dt = delta / 1000;

    // 영업 시간 감소
    this.serviceTimeLeft -= dt;
    if (this.serviceTimeLeft <= 0) {
      this.serviceTimeLeft = 0;
      this._endService('time');
      return;
    }

    // HUD 타이머 갱신
    this._updateTimerHUD();

    // D6: 손님 스폰
    this._updateCustomerSpawn(dt);

    // D7: 인내심 감소
    this._updateCustomerPatience(delta);

    // D2: 조리 진행
    this._updateCooking(delta);

    // D11: 이벤트
    this._updateEvents(dt);

    // D9: 스킬 쿨다운
    if (this.skillCooldownLeft > 0) {
      this.skillCooldownLeft -= delta;
      if (this.skillCooldownLeft < 0) this.skillCooldownLeft = 0;
    }
    // 인내심 동결 타이머
    if (this.patienceFrozen) {
      this.freezeTimeLeft -= delta;
      if (this.freezeTimeLeft <= 0) {
        this.patienceFrozen = false;
        this.freezeTimeLeft = 0;
      }
    }
    this._updateSkillButtonUI();

    // 재료/레시피 소진 체크
    if (!this._hasCookingInProgress() && !this._hasReadyDish() && !this._hasWashingSlot()) {
      if (this._isAllStockEmpty()) { this._endService('stock'); return; }
      if (!this._canMakeAnyRecipe()) { this._endService('no_recipe'); return; }
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── A1: 영역 경계선 디버그 표시 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildLayout() {
    const L = TAVERN_LAYOUT;
    const g = this.add.graphics();

    g.fillStyle(0x2c2c2c, 0.90); g.fillRect(0, 0, L.GAME_W, L.HUD_H);
    g.fillStyle(0xe8dcc8, 0.90); g.fillRect(0, L.ROOM_Y, L.GAME_W, L.WALL_H);
    g.fillStyle(0xb8c5c8, 0.40); g.fillRect(L.KITCHEN_X, L.ROOM_CONTENT_Y, L.KITCHEN_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);
    g.fillStyle(0xfff8f0, 0.50); g.fillRect(L.DINING_X, L.ROOM_CONTENT_Y, L.DINING_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);
    g.fillStyle(0x37474f, 0.92); g.fillRect(0, L.ROOM_BOTTOM_Y, L.GAME_W, L.CTRL_H);

    g.lineStyle(1, 0xaaaaaa, 0.4);
    g.strokeRect(0, 0, L.GAME_W, L.HUD_H);
    g.strokeRect(0, L.ROOM_Y, L.GAME_W, L.WALL_H);
    g.strokeRect(L.KITCHEN_X, L.ROOM_CONTENT_Y, L.KITCHEN_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);
    g.strokeRect(L.DINING_X, L.ROOM_CONTENT_Y, L.DINING_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);
    g.strokeRect(0, L.ROOM_BOTTOM_Y, L.GAME_W, L.CTRL_H);

    const floorKey = this._resolveTextureKey('tavern_dummy_floor_wood_tile_v14');
    if (this.textures.exists(floorKey)) {
      for (let ty = L.ROOM_CONTENT_Y; ty < L.ROOM_BOTTOM_Y; ty += 32) {
        for (let tx = 0; tx < L.GAME_W; tx += 32) {
          this.add.image(tx, ty, floorKey).setOrigin(0, 0).setAlpha(0.55).setDepth(0);
        }
      }
    }
    const wallKey = this._resolveTextureKey('tavern_dummy_wall_horizontal_v14');
    if (this.textures.exists(wallKey)) {
      for (let wx = 0; wx < L.GAME_W; wx += 64) {
        this.add.image(wx, L.ROOM_Y, wallKey).setOrigin(0, 0).setAlpha(0.85).setDepth(1);
      }
    }
    g.setDepth(0);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── A1: 가구 배치 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildFurniture() {
    this._placeImageOrRect('tavern_dummy_counter_v12', COUNTER_ANCHOR.x - COUNTER_W / 2, COUNTER_ANCHOR.y, COUNTER_W, COUNTER_H, 0x8b6440);
    for (const pos of BARREL_POSITIONS) { this._placeImageOrRect('tavern_dummy_barrel', pos.x, pos.y, 32, 40, 0x6b4420); }
    this._placeImageOrRect('tavern_dummy_entrance_v12', DOOR_ANCHOR.x - 16, DOOR_ANCHOR.y, 32, 40, 0x9b7850);

    for (const quad of TABLE_SET_ANCHORS) {
      const qx = quad.quadLeft, qy = quad.quadTop;
      this._placeImageOrRect('tavern_dummy_chair_back_v13', qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.BENCH_TOP_TOP, BENCH_CONFIG.BENCH_W, BENCH_CONFIG.BENCH_H, 0x7a5030);
      const tableSprite = this._placeImageOrRect('tavern_dummy_table_4p_v13', qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.TABLE_TOP, BENCH_CONFIG.TABLE_W, BENCH_CONFIG.TABLE_H, 0x5a3820);
      tableSprite.setDepth(qy + BENCH_CONFIG.TABLE_DEPTH_OFFSET);
      tableSprite._fixedDepth = true;
      const chairFrontSprite = this._placeImageOrRect('tavern_dummy_chair_front_v13', qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.BENCH_BOT_TOP, BENCH_CONFIG.BENCH_W, BENCH_CONFIG.BENCH_H, 0x7a5030);
      chairFrontSprite.setDepth(qy + BENCH_CONFIG.BACK_SLOT_DY + 1);
      chairFrontSprite._fixedDepth = true;
    }

    const decorPositions = [{ x: 80, y: 30 }, { x: 200, y: 30 }, { x: 280, y: 30 }];
    for (const pos of decorPositions) { this._placeImageOrRect('tavern_dummy_wall_decor_painting', pos.x, pos.y, 32, 28, 0xaa8855); }
  }

  /** @private */
  _resolveTextureKey(dummyKey) {
    if (ASSET_MODE === 'real') {
      const realKey = REAL_KEY_MAP[dummyKey];
      if (realKey && this.textures.exists(realKey)) return realKey;
    }
    return dummyKey;
  }

  /** @private */
  _placeImageOrRect(textureKey, x, y, w, h, fallbackColor) {
    if (ASSET_MODE === 'real') {
      const realKey = REAL_KEY_MAP[textureKey];
      if (realKey && this.textures.exists(realKey)) return this.add.image(x, y, realKey).setOrigin(0, 0).setDisplaySize(w, h);
    }
    if (this.textures.exists(textureKey)) return this.add.image(x, y, textureKey).setOrigin(0, 0).setDisplaySize(w, h);
    return this.add.rectangle(x + w / 2, y + h / 2, w, h, fallbackColor).setAlpha(0.8);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── A2: 벤치 슬롯 표시 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildBenchSlots() {
    const slotSize = 4;
    for (const set of this._seatingState) {
      for (const slot of set.front) {
        this.add.rectangle(slot.worldX, slot.worldY, slotSize, slotSize, 0xffdd00).setDepth(slot.worldY);
        this.add.text(slot.worldX + 3, slot.worldY - 8, `F${slot.slotIdx}`, { fontSize: '8px', fontFamily: FONT_FAMILY, color: '#ffdd00' }).setOrigin(0, 0.5).setDepth(9000);
      }
      if (set.back) {
        for (const slot of set.back) {
          this.add.rectangle(slot.worldX, slot.worldY, slotSize, slotSize, 0x00ffdd).setDepth(slot.worldY);
          this.add.text(slot.worldX + 3, slot.worldY - 8, `B${slot.slotIdx}`, { fontSize: '8px', fontFamily: FONT_FAMILY, color: '#00ffdd' }).setOrigin(0, 0.5).setDepth(9000);
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── A3: 셰프 배치 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildChef() {
    this._chefs = [];
    CHEF_IDLE_ANCHORS.forEach((anchor, idx) => {
      const chefState = ChefState.IDLE_SIDE;
      const color = CHEF_STATE_COLORS[chefState];
      const dummyKey = idx === 0 ? 'tavern_dummy_chef2_idle_side' : 'tavern_dummy_chef_idle_side';
      // D5: Image -> Sprite 전환 시도 (spritesheet가 있으면 Sprite, 없으면 Image fallback)
      let sprite;
      const chefNames = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      const chefName = chefNames[idx] || 'mage';
      const walkKey = `tavern_chef_${chefName}_walk_r`;
      if (ASSET_MODE === 'real' && this.textures.exists(walkKey)) {
        sprite = this.add.sprite(anchor.x, anchor.y, walkKey, 0).setOrigin(0.5, 1).setDepth(anchor.y);
      } else {
        sprite = this._placeImageOrRect(dummyKey, anchor.x - 16, anchor.y - 48, 32, 48, color).setOrigin(0.5, 1).setDepth(anchor.y);
      }
      this._chefs.push({ sprite, state: chefState, anchor, chefName });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Phase C: 영업 HUD ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildServiceHUD() {
    const L = TAVERN_LAYOUT;
    this._timerText = this.add.text(8, 8, this._formatTime(this.serviceTimeLeft), {
      fontSize: '12px', fontFamily: FONT_FAMILY, color: '#ffffff', backgroundColor: '#00000066', padding: { x: 4, y: 2 },
    }).setOrigin(0, 0).setDepth(9100);
    this._goldText = this.add.text(L.GAME_W - 8, 8, '\uD83D\uDCB0 0G', {
      fontSize: '12px', fontFamily: FONT_FAMILY, color: '#ffd700', backgroundColor: '#00000066', padding: { x: 4, y: 2 },
    }).setOrigin(1, 0).setDepth(9100);
    // 만족도 표시
    this._satText = this.add.text(L.GAME_W / 2, 8, '\u2764 100%', {
      fontSize: '11px', fontFamily: FONT_FAMILY, color: '#ff6666', backgroundColor: '#00000066', padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 0).setDepth(9100);
  }

  /** @private */
  _formatTime(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.floor(Math.max(0, seconds) % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /** @private */
  _updateTimerHUD() {
    if (this._timerText) this._timerText.setText(this._formatTime(this.serviceTimeLeft));
    if (this._goldText) this._goldText.setText(`\uD83D\uDCB0 ${this.totalGold}G`);
    if (this._satText) this._satText.setText(`\u2764 ${Math.round(this.satisfaction)}%`);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Phase C: 인내심 게이지 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildPatienceBars() {
    this._patienceBarMap.clear();
    TABLE_SET_ANCHORS.forEach((quad, idx) => {
      const barX = quad.quadLeft + BENCH_CONFIG.TABLE_LEFT;
      const barY = Math.max(quad.quadTop - 12, TAVERN_LAYOUT.ROOM_CONTENT_Y + 2);
      const barW = BENCH_CONFIG.TABLE_W;
      const bg = this.add.rectangle(barX, barY, barW, 8, 0x333333).setOrigin(0, 0).setDepth(9050);
      const fill = this.add.rectangle(barX, barY, barW, 8, 0x44cc44).setOrigin(0, 0).setDepth(9051);
      // 초기 상태: 비활성 (투명)
      bg.setAlpha(0);
      fill.setAlpha(0);
      this._patienceBarMap.set(idx, { bg, fill });
    });
  }

  /** @private */
  _updatePatienceBar(tableSetIdx, ratio) {
    const bar = this._patienceBarMap.get(tableSetIdx);
    if (!bar) return;
    const r = Math.max(0, Math.min(1, ratio));
    // 테이블에 손님이 있으면 표시
    const hasCustomer = this._customers.some(c => c && c.slotRef && c.slotRef.tableSetIdx === tableSetIdx);
    bar.bg.setAlpha(hasCustomer ? 1 : 0);
    bar.fill.setAlpha(hasCustomer ? 1 : 0);
    bar.fill.width = BENCH_CONFIG.TABLE_W * r;
    if (r >= 0.7) bar.fill.fillColor = 0x44cc44;
    else if (r >= 0.3) bar.fill.fillColor = 0xffcc00;
    else bar.fill.fillColor = 0xff3333;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Phase C: 주문 말풍선 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildOrderBubble(customerId, x, y, recipeIcon) {
    if (this._orderBubbleMap.has(customerId)) this._destroyOrderBubble(customerId);
    const bubbleW = 70, bubbleH = 24, bubbleY = y - 72;
    const bg = this.add.rectangle(x, bubbleY, bubbleW, bubbleH, 0xffffff, 0.9).setOrigin(0.5, 0.5).setDepth(9080);
    const displayText = recipeIcon || '\uD83C\uDF5C \uC8FC\uBB38 \uC911...';
    const text = this.add.text(x, bubbleY, displayText, { fontSize: '9px', fontFamily: FONT_FAMILY, color: '#333333', align: 'center' }).setOrigin(0.5, 0.5).setDepth(9081);
    this._orderBubbleMap.set(customerId, { bg, text });
  }

  /** @private */
  _destroyOrderBubble(customerId) {
    const bubble = this._orderBubbleMap.get(customerId);
    if (!bubble) return;
    bubble.bg.destroy();
    bubble.text.destroy();
    this._orderBubbleMap.delete(customerId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Phase C: 골드 플로팅 VFX ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _showGoldFloat(x, y, amount) {
    const floatText = this.add.text(x, y, `+${amount}G`, { fontSize: '14px', fontFamily: FONT_FAMILY, color: '#ffd700' }).setOrigin(0.5, 1).setDepth(9090);
    this.tweens.add({ targets: floatText, y: y - 32, alpha: { from: 1, to: 0 }, duration: 1000, ease: 'Power1', onComplete: () => floatText.destroy() });
  }

  /** @private */
  _updateGoldHUD(amount) {
    this._goldAmount += amount;
    if (this._goldText) this._goldText.setText(`\uD83D\uDCB0 ${this._goldAmount}G`);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D2: 조리 슬롯 UI ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _createCookingSlots() {
    this._cookSlotUIs = [];
    const slotW = 52, slotH = 52;
    for (let i = 0; i < MAX_COOKING_SLOTS; i++) {
      // AD3 수정: 슬롯 간 4px 여백 확보 (60→64)
      const x = 14, y = 220 + i * 64;
      const bg = this.add.rectangle(x + slotW / 2, y + slotH / 2, slotW, slotH, 0x444444, 0.8).setDepth(9010).setInteractive();
      const progressBg = this.add.rectangle(x, y + slotH, slotW, 8, 0x222222).setOrigin(0, 0).setDepth(9011);
      const progressFill = this.add.rectangle(x, y + slotH, 0, 8, 0x44cc44).setOrigin(0, 0).setDepth(9012);
      const label = this.add.text(x + slotW / 2, y + slotH / 2, '', { fontSize: '9px', fontFamily: FONT_FAMILY, color: '#ffffff', align: 'center' }).setOrigin(0.5).setDepth(9013);

      bg.on('pointerdown', () => this._onCookSlotTap(i));

      this._cookSlotUIs.push({ bg, progressBg, progressFill, label, x, y, w: slotW, h: slotH });
    }
  }

  /** @private */
  _updateCookSlotUI(idx) {
    const ui = this._cookSlotUIs[idx];
    if (!ui) return;
    const slot = this.cookingSlots[idx];

    if (idx === this.accidentSlotIdx) {
      ui.bg.fillColor = 0x661111;
      ui.label.setText('\uD83D\uDD25');
      ui.progressFill.width = 0;
      return;
    }
    if (slot.washing) {
      ui.bg.fillColor = 0x334466;
      ui.label.setText('\uD83E\uDDF9');
      const washRatio = 1 - (slot.washTimeLeft / WASH_TIME_MS);
      ui.progressFill.width = ui.w * Math.max(0, washRatio);
      ui.progressFill.fillColor = 0x4488cc;
      return;
    }
    if (!slot.recipe) {
      ui.bg.fillColor = 0x444444;
      ui.label.setText('');
      ui.progressFill.width = 0;
      return;
    }
    if (slot.ready) {
      ui.bg.fillColor = 0x226622;
      ui.label.setText(`${slot.recipe.icon || '\uD83C\uDF73'}\nREADY`);
      ui.progressFill.width = ui.w;
      ui.progressFill.fillColor = 0x44cc44;
    } else {
      ui.bg.fillColor = 0x664422;
      const ratio = slot.totalTime > 0 ? 1 - (slot.timeLeft / slot.totalTime) : 0;
      ui.progressFill.width = ui.w * ratio;
      ui.progressFill.fillColor = 0xffaa33;
      ui.label.setText(slot.recipe.icon || '\uD83C\uDF73');
    }
  }

  /** 조리 슬롯 탭: 완성된 요리가 있으면 서빙 대상 선택 모드 */
  _onCookSlotTap(idx) {
    if (this.isServiceOver || this.isPaused) return;
    const slot = this.cookingSlots[idx];
    if (!slot.recipe || !slot.ready) return;

    // 해당 레시피를 주문한 손님 찾기
    const matchingCust = this._customers.find(c => c && c.recipe && c.recipe.id === slot.recipe.id &&
      (c.state === CustomerState.SIT_DOWN || c.state === CustomerState.SIT_UP));
    if (matchingCust) {
      this._serveToCustomer(matchingCust, idx);
    } else {
      this._showMessage('\uC8FC\uBB38\uACFC \uC77C\uCE58\uD558\uB294 \uC190\uB2D8\uC774 \uC5C6\uC2B5\uB2C8\uB2E4');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D4: 재고 패널 UI ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _createInventoryPanel() {
    this._inventoryTexts = {};
    const startY = 360, colW = 60;
    let ix = 0;
    for (const [type] of Object.entries(INGREDIENT_TYPES)) {
      const col = ix % 2, row = Math.floor(ix / 2);
      const x = 4 + col * colW, y = startY + row * 18;
      const qty = this.inventoryManager.inventory[type] || 0;
      const txt = this.add.text(x, y, `${type.substring(0, 4)}: ${qty}`, {
        fontSize: '9px', fontFamily: FONT_FAMILY, color: qty > 0 ? '#ffffff' : '#666666',
      }).setDepth(9020);
      this._inventoryTexts[type] = txt;
      ix++;
    }
  }

  /** @private */
  _updateInventoryPanel() {
    for (const [type] of Object.entries(INGREDIENT_TYPES)) {
      const txt = this._inventoryTexts[type];
      if (!txt) continue;
      const qty = this.inventoryManager.inventory[type] || 0;
      txt.setText(`${type.substring(0, 4)}: ${qty}`);
      txt.setColor(qty > 0 ? '#ffffff' : '#666666');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D3: 레시피 퀵슬롯 UI ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _createRecipeQuickSlots() {
    // 기존 버튼 제거
    if (this._recipeButtons) {
      for (const btn of this._recipeButtons) {
        btn.bg.destroy();
        btn.label.destroy();
      }
    }
    this._recipeButtons = [];

    const L = TAVERN_LAYOUT;
    const btnSize = 56, padding = 4;
    const startX = 4, startY = L.ROOM_BOTTOM_Y + 4;
    // AD3 수정: 스킬 버튼 우측 동일 행 배치 — 레시피는 최대 4개(col 0~3)로 제한
    const maxPerRow = 4;

    this.availableRecipes.slice(0, maxPerRow).forEach((recipe, i) => {
      const col = i % maxPerRow, row = Math.floor(i / maxPerRow);
      const x = startX + col * (btnSize + padding);
      const y = startY + row * (btnSize + padding);

      const canMake = this.inventoryManager.hasEnough(recipe.ingredients);
      const bg = this.add.rectangle(x + btnSize / 2, y + btnSize / 2, btnSize, btnSize, canMake ? 0x555555 : 0x333333, 0.9)
        .setDepth(9030).setInteractive();
      const label = this.add.text(x + btnSize / 2, y + btnSize / 2, `${recipe.icon || '\uD83C\uDF73'}\n${recipe.nameKo || recipe.id}`, {
        fontSize: '8px', fontFamily: FONT_FAMILY, color: canMake ? '#ffffff' : '#666666', align: 'center',
      }).setOrigin(0.5).setDepth(9031);

      bg.on('pointerdown', () => this._onRecipeTap(recipe));
      this._recipeButtons.push({ bg, label, recipe });
    });
  }

  /** @private */
  _updateRecipeQuickSlots() {
    if (!this._recipeButtons) return;
    for (const btn of this._recipeButtons) {
      const canMake = this.inventoryManager.hasEnough(btn.recipe.ingredients);
      btn.bg.fillColor = canMake ? 0x555555 : 0x333333;
      btn.label.setColor(canMake ? '#ffffff' : '#666666');
    }
  }

  /** @private */
  _onRecipeTap(recipe) {
    if (this.isServiceOver || this.isPaused) return;

    if (!this.inventoryManager.hasEnough(recipe.ingredients)) {
      this._showMessage('\uC7AC\uB8CC \uBD80\uC871!');
      return;
    }

    const emptySlot = this.cookingSlots.findIndex((s, idx) => !s.recipe && !s.washing && idx !== this.accidentSlotIdx);
    if (emptySlot === -1) {
      this._showMessage('\uC870\uB9AC \uC2AC\uB86F\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4!');
      return;
    }

    // 재료 소비
    this.inventoryManager.consumeRecipe(recipe.ingredients);
    this._updateInventoryPanel();
    this._updateRecipeQuickSlots();

    // 조리 시간 계산
    const cookTimeBonus = ChefManager.getCookTimeBonus();
    const kitchenBonus = KITCHEN_COOK_BONUS[this.interiorKitchen] || 0;
    const wanderingCookReduce = this._buffCookTimeReduce || 0;
    const blessingCookSpeed = BranchEffects.getBlessingMultiplier('cook_speed');
    const yukiSoupBonus = BranchEffects.getActiveBondEffect('soup_pot')?.value || 0;
    let totalTime = recipe.cookTime * cookTimeBonus * (1 - kitchenBonus) * (1 - wanderingCookReduce) * (1 - blessingCookSpeed) * (1 - yukiSoupBonus);
    if (this._precisionCutRemaining > 0) { totalTime = 0; this._precisionCutRemaining--; }

    this.cookingSlots[emptySlot] = { recipe, timeLeft: totalTime, totalTime, ready: totalTime === 0, washing: false, washTimeLeft: 0 };
    this._updateCookSlotUI(emptySlot);
    this._dismissSoldOutCustomers();
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D2: 조리 진행 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _updateCooking(delta) {
    for (let i = 0; i < this.cookingSlots.length; i++) {
      const slot = this.cookingSlots[i];
      if (slot.washing) {
        slot.washTimeLeft -= delta;
        if (slot.washTimeLeft <= 0) { slot.washing = false; slot.washTimeLeft = 0; }
        this._updateCookSlotUI(i);
        continue;
      }
      if (!slot.recipe || slot.ready) { this._updateCookSlotUI(i); continue; }
      slot.timeLeft -= delta;
      if (slot.timeLeft <= 0) { slot.timeLeft = 0; slot.ready = true; }
      this._updateCookSlotUI(i);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D6: 손님 스폰 + AI ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _updateCustomerSpawn(dt) {
    if (this.customersSpawned >= this.serviceConfig.maxCustomers) return;
    this.customerSpawnTimer += dt;
    let interval = this.serviceConfig.customerInterval;
    if (this.activeEvent) {
      if (this.activeEvent.type === 'happy_hour') interval /= 2;
      else if (this.activeEvent.type === 'rainy_day') interval *= 2;
    }
    if (this.customerSpawnTimer >= interval) {
      this.customerSpawnTimer -= interval;
      this._spawnCustomer();
    }
  }

  /** @private */
  _spawnCustomer() {
    const free = findFreeSlot();
    if (!free) return;

    let profileId = this._determineProfileId();
    // 단체 손님: 빈 슬롯 2개 이상 필요 (간소화: tavern에서는 normal로 대체)
    if (profileId === 'group') {
      const free2 = findFreeSlot();
      if (!free2) profileId = 'normal';
    }

    this._spawnSingleCustomer(free, profileId);
  }

  /** @private */
  _determineProfileId() {
    if (this.foodReviewRemaining > 0) return 'vip';
    const roll = Math.random();
    let threshold = 0;
    for (const type of ['critic', 'vip', 'gourmet', 'rushed', 'business', 'group', 'regular', 'student', 'traveler']) {
      threshold += this.specialRates[type] || 0;
      if (roll < threshold) return type;
    }
    return 'normal';
  }

  /** @private */
  _spawnSingleCustomer(slotInfo, profileId) {
    const recipe = this._pickRecipeForProfile(profileId);
    if (!recipe) return;

    // 인내심 계산
    const chefPatienceBonus = ChefManager.getPatienceBonus();
    const tableGrade = this.tableUpgrades[slotInfo.tableSetIdx] || 0;
    const tablePatienceBonus = TABLE_PATIENCE_BONUS[tableGrade];
    const interiorPatienceBonus = FLOWER_PATIENCE_BONUS[this.interiorFlower] || 0;
    const basePat = this.serviceConfig.customerPatience * 1000;
    const patienceTable = this._patienceMults || CUSTOMER_PATIENCE_MULT;
    const typeMult = patienceTable[profileId] || 1.0;
    const eventPatienceMult = (this.activeEvent && this.activeEvent.type === 'rainy_day') ? 1.5 : 1.0;
    const patienceBlessingMult = 1 + BranchEffects.getBlessingMultiplier('patron_patience');
    const totalPatience = basePat * chefPatienceBonus * (1 + tablePatienceBonus + interiorPatienceBonus) * typeMult * eventPatienceMult * patienceBlessingMult;

    const custId = `cust-${this._nextCustomerId++}`;
    occupySlot(slotInfo.tableSetIdx, slotInfo.side, slotInfo.slotIdx, custId);

    // D5: Sprite 생성 (walk 애니메이션용)
    let sprite;
    const walkKey = `tavern_customer_${profileId}_walk_r`;
    if (ASSET_MODE === 'real' && this.textures.exists(walkKey)) {
      sprite = this.add.sprite(DOOR_ANCHOR.x, DOOR_ANCHOR.y, walkKey, 0).setOrigin(0.5, 1).setDepth(DOOR_ANCHOR.y);
    } else {
      sprite = this.add.rectangle(DOOR_ANCHOR.x, DOOR_ANCHOR.y, 64, 64, CUSTOMER_STATE_COLORS[CustomerState.ENTER]).setOrigin(0.5, 1);
    }

    const custData = {
      sprite,
      id: custId,
      state: CustomerState.ENTER,
      slotRef: slotInfo,
      customerType: profileId,
      profileId,
      recipe,
      patience: totalPatience,
      maxPatience: totalPatience,
      baseReward: recipe.baseReward,
      tipMultiplier: 1.5,
      groupPairIdx: -1,
    };

    // 꼬마셰프 인내심 리셋
    if (this.patienceResetRemaining > 0) {
      custData.patience = custData.maxPatience;
      this.patienceResetRemaining--;
    }

    this._customers.push(custData);
    this.customersSpawned++;
    this.totalCustomers++;

    // 맛집 리뷰 VIP 카운트 감소
    if (this.foodReviewRemaining > 0 && profileId === 'vip') {
      this.foodReviewRemaining--;
      if (this.foodReviewRemaining <= 0) this._endEvent();
    }

    // D6: 입장 Tween — DOOR_ANCHOR -> 슬롯 worldPos
    const targetPos = getSlotWorldPos(slotInfo.tableSetIdx, slotInfo.side, slotInfo.slotIdx);
    if (targetPos) {
      const walkAnimKey = `customer_${profileId}_walk_r`;
      if (sprite.anims && this.anims.exists(walkAnimKey)) sprite.play(walkAnimKey);

      const dist = Math.sqrt(Math.pow(targetPos.x - DOOR_ANCHOR.x, 2) + Math.pow(targetPos.y - DOOR_ANCHOR.y, 2));
      const duration = (dist / 80) * 1000;

      this.tweens.add({
        targets: sprite,
        x: targetPos.x,
        y: targetPos.y,
        duration,
        ease: 'Linear',
        onComplete: () => {
          // 착석 상태 전환
          custData.state = slotInfo.side === 'back' ? CustomerState.SIT_UP : CustomerState.SIT_DOWN;
          if (sprite.anims) sprite.anims.stop();
          const direction = slotInfo.side === 'back' ? 'north' : 'south';
          const sitKey = `tavern_customer_${profileId}_seated_${direction}`;
          if (this.textures.exists(sitKey)) sprite.setTexture(sitKey);

          // 주문 말풍선 표시
          const icon = CUSTOMER_TYPE_ICONS[profileId] || '\uD83D\uDE0A';
          this._buildOrderBubble(custId, targetPos.x, targetPos.y, `${icon} ${recipe.icon || '\uD83C\uDF73'}`);

          // 인내심 게이지 표시
          this._updatePatienceBar(slotInfo.tableSetIdx, 1.0);
        },
      });
    }

    SoundManager.playSFX('sfx_customer_in');
  }

  /** @private */
  _pickRecipeForProfile(profileId) {
    const craftable = this.availableRecipes.filter(r => this.inventoryManager.hasEnough(r.ingredients));
    if (craftable.length === 0) return null;

    if (profileId === 'gourmet' || profileId === 'critic' || profileId === 'mireuk_traveler' || profileId === 'traveler') {
      const highTier = craftable.filter(r => r.tier >= 3);
      return (highTier.length > 0 ? highTier : craftable)[Math.floor(Math.random() * (highTier.length > 0 ? highTier : craftable).length)];
    }
    if (profileId === 'student') {
      const lowTier = craftable.filter(r => r.tier <= 2);
      return (lowTier.length > 0 ? lowTier : craftable)[Math.floor(Math.random() * (lowTier.length > 0 ? lowTier : craftable).length)];
    }
    return craftable[Math.floor(Math.random() * craftable.length)];
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D7: 인내심 감소 + 퇴장 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _updateCustomerPatience(delta) {
    if (this.patienceFrozen) return;

    for (let i = this._customers.length - 1; i >= 0; i--) {
      const cust = this._customers[i];
      if (!cust) continue;
      // 착석 상태만 인내심 감소
      if (cust.state !== CustomerState.SIT_DOWN && cust.state !== CustomerState.SIT_UP) continue;

      cust.patience -= delta;

      // 인내심 게이지 갱신
      if (cust.slotRef) {
        this._updatePatienceBar(cust.slotRef.tableSetIdx, cust.patience / cust.maxPatience);
      }

      if (cust.patience <= 0) {
        // 요코 퇴장 방지
        if (this._yokoProtectNext) {
          cust.patience = 500;
          this._yokoProtectNext = false;
          this._yokoProtectActive = true;
          continue;
        }

        let satPenalty = 15;
        if (cust.customerType === 'rushed') satPenalty += 10;

        this.satisfaction = Math.max(0, this.satisfaction - satPenalty);
        this.comboCount = 0;

        // 요코 카운터 리셋
        if (this._yokoChainThreshold > 0) {
          this._yokoChainCount = 0;
          this._yokoProtectNext = false;
          this._yokoProtectActive = false;
        }

        // 퇴장 Tween
        this._customerLeave(cust, i);

        if (this.satisfaction <= 0) { this._endService('satisfaction'); return; }
      }
    }
  }

  /** @private */
  _customerLeave(cust, arrayIdx) {
    // 말풍선 제거
    this._destroyOrderBubble(cust.id);

    // 인내심 게이지 숨김
    if (cust.slotRef) {
      this._updatePatienceBar(cust.slotRef.tableSetIdx, 0);
    }

    cust.state = CustomerState.LEAVE;

    // walk_l 애니메이션
    const leaveAnimKey = `customer_${cust.customerType}_walk_l`;
    if (cust.sprite.anims && this.anims.exists(leaveAnimKey)) cust.sprite.play(leaveAnimKey, true);

    const dist = Math.sqrt(Math.pow(DOOR_ANCHOR.x - cust.sprite.x, 2) + Math.pow(DOOR_ANCHOR.y - cust.sprite.y, 2));
    const duration = (dist / 80) * 1000;

    this.tweens.add({
      targets: cust.sprite,
      x: DOOR_ANCHOR.x,
      y: DOOR_ANCHOR.y,
      duration,
      ease: 'Linear',
      onComplete: () => {
        cust.sprite.destroy();
        if (cust.slotRef) {
          vacateSlot(cust.slotRef.tableSetIdx, cust.slotRef.side, cust.slotRef.slotIdx);
        }
        const idx = this._customers.indexOf(cust);
        if (idx !== -1) this._customers.splice(idx, 1);
      },
    });
  }

  /** @private */
  _dismissSoldOutCustomers() {
    const cookingRecipeIds = new Set(this.cookingSlots.filter(s => s && s.recipe).map(s => s.recipe.id));
    for (let i = this._customers.length - 1; i >= 0; i--) {
      const cust = this._customers[i];
      if (!cust || cust.state === CustomerState.LEAVE || cust.state === CustomerState.ENTER) continue;
      if (this.inventoryManager.hasEnough(cust.recipe.ingredients)) continue;
      if (cookingRecipeIds.has(cust.recipe.id)) continue;
      this._customerLeave(cust, i);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D8: 서빙 + 골드 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _serveToCustomer(cust, slotIdx) {
    const slot = this.cookingSlots[slotIdx];
    const recipe = slot.recipe;

    // 팁 계산
    const patienceRatio = cust.patience / cust.maxPatience;
    let tipGrade;
    if (patienceRatio >= 0.5) tipGrade = cust.tipMultiplier;
    else if (patienceRatio >= 0.3) tipGrade = 1.0;
    else tipGrade = 0.7;

    const custProfile = cust.profileId ? getCustomerProfile(cust.profileId) : null;
    const tipStyle = custProfile?.tipStyle || 'standard';
    if (tipStyle === 'generous') tipGrade *= 1.2;
    if (tipStyle === 'stingy') tipGrade *= 0.8;

    if (cust.profileId === 'regular' && this._regularServedCount >= 5) tipGrade *= 1.2;

    // 평론가/단골 추적
    if (cust.profileId === 'critic') this.criticScores.push(patienceRatio);
    if (cust.profileId === 'regular') {
      this._regularServedCount++;
      SaveManager.setRegularProgress(this._regularServedCount);
    }

    // 콤보
    this.comboCount++;
    const comboMult = this._getComboMultiplier();
    const typeMult = CUSTOMER_REWARD_MULT[cust.customerType] || 1.0;
    const grillBonus = (recipe.category === 'grill') ? ChefManager.getGrillRewardBonus() : 1.0;

    // 만족도
    const satGain = 5 + (recipe.tier - 1) * 3;
    this.satisfaction = Math.min(100, this.satisfaction + satGain + (patienceRatio > 0.5 ? 5 : 0));
    if (cust.customerType === 'gourmet') this.satisfaction = Math.min(100, this.satisfaction + 5);

    // 골드 계산
    const tableGrade = cust.slotRef ? (this.tableUpgrades[cust.slotRef.tableSetIdx] || 0) : 0;
    const tableTipMult = TABLE_TIP_MULTIPLIERS[tableGrade];
    const interiorTipBonus = LIGHTING_TIP_BONUS[this.interiorLighting] || 0;
    const specialMultiplier = (this.isEndless && this.dailySpecials.includes(recipe.id)) ? 2.0 : 1.0;
    const highStarBonus = (recipe.tier >= 3) ? ChefManager.getHighStarRewardBonus() : 1.0;

    const elapsedSec = this.serviceConfig.duration - this.serviceTimeLeft;
    const earlyMult = (this._buffEarlyBonus > 0 && elapsedSec <= this._buffEarlyDuration) ? (1 + this._buffEarlyBonus) : 1.0;
    const vipBonus = (cust.customerType === 'vip' && this._buffVipRewardMult > 0) ? (1 + this._buffVipRewardMult) : 1.0;
    const gourmetBonus = (cust.customerType === 'gourmet' && this._buffGourmetRewardMult > 0) ? (1 + this._buffGourmetRewardMult) : 1.0;
    const yokoProtectBonus = (this._yokoProtectActive && this._yokoChainReward > 0) ? (1 + this._yokoChainReward) : 1.0;
    const andreTipBonus = BranchEffects.getActiveBondEffect('delivery')?.value || 0;

    const baseGold = cust.baseReward;
    const totalGold = Math.floor(
      baseGold * tableTipMult * (1 + interiorTipBonus) * tipGrade * comboMult * typeMult
      * grillBonus * specialMultiplier * highStarBonus * earlyMult * vipBonus * gourmetBonus
      * yokoProtectBonus * (1 + andreTipBonus)
    );

    // 요코 연쇄 서빙
    if (this._yokoChainThreshold > 0) {
      this._yokoChainCount++;
      if (this._yokoChainCount >= this._yokoChainThreshold) { this._yokoProtectNext = true; this._yokoChainCount = 0; }
    }
    this._yokoProtectActive = false;

    this.totalGold += totalGold;
    this.servedCount++;
    try { DailyMissionManager.recordProgress('orders_complete', 1); } catch { /* noop */ }
    if (cust.customerType === 'vip') { try { DailyMissionManager.recordProgress('vip_serve', 1); } catch { /* noop */ } }
    SoundManager.playSFX('sfx_serve');

    const tipAmount = Math.max(0, totalGold - baseGold);
    this.tipTotal += tipAmount;
    if (this.comboCount > this.maxCombo) this.maxCombo = this.comboCount;
    try { DailyMissionManager.recordProgress('combo_reach', this.comboCount); } catch { /* noop */ }

    // 세척
    const washTime = this.hasDishwasher ? 0 : WASH_TIME_MS;
    this.cookingSlots[slotIdx] = { recipe: null, timeLeft: 0, totalTime: 0, ready: false, washing: washTime > 0, washTimeLeft: washTime };
    this._updateCookSlotUI(slotIdx);
    this._updateRecipeQuickSlots();

    // 골드 VFX
    this._showGoldFloat(cust.sprite.x, cust.sprite.y - 20, totalGold);

    // 콤보 팝업
    if (this.comboCount >= 2) {
      const comboLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, `${this.comboCount} COMBO!`, {
        fontSize: '20px', color: '#ffd700', stroke: '#000000', strokeThickness: 4, fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(9200);
      this.tweens.add({ targets: comboLabel, y: comboLabel.y - 40, alpha: 0, duration: 1200, ease: 'Power1', onComplete: () => comboLabel.destroy() });
    }

    // HUD 갱신
    this._updateTimerHUD();

    // 손님 퇴장
    this._customerLeave(cust, this._customers.indexOf(cust));
  }

  /** @private */
  _getComboMultiplier() {
    if (this.comboCount >= 8) return 1.50;
    if (this.comboCount >= 5) return 1.25;
    if (this.comboCount >= 3) return 1.10;
    return 1.0;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D9: 셰프 스킬 버튼 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _createSkillButton() {
    const L = TAVERN_LAYOUT;
    const skill = ChefManager.getServiceSkill();
    const chefData = ChefManager.getChefData();
    // AD3 수정: 레시피 4개(4*60=240px) 우측 76px 스킬 버튼 — 동일 행 배치
    // 레시피 버튼 4개: 4 + 4*(56+4) = 244px 지점에서 시작
    const btnW = 76, btnH = 56;
    const x = 244, y = L.ROOM_BOTTOM_Y + 4;

    this._skillBtnBg = this.add.rectangle(x + btnW / 2, y + btnH / 2, btnW, btnH, 0x446688, 0.9)
      .setDepth(9040).setInteractive();
    const skillName = skill ? `${chefData?.icon || '\uD83D\uDC68\u200D\uD83C\uDF73'} ${skill.name}` : '\uC2A4\uD0AC \uC5C6\uC74C';
    this._skillBtnText = this.add.text(x + btnW / 2, y + btnH / 2, skillName, {
      fontSize: '9px', fontFamily: FONT_FAMILY, color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(9041);

    this._skillBtnBg.on('pointerdown', () => this._onSkillTap());
  }

  /** @private */
  _onSkillTap() {
    if (this.skillCooldownLeft > 0 || this.isPaused || this.isServiceOver) return;
    const skill = ChefManager.getServiceSkill();
    if (!skill) return;
    const chefData = ChefManager.getChefData();

    this.skillCooldownLeft = skill.cooldown;
    this.skillCooldownMax = skill.cooldown;

    switch (skill.type) {
      case 'patience_reset':
        this.patienceResetRemaining = skill.value;
        this._showMessage(`${chefData.icon} \uD2B9\uAE09 \uC11C\uBE44\uC2A4! \uB2E4\uC74C ${skill.value}\uBA85 \uC778\uB0B4\uC2EC \uB9AC\uC14B`);
        break;
      case 'instant_cook':
      case 'flame_wok':
        this._activateInstantCook();
        this._showMessage(`${chefData.icon} \uBAA8\uB4E0 \uC694\uB9AC \uC989\uC2DC \uC644\uC131!`);
        break;
      case 'freeze_patience':
        this.patienceFrozen = true;
        this.freezeTimeLeft = skill.value;
        this._showMessage('\u2744\uFE0F \uC2DC\uAC04 \uB3D9\uACB0! 10\uCD08\uAC04 \uC778\uB0B4\uC2EC \uC815\uC9C0');
        break;
      case 'precision_cut':
        this._precisionCutRemaining = skill.count || 5;
        this._showMessage(`${chefData.icon} \uC815\uBC00 \uC808\uB2E8! \uB2E4\uC74C ${this._precisionCutRemaining}\uAC1C \uC694\uB9AC \uC989\uC2DC \uC644\uC131`);
        break;
    }
  }

  /** @private */
  _activateInstantCook() {
    for (let i = 0; i < this.cookingSlots.length; i++) {
      const slot = this.cookingSlots[i];
      if (slot.recipe && !slot.ready && !slot.washing && i !== this.accidentSlotIdx) {
        slot.ready = true;
        slot.timeLeft = 0;
      }
      this._updateCookSlotUI(i);
    }
  }

  /** @private */
  _updateSkillButtonUI() {
    if (!this._skillBtnBg || !this._skillBtnText) return;
    const skill = ChefManager.getServiceSkill();
    const chefData = ChefManager.getChefData();
    if (!skill) return;

    if (this.skillCooldownLeft > 0) {
      this._skillBtnBg.fillColor = 0x333344;
      this._skillBtnText.setText(`${Math.ceil(this.skillCooldownLeft / 1000)}\uCD08`).setColor('#888888');
    } else if (this.patienceResetRemaining > 0) {
      this._skillBtnBg.fillColor = 0x448844;
      this._skillBtnText.setText(`\uB9AC\uC14B: ${this.patienceResetRemaining}`).setColor('#ffffff');
    } else {
      this._skillBtnBg.fillColor = 0x446688;
      this._skillBtnText.setText(`${chefData?.icon || ''} ${skill.name}`).setColor('#ffffff');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D10: 영업 종료 + ResultScene ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _endService(reason) {
    if (this.isServiceOver) return;
    this.isServiceOver = true;

    let message;
    switch (reason) {
      case 'time': message = '\uC601\uC5C5 \uC2DC\uAC04 \uC885\uB8CC!'; break;
      case 'stock': message = '\uC7AC\uB8CC \uC18C\uC9C4! \uC601\uC5C5 \uC885\uB8CC'; break;
      case 'no_recipe': message = '\uB9CC\uB4E4 \uC218 \uC788\uB294 \uC74C\uC2DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4!'; break;
      case 'satisfaction': message = '\uB808\uC2A4\uD1A0\uB791 \uD3D0\uC1C4!'; break;
      case 'manual': message = '\uC7A5\uC0AC \uB9C8\uAC10!'; break;
    }

    if (this.satisfaction <= 0) this.totalGold = Math.floor(this.totalGold * 0.5);

    // 평론가 혹평 패널티
    if (this._criticPenaltyApplied) { this.totalGold = Math.floor(this.totalGold * 0.9); this._criticPenaltyApplied = false; }
    const criticAvgScore = this.criticScores.length > 0 ? this.criticScores.reduce((a, b) => a + b, 0) / this.criticScores.length : null;
    if (criticAvgScore !== null && criticAvgScore < 0.7) SaveManager.setCriticPenalty(true);

    // 축복 골드 배율
    const goldMultiplier = BranchEffects.getBlessingMultiplier('gold_gain');
    if (goldMultiplier !== 1.0) { this.totalGold = Math.floor(this.totalGold * goldMultiplier); this.tipTotal = Math.floor(this.tipTotal * goldMultiplier); }

    // 골드 적립
    const earnedGold = this.totalGold + this.tipTotal;
    if (earnedGold > 0) {
      ToolManager.addGold(earnedGold);
      try { DailyMissionManager.recordProgress('gold_earn', earnedGold); } catch { /* noop */ }
      try { DailyMissionManager.recordProgress('gold_single_run', earnedGold); } catch { /* noop */ }
      AchievementManager.increment('total_gold_earned', earnedGold);
      AchievementManager.check(this, 'total_gold_earned', 0);
    }

    // 분기 레시피 소비
    if (Array.isArray(this._sessionBranchRecipeIds)) {
      for (const recipeId of this._sessionBranchRecipeIds) SaveManager.consumeBranchRecipe(recipeId);
      this._sessionBranchRecipeIds = [];
    }

    this._showMessage(message, 2000);

    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ResultScene', {
          stageId: this.stageId,
          marketResult: this.marketResult,
          serviceResult: {
            servedCount: this.servedCount,
            totalCustomers: this.totalCustomers,
            goldEarned: this.totalGold,
            tipEarned: this.tipTotal,
            maxCombo: this.maxCombo,
            satisfaction: this.totalCustomers === 0 ? 0 : this.satisfaction,
            criticAvgScore,
            regularAchieved: this._regularServedCount >= 5,
            eventBonusGold: 0,
          },
          isMarketFailed: false,
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D11: 영업 이벤트 시스템 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _updateEvents(dt) {
    if (this.eventStartDelay > 0) { this.eventStartDelay -= dt; return; }
    if (this.activeEvent) {
      if (this.activeEvent.type !== 'food_review') {
        this.activeEvent.timeLeft -= dt;
        if (this.activeEvent.timeLeft <= 0) this._endEvent();
      }
      return;
    }
    if (this.eventCooldown > 0) { this.eventCooldown -= dt; return; }
    if (this.eventCount >= EVENT_MAX_COUNT) return;
    if (Math.random() < 0.05 * dt) this._triggerRandomEvent();
  }

  /** @private */
  _triggerRandomEvent() {
    const types = Object.keys(SERVICE_EVENT_TYPES);
    let chosen;
    if (this._buffVipFoodReviewBonus > 0 && Math.random() < this._buffVipFoodReviewBonus) {
      chosen = 'food_review';
    } else {
      chosen = types[Math.floor(Math.random() * types.length)];
    }
    const evtDef = SERVICE_EVENT_TYPES[chosen];
    this.eventCount++;
    this.eventCooldown = EVENT_MIN_INTERVAL;
    this.activeEvent = { type: chosen, timeLeft: evtDef.duration > 0 ? evtDef.duration : 9999, data: {} };
    if (chosen === 'food_review') this.foodReviewRemaining = 5;
    if (chosen === 'kitchen_accident') {
      let targetIdx = this.cookingSlots.findIndex(s => !s.recipe && !s.washing);
      if (targetIdx === -1) targetIdx = 0;
      this.accidentSlotIdx = targetIdx;
    }
    this._showEventBanner(evtDef);
  }

  /** @private */
  _endEvent() {
    if (!this.activeEvent) return;
    if (this.activeEvent.type === 'food_review') this.foodReviewRemaining = 0;
    if (this.activeEvent.type === 'kitchen_accident') this.accidentSlotIdx = -1;
    this.activeEvent = null;
  }

  /** @private */
  _showEventBanner(evtDef) {
    const bannerX = GAME_WIDTH / 2, bannerY = TAVERN_LAYOUT.HUD_H + 30;
    const bg = this.add.rectangle(bannerX, bannerY, GAME_WIDTH - 40, 36, evtDef.bannerColor, 0.9).setDepth(9150);
    const text = this.add.text(bannerX, bannerY, evtDef.messageKo, {
      fontSize: '11px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(9151);
    this.time.delayedCall(EVENT_BANNER_DURATION * 1000, () => {
      this.tweens.add({ targets: [bg, text], alpha: 0, duration: 500, onComplete: () => { bg.destroy(); text.destroy(); } });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── D12: 유랑 미력사 패시브 스킬 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _applyWanderingChefSkills() {
    const wc = SaveManager.getWanderingChefs();
    const hired = wc.hired || [];

    // 버프 변수 초기화
    this._buffPatienceMult = 0;
    this._buffRushedPatienceMult = 0;
    this._buffCookTimeReduce = 0;
    this._buffCookComboReduce = 0;
    this._buffGourmetRateAdd = 0;
    this._buffGourmetRewardMult = 0;
    this._buffServeSpeed = 0;
    this._buffEarlyBonus = 0;
    this._buffEarlyDuration = 0;
    this._buffIngredientRefund = 0;
    this._buffNoFailDelay = false;
    this._buffVipRateMult = 1;
    this._buffVipRewardMult = 0;
    this._buffVipFoodReviewBonus = 0;
    this._yokoChainThreshold = 0;
    this._yokoChainReward = 0;
    this._yokoChainCount = 0;
    this._yokoProtectNext = false;
    this._yokoProtectActive = false;

    if (hired.length === 0) return;

    for (const chefId of hired) {
      const def = getWanderingChefById(chefId);
      if (!def) continue;
      const level = wc.enhancements[chefId] || 1;
      const idx = level - 1;
      const v = def.skillValues[idx];
      const v2 = def.skillValues2 ? def.skillValues2[idx] : 0;

      switch (def.skillType) {
        case 'patience_pct': this._buffPatienceMult += v; this._buffRushedPatienceMult += v2; break;
        case 'cook_time_reduce': this._buffCookTimeReduce += v; this._buffCookComboReduce = Math.max(this._buffCookComboReduce, v2); break;
        case 'gourmet_rate': this._buffGourmetRateAdd += v; this._buffGourmetRewardMult += v2; break;
        case 'serve_speed': this._buffServeSpeed += v; break;
        case 'early_session_bonus': this._buffEarlyBonus = Math.max(this._buffEarlyBonus, v); this._buffEarlyDuration = Math.max(this._buffEarlyDuration, v2); break;
        case 'ingredient_refund': this._buffIngredientRefund = Math.max(this._buffIngredientRefund, v); this._buffNoFailDelay = this._buffNoFailDelay || (v2 > 0); break;
        case 'vip_rate': this._buffVipRateMult *= v; this._buffVipRewardMult += v2; if (level === 3) this._buffVipFoodReviewBonus += 0.30; break;
        case 'chain_serve': this._yokoChainThreshold = v; this._yokoChainReward = v2; break;
      }
    }

    // 인내심 배율 적용
    if (this._buffPatienceMult > 0 || this._buffRushedPatienceMult > 0) {
      this._patienceMults = { ...CUSTOMER_PATIENCE_MULT };
      for (const type of Object.keys(this._patienceMults)) this._patienceMults[type] *= (1 + this._buffPatienceMult);
      if (this._buffRushedPatienceMult > 0) this._patienceMults.rushed *= (1 + this._buffRushedPatienceMult);
    } else {
      this._patienceMults = CUSTOMER_PATIENCE_MULT;
    }

    // 특수 손님 확률 적용
    if (this._buffGourmetRateAdd > 0 || this._buffVipRateMult !== 1) {
      const base = this.specialRates;
      this.specialRates = { ...base };
      if (this._buffGourmetRateAdd > 0) this.specialRates.gourmet = Math.min(0.50, (base.gourmet || 0) + this._buffGourmetRateAdd);
      if (this._buffVipRateMult !== 1) this.specialRates.vip = Math.min(0.50, (base.vip || 0) * this._buffVipRateMult);
    }
  }

  /** @private */
  _scheduleMireukTraveler() {
    if (!this.isEndless) {
      const saveData = SaveManager.load();
      const isSeason2 = !!saveData.season2Unlocked;
      if (!isSeason2 && this.chapter < 7) return;
    }
    const spawnChance = this.isEndless ? 0.08 : 0.16;
    if (Math.random() >= spawnChance) return;
    const delayMs = Phaser.Math.Between(60000, 90000);
    this.time.delayedCall(delayMs, () => {
      if (this.isServiceOver || this.isPaused || this._mireukSpawned) return;
      this._spawnMireukTraveler();
    });
  }

  /** @private */
  _spawnMireukTraveler() {
    const free = findFreeSlot();
    if (!free) return;
    this._mireukSpawned = true;
    this._spawnSingleCustomer(free, 'mireuk_traveler');
  }

  // ══════════════════════════════════════════════════════════════════
  // ── 유틸리티 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _isAllStockEmpty() { return this.inventoryManager.getTotal() === 0; }

  /** @private */
  _hasCookingInProgress() { return this.cookingSlots.some(s => s.recipe && !s.ready); }

  /** @private */
  _hasReadyDish() { return this.cookingSlots.some(s => s.recipe && s.ready); }

  /** @private */
  _hasWashingSlot() { return this.cookingSlots.some(s => s.washing); }

  /** @private */
  _canMakeAnyRecipe() { return this.availableRecipes.some(r => this.inventoryManager.hasEnough(r.ingredients)); }

  /** @private */
  _showMessage(text, duration = 1500) {
    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, text, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      backgroundColor: '#000000aa', padding: { x: 16, y: 8 }, align: 'center',
    }).setOrigin(0.5).setDepth(9300);
    this.time.delayedCall(duration, () => {
      this.tweens.add({ targets: msg, alpha: 0, duration: 300, onComplete: () => msg.destroy() });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Back 버튼 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _buildBackButton() {
    const btn = this.add.text(4, 4, '< BACK', {
      fontSize: '10px', fontFamily: FONT_FAMILY, color: '#ffffff', backgroundColor: '#33333399', padding: { x: 4, y: 2 },
    }).setOrigin(0, 0).setDepth(9999).setInteractive();
    btn.on('pointerover', () => btn.setColor('#ffff88'));
    btn.on('pointerout', () => btn.setColor('#ffffff'));
    btn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Y축 깊이정렬 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _applyDepthSort() {
    const children = this.children.list;
    for (let i = 0; i < children.length; i++) {
      const obj = children[i];
      if (obj.depth >= 9000) continue;
      if (obj.type === 'Graphics') continue;
      if (obj._fixedDepth) continue;
      obj.setDepth(obj.y);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── 씬 정리 ──
  // ══════════════════════════════════════════════════════════════════

  /** @private */
  _shutdown() {
    this._customers = [];
    this.cookingSlots = [];
    this.activeEvent = null;
    this.accidentSlotIdx = -1;
    this.foodReviewRemaining = 0;
    this._mireukSpawned = false;
    this.skillCooldownLeft = 0;
    this.patienceResetRemaining = 0;
    this.patienceFrozen = false;
    this.freezeTimeLeft = 0;
    this._precisionCutRemaining = 0;
    this._selectedRecipeId = null;
    this._orderBubbleMap.clear();
    this._patienceBarMap.clear();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
