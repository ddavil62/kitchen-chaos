/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 레이아웃 상수 및 좌석 슬롯 데이터.
 * Phase A-bis~B-6-2: 360x640 캔버스 기준 영역 구획, 가구 앵커 좌표, 벤치 슬롯 모델 정의.
 * B-6-2: 가구 비례 업스케일 (bench 14x76->28x96, table 44x72->44x96), QUAD_W 100->104, 슬롯 좌표 재정렬.
 * V12 시안(travellers-v12-mockup.html)의 CSS 수치를 Phaser 절대 좌표로 변환.
 * 4분면(quad) 세로 테이블 배치, 좌석 24석(4quad x 좌3+우3).
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
 * V12 4분면 quad 좌상단 절대 좌표.
 * 다이닝홀 x: 128~360(232px) = 좌측여백4+quad104+통로16+quad104+우측여백4
 * quad.tl left=132, quad.tr left=252 (세로 통로 16px: 252-236=16)
 * quad.tl top=90,  quad.bl top=250  (가로 통로 40px: 250-210=40)
 * quad 크기: 104x120
 *
 * @type {ReadonlyArray<{quadLeft: number, quadTop: number, key: string}>}
 */
export const TABLE_SET_ANCHORS = Object.freeze([
  Object.freeze({ quadLeft: 132, quadTop:  90, key: 'tl' }),  // 좌상단
  Object.freeze({ quadLeft: 252, quadTop:  90, key: 'tr' }),  // 우상단
  Object.freeze({ quadLeft: 132, quadTop: 250, key: 'bl' }),  // 좌하단
  Object.freeze({ quadLeft: 252, quadTop: 250, key: 'br' }),  // 우하단
]);

// ── V12: 벤치 슬롯 구성 상수 ──

/**
 * V12 세로 벤치 슬롯 정의.
 * BENCH_SLOTS[level].slotOffsets[i].dy = quad 상단 기준 세로 오프셋.
 *
 * quad 내부 좌표계:
 *   bench-l: left=4, top=12, 28x96
 *   bench-r: left=72, top=12, 28x96
 *   손님 슬롯 top: 26 / 60 / 94 (AD 검수 권장값)
 *
 * lv0 = 3슬롯(bench 내 손님 3명)
 * lv3 = 4슬롯 (미래 확장, Phase B+에서 확정)
 * lv4 = 5슬롯 (미래 확장)
 *
 * @type {Object}
 */
export const BENCH_SLOTS = Object.freeze({
  lv0: Object.freeze({
    slotOffsets: Object.freeze([
      Object.freeze({ dy:  26 }),  // 슬롯 0 (손님 cust-1: top=26)
      Object.freeze({ dy:  60 }),  // 슬롯 1 (손님 cust-2: top=60)
      Object.freeze({ dy:  94 }),  // 슬롯 2 (손님 cust-3: top=94)
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
 * V12 벤치/테이블 구성 참조.
 * @type {Object}
 */
export const BENCH_CONFIG = Object.freeze({
  // quad 컨테이너 크기
  QUAD_W:    104,  // px (B-6-2: 100->104, bench28+table44+bench28+margin4)
  QUAD_H:    120,  // px
  // 세로 벤치 크기 (B-6-2 업스케일)
  BENCH_L_LEFT:   4,  // bench-l: quad 내 left
  BENCH_L_TOP:   12,  // bench-l: quad 내 top (수직 여백 균등)
  BENCH_W:       28,  // bench 너비 (28px, L/R 동일)
  BENCH_H:       96,  // bench 높이 (28x96, 3슬롯 수용)
  BENCH_R_LEFT:  76,  // bench-r: quad 내 left (Phase C: 72→76, table right=76 정합)
  // 세로 테이블 크기 (B-6-2 업스케일)
  TABLE_LEFT:    32,  // table-v: quad 내 left (= BENCH_L_LEFT + BENCH_W)
  TABLE_TOP:     12,  // table-v: quad 내 top (bench와 동일 top 정렬)
  TABLE_W:       44,  // table-v 너비 (44x96)
  TABLE_H:       96,  // table-v 높이 (bench와 동일 높이)
  // 통로 간격
  AISLE_V:       16,  // 세로 통로 (B-6-2: 20->16, QUAD_W 확장 보상)
  AISLE_H:       40,  // 가로 통로 (quad.tl 하단 ~ quad.bl 상단)
});

/** 좌측 벤치 손님 x 오프셋 (quad 좌상단 기준). 손님 x = quadLeft + BENCH_LEFT_OFFSET_X */
export const BENCH_LEFT_OFFSET_X  = 17;  // bench-l left(4) + BENCH_W/2(14) - 1 = 17

/** 우측 벤치 손님 x 오프셋 (quad 좌상단 기준). 손님 x = quadLeft + BENCH_RIGHT_OFFSET_X */
export const BENCH_RIGHT_OFFSET_X = 89;  // bench-r left(76) + BENCH_W/2(14) - 1 = 89 (Phase C)

// ── V12: 좌석 런타임 상태 관리 ──

/** @type {Array|null} 현재 좌석 상태 (씬에서 초기화) */
let _seatingState = null;

/**
 * 좌석 슬롯 런타임 상태를 생성한다. V12: 4 quad x 좌우 벤치 x 3슬롯 = 24석.
 * @param {string} [benchLevel='lv0'] - 벤치 레벨 키
 * @returns {Array<Object>} 좌석 상태 배열 (4엔트리)
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
    // 좌측 벤치 슬롯 (facing-right: 테이블 방향 향함)
    left: config.slotOffsets.map((offset, slotIdx) => ({
      slotIdx,
      side: 'left',
      facingRight: true,
      facingLeft:  false,
      worldX: quad.quadLeft + BENCH_LEFT_OFFSET_X,
      worldY: quad.quadTop  + offset.dy,
      occupiedBy: null,
    })),
    // 우측 벤치 슬롯 (facing-left: 테이블 방향 향함)
    right: config.slotOffsets.map((offset, slotIdx) => ({
      slotIdx,
      side: 'right',
      facingRight: false,
      facingLeft:  true,
      worldX: quad.quadLeft + BENCH_RIGHT_OFFSET_X,
      worldY: quad.quadTop  + offset.dy,
      occupiedBy: null,
    })),
  }));

  return _seatingState;
}

/**
 * 슬롯을 점유한다.
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스 (0~3)
 * @param {'left'|'right'} side - 벤치 위치
 * @param {number} slotIdx - 슬롯 인덱스
 * @param {string} customerId - 손님 ID
 * @returns {boolean} 점유 성공 여부
 */
export function occupySlot(tableSetIdx, side, slotIdx, customerId) {
  if (!_seatingState) return false;
  const set = _seatingState[tableSetIdx];
  if (!set) return false;
  const bench = set[side];
  if (!bench || !bench[slotIdx]) return false;
  if (bench[slotIdx].occupiedBy !== null) return false;

  bench[slotIdx].occupiedBy = customerId;
  return true;
}

/**
 * 슬롯 점유를 해제한다.
 * @param {number} tableSetIdx - 테이블 세트(quad) 인덱스
 * @param {'left'|'right'} side - 벤치 위치
 * @param {number} slotIdx - 슬롯 인덱스
 */
export function vacateSlot(tableSetIdx, side, slotIdx) {
  if (!_seatingState) return;
  const set = _seatingState[tableSetIdx];
  if (!set) return;
  const bench = set[side];
  if (!bench || !bench[slotIdx]) return;
  bench[slotIdx].occupiedBy = null;
}

/**
 * 전체 좌석에서 최초 빈 슬롯을 찾는다.
 * @returns {{ tableSetIdx: number, side: string, slotIdx: number }|null}
 */
export function findFreeSlot() {
  if (!_seatingState) return null;
  for (const set of _seatingState) {
    for (const side of ['left', 'right']) {
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
 * @param {'left'|'right'} side - 벤치 위치
 * @param {number} slotIdx - 슬롯 인덱스
 * @returns {{ x: number, y: number }|null}
 */
export function getSlotWorldPos(tableSetIdx, side, slotIdx) {
  if (!_seatingState) return null;
  const set = _seatingState[tableSetIdx];
  if (!set) return null;
  const bench = set[side];
  if (!bench || !bench[slotIdx]) return null;
  return { x: bench[slotIdx].worldX, y: bench[slotIdx].worldY };
}
