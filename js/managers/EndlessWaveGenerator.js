/**
 * @fileoverview 엔드리스 모드 무한 웨이브 생성기.
 * 웨이브 번호를 입력받아 해당 웨이브의 적 구성 객체를 반환하는 순수 로직 모듈.
 * WaveManager에 options.waves로 주입하여 사용한다.
 * Phase 11-1: 엔드리스 모드 도입.
 * Phase 30: 그룹2 적 10종(POOL_TIER_5, 웨이브 21+) + 보스 3종(sake_oni, sake_master, dragon_wok) 통합.
 */

import { ENEMY_TYPES } from '../data/gameData.js';

// ── 적 풀 구성 (웨이브 구간별) ──

/** 1~5 웨이브 기본 적 풀 */
const POOL_TIER_1 = ['carrot_goblin', 'meat_ogre', 'octopus_mage', 'chili_demon', 'cheese_golem'];

/** 6~10 웨이브 추가 적 */
const POOL_TIER_2 = ['flour_ghost', 'egg_sprite', 'rice_slime'];

/** 11~15 웨이브 추가 적 */
const POOL_TIER_3 = ['fish_knight', 'mushroom_scout', 'cheese_rat', 'shrimp_samurai', 'tomato_bomber', 'butter_ghost'];

/** 16~20 웨이브 추가 적 */
const POOL_TIER_4 = ['sugar_fairy', 'milk_phantom'];

/** 21+ 웨이브 추가 적 (그룹2: 일식·중식·양식 적) */
const POOL_TIER_5 = [
  'sushi_ninja', 'tempura_monk', 'sake_specter', 'oni_minion',
  'dumpling_warrior', 'wok_phantom', 'shadow_dragon_spawn', 'wok_guardian',
  'wine_specter', 'foie_gras_knight',
];

/** 보스 풀 (전 구간 공통) */
const BOSS_POOL = [
  'pasta_boss', 'dragon_ramen', 'seafood_kraken',
  'lava_dessert_golem', 'master_patissier', 'cuisine_god',
  'sake_oni', 'sake_master', 'dragon_wok',
];

// ── 기본 적 수 (비보스 웨이브에서 랜덤 구성용) ──

/** 웨이브당 적 그룹 수 (2~3그룹) */
const MIN_GROUPS = 2;
const MAX_GROUPS = 3;

/** 그룹당 기본 적 수 범위 */
const BASE_COUNT_MIN = 3;
const BASE_COUNT_MAX = 8;

/** 그룹별 스폰 간격 범위 (ms) */
const INTERVAL_MIN = 800;
const INTERVAL_MAX = 2500;

export class EndlessWaveGenerator {
  /**
   * 웨이브 번호에 해당하는 웨이브 정의 배열을 반환한다.
   * WaveManager의 options.waves 자리에 삽입 가능한 형식(배열)을 반환.
   * 적의 hp/speed는 ENEMY_TYPES 기본값에 배율을 곱하여 미리 계산한다.
   * @param {number} waveNumber - 1-based 웨이브 번호
   * @returns {object[]} WaveManager._buildSpawnQueue가 처리하는 waveDef 형식의 배열 (길이 1)
   */
  static generateWave(waveNumber) {
    // 난이도 배율 공식
    const hpMultiplier = 1 + (waveNumber - 1) * 0.12;
    const speedMultiplier = Math.min(2.0, 1 + (waveNumber - 1) * 0.02);
    const countMultiplier = 1 + Math.floor(waveNumber / 5) * 0.15;

    const pool = EndlessWaveGenerator._getEnemyPool(waveNumber);
    const isBoss = EndlessWaveGenerator.isBossWave(waveNumber);

    /** @type {object[]} */
    const enemies = [];

    if (isBoss) {
      // 보스 웨이브: 일반 적 호위 + 보스 1체
      // 호위 적: 풀에서 랜덤 1종, 5체
      const escortType = pool[Math.floor(Math.random() * pool.length)];
      const escortData = ENEMY_TYPES[escortType];
      if (escortData) {
        enemies.push({
          type: escortType,
          count: 5,
          interval: 1000,
          hpMultiplier,
          speedMultiplier,
          hp: Math.round(escortData.hp * hpMultiplier),
          speed: Math.round(escortData.speed * speedMultiplier),
        });
      }

      // 보스: 랜덤 1종
      const bossType = EndlessWaveGenerator._pickRandomBoss();
      const bossData = ENEMY_TYPES[bossType];
      if (bossData) {
        enemies.push({
          type: bossType,
          count: 1,
          interval: 5000,
          hpMultiplier: hpMultiplier * 1.5,
          speedMultiplier,
          hp: Math.round(bossData.hp * hpMultiplier * 1.5),
          speed: Math.round(bossData.speed * speedMultiplier),
        });
      }
    } else {
      // 일반 웨이브: 2~3 그룹의 적 배치
      const groupCount = MIN_GROUPS + Math.floor(Math.random() * (MAX_GROUPS - MIN_GROUPS + 1));

      for (let g = 0; g < groupCount; g++) {
        const type = pool[Math.floor(Math.random() * pool.length)];
        const baseData = ENEMY_TYPES[type];
        if (!baseData) continue;

        const baseCount = BASE_COUNT_MIN + Math.floor(Math.random() * (BASE_COUNT_MAX - BASE_COUNT_MIN + 1));
        const count = Math.ceil(baseCount * countMultiplier);
        const interval = INTERVAL_MIN + Math.floor(Math.random() * (INTERVAL_MAX - INTERVAL_MIN + 1));

        enemies.push({
          type,
          count,
          interval,
          hpMultiplier,
          speedMultiplier,
          hp: Math.round(baseData.hp * hpMultiplier),
          speed: Math.round(baseData.speed * speedMultiplier),
        });
      }
    }

    return [{
      wave: waveNumber,
      enemies,
    }];
  }

  /**
   * 웨이브 번호에 따라 사용할 적 타입 풀을 반환한다.
   * @param {number} waveNumber
   * @returns {string[]} 적 타입 ID 배열
   * @private
   */
  static _getEnemyPool(waveNumber) {
    let pool = [...POOL_TIER_1];
    if (waveNumber >= 6) pool = pool.concat(POOL_TIER_2);
    if (waveNumber >= 11) pool = pool.concat(POOL_TIER_3);
    if (waveNumber >= 16) pool = pool.concat(POOL_TIER_4);
    if (waveNumber >= 21) pool = pool.concat(POOL_TIER_5);
    return pool;
  }

  /**
   * 보스 웨이브(10의 배수)인지 확인한다.
   * @param {number} waveNumber
   * @returns {boolean}
   */
  static isBossWave(waveNumber) {
    return waveNumber > 0 && waveNumber % 10 === 0;
  }

  /**
   * 보스 풀에서 랜덤 1종을 반환한다. Math.random() 사용.
   * @returns {string} 보스 타입 ID
   * @private
   */
  static _pickRandomBoss() {
    return BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)];
  }
}
