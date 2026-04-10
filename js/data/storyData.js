/**
 * @fileoverview 스토리 트리거 데이터.
 * Phase 14-3: 각 항목은 triggerPoint별로 분류되며, StoryManager.checkTriggers()가 평가한다.
 *
 * condition(ctx, save): boolean 함수
 *   ctx  -- { stageId?, stars?, isFirstClear?, isMarketFailed? }
 *   save -- StoryManager.getProgress() 반환값 (currentChapter, storyFlags, seenDialogues 참조)
 *
 * triggerPoint: 씬/이벤트 식별자 문자열
 * dialogueId: 재생할 대화 스크립트 ID
 * once: true이면 DialogueManager.hasSeen()으로 중복 재생 차단
 * delay: ms 단위 지연 (scene.time.delayedCall)
 * chain: 부모 대화 onComplete 콜백에서 연쇄 실행할 대화
 */

export const STORY_TRIGGERS = [
  // ── WorldMapScene 진입 ──────────────────────────────────────────
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'intro_welcome',
    once: true,
    condition: () => true,
    // intro_welcome 완료 후 chapter1_start 연쇄
    chain: {
      dialogueId: 'chapter1_start',
    },
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'chapter2_intro',
    once: true,
    condition: (ctx, save) => save.currentChapter >= 2,
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'mage_introduction',
    once: true,
    condition: (ctx, save) => save.currentChapter >= 3,
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'mage_research_hint',
    once: true,
    condition: (ctx, save) =>
      save.seenDialogues.includes('mage_introduction'),
  },

  // ── MerchantScene 진입 ──────────────────────────────────────────
  {
    triggerPoint: 'merchant_enter',
    dialogueId: 'merchant_first_meet',
    once: true,
    condition: () => true,
  },
  {
    triggerPoint: 'merchant_enter',
    dialogueId: 'poco_discount_fail',
    once: true,
    condition: (ctx, save) =>
      save.seenDialogues.includes('merchant_first_meet'),
  },

  // ── GatheringScene 진입 ─────────────────────────────────────────
  {
    triggerPoint: 'gathering_enter',
    dialogueId: 'stage_boss_warning',
    once: true,
    condition: (ctx) => ctx.stageId?.endsWith('-6') === true,
    delay: 400,
  },

  // ── ResultScene: 스테이지 클리어 ────────────────────────────────
  // 주의: 배열 순서가 우선순위. 특수 스테이지 조건이 일반 조건보다 앞에 위치해야 한다.
  {
    triggerPoint: 'result_clear',
    dialogueId: 'stage_first_clear',
    once: false,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '1-6',
    delay: 800,
    chain: { dialogueId: 'chapter1_clear' },
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'rin_first_meet',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '2-1',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter3_rin_joins',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '3-3',
    delay: 800,
  },
  {
    // 일반 첫 클리어 (특수 스테이지 제외)
    triggerPoint: 'result_clear',
    dialogueId: 'stage_first_clear',
    once: false,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 &&
      ctx.stageId !== '1-6' &&
      ctx.stageId !== '2-1' &&
      ctx.stageId !== '3-3',
    delay: 800,
  },

  // ── ResultScene: 장보기 실패 ────────────────────────────────────
  {
    triggerPoint: 'result_market_failed',
    dialogueId: 'after_first_loss',
    once: true,
    condition: () => true,
    delay: 800,
  },
];
