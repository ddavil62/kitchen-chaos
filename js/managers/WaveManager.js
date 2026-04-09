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
   * @private
   */
  _buildSpawnQueue(waveDef) {
    this._spawnQueue = [];
    this._totalToSpawn = 0;

    waveDef.enemies.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this._spawnQueue.push({ type: group.type, delay: group.interval });
        this._totalToSpawn++;
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
      this._spawnEnemy(nextSpawn.type);
      this._spawnTimer = 0;
      this._spawnIndex++;
      this._enemiesSpawned++;
    }
  }

  /**
   * 적 스폰.
   * @private
   */
  _spawnEnemy(typeId) {
    const enemyData = ENEMY_TYPES[typeId];
    if (!enemyData) return;

    const enemy = new Enemy(this.scene, enemyData, this._waypoints);
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
