/**
 * @fileoverview 타워 엔티티 클래스.
 * 범위 내 가장 앞선 적을 조준하고 발사체를 발사한다.
 */

import { Projectile } from './Projectile.js';

export class Tower extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - 월드 x (셀 중심)
   * @param {number} y - 월드 y (셀 중심)
   * @param {object} towerData - TOWER_TYPES의 타워 데이터
   * @param {Phaser.GameObjects.Group} projectileGroup
   */
  constructor(scene, x, y, towerData, projectileGroup) {
    super(scene, x, y);
    this.scene = scene;
    this.data_ = towerData;
    this.projectileGroup = projectileGroup;

    // ── 스탯 (버프 배율 적용 가능) ──
    this.baseDamage = towerData.damage;
    this.baseFireRate = towerData.fireRate;
    this.range = towerData.range;
    this.damageMultiplier = 1.0;
    this.speedMultiplier = 1.0;

    this.shootTimer = 0;

    this._buildVisual(towerData);

    scene.add.existing(this);
    this.setDepth(5);
  }

  /**
   * 타워 비주얼 생성.
   * @private
   */
  _buildVisual(data) {
    // 타워 몸체
    const body = this.scene.add.rectangle(0, 0, 32, 32, data.color);
    this.add(body);

    // 타워별 아이콘 표시
    if (data.id === 'pan') {
      // 프라이팬: 원형 + 손잡이
      const pan = this.scene.add.circle(0, -3, 10, 0xa0a0a0);
      const handle = this.scene.add.rectangle(12, 4, 10, 4, 0x808080);
      this.add(pan);
      this.add(handle);
    } else if (data.id === 'salt') {
      // 소금: 뾰족한 꼭대기
      const nozzle = this.scene.add.triangle(0, -16, -4, 0, 4, 0, 0, -8, 0xffffff);
      const body2 = this.scene.add.rectangle(0, -4, 12, 16, 0xddeeff);
      this.add(body2);
      this.add(nozzle);
    } else if (data.id === 'grill') {
      // 그릴: 검은 그릴 + 불꽃
      const grill = this.scene.add.rectangle(0, 2, 28, 20, 0x222222);
      const flame1 = this.scene.add.triangle(-6, -8, -4, 0, 4, 0, 0, -10, 0xff4500);
      const flame2 = this.scene.add.triangle(4, -6, -3, 0, 3, 0, 0, -8, 0xff8c00);
      this.add(grill);
      this.add(flame1);
      this.add(flame2);
    }

    // 범위 표시 원 (기본 숨김)
    this.rangeCircle = this.scene.add.circle(0, 0, this.range, 0xffffff, 0.08);
    this.rangeCircle.setVisible(false);
    this.add(this.rangeCircle);

    // 타워 이름 텍스트
    const label = this.scene.add.text(0, 18, data.nameKo, {
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(label);
  }

  /**
   * 매 프레임 업데이트 - 쿨다운 카운트 + 조준 + 발사.
   * @param {number} time
   * @param {number} delta - ms
   * @param {Phaser.GameObjects.Group} enemyGroup
   */
  update(time, delta, enemyGroup) {
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

  /**
   * 범위 내 가장 앞서 있는 적(웨이포인트 인덱스가 큰 적)을 선택.
   * @private
   * @param {Phaser.GameObjects.Group} enemyGroup
   * @returns {Enemy|null}
   */
  _findTarget(enemyGroup) {
    let bestTarget = null;
    let bestProgress = -1;

    enemyGroup.getChildren().forEach(enemy => {
      if (!enemy.active || enemy.isDead) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist > this.range) return;

      // 경로 진행도: waypointIndex + (현재 웨이포인트까지 남은 거리의 역수)
      const progress = enemy.waypointIndex;
      if (progress > bestProgress) {
        bestProgress = progress;
        bestTarget = enemy;
      }
    });

    return bestTarget;
  }

  /**
   * 발사체 생성.
   * @private
   * @param {Enemy} target
   */
  _shoot(target) {
    const projData = {
      ...this.data_,
      damage: Math.round(this.baseDamage * this.damageMultiplier),
    };
    const proj = new Projectile(this.scene, this.x, this.y, target, projData);
    this.projectileGroup.add(proj);

    // 발사 플래시 효과
    this.scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 80,
      yoyo: true,
    });
  }

  /**
   * 범위 원 표시/숨김.
   * @param {boolean} visible
   */
  showRange(visible) {
    this.rangeCircle.setVisible(visible);
  }

  /**
   * 버프 적용.
   * @param {string} type - 'speed' | 'damage' | 'both'
   * @param {number} value - 증가 비율 (0.3 = 30%)
   */
  applyBuff(type, value) {
    if (type === 'speed' || type === 'both') {
      this.speedMultiplier = 1 + value;
    }
    if (type === 'damage' || type === 'both') {
      this.damageMultiplier = 1 + value;
    }
  }

  /**
   * 버프 해제.
   */
  removeBuff() {
    this.speedMultiplier = 1.0;
    this.damageMultiplier = 1.0;
  }
}
