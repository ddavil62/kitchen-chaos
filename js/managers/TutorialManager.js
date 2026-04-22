/**
 * @fileoverview 공용 튜토리얼 매니저. 씬 위에 단계별 힌트 오버레이를 렌더링하고 SaveManager로 완료 플래그를 저장한다.
 * Phase 11-3a: 전투/영업/상점/엔드리스 4종 튜토리얼 통합 관리.
 * Phase 62: 파란 플랫 Rectangle(0x0000aa) → NineSliceFactory.panel('dark')로 교체하여
 *           웜톤 갈색 테마와 통일. 본문 간섭 완화 위해 PANEL_H 60→68.
 */

import { GAME_WIDTH } from '../config.js';
import { SaveManager } from './SaveManager.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';

// ── 오버레이 레이아웃 상수 ──
const OVERLAY_CX = GAME_WIDTH / 2;
const OVERLAY_CY = 64;            // Phase 62: 60 → 64 (팝업 중심 미세 하강)
const PANEL_W = 300;
const PANEL_H = 80;                // Phase 74: 68 → 80 (페이지네이터 도트 행 추가, P2-4)
const PANEL_DEPTH = 130;
const TEXT_DEPTH = 131;

export class TutorialManager {
  /**
   * @param {Phaser.Scene} scene - 튜토리얼을 표시할 씬 인스턴스
   * @param {'battle'|'service'|'shop'|'endless'} key - SaveManager 플래그 키
   * @param {string[]} steps - 각 스텝의 힌트 텍스트 배열
   */
  constructor(scene, key, steps) {
    /** @private */
    this._scene = scene;
    /** @private */
    this._key = key;
    /** @private */
    this._steps = steps;
    /** @private */
    this._stepIndex = -1;
    /** @private */
    this._container = null;
    /** @private */
    this._active = false;
    /** 튜토리얼 종료 시 호출되는 콜백 @type {Function|null} */
    this.onComplete = null;
  }

  /**
   * 튜토리얼을 시작한다. 이미 완료된 튜토리얼이면 즉시 return.
   */
  start() {
    if (SaveManager.isTutorialDone(this._key)) return;
    this._stepIndex = 0;
    this._active = true;
    this._render();
  }

  /**
   * 다음 스텝으로 진행한다. 마지막 스텝이면 end()를 호출한다.
   */
  advance() {
    if (!this._active) return;
    this._stepIndex++;
    if (this._stepIndex >= this._steps.length) {
      this.end();
    } else {
      this._render();
    }
  }

  /**
   * 튜토리얼을 종료하고 오버레이를 제거한다.
   * SaveManager에 완료 플래그를 기록한다.
   */
  end() {
    this._active = false;
    this._stepIndex = -1;
    if (this._container) {
      this._container.destroy();
      this._container = null;
    }
    SaveManager.completeTutorial(this._key);
    if (this.onComplete) this.onComplete();
  }

  /**
   * 현재 튜토리얼이 진행 중인지 여부를 반환한다.
   * @returns {boolean}
   */
  isActive() {
    return this._active;
  }

  // ── 내부 렌더링 ──

  /**
   * 현재 스텝의 오버레이를 렌더링한다.
   * @private
   */
  _render() {
    // 기존 컨테이너가 있으면 제거
    if (this._container) {
      this._container.destroy();
      this._container = null;
    }

    const scene = this._scene;
    const text = this._steps[this._stepIndex];

    // Phase 62: 파란 Rectangle → panel('dark') NineSlice
    // panel()은 container 좌표계에 넣으면 위치가 이중 적용되므로 월드 좌표로 직접 추가하고 depth만 관리한다.
    const bg = NineSliceFactory.panel(scene, OVERLAY_CX, OVERLAY_CY, PANEL_W, PANEL_H, 'dark');
    bg.setDepth(PANEL_DEPTH);

    // 힌트 텍스트 — Phase 74: y-offset 상향 (-10 → -14, 도트 공간 확보)
    const label = scene.add.text(OVERLAY_CX, OVERLAY_CY - 14, text, {
      fontSize: '13px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4,
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: PANEL_W - 32 },
    }).setOrigin(0.5, 0.5).setDepth(TEXT_DEPTH);

    // 스킵 버튼 — Phase 62: 살짝 밝게 + 아래로 정렬 보정
    const skip = scene.add.text(OVERLAY_CX + 132, OVERLAY_CY + 22, '[\uAC74\uB108\uB6F0\uAE30]', {
      fontSize: '10px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0.5).setDepth(TEXT_DEPTH).setInteractive({ useHandCursor: true });
    skip.on('pointerdown', () => this.end());

    // Phase 74: 페이지네이터 도트 인디케이터 추가 (P2-4)
    const pageObjects = [];
    const dotCount = this._steps.length;
    const dotGap = 14;
    const startX = OVERLAY_CX - (dotCount - 1) * (dotGap / 2);
    for (let i = 0; i < dotCount; i++) {
      const isActive = (i === this._stepIndex);
      const dot = scene.add.text(startX + i * dotGap, OVERLAY_CY + 28, isActive ? '\u25CF' : '\u25CB', {
        fontSize: '10px',
        color: isActive ? '#ffdd88' : '#888888',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5, 0.5).setDepth(TEXT_DEPTH);
      pageObjects.push(dot);
    }

    // Phase 62: panel은 이미 씬에 등록된 오브젝트. 개별 오브젝트로 추적하여 end()/advance()에서 destroy.
    this._container = { destroy: () => { bg.destroy(); label.destroy(); skip.destroy(); pageObjects.forEach(d => d.destroy()); } };
  }
}
