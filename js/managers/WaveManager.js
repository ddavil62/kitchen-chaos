/**
 * @fileoverview 웨이브 매니저.
 * 웨이브별 적 스폰 타이밍을 관리한다.
 */

import { WAVES } from '../data/gameData.js';
import { ENEMY_TYPES } from '../data/gameData.js';
import { Enemy } from '../entities/Enemy.js';

export class WaveManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Group} enemyGroup
   */
  constructor(scene, enemyGroup) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;

    this.currentWave = 0;        // 0 = 아직 시작 전
    this.totalWaves = WAVES.length;
    this.isActive = false;
    this.isAllWavesComplete = false;
    this._spawnQueue = [];        // 이번 웨이브 스폰 대기열
    this._spawnTimer = 0;
    this._enemiesSpawned = 0;
    this._totalToSpawn = 0;
  }

  /**
   * 다음 웨이브 시작.
   */
  startNextWave() {
    if (this.currentWave >= this.totalWaves) {
      this.isAllWavesComplete = true;
      return;
    }

    this.currentWave++;
    const waveDef = WAVES[this.currentWave - 1];
    this._buildSpawnQueue(waveDef);
    this.isActive = true;
    this._enemiesSpawned = 0;
    this.scene.events.emit('wave_started', this.currentWave);
  }

  /**
   * 웨이브 정의에서 스폰 대기열 구성.
   * 적 타입별 count와 interval을 시간순으로 플래튼한다.
   * @private
   * @param {object} waveDef
   */
  _buildSpawnQueue(waveDef) {
    this._spawnQueue = [];
    this._totalToSpawn = 0;

    // 각 적 그룹을 순차 스폰 대기열로 변환
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
   * @param {string} typeId
   */
  _spawnEnemy(typeId) {
    const enemyData = ENEMY_TYPES[typeId];
    if (!enemyData) return;

    const enemy = new Enemy(this.scene, enemyData);
    this.enemyGroup.add(enemy);
  }

  /**
   * 이번 웨이브의 스폰이 모두 완료되었는지 확인.
   * @returns {boolean}
   */
  isSpawnComplete() {
    return this._spawnIndex >= this._spawnQueue.length;
  }

  /**
   * 이번 웨이브가 완전히 종료되었는지 확인 (스폰 완료 + 모든 적 처치).
   * @returns {boolean}
   */
  isWaveCleared() {
    return this.isSpawnComplete() && this.enemyGroup.countActive() === 0;
  }

  /**
   * 마지막 웨이브인지 확인.
   * @returns {boolean}
   */
  isLastWave() {
    return this.currentWave >= this.totalWaves;
  }
}
