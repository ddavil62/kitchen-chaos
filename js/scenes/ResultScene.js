/**
 * @fileoverview 정산 씬 (ResultScene).
 * Phase 7-3: 장보기 + 영업 결과를 종합하여 별점, 코인 보상을 표시한다.
 * 기존 GameOverScene을 대체한다.
 * Phase 10-4: BGM 재생 추가.
 * Phase 11-1: 엔드리스 모드 결과 화면 분기 추가.
 *
 * 화면 구성:
 *   타이틀 → 장보기 결과 → 영업 결과 → 평가(별점) → 보상 → 버튼
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { STAGES, STAGE_ORDER } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  /**
   * @param {{
   *   stageId: string,
   *   marketResult: { totalIngredients: number, livesRemaining: number, livesMax: number },
   *   serviceResult: { servedCount: number, totalCustomers: number, goldEarned: number, tipEarned: number, maxCombo: number, satisfaction: number } | null,
   *   isMarketFailed: boolean
   * }} data
   */
  init(data) {
    this.stageId = data.stageId || '1-1';
    this.marketResult = data.marketResult || { totalIngredients: 0, livesRemaining: 0, livesMax: 15 };
    this.serviceResult = data.serviceResult || null;
    this.isMarketFailed = data.isMarketFailed || false;

    // ── Phase 11-1: 엔드리스 결과 ──
    this.isEndless = data.isEndless || false;
    this.endlessWave = data.endlessWave || 0;
    this.endlessScore = data.endlessScore || 0;
    this.endlessMaxCombo = data.endlessMaxCombo || 0;
    this.newBestWave = data.newBestWave || false;
    this.newBestScore = data.newBestScore || false;
    this.newBestCombo = data.newBestCombo || false;
  }

  create() {
    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── BGM 재생 (Phase 10-4) ──
    SoundManager.playBGM('bgm_result');

    // 배경 — 엔드리스 모드 게임오버는 짙은 보라 배경
    const bgColor = this.isEndless ? 0x0a0020 : (this.isMarketFailed ? 0x330000 : 0x001a00);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, bgColor);

    if (this.isEndless) {
      this._createEndlessResultView();
    } else if (this.isMarketFailed) {
      this._createMarketFailedView();
    } else {
      this._createResultView();
    }
  }

  // ── 엔드리스 결과 화면 (Phase 11-1) ──────────────────────────────

  /**
   * 엔드리스 모드 게임오버 결과 화면을 생성한다.
   * 도달 웨이브/점수/콤보 + 역대 최고 기록을 표시한다.
   * @private
   */
  _createEndlessResultView() {
    const bestRecord = SaveManager.getEndlessRecord();

    // 타이틀
    this.add.text(GAME_WIDTH / 2, 40, '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uAC8C\uC784\uC624\uBC84', {
      fontSize: '26px', fontStyle: 'bold', color: '#cc88ff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 80, '\uCD5C\uC120\uC744 \uB2E4\uD588\uC2B5\uB2C8\uB2E4!', {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, 110, GAME_WIDTH - 40, 1, 0x444444);

    // 섹션: 이번 도전 결과
    this.add.text(GAME_WIDTH / 2, 125, '\uD83D\uDCCA \uC774\uBC88 \uB3C4\uC804 \uACB0\uACFC', {
      fontSize: '16px', fontStyle: 'bold', color: '#88ccff',
    }).setOrigin(0.5);

    // 도달 웨이브
    const waveColor = this.newBestWave ? '#ffd700' : '#ffffff';
    const waveNewText = this.newBestWave ? '  \u2605 NEW!' : '';
    this.add.text(GAME_WIDTH / 2, 150, `\uD83C\uDF0A \uC6E8\uC774\uBE0C ${this.endlessWave}${waveNewText}`, {
      fontSize: '16px', color: waveColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // 누적 점수
    const scoreColor = this.newBestScore ? '#ffd700' : '#ffffff';
    const scoreNewText = this.newBestScore ? '  \u2605 NEW!' : '';
    this.add.text(GAME_WIDTH / 2, 175, `\uD83D\uDCB0 ${this.endlessScore} \uACE8\uB4DC${scoreNewText}`, {
      fontSize: '16px', color: scoreColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // 최고 콤보
    const comboColor = this.newBestCombo ? '#ffd700' : '#ffffff';
    const comboNewText = this.newBestCombo ? '  \u2605 NEW!' : '';
    this.add.text(GAME_WIDTH / 2, 200, `\uD83D\uDD25 ${this.endlessMaxCombo}\uC5F0\uC18D \uCF64\uBCF4${comboNewText}`, {
      fontSize: '16px', color: comboColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, 230, GAME_WIDTH - 40, 1, 0x444444);

    // 섹션: 역대 최고 기록
    this.add.text(GAME_WIDTH / 2, 245, '\uD83C\uDFC6 \uC5ED\uB300 \uCD5C\uACE0 \uAE30\uB85D', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffdd44',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 268, `\uD83C\uDF0A \uC6E8\uC774\uBE0C ${bestRecord.bestWave}`, {
      fontSize: '14px', color: '#cccccc',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 288, `\uD83D\uDCB0 ${bestRecord.bestScore} \uACE8\uB4DC`, {
      fontSize: '14px', color: '#cccccc',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 308, `\uD83D\uDD25 ${bestRecord.bestCombo}\uC5F0\uC18D`, {
      fontSize: '14px', color: '#cccccc',
    }).setOrigin(0.5);

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, 340, GAME_WIDTH - 40, 1, 0x444444);

    // 버튼: 다시 도전
    this._createButton(365, '\uB2E4\uC2DC \uB3C4\uC804!', 0x6622cc, () => {
      this._fadeToScene('ChefSelectScene', { stageId: 'endless' });
    });

    // 버튼: 메인 메뉴
    this._createButton(425, '\uBA54\uC778 \uBA54\uB274', 0x444444, () => {
      this._fadeToScene('MenuScene');
    });
  }

  // ── 장보기 실패 화면 ──────────────────────────────────────────────

  /** @private */
  _createMarketFailedView() {
    let y = 100;

    // 타이틀
    this.add.text(GAME_WIDTH / 2, y, '장보기 실패!', {
      fontSize: '28px', fontStyle: 'bold', color: '#ff4444',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    y += 60;

    // 설명
    this.add.text(GAME_WIDTH / 2, y, '재료를 모으지 못해\n오늘 영업을 할 수 없습니다...', {
      fontSize: '16px', color: '#cccccc', align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);
    y += 60;

    // 수집 재료
    this.add.text(GAME_WIDTH / 2, y, `수집 재료: ${this.marketResult.totalIngredients}개`, {
      fontSize: '15px', color: '#ffffff',
    }).setOrigin(0.5);
    y += 30;

    // 남은 생명
    this.add.text(GAME_WIDTH / 2, y,
      `남은 생명: \u2764 ${this.marketResult.livesRemaining}/${this.marketResult.livesMax}`, {
        fontSize: '15px', color: '#ff6666',
      }).setOrigin(0.5);
    y += 80;

    // 버튼
    this._createButton(y, '다시 하기', 0xff6b35, () => {
      this._fadeToScene('ChefSelectScene', { stageId: this.stageId });
    });
    y += 70;

    this._createButton(y, '스테이지 선택', 0x444444, () => {
      this._fadeToScene('StageSelectScene');
    });
  }

  // ── 정상 정산 화면 ────────────────────────────────────────────────

  /** @private */
  _createResultView() {
    const sr = this.serviceResult;
    const satisfaction = sr ? sr.satisfaction : 0;

    // 별점 계산
    let stars = 0;
    if (satisfaction >= 95) stars = 3;
    else if (satisfaction >= 80) stars = 2;
    else if (satisfaction >= 60) stars = 1;

    // 코인 보상 계산
    let coinReward = 0;
    if (stars === 1) coinReward = 5;
    else if (stars === 2) coinReward = 10;
    else if (stars === 3) coinReward = 15;

    // 첫 클리어 보너스
    const prevStars = SaveManager.getStars(this.stageId);
    const isFirstClear = prevStars === 0;
    if (isFirstClear && stars > 0) coinReward += 5;

    // 세이브 업데이트
    let totalCoinsEarned = 0;
    if (stars > 0) {
      totalCoinsEarned = SaveManager.clearStage(this.stageId, stars);
      // bestSatisfaction 갱신
      SaveManager.updateBestSatisfaction(this.stageId, Math.round(satisfaction));
    }

    // 스크롤 가능한 컨테이너
    let y = 30;

    // ── 타이틀 ──
    const stageName = STAGES[this.stageId]?.nameKo || this.stageId;
    this.add.text(GAME_WIDTH / 2, y, '오늘의 영업 결과', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    y += 26;

    this.add.text(GAME_WIDTH / 2, y, `${this.stageId} ${stageName}`, {
      fontSize: '13px', color: '#aaaaaa',
    }).setOrigin(0.5);
    y += 30;

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 40, 1, 0x444444);
    y += 15;

    // ── 장보기 섹션 ──
    this.add.text(30, y, '\uD83D\uDCE6 장보기', {
      fontSize: '16px', fontStyle: 'bold', color: '#88ccff',
    });
    y += 28;

    this.add.text(40, y, `수집 재료: ${this.marketResult.totalIngredients}개`, {
      fontSize: '14px', color: '#ffffff',
    });
    y += 22;

    this.add.text(40, y,
      `남은 생명: \u2764 ${this.marketResult.livesRemaining}/${this.marketResult.livesMax}`, {
        fontSize: '14px', color: '#ffffff',
      });
    y += 30;

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 60, 1, 0x333333);
    y += 15;

    // ── 영업 섹션 ──
    if (sr) {
      this.add.text(30, y, '\uD83C\uDF7D 영업', {
        fontSize: '16px', fontStyle: 'bold', color: '#ffcc88',
      });
      y += 28;

      const serveRate = sr.totalCustomers > 0
        ? Math.round(sr.servedCount / sr.totalCustomers * 100)
        : 0;
      this.add.text(40, y, `서빙 성공: ${sr.servedCount}/${sr.totalCustomers} (${serveRate}%)`, {
        fontSize: '14px', color: '#ffffff',
      });
      y += 22;

      this.add.text(40, y, `매출: ${sr.goldEarned} 골드`, {
        fontSize: '14px', color: '#ffd700',
      });
      y += 22;

      this.add.text(40, y, `팁: +${sr.tipEarned} 골드`, {
        fontSize: '14px', color: '#ffd700',
      });
      y += 22;

      this.add.text(40, y, `콤보 최대: ${sr.maxCombo}연속`, {
        fontSize: '14px', color: '#ffffff',
      });
      y += 30;
    }

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 60, 1, 0x333333);
    y += 15;

    // ── 평가 섹션 ──
    this.add.text(30, y, '\u2B50 평가', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffdd44',
    });
    y += 28;

    this.add.text(40, y, `만족도: ${Math.round(satisfaction)}%`, {
      fontSize: '14px', color: '#ffffff',
    });
    y += 28;

    // 별점 표시 (애니메이션 포함)
    const starStr = '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars);
    const starText = this.add.text(GAME_WIDTH / 2, y, starStr, {
      fontSize: '36px', color: '#ffd700',
      stroke: '#8b4500', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // 별점 등장 애니메이션
    this.tweens.add({
      targets: starText,
      alpha: 1,
      scaleX: { from: 1.5, to: 1 },
      scaleY: { from: 1.5, to: 1 },
      duration: 500,
      delay: 300,
      ease: 'Back.easeOut',
    });
    y += 40;

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 60, 1, 0x333333);
    y += 15;

    // ── 보상 섹션 ──
    this.add.text(30, y, '\uD83D\uDCB0 보상', {
      fontSize: '16px', fontStyle: 'bold', color: '#44ff88',
    });
    y += 28;

    let rewardText = `+${totalCoinsEarned} 코인`;
    if (isFirstClear && stars > 0) {
      rewardText += ' (첫 클리어 보너스 포함!)';
    }
    this.add.text(40, y, rewardText, {
      fontSize: '15px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    });
    y += 40;

    // 구분선
    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 40, 1, 0x444444);
    y += 25;

    // ── 버튼 ──
    this._createButton(y, '다시 하기', 0xff6b35, () => {
      this._fadeToScene('ChefSelectScene', { stageId: this.stageId });
    });
    y += 60;

    // 다음 스테이지 (마지막이 아닌 경우에만)
    const nextStageId = this._getNextStageId();
    if (nextStageId && stars > 0) {
      this._createButton(y, '다음 스테이지 \u25B6', 0x22aa44, () => {
        this._fadeToScene('ChefSelectScene', { stageId: nextStageId });
      });
      y += 60;
    }

    this._createButton(y, '스테이지 선택', 0x444444, () => {
      this._fadeToScene('StageSelectScene');
    });
  }

  // ── 유틸리티 ──────────────────────────────────────────────────────

  /**
   * 다음 스테이지 ID 반환.
   * @returns {string|null}
   * @private
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
   * @private
   */
  _createButton(y, label, color, onClick) {
    const btn = this.add.rectangle(GAME_WIDTH / 2, y, 220, 44, color)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, y, label, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => btn.setFillStyle(
      Phaser.Display.Color.ValueToColor(color).lighten(30).color
    ));
    btn.on('pointerout', () => btn.setFillStyle(color));
  }

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   * @param {object} [data]
   * @private
   */
  _fadeToScene(sceneKey, data) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey, data);
    });
  }
}
