/**
 * @fileoverview Kitchen Chaos Defense 게임 데이터 정의.
 * Phase 3: 적 5종, 타워 4종, 재료 5종, 레시피 12종, 8 웨이브.
 */

// ── 적 타입 정의 ──
export const ENEMY_TYPES = {
  carrot_goblin: {
    id: 'carrot_goblin',
    nameKo: '당근 고블린',
    hp: 80,
    speed: 90,
    ingredient: 'carrot',
    bodyColor: 0xff6b35,
  },
  meat_ogre: {
    id: 'meat_ogre',
    nameKo: '고기 오우거',
    hp: 220,
    speed: 45,
    ingredient: 'meat',
    bodyColor: 0xdc143c,
  },
  octopus_mage: {
    id: 'octopus_mage',
    nameKo: '문어 마법사',
    hp: 150,
    speed: 60,
    ingredient: 'squid',
    bodyColor: 0x9370db,
  },
  chili_demon: {
    id: 'chili_demon',
    nameKo: '고추 악마',
    hp: 100,
    speed: 110,
    ingredient: 'pepper',
    bodyColor: 0xff2200,
  },
  cheese_golem: {
    id: 'cheese_golem',
    nameKo: '치즈 골렘',
    hp: 400,
    speed: 30,
    ingredient: 'flour',
    bodyColor: 0xffd700,
    regenRate: 3,     // HP/초 자연 재생
  },
};

// ── 타워 타입 정의 ──
export const TOWER_TYPES = {
  pan: {
    id: 'pan',
    nameKo: '프라이팬',
    cost: 30,
    damage: 25,
    range: 100,
    fireRate: 1000,
    projectileSpeed: 200,
    color: 0xc0c0c0,
  },
  salt: {
    id: 'salt',
    nameKo: '소금 분사기',
    cost: 55,
    damage: 12,
    range: 120,
    fireRate: 600,
    projectileSpeed: 180,
    slowFactor: 0.5,
    slowDuration: 2000,
    color: 0x87ceeb,
  },
  grill: {
    id: 'grill',
    nameKo: '화염 그릴',
    cost: 90,
    damage: 18,
    range: 90,
    fireRate: 800,
    projectileSpeed: 220,
    burnDamage: 5,
    burnDuration: 3000,
    burnInterval: 500,
    color: 0xff4500,
  },
  delivery: {
    id: 'delivery',
    nameKo: '배달 로봇',
    cost: 45,
    damage: 0,
    range: 110,
    fireRate: 0,
    projectileSpeed: 0,
    collectRadius: 110,   // 재료 자동 수거 범위
    collectInterval: 2000, // 수거 주기 ms
    color: 0x00cc88,
  },
};

// ── 재료 타입 정의 ──
export const INGREDIENT_TYPES = {
  carrot: {
    id: 'carrot',
    nameKo: '당근',
    color: 0xff6b35,
    icon: '🥕',
  },
  meat: {
    id: 'meat',
    nameKo: '고기',
    color: 0xdc143c,
    icon: '🥩',
  },
  squid: {
    id: 'squid',
    nameKo: '문어',
    color: 0x9370db,
    icon: '🐙',
  },
  pepper: {
    id: 'pepper',
    nameKo: '고추',
    color: 0xff2200,
    icon: '🌶️',
  },
  flour: {
    id: 'flour',
    nameKo: '밀가루',
    color: 0xfaebd7,
    icon: '🌾',
  },
};

// ── 서빙 레시피 (손님 주문용, Phase 3: cookTime 추가) ──
export const SERVING_RECIPES = [
  {
    id: 'carrot_soup',
    nameKo: '당근 수프',
    ingredients: { carrot: 1 },
    baseReward: 20,
    icon: '🍲',
    color: 0xffa500,
    cookTime: 3000,     // 3초
  },
  {
    id: 'steak_plate',
    nameKo: '스테이크 정식',
    ingredients: { meat: 2 },
    baseReward: 50,
    icon: '🥩',
    color: 0x8b0000,
    cookTime: 6000,     // 6초
  },
  {
    id: 'mixed_platter',
    nameKo: '혼합 플래터',
    ingredients: { carrot: 2, meat: 1 },
    baseReward: 65,
    icon: '🍽️',
    color: 0xcd853f,
    cookTime: 8000,     // 8초
  },
  {
    id: 'seafood_pasta',
    nameKo: '해산물 파스타',
    ingredients: { squid: 1, flour: 1 },
    baseReward: 55,
    icon: '🍝',
    color: 0xdaa520,
    cookTime: 7000,
  },
  {
    id: 'spicy_stir_fry',
    nameKo: '매운 볶음',
    ingredients: { pepper: 1, meat: 1 },
    baseReward: 45,
    icon: '🍳',
    color: 0xff4500,
    cookTime: 5000,
  },
  {
    id: 'cheese_fondue',
    nameKo: '치즈 퐁뒤',
    ingredients: { flour: 2, carrot: 1 },
    baseReward: 60,
    icon: '🧀',
    color: 0xffd700,
    cookTime: 9000,
  },
];

/** 서빙 레시피를 ID로 빠르게 조회하기 위한 맵 */
export const SERVING_RECIPE_MAP = Object.fromEntries(
  SERVING_RECIPES.map(r => [r.id, r])
);

// ── 버프 레시피 (타워 강화용) ──
export const BUFF_RECIPES = [
  {
    id: 'carrot_stew',
    nameKo: '당근 스튜',
    ingredients: { carrot: 2 },
    effectDesc: '공격속도 +30% (60초)',
    effectType: 'buff_speed',
    effectValue: 0.30,
    duration: 60000,
    color: 0xffa500,
  },
  {
    id: 'grilled_steak',
    nameKo: '그릴 스테이크',
    ingredients: { meat: 2 },
    effectDesc: '공격력 +40% (60초)',
    effectType: 'buff_damage',
    effectValue: 0.40,
    duration: 60000,
    color: 0x8b0000,
  },
  {
    id: 'mixed_stew',
    nameKo: '혼합 스튜',
    ingredients: { carrot: 1, meat: 1 },
    effectDesc: '공격력+속도 +20% (45초)',
    effectType: 'buff_both',
    effectValue: 0.20,
    duration: 45000,
    color: 0xcd853f,
  },
  {
    id: 'squid_ink_brew',
    nameKo: '문어 먹물 양조',
    ingredients: { squid: 2 },
    effectDesc: '타워 사거리 +25% (50초)',
    effectType: 'buff_range',
    effectValue: 0.25,
    duration: 50000,
    color: 0x483d8b,
  },
  {
    id: 'devils_sauce',
    nameKo: '악마의 소스',
    ingredients: { pepper: 2 },
    effectDesc: '화상 피해 +50% (45초)',
    effectType: 'buff_burn',
    effectValue: 0.50,
    duration: 45000,
    color: 0xff2200,
  },
  {
    id: 'fortify_bread',
    nameKo: '강화 빵',
    ingredients: { flour: 1, pepper: 1 },
    effectDesc: '둔화 효과 +30% (50초)',
    effectType: 'buff_slow',
    effectValue: 0.30,
    duration: 50000,
    color: 0xdeb887,
  },
];

// 하위 호환
export const RECIPES = BUFF_RECIPES;

// ── 웨이브별 손님 데이터 (8 웨이브) ──
export const WAVE_CUSTOMERS = [
  {
    wave: 1,
    customers: [
      { dish: 'carrot_soup', patience: 40000, baseReward: 25, tipMultiplier: 1.5 },
    ],
  },
  {
    wave: 2,
    customers: [
      { dish: 'carrot_soup', patience: 35000, baseReward: 25, tipMultiplier: 1.5 },
      { dish: 'steak_plate', patience: 40000, baseReward: 55, tipMultiplier: 1.5 },
    ],
  },
  {
    wave: 3,
    customers: [
      { dish: 'steak_plate', patience: 32000, baseReward: 55, tipMultiplier: 1.5 },
      { dish: 'carrot_soup', patience: 28000, baseReward: 25, tipMultiplier: 1.3 },
    ],
  },
  {
    wave: 4,
    customers: [
      { dish: 'carrot_soup', patience: 25000, baseReward: 30, tipMultiplier: 1.3 },
      { dish: 'mixed_platter', patience: 35000, baseReward: 70, tipMultiplier: 1.5 },
      { dish: 'spicy_stir_fry', patience: 30000, baseReward: 50, tipMultiplier: 1.3 },
    ],
  },
  {
    wave: 5,
    customers: [
      { dish: 'seafood_pasta', patience: 32000, baseReward: 60, tipMultiplier: 1.5 },
      { dish: 'steak_plate', patience: 25000, baseReward: 55, tipMultiplier: 1.3 },
      { dish: 'carrot_soup', patience: 22000, baseReward: 30, tipMultiplier: 1.3 },
    ],
  },
  {
    wave: 6,
    customers: [
      { dish: 'cheese_fondue', patience: 35000, baseReward: 65, tipMultiplier: 1.5 },
      { dish: 'spicy_stir_fry', patience: 28000, baseReward: 50, tipMultiplier: 1.3 },
      { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.5, vip: true },
    ],
  },
  {
    wave: 7,
    customers: [
      { dish: 'seafood_pasta', patience: 25000, baseReward: 60, tipMultiplier: 1.5, vip: true },
      { dish: 'cheese_fondue', patience: 30000, baseReward: 65, tipMultiplier: 1.3 },
      { dish: 'steak_plate', patience: 22000, baseReward: 55, tipMultiplier: 1.3 },
    ],
  },
  {
    wave: 8,
    customers: [
      { dish: 'cheese_fondue', patience: 28000, baseReward: 70, tipMultiplier: 1.5, vip: true },
      { dish: 'mixed_platter', patience: 25000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
    ],
  },
];

// ── 웨이브 정의 (8 웨이브) ──
export const WAVES = [
  {
    wave: 1,
    enemies: [
      { type: 'carrot_goblin', count: 8, interval: 1200 },
    ],
  },
  {
    wave: 2,
    enemies: [
      { type: 'carrot_goblin', count: 10, interval: 1000 },
      { type: 'meat_ogre', count: 2, interval: 3000 },
    ],
  },
  {
    wave: 3,
    enemies: [
      { type: 'carrot_goblin', count: 12, interval: 900 },
      { type: 'meat_ogre', count: 4, interval: 2500 },
      { type: 'chili_demon', count: 2, interval: 2000 },
    ],
  },
  {
    wave: 4,
    enemies: [
      { type: 'carrot_goblin', count: 10, interval: 800 },
      { type: 'meat_ogre', count: 5, interval: 2200 },
      { type: 'octopus_mage', count: 3, interval: 2500 },
    ],
  },
  {
    wave: 5,
    enemies: [
      { type: 'carrot_goblin', count: 15, interval: 700 },
      { type: 'chili_demon', count: 5, interval: 1800 },
      { type: 'octopus_mage', count: 3, interval: 2200 },
    ],
  },
  {
    wave: 6,
    enemies: [
      { type: 'meat_ogre', count: 8, interval: 1800 },
      { type: 'octopus_mage', count: 5, interval: 2000 },
      { type: 'cheese_golem', count: 2, interval: 4000 },
    ],
  },
  {
    wave: 7,
    enemies: [
      { type: 'carrot_goblin', count: 20, interval: 600 },
      { type: 'chili_demon', count: 8, interval: 1500 },
      { type: 'cheese_golem', count: 3, interval: 3500 },
    ],
  },
  {
    wave: 8,
    enemies: [
      { type: 'carrot_goblin', count: 20, interval: 500 },
      { type: 'meat_ogre', count: 10, interval: 1200 },
      { type: 'octopus_mage', count: 6, interval: 1800 },
      { type: 'chili_demon', count: 8, interval: 1500 },
      { type: 'cheese_golem', count: 4, interval: 3000 },
    ],
  },
];
