/**
 * @fileoverview 타워 엔티티 클래스.
 * Phase 3: 배달 타워 비주얼 + 사거리/화상/둔화 버프 지원.
 * Phase 4: 냉동고(빙결) + 수프 솥(오라) 타워.
 * Phase 9-4: 도형 → 스프라이트 이미지 교체 (fallback 유지).
 */

import Phaser from 'phaser';
import { Projectile } from './Projectile.js';
import { UpgradeManager } from '../managers/UpgradeManager.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

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

  /**
   * 타워 비주얼 생성.
   * Phase 9-4: 스프라이트 이미지가 있으면 사용, 없으면 도형 fallback.
   * @private
   */
  _buildVisual(data) {
    const spriteKey = `tower_${data.id}`;
    const hasSprite = SpriteLoader.hasTexture(this.scene, spriteKey);

    if (hasSprite) {
      // ── 스프라이트 이미지 사용 ──
      const sprite = this.scene.add.image(0, 0, spriteKey);
      // 타워: 68x68 → 32px
      const targetSize = 32;
      const scale = targetSize / sprite.width;
      sprite.setScale(scale);
      this.add(sprite);
      this._bodySprite = sprite;
    } else {
      // ── 도형 fallback ──
      this._buildShapeFallback(data);
    }

    // 범위 표시 원 (기본 숨김)
    this.rangeCircle = this.scene.add.circle(0, 0, this.range, 0xffffff, 0.08);
    this.rangeCircle.setVisible(false);
    this.add(this.rangeCircle);

    // 이름 텍스트
    const label = this.scene.add.text(0, 18, data.nameKo, {
      fontSize: '7px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0.5, 0);
    this.add(label);
  }

  /**
   * 도형 기반 fallback 비주얼 (스프라이트 미로드 시).
   * @param {object} data
   * @private
   */
  _buildShapeFallback(data) {
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
      const botBody = this.scene.add.circle(0, -2, 10, 0x00cc88);
      const wheel1 = this.scene.add.circle(-8, 8, 4, 0x333333);
      const wheel2 = this.scene.add.circle(8, 8, 4, 0x333333);
      const antenna = this.scene.add.rectangle(0, -14, 2, 8, 0x00ff00);
      this.add(wheel1);
      this.add(wheel2);
      this.add(botBody);
      this.add(antenna);
    } else if (data.id === 'freezer') {
      const box = this.scene.add.rectangle(0, 0, 22, 22, 0x00bfff);
      this.add(box);
    } else if (data.id === 'soup_pot') {
      const pot = this.scene.add.circle(0, 2, 12, 0x32cd32);
      this.add(pot);
    }
  }

  /**
   * 매 프레임 업데이트.
   * @param {number} time
   * @param {number} delta
   * @param {Phaser.GameObjects.Group} enemyGroup
   */
  update(time, delta, enemyGroup) {
    // 비전투 타워: 배달(수거)·수프솥(오라)은 발사하지 않음
    if (this.data_.id === 'delivery' || this.data_.id === 'soup_pot') return;

    // knife 업그레이드: 글로벌 공격속도 보너스
    const knifeBonus = UpgradeManager.getKnifeMultiplier();
    const effectiveFireRate = this.baseFireRate / (this.speedMultiplier * knifeBonus);
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
    const canSeeInvisible = this.data_.canTargetInvisible ||
                            this.data_.id === 'salt';  // 소금 분사기도 투명 적 타겟 가능

    enemyGroup.getChildren().forEach(enemy => {
      if (!enemy.active || enemy.isDead) return;

      // 투명 적: 타겟 불가 (피격으로 드러난 상태는 예외)
      if (enemy.isInvisible && enemy.visibleTimer <= 0 && !canSeeInvisible) return;

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

    // flame_chef 패시브: grill 타워 피해 보너스
    if (this.data_.id === 'grill') {
      projData.damage = Math.round(projData.damage * ChefManager.getGrillDamageBonus());
    }

    // 화상/둔화 배율 적용
    if (projData.burnDamage) {
      projData.burnDamage = Math.round(projData.burnDamage * this.burnMultiplier);
      // flame_chef 패시브: grill 화상 피해 보너스
      if (this.data_.id === 'grill') {
        projData.burnDamage = Math.round(projData.burnDamage * ChefManager.getGrillDamageBonus());
      }
    }
    if (projData.slowFactor) {
      projData.slowFactor = Math.max(0.1, projData.slowFactor * (1 - (this.slowMultiplier - 1) * 0.5));
    }

    // ice_chef 패시브: salt/freezer CC 지속시간 보너스
    const ccBonus = ChefManager.getCCDurationBonus();
    if (projData.slowDuration) {
      projData.slowDuration = Math.round(projData.slowDuration * ccBonus);
    }
    if (projData.freezeDuration) {
      projData.freezeDuration = Math.round(projData.freezeDuration * ccBonus);
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
