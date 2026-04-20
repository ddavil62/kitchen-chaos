/**
 * @fileoverview 셰프 선택 씬.
 * Phase 6: 스테이지 선택 후, 게임 시작 전에 셰프를 고르는 화면.
 * Phase 7: GameScene -> MarketScene 전환에 따라 씬 키 변경.
 * Phase 11-1: stageId='endless' 시 EndlessScene으로 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 버튼 Disabled 팔레트 적용.
 * Phase 19-2: 5종 카드 리레이아웃 + 시즌2 셰프 잠금 표시.
 * Phase 56: 7종 Named 셰프 카드, 압축 레이아웃 (cardHeight 80, cardGap 5),
 *           잠금 조건 7종 분기, unlockHint 사용.
 * 360x640 레이아웃: 7장의 세로 배치 카드 + "셰프 없이 시작" 버튼.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { CHEF_TYPES, CHEF_ORDER } from '../data/chefData.js';
import { ChefManager } from '../managers/ChefManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { STAGES } from '../data/stageData.js';
import { SpriteLoader } from '../managers/SpriteLoader.js';

/**
 * 셰프 잠금 여부 판별.
 * @param {string} chefId - 셰프 ID
 * @param {object} save - 세이브 데이터
 * @returns {boolean} 잠금이면 true
 */
function isChefLocked(chefId, save) {
  const ch = save.storyProgress?.currentChapter || 1;
  switch (chefId) {
    case 'mimi_chef':  return false;
    case 'rin_chef':   return false;
    case 'mage_chef':  return false;
    case 'yuki_chef':  return !save.season2Unlocked;
    case 'lao_chef':   return !save.season2Unlocked || ch < 10;
    case 'andre_chef': return !save.season2Unlocked || ch < 13;
    case 'arjun_chef': return !save.season3Unlocked || ch < 17;
    default:           return true;
  }
}

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

    // ── 타이틀 (Phase 56: y 20→16) ──
    this.add.text(GAME_WIDTH / 2, 16, '\uC170\uD504\uB97C \uC120\uD0DD\uD558\uC138\uC694', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── 서브타이틀 (Phase 56: y 38→32) ──
    const subTitle = this._isEndless
      ? `${stageName}`
      : `\uC2A4\uD14C\uC774\uC9C0: ${this.stageId} ${stageName}`;
    this.add.text(GAME_WIDTH / 2, 32, subTitle, {
      fontSize: '11px', color: this._isEndless ? '#cc88ff' : '#aaaaaa',
    }).setOrigin(0.5);

    // ── 셰프 카드 7장 (세로 압축 배치, Phase 56) ──
    const previousChef = ChefManager.getSelectedChef();
    const cardStartY = 45;
    const cardHeight = 80;
    const cardGap = 5;

    /** @type {Phaser.GameObjects.Rectangle[]} */
    this._cardBgs = [];

    // 잠금 판별용 세이브 로드
    const save = SaveManager.load();

    CHEF_ORDER.forEach((chefId, i) => {
      const chef = CHEF_TYPES[chefId];
      const cy = cardStartY + i * (cardHeight + cardGap) + cardHeight / 2;
      const isSelected = chefId === previousChef;
      const locked = isChefLocked(chefId, save);

      this._createChefCard(chef, cy, isSelected, locked);
    });

    // ── 하단: "셰프 없이 시작" 버튼 (Phase 56: y → 630) ──
    const skipY = 630;
    // Phase 11-3b: Disabled 팔레트 적용
    const skipBtn = this.add.rectangle(GAME_WIDTH / 2, skipY, 200, 30, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, skipY, '\uC170\uD504 \uC5C6\uC774 \uC2DC\uC791', {
      fontSize: '12px', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    skipBtn.on('pointerdown', () => {
      this._startGame(null);
    });
    skipBtn.on('pointerover', () => skipBtn.setFillStyle(0x666666));
    skipBtn.on('pointerout', () => skipBtn.setFillStyle(0x444444));

    // ── 뒤로 가기 버튼 (Phase 56: y → 630) ──
    const backBtn = this.add.rectangle(40, 630, 60, 28, 0x444444)
      .setInteractive({ useHandCursor: true });
    this.add.text(40, 630, '< \uB4A4\uB85C', {
      fontSize: '10px', color: '#cccccc',
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
   * Phase 56: 카드 높이 80px, 폰트 축소, 잠금 로직 7종 분기, unlockHint 사용.
   * @param {object} chef - CHEF_TYPES 항목
   * @param {number} cy - 카드 세로 중심
   * @param {boolean} isSelected - 이전 선택 셰프 여부
   * @param {boolean} isLocked - 잠금 여부
   * @private
   */
  _createChefCard(chef, cy, isSelected, isLocked) {
    const cx = GAME_WIDTH / 2;
    const cardW = 320;
    const cardH = 80;

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
      // 스프라이트 이미지 (Phase 56: 스케일 32->28)
      const chefImg = this.add.image(leftX + 14, cy - 24, chefSpriteKey);
      chefImg.setScale(28 / chefImg.width);
      if (isLocked) chefImg.setAlpha(0.3);
    } else {
      // 이모지 fallback (Phase 56: 폰트 24->20)
      const iconText = this.add.text(leftX, cy - 24, chef.icon, {
        fontSize: '20px',
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

    // 셰프 이름 (Phase 56: 폰트 15->13)
    this.add.text(leftX + 40, cy - 28, chef.nameKo, {
      fontSize: '13px', fontStyle: 'bold',
      color: hexColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // 패시브 설명 (Phase 56: 폰트 11->10)
    this.add.text(leftX + 10, cy - 10, `\uD328\uC2DC\uBE0C: ${chef.passiveDesc}`, {
      fontSize: '10px', color: textColor || '#88cc88',
    }).setOrigin(0, 0.5);

    // 스킬 이름 (Phase 56: 폰트 12->11)
    this.add.text(leftX + 10, cy + 6, `\uC2A4\uD0AC: ${chef.skillName}`, {
      fontSize: '11px', fontStyle: 'bold', color: textColor || '#ffcc44',
    }).setOrigin(0, 0.5);

    // 스킬 설명 (Phase 56: 폰트 10->9)
    this.add.text(leftX + 10, cy + 19, chef.skillDesc, {
      fontSize: '9px', color: textColor || '#cccccc',
    }).setOrigin(0, 0.5);

    // 쿨다운 표시 (Phase 56: 폰트 10->9)
    const cooldownSec = chef.skillCooldown / 1000;
    this.add.text(leftX + 10, cy + 30, `\uCFE8\uB2E4\uC6B4: ${cooldownSec}\uCD08`, {
      fontSize: '9px', color: textColor || '#888888',
    }).setOrigin(0, 0.5);

    // 선택 표시
    if (isSelected && !isLocked) {
      this.add.text(cx + cardW / 2 - 15, cy - 28, '\u2714', {
        fontSize: '18px', color: '#44ff44',
      }).setOrigin(1, 0.5);
    }

    // ── 잠금 오버레이 ──
    if (isLocked) {
      // 자물쇠 아이콘 (카드 중앙)
      this.add.text(cx + cardW / 2 - 30, cy, '\uD83D\uDD12', {
        fontSize: '24px',
      }).setOrigin(0.5).setAlpha(0.7);

      // 해금 조건 텍스트 — chefData의 unlockHint 사용
      const hintText = chef.unlockHint || '';
      this.add.text(cx, cy + 32, hintText, {
        fontSize: '9px', color: '#666666',
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
