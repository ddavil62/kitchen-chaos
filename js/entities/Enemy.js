/**
 * @fileoverview 적 엔티티 클래스.
 * 웨이포인트를 따라 이동하며 신선도 보너스 타이머를 관리한다.
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
    this.goldReward = enemyData.goldReward;
    this.ingredientType = enemyData.ingredient;

    // ── 이동 상태 ──
    this.waypointIndex = 1; // 0은 스폰 위치, 1부터 이동 시작
    this.active = true;
    this.isDead = false;
    this.reachedBase = false;

    // ── 상태 이상 ──
    this.slowFactor = 1.0;   // 1.0 = 정상, 0.5 = 절반 속도
    this.slowTimer = 0;
    this.isBurning = false;
    this.burnTimer = 0;
    this.burnInterval = 0;
    this.burnIntervalTimer = 0;
    this.burnDamage = 0;

    // ── 신선도 타이머 ──
    this.freshnessTimer = FRESHNESS_WINDOW_MS; // 스폰 직후부터 카운트다운
    this.isFresh = true;

    // ── 비주얼 ──
    this._buildVisual(enemyData);

    scene.add.existing(this);
    this.setDepth(10);
  }

  /**
   * 프로그래매틱 비주얼 생성 (그래픽 + HP바 + 신선도바).
   * @private
   */
  _buildVisual(enemyData) {
    // 몸체 (Circle)
    const body = this.scene.add.circle(0, 0, 16, enemyData.id === 'carrot_goblin' ? 0xff6b35 : 0xdc143c);
    this.add(body);

    // 눈 (흰 점 2개)
    const eye1 = this.scene.add.circle(-5, -4, 3, 0xffffff);
    const eye2 = this.scene.add.circle(5, -4, 3, 0xffffff);
    this.add(eye1);
    this.add(eye2);

    // 당근 고블린 → 오렌지 잎 표시
    if (enemyData.id === 'carrot_goblin') {
      const leaf = this.scene.add.triangle(0, -20, -5, 0, 5, 0, 0, -10, 0x228b22);
      this.add(leaf);
    }

    // HP 배경바
    this.hpBarBg = this.scene.add.rectangle(0, -26, 28, 4, 0x333333);
    this.add(this.hpBarBg);
    // HP 포그라운드바
    this.hpBar = this.scene.add.rectangle(-14, -26, 28, 4, 0x44ff44);
    this.hpBar.setOrigin(0, 0.5);
    this.add(this.hpBar);

    // 신선도 배경바
    this.freshBg = this.scene.add.rectangle(0, -32, 28, 3, 0x222222);
    this.add(this.freshBg);
    // 신선도 포그라운드바
    this.freshBar = this.scene.add.rectangle(-14, -32, 28, 3, 0x00ff88);
    this.freshBar.setOrigin(0, 0.5);
    this.add(this.freshBar);
  }

  /**
   * 매 프레임 업데이트 - 이동, 상태이상, 신선도 타이머.
   * @param {number} time
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.isDead || !this.active) return;

    // ── 신선도 타이머 갱신 ──
    if (this.isFresh) {
      this.freshnessTimer -= delta;
      if (this.freshnessTimer <= 0) {
        this.isFresh = false;
        this.freshBar.setVisible(false);
        this.freshBg.setVisible(false);
      } else {
        const ratio = this.freshnessTimer / FRESHNESS_WINDOW_MS;
        this.freshBar.width = 28 * ratio;
        // 초록 → 주황으로 색상 전환
        const r = Math.floor(255 * (1 - ratio));
        const g = Math.floor(255 * ratio);
        this.freshBar.setFillStyle(Phaser.Display.Color.GetColor(r, g, 0));
      }
    }

    // ── 상태이상: 슬로우 ──
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowFactor = 1.0;
      }
    }

    // ── 상태이상: 화상 ──
    if (this.isBurning) {
      this.burnTimer -= delta;
      this.burnIntervalTimer -= delta;
      if (this.burnIntervalTimer <= 0) {
        this.takeDamage(this.burnDamage);
        this.burnIntervalTimer = this.burnInterval;
      }
      if (this.burnTimer <= 0) {
        this.isBurning = false;
      }
    }

    // ── 이동 ──
    this._moveAlongPath(delta);
  }

  /**
   * 경로 웨이포인트를 따라 이동.
   * @private
   * @param {number} delta
   */
  _moveAlongPath(delta) {
    if (this.waypointIndex >= PATH_WAYPOINTS.length) {
      // 주방 도달
      this._reachBase();
      return;
    }

    const target = PATH_WAYPOINTS[this.waypointIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveAmount = this.speed * this.slowFactor * (delta / 1000);

    if (dist <= moveAmount) {
      // 웨이포인트 도달
      this.x = target.x;
      this.y = target.y;
      this.waypointIndex++;

      // 마지막 웨이포인트 다음이면 주방 도달
      if (this.waypointIndex >= PATH_WAYPOINTS.length) {
        this._reachBase();
      }
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }
  }

  /**
   * 피해 적용.
   * @param {number} amount
   */
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    // HP바 갱신
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.width = 28 * ratio;
    if (ratio < 0.4) this.hpBar.setFillStyle(0xff4444);
    else if (ratio < 0.7) this.hpBar.setFillStyle(0xffaa00);

    if (this.hp <= 0) this._die();
  }

  /**
   * 슬로우 상태 적용.
   * @param {number} factor - 속도 배율 (0~1)
   * @param {number} duration - ms
   */
  applySlow(factor, duration) {
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  /**
   * 화상 상태 적용.
   * @param {number} damage - 틱당 피해
   * @param {number} duration - ms
   * @param {number} interval - 틱 간격 ms
   */
  applyBurn(damage, duration, interval) {
    this.isBurning = true;
    this.burnDamage = damage;
    this.burnTimer = duration;
    this.burnInterval = interval;
    this.burnIntervalTimer = interval;
  }

  /**
   * 처치 처리. 이벤트를 통해 GameScene에 알린다.
   * @private
   */
  _die() {
    if (this.isDead) return;
    this.isDead = true;
    this.active = false;
    this.scene.events.emit('enemy_died', this);
    this.destroy();
  }

  /**
   * 주방 도달 처리.
   * @private
   */
  _reachBase() {
    if (this.reachedBase) return;
    this.reachedBase = true;
    this.isDead = true;
    this.active = false;
    this.scene.events.emit('enemy_reached_base', this);
    this.destroy();
  }
}
