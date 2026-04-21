/**
 * @fileoverview 셰프 선택 씬 — 가로 캐러셀 UI.
 * Phase 6: 스테이지 선택 후, 게임 시작 전에 셰프를 고르는 화면.
 * Phase 7: GameScene -> MarketScene 전환에 따라 씬 키 변경.
 * Phase 11-1: stageId='endless' 시 EndlessScene으로 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 버튼 Disabled 팔레트 적용.
 * Phase 19-2: 5종 카드 리레이아웃 + 시즌2 셰프 잠금 표시.
 * Phase 56: 7종 Named 셰프 카드, 압축 레이아웃, 잠금 조건 7종 분기, unlockHint 사용.
 * Phase 57: 세로 목록 → 가로 캐러셀 전면 개편. 중앙 카드 260x380px,
 *           좌우 스와이프 + 화살표 버튼, 순환(wrap) 탐색, portrait 통합.
 * 360x640 레이아웃: 가로 캐러셀 카드 + "이 셰프로 시작" + "셰프 없이 시작" + 뒤로가기.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { CHEF_TYPES, CHEF_ORDER } from '../data/chefData.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { STAGES } from '../data/stageData.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

// ── 셰프 ID → portrait 텍스처 키 매핑 (Phase 57) ──
const CHEF_PORTRAIT_MAP = {
  mimi_chef:  'portrait_mimi',
  rin_chef:   'portrait_rin',
  mage_chef:  'portrait_mage',
  yuki_chef:  'portrait_yuki',
  lao_chef:   'portrait_lao',
  andre_chef: 'portrait_andre',
  arjun_chef: 'portrait_arjun',
};

/**
 * 셰프 잠금 여부 판별.
 * @param {string} chefId - 셰프 ID
 * @param {object} save - 세이브 데이터
 * @returns {boolean} 잠금이면 true
 */
function isChefLocked(chefId, save) {
  const ch = save.storyProgress?.currentChapter || 1;
  switch (chefId) {
    case 'mimi_chef':  return false;
    case 'rin_chef':   return false;
    case 'mage_chef':  return false;
    case 'yuki_chef':  return !save.season2Unlocked;
    case 'lao_chef':   return !save.season2Unlocked || ch < 10;
    case 'andre_chef': return !save.season2Unlocked || ch < 13;
    case 'arjun_chef': return !save.season3Unlocked || ch < 17;
    default:           return true;
  }
}

// ── 레이아웃 상수 ──
const CX = GAME_WIDTH / 2;        // 180
const CARD_W = 260;
const CARD_H = 380;
const CARD_CY = 270;               // 캐러셀 카드 세로 중심
const CARD_GAP = 280;              // 좌우 카드 간격 (카드폭 260 + 간격 20)
const PEEK_ALPHA = 0.45;           // 비활성 카드 투명도
const SWIPE_THRESHOLD = 50;        // 스와이프 임계값 (px)
const TWEEN_DURATION = 220;        // 카드 전환 tween 시간 (ms)
const CARD_RADIUS = 12;            // 카드 모서리 라운드

export class ChefSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChefSelectScene' });
  }

  /**
   * @param {{ stageId: string }} data
   */
  create(data) {
    this.stageId = data?.stageId || '1-1';
    this._isEndless = this.stageId === 'endless';
    const stageData = this._isEndless ? null : STAGES[this.stageId];
    const stageName = this._isEndless
      ? '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC'
      : (stageData?.nameKo || this.stageId);

    // ── 씬 전환 fadeIn ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Phase 60-19: 배경 rect → NineSliceFactory.panel 'dark' + setTint
    NineSliceFactory.panel(this, CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark')
      .setTint(0x0d0d1a);

    // ── 타이틀 ──
    this.add.text(CX, 18, '\uC170\uD504\uB97C \uC120\uD0DD\uD558\uC138\uC694', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── 서브타이틀 ──
    const subTitle = this._isEndless
      ? `${stageName}`
      : `\uC2A4\uD14C\uC774\uC9C0: ${this.stageId} ${stageName}`;
    this.add.text(CX, 37, subTitle, {
      fontSize: '11px', color: this._isEndless ? '#cc88ff' : '#aaaaaa',
    }).setOrigin(0.5);

    // ── 세이브 로드 & 셰프 데이터 준비 ──
    this._save = SaveManager.load();
    this._chefList = CHEF_ORDER.map(id => ({
      chef: CHEF_TYPES[id],
      locked: isChefLocked(id, this._save),
    }));

    // ── 초기 인덱스 결정 (이전 선택 셰프 → 0) ──
    const previousChef = ChefManager.getSelectedChef();
    this._currentIndex = 0;
    if (previousChef) {
      const idx = CHEF_ORDER.indexOf(previousChef);
      if (idx >= 0) this._currentIndex = idx;
    }

    // ── 캐러셀 카드 구축 ──
    this._buildCarouselCards();

    // ── 화살표 버튼 ──
    this._buildArrowButtons();

    // ── 선택 버튼 ──
    this._buildSelectButton();

    // ── 하단 컨트롤 ──
    this._buildBottomControls();

    // ── 스와이프 이벤트 ──
    this._setupSwipe();

    // ── 초기 위치 설정 (애니메이션 없이) ──
    this._goToIndex(this._currentIndex, false);
  }

  // ── 하드웨어 백버튼 (Phase 12) ──

  /**
   * 하드웨어 뒤로가기 핸들러.
   * 엔드리스 모드에서는 메뉴로, 일반 모드에서는 월드맵으로 복귀한다.
   */
  _onBack() {
    if (this._transitioning) return;
    this._transitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(this._isEndless ? 'MenuScene' : 'WorldMapScene');
    });
  }

  // ── 캐러셀 카드 빌드 ──

  /**
   * 7종 셰프 카드 Container 배열을 생성한다.
   * @private
   */
  _buildCarouselCards() {
    /** @type {Phaser.GameObjects.Container[]} */
    this._cards = [];

    for (let i = 0; i < this._chefList.length; i++) {
      const { chef, locked } = this._chefList[i];
      const card = this._buildCard(chef, locked);
      // 카드는 중앙 기준으로 배치, _goToIndex에서 x 위치를 조정
      card.setPosition(CX, CARD_CY);
      this.add.existing(card);
      this._cards.push(card);
    }
  }

  /**
   * 단일 셰프 카드 Container를 생성한다.
   * @param {object} chef - CHEF_TYPES 항목
   * @param {boolean} isLocked - 잠금 여부
   * @returns {Phaser.GameObjects.Container}
   * @private
   */
  _buildCard(chef, isLocked) {
    const container = this.add.container(0, 0);

    // ── 셰프 색상 → CSS hex ──
    const r = (chef.color >> 16) & 0xff;
    const g = (chef.color >> 8) & 0xff;
    const b = chef.color & 0xff;
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    // ── 카드 배경 (roundedRect) ──
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a2e, 1);
    bgGraphics.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, CARD_RADIUS);
    bgGraphics.lineStyle(2, isLocked ? 0x333333 : chef.color, 1);
    bgGraphics.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, CARD_RADIUS);
    container.add(bgGraphics);

    // ── Portrait / 스프라이트 / 이모지 (y = -95, 카드 상단 여백 확보) ──
    const portraitY = -95;
    const portraitKey = CHEF_PORTRAIT_MAP[chef.id];
    const chefSpriteKey = `chef_${chef.id}`;

    if (portraitKey && SpriteLoader.hasTexture(this, portraitKey)) {
      // portrait 이미지 120x120px 표시
      const portrait = this.add.image(0, portraitY, portraitKey);
      const targetSize = 120;
      const scaleX = targetSize / portrait.width;
      const scaleY = targetSize / portrait.height;
      const scale = Math.min(scaleX, scaleY);
      portrait.setScale(scale);
      if (isLocked) portrait.setAlpha(0.3);
      container.add(portrait);
    } else if (SpriteLoader.hasTexture(this, chefSpriteKey)) {
      // 스프라이트 fallback — 80px 고정 폭
      const sprite = this.add.image(0, portraitY, chefSpriteKey);
      sprite.setScale(80 / sprite.width);
      if (isLocked) sprite.setAlpha(0.3);
      container.add(sprite);
    } else {
      // 이모지 fallback
      const iconText = this.add.text(0, portraitY, chef.icon, {
        fontSize: '64px',
      }).setOrigin(0.5);
      if (isLocked) iconText.setAlpha(0.3);
      container.add(iconText);
    }

    // ── 셰프 이름 (y = -33) ──
    const nameText = this.add.text(0, -33, chef.nameKo, {
      fontSize: '18px', fontStyle: 'bold',
      color: isLocked ? '#555555' : hexColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(nameText);

    // ── 구분선 (y = -15) ──
    const divLine = this.add.graphics();
    divLine.fillStyle(chef.color, isLocked ? 0.2 : 0.4);
    divLine.fillRect(-100, -15, 200, 1);
    container.add(divLine);

    // ── 패시브 라벨 (y = -3) ──
    const passiveLabel = this.add.text(0, -3, '\uD328\uC2DC\uBE0C:', {
      fontSize: '11px', color: isLocked ? '#444444' : '#88cc88',
    }).setOrigin(0.5);
    container.add(passiveLabel);

    // ── 패시브 설명 (y = +15) ──
    const passiveDesc = this.add.text(0, 15, chef.passiveDesc, {
      fontSize: '10px', color: isLocked ? '#444444' : '#aaaaaa',
      wordWrap: { width: 220 }, align: 'center',
    }).setOrigin(0.5, 0);
    container.add(passiveDesc);

    // ── 스킬명 (y = +53) ──
    const skillName = this.add.text(0, 53, chef.skillName, {
      fontSize: '13px', fontStyle: 'bold',
      color: isLocked ? '#444444' : '#ffcc44',
    }).setOrigin(0.5);
    container.add(skillName);

    // ── 스킬 설명 (y = +73) ──
    const skillDesc = this.add.text(0, 73, chef.skillDesc, {
      fontSize: '10px', color: isLocked ? '#444444' : '#cccccc',
      wordWrap: { width: 220 }, align: 'center',
    }).setOrigin(0.5, 0);
    container.add(skillDesc);

    // ── 쿨다운 (y = +97) ──
    const cooldownSec = chef.skillCooldown / 1000;
    const cooldownText = this.add.text(0, 97, `\uCFE8\uB2E4\uC6B4: ${cooldownSec}\uCD08`, {
      fontSize: '10px', color: isLocked ? '#444444' : '#888888',
    }).setOrigin(0.5);
    container.add(cooldownText);

    // ── 잠금 오버레이 ──
    if (isLocked) {
      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.75);
      overlay.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, CARD_RADIUS);
      container.add(overlay);

      const lockIcon = this.add.text(0, -20, '\uD83D\uDD12', {
        fontSize: '48px',
      }).setOrigin(0.5);
      container.add(lockIcon);

      const hintText = chef.unlockHint || '';
      const hint = this.add.text(0, 30, hintText, {
        fontSize: '14px', color: '#aaaaaa',
      }).setOrigin(0.5);
      container.add(hint);
    }

    return container;
  }

  // ── 화살표 버튼 ──

  /**
   * 좌우 화살표 버튼을 생성한다.
   * @private
   */
  _buildArrowButtons() {
    // Phase 60-19: 왼쪽 화살표 rect → NineSliceFactory.raw 'btn_icon_normal' + setTint
    const ARROW_W = 36, ARROW_H = 60;
    const leftBtn = NineSliceFactory.raw(this, 22, CARD_CY, ARROW_W, ARROW_H, 'btn_icon_normal');
    leftBtn.setTint(0x333344).setAlpha(0.8);
    const leftHit = new Phaser.Geom.Rectangle(-ARROW_W / 2, -ARROW_H / 2, ARROW_W, ARROW_H);
    leftBtn.setInteractive(leftHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(22, CARD_CY, '<', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    leftBtn.on('pointerdown', () => {
      const newIdx = this._currentIndex - 1 < 0 ? this._chefList.length - 1 : this._currentIndex - 1;
      this._goToIndex(newIdx, true);
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    leftBtn.on('pointerover', () => { leftBtn.setTexture(NS_KEYS.BTN_ICON_PRESSED); leftBtn.setTint(0x555566); });
    leftBtn.on('pointerout', () => { leftBtn.setTexture(NS_KEYS.BTN_ICON_NORMAL); leftBtn.setTint(0x333344); });

    // Phase 60-19: 오른쪽 화살표 rect → NineSliceFactory.raw 'btn_icon_normal' + setTint
    const rightBtn = NineSliceFactory.raw(this, 338, CARD_CY, ARROW_W, ARROW_H, 'btn_icon_normal');
    rightBtn.setTint(0x333344).setAlpha(0.8);
    const rightHit = new Phaser.Geom.Rectangle(-ARROW_W / 2, -ARROW_H / 2, ARROW_W, ARROW_H);
    rightBtn.setInteractive(rightHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(338, CARD_CY, '>', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    rightBtn.on('pointerdown', () => {
      const newIdx = this._currentIndex + 1 >= this._chefList.length ? 0 : this._currentIndex + 1;
      this._goToIndex(newIdx, true);
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    rightBtn.on('pointerover', () => { rightBtn.setTexture(NS_KEYS.BTN_ICON_PRESSED); rightBtn.setTint(0x555566); });
    rightBtn.on('pointerout', () => { rightBtn.setTexture(NS_KEYS.BTN_ICON_NORMAL); rightBtn.setTint(0x333344); });
  }

  // ── 선택 버튼 ──

  /**
   * "이 셰프로 시작" 버튼을 생성한다.
   * @private
   */
  _buildSelectButton() {
    // Phase 60-19: 선택 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    const SELECT_W = 200, SELECT_H = 40;
    this._selectBtnBg = NineSliceFactory.raw(this, CX, 549, SELECT_W, SELECT_H, 'btn_primary_normal');
    this._selectBtnBg.setTint(0x44cc44);
    const selectHit = new Phaser.Geom.Rectangle(-SELECT_W / 2, -SELECT_H / 2, SELECT_W, SELECT_H);
    this._selectBtnBg.setInteractive(selectHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this._selectBtnText = this.add.text(CX, 549, '\uC774 \uC170\uD504\uB85C \uC2DC\uC791', {
      fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this._selectBtnBg.on('pointerdown', () => {
      const { chef, locked } = this._chefList[this._currentIndex];
      if (locked) return;
      this._startGame(chef.id);
    });
    this._selectBtnBg.on('pointerover', () => {
      const { locked } = this._chefList[this._currentIndex];
      if (!locked) {
        // Phase 60-19: setFillStyle → setTint
        this._selectBtnBg.setTint(0x66ee66);
      }
    });
    this._selectBtnBg.on('pointerout', () => {
      this._updateSelectButton();
    });
  }

  /**
   * 현재 인덱스에 맞게 선택 버튼 상태를 갱신한다.
   * @private
   */
  _updateSelectButton() {
    const { chef, locked } = this._chefList[this._currentIndex];
    if (locked) {
      // Phase 60-19: setFillStyle → setTint
      this._selectBtnBg.setTint(0x333333);
      this._selectBtnText.setColor('#555555');
      this._selectBtnText.setText('\uC7A0\uAE08\uB428');
      this._selectBtnBg.disableInteractive();
    } else {
      // Phase 60-19: setFillStyle → setTint
      this._selectBtnBg.setTint(chef.color);
      this._selectBtnText.setColor('#ffffff');
      this._selectBtnText.setText('\uC774 \uC170\uD504\uB85C \uC2DC\uC791');
      const SELECT_W = 200, SELECT_H = 40;
      const selectHit = new Phaser.Geom.Rectangle(-SELECT_W / 2, -SELECT_H / 2, SELECT_W, SELECT_H);
      this._selectBtnBg.setInteractive(selectHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    }
  }

  // ── 하단 컨트롤 ──

  /**
   * "셰프 없이 시작" 버튼과 "< 뒤로" 버튼을 생성한다.
   * @private
   */
  _buildBottomControls() {
    // Phase 60-19: "셰프 없이 시작" 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    const SKIP_W = 160, SKIP_H = 28;
    const skipBtn = NineSliceFactory.raw(this, 245, 615, SKIP_W, SKIP_H, 'btn_secondary_normal');
    skipBtn.setTint(0x444444);
    const skipHit = new Phaser.Geom.Rectangle(-SKIP_W / 2, -SKIP_H / 2, SKIP_W, SKIP_H);
    skipBtn.setInteractive(skipHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(245, 615, '\uC170\uD504 \uC5C6\uC774 \uC2DC\uC791', {
      fontSize: '11px', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    skipBtn.on('pointerdown', () => {
      this._startGame(null);
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    skipBtn.on('pointerover', () => { skipBtn.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); skipBtn.setTint(0x666666); });
    skipBtn.on('pointerout', () => { skipBtn.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); skipBtn.setTint(0x444444); });

    // Phase 60-19: "< 뒤로" 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    const BACK_W = 80, BACK_H = 28;
    const backBtn = NineSliceFactory.raw(this, 62, 615, BACK_W, BACK_H, 'btn_secondary_normal');
    backBtn.setTint(0x444444);
    const backHit = new Phaser.Geom.Rectangle(-BACK_W / 2, -BACK_H / 2, BACK_W, BACK_H);
    backBtn.setInteractive(backHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(62, 615, '< \uB4A4\uB85C', {
      fontSize: '10px', color: '#cccccc',
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      this._onBack();
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    backBtn.on('pointerover', () => { backBtn.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); backBtn.setTint(0x666666); });
    backBtn.on('pointerout', () => { backBtn.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); backBtn.setTint(0x444444); });
  }

  // ── 스와이프 처리 ──

  /**
   * pointerdown/pointermove/pointerup 이벤트로 스와이프를 구현한다.
   * @private
   */
  _setupSwipe() {
    this._swiping = false;
    this._swipeStartX = 0;
    this._swipeDragOffset = 0;

    this.input.on('pointerdown', (/** @type {Phaser.Input.Pointer} */ pointer) => {
      // tween 중에는 스와이프 시작 억제
      if (this._tweening) return;
      this._swiping = true;
      this._swipeStartX = pointer.x;
      this._swipeDragOffset = 0;
    });

    this.input.on('pointermove', (/** @type {Phaser.Input.Pointer} */ pointer) => {
      if (!this._swiping) return;
      const delta = pointer.x - this._swipeStartX;
      this._swipeDragOffset = delta;
      // 실시간으로 카드 위치를 오프셋만큼 이동
      this._applyCardPositions(delta);
    });

    // pointerup — 캔버스 밖 포인터 해제도 처리
    this.input.on('pointerup', (/** @type {Phaser.Input.Pointer} */ pointer) => {
      if (!this._swiping) return;
      this._swiping = false;
      const delta = this._swipeDragOffset;

      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        // 스와이프 성공: 방향에 따라 인덱스 변경
        let newIdx;
        if (delta > 0) {
          // 오른쪽 스와이프 → 이전 카드
          newIdx = this._currentIndex - 1 < 0 ? this._chefList.length - 1 : this._currentIndex - 1;
        } else {
          // 왼쪽 스와이프 → 다음 카드
          newIdx = this._currentIndex + 1 >= this._chefList.length ? 0 : this._currentIndex + 1;
        }
        this._goToIndex(newIdx, true);
      } else {
        // 스와이프 미달: 원위치 복귀
        this._goToIndex(this._currentIndex, true);
      }
    });
  }

  // ── 카드 위치 관리 ──

  /**
   * 카드들의 위치를 현재 인덱스 기준으로 적용한다 (드래그 오프셋 포함).
   * @param {number} dragOffset - 스와이프 드래그 오프셋 (px)
   * @private
   */
  _applyCardPositions(dragOffset = 0) {
    const total = this._cards.length;
    for (let i = 0; i < total; i++) {
      const card = this._cards[i];
      // 인덱스 차이 계산 (순환 고려)
      let diff = i - this._currentIndex;
      // wrap: -3 ~ +3 범위로 정규화 (7장 기준)
      if (diff > Math.floor(total / 2)) diff -= total;
      if (diff < -Math.floor(total / 2)) diff += total;

      const targetX = CX + diff * CARD_GAP + dragOffset;
      card.setPosition(targetX, CARD_CY);

      // 중앙 카드만 alpha 1, 나머지 peek
      card.setAlpha(diff === 0 ? 1 : PEEK_ALPHA);
      // depth로 중앙 카드를 앞에 표시
      card.setDepth(diff === 0 ? 10 : 5 - Math.abs(diff));
    }
  }

  /**
   * 특정 인덱스로 캐러셀을 이동시킨다.
   * @param {number} idx - 목표 인덱스
   * @param {boolean} animate - tween 애니메이션 사용 여부
   * @private
   */
  _goToIndex(idx, animate) {
    // wrap 처리
    const total = this._chefList.length;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;

    this._currentIndex = idx;

    if (!animate) {
      this._applyCardPositions(0);
      this._updateSelectButton();
      return;
    }

    // tween으로 카드 위치 애니메이션
    this._tweening = true;

    for (let i = 0; i < this._cards.length; i++) {
      const card = this._cards[i];
      let diff = i - this._currentIndex;
      if (diff > Math.floor(total / 2)) diff -= total;
      if (diff < -Math.floor(total / 2)) diff += total;

      const targetX = CX + diff * CARD_GAP;
      const targetAlpha = diff === 0 ? 1 : PEEK_ALPHA;
      const targetDepth = diff === 0 ? 10 : 5 - Math.abs(diff);

      card.setDepth(targetDepth);

      this.tweens.add({
        targets: card,
        x: targetX,
        alpha: targetAlpha,
        duration: TWEEN_DURATION,
        ease: 'Power2',
        onComplete: i === this._currentIndex ? () => {
          this._tweening = false;
          this._updateSelectButton();
        } : undefined,
      });
    }
  }

  // ── 게임 시작 ──

  /**
   * 게임 시작 (셰프 선택 후).
   * @param {string|null} chefId - 선택한 셰프 ID (null이면 셰프 없이 시작)
   * @private
   */
  _startGame(chefId) {
    // 중복 호출 방지 (더블클릭, 연타 등)
    if (this._transitioning) return;
    this._transitioning = true;

    if (chefId) {
      ChefManager.selectChef(chefId);
    } else {
      // 셰프 없이 시작: 세이브의 selectedChef를 null로 설정
      const saveData = SaveManager.load();
      saveData.selectedChef = null;
      SaveManager.save(saveData);
    }

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Phase 11-1: 엔드리스 모드 분기
      // Phase 13-3: 캠페인은 GatheringScene으로 전환 (MarketScene -> GatheringScene)
      const targetScene = this._isEndless ? 'EndlessScene' : 'GatheringScene';
      const targetStageId = this._isEndless ? '1-1' : this.stageId;
      this.scene.start(targetScene, { stageId: targetStageId });
    });
  }
}
