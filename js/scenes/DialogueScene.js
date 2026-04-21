/**
 * @fileoverview 대화 표시 오버레이 씬.
 * Phase 14-1: scene.launch()로 오버레이 동작하며, 배경 씬의 input을 블로킹한다.
 * Phase 14-2b: 이모지 → 픽셀아트 스프라이트 초상화 렌더링 (fallback 유지).
 * Phase 16-3: 선택지(choices) 분기 UI 추가 — 버튼 클릭으로 대화 분기 진행.
 * 하단 180px 반투명 패널에 캐릭터 이름, 초상화, 대사 텍스트(타이핑 애니메이션)를 표시.
 *
 * 레이아웃 (360x640 기준, C1+M 확정):
 *   y=460~640: 대화 패널 (높이 180px)
 *   y=364~460: 포트레이트 96px (패널 상단 밀착)
 *   y=468: 이름 18px (좌측) / 건너뛰기 14px (우측) — 같은 행
 *   y=496~: 대사 텍스트 16px (wordWrap 328px)
 *   y=628, x=340: 진행 힌트 "▼" (텍스트 완료 시만 깜빡임)
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

// ── 레이아웃 상수 (C1+M 확정) ──
const PANEL_Y = 460;
const PANEL_HEIGHT = 180;
const PANEL_COLOR = 0x1a0a00;
const PANEL_ALPHA = 0.88;
const PANEL_DEPTH = 200;
const TEXT_DEPTH = 201;

const PORTRAIT_SIZE = 96;
const PORTRAIT_CENTER_X = 16 + PORTRAIT_SIZE / 2;   // 64
const PORTRAIT_CENTER_Y = PANEL_Y - PORTRAIT_SIZE / 2; // 412 (패널 상단에 밀착)

const NAME_X = 16;
const NAME_Y = PANEL_Y + 8;   // 468

const DIALOGUE_X = 16;
const DIALOGUE_Y = PANEL_Y + 36;  // 496
const DIALOGUE_MAX_W = 328;       // 360 - 16*2

const SKIP_X = 344;
const SKIP_Y = PANEL_Y + 10;  // 470

const HINT_X = 340;
const HINT_Y = 628;

const TYPING_SPEED_MS = 30;

// ── Phase 16-3: 선택지 레이아웃 상수 (AD 검수 반영: 터치 타겟 36px, gap 8px) ──
const CHOICE_BASE_Y = 568;
const CHOICE_BTN_HEIGHT = 36;
const CHOICE_BTN_GAP = 8;
const CHOICE_BTN_WIDTH = 300;
const CHOICE_BTN_COLOR = 0x3a2a00;
const CHOICE_BTN_HOVER = 0x5a4a10;

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
    /** @private 선택지 표시 중 여부 */
    this._showingChoices = false;
    /** @private 선택지 버튼 게임오브젝트 배열 */
    this._choiceButtons = [];
  }

  /**
   * 씬 생성. 딤 오버레이, 대화 패널, 초상화, 텍스트, 건너뛰기 버튼을 구성하고
   * 첫 번째 대사를 표시한다.
   */
  create() {
    // ── ��� 오버레이 (배경 �� input 블로킹) ──
    this._dimOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.3
    ).setDepth(PANEL_DEPTH - 1).setInteractive();

    // Phase 60-19: 대화 패널 배경 rect → NineSliceFactory.panel 'dark' + setTint
    this._panelBg = NineSliceFactory.panel(
      this, GAME_WIDTH / 2, PANEL_Y + PANEL_HEIGHT / 2,
      GAME_WIDTH, PANEL_HEIGHT, 'dark'
    );
    this._panelBg.setTint(PANEL_COLOR).setAlpha(PANEL_ALPHA).setDepth(PANEL_DEPTH);

    // Phase 60-19: 패널 상단 구분선 rect → NineSliceFactory.dividerH
    this._panelLine = NineSliceFactory.dividerH(this, GAME_WIDTH / 2, PANEL_Y, GAME_WIDTH, 2);
    this._panelLine.setTint(0xff6b35).setAlpha(0.6).setDepth(PANEL_DEPTH);

    // ── 캐릭터 초상화: 패널 위 돌출 (C1 레이아웃) ──
    this._portraitImage = this.add.image(PORTRAIT_CENTER_X, PORTRAIT_CENTER_Y, '__DEFAULT')
      .setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE)
      .setDepth(TEXT_DEPTH)
      .setVisible(false);

    this._portraitEmoji = this.add.text(PORTRAIT_CENTER_X, PORTRAIT_CENTER_Y, '', {
      fontSize: '48px',
    }).setOrigin(0.5).setDepth(TEXT_DEPTH);

    // ── 캐릭터 이름 (패널 최상단 좌측, M사이즈 18px) ──
    this._nameText = this.add.text(NAME_X, NAME_Y, '', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(TEXT_DEPTH);

    // ── 대사 텍스트 (M사이즈 16px) ──
    this._dialogueText = this.add.text(DIALOGUE_X, DIALOGUE_Y, '', {
      fontSize: '16px',
      color: '#ffffff',
      lineSpacing: 10,
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
        fontSize: '14px',
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

    // 씬 종료 시 정리
    this.events.once('shutdown', this.shutdown, this);

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
    // Phase 16-3: 이전 선택지 버튼 정리
    this._clearChoices();
    const line = this._script.lines[index];

    // 화자 갱신
    const isNarrator = (line.speaker === 'narrator' || line.speaker === '');
    if (isNarrator) {
      this._portraitImage.setVisible(false);
      this._portraitEmoji.setText('');
      this._nameText.setText('');
      // 내레이터 스타일: 이탤릭
      this._dialogueText.setFontStyle('italic');
      this._dialogueText.setColor('#cccccc');
    } else {
      // 초상화: 스프라이트 이미지 우선, 로드 실패 시 이모지 fallback
      const portraitKey = line.portraitKey ? `portrait_${line.portraitKey}` : '';
      if (portraitKey && SpriteLoader.hasTexture(this, portraitKey)) {
        this._portraitImage.setTexture(portraitKey)
          .setPosition(PORTRAIT_CENTER_X, PORTRAIT_CENTER_Y)
          .setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE)
          .setVisible(true);
        this._portraitEmoji.setVisible(false);
      } else {
        this._portraitEmoji.setText(line.portrait || '')
          .setPosition(PORTRAIT_CENTER_X, PORTRAIT_CENTER_Y)
          .setVisible(true);
        this._portraitImage.setVisible(false);
      }
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

    const line = this._script.lines[this._lineIndex];

    // Phase 16-3: 선택지가 있으면 버튼 렌더링, 없으면 기존 진행 힌트
    if (line.choices && line.choices.length > 0) {
      this._renderChoices(line.choices);
    } else {
      // 진행 힌트 표시 (AD 검수: 대사 하단에 근접 배치)
      const textBottom = DIALOGUE_Y + this._dialogueText.height;
      this._hintText.setY(Math.min(textBottom + 14, 628));
      this._hintText.setAlpha(1);
      this._hintTween.resume();
    }
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
    } else if (!this._showingChoices) {
      // Phase 16-3: 선택지 표시 중에는 탭으로 진행하지 않음
      // 완료 상태 → 다음 대사
      this._showLine(this._lineIndex + 1);
    }
  }

  // ── 선택지 시스템 (Phase 16-3) ──

  /**
   * 선택지 버튼을 렌더링한다.
   * @param {Array<{label: string, next: number}>} choices
   * @private
   */
  _renderChoices(choices) {
    this._clearChoices();
    this._showingChoices = true;

    // 패널 오버플로우 방지: 최대 2개 (AD 검수 반영)
    const limited = choices.slice(0, 2);

    limited.forEach((choice, i) => {
      const btnY = CHOICE_BASE_Y + i * (CHOICE_BTN_HEIGHT + CHOICE_BTN_GAP);

      // Phase 60-19: 선택지 배경 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
      const bg = NineSliceFactory.raw(
        this, GAME_WIDTH / 2, btnY,
        CHOICE_BTN_WIDTH, CHOICE_BTN_HEIGHT,
        'btn_primary_normal'
      );
      bg.setTint(CHOICE_BTN_COLOR).setAlpha(0.9).setDepth(TEXT_DEPTH + 1);
      const choiceHit = new Phaser.Geom.Rectangle(-CHOICE_BTN_WIDTH / 2, -CHOICE_BTN_HEIGHT / 2, CHOICE_BTN_WIDTH, CHOICE_BTN_HEIGHT);
      bg.setInteractive(choiceHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

      // 버튼 텍스트
      const label = this.add.text(GAME_WIDTH / 2, btnY, choice.label, {
        fontSize: '13px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5).setDepth(TEXT_DEPTH + 2);

      // Phase 60-19: setFillStyle → setTint
      bg.on('pointerover', () => bg.setTint(CHOICE_BTN_HOVER));
      bg.on('pointerout', () => bg.setTint(CHOICE_BTN_COLOR));

      // 선택 시: 터치 피드백 + 분기 진행 (AD 검수: pointerdown 피드백 추가)
      bg.on('pointerdown', () => {
        bg.setTint(0x7a6a20);
        this.time.delayedCall(80, () => {
          this._clearChoices();
          this._showingChoices = false;
          this._showLine(choice.next);
        });
      });

      this._choiceButtons.push(bg, label);
    });
  }

  /**
   * 선택지 버튼을 모두 제거한다.
   * @private
   */
  _clearChoices() {
    this._choiceButtons.forEach(obj => obj.destroy());
    this._choiceButtons = [];
    this._showingChoices = false;
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
    // Phase 16-3: 선택지 버튼 정리
    this._clearChoices();
  }
}
