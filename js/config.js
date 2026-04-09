/**
 * @fileoverview Kitchen Chaos Defense 전역 설정 상수.
 * 화면 크기, 듀얼 씬 레이아웃, 그리드, 경로 웨이포인트를 정의한다.
 *
 * Phase 2 레이아웃 (360×640):
 *   0~50    HUD (GameScene)
 *   50~370  맵 그리드 (GameScene) — 8행 × 40px = 320px
 *   370~420 타워 선택 바 (GameScene)
 *   420~520 손님 대기존 (RestaurantScene)
 *   520~640 주방 패널 (RestaurantScene)
 */

// ── 화면 크기 ──
export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;

// ── GameScene 레이아웃 ──
export const HUD_HEIGHT = 50;
export const GAME_AREA_Y = HUD_HEIGHT;
export const GAME_AREA_HEIGHT = 320;          // 8행 × 40px
export const TOWER_BAR_Y = HUD_HEIGHT + GAME_AREA_HEIGHT;  // 370
export const TOWER_BAR_HEIGHT = 50;           // 타워 선택 바

// ── RestaurantScene 레이아웃 ──
export const RESTAURANT_Y = 420;              // RestaurantScene 뷰포트 시작
export const RESTAURANT_HEIGHT = 220;         // 420~640
export const CUSTOMER_ZONE_HEIGHT = 100;      // 손님 대기존 (0~100 in scene local)
export const KITCHEN_PANEL_Y = CUSTOMER_ZONE_HEIGHT;  // 100 (scene local)
export const KITCHEN_PANEL_HEIGHT = 120;      // 주방 패널 (100~220 in scene local)

// ── 그리드 ──
export const CELL_SIZE = 40;
export const GRID_COLS = 9;   // 360 / 40 = 9
export const GRID_ROWS = 8;   // 320 / 40 = 8

/**
 * 그리드 좌표 → 월드 픽셀 중심 좌표 변환.
 * @param {number} col
 * @param {number} row
 * @returns {{x: number, y: number}}
 */
export function cellToWorld(col, row) {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: GAME_AREA_Y + row * CELL_SIZE + CELL_SIZE / 2,
  };
}

/**
 * 월드 픽셀 좌표 → 그리드 좌표 변환.
 * @param {number} x
 * @param {number} y
 * @returns {{col: number, row: number}}
 */
export function worldToCell(x, y) {
  return {
    col: Math.floor(x / CELL_SIZE),
    row: Math.floor((y - GAME_AREA_Y) / CELL_SIZE),
  };
}

// ── 경로 웨이포인트 (8행 맞춤, 2턴 지그재그) ──
// 경로: 상단 중앙 진입 → 좌로 → 아래 → 우로 → 주방(하단)
export const PATH_WAYPOINTS = [
  { x: 180, y: GAME_AREA_Y - 10 },   // 화면 위 스폰 지점
  { x: 180, y: GAME_AREA_Y + 2 * CELL_SIZE },  // (col 4, row 2) 아래로 — 130
  { x: 60,  y: GAME_AREA_Y + 2 * CELL_SIZE },  // (col 1, row 2) 왼쪽으로
  { x: 60,  y: GAME_AREA_Y + 5 * CELL_SIZE },  // (col 1, row 5) 아래로 — 250
  { x: 300, y: GAME_AREA_Y + 5 * CELL_SIZE },  // (col 7, row 5) 오른쪽으로
  { x: 300, y: GAME_AREA_Y + 7 * CELL_SIZE },  // (col 7, row 7) 아래로 — 330
  { x: 180, y: GAME_AREA_Y + 7 * CELL_SIZE },  // (col 4, row 7) 왼쪽으로 (중앙)
  { x: 180, y: GAME_AREA_Y + GAME_AREA_HEIGHT + 20 }, // 맵 아래 탈출
];

// ── 경로 셀 집합 (타워 배치 불가 구역) ──
function buildPathCells() {
  const cells = new Set();
  // col=4, rows 0-2 (세로 진입로)
  for (let r = 0; r <= 2; r++) cells.add(`4,${r}`);
  // row=2, cols 1-4 (첫 가로)
  for (let c = 1; c <= 4; c++) cells.add(`${c},2`);
  // col=1, rows 2-5 (두 번째 세로)
  for (let r = 2; r <= 5; r++) cells.add(`1,${r}`);
  // row=5, cols 1-7 (두 번째 가로)
  for (let c = 1; c <= 7; c++) cells.add(`${c},5`);
  // col=7, rows 5-7 (세 번째 세로)
  for (let r = 5; r <= 7; r++) cells.add(`7,${r}`);
  // row=7, cols 4-7 (마지막 가로, 중앙으로)
  for (let c = 4; c <= 7; c++) cells.add(`${c},7`);
  return cells;
}

export const PATH_CELLS = buildPathCells();

/**
 * 해당 그리드 셀이 경로인지 확인.
 * @param {number} col
 * @param {number} row
 * @returns {boolean}
 */
export function isPathCell(col, row) {
  return PATH_CELLS.has(`${col},${row}`);
}

// ── 게임 규칙 상수 ──
export const STARTING_GOLD = 150;
export const STARTING_LIVES = 10;
export const FRESHNESS_WINDOW_MS = 5000;
export const WAVE_CLEAR_BONUS = 15;           // 웨이브 클리어 보너스 골드
export const INGREDIENT_SELL_PRICE = 10;      // 재료 긴급 판매 가격
