/**
 * @fileoverview 손님 NPC 프로필 데이터. 10종 프로필 정의. Phase 76.
 * 기존 5종(normal/vip/gourmet/rushed/group) + 신규 5종(critic/regular/student/traveler/business).
 * mireuk_traveler는 별도 독립 시스템으로 여기에 포함하지 않는다 (Phase 51-1 보존).
 */

/**
 * @typedef {Object} CustomerProfile
 * @property {string} id - 프로필 고유 ID (스프라이트 키 접두어로도 사용)
 * @property {string} nameKo - 한국어 손님 유형명
 * @property {number} patienceMult - 기본 인내심 배율 (1.0 기준)
 * @property {'generous'|'standard'|'stingy'} tipStyle - 팁 성향
 * @property {string|null} preferredGenre - 선호 요리 장르 (속성만 정의, UI 반영은 후속)
 * @property {string} spriteKey - SpriteLoader 키 접두어 (customer_{spriteKey}_{state})
 * @property {string} icon - 이모지 폴백 아이콘
 * @property {string} description - 한국어 설명 (툴팁 등 후속 사용)
 */

/** @type {CustomerProfile[]} 10종 프로필 정의 */
export const CUSTOMER_PROFILES = [
  // ── 기존 5종 (1:1 매핑) ──
  {
    id: 'normal',
    nameKo: '일반 손님',
    patienceMult: 1.0,
    tipStyle: 'standard',
    preferredGenre: null,
    spriteKey: 'normal',
    icon: '\uD83D\uDE0A',  // 😊
    description: '평범한 손님. 특별한 선호나 성향 없이 고르게 주문한다.',
  },
  {
    id: 'vip',
    nameKo: 'VIP 손님',
    patienceMult: 0.7,
    tipStyle: 'generous',
    preferredGenre: null,
    spriteKey: 'vip',
    icon: '\uD83D\uDC51',  // 👑
    description: '특별한 대접을 기대하는 VIP. 인내심은 적지만 보상이 크다.',
  },
  {
    id: 'gourmet',
    nameKo: '미식가',
    patienceMult: 1.0,
    tipStyle: 'generous',
    preferredGenre: 'high_tier',
    spriteKey: 'gourmet',
    icon: '\uD83E\uDDD0',  // 🧐
    description: '고등급 레시피만 주문하는 미식가. 서빙 성공 시 만족도 +5%.',
  },
  {
    id: 'rushed',
    nameKo: '급한 손님',
    patienceMult: 0.4,
    tipStyle: 'stingy',
    preferredGenre: null,
    spriteKey: 'rushed',
    icon: '\uD83D\uDE30',  // 😰
    description: '매우 급한 손님. 빠르게 서빙하지 않으면 만족도 큰 하락.',
  },
  {
    id: 'group',
    nameKo: '단체 손님',
    patienceMult: 1.2,
    tipStyle: 'standard',
    preferredGenre: null,
    spriteKey: 'group',
    icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66', // 👨‍👩‍👧‍👦
    description: '테이블 2석을 점유하는 단체 손님. 인내심을 공유한다.',
  },

  // ── 신규 5종 (Phase 76) ──
  {
    id: 'critic',
    nameKo: '평론가',
    patienceMult: 1.3,
    tipStyle: 'stingy',
    preferredGenre: 'high_tier',
    spriteKey: 'critic',
    icon: '\uD83D\uDCDD',  // 📝
    description: '음식 평론가. patienceRatio를 누적하여 평균 0.7 미만 시 혹평 패널티.',
  },
  {
    id: 'regular',
    nameKo: '단골 손님',
    patienceMult: 1.1,
    tipStyle: 'generous',
    preferredGenre: null,
    spriteKey: 'regular',
    icon: '\uD83C\uDFE0',  // 🏠
    description: '자주 찾아오는 단골. 5회 서빙 누적 시 팁 +20% 버프.',
  },
  {
    id: 'student',
    nameKo: '학생',
    patienceMult: 0.9,
    tipStyle: 'stingy',
    preferredGenre: null,
    spriteKey: 'student',
    icon: '\uD83C\uDF92',  // 🎒
    description: '저예산 학생. 팁은 인색하지만 저등급 레시피를 우선 주문한다.',
  },
  {
    id: 'traveler',
    nameKo: '여행객',
    patienceMult: 1.4,
    tipStyle: 'standard',
    preferredGenre: 'regional',
    spriteKey: 'traveler',
    icon: '\uD83E\uDDF3',  // 🧳
    description: '여유로운 여행객. 지역 특산 요리를 선호한다.',
  },
  {
    id: 'business',
    nameKo: '비즈니스맨',
    patienceMult: 0.6,
    tipStyle: 'generous',
    preferredGenre: null,
    spriteKey: 'business',
    icon: '\uD83D\uDCBC',  // 💼
    description: '매우 급하지만 팁은 후한 고소득 직장인.',
  },
];

/** @type {Map<string, CustomerProfile>} ID로 프로필을 빠르게 조회하는 맵 */
export const CUSTOMER_PROFILE_MAP = new Map(
  CUSTOMER_PROFILES.map(p => [p.id, p])
);

/**
 * profileId로 프로필을 조회한다. 없으면 normal 프로필을 반환한다.
 * @param {string} profileId
 * @returns {CustomerProfile}
 */
export function getCustomerProfile(profileId) {
  return CUSTOMER_PROFILE_MAP.get(profileId) ?? CUSTOMER_PROFILE_MAP.get('normal');
}
