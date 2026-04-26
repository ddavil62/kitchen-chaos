/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 -- Phase H.
 * A1~A4 통합 메인 씬: 레이아웃 영역 디버그, 가구 배치, 벤치 슬롯, 상태 전환 시연, Y축 깊이정렬.
 * V12~Phase D: 2분면(quad) 세로 테이블 배치.
 * Phase E: 착석 레이아웃 재설계 — y축 depth 착석 표현, seated_south 텍스처, 테이블 depth 고정.
 * Phase F: 가로 테이블 양면 착석 — front(south) + back(north) 12석, 가로 가구 3종, seated_north 10종.
 * Phase G: 현대 식당 2열x3행 6테이블 24석 — v13 가구(테이블 100x40, 의자 100x20), QUAD_W=116.
 * B-3: 손님 9종(seated R/L) + 셰프 5명(idle_side) 에셋 확장, DEMO_CUSTOMER_TYPES 4종 분배.
 * B-4: 손님 10종 walk_l/walk_r 스프라이트시트(4프레임 64x24) 20장 + 애니메이션 등록 + 데모 W/A 키.
 * B-5-1: 셰프 5명 walk_l/walk_r 스프라이트시트(4프레임 64x24) 10장 + 애니메이션 등록 + 데모 C/V 키.
 * B-6: 캐릭터 15명 size=48 재발주 + 32x48 후처리 + frameWidth/frameHeight 갱신 (16x24 -> 32x48).
 * Phase D: 손님 10종 64px 재처리 + 2 quad 1열 레이아웃 전환 + BENCH_CONFIG 전면 갱신.
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
  BENCH_LEFT_OFFSET_X, BENCH_RIGHT_OFFSET_X,  // 레거시 보존
  SEAT_CENTER_OFFSET_X,  // Phase E 신규
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
  'tavern_dummy_chef2_idle_side':      'tavern_chef_rin_idle_side',  // Phase B-2: 두 번째 셰프 린
  // Phase B-3: 데모 4종 손님 (vip/gourmet/rushed) — normal은 기존 재활용
  'tavern_dummy_customer_vip_seated_down':     'tavern_customer_vip_seated_right',
  'tavern_dummy_customer_vip_seated_up':       'tavern_customer_vip_seated_left',
  'tavern_dummy_customer_gourmet_seated_down': 'tavern_customer_gourmet_seated_right',
  'tavern_dummy_customer_gourmet_seated_up':   'tavern_customer_gourmet_seated_left',
  'tavern_dummy_customer_rushed_seated_down':  'tavern_customer_rushed_seated_right',
  'tavern_dummy_customer_rushed_seated_up':    'tavern_customer_rushed_seated_left',
  // Phase D 예정: group/critic/regular/student/traveler/business 매핑 + 셰프 5명 매핑
  // Phase E: south-facing seated (depth 착석 표현)
  'tavern_dummy_customer_seated_south':             'tavern_customer_normal_seated_south',
  'tavern_dummy_customer_vip_seated_south':         'tavern_customer_vip_seated_south',
  'tavern_dummy_customer_gourmet_seated_south':     'tavern_customer_gourmet_seated_south',
  'tavern_dummy_customer_rushed_seated_south':      'tavern_customer_rushed_seated_south',
  'tavern_dummy_customer_group_seated_south':       'tavern_customer_group_seated_south',
  'tavern_dummy_customer_critic_seated_south':      'tavern_customer_critic_seated_south',
  'tavern_dummy_customer_regular_seated_south':     'tavern_customer_regular_seated_south',
  'tavern_dummy_customer_student_seated_south':     'tavern_customer_student_seated_south',
  'tavern_dummy_customer_traveler_seated_south':    'tavern_customer_traveler_seated_south',
  'tavern_dummy_customer_business_seated_south':    'tavern_customer_business_seated_south',
  // Phase F: north-facing seated (back 슬롯 착석)
  'tavern_dummy_customer_seated_north':             'tavern_customer_normal_seated_north',
  'tavern_dummy_customer_vip_seated_north':         'tavern_customer_vip_seated_north',
  'tavern_dummy_customer_gourmet_seated_north':     'tavern_customer_gourmet_seated_north',
  'tavern_dummy_customer_rushed_seated_north':      'tavern_customer_rushed_seated_north',
  'tavern_dummy_customer_group_seated_north':       'tavern_customer_group_seated_north',
  'tavern_dummy_customer_critic_seated_north':      'tavern_customer_critic_seated_north',
  'tavern_dummy_customer_regular_seated_north':     'tavern_customer_regular_seated_north',
  'tavern_dummy_customer_student_seated_north':     'tavern_customer_student_seated_north',
  'tavern_dummy_customer_traveler_seated_north':    'tavern_customer_traveler_seated_north',
  'tavern_dummy_customer_business_seated_north':    'tavern_customer_business_seated_north',
  // Phase G: v13 현대 가구
  'tavern_dummy_table_4p_v13':     'tavern_table_4p_v13',
  'tavern_dummy_chair_back_v13':   'tavern_chair_back_v13',
  'tavern_dummy_chair_front_v13':  'tavern_chair_front_v13',
  // Phase H: v14 배경 타일
  'tavern_dummy_floor_wood_tile_v14':   'tavern_floor_wood_tile_v14',
  'tavern_dummy_wall_horizontal_v14':   'tavern_wall_horizontal_v14',
});

// V12 술통 위치 (카운터 좌측 하단 주방 내)
const BARREL_POSITIONS = [
  { x: 20, y: 160 },
  { x: 50, y: 160 },
];

// ── B-3 데모: 4명 손님 슬롯에 4종 타입 1:1 배치 ──
// Phase D에서 랜덤 spawn 및 type별 게임 로직 연동으로 교체 예정
const DEMO_CUSTOMER_TYPES = ['normal', 'vip', 'gourmet', 'rushed'];

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
      'floor_wood_tile_v14', 'wall_horizontal_v14',
      // V12 신규
      'counter_v12',           // 40x100px
      'table_vertical_v12',    // 64x200px (Phase D)
      'bench_vertical_l_v12',  // 80x200px (Phase D, facing-right)
      'bench_vertical_r_v12',  // 80x200px (Phase D, facing-left)
      'entrance_v12',          // 32x40px
      // Phase G: v13 현대 가구 더미
      'table_4p_v13',           // 100x40px
      'chair_back_v13',         // 100x20px
      'chair_front_v13',        // 100x20px
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
        'table_vertical_v12',    // 64x200px (Phase D 업스케일)
        'bench_vertical_l_v12',  // 80x200px (Phase D 업스케일)
        'bench_vertical_r_v12',  // 80x200px (Phase D 업스케일)
        'entrance_v12',          // 32x40px
        // 캐릭터 4종 (B-2 기존)
        'customer_normal_seated_right',  // 64x64px (Phase D 재처리)
        'customer_normal_seated_left',   // 64x64px (Phase D 재처리)
        'chef_mimi_idle_side',           // 16x24px (B-6 미포함, 레거시)
        'chef_rin_idle_side',            // 16x24px (Phase B-2, B-6 미포함)
        // B-3 신규: 손님 9종 seated_right (9개)
        'customer_vip_seated_right',
        'customer_gourmet_seated_right',
        'customer_rushed_seated_right',
        'customer_group_seated_right',
        'customer_critic_seated_right',
        'customer_regular_seated_right',
        'customer_student_seated_right',
        'customer_traveler_seated_right',
        'customer_business_seated_right',
        // B-3 신규: 손님 9종 seated_left (9개)
        'customer_vip_seated_left',
        'customer_gourmet_seated_left',
        'customer_rushed_seated_left',
        'customer_group_seated_left',
        'customer_critic_seated_left',
        'customer_regular_seated_left',
        'customer_student_seated_left',
        'customer_traveler_seated_left',
        'customer_business_seated_left',
        // Phase E: south-facing seated (depth 착석 표현)
        'customer_normal_seated_south',
        'customer_vip_seated_south',
        'customer_gourmet_seated_south',
        'customer_rushed_seated_south',
        'customer_group_seated_south',
        'customer_critic_seated_south',
        'customer_regular_seated_south',
        'customer_student_seated_south',
        'customer_traveler_seated_south',
        'customer_business_seated_south',
        // Phase F: north-facing seated (back 슬롯 착석)
        'customer_normal_seated_north',
        'customer_vip_seated_north',
        'customer_gourmet_seated_north',
        'customer_rushed_seated_north',
        'customer_group_seated_north',
        'customer_critic_seated_north',
        'customer_regular_seated_north',
        'customer_student_seated_north',
        'customer_traveler_seated_north',
        'customer_business_seated_north',
        // Phase G: v13 현대 가구
        'table_4p_v13',
        'chair_back_v13',
        'chair_front_v13',
        // Phase H: v14 배경 타일
        'floor_wood_tile_v14',
        'wall_horizontal_v14',
        // B-3 신규: 셰프 5명 idle_side (5개)
        'chef_mage_idle_side',
        'chef_yuki_idle_side',
        'chef_lao_idle_side',
        'chef_andre_idle_side',
        'chef_arjun_idle_side',
      ];
      for (const name of realAssets) {
        this.load.image(`tavern_${name}`, `${realPath}${name}.png`);
      }

      // ── Phase D: 손님 10종 walk 스프라이트시트 (64px x 4프레임 = 256x64) ──
      const walkTypes = [
        'normal', 'vip', 'gourmet', 'rushed', 'group',
        'critic', 'regular', 'student', 'traveler', 'business',
      ];
      for (const t of walkTypes) {
        this.load.spritesheet(
          `tavern_customer_${t}_walk_r`,
          `${realPath}customer_${t}_walk_r.png`,
          { frameWidth: 64, frameHeight: 64 },
        );
        this.load.spritesheet(
          `tavern_customer_${t}_walk_l`,
          `${realPath}customer_${t}_walk_l.png`,
          { frameWidth: 64, frameHeight: 64 },
        );
      }

      // ── B-5-1/B-6: 셰프 5명 walk 스프라이트시트 (32px x 4프레임 = 128x48, Phase D 스코프 외) ──
      const chefWalkTypes = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      chefWalkTypes.forEach(name => {
        ['r', 'l'].forEach(side => {
          this.load.spritesheet(
            `tavern_chef_${name}_walk_${side}`,
            `${realPath}chef_${name}_walk_${side}.png`,
            { frameWidth: 32, frameHeight: 48 },
          );
        });
      });
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

    // ── B-4: walk 애니메이션 등록 (ASSET_MODE='real'일 때만) ──
    // 10종 × 2방향 = 20개 애니메이션, 4프레임 × 8fps, 무한 반복.
    if (ASSET_MODE === 'real') {
      const walkTypes = [
        'normal', 'vip', 'gourmet', 'rushed', 'group',
        'critic', 'regular', 'student', 'traveler', 'business',
      ];
      for (const t of walkTypes) {
        // walk_r (east, 우향)
        const keyR = `tavern_customer_${t}_walk_r`;
        if (this.textures.exists(keyR) && !this.anims.exists(`customer_${t}_walk_r`)) {
          this.anims.create({
            key: `customer_${t}_walk_r`,
            frames: this.anims.generateFrameNumbers(keyR, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1,
          });
        }
        // walk_l (west, 좌향)
        const keyL = `tavern_customer_${t}_walk_l`;
        if (this.textures.exists(keyL) && !this.anims.exists(`customer_${t}_walk_l`)) {
          this.anims.create({
            key: `customer_${t}_walk_l`,
            frames: this.anims.generateFrameNumbers(keyL, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1,
          });
        }
      }

      // ── B-5-1: 셰프 5명 walk 애니메이션 등록 (4프레임 x 8fps, 무한 반복) ──
      const chefWalkTypes = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      chefWalkTypes.forEach(name => {
        ['r', 'l'].forEach(side => {
          const chefKey = `tavern_chef_${name}_walk_${side}`;
          if (this.textures.exists(chefKey) && !this.anims.exists(`chef_${name}_walk_${side}`)) {
            this.anims.create({
              key: `chef_${name}_walk_${side}`,
              frames: this.anims.generateFrameNumbers(chefKey, { start: 0, end: 3 }),
              frameRate: 8,
              repeat: -1,
            });
          }
        });
      });
    }

    // ── B-4 데모: W/A 키 → normal 손님 walk 애니메이션 재생 ──
    // Phase D에서 실제 이동 Tween 연결로 교체 예정.
    if (ASSET_MODE === 'real') {
      this.input.keyboard.on('keydown-W', () => {
        const cust = this._customers[0];
        if (!cust || !cust.sprite) return;
        if (cust.sprite.anims) {
          cust.sprite.play('customer_normal_walk_r');
        }
      });

      this.input.keyboard.on('keydown-A', () => {
        const cust = this._customers[0];
        if (!cust || !cust.sprite) return;
        if (cust.sprite.anims) {
          cust.sprite.play('customer_normal_walk_l');
        }
      });

      this.input.keyboard.on('keydown-S', () => {
        const cust = this._customers[0];
        if (!cust || !cust.sprite) return;
        // Phase F: slotRef에 따라 seated_south/seated_north 분기
        if (cust.sprite.anims) cust.sprite.anims.stop();
        const direction = (cust.slotRef && cust.slotRef.side === 'back') ? 'north' : 'south';
        const sitKey = `tavern_customer_normal_seated_${direction}`;
        if (this.textures.exists(sitKey)) {
          cust.sprite.setTexture(sitKey);
        }
      });

      // ── B-5-1 데모: C/V 키 → mage 셰프 walk 애니메이션 재생 ──
      // Phase D에서 실제 이동 Tween 연결로 교체 예정.
      this.input.keyboard.on('keydown-C', () => {
        const chef = this._chefs[0]; // index=0 = rin (B-2: idx=0 린)
        if (!chef || !chef.sprite) return;
        if (chef.sprite.anims) {
          chef.sprite.play('chef_mage_walk_r');
        }
      });

      this.input.keyboard.on('keydown-V', () => {
        const chef = this._chefs[0];
        if (!chef || !chef.sprite) return;
        if (chef.sprite.anims) {
          chef.sprite.play('chef_mage_walk_l');
        }
      });
    }

    // A4: 초기 깊이정렬 적용
    this._applyDepthSort();

    // 개발 환경 전용: 전역 노출 (Playwright 테스트용)
    if (typeof window !== 'undefined') {
      window.__tavernLayout = {
        occupySlot, vacateSlot, findFreeSlot, getSlotWorldPos,
        createSeatingState,
        TABLE_SET_ANCHORS,   // SC-1 테스트용 추가
      };
      window.__tavernBenchConfig = BENCH_CONFIG;  // Phase D: Playwright 테스트용
      window.__ChefState = ChefState;
      window.__CustomerState = CustomerState;
      window.__tavernAssetMode = ASSET_MODE; // Phase B-1 테스트용

      // Phase B-3: 스프라이트 타입 진단 노출 (customerType 포함)
      window.__tavernSpriteTypes = {
        chefs: this._chefs.map(c => ({ type: c.sprite.type, textureKey: c.sprite.texture?.key || null })),
        customers: this._customers.map(c => ({
          type: c.sprite.type,
          textureKey: c.sprite.texture?.key || null,
          customerType: c.customerType || 'normal',
        })),
      };

      // Phase B-4: walk 애니메이션 등록 키 목록 노출 (Playwright 테스트용)
      const walkAnimTypes = [
        'normal', 'vip', 'gourmet', 'rushed', 'group',
        'critic', 'regular', 'student', 'traveler', 'business',
      ];
      window.__tavernWalkAnims = {
        registered: walkAnimTypes.flatMap(t => [
          `customer_${t}_walk_l`, `customer_${t}_walk_r`,
        ]),
        exists: walkAnimTypes.reduce((acc, t) => {
          acc[t] = {
            walk_l: this.anims.exists(`customer_${t}_walk_l`),
            walk_r: this.anims.exists(`customer_${t}_walk_r`),
          };
          return acc;
        }, {}),
      };

      // Phase B-5-1: 셰프 walk 애니메이션 등록 키 목록 노출 (Playwright 테스트용)
      const chefAnimTypes = ['mage', 'yuki', 'lao', 'andre', 'arjun'];
      window.__tavernChefAnims = chefAnimTypes.flatMap(n => [`chef_${n}_walk_r`, `chef_${n}_walk_l`]);
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

    // HUD 영역 (다크차콜 — Phase H 현대 레스토랑)
    g.fillStyle(0x2c2c2c, 0.90);
    g.fillRect(0, 0, L.GAME_W, L.HUD_H);

    // 벽 영역 (밝은 아이보리 — Phase H 현대 레스토랑)
    g.fillStyle(0xe8dcc8, 0.90);
    g.fillRect(0, L.ROOM_Y, L.GAME_W, L.WALL_H);

    // 주방 영역 (연한 스틸그레이 — Phase H 현대 레스토랑)
    g.fillStyle(0xb8c5c8, 0.40);
    g.fillRect(L.KITCHEN_X, L.ROOM_CONTENT_Y, L.KITCHEN_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);

    // 다이닝홀 영역 (크림/웜화이트 — Phase H 현대 레스토랑)
    g.fillStyle(0xfff8f0, 0.50);
    g.fillRect(L.DINING_X, L.ROOM_CONTENT_Y, L.DINING_W, L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);

    // 컨트롤 바 영역 (다크슬레이트 — Phase H 현대 레스토랑)
    g.fillStyle(0x37474f, 0.92);
    g.fillRect(0, L.ROOM_BOTTOM_Y, L.GAME_W, L.CTRL_H);

    // 영역 경계선 (디버그 오버레이 — Phase H: 중립 회색)
    g.lineStyle(1, 0xaaaaaa, 0.4);
    g.strokeRect(0, 0, L.GAME_W, L.HUD_H);                       // HUD
    g.strokeRect(0, L.ROOM_Y, L.GAME_W, L.WALL_H);               // 벽
    g.strokeRect(L.KITCHEN_X, L.ROOM_CONTENT_Y, L.KITCHEN_W,
      L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);                        // 주방
    g.strokeRect(L.DINING_X, L.ROOM_CONTENT_Y, L.DINING_W,
      L.ROOM_BOTTOM_Y - L.ROOM_CONTENT_Y);                        // 다이닝홀
    g.strokeRect(0, L.ROOM_BOTTOM_Y, L.GAME_W, L.CTRL_H);        // 컨트롤 바

    // 바닥 타일 반복 (다이닝홀 + 주방 영역) — Phase H: v14 현대 원목 마루
    const floorKey = this._resolveTextureKey('tavern_dummy_floor_wood_tile_v14');
    if (this.textures.exists(floorKey)) {
      for (let ty = L.ROOM_CONTENT_Y; ty < L.ROOM_BOTTOM_Y; ty += 32) {
        for (let tx = 0; tx < L.GAME_W; tx += 32) {
          const tile = this.add.image(tx, ty, floorKey).setOrigin(0, 0);
          tile.setAlpha(0.55);
          tile.setDepth(0);
        }
      }
    }

    // 벽 타일 반복 — Phase H: v14 밝은 아이보리 벽
    const wallKey = this._resolveTextureKey('tavern_dummy_wall_horizontal_v14');
    if (this.textures.exists(wallKey)) {
      for (let wx = 0; wx < L.GAME_W; wx += 64) {
        const wallTile = this.add.image(wx, L.ROOM_Y, wallKey).setOrigin(0, 0);
        wallTile.setAlpha(0.85);
        wallTile.setDepth(1);
      }
    }

    // 영역 경계 Graphics는 최하위 depth로 고정
    g.setDepth(0);
  }

  // ── A1: 가구 앵커 배치 (Phase G: 2열x3행 6테이블) ──

  /**
   * 가구(카운터, 6 quad v13 테이블+의자 세트, 술통, 입구)를 앵커 좌표에 배치한다.
   * Phase G: v12 가로 벤치/테이블 → v13 현대 의자/테이블 전환, 2열x3행 배치.
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

    // ── 6 quad 루프 (Phase G: 2열x3행 현대 테이블+의자 배치) ──
    for (const quad of TABLE_SET_ANCHORS) {
      const qx = quad.quadLeft;
      const qy = quad.quadTop;

      // 상단 의자 (chair_back, far side, 100x20)
      this._placeImageOrRect(
        'tavern_dummy_chair_back_v13',
        qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.BENCH_TOP_TOP,
        BENCH_CONFIG.BENCH_W, BENCH_CONFIG.BENCH_H, 0x7a5030,
      );

      // 테이블 (100x40)
      // Phase G: depth = quadTop + TABLE_DEPTH_OFFSET(80) (front 손님 하체 가림)
      const tableSprite = this._placeImageOrRect(
        'tavern_dummy_table_4p_v13',
        qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.TABLE_TOP,
        BENCH_CONFIG.TABLE_W, BENCH_CONFIG.TABLE_H, 0x5a3820,
      );
      // 테이블 depth 고정 -- _applyDepthSort에서 재계산되지 않도록 _fixedDepth flag 설정
      tableSprite.setDepth(qy + BENCH_CONFIG.TABLE_DEPTH_OFFSET);
      tableSprite._fixedDepth = true;  // Phase E/G: depth 고정 마커

      // 하단 의자 (chair_front, near side, 100x20)
      // back 손님 depth(BACK_SLOT_DY=104)보다 +1로 고정 → 손님 하체 가림
      const chairFrontSprite = this._placeImageOrRect(
        'tavern_dummy_chair_front_v13',
        qx + BENCH_CONFIG.TABLE_LEFT, qy + BENCH_CONFIG.BENCH_BOT_TOP,
        BENCH_CONFIG.BENCH_W, BENCH_CONFIG.BENCH_H, 0x7a5030,
      );
      chairFrontSprite.setDepth(qy + BENCH_CONFIG.BACK_SLOT_DY + 1);
      chairFrontSprite._fixedDepth = true;
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
   * 더미 텍스처 키를 실 에셋 키로 해석한다. ASSET_MODE=real이면 REAL_KEY_MAP을 통해 실 에셋 키를 반환.
   * 타일 반복 루프 등 _placeImageOrRect를 사용하지 않는 곳에서 키 해석용.
   * @param {string} dummyKey - 더미 텍스처 키 (tavern_dummy_* 형식)
   * @returns {string} 사용할 텍스처 키
   * @private
   */
  _resolveTextureKey(dummyKey) {
    if (ASSET_MODE === 'real') {
      const realKey = REAL_KEY_MAP[dummyKey];
      if (realKey && this.textures.exists(realKey)) return realKey;
    }
    return dummyKey;
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

  // ── A2: 벤치 슬롯 표시 (Phase F: front + back 양면) ──

  /**
   * BENCH_SLOTS 기반으로 각 슬롯 위치에 시각적 인디케이터를 표시한다.
   * Phase F: front(노란색) + back(청록색) 양면 슬롯 표시.
   * @private
   */
  _buildBenchSlots() {
    const slotSize = 4;

    for (const set of this._seatingState) {
      // Phase F: 테이블 정면 슬롯 (facing-south, 노란색)
      for (const slot of set.front) {
        const dot = this.add.rectangle(
          slot.worldX, slot.worldY, slotSize, slotSize, 0xffdd00,
        );
        dot.setDepth(slot.worldY);
        this.add.text(slot.worldX + 3, slot.worldY - 8, `F${slot.slotIdx}`, {
          fontSize: '8px', fontFamily: FONT_FAMILY, color: '#ffdd00',
        }).setOrigin(0, 0.5).setDepth(9000);
      }
      // Phase F: 테이블 후면 슬롯 (facing-north, 청록색)
      if (set.back) {
        for (const slot of set.back) {
          const dot = this.add.rectangle(
            slot.worldX, slot.worldY, slotSize, slotSize, 0x00ffdd,
          );
          dot.setDepth(slot.worldY);
          this.add.text(slot.worldX + 3, slot.worldY - 8, `B${slot.slotIdx}`, {
            fontSize: '8px', fontFamily: FONT_FAMILY, color: '#00ffdd',
          }).setOrigin(0, 0.5).setDepth(9000);
        }
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

      // Phase B-2: idx=0(린), idx=1(미미) — _placeImageOrRect 경로로 전환
      const dummyKey = idx === 0
        ? 'tavern_dummy_chef2_idle_side'
        : 'tavern_dummy_chef_idle_side';
      // _placeImageOrRect는 origin(0,0) 기준이므로 좌상단 좌표 계산 후 setOrigin(0.5,1) 재설정
      const sprite = this._placeImageOrRect(
        dummyKey, anchor.x - 16, anchor.y - 48, 32, 48, color,
      ).setOrigin(0.5, 1).setDepth(anchor.y);

      // 셰프-0만 인터랙티브 (탭 상태 순환)
      if (idx === 0) {
        sprite.setInteractive();

        /** @type {string} 현재 셰프 상태 */
        this._chefState = chefState;

        /** @type {Phaser.GameObjects.Image|Phaser.GameObjects.Rectangle} */
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

        // 탭 이벤트: 상태 순환 (fillColor는 Rectangle 전용 — Image 타입 가드)
        sprite.on('pointerdown', () => {
          const nextIdx = (CHEF_CYCLE.indexOf(this._chefState) + 1) % CHEF_CYCLE.length;
          this._chefState = CHEF_CYCLE[nextIdx];
          if (sprite.type === 'Rectangle') {
            sprite.fillColor = CHEF_STATE_COLORS[this._chefState];
          }
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
   * B-3: DEMO_CUSTOMER_TYPES에 따라 각 슬롯에 다른 타입을 1:1 배치.
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

      // B-3: 슬롯별 손님 타입 결정
      const customerType = DEMO_CUSTOMER_TYPES[i] || 'normal';

      const x = queueBaseX - i * queueSpacing;
      const y = queueBaseY + i * 4;  // 약간씩 y를 달리하여 depth 차이 보여줌

      // B-3: customerType별 더미 키 분기 (REAL_KEY_MAP으로 실 에셋 변환)
      // Phase D: 손님 64x64px 표시
      const dummyKey = customerType === 'normal'
        ? 'tavern_dummy_customer_seated_down'
        : `tavern_dummy_customer_${customerType}_seated_down`;
      const sprite = this._placeImageOrRect(
        dummyKey, x - 32, y - 64, 64, 64, color,
      ).setOrigin(0.5, 1).setInteractive().setDepth(y);

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
        customerType,  // B-3: 손님 타입 저장
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

    // SIT 상태 진입 시 슬롯 배정 + 텍스처 교체 (Phase B-2)
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
      // Phase F: back 슬롯이면 seated_north, front 슬롯이면 seated_south 텍스처 적용
      if (ASSET_MODE === 'real') {
        const typeKey = cust.customerType || 'normal';
        const direction = (cust.slotRef && cust.slotRef.side === 'back') ? 'north' : 'south';
        const sitKey = `tavern_customer_${typeKey}_seated_${direction}`;
        if (this.textures.exists(sitKey)) {
          // walk 애니메이션 정지 후 seated 텍스처 교체
          if (cust.sprite.anims) cust.sprite.anims.stop();
          cust.sprite.setTexture(sitKey);
        }
      }
    }

    // LEAVE 시 입구쪽으로 이동 + walk_l 애니메이션 재시작
    if (nextState === CustomerState.LEAVE) {
      if (cust.slotRef) {
        vacateSlot(cust.slotRef.tableSetIdx, cust.slotRef.side, cust.slotRef.slotIdx);
        cust.slotRef = null;
      }
      cust.sprite.x = DOOR_ANCHOR.x;
      cust.sprite.y = DOOR_ANCHOR.y + 60;
      cust.label.x = DOOR_ANCHOR.x;
      cust.label.y = DOOR_ANCHOR.y + 64;
      // Phase D: seated에서 walk_l로 복귀
      const leaveAnimKey = `customer_${cust.customerType || 'normal'}_walk_l`;
      if (cust.sprite.anims && this.anims.exists(leaveAnimKey)) {
        cust.sprite.play(leaveAnimKey, true);
      }
    }

    // ENTER 시 입구 위치로 복귀 + walk_r 애니메이션 재시작
    if (nextState === CustomerState.ENTER) {
      cust.sprite.x = DOOR_ANCHOR.x - 20;
      cust.sprite.y = 110;
      cust.label.x = DOOR_ANCHOR.x - 20;
      cust.label.y = 114;
      // Phase D: walk_r로 재입장 준비
      const enterAnimKey = `customer_${cust.customerType || 'normal'}_walk_r`;
      if (cust.sprite.anims && this.anims.exists(enterAnimKey)) {
        cust.sprite.play(enterAnimKey, true);
      }
    }

    cust.state = nextState;
    cust.cycleIdx = nextIdx;
    // Phase B-2: fillColor는 Rectangle 전용 — Image 타입 가드
    if (cust.sprite.type === 'Rectangle') {
      cust.sprite.fillColor = CUSTOMER_STATE_COLORS[nextState];
    }
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
      (acc, set) => acc + set.front.length + (set.back ? set.back.length : 0), 0,
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
      (acc, set) => acc + set.front.length + (set.back ? set.back.length : 0), 0,
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
   * 현재 점유된 슬롯 수를 반환한다. Phase F: front + back 합산.
   * @returns {number}
   * @private
   */
  _getOccupiedCount() {
    return this._seatingState.reduce(
      (acc, set) => acc
        + set.front.filter(s => s.occupiedBy !== null).length
        + (set.back ? set.back.filter(s => s.occupiedBy !== null).length : 0),
      0,
    );
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
      // Phase E: 테이블 depth 고정 마커 — depth 재계산 제외
      if (obj._fixedDepth) continue;
      // y 기반 depth 설정
      obj.setDepth(obj.y);
    }
  }
}
