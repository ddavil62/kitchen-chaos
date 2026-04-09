/**
 * @fileoverview 통합 상점 씬.
 * Phase 5: 업그레이드 탭 + 레시피 해금 탭.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { UPGRADE_DEFS, UPGRADE_IDS } from '../data/upgradeData.js';
import { ALL_SERVING_RECIPES, ALL_BUFF_RECIPES, TIER_COLORS, TIER_NAMES, RECIPE_CATEGORIES } from '../data/recipeData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    /** @type {'upgrade'|'recipe'} */
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
      { key: 'recipe', label: '레시피 해금' },
    ];

    this._tabBgs = {};
    this._tabTexts = {};

    tabs.forEach((tab, i) => {
      const x = 10 + i * (GAME_WIDTH / 2);
      const w = GAME_WIDTH / 2 - 10;

      const bg = this.add.rectangle(x + w / 2, tabY, w, 30, 0x333333)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(x + w / 2, tabY, tab.label, {
        fontSize: '14px', fontStyle: 'bold', color: '#aaaaaa',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        this._activeTab = tab.key;
        this._recipeFilter = 'all';
        this._updateTabHighlight();
        this._renderContent();
      });

      this._tabBgs[tab.key] = bg;
      this._tabTexts[tab.key] = txt;
    });

    this._updateTabHighlight();
  }

  _updateTabHighlight() {
    for (const key of ['upgrade', 'recipe']) {
      const active = key === this._activeTab;
      this._tabBgs[key].setFillStyle(active ? 0x553300 : 0x333333);
      this._tabTexts[key].setColor(active ? '#ffd700' : '#aaaaaa');
    }
  }

  // ── 콘텐츠 ──

  _renderContent() {
    if (this._contentContainer) this._contentContainer.destroy();
    this._contentContainer = this.add.container(0, 0);

    if (this._activeTab === 'upgrade') {
      this._renderUpgrades();
    } else {
      this._renderRecipeShop();
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

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   */
  _fadeToScene(sceneKey) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey);
    });
  }
}
