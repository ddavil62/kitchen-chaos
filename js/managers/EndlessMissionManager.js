/**
 * @fileoverview 엔드리스 모드 정화 임무 매니저.
 * Phase 55-3: 매 웨이브 시작 시 4종 임무 중 1개를 무작위 활성화하고,
 * 웨이브 종료 시 성공/실패를 판정하여 보상을 지급한다.
 * 보스 웨이브 및 폭풍 웨이브에서는 임무를 활성화하지 않는다.
 */

import { SaveManager } from './SaveManager.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';

// ── 임무 정의 ──

/**
 * @typedef {'mission_speed_kill'|'mission_no_leak'|'mission_combo'|'mission_boss_escort'} MissionId
 */

/** 비보스 웨이브에서 선택 가능한 임무 (보스가 없으므로 speed_kill, boss_escort 제외) */
const NORMAL_WAVE_MISSIONS = ['mission_no_leak', 'mission_combo'];

/** 보스 웨이브에서 선택 가능한 임무 */
const BOSS_WAVE_MISSIONS = ['mission_speed_kill', 'mission_no_leak', 'mission_combo', 'mission_boss_escort'];

// ── 유틸리티 ──

/**
 * 배열에서 랜덤으로 count개를 중복 없이 선택한다.
 * @param {any[]} arr
 * @param {number} count
 * @returns {any[]}
 */
function pickRandom(arr, count) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ── EndlessMissionManager ──

export class EndlessMissionManager {
  /**
   * @param {import('../scenes/EndlessScene.js').EndlessScene} scene - 오너 씬 레퍼런스
   */
  constructor(scene) {
    this._scene = scene;

    /** @type {boolean} 현재 임무 활성 여부 */
    this._active = false;
    /** @type {MissionId|null} 현재 임무 ID */
    this._missionId = null;
    /** @type {number} 연속 처치 카운트 */
    this._comboCount = 0;
    /** @type {number} 최대 콤보 (웨이브 내) */
    this._maxCombo = 0;
    /** @type {boolean} 라이프 손실 발생 여부 */
    this._lifeLeaked = false;
    /** @type {number|null} 보스 등장 시각 (Date.now()) */
    this._bossKillTime = null;
    /** @type {boolean} 보스 처치 완료 여부 */
    this._bossKilled = false;
    /** @type {number} 호위대 처치 수 */
    this._escortKilled = 0;
    /** @type {number} 호위대 전체 수 */
    this._escortTotal = 0;
    /** @type {boolean} 보스 웨이브 여부 */
    this._isBossWave = false;
  }

  // ── 공개 API ──

  /**
   * 웨이브 시작 시 임무를 선택하고 초기화한다.
   * 폭풍 웨이브에서는 임무를 활성화하지 않는다 (폭풍 이벤트 자체가 보상 제공).
   * @param {number} waveNumber
   * @param {boolean} isBossWave
   * @param {boolean} isStormWave
   */
  startMission(waveNumber, isBossWave, isStormWave) {
    this.reset();

    // 폭풍 웨이브: 임무 비활성
    if (isStormWave) return;

    this._isBossWave = isBossWave;
    const pool = isBossWave ? BOSS_WAVE_MISSIONS : NORMAL_WAVE_MISSIONS;
    this._missionId = pool[Math.floor(Math.random() * pool.length)];
    this._active = true;

    // 보스 웨이브 호위대 수 계산 (EndlessWaveGenerator 구조 기준: 호위 그룹은 첫 번째 enemy 그룹)
    if (isBossWave && this._missionId === 'mission_boss_escort') {
      // 호위 적은 5마리 (EndlessWaveGenerator.generateWave 보스 웨이브 참조)
      this._escortTotal = 5;
    }
  }

  /**
   * 적 처치 시 콤보/호위대 카운트 업데이트.
   * @param {object} enemy - 처치된 적 인스턴스 (enemy.data_ 참조)
   */
  onEnemyKilled(enemy) {
    if (!this._active) return;

    const isBoss = !!(enemy?.data_?.isBoss || enemy?.data_?.isMidBoss);

    // 콤보 카운트 (모든 임무에서 추적, mission_combo에서 판정 사용)
    this._comboCount++;
    if (this._comboCount > this._maxCombo) {
      this._maxCombo = this._comboCount;
    }

    // mission_speed_kill: 보스 등장 시각 기록 + 보스 처치 시각 기록
    if (this._missionId === 'mission_speed_kill' && isBoss) {
      this._bossKilled = true;
    }

    // mission_boss_escort: 호위 적 처치 카운트 (보스 아닌 적)
    if (this._missionId === 'mission_boss_escort') {
      if (isBoss) {
        this._bossKilled = true;
      } else {
        this._escortKilled++;
      }
    }
  }

  /**
   * 라이프 손실 이벤트 수신. 콤보도 리셋한다.
   */
  onLifeLost() {
    if (!this._active) return;
    this._lifeLeaked = true;
    // 적이 통과하면 콤보 리셋
    this._comboCount = 0;
  }

  /**
   * 보스가 스폰된 시각을 기록한다. EndlessScene에서 보스 스폰 시 호출.
   * speed_kill 임무의 시간 제한 판정에 사용.
   */
  markBossSpawned() {
    if (this._active && this._missionId === 'mission_speed_kill') {
      this._bossKillTime = Date.now();
    }
  }

  /**
   * 웨이브 종료 시 임무 성공/실패 판정 및 보상 지급.
   * @returns {{ success: boolean, missionId: string|null, reward: object|null }|null}
   */
  evaluateAndReward() {
    if (!this._active || !this._missionId) {
      return null;
    }

    let success = false;

    switch (this._missionId) {
      case 'mission_speed_kill':
        // 보스 처치를 30초 이내에 완료
        if (this._bossKilled && this._bossKillTime !== null) {
          const elapsed = (Date.now() - this._bossKillTime) / 1000;
          success = elapsed <= 30;
        }
        break;

      case 'mission_no_leak':
        // 해당 웨이브에서 라이프 손실 0
        success = !this._lifeLeaked;
        break;

      case 'mission_combo':
        // 해당 웨이브에서 10연속 처치 콤보 달성
        success = this._maxCombo >= 10;
        break;

      case 'mission_boss_escort':
        // 호위 적 전멸 후 보스 처치
        success = this._bossKilled && (this._escortKilled >= this._escortTotal);
        break;
    }

    if (success) {
      this._grantReward(this._missionId);
    }

    return {
      success,
      missionId: this._missionId,
      reward: success ? this._getRewardDescription(this._missionId) : null,
    };
  }

  /**
   * HUD용 현재 임무 상태 문자열 반환.
   * @returns {string}
   */
  getStatusText() {
    if (!this._active || !this._missionId) return '';

    switch (this._missionId) {
      case 'mission_speed_kill':
        return '임무: 신속 처단 (30초 내 보스 처치)';
      case 'mission_no_leak':
        return '임무: 완벽 방어 (라이프 손실 0)';
      case 'mission_combo':
        return `임무: 연속 처치 (${this._maxCombo}/10)`;
      case 'mission_boss_escort':
        return `임무: 호위대 섬멸 (${this._escortKilled}/${this._escortTotal})`;
      default:
        return '';
    }
  }

  /**
   * 임무 상태 초기화. 웨이브 종료 후 또는 shutdown 시 호출.
   */
  reset() {
    this._active = false;
    this._missionId = null;
    this._comboCount = 0;
    this._maxCombo = 0;
    this._lifeLeaked = false;
    this._bossKillTime = null;
    this._bossKilled = false;
    this._escortKilled = 0;
    this._escortTotal = 0;
    this._isBossWave = false;
  }

  // ── 내부 메서드 ──

  /**
   * 임무 성공 시 보상을 지급한다.
   * @param {MissionId} missionId
   * @private
   */
  _grantReward(missionId) {
    switch (missionId) {
      case 'mission_speed_kill': {
        // 재료 3종 각 1개 랜덤 지급
        const allIngredients = Object.keys(INGREDIENT_TYPES);
        const picked = pickRandom(allIngredients, 3);
        const gifts = {};
        picked.forEach(id => { gifts[id] = 1; });
        SaveManager.addGiftIngredients(gifts);
        break;
      }

      case 'mission_no_leak':
        // 미력의 정수 +15
        SaveManager.addMireukEssence(15);
        break;

      case 'mission_combo':
        // 골드 +500
        SaveManager.setGold(SaveManager.getGold() + 500);
        break;

      case 'mission_boss_escort':
        // 미력의 정수 +30
        SaveManager.addMireukEssence(30);
        break;
    }
  }

  /**
   * 보상 설명 객체를 반환한다 (UI 표시용).
   * @param {MissionId} missionId
   * @returns {object}
   * @private
   */
  _getRewardDescription(missionId) {
    switch (missionId) {
      case 'mission_speed_kill':
        return { type: 'ingredients', amount: 3 };
      case 'mission_no_leak':
        return { type: 'mireukEssence', amount: 15 };
      case 'mission_combo':
        return { type: 'gold', amount: 500 };
      case 'mission_boss_escort':
        return { type: 'mireukEssence', amount: 30 };
      default:
        return null;
    }
  }
}
