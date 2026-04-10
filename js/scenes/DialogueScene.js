/**
 * @fileoverview 대화 표시 오버레이 씬.
 * Phase 14-1: scene.launch()로 오버레이 동작하며, 배경 씬의 input을 블로킹한다.
 * 하단 180px 반투명 패널에 캐릭터 이름, 이모지 초상화, 대사 텍스트(타이핑 애니메이션)를 표시.
 *
 * 레이아웃 (360x640 기준):
 *   y=460~640: 대화 패널 (높이 180px)
 *   y=470: 이름 + 초상화 (좌측) / 건너뛰기 (우측)
 *   y=500~610: 대사 텍스트 (wordWrap 320px)
 *   y=620, x=340: 진행 힌트 "▼" (텍스트 완료 시만 깜빡임)
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// ── 레이아웃 상수 ──
const PANEL_Y = 460;
const PANEL_HEIGHT = 180;
const PANEL_COLOR = 0x1a0a00;
const PANEL_ALPHA = 0.88;
const PANEL_DEPTH = 200;
const TEXT_DEPTH = 201;

const NAME_X = 20;
const NAME_Y = 472;
const PORTRAIT_SIZE = 24;

const DIALOGUE_X = 20;
const DIALOGUE_Y = 500;
const DIALOGUE_MAX_W = 320;

const SKIP_X = 340;
const SKIP_Y = 472;

const HINT_X = 340;
const HINT_Y = 620;

const TYPING_SPEED_MS = 30;

export class DialogueScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DialogueScene' });
  }

  /**
   * @param {object} data
   * @param {object} data.script - 대화 스크립트 (DIALOGUES의 항목)
   * @param {function} [data.onComplete] - 대화 종료 콜백
   */
  init(data) {
    /** @private */
    this._script = data.script;
    /** @private */
    this._onComplete = data.onComplete || null;
    /** @private */
    this._lineIndex = 0;
    /** @private */
    this._isTyping = false;
    /** @private */
    this._fullText = '';
    /** @private */
    this._typedCount = 0;
    /** @private */
    this._typingTimer = null;
  }

  create() {
    // ── 딤 오버레이 (배경 씬 input 블로킹) ──
    this._dimOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.3
    ).setDepth(PANEL_DEPTH - 1).setInteractive();

    // ── 대화 패널 배경 ──
    this._panelBg = this.add.rectangle(
      GAME_WIDTH / 2, PANEL_Y + PANEL_HEIGHT / 2,
      GAME_WIDTH, PANEL_HEIGHT,
      PANEL_COLOR, PANEL_ALPHA
    ).setDepth(PANEL_DEPTH);

    // 패널 상단 구분선
    this._panelLine = this.add.rectangle(
      GAME_WIDTH / 2, PANEL_Y,
      GAME_WIDTH, 2,
      0xff6b35, 0.6
    ).setDepth(PANEL_DEPTH);

    // ── 캐릭터 이름 + 초상화 ──
    this._portraitText = this.add.text(NAME_X, NAME_Y, '', {
      fontSize: `${PORTRAIT_SIZE}px`,
    }).setDepth(TEXT_DEPTH);

    this._nameText = this.add.text(NAME_X + PORTRAIT_SIZE + 6, NAME_Y + 2, '', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(TEXT_DEPTH);

    // ── 대사 텍스트 ──
    this._dialogueText = this.add.text(DIALOGUE_X, DIALOGUE_Y, '', {
      fontSize: '14px',
      color: '#ffffff',
      lineSpacing: 6,
      wordWrap: { width: DIALOGUE_MAX_W },
      stroke: '#000000',
      strokeThickness: 1,
    }).setDepth(TEXT_DEPTH);

    // ── 진행 힌트 "▼" ──
    this._hintText = this.add.text(HINT_X, HINT_Y, '\u25BC', {
      fontSize: '14px',
      color: '#ffd700',
    }).setOrigin(0.5).setDepth(TEXT_DEPTH).setAlpha(0);

    // 깜빡임 tween (비활성 상태로 시작)
    this._hintTween = this.tweens.add({
      targets: this._hintText,
      alpha: { from: 1, to: 0.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // ── 건너뛰기 버튼 (AD 검수: 터치 타겟 44px 이상 확보) ──
    if (this._script.skippable) {
      this._skipBtn = this.add.text(SKIP_X, SKIP_Y, '건너뛰기', {
        fontSize: '13px',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(1, 0).setDepth(TEXT_DEPTH).setInteractive({
        hitArea: new Phaser.Geom.Rectangle(-8, -15, 60, 44),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true,
      });
      this._skipBtn.on('pointerdown', () => this._endDialogue());
    }

    // ── 터치/클릭으로 진행 ──
    this._panelBg.setInteractive();
    this._panelBg.on('pointerdown', () => this._onTap());
    // 딤 오버레이 탭도 진행으로 처리
    this._dimOverlay.on('pointerdown', () => this._onTap());

    // 첫 대사 표시
    this._showLine(0);
  }

  // ── 대사 표시 ──

  /**
   * 지정 인덱스의 대사를 표시한다.
   * @param {number} index
   * @private
   */
  _showLine(index) {
    if (index >= this._script.lines.length) {
      this._endDialogue();
      return;
    }

    this._lineIndex = index;
    const line = this._script.lines[index];

    // 화자 갱신
    const isNarrator = (line.speaker === 'narrator' || line.speaker === '');
    if (isNarrator) {
      this._portraitText.setText('');
      this._nameText.setText('');
      // 내레이터 스타일: 이탤릭
      this._dialogueText.setFontStyle('italic');
      this._dialogueText.setColor('#cccccc');
    } else {
      this._portraitText.setText(line.portrait || '');
      this._nameText.setText(line.speaker);
      this._dialogueText.setFontStyle('');
      this._dialogueText.setColor('#ffffff');
    }

    // 타이핑 애니메이션 시작
    this._fullText = line.text;
    this._typedCount = 0;
    this._isTyping = true;
    this._dialogueText.setText('');

    // 진행 힌트 숨기기
    this._hintText.setAlpha(0);
    this._hintTween.pause();

    // 타이핑 타이머
    if (this._typingTimer) {
      this._typingTimer.remove(false);
      this._typingTimer = null;
    }

    this._typingTimer = this.time.addEvent({
      delay: TYPING_SPEED_MS,
      callback: () => this._typeNextChar(),
      loop: true,
    });
  }

  /**
   * 한 글자씩 타이핑한다.
   * @private
   */
  _typeNextChar() {
    if (!this._isTyping) return;

    this._typedCount++;
    this._dialogueText.setText(this._fullText.slice(0, this._typedCount));

    if (this._typedCount >= this._fullText.length) {
      this._completeTyping();
    }
  }

  /**
   * 타이핑 완료 처리.
   * @private
   */
  _completeTyping() {
    this._isTyping = false;
    if (this._typingTimer) {
      this._typingTimer.remove(false);
      this._typingTimer = null;
    }
    this._dialogueText.setText(this._fullText);

    // 진행 힌트 표시 (AD 검수: 대사 하단에 근접 배치)
    const textBottom = DIALOGUE_Y + this._dialogueText.height;
    this._hintText.setY(Math.min(textBottom + 20, 600));
    this._hintText.setAlpha(1);
    this._hintTween.resume();
  }

  // ── 인터랙션 ──

  /**
   * 탭/클릭 처리. 타이핑 중이면 즉시 완료, 완료 상태면 다음 대사.
   * @private
   */
  _onTap() {
    if (this._isTyping) {
      // 타이핑 중 → 즉시 완료
      this._completeTyping();
    } else {
      // 완료 상태 → 다음 대사
      this._showLine(this._lineIndex + 1);
    }
  }

  /**
   * 대화 종료. 씬을 stop하고 콜백을 호출한다.
   * @private
   */
  _endDialogue() {
    // 타이머 정리
    if (this._typingTimer) {
      this._typingTimer.remove(false);
      this._typingTimer = null;
    }

    const cb = this._onComplete;
    this.scene.stop('DialogueScene');

    if (cb) cb();
  }

  /**
   * 씬 셧다운 시 리소스 정리.
   */
  shutdown() {
    if (this._typingTimer) {
      this._typingTimer.remove(false);
      this._typingTimer = null;
    }
    if (this._hintTween) {
      this._hintTween.stop();
      this._hintTween = null;
    }
  }
}
