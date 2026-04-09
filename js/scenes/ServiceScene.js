/**
 * @fileoverview 영업 타이쿤 씬 (ServiceScene).
 * Phase 7-2: 장보기(MarketScene)에서 수집한 재료로 레스토랑을 영업한다.
 * Phase 8-3: 동적 테이블 석수, 테이블 등급, 인테리어 글로벌 버프 반영.
 * Phase 8-4: 직원 시스템 — 세척 대기시간, 자동 서빙, 직원 아이콘 표시.
 * Phase 8-5: 특수 손님 5종(일반/VIP/미식가/급한/단체) + 영업 이벤트 4종.
 * Phase 8-6: 셰프 영업 액티브 스킬 (특급 서비스 / 화염 조리 / 시간 동결).
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
import { STAGES } from '../data/stageData.js';
import { ALL_SERVING_RECIPES, RECIPE_MAP } from '../data/recipeData.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import { STAFF_TYPES } from '../data/staffData.js';

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
};

/** 손님 유형별 인내심 배율 */
const CUSTOMER_PATIENCE_MULT = {
  normal: 1.0,
  vip: 0.7,
  gourmet: 1.0,
  rushed: 0.4,
  group: 1.2,
};

/** 손님 유형별 보상 배율 */
const CUSTOMER_REWARD_MULT = {
  normal: 1.0,
  vip: 1.8,
  gourmet: 1.8,
  rushed: 2.5,
  group: 2.0,
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
  }

  create() {
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

    // 페이드 인
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 씬 종료 시 정리
    this.events.once('shutdown', this._shutdown, this);
  }

  // ── HUD (상단 40px) ──────────────────────────────────────────────

  /** @private */
  _createHUD() {
    this.add.rectangle(GAME_WIDTH / 2, HUD_H / 2, GAME_WIDTH, HUD_H, 0x1a1a2e)
      .setDepth(100);

    this.goldText = this.add.text(10, 10, `\uD83E\uDE99 ${this.totalGold}`, {
      fontSize: '14px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(101);

    this.timeText = this.add.text(GAME_WIDTH / 2, 10, this._formatTime(this.serviceTimeLeft), {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(101);

    this.satText = this.add.text(GAME_WIDTH - 10, 10, `\u2B50 ${this.satisfaction}%`, {
      fontSize: '14px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(101);

    this.comboText = this.add.text(GAME_WIDTH / 2, 26, '', {
      fontSize: '11px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(101);

    // Phase 8-5: 활성 이벤트 아이콘 + 남은 시간 표시
    this.eventHudText = this.add.text(GAME_WIDTH - 10, 26, '', {
      fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(101);
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

  /** @private */
  _createTables() {
    // 홀 배경 — 인테리어 Lv3 이상 시 약간 밝은 배경
    const hallBgColor = (this.interiorFlower >= 3 || this.interiorLighting >= 3) ? 0x222240 : 0x1a1a2e;
    this.add.rectangle(GAME_WIDTH / 2, HALL_Y + HALL_H / 2, GAME_WIDTH, HALL_H, hallBgColor)
      .setDepth(0);

    /** @type {Phaser.GameObjects.Container[]} */
    this.tableContainers = [];

    const cellW = GAME_WIDTH / this.tableCols;
    const cellH = HALL_H / TABLE_ROWS;
    const tw = this.tableW;
    const th = this.tableH;
    const chairOffset = Math.floor(tw / 2.5);

    for (let row = 0; row < TABLE_ROWS; row++) {
      for (let col = 0; col < this.tableCols; col++) {
        const idx = row * this.tableCols + col;
        if (idx >= this.tableCount) break;

        const cx = cellW * col + cellW / 2;
        const cy = HALL_Y + cellH * row + cellH / 2;
        const grade = this.tableUpgrades[idx] || 0;

        const container = this.add.container(cx, cy).setDepth(10);

        // 테이블 배경 — 등급별 색상
        const tableBg = this.add.rectangle(0, 0, tw, th, TABLE_COLORS[grade], 0.6)
          .setStrokeStyle(TABLE_STROKE_WIDTH[grade], TABLE_STROKE_COLOR[grade]);
        container.add(tableBg);

        // Lv1: 테이블보 (가운데 작은 밝은 사각형)
        if (grade >= 1) {
          const cloth = this.add.rectangle(0, 0, tw - 16, th - 16, 0xffffff, 0.15);
          container.add(cloth);
        }

        // Lv4: VIP 뱃지 텍스트
        if (grade >= 4) {
          const vipBadge = this.add.text(tw / 2 - 4, -th / 2 + 4, 'VIP', {
            fontSize: '7px', fontStyle: 'bold', color: '#ffd700',
            backgroundColor: '#000000aa',
            padding: { x: 2, y: 1 },
          }).setOrigin(1, 0);
          container.add(vipBadge);
        }

        // 의자 (작은 원 2개)
        const chair1 = this.add.circle(-chairOffset, 0, 8, 0x654321);
        const chair2 = this.add.circle(chairOffset, 0, 8, 0x654321);
        container.add([chair1, chair2]);

        // "빈 테이블" 텍스트
        const statusText = this.add.text(0, -20, '\uBE48 \uD14C\uC774\uBE14', {
          fontSize: '10px', color: '#888888',
        }).setOrigin(0.5);
        container.add(statusText);

        // 말풍선 (숨겨짐)
        const bubble = this.add.rectangle(0, -45, 80, 22, 0xffffff, 0.9)
          .setStrokeStyle(1, 0x000000).setVisible(false);
        container.add(bubble);
        const bubbleText = this.add.text(0, -45, '', {
          fontSize: '9px', color: '#333333',
        }).setOrigin(0.5).setVisible(false);
        container.add(bubbleText);

        // 인내심 바 (숨겨짐)
        const pBarBg = this.add.rectangle(0, 30, 60, 6, 0x333333).setVisible(false);
        container.add(pBarBg);
        const pBarFill = this.add.rectangle(-30, 30, 60, 6, 0x00ff00)
          .setOrigin(0, 0.5).setVisible(false);
        container.add(pBarFill);

        // 손님 아이콘 (숨겨짐)
        const custIcon = this.add.text(0, -5, '', {
          fontSize: '24px',
        }).setOrigin(0.5).setVisible(false);
        container.add(custIcon);

        // 터치 영역
        const hitArea = this.add.rectangle(0, 0, tw + 10, th + 10, 0x000000, 0)
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
        container.setData('custIcon', custIcon);
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
    const custIcon = container.getData('custIcon');

    if (!cust) {
      // 빈 테이블
      statusText.setText('\uBE48 \uD14C\uC774\uBE14').setVisible(true);
      bubble.setVisible(false);
      bubbleText.setVisible(false);
      pBarBg.setVisible(false);
      pBarFill.setVisible(false);
      custIcon.setVisible(false);
      return;
    }

    statusText.setVisible(false);

    // 손님 아이콘 — Phase 8-5: customerType 기반
    const typeIcon = CUSTOMER_TYPE_ICONS[cust.customerType] || CUSTOMER_TYPE_ICONS.normal;
    // 단체 손님 부분 서빙 완료 시 체크마크 표시
    const servedMark = (cust.customerType === 'group' && cust.groupServed) ? '\u2705' : '';
    custIcon.setText(servedMark || typeIcon).setVisible(true);

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
    this.add.rectangle(GAME_WIDTH / 2, COOK_Y + COOK_H / 2, GAME_WIDTH, COOK_H, 0x222233)
      .setDepth(0);

    /** @type {Phaser.GameObjects.Container[]} */
    this.cookSlotContainers = [];
    const slotW = GAME_WIDTH / MAX_COOKING_SLOTS;

    for (let i = 0; i < MAX_COOKING_SLOTS; i++) {
      const cx = slotW * i + slotW / 2;
      const cy = COOK_Y + COOK_H / 2;

      const container = this.add.container(cx, cy).setDepth(10);

      // 슬롯 배경
      const bg = this.add.rectangle(0, 0, slotW - 10, COOK_H - 10, 0x333344)
        .setStrokeStyle(1, 0x555566);
      container.add(bg);

      // 라벨
      const label = this.add.text(0, -12, '\uBE48 \uC2AC\uB86F', {
        fontSize: '11px', color: '#888888',
      }).setOrigin(0.5);
      container.add(label);

      // 진행 바 배경
      const progBg = this.add.rectangle(0, 10, slotW - 30, 8, 0x444455);
      container.add(progBg);
      // 진행 바
      const progFill = this.add.rectangle(-(slotW - 30) / 2, 10, slotW - 30, 8, 0x44aaff)
        .setOrigin(0, 0.5);
      container.add(progFill);

      container.setData('label', label);
      container.setData('progBg', progBg);
      container.setData('progFill', progFill);
      container.setData('progWidth', slotW - 30);

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

    // Phase 8-5: 주방 사고로 비활성화된 슬롯
    if (idx === this.accidentSlotIdx) {
      label.setText('\uD83D\uDD25 \uC0AC\uC6A9 \uBD88\uAC00').setColor('#ff4444');
      progFill.setScale(0, 1).setFillStyle(0xff4444);
      return;
    }

    // 세척 중 상태
    if (slot.washing) {
      const remain = Math.ceil(slot.washTimeLeft / 1000);
      label.setText(`\uC138\uCC99\uC911... ${remain}\uCD08`).setColor('#aaaaaa');
      const ratio = 1 - (slot.washTimeLeft / WASH_TIME_MS);
      progFill.setScale(Math.max(0, ratio), 1).setFillStyle(0x888888);
      return;
    }

    if (!slot.recipe) {
      label.setText('\uBE48 \uC2AC\uB86F').setColor('#888888');
      progFill.setScale(0, 1);
      return;
    }

    if (slot.ready) {
      label.setText(`\u2705 ${slot.recipe.nameKo}`).setColor('#44ff44');
      progFill.setScale(1, 1).setFillStyle(0x44ff44);
    } else {
      const remain = Math.ceil(slot.timeLeft / 1000);
      label.setText(`\uC870\uB9AC\uC911: ${slot.recipe.nameKo} ${remain}\uCD08`).setColor('#ffffff');
      const ratio = 1 - (slot.timeLeft / slot.totalTime);
      progFill.setScale(Math.max(0, ratio), 1).setFillStyle(0x44aaff);
    }
  }

  // ── 재료 재고 패널 (340~440px) ────────────────────────────────────

  /** @private */
  _createInventoryPanel() {
    this.add.rectangle(GAME_WIDTH / 2, STOCK_Y + STOCK_H / 2, GAME_WIDTH, STOCK_H, 0x1a1a2e)
      .setDepth(0);

    this.add.text(10, STOCK_Y + 5, '\uC7AC\uB8CC \uC7AC\uACE0', {
      fontSize: '11px', color: '#aaaaaa', fontStyle: 'bold',
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
      const txt = this.add.text(x, y, `${info.icon}\u00D7${qty}`, {
        fontSize: '13px', color: qty > 0 ? '#ffffff' : '#555555',
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
      txt.setColor(qty > 0 ? '#ffffff' : '#555555');
    }
  }

  // ── 레시피 퀵슬롯 (440~570px) ────────────────────────────────────

  /** @private */
  _createRecipeQuickSlots() {
    this.add.rectangle(GAME_WIDTH / 2, RECIPE_Y + RECIPE_H / 2, GAME_WIDTH, RECIPE_H, 0x111122)
      .setDepth(0);

    this.add.text(10, RECIPE_Y + 5, '\uB808\uC2DC\uD53C', {
      fontSize: '11px', color: '#aaaaaa', fontStyle: 'bold',
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
      const bg = this.add.rectangle(x, y, btnW, btnH, 0x334455)
        .setStrokeStyle(1, 0x556677)
        .setInteractive({ useHandCursor: true })
        .setDepth(10);

      // 레시피 이름 + 재료 요약
      const ingStr = Object.entries(recipe.ingredients)
        .map(([t, n]) => `${INGREDIENT_TYPES[t]?.icon || t}${n}`)
        .join('');
      const label = this.add.text(x, y - 6, recipe.nameKo, {
        fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);
      const subLabel = this.add.text(x, y + 10, ingStr, {
        fontSize: '10px', color: '#cccccc',
      }).setOrigin(0.5).setDepth(11);

      bg.on('pointerdown', () => this._onRecipeTap(recipe));

      this.recipeButtons.push({ btn: bg, text: label, subText: subLabel, recipe });
    });
  }

  /** 레시피 퀵슬롯 활성/비활성 갱신 */
  _updateRecipeQuickSlots() {
    for (const entry of this.recipeButtons) {
      const canMake = this.inventoryManager.hasEnough(entry.recipe.ingredients);
      if (canMake) {
        entry.btn.setFillStyle(0x334455).setAlpha(1);
        entry.text.setColor('#ffffff');
      } else {
        entry.btn.setFillStyle(0x222233).setAlpha(0.5);
        entry.text.setColor('#666666');
      }
    }
  }

  // ── 하단 바 (570~640px) ───────────────────────────────────────────

  /** @private */
  _createBottomBar() {
    this.add.rectangle(GAME_WIDTH / 2, BOTTOM_Y + BOTTOM_H / 2, GAME_WIDTH, BOTTOM_H, 0x0d0d1a)
      .setDepth(100);

    // ── Phase 8-6: 셰프 영업 액티브 스킬 버튼 ──
    const chefData = ChefManager.getChefData();
    const skill = ChefManager.getServiceSkill();

    if (chefData && skill) {
      // 스킬 버튼 배경 (120x36)
      this.skillBtnBg = this.add.rectangle(70, BOTTOM_Y + 14, 120, 36, 0x446688, 0.9)
        .setStrokeStyle(1, 0x6688aa)
        .setInteractive({ useHandCursor: true })
        .setDepth(101);
      // 스킬 버튼 텍스트
      this.skillBtnText = this.add.text(70, BOTTOM_Y + 14, `${chefData.icon} ${skill.name}`, {
        fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(102);

      this.skillBtnBg.on('pointerdown', () => this._onSkillTap());
    } else {
      // 셰프 미선택 시 기존 텍스트 표시
      this.skillBtnBg = null;
      this.skillBtnText = null;
      this.add.text(20, BOTTOM_Y + 14, '\uC158\uD504 \uC5C6\uC74C', {
        fontSize: '11px', color: '#aaddff',
      }).setOrigin(0, 0.5).setDepth(101);
    }

    // ── Phase 8-4: 직원 아이콘 표시 ──
    this._createStaffIcons();

    // 일시정지 버튼
    const pauseBtn = this.add.rectangle(GAME_WIDTH - 50, BOTTOM_Y + BOTTOM_H / 2, 80, 36, 0x444466)
      .setStrokeStyle(1, 0x6666aa)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);
    this.pauseLabel = this.add.text(GAME_WIDTH - 50, BOTTOM_Y + BOTTOM_H / 2, '\u23F8 \uC77C\uC2DC\uC815\uC9C0', {
      fontSize: '11px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(102);

    pauseBtn.on('pointerdown', () => this._togglePause());
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

      const iconText = this.add.text(x, iconY, displayIcon, {
        fontSize: '18px', color: color,
      }).setOrigin(0, 0.5).setDepth(101);

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
      case 'petit_chef': return '\uC870\uB9AC\uC2DC\uAC04 -15%';
      case 'flame_chef': return '\uAD6C\uC774 \uBCF4\uC0C1 +25%';
      case 'ice_chef': return '\uC778\uB0B4\uC2EC +20%';
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

    if (this.skillCooldownLeft > 0) {
      // 쿨다운 중: 어둡게 + 남은 초 표시
      this.skillBtnBg.setFillStyle(0x333344, 0.9);
      const remainSec = Math.ceil(this.skillCooldownLeft / 1000);
      this.skillBtnText.setText(`${remainSec}\uCD08`).setColor('#888888');
    } else if (this.patienceResetRemaining > 0) {
      // 꼬마셰프: 리셋 남은 수 표시
      this.skillBtnBg.setFillStyle(0x44aa44, 0.9);
      this.skillBtnText.setText(`\uB9AC\uC14B \uB0A8\uC74C: ${this.patienceResetRemaining}\uBA85`).setColor('#ffffff');
    } else {
      // 준비 완료: 밝게 + 스킬 이름
      this.skillBtnBg.setFillStyle(0x446688, 0.9);
      this.skillBtnText.setText(`${chefData.icon} ${skill.name}`).setColor('#ffffff');
    }
  }

  // ── 일시정지 ──────────────────────────────────────────────────────

  /** @private */
  _togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseLabel.setText(this.isPaused ? '\u25B6 \uC7AC\uAC1C' : '\u23F8 \uC77C\uC2DC\uC815\uC9C0');
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
    if (this._isAllStockEmpty() && !this._hasCookingInProgress() && !this._hasReadyDish() && !this._hasWashingSlot()) {
      this._endService('stock');
      return;
    }

    // HUD 갱신
    this._updateHUD();
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
    const typeMult = CUSTOMER_PATIENCE_MULT[customerType] || 1.0;

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
    const typeMult = CUSTOMER_PATIENCE_MULT.group;
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
    let pool;

    if (customerType === 'gourmet') {
      // 미식가: ★★★ 이상만 주문
      const highTierAll = this.availableRecipes.filter(r => r.tier >= 3);
      if (highTierAll.length === 0) {
        // tier 3 이상 레시피가 없으면 일반 풀 사용
        pool = this.availableRecipes;
      } else {
        // 재고로 만들 수 있는 것 우선
        const highTierPossible = highTierAll.filter(r =>
          this.inventoryManager.hasEnough(r.ingredients)
        );
        pool = highTierPossible.length > 0 ? highTierPossible : highTierAll;
      }
    } else {
      // 일반/VIP/급한/단체: 재고 가능한 것 우선, 없으면 아무거나
      const possibleRecipes = this.availableRecipes.filter(r =>
        this.inventoryManager.hasEnough(r.ingredients)
      );
      pool = possibleRecipes.length > 0 ? possibleRecipes : this.availableRecipes;
    }

    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
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
        this._updateTableUI(i);

        // 퇴장 이펙트
        this._showFloatingText(this.tableContainers[i], `\uD83D\uDE21 -${satPenalty}%`, '#ff4444');

        // 만족도 0% 체크
        if (this.satisfaction <= 0) {
          this._endService('satisfaction');
          return;
        }
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
    const totalTime = recipe.cookTime * cookTimeBonus * (1 - kitchenBonus);
    this.cookingSlots[emptySlot] = {
      recipe: recipe,
      timeLeft: totalTime,
      totalTime: totalTime,
      ready: false,
      washing: false,
      washTimeLeft: 0,
    };
    this._updateCookSlotUI(emptySlot);
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

    // 골드 = 기본보상 * 테이블팁배율 * (1 + 조명팁보너스) * 서빙등급 * 콤보 * 유형배율 * 그릴
    const baseGold = cust.baseReward;
    const totalGold = Math.floor(baseGold * tableTipMult * (1 + interiorTipBonus) * tipGrade * comboMult * typeMult * grillBonus);

    this.totalGold += totalGold;
    this.servedCount++;

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

    // 서빙 이펙트
    const tipStr = tipGrade > 1 ? ' +\uD301!' : '';
    this._showFloatingText(
      this.tableContainers[tableIdx],
      `+${totalGold}G${tipStr}`,
      '#ffd700'
    );

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
      case 'satisfaction':
        message = '\uB808\uC2A4\uD1A0\uB791 \uD3D0\uC1C4!';
        isVictory = true; // 보상 50% 감소이지만 실패는 아님
        break;
    }

    // 만족도 0이면 보상 50% 감소
    if (this.satisfaction <= 0) {
      this.totalGold = Math.floor(this.totalGold * 0.5);
    }

    this._showMessage(message, 2000);

    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
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

    // 딜레이 카운트다운
    this.autoServeTimer += delta;
    if (this.autoServeTimer < AUTO_SERVE_DELAY_MS) return;

    // 3초 경과 — 자동 서빙 실행
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
    const chosen = types[Math.floor(Math.random() * types.length)];
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

    // 배너 배경
    const bg = this.add.rectangle(bannerX, bannerY, bannerW, bannerH, evtDef.bannerColor, 0.9)
      .setStrokeStyle(1, 0xffffff)
      .setDepth(250);

    // 배너 텍스트
    const text = this.add.text(bannerX, bannerY, evtDef.messageKo, {
      fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(251);

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
   * 플로팅 텍스트 이펙트.
   * @param {Phaser.GameObjects.Container} target - 기준 컨테이너
   * @param {string} text
   * @param {string} color
   * @private
   */
  _showFloatingText(target, text, color) {
    const fx = this.add.text(target.x, target.y - 20, text, {
      fontSize: '14px', fontStyle: 'bold', color: color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

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
    }).setOrigin(0.5).setDepth(300);

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
    this.tableContainers = [];
    this.cookSlotContainers = [];
    // Phase 8-5: 이벤트 정리
    this.activeEvent = null;
    this.accidentSlotIdx = -1;
    this.foodReviewRemaining = 0;
    // Phase 8-6: 스킬 상태 정리
    this.skillCooldownLeft = 0;
    this.skillCooldownMax = 0;
    this.patienceResetRemaining = 0;
    this.patienceFrozen = false;
    this.freezeTimeLeft = 0;
    this.skillBtnBg = null;
    this.skillBtnText = null;
  }
}
