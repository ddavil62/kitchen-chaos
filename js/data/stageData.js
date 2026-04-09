/**
 * @fileoverview 스테이지 데이터 정의.
 * Phase 4: 3개 스테이지 (1-1 ~ 1-3), 파스타 레스토랑 테마.
 * 각 스테이지는 고유 경로, 웨이브, 손님 구성을 가진다.
 */

// ── 스테이지 정의 ──

export const STAGES = {
  '1-1': {
    id: '1-1',
    nameKo: '파스타 가게 앞마당',
    theme: 'pasta',
    gridCols: 9,
    gridRows: 8,
    // L자 경로: 위→아래 → 왼쪽→오른쪽 → 위→아래
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 7 },
    ],
    waves: [
      {
        wave: 1,
        enemies: [
          { type: 'carrot_goblin', count: 6, interval: 1500 },
        ],
      },
      {
        wave: 2,
        enemies: [
          { type: 'carrot_goblin', count: 8, interval: 1200 },
          { type: 'meat_ogre', count: 1, interval: 3000 },
        ],
      },
      {
        wave: 3,
        enemies: [
          { type: 'carrot_goblin', count: 10, interval: 1000 },
          { type: 'meat_ogre', count: 3, interval: 2500 },
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
    ],
    customers: [
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
        ],
      },
      {
        wave: 5,
        customers: [
          { dish: 'seafood_pasta', patience: 32000, baseReward: 60, tipMultiplier: 1.5 },
          { dish: 'steak_plate', patience: 25000, baseReward: 55, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 6,
        customers: [
          { dish: 'cheese_fondue', patience: 35000, baseReward: 65, tipMultiplier: 1.5 },
          { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        ],
      },
    ],
    starThresholds: { three: 12, two: 8 },
  },

  '1-2': {
    id: '1-2',
    nameKo: '주방 뒷골목',
    theme: 'pasta',
    gridCols: 9,
    gridRows: 8,
    // S자 경로
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 5, rowEnd: 7 },
    ],
    waves: [
      {
        wave: 1,
        enemies: [
          { type: 'carrot_goblin', count: 8, interval: 1300 },
          { type: 'meat_ogre', count: 1, interval: 3000 },
        ],
      },
      {
        wave: 2,
        enemies: [
          { type: 'carrot_goblin', count: 10, interval: 1000 },
          { type: 'meat_ogre', count: 3, interval: 2500 },
        ],
      },
      {
        wave: 3,
        enemies: [
          { type: 'carrot_goblin', count: 12, interval: 900 },
          { type: 'chili_demon', count: 3, interval: 2000 },
          { type: 'meat_ogre', count: 2, interval: 2800 },
        ],
      },
      {
        wave: 4,
        enemies: [
          { type: 'carrot_goblin', count: 12, interval: 800 },
          { type: 'octopus_mage', count: 4, interval: 2200 },
          { type: 'chili_demon', count: 3, interval: 2000 },
        ],
      },
      {
        wave: 5,
        enemies: [
          { type: 'meat_ogre', count: 6, interval: 1800 },
          { type: 'chili_demon', count: 6, interval: 1500 },
          { type: 'octopus_mage', count: 4, interval: 2000 },
        ],
      },
      {
        wave: 6,
        enemies: [
          { type: 'carrot_goblin', count: 18, interval: 600 },
          { type: 'cheese_golem', count: 2, interval: 4000 },
          { type: 'octopus_mage', count: 5, interval: 1800 },
        ],
      },
      {
        wave: 7,
        enemies: [
          { type: 'meat_ogre', count: 8, interval: 1500 },
          { type: 'chili_demon', count: 8, interval: 1200 },
          { type: 'cheese_golem', count: 3, interval: 3000 },
        ],
      },
    ],
    customers: [
      {
        wave: 1,
        customers: [
          { dish: 'carrot_soup', patience: 38000, baseReward: 25, tipMultiplier: 1.5 },
        ],
      },
      {
        wave: 2,
        customers: [
          { dish: 'steak_plate', patience: 35000, baseReward: 55, tipMultiplier: 1.5 },
          { dish: 'carrot_soup', patience: 30000, baseReward: 25, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 3,
        customers: [
          { dish: 'spicy_stir_fry', patience: 30000, baseReward: 50, tipMultiplier: 1.5 },
          { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 4,
        customers: [
          { dish: 'seafood_pasta', patience: 30000, baseReward: 60, tipMultiplier: 1.5 },
          { dish: 'mixed_platter', patience: 32000, baseReward: 70, tipMultiplier: 1.5 },
        ],
      },
      {
        wave: 5,
        customers: [
          { dish: 'cheese_fondue', patience: 32000, baseReward: 65, tipMultiplier: 1.5 },
          { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.3, vip: true },
        ],
      },
      {
        wave: 6,
        customers: [
          { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.5, vip: true },
          { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 7,
        customers: [
          { dish: 'cheese_fondue', patience: 28000, baseReward: 70, tipMultiplier: 1.5, vip: true },
          { dish: 'seafood_pasta', patience: 24000, baseReward: 60, tipMultiplier: 1.3, vip: true },
        ],
      },
    ],
    starThresholds: { three: 13, two: 9 },
  },

  '1-3': {
    id: '1-3',
    nameKo: '와인 저장고',
    theme: 'pasta',
    gridCols: 9,
    gridRows: 8,
    // 지그재그 경로
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 3, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 5, rowEnd: 7 },
    ],
    waves: [
      {
        wave: 1,
        enemies: [
          { type: 'carrot_goblin', count: 10, interval: 1200 },
          { type: 'meat_ogre', count: 2, interval: 2800 },
        ],
      },
      {
        wave: 2,
        enemies: [
          { type: 'carrot_goblin', count: 12, interval: 1000 },
          { type: 'chili_demon', count: 3, interval: 2000 },
          { type: 'meat_ogre', count: 3, interval: 2500 },
        ],
      },
      {
        wave: 3,
        enemies: [
          { type: 'octopus_mage', count: 5, interval: 2000 },
          { type: 'chili_demon', count: 5, interval: 1500 },
          { type: 'meat_ogre', count: 4, interval: 2200 },
        ],
      },
      {
        wave: 4,
        enemies: [
          { type: 'carrot_goblin', count: 15, interval: 700 },
          { type: 'cheese_golem', count: 2, interval: 4000 },
          { type: 'octopus_mage', count: 4, interval: 2000 },
        ],
      },
      {
        wave: 5,
        enemies: [
          { type: 'meat_ogre', count: 8, interval: 1500 },
          { type: 'chili_demon', count: 6, interval: 1300 },
          { type: 'cheese_golem', count: 2, interval: 3500 },
        ],
      },
      {
        wave: 6,
        enemies: [
          { type: 'carrot_goblin', count: 20, interval: 500 },
          { type: 'octopus_mage', count: 6, interval: 1800 },
          { type: 'cheese_golem', count: 3, interval: 3000 },
          { type: 'flour_ghost', count: 4, interval: 2500 },
        ],
      },
      {
        wave: 7,
        enemies: [
          { type: 'meat_ogre', count: 10, interval: 1200 },
          { type: 'chili_demon', count: 8, interval: 1200 },
          { type: 'cheese_golem', count: 3, interval: 3000 },
          { type: 'flour_ghost', count: 6, interval: 2000 },
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
          { type: 'flour_ghost', count: 8, interval: 1800 },
        ],
      },
    ],
    customers: [
      {
        wave: 1,
        customers: [
          { dish: 'carrot_soup', patience: 35000, baseReward: 25, tipMultiplier: 1.5 },
          { dish: 'steak_plate', patience: 38000, baseReward: 55, tipMultiplier: 1.5 },
        ],
      },
      {
        wave: 2,
        customers: [
          { dish: 'spicy_stir_fry', patience: 30000, baseReward: 50, tipMultiplier: 1.5 },
          { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 3,
        customers: [
          { dish: 'seafood_pasta', patience: 30000, baseReward: 60, tipMultiplier: 1.5 },
          { dish: 'mixed_platter', patience: 32000, baseReward: 70, tipMultiplier: 1.5 },
        ],
      },
      {
        wave: 4,
        customers: [
          { dish: 'cheese_fondue', patience: 30000, baseReward: 65, tipMultiplier: 1.5 },
          { dish: 'carrot_soup', patience: 22000, baseReward: 30, tipMultiplier: 1.3 },
          { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 5,
        customers: [
          { dish: 'mixed_platter', patience: 26000, baseReward: 70, tipMultiplier: 1.5, vip: true },
          { dish: 'steak_plate', patience: 22000, baseReward: 55, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 6,
        customers: [
          { dish: 'cheese_fondue', patience: 28000, baseReward: 70, tipMultiplier: 1.5, vip: true },
          { dish: 'seafood_pasta', patience: 24000, baseReward: 60, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 7,
        customers: [
          { dish: 'mixed_platter', patience: 24000, baseReward: 75, tipMultiplier: 1.5, vip: true },
          { dish: 'cheese_fondue', patience: 26000, baseReward: 70, tipMultiplier: 1.5 },
          { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
        ],
      },
      {
        wave: 8,
        customers: [
          { dish: 'cheese_fondue', patience: 25000, baseReward: 70, tipMultiplier: 1.5, vip: true },
          { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
          { dish: 'seafood_pasta', patience: 20000, baseReward: 60, tipMultiplier: 1.3, vip: true },
        ],
      },
    ],
    starThresholds: { three: 11, two: 7 },
  },
};

/** 스테이지 순서 */
export const STAGE_ORDER = ['1-1', '1-2', '1-3'];
