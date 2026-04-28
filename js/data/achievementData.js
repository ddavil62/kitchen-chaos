/**
 * @fileoverview 업적 데이터 정의.
 * Phase 42: 30개 업적 (스토리 10 / 전투 8 / 수집 5 / 경제 5 / 엔드리스 2).
 * Phase 55-4: 엔드리스 업적 4개 추가 (총 34개).
 *
 * 각 업적은 고유 ID, 한국어 이름/설명, 카테고리, 아이콘, 조건, 보상으로 구성된다.
 */

/**
 * 업적 카테고리 정의.
 * @type {Array<{id: string, labelKo: string}>}
 */
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'story', labelKo: '스토리' },
  { id: 'battle', labelKo: '전투' },
  { id: 'collect', labelKo: '수집' },
  { id: 'economy', labelKo: '경제' },
  { id: 'endless', labelKo: '엔드리스' },
];

/**
 * 전체 업적 목록 (34개).
 * @type {Array<{
 *   id: string,
 *   nameKo: string,
 *   descKo: string,
 *   category: 'story'|'battle'|'collect'|'economy'|'endless',
 *   icon: string,
 *   condition: { type: string, threshold: number },
 *   reward: { gold?: number, coin?: number }
 * }>}
 */
export const ACHIEVEMENTS = [
  // ── 스토리 (10개) ──
  {
    id: 'story_first_clear',
    nameKo: '첫 발걸음',
    descKo: '스테이지를 1개 클리어한다',
    category: 'story',
    icon: '\uD83D\uDC63',
    condition: { type: 'stage_cleared', threshold: 1 },
    reward: { coin: 10 },
  },
  {
    id: 'story_chapter1_done',
    nameKo: '1장 완전 정복',
    descKo: '1장 전 스테이지를 클리어한다',
    category: 'story',
    icon: '\uD83D\uDCD6',
    condition: { type: 'stage_cleared', threshold: 6 },
    reward: { coin: 20 },
  },
  {
    id: 'story_chapter6_done',
    nameKo: '그룹1 마스터',
    descKo: '6장까지 전부 클리어한다',
    category: 'story',
    icon: '\uD83C\uDFC5',
    condition: { type: 'chapter_cleared', threshold: 6 },
    reward: { gold: 500 },
  },
  {
    id: 'story_chapter12_done',
    nameKo: '그룹2 마스터',
    descKo: '12장까지 전부 클리어한다',
    category: 'story',
    icon: '\uD83C\uDFC5',
    condition: { type: 'chapter_cleared', threshold: 12 },
    reward: { gold: 1000 },
  },
  {
    id: 'story_chapter18_done',
    nameKo: '그룹3 선봉',
    descKo: '18장까지 전부 클리어한다',
    category: 'story',
    icon: '\uD83C\uDFC5',
    condition: { type: 'chapter_cleared', threshold: 18 },
    reward: { gold: 1500 },
  },
  {
    id: 'story_chapter24_done',
    nameKo: '진정한 셰프',
    descKo: '24장까지 전부 클리어한다',
    category: 'story',
    icon: '\uD83D\uDC68\u200D\uD83C\uDF73',
    condition: { type: 'chapter_cleared', threshold: 24 },
    reward: { gold: 3000 },
  },
  {
    id: 'story_10stars',
    nameKo: '별 수집가',
    descKo: '3성을 10개 달성한다',
    category: 'story',
    icon: '\u2B50',
    condition: { type: 'three_star_count', threshold: 10 },
    reward: { coin: 15 },
  },
  {
    id: 'story_30stars',
    nameKo: '별의 연쇄',
    descKo: '3성을 30개 달성한다',
    category: 'story',
    icon: '\u2B50',
    condition: { type: 'three_star_count', threshold: 30 },
    reward: { coin: 30 },
  },
  {
    id: 'story_50stars',
    nameKo: '퍼펙트 마스터',
    descKo: '3성을 50개 달성한다',
    category: 'story',
    icon: '\uD83C\uDF1F',
    condition: { type: 'three_star_count', threshold: 50 },
    reward: { gold: 800 },
  },
  {
    id: 'story_all_stages',
    nameKo: '완주자',
    descKo: '구현된 모든 스테이지를 클리어한다',
    category: 'story',
    icon: '\uD83C\uDFC1',
    condition: { type: 'stage_cleared', threshold: 100 },
    reward: { gold: 2000 },
  },

  // ── 전투 (8개) ──
  {
    id: 'battle_first_kill',
    nameKo: '첫 번째 희생양',
    descKo: '적을 처음 처치한다',
    category: 'battle',
    icon: '\u2694\uFE0F',
    condition: { type: 'enemy_total_killed', threshold: 1 },
    reward: { coin: 5 },
  },
  {
    id: 'battle_100kills',
    nameKo: '킬 100',
    descKo: '적을 100마리 처치한다',
    category: 'battle',
    // Phase 90-C (C-2): battle_first_kill과 아이콘 중복 해소 (⚔️ → 💥)
    icon: '\uD83D\uDCA5',
    condition: { type: 'enemy_total_killed', threshold: 100 },
    reward: { coin: 10 },
  },
  {
    id: 'battle_500kills',
    nameKo: '킬 500',
    descKo: '적을 500마리 처치한다',
    category: 'battle',
    icon: '\uD83D\uDDE1\uFE0F',
    condition: { type: 'enemy_total_killed', threshold: 500 },
    reward: { gold: 300 },
  },
  {
    id: 'battle_1000kills',
    nameKo: '킬 마스터',
    descKo: '적을 1000마리 처치한다',
    category: 'battle',
    icon: '\uD83D\uDDE1\uFE0F',
    condition: { type: 'enemy_total_killed', threshold: 1000 },
    reward: { gold: 600 },
  },
  {
    id: 'battle_first_boss',
    nameKo: '보스 슬레이어',
    descKo: '보스를 처음 처치한다',
    category: 'battle',
    icon: '\uD83D\uDC32',
    condition: { type: 'boss_killed', threshold: 1 },
    reward: { coin: 15 },
  },
  {
    id: 'battle_5boss',
    nameKo: '보스 헌터',
    descKo: '보스를 5마리 처치한다',
    category: 'battle',
    icon: '\uD83D\uDC32',
    condition: { type: 'boss_killed', threshold: 5 },
    reward: { gold: 400 },
  },
  {
    id: 'battle_13boss',
    nameKo: '전설의 사냥꾼',
    descKo: '모든 보스를 처치한다',
    category: 'battle',
    icon: '\uD83D\uDC51',
    condition: { type: 'boss_killed', threshold: 13 },
    reward: { gold: 1000 },
  },
  {
    id: 'battle_full_deploy',
    nameKo: '완전 무장',
    descKo: '도구를 8종 모두 보유한다',
    category: 'battle',
    icon: '\uD83D\uDEE1\uFE0F',
    condition: { type: 'tool_count_placed', threshold: 8 },
    reward: { coin: 20 },
  },

  // ── 수집 (5개) ──
  {
    id: 'collect_10recipes',
    nameKo: '레시피 입문',
    descKo: '레시피를 10종 해금한다',
    category: 'collect',
    icon: '\uD83D\uDCD2',
    condition: { type: 'recipe_unlocked', threshold: 10 },
    reward: { coin: 10 },
  },
  {
    id: 'collect_50recipes',
    nameKo: '레시피 수집가',
    descKo: '레시피를 50종 해금한다',
    category: 'collect',
    icon: '\uD83D\uDCD2',
    condition: { type: 'recipe_unlocked', threshold: 50 },
    reward: { coin: 20 },
  },
  {
    id: 'collect_100recipes',
    nameKo: '레시피 백과사전',
    descKo: '레시피를 100종 해금한다',
    category: 'collect',
    icon: '\uD83D\uDCDA',
    condition: { type: 'recipe_unlocked', threshold: 100 },
    reward: { gold: 500 },
  },
  {
    id: 'collect_200recipes',
    nameKo: '레시피 마스터',
    descKo: '레시피를 200종 해금한다',
    category: 'collect',
    icon: '\uD83D\uDCDA',
    condition: { type: 'recipe_unlocked', threshold: 200 },
    reward: { gold: 1000 },
  },
  {
    id: 'collect_all_recipes',
    nameKo: '완전한 도감',
    descKo: '레시피 284종을 모두 해금한다',
    category: 'collect',
    icon: '\uD83C\uDFC6',
    condition: { type: 'recipe_unlocked', threshold: 284 },
    reward: { gold: 3000 },
  },

  // ── 경제 (5개) ──
  {
    id: 'econ_gold1000',
    nameKo: '소규모 사업가',
    descKo: '골드를 1000 이상 획득한다',
    category: 'economy',
    icon: '\uD83D\uDCB0',
    condition: { type: 'total_gold_earned', threshold: 1000 },
    reward: { coin: 10 },
  },
  {
    id: 'econ_gold10000',
    nameKo: '레스토랑 사장',
    descKo: '골드를 10000 이상 획득한다',
    category: 'economy',
    icon: '\uD83D\uDCB0',
    condition: { type: 'total_gold_earned', threshold: 10000 },
    reward: { coin: 20 },
  },
  {
    id: 'econ_gold50000',
    nameKo: '요식업 재벌',
    descKo: '골드를 50000 이상 획득한다',
    category: 'economy',
    icon: '\uD83D\uDCB0',
    condition: { type: 'total_gold_earned', threshold: 50000 },
    reward: { gold: 500 },
  },
  {
    id: 'econ_full_staff',
    nameKo: '완벽한 팀',
    descKo: '직원 2명을 모두 고용한다',
    category: 'economy',
    icon: '\uD83D\uDC65',
    condition: { type: 'staff_hired', threshold: 2 },
    reward: { coin: 15 },
  },
  {
    id: 'econ_max_interior',
    nameKo: '인테리어 장인',
    descKo: '인테리어 항목 3개를 모두 Lv5로 올린다',
    category: 'economy',
    icon: '\uD83C\uDFE0',
    condition: { type: 'interior_maxed', threshold: 3 },
    reward: { gold: 600 },
  },

  // ── 엔드리스 (6개) ──
  {
    id: 'endless_wave20',
    nameKo: '생존자',
    descKo: '엔드리스 모드에서 20웨이브에 도달한다',
    category: 'endless',
    icon: '\u221E',
    condition: { type: 'endless_wave', threshold: 20 },
    reward: { coin: 20 },
  },
  {
    id: 'endless_wave50',
    nameKo: '끝없는 도전',
    descKo: '엔드리스 모드에서 50웨이브에 도달한다',
    category: 'endless',
    icon: '\u221E',
    condition: { type: 'endless_wave', threshold: 50 },
    reward: { gold: 1000 },
  },
  {
    id: 'endless_wave100',
    nameKo: '식란 정복자',
    descKo: '엔드리스 모드에서 100웨이브에 도달한다',
    category: 'endless',
    icon: '\uD83D\uDC51',
    condition: { type: 'endless_wave', threshold: 100 },
    reward: { gold: 3000 },
  },
  {
    id: 'endless_storm10',
    nameKo: '폭풍의 화신',
    descKo: '미력 폭풍의 눈을 10회 클리어한다',
    category: 'endless',
    icon: '\uD83C\uDF00',
    condition: { type: 'endless_storm_cleared', threshold: 10 },
    reward: { coin: 30 },
  },
  {
    id: 'endless_mission30',
    nameKo: '임무의 달인',
    descKo: '끝없는 정화 임무를 30회 성공한다',
    category: 'endless',
    icon: '\uD83D\uDCCB',
    condition: { type: 'endless_mission_success', threshold: 30 },
    reward: { mireukEssence: 50 },
  },
  {
    id: 'endless_no_leak10',
    nameKo: '무결 방어',
    descKo: '라이프 손실 없이 10웨이브를 연속으로 클리어한다',
    category: 'endless',
    icon: '\uD83D\uDEE1\uFE0F',
    condition: { type: 'endless_no_leak_streak', threshold: 10 },
    reward: { gold: 2000 },
  },
];

/**
 * 카테고리별 업적 필터 헬퍼.
 * @param {string} category - 카테고리 ID
 * @returns {Array} 해당 카테고리 업적 목록
 */
export function getByCategory(category) {
  return ACHIEVEMENTS.filter(a => a.category === category);
}
