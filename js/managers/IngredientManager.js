/**
 * @fileoverview 재료 매니저.
 * GameScene 소속. 적 처치 시 재료 드롭, 신선도 보너스, 인벤토리를 관리한다.
 * 인벤토리 변동 시 GameEventBus로 RestaurantScene에 알린다.
 * Phase 9-4: 드롭 아이콘을 스프라이트 이미지로 교체 (fallback 유지).
 */

import { FRESHNESS_WINDOW_MS } from '../config.js';
import { INGREDIENT_TYPES } from '../data/gameData.js';
import { GameEventBus } from '../events/GameEventBus.js';
import { UpgradeManager } from './UpgradeManager.js';
import { SpriteLoader } from './SpriteLoader.js';

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
    /** @type {Object<string, number>} 재료 인벤토리 */
    this.inventory = {};
    Object.keys(INGREDIENT_TYPES).forEach(id => {
      this.inventory[id] = 0;
    });

    /** @type {IngredientDrop[]} 바닥에 떨어진 드롭 목록 */
    this.drops = [];

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

    const count = enemy.isFresh ? 2 : 1;
    this._createDrop(enemy.x, enemy.y, type, count, enemy.isFresh);
  }

  /**
   * 바닥 드롭 오브젝트 생성.
   * Phase 9-4: 스프라이트가 있으면 이미지, 없으면 색상 원 fallback.
   * @private
   */
  _createDrop(x, y, type, count, isFreshBonus) {
    const data = INGREDIENT_TYPES[type];
    const container = this.scene.add.container(x, y);
    container.setDepth(12);

    // 재료 아이콘: 스프라이트 우선, fallback은 색상 원
    const spriteKey = `ingredient_${type}`;
    if (SpriteLoader.hasTexture(this.scene, spriteKey)) {
      const icon = this.scene.add.image(0, 0, spriteKey);
      // 32x32 → 20px 표시 크기
      icon.setScale(20 / icon.width);
      container.add(icon);
    } else {
      const icon = this.scene.add.circle(0, 0, 10, data.color);
      container.add(icon);
    }

    const label = this.scene.add.text(0, 14, `×${count}`, {
      fontSize: '10px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0);
    container.add(label);

    if (isFreshBonus) {
      const star = this.scene.add.text(12, -10, '★', {
        fontSize: '12px', color: '#ffff00',
        stroke: '#ff8800', strokeThickness: 2,
      }).setOrigin(0.5);
      container.add(star);
    }

    container.setScale(0.5);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1, scaleY: 1, y: y - 20,
      duration: 300, ease: 'Back.Out',
    });

    container.setSize(40, 40);
    container.setInteractive();
    container.on('pointerdown', () => {
      this._collectDrop(drop);
    });

    const drop = { container, type, count, autoTimer: AUTO_COLLECT_DELAY };
    this.drops.push(drop);
  }

  /**
   * 드롭 수거 처리 - 인벤토리에 추가.
   * @private
   * @param {IngredientDrop} drop
   */
  /**
   * 재료 타입별 최대 보유량 (fridge 업그레이드 반영).
   * @returns {number}
   */
  getMaxInventory() {
    const base = 10;
    return base + UpgradeManager.getFridgeBonus();
  }

  _collectDrop(drop) {
    const idx = this.drops.indexOf(drop);
    if (idx === -1) return;

    this.drops.splice(idx, 1);
    const max = this.getMaxInventory();
    const current = this.inventory[drop.type] || 0;
    this.inventory[drop.type] = Math.min(current + drop.count, max);

    // 수거 위치 기록 (VFX용, container 파괴 전)
    const collectX = drop.container.x;
    const collectY = drop.container.y;

    // 수거 연출
    this.scene.tweens.add({
      targets: drop.container,
      y: drop.container.y - 30, alpha: 0,
      duration: 300,
      onComplete: () => drop.container.destroy(),
    });

    // 씬 내부 이벤트
    this.scene.events.emit('inventory_changed', this.inventory);
    // 오더 추적용 씬 이벤트 (수거 1건)
    this.scene.events.emit('ingredient_collected_for_order');
    // VFX용 위치 이벤트 (Phase 10-5)
    this.scene.events.emit('ingredient_collected_at', { x: collectX, y: collectY });
    // 크로스 씬 이벤트 (RestaurantScene에 알림)
    GameEventBus.emit('ingredient_collected', {
      type: drop.type,
      count: drop.count,
    });
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
   * @param {{ [ingredientId: string]: number }} required
   * @returns {boolean}
   */
  consume(required) {
    for (const [id, count] of Object.entries(required)) {
      if ((this.inventory[id] || 0) < count) return false;
    }
    for (const [id, count] of Object.entries(required)) {
      this.inventory[id] -= count;
    }
    this.scene.events.emit('inventory_changed', this.inventory);
    // RestaurantScene에 재료 변동 알림
    GameEventBus.emit('ingredient_collected', {});
    return true;
  }

  /**
   * 특정 레시피의 재료가 충분한지 확인.
   * 레시피 객체({ ingredients: {...} }) 또는 plain 맵 모두 지원.
   * @param {{ ingredients?: object }|{ [id: string]: number }} recipeOrRequired
   * @returns {boolean}
   */
  canCook(recipeOrRequired) {
    const required = recipeOrRequired.ingredients || recipeOrRequired;
    return Object.entries(required).every(
      ([id, count]) => (this.inventory[id] || 0) >= count
    );
  }

  destroy() {
    this.scene.events.off('enemy_died', this._onEnemyDied, this);
    this.drops.forEach(d => d.container.destroy());
    this.drops = [];
  }
}
