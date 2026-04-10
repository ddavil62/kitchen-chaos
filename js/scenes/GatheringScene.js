/**
 * @fileoverview 재료 채집 씬 (풀스크린 TD).
 * Phase 13-3: MarketScene을 기반으로 GatheringScene으로 리워크.
 * - 골드 시스템 완전 제거 (STARTING_GOLD, WAVE_CLEAR_BONUS 미사용)
 * - 타워 배치 → 도구 배치 (ToolManager 인벤토리 기반)
 * - 보스 처치 보상: 골드 → 재료 드롭
 * - HUD: 골드 표시 → 도구 수량 표시
 * - 도구 자유 재배치 (탭-탭 방식)
 *
 * 적 처치 → 재료 드롭 → 인벤토리 누적.
 * 전 웨이브 클리어 시 ServiceScene으로 전환.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRID_COLS, GRID_ROWS,
         CELL_W, CELL_H, HALF_W, HALF_H,
         HUD_HEIGHT, GAME_AREA_Y, GAME_AREA_HEIGHT, TOWER_BAR_Y, TOWER_BAR_HEIGHT,
         INGREDIENT_BAR_Y, INGREDIENT_BAR_HEIGHT, WAVE_CONTROL_Y, WAVE_CONTROL_HEIGHT,
         PATH_CELLS, isPathCell, cellToWorld, worldToCell, cellDiamond,
         buildPathCellsFromSegments, buildWaypointsFromSegments,
         STARTING_LIVES } from '../config.js';
import { TOWER_TYPES, TOOL_DEFS, ENEMY_TYPES, INGREDIENT_TYPES, BUFF_RECIPES } from '../data/gameData.js';
import { Enemy } from '../entities/Enemy.js';
import { STAGES } from '../data/stageData.js';
import { Tower } from '../entities/Tower.js';
import { WaveManager } from '../managers/WaveManager.js';
import { IngredientManager } from '../managers/IngredientManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { ChefManager } from '../managers/ChefManager.js';
import { OrderManager } from '../managers/OrderManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { VFXManager } from '../managers/VFXManager.js';
import { TutorialManager } from '../managers/TutorialManager.js';
import { ToolManager } from '../managers/ToolManager.js';

export class GatheringScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GatheringScene' });
  }

  /** @param {{ stageId?: string }} data */
  create(data) {
    // ── BGM 재생 (Phase 10-4) ──
    SoundManager.playBGM('bgm_battle');

    // ── 전체 화면 배경 (씬 전환 시 이전 씬 잔상 방지) ──
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // ── VFX 매니저 (Phase 10-5) ──
    this.vfx = new VFXManager(this);

    // ── 스테이지 데이터 로딩 ──
    this.stageId = data?.stageId || '1-1';
    this.stageData = STAGES[this.stageId];
    this.stagePathCells = this.stageData
      ? buildPathCellsFromSegments(this.stageData.pathSegments)
      : PATH_CELLS;
    this.stageWaypoints = this.stageData
      ? buildWaypointsFromSegments(this.stageData.pathSegments)
      : null;

    // ── 게임 상태 (골드 제거, 도구 배치 카운트 추가) ──
    this.lives = STARTING_LIVES;
    this.score = 0;
    this.selectedTowerType = null;
    this._activeTowerCategory = 'attack';
    this._towerBarButtons = [];
    this._towerTabObjects = [];
    this.isGameOver = false;
    this.isVictory = false;
    this.waitingForNextWave = false;

    /** @type {Object<string, number>} 배치된 도구 수 (typeId → count) */
    this.deployedCounts = {};

    /** @type {Tower|null} 현재 선택된(재배치 대상) 타워 */
    this._selectedTower = null;

    // ── 그룹 ──
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.projectiles = this.add.group();

    // ── 맵 렌더링 ──
    this._drawMap();

    // ── 매니저 ──
    this.ingredientManager = new IngredientManager(this);
    this.inventoryManager = new InventoryManager();
    this.waveManager = new WaveManager(this, this.enemies, {
      waves: this.stageData?.waves,
      waypoints: this.stageWaypoints,
    });

    // ── 오더 매니저 ──
    this.orderManager = new OrderManager();

    // ── 셰프 스킬 상태 ──
    this._chefData = ChefManager.getChefData();
    this._skillCooldownTimer = 0;
    this._skillReady = true;

    // ── 버프 상태 (채집 내부 버프) ──
    this._currentBuff = null;
    this._buffTimer = 0;

    // ── HUD ──
    this._createHUD();

    // ── 셰프 스킬 버튼 ──
    this._createChefSkillButton();

    // ── 도구 선택 바 ──
    this._createTowerBar();

    // ── 재료 수집 현황 바 ──
    this._createIngredientBar();

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

    // ── 재료 수거 시 인벤토리에 누적 ──
    this.events.on('inventory_changed', this._onInventoryChanged, this);

    // ── 오더 추적용 씬 이벤트 ──
    this.events.on('ingredient_collected_for_order', this._onIngredientCollectedForOrder, this);

    // ── VFX용 재료 수거 위치 이벤트 (Phase 10-5) ──
    this.events.on('ingredient_collected_at', this._onIngredientCollectedAt, this);

    // ── 웨이브 시작 버튼 ──
    this._createWaveButton();

    // ── 튜토리얼 ──
    this._tutorial = new TutorialManager(this, 'battle', [
      '1/3 하단 도구 바에서\n도구를 선택하세요!',
      '2/3 경로 옆 빈 칸에\n도구를 배치하세요!',
      '3/3 준비되면\n웨이브 시작 버튼을 탭!',
    ]);
    this._tutorial.start();

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

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
      const exitPt = wp[wp.length - 2];
      this.add.text(exitPt.x, exitPt.y, '\uD83C\uDFE0', {
        fontSize: '16px',
      }).setOrigin(0.5).setDepth(1);

      const entryPt = wp[1];
      this.add.text(entryPt.x, entryPt.y - HALF_H - 8, '\u25BC', {
        fontSize: '12px', color: '#ff4444',
      }).setOrigin(0.5).setDepth(1);
    }
  }

  // ── HUD (상단 40px) ─────────────────────────────────────────────

  _createHUD() {
    const hudBg = this.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, 0x1a1a2e);
    hudBg.setDepth(100);

    // 골드 대신 도구 수량 표시 (배치된/보유)
    const inventory = ToolManager.getToolInventory();
    const totalOwned = Object.values(inventory).reduce((s, t) => s + t.count, 0);
    this.toolCountText = this.add.text(10, 10, `\uD83D\uDD27 0/${totalOwned}`, {
      fontSize: '14px', color: '#88ccff', fontStyle: 'bold',
    }).setDepth(101);

    this.waveText = this.add.text(GAME_WIDTH / 2, 10, '\uC6E8\uC774\uBE0C 0/8', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(101);

    this.livesText = this.add.text(GAME_WIDTH - 10, 10, `\u2764\uFE0F ${this.lives}`, {
      fontSize: '14px', color: '#ff4444',
    }).setOrigin(1, 0).setDepth(101);

    this.comboText = this.add.text(GAME_WIDTH / 2, 26, '', {
      fontSize: '11px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(101);
  }

  /**
   * HUD 텍스트 갱신.
   * 골드 대신 배치된 도구 수 / 보유 도구 수를 표시한다.
   */
  _updateHUD() {
    const inventory = ToolManager.getToolInventory();
    const totalOwned = Object.values(inventory).reduce((s, t) => s + t.count, 0);
    const totalDeployed = Object.values(this.deployedCounts).reduce((s, n) => s + n, 0);
    this.toolCountText.setText(`\uD83D\uDD27 ${totalDeployed}/${totalOwned}`);
    this.livesText.setText(`\u2764\uFE0F ${this.lives}`);
  }

  // ── 셰프 스킬 버튼 (HUD 영역, 도구수 옆) ───────────────────────

  /**
   * 셰프 스킬 버튼 생성.
   * ChefManager.getChefData()가 null이면 숨김.
   * @private
   */
  _createChefSkillButton() {
    if (!this._chefData) return;

    const btnX = 90;
    const btnY = 8;

    // 아이콘 배경 (둥근 사각형)
    this._skillBtnBg = this.add.rectangle(btnX, btnY + 10, 30, 30, 0x333355)
      .setDepth(101).setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, this._chefData.color);

    // 셰프 아이콘
    this._skillBtnIcon = this.add.text(btnX, btnY + 6, this._chefData.icon, {
      fontSize: '14px',
    }).setOrigin(0.5).setDepth(102);

    // 쿨다운 오버레이 (어둡게)
    this._skillCooldownOverlay = this.add.rectangle(btnX, btnY + 10, 30, 30, 0x000000, 0.6)
      .setDepth(103).setVisible(false);

    // 쿨다운 텍스트
    this._skillCooldownText = this.add.text(btnX, btnY + 14, '', {
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
      const burnDamage = val.dps;
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

  // ── 도구 선택 바 (480~540px) ──────────────────────────────────
  // 탭 영역(16px) + 버튼 영역(34px) = 50px + 버프 탭 추가

  _createTowerBar() {
    this._renderTowerBarBackground();
    this._renderTowerTabs();
    this._renderTowerButtons();
  }

  /** 도구 바 배경 (1회 호출) */
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
      { id: 'buff', label: '버프' },
    ];
    const tabY = TOWER_BAR_Y + 8;

    categories.forEach((cat, i) => {
      const cx = 30 + i * 50;
      const bg = this.add.rectangle(cx, tabY, 46, 14,
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

  /**
   * 현재 카테고리에 맞는 도구 또는 버프 버튼 렌더링.
   * Phase 13-3: TOWER_TYPES 대신 ToolManager 인벤토리 기반으로 표시.
   * 보유 수량 > 0인 도구만 표시하며, 비용 대신 잔여 수량을 표시한다.
   */
  _renderTowerButtons() {
    // 기존 버튼 제거
    this._towerBarButtons.forEach(obj => obj.container.destroy());
    this._towerBarButtons = [];

    if (this._activeTowerCategory === 'buff') {
      this._renderBuffButtons();
      return;
    }

    // ToolManager 인벤토리에서 보유 도구 조회
    const inventory = ToolManager.getToolInventory();
    const toolIds = Object.keys(TOOL_DEFS).filter(id => {
      const def = TOOL_DEFS[id];
      const owned = inventory[id]?.count || 0;
      return def.category === this._activeTowerCategory && owned > 0;
    });

    if (toolIds.length === 0) return;

    const btnWidth = GAME_WIDTH / toolIds.length;
    const btnY = TOWER_BAR_Y + 16 + 17; // 버튼 영역 중심

    toolIds.forEach((id, i) => {
      const def = TOOL_DEFS[id];
      const owned = inventory[id]?.count || 0;
      const deployed = this.deployedCounts[id] || 0;
      const available = owned - deployed;
      const cx = btnWidth * i + btnWidth / 2;

      const bg = this.add.rectangle(cx, btnY, btnWidth - 4, 30,
        available > 0 ? 0x333355 : 0x222233
      ).setDepth(101).setInteractive({ useHandCursor: true });

      const name = this.add.text(cx, btnY - 5, def.nameKo, {
        fontSize: '11px', color: available > 0 ? '#ffffff' : '#666666',
      }).setOrigin(0.5).setDepth(102);

      // 잔여 수량 표시: "×2" 형태
      const countLabel = this.add.text(cx, btnY + 8, `\u00D7${available}`, {
        fontSize: '10px', color: available > 0 ? '#88ccff' : '#555555',
      }).setOrigin(0.5).setDepth(102);

      bg.on('pointerdown', () => {
        if (available <= 0) {
          this._showMessage('남은 수량 없음', 800);
          return;
        }
        this._deselectTower(); // 재배치 모드 해제
        this.selectedTowerType = this.selectedTowerType === id ? null : id;
        this._updateTowerBarSelection();
        // 튜토리얼 1단계: 도구 선택 완료
        if (this._tutorial?.isActive() && this.selectedTowerType) this._tutorial.advance();
      });

      // 컨테이너로 묶어 한 번에 destroy 가능
      const container = this.add.container(0, 0, [bg, name, countLabel]).setDepth(100);
      this._towerBarButtons.push({ container, bg, id });
    });

    this._updateTowerBarSelection();
  }

  /**
   * 버프 레시피 버튼 렌더링 (도구 바 영역에 표시).
   * 채집 중 재료를 소비하여 타워에 버프를 적용한다.
   * @private
   */
  _renderBuffButtons() {
    const recipes = BUFF_RECIPES;
    if (recipes.length === 0) return;

    // 화면 너비에 3개씩 표시 (스크롤 없이)
    const maxVisible = Math.min(recipes.length, 3);
    const btnWidth = GAME_WIDTH / maxVisible;
    const btnY = TOWER_BAR_Y + 16 + 17;

    recipes.slice(0, maxVisible).forEach((recipe, i) => {
      const cx = btnWidth * i + btnWidth / 2;
      const canCraft = this.inventoryManager.hasEnough(recipe.ingredients);

      const bg = this.add.rectangle(cx, btnY, btnWidth - 4, 30,
        canCraft ? 0x335533 : 0x333333
      ).setDepth(101).setInteractive({ useHandCursor: true });

      const name = this.add.text(cx, btnY - 5, recipe.nameKo, {
        fontSize: '10px', color: canCraft ? '#88ff88' : '#666666',
      }).setOrigin(0.5).setDepth(102);

      // 재료 요약
      const ingText = Object.entries(recipe.ingredients)
        .map(([id, n]) => `${INGREDIENT_TYPES[id]?.icon || id}${n}`)
        .join(' ');
      const ingLabel = this.add.text(cx, btnY + 8, ingText, {
        fontSize: '9px', color: canCraft ? '#ffd700' : '#555555',
      }).setOrigin(0.5).setDepth(102);

      bg.on('pointerdown', () => {
        if (this.isGameOver || this.isVictory) return;
        this._activateBuffRecipe(recipe);
      });

      const container = this.add.container(0, 0, [bg, name, ingLabel]).setDepth(100);
      this._towerBarButtons.push({ container, bg, id: recipe.id });
    });
  }

  /**
   * 버프 레시피 발동 (인벤토리에서 재료 소비).
   * @param {object} recipe - BUFF_RECIPES 항목
   * @private
   */
  _activateBuffRecipe(recipe) {
    if (!this.inventoryManager.hasEnough(recipe.ingredients)) {
      this._showMessage('재료가 부족합니다', 800);
      return;
    }

    // 인벤토리에서 소비
    this.inventoryManager.consumeRecipe(recipe.ingredients);

    // 기존 버프가 있으면 해제
    if (this._currentBuff) {
      this._onBuffExpiredInternal();
    }

    // 버프 적용
    this._currentBuff = { effectType: recipe.effectType, effectValue: recipe.effectValue, duration: recipe.duration };
    this._buffTimer = recipe.duration;
    this.towers.getChildren().forEach(tower => {
      this._applyBuffToTower(tower, this._currentBuff);
    });

    this._showMessage(`${recipe.nameKo} 버프 발동!`, 1500);
    this._updateIngredientBar();
    // VFX: 버프 활성화 오라 (화면 중앙)
    this.vfx.buffActivate(GAME_WIDTH / 2, GAME_AREA_Y + GAME_AREA_HEIGHT / 2);
    SoundManager.playSFX('sfx_buff_on');

    // 버프 탭이 활성화 상태면 버튼 갱신
    if (this._activeTowerCategory === 'buff') {
      this._renderTowerButtons();
    }
  }

  /**
   * 내부 버프 만료 처리.
   * @private
   */
  _onBuffExpiredInternal() {
    this._currentBuff = null;
    this._buffTimer = 0;
    this.towers.getChildren().forEach(tower => {
      if (tower.removeBuff) tower.removeBuff();
    });
  }

  _updateTowerBarSelection() {
    this._towerBarButtons.forEach(btn => {
      const inventory = ToolManager.getToolInventory();
      const owned = inventory[btn.id]?.count || 0;
      const deployed = this.deployedCounts[btn.id] || 0;
      const available = owned - deployed;

      if (btn.id === this.selectedTowerType) {
        btn.bg.setFillStyle(0x885500);
      } else {
        btn.bg.setFillStyle(available > 0 ? 0x333355 : 0x222233);
      }
    });
  }

  // ── 재료 수집 현황 바 (540~590px) ─────────────────────────────────

  /**
   * 재료 수집 현황 바 생성.
   * 수집한 재료 아이콘 + 수량을 실시간 표시한다.
   * @private
   */
  _createIngredientBar() {
    // 배경
    this.add.rectangle(
      GAME_WIDTH / 2, INGREDIENT_BAR_Y + INGREDIENT_BAR_HEIGHT / 2,
      GAME_WIDTH, INGREDIENT_BAR_HEIGHT, 0x0d0d1a
    ).setDepth(100);

    // 타이틀
    this._ingredientBarTitle = this.add.text(10, INGREDIENT_BAR_Y + 4, '수집 현황:', {
      fontSize: '10px', color: '#aaaaaa',
    }).setDepth(101);

    // 재료 아이콘+수량 텍스트 (동적 갱신)
    this._ingredientBarTexts = [];
    const ingredientIds = Object.keys(INGREDIENT_TYPES);
    const perRow = 5;
    const slotW = (GAME_WIDTH - 20) / perRow;

    ingredientIds.forEach((id, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = 15 + col * slotW;
      const y = INGREDIENT_BAR_Y + 18 + row * 16;

      const text = this.add.text(x, y, `${INGREDIENT_TYPES[id].icon}0`, {
        fontSize: '11px', color: '#888888',
      }).setDepth(101);

      this._ingredientBarTexts.push({ id, text });
    });
  }

  /**
   * 재료 수집 현황 바 갱신.
   * @private
   */
  _updateIngredientBar() {
    const inv = this.inventoryManager.getAll();
    this._ingredientBarTexts.forEach(({ id, text }) => {
      const count = inv[id] || 0;
      text.setText(`${INGREDIENT_TYPES[id].icon}${count}`);
      text.setColor(count > 0 ? '#ffffff' : '#555555');
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

  /**
   * 셀 탭 처리.
   * Phase 13-3: 선택된 타워가 있으면 재배치, 아니면 새 도구 배치.
   * @param {number} col
   * @param {number} row
   */
  _onCellTap(col, row) {
    // ── 재배치 모드: 선택된 타워를 이동 ──
    if (this._selectedTower) {
      this._handleTowerRelocate(col, row);
      return;
    }

    // ── 기존 타워 탭 → 선택(재배치 모드 진입) ──
    const key = `${col},${row}`;
    const existingTower = this.towers.getChildren().find(t => t._cellKey === key);
    if (existingTower) {
      this._onTowerTap(existingTower);
      return;
    }

    // ── 새 도구 배치 ──
    if (!this.selectedTowerType) return;

    if (this.stagePathCells.has(`${col},${row}`)) {
      this._showMessage('경로 위에는 배치할 수 없습니다', 1000);
      return;
    }

    const exists = this.towers.getChildren().some(t => t._cellKey === key);
    if (exists) {
      this._showMessage('이미 도구가 있습니다', 800);
      return;
    }

    // 잔여 수량 체크 (골드 체크 대신)
    const typeId = this.selectedTowerType;
    if (this._getAvailableCount(typeId) <= 0) {
      this._showMessage('남은 수량 없음', 800);
      return;
    }

    this._placeTower(col, row, typeId);
  }

  /**
   * 도구의 남은 배치 가능 수량 조회.
   * @param {string} toolId
   * @returns {number}
   * @private
   */
  _getAvailableCount(toolId) {
    const inventory = ToolManager.getToolInventory();
    const owned = inventory[toolId]?.count || 0;
    const deployed = this.deployedCounts[toolId] || 0;
    return owned - deployed;
  }

  /**
   * 도구 배치.
   * Phase 13-3: 골드 차감 대신 deployedCounts 증가, ToolManager 스탯 사용.
   * @param {number} col
   * @param {number} row
   * @param {string} typeId
   */
  _placeTower(col, row, typeId) {
    // ToolManager에서 현재 레벨 스탯 조회
    const toolStats = ToolManager.getToolStats(typeId);
    const toolDef = TOOL_DEFS[typeId];
    // Tower에 전달할 towerData 구성 (TOWER_TYPES 형식 호환)
    const towerData = {
      ...toolDef,
      ...toolStats,
      id: typeId,
      nameKo: toolDef.nameKo,
      color: toolDef.color,
      category: toolDef.category,
    };

    const { x, y } = cellToWorld(col, row);

    const tower = new Tower(this, x, y, towerData, this.projectiles);
    tower._cellKey = `${col},${row}`;
    tower._col = col;
    tower._row = row;
    tower._typeId = typeId;
    // 아이소메트릭 depth sorting: col+row 기준
    tower.setDepth(10 + col + row);
    this.towers.add(tower);

    // 타워 탭 이벤트 (재배치용)
    tower.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains);

    // 현재 버프 적용
    if (this._currentBuff) {
      this._applyBuffToTower(tower, this._currentBuff);
    }

    // 배치 카운트 증가 (골드 차감 대신)
    this.deployedCounts[typeId] = (this.deployedCounts[typeId] || 0) + 1;
    this._updateHUD();
    // 팔레트 갱신 (잔여 수량 업데이트)
    this._renderTowerButtons();

    this.tweens.add({
      targets: tower,
      scaleX: 1.2, scaleY: 1.2,
      duration: 150, yoyo: true,
    });

    // 튜토리얼 2단계: 도구 배치 완료
    if (this._tutorial?.isActive()) this._tutorial.advance();
  }

  // ── 도구 재배치 (탭-탭 방식) ─────────────────────────────────

  /**
   * 배치된 도구 탭 처리.
   * @param {Tower} tower
   * @private
   */
  _onTowerTap(tower) {
    if (this._selectedTower === tower) {
      // 이미 선택된 도구 다시 탭 → 선택 해제
      this._deselectTower();
      return;
    }
    this._selectTower(tower);
  }

  /**
   * 타워 선택 (노란 테두리 + 회수 버튼 표시).
   * @param {Tower} tower
   * @private
   */
  _selectTower(tower) {
    this._deselectTower(); // 기존 선택 해제
    this.selectedTowerType = null; // 새 배치 모드 해제
    this._updateTowerBarSelection();
    this._selectedTower = tower;
    // 노란 테두리 표시 (Container의 첫 번째 자식이 비주얼)
    if (tower.list && tower.list.length > 0) {
      tower.list[0].setStrokeStyle?.(2, 0xffff00);
    }
    this._showRecallButton(tower);
  }

  /**
   * 타워 선택 해제.
   * @private
   */
  _deselectTower() {
    if (this._selectedTower) {
      // 노란 테두리 제거
      if (this._selectedTower.list && this._selectedTower.list.length > 0) {
        this._selectedTower.list[0].setStrokeStyle?.(0);
      }
      this._selectedTower = null;
    }
    this._hideRecallButton();
  }

  /**
   * 회수 버튼 표시.
   * @param {Tower} tower
   * @private
   */
  _showRecallButton(tower) {
    this._hideRecallButton();
    const btnX = tower.x;
    const btnY = tower.y - 30;

    this._recallBg = this.add.rectangle(btnX, btnY, 50, 20, 0xaa3333, 0.9)
      .setDepth(200).setInteractive({ useHandCursor: true });
    this._recallLabel = this.add.text(btnX, btnY, '회수', {
      fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201);

    this._recallBg.on('pointerdown', () => {
      this._recallTower(this._selectedTower);
    });
  }

  /**
   * 회수 버튼 숨김.
   * @private
   */
  _hideRecallButton() {
    if (this._recallBg) {
      this._recallBg.destroy();
      this._recallBg = null;
    }
    if (this._recallLabel) {
      this._recallLabel.destroy();
      this._recallLabel = null;
    }
  }

  /**
   * 도구 회수: 제거하고 잔여 수량 +1.
   * @param {Tower} tower
   * @private
   */
  _recallTower(tower) {
    if (!tower) return;
    const typeId = tower._typeId || tower.data_?.id;
    this.deployedCounts[typeId] = Math.max(0, (this.deployedCounts[typeId] || 0) - 1);
    this.towers.remove(tower, true, true);
    this._deselectTower();
    this._renderTowerButtons(); // 팔레트 갱신
    this._updateHUD();
  }

  /**
   * 선택된 타워를 새 위치로 재배치 처리.
   * @param {number} col
   * @param {number} row
   * @private
   */
  _handleTowerRelocate(col, row) {
    const key = `${col},${row}`;

    // 경로 위 불가
    if (this.stagePathCells.has(key)) {
      this._showMessage('경로 위에는 배치할 수 없습니다', 1000);
      return;
    }

    // 이미 다른 타워가 있는 위치 불가
    const existingTower = this.towers.getChildren().find(t => t._cellKey === key);
    if (existingTower) {
      // 다른 타워를 탭한 것으로 처리 (선택 전환)
      this._onTowerTap(existingTower);
      return;
    }

    // 이동 실행: 기존 위치에서 제거 + 새 위치에 배치
    const tower = this._selectedTower;
    const typeId = tower._typeId || tower.data_?.id;
    const { x, y } = cellToWorld(col, row);

    tower.x = x;
    tower.y = y;
    tower._cellKey = key;
    tower._col = col;
    tower._row = row;
    tower.setDepth(10 + col + row);

    this._deselectTower();

    // 이동 연출
    this.tweens.add({
      targets: tower,
      scaleX: 1.15, scaleY: 1.15,
      duration: 120, yoyo: true,
    });
  }

  // ── 이벤트 핸들러 (씬 내부) ────────────────────────────────────

  _onWaveStarted(waveNum) {
    this.waveText.setText(`\uC6E8\uC774\uBE0C ${waveNum}/${this.waveManager.totalWaves}`);
    this.waitingForNextWave = false;
    this._setWaveButtonEnabled(false);
    SoundManager.playSFX('sfx_wave_start');
    // VFX: 웨이브 시작 알림 + 흰 플래시
    this.vfx.waveAnnounce(waveNum);
    this.vfx.screenFlash(0xffffff, 0.3, 200);

    // ── Phase 11-3b: 보스 웨이브 BGM 전환 ──
    this._checkBossWaveBGM(waveNum);

    // ── 오더 생성 시도 ──
    const order = this.orderManager.tryGenerateOrder(waveNum);
    this._updateOrderHUD();
    if (order) {
      this._showMessage(`[오더] ${order.descKo}`, 2000);
    }
  }

  /**
   * 현재 웨이브에 보스 적이 포함되어 있으면 bgm_boss로 전환하고,
   * 보스가 없으면 bgm_battle로 복귀한다.
   * @param {number} waveNum - 1-based 웨이브 번호
   * @private
   */
  _checkBossWaveBGM(waveNum) {
    const waveDef = this.waveManager._waves[waveNum - 1];
    if (!waveDef) return;

    const hasBoss = waveDef.enemies.some(
      (e) => ENEMY_TYPES[e.type]?.isBoss
    );

    if (hasBoss) {
      SoundManager.playBGM('bgm_boss');
    } else if (SoundManager._currentBGMId === 'bgm_boss') {
      SoundManager.playBGM('bgm_battle');
    }
  }

  _onEnemyDied(enemy) {
    this.score++;
    this.orderManager.addProgress('kill_count');
    SoundManager.playSFX('sfx_enemy_death');
    // VFX: 적 사망 파티클
    if (enemy && enemy.x !== undefined) {
      const isBoss = !!enemy.data_?.isBoss;
      const color = enemy.data_?.bodyColor || 0xffffff;
      this.vfx.enemyDeath(enemy.x, enemy.y, color, isBoss);
    }
    this._checkWaveProgress();
  }

  _onEnemyReachedBase(enemy) {
    this.lives--;
    this._updateHUD();
    this.orderManager.addProgress('enemy_leaked');
    SoundManager.playSFX('sfx_enemy_base');
    // VFX: 화면 흔들림
    this.vfx.screenShake(3, 200);

    if (this.lives <= 0) {
      this._triggerGameOver();
    }
    this._checkWaveProgress();
  }

  /**
   * IngredientManager에서 재료를 수거했을 때 인벤토리에 누적.
   * @param {Object<string, number>} ingredientInventory - IngredientManager의 인벤토리
   * @private
   */
  _onInventoryChanged(ingredientInventory) {
    for (const [type, count] of Object.entries(ingredientInventory)) {
      const currentInvCount = this.inventoryManager.inventory[type] || 0;
      if (count > currentInvCount) {
        this.inventoryManager.add(type, count - currentInvCount);
      }
    }
    for (const [type] of Object.entries(ingredientInventory)) {
      this.ingredientManager.inventory[type] = this.inventoryManager.inventory[type] || 0;
    }
    this._updateIngredientBar();
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
    enemy.x = x + Phaser.Math.Between(-20, 20);
    enemy.y = y + Phaser.Math.Between(-10, 10);
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
      const ratio = enemy.hp / enemy.maxHp;
      enemy.hpBar.width = 26 * ratio;
      if (ratio >= 0.7) enemy.hpBar.setFillStyle(0x44ff44);
      else if (ratio >= 0.4) enemy.hpBar.setFillStyle(0xffaa00);
      this.tweens.add({
        targets: enemy, alpha: 0.5,
        duration: 150, yoyo: true,
      });
    });
  }

  /**
   * 보스 처치 보상 이벤트 - 재료 드롭으로 변경 (골드 제거).
   * Phase 13-3: bossDrops 배열로 재료를 인벤토리에 추가한다.
   * @param {{ reward: number, bossDrops?: Array<{ingredient: string, count: number}> }} data
   */
  _onBossKilled({ reward, bossDrops }) {
    SoundManager.playSFX('sfx_boss_death');
    // VFX: 보스 처치 연출
    this.vfx.bossAnnounce();

    // 재료 드롭 처리
    if (bossDrops && bossDrops.length > 0) {
      bossDrops.forEach(drop => {
        for (let i = 0; i < drop.count; i++) {
          this.inventoryManager.add(drop.ingredient);
        }
      });
      this._updateIngredientBar();

      // 드롭 표시 텍스트
      const dropText = bossDrops
        .map(d => `${INGREDIENT_TYPES[d.ingredient]?.icon || d.ingredient}\u00D7${d.count}`)
        .join(' ');

      const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 60,
        `\uD83C\uDFC6 보스 처치! ${dropText}`, {
        fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(115);

      this.tweens.add({
        targets: popup, y: popup.y - 50, alpha: 0,
        duration: 1500,
        onComplete: () => popup.destroy(),
      });
    } else {
      // bossDrops가 없는 경우 (하위 호환)
      const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 60,
        '\uD83C\uDFC6 보스 처치!', {
        fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(115);

      this.tweens.add({
        targets: popup, y: popup.y - 50, alpha: 0,
        duration: 1500,
        onComplete: () => popup.destroy(),
      });
    }
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

      if (tower.applyBuff) tower.applyBuff('speed', -speedReduction);

      this.tweens.add({
        targets: tower, alpha: 0.6,
        duration: 200, yoyo: true,
      });

      this.time.delayedCall(duration, () => {
        if (tower.active && tower.removeBuff) tower.removeBuff();
        if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
      });
    });

    const popup = this.add.text(x, y - 20, '\uD83C\uDF44 포자!', {
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
    // VFX: 강한 화면 흔들림 (보스 디버프)
    this.vfx.screenShake(6, 500);

    const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 80, '\uD83D\uDC09 용의 포효! 공격속도 감소!', {
      fontSize: '14px', color: '#ff4444', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(115);
    this.tweens.add({
      targets: popup, y: popup.y - 40, alpha: 0,
      duration: 2000,
      onComplete: () => popup.destroy(),
    });

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

  // ── 버프 적용 ──────────────────────────────────────────────────

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

  // ── 배달 도구 자동 수거 ────────────────────────────────────────

  _updateDeliveryTowers(delta) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active || tower.data_?.id !== 'delivery') return;
      tower._collectTimer = (tower._collectTimer || 0) + delta;
      const deliveryBonus = UpgradeManager.getDeliverySpeedMultiplier();
      const effectiveInterval = (tower.data_.collectInterval || 2000) / deliveryBonus;
      if (tower._collectTimer < effectiveInterval) return;
      tower._collectTimer = 0;

      const drops = this.ingredientManager.drops;
      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop || !drop.container) continue;
        const dist = Phaser.Math.Distance.Between(
          tower.x, tower.y, drop.container.x, drop.container.y
        );
        const collectRange = (tower.data_.collectRadius || 110) * ChefManager.getCollectRangeBonus();
        if (dist <= collectRange) {
          this.ingredientManager._collectDrop(drop);
          break;
        }
      }
    });
  }

  // ── 웨이브 관리 ─────────────────────────────────────────────────

  /**
   * 웨이브 클리어 진행 체크.
   * Phase 13-3: 골드 보너스 제거, 재료만 보상.
   */
  _checkWaveProgress() {
    if (this.waitingForNextWave) return;
    if (!this.waveManager.isWaveCleared()) return;

    // ── 오더 판정 ──
    this._resolveOrderOnWaveClear();

    if (this.waveManager.isLastWave()) {
      this._triggerVictory();
      return;
    }

    // 웨이브 클리어 팝업 (골드 보너스 제거)
    const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 20, '웨이브 클리어!', {
      fontSize: '14px', color: '#44ff44',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(110);

    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0,
      duration: 1200,
      onComplete: () => popup.destroy(),
    });

    this.waitingForNextWave = true;
    this._showMessage(`\uC6E8\uC774\uBE0C ${this.waveManager.currentWave} 클리어!`, 2000);

    // 수동 웨이브 버튼 활성화
    this.time.delayedCall(1500, () => {
      this._setWaveButtonEnabled(true);
    });
  }

  // ── 게임 종료 ───────────────────────────────────────────────────

  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    // VFX: 패배 빨강 플래시
    this.vfx.screenFlash(0xff0000, 0.5, 300);

    this.cameras.main.fadeOut(600, 100, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // 재료 채집 실패 → ResultScene으로 직접 전환 (영업 건너뜀)
      this.scene.start('ResultScene', {
        stageId: this.stageId,
        marketResult: {
          totalIngredients: this.inventoryManager.getTotal(),
          livesRemaining: 0,
          livesMax: STARTING_LIVES,
        },
        serviceResult: null,
        isMarketFailed: true,
      });
    });
  }

  /**
   * 승리 처리. 골드 전달 제거.
   */
  _triggerVictory() {
    if (this.isVictory) return;
    this.isVictory = true;
    // VFX: 클리어 연출
    this.vfx.clearAnnounce();

    // 인벤토리 집계 메시지
    const total = this.inventoryManager.getTotal();
    const inv = this.inventoryManager.getAll();
    const summary = Object.entries(inv)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `${INGREDIENT_TYPES[id]?.icon || id}${n}`)
      .join(' ');

    this._showMessage(`\uD83C\uDF89 재료 입고 완료!\n${summary || '재료 없음'}\n총 ${total}개 수집`, 3000);

    this.time.delayedCall(3200, () => {
      // 페이드 아웃 전환 연출
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // ServiceScene으로 전환 (골드 전달 제거)
        this.scene.start('ServiceScene', {
          inventory: this.inventoryManager.getAll(),
          stageId: this.stageId,
          lives: this.lives,
          marketResult: {
            totalIngredients: total,
            livesRemaining: this.lives,
            livesMax: STARTING_LIVES,
          },
        });
      });
    });
  }

  // ── 웨이브 시작 버튼 (590~640px 웨이브 컨트롤 영역) ────────────

  /** 웨이브 컨트롤 영역에 웨이브 시작 버튼 생성 */
  _createWaveButton() {
    const cx = GAME_WIDTH / 2;
    const cy = WAVE_CONTROL_Y + WAVE_CONTROL_HEIGHT / 2;

    // 웨이브 컨트롤 배경
    this.add.rectangle(cx, cy, GAME_WIDTH, WAVE_CONTROL_HEIGHT, 0x111122)
      .setDepth(100);

    this._waveBtnBg = this.add.rectangle(cx, cy, 160, 36, 0xff6b35)
      .setDepth(115).setInteractive({ useHandCursor: true });
    this._waveBtnText = this.add.text(cx, cy, '\uC6E8\uC774\uBE0C \uC2DC\uC791 \u25B6', {
      fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(116);

    this._waveBtnBg.on('pointerdown', () => {
      if (!this._waveBtnEnabled) return;
      this.waveManager.startNextWave();
      // 튜토리얼 3단계 완료
      if (this._tutorial?.isActive()) this._tutorial.advance();
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
      this._waveBtnText.setText(nextWave <= 1 ? '\uC6E8\uC774\uBE0C \uC2DC\uC791 \u25B6' : `\uC6E8\uC774\uBE0C ${nextWave} \u25B6`);
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

  // ── 오더 HUD ──────────────────────────────────────────────────

  /**
   * 오더 HUD 갱신.
   * waveText 아래(HUD 영역)에 오더 바를 표시한다.
   * @private
   */
  _updateOrderHUD() {
    const status = this.orderManager.getStatus();

    if (!status) {
      if (this._orderContainer) {
        this._orderContainer.setVisible(false);
      }
      return;
    }

    // 최초 생성
    if (!this._orderContainer) {
      this._orderBg = this.add.rectangle(GAME_WIDTH / 2, 34, 280, 14, 0x222244, 0.85)
        .setDepth(101);
      this._orderLabel = this.add.text(GAME_WIDTH / 2, 34, '', {
        fontSize: '9px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5).setDepth(102);
      this._orderContainer = this.add.container(0, 0, [this._orderBg, this._orderLabel])
        .setDepth(101);
    }

    this._orderContainer.setVisible(true);

    // 진행률 텍스트 구성
    let progressText;
    if (status.type === 'no_leak') {
      progressText = status.failed ? '[실패]' : (status.completed ? '[달성!]' : '[유지 중]');
    } else {
      progressText = `${status.progress}/${status.target}`;
    }

    let displayText = `[오더] ${status.descKo} ${progressText}`;

    if (status.completed) {
      this._orderBg.setFillStyle(0x225522, 0.85);
      this._orderLabel.setColor('#44ff44');
    } else if (status.failed) {
      this._orderBg.setFillStyle(0x552222, 0.85);
      this._orderLabel.setColor('#ff4444');
    } else {
      this._orderBg.setFillStyle(0x222244, 0.85);
      this._orderLabel.setColor('#ffffff');
    }

    this._orderLabel.setText(displayText);
  }

  /**
   * 웨이브 종료 시 오더 판정 + 보상 지급.
   * Phase 13-3: 오더 골드 보상은 무시 (재료 채집 씬에서는 골드 없음).
   * @private
   */
  _resolveOrderOnWaveClear() {
    const reward = this.orderManager.resolveOrder();
    this._updateOrderHUD();

    if (reward) {
      // 골드 보상 무시 (재료 채집 씬에서는 골드 사용 안 함)
      // 코인 보상만 저장
      if (reward.coin > 0) {
        const data = SaveManager.load();
        data.kitchenCoins = (data.kitchenCoins || 0) + reward.coin;
        if (!data.completedOrders) data.completedOrders = [];
        data.completedOrders.push(this.orderManager.currentOrder?.id || 'unknown');
        SaveManager.save(data);
      }

      const popupText = `[오더 달성!] +${reward.coin}c`;
      const popup = this.add.text(GAME_WIDTH / 2, GAME_AREA_Y + 50, popupText, {
        fontSize: '14px', color: '#ffd700', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(115);

      this.tweens.add({
        targets: popup, y: popup.y - 50, alpha: 0,
        duration: 2000,
        onComplete: () => popup.destroy(),
      });
    }
  }

  /** 재료 수거 시 오더 진행도 갱신 */
  _onIngredientCollectedForOrder() {
    this.orderManager.addProgress('collect_count');
  }

  /**
   * 재료 수거 VFX - 수거 위치에 반짝이 파티클.
   * @param {{ x: number, y: number }} data
   * @private
   */
  _onIngredientCollectedAt({ x, y }) {
    this.vfx.ingredientCollect(x, y);
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
        // Phase 11-3c: 화면 밖 적 업데이트 스킵 (y < -50 or y > 700)
        if (enemy.y < -50 || enemy.y > 700) return;
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

    // 배달 도구 자동 수거
    this._updateDeliveryTowers(delta);

    // 수프 솥 오라 버프
    this._updateSoupPotAuras(delta);

    // 셰프 스킬 쿨다운
    this._updateChefSkillCooldown(delta);

    // 내부 버프 타이머
    if (this._currentBuff && this._buffTimer > 0) {
      this._buffTimer -= delta;
      if (this._buffTimer <= 0) {
        this._onBuffExpiredInternal();
      }
    }

    // 오더 HUD 갱신
    this._updateOrderHUD();

    // Phase 11-3c: VFX 파티클 TTL 초과 자동 정리
    this.vfx?.cleanupExpiredParticles();
  }

  // ── 수프 솥 오라 버프 ──────────────────────────────────────────

  /**
   * 수프 솥 주변 타워에 공격속도 버프 적용.
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

      this.towers.getChildren().forEach(other => {
        if (!other.active || other === tower) return;
        if (other.data_.id === 'delivery' || other.data_.id === 'soup_pot') return;

        const dist = Phaser.Math.Distance.Between(tower.x, tower.y, other.x, other.y);
        if (dist <= range) {
          other.applyBuff('speed', effect);
          this.tweens.add({
            targets: other, alpha: 0.7,
            duration: 150, yoyo: true,
          });
        }
      });

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
    this.events.off('inventory_changed', this._onInventoryChanged, this);
    this.events.off('ingredient_collected_for_order', this._onIngredientCollectedForOrder, this);
    this.events.off('ingredient_collected_at', this._onIngredientCollectedAt, this);
    this.ingredientManager?.destroy();
    this.vfx?.destroy();
    this._tutorial?.end?.();
    this._hideRecallButton();

    // Phase 11-3c: 씬 전환 시 Tween/Timer 명시적 정리
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
