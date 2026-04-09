/**
 * @fileoverview 타워 엔티티 클래스.
 * Phase 3: 배달 타워 비주얼 + 사거리/화상/둔화 버프 지원.
 */

import Phaser from 'phaser';
import { Projectile } from './Projectile.js';

export class Tower extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {object} towerData
   * @param {Phaser.GameObjects.Group} projectileGroup
   */
  constructor(scene, x, y, towerData, projectileGroup) {
    super(scene, x, y);
    this.scene = scene;
    this.data_ = towerData;
    this.projectileGroup = projectileGroup;

    // ── 스탯 ──
    this.baseDamage = towerData.damage;
    this.baseFireRate = towerData.fireRate;
    this.baseRange = towerData.range;
    this.range = towerData.range;
    this.damageMultiplier = 1.0;
    this.speedMultiplier = 1.0;
    this.rangeMultiplier = 1.0;
    this.burnMultiplier = 1.0;
    this.slowMultiplier = 1.0;

    this.shootTimer = 0;
    this._collectTimer = 0;

    this._buildVisual(towerData);

    scene.add.existing(this);
    this.setDepth(5);
  }

  /** @private */
  _buildVisual(data) {
    // 아이소메트릭에 맞게 약간 납작한 형태
    const body = this.scene.add.rectangle(0, 0, 28, 24, data.color);
    this.add(body);

    if (data.id === 'pan') {
      const pan = this.scene.add.circle(0, -2, 8, 0xa0a0a0);
      const handle = this.scene.add.rectangle(10, 3, 8, 3, 0x808080);
      this.add(pan);
      this.add(handle);
    } else if (data.id === 'salt') {
      const nozzle = this.scene.add.triangle(0, -14, -3, 0, 3, 0, 0, -7, 0xffffff);
      const body2 = this.scene.add.rectangle(0, -3, 10, 14, 0xddeeff);
      this.add(body2);
      this.add(nozzle);
    } else if (data.id === 'grill') {
      const grill = this.scene.add.rectangle(0, 2, 24, 16, 0x222222);
      const flame1 = this.scene.add.triangle(-5, -7, -3, 0, 3, 0, 0, -8, 0xff4500);
      const flame2 = this.scene.add.triangle(4, -5, -2, 0, 2, 0, 0, -6, 0xff8c00);
      this.add(grill);
      this.add(flame1);
      this.add(flame2);
    } else if (data.id === 'delivery') {
      // 배달 로봇: 초록 원 + 바퀴
      const botBody = this.scene.add.circle(0, -2, 10, 0x00cc88);
      const wheel1 = this.scene.add.circle(-8, 8, 4, 0x333333);
      const wheel2 = this.scene.add.circle(8, 8, 4, 0x333333);
      const antenna = this.scene.add.rectangle(0, -14, 2, 8, 0x00ff00);
      this.add(wheel1);
      this.add(wheel2);
      this.add(botBody);
      this.add(antenna);
    }

    // 범위 표시 원 (기본 숨김)
    this.rangeCircle = this.scene.add.circle(0, 0, this.range, 0xffffff, 0.08);
    this.rangeCircle.setVisible(false);
    this.add(this.rangeCircle);

    // 이름 텍스트
    const label = this.scene.add.text(0, 14, data.nameKo, {
      fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(label);
  }

  /**
   * 매 프레임 업데이트.
   * @param {number} time
   * @param {number} delta
   * @param {Phaser.GameObjects.Group} enemyGroup
   */
  update(time, delta, enemyGroup) {
    // 배달 타워는 발사하지 않음 — GameScene에서 수거 처리
    if (this.data_.id === 'delivery') return;

    const effectiveFireRate = this.baseFireRate / this.speedMultiplier;
    this.shootTimer += delta;

    if (this.shootTimer >= effectiveFireRate) {
      const target = this._findTarget(enemyGroup);
      if (target) {
        this._shoot(target);
        this.shootTimer = 0;
      }
    }
  }

  /** @private */
  _findTarget(enemyGroup) {
    let bestTarget = null;
    let bestProgress = -1;
    const effectiveRange = this.range * this.rangeMultiplier;

    enemyGroup.getChildren().forEach(enemy => {
      if (!enemy.active || enemy.isDead) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist > effectiveRange) return;

      const progress = enemy.waypointIndex;
      if (progress > bestProgress) {
        bestProgress = progress;
        bestTarget = enemy;
      }
    });

    return bestTarget;
  }

  /** @private */
  _shoot(target) {
    const projData = {
      ...this.data_,
      damage: Math.round(this.baseDamage * this.damageMultiplier),
    };
    // 화상/둔화 배율 적용
    if (projData.burnDamage) {
      projData.burnDamage = Math.round(projData.burnDamage * this.burnMultiplier);
    }
    if (projData.slowFactor) {
      projData.slowFactor = Math.max(0.1, projData.slowFactor * (1 - (this.slowMultiplier - 1) * 0.5));
    }

    const proj = new Projectile(this.scene, this.x, this.y, target, projData);
    this.projectileGroup.add(proj);

    this.scene.tweens.add({
      targets: this, alpha: 0.6,
      duration: 80, yoyo: true,
    });
  }

  /** @param {boolean} visible */
  showRange(visible) {
    this.rangeCircle.setVisible(visible);
  }

  /**
   * 버프 적용.
   * @param {string} type - 'speed'|'damage'|'both'|'range'|'burn'|'slow'
   * @param {number} value
   */
  applyBuff(type, value) {
    if (type === 'speed' || type === 'both') this.speedMultiplier = 1 + value;
    if (type === 'damage' || type === 'both') this.damageMultiplier = 1 + value;
    if (type === 'range') this.rangeMultiplier = 1 + value;
    if (type === 'burn') this.burnMultiplier = 1 + value;
    if (type === 'slow') this.slowMultiplier = 1 + value;
  }

  /** 버프 해제. */
  removeBuff() {
    this.speedMultiplier = 1.0;
    this.damageMultiplier = 1.0;
    this.rangeMultiplier = 1.0;
    this.burnMultiplier = 1.0;
    this.slowMultiplier = 1.0;
  }
}
