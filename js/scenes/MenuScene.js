/**
 * @fileoverview 메뉴 씬. 타이틀 화면과 게임 시작 버튼을 표시한다.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveManager } from '../managers/SaveManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // 배경 그라디언트 효과
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a00);

    // 장식 원들 (카툰 느낌)
    [
      { x: 40, y: 100, r: 30, c: 0xff6b35, a: 0.3 },
      { x: 320, y: 200, r: 50, c: 0xdc143c, a: 0.2 },
      { x: 80, y: 500, r: 40, c: 0xffd700, a: 0.2 },
    ].forEach(o => {
      this.add.circle(o.x, o.y, o.r, o.c, o.a);
    });

    // 타이틀
    this.add.text(GAME_WIDTH / 2, 160, 'Kitchen', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#8b4500',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 220, 'Chaos', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ff6b35',
      stroke: '#8b0000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 275, 'Defense', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 부제목
    this.add.text(GAME_WIDTH / 2, 320, '주방을 지켜라!', {
      fontSize: '18px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // 게임 시작 버튼
    const btn = this.add.rectangle(GAME_WIDTH / 2, 420, 200, 60, 0xff6b35)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 420, '▶ 게임 시작', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('StageSelectScene');
      });
    });

    btn.on('pointerover', () => btn.setFillStyle(0xff8c00));
    btn.on('pointerout', () => btn.setFillStyle(0xff6b35));

    // 펄싱 애니메이션
    this.tweens.add({
      targets: btn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // 상점 버튼
    const shopBtn = this.add.rectangle(GAME_WIDTH / 2, 490, 160, 40, 0x886600)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 490, '🪙 주방 상점', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    shopBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ShopScene');
      });
    });
    shopBtn.on('pointerover', () => shopBtn.setFillStyle(0xaa8800));
    shopBtn.on('pointerout', () => shopBtn.setFillStyle(0x886600));

    // 도감 버튼
    const bookBtn = this.add.rectangle(GAME_WIDTH / 2, 540, 160, 36, 0x336644)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 540, '📖 레시피 도감', {
      fontSize: '14px', fontStyle: 'bold', color: '#88ffaa',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    bookBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('RecipeCollectionScene');
      });
    });
    bookBtn.on('pointerover', () => bookBtn.setFillStyle(0x448855));
    bookBtn.on('pointerout', () => bookBtn.setFillStyle(0x336644));

    // 평판 + 수집률
    const { current, max } = SaveManager.getTotalStars();
    const { unlocked, total, percent } = RecipeManager.getCollectionProgress();
    this.add.text(GAME_WIDTH / 2, 578, `⭐ ${current}/${max}    📖 ${unlocked}/${total} (${percent}%)`, {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // 하단 설명
    this.add.text(GAME_WIDTH / 2, 610, '적을 처치하면 재료가 드롭됩니다\n재료를 모아 요리하면 타워가 강해집니다', {
      fontSize: '12px',
      color: '#777777',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // 페이드인
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
