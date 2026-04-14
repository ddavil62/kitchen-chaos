/**
 * @fileoverview 발사체 엔티티 클래스.
 * 목표 적을 추적하여 이동하고 명중 시 피해를 입힌다.
 * Phase 19-1: wasabi_cannon 범위 공격(splashRadius) + spice_grinder DoT(dotDamage) 분기 추가.
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
    // 발사체 색상 결정: 냉동고=하늘색, 와사비 대포=연두, 향신료 그라인더=주황, 기본=노랑
    let color = 0xffff00;
    if (towerData.freezeDuration) color = 0x00bfff;
    else if (towerData.splashRadius) color = 0x7cfc00;
    else if (towerData.dotDamage) color = 0xff8c00;

    // 와사비 대포: 범위 무기 시각 구분 (크기 1.2배)
    const radius = towerData.splashRadius ? 6 : 5;
    super(scene, x, y, radius, 0, 360, false, color);
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
    this.freezeDuration = towerData.freezeDuration || 0;

    // ── Phase 19-1: 범위 공격 + 둔화 (wasabi_cannon) ──
    this.splashRadius = towerData.splashRadius || 0;
    this.slowRate = towerData.slowRate || 0;
    this.splashSlowDuration = towerData.slowDuration || 0;

    // ── Phase 19-1: DoT (spice_grinder) ──
    this.dotDamage = towerData.dotDamage || 0;
    this.dotDuration = towerData.dotDuration || 0;

    this.active = true;
  }

  /**
   * 타겟이 유효한지(존재 + 생존 + 미파괴) 확인.
   * @private
   * @returns {boolean}
   */
  _isTargetValid() {
    return this.target && !this.target.isDead && this.target.active && this.target.scene;
  }

  /**
   * 매 프레임 업데이트 - 목표 추적 이동.
   * @param {number} delta - ms
   */
  update(delta) {
    if (!this.active || !this._isTargetValid()) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * (delta / 1000);

    if (dist <= moveAmount + 5) {
      this._hit();
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }
  }

  /**
   * 명중 처리: 피해 + 상태이상 적용.
   * Phase 19-1: wasabi_cannon 범위 공격/둔화, spice_grinder DoT 분기 추가.
   * @private
   */
  _hit() {
    if (!this._isTargetValid()) {
      this.destroy();
      return;
    }

    // ── 기본 피해 적용 ──
    this.target.takeDamage(this.damage, this.towerType);

    // ── wasabi_cannon: 범위 공격 + 둔화 ──
    if (this.splashRadius > 0) {
      const hitX = this.target.x;
      const hitY = this.target.y;
      const splashDamage = Math.round(this.damage * 0.6);

      // 범위 내 다른 적 탐색 → splash 피해
      if (this.scene?.enemies) {
        this.scene.enemies.getChildren().forEach(enemy => {
          if (!enemy.active || enemy.isDead || enemy === this.target) return;
          const dist = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
          if (dist <= this.splashRadius) {
            enemy.takeDamage(splashDamage, this.towerType);
            // 범위 내 모든 적에게 둔화
            if (this.slowRate && !enemy.isDead) {
              enemy.applySlow(1 - this.slowRate, this.splashSlowDuration);
            }
          }
        });
      }

      // 히트된 적에게도 둔화
      if (this.slowRate && this._isTargetValid()) {
        this.target.applySlow(1 - this.slowRate, this.splashSlowDuration);
      }
    }

    // ── spice_grinder: DoT 적용 ──
    if (this.dotDamage && this._isTargetValid()) {
      this.target.applyDot(this.dotDamage, this.dotDuration);
    }

    // ── 기존 상태이상: 둔화 (salt 등, splashRadius가 없는 경우만) ──
    if (this.slowFactor && !this.splashRadius && this._isTargetValid()) {
      this.target.applySlow(this.slowFactor, this.slowDuration);
    }

    // ── 기존 상태이상: 화상 (grill) ──
    if (this.burnDamage && this._isTargetValid()) {
      this.target.applyBurn(this.burnDamage, this.burnDuration, this.burnInterval);
    }

    // ── 기존 상태이상: 빙결 (freezer) ──
    if (this.freezeDuration && this._isTargetValid()) {
      this.target.applyFreeze(this.freezeDuration);
    }

    this.destroy();
  }
}
