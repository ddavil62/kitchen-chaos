/**
 * @fileoverview 부트 씬. 게임 텍스처를 프로그래매틱으로 생성한다.
 * Phase 1은 PixelLab 에셋 없이 기하 도형으로 모든 오브젝트를 표현한다.
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // 모든 텍스처를 Graphics API로 생성
    this._createTileTextures();
    this._startGame();
  }

  /**
   * 게임에서 사용하는 텍스처를 모두 생성한다.
   * 실제 에셋 로딩 없이 Graphics.generateTexture를 사용한다.
   * @private
   */
  _createTileTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // ── 맵 타일 ──
    // 그라운드 타일 (40×40 녹색)
    g.clear();
    g.fillStyle(0x2d5a1b);
    g.fillRect(0, 0, 40, 40);
    g.lineStyle(1, 0x1e3d12, 0.5);
    g.strokeRect(0, 0, 40, 40);
    g.generateTexture('tile_ground', 40, 40);

    // 경로 타일 (40×40 갈색)
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
