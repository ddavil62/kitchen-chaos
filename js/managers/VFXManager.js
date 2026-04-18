/**
 * @fileoverview VFX 매니저. Canvas2D 호환 파티클/이펙트.
 * Phaser 3의 Graphics, Tween, Text를 활용한 경량 VFX 시스템.
 * Canvas2D 모드에서는 Phaser.GameObjects.Particles(WebGL 전용)를 사용 불가하므로
 * 기본 게임 오브젝트(Circle, Star, Rectangle, Text) + Tween으로 파티클을 시뮬레이션한다.
 *
 * Phase 10-5: 신규 생성.
 * Phase 11-3c: ObjectPool 기반 파티클 재활용, TTL 초과 파티클 자동 정리.
 */

import Phaser from 'phaser';
import { ObjectPool } from './ObjectPool.js';

// ── 상수 ──
const VFX_DEPTH = 1000;
const VFX_DEPTH_FLASH = 2000;
const VFX_DEPTH_TEXT = 1500;

/** 파티클 풀 최대 크기 (효과별) */
const CIRCLE_POOL_MAX = 40;
const STAR_POOL_MAX = 20;

/** 파티클 TTL 최대값 (ms) — 이 시간이 지나면 강제 정리 */
const PARTICLE_TTL_MAX = 2000;

/**
 * 씬별 VFX 인스턴스. 씬 파괴 시 반드시 destroy()를 호출한다.
 */
export class VFXManager {
  /**
   * @param {Phaser.Scene} scene - VFX를 렌더링할 씬
   */
  constructor(scene) {
    /** @type {Phaser.Scene} */
    this.scene = scene;
    /** @type {Phaser.GameObjects.Rectangle|null} 화면 플래시 오버레이 */
    this._flashRect = null;

    // ── 파티클 풀 초기화 (Phase 11-3c) ──

    /** @private 원형 파티클 풀 */
    this._circlePool = new ObjectPool(
      () => this._createCircle(),
      (obj) => this._resetCircle(obj),
      { maxSize: CIRCLE_POOL_MAX },
    );

    /** @private 별 파티클 풀 */
    this._starPool = new ObjectPool(
      () => this._createStar(),
      (obj) => this._resetStar(obj),
      { maxSize: STAR_POOL_MAX },
    );

    /** @private @type {{ obj: Phaser.GameObjects.GameObject, pool: ObjectPool, spawnTime: number }[]} 활성 파티클 추적 */
    this._activeParticles = [];
  }

  // ── 풀 팩토리/리셋 (Phase 11-3c) ──────────────────────────────────

  /**
   * 원형 파티클 게임오브젝트 생성.
   * @returns {Phaser.GameObjects.Arc}
   * @private
   */
  _createCircle() {
    const c = this.scene.add.circle(0, 0, 3, 0xffffff);
    c.setDepth(VFX_DEPTH);
    c.setVisible(false);
    c.setActive(false);
    return c;
  }

  /**
   * 원형 파티클 리셋 (풀에서 꺼낼 때).
   * @param {Phaser.GameObjects.Arc} obj
   * @private
   */
  _resetCircle(obj) {
    obj.setVisible(true);
    obj.setActive(true);
    obj.setAlpha(1);
    obj.setScale(1);
    obj.setDepth(VFX_DEPTH);
  }

  /**
   * 별 파티클 게임오브젝트 생성.
   * @returns {Phaser.GameObjects.Star}
   * @private
   */
  _createStar() {
    const s = this.scene.add.star(0, 0, 4, 2, 5, 0xffd700);
    s.setDepth(VFX_DEPTH);
    s.setVisible(false);
    s.setActive(false);
    return s;
  }

  /**
   * 별 파티클 리셋 (풀에서 꺼낼 때).
   * @param {Phaser.GameObjects.Star} obj
   * @private
   */
  _resetStar(obj) {
    obj.setVisible(true);
    obj.setActive(true);
    obj.setAlpha(1);
    obj.setScale(1);
    obj.setDepth(VFX_DEPTH);
  }

  /**
   * 파티클을 풀에서 꺼내고 활성 목록에 등록한다.
   * @param {ObjectPool} pool
   * @returns {Phaser.GameObjects.GameObject}
   * @private
   */
  _acquireParticle(pool) {
    const obj = pool.acquire();
    this._activeParticles.push({ obj, pool, spawnTime: Date.now() });
    return obj;
  }

  /**
   * 파티클을 숨기고 풀에 반환한다.
   * @param {Phaser.GameObjects.GameObject} obj
   * @param {ObjectPool} pool
   * @private
   */
  _releaseParticle(obj, pool) {
    obj.setVisible(false);
    obj.setActive(false);
    pool.release(obj);
    // 활성 목록에서 제거
    const idx = this._activeParticles.findIndex(p => p.obj === obj);
    if (idx !== -1) this._activeParticles.splice(idx, 1);
  }

  /**
   * TTL 초과 파티클 강제 정리.
   * 매 프레임 update에서 호출할 수도 있고, 주기적으로 호출할 수도 있다.
   * 외부(씬)에서 필요 시 호출.
   */
  cleanupExpiredParticles() {
    const now = Date.now();
    for (let i = this._activeParticles.length - 1; i >= 0; i--) {
      const entry = this._activeParticles[i];
      if (now - entry.spawnTime > PARTICLE_TTL_MAX) {
        entry.obj.setVisible(false);
        entry.obj.setActive(false);
        entry.pool.release(entry.obj);
        this._activeParticles.splice(i, 1);
      }
    }
  }

  // ── 파티클 이펙트 ──────────────────────────────────────────────

  /**
   * 적 사망 파티클 -- 작은 원 8~12개 사방으로 흩어짐.
   * 보스는 20개 + 추가 금색 반짝임.
   * @param {number} x
   * @param {number} y
   * @param {number} color - 적의 bodyColor
   * @param {boolean} [isBoss=false]
   */
  enemyDeath(x, y, color, isBoss = false) {
    const count = isBoss ? 20 : 8;
    for (let i = 0; i < count; i++) {
      const size = isBoss ? Phaser.Math.Between(3, 6) : Phaser.Math.Between(2, 4);
      const particle = this._acquireParticle(this._circlePool);
      particle.setPosition(x, y);
      particle.setRadius(size);
      particle.setFillStyle(color);
      particle.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(isBoss ? 30 : 15, isBoss ? 80 : 40);
      const pool = this._circlePool;
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: isBoss ? 600 : 400,
        ease: 'Quad.easeOut',
        onComplete: () => this._releaseParticle(particle, pool),
      });
    }
    // 보스 추가 금색 반짝임
    if (isBoss) {
      for (let i = 0; i < 10; i++) {
        const sparkle = this._acquireParticle(this._circlePool);
        sparkle.setPosition(x, y);
        sparkle.setRadius(2);
        sparkle.setFillStyle(0xffd700);
        sparkle.setDepth(VFX_DEPTH + 1);
        const angle = Math.random() * Math.PI * 2;
        const dist = Phaser.Math.Between(20, 60);
        const pool = this._circlePool;
        this.scene.tweens.add({
          targets: sparkle,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist - 20,
          alpha: 0,
          duration: 800,
          ease: 'Quad.easeOut',
          onComplete: () => this._releaseParticle(sparkle, pool),
        });
      }
    }
  }

  /**
   * 재료 수거 반짝이 -- 금색 작은 원 5개 위로 흩어짐.
   * @param {number} x
   * @param {number} y
   */
  ingredientCollect(x, y) {
    for (let i = 0; i < 5; i++) {
      const sparkle = this._acquireParticle(this._circlePool);
      sparkle.setPosition(x, y);
      sparkle.setRadius(2);
      sparkle.setFillStyle(0xffd700);
      sparkle.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(10, 25);
      const pool = this._circlePool;
      this.scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 15,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => this._releaseParticle(sparkle, pool),
      });
    }
  }

  /**
   * 버프 활성화 오라 -- 초록/금색 원이 위로 상승.
   * @param {number} x
   * @param {number} y
   */
  buffActivate(x, y) {
    for (let i = 0; i < 10; i++) {
      const color = Math.random() > 0.5 ? 0x44ff44 : 0xffd700;
      const p = this._acquireParticle(this._circlePool);
      p.setPosition(x, y + 10);
      p.setRadius(2);
      p.setFillStyle(color);
      p.setDepth(VFX_DEPTH);
      const pool = this._circlePool;
      this.scene.tweens.add({
        targets: p,
        y: y - Phaser.Math.Between(20, 50),
        x: x + Phaser.Math.Between(-15, 15),
        alpha: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => this._releaseParticle(p, pool),
      });
    }
  }

  /**
   * 서빙 성공 반짝 -- 금색 별 6개 흩어짐.
   * @param {number} x
   * @param {number} y
   */
  serveSuccess(x, y) {
    for (let i = 0; i < 6; i++) {
      const sparkle = this._acquireParticle(this._starPool);
      sparkle.setPosition(x, y);
      sparkle.setFillStyle(0xffd700);
      sparkle.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const pool = this._starPool;
      this.scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20 - 10,
        alpha: 0,
        scale: 0.3,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => this._releaseParticle(sparkle, pool),
      });
    }
  }

  /**
   * 콤보 폭발 이펙트 -- 5콤보 이상 시 화면 가장자리 금색 반짝임.
   * @param {number} centerX
   * @param {number} centerY
   */
  comboBurst(centerX, centerY) {
    for (let i = 0; i < 15; i++) {
      const color = [0xff4444, 0xff8800, 0xffd700][Phaser.Math.Between(0, 2)];
      const p = this._acquireParticle(this._circlePool);
      p.setPosition(centerX, centerY);
      p.setRadius(Phaser.Math.Between(2, 4));
      p.setFillStyle(color);
      p.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 80);
      const pool = this._circlePool;
      this.scene.tweens.add({
        targets: p,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => this._releaseParticle(p, pool),
      });
    }
  }

  // ── 화면 효과 ──────────────────────────────────────────────────

  /**
   * 화면 플래시 -- 지정 색상으로 화면을 덮고 페이드 아웃.
   * @param {number} [color=0xffffff] - 플래시 색상
   * @param {number} [alpha=0.3] - 최대 알파
   * @param {number} [duration=200] - ms
   */
  screenFlash(color = 0xffffff, alpha = 0.3, duration = 200) {
    if (this._flashRect) this._flashRect.destroy();
    this._flashRect = this.scene.add.rectangle(180, 320, 360, 640, color, alpha);
    this._flashRect.setDepth(VFX_DEPTH_FLASH);
    this.scene.tweens.add({
      targets: this._flashRect,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this._flashRect) {
          this._flashRect.destroy();
          this._flashRect = null;
        }
      },
    });
  }

  /**
   * 화면 흔들림.
   * @param {number} [intensity=3] - px
   * @param {number} [duration=200] - ms
   */
  screenShake(intensity = 3, duration = 200) {
    this.scene.cameras.main.shake(duration, intensity / 360);
  }

  // ── 플로팅 텍스트 ──────────────────────────────────────────────

  /**
   * 골드 플로팅 (+Ng) -- 위로 떠오르며 페이드 아웃.
   * @param {number} x
   * @param {number} y
   * @param {number} amount
   */
  goldPopup(x, y, amount) {
    const text = this.scene.add.text(x, y, `+${amount}g`, {
      fontSize: '14px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT);
    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 범용 플로팅 텍스트 — 지정 텍스트/색상/크기로 위로 떠오르며 페이드 아웃.
   * 정수 드롭("💠 +N 정수!"), 스페셜 보너스 등 다목적으로 사용한다.
   * @param {number} x
   * @param {number} y
   * @param {string} text - 표시할 텍스트
   * @param {string} [color='#ffffff'] - CSS 색상 문자열
   * @param {number} [fontSize=14] - 폰트 크기 (px)
   */
  floatingText(x, y, text, color = '#ffffff', fontSize = 14) {
    const t = this.scene.add.text(x, y, text, {
      fontSize: `${fontSize}px`, fontStyle: 'bold', color,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT);
    this.scene.tweens.add({
      targets: t,
      y: y - 35,
      alpha: 0,
      duration: 1100,
      ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  /**
   * 콤보 텍스트 (xN COMBO!) -- 화면 중앙 확대/축소 연출.
   * @param {number} count - 콤보 수
   */
  comboPopup(count) {
    const size = Math.min(12 + count * 2, 28);
    const color = count >= 10 ? '#ff4444' : count >= 5 ? '#ff8800' : '#ffcc00';
    const text = this.scene.add.text(180, 320, `x${count} COMBO!`, {
      fontSize: `${size}px`, fontStyle: 'bold', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT).setScale(1.5);
    this.scene.tweens.add({
      targets: text,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: 300,
      duration: 800,
      delay: 300,
      ease: 'Quad.easeIn',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 웨이브 시작 알림 (WAVE N!) -- 좌에서 우로 슬라이드.
   * @param {number} waveNum
   */
  waveAnnounce(waveNum) {
    const text = this.scene.add.text(-50, 320, `WAVE ${waveNum}!`, {
      fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT);
    this.scene.tweens.add({
      targets: text,
      x: 180,
      duration: 400,
      ease: 'Quad.easeOut',
    });
    this.scene.tweens.add({
      targets: text,
      x: 410,
      alpha: 0,
      duration: 400,
      delay: 600,
      ease: 'Quad.easeIn',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * 보스 등장 (BOSS!) -- 중앙 줌인 + 흔들림.
   */
  bossAnnounce() {
    const text = this.scene.add.text(180, 320, 'BOSS!', {
      fontSize: '32px', fontStyle: 'bold', color: '#ff4444',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT).setScale(0);
    this.scene.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 500,
      ease: 'Back.easeOut',
    });
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      delay: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => text.destroy(),
    });
    this.screenShake(6, 500);
    this.screenFlash(0xff0000, 0.2, 300);
  }

  /**
   * 클리어 (CLEAR!) -- 중앙 확대 + 금색 플래시.
   */
  clearAnnounce() {
    const text = this.scene.add.text(180, 320, 'CLEAR!', {
      fontSize: '28px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT).setScale(0);
    this.scene.tweens.add({
      targets: text,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      duration: 800,
      delay: 1200,
      ease: 'Quad.easeIn',
      onComplete: () => text.destroy(),
    });
    this.screenFlash(0xffd700, 0.3, 400);
  }

  /**
   * 손님 이모지 (서빙 성공/퇴장) -- 위로 떠오르며 페이드 아웃.
   * @param {number} x
   * @param {number} y
   * @param {boolean} [happy=true] - true: 만족, false: 불만
   */
  customerEmoji(x, y, happy = true) {
    const emoji = happy ? '\uD83D\uDE0A' : '\uD83D\uDE24'; // 😊 / 😤
    const text = this.scene.add.text(x, y, emoji, {
      fontSize: '16px',
    }).setOrigin(0.5).setDepth(VFX_DEPTH_TEXT);
    this.scene.tweens.add({
      targets: text,
      y: y - 25,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  // ── 업적 토스트 (Phase 42) ────────────────────────────────────

  /**
   * 업적 달성 토스트 알림.
   * 정적 메서드로 씬에 직접 오브젝트를 생성한다 (VFXManager 인스턴스 불필요).
   * @param {Phaser.Scene} scene - 토스트를 표시할 씬
   * @param {string} nameKo - 업적 한국어 이름
   */
  static achievementToast(scene, nameKo) {
    // 씬 활성 상태 검사
    if (!scene?.sys?.isActive()) return;

    const cx = 180; // GAME_WIDTH / 2
    const toastY = 80;
    const toastW = 280;
    const toastH = 40;
    const depth = 2500;

    // 배경 사각형
    const bg = scene.add.rectangle(cx, toastY, toastW, toastH, 0x2a1500)
      .setStrokeStyle(2, 0xffd700)
      .setDepth(depth)
      .setAlpha(0.95)
      .setScale(0, 1);

    // 텍스트
    const text = scene.add.text(cx, toastY, `\uD83C\uDFC6 \uC5C5\uC801 \uB2EC\uC131! ${nameKo}`, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(depth + 1).setScale(0, 1);

    // 등장 애니메이션: scaleX 0 -> 1 (150ms)
    scene.tweens.add({
      targets: [bg, text],
      scaleX: 1,
      duration: 150,
      ease: 'Back.easeOut',
    });

    // 퇴장 애니메이션: 1.5초 후 alpha 0 -> destroy (300ms)
    scene.tweens.add({
      targets: [bg, text],
      alpha: 0,
      duration: 300,
      delay: 1500,
      ease: 'Quad.easeIn',
      onComplete: () => {
        bg.destroy();
        text.destroy();
      },
    });
  }

  // ── 정리 ──────────────────────────────────────────────────────

  /** 씬 파괴 시 정리. 모든 활성 파티클과 풀을 해제한다. */
  destroy() {
    if (this._flashRect) {
      this._flashRect.destroy();
      this._flashRect = null;
    }

    // Phase 11-3c: 활성 파티클 정리 후 풀 비우기
    for (const entry of this._activeParticles) {
      if (entry.obj && entry.obj.destroy) {
        entry.obj.destroy();
      }
    }
    this._activeParticles.length = 0;

    // 풀에 남은 오브젝트도 파괴 (씬 전환 시 게임 오브젝트 누수 방지)
    this._destroyPoolObjects(this._circlePool);
    this._destroyPoolObjects(this._starPool);
  }

  /**
   * 풀 내부의 모든 게임 오브젝트를 파괴한다.
   * @param {ObjectPool} pool
   * @private
   */
  _destroyPoolObjects(pool) {
    // 풀에서 모든 오브젝트를 꺼내 파괴
    while (pool.availableCount > 0) {
      const obj = pool.acquire();
      if (obj && obj.destroy) {
        obj.destroy();
      }
    }
    pool.clear();
  }
}
