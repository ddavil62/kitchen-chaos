/**
 * @fileoverview 스테이지 데이터 정의.
 * Phase 10: 30개 스테이지 (1-1 ~ 1-6, 2-1 ~ 2-3, 3-1 ~ 3-6, 4-1 ~ 4-6, 5-1 ~ 5-6, 6-1 ~ 6-3).
 * 1장: 파스타 레스토랑, 2장: 동양 요리, 3장: 바닷가 씨푸드 바, 4장: 화산 BBQ,
 * 5장: 마법사 디저트 카페, 6장: 그랑 가스트로노미.
 * Phase 25-1: 11장 용의 주방 심층부 11-1~11-5 웨이브 데이터 추가 (11-6은 placeholder 유지).
 * Phase 26-2: 10-6 sake_master 보스전으로 교체, 11-6 완성 (dragon_wok 약화 선등장), 12-1~12-6 완성 (dragon_wok 최종 보스전).
 * Phase 27-3: 13-1~13-5 스테이지 구현. 테마: bistro_parisian.
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
      { wave: 8, enemies: [ // Phase 17: cheese_golem 4→3, meat_ogre 10→8 (스파이크 완화)
        { type: 'flour_ghost', count: 12, interval: 1200 },
        { type: 'meat_ogre', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 3, interval: 2800 },
        { type: 'egg_sprite', count: 8, interval: 1200 },
        { type: 'rice_slime', count: 4, interval: 2500 },
      ]},
      { wave: 9, enemies: [ // Phase 17: cheese_golem 5→3, carrot_goblin 25→18 (53%→~30% 완화)
        { type: 'carrot_goblin', count: 18, interval: 400 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 3, interval: 2500 },
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
      { wave: 7, enemies: [ // Phase 17: fish_knight 8→6 (난이도 스파이크 완화)
        { type: 'fish_knight', count: 6, interval: 1500 },
        { type: 'cheese_rat', count: 10, interval: 1000 },
        { type: 'mushroom_scout', count: 6, interval: 1500 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 8, enemies: [ // Phase 17: meat_ogre 8→6, cheese_rat 12→10
        { type: 'meat_ogre', count: 6, interval: 1500 },
        { type: 'cheese_rat', count: 10, interval: 900 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 9, enemies: [ // Phase 17: 전체 감소 (66%→~45% 스파이크 완화)
        { type: 'carrot_goblin', count: 16, interval: 450 },
        { type: 'fish_knight', count: 8, interval: 1200 },
        { type: 'cheese_rat', count: 10, interval: 1000 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 2, interval: 3000 },
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

  // ── 5장: 마법사 디저트 카페 ──

  '5-1': {
    id: '5-1',
    nameKo: '견습 마법사의 빵집',
    theme: 'dessert_cafe',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 무한대(∞)자 경로
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 4, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 2, colEnd: 7 },
      { type: 'vertical', col: 2, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 10, interval: 1100 },
        { type: 'carrot_goblin', count: 6, interval: 1500 },
      ]},
      { wave: 2, enemies: [
        { type: 'sugar_fairy', count: 12, interval: 1000 },
        { type: 'milk_phantom', count: 4, interval: 2200 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 14, interval: 900 },
        { type: 'carrot_goblin', count: 8, interval: 1200 },
        { type: 'milk_phantom', count: 5, interval: 2000 },
      ]},
      { wave: 4, enemies: [
        { type: 'sugar_fairy', count: 16, interval: 800 },
        { type: 'milk_phantom', count: 6, interval: 1800 },
        { type: 'flour_ghost', count: 4, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 18, interval: 700 },
        { type: 'carrot_goblin', count: 12, interval: 1000 },
        { type: 'octopus_mage', count: 4, interval: 1800 },
      ]},
      { wave: 6, enemies: [
        { type: 'sugar_fairy', count: 20, interval: 650 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'chili_demon', count: 6, interval: 1400 },
      ]},
      { wave: 7, enemies: [
        { type: 'sugar_fairy', count: 22, interval: 600 },
        { type: 'carrot_goblin', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 24, interval: 550 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 26, interval: 500 },
        { type: 'carrot_goblin', count: 16, interval: 800 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 28, interval: 450 },
        { type: 'milk_phantom', count: 12, interval: 1100 },
        { type: 'carrot_goblin', count: 18, interval: 700 },
        { type: 'chili_demon', count: 8, interval: 1200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 20000, baseReward: 35, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 18000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'carrot_soup', patience: 16000, baseReward: 35, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'spicy_stir_fry', patience: 16000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'mixed_platter', patience: 14000, baseReward: 75, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 12000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 16, two: 12 },
    service: {
      duration: 300,
      customerInterval: 2.8,
      maxCustomers: 36,
      customerPatience: 32,
    },
  },

  '5-2': {
    id: '5-2',
    nameKo: '마법의 오븐',
    theme: 'dessert_cafe',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 나선형 경로: 바깥→안쪽
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 3, colEnd: 7 },
      { type: 'vertical', col: 3, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'flour_ghost', count: 8, interval: 1300 },
        { type: 'egg_sprite', count: 6, interval: 1500 },
      ]},
      { wave: 2, enemies: [
        { type: 'flour_ghost', count: 10, interval: 1100 },
        { type: 'sugar_fairy', count: 8, interval: 1200 },
      ]},
      { wave: 3, enemies: [
        { type: 'egg_sprite', count: 12, interval: 1000 },
        { type: 'flour_ghost', count: 8, interval: 1200 },
        { type: 'carrot_goblin', count: 6, interval: 1400 },
      ]},
      { wave: 4, enemies: [
        { type: 'flour_ghost', count: 14, interval: 900 },
        { type: 'egg_sprite', count: 10, interval: 1000 },
        { type: 'milk_phantom', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'egg_sprite', count: 16, interval: 800 },
        { type: 'sugar_fairy', count: 14, interval: 800 },
        { type: 'flour_ghost', count: 8, interval: 1200 },
      ]},
      { wave: 6, enemies: [
        { type: 'flour_ghost', count: 16, interval: 800 },
        { type: 'egg_sprite', count: 14, interval: 900 },
        { type: 'meat_ogre', count: 5, interval: 1800 },
        { type: 'octopus_mage', count: 4, interval: 2000 },
      ]},
      { wave: 7, enemies: [
        { type: 'egg_sprite', count: 18, interval: 700 },
        { type: 'flour_ghost', count: 14, interval: 900 },
        { type: 'sugar_fairy', count: 16, interval: 750 },
        { type: 'cheese_golem', count: 3, interval: 3000 },
      ]},
      { wave: 8, enemies: [
        { type: 'flour_ghost', count: 18, interval: 700 },
        { type: 'egg_sprite', count: 16, interval: 800 },
        { type: 'milk_phantom', count: 8, interval: 1400 },
        { type: 'chili_demon', count: 6, interval: 1400 },
      ]},
      { wave: 9, enemies: [
        { type: 'egg_sprite', count: 20, interval: 650 },
        { type: 'flour_ghost', count: 18, interval: 700 },
        { type: 'sugar_fairy', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 10, enemies: [
        { type: 'flour_ghost', count: 20, interval: 600 },
        { type: 'egg_sprite', count: 22, interval: 600 },
        { type: 'sugar_fairy', count: 20, interval: 650 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 11, enemies: [
        { type: 'egg_sprite', count: 24, interval: 550 },
        { type: 'flour_ghost', count: 22, interval: 600 },
        { type: 'sugar_fairy', count: 22, interval: 600 },
        { type: 'milk_phantom', count: 12, interval: 1100 },
        { type: 'meat_ogre', count: 8, interval: 1400 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 18000, baseReward: 35, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'steak_plate', patience: 16000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'carrot_soup', patience: 14000, baseReward: 35, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'spicy_stir_fry', patience: 14000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 12000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'mixed_platter', patience: 12000, baseReward: 75, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 12000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 6, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 18, two: 13 },
    service: {
      duration: 310,
      customerInterval: 2.6,
      maxCustomers: 38,
      customerPatience: 30,
    },
  },

  '5-3': {
    id: '5-3',
    nameKo: '환상의 디저트 정원',
    theme: 'dessert_cafe',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // W자 경로
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 2, rowEnd: 4 },
      { type: 'horizontal', row: 2, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 2, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 2, interval: 3500 },
      ]},
      { wave: 2, enemies: [
        { type: 'chili_demon', count: 10, interval: 1000 },
        { type: 'milk_phantom', count: 6, interval: 1800 },
        { type: 'flour_ghost', count: 5, interval: 1600 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 16, interval: 750 },
        { type: 'egg_sprite', count: 10, interval: 1000 },
        { type: 'meat_ogre', count: 4, interval: 2200 },
      ]},
      { wave: 4, enemies: [
        { type: 'shrimp_samurai', count: 10, interval: 1100 },
        { type: 'tomato_bomber', count: 8, interval: 1300 },
        { type: 'butter_ghost', count: 8, interval: 1200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 20, interval: 600 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'fish_knight', count: 6, interval: 1600 },
      ]},
      { wave: 6, enemies: [
        { type: 'chili_demon', count: 14, interval: 800 },
        { type: 'mushroom_scout', count: 8, interval: 1100 },
        { type: 'milk_phantom', count: 8, interval: 1400 },
        { type: 'egg_sprite', count: 12, interval: 900 },
      ]},
      { wave: 7, enemies: [
        { type: 'sugar_fairy', count: 24, interval: 500 },
        { type: 'flour_ghost', count: 10, interval: 1100 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 8, enemies: [
        { type: 'tomato_bomber', count: 14, interval: 800 },
        { type: 'butter_ghost', count: 14, interval: 800 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 28, interval: 450 },
        { type: 'egg_sprite', count: 18, interval: 700 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 400 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'shrimp_samurai', count: 16, interval: 750 },
        { type: 'tomato_bomber', count: 14, interval: 800 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 11, enemies: [
        { type: 'sugar_fairy', count: 32, interval: 380 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'egg_sprite', count: 20, interval: 650 },
        { type: 'butter_ghost', count: 14, interval: 800 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'meat_ogre', count: 8, interval: 1400 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 18000, baseReward: 35, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 16000, baseReward: 60, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 16000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 14000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 14000, baseReward: 75, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 12000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 12000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 18, two: 13 },
    service: {
      duration: 320,
      customerInterval: 2.4,
      maxCustomers: 40,
      customerPatience: 28,
    },
  },

  '5-4': {
    id: '5-4',
    nameKo: '크리스탈 찻집',
    theme: 'dessert_cafe',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 미로형 경로
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 1, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 5, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 4, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'cheese_golem', count: 4, interval: 2800 },
        { type: 'meat_ogre', count: 6, interval: 1600 },
      ]},
      { wave: 2, enemies: [
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'milk_phantom', count: 6, interval: 1800 },
        { type: 'carrot_goblin', count: 10, interval: 1000 },
      ]},
      { wave: 3, enemies: [
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
        { type: 'sugar_fairy', count: 12, interval: 900 },
      ]},
      { wave: 4, enemies: [
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'fish_knight', count: 8, interval: 1400 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 5, enemies: [
        { type: 'meat_ogre', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'shrimp_samurai', count: 10, interval: 1100 },
        { type: 'sugar_fairy', count: 14, interval: 800 },
      ]},
      { wave: 6, enemies: [
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'octopus_mage', count: 6, interval: 1600 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 7, enemies: [
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'sugar_fairy', count: 18, interval: 700 },
        { type: 'flour_ghost', count: 8, interval: 1300 },
      ]},
      { wave: 8, enemies: [
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'milk_phantom', count: 12, interval: 1100 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
      ]},
      { wave: 9, enemies: [
        { type: 'meat_ogre', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'sugar_fairy', count: 22, interval: 600 },
        { type: 'chili_demon', count: 10, interval: 1000 },
      ]},
      { wave: 10, enemies: [
        { type: 'cheese_golem', count: 9, interval: 1600 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'sugar_fairy', count: 24, interval: 550 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 11, enemies: [
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 16, interval: 800 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'sugar_fairy', count: 26, interval: 500 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 12, enemies: [
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 18, interval: 750 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'sugar_fairy', count: 28, interval: 450 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'cheese_rat', count: 10, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 16000, baseReward: 35, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 14000, baseReward: 60, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 14000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 12000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 12000, baseReward: 75, tipMultiplier: 1.5 },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 20, two: 15 },
    service: {
      duration: 340,
      customerInterval: 2.2,
      maxCustomers: 44,
      customerPatience: 26,
    },
  },

  '5-5': {
    id: '5-5',
    nameKo: '구름 위의 파티세리',
    theme: 'dessert_cafe',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 긴 S자 경로
    pathSegments: [
      { type: 'vertical', col: 7, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 18, interval: 700 },
        { type: 'carrot_goblin', count: 12, interval: 900 },
      ]},
      { wave: 2, enemies: [
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'egg_sprite', count: 14, interval: 800 },
        { type: 'flour_ghost', count: 8, interval: 1200 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 22, interval: 600 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 10, interval: 1100 },
      ]},
      { wave: 4, enemies: [
        { type: 'chili_demon', count: 14, interval: 800 },
        { type: 'butter_ghost', count: 14, interval: 800 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 26, interval: 500 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'fish_knight', count: 8, interval: 1400 },
        { type: 'mushroom_scout', count: 6, interval: 1500 },
      ]},
      { wave: 6, enemies: [
        { type: 'egg_sprite', count: 20, interval: 650 },
        { type: 'flour_ghost', count: 14, interval: 900 },
        { type: 'milk_phantom', count: 12, interval: 1100 },
        { type: 'sugar_fairy', count: 24, interval: 550 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 7, enemies: [
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'tomato_bomber', count: 16, interval: 750 },
        { type: 'butter_ghost', count: 16, interval: 750 },
        { type: 'chili_demon', count: 14, interval: 800 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 400 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'meat_ogre', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 9, enemies: [
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'sugar_fairy', count: 28, interval: 430 },
        { type: 'egg_sprite', count: 20, interval: 650 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 32, interval: 380 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'butter_ghost', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'meat_ogre', count: 12, interval: 1000 },
      ]},
      { wave: 11, enemies: [
        { type: 'sugar_fairy', count: 34, interval: 360 },
        { type: 'carrot_goblin', count: 30, interval: 350 },
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'octopus_mage', count: 8, interval: 1300 },
      ]},
      { wave: 12, enemies: [
        { type: 'sugar_fairy', count: 35, interval: 350 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'egg_sprite', count: 22, interval: 600 },
        { type: 'flour_ghost', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'meat_ogre', count: 14, interval: 900 },
      ]},
      { wave: 13, enemies: [
        { type: 'sugar_fairy', count: 36, interval: 340 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'carrot_goblin', count: 32, interval: 340 },
        { type: 'shrimp_samurai', count: 20, interval: 650 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'butter_ghost', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 14000, baseReward: 35, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 12000, baseReward: 60, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 12000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 13, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 22, two: 16 },
    service: {
      duration: 360,
      customerInterval: 2.0,
      maxCustomers: 48,
      customerPatience: 24,
    },
  },

  '5-6': {
    id: '5-6',
    nameKo: '마스터 파티시에의 탑 (보스)',
    theme: 'dessert_cafe',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 긴 직선 + 보스 아레나
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 1, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 18, interval: 700 },
        { type: 'carrot_goblin', count: 12, interval: 900 },
      ]},
      { wave: 2, enemies: [
        { type: 'milk_phantom', count: 8, interval: 1500 },
        { type: 'flour_ghost', count: 10, interval: 1100 },
        { type: 'egg_sprite', count: 10, interval: 1100 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 22, interval: 600 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'tomato_bomber', count: 10, interval: 1100 },
      ]},
      { wave: 4, enemies: [
        { type: 'cheese_golem', count: 6, interval: 2200 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 26, interval: 500 },
        { type: 'butter_ghost', count: 14, interval: 800 },
        { type: 'chili_demon', count: 12, interval: 900 },
        { type: 'fish_knight', count: 8, interval: 1400 },
      ]},
      { wave: 6, enemies: [
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'egg_sprite', count: 18, interval: 700 },
        { type: 'flour_ghost', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
      { wave: 7, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 400 },
        { type: 'shrimp_samurai', count: 16, interval: 750 },
        { type: 'tomato_bomber', count: 14, interval: 800 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
      ]},
      { wave: 8, enemies: [
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
        { type: 'butter_ghost', count: 16, interval: 750 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 9, enemies: [
        { type: 'sugar_fairy', count: 32, interval: 380 },
        { type: 'carrot_goblin', count: 28, interval: 380 },
        { type: 'egg_sprite', count: 20, interval: 650 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
      ]},
      { wave: 10, enemies: [
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'tomato_bomber', count: 16, interval: 750 },
        { type: 'sugar_fairy', count: 34, interval: 360 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
      ]},
      { wave: 11, enemies: [
        { type: 'sugar_fairy', count: 35, interval: 350 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'butter_ghost', count: 18, interval: 700 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'octopus_mage', count: 8, interval: 1300 },
      ]},
      { wave: 12, enemies: [
        { type: 'carrot_goblin', count: 35, interval: 330 },
        { type: 'sugar_fairy', count: 35, interval: 350 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'chili_demon', count: 14, interval: 800 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
      ]},
      { wave: 13, enemies: [
        { type: 'sugar_fairy', count: 36, interval: 340 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'shrimp_samurai', count: 20, interval: 650 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'butter_ghost', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 9, interval: 1600 },
        { type: 'meat_ogre', count: 14, interval: 900 },
      ]},
      // 웨이브 14: 보스
      { wave: 14, enemies: [
        { type: 'master_patissier', count: 1, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 14000, baseReward: 35, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 12000, baseReward: 60, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 12000, baseReward: 55, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 65, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 10000, baseReward: 75, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 65, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 13, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
      ]},
      // 보스 웨이브: 전투 집중
      { wave: 14, customers: [
        { dish: 'cheese_fondue', patience: 60000, baseReward: 200, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 24, two: 18 },
    service: {
      duration: 400,
      customerInterval: 1.8,
      maxCustomers: 55,
      customerPatience: 22,
    },
  },

  // ── 6장: 그랑 가스트로노미 ──

  '6-1': {
    id: '6-1',
    nameKo: '미슐랭 아레나',
    theme: 'grand_finale',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 8자 루프 경로
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 22, interval: 600 },
        { type: 'carrot_goblin', count: 18, interval: 700 },
        { type: 'milk_phantom', count: 6, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'tomato_bomber', count: 14, interval: 900 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 28, interval: 450 },
        { type: 'egg_sprite', count: 18, interval: 700 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
        { type: 'meat_ogre', count: 8, interval: 1400 },
      ]},
      { wave: 4, enemies: [
        { type: 'chili_demon', count: 16, interval: 750 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'mushroom_scout', count: 8, interval: 1200 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 32, interval: 380 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'octopus_mage', count: 8, interval: 1300 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 20, interval: 650 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'butter_ghost', count: 18, interval: 700 },
        { type: 'sugar_fairy', count: 28, interval: 450 },
      ]},
      { wave: 7, enemies: [
        { type: 'milk_phantom', count: 16, interval: 900 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'flour_ghost', count: 14, interval: 900 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 34, interval: 360 },
        { type: 'carrot_goblin', count: 32, interval: 340 },
        { type: 'chili_demon', count: 14, interval: 800 },
        { type: 'egg_sprite', count: 20, interval: 650 },
      ]},
      { wave: 9, enemies: [
        { type: 'cheese_golem', count: 9, interval: 1600 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'shrimp_samurai', count: 20, interval: 650 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'sugar_fairy', count: 30, interval: 400 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 36, interval: 340 },
        { type: 'butter_ghost', count: 20, interval: 650 },
        { type: 'meat_ogre', count: 16, interval: 800 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
      ]},
      { wave: 11, enemies: [
        { type: 'carrot_goblin', count: 35, interval: 330 },
        { type: 'sugar_fairy', count: 35, interval: 350 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'fish_knight', count: 12, interval: 1100 },
        { type: 'octopus_mage', count: 10, interval: 1200 },
      ]},
      { wave: 12, enemies: [
        { type: 'sugar_fairy', count: 38, interval: 330 },
        { type: 'egg_sprite', count: 24, interval: 550 },
        { type: 'flour_ghost', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 9, interval: 1600 },
        { type: 'meat_ogre', count: 16, interval: 800 },
      ]},
      { wave: 13, enemies: [
        { type: 'sugar_fairy', count: 40, interval: 320 },
        { type: 'milk_phantom', count: 20, interval: 800 },
        { type: 'shrimp_samurai', count: 22, interval: 600 },
        { type: 'tomato_bomber', count: 20, interval: 650 },
        { type: 'butter_ghost', count: 20, interval: 650 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
      ]},
      // 웨이브 14: 미니보스 pasta_boss
      { wave: 14, enemies: [
        { type: 'pasta_boss', count: 1, interval: 1000 },
        { type: 'sugar_fairy', count: 20, interval: 500 },
        { type: 'milk_phantom', count: 10, interval: 1000 },
      ]},
      { wave: 15, enemies: [
        { type: 'sugar_fairy', count: 42, interval: 310 },
        { type: 'milk_phantom', count: 20, interval: 800 },
        { type: 'carrot_goblin', count: 35, interval: 330 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 16, interval: 800 },
        { type: 'chili_demon', count: 14, interval: 800 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 14000, baseReward: 40, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 12000, baseReward: 65, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 12000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 10000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 10000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 10000, baseReward: 75, tipMultiplier: 1.3 },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 75, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 13, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 14, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 15, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 25, two: 19 },
    service: {
      duration: 400,
      customerInterval: 1.8,
      maxCustomers: 55,
      customerPatience: 22,
    },
  },

  '6-2': {
    id: '6-2',
    nameKo: '요리의 전쟁',
    theme: 'grand_finale',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 긴 미로형 경로
    pathSegments: [
      { type: 'vertical', col: 7, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 5, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 24, interval: 550 },
        { type: 'carrot_goblin', count: 20, interval: 650 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'tomato_bomber', count: 16, interval: 750 },
        { type: 'butter_ghost', count: 16, interval: 750 },
        { type: 'cheese_golem', count: 5, interval: 2500 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 30, interval: 400 },
        { type: 'egg_sprite', count: 20, interval: 650 },
        { type: 'flour_ghost', count: 14, interval: 900 },
        { type: 'meat_ogre', count: 10, interval: 1200 },
      ]},
      { wave: 4, enemies: [
        { type: 'chili_demon', count: 18, interval: 700 },
        { type: 'fish_knight', count: 12, interval: 1000 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
        { type: 'milk_phantom', count: 12, interval: 1100 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 35, interval: 350 },
        { type: 'carrot_goblin', count: 30, interval: 360 },
        { type: 'octopus_mage', count: 10, interval: 1200 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 22, interval: 600 },
        { type: 'tomato_bomber', count: 20, interval: 650 },
        { type: 'butter_ghost', count: 20, interval: 650 },
        { type: 'sugar_fairy', count: 30, interval: 400 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 7, enemies: [
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'meat_ogre', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 9, interval: 1600 },
        { type: 'flour_ghost', count: 16, interval: 800 },
        { type: 'egg_sprite', count: 22, interval: 600 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 38, interval: 330 },
        { type: 'carrot_goblin', count: 34, interval: 340 },
        { type: 'chili_demon', count: 16, interval: 750 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
      ]},
      { wave: 9, enemies: [
        { type: 'shrimp_samurai', count: 24, interval: 550 },
        { type: 'tomato_bomber', count: 22, interval: 600 },
        { type: 'butter_ghost', count: 22, interval: 600 },
        { type: 'milk_phantom', count: 18, interval: 850 },
        { type: 'cheese_golem', count: 9, interval: 1600 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 40, interval: 320 },
        { type: 'meat_ogre', count: 18, interval: 750 },
        { type: 'fish_knight', count: 14, interval: 900 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
      ]},
      { wave: 11, enemies: [
        { type: 'carrot_goblin', count: 38, interval: 320 },
        { type: 'sugar_fairy', count: 38, interval: 330 },
        { type: 'milk_phantom', count: 20, interval: 800 },
        { type: 'egg_sprite', count: 24, interval: 550 },
        { type: 'octopus_mage', count: 10, interval: 1200 },
      ]},
      { wave: 12, enemies: [
        { type: 'sugar_fairy', count: 42, interval: 310 },
        { type: 'shrimp_samurai', count: 24, interval: 550 },
        { type: 'tomato_bomber', count: 22, interval: 600 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 18, interval: 750 },
      ]},
      // 웨이브 13: 미니보스 dragon_ramen
      { wave: 13, enemies: [
        { type: 'dragon_ramen', count: 1, interval: 1000 },
        { type: 'sugar_fairy', count: 24, interval: 500 },
        { type: 'cheese_rat', count: 14, interval: 800 },
      ]},
      // 웨이브 14: 미니보스 seafood_kraken
      { wave: 14, enemies: [
        { type: 'seafood_kraken', count: 1, interval: 1000 },
        { type: 'shrimp_samurai', count: 18, interval: 600 },
        { type: 'milk_phantom', count: 10, interval: 1000 },
      ]},
      // 웨이브 15: 미니보스 lava_dessert_golem
      { wave: 15, enemies: [
        { type: 'lava_dessert_golem', count: 1, interval: 1000 },
        { type: 'sugar_fairy', count: 20, interval: 500 },
        { type: 'butter_ghost', count: 14, interval: 800 },
      ]},
      // 웨이브 16: 최종 러시
      { wave: 16, enemies: [
        { type: 'sugar_fairy', count: 45, interval: 300 },
        { type: 'milk_phantom', count: 22, interval: 750 },
        { type: 'carrot_goblin', count: 40, interval: 310 },
        { type: 'shrimp_samurai', count: 24, interval: 550 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 18, interval: 750 },
        { type: 'chili_demon', count: 16, interval: 750 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 12000, baseReward: 40, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 10000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 70, tipMultiplier: 1.3 },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 13, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 14, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 15, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 16, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 28, two: 21 },
    service: {
      duration: 420,
      customerInterval: 1.6,
      maxCustomers: 60,
      customerPatience: 22,  // Phase 17: 20→22 (6-1과 통일, T2 마진 확보)
    },
  },

  '6-3': {
    id: '6-3',
    nameKo: '최종 결전 (최종 보스)',
    theme: 'grand_finale',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot'],
    gridCols: 9,
    gridRows: 10,
    // 원형 아레나풍 경로
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 4, rowStart: 5, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 1, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sugar_fairy', count: 26, interval: 500 },
        { type: 'carrot_goblin', count: 22, interval: 600 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 2, enemies: [
        { type: 'shrimp_samurai', count: 20, interval: 650 },
        { type: 'tomato_bomber', count: 18, interval: 700 },
        { type: 'butter_ghost', count: 16, interval: 750 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
      { wave: 3, enemies: [
        { type: 'sugar_fairy', count: 32, interval: 380 },
        { type: 'egg_sprite', count: 22, interval: 600 },
        { type: 'flour_ghost', count: 16, interval: 800 },
        { type: 'meat_ogre', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'chili_demon', count: 20, interval: 650 },
        { type: 'fish_knight', count: 14, interval: 900 },
        { type: 'mushroom_scout', count: 12, interval: 1000 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
      ]},
      { wave: 5, enemies: [
        { type: 'sugar_fairy', count: 36, interval: 340 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'octopus_mage', count: 10, interval: 1200 },
        { type: 'rice_slime', count: 6, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shrimp_samurai', count: 24, interval: 550 },
        { type: 'tomato_bomber', count: 22, interval: 600 },
        { type: 'butter_ghost', count: 22, interval: 600 },
        { type: 'sugar_fairy', count: 32, interval: 380 },
      ]},
      { wave: 7, enemies: [
        { type: 'milk_phantom', count: 20, interval: 800 },
        { type: 'meat_ogre', count: 18, interval: 750 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'flour_ghost', count: 16, interval: 800 },
      ]},
      { wave: 8, enemies: [
        { type: 'sugar_fairy', count: 38, interval: 330 },
        { type: 'carrot_goblin', count: 36, interval: 330 },
        { type: 'chili_demon', count: 18, interval: 700 },
        { type: 'egg_sprite', count: 24, interval: 550 },
      ]},
      { wave: 9, enemies: [
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'milk_phantom', count: 20, interval: 800 },
        { type: 'shrimp_samurai', count: 24, interval: 550 },
        { type: 'tomato_bomber', count: 22, interval: 600 },
        { type: 'sugar_fairy', count: 34, interval: 360 },
      ]},
      { wave: 10, enemies: [
        { type: 'sugar_fairy', count: 40, interval: 320 },
        { type: 'butter_ghost', count: 22, interval: 600 },
        { type: 'meat_ogre', count: 18, interval: 750 },
        { type: 'mushroom_scout', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
      ]},
      { wave: 11, enemies: [
        { type: 'carrot_goblin', count: 40, interval: 310 },
        { type: 'sugar_fairy', count: 40, interval: 320 },
        { type: 'milk_phantom', count: 22, interval: 750 },
        { type: 'fish_knight', count: 14, interval: 900 },
        { type: 'octopus_mage', count: 12, interval: 1100 },
      ]},
      { wave: 12, enemies: [
        { type: 'sugar_fairy', count: 42, interval: 310 },
        { type: 'egg_sprite', count: 26, interval: 500 },
        { type: 'flour_ghost', count: 18, interval: 750 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 18, interval: 750 },
      ]},
      { wave: 13, enemies: [
        { type: 'shrimp_samurai', count: 26, interval: 500 },
        { type: 'tomato_bomber', count: 24, interval: 550 },
        { type: 'butter_ghost', count: 24, interval: 550 },
        { type: 'milk_phantom', count: 22, interval: 750 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'chili_demon', count: 18, interval: 700 },
      ]},
      { wave: 14, enemies: [
        { type: 'sugar_fairy', count: 44, interval: 300 },
        { type: 'carrot_goblin', count: 40, interval: 310 },
        { type: 'milk_phantom', count: 22, interval: 750 },
        { type: 'meat_ogre', count: 18, interval: 750 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
      ]},
      { wave: 15, enemies: [
        { type: 'sugar_fairy', count: 45, interval: 290 },
        { type: 'egg_sprite', count: 28, interval: 480 },
        { type: 'shrimp_samurai', count: 26, interval: 500 },
        { type: 'flour_ghost', count: 18, interval: 750 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'rice_slime', count: 8, interval: 1600 },
      ]},
      { wave: 16, enemies: [
        { type: 'sugar_fairy', count: 46, interval: 285 },
        { type: 'milk_phantom', count: 24, interval: 700 },
        { type: 'tomato_bomber', count: 24, interval: 550 },
        { type: 'butter_ghost', count: 24, interval: 550 },
        { type: 'cheese_golem', count: 12, interval: 1300 },
        { type: 'meat_ogre', count: 20, interval: 700 },
      ]},
      // 웨이브 17: 대량 러시 (각 종류 10~20마리)
      { wave: 17, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 400 },
        { type: 'sugar_fairy', count: 20, interval: 400 },
        { type: 'milk_phantom', count: 15, interval: 700 },
        { type: 'shrimp_samurai', count: 15, interval: 600 },
        { type: 'tomato_bomber', count: 15, interval: 600 },
        { type: 'butter_ghost', count: 15, interval: 600 },
        { type: 'cheese_golem', count: 10, interval: 1500 },
        { type: 'meat_ogre', count: 15, interval: 700 },
        { type: 'chili_demon', count: 12, interval: 750 },
        { type: 'egg_sprite', count: 15, interval: 600 },
      ]},
      // 웨이브 18: 최종 보스
      { wave: 18, enemies: [
        { type: 'cuisine_god', count: 1, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [
        { dish: 'carrot_soup', patience: 12000, baseReward: 40, tipMultiplier: 1.5 },
        { dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.5 },
      ]},
      { wave: 2, customers: [
        { dish: 'spicy_stir_fry', patience: 10000, baseReward: 60, tipMultiplier: 1.5 },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 3, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 75, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 4, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 70, tipMultiplier: 1.3, vip: true },
      ]},
      { wave: 5, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
        { dish: 'seafood_pasta', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 6, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 7, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true },
        { dish: 'steak_plate', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true },
      ]},
      { wave: 8, customers: [
        { dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
        { dish: 'cheese_fondue', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 9, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 10, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 11, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 12, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 13, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 14, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 15, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 135, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 135, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 16, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true },
      ]},
      { wave: 17, customers: [
        { dish: 'cheese_fondue', patience: 8000, baseReward: 150, tipMultiplier: 2.0, vip: true },
        { dish: 'mixed_platter', patience: 8000, baseReward: 150, tipMultiplier: 2.0, vip: true },
      ]},
      // 보스 웨이브: 전투 집중
      { wave: 18, customers: [
        { dish: 'cheese_fondue', patience: 120000, baseReward: 300, tipMultiplier: 2.0, vip: true },
      ]},
    ],
    starThresholds: { three: 30, two: 22 },
    service: {
      duration: 480,
      customerInterval: 1.5,
      maxCustomers: 70,
      customerPatience: 22,  // Phase 17: 18→22 (T3 2회 서빙 보장)
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 7장 사쿠라 이자카야 ──
  // ══════════════════════════════════════════════════════════════

  '7-1': {
    id: '7-1',
    nameKo: '벚꽃 전채',
    theme: 'sakura_izakaya',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 700 },
        { type: 'shrimp_samurai', count: 10, interval: 1200 },
      ]},
      { wave: 2, enemies: [
        { type: 'sushi_ninja', count: 8, interval: 1400 },
        { type: 'carrot_goblin', count: 16, interval: 750 },
        { type: 'milk_phantom', count: 6, interval: 1800 },
      ]},
      { wave: 3, enemies: [
        { type: 'sushi_ninja', count: 12, interval: 1200 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 4, enemies: [
        { type: 'sushi_ninja', count: 14, interval: 1100 },
        { type: 'tempura_monk', count: 6, interval: 2200 },
        { type: 'fish_knight', count: 10, interval: 1200 },
        { type: 'flour_ghost', count: 8, interval: 1300 },
      ]},
      { wave: 5, enemies: [
        { type: 'sushi_ninja', count: 18, interval: 900 },
        { type: 'tempura_monk', count: 8, interval: 2000 },
        { type: 'meat_ogre', count: 12, interval: 1000 },
        { type: 'cheese_golem', count: 5, interval: 2400 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'carrot_soup', patience: 12000, baseReward: 40, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'steak_plate', patience: 11000, baseReward: 55, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'spicy_stir_fry', patience: 10000, baseReward: 55, tipMultiplier: 1.3 }] },
      { wave: 4, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 65, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
    ],
    starThresholds: { three: 18, two: 13 },
    service: { duration: 240, customerInterval: 3.5, maxCustomers: 35, customerPatience: 28 },
  },
  '7-2': {
    id: '7-2',
    nameKo: '사케 냉장고',
    theme: 'sakura_izakaya',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 22, interval: 650 },
        { type: 'sushi_ninja', count: 8, interval: 1400 },
      ]},
      { wave: 2, enemies: [
        { type: 'sushi_ninja', count: 12, interval: 1200 },
        { type: 'shrimp_samurai', count: 14, interval: 850 },
        { type: 'butter_ghost', count: 10, interval: 1100 },
      ]},
      { wave: 3, enemies: [
        { type: 'tempura_monk', count: 8, interval: 2000 },
        { type: 'chili_demon', count: 16, interval: 720 },
        { type: 'cheese_golem', count: 5, interval: 2600 },
      ]},
      { wave: 4, enemies: [
        { type: 'sushi_ninja', count: 14, interval: 1100 },
        { type: 'tempura_monk', count: 10, interval: 1800 },
        { type: 'fish_knight', count: 12, interval: 1100 },
        { type: 'rice_slime', count: 4, interval: 2200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sushi_ninja', count: 20, interval: 850 },
        { type: 'tempura_monk', count: 12, interval: 1600 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'flour_ghost', count: 10, interval: 1100 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'steak_plate', patience: 11000, baseReward: 55, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'spicy_stir_fry', patience: 10000, baseReward: 55, tipMultiplier: 1.3 }] },
      { wave: 3, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 65, tipMultiplier: 1.5 }] },
      { wave: 4, customers: [{ dish: 'mixed_platter', patience: 9000, baseReward: 75, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true }] },
    ],
    starThresholds: { three: 19, two: 14 },
    service: { duration: 250, customerInterval: 3.3, maxCustomers: 38, customerPatience: 27 },
  },
  '7-3': {
    id: '7-3',
    nameKo: '초밥 카운터',
    theme: 'sakura_izakaya',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 1, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sushi_ninja', count: 10, interval: 1300 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
      ]},
      { wave: 2, enemies: [
        { type: 'tempura_monk', count: 10, interval: 1900 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 3, enemies: [
        { type: 'sushi_ninja', count: 14, interval: 1100 },
        { type: 'chili_demon', count: 16, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
      ]},
      { wave: 4, enemies: [
        { type: 'tempura_monk', count: 12, interval: 1700 },
        { type: 'fish_knight', count: 12, interval: 1000 },
        { type: 'meat_ogre', count: 12, interval: 950 },
        { type: 'octopus_mage', count: 10, interval: 1300 },
      ]},
      { wave: 5, enemies: [
        { type: 'sushi_ninja', count: 18, interval: 900 },
        { type: 'tempura_monk', count: 10, interval: 1700 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'rice_slime', count: 6, interval: 1900 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 6, enemies: [
        { type: 'sushi_ninja', count: 22, interval: 750 },
        { type: 'tempura_monk', count: 14, interval: 1500 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'carrot_soup', patience: 11000, baseReward: 40, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'steak_plate', patience: 10000, baseReward: 60, tipMultiplier: 1.3 }] },
      { wave: 3, customers: [{ dish: 'spicy_stir_fry', patience: 9000, baseReward: 60, tipMultiplier: 1.5 }] },
      { wave: 4, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 70, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 6, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 20, two: 15 },
    service: { duration: 260, customerInterval: 3.0, maxCustomers: 40, customerPatience: 26 },
  },
  '7-4': {
    id: '7-4',
    nameKo: '다다미 연회장',
    theme: 'sakura_izakaya',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 22, interval: 640 },
        { type: 'sushi_ninja', count: 10, interval: 1300 },
      ]},
      { wave: 2, enemies: [
        { type: 'tempura_monk', count: 10, interval: 1800 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 5, interval: 2600 },
      ]},
      { wave: 3, enemies: [
        { type: 'sushi_ninja', count: 16, interval: 1000 },
        { type: 'chili_demon', count: 16, interval: 700 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'tempura_monk', count: 12, interval: 1700 },
        { type: 'fish_knight', count: 14, interval: 950 },
        { type: 'meat_ogre', count: 14, interval: 850 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'sushi_ninja', count: 22, interval: 800 },
        { type: 'tempura_monk', count: 12, interval: 1600 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
      ]},
      { wave: 6, enemies: [
        { type: 'sushi_ninja', count: 26, interval: 700 },
        { type: 'tempura_monk', count: 16, interval: 1400 },
        { type: 'shrimp_samurai', count: 20, interval: 680 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'milk_phantom', count: 12, interval: 1100 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'steak_plate', patience: 10000, baseReward: 60, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'spicy_stir_fry', patience: 9000, baseReward: 60, tipMultiplier: 1.3 }] },
      { wave: 3, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 65, tipMultiplier: 1.5 }] },
      { wave: 4, customers: [{ dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true }] },
      { wave: 6, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 21, two: 15 },
    service: { duration: 270, customerInterval: 2.8, maxCustomers: 42, customerPatience: 26 },
  },
  '7-5': {
    id: '7-5',
    nameKo: '뒤뜰 정원',
    theme: 'sakura_izakaya',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 1, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sushi_ninja', count: 14, interval: 1200 },
        { type: 'tomato_bomber', count: 12, interval: 950 },
      ]},
      { wave: 2, enemies: [
        { type: 'tempura_monk', count: 12, interval: 1700 },
        { type: 'fish_knight', count: 14, interval: 980 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
      ]},
      { wave: 3, enemies: [
        { type: 'sushi_ninja', count: 18, interval: 950 },
        { type: 'chili_demon', count: 18, interval: 680 },
        { type: 'egg_sprite', count: 14, interval: 800 },
      ]},
      { wave: 4, enemies: [
        { type: 'tempura_monk', count: 14, interval: 1600 },
        { type: 'shrimp_samurai', count: 18, interval: 720 },
        { type: 'meat_ogre', count: 14, interval: 870 },
        { type: 'flour_ghost', count: 12, interval: 1050 },
      ]},
      { wave: 5, enemies: [
        { type: 'sushi_ninja', count: 24, interval: 780 },
        { type: 'tempura_monk', count: 14, interval: 1500 },
        { type: 'cheese_golem', count: 9, interval: 1800 },
        { type: 'rice_slime', count: 6, interval: 1900 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
      ]},
      { wave: 6, enemies: [
        { type: 'sushi_ninja', count: 28, interval: 660 },
        { type: 'tempura_monk', count: 18, interval: 1300 },
        { type: 'butter_ghost', count: 18, interval: 720 },
        { type: 'cheese_golem', count: 9, interval: 1800 },
        { type: 'milk_phantom', count: 14, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'steak_plate', patience: 10000, baseReward: 60, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 65, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'mixed_platter', patience: 9000, baseReward: 75, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'mixed_platter', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 22, two: 16 },
    service: { duration: 280, customerInterval: 2.6, maxCustomers: 44, customerPatience: 25 },
  },
  '7-6': {
    id: '7-6',
    nameKo: '이자카야 마스터 (보스)',
    theme: 'sakura_izakaya',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sushi_ninja', count: 20, interval: 900 },
        { type: 'shrimp_samurai', count: 14, interval: 850 },
        { type: 'milk_phantom', count: 8, interval: 1400 },
      ]},
      { wave: 2, enemies: [
        { type: 'tempura_monk', count: 14, interval: 1600 },
        { type: 'butter_ghost', count: 14, interval: 860 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 3, enemies: [
        { type: 'sushi_ninja', count: 26, interval: 720 },
        { type: 'chili_demon', count: 18, interval: 680 },
        { type: 'fish_knight', count: 12, interval: 1050 },
        { type: 'egg_sprite', count: 16, interval: 760 },
      ]},
      { wave: 4, enemies: [
        { type: 'tempura_monk', count: 16, interval: 1500 },
        { type: 'meat_ogre', count: 16, interval: 820 },
        { type: 'mushroom_scout', count: 12, interval: 1050 },
        { type: 'rice_slime', count: 6, interval: 1900 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'oni_herald', count: 1, interval: 0 },
        { type: 'sushi_ninja', count: 16, interval: 850 },
        { type: 'tempura_monk', count: 10, interval: 1600 },
        { type: 'shrimp_samurai', count: 18, interval: 700 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'steak_plate', patience: 10000, baseReward: 65, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 70, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'mixed_platter', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'cheese_fondue', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 24, two: 17 },
    service: { duration: 300, customerInterval: 2.4, maxCustomers: 48, customerPatience: 22 },
  },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 10장 용의 주방 ──
  // ══════════════════════════════════════════════════════════════

  '10-1': {
    id: '10-1', nameKo: '이자카야 심층부 입구', theme: 'izakaya_underground',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 20, interval: 700 },
        { type: 'dumpling_warrior', count: 8, interval: 1500 },
      ]},
      { wave: 2, enemies: [
        { type: 'dumpling_warrior', count: 10, interval: 1400 },
        { type: 'shrimp_samurai', count: 12, interval: 1000 },
        { type: 'butter_ghost', count: 8, interval: 1200 },
      ]},
      { wave: 3, enemies: [
        { type: 'dumpling_warrior', count: 14, interval: 1200 },
        { type: 'sake_specter', count: 4, interval: 2200 },
        { type: 'cheese_golem', count: 4, interval: 2800 },
      ]},
      { wave: 4, enemies: [
        { type: 'dumpling_warrior', count: 16, interval: 1100 },
        { type: 'sake_specter', count: 6, interval: 2000 },
        { type: 'fish_knight', count: 12, interval: 1100 },
        { type: 'flour_ghost', count: 8, interval: 1300 },
      ]},
      { wave: 5, enemies: [
        { type: 'dumpling_warrior', count: 20, interval: 900 },
        { type: 'sake_specter', count: 8, interval: 1800 },
        { type: 'oni_minion', count: 6, interval: 2000 },
        { type: 'meat_ogre', count: 10, interval: 1100 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'steak_plate', patience: 10000, baseReward: 60, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'spicy_stir_fry', patience: 9000, baseReward: 60, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'seafood_pasta', patience: 9000, baseReward: 70, tipMultiplier: 1.5 }] },
      { wave: 4, customers: [{ dish: 'sake_cocktail', patience: 9000, baseReward: 75, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_bowl', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 18, two: 13 },
    service: { duration: 240, customerInterval: 3.5, maxCustomers: 35, customerPatience: 27 },
  },
  '10-2': {
    id: '10-2', nameKo: '사케 저장고', theme: 'izakaya_underground',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 1, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 22, interval: 650 },
        { type: 'sake_specter', count: 6, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'sake_specter', count: 10, interval: 1800 },
        { type: 'chili_demon', count: 16, interval: 720 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 3, enemies: [
        { type: 'oni_minion', count: 8, interval: 2000 },
        { type: 'shrimp_samurai', count: 14, interval: 850 },
        { type: 'cheese_golem', count: 5, interval: 2600 },
      ]},
      { wave: 4, enemies: [
        { type: 'sake_specter', count: 12, interval: 1600 },
        { type: 'oni_minion', count: 10, interval: 1800 },
        { type: 'sushi_ninja', count: 12, interval: 1200 },
        { type: 'rice_slime', count: 4, interval: 2200 },
      ]},
      { wave: 5, enemies: [
        { type: 'sake_specter', count: 16, interval: 1400 },
        { type: 'oni_minion', count: 12, interval: 1600 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'flour_ghost', count: 10, interval: 1100 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_cocktail', patience: 10000, baseReward: 65, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_bowl', patience: 9000, baseReward: 75, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'sake_shrimp', patience: 9000, baseReward: 70, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_sashimi', patience: 8000, baseReward: 85, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 95, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 19, two: 14 },
    service: { duration: 250, customerInterval: 3.3, maxCustomers: 38, customerPatience: 26 },
  },
  '10-3': {
    id: '10-3', nameKo: '지하 통로', theme: 'izakaya_underground',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 4, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sake_specter', count: 12, interval: 1500 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
      ]},
      { wave: 2, enemies: [
        { type: 'oni_minion', count: 10, interval: 1800 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
        { type: 'tempura_monk', count: 8, interval: 1800 },
      ]},
      { wave: 3, enemies: [
        { type: 'sake_specter', count: 16, interval: 1300 },
        { type: 'chili_demon', count: 16, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
      ]},
      { wave: 4, enemies: [
        { type: 'oni_minion', count: 14, interval: 1600 },
        { type: 'fish_knight', count: 14, interval: 950 },
        { type: 'meat_ogre', count: 12, interval: 950 },
        { type: 'octopus_mage', count: 8, interval: 1400 },
      ]},
      { wave: 5, enemies: [
        { type: 'sake_specter', count: 20, interval: 1100 },
        { type: 'oni_minion', count: 12, interval: 1600 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
        { type: 'rice_slime', count: 6, interval: 1900 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 6, enemies: [
        { type: 'sake_specter', count: 24, interval: 950 },
        { type: 'oni_minion', count: 16, interval: 1400 },
        { type: 'sushi_ninja', count: 16, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_cocktail', patience: 10000, baseReward: 65, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_bowl', patience: 9000, baseReward: 75, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'sake_shrimp', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_sashimi', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 20, two: 15 },
    service: { duration: 260, customerInterval: 3.0, maxCustomers: 40, customerPatience: 26 },
  },
  '10-4': {
    id: '10-4', nameKo: '봉인 전실', theme: 'izakaya_underground',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 4, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sake_specter', count: 14, interval: 1400 },
        { type: 'oni_minion', count: 10, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'sake_specter', count: 18, interval: 1200 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 5, interval: 2600 },
      ]},
      { wave: 3, enemies: [
        { type: 'oni_minion', count: 16, interval: 1500 },
        { type: 'chili_demon', count: 16, interval: 700 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'sake_specter', count: 20, interval: 1100 },
        { type: 'oni_minion', count: 14, interval: 1500 },
        { type: 'fish_knight', count: 14, interval: 950 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'sake_specter', count: 24, interval: 950 },
        { type: 'oni_minion', count: 16, interval: 1400 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
      ]},
      { wave: 6, enemies: [
        { type: 'sake_specter', count: 28, interval: 820 },
        { type: 'oni_minion', count: 20, interval: 1300 },
        { type: 'tempura_monk', count: 14, interval: 1600 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_shrimp', patience: 9000, baseReward: 75, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_sashimi', patience: 9000, baseReward: 85, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 95, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 105, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_oden', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 21, two: 15 },
    service: { duration: 270, customerInterval: 2.8, maxCustomers: 42, customerPatience: 25 },
  },
  '10-5': {
    id: '10-5', nameKo: '심층부 제단', theme: 'izakaya_underground',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'sake_specter', count: 18, interval: 1200 },
        { type: 'oni_minion', count: 14, interval: 1500 },
      ]},
      { wave: 2, enemies: [
        { type: 'sake_specter', count: 20, interval: 1100 },
        { type: 'fish_knight', count: 14, interval: 980 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
      ]},
      { wave: 3, enemies: [
        { type: 'oni_minion', count: 20, interval: 1300 },
        { type: 'chili_demon', count: 18, interval: 680 },
        { type: 'egg_sprite', count: 14, interval: 800 },
      ]},
      { wave: 4, enemies: [
        { type: 'sake_specter', count: 24, interval: 950 },
        { type: 'oni_minion', count: 18, interval: 1200 },
        { type: 'meat_ogre', count: 14, interval: 870 },
        { type: 'flour_ghost', count: 12, interval: 1050 },
      ]},
      { wave: 5, enemies: [
        { type: 'sake_specter', count: 28, interval: 800 },
        { type: 'oni_minion', count: 20, interval: 1100 },
        { type: 'cheese_golem', count: 9, interval: 1800 },
        { type: 'rice_slime', count: 6, interval: 1900 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
      ]},
      { wave: 6, enemies: [
        { type: 'sake_specter', count: 32, interval: 700 },
        { type: 'oni_minion', count: 24, interval: 1000 },
        { type: 'butter_ghost', count: 18, interval: 720 },
        { type: 'cheese_golem', count: 10, interval: 1800 },
        { type: 'tempura_monk', count: 12, interval: 1600 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_sashimi', patience: 9000, baseReward: 80, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_oden', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 22, two: 16 },
    service: { duration: 280, customerInterval: 2.6, maxCustomers: 44, customerPatience: 24 },
  },
  // ── Phase 26-2: 10-6 sake_master 보스전으로 교체 (기존 dragon_wok → 12-6 이동) ──
  '10-6': {
    id: '10-6', nameKo: '이자카야 심층부 \u2014 최심층 (보스)', theme: 'izakaya_underground',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 22, interval: 1100 }, { type: 'oni_minion', count: 16, interval: 1500 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 26, interval: 950 }, { type: 'tempura_monk', count: 14, interval: 1700 }, { type: 'cheese_golem', count: 6, interval: 2400 }] },
      { wave: 3, enemies: [{ type: 'sake_specter', count: 28, interval: 880 }, { type: 'oni_minion', count: 22, interval: 1300 }, { type: 'sushi_ninja', count: 12, interval: 1100 }, { type: 'butter_ghost', count: 14, interval: 900 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 30, interval: 820 }, { type: 'oni_minion', count: 24, interval: 1200 }, { type: 'fish_knight', count: 16, interval: 900 }, { type: 'milk_phantom', count: 8, interval: 1500 }] },
      { wave: 5, enemies: [{ type: 'sake_master', count: 1, interval: 0 }, { type: 'sake_specter', count: 14, interval: 1000 }, { type: 'oni_minion', count: 12, interval: 1400 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_cocktail', patience: 9000, baseReward: 70, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_bowl', patience: 8500, baseReward: 85, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 24, two: 17 },
    service: { duration: 300, customerInterval: 2.4, maxCustomers: 48, customerPatience: 21 },
  },

  // ══════════════════════════════════════════════════════════════
  // ── 그룹 2: 8장 placeholder ──
  // ══════════════════════════════════════════════════════════════

  '8-1': { id: '8-1', nameKo: '미구현', theme: 'placeholder' },
  '8-2': { id: '8-2', nameKo: '미구현', theme: 'placeholder' },
  '8-3': { id: '8-3', nameKo: '미구현', theme: 'placeholder' },
  '8-4': { id: '8-4', nameKo: '미구현', theme: 'placeholder' },
  '8-5': { id: '8-5', nameKo: '미구현', theme: 'placeholder' },
  '8-6': { id: '8-6', nameKo: '미구현', theme: 'placeholder' },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 9장 별빛 비스트로 ──
  // ══════════════════════════════════════════════════════════════

  '9-1': {
    id: '9-1', nameKo: '별빛 로비', theme: 'starlight_bistro',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 22, interval: 1100 }, { type: 'oni_minion', count: 16, interval: 1500 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 24, interval: 1000 }, { type: 'shrimp_samurai', count: 16, interval: 850 }, { type: 'cheese_golem', count: 6, interval: 2200 }] },
      { wave: 3, enemies: [{ type: 'oni_minion', count: 20, interval: 1300 }, { type: 'sake_specter', count: 26, interval: 950 }, { type: 'flour_ghost', count: 12, interval: 1000 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 28, interval: 880 }, { type: 'oni_minion', count: 20, interval: 1200 }, { type: 'fish_knight', count: 14, interval: 950 }, { type: 'rice_slime', count: 5, interval: 2000 }] },
      { wave: 5, enemies: [{ type: 'sake_specter', count: 30, interval: 800 }, { type: 'oni_minion', count: 22, interval: 1100 }, { type: 'cheese_golem', count: 8, interval: 1900 }, { type: 'tempura_monk', count: 8, interval: 1800 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_cocktail', patience: 9000, baseReward: 70, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_bowl', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_oden', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 25, two: 18 },
    service: { duration: 290, customerInterval: 2.5, maxCustomers: 46, customerPatience: 25 },
  },
  '9-2': {
    id: '9-2', nameKo: '달빛 테라스', theme: 'starlight_bistro',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 1, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 24, interval: 1000 }, { type: 'oni_minion', count: 18, interval: 1400 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 26, interval: 950 }, { type: 'chili_demon', count: 16, interval: 700 }, { type: 'cheese_golem', count: 6, interval: 2100 }] },
      { wave: 3, enemies: [{ type: 'oni_minion', count: 20, interval: 1200 }, { type: 'sake_specter', count: 28, interval: 900 }, { type: 'butter_ghost', count: 14, interval: 950 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 30, interval: 840 }, { type: 'oni_minion', count: 22, interval: 1100 }, { type: 'meat_ogre', count: 12, interval: 950 }, { type: 'rice_slime', count: 5, interval: 1900 }] },
      { wave: 5, enemies: [{ type: 'sake_specter', count: 32, interval: 780 }, { type: 'oni_minion', count: 24, interval: 1050 }, { type: 'cheese_golem', count: 8, interval: 1800 }, { type: 'flour_ghost', count: 12, interval: 1000 }] },
      { wave: 6, enemies: [{ type: 'sake_specter', count: 34, interval: 720 }, { type: 'oni_minion', count: 26, interval: 980 }, { type: 'cheese_golem', count: 10, interval: 1700 }, { type: 'sushi_ninja', count: 14, interval: 900 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_cocktail', patience: 9000, baseReward: 70, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_bowl', patience: 8000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_shrimp', patience: 8000, baseReward: 90, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 112, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_oden', patience: 8000, baseReward: 125, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 26, two: 19 },
    service: { duration: 300, customerInterval: 2.3, maxCustomers: 48, customerPatience: 24 },
  },
  '9-3': {
    id: '9-3', nameKo: '성운 와인셀러', theme: 'starlight_bistro',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 26, interval: 950 }, { type: 'oni_minion', count: 20, interval: 1300 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 28, interval: 900 }, { type: 'chili_demon', count: 18, interval: 680 }, { type: 'cheese_golem', count: 6, interval: 2000 }] },
      { wave: 3, enemies: [{ type: 'oni_minion', count: 22, interval: 1200 }, { type: 'sake_specter', count: 30, interval: 860 }, { type: 'fish_knight', count: 14, interval: 950 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 32, interval: 820 }, { type: 'oni_minion', count: 24, interval: 1100 }, { type: 'flour_ghost', count: 12, interval: 1000 }, { type: 'rice_slime', count: 6, interval: 1900 }] },
      { wave: 5, enemies: [{ type: 'sake_specter', count: 34, interval: 770 }, { type: 'oni_minion', count: 26, interval: 1000 }, { type: 'cheese_golem', count: 9, interval: 1800 }, { type: 'meat_ogre', count: 12, interval: 900 }] },
      { wave: 6, enemies: [{ type: 'sake_specter', count: 36, interval: 720 }, { type: 'oni_minion', count: 28, interval: 960 }, { type: 'cheese_golem', count: 10, interval: 1700 }, { type: 'tempura_monk', count: 10, interval: 1700 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_cocktail', patience: 9000, baseReward: 72, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_shrimp', patience: 8000, baseReward: 82, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_sashimi', patience: 8000, baseReward: 94, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 106, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 118, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 132, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 27, two: 20 },
    service: { duration: 310, customerInterval: 2.2, maxCustomers: 50, customerPatience: 23 },
  },
  '9-4': {
    id: '9-4', nameKo: '오로라 홀', theme: 'starlight_bistro',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 3, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 28, interval: 900 }, { type: 'oni_minion', count: 22, interval: 1200 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 30, interval: 860 }, { type: 'sushi_ninja', count: 16, interval: 850 }, { type: 'cheese_golem', count: 7, interval: 2000 }] },
      { wave: 3, enemies: [{ type: 'oni_minion', count: 24, interval: 1100 }, { type: 'sake_specter', count: 32, interval: 820 }, { type: 'flour_ghost', count: 14, interval: 950 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 34, interval: 780 }, { type: 'oni_minion', count: 26, interval: 1000 }, { type: 'fish_knight', count: 14, interval: 950 }, { type: 'rice_slime', count: 6, interval: 1900 }] },
      { wave: 5, enemies: [{ type: 'sake_specter', count: 36, interval: 740 }, { type: 'oni_minion', count: 28, interval: 980 }, { type: 'cheese_golem', count: 10, interval: 1800 }, { type: 'tempura_monk', count: 10, interval: 1700 }, { type: 'butter_ghost', count: 12, interval: 960 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_shrimp', patience: 9000, baseReward: 76, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_sashimi', patience: 8000, baseReward: 88, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 114, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 28, two: 20 },
    service: { duration: 320, customerInterval: 2.1, maxCustomers: 52, customerPatience: 23 },
  },
  '9-5': {
    id: '9-5', nameKo: '유성 테이블', theme: 'starlight_bistro',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 1, colEnd: 4 },
      { type: 'vertical', col: 1, rowStart: 2, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 30, interval: 860 }, { type: 'oni_minion', count: 24, interval: 1100 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 32, interval: 820 }, { type: 'chili_demon', count: 18, interval: 680 }, { type: 'cheese_golem', count: 7, interval: 2000 }] },
      { wave: 3, enemies: [{ type: 'oni_minion', count: 26, interval: 1000 }, { type: 'sake_specter', count: 34, interval: 780 }, { type: 'meat_ogre', count: 14, interval: 900 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 36, interval: 750 }, { type: 'oni_minion', count: 28, interval: 960 }, { type: 'flour_ghost', count: 14, interval: 950 }, { type: 'rice_slime', count: 6, interval: 1900 }] },
      { wave: 5, enemies: [{ type: 'sake_specter', count: 38, interval: 720 }, { type: 'oni_minion', count: 30, interval: 940 }, { type: 'cheese_golem', count: 10, interval: 1800 }, { type: 'fish_knight', count: 14, interval: 950 }] },
      { wave: 6, enemies: [{ type: 'sake_specter', count: 40, interval: 700 }, { type: 'oni_minion', count: 32, interval: 920 }, { type: 'cheese_golem', count: 12, interval: 1700 }, { type: 'tempura_monk', count: 12, interval: 1600 }, { type: 'sushi_ninja', count: 14, interval: 900 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_sashimi', patience: 9000, baseReward: 78, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_ramen', patience: 8000, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 104, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_oden', patience: 8000, baseReward: 118, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 132, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 148, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 29, two: 21 },
    service: { duration: 330, customerInterval: 2.0, maxCustomers: 54, customerPatience: 22 },
  },
  '9-6': {
    id: '9-6', nameKo: '은하수 주방 (보스)', theme: 'starlight_bistro',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 4, rowStart: 0, rowEnd: 2 },
      { type: 'horizontal', row: 2, colStart: 4, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 2, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [{ type: 'sake_specter', count: 32, interval: 780 }, { type: 'oni_minion', count: 26, interval: 1000 }, { type: 'cheese_golem', count: 8, interval: 1900 }] },
      { wave: 2, enemies: [{ type: 'sake_specter', count: 34, interval: 750 }, { type: 'oni_minion', count: 28, interval: 960 }, { type: 'flour_ghost', count: 14, interval: 950 }, { type: 'sushi_ninja', count: 14, interval: 900 }] },
      { wave: 3, enemies: [{ type: 'sake_specter', count: 36, interval: 720 }, { type: 'oni_minion', count: 30, interval: 940 }, { type: 'tempura_monk', count: 12, interval: 1600 }, { type: 'cheese_golem', count: 10, interval: 1700 }] },
      { wave: 4, enemies: [{ type: 'sake_specter', count: 38, interval: 700 }, { type: 'oni_minion', count: 32, interval: 920 }, { type: 'fish_knight', count: 16, interval: 920 }, { type: 'meat_ogre', count: 14, interval: 870 }, { type: 'cheese_golem', count: 10, interval: 1700 }] },
      { wave: 5, enemies: [{ type: 'sake_specter', count: 40, interval: 680 }, { type: 'oni_minion', count: 34, interval: 900 }, { type: 'cheese_golem', count: 12, interval: 1600 }, { type: 'butter_ghost', count: 16, interval: 880 }, { type: 'rice_slime', count: 8, interval: 1700 }] },
      { wave: 6, enemies: [{ type: 'sake_oni', count: 1, interval: 0 }, { type: 'sake_specter', count: 20, interval: 1000 }, { type: 'oni_minion', count: 16, interval: 1200 }] },
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'sake_ramen', patience: 9000, baseReward: 82, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'sake_hotpot', patience: 8000, baseReward: 96, tipMultiplier: 2.0, vip: true }] },
      { wave: 3, customers: [{ dish: 'sake_oden', patience: 8000, baseReward: 112, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 128, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 148, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'sake_kaiseki', patience: 8000, baseReward: 175, tipMultiplier: 2.5, vip: true }] },
    ],
    starThresholds: { three: 30, two: 22 },
    service: { duration: 340, customerInterval: 1.8, maxCustomers: 56, customerPatience: 22 },
  },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 11장 (미구현) ──
  // ══════════════════════════════════════════════════════════════

  // ── Phase 25-1: 11장 용의 주방 심층부 ──

  '11-1': {
    id: '11-1',
    nameKo: '용의 주방 심층부 입구',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 5 },
      { type: 'horizontal', row: 5, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 5, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'carrot_goblin', count: 22, interval: 650 },
        { type: 'shadow_dragon_spawn', count: 6, interval: 2200 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 8, interval: 2000 },
        { type: 'chili_demon', count: 16, interval: 720 },
        { type: 'rice_slime', count: 6, interval: 1800 },
      ]},
      { wave: 3, enemies: [
        { type: 'shadow_dragon_spawn', count: 10, interval: 1800 },
        { type: 'wok_guardian', count: 4, interval: 3000 },
        { type: 'cheese_golem', count: 4, interval: 2600 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 14, interval: 1500 },
        { type: 'wok_guardian', count: 6, interval: 2600 },
        { type: 'meat_ogre', count: 12, interval: 950 },
        { type: 'flour_ghost', count: 8, interval: 1300 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 18, interval: 1200 },
        { type: 'wok_guardian', count: 8, interval: 2400 },
        { type: 'chili_demon', count: 20, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'wok_noodles', patience: 10000, baseReward: 60, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'star_anise_broth_ramen', patience: 9500, baseReward: 72, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'star_anise_broth_ramen', patience: 9000, baseReward: 80, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'five_spice_stir_fry', patience: 8500, baseReward: 88, tipMultiplier: 1.5, vip: true }] },
      { wave: 5, customers: [{ dish: 'five_spice_stir_fry', patience: 8000, baseReward: 98, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 20, two: 15 },
    service: { duration: 250, customerInterval: 3.5, maxCustomers: 36, customerPatience: 27 },
  },

  '11-2': {
    id: '11-2',
    nameKo: '심층 통로',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 1, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 10, interval: 1800 },
        { type: 'shrimp_samurai', count: 14, interval: 900 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 12, interval: 1600 },
        { type: 'wok_guardian', count: 5, interval: 2800 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 3, enemies: [
        { type: 'shadow_dragon_spawn', count: 16, interval: 1400 },
        { type: 'chili_demon', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 5, interval: 2400 },
      ]},
      { wave: 4, enemies: [
        { type: 'wok_guardian', count: 8, interval: 2400 },
        { type: 'shadow_dragon_spawn', count: 16, interval: 1200 },
        { type: 'fish_knight', count: 14, interval: 950 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 20, interval: 1100 },
        { type: 'wok_guardian', count: 10, interval: 2200 },
        { type: 'meat_ogre', count: 14, interval: 900 },
        { type: 'flour_ghost', count: 10, interval: 1100 },
        { type: 'cheese_golem', count: 7, interval: 2000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 24, interval: 950 },
        { type: 'wok_guardian', count: 12, interval: 2000 },
        { type: 'sushi_ninja', count: 14, interval: 950 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'star_anise_broth_ramen', patience: 9500, baseReward: 70, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'mapo_star_anise_steam', patience: 9000, baseReward: 78, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'five_spice_stir_fry', patience: 9000, baseReward: 82, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'five_spice_stir_fry', patience: 8500, baseReward: 90, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'star_anise_hotpot', patience: 8000, baseReward: 102, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'star_anise_hotpot', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 22, two: 16 },
    service: { duration: 260, customerInterval: 3.2, maxCustomers: 38, customerPatience: 26 },
  },

  '11-3': {
    id: '11-3',
    nameKo: '용의 정원',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 4, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 14, interval: 1500 },
        { type: 'oni_minion', count: 10, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 16, interval: 1300 },
        { type: 'wok_guardian', count: 6, interval: 2600 },
        { type: 'butter_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 3, enemies: [
        { type: 'shadow_dragon_spawn', count: 18, interval: 1200 },
        { type: 'chili_demon', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
      ]},
      { wave: 4, enemies: [
        { type: 'wok_guardian', count: 10, interval: 2200 },
        { type: 'shadow_dragon_spawn', count: 18, interval: 1100 },
        { type: 'fish_knight', count: 14, interval: 950 },
        { type: 'meat_ogre', count: 12, interval: 950 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 22, interval: 1050 },
        { type: 'wok_guardian', count: 12, interval: 2000 },
        { type: 'cheese_golem', count: 8, interval: 2000 },
        { type: 'rice_slime', count: 6, interval: 1900 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 26, interval: 900 },
        { type: 'wok_guardian', count: 14, interval: 1900 },
        { type: 'sushi_ninja', count: 16, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'star_anise_broth_ramen', patience: 9500, baseReward: 72, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'mapo_star_anise_steam', patience: 9000, baseReward: 82, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'five_spice_stir_fry', patience: 8500, baseReward: 88, tipMultiplier: 1.5, vip: true }] },
      { wave: 4, customers: [{ dish: 'star_anise_hotpot', patience: 8500, baseReward: 98, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'star_anise_hotpot', patience: 8000, baseReward: 110, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'dragon_spice_banquet', patience: 8000, baseReward: 122, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 24, two: 18 },
    service: { duration: 270, customerInterval: 3.0, maxCustomers: 40, customerPatience: 26 },
  },

  '11-4': {
    id: '11-4',
    nameKo: '용의 심장부',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 4, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 16, interval: 1400 },
        { type: 'wok_guardian', count: 8, interval: 2400 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 18, interval: 1200 },
        { type: 'shrimp_samurai', count: 16, interval: 800 },
        { type: 'cheese_golem', count: 5, interval: 2600 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 12, interval: 2000 },
        { type: 'chili_demon', count: 18, interval: 700 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 22, interval: 1100 },
        { type: 'wok_guardian', count: 14, interval: 1900 },
        { type: 'fish_knight', count: 14, interval: 950 },
        { type: 'rice_slime', count: 5, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 26, interval: 950 },
        { type: 'wok_guardian', count: 16, interval: 1800 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
        { type: 'mushroom_scout', count: 10, interval: 1100 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 30, interval: 820 },
        { type: 'wok_guardian', count: 18, interval: 1600 },
        { type: 'tempura_monk', count: 12, interval: 1600 },
        { type: 'cheese_golem', count: 8, interval: 1800 },
        { type: 'milk_phantom', count: 10, interval: 1200 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'five_spice_stir_fry', patience: 9500, baseReward: 76, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'star_anise_hotpot', patience: 9000, baseReward: 88, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'dragon_spice_banquet', patience: 8500, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'dragon_spice_banquet', patience: 8500, baseReward: 112, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'legendary_star_anise_course', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'legendary_star_anise_course', patience: 8000, baseReward: 148, tipMultiplier: 2.5, vip: true }] },
    ],
    starThresholds: { three: 26, two: 19 },
    service: { duration: 290, customerInterval: 2.8, maxCustomers: 44, customerPatience: 25 },
  },

  '11-5': {
    id: '11-5',
    nameKo: '용의 보좌 앞',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 18, interval: 1300 },
        { type: 'wok_guardian', count: 10, interval: 2200 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 22, interval: 1100 },
        { type: 'chili_demon', count: 20, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2400 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 14, interval: 1900 },
        { type: 'shadow_dragon_spawn', count: 20, interval: 1100 },
        { type: 'oni_minion', count: 12, interval: 1600 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 26, interval: 950 },
        { type: 'wok_guardian', count: 16, interval: 1800 },
        { type: 'fish_knight', count: 16, interval: 900 },
        { type: 'rice_slime', count: 6, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 28, interval: 880 },
        { type: 'wok_guardian', count: 18, interval: 1700 },
        { type: 'sake_specter', count: 12, interval: 1500 },
        { type: 'cheese_golem', count: 9, interval: 1900 },
        { type: 'mushroom_scout', count: 12, interval: 1000 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 780 },
        { type: 'wok_guardian', count: 20, interval: 1500 },
        { type: 'tempura_monk', count: 14, interval: 1500 },
        { type: 'cheese_golem', count: 10, interval: 1700 },
        { type: 'milk_phantom', count: 12, interval: 1200 },
        { type: 'sake_specter', count: 14, interval: 1300 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'star_anise_broth_ramen', patience: 9000, baseReward: 80, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'star_anise_hotpot', patience: 8500, baseReward: 95, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'dragon_spice_banquet', patience: 8500, baseReward: 108, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'dragon_spice_banquet', patience: 8000, baseReward: 122, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'legendary_star_anise_course', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'legendary_star_anise_course', patience: 8000, baseReward: 162, tipMultiplier: 2.5, vip: true }] },
    ],
    starThresholds: { three: 28, two: 21 },
    service: { duration: 320, customerInterval: 2.5, maxCustomers: 50, customerPatience: 24 },
  },
  // ── Phase 26-2: 11-6 완성 (dragon_wok 약화 선등장 미니전) ──
  '11-6': {
    id: '11-6',
    nameKo: '용의 보좌 \u2014 최후의 관문',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 11-5와 동일한 S자 경로
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 20, interval: 1200 },
        { type: 'wok_guardian', count: 12, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 24, interval: 1050 },
        { type: 'wok_guardian', count: 14, interval: 1800 },
        { type: 'chili_demon', count: 20, interval: 700 },
      ]},
      { wave: 3, enemies: [
        { type: 'shadow_dragon_spawn', count: 26, interval: 950 },
        { type: 'wok_guardian', count: 16, interval: 1700 },
        { type: 'sake_specter', count: 14, interval: 1400 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 28, interval: 880 },
        { type: 'wok_guardian', count: 18, interval: 1600 },
        { type: 'fish_knight', count: 16, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 800 },
        { type: 'wok_guardian', count: 20, interval: 1500 },
        { type: 'tempura_monk', count: 14, interval: 1500 },
        { type: 'milk_phantom', count: 12, interval: 1200 },
      ]},
      // wave 6: dragon_wok 약화 선등장 (hpOverride: 2500)
      { wave: 6, enemies: [
        { type: 'dragon_wok', count: 1, interval: 0, hpOverride: 2500 },
        { type: 'shadow_dragon_spawn', count: 18, interval: 900 },
        { type: 'wok_guardian', count: 10, interval: 1700 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'five_spice_stir_fry', patience: 9000, baseReward: 88, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'star_anise_hotpot', patience: 8500, baseReward: 100, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'dragon_spice_banquet', patience: 8500, baseReward: 115, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'dragon_spice_banquet', patience: 8000, baseReward: 128, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'legendary_star_anise_course', patience: 8000, baseReward: 148, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'legendary_star_anise_course', patience: 7500, baseReward: 170, tipMultiplier: 2.5, vip: true }] },
    ],
    starThresholds: { three: 30, two: 22 },
    service: { duration: 340, customerInterval: 2.5, maxCustomers: 52, customerPatience: 23 },
  },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 12장 용의 궁전 결전 (Phase 26-2) ──
  // ══════════════════════════════════════════════════════════════

  // ── 12-1: 용의 궁전 입구 ──
  '12-1': {
    id: '12-1',
    nameKo: '용의 궁전 입구',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 22, interval: 1200 },
        { type: 'wok_guardian', count: 12, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 26, interval: 1050 },
        { type: 'chili_demon', count: 18, interval: 700 },
        { type: 'cheese_golem', count: 6, interval: 2300 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 16, interval: 1800 },
        { type: 'shadow_dragon_spawn', count: 24, interval: 1000 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 28, interval: 900 },
        { type: 'wok_guardian', count: 18, interval: 1700 },
        { type: 'fish_knight', count: 16, interval: 900 },
        { type: 'rice_slime', count: 6, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 820 },
        { type: 'wok_guardian', count: 20, interval: 1600 },
        { type: 'cheese_golem', count: 9, interval: 1800 },
        { type: 'mushroom_scout', count: 12, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'dragon_soup', patience: 9000, baseReward: 82, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'wok_flame_rice', patience: 8500, baseReward: 90, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'dragon_dim_sum', patience: 8500, baseReward: 85, tipMultiplier: 1.5 }] },
      { wave: 4, customers: [{ dish: 'wok_flame_rice', patience: 8000, baseReward: 100, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'dragon_soup', patience: 8000, baseReward: 118, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 24, two: 18 },
    service: { duration: 290, customerInterval: 2.8, maxCustomers: 46, customerPatience: 25 },
  },

  // ── 12-2: 용의 가문 훈련장 ──
  '12-2': {
    id: '12-2',
    nameKo: '용의 가문 훈련장',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 11-5와 동일 패턴 (S자)
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 24, interval: 1100 },
        { type: 'wok_guardian', count: 14, interval: 1900 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 28, interval: 950 },
        { type: 'chili_demon', count: 22, interval: 680 },
        { type: 'cheese_golem', count: 6, interval: 2200 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 18, interval: 1700 },
        { type: 'shadow_dragon_spawn', count: 26, interval: 950 },
        { type: 'oni_minion', count: 14, interval: 1500 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 860 },
        { type: 'wok_guardian', count: 20, interval: 1600 },
        { type: 'fish_knight', count: 18, interval: 880 },
        { type: 'rice_slime', count: 6, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 36, interval: 780 },
        { type: 'wok_guardian', count: 22, interval: 1500 },
        { type: 'cheese_golem', count: 10, interval: 1700 },
        { type: 'sake_specter', count: 14, interval: 1300 },
        { type: 'mushroom_scout', count: 12, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'fire_wok_noodle', patience: 9000, baseReward: 86, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'dragon_dim_sum', patience: 8500, baseReward: 94, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'fire_wok_noodle', patience: 8000, baseReward: 106, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'palace_hotpot', patience: 8000, baseReward: 122, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'palace_hotpot', patience: 8000, baseReward: 138, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 26, two: 19 },
    service: { duration: 300, customerInterval: 2.7, maxCustomers: 48, customerPatience: 24 },
  },

  // ── 12-3: 용의 불꽃 정원 ──
  '12-3': {
    id: '12-3',
    nameKo: '용의 불꽃 정원',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 11-4와 동일 패턴 (W자)
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 4, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 24, interval: 1100 },
        { type: 'wok_guardian', count: 14, interval: 1900 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 28, interval: 950 },
        { type: 'chili_demon', count: 22, interval: 680 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 18, interval: 1700 },
        { type: 'shadow_dragon_spawn', count: 28, interval: 920 },
        { type: 'sake_specter', count: 14, interval: 1400 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 840 },
        { type: 'wok_guardian', count: 20, interval: 1600 },
        { type: 'fish_knight', count: 18, interval: 880 },
        { type: 'rice_slime', count: 6, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 36, interval: 760 },
        { type: 'wok_guardian', count: 22, interval: 1500 },
        { type: 'tempura_monk', count: 14, interval: 1500 },
        { type: 'cheese_golem', count: 9, interval: 1800 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 40, interval: 700 },
        { type: 'wok_guardian', count: 24, interval: 1400 },
        { type: 'cheese_golem', count: 12, interval: 1700 },
        { type: 'sake_specter', count: 16, interval: 1200 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'dragon_soup', patience: 9000, baseReward: 88, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'wok_flame_rice', patience: 8500, baseReward: 98, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'imperial_tofu_feast', patience: 8000, baseReward: 112, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'palace_hotpot', patience: 8000, baseReward: 128, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'dragon_wok_banquet', patience: 8000, baseReward: 148, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'dragon_wok_banquet', patience: 8000, baseReward: 165, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 28, two: 21 },
    service: { duration: 310, customerInterval: 2.6, maxCustomers: 50, customerPatience: 24 },
  },

  // ── 12-4: 용의 궁전 내전 ──
  '12-4': {
    id: '12-4',
    nameKo: '용의 궁전 내전',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 11-3과 동일 패턴
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 4, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 26, interval: 1050 },
        { type: 'wok_guardian', count: 16, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 30, interval: 900 },
        { type: 'chili_demon', count: 24, interval: 660 },
        { type: 'cheese_golem', count: 8, interval: 2100 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 20, interval: 1600 },
        { type: 'shadow_dragon_spawn', count: 30, interval: 880 },
        { type: 'oni_minion', count: 16, interval: 1400 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 34, interval: 800 },
        { type: 'wok_guardian', count: 22, interval: 1500 },
        { type: 'fish_knight', count: 20, interval: 860 },
        { type: 'sake_specter', count: 16, interval: 1300 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 38, interval: 730 },
        { type: 'wok_guardian', count: 24, interval: 1400 },
        { type: 'tempura_monk', count: 16, interval: 1400 },
        { type: 'cheese_golem', count: 10, interval: 1700 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 42, interval: 670 },
        { type: 'wok_guardian', count: 26, interval: 1300 },
        { type: 'sake_specter', count: 18, interval: 1200 },
        { type: 'cheese_golem', count: 12, interval: 1600 },
        { type: 'mushroom_scout', count: 14, interval: 950 },
        { type: 'butter_ghost', count: 14, interval: 900 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'fire_wok_noodle', patience: 9000, baseReward: 92, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'imperial_tofu_feast', patience: 8000, baseReward: 106, tipMultiplier: 2.0, vip: true }] },
      { wave: 3, customers: [{ dish: 'palace_hotpot', patience: 8000, baseReward: 120, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'dragon_wok_banquet', patience: 8000, baseReward: 138, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 155, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 172, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 30, two: 22 },
    service: { duration: 320, customerInterval: 2.5, maxCustomers: 52, customerPatience: 23 },
  },

  // ── 12-5: 용의 왕좌 앞 ──
  '12-5': {
    id: '12-5',
    nameKo: '용의 왕좌 앞',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 11-2와 동일 패턴
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 1, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 28, interval: 1000 },
        { type: 'wok_guardian', count: 18, interval: 1700 },
      ]},
      { wave: 2, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 870 },
        { type: 'chili_demon', count: 26, interval: 640 },
        { type: 'cheese_golem', count: 8, interval: 2000 },
      ]},
      { wave: 3, enemies: [
        { type: 'wok_guardian', count: 22, interval: 1500 },
        { type: 'shadow_dragon_spawn', count: 32, interval: 850 },
        { type: 'sake_specter', count: 16, interval: 1300 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'shadow_dragon_spawn', count: 36, interval: 780 },
        { type: 'wok_guardian', count: 24, interval: 1400 },
        { type: 'fish_knight', count: 20, interval: 840 },
        { type: 'rice_slime', count: 7, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'shadow_dragon_spawn', count: 40, interval: 710 },
        { type: 'wok_guardian', count: 26, interval: 1300 },
        { type: 'tempura_monk', count: 18, interval: 1400 },
        { type: 'cheese_golem', count: 11, interval: 1700 },
        { type: 'milk_phantom', count: 12, interval: 1200 },
      ]},
      { wave: 6, enemies: [
        { type: 'shadow_dragon_spawn', count: 44, interval: 650 },
        { type: 'wok_guardian', count: 28, interval: 1250 },
        { type: 'sake_specter', count: 20, interval: 1150 },
        { type: 'cheese_golem', count: 13, interval: 1600 },
        { type: 'oni_minion', count: 14, interval: 1400 },
        { type: 'butter_ghost', count: 16, interval: 880 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'dragon_wok_banquet', patience: 9000, baseReward: 108, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'palace_hotpot', patience: 8000, baseReward: 118, tipMultiplier: 2.0, vip: true }] },
      { wave: 3, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 135, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 150, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'dragon_wok_banquet', patience: 8000, baseReward: 168, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 185, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 32, two: 24 },
    service: { duration: 330, customerInterval: 2.5, maxCustomers: 54, customerPatience: 23 },
  },

  // ── 12-6: 드래곤 웍 — 최후의 결전 (보스) ──
  '12-6': {
    id: '12-6',
    nameKo: '드래곤 웍 \u2014 최후의 결전 (보스)',
    theme: 'dragon_lair',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 기존 10-6 S자형 경로
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'shadow_dragon_spawn', count: 22, interval: 900 },
        { type: 'wok_guardian', count: 16, interval: 1900 },
        { type: 'milk_phantom', count: 8, interval: 1400 },
      ]},
      { wave: 2, enemies: [
        { type: 'wok_phantom', count: 16, interval: 1700 },
        { type: 'shadow_dragon_spawn', count: 20, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 2200 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 3, enemies: [
        { type: 'shadow_dragon_spawn', count: 32, interval: 720 },
        { type: 'chili_demon', count: 20, interval: 680 },
        { type: 'sushi_ninja', count: 16, interval: 1000 },
        { type: 'wok_guardian', count: 14, interval: 1900 },
      ]},
      { wave: 4, enemies: [
        { type: 'wok_phantom', count: 18, interval: 1500 },
        { type: 'shadow_dragon_spawn', count: 26, interval: 820 },
        { type: 'mushroom_scout', count: 14, interval: 1050 },
        { type: 'rice_slime', count: 8, interval: 1800 },
        { type: 'cheese_golem', count: 10, interval: 1800 },
      ]},
      { wave: 5, enemies: [
        { type: 'dragon_wok', count: 1, interval: 0 },
        { type: 'shadow_dragon_spawn', count: 16, interval: 900 },
        { type: 'wok_phantom', count: 12, interval: 1700 },
        { type: 'wok_guardian', count: 12, interval: 1900 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'final_dragon_course', patience: 9000, baseReward: 105, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'dragon_wok_banquet', patience: 8000, baseReward: 120, tipMultiplier: 1.5, vip: true }] },
      { wave: 3, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 138, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 155, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'final_dragon_course', patience: 8000, baseReward: 175, tipMultiplier: 2.5, vip: true }] },
    ],
    starThresholds: { three: 26, two: 19 },
    service: { duration: 310, customerInterval: 2.4, maxCustomers: 50, customerPatience: 21 },
  },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 13장 별빛 비스트로 (Phase 27-3) ──
  // ══════════════════════════════════════════════════════════════

  // ── 13-1: 비스트로 외관 ──
  '13-1': {
    id: '13-1',
    nameKo: '비스트로 외관',
    theme: 'bistro_parisian',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 12-1과 동일 패턴 (L자)
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'wine_specter', count: 14, interval: 1300 },
        { type: 'foie_gras_knight', count: 8, interval: 2200 },
      ]},
      { wave: 2, enemies: [
        { type: 'wine_specter', count: 18, interval: 1150 },
        { type: 'foie_gras_knight', count: 10, interval: 2000 },
        { type: 'chili_demon', count: 18, interval: 700 },
      ]},
      { wave: 3, enemies: [
        { type: 'wine_specter', count: 22, interval: 1000 },
        { type: 'foie_gras_knight', count: 12, interval: 1800 },
        { type: 'flour_ghost', count: 14, interval: 1000 },
      ]},
      { wave: 4, enemies: [
        { type: 'wine_specter', count: 26, interval: 900 },
        { type: 'foie_gras_knight', count: 14, interval: 1700 },
        { type: 'fish_knight', count: 16, interval: 900 },
        { type: 'cheese_golem', count: 8, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'wine_specter', count: 30, interval: 800 },
        { type: 'foie_gras_knight', count: 16, interval: 1600 },
        { type: 'sake_specter', count: 14, interval: 1400 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'truffle_bisque', patience: 9000, baseReward: 85, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'foie_gras_toast', patience: 8500, baseReward: 95, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'truffle_risotto', patience: 8500, baseReward: 108, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'truffle_risotto', patience: 8000, baseReward: 122, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 25, two: 19 },
    service: { duration: 295, customerInterval: 2.7, maxCustomers: 47, customerPatience: 24 },
  },

  // ── 13-2: 비스트로 입구 홀 ──
  '13-2': {
    id: '13-2',
    nameKo: '비스트로 입구 홀',
    theme: 'bistro_parisian',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 12-2와 동일 패턴 (S자)
    pathSegments: [
      { type: 'vertical', col: 1, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 7, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 1, colEnd: 7 },
      { type: 'vertical', col: 1, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'wine_specter', count: 16, interval: 1200 },
        { type: 'foie_gras_knight', count: 10, interval: 2000 },
      ]},
      { wave: 2, enemies: [
        { type: 'wine_specter', count: 20, interval: 1050 },
        { type: 'foie_gras_knight', count: 12, interval: 1800 },
        { type: 'chili_demon', count: 20, interval: 680 },
      ]},
      { wave: 3, enemies: [
        { type: 'wine_specter', count: 24, interval: 950 },
        { type: 'foie_gras_knight', count: 14, interval: 1700 },
        { type: 'flour_ghost', count: 14, interval: 1000 },
        { type: 'rice_slime', count: 6, interval: 1900 },
      ]},
      { wave: 4, enemies: [
        { type: 'wine_specter', count: 28, interval: 860 },
        { type: 'foie_gras_knight', count: 16, interval: 1600 },
        { type: 'fish_knight', count: 18, interval: 880 },
        { type: 'cheese_golem', count: 8, interval: 2000 },
      ]},
      { wave: 5, enemies: [
        { type: 'wine_specter', count: 32, interval: 780 },
        { type: 'foie_gras_knight', count: 18, interval: 1500 },
        { type: 'sake_specter', count: 16, interval: 1300 },
        { type: 'mushroom_scout', count: 12, interval: 1000 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'truffle_bisque', patience: 9000, baseReward: 88, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'foie_gras_toast', patience: 8500, baseReward: 98, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'wine_truffle_plate', patience: 8000, baseReward: 112, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'truffle_risotto', patience: 8000, baseReward: 126, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 144, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 27, two: 20 },
    service: { duration: 305, customerInterval: 2.6, maxCustomers: 49, customerPatience: 24 },
  },

  // ── 13-3: 비스트로 주방 ──
  '13-3': {
    id: '13-3',
    nameKo: '비스트로 주방',
    theme: 'bistro_parisian',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 12-3과 동일 패턴 (W자)
    pathSegments: [
      { type: 'vertical', col: 2, rowStart: 0, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 6, rowStart: 4, rowEnd: 7 },
      { type: 'horizontal', row: 7, colStart: 2, colEnd: 6 },
      { type: 'vertical', col: 2, rowStart: 7, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'wine_specter', count: 18, interval: 1150 },
        { type: 'foie_gras_knight', count: 12, interval: 1900 },
      ]},
      { wave: 2, enemies: [
        { type: 'wine_specter', count: 22, interval: 1000 },
        { type: 'foie_gras_knight', count: 14, interval: 1700 },
        { type: 'chili_demon', count: 22, interval: 680 },
      ]},
      { wave: 3, enemies: [
        { type: 'wine_specter', count: 26, interval: 920 },
        { type: 'foie_gras_knight', count: 16, interval: 1600 },
        { type: 'flour_ghost', count: 14, interval: 1000 },
        { type: 'milk_phantom', count: 8, interval: 1500 },
      ]},
      { wave: 4, enemies: [
        { type: 'wine_specter', count: 30, interval: 840 },
        { type: 'foie_gras_knight', count: 18, interval: 1500 },
        { type: 'fish_knight', count: 18, interval: 880 },
        { type: 'cheese_golem', count: 9, interval: 1900 },
      ]},
      { wave: 5, enemies: [
        { type: 'wine_specter', count: 34, interval: 760 },
        { type: 'foie_gras_knight', count: 20, interval: 1400 },
        { type: 'sake_specter', count: 16, interval: 1300 },
        { type: 'tempura_monk', count: 12, interval: 1500 },
      ]},
      { wave: 6, enemies: [
        { type: 'wine_specter', count: 38, interval: 700 },
        { type: 'foie_gras_knight', count: 22, interval: 1350 },
        { type: 'cheese_golem', count: 12, interval: 1800 },
        { type: 'sake_specter', count: 18, interval: 1200 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'foie_gras_toast', patience: 9000, baseReward: 90, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'truffle_risotto', patience: 8500, baseReward: 102, tipMultiplier: 1.5 }] },
      { wave: 3, customers: [{ dish: 'wine_truffle_plate', patience: 8000, baseReward: 115, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 130, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 148, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 165, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 29, two: 22 },
    service: { duration: 315, customerInterval: 2.5, maxCustomers: 51, customerPatience: 23 },
  },

  // ── 13-4: 비스트로 와인 셀러 ──
  '13-4': {
    id: '13-4',
    nameKo: '비스트로 와인 셀러',
    theme: 'bistro_parisian',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 12-4와 동일 패턴 (U자)
    pathSegments: [
      { type: 'vertical', col: 0, rowStart: 0, rowEnd: 3 },
      { type: 'horizontal', row: 3, colStart: 0, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 3, rowEnd: 6 },
      { type: 'horizontal', row: 6, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 4, rowStart: 6, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'wine_specter', count: 20, interval: 1100 },
        { type: 'foie_gras_knight', count: 14, interval: 1800 },
      ]},
      { wave: 2, enemies: [
        { type: 'wine_specter', count: 24, interval: 960 },
        { type: 'foie_gras_knight', count: 16, interval: 1650 },
        { type: 'chili_demon', count: 24, interval: 660 },
        { type: 'cheese_golem', count: 8, interval: 2100 },
      ]},
      { wave: 3, enemies: [
        { type: 'wine_specter', count: 28, interval: 880 },
        { type: 'foie_gras_knight', count: 18, interval: 1550 },
        { type: 'flour_ghost', count: 14, interval: 1000 },
        { type: 'oni_minion', count: 14, interval: 1500 },
      ]},
      { wave: 4, enemies: [
        { type: 'wine_specter', count: 32, interval: 800 },
        { type: 'foie_gras_knight', count: 20, interval: 1500 },
        { type: 'fish_knight', count: 20, interval: 860 },
        { type: 'sake_specter', count: 16, interval: 1300 },
      ]},
      { wave: 5, enemies: [
        { type: 'wine_specter', count: 36, interval: 730 },
        { type: 'foie_gras_knight', count: 22, interval: 1400 },
        { type: 'tempura_monk', count: 16, interval: 1400 },
        { type: 'cheese_golem', count: 10, interval: 1800 },
        { type: 'milk_phantom', count: 10, interval: 1300 },
      ]},
      { wave: 6, enemies: [
        { type: 'wine_specter', count: 40, interval: 670 },
        { type: 'foie_gras_knight', count: 24, interval: 1300 },
        { type: 'sake_specter', count: 18, interval: 1200 },
        { type: 'cheese_golem', count: 12, interval: 1700 },
        { type: 'mushroom_scout', count: 14, interval: 950 },
        { type: 'butter_ghost', count: 14, interval: 900 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'wine_truffle_plate', patience: 9000, baseReward: 95, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'truffle_risotto', patience: 8000, baseReward: 108, tipMultiplier: 2.0, vip: true }] },
      { wave: 3, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 122, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 140, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'noir_tasting_course', patience: 8000, baseReward: 158, tipMultiplier: 2.0, vip: true }] },
      { wave: 6, customers: [{ dish: 'noir_tasting_course', patience: 8000, baseReward: 175, tipMultiplier: 2.0, vip: true }] },
    ],
    starThresholds: { three: 31, two: 23 },
    service: { duration: 325, customerInterval: 2.5, maxCustomers: 53, customerPatience: 23 },
  },

  // ── 13-5: 셰프 누아르의 주방 (보스 선등장) ──
  '13-5': {
    id: '13-5',
    nameKo: '셰프 누아르의 주방',
    theme: 'bistro_parisian',
    availableTowers: ['pan', 'delivery', 'salt', 'grill', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'],
    gridCols: 9, gridRows: 10,
    // 12-5와 동일 패턴 (역Z자)
    pathSegments: [
      { type: 'horizontal', row: 1, colStart: 0, colEnd: 4 },
      { type: 'vertical', col: 4, rowStart: 1, rowEnd: 4 },
      { type: 'horizontal', row: 4, colStart: 4, colEnd: 8 },
      { type: 'vertical', col: 8, rowStart: 4, rowEnd: 9 },
    ],
    waves: [
      { wave: 1, enemies: [
        { type: 'wine_specter', count: 20, interval: 1050 },
        { type: 'foie_gras_knight', count: 16, interval: 1900 },
        { type: 'milk_phantom', count: 8, interval: 1400 },
      ]},
      { wave: 2, enemies: [
        { type: 'wok_phantom', count: 14, interval: 1800 },
        { type: 'wine_specter', count: 18, interval: 1000 },
        { type: 'foie_gras_knight', count: 12, interval: 1900 },
        { type: 'flour_ghost', count: 12, interval: 1000 },
      ]},
      { wave: 3, enemies: [
        { type: 'wine_specter', count: 30, interval: 750 },
        { type: 'foie_gras_knight', count: 20, interval: 1600 },
        { type: 'chili_demon', count: 20, interval: 680 },
        { type: 'sake_specter', count: 14, interval: 1400 },
      ]},
      { wave: 4, enemies: [
        { type: 'wok_phantom', count: 16, interval: 1600 },
        { type: 'wine_specter', count: 26, interval: 820 },
        { type: 'foie_gras_knight', count: 18, interval: 1700 },
        { type: 'cheese_golem', count: 10, interval: 1800 },
        { type: 'rice_slime', count: 8, interval: 1800 },
      ]},
      { wave: 5, enemies: [
        { type: 'wine_specter', count: 40, interval: 650 },
        { type: 'foie_gras_knight', count: 30, interval: 1300 },
        { type: 'sake_specter', count: 20, interval: 1200 },
        { type: 'milk_phantom', count: 14, interval: 1200 },
        { type: 'wok_phantom', count: 12, interval: 1700 },
      ]},
    ],
    customers: [
      { wave: 1, customers: [{ dish: 'noir_tasting_course', patience: 9000, baseReward: 108, tipMultiplier: 1.5 }] },
      { wave: 2, customers: [{ dish: 'bistro_full_course', patience: 8000, baseReward: 118, tipMultiplier: 2.0, vip: true }] },
      { wave: 3, customers: [{ dish: 'noir_tasting_course', patience: 8000, baseReward: 135, tipMultiplier: 2.0, vip: true }] },
      { wave: 4, customers: [{ dish: 'noir_tasting_course', patience: 8000, baseReward: 150, tipMultiplier: 2.0, vip: true }] },
      { wave: 5, customers: [{ dish: 'noir_tasting_course', patience: 8000, baseReward: 170, tipMultiplier: 2.5, vip: true }] },
    ],
    starThresholds: { three: 27, two: 20 },
    service: { duration: 315, customerInterval: 2.4, maxCustomers: 51, customerPatience: 22 },
  },

  '13-6': { id: '13-6', nameKo: '미구현', theme: 'placeholder' },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 14장 (미구현) ──
  // ══════════════════════════════════════════════════════════════

  '14-1': { id: '14-1', nameKo: '미구현', theme: 'placeholder' },
  '14-2': { id: '14-2', nameKo: '미구현', theme: 'placeholder' },
  '14-3': { id: '14-3', nameKo: '미구현', theme: 'placeholder' },
  '14-4': { id: '14-4', nameKo: '미구현', theme: 'placeholder' },
  '14-5': { id: '14-5', nameKo: '미구현', theme: 'placeholder' },
  '14-6': { id: '14-6', nameKo: '미구현', theme: 'placeholder' },

  // ══════════════════════════════════════════════════════════════
  // ── 시즌 2: 15장 (미구현) ──
  // ══════════════════════════════════════════════════════════════

  '15-1': { id: '15-1', nameKo: '미구현', theme: 'placeholder' },
  '15-2': { id: '15-2', nameKo: '미구현', theme: 'placeholder' },
  '15-3': { id: '15-3', nameKo: '미구현', theme: 'placeholder' },
  '15-4': { id: '15-4', nameKo: '미구현', theme: 'placeholder' },
  '15-5': { id: '15-5', nameKo: '미구현', theme: 'placeholder' },
  '15-6': { id: '15-6', nameKo: '미구현', theme: 'placeholder' },

  // ── 그룹 3 placeholder (16~24장) ──
  '16-1': { id: '16-1', nameKo: '미구현', theme: 'placeholder' },
  '16-2': { id: '16-2', nameKo: '미구현', theme: 'placeholder' },
  '16-3': { id: '16-3', nameKo: '미구현', theme: 'placeholder' },
  '16-4': { id: '16-4', nameKo: '미구현', theme: 'placeholder' },
  '16-5': { id: '16-5', nameKo: '미구현', theme: 'placeholder' },
  '16-6': { id: '16-6', nameKo: '미구현', theme: 'placeholder' },
  '17-1': { id: '17-1', nameKo: '미구현', theme: 'placeholder' },
  '17-2': { id: '17-2', nameKo: '미구현', theme: 'placeholder' },
  '17-3': { id: '17-3', nameKo: '미구현', theme: 'placeholder' },
  '17-4': { id: '17-4', nameKo: '미구현', theme: 'placeholder' },
  '17-5': { id: '17-5', nameKo: '미구현', theme: 'placeholder' },
  '17-6': { id: '17-6', nameKo: '미구현', theme: 'placeholder' },
  '18-1': { id: '18-1', nameKo: '미구현', theme: 'placeholder' },
  '18-2': { id: '18-2', nameKo: '미구현', theme: 'placeholder' },
  '18-3': { id: '18-3', nameKo: '미구현', theme: 'placeholder' },
  '18-4': { id: '18-4', nameKo: '미구현', theme: 'placeholder' },
  '18-5': { id: '18-5', nameKo: '미구현', theme: 'placeholder' },
  '18-6': { id: '18-6', nameKo: '미구현', theme: 'placeholder' },
  '19-1': { id: '19-1', nameKo: '미구현', theme: 'placeholder' },
  '19-2': { id: '19-2', nameKo: '미구현', theme: 'placeholder' },
  '19-3': { id: '19-3', nameKo: '미구현', theme: 'placeholder' },
  '19-4': { id: '19-4', nameKo: '미구현', theme: 'placeholder' },
  '19-5': { id: '19-5', nameKo: '미구현', theme: 'placeholder' },
  '19-6': { id: '19-6', nameKo: '미구현', theme: 'placeholder' },
  '20-1': { id: '20-1', nameKo: '미구현', theme: 'placeholder' },
  '20-2': { id: '20-2', nameKo: '미구현', theme: 'placeholder' },
  '20-3': { id: '20-3', nameKo: '미구현', theme: 'placeholder' },
  '20-4': { id: '20-4', nameKo: '미구현', theme: 'placeholder' },
  '20-5': { id: '20-5', nameKo: '미구현', theme: 'placeholder' },
  '20-6': { id: '20-6', nameKo: '미구현', theme: 'placeholder' },
  '21-1': { id: '21-1', nameKo: '미구현', theme: 'placeholder' },
  '21-2': { id: '21-2', nameKo: '미구현', theme: 'placeholder' },
  '21-3': { id: '21-3', nameKo: '미구현', theme: 'placeholder' },
  '21-4': { id: '21-4', nameKo: '미구현', theme: 'placeholder' },
  '21-5': { id: '21-5', nameKo: '미구현', theme: 'placeholder' },
  '21-6': { id: '21-6', nameKo: '미구현', theme: 'placeholder' },
  '22-1': { id: '22-1', nameKo: '미구현', theme: 'placeholder' },
  '22-2': { id: '22-2', nameKo: '미구현', theme: 'placeholder' },
  '22-3': { id: '22-3', nameKo: '미구현', theme: 'placeholder' },
  '22-4': { id: '22-4', nameKo: '미구현', theme: 'placeholder' },
  '22-5': { id: '22-5', nameKo: '미구현', theme: 'placeholder' },
  '22-6': { id: '22-6', nameKo: '미구현', theme: 'placeholder' },
  '23-1': { id: '23-1', nameKo: '미구현', theme: 'placeholder' },
  '23-2': { id: '23-2', nameKo: '미구현', theme: 'placeholder' },
  '23-3': { id: '23-3', nameKo: '미구현', theme: 'placeholder' },
  '23-4': { id: '23-4', nameKo: '미구현', theme: 'placeholder' },
  '23-5': { id: '23-5', nameKo: '미구현', theme: 'placeholder' },
  '23-6': { id: '23-6', nameKo: '미구현', theme: 'placeholder' },
  '24-1': { id: '24-1', nameKo: '미구현', theme: 'placeholder' },
  '24-2': { id: '24-2', nameKo: '미구현', theme: 'placeholder' },
  '24-3': { id: '24-3', nameKo: '미구현', theme: 'placeholder' },
  '24-4': { id: '24-4', nameKo: '미구현', theme: 'placeholder' },
  '24-5': { id: '24-5', nameKo: '미구현', theme: 'placeholder' },
  '24-6': { id: '24-6', nameKo: '미구현', theme: 'placeholder' },
};

/** 스테이지 순서 (그룹1 30슬롯 + 그룹2 60슬롯 + 그룹3 54슬롯 = 144슬롯) */
export const STAGE_ORDER = [
  '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
  '2-1', '2-2', '2-3',
  '3-1', '3-2', '3-3', '3-4', '3-5', '3-6',
  '4-1', '4-2', '4-3', '4-4', '4-5', '4-6',
  '5-1', '5-2', '5-3', '5-4', '5-5', '5-6',
  '6-1', '6-2', '6-3',
  // ── 그룹 2 (7~15장) ──
  '7-1', '7-2', '7-3', '7-4', '7-5', '7-6',
  '8-1', '8-2', '8-3', '8-4', '8-5', '8-6',
  '9-1', '9-2', '9-3', '9-4', '9-5', '9-6',
  '10-1', '10-2', '10-3', '10-4', '10-5', '10-6',
  '11-1', '11-2', '11-3', '11-4', '11-5', '11-6',
  '12-1', '12-2', '12-3', '12-4', '12-5', '12-6',
  '13-1', '13-2', '13-3', '13-4', '13-5', '13-6',
  '14-1', '14-2', '14-3', '14-4', '14-5', '14-6',
  '15-1', '15-2', '15-3', '15-4', '15-5', '15-6',
  // ── 그룹 3 (16~24장) ──
  '16-1', '16-2', '16-3', '16-4', '16-5', '16-6',
  '17-1', '17-2', '17-3', '17-4', '17-5', '17-6',
  '18-1', '18-2', '18-3', '18-4', '18-5', '18-6',
  '19-1', '19-2', '19-3', '19-4', '19-5', '19-6',
  '20-1', '20-2', '20-3', '20-4', '20-5', '20-6',
  '21-1', '21-2', '21-3', '21-4', '21-5', '21-6',
  '22-1', '22-2', '22-3', '22-4', '22-5', '22-6',
  '23-1', '23-2', '23-3', '23-4', '23-5', '23-6',
  '24-1', '24-2', '24-3', '24-4', '24-5', '24-6',
];
