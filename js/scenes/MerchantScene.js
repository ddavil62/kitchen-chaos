/**
 * @fileoverview 행상인 씬 (MerchantScene).
 * Phase 13-2: 영업 종료 후 도구 구매/판매/업그레이드 UI 제공.
 * ResultScene에서 진입, "출발하기" 버튼으로 월드맵 또는 엔드리스 복귀.
 *
 * Phase 58-2: 상단에 "도구 구매" / "분기 선택" 탭 바 추가.
 *   분기 선택 탭은 카드 3장(되돌릴 수 없는 로그라이크 분기)을 표시한다.
 *   탭 기본값은 도구 구매(기존 UX 유지). 카드 선택 시 확인 팝업 → SaveManager 반영.
 *
 * 화면 구성 (360x640):
 *   0~55     타이틀 + 보유 골드
 *   55~80    탭 바 (Phase 58-2)
 *   95~525   탭 콘텐츠 영역 (도구 목록 또는 분기 카드)
 *   530~570  도구 요약 바
 *   570~630  출발하기 버튼
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { TOOL_DEFS } from '../data/gameData.js';
import { ToolManager } from '../managers/ToolManager.js';
import { StoryManager } from '../managers/StoryManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { selectBranchCards, BRANCH_CATEGORY_META, getBranchCardById } from '../data/merchantBranchData.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';

// ── 레이아웃 상수 ──
const BG_COLOR = 0x1a0a00;
const TITLE_Y = 20;
const GOLD_Y = 48;
// Phase 58-2: 탭 바 삽입으로 LIST_TOP 80 → 95
// Phase 58-2 AD3 REVISE: TAB_Y 67 → 72 (+5), LIST_TOP 95 → 100 (+5) — GOLD 하단 겹침 해소
const TAB_Y = 72;              // 탭 바 중심 Y
const TAB_HEIGHT = 36;         // Phase 58-2 AD3 REVISE: 20 → 36 (히트박스 ≥ 44px 기준 근접)
const LIST_TOP = 100;
const LIST_BOTTOM = 525;
const LIST_HEIGHT = LIST_BOTTOM - LIST_TOP;
const SUMMARY_Y = 540;
const DEPART_BTN_Y = 595;
const MARGIN_X = 20;
const ITEM_HEIGHT = 110;
// ── Phase 58-2: 분기 카드 영역 ──
const CARD_AREA_TOP = LIST_TOP;       // 카드 영역도 탭 아래에서 시작
const CARD_WIDTH = 100;
const CARD_HEIGHT = 160;
const CARD_GAP = 10;
// 카드 3장의 가로 합 = 100*3 + 10*2 = 320. 360 중앙 정렬 시 좌측 20px 여백.
const CARD_TOTAL_W = CARD_WIDTH * 3 + CARD_GAP * 2;
const CARD_START_X = (GAME_WIDTH - CARD_TOTAL_W) / 2;    // 20
// Phase 58-2 AD3 REVISE: helpText~카드 공백 과다 해소 (310 → 250)
const CARD_CENTER_Y = 250;     // 탭 아래 전체 영역의 상단 근처 (helpText 여백 28px)

/** 카테고리 → 폴백 이모지 (배지 텍스처 로드 실패 시 표시) */
const BRANCH_CATEGORY_FALLBACK_ICON = {
  mutation: '\uD83D\uDD25',   // 🔥
  recipe:   '\uD83D\uDCD6',   // 📖
  bond:     '\uD83D\uDC96',   // 💖
  blessing: '\uD83D\uDCA7',   // 💧
};

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

    // ── Phase 58-2: 분기 카드 상태 초기화 ──
    this._activeTab = 'tools';           // 'tools' | 'branch'
    this._branchCardDefs = null;         // selectBranchCards 결과 캐시
    this._branchCardSelected = false;    // 이번 방문에서 이미 카드 선택 완료 여부
    this._branchSelectedCardId = null;   // 선택된 카드 ID (UI 표시용)
    this._branchPopupOpen = false;       // 확인 팝업 오픈 상태
  }

  /**
   * 씬 생성. 배경, 헤더, 도구 목록, 요약 바, 출발 버튼을 구성한다.
   */
  create() {
    // ── 페이드인 ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── 배경 (Phase 60-13: rectangle → NineSliceFactory.panel 'dark') ──
    NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');

    // ── Phase 58-2: 이번 방문에서 이미 선택한 카드 복원 ──
    const lastVisit = SaveManager.getLastVisitSelection(this.stageId);
    if (lastVisit) {
      this._branchCardSelected = true;
      this._branchSelectedCardId = lastVisit.selectedCardId;
    }

    // ── UI 구성요소 컨테이너 (스크롤 외부) ──
    this._createHeader();
    this._createTabBar();           // Phase 58-2: 탭 바 먼저 생성
    this._createToolList();         // 도구 구매 탭 콘텐츠
    this._createBranchCardArea();   // Phase 58-2: 분기 선택 탭 콘텐츠
    this._createSummaryBar();
    this._createDepartButton();

    // 기본 탭 활성화 (도구 구매)
    this._setActiveTab('tools');

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
    // Phase 58-2: 탭 전환 시 숨기기 위해 전용 요소 참조 저장
    this._toolTabElements = [];

    // 스크롤 영역 배경 (Phase 60-13: rectangle → NineSliceFactory.panel 'dark')
    const bg = NineSliceFactory.panel(this, GAME_WIDTH / 2, LIST_TOP + LIST_HEIGHT / 2,
      GAME_WIDTH - 10, LIST_HEIGHT, 'dark');
    bg.setAlpha(0.5);
    this._toolTabElements.push(bg);

    // 구분선 (상단) (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    const sep = NineSliceFactory.dividerH(this, GAME_WIDTH / 2, LIST_TOP - 2, GAME_WIDTH - 20, 2);
    this._toolTabElements.push(sep);

    // 도구별 콘텐츠 총 높이 계산
    const totalContentH = TOOL_ORDER.length * ITEM_HEIGHT + 10;

    // 스크롤 컨테이너 생성 (마스크 적용)
    this.listContainer = this.add.container(0, LIST_TOP);
    this._toolTabElements.push(this.listContainer);

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

      // 1행 우측: 정보 (i) 버튼 (24x24)
      // Phase 60-13: info 버튼 rectangle → NineSliceFactory.raw 'btn_secondary_normal'
      // Phase 62: 빈 녹색 사각형처럼 보이는 문제 해소 — 크기 20→24, tint 0x224466→0x886644(웜톤),
      //           아이콘 ⓘ 13px→16px, 색 #88ccff→#ffd56a (상위 노란색 + 그림자)
      const infoBtnX = GAME_WIDTH - MARGIN_X - 10;
      const infoBtnY = yOff + 10;
      const infoBg = NineSliceFactory.raw(this, infoBtnX, infoBtnY, 24, 24, 'btn_secondary_normal');
      infoBg.setTint(0x886644);
      const infoHit = new Phaser.Geom.Rectangle(-18, -18, 36, 36);
      infoBg.setInteractive(infoHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      if (infoBg.input) infoBg.input.cursor = 'pointer';
      this.listContainer.add(infoBg);
      const infoTxt = this.add.text(infoBtnX, infoBtnY, '\u24D8', {
        fontSize: '16px', fontStyle: 'bold', color: '#ffd56a',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.listContainer.add(infoTxt);
      infoBg.on('pointerdown', () => {
        // 드래그 직후에는 팝업을 열지 않는다
        if ((this._lastDragDist || 0) >= 5) return;
        this._showToolInfoPopup(def, tool.level);
      });
      infoBg.on('pointerover', () => { infoBg.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); infoBg.setTint(0xaa7f55); });
      infoBg.on('pointerout', () => { infoBg.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); infoBg.setTint(0x886644); });

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

    // Phase 60-13: 구매 버튼 rectangle → NineSliceFactory.raw 'btn_primary_normal'
    const btn = NineSliceFactory.raw(this, x + 50, y + 12, 100, 24, 'btn_primary_normal');
    btn.setTint(color);
    this.listContainer.add(btn);

    const txt = this.add.text(x + 50, y + 12, label, {
      fontSize: '12px', fontStyle: 'bold', color: canAfford ? '#ffffff' : '#888888',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.listContainer.add(txt);

    if (canAfford && !atMax) {
      const btnHit = new Phaser.Geom.Rectangle(-50, -12, 100, 24);
      btn.setInteractive(btnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      if (btn.input) btn.input.cursor = 'pointer';
      btn.on('pointerdown', () => {
        ToolManager.buyTool(toolId);
        this._refreshUI();
      });
      btn.on('pointerover', () => btn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED));
      btn.on('pointerout', () => { btn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); btn.setTint(color); });
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

    // Phase 60-13: 판매 버튼 rectangle → NineSliceFactory.raw 'btn_danger_normal'
    const btn = NineSliceFactory.raw(this, x + 55, y + 12, 110, 24, 'btn_danger_normal');
    btn.setTint(color);
    this.listContainer.add(btn);

    const txt = this.add.text(x + 55, y + 12, label, {
      fontSize: '12px', fontStyle: 'bold', color: canSell ? '#ffcccc' : '#666666',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.listContainer.add(txt);

    if (canSell) {
      const btnHit = new Phaser.Geom.Rectangle(-55, -12, 110, 24);
      btn.setInteractive(btnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      if (btn.input) btn.input.cursor = 'pointer';
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
      btn.on('pointerover', () => btn.setTexture(NS_KEYS.BTN_DANGER_PRESSED));
      btn.on('pointerout', () => { btn.setTexture(NS_KEYS.BTN_DANGER_NORMAL); btn.setTint(color); });
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

    // Phase 60-13: 업그레이드 버튼 rectangle → NineSliceFactory.raw 'btn_secondary_normal'
    const btn = NineSliceFactory.raw(this, x + 70, y + 12, 140, 24, 'btn_secondary_normal');
    btn.setTint(color);
    this.listContainer.add(btn);

    const txt = this.add.text(x + 70, y + 12, label, {
      fontSize: '12px', fontStyle: 'bold', color: canAfford ? '#88ccff' : '#666666',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.listContainer.add(txt);

    if (canAfford) {
      const btnHit = new Phaser.Geom.Rectangle(-70, -12, 140, 24);
      btn.setInteractive(btnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      if (btn.input) btn.input.cursor = 'pointer';
      btn.on('pointerdown', () => {
        ToolManager.upgradeTool(toolId);
        this._refreshUI();
      });
      btn.on('pointerover', () => btn.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED));
      btn.on('pointerout', () => { btn.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); btn.setTint(color); });
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
        // Phase 62: previewParts 최대 2개로 제한하고 wordWrap 적용 — 우측 화면 초과 방지
        const previewStr = previewParts.slice(0, 2).join(', ');
        const previewTxt = this.add.text(x + 150, y + 12, previewStr, {
          fontSize: '10px', color: '#aaaaaa',
          wordWrap: { width: GAME_WIDTH - (x + 150) - 8 },
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
      // 팝업 오픈 중에는 스크롤 비활성화
      if (this._popupOpen || this._branchPopupOpen) return;
      // Phase 58-2: 분기 선택 탭에서는 스크롤 비활성화
      if (this._activeTab !== 'tools') return;
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

    this.input.on('pointerup', (pointer) => {
      // 드래그 거리 기록 (info 버튼 핸들러에서 참조)
      const dragDist = Math.abs(pointer.y - startPointerY);
      this._lastDragDist = dragDist;
      dragging = false;
    });
  }

  // ── 도구 요약 바 ───────────────────────────────────────────────────

  /** @private */
  _createSummaryBar() {
    // 구분선 (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, SUMMARY_Y - 5, GAME_WIDTH - 20, 2);

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
    // 구분선 (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, DEPART_BTN_Y - 20, GAME_WIDTH - 20, 2);

    // Phase 60-13: 출발 버튼 rectangle → NineSliceFactory.raw 'btn_primary_normal'
    const btn = NineSliceFactory.raw(this, GAME_WIDTH / 2, DEPART_BTN_Y, 220, 44, 'btn_primary_normal');
    btn.setTint(0x22aa44);
    const btnHit = new Phaser.Geom.Rectangle(-110, -22, 220, 44);
    btn.setInteractive(btnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (btn.input) btn.input.cursor = 'pointer';

    this.add.text(GAME_WIDTH / 2, DEPART_BTN_Y, '\uCD9C\uBC1C\uD558\uAE30 \u25B6', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    btn.on('pointerdown', () => this._onDepart());
    btn.on('pointerover', () => btn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED));
    btn.on('pointerout', () => {
      btn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL);
      // Phase 70: disabled 상태에 따라 tint 분기
      btn.setTint(this._departDisabled ? 0x666666 : 0x22aa44);
    });

    // Phase 70: 출발 버튼 참조 보존 + disabled 플래그 초기화
    this._departBtn = btn;
    this._departDisabled = false;
  }

  // ── 출발 처리 ─────────────────────────────────────────────────────

  /**
   * "출발하기" 버튼 클릭 시 다음 씬으로 전환한다.
   * - 캠페인: WorldMapScene
   * - 엔드리스: EndlessScene (복귀)
   * @private
   */
  _onDepart() {
    // Phase 70: 분기 탭 활성 + 카드 미선택 시 토스트 표시
    if (this._departDisabled) {
      this._showDepartToast();
      return;
    }
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

    // Phase 60-13: 팝업 배경 rectangle → NineSliceFactory.panel 'parchment' + tint
    const popupBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2,
      280, 160, 'parchment');
    popupBg.setDepth(101).setTint(0x221100);

    const warnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 35,
      '\u26A0\uFE0F \uACBD\uACE0', {
        fontSize: '18px', fontStyle: 'bold', color: '#ff6600',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(102);

    const msgText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      '\uB3C4\uAD6C\uAC00 \uC5C6\uC73C\uBA74 \uC7AC\uB8CC \uCC44\uC9D1\uC774\n\uBD88\uAC00\uB2A5\uD569\uB2C8\uB2E4!', {
        fontSize: '14px', color: '#ffcccc', align: 'center', lineSpacing: 4,
      }).setOrigin(0.5).setDepth(102);

    // "그래도 판매" 버튼 (Phase 60-13: rectangle → NineSliceFactory.raw 'btn_danger_normal')
    const sellBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 50,
      100, 30, 'btn_danger_normal');
    sellBtn.setTint(0x883322).setDepth(102);
    const sellBtnHit = new Phaser.Geom.Rectangle(-50, -15, 100, 30);
    sellBtn.setInteractive(sellBtnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (sellBtn.input) sellBtn.input.cursor = 'pointer';
    const sellTxt = this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 50,
      '\uADF8\uB798\uB3C4 \uD310\uB9E4', {
        fontSize: '12px', fontStyle: 'bold', color: '#ffaaaa',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(102);

    // "취소" 버튼 (Phase 60-13: rectangle → NineSliceFactory.raw 'btn_secondary_normal')
    // Phase 62: tint 0x444444 → 0x888888
    const cancelBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 50,
      100, 30, 'btn_secondary_normal');
    cancelBtn.setTint(0x888888).setDepth(102);
    const cancelBtnHit = new Phaser.Geom.Rectangle(-50, -15, 100, 30);
    cancelBtn.setInteractive(cancelBtnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (cancelBtn.input) cancelBtn.input.cursor = 'pointer';
    const cancelTxt = this.add.text(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 50,
      '\uCDE8\uC18C', {
        fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
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

  // ── 도구 정보 팝업 ───────────────────────────────────────────────

  /**
   * 도구 정보 팝업을 표시한다. 이미 열린 팝업이 있으면 먼저 파괴한다.
   * @param {object} toolDef - TOOL_DEFS 항목
   * @param {number} currentLevel - 현재 보유 레벨
   * @private
   */
  _showToolInfoPopup(toolDef, currentLevel) {
    // 기존 팝업 파괴
    if (this._infoPopupElements) {
      this._infoPopupElements.forEach(el => el.destroy());
      this._infoPopupElements = null;
    }

    this._popupOpen = true;
    const elements = [];
    const cx = GAME_WIDTH / 2;

    // ── 렌더할 스탯 바 수를 미리 계산하여 팝업 높이를 동적으로 결정 ──
    const stats = toolDef.stats[currentLevel];
    let statBarCount = 0;
    if (toolDef.category === 'attack') {
      statBarCount += 1; // 공격력
      statBarCount += 1; // 사거리
      statBarCount += 1; // 공격속도
    } else {
      statBarCount += 1; // 사거리
    }
    const specialStat = this._getSpecialStat(stats);
    if (specialStat) statBarCount += 1;

    // 높이 = 상단패딩(20) + 제목줄(30) + sep(10) + descKo(50) + sep(10) + lvLabel(20) + 바당24px + sep(10) + loreKo(40) + 하단패딩(30)
    const popupH = 20 + 30 + 10 + 50 + 10 + 20 + statBarCount * 24 + 10 + 40 + 30;
    // cy를 화면 중앙에 두되, 팝업이 화면 밖으로 나가지 않도록 clamp
    const cy = Math.max(popupH / 2 + 10, Math.min(GAME_HEIGHT - popupH / 2 - 10, GAME_HEIGHT / 2));

    // 반투명 오버레이
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setDepth(100).setInteractive();
    elements.push(overlay);

    // 팝업 배경 (Phase 60-13: rectangle → NineSliceFactory.panel 'parchment' + tint)
    const popBg = NineSliceFactory.panel(this, cx, cy, 300, popupH, 'parchment');
    popBg.setDepth(101).setTint(0x221100);
    elements.push(popBg);

    // ── 팝업 상단 기준 Y 좌표 ──
    const topY = cy - popupH / 2;

    // 헤더: 아이콘 + 이름
    const icon = TOOL_ICONS[toolDef.id] || '\uD83D\uDD27';
    const titleText = this.add.text(cx - 100, topY + 20, `${icon} ${toolDef.nameKo}`, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setDepth(102);
    elements.push(titleText);

    // 닫기 버튼 (X) (Phase 60-13: rectangle → NineSliceFactory.raw 'btn_danger_normal')
    const closeBtn = NineSliceFactory.raw(this, cx + 125, topY + 20, 36, 24, 'btn_danger_normal');
    closeBtn.setTint(0xcc2222).setDepth(102);
    const closeBtnHit = new Phaser.Geom.Rectangle(-18, -12, 36, 24);
    closeBtn.setInteractive(closeBtnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (closeBtn.input) closeBtn.input.cursor = 'pointer';
    elements.push(closeBtn);
    const closeTxt = this.add.text(cx + 125, topY + 20, '\u2715', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(102);
    elements.push(closeTxt);

    // 구분선 1 (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    const sep1 = NineSliceFactory.dividerH(this, cx, topY + 42, 260, 2);
    sep1.setDepth(102);
    elements.push(sep1);

    // 기능 설명 (descKo)
    const descText = this.add.text(cx, topY + 60, toolDef.descKo || '', {
      fontSize: '13px', color: '#cccccc', wordWrap: { width: 260 }, lineSpacing: 3,
    }).setOrigin(0.5, 0).setDepth(102);
    elements.push(descText);

    // 구분선 2 (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    const sep2 = NineSliceFactory.dividerH(this, cx, topY + 100, 260, 2);
    sep2.setDepth(102);
    elements.push(sep2);

    // 현재 레벨 표시
    const lvText = this.add.text(cx - 120, topY + 112, `\uD604\uC7AC Lv: ${currentLevel}`, {
      fontSize: '12px', fontStyle: 'bold', color: '#ffd700',
    }).setDepth(102);
    elements.push(lvText);

    // 스탯 바 렌더링 (stats, specialStat은 위에서 이미 계산됨)
    let barY = topY + 134;
    const barX = cx - 30;

    // 공격력 (attack 카테고리만)
    if (toolDef.category === 'attack') {
      this._drawStatBar(elements, '\uACF5\uACA9\uB825', stats.damage, 50, barX, barY);
      barY += 24;
    }

    // 사거리 (항상)
    this._drawStatBar(elements, '\uC0AC\uAC70\uB9AC', stats.range, 150, barX, barY);
    barY += 24;

    // 공격속도 (attack 카테고리만, 역수 비율)
    if (toolDef.category === 'attack') {
      const speedRatio = 1 - stats.fireRate / 1500;
      this._drawStatBar(elements, '\uACF5\uACA9\uC18D\uB3C4', speedRatio, 1, barX, barY, `${stats.fireRate}ms`);
      barY += 24;
    }

    // 특수 스탯 (우선순위에 따라 1개, 위에서 이미 계산됨)
    if (specialStat) {
      this._drawStatBar(elements, specialStat.label, specialStat.value, specialStat.max, barX, barY, specialStat.display);
      barY += 24;
    }

    // 구분선 3 (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    const sep3 = NineSliceFactory.dividerH(this, cx, barY + 12, 260, 2);
    sep3.setDepth(102);
    elements.push(sep3);

    // 로어 (loreKo)
    const loreText = this.add.text(cx, barY + 24, toolDef.loreKo || '', {
      fontSize: '11px', fontStyle: 'italic', color: '#aaaaaa',
      wordWrap: { width: 260 }, lineSpacing: 2,
    }).setOrigin(0.5, 0).setDepth(102);
    elements.push(loreText);

    // 닫기 콜백
    const closePopup = () => {
      elements.forEach(el => el.destroy());
      this._infoPopupElements = null;
      this._popupOpen = false;
    };
    closeBtn.on('pointerdown', closePopup);
    overlay.on('pointerdown', closePopup);

    this._infoPopupElements = elements;
  }

  /**
   * 스탯 바 1줄을 렌더링한다.
   * @param {Array} elements - 파괴 대상 요소 배열
   * @param {string} labelStr - 스탯 이름
   * @param {number} value - 현재 값 (또는 비율)
   * @param {number} maxValue - 최대 기준값 (또는 1)
   * @param {number} x - 바 시작 X
   * @param {number} y - 바 중심 Y
   * @param {string} [displayStr] - 수치 표시 문자열 (생략 시 value 사용)
   * @private
   */
  _drawStatBar(elements, labelStr, value, maxValue, x, y, displayStr) {
    const cx = GAME_WIDTH / 2;
    // 레이블 (바 왼쪽)
    const label = this.add.text(x - 60, y, labelStr, {
      fontSize: '11px', color: '#aaaaaa',
    }).setOrigin(1, 0.5).setDepth(102);
    elements.push(label);

    // 바 배경
    const barBg = this.add.rectangle(x + 50, y, 100, 8, 0x333333)
      .setOrigin(0.5, 0.5).setDepth(102);
    elements.push(barBg);

    // 채움 바
    const ratio = Math.min(value / maxValue, 1);
    const fillW = Math.max(Math.floor(ratio * 100), 1);
    const barFill = this.add.rectangle(x + 50 - 50 + fillW / 2, y, fillW, 8, 0x44aaff)
      .setOrigin(0.5, 0.5).setDepth(102);
    elements.push(barFill);

    // 수치 텍스트
    const valStr = displayStr !== undefined ? displayStr : String(Math.round(value));
    const valText = this.add.text(x + 110, y, valStr, {
      fontSize: '10px', color: '#ffffff',
    }).setOrigin(0, 0.5).setDepth(102);
    elements.push(valText);
  }

  /**
   * 도구 스탯에서 특수 스탯 1개를 추출한다 (우선순위 기반).
   * @param {object} stats - 도구 레벨별 스탯 객체
   * @returns {{ label: string, value: number, max: number, display: string }|null}
   * @private
   */
  _getSpecialStat(stats) {
    if (stats.slowFactor !== undefined) {
      return { label: '\uB454\uD654', value: stats.slowFactor, max: 1, display: `${Math.round(stats.slowFactor * 100)}%` };
    }
    if (stats.burnDamage !== undefined) {
      return { label: '\uD654\uC0C1', value: stats.burnDamage, max: 15, display: `${stats.burnDamage}dmg` };
    }
    if (stats.freezeDuration !== undefined) {
      return { label: '\uBE59\uACB0', value: stats.freezeDuration / 1000, max: 3, display: `${stats.freezeDuration / 1000}s` };
    }
    if (stats.collectInterval !== undefined) {
      return { label: '\uC218\uC9D1', value: 1 - stats.collectInterval / 3000, max: 1, display: `${stats.collectInterval / 1000}s` };
    }
    if (stats.auraEffect !== undefined) {
      return { label: '\uBC84\uD504', value: stats.auraEffect, max: 0.3, display: `${Math.round(stats.auraEffect * 100)}%` };
    }
    if (stats.splashRadius !== undefined) {
      return { label: '\uBC94\uC704', value: stats.splashRadius, max: 60, display: `${stats.splashRadius}px` };
    }
    if (stats.dotDamage !== undefined) {
      return { label: 'DoT', value: stats.dotDamage, max: 15, display: `${stats.dotDamage}dmg` };
    }
    return null;
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

  // ── 탭 바 (Phase 58-2) ────────────────────────────────────────────

  /**
   * 상단 탭 바 2개(도구 구매 / 분기 선택)를 생성한다.
   * 탭 전환 시 _setActiveTab(tabId)로 콘텐츠 영역을 토글한다.
   * @private
   */
  _createTabBar() {
    // 탭 바 중심 Y = TAB_Y. 좌우 2등분.
    const halfW = GAME_WIDTH / 2;
    const tabW = halfW - 20;     // 좌우 10px 여백 × 2

    // 좌측: 도구 구매
    this._tabToolsBg = this.add.rectangle(halfW / 2 + 10, TAB_Y, tabW, TAB_HEIGHT, 0x1a0a00, 0)
      .setInteractive({ useHandCursor: true });
    this._tabToolsText = this.add.text(halfW / 2 + 10, TAB_Y,
      '\uD83D\uDED2 \uB3C4\uAD6C \uAD6C\uB9E4', {
        fontSize: '14px', fontStyle: 'bold', color: '#888888',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    // Phase 60-13: 탭 언더라인 rectangle → NineSliceFactory.dividerH
    this._tabToolsUnderline = NineSliceFactory.dividerH(this, halfW / 2 + 10, TAB_Y + TAB_HEIGHT / 2 - 1,
      tabW, 2);
    this._tabToolsUnderline.setVisible(false);

    // 우측: 분기 선택
    this._tabBranchBg = this.add.rectangle(halfW + halfW / 2 - 10, TAB_Y, tabW, TAB_HEIGHT, 0x1a0a00, 0)
      .setInteractive({ useHandCursor: true });
    this._tabBranchText = this.add.text(halfW + halfW / 2 - 10, TAB_Y,
      '\uD83C\uDCCF \uBD84\uAE30 \uC120\uD0DD', {
        fontSize: '14px', fontStyle: 'bold', color: '#888888',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    // Phase 60-13: 탭 언더라인 rectangle → NineSliceFactory.dividerH
    this._tabBranchUnderline = NineSliceFactory.dividerH(this, halfW + halfW / 2 - 10, TAB_Y + TAB_HEIGHT / 2 - 1,
      tabW, 2);
    this._tabBranchUnderline.setVisible(false);

    // 구분선 (탭 바 하단) (Phase 60-13: rectangle → NineSliceFactory.dividerH)
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, TAB_Y + TAB_HEIGHT / 2 + 2, GAME_WIDTH - 20, 2);

    // 클릭 핸들러
    this._tabToolsBg.on('pointerdown', () => this._setActiveTab('tools'));
    this._tabBranchBg.on('pointerdown', () => {
      // Phase 70: 골드 tint 플래시 (0.15초)
      this._tabBranchText.setColor('#ffcc44');
      this.time.delayedCall(150, () => {
        if (this._activeTab === 'branch') {
          this._tabBranchText.setColor('#ffcc88'); // 활성 탭 색상 유지
        } else {
          this._tabBranchText.setColor('#888888');
        }
      });
      this._setActiveTab('branch');
    });
  }

  /**
   * 활성 탭을 설정하고 콘텐츠 영역을 토글한다.
   * @param {'tools'|'branch'} tabId
   * @private
   */
  _setActiveTab(tabId) {
    if (tabId !== 'tools' && tabId !== 'branch') return;
    this._activeTab = tabId;

    // 탭 스타일 갱신
    const isTools = tabId === 'tools';
    this._tabToolsText.setColor(isTools ? '#ffcc88' : '#888888');
    this._tabBranchText.setColor(!isTools ? '#ffcc88' : '#888888');
    this._tabToolsUnderline.setVisible(isTools);
    this._tabBranchUnderline.setVisible(!isTools);

    // 콘텐츠 영역 토글
    if (this._toolTabElements) {
      this._toolTabElements.forEach(el => el.setVisible(isTools));
    }
    if (this._branchTabElements) {
      this._branchTabElements.forEach(el => el.setVisible(!isTools));
    }

    // Phase 70: 분기 탭 활성 + 카드 미선택 시 출발 버튼 disabled 제어
    this._updateDepartButtonState();
  }

  // ── 분기 카드 영역 (Phase 58-2) ────────────────────────────────────

  /**
   * 분기 카드 탭 콘텐츠를 생성한다.
   * 이번 방문에 제시할 카드 3장을 selectBranchCards로 선정하고 가로 배치로 렌더한다.
   * 이미 선택 완료된 경우 선택 완료 상태로 표시한다.
   * @private
   */
  _createBranchCardArea() {
    this._branchTabElements = [];

    // 탭 전환 시 숨겨질 배경 (Phase 60-13: rectangle → NineSliceFactory.panel 'dark')
    const bg = NineSliceFactory.panel(this, GAME_WIDTH / 2, LIST_TOP + LIST_HEIGHT / 2,
      GAME_WIDTH - 10, LIST_HEIGHT, 'dark');
    bg.setAlpha(0.5);
    this._branchTabElements.push(bg);

    // 상단 안내 문구 (Phase 58-2 AD3 REVISE: 2줄 + wordWrap 적용으로 가로 잘림 해소)
    const helpText = this.add.text(GAME_WIDTH / 2, LIST_TOP + 14,
      '\uC774\uBC88 \uD589\uC0C1\uC778 \uBC29\uBB38 \uC804\uC6A9 \uBD84\uAE30 \uCE74\uB4DC 3\uC7A5\n\uC120\uD0DD\uC740 \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4', {
        fontSize: '11px', color: '#cccccc', align: 'center',
        stroke: '#000', strokeThickness: 2,
        wordWrap: { width: GAME_WIDTH - 24 },
      }).setOrigin(0.5, 0);
    this._branchTabElements.push(helpText);

    // 카드 3장 선정 (이미 선택 완료 상태에서도 원래 뽑혔던 카드를 다시 구성하기보다는
    // 선택된 단일 카드만 중앙 표시. 선택되지 않았다면 정상 3장 선정.)
    if (this._branchCardSelected) {
      this._renderSelectedBranchSummary();
    } else {
      // 신규 방문 시에만 카드 선정. 동일 씬 내 탭 전환마다 재선정되지 않도록 캐시.
      if (!this._branchCardDefs) {
        const state = {
          toolMutations: SaveManager.getToolMutations(),
          unlockedBranchRecipes: SaveManager.getUnlockedBranchRecipes(),
          chefBonds: SaveManager.getChefBonds(),
          activeBlessing: SaveManager.getActiveBlessing(),
        };
        this._branchCardDefs = selectBranchCards(state);
      }
      this._renderBranchCards(this._branchCardDefs);
    }

    // 활성 축복 상태 힌트 (하단)
    const bless = SaveManager.getActiveBlessing();
    if (bless) {
      const def = getBranchCardById(bless.id);
      const titleKo = def ? def.titleKo : bless.id;
      const blessText = this.add.text(GAME_WIDTH / 2, LIST_BOTTOM - 14,
        `\uD83C\uDF1F \uD65C\uC131 \uCD95\uBCF5: ${titleKo} (\uC794\uC5EC ${bless.remainingStages} \uC2A4\uD14C\uC774\uC9C0)`, {
          fontSize: '11px', color: '#ffcc88', align: 'center',
          stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5, 1);
      this._branchTabElements.push(blessText);
    }
  }

  /**
   * 카드 3장을 가로 배치로 렌더한다.
   * @param {Array<object>} cards - selectBranchCards 결과
   * @private
   */
  _renderBranchCards(cards) {
    if (!cards || cards.length === 0) {
      // 풀이 모두 소진된 극단적 케이스: 안내 문구만 표시
      const emptyText = this.add.text(GAME_WIDTH / 2, CARD_CENTER_Y,
        '\uC81C\uC2DC\uD560 \uC218 \uC788\uB294 \uBD84\uAE30 \uCE74\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.', {
          fontSize: '12px', color: '#888888', align: 'center',
        }).setOrigin(0.5);
      this._branchTabElements.push(emptyText);
      return;
    }

    cards.forEach((cardDef, idx) => {
      const x = CARD_START_X + idx * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;
      const y = CARD_CENTER_Y;
      this._renderBranchCard(cardDef, x, y, false);
    });
  }

  /**
   * 단일 분기 카드를 렌더한다.
   * 구성: 상단 카테고리 배지(32x32) + 카테고리명 → 중앙 titleKo → 하단 descKo → 하단 효과 요약
   * @param {object} cardDef - 카드 정의 (BRANCH_CARDS 항목)
   * @param {number} cx - 카드 중심 X
   * @param {number} cy - 카드 중심 Y
   * @param {boolean} isSelected - 이미 선택된 상태인지
   * @private
   */
  _renderBranchCard(cardDef, cx, cy, isSelected) {
    const meta = BRANCH_CATEGORY_META[cardDef.category];
    const outlineColor = isSelected ? 0x22aa44 : (meta ? meta.color : 0x888888);
    const bgColor = isSelected ? 0x112200 : 0x1a1000;

    // 카드 배경 (Phase 60-13: rectangle → NineSliceFactory.panel 'parchment' + tint)
    const card = NineSliceFactory.panel(this, cx, cy, CARD_WIDTH, CARD_HEIGHT, 'parchment');
    card.setTint(bgColor);
    this._branchTabElements.push(card);

    const topY = cy - CARD_HEIGHT / 2;

    // 상단 배지 아이콘 (Phase 58-2 AD3 REVISE: 24→28px 확대, 텍스처 미로드 시 폴백 이모지)
    const badgeKey = this._getBadgeTextureKey(cardDef.category);
    if (badgeKey && this.textures.exists(badgeKey)) {
      const badge = this.add.image(cx, topY + 18, badgeKey).setDisplaySize(28, 28);
      this._branchTabElements.push(badge);
    } else {
      // 폴백: 텍스처 미존재 시 카테고리 이모지로 대체 표시
      const fallbackIcon = BRANCH_CATEGORY_FALLBACK_ICON[cardDef.category] || '?';
      const iconText = this.add.text(cx, topY + 18, fallbackIcon, {
        fontSize: '16px',
      }).setOrigin(0.5);
      this._branchTabElements.push(iconText);
    }

    // 카테고리 한국어명
    const catLabel = meta ? meta.labelKo : cardDef.category;
    const catText = this.add.text(cx, topY + 34, catLabel, {
      fontSize: '10px', color: '#cccccc',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0);
    this._branchTabElements.push(catText);

    // 중앙 titleKo (14px bold)
    const title = this.add.text(cx, topY + 55, cardDef.titleKo || '', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
      wordWrap: { width: CARD_WIDTH - 10 },
      align: 'center',
    }).setOrigin(0.5, 0);
    this._branchTabElements.push(title);

    // 하단 descKo (10px, wordWrap)
    const desc = this.add.text(cx, topY + 82, cardDef.descKo || '', {
      fontSize: '10px', color: '#bbbbbb',
      wordWrap: { width: CARD_WIDTH - 10 },
      align: 'center', lineSpacing: 2,
    }).setOrigin(0.5, 0);
    this._branchTabElements.push(desc);

    // ── 선택 완료 오버레이 ──
    if (isSelected) {
      const overlay = this.add.text(cx, cy, '\uC120\uD0DD \uC644\uB8CC', {
        fontSize: '14px', fontStyle: 'bold', color: '#22ff88',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5);
      this._branchTabElements.push(overlay);
      return; // 선택된 카드는 클릭 불가
    }

    // 비선택 상태: 카드 전체 클릭 가능
    // Phase 60-13: Container 기반 hitArea + setTint로 교체
    const cardHit = new Phaser.Geom.Rectangle(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
    card.setInteractive(cardHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (card.input) card.input.cursor = 'pointer';
    card.on('pointerover', () => card.setTint(0x2a1a00));
    card.on('pointerout',  () => card.setTint(bgColor));
    card.on('pointerdown', () => {
      if (this._branchCardSelected || this._branchPopupOpen) return;
      this._showBranchConfirmPopup(cardDef);
    });
  }

  /**
   * 카테고리 → 배지 텍스처 키 매핑.
   * @param {string} category
   * @returns {string}
   * @private
   */
  _getBadgeTextureKey(category) {
    switch (category) {
      case 'mutation': return 'badge_mutation';
      case 'recipe':   return 'badge_recipe';
      case 'bond':     return 'badge_bond';
      case 'blessing': return 'badge_blessing';
      default: return '';
    }
  }

  /**
   * 이미 이번 방문에서 분기 카드를 선택 완료한 경우, 중앙에 선택된 카드 요약을 표시한다.
   * @private
   */
  _renderSelectedBranchSummary() {
    const cardId = this._branchSelectedCardId;
    const cardDef = cardId ? getBranchCardById(cardId) : null;
    const cy = CARD_CENTER_Y;
    const cx = GAME_WIDTH / 2;

    if (!cardDef) {
      // 데이터 유실 상황 폴백
      const fallback = this.add.text(cx, cy,
        '\uC774\uBC88 \uBC29\uBB38\uC758 \uBD84\uAE30 \uCE74\uB4DC\uB294 \uC774\uBBF8 \uC120\uD0DD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.', {
          fontSize: '13px', color: '#22ff88', align: 'center',
          stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5);
      this._branchTabElements.push(fallback);
      return;
    }

    // 선택 완료 상태의 단일 카드 크게 표시 (스케일 1.1 대신 원본 크기 중앙 배치)
    this._renderBranchCard(cardDef, cx, cy, true);

    // 안내 문구
    const note = this.add.text(cx, cy + CARD_HEIGHT / 2 + 16,
      '\uC774\uBC88 \uD589\uC0C1\uC778 \uBC29\uBB38\uC5D0\uC11C\uB294 \uCD94\uAC00 \uC120\uD0DD\uC774 \uBD88\uAC00\uB2A5\uD569\uB2C8\uB2E4.', {
        fontSize: '11px', color: '#888888', align: 'center',
      }).setOrigin(0.5, 0);
    this._branchTabElements.push(note);
  }

  /**
   * 분기 카드 선택 확인 팝업을 표시한다.
   * 기존 _showWarningPopup 스타일을 따르되 메시지와 콜백을 카드에 맞춰 구성한다.
   * @param {object} cardDef - 선택한 카드 정의
   * @private
   */
  _showBranchConfirmPopup(cardDef) {
    if (this._branchPopupOpen) return;
    this._branchPopupOpen = true;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 축복 교체 여부(카드가 blessing이면서 이미 활성 축복이 있는 경우)
    const activeBless = SaveManager.getActiveBlessing();
    const isReplacingBlessing = cardDef.category === 'blessing' && !!activeBless;

    // Phase 70: descKo 영역 추가로 popupH 30px 증가
    const popupH = isReplacingBlessing ? 220 : 200;

    // 오버레이
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setDepth(100).setInteractive();

    // Phase 60-13: 팝업 배경 rectangle → NineSliceFactory.panel 'parchment' + tint
    const popupBg = NineSliceFactory.panel(this, cx, cy, 300, popupH, 'parchment');
    popupBg.setDepth(101).setTint(0x221100);

    const warnText = this.add.text(cx, cy - popupH / 2 + 20,
      '\u26A0\uFE0F \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4', {
        fontSize: '16px', fontStyle: 'bold', color: '#ff6600',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(102);

    // 본문: "[카드 이름]을(를) 선택합니다.\n이 선택은 취소할 수 없습니다."
    const msgBody = `${cardDef.titleKo}\u0028\uC744\u0029\u002F\u0028\uB97C\u0029 \uC120\uD0DD\uD569\uB2C8\uB2E4.\n\uC774 \uC120\uD0DD\uC740 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`;
    const msgText = this.add.text(cx, cy - popupH / 2 + 52, msgBody, {
      fontSize: '13px', color: '#ffcccc', align: 'center', lineSpacing: 4,
      wordWrap: { width: 270 },
    }).setOrigin(0.5, 0).setDepth(102);

    // Phase 70: descKo 구분선 + 효과 설명 텍스트
    const dividerY = cy - popupH / 2 + 90;
    const descDivider = NineSliceFactory.dividerH(this, cx, dividerY, 270, 1);
    descDivider.setDepth(102);
    const descText = this.add.text(cx, dividerY + 8, cardDef.descKo || '', {
      fontSize: '11px', color: '#aaaaaa', align: 'center', lineSpacing: 3,
      wordWrap: { width: 270 },
    }).setOrigin(0.5, 0).setDepth(102);

    // 축복 교체 경고(있을 때만)
    let replaceText = null;
    if (isReplacingBlessing) {
      replaceText = this.add.text(cx, cy + popupH / 2 - 55,
        '\u0028\uD604\uC7AC \uCD95\uBCF5\uC774 \uAD50\uCCB4\uB429\uB2C8\uB2E4\u0029', {
          fontSize: '11px', color: '#ffaa88', align: 'center',
        }).setOrigin(0.5).setDepth(102);
    }

    // 확인 버튼 (초록) — Phase 58-2 AD3 REVISE: height 30→40, Y 보정(-25→-30)
    // Phase 60-13: rectangle → NineSliceFactory.raw 'btn_primary_normal'
    const okBtn = NineSliceFactory.raw(this, cx - 60, cy + popupH / 2 - 30, 100, 40, 'btn_primary_normal');
    okBtn.setTint(0x227722).setDepth(102);
    const okBtnHit = new Phaser.Geom.Rectangle(-50, -20, 100, 40);
    okBtn.setInteractive(okBtnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (okBtn.input) okBtn.input.cursor = 'pointer';
    const okTxt = this.add.text(cx - 60, cy + popupH / 2 - 30, '\uD655\uC778', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(102);

    // 취소 버튼 (회색) — Phase 58-2 AD3 REVISE: height 30→40, Y 보정(-25→-30)
    // Phase 60-13: rectangle → NineSliceFactory.raw 'btn_secondary_normal'
    // Phase 62: tint 0x444444 → 0x888888
    const cancelBtn = NineSliceFactory.raw(this, cx + 60, cy + popupH / 2 - 30, 100, 40, 'btn_secondary_normal');
    cancelBtn.setTint(0x888888).setDepth(102);
    const cancelBtnHit2 = new Phaser.Geom.Rectangle(-50, -20, 100, 40);
    cancelBtn.setInteractive(cancelBtnHit2, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (cancelBtn.input) cancelBtn.input.cursor = 'pointer';
    const cancelTxt = this.add.text(cx + 60, cy + popupH / 2 - 30, '\uCDE8\uC18C', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(102);

    const closePopup = () => {
      overlay.destroy();
      popupBg.destroy();
      warnText.destroy();
      msgText.destroy();
      // Phase 70: descKo 구분선 + 텍스트 파괴
      descDivider.destroy();
      descText.destroy();
      if (replaceText) replaceText.destroy();
      okBtn.destroy(); okTxt.destroy();
      cancelBtn.destroy(); cancelTxt.destroy();
      this._branchPopupOpen = false;
    };

    okBtn.on('pointerdown', () => {
      closePopup();
      this._applyBranchCard(cardDef);
    });
    cancelBtn.on('pointerdown', () => {
      closePopup();
    });
  }

  /**
   * 분기 카드 선택을 확정하여 SaveManager에 반영하고 분기 탭 UI를 갱신한다.
   * @param {object} cardDef - 선택한 카드 정의
   * @private
   */
  _applyBranchCard(cardDef) {
    // 카테고리별 저장 헬퍼 호출
    switch (cardDef.category) {
      case 'mutation':
        if (cardDef.targetToolId) {
          SaveManager.applyToolMutation(cardDef.targetToolId, cardDef.id);
        }
        break;
      case 'recipe':
        if (cardDef.recipeId) {
          SaveManager.unlockBranchRecipe(cardDef.recipeId);
        }
        break;
      case 'bond':
        SaveManager.unlockChefBond(cardDef.id);
        break;
      case 'blessing': {
        const stages = cardDef.blessingEffect ? (cardDef.blessingEffect.stages | 0) : 0;
        SaveManager.setActiveBlessing({ id: cardDef.id, remainingStages: stages });
        break;
      }
      default:
        // 알 수 없는 카테고리는 저장 없이 진행
        break;
    }

    // 방문 선택 완료 마킹
    SaveManager.markVisitSelection(this.stageId, cardDef.id);

    // 로컬 상태 갱신
    this._branchCardSelected = true;
    this._branchSelectedCardId = cardDef.id;

    // Phase 70: 카드 선택 완료 후 출발 버튼 활성화
    this._updateDepartButtonState();

    // 분기 탭 UI 재렌더 (기존 요소 파괴 후 재생성)
    this._rebuildBranchTab();
  }

  /**
   * 분기 탭 콘텐츠를 파괴 후 재생성한다. 선택 전/후 상태 전환에 사용.
   * @private
   */
  _rebuildBranchTab() {
    if (this._branchTabElements) {
      this._branchTabElements.forEach(el => el.destroy());
      this._branchTabElements = null;
    }
    this._createBranchCardArea();
    // 현재 활성 탭 기준 가시성 재적용
    const isBranch = this._activeTab === 'branch';
    if (this._branchTabElements) {
      this._branchTabElements.forEach(el => el.setVisible(isBranch));
    }
  }

  // ── Phase 70: 출발 버튼 disabled 제어 ──────────────────────────────

  /**
   * 분기 탭 활성 + 카드 미선택 시 출발 버튼을 disabled(회색)로,
   * 그 외에는 활성(녹색)으로 설정한다.
   * @private
   */
  _updateDepartButtonState() {
    const shouldDisable = this._activeTab === 'branch' && !this._branchCardSelected;
    this._departDisabled = shouldDisable;
    if (this._departBtn) {
      this._departBtn.setTint(shouldDisable ? 0x666666 : 0x22aa44);
    }
  }

  /**
   * disabled 상태의 출발 버튼 클릭 시 "분기 카드를 선택하세요" 토스트를 1.5초간 표시한다.
   * 동시 2개 이상 생성을 방지한다.
   * @private
   */
  _showDepartToast() {
    if (this._departToastActive) return;
    this._departToastActive = true;

    const toastText = this.add.text(GAME_WIDTH / 2, DEPART_BTN_Y - 40,
      '\uBD84\uAE30 \uCE74\uB4DC\uB97C \uC120\uD0DD\uD558\uC138\uC694', {
        fontSize: '13px', color: '#ffcc88',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(200);

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: toastText,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          toastText.destroy();
          this._departToastActive = false;
        },
      });
    });
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
