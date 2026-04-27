/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 레이아웃 상수 및 좌석 슬롯 데이터.
 * Phase A-bis~B-6-2: 360x640 캔버스 기준 영역 구획, 가구 앵커 좌표, 벤치 슬롯 모델 정의.
 * B-6-2: 가구 비례 업스케일 (bench 14x76->28x96, table 44x72->44x96), QUAD_W 100->104, 슬롯 좌표 재정렬.
 * Phase D: 손님 64px 업그레이드 + 2 quad 1열 레이아웃 전환 (QUAD_W=232, BENCH_W=80, TABLE_W=64, BENCH_H=200).
 * Phase E: 착석 레이아웃 재설계 — y축 depth 착석 표현 (테이블 depth > 손님 depth).
 * Phase F: 가로 테이블 양면 착석 레이아웃 — front(south-facing) + back(north-facing) 양면 12석.
 * Phase G: 현대 식당 2열x3행 6테이블 24석 레이아웃 — v13 가구(100x40 테이블, 100x20 의자), QUAD_W=116, QUAD_H=128.
 *
 * 기존 ServiceScene.js의 레이아웃 상수(HALL_Y, COOK_Y 등)와 완전 독립.
 * import/참조 금지.
 */

// ── 캔버스 크기 (config.js와 동일하지만 독립 선언) ──
const GAME_W = 360;
const GAME_H = 640;

// ── A1: 영역 경계 상수 ──

/**
 * 태번 씬 레이아웃 상수.
 * 모든 값은 Phaser 절대 y/x 좌표(px).
 * @type {Object}
 */
export const TAVERN_LAYOUT = Object.freeze({
  GAME_W,
  GAME_H,

  // 영역 높이
  HUD_H:     32,          // 0 ~ 32 : HUD 바 (타이머/골드/챕터)
  WALL_H:    24,          // 32 ~ 56 : 가로 두꺼운 벽 (액자/창문)
  CTRL_H:    80,          // 560 ~ 640 : 컨트롤 바

  // 영역 y 좌표
  ROOM_Y:            32,  // room 시작 y (wall 포함)
  ROOM_CONTENT_Y:    56,  // 벽 아래 실제 방 콘텐츠 시작 y
  ROOM_BOTTOM_Y:    560,  // room 끝 y

  // 주방/다이닝홀 x 좌표
  KITCHEN_X:   8,         // 주방 영역 좌측 경계
  KITCHEN_W: 120,         // 주방 폭 (0 ~ 120px, 전체 1/3)
  DINING_X:  128,         // 다이닝홀 시작 x (주방 우측)
  DINING_W:  232,         // 다이닝홀 폭 (128 ~ 360px = GAME_W, Phase C: 224→232 실제 경계 정합)
});

// ── V12: 가구 앵커 좌표 ──

/** 주방 카운터 앵커. V12: 40x100px, setOrigin(0.5,0) 기준 상단 중앙. left=80이므로 x=80+20=100 */
export const COUNTER_ANCHOR = Object.freeze({ x: 100, y: 90 });
export const COUNTER_W = 40;
export const COUNTER_H = 100;

/** 입구 V12: 32x40px, 좌하단. left=44, x=44+16=60, top=480 */
export const DOOR_ANCHOR = Object.freeze({ x: 60, y: 480 });

/** 셰프 발끝 앵커 (카운터 범위 내, idle 위치). V12: 셰프-1 top=100, 셰프-2 top=148 */
export const CHEF_IDLE_ANCHORS = Object.freeze([
  Object.freeze({ x: 40, y: 100 }),
  Object.freeze({ x: 40, y: 148 }),
]);

/**
 * Phase G: 6분면 quad 좌상단 절대 좌표 (2열 3행).
 * 다이닝홀 x: 128~360(232px) = 2열 × QUAD_W(116px)
 * 3행: quadTop = 64, 232, 400 (행간 AISLE_H=40px)
 * quad 크기: 116x128 (Phase G: 현대 식당 4인 테이블)
 *
 * @type {ReadonlyArray<{quadLeft: number, quadTop: number, key: string}>}
 */
export const TABLE_SET_ANCHORS = Object.freeze([
  Object.freeze({ quadLeft: 128, quadTop:  64, key: 'row0_left'  }),   // 좌열 1행
  Object.freeze({ quadLeft: 244, quadTop:  64, key: 'row0_right' }),   // 우열 1행
  Object.freeze({ quadLeft: 128, quadTop: 232, key: 'row1_left'  }),   // 좌열 2행
  Object.freeze({ quadLeft: 244, quadTop: 232, key: 'row1_right' }),   // 우열 2행
  Object.freeze({ quadLeft: 128, quadTop: 400, key: 'row2_left'  }),   // 좌열 3행
  Object.freeze({ quadLeft: 244, quadTop: 400, key: 'row2_right' }),   // 우열 3행
]);

// ── Phase G: 좌석 슬롯 구성 상수 ──

/**
 * Phase G 현대 식당 4인 테이블 슬롯 정의.
 * BENCH_SLOTS[level].slotOffsets[i] = { side, dx, dy }
 *   side: 'front'(south-facing) 또는 'back'(north-facing)
 *   dx: quadLeft + SEAT_CENTER_OFFSET_X(58) 기준 x 오프셋
 *   dy: quadTop 기준 y 오프셋 (손님 발끝)
 *
 * Phase G quad 내부 좌표계:
 *   SEAT_CENTER_OFFSET_X = 58 (QUAD_W/2)
 *   front 슬롯 dy = 40 (< TABLE_DEPTH_OFFSET(80) → 테이블이 하체 가림)
 *   back  슬롯 dy = 104 (64px 기준: 머리+상체(40px) 노출, 의자가 하체 가림)
 *   dx = [-24, +24] (슬롯간격 48px, 64px 손님 부분 오버랩 허용)
 *
 * lv0 = 4슬롯 (front 2 + back 2, 4인 테이블 양면)
 * lv3 = 4슬롯 (미래 확장, Phase D+ 에서 재확정 필요)
 * lv4 = 5슬롯 (미래 확장)
 *
 * @type {Object}
 */
export const BENCH_SLOTS = Object.freeze({
  lv0: Object.freeze({
    // Phase G: 4인 테이블 양면 착석
    // front 2슬롯 (south-facing, depth < 테이블 depth)
    // back  2슬롯 (north-facing, depth > 테이블 depth)
    slotOffsets: Object.freeze([
      Object.freeze({ side: 'front', dx: -24, dy: 40 }),   // front[0] — 좌
      Object.freeze({ side: 'front', dx:  24, dy: 40 }),   // front[1] — 우
      Object.freeze({ side: 'back',  dx: -24, dy: 104 }),  // back[0] — 좌
      Object.freeze({ side: 'back',  dx:  24, dy: 104 }),  // back[1] — 우
    ]),
  }),
  lv3: Object.freeze({
    slotOffsets: Object.freeze([
      Object.freeze({ dy: 14 }),
      Object.freeze({ dy: 34 }),
      Object.freeze({ dy: 54 }),
      Object.freeze({ dy: 74 }),
    ]),
  }),
  lv4: Object.freeze({
    slotOffsets: Object.freeze([
      Object.freeze({ dy: 10 }),
      Object.freeze({ dy: 28 }),
      Object.freeze({ dy: 46 }),
      Object.freeze({ dy: 64 }),
      Object.freeze({ dy: 82 }),
    ]),
  }),
});

/**
 * Phase G 현대 식당 테이블/의자 구성 참조.
 * 2열 3행 레이아웃: QUAD_W=116, QUAD_H=128.
 * @type {Object}
 */
export const BENCH_CONFIG = Object.freeze({
  // quad 컨테이너 크기
  QUAD_W:    116,  // px (DINING_W 232 / 2열)
  QUAD_H:    128,  // px (Phase G: 20+20+40+20+28여유)
  // 테이블 (Phase G: 100x40)
  TABLE_LEFT:   8,  // quad 내 x (= (116-100)/2, 수평 중앙)
  TABLE_TOP:   40,  // quad 내 y (= BENCH_TOP_TOP(20) + BENCH_H(20))
  TABLE_W:    100,  // 테이블 너비
  TABLE_H:     40,  // 테이블 높이
  // 의자 (Phase G: 100x20)
  BENCH_TOP_TOP:  20,  // 상단 의자 quad 내 y (far side, chair_back)
  BENCH_BOT_TOP:  80,  // 하단 의자 quad 내 y (= TABLE_TOP + TABLE_H, near side, chair_front)
  BENCH_W:       100,  // 의자 너비 (= TABLE_W)
  BENCH_H:        20,  // 의자 높이
  // 통로 간격
  AISLE_V:        0,  // 세로 통로 (2열, 경계는 quadLeft로 분리)
  AISLE_H:       40,  // 가로 통로 (행 간격)
  // Phase G: depth 착석 상수
  SEAT_CENTER_OFFSET_X:  58,  // 손님 x = quadLeft + 58 (QUAD_W/2)
  TABLE_DEPTH_OFFSET:    80,  // 테이블 depth = quadTop + 80 (TABLE_TOP(40) + TABLE_H(40))
  SLOT_DX:               24,  // 슬롯 x 간격 (64px 손님, ±24px)
  FRONT_SLOT_DY:         40,  // front 슬롯 발끝 dy
  BACK_SLOT_DY:         104,  // back 슬롯 발끝 dy (64px 기준: 머리+상체 노출)
});

/** @deprecated Phase E: front 단일 열로 전환. SEAT_CENTER_OFFSET_X 사용 권장. */
export const BENCH_LEFT_OFFSET_X  = 44;  // Phase D: bench-l left(4) + BENCH_W/2(40) = 44

/** @deprecated Phase E: front 단일 열로 전환. SEAT_CENTER_OFFSET_X 사용 권장. */
export const BENCH_RIGHT_OFFSET_X = 188;  // Phase D: BENCH_L_LEFT(4) + BENCH_W(80) + TABLE_W(64) + BENCH_W/2(40) = 188

/** Phase G: 손님 x 오프셋 (quad 중앙, quad 좌상단 기준). 손님 x = quadLeft + 58 */
export const SEAT_CENTER_OFFSET_X = 58;  // QUAD_W(116) / 2

// ── V12: 좌석 런타임 상태 관리 ──

/** @type {Array|null} 현재 좌석 상태 (씬에서 초기화) */
let _seatingState = null;

/**
 * 좌석 슬롯 런타임 상태를 생성한다. Phase G: 6 quad x (front 2 + back 2) = 24석.
 * @param {string} [benchLevel='lv0'] - 벤치 레벨 키
 * @returns {Array<Object>} 좌석 상태 배열 (6엔트리, 각 front/back 슬롯 보유)
 */
export function createSeatingState(benchLevel = 'lv0') {
  const config = BENCH_SLOTS[benchLevel];
  if (!config) {
    console.error(`[tavernLayoutData] 알 수 없는 벤치 레벨: ${benchLevel}`);
    return [];
  }

  // Phase F: front + back 양면 슬롯 분리
  const frontOffsets = config.slotOffsets.filter(o => o.side === 'front');
  const backOffsets  = config.slotOffsets.filter(o => o.side === 'back');

  // side 필드가 없는 레거시 레벨(lv3, lv4)은 front로 일괄 처리
  const hasSide = frontOffsets.length > 0 || backOffsets.length > 0;

  _seatingState = TABLE_SET_ANCHORS.map((quad, quadIdx) => ({
    quadIdx,
    quadLeft: quad.quadLeft,
    quadTop:  quad.quadTop,
    key:      quad.key,
    // Phase F: 테이블 정면 슬롯 (south-facing)
    front: (hasSide ? frontOffsets : config.slotOffsets).map((offset, slotIdx) => ({
      slotIdx,
      side: 'front',
      facingSouth: true,
      worldX: quad.quadLeft + SEAT_CENTER_OFFSET_X + (offset.dx || 0),
      worldY: quad.quadTop  + offset.dy,
      occupiedBy: null,
    })),
    // Phase F: 테이블 후면 슬롯 (north-facing)
    back: (hasSide ? backOffsets : []).map((offset, slotIdx) => ({
      slotIdx,
      side: 'back',
      facingSouth: false,
      worldX: quad.quadLeft + SEAT_CENTER_OFFSET_X + (offset.dx || 0),
      worldY: quad.quadTop  + offset.dy,
      occupiedBy: null,
    })),
  }));

  return _seatingState;
}

/**
 * 슬롯을 점유한다.
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스 (0~5)
 * @param {'front'|'back'|'left'|'right'} side - 슬롯 위치 (Phase F: 'front'/'back', 레거시 'left'/'right'는 front로 fallback)
 * @param {number} slotIdx - 슬롯 인덱스
 * @param {string} customerId - 손님 ID
 * @returns {boolean} 점유 성공 여부
 */
export function occupySlot(tableSetIdx, side, slotIdx, customerId) {
  if (!_seatingState) return false;
  const set = _seatingState[tableSetIdx];
  if (!set) return false;
  const bench = set[side] || set['front'];  // 레거시 'left'/'right' 접근 시 front로 fallback
  if (!bench || !bench[slotIdx]) return false;
  if (bench[slotIdx].occupiedBy !== null) return false;

  bench[slotIdx].occupiedBy = customerId;
  return true;
}

/**
 * 슬롯 점유를 해제한다.
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스
 * @param {'front'|'back'|'left'|'right'} side - 슬롯 위치 (Phase F: 'front'/'back', 레거시 fallback 지원)
 * @param {number} slotIdx - 슬롯 인덱스
 */
export function vacateSlot(tableSetIdx, side, slotIdx) {
  if (!_seatingState) return;
  const set = _seatingState[tableSetIdx];
  if (!set) return;
  const bench = set[side] || set['front'];  // 레거시 'left'/'right' 접근 시 front로 fallback
  if (!bench || !bench[slotIdx]) return;
  bench[slotIdx].occupiedBy = null;
}

/**
 * 전체 좌석에서 최초 빈 슬롯을 찾는다.
 * Phase F: front -> back 순서로 양면 순회.
 * @param {number|null} [tableSetIdx=null] - 특정 quad만 탐색 (null이면 전체)
 * @returns {{ tableSetIdx: number, side: string, slotIdx: number }|null}
 */
export function findFreeSlot(tableSetIdx = null) {
  if (!_seatingState) return null;
  const sets = tableSetIdx != null ? [_seatingState[tableSetIdx]] : _seatingState;
  for (const set of sets) {
    if (!set) continue;
    for (const side of ['front', 'back']) {
      if (!set[side]) continue;
      for (const slot of set[side]) {
        if (slot.occupiedBy === null) {
          return {
            tableSetIdx: set.quadIdx,
            side,
            slotIdx: slot.slotIdx,
          };
        }
      }
    }
  }
  return null;
}

/**
 * 해당 슬롯의 Phaser 절대 좌표를 반환한다.
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스
 * @param {'front'|'back'|'left'|'right'} side - 슬롯 위치 (Phase F: 'front'/'back', 레거시 fallback 지원)
 * @param {number} slotIdx - 슬롯 인덱스
 * @returns {{ x: number, y: number }|null}
 */
export function getSlotWorldPos(tableSetIdx, side, slotIdx) {
  if (!_seatingState) return null;
  const set = _seatingState[tableSetIdx];
  if (!set) return null;
  const bench = set[side] || set['front'];  // 레거시 'left'/'right' 접근 시 front로 fallback
  if (!bench || !bench[slotIdx]) return null;
  return { x: bench[slotIdx].worldX, y: bench[slotIdx].worldY };
}
