/**
 * @fileoverview 분기 카드 효과 조회 헬퍼 (Phase 58-3).
 *
 * SaveManager에 저장된 `branchCards` 상태(toolMutations / chefBonds / activeBlessing / unlockedBranchRecipes)를
 * merchantBranchData.js의 카드 정의와 결합하여, 게임플레이 씬에서 "배수 / 보너스 / 효과 여부"를
 * 한 줄 호출로 확인할 수 있도록 경량 어댑터 API를 제공한다.
 *
 * 아키텍처 원칙:
 *   - SaveManager는 상태 저장만 담당 (데이터 레이어 import 금지)
 *   - 카드 정의 의존은 본 모듈 한 곳에 집중
 *   - 각 씬은 `BranchEffects.getBlessingMultiplier('gold_gain')` 같은 API로 배수만 획득
 */

import { SaveManager } from './SaveManager.js';
import { getBranchCardById } from '../data/merchantBranchData.js';

export class BranchEffects {
  // ── 축복(Blessing) ──────────────────────────────────────────────

  /**
   * 활성 축복 카드 정의를 반환. 없으면 null.
   * @returns {object|null} 카드 정의 (id/category/titleKo/descKo/blessingEffect 포함) 또는 null
   */
  static getActiveBlessingCard() {
    const active = SaveManager.getActiveBlessing();
    if (!active) return null;
    return getBranchCardById(active.id);
  }

  /**
   * 특정 타입의 축복 배수/보너스 값을 반환.
   *
   * 반환값 규칙:
   *   - 활성 축복이 없거나 type이 다르면 기본값(1.0 또는 0) 반환
   *   - 타입별로 "배수"(gold_gain, cook_speed 등)는 1.0 기준, "보너스"(exp_gain, ingredient_drop_count)는 0 기준
   *
   * 지원 타입:
   *   - 'gold_gain'              → 영업 수입 배수 (기본 1.0)
   *   - 'cook_speed'             → 조리시간 감소 비율 (기본 0, 예: 0.2 → -20%)
   *   - 'drop_rate'              → 재료 드롭률 배수 (기본 1.0, target 지정형은 getBlessingDropRateFor 참조)
   *   - 'ingredient_drop_count'  → 추가 드롭 개수 (기본 0)
   *   - 'exp_gain'               → 스테이지 클리어 추가 코인 (기본 0)
   *   - 'enemy_slow'             → 적 이동속도 감소 비율 (기본 0, 예: 0.15 → -15%)
   *   - 'patron_patience'        → 손님 인내심 배수 (기본 1.0)
   *   - 'mireuk_traveler_chance' → 미력 나그네 등장 확률 추가 (기본 0)
   *
   * @param {string} type
   * @returns {number}
   */
  static getBlessingMultiplier(type) {
    const card = BranchEffects.getActiveBlessingCard();
    if (!card || !card.blessingEffect) return BranchEffects._blessingDefault(type);
    if (card.blessingEffect.type !== type) return BranchEffects._blessingDefault(type);
    return card.blessingEffect.value;
  }

  /**
   * 특정 재료 ID에 대한 축복 드롭률 배수 반환. 없으면 1.0.
   * 'drop_rate' 타입 축복 중 target이 일치하는 경우에만 적용한다.
   * @param {string} ingredientType
   * @returns {number} 배수 (기본 1.0)
   */
  static getBlessingDropRateFor(ingredientType) {
    const card = BranchEffects.getActiveBlessingCard();
    if (!card || !card.blessingEffect) return 1.0;
    if (card.blessingEffect.type !== 'drop_rate') return 1.0;
    if (card.blessingEffect.target !== ingredientType) return 1.0;
    return card.blessingEffect.value;
  }

  /**
   * 타입별 기본값 반환 (축복 미적용 시).
   * @param {string} type
   * @returns {number}
   * @private
   */
  static _blessingDefault(type) {
    switch (type) {
      // 배수형: 카드 value가 곱해지는 의미 → 없으면 1.0
      case 'gold_gain':
      case 'drop_rate':
        return 1.0;
      // 가산형: 카드 value가 더해지는 의미 → 없으면 0
      case 'cook_speed':         // (1 - value) 곱해서 시간 감소
      case 'ingredient_drop_count':
      case 'exp_gain':
      case 'enemy_slow':
      case 'patron_patience':    // (1 + value) 곱해서 인내심 증가
      case 'mireuk_traveler_chance':
      default:
        return 0;
    }
  }

  // ── 변이(Mutation) ────────────────────────────────────────────────

  /**
   * 특정 도구에 적용된 변이 카드 정의를 반환.
   * @param {string} toolId
   * @returns {object|null} 카드 정의 또는 null
   */
  static getMutationCard(toolId) {
    const mutations = SaveManager.getToolMutations();
    const mutationId = mutations[toolId];
    if (!mutationId) return null;
    return getBranchCardById(mutationId);
  }

  /**
   * 특정 도구의 변이 효과 정의만 반환.
   * @param {string} toolId
   * @returns {object|null} mutationEffect 객체 또는 null
   */
  static getMutationEffect(toolId) {
    const card = BranchEffects.getMutationCard(toolId);
    return card ? card.mutationEffect : null;
  }

  /**
   * 도구가 변이 상태인지 확인.
   * @param {string} toolId
   * @returns {boolean}
   */
  static hasMutation(toolId) {
    return !!SaveManager.getToolMutations()[toolId];
  }

  /**
   * 변이 도구의 시각 tint 색상 반환. 변이 타입별 고정 팔레트.
   * 에셋 없이 Phaser setTint()만으로 구분할 수 있게 한다 (스펙 "방식 A").
   * @param {string} toolId
   * @returns {number|null} 0xRRGGBB 또는 null (변이 없음)
   */
  static getMutationTint(toolId) {
    const effect = BranchEffects.getMutationEffect(toolId);
    if (!effect) return null;
    // 타입별 고정 색 (스펙 "변이 카테고리 색상 = 오렌지"는 공통이되, 내부 타입별 변주)
    switch (effect.type) {
      case 'splash':        return 0xff6b35; // 주황
      case 'chain':         return 0x66ccff; // 하늘 (소금 연쇄)
      case 'burn_stack':    return 0xff3311; // 진한 빨강 (지옥불)
      case 'phase_through': return 0xccccff; // 연보라 (유령)
      case 'freeze_extend': return 0x88eeff; // 얼음 청록
      case 'aura_boost':    return 0x66ff66; // 녹색
      case 'cluster':       return 0x99dd55; // 연두
      case 'venom':         return 0xaa44ff; // 보라 (독)
      default:              return 0xff6600;
    }
  }

  // ── 셰프 인연(Bond) ────────────────────────────────────────────────

  /**
   * 현재 편성된 셰프 + 주어진 도구 조합의 Bond 카드 정의를 반환.
   * chefId가 없으면 SaveManager에서 현재 선택된 셰프를 조회한다.
   * @param {string} toolId
   * @param {string} [chefIdOverride] - 테스트용 직접 지정
   * @returns {object|null} 카드 정의 또는 null
   */
  static getActiveBondCard(toolId, chefIdOverride) {
    const chefId = chefIdOverride || SaveManager.load().selectedChef;
    if (!chefId) return null;
    const bondIds = SaveManager.getChefBonds();
    for (const bondId of bondIds) {
      const card = getBranchCardById(bondId);
      if (!card || card.category !== 'bond') continue;
      if (card.chefId === chefId && card.bondToolId === toolId) return card;
    }
    return null;
  }

  /**
   * 현재 편성 셰프 기준 Bond 효과 정의만 반환.
   * @param {string} toolId
   * @param {string} [chefIdOverride]
   * @returns {object|null} bondEffect 또는 null
   */
  static getActiveBondEffect(toolId, chefIdOverride) {
    const card = BranchEffects.getActiveBondCard(toolId, chefIdOverride);
    return card ? card.bondEffect : null;
  }

  // ── 레시피 해금(Recipe) ────────────────────────────────────────────

  /**
   * 현재 해금된 분기 레시피 ID 목록을 반환. (SaveManager 헬퍼 재노출)
   * @returns {string[]}
   */
  static getUnlockedBranchRecipes() {
    return SaveManager.getUnlockedBranchRecipes();
  }

  /**
   * 해금된 분기 레시피 카드 정의 목록을 반환.
   * @returns {Array<object>}
   */
  static getUnlockedBranchRecipeCards() {
    const ids = SaveManager.getUnlockedBranchRecipes();
    // recipeId → 카드 매핑이 필요하므로 BRANCH_CARDS를 역추적한다.
    // (카드 id가 아닌 recipeId 기준이므로 getBranchCardById로는 찾을 수 없다.)
    const result = [];
    for (const recipeId of ids) {
      // merchantBranchData는 recipe 카테고리 카드만 recipeId 필드를 가짐
      // 카드 ID와 별개이므로 모듈 import 후 filter 사용
      const card = BranchEffects._findRecipeCardByRecipeId(recipeId);
      if (card) result.push(card);
    }
    return result;
  }

  /**
   * recipeId(해금된 레시피 ID)로 원본 카드 정의를 조회.
   * @param {string} recipeId
   * @returns {object|null}
   * @private
   */
  static _findRecipeCardByRecipeId(recipeId) {
    // 순환 import 방지를 위해 필요한 시점에만 로드.
    // ESM 정적 import는 이미 위에서 했으므로 여기서는 직접 참조.
    // eslint-disable-next-line no-underscore-dangle
    return BranchEffects._recipeCardCache?.[recipeId] || null;
  }

  /**
   * 한 번만 recipe 카테고리 카드 맵을 캐시한다. (모듈 로드 시 정적 초기화)
   * @private
   */
  static _initRecipeCache() {
    if (BranchEffects._recipeCardCache) return;
    // 정적 import된 상수만 사용하므로 순환 문제 없음.
    // 카드 pool에서 recipe 카테고리만 뽑아 { recipeId: cardDef } 맵을 구성한다.
    // eslint-disable-next-line no-underscore-dangle
    BranchEffects._recipeCardCache = {};
    // merchantBranchData에서 getBranchCardsByCategory를 쓸 수 있지만 이미 getBranchCardById를 import했으므로
    // 필요 시 추가 import도 허용된다. 간단히 동적 require 대신 즉시 구성.
  }
}

// 모듈 로드 시점에 recipe 카드 캐시 초기화는 지연시키고, 첫 호출 시 lazy 구성되게 두어도 되지만
// 레시피 카테고리 전체를 한번에 import 하는 편이 단순하므로 별도 import로 처리.
import { getBranchCardsByCategory } from '../data/merchantBranchData.js';

(function initRecipeCache() {
  const cache = {};
  const recipeCards = getBranchCardsByCategory('recipe');
  for (const card of recipeCards) {
    if (card.recipeId) cache[card.recipeId] = card;
  }
  // eslint-disable-next-line no-underscore-dangle
  BranchEffects._recipeCardCache = cache;
})();
