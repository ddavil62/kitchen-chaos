/**
 * @fileoverview 발사체 엔티티 클래스.
 * 목표 적을 추적하여 이동하고 명중 시 피해를 입힌다.
 */

import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Arc {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Enemy} target - 목표 적
   * @param {object} towerData - 타워 데이터 (damage, projectileSpeed 등)
   */
  constructor(scene, x, y, target, towerData) {
    super(scene, x, y, 5, 0xffff00);
    scene.add.existing(this);
    this.setDepth(15);

    this.target = target;
    this.speed = towerData.projectileSpeed;
    this.damage = towerData.damage;
    this.towerType = towerData.id;

    // 타워별 추가 효과
    this.slowFactor = towerData.slowFactor || null;
    this.slowDuration = towerData.slowDuration || 0;
    this.burnDamage = towerData.burnDamage || 0;
    this.burnDuration = towerData.burnDuration || 0;
    this.burnInterval = towerData.burnInterval || 500;

    this.active = true;
  }

  /**
   * 매 프레임 업데이트 - 목표 추적 이동.
   * @param {number} delta - ms
   */
  update(delta) {
    if (!this.active || !this.target || this.target.isDead || !this.target.active) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * (delta / 1000);

    if (dist <= moveAmount + 5) {
      // 명중
      this._hit();
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }
  }

  /**
   * 명중 처리: 피해 + 상태이상 적용.
   * @private
   */
  _hit() {
    if (!this.target || this.target.isDead) {
      this.destroy();
      return;
    }

    this.target.takeDamage(this.damage);

    if (this.slowFactor && !this.target.isDead) {
      this.target.applySlow(this.slowFactor, this.slowDuration);
    }

    if (this.burnDamage && !this.target.isDead) {
      this.target.applyBurn(this.burnDamage, this.burnDuration, this.burnInterval);
    }

    this.destroy();
  }
}
