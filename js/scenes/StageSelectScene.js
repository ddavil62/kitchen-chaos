/**
 * @fileoverview 스테이지 선택 씬.
 * Phase 4: 스테이지 리스트, 별점 표시, 잠금/해금.
 * Phase 6: 2장 동양 요리 식당 추가, 스크롤 지원.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { STAGES, STAGE_ORDER } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';

// ── 챕터별 스테이지 분류 ──
const CHAPTERS = [
  {
    id: 'ch1',
    nameKo: '1장: 파스타 레스토랑',
    titleColor: '#ffd700',
    strokeColor: '#8b4500',
    stages: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6'],
  },
  {
    id: 'ch2',
    nameKo: '2장: 동양 요리 식당',
    titleColor: '#88ccff',
    strokeColor: '#224488',
    stages: ['2-1', '2-2', '2-3'],
  },
];

export class StageSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageSelectScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a);

    // 스크롤 컨테이너
    this._scrollContainer = this.add.container(0, 0);

    // 전체 타이틀
    this._scrollContainer.add(
      this.add.text(GAME_WIDTH / 2, 30, '스테이지 선택', {
        fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5)
    );

    // 챕터별 렌더링
    let currentY = 60;
    const itemHeight = 85;
    const chapterGap = 30;

    CHAPTERS.forEach((chapter) => {
      // 챕터 헤더
      currentY += chapterGap;
      const headerBg = this.add.rectangle(GAME_WIDTH / 2, currentY, GAME_WIDTH - 20, 32, 0x222244, 0.8)
        .setStrokeStyle(1, 0x444466);
      this._scrollContainer.add(headerBg);

      const headerText = this.add.text(GAME_WIDTH / 2, currentY, chapter.nameKo, {
        fontSize: '18px', fontStyle: 'bold', color: chapter.titleColor,
        stroke: chapter.strokeColor, strokeThickness: 3,
      }).setOrigin(0.5);
      this._scrollContainer.add(headerText);

      currentY += 30;

      // 해당 챕터 스테이지 목록
      chapter.stages.forEach((stageId) => {
        currentY += itemHeight / 2 + 8;
        const stage = STAGES[stageId];
        const unlocked = SaveManager.isUnlocked(stageId);
        const stars = SaveManager.getStars(stageId);

        this._createStageItem(stageId, stage, currentY, unlocked, stars);
        currentY += itemHeight / 2 + 8;
      });
    });

    this._contentHeight = currentY + 80;

    // 하단 메인 메뉴 버튼 (고정, 스크롤 컨테이너 밖)
    const menuBtnY = GAME_HEIGHT - 35;
    this.add.rectangle(GAME_WIDTH / 2, menuBtnY, GAME_WIDTH, 70, 0x0d0d1a).setDepth(200);
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, menuBtnY, 180, 40, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(201);
    this.add.text(GAME_WIDTH / 2, menuBtnY, '메인 메뉴', {
      fontSize: '16px', color: '#cccccc', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(202);

    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x666666));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x444444));

    // 스크롤 입력
    this._setupScroll();
  }

  /**
   * 스크롤 입력 처리 (드래그 + 마우스 휠).
   * @private
   */
  _setupScroll() {
    const maxScroll = Math.max(0, this._contentHeight - GAME_HEIGHT + 70);
    this._scrollY = 0;

    // 드래그 스크롤
    let dragStartY = 0;
    let dragScrollY = 0;

    this.input.on('pointerdown', (pointer) => {
      dragStartY = pointer.y;
      dragScrollY = this._scrollY;
    });

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      const dy = pointer.y - dragStartY;
      this._scrollY = Phaser.Math.Clamp(dragScrollY - dy, 0, maxScroll);
      this._scrollContainer.y = -this._scrollY;
    });

    // 마우스 휠
    this.input.on('wheel', (_pointer, _gx, _gy, _gdx, dy) => {
      this._scrollY = Phaser.Math.Clamp(this._scrollY + dy * 0.5, 0, maxScroll);
      this._scrollContainer.y = -this._scrollY;
    });
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
    // 2장 스테이지는 다른 배경색
    const is2nd = stageId.startsWith('2-');
    const bgColor = unlocked ? (is2nd ? 0x0a2a3a : 0x2a1a0a) : 0x1a1a1a;
    const borderColor = unlocked ? (is2nd ? 0x2266aa : 0x8b6914) : 0x333333;

    // 배경
    const bg = this.add.rectangle(cx, y, 320, 75, bgColor)
      .setStrokeStyle(2, borderColor);
    this._scrollContainer.add(bg);

    if (unlocked) {
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', { stageId });
        });
      });
      bg.on('pointerover', () => bg.setFillStyle(is2nd ? 0x1a3a4a : 0x3a2a1a));
      bg.on('pointerout', () => bg.setFillStyle(bgColor));
    }

    // 스테이지 번호
    const numText = this.add.text(cx - 130, y - 10, stageId, {
      fontSize: '20px', fontStyle: 'bold',
      color: unlocked ? (is2nd ? '#4488cc' : '#ff6b35') : '#555555',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 0.5);
    this._scrollContainer.add(numText);

    // 스테이지 이름
    const nameText = this.add.text(cx - 70, y - 10, stage.nameKo, {
      fontSize: '15px',
      color: unlocked ? '#ffffff' : '#555555',
    }).setOrigin(0, 0.5);
    this._scrollContainer.add(nameText);

    // 웨이브 수
    const waveCount = stage.waves?.length || '?';
    const waveText = this.add.text(cx - 70, y + 12, `${waveCount} 웨이브`, {
      fontSize: '11px', color: unlocked ? '#aaaaaa' : '#444444',
    }).setOrigin(0, 0.5);
    this._scrollContainer.add(waveText);

    if (unlocked) {
      // 별점
      if (stars > 0) {
        const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        const starText = this.add.text(cx + 130, y - 6, starStr, {
          fontSize: '18px', color: '#ffd700',
        }).setOrigin(1, 0.5);
        this._scrollContainer.add(starText);
      } else {
        const unclearText = this.add.text(cx + 130, y - 6, '미클리어', {
          fontSize: '11px', color: '#888888',
        }).setOrigin(1, 0.5);
        this._scrollContainer.add(unclearText);
      }
    } else {
      // 잠금 표시
      const lockText = this.add.text(cx + 130, y, '🔒', {
        fontSize: '24px',
      }).setOrigin(1, 0.5);
      this._scrollContainer.add(lockText);
    }
  }
}
