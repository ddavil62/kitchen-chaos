/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 레이아웃 상수 및 좌석 슬롯 데이터.
 * Phase A-bis~B-6-2: 360x640 캔버스 기준 영역 구획, 가구 앵커 좌표, 벤치 슬롯 모델 정의.
 * B-6-2: 가구 비례 업스케일 (bench 14x76->28x96, table 44x72->44x96), QUAD_W 100->104, 슬롯 좌표 재정렬.
 * Phase D: 손님 64px 업그레이드 + 2 quad 1열 레이아웃 전환 (QUAD_W=232, BENCH_W=80, TABLE_W=64, BENCH_H=200).
 * Phase E: 착석 레이아웃 재설계 — y축 depth 착석 표현 (테이블 depth > 손님 depth).
 * Phase F: 가로 테이블 양면 착석 레이아웃 — front(south-facing) + back(north-facing) 양면 12석.
 * V12 시안(travellers-v12-mockup.html)의 CSS 수치를 Phaser 절대 좌표로 변환.
 * 2분면(quad) 가로 테이블 배치, 좌석 12석(2quad x (front 3 + back 3)).
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
 * Phase F: 2분면 quad 좌상단 절대 좌표 (1열 2행).
 * 다이닝홀 x: 128~360(232px) = 1열 quad 232px (세로 통로 없음)
 * quadLeft=128 (DINING_X), quadTop 계산: 168(top), 328(bottom)
 * quad 크기: 232x120 (Phase F: 가로 테이블 레이아웃)
 *
 * @type {ReadonlyArray<{quadLeft: number, quadTop: number, key: string}>}
 */
export const TABLE_SET_ANCHORS = Object.freeze([
  Object.freeze({ quadLeft: 128, quadTop: 168, key: 'top' }),     // 상단
  Object.freeze({ quadLeft: 128, quadTop: 328, key: 'bottom' }),  // 하단
]);

// ── V12: 벤치 슬롯 구성 상수 ──

/**
 * Phase F 가로 테이블 양면 슬롯 정의.
 * BENCH_SLOTS[level].slotOffsets[i] = { side, dx, dy }
 *   side: 'front'(south-facing) 또는 'back'(north-facing)
 *   dx: quadLeft + SEAT_CENTER_OFFSET_X(116) 기준 x 오프셋
 *   dy: quadTop 기준 y 오프셋 (손님 발끝)
 *
 * Phase F quad 내부 좌표계:
 *   SEAT_CENTER_OFFSET_X = 116 (TABLE_LEFT(16) + TABLE_W/2(100))
 *   front 슬롯 dy = 36 (< TABLE_DEPTH_OFFSET(84) → 테이블이 하체 가림)
 *   back  슬롯 dy = 108 (> TABLE_DEPTH_OFFSET(84) → 손님이 테이블 앞에 렌더)
 *   dx = [-66, 0, +66] (슬롯간격 66px, 손님 64px 대비 2px 여유)
 *
 * lv0 = 6슬롯 (front 3 + back 3, 가로 테이블 양면)
 * lv3 = 4슬롯 (미래 확장, Phase D+ 에서 재확정 필요)
 * lv4 = 5슬롯 (미래 확장)
 *
 * @type {Object}
 */
export const BENCH_SLOTS = Object.freeze({
  lv0: Object.freeze({
    // Phase F: 가로 테이블 양면 착석
    // front 3슬롯 (south-facing, depth < 테이블 depth)
    // back  3슬롯 (north-facing, depth > 테이블 depth)
    slotOffsets: Object.freeze([
      Object.freeze({ side: 'front', dx: -66, dy: 36 }),   // front[0] — 좌
      Object.freeze({ side: 'front', dx:   0, dy: 36 }),   // front[1] — 중
      Object.freeze({ side: 'front', dx:  66, dy: 36 }),   // front[2] — 우
      Object.freeze({ side: 'back',  dx: -66, dy: 108 }),  // back[0] — 좌
      Object.freeze({ side: 'back',  dx:   0, dy: 108 }),  // back[1] — 중
      Object.freeze({ side: 'back',  dx:  66, dy: 108 }),  // back[2] — 우
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
 * Phase F 가로 테이블/벤치 구성 참조.
 * 1열 2행 레이아웃: QUAD_W=232, QUAD_H=120 (12+24+48+24+12).
 * @type {Object}
 */
export const BENCH_CONFIG = Object.freeze({
  // quad 컨테이너 크기
  QUAD_W:    232,  // px (dining 폭, 유지)
  QUAD_H:    120,  // px (Phase F: 12+24+48+24+12, 가로 레이아웃)
  // 가로 테이블 (Phase F)
  TABLE_LEFT:  16,  // quad 내 x (= (232-200)/2, 수평 중앙)
  TABLE_TOP:   36,  // quad 내 y (= BENCH_TOP_TOP(12) + BENCH_H(24))
  TABLE_W:    200,  // 가로 테이블 너비 (200x48)
  TABLE_H:     48,  // 가로 테이블 높이
  // 가로 벤치 (Phase F)
  BENCH_TOP_TOP:  12,  // 상단 벤치 quad 내 y (far side)
  BENCH_BOT_TOP:  84,  // 하단 벤치 quad 내 y (= TABLE_TOP + TABLE_H, near side)
  BENCH_W:       200,  // 벤치 너비 (= TABLE_W)
  BENCH_H:        24,  // 벤치 높이
  // 통로 간격
  AISLE_V:        0,  // 세로 통로 (Phase D: 1열, 세로 통로 없음)
  AISLE_H:       40,  // 가로 통로 (quad.top 하단 ~ quad.bottom 상단)
  // Phase F: depth 착석 상수
  SEAT_CENTER_OFFSET_X: 116,  // 손님 x = quadLeft + 116 (TABLE_LEFT(16) + TABLE_W/2(100))
  TABLE_DEPTH_OFFSET:    84,  // 테이블 depth = quadTop + 84 (TABLE_TOP(36) + TABLE_H(48))
  SLOT_DX:               66,  // 슬롯 x 간격 (손님 64px, 여유 2px)
  FRONT_SLOT_DY:         36,  // front 슬롯 발끝 dy
  BACK_SLOT_DY:         108,  // back 슬롯 발끝 dy
});

/** @deprecated Phase E: front 단일 열로 전환. SEAT_CENTER_OFFSET_X 사용 권장. */
export const BENCH_LEFT_OFFSET_X  = 44;  // Phase D: bench-l left(4) + BENCH_W/2(40) = 44

/** @deprecated Phase E: front 단일 열로 전환. SEAT_CENTER_OFFSET_X 사용 권장. */
export const BENCH_RIGHT_OFFSET_X = 188;  // Phase D: BENCH_L_LEFT(4) + BENCH_W(80) + TABLE_W(64) + BENCH_W/2(40) = 188

/** Phase E: 손님 x 오프셋 (테이블 중앙, quad 좌상단 기준). 손님 x = quadLeft + 116 */
export const SEAT_CENTER_OFFSET_X = 116;  // TABLE_LEFT(84) + TABLE_W/2(32)

// ── V12: 좌석 런타임 상태 관리 ──

/** @type {Array|null} 현재 좌석 상태 (씬에서 초기화) */
let _seatingState = null;

/**
 * 좌석 슬롯 런타임 상태를 생성한다. Phase F: 2 quad x (front 3 + back 3) = 12석.
 * @param {string} [benchLevel='lv0'] - 벤치 레벨 키
 * @returns {Array<Object>} 좌석 상태 배열 (2엔트리, 각 front/back 슬롯 보유)
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
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스 (0~1)
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
