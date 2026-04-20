/**
 * @fileoverview 셰프 캐릭터 데이터 정의.
 * Phase 6: 3종 셰프, 패시브 + 액티브 스킬.
 * Phase 8-6: 영업 액티브 스킬 (serviceSkill) 추가.
 * Phase 19-1: 시즌 2 셰프 2종 (유키, 라오) 데이터 추가.
 * Phase 56: 익명 셰프 → Named 동료 교체 (petit→mimi, flame→rin, ice→mage),
 *           앙드레/아르준 신규 추가, 7종 CHEF_ORDER 갱신.
 */

export const CHEF_TYPES = {
  // ── Group 1: 항상 해금 ──
  mimi_chef: {
    id: 'mimi_chef',
    nameKo: '미미',
    icon: '👧',
    color: 0x44cc44,
    passiveDesc: '재료 수거 범위 +30%, 조리시간 −15%',
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
  rin_chef: {
    id: 'rin_chef',
    nameKo: '린',
    icon: '🔥',
    color: 0xff4444,
    passiveDesc: '화염 타워 피해 +20%, 그릴 요리 수익 +25%',
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
  mage_chef: {
    id: 'mage_chef',
    nameKo: '메이지',
    icon: '🧁',
    color: 0xcc88ff,
    passiveDesc: 'CC(둔화/빙결) 지속 +25%, 디저트 요리 수익 +20%',
    passiveType: 'cc_duration',
    passiveValue: 0.25,
    dessertRewardBonus: 0.20,
    skillName: '마법진 설탕',
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
  // ── Phase 19-1: 시즌 2 셰프 ──
  yuki_chef: {
    id: 'yuki_chef',
    nameKo: '유키',
    icon: '❄️',
    color: 0x87ceeb,
    unlockHint: '7장 클리어 시 해금',
    passiveDesc: '조리시간 -20%, ★★★+ 레시피 보상 +15%',
    passiveType: 'cook_time',
    passiveValue: 0.20,
    skillName: '빙결 처치',
    skillDesc: '빙결된 적 전부 즉시 처치',
    skillType: 'cryo_execute',
    skillCooldown: 90000,
    serviceSkill: {
      name: '정밀 절단',
      desc: '다음 5개 요리 조리시간 0',
      type: 'precision_cut',
      count: 5,
      cooldown: 90000,
    },
  },
  lao_chef: {
    id: 'lao_chef',
    nameKo: '라오',
    icon: '🐉',
    color: 0xff4500,
    unlockHint: '10장 클리어 시 해금',
    passiveDesc: '도구 공격력 +15%, 재료 드롭률 +10%',
    passiveType: 'tower_damage',
    passiveValue: 0.15,
    skillName: '파워 서지',
    skillDesc: '전 도구 5초간 공격력 2배',
    skillType: 'power_surge',
    skillValue: { multiplier: 2.0, duration: 5000 },
    skillCooldown: 120000,
    serviceSkill: {
      name: '불꽃 웍',
      desc: '전 테이블 주문 즉시 완성',
      type: 'flame_wok',
      cooldown: 120000,
    },
  },
  // ── Phase 56: 신규 셰프 ──
  andre_chef: {
    id: 'andre_chef',
    nameKo: '앙드레',
    icon: '🥐',
    color: 0xf5d76e,
    unlockHint: '13장 클리어 시 해금',
    passiveDesc: '양식 요리 수익 +25%, 손님 팁 +15%',
    passiveType: 'western_reward',
    passiveValue: 0.25,
    tipBonus: 0.15,
    skillName: '오마카세 코스',
    skillDesc: '현재 손님 전체 만족도 20 즉시 추가 + 인내심 리셋',
    skillType: 'omakase',
    skillValue: { satisfactionBonus: 20 },
    skillCooldown: 120000,
    serviceSkill: {
      name: '플랑베',
      desc: '다음 5개 요리 수익 2배',
      type: 'flambe',
      value: { count: 5, multiplier: 2.0 },
      cooldown: 100000,
    },
  },
  arjun_chef: {
    id: 'arjun_chef',
    nameKo: '아르준',
    icon: '🪬',
    color: 0xff8800,
    unlockHint: '17장 클리어 시 해금',
    passiveDesc: '향신료 타워 공격 속도 +20%, 재료 드롭률 +15%',
    passiveType: 'spice_attack_speed',
    passiveValue: 0.20,
    dropRateBonus: 0.15,
    skillName: '마살라 폭풍',
    skillDesc: '전체 적 독 데미지 10초 (DPS 20) + 이동속도 -30%',
    skillType: 'masala_storm',
    skillValue: { dps: 20, duration: 10000, slowRate: 0.30 },
    skillCooldown: 150000,
    serviceSkill: {
      name: '비밀 향신료',
      desc: '다음 3명 손님 주문 랜덤 요리로 교체 (수익 +50%)',
      type: 'secret_spice',
      value: { count: 3, rewardMultiplier: 1.5 },
      cooldown: 120000,
    },
  },
};

export const CHEF_ORDER = ['mimi_chef', 'rin_chef', 'mage_chef', 'yuki_chef', 'lao_chef', 'andre_chef', 'arjun_chef'];
