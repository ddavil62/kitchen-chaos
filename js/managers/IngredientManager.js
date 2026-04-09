/**
 * @fileoverview 재료 매니저.
 * 적 처치 시 재료 드롭, 신선도 보너스, 인벤토리를 관리한다.
 */

import { FRESHNESS_WINDOW_MS } from '../config.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';

// 드롭 아이템 자동 수거 대기 시간 (ms)
const AUTO_COLLECT_DELAY = 8000;

/**
 * @typedef {object} IngredientDrop
 * @property {Phaser.GameObjects.Container} container - 화면 표시 오브젝트
 * @property {string} type - 재료 타입 ID
 * @property {number} count - 수량 (신선 보너스 시 2)
 * @property {number} autoTimer - 자동 수거 타이머 (ms)
 */

export class IngredientManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {Map<string, number>} 재료 인벤토리 { ingredientId: count } */
    this.inventory = {};
    Object.keys(INGREDIENT_TYPES).forEach(id => {
      this.inventory[id] = 0;
    });

    /** @type {IngredientDrop[]} 바닥에 떨어진 드롭 목록 */
    this.drops = [];

    // 인벤토리 변경 이벤트
    this.scene.events.on('enemy_died', this._onEnemyDied, this);
  }

  /**
   * 적 사망 이벤트 핸들러 - 재료 드롭 생성.
   * @private
   * @param {Enemy} enemy
   */
  _onEnemyDied(enemy) {
    const type = enemy.ingredientType;
    if (!type || !INGREDIENT_TYPES[type]) return;

    // 신선 보너스: 처치 시 신선도 타이머가 남아있으면 2개 드롭
    const count = enemy.isFresh ? 2 : 1;
    this._createDrop(enemy.x, enemy.y, type, count, enemy.isFresh);
  }

  /**
   * 바닥 드롭 오브젝트 생성.
   * @private
   */
  _createDrop(x, y, type, count, isFreshBonus) {
    const data = INGREDIENT_TYPES[type];
    const container = this.scene.add.container(x, y);
    container.setDepth(12);

    // 재료 아이콘 (작은 원)
    const icon = this.scene.add.circle(0, 0, 10, data.color);
    container.add(icon);

    // 수량 텍스트
    const label = this.scene.add.text(0, 14, `×${count}`, {
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);
    container.add(label);

    // 신선 보너스 표시 (별★)
    if (isFreshBonus) {
      const star = this.scene.add.text(12, -10, '★', {
        fontSize: '12px',
        color: '#ffff00',
        stroke: '#ff8800',
        strokeThickness: 2,
      }).setOrigin(0.5);
      container.add(star);
    }

    // 드롭 등장 애니메이션
    container.setScale(0.5);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      y: y - 20,
      duration: 300,
      ease: 'Back.Out',
    });

    // 탭 수거 인터랙션
    container.setSize(40, 40);
    container.setInteractive();
    container.on('pointerdown', () => {
      this._collectDrop(drop);
    });

    const drop = {
      container,
      type,
      count,
      autoTimer: AUTO_COLLECT_DELAY,
    };
    this.drops.push(drop);
  }

  /**
   * 드롭 수거 처리 - 인벤토리에 추가.
   * @private
   * @param {IngredientDrop} drop
   */
  _collectDrop(drop) {
    const idx = this.drops.indexOf(drop);
    if (idx === -1) return;

    this.drops.splice(idx, 1);
    this.inventory[drop.type] = (this.inventory[drop.type] || 0) + drop.count;

    // 수거 연출
    this.scene.tweens.add({
      targets: drop.container,
      y: drop.container.y - 30,
      alpha: 0,
      duration: 300,
      onComplete: () => drop.container.destroy(),
    });

    this.scene.events.emit('inventory_changed', this.inventory);
  }

  /**
   * 매 프레임 업데이트 - 자동 수거 타이머.
   * @param {number} delta - ms
   */
  update(delta) {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.autoTimer -= delta;
      if (drop.autoTimer <= 0) {
        this._collectDrop(drop);
      }
    }
  }

  /**
   * 인벤토리에서 재료를 소모한다.
   * @param {{ [ingredientId: string]: number }} required - 필요 재료
   * @returns {boolean} 소모 성공 여부
   */
  consume(required) {
    // 먼저 보유량 검사
    for (const [id, count] of Object.entries(required)) {
      if ((this.inventory[id] || 0) < count) return false;
    }
    // 소모
    for (const [id, count] of Object.entries(required)) {
      this.inventory[id] -= count;
    }
    this.scene.events.emit('inventory_changed', this.inventory);
    return true;
  }

  /**
   * 특정 레시피의 재료가 충분한지 확인.
   * @param {{ [ingredientId: string]: number }} required
   * @returns {boolean}
   */
  canCook(required) {
    return Object.entries(required).every(
      ([id, count]) => (this.inventory[id] || 0) >= count
    );
  }

  /**
   * 씬 종료 시 정리.
   */
  destroy() {
    this.scene.events.off('enemy_died', this._onEnemyDied, this);
    this.drops.forEach(d => d.container.destroy());
    this.drops = [];
  }
}
