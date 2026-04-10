/**
 * @fileoverview 스테이지 월드맵 씬.
 * Phase 11-2: StageSelectScene을 비주얼 노드맵으로 교체.
 * 6개 챕터를 2열 3행 지그재그 노드 그래프로 표현한다.
 * 노드 터치 -> 슬라이드업 패널 -> 스테이지 선택 -> ChefSelectScene.
 * Phase 11-3b: fadeIn 300ms 통일.
 * Phase 11-3d: 버전 표기 APP_VERSION 참조로 변경.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, APP_VERSION } from '../config.js';
import { STAGES } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { StoryManager } from '../managers/StoryManager.js';

// ── 챕터별 스테이지 분류 (StageSelectScene에서 이식) ──

const CHAPTERS = [
  { id: 'ch1', nameKo: '1장: 파스타 레스토랑',   themeColor: '#ffd700', themeHex: 0xffd700, strokeColor: '#8b4500', icon: '\uD83C\uDF5D', stages: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6'] },
  { id: 'ch2', nameKo: '2장: 동양 요리 식당',     themeColor: '#88ccff', themeHex: 0x88ccff, strokeColor: '#224488', icon: '\uD83C\uDF5C', stages: ['2-1', '2-2', '2-3'] },
  { id: 'ch3', nameKo: '3장: 씨푸드 바',          themeColor: '#66eeff', themeHex: 0x66eeff, strokeColor: '#1a6688', icon: '\uD83E\uDD9E', stages: ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6'] },
  { id: 'ch4', nameKo: '4장: 화산 BBQ',           themeColor: '#ff6622', themeHex: 0xff6622, strokeColor: '#881100', icon: '\uD83D\uDD25', stages: ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6'] },
  { id: 'ch5', nameKo: '5장: 마법사 디저트 카페', themeColor: '#cc88ff', themeHex: 0xcc88ff, strokeColor: '#5522aa', icon: '\uD83E\uDDC1', stages: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6'] },
  { id: 'ch6', nameKo: '6장: 그랑 가스트로노미', themeColor: '#ffd700', themeHex: 0xffd700, strokeColor: '#886600', icon: '\uD83D\uDC68\u200D\uD83C\uDF73', stages: ['6-1', '6-2', '6-3'] },
];

// ── 노드 위치 좌표 (2열 3행 지그재그) ──

const NODE_POSITIONS = [
  { x: 100, y: 140 },  // ch1
  { x: 260, y: 140 },  // ch2
  { x: 100, y: 270 },  // ch3
  { x: 260, y: 270 },  // ch4
  { x: 100, y: 400 },  // ch5
  { x: 260, y: 400 },  // ch6
];

// ── 연결선 쌍 (인덱스 기준) ──

const CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5],
];

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
  }

  /**
   * 씬 생성. 배경, 챕터 노드, 연결선, HUD, 엔드리스 섹션을 그린다.
   */
  create() {
    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // 1. 배경
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    // 2. 챕터 상태 계산
    this._chapterStates = this._buildChapterStates();

    // 3. 연결선 (노드 뒤에 렌더링)
    this._drawConnections();

    // 4. 노드 렌더링
    this._drawNodes();

    // 5. 상단 HUD
    this._createHUD();

    // 6. 하단 엔드리스 섹션
    this._createEndlessSection();

    // 7. 패널 상태 초기화
    this._panelContainer = null;

    // 8. 대화 트리거 (Phase 14-3: StoryManager 중앙화)
    StoryManager.checkTriggers(this, 'worldmap_enter');
  }

  // ── 하드웨어 백버튼 (Phase 12) ──────────────────────────────────

  /**
   * 하드웨어 뒤로가기 핸들러.
   * 스테이지 패널이 열려있으면 닫고, 아니면 메뉴로 복귀한다.
   */
  _onBack() {
    if (this._panelContainer) {
      this._closeStagePanel();
      return;
    }
    SoundManager.playSFX('sfx_ui_tap');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  // ── 챕터 상태 계산 ──────────────────────────────────────────────

  /**
   * 각 챕터의 해금/진행중/올클리어 상태를 계산한다.
   * @returns {{ unlocked: boolean, inProgress: boolean, cleared: boolean, currentStars: number, maxStars: number }[]}
   * @private
   */
  _buildChapterStates() {
    return CHAPTERS.map((chapter) => {
      const chapterUnlocked = SaveManager.isUnlocked(chapter.stages[0]);
      let currentStars = 0;
      const maxStars = chapter.stages.length * 3;

      for (const stageId of chapter.stages) {
        currentStars += SaveManager.getStars(stageId);
      }

      const cleared = chapterUnlocked && currentStars === maxStars;
      const inProgress = chapterUnlocked && !cleared;

      return { unlocked: chapterUnlocked, inProgress, cleared, currentStars, maxStars };
    });
  }

  // ── 연결선 렌더링 ──────────────────────────────────────────────

  /**
   * 챕터 노드 간 연결선을 그린다.
   * 해금 경로는 밝은 실선, 잠금 경로는 회색 점선.
   * @private
   */
  _drawConnections() {
    const g = this.add.graphics();
    const chapterStates = this._chapterStates;

    CONNECTIONS.forEach(([a, b]) => {
      const posA = NODE_POSITIONS[a];
      const posB = NODE_POSITIONS[b];
      const stateA = chapterStates[a];
      const stateB = chapterStates[b];
      const bothUnlocked = stateA.unlocked && stateB.unlocked;

      if (bothUnlocked) {
        // 밝은 실선 (해금 경로)
        g.lineStyle(3, 0xaaaaaa, 0.8);
        g.beginPath();
        g.moveTo(posA.x, posA.y);
        g.lineTo(posB.x, posB.y);
        g.strokePath();
      } else {
        // 회색 점선 (잠금 경로) -- 10px 간격, 5px씩 그리기
        g.lineStyle(2, 0x555555, 0.6);
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(len / 10);
        const ux = dx / len;
        const uy = dy / len;
        for (let i = 0; i < steps; i++) {
          if (i % 2 === 0) {
            g.beginPath();
            g.moveTo(posA.x + ux * i * 10, posA.y + uy * i * 10);
            g.lineTo(
              posA.x + ux * Math.min((i + 1) * 10, len),
              posA.y + uy * Math.min((i + 1) * 10, len)
            );
            g.strokePath();
          }
        }
      }
    });
  }

  // ── 노드 렌더링 ──────────────────────────────────────────────

  /**
   * 6개 챕터 노드를 그린다.
   * 잠금(회색+자물쇠) / 진행중(테마색+glow) / 올클리어(골든 테두리+체크).
   * @private
   */
  _drawNodes() {
    const chapterStates = this._chapterStates;

    CHAPTERS.forEach((chapter, idx) => {
      const pos = NODE_POSITIONS[idx];
      const state = chapterStates[idx];
      const { x, y } = pos;

      // 1. 글로우 원 (진행중 전용)
      if (state.inProgress) {
        const glow = this.add.circle(x, y, 50, chapter.themeHex, 0.2);
        this._applyGlow(glow, chapter.themeHex);
      }

      // 2. 노드 배경 원 + 테두리
      let bgColor, borderWidth, borderColor;
      if (!state.unlocked) {
        // 잠금
        bgColor = 0x333333;
        borderWidth = 2;
        borderColor = 0x555555;
      } else if (state.cleared) {
        // 올클리어
        bgColor = 0x221100;
        borderWidth = 4;
        borderColor = 0xffd700;
      } else {
        // 진행중
        bgColor = 0x222222;
        borderWidth = 3;
        borderColor = chapter.themeHex;
      }

      const bgCircle = this.add.circle(x, y, 40, bgColor)
        .setStrokeStyle(borderWidth, borderColor);

      // 3. 챕터 아이콘
      const iconAlpha = state.unlocked ? 1.0 : 0.4;
      this.add.text(x, y - 6, chapter.icon, {
        fontSize: '26px',
      }).setOrigin(0.5).setAlpha(iconAlpha);

      // 4. 챕터 번호 라벨
      const labelColor = state.unlocked ? chapter.themeColor : '#555555';
      const chapterNum = `${idx + 1}장`;
      this.add.text(x, y + 18, chapterNum, {
        fontSize: '11px',
        color: labelColor,
      }).setOrigin(0.5);

      // 5. 별점 표시 (해금된 경우)
      if (state.unlocked) {
        this.add.text(x, y + 30, `\u2605 ${state.currentStars}/${state.maxStars}`, {
          fontSize: '10px',
          color: '#ffd700',
        }).setOrigin(0.5);
      }

      // 6. 자물쇠 (잠금 전용)
      if (!state.unlocked) {
        this.add.text(x + 18, y - 22, '\uD83D\uDD12', {
          fontSize: '16px',
        }).setOrigin(0.5);
      }

      // 7. 체크마크 (올클리어 전용)
      if (state.cleared) {
        this.add.text(x + 18, y - 22, '\u2713', {
          fontSize: '18px',
          color: '#ffd700',
          fontStyle: 'bold',
        }).setOrigin(0.5);
      }

      // 8. 인터랙션 (해금 노드만)
      if (state.unlocked) {
        const hitArea = this.add.circle(x, y, 44, 0x000000, 0)
          .setInteractive({ useHandCursor: true });

        hitArea.on('pointerdown', () => {
          SoundManager.playSFX('sfx_ui_tap');
          this._openStagePanel(idx);
        });
        hitArea.on('pointerover', () => { bgCircle.setScale(1.08); });
        hitArea.on('pointerout', () => { bgCircle.setScale(1.0); });
      }
    });
  }

  // ── 글로우 트윈 ──────────────────────────────────────────────

  /**
   * 진행중 노드에 글로우 애니메이션을 적용한다.
   * @param {Phaser.GameObjects.Arc} node - 글로우 원 오브젝트
   * @param {number} color - 테마 색상 (사용하지 않으나 확장성 유지)
   * @private
   */
  _applyGlow(node, color) {
    this.tweens.add({
      targets: node,
      alpha: { from: 0.1, to: 0.35 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  // ── 상단 HUD ──────────────────────────────────────────────

  /**
   * 상단 HUD (y=0~40): 뒤로가기, 총 별점, 레시피 수집률.
   * @private
   */
  _createHUD() {
    // 배경
    this.add.rectangle(180, 20, 360, 40, 0x0d0d1a).setDepth(50);

    // 뒤로가기 버튼
    const backBg = this.add.rectangle(30, 20, 50, 30, 0x444444)
      .setInteractive({ useHandCursor: true }).setDepth(51);
    this.add.text(30, 20, '< \uB4A4\uB85C', {
      fontSize: '12px',
      color: '#cccccc',
    }).setOrigin(0.5).setDepth(52);

    backBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    backBg.on('pointerover', () => backBg.setFillStyle(0x666666));
    backBg.on('pointerout', () => backBg.setFillStyle(0x444444));

    // 총 별점
    const { current, max } = SaveManager.getTotalStars();
    this.add.text(170, 20, `\u2B50 ${current}/${max}`, {
      fontSize: '13px',
      color: '#ffd700',
    }).setOrigin(0.5).setDepth(51);

    // 레시피 수집률
    const { unlocked, total } = RecipeManager.getCollectionProgress();
    this.add.text(300, 20, `\uD83D\uDCD6 ${unlocked}/${total}`, {
      fontSize: '12px',
      color: '#88ccff',
    }).setOrigin(0.5).setDepth(51);
  }

  // ── 하단 엔드리스 섹션 ──────────────────────────────────────────────

  /**
   * 하단 엔드리스 섹션 (y=555~625): 엔드리스 버튼 + 기록 + 버전.
   * @private
   */
  _createEndlessSection() {
    // 구분선
    this.add.rectangle(180, 555, 360, 1, 0x333355);

    const isEndlessUnlocked = SaveManager.isEndlessUnlocked();
    const endlessRecord = SaveManager.getEndlessRecord();

    if (isEndlessUnlocked) {
      // 해금된 경우
      const endlessBtn = this.add.rectangle(180, 575, 200, 36, 0x6622cc)
        .setInteractive({ useHandCursor: true });
      this.add.text(180, 575, '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC', {
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#cc88ff',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5);

      endlessBtn.on('pointerdown', () => {
        SoundManager.playSFX('sfx_ui_tap');
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ChefSelectScene', { stageId: 'endless' });
        });
      });
      endlessBtn.on('pointerover', () => endlessBtn.setFillStyle(0x8833ee));
      endlessBtn.on('pointerout', () => endlessBtn.setFillStyle(0x6622cc));

      // 최고 기록 표시
      if (endlessRecord.bestWave > 0) {
        this.add.text(180, 600, `\uD83C\uDFC6 \uCD5C\uACE0 Wave ${endlessRecord.bestWave}`, {
          fontSize: '11px',
          color: '#aa88cc',
        }).setOrigin(0.5);
      }
    } else {
      // 잠금된 경우
      this.add.rectangle(180, 575, 200, 36, 0x444444);
      this.add.text(180, 575, '\uD83D\uDD12 \uC5D4\uB4DC\uB9AC\uC2A4 (6-3 \uD074\uB9AC\uC5B4 \uD544\uC694)', {
        fontSize: '12px',
        color: '#666666',
      }).setOrigin(0.5);
    }

    // 푸터 버전 (Phase 11-3d: APP_VERSION 참조)
    this.add.text(180, 625, `v${APP_VERSION}`, {
      fontSize: '10px',
      color: '#555555',
    }).setOrigin(0.5);
  }

  // ── 슬라이드업 패널 ──────────────────────────────────────────────

  /**
   * 챕터의 스테이지 목록을 슬라이드업 패널로 표시한다.
   * @param {number} chapterIdx - 챕터 인덱스 (0-based)
   * @private
   */
  _openStagePanel(chapterIdx) {
    // 기존 패널 존재 시 즉시 파괴
    if (this._panelContainer) {
      this._panelContainer.destroy();
      this._panelContainer = null;
    }

    const chapter = CHAPTERS[chapterIdx];
    const panelH = 400;
    const panelW = 300;
    const panelTargetY = GAME_HEIGHT - panelH;  // 240

    // 패널 컨테이너 (초기 y = GAME_HEIGHT, 화면 아래)
    const container = this.add.container(0, GAME_HEIGHT).setDepth(100);
    this._panelContainer = container;

    // dim 오버레이 (전체 화면)
    const dimOverlay = this.add.rectangle(GAME_WIDTH / 2, -GAME_HEIGHT + panelH / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setInteractive();
    container.add(dimOverlay);

    // 오버레이 터치 시 패널 닫기
    dimOverlay.on('pointerdown', (pointer) => {
      // 패널 영역 내 클릭이면 무시
      // 패널 y 범위: container 기준 0~panelH, 화면 기준 panelTargetY~GAME_HEIGHT
      // 패널 x 범위: 중앙 정렬 30~330
      const panelLeft = (GAME_WIDTH - panelW) / 2;
      const panelRight = panelLeft + panelW;
      const localY = pointer.y - panelTargetY;
      if (pointer.x >= panelLeft && pointer.x <= panelRight && localY >= 0 && localY <= panelH) {
        return;
      }
      SoundManager.playSFX('sfx_ui_tap');
      this._closeStagePanel();
    });

    // 패널 배경
    const panelBg = this.add.rectangle(GAME_WIDTH / 2, panelH / 2, panelW, panelH, 0x1a1a2e)
      .setStrokeStyle(2, 0x4444aa);
    container.add(panelBg);

    // 챕터 제목
    const titleText = this.add.text(GAME_WIDTH / 2, 20, chapter.nameKo, {
      fontSize: '17px',
      fontStyle: 'bold',
      color: chapter.themeColor,
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(titleText);

    // 닫기 버튼
    const panelRight = (GAME_WIDTH + panelW) / 2;
    const closeBtn = this.add.text(panelRight - 20, 20, '\u2715', {
      fontSize: '18px',
      color: '#ff6666',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    container.add(closeBtn);

    closeBtn.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._closeStagePanel();
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff0000'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));

    // 구분선
    const divider = this.add.rectangle(GAME_WIDTH / 2, 38, panelW - 20, 1, 0x4444aa);
    container.add(divider);

    // 스테이지 목록 컨테이너 (스크롤용)
    const listContainer = this.add.container(0, 0);
    container.add(listContainer);

    // 스테이지 목록 렌더링
    const itemH = 58;
    const itemGap = 6;
    let itemY = 50;

    chapter.stages.forEach((stageId) => {
      const stage = STAGES[stageId];
      const unlocked = SaveManager.isUnlocked(stageId);
      const stars = SaveManager.getStars(stageId);
      this._createStageItem(listContainer, stageId, stage, itemY, unlocked, stars, chapter);
      itemY += itemH + itemGap;
    });

    // 패널 내부 스크롤 처리
    const contentHeight = chapter.stages.length * (itemH + itemGap);
    const visibleHeight = panelH - 50;  // 패널 내 표시 가능 높이 (헤더 50px 제외)
    const maxScroll = Math.max(0, contentHeight - visibleHeight);

    if (maxScroll > 0) {
      let dragStartY = 0;
      let dragScrollY = 0;
      let scrollY = 0;

      this.input.on('pointerdown', this._panelDragStart = (pointer) => {
        if (!this._panelContainer) return;
        dragStartY = pointer.y;
        dragScrollY = scrollY;
      });

      this.input.on('pointermove', this._panelDragMove = (pointer) => {
        if (!this._panelContainer || !pointer.isDown) return;
        // 패널 영역 내에서만 스크롤
        const panelLeft = (GAME_WIDTH - panelW) / 2;
        const panelRightX = panelLeft + panelW;
        if (pointer.x < panelLeft || pointer.x > panelRightX) return;
        if (pointer.y < panelTargetY || pointer.y > GAME_HEIGHT) return;

        const dy = pointer.y - dragStartY;
        scrollY = Phaser.Math.Clamp(dragScrollY - dy, 0, maxScroll);
        listContainer.y = -scrollY;
      });
    }

    // 슬라이드업 애니메이션
    this.tweens.add({
      targets: container,
      y: panelTargetY,
      duration: 250,
      ease: 'Power2',
    });
  }

  /**
   * 슬라이드업 패널을 닫는다 (슬라이드다운 + 파괴).
   * @private
   */
  _closeStagePanel() {
    if (!this._panelContainer) return;

    // 스크롤 이벤트 정리
    if (this._panelDragStart) {
      this.input.off('pointerdown', this._panelDragStart);
      this._panelDragStart = null;
    }
    if (this._panelDragMove) {
      this.input.off('pointermove', this._panelDragMove);
      this._panelDragMove = null;
    }

    this.tweens.add({
      targets: this._panelContainer,
      y: GAME_HEIGHT,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this._panelContainer) {
          this._panelContainer.destroy();
          this._panelContainer = null;
        }
      },
    });
  }

  // ── 패널 내 스테이지 항목 ──────────────────────────────────────────────

  /**
   * 패널 내 스테이지 항목을 생성한다.
   * StageSelectScene._createStageItem 로직 재활용.
   * @param {Phaser.GameObjects.Container} container - 부모 컨테이너
   * @param {string} stageId - 스테이지 ID
   * @param {object} stage - 스테이지 데이터
   * @param {number} localY - 컨테이너 내부 y좌표
   * @param {boolean} unlocked - 해금 여부
   * @param {number} stars - 별점 (0~3)
   * @param {object} chapter - 챕터 데이터
   * @private
   */
  _createStageItem(container, stageId, stage, localY, unlocked, stars, chapter) {
    const cx = GAME_WIDTH / 2;
    const itemW = 280;
    const itemH = 50;

    // 챕터별 배경색/테두리색
    const bgColor = unlocked ? 0x1a1a3a : 0x1a1a1a;
    const borderColor = unlocked ? 0x4444aa : 0x333333;

    // 배경
    const bg = this.add.rectangle(cx, localY, itemW, itemH, bgColor)
      .setStrokeStyle(2, borderColor);
    container.add(bg);

    if (unlocked) {
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerdown', () => {
        SoundManager.playSFX('sfx_ui_tap');
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ChefSelectScene', { stageId });
        });
      });
      bg.on('pointerover', () => bg.setFillStyle(0x2a2a4a));
      bg.on('pointerout', () => bg.setFillStyle(bgColor));
    }

    // 스테이지 번호
    const numColor = unlocked ? chapter.themeColor : '#555555';
    const numText = this.add.text(cx - 120, localY - 8, stageId, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: numColor,
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);
    container.add(numText);

    // 스테이지 이름
    const nameText = this.add.text(cx - 60, localY - 8, stage.nameKo, {
      fontSize: '13px',
      color: unlocked ? '#ffffff' : '#555555',
    }).setOrigin(0, 0.5);
    container.add(nameText);

    // 웨이브 수
    const waveCount = stage.waves?.length || '?';
    const waveText = this.add.text(cx - 60, localY + 10, `${waveCount} \uC6E8\uC774\uBE0C`, {
      fontSize: '10px',
      color: unlocked ? '#aaaaaa' : '#444444',
    }).setOrigin(0, 0.5);
    container.add(waveText);

    if (unlocked) {
      // 별점 또는 미클리어 표시
      if (stars > 0) {
        const starStr = '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars);
        const starText = this.add.text(cx + 120, localY - 4, starStr, {
          fontSize: '16px',
          color: '#ffd700',
        }).setOrigin(1, 0.5);
        container.add(starText);
      } else {
        const unclearText = this.add.text(cx + 120, localY - 4, '\uBBF8\uD074\uB9AC\uC5B4', {
          fontSize: '10px',
          color: '#888888',
        }).setOrigin(1, 0.5);
        container.add(unclearText);
      }
    } else {
      // 잠금 표시
      const lockText = this.add.text(cx + 120, localY, '\uD83D\uDD12', {
        fontSize: '20px',
      }).setOrigin(1, 0.5);
      container.add(lockText);
    }
  }
}
