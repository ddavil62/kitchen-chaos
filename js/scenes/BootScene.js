/**
 * @fileoverview 부트 씬. 스프라이트 에셋을 로드하고 프로그래매틱 텍스처를 생성한다.
 * Phase 9-4: SpriteLoader를 사용하여 PixelLab 에셋을 Phaser preload로 로드.
 * Phase 10-4: SoundManager 초기화 추가.
 * Phase 10-6: 저장된 사운드 설정 복원 추가.
 * Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms).
 * Phase 11-3d: 초기화 시 세이브 데이터 크기 콘솔 로깅.
 * Phase 12: Android 하드웨어 백버튼 글로벌 리스너 등록.
 * Phase 12: 앱 백그라운드/포그라운드 전환 시 오디오 일시정지/재개.
 * Phase 60-2: NeoDunggeunmoPro 한글 픽셀 폰트 Font Loading API 프리로드.
 * Phase 61: 메뉴 비주얼 에셋(menu_bg, menu_title_logo) preload 추가.
 * Phase 75B: 미션/캘린더 아이콘 10종 preload 추가.
 */

import Phaser from 'phaser';
import { SpriteLoader } from '../managers/SpriteLoader.js';
import { SoundManager } from '../managers/SoundManager.js';
import { SaveManager } from '../managers/SaveManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * 에셋 로딩 (Phaser preload 단계).
   * SpriteLoader가 적/보스/타워/셰프/재료/타일셋 이미지를 로드 큐에 등록한다.
   */
  preload() {
    // ── 로딩 진행률 표시 ──
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    const progressBar = this.add.rectangle(cx, cy, 200, 16, 0x222222)
      .setStrokeStyle(1, 0x444444);
    const progressFill = this.add.rectangle(cx - 99, cy, 0, 12, 0xff6b35)
      .setOrigin(0, 0.5);
    const loadText = this.add.text(cx, cy + 20, '로딩 중...', {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressFill.width = 198 * value;
    });
    this.load.on('complete', () => {
      progressBar.destroy();
      progressFill.destroy();
      loadText.destroy();
    });

    // ── 한글 픽셀 폰트 프리로드 (Phase 60-2: NeoDunggeunmoPro) ──
    // Phaser Canvas는 @font-face만으로는 렌더링 시점에 폰트 사용을 보장하지 않으므로
    // Font Loading API로 명시적으로 로드한 뒤 create()로 진행해야 한다.
    this._fontReady = this._preloadFonts();

    // ── 스프라이트 에셋 로드 ──
    SpriteLoader.preload(this);

    // ── 9-slice UI 에셋 로드 (Phase 60-2) ──
    this._preloadNineSliceUI();

    // ── 메뉴 비주얼 에셋 로드 (Phase 61) ──
    this.load.image('menu_bg', 'assets/ui/menu_bg.png');
    this.load.image('menu_title_logo', 'assets/ui/menu_title_logo.png');
    this.load.image('mimi_menu', 'assets/chefs/mimi_chef/rotations/south.png');

    // ── 미션/캘린더 아이콘 로드 (Phase 75B) ──
    const MISSION_ROOT = 'assets/sprites/ui/missions';
    const MISSION_ICONS = [
      'mission_icon_clear_stage', 'mission_icon_gold', 'mission_icon_serve',
      'mission_icon_recipe', 'mission_icon_endless', 'mission_icon_satisfaction',
      'mission_icon_three_star', 'calendar_slot_locked', 'calendar_slot_claimed',
      'calendar_slot_today',
      // Phase 75B 핫픽스 — 보상 카드 아이콘 (20×20)
      'icon_reward_kitchencoin', 'icon_reward_mireuk', 'icon_reward_coupon',
    ];
    for (const name of MISSION_ICONS) {
      this.load.image(name, `${MISSION_ROOT}/${name}.png`);
    }
  }

  /**
   * NeoDunggeunmoPro 웹폰트를 Font Loading API로 강제 로드한다.
   * style.css @font-face가 로컬 번들(assets/fonts/) 우선, CDN fallback으로 등록되어 있으므로
   * 오프라인/Android WebView 환경에서도 로컬 파일에서 정상 로드된다.
   * 실패 시 Noto Sans KR → sans-serif 폴백이 자동 적용된다.
   * @returns {Promise<void>} 폰트 로드 완료 프로미스
   * @private
   */
  _preloadFonts() {
    if (!document.fonts || !document.fonts.load) {
      return Promise.resolve();
    }
    // NeoDunggeunmoPro: style.css @font-face 등록 기준 (로컬 번들 우선, CDN fallback)
    const sizes = ['11px', '13px', '14px', '16px', '22px'];
    const promises = sizes.map((sz) =>
      document.fonts.load(`${sz} "NeoDunggeunmoPro"`).catch(() => null),
    );
    return Promise.all(promises)
      .then(() => document.fonts.ready)
      .catch(() => {
        console.warn('[BootScene] NeoDunggeunmoPro 폰트 로드 실패 — 시스템 폴백 적용');
      });
  }

  /**
   * Phase 60-1 산출물인 9-slice UI 에셋 28종과 manifest.json을 로드한다.
   * 경로: /sprites/ui/nineslice/*.png, /sprites/ui/nineslice/manifest.json
   * Phaser 텍스처 키는 'ui_ns_{filename}' 규칙을 따른다(UITheme.NS_KEY_MAP 참조).
   * @private
   */
  _preloadNineSliceUI() {
    const NS_ROOT = '/sprites/ui/nineslice';
    this.load.json('ui_ns_manifest', `${NS_ROOT}/manifest.json`);

    const FILES = [
      // 패널
      'panel_wood', 'panel_parchment', 'panel_dark', 'panel_stone', 'panel_glow_selected',
      // 버튼
      'btn_primary_normal', 'btn_primary_pressed', 'btn_primary_disabled',
      'btn_secondary_normal', 'btn_secondary_pressed', 'btn_secondary_disabled',
      'btn_danger_normal', 'btn_danger_pressed', 'btn_danger_disabled',
      'btn_icon_normal', 'btn_icon_pressed', 'btn_icon_disabled',
      // 바
      'bar_frame_h', 'bar_frame_thick', 'bar_fill', 'bar_shine_overlay',
      // 탭
      'tab_active', 'tab_inactive',
      // 기타
      'tooltip_bg', 'badge_circle', 'divider_h', 'divider_v', 'letterbox',
    ];
    for (const name of FILES) {
      this.load.image(`ui_ns_${name}`, `${NS_ROOT}/${name}.png`);
    }
  }

  create() {
    // 프로그래매틱 텍스처 생성 (맵 타일 등)
    this._createTileTextures();

    // ── 걷기 애니메이션 등록 (Phase 12) ──
    SpriteLoader.registerWalkAnimations(this);

    // ── death 애니메이션 등록 (Phase 47-1: 적, Phase 47-2: 보스) ──
    SpriteLoader.registerDeathAnimations(this);
    SpriteLoader.registerBossDeathAnimations(this);

    // ── 사운드 매니저 초기화 (Phase 10-4) ──
    SoundManager.init(this);

    // ── 저장된 사운드 설정 복원 (Phase 10-6) ──
    SoundManager.applySettings(SaveManager.getSoundSettings());

    // ── 세이브 데이터 크기 로깅 (Phase 11-3d) ──
    const storageInfo = SaveManager.getStorageSize();
    console.log(`[KitchenChaosTycoon] 세이브 데이터 크기: ${storageInfo.kb} KB (${storageInfo.bytes} bytes)`);

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── Android 하드웨어 백버튼 리스너 (Phase 12) ──
    this._setupHardwareBackButton();

    // ── 앱 백그라운드/포그라운드 전환 리스너 (Phase 12) ──
    this._setupAppStateListener();

    // ── 폰트 로드가 끝난 뒤 메뉴 씬으로 전환 (Canvas 렌더 폴백 방지) ──
    const proceed = () => this._startGame();
    if (this._fontReady && typeof this._fontReady.then === 'function') {
      this._fontReady.then(proceed, proceed);
    } else {
      proceed();
    }
  }

  /**
   * Android 하드웨어 백버튼 글로벌 리스너를 등록한다.
   * 현재 활성 씬의 _onBack() 메서드를 호출한다.
   * @private
   */
  _setupHardwareBackButton() {
    const Capacitor = window.Capacitor;
    if (!Capacitor || !Capacitor.isNativePlatform()) return;

    try {
      Capacitor.Plugins.App.addListener('backButton', () => {
        const scenes = this.scene.manager.getScenes(true);
        // 가장 위에 있는 활성 씬의 _onBack 호출
        for (const scene of scenes) {
          if (scene._onBack && scene.scene.key !== 'BootScene') {
            scene._onBack();
            return;
          }
        }
      });
    } catch (e) {
      // 리스너 등록 실패 — 무시 (브라우저 환경)
    }
  }

  /**
   * Capacitor appStateChange 리스너를 등록한다.
   * 백그라운드 진입 시 AudioContext를 suspend하고 게임 루프를 일시정지,
   * 포그라운드 복귀 시 resume한다.
   * 브라우저 환경 폴백으로 visibilitychange도 등록한다.
   * @private
   */
  _setupAppStateListener() {
    // ── Capacitor 네이티브 환경 ──
    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.isNativePlatform()) {
      try {
        Capacitor.Plugins.App.addListener('appStateChange', ({ isActive }) => {
          this._handleAppState(isActive);
        });
      } catch (e) { /* 무시 */ }
    }

    // ── 브라우저 환경 폴백 (탭 전환, 화면 끄기 등) ──
    // Phase 62: _bootComplete 플래그로 초기 로딩 중 visibilitychange 이벤트 무시.
    // 첫 페이지 로드 시 document.hidden 상태 변화가 game.pause()를 트리거해
    // MenuScene 초기화가 완료되기 전에 SHUTDOWN 상태로 빠지는 타이밍 버그를 방지한다.
    document.addEventListener('visibilitychange', () => {
      if (!this._bootComplete) return;
      this._handleAppState(!document.hidden);
    });
  }

  /**
   * 앱 활성/비활성 상태에 따라 오디오와 게임 루프를 제어한다.
   * @param {boolean} isActive - 앱이 포그라운드인지 여부
   * @private
   */
  _handleAppState(isActive) {
    // AudioContext suspend/resume
    const ctx = SoundManager._ctx;
    if (ctx) {
      if (isActive) {
        ctx.resume().catch(() => {});
      } else {
        ctx.suspend().catch(() => {});
      }
    }

    // Phaser 게임 루프 pause/resume
    if (this.game) {
      if (isActive) {
        this.game.resume();
      } else {
        this.game.pause();
      }
    }
  }

  /**
   * 게임에서 사용하는 프로시저럴 텍스처를 생성한다.
   * @private
   */
  _createTileTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // ── 맵 타일 ──
    // 그라운드 타일 (40x40 녹색)
    g.clear();
    g.fillStyle(0x2d5a1b);
    g.fillRect(0, 0, 40, 40);
    g.lineStyle(1, 0x1e3d12, 0.5);
    g.strokeRect(0, 0, 40, 40);
    g.generateTexture('tile_ground', 40, 40);

    // 경로 타일 (40x40 갈색)
    g.clear();
    g.fillStyle(0xc8a46e);
    g.fillRect(0, 0, 40, 40);
    g.lineStyle(1, 0x8b6914, 0.3);
    g.strokeRect(0, 0, 40, 40);
    g.generateTexture('tile_path', 40, 40);

    g.destroy();
  }

  /**
   * 메뉴 씬으로 전환.
   * URL 쿼리 ?dev=nineslice 진입 시 NineSliceSandbox로 라우팅(Phase 60-2).
   * @private
   */
  _startGame() {
    // Phase 62: 부팅 완료 표시 — 이후부터 visibilitychange 이벤트를 처리한다.
    this._bootComplete = true;
    try {
      const dev = new URL(window.location.href).searchParams.get('dev');
      if (dev === 'nineslice') {
        this.scene.start('NineSliceSandbox');
        return;
      }
    } catch { /* 무시 */ }
    this.scene.start('MenuScene');
  }
}
