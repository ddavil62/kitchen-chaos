/**
 * @fileoverview Kitchen Chaos 태번(Tavern) 스타일 영업씬 레이아웃 상수 및 좌석 슬롯 데이터.
 * Phase A: 360x640 캔버스 기준 영역 구획, 가구 앵커 좌표, 벤치 슬롯 모델 정의.
 * V10 시안(travellers-style-mockup.html)의 CSS 수치를 Phaser 절대 좌표로 변환.
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
  DINING_W:  224,         // 다이닝홀 폭 (128 ~ 352px, 전체 2/3)
});

// ── A1: 가구 앵커 좌표 ──

/** 주방 카운터 앵커. setOrigin(0.5, 0) 기준 상단 중앙 */
export const COUNTER_ANCHOR = Object.freeze({ x: 64, y: 56 });
export const COUNTER_W = 112;
export const COUNTER_H = 52;

/** 술통 장식 앵커 (카운터 좌측 하단) */
export const BARREL_ANCHORS = Object.freeze([
  Object.freeze({ x: 28, y: 156 }),
  Object.freeze({ x: 60, y: 156 }),
]);

/** 입구 프레임 (우측 상단, 벽 아래) */
export const DOOR_ANCHOR = Object.freeze({ x: 316, y: 56 });

/** 셰프 발끝 앵커 (카운터 뒤쪽, idle 위치) */
export const CHEF_IDLE_ANCHORS = Object.freeze([
  Object.freeze({ x: 72, y: 48 }),
  Object.freeze({ x: 112, y: 48 }),
]);

/**
 * 3개 테이블 세트 앵커.
 * V10 CSS: t1 top:200, t2 top:320, t3 top:440 (room 내부 기준).
 * Phaser 절대 y = V10 top + 32 (room.top=32).
 * @type {ReadonlyArray<{x: number, y: number}>}
 */
export const TABLE_SET_ANCHORS = Object.freeze([
  Object.freeze({ x: 168, y: 232 }),  // 세트 1 (상단)
  Object.freeze({ x: 168, y: 352 }),  // 세트 2 (중간)
  Object.freeze({ x: 168, y: 472 }),  // 세트 3 (하단)
]);

// ── A2: 벤치 슬롯 구성 상수 ──

/** 벤치 너비 (lv0 기준) */
export const BENCH_W = 192;

/** 벤치-top y 오프셋: 테이블 세트 앵커 대비 위쪽 벤치 캐릭터 발 y 오프셋 */
export const BENCH_TOP_OFFSET_Y = -38;

/** 벤치-bot y 오프셋: 테이블 세트 앵커 대비 아래쪽 벤치 캐릭터 발 y 오프셋 */
export const BENCH_BOT_OFFSET_Y = 38;

/**
 * 벤치 슬롯 레벨별 x 오프셋 정의.
 * BENCH_SLOTS[level].slotOffsets[i].dx = 벤치 좌측 경계 기준 x 오프셋.
 * @type {Object}
 */
export const BENCH_SLOTS = Object.freeze({
  lv0: Object.freeze({
    slotOffsets: Object.freeze([
      Object.freeze({ dx: 32 }),   // 슬롯 0
      Object.freeze({ dx: 72 }),   // 슬롯 1
      Object.freeze({ dx: 112 }),  // 슬롯 2
      Object.freeze({ dx: 160 }),  // 슬롯 3
    ]),
  }),
  lv3: Object.freeze({
    slotOffsets: Object.freeze([
      Object.freeze({ dx: 24 }),
      Object.freeze({ dx: 56 }),
      Object.freeze({ dx: 88 }),
      Object.freeze({ dx: 120 }),
      Object.freeze({ dx: 152 }),
    ]),
  }),
  lv4: Object.freeze({
    slotOffsets: Object.freeze([
      Object.freeze({ dx: 20 }),
      Object.freeze({ dx: 52 }),
      Object.freeze({ dx: 84 }),
      Object.freeze({ dx: 116 }),
      Object.freeze({ dx: 148 }),
      Object.freeze({ dx: 180 }),
    ]),
  }),
});

/**
 * 벤치 구성 참조 (테이블 높이 등).
 * @type {Object}
 */
export const BENCH_CONFIG = Object.freeze({
  BENCH_H: 14,     // 벤치 높이 (px)
  TABLE_W: 192,    // 테이블 너비 (px)
  TABLE_H: 40,     // 테이블 높이 (px)
});

// ── A2: 좌석 런타임 상태 관리 ──

/** @type {Array|null} 현재 좌석 상태 (씬에서 초기화) */
let _seatingState = null;

/**
 * 좌석 슬롯 런타임 상태를 생성한다.
 * 3개 테이블 세트 x 위/아래 벤치 x slotCount개 슬롯.
 * @param {string} [benchLevel='lv0'] - 벤치 레벨 키
 * @returns {Array<Object>} 좌석 상태 배열
 */
export function createSeatingState(benchLevel = 'lv0') {
  const config = BENCH_SLOTS[benchLevel];
  if (!config) {
    console.error(`[tavernLayoutData] 알 수 없는 벤치 레벨: ${benchLevel}`);
    return [];
  }

  _seatingState = TABLE_SET_ANCHORS.map((anchor, tableSetIdx) => ({
    tableSetIdx,
    anchor: { ...anchor },
    top: config.slotOffsets.map((offset, slotIdx) => ({
      slotIdx,
      side: 'top',
      facingDown: true,
      facingUp: false,
      worldX: anchor.x - BENCH_W / 2 + offset.dx,
      worldY: anchor.y + BENCH_TOP_OFFSET_Y,
      occupiedBy: null,
    })),
    bot: config.slotOffsets.map((offset, slotIdx) => ({
      slotIdx,
      side: 'bot',
      facingDown: false,
      facingUp: true,
      worldX: anchor.x - BENCH_W / 2 + offset.dx,
      worldY: anchor.y + BENCH_BOT_OFFSET_Y,
      occupiedBy: null,
    })),
  }));

  return _seatingState;
}

/**
 * 슬롯을 점유한다.
 * @param {number} tableSetIdx - 테이블 세트 인덱스 (0~2)
 * @param {'top'|'bot'} side - 벤치 위치
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
 * @param {number} tableSetIdx - 테이블 세트 인덱스
 * @param {'top'|'bot'} side - 벤치 위치
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
    for (const side of ['top', 'bot']) {
      for (const slot of set[side]) {
        if (slot.occupiedBy === null) {
          return {
            tableSetIdx: set.tableSetIdx,
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
 * @param {number} tableSetIdx - 테이블 세트 인덱스
 * @param {'top'|'bot'} side - 벤치 위치
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
