/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 레이아웃 상수 및 좌석 슬롯 데이터.
 * Phase A-bis~B-6-2: 360x640 캔버스 기준 영역 구획, 가구 앵커 좌표, 벤치 슬롯 모델 정의.
 * B-6-2: 가구 비례 업스케일 (bench 14x76->28x96, table 44x72->44x96), QUAD_W 100->104, 슬롯 좌표 재정렬.
 * Phase D: 손님 64px 업그레이드 + 2 quad 1열 레이아웃 전환 (QUAD_W=232, BENCH_W=80, TABLE_W=64, BENCH_H=200).
 * Phase E: 착석 레이아웃 재설계 — y축 depth 착석 표현 (테이블 depth > 손님 depth).
 * 슬롯 구조를 left/right 벤치 기반에서 front(테이블 정면) 단일 열로 전환.
 * V12 시안(travellers-v12-mockup.html)의 CSS 수치를 Phaser 절대 좌표로 변환.
 * 2분면(quad) 세로 테이블 배치, 좌석 6석(2quad x front 3).
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
 * Phase D: 2분면 quad 좌상단 절대 좌표 (1열 2행).
 * 다이닝홀 x: 128~360(232px) = 1열 quad 232px (세로 통로 없음)
 * quadLeft=128 (DINING_X), quadTop 계산: 64(top), 328(bottom)
 * quad 크기: 232x224
 *
 * @type {ReadonlyArray<{quadLeft: number, quadTop: number, key: string}>}
 */
export const TABLE_SET_ANCHORS = Object.freeze([
  Object.freeze({ quadLeft: 128, quadTop:  64, key: 'top' }),     // 상단
  Object.freeze({ quadLeft: 128, quadTop: 328, key: 'bottom' }),  // 하단
]);

// ── V12: 벤치 슬롯 구성 상수 ──

/**
 * Phase E 세로 슬롯 정의 (y축 depth 착석).
 * BENCH_SLOTS[level].slotOffsets[i].dy = quad 상단 기준 세로 오프셋 (손님 발끝 y).
 *
 * Phase E quad 내부 좌표계:
 *   손님 x = quadLeft + SEAT_CENTER_OFFSET_X(116) — 테이블 중앙 1열
 *   손님 슬롯 dy(발끝): 36 / 86 / 136
 *   테이블 depth = quadTop + TABLE_DEPTH_OFFSET(212) — 손님 하체 가림
 *
 * lv0 = 3슬롯(테이블 정면, 64px 캐릭터, 슬롯 간격 50px)
 * lv3 = 4슬롯 (미래 확장, Phase D+ 에서 재확정 필요)
 * lv4 = 5슬롯 (미래 확장)
 *
 * @type {Object}
 */
export const BENCH_SLOTS = Object.freeze({
  lv0: Object.freeze({
    // Phase E: y축 depth 착석 — 테이블 정면 3슬롯
    // dy = quadTop 기준 손님 발끝 y 오프셋
    // dy[0] = TABLE_TOP(12) + SEAT_OFFSET_Y(24) = 36
    // dy[1] = 36 + SEAT_SPACING_Y(50) = 86
    // dy[2] = 86 + SEAT_SPACING_Y(50) = 136
    slotOffsets: Object.freeze([
      Object.freeze({ dy:  36 }),  // 슬롯 0 — 테이블 상단에 가장 가까운 손님
      Object.freeze({ dy:  86 }),  // 슬롯 1
      Object.freeze({ dy: 136 }),  // 슬롯 2
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
 * Phase D 벤치/테이블 구성 참조.
 * 1열 2행 레이아웃: QUAD_W=232 (4+80+64+80+4), QUAD_H=224 (BENCH_H+24).
 * @type {Object}
 */
export const BENCH_CONFIG = Object.freeze({
  // quad 컨테이너 크기
  QUAD_W:    232,  // px (Phase D: 4+80+64+80+4, 1열)
  QUAD_H:    224,  // px (Phase D: BENCH_H(200)+24)
  // 세로 벤치 크기 (Phase D 업스케일)
  BENCH_L_LEFT:   4,  // bench-l: quad 내 left
  BENCH_L_TOP:   12,  // bench-l: quad 내 top (수직 여백 균등)
  BENCH_W:       80,  // bench 너비 (80px, L/R 동일, Phase D: 28->80)
  BENCH_H:      200,  // bench 높이 (80x200, 3슬롯 수용, Phase D: 96->200)
  BENCH_R_LEFT: 148,  // bench-r: quad 내 left (Phase D: 4+80+64=148)
  // 세로 테이블 크기 (Phase D 업스케일)
  TABLE_LEFT:    84,  // table-v: quad 내 left (= BENCH_L_LEFT(4) + BENCH_W(80))
  TABLE_TOP:     12,  // table-v: quad 내 top (bench와 동일 top 정렬)
  TABLE_W:       64,  // table-v 너비 (64x200, Phase D: 44->64)
  TABLE_H:      200,  // table-v 높이 (bench와 동일 높이, Phase D: 96->200)
  // 통로 간격
  AISLE_V:        0,  // 세로 통로 (Phase D: 1열, 세로 통로 없음)
  AISLE_H:       40,  // 가로 통로 (quad.top 하단 ~ quad.bottom 상단)
  // Phase E: depth 착석 표현 상수
  SEAT_CENTER_OFFSET_X: 116,  // 손님 x = quadLeft + 116 (TABLE_LEFT(84) + TABLE_W/2(32))
  SEAT_OFFSET_Y:         24,  // 손님 발끝이 테이블 상단보다 아래로 SEAT_OFFSET_Y만큼 (하체 가림)
  SEAT_SPACING_Y:        50,  // 슬롯 간 y 간격 (TABLE_H(200)/4)
  TABLE_DEPTH_OFFSET:   212,  // 테이블 depth = quadTop + 212 (TABLE_TOP(12) + TABLE_H(200))
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
 * 좌석 슬롯 런타임 상태를 생성한다. Phase E: 2 quad x front 3슬롯 = 6석.
 * @param {string} [benchLevel='lv0'] - 벤치 레벨 키
 * @returns {Array<Object>} 좌석 상태 배열 (2엔트리)
 */
export function createSeatingState(benchLevel = 'lv0') {
  const config = BENCH_SLOTS[benchLevel];
  if (!config) {
    console.error(`[tavernLayoutData] 알 수 없는 벤치 레벨: ${benchLevel}`);
    return [];
  }

  _seatingState = TABLE_SET_ANCHORS.map((quad, quadIdx) => ({
    quadIdx,
    quadLeft: quad.quadLeft,
    quadTop:  quad.quadTop,
    key:      quad.key,
    // Phase E: 테이블 정면 단일 열 슬롯 (facing-south: 카메라 방향 향함)
    front: config.slotOffsets.map((offset, slotIdx) => ({
      slotIdx,
      side: 'front',
      facingSouth: true,
      worldX: quad.quadLeft + SEAT_CENTER_OFFSET_X,
      worldY: quad.quadTop  + offset.dy,
      occupiedBy: null,
    })),
  }));

  return _seatingState;
}

/**
 * 슬롯을 점유한다.
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스 (0~1)
 * @param {'front'|'left'|'right'} side - 슬롯 위치 (Phase E: 'front', 레거시 'left'/'right'는 front로 fallback)
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
 * @param {'front'|'left'|'right'} side - 슬롯 위치 (Phase E: 'front', 레거시 fallback 지원)
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
 * Phase E: front 단일 열만 순회.
 * @returns {{ tableSetIdx: number, side: string, slotIdx: number }|null}
 */
export function findFreeSlot() {
  if (!_seatingState) return null;
  for (const set of _seatingState) {
    for (const side of ['front']) {
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
 * @param {'front'|'left'|'right'} side - 슬롯 위치 (Phase E: 'front', 레거시 fallback 지원)
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
