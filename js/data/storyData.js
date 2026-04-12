/**
 * @fileoverview 스토리 트리거 데이터.
 * Phase 14-3: 각 항목은 triggerPoint별로 분류되며, StoryManager.checkTriggers()가 평가한다.
 * Phase 15: 챕터 2~6 트리거 13개 추가.
 * Phase 16: 튜토리얼 2개, 영업 이벤트 3개, 선택지 샘플 1개 트리거 추가.
 * Phase 19-3: 시즌 2 프롤로그 트리거 3건 추가 (prologue, yuki_intro, lao_intro).
 * Phase 20: 7장 사쿠라 이자카야 트리거 4건 추가 + stage_first_clear 제외 목록 갱신.
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

import { SaveManager } from '../managers/SaveManager.js';

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
  // Phase 15: 챕터 4~6 인트로
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'chapter4_intro',
    once: true,
    condition: (ctx, save) => save.currentChapter >= 4,
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'chapter5_intro',
    once: true,
    condition: (ctx, save) => save.currentChapter >= 5,
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'chapter6_intro',
    once: true,
    condition: (ctx, save) => save.currentChapter >= 6,
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
  // Phase 16-3: 선택지 샘플 대화 (할인 요청)
  {
    triggerPoint: 'merchant_enter',
    dialogueId: 'choice_sample_merchant',
    once: true,
    condition: (ctx, save) =>
      save.seenDialogues.includes('poco_discount_fail'),
  },
  // Phase 15: 포코 사이드 (챕터 4+)
  {
    triggerPoint: 'merchant_enter',
    dialogueId: 'poco_side_4',
    once: true,
    condition: (ctx, save) =>
      save.currentChapter >= 4 &&
      save.seenDialogues.includes('poco_discount_fail') &&
      save.seenDialogues.includes('choice_sample_merchant'),
  },

  // ── GatheringScene 진입 ─────────────────────────────────────────
  {
    triggerPoint: 'gathering_enter',
    dialogueId: 'stage_boss_warning',
    once: true,
    condition: (ctx) => ctx.stageId?.endsWith('-6') === true,
    delay: 400,
  },
  // Phase 15: 6-3 최종 결전 진입
  {
    triggerPoint: 'gathering_enter',
    dialogueId: 'chapter6_final_battle',
    once: true,
    condition: (ctx) => ctx.stageId === '6-3',
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
  // Phase 15: 챕터 2~6 클리어 + 사이드 트리거
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter2_clear',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '2-3',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter3_clear',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '3-6',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter4_mage_joins',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '4-3',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter4_clear',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '4-6',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'rin_side_5',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '5-3',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter5_clear',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '5-6',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'team_side_6',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '6-2',
    delay: 800,
  },
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter6_ending',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '6-3',
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
      ctx.stageId !== '2-3' &&
      ctx.stageId !== '3-3' &&
      ctx.stageId !== '3-6' &&
      ctx.stageId !== '4-3' &&
      ctx.stageId !== '4-6' &&
      ctx.stageId !== '5-3' &&
      ctx.stageId !== '5-6' &&
      ctx.stageId !== '6-2' &&
      ctx.stageId !== '6-3' &&
      ctx.stageId !== '7-1' &&   // chapter7_intro 별도 처리
      ctx.stageId !== '7-3' &&   // chapter7_yuki_joins 별도 처리
      ctx.stageId !== '7-6',     // chapter7_clear 별도 처리
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

  // ── GatheringScene 튜토리얼: 도구 배치 완료 (Phase 16-1) ────────
  {
    triggerPoint: 'tutorial_tool_placed',
    dialogueId: 'tutorial_tool_placed_dialogue',
    once: true,
    condition: () => true,
    delay: 300,
  },

  // ── ServiceScene 튜토리얼: 첫 서빙 완료 (Phase 16-1) ───────────
  {
    triggerPoint: 'tutorial_first_serve',
    dialogueId: 'tutorial_first_serve_dialogue',
    once: true,
    condition: () => true,
    delay: 500,
  },

  // ── ServiceScene 영업 이벤트: 해피아워 (Phase 16-2) ─────────────
  {
    triggerPoint: 'service_event',
    dialogueId: 'event_happy_hour_dialogue',
    once: true,
    condition: (ctx) => ctx.eventType === 'happy_hour',
    delay: 1500,
  },

  // ── ServiceScene 영업 이벤트: 맛집 리뷰 (Phase 16-2) ────────────
  {
    triggerPoint: 'service_event',
    dialogueId: 'event_food_review_dialogue',
    once: true,
    condition: (ctx) => ctx.eventType === 'food_review',
    delay: 1500,
  },

  // ── ServiceScene 영업 이벤트: 주방 사고 (Phase 16-2) ────────────
  {
    triggerPoint: 'service_event',
    dialogueId: 'event_kitchen_accident_dialogue',
    once: true,
    condition: (ctx) => ctx.eventType === 'kitchen_accident',
    delay: 1500,
  },

  // ── 시즌 2: 7장 사쿠라 이자카야 (Phase 20) ─────────────────────────
  // 7-1 입장 시 chapter7_intro
  {
    triggerPoint: 'gathering_enter',
    dialogueId: 'chapter7_intro',
    once: true,
    condition: (ctx) => ctx.stageId === '7-1',
    delay: 400,
  },
  // 7-3 첫 클리어 시 chapter7_yuki_joins
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter7_yuki_joins',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '7-3',
    delay: 800,
  },
  // 7-6 첫 클리어 시 chapter7_clear
  {
    triggerPoint: 'result_clear',
    dialogueId: 'chapter7_clear',
    once: true,
    condition: (ctx) =>
      ctx.isFirstClear && ctx.stars > 0 && ctx.stageId === '7-6',
    delay: 800,
    onComplete: () => {
      const data = SaveManager.load();
      if (!data.storyProgress.storyFlags || Array.isArray(data.storyProgress.storyFlags)) {
        data.storyProgress.storyFlags = {};
      }
      data.storyProgress.storyFlags.chapter7_cleared = true;
      if (data.storyProgress.currentChapter < 8) {
        data.storyProgress.currentChapter = 8;
      }
      SaveManager.save(data);
    },
  },
  // merchant_enter 에서 yuki_side_7 (7장 클리어 후 1회)
  {
    triggerPoint: 'merchant_enter',
    dialogueId: 'yuki_side_7',
    once: true,
    condition: (ctx, save) =>
      save.storyFlags?.chapter7_cleared === true &&
      !save.seenDialogues?.includes('yuki_side_7'),
  },

  // ── 시즌 2 프롤로그 (Phase 19-3) ─────────────────────────────────
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'season2_prologue',
    once: true,
    condition: (ctx, save) =>
      save.stages?.['6-3']?.stars > 0 && !save.season2Unlocked,
    onComplete: () => {
      const data = SaveManager.load();
      data.season2Unlocked = true;
      // currentChapter를 7로 올려서 시즌2 탭 + 7장 노드 활성화
      if (data.storyProgress.currentChapter < 7) {
        data.storyProgress.currentChapter = 7;
      }
      SaveManager.save(data);
    },
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'season2_yuki_intro',
    once: true,
    condition: (ctx, save) =>
      save.season2Unlocked && save.currentChapter >= 7 &&
      !save.storyFlags?.yuki_joined,
    onComplete: () => {
      const data = SaveManager.load();
      if (!data.storyProgress.storyFlags || Array.isArray(data.storyProgress.storyFlags)) {
        data.storyProgress.storyFlags = {};
      }
      data.storyProgress.storyFlags.yuki_joined = true;
      SaveManager.save(data);
    },
  },
  {
    triggerPoint: 'worldmap_enter',
    dialogueId: 'season2_lao_intro',
    once: true,
    condition: (ctx, save) =>
      save.season2Unlocked && save.currentChapter >= 8 &&
      !save.storyFlags?.lao_joined,
    onComplete: () => {
      const data = SaveManager.load();
      if (!data.storyProgress.storyFlags || Array.isArray(data.storyProgress.storyFlags)) {
        data.storyProgress.storyFlags = {};
      }
      data.storyProgress.storyFlags.lao_joined = true;
      SaveManager.save(data);
    },
  },
];
