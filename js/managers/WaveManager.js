/**
 * @fileoverview 웨이브 매니저.
 * Phase 4: 스테이지별 커스텀 웨이브/웨이포인트 지원.
 */

import { WAVES } from '../data/gameData.js';
import { ENEMY_TYPES } from '../data/gameData.js';
import { Enemy } from '../entities/Enemy.js';

export class WaveManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Group} enemyGroup
   * @param {object} [options]
   * @param {object[]} [options.waves] - 커스텀 웨이브 배열 (없으면 기본 WAVES 사용)
   * @param {{x:number,y:number}[]} [options.waypoints] - 커스텀 웨이포인트 (없으면 기본)
   */
  constructor(scene, enemyGroup, options = {}) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;

    this._waves = options.waves || WAVES;
    this._waypoints = options.waypoints || null;

    this.currentWave = 0;
    this.totalWaves = this._waves.length;
    this.isActive = false;
    this.isAllWavesComplete = false;
    this._spawnQueue = [];
    this._spawnTimer = 0;
    this._enemiesSpawned = 0;
    this._totalToSpawn = 0;
  }

  /** 다음 웨이브 시작 */
  startNextWave() {
    if (this.currentWave >= this.totalWaves) {
      this.isAllWavesComplete = true;
      return;
    }

    this.currentWave++;
    const waveDef = this._waves[this.currentWave - 1];
    this._buildSpawnQueue(waveDef);
    this.isActive = true;
    this._enemiesSpawned = 0;
    this.scene.events.emit('wave_started', this.currentWave);
  }

  /**
   * 웨이브 정의에서 스폰 대기열 구성.
   * __pause__ 타입은 실제 스폰 없이 딜레이만 소비한다.
   * @private
   */
  _buildSpawnQueue(waveDef) {
    this._spawnQueue = [];
    this._totalToSpawn = 0;

    waveDef.enemies.forEach(group => {
      // Phase 58: 적 수 0.6배 압축 (최소 1마리, __pause__ 제외)
      // Phase 79: tutorialWave 플래그가 있는 그룹은 압축 면제 (정확한 수 스폰)
      const count = group.type === '__pause__'
        ? group.count
        : group.tutorialWave
          ? group.count
          : Math.max(1, Math.round(group.count * 0.6));
      for (let i = 0; i < count; i++) {
        const entry = { type: group.type, delay: group.interval };
        // Phase 26-1: hpOverride 스폰 파라미터 전달
        if (group.hpOverride) entry.hpOverride = group.hpOverride;
        this._spawnQueue.push(entry);
        // __pause__는 실제 적이 아니므로 총 스폰 수에서 제외
        if (group.type !== '__pause__') this._totalToSpawn++;
      }
    });

    this._spawnTimer = 0;
    this._spawnIndex = 0;
  }

  /**
   * 매 프레임 업데이트 - 스폰 타이머 관리.
   * @param {number} delta - ms
   */
  update(delta) {
    if (!this.isActive) return;
    if (this._spawnIndex >= this._spawnQueue.length) return;

    this._spawnTimer += delta;
    const nextSpawn = this._spawnQueue[this._spawnIndex];

    if (this._spawnTimer >= nextSpawn.delay) {
      // __pause__는 딜레이만 소비하고 스폰 없이 넘어간다
      if (nextSpawn.type !== '__pause__') {
        this._spawnEnemy(nextSpawn.type, nextSpawn.hpOverride ? { hpOverride: nextSpawn.hpOverride } : undefined);
        this._enemiesSpawned++;
      }
      this._spawnTimer = 0;
      this._spawnIndex++;
    }
  }

  /**
   * 여러 웨이브 배열을 단일 웨이브로 병합한다.
   * 각 원래 웨이브 사이에 gapMs 만큼의 무스폰 구간(__pause__)을 삽입한다.
   * @param {object[]} waves - stageData.waves 배열
   * @param {number} [gapMs=5000] - 웨이브 간 갭 (ms)
   * @returns {object[]} 단일 요소 배열 (WaveManager 생성자 형식)
   */
  static mergeWaves(waves, gapMs = 2000) {
    const mergedEnemies = [];
    waves.forEach((wave, idx) => {
      // 두 번째 웨이브부터 갭 삽입
      if (idx > 0) {
        mergedEnemies.push({ type: '__pause__', count: 1, interval: gapMs });
      }
      mergedEnemies.push(...wave.enemies);
    });
    return [{ wave: 1, enemies: mergedEnemies }];
  }

  /**
   * 적 스폰.
   * @param {string} typeId - ENEMY_TYPES 키
   * @param {object} [spawnData] - 스폰 파라미터 (hpOverride 등)
   * @private
   */
  _spawnEnemy(typeId, spawnData) {
    const enemyData = ENEMY_TYPES[typeId];
    if (!enemyData) return;

    const enemy = new Enemy(this.scene, enemyData, this._waypoints, spawnData);
    this.enemyGroup.add(enemy);
  }

  /** 스폰 완료 여부 */
  isSpawnComplete() {
    return this._spawnIndex >= this._spawnQueue.length;
  }

  /** 웨이브 완전 종료 여부 (스폰 완료 + 모든 적 처치) */
  isWaveCleared() {
    return this.isSpawnComplete() && this.enemyGroup.countActive() === 0;
  }

  /** 마지막 웨이브 여부 */
  isLastWave() {
    return this.currentWave >= this.totalWaves;
  }
}
