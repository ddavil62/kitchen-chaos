/**
 * @fileoverview 스테이지 데이터 정의.
 * Phase 9: 21개 스테이지 (1-1 ~ 1-6, 2-1 ~ 2-3, 3-1 ~ 3-6, 4-1 ~ 4-6).
 * 1장: 파스타 레스토랑, 2장: 동양 요리, 3장: 바닷가 씨푸드 바, 4장: 화산 BBQ.
 * 각 스테이지는 고유 경로, 웨이브, 손님 구성을 가진다.
 */

// ── 스테이지 정의 ──

export const STAGES = {
  '1-1': {
    id: '1-1',
    nameKo: '파스타 가게 앞마당',
    theme: 'pasta',
    availableTowers: ['pan', 'delivery', 'salt'],
    gridCols: 9,
    gridRows: 10,
    // L자 경로: 위→아래 → 왼쪽→오른쪽 → 위→아래
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 4, rowEnd: 9 },
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
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 180,         // 영업 시간 (초)
      customerInterval: 6,   // 손님 입장 간격 (초)
      maxCustomers: 15,      // 최대 손님 수
      customerPatience: 50,  // 기본 인내심 (초)
    },
  },

  '1-2': {
    id: '1-2',
    nameKo: '주방 뒷골목',
    theme: 'pasta',
    availableTowers: ['pan', 'salt', 'grill', 'delivery'],
    gridCols: 9,
    gridRows: 10,
    // S자 경로: 10행 확장
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 6, rowEnd: 9 },
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
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 180,
      customerInterval: 5.5,
      maxCustomers: 18,
      customerPatience: 48,
    },
  },

  '1-3': {
    id: '1-3',
    nameKo: '와인 저장고',
    theme: 'pasta',
    availableTowers: ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 지그재그 경로: 10행 확장
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 6, rowEnd: 9 },
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
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 200,
      customerInterval: 5,
      maxCustomers: 20,
      customerPatience: 45,
    },
  },

  // ── Phase 5 신규 스테이지 ──

  '1-4': {
    id: '1-4',
    nameKo: '연회장',
    theme: 'pasta',
    availableTowers: ['pan', 'salt', 'grill', 'delivery', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // U자 경로: 10행 확장
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 8 },
      { type: 'horizontal', row: 8, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 0, rowEnd: 8 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 10, interval: 1100 },
        { type: 'egg_sprite', count: 3, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'meat_ogre', count: 4, interval: 2200 },
        { type: 'egg_sprite', count: 5, interval: 1800 },
      ]},
      { wave: 3, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 800 },
        { type: 'chili_demon', count: 4, interval: 1600 },
        { type: 'egg_sprite', count: 4, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'octopus_mage', count: 5, interval: 2000 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 5, enemies: [
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'meat_ogre', count: 5, interval: 1800 },
      ]},
      { wave: 6, enemies: [
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'egg_sprite', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 7, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'chili_demon', count: 8, interval: 1200 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 8, enemies: [
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'octopus_mage', count: 6, interval: 1800 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'egg_sprite', count: 10, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 35000, baseReward: 25, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 32000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'spicy_stir_fry', patience: 28000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'seafood_pasta', patience: 30000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 28000, baseReward: 65, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 26000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'spicy_stir_fry', patience: 22000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 25000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 22000, baseReward: 60, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
    ],
    starThresholds: { three: 12, two: 8 },
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 200,
      customerInterval: 5,
      maxCustomers: 20,
      customerPatience: 42,
    },
  },

  '1-5': {
    id: '1-5',
    nameKo: '조리 실습실',
    theme: 'pasta',
    availableTowers: ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 십자(+) 경로: 10행 확장
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 4, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 1000 },
        { type: 'rice_slime', count: 2, interval: 3000 },
      ]},
      { wave: 2, enemies: [
        { type: 'egg_sprite', count: 6, interval: 1500 },
        { type: 'meat_ogre', count: 4, interval: 2200 },
        { type: 'rice_slime', count: 2, interval: 3000 },
      ]},
      { wave: 3, enemies: [
        { type: 'chili_demon', count: 6, interval: 1400 },
        { type: 'octopus_mage', count: 4, interval: 2000 },
        { type: 'rice_slime', count: 3, interval: 2800 },
      ]},
      { wave: 4, enemies: [
        { type: 'carrot_goblin', count: 15, interval: 600 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 5, enemies: [
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'chili_demon', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
      { wave: 6, enemies: [
        { type: 'octopus_mage', count: 6, interval: 1800 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
        { type: 'egg_sprite', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 3, interval: 2800 },
      ]},
      { wave: 7, enemies: [
        { type: 'flour_ghost', count: 10, interval: 1500 },
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'rice_slime', count: 5, interval: 2200 },
      ]},
      { wave: 8, enemies: [
        { type: 'flour_ghost', count: 12, interval: 1200 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'egg_sprite', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
      { wave: 9, enemies: [
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'flour_ghost', count: 8, interval: 1500 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 32000, baseReward: 25, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 35000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 28000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 28000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 26000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.5, vip: true },
        { dish: 'spicy_stir_fry', patience: 22000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 24000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 22000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'seafood_pasta', patience: 22000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 7, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 65, tipMultiplier: 1.3, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 16000, baseReward: 60, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 13, two: 9 },
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 220,
      customerInterval: 4.5,
      maxCustomers: 22,
      customerPatience: 40,
    },
  },

  '1-6': {
    id: '1-6',
    nameKo: '그랜드 홀 (보스)',
    theme: 'pasta',
    availableTowers: ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 나선 경로: 10행 확장
    pathSegments: [
      { type: 'horizontal', row: 0, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 0, rowEnd: 8 },
      { type: 'horizontal', row: 8, colStart: 2, colEnd: 8 },
      { type: 'vertical', col: 2, rowStart: 4, rowEnd: 8 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 5 },
      { type: 'vertical', col: 5, rowStart: 4, rowEnd: 6 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 900 },
        { type: 'egg_sprite', count: 4, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'meat_ogre', count: 6, interval: 1800 },
        { type: 'rice_slime', count: 3, interval: 2500 },
        { type: 'chili_demon', count: 4, interval: 1500 },
      ]},
      { wave: 3, enemies: [
        { type: 'octopus_mage', count: 6, interval: 1600 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
        { type: 'flour_ghost', count: 5, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'egg_sprite', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
      { wave: 5, enemies: [
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 6, enemies: [
        { type: 'flour_ghost', count: 10, interval: 1200 },
        { type: 'octopus_mage', count: 6, interval: 1600 },
        { type: 'rice_slime', count: 5, interval: 2200 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 7, enemies: [
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 8, enemies: [
        { type: 'flour_ghost', count: 12, interval: 1000 },
        { type: 'octopus_mage', count: 8, interval: 1500 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'egg_sprite', count: 10, interval: 1000 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 9, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'meat_ogre', count: 12, interval: 1000 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'flour_ghost', count: 10, interval: 1200 },
      ]},
      // 웨이브 10: 보스
      { wave: 10, enemies: [
        { type: 'pasta_boss', count: 1, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 30000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 32000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 26000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 26000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 24000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 24000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 20000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 18000, baseReward: 60, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 16000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 60000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 14, two: 10 },
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 240,
      customerInterval: 4,
      maxCustomers: 25,
      customerPatience: 38,
    },
  },

  // ── Phase 6 2장: 동양 요리 식당 ──

  '2-1': {
    id: '2-1',
    nameKo: '이자카야',
    theme: 'oriental',
    availableTowers: ['pan', 'salt', 'grill', 'delivery'],
    gridCols: 9,
    gridRows: 10,
    // 직선 + 분기 경로: 10행 확장
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 9 },
      { type: 'horizontal', row: 5, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 0, rowEnd: 5 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 10, interval: 1200 },
        { type: 'fish_knight', count: 2, interval: 3000 },
      ]},
      { wave: 2, enemies: [
        { type: 'fish_knight', count: 4, interval: 2200 },
        { type: 'carrot_goblin', count: 8, interval: 1000 },
      ]},
      { wave: 3, enemies: [
        { type: 'meat_ogre', count: 4, interval: 2000 },
        { type: 'fish_knight', count: 5, interval: 1800 },
        { type: 'chili_demon', count: 3, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'carrot_goblin', count: 14, interval: 700 },
        { type: 'fish_knight', count: 6, interval: 1600 },
        { type: 'egg_sprite', count: 4, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'fish_knight', count: 8, interval: 1400 },
        { type: 'meat_ogre', count: 5, interval: 1800 },
        { type: 'octopus_mage', count: 3, interval: 2200 },
      ]},
      { wave: 6, enemies: [
        { type: 'carrot_goblin', count: 18, interval: 600 },
        { type: 'fish_knight', count: 6, interval: 1500 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 7, enemies: [
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'chili_demon', count: 8, interval: 1200 },
        { type: 'meat_ogre', count: 6, interval: 1800 },
      ]},
      { wave: 8, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 35000, baseReward: 25, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 32000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'carrot_soup', patience: 28000, baseReward: 25, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'spicy_stir_fry', patience: 28000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 28000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 26000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'mixed_platter', patience: 24000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'spicy_stir_fry', patience: 22000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
    ],
    starThresholds: { three: 12, two: 8 },
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 240,
      customerInterval: 4,
      maxCustomers: 25,
      customerPatience: 38,
    },
  },

  '2-2': {
    id: '2-2',
    nameKo: '야시장',
    theme: 'oriental',
    availableTowers: ['pan', 'salt', 'grill', 'delivery', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 지그재그 경로: 10행 확장
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 1, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 4, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 2, colEnd: 8 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 10, interval: 1100 },
        { type: 'mushroom_scout', count: 3, interval: 2500 },
      ]},
      { wave: 2, enemies: [
        { type: 'mushroom_scout', count: 6, interval: 1800 },
        { type: 'cheese_rat', count: 4, interval: 2000 },
      ]},
      { wave: 3, enemies: [
        { type: 'fish_knight', count: 5, interval: 1800 },
        { type: 'mushroom_scout', count: 5, interval: 1600 },
        { type: 'egg_sprite', count: 4, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'cheese_rat', count: 8, interval: 1200 },
        { type: 'meat_ogre', count: 4, interval: 2200 },
        { type: 'mushroom_scout', count: 4, interval: 1800 },
      ]},
      { wave: 5, enemies: [
        { type: 'carrot_goblin', count: 16, interval: 600 },
        { type: 'cheese_rat', count: 6, interval: 1500 },
        { type: 'fish_knight', count: 4, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'cheese_rat', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 3, interval: 2800 },
      ]},
      { wave: 7, enemies: [
        { type: 'fish_knight', count: 8, interval: 1500 },
        { type: 'cheese_rat', count: 10, interval: 1000 },
        { type: 'mushroom_scout', count: 6, interval: 1500 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 8, enemies: [
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'cheese_rat', count: 12, interval: 900 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 9, enemies: [
        { type: 'carrot_goblin', count: 22, interval: 450 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'cheese_rat', count: 10, interval: 1000 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 32000, baseReward: 25, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 35000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 28000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 28000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 28000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 26000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.5, vip: true },
        { dish: 'spicy_stir_fry', patience: 22000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 24000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 22000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'seafood_pasta', patience: 22000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 7, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 65, tipMultiplier: 1.3, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 16000, baseReward: 60, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 14, two: 10 },
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 260,
      customerInterval: 3.5,
      maxCustomers: 28,
      customerPatience: 35,
    },
  },

  '2-3': {
    id: '2-3',
    nameKo: '용궁 라멘집 (보스)',
    theme: 'oriental',
    availableTowers: ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 나선 경로: 10행 확장
    pathSegments: [
      { type: 'horizontal', row: 0, colStart: 0, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 0, rowEnd: 8 },
      { type: 'horizontal', row: 8, colStart: 2, colEnd: 7 },
      { type: 'vertical', col: 2, rowStart: 4, rowEnd: 8 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 5 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 900 },
        { type: 'fish_knight', count: 4, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'mushroom_scout', count: 6, interval: 1500 },
        { type: 'cheese_rat', count: 6, interval: 1500 },
        { type: 'meat_ogre', count: 3, interval: 2500 },
      ]},
      { wave: 3, enemies: [
        { type: 'fish_knight', count: 8, interval: 1400 },
        { type: 'octopus_mage', count: 5, interval: 1800 },
        { type: 'egg_sprite', count: 4, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'cheese_rat', count: 10, interval: 1000 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 5, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'fish_knight', count: 8, interval: 1400 },
        { type: 'chili_demon', count: 6, interval: 1500 },
      ]},
      { wave: 6, enemies: [
        { type: 'mushroom_scout', count: 10, interval: 1000 },
        { type: 'cheese_rat', count: 10, interval: 1000 },
        { type: 'rice_slime', count: 5, interval: 2200 },
        { type: 'flour_ghost', count: 4, interval: 2500 },
      ]},
      { wave: 7, enemies: [
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 8, enemies: [
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'cheese_rat', count: 12, interval: 900 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'flour_ghost', count: 6, interval: 1800 },
      ]},
      { wave: 9, enemies: [
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'mushroom_scout', count: 6, interval: 1500 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
      // 웨이브 10: 보스
      { wave: 10, enemies: [
        { type: 'dragon_ramen', count: 1, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 30000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 32000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 26000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 26000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 24000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 24000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 20000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 18000, baseReward: 60, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 16000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 60000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 16, two: 11 },
    // ── Phase 7-2: 영업 설정 ──
    service: {
      duration: 280,
      customerInterval: 3,
      maxCustomers: 30,
      customerPatience: 32,
    },
  },

  // ── Phase 8 3장: 바닷가 씨푸드 바 ──

  '3-1': {
    id: '3-1',
    nameKo: '어촌 시장',
    theme: 'seafood',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // ㄹ자 경로: 좌→우 → 아래 → 우→좌 → 아래 → 좌→우
    pathSegments: [
      { type: 'horizontal', row: 0, colStart: 0, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 1000 },
        { type: 'shrimp_samurai', count: 2, interval: 3000 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 5, interval: 1800 },
        { type: 'carrot_goblin', count: 8, interval: 1100 },
      ]},
      { wave: 3, enemies: [
        { type: 'meat_ogre', count: 4, interval: 2200 },
        { type: 'shrimp_samurai', count: 6, interval: 1600 },
        { type: 'chili_demon', count: 3, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'fish_knight', count: 4, interval: 2000 },
        { type: 'egg_sprite', count: 4, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'carrot_goblin', count: 16, interval: 600 },
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'meat_ogre', count: 4, interval: 2200 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
        { type: 'octopus_mage', count: 4, interval: 2000 },
      ]},
      { wave: 7, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'chili_demon', count: 6, interval: 1500 },
        { type: 'fish_knight', count: 6, interval: 1600 },
      ]},
      { wave: 8, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'meat_ogre', count: 6, interval: 1800 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 32000, baseReward: 30, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 30000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'carrot_soup', patience: 26000, baseReward: 30, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'spicy_stir_fry', patience: 28000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 28000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'mixed_platter', patience: 26000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 24000, baseReward: 65, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5 },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 16000, baseReward: 60, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 13, two: 9 },
    service: {
      duration: 200,
      customerInterval: 5,
      maxCustomers: 20,
      customerPatience: 45,
    },
  },

  '3-2': {
    id: '3-2',
    nameKo: '해변 포장마차',
    theme: 'seafood',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // N자 경로: 좌하→좌상 → 가로 이동 → 우하
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 9 },
      { type: 'horizontal', row: 0, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 1000 },
        { type: 'shrimp_samurai', count: 3, interval: 2500 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 5, interval: 1800 },
        { type: 'tomato_bomber', count: 3, interval: 2500 },
      ]},
      { wave: 3, enemies: [
        { type: 'tomato_bomber', count: 6, interval: 1800 },
        { type: 'meat_ogre', count: 4, interval: 2200 },
        { type: 'shrimp_samurai', count: 4, interval: 1800 },
      ]},
      { wave: 4, enemies: [
        { type: 'carrot_goblin', count: 14, interval: 700 },
        { type: 'tomato_bomber', count: 6, interval: 1600 },
        { type: 'fish_knight', count: 4, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'tomato_bomber', count: 8, interval: 1400 },
        { type: 'octopus_mage', count: 4, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
        { type: 'chili_demon', count: 6, interval: 1500 },
      ]},
      { wave: 7, enemies: [
        { type: 'shrimp_samurai', count: 10, interval: 1200 },
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'meat_ogre', count: 6, interval: 1800 },
      ]},
      { wave: 8, enemies: [
        { type: 'carrot_goblin', count: 18, interval: 500 },
        { type: 'shrimp_samurai', count: 10, interval: 1200 },
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 9, enemies: [
        { type: 'tomato_bomber', count: 14, interval: 1000 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'fish_knight', count: 6, interval: 1600 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 30000, baseReward: 30, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'seafood_pasta', patience: 26000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'mixed_platter', patience: 26000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 24000, baseReward: 65, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 22000, baseReward: 55, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'spicy_stir_fry', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 7, customers: [
        { dish: 'mixed_platter', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 18000, baseReward: 70, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 14, two: 10 },
    service: {
      duration: 210,
      customerInterval: 4.5,
      maxCustomers: 22,
      customerPatience: 42,
    },
  },

  '3-3': {
    id: '3-3',
    nameKo: '등대 아래 식당',
    theme: 'seafood',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 계단식 경로: 우→좌 하강
    pathSegments: [
      { type: 'horizontal', row: 0, colStart: 3, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 3, colEnd: 8 },
      { type: 'vertical', col: 3, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 0, colEnd: 3 },
      { type: 'vertical', col: 0, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 12, interval: 1000 },
        { type: 'butter_ghost', count: 3, interval: 2500 },
      ]},
      { wave: 2, enemies: [
        { type: 'butter_ghost', count: 6, interval: 1600 },
        { type: 'shrimp_samurai', count: 4, interval: 2000 },
      ]},
      { wave: 3, enemies: [
        { type: 'butter_ghost', count: 8, interval: 1400 },
        { type: 'tomato_bomber', count: 4, interval: 2000 },
        { type: 'meat_ogre', count: 3, interval: 2500 },
      ]},
      { wave: 4, enemies: [
        { type: 'carrot_goblin', count: 14, interval: 700 },
        { type: 'butter_ghost', count: 8, interval: 1400 },
        { type: 'shrimp_samurai', count: 5, interval: 1800 },
      ]},
      { wave: 5, enemies: [
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'tomato_bomber', count: 6, interval: 1600 },
        { type: 'fish_knight', count: 4, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 7, enemies: [
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 8, interval: 1400 },
        { type: 'chili_demon', count: 6, interval: 1500 },
        { type: 'rice_slime', count: 3, interval: 2800 },
      ]},
      { wave: 8, enemies: [
        { type: 'carrot_goblin', count: 18, interval: 500 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'tomato_bomber', count: 6, interval: 1600 },
      ]},
      { wave: 9, enemies: [
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'shrimp_samurai', count: 10, interval: 1200 },
        { type: 'tomato_bomber', count: 8, interval: 1400 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
        { type: 'fish_knight', count: 6, interval: 1600 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 28000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 30000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 26000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 24000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 24000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 22000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 20000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 18000, baseReward: 60, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 12000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 14, two: 10 },
    service: {
      duration: 220,
      customerInterval: 4,
      maxCustomers: 24,
      customerPatience: 40,
    },
  },

  '3-4': {
    id: '3-4',
    nameKo: '항구 이자카야',
    theme: 'seafood',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // W자 경로: 복합 경로
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 0, colEnd: 3 },
      { type: 'vertical', col: 3, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 2, colStart: 3, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 2, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 6, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shrimp_samurai', count: 6, interval: 1600 },
        { type: 'tomato_bomber', count: 4, interval: 2000 },
        { type: 'butter_ghost', count: 3, interval: 2500 },
      ]},
      { wave: 2, enemies: [
        { type: 'carrot_goblin', count: 14, interval: 700 },
        { type: 'shrimp_samurai', count: 6, interval: 1600 },
        { type: 'tomato_bomber', count: 4, interval: 2000 },
      ]},
      { wave: 3, enemies: [
        { type: 'butter_ghost', count: 8, interval: 1400 },
        { type: 'shrimp_samurai', count: 6, interval: 1600 },
        { type: 'fish_knight', count: 5, interval: 1800 },
      ]},
      { wave: 4, enemies: [
        { type: 'tomato_bomber', count: 8, interval: 1400 },
        { type: 'butter_ghost', count: 6, interval: 1600 },
        { type: 'meat_ogre', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'shrimp_samurai', count: 10, interval: 1200 },
        { type: 'tomato_bomber', count: 8, interval: 1400 },
        { type: 'butter_ghost', count: 8, interval: 1400 },
      ]},
      { wave: 6, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
        { type: 'rice_slime', count: 3, interval: 2800 },
      ]},
      { wave: 7, enemies: [
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'chili_demon', count: 8, interval: 1300 },
      ]},
      { wave: 8, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'fish_knight', count: 6, interval: 1600 },
      ]},
      { wave: 9, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 12, interval: 1000 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'octopus_mage', count: 5, interval: 1800 },
      ]},
      { wave: 10, enemies: [
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'tomato_bomber', count: 12, interval: 1000 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 28000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 26000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 24000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 24000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 22000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 20000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 18000, baseReward: 60, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 15, two: 11 },
    service: {
      duration: 240,
      customerInterval: 3.5,
      maxCustomers: 28,
      customerPatience: 38,
    },
  },

  '3-5': {
    id: '3-5',
    nameKo: '절벽 위 레스토랑',
    theme: 'seafood',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 나선 경로: 외곽에서 중심으로
    pathSegments: [
      { type: 'horizontal', row: 0, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 0, rowEnd: 9 },
      { type: 'horizontal', row: 9, colStart: 2, colEnd: 8 },
      { type: 'vertical', col: 2, rowStart: 4, rowEnd: 9 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 4, rowEnd: 7 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'tomato_bomber', count: 5, interval: 1800 },
        { type: 'butter_ghost', count: 4, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'carrot_goblin', count: 16, interval: 600 },
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'fish_knight', count: 5, interval: 1800 },
      ]},
      { wave: 3, enemies: [
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 8, interval: 1400 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'meat_ogre', count: 8, interval: 1500 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
      { wave: 5, enemies: [
        { type: 'tomato_bomber', count: 12, interval: 1000 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'chili_demon', count: 8, interval: 1300 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'flour_ghost', count: 6, interval: 1800 },
      ]},
      { wave: 7, enemies: [
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'mushroom_scout', count: 6, interval: 1600 },
      ]},
      { wave: 8, enemies: [
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'fish_knight', count: 8, interval: 1500 },
      ]},
      { wave: 9, enemies: [
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'octopus_mage', count: 6, interval: 1600 },
      ]},
      { wave: 10, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'rice_slime', count: 5, interval: 2200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 26000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 26000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 24000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 20000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 18000, baseReward: 55, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 16000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 14000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 10000, baseReward: 95, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 16, two: 12 },
    service: {
      duration: 260,
      customerInterval: 3,
      maxCustomers: 32,
      customerPatience: 36,
    },
  },

  '3-6': {
    id: '3-6',
    nameKo: '해저 궁전 (보스)',
    theme: 'seafood',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 소용돌이 경로: 외곽 → 중심
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 9 },
      { type: 'horizontal', row: 9, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 3, rowEnd: 9 },
      { type: 'horizontal', row: 3, colStart: 3, colEnd: 8 },
      { type: 'vertical', col: 3, rowStart: 3, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 3, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 5, rowEnd: 7 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 14, interval: 900 },
        { type: 'shrimp_samurai', count: 6, interval: 1600 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'tomato_bomber', count: 6, interval: 1600 },
        { type: 'butter_ghost', count: 5, interval: 1800 },
      ]},
      { wave: 3, enemies: [
        { type: 'fish_knight', count: 8, interval: 1400 },
        { type: 'shrimp_samurai', count: 8, interval: 1400 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 4, enemies: [
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 10, interval: 1200 },
        { type: 'meat_ogre', count: 6, interval: 1800 },
      ]},
      { wave: 5, enemies: [
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'chili_demon', count: 8, interval: 1300 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'tomato_bomber', count: 12, interval: 1000 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 7, enemies: [
        { type: 'flour_ghost', count: 10, interval: 1200 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 5, interval: 2200 },
      ]},
      { wave: 8, enemies: [
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 9, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'octopus_mage', count: 6, interval: 1600 },
      ]},
      { wave: 10, enemies: [
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'tomato_bomber', count: 16, interval: 800 },
        { type: 'butter_ghost', count: 16, interval: 800 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      // 웨이브 11: 보스
      { wave: 11, enemies: [
        { type: 'seafood_kraken', count: 1, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 26000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 24000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 20000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 18000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 16000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 14000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 10000, baseReward: 95, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 60000, baseReward: 120, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 18, two: 13 },
    service: {
      duration: 300,
      customerInterval: 2.5,
      maxCustomers: 40,
      customerPatience: 34,
    },
  },

  // ── 4장: 화산 BBQ ──

  '4-1': {
    id: '4-1',
    nameKo: '화산 기슭 포장마차',
    theme: 'volcano',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // S자 경로: col 2 하강 → col 6 상승 → col 2 하강
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 1, rowEnd: 4 },
      { type: 'horizontal', row: 1, colStart: 6, colEnd: 2 },
      { type: 'vertical', col: 2, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 8, interval: 1200 },
        { type: 'carrot_goblin', count: 4, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'sugar_fairy', count: 10, interval: 1000 },
        { type: 'flour_ghost', count: 3, interval: 2200 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 12, interval: 900 },
        { type: 'carrot_goblin', count: 6, interval: 1500 },
        { type: 'flour_ghost', count: 4, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'sugar_fairy', count: 14, interval: 800 },
        { type: 'meat_ogre', count: 4, interval: 2200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 16, interval: 700 },
        { type: 'carrot_goblin', count: 10, interval: 1000 },
        { type: 'octopus_mage', count: 3, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'sugar_fairy', count: 18, interval: 650 },
        { type: 'chili_demon', count: 6, interval: 1400 },
        { type: 'flour_ghost', count: 5, interval: 1800 },
      ]},
      { wave: 7, enemies: [
        { type: 'sugar_fairy', count: 20, interval: 600 },
        { type: 'carrot_goblin', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 22, interval: 550 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
        { type: 'octopus_mage', count: 5, interval: 1800 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 25, interval: 500 },
        { type: 'carrot_goblin', count: 15, interval: 700 },
        { type: 'chili_demon', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 30000, baseReward: 30, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'carrot_soup', patience: 26000, baseReward: 30, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'seafood_pasta', patience: 26000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'spicy_stir_fry', patience: 24000, baseReward: 50, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'mixed_platter', patience: 24000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 22000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 22000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'mixed_platter', patience: 20000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 16000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'steak_plate', patience: 16000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 12000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 14, two: 10 },
    service: {
      duration: 220,
      customerInterval: 4.5,
      maxCustomers: 24,
      customerPatience: 42,
    },
  },

  '4-2': {
    id: '4-2',
    nameKo: '용암 동굴 식당',
    theme: 'volcano',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // U자 경로: col 1 하강 → row 8 횡이동 → col 7 상승 → row 2 횡이동 → col 4 하강
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 8 },
      { type: 'horizontal', row: 8, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 2, rowEnd: 8 },
      { type: 'horizontal', row: 2, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 4, rowStart: 2, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'milk_phantom', count: 4, interval: 2500 },
        { type: 'carrot_goblin', count: 6, interval: 1400 },
      ]},
      { wave: 2, enemies: [
        { type: 'milk_phantom', count: 5, interval: 2200 },
        { type: 'meat_ogre', count: 4, interval: 2000 },
      ]},
      { wave: 3, enemies: [
        { type: 'milk_phantom', count: 6, interval: 2000 },
        { type: 'octopus_mage', count: 4, interval: 1800 },
        { type: 'carrot_goblin', count: 8, interval: 1200 },
      ]},
      { wave: 4, enemies: [
        { type: 'milk_phantom', count: 7, interval: 1800 },
        { type: 'sugar_fairy', count: 8, interval: 1000 },
      ]},
      { wave: 5, enemies: [
        { type: 'milk_phantom', count: 8, interval: 1600 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
        { type: 'chili_demon', count: 5, interval: 1400 },
      ]},
      { wave: 6, enemies: [
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'octopus_mage', count: 5, interval: 1600 },
        { type: 'flour_ghost', count: 5, interval: 1800 },
      ]},
      { wave: 7, enemies: [
        { type: 'milk_phantom', count: 10, interval: 1400 },
        { type: 'sugar_fairy', count: 12, interval: 800 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 8, enemies: [
        { type: 'milk_phantom', count: 10, interval: 1300 },
        { type: 'carrot_goblin', count: 18, interval: 600 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
      ]},
      { wave: 9, enemies: [
        { type: 'milk_phantom', count: 12, interval: 1200 },
        { type: 'sugar_fairy', count: 16, interval: 700 },
        { type: 'octopus_mage', count: 6, interval: 1400 },
      ]},
      { wave: 10, enemies: [
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'sugar_fairy', count: 18, interval: 600 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'chili_demon', count: 8, interval: 1200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 28000, baseReward: 30, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 26000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'carrot_soup', patience: 24000, baseReward: 30, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'spicy_stir_fry', patience: 24000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 20000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 18000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 16000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'steak_plate', patience: 14000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 10000, baseReward: 95, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 15, two: 11 },
    service: {
      duration: 240,
      customerInterval: 4,
      maxCustomers: 26,
      customerPatience: 40,
    },
  },

  '4-3': {
    id: '4-3',
    nameKo: '온천 디저트 카페',
    theme: 'volcano',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 지그재그: row 0→4 col 1, 횡이동, row 4→0 col 5, 횡이동, row 0→9 col 8
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 5 },
      { type: 'vertical', col: 5, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 0, colStart: 5, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 0, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 10, interval: 1000 },
        { type: 'milk_phantom', count: 3, interval: 2500 },
      ]},
      { wave: 2, enemies: [
        { type: 'milk_phantom', count: 5, interval: 2200 },
        { type: 'sugar_fairy', count: 12, interval: 900 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 14, interval: 800 },
        { type: 'milk_phantom', count: 6, interval: 2000 },
        { type: 'carrot_goblin', count: 8, interval: 1200 },
      ]},
      { wave: 4, enemies: [
        { type: 'sugar_fairy', count: 16, interval: 700 },
        { type: 'milk_phantom', count: 7, interval: 1800 },
        { type: 'chili_demon', count: 5, interval: 1500 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 18, interval: 650 },
        { type: 'milk_phantom', count: 8, interval: 1600 },
        { type: 'octopus_mage', count: 5, interval: 1600 },
      ]},
      { wave: 6, enemies: [
        { type: 'sugar_fairy', count: 20, interval: 600 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'meat_ogre', count: 6, interval: 1400 },
        { type: 'flour_ghost', count: 4, interval: 2000 },
      ]},
      { wave: 7, enemies: [
        { type: 'sugar_fairy', count: 22, interval: 550 },
        { type: 'milk_phantom', count: 10, interval: 1400 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 24, interval: 500 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
        { type: 'chili_demon', count: 8, interval: 1200 },
        { type: 'octopus_mage', count: 5, interval: 1600 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 26, interval: 450 },
        { type: 'milk_phantom', count: 12, interval: 1200 },
        { type: 'meat_ogre', count: 8, interval: 1300 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 400 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'carrot_goblin', count: 20, interval: 500 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'chili_demon', count: 10, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 26000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 26000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 24000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 22000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 22000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 20000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 20000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 18000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 16000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 14000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 12000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 10000, baseReward: 95, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 95, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
    ],
    starThresholds: { three: 16, two: 12 },
    service: {
      duration: 250,
      customerInterval: 3.8,
      maxCustomers: 28,
      customerPatience: 38,
    },
  },

  '4-4': {
    id: '4-4',
    nameKo: '분화구 BBQ장',
    theme: 'volcano',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 나선형: 외곽에서 내부로 수축
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 9 },
      { type: 'horizontal', row: 9, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 2, rowEnd: 9 },
      { type: 'horizontal', row: 2, colStart: 3, colEnd: 8 },
      { type: 'vertical', col: 3, rowStart: 2, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 3, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 4, rowEnd: 7 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shrimp_samurai', count: 10, interval: 1200, hpMultiplier: 1.3 },
        { type: 'sugar_fairy', count: 6, interval: 1000 },
      ]},
      { wave: 2, enemies: [
        { type: 'tomato_bomber', count: 8, interval: 1300, hpMultiplier: 1.3 },
        { type: 'milk_phantom', count: 4, interval: 2200 },
      ]},
      { wave: 3, enemies: [
        { type: 'butter_ghost', count: 10, interval: 1100, hpMultiplier: 1.3 },
        { type: 'sugar_fairy', count: 10, interval: 900 },
        { type: 'shrimp_samurai', count: 6, interval: 1400 },
      ]},
      { wave: 4, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000, hpMultiplier: 1.3 },
        { type: 'tomato_bomber', count: 10, interval: 1100 },
        { type: 'milk_phantom', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'butter_ghost', count: 12, interval: 1000, hpMultiplier: 1.3 },
        { type: 'sugar_fairy', count: 14, interval: 800 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 14, interval: 900, hpMultiplier: 1.3 },
        { type: 'tomato_bomber', count: 12, interval: 1000, hpMultiplier: 1.3 },
        { type: 'milk_phantom', count: 6, interval: 1800 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 7, enemies: [
        { type: 'butter_ghost', count: 14, interval: 900, hpMultiplier: 1.3 },
        { type: 'sugar_fairy', count: 18, interval: 600 },
        { type: 'fish_knight', count: 6, interval: 1500 },
      ]},
      { wave: 8, enemies: [
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'milk_phantom', count: 8, interval: 1400 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 25, interval: 500 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 10, enemies: [
        { type: 'shrimp_samurai', count: 18, interval: 700, hpMultiplier: 1.3 },
        { type: 'tomato_bomber', count: 16, interval: 800, hpMultiplier: 1.3 },
        { type: 'butter_ghost', count: 16, interval: 800, hpMultiplier: 1.3 },
        { type: 'sugar_fairy', count: 20, interval: 550 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
      ]},
      { wave: 11, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'sugar_fairy', count: 25, interval: 450 },
        { type: 'milk_phantom', count: 12, interval: 1000 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'rice_slime', count: 5, interval: 2200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 24000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 24000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 22000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 20000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 20000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 18000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 18000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 16000, baseReward: 55, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 16000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 14000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 12000, baseReward: 65, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 12000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 10000, baseReward: 95, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 17, two: 13 },
    service: {
      duration: 270,
      customerInterval: 3.5,
      maxCustomers: 30,
      customerPatience: 36,
    },
  },

  '4-5': {
    id: '4-5',
    nameKo: '마그마 레스토랑',
    theme: 'volcano',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 긴 Z자: 많은 꺾임
    pathSegments: [
      { type: 'horizontal', row: 0, colStart: 0, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 18, interval: 600 },
        { type: 'sugar_fairy', count: 12, interval: 800 },
        { type: 'milk_phantom', count: 4, interval: 2200 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 8, interval: 1300 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 20, interval: 550 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'fish_knight', count: 6, interval: 1600 },
        { type: 'mushroom_scout', count: 5, interval: 1800 },
      ]},
      { wave: 4, enemies: [
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'sugar_fairy', count: 16, interval: 700 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 5, enemies: [
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 6, enemies: [
        { type: 'sugar_fairy', count: 25, interval: 450 },
        { type: 'carrot_goblin', count: 25, interval: 400 },
        { type: 'flour_ghost', count: 8, interval: 1400 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 7, enemies: [
        { type: 'milk_phantom', count: 12, interval: 1100 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 28, interval: 400 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'octopus_mage', count: 8, interval: 1300 },
      ]},
      { wave: 9, enemies: [
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'tomato_bomber', count: 16, interval: 800 },
        { type: 'butter_ghost', count: 16, interval: 800 },
        { type: 'sugar_fairy', count: 22, interval: 500 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 10, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'sugar_fairy', count: 28, interval: 400 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 11, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 350 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'tomato_bomber', count: 16, interval: 800 },
        { type: 'butter_ghost', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 22000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 22000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 20000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 16000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 14000, baseReward: 60, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 12000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 18, two: 14 },
    service: {
      duration: 280,
      customerInterval: 3,
      maxCustomers: 34,
      customerPatience: 34,
    },
  },

  '4-6': {
    id: '4-6',
    nameKo: '화산 정상 만찬 (보스)',
    theme: 'volcano',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 직선 변형: col 4 직하강 + 중간 우회
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 1, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 16, interval: 700 },
        { type: 'sugar_fairy', count: 12, interval: 900 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 10, interval: 1200 },
        { type: 'milk_phantom', count: 5, interval: 2000 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 20, interval: 550 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'fish_knight', count: 6, interval: 1600 },
      ]},
      { wave: 4, enemies: [
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'flour_ghost', count: 6, interval: 1600 },
      ]},
      { wave: 5, enemies: [
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'sugar_fairy', count: 20, interval: 550 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 6, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'butter_ghost', count: 14, interval: 900 },
        { type: 'rice_slime', count: 5, interval: 2200 },
      ]},
      { wave: 7, enemies: [
        { type: 'sugar_fairy', count: 28, interval: 400 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 8, enemies: [
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'tomato_bomber', count: 16, interval: 800 },
        { type: 'butter_ghost', count: 16, interval: 800 },
        { type: 'octopus_mage', count: 8, interval: 1300 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 350 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
      ]},
      { wave: 10, enemies: [
        { type: 'carrot_goblin', count: 35, interval: 300 },
        { type: 'sugar_fairy', count: 30, interval: 350 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 11, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 350 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'shrimp_samurai', count: 20, interval: 650 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'butter_ghost', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
      // 웨이브 12: 보스
      { wave: 12, enemies: [
        { type: 'lava_dessert_golem', count: 1, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 22000, baseReward: 30, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 22000, baseReward: 55, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 20000, baseReward: 50, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 18000, baseReward: 60, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 18000, baseReward: 70, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 16000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 16000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 14000, baseReward: 60, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 14000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 12000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'steak_plate', patience: 12000, baseReward: 70, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 80, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 60000, baseReward: 150, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 20, two: 15 },
    service: {
      duration: 320,
      customerInterval: 2.5,
      maxCustomers: 42,
      customerPatience: 32,
    },
  },
};

/** 스테이지 순서 */
export const STAGE_ORDER = [
  '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
  '2-1', '2-2', '2-3',
  '3-1', '3-2', '3-3', '3-4', '3-5', '3-6',
  '4-1', '4-2', '4-3', '4-4', '4-5', '4-6',
];
