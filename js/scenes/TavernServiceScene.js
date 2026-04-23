/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 -- Phase A-bis V12.
 * A1~A4 통합 메인 씬: 레이아웃 영역 디버그, 가구 배치, 벤치 슬롯, 상태 전환 시연, Y축 깊이정렬.
 * V12: 4분면(quad) 세로 테이블 배치, 좌석 24석(4quad x 좌3+우3).
 *
 * 기존 ServiceScene.js와 완전 독립. import/참조/코드 복사 없음.
 * 공용 import(Phaser, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY)만 사용.
 *
 * 진입: URL ?scene=tavern 또는 DevHelper 디버그 메뉴.
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
  createSeatingState, occupySlot, vacateSlot, findFreeSlot, getSlotWorldPos,
} from '../data/tavernLayoutData.js';
import {
  ChefState, CustomerState,
  CHEF_STATE_COLORS, CUSTOMER_STATE_COLORS,
} from '../data/tavernStateData.js';

// ── 셰프 상태 순환 순서 (탭 시 순환) ──
const CHEF_CYCLE = [
  ChefState.IDLE_SIDE,
  ChefState.COOK,
  ChefState.CARRY_R,
  ChefState.SERVE,
];

// ── 손님 상태 순환 순서 (탭 시 순환, 짝수/홀수로 sit_down/sit_up 분기) ──
const CUSTOMER_CYCLE_DOWN = [
  CustomerState.ENTER,
  CustomerState.QUEUE,
  CustomerState.SIT_DOWN,
  CustomerState.EAT_DOWN,
  CustomerState.LEAVE,
];

const CUSTOMER_CYCLE_UP = [
  CustomerState.ENTER,
  CustomerState.QUEUE,
  CustomerState.SIT_UP,
  CustomerState.EAT_UP,
  CustomerState.LEAVE,
];

// ── 에셋 소스 모드 (Phase B 실 에셋 전환 토글) ──
// 'dummy': PIL placeholder (tavern_dummy/ 폴더 사용)
// 'real':  실 픽셀아트 에셋 (tavern/ 폴더 사용)
const ASSET_MODE = 'real'; // Phase B-1 실 에셋 전환

// ── 실 에셋 텍스처 키 매핑 (dummy -> real) ──
// _placeImageOrRect에서 ASSET_MODE === 'real'일 때 우선 시도할 키
const REAL_KEY_MAP = Object.freeze({
  'tavern_dummy_counter_v12':          'tavern_counter_v12',
  'tavern_dummy_table_vertical_v12':   'tavern_table_vertical_v12',
  'tavern_dummy_bench_vertical_l_v12': 'tavern_bench_vertical_l_v12',
  'tavern_dummy_bench_vertical_r_v12': 'tavern_bench_vertical_r_v12',
  'tavern_dummy_entrance_v12':         'tavern_entrance_v12',
  'tavern_dummy_customer_seated_down': 'tavern_customer_normal_seated_right',
  'tavern_dummy_customer_seated_up':   'tavern_customer_normal_seated_left',
  'tavern_dummy_chef_idle_side':       'tavern_chef_mimi_idle_side',
});

// V12 술통 위치 (카운터 좌측 하단 주방 내)
const BARREL_POSITIONS = [
  { x: 20, y: 160 },
  { x: 50, y: 160 },
];

export class TavernServiceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TavernServiceScene' });
  }

  // ── preload ──

  preload() {
    // PIL 더미 이미지 로드 시도. 파일이 없으면 Graphics로 대체.
    const dummyPath = 'assets/tavern_dummy/';

    // V12 에셋 키 (V10 키 bench_long_lv0, table_long_lv0, counter_topdown, door_frame 제거)
    const dummies = [
      // 공통 유지
      'barrel', 'wall_decor_painting',
      'chef_idle_side', 'customer_walk_r',
      'customer_seated_down', 'customer_seated_up',
      'floor_wood_tile', 'wall_horizontal',
      // V12 신규
      'counter_v12',           // 40x100px
      'table_vertical_v12',    // 44x72px
      'bench_vertical_l_v12',  // 14x76px (facing-right)
      'bench_vertical_r_v12',  // 14x76px (facing-left)
      'entrance_v12',          // 32x40px
    ];

    for (const name of dummies) {
      this.load.image(`tavern_dummy_${name}`, `${dummyPath}${name}.png`);
    }

    // ── Phase B-1: 실 에셋 로드 (ASSET_MODE === 'real') ──
    if (ASSET_MODE === 'real') {
      const realPath = 'assets/tavern/';
      const realAssets = [
        // 가구 5종
        'counter_v12',           // 40x100px
        'table_vertical_v12',    // 44x72px
        'bench_vertical_l_v12',  // 14x76px
        'bench_vertical_r_v12',  // 14x76px
        'entrance_v12',          // 32x40px
        // 캐릭터 3종
        'customer_normal_seated_right',  // 16x22px
        'customer_normal_seated_left',   // 16x22px
        'chef_mimi_idle_side',           // 16x24px
      ];
      for (const name of realAssets) {
        this.load.image(`tavern_${name}`, `${realPath}${name}.png`);
      }
    }
  }

  // ── create ──

  create() {
    /** @type {Object} 레이아웃 참조 (Playwright 테스트 접근용) */
    this._layout = TAVERN_LAYOUT;

    // A2: 좌석 상태 초기화
    /** @type {Array<Object>} 좌석 런타임 상태 */
    this._seatingState = createSeatingState('lv0');

    // A1: 영역 경계선 디버그
    this._buildLayout();

    // A1: 가구 배치
    this._buildFurniture();

    // A2: 벤치 슬롯 표시
    this._buildBenchSlots();

    // A3: 셰프 배치
    this._buildChef();

    // A3: 손님 배치
    this._buildCustomers();

    // 디버그 HUD (우측 상단 고정)
    this._buildDebugHUD();

    // Back 버튼 (좌상단)
    this._buildBackButton();

    // A4: 초기 깊이정렬 적용
    this._applyDepthSort();

    // 개발 환경 전용: 전역 노출 (Playwright 테스트용)
    if (typeof window !== 'undefined') {
      window.__tavernLayout = {
        occupySlot, vacateSlot, findFreeSlot, getSlotWorldPos,
        createSeatingState,
        TABLE_SET_ANCHORS,   // SC-1 테스트용 추가
      };
      window.__ChefState = ChefState;
      window.__CustomerState = CustomerState;
      window.__tavernAssetMode = ASSET_MODE; // Phase B-1 테스트용
    }
  }

  // ── update ──

  /**
   * 매 프레임 Y축 깊이정렬 갱신 (A4).
   */
  update() {
    this._applyDepthSort();
  }

  // ── A1: 영역 경계선 디버그 표시 ──

  /**
   * 각 영역을 색상 사각형으로 구분하여 시각화한다.
   * @private
   */
  _buildLayout() {
    const L = TAVERN_LAYOUT;
    const g = this.add.graphics();

    // HUD 영역 (적갈색)
    g.fillStyle(0x3a1a0a, 0.85);
    g.fillRect(0, 0, L.GAME_W, L.HUD_H);

    // 벽 영역 (회색)
    g.fillStyle(0x555555, 0.7);
    g.fillRect(0, L.ROOM_Y, L.GAME_W, L.WALL_H);

    // 주방 영역 (진한 갈색)
    g.fillStyle(0x3d2810, 0.5);
    g.fillRect(L.KITCHEN_X, L.ROOM_CONTENT_Y, L.KITCHEN_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);

    // 다이닝홀 영역 (밝은 갈색)
    g.fillStyle(0x5a3d20, 0.35);
    g.fillRect(L.DINING_X, L.ROOM_CONTENT_Y, L.DINING_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);

    // 컨트롤 바 영역 (진한 배경)
    g.fillStyle(0x15100a, 0.9);
    g.fillRect(0, L.ROOM_BOTTOM_Y, L.GAME_W, L.CTRL_H);

    // 영역 경계선 (디버그 오버레이)
    g.lineStyle(1, 0xffd166, 0.6);
    g.strokeRect(0, 0, L.GAME_W, L.HUD_H);                       // HUD
    g.strokeRect(0, L.ROOM_Y, L.GAME_W, L.WALL_H);               // 벽
    g.strokeRect(L.KITCHEN_X, L.ROOM_CONTENT_Y, L.KITCHEN_W,
      L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);                        // 주방
    g.strokeRect(L.DINING_X, L.ROOM_CONTENT_Y, L.DINING_W,
      L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);                        // 다이닝홀
    g.strokeRect(0, L.ROOM_BOTTOM_Y, L.GAME_W, L.CTRL_H);        // 컨트롤 바

    // 바닥 타일 반복 (다이닝홀 + 주방 영역)
    const floorKey = 'tavern_dummy_floor_wood_tile';
    if (this.textures.exists(floorKey)) {
      for (let ty = L.ROOM_CONTENT_Y; ty < L.ROOM_BOTTOM_Y; ty += 32) {
        for (let tx = 0; tx < L.GAME_W; tx += 32) {
          const tile = this.add.image(tx, ty, floorKey).setOrigin(0, 0);
          tile.setAlpha(0.3);
          tile.setDepth(0);
        }
      }
    }

    // 벽 타일 반복
    const wallKey = 'tavern_dummy_wall_horizontal';
    if (this.textures.exists(wallKey)) {
      for (let wx = 0; wx < L.GAME_W; wx += 64) {
        const wallTile = this.add.image(wx, L.ROOM_Y, wallKey).setOrigin(0, 0);
        wallTile.setAlpha(0.6);
        wallTile.setDepth(1);
      }
    }

    // 영역 경계 Graphics는 최하위 depth로 고정
    g.setDepth(0);
  }

  // ── A1: 가구 앵커 배치 (V12 4분면) ──

  /**
   * 가구(카운터, 4 quad 테이블 세트, 술통, 입구)를 앵커 좌표에 배치한다.
   * @private
   */
  _buildFurniture() {
    // ── 카운터 V12 (40x100) ──
    // setOrigin(0,0): 좌상단 기준
    // COUNTER_ANCHOR = { x: 100, y: 90 } -> left = 100 - 40/2 = 80
    this._placeImageOrRect(
      'tavern_dummy_counter_v12',
      COUNTER_ANCHOR.x - COUNTER_W / 2, COUNTER_ANCHOR.y,
      COUNTER_W, COUNTER_H, 0x8b6440,
    );

    // ── 술통 (주방 내 소품) ──
    for (const pos of BARREL_POSITIONS) {
      this._placeImageOrRect('tavern_dummy_barrel', pos.x, pos.y, 32, 40, 0x6b4420);
    }

    // ── 입구 V12 (32x40, 좌하단) ──
    // DOOR_ANCHOR = { x: 60, y: 480 } -> left = 60 - 16 = 44
    this._placeImageOrRect(
      'tavern_dummy_entrance_v12',
      DOOR_ANCHOR.x - 16, DOOR_ANCHOR.y,
      32, 40, 0x9b7850,
    );

    // ── 4 quad 루프 ──
    for (const quad of TABLE_SET_ANCHORS) {
      const qx = quad.quadLeft;
      const qy = quad.quadTop;

      // 세로 벤치-l (left=8, top=18, 14x76)
      this._placeImageOrRect(
        'tavern_dummy_bench_vertical_l_v12',
        qx + BENCH_CONFIG.BENCH_L_LEFT, qy + BENCH_CONFIG.BENCH_L_TOP,
        BENCH_CONFIG.BENCH_W, BENCH_CONFIG.BENCH_H, 0x7a5030,
      );

      // 세로 테이블-v (left=30, top=10, 44x72)
      this._placeImageOrRect(
        'tavern_dummy_table_vertical_v12',
        qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.TABLE_TOP,
        BENCH_CONFIG.TABLE_W, BENCH_CONFIG.TABLE_H, 0x5a3820,
      );

      // 세로 벤치-r (left=78, top=18, 14x76)
      this._placeImageOrRect(
        'tavern_dummy_bench_vertical_r_v12',
        qx + BENCH_CONFIG.BENCH_R_LEFT, qy + BENCH_CONFIG.BENCH_L_TOP,
        BENCH_CONFIG.BENCH_W, BENCH_CONFIG.BENCH_H, 0x7a5030,
      );
    }

    // ── 벽 장식 ──
    const decorPositions = [
      { x: 80, y: 30 },
      { x: 200, y: 30 },
      { x: 280, y: 30 },
    ];
    for (const pos of decorPositions) {
      this._placeImageOrRect(
        'tavern_dummy_wall_decor_painting', pos.x, pos.y, 32, 28, 0xaa8855,
      );
    }
  }

  /**
   * 이미지 텍스처가 있으면 이미지를, 없으면 대체 색상 사각형을 배치한다.
   * ASSET_MODE === 'real'일 때 실 에셋 키를 우선 시도하고, 없으면 더미 키 → 사각형 순으로 fallback.
   * @param {string} textureKey - Phaser 텍스처 키 (tavern_dummy_* 형식)
   * @param {number} x - x 좌표
   * @param {number} y - y 좌표
   * @param {number} w - 가로 크기
   * @param {number} h - 세로 크기
   * @param {number} fallbackColor - 대체 색상
   * @returns {Phaser.GameObjects.Image|Phaser.GameObjects.Rectangle}
   * @private
   */
  _placeImageOrRect(textureKey, x, y, w, h, fallbackColor) {
    // Phase B-1: 실 에셋 키 우선 시도
    if (ASSET_MODE === 'real') {
      const realKey = REAL_KEY_MAP[textureKey];
      if (realKey && this.textures.exists(realKey)) {
        return this.add.image(x, y, realKey).setOrigin(0, 0).setDisplaySize(w, h);
      }
    }
    // fallback: 더미 에셋
    if (this.textures.exists(textureKey)) {
      return this.add.image(x, y, textureKey).setOrigin(0, 0).setDisplaySize(w, h);
    }
    return this.add.rectangle(x + w / 2, y + h / 2, w, h, fallbackColor).setAlpha(0.8);
  }

  // ── A2: 벤치 슬롯 표시 (V12 좌/우) ──

  /**
   * BENCH_SLOTS 기반으로 각 슬롯 위치에 시각적 인디케이터를 표시한다.
   * @private
   */
  _buildBenchSlots() {
    const slotSize = 4;

    for (const set of this._seatingState) {
      // 좌측 벤치 슬롯 (facing-right)
      for (const slot of set.left) {
        const dot = this.add.rectangle(
          slot.worldX, slot.worldY, slotSize, slotSize, 0xffdd00,
        );
        dot.setDepth(slot.worldY);
        this.add.text(slot.worldX + 3, slot.worldY - 8, `L${slot.slotIdx}`, {
          fontSize: '8px', fontFamily: FONT_FAMILY, color: '#ffdd00',
        }).setOrigin(0, 0.5).setDepth(9000);
      }

      // 우측 벤치 슬롯 (facing-left)
      for (const slot of set.right) {
        const dot = this.add.rectangle(
          slot.worldX, slot.worldY, slotSize, slotSize, 0xff8800,
        );
        dot.setDepth(slot.worldY);
        this.add.text(slot.worldX + 3, slot.worldY - 8, `R${slot.slotIdx}`, {
          fontSize: '8px', fontFamily: FONT_FAMILY, color: '#ff8800',
        }).setOrigin(0, 0.5).setDepth(9000);
      }
    }
  }

  // ── A3: 셰프 배치 (V12: 2명) ──

  /**
   * 셰프를 카운터 idle 위치에 배치한다.
   * 셰프-0만 인터랙티브 (탭 상태 순환).
   * @private
   */
  _buildChef() {
    this._chefs = [];

    CHEF_IDLE_ANCHORS.forEach((anchor, idx) => {
      const chefState = ChefState.IDLE_SIDE;
      const color = CHEF_STATE_COLORS[chefState];

      const sprite = this.add.rectangle(anchor.x, anchor.y, 32, 48, color)
        .setOrigin(0.5, 1)
        .setDepth(anchor.y);

      // 셰프-0만 인터랙티브 (탭 상태 순환)
      if (idx === 0) {
        sprite.setInteractive();

        /** @type {string} 현재 셰프 상태 */
        this._chefState = chefState;

        /** @type {Phaser.GameObjects.Rectangle} */
        this._chefSprite = sprite;

        // 셰프 라벨
        this._chefLabel = this.add.text(anchor.x, anchor.y - 52, 'CHEF', {
          fontSize: '8px',
          fontFamily: FONT_FAMILY,
          color: '#4488ff',
          backgroundColor: '#00000088',
          padding: { x: 2, y: 1 },
        }).setOrigin(0.5, 1).setDepth(9000);

        // 상태 텍스트
        this._chefStateText = this.add.text(anchor.x, anchor.y + 4, chefState, {
          fontSize: '7px',
          fontFamily: FONT_FAMILY,
          color: '#ffffff',
          backgroundColor: '#00000088',
          padding: { x: 2, y: 1 },
        }).setOrigin(0.5, 0).setDepth(9000);

        // 탭 이벤트: 상태 순환
        sprite.on('pointerdown', () => {
          const nextIdx = (CHEF_CYCLE.indexOf(this._chefState) + 1) % CHEF_CYCLE.length;
          this._chefState = CHEF_CYCLE[nextIdx];
          sprite.fillColor = CHEF_STATE_COLORS[this._chefState];
          this._chefStateText.setText(this._chefState);
          this._updateDebugHUD();
        });
      }

      this._chefs.push({ sprite, state: chefState, anchor });
    });
  }

  // ── A3: 손님 배치 ──

  /**
   * 손님 4명을 초기 배치한다.
   * 짝수 인덱스 손님은 facing-down 순환, 홀수는 facing-up 순환.
   * 탭하면 상태 순환.
   * @private
   */
  _buildCustomers() {
    /** @type {Array<Object>} 손님 런타임 데이터 */
    this._customers = [];

    // 대기열 시작 위치 (입구 근처)
    const queueBaseX = 300;
    const queueBaseY = 110;
    const queueSpacing = 36;

    for (let i = 0; i < 4; i++) {
      const isDown = i % 2 === 0;  // 짝수: facing-down, 홀수: facing-up
      const cycle = isDown ? CUSTOMER_CYCLE_DOWN : CUSTOMER_CYCLE_UP;
      const initState = CustomerState.QUEUE;
      const color = CUSTOMER_STATE_COLORS[initState];

      const x = queueBaseX - i * queueSpacing;
      const y = queueBaseY + i * 4;  // 약간씩 y를 달리하여 depth 차이 보여줌

      const sprite = this.add.rectangle(x, y, 32, 48, color)
        .setOrigin(0.5, 1)
        .setInteractive()
        .setDepth(y);

      // 상태 라벨
      const label = this.add.text(x, y + 4, initState, {
        fontSize: '7px',
        fontFamily: FONT_FAMILY,
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 2, y: 1 },
      }).setOrigin(0.5, 0).setDepth(9000);

      const customerData = {
        sprite,
        label,
        state: initState,
        cycle,
        cycleIdx: 1,  // QUEUE는 cycle[1]
        slotRef: null,
        id: `customer-${i}`,
      };

      // 탭 이벤트: 상태 순환
      sprite.on('pointerdown', () => {
        this._cycleCustomerState(customerData);
      });

      this._customers.push(customerData);
    }
  }

  /**
   * 손님 상태를 다음으로 순환시킨다.
   * 좌석 배정이 필요한 상태(SIT_DOWN/SIT_UP)에서는 빈 슬롯에 자동 배정.
   * @param {Object} cust - 손님 런타임 데이터
   * @private
   */
  _cycleCustomerState(cust) {
    const nextIdx = (cust.cycleIdx + 1) % cust.cycle.length;
    const nextState = cust.cycle[nextIdx];

    // LEAVE 상태 후 다시 ENTER로 돌아가면 슬롯 해제
    if (cust.state === CustomerState.LEAVE || nextState === CustomerState.ENTER) {
      if (cust.slotRef) {
        vacateSlot(cust.slotRef.tableSetIdx, cust.slotRef.side, cust.slotRef.slotIdx);
        cust.slotRef = null;
      }
    }

    // SIT 상태 진입 시 슬롯 배정
    if (nextState === CustomerState.SIT_DOWN || nextState === CustomerState.SIT_UP) {
      const free = findFreeSlot();
      if (free) {
        occupySlot(free.tableSetIdx, free.side, free.slotIdx, cust.id);
        cust.slotRef = free;
        const pos = getSlotWorldPos(free.tableSetIdx, free.side, free.slotIdx);
        if (pos) {
          cust.sprite.x = pos.x;
          cust.sprite.y = pos.y;
          cust.label.x = pos.x;
          cust.label.y = pos.y + 4;
        }
      }
    }

    // LEAVE 시 입구쪽으로 이동
    if (nextState === CustomerState.LEAVE) {
      if (cust.slotRef) {
        vacateSlot(cust.slotRef.tableSetIdx, cust.slotRef.side, cust.slotRef.slotIdx);
        cust.slotRef = null;
      }
      cust.sprite.x = DOOR_ANCHOR.x;
      cust.sprite.y = DOOR_ANCHOR.y + 60;
      cust.label.x = DOOR_ANCHOR.x;
      cust.label.y = DOOR_ANCHOR.y + 64;
    }

    // ENTER 시 입구 위치로 복귀
    if (nextState === CustomerState.ENTER) {
      cust.sprite.x = DOOR_ANCHOR.x - 20;
      cust.sprite.y = 110;
      cust.label.x = DOOR_ANCHOR.x - 20;
      cust.label.y = 114;
    }

    cust.state = nextState;
    cust.cycleIdx = nextIdx;
    cust.sprite.fillColor = CUSTOMER_STATE_COLORS[nextState];
    cust.label.setText(nextState);

    this._updateDebugHUD();
  }

  // ── 디버그 HUD ──

  /**
   * 디버그 정보를 우측 상단에 고정 표시한다.
   * @private
   */
  _buildDebugHUD() {
    const occupiedCount = this._getOccupiedCount();
    const totalSlots = this._seatingState.reduce(
      (acc, set) => acc + set.left.length + set.right.length, 0,
    );

    /** @type {Phaser.GameObjects.Text} */
    this._debugText = this.add.text(GAME_WIDTH - 4, 4,
      this._debugString(occupiedCount, totalSlots), {
        fontSize: '8px',
        fontFamily: FONT_FAMILY,
        color: '#ffd166',
        backgroundColor: '#00000099',
        padding: { x: 4, y: 2 },
        align: 'right',
      },
    ).setOrigin(1, 0).setDepth(9999);
  }

  /**
   * 디버그 HUD 텍스트를 갱신한다.
   * @private
   */
  _updateDebugHUD() {
    if (!this._debugText) return;
    const occupied = this._getOccupiedCount();
    const total = this._seatingState.reduce(
      (acc, set) => acc + set.left.length + set.right.length, 0,
    );
    this._debugText.setText(this._debugString(occupied, total));
  }

  /**
   * 디버그 문자열을 생성한다.
   * @param {number} occupied - 점유 슬롯 수
   * @param {number} total - 전체 슬롯 수
   * @returns {string}
   * @private
   */
  _debugString(occupied, total) {
    return [
      'TAVERN DEBUG MODE',
      `Seats: ${occupied}/${total}`,
      `Chef: ${this._chefState}`,
      'TAP CHEF / CUSTOMER',
      'to cycle states',
    ].join('\n');
  }

  /**
   * 현재 점유된 슬롯 수를 반환한다.
   * @returns {number}
   * @private
   */
  _getOccupiedCount() {
    let count = 0;
    for (const set of this._seatingState) {
      for (const slot of set.left) {
        if (slot.occupiedBy !== null) count++;
      }
      for (const slot of set.right) {
        if (slot.occupiedBy !== null) count++;
      }
    }
    return count;
  }

  // ── Back 버튼 ──

  /**
   * 좌상단 Back 버튼을 배치한다. MenuScene으로 복귀.
   * @private
   */
  _buildBackButton() {
    const btn = this.add.text(4, 4, '< BACK', {
      fontSize: '10px',
      fontFamily: FONT_FAMILY,
      color: '#ffffff',
      backgroundColor: '#33333399',
      padding: { x: 4, y: 2 },
    }).setOrigin(0, 0).setDepth(9999).setInteractive();

    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  // ── A4: Y축 깊이정렬 ──

  /**
   * 씬 내 모든 게임 오브젝트에 depth = y 적용.
   * 고정 UI(HUD, 디버그)는 depth >= 9000으로 상단 고정.
   * @private
   */
  _applyDepthSort() {
    const children = this.children.list;
    for (let i = 0; i < children.length; i++) {
      const obj = children[i];
      // depth가 9000 이상이면 고정 UI이므로 건드리지 않음
      if (obj.depth >= 9000) continue;
      // Graphics 객체는 y가 0이므로 건너뛰기 (배경 레이어)
      if (obj.type === 'Graphics') continue;
      // y 기반 depth 설정
      obj.setDepth(obj.y);
    }
  }
}
