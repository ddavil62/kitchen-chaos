/**
 * @fileoverview 행상인 분기 카드 데이터 정의 (Phase 58-1).
 *
 * 매 행상인 방문 시 "되돌릴 수 없는 3택 1 분기" 구조를 위해 제시되는 카드 풀을 정의한다.
 * 카테고리는 4종이며 매 방문 시 그 중 3개가 뽑혀 각 카테고리에서 1장씩 3장이 제시된다.
 *
 * 카테고리 4종:
 *   - mutation : 특정 도구에 영구 변이를 부여 (도구당 최대 1개)
 *   - recipe   : 해당 런에서 등장 가능한 고수익 분기 레시피 해금
 *   - bond     : 셰프+도구 조합 시너지 해금 (상시 적용)
 *   - blessing : 스테이지 한정 지속 버프 (remainingStages 차감)
 *
 * UI 반영은 Phase 58-2, 실제 효과 적용 로직은 Phase 58-3에서 각각 처리한다.
 * 본 파일은 데이터 스키마와 카드 선정 알고리즘까지만 책임진다.
 */

// ── 카테고리 상수 ──

/**
 * 분기 카드 카테고리 ID 목록.
 * @type {readonly ['mutation', 'recipe', 'bond', 'blessing']}
 */
export const BRANCH_CATEGORIES = Object.freeze(['mutation', 'recipe', 'bond', 'blessing']);

/**
 * 카테고리 메타데이터 (UI 렌더링 참조용).
 * 58-2 단계에서 UI 쪽에서 라벨/색상/배지 아이콘 경로를 참조한다.
 * @type {Readonly<{ [key: string]: { labelKo: string, color: number, badgeAsset: string } }>}
 */
export const BRANCH_CATEGORY_META = Object.freeze({
  mutation: { labelKo: '변이',       color: 0xff6600, badgeAsset: 'assets/ui/branch_badge_mutation.png' },
  recipe:   { labelKo: '레시피 해금', color: 0x22cc44, badgeAsset: 'assets/ui/branch_badge_recipe.png' },
  bond:     { labelKo: '셰프 인연',   color: 0x88aaff, badgeAsset: 'assets/ui/branch_badge_bond.png' },
  blessing: { labelKo: '미력의 축복', color: 0xffcc00, badgeAsset: 'assets/ui/branch_badge_blessing.png' },
});

// ── 카드 정의 ──

/**
 * 분기 카드 공통 스키마:
 * {
 *   id: string,           // 고유 ID (카테고리 접두어_설명)
 *   category: 'mutation' | 'recipe' | 'bond' | 'blessing',
 *   titleKo: string,      // 카드 제목 (한국어)
 *   descKo: string,       // 카드 설명 (한국어, wordWrap)
 *
 *   // mutation 전용
 *   targetToolId?: string,
 *   mutationEffect?: { type: string, [param: string]: any },
 *
 *   // recipe 전용
 *   recipeId?: string,
 *   rewardMultiplier?: number,
 *
 *   // bond 전용
 *   chefId?: string,
 *   bondToolId?: string,
 *   bondEffect?: { type: string, value: number, [param: string]: any },
 *
 *   // blessing 전용
 *   blessingEffect?: { type: string, value: number, stages: number },
 * }
 *
 * @type {Array<object>}
 */
export const BRANCH_CARDS = [
  // ── 변이(Mutation) 8장: 도구 8종 각 1장씩 ──
  {
    id: 'mut_pan_flame',
    category: 'mutation',
    titleKo: '화염 팬',
    descKo: '프라이팬이 범위 공격을 얻는다. splashRadius +30. 되돌릴 수 없다.',
    targetToolId: 'pan',
    mutationEffect: { type: 'splash', splashRadius: 30 },
  },
  {
    id: 'mut_salt_chain',
    category: 'mutation',
    titleKo: '연쇄 소금',
    descKo: '둔화 효과가 인접 적에게 1회 연쇄한다. 연쇄 반경 40px.',
    targetToolId: 'salt',
    mutationEffect: { type: 'chain', chainCount: 1, chainRadius: 40 },
  },
  {
    id: 'mut_grill_inferno',
    category: 'mutation',
    titleKo: '지옥불 그릴',
    descKo: '화상 중첩이 3회까지 쌓이며, 중첩된 화상 데미지가 3배로 증가한다.',
    targetToolId: 'grill',
    mutationEffect: { type: 'burn_stack', maxStacks: 3, stackMultiplier: 3 },
  },
  {
    id: 'mut_delivery_ghost',
    category: 'mutation',
    titleKo: '유령 배달봇',
    descKo: '수거 로봇이 장애물을 무시하고 이동한다. 수거 간격 −300ms.',
    targetToolId: 'delivery',
    mutationEffect: { type: 'phase_through', collectIntervalDelta: -300 },
  },
  {
    id: 'mut_freezer_permafrost',
    category: 'mutation',
    titleKo: '영구 동토',
    descKo: '빙결 지속시간 +1.5s. 해제된 적은 30% 확률로 재빙결된다.',
    targetToolId: 'freezer',
    mutationEffect: { type: 'freeze_extend', freezeDurationDelta: 1.5, refreezeChance: 0.3 },
  },
  {
    id: 'mut_soup_overcharge',
    category: 'mutation',
    titleKo: '과충전 수프',
    descKo: '아우라 버프 수치가 2배, 영향 범위 +20px.',
    targetToolId: 'soup_pot',
    mutationEffect: { type: 'aura_boost', auraMultiplier: 2.0, auraRadiusDelta: 20 },
  },
  {
    id: 'mut_wasabi_cluster',
    category: 'mutation',
    titleKo: '와사비 클러스터',
    descKo: '탄 1발이 3발로 분열한다. splashRadius −10, 탄당 데미지 60%.',
    targetToolId: 'wasabi_cannon',
    mutationEffect: { type: 'cluster', clusterCount: 3, splashRadiusDelta: -10, perShotDamageRatio: 0.6 },
  },
  {
    id: 'mut_spice_venom',
    category: 'mutation',
    titleKo: '독성 향신료',
    descKo: 'DoT 지속시간 +2s. 중독된 적은 이동속도 −20% 추가.',
    targetToolId: 'spice_grinder',
    mutationEffect: { type: 'venom', dotDurationDelta: 2, poisonSlowPct: 0.2 },
  },

  // ── 레시피 해금(Recipe) 8장 — 특수 고수익 메뉴 ──
  // rewardMultiplier는 recipeData.js의 baseReward에 직접 반영됨. 런타임에서 중복 적용하지 않는다.
  {
    id: 'rec_dragon_feast',
    category: 'recipe',
    titleKo: '드래곤 연회',
    descKo: '이번 영업 1회 등장: 재료 6종, 수익 ×3.0.',
    recipeId: 'branch_dragon_feast',
    rewardMultiplier: 3.0,
  },
  {
    id: 'rec_mireuk_tea',
    category: 'recipe',
    titleKo: '미력의 차',
    descKo: '이번 영업 1회 등장: 재료 2종, 미력의 정수 +15 보너스.',
    recipeId: 'branch_mireuk_tea',
    rewardMultiplier: 1.0,
  },
  {
    id: 'rec_grand_omakase',
    category: 'recipe',
    titleKo: '그랜드 오마카세',
    descKo: '이번 영업 등장: 재료 8종, 수익 ×4.0, 제한 시간 2배.',
    recipeId: 'branch_grand_omakase',
    rewardMultiplier: 4.0,
  },
  {
    id: 'rec_golden_curry',
    category: 'recipe',
    titleKo: '황금 카레',
    descKo: '이번 영업 1회 등장: 재료 4종, 수익 ×2.5, 팁 확정.',
    recipeId: 'branch_golden_curry',
    rewardMultiplier: 2.5,
  },
  {
    id: 'rec_chaos_ramen',
    category: 'recipe',
    titleKo: '카오스 라멘',
    descKo: '이번 영업 반복 등장 최대 3회: 재료 3종, 수익 ×2.0.',
    recipeId: 'branch_chaos_ramen',
    rewardMultiplier: 2.0,
  },
  {
    id: 'rec_frozen_dessert',
    category: 'recipe',
    titleKo: '극지 파르페',
    descKo: '이번 영업 1회 등장: 재료 2종, 조리시간 0, 수익 ×2.0.',
    recipeId: 'branch_frozen_dessert',
    rewardMultiplier: 2.0,
  },
  {
    id: 'rec_spice_bomb',
    category: 'recipe',
    titleKo: '스파이스 폭탄',
    descKo: '이번 영업 등장 2회: 재료 2종, 수익 ×1.8, 빠른 조리.',
    recipeId: 'branch_spice_bomb',
    rewardMultiplier: 1.8,
  },
  {
    id: 'rec_bistro_course',
    category: 'recipe',
    titleKo: '비스트로 풀코스',
    descKo: '이번 영업 1회 등장: 4단계 코스, 총 수익 ×5.0.',
    recipeId: 'branch_bistro_course',
    rewardMultiplier: 5.0,
  },

  // ── 셰프 인연(Bond) 8장 — 셰프 7종 × 도구 조합 (mimi 2장) ──
  {
    id: 'bond_lao_grill',
    category: 'bond',
    titleKo: '라오와 그릴',
    descKo: '라오 편성 + grill 보유 시 grill 공격력 +50%.',
    chefId: 'lao_chef',
    bondToolId: 'grill',
    bondEffect: { type: 'damage_pct', value: 0.5 },
  },
  {
    id: 'bond_rin_pan',
    category: 'bond',
    titleKo: '린과 프라이팬',
    descKo: '린 편성 + pan 보유 시 pan 화상 데미지 +8 추가.',
    chefId: 'rin_chef',
    bondToolId: 'pan',
    bondEffect: { type: 'burn_damage_flat', value: 8 },
  },
  {
    id: 'bond_mage_freezer',
    category: 'bond',
    titleKo: '메이지와 냉동고',
    descKo: '메이지 편성 + freezer 보유 시 빙결 범위 +25px.',
    chefId: 'mage_chef',
    bondToolId: 'freezer',
    bondEffect: { type: 'freeze_radius_flat', value: 25 },
  },
  {
    id: 'bond_yuki_soup',
    category: 'bond',
    titleKo: '유키와 수프',
    descKo: '유키 편성 + soup_pot 보유 시 아우라 버프 조리시간 −15% 추가.',
    chefId: 'yuki_chef',
    bondToolId: 'soup_pot',
    bondEffect: { type: 'cook_speed_pct', value: 0.15 },
  },
  {
    id: 'bond_andre_delivery',
    category: 'bond',
    titleKo: '앙드레와 배달봇',
    descKo: '앙드레 편성 + delivery 보유 시 배달봇 수거 시 팁 +10%.',
    chefId: 'andre_chef',
    bondToolId: 'delivery',
    bondEffect: { type: 'tip_pct', value: 0.1 },
  },
  {
    id: 'bond_arjun_wasabi',
    category: 'bond',
    titleKo: '아르준과 와사비',
    descKo: '아르준 편성 + wasabi_cannon 보유 시 splashRadius +20, 독 스택 추가.',
    chefId: 'arjun_chef',
    bondToolId: 'wasabi_cannon',
    bondEffect: { type: 'wasabi_synergy', value: 1, splashRadiusDelta: 20, poisonStackBonus: 1 },
  },
  {
    id: 'bond_mimi_salt',
    category: 'bond',
    titleKo: '미미와 소금',
    descKo: '미미 편성 + salt 보유 시 둔화 적에 대한 수거 범위 +40px.',
    chefId: 'mimi_chef',
    bondToolId: 'salt',
    bondEffect: { type: 'collect_radius_on_slow', value: 40 },
  },
  {
    id: 'bond_mimi_spice',
    category: 'bond',
    titleKo: '미미와 향신료',
    descKo: '미미 편성 + spice_grinder 보유 시 중독 적 재료 드롭률 +25%.',
    chefId: 'mimi_chef',
    bondToolId: 'spice_grinder',
    bondEffect: { type: 'drop_rate_on_poison', value: 0.25 },
  },

  // ── 미력의 축복(Blessing) 8장 — 스테이지 한정 버프 ──
  {
    id: 'bles_drop_carrot',
    category: 'blessing',
    titleKo: '당근의 은총',
    descKo: '채집 씬 당근 드롭률 ×2.0. 3 스테이지 지속.',
    blessingEffect: { type: 'drop_rate', target: 'carrot', value: 2.0, stages: 3 },
  },
  {
    id: 'bles_gold_gain',
    category: 'blessing',
    titleKo: '황금 물결',
    descKo: '영업 골드 수입 +30%. 2 스테이지 지속.',
    blessingEffect: { type: 'gold_gain', value: 1.3, stages: 2 },
  },
  {
    id: 'bles_exp_boost',
    category: 'blessing',
    titleKo: '경험치 급류',
    descKo: '스테이지 클리어 주방 코인 +5. 3 스테이지 지속.',
    blessingEffect: { type: 'exp_gain', value: 5, stages: 3 },
  },
  {
    id: 'bles_cook_speed',
    category: 'blessing',
    titleKo: '신속 조리',
    descKo: '조리시간 −20%. 2 스테이지 지속.',
    blessingEffect: { type: 'cook_speed', value: 0.2, stages: 2 },
  },
  {
    id: 'bles_essence_rain',
    category: 'blessing',
    titleKo: '미력의 단비',
    descKo: '미력 나그네 등장 확률 +15%. 3 스테이지 지속.',
    blessingEffect: { type: 'mireuk_traveler_chance', value: 0.15, stages: 3 },
  },
  {
    id: 'bles_enemy_slow',
    category: 'blessing',
    titleKo: '중력의 손',
    descKo: '전 적 이동속도 −15%. 2 스테이지 지속.',
    blessingEffect: { type: 'enemy_slow', value: 0.15, stages: 2 },
  },
  {
    id: 'bles_patron_rush',
    category: 'blessing',
    titleKo: '손님의 인내',
    descKo: '손님 인내심 최대치 +25%. 2 스테이지 지속.',
    blessingEffect: { type: 'patron_patience', value: 0.25, stages: 2 },
  },
  {
    id: 'bles_ingredient_rich',
    category: 'blessing',
    titleKo: '풍요의 뿔',
    descKo: '채집 씬 재료 드롭 수 +1 (전 종). 3 스테이지 지속.',
    blessingEffect: { type: 'ingredient_drop_count', value: 1, stages: 3 },
  },
];

// ── 카드 조회 헬퍼 ──

/**
 * ID로 카드 정의를 조회한다.
 * @param {string} cardId
 * @returns {object|null} 해당 카드 정의. 없으면 null.
 */
export function getBranchCardById(cardId) {
  return BRANCH_CARDS.find(c => c.id === cardId) || null;
}

/**
 * 특정 카테고리의 모든 카드를 반환한다.
 * @param {'mutation'|'recipe'|'bond'|'blessing'} category
 * @returns {Array<object>}
 */
export function getBranchCardsByCategory(category) {
  return BRANCH_CARDS.filter(c => c.category === category);
}

// ── 카드 선정 알고리즘 ──

/**
 * 피셔-예이츠 셔플 (제자리 수정하지 않고 새 배열 반환).
 * @template T
 * @param {T[]} arr
 * @returns {T[]} 셔플된 새 배열
 * @private
 */
function fisherYatesShuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 세이브 상태 기반 카테고리별 적용 가능 카드 풀을 반환한다.
 *
 * 제외 규칙:
 *   - mutation : `branchCards.toolMutations`에 이미 변이가 적용된 `targetToolId`는 제외
 *   - recipe   : `branchCards.unlockedBranchRecipes`에 이미 해금된 `recipeId`는 제외
 *   - bond     : `branchCards.chefBonds`에 이미 해금된 카드 `id`는 제외
 *   - blessing : 제외 조건 없음 (활성 축복이 있어도 새 축복을 뽑을 수 있음, 갱신 규칙)
 *
 * @param {'mutation'|'recipe'|'bond'|'blessing'} category
 * @param {object} branchCardsState - SaveManager.branchCards
 * @returns {Array<object>} 적용 가능한 카드 배열
 */
export function getEligiblePool(category, branchCardsState) {
  const state = branchCardsState || {};
  const toolMutations      = state.toolMutations      || {};
  const unlockedRecipes    = state.unlockedBranchRecipes || [];
  const chefBonds          = state.chefBonds          || [];

  const pool = getBranchCardsByCategory(category);

  switch (category) {
    case 'mutation':
      // 이미 해당 도구에 변이가 있으면 제외
      return pool.filter(c => !toolMutations[c.targetToolId]);
    case 'recipe':
      return pool.filter(c => !unlockedRecipes.includes(c.recipeId));
    case 'bond':
      return pool.filter(c => !chefBonds.includes(c.id));
    case 'blessing':
    default:
      return pool.slice();
  }
}

/**
 * 매 행상인 방문 시 제시할 분기 카드 3장을 선정한다.
 *
 * 알고리즘:
 *   1. 4개 카테고리를 피셔-예이츠 셔플
 *   2. 앞에서부터 순차로 카테고리를 소비하며, 적용 가능 풀에서 무작위 1장 선택
 *   3. 풀이 비어 있는 카테고리는 건너뛰고 다음 카테고리로 보충
 *   4. 최대 3장까지 채워지면 종료. 총 풀이 부족하면 3장 미만으로 반환 가능.
 *
 * @param {object} branchCardsState - SaveManager.branchCards
 * @returns {Array<object>} 최대 3장. 총 카드 풀이 부족하면 그만큼 반환.
 */
export function selectBranchCards(branchCardsState) {
  const shuffledCategories = fisherYatesShuffle(BRANCH_CATEGORIES);
  const selected = [];

  for (const category of shuffledCategories) {
    if (selected.length >= 3) break;
    const pool = getEligiblePool(category, branchCardsState);
    if (pool.length === 0) continue;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    selected.push(pick);
  }

  return selected;
}
