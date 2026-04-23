/**
 * @fileoverview 셰프 해금 조건 판별 헬퍼 (Phase 75).
 *
 * ChefSelectScene과 merchantBranchData 양쪽에서 동일 로직을 재사용하기 위해
 * 독립 모듈로 추출한다. 기존 ChefSelectScene 내부의 `isChefLocked(chefId, save)`와
 * 동치인 조건을 역방향(해금 여부 반환)으로 제공한다.
 */

/**
 * 주어진 진행 상태에서 해당 셰프가 해금되어 있는지 반환한다.
 *
 * 해금 조건 매트릭스:
 *   - mimi_chef / rin_chef / mage_chef : 항상 해금
 *   - yuki_chef  : season2Unlocked
 *   - lao_chef   : season2Unlocked && currentChapter >= 10
 *   - andre_chef : season2Unlocked && currentChapter >= 13
 *   - arjun_chef : season3Unlocked && currentChapter >= 17
 *   - 그 외      : 잠금(false)
 *
 * @param {string} chefId - 셰프 ID (예: 'mimi_chef')
 * @param {{ currentChapter?: number, season2Unlocked?: boolean, season3Unlocked?: boolean }} progressState
 *   진행 상태. 필드 누락 시 기본값(챕터 1, 시즌 미해금)으로 보간한다.
 * @returns {boolean} 해금되어 있으면 true, 잠겨 있으면 false
 */
export function isChefUnlocked(chefId, progressState) {
  const ch = progressState?.currentChapter || 1;
  const s2 = !!progressState?.season2Unlocked;
  const s3 = !!progressState?.season3Unlocked;

  switch (chefId) {
    case 'mimi_chef':  return true;
    case 'rin_chef':   return true;
    case 'mage_chef':  return true;
    case 'yuki_chef':  return s2;
    case 'lao_chef':   return s2 && ch >= 10;
    case 'andre_chef': return s2 && ch >= 13;
    case 'arjun_chef': return s3 && ch >= 17;
    default:           return false;
  }
}
