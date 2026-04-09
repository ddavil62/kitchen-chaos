/**
 * @fileoverview 레시피 컬렉션 데이터.
 * Phase 9: 스타터 12종 + Phase 5 12종 + Phase 6 18종 + Phase 8 24종 + Phase 9 23종 = 89종.
 * 향후 120종까지 확장 예정.
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
