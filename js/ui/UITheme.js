/**
 * @fileoverview UI 테마 상수 (Phase 60-2).
 * 9-slice 에셋 카탈로그 참조 키 + 색상/틴트 팔레트를 중앙 집중화한다.
 * 목적:
 *   - 개별 씬이 하드코딩된 프리미티브 색상을 쓰지 않고 이 모듈의 상수를 참조하도록 한다.
 *   - 에셋 키 오타 방지.
 *   - 테마 변경 시 한 파일만 수정.
 *
 * 에셋 카탈로그 출처: kitchen-chaos/assets/ui/nineslice/manifest.json
 */

import { FONT_FAMILY } from '../config.js';

// ─────────────────────────────────────────
// 에셋 키 (nineslice)
// ─────────────────────────────────────────
/**
 * 9-slice 에셋 키. BootScene에서 이 키로 manifest의 각 PNG를 로드한다.
 */
export const NS_KEYS = Object.freeze({
  // 패널
  PANEL_WOOD:            'ui_ns_panel_wood',
  PANEL_PARCHMENT:       'ui_ns_panel_parchment',
  PANEL_DARK:            'ui_ns_panel_dark',
  PANEL_STONE:           'ui_ns_panel_stone',
  PANEL_GLOW_SELECTED:   'ui_ns_panel_glow_selected',

  // 버튼 (primary/secondary/danger × normal/pressed/disabled + icon ×3)
  BTN_PRIMARY_NORMAL:    'ui_ns_btn_primary_normal',
  BTN_PRIMARY_PRESSED:   'ui_ns_btn_primary_pressed',
  BTN_PRIMARY_DISABLED:  'ui_ns_btn_primary_disabled',
  BTN_SECONDARY_NORMAL:  'ui_ns_btn_secondary_normal',
  BTN_SECONDARY_PRESSED: 'ui_ns_btn_secondary_pressed',
  BTN_SECONDARY_DISABLED:'ui_ns_btn_secondary_disabled',
  BTN_DANGER_NORMAL:     'ui_ns_btn_danger_normal',
  BTN_DANGER_PRESSED:    'ui_ns_btn_danger_pressed',
  BTN_DANGER_DISABLED:   'ui_ns_btn_danger_disabled',
  BTN_ICON_NORMAL:       'ui_ns_btn_icon_normal',
  BTN_ICON_PRESSED:      'ui_ns_btn_icon_pressed',
  BTN_ICON_DISABLED:     'ui_ns_btn_icon_disabled',

  // 바
  BAR_FRAME_H:           'ui_ns_bar_frame_h',
  BAR_FRAME_THICK:       'ui_ns_bar_frame_thick',
  BAR_FILL:              'ui_ns_bar_fill',
  BAR_SHINE_OVERLAY:     'ui_ns_bar_shine_overlay',

  // 탭
  TAB_ACTIVE:            'ui_ns_tab_active',
  TAB_INACTIVE:          'ui_ns_tab_inactive',

  // 기타
  TOOLTIP_BG:            'ui_ns_tooltip_bg',
  BADGE_CIRCLE:          'ui_ns_badge_circle',
  DIVIDER_H:             'ui_ns_divider_h',
  DIVIDER_V:             'ui_ns_divider_v',
  LETTERBOX:             'ui_ns_letterbox',
});

/**
 * 매니페스트 키(에셋 파일명 stem) → 씬에서 사용하는 Phaser 텍스처 키 매핑.
 * BootScene preload에서 이 맵을 순회하여 각 PNG를 로드한다.
 */
export const NS_KEY_MAP = Object.freeze({
  panel_wood:            NS_KEYS.PANEL_WOOD,
  panel_parchment:       NS_KEYS.PANEL_PARCHMENT,
  panel_dark:            NS_KEYS.PANEL_DARK,
  panel_stone:           NS_KEYS.PANEL_STONE,
  panel_glow_selected:   NS_KEYS.PANEL_GLOW_SELECTED,

  btn_primary_normal:    NS_KEYS.BTN_PRIMARY_NORMAL,
  btn_primary_pressed:   NS_KEYS.BTN_PRIMARY_PRESSED,
  btn_primary_disabled:  NS_KEYS.BTN_PRIMARY_DISABLED,
  btn_secondary_normal:  NS_KEYS.BTN_SECONDARY_NORMAL,
  btn_secondary_pressed: NS_KEYS.BTN_SECONDARY_PRESSED,
  btn_secondary_disabled:NS_KEYS.BTN_SECONDARY_DISABLED,
  btn_danger_normal:     NS_KEYS.BTN_DANGER_NORMAL,
  btn_danger_pressed:    NS_KEYS.BTN_DANGER_PRESSED,
  btn_danger_disabled:   NS_KEYS.BTN_DANGER_DISABLED,
  btn_icon_normal:       NS_KEYS.BTN_ICON_NORMAL,
  btn_icon_pressed:      NS_KEYS.BTN_ICON_PRESSED,
  btn_icon_disabled:     NS_KEYS.BTN_ICON_DISABLED,

  bar_frame_h:           NS_KEYS.BAR_FRAME_H,
  bar_frame_thick:       NS_KEYS.BAR_FRAME_THICK,
  bar_fill:              NS_KEYS.BAR_FILL,
  bar_shine_overlay:     NS_KEYS.BAR_SHINE_OVERLAY,

  tab_active:            NS_KEYS.TAB_ACTIVE,
  tab_inactive:          NS_KEYS.TAB_INACTIVE,

  tooltip_bg:            NS_KEYS.TOOLTIP_BG,
  badge_circle:          NS_KEYS.BADGE_CIRCLE,
  divider_h:             NS_KEYS.DIVIDER_H,
  divider_v:             NS_KEYS.DIVIDER_V,
  letterbox:             NS_KEYS.LETTERBOX,
});

// ─────────────────────────────────────────
// 색상 팔레트 (파스텔톤, Phase 60-1 승인)
// ─────────────────────────────────────────
/**
 * 게이지 fill, 뱃지 등 tint 가능한 에셋에 적용할 파스텔 색상.
 * 0xRRGGBB (Phaser tint 포맷).
 */
export const TINT = Object.freeze({
  // 게이지 종류별
  HP:        0xf08080, // 코랄 (HP)
  STAMINA:   0xb5e3a8, // 민트 (스태미너)
  GOLD:      0xffd36e, // 골드
  XP:        0x9ccfff, // 스카이 (경험치)
  FRESH:     0xb5e3a8, // 신선도 (민트)
  COOK:      0xffc56e, // 조리 진행 (버터)

  // 강조
  ACCENT:    0xff6b35, // KC 브랜드 오렌지 (강조/링크)
  SELECTED:  0xffd36e, // 선택 글로우

  // 상태
  DANGER:    0xf08080,
  SUCCESS:   0xb5e3a8,
  WARNING:   0xffd36e,
  NEUTRAL:   0xc8c8d0,

  // 기본 (no tint)
  WHITE:     0xffffff,
});

// ─────────────────────────────────────────
// 텍스트 스타일
// ─────────────────────────────────────────
/**
 * 공용 텍스트 스타일 프리셋. Phaser text config로 그대로 넘길 수 있다.
 */
export const TEXT_STYLE = Object.freeze({
  TITLE: {
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#3a2818',
    fontFamily: FONT_FAMILY,
  },
  HEADING: {
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#3a2818',
    fontFamily: FONT_FAMILY,
  },
  BODY: {
    fontSize: '13px',
    color: '#3a2818',
    fontFamily: FONT_FAMILY,
  },
  CAPTION: {
    fontSize: '11px',
    color: '#7a6a5a',
    fontFamily: FONT_FAMILY,
  },
  BUTTON_PRIMARY: {
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#3a2818',
    fontFamily: FONT_FAMILY,
  },
  BUTTON_DANGER: {
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#ffffff',
    fontFamily: FONT_FAMILY,
  },
  BUTTON_DISABLED: {
    fontSize: '14px',
    color: '#8a8a8a',
    fontFamily: FONT_FAMILY,
  },
});

// ─────────────────────────────────────────
// 레이아웃 상수
// ─────────────────────────────────────────
/**
 * 공용 간격/여백. 씬이 자체 스페이싱을 하드코딩하지 않도록 한다.
 */
export const SPACING = Object.freeze({
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  XXL: 32,
});

/**
 * 공용 반경/두께 상수.
 */
export const METRICS = Object.freeze({
  BORDER_RADIUS: 8,
  DIVIDER_THICKNESS: 2,
  BAR_HEIGHT_SM: 8,
  BAR_HEIGHT_MD: 14,
  BAR_HEIGHT_LG: 20,
});
