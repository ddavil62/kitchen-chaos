/**
 * @fileoverview 통합 상점 씬.
 * Phase 5: 업그레이드 탭 + 레시피 해금 탭.
 * Phase 8-3: 테이블 탭, 인테리어 탭, 직원 탭 추가.
 * Phase 8-4: 직원 탭 구현 (서빙/세척 도우미 구매, IAP 추상화).
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { UPGRADE_DEFS, UPGRADE_IDS } from '../data/upgradeData.js';
import { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES, TIER_COLORS, TIER_NAMES, RECIPE_CATEGORIES } from '../data/recipeData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { STAFF_TYPES } from '../data/staffData.js';
import { TutorialManager } from '../managers/TutorialManager.js';

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

    // 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a00);

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

    // 하단 돌아가기 버튼
    const backBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 35, 180, 40, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, '돌아가기', {
      fontSize: '16px', color: '#cccccc', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    backBtn.on('pointerdown', () => this._fadeToScene('MenuScene'));
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x666666));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x444444));
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

    tabs.forEach((tab, i) => {
      const x = 5 + i * tabW;
      const w = tabW - 2;

      const bg = this.add.rectangle(x + w / 2, tabY, w, 28, 0x333333)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(x + w / 2, tabY, tab.label, {
        fontSize: '11px', fontStyle: 'bold', color: '#aaaaaa',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        const prevTab = this._activeTab;
        this._activeTab = tab.key;
        this._recipeFilter = 'all';
        this._updateTabHighlight();
        this._renderContent();

        // ── Phase 11-3a: 상점 튜토리얼 진행 ──
        if (this._tutorial?.isActive()) {
          const step = this._tutorial._stepIndex;
          // step 0 → 1: 업그레이드 탭에서 다른 탭으로 이동
          if (step === 0 && prevTab === 'upgrade' && tab.key !== 'upgrade') {
            this._tutorial.advance();
          }
          // step 1 → 2: 레시피 탭 선택
          else if (step === 1 && tab.key === 'recipe') {
            this._tutorial.advance();
          }
          // step 2 → end: 테이블/인테리어/직원 탭 선택
          else if (step === 2 && (tab.key === 'table' || tab.key === 'interior' || tab.key === 'staff')) {
            this._tutorial.advance();
          }
        }
      });
      // Phase 11-3b: 탭 터치 피드백
      bg.on('pointerover', () => {
        if (tab.key !== this._activeTab) bg.setFillStyle(0x444444);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(tab.key === this._activeTab ? 0x553300 : 0x333333);
      });

      this._tabBgs[tab.key] = bg;
      this._tabTexts[tab.key] = txt;
    });

    this._updateTabHighlight();
  }

  _updateTabHighlight() {
    for (const key of ALL_TABS) {
      const active = key === this._activeTab;
      this._tabBgs[key].setFillStyle(active ? 0x553300 : 0x333333);
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

      // 카드 배경
      const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 8, 0x2a1a0a)
        .setStrokeStyle(1, 0x555533);
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

      this._contentContainer.add(
        this.add.text(30, y + 34, `${def.desc}  (현재: ${effectStr})`, {
          fontSize: '11px', color: '#aaaaaa',
        })
      );

      // 구매 버튼
      if (!isMax) {
        const coins = SaveManager.getCoins();
        const canBuy = coins >= cost;
        const btnX = GAME_WIDTH - 60;
        const btnY = y + 42;

        const btn = this.add.rectangle(btnX, btnY, 60, 24, canBuy ? 0x886600 : 0x333333)
          .setInteractive({ useHandCursor: canBuy });
        this._contentContainer.add(btn);

        const btnTxt = this.add.text(btnX, btnY, `${cost} 🪙`, {
          fontSize: '12px', fontStyle: 'bold',
          color: canBuy ? '#ffcc00' : '#666666',
        }).setOrigin(0.5);
        this._contentContainer.add(btnTxt);

        if (canBuy) {
          btn.on('pointerdown', () => {
            if (UpgradeManager.purchase(id)) {
              this._updateCoinDisplay();
              this._renderContent();
            }
          });
        }
      }
    });
  }

  // ── 레시피 해금 탭 ──

  _renderRecipeShop() {
    // 카테고리 필터 바
    const filterY = 94;
    const cats = RECIPE_CATEGORIES;
    const catW = Math.floor((GAME_WIDTH - 20) / cats.length);

    cats.forEach((cat, i) => {
      const x = 10 + i * catW + catW / 2;
      const active = this._recipeFilter === cat.id;

      const bg = this.add.rectangle(x, filterY, catW - 4, 22, active ? 0x553300 : 0x222222)
        .setInteractive({ useHandCursor: true });
      this._contentContainer.add(bg);

      const txt = this.add.text(x, filterY, cat.nameKo, {
        fontSize: '10px', color: active ? '#ffd700' : '#888888',
      }).setOrigin(0.5);
      this._contentContainer.add(txt);

      bg.on('pointerdown', () => {
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

      // 카드 배경
      const bgColor = isUnlocked ? 0x1a2a1a : 0x2a1a0a;
      const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + rowH / 2, 340, rowH - 4, bgColor)
        .setStrokeStyle(2, isUnlocked ? 0x44aa44 : tierColor);
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

        // 해금 버튼
        const btnX = GAME_WIDTH - 55;
        const btnY2 = y + rowH / 2;
        const btn = this.add.rectangle(btnX, btnY2, 70, 26, canAfford ? 0x886600 : 0x333333)
          .setInteractive({ useHandCursor: canAfford });
        this._contentContainer.add(btn);

        const btnTxt = this.add.text(btnX, btnY2, `${recipe.unlockCost} 🪙`, {
          fontSize: '12px', fontStyle: 'bold',
          color: canAfford ? '#ffcc00' : '#666666',
        }).setOrigin(0.5);
        this._contentContainer.add(btnTxt);

        if (canAfford) {
          btn.on('pointerdown', () => {
            if (RecipeManager.purchaseRecipe(recipe.id)) {
              this._updateCoinDisplay();
              this._renderContent();
            }
          });
        }
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

      // 카드 배경
      const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 6, 0x2a1a0a)
        .setStrokeStyle(1, 0x555533);
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

        const btn = this.add.rectangle(btnX, btnY, 70, 22, canBuy ? 0x886600 : 0x333333)
          .setInteractive({ useHandCursor: canBuy });
        this._contentContainer.add(btn);

        this._contentContainer.add(
          this.add.text(btnX, btnY, `${cost} 🪙`, {
            fontSize: '11px', fontStyle: 'bold',
            color: canBuy ? '#ffcc00' : '#666666',
          }).setOrigin(0.5)
        );

        // 다음 등급 효과 미리보기
        this._contentContainer.add(
          this.add.text(20, y + 42, `→ ${nextGradeName} (팁 x${TABLE_TIP_MULTS[grade + 1]}, 인내심 +${TABLE_PATIENCE_PCTS[grade + 1]}%)`, {
            fontSize: '9px', color: '#888888',
          })
        );

        if (canBuy) {
          btn.on('pointerdown', () => {
            if (SaveManager.spendCoins(cost)) {
              SaveManager.upgradeTable(i);
              this._updateCoinDisplay();
              this._renderContent();
            }
          });
        }
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

        const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + 28, 340, 44, 0x1a1a1a)
          .setStrokeStyle(1, 0x444444);
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

          const btn = this.add.rectangle(btnX, btnY, 70, 24, canBuy ? 0x886600 : 0x333333)
            .setInteractive({ useHandCursor: canBuy });
          this._contentContainer.add(btn);

          this._contentContainer.add(
            this.add.text(btnX, btnY, `${unlockCost} 🪙`, {
              fontSize: '12px', fontStyle: 'bold',
              color: canBuy ? '#ffcc00' : '#666666',
            }).setOrigin(0.5)
          );

          if (canBuy) {
            btn.on('pointerdown', () => {
              if (SaveManager.spendCoins(unlockCost)) {
                SaveManager.unlockTable();
                this._updateCoinDisplay();
                this._renderContent();
              }
            });
          }
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
    const cardH = 90;
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

      // 카드 배경
      const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 6, 0x2a1a0a)
        .setStrokeStyle(1, 0x555533);
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

      // 레벨 게이지 바
      const barX = 20;
      const barY = y + 50;
      const barW = 200;
      const barH = 8;
      const barBg = this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x333333);
      this._contentContainer.add(barBg);
      if (level > 0) {
        const fillW = Math.floor(barW * (level / 5));
        const barFill = this.add.rectangle(barX + fillW / 2, barY, fillW, barH, 0x44aa44)
          .setOrigin(0.5, 0.5);
        this._contentContainer.add(barFill);
      }
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
        const btnY2 = y + 62;

        const btn = this.add.rectangle(btnX, btnY2, 70, 24, canBuy ? 0x886600 : 0x333333)
          .setInteractive({ useHandCursor: canBuy });
        this._contentContainer.add(btn);

        this._contentContainer.add(
          this.add.text(btnX, btnY2, `${cost} 🪙`, {
            fontSize: '12px', fontStyle: 'bold',
            color: canBuy ? '#ffcc00' : '#666666',
          }).setOrigin(0.5)
        );

        // 다음 효과 미리보기
        this._contentContainer.add(
          this.add.text(20, y + 65, `→ Lv.${level + 1}: ${def.desc} +${def.effectPcts[level + 1]}%`, {
            fontSize: '9px', color: '#888888',
          })
        );

        if (canBuy) {
          btn.on('pointerdown', () => {
            if (SaveManager.spendCoins(cost)) {
              SaveManager.upgradeInterior(def.type);
              this._updateCoinDisplay();
              this._renderContent();
            }
          });
        }
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
    const cardH = 90;
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

      // 카드 배경
      const bgColor = hired ? 0x1a2a1a : 0x2a1a0a;
      const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + cardH / 2, 340, cardH - 6, bgColor)
        .setStrokeStyle(1, hired ? 0x44aa44 : 0x555533);
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
          const btnY = y + 55;

          const btn = this.add.rectangle(btnX, btnY, 80, 26, canBuy ? 0x886600 : 0x333333)
            .setInteractive({ useHandCursor: canBuy });
          this._contentContainer.add(btn);

          this._contentContainer.add(
            this.add.text(btnX, btnY, `${staffType.price} \uD83E\uDE99`, {
              fontSize: '13px', fontStyle: 'bold',
              color: canBuy ? '#ffcc00' : '#666666',
            }).setOrigin(0.5)
          );

          // 가격 설명
          this._contentContainer.add(
            this.add.text(20, y + 52, `\uC601\uAD6C \uD574\uAE08 \u2014 ${staffType.price}\uCF54\uC778`, {
              fontSize: '10px', color: '#888888',
            })
          );

          if (canBuy) {
            btn.on('pointerdown', () => {
              if (SaveManager.spendCoins(staffType.price)) {
                SaveManager.hireStaff(staffId);
                this._updateCoinDisplay();
                this._renderContent();
              }
            });
          }
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

    // ── 빈 슬롯: 향후 추가 직원 예정 ──
    const emptyY = startY + 28 + staffIds.length * cardH;
    const emptyBg = this.add.rectangle(GAME_WIDTH / 2, emptyY + 30, 340, 48, 0x1a1a1a)
      .setStrokeStyle(1, 0x333333);
    this._contentContainer.add(emptyBg);

    this._contentContainer.add(
      this.add.text(GAME_WIDTH / 2, emptyY + 22, '\uD5A5\uD6C4 \uCD94\uAC00 \uC9C1\uC6D0 \uC608\uC815', {
        fontSize: '12px', color: '#555555',
      }).setOrigin(0.5)
    );

    this._contentContainer.add(
      this.add.text(GAME_WIDTH / 2, emptyY + 38, '\uB2E4\uC74C \uC5C5\uB370\uC774\uD2B8\uC5D0\uC11C \uB9CC\uB098\uBCF4\uC138\uC694!', {
        fontSize: '10px', color: '#444444',
      }).setOrigin(0.5)
    );
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
