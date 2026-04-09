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
         buildPathCellsFromSegments, buildWaypointsFromSegments,
         STARTING_GOLD, STARTING_LIVES, WAVE_CLEAR_BONUS } from '../config.js';
import { TOWER_TYPES, ENEMY_TYPES } from '../data/gameData.js';
import { Enemy } from '../entities/Enemy.js';
import { STAGES } from '../data/stageData.js';
import { GameEventBus } from '../events/GameEventBus.js';
import { Tower } from '../entities/Tower.js';
import { WaveManager } from '../managers/WaveManager.js';
import { IngredientManager } from '../managers/IngredientManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { ChefManager } from '../managers/ChefManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  /** @param {{ stageId?: string }} data */
  create(data) {
    // ── 스테이지 데이터 로딩 ──
    this.stageId = data?.stageId || '1-1';
    this.stageData = STAGES[this.stageId];
    this.stagePathCells = this.stageData
      ? buildPathCellsFromSegments(this.stageData.pathSegments)
      : PATH_CELLS;
    this.stageWaypoints = this.stageData
      ? buildWaypointsFromSegments(this.stageData.pathSegments)
      : null;

    // ── 게임 상태 ──
    this.gold = STARTING_GOLD;
    this.lives = STARTING_LIVES;
    this.score = 0;
    this.selectedTowerType = null;
    this._activeTowerCategory = 'attack';
    this._towerBarButtons = [];
    this._towerTabObjects = [];
    this.isGameOver = false;
    this.isVictory = false;
    this.waitingForNextWave = false;
    this.comboCount = 0;

    // ── 그룹 ──
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.projectiles = this.add.group();

    // ── 맵 렌더링 ��─
    this._drawMap();

    // ── 매니저 ──
    this.ingredientManager = new IngredientManager(this);
    this.waveManager = new WaveManager(this, this.enemies, {
      waves: this.stageData?.waves,
      waypoints: this.stageWaypoints,
    });

    // ── 셰프 스킬 상태 ──
    this._chefData = ChefManager.getChefData();
    this._skillCooldownTimer = 0;
    this._skillReady = true;

    // ── HUD ──
    this._createHUD();

    // ── 셰프 스킬 버튼 ──
    this._createChefSkillButton();

    // ── 타워 선택 바 ──
    this._createTowerBar();

    // ── 입력 ──
    this._setupInput();

    // ── 씬 내부 이벤트 ──
    this.events.on('enemy_died', this._onEnemyDied, this);
    this.events.on('enemy_reached_base', this._onEnemyReachedBase, this);
    this.events.on('wave_started', this._onWaveStarted, this);
    this.events.on('boss_summon', this._onBossSummon, this);
    this.events.on('enemy_split', this._onEnemySplit, this);
    this.events.on('enemy_death_heal', this._onEnemyDeathHeal, this);
    this.events.on('boss_killed', this._onBossKilled, this);
    this.events.on('spore_debuff', this._onSporeDebuff, this);
    this.events.on('boss_debuff', this._onBossDebuff, this);

    // ── GameEventBus 이벤트 수신 ──
    GameEventBus.on('gold_earned', this._onGoldEarned, this);
    GameEventBus.on('combo_changed', this._onComboChanged, this);
    GameEventBus.on('buff_activated', this._onBuffActivated, this);
    GameEventBus.on('buff_expired', this._onBuffExpired, this);

    // ── RestaurantScene 병렬 실행 ──
    this.scene.launch('RestaurantScene', {
      ingredientManager: this.ingredientManager,
      customers: this.stageData?.customers,
    });

    // ── 웨이브 시작 버튼 ──
    this._createWaveButton();

    // ── 튜토리얼 ──
    this._tutorialStep = 0;
    this._startTutorial();

    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 씬 종료 시 정리
    this.events.once('shutdown', this.shutdown, this);
  }

  // ── 아이소메트릭 맵 그리기 ─────────────────────────────────────

  _drawMap() {
    const gfx = this.add.graphics();
    gfx.setDepth(0);
    const cols = this.stageData?.gridCols || GRID_COLS;
    const rows = this.stageData?.gridRows || GRID_ROWS;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const d = cellDiamond(col, row);
        const onPath = this.stagePathCells.has(`${col},${row}`);

        gfx.fillStyle(onPath ? 0xc8a46e : 0x2d5a1b);
        gfx.fillPoints([d.top, d.right, d.bottom, d.left], true);

        gfx.lineStyle(1, onPath ? 0x8b6914 : 0x1e3d12, onPath ? 0.4 : 0.3);
        gfx.strokePoints([d.top, d.right, d.bottom, d.left], true);
      }
    }

    // 경로 끝 마커 (웨이포인트 기반)
    const wp = this.stageWaypoints;
    if (wp && wp.length >= 3) {
      // 주방 아이콘: 마지막 실제 셀 (탈출 포인트 전)
      const exitPt = wp[wp.length - 2];
      this.add.text(exitPt.x, exitPt.y, '��', {
        fontSize: '16px',
      }).setOrigin(0.5).setDepth(1);

      // 진입로 화살표: 첫 실제 셀 (스폰 포인트 후)
      const entryPt = wp[1];
      this.add.text(entryPt.x, entryPt.y - HALF_H - 8, '▼', {
        fontSize: '12px', color: '#ff4444',
      }).setOrigin(0.5).setDepth(1);
    }
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

  // ── 셰프 스킬 버튼 (HUD 영역, 골드 옆) ───────────────────────

  /**
   * 셰프 스킬 버튼 생성.
   * ChefManager.getChefData()가 null이면 숨김.
   * @private
   */
  _createChefSkillButton() {
    if (!this._chefData) return;

    const btnX = 100;
    const btnY = 15;

    // 아이콘 배경 (둥근 사각형)
    this._skillBtnBg = this.add.rectangle(btnX, btnY + 10, 34, 34, 0x333355)
      .setDepth(101).setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, this._chefData.color);

    // 셰프 아이콘
    this._skillBtnIcon = this.add.text(btnX, btnY + 6, this._chefData.icon, {
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(102);

    // 쿨다운 오버레이 (어둡게)
    this._skillCooldownOverlay = this.add.rectangle(btnX, btnY + 10, 34, 34, 0x000000, 0.6)
      .setDepth(103).setVisible(false);

    // 쿨다운 텍스트
    this._skillCooldownText = this.add.text(btnX, btnY + 18, '', {
      fontSize: '10px', color: '#ff8888', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(104).setVisible(false);

    // 클릭 이벤트
    this._skillBtnBg.on('pointerdown', () => {
      if (this.isGameOver || this.isVictory) return;
      if (!this._skillReady) return;
      this._activateChefSkill();
    });

    this._skillBtnBg.on('pointerover', () => {
      if (this._skillReady) this._skillBtnBg.setFillStyle(0x555577);
    });
    this._skillBtnBg.on('pointerout', () => {
      this._skillBtnBg.setFillStyle(0x333355);
    });
  }

  /**
   * 셰프 스킬 발동.
   * @private
   */
  _activateChefSkill() {
    if (!this._chefData) return;

    const type = this._chefData.skillType;

    if (type === 'instant_collect') {
      // 꼬마 셰프: 맵 위 모든 드롭 재료 즉시 수거
      const drops = [...this.ingredientManager.drops];
      for (let i = drops.length - 1; i >= 0; i--) {
        this.ingredientManager._collectDrop(drops[i]);
      }
      this._showMessage(`${this._chefData.skillName}!\n모든 재료를 수거했습니다`, 1500);
    } else if (type === 'global_burn') {
      // 불꽃 요리사: 전체 적에게 화상
      const val = this._chefData.skillValue;
      const burnDamage = val.dps;  // 틱당 DPS (interval 1초)
      const burnDuration = val.duration;
      const burnInterval = 1000;
      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy.isDead) return;
        enemy.applyBurn(burnDamage, burnDuration, burnInterval);
      });
      this._showMessage(`${this._chefData.skillName}!\n전체 적에게 화상!`, 1500);
    } else if (type === 'global_freeze') {
      // 얼음 요리장: 전체 적 빙결
      const duration = this._chefData.skillValue.duration;
      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy.isDead) return;
        enemy.applyFreeze(duration);
      });
      this._showMessage(`${this._chefData.skillName}!\n전체 적 빙결!`, 1500);
    }

    // 쿨다운 시작
    this._skillReady = false;
    this._skillCooldownTimer = this._chefData.skillCooldown;
    this._skillCooldownOverlay.setVisible(true);
    this._skillCooldownText.setVisible(true);

    // 발동 연출
    this.tweens.add({
      targets: this._skillBtnBg,
      scaleX: 1.3, scaleY: 1.3,
      duration: 200, yoyo: true,
    });
  }

  /**
   * 셰프 스킬 쿨다운 업데이트 (매 프레임).
   * @param {number} delta
   * @private
   */
  _updateChefSkillCooldown(delta) {
    if (!this._chefData || this._skillReady) return;

    this._skillCooldownTimer -= delta;
    if (this._skillCooldownTimer <= 0) {
      this._skillReady = true;
      this._skillCooldownTimer = 0;
      this._skillCooldownOverlay.setVisible(false);
      this._skillCooldownText.setVisible(false);

      // 준비 완료 연출
      this.tweens.add({
        targets: [this._skillBtnBg, this._skillBtnIcon],
        scaleX: 1.15, scaleY: 1.15,
        duration: 300, yoyo: true,
      });
    } else {
      const sec = Math.ceil(this._skillCooldownTimer / 1000);
      this._skillCooldownText.setText(`${sec}s`);
    }
  }

  // ── 타워 선택 바 (370~420px) ────────────────────────────────────
  // 탭 영역(16px) + 버튼 영역(34px) = 50px

  _createTowerBar() {
    this._renderTowerBarBackground();
    this._renderTowerTabs();
    this._renderTowerButtons();
  }

  /** 타워 바 배경 (1회 호출) */
  _renderTowerBarBackground() {
    this.add.rectangle(
      GAME_WIDTH / 2, TOWER_BAR_Y + TOWER_BAR_HEIGHT / 2,
      GAME_WIDTH, TOWER_BAR_HEIGHT, 0x111122
    ).setDepth(100);
  }

  /** 카테고리 탭 생성 (1회 호출) */
  _renderTowerTabs() {
    const categories = [
      { id: 'attack', label: '공격' },
      { id: 'support', label: '지원' },
    ];
    const tabY = TOWER_BAR_Y + 8;

    categories.forEach((cat, i) => {
      const cx = 30 + i * 58;
      const bg = this.add.rectangle(cx, tabY, 54, 14,
        cat.id === this._activeTowerCategory ? 0x885500 : 0x333355
      ).setDepth(101).setInteractive({ useHandCursor: true });

      const label = this.add.text(cx, tabY, cat.label, {
        fontSize: '10px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(102);

      bg.on('pointerdown', () => {
        if (this._activeTowerCategory === cat.id) return;
        this._activeTowerCategory = cat.id;
        this.selectedTowerType = null;
        this._renderTowerButtons();
        this._updateTabHighlight();
      });

      this._towerTabObjects.push({ bg, label, category: cat.id });
    });
  }

  /** 탭 활성화 색상 갱신 */
  _updateTabHighlight() {
    this._towerTabObjects.forEach(tab => {
      tab.bg.setFillStyle(
        tab.category === this._activeTowerCategory ? 0x885500 : 0x333355
      );
    });
  }

  /** 현재 카테고리에 맞는 타워 버튼 렌더링 (탭 전환 시 재호출) */
  _renderTowerButtons() {
    // 기존 버튼 제거
    this._towerBarButtons.forEach(obj => obj.container.destroy());
    this._towerBarButtons = [];

    // 스테이지 허용 타워 필터
    const allowed = this.stageData?.availableTowers ?? Object.keys(TOWER_TYPES);
    const filtered = allowed.filter(id => TOWER_TYPES[id]?.category === this._activeTowerCategory);

    if (filtered.length === 0) return;

    const btnWidth = GAME_WIDTH / filtered.length;
    const btnY = TOWER_BAR_Y + 16 + 17; // 버튼 영역 중심

    filtered.forEach((id, i) => {
      const tower = TOWER_TYPES[id];
      const cx = btnWidth * i + btnWidth / 2;

      const bg = this.add.rectangle(cx, btnY, btnWidth - 4, 30, 0x333355)
        .setDepth(101).setInteractive({ useHandCursor: true });

      const name = this.add.text(cx, btnY - 5, tower.nameKo, {
        fontSize: '11px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(102);

      const cost = this.add.text(cx, btnY + 8, `${tower.cost}g`, {
        fontSize: '10px', color: '#ffd700',
      }).setOrigin(0.5).setDepth(102);

      bg.on('pointerdown', () => {
        this.selectedTowerType = this.selectedTowerType === id ? null : id;
        this._updateTowerBarSelection();
        // 튜토리얼 1단계: 타워 선택 완료
        if (this._tutorialStep === 1 && this.selectedTowerType) this._advanceTutorial();
      });

      // 컨테이너로 묶어 한 번에 destroy 가능
      const container = this.add.container(0, 0, [bg, name, cost]).setDepth(100);
      this._towerBarButtons.push({ container, bg, id });
    });

    this._updateTowerBarSelection();
  }

  _updateTowerBarSelection() {
    this._towerBarButtons.forEach(btn => {
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

    if (this.stagePathCells.has(`${col},${row}`)) {
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

    // 튜토리얼 2단계: 타워 배치 완료
    if (this._tutorialStep === 2) this._advanceTutorial();
  }

  // ── 이벤트 핸들러 (씬 내부) ────────────────────────────────────

  _onWaveStarted(waveNum) {
    this.waveText.setText(`웨이브 ${waveNum}/${this.waveManager.totalWaves}`);
    this.waitingForNextWave = false;
    this._setWaveButtonEnabled(false);
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

  // ── 보스/특수 적 이벤트 핸들러 ──────────────────────────────────

  /**
   * 보스 소환 이벤트 - 보스 위치에 하급 적 생성.
   * @param {{ type: string, x: number, y: number }} data
   */
  _onBossSummon({ type, x, y }) {
    const enemyData = ENEMY_TYPES[type];
    if (!enemyData) return;
    const waypoints = this.stageWaypoints || undefined;
    const enemy = new Enemy(this.scene || this, enemyData, waypoints);
    // 보스 위치에서 스폰 (경로 시작이 아닌 보스 근처)
    enemy.x = x + Phaser.Math.Between(-20, 20);
    enemy.y = y + Phaser.Math.Between(-10, 10);
    // 가장 가까운 웨이포인트부터 이동
    const wp = enemy._waypoints;
    let bestIdx = 1;
    let bestDist = Infinity;
    for (let i = 1; i < wp.length; i++) {
      const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, wp[i].x, wp[i].y);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    enemy.waypointIndex = bestIdx;
    this.enemies.add(enemy);
  }

  /**
   * 적 분열 이벤트 - 죽은 위치에서 소형 분열체 생성.
   * @param {{ type: string, x: number, y: number, hp: number, waypointIndex: number }} data
   */
  _onEnemySplit({ type, x, y, hp, waypointIndex }) {
    const baseData = ENEMY_TYPES[type];
    if (!baseData) return;
    // 약화된 분열체 데이터 생성
    const splitData = { ...baseData, hp, speed: baseData.speed * 1.2, splitChance: 0 };
    const waypoints = this.stageWaypoints || undefined;
    const enemy = new Enemy(this.scene || this, splitData, waypoints);
    enemy.x = x + Phaser.Math.Between(-15, 15);
    enemy.y = y + Phaser.Math.Between(-8, 8);
    enemy.waypointIndex = waypointIndex;
    this.enemies.add(enemy);
  }

  /**
   * 적 사망 힐 이벤트 - 범위 내 아군 적 HP 회복.
   * @param {{ x: number, y: number, healPercent: number, radius: number }} data
   */
  _onEnemyDeathHeal({ x, y, healPercent, radius }) {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active || enemy.isDead) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist > radius) return;
      const healAmount = enemy.maxHp * healPercent;
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
      // HP 바 갱신
      const ratio = enemy.hp / enemy.maxHp;
      enemy.hpBar.width = 26 * ratio;
      if (ratio >= 0.7) enemy.hpBar.setFillStyle(0x44ff44);
      else if (ratio >= 0.4) enemy.hpBar.setFillStyle(0xffaa00);
      // 힐 이펙트: 초록 플래시
      this.tweens.add({
        targets: enemy, alpha: 0.5,
        duration: 150, yoyo: true,
      });
    });
  }

  /**
   * 보스 처치 보상 이벤트 - 골드 지급.
   * @param {{ reward: number }} data
   */
  _onBossKilled({ reward }) {
    this.gold += reward;
    this._updateHUD();

    const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 60, `🏆 보스 처치! +${reward}g`, {
      fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(115);

    this.tweens.add({
      targets: popup, y: popup.y - 50, alpha: 0,
      duration: 1500,
      onComplete: () => popup.destroy(),
    });
  }

  /**
   * 포자 디버프 이벤트 - 범위 내 타워 공격속도 임시 감소.
   * @param {{ x: number, y: number, speedReduction: number, duration: number }} data
   */
  _onSporeDebuff({ x, y, speedReduction, duration }) {
    const debuffRadius = 120;
    this.towers.getChildren().forEach(tower => {
      if (!tower.active) return;
      if (tower.data_?.id === 'delivery' || tower.data_?.id === 'soup_pot') return;
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist > debuffRadius) return;

      // 공격속도 감소 (음수 buff로 적용)
      if (tower.applyBuff) tower.applyBuff('speed', -speedReduction);

      // 보라색 플래시
      this.tweens.add({
        targets: tower, alpha: 0.6,
        duration: 200, yoyo: true,
      });

      // 지속시간 후 해제
      this.time.delayedCall(duration, () => {
        if (tower.active && tower.removeBuff) tower.removeBuff();
        // 현재 글로벌 버프 재적용
        if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
      });
    });

    // 포자 이펙트 팝업
    const popup = this.add.text(x, y - 20, '🍄 포자!', {
      fontSize: '12px', color: '#8b6914',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(115);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0,
      duration: 1000,
      onComplete: () => popup.destroy(),
    });
  }

  /**
   * 보스 디버프 이벤트 - 전체 타워 공격속도 임시 감소.
   * @param {{ speedReduction: number, duration: number }} data
   */
  _onBossDebuff({ speedReduction, duration }) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active) return;
      if (tower.data_?.id === 'delivery' || tower.data_?.id === 'soup_pot') return;
      if (tower.applyBuff) tower.applyBuff('speed', -speedReduction);
    });

    // 경고 팝업
    const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 80, '🐉 용의 포효! 공격속도 감소!', {
      fontSize: '14px', color: '#ff4444', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(115);
    this.tweens.add({
      targets: popup, y: popup.y - 40, alpha: 0,
      duration: 2000,
      onComplete: () => popup.destroy(),
    });

    // 지속시간 후 해제
    this.time.delayedCall(duration, () => {
      this.towers.getChildren().forEach(tower => {
        if (tower.active && tower.removeBuff) tower.removeBuff();
        if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
      });

      const recoverPopup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 80, '디버프 해제!', {
        fontSize: '12px', color: '#44ff44',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(115);
      this.tweens.add({
        targets: recoverPopup, y: recoverPopup.y - 30, alpha: 0,
        duration: 1000,
        onComplete: () => recoverPopup.destroy(),
      });
    });
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
      // delivery_speed 업그레이드: 수거 간격 단축
      const deliveryBonus = UpgradeManager.getDeliverySpeedMultiplier();
      const effectiveInterval = (tower.data_.collectInterval || 2000) / deliveryBonus;
      if (tower._collectTimer < effectiveInterval) return;
      tower._collectTimer = 0;

      // 범위 내 드롭 수거
      const drops = this.ingredientManager.drops;
      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop || !drop.container) continue;
        const dist = Phaser.Math.Distance.Between(
          tower.x, tower.y, drop.container.x, drop.container.y
        );
        // petit_chef 패시브: 수거 범위 보너스
        const collectRange = (tower.data_.collectRadius || 110) * ChefManager.getCollectRangeBonus();
        if (dist <= collectRange) {
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
    this._showMessage(`웨이브 ${this.waveManager.currentWave} 클리어!`, 2000);

    // 수동 웨이브 버튼 활성화 (자동 진행 대신)
    this.time.delayedCall(1500, () => {
      this._setWaveButtonEnabled(true);
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
      this.scene.start('GameOverScene', {
        score: this.score, isVictory: false,
        stageId: this.stageId, lives: this.lives,
        starThresholds: this.stageData?.starThresholds,
      });
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
        this.scene.start('GameOverScene', {
          score: this.score, isVictory: true,
          stageId: this.stageId, lives: this.lives,
          starThresholds: this.stageData?.starThresholds,
        });
      });
    });
  }

  // ── 웨이브 시작 버튼 ────────────────────────────────────────────

  /** 맵 중앙에 웨이브 시작 버튼 생성 */
  _createWaveButton() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_AREA_Y + GAME_AREA_HEIGHT - 30;

    this._waveBtnBg = this.add.rectangle(cx, cy, 160, 36, 0xff6b35)
      .setDepth(115).setInteractive({ useHandCursor: true });
    this._waveBtnText = this.add.text(cx, cy, '웨이브 시작 ▶', {
      fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(116);

    this._waveBtnBg.on('pointerdown', () => {
      if (!this._waveBtnEnabled) return;
      this.waveManager.startNextWave();
      // 튜토리얼 3단계 완료
      if (this._tutorialStep === 3) this._advanceTutorial();
    });
    this._waveBtnBg.on('pointerover', () => {
      if (this._waveBtnEnabled) this._waveBtnBg.setFillStyle(0xff8c00);
    });
    this._waveBtnBg.on('pointerout', () => {
      if (this._waveBtnEnabled) this._waveBtnBg.setFillStyle(0xff6b35);
    });

    this._waveBtnEnabled = true;
    this._waveBtnPulse = null;
    this._setWaveButtonEnabled(true);
  }

  /**
   * 웨이브 버튼 활성/비활성 전환.
   * @param {boolean} enabled
   */
  _setWaveButtonEnabled(enabled) {
    this._waveBtnEnabled = enabled;
    if (enabled) {
      this._waveBtnBg.setFillStyle(0xff6b35).setAlpha(1);
      this._waveBtnText.setAlpha(1);
      const nextWave = this.waveManager.currentWave + 1;
      this._waveBtnText.setText(nextWave <= 1 ? '웨이브 시작 ▶' : `웨이브 ${nextWave} ▶`);
      this._waveBtnBg.setVisible(true);
      this._waveBtnText.setVisible(true);
      // 펄스 애니메이션
      if (this._waveBtnPulse) this._waveBtnPulse.stop();
      this._waveBtnPulse = this.tweens.add({
        targets: [this._waveBtnBg, this._waveBtnText],
        scaleX: 1.06, scaleY: 1.06,
        duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut',
      });
    } else {
      this._waveBtnBg.setVisible(false);
      this._waveBtnText.setVisible(false);
      if (this._waveBtnPulse) {
        this._waveBtnPulse.stop();
        this._waveBtnPulse = null;
      }
      this._waveBtnBg.setScale(1);
      this._waveBtnText.setScale(1);
    }
  }

  // ── 튜토리얼 ──────────────────────────────────────────────────

  /** 3단계 튜토리얼 시작 (이미 완료한 경우 스킵) */
  _startTutorial() {
    if (SaveManager.isTutorialDone()) {
      this._tutorialStep = 0;
      return;
    }
    this._tutorialStep = 1;
    this._showTutorialHint('1/3 하단 타워 바에서\n프라이팬을 선택하세요!');
  }

  /**
   * 튜토리얼 힌트 표시.
   * @param {string} text
   */
  _showTutorialHint(text) {
    if (this._tutorialContainer) {
      this._tutorialContainer.destroy();
      this._tutorialContainer = null;
    }

    const cx = GAME_WIDTH / 2;
    const cy = GAME_AREA_Y + 40;
    const bg = this.add.rectangle(cx, cy, 280, 50, 0x0000aa, 0.85).setDepth(130);
    const label = this.add.text(cx, cy - 8, text, {
      fontSize: '13px', color: '#ffffff', align: 'center', lineSpacing: 4,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(131);

    const skip = this.add.text(cx + 120, cy + 16, '[건너뛰기]', {
      fontSize: '10px', color: '#aaaaaa',
    }).setOrigin(1, 0.5).setDepth(131).setInteractive({ useHandCursor: true });
    skip.on('pointerdown', () => this._endTutorial());

    this._tutorialContainer = this.add.container(0, 0, [bg, label, skip]).setDepth(130);
  }

  /** 튜토리얼 단계 진행 */
  _advanceTutorial() {
    this._tutorialStep++;
    if (this._tutorialStep === 2) {
      this._showTutorialHint('2/3 경로 옆 빈 칸에\n타워를 배치하세요!');
    } else if (this._tutorialStep === 3) {
      this._showTutorialHint('3/3 준비되면\n웨이브 시작 버튼을 탭!');
    } else {
      this._endTutorial();
    }
  }

  /** 튜토리얼 종료 */
  _endTutorial() {
    this._tutorialStep = 0;
    if (this._tutorialContainer) {
      this._tutorialContainer.destroy();
      this._tutorialContainer = null;
    }
    SaveManager.completeTutorial();
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

    // 수프 솥 오라 버프
    this._updateSoupPotAuras(delta);

    // 셰프 스킬 쿨다운
    this._updateChefSkillCooldown(delta);
  }

  // ── 수프 솥 오라 버프 ──────────────────────────────────────────

  /**
   * 수프 솥 주변 타워에 공격속도 버프 적용.
   * auraInterval마다 범위 내 타워의 speedMultiplier를 갱신한다.
   * @param {number} delta
   */
  _updateSoupPotAuras(delta) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active || tower.data_?.id !== 'soup_pot') return;

      tower._auraTimer = (tower._auraTimer || 0) + delta;
      if (tower._auraTimer < (tower.data_.auraInterval || 3000)) return;
      tower._auraTimer = 0;

      const range = tower.data_.range || 120;
      const effect = tower.data_.auraEffect || 0.15;

      // 범위 내 전투 타워에 속도 버프
      this.towers.getChildren().forEach(other => {
        if (!other.active || other === tower) return;
        if (other.data_.id === 'delivery' || other.data_.id === 'soup_pot') return;

        const dist = Phaser.Math.Distance.Between(tower.x, tower.y, other.x, other.y);
        if (dist <= range) {
          other.applyBuff('speed', effect);
          // 시각 피드백: 짧은 초록 플래시
          this.tweens.add({
            targets: other, alpha: 0.7,
            duration: 150, yoyo: true,
          });
        }
      });

      // 솥 자체 펄스 이펙트
      this.tweens.add({
        targets: tower, scaleX: 1.15, scaleY: 1.15,
        duration: 200, yoyo: true,
      });
    });
  }

  shutdown() {
    this.events.off('enemy_died', this._onEnemyDied, this);
    this.events.off('enemy_reached_base', this._onEnemyReachedBase, this);
    this.events.off('boss_summon', this._onBossSummon, this);
    this.events.off('enemy_split', this._onEnemySplit, this);
    this.events.off('enemy_death_heal', this._onEnemyDeathHeal, this);
    this.events.off('boss_killed', this._onBossKilled, this);
    this.events.off('spore_debuff', this._onSporeDebuff, this);
    this.events.off('boss_debuff', this._onBossDebuff, this);
    this.events.off('wave_started', this._onWaveStarted, this);
    GameEventBus.off('gold_earned', this._onGoldEarned, this);
    GameEventBus.off('combo_changed', this._onComboChanged, this);
    GameEventBus.off('buff_activated', this._onBuffActivated, this);
    GameEventBus.off('buff_expired', this._onBuffExpired, this);
    this.ingredientManager?.destroy();
  }
}
