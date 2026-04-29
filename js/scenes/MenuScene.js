/**
 * @fileoverview 메뉴 씬. 타이틀 화면과 게임 시작 버튼을 표시한다.
 * Phase 10-4: BGM 재생 추가.
 * Phase 10-6: 사운드 설정 UI(기어 버튼 + 설정 패널) 추가.
 * Phase 11-2: "게임 시작" -> WorldMapScene 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 도감 버튼 Secondary 팔레트 적용.
 * Phase 11-3d: 하단 버전 표기(APP_VERSION) 추가.
 * Phase 61: 메뉴 비주얼 에셋 적용 (배경 이미지 + 타이틀 로고 이미지).
 * Phase 73: 설정 패널에 세이브 복구 버튼 + 백업 목록/확인 모달 추가.
 * Phase 75B: "오늘의 미션" 배너 + 미션/캘린더 통합 팝업 모달 추가.
 *            기존 요소 y좌표 +60px 하향 조정.
 * Phase 82: 리소스 HUD 추가 (골드/코인/미력의 정수 상시 표시, y=100).
 * Phase 87: 에너지 HUD 2행 추가 (에너지 N/5 + 충전 카운트다운).
 */

import Phaser from 'phaser';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { NS_KEYS } from '../ui/UITheme.js';
import { GAME_WIDTH, GAME_HEIGHT, APP_VERSION, ENDLESS_LOCK_LABEL, ENERGY_MAX } from '../config.js';
import { SaveManager } from '../managers/SaveManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { redeemCoupon, getCheatCodeHints } from '../managers/CouponRegistry.js';
import { DailyMissionManager } from '../managers/DailyMissionManager.js';
import { LoginBonusManager, LOGIN_REWARDS } from '../managers/LoginBonusManager.js';
import { EnergyManager } from '../managers/EnergyManager.js';
import { WeeklyEventManager } from '../managers/WeeklyEventManager.js';
import { SeasonManager } from '../managers/SeasonManager.js';
import { IAPManager } from '../managers/IAPManager.js';
import { SEASON_REWARD_ICON_MAP } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // ── Phase 75B: 일일 미션/로그인 보너스 리셋 체크 (fadeIn 전에 실행) ──
    DailyMissionManager.checkAndReset();
    LoginBonusManager.checkAndGrantDaily();

    // ── Phase 87: MenuScene 진입 시 에너지 자동 충전 적용 ──
    EnergyManager.applyAutoRecharge();

    // ── BGM 재생 (Phase 10-4) ──
    SoundManager.playBGM('bgm_menu');

    // Phase 61: 메뉴 배경 이미지 (depth -1, 배경 최하단)
    // Phase 90-C (C-7): 이벤트 유형에 따른 배경 분기 구조 (에셋 미존재 시 기존 menu_bg 폴백)
    const activeEvent = WeeklyEventManager.getActiveEvent();
    let menuBgKey = 'menu_bg'; // 기본 배경 (폴백)
    if (activeEvent) {
      // 이벤트 활성 시: 이벤트 유형별 배경 키 시도
      const eventBgKey = `menu_bg_${activeEvent.id}`;
      if (this.textures.exists(eventBgKey)) {
        menuBgKey = eventBgKey;
      }
      // 에셋 미존재 시 기존 menu_bg 유지
    } else {
      // 이벤트 비활성 시: 기본 배경 시도 (menu_bg_default가 있으면 사용)
      if (this.textures.exists('menu_bg_default')) {
        menuBgKey = 'menu_bg_default';
      }
    }
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, menuBgKey).setDepth(-1);

    // Phase 60-15 → Phase 61: panel 'dark' 알파 0.5로 낮춰 배경 이미지가 비치도록 조정
    const darkPanel = NineSliceFactory.panel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'dark');
    darkPanel.setAlpha(0.5);

    // ── Phase 75B: "오늘의 미션" 배너 (y=30~60 영역) ──
    this._createMissionBanner();

    // ── Phase 88: 주간 이벤트 배너 (이벤트 활성 시만 표시) ──
    this._createWeeklyEventBanner();

    // ── Phase 90-C (C-8): 시즌 패스 바로가기 버튼 ──
    this._createSeasonPassShortcut();

    // ── Phase 82: 리소스 HUD (배너 하단 y=72 → y=100) ──
    this._createResourceHUD();

    // Phase 61: 타이틀 로고 이미지로 교체 (기존 텍스트 3줄 titleBlock 제거)
    // Phase 62: 후광 번짐 완화를 위해 최대 폭 320 → 296 (0.925배 축소)
    // Phase 75B: y=220 → y=280 (+60px 하향)
    const titleLogo = this.add.image(GAME_WIDTH / 2, 280, 'menu_title_logo').setOrigin(0.5);
    const LOGO_MAX_W = 296;
    if (titleLogo.width > LOGO_MAX_W) {
      titleLogo.setDisplaySize(LOGO_MAX_W, titleLogo.height * (LOGO_MAX_W / titleLogo.width));
    } else {
      titleLogo.setScale(0.925);
    }

    // 부제목 (Phase 75B: y=320 → y=380)
    this.add.text(GAME_WIDTH / 2, 380, '\uC8FC\uBC29\uC744 \uC9C0\uCF1C\uB77C!', {
      fontSize: '18px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // Phase 60-15: 게임 시작 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    // Phase 75B: y=390 → y=450 (start button은 위치 유지)
    const BTN_START_W = 200;
    const BTN_START_H = 60;
    const btn = NineSliceFactory.raw(this, GAME_WIDTH / 2, 450, BTN_START_W, BTN_START_H, 'btn_primary_normal');
    btn.setTint(0xff6b35);
    const btnHit = new Phaser.Geom.Rectangle(-BTN_START_W / 2, -BTN_START_H / 2, BTN_START_W, BTN_START_H);
    btn.setInteractive(btnHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 450, '\u25B6 \uAC8C\uC784 \uC2DC\uC791', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldMapScene');
      });
    });

    // Phase 60-15: setFillStyle → setTexture + setTint
    btn.on('pointerover', () => { btn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); btn.setTint(0xff8c00); });
    btn.on('pointerout', () => { btn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); btn.setTint(0xff6b35); });

    // 펄싱 애니메이션
    this.tweens.add({
      targets: btn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // Phase 60-15: 상점 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    // Phase 75B: y=450 → y=510 / BugFix: y=510 → y=508 (하단 overflow 방지 cascade)
    const SHOP_W = 160;
    const SHOP_H = 40;
    const shopBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2, 508, SHOP_W, SHOP_H, 'btn_primary_normal');
    shopBtn.setTint(0x886600);
    const shopHit = new Phaser.Geom.Rectangle(-SHOP_W / 2, -SHOP_H / 2, SHOP_W, SHOP_H);
    shopBtn.setInteractive(shopHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 508, '\uD83E\uDE99 \uC8FC\uBC29 \uC0C1\uC810', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    shopBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ShopScene');
      });
    });
    // Phase 60-15: setFillStyle → setTexture + setTint
    shopBtn.on('pointerover', () => { shopBtn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); shopBtn.setTint(0xaa8800); });
    shopBtn.on('pointerout', () => { shopBtn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); shopBtn.setTint(0x886600); });

    // Phase 60-15: 도감 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    // Phase 75B: y=496 → y=556 / BugFix: y=556 → y=546
    const BOOK_W = 160;
    const BOOK_H = 36;
    const bookBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2, 546, BOOK_W, BOOK_H, 'btn_primary_normal');
    bookBtn.setTint(0x886600);
    const bookHit = new Phaser.Geom.Rectangle(-BOOK_W / 2, -BOOK_H / 2, BOOK_W, BOOK_H);
    bookBtn.setInteractive(bookHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 546, '\uD83D\uDCD6 \uB808\uC2DC\uD53C \uB3C4\uAC10', {
      fontSize: '14px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    bookBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('RecipeCollectionScene');
      });
    });
    // Phase 60-15: setFillStyle → setTexture + setTint
    bookBtn.on('pointerover', () => { bookBtn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); bookBtn.setTint(0xaa8800); });
    bookBtn.on('pointerout', () => { bookBtn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); bookBtn.setTint(0x886600); });

    // Phase 60-15: 업적 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    // Phase 75B: y=534 → y=594 / BugFix: y=594 → y=582 / Bugfix2: y=582 → y=568 (bottomInfo 공간 확보)
    // Phase 76-1: y=568 → y=582 (레시피 도감 버튼 하단 edge=564 기준, NineSlice 14px 겹침 → 0px, BUG-M2 수정)
    const ACHIEVE_W = 160;
    const ACHIEVE_H = 36;
    const achieveBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2, 582, ACHIEVE_W, ACHIEVE_H, 'btn_primary_normal');
    achieveBtn.setTint(0x886600);
    const achieveHit = new Phaser.Geom.Rectangle(-ACHIEVE_W / 2, -ACHIEVE_H / 2, ACHIEVE_W, ACHIEVE_H);
    achieveBtn.setInteractive(achieveHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 582, '\uD83C\uDFC6 \uC5C5\uC801', {
      fontSize: '14px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    achieveBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AchievementScene');
      });
    });
    // Phase 60-15: setFillStyle → setTexture + setTint
    achieveBtn.on('pointerover', () => { achieveBtn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); achieveBtn.setTint(0xaa8800); });
    achieveBtn.on('pointerout', () => { achieveBtn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); achieveBtn.setTint(0x886600); });

    // ── 엔드리스 모드 버튼 (Phase 11-1, Phase 42: y 550 -> 570 -> 578) ──
    // Phase 63 FIX-16: 잠김 상태 tint 0x444444→0x555555, 라벨 색 #666666→#888888로 대비 +1
    // Phase 75B: y=578 → y=638 / BugFix: y=638 → y=620 / Bugfix2: y=620 → y=606 (bottomInfo 공간 확보)
    const isEndlessUnlocked = SaveManager.isEndlessUnlocked();
    const endlessRecord = SaveManager.getEndlessRecord();

    // Phase 60-15: 엔드리스 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    // Phase 76-1: H=40→36, Y=606→618 (업적 버튼 하단=600 기준, BUG-M2 연쇄 조정)
    const ENDLESS_W = 180;
    const ENDLESS_H = 36;
    const ENDLESS_Y = 618;
    const endlessColor = isEndlessUnlocked ? 0x6622cc : 0x555555;
    const endlessBtn = NineSliceFactory.raw(this, GAME_WIDTH / 2, ENDLESS_Y, ENDLESS_W, ENDLESS_H, 'btn_primary_normal');
    endlessBtn.setTint(endlessColor);
    const endlessHit = new Phaser.Geom.Rectangle(-ENDLESS_W / 2, -ENDLESS_H / 2, ENDLESS_W, ENDLESS_H);
    endlessBtn.setInteractive(endlessHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: isEndlessUnlocked });

    // Phase 69 (P1-4): 잠금 문구를 config 상수로 통일 (WorldMapScene과 일치).
    const endlessLabel = isEndlessUnlocked
      ? '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC'
      : ENDLESS_LOCK_LABEL;
    // Phase 63 FIX-16: 잠김 라벨 #666666 → #888888 (대비 +1)
    const endlessLabelColor = isEndlessUnlocked ? '#cc88ff' : '#888888';

    this.add.text(GAME_WIDTH / 2, ENDLESS_Y, endlessLabel, {
      fontSize: '14px', fontStyle: 'bold', color: endlessLabelColor,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    if (isEndlessUnlocked) {
      endlessBtn.on('pointerdown', () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ChefSelectScene', { stageId: 'endless' });
        });
      });
      // Phase 60-15: setFillStyle → setTexture + setTint
      endlessBtn.on('pointerover', () => { endlessBtn.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); endlessBtn.setTint(0x8833ee); });
      endlessBtn.on('pointerout', () => { endlessBtn.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); endlessBtn.setTint(0x6622cc); });
    }

    // 엔드리스 베스트 기록, 평판+수집률, 버전 표기는 배너 추가로 하단 초과 위험
    // Phase 75B: 엔드리스 기록 y=607→667 (GAME_HEIGHT 초과 위험으로 숨김 처리 — AD3 검수 후 조정)
    // 하단 정보를 한 줄로 압축하여 y=630에 배치
    const { current, max } = SaveManager.getTotalStars();
    const { unlocked, total, percent } = RecipeManager.getCollectionProgress();

    // 엔드리스 베스트 기록 + 평판 + 수집률을 한줄로 통합 (GAME_HEIGHT=640 제한)
    let bottomInfo = `\u2B50 ${current}/${max}  \uD83D\uDCD6 ${unlocked}/${total} (${percent}%)`;
    if (isEndlessUnlocked && endlessRecord.bestWave > 0) {
      bottomInfo = `\u221E W${endlessRecord.bestWave}  ` + bottomInfo;
    }
    this.add.text(GAME_WIDTH / 2, 634, bottomInfo, {
      fontSize: '10px', color: '#888888',
    }).setOrigin(0.5);

    // ── 설정 버튼 (Phase 10-6) ──
    this._createSettingsButton();

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ── Phase 82: 리소스 HUD ─────────────────────────────────────────

  /**
   * 메뉴 상단(배너 하단)에 골드·코인·미력의 정수 보유량 + 에너지를 표시하는 HUD를 생성한다.
   * 미션 배너(y=72 하단)와 타이틀 로고(y~280) 사이에 2행으로 배치한다.
   * Phase 87: 2행에 에너지 표시 + 카운트다운 타이머 추가.
   * @private
   */
  _createResourceHUD() {
    // 주간 이벤트 배너 활성 시 HUD를 아래로 내려 겹침 방지
    // Phase 91: BANNER_Y가 84→96으로 변경되었으므로 HUD_Y도 연동 조정
    // 이벤트 배너(center y=96, H=20) 하단 y=106 + 여백 4 + 텍스트 H/2=6 = 116
    const hasEvent = !!WeeklyEventManager.getActiveEvent();
    const HUD_Y1 = hasEvent ? 116 : 92;  // 1행: 기존 리소스
    const HUD_Y2 = hasEvent ? 132 : 112; // 2행: 에너지 표시

    // 1행: 기존 리소스
    const gold = SaveManager.getGold();
    const coins = SaveManager.getCoins();
    const essence = SaveManager.getMireukEssence();

    const colXs = [GAME_WIDTH / 6, GAME_WIDTH / 2, GAME_WIDTH * 5 / 6];
    const labels = [
      `\uD83D\uDCB0 ${gold.toLocaleString()}`,
      `\uD83E\uDE99 ${coins}`,
      `\u2728 ${essence}`,
    ];
    const colors = ['#ffd700', '#aaddff', '#cc88ff'];

    labels.forEach((text, i) => {
      this.add.text(colXs[i], HUD_Y1, text, {
        fontSize: '12px',
        color: colors[i],
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    });

    // 2행: 에너지 표시
    const energy = EnergyManager.getEnergy();
    const energyStr = `\u26A1 ${energy}/${ENERGY_MAX}`;
    this._energyHudText = this.add.text(GAME_WIDTH / 2 - 60, HUD_Y2, energyStr, {
      fontSize: '12px',
      color: '#ffdd55',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // 에너지 미만 시 카운트다운 타이머 표시
    if (energy < ENERGY_MAX) {
      this._energyCountdownText = this.add.text(GAME_WIDTH / 2 + 30, HUD_Y2, '', {
        fontSize: '11px',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0, 0.5);

      // 초기 카운트다운 표시
      const initSecs = EnergyManager.getRechargeCountdown();
      if (initSecs > 0) {
        const mm = String(Math.floor(initSecs / 60)).padStart(2, '0');
        const ss = String(initSecs % 60).padStart(2, '0');
        this._energyCountdownText.setText(`\uCDA9\uC804\uAE4C\uC9C0 ${mm}:${ss}`);
      }

      // 1초 주기 갱신 타이머
      this._energyCountdownEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          // 자동 충전 적용 후 에너지 상태 갱신
          EnergyManager.applyAutoRecharge();
          const curEnergy = EnergyManager.getEnergy();
          if (this._energyHudText && this._energyHudText.active) {
            this._energyHudText.setText(`\u26A1 ${curEnergy}/${ENERGY_MAX}`);
          }
          const secs = EnergyManager.getRechargeCountdown();
          if (secs <= 0) {
            if (this._energyCountdownText && this._energyCountdownText.active) {
              this._energyCountdownText.setText('');
            }
            if (this._energyCountdownEvent) {
              this._energyCountdownEvent.remove();
              this._energyCountdownEvent = null;
            }
          } else {
            const mm = String(Math.floor(secs / 60)).padStart(2, '0');
            const ss = String(secs % 60).padStart(2, '0');
            if (this._energyCountdownText && this._energyCountdownText.active) {
              this._energyCountdownText.setText(`\uCDA9\uC804\uAE4C\uC9C0 ${mm}:${ss}`);
            }
          }
        },
      });
    }
  }

  // ── Phase 75B: 오늘의 미션 배너 ──────────────────────────────────

  /**
   * 메뉴 상단에 "오늘의 미션" 배너를 생성한다.
   * NineSlice 패널에 미션 달성 상태를 표시하며, 탭 시 통합 팝업을 연다.
   * @private
   */
  _createMissionBanner() {
    const BANNER_W = GAME_WIDTH - 20;
    const BANNER_H = 44;
    const BANNER_Y = 50;

    const bannerBg = NineSliceFactory.raw(this, GAME_WIDTH / 2, BANNER_Y, BANNER_W, BANNER_H, 'btn_primary_normal');
    bannerBg.setTint(0xcc6600);

    // 미션 달성 상태 표시
    const missions = DailyMissionManager.getTodayMissions();
    const starStr = missions.map((m) => m.completed ? '\u2605' : '\u2606').join('');
    const bannerText = `\uD83D\uDCCB \uC624\uB298\uC758 \uBBF8\uC158  ${starStr}`;

    this.add.text(GAME_WIDTH / 2, BANNER_Y, bannerText, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // 상호작용
    const bannerHit = new Phaser.Geom.Rectangle(-BANNER_W / 2, -BANNER_H / 2, BANNER_W, BANNER_H);
    bannerBg.setInteractive(bannerHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    bannerBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._openDailyMissionModal();
    });
    bannerBg.on('pointerover', () => bannerBg.setTint(0xdd7700));
    bannerBg.on('pointerout', () => bannerBg.setTint(0xcc6600));
  }

  // ── Phase 88: 주간 이벤트 배너 ─────────────────────────────────

  /**
   * 현재 활성 주간 이벤트 배너를 메뉴 상단에 표시한다.
   * 이벤트가 없는 날은 아무것도 생성하지 않는다.
   * @private
   */
  _createWeeklyEventBanner() {
    const event = WeeklyEventManager.getActiveEvent();
    if (!event) return; // 이벤트 없는 날 — 미표시

    const BANNER_W = GAME_WIDTH - 20;
    const BANNER_H = 20;
    // 미션 배너(center y=50, H=44) 하단 y=72 + 여백 2 + 배너 H/2=10 = center y=84
    // Phase 91: BANNER_Y 84 → 96 — 이벤트 배너와 시즌 패스 숏컷 겹침 해소
    const BANNER_Y = 96;

    const bg = NineSliceFactory.raw(this, GAME_WIDTH / 2, BANNER_Y, BANNER_W, BANNER_H, 'btn_primary_normal');
    bg.setTint(0x228844);

    // Phase 91 재수정: 시즌 패스 숏컷(우측 X≈262~342)과 겹침 방지 — 텍스트 폭 160px 제한
    this.add.text(GAME_WIDTH / 2, BANNER_Y, `${event.nameKo} -- ${event.descKo}`, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      maxLines: 1,
      wordWrap: { width: 160 },
    }).setOrigin(0.5);
  }

  // ── Phase 90-C (C-8): 시즌 패스 바로가기 ──────────────────────────

  /**
   * 미션 배너 우측 하단에 "시즌 패스" 바로가기 텍스트 버튼을 생성한다.
   * 탭 시 미션 모달을 시즌 패스 탭으로 직접 연다.
   * @private
   */
  _createSeasonPassShortcut() {
    // 미션 배너(center y=50, H=44)의 우측 하단 근처에 작은 텍스트 버튼 배치
    const SP_X = GAME_WIDTH - 18;
    const SP_Y = 73;  // 미션 배너 하단(y=72) + 1px

    const spText = this.add.text(SP_X, SP_Y, '\uD83C\uDFC6 \uC2DC\uC98C \uD328\uC2A4 >', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffcc88',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    spText.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._openDailyMissionModal('season_pass');
    });
    spText.on('pointerover', () => spText.setColor('#ffee44'));
    spText.on('pointerout', () => spText.setColor('#ffcc88'));
  }

  // ── Phase 75B: 미션/캘린더 통합 팝업 ──────────────────────────────

  /**
   * 미션/캘린더/시즌 패스 통합 팝업 모달을 연다.
   * 탭 전환으로 "오늘의 미션" / "로그인 보너스" / "시즌 패스" 뷰를 전환한다.
   * Phase 90-C (C-8): defaultTab 파라미터 추가 — 'mission' | 'calendar' | 'season_pass'
   * @param {string} [defaultTab='mission'] - 기본 활성 탭
   * @private
   */
  _openDailyMissionModal(defaultTab = 'mission') {
    if (this._missionModalContainer) return;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    // Phase 91: MODAL_W 300 → 320 — "시즌 패스" 탭 레이블 잘림 해소
    const MODAL_W = 320;
    const MODAL_H = 440;

    const container = this.add.container(0, 0).setDepth(1100);
    this._missionModalContainer = container;

    // 반투명 오버레이
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive();
    container.add(overlay);

    // 패널 배경
    const panelBg = NineSliceFactory.panel(this, cx, cy, MODAL_W, MODAL_H, 'dark');
    container.add(panelBg);

    // 닫기 버튼
    const closeBtn = this.add.text(cx + MODAL_W / 2 - 18, cy - MODAL_H / 2 + 14, '\u2715', {
      fontSize: '16px', fontStyle: 'bold', color: '#ff6666',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._closeMissionModal();
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff0000'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    container.add(closeBtn);

    // 오버레이 클릭으로 닫기 (모달 영역 외부)
    overlay.on('pointerdown', (pointer) => {
      const mx = cx - MODAL_W / 2;
      const my = cy - MODAL_H / 2;
      if (pointer.x >= mx && pointer.x <= mx + MODAL_W &&
          pointer.y >= my && pointer.y <= my + MODAL_H) return;
      SoundManager.playSFX('sfx_ui_tap');
      this._closeMissionModal();
    });

    // ── 탭 버튼 (Phase 89: 2탭 → 3탭 확장) ──
    const TAB_Y = cy - MODAL_H / 2 + 40;
    const TAB_W = 90;
    const TAB_H = 28;

    // 컨텐츠 컨테이너 (탭 전환용)
    this._missionTabContent = this.add.container(0, 0);
    container.add(this._missionTabContent);

    // Phase 91: 탭 cx 오프셋 100 → 106 — 모달 확장에 따른 탭 배치 조정
    // 미션 탭
    const missionTabBg = NineSliceFactory.raw(this, cx - 106, TAB_Y, TAB_W, TAB_H, 'tab_active');
    const missionTabText = this.add.text(cx - 106, TAB_Y, '\uBBF8\uC158', {
      fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5);
    container.add(missionTabBg);
    container.add(missionTabText);

    // 캘린더 탭
    const calendarTabBg = NineSliceFactory.raw(this, cx, TAB_Y, TAB_W, TAB_H, 'tab_inactive');
    const calendarTabText = this.add.text(cx, TAB_Y, '\uB85C\uADF8\uC778', {
      fontSize: '11px', fontStyle: 'bold', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5);
    container.add(calendarTabBg);
    container.add(calendarTabText);

    // 시즌 패스 탭 (Phase 89)
    const seasonTabBg = NineSliceFactory.raw(this, cx + 106, TAB_Y, TAB_W, TAB_H, 'tab_inactive');
    const seasonTabText = this.add.text(cx + 106, TAB_Y, '\uC2DC\uC98C \uD328\uC2A4', {
      fontSize: '11px', fontStyle: 'bold', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5);
    container.add(seasonTabBg);
    container.add(seasonTabText);

    // Phase 92-D: 탭 하단 구분선 (골드 톤, 충분한 대비)
    const tabDivider = this.add.rectangle(cx, TAB_Y + TAB_H / 2 + 6, MODAL_W - 24, 3, 0xffcc44, 0.6);
    container.add(tabDivider);

    // 탭 상호작용
    const missionTabHit = new Phaser.Geom.Rectangle(-TAB_W / 2, -TAB_H / 2, TAB_W, TAB_H);
    missionTabBg.setInteractive(missionTabHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    const calendarTabHit = new Phaser.Geom.Rectangle(-TAB_W / 2, -TAB_H / 2, TAB_W, TAB_H);
    calendarTabBg.setInteractive(calendarTabHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    const seasonTabHit = new Phaser.Geom.Rectangle(-TAB_W / 2, -TAB_H / 2, TAB_W, TAB_H);
    seasonTabBg.setInteractive(seasonTabHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });

    // 탭 활성/비활성 토글 헬퍼
    const deactivateAllTabs = () => {
      missionTabBg.setTexture('ui_ns_tab_inactive');
      missionTabText.setColor('#aaaaaa');
      calendarTabBg.setTexture('ui_ns_tab_inactive');
      calendarTabText.setColor('#aaaaaa');
      seasonTabBg.setTexture('ui_ns_tab_inactive');
      seasonTabText.setColor('#aaaaaa');
    };

    const showMissionTab = () => {
      deactivateAllTabs();
      missionTabBg.setTexture('ui_ns_tab_active');
      missionTabText.setColor('#ffffff');
      this._renderMissionTabContent(cx, cy, MODAL_W, MODAL_H);
    };

    const showCalendarTab = () => {
      deactivateAllTabs();
      calendarTabBg.setTexture('ui_ns_tab_active');
      calendarTabText.setColor('#ffffff');
      this._renderCalendarTabContent(cx, cy, MODAL_W, MODAL_H);
    };

    const showSeasonTab = () => {
      deactivateAllTabs();
      seasonTabBg.setTexture('ui_ns_tab_active');
      seasonTabText.setColor('#ffffff');
      this._renderSeasonPassTabContent(cx, cy, MODAL_W, MODAL_H);
    };

    missionTabBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      showMissionTab();
    });
    calendarTabBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      showCalendarTab();
    });
    seasonTabBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      showSeasonTab();
    });

    // Phase 90-C (C-8): defaultTab 파라미터에 따라 초기 탭 결정
    if (defaultTab === 'season_pass') {
      showSeasonTab();
    } else if (defaultTab === 'calendar') {
      showCalendarTab();
    } else {
      showMissionTab();
    }
  }

  /**
   * 미션 탭 컨텐츠를 렌더링한다.
   * @param {number} cx - 모달 중심 X
   * @param {number} cy - 모달 중심 Y
   * @param {number} modalW - 모달 너비
   * @param {number} modalH - 모달 높이
   * @private
   */
  _renderMissionTabContent(cx, cy, modalW, modalH) {
    this._cleanupSeasonPassScroll();
    if (!this._missionTabContent) return;
    this._missionTabContent.removeAll(true);

    const missions = DailyMissionManager.getTodayMissions();
    const startY = cy - modalH / 2 + 75;

    // 미션 아이콘 텍스처 매핑
    const ICON_MAP = {
      stage_clear: 'mission_icon_clear_stage',
      gold_earn: 'mission_icon_gold',
      orders_complete: 'mission_icon_serve',
      perfect_satisfaction: 'mission_icon_satisfaction',
      endless_wave: 'mission_icon_endless',
      gather_run: 'mission_icon_recipe',
      three_star: 'mission_icon_three_star',
      // Phase 86 — 신규 미션 타입
      vip_serve: 'mission_icon_vip_serve',
      combo_reach: 'mission_icon_combo',
      gold_single_run: 'mission_icon_gold_run',
    };

    if (missions.length === 0) {
      const noMission = this.add.text(cx, startY + 60, '\uBBF8\uC158\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.\n\uB0B4\uC77C \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694!', {
        fontSize: '14px', color: '#888888', align: 'center',
      }).setOrigin(0.5);
      this._missionTabContent.add(noMission);
      return;
    }

    for (let i = 0; i < missions.length; i++) {
      const m = missions[i];
      const rowY = startY + i * 100;

      // 카드 배경
      const cardBg = NineSliceFactory.panel(this, cx, rowY + 30, modalW - 30, 85, 'dark');
      cardBg.setAlpha(0.6);
      this._missionTabContent.add(cardBg);

      // 아이콘
      const iconKey = ICON_MAP[m.type] || 'mission_icon_clear_stage';
      const icon = this.add.image(cx - modalW / 2 + 40, rowY + 20, iconKey).setOrigin(0.5);
      icon.setDisplaySize(28, 28);
      this._missionTabContent.add(icon);

      // 미션 설명
      const desc = this.add.text(cx - modalW / 2 + 65, rowY + 10, m.descKo, {
        fontSize: '13px', fontStyle: 'bold', color: m.completed ? '#88ff88' : '#ffffff',
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0, 0.5);
      this._missionTabContent.add(desc);

      // 보상 텍스트
      const rewardLabel = this._getRewardLabel(m.reward);
      const rewardText = this.add.text(cx - modalW / 2 + 65, rowY + 28, `\uBCF4\uC0C1: ${rewardLabel}`, {
        fontSize: '11px', color: '#ffcc44',
      }).setOrigin(0, 0.5);
      this._missionTabContent.add(rewardText);

      // 진행 바 (텍스트 형식)
      const progressVal = Math.min(m.progress, m.target);
      const progressStr = m.completed
        ? '\u2714 \uC644\uB8CC!'
        : `${progressVal} / ${m.target}`;
      const progressColor = m.completed ? '#88ff88' : '#cccccc';
      const progressText = this.add.text(cx - modalW / 2 + 65, rowY + 46, progressStr, {
        fontSize: '12px', color: progressColor,
      }).setOrigin(0, 0.5);
      this._missionTabContent.add(progressText);

      // 진행 바 그래픽 (F-6 Fix: barH 8→16, 시각적 식별성 개선)
      const barX = cx + 30;
      const barY = rowY + 46;
      const barW = 80;
      const barH = 16;
      const barBgGfx = this.add.rectangle(barX, barY, barW, barH, 0x333333).setOrigin(0, 0.5);
      this._missionTabContent.add(barBgGfx);
      const fillRatio = m.target > 0 ? Math.min(1, progressVal / m.target) : 0;
      if (fillRatio > 0) {
        const fillGfx = this.add.rectangle(barX, barY, barW * fillRatio, barH, m.completed ? 0x88ff88 : 0xffcc44).setOrigin(0, 0.5);
        this._missionTabContent.add(fillGfx);
      }
    }

    // Phase 90-B (B-5): 미션 카드 하단에 안내 문구 추가 (빈 공간 개선)
    const infoY = startY + missions.length * 100 + 20;
    const infoText = this.add.text(cx, infoY, `\uC624\uB298\uC758 \uBBF8\uC158\uC740 ${missions.length}\uAC1C\uC785\uB2C8\uB2E4.`, {
      fontSize: '12px', color: '#666666', align: 'center',
    }).setOrigin(0.5);
    this._missionTabContent.add(infoText);

    // 완료된 미션 개수 표시
    const completedCount = missions.filter(m => m.completed).length;
    if (completedCount > 0) {
      const completeInfo = this.add.text(cx, infoY + 18, `\u2714 ${completedCount}\uAC1C \uC644\uB8CC`, {
        fontSize: '11px', color: '#88ff88',
      }).setOrigin(0.5);
      this._missionTabContent.add(completeInfo);
    }
  }

  /**
   * 캘린더 탭 컨텐츠를 렌더링한다.
   * @param {number} cx - 모달 중심 X
   * @param {number} cy - 모달 중심 Y
   * @param {number} modalW - 모달 너비
   * @param {number} modalH - 모달 높이
   * @private
   */
  _renderCalendarTabContent(cx, cy, modalW, modalH) {
    this._cleanupSeasonPassScroll();
    if (!this._missionTabContent) return;
    this._missionTabContent.removeAll(true);

    const state = LoginBonusManager.getLoginBonusState();
    const startY = cy - modalH / 2 + 78;

    // 타이틀
    const title = this.add.text(cx, startY, `\uC5F0\uC18D \uB85C\uADF8\uC778: ${state.loginStreak}\uC77C\uCC28`, {
      fontSize: '15px', fontStyle: 'bold', color: '#ffdd88',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this._missionTabContent.add(title);

    // ── Phase 75B 핫픽스: 7일 세로 카드 리스트 (대안 B) ──
    const CARD_W = 264;
    const CARD_H = 38;
    const CARD_GAP = 4;
    const cardX = cx;
    const listStartY = startY + 22;

    for (let i = 0; i < LOGIN_REWARDS.length; i++) {
      const r = LOGIN_REWARDS[i];
      const day = r.day;
      const cardY = listStartY + i * (CARD_H + CARD_GAP) + CARD_H / 2;
      const isClaimed = state.claimedDays.includes(day);
      const isToday = (state.loginStreak === day) ||
                      (state.loginStreak === 0 && day === 1 && state.lastLoginDate !== DailyMissionManager._getDateKey());
      this._renderCalendarCard(cardX, cardY, CARD_W, CARD_H, day, r, { isClaimed, isToday });
    }
  }

  /**
   * 캘린더 카드 1행을 렌더링한다 (Phase 75B 핫픽스 — 대안 B).
   * 좌측 배지(Dn + 상태 아이콘) | 중앙 보상명 | 우측 보상 아이콘 + 수량
   * @param {number} cx - 카드 중심 X
   * @param {number} cy - 카드 중심 Y
   * @param {number} w - 카드 너비
   * @param {number} h - 카드 높이
   * @param {number} day - 날짜 1~7
   * @param {object} reward - LOGIN_REWARDS 항목
   * @param {{isClaimed: boolean, isToday: boolean}} status
   * @private
   */
  _renderCalendarCard(cx, cy, w, h, day, reward, status) {
    const { isClaimed, isToday } = status;
    const isSpecial = day === 7;

    // 카드 배경 (NineSlice panel dark + tint)
    let bgTint;
    if (isClaimed) bgTint = 0x2a4a2a;
    else if (isToday) bgTint = 0xcc7700;
    else if (isSpecial) bgTint = 0x3a1a55;
    else bgTint = 0x1a1a22;

    const bg = NineSliceFactory.panel(this, cx, cy, w, h, 'dark');
    bg.setTint(bgTint);
    bg.setAlpha(isToday ? 0.95 : 0.78);
    this._missionTabContent.add(bg);

    // 좌측 배지 (Dn 라벨 영역)
    const badgeX = cx - w / 2 + 26;
    const badgeBg = this.add.rectangle(badgeX, cy, 38, h - 8, isToday ? 0xffcc44 : isClaimed ? 0x4a8a4a : 0x444455, 1)
      .setStrokeStyle(1, 0x000000, 0.5);
    this._missionTabContent.add(badgeBg);

    const dayLabel = this.add.text(badgeX, cy - 6, `D${day}`, {
      fontSize: '13px', fontStyle: 'bold',
      color: isToday ? '#3a1a00' : isClaimed ? '#ffffff' : '#aaaaaa',
    }).setOrigin(0.5);
    this._missionTabContent.add(dayLabel);

    // 상태 마커 (체크/잠금/오늘)
    const marker = this.add.text(badgeX, cy + 8, isClaimed ? '\u2714' : isToday ? '\u25C6' : '\uD83D\uDD12', {
      fontSize: '9px',
      color: isToday ? '#3a1a00' : isClaimed ? '#88ff88' : '#888888',
    }).setOrigin(0.5);
    this._missionTabContent.add(marker);

    // 중앙 보상명
    const titleColor = isClaimed ? '#aaffaa' : isToday ? '#ffffff' : isSpecial ? '#d8b4ff' : '#ddddcc';
    const nameText = this.add.text(cx - w / 2 + 56, cy - 6, reward.descKo, {
      fontSize: '12px', fontStyle: 'bold', color: titleColor,
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0, 0.5);
    this._missionTabContent.add(nameText);

    // 보조 라벨 (상태)
    const subColor = isClaimed ? '#88dd88' : isToday ? '#ffeecc' : isSpecial ? '#bb88ee' : '#888888';
    const subLabel = isClaimed ? '\uC218\uB839 \uC644\uB8CC' : isToday ? '\uC624\uB298 \uC218\uB839!' : isSpecial ? '\u2605 \uC2A4\uD398\uC15C' : '\uC7A0\uAE40';
    const subText = this.add.text(cx - w / 2 + 56, cy + 9, subLabel, {
      fontSize: '10px', color: subColor,
    }).setOrigin(0, 0.5);
    this._missionTabContent.add(subText);

    // 우측 보상 아이콘 + 수량
    const iconKey = this._getRewardIconKey(reward.type);
    const iconX = cx + w / 2 - 50;
    if (iconKey && this.textures.exists(iconKey)) {
      const icon = this.add.image(iconX, cy, iconKey).setOrigin(0.5);
      icon.setDisplaySize(20, 20);
      this._missionTabContent.add(icon);
    }

    const amountText = this.add.text(cx + w / 2 - 14, cy, `\u00D7${reward.amount}`, {
      fontSize: '13px', fontStyle: 'bold',
      color: isClaimed ? '#88ff88' : isToday ? '#ffeecc' : '#ffcc44',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0.5);
    this._missionTabContent.add(amountText);
  }

  /**
   * 보상 타입별 아이콘 텍스처 키를 반환한다.
   * @param {string} type
   * @returns {string|null}
   * @private
   */
  _getRewardIconKey(type) {
    switch (type) {
      case 'gold': return 'mission_icon_gold';
      case 'kitchenCoins': return 'icon_reward_kitchencoin';
      case 'mireukEssence': return 'icon_reward_mireuk';
      case 'mimiSkinCoupons': return 'icon_reward_coupon';
      default: return null;
    }
  }

  /**
   * 캘린더 슬롯 하나를 렌더링한다.
   * @param {number} x - 슬롯 중심 X
   * @param {number} y - 슬롯 중심 Y
   * @param {number} day - 날짜 번호 (1~7)
   * @param {object} state - 로그인 보너스 상태
   * @param {number} size - 슬롯 크기
   * @private
   */
  _renderCalendarSlot(x, y, day, state, size) {
    const isClaimed = state.claimedDays.includes(day);
    const isToday = (state.loginStreak === day) ||
                    (state.loginStreak === 0 && day === 1 && state.lastLoginDate !== DailyMissionManager._getDateKey());

    let textureKey;
    if (isClaimed) {
      textureKey = 'calendar_slot_claimed';
    } else if (isToday) {
      textureKey = 'calendar_slot_today';
    } else {
      textureKey = 'calendar_slot_locked';
    }

    const slotImg = this.add.image(x, y, textureKey).setOrigin(0.5);
    slotImg.setDisplaySize(size, size);
    this._missionTabContent.add(slotImg);

    // 날짜 번호
    const dayLabel = this.add.text(x, y + size / 2 + 8, `D${day}`, {
      fontSize: '10px', color: isClaimed ? '#88ff88' : '#cccccc',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5);
    this._missionTabContent.add(dayLabel);
  }

  // ── Phase 89: 시즌 패스 탭 콘텐츠 ──────────────────────────────

  /**
   * 시즌 패스 탭 콘텐츠를 렌더링한다.
   * 현재 단계, XP 진행 바, 보상 목록(현재 단계 +-5 범위), 유료 패스 구매 버튼을 표시한다.
   * @param {number} cx - 모달 중심 X
   * @param {number} cy - 모달 중심 Y
   * @param {number} modalW - 모달 너비
   * @param {number} modalH - 모달 높이
   * @private
   */
  _renderSeasonPassTabContent(cx, cy, modalW, modalH) {
    // Phase 92-D: 탭 전환 시 이전 스크롤 핸들러 정리
    this._cleanupSeasonPassScroll();
    if (!this._missionTabContent) return;
    this._missionTabContent.removeAll(true);

    const state = SeasonManager.getState();
    // Phase 90-A (A-3): state 필드 undefined 방어 — 구 세이브 또는 마이그레이션 타이밍 이슈 대비
    const seasonId = state.seasonId ?? 'S1';
    const currentTier = state.currentTier ?? 0;
    const currentXP = state.currentXP ?? 0;
    const hasPaidPass = state.hasPaidPass ?? false;
    const claimedFree = Array.isArray(state.claimedFree) ? state.claimedFree : [];
    const claimedPaid = Array.isArray(state.claimedPaid) ? state.claimedPaid : [];
    const { currentInTier, tierXP } = SeasonManager.getProgressInTier();
    const startY = cy - modalH / 2 + 70;

    // 시즌 타이틀
    const titleText = this.add.text(cx, startY, `\uC2DC\uC98C \uD328\uC2A4 ${seasonId}`, {
      fontSize: '15px', fontStyle: 'bold', color: '#ffdd88',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this._missionTabContent.add(titleText);

    // 단계 표시
    const tierLabel = this.add.text(cx, startY + 20, `\uB2E8\uACC4 ${currentTier} / 50`, {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5);
    this._missionTabContent.add(tierLabel);

    // XP 진행 바
    const barX = cx - 100;
    const barY = startY + 40;
    const barW = 200;
    const barH = 14;

    // 바 배경
    const barBg = this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x333333).setOrigin(0.5);
    barBg.setStrokeStyle(1, 0x555555);
    this._missionTabContent.add(barBg);

    // 바 채우기
    if (currentTier < 50 && tierXP > 0) {
      const ratio = Math.min(1, currentInTier / tierXP);
      if (ratio > 0) {
        const fillW = barW * ratio;
        const fillGfx = this.add.rectangle(barX + barW / 2 - (barW - fillW) / 2, barY, fillW, barH - 2, 0xffcc44).setOrigin(0.5);
        this._missionTabContent.add(fillGfx);
      }
    } else if (currentTier >= 50) {
      const fillGfx = this.add.rectangle(barX + barW / 2, barY, barW, barH - 2, 0x88ff88).setOrigin(0.5);
      this._missionTabContent.add(fillGfx);
    }

    // XP 텍스트
    const xpText = currentTier >= 50
      ? 'MAX'
      : `${currentInTier} / ${tierXP} XP`;
    const xpLabel = this.add.text(cx, barY, xpText, {
      fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this._missionTabContent.add(xpLabel);

    // 유료 패스 구매 버튼 (미보유 시만)
    let buyBtnH = 0;
    if (!hasPaidPass) {
      const btnY = startY + 65;
      buyBtnH = 28;
      const buyBg = NineSliceFactory.raw(this, cx, btnY, 160, buyBtnH, 'btn_primary_normal');
      buyBg.setTint(0xcc6600);
      const buyHit = new Phaser.Geom.Rectangle(-80, -buyBtnH / 2, 160, buyBtnH);
      buyBg.setInteractive(buyHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      this._missionTabContent.add(buyBg);

      const buyText = this.add.text(cx, btnY, '\uC720\uB8CC \uD328\uC2A4 \uAD6C\uB9E4', {
        fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5);
      this._missionTabContent.add(buyText);

      buyBg.on('pointerdown', async () => {
        SoundManager.playSFX('sfx_ui_tap');
        await IAPManager.purchaseSeasonPass();
        this._renderSeasonPassTabContent(cx, cy, modalW, modalH);
      });
    }

    // ── Phase 92-D: 스크롤 가능한 보상 목록 ──
    const ROW_H = 30;
    const modalBottom = cy + modalH / 2;
    const GUIDE_H = 20;                                    // 하단 안내 문구 예약 높이
    const listStartY = startY + (buyBtnH > 0 ? 92 : 72);  // 고정 헤더 아래 시작
    const viewportH = modalBottom - listStartY - GUIDE_H;  // 클립 뷰포트 높이

    // 표시할 티어 전체 범위 (1~50, 현재 단계 기준 앞뒤 범위)
    const minTier = Math.max(1, currentTier - 3);
    const maxTier = Math.min(50, minTier + 10);
    const visibleTiers = [];
    for (let t = minTier; t <= maxTier; t++) visibleTiers.push(t);
    const totalListH = visibleTiers.length * ROW_H;

    // 스크롤 컨테이너 (씬 좌표 기준, x=0 이므로 cx 그대로 사용)
    const listCont = this.add.container(0, listStartY);
    this._missionTabContent.add(listCont);
    this._spListCont = listCont;

    // 클립 마스크 — listStartY ~ listStartY+viewportH 씬 좌표 직사각형
    this._spClipShape = this.make.graphics({ add: false });
    this._spClipShape.fillRect(
      cx - (modalW - 20) / 2,
      listStartY,
      modalW - 20,
      viewportH
    );
    listCont.setMask(new Phaser.Display.Masks.GeometryMask(this, this._spClipShape));

    // 행 렌더링 (컨테이너-로컬 Y 좌표: 행 중앙 = i * ROW_H + ROW_H/2)
    for (let i = 0; i < visibleTiers.length; i++) {
      const tier = visibleTiers[i];
      const relY = i * ROW_H + ROW_H / 2; // 행 중앙 기준

      const rewardDef = SeasonManager.getRewardDef(tier);
      if (!rewardDef) continue;

      const reached = currentTier >= tier;
      const freeClaimed = claimedFree.includes(tier);
      const paidClaimed = claimedPaid.includes(tier);

      // 행 배경
      const rowTint = reached ? (tier === currentTier ? 0x443300 : 0x2a2a2a) : 0x1a1a22;
      const rowBg = this.add.rectangle(cx, relY, modalW - 30, ROW_H - 2, rowTint, 0.7);
      rowBg.setStrokeStyle(tier === currentTier ? 1 : 0, 0xffcc44, 0.5);
      listCont.add(rowBg);

      // 단계 번호
      const tierColor = reached ? '#ffcc44' : '#666666';
      const tierNum = this.add.text(cx - modalW / 2 + 28, relY, `${tier}`, {
        fontSize: '11px', fontStyle: 'bold', color: tierColor,
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5);
      listCont.add(tierNum);

      // 무료 보상 라벨
      const freeLabel = this._getSeasonRewardShort(rewardDef.free);
      const freeColor = freeClaimed ? '#88ff88' : reached ? '#ffffff' : '#888888';
      const freeText = this.add.text(cx - 50, relY, freeLabel, {
        fontSize: '10px', color: freeColor,
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5);
      listCont.add(freeText);

      // 유료 보상 라벨
      const paidLabel = this._getSeasonRewardShort(rewardDef.paid);
      const paidColor = !hasPaidPass ? '#555555' : paidClaimed ? '#88ff88' : reached ? '#ffaa44' : '#555555';
      const paidText = this.add.text(cx + 50, relY, paidLabel, {
        fontSize: '10px', color: paidColor,
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5);
      listCont.add(paidText);

      // 수령 버튼 (무료)
      if (reached && !freeClaimed) {
        const claimFreeBtn = this.add.text(cx + modalW / 2 - 40, relY - 8, '\uC218\uB839', {
          fontSize: '9px', fontStyle: 'bold', color: '#88ff88',
          backgroundColor: '#225522', padding: { x: 4, y: 2 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        listCont.add(claimFreeBtn);

        claimFreeBtn.on('pointerdown', () => {
          SoundManager.playSFX('sfx_ui_tap');
          SeasonManager.claimReward(tier, 'free');
          this._renderSeasonPassTabContent(cx, cy, modalW, modalH);
        });
      }

      // 수령 버튼 (유료)
      if (reached && !paidClaimed && hasPaidPass) {
        const claimPaidBtn = this.add.text(cx + modalW / 2 - 40, relY + 8, '\uC218\uB839', {
          fontSize: '9px', fontStyle: 'bold', color: '#ffaa44',
          backgroundColor: '#553300', padding: { x: 4, y: 2 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        listCont.add(claimPaidBtn);

        claimPaidBtn.on('pointerdown', () => {
          SoundManager.playSFX('sfx_ui_tap');
          SeasonManager.claimReward(tier, 'paid');
          this._renderSeasonPassTabContent(cx, cy, modalW, modalH);
        });
      }
    }

    // 드래그 스크롤 처리
    this._spScrollY = 0;
    const maxScroll = Math.max(0, totalListH - viewportH);

    if (maxScroll > 0) {
      let dragStartY = 0;
      let isDragging = false;

      const onDown = (p) => {
        if (p.y < listStartY || p.y > listStartY + viewportH) return;
        isDragging = true;
        dragStartY = p.y;
      };
      const onMove = (p) => {
        if (!isDragging) return;
        const dy = dragStartY - p.y;
        dragStartY = p.y;
        this._spScrollY = Phaser.Math.Clamp(this._spScrollY + dy, 0, maxScroll);
        listCont.y = listStartY - this._spScrollY;
      };
      const onUp = () => { isDragging = false; };

      this.input.on('pointerdown', onDown);
      this.input.on('pointermove', onMove);
      this.input.on('pointerup', onUp);

      this._spHandlers = [
        { evt: 'pointerdown', fn: onDown },
        { evt: 'pointermove', fn: onMove },
        { evt: 'pointerup', fn: onUp },
      ];
    }

    // 최하단 안내 텍스트 (스크롤 영역 밖 고정)
    const guideY = modalBottom - 10;
    const guideText = this.add.text(cx, guideY, '\uC2A4\uD14C\uC774\uC9C0 \uD074\uB9AC\uC5B4 \u00B7 \uC77C\uC77C \uBBF8\uC158\uC73C\uB85C XP \uD68D\uB4DD', {
      fontSize: '9px', color: '#888888',
    }).setOrigin(0.5);
    this._missionTabContent.add(guideText);
  }

  /**
   * 시즌 보상을 짧은 라벨로 변환한다.
   * @param {{ type: string, amount: number, extra?: object }} reward
   * @returns {string}
   * @private
   */
  _getSeasonRewardShort(reward) {
    const TYPE_LABELS = {
      gold: '\uACE8\uB4DC',
      kitchenCoins: '\uCF54\uC778',
      mireukEssence: '\uC815\uC218',
      mimiSkinCoupon: '\uC2A4\uD0A8\uCFE0\uD3F0',
    };
    const label = TYPE_LABELS[reward.type] || reward.type;
    let str = `${label} ${reward.amount}`;
    if (reward.extra) {
      const extraLabel = TYPE_LABELS[reward.extra.type] || reward.extra.type;
      str += ` +${extraLabel} ${reward.extra.amount}`;
    }
    return str;
  }

  /**
   * 보상 라벨 텍스트를 반환한다.
   * @param {{type: string, amount: number}} reward
   * @returns {string}
   * @private
   */
  _getRewardLabel(reward) {
    switch (reward.type) {
      case 'gold': return `\uACE8\uB4DC +${reward.amount}`;
      case 'kitchenCoins': return `\uC8FC\uBC29 \uCF54\uC778 +${reward.amount}`;
      case 'mireukEssence': return `\uBBF8\uB825\uC758 \uC815\uC218 +${reward.amount}`;
      default: return `${reward.type} +${reward.amount}`;
    }
  }

  /**
   * 미션/캘린더 모달을 닫는다.
   * @private
   */
  /**
   * 시즌 패스 탭의 스크롤 핸들러와 마스크를 정리한다.
   * 탭 전환 또는 모달 닫기 시 호출한다.
   * @private
   */
  _cleanupSeasonPassScroll() {
    if (this._spHandlers) {
      this._spHandlers.forEach(({ evt, fn }) => this.input.off(evt, fn));
      this._spHandlers = null;
    }
    if (this._spClipShape) {
      this._spClipShape.destroy();
      this._spClipShape = null;
    }
    this._spListCont = null;
    this._spScrollY = 0;
  }

  _closeMissionModal() {
    this._cleanupSeasonPassScroll();
    if (this._missionTabContent) {
      this._missionTabContent.removeAll(true);
      this._missionTabContent = null;
    }
    if (this._missionModalContainer) {
      this._missionModalContainer.destroy();
      this._missionModalContainer = null;
    }
  }

  // ── 하드웨어 백버튼 (Phase 12) ──────────────────────────────────

  /**
   * 하드웨어 뒤로가기 핸들러.
   * 설정 패널이나 미션 모달이 열려있으면 닫고, 아니면 앱을 종료한다.
   */
  _onBack() {
    // Phase 75B: 미션 모달이 열려있으면 먼저 닫기
    if (this._missionModalContainer) {
      this._closeMissionModal();
      return;
    }
    // 설정 패널이 열려있으면 닫기, 아니면 아무 동작 없음 (앱 종료 금지)
    if (this._settingsContainer) {
      this._closeSettingsPanel();
    }
  }

  // ── 설정 UI (Phase 10-6) ────────────────────────────────────────

  /**
   * 화면 우상단에 기어 아이콘 설정 버튼을 생성한다.
   * @private
   */
  _createSettingsButton() {
    const gearBtn = this.add.text(330, 30, '\u2699', {
      fontSize: '28px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);

    gearBtn.on('pointerover', () => gearBtn.setColor('#ffffff'));
    gearBtn.on('pointerout', () => gearBtn.setColor('#cccccc'));
    gearBtn.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._openSettingsPanel();
    });
  }

  /**
   * 설정 패널(오버레이)을 생성하여 화면에 표시한다.
   * 모든 요소를 Phaser.GameObjects.Container에 담아 한번에 show/hide 관리.
   * @private
   */
  _openSettingsPanel() {
    // 이미 열려있으면 무시
    if (this._settingsContainer) return;

    const cx = GAME_WIDTH / 2;   // 180
    const cy = GAME_HEIGHT / 2;  // 320

    // 패널 크기/위치 (Phase 54: panelH 268 → Phase 73: panelH 316, 복구 버튼 추가)
    const panelW = 280;
    const panelH = 316;
    const panelX = cx - panelW / 2;  // 40
    const panelY = 170;

    const container = this.add.container(0, 0).setDepth(1000);
    this._settingsContainer = container;

    // ── 반투명 오버레이 배경 ──
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive(); // 하위 클릭 차단
    container.add(overlay);

    // Phase 60-15: 설정 패널 배경 rect → NineSliceFactory.panel 'dark'
    const panelBg = NineSliceFactory.panel(this, cx, panelY + panelH / 2, panelW, panelH, 'dark');
    container.add(panelBg);

    // ── 타이틀 ──
    const title = this.add.text(cx, 190, '\u2699 \uc124\uc815', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(title);

    // ── 닫기 버튼 (패널 우상단) ──
    const closeX = panelX + panelW - 15;
    const closeY = panelY + 15;
    const closeBtn = this.add.text(closeX, closeY, '\u2715', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._closeSettingsPanel();
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff0000'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    container.add(closeBtn);

    // 오버레이 클릭으로도 닫기
    overlay.on('pointerdown', (pointer) => {
      // 패널 영역 내 클릭이면 무시
      if (pointer.x >= panelX && pointer.x <= panelX + panelW &&
          pointer.y >= panelY && pointer.y <= panelY + panelH) return;
      SoundManager.playSFX('sfx_ui_tap');
      this._closeSettingsPanel();
    });

    // ── 현재 설정 로드 ──
    const settings = SoundManager.getSettings();

    // ── BGM 슬라이더 (y=240) ──
    this._createVolumeSlider(container, '\ud83c\udfb5 BGM', 240, settings.bgmVolume,
      (val) => {
        SoundManager.setBGMVolume(val);
        SaveManager.saveSoundSettings({ bgmVolume: val });
      });

    // ── SFX 슬라이더 (y=300) ──
    this._createVolumeSlider(container, '\ud83d\udd0a SFX', 300, settings.sfxVolume,
      (val) => {
        SoundManager.setSFXVolume(val);
        SaveManager.saveSoundSettings({ sfxVolume: val });
      });

    // ── 음소거 토글 (y=360) ──
    this._createMuteToggle(container, 360, settings.muted);

    // ── Phase 73: 세이브 복구 버튼 (y=408) ──
    const RESTORE_BTN_W = 240;
    const RESTORE_BTN_H = 36;
    const restoreBg = NineSliceFactory.raw(this, cx, 408, RESTORE_BTN_W, RESTORE_BTN_H, 'btn_secondary_normal');
    restoreBg.setTint(0x553322);
    const restoreHit = new Phaser.Geom.Rectangle(-RESTORE_BTN_W / 2, -RESTORE_BTN_H / 2, RESTORE_BTN_W, RESTORE_BTN_H);
    restoreBg.setInteractive(restoreHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(restoreBg);

    const restoreLabel = this.add.text(cx, 408, '\u21BA \uC138\uC774\uBE0C \uBCF5\uAD6C', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#cc8855',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(restoreLabel);

    restoreBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._openBackupListModal();
    });
    restoreBg.on('pointerover', () => { restoreBg.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); restoreBg.setTint(0x775533); });
    restoreBg.on('pointerout', () => { restoreBg.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); restoreBg.setTint(0x553322); });

    // Phase 60-15: 쿠폰 버튼 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    // Phase 73: y=408 → y=456 (복구 버튼 추가로 48px 하향 이동)
    const COUPON_BTN_W = 240;
    const COUPON_BTN_H = 36;
    const couponBg = NineSliceFactory.raw(this, cx, 456, COUPON_BTN_W, COUPON_BTN_H, 'btn_secondary_normal');
    couponBg.setTint(0x1a3366);
    const couponHit = new Phaser.Geom.Rectangle(-COUPON_BTN_W / 2, -COUPON_BTN_H / 2, COUPON_BTN_W, COUPON_BTN_H);
    couponBg.setInteractive(couponHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(couponBg);

    const couponLabel = this.add.text(cx, 456, '\uD83C\uDF9F \uCFE0\uD3F0 \uC785\uB825', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#88ccff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(couponLabel);

    couponBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._openCouponModal();
    });
    // Phase 60-15: setFillStyle → setTexture + setTint
    couponBg.on('pointerover', () => { couponBg.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); couponBg.setTint(0x264d99); });
    couponBg.on('pointerout', () => { couponBg.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); couponBg.setTint(0x1a3366); });
  }

  /**
   * 설정 패널을 닫는다 (컨테이너 파괴).
   * Phase 54: 쿠폰 모달이 열려있으면 함께 닫는다.
   * @private
   */
  _closeSettingsPanel() {
    // 쿠폰 모달이 열려있으면 먼저 닫기
    this._closeCouponModal();
    // Phase 73: 백업 관련 모달이 열려있으면 먼저 닫기
    if (this._restoreConfirmContainer) {
      this._restoreConfirmContainer.destroy();
      this._restoreConfirmContainer = null;
    }
    if (this._backupListContainer) {
      this._backupListContainer.destroy();
      this._backupListContainer = null;
    }
    if (this._settingsContainer) {
      this._settingsContainer.destroy();
      this._settingsContainer = null;
    }
    // 드래그 상태 정리
    this._activeDrag = null;
  }

  // ── 세이브 복구 모달 (Phase 73) ──────────────────────────────────

  /**
   * 백업 목록 모달을 생성한다.
   * SaveManager.getBackups()로 슬롯 3개의 상태를 표시한다.
   * @private
   */
  _openBackupListModal() {
    if (this._backupListContainer) return;

    // F-7 Fix: 쿠폰 모달(depth 1100)이 열려있으면 강제 닫기 — z-레이어 출혈 방지
    this._closeCouponModal();

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const modalW = 280;
    const modalH = 200;

    // F-7 Fix: depth 1200→1300 (쿠폰 드롭다운 depth 1200보다 위로 올림)
    const container = this.add.container(0, 0).setDepth(1300);
    this._backupListContainer = container;

    // 반투명 오버레이
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setInteractive();
    container.add(overlay);

    // 패널 배경
    const panelBg = NineSliceFactory.panel(this, cx, cy, modalW, modalH, 'dark');
    container.add(panelBg);

    // 타이틀
    const title = this.add.text(cx, cy - 75, '\u21BA \uC138\uC774\uBE0C \uBCF5\uAD6C', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#88ccff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(title);

    // 닫기 버튼
    const closeBtn = this.add.text(cx + modalW / 2 - 15, cy - modalH / 2 + 15, '\u2715', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      if (this._backupListContainer) {
        this._backupListContainer.destroy();
        this._backupListContainer = null;
      }
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff0000'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    container.add(closeBtn);

    // 백업 목록 렌더링
    const backups = SaveManager.getBackups();
    const ROW_START_Y = cy - 35;
    const ROW_GAP = 36;

    for (let i = 0; i < 3; i++) {
      const rowY = ROW_START_Y + i * ROW_GAP;
      const backup = backups[i];

      if (backup) {
        // 타임스탬프 포맷: YYYY-MM-DD HH:mm
        const d = new Date(backup.timestamp);
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const label = `\uC2AC\uB86F ${i + 1} \u2014 ${dateStr} (v${backup.version})`;

        const rowText = this.add.text(cx, rowY, label, {
          fontSize: '12px',
          color: '#88ffaa',
          stroke: '#000000',
          strokeThickness: 1,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        rowText.on('pointerover', () => rowText.setColor('#ccffcc'));
        rowText.on('pointerout', () => rowText.setColor('#88ffaa'));
        rowText.on('pointerdown', () => {
          SoundManager.playSFX('sfx_ui_tap');
          this._openRestoreConfirmModal(i + 1);
        });
        container.add(rowText);
      } else {
        const emptyText = this.add.text(cx, rowY, `\uC2AC\uB86F ${i + 1} \u2014 (\uC5C6\uC74C)`, {
          fontSize: '12px',
          color: '#555555',
        }).setOrigin(0.5);
        container.add(emptyText);
      }
    }

    // 오버레이 클릭으로 닫기 (모달 영역 외부)
    overlay.on('pointerdown', (pointer) => {
      const mx = cx - modalW / 2;
      const my = cy - modalH / 2;
      if (pointer.x >= mx && pointer.x <= mx + modalW &&
          pointer.y >= my && pointer.y <= my + modalH) return;
      SoundManager.playSFX('sfx_ui_tap');
      if (this._backupListContainer) {
        this._backupListContainer.destroy();
        this._backupListContainer = null;
      }
    });
  }

  /**
   * 세이브 복구 확인 모달을 생성한다.
   * @param {number} slot - 복구할 백업 슬롯 번호 (1~3)
   * @private
   */
  _openRestoreConfirmModal(slot) {
    if (this._restoreConfirmContainer) {
      this._restoreConfirmContainer.destroy();
      this._restoreConfirmContainer = null;
    }

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const modalW = 260;
    const modalH = 160;

    const container = this.add.container(0, 0).setDepth(1300);
    this._restoreConfirmContainer = container;

    // 반투명 오버레이
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setInteractive();
    container.add(overlay);

    // 패널 배경
    const panelBg = NineSliceFactory.panel(this, cx, cy, modalW, modalH, 'dark');
    container.add(panelBg);

    // 경고 텍스트
    const warnText = this.add.text(cx, cy - 30, '\uC774 \uC138\uC774\uBE0C\uB85C \uBCF5\uAD6C\uD558\uBA74\n\uD604\uC7AC \uC9C4\uD589\uC774 \uB36E\uC5B4\uC494\uC6CC\uC9D1\uB2C8\uB2E4.', {
      fontSize: '13px',
      color: '#ffaa66',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5);
    container.add(warnText);

    // 복구 버튼
    const CONFIRM_W = 120;
    const CONFIRM_H = 36;
    const confirmBg = NineSliceFactory.raw(this, cx - 35, cy + 40, CONFIRM_W, CONFIRM_H, 'btn_primary_normal');
    confirmBg.setTint(0x993333);
    const confirmHit = new Phaser.Geom.Rectangle(-CONFIRM_W / 2, -CONFIRM_H / 2, CONFIRM_W, CONFIRM_H);
    confirmBg.setInteractive(confirmHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(confirmBg);

    const confirmLabel = this.add.text(cx - 35, cy + 40, '\uBCF5\uAD6C', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ff8888',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(confirmLabel);

    confirmBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      SaveManager.restoreBackup(slot);
      window.location.reload();
    });
    confirmBg.on('pointerover', () => { confirmBg.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); confirmBg.setTint(0xbb4444); });
    confirmBg.on('pointerout', () => { confirmBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); confirmBg.setTint(0x993333); });

    // 취소 버튼
    const CANCEL_W = 100;
    const CANCEL_H = 36;
    const cancelBg = NineSliceFactory.raw(this, cx + 55, cy + 40, CANCEL_W, CANCEL_H, 'btn_secondary_normal');
    cancelBg.setTint(0x333333);
    const cancelHit = new Phaser.Geom.Rectangle(-CANCEL_W / 2, -CANCEL_H / 2, CANCEL_W, CANCEL_H);
    cancelBg.setInteractive(cancelHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(cancelBg);

    const cancelLabel = this.add.text(cx + 55, cy + 40, '\uCDE8\uC18C', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(cancelLabel);

    cancelBg.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      if (this._restoreConfirmContainer) {
        this._restoreConfirmContainer.destroy();
        this._restoreConfirmContainer = null;
      }
    });
    cancelBg.on('pointerover', () => { cancelBg.setTexture(NS_KEYS.BTN_SECONDARY_PRESSED); cancelBg.setTint(0x555555); });
    cancelBg.on('pointerout', () => { cancelBg.setTexture(NS_KEYS.BTN_SECONDARY_NORMAL); cancelBg.setTint(0x333333); });
  }

  // ── 쿠폰 모달 (Phase 54) ──────────────────────────────────────

  /**
   * 쿠폰 코드 입력 모달을 생성한다.
   * Hidden DOM input으로 모바일 키보드를 활성화하고,
   * Phaser 텍스트로 입력값을 표시한다.
   * @private
   */
  _openCouponModal() {
    // 이미 열려있으면 무시
    if (this._couponContainer) return;

    const cx = GAME_WIDTH / 2;   // 180
    const cy = GAME_HEIGHT / 2;  // 320

    const modalW = 260;
    const modalH = 220;

    const container = this.add.container(0, 0).setDepth(1100);
    this._couponContainer = container;

    // W-3 Fix: 오버레이 alpha 0.6→0.75 (쿠폰 팝업 뒤 배경 과도한 투과 방지)
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setInteractive();
    container.add(overlay);

    // Phase 60-15: 모달 배경 rect → NineSliceFactory.panel 'dark'
    const modalBg = NineSliceFactory.panel(this, cx, cy, modalW, modalH, 'dark');
    container.add(modalBg);

    // ── 타이틀 ──
    const title = this.add.text(cx, cy - 85, '\uD83C\uDF9F \uCFE0\uD3F0 \uCF54\uB4DC \uC785\uB825', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#88ccff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(title);

    // ── 닫기 버튼 ──
    const closeBtn = this.add.text(cx + modalW / 2 - 15, cy - modalH / 2 + 15, '\u2715', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      SoundManager.playSFX('sfx_ui_tap');
      this._closeCouponModal();
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff0000'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    container.add(closeBtn);

    // Phase 60-15: 입력 영역 배경 rect → NineSliceFactory.panel 'stone'
    const INPUT_BG_W = 220;
    const INPUT_BG_H = 36;
    const inputBg = NineSliceFactory.panel(this, cx, cy - 35, INPUT_BG_W, INPUT_BG_H, 'stone');
    const inputHit = new Phaser.Geom.Rectangle(-INPUT_BG_W / 2, -INPUT_BG_H / 2, INPUT_BG_W, INPUT_BG_H);
    inputBg.setInteractive(inputHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(inputBg);

    // ── 입력 텍스트 표시 ──
    const displayText = this.add.text(cx, cy - 35, '\uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694', {
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);
    container.add(displayText);

    // ── Hidden DOM input (모바일 키보드 활성화) ──
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.autocomplete = 'off';
    hiddenInput.autocapitalize = 'characters';
    hiddenInput.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;width:1px;height:1px;';
    document.body.appendChild(hiddenInput);
    this._couponHiddenInput = hiddenInput;

    // 입력 영역 클릭 시 포커스
    inputBg.on('pointerdown', () => {
      hiddenInput.focus();
    });

    // input 이벤트로 표시 텍스트 동기화
    const onInput = () => {
      const val = hiddenInput.value.toUpperCase();
      hiddenInput.value = val;
      if (val) {
        displayText.setText(val);
        displayText.setColor('#ffffff');
      } else {
        displayText.setText('\uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694');
        displayText.setColor('#666666');
      }
    };
    hiddenInput.addEventListener('input', onInput);

    // ── 결과 메시지 텍스트 ──
    const resultText = this.add.text(cx, cy + 15, '', {
      fontSize: '12px',
      color: '#aaaaaa',
      wordWrap: { width: 220 },
      align: 'center',
    }).setOrigin(0.5, 0);
    container.add(resultText);

    // ── 제출 함수 ──
    const submit = () => {
      const code = hiddenInput.value;
      if (!code || !code.trim()) return;

      const result = redeemCoupon(code);
      if (result.ok) {
        resultText.setColor('#44ff44');
        resultText.setText(`\u2705 ${result.msg}`);
        SoundManager.playSFX('sfx_coin');
        // 성공 시 입력창 초기화
        hiddenInput.value = '';
        displayText.setText('\uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694');
        displayText.setColor('#666666');
      } else {
        resultText.setColor('#ff6666');
        resultText.setText(`\u274C ${result.msg}`);
        SoundManager.playSFX('sfx_ui_tap');
      }
    };

    // ── DEV 치트 자동완성 드롭다운 ──
    // submit 정의 이후에 위치해야 항목 클릭 즉시 효과를 적용할 수 있다.
    // F-8 Fix: DEV 환경 이중 확인 — 배포 환경에서 치트 코드 노출 방지
    if (import.meta.env.DEV && !import.meta.env.PROD) {
      const hints = getCheatCodeHints();
      if (hints.length > 0) {
        const sugW = 220;
        const sugItemH = 26;
        // input 하단(cy-35+18=cy-17)에서 2px 아래부터 시작
        const sugStartY = cy - 17 + 2;

        const sugContainer = this.add.container(0, 0).setDepth(1200).setVisible(false);
        this._couponSuggestGroup = sugContainer;

        // 드롭다운 전체 배경
        const totalH = hints.length * sugItemH;
        const bgCenterY = sugStartY + totalH / 2;
        const sugBg = this.add.rectangle(cx, bgCenterY, sugW + 2, totalH + 2, 0x060614, 0.97)
          .setStrokeStyle(1, 0x3355aa);
        sugContainer.add(sugBg);

        hints.forEach((hint, i) => {
          const itemY = sugStartY + i * sugItemH + sugItemH / 2;

          // 아이템 배경 (인터랙티브)
          const itemBg = this.add.rectangle(cx, itemY, sugW, sugItemH - 1, 0x0e0e28)
            .setInteractive({ useHandCursor: true });
          // 코드 텍스트 (왼쪽 정렬, 모노스페이스)
          const codeText = this.add.text(cx - sugW / 2 + 10, itemY, hint.code, {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#88ccff',
          }).setOrigin(0, 0.5);
          // 설명 텍스트 (오른쪽 정렬, 흐린 색)
          const descText = this.add.text(cx + sugW / 2 - 8, itemY, hint.desc, {
            fontSize: '10px',
            color: '#886644',
          }).setOrigin(1, 0.5);

          itemBg.on('pointerover', () => itemBg.setFillStyle(0x1a1a44));
          itemBg.on('pointerout',  () => itemBg.setFillStyle(0x0e0e28));
          itemBg.on('pointerdown', () => {
            // 코드를 채운 뒤 즉시 제출 — 확인 버튼 없이 바로 효과 적용
            hiddenInput.value = hint.code;
            onInput();
            sugContainer.setVisible(false);
            submit();
          });

          sugContainer.add([itemBg, codeText, descText]);
        });

        // 포커스 시 드롭다운 표시
        const onFocus = () => sugContainer.setVisible(true);
        // blur 시 200ms 딜레이 후 숨김 — Phaser pointerdown 이벤트가 먼저 처리되도록
        const onBlur = () => setTimeout(() => {
          if (this._couponSuggestGroup) this._couponSuggestGroup.setVisible(false);
        }, 200);

        hiddenInput.addEventListener('focus', onFocus);
        hiddenInput.addEventListener('blur', onBlur);
        this._couponFocusListener = onFocus;
        this._couponBlurListener  = onBlur;
      }
    }

    // Enter 키로 제출
    const onKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    };
    hiddenInput.addEventListener('keydown', onKeydown);

    // Phase 60-15: 제출 버튼 rect → NineSliceFactory.raw 'btn_primary_normal' + setTint
    const SUBMIT_W = 160;
    const SUBMIT_H = 36;
    const submitBg = NineSliceFactory.raw(this, cx, cy + 65, SUBMIT_W, SUBMIT_H, 'btn_primary_normal');
    submitBg.setTint(0x335533);
    const submitHit = new Phaser.Geom.Rectangle(-SUBMIT_W / 2, -SUBMIT_H / 2, SUBMIT_W, SUBMIT_H);
    submitBg.setInteractive(submitHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(submitBg);

    const submitLabel = this.add.text(cx, cy + 65, '\uD655\uC778', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#88ff88',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(submitLabel);

    submitBg.on('pointerdown', () => {
      submit();
    });
    // Phase 60-15: setFillStyle → setTexture + setTint
    submitBg.on('pointerover', () => { submitBg.setTexture(NS_KEYS.BTN_PRIMARY_PRESSED); submitBg.setTint(0x447744); });
    submitBg.on('pointerout', () => { submitBg.setTexture(NS_KEYS.BTN_PRIMARY_NORMAL); submitBg.setTint(0x335533); });

    // 오버레이 클릭 시 닫기 (모달 영역 외부)
    overlay.on('pointerdown', (pointer) => {
      const mx = cx - modalW / 2;
      const my = cy - modalH / 2;
      if (pointer.x >= mx && pointer.x <= mx + modalW &&
          pointer.y >= my && pointer.y <= my + modalH) return;
      SoundManager.playSFX('sfx_ui_tap');
      this._closeCouponModal();
    });

    // 포커스 활성화
    this.time.delayedCall(100, () => hiddenInput.focus());

    // 이벤트 리스너 참조 저장 (정리용)
    this._couponInputListener = onInput;
    this._couponKeydownListener = onKeydown;
  }

  /**
   * 쿠폰 모달을 닫는다 (DOM input 제거, 컨테이너 파괴).
   * @private
   */
  _closeCouponModal() {
    if (this._couponHiddenInput) {
      this._couponHiddenInput.removeEventListener('input', this._couponInputListener);
      this._couponHiddenInput.removeEventListener('keydown', this._couponKeydownListener);
      // DEV 포커스/블러 리스너 정리
      if (this._couponFocusListener) {
        this._couponHiddenInput.removeEventListener('focus', this._couponFocusListener);
        this._couponFocusListener = null;
      }
      if (this._couponBlurListener) {
        this._couponHiddenInput.removeEventListener('blur', this._couponBlurListener);
        this._couponBlurListener = null;
      }
      this._couponHiddenInput.remove();
      this._couponHiddenInput = null;
      this._couponInputListener = null;
      this._couponKeydownListener = null;
    }
    // DEV 자동완성 컨테이너 정리
    if (this._couponSuggestGroup) {
      this._couponSuggestGroup.destroy();
      this._couponSuggestGroup = null;
    }
    if (this._couponContainer) {
      this._couponContainer.destroy();
      this._couponContainer = null;
    }
  }

  /**
   * 볼륨 슬라이더를 생성한다 (레이블 + 트랙 + 핸들 + 퍼센트 텍스트).
   * @param {Phaser.GameObjects.Container} container - 부모 컨테이너
   * @param {string} label - 슬라이더 레이블 텍스트
   * @param {number} y - 슬라이더 y좌표
   * @param {number} initValue - 초기값 (0.0~1.0)
   * @param {(val: number) => void} onChange - 값 변경 콜백
   * @private
   */
  _createVolumeSlider(container, label, y, initValue, onChange) {
    const cx = GAME_WIDTH / 2;  // 180
    const trackW = 160;
    const trackH = 8;
    const trackX = cx + 20;          // 트랙 중심 (레이블 오른쪽으로 오프셋)
    const trackLeft = trackX - trackW / 2;
    const trackRight = trackX + trackW / 2;

    // ── 레이블 ──
    const labelText = this.add.text(cx - 120, y, label, {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);
    container.add(labelText);

    // ── 트랙 배경 (회색 바) ──
    const trackBg = this.add.rectangle(trackX, y, trackW, trackH, 0x555555)
      .setOrigin(0.5);
    container.add(trackBg);

    // ── 트랙 채움 (주황색) ──
    const fillW = trackW * initValue;
    const trackFill = this.add.rectangle(trackLeft, y, fillW, trackH, 0xff6b35)
      .setOrigin(0, 0.5);
    container.add(trackFill);

    // ── 핸들 (원형) ──
    const handleX = trackLeft + trackW * initValue;
    const handle = this.add.circle(handleX, y, 12, 0xff6b35)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true, draggable: false });
    container.add(handle);

    // ── 퍼센트 표시 ──
    const pctText = this.add.text(trackRight + 25, y, `${Math.round(initValue * 100)}%`, {
      fontSize: '12px',
      color: '#cccccc',
    }).setOrigin(0.5);
    container.add(pctText);

    // ── 드래그 동작 (pointerdown + pointermove + pointerup) ──
    handle.on('pointerdown', () => {
      this._activeDrag = { handle, trackFill, pctText, trackLeft, trackRight, trackW, onChange };
    });

    // 트랙 클릭으로도 즉시 이동
    trackBg.setInteractive({ useHandCursor: true });
    trackBg.on('pointerdown', (pointer) => {
      const val = Phaser.Math.Clamp((pointer.x - trackLeft) / trackW, 0, 1);
      handle.x = trackLeft + trackW * val;
      trackFill.width = trackW * val;
      pctText.setText(`${Math.round(val * 100)}%`);
      onChange(val);
    });

    // 씬 레벨 pointermove/pointerup 리스너 (한 번만 등록)
    if (!this._sliderListenersRegistered) {
      this._sliderListenersRegistered = true;

      this.input.on('pointermove', (pointer) => {
        if (!this._activeDrag) return;
        const d = this._activeDrag;
        const val = Phaser.Math.Clamp((pointer.x - d.trackLeft) / d.trackW, 0, 1);
        d.handle.x = d.trackLeft + d.trackW * val;
        d.trackFill.width = d.trackW * val;
        d.pctText.setText(`${Math.round(val * 100)}%`);
        d.onChange(val);
      });

      this.input.on('pointerup', () => {
        this._activeDrag = null;
      });
    }
  }

  /**
   * 음소거 토글 버튼을 생성한다.
   * @param {Phaser.GameObjects.Container} container - 부모 컨테이너
   * @param {number} y - 버튼 y좌표
   * @param {boolean} initMuted - 초기 음소거 상태
   * @private
   */
  _createMuteToggle(container, y, initMuted) {
    const cx = GAME_WIDTH / 2;

    // Phase 60-15: 음소거 토글 rect → NineSliceFactory.raw 'btn_secondary_normal' + setTint
    const MUTE_W = 240;
    const MUTE_H = 36;
    const toggleBg = NineSliceFactory.raw(this, cx, y, MUTE_W, MUTE_H, 'btn_secondary_normal');
    toggleBg.setTint(initMuted ? 0x882222 : 0x335533);
    const muteHit = new Phaser.Geom.Rectangle(-MUTE_W / 2, -MUTE_H / 2, MUTE_W, MUTE_H);
    toggleBg.setInteractive(muteHit, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    container.add(toggleBg);

    // ── 토글 텍스트 ──
    const muteText = this.add.text(cx, y,
      initMuted ? '\ud83d\udd07 \uc804\uccb4 \uc74c\uc18c\uac70: ON' : '\ud83d\udd07 \uc804\uccb4 \uc74c\uc18c\uac70: OFF', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: initMuted ? '#ff6666' : '#88ff88',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(muteText);

    let muted = initMuted;

    toggleBg.on('pointerdown', () => {
      muted = !muted;
      SoundManager.setMuted(muted);
      SaveManager.saveSoundSettings({ muted });

      // Phase 60-15: setFillStyle → setTint (NineSlice Container)
      toggleBg.setTint(muted ? 0x882222 : 0x335533);
      muteText.setText(muted ? '\ud83d\udd07 \uc804\uccb4 \uc74c\uc18c\uac70: ON' : '\ud83d\udd07 \uc804\uccb4 \uc74c\uc18c\uac70: OFF');
      muteText.setColor(muted ? '#ff6666' : '#88ff88');
      SoundManager.playSFX('sfx_ui_tap');
    });
  }
}
