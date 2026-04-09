/**
 * @fileoverview 스테이지 선택 씬.
 * Phase 4: 3개 스테���지 리스트, 별점 표시, 잠금/해금.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { STAGES, STAGE_ORDER } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';

export class StageSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageSelectScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a00);

    // 테마 타이틀
    this.add.text(GAME_WIDTH / 2, 60, '파스타 레스토랑', {
      fontSize: '28px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#8b4500', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 100, '스테이지를 선택하세요', {
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // 스테이지 리스트
    const startY = 160;
    const itemHeight = 100;

    STAGE_ORDER.forEach((stageId, index) => {
      const stage = STAGES[stageId];
      const y = startY + index * itemHeight;
      const unlocked = SaveManager.isUnlocked(stageId);
      const stars = SaveManager.getStars(stageId);

      this._createStageItem(stageId, stage, y, unlocked, stars);
    });

    // 하단: 메인 메뉴 버튼
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, 180, 45, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '메인 메뉴', {
      fontSize: '16px', color: '#cccccc', stroke: '#000', strokeThickness: 2,
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

  /**
   * 스테이지 항목 생성.
   * @param {string} stageId
   * @param {object} stage
   * @param {number} y
   * @param {boolean} unlocked
   * @param {number} stars
   */
  _createStageItem(stageId, stage, y, unlocked, stars) {
    const cx = GAME_WIDTH / 2;
    const bgColor = unlocked ? 0x2a1a0a : 0x1a1a1a;
    const borderColor = unlocked ? 0x8b6914 : 0x333333;

    // 배경
    const bg = this.add.rectangle(cx, y, 320, 80, bgColor)
      .setStrokeStyle(2, borderColor);

    if (unlocked) {
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', { stageId });
        });
      });
      bg.on('pointerover', () => bg.setFillStyle(0x3a2a1a));
      bg.on('pointerout', () => bg.setFillStyle(bgColor));
    }

    // 스테이지 번호
    this.add.text(cx - 130, y - 12, stageId, {
      fontSize: '22px', fontStyle: 'bold',
      color: unlocked ? '#ff6b35' : '#555555',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // 스테이지 이름
    this.add.text(cx - 70, y - 12, stage.nameKo, {
      fontSize: '16px',
      color: unlocked ? '#ffffff' : '#555555',
    }).setOrigin(0, 0.5);

    // 웨이브 수
    const waveCount = stage.waves?.length || '?';
    this.add.text(cx - 70, y + 14, `${waveCount} 웨이브`, {
      fontSize: '12px', color: unlocked ? '#aaaaaa' : '#444444',
    }).setOrigin(0, 0.5);

    if (unlocked) {
      // 별점
      if (stars > 0) {
        const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.add.text(cx + 130, y - 8, starStr, {
          fontSize: '20px', color: '#ffd700',
        }).setOrigin(1, 0.5);
      } else {
        this.add.text(cx + 130, y - 8, '미클리어', {
          fontSize: '12px', color: '#888888',
        }).setOrigin(1, 0.5);
      }
    } else {
      // 잠금 표시
      this.add.text(cx + 130, y, '🔒', {
        fontSize: '28px',
      }).setOrigin(1, 0.5);
    }
  }
}
