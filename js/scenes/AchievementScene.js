/**
 * @fileoverview 업적 씬.
 * Phase 42: 카테고리 탭 + 스크롤 목록 UI로 업적 달성 현황을 표시한다.
 *
 * 레이아웃:
 *   0~50    상단 바 (타이틀 "업적", 코인/골드 잔액)
 *   50~100  카테고리 탭 5개 (스토리/전투/수집/경제/엔드리스)
 *   100~590 콘텐츠 영역 — 스크롤 가능 업적 카드 목록
 *   590~640 하단 돌아가기 버튼
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { ACHIEVEMENT_CATEGORIES } from '../data/achievementData.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ToolManager } from '../managers/ToolManager.js';

// ── 상수 ──
const TAB_Y = 75;
const CONTENT_TOP = 100;
const CONTENT_BOTTOM = 590;
const CONTENT_HEIGHT = CONTENT_BOTTOM - CONTENT_TOP;
const CARD_HEIGHT = 70;
const CARD_GAP = 8;
const CARD_TOTAL = CARD_HEIGHT + CARD_GAP;

export class AchievementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementScene' });
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    /** @type {string} 현재 활성 탭 카테고리 */
    this._activeTab = 'story';
    /** @type {Phaser.GameObjects.Container|null} 콘텐츠 컨테이너 */
    this._contentContainer = null;
    /** @type {number} 스크롤 오프셋 */
    this._scrollY = 0;
    /** @type {number|null} 드래그 시작 Y */
    this._dragStartY = null;
    /** @type {number} 드래그 시작 시 스크롤 오프셋 */
    this._dragStartScrollY = 0;

    // Phase 60-19: 배경 rect → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');

    // ── 상단 바 ──
    this.add.text(20, 25, '\uD83C\uDFC6 \uC5C5\uC801', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#8b4500', strokeThickness: 4,
    }).setOrigin(0, 0.5);

    this._coinText = this.add.text(GAME_WIDTH - 20, 18, '', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0.5);

    this._goldText = this.add.text(GAME_WIDTH - 20, 35, '', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0.5);

    this._updateBalanceDisplay();

    // ── 카테고리 탭 ──
    this._createTabs();

    // ── 콘텐츠 영역 마스크 ──
    // Phaser Canvas 모드에서는 Graphics.createGeometryMask를 사용
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRect(0, CONTENT_TOP, GAME_WIDTH, CONTENT_HEIGHT);
    this._contentMask = maskShape.createGeometryMask();

    // ── 콘텐츠 렌더링 ──
    this._renderContent();

    // ── 스크롤 입력 ──
    this._setupScrollInput();

    // Phase 60-19: 돌아가기 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    // Phase 62: tint 0x444444 → 0x888888, 텍스트 #cccccc → #ffffff+bold
    const BACK_W = 180;
    const BACK_H = 40;
    const backBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2, GAME_HEIGHT - 25, BACK_W, BACK_H, 'btn_secondary_normal');
    backBtn.setTint(0x888888).setDepth(10);
    const backHit = new Phaser.Geom.Rectangle(-BACK_W / 2, -BACK_H / 2, BACK_W, BACK_H);
    backBtn.setInteractive(backHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 25, '\uB3CC\uC544\uAC00\uAE30', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);
    backBtn.on('pointerdown', () => this._fadeToScene('MenuScene'));
    // Phase 60-19: setFillStyle → setTexture + setTint
    backBtn.on('pointerover', () => { backBtn.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); backBtn.setTint(0xaaaaaa); });
    backBtn.on('pointerout', () => { backBtn.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); backBtn.setTint(0x888888); });
  }

  // ── 잔액 표시 ──

  /** 코인/골드 잔액 갱신 */
  _updateBalanceDisplay() {
    this._coinText.setText(`\uD83E\uDE99 ${SaveManager.getCoins()}`);
    this._goldText.setText(`\uD83D\uDCB0 ${SaveManager.getGold()}`);
  }

  // ── 탭 ──

  /** 카테고리 탭 5개 생성 */
  _createTabs() {
    this._tabBgs = {};
    this._tabTexts = {};

    const tabCount = ACHIEVEMENT_CATEGORIES.length;
    const tabW = Math.floor((GAME_WIDTH - 10) / tabCount);

    ACHIEVEMENT_CATEGORIES.forEach((cat, i) => {
      const x = 5 + i * tabW;
      const w = tabW - 2;

      // Phase 60-19: 탭 배경 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
      const bg = NineSliceFactory.raw(this, x + w / 2, TAB_Y, w, 36, 'btn_secondary_normal');
      bg.setTint(0x333333);
      const bgHit = new Phaser.Geom.Rectangle(-w / 2, -18, w, 36);
      bg.setInteractive(bgHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      const txt = this.add.text(x + w / 2, TAB_Y, cat.labelKo, {
        fontSize: '11px', fontStyle: 'bold', color: '#aaaaaa',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        this._activeTab = cat.id;
        this._scrollY = 0;
        this._updateTabHighlight();
        this._renderContent();
      });
      // Phase 60-19: setFillStyle → setTint
      bg.on('pointerover', () => {
        if (cat.id !== this._activeTab) bg.setTint(0x444444);
      });
      bg.on('pointerout', () => {
        bg.setTint(cat.id === this._activeTab ? 0xff6b35 : 0x333333);
      });

      this._tabBgs[cat.id] = bg;
      this._tabTexts[cat.id] = txt;
    });

    this._updateTabHighlight();
  }

  /** 활성 탭 하이라이트 갱신 */
  _updateTabHighlight() {
    for (const cat of ACHIEVEMENT_CATEGORIES) {
      const isActive = cat.id === this._activeTab;
      // Phase 60-19: setFillStyle → setTint
      this._tabBgs[cat.id].setTint(isActive ? 0xff6b35 : 0x333333);
      this._tabTexts[cat.id].setColor(isActive ? '#ffffff' : '#aaaaaa');
    }
  }

  // ── 콘텐츠 렌더링 ──

  /** 현재 활성 탭의 업적 카드 목록을 렌더링한다 */
  _renderContent() {
    if (this._contentContainer) {
      this._contentContainer.destroy();
      this._contentContainer = null;
    }

    const container = this.add.container(0, CONTENT_TOP);
    container.setMask(this._contentMask);
    this._contentContainer = container;

    const allProgress = AchievementManager.getProgress();
    const items = allProgress.filter(a => a.category === this._activeTab);

    items.forEach((item, i) => {
      const cardY = i * CARD_TOTAL + 4;
      this._renderCard(container, item, cardY);
    });

    // 총 콘텐츠 높이 계산 (스크롤 범위)
    this._totalContentHeight = items.length * CARD_TOTAL;
    this._maxScrollY = Math.max(0, this._totalContentHeight - CONTENT_HEIGHT);

    // 초기 스크롤 적용
    container.y = CONTENT_TOP - this._scrollY;
  }

  /**
   * 업적 카드 하나를 컨테이너에 렌더링한다.
   * @param {Phaser.GameObjects.Container} container
   * @param {object} item - AchievementManager.getProgress() 항목
   * @param {number} y - 카드 Y 오프셋
   * @private
   */
  _renderCard(container, item, y) {
    const cardW = GAME_WIDTH - 16;
    const cardX = 8;

    // Phase 60-19: 카드 배경 rect → NineSliceFactory.panel 'parchment' + setTint
    // Phase 74: 수령 대기(unlocked && !claimed) 상태는 glow_selected 텍스처로 교체 (P2-7)
    const isClaiming = item.unlocked && !item.claimed;
    const bgColor = item.claimed ? 0x1a2a1a : (item.unlocked ? 0x2a2200 : 0x222222);
    const bgTexture = isClaiming ? 'panel_glow_selected' : 'parchment';
    const bg = NineSliceFactory.panel(this, cardX + cardW / 2, y + CARD_HEIGHT / 2, cardW, CARD_HEIGHT, bgTexture);
    if (!isClaiming) bg.setTint(bgColor);
    container.add(bg);

    // Phase 74: 수령 대기 카드 골드 glow alpha 펄스 (P2-7)
    if (isClaiming) {
      this.tweens.add({
        targets: bg,
        alpha: { from: 0.7, to: 1.0 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // 아이콘
    const icon = this.add.text(cardX + 24, y + CARD_HEIGHT / 2, item.icon, {
      fontSize: '24px',
    }).setOrigin(0.5);
    container.add(icon);

    // 이름
    const nameColor = item.unlocked ? '#ffd700' : '#cccccc';
    const name = this.add.text(cardX + 48, y + 16, item.nameKo, {
      fontSize: '13px', fontStyle: 'bold', color: nameColor,
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0, 0.5);
    container.add(name);

    // 설명 — Phase 62: parchment tint 배경 위 대비 개선 (WCAG AA 미달 해소)
    //   claimed(#1a2a1a 다크그린): 설명 밝은 녹색 계열
    //   unlocked(#2a2200 어두운 금색): 설명 옅은 금색
    //   default(#222222 어두운 회색): 설명 기존 연회색 유지하되 채도 상향
    const descColor = item.claimed ? '#c8e6c8' : (item.unlocked ? '#ffe0a8' : '#d8d8d8');
    const desc = this.add.text(cardX + 48, y + 36, item.descKo, {
      fontSize: '10px', color: descColor,
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0, 0.5);
    container.add(desc);

    // ── 상태 영역 (카드 오른쪽) ──
    const statusX = cardX + cardW - 10;

    if (item.claimed) {
      // 수령 완료
      const doneText = this.add.text(statusX, y + CARD_HEIGHT / 2, '\uC644\uB8CC \u2713', {
        fontSize: '12px', fontStyle: 'bold', color: '#66cc66',
      }).setOrigin(1, 0.5);
      container.add(doneText);

    } else if (item.unlocked) {
      // 달성 후 미수령: 수령 버튼
      const rewardLabel = item.reward.gold
        ? `\uD83D\uDCB0 ${item.reward.gold}g`
        : `\uD83E\uDE99 ${item.reward.coin}c`;

      const btnW = 70;
      const btnH = 28;
      const btnX = statusX - btnW / 2;
      const btnY = y + CARD_HEIGHT / 2;

      // Phase 60-19: 수령 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
      const claimBg = NineSliceFactory.raw(this, btnX, btnY, btnW, btnH, 'btn_primary_normal');
      claimBg.setTint(0xcc8800);
      const claimHit = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
      claimBg.setInteractive(claimHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      container.add(claimBg);

      const claimText = this.add.text(btnX, btnY, `\uC218\uB839 ${rewardLabel}`, {
        fontSize: '9px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5);
      container.add(claimText);

      claimBg.on('pointerdown', () => {
        this._claimReward(item);
        // 카드를 다시 렌더링
        this._renderContent();
      });
      // Phase 60-19: setFillStyle → setTexture + setTint
      claimBg.on('pointerover', () => { claimBg.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); claimBg.setTint(0xee9900); });
      claimBg.on('pointerout', () => { claimBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); claimBg.setTint(0xcc8800); });

    } else {
      // 미달성: 진행률 바
      const barW = 80;
      const barH = 12;
      const barX = statusX - barW;
      const barY = y + CARD_HEIGHT / 2 - 6;

      // Phase 60-19: 진행 바 배경 rect → NineSliceFactory.panel 'stone' + setTint
      const barBg = NineSliceFactory.panel(this, barX + barW / 2, barY + barH / 2, barW, barH, 'stone');
      barBg.setTint(0x444444);
      container.add(barBg);

      // Phase 60-19: 진행 바 채움 rect → NineSliceFactory.raw 'bar_fill' + setTint
      const ratio = Math.min(item.current / item.threshold, 1);
      const fillW = Math.max(1, barW * ratio);
      const fillColor = ratio >= 1 ? 0x44ff44 : 0xff6b35;
      const barFill = NineSliceFactory.raw(this, barX + fillW / 2, barY + barH / 2, fillW, barH, 'bar_fill');
      barFill.setTint(fillColor);
      container.add(barFill);

      // 수치 텍스트 — Phase 62: 배경 외부로 이동 완화, outline 추가로 가독성 확보
      const valText = this.add.text(barX + barW / 2, barY + barH + 10, `${item.current}/${item.threshold}`, {
        fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5, 0.5);
      container.add(valText);
    }
  }

  /**
   * 업적 보상 수령 처리.
   * @param {object} item
   * @private
   */
  _claimReward(item) {
    // 세이브에 수령 기록
    SaveManager.markAchievementClaimed(item.id);

    // 보상 지급
    if (item.reward.gold) {
      ToolManager.addGold(item.reward.gold);
    }
    if (item.reward.coin) {
      const data = SaveManager.load();
      data.kitchenCoins = (data.kitchenCoins || 0) + item.reward.coin;
      SaveManager.save(data);
    }
    if (item.reward.mireukEssence) {
      SaveManager.addMireukEssence(item.reward.mireukEssence);
    }

    // 잔액 갱신
    this._updateBalanceDisplay();
  }

  // ── 스크롤 입력 ──

  /** 드래그 기반 스크롤 설정 */
  _setupScrollInput() {
    // 콘텐츠 영역 터치 수신용 투명 히트 영역
    const hitArea = this.add.rectangle(GAME_WIDTH / 2, CONTENT_TOP + CONTENT_HEIGHT / 2,
      GAME_WIDTH, CONTENT_HEIGHT, 0x000000, 0)
      .setInteractive().setDepth(5);

    hitArea.on('pointerdown', (pointer) => {
      this._dragStartY = pointer.y;
      this._dragStartScrollY = this._scrollY;
    });

    this.input.on('pointermove', (pointer) => {
      if (this._dragStartY === null) return;
      const dy = this._dragStartY - pointer.y;
      this._scrollY = Phaser.Math.Clamp(this._dragStartScrollY + dy, 0, this._maxScrollY);
      if (this._contentContainer) {
        this._contentContainer.y = CONTENT_TOP - this._scrollY;
      }
    });

    this.input.on('pointerup', () => {
      this._dragStartY = null;
    });
  }

  // ── 유틸리티 ──

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   * @private
   */
  _fadeToScene(sceneKey) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey);
    });
  }

  /**
   * 하드웨어 뒤로가기 핸들러. 메뉴 화면으로 복귀한다.
   */
  _onBack() {
    this._fadeToScene('MenuScene');
  }
}
