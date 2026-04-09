/**
 * @fileoverview 엔드리스 모드 TD 씬.
 * Phase 11-1: MarketScene을 상속하여 무한 웨이브 로직만 override.
 * 5웨이브마다 ServiceScene으로 전환, 라이프 0 시 엔드리스 결과 화면으로 전환.
 */

import { MarketScene } from './MarketScene.js';
import { EndlessWaveGenerator } from '../managers/EndlessWaveGenerator.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ENEMY_TYPES } from '../data/gameData.js';
import { Enemy } from '../entities/Enemy.js';
import { GAME_WIDTH, STARTING_LIVES, WAVE_CLEAR_BONUS } from '../config.js';
import { SoundManager } from '../managers/SoundManager.js';
import { TutorialManager } from '../managers/TutorialManager.js';

export class EndlessScene extends MarketScene {
  constructor() {
    // MarketScene.constructor → Phaser.Scene({ key: 'MarketScene' })를 호출하고,
    // Phaser.Scene이 내부적으로 Systems 인스턴스를 생성하므로
    // super() 호출 직후 this.sys가 존재한다. key를 교체하여 별도 씬으로 등록한다.
    super();
    this.sys.settings.key = 'EndlessScene';
  }

  // ── create override ─────────────────────────────────────────────

  /**
   * 엔드리스 모드 전용 초기화.
   * ServiceScene에서 복귀 시 상태를 복원하고, 웨이브를 교체한다.
   * @param {{ stageId?: string, endlessWave?: number, endlessScore?: number, endlessMaxCombo?: number, dailySpecials?: string[], gold?: number, lives?: number }} data
   */
  create(data) {
    // 1. 엔드리스 전용 상태 복원 (ServiceScene에서 복귀 시)
    this.endlessWave = data?.endlessWave || 0;
    this.endlessScore = data?.endlessScore || 0;
    this.endlessMaxCombo = data?.endlessMaxCombo || 0;
    this.dailySpecials = data?.dailySpecials || this._calcDailySpecials();

    // ServiceScene에서 복귀 시 gold/lives 복원
    this._restoreGold = data?.gold;
    this._restoreLives = data?.lives;

    // 2. stageId를 '1-1'로 고정하여 super.create 호출
    //    (경로/맵은 1-1을 재사용, WaveManager는 교체할 것이므로 waves는 무시됨)
    super.create({ stageId: '1-1' });

    // 3. ServiceScene에서 복귀 시 gold/lives 복원 (super.create가 STARTING_GOLD/LIVES로 리셋하므로)
    if (this._restoreGold !== undefined && this._restoreGold !== null) {
      this.gold = this._restoreGold;
    }
    if (this._restoreLives !== undefined && this._restoreLives !== null) {
      this.lives = this._restoreLives;
    }
    this._updateHUD();

    // 4. super.create가 설정한 waveManager를 엔드리스 웨이브로 교체
    this._patchWaveManagerForEndless();
    this._prepareEndlessWave(this.endlessWave + 1);

    // ── Phase 11-3a: 엔드리스 튜토리얼 ──
    // super.create()가 생성한 _tutorial(battle)을 엔드리스 전용으로 덮어쓴다
    if (this._tutorial) {
      // 부모의 battle 튜토리얼이 아직 active이면 조용히 정리 (완료 기록 안 함)
      if (this._tutorial._container) {
        this._tutorial._container.destroy();
        this._tutorial._container = null;
      }
      this._tutorial._active = false;
    }
    this._tutorial = new TutorialManager(this, 'endless', [
      '1/3 \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC!\n\uC6E8\uC774\uBE0C\uAC00 \uB05D\uC5C6\uC774 \uC774\uC5B4\uC9D1\uB2C8\uB2E4.',
      '2/3 5\uC6E8\uC774\uBE0C\uB9C8\uB2E4\n\uC624\uB298\uC758 \uC2A4\uD398\uC15C \uB808\uC2DC\uD53C\uB85C \uC601\uC5C5!',
      '3/3 \uCD5C\uB300\uD55C \uC624\uB798 \uBC84\uD600\n\uB7AD\uD0B9\uC5D0 \uC774\uB984\uC744 \uC62C\uB9AC\uC138\uC694!',
    ]);
    // 타이머 기반 자동 진행: 2초 후 시작, 3초 간격 진행
    this.time.delayedCall(2000, () => {
      if (!this._tutorial) return;
      this._tutorial.start();
    });
    this.time.delayedCall(5000, () => {
      if (this._tutorial?.isActive()) this._tutorial.advance();
    });
    this.time.delayedCall(8000, () => {
      if (this._tutorial?.isActive()) this._tutorial.advance();
    });
  }

  // ── 데일리 시드 레시피 선정 ─────────────────────────────────────

  /**
   * 오늘의 스페셜 레시피 3종을 데일리 시드 기반으로 선정한다.
   * UTC 기준 일별 고정 결과를 반환한다.
   * @returns {string[]} 레시피 ID 배열 (최대 3종)
   * @private
   */
  _calcDailySpecials() {
    // seed = 오늘 날짜의 정수 인덱스 (UTC 기준)
    const seed = Math.floor(Date.now() / 86400000);

    // 서빙 레시피 해금 목록에서 선정
    const pool = RecipeManager.getUnlockedServingRecipes();
    if (pool.length <= 3) return pool.map(r => r.id);

    // seeded shuffle - LCG 방식 (Numerical Recipes 표준)
    let rng = seed;
    const rand = () => {
      rng = (rng * 1664525 + 1013904223) & 0xffffffff;
      return (rng >>> 0) / 0x100000000;
    };

    const indices = pool.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return [pool[indices[0]].id, pool[indices[1]].id, pool[indices[2]].id];
  }

  // ── WaveManager 몽키패치 (적 override 지원) ─────────────────────

  /**
   * WaveManager의 _buildSpawnQueue와 _spawnEnemy를 패치하여
   * 엔드리스 적의 hp/speed override를 지원한다.
   * WaveManager.js 원본 파일은 수정하지 않는다.
   * @private
   */
  _patchWaveManagerForEndless() {
    const wm = this.waveManager;

    // _buildSpawnQueue 패치: hp/speed override 데이터를 spawnQueue에 함께 저장
    wm._buildSpawnQueue = function (waveDef) {
      this._spawnQueue = [];
      this._totalToSpawn = 0;

      waveDef.enemies.forEach(group => {
        for (let i = 0; i < group.count; i++) {
          this._spawnQueue.push({
            type: group.type,
            delay: group.interval,
            hp: group.hp,
            speed: group.speed,
          });
          this._totalToSpawn++;
        }
      });

      this._spawnTimer = 0;
      this._spawnIndex = 0;
    };

    // _spawnEnemy 패치: override된 hp/speed를 Enemy에 전달
    const waypoints = wm._waypoints;
    const enemyGroup = wm.enemyGroup;
    const scene = wm.scene;

    wm._spawnEnemy = function (typeId, overrideHp, overrideSpeed) {
      const baseData = ENEMY_TYPES[typeId];
      if (!baseData) return;

      // override가 있으면 새 객체를 만들어 hp/speed 교체
      let enemyData = baseData;
      if (overrideHp !== undefined || overrideSpeed !== undefined) {
        enemyData = { ...baseData };
        if (overrideHp !== undefined) enemyData.hp = overrideHp;
        if (overrideSpeed !== undefined) enemyData.speed = overrideSpeed;
      }

      const enemy = new Enemy(scene, enemyData, waypoints);
      enemyGroup.add(enemy);
    };

    // update 패치: spawnQueue에서 hp/speed를 읽어 _spawnEnemy에 전달
    wm.update = function (delta) {
      if (!this.isActive) return;
      if (this._spawnIndex >= this._spawnQueue.length) return;

      this._spawnTimer += delta;
      const nextSpawn = this._spawnQueue[this._spawnIndex];

      if (this._spawnTimer >= nextSpawn.delay) {
        this._spawnEnemy(nextSpawn.type, nextSpawn.hp, nextSpawn.speed);
        this._spawnTimer = 0;
        this._spawnIndex++;
        this._enemiesSpawned++;
      }
    };
  }

  // ── 웨이브 교체 ─────────────────────────────────────────────────

  /**
   * 지정된 웨이브 번호의 적 구성으로 WaveManager 상태를 리셋한다.
   * @param {number} waveNumber - 1-based 웨이브 번호
   * @private
   */
  _prepareEndlessWave(waveNumber) {
    this.endlessWave = waveNumber;
    const waveDef = EndlessWaveGenerator.generateWave(waveNumber)[0];

    // WaveManager 상태 리셋 후 새 웨이브 주입
    this.waveManager._waves = [waveDef];
    this.waveManager.totalWaves = 1;
    this.waveManager.currentWave = 0;
    this.waveManager.isActive = false;
    this.waveManager.isAllWavesComplete = false;
    this.waveManager._spawnQueue = [];
    this.waveManager._spawnIndex = 0;

    // HUD 갱신
    this._updateHUD();
  }

  // ── _checkWaveProgress override ─────────────────────────────────

  /**
   * 웨이브 클리어 판정. 엔드리스 모드에서는 오더 판정 없이
   * 다음 웨이브로 진행하거나 ServiceScene으로 전환한다.
   * @override
   */
  _checkWaveProgress() {
    if (this.waitingForNextWave) return;
    if (!this.waveManager.isWaveCleared()) return;

    // 엔드리스는 오더 판정 없음, waveManager.isLastWave()는 항상 true
    // 승리 처리 대신 다음 웨이브
    this._onEndlessWaveCleared();
  }

  // ── 웨이브 클리어 처리 ──────────────────────────────────────────

  /**
   * 엔드리스 웨이브 클리어 시 보너스 지급, ServiceScene 전환 판단.
   * @private
   */
  _onEndlessWaveCleared() {
    // 웨이브 클리어 보너스 지급
    this.gold += WAVE_CLEAR_BONUS;
    this.endlessScore += WAVE_CLEAR_BONUS;
    this._updateHUD();

    // 5웨이브마다 ServiceScene으로 전환
    if (this.endlessWave % 5 === 0) {
      this._endlessServicePending = true;
      this._showMessage(`\uC6E8\uC774\uBE0C ${this.endlessWave} \uD074\uB9AC\uC5B4!\n\uC601\uC5C5 \uC2DC\uAC04\uC785\uB2C8\uB2E4!`, 2500);
      this.time.delayedCall(2800, () => this._transitionToService());
      return;
    }

    // 그 외: 다음 웨이브 준비
    this.waitingForNextWave = true;
    this._showMessage(`\uC6E8\uC774\uBE0C ${this.endlessWave} \uD074\uB9AC\uC5B4!`, 2000);
    this.time.delayedCall(1500, () => {
      this._setWaveButtonEnabled(true);
      this._prepareEndlessWave(this.endlessWave + 1);
      this.waitingForNextWave = false;
    });
  }

  // ── ServiceScene 전환 ───────────────────────────────────────────

  /**
   * ServiceScene으로 전환. 엔드리스 상태를 모두 전달한다.
   * @private
   */
  _transitionToService() {
    const total = this.inventoryManager.getTotal();
    const inv = this.inventoryManager.getAll();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ServiceScene', {
        inventory: inv,
        stageId: '1-1',
        gold: this.gold,
        lives: this.lives,
        isEndless: true,
        endlessWave: this.endlessWave,
        endlessScore: this.endlessScore,
        endlessMaxCombo: this.endlessMaxCombo,
        dailySpecials: this.dailySpecials,
        marketResult: {
          totalIngredients: total,
          livesRemaining: this.lives,
          livesMax: STARTING_LIVES,
        },
      });
    });
  }

  // ── _triggerVictory override ────────────────────────────────────

  /**
   * 엔드리스 모드에서는 "전 웨이브 클리어" 승리가 없으므로
   * 이 메서드가 호출되면 다음 웨이브로 진행한다.
   * @override
   */
  _triggerVictory() {
    // 엔드리스에서는 승리 없음 — _onEndlessWaveCleared로 처리됨
    this._onEndlessWaveCleared();
  }

  // ── _triggerGameOver override ───────────────────────────────────

  /**
   * 라이프 0 시 엔드리스 기록 저장 후 ResultScene으로 전환한다.
   * @override
   */
  _triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.vfx.screenFlash(0xff0000, 0.5, 300);

    // 엔드리스 기록 저장
    const newBests = SaveManager.saveEndlessRecord({
      wave: this.endlessWave,
      score: this.endlessScore,
      combo: this.endlessMaxCombo,
    });

    this.cameras.main.fadeOut(600, 100, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ResultScene', {
        isEndless: true,
        endlessWave: this.endlessWave,
        endlessScore: this.endlessScore,
        endlessMaxCombo: this.endlessMaxCombo,
        newBestWave: newBests.newBestWave,
        newBestScore: newBests.newBestScore,
        newBestCombo: newBests.newBestCombo,
      });
    });
  }

  // ── _updateHUD override ─────────────────────────────────────────

  /**
   * HUD 텍스트 갱신. waveText를 엔드리스 전용 형식으로 표시한다.
   * @override
   */
  _updateHUD() {
    super._updateHUD();
    if (this.waveText) {
      this.waveText.setText(`\u221E \uC6E8\uC774\uBE0C ${this.endlessWave || 0}`);
    }
  }

  // ── _onWaveStarted override ─────────────────────────────────────

  /**
   * 웨이브 시작 이벤트 핸들러 override.
   * 엔드리스 모드에서는 waveText를 엔드리스 형식으로 갱신한다.
   * @param {number} waveNum
   * @override
   */
  _onWaveStarted(waveNum) {
    // waveText를 엔드리스 형식으로 표시 (부모의 '웨이브 N/M' 형식 대신)
    if (this.waveText) {
      this.waveText.setText(`\u221E \uC6E8\uC774\uBE0C ${this.endlessWave}`);
    }
    this.waitingForNextWave = false;
    this._setWaveButtonEnabled(false);

    // SFX + VFX
    SoundManager.playSFX('sfx_wave_start');
    if (this.vfx) {
      this.vfx.waveAnnounce(this.endlessWave);
      this.vfx.screenFlash(0xffffff, 0.3, 200);
    }

    // 엔드리스에서는 오더 생성 안 함
  }

  // ── _onEnemyDied override ───────────────────────────────────────

  /**
   * 적 처치 시 점수 추적 및 웨이브 진행 체크.
   * 엔드리스 스코어에도 반영한다.
   * @param {Enemy} enemy
   * @override
   */
  _onEnemyDied(enemy) {
    this.score++;
    // 보스 처치 시 보상
    const bossReward = enemy.data_?.bossReward || 0;
    if (bossReward > 0) {
      this.endlessScore += bossReward;
    }

    // SFX + VFX
    SoundManager.playSFX('sfx_enemy_death');
    if (this.vfx && enemy && enemy.x !== undefined) {
      const isBoss = !!enemy.data_?.isBoss;
      const color = enemy.data_?.bodyColor || 0xffffff;
      this.vfx.enemyDeath(enemy.x, enemy.y, color, isBoss);
    }

    this._checkWaveProgress();
  }

  // ── shutdown override ───────────────────────────────────────────

  /**
   * 부모 shutdown 호출 후 엔드리스 전용 cleanup.
   * @override
   */
  shutdown() {
    super.shutdown();
    this.endlessWave = 0;
    this.endlessScore = 0;
    this.endlessMaxCombo = 0;
    this.dailySpecials = [];
    this._endlessServicePending = false;
  }
}
