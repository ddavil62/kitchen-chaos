/**
 * @fileoverview Kitchen Chaos Defense 전역 설정 상수.
 * Phase 3: 아이소메트릭 다이아몬드 그리드, 듀얼 씬 레이아웃.
 *
 * 화면 레이아웃 (360×640):
 *   0~50    HUD (GameScene)
 *   50~370  아이소메트릭 맵 그리드 (GameScene) — 다이아몬드 9×8
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
export const GAME_AREA_HEIGHT = 320;
export const TOWER_BAR_Y = HUD_HEIGHT + GAME_AREA_HEIGHT;  // 370
export const TOWER_BAR_HEIGHT = 50;

// ── RestaurantScene 레이아웃 ──
export const RESTAURANT_Y = 420;
export const RESTAURANT_HEIGHT = 220;
export const CUSTOMER_ZONE_HEIGHT = 100;
export const KITCHEN_PANEL_Y = CUSTOMER_ZONE_HEIGHT;
export const KITCHEN_PANEL_HEIGHT = 120;

// ── 아이소메트릭 그리드 ──
export const GRID_COLS = 9;
export const GRID_ROWS = 8;
export const CELL_W = 48;           // 셀 가로 (다이아몬드 대각선 가로 길이)
export const CELL_H = 24;           // 셀 세로 (다이아몬드 대각선 세로 길이, 2:1 비율)
export const HALF_W = CELL_W / 2;   // 24
export const HALF_H = CELL_H / 2;   // 12

// 아이소메트릭 원점: 다이아몬드 그리드의 (0,0) 셀 중심
// 그리드 가로 범위: ORIGIN_X ± max(cols,rows)*HALF_W → 360px에 꽉 맞춤
export const ORIGIN_X = 168;
export const ORIGIN_Y = 120;

// 하위 호환: 일부 코드에서 CELL_SIZE를 참조할 수 있음
export const CELL_SIZE = CELL_W;

/**
 * 그리드 좌표 → 아이소메트릭 월드 픽셀 중심 좌표 변환.
 * @param {number} col
 * @param {number} row
 * @returns {{x: number, y: number}}
 */
export function cellToWorld(col, row) {
  return {
    x: ORIGIN_X + (col - row) * HALF_W,
    y: ORIGIN_Y + (col + row) * HALF_H,
  };
}

/**
 * 월드 픽셀 좌표 → 그리드 좌표 변환 (아이소메트릭 역변환).
 * @param {number} sx - 화면 x 좌표
 * @param {number} sy - 화면 y 좌표
 * @returns {{col: number, row: number}}
 */
export function worldToCell(sx, sy) {
  const dx = sx - ORIGIN_X;
  const dy = sy - ORIGIN_Y;
  const col = Math.floor((dx / HALF_W + dy / HALF_H) / 2 + 0.5);
  const row = Math.floor((dy / HALF_H - dx / HALF_W) / 2 + 0.5);
  return { col, row };
}

// ── 경로 (아이소메트릭 최적화: col+row 항상 증가 → 화면 아래로만 이동) ──
// 경로: col=1 아래로 → row=3 오른쪽 → col=7 아래로
// col+row: 1→4 → 5→10 → 11→14 (단조 증가)

/** 경로 웨이포인트를 셀 좌표에서 생성 */
function buildWaypoints() {
  const entry = cellToWorld(1, 0);
  const exit = cellToWorld(7, 7);
  return [
    { x: entry.x, y: GAME_AREA_Y - 10 },   // 스폰: 화면 위
    cellToWorld(1, 0),   // 진입
    cellToWorld(1, 3),   // 첫 번째 턴 (아래→오른쪽)
    cellToWorld(7, 3),   // 두 번째 턴 (오른쪽→아래)
    cellToWorld(7, 7),   // 경로 끝
    { x: exit.x, y: GAME_AREA_Y + GAME_AREA_HEIGHT + 20 },  // 탈출: 맵 아래
  ];
}

export const PATH_WAYPOINTS = buildWaypoints();

// ── 경로 셀 집합 (타워 배치 불가 구역) ──
function buildPathCells() {
  const cells = new Set();
  // col=1, rows 0-3 (세로 진입로)
  for (let r = 0; r <= 3; r++) cells.add(`1,${r}`);
  // row=3, cols 1-7 (가로 구간)
  for (let c = 1; c <= 7; c++) cells.add(`${c},3`);
  // col=7, rows 3-7 (세로 출구)
  for (let r = 3; r <= 7; r++) cells.add(`7,${r}`);
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

/**
 * 아이소메트릭 다이아몬드 셀의 4 꼭짓점 좌표.
 * @param {number} col
 * @param {number} row
 * @returns {{top:{x,y}, right:{x,y}, bottom:{x,y}, left:{x,y}}}
 */
export function cellDiamond(col, row) {
  const c = cellToWorld(col, row);
  return {
    top:    { x: c.x,          y: c.y - HALF_H },
    right:  { x: c.x + HALF_W, y: c.y },
    bottom: { x: c.x,          y: c.y + HALF_H },
    left:   { x: c.x - HALF_W, y: c.y },
  };
}

// ── 동적 경로 생성 (스테이지 시스템용) ──

/**
 * pathSegments 배열에서 경로 셀 집합 생성.
 * @param {{ type: string, col?: number, row?: number, rowStart?: number, rowEnd?: number, colStart?: number, colEnd?: number }[]} segments
 * @returns {Set<string>}
 */
export function buildPathCellsFromSegments(segments) {
  const cells = new Set();
  for (const seg of segments) {
    if (seg.type === 'vertical') {
      const step = seg.rowEnd >= seg.rowStart ? 1 : -1;
      for (let r = seg.rowStart; step > 0 ? r <= seg.rowEnd : r >= seg.rowEnd; r += step) {
        cells.add(`${seg.col},${r}`);
      }
    } else if (seg.type === 'horizontal') {
      const step = seg.colEnd >= seg.colStart ? 1 : -1;
      for (let c = seg.colStart; step > 0 ? c <= seg.colEnd : c >= seg.colEnd; c += step) {
        cells.add(`${c},${seg.row}`);
      }
    }
  }
  return cells;
}

/**
 * pathSegments 배열에서 웨이포인트 배열 생성.
 * 스폰/탈출 지점을 맵 위/아래에 자동 추가한다.
 * @param {{ type: string }[]} segments
 * @returns {{x: number, y: number}[]}
 */
export function buildWaypointsFromSegments(segments) {
  if (!segments || segments.length === 0) return PATH_WAYPOINTS;
  const points = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    let startCell, endCell;
    if (seg.type === 'vertical') {
      startCell = { col: seg.col, row: seg.rowStart };
      endCell = { col: seg.col, row: seg.rowEnd };
    } else {
      startCell = { col: seg.colStart, row: seg.row };
      endCell = { col: seg.colEnd, row: seg.row };
    }
    if (i === 0) points.push(cellToWorld(startCell.col, startCell.row));
    points.push(cellToWorld(endCell.col, endCell.row));
  }

  const entry = points[0];
  const exit = points[points.length - 1];
  return [
    { x: entry.x, y: GAME_AREA_Y - 10 },
    ...points,
    { x: exit.x, y: GAME_AREA_Y + GAME_AREA_HEIGHT + 20 },
  ];
}

// ── 게임 규칙 상수 ──
export const STARTING_GOLD = 120;
export const STARTING_LIVES = 15;
export const FRESHNESS_WINDOW_MS = 5000;
export const WAVE_CLEAR_BONUS = 25;
export const INGREDIENT_SELL_PRICE = 10;
