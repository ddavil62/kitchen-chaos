/**
 * @fileoverview 게임 오버 / 클리어 씬.
 */

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  /**
   * @param {{ score: number, isVictory: boolean }} data
   */
  init(data) {
    this.score = data.score || 0;
    this.isVictory = data.isVictory || false;
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT,
      this.isVictory ? 0x003300 : 0x330000);

    // 결과 타이틀
    this.add.text(GAME_WIDTH / 2, 180,
      this.isVictory ? '🎉 주방 수호 성공!' : '💀 주방 점령당함...',
      {
        fontSize: '28px', fontStyle: 'bold',
        color: this.isVictory ? '#88ff88' : '#ff4444',
        stroke: '#000000', strokeThickness: 4,
        align: 'center',
      }
    ).setOrigin(0.5);

    // 점수
    this.add.text(GAME_WIDTH / 2, 280, `처치한 적: ${this.score}마리`, {
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);

    // 다시하기 버튼
    const retryBtn = this.add.rectangle(GAME_WIDTH / 2, 400, 200, 55, 0xff6b35)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 400, '다시 하기', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    retryBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });
    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0xff8c00));
    retryBtn.on('pointerout', () => retryBtn.setFillStyle(0xff6b35));

    // 메인 메뉴 버튼
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, 480, 200, 55, 0x444444)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 480, '메인 메뉴', {
      fontSize: '22px', color: '#cccccc',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x666666));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x444444));
  }
}
