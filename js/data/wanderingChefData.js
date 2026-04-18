/**
 * @fileoverview 유랑 미력사 (流浪 美力師) 데이터 정의.
 * Phase 51-2: 8명 미력사의 ID, 등급, 스킬 유형, 단계별 수치, 고용/강화 비용 정의.
 * 기획 출처: docs/WANDERING_CHEFS_SYSTEM.md, docs/MIREUK_ESSENCE_ECONOMY.md
 */

/**
 * 등급 코드 -> 비용 테이블 매핑.
 * grade: 1=초급, 2=중급, 3=고급, 4=전설
 */
export const GRADE_COSTS = {
  1: { hire: 4,  rehire: 2,  upgrade1to2: 3,  upgrade2to3: 6  },
  2: { hire: 12, rehire: 6,  upgrade1to2: 10, upgrade2to3: 20 },
  3: { hire: 35, rehire: 18, upgrade1to2: 30, upgrade2to3: 60 },
  4: { hire: 80, rehire: 40, upgrade1to2: 70, upgrade2to3: 140 },
};

/**
 * 등급 코드 -> 한국어 명칭 매핑.
 */
export const GRADE_NAMES = {
  1: '초급 미력사',
  2: '중급 미력사',
  3: '고급 미력사',
  4: '전설 미력사',
};

/**
 * 등급 코드 -> 카드 강조 색상 (hex).
 */
export const GRADE_COLORS = {
  1: 0x888888,   // 회색 -- 초급
  2: 0x4488cc,   // 파랑 -- 중급
  3: 0xaa6622,   // 황금 -- 고급
  4: 0x9933cc,   // 보라 -- 전설
};

/**
 * @typedef {object} WanderingChefDef
 * @property {string}   id           - 고유 ID (예: 'wanderer_haruka')
 * @property {string}   nameKo       - 한국어 이름
 * @property {string}   title        - 칭호
 * @property {number}   grade        - 등급 (1~4)
 * @property {string}   icon         - 이모지 폴백 아이콘
 * @property {string}   unlockStage  - 해금 조건 스테이지 ID ('' = 기본 해금)
 * @property {string}   skillName    - 스킬명
 * @property {string}   skillType    - 스킬 유형 코드 (아래 참조)
 * @property {number[]} skillValues  - [1단계, 2단계, 3단계] 수치 배열 (비율은 0.0~1.0)
 * @property {number[]} skillValues2 - 스킬에 보조 수치가 있을 때 사용 (예: 레이라 보상 배율)
 */

/**
 * skillType 코드 설명:
 *   'patience_pct'      -- 인내심 배율 % 증가 (하루카)
 *   'cook_time_reduce'  -- 조리 시간 감소율 (보태)
 *   'gourmet_rate'      -- 미식가 등장 확률 증가 + 보상 배율 (레이라)
 *   'serve_speed'       -- 서빙 처리 속도 증가 (무오)
 *   'early_session_bonus' -- 세션 초반 N초간 보상 증가 (시엔)
 *   'ingredient_refund' -- 조리 실패 시 재료 회수율 (아이다)
 *   'vip_rate'          -- VIP 등장 확률 배율 + 보상 증가 (로살리오)
 *   'chain_serve'       -- 연쇄 서빙 퇴장 방지 (요코, Optional)
 */

/** @type {WanderingChefDef[]} */
export const WANDERING_CHEFS = [
  // ── 초급 ──────────────────────────────────────────────────────────────────

  {
    id:           'wanderer_haruka',
    nameKo:       '하루카',
    title:        '봄날의 서빙꾼',
    grade:        1,
    icon:         '\uD83C\uDF38', // 🌸
    unlockStage:  '7-1',
    skillName:    '친절 미소',
    skillType:    'patience_pct',
    // [1단계, 2단계, 3단계] 인내심 증가율 (0.20 = +20%)
    skillValues:  [0.20, 0.30, 0.40],
    // 3단계 추가: 급한 손님(rushed) 인내심 별도 +15%
    skillValues2: [0, 0, 0.15],
  },

  {
    id:           'wanderer_botae',
    nameKo:       '보태',
    title:        '느긋한 국수꾼',
    grade:        1,
    icon:         '\uD83C\uDF5C', // 🍜
    unlockStage:  '7-1',
    skillName:    '여유 분위기',
    skillType:    'cook_time_reduce',
    // [1단계, 2단계, 3단계] 조리 시간 감소율
    skillValues:  [0.10, 0.18, 0.25],
    // 3단계 추가: 2연속 서빙 성공 후 다음 조리 추가 -10% (콤보 보너스)
    // -> ServiceScene에서 comboCount 기반으로 처리
    skillValues2: [0, 0, 0.10],
  },

  // ── 중급 ──────────────────────────────────────────────────────────────────

  {
    id:           'wanderer_leila',
    nameKo:       '레이라',
    title:        '사막의 향신료 상인',
    grade:        2,
    icon:         '\uD83C\uDFFA', // 🏺
    unlockStage:  '9-3',
    skillName:    '이국의 풍미',
    skillType:    'gourmet_rate',
    // [1단계, 2단계, 3단계] 미식가 등장 확률 증가 (절대값, 현재 확률에 더함)
    skillValues:  [0.12, 0.20, 0.20],
    // [1단계, 2단계, 3단계] 미식가 보상 배율 증가
    skillValues2: [0.20, 0.35, 0.50],
  },

  {
    id:           'wanderer_muo',
    nameKo:       '무오',
    title:        '서빙의 창술사',
    grade:        2,
    icon:         '\u2694\uFE0F', // ⚔️
    unlockStage:  '10-3',
    skillName:    '창식 서빙',
    skillType:    'serve_speed',
    // [1단계, 2단계, 3단계] 서빙 처리 속도 증가율
    skillValues:  [0.25, 0.40, 0.40],
    // 3단계 추가: 첫 서빙 인내심 80% 보장 플래그 (Boolean)
    skillValues2: [0, 0, 1],
  },

  {
    id:           'wanderer_sien',
    nameKo:       '시엔',
    title:        '단골 부르는 요리사',
    grade:        2,
    icon:         '\uD83E\uDD17', // 🤗
    unlockStage:  '12-3',
    skillName:    '단골 확보',
    skillType:    'early_session_bonus',
    // [1단계, 2단계, 3단계] 세션 초반 보상 증가율
    skillValues:  [0.30, 0.45, 0.60],
    // [1단계, 2단계, 3단계] 효과 지속 시간 (초)
    skillValues2: [30, 45, 60],
  },

  // ── 고급 ──────────────────────────────────────────────────────────────────

  {
    id:           'wanderer_aida',
    nameKo:       '아이다',
    title:        '실패를 씻는 설빙사',
    grade:        3,
    icon:         '\u2744\uFE0F', // ❄️
    unlockStage:  '15-3',
    skillName:    '결정 환불',
    skillType:    'ingredient_refund',
    // [1단계, 2단계, 3단계] 실패 시 재료 회수율 (0.50 = 50%)
    skillValues:  [0.50, 0.70, 1.00],
    // 3단계 추가: 실패 후 다음 조리 딜레이 없음 플래그 (Boolean)
    skillValues2: [0, 0, 1],
  },

  {
    id:           'wanderer_rosario',
    nameKo:       '로살리오',
    title:        'VIP를 부르는 미력사',
    grade:        3,
    icon:         '\uD83D\uDC51', // 👑
    unlockStage:  '18-3',
    skillName:    '귀족의 향연',
    skillType:    'vip_rate',
    // [1단계, 2단계, 3단계] VIP 등장 확률 배율 (x2 = 기존 확률의 2배)
    skillValues:  [2.0, 2.5, 2.5],
    // [1단계, 2단계, 3단계] VIP 보상 배율 증가
    skillValues2: [0.25, 0.40, 0.40],
    // 3단계 추가: VIP 서빙 완료 시 food_review 이벤트 확률 +30%
    // -> ServiceScene에서 로살리오 레벨 3 여부를 별도 플래그로 처리
  },

  // ── 전설 ──────────────────────────────────────────────────────────────────

  {
    id:           'wanderer_yoko',
    nameKo:       '요코',
    title:        '폭풍 속의 서빙 신',
    grade:        4,
    icon:         '\u26A1', // ⚡
    unlockStage:  '24-3',
    skillName:    '연쇄 폭풍 서빙',
    skillType:    'chain_serve',
    // [1단계, 2단계, 3단계] 연속 서빙 달성 기준 수 (이 횟수 연속 시 퇴장 방지 1회)
    skillValues:  [3, 2, 2],
    // [1단계, 2단계, 3단계] 퇴장 방지 발동 시 보상 증가 (3단계만 적용)
    skillValues2: [0, 0, 0.50],
  },
];

/**
 * ID로 미력사 정의를 조회한다.
 * @param {string} id
 * @returns {WanderingChefDef|undefined}
 */
export function getWanderingChefById(id) {
  return WANDERING_CHEFS.find(c => c.id === id);
}
