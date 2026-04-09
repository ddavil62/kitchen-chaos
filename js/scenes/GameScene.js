/**
 * @fileoverview 메인 게임 씬 (전투).
 * Phase 3: 아이소메트릭 다이아몬드 그리드 렌더링, 배달 타워 자동 수거.
 * RestaurantScene과 병렬 실행, GameEventBus로 통신한다.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRID_COLS, GRID_ROWS,
         CELL_W, CELL_H, HALF_W, HALF_H,
         HUD_HEIGHT, GAME_AREA_Y, GAME_AREA_HEIGHT, TOWER_BAR_Y, TOWER_BAR_HEIGHT,
         PATH_CELLS, isPathCell, cellToWorld, worldToCell, cellDiamond,
         STARTING_GOLD, STARTING_LIVES, WAVE_CLEAR_BONUS } from '../config.js';
import { TOWER_TYPES } from '../data/gameData.js';
import { GameEventBus } from '../events/GameEventBus.js';
import { Tower } from '../entities/Tower.js';
import { WaveManager } from '../managers/WaveManager.js';
import { IngredientManager } from '../managers/IngredientManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // ── 게임 상태 ──
    this.gold = STARTING_GOLD;
    this.lives = STARTING_LIVES;
    this.score = 0;
    this.selectedTowerType = null;
    this.isGameOver = false;
    this.isVictory = false;
    this.waitingForNextWave = false;
    this.comboCount = 0;

    // ── 그룹 ──
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.projectiles = this.add.group();

    // ── 맵 렌더링 ──
    this._drawMap();

    // ── 매니저 ──
    this.ingredientManager = new IngredientManager(this);
    this.waveManager = new WaveManager(this, this.enemies);

    // ── HUD ──
    this._createHUD();

    // ── 타워 선택 바 ──
    this._createTowerBar();

    // ── 입력 ──
    this._setupInput();

    // ── 씬 내부 이벤트 ──
    this.events.on('enemy_died', this._onEnemyDied, this);
    this.events.on('enemy_reached_base', this._onEnemyReachedBase, this);
    this.events.on('wave_started', this._onWaveStarted, this);

    // ── GameEventBus 이벤트 수신 ──
    GameEventBus.on('gold_earned', this._onGoldEarned, this);
    GameEventBus.on('combo_changed', this._onComboChanged, this);
    GameEventBus.on('buff_activated', this._onBuffActivated, this);
    GameEventBus.on('buff_expired', this._onBuffExpired, this);

    // ── RestaurantScene 병렬 실행 ──
    this.scene.launch('RestaurantScene', {
      ingredientManager: this.ingredientManager,
    });

    // ── 첫 웨이브 메시지 ──
    this._showMessage('웨이브 1 준비!\n타워를 배치하세요', 2500);
    this.time.delayedCall(2600, () => this.waveManager.startNextWave());

    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 씬 종료 시 정리
    this.events.once('shutdown', this.shutdown, this);
  }

  // ── 아이소메트릭 맵 그리기 ─────────────────────────────────────

  _drawMap() {
    const gfx = this.add.graphics();
    gfx.setDepth(0);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const d = cellDiamond(col, row);
        const onPath = isPathCell(col, row);

        // 다이아몬드 채우기
        gfx.fillStyle(onPath ? 0xc8a46e : 0x2d5a1b);
        gfx.fillPoints([d.top, d.right, d.bottom, d.left], true);

        // 테두리
        gfx.lineStyle(1, onPath ? 0x8b6914 : 0x1e3d12, onPath ? 0.4 : 0.3);
        gfx.strokePoints([d.top, d.right, d.bottom, d.left], true);
      }
    }

    // 주방 아이콘 (경로 끝)
    const exitCell = cellToWorld(7, 7);
    this.add.text(exitCell.x, exitCell.y, '🍳', {
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(1);

    // 진입로 화살표
    const entryCell = cellToWorld(1, 0);
    this.add.text(entryCell.x, entryCell.y - HALF_H - 8, '▼', {
      fontSize: '12px', color: '#ff4444',
    }).setOrigin(0.5).setDepth(1);
  }

  // ── HUD (상단 50px) ─────────────────────────────────────────────

  _createHUD() {
    const hudBg = this.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, 0x1a1a2e);
    hudBg.setDepth(100);

    this.goldText = this.add.text(10, 15, `🪙 ${this.gold}`, {
      fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(101);

    this.waveText = this.add.text(GAME_WIDTH / 2, 15, '웨이브 0/8', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(101);

    this.livesText = this.add.text(GAME_WIDTH - 10, 15, `❤️ ${this.lives}`, {
      fontSize: '16px', color: '#ff4444',
    }).setOrigin(1, 0).setDepth(101);

    this.comboText = this.add.text(GAME_WIDTH / 2, 34, '', {
      fontSize: '12px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(101);
  }

  _updateHUD() {
    this.goldText.setText(`🪙 ${this.gold}`);
    this.livesText.setText(`❤️ ${this.lives}`);
  }

  // ── 타워 선택 바 (370~420px) ────────────────────────────────────

  _createTowerBar() {
    this.add.rectangle(
      GAME_WIDTH / 2, TOWER_BAR_Y + TOWER_BAR_HEIGHT / 2,
      GAME_WIDTH, TOWER_BAR_HEIGHT, 0x111122
    ).setDepth(100);

    const towerIds = Object.keys(TOWER_TYPES);
    const btnWidth = GAME_WIDTH / towerIds.length;

    this.towerButtons = [];
    towerIds.forEach((id, i) => {
      const tower = TOWER_TYPES[id];
      const cx = btnWidth * i + btnWidth / 2;
      const cy = TOWER_BAR_Y + TOWER_BAR_HEIGHT / 2;

      const bg = this.add.rectangle(cx, cy, btnWidth - 4, TOWER_BAR_HEIGHT - 6, 0x333355)
        .setDepth(101).setInteractive();

      this.add.text(cx, cy - 6, tower.nameKo, {
        fontSize: '11px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(102);

      this.add.text(cx, cy + 10, `${tower.cost}g`, {
        fontSize: '10px', color: '#ffd700',
      }).setOrigin(0.5).setDepth(102);

      bg.on('pointerdown', () => {
        this.selectedTowerType = this.selectedTowerType === id ? null : id;
        this._updateTowerBarSelection();
      });

      this.towerButtons.push({ bg, id });
    });
  }

  _updateTowerBarSelection() {
    this.towerButtons.forEach(btn => {
      btn.bg.setFillStyle(btn.id === this.selectedTowerType ? 0x885500 : 0x333355);
    });
  }

  // ── 입력 처리 (아이소메트릭 히트박스) ───────────────────────────

  _setupInput() {
    // 맵 영역 전체를 덮는 투명 히트 영역
    const hitArea = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_AREA_Y + GAME_AREA_HEIGHT / 2,
      GAME_WIDTH,
      GAME_AREA_HEIGHT,
      0x000000, 0
    ).setInteractive().setDepth(2);

    hitArea.on('pointerdown', (pointer) => {
      if (this.isGameOver || this.isVictory) return;
      const { col, row } = worldToCell(pointer.x, pointer.y);
      if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
        this._onCellTap(col, row);
      }
    });
  }

  _onCellTap(col, row) {
    if (!this.selectedTowerType) return;

    if (isPathCell(col, row)) {
      this._showMessage('경로 위에는 배치할 수 없습니다', 1000);
      return;
    }

    const key = `${col},${row}`;
    const exists = this.towers.getChildren().some(t => t._cellKey === key);
    if (exists) {
      this._showMessage('이미 타워가 있습니다', 800);
      return;
    }

    const towerData = TOWER_TYPES[this.selectedTowerType];
    if (this.gold < towerData.cost) {
      this._showMessage(`골드 부족 (필요: ${towerData.cost}g)`, 1200);
      return;
    }

    this._placeTower(col, row, this.selectedTowerType);
  }

  _placeTower(col, row, typeId) {
    const towerData = TOWER_TYPES[typeId];
    const { x, y } = cellToWorld(col, row);

    const tower = new Tower(this, x, y, towerData, this.projectiles);
    tower._cellKey = `${col},${row}`;
    tower._col = col;
    tower._row = row;
    // 아이소메트릭 depth sorting: col+row 기준
    tower.setDepth(10 + col + row);
    this.towers.add(tower);

    // 현재 버프 적용
    if (this._currentBuff) {
      this._applyBuffToTower(tower, this._currentBuff);
    }

    this.gold -= towerData.cost;
    this._updateHUD();

    this.tweens.add({
      targets: tower,
      scaleX: 1.2, scaleY: 1.2,
      duration: 150, yoyo: true,
    });
  }

  // ── 이벤트 핸들러 (씬 내부) ────────────────────────────────────

  _onWaveStarted(waveNum) {
    this.waveText.setText(`웨이브 ${waveNum}/${this.waveManager.totalWaves}`);
    this.waitingForNextWave = false;
    GameEventBus.emit('wave_started', { waveNum });
  }

  _onEnemyDied(enemy) {
    this.score++;
    this._checkWaveProgress();
  }

  _onEnemyReachedBase(enemy) {
    this.lives--;
    this._updateHUD();
    this.cameras.main.shake(200, 0.008);

    if (this.lives <= 0) {
      this._triggerGameOver();
    }
    this._checkWaveProgress();
  }

  // ── GameEventBus 핸들러 ────────────────────────────────────────

  _onGoldEarned({ amount }) {
    this.gold += amount;
    this._updateHUD();

    const popup = this.add.text(90, 10, `+${amount}g`, {
      fontSize: '14px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(110);

    this.tweens.add({
      targets: popup, y: -10, alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy(),
    });
  }

  _onComboChanged({ count }) {
    this.comboCount = count;
    this.comboText.setText(count >= 3 ? `🔥 ×${count} 콤보!` : '');
  }

  _onBuffActivated({ effectType, effectValue, duration }) {
    this._currentBuff = { effectType, effectValue, duration };
    this.towers.getChildren().forEach(tower => {
      this._applyBuffToTower(tower, this._currentBuff);
    });
  }

  _onBuffExpired() {
    this._currentBuff = null;
    this.towers.getChildren().forEach(tower => {
      if (tower.removeBuff) tower.removeBuff();
    });
  }

  /**
   * 개별 타워에 버프 적용.
   * @param {Tower} tower
   * @param {{ effectType: string, effectValue: number }} buff
   */
  _applyBuffToTower(tower, buff) {
    if (!tower.applyBuff) return;
    const { effectType, effectValue } = buff;
    if (effectType === 'buff_speed') tower.applyBuff('speed', effectValue);
    else if (effectType === 'buff_damage') tower.applyBuff('damage', effectValue);
    else if (effectType === 'buff_both') tower.applyBuff('both', effectValue);
    else if (effectType === 'buff_range') tower.applyBuff('range', effectValue);
    else if (effectType === 'buff_burn') tower.applyBuff('burn', effectValue);
    else if (effectType === 'buff_slow') tower.applyBuff('slow', effectValue);
  }

  // ── 배달 타워 자동 수거 ────────────────────────────────────────

  _updateDeliveryTowers(delta) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active || tower.data_?.id !== 'delivery') return;
      tower._collectTimer = (tower._collectTimer || 0) + delta;
      if (tower._collectTimer < (tower.data_.collectInterval || 2000)) return;
      tower._collectTimer = 0;

      // 범위 내 드롭 수거
      const drops = this.ingredientManager.drops;
      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop || !drop.container) continue;
        const dist = Phaser.Math.Distance.Between(
          tower.x, tower.y, drop.container.x, drop.container.y
        );
        if (dist <= (tower.data_.collectRadius || 110)) {
          this.ingredientManager._collectDrop(drop);
          break; // 한 번에 1개만 수거
        }
      }
    });
  }

  // ── 웨이브 관리 ─────────────────────────────────────────────────

  _checkWaveProgress() {
    if (this.waitingForNextWave) return;
    if (!this.waveManager.isWaveCleared()) return;

    if (this.waveManager.isLastWave()) {
      this._triggerVictory();
      return;
    }

    this.gold += WAVE_CLEAR_BONUS;
    this._updateHUD();

    const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 20, `웨이브 클리어! +${WAVE_CLEAR_BONUS}g`, {
      fontSize: '14px', color: '#44ff44',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(110);

    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0,
      duration: 1200,
      onComplete: () => popup.destroy(),
    });

    this.waitingForNextWave = true;
    const nextWave = this.waveManager.currentWave + 1;
    this._showMessage(`웨이브 ${nextWave - 1} 클리어! 다음 준비...`, 2000);
    this.time.delayedCall(2200, () => {
      this.waveManager.startNextWave();
    });
  }

  // ── 게임 종료 ───────────────────────────────────────────────────

  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    GameEventBus.emit('game_over', { isVictory: false, score: this.score });

    this.cameras.main.fadeOut(600, 100, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('RestaurantScene');
      this.scene.start('GameOverScene', { score: this.score, isVictory: false });
    });
  }

  _triggerVictory() {
    if (this.isVictory) return;
    this.isVictory = true;
    GameEventBus.emit('game_over', { isVictory: true, score: this.score });

    this._showMessage('🎉 모든 웨이브 클리어!\n주방을 지켰습니다!', 3000);
    this.time.delayedCall(3200, () => {
      this.cameras.main.fadeOut(600, 0, 100, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('RestaurantScene');
        this.scene.start('GameOverScene', { score: this.score, isVictory: true });
      });
    });
  }

  // ── 유틸리티 ────────────────────────────────────────────────────

  _showMessage(message, duration) {
    if (this._messageTween) {
      this._messageTween.stop();
      this._messageTween = null;
    }
    if (this._messagePopup) {
      this._messagePopup.destroy();
      this._messagePopup = null;
    }

    const msgY = GAME_AREA_Y + GAME_AREA_HEIGHT / 2;
    const bg = this.add.rectangle(GAME_WIDTH / 2, msgY, 280, 70, 0x000000, 0.8).setDepth(120);
    const text = this.add.text(GAME_WIDTH / 2, msgY, message, {
      fontSize: '15px', color: '#ffffff', align: 'center', lineSpacing: 5,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(121);

    this._messagePopup = this.add.container(0, 0, [bg, text]).setDepth(120);

    this.time.delayedCall(duration, () => {
      if (this._messagePopup) {
        this._messageTween = this.tweens.add({
          targets: this._messagePopup,
          alpha: 0, duration: 300,
          onComplete: () => {
            this._messagePopup?.destroy();
            this._messagePopup = null;
            this._messageTween = null;
          },
        });
      }
    });
  }

  // ── 메인 루프 ───────────────────────────────────────────────────

  update(time, delta) {
    if (this.isGameOver || this.isVictory) return;

    this.waveManager.update(delta);

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta);
        // 아이소메트릭 depth sorting: Y 좌표 기반
        enemy.setDepth(10 + Math.floor(enemy.y));
      }
    });

    this.towers.getChildren().forEach(tower => {
      if (tower.active) tower.update(time, delta, this.enemies);
    });

    this.projectiles.getChildren().forEach(proj => {
      if (proj.active) proj.update(delta);
    });

    this.ingredientManager.update(delta);

    // 배달 타워 자동 수거
    this._updateDeliveryTowers(delta);
  }

  shutdown() {
    this.events.off('enemy_died', this._onEnemyDied, this);
    this.events.off('enemy_reached_base', this._onEnemyReachedBase, this);
    this.events.off('wave_started', this._onWaveStarted, this);
    GameEventBus.off('gold_earned', this._onGoldEarned, this);
    GameEventBus.off('combo_changed', this._onComboChanged, this);
    GameEventBus.off('buff_activated', this._onBuffActivated, this);
    GameEventBus.off('buff_expired', this._onBuffExpired, this);
    this.ingredientManager?.destroy();
  }
}
