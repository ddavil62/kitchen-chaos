/**
 * @fileoverview 셰프 선택 씬.
 * Phase 6: 스테이지 선택 후, 게임 시작 전에 셰프를 고르는 화면.
 * Phase 7: GameScene -> MarketScene 전환에 따라 씬 키 변경.
 * Phase 11-1: stageId='endless' 시 EndlessScene으로 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 버튼 Disabled 팔레트 적용.
 * Phase 19-2: 5종 카드 리레이아웃 + 시즌2 셰프 잠금 표시.
 * 360x640 레이아웃: 5장의 세로 배치 카드 + "셰프 없이 시작" 버튼.
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

    // ── 타이틀 (Phase 19-2: y 30->20) ──
    this.add.text(GAME_WIDTH / 2, 20, '\uC170\uD504\uB97C \uC120\uD0DD\uD558\uC138\uC694', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── 서브타이틀 (Phase 19-2: y 55->38) ──
    const subTitle = this._isEndless
      ? `${stageName}`
      : `\uC2A4\uD14C\uC774\uC9C0: ${this.stageId} ${stageName}`;
    this.add.text(GAME_WIDTH / 2, 38, subTitle, {
      fontSize: '13px', color: this._isEndless ? '#cc88ff' : '#aaaaaa',
    }).setOrigin(0.5);

    // ── 셰프 카드 5장 (세로 배치, Phase 19-2: 축소 레이아웃) ──
    const previousChef = ChefManager.getSelectedChef();
    const cardStartY = 55;
    const cardHeight = 100;
    const cardGap = 8;

    /** @type {Phaser.GameObjects.Rectangle[]} */
    this._cardBgs = [];

    // Phase 19-2: 잠금 판별용 세이브 로드
    const save = SaveManager.load();

    CHEF_ORDER.forEach((chefId, i) => {
      const chef = CHEF_TYPES[chefId];
      const cy = cardStartY + i * (cardHeight + cardGap) + cardHeight / 2;
      const isSelected = chefId === previousChef;
      // Phase 19-2: 시즌2 미해금 시 yuki_chef, lao_chef 잠금
      const isLocked = !save.season2Unlocked &&
        (chefId === 'yuki_chef' || chefId === 'lao_chef');

      this._createChefCard(chef, cy, isSelected, isLocked);
    });

    // ── 하단: "셰프 없이 시작" 버튼 (Phase 19-2: y -> 600) ──
    const skipY = 600;
    // Phase 11-3b: Disabled 팔레트 적용
    const skipBtn = this.add.rectangle(GAME_WIDTH / 2, skipY, 200, 40, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, skipY, '\uC170\uD504 \uC5C6\uC774 \uC2DC\uC791', {
      fontSize: '14px', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    skipBtn.on('pointerdown', () => {
      this._startGame(null);
    });
    skipBtn.on('pointerover', () => skipBtn.setFillStyle(0x666666));
    skipBtn.on('pointerout', () => skipBtn.setFillStyle(0x444444));

    // ── 뒤로 가기 버튼 (Phase 19-2: y -> 600) ──
    const backBtn = this.add.rectangle(40, 600, 60, 32, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(40, 600, '< \uB4A4\uB85C', {
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
   * Phase 19-2: 카드 높이 100px, 폰트 축소, 잠금 로직 추가.
   * @param {object} chef - CHEF_TYPES 항목
   * @param {number} cy - 카드 세로 중심
   * @param {boolean} isSelected - 이전 선택 셰프 여부
   * @param {boolean} isLocked - 시즌2 미해금 잠금 여부
   * @private
   */
  _createChefCard(chef, cy, isSelected, isLocked) {
    const cx = GAME_WIDTH / 2;
    const cardW = 320;
    const cardH = 100;

    // ── 잠금 상태: 어두운 배경 + 회색 테두리 ──
    let bgColor, borderColor;
    if (isLocked) {
      bgColor = 0x1a1a1a;
      borderColor = 0x333333;
    } else {
      bgColor = isSelected ? 0x2a3a2a : 0x1a1a2a;
      borderColor = isSelected ? chef.color : 0x444466;
    }

    const bg = this.add.rectangle(cx, cy, cardW, cardH, bgColor)
      .setStrokeStyle(2, borderColor);

    // 잠금 카드는 인터랙션 제거
    if (!isLocked) {
      bg.setInteractive({ useHandCursor: true });
    }
    this._cardBgs.push(bg);

    // 아이콘 + 이름
    const leftX = cx - cardW / 2 + 20;
    const textColor = isLocked ? '#555555' : null;  // 잠금 시 모든 텍스트 회색

    const chefSpriteKey = `chef_${chef.id}`;
    if (SpriteLoader.hasTexture(this, chefSpriteKey)) {
      // 스프라이트 이미지 (Phase 19-2: 스케일 40->32)
      const chefImg = this.add.image(leftX + 14, cy - 32, chefSpriteKey);
      chefImg.setScale(32 / chefImg.width);
      if (isLocked) chefImg.setAlpha(0.3);
    } else {
      // 이모지 fallback (Phase 19-2: 폰트 28->24)
      const iconText = this.add.text(leftX, cy - 32, chef.icon, {
        fontSize: '24px',
      }).setOrigin(0, 0.5);
      if (isLocked) iconText.setAlpha(0.3);
    }

    // 셰프 색상을 CSS hex 색상으로 변환
    let hexColor;
    if (isLocked) {
      hexColor = '#555555';
    } else {
      const r = (chef.color >> 16) & 0xff;
      const g = (chef.color >> 8) & 0xff;
      const b = chef.color & 0xff;
      hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // 셰프 이름 (Phase 19-2: y cy-50->cy-34, 폰트 16->15)
    this.add.text(leftX + 40, cy - 34, chef.nameKo, {
      fontSize: '15px', fontStyle: 'bold',
      color: hexColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // 패시브 설명 (Phase 19-2: y cy-22->cy-14, 폰트 12->11)
    this.add.text(leftX + 10, cy - 14, `\uD328\uC2DC\uBE0C: ${chef.passiveDesc}`, {
      fontSize: '11px', color: textColor || '#88cc88',
    }).setOrigin(0, 0.5);

    // 스킬 이름 (Phase 19-2: y cy+2->cy+4, 폰트 13->12)
    this.add.text(leftX + 10, cy + 4, `\uC2A4\uD0AC: ${chef.skillName}`, {
      fontSize: '12px', fontStyle: 'bold', color: textColor || '#ffcc44',
    }).setOrigin(0, 0.5);

    // 스킬 설명 (Phase 19-2: y cy+22->cy+18, 폰트 11->10)
    this.add.text(leftX + 10, cy + 18, chef.skillDesc, {
      fontSize: '10px', color: textColor || '#cccccc',
    }).setOrigin(0, 0.5);

    // 쿨다운 표시 (Phase 19-2: y cy+42->cy+32, 폰트 11->10)
    const cooldownSec = chef.skillCooldown / 1000;
    this.add.text(leftX + 10, cy + 32, `\uCFE8\uB2E4\uC6B4: ${cooldownSec}\uCD08`, {
      fontSize: '10px', color: textColor || '#888888',
    }).setOrigin(0, 0.5);

    // 선택 표시 (Phase 19-2: y cy-48->cy-32)
    if (isSelected && !isLocked) {
      this.add.text(cx + cardW / 2 - 15, cy - 32, '\u2714', {
        fontSize: '20px', color: '#44ff44',
      }).setOrigin(1, 0.5);
    }

    // ── 잠금 오버레이 ──
    if (isLocked) {
      // 자물쇠 아이콘 (카드 중앙)
      this.add.text(cx + cardW / 2 - 30, cy, '\uD83D\uDD12', {
        fontSize: '28px',
      }).setOrigin(0.5).setAlpha(0.7);

      // 해금 조건 텍스트 (카드 하단)
      this.add.text(cx, cy + 40, '6\uC7A5 \uD074\uB9AC\uC5B4 \uC2DC \uD574\uAE08', {
        fontSize: '10px', color: '#666666',
      }).setOrigin(0.5);

      return;  // 잠금 카드는 이벤트 바인딩 안 함
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
      // Phase 13-3: 캠페인은 GatheringScene으로 전환 (MarketScene -> GatheringScene)
      const targetScene = this._isEndless ? 'EndlessScene' : 'GatheringScene';
      const targetStageId = this._isEndless ? '1-1' : this.stageId;
      this.scene.start(targetScene, { stageId: targetStageId });
    });
  }
}
