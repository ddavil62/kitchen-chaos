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
 * Phase 84: 미미 스킨 선택 서브 패널 추가 (썸네일 3종, 장착/미보유 표시, IAP 구매 팝업).
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
import { isChefUnlocked } from '../data/chefUnlockHelper.js';
import { SkinManager } from '../managers/SkinManager.js';
import { IAPManager } from '../managers/IAPManager.js';

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
 * 세이브 데이터에서 `chefUnlockHelper`가 요구하는 progressState 구조체를 추출한다.
 * @param {object} save - SaveManager.load() 결과
 * @returns {{ currentChapter: number, season2Unlocked: boolean, season3Unlocked: boolean }}
 */
function toProgressState(save) {
  return {
    currentChapter:  save?.storyProgress?.currentChapter || 1,
    season2Unlocked: !!save?.season2Unlocked,
    season3Unlocked: !!save?.season3Unlocked,
  };
}

// ── 레이아웃 상수 ──
const CX = GAME_WIDTH / 2;        // 180
const CARD_W = 260;
const CARD_H = 300;           // Phase 92b: 텍스트 확대+카드 압축 시안 (380→340→300)
const CARD_CY = 257;               // 캐러셀 카드 세로 중심 (Phase 92b: 270→257)
const CARD_GAP = 280;              // 좌우 카드 간격 (카드폭 260 + 간격 20)
const PEEK_ALPHA = 0.45;           // 비활성 카드 투명도
const SWIPE_THRESHOLD = 50;        // 스와이프 임계값 (px)
const TWEEN_DURATION = 220;        // 카드 전환 tween 시간 (ms)
const CARD_RADIUS = 12;            // 카드 모서리 라운드

// ── Phase 84: 스킨 패널 레이아웃 상수 ──
// Phase 92b: 카드 압축(bottom 440→407)에 맞춰 스킨패널+버튼 일괄 상향
const SKIN_PANEL_Y = 415;          // 스킨 패널 상단 y (465→415)
const SKIN_PANEL_H = 85;           // 스킨 패널 높이 (90→85)
const SKIN_THUMB_Y = 452;          // 썸네일 중심 y (502→452)
const SKIN_NAME_Y = 492;           // 스킨 이름 텍스트 y (542→492)
const SKIN_THUMB_XS = [100, 180, 260]; // 썸네일 x 좌표 배열
const SKIN_THUMB_SIZE = 48;        // 썸네일 표시 크기 (px)
const SELECT_BTN_Y_DEFAULT = 530;  // 선택 버튼 기본 y (비미미 카드)
const SELECT_BTN_Y_SKIN = 525;     // 미미 카드 포커스 시 선택 버튼 y (580→525)

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
    // Phase 75: isChefLocked 로컬 함수 제거 후 chefUnlockHelper.isChefUnlocked 재사용
    const progressState = toProgressState(this._save);
    this._chefList = CHEF_ORDER.map(id => ({
      chef: CHEF_TYPES[id],
      locked: !isChefUnlocked(id, progressState),
    }));

    // ── 초기 인덱스 결정 (Phase 69 P1-2: lastSelectedChef 우선, fallback 미미) ──
    // 디렉터 플레이테스트에서 "첫 카드가 미미가 아닌 메이지로 표시" 회귀가 관찰되어
    // 방어적 폴백을 명시화. 잘못된 ID가 세이브에 남아있거나 CHEF_ORDER가 재편될 때도
    // 주인공 미미로 안전 복귀한다.
    const DEFAULT_CHEF_ID = 'mimi_chef';
    const defaultIdx = CHEF_ORDER.indexOf(DEFAULT_CHEF_ID);
    this._currentIndex = defaultIdx >= 0 ? defaultIdx : 0;
    const previousChef = ChefManager.getSelectedChef();
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

    // ── Phase 84: 스킨 서브 패널 빌드 (초기 hidden) ──
    this._buildSkinPanel();

    // ── 스와이프 이벤트 ──
    this._setupSwipe();

    // ── 씬 진입 시 이미 장착된 스킨을 카드 portrait에 적용 ──
    CHEF_ORDER.forEach((chefId) => {
      if (chefId === 'mimi_chef') {
        this._refreshCardPortrait(chefId);
      }
    });

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
    /** @type {(Phaser.GameObjects.Image|null)[]} Phase 84: portrait 이미지 참조 배열 */
    this._portraitImages = [];

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

    // ── Portrait / 스프라이트 / 이모지 (y = -80, Phase 92b: 카드 압축에 맞춰 상향) ──
    const portraitY = -80;
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
      // Phase 84: portrait 참조 저장
      this._portraitImages.push(portrait);
    } else if (SpriteLoader.hasTexture(this, chefSpriteKey)) {
      // 스프라이트 fallback — 80px 고정 폭
      const sprite = this.add.image(0, portraitY, chefSpriteKey);
      sprite.setScale(80 / sprite.width);
      if (isLocked) sprite.setAlpha(0.3);
      container.add(sprite);
      // Phase 84: 스프라이트 fallback은 portrait 교체 불가이므로 null
      this._portraitImages.push(null);
    } else {
      // 이모지 fallback
      const iconText = this.add.text(0, portraitY, chef.icon, {
        fontSize: '64px',
      }).setOrigin(0.5);
      if (isLocked) iconText.setAlpha(0.3);
      container.add(iconText);
      // Phase 84: 이모지 fallback은 portrait 교체 불가이므로 null
      this._portraitImages.push(null);
    }

    // ── 셰프 이름 (y = +4, Phase 92b: 카드 압축 재배치) ──
    const nameText = this.add.text(0, 4, chef.nameKo, {
      fontSize: '20px', fontStyle: 'bold',
      color: isLocked ? '#555555' : hexColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(nameText);

    // ── 구분선 (y = +22, Phase 92b) ──
    const divLine = this.add.graphics();
    divLine.fillStyle(chef.color, isLocked ? 0.2 : 0.4);
    divLine.fillRect(-100, 22, 200, 1);
    container.add(divLine);

    // ── 패시브 라벨 (y = +32, Phase 92b) ──
    const passiveLabel = this.add.text(0, 32, '\uD328\uC2DC\uBE0C:', {
      fontSize: '11px', color: isLocked ? '#444444' : '#88cc88',
    }).setOrigin(0.5);
    container.add(passiveLabel);

    // ── 패시브 설명 (y = +44, Phase 92b) ──
    const passiveDesc = this.add.text(0, 44, chef.passiveDesc, {
      fontSize: '11px', color: isLocked ? '#444444' : '#cccccc',  // Phase 92: 10px→11px, #aaaaaa→#cccccc 가독성
      wordWrap: { width: 220 }, align: 'center',
    }).setOrigin(0.5, 0);
    container.add(passiveDesc);

    // ── 스킬명 (y = +85, Phase 92b) ──
    const skillName = this.add.text(0, 85, chef.skillName, {
      fontSize: '14px', fontStyle: 'bold',
      color: isLocked ? '#444444' : '#ffcc44',
    }).setOrigin(0.5);
    container.add(skillName);

    // ── 스킬 설명 (y = +100, Phase 92b) ──
    const skillDesc = this.add.text(0, 100, chef.skillDesc, {
      fontSize: '12px', color: isLocked ? '#444444' : '#cccccc',
      wordWrap: { width: 220 }, align: 'center',
    }).setOrigin(0.5, 0);
    container.add(skillDesc);

    // ── 쿨다운 (y = +135, Phase 92b) ──
    const cooldownSec = chef.skillCooldown / 1000;
    const cooldownText = this.add.text(0, 135, `\uCFE8\uB2E4\uC6B4: ${cooldownSec}\uCD08`, {
      fontSize: '10px', color: isLocked ? '#444444' : '#aaaaaa',  // Phase 92: #888888→#aaaaaa 대비 개선
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
    // Phase 90-C (C-1): 터치 타깃 확대 (36x60 → 44x64, fontSize 22→24)
    const ARROW_W = 44, ARROW_H = 64;
    const leftBtn = NineSliceFactory.raw(this, 22, CARD_CY, ARROW_W, ARROW_H, 'btn_icon_normal');
    leftBtn.setTint(0x445566).setAlpha(0.9);  // Phase 92: tint 0x333344→0x445566, alpha 0.8→0.9
    const leftHit = new Phaser.Geom.Rectangle(-ARROW_W / 2, -ARROW_H / 2, ARROW_W, ARROW_H);
    leftBtn.setInteractive(leftHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(22, CARD_CY, '<', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    leftBtn.on('pointerdown', () => {
      const newIdx = this._currentIndex - 1 < 0 ? this._chefList.length - 1 : this._currentIndex - 1;
      this._goToIndex(newIdx, true);
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    leftBtn.on('pointerover', () => { leftBtn.setTexture(NS_KEYS.BTN_ICON_PRESSED); leftBtn.setTint(0x555566); });
    leftBtn.on('pointerout', () => { leftBtn.setTexture(NS_KEYS.BTN_ICON_NORMAL); leftBtn.setTint(0x445566); });

    // Phase 60-19: 오른쪽 화살표 rect → NineSliceFactory.raw 'btn_icon_normal' + setTint
    // Phase 90-C (C-1): 터치 타깃 확대 (ARROW_W/H 재사용, fontSize 24px)
    const rightBtn = NineSliceFactory.raw(this, 338, CARD_CY, ARROW_W, ARROW_H, 'btn_icon_normal');
    rightBtn.setTint(0x445566).setAlpha(0.9);  // Phase 92: tint 0x333344→0x445566, alpha 0.8→0.9
    const rightHit = new Phaser.Geom.Rectangle(-ARROW_W / 2, -ARROW_H / 2, ARROW_W, ARROW_H);
    rightBtn.setInteractive(rightHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(338, CARD_CY, '>', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    rightBtn.on('pointerdown', () => {
      const newIdx = this._currentIndex + 1 >= this._chefList.length ? 0 : this._currentIndex + 1;
      this._goToIndex(newIdx, true);
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    rightBtn.on('pointerover', () => { rightBtn.setTexture(NS_KEYS.BTN_ICON_PRESSED); rightBtn.setTint(0x555566); });
    rightBtn.on('pointerout', () => { rightBtn.setTexture(NS_KEYS.BTN_ICON_NORMAL); rightBtn.setTint(0x445566); });
  }

  // ── 선택 버튼 ──

  /**
   * "이 셰프로 시작" 버튼을 생성한다.
   * @private
   */
  _buildSelectButton() {
    // Phase 60-19: 선택 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    const SELECT_W = 200, SELECT_H = 40;
    this._selectBtnBg = NineSliceFactory.raw(this, CX, SELECT_BTN_Y_DEFAULT, SELECT_W, SELECT_H, 'btn_primary_normal');
    this._selectBtnBg.setTint(0x44cc44);
    const selectHit = new Phaser.Geom.Rectangle(-SELECT_W / 2, -SELECT_H / 2, SELECT_W, SELECT_H);
    this._selectBtnBg.setInteractive(selectHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this._selectBtnText = this.add.text(CX, SELECT_BTN_Y_DEFAULT, '\uC774 \uC170\uD504\uB85C \uC2DC\uC791', {
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

  /**
   * 선택 버튼의 y 좌표를 즉시 이동한다.
   * @param {number} y - 목표 y 좌표
   * @private
   */
  _moveSkinSelectButton(y) {
    this._selectBtnBg.setY(y);
    this._selectBtnText.setY(y);
  }

  // ── 하단 컨트롤 ──

  /**
   * "셰프 없이 시작" 버튼과 "< 뒤로" 버튼을 생성한다.
   * @private
   */
  _buildBottomControls() {
    // Phase 60-19: "셰프 없이 시작" 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    // Phase 62: tint 0x444444 → 0x888888 (플레이스홀더 인지 해소), 텍스트도 승격
    // Phase 91: skipBtn Y 615 → 610 — 하단 버튼 겹침 해소
    const SKIP_W = 160, SKIP_H = 36;
    const skipBtn = NineSliceFactory.raw(this, 245, 578, SKIP_W, SKIP_H, 'btn_secondary_normal');  // Phase 92b: 610→578
    skipBtn.setTint(0x888888);
    const skipHit = new Phaser.Geom.Rectangle(-SKIP_W / 2, -SKIP_H / 2, SKIP_W, SKIP_H);
    skipBtn.setInteractive(skipHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(245, 578, '\uC170\uD504 \uC5C6\uC774 \uC2DC\uC791', {
      fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    skipBtn.on('pointerdown', () => {
      this._startGame(null);
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    skipBtn.on('pointerover', () => { skipBtn.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); skipBtn.setTint(0xaaaaaa); });
    skipBtn.on('pointerout', () => { skipBtn.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); skipBtn.setTint(0x888888); });

    // Phase 60-19: "< 뒤로" 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    // Phase 62: tint 0x444444 → 0x888888, 텍스트 10px → 13px + #ffffff + 그림자
    // Phase 91: backBtn Y 615 → 610 — 하단 버튼 겹침 해소
    const BACK_W = 84, BACK_H = 36;
    const backBtn = NineSliceFactory.raw(this, 62, 578, BACK_W, BACK_H, 'btn_secondary_normal');  // Phase 92b: 610→578
    backBtn.setTint(0x888888);
    const backHit = new Phaser.Geom.Rectangle(-BACK_W / 2, -BACK_H / 2, BACK_W, BACK_H);
    backBtn.setInteractive(backHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(62, 578, '\u2039 \uB4A4\uB85C', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      this._onBack();
    });
    // Phase 60-19: setFillStyle → setTexture + setTint
    backBtn.on('pointerover', () => { backBtn.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); backBtn.setTint(0xaaaaaa); });
    backBtn.on('pointerout', () => { backBtn.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); backBtn.setTint(0x888888); });
  }

  // ── Phase 84: 스킨 서브 패널 ──

  /**
   * 미미 스킨 선택 서브 패널을 생성한다 (초기 hidden).
   * 씬 절대 좌표 기준으로 배치하며 depth=20으로 카드 위에 표시한다.
   * @private
   */
  _buildSkinPanel() {
    this._skinPanel = this.add.container(0, 0);
    this._skinPanel.setDepth(20);

    // ── 배경 패널: 반투명 둥근 사각형 ──
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x111122, 0.85);
    panelBg.fillRoundedRect(CX - 150, SKIN_PANEL_Y, 300, SKIN_PANEL_H, 8);
    panelBg.lineStyle(1, 0x444466, 0.6);
    panelBg.strokeRoundedRect(CX - 150, SKIN_PANEL_Y, 300, SKIN_PANEL_H, 8);
    this._skinPanel.add(panelBg);

    // ── 스킨 항목 배열 ──
    const skins = SkinManager.getSkinsForChef('mimi_chef');
    /** @type {Array<{ thumb: Phaser.GameObjects.Image|null, selectBorder: Phaser.GameObjects.Graphics, lockOverlay: Phaser.GameObjects.Text, priceText: Phaser.GameObjects.Text, nameText: Phaser.GameObjects.Text, skinDef: object }>} */
    this._skinItems = [];

    skins.forEach((skin, i) => {
      const x = SKIN_THUMB_XS[i];

      // ── 썸네일 이미지 ──
      let thumb = null;
      if (SpriteLoader.hasTexture(this, skin.portraitKey)) {
        thumb = this.add.image(x, SKIN_THUMB_Y, skin.portraitKey);
        const scale = SKIN_THUMB_SIZE / Math.max(thumb.width, thumb.height);
        thumb.setScale(scale);
        this._skinPanel.add(thumb);
      } else {
        // 텍스처 없을 경우 플레이스홀더 사각형
        const ph = this.add.graphics();
        ph.fillStyle(0x333355, 1);
        ph.fillRect(x - SKIN_THUMB_SIZE / 2, SKIN_THUMB_Y - SKIN_THUMB_SIZE / 2, SKIN_THUMB_SIZE, SKIN_THUMB_SIZE);
        this._skinPanel.add(ph);
      }

      // ── 장착 테두리 (노란색 2px stroke) ──
      const selectBorder = this.add.graphics();
      selectBorder.lineStyle(2, 0xffcc00, 1);
      selectBorder.strokeRect(
        x - SKIN_THUMB_SIZE / 2 - 2,
        SKIN_THUMB_Y - SKIN_THUMB_SIZE / 2 - 2,
        SKIN_THUMB_SIZE + 4,
        SKIN_THUMB_SIZE + 4
      );
      selectBorder.setVisible(false);
      this._skinPanel.add(selectBorder);

      // ── 자물쇠 오버레이 (미보유 시) ──
      const lockOverlay = this.add.text(x, SKIN_THUMB_Y, '\uD83D\uDD12', {
        fontSize: '22px',
      }).setOrigin(0.5);
      lockOverlay.setVisible(false);
      this._skinPanel.add(lockOverlay);

      // ── 가격 텍스트 (미보유 시) ──
      const priceText = this.add.text(x, SKIN_THUMB_Y + 18, `\u20A9${skin.price.toLocaleString()}`, {
        fontSize: '11px', color: '#ffaa44',  // Phase 92: 9px→11px 가독성
      }).setOrigin(0.5);
      priceText.setVisible(false);
      this._skinPanel.add(priceText);

      // ── 스킨 이름 텍스트 ──
      const nameText = this.add.text(x, SKIN_NAME_Y, skin.nameKo, {
        fontSize: '10px', color: '#cccccc',
      }).setOrigin(0.5);
      this._skinPanel.add(nameText);

      // ── 탭 히트 영역 ──
      const hitZone = this.add.zone(x, SKIN_THUMB_Y, SKIN_THUMB_SIZE + 8, SKIN_THUMB_SIZE + 24)
        .setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        this._onSkinTap('mimi_chef', skin);
      });
      this._skinPanel.add(hitZone);

      this._skinItems.push({
        thumb,
        selectBorder,
        lockOverlay,
        priceText,
        nameText,
        skinDef: skin,
      });
    });

    this._skinPanel.setVisible(false);
  }

  /**
   * 스킨 패널의 보유/장착 상태를 갱신한다.
   * @private
   */
  _refreshSkinPanel() {
    if (!this._skinItems) return;
    const equippedId = SkinManager.getEquippedSkin('mimi_chef');

    this._skinItems.forEach((item) => {
      const owned = SkinManager.isSkinOwned('mimi_chef', item.skinDef.id);
      const equipped = item.skinDef.id === equippedId;

      // 장착 테두리
      item.selectBorder.setVisible(equipped);

      // 자물쇠 + 가격
      if (item.skinDef.unlockType === 'iap' && !owned) {
        item.lockOverlay.setVisible(true);
        item.priceText.setVisible(true);
        if (item.thumb) item.thumb.setAlpha(0.4);
      } else {
        item.lockOverlay.setVisible(false);
        item.priceText.setVisible(false);
        if (item.thumb) item.thumb.setAlpha(1);
      }

      // 이름 색상: 장착 시 노란색, 보유 시 흰색, 미보유 시 회색
      if (equipped) {
        item.nameText.setColor('#ffcc00');
      } else if (owned) {
        item.nameText.setColor('#cccccc');
      } else {
        item.nameText.setColor('#777777');
      }
    });
  }

  /**
   * 스킨 썸네일 탭 핸들러.
   * 보유 스킨이면 장착, 미보유 스킨이면 구매 팝업을 표시한다.
   * @param {string} chefId - 셰프 ID
   * @param {object} skin - 스킨 정의 객체
   * @private
   */
  _onSkinTap(chefId, skin) {
    const owned = SkinManager.isSkinOwned(chefId, skin.id);
    if (owned) {
      SkinManager.equipSkin(chefId, skin.id);
      this._refreshSkinPanel();
      this._refreshCardPortrait(chefId);
    } else {
      this._showPurchasePopup(chefId, skin);
    }
  }

  /**
   * 카드의 portrait 이미지를 현재 장착 스킨에 맞게 교체한다.
   * @param {string} chefId - 셰프 ID
   * @private
   */
  _refreshCardPortrait(chefId) {
    const idx = CHEF_ORDER.indexOf(chefId);
    if (idx < 0) return;
    const portraitImg = this._portraitImages?.[idx];
    if (!portraitImg) return;

    const equippedSkinId = SkinManager.getEquippedSkin(chefId);
    const skins = SkinManager.getSkinsForChef(chefId);
    const skinDef = skins.find(s => s.id === equippedSkinId) || skins[0];
    if (!skinDef) return;

    // 텍스처 교체 후 스케일 재계산
    if (SpriteLoader.hasTexture(this, skinDef.portraitKey)) {
      portraitImg.setTexture(skinDef.portraitKey);
      const targetSize = 120;
      const scaleX = targetSize / portraitImg.width;
      const scaleY = targetSize / portraitImg.height;
      portraitImg.setScale(Math.min(scaleX, scaleY));
    }
  }

  /**
   * 스킨 구매 확인 팝업을 표시한다.
   * @param {string} chefId - 셰프 ID
   * @param {object} skin - 스킨 정의 객체
   * @private
   */
  _showPurchasePopup(chefId, skin) {
    // 기존 팝업이 있으면 제거
    if (this._purchasePopup) {
      this._purchasePopup.destroy();
      this._purchasePopup = null;
    }

    const popup = this.add.container(0, 0);
    popup.setDepth(100);

    // ── 딤드 오버레이 ──
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.6);
    dim.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
    popup.add(dim);

    // ── 팝업 박스 ──
    const boxW = 260, boxH = 140;
    const boxX = CX, boxY = 320;
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x1a1a2e, 1);
    boxBg.fillRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 10);
    boxBg.lineStyle(2, 0x555577, 1);
    boxBg.strokeRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 10);
    popup.add(boxBg);

    // ── 스킨 이름 ──
    const titleText = this.add.text(boxX, boxY - 40, skin.nameKo, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    popup.add(titleText);

    // ── 가격 표시 ──
    const priceStr = `\uAC00\uACA9: \u20A9${skin.price.toLocaleString()}`;
    const priceLabel = this.add.text(boxX, boxY - 15, priceStr, {
      fontSize: '13px', color: '#ffaa44',
    }).setOrigin(0.5);
    popup.add(priceLabel);

    // ── 구매 버튼 ──
    const BUY_W = 90, BUY_H = 34;
    const buyBtn = this.add.graphics();
    buyBtn.fillStyle(0x44cc44, 1);
    buyBtn.fillRoundedRect(boxX - 70 - BUY_W / 2, boxY + 20 - BUY_H / 2, BUY_W, BUY_H, 6);
    popup.add(buyBtn);
    const buyText = this.add.text(boxX - 70, boxY + 20, '\uAD6C\uB9E4', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    popup.add(buyText);
    const buyZone = this.add.zone(boxX - 70, boxY + 20, BUY_W, BUY_H)
      .setInteractive({ useHandCursor: true });
    buyZone.on('pointerdown', async () => {
      await IAPManager.purchaseSkin(chefId, skin.id);
      this._refreshSkinPanel();
      this._refreshCardPortrait(chefId);
      if (this._purchasePopup) {
        this._purchasePopup.destroy();
        this._purchasePopup = null;
      }
    });
    popup.add(buyZone);

    // ── 취소 버튼 ──
    const CANCEL_W = 90, CANCEL_H = 34;
    const cancelBtn = this.add.graphics();
    cancelBtn.fillStyle(0x555555, 1);
    cancelBtn.fillRoundedRect(boxX + 70 - CANCEL_W / 2, boxY + 20 - CANCEL_H / 2, CANCEL_W, CANCEL_H, 6);
    popup.add(cancelBtn);
    const cancelText = this.add.text(boxX + 70, boxY + 20, '\uCDE8\uC18C', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    popup.add(cancelText);
    const cancelZone = this.add.zone(boxX + 70, boxY + 20, CANCEL_W, CANCEL_H)
      .setInteractive({ useHandCursor: true });
    cancelZone.on('pointerdown', () => {
      if (this._purchasePopup) {
        this._purchasePopup.destroy();
        this._purchasePopup = null;
      }
    });
    popup.add(cancelZone);

    this._purchasePopup = popup;
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
      this._updateSkinPanelVisibility();
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
          this._updateSkinPanelVisibility();
        } : undefined,
      });
    }
  }

  /**
   * 현재 포커스된 셰프에 따라 스킨 패널 가시성과 선택 버튼 y를 갱신한다.
   * @private
   */
  _updateSkinPanelVisibility() {
    if (!this._skinPanel) return;
    const currentChefId = this._chefList[this._currentIndex]?.chef?.id;
    if (currentChefId === 'mimi_chef') {
      this._skinPanel.setVisible(true);
      this._refreshSkinPanel();
      this._moveSkinSelectButton(SELECT_BTN_Y_SKIN);
    } else {
      this._skinPanel.setVisible(false);
      this._moveSkinSelectButton(SELECT_BTN_Y_DEFAULT);
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
