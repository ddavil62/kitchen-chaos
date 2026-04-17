/**
 * @fileoverview 적 엔티티 클래스.
 * 웨이포인트를 따라 이동하며 신선도 보너스 타이머를 관리한다.
 * Phase 3: 5종 적 비주얼 + 치즈 골렘 재생 + 아이소메트릭 depth.
 * Phase 4: 밀가루 유령(투명) + 빙결 상태이상.
 * Phase 9-4: 도형 → 스프라이트 이미지 교체 (fallback 유지).
 * Phase 12: 8방향 걷기 애니메이션 + 크기 25% 증가.
 * Phase 20: 은신(stealth), 배리어(barrier), 취권(drunkWalk), 아우라(aura) 메카닉.
 * Phase 21: 분열(split), 화염 장판(fireZone), 화염 브레스+3페이즈(fireBreath) 메카닉.
 * Phase 22-1: 전령 소환(heraldSummon) + 분노 속도 증가(enrageSpeedMultiplier) 메카닉.
 * Phase 25-1: 어둠 디버프(darkDebuff) + wok_guardian 전면 방어 70%(shieldFrontHeavy) 메카닉.
 * Phase 26-1: 양조 주기(brewCycle) + 봉인 방어막(sealShield) + hpOverride 스폰 파라미터 메카닉.
 * Phase 31-3: 텔레포트(teleportEnabled) 메카닉 (curry_djinn).
 * Phase 32-3: 원소 저항(elementalResistance) + 혼란 디버프(confuseOnHit) 메카닉.
 * Phase 33-3: 회피(dodgeOnHit) + 돌진(chargeEnabled) 메카닉.
 * Phase 34-2: 가시 반격(thornReflect) + 도발(tauntEnabled) 메카닉 추가.
 * Phase 38-1: 마법 저항(magicResistance), 일반 피해 감소(damageReduction), splitOnDeath, phaseTransitions, summonTypes 메카닉 추가.
 * Phase 47-1: _animState 상태 머신(IDLE/WALKING/DYING) + death 애니메이션 비동기 재생 시스템.
 */

import Phaser from 'phaser';
import { PATH_WAYPOINTS, FRESHNESS_WINDOW_MS } from '../config.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

export class Enemy extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} enemyData - ENEMY_TYPES의 적 데이터
   * @param {{x:number,y:number}[]} [waypoints] - 커스텀 웨이포인트 (없으면 기본)
   * @param {object} [spawnData] - 스폰 파라미터 (hpOverride 등)
   */
  constructor(scene, enemyData, waypoints, spawnData) {
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

    // ── Phase 26-1: hpOverride 스폰 파라미터 (약화 선등장 등) ──
    if (spawnData?.hpOverride) {
      this.maxHp = spawnData.hpOverride;
      this.hp = spawnData.hpOverride;
    }
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

    // ── Phase 38-1: phaseTransitions (queen_of_taste 3페이즈 전환) ──
    // phaseTransitions 배열: [{ hpThreshold, phase, speedBonus, tintColor, spriteId }]
    if (enemyData.phaseTransitions) {
      this._nextPhaseIdx = 0;  // 다음에 확인할 phaseTransitions 인덱스 (정렬: 높은→낮은 HP 순)
    }

    // ── Phase 38-1: summonTypes 배열 1회 소환 (el_diablo_pepper, queen_of_taste) ──
    // summon: true, summonThreshold: 0.N, summonTypes: [{ type, count }] 조합 처리
    if (enemyData.summon && enemyData.summonTypes) {
      this._summonTypesFired = false;
    }

    // ── Phase 22-1: 전령 소환 (oni_herald) ──
    if (enemyData.heraldSummon) {
      this._heraldSummonTimer = 0;
      this._heraldEnraged = false;
    }

    // ── Phase 25-1: 어둠 디버프 (shadow_dragon_spawn) ──
    if (enemyData.darkDebuff) {
      this._darkDebuffTimer = 0;
    }

    // ── Phase 26-1: 양조 주기 (sake_master) ──
    if (enemyData.brewCycle) {
      this._brewCycleTimer = 0;
      this._brewEnraged = false;
      // 봉인 방어막 상태
      this._sealShieldActive = false;
      this._sealShieldTriggered = false;
      this._sealShieldHp = 0;
    }

    // ── Phase 31-3: 텔레포트 (curry_djinn) ──
    if (enemyData.teleportEnabled) {
      this._teleportTimer = 0;
    }

    // ── Phase 47-1: 애니메이션 상태 머신 ──
    // 'IDLE': 정지 프레임 (walk anim 없음)
    // 'WALKING': walk anim 재생 중
    // 'DYING': death anim 재생 중 (이 상태에서는 이동/피격 무시)
    this._animState = 'IDLE';

    // ── 비주얼 ──
    this._buildVisual(enemyData);

    // 투명 적: 기본 반투명
    if (this.isInvisible) this.setAlpha(0.3);
    // sugar_specter: 반투명 설탕 유령 시각 효과 (Phase 37-1, AD 모드2 지시)
    if (enemyData.id === 'sugar_specter') this.setAlpha(0.82);

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

    // ── 스프라이트 키 결정 (보스/미니보스/일반) ──
    const isBoss = !!data.isBoss;
    const isMidBoss = !!data.isMidBoss;
    const prefix = (isBoss || isMidBoss) ? 'boss' : 'enemy';
    const spriteKey = `${prefix}_${id}`;
    const hasSprite = SpriteLoader.hasTexture(this.scene, spriteKey);

    // Phase 12: 걷기 애니메이션 사용 여부 확인
    const walkAnimKey = `${prefix}_${id}_walk_south`;
    const hasWalkAnim = this.scene.anims.exists(walkAnimKey);
    this._walkPrefix = `${prefix}_${id}_walk`;
    this._hasWalkAnim = hasWalkAnim;
    this._currentDir = 'south';
    // Phase 47-1: 초기 animState 설정
    this._animState = hasWalkAnim ? 'WALKING' : 'IDLE';

    // Phase 12: 크기 25% 증가 (적: 28→35, 미니보스: 42, 보스: 40→50)
    const targetSize = isBoss ? 50 : (isMidBoss ? 42 : 35);

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
    const hpBarY = isBoss ? -30 : (isMidBoss ? -26 : -22);
    const hpBarW = isBoss ? 40 : 26;  // Phase 38-1: 보스 체력바 너비 확대
    const hpBarH = isBoss ? 5 : 3;    // Phase 38-1: 보스 체력바 높이 확대
    this.hpBarBg = this.scene.add.rectangle(0, hpBarY, hpBarW, hpBarH, 0x333333);
    this.add(this.hpBarBg);
    this.hpBar = this.scene.add.rectangle(-hpBarW / 2, hpBarY, hpBarW, hpBarH, 0x44ff44);
    this.hpBar.setOrigin(0, 0.5);
    this.add(this.hpBar);
    this._hpBarW = hpBarW;  // takeDamage에서 참조

    // Phase 38-1: 3페이즈 보스 체력바 구분선 (66%/33% 위치에 흰색 세로선)
    if (isBoss && data.phaseTransitions) {
      for (const t of data.phaseTransitions) {
        const lineX = (t.hpThreshold - 1) * hpBarW + hpBarW / 2;  // 비율 → px 위치
        const marker = this.scene.add.rectangle(lineX, hpBarY, 1, hpBarH + 2, 0xffffff);
        marker.setOrigin(0.5, 0.5);
        this.add(marker);
      }
    }

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
    if (data.isMidBoss) {
      // Phase 22-1: 미니보스 전용 다이아몬드 도형
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(color, 1);
      gfx.fillPoints([
        { x: 0, y: -18 }, { x: 18, y: 0 },
        { x: 0, y: 18 },  { x: -18, y: 0 },
      ], true);
      this.add(gfx);
    } else if (id === 'pasta_boss' || id === 'dragon_ramen'
        || id === 'seafood_kraken' || id === 'lava_dessert_golem'
        || id === 'sake_oni' || id === 'dragon_wok') {
      const body = this.scene.add.rectangle(0, 0, 40, 40, color);
      this.add(body);
    } else if (id === 'cheese_golem') {
      const body = this.scene.add.rectangle(0, 0, 28, 28, color);
      this.add(body);
    } else if (id === 'fish_knight' || id === 'tempura_monk' || id === 'dumpling_warrior' || id === 'wok_phantom' || id === 'wok_guardian') {
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
    if (this.isDead || !this.active || this._animState === 'DYING') return;

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
      // Fix #4: summonThreshold 이하일 때만 주기적 소환 타이머 작동 (queen_of_taste 등)
      const summonGate = !this.data_.summonThreshold ||
        (this.hp / this.maxHp <= this.data_.summonThreshold);
      if (summonGate) {
        this._summonTimer += delta;
        if (this._summonTimer >= this.data_.summonInterval) {
          this._summonTimer = 0;
          // Fix #4: summonTypes 배열(queen_of_taste) vs summonType 단일 문자열(구 보스) 분기
          // Fix #5: entry.count 반영 — 타입당 count만큼 반복 소환 (Phase 39-1)
          if (this.data_.summonTypes?.length) {
            for (const entry of this.data_.summonTypes) {
              const spawnCount = entry.count || 1;
              for (let i = 0; i < spawnCount; i++) {
                this.scene.events.emit('boss_summon', {
                  type: entry.type,
                  x: this.x + Phaser.Math.Between(-24, 24),
                  y: this.y + Phaser.Math.Between(-12, 12),
                });
              }
            }
          } else {
            this.scene.events.emit('boss_summon', {
              type: this.data_.summonType,
              x: this.x, y: this.y,
            });
          }
        }
      }
      // Fix #3: 분노 (HP 임계 이하 → 속도 증가)
      // - enrageSpeedBonus 있으면 고정 가산 (queen_of_taste: +25), 없으면 x2 (구 보스)
      // - phaseTransitions 보스는 틴트를 phaseTransitions에서 관리하므로 여기서는 생략
      if (!this._enraged && this.data_.enrageHpThreshold &&
          this.hp / this.maxHp <= this.data_.enrageHpThreshold) {
        this._enraged = true;
        if (this.data_.enrageSpeedBonus !== undefined) {
          this.speed = this.data_.speed + this.data_.enrageSpeedBonus;
        } else {
          this.speed = this.data_.speed * 2;
        }
        if (!this.data_.phaseTransitions) {
          this.setTint(0xff4444);
        }
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

    // ── Phase 22-1: 전령 소환 + 분노 (oni_herald) ──
    if (this.data_.heraldSummon) {
      this._updateHeraldSummon(delta);
    }

    // ── Phase 25-1: 어둠 디버프 (shadow_dragon_spawn) ──
    if (this.data_.darkDebuff) {
      this._updateDarkDebuff(delta);
    }

    // ── Phase 26-1: 양조 주기 (sake_master) ──
    if (this.data_.brewCycle) {
      this._updateBrewCycle(delta);
    }

    // ── Phase 31-3: 텔레포트 (curry_djinn) ──
    if (this.data_.teleportEnabled) {
      this._updateTeleport(delta);
    }

    // ── Phase 33-3: 돌진 메카닉 (burrito_juggernaut) ──
    if (this.data_.chargeEnabled) {
      if (this.chargeTimer_ === undefined) {
        this.chargeTimer_ = 0;
      }
      this.chargeTimer_ += delta;
      if (this.chargeTimer_ >= this.data_.chargeInterval) {
        this.chargeTimer_ = 0;
        // 돌진 발동: chargeSpeedMultiplier 배속 적용 (0.8초간)
        this.chargeBurst_ = {
          duration: 800,
          elapsed: 0,
          speedMultiplier: this.data_.chargeSpeedMultiplier,
        };
        // 돌진 충격 반경 내 타워 피해 emit
        this.scene?.events?.emit('enemy_charge_impact', {
          x: this.x, y: this.y,
          radius: this.data_.chargeRadius,
          damageRatio: this.data_.chargeTowerDamage,
        });
      }
      // 돌진 중 속도 배율 적용/해제
      if (this.chargeBurst_) {
        this.chargeBurst_.elapsed += delta;
        if (this.chargeBurst_.elapsed >= this.chargeBurst_.duration) {
          this.chargeBurst_ = null;
        }
      }
    }

    // ── Phase 34-2: 도발 메카닉 (luchador_ghost) ──
    if (this.data_.tauntEnabled) {
      if (this.tauntTimer_ === undefined) {
        this.tauntTimer_ = 0;
      }
      this.tauntTimer_ += delta;
      if (this.tauntTimer_ >= this.data_.tauntInterval) {
        this.tauntTimer_ = 0;
        // 범위 내 투사체 어그로 변경 이벤트 emit
        this.scene?.events?.emit('enemy_taunt', {
          x: this.x,
          y: this.y,
          radius: this.data_.tauntRadius,
          targetId: this.id,   // 투사체 타겟을 이 적 ID로 변경
        });
      }
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

    // Phase 38-1: phaseTransitions를 사용하는 보스(queen_of_taste)는
    // 스프라이트/속도/틴트를 phaseTransitions에서 관리하므로 dragon_wok 전용 효과를 스킵.
    // 단, this._phase 업데이트는 이미 완료되어 _updateFireBreath는 올바른 페이즈 사용.
    if (this.data_.phaseTransitions) return;

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
    // Phase 33-3: 돌진 중 속도 배율 (burrito_juggernaut)
    const chargeMultiplier = this.chargeBurst_ ? this.chargeBurst_.speedMultiplier : 1;
    const moveAmount = this.speed * this.slowFactor * auraMultiplier * chargeMultiplier * (delta / 1000);

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

  /**
   * @param {number} amount - 피해량
   * @param {string|null} [towerType=null] - 피해를 준 타워 타입 ID (Projectile._hit에서 전달)
   * @param {object|null} [attackerRef=null] - 공격원 참조 (Phase 34-2: 가시 반격용)
   */
  takeDamage(amount, towerType = null, attackerRef = null) {
    if (this.isDead || this._animState === 'DYING') return;

    // Phase 20: 배리어 활성 시 피해 무효
    if (this._barrierActive) return;

    // Phase 33-3: 회피 메카닉 (taco_bandit) — dodgeChance 확률로 피해 완전 무효화
    if (this.data_.dodgeOnHit && Math.random() < this.data_.dodgeChance) {
      return;
    }

    // Phase 34-2: 가시 반격 메카닉 (cactus_wraith) — 피격 시 공격원에게 thornReflectDamage 적용
    if (this.data_.thornReflect && attackerRef && typeof attackerRef.takeDamage === 'function') {
      attackerRef.takeDamage(this.data_.thornReflectDamage);
    }

    // 생선 기사: 전면 피해 50% 감소 (이동 방향 기준, 진행 중이면 전면 피격으로 간주)
    if (this.data_.shieldFront && this.waypointIndex < this._waypoints.length) {
      amount *= (1 - this.data_.shieldFront);
    }

    // wok_guardian: 전면 피해 70% 감소 (이동 방향 기준, 전면 피격으로 간주)
    if (this.data_.shieldFrontHeavy && this.waypointIndex < this._waypoints.length) {
      amount *= (1 - this.data_.shieldFrontHeavy);
    }

    // Phase 32-3: 원소 저항 (spice_elemental) — resistTypes 타워 피해 50% 감산
    if (this.data_.elementalResistance && towerType &&
        this.data_.resistTypes.includes(towerType)) {
      amount *= this.data_.resistMultiplier;
    }

    // Phase 38-1: 마법 저항 (macaron_knight) — 마법 계열 타워 피해 magicResistance% 감소
    // 마법 계열 타워: grill(화염), freezer(냉동), spice_grinder(향신료DoT)
    const MAGIC_TOWER_TYPES = ['grill', 'freezer', 'spice_grinder'];
    if (this.data_.magicResistance && towerType && MAGIC_TOWER_TYPES.includes(towerType)) {
      amount *= (1 - this.data_.magicResistance);
    }

    // Phase 38-1: 일반 피해 감소 (candy_soldier 등) — magicResistance 없는 적에만 적용
    // 주의: magicResistance가 있는 적(macaron_knight)에는 적용하지 않음 (중복 감소 방지)
    if (this.data_.damageReduction && !this.data_.magicResistance) {
      amount *= (1 - this.data_.damageReduction);
    }

    // Phase 26-1: 봉인 방어막 (sake_master) — 방어막이 피해를 흡수
    if (this._sealShieldActive) {
      this._sealShieldHp -= amount;
      if (this._sealShieldHp <= 0) {
        // 방어막 파괴, 초과 피해는 본체로 전달
        const overflow = -this._sealShieldHp;
        this._sealShieldActive = false;
        this._sealShieldHp = 0;
        if (this._brewEnraged) {
          this.setTint(0xff4444);
        } else {
          this.clearTint();
        }
        amount = overflow;
        if (amount <= 0) return;
      } else {
        // 방어막이 피해를 전부 흡수
        return;
      }
    }

    // Phase 26-1: 봉인 방어막 활성화 트리거 (sake_master)
    if (this.data_.brewCycle && !this._sealShieldTriggered) {
      const ratioBeforeDamage = this.hp / this.maxHp;
      const ratioAfterDamage = (this.hp - amount) / this.maxHp;
      if (ratioBeforeDamage > this.data_.sealThreshold && ratioAfterDamage <= this.data_.sealThreshold) {
        this._sealShieldTriggered = true;
        this._sealShieldActive = true;
        this._sealShieldHp = this.data_.sealHp;
        this.setTint(0x8844bb); // 보라색 틴트로 방어막 표시
        // 본체 피해는 정상 적용 후 방어막 활성화
      }
    }

    this.hp -= amount;

    // Phase 32-3: 혼란 디버프 (incense_specter) — 피격 시 confuseChance 확률로 이벤트 emit
    if (this.data_.confuseOnHit && Math.random() < this.data_.confuseChance) {
      this.scene.events.emit('enemy_confuse', {
        x: this.x, y: this.y,
        duration: this.data_.confuseDuration,
      });
    }

    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.width = (this._hpBarW || 26) * ratio;
    // Phase 38-1: 체력 색상 단계 4단계 (빨강/주황/노랑/녹색)
    if (ratio < 0.2) this.hpBar.setFillStyle(0xff4444);
    else if (ratio < 0.4) this.hpBar.setFillStyle(0xff6600);
    else if (ratio < 0.7) this.hpBar.setFillStyle(0xffaa00);

    // 피격 시 투명 해제 (2초)
    if (this.isInvisible) {
      this.setAlpha(0.8);
      this.visibleTimer = 2000;
    }

    // Phase 38-1: phaseTransitions 체크 (queen_of_taste 3페이즈 전환)
    // hpThreshold 내림차순 정렬 기준, ratio가 임계값 이하로 떨어지면 1회 발동
    if (this.data_.phaseTransitions && this._nextPhaseIdx !== undefined) {
      const transitions = this.data_.phaseTransitions;
      while (this._nextPhaseIdx < transitions.length) {
        const t = transitions[this._nextPhaseIdx];
        if (ratio > t.hpThreshold) break;  // 아직 임계값 미도달 (정렬 전제)
        this._nextPhaseIdx++;
        // Fix #2: speedBonus는 기본 속도 기준 배율 (0.10 = +10%)
        if (t.speedBonus) {
          this.speed = this.data_.speed * (1 + t.speedBonus);
        }
        // 틴트 적용 (페이즈 색상)
        if (t.tintColor) this.setTint(t.tintColor);
        // Fix #1: spriteSuffix → 실제 스프라이트 ID 조합 (e.g. queen_of_taste + _2 → queen_of_taste_2)
        if (t.spriteSuffix) {
          const spriteId = `${this.data_.id}${t.spriteSuffix}`;
          const newPrefix = `boss_${spriteId}_walk`;
          const curDir = this._currentDir || 'south';
          const newAnimKey = `${newPrefix}_${curDir}`;
          if (this.scene.anims.exists(newAnimKey)) {
            this._walkPrefix = newPrefix;
            this._bodySprite?.play(newAnimKey, true);
          }
        }
        // 페이즈 전환 카메라 셰이크 + 씬 이벤트
        if (this.scene.cameras?.main) this.scene.cameras.main.shake(350, 0.012);
        this.scene.events.emit('boss_phase_changed', { phase: t.phase, x: this.x, y: this.y });
      }
    }

    // Phase 38-1: summonTypes 배열 1회 소환 (el_diablo_pepper, queen_of_taste)
    // HP summonThreshold 이하가 되면 summonTypes 배열의 각 적 유형을 count만큼 소환 (1회)
    if (this.data_.summon && this.data_.summonTypes && !this._summonTypesFired) {
      if (ratio <= this.data_.summonThreshold) {
        this._summonTypesFired = true;
        for (const entry of this.data_.summonTypes) {
          for (let i = 0; i < entry.count; i++) {
            this.scene.events.emit('boss_summon', {
              type: entry.type,
              x: this.x + Phaser.Math.Between(-24, 24),
              y: this.y + Phaser.Math.Between(-12, 12),
            });
          }
        }
      }
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

  // ── Phase 22-1: 전령 소환 메카닉 ────────────────────────────────────

  /**
   * 전령 소환 업데이트 (oni_herald).
   * heraldSummonInterval마다 heraldSummonType 적을 heraldSummonCount만큼 소환.
   * HP enrageHpThreshold 이하 시 속도 enrageSpeedMultiplier배 증가.
   * @param {number} delta - ms
   * @private
   */
  _updateHeraldSummon(delta) {
    // 분노 체크: HP 임계 이하 시 속도 증가
    if (!this._heraldEnraged && this.data_.enrageHpThreshold &&
        this.hp / this.maxHp <= this.data_.enrageHpThreshold) {
      this._heraldEnraged = true;
      const mult = this.data_.enrageSpeedMultiplier || 1.5;
      this.speed = this.data_.speed * mult;
      this.setTint(0xff4444);
    }

    // 소환 타이머
    this._heraldSummonTimer += delta;
    if (this._heraldSummonTimer >= this.data_.heraldSummonInterval) {
      this._heraldSummonTimer = 0;
      const count = this.data_.heraldSummonCount || 1;
      for (let i = 0; i < count; i++) {
        this.scene.events.emit('boss_summon', {
          type: this.data_.heraldSummonType,
          x: this.x, y: this.y,
        });
      }
    }
  }

  // ── Phase 25-1: 어둠 디버프 메카닉 ────────────────────────────────────
  /**
   * 어둠 디버프 업데이트 (shadow_dragon_spawn).
   * darkInterval마다 범위 내 도구에 공격력 감소 디버프를 적용한다.
   * @param {number} delta - ms
   * @private
   */
  _updateDarkDebuff(delta) {
    this._darkDebuffTimer += delta;
    if (this._darkDebuffTimer >= this.data_.darkInterval) {
      this._darkDebuffTimer = 0;
      this.scene.events.emit('dark_debuff', {
        x: this.x,
        y: this.y,
        radius: this.data_.darkRadius,
        damageReduction: this.data_.darkEffect.damageReduction,
        duration: this.data_.darkEffect.duration,
      });
    }
  }

  // ── Phase 26-1: 양조 주기 메카닉 ────────────────────────────────────

  /**
   * 양조 주기 업데이트 (sake_master).
   * brewInterval마다 범위 내 도구에 발효 디버프 + 아군 적 HP 회복.
   * 분노 발동 시 brewInterval 절반 + 사거리 감소 이벤트.
   * @param {number} delta - ms
   * @private
   */
  _updateBrewCycle(delta) {
    // 분노 체크: HP 30% 이하 시 1회 발동
    if (!this._brewEnraged && this.data_.enrageHpThreshold &&
        this.hp / this.maxHp <= this.data_.enrageHpThreshold) {
      this._brewEnraged = true;
      this.setTint(0xff4444);
      // 사거리 감소 이벤트 emit
      this.scene.events.emit('range_reduction', {
        damageReduction: this.data_.enrageRangeReduction,
        duration: this.data_.enrageRangeDuration,
      });
    }

    // 양조 타이머
    const interval = this._brewEnraged
      ? this.data_.brewInterval / 2
      : this.data_.brewInterval;
    this._brewCycleTimer += delta;
    if (this._brewCycleTimer >= interval) {
      this._brewCycleTimer = 0;
      this._onBrewCycleActivate();
    }
  }

  /**
   * 양조 주기 발동: 도구 디버프 + 아군 힐.
   * @private
   */
  _onBrewCycleActivate() {
    // 범위 내 도구에 발효 디버프
    this.scene.events.emit('brew_cycle_debuff', {
      x: this.x,
      y: this.y,
      radius: this.data_.brewDebuffRadius,
      damageReduction: this.data_.brewDebuffEffect.damageReduction,
      duration: this.data_.brewDebuffEffect.duration,
    });

    // 범위 내 아군 적 HP 회복
    if (this.scene?.enemies) {
      const healRadius = this.data_.brewHealRadius;
      const healAmount = this.data_.brewHealAmount;
      this.scene.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy === this || enemy.isDead) return;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
        if (dist <= healRadius) {
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
          // HP 바 갱신
          const ratio = Math.max(0, enemy.hp / enemy.maxHp);
          enemy.hpBar.width = 26 * ratio;
          if (ratio >= 0.7) enemy.hpBar.setFillStyle(0x44ff44);
          else if (ratio >= 0.4) enemy.hpBar.setFillStyle(0xffaa00);
        }
      });
    }
  }

  // ── Phase 31-3: 텔레포트 메카닉 ───────────────────────────────────

  /**
   * 텔레포트 업데이트 (curry_djinn).
   * teleportInterval마다 현재 waypointIndex 기준 teleportRadius 범위 내
   * 앞쪽 웨이포인트로 순간이동한다. 역행(뒤로 이동)은 허용하지 않는다.
   * @param {number} delta - ms
   * @private
   */
  _updateTeleport(delta) {
    this._teleportTimer += delta;
    if (this._teleportTimer < this.data_.teleportInterval) return;
    this._teleportTimer = 0;

    // 웨이포인트 배열에서 teleportRadius 이내의 앞쪽 후보 목록 수집
    const radius = this.data_.teleportRadius;
    const candidates = [];
    for (let i = this.waypointIndex + 1; i < this._waypoints.length; i++) {
      const wp = this._waypoints[i];
      const dist = Phaser.Math.Distance.Between(this.x, this.y, wp.x, wp.y);
      if (dist <= radius) {
        candidates.push(i);
      }
    }
    // 후보 없으면 스킵 (경로 끝에 가까울 때 발동 안 함)
    if (candidates.length === 0) return;

    // 후보 중 랜덤 선택
    const targetIdx = Phaser.Math.RND.pick(candidates);
    const targetWp = this._waypoints[targetIdx];

    // 순간이동 실행
    this.x = targetWp.x;
    this.y = targetWp.y;
    this.waypointIndex = targetIdx;
    this.setDepth(10 + Math.floor(this.y));
  }

  /** @private */
  _die() {
    if (this.isDead) return;
    this.isDead = true;
    this.active = false;

    // ── Phase 47-1/47-2: death 애니메이션 분기 ──
    const id = this.data_.id;
    const curDir = this._currentDir || 'south';
    // isBoss/isMidBoss prefix 결정 (constructor와 동일 로직)
    const deathPrefix = (this.data_.isBoss || this.data_.isMidBoss) ? 'boss' : 'enemy';
    const deathCheck = SpriteLoader.hasDeathAnim(this.scene, id, curDir, deathPrefix);

    if (deathCheck.exists && this._bodySprite?.anims) {
      // DYING 상태 전환: 이동/피격 차단
      this._animState = 'DYING';
      const deathAnimKey = `${deathPrefix}_${id}_death_${deathCheck.resolvedDir}`;
      this._bodySprite.play(deathAnimKey, true);

      // 애니메이션 완료 후 실제 제거
      this._bodySprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        // 씬 shutdown 안전장치
        if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
        this._executeDeath();
      });
    } else {
      // death anim 없음: 기존과 동일하게 즉시 제거
      this._executeDeath();
    }
  }

  /**
   * 실제 사망 처리 (이벤트 emit + destroy).
   * _die()에서 직접 호출하거나, death anim 완료 콜백에서 호출.
   * @private
   */
  _executeDeath() {
    // 중복 실행 방지
    if (this._deathExecuted) return;
    this._deathExecuted = true;

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

    // Phase 38-1: splitOnDeath (sugar_specter) — 사망 시 소형 버전 스폰
    // data_.splitOnDeath: { count, hpRatio, speedMultiplier, rewardRatio } 구조
    if (this.data_.splitOnDeath && !this._splitExecuted) {
      this._splitExecuted = true;
      const config = this.data_.splitOnDeath;
      for (let i = 0; i < config.count; i++) {
        this.scene.events.emit('enemy_deterministic_split', {
          type: this.data_.id + '_mini',  // 예: 'sugar_specter_mini'
          x: this.x + Phaser.Math.Between(-12, 12),
          y: this.y + Phaser.Math.Between(-6, 6),
          waypointIndex: this.waypointIndex,
          hpOverride: Math.floor(this.maxHp * config.hpRatio),
          speedMultiplier: config.speedMultiplier,
          rewardOverride: 0,
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
