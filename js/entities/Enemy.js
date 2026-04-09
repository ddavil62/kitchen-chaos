/**
 * @fileoverview 적 엔티티 클래스.
 * 웨이포인트를 따라 이동하며 신선도 보너스 타이머를 관리한다.
 * Phase 3: 5종 적 비주얼 + 치즈 골렘 재생 + 아이소메트릭 depth.
 * Phase 4: 밀가루 유령(투명) + 빙결 상태이상.
 */

import Phaser from 'phaser';
import { PATH_WAYPOINTS, FRESHNESS_WINDOW_MS } from '../config.js';

export class Enemy extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} enemyData - ENEMY_TYPES의 적 데이터
   * @param {{x:number,y:number}[]} [waypoints] - 커스텀 웨이포인트 (없으면 기본)
   */
  constructor(scene, enemyData, waypoints) {
    const wp = waypoints || PATH_WAYPOINTS;
    const spawn = wp[0];
    super(scene, spawn.x, spawn.y);

    this.scene = scene;
    this.data_ = enemyData;
    /** @type {{x:number,y:number}[]} */
    this._waypoints = wp;

    // ── 스탯 ──
    this.hp = enemyData.hp;
    this.maxHp = enemyData.hp;
    this.speed = enemyData.speed;
    this.goldReward = 0;
    this.ingredientType = enemyData.ingredient;

    // ── 이동 상태 ──
    this.waypointIndex = 1;
    this.active = true;
    this.isDead = false;
    this.reachedBase = false;

    // ── 상태 이상 ──
    this.slowFactor = 1.0;
    this.slowTimer = 0;
    this.isBurning = false;
    this.burnTimer = 0;
    this.burnInterval = 0;
    this.burnIntervalTimer = 0;
    this.burnDamage = 0;

    // ── 빙결 ──
    this.isFrozen = false;
    this.freezeTimer = 0;

    // ── 투명 (밀가루 유령) ──
    this.isInvisible = !!enemyData.invisible;
    this.visibleTimer = 0;  // 피격 시 2초간 보임

    // ── 재생 (치즈 골렘) ──
    this.regenRate = enemyData.regenRate || 0;

    // ── 보스 소환 타이머 ──
    this._summonTimer = 0;
    this._enraged = false;

    // ── 신선도 타이머 ──
    this.freshnessTimer = FRESHNESS_WINDOW_MS;
    this.isFresh = true;

    // ── 비주얼 ──
    this._buildVisual(enemyData);

    // 투명 적: 기본 반투명
    if (this.isInvisible) this.setAlpha(0.3);

    scene.add.existing(this);
    this.setDepth(10 + Math.floor(spawn.y));
  }

  /**
   * 적 타입별 비주얼 생성.
   * @private
   */
  _buildVisual(data) {
    const color = data.bodyColor || 0xff6b35;
    const id = data.id;

    // 몸체
    if (id === 'pasta_boss') {
      // 보스: 40×40 금색 사각형
      const body = this.scene.add.rectangle(0, 0, 40, 40, color);
      this.add(body);
    } else if (id === 'cheese_golem') {
      // 골렘: 큰 사각형
      const body = this.scene.add.rectangle(0, 0, 28, 28, color);
      this.add(body);
    } else {
      // 기본: 원형
      const body = this.scene.add.circle(0, 0, id === 'meat_ogre' ? 18 : 14, color);
      this.add(body);
    }

    // 눈
    const eye1 = this.scene.add.circle(-4, -3, 2.5, 0xffffff);
    const eye2 = this.scene.add.circle(4, -3, 2.5, 0xffffff);
    this.add(eye1);
    this.add(eye2);

    // 타입별 장식
    if (id === 'carrot_goblin') {
      const leaf = this.scene.add.triangle(0, -18, -4, 0, 4, 0, 0, -8, 0x228b22);
      this.add(leaf);
    } else if (id === 'octopus_mage') {
      // 촉수 3개
      for (let i = -1; i <= 1; i++) {
        const t = this.scene.add.rectangle(i * 6, 12, 3, 8, 0x7b68ee);
        this.add(t);
      }
      // 마법사 모자
      const hat = this.scene.add.triangle(0, -18, -6, 0, 6, 0, 0, -10, 0x4b0082);
      this.add(hat);
    } else if (id === 'chili_demon') {
      // 뿔 2개
      const horn1 = this.scene.add.triangle(-6, -16, -2, 0, 2, 0, 0, -8, 0xff0000);
      const horn2 = this.scene.add.triangle(6, -16, -2, 0, 2, 0, 0, -8, 0xff0000);
      this.add(horn1);
      this.add(horn2);
    } else if (id === 'cheese_golem') {
      // 치즈 구멍 표시
      const hole1 = this.scene.add.circle(-4, 2, 3, 0xdaa520);
      const hole2 = this.scene.add.circle(6, -4, 2, 0xdaa520);
      this.add(hole1);
      this.add(hole2);
    } else if (id === 'flour_ghost') {
      // 유령 꼬리 (아래쪽 물결)
      const tail1 = this.scene.add.triangle(-5, 14, -3, 0, 3, 0, 0, 6, 0xfaebd7);
      const tail2 = this.scene.add.triangle(5, 14, -3, 0, 3, 0, 0, 6, 0xfaebd7);
      this.add(tail1);
      this.add(tail2);
    } else if (id === 'egg_sprite') {
      // 달걀 요정: 날개 + 후광
      const wing1 = this.scene.add.triangle(-12, -4, 0, -5, 0, 5, -8, 0, 0xffffcc);
      const wing2 = this.scene.add.triangle(12, -4, 0, -5, 0, 5, 8, 0, 0xffffcc);
      this.add(wing1);
      this.add(wing2);
    } else if (id === 'rice_slime') {
      // 밥 슬라임: 반짝이는 입자 표시
      const grain1 = this.scene.add.circle(-3, 5, 2, 0xeeeeee);
      const grain2 = this.scene.add.circle(4, 3, 2, 0xeeeeee);
      const grain3 = this.scene.add.circle(0, 8, 2, 0xeeeeee);
      this.add(grain1);
      this.add(grain2);
      this.add(grain3);
    } else if (id === 'pasta_boss') {
      // 보스: 면발 장식
      for (let i = -2; i <= 2; i++) {
        const noodle = this.scene.add.rectangle(i * 6, 20, 2, 12, 0xffd700);
        this.add(noodle);
      }
      const crown = this.scene.add.triangle(0, -24, -8, 0, 8, 0, 0, -10, 0xffaa00);
      this.add(crown);
    }

    // HP 바
    this.hpBarBg = this.scene.add.rectangle(0, -22, 26, 3, 0x333333);
    this.add(this.hpBarBg);
    this.hpBar = this.scene.add.rectangle(-13, -22, 26, 3, 0x44ff44);
    this.hpBar.setOrigin(0, 0.5);
    this.add(this.hpBar);

    // 신선도 바
    this.freshBg = this.scene.add.rectangle(0, -27, 26, 2, 0x222222);
    this.add(this.freshBg);
    this.freshBar = this.scene.add.rectangle(-13, -27, 26, 2, 0x00ff88);
    this.freshBar.setOrigin(0, 0.5);
    this.add(this.freshBar);
  }

  /**
   * 매 프레임 업데이트.
   * @param {number} time
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.isDead || !this.active) return;

    // ── 신선도 타이머 ──
    if (this.isFresh) {
      this.freshnessTimer -= delta;
      if (this.freshnessTimer <= 0) {
        this.isFresh = false;
        this.freshBar.setVisible(false);
        this.freshBg.setVisible(false);
      } else {
        const ratio = this.freshnessTimer / FRESHNESS_WINDOW_MS;
        this.freshBar.width = 26 * ratio;
        const r = Math.floor(255 * (1 - ratio));
        const g = Math.floor(255 * ratio);
        this.freshBar.setFillStyle(Phaser.Display.Color.GetColor(r, g, 0));
      }
    }

    // ── 빙결 ──
    if (this.isFrozen) {
      this.freezeTimer -= delta;
      if (this.freezeTimer <= 0) {
        this.isFrozen = false;
        this.setTint();  // 빙결 틴트 해제
      }
      // 빙결 중에는 이동/재생 불가, 화상 DoT만 적용
      if (this.isBurning) {
        this.burnTimer -= delta;
        this.burnIntervalTimer -= delta;
        if (this.burnIntervalTimer <= 0) {
          this.takeDamage(this.burnDamage);
          this.burnIntervalTimer = this.burnInterval;
        }
        if (this.burnTimer <= 0) this.isBurning = false;
      }
      return;
    }

    // ── 투명 타이머 ──
    if (this.isInvisible && this.visibleTimer > 0) {
      this.visibleTimer -= delta;
      if (this.visibleTimer <= 0) {
        this.setAlpha(0.3);  // 다시 투명
      }
    }

    // ── 슬로우 ──
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) this.slowFactor = 1.0;
    }

    // ── 화상 ──
    if (this.isBurning) {
      this.burnTimer -= delta;
      this.burnIntervalTimer -= delta;
      if (this.burnIntervalTimer <= 0) {
        this.takeDamage(this.burnDamage);
        this.burnIntervalTimer = this.burnInterval;
      }
      if (this.burnTimer <= 0) this.isBurning = false;
    }

    // ── 재생 (치즈 골렘) ──
    if (this.regenRate > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.regenRate * (delta / 1000));
      const ratio = this.hp / this.maxHp;
      this.hpBar.width = 26 * ratio;
    }

    // ── 보스 소환 ──
    if (this.data_.isBoss && this.data_.summonInterval) {
      this._summonTimer += delta;
      if (this._summonTimer >= this.data_.summonInterval) {
        this._summonTimer = 0;
        this.scene.events.emit('boss_summon', {
          type: this.data_.summonType,
          x: this.x, y: this.y,
        });
      }
      // 격노 (HP 50% 이하 → 속도 2배)
      if (!this._enraged && this.data_.enrageHpThreshold &&
          this.hp / this.maxHp <= this.data_.enrageHpThreshold) {
        this._enraged = true;
        this.speed = this.data_.speed * 2;
        this.setTint(0xff4444);
      }
    }

    // ── 이동 ──
    this._moveAlongPath(delta);
  }

  /** @private */
  _moveAlongPath(delta) {
    if (this.waypointIndex >= this._waypoints.length) {
      this._reachBase();
      return;
    }

    const target = this._waypoints[this.waypointIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * this.slowFactor * (delta / 1000);

    if (dist <= moveAmount) {
      this.x = target.x;
      this.y = target.y;
      this.waypointIndex++;
      if (this.waypointIndex >= this._waypoints.length) {
        this._reachBase();
      }
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }
  }

  /** @param {number} amount */
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.width = 26 * ratio;
    if (ratio < 0.4) this.hpBar.setFillStyle(0xff4444);
    else if (ratio < 0.7) this.hpBar.setFillStyle(0xffaa00);

    // 피격 시 투명 해제 (2초)
    if (this.isInvisible) {
      this.setAlpha(0.8);
      this.visibleTimer = 2000;
    }

    if (this.hp <= 0) this._die();
  }

  /** @param {number} factor @param {number} duration */
  applySlow(factor, duration) {
    if (factor <= this.slowFactor) {
      this.slowFactor = factor;
      this.slowTimer = duration;
    } else if (this.slowTimer <= 0) {
      this.slowFactor = factor;
      this.slowTimer = duration;
    }
  }

  /**
   * 빙결 상태 적용 (이동 정지 + 파란 틴트).
   * @param {number} duration - ms
   */
  applyFreeze(duration) {
    this.isFrozen = true;
    this.freezeTimer = duration;
    this.setTint(0x00bfff);
  }

  /** @param {number} damage @param {number} duration @param {number} interval */
  applyBurn(damage, duration, interval) {
    this.isBurning = true;
    this.burnDamage = damage;
    this.burnTimer = duration;
    this.burnInterval = interval;
    this.burnIntervalTimer = interval;
  }

  /** @private */
  _die() {
    if (this.isDead) return;
    this.isDead = true;
    this.active = false;

    // 분열 (egg_sprite): 10% 확률로 소형 분열체 생성
    if (this.data_.splitChance && Math.random() < this.data_.splitChance) {
      this.scene.events.emit('enemy_split', {
        type: this.data_.id,
        x: this.x, y: this.y,
        hp: this.data_.splitHp || 30,
        waypointIndex: this.waypointIndex,
      });
    }

    // 사망 시 주변 적 힐 (rice_slime)
    if (this.data_.healOnDeath) {
      this.scene.events.emit('enemy_death_heal', {
        x: this.x, y: this.y,
        healPercent: this.data_.healOnDeath,
        radius: this.data_.healRadius || 80,
      });
    }

    // 보스 처치 보상
    if (this.data_.bossReward) {
      this.scene.events.emit('boss_killed', { reward: this.data_.bossReward });
    }

    this.scene.events.emit('enemy_died', this);
    this.destroy();
  }

  /** @private */
  _reachBase() {
    if (this.reachedBase) return;
    this.reachedBase = true;
    this.isDead = true;
    this.active = false;
    this.scene.events.emit('enemy_reached_base', this);
    this.destroy();
  }
}
