/**
 * @fileoverview VFX 매니저. Canvas2D 호환 파티클/이펙트.
 * Phaser 3의 Graphics, Tween, Text를 활용한 경량 VFX 시스템.
 * Canvas2D 모드에서는 Phaser.GameObjects.Particles(WebGL 전용)를 사용 불가하므로
 * 기본 게임 오브젝트(Circle, Star, Rectangle, Text) + Tween으로 파티클을 시뮬레이션한다.
 *
 * Phase 10-5: 신규 생성.
 */

import Phaser from 'phaser';

// ── 상수 ──
const VFX_DEPTH = 1000;
const VFX_DEPTH_FLASH = 2000;
const VFX_DEPTH_TEXT = 1500;

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
      const particle = this.scene.add.circle(x, y, size, color);
      particle.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(isBoss ? 30 : 15, isBoss ? 80 : 40);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: isBoss ? 600 : 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
    // 보스 추가 금색 반짝임
    if (isBoss) {
      for (let i = 0; i < 10; i++) {
        const sparkle = this.scene.add.circle(x, y, 2, 0xffd700);
        sparkle.setDepth(VFX_DEPTH + 1);
        const angle = Math.random() * Math.PI * 2;
        const dist = Phaser.Math.Between(20, 60);
        this.scene.tweens.add({
          targets: sparkle,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist - 20,
          alpha: 0,
          duration: 800,
          ease: 'Quad.easeOut',
          onComplete: () => sparkle.destroy(),
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
      const sparkle = this.scene.add.circle(x, y, 2, 0xffd700);
      sparkle.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(10, 25);
      this.scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 15,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
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
      const p = this.scene.add.circle(x, y + 10, 2, color);
      p.setDepth(VFX_DEPTH);
      this.scene.tweens.add({
        targets: p,
        y: y - Phaser.Math.Between(20, 50),
        x: x + Phaser.Math.Between(-15, 15),
        alpha: 0,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
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
      const sparkle = this.scene.add.star(x, y, 4, 2, 5, 0xffd700);
      sparkle.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      this.scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20 - 10,
        alpha: 0,
        scale: 0.3,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
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
      const p = this.scene.add.circle(centerX, centerY, Phaser.Math.Between(2, 4), color);
      p.setDepth(VFX_DEPTH);
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 80);
      this.scene.tweens.add({
        targets: p,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
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

  // ── 정리 ──────────────────────────────────────────────────────

  /** 씬 파괴 시 정리 */
  destroy() {
    if (this._flashRect) {
      this._flashRect.destroy();
      this._flashRect = null;
    }
  }
}
