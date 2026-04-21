/**
 * @fileoverview 정산 씬 (ResultScene).
 * Phase 7-3: 장보기 + 영업 결과를 종합하여 별점, 코인 보상을 표시한다.
 * 기존 GameOverScene을 대체한다.
 * Phase 10-4: BGM 재생 추가.
 * Phase 11-1: 엔드리스 모드 결과 화면 분기 추가.
 * Phase 13-2: 정상 정산 후 "행상인 방문" 버튼 추가 (MerchantScene 경유).
 *
 * 화면 구성:
 *   타이틀 → 장보기 결과 → 영업 결과 → 평가(별점) → 보상 → 버튼
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { STAGES, STAGE_ORDER } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { StoryManager } from '../managers/StoryManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';

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

    // Phase 60-18: 배경 rectangle → NineSliceFactory.panel 'dark' + 상태별 tint
    const bgTint = this.isEndless ? 0x8844cc : (this.isMarketFailed ? 0xcc4444 : 0x44cc44);
    const bgPanel = NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');
    bgPanel.setTint(bgTint);

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

    // ── 업적: 엔드리스 체크 (Phase 42 + Phase 55-4) ──
    AchievementManager.check(this, 'endless_wave', 0);
    AchievementManager.check(this, 'endless_score', 0);
    AchievementManager.check(this, 'endless_storm_cleared', 0);
    AchievementManager.check(this, 'endless_mission_success', 0);
    AchievementManager.check(this, 'endless_no_leak_streak', 0);

    // 타이틀
    this.add.text(GAME_WIDTH / 2, 40, '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uAC8C\uC784\uC624\uBC84', {
      fontSize: '26px', fontStyle: 'bold', color: '#cc88ff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 80, '\uCD5C\uC120\uC744 \uB2E4\uD588\uC2B5\uB2C8\uB2E4!', {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, 110, GAME_WIDTH - 40, 2);

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

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, 230, GAME_WIDTH - 40, 2);

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

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, 340, GAME_WIDTH - 40, 2);

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

    this._createButton(y, '월드맵으로', 0x444444, () => {
      this._fadeToScene('WorldMapScene');
    });

    // ── 대화 트리거: 첫 실패 격려 (Phase 14-3: StoryManager 중앙화) ──
    StoryManager.checkTriggers(this, 'result_market_failed');
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
      // 챕터 진행도 갱신 (Phase 14-3)
      StoryManager.advanceChapter(this.stageId);

      // ── 업적 체크 (Phase 42) ──
      AchievementManager.check(this, 'stage_cleared', 0);
      AchievementManager.check(this, 'chapter_cleared', parseInt(this.stageId.split('-')[0]));
      AchievementManager.check(this, 'three_star_count', 0);
      AchievementManager.check(this, 'recipe_unlocked', 0);
    }

    // 스크롤 가능한 컨테이너
    let y = 20;

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
    y += 24;

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 40, 2);
    y += 12;

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

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 60, 2);
    y += 12;

    // ── 영업 섹션 ──
    if (sr) {
      this.add.text(30, y, '\uD83C\uDF7D 영업', {
        fontSize: '16px', fontStyle: 'bold', color: '#ffcc88',
      });
      y += 24;

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

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 60, 2);
    y += 12;

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

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 60, 2);
    y += 12;

    // ── 보상 섹션 ──
    this.add.text(30, y, '\uD83D\uDCB0 보상', {
      fontSize: '16px', fontStyle: 'bold', color: '#44ff88',
    });
    y += 26;

    let rewardText = `+${totalCoinsEarned} 코인`;
    if (isFirstClear && stars > 0) {
      rewardText += ' (첫 클리어 보너스 포함!)';
    }
    this.add.text(40, y, rewardText, {
      fontSize: '15px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    });
    y += 32;

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 40, 2);
    y += 18;

    // ── 버튼 ──
    // Phase 13-2: 영업 성공 시 행상인 방문 버튼 (MerchantScene 경유)
    if (stars > 0) {
      this._createButton(y, '\uD589\uC0C1\uC778 \uBC29\uBB38 \u25B6', 0xcc8800, () => {
        this._fadeToScene('MerchantScene', {
          stageId: this.stageId,
          marketResult: this.marketResult,
          serviceResult: this.serviceResult,
          isMarketFailed: false,
        });
      });
      y += 54;
    }

    this._createButton(y, '\uB2E4\uC2DC \uD558\uAE30', 0xff6b35, () => {
      this._fadeToScene('ChefSelectScene', { stageId: this.stageId });
    });
    y += 54;

    this._createButton(y, '\uC6D4\uB4DC\uB9F5\uC73C\uB85C', 0x444444, () => {
      this._fadeToScene('WorldMapScene');
    });

    // ── 대화 트리거 (Phase 14-3: StoryManager 중앙화) ──
    StoryManager.checkTriggers(this, 'result_clear', {
      stageId: this.stageId,
      stars,
      isFirstClear,
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
   * Phase 60-18: rectangle → NineSliceFactory.raw 'btn_primary_normal' + setTint(color).
   * hover 시 pressed 텍스처로 스왑, pointerout 시 normal 복귀.
   * @param {number} y
   * @param {string} label
   * @param {number} color
   * @param {Function} onClick
   * @private
   */
  _createButton(y, label, color, onClick) {
    const BTN_W = 220;
    const BTN_H = 44;
    const btnBg = NineSliceFactory.raw(this, GAME_WIDTH / 2, y, BTN_W, BTN_H, 'btn_primary_normal');
    btnBg.setTint(color);
    const hitArea = new Phaser.Geom.Rectangle(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H);
    btnBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, y, label, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    btnBg.on('pointerdown', onClick);
    btnBg.on('pointerover', () => btnBg.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED));
    btnBg.on('pointerout', () => btnBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL));
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

  /**
   * 하드웨어 뒤로가기 핸들러. 메뉴 화면으로 복귀한다.
   */
  _onBack() {
    this._fadeToScene('MenuScene');
  }
}
