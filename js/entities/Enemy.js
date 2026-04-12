/**
 * @fileoverview 적 엔티티 클래스.
 * 웨이포인트를 따라 이동하며 신선도 보너스 타이머를 관리한다.
 * Phase 3: 5종 적 비주얼 + 치즈 골렘 재생 + 아이소메트릭 depth.
 * Phase 4: 밀가루 유령(투명) + 빙결 상태이상.
 * Phase 9-4: 도형 → 스프라이트 이미지 교체 (fallback 유지).
 * Phase 12: 8방향 걷기 애니메이션 + 크기 25% 증가.
 * Phase 20: 은신(stealth), 배리어(barrier), 취권(drunkWalk), 아우라(aura) 메카닉.
 * Phase 21: 분열(split), 화염 장판(fireZone), 화염 브레스+3페이즈(fireBreath) 메카닉.
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

    // ── DoT 스택 (Phase 19-1: spice_grinder) ──
    /** @type {Array<{damage: number, remaining: number, interval: number, timer: number}>} */
    this._dotStacks = [];
    /** DoT 스택 최대 개수 */
    this._maxDotStacks = 3;

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

    // ── Phase 20: 은신 (sushi_ninja) ──
    /** @type {boolean} 타겟팅 가능 여부 (은신 중 false) */
    this.canBeTargeted = true;
    if (enemyData.stealth) {
      this._stealthTimer = 0;
      this._isInStealth = false;
      this._stealthElapsed = 0;
    }

    // ── Phase 20: 배리어 (tempura_monk) ──
    if (enemyData.barrier) {
      this._barrierActive = false;
      this._barrierTriggered = false;
      this._barrierCooldownTimer = 0;
    }

    // ── Phase 20: 취권 (sake_oni) ──
    if (enemyData.drunkWalk) {
      this._drunkTimer = 0;
      this._isDrunk = false;
      this._drunkElapsed = 0;
      this._drunkVx = 0;
      this._drunkVy = 0;
    }

    // ── Phase 20: 아우라 (sake_oni) ──
    if (enemyData.aura) {
      this._auraTimer = 0;
    }

    // ── Phase 20: 아우라 속도 버프 (다른 적에게서 받는 버프) ──
    this._auraSpeedBuff = 0;

    // ── Phase 21: 분열 (dumpling_warrior) ──
    if (enemyData.split) {
      this._splitExecuted = false;
    }

    // ── Phase 21: 화염 장판 (wok_phantom) ──
    if (enemyData.fireZone) {
      this._fireZoneTimer = 0;
    }

    // ── Phase 21: 화염 브레스 + 3페이즈 (dragon_wok) ──
    if (enemyData.fireBreath) {
      this._phase = 1;
      this._fireBreathTimer = 0;
      this._phaseTransitioned = { 2: false, 3: false };
    }

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
    const prefix = isBoss ? 'boss' : 'enemy';
    const spriteKey = `${prefix}_${id}`;
    const hasSprite = SpriteLoader.hasTexture(this.scene, spriteKey);

    // Phase 12: 걷기 애니메이션 사용 여부 확인
    const walkAnimKey = `${prefix}_${id}_walk_south`;
    const hasWalkAnim = this.scene.anims.exists(walkAnimKey);
    this._walkPrefix = `${prefix}_${id}_walk`;
    this._hasWalkAnim = hasWalkAnim;
    this._currentDir = 'south';

    // Phase 12: 크기 25% 증가 (적: 28→35, 보스: 40→50)
    const targetSize = isBoss ? 50 : 35;

    if (hasWalkAnim) {
      // ── 걷기 애니메이션 스프라이트 사용 ──
      const firstFrameKey = `${prefix}_${id}_walk_south_0`;
      const sprite = this.scene.add.sprite(0, 0, firstFrameKey);
      const texW = sprite.width || 48;
      sprite.setScale(targetSize / texW);
      sprite.play(walkAnimKey);
      this.add(sprite);
      this._bodySprite = sprite;
    } else if (hasSprite) {
      // ── 정지 이미지 fallback ──
      const sprite = this.scene.add.image(0, 0, spriteKey);
      const texW = sprite.width;
      sprite.setScale(targetSize / texW);
      this.add(sprite);
      this._bodySprite = sprite;
    } else {
      // ── 도형 fallback ──
      this._buildShapeFallback(data, color, id);
    }

    // HP 바 (스프라이트/도형 공통)
    const hpBarY = isBoss ? -30 : -22;
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
        || id === 'seafood_kraken' || id === 'lava_dessert_golem'
        || id === 'sake_oni' || id === 'dragon_wok') {
      const body = this.scene.add.rectangle(0, 0, 40, 40, color);
      this.add(body);
    } else if (id === 'cheese_golem') {
      const body = this.scene.add.rectangle(0, 0, 28, 28, color);
      this.add(body);
    } else if (id === 'fish_knight' || id === 'tempura_monk' || id === 'dumpling_warrior' || id === 'wok_phantom') {
      const body = this.scene.add.rectangle(0, 0, 26, 26, color);
      this.add(body);
    } else if (id === 'mushroom_scout' || id === 'cheese_rat' || id === 'sushi_ninja' || id === 'mini_dumpling') {
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
      if (this.freezeTimer <= 0 || !isFinite(this.freezeTimer)) {
        this.isFrozen = false;
        this.freezeTimer = 0;
        this.clearTint();  // 빙결 틴트 해제 (setTint() 인자 없음은 Container에서 오작동 가능)
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

    // ── DoT 스택 처리 (Phase 19-1: spice_grinder) ──
    if (this._dotStacks.length > 0) {
      for (let i = this._dotStacks.length - 1; i >= 0; i--) {
        const dot = this._dotStacks[i];
        dot.remaining -= delta;
        dot.timer -= delta;
        if (dot.timer <= 0) {
          this.takeDamage(dot.damage);
          dot.timer = dot.interval;
        }
        if (dot.remaining <= 0) {
          this._dotStacks.splice(i, 1);
        }
      }
      // DoT 활성 중이면 주황 틴트, 종료 시 원복
      if (this._dotStacks.length > 0) {
        if (!this.isFrozen && !this._enraged) this.setTint(0xff8c00);
      } else {
        if (!this.isFrozen && !this._enraged) this.clearTint();
      }
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

    // ── Phase 20: 은신 (sushi_ninja) ──
    if (this.data_.stealth) {
      this._updateStealth(delta);
    }

    // ── Phase 20: 배리어 쿨다운 (tempura_monk) ──
    if (this.data_.barrier && this._barrierTriggered && this._barrierCooldownTimer > 0) {
      this._barrierCooldownTimer -= delta;
      if (this._barrierCooldownTimer <= 0) {
        this._barrierTriggered = false;
      }
    }

    // ── Phase 20: 취권 (sake_oni) ──
    if (this.data_.drunkWalk) {
      this._updateDrunkWalk(delta);
      return; // 취권 로직이 이동을 자체 처리하므로 _moveAlongPath 스킵
    }

    // ── Phase 20: 아우라 (sake_oni) ──
    if (this.data_.aura) {
      this._updateAura(delta);
    }

    // ── Phase 21: 화염 장판 (wok_phantom) ──
    if (this.data_.fireZone) {
      this._updateFireZone(delta);
    }

    // ── Phase 21: 화염 브레스 + 3페이즈 (dragon_wok) ──
    // BUG-01 방지: HP 비율 체크를 타이머 조건 밖, 업데이트 최상단에서 처리
    if (this.data_.fireBreath) {
      const hpRatio = this.hp / this.maxHp;
      if (this._phase < 2 && hpRatio <= 0.70) this._enterPhase(2);
      if (this._phase < 3 && hpRatio <= 0.35) this._enterPhase(3);
      this._updateFireBreath(delta);
    }

    // ── 이동 ──
    this._moveAlongPath(delta);
  }

  // ── Phase 20: 은신 메카닉 ─────────────────────────────────────────

  /**
   * 은신 업데이트 (sushi_ninja).
   * stealthInterval마다 은신 시작, stealthDuration 후 해제.
   * @param {number} delta - ms
   * @private
   */
  _updateStealth(delta) {
    if (this._isInStealth) {
      this._stealthElapsed += delta;
      if (this._stealthElapsed >= this.data_.stealthDuration) {
        this._endStealth();
      }
    } else {
      this._stealthTimer += delta;
      if (this._stealthTimer >= this.data_.stealthInterval) {
        this._startStealth();
      }
    }
  }

  /**
   * 은신 시작: 투명화 + 타겟팅 불가.
   * @private
   */
  _startStealth() {
    this._isInStealth = true;
    this._stealthElapsed = 0;
    this._stealthTimer = 0;
    this.canBeTargeted = false;
    this.setAlpha(0.1);
  }

  /**
   * 은신 해제: 투명 복구 + 백어택 이벤트 발사.
   * @private
   */
  _endStealth() {
    this._isInStealth = false;
    this._stealthElapsed = 0;
    this._stealthTimer = 0;
    this.canBeTargeted = true;
    this.setAlpha(1.0);

    // 백어택: 재출현 시 주변 도구에 디버프 적용
    if (this.data_.backAttackRadius && this.scene?.towers) {
      this.scene.events.emit('stealth_back_attack', {
        x: this.x,
        y: this.y,
        radius: this.data_.backAttackRadius,
        duration: 2000, // 2초간 공격속도 디버프
      });
    }
  }

  // ── Phase 20: 배리어 메카닉 ────────────────────────────────────────

  /**
   * 배리어 활성화 (tempura_monk).
   * @private
   */
  _activateBarrier() {
    this._barrierActive = true;
    this.setTint(0xaaddff); // 청백 틴트
  }

  /**
   * 배리어 비활성화.
   * @private
   */
  _deactivateBarrier() {
    this._barrierActive = false;
    this._barrierTriggered = true;
    this._barrierCooldownTimer = this.data_.barrierCooldown || 10000;
    // 틴트 원복 (다른 상태 틴트가 없으면 해제)
    if (!this.isFrozen && !this._enraged) {
      this.clearTint();
    }
  }

  // ── Phase 20: 취권 메카닉 ──────────────────────────────────────────

  /**
   * 취권 업데이트 (sake_oni).
   * drunkInterval마다 랜덤 방향 이탈, drunkDuration 후 경로 복귀.
   * 아우라 갱신도 포함.
   * @param {number} delta - ms
   * @private
   */
  _updateDrunkWalk(delta) {
    // 아우라 갱신
    if (this.data_.aura) {
      this._updateAura(delta);
    }

    // sake_oni 분노: drunkInterval 절반
    const effectiveInterval = this._enraged
      ? this.data_.drunkInterval / 2
      : this.data_.drunkInterval;

    if (this._isDrunk) {
      // 취권 상태: 랜덤 방향 이동
      this._drunkElapsed += delta;
      this.x += this._drunkVx * (delta / 1000);
      this.y += this._drunkVy * (delta / 1000);
      // depth 갱신
      this.setDepth(10 + Math.floor(this.y));

      if (this._drunkElapsed >= this.data_.drunkDuration) {
        this._endDrunk();
      }
    } else {
      this._drunkTimer += delta;
      if (this._drunkTimer >= effectiveInterval) {
        this._startDrunk();
      } else {
        // 정상 경로 이동
        this._moveAlongPath(delta);
      }
    }
  }

  /**
   * 취권 시작: 랜덤 각도 이동.
   * @private
   */
  _startDrunk() {
    this._isDrunk = true;
    this._drunkElapsed = 0;
    this._drunkTimer = 0;
    const angle = Math.random() * 2 * Math.PI;
    const spd = this.data_.drunkSpeed || 60;
    this._drunkVx = Math.cos(angle) * spd;
    this._drunkVy = Math.sin(angle) * spd;
  }

  /**
   * 취권 종료: 가장 가까운 경로 포인트로 스냅하여 복귀.
   * @private
   */
  _endDrunk() {
    this._isDrunk = false;
    this._drunkElapsed = 0;

    // 가장 가까운 웨이포인트 탐색 후 복귀
    let bestIdx = this.waypointIndex;
    let bestDist = Infinity;
    for (let i = 1; i < this._waypoints.length; i++) {
      const wp = this._waypoints[i];
      const d = Phaser.Math.Distance.Between(this.x, this.y, wp.x, wp.y);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    // 최소한 현재 웨이포인트 이상으로 설정 (역행 방지)
    if (bestIdx < this.waypointIndex) {
      bestIdx = this.waypointIndex;
    }
    this.waypointIndex = bestIdx;
  }

  // ── Phase 20: 아우라 메카닉 ────────────────────────────────────────

  /**
   * 아우라 갱신 (sake_oni): 주변 아군 적에게 속도 버프 + HP 회복.
   * @param {number} delta - ms
   * @private
   */
  _updateAura(delta) {
    this._auraTimer += delta;
    if (this._auraTimer < this.data_.auraInterval) return;
    this._auraTimer = 0;

    if (!this.scene?.enemies) return;
    const radius = this.data_.auraRadius;
    const speedBonus = this.data_.auraSpeedBonus;
    const healRate = this.data_.auraHealRate;

    this.scene.enemies.getChildren().forEach(enemy => {
      if (!enemy.active || enemy === this || enemy.isDead) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist > radius) return;

      // 속도 버프 적용
      enemy._auraSpeedBuff = speedBonus;

      // HP 회복
      if (enemy.hp < enemy.maxHp) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + healRate);
        const ratio = enemy.hp / enemy.maxHp;
        enemy.hpBar.width = 26 * ratio;
        if (ratio >= 0.7) enemy.hpBar.setFillStyle(0x44ff44);
        else if (ratio >= 0.4) enemy.hpBar.setFillStyle(0xffaa00);
      }
    });
  }

  // ── Phase 21: 화염 장판 메카닉 ───────────────────────────────────

  /**
   * 화염 장판 업데이트 (wok_phantom).
   * fireZoneInterval마다 현재 위치에 화염 장판 이벤트를 발사한다.
   * @param {number} delta - ms
   * @private
   */
  _updateFireZone(delta) {
    this._fireZoneTimer += delta;
    if (this._fireZoneTimer >= this.data_.fireZoneInterval) {
      this._fireZoneTimer = 0;
      this.scene.events.emit('enemy_fire_zone', {
        x: this.x,
        y: this.y,
        radius: this.data_.fireZoneRadius,
        duration: this.data_.fireZoneDuration,
        debuffDuration: this.data_.fireZoneDebuffDuration,
      });
    }
  }

  // ── Phase 21: 화염 브레스 + 3페이즈 메카닉 ─────────────────────

  /**
   * 페이즈 전환 (dragon_wok).
   * @param {number} phase - 전환 대상 페이즈 (2 또는 3)
   * @private
   */
  _enterPhase(phase) {
    if (this._phaseTransitioned[phase]) return;
    this._phaseTransitioned[phase] = true;
    this._phase = phase;
    this._fireBreathTimer = 0; // 페이즈 전환 시 타이머 리셋

    // 카메라 셰이크 + VFX 연출
    if (this.scene?.cameras?.main) {
      this.scene.cameras.main.shake(400, 0.005);
    }
    if (this.scene?.vfx?.screenFlash) {
      this.scene.vfx.screenFlash(0xff4400, 200);
    }

    if (phase === 2) {
      // 페이즈 2: 속도 +15%, mini_dumpling 3마리 1회 소환
      this.speed = this.data_.speed * 1.15;
      const summonCount = this.data_.fireBreathPhases[1]?.summonMini || 3;
      for (let i = 0; i < summonCount; i++) {
        this.scene.events.emit('enemy_deterministic_split', {
          type: 'mini_dumpling',
          x: this.x + Phaser.Math.Between(-20, 20),
          y: this.y + Phaser.Math.Between(-10, 10),
          waypointIndex: this.waypointIndex,
        });
      }
      this.setTint(0xff6600);
    } else if (phase === 3) {
      // 페이즈 3: 즉발 fireZone 2개 현재 위치에 생성
      this.speed = this.data_.speed * 1.30;
      const fireZoneCount = this.data_.fireBreathPhases[2]?.instantFireZones || 2;
      for (let i = 0; i < fireZoneCount; i++) {
        this.scene.events.emit('enemy_fire_zone', {
          x: this.x + Phaser.Math.Between(-30, 30),
          y: this.y + Phaser.Math.Between(-15, 15),
          radius: 55,
          duration: 4000,
          debuffDuration: 2500,
        });
      }
      this._enraged = true;
      this.setTint(0xff2200);
    }
  }

  /**
   * 화염 브레스 업데이트 (dragon_wok).
   * 현재 페이즈의 interval로 브레스를 발동하여 전방 부채꼴 범위 내 도구에 디버프를 적용한다.
   * @param {number} delta - ms
   * @private
   */
  _updateFireBreath(delta) {
    const phaseConfig = this.data_.fireBreathPhases[this._phase - 1];
    if (!phaseConfig) return;

    this._fireBreathTimer += delta;
    if (this._fireBreathTimer < phaseConfig.interval) return;
    this._fireBreathTimer = 0;

    // 화염 브레스: 이동 방향 기준 부채꼴 범위 내 도구에 공격속도 디버프
    this.scene.events.emit('dragon_fire_breath', {
      x: this.x,
      y: this.y,
      angle: phaseConfig.angle,
      radius: phaseConfig.radius,
      debuffValue: -0.25,
      debuffDuration: 3000,
      // 이동 방향 전달
      dx: this._waypoints[this.waypointIndex]
        ? this._waypoints[this.waypointIndex].x - this.x
        : 0,
      dy: this._waypoints[this.waypointIndex]
        ? this._waypoints[this.waypointIndex].y - this.y
        : 1,
    });
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
    // 아우라 속도 버프 적용
    const auraMultiplier = 1 + (this._auraSpeedBuff || 0);
    const moveAmount = this.speed * this.slowFactor * auraMultiplier * (delta / 1000);

    // Phase 12: 이동 방향에 따라 걷기 애니메이션 전환
    if (this._hasWalkAnim && dist > 0.1) {
      const dir = Enemy._getDirection8(dx, dy);
      if (dir !== this._currentDir) {
        this._currentDir = dir;
        const animKey = `${this._walkPrefix}_${dir}`;
        if (this._bodySprite?.anims && this.scene.anims.exists(animKey)) {
          this._bodySprite.play(animKey, true);
        }
      }
    }

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

  /**
   * dx, dy로부터 가장 가까운 8방향 문자열을 반환한다.
   * @param {number} dx
   * @param {number} dy
   * @returns {string}
   * @private
   */
  static _getDirection8(dx, dy) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 ~ 180
    // 0=east, 90=south, -90=north
    if (angle >= -22.5 && angle < 22.5) return 'east';
    if (angle >= 22.5 && angle < 67.5) return 'south-east';
    if (angle >= 67.5 && angle < 112.5) return 'south';
    if (angle >= 112.5 && angle < 157.5) return 'south-west';
    if (angle >= 157.5 || angle < -157.5) return 'west';
    if (angle >= -157.5 && angle < -112.5) return 'north-west';
    if (angle >= -112.5 && angle < -67.5) return 'north';
    if (angle >= -67.5 && angle < -22.5) return 'north-east';
    return 'south';
  }

  /** @param {number} amount */
  takeDamage(amount) {
    if (this.isDead) return;

    // Phase 20: 배리어 활성 시 피해 무효
    if (this._barrierActive) return;

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

    // Phase 20: 배리어 트리거 (tempura_monk) — HP가 임계치 이하로 떨어지면 활성화
    if (this.data_.barrier && !this._barrierActive && !this._barrierTriggered &&
        this.hp > 0 && ratio <= this.data_.barrierThreshold) {
      this._activateBarrier();
      // barrierDuration 후 자동 해제
      this.scene.time.delayedCall(this.data_.barrierDuration, () => {
        if (!this.isDead && this._barrierActive) {
          this._deactivateBarrier();
        }
      });
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

  /**
   * DoT(지속 피해) 적용 (Phase 19-1: spice_grinder).
   * 독립 스택으로 관리되며 최대 3스택까지 중첩 가능.
   * @param {number} damage - 틱당 피해량
   * @param {number} duration - 총 지속 시간 (ms)
   * @param {number} [interval=500] - 틱 간격 (ms)
   */
  applyDot(damage, duration, interval = 500) {
    if (this._dotStacks.length >= this._maxDotStacks) return;
    this._dotStacks.push({
      damage,
      remaining: duration,
      interval,
      timer: interval,  // 첫 틱은 interval 후에 발동
    });
  }

  /** @private */
  _die() {
    if (this.isDead) return;
    this.isDead = true;
    this.active = false;

    // 분열 (egg_sprite): 10% 확률로 소형 분열체 ��성
    if (this.data_.splitChance && Math.random() < this.data_.splitChance) {
      this.scene.events.emit('enemy_split', {
        type: this.data_.id,
        x: this.x, y: this.y,
        hp: this.data_.splitHp || 30,
        waypointIndex: this.waypointIndex,
      });
    }

    // Phase 21: 확정 분열 (dumpling_warrior) — 처치 시 splitCount만큼 splitType 스폰
    if (this.data_.split === true && !this._splitExecuted) {
      this._splitExecuted = true;
      const count = this.data_.splitCount || 2;
      const splitType = this.data_.splitType;
      for (let i = 0; i < count; i++) {
        this.scene.events.emit('enemy_deterministic_split', {
          type: splitType,
          x: this.x + Phaser.Math.Between(-10, 10),
          y: this.y + Phaser.Math.Between(-5, 5),
          waypointIndex: this.waypointIndex,
        });
      }
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

    // Phase 20: sake_oni 사망 시 범위 내 적의 아우라 속도 버프 초기화
    if (this.data_.aura && this.scene?.enemies) {
      const radius = this.data_.auraRadius;
      this.scene.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy === this || enemy.isDead) return;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
        if (dist <= radius) {
          enemy._auraSpeedBuff = 0;
        }
      });
    }

    // 보스 처치 보상 (Phase 13-3: bossDrops 재료 드롭 추가)
    if (this.data_.bossReward || this.data_.bossDrops) {
      this.scene.events.emit('boss_killed', {
        reward: this.data_.bossReward || 0,
        bossDrops: this.data_.bossDrops || null,
      });
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
