/**
 * @fileoverview Kitchen Chaos Defense 전역 설정 상수.
 * 화면 크기, 그리드, 경로 웨이포인트를 정의한다.
 */

// ── 화면 크기 ──
export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;

// ── 레이아웃 영역 ──
export const HUD_HEIGHT = 50;      // 상단 HUD (골드/웨이브/목숨)
export const BOTTOM_UI_HEIGHT = 120; // 하단 UI (타워 선택 + 재료창 + 조리소)
export const GAME_AREA_Y = HUD_HEIGHT;
export const GAME_AREA_HEIGHT = GAME_HEIGHT - HUD_HEIGHT - BOTTOM_UI_HEIGHT; // 470px

// ── 그리드 ──
export const CELL_SIZE = 40;
export const GRID_COLS = 9;  // 360 / 40 = 9
export const GRID_ROWS = Math.floor(GAME_AREA_HEIGHT / CELL_SIZE); // 11 rows (440px)

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

// ── 경로 웨이포인트 (픽셀 좌표, 적이 이동하는 순서) ──
// 경로: 상단 중앙 진입 → 좌로 → 아래 → 우로 → 아래 → 좌로 → 주방(하단)
export const PATH_WAYPOINTS = [
  { x: 180, y: -10 },   // 화면 위 스폰 지점
  { x: 180, y: 150 },   // (col 4, row 2) 아래로
  { x: 60,  y: 150 },   // (col 1, row 2) 왼쪽으로
  { x: 60,  y: 270 },   // (col 1, row 5) 아래로
  { x: 300, y: 270 },   // (col 7, row 5) 오른쪽으로
  { x: 300, y: 390 },   // (col 7, row 8) 아래로
  { x: 60,  y: 390 },   // (col 1, row 8) 왼쪽으로
  { x: 60,  y: 510 },   // (col 1, row 11) → 주방 방향 (화면 밖)
];

// ── 경로 셀 집합 (타워 배치 불가 구역) ──
// 경로 위 그리드 셀을 Set<'col,row'>으로 관리
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
  // col=7, rows 5-8 (세 번째 세로)
  for (let r = 5; r <= 8; r++) cells.add(`7,${r}`);
  // row=8, cols 1-7 (세 번째 가로)
  for (let c = 1; c <= 7; c++) cells.add(`${c},8`);
  // col=1, rows 8-10 (마지막 세로, 주방 방향)
  for (let r = 8; r <= 10; r++) cells.add(`1,${r}`);
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
export const FRESHNESS_WINDOW_MS = 5000; // 신선 보너스 유효 시간 (ms)
