/**
 * @fileoverview 부트 씬. 스프라이트 에셋을 로드하고 프로그래매틱 텍스처를 생성한다.
 * Phase 9-4: SpriteLoader를 사용하여 PixelLab 에셋을 Phaser preload로 로드.
 * Phase 10-4: SoundManager 초기화 추가.
 * Phase 10-6: 저장된 사운드 설정 복원 추가.
 * Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms).
 * Phase 11-3d: 초기화 시 세이브 데이터 크기 콘솔 로깅.
 * Phase 12: Android 하드웨어 백버튼 글로벌 리스너 등록.
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

    // ── 스프라이트 에셋 로드 ──
    SpriteLoader.preload(this);
  }

  create() {
    // 프로그래매틱 텍스처 생성 (맵 타일 등)
    this._createTileTextures();

    // ── 사운드 매니저 초기화 (Phase 10-4) ──
    SoundManager.init(this);

    // ── 저장된 사운드 설정 복원 (Phase 10-6) ──
    SoundManager.applySettings(SaveManager.getSoundSettings());

    // ── 세이브 데이터 크기 로깅 (Phase 11-3d) ──
    const storageInfo = SaveManager.getStorageSize();
    console.log(`[KitchenChaos] 세이브 데이터 크기: ${storageInfo.kb} KB (${storageInfo.bytes} bytes)`);

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 ──
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ── Android 하드웨어 백버튼 리스너 (Phase 12) ──
    this._setupHardwareBackButton();

    this._startGame();
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
   * @private
   */
  _startGame() {
    this.scene.start('MenuScene');
  }
}
