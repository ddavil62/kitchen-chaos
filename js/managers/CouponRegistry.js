/**
 * @fileoverview 쿠폰 코드 레지스트리 모듈.
 * Phase 54: 일반 쿠폰(프로덕션 포함) + DEV 전용 치트 코드를 단일 모듈로 관리한다.
 * 씬 의존성 없이 순수 JS 모듈로 구현되며, DEV 전용 코드는 빌드 시 트리쉐이킹된다.
 */

import { STAGE_ORDER } from '../data/stageData.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';
import { SaveManager } from './SaveManager.js';
import { ToolManager } from './ToolManager.js';

// ── 사용 이력 localStorage 키 ──
const COUPON_LS_KEY = 'kitchenChaosTycoon_usedCoupons';

// ── 일반 쿠폰 코드 정의 (프로덕션 + DEV) ──
const PROD_COUPONS = [
  { code: 'LAZYSLIME2026', gold: 5000, ingredients: {},                                  label: '골드 +5,000' },
  { code: 'KITCHENLOVE',   gold: 3000, ingredients: { carrot: 5, meat: 5, egg: 5 },      label: '골드 +3,000 + 재료 15개' },
  { code: 'GRANDOPENING',  gold: 2000, ingredients: { flour: 10, rice: 10 },              label: '골드 +2,000 + 재료 20개' },
];

// ── DEV 전용 치트 코드 (빌드 시 트리쉐이킹) ──
/** @type {Array<{code: string, desc: string, type: string, handler: () => {ok: boolean, msg: string}}>} */
let DEV_COUPONS = [];

if (import.meta.env.DEV) {
  DEV_COUPONS = [
    {
      code: 'CHEAT_GOLD',
      desc: '골드 99,999',
      type: 'cheat',
      handler: () => {
        ToolManager.addGold(99999);
        return { ok: true, msg: '[DEV] 골드 +99,999 지급 완료' };
      },
    },
    {
      code: 'CHEAT_ITEMS',
      desc: '전 재료 x20',
      type: 'cheat',
      handler: () => {
        const allIngredients = {};
        for (const key of Object.keys(INGREDIENT_TYPES)) {
          allIngredients[key] = 20;
        }
        SaveManager.addGiftIngredients(allIngredients);
        return { ok: true, msg: '[DEV] 전 재료 x20 지급 (다음 채집 씬 진입 시 적용)' };
      },
    },
    {
      code: 'CHEAT_STAGE_SKIP',
      desc: '스테이지 스킵',
      type: 'cheat',
      handler: () => {
        const data = SaveManager.load();
        // 현재 클리어된 마지막 스테이지 찾기
        let lastClearedIdx = -1;
        for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
          if (data.stages[STAGE_ORDER[i]]?.cleared) {
            lastClearedIdx = i;
            break;
          }
        }
        const nextIdx = lastClearedIdx + 1;
        if (nextIdx >= STAGE_ORDER.length) {
          return { ok: false, msg: '[DEV] 모든 스테이지가 이미 클리어되었습니다' };
        }
        const nextStageId = STAGE_ORDER[nextIdx];
        SaveManager.clearStage(nextStageId, 3);
        // 챕터 진행도 갱신
        const chapter = parseInt(nextStageId.split('-')[0], 10);
        const saveData = SaveManager.load();
        if (saveData.storyProgress && chapter > (saveData.storyProgress.currentChapter || 1)) {
          saveData.storyProgress.currentChapter = chapter;
          SaveManager.save(saveData);
        }
        // 시즌 해금 플래그
        if (chapter >= 7 && !saveData.season2Unlocked) {
          saveData.season2Unlocked = true;
          SaveManager.save(saveData);
        }
        if (chapter >= 16 && !saveData.season3Unlocked) {
          saveData.season3Unlocked = true;
          SaveManager.save(saveData);
        }
        location.reload();
        return { ok: true, msg: `[DEV] ${nextStageId} 3성 클리어 처리 완료. 리로드 중...` };
      },
    },
    {
      code: 'CHEAT_BOSS_KILL',
      desc: '보스 즉사 (전투씬)',
      type: 'cheat',
      handler: () => {
        if (window.__kcCheat?.bossDie) {
          window.__kcCheat.bossDie();
          return { ok: true, msg: '[DEV] 모든 적 즉사 처리' };
        }
        return { ok: false, msg: '[DEV] 전투 씬에서만 사용 가능합니다' };
      },
    },
    {
      code: 'CHEAT_WAVE_END',
      desc: '웨이브 종료 (전투씬)',
      type: 'cheat',
      handler: () => {
        if (window.__kcCheat?.waveEnd) {
          window.__kcCheat.waveEnd();
          return { ok: true, msg: '[DEV] 웨이브 강제 완료 처리' };
        }
        return { ok: false, msg: '[DEV] 전투 씬에서만 사용 가능합니다' };
      },
    },
  ];
}

// ── 사용 이력 관리 ──

/**
 * 사용된 쿠폰 코드 목록을 로드한다.
 * @returns {Set<string>}
 * @private
 */
function _loadUsedCoupons() {
  try {
    const raw = localStorage.getItem(COUPON_LS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/**
 * 쿠폰 코드를 사용 이력에 추가한다.
 * @param {string} code - 정규화된 코드
 * @private
 */
function _markUsed(code) {
  const used = _loadUsedCoupons();
  used.add(code);
  try {
    localStorage.setItem(COUPON_LS_KEY, JSON.stringify([...used]));
  } catch {
    // localStorage 쓰기 실패 시 무시
  }
}

// ── 공개 API ──

/**
 * DEV 환경에서 사용 가능한 치트 코드 힌트 목록을 반환한다.
 * 프로덕션 빌드에서는 빈 배열을 반환하며, 해당 분기 코드는 트리쉐이킹된다.
 * @returns {Array<{code: string, desc: string}>}
 */
export function getCheatCodeHints() {
  // F-8 Fix: DEV 플래그와 런타임 가드 이중 확인 — 배포 환경에서 치트 코드 노출 방지
  if (import.meta.env.DEV && !import.meta.env.PROD) {
    return DEV_COUPONS.map(c => ({ code: c.code, desc: c.desc }));
  }
  return [];
}

/**
 * 쿠폰 코드를 사용(리딤)한다.
 * 코드를 정규화(trim + toUpperCase)한 뒤 유효성을 확인하고 보상을 지급한다.
 * @param {string} rawCode - 사용자가 입력한 코드 문자열
 * @returns {{ ok: boolean, msg: string }} 결과 객체
 */
export function redeemCoupon(rawCode) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { ok: false, msg: '코드를 입력해 주세요.' };
  }

  // ── DEV 치트 코드 확인 (재사용 가능, 이력 저장 안 함) ──
  if (import.meta.env.DEV) {
    const cheat = DEV_COUPONS.find(c => c.code === code);
    if (cheat) {
      return cheat.handler();
    }
  }

  // ── 일반 코드: 사용 이력 확인 ──
  const used = _loadUsedCoupons();
  if (used.has(code)) {
    return { ok: false, msg: '이미 사용된 코드입니다.' };
  }

  // ── 일반 코드 탐색 ──
  const coupon = PROD_COUPONS.find(c => c.code === code);
  if (!coupon) {
    return { ok: false, msg: '유효하지 않은 코드입니다.' };
  }

  // ── 보상 지급 ──
  // 골드
  if (coupon.gold > 0) {
    ToolManager.addGold(coupon.gold);
  }
  // 재료 (giftIngredients 필드에 영구 저장)
  if (coupon.ingredients && Object.keys(coupon.ingredients).length > 0) {
    SaveManager.addGiftIngredients(coupon.ingredients);
  }

  // ── 사용 이력 저장 ──
  _markUsed(code);

  // ── 성공 메시지 구성 ──
  const parts = [];
  if (coupon.gold > 0) parts.push(`골드 +${coupon.gold.toLocaleString()}`);
  if (coupon.ingredients && Object.keys(coupon.ingredients).length > 0) {
    const ingredientSummary = Object.entries(coupon.ingredients)
      .map(([id, n]) => `${INGREDIENT_TYPES[id]?.icon || id}x${n}`)
      .join(' ');
    parts.push(`재료 ${ingredientSummary}`);
  }
  return { ok: true, msg: `보상 지급! ${parts.join(', ')}` };
}
