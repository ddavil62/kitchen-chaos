/**
 * @fileoverview 스테이지 월드맵 씬.
 * Phase 11-2: StageSelectScene을 비주얼 노드맵으로 교체.
 * 6개 챕터를 2열 3행 지그재그 노드 그래프로 표현한다.
 * 노드 터치 -> 슬라이드업 패널 -> 스테이지 선택 -> ChefSelectScene.
 * Phase 11-3b: fadeIn 300ms 통일.
 * Phase 11-3d: 버전 표기 APP_VERSION 참조로 변경.
 * Phase 19-2: 시즌 탭 시스템 (12장 = 시즌1 6장 + 시즌2 6장).
 * Phase 24-2: 3탭(그룹1~3) 9챕터 맵 UI 확장. 24챕터 체계.
 */

import Phaser from 'phaser';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { GAME_WIDTH, GAME_HEIGHT, APP_VERSION } from '../config.js';
import { STAGES } from '../data/stageData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { StoryManager } from '../managers/StoryManager.js';

// ── 챕터별 스테이지 분류 (Phase 24-2: 24챕터 3그룹 체계) ──

const CHAPTERS = [
  // ── 그룹 1 (ch1~ch6) ──
  { id: 'ch1',  nameKo: '1장: 파스타 레스토랑',   themeColor: '#ffd700', themeHex: 0xffd700, strokeColor: '#8b4500', icon: '\uD83C\uDF5D', stages: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6'] },
  { id: 'ch2',  nameKo: '2장: 동양 요리 식당',     themeColor: '#88ccff', themeHex: 0x88ccff, strokeColor: '#224488', icon: '\uD83C\uDF5C', stages: ['2-1', '2-2', '2-3'] },
  { id: 'ch3',  nameKo: '3장: 씨푸드 바',          themeColor: '#66eeff', themeHex: 0x66eeff, strokeColor: '#1a6688', icon: '\uD83E\uDD9E', stages: ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6'] },
  { id: 'ch4',  nameKo: '4장: 화산 BBQ',           themeColor: '#ff6622', themeHex: 0xff6622, strokeColor: '#881100', icon: '\uD83D\uDD25', stages: ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6'] },
  { id: 'ch5',  nameKo: '5장: 마법사 디저트 카페', themeColor: '#cc88ff', themeHex: 0xcc88ff, strokeColor: '#5522aa', icon: '\uD83E\uDDC1', stages: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6'] },
  { id: 'ch6',  nameKo: '6장: 그랑 가스트로노미', themeColor: '#ffd700', themeHex: 0xffd700, strokeColor: '#886600', icon: '\uD83D\uDC68\u200D\uD83C\uDF73', stages: ['6-1', '6-2', '6-3'] },
  // ── 그룹 2 (ch7~ch15) ──
  { id: 'ch7',  nameKo: '7장: 사쿠라 이자카야',    themeColor: '#ffb7c5', themeHex: 0xffb7c5, strokeColor: '#994466', icon: '\uD83C\uDF38', stages: ['7-1', '7-2', '7-3', '7-4', '7-5', '7-6'] },
  { id: 'ch8',  nameKo: '8장: 이자카야 지하 진입로', themeColor: '#cc6688', themeHex: 0xcc6688, strokeColor: '#883344', icon: '\uD83C\uDF76', stages: ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6'] },
  { id: 'ch9',  nameKo: '9장: 사케 오니 최종전',   themeColor: '#cc3333', themeHex: 0xcc3333, strokeColor: '#881111', icon: '\uD83C\uDF76', stages: ['9-1', '9-2', '9-3', '9-4', '9-5', '9-6'] },
  { id: 'ch10', nameKo: '10장: 용의 주방',          themeColor: '#ff4500', themeHex: 0xff4500, strokeColor: '#882200', icon: '\uD83D\uDC09', stages: ['10-1', '10-2', '10-3', '10-4', '10-5', '10-6'] },
  { id: 'ch11', nameKo: '11장: 용의 주방 심층부',    themeColor: '#2a0a3a', themeHex: 0x2a0a3a, strokeColor: '#110022', icon: '\uD83D\uDC09', stages: ['11-1', '11-2', '11-3', '11-4', '11-5', '11-6'] },
  { id: 'ch12', nameKo: '12장: 용의 궁전',            themeColor: '#cc2200', themeHex: 0xcc2200, strokeColor: '#661100', icon: '\uD83D\uDC09', stages: ['12-1', '12-2', '12-3', '12-4', '12-5', '12-6'] },
  { id: 'ch13', nameKo: '13장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['13-1', '13-2', '13-3', '13-4', '13-5', '13-6'], theme: 'placeholder' },
  { id: 'ch14', nameKo: '14장: 비스트로 지하 창고',  themeColor: '#8b2040', themeHex: 0x8b2040, strokeColor: '#501020', icon: '\uD83C\uDF77', stages: ['14-1', '14-2', '14-3', '14-4', '14-5', '14-6'] },
  { id: 'ch15', nameKo: '15장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['15-1', '15-2', '15-3', '15-4', '15-5', '15-6'], theme: 'placeholder' },
  // ── 그룹 3 (ch16~ch24) ──
  { id: 'ch16', nameKo: '16장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['16-1', '16-2', '16-3', '16-4', '16-5', '16-6'], theme: 'placeholder' },
  { id: 'ch17', nameKo: '17장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['17-1', '17-2', '17-3', '17-4', '17-5', '17-6'], theme: 'placeholder' },
  { id: 'ch18', nameKo: '18장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['18-1', '18-2', '18-3', '18-4', '18-5', '18-6'], theme: 'placeholder' },
  { id: 'ch19', nameKo: '19장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['19-1', '19-2', '19-3', '19-4', '19-5', '19-6'], theme: 'placeholder' },
  { id: 'ch20', nameKo: '20장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['20-1', '20-2', '20-3', '20-4', '20-5', '20-6'], theme: 'placeholder' },
  { id: 'ch21', nameKo: '21장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['21-1', '21-2', '21-3', '21-4', '21-5', '21-6'], theme: 'placeholder' },
  { id: 'ch22', nameKo: '22장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['22-1', '22-2', '22-3', '22-4', '22-5', '22-6'], theme: 'placeholder' },
  { id: 'ch23', nameKo: '23장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['23-1', '23-2', '23-3', '23-4', '23-5', '23-6'], theme: 'placeholder' },
  { id: 'ch24', nameKo: '24장: (미구현)',            themeColor: '#555555', themeHex: 0x555555, strokeColor: '#333333', icon: '\uD83D\uDD12', stages: ['24-1', '24-2', '24-3', '24-4', '24-5', '24-6'], theme: 'placeholder' },
];

// ── 노드 위치 좌표 (3열 3행, Phase 24-2: 9챕터 그룹 맵) ──

// Phase 24-2 AD 검수 반영: 3행 균등 배치 (y=190/297/404)
const NODE_POSITIONS = [
  { x: 80,  y: 190 },  // 노드 0 (좌상)
  { x: 180, y: 190 },  // 노드 1 (중상)
  { x: 280, y: 190 },  // 노드 2 (우상)
  { x: 80,  y: 297 },  // 노드 3 (좌중)
  { x: 180, y: 297 },  // 노드 4 (중중)
  { x: 280, y: 297 },  // 노드 5 (우중)
  { x: 80,  y: 404 },  // 노드 6 (좌하)
  { x: 180, y: 404 },  // 노드 7 (중하)
  { x: 280, y: 404 },  // 노드 8 (우하)
];

// ── 연결선 쌍 (Phase 24-2: 9노드 3x3 격자 연결) ──

const GROUP_CONNECTIONS = [
  // 가로 연결 (같은 행)
  [0, 1], [1, 2],  // 상단 행
  [3, 4], [4, 5],  // 중간 행
  [6, 7], [7, 8],  // 하단 행
  // 세로 연결 (같은 열)
  [0, 3], [3, 6],  // 왼쪽 열
  [1, 4], [4, 7],  // 가운데 열
  [2, 5], [5, 8],  // 오른쪽 열
];

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
  }

  /**
   * 씬 생성. 배경, 그룹 탭, 챕터 노드, 연결선, HUD, 엔드리스 섹션을 그린다.
   * Phase 24-2: 3탭 그룹 시스템으로 확장.
   */
  create() {
    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ─���
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Phase 60-16: 배경 rect → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');

    // 2. 현재 그룹 상태 (Phase 24-2)
    this._currentGroup = 1;
    const saveData = SaveManager.load();
    this._season2Unlocked = !!saveData.season2Unlocked;
    this._season3Unlocked = !!saveData.season3Unlocked;

    // 3. 그룹 탭 생성 (Phase 24-2)
    this._createGroupTabs();

    // 4. 맵 콘텐츠 컨테이너 (탭 전환 시 재생성)
    this._mapContainer = null;
    this._buildGroupMap();

    // 5. 상단 HUD
    this._createHUD();

    // 6. 하단 엔드리스 섹션
    this._createEndlessSection();

    // 7. 패널 상태 초기화
    this._panelContainer = null;

    // 8. 대화 트리거
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

  // ── 그룹 탭 (Phase 24-2) ──────────────────────────────────────

  /**
   * 그룹 1/2/3 탭 버튼을 생성한다.
   * 그룹2는 season2Unlocked 필요, 그룹3는 season3Unlocked 필요.
   * @private
   */
  _createGroupTabs() {
    const tabY = 64;   // AD 검수: HUD와 4px 여백 확보
    const tabW = 100;
    const tabH = 40;   // AD 검수: 터치 타겟 28→40px
    const tabGap = 8;
    const totalW = tabW * 3 + tabGap * 2;
    const startX = (GAME_WIDTH - totalW) / 2 + tabW / 2;

    // Phase 60-16: 탭 1 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    this._tab1Bg = NineSliceFactory.raw(this, startX, tabY, tabW, tabH, 'btn_primary_normal');
    this._tab1Bg.setTint(0x3344aa);
    const tab1Hit = new Phaser.Geom.Rectangle(-tabW / 2, -tabH / 2, tabW, tabH);
    this._tab1Bg.setInteractive(tab1Hit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this._tab1Bg.setDepth(40);
    this._tab1Text = this.add.text(startX, tabY, '1~6\uC7A5', {
      fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(41);

    this._tab1Bg.on('pointerdown', () => {
      if (this._currentGroup === 1) return;
      SoundManager.playSFX('sfx_ui_tap');
      this._switchGroup(1);
    });

    // ── 탭 2: 7~15장 ──
    const tab2X = startX + tabW + tabGap;
    const tab2Locked = !this._season2Unlocked;
    const tab2Color = tab2Locked ? 0x222222 : 0x2a2a44;
    // Phase 60-16: 탭 2 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    this._tab2Bg = NineSliceFactory.raw(this, tab2X, tabY, tabW, tabH, 'btn_primary_normal');
    this._tab2Bg.setTint(tab2Color);
    this._tab2Bg.setDepth(40);

    const tab2Label = tab2Locked ? '\uD83D\uDD12 7~15\uC7A5' : '7~15\uC7A5';
    const tab2TextColor = tab2Locked ? '#555555' : '#aaaacc';
    this._tab2Text = this.add.text(tab2X, tabY, tab2Label, {
      fontSize: '12px', fontStyle: 'bold', color: tab2TextColor,
    }).setOrigin(0.5).setDepth(41);

    if (!tab2Locked) {
      const tab2HitArea = new Phaser.Geom.Rectangle(-tabW / 2, -tabH / 2, tabW, tabH);
      this._tab2Bg.setInteractive(tab2HitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      this._tab2Bg.on('pointerdown', () => {
        if (this._currentGroup === 2) return;
        SoundManager.playSFX('sfx_ui_tap');
        this._switchGroup(2);
      });
    }

    // ── 탭 3: 16~24장 ──
    const tab3X = tab2X + tabW + tabGap;
    const tab3Locked = !this._season3Unlocked;
    const tab3Color = tab3Locked ? 0x222222 : 0x2a2a44;
    // Phase 60-16: 탭 3 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    this._tab3Bg = NineSliceFactory.raw(this, tab3X, tabY, tabW, tabH, 'btn_primary_normal');
    this._tab3Bg.setTint(tab3Color);
    this._tab3Bg.setDepth(40);

    const tab3Label = tab3Locked ? '\uD83D\uDD12 16~24\uC7A5' : '16~24\uC7A5';
    const tab3TextColor = tab3Locked ? '#555555' : '#aaaacc';
    this._tab3Text = this.add.text(tab3X, tabY, tab3Label, {
      fontSize: '12px', fontStyle: 'bold', color: tab3TextColor,
    }).setOrigin(0.5).setDepth(41);

    if (!tab3Locked) {
      const tab3HitArea = new Phaser.Geom.Rectangle(-tabW / 2, -tabH / 2, tabW, tabH);
      this._tab3Bg.setInteractive(tab3HitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      this._tab3Bg.on('pointerdown', () => {
        if (this._currentGroup === 3) return;
        SoundManager.playSFX('sfx_ui_tap');
        this._switchGroup(3);
      });
    }
  }

  /**
   * 그룹을 전환한다. 맵 콘텐츠를 재생성한다.
   * @param {number} group - 1, 2, 3
   * @private
   */
  _switchGroup(group) {
    this._currentGroup = group;

    // 기존 패널 닫기
    if (this._panelContainer) {
      this._panelContainer.destroy();
      this._panelContainer = null;
    }

    // Phase 60-16: 탭 하이라이트 갱신 — setFillStyle → setTint (NineSlice Container)
    const setTab = (bg, text, isActive, isLocked) => {
      if (isActive) {
        bg.setTint(0x3344aa);
        text.setColor('#ffffff');
      } else if (isLocked) {
        bg.setTint(0x222222);
        text.setColor('#555555');
      } else {
        bg.setTint(0x2a2a44);
        text.setColor('#aaaacc');
      }
    };

    setTab(this._tab1Bg, this._tab1Text, group === 1, false);
    setTab(this._tab2Bg, this._tab2Text, group === 2, !this._season2Unlocked);
    setTab(this._tab3Bg, this._tab3Text, group === 3, !this._season3Unlocked);

    // 맵 재생성
    this._buildGroupMap();

    // HUD 별점 갱신
    if (this._hudStarText) {
      const { current, max } = SaveManager.getTotalStars(group);
      this._hudStarText.setText(`\u2B50 ${current}/${max}`);
    }
  }

  // ── 그룹별 맵 빌드 (Phase 24-2) ──────────────────────────────────

  /**
   * 현재 그룹에 맞는 챕터 노드/연결선을 생성한다.
   * @private
   */
  _buildGroupMap() {
    // 기존 맵 컨테이너 파괴
    if (this._mapContainer) {
      this._mapContainer.destroy();
    }

    this._mapContainer = this.add.container(0, 0).setDepth(10);

    // 그룹별 챕터 9개 슬라이스
    let chapterSliceStart, chapterSliceEnd;
    if (this._currentGroup === 1) {
      chapterSliceStart = 0;   // ch1~ch6 (6개)
      chapterSliceEnd   = 6;
    } else if (this._currentGroup === 2) {
      chapterSliceStart = 6;   // ch7~ch15 (9개)
      chapterSliceEnd   = 15;
    } else {
      chapterSliceStart = 15;  // ch16~ch24 (9개)
      chapterSliceEnd   = 24;
    }

    const chapters = CHAPTERS.slice(chapterSliceStart, chapterSliceEnd);

    // 챕터 상태 계산
    this._chapterStates = chapters.map((chapter) => {
      // placeholder 챕터는 항상 잠금 + 비활성
      if (chapter.theme === 'placeholder') {
        return { unlocked: false, inProgress: false, cleared: false, currentStars: 0, maxStars: chapter.stages.length * 3, placeholder: true };
      }
      const chapterUnlocked = SaveManager.isUnlocked(chapter.stages[0]);
      let currentStars = 0;
      const maxStars = chapter.stages.length * 3;
      for (const stageId of chapter.stages) {
        currentStars += SaveManager.getStars(stageId);
      }
      const cleared = chapterUnlocked && currentStars === maxStars;
      const inProgress = chapterUnlocked && !cleared;
      return { unlocked: chapterUnlocked, inProgress, cleared, currentStars, maxStars, placeholder: false };
    });

    // 그룹1(6챕터)은 2행 전용 좌표를 사용해 빈 하단 공간을 제거 (AD 검수)
    // 그룹1은 탭과의 공백을 줄여 중앙 배치 (AD 재검수 반영: y=170/340)
    const positions = (this._currentGroup === 1)
      ? [
          { x: 80,  y: 170 }, { x: 180, y: 170 }, { x: 280, y: 170 },
          { x: 80,  y: 340 }, { x: 180, y: 340 }, { x: 280, y: 340 },
        ]
      : NODE_POSITIONS;

    // 연결선 렌더링
    this._drawConnections(chapters, positions);

    // 노드 렌더링
    this._drawNodes(chapters, positions);
  }

  // ── 연결선 렌더링 ──────────────────────────────────────────────

  /**
   * 챕터 노드 간 연결선을 그린다.
   * 해금 경로는 밝은 실선, 잠금 경로는 회색 점선.
   * Phase 24-2: GROUP_CONNECTIONS 사용, 9노드 3x3 격자.
   * @param {object[]} chapters - 현재 그룹의 챕터 배열 (6~9개)
   * @private
   */
  _drawConnections(chapters, positions) {
    const g = this.add.graphics();
    this._mapContainer.add(g);
    const chapterStates = this._chapterStates;

    GROUP_CONNECTIONS.forEach(([a, b]) => {
      const posA = positions[a];
      const posB = positions[b];
      if (!posA || !posB) return;  // 해당 노드가 없으면 연결선 스킵
      const stateA = chapterStates[a];
      const stateB = chapterStates[b];
      if (!stateA || !stateB) return;  // 그룹1(6챕터)에서 인덱스 6~8 참조 방지
      const bothUnlocked = stateA.unlocked && stateB.unlocked;

      if (bothUnlocked) {
        // 밝은 실선 (해금 경���)
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

  // ���─ 노드 렌더링 ──────────────────────────────────────────────

  /**
   * 챕터 노드를 그린다.
   * 잠금(회색+자물쇠) / 진행중(테마색+glow) / 올클리어(골든 테두리+체크).
   * Phase 24-2: 그룹 기반 오프셋, placeholder 노드 처리.
   * @param {object[]} chapters - 현재 그룹의 챕터 배열 (6~9개)
   * @private
   */
  _drawNodes(chapters, positions) {
    const chapterStates = this._chapterStates;
    // 그룹1=0, 그룹2=6, 그룹3=15 기준 절대 챕터 번호 계산
    const groupBaseChapter = this._currentGroup === 1 ? 1 : (this._currentGroup === 2 ? 7 : 16);

    // 그룹 전체가 placeholder이면 단일 "?" 노드 1개만 표시
    const allPlaceholder = chapters.every(ch => ch.theme === 'placeholder');
    if (allPlaceholder) {
      const cx = GAME_WIDTH / 2;
      const cy = 297;
      const circle = this.add.circle(cx, cy, 50, 0x1a1a1a).setStrokeStyle(2, 0x333333);
      this._mapContainer.add(circle);
      const qText = this.add.text(cx, cy - 10, '?', {
        fontSize: '34px', color: '#444444', fontStyle: 'bold',
      }).setOrigin(0.5);
      this._mapContainer.add(qText);
      const comingText = this.add.text(cx, cy + 26, '\ub354 \ub9ce\uc740 \uc774\uc57c\uae30\uac00\n\ucc3e\uc544\uc635\ub2c8\ub2e4', {
        fontSize: '11px', color: '#444444', align: 'center',
      }).setOrigin(0.5);
      this._mapContainer.add(comingText);
      return;
    }

    chapters.forEach((chapter, idx) => {
      const pos = positions[idx];
      const state = chapterStates[idx];
      const { x, y } = pos;

      // placeholder 챕터는 최소 "?" 노드만 표시
      if (state.placeholder) {
        const pCircle = this.add.circle(x, y, 28, 0x1a1a1a).setStrokeStyle(1, 0x333333);
        this._mapContainer.add(pCircle);
        const pText = this.add.text(x, y, '?', {
          fontSize: '20px', color: '#3a3a3a', fontStyle: 'bold',
        }).setOrigin(0.5);
        this._mapContainer.add(pText);
        return;
      }

      // 1. 글로우 원 (진행중 전용) — Phase 63 FIX-12: 50 → 56
      if (state.inProgress) {
        const glow = this.add.circle(x, y, 56, chapter.themeHex, 0.2);
        this._mapContainer.add(glow);
        this._applyGlow(glow, chapter.themeHex);
      }

      // 2. 노드 배경 원 + 테두리
      let bgColor, borderWidth, borderColor;
      if (!state.unlocked) {
        bgColor = 0x333333;
        borderWidth = 2;
        borderColor = 0x555555;
      } else if (state.cleared) {
        bgColor = 0x221100;
        borderWidth = 4;
        borderColor = 0xffd700;
      } else {
        bgColor = 0x222222;
        borderWidth = 3;
        borderColor = chapter.themeHex;
      }

      // Phase 63 FIX-12: 반경 40 → 46 (직경 80→92), 챕터 아이콘 식별성 향상
      const bgCircle = this.add.circle(x, y, 46, bgColor)
        .setStrokeStyle(borderWidth, borderColor);
      this._mapContainer.add(bgCircle);

      // 3. 챕터 아이콘 (PNG 우선, 없으면 이모지 폴백)
      // Phase 63 FIX-12: 24x24 → 34x34 (패딩 감소로 아이콘 식별성 확보)
      const iconAlpha = state.unlocked ? 1.0 : 0.4;
      const iconKey = `chapter_icon_${chapter.id}`;
      let iconObj;
      if (this.textures.exists(iconKey)) {
        iconObj = this.add.image(x, y - 8, iconKey).setDisplaySize(34, 34);
      } else {
        iconObj = this.add.text(x, y - 8, chapter.icon, { fontSize: '34px' }).setOrigin(0.5);
      }
      iconObj.setAlpha(iconAlpha);
      this._mapContainer.add(iconObj);

      // 4. 챕터 번호 라벨 — Phase 63: y+18 → y+22
      const labelColor = state.unlocked ? chapter.themeColor : '#555555';
      const chapterNum = `${groupBaseChapter + idx}\uC7A5`;
      const labelText = this.add.text(x, y + 22, chapterNum, {
        fontSize: '11px',
        color: labelColor,
      }).setOrigin(0.5);
      this._mapContainer.add(labelText);

      // 5. 별점 표시 (해금된 경우) — Phase 63: y+30 → y+36 (반경 확대 반영)
      if (state.unlocked) {
        const starText = this.add.text(x, y + 36, `\u2605 ${state.currentStars}/${state.maxStars}`, {
          fontSize: '9px',
          color: '#ffd700',
        }).setOrigin(0.5);
        this._mapContainer.add(starText);
      }

      // 6. 자물쇠 (잠금 전용) — Phase 63: 위치 (18,-22) → (22,-26)
      if (!state.unlocked) {
        const lockText = this.add.text(x + 22, y - 26, '\uD83D\uDD12', {
          fontSize: '16px',
        }).setOrigin(0.5);
        this._mapContainer.add(lockText);
      }

      // 7. 체크마크 (올클리어 전용)
      if (state.cleared) {
        const checkText = this.add.text(x + 22, y - 26, '\u2713', {
          fontSize: '18px',
          color: '#ffd700',
          fontStyle: 'bold',
        }).setOrigin(0.5);
        this._mapContainer.add(checkText);
      }

      // 8. 인터랙션 (해금 노드만) — Phase 63: 히트 44 → 50
      if (state.unlocked) {
        const hitArea = this.add.circle(x, y, 50, 0x000000, 0)
          .setInteractive({ useHandCursor: true });
        this._mapContainer.add(hitArea);

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
   * Phase 24-2: 그룹별 별점 표시 + _hudStarText 멤버 변수 저장.
   * @private
   */
  _createHUD() {
    // Phase 60-16: HUD 배경 rect → NineSliceFactory.panel 'dark'
    NineSliceFactory.panel(this, 180, 20, 360, 40, 'dark').setDepth(50);

    // Phase 60-16: 뒤로가기 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    // Phase 62: tint 0x444444 → 0x888888, 텍스트 12px #cccccc → 14px #ffffff + 그림자 (플레이스홀더 인지 해소)
    const BACK_W = 56;
    const BACK_H = 32;
    const backBg = NineSliceFactory.raw(this, 32, 20, BACK_W, BACK_H, 'btn_secondary_normal');
    backBg.setTint(0x888888);
    const backHit = new Phaser.Geom.Rectangle(-BACK_W / 2, -BACK_H / 2, BACK_W, BACK_H);
    backBg.setInteractive(backHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    backBg.setDepth(51);
    this.add.text(32, 20, '\u2039 \uB4A4\uB85C', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(52);

    backBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    // Phase 60-16: setFillStyle → setTexture + setTint
    backBg.on('pointerover', () => { backBg.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); backBg.setTint(0xaaaaaa); });
    backBg.on('pointerout', () => { backBg.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); backBg.setTint(0x888888); });

    // 총 별점 (Phase 24-2: 그룹별 필터)
    const { current, max } = SaveManager.getTotalStars(this._currentGroup);
    this._hudStarText = this.add.text(170, 20, `\u2B50 ${current}/${max}`, {
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
    // Phase 60-16: 구분선 rect → NineSliceFactory.dividerH
    NineSliceFactory.dividerH(this, 180, 555, 360, 2);

    const isEndlessUnlocked = SaveManager.isEndlessUnlocked();
    const endlessRecord = SaveManager.getEndlessRecord();

    if (isEndlessUnlocked) {
      // Phase 60-16: 엔드리스 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
      const WM_ENDLESS_W = 200;
      const WM_ENDLESS_H = 36;
      const endlessBtn = NineSliceFactory.raw(this, 180, 575, WM_ENDLESS_W, WM_ENDLESS_H, 'btn_primary_normal');
      endlessBtn.setTint(0x6622cc);
      const wmEndlessHit = new Phaser.Geom.Rectangle(-WM_ENDLESS_W / 2, -WM_ENDLESS_H / 2, WM_ENDLESS_W, WM_ENDLESS_H);
      endlessBtn.setInteractive(wmEndlessHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
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
      // Phase 60-16: setFillStyle → setTexture + setTint
      endlessBtn.on('pointerover', () => { endlessBtn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); endlessBtn.setTint(0x8833ee); });
      endlessBtn.on('pointerout', () => { endlessBtn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); endlessBtn.setTint(0x6622cc); });

      // 최고 기록 표시
      if (endlessRecord.bestWave > 0) {
        this.add.text(180, 600, `\uD83C\uDFC6 \uCD5C\uACE0 Wave ${endlessRecord.bestWave}`, {
          fontSize: '11px',
          color: '#aa88cc',
        }).setOrigin(0.5);
      }
    } else {
      // Phase 60-16: 잠금 엔드리스 rect → NineSliceFactory.panel 'dark' + setTint
      NineSliceFactory.panel(this, 180, 575, 200, 36, 'dark').setTint(0x444444);
      this.add.text(180, 575, '\uD83D\uDD12 \uC5D4\uB4DC\uB9AC\uC2A4 (24-6 \uD074\uB9AC\uC5B4 \uD544\uC694)', {
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
   * 챕터의 스테이지 목록을 슬라이���업 패널로 표시한다.
   * Phase 24-2: 그룹 오프셋 적용.
   * @param {number} chapterIdx - 현재 그룹 내 챕터 인덱스 (0~8)
   * @private
   */
  _openStagePanel(chapterIdx) {
    // 기존 패널 존재 시 즉시 파괴
    if (this._panelContainer) {
      this._panelContainer.destroy();
      this._panelContainer = null;
    }

    // Phase 24-2: 그룹 오프셋 적용
    const groupOffset = this._currentGroup === 1 ? 0 : (this._currentGroup === 2 ? 6 : 15);
    const chapter = CHAPTERS[groupOffset + chapterIdx];
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
      const panelLeft = (GAME_WIDTH - panelW) / 2;
      const panelRight = panelLeft + panelW;
      const localY = pointer.y - panelTargetY;
      if (pointer.x >= panelLeft && pointer.x <= panelRight && localY >= 0 && localY <= panelH) {
        return;
      }
      SoundManager.playSFX('sfx_ui_tap');
      this._closeStagePanel();
    });

    // Phase 60-16: 패널 배경 rect → NineSliceFactory.panel 'dark'
    const panelBg = NineSliceFactory.panel(this, GAME_WIDTH / 2, panelH / 2, panelW, panelH, 'dark');
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

    // Phase 60-16: 구분선 rect → NineSliceFactory.dividerH
    const divider = NineSliceFactory.dividerH(this, GAME_WIDTH / 2, 38, panelW - 20, 2);
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
    const visibleHeight = panelH - 50;
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
   * @param {Phaser.GameObjects.Container} container - 부모 컨테이��
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

    // Phase 60-16: 스테이지 항목 배경 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    const bgColor = unlocked ? 0x1a1a3a : 0x1a1a1a;
    const bg = NineSliceFactory.raw(this, cx, localY, itemW, itemH, 'btn_secondary_normal');
    bg.setTint(bgColor);
    container.add(bg);

    if (unlocked) {
      const stageHit = new Phaser.Geom.Rectangle(-itemW / 2, -itemH / 2, itemW, itemH);
      bg.setInteractive(stageHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

      bg.on('pointerdown', () => {
        SoundManager.playSFX('sfx_ui_tap');
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ChefSelectScene', { stageId });
        });
      });
      // Phase 60-16: setFillStyle → setTexture + setTint
      bg.on('pointerover', () => { bg.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); bg.setTint(0x2a2a4a); });
      bg.on('pointerout', () => { bg.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); bg.setTint(bgColor); });
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
