/**
 * @fileoverview 메인 게임 씬.
 * 타워 디펜스 코어 루프: 맵 렌더링, 타워 배치, 웨이브 관리,
 * 재료 드롭/수거, 조리소 시스템을 통합한다.
 */

import { GAME_WIDTH, GAME_HEIGHT, CELL_SIZE, GRID_COLS, GRID_ROWS,
         GAME_AREA_Y, BOTTOM_UI_HEIGHT, PATH_CELLS, isPathCell,
         cellToWorld, worldToCell, STARTING_GOLD, STARTING_LIVES } from '../config.js';
import { TOWER_TYPES } from '../data/gameData.js';
import { Tower } from '../entities/Tower.js';
import { WaveManager } from '../managers/WaveManager.js';
import { IngredientManager } from '../managers/IngredientManager.js';
import { CookingStation } from '../managers/CookingStation.js';
import { GameUI } from '../ui/GameUI.js';

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

    // ── 그룹 ──
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.projectiles = this.add.group();

    // ── 맵 렌더링 ──
    this._drawMap();

    // ── 매니저 ──
    this.ingredientManager = new IngredientManager(this);
    this.cookingStation = new CookingStation(this, this.ingredientManager);
    this.waveManager = new WaveManager(this, this.enemies);

    // ── UI ──
    this.gameUI = new GameUI(this, {
      onTowerSelected: (typeId) => { this.selectedTowerType = typeId; },
      onCook: (recipeId) => this._onCook(recipeId),
    });
    this.gameUI.setGold(this.gold);
    this.gameUI.setLives(this.lives);
    this.gameUI.setWave(0, this.waveManager.totalWaves);

    // ── 입력 ──
    this._setupInput();

    // ── 이벤트 ──
    this.events.on('enemy_died', this._onEnemyDied, this);
    this.events.on('enemy_reached_base', this._onEnemyReachedBase, this);
    this.events.on('wave_started', (n) => {
      this.gameUI.setWave(n, this.waveManager.totalWaves);
      this.waitingForNextWave = false;
    });

    // ── 첫 웨이브 시작 메시지 ──
    this._showMessage('웨이브 1 준비!\n화면을 탭해서 타워를 배치하세요', 2500);
    this.time.delayedCall(2600, () => this.waveManager.startNextWave());

    // 페이드인
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ── 맵 그리기 ────────────────────────────────────────────

  /**
   * 그리드와 경로를 그린다.
   * @private
   */
  _drawMap() {
    const mapGraphics = this.add.graphics();
    mapGraphics.setDepth(0);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * CELL_SIZE;
        const y = GAME_AREA_Y + row * CELL_SIZE;
        const onPath = isPathCell(col, row);

        if (onPath) {
          // 경로 셀: 모래색
          mapGraphics.fillStyle(0xc8a46e);
          mapGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          mapGraphics.lineStyle(1, 0x8b6914, 0.3);
          mapGraphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        } else {
          // 일반 셀: 녹색 잔디
          mapGraphics.fillStyle(0x2d5a1b);
          mapGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          mapGraphics.lineStyle(1, 0x1e3d12, 0.4);
          mapGraphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // 주방 아이콘 (경로 끝)
    const kitchen = this.add.text(60, GAME_AREA_Y + 10 * CELL_SIZE + 20, '🍳', {
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(1);

    // 진입로 화살표
    this.add.text(180, GAME_AREA_Y - 8, '▼', {
      fontSize: '14px', color: '#ff4444',
    }).setOrigin(0.5).setDepth(1);
  }

  // ── 입력 처리 ─────────────────────────────────────────────

  /**
   * 그리드 탭 입력 셋업.
   * @private
   */
  _setupInput() {
    // 게임 영역(맵 그리드) 전체에 인터랙티브 영역 설정
    const hitArea = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_AREA_Y + (GRID_ROWS * CELL_SIZE) / 2,
      GAME_WIDTH,
      GRID_ROWS * CELL_SIZE,
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

  /**
   * 셀 탭 처리 - 타워 배치 또는 취소.
   * @private
   * @param {number} col
   * @param {number} row
   */
  _onCellTap(col, row) {
    if (!this.selectedTowerType) return;

    // 경로 위 배치 불가
    if (isPathCell(col, row)) {
      this._showMessage('경로 위에는 배치할 수 없습니다', 1000);
      return;
    }

    // 이미 타워가 있는지 확인
    const key = `${col},${row}`;
    const exists = this.towers.getChildren().some(t => t._cellKey === key);
    if (exists) {
      this._showMessage('이미 타워가 있습니다', 800);
      return;
    }

    // 골드 확인
    const towerData = TOWER_TYPES[this.selectedTowerType];
    if (this.gold < towerData.cost) {
      this._showMessage(`골드가 부족합니다 (필요: ${towerData.cost}g)`, 1200);
      return;
    }

    // 타워 배치
    this._placeTower(col, row, this.selectedTowerType);
  }

  /**
   * 타워 배치 실행.
   * @private
   */
  _placeTower(col, row, typeId) {
    const towerData = TOWER_TYPES[typeId];
    const { x, y } = cellToWorld(col, row);

    const tower = new Tower(this, x, y, towerData, this.projectiles);
    tower._cellKey = `${col},${row}`;
    this.towers.add(tower);

    // 현재 활성 버프 즉시 적용
    this.cookingStation.applyBuffToNewTower(tower);

    // 골드 차감
    this.gold -= towerData.cost;
    this.gameUI.setGold(this.gold);

    // 배치 이펙트
    this.tweens.add({
      targets: tower,
      scaleX: 1.2, scaleY: 1.2,
      duration: 150, yoyo: true,
    });
  }

  // ── 이벤트 핸들러 ─────────────────────────────────────────

  /**
   * 적 처치 이벤트 핸들러.
   * @private
   */
  _onEnemyDied(enemy) {
    // 골드 획득
    this.gold += enemy.goldReward;
    this.gameUI.setGold(this.gold);
    this.score++;

    // 처치 이펙트 (골드 팝업)
    const goldPopup = this.add.text(enemy.x, enemy.y - 10, `+${enemy.goldReward}g`, {
      fontSize: '14px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: goldPopup,
      y: enemy.y - 50,
      alpha: 0,
      duration: 900,
      onComplete: () => goldPopup.destroy(),
    });
  }

  /**
   * 적 주방 도달 이벤트 핸들러.
   * @private
   */
  _onEnemyReachedBase(enemy) {
    this.lives--;
    this.gameUI.setLives(this.lives);

    // 화면 흔들기
    this.cameras.main.shake(200, 0.008);

    if (this.lives <= 0) {
      this._triggerGameOver();
    }
  }

  /**
   * 요리 버튼 클릭 처리.
   * @private
   */
  _onCook(recipeId) {
    const success = this.cookingStation.cook(recipeId);
    if (success) {
      const name = this.cookingStation.getBuffName();
      this._showMessage(`🍳 ${name} 완성!\n타워 버프가 활성화됩니다`, 2000);
    } else {
      this._showMessage('재료가 부족합니다', 1000);
    }
  }

  // ── 웨이브 관리 ───────────────────────────────────────────

  /**
   * 웨이브 완료 확인 및 다음 웨이브 준비.
   * @private
   */
  _checkWaveProgress() {
    if (this.waitingForNextWave) return;
    if (!this.waveManager.isWaveCleared()) return;

    if (this.waveManager.isLastWave()) {
      this._triggerVictory();
      return;
    }

    // 다음 웨이브 준비
    this.waitingForNextWave = true;
    const nextWave = this.waveManager.currentWave + 1;
    this._showMessage(`웨이브 ${nextWave - 1} 클리어! 다음 웨이브 준비...`, 2000);
    this.time.delayedCall(2200, () => {
      this.waveManager.startNextWave();
    });
  }

  // ── 게임 종료 ─────────────────────────────────────────────

  /**
   * 게임 오버 트리거.
   * @private
   */
  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.cameras.main.fadeOut(600, 100, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOverScene', { score: this.score, isVictory: false });
    });
  }

  /**
   * 승리 트리거.
   * @private
   */
  _triggerVictory() {
    if (this.isVictory) return;
    this.isVictory = true;

    this._showMessage('🎉 모든 웨이브 클리어!\n주방을 지켰습니다!', 3000);
    this.time.delayedCall(3200, () => {
      this.cameras.main.fadeOut(600, 0, 100, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', { score: this.score, isVictory: true });
      });
    });
  }

  // ── 유틸리티 ─────────────────────────────────────────────

  /**
   * 화면 중앙에 메시지 팝업 표시.
   * @param {string} message
   * @param {number} duration - ms
   */
  _showMessage(message, duration) {
    const existing = this._messagePopup;
    if (existing) existing.destroy();

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 280, 80, 0x000000, 0.8)
      .setDepth(50);
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
      fontSize: '16px', color: '#ffffff', align: 'center', lineSpacing: 6,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(51);

    this._messagePopup = this.add.container(0, 0, [bg, text]).setDepth(50);

    this.time.delayedCall(duration, () => {
      if (this._messagePopup) {
        this.tweens.add({
          targets: this._messagePopup,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this._messagePopup?.destroy();
            this._messagePopup = null;
          },
        });
      }
    });
  }

  // ── 메인 루프 ─────────────────────────────────────────────

  /**
   * @param {number} time
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.isGameOver || this.isVictory) return;

    // 웨이브 매니저 업데이트 (적 스폰)
    this.waveManager.update(delta);

    // 적 업데이트
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update(time, delta);
    });

    // 타워 업데이트 (조준 + 발사)
    this.towers.getChildren().forEach(tower => {
      if (tower.active) tower.update(time, delta, this.enemies);
    });

    // 발사체 업데이트
    this.projectiles.getChildren().forEach(proj => {
      if (proj.active) proj.update(delta);
    });

    // 재료 드롭 자동 수거 타이머
    this.ingredientManager.update(delta);

    // 조리소 버프 타이머
    this.cookingStation.update(delta);

    // 웨이브 진행 체크
    if (this.waveManager.isActive) {
      this._checkWaveProgress();
    }
  }

  /**
   * 씬 종료 시 정리.
   */
  shutdown() {
    this.events.off('enemy_died', this._onEnemyDied, this);
    this.events.off('enemy_reached_base', this._onEnemyReachedBase, this);
    this.ingredientManager?.destroy();
    this.gameUI?.destroy();
  }
}
