/**
 * @fileoverview 셰프 캐릭터 데이터 정의.
 * Phase 6: 3종 셰프, 패시브 + 액티브 스킬.
 * Phase 8-6: 영업 액티브 스킬 (serviceSkill) 추가.
 */

export const CHEF_TYPES = {
  petit_chef: {
    id: 'petit_chef',
    nameKo: '꼬마 셰프',
    icon: '👨‍🍳',
    color: 0x44cc44,
    passiveDesc: '재료 수거 범위 +30%',
    passiveType: 'collect_range',
    passiveValue: 0.30,
    skillName: '긴급 배달',
    skillDesc: '맵 위 모든 드롭 재료 즉시 수거',
    skillType: 'instant_collect',
    skillCooldown: 60000,  // 60초
    /** 영업 액티브 스킬 — 다음 3명 손님 인내심 최대치 리셋 */
    serviceSkill: {
      name: '특급 서비스',
      desc: '다음 3명 손님 인내심 최대치 리셋',
      type: 'patience_reset',
      value: 3,
      cooldown: 90000,  // 90초
    },
  },
  flame_chef: {
    id: 'flame_chef',
    nameKo: '불꽃 요리사',
    icon: '🔥',
    color: 0xff4444,
    passiveDesc: '화염 타워 피해 +20%',
    passiveType: 'grill_damage',
    passiveValue: 0.20,
    skillName: '지옥 불꽃',
    skillDesc: '전체 적에게 화상 5초 (DPS 15)',
    skillType: 'global_burn',
    skillValue: { dps: 15, duration: 5000 },
    skillCooldown: 90000,  // 90초
    /** 영업 액티브 스킬 — 현재 조리 중인 모든 요리 즉시 완성 */
    serviceSkill: {
      name: '화염 조리',
      desc: '현재 조리 중인 모든 요리 즉시 완성',
      type: 'instant_cook',
      cooldown: 120000,  // 120초
    },
  },
  ice_chef: {
    id: 'ice_chef',
    nameKo: '얼음 요리장',
    icon: '❄️',
    color: 0x44aaff,
    passiveDesc: 'CC(둔화/빙결) 지속 +25%',
    passiveType: 'cc_duration',
    passiveValue: 0.25,
    skillName: '블리자드 코스',
    skillDesc: '전체 적 3초 빙결',
    skillType: 'global_freeze',
    skillValue: { duration: 3000 },
    skillCooldown: 120000,  // 120초
    /** 영업 액티브 스킬 — 전체 손님 인내심 10초간 정지 */
    serviceSkill: {
      name: '시간 동결',
      desc: '전체 손님 인내심 10초간 정지',
      type: 'freeze_patience',
      value: 10000,  // 10초 (ms)
      cooldown: 150000,  // 150초
    },
  },
};

export const CHEF_ORDER = ['petit_chef', 'flame_chef', 'ice_chef'];
