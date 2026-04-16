/**
 * @fileoverview 레시피 컬렉션 데이터.
 * Phase 10: 스타터 12종 + Phase 5 12종 + Phase 6 18종 + Phase 8 24종 + Phase 9 23종 + Phase 10 17종 = 106종.
 * Phase 20: + 서빙 8종 + 버프 2종 = 116종 (7장 사쿠라 이자카야).
 * Phase 21: + 서빙 8종 + 버프 2종 = 126종 (8장 용의 주방).
 * Phase 22-3: + 서빙 8종 + 버프 2종 = 136종 (8장 이자카야 심층부).
 * Phase 25-1: + 서빙 8종 + 버프 2종 = 146종 (11장 용의 주방 심층부).
 * Phase 26-1: + 서빙 8종 + 버프 2종 = 156종 (12장 용의 궁전 결전).
 * Phase 27-3: + 서빙 8종 + 버프 2종 = 166종 (13장 별빛 비스트로).
 * Phase 29-2: + 서빙 16종 + 버프 4종 = 186종 (15장 카타콩브).
 * Phase 31-3: + 서빙 13종 + 버프 2종 = 201종 (16장 향신료 궁전).
 * Phase 32-3: + 서빙 10종 + 버프 2종 = 213종 (17장 향신료 궁전 심층부).
 * Phase 32-5: + 서빙 7종 + 버프 1종 = 221종 (18장 향신료 궁전 최심부).
 * Phase 33-3: + 서빙 8종 + customers 전용 2종 + 버프 2종 = 233종 (19장 선인장 칸티나).
 * Phase 34-3: + 서빙 8종 + customers 전용 1종 + 버프 2종 = 244종 (20장 칸티나 심층부).
 * Phase 35-3: + 서빙 8종 + 버프 2종 = 254종 (21장 엘 디아블로 최종전).
 * Phase 36-3: + 서빙 8종 + 버프 2종 = 264종 (22장 슈가 드림랜드).
 * Phase 37-2: + 서빙 8종 + 버프 2종 = 274종 (23장 드림랜드 심층부).
 *
 * - starter: true인 레시피는 항상 해금 상태 (코인 불필요)
 * - gateStage: 해당 스테이지 클리어 후 상점에 출현
 * - category: 수프, 구이, 볶음, 면파스타, 디저트, 특선, 버프
 * - tier: 1~5 (★ ~ ★★★★★)
 */

// ── 카테고리 정의 ──
export const RECIPE_CATEGORIES = [
  { id: 'all', nameKo: '전체', icon: '📋' },
  { id: 'soup', nameKo: '수프', icon: '🍲' },
  { id: 'grill', nameKo: '구이', icon: '🥩' },
  { id: 'fry', nameKo: '볶음', icon: '🍳' },
  { id: 'noodle', nameKo: '면', icon: '🍝' },
  { id: 'dessert', nameKo: '디저트', icon: '🍰' },
  { id: 'special', nameKo: '특선', icon: '🌟' },
  { id: 'buff', nameKo: '버프', icon: '✨' },
];

// ── 등급별 테두리 색상 ──
export const TIER_COLORS = {
  1: 0xcccccc,  // 흰색
  2: 0x44cc44,  // 초록
  3: 0x4488ff,  // 파랑
  4: 0xaa44ff,  // 보라
  5: 0xffd700,  // 금색
};

export const TIER_NAMES = {
  1: '★',
  2: '★★',
  3: '★★★',
  4: '★★★★',
  5: '★★★★★',
};

// ── 전체 레시피 목록 ──

/**
 * 서빙 레시피 전체 목록.
 * @type {Array<{
 *   id: string, nameKo: string, icon: string, category: string,
 *   tier: number, ingredients: Object<string, number>,
 *   baseReward: number, cookTime: number, unlockCost: number,
 *   starter?: boolean, gateStage?: string
 * }>}
 */
export const ALL_SERVING_RECIPES = [
  // ── 스타터 6종 (Phase 3~4 기존, 항상 해금) ──
  {
    id: 'carrot_soup', nameKo: '당근 수프', icon: '🍲', category: 'soup',
    tier: 1, ingredients: { carrot: 1 }, baseReward: 20, cookTime: 3000,
    unlockCost: 0, starter: true,
  },
  {
    id: 'steak_plate', nameKo: '스테이크 정식', icon: '🥩', category: 'grill',
    tier: 2, ingredients: { meat: 2 }, baseReward: 50, cookTime: 6000,
    unlockCost: 0, starter: true,
  },
  {
    id: 'mixed_platter', nameKo: '혼합 플래터', icon: '🍽️', category: 'special',
    tier: 2, ingredients: { carrot: 2, meat: 1 }, baseReward: 65, cookTime: 8000,
    unlockCost: 0, starter: true,
  },
  {
    id: 'seafood_pasta', nameKo: '해산물 파스타', icon: '🍝', category: 'noodle',
    tier: 2, ingredients: { squid: 1, flour: 1 }, baseReward: 55, cookTime: 7000,
    unlockCost: 0, starter: true,
  },
  {
    id: 'spicy_stir_fry', nameKo: '매운 볶음', icon: '🍳', category: 'fry',
    tier: 2, ingredients: { pepper: 1, meat: 1 }, baseReward: 45, cookTime: 5000,
    unlockCost: 0, starter: true,
  },
  {
    id: 'cheese_fondue', nameKo: '치즈 퐁뒤', icon: '🧀', category: 'special',
    tier: 2, ingredients: { flour: 2, carrot: 1 }, baseReward: 60, cookTime: 9000,
    unlockCost: 0, starter: true,
  },

  // ── Phase 5 신규 서빙 10종 ──
  {
    id: 'egg_soup', nameKo: '달걀국', icon: '🍲', category: 'soup',
    tier: 1, ingredients: { egg: 1 }, baseReward: 18, cookTime: 2000,
    unlockCost: 10,
  },
  {
    id: 'fried_rice', nameKo: '볶음밥', icon: '🍳', category: 'fry',
    tier: 1, ingredients: { rice: 1, egg: 1 }, baseReward: 28, cookTime: 3000,
    unlockCost: 15,
  },
  {
    id: 'rice_ball', nameKo: '주먹밥', icon: '🍙', category: 'special',
    tier: 1, ingredients: { rice: 2 }, baseReward: 22, cookTime: 2000,
    unlockCost: 12,
  },
  {
    id: 'egg_steak', nameKo: '에그 스테이크', icon: '🥩', category: 'grill',
    tier: 2, ingredients: { egg: 1, meat: 1 }, baseReward: 42, cookTime: 5000,
    unlockCost: 30,
  },
  {
    id: 'squid_rice', nameKo: '오징어덮밥', icon: '🍚', category: 'noodle',
    tier: 2, ingredients: { squid: 1, rice: 1 }, baseReward: 45, cookTime: 5000,
    unlockCost: 35,
  },
  {
    id: 'spicy_rice_cake', nameKo: '떡볶이', icon: '🌶️', category: 'fry',
    tier: 2, ingredients: { rice: 1, pepper: 1 }, baseReward: 38, cookTime: 4000,
    unlockCost: 25,
  },
  {
    id: 'egg_pasta', nameKo: '에그 파스타', icon: '🍝', category: 'noodle',
    tier: 2, ingredients: { egg: 1, flour: 1 }, baseReward: 40, cookTime: 5000,
    unlockCost: 30,
  },
  {
    id: 'omurice', nameKo: '오므라이스', icon: '🍳', category: 'special',
    tier: 3, ingredients: { egg: 2, rice: 1 }, baseReward: 62, cookTime: 7000,
    unlockCost: 55, gateStage: '1-3',
  },
  {
    id: 'royal_stew', nameKo: '로얄 스튜', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { meat: 1, carrot: 1, egg: 1 }, baseReward: 75, cookTime: 7000,
    unlockCost: 70, gateStage: '1-5',
  },
  {
    id: 'grand_platter', nameKo: '그랜드 플래터', icon: '🍽️', category: 'special',
    tier: 3, ingredients: { meat: 1, rice: 1, squid: 1 }, baseReward: 85, cookTime: 8000,
    unlockCost: 80, gateStage: '1-5',
  },

  // ── Phase 6 신규 서빙 15종 ──
  {
    id: 'mushroom_soup', nameKo: '버섯 수프', icon: '🍲', category: 'soup',
    tier: 1, ingredients: { mushroom: 1 }, baseReward: 20, cookTime: 2000,
    unlockCost: 10,
  },
  {
    id: 'grilled_fish', nameKo: '구운 생선', icon: '🐟', category: 'grill',
    tier: 1, ingredients: { fish: 1 }, baseReward: 22, cookTime: 3000,
    unlockCost: 12,
  },
  {
    id: 'cheese_toast', nameKo: '치즈 토스트', icon: '🧀', category: 'fry',
    tier: 1, ingredients: { cheese: 1, flour: 1 }, baseReward: 25, cookTime: 3000,
    unlockCost: 14,
  },
  {
    id: 'fish_and_chips', nameKo: '피시앤칩스', icon: '🍳', category: 'fry',
    tier: 2, ingredients: { fish: 1, flour: 1 }, baseReward: 40, cookTime: 5000,
    unlockCost: 30,
  },
  {
    id: 'fish_sushi', nameKo: '생선초밥', icon: '🍣', category: 'special',
    tier: 2, ingredients: { fish: 1, rice: 1 }, baseReward: 45, cookTime: 5000,
    unlockCost: 35,
  },
  {
    id: 'mushroom_risotto', nameKo: '버섯 리조또', icon: '🍚', category: 'noodle',
    tier: 2, ingredients: { mushroom: 1, rice: 1 }, baseReward: 42, cookTime: 5000,
    unlockCost: 32,
  },
  {
    id: 'cheese_omelette', nameKo: '치즈 오믈렛', icon: '🧀', category: 'fry',
    tier: 2, ingredients: { cheese: 1, egg: 1 }, baseReward: 38, cookTime: 4000,
    unlockCost: 28,
  },
  {
    id: 'mushroom_steak', nameKo: '버섯 스테이크', icon: '🥩', category: 'grill',
    tier: 2, ingredients: { mushroom: 1, meat: 1 }, baseReward: 48, cookTime: 6000,
    unlockCost: 38, gateStage: '1-6',
  },
  {
    id: 'cheese_gratin', nameKo: '치즈 그라탱', icon: '🧀', category: 'special',
    tier: 2, ingredients: { cheese: 1, flour: 1, carrot: 1 }, baseReward: 55, cookTime: 6000,
    unlockCost: 42, gateStage: '1-6',
  },
  {
    id: 'seafood_gratin', nameKo: '해산물 그라탕', icon: '🍲', category: 'special',
    tier: 3, ingredients: { fish: 1, squid: 1, cheese: 1 }, baseReward: 72, cookTime: 7000,
    unlockCost: 60, gateStage: '2-1',
  },
  {
    id: 'mushroom_cream', nameKo: '버섯 크림 스튜', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { mushroom: 2, flour: 1 }, baseReward: 68, cookTime: 7000,
    unlockCost: 55, gateStage: '2-1',
  },
  {
    id: 'cheese_fondue_dx', nameKo: '치즈 퐁뒤 그라탱', icon: '🧀', category: 'special',
    tier: 3, ingredients: { cheese: 2, meat: 1 }, baseReward: 78, cookTime: 8000,
    unlockCost: 65, gateStage: '2-2',
  },
  {
    id: 'fish_hot_pot', nameKo: '생선 전골', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { fish: 1, mushroom: 1, pepper: 1 }, baseReward: 80, cookTime: 8000,
    unlockCost: 70, gateStage: '2-2',
  },
  {
    id: 'sashimi_platter', nameKo: '모듬 회', icon: '🍣', category: 'special',
    tier: 3, ingredients: { fish: 2, squid: 1 }, baseReward: 82, cookTime: 8000,
    unlockCost: 72, gateStage: '2-2',
  },
  {
    id: 'full_course_seafood', nameKo: '풀코스 해산물', icon: '🌟', category: 'special',
    tier: 4, ingredients: { fish: 1, squid: 1, cheese: 1, mushroom: 1 }, baseReward: 120, cookTime: 10000,
    unlockCost: 130, gateStage: '2-3',
  },

  // ── Phase 8 신규 서빙 20종 (3장: 바닷가 씨푸드 바) ──

  // ★ 1성 (4종)
  {
    id: 'shrimp_tempura', nameKo: '새우튀김', icon: '🦐', category: 'grill',
    tier: 1, ingredients: { shrimp: 1 }, baseReward: 22, cookTime: 3000,
    unlockCost: 12, gateStage: '3-1',
  },
  {
    id: 'tomato_soup', nameKo: '토마토 수프', icon: '🍅', category: 'soup',
    tier: 1, ingredients: { tomato: 1 }, baseReward: 20, cookTime: 3000,
    unlockCost: 10, gateStage: '3-1',
  },
  {
    id: 'butter_toast', nameKo: '버터 토스트', icon: '🧈', category: 'dessert',
    tier: 1, ingredients: { butter: 1, flour: 1 }, baseReward: 25, cookTime: 3000,
    unlockCost: 14, gateStage: '3-1',
  },
  {
    id: 'tomato_salad', nameKo: '토마토 샐러드', icon: '🍅', category: 'special',
    tier: 1, ingredients: { tomato: 1, carrot: 1 }, baseReward: 24, cookTime: 3000,
    unlockCost: 14, gateStage: '3-1',
  },

  // ★★ 2성 (6종)
  {
    id: 'shrimp_fried_rice', nameKo: '새우 볶음밥', icon: '🦐', category: 'fry',
    tier: 2, ingredients: { shrimp: 1, rice: 1 }, baseReward: 40, cookTime: 4000,
    unlockCost: 30, gateStage: '3-2',
  },
  {
    id: 'tomato_pasta', nameKo: '토마토 파스타', icon: '🍅', category: 'noodle',
    tier: 2, ingredients: { tomato: 1, flour: 1 }, baseReward: 42, cookTime: 5000,
    unlockCost: 32, gateStage: '3-2',
  },
  {
    id: 'butter_shrimp', nameKo: '버터 구이 새우', icon: '🧈', category: 'grill',
    tier: 2, ingredients: { butter: 1, shrimp: 1 }, baseReward: 45, cookTime: 4000,
    unlockCost: 35, gateStage: '3-2',
  },
  {
    id: 'tomato_omelette', nameKo: '토마토 오믈렛', icon: '🍅', category: 'fry',
    tier: 2, ingredients: { tomato: 1, egg: 1 }, baseReward: 38, cookTime: 4000,
    unlockCost: 28, gateStage: '3-2',
  },
  {
    id: 'butter_mushroom', nameKo: '버터 머쉬룸', icon: '🧈', category: 'grill',
    tier: 2, ingredients: { butter: 1, mushroom: 1 }, baseReward: 40, cookTime: 4000,
    unlockCost: 30, gateStage: '3-3',
  },
  {
    id: 'shrimp_sushi', nameKo: '새우 초밥', icon: '🦐', category: 'special',
    tier: 2, ingredients: { shrimp: 1, rice: 1, fish: 1 }, baseReward: 48, cookTime: 5000,
    unlockCost: 38, gateStage: '3-3',
  },

  // ★★★ 3성 (5종)
  {
    id: 'seafood_risotto', nameKo: '해산물 리조또', icon: '🦐', category: 'special',
    tier: 3, ingredients: { shrimp: 1, rice: 1, cheese: 1 }, baseReward: 65, cookTime: 6000,
    unlockCost: 55, gateStage: '3-4',
  },
  {
    id: 'margherita', nameKo: '마르게리타', icon: '🍅', category: 'special',
    tier: 3, ingredients: { tomato: 1, cheese: 1, flour: 1 }, baseReward: 60, cookTime: 6000,
    unlockCost: 50, gateStage: '3-4',
  },
  {
    id: 'butter_cream_pasta', nameKo: '버터 크림 파스타', icon: '🧈', category: 'noodle',
    tier: 3, ingredients: { butter: 1, flour: 1, cheese: 1 }, baseReward: 62, cookTime: 7000,
    unlockCost: 55, gateStage: '3-4',
  },
  {
    id: 'tomato_steak', nameKo: '토마토 스테이크', icon: '🍅', category: 'grill',
    tier: 3, ingredients: { tomato: 1, meat: 1, butter: 1 }, baseReward: 70, cookTime: 7000,
    unlockCost: 60, gateStage: '3-4',
  },
  {
    id: 'shrimp_gratin', nameKo: '새우 그라탕', icon: '🦐', category: 'grill',
    tier: 3, ingredients: { shrimp: 1, cheese: 1, butter: 1 }, baseReward: 68, cookTime: 7000,
    unlockCost: 58, gateStage: '3-5',
  },

  // ★★★★ 4성 (4종)
  {
    id: 'bouillabaisse', nameKo: '부야베스', icon: '🦐', category: 'soup',
    tier: 4, ingredients: { shrimp: 1, fish: 1, tomato: 1, butter: 1 }, baseReward: 95, cookTime: 9000,
    unlockCost: 100, gateStage: '3-5',
  },
  {
    id: 'lobster_thermidor', nameKo: '랍스터 테르미도르', icon: '🦐', category: 'special',
    tier: 4, ingredients: { shrimp: 2, butter: 1, cheese: 1 }, baseReward: 100, cookTime: 10000,
    unlockCost: 110, gateStage: '3-5',
  },
  {
    id: 'beef_wellington', nameKo: '웰링턴 스테이크', icon: '🥩', category: 'grill',
    tier: 4, ingredients: { meat: 2, butter: 1, flour: 1 }, baseReward: 105, cookTime: 10000,
    unlockCost: 115, gateStage: '3-6',
  },
  {
    id: 'seafood_hotpot', nameKo: '해물 전골', icon: '🍲', category: 'soup',
    tier: 4, ingredients: { shrimp: 1, fish: 1, squid: 1, tomato: 1 }, baseReward: 110, cookTime: 10000,
    unlockCost: 120, gateStage: '3-6',
  },

  // ★★★★★ 5성 (1종)
  {
    id: 'legendary_fullcourse', nameKo: '전설의 풀코스', icon: '🌟', category: 'special',
    tier: 5, ingredients: { shrimp: 1, tomato: 1, butter: 1, meat: 1, cheese: 1 }, baseReward: 160, cookTime: 12000,
    unlockCost: 200, gateStage: '3-6',
  },

  // ── Phase 9 신규 서빙 20종 (4장: 화산 BBQ) ──

  // ★ 1성 (4종)
  {
    id: 'caramel_popcorn', nameKo: '캐러멜 팝콘', icon: '🍿', category: 'dessert',
    tier: 1, ingredients: { sugar: 1 }, baseReward: 18, cookTime: 2000,
    unlockCost: 12, gateStage: '4-1',
  },
  {
    id: 'milk_pudding', nameKo: '우유 푸딩', icon: '🍮', category: 'dessert',
    tier: 1, ingredients: { milk: 1 }, baseReward: 20, cookTime: 3000,
    unlockCost: 12, gateStage: '4-1',
  },
  {
    id: 'sugar_toast', nameKo: '설탕 토스트', icon: '🍞', category: 'dessert',
    tier: 1, ingredients: { sugar: 1, flour: 1 }, baseReward: 24, cookTime: 3000,
    unlockCost: 15, gateStage: '4-1',
  },
  {
    id: 'milkshake', nameKo: '밀크 쉐이크', icon: '🥤', category: 'dessert',
    tier: 1, ingredients: { milk: 1, sugar: 1 }, baseReward: 26, cookTime: 3000,
    unlockCost: 15, gateStage: '4-1',
  },

  // ★★ 2성 (6종)
  {
    id: 'crepe', nameKo: '크레페', icon: '🥞', category: 'dessert',
    tier: 2, ingredients: { milk: 1, flour: 1, egg: 1 }, baseReward: 42, cookTime: 4000,
    unlockCost: 28, gateStage: '4-2',
  },
  {
    id: 'castella', nameKo: '카스테라', icon: '🍰', category: 'dessert',
    tier: 2, ingredients: { sugar: 1, flour: 1, egg: 1 }, baseReward: 40, cookTime: 4000,
    unlockCost: 28, gateStage: '4-2',
  },
  {
    id: 'french_toast', nameKo: '프렌치 토스트', icon: '🍞', category: 'dessert',
    tier: 2, ingredients: { milk: 1, egg: 1, butter: 1 }, baseReward: 45, cookTime: 4000,
    unlockCost: 30, gateStage: '4-2',
  },
  {
    id: 'caramel_shrimp', nameKo: '캐러멜 새우', icon: '🦐', category: 'grill',
    tier: 2, ingredients: { sugar: 1, shrimp: 1 }, baseReward: 44, cookTime: 4000,
    unlockCost: 30, gateStage: '4-2',
  },
  {
    id: 'milk_risotto', nameKo: '밀크 리조또', icon: '🍚', category: 'special',
    tier: 2, ingredients: { milk: 1, rice: 1, cheese: 1 }, baseReward: 48, cookTime: 5000,
    unlockCost: 32, gateStage: '4-2',
  },
  {
    id: 'tomato_cream_soup', nameKo: '토마토 크림 수프', icon: '🍅', category: 'soup',
    tier: 2, ingredients: { tomato: 1, milk: 1 }, baseReward: 42, cookTime: 4000,
    unlockCost: 28, gateStage: '4-2',
  },

  // ★★★ 3성 (4종)
  {
    id: 'tiramisu', nameKo: '티라미수', icon: '🍰', category: 'dessert',
    tier: 3, ingredients: { milk: 1, sugar: 1, flour: 1, egg: 1 }, baseReward: 65, cookTime: 6000,
    unlockCost: 60, gateStage: '4-3',
  },
  {
    id: 'creme_brulee', nameKo: '크림 브륄레', icon: '🍮', category: 'dessert',
    tier: 3, ingredients: { sugar: 1, milk: 1, egg: 1 }, baseReward: 62, cookTime: 6000,
    unlockCost: 58, gateStage: '4-3',
  },
  {
    id: 'milk_steak', nameKo: '밀크 스테이크', icon: '🥩', category: 'grill',
    tier: 3, ingredients: { milk: 1, meat: 1, butter: 1 }, baseReward: 70, cookTime: 7000,
    unlockCost: 65, gateStage: '4-3',
  },
  {
    id: 'cream_puff', nameKo: '슈크림', icon: '🧁', category: 'dessert',
    tier: 3, ingredients: { sugar: 1, milk: 1, flour: 1, butter: 1 }, baseReward: 72, cookTime: 7000,
    unlockCost: 68, gateStage: '4-3',
  },

  // ★★★★ 4성 (4종)
  {
    id: 'volcano_lava_cake', nameKo: '화산 용암 케이크', icon: '🌋', category: 'dessert',
    tier: 4, ingredients: { sugar: 1, milk: 1, egg: 1, flour: 1, butter: 1 }, baseReward: 110, cookTime: 9000,
    unlockCost: 120, gateStage: '4-5',
  },
  {
    id: 'grand_crepe_suzette', nameKo: '그랑 크레페 수제트', icon: '🥞', category: 'dessert',
    tier: 4, ingredients: { sugar: 1, milk: 1, egg: 1, butter: 1 }, baseReward: 100, cookTime: 9000,
    unlockCost: 110, gateStage: '4-5',
  },
  {
    id: 'mille_feuille_steak', nameKo: '밀피유 스테이크', icon: '🥩', category: 'grill',
    tier: 4, ingredients: { meat: 2, milk: 1, flour: 1 }, baseReward: 105, cookTime: 10000,
    unlockCost: 115, gateStage: '4-5',
  },
  {
    id: 'seafood_cream_risotto', nameKo: '해물 크림 리조또', icon: '🦐', category: 'special',
    tier: 4, ingredients: { shrimp: 1, milk: 1, rice: 1, cheese: 1, butter: 1 }, baseReward: 115, cookTime: 10000,
    unlockCost: 130, gateStage: '4-5',
  },

  // ★★★★★ 5성 (2종)
  {
    id: 'fantasy_dessert_course', nameKo: '환상의 디저트 풀코스', icon: '🎂', category: 'dessert',
    tier: 5, ingredients: { sugar: 1, milk: 1, egg: 1, flour: 1, butter: 1, cheese: 1 }, baseReward: 180, cookTime: 14000,
    unlockCost: 280, gateStage: '4-6',
  },
  {
    id: 'legendary_master_course', nameKo: '전설의 마스터 코스', icon: '👨‍🍳', category: 'special',
    tier: 5, ingredients: { sugar: 1, milk: 1, shrimp: 1, meat: 1, tomato: 1, butter: 1 }, baseReward: 200, cookTime: 15000,
    unlockCost: 350, gateStage: '4-6',
  },

  // ── Phase 10 신규 서빙 15종 (5장+6장: 마법사 디저트 카페 & 그랑 가스트로노미) ──

  // ★★ 2성 (2종)
  {
    id: 'wizard_toast', nameKo: '마법사의 토스트', icon: '🍞', category: 'dessert',
    tier: 2, ingredients: { flour: 1, butter: 1, sugar: 1 }, baseReward: 46, cookTime: 4000,
    unlockCost: 30, gateStage: '5-1',
  },
  {
    id: 'crystal_salad', nameKo: '크리스탈 샐러드', icon: '🥗', category: 'special',
    tier: 2, ingredients: { carrot: 1, cheese: 1, tomato: 1 }, baseReward: 48, cookTime: 4000,
    unlockCost: 32, gateStage: '5-1',
  },

  // ★★★ 3성 (4종)
  {
    id: 'magic_croissant', nameKo: '마법 크로와상', icon: '🥐', category: 'dessert',
    tier: 3, ingredients: { flour: 1, butter: 1, egg: 1, sugar: 1 }, baseReward: 68, cookTime: 6000,
    unlockCost: 60, gateStage: '5-2',
  },
  {
    id: 'magic_seafood_stew', nameKo: '해물 마법 스튜', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { fish: 1, shrimp: 1, tomato: 1, milk: 1 }, baseReward: 75, cookTime: 7000,
    unlockCost: 65, gateStage: '5-3',
  },
  {
    id: 'golden_omurice', nameKo: '황금 오므라이스', icon: '🍳', category: 'special',
    tier: 3, ingredients: { egg: 2, rice: 1, butter: 1 }, baseReward: 72, cookTime: 6000,
    unlockCost: 62, gateStage: '5-4',
  },
  {
    id: 'final_fried_rice', nameKo: '최후의 볶음밥', icon: '🍳', category: 'fry',
    tier: 3, ingredients: { rice: 1, egg: 1, meat: 1, carrot: 1 }, baseReward: 78, cookTime: 7000,
    unlockCost: 68, gateStage: '6-1',
  },

  // ★★★★ 4성 (5종)
  {
    id: 'wizard_dessert_course', nameKo: '마법사의 풀코스 디저트', icon: '🍰', category: 'dessert',
    tier: 4, ingredients: { sugar: 1, milk: 1, egg: 1, flour: 1, cheese: 1 }, baseReward: 115, cookTime: 10000,
    unlockCost: 125, gateStage: '5-4',
  },
  {
    id: 'crystal_seafood_platter', nameKo: '크리스탈 씨푸드 플래터', icon: '🦐', category: 'grill',
    tier: 4, ingredients: { shrimp: 1, squid: 1, fish: 1, butter: 1 }, baseReward: 110, cookTime: 10000,
    unlockCost: 120, gateStage: '5-5',
  },
  {
    id: 'golden_beef_stew', nameKo: '황금 비프 스튜', icon: '🍲', category: 'soup',
    tier: 4, ingredients: { meat: 1, carrot: 1, tomato: 1, butter: 1, cheese: 1 }, baseReward: 120, cookTime: 11000,
    unlockCost: 130, gateStage: '5-6',
  },
  {
    id: 'michelin_omakase', nameKo: '미슐랭 오마카세', icon: '🍣', category: 'special',
    tier: 4, ingredients: { fish: 1, shrimp: 1, rice: 1, egg: 1, milk: 1 }, baseReward: 125, cookTime: 11000,
    unlockCost: 135, gateStage: '6-1',
  },
  {
    id: 'legend_pasta', nameKo: '레전드 파스타', icon: '🍝', category: 'noodle',
    tier: 4, ingredients: { flour: 1, tomato: 1, cheese: 1, meat: 1, mushroom: 1 }, baseReward: 118, cookTime: 10000,
    unlockCost: 128, gateStage: '6-2',
  },

  // ★★★★★ 5성 (4종)
  {
    id: 'starlight_magic_cake', nameKo: '별빛 마법 케이크', icon: '🎂', category: 'dessert',
    tier: 5, ingredients: { sugar: 1, milk: 1, egg: 1, flour: 1, butter: 1, cheese: 1 }, baseReward: 185, cookTime: 14000,
    unlockCost: 290, gateStage: '5-6',
  },
  {
    id: 'emperor_seafood_stew', nameKo: '제왕의 해물탕', icon: '🍲', category: 'soup',
    tier: 5, ingredients: { shrimp: 1, squid: 1, fish: 1, tomato: 1, butter: 1, pepper: 1 }, baseReward: 195, cookTime: 15000,
    unlockCost: 320, gateStage: '6-2',
  },
  {
    id: 'final_master_course', nameKo: '최종 마스터 코스', icon: '👨‍🍳', category: 'special',
    tier: 5, ingredients: { meat: 1, fish: 1, mushroom: 1, cheese: 1, egg: 1, milk: 1 }, baseReward: 210, cookTime: 16000,
    unlockCost: 340, gateStage: '6-3',
  },
  {
    id: 'cuisine_god_banquet', nameKo: '요리의 신의 만찬', icon: '👑', category: 'special',
    tier: 5, ingredients: { meat: 1, shrimp: 1, sugar: 1, milk: 1, egg: 1, flour: 1, butter: 1 }, baseReward: 220, cookTime: 18000,
    unlockCost: 350, gateStage: '6-3',
  },

  // ── Phase 20 신규 서빙 레시피 (7장 사쿠라 이자카야) ──
  {
    id: 'sashimi_plate', nameKo: '사시미 정식', icon: '🍣', category: 'special',
    tier: 2, ingredients: { sashimi_tuna: 2 }, baseReward: 55, cookTime: 6000,
    unlockCost: 40, gateStage: '7-1',
  },
  {
    id: 'wasabi_roll', nameKo: '와사비롤', icon: '🌀', category: 'special',
    tier: 3, ingredients: { sashimi_tuna: 1, wasabi: 1 }, baseReward: 65, cookTime: 7000,
    unlockCost: 55, gateStage: '7-1',
  },
  {
    id: 'nigiri_sushi', nameKo: '니기리 스시', icon: '🍱', category: 'special',
    tier: 3, ingredients: { sashimi_tuna: 1, rice: 1 }, baseReward: 70, cookTime: 7500,
    unlockCost: 60, gateStage: '7-2',
  },
  {
    id: 'wasabi_tempura', nameKo: '와사비 튀김', icon: '🍤', category: 'fry',
    tier: 2, ingredients: { wasabi: 1, shrimp: 1 }, baseReward: 60, cookTime: 6500,
    unlockCost: 45, gateStage: '7-1',
  },
  {
    id: 'tuna_rice_bowl', nameKo: '참치 덮밥', icon: '🥢', category: 'special',
    tier: 4, ingredients: { sashimi_tuna: 2, rice: 2 }, baseReward: 85, cookTime: 9000,
    unlockCost: 80, gateStage: '7-3',
  },
  {
    id: 'wasabi_miso_soup', nameKo: '와사비 된장국', icon: '🍜', category: 'soup',
    tier: 2, ingredients: { wasabi: 1, mushroom: 1 }, baseReward: 50, cookTime: 5500,
    unlockCost: 35, gateStage: '7-1',
  },
  {
    id: 'sakura_kaiseki', nameKo: '사쿠라 가이세키', icon: '🌸', category: 'special',
    tier: 5, ingredients: { sashimi_tuna: 2, wasabi: 1, rice: 2 }, baseReward: 110, cookTime: 12000,
    unlockCost: 150, gateStage: '7-5',
  },
  {
    id: 'izakaya_platter', nameKo: '이자카야 플래터', icon: '🍽️', category: 'special',
    tier: 4, ingredients: { sashimi_tuna: 1, wasabi: 1, shrimp: 2, fish: 1 }, baseReward: 95, cookTime: 11000,
    unlockCost: 100, gateStage: '7-4',
  },

  // ── Phase 21 신규 서빙 레시피 (8장 용의 주방) ──

  // ★★ 2성 (3종)
  {
    id: 'dim_sum', nameKo: '딤섬', icon: '🥟', category: 'special',
    tier: 2, ingredients: { tofu: 1, flour: 1 }, baseReward: 50, cookTime: 5500,
    unlockCost: 35, gateStage: '10-1',
  },
  {
    id: 'wok_noodles', nameKo: '웍 볶음면', icon: '🍜', category: 'noodle',
    tier: 2, ingredients: { cilantro: 1, egg: 1 }, baseReward: 45, cookTime: 5000,
    unlockCost: 30, gateStage: '10-1',
  },
  {
    id: 'cilantro_tofu_steam', nameKo: '고수두부찜', icon: '🥘', category: 'special',
    tier: 2, ingredients: { tofu: 1, cilantro: 1 }, baseReward: 55, cookTime: 6500,
    unlockCost: 40, gateStage: '10-1',
  },

  // ★★★ 3성 (3종)
  {
    id: 'mapo_tofu', nameKo: '마파두부', icon: '🍲', category: 'fry',
    tier: 3, ingredients: { tofu: 2 }, baseReward: 70, cookTime: 8000,
    unlockCost: 60, gateStage: '10-2',
  },
  {
    id: 'tofu_hotpot', nameKo: '두부 훠궈', icon: '🫕', category: 'soup',
    tier: 3, ingredients: { tofu: 2, mushroom: 1 }, baseReward: 75, cookTime: 9000,
    unlockCost: 65, gateStage: '10-3',
  },
  {
    id: 'cilantro_shrimp_soup', nameKo: '고수 탕수', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { cilantro: 2, shrimp: 1 }, baseReward: 75, cookTime: 9000,
    unlockCost: 65, gateStage: '10-3',
  },

  // ★★★★ 4성 (1종)
  {
    id: 'peking_duck', nameKo: '베이징 덕', icon: '🦆', category: 'special',
    tier: 4, ingredients: { tofu: 1, cilantro: 1, butter: 1 }, baseReward: 90, cookTime: 10000,
    unlockCost: 100, gateStage: '10-4',
  },

  // ★★★★★ 5성 (1종)
  {
    id: 'dragon_feast', nameKo: '용의 만찬', icon: '🐉', category: 'special',
    tier: 5, ingredients: { tofu: 2, cilantro: 2, meat: 1 }, baseReward: 130, cookTime: 13000,
    unlockCost: 180, gateStage: '10-5',
  },

  // ── Phase 22-3 신규 서빙 레시피 (8장 이자카야 심층부) ──

  // ★ 1성 (1종)
  {
    id: 'sake_cocktail', nameKo: '사케 칵테일', icon: '🍶', category: 'special',
    tier: 1, ingredients: { sake: 1 }, baseReward: 30, cookTime: 3000,
    unlockCost: 20, gateStage: '10-1',
  },

  // ★★ 2성 (2종)
  {
    id: 'sake_bowl', nameKo: '사케 덮밥', icon: '🥢', category: 'special',
    tier: 2, ingredients: { sake: 1, rice: 1 }, baseReward: 52, cookTime: 5500,
    unlockCost: 38, gateStage: '10-1',
  },
  {
    id: 'sake_shrimp', nameKo: '사케 새우구이', icon: '🦐', category: 'grill',
    tier: 2, ingredients: { sake: 1, shrimp: 1 }, baseReward: 55, cookTime: 5500,
    unlockCost: 40, gateStage: '10-2',
  },

  // ★★★ 3성 (3종)
  {
    id: 'sake_sashimi', nameKo: '사케 사시미', icon: '🍣', category: 'special',
    tier: 3, ingredients: { sake: 1, sashimi_tuna: 1 }, baseReward: 75, cookTime: 7500,
    unlockCost: 65, gateStage: '10-2',
  },
  {
    id: 'sake_ramen', nameKo: '사케 라멘', icon: '🍜', category: 'noodle',
    tier: 3, ingredients: { sake: 1, tofu: 1, mushroom: 1 }, baseReward: 80, cookTime: 8500,
    unlockCost: 72, gateStage: '10-3',
  },
  {
    id: 'sake_hotpot', nameKo: '사케 전골', icon: '🫕', category: 'soup',
    tier: 3, ingredients: { sake: 1, tofu: 1, shrimp: 1 }, baseReward: 82, cookTime: 9000,
    unlockCost: 75, gateStage: '10-3',
  },

  // ★★★★ 4성 (1종)
  {
    id: 'sake_oden', nameKo: '사케 오뎅', icon: '🍢', category: 'soup',
    tier: 4, ingredients: { sake: 1, tofu: 1, cilantro: 1, mushroom: 1 }, baseReward: 105, cookTime: 10500,
    unlockCost: 115, gateStage: '10-4',
  },

  // ★★★★★ 5성 (1종)
  {
    id: 'sake_kaiseki', nameKo: '사케 가이세키', icon: '🌸', category: 'special',
    tier: 5, ingredients: { sake: 2, sashimi_tuna: 1, wasabi: 1, tofu: 1 }, baseReward: 140, cookTime: 13000,
    unlockCost: 190, gateStage: '10-5',
  },

  // ── Phase 25-1 신규 서빙 레시피 (11장 용의 주방 심층부) ──

  // ★★ 2성 (2종)
  {
    id: 'star_anise_broth_ramen', nameKo: '팔각 육수 라멘', icon: '🍜', category: 'noodle',
    tier: 2, ingredients: { star_anise: 1, tofu: 1 }, baseReward: 58, cookTime: 6000,
    unlockCost: 42, gateStage: '11-1',
  },
  {
    id: 'five_spice_stir_fry', nameKo: '오향 볶음', icon: '🍳', category: 'fry',
    tier: 2, ingredients: { star_anise: 1, meat: 1 }, baseReward: 55, cookTime: 5500,
    unlockCost: 38, gateStage: '11-1',
  },

  // ★★★ 3성 (3종)
  {
    id: 'mapo_star_anise_steam', nameKo: '마파 팔각찜', icon: '🥘', category: 'special',
    tier: 3, ingredients: { star_anise: 1, tofu: 2 }, baseReward: 78, cookTime: 8500,
    unlockCost: 68, gateStage: '11-2',
  },
  {
    id: 'star_anise_hotpot', nameKo: '팔각 훠궈', icon: '🫕', category: 'soup',
    tier: 3, ingredients: { star_anise: 1, tofu: 1, mushroom: 1 }, baseReward: 84, cookTime: 9500,
    unlockCost: 75, gateStage: '11-2',
  },
  {
    id: 'star_anise_wok_noodle', nameKo: '팔각 웍볶음면', icon: '🍜', category: 'noodle',
    tier: 3, ingredients: { star_anise: 1, cilantro: 1, egg: 1 }, baseReward: 80, cookTime: 8000,
    unlockCost: 70, gateStage: '11-3',
  },

  // ★★★★ 4성 (2종)
  {
    id: 'dragon_spice_banquet', nameKo: '용향 연회', icon: '🐉', category: 'special',
    tier: 4, ingredients: { star_anise: 2, tofu: 1, cilantro: 1 }, baseReward: 112, cookTime: 11000,
    unlockCost: 122, gateStage: '11-3',
  },
  {
    id: 'star_anise_duck_roast', nameKo: '팔각 오리 구이', icon: '🦆', category: 'grill',
    tier: 4, ingredients: { star_anise: 1, meat: 2, butter: 1 }, baseReward: 108, cookTime: 10500,
    unlockCost: 118, gateStage: '11-4',
  },

  // ★★★★★ 5성 (1종)
  {
    id: 'legendary_star_anise_course', nameKo: '전설의 오향 풀코스', icon: '⭐', category: 'special',
    tier: 5, ingredients: { star_anise: 2, tofu: 2, cilantro: 1, meat: 1 }, baseReward: 155, cookTime: 14000,
    unlockCost: 220, gateStage: '11-4',
  },

  // ── Phase 26-1 신규 서빙 레시피 (12장 용의 궁전 결전) ──

  // ★★★ 3성 (2종)
  {
    id: 'dragon_soup', nameKo: '용의 탕', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { star_anise: 1, tofu: 1, sake: 1 }, baseReward: 88, cookTime: 9000,
    unlockCost: 85, gateStage: '12-1',
  },
  {
    id: 'wok_flame_rice', nameKo: '웍 화염 볶음밥', icon: '🍳', category: 'fry',
    tier: 3, ingredients: { star_anise: 1, cilantro: 1, rice: 1 }, baseReward: 80, cookTime: 8000,
    unlockCost: 80, gateStage: '12-1',
  },

  // ★★ 2성 (1종)
  {
    id: 'dragon_dim_sum', nameKo: '용의 딤섬', icon: '🥟', category: 'special',
    tier: 2, ingredients: { tofu: 1, cilantro: 1, flour: 1 }, baseReward: 72, cookTime: 7500,
    unlockCost: 55, gateStage: '12-2',
  },

  // ★★★★ 4성 (3종)
  {
    id: 'fire_wok_noodle', nameKo: '화염 웍 면', icon: '🍜', category: 'noodle',
    tier: 4, ingredients: { star_anise: 2, cilantro: 1, egg: 1 }, baseReward: 95, cookTime: 10000,
    unlockCost: 130, gateStage: '12-2',
  },
  {
    id: 'palace_hotpot', nameKo: '궁중 훠궈', icon: '🍲', category: 'soup',
    tier: 4, ingredients: { star_anise: 2, tofu: 2, sake: 1 }, baseReward: 120, cookTime: 11500,
    unlockCost: 145, gateStage: '12-3',
  },
  {
    id: 'imperial_tofu_feast', nameKo: '황제의 두부 연회', icon: '🍽️', category: 'special',
    tier: 4, ingredients: { tofu: 2, cilantro: 2, sake: 1 }, baseReward: 110, cookTime: 11000,
    unlockCost: 140, gateStage: '12-3',
  },

  // ★★★★★ 5성 (2종)
  {
    id: 'dragon_wok_banquet', nameKo: '드래곤 웍 연회', icon: '🐉', category: 'special',
    tier: 5, ingredients: { star_anise: 2, tofu: 2, cilantro: 2 }, baseReward: 145, cookTime: 13500,
    unlockCost: 240, gateStage: '12-5',
  },
  {
    id: 'final_dragon_course', nameKo: '최후의 용의 만찬', icon: '⭐', category: 'special',
    tier: 5, ingredients: { star_anise: 3, tofu: 2, cilantro: 1, sake: 1, meat: 1 }, baseReward: 180, cookTime: 15000,
    unlockCost: 280, gateStage: '12-5',
  },

  // ── Phase 27-3 신규 서빙 레시피 (13장 별빛 비스트로) ──

  // ★★ 2성 (2종)
  {
    id: 'truffle_bisque', nameKo: '트러플 비스크', icon: '🍲', category: 'soup',
    tier: 2, ingredients: { truffle: 1 }, baseReward: 58, cookTime: 6000,
    unlockCost: 42, gateStage: '13-1',
  },
  {
    id: 'foie_gras_toast', nameKo: '푸아그라 토스트', icon: '🍞', category: 'grill',
    tier: 2, ingredients: { truffle: 1, butter: 1 }, baseReward: 62, cookTime: 6500,
    unlockCost: 45, gateStage: '13-1',
  },

  // ★★★ 3성 (3종)
  {
    id: 'truffle_risotto', nameKo: '트러플 리조또', icon: '🍚', category: 'noodle',
    tier: 3, ingredients: { truffle: 1, rice: 1, butter: 1 }, baseReward: 88, cookTime: 9000,
    unlockCost: 78, gateStage: '13-2',
  },
  {
    id: 'wine_truffle_plate', nameKo: '와인 트러플 정식', icon: '🍽️', category: 'special',
    tier: 3, ingredients: { truffle: 1, mushroom: 1, meat: 1 }, baseReward: 92, cookTime: 9500,
    unlockCost: 82, gateStage: '13-2',
  },
  {
    id: 'truffle_pasta', nameKo: '트러플 파스타', icon: '🍝', category: 'noodle',
    tier: 3, ingredients: { truffle: 1, flour: 1, egg: 1 }, baseReward: 85, cookTime: 8500,
    unlockCost: 75, gateStage: '13-3',
  },

  // ★★★★ 4성 (2종)
  {
    id: 'bistro_full_course', nameKo: '비스트로 풀코스', icon: '🌟', category: 'special',
    tier: 4, ingredients: { truffle: 1, butter: 1, mushroom: 1, meat: 1 }, baseReward: 118, cookTime: 11500,
    unlockCost: 145, gateStage: '13-3',
  },
  {
    id: 'wine_seafood_bisque', nameKo: '와인 씨푸드 비스크', icon: '🍲', category: 'soup',
    tier: 4, ingredients: { truffle: 1, fish: 1, shrimp: 1, butter: 1 }, baseReward: 112, cookTime: 11000,
    unlockCost: 138, gateStage: '13-4',
  },

  // ★★★★★ 5성 (1종)
  {
    id: 'noir_tasting_course', nameKo: '누아르 테이스팅 코스', icon: '⭐', category: 'special',
    tier: 5, ingredients: { truffle: 2, butter: 1, mushroom: 1, meat: 1, egg: 1 }, baseReward: 185, cookTime: 15500,
    unlockCost: 290, gateStage: '13-5',
  },

  // ── Phase 29-2 신규 서빙 레시피 (15장 카타콩브) ──

  // ★★ 2성 (2종)
  {
    id: 'herb_soup', nameKo: '허브 수프', icon: '🍲', category: 'soup',
    tier: 2, ingredients: { herb_bundle: 1 }, baseReward: 65, cookTime: 6500,
    unlockCost: 48, gateStage: '15-1',
  },
  {
    id: 'herb_bread', nameKo: '허브 빵', icon: '🍞', category: 'grill',
    tier: 2, ingredients: { herb_bundle: 1, flour: 1 }, baseReward: 68, cookTime: 7000,
    unlockCost: 52, gateStage: '15-1',
  },

  // ★★★ 3성 (6종)
  {
    id: 'herb_butter_saute', nameKo: '허브 버터 소테', icon: '🧈', category: 'grill',
    tier: 3, ingredients: { herb_bundle: 1, butter: 1 }, baseReward: 90, cookTime: 8500,
    unlockCost: 78, gateStage: '15-1',
  },
  {
    id: 'herb_mushroom_soup', nameKo: '허브 버섯 스프', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { herb_bundle: 1, mushroom: 1 }, baseReward: 88, cookTime: 8500,
    unlockCost: 75, gateStage: '15-1',
  },
  {
    id: 'herb_truffle_cream', nameKo: '허브 트러플 크림', icon: '🍄', category: 'soup',
    tier: 3, ingredients: { herb_bundle: 1, truffle: 1, butter: 1 }, baseReward: 105, cookTime: 9500,
    unlockCost: 92, gateStage: '15-2',
  },
  {
    id: 'herb_escargot', nameKo: '허브 에스카르고', icon: '🐌', category: 'special',
    tier: 3, ingredients: { herb_bundle: 1, butter: 1, mushroom: 1 }, baseReward: 108, cookTime: 9500,
    unlockCost: 95, gateStage: '15-2',
  },
  {
    id: 'herb_ragout', nameKo: '허브 라구', icon: '🥩', category: 'grill',
    tier: 3, ingredients: { herb_bundle: 1, meat: 1, egg: 1 }, baseReward: 102, cookTime: 9000,
    unlockCost: 88, gateStage: '15-2',
  },
  {
    id: 'herb_fish_meuniere', nameKo: '허브 피시 뫼니에르', icon: '🐟', category: 'grill',
    tier: 3, ingredients: { herb_bundle: 1, fish: 1, butter: 1 }, baseReward: 98, cookTime: 9000,
    unlockCost: 85, gateStage: '15-3',
  },

  // ★★★★ 4성 (5종)
  {
    id: 'catacomb_herb_plate', nameKo: '카타콩브 허브 플레이트', icon: '🍽️', category: 'special',
    tier: 4, ingredients: { herb_bundle: 1, truffle: 1, meat: 1, butter: 1 }, baseReward: 128, cookTime: 11500,
    unlockCost: 155, gateStage: '15-3',
  },
  {
    id: 'herb_duck_confit', nameKo: '허브 오리 콩피', icon: '🦆', category: 'grill',
    tier: 4, ingredients: { herb_bundle: 1, meat: 1, mushroom: 1, butter: 1 }, baseReward: 132, cookTime: 12000,
    unlockCost: 160, gateStage: '15-3',
  },
  {
    id: 'noir_herb_bisque', nameKo: '누아르 허브 비스크', icon: '🍲', category: 'soup',
    tier: 4, ingredients: { herb_bundle: 2, fish: 1, shrimp: 1 }, baseReward: 125, cookTime: 11000,
    unlockCost: 148, gateStage: '15-4',
  },
  {
    id: 'herb_grand_platter', nameKo: '허브 그랑 플래터', icon: '🌟', category: 'special',
    tier: 4, ingredients: { herb_bundle: 1, truffle: 1, mushroom: 1, meat: 1, butter: 1 }, baseReward: 145, cookTime: 13000,
    unlockCost: 178, gateStage: '15-4',
  },
  {
    id: 'catacomb_tasting_menu', nameKo: '카타콩브 테이스팅 메뉴', icon: '⭐', category: 'special',
    tier: 4, ingredients: { herb_bundle: 1, truffle: 1, fish: 1, egg: 1, rice: 1 }, baseReward: 138, cookTime: 12500,
    unlockCost: 168, gateStage: '15-5',
  },

  // ★★★★★ 5성 (3종)
  {
    id: 'noir_herb_course', nameKo: '누아르 허브 코스', icon: '✨', category: 'special',
    tier: 5, ingredients: { herb_bundle: 2, truffle: 1, meat: 1, mushroom: 1, butter: 1 }, baseReward: 195, cookTime: 16000,
    unlockCost: 310, gateStage: '15-5',
  },
  {
    id: 'catacomb_grand_feast', nameKo: '카타콩브 그랑 피스트', icon: '🎖️', category: 'special',
    tier: 5, ingredients: { herb_bundle: 2, truffle: 2, fish: 1, shrimp: 1, egg: 1 }, baseReward: 205, cookTime: 17000,
    unlockCost: 340, gateStage: '15-5',
  },
  {
    id: 'chefs_noir_tribute', nameKo: '셰프 누아르 헌정 요리', icon: '👨‍🍳', category: 'special',
    tier: 5, ingredients: { herb_bundle: 2, truffle: 2, meat: 1, mushroom: 1, butter: 1, egg: 1 }, baseReward: 225, cookTime: 18500,
    unlockCost: 380, gateStage: '15-6',
  },

  // ── Phase 31-3 신규 서빙 레시피 (16장 향신료 궁전) ──

  // ★★ 2성 (2종)
  {
    id: 'curry_leaf_soup', nameKo: '카레 잎 수프', icon: '🍲', category: 'soup',
    tier: 2, ingredients: { curry_leaf: 1 }, baseReward: 68, cookTime: 6500,
    unlockCost: 50, gateStage: '16-1',
  },
  {
    id: 'spiced_flatbread', nameKo: '스파이스 플랫브레드', icon: '🫓', category: 'grill',
    tier: 2, ingredients: { curry_leaf: 1, flour: 1 }, baseReward: 72, cookTime: 7000,
    unlockCost: 54, gateStage: '16-1',
  },

  // ★★★ 3성 (3종)
  {
    id: 'saffron_rice', nameKo: '사프란 라이스', icon: '🍚', category: 'fry',
    tier: 3, ingredients: { saffron: 1, rice: 1 }, baseReward: 95, cookTime: 8500,
    unlockCost: 80, gateStage: '16-1',
  },
  {
    id: 'curry_leaf_saute', nameKo: '카레 잎 소테', icon: '🍳', category: 'fry',
    tier: 3, ingredients: { curry_leaf: 1, butter: 1 }, baseReward: 92, cookTime: 8500,
    unlockCost: 78, gateStage: '16-1',
  },
  {
    id: 'tandoori_grill', nameKo: '탄두리 구이', icon: '🍗', category: 'grill',
    tier: 3, ingredients: { curry_leaf: 1, meat: 1, saffron: 1 }, baseReward: 108, cookTime: 9500,
    unlockCost: 96, gateStage: '16-2',
  },

  // ★★★★ 4성 (3종)
  {
    id: 'butter_chicken', nameKo: '버터 치킨', icon: '🍛', category: 'special',
    tier: 4, ingredients: { curry_leaf: 1, butter: 1, meat: 1, saffron: 1 }, baseReward: 132, cookTime: 12000,
    unlockCost: 165, gateStage: '16-3',
  },
  {
    id: 'saffron_kheer', nameKo: '사프란 키르', icon: '🍮', category: 'dessert',
    tier: 4, ingredients: { saffron: 1, rice: 1, egg: 1, butter: 1 }, baseReward: 128, cookTime: 11500,
    unlockCost: 158, gateStage: '16-3',
  },
  {
    id: 'saffron_biryani', nameKo: '사프란 비리야니', icon: '🍛', category: 'special',
    tier: 4, ingredients: { saffron: 1, curry_leaf: 1, rice: 1, meat: 1 }, baseReward: 138, cookTime: 12500,
    unlockCost: 172, gateStage: '16-4',
  },

  // ★★★★★ 5성 (5종)
  {
    id: 'spice_palace_curry', nameKo: '향신료 궁전 카레', icon: '🫕', category: 'special',
    tier: 5, ingredients: { curry_leaf: 2, saffron: 1, meat: 1, butter: 1 }, baseReward: 195, cookTime: 16000,
    unlockCost: 315, gateStage: '16-3',
  },
  {
    id: 'biryani_grand', nameKo: '비리야니 그랑', icon: '🌟', category: 'special',
    tier: 5, ingredients: { saffron: 1, curry_leaf: 2, rice: 1, meat: 1, egg: 1 }, baseReward: 205, cookTime: 17000,
    unlockCost: 345, gateStage: '16-4',
  },
  {
    id: 'spice_palace_tasting', nameKo: '향신료 궁전 테이스팅', icon: '⭐', category: 'special',
    tier: 5, ingredients: { saffron: 1, curry_leaf: 1, meat: 1, butter: 1, truffle: 1 }, baseReward: 215, cookTime: 17500,
    unlockCost: 360, gateStage: '16-4',
  },
  {
    id: 'maharaja_feast', nameKo: '마하라자 피스트', icon: '🎖️', category: 'special',
    tier: 5, ingredients: { saffron: 2, curry_leaf: 2, meat: 1, butter: 1, egg: 1 }, baseReward: 230, cookTime: 18500,
    unlockCost: 395, gateStage: '16-5',
  },
  {
    id: 'saffron_grand_platter', nameKo: '사프란 그랑 플래터', icon: '🏆', category: 'special',
    tier: 5, ingredients: { saffron: 2, curry_leaf: 2, meat: 1, butter: 1, truffle: 1, rice: 1 }, baseReward: 250, cookTime: 19500,
    unlockCost: 430, gateStage: '16-5',
  },

  // ── Phase 32-3 신규 서빙 레시피 (17장 향신료 궁전 심층부) ──

  // ★★ 2성 (2종)
  {
    id: 'chai_masala', nameKo: '차이 마살라', icon: '☕', category: 'soup',
    tier: 2, ingredients: { chai: 1 }, baseReward: 75, cookTime: 6500,
    unlockCost: 55, gateStage: '17-1',
  },
  {
    id: 'spiced_chai_bread', nameKo: '스파이스 차이 브레드', icon: '🍞', category: 'grill',
    tier: 2, ingredients: { chai: 1, flour: 1 }, baseReward: 80, cookTime: 7000,
    unlockCost: 60, gateStage: '17-1',
  },

  // ★★★ 3성 (2종)
  {
    id: 'chai_rice', nameKo: '차이 라이스', icon: '🍚', category: 'fry',
    tier: 3, ingredients: { chai: 1, rice: 1 }, baseReward: 105, cookTime: 8500,
    unlockCost: 88, gateStage: '17-1',
  },
  {
    id: 'incense_soup', nameKo: '향 수프', icon: '🍲', category: 'soup',
    tier: 3, ingredients: { chai: 1, saffron: 1 }, baseReward: 112, cookTime: 9000,
    unlockCost: 95, gateStage: '17-2',
  },

  // ★★★★ 4성 (2종)
  {
    id: 'chai_chicken', nameKo: '차이 치킨', icon: '🍛', category: 'special',
    tier: 4, ingredients: { chai: 1, meat: 1, curry_leaf: 1, butter: 1 }, baseReward: 145, cookTime: 12000,
    unlockCost: 180, gateStage: '17-2',
  },
  {
    id: 'deep_spice_stew', nameKo: '깊은 향신료 스튜', icon: '🫕', category: 'special',
    tier: 4, ingredients: { chai: 1, saffron: 1, meat: 1, curry_leaf: 1 }, baseReward: 152, cookTime: 12500,
    unlockCost: 190, gateStage: '17-3',
  },

  // ★★★★★ 5성 (4종)
  {
    id: 'chai_grand_curry', nameKo: '차이 그랑 카레', icon: '🌟', category: 'special',
    tier: 5, ingredients: { chai: 2, saffron: 1, meat: 1, butter: 1, curry_leaf: 1 }, baseReward: 265, cookTime: 17500,
    unlockCost: 425, gateStage: '17-3',
  },
  {
    id: 'incense_palace_feast', nameKo: '향 궁전 피스트', icon: '⭐', category: 'special',
    tier: 5, ingredients: { chai: 2, saffron: 2, meat: 1, butter: 1, curry_leaf: 1 }, baseReward: 285, cookTime: 18500,
    unlockCost: 460, gateStage: '17-4',
  },
  {
    id: 'elemental_platter', nameKo: '원소 플래터', icon: '🎖️', category: 'special',
    tier: 5, ingredients: { chai: 2, saffron: 2, meat: 1, butter: 1, curry_leaf: 2 }, baseReward: 308, cookTime: 19500,
    unlockCost: 495, gateStage: '17-4',
  },
  {
    id: 'sanctum_grand_feast', nameKo: '성역 그랑 피스트', icon: '🏆', category: 'special',
    tier: 5, ingredients: { chai: 2, saffron: 2, meat: 1, butter: 1, curry_leaf: 2, truffle: 1 }, baseReward: 335, cookTime: 20500,
    unlockCost: 540, gateStage: '17-5',
  },

  // ── Phase 32-5 신규 서빙 레시피 (18장 향신료 궁전 최심부) ──

  // ★★ 2성 (2종)
  {
    id: 'cardamom_tea', nameKo: '카다멈 차', icon: '☕', category: 'soup',
    tier: 2, ingredients: { cardamom: 1 }, baseReward: 78, cookTime: 6500,
    unlockCost: 58, gateStage: '18-1',
  },
  {
    id: 'spiced_cardamom_bread', nameKo: '스파이스 카다멈 브레드', icon: '🍞', category: 'grill',
    tier: 2, ingredients: { cardamom: 1, flour: 1 }, baseReward: 85, cookTime: 7200,
    unlockCost: 65, gateStage: '18-1',
  },

  // ★★★ 3성 (2종)
  {
    id: 'cardamom_masala_bowl', nameKo: '카다멈 마살라 볼', icon: '🍛', category: 'fry',
    tier: 3, ingredients: { cardamom: 1, curry_leaf: 1 }, baseReward: 115, cookTime: 9000,
    unlockCost: 95, gateStage: '18-2',
  },
  {
    id: 'masala_lamb', nameKo: '마살라 램', icon: '🥩', category: 'grill',
    tier: 3, ingredients: { cardamom: 1, meat: 1, curry_leaf: 1 }, baseReward: 128, cookTime: 10000,
    unlockCost: 108, gateStage: '18-2',
  },

  // ★★★★★ 5성 (3종)
  {
    id: 'maharaja_grand_platter', nameKo: '마하라자 그랑 플래터', icon: '🌟', category: 'special',
    tier: 5, ingredients: { cardamom: 2, saffron: 2, meat: 1, butter: 1, curry_leaf: 2 }, baseReward: 348, cookTime: 21000,
    unlockCost: 560, gateStage: '18-3',
  },
  {
    id: 'spice_throne_feast', nameKo: '향신료 왕좌 피스트', icon: '⭐', category: 'special',
    tier: 5, ingredients: { cardamom: 2, saffron: 2, meat: 1, butter: 1, curry_leaf: 2, chai: 1 }, baseReward: 378, cookTime: 22500,
    unlockCost: 610, gateStage: '18-4',
  },
  {
    id: 'maharaja_final_banquet', nameKo: '마하라자 최종 연회', icon: '🏆', category: 'special',
    tier: 5, ingredients: { cardamom: 2, saffron: 2, meat: 1, butter: 1, curry_leaf: 2, chai: 2, truffle: 1 }, baseReward: 415, cookTime: 24000,
    unlockCost: 665, gateStage: '18-5',
  },

  // ── Phase 33-3 신규 서빙 레시피 (19장 선인장 칸티나) ──

  // ★★ 2성 (2종)
  {
    id: 'jalapeno_salsa', nameKo: '할라피뇨 살사', icon: '🫙', category: 'soup',
    tier: 2, ingredients: { jalapeno: 1 }, baseReward: 78, cookTime: 6500,
    unlockCost: 58, gateStage: '19-1',
  },
  {
    id: 'jalapeno_cornbread', nameKo: '할라피뇨 콘브레드', icon: '🌽', category: 'grill',
    tier: 2, ingredients: { jalapeno: 1, flour: 1 }, baseReward: 84, cookTime: 7000,
    unlockCost: 63, gateStage: '19-1',
  },

  // ★★★ 3성 (2종)
  {
    id: 'nachos_fuego', nameKo: '나초스 푸에고', icon: '🧀', category: 'fry',
    tier: 3, ingredients: { jalapeno: 1, cheese: 1 }, baseReward: 108, cookTime: 8500,
    unlockCost: 90, gateStage: '19-1',
  },
  {
    id: 'guacamole_bowl', nameKo: '과카몰리 볼', icon: '🥑', category: 'soup',
    tier: 3, ingredients: { jalapeno: 1, tomato: 1 }, baseReward: 115, cookTime: 9000,
    unlockCost: 98, gateStage: '19-2',
  },

  // ★★★★ 4성 (2종)
  {
    id: 'taco_supreme', nameKo: '타코 수프리모', icon: '🌮', category: 'special',
    tier: 4, ingredients: { jalapeno: 1, meat: 1, cheese: 1, tomato: 1 }, baseReward: 148, cookTime: 12000,
    unlockCost: 185, gateStage: '19-2',
  },
  {
    id: 'enchilada_roja', nameKo: '엔칠라다 로하', icon: '🌯', category: 'special',
    tier: 4, ingredients: { jalapeno: 1, meat: 1, flour: 1, tomato: 1 }, baseReward: 155, cookTime: 12500,
    unlockCost: 195, gateStage: '19-3',
  },

  // ★★★★★ 5성 (2종 — 서빙 레시피)
  {
    id: 'cantina_platter', nameKo: '칸티나 플래터', icon: '🌟', category: 'special',
    tier: 5, ingredients: { jalapeno: 2, meat: 1, cheese: 1, tomato: 1, flour: 1 }, baseReward: 268, cookTime: 17500,
    unlockCost: 430, gateStage: '19-3',
  },
  {
    id: 'burrito_grande', nameKo: '부리토 그란데', icon: '⭐', category: 'special',
    tier: 5, ingredients: { jalapeno: 2, meat: 1, cheese: 1, tomato: 1, flour: 1, rice: 1 }, baseReward: 290, cookTime: 18500,
    unlockCost: 465, gateStage: '19-4',
  },

  // ★★★★★ 5성 (2종 — customers 전용 고급 레시피)
  {
    id: 'cactus_grand_feast', nameKo: '선인장 그랑 피스트', icon: '🏆', category: 'special',
    tier: 5, ingredients: { jalapeno: 2, meat: 1, cheese: 1, tomato: 1, flour: 1, rice: 1, egg: 1 }, baseReward: 320, cookTime: 20000,
    unlockCost: 510, gateStage: '19-4',
  },
  {
    id: 'desert_cantina_banquet', nameKo: '사막 칸티나 연회', icon: '🎊', category: 'special',
    tier: 5, ingredients: { jalapeno: 2, meat: 1, cheese: 2, tomato: 1, flour: 1, rice: 1, butter: 1 }, baseReward: 350, cookTime: 21500,
    unlockCost: 555, gateStage: '19-5',
  },

  // ── Phase 34-3 신규 서빙 레시피 (20장 칸티나 심층부) ──

  // ★★★ 3성 (2종)
  {
    id: 'guacamole', nameKo: '과카몰리', icon: '🥑', category: 'soup',
    tier: 3, ingredients: { avocado: 1, cilantro: 1, jalapeno: 1 }, baseReward: 118, cookTime: 9000,
    unlockCost: 105, gateStage: '20-1',
  },
  {
    id: 'avocado_toast', nameKo: '아보카도 토스트', icon: '🍞', category: 'grill',
    tier: 3, ingredients: { avocado: 1, tomato: 1 }, baseReward: 112, cookTime: 8500,
    unlockCost: 98, gateStage: '20-1',
  },

  // ★★★★ 4성 (3종)
  {
    id: 'avocado_burrito', nameKo: '아보카도 부리토', icon: '🌯', category: 'special',
    tier: 4, ingredients: { avocado: 1, flour: 1, jalapeno: 1 }, baseReward: 158, cookTime: 12500,
    unlockCost: 200, gateStage: '20-1',
  },
  {
    id: 'avocado_taco', nameKo: '아보카도 타코', icon: '🌮', category: 'special',
    tier: 4, ingredients: { avocado: 1, meat: 1, jalapeno: 1 }, baseReward: 165, cookTime: 13000,
    unlockCost: 210, gateStage: '20-2',
  },
  {
    id: 'avocado_salad', nameKo: '아보카도 샐러드', icon: '🥗', category: 'soup',
    tier: 4, ingredients: { avocado: 1, tomato: 1, cilantro: 1 }, baseReward: 152, cookTime: 11500,
    unlockCost: 192, gateStage: '20-2',
  },

  // ★★★★★ 5성 (3종)
  {
    id: 'avocado_quesadilla', nameKo: '아보카도 케사디아', icon: '🧀', category: 'special',
    tier: 5, ingredients: { avocado: 1, cheese: 1, flour: 1 }, baseReward: 278, cookTime: 17500,
    unlockCost: 445, gateStage: '20-2',
  },
  {
    id: 'avocado_soup', nameKo: '아보카도 수프', icon: '🍲', category: 'soup',
    tier: 5, ingredients: { avocado: 1, cilantro: 1, jalapeno: 1, egg: 1 }, baseReward: 295, cookTime: 18500,
    unlockCost: 472, gateStage: '20-3',
  },
  {
    id: 'avocado_rice_bowl', nameKo: '아보카도 라이스볼', icon: '🍚', category: 'special',
    tier: 5, ingredients: { avocado: 1, rice: 1, jalapeno: 1 }, baseReward: 285, cookTime: 18000,
    unlockCost: 456, gateStage: '20-3',
  },

  // ★★★★★ 5성 (1종 — customers 전용 고급 레시피)
  {
    id: 'diablo_feast', nameKo: '엘 디아블로 피스트', icon: '🔥', category: 'special',
    tier: 5, ingredients: { avocado: 2, jalapeno: 2, meat: 1, cheese: 1, flour: 1, tomato: 1 }, baseReward: 420, cookTime: 23500,
    unlockCost: 680, gateStage: '20-4',
  },

  // ── Phase 35-3 신규 서빙 레시피 (21장 엘 디아블로 최종전) ──

  // ★★★ 3성 (2종)
  {
    id: 'diablo_fire_salsa', nameKo: '디아블로 파이어 살사', icon: '🌶️', category: 'soup',
    tier: 3, ingredients: { avocado: 1, jalapeno: 1, tomato: 1 }, baseReward: 128, cookTime: 9500,
    unlockCost: 112, gateStage: '21-1',
  },
  {
    id: 'cactus_avocado_bowl', nameKo: '선인장 아보카도 볼', icon: '🥑', category: 'soup',
    tier: 3, ingredients: { avocado: 1, cilantro: 1, tomato: 1 }, baseReward: 122, cookTime: 9000,
    unlockCost: 106, gateStage: '21-1',
  },

  // ★★★★ 4성 (3종)
  {
    id: 'el_diablo_salsa_negra', nameKo: '엘 디아블로 살사 네그라', icon: '🔥', category: 'special',
    tier: 4, ingredients: { avocado: 1, jalapeno: 2, cilantro: 1 }, baseReward: 172, cookTime: 13500,
    unlockCost: 218, gateStage: '21-2',
  },
  {
    id: 'pepper_enchilada_diablo', nameKo: '페퍼 엔칠라다 디아블로', icon: '🌯', category: 'special',
    tier: 4, ingredients: { avocado: 1, jalapeno: 1, flour: 1, meat: 1 }, baseReward: 178, cookTime: 14000,
    unlockCost: 226, gateStage: '21-2',
  },
  {
    id: 'avocado_pepper_stew', nameKo: '아보카도 고추 스튜', icon: '🍲', category: 'soup',
    tier: 4, ingredients: { avocado: 2, jalapeno: 1, tomato: 1 }, baseReward: 168, cookTime: 12500,
    unlockCost: 212, gateStage: '21-3',
  },

  // ★★★★★ 5성 (3종 — 서빙 레시피)
  {
    id: 'pepper_supremo_feast', nameKo: '페퍼 수프리모 피스트', icon: '🌟', category: 'special',
    tier: 5, ingredients: { avocado: 2, jalapeno: 2, cilantro: 1, flour: 1 }, baseReward: 308, cookTime: 19000,
    unlockCost: 492, gateStage: '21-3',
  },
  {
    id: 'el_diablo_grand_feast', nameKo: '엘 디아블로 그랑 피스트', icon: '👑', category: 'special',
    tier: 5, ingredients: { avocado: 2, jalapeno: 2, meat: 1, cheese: 1, flour: 1, cilantro: 1 }, baseReward: 445, cookTime: 25000,
    unlockCost: 720, gateStage: '21-5',
  },
  {
    id: 'final_diablo_course', nameKo: '최후의 디아블로 코스', icon: '⭐', category: 'special',
    tier: 5, ingredients: { avocado: 3, jalapeno: 2, meat: 1, cheese: 1, flour: 1, tomato: 1, cilantro: 1 }, baseReward: 490, cookTime: 27000,
    unlockCost: 780, gateStage: '21-6',
  },

  // ── Phase 36-3 신규 서빙 레시피 (22장 슈가 드림랜드) ──

  // ★★★ 3성 (2종)
  {
    id: 'cacao_vanilla_latte', nameKo: '카카오 바닐라 라떼', icon: '☕', category: 'dessert',
    tier: 3, ingredients: { cacao: 1, vanilla: 1, milk: 1 }, baseReward: 132, cookTime: 10000,
    unlockCost: 118, gateStage: '22-1',
  },
  {
    id: 'vanilla_dream_cake', nameKo: '바닐라 드림 케이크', icon: '🎂', category: 'dessert',
    tier: 3, ingredients: { vanilla: 1, flour: 1, sugar: 1 }, baseReward: 126, cookTime: 9500,
    unlockCost: 112, gateStage: '22-1',
  },

  // ★★★★ 4성 (3종)
  {
    id: 'cacao_truffle_tart', nameKo: '카카오 트러플 타르트', icon: '🍮', category: 'dessert',
    tier: 4, ingredients: { cacao: 1, vanilla: 1, butter: 1 }, baseReward: 178, cookTime: 14000,
    unlockCost: 226, gateStage: '22-2',
  },
  {
    id: 'cotton_candy_mousse', nameKo: '솜사탕 무스', icon: '🍬', category: 'dessert',
    tier: 4, ingredients: { vanilla: 1, sugar: 1, milk: 1, egg: 1 }, baseReward: 182, cookTime: 14500,
    unlockCost: 232, gateStage: '22-2',
  },
  {
    id: 'vanilla_sugar_parfait', nameKo: '바닐라 슈가 파르페', icon: '🍦', category: 'dessert',
    tier: 4, ingredients: { vanilla: 1, cacao: 1, sugar: 1 }, baseReward: 175, cookTime: 13500,
    unlockCost: 222, gateStage: '22-3',
  },

  // ★★★★★ 5성 (3종)
  {
    id: 'cacao_fantasy_fondant', nameKo: '카카오 판타지 퐁당', icon: '🍫', category: 'dessert',
    tier: 5, ingredients: { cacao: 2, vanilla: 1, butter: 1 }, baseReward: 318, cookTime: 20000,
    unlockCost: 508, gateStage: '22-3',
  },
  {
    id: 'dream_candy_platter', nameKo: '드림 캔디 플래터', icon: '🍭', category: 'special',
    tier: 5, ingredients: { cacao: 1, vanilla: 2, sugar: 1, flour: 1 }, baseReward: 328, cookTime: 20500,
    unlockCost: 524, gateStage: '22-4',
  },
  {
    id: 'sugar_dream_supreme', nameKo: '슈가 드림 수프림', icon: '👑', category: 'special',
    tier: 5, ingredients: { cacao: 2, vanilla: 2, sugar: 1, butter: 1, milk: 1 }, baseReward: 462, cookTime: 26000,
    unlockCost: 745, gateStage: '22-5',
  },

  // ── Phase 37-2 신규 서빙 레시피 (23장 드림랜드 심층부) ──

  // ★★★ 3성 (2종)
  {
    id: 'cream_macaron_delight', nameKo: '크림 마카롱 딜라이트', icon: '🍪', category: 'dessert',
    tier: 3, ingredients: { cream: 1, vanilla: 1, sugar: 1 }, baseReward: 138, cookTime: 10500,
    unlockCost: 124, gateStage: '23-1',
  },
  {
    id: 'cream_puff_tower', nameKo: '크림 퍼프 타워', icon: '🍮', category: 'dessert',
    tier: 3, ingredients: { cream: 1, flour: 1, egg: 1 }, baseReward: 132, cookTime: 10000,
    unlockCost: 118, gateStage: '23-1',
  },

  // ★★★★ 4성 (3종)
  {
    id: 'vanilla_cream_opera', nameKo: '바닐라 크림 오페라', icon: '🎂', category: 'dessert',
    tier: 4, ingredients: { cream: 1, vanilla: 1, cacao: 1, butter: 1 }, baseReward: 186, cookTime: 14500,
    unlockCost: 238, gateStage: '23-2',
  },
  {
    id: 'cacao_cream_entremet', nameKo: '카카오 크림 앙트르메', icon: '🍫', category: 'dessert',
    tier: 4, ingredients: { cream: 2, cacao: 1, sugar: 1 }, baseReward: 190, cookTime: 15000,
    unlockCost: 244, gateStage: '23-2',
  },
  {
    id: 'dream_deep_gateau', nameKo: '드림 딥 가토', icon: '🎂', category: 'special',
    tier: 4, ingredients: { cream: 1, vanilla: 1, cacao: 1, flour: 1 }, baseReward: 183, cookTime: 14200,
    unlockCost: 234, gateStage: '23-3',
  },

  // ★★★★★ 5성 (3종)
  {
    id: 'cream_specter_verrine', nameKo: '크림 스펙터 베린', icon: '👻', category: 'special',
    tier: 5, ingredients: { cream: 2, vanilla: 1, cacao: 1, sugar: 1 }, baseReward: 334, cookTime: 21000,
    unlockCost: 536, gateStage: '23-3',
  },
  {
    id: 'deep_dream_mille_feuille', nameKo: '딥 드림 밀푀유', icon: '🍰', category: 'dessert',
    tier: 5, ingredients: { cream: 2, cacao: 2, butter: 1, flour: 1 }, baseReward: 346, cookTime: 21500,
    unlockCost: 554, gateStage: '23-4',
  },
  {
    id: 'queen_cream_supreme', nameKo: '여왕의 크림 수프림', icon: '👑', category: 'special',
    tier: 5, ingredients: { cream: 3, vanilla: 2, cacao: 1, sugar: 1, butter: 1 }, baseReward: 488, cookTime: 27500,
    unlockCost: 786, gateStage: '23-5',
  },
];

/**
 * 버프 레시피 전체 목록.
 */
export const ALL_BUFF_RECIPES = [
  // ── 스타터 6종 (기존) ──
  {
    id: 'carrot_stew', nameKo: '당근 스튜', icon: '🍲', category: 'soup',
    tier: 1, ingredients: { carrot: 2 },
    effectDesc: '공격속도 +30% (60초)', effectType: 'buff_speed', effectValue: 0.30,
    duration: 60000, unlockCost: 0, starter: true,
  },
  {
    id: 'grilled_steak', nameKo: '그릴 스테이크', icon: '🥩', category: 'grill',
    tier: 1, ingredients: { meat: 2 },
    effectDesc: '공격력 +40% (60초)', effectType: 'buff_damage', effectValue: 0.40,
    duration: 60000, unlockCost: 0, starter: true,
  },
  {
    id: 'mixed_stew', nameKo: '혼합 스튜', icon: '🍲', category: 'soup',
    tier: 2, ingredients: { carrot: 1, meat: 1 },
    effectDesc: '공격력+속도 +20% (45초)', effectType: 'buff_both', effectValue: 0.20,
    duration: 45000, unlockCost: 0, starter: true,
  },
  {
    id: 'squid_ink_brew', nameKo: '문어 먹물 양조', icon: '🐙', category: 'special',
    tier: 2, ingredients: { squid: 2 },
    effectDesc: '타워 사거리 +25% (50초)', effectType: 'buff_range', effectValue: 0.25,
    duration: 50000, unlockCost: 0, starter: true,
  },
  {
    id: 'devils_sauce', nameKo: '악마의 소스', icon: '🌶️', category: 'fry',
    tier: 2, ingredients: { pepper: 2 },
    effectDesc: '화상 피해 +50% (45초)', effectType: 'buff_burn', effectValue: 0.50,
    duration: 45000, unlockCost: 0, starter: true,
  },
  {
    id: 'fortify_bread', nameKo: '강화 빵', icon: '🍞', category: 'noodle',
    tier: 2, ingredients: { flour: 1, pepper: 1 },
    effectDesc: '둔화 효과 +30% (50초)', effectType: 'buff_slow', effectValue: 0.30,
    duration: 50000, unlockCost: 0, starter: true,
  },

  // ── Phase 5 신규 버프 2종 ──
  {
    id: 'egg_tonic', nameKo: '활력 에그 토닉', icon: '🥚', category: 'special',
    tier: 2, ingredients: { egg: 2 },
    effectDesc: '재료 드롭률 +30% (45초)', effectType: 'buff_drop', effectValue: 0.30,
    duration: 45000, unlockCost: 35,
  },
  {
    id: 'rice_wine', nameKo: '막걸리', icon: '🍶', category: 'special',
    tier: 3, ingredients: { rice: 2, flour: 1 },
    effectDesc: '조리 시간 -25% (50초)', effectType: 'buff_cook', effectValue: 0.25,
    duration: 50000, unlockCost: 45, gateStage: '1-3',
  },

  // ── Phase 6 신규 버프 3종 ──
  {
    id: 'cheese_shield', nameKo: '치즈 쉴드', icon: '🧀', category: 'special',
    tier: 2, ingredients: { cheese: 2 },
    effectDesc: '생명 감소 -20% (45초)', effectType: 'buff_shield', effectValue: 0.20,
    duration: 45000, unlockCost: 40,
  },
  {
    id: 'mushroom_focus', nameKo: '버섯 집중', icon: '🍄', category: 'special',
    tier: 2, ingredients: { mushroom: 2 },
    effectDesc: '타워 사거리 +30% (50초)', effectType: 'buff_range', effectValue: 0.30,
    duration: 50000, unlockCost: 45, gateStage: '2-1',
  },
  {
    id: 'fish_oil', nameKo: '생선 오일', icon: '🐟', category: 'grill',
    tier: 2, ingredients: { fish: 2 },
    effectDesc: '공격속도 +35% (50초)', effectType: 'buff_speed', effectValue: 0.35,
    duration: 50000, unlockCost: 50, gateStage: '2-1',
  },

  // ── Phase 8 신규 버프 4종 (3장: 바닷가 씨푸드 바) ──
  {
    id: 'tomato_vitality', nameKo: '토마토 활력 주스', icon: '🍅', category: 'buff',
    tier: 2, ingredients: { tomato: 1 },
    effectDesc: '전체 타워 공격속도 +20% (1웨이브)', effectType: 'buff_speed', effectValue: 0.20,
    duration: 1, durationUnit: 'wave', unlockCost: 35, gateStage: '3-1',
  },
  {
    id: 'shrimp_reflect', nameKo: '새우 반사 소스', icon: '🦐', category: 'buff',
    tier: 2, ingredients: { shrimp: 1 },
    effectDesc: '피격 적 반사 피해 15% (1웨이브)', effectType: 'buff_reflect', effectValue: 0.15,
    duration: 1, durationUnit: 'wave', unlockCost: 40, gateStage: '3-1',
  },
  {
    id: 'butter_lubricant', nameKo: '버터 윤활유', icon: '🧈', category: 'buff',
    tier: 3, ingredients: { butter: 1, flour: 1 },
    effectDesc: '배달 로봇 수집 속도 +40% (2웨이브)', effectType: 'buff_collect', effectValue: 0.40,
    duration: 2, durationUnit: 'wave', unlockCost: 55, gateStage: '3-3',
  },
  {
    id: 'cream_barrier', nameKo: '크림 결계', icon: '🧈', category: 'buff',
    tier: 3, ingredients: { butter: 1, cheese: 1 },
    effectDesc: '생명력 -1 방어 (1회)', effectType: 'buff_barrier', effectValue: 1,
    duration: 1, durationUnit: 'use', unlockCost: 60, gateStage: '3-4',
  },

  // ── Phase 9 신규 버프 3종 (4장: 화산 BBQ) ──
  {
    id: 'sugar_boost', nameKo: '설탕 부스트', icon: '🍬', category: 'buff',
    tier: 2, ingredients: { sugar: 1 },
    effectDesc: '재료 드롭률 +25% (1웨이브)', effectType: 'buff_drop', effectValue: 0.25,
    duration: 1, durationUnit: 'wave', unlockCost: 20, gateStage: '4-1',
  },
  {
    id: 'milk_shield', nameKo: '밀크 쉴드', icon: '🥛', category: 'buff',
    tier: 2, ingredients: { milk: 1 },
    effectDesc: '생명력 -1 방어 (1회)', effectType: 'buff_barrier', effectValue: 1,
    duration: 1, durationUnit: 'use', unlockCost: 20, gateStage: '4-1',
  },
  {
    id: 'caramel_coating', nameKo: '카라멜 코팅', icon: '🍯', category: 'buff',
    tier: 3, ingredients: { sugar: 1, milk: 1, butter: 1 },
    effectDesc: '전체 타워 공격력 +20% 공격속도 +10% (2웨이브)', effectType: 'buff_both', effectValue: 0.20,
    duration: 2, durationUnit: 'wave', unlockCost: 55, gateStage: '4-3',
  },

  // ── Phase 10 신규 버프 2종 (5장+6장) ──
  {
    id: 'wizard_blessing', nameKo: '마법사의 축복', icon: '✨', category: 'buff',
    tier: 3, ingredients: { sugar: 1, milk: 1, egg: 1 },
    effectDesc: '타워 사거리 +20% 적 이동속도 -10% (2웨이브)', effectType: 'buff_range_slow', effectValue: 0.20,
    duration: 2, durationUnit: 'wave', unlockCost: 65, gateStage: '5-3',
  },
  {
    id: 'final_awakening', nameKo: '최종 각성', icon: '🔥', category: 'buff',
    tier: 4, ingredients: { meat: 1, shrimp: 1, sugar: 1, butter: 1 },
    effectDesc: '공격력 +30% 공격속도 +20% 드롭률 +30% (3웨이브)', effectType: 'buff_all', effectValue: 0.30,
    duration: 3, durationUnit: 'wave', unlockCost: 100, gateStage: '6-2',
  },

  // ── Phase 20 신규 버프 2종 (7장 사쿠라 이자카야) ──
  {
    id: 'wasabi_kick', nameKo: '와사비 킥', icon: '🌿', category: 'buff',
    tier: 2, ingredients: { wasabi: 2 },
    effectDesc: '공격력 +35% (55초)', effectType: 'buff_damage', effectValue: 0.35,
    duration: 55000, unlockCost: 45, gateStage: '7-1',
  },
  {
    id: 'tuna_precision', nameKo: '참치 정밀타', icon: '🍣', category: 'buff',
    tier: 3, ingredients: { sashimi_tuna: 1, wasabi: 1 },
    effectDesc: '공격력+속도 +20% (50초)', effectType: 'buff_both', effectValue: 0.20,
    duration: 50000, unlockCost: 55, gateStage: '7-2',
  },

  // ── Phase 21 신규 버프 2종 (8장 용의 주방) ──
  {
    id: 'dragon_qi', nameKo: '용기(龍氣)', icon: '🐉', category: 'buff',
    tier: 3, ingredients: { tofu: 2, cilantro: 1 },
    effectDesc: '공격력 +30% (55초)', effectType: 'buff_damage', effectValue: 0.30,
    duration: 55000, unlockCost: 60, gateStage: '10-2',
  },
  {
    id: 'wok_aura', nameKo: '웍 오라', icon: '🔥', category: 'buff',
    tier: 3, ingredients: { tofu: 1, cilantro: 2 },
    effectDesc: '공격력+속도 +25% (50초)', effectType: 'buff_both', effectValue: 0.25,
    duration: 50000, unlockCost: 60, gateStage: '10-2',
  },

  // ── Phase 22-3 신규 버프 레시피 (8장 이자카야 심층부) ──
  {
    id: 'sake_clarity', nameKo: '사케 각성', icon: '🍶', category: 'buff',
    tier: 3, ingredients: { sake: 2 },
    effectDesc: '마취 디버프 면역 + 공격속도 +15% (3웨이브)',
    effectType: 'buff_narcotize_immunity',
    effectValue: 0.15,
    duration: 3, durationUnit: 'wave',
    unlockCost: 65, gateStage: '10-2',
  },
  {
    id: 'sake_oni_spirit', nameKo: '오니 정기', icon: '👹', category: 'buff',
    tier: 4, ingredients: { sake: 1, tofu: 1, cilantro: 1 },
    effectDesc: '공격력 +25% 공격속도 +25% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.25,
    duration: 2, durationUnit: 'wave',
    unlockCost: 85, gateStage: '10-3',
  },

  // ── Phase 25-1 신규 버프 레시피 (11장 용의 주방 심층부) ──
  {
    id: 'star_anise_ward', nameKo: '팔각 결계', icon: '✨', category: 'buff',
    tier: 3, ingredients: { star_anise: 2 },
    effectDesc: '어둠 디버프 면역 + 공격력 +15% (3웨이브)',
    effectType: 'buff_dark_immunity',
    effectValue: 0.15,
    duration: 3, durationUnit: 'wave',
    unlockCost: 70, gateStage: '11-2',
  },
  {
    id: 'dragon_five_spice', nameKo: '용의 오향', icon: '🐉', category: 'buff',
    tier: 4, ingredients: { star_anise: 1, cilantro: 1, tofu: 1 },
    effectDesc: '공격력 +30% 공격속도 +20% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.30,
    duration: 2, durationUnit: 'wave',
    unlockCost: 95, gateStage: '11-3',
  },

  // ── Phase 26-1 신규 버프 레시피 (12장 용의 궁전 결전) ──
  {
    id: 'dragon_fire_boost', nameKo: '용화 강화', icon: '🔥', category: 'buff',
    tier: 3, ingredients: { star_anise: 2, sake: 1 },
    effectDesc: '화염 공격력 +50% (2웨이브)',
    effectType: 'buff_burn',
    effectValue: 0.50,
    duration: 2, durationUnit: 'wave',
    unlockCost: 80, gateStage: '12-3',
  },
  {
    id: 'dragon_wok_aura', nameKo: '드래곤 웍 오라', icon: '🐉', category: 'buff',
    tier: 4, ingredients: { star_anise: 1, tofu: 2, cilantro: 1 },
    effectDesc: '공격력+속도 +35% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.35,
    duration: 2, durationUnit: 'wave',
    unlockCost: 100, gateStage: '12-5',
  },

  // ── Phase 27-3 신규 버프 레시피 (13장 별빛 비스트로) ──
  {
    id: 'truffle_essence', nameKo: '트러플 에센스', icon: '🍄', category: 'buff',
    tier: 3, ingredients: { truffle: 2 },
    effectDesc: '취기 디버프 면역 + 공격속도 +15% (3웨이브)',
    effectType: 'buff_wine_immunity',
    effectValue: 0.15,
    duration: 3, durationUnit: 'wave',
    unlockCost: 70, gateStage: '13-2',
  },
  {
    id: 'noir_awakening', nameKo: '누아르 각성', icon: '🌟', category: 'buff',
    tier: 4, ingredients: { truffle: 1, butter: 1, mushroom: 1 },
    effectDesc: '공격력+속도 +35% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.35,
    duration: 2, durationUnit: 'wave',
    unlockCost: 105, gateStage: '13-4',
  },

  // ── Phase 29-2 신규 버프 레시피 (15장 카타콩브) ──
  {
    id: 'herb_essence', nameKo: '허브 에센스', icon: '🌿', category: 'buff',
    tier: 3, ingredients: { herb_bundle: 2 },
    effectDesc: '이동속도 -25% (2웨이브)',
    effectType: 'debuff_slow',
    effectValue: 0.25,
    duration: 2, durationUnit: 'wave',
    unlockCost: 72, gateStage: '15-2',
  },
  {
    id: 'catacomb_mist', nameKo: '카타콩브 안개', icon: '🌫️', category: 'buff',
    tier: 3, ingredients: { herb_bundle: 1, mushroom: 1 },
    effectDesc: '범위 적 혼란 +공격속도 +20% (2웨이브)',
    effectType: 'buff_and_confuse',
    effectValue: 0.20,
    duration: 2, durationUnit: 'wave',
    unlockCost: 78, gateStage: '15-3',
  },
  {
    id: 'noir_herb_elixir', nameKo: '누아르 허브 엘릭서', icon: '⚗️', category: 'buff',
    tier: 4, ingredients: { herb_bundle: 1, truffle: 1, mushroom: 1 },
    effectDesc: '공격력+속도 +40% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.40,
    duration: 2, durationUnit: 'wave',
    unlockCost: 112, gateStage: '15-4',
  },
  {
    id: 'chefs_noir_blessing', nameKo: '셰프 누아르의 축복', icon: '🙏', category: 'buff',
    tier: 4, ingredients: { herb_bundle: 2, truffle: 1, butter: 1 },
    effectDesc: '전 도구 공격력 +30% + 재료 드롭률 +50% (3웨이브)',
    effectType: 'buff_attack_drop',
    effectValue: 0.30,
    duration: 3, durationUnit: 'wave',
    unlockCost: 125, gateStage: '15-5',
  },

  // ── Phase 31-3 신규 버프 레시피 (16장 향신료 궁전) ──
  {
    id: 'curry_aura', nameKo: '카레 오라', icon: '🌿', category: 'buff',
    tier: 3, ingredients: { curry_leaf: 2 },
    effectDesc: '이동속도 -30% (2웨이브)',
    effectType: 'debuff_slow',
    effectValue: 0.30,
    duration: 2, durationUnit: 'wave',
    unlockCost: 76, gateStage: '16-2',
  },
  {
    id: 'saffron_blessing', nameKo: '사프란의 축복', icon: '✨', category: 'buff',
    tier: 4, ingredients: { saffron: 1, curry_leaf: 1, butter: 1 },
    effectDesc: '공격력+속도 +45% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.45,
    duration: 2, durationUnit: 'wave',
    unlockCost: 120, gateStage: '16-4',
  },

  // ── Phase 32-3 신규 버프 레시피 (17장 향신료 궁전 심층부) ──
  {
    id: 'chai_shield', nameKo: '차이 방어막', icon: '☕', category: 'buff',
    tier: 3, ingredients: { chai: 2 },
    effectDesc: '받는 피해 -20% (2웨이브)',
    effectType: 'buff_defense',
    effectValue: 0.20,
    duration: 2, durationUnit: 'wave',
    unlockCost: 82, gateStage: '17-2',
  },
  {
    id: 'incense_blessing', nameKo: '향의 축복', icon: '🌸', category: 'buff',
    tier: 4, ingredients: { chai: 1, saffron: 1, curry_leaf: 1 },
    effectDesc: '공격력+속도 +50% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.50,
    duration: 2, durationUnit: 'wave',
    unlockCost: 135, gateStage: '17-4',
  },

  // ── Phase 32-5 신규 버프 레시피 (18장 향신료 궁전 최심부) ──
  {
    id: 'cardamom_aura', nameKo: '카다멈 오라', icon: '🪬', category: 'buff',
    tier: 4, ingredients: { cardamom: 2, chai: 1 },
    effectDesc: '혼란 면역 + 공격력 +20% (2웨이브)',
    effectType: 'buff_confuse_immune',
    effectValue: 0.20,
    duration: 2, durationUnit: 'wave',
    unlockCost: 140, gateStage: '18-3',
  },

  // ── Phase 33-3 신규 버프 레시피 (19장 선인장 칸티나) ──
  {
    id: 'salsa_boost', nameKo: '살사 부스트', icon: '🫙', category: 'buff',
    tier: 3, ingredients: { jalapeno: 2 },
    effectDesc: '공격 속도 +30% (2웨이브)',
    effectType: 'buff_attack_speed',
    effectValue: 0.30,
    duration: 2, durationUnit: 'wave',
    unlockCost: 85, gateStage: '19-2',
  },
  {
    id: 'fuego_blessing', nameKo: '불꽃의 축복', icon: '🌶️', category: 'buff',
    tier: 4, ingredients: { jalapeno: 1, meat: 1, tomato: 1 },
    effectDesc: '전 타워 피해 +40% + 공격 속도 +20% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.40,
    duration: 2, durationUnit: 'wave',
    unlockCost: 138, gateStage: '19-4',
  },

  // ── Phase 34-3 신규 버프 레시피 (20장 칸티나 심층부) ──
  {
    id: 'avocado_armor_boost', nameKo: '아보카도 방어 강화', icon: '🥑', category: 'buff',
    tier: 3, ingredients: { avocado: 1, butter: 1 },
    effectDesc: '전 타워 방어력 +35% (2웨이브)',
    effectType: 'buff_defense',
    effectValue: 0.35,
    duration: 2, durationUnit: 'wave',
    unlockCost: 95, gateStage: '20-2',
  },
  {
    id: 'guacamole_fury', nameKo: '과카몰리 분노', icon: '🌶️', category: 'buff',
    tier: 4, ingredients: { avocado: 1, jalapeno: 1, pepper: 1 },
    effectDesc: '공격속도 +45% + 공격력 +20% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.45,
    duration: 2, durationUnit: 'wave',
    unlockCost: 148, gateStage: '20-3',
  },

  // ── Phase 35-3 신규 버프 레시피 (21장 엘 디아블로 최종전) ──
  {
    id: 'diablo_pepper_blaze', nameKo: '디아블로 페퍼 블레이즈', icon: '🌶️', category: 'buff',
    tier: 4, ingredients: { avocado: 1, jalapeno: 2, cilantro: 1 },
    effectDesc: '전 타워 공격력 +40% + 사거리 +15% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.40,
    effectRangeValue: 0.15,
    duration: 2,
    unlockCost: 130, gateStage: '21-2',
  },
  {
    id: 'final_flame_blessing', nameKo: '최후의 불꽃 축복', icon: '🔥', category: 'buff',
    tier: 5, ingredients: { avocado: 2, jalapeno: 2, cilantro: 1, tomato: 1 },
    effectDesc: '전 타워 공격력+공격속도 +50% (2웨이브)',
    effectType: 'buff_both',
    effectValue: 0.50,
    duration: 2,
    unlockCost: 185, gateStage: '21-4',
  },

  // ── Phase 36-3 신규 버프 레시피 (22장 슈가 드림랜드) ──
  {
    id: 'vanilla_sweet_blessing', nameKo: '바닐라 달콤한 축복', icon: '🌸', category: 'buff',
    tier: 3, ingredients: { vanilla: 2 },
    effectDesc: '재료 드롭률 +40% + 수집 속도 +20% (2웨이브)',
    effectType: 'buff_drop_gather',
    effectValue: 0.40,
    duration: 2, durationUnit: 'wave',
    unlockCost: 98, gateStage: '22-2',
  },
  {
    id: 'cacao_dark_boost', nameKo: '카카오 다크 부스트', icon: '🍫', category: 'buff',
    tier: 4, ingredients: { cacao: 1, vanilla: 1, sugar: 1 },
    effectDesc: '전 타워 공격력 +35% + 경화 방어 무력화 (2웨이브)',
    effectType: 'buff_attack_piercing',
    effectValue: 0.35,
    duration: 2, durationUnit: 'wave',
    unlockCost: 152, gateStage: '22-3',
  },

  // ── Phase 37-2 신규 버프 레시피 (23장 드림랜드 심층부) ──
  {
    id: 'cream_magic_veil', nameKo: '크림 마법 베일', icon: '✨', category: 'buff',
    tier: 3, ingredients: { cream: 2, vanilla: 1 },
    effectDesc: '마법 저항 무력화 + 전 타워 공격력 +25% (2웨이브)',
    // 원래 의도: buff_attack_magic_pierce (macaron_knight magicResistance 무효화). 엔진 미지원으로 buff_attack_piercing 대체 (Phase 36-3 선례)
    effectType: 'buff_attack_piercing',
    effectValue: 0.25,
    duration: 2, durationUnit: 'wave',
    unlockCost: 108, gateStage: '23-2',
  },
  {
    id: 'specter_seal_cream', nameKo: '스펙터 봉인 크림', icon: '🔮', category: 'buff',
    tier: 4, ingredients: { cream: 1, cacao: 1, vanilla: 1, sugar: 1 },
    effectDesc: '분열 차단 + 전 타워 공격속도 +30% (2웨이브)',
    // 원래 의도: buff_speed_split_block (sugar_specter splitOnDeath 억제). 엔진 미지원으로 buff_all 대체
    effectType: 'buff_all',
    effectValue: 0.30,
    duration: 2, durationUnit: 'wave',
    unlockCost: 164, gateStage: '23-3',
  },
];

/** 전체 레시피 (서빙 + 버프) 통합 목록 */
export const ALL_RECIPES = [...ALL_SERVING_RECIPES, ...ALL_BUFF_RECIPES];

/** ID→레시피 빠른 조회 맵 */
export const RECIPE_MAP = Object.fromEntries(
  ALL_RECIPES.map(r => [r.id, r])
);

/** 스타터 레시피 ID 목록 */
export const STARTER_RECIPE_IDS = ALL_RECIPES
  .filter(r => r.starter)
  .map(r => r.id);
