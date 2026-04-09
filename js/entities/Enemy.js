/**
 * @fileoverview 적 엔티티 클래스.
 * 웨이포인트를 따라 이동하며 신선도 보너스 타이머를 관리한다.
 * Phase 3: 5종 적 비주얼 + 치즈 골렘 재생 + 아이소메트릭 depth.
 */

import Phaser from 'phaser';
import { PATH_WAYPOINTS, FRESHNESS_WINDOW_MS } from '../config.js';

export class Enemy extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} enemyData - ENEMY_TYPES의 적 데이터
   */
  constructor(scene, enemyData) {
    const spawn = PATH_WAYPOINTS[0];
    super(scene, spawn.x, spawn.y);

    this.scene = scene;
    this.data_ = enemyData;

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

    // ── 재생 (치즈 골렘) ──
    this.regenRate = enemyData.regenRate || 0;

    // ── 신선도 타이머 ──
    this.freshnessTimer = FRESHNESS_WINDOW_MS;
    this.isFresh = true;

    // ── 비주얼 ──
    this._buildVisual(enemyData);

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
    if (id === 'cheese_golem') {
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

    // ── 이동 ──
    this._moveAlongPath(delta);
  }

  /** @private */
  _moveAlongPath(delta) {
    if (this.waypointIndex >= PATH_WAYPOINTS.length) {
      this._reachBase();
      return;
    }

    const target = PATH_WAYPOINTS[this.waypointIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * this.slowFactor * (delta / 1000);

    if (dist <= moveAmount) {
      this.x = target.x;
      this.y = target.y;
      this.waypointIndex++;
      if (this.waypointIndex >= PATH_WAYPOINTS.length) {
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
