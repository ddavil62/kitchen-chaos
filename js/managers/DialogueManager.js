/**
 * @fileoverview 대화 관리자.
 * Phase 14-1: JSON 대화 스크립트 로딩, 상태 관리, 세이브 연동.
 * DialogueScene을 오버레이로 launch하여 대화를 표시하고,
 * 본 대화는 SaveManager에 기록하여 중복 재생을 방지한다.
 */

import { DIALOGUES } from '../data/dialogueData.js';
import { SaveManager } from './SaveManager.js';

export class DialogueManager {
  /**
   * 대화 시작. DialogueScene을 launch한다.
   * @param {Phaser.Scene} callerScene - 호출한 씬 (오버레이 launch용)
   * @param {string} dialogueId - 대화 스크립트 ID
   * @param {object} [options]
   * @param {boolean} [options.force=false] - 이미 본 대화도 강제 재생
   * @param {function} [options.onComplete] - 대화 종료 콜백
   */
  static start(callerScene, dialogueId, options = {}) {
    const script = DIALOGUES[dialogueId];
    if (!script) {
      console.warn(`[DialogueManager] 대화 스크립트를 찾을 수 없음: ${dialogueId}`);
      options.onComplete?.();
      return;
    }

    // 이미 본 대화인지 확인
    if (!options.force && this.hasSeen(dialogueId)) {
      options.onComplete?.();
      return;
    }

    callerScene.scene.launch('DialogueScene', {
      script,
      onComplete: () => {
        this.markSeen(dialogueId);
        options.onComplete?.();
      }
    });
  }

  /**
   * 해당 대화를 이미 본 적 있는지 확인한다.
   * @param {string} dialogueId
   * @returns {boolean}
   */
  static hasSeen(dialogueId) {
    return SaveManager.hasSeenDialogue(dialogueId);
  }

  /**
   * 해당 대화를 본 것으로 기록한다.
   * @param {string} dialogueId
   */
  static markSeen(dialogueId) {
    SaveManager.markDialogueSeen(dialogueId);
  }

  /**
   * 대화 스크립트 데이터를 반환한다.
   * @param {string} dialogueId
   * @returns {object|null}
   */
  static getScript(dialogueId) {
    return DIALOGUES[dialogueId] || null;
  }

  /**
   * 모든 대화 시청 기록을 초기화한다.
   */
  static resetAll() {
    const data = SaveManager.load();
    data.seenDialogues = [];
    SaveManager.save(data);
  }
}
