/**
 * @fileoverview Kitchen Chaos Tycoon 게임 데이터 정의.
 * Phase 10: 적 22종(일반 16 + 보스 6), 타워 6종, 재료 15종, 레시피 12종, 30 스테이지.
 * Phase 20: 적 25종(일반 18 + 보스 7), 재료 17종, 서빙 레시피 14종, 버프 레시피 8종.
 * Phase 21: 적 29종(일반 21 + 보스 8), 재료 19종, 서빙 레시피 22종, 버프 레시피 10종.
 * Phase 22-1: oni_herald 미니보스 추가 (HP 800, 전령 소환 + 분노 기믹).
 * Phase 22-3: sake_specter(마취), oni_minion(돌진) 등록. sake 재료 추가 (누적 20종).
 * Phase 25-1: 적 2종(shadow_dragon_spawn, wok_guardian), 재료 1종(star_anise) 추가. 누적 적 25종.
 * Phase 26-1: sake_master(일식 양조 보스) 추가. 누적 보스 9종.
 * Phase 27-3: 적 2종(wine_specter, foie_gras_knight), 재료 1종(truffle) 추가. 누적 적 29종, 재료 22종.
 * Phase 31-2: 적 2종(curry_djinn, naan_golem), 재료 2종(curry_leaf, saffron) 추가. 누적 적 31종, 재료 25종.
 * Phase 32-2: 적 2종(incense_specter, spice_elemental), 재료 1종(chai) 추가. 누적 적 33종, 재료 26종.
 * Phase 32-5: 적 1종(masala_guide), 보스 1종(maharaja), 재료 1종(cardamom) 추가. 누적 적 35종, 재료 27종.
 */

// ── 적 타입 정의 ──
export const ENEMY_TYPES = {
  carrot_goblin: {
    id: 'carrot_goblin',
    nameKo: '당근 고블린',
    hp: 55,
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
  flour_ghost: {
    id: 'flour_ghost',
    nameKo: '밀가루 유령',
    hp: 60,
    speed: 75,
    ingredient: 'flour',
    bodyColor: 0xfaebd7,
    invisible: true,      // 기본 반투명, 소금/냉동고만 타겟 가능
  },
  // ── Phase 5 신규 적 ──
  egg_sprite: {
    id: 'egg_sprite',
    nameKo: '달걀 요정',
    hp: 70,
    speed: 95,
    ingredient: 'egg',
    bodyColor: 0xfff8dc,
    splitChance: 0.10,      // 피격 시 10% 확률 분열
    splitHp: 30,
  },
  rice_slime: {
    id: 'rice_slime',
    nameKo: '밥 슬라임',
    hp: 120,
    speed: 55,
    ingredient: 'rice',
    bodyColor: 0xf5f5f5,
    healOnDeath: 0.20,     // 사망 시 주변 적 HP 20% 회복
    healRadius: 80,
  },
  pasta_boss: {
    id: 'pasta_boss',
    nameKo: '거대 파스타',
    hp: 2000,
    speed: 25,
    ingredient: null,       // 보스는 재료 드롭 없음
    bodyColor: 0xffd700,
    isBoss: true,
    summonInterval: 2000,   // 2초마다 carrot_goblin 소환
    summonType: 'carrot_goblin',
    enrageHpThreshold: 0.5, // HP 50% 이하 시 속도 2배
    bossReward: 100,        // 처치 시 +100 골드 (MarketScene/EndlessScene 하위 호환)
    bossDrops: [{ ingredient: 'flour', count: 3 }, { ingredient: 'egg', count: 2 }],  // Phase 13-3: 재료 드롭
  },
  // ── Phase 6 신규 적 ──
  fish_knight: {
    id: 'fish_knight',
    nameKo: '생선 기사',
    hp: 180,
    speed: 50,
    ingredient: 'fish',
    bodyColor: 0x4488cc,
    shieldFront: 0.5,  // 전면 피해 50% 감소
  },
  mushroom_scout: {
    id: 'mushroom_scout',
    nameKo: '버섯 정찰병',
    hp: 60,
    speed: 120,
    ingredient: 'mushroom',
    bodyColor: 0x8b6914,
    sporeDebuff: { speedReduction: 0.20, duration: 5000 }, // 사망 시 주변 타워 공격속도 -20%, 5초
  },
  cheese_rat: {
    id: 'cheese_rat',
    nameKo: '치즈 쥐',
    hp: 90,
    speed: 100,
    ingredient: 'cheese',
    bodyColor: 0xffcc33,
    swarmSpeedBonus: 0.30,  // 근처 같은 타입 3마리 이상이면 속도 +30%
    swarmRadius: 80,
  },
  dragon_ramen: {
    id: 'dragon_ramen',
    nameKo: '용 라멘',
    hp: 3000,
    speed: 20,
    ingredient: null,
    bodyColor: 0xff4444,
    isBoss: true,
    summonInterval: 3000,
    summonType: 'cheese_rat',
    enrageHpThreshold: 0.4,
    bossReward: 150,
    bossDrops: [{ ingredient: 'fish', count: 3 }, { ingredient: 'rice', count: 3 }],  // Phase 13-3
    bossDebuff: { speedReduction: 0.30, duration: 15000 },  // HP 40% 이하 시 전체 타워 공격속도 -30%, 15초, 1회
  },
  // ── Phase 8 신규 적 ──
  shrimp_samurai: {
    id: 'shrimp_samurai',
    nameKo: '새우 사무라이',
    hp: 160,
    speed: 70,
    ingredient: 'shrimp',
    bodyColor: 0xff6347,
    dodgeChance: 0.20,  // 20% 확률 공격 회피
  },
  tomato_bomber: {
    id: 'tomato_bomber',
    nameKo: '토마토 폭격수',
    hp: 100,
    speed: 55,
    ingredient: 'tomato',
    bodyColor: 0xff4433,
    deathDebuff: { speedReduction: 0.30, duration: 3000, radius: 80 },  // 사망 시 주변 타워 디버프
  },
  butter_ghost: {
    id: 'butter_ghost',
    nameKo: '버터 유령',
    hp: 80,
    speed: 85,
    ingredient: 'butter',
    bodyColor: 0xffd700,
    slideChance: 0.30,  // 피격 시 30% 확률 1칸 앞으로 순간이동
  },
  // Phase 8 보스
  seafood_kraken: {
    id: 'seafood_kraken',
    nameKo: '해물탕 크라켄',
    hp: 4000,
    speed: 18,
    ingredient: null,
    bodyColor: 0x8b008b,
    isBoss: true,
    summonInterval: 3000,
    summonType: 'shrimp_samurai',
    enrageHpThreshold: 0.3,
    bossReward: 200,
    bossDrops: [{ ingredient: 'shrimp', count: 4 }, { ingredient: 'squid', count: 3 }],  // Phase 13-3
    inkDebuff: { rangeReduction: 0.50, duration: 3000 },  // HP 30% 이하 시 전체 타워 사거리 -50%, 3초, 1회
  },
  // ── Phase 9 신규 적 ──
  sugar_fairy: {
    id: 'sugar_fairy',
    nameKo: '설탕 요정',
    hp: 60,
    speed: 95,
    ingredient: 'sugar',
    bodyColor: 0xff88cc,
    special: 'deathDebuff',           // 처치 시 주변 1칸 타워 공격속도 -30% (3초)
    deathDebuffRadius: 1,
    deathDebuffEffect: 'attackSpeed',
    deathDebuffValue: -0.30,
    deathDebuffDuration: 3000,
  },
  milk_phantom: {
    id: 'milk_phantom',
    nameKo: '우유 팬텀',
    hp: 200,
    speed: 40,
    ingredient: 'milk',
    bodyColor: 0xffffff,
    special: 'coagulate',             // 피격 5회마다 2초 정지 + HP 10% 회복
    coagulateHitCount: 5,
    coagulatePauseDuration: 2000,
    coagulateHealPercent: 0.10,
  },
  // Phase 9 보스
  lava_dessert_golem: {
    id: 'lava_dessert_golem',
    nameKo: '용암 디저트 골렘',
    hp: 5000,
    speed: 15,
    ingredient: null,
    bodyColor: 0xff4400,
    isBoss: true,
    special: 'lavaCoating',           // 피격 시 공격자 타워 화상 반사 (공격력 -10%, 3초)
    summonType: ['sugar_fairy', 'sugar_fairy', 'milk_phantom'],  // HP 50% 이하 시 소환
    summonThreshold: 0.5,
    magmaBlastThreshold: 0.2,         // HP 20% 이하 시 전체 타워 3초 비활성화
    magmaBlastDuration: 3000,
    bossReward: 250,
    bossDrops: [{ ingredient: 'sugar', count: 4 }, { ingredient: 'butter', count: 3 }],  // Phase 13-3
  },
  // ── Phase 10 보스 ──
  master_patissier: {
    id: 'master_patissier',
    nameKo: '마스터 파티시에',
    hp: 6000,
    speed: 12,
    ingredient: null,
    bodyColor: 0xcc88ff,
    isBoss: true,
    special: 'cakeDisable',            // 매 6초마다 랜덤 타워 1개 케이크화 (4초 공격불가)
    cakeDisableInterval: 6000,
    cakeDisableDuration: 4000,
    shieldThreshold: 0.6,              // HP 60% 이하 시 1000 HP 보호막
    shieldHp: 1000,
    summonType: ['sugar_fairy', 'sugar_fairy', 'sugar_fairy', 'milk_phantom', 'milk_phantom'],
    summonThreshold: 0.4,              // HP 40% 이하 시 소환 (1회)
    magicBlastThreshold: 0.2,          // HP 20% 이하 시 전체 투사체 4초 무효화 + sugar_fairy x2 추가소환
    magicBlastDuration: 4000,
    bossReward: 300,
    bossDrops: [{ ingredient: 'milk', count: 5 }, { ingredient: 'sugar', count: 4 }],  // Phase 13-3
  },
  cuisine_god: {
    id: 'cuisine_god',
    nameKo: '요리의 신',
    hp: 8000,
    speed: 10,
    ingredient: null,
    bodyColor: 0xffd700,
    isBoss: true,
    special: 'threePhase',
    // Phase 1 (100~60%): 매 8초 이전 보스 능력 랜덤 복제 + 일반 적 2마리 소환
    phase1SummonInterval: 8000,
    // Phase 2 (60~30%): 5초마다 랜덤 적 3마리 소환, 전체 타워 사거리 -30%, 자가 회복 20HP/초
    phase2SummonInterval: 5000,
    phase2RangeReduction: 0.30,
    phase2RegenRate: 20,
    // Phase 3 (30~0%): 전체 타워 공격속도 -40%, 자가 회복 50HP/초, 4초마다 랜덤 적 5마리, 10초마다 500HP 보호막
    phase3AttackSpeedReduction: 0.40,
    phase3RegenRate: 50,
    phase3SummonInterval: 4000,
    phase3ShieldInterval: 10000,
    phase3ShieldHp: 500,
    bossReward: 500,
    bossDrops: [{ ingredient: 'meat', count: 5 }, { ingredient: 'cheese', count: 5 }, { ingredient: 'butter', count: 4 }],  // Phase 13-3
  },
  // ── Phase 20 신규 적 ──
  sushi_ninja: {
    id: 'sushi_ninja',
    nameKo: '초밥 닌자',
    hp: 250,
    speed: 80,
    ingredient: 'sashimi_tuna',
    bodyColor: 0x2f2f4f,
    // 은신 메카닉: stealthInterval마다 투명 전환, stealthDuration 동안 도구 타겟팅 불가
    // 재출현 시 인접 도구(backAttackRadius 이내)에 공격속도 디버프 적용
    stealth: true,
    stealthInterval: 4000,     // 4초마다 은신 시작
    stealthDuration: 2500,     // 2.5초 동안 투명 (알파 0.1, 타겟 불가)
    backAttackRadius: 60,      // 재출현 시 60px 이내 도구에 백어택
    backAttackDamage: 30,      // 백어택 디버프 강도 (공격속도 -30%, 2초)
  },
  tempura_monk: {
    id: 'tempura_monk',
    nameKo: '튀김 수도승',
    hp: 300,
    speed: 45,
    ingredient: 'wasabi',
    bodyColor: 0xf4a460,
    // 배리어 메카닉: HP barrierThreshold 이하로 떨어지면 배리어 활성
    // 배리어 활성 중 피해 완전 무효, barrierDuration 후 해제
    barrier: true,
    barrierThreshold: 0.5,     // HP 50% 이하 시 배리어 활성
    barrierDuration: 3000,     // 3초 후 배리어 자동 해제
    barrierCooldown: 10000,    // 해제 후 10초간 재발동 불가
  },
  // ── Phase 22-1 미니보스 ──
  oni_herald: {
    id: 'oni_herald',
    nameKo: '오니 전령',
    hp: 800,
    speed: 30,
    ingredient: null,
    bodyColor: 0xcc44aa,
    isMidBoss: true,
    // 전령 소환 패턴: heraldSummonInterval마다 shrimp_samurai 2마리 소환
    heraldSummon: true,
    heraldSummonInterval: 6000,   // 6초마다 소환
    heraldSummonType: 'shrimp_samurai',
    heraldSummonCount: 2,
    // 분노: HP enrageHpThreshold 이하 시 속도 1.5배
    enrageHpThreshold: 0.4,       // HP 40% 이하
    enrageSpeedMultiplier: 1.5,
    bossReward: 120,
    bossDrops: [
      { ingredient: 'wasabi', count: 2 },
      { ingredient: 'sashimi_tuna', count: 2 },
    ],
  },
  // Phase 20 보스
  sake_oni: {
    id: 'sake_oni',
    nameKo: '사케 오니',
    hp: 6000,
    speed: 25,
    ingredient: null,
    bodyColor: 0xff4488,
    isBoss: true,
    // 취권(드렁크 워크) 패턴:
    // drunkInterval마다 현재 진행 방향에서 랜덤 각도로 일시 이탈
    // drunkDuration 동안 랜덤 방향으로 이동한 후 경로 재복귀
    drunkWalk: true,
    drunkInterval: 5000,       // 5초마다 취권 발동
    drunkDuration: 2000,       // 2초간 경로 이탈 (랜덤 방향 이동)
    drunkAngle: 90,            // +-90도 범위 랜덤 방향
    drunkSpeed: 60,            // 취권 중 이동 속도
    // 아군 버프: auraRadius 이내 적에게 속도 +auraSpeedBonus, HP auraHealRate/초 회복
    aura: true,
    auraRadius: 180,           // 180px 이내 적에게 버프 적용
    auraSpeedBonus: 0.20,      // 속도 +20%
    auraHealRate: 5,           // 5 HP/초 회복
    auraInterval: 1000,        // 1초 단위로 버프 갱신
    // 분노 패턴: HP enrageHpThreshold 이하 -> drunkInterval 절반으로 단축
    enrageHpThreshold: 0.3,    // HP 30% 이하
    bossReward: 350,
    bossDrops: [
      { ingredient: 'sashimi_tuna', count: 4 },
      { ingredient: 'wasabi', count: 3 },
    ],
  },
  // ── Phase 21 신규 적 ──
  dumpling_warrior: {
    id: 'dumpling_warrior',
    nameKo: '만두 전사',
    hp: 280,
    speed: 50,
    ingredient: 'tofu',
    bodyColor: 0xf5cba7,
    // 분열 기믹: 처치 시 splitCount만큼 splitType 적 스폰
    split: true,
    splitCount: 2,
    splitType: 'mini_dumpling',
  },
  mini_dumpling: {
    id: 'mini_dumpling',
    nameKo: '미니 만두',
    hp: 60,
    speed: 65,
    ingredient: 'tofu',
    bodyColor: 0xf5cba7,
    split: false,   // 무한 분열 방지 필수
  },
  wok_phantom: {
    id: 'wok_phantom',
    nameKo: '웍 유령',
    hp: 320,
    speed: 40,
    ingredient: 'cilantro',
    bodyColor: 0x1a1a2e,
    // 화염 장판 기믹: fireZoneInterval마다 현재 위치에 화염 장판 생성
    fireZone: true,
    fireZoneInterval: 4000,       // 4초마다 화염 장판 생성
    fireZoneRadius: 55,           // 장판 반경
    fireZoneDuration: 3500,       // 장판 지속 시간
    fireZoneDebuffDuration: 2500, // 도구 디버프 지속 시간
  },
  // Phase 21 보스
  dragon_wok: {
    id: 'dragon_wok',
    nameKo: '드래곤 웍',
    hp: 7000,
    speed: 22,
    ingredient: null,
    bodyColor: 0xc0392b,
    isBoss: true,
    // 화염 브레스 + 3페이즈 기믹
    fireBreath: true,
    fireBreathPhases: [
      { hpThreshold: 1.0, interval: 5000, angle: 60, radius: 90 },
      { hpThreshold: 0.70, interval: 3500, angle: 60, radius: 90, speedBonus: 0.15, summonMini: 3 },
      { hpThreshold: 0.35, interval: 2500, angle: 90, radius: 90, instantFireZones: 2 },
    ],
    enrageHpThreshold: 0.35,
    bossReward: 400,
    bossDrops: [
      { ingredient: 'tofu', count: 4 },
      { ingredient: 'cilantro', count: 4 },
    ],
  },
  // ── Phase 22-3 신규 적 (이자카야 심층부) ──
  sake_specter: {
    id: 'sake_specter',
    nameKo: '사케 유령',
    hp: 300,
    speed: 65,
    ingredient: 'sake',
    bodyColor: 0x9966cc,
    // 마취 디버프: narcotizeInterval마다 범위 내 도구에 공격속도 디버프 적용
    // narcotizeRadius 이내 도구에 narcotizeEffect(공격속도 -20%), narcotizeDuration(3초) 부여
    narcotize: true,
    narcotizeInterval: 5000,    // 5초마다 마취 발동
    narcotizeRadius: 70,        // 70px 범위
    narcotizeEffect: { speedReduction: 0.20, duration: 3000 },
  },
  oni_minion: {
    id: 'oni_minion',
    nameKo: '오니 부하',
    hp: 350,
    speed: 55,
    ingredient: 'sake',
    bodyColor: 0xcc3333,
    // 돌진 메커닉: HP chargeHpThreshold 이하 시 속도 chargeSpeedMultiplier 배로 급증
    // chargeDuration 동안 고속 이동 후 원래 속도 복귀. chargeInterval 쿨다운.
    charge: true,
    chargeHpThreshold: 0.6,      // HP 60% 이하 시 돌진
    chargeSpeedMultiplier: 2.5,  // 돌진 중 속도 2.5배 (55 * 2.5 = 137.5)
    chargeDuration: 2000,        // 2초간 돌진
    chargeInterval: 8000,        // 8초 쿨다운 (재돌진 대기)
  },
  // ── Phase 25-1 신규 적 (11장 용의 주방 심층부) ──
  shadow_dragon_spawn: {
    id: 'shadow_dragon_spawn',
    nameKo: '그림자 용 새끼',
    hp: 380,
    speed: 60,
    ingredient: 'star_anise',
    bodyColor: 0x2a0a3a,
    // 어둠 디버프: darkInterval마다 범위 내 도구에 공격력 감소 디버프 적용
    // darkRadius 이내 도구에 darkEffect(공격력 -20%), darkDuration(5초) 부여
    darkDebuff: true,
    darkInterval: 5000,    // 5초마다 어둠 발동
    darkRadius: 80,        // 80px 범위
    darkEffect: { damageReduction: 0.20, duration: 5000 },
  },
  wok_guardian: {
    id: 'wok_guardian',
    nameKo: '웍 수호자',
    hp: 450,
    speed: 40,
    ingredient: 'star_anise',
    bodyColor: 0x8b4513,
    // 전방 방어 특화: 이동 방향(전면) 피해 70% 감소, 측면/후면은 정상 피해
    // fish_knight의 shieldFront(50%)보다 강화된 버전 (70%)
    // Enemy.js takeDamage()에서 shieldFrontHeavy 플래그로 분기 처리
    shieldFrontHeavy: 0.70,
  },
  // ── Phase 26-1 신규 보스 (10장 이자카야 최심층) ──
  sake_master: {
    id: 'sake_master',
    nameKo: '사케 주조 달인',
    hp: 7500,
    speed: 18,
    ingredient: null,
    bodyColor: 0x8844bb,
    isBoss: true,
    // ── 양조 주기 기믹 ──
    // brewInterval마다 범위 내 도구에 발효 디버프 적용 (공격력 -25%, 4초)
    // 동시에 자신 주변 sake_specter / oni_minion 적에게 HP 회복 부여
    brewCycle: true,
    brewInterval: 6000,          // 6초마다 양조 발동
    brewDebuffRadius: 90,        // 90px 이내 도구에 발효 디버프
    brewDebuffEffect: { damageReduction: 0.25, duration: 4000 },
    brewHealRadius: 150,         // 150px 이내 아군 적 HP 회복
    brewHealAmount: 80,          // 1회 80 HP 회복
    // ── 봉인 방어막 기믹 ──
    // HP sealThreshold 이하 시 방어막 활성화 (1500 HP)
    // 방어막 활성 중 취권 패턴 발동 (drunkWalk 임시 발동)
    sealThreshold: 0.55,
    sealHp: 1500,
    // ── 분노 기믹 ──
    // HP 30% 이하 시 brewInterval 절반 + 모든 도구 사거리 -35% (5초, 1회)
    enrageHpThreshold: 0.3,
    enrageRangeReduction: 0.35,
    enrageRangeDuration: 5000,
    bossReward: 420,
    bossDrops: [
      { ingredient: 'sake', count: 5 },
      { ingredient: 'sashimi_tuna', count: 3 },
    ],
  },
  // ── Phase 27-3 신규 적 (13장 별빛 비스트로) ──
  wine_specter: {
    id: 'wine_specter',
    nameKo: '와인 유령',
    hp: 320,
    speed: 62,
    ingredient: 'truffle',
    bodyColor: 0x722f37,   // 버건디 레드
    // 취기 디버프: wineDebuffInterval마다 범위 내 도구 공격속도 감소
    wineDebuff: true,
    wineDebuffInterval: 5000,    // 5초마다 발동
    wineDebuffRadius: 75,        // 75px 범위
    wineDebuffEffect: { speedReduction: 0.25, duration: 3500 },
    // 유령 특성: 반투명, 냉동고만 타겟 가능 (invisible: true)
    invisible: true,
  },
  foie_gras_knight: {
    id: 'foie_gras_knight',
    nameKo: '푸아그라 기사',
    hp: 420,
    speed: 38,
    ingredient: 'truffle',
    bodyColor: 0xd4a017,   // 황금 베이지
    // 전방 방어 특화: 이동 방향(전면) 피해 70% 감소 (wok_guardian과 동일 플래그)
    shieldFrontHeavy: 0.70,
    // 격노: HP enrageHpThreshold 이하 시 속도 1.8배로 돌진
    enrageHpThreshold: 0.35,
    enrageSpeedMultiplier: 1.8,
  },
  // ── Phase 31-2 신규 적 (16장 향신료 궁전) ──
  curry_djinn: {
    id: 'curry_djinn',
    nameKo: '카레 지니',
    hp: 380,
    speed: 72,
    ingredient: 'saffron',
    bodyColor: 0xff8c00,   // 황금 오렌지
    // 텔레포트 메커닉: teleportInterval마다 랜덤 위치로 순간이동
    // Enemy.js에서 teleportEnabled 플래그로 분기 처리 (Phase 31-3 구현)
    teleportEnabled: true,
    teleportInterval: 6000,  // 6초마다 텔레포트
    teleportRadius: 200,     // 텔레포트 가능 반경
    canvasSize: 164,         // PixelLab pro 모드 생성 크기 (SpriteLoader 스케일 참조용)
  },
  naan_golem: {
    id: 'naan_golem',
    nameKo: '난 골렘',
    hp: 450,
    speed: 28,
    ingredient: 'curry_leaf',
    bodyColor: 0xd2a679,   // 밀/황토색
    // 자가 회복 메커닉: cheese_golem(3 HP/초)보다 강화
    // Enemy.js에서 regenRate 필드로 처리 (기존 cheese_golem 로직 재사용)
    regenRate: 6,           // 6 HP/초 자연 재생
    canvasSize: 120,         // PixelLab pro 모드 생성 크기 (SpriteLoader 스케일 참조용)
  },
  // ── Phase 32-2 신규 적 (17장 향신료 궁전 심층부) ──
  incense_specter: {
    id: 'incense_specter',
    nameKo: '향 혼령',
    hp: 420,
    speed: 58,
    ingredient: 'chai',
    bodyColor: 0xe8e0f0,
    confuseOnHit: true,
    confuseDuration: 3000,
    confuseChance: 0.35,
    canvasSize: 176,
    group: 2,
    reward: 30,
  },
  spice_elemental: {
    id: 'spice_elemental',
    nameKo: '향신료 정령',
    hp: 500,
    speed: 45,
    ingredient: 'saffron',
    bodyColor: 0xe84000,
    elementalResistance: true,
    resistTypes: ['freezer', 'wasabi_cannon'],
    resistMultiplier: 0.50,
    canvasSize: 164,
    group: 2,
    reward: 35,
  },
  // ── Phase 32-5 신규 적 (18장 향신료 궁전 최심부) ──
  masala_guide: {
    id: 'masala_guide',
    nameKo: '마살라 계승자',
    hp: 330,
    speed: 82,
    ingredient: 'cardamom',
    bodyColor: 0xe67e22,        // 주황빛 황토 (무술복)
    // 혼란 온 히트: incense_specter(35%)보다 낮은 확률, 빠른 속도로 교란
    confuseOnHit: true,
    confuseDuration: 2500,
    confuseChance: 0.25,
    // 돌진: HP 50% 이하 시 속도 2배로 2초 돌진, 10초 쿨다운
    charge: true,
    chargeHpThreshold: 0.50,
    chargeSpeedMultiplier: 2.0,
    chargeDuration: 2000,
    chargeInterval: 10000,
    canvasSize: 108,
    group: 2,
    reward: 32,
  },
  // 보스 — maharaja는 BOSS_IDS에 등록 (SpriteLoader에서 /sprites/bosses/ 경로 사용)
  maharaja: {
    id: 'maharaja',
    nameKo: '마하라자',
    hp: 2200,
    speed: 20,
    ingredient: null,
    bodyColor: 0xb8860b,        // 황금 다크 (스코프 문서 지정값)
    isBoss: true,
    // 향신료 폭발: spiceBlastInterval마다 범위 내 도구에 공격력/사거리 동시 디버프
    spiceBlast: true,
    spiceBlastInterval: 7000,        // 7초마다 발동
    spiceBlastRadius: 100,
    spiceBlastEffect: { damageReduction: 0.25, rangeReduction: 0.20, duration: 4000 },
    // 호위 소환: HP enrageHpThreshold 이하 시 masala_guide 3마리 소환 (1회)
    summonThreshold: 0.60,
    summonType: 'masala_guide',
    summonCount: 3,
    // 분노: HP 30% 이하 시 speed 35로 상승, spiceBlastInterval 절반
    enrageHpThreshold: 0.30,
    enrageSpeedBonus: 35,
    bossReward: 480,
    bossDrops: [
      { ingredient: 'cardamom', count: 4 },
      { ingredient: 'saffron', count: 3 },
      { ingredient: 'chai', count: 2 },
    ],
    canvasSize: 212,
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
    category: 'attack',
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
    category: 'attack',
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
    category: 'attack',
  },
  delivery: {
    id: 'delivery',
    nameKo: '배달 로봇',
    cost: 45,
    damage: 0,
    range: 110,
    fireRate: 0,
    projectileSpeed: 0,
    collectRadius: 110,
    collectInterval: 2000,
    color: 0x00cc88,
    category: 'support',
  },
  freezer: {
    id: 'freezer',
    nameKo: '냉동고',
    cost: 70,
    damage: 8,
    range: 100,
    fireRate: 1500,
    projectileSpeed: 160,
    freezeDuration: 1500,       // 1.5초 빙결
    canTargetInvisible: true,   // 투명 적 타겟 가능
    color: 0x00bfff,
    category: 'attack',
  },
  soup_pot: {
    id: 'soup_pot',
    nameKo: '수프 솥',
    cost: 60,
    damage: 0,
    range: 120,
    fireRate: 0,
    projectileSpeed: 0,
    auraInterval: 3000,         // 3초마다 버프
    auraEffect: 0.15,           // 공격속도 +15%
    color: 0x32cd32,
    category: 'support',
  },
};

// ── 도구 정의 (Phase 13: 영구 도구 시스템) ──
export const TOOL_DEFS = {
  pan: {
    id: 'pan',
    nameKo: '프라이팬',
    maxCount: 5,
    buyCost: [80, 120, 180, 250, 350],
    sellRate: 0.5,
    maxLevel: 3,
    upgradeCost: [0, 150, 400],
    stats: {
      1: { damage: 25, range: 100, fireRate: 1000, projectileSpeed: 200 },
      2: { damage: 35, range: 110, fireRate: 900, projectileSpeed: 200 },
      3: { damage: 50, range: 120, fireRate: 800, projectileSpeed: 200 },
    },
    color: 0xc0c0c0,
    category: 'attack',
    descKo: '기본 근거리 공격 도구. 빠른 공격속도로 전방의 적을 안정적으로 제압한다.',
    loreKo: '미미의 할머니가 첫 번째 식란 때 직접 벼려 만든 미력사 가문의 시조 도구.',
  },
  salt: {
    id: 'salt',
    nameKo: '소금 분사기',
    maxCount: 4,
    buyCost: [120, 180, 260, 360],
    sellRate: 0.5,
    maxLevel: 3,
    upgradeCost: [0, 200, 500],
    stats: {
      1: { damage: 12, range: 120, fireRate: 600, projectileSpeed: 180, slowFactor: 0.5, slowDuration: 2000 },
      2: { damage: 16, range: 130, fireRate: 550, projectileSpeed: 180, slowFactor: 0.55, slowDuration: 2500 },
      3: { damage: 22, range: 140, fireRate: 500, projectileSpeed: 180, slowFactor: 0.60, slowDuration: 3000 },
    },
    color: 0x87ceeb,
    category: 'attack',
    descKo: '적에게 소금을 분사해 이동 속도를 줄인다. 밀가루 유령처럼 보이지 않는 적도 감지 가능.',
    loreKo: '"뿌리면 보인다!" — 포코가 1,000년 된 소금통에 직접 적은 취급 주의 문구.',
  },
  grill: {
    id: 'grill',
    nameKo: '화염 그릴',
    maxCount: 3,
    buyCost: [200, 300, 450],
    sellRate: 0.5,
    maxLevel: 3,
    upgradeCost: [0, 300, 700],
    stats: {
      1: { damage: 18, range: 90, fireRate: 800, projectileSpeed: 220, burnDamage: 5, burnDuration: 3000, burnInterval: 500 },
      2: { damage: 25, range: 100, fireRate: 750, projectileSpeed: 220, burnDamage: 8, burnDuration: 3500, burnInterval: 500 },
      3: { damage: 35, range: 110, fireRate: 700, projectileSpeed: 220, burnDamage: 12, burnDuration: 4000, burnInterval: 500 },
    },
    color: 0xff4500,
    category: 'attack',
    descKo: '적에게 화염 투사체를 발사하고 화상 상태를 부여한다. 지속 피해로 높은 누적 DPS를 발휘한다.',
    loreKo: '미력사 가문에 전해지는 "정화염(淨化炎)" 조리법이 깃든 그릴. 태우면 정화된다는 단순한 진리.',
  },
  delivery: {
    id: 'delivery',
    nameKo: '배달 로봇',
    maxCount: 3,
    buyCost: [100, 160, 240],
    sellRate: 0.5,
    maxLevel: 3,
    upgradeCost: [0, 180, 450],
    stats: {
      1: { damage: 0, range: 110, fireRate: 0, projectileSpeed: 0, collectRadius: 110, collectInterval: 2000 },
      2: { damage: 0, range: 130, fireRate: 0, projectileSpeed: 0, collectRadius: 130, collectInterval: 1700 },
      3: { damage: 0, range: 150, fireRate: 0, projectileSpeed: 0, collectRadius: 150, collectInterval: 1400 },
    },
    color: 0x00cc88,
    category: 'support',
    descKo: '공격하지 않는 대신 주변 재료 드롭을 자동 수집한다. 수집 반경과 속도가 레벨에 따라 향상된다.',
    loreKo: '포코가 비밀리에 미력을 주입한 배달 로봇. "효율이 최고다"는 그의 철학이 하드코딩되어 있다.',
  },
  freezer: {
    id: 'freezer',
    nameKo: '냉동고',
    maxCount: 3,
    buyCost: [160, 240, 360],
    sellRate: 0.5,
    maxLevel: 3,
    upgradeCost: [0, 250, 600],
    stats: {
      1: { damage: 8, range: 100, fireRate: 1500, projectileSpeed: 160, freezeDuration: 1500, canTargetInvisible: true },
      2: { damage: 12, range: 110, fireRate: 1300, projectileSpeed: 160, freezeDuration: 2000, canTargetInvisible: true },
      3: { damage: 18, range: 120, fireRate: 1100, projectileSpeed: 160, freezeDuration: 2500, canTargetInvisible: true },
    },
    color: 0x00bfff,
    category: 'attack',
    descKo: '적을 빙결시켜 일시 정지 상태로 만든다. 투명 적도 탐지·공격 가능한 유일한 도구 유형.',
    loreKo: '식란 정화 도중 국물이 식어 얼어버린 솥에서 힌트를 얻었다는 설이 있는 전설의 냉동고.',
  },
  soup_pot: {
    id: 'soup_pot',
    nameKo: '수프 솥',
    maxCount: 3,
    buyCost: [140, 220, 330],
    sellRate: 0.5,
    maxLevel: 3,
    upgradeCost: [0, 200, 500],
    stats: {
      1: { damage: 0, range: 120, fireRate: 0, projectileSpeed: 0, auraInterval: 3000, auraEffect: 0.15 },
      2: { damage: 0, range: 130, fireRate: 0, projectileSpeed: 0, auraInterval: 2500, auraEffect: 0.20 },
      3: { damage: 0, range: 140, fireRate: 0, projectileSpeed: 0, auraInterval: 2000, auraEffect: 0.25 },
    },
    color: 0x32cd32,
    category: 'support',
    descKo: '공격하지 않는 버프 도구. 주변 타워의 공격속도를 주기적으로 증가시키는 오라를 발산한다.',
    loreKo: '끓이면 끓일수록 맛이 깊어지듯, 오래 배치할수록 주변 도구들의 미력을 자극한다고 전해진다.',
  },
  // ── Phase 19-1: 시즌 2 신규 도구 ──
  wasabi_cannon: {
    id: 'wasabi_cannon',
    nameKo: '와사비 대포',
    maxCount: 3,
    buyCost: [180, 220, 260],
    sellRate: 0.4,
    maxLevel: 3,
    upgradeCost: [0, 150, 250],
    stats: {
      1: { damage: 18, range: 110, fireRate: 1200, projectileSpeed: 200, splashRadius: 40, slowRate: 0.3, slowDuration: 1500 },
      2: { damage: 24, range: 120, fireRate: 1050, projectileSpeed: 200, splashRadius: 48, slowRate: 0.3, slowDuration: 1800 },
      3: { damage: 30, range: 130, fireRate: 900, projectileSpeed: 200, splashRadius: 55, slowRate: 0.35, slowDuration: 2000 },
    },
    color: 0x7cfc00,
    category: 'attack',
    descKo: '와사비 탄환을 발사하여 착탄 지점 주변 범위 피해와 광역 둔화를 동시에 가한다.',
    loreKo: '유키의 스승이 남긴 시즌2 비전 도구. "눈물 없이는 쓸 수 없다"는 경고가 포신에 새겨져 있다.',
  },
  spice_grinder: {
    id: 'spice_grinder',
    nameKo: '향신료 그라인더',
    maxCount: 3,
    buyCost: [160, 200, 240],
    sellRate: 0.4,
    maxLevel: 3,
    upgradeCost: [0, 130, 220],
    stats: {
      1: { damage: 12, range: 100, fireRate: 1000, projectileSpeed: 180, dotDamage: 5, dotDuration: 2000 },
      2: { damage: 17, range: 110, fireRate: 870, projectileSpeed: 180, dotDamage: 8, dotDuration: 2000 },
      3: { damage: 22, range: 120, fireRate: 750, projectileSpeed: 180, dotDamage: 12, dotDuration: 2000 },
    },
    color: 0xff8c00,
    category: 'attack',
    descKo: '향신료 분말을 발사해 기본 피해 외에 지속 독 피해(DoT)를 부여한다.',
    loreKo: '라오의 웍 철학을 담은 시즌2 도구. "한 방에 끝내지 않는다, 향신료처럼 서서히 스며든다."',
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
  // ── Phase 5 신규 재료 ──
  egg: {
    id: 'egg',
    nameKo: '달걀',
    color: 0xfff8dc,
    icon: '🥚',
  },
  rice: {
    id: 'rice',
    nameKo: '쌀',
    color: 0xf5f5f5,
    icon: '🍚',
  },
  // ── Phase 6 신규 재료 ──
  fish: {
    id: 'fish',
    nameKo: '생선',
    color: 0x4488cc,
    icon: '🐟',
  },
  mushroom: {
    id: 'mushroom',
    nameKo: '버섯',
    color: 0x8b6914,
    icon: '🍄',
  },
  cheese: {
    id: 'cheese',
    nameKo: '치즈',
    color: 0xffcc33,
    icon: '🧀',
  },
  // ── Phase 8 신규 재료 ──
  shrimp: {
    id: 'shrimp',
    nameKo: '새우',
    color: 0xff6347,
    icon: '🦐',
  },
  tomato: {
    id: 'tomato',
    nameKo: '토마토',
    color: 0xff4433,
    icon: '🍅',
  },
  butter: {
    id: 'butter',
    nameKo: '버터',
    color: 0xffd700,
    icon: '🧈',
  },
  // ── Phase 9 신규 재료 ──
  sugar: {
    id: 'sugar',
    nameKo: '설탕',
    color: 0xff88cc,
    icon: '🍬',
  },
  milk: {
    id: 'milk',
    nameKo: '우유',
    color: 0xffffff,
    icon: '🥛',
  },
  // ── Phase 20 신규 재료 ──
  sashimi_tuna: {
    id: 'sashimi_tuna',
    nameKo: '참치',
    color: 0xff6b81,
    icon: '🍣',
  },
  wasabi: {
    id: 'wasabi',
    nameKo: '와사비',
    color: 0x7fff00,
    icon: '🌿',
  },
  // ── Phase 21 신규 재료 ──
  tofu: {
    id: 'tofu',
    nameKo: '두부',
    color: 0xf5f5dc,
    icon: '🧊',
  },
  cilantro: {
    id: 'cilantro',
    nameKo: '고수',
    color: 0x228b22,
    icon: '🌿',
  },
  // ── Phase 22-3 신규 재료 ──
  sake: {
    id: 'sake',
    nameKo: '사케',
    color: 0xc8a2c8,   // 연보라 (사케 도쿠리 청자/보라 색조)
    icon: '🍶',
  },
  // ── Phase 25-1 신규 재료 ──
  star_anise: {
    id: 'star_anise',
    nameKo: '팔각',
    color: 0x8b1a1a,   // 짙은 적갈색
    icon: '✨',         // 임시. 실제 아이콘은 별형 향신료 이미지로 교체
  },
  // ── Phase 27-3 신규 재료 ──
  truffle: {
    id: 'truffle',
    nameKo: '흑트러플',
    color: 0x2c1810,   // 짙은 흑갈색
    icon: '🍄',         // 임시. 실제 아이콘은 truffle.png로 교체
  },
  // ── Phase 31-2 신규 재료 (16장 향신료 궁전) ──
  curry_leaf: {
    id: 'curry_leaf',
    nameKo: '카레 잎',
    color: 0x2e7d32,   // 짙은 녹색
    icon: 'assets/ingredients/curry_leaf.png',
  },
  saffron: {
    id: 'saffron',
    nameKo: '사프란',
    color: 0xff6f00,   // 황금 오렌지
    icon: 'assets/ingredients/saffron.png',
  },
  // ── Phase 32-2 신규 재료 (17장 향신료 궁전 심층부) ──
  chai: {
    id: 'chai',
    nameKo: '차이',
    color: 0xc08050,   // 따뜻한 갈색 (밀크티)
    icon: 'assets/ingredients/chai.png',
  },
  // ── Phase 32-5 신규 재료 (18장 향신료 궁전 최심부) ──
  cardamom: {
    id: 'cardamom',
    nameKo: '카다멈',
    color: 0x4caf50,            // 초록빛 씨앗 껍질
    icon: 'assets/ingredients/cardamom.png',
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
  // ── Phase 20 신규 서빙 레시피 ──
  {
    id: 'sashimi_plate',
    nameKo: '사시미 정식',
    ingredients: { sashimi_tuna: 2 },
    baseReward: 55,
    icon: '🍣',
    color: 0xff6b81,
    cookTime: 6000,
  },
  {
    id: 'wasabi_roll',
    nameKo: '와사비롤',
    ingredients: { sashimi_tuna: 1, wasabi: 1 },
    baseReward: 65,
    icon: '🌀',
    color: 0x9acd32,
    cookTime: 7000,
  },
  {
    id: 'nigiri_sushi',
    nameKo: '니기리 스시',
    ingredients: { sashimi_tuna: 1, rice: 1 },
    baseReward: 70,
    icon: '🍱',
    color: 0xffb347,
    cookTime: 7500,
  },
  {
    id: 'wasabi_tempura',
    nameKo: '와사비 튀김',
    ingredients: { wasabi: 1, shrimp: 1 },
    baseReward: 60,
    icon: '🍤',
    color: 0xffd700,
    cookTime: 6500,
  },
  {
    id: 'tuna_rice_bowl',
    nameKo: '참치 덮밥',
    ingredients: { sashimi_tuna: 2, rice: 2 },
    baseReward: 85,
    icon: '🥢',
    color: 0xff4466,
    cookTime: 9000,
  },
  {
    id: 'wasabi_miso_soup',
    nameKo: '와사비 된장국',
    ingredients: { wasabi: 1, mushroom: 1 },
    baseReward: 50,
    icon: '🍜',
    color: 0x8b7355,
    cookTime: 5500,
  },
  {
    id: 'sakura_kaiseki',
    nameKo: '사쿠라 가이세키',
    ingredients: { sashimi_tuna: 2, wasabi: 1, rice: 2 },
    baseReward: 110,
    icon: '🌸',
    color: 0xff69b4,
    cookTime: 12000,
  },
  {
    id: 'izakaya_platter',
    nameKo: '이자카야 플래터',
    ingredients: { sashimi_tuna: 1, wasabi: 1, shrimp: 2, fish: 1 },
    baseReward: 95,
    icon: '🍽️',
    color: 0x4682b4,
    cookTime: 11000,
  },
  // ── Phase 21 신규 서빙 레시피 ──
  {
    id: 'mapo_tofu',
    nameKo: '마파두부',
    ingredients: { tofu: 2 },
    baseReward: 70,
    icon: '🍲',
    color: 0xc0392b,
    cookTime: 8000,
  },
  {
    id: 'cilantro_tofu_steam',
    nameKo: '고수두부찜',
    ingredients: { tofu: 1, cilantro: 1 },
    baseReward: 55,
    icon: '🥘',
    color: 0x228b22,
    cookTime: 6500,
  },
  {
    id: 'dim_sum',
    nameKo: '딤섬',
    ingredients: { tofu: 1, flour: 1 },
    baseReward: 50,
    icon: '🥟',
    color: 0xf5cba7,
    cookTime: 5500,
  },
  {
    id: 'wok_noodles',
    nameKo: '웍 볶음면',
    ingredients: { cilantro: 1, egg: 1 },
    baseReward: 45,
    icon: '🍜',
    color: 0xdaa520,
    cookTime: 5000,
  },
  {
    id: 'tofu_hotpot',
    nameKo: '두부 훠궈',
    ingredients: { tofu: 2, mushroom: 1 },
    baseReward: 75,
    icon: '🫕',
    color: 0xff4500,
    cookTime: 9000,
  },
  {
    id: 'cilantro_shrimp_soup',
    nameKo: '고수 탕수',
    ingredients: { cilantro: 2, shrimp: 1 },
    baseReward: 75,
    icon: '🍲',
    color: 0x2e8b57,
    cookTime: 9000,
  },
  {
    id: 'peking_duck',
    nameKo: '베이징 덕',
    ingredients: { tofu: 1, cilantro: 1, butter: 1 },
    baseReward: 90,
    icon: '🦆',
    color: 0x8b4513,
    cookTime: 10000,
  },
  {
    id: 'dragon_feast',
    nameKo: '용의 만찬',
    ingredients: { tofu: 2, cilantro: 2, meat: 1 },
    baseReward: 130,
    icon: '🐉',
    color: 0xffd700,
    cookTime: 13000,
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
  // ── Phase 20 신규 버프 레시피 ──
  {
    id: 'wasabi_kick',
    nameKo: '와사비 킥',
    ingredients: { wasabi: 2 },
    effectDesc: '공격력 +35% (55초)',
    effectType: 'buff_damage',
    effectValue: 0.35,
    duration: 55000,
    color: 0x7fff00,
  },
  {
    id: 'tuna_precision',
    nameKo: '참치 정밀타',
    ingredients: { sashimi_tuna: 1, wasabi: 1 },
    effectDesc: '공격력+속도 +20% (50초)',
    effectType: 'buff_both',
    effectValue: 0.20,
    duration: 50000,
    color: 0xff6b81,
  },
  // ── Phase 21 신규 버프 레시피 ──
  {
    id: 'dragon_qi',
    nameKo: '용기(龍氣)',
    ingredients: { tofu: 2, cilantro: 1 },
    effectDesc: '공격력 +30% (55초)',
    effectType: 'buff_damage',
    effectValue: 0.30,
    duration: 55000,
    color: 0xc0392b,
  },
  {
    id: 'wok_aura',
    nameKo: '웍 오라',
    ingredients: { tofu: 1, cilantro: 2 },
    effectDesc: '공격력+속도 +25% (50초)',
    effectType: 'buff_both',
    effectValue: 0.25,
    duration: 50000,
    color: 0xff6b35,
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
