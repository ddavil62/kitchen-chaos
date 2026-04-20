/**
 * @fileoverview 게임 UI 컴포넌트.
 * 상단 HUD, 하단 타워 선택 패널, 재료 인벤토리, 조리소 패널을 관리한다.
 */

import { GAME_WIDTH, GAME_HEIGHT, BOTTOM_UI_HEIGHT, COOK_PANEL_H, COLORS, FONT_SIZE } from '../config.js';
import { TOWER_TYPES, RECIPES } from '../data/gameData.js';

const BOTTOM_Y = GAME_HEIGHT - BOTTOM_UI_HEIGHT;

export class GameUI {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} options
   * @param {Function} options.onTowerSelected - 타워 선택 콜백 (towerTypeId)
   * @param {Function} options.onCook - 요리 콜백 (recipeId)
   */
  constructor(scene, { onTowerSelected, onCook }) {
    this.scene = scene;
    this.onTowerSelected = onTowerSelected;
    this.onCook = onCook;

    this.selectedTowerType = null;
    this._towerButtons = {};
    this._inventory = {};
    this._buffInfo = null;
    this._cookPanelVisible = false;

    this._buildHUD();
    this._buildBottomPanel();

    // 이벤트 구독
    scene.events.on('inventory_changed', this._onInventoryChanged, this);
    scene.events.on('buff_activated', this._onBuffActivated, this);
    scene.events.on('buff_expired', this._onBuffExpired, this);
  }

  // ── HUD (상단 50px) ──────────────────────────────────────

  /**
   * 상단 HUD 생성.
   * @private
   */
  _buildHUD() {
    const s = this.scene;

    // 배경
    s.add.rectangle(GAME_WIDTH / 2, 25, GAME_WIDTH, 50, 0x1a0a00).setDepth(20);
    s.add.rectangle(GAME_WIDTH / 2, 50, GAME_WIDTH, 2, COLORS.divider).setDepth(20);

    // 골드
    s.add.image(18, 18, 'icon_gold').setDisplaySize(20, 20).setDepth(21);
    this.goldText = s.add.text(32, 10, '150', {
      fontSize: FONT_SIZE.ui, color: '#ffd700', stroke: '#000', strokeThickness: 2,
    }).setDepth(21);

    // 웨이브
    this.waveText = s.add.text(GAME_WIDTH / 2, 10, '웨이브 0/5', {
      fontSize: FONT_SIZE.ui, color: '#ffffff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    // 목숨
    s.add.image(GAME_WIDTH - 26, 18, 'icon_heart').setDisplaySize(20, 20).setDepth(21);
    this.livesText = s.add.text(GAME_WIDTH - 10, 10, '10', {
      fontSize: FONT_SIZE.ui, color: '#ff4444', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(21);
  }

  // ── 하단 패널 ────────────────────────────────────────────

  /**
   * 하단 UI 패널 생성.
   * @private
   */
  _buildBottomPanel() {
    const s = this.scene;

    // 배경
    s.add.rectangle(GAME_WIDTH / 2, BOTTOM_Y + BOTTOM_UI_HEIGHT / 2, GAME_WIDTH, BOTTOM_UI_HEIGHT, 0x2a1500)
      .setDepth(20);
    s.add.rectangle(GAME_WIDTH / 2, BOTTOM_Y, GAME_WIDTH, 2, COLORS.divider)
      .setDepth(20);

    // 구분선: 타워↔인벤토리 사이 (조리소는 슬라이드업 오버레이로 분리)
    s.add.rectangle(120, BOTTOM_Y + BOTTOM_UI_HEIGHT / 2, 2, BOTTOM_UI_HEIGHT - 10, COLORS.divider).setDepth(20);

    this._buildTowerPanel();
    this._buildInventoryPanel();
    this._buildCookingPanel();
  }

  /**
   * 타워 선택 패널 (하단 왼쪽, 0~119px).
   * @private
   */
  _buildTowerPanel() {
    const s = this.scene;
    const towerIds = Object.keys(TOWER_TYPES);
    const iconSize = 36; // 시각적 아이콘 크기
    const hitSize  = 44; // WCAG 2.5.5 권장 터치 타겟
    const startX = 12;
    const y = BOTTOM_Y + 14;

    s.add.text(startX, BOTTOM_Y + 4, '타워', {
      fontSize: '10px', color: '#ffaa00',
    }).setDepth(21);

    towerIds.forEach((id, i) => {
      const data = TOWER_TYPES[id];
      const cx = startX + hitSize / 2 + i * (hitSize + 4);
      const cy = y + hitSize / 2;

      // 시각적 배경 (36×36)
      const bg = s.add.rectangle(cx, cy, iconSize, iconSize, 0x333333).setDepth(21);

      // 타워 색상 사각형
      s.add.rectangle(cx, cy - 4, 20, 20, data.color).setDepth(22);

      // 가격 텍스트
      s.add.text(cx, cy + iconSize / 2 - 4, `${data.cost}g`, {
        fontSize: '9px', color: '#ffd700',
      }).setOrigin(0.5, 1).setDepth(22);

      // 히트박스 (44×44, 투명) — 터치 타겟 확장
      const hit = s.add.rectangle(cx, cy, hitSize, hitSize, 0x000000, 0)
        .setDepth(23).setInteractive({ useHandCursor: true });

      hit.on('pointerdown', () => this._selectTower(id));
      hit.on('pointerover', () => bg.setFillStyle(0x555555));
      hit.on('pointerout', () => {
        bg.setFillStyle(this.selectedTowerType === id ? 0x885500 : 0x333333);
      });

      this._towerButtons[id] = bg;
    });
  }

  /**
   * 재료 인벤토리 패널 (하단 중앙~우측, 120~360px).
   * 우측에 요리 트리거 버튼 포함 (Phase 57-5).
   * @private
   */
  _buildInventoryPanel() {
    const s = this.scene;
    const panelX = 124;

    s.add.text(panelX + 4, BOTTOM_Y + 4, '재료창', {
      fontSize: '10px', color: '#ffaa00',
    }).setDepth(21);

    // 당근
    s.add.circle(panelX + 16, BOTTOM_Y + 32, 10, 0xff6b35).setDepth(21);
    this.carrotText = s.add.text(panelX + 30, BOTTOM_Y + 24, '×0', {
      fontSize: '14px', color: '#ff6b35', stroke: '#000', strokeThickness: 2,
    }).setDepth(22);

    // 고기
    s.add.circle(panelX + 16, BOTTOM_Y + 64, 10, 0xdc143c).setDepth(21);
    this.meatText = s.add.text(panelX + 30, BOTTOM_Y + 56, '×0', {
      fontSize: '14px', color: '#ff8888', stroke: '#000', strokeThickness: 2,
    }).setDepth(22);

    // 신선 보너스 안내
    s.add.text(panelX + 4, BOTTOM_Y + 84, '★ 빠른 처치 → 2배 드롭', {
      fontSize: '8px', color: '#aaaaaa',
    }).setDepth(21);

    // ── 요리 트리거 버튼 (우측 고정) ──
    const btnX = GAME_WIDTH - 28;
    const btnY = BOTTOM_Y + BOTTOM_UI_HEIGHT / 2;

    const cookBg = s.add.rectangle(btnX, btnY, 48, BOTTOM_UI_HEIGHT - 8, 0x2a1500)
      .setStrokeStyle(2, COLORS.divider)
      .setDepth(21)
      .setInteractive({ useHandCursor: true });

    s.add.text(btnX, btnY - 14, '요리', {
      fontSize: '10px', color: '#ffaa00',
    }).setOrigin(0.5).setDepth(22);

    this._cookArrow = s.add.text(btnX, btnY + 10, '▲', {
      fontSize: '14px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(22);

    cookBg.on('pointerover', () => cookBg.setFillStyle(0x3a2500));
    cookBg.on('pointerout',  () => cookBg.setFillStyle(0x2a1500));
    cookBg.on('pointerdown', () => {
      if (this._cookPanelVisible) {
        this.hideCookingPanel();
      } else {
        this.showCookingPanel();
      }
    });
  }

  /**
   * 조리소 슬라이드업 오버레이 생성 (Phase 57-5).
   * 평상시 화면 아래에 숨겨두고, 요리 버튼 탭 시 BOTTOM_Y 바로 위로 슬라이드인.
   * @private
   */
  _buildCookingPanel() {
    const s = this.scene;

    // 컨테이너 초기 위치: 화면 아래 (숨김)
    this._cookOverlay = s.add.container(0, GAME_HEIGHT).setDepth(50);

    // 배경
    const bg = s.add.rectangle(
      GAME_WIDTH / 2, COOK_PANEL_H / 2, GAME_WIDTH, COOK_PANEL_H, 0x1a0a00
    ).setStrokeStyle(2, COLORS.divider);
    this._cookOverlay.add(bg);

    // 상단 경계선
    this._cookOverlay.add(
      s.add.rectangle(GAME_WIDTH / 2, 1, GAME_WIDTH, 2, COLORS.divider)
    );

    // 타이틀
    this._cookOverlay.add(
      s.add.text(8, 6, '조리소', { fontSize: '10px', color: '#ffaa00' })
    );

    // 닫기 버튼
    const closeBtn = s.add.text(GAME_WIDTH - 16, 12, '✕', {
      fontSize: '16px', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout',  () => closeBtn.setColor('#888888'));
    closeBtn.on('pointerdown', () => this.hideCookingPanel());
    this._cookOverlay.add(closeBtn);

    // 레시피 버튼
    this._recipeButtons = [];
    RECIPES.forEach((recipe, i) => {
      const y = 24 + i * 32;
      const ingText = Object.entries(recipe.ingredients)
        .map(([id, cnt]) => `${id === 'carrot' ? '🥕' : '🥩'}×${cnt}`)
        .join(' ');

      const btn = s.add.text(8, y, `${ingText} → ${recipe.nameKo}`, {
        fontSize: '9px', color: '#666666', stroke: '#000', strokeThickness: 1,
        backgroundColor: '#333333',
        padding: { x: 3, y: 2 },
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => this.onCook(recipe.id));
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => {
        btn.setColor(this._checkCanCook(recipe) ? '#ffff88' : '#666666');
      });

      this._cookOverlay.add(btn);
      this._recipeButtons.push({ btn, recipeId: recipe.id });
    });

    // 버프 상태 표시
    this.buffText = s.add.text(8, 24 + RECIPES.length * 32 + 4, '', {
      fontSize: '8px', color: '#00ff88',
    });
    this._cookOverlay.add(this.buffText);
  }

  // ── 슬라이드업 패널 제어 ────────────────────────────────────

  /**
   * 조리소 오버레이를 BOTTOM_Y 바로 위로 슬라이드인.
   */
  showCookingPanel() {
    if (this._cookPanelVisible) return;
    this._cookPanelVisible = true;
    if (this._cookArrow) this._cookArrow.setText('▼');
    this.scene.tweens.add({
      targets: this._cookOverlay,
      y: BOTTOM_Y - COOK_PANEL_H,
      duration: 250,
      ease: 'Back.easeOut',
    });
  }

  /**
   * 조리소 오버레이를 화면 아래로 슬라이드아웃.
   */
  hideCookingPanel() {
    if (!this._cookPanelVisible) return;
    this._cookPanelVisible = false;
    if (this._cookArrow) this._cookArrow.setText('▲');
    this.scene.tweens.add({
      targets: this._cookOverlay,
      y: GAME_HEIGHT,
      duration: 200,
      ease: 'Cubic.easeIn',
    });
  }

  // ── 업데이트 ────────────────────────────────────────────

  /**
   * 매 프레임 업데이트 - HUD 수치 갱신.
   */
  update() {
    // GameScene에서 직접 setGold/setLives/setWave 호출 방식으로 처리
  }

  /**
   * 골드 표시 갱신.
   * @param {number} gold
   */
  setGold(gold) {
    this.goldText.setText(`${gold}`);
  }

  /**
   * 목숨 표시 갱신.
   * @param {number} lives
   */
  setLives(lives) {
    this.livesText.setText(`${lives}`);
  }

  /**
   * 웨이브 표시 갱신.
   * @param {number} current
   * @param {number} total
   */
  setWave(current, total) {
    this.waveText.setText(`웨이브 ${current}/${total}`);
  }

  // ── 이벤트 핸들러 ────────────────────────────────────────

  /**
   * 타워 선택 처리.
   * @private
   * @param {string} towerTypeId
   */
  _selectTower(towerTypeId) {
    // 같은 타워를 다시 탭하면 선택 해제
    if (this.selectedTowerType === towerTypeId) {
      this.selectedTowerType = null;
    } else {
      this.selectedTowerType = towerTypeId;
    }

    // 버튼 시각 갱신
    Object.entries(this._towerButtons).forEach(([id, btn]) => {
      btn.setFillStyle(id === this.selectedTowerType ? 0x885500 : 0x333333);
    });

    this.onTowerSelected(this.selectedTowerType);
  }

  /**
   * 인벤토리 변경 시 재료 표시 + 레시피 버튼 색상 갱신.
   * @private
   */
  _onInventoryChanged(inventory) {
    this._inventory = inventory;
    this.carrotText.setText(`×${inventory.carrot || 0}`);
    this.meatText.setText(`×${inventory.meat || 0}`);

    this._recipeButtons.forEach(({ btn, recipeId }) => {
      const recipe = RECIPES.find(r => r.id === recipeId);
      btn.setColor(this._checkCanCook(recipe) ? '#ffff88' : '#666666');
    });
  }

  /**
   * 레시피 조리 가능 여부 확인.
   * @private
   * @param {object} recipe
   * @returns {boolean}
   */
  _checkCanCook(recipe) {
    return Object.entries(recipe.ingredients).every(
      ([id, cnt]) => (this._inventory[id] || 0) >= cnt
    );
  }

  /**
   * 버프 활성화 표시.
   * @private
   */
  _onBuffActivated(recipe) {
    this.buffText.setText(`⚡ ${recipe.nameKo}\n${recipe.effectDesc}`);
  }

  /**
   * 버프 만료 표시.
   * @private
   */
  _onBuffExpired() {
    this.buffText.setText('');
  }

  /**
   * 정리.
   */
  destroy() {
    this.scene.events.off('inventory_changed', this._onInventoryChanged, this);
    this.scene.events.off('buff_activated', this._onBuffActivated, this);
    this.scene.events.off('buff_expired', this._onBuffExpired, this);
  }
}
