/**
 * @fileoverview 스토리 매니저.
 * Phase 14-3: 챕터 진행도 추적, 조건부 트리거 중앙 관리.
 * Phase 19-3: onComplete 콜백 지원, getProgress에 stages/season2Unlocked 노출,
 *             storyFlags 객체 방식 전환.
 *
 * 주요 책임:
 * 1. storyProgress (currentChapter, storyFlags) 세이브 read/write
 * 2. checkTriggers(scene, triggerPoint, context) -- 씬이 호출하는 단일 진입점
 * 3. advanceChapter(stageId) -- 스테이지 클리어 시 챕터 진행도 자동 갱신
 * 4. setFlag / hasFlag -- 임의 스토리 플래그 관리
 */

import { STORY_TRIGGERS } from '../data/storyData.js';
import { DialogueManager } from './DialogueManager.js';
import { SaveManager } from './SaveManager.js';

/** 스테이지 ID -> 챕터 번호 매핑 */
const STAGE_TO_CHAPTER = {
  '1-1': 1, '1-2': 1, '1-3': 1, '1-4': 1, '1-5': 1, '1-6': 1,
  '2-1': 2, '2-2': 2, '2-3': 2,
  '3-1': 3, '3-2': 3, '3-3': 3, '3-4': 3, '3-5': 3, '3-6': 3,
  '4-1': 4, '4-2': 4, '4-3': 4, '4-4': 4, '4-5': 4, '4-6': 4,
  '5-1': 5, '5-2': 5, '5-3': 5, '5-4': 5, '5-5': 5, '5-6': 5,
  '6-1': 6, '6-2': 6, '6-3': 6,
};

export class StoryManager {
  /**
   * storyProgress 조회.
   * Phase 19-3: stages, season2Unlocked 추가 (시즌 2 트리거 condition에서 참조).
   * @returns {{ currentChapter: number, storyFlags: object, seenDialogues: string[], stages: object, season2Unlocked: boolean }}
   */
  static getProgress() {
    const data = SaveManager.load();
    const seenDialogues = data.seenDialogues || [];
    return {
      currentChapter: data.storyProgress?.currentChapter || 1,
      storyFlags: data.storyProgress?.storyFlags || {},
      seenDialogues,
      // Phase 19-3: 시즌 2 트리거에서 stages/season2Unlocked 접근 필요
      stages: data.stages || {},
      season2Unlocked: !!data.season2Unlocked,
    };
  }

  /**
   * 스토리 플래그 설정.
   * Phase 19-3: storyFlags를 객체로 변환하여 key=true 방식으로 저장.
   * @param {string} key
   */
  static setFlag(key) {
    const data = SaveManager.load();
    if (!data.storyProgress) data.storyProgress = { currentChapter: 1, storyFlags: {} };
    // 배열→객체 마이그레이션 안전 처리
    if (Array.isArray(data.storyProgress.storyFlags)) {
      data.storyProgress.storyFlags = {};
    }
    if (!data.storyProgress.storyFlags[key]) {
      data.storyProgress.storyFlags[key] = true;
      SaveManager.save(data);
    }
  }

  /**
   * 스토리 플래그 확인.
   * @param {string} key
   * @returns {boolean}
   */
  static hasFlag(key) {
    return !!StoryManager.getProgress().storyFlags[key];
  }

  /**
   * 스테이지 클리어 시 챕터 진행도를 갱신한다.
   * stageId에서 챕터 번호를 추론하여 currentChapter를 최댓값으로 유지한다.
   * (currentChapter는 플레이어가 도달한 최고 챕터)
   * @param {string} stageId
   */
  static advanceChapter(stageId) {
    const chapter = STAGE_TO_CHAPTER[stageId];
    if (!chapter) return;

    const data = SaveManager.load();
    if (!data.storyProgress) {
      data.storyProgress = { currentChapter: 1, storyFlags: {} };
    }
    if (chapter > data.storyProgress.currentChapter) {
      data.storyProgress.currentChapter = chapter;
      SaveManager.save(data);
    }
  }

  /**
   * 씬이 호출하는 단일 트리거 진입점.
   * triggerPoint에 해당하는 STORY_TRIGGERS를 평가하여 조건을 만족하는 첫 항목을 실행한다.
   * 한 번에 하나의 대화만 실행한다 (연쇄는 chain으로 처리).
   *
   * @param {Phaser.Scene} scene - 호출 씬
   * @param {string} triggerPoint - 트리거 식별자 (예: 'worldmap_enter')
   * @param {object} [context={}] - 조건 평가에 필요한 컨텍스트
   *   @param {string}  [context.stageId]
   *   @param {number}  [context.stars]
   *   @param {boolean} [context.isFirstClear]
   */
  static checkTriggers(scene, triggerPoint, context = {}) {
    const save = StoryManager.getProgress();
    const candidates = STORY_TRIGGERS.filter(t => t.triggerPoint === triggerPoint);

    for (const trigger of candidates) {
      // 조건 평가
      if (!trigger.condition(context, save)) continue;

      // once: true 이면 이미 본 대화는 건너뜀
      if (trigger.once && DialogueManager.hasSeen(trigger.dialogueId)) continue;

      // 트리거 실행
      StoryManager._fire(scene, trigger, context, save);
      return; // 한 번에 하나만 실행
    }
  }

  /**
   * 단일 트리거를 실행한다.
   * delay가 있으면 delayedCall, 없으면 즉시 실행.
   * @param {Phaser.Scene} scene
   * @param {object} trigger
   * @param {object} context
   * @param {object} save
   * @private
   */
  static _fire(scene, trigger, context, save) {
    const run = () => {
      const options = {};

      // chain이 있으면 onComplete 콜백에서 연쇄 실행
      if (trigger.chain) {
        options.onComplete = () => {
          const chainSeen = DialogueManager.hasSeen(trigger.chain.dialogueId);
          if (!chainSeen) {
            DialogueManager.start(scene, trigger.chain.dialogueId);
          }
        };
      }

      // trigger.onComplete 콜백 지원 (Phase 19-3)
      if (trigger.onComplete) {
        const existingComplete = options.onComplete;
        options.onComplete = () => {
          if (existingComplete) existingComplete();
          trigger.onComplete();
        };
      }

      DialogueManager.start(scene, trigger.dialogueId, options);
    };

    if (trigger.delay && trigger.delay > 0) {
      scene.time.delayedCall(trigger.delay, run);
    } else {
      run();
    }
  }
}
