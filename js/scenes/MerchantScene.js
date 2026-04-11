/**
 * @fileoverview 행상인 씬 (MerchantScene).
 * Phase 13-2: 영업 종료 후 도구 구매/판매/업그레이드 UI 제공.
 * ResultScene에서 진입, "출발하기" 버튼으로 월드맵 또는 엔드리스 복귀.
 *
 * 화면 구성 (360x640):
 *   0~60     타이틀 + 보유 골드
 *   60~530   도구 목록 (8종, 스크롤 가능)
 *   530~570  도구 요약 바
 *   570~630  출발하기 버튼
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { TOOL_DEFS } from '../data/gameData.js';
import { ToolManager } from '../managers/ToolManager.js';
import { StoryManager } from '../managers/StoryManager.js';

// ── 레이아웃 상수 ──
const BG_COLOR = 0x1a0a00;
const TITLE_Y = 20;
const GOLD_Y = 48;
const LIST_TOP = 80;
const LIST_BOTTOM = 525;
const LIST_HEIGHT = LIST_BOTTOM - LIST_TOP;
const SUMMARY_Y = 540;
const DEPART_BTN_Y = 595;
const MARGIN_X = 20;
const ITEM_HEIGHT = 110;

/** 도구 아이콘 이모지 (간략 표시용) */
const TOOL_ICONS = {
  pan: '\uD83C\uDF73',       // 프라이팬
  salt: '\uD83E\uDDC2',      // 소금
  grill: '\uD83D\uDD25',     // 화염
  delivery: '\uD83E\uDD16',  // 로봇
  freezer: '\u2744\uFE0F',   // 냉동
  soup_pot: '\uD83C\uDF72',  // 수프
  // ── Phase 19-1: 시즌 2 도구 ──
  wasabi_cannon: '\uD83D\uDFE2',   // 와사비 대포 (녹색 원)
  spice_grinder: '\uD83D\uDFE0',   // 향신료 그라인더 (주황 원)
};

/** 도구 표시 순서 */
const TOOL_ORDER = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];

export class MerchantScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MerchantScene' });
  }

  /**
   * 씬 초기화. ResultScene 또는 EndlessScene에서 전달받은 데이터를 저장한다.
   * @param {object} data
   * @param {string}  [data.stageId='1-1'] - ���테이지 ID
   * @param {object}  [data.marketResult] - 장보기 결과
   * @param {object}  [data.serviceResult] - 영업 결과
   * @param {boolean} [data.isMarketFailed=false] - 장보기 실패 여부
   * @param {boolean} [data.isEndless=false] - 엔드리스 모드 여부
   * @param {object|null} [data.endlessReturnData=null] - 엔드리스 복귀 데��터
   */
  init(data) {
    this.stageId = data.stageId || '1-1';
    this.marketResult = data.marketResult || null;
    this.serviceResult = data.serviceResult || null;
    this.isMarketFailed = data.isMarketFailed || false;
    this.isEndless = data.isEndless || false;
    this.endlessReturnData = data.endlessReturnData || null;
  }

  /**
   * 씬 생성. 배경, 헤더, 도구 목록, 요약 바, 출발 버튼을 구성한다.
   */
  create() {
    // ── 페이드인 ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── 배경 ──
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, BG_COLOR);

    // ── UI 구성요소 컨테이너 (스크롤 외부) ──
    this._createHeader();
    this._createToolList();
    this._createSummaryBar();
    this._createDepartButton();

    // ── 대화 트리거 (Phase 14-3: StoryManager 중앙화) ──
    StoryManager.checkTriggers(this, 'merchant_enter');
  }

  // ── 헤더 (타이틀 + 골드) ──────────────────────────────────────────

  /** @private */
  _createHeader() {
    // 타이틀
    this.add.text(GAME_WIDTH / 2, TITLE_Y, '\uD83D\uDED2 \uB3C4\uAD6C \uD589\uC0C1\uC778', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffcc88',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0);

    // 보유 골드
    this.goldText = this.add.text(GAME_WIDTH / 2, GOLD_Y, '', {
      fontSize: '16px', color: '#ffd700',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0);

    this._updateGoldText();
  }

  /**
   * 보유 골드 텍스트를 갱신한다.
   * @private
   */
  _updateGoldText() {
    const gold = ToolManager.getGold();
    this.goldText.setText(`\uD83D\uDCB0 \uBCF4\uC720 \uACE8\uB4DC: ${gold}g`);
  }

  // ── 도구 목록 (스크롤 가능) ────────────────────────────────────────

  /** @private */
  _createToolList() {
    // 스크롤 영역 배경
    this.add.rectangle(GAME_WIDTH / 2, LIST_TOP + LIST_HEIGHT / 2,
      GAME_WIDTH - 10, LIST_HEIGHT, 0x0d0500, 0.5);

    // 구분선 (상단)
    this.add.rectangle(GAME_WIDTH / 2, LIST_TOP - 2, GAME_WIDTH - 20, 1, 0x444444);

    // 도구별 콘텐츠 총 높이 계산
    const totalContentH = TOOL_ORDER.length * ITEM_HEIGHT + 10;

    // 스크롤 컨테이너 생성 (마스크 적용)
    this.listContainer = this.add.container(0, LIST_TOP);

    // 마스크 설정
    const maskShape = this.make.graphics({ add: false });
    maskShape.fillRect(0, LIST_TOP, GAME_WIDTH, LIST_HEIGHT);
    this.listContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    // 각 도구 아이템 렌더링
    this._renderToolItems();

    // 드래그 스크롤 설정
    this._setupScroll(totalContentH);
  }

  /**
   * 도구 아이템들을 렌더링한다. 갱신 시 기존 것을 지우고 재렌더한다.
   * @private
   */
  _renderToolItems() {
    // 기존 컨텐츠 제거
    this.listContainer.removeAll(true);

    const inventory = ToolManager.getToolInventory();
    const gold = ToolManager.getGold();

    TOOL_ORDER.forEach((toolId, idx) => {
      const def = TOOL_DEFS[toolId];
      const tool = inventory[toolId] || { count: 0, level: 1 };
      const yOff = idx * ITEM_HEIGHT + 10;

      // 아이템 배경 (짝수/홀수 약간 다르게)
      const itemBg = this.add.rectangle(GAME_WIDTH / 2, yOff + ITEM_HEIGHT / 2 - 5,
        GAME_WIDTH - 30, ITEM_HEIGHT - 6,
        idx % 2 === 0 ? 0x1a1000 : 0x0f0800, 0.7)
        .setOrigin(0.5);
      this.listContainer.add(itemBg);

      // 1행: 아이콘 + 이름 + 수량 + 레벨
      const icon = TOOL_ICONS[toolId] || '\uD83D\uDD27';
      const headerStr = `${icon} ${def.nameKo}  ${tool.count}/${def.maxCount}  Lv${tool.level}`;
      const headerText = this.add.text(MARGIN_X + 5, yOff, headerStr, {
        fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000', strokeThickness: 2,
      });
      this.listContainer.add(headerText);

      // 2행: 구매 / 판매 버튼
      const btnY = yOff + 30;
      this._createToolBuyButton(toolId, def, tool, gold, MARGIN_X, btnY);
      this._createToolSellButton(toolId, def, tool, MARGIN_X + 120, btnY);

      // 3행: 업그레이드 버튼 + 스탯 프리뷰
      const upgY = yOff + 60;
      this._createToolUpgradeButton(toolId, def, tool, gold, MARGIN_X, upgY);
    });
  }

  /**
   * 구매 버튼 생성.
   * @private
   */
  _createToolBuyButton(toolId, def, tool, gold, x, y) {
    const atMax = tool.count >= def.maxCount;
    const cost = atMax ? null : def.buyCost[tool.count];
    const canAfford = cost !== null && gold >= cost;

    let label, color;
    if (atMax) {
      label = 'MAX';
      color = 0x333333;
    } else if (canAfford) {
      label = `\uAD6C\uB9E4 ${cost}g`;
      color = 0x227722;
    } else {
      label = `\uAD6C\uB9E4 ${cost}g`;
      color = 0x555555;
    }

    const btn = this.add.rectangle(x + 50, y + 12, 100, 24, color)
      .setOrigin(0.5);
    this.listContainer.add(btn);

    const txt = this.add.text(x + 50, y + 12, label, {
      fontSize: '12px', fontStyle: 'bold', color: canAfford ? '#ffffff' : '#888888',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.listContainer.add(txt);

    if (canAfford && !atMax) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        ToolManager.buyTool(toolId);
        this._refreshUI();
      });
      btn.on('pointerover', () => btn.setFillStyle(0x33aa33));
      btn.on('pointerout', () => btn.setFillStyle(color));
    }
  }

  /**
   * 판매 버튼 생성.
   * @private
   */
  _createToolSellButton(toolId, def, tool, x, y) {
    const canSell = tool.count > 0;
    const sellPrice = canSell ? Math.floor(def.buyCost[tool.count - 1] * def.sellRate) : 0;

    let label, color;
    if (canSell) {
      label = `\uD310\uB9E4 ${sellPrice}g`;
      color = 0x773322;
    } else {
      label = '\uD310\uB9E4 -';
      color = 0x333333;
    }

    const btn = this.add.rectangle(x + 55, y + 12, 110, 24, color)
      .setOrigin(0.5);
    this.listContainer.add(btn);

    const txt = this.add.text(x + 55, y + 12, label, {
      fontSize: '12px', fontStyle: 'bold', color: canSell ? '#ffcccc' : '#666666',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.listContainer.add(txt);

    if (canSell) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        // 모든 도구를 다 팔면 경고
        if (tool.count === 1 && !ToolManager.hasAnyTool()) {
          // 이미 마지막 도구 — 경고 후 판매 시도
          this._showWarningPopup(toolId);
          return;
        }
        // 이 도구를 팔면 전체 도구가 0이 되는지 확인
        const inventory = ToolManager.getToolInventory();
        const totalCount = Object.values(inventory).reduce((s, t) => s + t.count, 0);
        if (totalCount <= 1 && tool.count === 1) {
          this._showWarningPopup(toolId);
          return;
        }
        ToolManager.sellTool(toolId);
        this._refreshUI();
      });
      btn.on('pointerover', () => btn.setFillStyle(0xaa4433));
      btn.on('pointerout', () => btn.setFillStyle(color));
    }
  }

  /**
   * 업그레이드 버튼 + 스탯 프리뷰 생성.
   * @private
   */
  _createToolUpgradeButton(toolId, def, tool, gold, x, y) {
    const atMaxLv = tool.level >= def.maxLevel;
    const noTool = tool.count < 1;
    const cost = atMaxLv ? null : def.upgradeCost[tool.level];
    const canAfford = cost !== null && !noTool && gold >= cost;

    let label, color;
    if (atMaxLv) {
      label = '\uC5C5\uADF8\uB808\uC774\uB4DC MAX';
      color = 0x333333;
    } else if (noTool) {
      label = '\uC5C5\uADF8\uB808\uC774\uB4DC -';
      color = 0x333333;
    } else if (canAfford) {
      label = `\u2B06 \uC5C5\uADF8\uB808\uC774\uB4DC ${cost}g`;
      color = 0x224488;
    } else {
      label = `\u2B06 \uC5C5\uADF8\uB808\uC774\uB4DC ${cost}g`;
      color = 0x333355;
    }

    const btn = this.add.rectangle(x + 70, y + 12, 140, 24, color)
      .setOrigin(0.5);
    this.listContainer.add(btn);

    const txt = this.add.text(x + 70, y + 12, label, {
      fontSize: '12px', fontStyle: 'bold', color: canAfford ? '#88ccff' : '#666666',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.listContainer.add(txt);

    if (canAfford) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        ToolManager.upgradeTool(toolId);
        this._refreshUI();
      });
      btn.on('pointerover', () => btn.setFillStyle(0x3366aa));
      btn.on('pointerout', () => btn.setFillStyle(color));
    }

    // 스탯 프리뷰 (업그레이드 가능 시)
    if (!atMaxLv && !noTool) {
      const curStats = def.stats[tool.level];
      const nextStats = def.stats[tool.level + 1];
      const previewParts = [];

      if (curStats.damage !== undefined && nextStats.damage !== undefined && curStats.damage !== nextStats.damage) {
        previewParts.push(`\uD53C\uD574 ${curStats.damage}\u2192${nextStats.damage}`);
      }
      if (curStats.range !== undefined && nextStats.range !== undefined && curStats.range !== nextStats.range) {
        previewParts.push(`\uC0AC\uAC70\uB9AC ${curStats.range}\u2192${nextStats.range}`);
      }
      if (curStats.fireRate !== undefined && nextStats.fireRate !== undefined && curStats.fireRate !== nextStats.fireRate) {
        previewParts.push(`\uACF5\uC18D ${curStats.fireRate}\u2192${nextStats.fireRate}ms`);
      }
      // 특수 스탯: slowFactor, burnDamage, freezeDuration, collectInterval, auraEffect
      if (curStats.slowFactor !== undefined && nextStats.slowFactor !== undefined && curStats.slowFactor !== nextStats.slowFactor) {
        previewParts.push(`\uB454\uD654 ${Math.round(curStats.slowFactor * 100)}%\u2192${Math.round(nextStats.slowFactor * 100)}%`);
      }
      if (curStats.burnDamage !== undefined && nextStats.burnDamage !== undefined && curStats.burnDamage !== nextStats.burnDamage) {
        previewParts.push(`\uD654\uC0C1 ${curStats.burnDamage}\u2192${nextStats.burnDamage}`);
      }
      if (curStats.freezeDuration !== undefined && nextStats.freezeDuration !== undefined && curStats.freezeDuration !== nextStats.freezeDuration) {
        previewParts.push(`\uBE59\uACB0 ${curStats.freezeDuration / 1000}s\u2192${nextStats.freezeDuration / 1000}s`);
      }
      if (curStats.collectInterval !== undefined && nextStats.collectInterval !== undefined && curStats.collectInterval !== nextStats.collectInterval) {
        previewParts.push(`\uC218\uC9D1 ${curStats.collectInterval / 1000}s\u2192${nextStats.collectInterval / 1000}s`);
      }
      if (curStats.auraEffect !== undefined && nextStats.auraEffect !== undefined && curStats.auraEffect !== nextStats.auraEffect) {
        previewParts.push(`\uBC84\uD504 ${Math.round(curStats.auraEffect * 100)}%\u2192${Math.round(nextStats.auraEffect * 100)}%`);
      }
      // Phase 19-1: 와사비 대포 범위 공격 스탯
      if (curStats.splashRadius !== undefined && nextStats.splashRadius !== undefined && curStats.splashRadius !== nextStats.splashRadius) {
        previewParts.push(`\uBC94\uC704 ${curStats.splashRadius}\u2192${nextStats.splashRadius}`);
      }
      if (curStats.slowRate !== undefined && nextStats.slowRate !== undefined && curStats.slowRate !== nextStats.slowRate) {
        previewParts.push(`\uB454\uD654 ${Math.round(curStats.slowRate * 100)}%\u2192${Math.round(nextStats.slowRate * 100)}%`);
      }
      // Phase 19-1: 향신료 그라인더 DoT 스탯
      if (curStats.dotDamage !== undefined && nextStats.dotDamage !== undefined && curStats.dotDamage !== nextStats.dotDamage) {
        previewParts.push(`DoT ${curStats.dotDamage}\u2192${nextStats.dotDamage}`);
      }

      if (previewParts.length > 0) {
        const previewStr = previewParts.join(', ');
        const previewTxt = this.add.text(x + 150, y + 12, previewStr, {
          fontSize: '10px', color: '#aaaaaa',
        }).setOrigin(0, 0.5);
        this.listContainer.add(previewTxt);
      }
    }
  }

  /**
   * 드래그 스크롤 설정.
   * @param {number} contentHeight - 전체 콘텐츠 높이
   * @private
   */
  _setupScroll(contentHeight) {
    const maxScroll = Math.max(0, contentHeight - LIST_HEIGHT);
    this.scrollY = 0;

    let dragging = false;
    let lastPointerY = 0;
    let startPointerY = 0;

    // zone 대신 scene 레벨 이벤트로 처리 — zone은 버튼 이벤트를 흡수하므로 사용 금지
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < LIST_TOP || pointer.y > LIST_BOTTOM) return;
      dragging = true;
      lastPointerY = pointer.y;
      startPointerY = pointer.y;
    });

    this.input.on('pointermove', (pointer) => {
      if (!dragging) return;
      const dy = pointer.y - lastPointerY;
      lastPointerY = pointer.y;
      this.scrollY = Phaser.Math.Clamp(this.scrollY - dy, 0, maxScroll);
      this.listContainer.y = LIST_TOP - this.scrollY;
    });

    this.input.on('pointerup', () => {
      dragging = false;
    });
  }

  // ── 도구 요약 바 ───────────────────────────────────────────────────

  /** @private */
  _createSummaryBar() {
    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, SUMMARY_Y - 5, GAME_WIDTH - 20, 1, 0x444444);

    this.summaryText = this.add.text(GAME_WIDTH / 2, SUMMARY_Y + 8, '', {
      fontSize: '13px', color: '#cccccc',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0);

    this._updateSummaryBar();
  }

  /** @private */
  _updateSummaryBar() {
    const inventory = ToolManager.getToolInventory();
    const parts = TOOL_ORDER.map(tid => {
      const icon = TOOL_ICONS[tid] || '?';
      const count = (inventory[tid] || { count: 0 }).count;
      return `${icon}\u00D7${count}`;
    });
    this.summaryText.setText(`\uB0B4 \uB3C4\uAD6C:  ${parts.join('  ')}`);
  }

  // ── 출발하기 버튼 ─────────────────────────────────────────────────

  /** @private */
  _createDepartButton() {
    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, DEPART_BTN_Y - 20, GAME_WIDTH - 20, 1, 0x444444);

    const btn = this.add.rectangle(GAME_WIDTH / 2, DEPART_BTN_Y, 220, 44, 0x22aa44)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, DEPART_BTN_Y, '\uCD9C\uBC1C\uD558\uAE30 \u25B6', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    btn.on('pointerdown', () => this._onDepart());
    btn.on('pointerover', () => btn.setFillStyle(0x33cc55));
    btn.on('pointerout', () => btn.setFillStyle(0x22aa44));
  }

  // ── 출발 처리 ─────────────────────────────────────────────────────

  /**
   * "출발하기" 버튼 클릭 시 다음 씬으로 전환한다.
   * - 캠페인: WorldMapScene
   * - 엔드리스: EndlessScene (복귀)
   * @private
   */
  _onDepart() {
    if (this.isEndless && this.endlessReturnData) {
      this._fadeToScene('EndlessScene', this.endlessReturnData);
    } else {
      this._fadeToScene('WorldMapScene');
    }
  }

  // ── 경고 팝업 (도구 전량 판매 시) ─────────────────────────────────

  /**
   * 모든 도구를 팔려고 할 때 경고 팝업을 표시한다.
   * @param {string} toolId - 판매 시도 중인 도구 ID
   * @private
   */
  _showWarningPopup(toolId) {
    // 오버레이
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setDepth(100);

    const popupBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      280, 160, 0x221100).setDepth(101)
      .setStrokeStyle(2, 0xff6600);

    const warnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 35,
      '\u26A0\uFE0F \uACBD\uACE0', {
        fontSize: '18px', fontStyle: 'bold', color: '#ff6600',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(102);

    const msgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      '\uB3C4\uAD6C\uAC00 \uC5C6\uC73C\uBA74 \uC7AC\uB8CC \uCC44\uC9D1\uC774\n\uBD88\uAC00\uB2A5\uD569\uB2C8\uB2E4!', {
        fontSize: '14px', color: '#ffcccc', align: 'center', lineSpacing: 4,
      }).setOrigin(0.5).setDepth(102);

    // "그래도 판매" 버튼
    const sellBtn = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 50,
      100, 30, 0x883322).setInteractive({ useHandCursor: true }).setDepth(102);
    const sellTxt = this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 50,
      '\uADF8\uB798\uB3C4 \uD310\uB9E4', {
        fontSize: '12px', fontStyle: 'bold', color: '#ffaaaa',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(102);

    // "취소" 버튼
    const cancelBtn = this.add.rectangle(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 50,
      100, 30, 0x444444).setInteractive({ useHandCursor: true }).setDepth(102);
    const cancelTxt = this.add.text(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 50,
      '\uCDE8\uC18C', {
        fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(102);

    const closePopup = () => {
      overlay.destroy();
      popupBg.destroy();
      warnText.destroy();
      msgText.destroy();
      sellBtn.destroy();
      sellTxt.destroy();
      cancelBtn.destroy();
      cancelTxt.destroy();
    };

    sellBtn.on('pointerdown', () => {
      closePopup();
      ToolManager.sellTool(toolId);
      this._refreshUI();
    });

    cancelBtn.on('pointerdown', () => {
      closePopup();
    });
  }

  // ── UI 갱신 ────────────────────────────────────────────────────────

  /**
   * 구매/판매/업그레이드 후 전체 UI를 새로고침한다.
   * @private
   */
  _refreshUI() {
    this._updateGoldText();
    this._renderToolItems();
    this._updateSummaryBar();
  }

  // ── 유틸리티 ───────────────────────────────────────────────────────

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   * @param {object} [data]
   * @private
   */
  _fadeToScene(sceneKey, data) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey, data);
    });
  }
}
