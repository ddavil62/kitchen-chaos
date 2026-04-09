/**
 * @fileoverview 셰프 선택 씬.
 * Phase 6: 스테이지 선택 후, 게임 시작 전에 셰프를 고르는 화면.
 * Phase 7: GameScene → MarketScene 전환에 따라 씬 키 변경.
 * Phase 11-1: stageId='endless' 시 EndlessScene으로 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 버튼 Disabled 팔레트 적용.
 * 360x640 레이아웃: 3장의 세로 배치 카드 + "셰프 없이 시작" 버튼.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { CHEF_TYPES, CHEF_ORDER } from '../data/chefData.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { STAGES } from '../data/stageData.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

export class ChefSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChefSelectScene' });
  }

  /**
   * @param {{ stageId: string }} data
   */
  create(data) {
    this.stageId = data?.stageId || '1-1';
    // Phase 11-1: 엔드리스 모드 여부 판별
    this._isEndless = this.stageId === 'endless';
    const stageData = this._isEndless ? null : STAGES[this.stageId];
    const stageName = this._isEndless ? '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC' : (stageData?.nameKo || this.stageId);

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a);

    // ── 타이틀 ──
    this.add.text(GAME_WIDTH / 2, 30, '셰프를 선택하세요', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    const subTitle = this._isEndless
      ? `${stageName}`
      : `\uC2A4\uD14C\uC774\uC9C0: ${this.stageId} ${stageName}`;
    this.add.text(GAME_WIDTH / 2, 55, subTitle, {
      fontSize: '13px', color: this._isEndless ? '#cc88ff' : '#aaaaaa',
    }).setOrigin(0.5);

    // ── 셰프 카드 3장 (세로 배치) ──
    const previousChef = ChefManager.getSelectedChef();
    const cardStartY = 90;
    const cardHeight = 145;
    const cardGap = 10;

    /** @type {Phaser.GameObjects.Rectangle[]} */
    this._cardBgs = [];

    CHEF_ORDER.forEach((chefId, i) => {
      const chef = CHEF_TYPES[chefId];
      const cy = cardStartY + i * (cardHeight + cardGap) + cardHeight / 2;
      const isSelected = chefId === previousChef;

      this._createChefCard(chef, cy, isSelected);
    });

    // ── 하단: "셰프 없이 시작" 버튼 ──
    const skipY = GAME_HEIGHT - 50;
    // Phase 11-3b: Disabled 팔레트 적용
    const skipBtn = this.add.rectangle(GAME_WIDTH / 2, skipY, 200, 40, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, skipY, '셰프 없이 시작', {
      fontSize: '14px', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    skipBtn.on('pointerdown', () => {
      this._startGame(null);
    });
    skipBtn.on('pointerover', () => skipBtn.setFillStyle(0x666666));
    skipBtn.on('pointerout', () => skipBtn.setFillStyle(0x444444));

    // ── 뒤로 가기 버튼 ──
    const backBtn = this.add.rectangle(40, GAME_HEIGHT - 50, 60, 32, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(40, GAME_HEIGHT - 50, '< 뒤로', {
      fontSize: '11px', color: '#cccccc',
    }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Phase 11-1: 엔드리스에서 뒤로가기 시 메뉴로, 일반은 월드맵으로 복귀
        this.scene.start(this._isEndless ? 'MenuScene' : 'WorldMapScene');
      });
    });
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x666666));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x444444));
  }

  // ── 하드웨어 백버튼 (Phase 12) ──────────────────────────────────

  /**
   * 하드웨어 뒤로가기 핸들러.
   * 엔드리스 모드에서는 메뉴로, 일반 모드에서는 월드맵으로 복귀한다.
   */
  _onBack() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(this._isEndless ? 'MenuScene' : 'WorldMapScene');
    });
  }

  /**
   * 셰프 카드 생성.
   * @param {object} chef - CHEF_TYPES 항목
   * @param {number} cy - 카드 세로 중심
   * @param {boolean} isSelected - 이전 선택 셰프 여부
   * @private
   */
  _createChefCard(chef, cy, isSelected) {
    const cx = GAME_WIDTH / 2;
    const cardW = 320;
    const cardH = 145;

    // 카드 배경
    const bgColor = isSelected ? 0x2a3a2a : 0x1a1a2a;
    const borderColor = isSelected ? chef.color : 0x444466;
    const bg = this.add.rectangle(cx, cy, cardW, cardH, bgColor)
      .setStrokeStyle(2, borderColor)
      .setInteractive({ useHandCursor: true });
    this._cardBgs.push(bg);

    // 아이콘 + 이름
    const leftX = cx - cardW / 2 + 20;
    const chefSpriteKey = `chef_${chef.id}`;
    if (SpriteLoader.hasTexture(this, chefSpriteKey)) {
      // 스프라이트 이미지 (80x80 → 40px)
      const chefImg = this.add.image(leftX + 14, cy - 48, chefSpriteKey);
      chefImg.setScale(40 / chefImg.width);
    } else {
      // 이모지 fallback
      this.add.text(leftX, cy - 48, chef.icon, {
        fontSize: '28px',
      }).setOrigin(0, 0.5);
    }

    // 셰프 색상을 CSS hex 색상으로 변환
    const r = (chef.color >> 16) & 0xff;
    const g = (chef.color >> 8) & 0xff;
    const b = chef.color & 0xff;
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    this.add.text(leftX + 40, cy - 50, chef.nameKo, {
      fontSize: '16px', fontStyle: 'bold',
      color: hexColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // 패시브 설명
    this.add.text(leftX + 10, cy - 22, `패시브: ${chef.passiveDesc}`, {
      fontSize: '12px', color: '#88cc88',
    }).setOrigin(0, 0.5);

    // 스킬 이름 + 설명
    this.add.text(leftX + 10, cy + 2, `스킬: ${chef.skillName}`, {
      fontSize: '13px', fontStyle: 'bold', color: '#ffcc44',
    }).setOrigin(0, 0.5);

    this.add.text(leftX + 10, cy + 22, chef.skillDesc, {
      fontSize: '11px', color: '#cccccc',
    }).setOrigin(0, 0.5);

    // 쿨다운 표시
    const cooldownSec = chef.skillCooldown / 1000;
    this.add.text(leftX + 10, cy + 42, `쿨다운: ${cooldownSec}초`, {
      fontSize: '11px', color: '#888888',
    }).setOrigin(0, 0.5);

    // 선택 표시
    if (isSelected) {
      this.add.text(cx + cardW / 2 - 15, cy - 48, '✔', {
        fontSize: '20px', color: '#44ff44',
      }).setOrigin(1, 0.5);
    }

    // 클릭 이벤트
    bg.on('pointerdown', () => {
      ChefManager.selectChef(chef.id);
      this._startGame(chef.id);
    });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x2a2a3a);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor);
    });
  }

  /**
   * 게임 시작 (셰프 선택 후).
   * @param {string|null} chefId - 선택한 셰프 ID (null이면 셰프 없이 시작)
   * @private
   */
  _startGame(chefId) {
    if (chefId) {
      ChefManager.selectChef(chefId);
    } else {
      // 셰프 없이 시작: 세이브의 selectedChef를 null로 설정
      const saveData = SaveManager.load();
      saveData.selectedChef = null;
      SaveManager.save(saveData);
    }

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Phase 11-1: 엔드리스 모드 분기
      const targetScene = this._isEndless ? 'EndlessScene' : 'MarketScene';
      const targetStageId = this._isEndless ? '1-1' : this.stageId;
      this.scene.start(targetScene, { stageId: targetStageId });
    });
  }
}
