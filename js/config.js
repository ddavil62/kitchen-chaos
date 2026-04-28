/**
 * @fileoverview Kitchen Chaos Tycoon 전역 설정 상수.
 * 화면 크기, 게임 씬 레이아웃, 아이소메트릭 그리드, 경로 유틸리티를 정의한다.
 *
 * Phase 77: ENDLESS_UNLOCK_STAGE 24-6 → 6-6 완화.
 * 화면 레이아웃 (360×640):
 *   0~40    HUD (GatheringScene / EndlessScene)
 *   40~480  아이소메트릭 맵 그리드 — 다이아몬드 9×10, 440px
 *   480~540 도구 선택 바
 *   540~590 재료 수집 현황 바
 *   590~640 웨이브 컨트롤
 */

// ── 화면 크기 ──
export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;

// ── 게임 씬 레이아웃 (GatheringScene / EndlessScene) ──
export const HUD_HEIGHT = 40;
export const GAME_AREA_Y = HUD_HEIGHT;                     // 40
export const GAME_AREA_HEIGHT = 440;                        // 440px (기존 320 → 440)
export const TOWER_BAR_Y = HUD_HEIGHT + GAME_AREA_HEIGHT;  // 480
export const TOWER_BAR_HEIGHT = 60;
export const INGREDIENT_BAR_Y = TOWER_BAR_Y + TOWER_BAR_HEIGHT; // 540
export const INGREDIENT_BAR_HEIGHT = 50;                         // 540~590
export const WAVE_CONTROL_Y = INGREDIENT_BAR_Y + INGREDIENT_BAR_HEIGHT; // 590
export const WAVE_CONTROL_HEIGHT = 50;                                    // 590~640

// ── RestaurantScene / ServiceScene 레이아웃 (KitchenPanelUI, CustomerZoneUI 사용) ──
export const RESTAURANT_Y = 420;
export const RESTAURANT_HEIGHT = 220;
export const CUSTOMER_ZONE_HEIGHT = 100;
export const KITCHEN_PANEL_Y = CUSTOMER_ZONE_HEIGHT;
export const KITCHEN_PANEL_HEIGHT = 120;

// ── 아이소메트릭 그리드 ──
export const GRID_COLS = 9;
export const GRID_ROWS = 10;        // Phase 7 확장: 8 → 10행 (타워 배치 공간 확대)
export const CELL_W = 96;           // 셀 가로 (2x 확대: 48→96)
export const CELL_H = 72;           // 셀 세로 (2x 확대: 36→72)
export const HALF_W = CELL_W / 2;   // 48
export const HALF_H = CELL_H / 2;   // 36

// 아이소메트릭 원점: 다이아몬드 그리드의 (0,0) 셀 중심
// 9×10 그리드, CELL 96×72: 맵이 화면보다 커서 카메라 패닝 필요
// ORIGIN_X=180: 초기 카메라(scrollX=0)가 맵 중앙을 보여준다
export const ORIGIN_X = 180;
export const ORIGIN_Y = 107;

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
    // 세그먼트의 두 끝점 계산
    let ptA, ptB;
    if (seg.type === 'vertical') {
      ptA = cellToWorld(seg.col, seg.rowStart);
      ptB = cellToWorld(seg.col, seg.rowEnd);
    } else {
      ptA = cellToWorld(seg.colStart, seg.row);
      ptB = cellToWorld(seg.colEnd, seg.row);
    }

    if (i === 0) {
      // 첫 세그먼트: ptA가 진입, ptB가 출구
      points.push(ptA);
      points.push(ptB);
    } else {
      // 이전 세그먼트 출구와 가까운 끝을 진입점으로 판정,
      // 반대쪽 끝을 새 웨이포인트로 추가한다.
      // (경로가 꺾여 되돌아오는 구간에서 colStart/colEnd 순서가 역전될 수 있음)
      const prev = points[points.length - 1];
      const dA = (ptA.x - prev.x) ** 2 + (ptA.y - prev.y) ** 2;
      const dB = (ptB.x - prev.x) ** 2 + (ptB.y - prev.y) ** 2;
      points.push(dA <= dB ? ptB : ptA);
    }
  }

  const entry = points[0];
  const exit = points[points.length - 1];
  return [
    { x: entry.x, y: GAME_AREA_Y - 10 },
    ...points,
    { x: exit.x, y: GAME_AREA_Y + GAME_AREA_HEIGHT + 20 },
  ];
}

// ── 앱 버전 (Phase 11-3d) ──
export const APP_VERSION = '1.0.0';

// ── 한글 폰트 베이스라인 보정 (Phase 57-10) ──
// Android Canvas2D에서 한글 ascender가 클리핑되는 현상 방지.
// main.js의 전역 text 팩토리 패치에서 이 값을 padding.top으로 주입한다.
// 측정 기준: Noto Sans KR 기준 ascender clip 최솟값 = 4px.
export const FONT_PADDING_TOP = 4;

// ── GameUI 하단 패널 (Phase 57-5) ──
export const BOTTOM_UI_HEIGHT = 120;   // 하단 고정 패널 높이 (조리소 제외)
export const COOK_PANEL_H    = 130;    // 슬라이드업 조리소 오버레이 높이

// ── 색상 토큰 (Phase 57-1) ──
export const COLORS = {
  bg:        0x1a0a00,
  primary:   0xff6b35,
  accent:    0xffd700,
  danger:    0xff4444,
  divider:   0xffa500,
  textMuted: 0xcccccc,
};

// ── 타입 스케일 (Phase 57-1) ──
export const FONT_SIZE = {
  display: '48px',
  title:   '28px',
  body:    '18px',
  ui:      '16px',
  caption: '14px',
};

// ── 공용 폰트 패밀리 (Phase 67) ──
// 모든 Phaser Text 컴포넌트의 fontFamily는 이 상수를 참조한다.
// 인라인 리터럴 사용 금지 — 폰트 교체 시 이 한 줄만 수정한다.
export const FONT_FAMILY = '"NeoDunggeunmoPro", "Noto Sans KR", sans-serif';

// ── 게임 규칙 상수 ──
export const STARTING_LIVES = 15;       // 라운드 시작 생명 수 (GatheringScene, EndlessScene)
export const FRESHNESS_WINDOW_MS = 5000; // 재료 신선도 유지 시간 (ms) (Enemy, IngredientManager)

// ── Phase 87: 에너지 시스템 상수 ──
export const ENERGY_MAX             = 5;   // 최대 보유 에너지
export const ENERGY_RECHARGE_MINUTES = 30; // 에너지 1개 충전에 필요한 분

// ── Phase 88: 주간 이벤트 풀 ──
/**
 * 7일 주기 이벤트 정의.
 * days: new Date().getDay() 값 배열 (0=일, 1=월, ..., 6=토).
 * @type {Array<{ id: string, nameKo: string, descKo: string, days: number[] }>}
 */
export const WEEKLY_EVENT_POOL = [
  {
    id: 'bonus_gold',
    nameKo: '황금 주방 주간',
    descKo: '영업 수입 +50% 보너스!',
    days: [5, 6, 0],   // 금, 토, 일
  },
  {
    id: 'double_mission',
    nameKo: '미션 더블 위크',
    descKo: '일일 미션 보상 2배!',
    days: [2, 3, 4],   // 화, 수, 목
  },
  {
    id: 'energy_festival',
    nameKo: '에너지 축제',
    descKo: '스테이지 진입 에너지 무료!',
    days: [1],          // 월
  },
];

// ── Phase 69 (P1-4): 엔드리스 해금 조건 상수화 ──
// SaveManager.commitStageResult()가 stageId === ENDLESS_UNLOCK_STAGE && stars > 0에서 해금하므로
// UI 문구도 이 조건과 1:1 일치해야 한다. Phase 77: 24-6 → 6-6 완화.
export const ENDLESS_UNLOCK_STAGE = '6-6';
export const ENDLESS_LOCK_LABEL = `\uD83D\uDD12 \uC5D4\uB4DC\uB9AC\uC2A4 (${ENDLESS_UNLOCK_STAGE} \uD074\uB9AC\uC5B4 \uD544\uC694)`;
