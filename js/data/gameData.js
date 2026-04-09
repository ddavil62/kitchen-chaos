/**
 * @fileoverview Kitchen Chaos Defense 게임 데이터 정의.
 * 적, 타워, 재료, 레시피 데이터를 상수로 관리한다.
 */

// ── 적 타입 정의 ──
export const ENEMY_TYPES = {
  carrot_goblin: {
    id: 'carrot_goblin',
    nameKo: '당근 고블린',
    texture: 'enemy_carrot',
    hp: 80,
    speed: 90,        // px/s
    goldReward: 5,
    ingredient: 'carrot',
  },
  meat_ogre: {
    id: 'meat_ogre',
    nameKo: '고기 오우거',
    texture: 'enemy_meat',
    hp: 220,
    speed: 45,        // px/s
    goldReward: 12,
    ingredient: 'meat',
  },
};

// ── 타워 타입 정의 ──
export const TOWER_TYPES = {
  pan: {
    id: 'pan',
    nameKo: '프라이팬',
    texture: 'tower_pan',
    cost: 30,
    damage: 25,
    range: 100,
    fireRate: 1000,   // ms between shots
    projectileSpeed: 200,
    color: 0xc0c0c0,
  },
  salt: {
    id: 'salt',
    nameKo: '소금 분사기',
    texture: 'tower_salt',
    cost: 55,
    damage: 12,
    range: 120,
    fireRate: 600,
    projectileSpeed: 180,
    slowFactor: 0.5,  // 적 속도를 50%로 감소
    slowDuration: 2000, // ms
    color: 0x87ceeb,
  },
  grill: {
    id: 'grill',
    nameKo: '화염 그릴',
    texture: 'tower_grill',
    cost: 90,
    damage: 18,
    range: 90,
    fireRate: 800,
    projectileSpeed: 220,
    burnDamage: 5,    // 화상 틱당 피해
    burnDuration: 3000, // ms
    burnInterval: 500,  // ms
    color: 0xff4500,
  },
};

// ── 재료 타입 정의 ──
export const INGREDIENT_TYPES = {
  carrot: {
    id: 'carrot',
    nameKo: '당근',
    texture: 'ingredient_carrot',
    color: 0xff6b35,
  },
  meat: {
    id: 'meat',
    nameKo: '고기',
    texture: 'ingredient_meat',
    color: 0xdc143c,
  },
};

// ── 레시피 정의 ──
// ingredients: { [ingredientId]: count } 형식
// effect: 적용 효과 함수 (CookingStation에서 처리)
export const RECIPES = [
  {
    id: 'carrot_stew',
    nameKo: '당근 스튜',
    ingredients: { carrot: 2 },
    effectDesc: '전 타워 공격속도 +30% (60초)',
    effectType: 'buff_speed',
    effectValue: 0.30,
    duration: 60000,
    color: 0xffa500,
  },
  {
    id: 'grilled_steak',
    nameKo: '그릴 스테이크',
    ingredients: { meat: 2 },
    effectDesc: '전 타워 공격력 +40% (60초)',
    effectType: 'buff_damage',
    effectValue: 0.40,
    duration: 60000,
    color: 0x8b0000,
  },
  {
    id: 'mixed_stew',
    nameKo: '혼합 스튜',
    ingredients: { carrot: 1, meat: 1 },
    effectDesc: '전 타워 공격력+속도 +20% (45초)',
    effectType: 'buff_both',
    effectValue: 0.20,
    duration: 45000,
    color: 0xcd853f,
  },
];

// ── 웨이브 정의 ──
// { type: string, count: number, interval: ms }
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
    ],
  },
  {
    wave: 4,
    enemies: [
      { type: 'carrot_goblin', count: 15, interval: 800 },
      { type: 'meat_ogre', count: 6, interval: 2000 },
    ],
  },
  {
    wave: 5,
    enemies: [
      { type: 'carrot_goblin', count: 20, interval: 700 },
      { type: 'meat_ogre', count: 10, interval: 1800 },
    ],
  },
];
