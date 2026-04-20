/**
 * @fileoverview 영구 업그레이드 정의.
 * Phase 5: 4종 업그레이드, 레벨별 비용/효과값.
 */

/**
 * 영구 업그레이드 정의.
 * @type {Object<string, { id: string, nameKo: string, desc: string, maxLevel: number, costs: number[], effectPerLevel: number }>}
 */
export const UPGRADE_DEFS = {
  fridge: {
    id: 'fridge',
    nameKo: '냉장고 확장',
    desc: '재료 최대 보유량 +20',
    maxLevel: 5,
    costs: [80, 160, 280, 420, 600],
    effectPerLevel: 20,         // +20 보유량/레벨 (기본 50, 최대 150)
  },
  knife: {
    id: 'knife',
    nameKo: '예리한 칼',
    desc: '모든 타워 공격속도 +5%',
    maxLevel: 5,
    costs: [20, 40, 65, 100, 150],
    effectPerLevel: 0.05,       // +5% 공격속도/레벨
  },
  delivery_speed: {
    id: 'delivery_speed',
    nameKo: '빠른 배달',
    desc: '재료 수거 속도 +20%',
    maxLevel: 3,
    costs: [25, 50, 100],
    effectPerLevel: 0.20,       // +20% 수거속도/레벨
  },
  cook_training: {
    id: 'cook_training',
    nameKo: '조리 특훈',
    desc: '조리 시간 -10%',
    maxLevel: 3,
    costs: [30, 60, 120],
    effectPerLevel: 0.10,       // -10% 조리시간/레벨
  },
};

/** 업그레이드 ID 목록 */
export const UPGRADE_IDS = Object.keys(UPGRADE_DEFS);
