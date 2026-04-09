/**
 * @fileoverview 적 엔티티 클래스.
 * 웨이포인트를 따라 이동하며 신선도 보너스 타이머를 관리한다.
 * Phase 3: 5종 적 비주얼 + 치즈 골렘 재생 + 아이소메트릭 depth.
 * Phase 4: 밀가루 유령(투명) + 빙결 상태이상.
 * Phase 9-4: 도형 → 스프라이트 이미지 교체 (fallback 유지).
 */

import Phaser from 'phaser';
import { PATH_WAYPOINTS, FRESHNESS_WINDOW_MS } from '../config.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

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
    this._bossDebuffFired = false;  // dragon_ramen: bossDebuff 1회 발동 여부

    // ── 무리 이동 (cheese_rat) ──
    this._swarmBoosted = false;

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
   * Phase 9-4: 스프라이트 이미지가 로드되어 있으면 사용, 아니면 도형 fallback.
   * @private
   */
  _buildVisual(data) {
    const color = data.bodyColor || 0xff6b35;
    const id = data.id;

    // ── 스프라이트 키 결정 (보스/일반) ──
    const isBoss = !!data.isBoss;
    const spriteKey = isBoss ? `boss_${id}` : `enemy_${id}`;
    const hasSprite = SpriteLoader.hasTexture(this.scene, spriteKey);

    if (hasSprite) {
      // ── 스프라이트 이미지 사용 ──
      const sprite = this.scene.add.image(0, 0, spriteKey);
      // 적: 48x48 → 28px, 보스: 84x84 → 40px
      const targetSize = isBoss ? 40 : 28;
      const texW = sprite.width;
      const scale = targetSize / texW;
      sprite.setScale(scale);
      this.add(sprite);
      this._bodySprite = sprite;
    } else {
      // ── 도형 fallback ──
      this._buildShapeFallback(data, color, id);
    }

    // HP 바 (스프라이트/도형 공통)
    const hpBarY = isBoss ? -24 : -18;
    this.hpBarBg = this.scene.add.rectangle(0, hpBarY, 26, 3, 0x333333);
    this.add(this.hpBarBg);
    this.hpBar = this.scene.add.rectangle(-13, hpBarY, 26, 3, 0x44ff44);
    this.hpBar.setOrigin(0, 0.5);
    this.add(this.hpBar);

    // 신선도 바
    const freshBarY = hpBarY - 5;
    this.freshBg = this.scene.add.rectangle(0, freshBarY, 26, 2, 0x222222);
    this.add(this.freshBg);
    this.freshBar = this.scene.add.rectangle(-13, freshBarY, 26, 2, 0x00ff88);
    this.freshBar.setOrigin(0, 0.5);
    this.add(this.freshBar);
  }

  /**
   * 도형 기반 fallback 비주얼 (스프라이트 미로드 시).
   * @param {object} data
   * @param {number} color
   * @param {string} id
   * @private
   */
  _buildShapeFallback(data, color, id) {
    // 몸체
    if (id === 'pasta_boss' || id === 'dragon_ramen'
        || id === 'seafood_kraken' || id === 'lava_dessert_golem') {
      const body = this.scene.add.rectangle(0, 0, 40, 40, color);
      this.add(body);
    } else if (id === 'cheese_golem') {
      const body = this.scene.add.rectangle(0, 0, 28, 28, color);
      this.add(body);
    } else if (id === 'fish_knight') {
      const body = this.scene.add.rectangle(0, 0, 26, 26, color);
      this.add(body);
    } else if (id === 'mushroom_scout' || id === 'cheese_rat') {
      const body = this.scene.add.circle(0, 0, 10, color);
      this.add(body);
    } else {
      const body = this.scene.add.circle(0, 0, id === 'meat_ogre' ? 18 : 14, color);
      this.add(body);
    }

    // 눈
    const eye1 = this.scene.add.circle(-4, -3, 2.5, 0xffffff);
    const eye2 = this.scene.add.circle(4, -3, 2.5, 0xffffff);
    this.add(eye1);
    this.add(eye2);
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

    // ── 무리 이동 보너스 (cheese_rat) ──
    if (this.data_.swarmSpeedBonus && this.scene?.enemies) {
      const radius = this.data_.swarmRadius || 80;
      let nearCount = 0;
      this.scene.enemies.getChildren().forEach(other => {
        if (!other.active || other === this || other.isDead) return;
        if (other.data_?.id !== this.data_.id) return;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
        if (dist <= radius) nearCount++;
      });
      if (nearCount >= 3 && !this._swarmBoosted) {
        this._swarmBoosted = true;
        this.speed = this.data_.speed * (1 + this.data_.swarmSpeedBonus);
      } else if (nearCount < 3 && this._swarmBoosted) {
        this._swarmBoosted = false;
        this.speed = this.data_.speed;
      }
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
      // 격노 (HP 임계 이하 → 속도 2배)
      if (!this._enraged && this.data_.enrageHpThreshold &&
          this.hp / this.maxHp <= this.data_.enrageHpThreshold) {
        this._enraged = true;
        this.speed = this.data_.speed * 2;
        this.setTint(0xff4444);
      }
      // 보스 디버프 (dragon_ramen: HP 40% 이하 시 1회 전체 타워 공격속도 감소)
      if (!this._bossDebuffFired && this.data_.bossDebuff &&
          this.hp / this.maxHp <= (this.data_.enrageHpThreshold || 0.4)) {
        this._bossDebuffFired = true;
        this.scene.events.emit('boss_debuff', {
          speedReduction: this.data_.bossDebuff.speedReduction,
          duration: this.data_.bossDebuff.duration,
        });
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

    // 생선 기사: 전면 피해 50% 감소 (이동 방향 기준, 진행 중이면 전면 피격으로 간주)
    if (this.data_.shieldFront && this.waypointIndex < this._waypoints.length) {
      amount *= (1 - this.data_.shieldFront);
    }

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

    // 사망 시 포자 디버프 (mushroom_scout)
    if (this.data_.sporeDebuff) {
      this.scene.events.emit('spore_debuff', {
        x: this.x, y: this.y,
        speedReduction: this.data_.sporeDebuff.speedReduction,
        duration: this.data_.sporeDebuff.duration,
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
