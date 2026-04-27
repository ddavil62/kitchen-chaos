/**
 * @fileoverview 통합 상점 씬.
 * Phase 5: 업그레이드 탭 + 레시피 해금 탭.
 * Phase 8-3: 테이블 탭, 인테리어 탭, 직원 탭 추가.
 * Phase 8-4: 직원 탭 구현 (서빙/세척 도우미 구매, IAP 추상화).
 */

import Phaser from 'phaser';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { UPGRADE_DEFS, UPGRADE_IDS } from '../data/upgradeData.js';
import { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES, TIER_COLORS, TIER_NAMES, RECIPE_CATEGORIES } from '../data/recipeData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { STAFF_TYPES } from '../data/staffData.js';
import { TutorialManager } from '../managers/TutorialManager.js';
import { WANDERING_CHEFS, GRADE_NAMES, GRADE_COLORS } from '../data/wanderingChefData.js';

// ── Phase 8-3: 테이블/인테리어 상수 ──

/** 테이블 업그레이드 비용 (Lv0->1, 1->2, 2->3, 3->4) */
const TABLE_UPGRADE_COSTS = [20, 45, 80, 130];

/** 테이블 해금 비용 (5번, 6번, 7번, 8번) */
const TABLE_UNLOCK_COSTS = [40, 40, 70, 70];

/** 테이블 등급 이름 */
const TABLE_GRADE_NAMES = ['나무 탁자', '깔끔한 테이블', '고급 테이블', 'VIP 테이블', '프리미엄 스위트'];

/** 테이블 등급별 팁 배율 */
const TABLE_TIP_MULTS = [1.0, 1.1, 1.25, 1.4, 1.6];

/** 테이블 등급별 인내심 보너스 (%) */
const TABLE_PATIENCE_PCTS = [0, 5, 10, 18, 25];

/** 인테리어 정의 */
const INTERIOR_DEFS = [
  {
    type: 'flower',
    nameKo: '꽃병',
    icon: '🌸',
    desc: '손님 인내심',
    effectPcts: [0, 5, 10, 16, 22, 30],
    costs: [15, 30, 50, 80, 120],
  },
  {
    type: 'kitchen',
    nameKo: '오픈 키친',
    icon: '🍳',
    desc: '조리 속도',
    effectPcts: [0, 5, 10, 16, 22, 30],
    costs: [20, 40, 65, 100, 150],
  },
  {
    type: 'lighting',
    nameKo: '고급 조명',
    icon: '💡',
    desc: '팁 보너스',
    effectPcts: [0, 8, 16, 25, 35, 50],
    costs: [15, 35, 55, 85, 130],
  },
];

/** 모든 탭 키 목록 */
const ALL_TABS = ['upgrade', 'recipe', 'table', 'interior', 'staff'];

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    /** @type {'upgrade'|'recipe'|'table'|'interior'|'staff'} */
    this._activeTab = 'upgrade';
    /** @type {string} */
    this._recipeFilter = 'all';
    /** @type {Phaser.GameObjects.Container} */
    this._contentContainer = null;

    // Phase 60-14: 씬 배경 rectangle → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');

    // 상단 바: 타이틀 + 코인
    this._coinText = this.add.text(GAME_WIDTH - 20, 25, '', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0.5);
    this._updateCoinDisplay();

    this.add.text(20, 25, '주방 상점', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#8b4500', strokeThickness: 4,
    }).setOrigin(0, 0.5);

    // 탭 버튼
    this._createTabs();

    // 콘텐츠 영역
    this._renderContent();

    // ── Phase 11-3a: 상점 튜토리얼 ──
    this._tutorial = new TutorialManager(this, 'shop', [
      '1/3 \uC8FC\uBC29 \uCF54\uC778\uC73C\uB85C\n\uC5C5\uADF8\uB808\uC774\uB4DC\uB97C \uAD6C\uB9E4\uD558\uC138\uC694!',
      '2/3 \uB808\uC2DC\uD53C \uD0ED\uC5D0\uC11C\n\uC0C8 \uBA54\uB274\uB97C \uD574\uAE08\uD560 \uC218 \uC788\uC5B4\uC694!',
      '3/3 \uD14C\uC774\uBE14\xB7\uC778\uD14C\uB9AC\uC5B4\xB7\uC9C1\uC6D0 \uD0ED\uC73C\uB85C\n\uB808\uC2A4\uD1A0\uB791\uC744 \uC131\uC7A5\uC2DC\uD0A4\uC138\uC694!',
    ]);
    // 트리거: 1-1 클리어 후 첫 진입 (stage 1-1이 cleared 상태)
    const stage1cleared = !!SaveManager.load().stages?.['1-1']?.cleared;
    if (stage1cleared) {
      this._tutorial.start();
    }

    // Phase 60-14: 하단 돌아가기 버튼 rectangle+text → NineSliceFactory.button 'secondary'
    const backBtn = NineSliceFactory.button(
      this, GAME_WIDTH / 2, GAME_HEIGHT - 35, 180, 40,
      '돌아가기',
      {
        variant: 'secondary',
        textStyle: { fontSize: '16px', color: '#cccccc', stroke: '#000', strokeThickness: 2 },
        onClick: () => this._fadeToScene('MenuScene'),
      }
    );
  }

  /** 코인 표시 갱신 */
  _updateCoinDisplay() {
    this._coinText.setText(`🪙 ${SaveManager.getCoins()}`);
  }

  // ── 탭 ──

  _createTabs() {
    const tabY = 60;
    const tabs = [
      { key: 'upgrade', label: '업그레이드' },
      { key: 'recipe', label: '레시피' },
      { key: 'table', label: '테이블' },
      { key: 'interior', label: '인테리어' },
      { key: 'staff', label: '직원' },
    ];

    this._tabBgs = {};
    this._tabTexts = {};

    const tabCount = tabs.length;
    const tabW = Math.floor((GAME_WIDTH - 10) / tabCount);

    // Phase 60-14: 탭 rectangle → NineSliceFactory.tab (active/inactive 텍스처 스왑)
    tabs.forEach((tab, i) => {
      const x = 5 + i * tabW;
      const w = tabW - 2;

      const tabContainer = NineSliceFactory.tab(
        this, x + w / 2, tabY, w, 28, tab.label,
        { active: tab.key === this._activeTab, textStyle: { fontSize: '11px', fontStyle: 'bold' } }
      );
      const tabHitArea = new Phaser.Geom.Rectangle(-w / 2, -14, w, 28);
      tabContainer.setInteractive(tabHitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

      tabContainer.on('pointerdown', () => {
        const prevTab = this._activeTab;
        this._activeTab = tab.key;
        this._recipeFilter = 'all';
        this._updateTabHighlight();
        this._renderContent();

        // ── Phase 11-3a: 상점 튜토리얼 진행 ──
        if (this._tutorial?.isActive()) {
          const step = this._tutorial._stepIndex;
          if (step === 0 && prevTab === 'upgrade' && tab.key !== 'upgrade') {
            this._tutorial.advance();
          } else if (step === 1 && tab.key === 'recipe') {
            this._tutorial.advance();
          } else if (step === 2 && (tab.key === 'table' || tab.key === 'interior' || tab.key === 'staff')) {
            this._tutorial.advance();
          }
        }
      });

      this._tabBgs[tab.key] = tabContainer;
      this._tabTexts[tab.key] = tabContainer._label;
    });

    this._updateTabHighlight();
  }

  // Phase 60-14: setFillStyle/setColor → NineSliceFactory.tab.setActive 텍스처 스왑
  _updateTabHighlight() {
    for (const key of ALL_TABS) {
      const active = key === this._activeTab;
      this._tabBgs[key].setActive(active);
      this._tabTexts[key].setColor(active ? '#ffd700' : '#aaaaaa');
    }
  }

  // ── 콘텐츠 ──

  _renderContent() {
    if (this._contentContainer) this._contentContainer.destroy();
    this._contentContainer = this.add.container(0, 0);

    switch (this._activeTab) {
      case 'upgrade':
        this._renderUpgrades();
        break;
      case 'recipe':
        this._renderRecipeShop();
        break;
      case 'table':
        this._renderTableShop();
        break;
      case 'interior':
        this._renderInteriorShop();
        break;
      case 'staff':
        this._renderStaffShop();
        break;
    }
  }

  // ── 업그레이드 탭 ──

  _renderUpgrades() {
    const startY = 100;
    const cardH = 75;

    UPGRADE_IDS.forEach((id, i) => {
      const def = UPGRADE_DEFS[id];
      const lvl = UpgradeManager.getLevel(id);
      const isMax = lvl >= def.maxLevel;
      const cost = isMax ? 0 : def.costs[lvl];
      const y = startY + i * cardH;

      // Phase 60-14: 카드 배경 rectangle → NineSliceFactory.panel 'dark'
      const cardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 8, 'dark');
      this._contentContainer.add(cardBg);

      // 이름 + 레벨
      const nameStr = `${def.nameKo}`;
      const lvlStr = isMax ? 'MAX' : `Lv.${lvl}/${def.maxLevel}`;
      this._contentContainer.add(
        this.add.text(30, y + 12, nameStr, {
          fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
        })
      );
      this._contentContainer.add(
        this.add.text(GAME_WIDTH - 30, y + 12, lvlStr, {
          fontSize: '14px', color: isMax ? '#44ff44' : '#ffcc00',
        }).setOrigin(1, 0)
      );

      // 효과 설명
      const currentEffect = lvl * def.effectPerLevel;
      const effectStr = def.id === 'fridge' ? `재료 보유량 +${currentEffect}`
        : def.id === 'knife' ? `공격속도 +${Math.round(currentEffect * 100)}%`
        : def.id === 'delivery_speed' ? `수거속도 +${Math.round(currentEffect * 100)}%`
        : `조리시간 -${Math.round(currentEffect * 100)}%`;

      // W-4 Fix: 텍스트 오버플로우 방지 — wordWrap 적용 (화면 너비 - 좌우 패딩 120px)
      this._contentContainer.add(
        this.add.text(30, y + 34, `${def.desc}  (현재: ${effectStr})`, {
          fontSize: '11px', color: '#aaaaaa',
          wordWrap: { width: GAME_WIDTH - 120 },
        })
      );

      // Phase 60-14: 구매 버튼 rectangle → NineSliceFactory.button 'primary'
      if (!isMax) {
        const coins = SaveManager.getCoins();
        const canBuy = coins >= cost;
        const btnX = GAME_WIDTH - 60;
        const btnY = y + 42;

        const btn = NineSliceFactory.button(
          this, btnX, btnY, 60, 24, `${cost} 🪙`,
          {
            variant: 'primary',
            disabled: !canBuy,
            textStyle: { fontSize: '12px', fontStyle: 'bold', color: canBuy ? '#ffcc00' : '#666666' },
            onClick: () => {
              if (UpgradeManager.purchase(id)) {
                this._updateCoinDisplay();
                this._renderContent();
              }
            },
          }
        );
        this._contentContainer.add(btn);
      }
    });
  }

  // ── 레시피 해금 탭 ──

  _renderRecipeShop() {
    // 카테고리 필터 바
    const filterY = 94;
    const cats = RECIPE_CATEGORIES;
    const catW = Math.floor((GAME_WIDTH - 20) / cats.length);

    // Phase 60-14: 필터 버튼 rectangle → NineSliceFactory.tab (active/inactive 스왑)
    cats.forEach((cat, i) => {
      const x = 10 + i * catW + catW / 2;
      const active = this._recipeFilter === cat.id;

      const filterTab = NineSliceFactory.tab(
        this, x, filterY, catW - 4, 22, cat.nameKo,
        { active, textStyle: { fontSize: '10px', color: active ? '#ffd700' : '#888888' } }
      );
      const hitArea = new Phaser.Geom.Rectangle(-(catW - 4) / 2, -11, catW - 4, 22);
      filterTab.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      this._contentContainer.add(filterTab);

      filterTab.on('pointerdown', () => {
        this._recipeFilter = cat.id;
        this._renderContent();
      });
    });

    // 레시피 리스트
    const allRecipes = [...ALL_SERVING_RECIPES, ...ALL_BUFF_RECIPES];
    const filtered = this._recipeFilter === 'all'
      ? allRecipes
      : allRecipes.filter(r => r.category === this._recipeFilter);

    // 스타터가 아닌 것만 표시 (해금 상점이므로)
    const shopRecipes = filtered.filter(r => !r.starter);

    const startY = 116;
    const rowH = 52;
    const visibleH = GAME_HEIGHT - startY - 60;
    const maxVisible = Math.floor(visibleH / rowH);

    shopRecipes.slice(0, maxVisible).forEach((recipe, i) => {
      const y = startY + i * rowH;
      const isUnlocked = RecipeManager.isUnlocked(recipe.id);
      const isVisible = RecipeManager.isVisible(recipe.id);
      const canUnlock = RecipeManager.canUnlock(recipe.id);
      const canAfford = canUnlock && SaveManager.getCoins() >= recipe.unlockCost;

      // 등급 색상 라인
      const tierColor = TIER_COLORS[recipe.tier] || 0xcccccc;

      // Phase 60-14: 레시피 카드 배경 rectangle → NineSliceFactory.panel
      // 해금 완료: 'stone' (녹색 tint), 미해금: 'dark' (등급색 tint)
      const cardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, y + rowH / 2, 340, rowH - 4,
        isUnlocked ? 'stone' : 'dark');
      if (isUnlocked) cardBg.setTint(0x88cc88);
      this._contentContainer.add(cardBg);

      if (!isVisible) {
        // 게이트 미충족 — ??? 표시
        this._contentContainer.add(
          this.add.text(30, y + 8, `🔒 ??? (${TIER_NAMES[recipe.tier]})`, {
            fontSize: '14px', color: '#555555',
          })
        );
        const gate = recipe.gateStage || '?';
        this._contentContainer.add(
          this.add.text(30, y + 28, `${gate} 클리어 필요`, {
            fontSize: '10px', color: '#444444',
          })
        );
      } else if (isUnlocked) {
        // 해금 완료
        this._contentContainer.add(
          this.add.text(30, y + 8, `${recipe.icon} ${recipe.nameKo}`, {
            fontSize: '14px', fontStyle: 'bold', color: '#88ff88',
          })
        );
        const ingStr = Object.entries(recipe.ingredients)
          .map(([k, v]) => `${k}×${v}`).join(' ');
        const rewardStr = recipe.baseReward ? `→ ${recipe.baseReward}G` : recipe.effectDesc || '';
        this._contentContainer.add(
          this.add.text(30, y + 28, `${ingStr}  ${rewardStr}`, {
            fontSize: '10px', color: '#66aa66',
          })
        );
        this._contentContainer.add(
          this.add.text(GAME_WIDTH - 30, y + rowH / 2, '✓', {
            fontSize: '18px', color: '#44ff44',
          }).setOrigin(1, 0.5)
        );
      } else {
        // 해금 가능
        this._contentContainer.add(
          this.add.text(30, y + 8, `${recipe.icon} ${recipe.nameKo}  ${TIER_NAMES[recipe.tier]}`, {
            fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
          })
        );
        const ingStr = Object.entries(recipe.ingredients)
          .map(([k, v]) => `${k}×${v}`).join(' ');
        const rewardStr = recipe.baseReward ? `→ ${recipe.baseReward}G` : recipe.effectDesc || '';
        this._contentContainer.add(
          this.add.text(30, y + 28, `${ingStr}  ${rewardStr}`, {
            fontSize: '10px', color: '#aaaaaa',
          })
        );

        // Phase 60-14: 해금 버튼 rectangle → NineSliceFactory.button 'primary'
        const btnX = GAME_WIDTH - 55;
        const btnY2 = y + rowH / 2;
        const unlockBtn = NineSliceFactory.button(
          this, btnX, btnY2, 70, 26, `${recipe.unlockCost} 🪙`,
          {
            variant: 'primary',
            disabled: !canAfford,
            textStyle: { fontSize: '12px', fontStyle: 'bold', color: canAfford ? '#ffcc00' : '#666666' },
            onClick: () => {
              if (RecipeManager.purchaseRecipe(recipe.id)) {
                this._updateCoinDisplay();
                this._renderContent();
              }
            },
          }
        );
        this._contentContainer.add(unlockBtn);
      }
    });

    // 표시되지 않은 레시피 수 안내
    if (shopRecipes.length > maxVisible) {
      this._contentContainer.add(
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 65, `외 ${shopRecipes.length - maxVisible}종...`, {
          fontSize: '11px', color: '#666666',
        }).setOrigin(0.5)
      );
    }
  }

  // ── 테이블 탭 (Phase 8-3) ──

  /**
   * 테이블 업그레이드/해금 상점 렌더링.
   * 해금된 테이블은 현재 등급 + 업그레이드 버튼,
   * 미해금 테이블은 해금 버튼 표시.
   * @private
   */
  _renderTableShop() {
    const startY = 90;
    const cardH = 65;
    const unlockedCount = SaveManager.getUnlockedTables();
    const maxTables = 8;
    const coins = SaveManager.getCoins();

    // 섹션 헤더: 해금된 테이블
    this._contentContainer.add(
      this.add.text(20, startY, '테이블 업그레이드', {
        fontSize: '13px', fontStyle: 'bold', color: '#ffd700',
      })
    );

    let y = startY + 24;

    // 해금된 테이블 목록
    for (let i = 0; i < unlockedCount; i++) {
      const grade = SaveManager.getTableUpgrade(i);
      const isMax = grade >= 4;
      const gradeName = TABLE_GRADE_NAMES[grade];
      const nextGradeName = isMax ? '' : TABLE_GRADE_NAMES[grade + 1];
      const cost = isMax ? 0 : TABLE_UPGRADE_COSTS[grade];

      // Phase 60-14: 테이블 카드 배경 rectangle → NineSliceFactory.panel 'dark'
      const cardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 6, 'dark');
      this._contentContainer.add(cardBg);

      // 테이블 번호 + 현재 등급
      this._contentContainer.add(
        this.add.text(20, y + 8, `#${i + 1} ${gradeName}`, {
          fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
        })
      );

      // 레벨 표시
      const lvlStr = isMax ? 'MAX' : `Lv.${grade}/4`;
      this._contentContainer.add(
        this.add.text(GAME_WIDTH - 20, y + 8, lvlStr, {
          fontSize: '12px', color: isMax ? '#44ff44' : '#ffcc00',
        }).setOrigin(1, 0)
      );

      // 현재 효과
      this._contentContainer.add(
        this.add.text(20, y + 28, `팁 x${TABLE_TIP_MULTS[grade]}  인내심 +${TABLE_PATIENCE_PCTS[grade]}%`, {
          fontSize: '10px', color: '#aaaaaa',
        })
      );

      // 업그레이드 버튼
      if (!isMax) {
        const canBuy = coins >= cost;
        const btnX = GAME_WIDTH - 55;
        const btnY = y + 38;

        // Phase 60-14: 테이블 업그레이드 버튼 rectangle → NineSliceFactory.button 'primary'
        const btn = NineSliceFactory.button(
          this, btnX, btnY, 70, 22, `${cost} 🪙`,
          {
            variant: 'primary',
            disabled: !canBuy,
            textStyle: { fontSize: '11px', fontStyle: 'bold', color: canBuy ? '#ffcc00' : '#666666' },
            onClick: () => {
              if (SaveManager.spendCoins(cost)) {
                SaveManager.upgradeTable(i);
                this._updateCoinDisplay();
                this._renderContent();
              }
            },
          }
        );
        this._contentContainer.add(btn);

        // 다음 등급 효과 미리보기
        this._contentContainer.add(
          this.add.text(20, y + 42, `→ ${nextGradeName} (팁 x${TABLE_TIP_MULTS[grade + 1]}, 인내심 +${TABLE_PATIENCE_PCTS[grade + 1]}%)`, {
            fontSize: '9px', color: '#888888',
          })
        );
      }

      y += cardH;
    }

    // 미해금 테이블 섹션
    if (unlockedCount < maxTables) {
      y += 10;
      this._contentContainer.add(
        this.add.text(20, y, '테이블 해금', {
          fontSize: '13px', fontStyle: 'bold', color: '#ffd700',
        })
      );
      y += 24;

      for (let i = unlockedCount; i < maxTables; i++) {
        const unlockCost = TABLE_UNLOCK_COSTS[i - 4]; // 5~8번 → 인덱스 0~3
        const canBuy = coins >= unlockCost;
        // 이전 테이블이 해금되어야 다음 해금 가능
        const isNext = i === unlockedCount;

        // Phase 60-14: 잠긴 테이블 카드 배경 rectangle → NineSliceFactory.panel 'stone'
        const cardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, y + 28, 340, 44, 'stone');
        this._contentContainer.add(cardBg);

        // 잠김 표시
        const lockColor = isNext ? '#ffffff' : '#555555';
        this._contentContainer.add(
          this.add.text(20, y + 14, `🔒 #${i + 1}번 테이블`, {
            fontSize: '14px', fontStyle: 'bold', color: lockColor,
          })
        );

        // 레이아웃 힌트
        const layoutHint = (i + 1) <= 6 ? '2x3' : '2x4';
        this._contentContainer.add(
          this.add.text(20, y + 34, `레이아웃: ${layoutHint}`, {
            fontSize: '10px', color: '#666666',
          })
        );

        // 해금 버튼 (순서대로만 해금 가능)
        if (isNext) {
          const btnX = GAME_WIDTH - 55;
          const btnY = y + 28;

          // Phase 60-14: 테이블 해금 버튼 rectangle → NineSliceFactory.button 'primary'
          const btn = NineSliceFactory.button(
            this, btnX, btnY, 70, 24, `${unlockCost} 🪙`,
            {
              variant: 'primary',
              disabled: !canBuy,
              textStyle: { fontSize: '12px', fontStyle: 'bold', color: canBuy ? '#ffcc00' : '#666666' },
              onClick: () => {
                if (SaveManager.spendCoins(unlockCost)) {
                  SaveManager.unlockTable();
                  this._updateCoinDisplay();
                  this._renderContent();
                }
              },
            }
          );
          this._contentContainer.add(btn);
        }

        y += 50;
      }
    }
  }

  // ── 인테리어 탭 (Phase 8-3) ──

  /**
   * 인테리어 3종 업그레이드 상점 렌더링.
   * @private
   */
  _renderInteriorShop() {
    const startY = 90;
    const cardH = 112; // Phase 74: P1-7/P2-4 오버플로우 수정 (90→112)
    const coins = SaveManager.getCoins();

    // 섹션 헤더
    this._contentContainer.add(
      this.add.text(20, startY, '인테리어 업그레이드', {
        fontSize: '13px', fontStyle: 'bold', color: '#ffd700',
      })
    );

    INTERIOR_DEFS.forEach((def, i) => {
      const y = startY + 24 + i * cardH;
      const level = SaveManager.getInteriorLevel(def.type);
      const isMax = level >= 5;
      const cost = isMax ? 0 : def.costs[level];

      // Phase 60-14: 인테리어 카드 배경 rectangle → NineSliceFactory.panel 'dark'
      const cardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 6, 'dark');
      this._contentContainer.add(cardBg);

      // 이름 + 아이콘
      this._contentContainer.add(
        this.add.text(20, y + 8, `${def.icon} ${def.nameKo}`, {
          fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
        })
      );

      // 레벨 표시
      const lvlStr = isMax ? 'MAX' : `Lv.${level}/5`;
      this._contentContainer.add(
        this.add.text(GAME_WIDTH - 20, y + 8, lvlStr, {
          fontSize: '13px', color: isMax ? '#44ff44' : '#ffcc00',
        }).setOrigin(1, 0)
      );

      // 현재 효과
      this._contentContainer.add(
        this.add.text(20, y + 30, `${def.desc} +${def.effectPcts[level]}%`, {
          fontSize: '12px', color: '#aaaaaa',
        })
      );

      // Phase 60-14: 레벨 게이지 바 rectangle → NineSliceFactory.progressBar
      const barX = 20;
      const barY = y + 50;
      const barW = 200;
      const barH = 14; // bar_frame_h insets(6+6) 수용을 위해 8→14 확장
      const progBar = NineSliceFactory.progressBar(
        this, barX + barW / 2, barY, barW, barH,
        { tint: 0x44aa44, value: level / 5, shine: false }
      );
      this._contentContainer.add(progBar);
      // 레벨 점 표시 (5단계)
      for (let lv = 0; lv < 5; lv++) {
        const dotX = barX + Math.floor(barW * ((lv + 0.5) / 5));
        const dotColor = lv < level ? '#44ff44' : '#555555';
        this._contentContainer.add(
          this.add.text(dotX, barY, '●', {
            fontSize: '8px', color: dotColor,
          }).setOrigin(0.5)
        );
      }

      // 업그레이드 버튼
      if (!isMax) {
        const canBuy = coins >= cost;
        const btnX = GAME_WIDTH - 55;
        const btnY2 = y + 74; // Phase 74: cardH 112 대응 (62→74)

        // Phase 60-14: 인테리어 업그레이드 버튼 rectangle → NineSliceFactory.button 'primary'
        const btn = NineSliceFactory.button(
          this, btnX, btnY2, 70, 24, `${cost} 🪙`,
          {
            variant: 'primary',
            disabled: !canBuy,
            textStyle: { fontSize: '12px', fontStyle: 'bold', color: canBuy ? '#ffcc00' : '#666666' },
            onClick: () => {
              if (SaveManager.spendCoins(cost)) {
                SaveManager.upgradeInterior(def.type);
                this._updateCoinDisplay();
                this._renderContent();
              }
            },
          }
        );
        this._contentContainer.add(btn);

        // 다음 효과 미리보기 — Phase 74: cardH 112 대응 (65→80)
        this._contentContainer.add(
          this.add.text(20, y + 80, `→ Lv.${level + 1}: ${def.desc} +${def.effectPcts[level + 1]}%`, {
            fontSize: '9px', color: '#888888',
          })
        );
      }
    });
  }

  // ── 직원 탭 (Phase 8-4) ──

  /**
   * 직원 탭 — 서빙/세척 도우미 카드 + 구매 로직.
   * staffData.js의 purchaseType에 따라 코인/IAP 분기 (현재는 코인만).
   * @private
   */
  _renderStaffShop() {
    const startY = 90;
    const cardH = 112; // Phase 74: P1-7/P2-4 오버플로우 수정 (90→112)
    const coins = SaveManager.getCoins();

    // 섹션 헤더
    this._contentContainer.add(
      this.add.text(20, startY, '\uD83E\uDDD1\u200D\uD83C\uDF73 \uC9C1\uC6D0 \uACE0\uC6A9', {
        fontSize: '14px', fontStyle: 'bold', color: '#ffd700',
      })
    );

    const staffIds = Object.keys(STAFF_TYPES);

    staffIds.forEach((staffId, i) => {
      const staffType = STAFF_TYPES[staffId];
      const hired = SaveManager.isStaffHired(staffId);
      const y = startY + 28 + i * cardH;

      // Phase 60-14: 직원 카드 배경 rectangle → NineSliceFactory.panel
      const cardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 6,
        hired ? 'stone' : 'dark');
      if (hired) cardBg.setTint(0x88cc88);
      this._contentContainer.add(cardBg);

      // 아이콘 + 이름
      this._contentContainer.add(
        this.add.text(20, y + 10, `${staffType.icon} ${staffType.nameKo}`, {
          fontSize: '15px', fontStyle: 'bold', color: hired ? '#88ff88' : '#ffffff',
        })
      );

      // 설명
      this._contentContainer.add(
        this.add.text(20, y + 32, staffType.desc, {
          fontSize: '11px', color: '#aaaaaa',
        })
      );

      if (hired) {
        // 이미 고용됨
        this._contentContainer.add(
          this.add.text(GAME_WIDTH - 30, y + cardH / 2, '\uACE0\uC6A9\uB428 \u2705', {
            fontSize: '14px', fontStyle: 'bold', color: '#44ff44',
          }).setOrigin(1, 0.5)
        );
      } else {
        // 가격 표시 + 구매 버튼
        if (staffType.purchaseType === 'coin') {
          const canBuy = coins >= staffType.price;
          const btnX = GAME_WIDTH - 55;
          const btnY = y + 72; // Phase 74: cardH 112 대응 (55→72)

          // Phase 60-14: 직원 구매 버튼 rectangle → NineSliceFactory.button 'primary'
          const btn = NineSliceFactory.button(
            this, btnX, btnY, 80, 26, `${staffType.price} \uD83E\uDE99`,
            {
              variant: 'primary',
              disabled: !canBuy,
              textStyle: { fontSize: '13px', fontStyle: 'bold', color: canBuy ? '#ffcc00' : '#666666' },
              onClick: () => {
                if (SaveManager.spendCoins(staffType.price)) {
                  SaveManager.hireStaff(staffId);
                  this._updateCoinDisplay();
                  this._renderContent();
                }
              },
            }
          );
          this._contentContainer.add(btn);

          // 가격 설명 — Phase 74: cardH 112 대응 (52→55)
          this._contentContainer.add(
            this.add.text(20, y + 55, `\uC601\uAD6C \uD574\uAE08 \u2014 ${staffType.price}\uCF54\uC778`, {
              fontSize: '10px', color: '#888888',
            })
          );
        } else if (staffType.purchaseType === 'iap') {
          // IAP 미구현 — 잠금 표시
          this._contentContainer.add(
            this.add.text(GAME_WIDTH - 30, y + cardH / 2, '\uD83D\uDD12 IAP', {
              fontSize: '13px', color: '#555555',
            }).setOrigin(1, 0.5)
          );
        }
      }
    });

    // ── 유랑 미력사 고용 섹션 ──
    const wandererSectionY = startY + 28 + staffIds.length * cardH + 10;

    // Phase 60-14: 구분선 rectangle → NineSliceFactory.dividerH
    const divLine = NineSliceFactory.dividerH(this, GAME_WIDTH / 2, wandererSectionY, GAME_WIDTH - 20, 2);
    this._contentContainer.add(divLine);

    // 섹션 헤더
    this._contentContainer.add(
      this.add.text(20, wandererSectionY + 8, '\uD83D\uDCA0 \uC720\uB791 \uBBF8\uB825\uC0AC \uACE0\uC6A9', {
        fontSize: '14px', fontStyle: 'bold', color: '#b266ff',
      })
    );

    // 섹션 헤더 우측에 보유 정수 표시
    this._contentContainer.add(
      this.add.text(GAME_WIDTH - 20, wandererSectionY + 14, `\uD83D\uDCA0 ${SaveManager.getMireukEssence()} \uC815\uC218`, {
        fontSize: '11px', color: '#b266ff',
      }).setOrigin(1, 0.5)
    );

    // 현재 고용 수 / 상한 표시
    const hireLimit = SaveManager.getHireLimit();
    const hiredCount = SaveManager.getWanderingChefs().hired.length;
    const limitText = hireLimit === 0
      ? '(7-1 \uD074\uB9AC\uC5B4 \uD6C4 \uD574\uAE08)'
      : `\uACE0\uC6A9 \uC911: ${hiredCount}/${hireLimit}\uBA85`;
    this._contentContainer.add(
      this.add.text(GAME_WIDTH - 20, wandererSectionY + 10, limitText, {
        fontSize: '11px', color: '#888888',
      }).setOrigin(1, 0)
    );

    // "고용 화면 열기" 버튼 카드
    const wBtnY = wandererSectionY + 44;
    // Phase 60-14: 유랑 미력사 카드 배경 rectangle → NineSliceFactory.panel 'dark' + 보라 tint
    const wCardBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, wBtnY, 340, 52, 'dark');
    wCardBg.setTint(0xaa88cc);
    const wCardHit = new Phaser.Geom.Rectangle(-170, -26, 340, 52);
    wCardBg.setInteractive(wCardHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this._contentContainer.add(wCardBg);

    this._contentContainer.add(
      this.add.text(GAME_WIDTH / 2, wBtnY - 8, '\uC720\uB791 \uBBF8\uB825\uC0AC\uB97C \uACE0\uC6A9\uD558\uC5EC \uC601\uC5C5 \uB2A5\uB825\uC744 \uAC15\uD654\uD558\uC138\uC694', {
        fontSize: '10px', color: '#aa88cc',
      }).setOrigin(0.5)
    );

    // Phase 60-14: 고용 화면 열기 버튼 rectangle+text → NineSliceFactory.button 'secondary' + 보라 tint
    const openBtnX = GAME_WIDTH / 2;
    const openBtnY2 = wBtnY + 12;
    const openBtn = NineSliceFactory.button(
      this, openBtnX, openBtnY2, 160, 24, '\uACE0\uC6A9 \uD654\uBA74 \uC5F4\uAE30',
      {
        variant: 'secondary',
        textStyle: { fontSize: '12px', fontStyle: 'bold', color: '#e0aaff' },
        onClick: () => {
          this.scene.launch('WanderingChefModal');
          this.scene.pause();
        },
      }
    );
    openBtn._bg.setTint(0xaa88cc);
    this._contentContainer.add(openBtn);

    wCardBg.on('pointerdown', () => {
      this.scene.launch('WanderingChefModal');
      this.scene.pause();
    });
  }

  /**
   * 하드웨어 뒤로가기 핸들러. 메뉴 화면으로 복귀한다.
   */
  _onBack() {
    this._fadeToScene('MenuScene');
  }

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   */
  _fadeToScene(sceneKey) {
    // Phase 11-3a: 씬 전환 시 튜토리얼 정리
    this._tutorial?.end?.();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey);
    });
  }
}
