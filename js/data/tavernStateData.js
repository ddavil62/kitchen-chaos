/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 상태머신 상수 정의.
 * Phase A3: 셰프 7상태, 손님 7상태의 열거형 키, 상태 전환 유효성 맵,
 * 더미 PIL 단계 대리 색상을 정의한다.
 *
 * 실제 Phaser Sprite 애니메이션 등록은 TavernServiceScene에서 수행.
 * scaleY(-1) 미러링 완전 배제 — sit_up과 sit_down은 별개 상태로 선언.
 */

// ── A3: 셰프 상태 열거 ──

/**
 * 셰프 7개 상태 열거형.
 * 실제 스프라이트 키는 Phase B에서 연결.
 * 더미 PIL 단계에서는 상태별 컬러 블록으로 대리.
 * @enum {string}
 */
export const ChefState = Object.freeze({
  IDLE_SIDE: 'idle_side',   // 카운터 앞 대기 (사이드뷰, 1프레임)
  WALK_L:    'walk_l',      // 왼쪽 이동 (4프레임 시트)
  WALK_R:    'walk_r',      // 오른쪽 이동 (4프레임 시트)
  COOK:      'cook',        // 조리 중 (2프레임)
  CARRY_L:   'carry_l',     // 트레이 들고 왼쪽 이동 (4프레임)
  CARRY_R:   'carry_r',     // 트레이 들고 오른쪽 이동 (4프레임)
  SERVE:     'serve',       // 서빙 모션 (1프레임)
});

// ── A3: 손님 상태 열거 ──

/**
 * 손님 7개 상태 열거형.
 * sit_up / sit_down은 별개 스프라이트로 발주 예정 (Phase B).
 * scaleY(-1) 미러링 절대 사용 금지.
 * @enum {string}
 */
export const CustomerState = Object.freeze({
  ENTER:     'enter',       // 입장 이동 (walk_r 스프라이트 사용)
  QUEUE:     'queue',       // 대기열 서기 (walk idle 또는 1프레임)
  SIT_DOWN:  'sit_down',    // 위쪽 벤치 착석 (facing-down, seated_down 스프라이트)
  SIT_UP:    'sit_up',      // 아래쪽 벤치 착석 (facing-up, seated_up 스프라이트) -- 별개
  EAT_DOWN:  'eat_down',    // 위쪽 벤치 식사 (facing-down, eating_down 스프라이트)
  EAT_UP:    'eat_up',      // 아래쪽 벤치 식사 (facing-up, eating_up 스프라이트)
  LEAVE:     'leave',       // 퇴장 이동 (walk_l 스프라이트 사용)
});

// ── A3: 상태 전환 유효성 맵 ──

/**
 * 셰프 상태 전환 유효성 맵.
 * 키: 현재 상태, 값: 전환 가능한 다음 상태 배열.
 * Phase A에서는 검증용으로만 사용하며 실제 AI 로직은 Phase D에서 구현.
 * @type {Object<string, string[]>}
 */
export const CHEF_STATE_TRANSITIONS = Object.freeze({
  [ChefState.IDLE_SIDE]: [ChefState.WALK_L, ChefState.WALK_R, ChefState.COOK],
  [ChefState.WALK_L]:    [ChefState.IDLE_SIDE, ChefState.COOK, ChefState.CARRY_L],
  [ChefState.WALK_R]:    [ChefState.IDLE_SIDE, ChefState.COOK, ChefState.CARRY_R],
  [ChefState.COOK]:      [ChefState.IDLE_SIDE, ChefState.CARRY_L, ChefState.CARRY_R],
  [ChefState.CARRY_L]:   [ChefState.SERVE, ChefState.CARRY_R],
  [ChefState.CARRY_R]:   [ChefState.SERVE, ChefState.CARRY_L],
  [ChefState.SERVE]:     [ChefState.IDLE_SIDE, ChefState.WALK_L, ChefState.WALK_R],
});

/**
 * 손님 상태 전환 유효성 맵.
 * @type {Object<string, string[]>}
 */
export const CUSTOMER_STATE_TRANSITIONS = Object.freeze({
  [CustomerState.ENTER]:    [CustomerState.QUEUE],
  [CustomerState.QUEUE]:    [CustomerState.SIT_DOWN, CustomerState.SIT_UP, CustomerState.LEAVE],
  [CustomerState.SIT_DOWN]: [CustomerState.EAT_DOWN, CustomerState.LEAVE],
  [CustomerState.SIT_UP]:   [CustomerState.EAT_UP, CustomerState.LEAVE],
  [CustomerState.EAT_DOWN]: [CustomerState.LEAVE],
  [CustomerState.EAT_UP]:   [CustomerState.LEAVE],
  [CustomerState.LEAVE]:    [],
});

// ── A3: 더미 상태별 대리 색상 ──

/**
 * 셰프 상태별 대리 색상 (0xRRGGBB).
 * 실제 스프라이트 로드 전까지 Phaser Rectangle으로 표현.
 * @type {Object<string, number>}
 */
export const CHEF_STATE_COLORS = Object.freeze({
  [ChefState.IDLE_SIDE]: 0x4488ff,
  [ChefState.WALK_L]:    0x22bbff,
  [ChefState.WALK_R]:    0x22bbff,
  [ChefState.COOK]:      0xff8833,
  [ChefState.CARRY_L]:   0xff5522,
  [ChefState.CARRY_R]:   0xff5522,
  [ChefState.SERVE]:     0xffdd00,
});

/**
 * 손님 상태별 대리 색상 (0xRRGGBB).
 * sit_up과 sit_down은 색상이 구별된다.
 * @type {Object<string, number>}
 */
export const CUSTOMER_STATE_COLORS = Object.freeze({
  [CustomerState.ENTER]:    0x88ff88,
  [CustomerState.QUEUE]:    0xaaffaa,
  [CustomerState.SIT_DOWN]: 0x44cc44,
  [CustomerState.SIT_UP]:   0x22aa22,
  [CustomerState.EAT_DOWN]: 0x66ff66,
  [CustomerState.EAT_UP]:   0x33cc33,
  [CustomerState.LEAVE]:    0xcc8844,
});
