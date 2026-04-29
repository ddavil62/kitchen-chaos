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
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { GAME_WIDTH, GAME_HEIGHT, GRID_COLS, GRID_ROWS,
         CELL_W, CELL_H, HALF_W, HALF_H,
         HUD_HEIGHT, GAME_AREA_Y, GAME_AREA_HEIGHT, TOWER_BAR_Y, TOWER_BAR_HEIGHT,
         INGREDIENT_BAR_Y, INGREDIENT_BAR_HEIGHT, WAVE_CONTROL_Y, WAVE_CONTROL_HEIGHT,
         PATH_CELLS, isPathCell, cellToWorld, worldToCell, cellDiamond,
         buildPathCellsFromSegments, buildWaypointsFromSegments,
         STARTING_LIVES, FONT_FAMILY } from '../config.js';
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
import { StoryManager } from '../managers/StoryManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { BranchEffects } from '../managers/BranchEffects.js';
import { DailyMissionManager } from '../managers/DailyMissionManager.js';
import { AdManager } from '../managers/AdManager.js';

export class GatheringScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GatheringScene' });
  }

  /**
   * 씬 생성. 맵, HUD, 도구 바, 매니저 초기화 및 이벤트 등록.
   * @param {{ stageId?: string }} data - 스테이지 ID를 포함하는 데이터 객체
   */
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

    // ── Phase 68: P0-4 currentRun 기록 ──
    SaveManager.setCurrentRun({ stageId: this.stageId });
    // ── Phase 75B: 일일 미션 -- 장보기 진행 ──
    try { DailyMissionManager.recordProgress('gather_run', 1); } catch { /* noop */ }

    this.stagePathCells = this.stageData
      ? buildPathCellsFromSegments(this.stageData.pathSegments)
      : PATH_CELLS;
    this.stageWaypoints = this.stageData
      ? buildWaypointsFromSegments(this.stageData.pathSegments)
      : null;

    // ── 게임 상태 (골드 제거, 도구 배치 카운트 추가) ──
    // Phase 81: AD-1 광고 재도전 시 overrideLives 적용
    this.lives = (data?.overrideLives != null) ? data.overrideLives : STARTING_LIVES;
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

    /** @type {Phaser.GameObjects.Graphics[]} 이동 가능 셀 오버레이 목록 */
    this._movableOverlays = [];

    /** @type {Phaser.GameObjects.Graphics[]} 배치 가능 셀 오버레이 목록 */
    this._placeableOverlays = [];

    /** @type {Phaser.GameObjects.Graphics|null} 선택 도구 사거리 링 */
    this._rangeRingGfx = null;

    // ── 그룹 ──
    this.enemies = this.add.group();
    this.towers = this.add.group();
    this.projectiles = this.add.group();

    // ── 맵 렌더링 ──
    this._drawMap();

    // ── 매니저 ──
    this.ingredientManager = new IngredientManager(this);
    this.inventoryManager = new InventoryManager();

    // ── 쿠폰 선물 재료 소비 (Phase 54) ──
    const giftIngredients = SaveManager.consumeGiftIngredients();
    if (Object.keys(giftIngredients).length > 0) {
      this.inventoryManager.addIngredients(giftIngredients);
    }

    // 스토리 스테이지는 모든 웨이브를 단일 연속 웨이브로 병합한다
    // Phase 79: 1-1 Wave 1 튜토리얼 웨이브 적 수 오버라이드
    let storyWaves = this.stageData?.waves;
    if (this.stageId === '1-1' && storyWaves && !SaveManager.isTutorialDone('battle')) {
      storyWaves = storyWaves.map((waveDef, idx) => {
        if (idx === 0 && waveDef.tutorialWave) {
          return {
            ...waveDef,
            enemies: [{ type: 'carrot_goblin', count: 2, interval: 1500, tutorialWave: true }],
          };
        }
        return waveDef;
      });
    }
    this.waveManager = new WaveManager(this, this.enemies, {
      waves: storyWaves ? WaveManager.mergeWaves(storyWaves) : undefined,
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
    this.events.on('dark_debuff', this._onDarkDebuff, this);   // Phase 25-2: 어둠 디버프
    this.events.on('boss_debuff', this._onBossDebuff, this);
    this.events.on('stealth_back_attack', this._onStealthBackAttack, this);
    // ── Phase 21: 분열/화염 장판/화염 브레스 이벤트 ──
    this.events.on('enemy_deterministic_split', this._onDeterministicSplit, this);
    this.events.on('enemy_fire_zone', this._onEnemyFireZone, this);
    this.events.on('dragon_fire_breath', this._onDragonFireBreath, this);
    // Phase 38-1: 3페이즈 보스 페이즈 전환 이벤트 (queen_of_taste)
    this.events.on('boss_phase_changed', this._onBossPhaseChanged, this);
    // Phase 46: 돌진 충격 이벤트 (burrito_juggernaut)
    this.events.on('enemy_charge_impact', this._onEnemyChargeImpact, this);
    /** @type {Array<{gfx: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, debuffDuration: number, timer: Phaser.Time.TimerEvent}>} */
    this._fireZones = [];

    // ── 재료 수거 시 인벤토리에 누적 ──
    this.events.on('inventory_changed', this._onInventoryChanged, this);

    // ── 오더 추적용 씬 이벤트 ──
    this.events.on('ingredient_collected_for_order', this._onIngredientCollectedForOrder, this);

    // ── VFX용 재료 수거 위치 이벤트 (Phase 10-5) ──
    this.events.on('ingredient_collected_at', this._onIngredientCollectedAt, this);

    // ── 웨이브 시작 버튼 ──
    this._createWaveButton();

    // ── 튜토리얼 (Phase 79: 화살표 + 하이라이트 오버레이 방식으로 전환) ──
    {
      // 타깃 좌표 계산
      const towers = this.stageData?.availableTowers || [];
      const towerBtnW = towers.length > 0 ? GAME_WIDTH / towers.length : GAME_WIDTH;
      const towerBarFirstBtnX = towerBtnW / 2;
      const towerBarBtnY = TOWER_BAR_Y + 16 + 17; // 버튼 영역 중심 (_renderTowerButtons 기준)

      const SAFE_CELLS_11 = [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 2, row: 0 }];
      const firstSafe = SAFE_CELLS_11[0];
      const firstCellPos = cellToWorld(firstSafe.col, firstSafe.row);

      const waveBtnX = GAME_WIDTH / 2;
      const waveBtnY = WAVE_CONTROL_Y + WAVE_CONTROL_HEIGHT / 2;

      this._tutorial = new TutorialManager(this, 'battle', [
        '1/3 하단 도구 바에서\n도구를 선택하세요!',
        '2/3 경로 옆 빈 칸에\n도구를 배치하세요!',
        '3/3 준비되면\n웨이브 시작 버튼을 탭!',
      ], [
        { x: towerBarFirstBtnX, y: towerBarBtnY, w: towerBtnW, h: TOWER_BAR_HEIGHT - 26, color: 0x00ff88 },
        { x: firstCellPos.x, y: firstCellPos.y, w: CELL_W, h: CELL_H, color: 0x00ff88 },
        { x: waveBtnX, y: waveBtnY, w: 160, h: 44, color: 0xffdd00 },
      ]);
      this._tutorial.start();
    }

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── 대화 트리거 (Phase 14-3: StoryManager 중앙화) ──
    StoryManager.checkTriggers(this, 'gathering_enter', { stageId: this.stageId });

    // ── Phase 70: 튜토리얼 스테이지 도구 자동 지급 ──
    this._checkAutoToolGrant();

    // ── DEV 전용 치트 핸들러 등록 (Phase 54) ──
    if (import.meta.env.DEV) {
      const scene = this;
      window.__kcCheat = {
        /** 모든 적 즉사 처리 */
        bossDie: () => {
          const enemies = scene.enemies.getChildren().filter(e => e.active);
          enemies.forEach(enemy => {
            if (enemy.takeDamage) {
              enemy.takeDamage(enemy.hp + 9999);
            }
          });
        },
        /** 웨이브 강제 완료 처리 */
        waveEnd: () => {
          if (scene.waveManager) {
            // 모든 적 제거
            const enemies = scene.enemies.getChildren().filter(e => e.active);
            enemies.forEach(enemy => {
              if (enemy.takeDamage) {
                enemy.takeDamage(enemy.hp + 9999);
              }
            });
            // 웨이브 완료 플래그
            scene.waveManager.isAllWavesComplete = true;
            scene._checkWaveProgress();
          }
        },
      };
    }

    // 씬 종료 시 정리
    this.events.once('shutdown', this.shutdown, this);
  }

  // ── Phase 70: 튜토리얼 자동 도구 지급 ──────────────────────────

  /**
   * 튜토리얼 스테이지(1-1~1-3) 진입 시 도구가 0개이면 프라이팬을 자동 지급·배치한다.
   * storyFlags.tutorial_auto_tools_shown 플래그로 중복 지급을 방지한다.
   * @private
   */
  _checkAutoToolGrant() {
    const TUTORIAL_STAGES = ['1-1', '1-2', '1-3'];
    if (!TUTORIAL_STAGES.includes(this.stageId)) return;

    // 중복 지급 방지
    const data = SaveManager.load();
    const flags = data.storyProgress?.storyFlags;
    if (flags && flags.tutorial_auto_tools_shown === true) return;

    // 이미 도구를 보유하고 있으면 지급 불필요
    if (ToolManager.hasAnyTool()) return;

    // 프라이팬 1개 무료 지급
    ToolManager.grantTool('pan');

    // 스테이지별 안전 셀 후보 (경로 인접 비경로 셀)
    const SAFE_CELLS = {
      '1-1': [{ col: 0, row: 0 }, { col: 0, row: 1 }, { col: 2, row: 0 }],
      '1-2': [{ col: 1, row: 0 }, { col: 3, row: 0 }, { col: 0, row: 0 }],
      '1-3': [{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 3, row: 0 }],
    };
    const candidates = SAFE_CELLS[this.stageId] || [];
    const cell = candidates.find(c =>
      !this.stagePathCells.has(`${c.col},${c.row}`) &&
      !this.towers.getChildren().some(t => t._cellKey === `${c.col},${c.row}`)
    );
    if (cell) {
      this._placeTower(cell.col, cell.row, 'pan');
    }

    // storyFlags에 플래그 기록 (동적 추가, v24 유지)
    const saveData = SaveManager.load();
    if (!saveData.storyProgress) saveData.storyProgress = {};
    if (!saveData.storyProgress.storyFlags || Array.isArray(saveData.storyProgress.storyFlags)) {
      saveData.storyProgress.storyFlags = {};
    }
    saveData.storyProgress.storyFlags.tutorial_auto_tools_shown = true;
    SaveManager.save(saveData);

    // 알림 표시
    this._showAutoToolNotice();
  }

  /**
   * 자동 도구 지급 알림을 HUD 상단에 2초간 표시한다.
   * @private
   */
  _showAutoToolNotice() {
    const noticeText = this.add.text(GAME_WIDTH / 2, HUD_HEIGHT / 2,
      '도구가 없어 프라이팬을 지급했습니다!', {
        fontSize: '14px', color: '#ffcc44',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9000);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: noticeText,
        alpha: 0,
        duration: 400,
        onComplete: () => noticeText.destroy(),
      });
    });
  }

  // ── 아이소메트릭 맵 그리기 ─────────────────────────────────────

  /**
   * 아이소메트릭 다이아몬드 그리드를 렌더링한다.
   * 경로 셀은 갈색, 비경로 셀은 초록색으로 표시.
   * @private
   */
  _drawMap() {
    const gfx = this.add.graphics();
    gfx.setDepth(1);  // Phase 71: 배경 rect(depth=0) 위에 확실히 렌더
    const cols = this.stageData?.gridCols || GRID_COLS;
    const rows = this.stageData?.gridRows || GRID_ROWS;

    // Phase 63 FIX-13: 플랫 컬러 → 체커 패턴 + 명도 변주로 디테일 강화.
    // Phase 71: 색상 대비 강화 — 경로 0xd4b078/0xaa8040(명도차 36), 비경로 0x2d5a1b/0x1a3510(명도차 19)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const d = cellDiamond(col, row);
        const onPath = this.stagePathCells.has(`${col},${row}`);
        const isCheckerAlt = ((col + row) & 1) === 1;

        let fillColor;
        if (onPath) {
          fillColor = isCheckerAlt ? 0xaa8040 : 0xd4b078;
        } else {
          fillColor = isCheckerAlt ? 0x1a3510 : 0x2d5a1b;
        }
        gfx.fillStyle(fillColor);
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

  /**
   * 상단 HUD (도구 수량, 웨이브, 생명, 콤보) 생성.
   * @private
   */
  _createHUD() {
    // Phase 60-4: primitive rectangle → nineslice panel_dark (나무결 HUD 배경) + divider_h.
    const hudBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, 'dark');
    hudBg.setDepth(1000).setScrollFactor(0);
    const hudDivider = NineSliceFactory.dividerH(this, GAME_WIDTH / 2, HUD_HEIGHT, GAME_WIDTH, 2);
    hudDivider.setDepth(1000).setScrollFactor(0);
    hudDivider.setAlpha(0.9);

    this.waveText = this.add.text(GAME_WIDTH / 2, 10, '\uC6E8\uC774\uBE0C 0/8', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(1001).setScrollFactor(0);

    this.livesText = this.add.text(GAME_WIDTH - 10, 10, `\u2764\uFE0F ${this.lives}`, {
      fontSize: '14px', color: '#ff4444',
    }).setOrigin(1, 0).setDepth(1001).setScrollFactor(0);

    this.comboText = this.add.text(GAME_WIDTH / 2, 26, '', {
      fontSize: '11px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(1001).setScrollFactor(0);

    // 메뉴(나가기) 버튼 — HUD 좌측 상단
    // Phase 60-5: primitive rect → NineSliceFactory.button(icon 변형).
    // 크기 28×26 → 36×32 (btn_icon insets 14×14에 맞춰 확장, HUD_HEIGHT=40 내 수용).
    this._menuBtn = NineSliceFactory.button(
      this, 22, HUD_HEIGHT / 2, 36, 32,
      '≡',
      {
        variant: 'icon',
        onClick: () => this._showMenuPopup(),
        textStyle: { fontSize: '18px', color: '#ffffff' },
      }
    );
    this._menuBtn.setDepth(1001).setScrollFactor(0);

    // ── 배속 토글 버튼 (Phase 77) ──
    // 위치: HUD 우측, livesText(x=GAME_WIDTH-10) 왼쪽에 배치
    // x = GAME_WIDTH - 72 = 288 (livesText와 6px 이상 간격 확보, AD 모드3 수정)
    this._speedMultiplier = 1;
    this._speedBtn = NineSliceFactory.button(
      this, GAME_WIDTH - 72, HUD_HEIGHT / 2, 36, 32,
      '1\u00d7',
      {
        variant: 'icon',
        onClick: () => this._toggleSpeed(),
        textStyle: { fontSize: '13px', color: '#ffcc00', fontStyle: 'bold' },
      }
    );
    this._speedBtn.setDepth(1001).setScrollFactor(0);
  }

  /**
   * HUD 텍스트 갱신.
   * 골드 대신 배치된 도구 수 / 보유 도구 수를 표시한다.
   */
  _updateHUD() {
    this.livesText.setText(`\u2764\uFE0F ${this.lives}`);
  }

  /**
   * 웨이브 배속을 1× / 2×로 토글한다.
   * 적 이동이 delta 기반(_moveAlongPath)이므로 this.time.timeScale만으로 배속 제어.
   * @private
   */
  _toggleSpeed() {
    if (this._speedMultiplier === 1) {
      // 1x -> 2x 전환: 리워드 광고 시청 후 적용
      if (!AdManager.isAdReady()) {
        // 광고 미준비 시 버튼 일시 비활성화 후 복귀
        this._speedBtn?.setAlpha(0.5);
        this.time.delayedCall(1500, () => this._speedBtn?.setAlpha(1));
        return;
      }
      AdManager.showRewardedAd(
        () => {
          // 광고 시청 완료 후 2x 적용
          this._speedMultiplier = 2;
          this.time.timeScale = 2;
          this._speedBtn?.setLabel('2\u00d7');
        },
        () => {
          // 광고 실패/취소 — 아무 변경 없음
        }
      );
    } else {
      // 2x -> 1x 전환: 즉시 토글 (광고 없음)
      this._speedMultiplier = 1;
      this.time.timeScale = 1;
      this._speedBtn?.setLabel('1\u00d7');
    }
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
    const BTN_W = 36;
    const BTN_H = 32;

    // 아이콘 배경 (9-slice, Phase 60-6): 셰프 색상을 tint로 적용
    this._skillBtnBg = NineSliceFactory.raw(this, btnX, btnY + 10, BTN_W, BTN_H, 'btn_icon_normal');
    this._skillBtnBg.setDepth(1001).setScrollFactor(0);
    this._skillBtnBg.setTint(this._chefData.color);
    // Container 기본 hitArea 미설정 → 명시적 Rectangle(useHandCursor: true)
    this._skillBtnHitArea = new Phaser.Geom.Rectangle(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H);
    this._skillBtnBg.setInteractive(this._skillBtnHitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    // setInteractive(hitArea, cb, opts) 시그니처가 useHandCursor 옵션을 안 받는 환경 대비
    if (this._skillBtnBg.input) this._skillBtnBg.input.cursor = 'pointer';
    // hover 핸들러는 아래 Phase 60-6 블록에서 texture-swap 방식으로 등록됨 — 여기서 재등록 불필요

    // 셰프 아이콘
    this._skillBtnIcon = this.add.text(btnX, btnY + 6, this._chefData.icon, {
      fontSize: '14px',
    }).setOrigin(0.5).setDepth(1002).setScrollFactor(0);

    // 쿨다운 오버레이 (어둡게) — 버튼 크기와 동기화
    this._skillCooldownOverlay = this.add.rectangle(btnX, btnY + 10, BTN_W, BTN_H, 0x000000, 0.6)
      .setDepth(1003).setVisible(false).setScrollFactor(0);

    // 쿨다운 텍스트
    this._skillCooldownText = this.add.text(btnX, btnY + 14, '', {
      fontSize: '10px', color: '#ff8888', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1004).setVisible(false).setScrollFactor(0);

    // 클릭 이벤트 (pointerdown — 쿨다운 중엔 removeInteractive로 원천 차단)
    this._skillBtnBg.on('pointerdown', () => {
      if (this.isGameOver || this.isVictory) return;
      if (!this._skillReady) return;
      this._activateChefSkill();
    });

    // Hover: PRESSED 텍스처로 스왑 (기존 setFillStyle 대체)
    this._skillBtnBg.on('pointerover', () => {
      if (this._skillReady) this._skillBtnBg.setTexture(NS_KEYS.BTN_ICON_PRESSED);
    });
    this._skillBtnBg.on('pointerout', () => {
      this._skillBtnBg.setTexture(NS_KEYS.BTN_ICON_NORMAL);
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
    } else if (type === 'cryo_execute') {
      // 유키: 빙결된 적 전부 즉시 처치
      let killCount = 0;
      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy.isDead) return;
        if (enemy.isFrozen) {
          enemy.takeDamage(enemy.maxHp * 999);
          killCount++;
        }
      });
      const msg = killCount > 0
        ? `${this._chefData.skillName}!\n빙결 적 ${killCount}마리 처치!`
        : `${this._chefData.skillName}!\n빙결된 적이 없습니다`;
      this._showMessage(msg, 1500);
    } else if (type === 'power_surge') {
      // 라오: 전 도구 5초간 공격력 2배
      const val = this._chefData.skillValue;
      ChefManager.activatePowerSurge(val.multiplier, val.duration);
      this._showMessage(`${this._chefData.skillName}!\n${val.duration / 1000}초간 공격력 2배!`, 1500);
    }

    // 쿨다운 시작 (버튼 비활성화로 원천 차단)
    this._skillReady = false;
    this._skillBtnBg.removeInteractive();
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

    // 웨이브 대기 중에는 쿨다운 회복 금지 (꼼수 방지)
    if (!this.waveManager?.isActive) return;

    this._skillCooldownTimer -= delta;
    if (this._skillCooldownTimer <= 0) {
      this._skillReady = true;
      this._skillCooldownTimer = 0;
      this._skillCooldownOverlay.setVisible(false);
      this._skillCooldownText.setVisible(false);
      // 버튼 인터랙션 복원 (Container용: 저장해둔 hitArea 재사용)
      this._skillBtnBg.setInteractive(this._skillBtnHitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      if (this._skillBtnBg.input) this._skillBtnBg.input.cursor = 'pointer';

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

  /**
   * 도구 선택 바 (480~540px 영역) 전체를 생성한다.
   * 배경, 카테고리 탭, 도구 버튼을 순차 렌더링.
   * @private
   */
  _createTowerBar() {
    this._renderTowerBarBackground();
    this._renderTowerTabs();
    this._renderTowerButtons();
  }

  /**
   * 도구 바 배경 렌더링 (1회 호출).
   * @private
   */
  _renderTowerBarBackground() {
    // Phase 60-12: 도구 바 배경 rect → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(
      this, GAME_WIDTH / 2, TOWER_BAR_Y + TOWER_BAR_HEIGHT / 2,
      GAME_WIDTH, TOWER_BAR_HEIGHT, 'dark'
    ).setDepth(1000).setScrollFactor(0);
  }

  /**
   * 공격/지원/버프 카테고리 탭 버튼 생성 (1회 호출).
   * @private
   */
  _renderTowerTabs() {
    const categories = [
      { id: 'attack', label: '공격' },
      { id: 'support', label: '지원' },
      { id: 'buff', label: '버프' },
    ];
    const tabY = TOWER_BAR_Y + 8;

    categories.forEach((cat, i) => {
      const cx = 30 + i * 50;
      // Phase 60-20: rect → NineSliceFactory.tab (active/inactive 텍스처 스왑)
      const tab = NineSliceFactory.tab(this, cx, tabY, 46, 14, cat.label, {
        active: cat.id === this._activeTowerCategory,
        textStyle: { fontSize: '10px', color: '#ffffff' },
      });
      tab.setDepth(1001).setScrollFactor(0);
      tab.setInteractive(
        new Phaser.Geom.Rectangle(-23, -7, 46, 14),
        Phaser.Geom.Rectangle.Contains,
        { useHandCursor: true },
      );
      // Phase 93: 카테고리 탭 hover 피드백
      tab.on('pointerover', () => tab.setTint(0xddddff));
      tab.on('pointerout', () => tab.clearTint());

      tab.on('pointerdown', () => {
        if (this._activeTowerCategory === cat.id) return;
        this._activeTowerCategory = cat.id;
        this.selectedTowerType = null;
        this._renderTowerButtons();
        this._updateTabHighlight();
      });

      this._towerTabObjects.push({ bg: tab, label: tab._label, category: cat.id });
    });
  }

  /**
   * 카테고리 탭 활성화 색상 갱신.
   * @private
   */
  _updateTabHighlight() {
    // Phase 60-20: setFillStyle → NineSliceFactory.tab setActive (텍스처 스왑)
    this._towerTabObjects.forEach(tab => {
      tab.bg.setActive(tab.category === this._activeTowerCategory);
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

    // Phase 69 (P1-5): 도구 0개 빈 상태 UI.
    // 디렉터 플레이테스트에서 "탭을 눌러도 침묵" 이슈가 보고되어 빈 상태 안내 추가.
    // 행상인 바로가기 버튼은 라운드 포기 모달 필요 → 후속 페이즈로 분리.
    if (toolIds.length === 0) {
      this._renderEmptyToolState();
      return;
    }

    const btnWidth = GAME_WIDTH / toolIds.length;
    const btnY = TOWER_BAR_Y + 16 + 17; // 버튼 영역 중심

    toolIds.forEach((id, i) => {
      const def = TOOL_DEFS[id];
      const owned = inventory[id]?.count || 0;
      const deployed = this.deployedCounts[id] || 0;
      const available = owned - deployed;
      const cx = btnWidth * i + btnWidth / 2;

      // Phase 60-20: rect → NineSliceFactory.raw btn_secondary_normal + setTint
      const baseTint = available > 0 ? 0x333355 : 0x222233;
      const bg = NineSliceFactory.raw(this, cx, btnY, btnWidth - 4, 30, 'btn_secondary_normal')
        .setDepth(1001).setTint(baseTint);
      bg.setInteractive(
        new Phaser.Geom.Rectangle(-(btnWidth - 4) / 2, -15, btnWidth - 4, 30),
        Phaser.Geom.Rectangle.Contains,
        { useHandCursor: true },
      );
      // Phase 93: 도구 버튼 hover 피드백
      bg.on('pointerover', () => bg.setTint(0xccccff));
      bg.on('pointerout', () => bg.setTint(baseTint));

      const name = this.add.text(cx, btnY - 5, def.nameKo, {
        fontSize: '11px', color: available > 0 ? '#ffffff' : '#666666',
      }).setOrigin(0.5).setDepth(1002);

      // 잔여 수량 표시: "×2" 형태
      const countLabel = this.add.text(cx, btnY + 8, `\u00D7${available}`, {
        fontSize: '10px', color: available > 0 ? '#88ccff' : '#555555',
      }).setOrigin(0.5).setDepth(1002);

      bg.on('pointerdown', () => {
        if (available <= 0) {
          this._showMessage('남은 수량 없음', 800);
          return;
        }
        this._deselectTower(); // 재배치 모드 해제 + _hideMoveOverlay 내부 호출
        this.selectedTowerType = this.selectedTowerType === id ? null : id;
        this._updateTowerBarSelection();
        // 배치 가능 오버레이 갱신
        if (this.selectedTowerType) {
          this._showPlaceableOverlay();
        } else {
          this._hidePlaceableOverlay();
        }
        // 튜토리얼 1단계: 도구 선택 완료
        if (this._tutorial?.isActive() && this.selectedTowerType) this._tutorial.advance();
      });

      // 컨테이너로 묶어 한 번에 destroy 가능
      const container = this.add.container(0, 0, [bg, name, countLabel]).setDepth(1000).setScrollFactor(0, 0, true);
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

      // Phase 60-20: rect → NineSliceFactory.raw btn_secondary_normal + setTint
      const buffBaseTint = canCraft ? 0x335533 : 0x333333;
      const bg = NineSliceFactory.raw(this, cx, btnY, btnWidth - 4, 30, 'btn_secondary_normal')
        .setDepth(1001).setTint(buffBaseTint);
      bg.setInteractive(
        new Phaser.Geom.Rectangle(-(btnWidth - 4) / 2, -15, btnWidth - 4, 30),
        Phaser.Geom.Rectangle.Contains,
        { useHandCursor: true },
      );
      // Phase 93: 버프 버튼 hover 피드백
      bg.on('pointerover', () => bg.setTint(0xccccff));
      bg.on('pointerout', () => bg.setTint(buffBaseTint));

      const name = this.add.text(cx, btnY - 5, recipe.nameKo, {
        fontSize: '10px', color: canCraft ? '#88ff88' : '#666666',
      }).setOrigin(0.5).setDepth(1002);

      // 재료 요약
      const ingText = Object.entries(recipe.ingredients)
        .map(([id, n]) => `${INGREDIENT_TYPES[id]?.icon || id}${n}`)
        .join(' ');
      const ingLabel = this.add.text(cx, btnY + 8, ingText, {
        fontSize: '9px', color: canCraft ? '#ffd700' : '#555555',
      }).setOrigin(0.5).setDepth(1002);

      bg.on('pointerdown', () => {
        if (this.isGameOver || this.isVictory) return;
        this._activateBuffRecipe(recipe);
      });

      const container = this.add.container(0, 0, [bg, name, ingLabel]).setDepth(1000).setScrollFactor(0, 0, true);
      this._towerBarButtons.push({ container, bg, id: recipe.id });
    });
  }

  /**
   * Phase 69 (P1-5): 현재 카테고리에 보유 도구가 0개일 때 빈 상태 안내 렌더링.
   * 이전에는 탭을 눌러도 아무 반응이 없어 "깨진 느낌"을 주었다.
   * 행상인 방문 시 구매 가능하다는 가이드 텍스트를 표시한다.
   * @private
   */
  _renderEmptyToolState() {
    const cx = GAME_WIDTH / 2;
    const primaryY = TOWER_BAR_Y + 24;
    const secondaryY = TOWER_BAR_Y + 42;

    const primary = this.add.text(cx, primaryY, '도구를 행상인에서 구매하세요', {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#ffd700',
    }).setOrigin(0.5).setDepth(1002).setScrollFactor(0);

    const secondary = this.add.text(cx, secondaryY, '라운드 종료 후 행상인이 방문합니다', {
      fontFamily: FONT_FAMILY,
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(1002).setScrollFactor(0);

    // 재렌더링 시 destroy될 수 있도록 _towerBarButtons에 등록.
    const container = this.add.container(0, 0, [primary, secondary]).setDepth(1000).setScrollFactor(0, 0, true);
    this._towerBarButtons.push({ container, bg: null, id: '_empty' });
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

  /**
   * 도구 바 버튼의 선택 상태 하이라이트를 갱신한다.
   * @private
   */
  _updateTowerBarSelection() {
    // Phase 60-20: setFillStyle → setTint (NineSlice Container)
    this._towerBarButtons.forEach(btn => {
      // Phase 69 (P1-5): 빈 상태 placeholder는 bg 없음 → 스킵.
      if (!btn.bg) return;

      const inventory = ToolManager.getToolInventory();
      const owned = inventory[btn.id]?.count || 0;
      const deployed = this.deployedCounts[btn.id] || 0;
      const available = owned - deployed;

      if (btn.id === this.selectedTowerType) {
        btn.bg.setTint(0x885500);
      } else {
        btn.bg.setTint(available > 0 ? 0x333355 : 0x222233);
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
    // Phase 60-12: 재료 수집 바 배경 rect → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(
      this, GAME_WIDTH / 2, INGREDIENT_BAR_Y + INGREDIENT_BAR_HEIGHT / 2,
      GAME_WIDTH, INGREDIENT_BAR_HEIGHT, 'dark'
    ).setDepth(1000).setScrollFactor(0);

    // 타이틀
    this._ingredientBarTitle = this.add.text(10, INGREDIENT_BAR_Y + 4, '수집 현황:', {
      fontSize: '10px', color: '#aaaaaa',
    }).setDepth(1001).setScrollFactor(0);

    // 재료 아이콘+수량 텍스트 (동적 갱신)
    this._ingredientBarTexts = [];
    const ingredientIds = Object.keys(INGREDIENT_TYPES);
    const perRow = 5;
    const slotW = (GAME_WIDTH - 20) / perRow;

    ingredientIds.forEach((id, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = 15 + col * slotW;
      const y = INGREDIENT_BAR_Y + 18 + row * 18;

      // Phase 90-B (B-3): 아이콘 크기 상향 (11px → 14px, 식별성 개선)
      const text = this.add.text(x, y, `${INGREDIENT_TYPES[id].icon}0`, {
        fontSize: '14px', color: '#888888',
      }).setDepth(1001).setScrollFactor(0);

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

  /**
   * 아이소메트릭 히트박스 기반 입력 핸들러 설정.
   * @private
   */
  _setupInput() {
    // ── 카메라 경계 설정 (2x 타일: 맵이 화면보다 크므로 패닝 허용) ──
    // 맵 범위: x [-300, 612], y [71, 755] (ORIGIN_X=180, ORIGIN_Y=107, HALF_W=48, HALF_H=36)
    // scrollY 최대 = 755 - 480 = 275 → height = 275 + 640 = 915
    this.cameras.main.setBounds(-300, 0, 916, 915);

    // 두 번째 터치 포인터 활성화 (핀치 줌용)
    this.input.addPointer(1);

    // 맵 영역 전체를 덮는 투명 히트 영역 (화면 고정 — SF=0)
    const hitArea = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_AREA_Y + GAME_AREA_HEIGHT / 2,
      GAME_WIDTH,
      GAME_AREA_HEIGHT,
      0x000000, 0
    ).setInteractive().setDepth(2).setScrollFactor(0);

    // ── 드래그 vs 탭 감지 ──
    let dragStartX = 0, dragStartY = 0;
    let lastPointerX = 0, lastPointerY = 0;
    const DRAG_THRESHOLD = 5;
    this._mapDragActive = false;
    this._mapIsDragging = false;

    // ── 핀치 줌 상태 ──
    // 두 손가락 거리 변화량 기반 카메라 줌. 줌 범위 [0.6, 2.0].
    // 맵 영역 핀치일 때만 활성화되어 HUD 영역 제스처와 충돌 방지.
    const MIN_ZOOM = 0.6;
    const MAX_ZOOM = 2.0;
    let pinchActive = false;
    let pinchStartDist = 0;
    let pinchStartZoom = 1;
    this._mapZoom = this.cameras.main.zoom;

    hitArea.on('pointerdown', (pointer) => {
      dragStartX = pointer.x;
      dragStartY = pointer.y;
      lastPointerX = pointer.x;
      lastPointerY = pointer.y;
      this._mapDragActive = true;
      this._mapIsDragging = false;
    });

    this.input.on('pointermove', (pointer) => {
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;

      // ── 2-포인터: 핀치 줌 ──
      if (p1 && p2 && p1.isDown && p2.isDown) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!pinchActive) {
          pinchActive = true;
          pinchStartDist = dist;
          pinchStartZoom = this.cameras.main.zoom;
          // 핀치 시작 시 진행 중이던 드래그/탭 중단
          this._mapDragActive = false;
          this._mapIsDragging = false;
        }
        if (pinchStartDist > 0) {
          const ratio = dist / pinchStartDist;
          const newZoom = Phaser.Math.Clamp(
            pinchStartZoom * ratio, MIN_ZOOM, MAX_ZOOM
          );
          this.cameras.main.setZoom(newZoom);
          this._mapZoom = newZoom;
        }
        return;
      }
      // 두 번째 포인터가 떨어지면 핀치 종료 (다음 프레임부터 드래그 재개 가능)
      if (pinchActive) {
        pinchActive = false;
        return;
      }

      // ── 1-포인터: 드래그 ──
      if (!pointer.isDown || !this._mapDragActive) return;
      const dx = pointer.x - dragStartX;
      const dy = pointer.y - dragStartY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        this._mapIsDragging = true;
      }
      if (this._mapIsDragging) {
        // 줌 반영: 스크린 픽셀 delta를 월드 좌표 delta로 환산.
        const z = this.cameras.main.zoom || 1;
        this.cameras.main.scrollX -= (pointer.x - lastPointerX) / z;
        this.cameras.main.scrollY -= (pointer.y - lastPointerY) / z;
      }
      lastPointerX = pointer.x;
      lastPointerY = pointer.y;
    });

    hitArea.on('pointerup', (pointer) => {
      this._mapDragActive = false;
      if (this._mapIsDragging) {
        this._mapIsDragging = false;
        return;
      }
      if (this.isGameOver || this.isVictory) return;
      // 핀치 종료 직후의 pointerup은 탭으로 처리하지 않음
      if (pinchActive) return;
      // worldX/worldY: 카메라 스크롤이 반영된 월드 좌표
      const { col, row } = worldToCell(pointer.worldX, pointer.worldY);
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
      return; // 경로 셀 — 조용히 무시 (적 클릭 오해 방지)
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

    // ── Phase 58-3: 변이(Mutation) 시각 + 스탯 오버라이드 ──
    this._applyMutationToTower(tower, typeId);

    // 타워 클릭은 hitArea(worldToCell)로 처리 — 별도 setInteractive 불필요

    // 현재 버프 적용
    if (this._currentBuff) {
      this._applyBuffToTower(tower, this._currentBuff);
    }

    // 배치 카운트 증가 (골드 차감 대신)
    this.deployedCounts[typeId] = (this.deployedCounts[typeId] || 0) + 1;
    this._updateHUD();
    // 팔레트 갱신 (잔여 수량 업데이트)
    this._renderTowerButtons();

    // 잔여 수량 소진 시 배치 모드 자동 해제
    if (this._getAvailableCount(typeId) <= 0) {
      this.selectedTowerType = null;
      this._updateTowerBarSelection();
      this._hidePlaceableOverlay();
    } else {
      // 셀 하나 배치됐으므로 점유 상태 반영하여 오버레이 재계산
      if (this.selectedTowerType) {
        this._showPlaceableOverlay();
      }
    }

    this.tweens.add({
      targets: tower,
      scaleX: 1.2, scaleY: 1.2,
      duration: 150, yoyo: true,
    });

    // 튜토리얼 2단계: 도구 배치 완료
    if (this._tutorial?.isActive()) {
      this._tutorial.advance();
      // Phase 16-1: 도구 배치 튜토리얼 대사 트리거
      StoryManager.checkTriggers(this, 'tutorial_tool_placed');
    }
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
   * 타워 선택 (노란 테두리 + 이동/회수 버튼 + 이동 가능 셀 하이라이트).
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
    this._showTowerActionPanel(tower);
    this._showMoveOverlay(tower);
    this._showRangeRing(tower);
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
    this._hideTowerActionPanel();
    this._hideMoveOverlay();
    this._hidePlaceableOverlay();
    this._hideRangeRing();
  }

  /**
   * 이동/회수 액션 패널 표시 (이동 버튼 + 회수 버튼).
   * @param {Tower} tower
   * @private
   */
  _showTowerActionPanel(tower) {
    this._hideTowerActionPanel();
    const cx = tower.x;
    const btnY = tower.y - 34;
    const btnW = 48;
    const gap = 4;

    // Phase 60-20: rect → NineSliceFactory.raw btn_primary/danger + setTint
    // [이동] 버튼 (파랑)
    this._moveBg = NineSliceFactory.raw(this, cx - btnW / 2 - gap / 2, btnY, btnW, 22, 'btn_primary_normal')
      .setDepth(2000).setTint(0x2255aa).setAlpha(0.92);
    this._moveBg.setInteractive(
      new Phaser.Geom.Rectangle(-btnW / 2, -11, btnW, 22),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true },
    );
    // Phase 93: 이동 버튼 hover 피드백
    this._moveBg.on('pointerover', () => this._moveBg.setTint(0x3366bb));
    this._moveBg.on('pointerout', () => this._moveBg.setTint(0x2255aa));
    this._moveLabel = this.add.text(cx - btnW / 2 - gap / 2, btnY, '이동', {
      fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2001);

    // [회수] 버튼 (빨강)
    this._recallBg = NineSliceFactory.raw(this, cx + btnW / 2 + gap / 2, btnY, btnW, 22, 'btn_danger_normal')
      .setDepth(2000).setTint(0xaa3333).setAlpha(0.92);
    this._recallBg.setInteractive(
      new Phaser.Geom.Rectangle(-btnW / 2, -11, btnW, 22),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true },
    );
    // Phase 93: 회수 버튼 hover 피드백
    this._recallBg.on('pointerover', () => this._recallBg.setTint(0xbb4444));
    this._recallBg.on('pointerout', () => this._recallBg.setTint(0xaa3333));
    this._recallLabel = this.add.text(cx + btnW / 2 + gap / 2, btnY, '회수', {
      fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2001);

    // 이동 버튼: 빈 셀 탭 안내 토글 (오버레이는 이미 표시 중이므로 별도 처리 불필요)
    this._moveBg.on('pointerdown', () => {
      // 이미 이동 모드 — 사용자에게 힌트만 표시
      this._showMessage('빈 셀을 탭하여 이동', 1200);
    });

    this._recallBg.on('pointerdown', () => {
      this._recallTower(this._selectedTower);
    });
  }

  /**
   * 이동/회수 액션 패널 숨김.
   * @private
   */
  _hideTowerActionPanel() {
    if (this._moveBg) { this._moveBg.destroy(); this._moveBg = null; }
    if (this._moveLabel) { this._moveLabel.destroy(); this._moveLabel = null; }
    if (this._recallBg) { this._recallBg.destroy(); this._recallBg = null; }
    if (this._recallLabel) { this._recallLabel.destroy(); this._recallLabel = null; }
  }

  /**
   * 선택된 타워의 사거리 링(반투명 원)을 화면에 표시한다.
   * @param {Tower} tower
   * @private
   */
  _showRangeRing(tower) {
    this._hideRangeRing();
    const radius = (tower.range || tower.data_?.range || 0) * (tower.rangeMultiplier || 1);
    if (radius <= 0) return;

    this._rangeRingGfx = this.add.graphics().setDepth(4);
    this._rangeRingGfx.lineStyle(1.5, 0x88ffcc, 0.55);
    this._rangeRingGfx.strokeCircle(tower.x, tower.y, radius);
    this._rangeRingGfx.fillStyle(0x44ff88, 0.06);
    this._rangeRingGfx.fillCircle(tower.x, tower.y, radius);
  }

  /**
   * 사거리 링 제거.
   * @private
   */
  _hideRangeRing() {
    if (this._rangeRingGfx) {
      this._rangeRingGfx.destroy();
      this._rangeRingGfx = null;
    }
  }

  /**
   * 팔레트 도구 선택 시 배치 가능한 셀(비경로·비점유)에
   * 초록 다이아몬드 오버레이를 표시한다.
   * @private
   */
  _showPlaceableOverlay() {
    this._hidePlaceableOverlay();
    const cols = this.stageData?.gridCols || GRID_COLS;
    const rows = this.stageData?.gridRows || GRID_ROWS;
    const occupiedKeys = new Set(this.towers.getChildren().map(t => t._cellKey));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${col},${row}`;
        if (this.stagePathCells.has(key)) continue;   // 경로 셀 제외
        if (occupiedKeys.has(key)) continue;           // 점유 셀 제외

        const d = cellDiamond(col, row);
        const gfx = this.add.graphics().setDepth(5);
        gfx.fillStyle(0x44ff88, 0.20);
        gfx.fillPoints([d.top, d.right, d.bottom, d.left], true);
        gfx.lineStyle(1, 0x44ff88, 0.55);
        gfx.strokePoints([d.top, d.right, d.bottom, d.left], true);
        this._placeableOverlays.push(gfx);
      }
    }
  }

  /**
   * 배치 가능 셀 오버레이 전체 제거.
   * @private
   */
  _hidePlaceableOverlay() {
    for (const gfx of this._placeableOverlays) {
      gfx.destroy();
    }
    this._placeableOverlays = [];
  }

  /**
   * 이동 가능한 빈 셀에 초록 다이아몬드 오버레이 표시.
   * @param {Tower} tower - 현재 선택된 타워 (현재 위치 제외용)
   * @private
   */
  _showMoveOverlay(tower) {
    this._hideMoveOverlay();
    const cols = this.stageData?.gridCols || GRID_COLS;
    const rows = this.stageData?.gridRows || GRID_ROWS;
    const occupiedKeys = new Set(this.towers.getChildren().map(t => t._cellKey));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${col},${row}`;
        // 현재 타워 위치·경로·다른 타워 위치 제외
        if (key === tower._cellKey) continue;
        if (this.stagePathCells.has(key)) continue;
        if (occupiedKeys.has(key)) continue;

        const d = cellDiamond(col, row);
        const gfx = this.add.graphics().setDepth(5);
        gfx.fillStyle(0x44ff88, 0.25);
        gfx.fillPoints([d.top, d.right, d.bottom, d.left], true);
        gfx.lineStyle(1, 0x44ff88, 0.6);
        gfx.strokePoints([d.top, d.right, d.bottom, d.left], true);
        this._movableOverlays.push(gfx);
      }
    }
  }

  /**
   * 이동 가능 셀 오버레이 제거.
   * @private
   */
  _hideMoveOverlay() {
    for (const gfx of this._movableOverlays) {
      gfx.destroy();
    }
    this._movableOverlays = [];
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

    // 경로 위 불가 — 조용히 무시
    if (this.stagePathCells.has(key)) {
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

  /**
   * ��이브 시작 이벤트 핸들러. HUD 갱신, SFX/VFX 재생, 보스 BGM 전환.
   * @param {number} waveNum - 1-based 웨이브 번호
   * @private
   */
  _onWaveStarted(waveNum) {
    // 단일 웨이브이므로 "채집 중"으로 표시
    this.waveText.setText('채집 중');
    this.waitingForNextWave = false;
    this._setWaveButtonEnabled(false);
    SoundManager.playSFX('sfx_wave_start');
    this.vfx.waveAnnounce(waveNum);
    this.vfx.screenFlash(0xffffff, 0.3, 200);

    // ── Phase 21: 웨이브 시작 시 타워 이동 모드 자동 해제 ──
    this._deselectTower();

    // ── 보스 적 포함 여부로 BGM 전환 ──
    this._checkBossWaveBGM(waveNum);

    // ── 오더 생성 시도 (병합된 웨이브의 실제 적 총 수 계산, __pause__ 제외) ──
    const waveDef = this.waveManager._waves[0];
    const maxEnemyCount = waveDef
      ? waveDef.enemies.filter(g => g.type !== '__pause__').reduce((sum, g) => sum + g.count, 0)
      : Infinity;
    const order = this.orderManager.tryGenerateOrder(1, maxEnemyCount);
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
      (e) => ENEMY_TYPES[e.type]?.isBoss || ENEMY_TYPES[e.type]?.isMidBoss
    );

    if (hasBoss) {
      SoundManager.playBGM('bgm_boss');
    } else if (SoundManager._currentBGMId === 'bgm_boss') {
      SoundManager.playBGM('bgm_battle');
    }
  }

  /**
   * 적 사망 이벤트 핸들러. 점수 증가, 오더 진행, VFX 재생.
   * @param {Enemy} enemy - 사망한 적 인스턴스
   * @private
   */
  _onEnemyDied(enemy) {
    this.score++;
    this.orderManager.addProgress('kill_count');
    SoundManager.playSFX('sfx_enemy_death');
    // VFX: 적 사망 파티클
    if (enemy && enemy.x !== undefined) {
      const isBoss = !!(enemy.data_?.isBoss || enemy.data_?.isMidBoss);
      const color = enemy.data_?.bodyColor || 0xffffff;
      this.vfx.enemyDeath(enemy.x, enemy.y, color, isBoss);

      // ── 업적 카운터 (Phase 42) ──
      AchievementManager.increment('enemy_total_killed', 1);
      AchievementManager.check(this, 'enemy_total_killed', 0);
      if (isBoss) {
        AchievementManager.increment('boss_killed', 1);
        AchievementManager.check(this, 'boss_killed', 0);
      }
    }
    this._checkWaveProgress();
  }

  /**
   * 적이 기지에 도달했을 때의 이벤트 핸들러. 생명 감소, 게임오버 체크.
   * @param {Enemy} enemy - 도달한 적 인스턴스
   * @private
   */
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
   * Phase 38-1: 3페이즈 보스 페이즈 전환 이벤트 처리 (queen_of_taste).
   * 화면 중앙에 페이즈 번호를 1.5초간 표시한다.
   * @param {{ phase: number, x: number, y: number }} data
   */
  _onBossPhaseChanged({ phase, x, y }) {
    const phaseColors = { 2: 0xcc88ff, 3: 0xff6666 };
    const phaseLabels = { 2: 'PHASE 2', 3: 'PHASE 3' };
    const color = phaseColors[phase] || 0xffffff;
    const label = phaseLabels[phase] || `PHASE ${phase}`;

    // 화면 중앙에 페이즈 전환 텍스트 표시
    const cam = this.cameras.main;
    const cx = cam.scrollX + cam.width / 2;
    const cy = cam.scrollY + cam.height / 2 - 40;
    const txt = this.add.text(cx, cy, label, {
      fontSize: '20px',
      fontFamily: FONT_FAMILY,
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0.5).setDepth(9999);

    // 1.5초 후 페이드아웃 제거
    this.tweens.add({
      targets: txt,
      alpha: 0,
      y: cy - 30,
      duration: 1500,
      onComplete: () => txt.destroy(),
    });
  }

  /**
   * 적 돌진 충격 이벤트 처리.
   * burrito_juggernaut의 돌진 발동 시 반경 내 배치 도구에 VFX + 경고 표시.
   * Tower에 HP 시스템 없음 -- 시각적 피드백만 제공 (Phase 46).
   * @param {{ x: number, y: number, radius: number, damageRatio: number }} data
   * @private
   */
  _onEnemyChargeImpact(data) {
    const { x, y, radius } = data;
    // 범위 내 타워 탐색
    this.towers.getChildren().forEach(tower => {
      if (!tower.active) return;
      const dx = tower.x - x;
      const dy = tower.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        // VFX: 충격 플래시 (알파 깜빡임)
        this.tweens.add({
          targets: tower, alpha: 0.3,
          duration: 100, yoyo: true, repeat: 1,
        });
        // 플로팅 텍스트: 돌진 경고
        const popup = this.add.text(tower.x, tower.y - 16, '돌진!', {
          fontSize: '11px', color: '#ff4400', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(1115);
        this.tweens.add({
          targets: popup, y: popup.y - 25, alpha: 0,
          duration: 800,
          onComplete: () => popup.destroy(),
        });
      }
    });
    // 화면 흔들림 (경미)
    this.vfx?.screenShake?.(3, 150);
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
      }).setOrigin(0.5).setDepth(1115);

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
      }).setOrigin(0.5).setDepth(1115);

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
    }).setOrigin(0.5).setDepth(1115);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0,
      duration: 1000,
      onComplete: () => popup.destroy(),
    });
  }

  /**
   * 어둠 디버프 이벤트 - 범위 내 타워 공격력 임시 감소.
   * shadow_dragon_spawn이 darkInterval(5초)마다 emit한다.
   * @param {{ x: number, y: number, radius: number, damageReduction: number, duration: number }} data
   */
  _onDarkDebuff({ x, y, radius, damageReduction, duration }) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active) return;
      if (tower.data_?.id === 'delivery' || tower.data_?.id === 'soup_pot') return;
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist > radius) return;
      // 이미 디버프 중이면 스킵 (중복 방지)
      if (tower._darkDebuffed) return;
      tower._darkDebuffed = true;

      if (tower.applyBuff) tower.applyBuff('damage', -damageReduction);

      this.tweens.add({
        targets: tower, alpha: 0.5,
        duration: 200, yoyo: true,
      });

      this.time.delayedCall(duration, () => {
        if (!tower.active) return;
        tower._darkDebuffed = false;
        if (tower.removeBuff) tower.removeBuff();
        if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
      });
    });

    const popup = this.add.text(x, y - 20, '\uD83C\uDF11 \uC5B4\uB460!', {
      fontSize: '12px', color: '#6600cc',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1115);
    this.tweens.add({
      targets: popup, y: popup.y - 30, alpha: 0,
      duration: 1200, ease: 'Power1',
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
    }).setOrigin(0.5).setDepth(1115);
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
      }).setOrigin(0.5).setDepth(1115);
      this.tweens.add({
        targets: recoverPopup, y: recoverPopup.y - 30, alpha: 0,
        duration: 1000,
        onComplete: () => recoverPopup.destroy(),
      });
    });
  }

  /**
   * Phase 20: 은신 백어택 이벤트 - 범위 내 도구에 공격속도 디버프.
   * sushi_ninja가 은신 해제 시 발동한다.
   * @param {{ x: number, y: number, radius: number, duration: number }} data
   */
  _onStealthBackAttack({ x, y, radius, duration }) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active) return;
      if (tower.data_?.id === 'delivery' || tower.data_?.id === 'soup_pot') return;
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist > radius) return;

      if (tower.applyBuff) tower.applyBuff('speed', -0.30);

      this.tweens.add({
        targets: tower, alpha: 0.5,
        duration: 150, yoyo: true,
      });

      this.time.delayedCall(duration, () => {
        if (tower.active && tower.removeBuff) tower.removeBuff();
        if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
      });
    });

    const popup = this.add.text(x, y - 20, '\uD83D\uDDE1\uFE0F \uBC31\uC5B4\uD0DD!', {
      fontSize: '11px', color: '#2f2f4f',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1115);
    this.tweens.add({
      targets: popup, y: popup.y - 25, alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy(),
    });
  }

  // ── Phase 21: 확정 분열 (dumpling_warrior) ──────────────────────

  /**
   * 확정 분열 이벤트 핸들러.
   * dumpling_warrior(split=true)와 sugar_specter(splitOnDeath) 모두 처리.
   * @param {{ type: string, x: number, y: number, waypointIndex: number,
   *           hpOverride?: number, speedMultiplier?: number, rewardOverride?: number }} data
   * @private
   */
  _onDeterministicSplit({ type, x, y, waypointIndex, hpOverride, speedMultiplier, rewardOverride }) {
    const enemyData = ENEMY_TYPES[type];
    if (!enemyData) return;
    const waypoints = this.stageWaypoints || undefined;
    const enemy = new Enemy(this.scene || this, enemyData, waypoints);
    enemy.x = x;
    enemy.y = y;
    enemy.waypointIndex = waypointIndex;

    // Phase 38-1: 선택적 오버라이드 파라미터 적용
    if (hpOverride !== undefined && hpOverride > 0) {
      enemy.hp = hpOverride;
      enemy.maxHp = hpOverride;
      // HP 바 갱신 (Enemy 생성자 이후 수동 조정)
      if (enemy.hpBar) {
        enemy.hpBar.width = 26; // 최대 HP 기준 풀 HP
      }
    }
    if (speedMultiplier !== undefined && speedMultiplier !== 1) {
      enemy.speed = enemy.speed * speedMultiplier;
    }
    if (rewardOverride !== undefined) {
      // reward 오버라이드: _onEnemyDied에서 체크하여 골드 지급 스킵
      enemy.rewardOverride = rewardOverride;
    }

    this.enemies.add(enemy);
  }

  // ── Phase 21: 화염 장판 관리 ──────────────────────────────────────

  /**
   * 화염 장판 이벤트 수신 - Phaser Graphics 원 생성, _fireZones 배열에 추가.
   * @param {{ x: number, y: number, radius: number, duration: number, debuffDuration: number }} data
   * @private
   */
  _onEnemyFireZone({ x, y, radius, duration, debuffDuration }) {
    const gfx = this.add.graphics();
    gfx.fillStyle(0xff3300, 0.35);
    gfx.fillCircle(0, 0, radius);
    gfx.setPosition(x, y);
    gfx.setDepth(5);

    const zoneData = { gfx, x, y, radius, debuffDuration };

    // duration 후 자동 제거
    const timer = this.time.delayedCall(duration, () => {
      const idx = this._fireZones.indexOf(zoneData);
      if (idx >= 0) this._fireZones.splice(idx, 1);
      gfx.destroy();
    });
    zoneData.timer = timer;
    this._fireZones.push(zoneData);
  }

  /**
   * 매 프레임 화염 장판 범위 내 도구에 공격속도 -20% 디버프를 적용한다.
   * @private
   */
  _updateFireZones() {
    if (!this._fireZones || this._fireZones.length === 0) return;
    this._fireZones.forEach(zone => {
      this.towers.getChildren().forEach(tower => {
        if (!tower.active) return;
        if (tower.data_?.id === 'delivery' || tower.data_?.id === 'soup_pot') return;
        const dist = Phaser.Math.Distance.Between(zone.x, zone.y, tower.x, tower.y);
        if (dist > zone.radius) return;
        // 이미 디버프가 걸려 있으면 스킵 (중복 방지)
        if (tower._fireZoneDebuffed) return;
        tower._fireZoneDebuffed = true;
        if (tower.applyBuff) tower.applyBuff('speed', -0.20);
        this.time.delayedCall(zone.debuffDuration, () => {
          if (tower.active) {
            tower._fireZoneDebuffed = false;
            if (tower.removeBuff) tower.removeBuff();
            if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
          }
        });
      });
    });
  }

  // ── Phase 21: 화염 브레스 (dragon_wok) ────────────────────────────

  /**
   * dragon_wok 화염 브레스 이벤트 수신 - 부채꼴 범위 내 도구에 공격속도 디버프 적용.
   * @param {{ x: number, y: number, angle: number, radius: number, debuffValue: number, debuffDuration: number, dx: number, dy: number }} data
   * @private
   */
  _onDragonFireBreath({ x, y, angle, radius, debuffValue, debuffDuration, dx, dy }) {
    // 이동 방향 각도 계산
    const moveAngle = Math.atan2(dy, dx);
    const halfAngle = (angle / 2) * (Math.PI / 180);

    this.towers.getChildren().forEach(tower => {
      if (!tower.active) return;
      if (tower.data_?.id === 'delivery' || tower.data_?.id === 'soup_pot') return;
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist > radius) return;

      // 부채꼴 범위 체크
      const towerAngle = Math.atan2(tower.y - y, tower.x - x);
      let angleDiff = towerAngle - moveAngle;
      // -PI ~ PI 범위로 정규화
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      if (Math.abs(angleDiff) > halfAngle) return;

      if (tower.applyBuff) tower.applyBuff('speed', debuffValue);
      this.tweens.add({
        targets: tower, alpha: 0.5,
        duration: 150, yoyo: true,
      });
      this.time.delayedCall(debuffDuration, () => {
        if (tower.active && tower.removeBuff) tower.removeBuff();
        if (this._currentBuff) this._applyBuffToTower(tower, this._currentBuff);
      });
    });

    // VFX: 브레스 텍스트 팝업
    const popup = this.add.text(x, y - 20, '\uD83D\uDD25 \uBE0C\uB808\uC2A4!', {
      fontSize: '11px', color: '#ff4400',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1115);
    this.tweens.add({
      targets: popup, y: popup.y - 25, alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy(),
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
    // 면역 계열: 디버프 면역 + 공격속도 보너스 (effectValue를 속도 버프로 적용)
    else if (effectType === 'buff_narcotize_immunity') tower.applyBuff('speed', effectValue);
    else if (effectType === 'buff_dark_immunity') tower.applyBuff('damage', effectValue);
    else if (effectType === 'buff_wine_immunity') tower.applyBuff('speed', effectValue);
  }

  // ── Phase 58-3: 분기 카드 변이 / 인연 적용 ──────────────────────

  /**
   * 배치 직후 타워에 변이(Mutation) 효과를 반영한다.
   *
   * 시각: `_bodySprite.setTint(color)`로 기존 도구 아이콘에 색조를 덧씌운다.
   *       (AD 확정 방식 A — 별도 PNG 오버레이 없이 tint로 구분)
   * 스탯: 변이 타입별 오버라이드를 tower 필드에 직접 반영한다.
   *       - splash: tower.data_.splashRadius += N
   *       - burn_stack: tower.burnMultiplier *= N (중첩 배수를 기존 화상 곱에 반영)
   *       - phase_through: delivery collectInterval 감소
   *       - freeze_extend: tower._freezeExtend 플래그 + Projectile 참조
   *       - aura_boost: soup_pot aura 관련 (58-3 MVP — 아우라 계산은 추후)
   *       - chain / cluster / venom: 58-3 MVP 범위에서는 플래그만 세팅
   *
   * @param {Tower} tower
   * @param {string} typeId
   * @private
   */
  _applyMutationToTower(tower, typeId) {
    const effect = BranchEffects.getMutationEffect(typeId);
    if (!effect) return;

    // ── 시각 tint ──
    const tint = BranchEffects.getMutationTint(typeId);
    if (tint !== null && tower._bodySprite && tower._bodySprite.setTint) {
      tower._bodySprite.setTint(tint);
    }

    // ── 스탯/동작 오버라이드 ──
    switch (effect.type) {
      case 'splash':
        // splashRadius 가산 (기본값 없으면 0 → 가산 후 양수)
        tower.data_.splashRadius = (tower.data_.splashRadius || 0) + (effect.splashRadius || 0);
        break;
      case 'burn_stack':
        // 화상 데미지 배수 (기존 burnMultiplier에 곱)
        tower.burnMultiplier = (tower.burnMultiplier || 1.0) * (effect.stackMultiplier || 1);
        tower._maxBurnStacks = effect.maxStacks || 1;
        break;
      case 'phase_through':
        // delivery 전용: 수거 간격 감소 (effect.collectIntervalDelta는 음수)
        if (typeId === 'delivery') {
          const base = tower.data_.collectInterval || 2000;
          tower.data_.collectInterval = Math.max(300, base + (effect.collectIntervalDelta || 0));
        }
        break;
      case 'freeze_extend':
        // freezer 전용: 빙결 지속 가산 (초 → ms로 환산)
        if (tower.data_.freezeDuration !== undefined) {
          tower.data_.freezeDuration += Math.floor((effect.freezeDurationDelta || 0) * 1000);
        }
        tower._refreezeChance = effect.refreezeChance || 0;
        break;
      case 'aura_boost':
        // soup_pot 전용: 아우라 배수/반경 (소프트 플래그)
        tower._auraMultiplier = (tower._auraMultiplier || 1.0) * (effect.auraMultiplier || 1.0);
        if (tower.data_.auraRadius !== undefined) {
          tower.data_.auraRadius += (effect.auraRadiusDelta || 0);
        }
        break;
      case 'cluster':
        // wasabi_cannon 전용: 발사 시 multi-shot (플래그 + 탄 수/감소 비율 설정)
        tower._clusterCount = effect.clusterCount || 1;
        tower._perShotDamageRatio = effect.perShotDamageRatio || 1.0;
        if (tower.data_.splashRadius !== undefined) {
          tower.data_.splashRadius = Math.max(0, tower.data_.splashRadius + (effect.splashRadiusDelta || 0));
        }
        break;
      case 'venom':
        // spice_grinder 전용: DoT 지속 연장(s → ms) + 독 둔화
        if (tower.data_.dotDuration !== undefined) {
          tower.data_.dotDuration += Math.floor((effect.dotDurationDelta || 0) * 1000);
        }
        tower._poisonSlowPct = effect.poisonSlowPct || 0;
        break;
      case 'chain':
        // salt 전용: 둔화 연쇄 (플래그/반경만 저장)
        tower._chainCount = effect.chainCount || 0;
        tower._chainRadius = effect.chainRadius || 0;
        break;
      default:
        break;
    }

    // ── 인연(Bond) 시너지 ──
    this._applyBondToTower(tower, typeId);
  }

  /**
   * 선택 셰프와 도구 조합에 매칭되는 Bond 카드가 있으면 타워에 시너지를 적용한다.
   * 단순 damage/burn/range 배수만 반영한다. 추가 조건부 시너지는 플래그로 저장만 한다.
   *
   * @param {Tower} tower
   * @param {string} typeId
   * @private
   */
  _applyBondToTower(tower, typeId) {
    const bondEffect = BranchEffects.getActiveBondEffect(typeId);
    if (!bondEffect) return;

    switch (bondEffect.type) {
      case 'damage_pct':
        // grill 라오 시너지 — 공격력 +value(%)
        tower.damageMultiplier = (tower.damageMultiplier || 1.0) * (1 + (bondEffect.value || 0));
        break;
      case 'burn_damage_flat':
        // rin 린 시너지 — 팬 화상 플랫 가산 (Projectile 쪽은 burnDamage 필드 사용)
        tower.data_.burnDamage = (tower.data_.burnDamage || 0) + (bondEffect.value || 0);
        break;
      case 'freeze_radius_flat':
        // mage 메이지 시너지 — 빙결 범위 가산
        tower.range = (tower.range || 0) + (bondEffect.value || 0);
        tower.baseRange = tower.range;
        break;
      case 'cook_speed_pct':
        // yuki 유키 시너지 — 조리시간 감소 (영업 씬에서 참조할 플래그)
        tower._bondCookSpeedBonus = bondEffect.value || 0;
        break;
      case 'tip_pct':
        // andre 앙드레 시너지 — 팁 보너스 (ServiceScene에서 참조할 플래그)
        tower._bondTipBonus = bondEffect.value || 0;
        break;
      case 'wasabi_synergy':
        // arjun 아르준 시너지 — splashRadius 가산 + 독 스택 추가
        if (tower.data_.splashRadius !== undefined) {
          tower.data_.splashRadius += (bondEffect.splashRadiusDelta || 0);
        }
        tower._poisonStackBonus = bondEffect.poisonStackBonus || 0;
        break;
      case 'collect_radius_on_slow':
        // mimi 미미 시너지 — 둔화 적 대상 수거 범위 가산 (플래그만)
        tower._collectRadiusOnSlow = bondEffect.value || 0;
        // 캐시 무효화: 새 salt 타워 배치 시 다음 delivery 사이클에서 재계산
        this._saltCollectRadiusCached = false;
        break;
      case 'drop_rate_on_poison':
        // mimi 미미 향신료 — 중독 적 재료 드롭률 가산 (IngredientManager 참조용 플래그)
        tower._dropRateOnPoison = bondEffect.value || 0;
        break;
      default:
        break;
    }

    // 시각 피드백: 약한 green glow (tint alpha 덧씌움은 Phaser 제약으로 생략, 단순 scale pulse)
    this.tweens.add({
      targets: tower,
      scaleX: { from: 1.1, to: 1 },
      scaleY: { from: 1.1, to: 1 },
      duration: 240, ease: 'Back.easeOut',
    });
  }

  // ── 배달 도구 자동 수거 ────────────────────────────────────────

  /**
   * 배달 도구의 자동 수거 로직 업데이트.
   * @param {number} delta - 프레임 경과 시간 (ms)
   * @private
   */
  _updateDeliveryTowers(delta) {
    this.towers.getChildren().forEach(tower => {
      if (!tower.active || tower.data_?.id !== 'delivery') return;
      tower._collectTimer = (tower._collectTimer || 0) + delta;
      const deliveryBonus = UpgradeManager.getDeliverySpeedMultiplier();
      const effectiveInterval = (tower.data_.collectInterval || 2000) / deliveryBonus;
      if (tower._collectTimer < effectiveInterval) return;
      tower._collectTimer = 0;

      // ── Phase 72: mimi+salt Bond — 둔화 적 근처에서 수거 범위 확장 ──
      // salt 타워 중 _collectRadiusOnSlow 플래그가 양수인 타워가 있는지 캐시
      let saltCollectBonus = 0;
      if (!this._saltCollectRadiusCached) {
        this.towers.getChildren().forEach(t => {
          if (t.active && t.data_?.id === 'salt' && t._collectRadiusOnSlow > 0) {
            saltCollectBonus = Math.max(saltCollectBonus, t._collectRadiusOnSlow);
          }
        });
        this._saltCollectRadiusCache = saltCollectBonus;
        this._saltCollectRadiusCached = true;
      } else {
        saltCollectBonus = this._saltCollectRadiusCache || 0;
      }

      const drops = this.ingredientManager.drops;
      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop || !drop.container) continue;
        const dist = Phaser.Math.Distance.Between(
          tower.x, tower.y, drop.container.x, drop.container.y
        );
        let collectRange = (tower.data_.collectRadius || 110) * ChefManager.getCollectRangeBonus();

        // Phase 72: 둔화 적이 드롭 근처에 있으면 수거 범위 가산
        if (saltCollectBonus > 0 && this.enemies) {
          const hasSlowedEnemy = this.enemies.getChildren().some(enemy => {
            if (!enemy.active || enemy.isDead) return false;
            if (enemy.slowFactor >= 1.0) return false;
            const eDist = Phaser.Math.Distance.Between(
              drop.container.x, drop.container.y, enemy.x, enemy.y
            );
            return eDist <= 120; // 드롭 주변 120px 이내
          });
          if (hasSlowedEnemy) {
            collectRange += saltCollectBonus;
          }
        }

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

    // 단일 웨이브이므로 항상 채집 완료 → 승리
    this._triggerVictory();
  }

  // ── 게임 종료 ───────────────────────────────────────────────────

  /**
   * 게임오버 처리. 패배 연출 후 재료 유무에 따라 분기.
   * - 재료 > 0: ServiceScene 경유 (부분 성공, 재료 50% 컷, 별점 최대 2개)
   * - 재료 = 0: ResultScene 직행 (완전 실패, 기존 동작 유지)
   * @private
   */
  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    // VFX: 패배 빨강 플래시
    this.vfx.screenFlash(0xff0000, 0.5, 300);

    this.cameras.main.fadeOut(600, 100, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const total = this.inventoryManager.getTotal();

      // ── Phase 78: 부분 성공 분기 ──
      // 재료가 1개 이상이면 ServiceScene 경유 (재료 50% 컷, 별점 최대 2개)
      // 재료가 0개이면 기존 완전 실패 경로 유지
      if (total > 0) {
        this.scene.start('ServiceScene', {
          inventory: this.inventoryManager.getAll(),
          stageId: this.stageId,
          lives: 0,
          partialFail: true,
          marketResult: {
            totalIngredients: total,
            livesRemaining: 0,
            livesMax: STARTING_LIVES,
            partialFail: true,
          },
        });
      } else {
        this.scene.start('ResultScene', {
          stageId: this.stageId,
          marketResult: {
            totalIngredients: 0,
            livesRemaining: 0,
            livesMax: STARTING_LIVES,
          },
          serviceResult: null,
          isMarketFailed: true,
        });
      }
    });
  }

  /**
   * 승리 처리. 인벤토리 요약 표시 후 ServiceScene으로 전환.
   * @private
   */
  _triggerVictory() {
    if (this.isVictory) return;
    this.isVictory = true;
    // VFX: 클리어 연출
    this.vfx.clearAnnounce();

    // ── 업적: 도구 보유 체크 (Phase 42) ──
    AchievementManager.check(this, 'tool_count_placed', 0);

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

  /**
   * 웨이브 컨트롤 영역 (590~640px)에 웨이브 시작 버튼을 생성한다.
   * @private
   */
  _createWaveButton() {
    const cx = GAME_WIDTH / 2;
    const cy = WAVE_CONTROL_Y + WAVE_CONTROL_HEIGHT / 2;

    // Phase 60-12: 웨이브 컨트롤 배경 rect → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(this, cx, cy, GAME_WIDTH, WAVE_CONTROL_HEIGHT, 'dark')
      .setDepth(1000).setScrollFactor(0);

    // Phase 60-12: 웨이브 시작 버튼 rect → NineSliceFactory.raw 'btn_primary_normal'
    // 주황색 유지를 위해 setTint(0xff6b35) 사용. 컨테이너 hitArea를 중앙 원점 기준으로 등록.
    const WBTN_W = 160;
    const WBTN_H = 36;
    const waveBtnBg = NineSliceFactory.raw(this, cx, cy, WBTN_W, WBTN_H, 'btn_primary_normal')
      .setDepth(1115).setScrollFactor(0);
    waveBtnBg.setTint(0xff6b35);
    const waveBtnHit = new Phaser.Geom.Rectangle(-WBTN_W / 2, -WBTN_H / 2, WBTN_W, WBTN_H);
    waveBtnBg.setInteractive(waveBtnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    if (waveBtnBg.input) waveBtnBg.input.cursor = 'pointer';
    this._waveBtnBg = waveBtnBg;

    this._waveBtnText = this.add.text(cx, cy, '\uC6E8\uC774\uBE0C \uC2DC\uC791 \u25B6', {
      fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1116).setScrollFactor(0);

    this._waveBtnBg.on('pointerdown', () => {
      if (!this._waveBtnEnabled) return;
      this._startCountdown(() => {
        this.waveManager.startNextWave();
        // 튜토리얼 3단계 완료
        if (this._tutorial?.isActive()) this._tutorial.advance();
      });
    });
    this._waveBtnBg.on('pointerover', () => {
      if (this._waveBtnEnabled) {
        this._waveBtnBg.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED);
        this._waveBtnBg.setTint(0xff8c00);
      }
    });
    this._waveBtnBg.on('pointerout', () => {
      if (this._waveBtnEnabled) {
        this._waveBtnBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL);
        this._waveBtnBg.setTint(0xff6b35);
      }
    });

    this._waveBtnEnabled = true;
    this._waveBtnPulse = null;
    this._setWaveButtonEnabled(true);

    // 카운트다운 텍스트 (평소 숨김)
    this._countdownText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, '', {
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      fontFamily: FONT_FAMILY,
    }).setOrigin(0.5).setDepth(3000).setScrollFactor(0).setVisible(false);
  }

  /**
   * 3→2→1→GO! 카운트다운을 실행한 뒤 callback을 호출한다.
   * 카운트다운 중 웨이브 버튼은 비활성화된다.
   * 도구 배치/재배치는 허용(버튼만 비활성화).
   * @param {function} callback - 카운트다운 완료 후 실행할 함수
   * @private
   */
  _startCountdown(callback) {
    this._setWaveButtonEnabled(false);

    const steps = ['3', '2', '1', 'GO!'];
    const STEP_DURATION = 800; // ms per step

    const showStep = (index) => {
      if (index >= steps.length) {
        // 카운트다운 완료
        this._countdownText.setVisible(false);
        callback();
        return;
      }

      this._countdownText
        .setText(steps[index])
        .setAlpha(1)
        .setVisible(true)
        .setScale(1.4);

      // 스케일 애니메이션 (1.4 → 1.0 페이드)
      this.tweens.add({
        targets: this._countdownText,
        scale: 1.0,
        alpha: index === steps.length - 1 ? 1 : 0.3, // GO!는 남겨두고 나머지는 페이드
        duration: STEP_DURATION,
        ease: 'Sine.Out',
        onComplete: () => {
          this.time.delayedCall(0, () => showStep(index + 1));
        },
      });
    };

    showStep(0);
  }

  /**
   * 웨이브 버튼 활성/비활성 전환.
   * @param {boolean} enabled
   */
  _setWaveButtonEnabled(enabled) {
    this._waveBtnEnabled = enabled;
    if (enabled) {
      // Phase 60-12: setFillStyle → setTexture + setTint
      this._waveBtnBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL);
      this._waveBtnBg.setTint(0xff6b35).setAlpha(1);
      this._waveBtnText.setAlpha(1);
      this._waveBtnText.setText('채집 시작 ▶');
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
      // Phase 60-20: rect → NineSliceFactory.panel 'dark' + setTint + setAlpha
      this._orderBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, 34, 280, 14, 'dark')
        .setDepth(1001).setTint(0x222244).setAlpha(0.85);
      this._orderLabel = this.add.text(GAME_WIDTH / 2, 34, '', {
        fontSize: '9px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5).setDepth(1002);
      this._orderContainer = this.add.container(0, 0, [this._orderBg, this._orderLabel])
        .setDepth(1001).setScrollFactor(0, 0, true);
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

    // Phase 60-20: setFillStyle → setTint (NineSlice Container)
    if (status.completed) {
      this._orderBg.setTint(0x225522);
      this._orderLabel.setColor('#44ff44');
    } else if (status.failed) {
      this._orderBg.setTint(0x552222);
      this._orderLabel.setColor('#ff4444');
    } else {
      this._orderBg.setTint(0x222244);
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
      }).setOrigin(0.5).setDepth(1115);

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

  // ── 메뉴 팝업 ───────────────────────────────────────────────────

  /**
   * 채집씬 메뉴 팝업 (나가기 / 계속) 표시.
   * @private
   */
  _showMenuPopup() {
    if (this._menuPopup) return;  // 중복 방지

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // 반투명 전체 오버레이 (터치 블록)
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setDepth(5000).setInteractive();

    // Phase 60-20: rect → NineSliceFactory.panel 'parchment'
    const popBg = NineSliceFactory.panel(this, cx, cy, 200, 120, 'parchment')
      .setDepth(5001);

    const title = this.add.text(cx, cy - 36, '일시 정지', {
      fontSize: '14px', color: '#3a2818', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5002);

    // Phase 60-20: rect → NineSliceFactory.raw btn_primary_normal + setTint (계속하기)
    const resumeBg = NineSliceFactory.raw(this, cx, cy - 4, 160, 28, 'btn_primary_normal')
      .setDepth(5001).setTint(0x225522);
    resumeBg.setInteractive(
      new Phaser.Geom.Rectangle(-80, -14, 160, 28),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true },
    );
    // Phase 93: 계속하기 버튼 hover 피드백
    resumeBg.on('pointerover', () => resumeBg.setTint(0x336633));
    resumeBg.on('pointerout', () => resumeBg.setTint(0x225522));
    const resumeLabel = this.add.text(cx, cy - 4, '계속하기', {
      fontSize: '13px', color: '#88ff88',
    }).setOrigin(0.5).setDepth(5002);

    // Phase 60-20: rect → NineSliceFactory.raw btn_danger_normal + setTint (메뉴로 나가기)
    const exitBg = NineSliceFactory.raw(this, cx, cy + 30, 160, 28, 'btn_danger_normal')
      .setDepth(5001).setTint(0x552222);
    exitBg.setInteractive(
      new Phaser.Geom.Rectangle(-80, -14, 160, 28),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true },
    );
    // Phase 93: 메뉴로 나가기 ���튼 hover 피드백
    exitBg.on('pointerover', () => exitBg.setTint(0x663333));
    exitBg.on('pointerout', () => exitBg.setTint(0x552222));
    const exitLabel = this.add.text(cx, cy + 30, '메뉴로 나가기', {
      fontSize: '13px', color: '#ff8888',
    }).setOrigin(0.5).setDepth(5002);

    this._menuPopup = this.add.container(0, 0,
      [overlay, popBg, title, resumeBg, resumeLabel, exitBg, exitLabel],
    ).setDepth(5000).setScrollFactor(0, 0, true);

    const close = () => {
      this._menuPopup?.destroy();
      this._menuPopup = null;
    };

    overlay.on('pointerdown', close);
    resumeBg.on('pointerdown', close);

    exitBg.on('pointerdown', () => {
      close();
      SoundManager.stopBGM();
      // 진행 중 재료는 유지 (InventoryManager는 씬 간 공유 인스턴스)
      this.scene.start('WorldMapScene');
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
    // Phase 60-20: rect → NineSliceFactory.panel 'dark' + setAlpha
    const bg = NineSliceFactory.panel(this, GAME_WIDTH / 2, msgY, 280, 70, 'dark')
      .setDepth(1120).setAlpha(0.8);
    const text = this.add.text(GAME_WIDTH / 2, msgY, message, {
      fontSize: '15px', color: '#ffffff', align: 'center', lineSpacing: 5,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1121);

    this._messagePopup = this.add.container(0, 0, [bg, text]).setDepth(9000).setScrollFactor(0, 0, true);

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

    // 배달 도구 자동 수거
    this._updateDeliveryTowers(delta);

    // 수프 솥 오라 버프
    this._updateSoupPotAuras(delta);

    // 셰프 스킬 쿨다운
    this._updateChefSkillCooldown(delta);

    // lao_chef power_surge 타이머
    ChefManager.tickPowerSurge(delta);

    // Phase 21: 화염 장판 범위 내 도구 디버프 적용
    this._updateFireZones();

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

      const range = tower.data_.auraRadius || tower.data_.range || 120;
      // Phase 72: aura_boost 변이 — _auraMultiplier가 있으면 아우라 효과에 곱함
      const baseEffect = tower.data_.auraEffect || 0.15;
      const effect = baseEffect * (tower._auraMultiplier || 1.0);

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
    // ── Phase 77: 배속 상태 복원 (씬 종료 시 시간 배율 초기화) ──
    this.time.timeScale = 1;

    // ── Phase 54: DEV 치트 핸들러 해제 ──
    if (import.meta.env.DEV && window.__kcCheat) {
      delete window.__kcCheat;
    }

    this.events.off('enemy_died', this._onEnemyDied, this);
    this.events.off('enemy_reached_base', this._onEnemyReachedBase, this);
    this.events.off('boss_summon', this._onBossSummon, this);
    this.events.off('enemy_split', this._onEnemySplit, this);
    this.events.off('enemy_death_heal', this._onEnemyDeathHeal, this);
    this.events.off('boss_killed', this._onBossKilled, this);
    this.events.off('spore_debuff', this._onSporeDebuff, this);
    this.events.off('dark_debuff', this._onDarkDebuff, this);  // Phase 25-2
    this.events.off('boss_debuff', this._onBossDebuff, this);
    this.events.off('stealth_back_attack', this._onStealthBackAttack, this);
    // Phase 21: 이벤트 해제 + 화염 장판 정리
    this.events.off('enemy_deterministic_split', this._onDeterministicSplit, this);
    this.events.off('enemy_fire_zone', this._onEnemyFireZone, this);
    this.events.off('dragon_fire_breath', this._onDragonFireBreath, this);
    this.events.off('boss_phase_changed', this._onBossPhaseChanged, this);
    this.events.off('enemy_charge_impact', this._onEnemyChargeImpact, this);  // Phase 46
    if (this._fireZones) {
      this._fireZones.forEach(zone => {
        zone.gfx?.destroy();
        zone.timer?.remove?.();
      });
      this._fireZones = [];
    }
    this.events.off('wave_started', this._onWaveStarted, this);
    this.events.off('inventory_changed', this._onInventoryChanged, this);
    this.events.off('ingredient_collected_for_order', this._onIngredientCollectedForOrder, this);
    this.events.off('ingredient_collected_at', this._onIngredientCollectedAt, this);
    this.ingredientManager?.destroy();
    this.vfx?.destroy();
    this._tutorial?.end?.();
    this._hideTowerActionPanel();
    this._hideMoveOverlay();
    this._hidePlaceableOverlay();
    this._hideRangeRing();
    if (this._countdownText) { this._countdownText.destroy(); this._countdownText = null; }

    // Phase 11-3c: 씬 전환 시 Tween/Timer 명시적 정리
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
