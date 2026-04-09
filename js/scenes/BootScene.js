/**
 * @fileoverview 부트 씬. 스프라이트 에셋을 로드하고 프로그래매틱 텍스처를 생성한다.
 * Phase 9-4: SpriteLoader를 사용하여 PixelLab 에셋을 Phaser preload로 로드.
 */

import Phaser from 'phaser';
import { SpriteLoader } from '../managers/SpriteLoader.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * 에셋 로딩 (Phaser preload 단계).
   * SpriteLoader가 적/보스/타워/셰프/재료/타일셋 이미지를 로드 큐에 등록한다.
   */
  preload() {
    // ── 로딩 진행률 표시 ──
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    const progressBar = this.add.rectangle(cx, cy, 200, 16, 0x222222)
      .setStrokeStyle(1, 0x444444);
    const progressFill = this.add.rectangle(cx - 99, cy, 0, 12, 0xff6b35)
      .setOrigin(0, 0.5);
    const loadText = this.add.text(cx, cy + 20, '로딩 중...', {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressFill.width = 198 * value;
    });
    this.load.on('complete', () => {
      progressBar.destroy();
      progressFill.destroy();
      loadText.destroy();
    });

    // ── 스프라이트 에셋 로드 ──
    SpriteLoader.preload(this);
  }

  create() {
    // 프로그래매틱 텍스처 생성 (맵 타일 등)
    this._createTileTextures();
    this._startGame();
  }

  /**
   * 게임에서 사용하는 프로시저럴 텍스처를 생성한다.
   * @private
   */
  _createTileTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // ── 맵 타일 ──
    // 그라운드 타일 (40x40 녹색)
    g.clear();
    g.fillStyle(0x2d5a1b);
    g.fillRect(0, 0, 40, 40);
    g.lineStyle(1, 0x1e3d12, 0.5);
    g.strokeRect(0, 0, 40, 40);
    g.generateTexture('tile_ground', 40, 40);

    // 경로 타일 (40x40 갈색)
    g.clear();
    g.fillStyle(0xc8a46e);
    g.fillRect(0, 0, 40, 40);
    g.lineStyle(1, 0x8b6914, 0.3);
    g.strokeRect(0, 0, 40, 40);
    g.generateTexture('tile_path', 40, 40);

    g.destroy();
  }

  /**
   * 메뉴 씬으로 전환.
   * @private
   */
  _startGame() {
    this.scene.start('MenuScene');
  }
}
