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
 * Phase 82: 재클리어(totalCoinsEarned=0) 시 "재클리어 (추가 보상 없음)" 문구 표시.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, STARTING_LIVES } from '../config.js';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { STAGES, STAGE_ORDER } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { StoryManager } from '../managers/StoryManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { BranchEffects } from '../managers/BranchEffects.js';
import { DailyMissionManager } from '../managers/DailyMissionManager.js';
import { SeasonManager } from '../managers/SeasonManager.js';
import { AdManager } from '../managers/AdManager.js';

// ── Phase 74: 셰프별 장보기 실패 대사 (P2-5) ──
// 셰프 ID → 바리에이션 3줄 배열. 매 호출 시 Math.floor(Math.random() * 3)으로 선택.
const CHEF_FAIL_LINES = {
  mimi_chef: [
    '으... 재료가 하나도 없어. 오늘은 쉬어야 할 것 같아.',
    '할머니한테 뭐라고 말하지... 내가 너무 약했나봐.',
    '괜찮아, 다음엔 꼭 해낼 거야. 포기는 미력사의 길이 아니야!',
  ],
  rin_chef: [
    '흥, 이런 결과라니. 다음엔 두 배로 집중해야겠어.',
    '재료가 없으면 불꽃도 소용없지... 다시 준비하자.',
    '이 정도에 꺾이는 린이 아니야. 다시 가자!',
  ],
  mage_chef: [
    '빙결 주문도 재료가 없으면 무용지물이군요...',
    '이론상으론 완벽했는데. 실전에서 변수가 많았네요.',
    '냉정하게 분석해야 해요. 다음엔 더 효율적으로.',
  ],
  yuki_chef: [
    '눈... 눈이 너무 많이 왔나봐요. 길을 잃었어요.',
    '으으, 이런 실수라니. 유키가 부끄러워요.',
    '괜찮아요! 눈은 쌓이고 또 쌓이거든요. 다시 해봐요!',
  ],
  lao_chef: [
    '재료 없인 요리도 없지. 당연한 이치야.',
    '이 결과... 묵묵히 받아들이겠어. 다음엔 더 잘 할 거야.',
    '향신료 없이 이 싸움은 무의미했다. 채비를 다시 하자.',
  ],
  andre_chef: [
    'Mon Dieu... 재료가 없으니 셰프도 무용지물이군.',
    '프랑스 요리는 재료가 생명이야. 오늘은 패배를 인정하지.',
    '프로는 실패에서 배우는 법. 다음 판에선 완벽하게!',
  ],
  arjun_chef: [
    '마살라가 없으니... 오늘 주방엔 향기가 없겠군요.',
    '모든 재료가 신의 선물이에요. 오늘은 신이 시련을 주셨나봐요.',
    '좌절하지 마세요. 인내는 최고의 향신료입니다!',
  ],
};

/** 알 수 없는 셰프 ID 폴백 대사 */
const CHEF_FAIL_FALLBACK = [
  '재료를 모으지 못해 오늘 영업을 할 수 없습니다...',
  '다음엔 더 열심히 해봅시다!',
  '힘내세요, 다시 도전!',
];

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  /**
   * @param {{
   *   stageId: string,
   *   marketResult: { totalIngredients: number, livesRemaining: number, livesMax: number, partialFail?: boolean },
   *   serviceResult: { servedCount: number, totalCustomers: number, goldEarned: number, tipEarned: number, maxCombo: number, satisfaction: number } | null,
   *   isMarketFailed: boolean
   * }} data
   */
  init(data) {
    // ── Phase 68: P0-4 stageId 단일 소스 (currentRun 폴백, 폴백 실패 시 에러) ──
    const resolvedStageId = data?.stageId ?? SaveManager.getCurrentRun()?.stageId;
    if (!resolvedStageId) {
      console.error('[ResultScene] stageId 누락 — MenuScene으로 강제 복귀');
      this._missingStageId = true;
      return;
    }
    this._missingStageId = false;
    this.stageId = resolvedStageId;

    this.marketResult = data?.marketResult || { totalIngredients: 0, livesRemaining: 0, livesMax: 15 };
    this.serviceResult = data?.serviceResult || null;
    // Phase 88: 이벤트 보너스 골드 (serviceResult 내부에 포함됨)
    this._eventBonusGold = data?.serviceResult?.eventBonusGold ?? 0;
    this.isMarketFailed = data?.isMarketFailed || false;

    // ── Phase 78: 부분 성공 플래그 ──
    this.partialFail = data?.marketResult?.partialFail || false;

    // ── Phase 11-1: 엔드리스 결과 ──
    this.isEndless = data?.isEndless || false;
    this.endlessWave = data?.endlessWave || 0;
    this.endlessScore = data?.endlessScore || 0;
    this.endlessMaxCombo = data?.endlessMaxCombo || 0;
    this.newBestWave = data?.newBestWave || false;
    this.newBestScore = data?.newBestScore || false;
    this.newBestCombo = data?.newBestCombo || false;
  }

  create() {
    // ── Phase 68: P0-4 stageId 누락 시 즉시 메뉴로 복귀 ──
    if (this._missingStageId) {
      this.scene.start('MenuScene');
      return;
    }

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── BGM 재생 (Phase 10-4) ──
    SoundManager.playBGM('bgm_result');

    // Phase 68-hotfix: Phase 60-18의 밝은 틴트(0x44cc44/0xcc4444/0x8844cc)가 9-slice
    // 스트레치 타일 경계를 형광 블록으로 가시화하던 회귀를 수정.
    // 전체화면 panel_dark는 틴트 없이 natural 렌더(다른 씬과 동일). 상태 표현은
    // 타이틀 색상/별/배지가 이미 담당하므로 배경 틴트는 불필요.
    NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');

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

    // Phase 74: 셰프별 실패 대사 (P2-5)
    const chefId = SaveManager.load()?.selectedChef ?? '';
    const lines = CHEF_FAIL_LINES[chefId] || CHEF_FAIL_FALLBACK;
    const failLine = lines[Math.floor(Math.random() * lines.length)];
    this.add.text(GAME_WIDTH / 2, y, failLine, {
      fontSize: '15px', color: '#ffccaa', align: 'center', lineSpacing: 6,
      wordWrap: { width: GAME_WIDTH - 40 },
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

    // ── Phase 81: AD-1 광고 보고 재도전 버튼 ──
    const adRetryBtn = this._createButton(y, '\uD83C\uDFAC \uAD11\uACE0 \uBCF4\uACE0 \uC7AC\uB3C4\uC804', 0x22aa55, () => {
      AdManager.showRewardedAd(
        () => {
          // onReward: stageId 유지, HP = ceil(STARTING_LIVES / 2)로 GatheringScene 직접 진입
          SaveManager.clearCurrentRun();
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GatheringScene', {
              stageId: this.stageId,
              overrideLives: Math.ceil(STARTING_LIVES / 2),
            });
          });
        },
        () => { /* 광고 실패 — 무동작 */ }
      );
    });
    if (!AdManager.isAdReady()) {
      adRetryBtn?.bg?.setAlpha(0.5);
      adRetryBtn?.label?.setAlpha(0.5);
    }
    y += 70;

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

    // ── Phase 68: P0-2 servedCount === 0 가드 ──
    // 서빙이 한 번도 없으면 만족도/별점/보상을 모두 0으로 강제한다.
    // satisfaction이 ServiceScene에서 100으로 초기화된 채 넘어오는 경우 방어.
    const isServedZero = !sr || sr.servedCount === 0;
    const satisfaction = isServedZero ? 0 : sr.satisfaction;

    // 별점 계산
    let stars = 0;
    if (!isServedZero) {
      if (satisfaction >= 95) stars = 3;
      else if (satisfaction >= 80) stars = 2;
      else if (satisfaction >= 60) stars = 1;
    }
    // ── Phase 78: 부분 성공 — 별점 최대 2개 캡 ──
    if (this.partialFail && stars > 2) stars = 2;

    // 코인 보상 계산
    let coinReward = 0;
    if (stars === 1) coinReward = 5;
    else if (stars === 2) coinReward = 10;
    else if (stars === 3) coinReward = 15;

    // 첫 클리어 보너스
    const prevStars = SaveManager.getStars(this.stageId);
    const isFirstClear = prevStars === 0;
    if (isFirstClear && stars > 0) coinReward += 5;

    // ── Phase 68: P0-2 클리어 복합 조건 ──
    // HP 생존 AND 서빙 1회 이상이어야 클리어로 인정한다.
    const hpAlive = (this.marketResult.livesRemaining ?? 0) > 0;
    const isCleared = hpAlive && !isServedZero && stars > 0;

    // 세이브 업데이트
    let totalCoinsEarned = 0;
    let blessingCoinBonus = 0;
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

      // ── Phase 75B: 일일 미션 -- 스테이지 클리어 ──
      try { DailyMissionManager.recordProgress('stage_clear', 1); } catch { /* noop */ }
      // ── Phase 75B: 일일 미션 -- 별 3개 클리어 ──
      if (stars === 3) {
        try { DailyMissionManager.recordProgress('three_star', 1); } catch { /* noop */ }
      }
      // ── Phase 75B: 일일 미션 -- 만족도 95% 이상 ──
      if (satisfaction >= 95) {
        try { DailyMissionManager.recordProgress('perfect_satisfaction', 1); } catch { /* noop */ }
      }

      // ── Phase 89: 시즌 패스 -- 스테이지 클리어 XP ──
      try { SeasonManager.addXP('stage_clear', stars); } catch { /* noop */ }

      // ── Phase 58-3: 축복 'exp_gain' — 클리어 코인 +value 적용 ──
      // 활성 축복이 'exp_gain'일 때만 value(고정 +N)를 추가 지급한다. 없으면 0.
      blessingCoinBonus = BranchEffects.getBlessingMultiplier('exp_gain') | 0;
      if (blessingCoinBonus > 0) {
        // SaveManager에 코인 반영 (clearStage 내부에서는 이미 저장이 끝났으므로 별도 가산)
        const saveData = SaveManager.load();
        saveData.kitchenCoins = (saveData.kitchenCoins || 0) + blessingCoinBonus;
        SaveManager.save(saveData);
        totalCoinsEarned += blessingCoinBonus;
      }

      // ── Phase 58-3: 축복 잔여 스테이지 차감 ──
      // 스테이지가 "클리어 완료"된 시점에 한 번만 차감. 0 이하가 되면 activeBlessing은 null로 초기화된다.
      SaveManager.decrementBlessingStages();
    } else {
      // ── Phase 68: P0-2 0별 케이스 — bestSatisfaction만 갱신, clearStage 미호출 ──
      // 기존 세이브의 별점 기록은 건드리지 않는다.
      SaveManager.updateBestSatisfaction(this.stageId, Math.round(satisfaction));
    }

    // 스크롤 가능한 컨테이너
    let y = 20;

    // ── 타이틀 ──
    const stageName = STAGES[this.stageId]?.nameKo || this.stageId;
    this.add.text(GAME_WIDTH / 2, y, '오늘의 영업 결과', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    // Phase 91: 타이틀 후 여백 축소 (26 -> 22, 버튼 과밀 해소)
    y += 22;

    // Phase 91: nameKo가 stageId와 동일하면 중복 표시 방지
    const stageLabel = stageName !== this.stageId
      ? `${this.stageId} \u2014 ${stageName}`
      : this.stageId;
    this.add.text(GAME_WIDTH / 2, y, stageLabel, {
      fontSize: '13px', color: '#aaaaaa',
    }).setOrigin(0.5);
    // Phase 91: 서브라인 후 여백 축소 (24 -> 18, 버튼 과밀 해소)
    y += 18;

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 40, 2);
    // Phase 91: 구분선 후 여백 축소 (12 -> 10, 버튼 과밀 해소)
    y += 10;

    // ── 장보기 섹션 ──
    this.add.text(30, y, '\uD83D\uDCE6 장보기', {
      fontSize: '16px', fontStyle: 'bold', color: '#88ccff',
    });
    // Phase 91: 장보기 헤더 후 여백 축소 (28 -> 22, 버튼 과밀 해소)
    y += 22;

    // ── Phase 78: 부분 성공 시 재료 표시에 50% 사용 문구 추가 ──
    const ingredientLabel = this.partialFail
      ? `수집 재료: ${this.marketResult.totalIngredients}개 (부분 성공 — 50% 사용)`
      : `수집 재료: ${this.marketResult.totalIngredients}개`;
    this.add.text(40, y, ingredientLabel, {
      fontSize: '14px', color: this.partialFail ? '#ffaa44' : '#ffffff',
    });
    y += 22;

    this.add.text(40, y,
      `남은 생명: \u2764 ${this.marketResult.livesRemaining}/${this.marketResult.livesMax}`, {
        fontSize: '14px', color: '#ffffff',
      });
    y += 30;

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 60, 2);
    // Phase 91: 구분선 후 여백 축소 (12 -> 10, 버튼 과밀 해소)
    y += 10;

    // ── 영업 섹션 ──
    if (sr) {
      this.add.text(30, y, '\uD83C\uDF7D 영업', {
        fontSize: '16px', fontStyle: 'bold', color: '#ffcc88',
      });
      // Phase 91: 영업 헤더 후 여백 축소 (24 -> 20, 버튼 과밀 해소)
      y += 20;

      // Phase 76-1: 필드 누락 방어 — undefined 텍스트 노출 방지 (BUG-M1)
      const servedCount = sr.servedCount ?? 0;
      const totalCustomers = sr.totalCustomers ?? 0;
      const goldEarned = sr.goldEarned ?? 0;
      const tipEarned = sr.tipEarned ?? 0;
      const maxCombo = sr.maxCombo ?? 0;
      const serveRate = totalCustomers > 0
        ? Math.round(servedCount / totalCustomers * 100)
        : 0;
      this.add.text(40, y, `서빙 성공: ${servedCount}/${totalCustomers} (${serveRate}%)`, {
        fontSize: '14px', color: '#ffffff',
      });
      y += 22;

      this.add.text(40, y, `매출: ${goldEarned} 골드`, {
        fontSize: '14px', color: '#ffd700',
      });
      y += 22;

      this.add.text(40, y, `팁: +${tipEarned} 골드`, {
        fontSize: '14px', color: '#ffd700',
      });
      y += 22;

      this.add.text(40, y, `콤보 최대: ${maxCombo}연속`, {
        fontSize: '14px', color: '#ffffff',
      });
      y += 22;

      // ── Phase 88: 이벤트 보너스 골드 항목 (bonus_gold 이벤트 활성 시만 표시) ──
      if (this._eventBonusGold > 0) {
        this.add.text(40, y, `이벤트 보너스: +${this._eventBonusGold} 골드`, {
          fontSize: '14px', color: '#ffaa00',
          stroke: '#000', strokeThickness: 2,
        });
        y += 22;
      }

      y += 8;
    }

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 60, 2);
    // Phase 91: 구분선 후 여백 축소 (12 -> 10, 버튼 과밀 해소)
    y += 10;

    // ── 평가 섹션 ──
    this.add.text(30, y, '\u2B50 평가', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffdd44',
    });
    // Phase 91: 평가 헤더 후 여백 축소 (28 -> 22, 버튼 과밀 해소)
    y += 22;

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
    // Phase 91: 별점 후 여백 축소 (40 -> 36, 버튼 과밀 해소)
    y += 36;

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 60, 2);
    // Phase 91: 구분선 후 여백 축소 (12 -> 10, 버튼 과밀 해소)
    y += 10;

    // ── 보상 섹션 ──
    this.add.text(30, y, '\uD83D\uDCB0 보상', {
      fontSize: '16px', fontStyle: 'bold', color: '#44ff88',
    });
    // Phase 91: 보상 헤더 후 여백 축소 (26 -> 22, 버튼 과밀 해소)
    y += 22;

    // Phase 82: 재클리어(동일·하위 별점) 시 보상 없음 문구 분기
    // Phase 90-C (C-9): 재클리어 문구를 회색 + 이탤릭으로 시각 구분
    let rewardText;
    let rewardColor = '#ffcc00';
    let rewardStyle = 'bold';
    let rewardFontSize = '15px';
    if (totalCoinsEarned === 0 && stars > 0) {
      rewardText = '재클리어 — 최초 클리어 시에만 보상이 지급됩니다';
      rewardColor = '#888888';
      rewardStyle = 'italic';
      rewardFontSize = '12px';
    } else {
      rewardText = `+${totalCoinsEarned} 코인`;
      if (isFirstClear && stars > 0) {
        rewardText += ' (첫 클리어 보너스 포함!)';
      }
      // Phase 58-3: 축복 경험치 보너스 표시
      if (blessingCoinBonus > 0) {
        rewardText += ` [미력의 축복 +${blessingCoinBonus}]`;
      }
    }
    this.add.text(40, y, rewardText, {
      fontSize: rewardFontSize, fontStyle: rewardStyle, color: rewardColor,
      stroke: '#000', strokeThickness: 2,
    });
    // Phase 91: 보상 텍스트 후 여백 축소 (32 -> 26, 버튼 과밀 해소)
    y += 26;

    // Phase 60-18: 구분선 rectangle → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, GAME_WIDTH / 2, y, GAME_WIDTH - 40, 2);
    // Phase 91: 구분선 후 여백 축소 (12 -> 10, 버튼 과밀 해소)
    y += 10;

    // ── Phase 68: P0-3 modal lock — 버튼 그룹 ──
    /** @type {Phaser.GameObjects.GameObject[]} 버튼 오브젝트 목록 (lock/unlock 대상) */
    this._buttonObjects = [];
    this._buttonsLocked = false;

    // ── Phase 81: AD-3 조건 사전 판별 (버튼 간격 조정용) ──
    const showAd3 = stars <= 2 && totalCoinsEarned >= 1;
    const showAdRetry = this.partialFail;
    // 버튼 4개 이상일 때 간격 축소 (화면 이탈 방지)
    // REVISE-1: 4버튼 케이스 Y 오버플로우 방지 (44→38, bottom <= 620)
    const btnGap = (showAd3 || showAdRetry) ? 38 : 54;

    // ── Phase 92-a: 버튼 영역 하단 고정 ──
    // 보상 텍스트 영역이 가변적(sr 없음/재클리어/첫클리어 보너스 등)이므로
    // 콘텐츠 길이와 무관하게 버튼 그룹을 항상 화면 하단 고정 영역에 배치한다.
    // Math.max로 콘텐츠가 길 때는 자연스럽게 y를 따르고,
    // 콘텐츠가 짧을 때는 버튼이 하단으로 내려와 보상 구분선을 침범하지 않는다.
    const _numBtns = 2 // 다시 하기 + 월드맵으로 (항상 존재)
      + (isCleared ? 1 : 0)   // 행상인 방문
      + (showAd3 ? 1 : 0)     // 광고 보상 2배
      + (showAdRetry ? 1 : 0); // 광고 재도전
    const _btnAreaH = (_numBtns - 1) * btnGap + 44 + 30; // 44=버튼높이, 30=하단여백
    y = Math.max(y + 20, GAME_HEIGHT - _btnAreaH);

    // ── Phase 81: AD-1 부분 실패 시 광고 재도전 버튼 ──
    if (showAdRetry) {
      const adRetryBtn = this._createButton(y, '\uD83C\uDFAC \uAD11\uACE0 \uBCF4\uACE0 \uC7AC\uB3C4\uC804', 0x22aa55, () => {
        if (this._buttonsLocked) return;
        AdManager.showRewardedAd(
          () => {
            SaveManager.clearCurrentRun();
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('GatheringScene', {
                stageId: this.stageId,
                overrideLives: Math.ceil(STARTING_LIVES / 2),
              });
            });
          },
          () => { /* 광고 실패 — 무동작 */ }
        );
      });
      if (!AdManager.isAdReady()) {
        adRetryBtn?.bg?.setAlpha(0.5);
        adRetryBtn?.label?.setAlpha(0.5);
      }
      y += btnGap;
    }

    // ── 버튼 ──
    // Phase 13-2: 영업 성공 시 행상인 방문 버튼 (MerchantScene 경유)
    // Phase 68: P0-2 isCleared 조건으로 교체 (hpAlive && servedCount >= 1 && stars > 0)
    if (isCleared) {
      this._createButton(y, '\uD589\uC0C1\uC778 \uBC29\uBB38 \u25B6', 0xcc8800, () => {
        if (this._buttonsLocked) return;
        this._fadeToScene('MerchantScene', {
          stageId: this.stageId,
          marketResult: this.marketResult,
          serviceResult: this.serviceResult,
          isMarketFailed: false,
        });
      });
      y += btnGap;
    }

    this._createButton(y, '\uB2E4\uC2DC \uD558\uAE30', 0xff6b35, () => {
      if (this._buttonsLocked) return;
      this._fadeToScene('ChefSelectScene', { stageId: this.stageId });
    });
    y += btnGap;

    // ── Phase 81: AD-3 보상 2배 버튼 (stars <= 2 && 코인 1개 이상 획득 시) ──
    if (showAd3) {
      this._ad3Used = false;
      const ad3Btn = this._createButton(y, '\uD83C\uDFAC \uAD11\uACE0 \uBCF4\uACE0 \uBCF4\uC0C1 2\uBC30', 0xcc6600, () => {
        if (this._buttonsLocked || this._ad3Used) return;
        AdManager.showRewardedAd(
          () => {
            this._ad3Used = true;
            // 코인 추가 지급 (사실상 2배)
            const saveData = SaveManager.load();
            saveData.kitchenCoins = (saveData.kitchenCoins || 0) + totalCoinsEarned;
            SaveManager.save(saveData);
            // 버튼 비활성화 (시각적 피드백)
            ad3Btn?.bg?.setAlpha(0.4);
            ad3Btn?.bg?.disableInteractive();
            ad3Btn?.label?.setText('\uBCF4\uC0C1 \uC218\uB839 \uC644\uB8CC');
          },
          () => { /* 광고 실패 — 무동작 */ }
        );
      });
      if (!AdManager.isAdReady()) {
        ad3Btn?.bg?.setAlpha(0.5);
        ad3Btn?.label?.setAlpha(0.5);
      }
      y += btnGap;
    }

    this._createButton(y, '\uC6D4\uB4DC\uB9F5\uC73C\uB85C', 0x444444, () => {
      if (this._buttonsLocked) return;
      this._fadeToScene('WorldMapScene');
    });

    // ── Phase 68: P0-3 StoryManager 호출 전 modal lock ──
    // 트리거 발동 시 DialogueScene이 열리는 동안 버튼 입력을 차단한다.
    // DialogueScene 종료(shutdown) 이벤트를 감지하여 unlock한다.
    const unlockOnDialogueEnd = () => {
      this._unlockButtons();
    };

    // DialogueScene shutdown 이벤트 대기 (트리거 발동 여부와 무관하게 unlock 처리)
    const dialogueScene = this.scene.get('DialogueScene');
    if (dialogueScene) {
      dialogueScene.events.once('shutdown', unlockOnDialogueEnd);
    }

    // 트리거 조건 평가 전 lock
    this._lockButtons();

    // ── 대화 트리거 (Phase 14-3: StoryManager 중앙화) ──
    StoryManager.checkTriggers(this, 'result_clear', {
      stageId: this.stageId,
      stars,
      isFirstClear,
    });

    // ── Phase 68: 트리거가 발동하지 않은 경우 즉시 unlock ──
    // DialogueScene이 실제로 launch되었는지 확인 후, launch되지 않았으면 unlock.
    this.time.delayedCall(50, () => {
      if (!this.scene.isActive('DialogueScene')) {
        this._unlockButtons();
        if (dialogueScene) {
          dialogueScene.events.off('shutdown', unlockOnDialogueEnd);
        }
      }
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
    // F-4 Fix: BTN_W 220→240 (텍스트 클리핑 방지, 화면 360px 기준 좌우 60px 여백 확보)
    const BTN_W = 240;
    const BTN_H = 44;
    const btnBg = NineSliceFactory.raw(this, GAME_WIDTH / 2, y, BTN_W, BTN_H, 'btn_primary_normal');
    btnBg.setTint(color);
    const hitArea = new Phaser.Geom.Rectangle(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H);
    btnBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

    const labelText = this.add.text(GAME_WIDTH / 2, y, label, {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    btnBg.on('pointerdown', onClick);
    btnBg.on('pointerover', () => btnBg.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED));
    btnBg.on('pointerout', () => btnBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL));

    // ── Phase 68: P0-3 버튼 오브젝트 추적 ──
    if (this._buttonObjects) {
      this._buttonObjects.push(btnBg, labelText);
    }
    // Phase 81: AD-1/AD-3에서 버튼 참조가 필요하므로 반환
    return { bg: btnBg, label: labelText };
  }

  /**
   * 버튼 그룹을 비활성화한다. DialogueScene이 열려 있는 동안 입력을 차단한다.
   * Phase 90-A (A-2): visible 유지 + disableInteractive + alpha=0.3으로 변경.
   * 기존의 alpha=0.4만 적용하던 방식에서는 DialogueScene 오버레이 뒤에 버튼이 가려져
   * 유저가 버튼 존재를 인식하지 못하는 문제가 있었다.
   * @private
   */
  _lockButtons() {
    this._buttonsLocked = true;
    if (this._buttonObjects) {
      for (const obj of this._buttonObjects) {
        obj.setAlpha(0.3);
        // interactive 비활성화 (visible은 유지)
        if (obj.disableInteractive) obj.disableInteractive();
      }
    }
  }

  /**
   * 버튼 그룹을 복원한다. DialogueScene 종료 후 호출한다.
   * Phase 90-A (A-2): alpha=1.0 복원 + setInteractive 재활성화.
   * @private
   */
  _unlockButtons() {
    this._buttonsLocked = false;
    if (this._buttonObjects) {
      for (const obj of this._buttonObjects) {
        obj.setAlpha(1.0);
        // interactive 재활성화 — NineSlice bg만 interactive 대상이므로 타입 체크
        if (obj.input && obj.setInteractive) obj.setInteractive();
      }
    }
  }

  /**
   * 페이드 아웃 후 씬 전환.
   * @param {string} sceneKey
   * @param {object} [data]
   * @private
   */
  _fadeToScene(sceneKey, data) {
    // ── Phase 68: P0-4 런 완료 시 currentRun 초기화 ──
    SaveManager.clearCurrentRun();
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
