/**
 * @fileoverview 게임 오버 / 클리어 씬.
 * Phase 4: 별점, 통계, 스테이지 네비게이션.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { STAGES, STAGE_ORDER } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  /**
   * @param {{ score: number, isVictory: boolean, stageId?: string, lives?: number, starThresholds?: object }} data
   */
  init(data) {
    this.score = data.score || 0;
    this.isVictory = data.isVictory || false;
    this.stageId = data.stageId || '1-1';
    this.lives = data.lives || 0;
    this.starThresholds = data.starThresholds || { three: 12, two: 8 };
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT,
      this.isVictory ? 0x003300 : 0x330000);

    // 스테이지 이름
    const stageName = STAGES[this.stageId]?.nameKo || this.stageId;
    this.add.text(GAME_WIDTH / 2, 100, stageName, {
      fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // 결과 타이틀
    this.add.text(GAME_WIDTH / 2, 150,
      this.isVictory ? '🎉 주방 수호 성공!' : '💀 주방 점령당함...',
      {
        fontSize: '28px', fontStyle: 'bold',
        color: this.isVictory ? '#88ff88' : '#ff4444',
        stroke: '#000000', strokeThickness: 4,
        align: 'center',
      }
    ).setOrigin(0.5);

    // 별점 (클리어 시만)
    let stars = 0;
    if (this.isVictory) {
      if (this.lives >= this.starThresholds.three) stars = 3;
      else if (this.lives >= this.starThresholds.two) stars = 2;
      else stars = 1;

      // 세이브에 기록
      SaveManager.clearStage(this.stageId, stars);

      const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      this.add.text(GAME_WIDTH / 2, 210, starStr, {
        fontSize: '36px', color: '#ffd700',
        stroke: '#8b4500', strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // 통계
    const statsY = this.isVictory ? 270 : 230;
    const stats = [
      `처치한 적: ${this.score}���리`,
      `남은 생명: ❤️ ${this.lives}`,
    ];
    if (this.isVictory) stats.push(`획득 별점: ${'★'.repeat(stars)}`);

    this.add.text(GAME_WIDTH / 2, statsY, stats.join('\n'), {
      fontSize: '16px', color: '#ffffff', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    // 버튼 영역 (y 기준)
    let btnY = this.isVictory ? 380 : 360;

    // 다시하기 버튼
    this._createButton(btnY, '다시 하기', 0xff6b35, () => {
      this._fadeToScene('GameScene', { stageId: this.stageId });
    });
    btnY += 70;

    // 다음 스테이지 (클리어 시, 다음 스테이지가 있으면)
    if (this.isVictory) {
      const nextStageId = this._getNextStageId();
      if (nextStageId) {
        this._createButton(btnY, '다음 스테이지 ▶', 0x22aa44, () => {
          this._fadeToScene('GameScene', { stageId: nextStageId });
        });
        btnY += 70;
      }
    }

    // 스테이지 선택 버튼
    this._createButton(btnY, '스테이지 선택', 0x444444, () => {
      this._fadeToScene('StageSelectScene');
    });
  }

  /**
   * 다음 스테이지 ID 반환.
   * @returns {string|null}
   */
  _getNextStageId() {
    const idx = STAGE_ORDER.indexOf(this.stageId);
    if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1];
  }

  /**
   * 버튼 생성 헬퍼.
   * @param {number} y
   * @param {string} label
   * @param {number} color
   * @param {Function} onClick
   */
  _createButton(y, label, color, onClick) {
    const btn = this.add.rectangle(GAME_WIDTH / 2, y, 200, 50, color)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, y, label, {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => btn.setFillStyle(Phaser.Display.Color.ValueToColor(color).lighten(30).color));
    btn.on('pointerout', () => btn.setFillStyle(color));
  }

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   * @param {object} [data]
   */
  _fadeToScene(sceneKey, data) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey, data);
    });
  }
}
