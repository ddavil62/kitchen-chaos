/**
 * @fileoverview 메뉴 씬. 타이틀 화면과 게임 시작 버튼을 표시한다.
 * Phase 10-4: BGM 재생 추가.
 * Phase 10-6: 사운드 설정 UI(기어 버튼 + 설정 패널) 추가.
 * Phase 11-2: "게임 시작" -> WorldMapScene 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 도감 버튼 Secondary 팔레트 적용.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveManager } from '../managers/SaveManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // ── BGM 재생 (Phase 10-4) ──
    SoundManager.playBGM('bgm_menu');

    // 배경 그라디언트 효과
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0a00);

    // 장식 원들 (카툰 느낌)
    [
      { x: 40, y: 100, r: 30, c: 0xff6b35, a: 0.3 },
      { x: 320, y: 200, r: 50, c: 0xdc143c, a: 0.2 },
      { x: 80, y: 500, r: 40, c: 0xffd700, a: 0.2 },
    ].forEach(o => {
      this.add.circle(o.x, o.y, o.r, o.c, o.a);
    });

    // 타이틀
    this.add.text(GAME_WIDTH / 2, 160, 'Kitchen', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#8b4500',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 220, 'Chaos', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ff6b35',
      stroke: '#8b0000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 275, 'Defense', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 부제목
    this.add.text(GAME_WIDTH / 2, 320, '주방을 지켜라!', {
      fontSize: '18px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // 게임 시작 버튼 (Phase 11-1: y 390으로 이동)
    const btn = this.add.rectangle(GAME_WIDTH / 2, 390, 200, 60, 0xff6b35)
      .setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 390, '\u25B6 \uAC8C\uC784 \uC2DC\uC791', {
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

    btn.on('pointerover', () => btn.setFillStyle(0xff8c00));
    btn.on('pointerout', () => btn.setFillStyle(0xff6b35));

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

    // 상점 버튼 (Phase 11-1: y 450으로 이동)
    const shopBtn = this.add.rectangle(GAME_WIDTH / 2, 450, 160, 40, 0x886600)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 450, '\uD83E\uDE99 \uC8FC\uBC29 \uC0C1\uC810', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    shopBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ShopScene');
      });
    });
    shopBtn.on('pointerover', () => shopBtn.setFillStyle(0xaa8800));
    shopBtn.on('pointerout', () => shopBtn.setFillStyle(0x886600));

    // 도감 버튼 (Phase 11-1: y 500으로 이동, Phase 11-3b: Secondary 팔레트 적용)
    const bookBtn = this.add.rectangle(GAME_WIDTH / 2, 500, 160, 36, 0x886600)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 500, '\uD83D\uDCD6 \uB808\uC2DC\uD53C \uB3C4\uAC10', {
      fontSize: '14px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    bookBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('RecipeCollectionScene');
      });
    });
    bookBtn.on('pointerover', () => bookBtn.setFillStyle(0xaa8800));
    bookBtn.on('pointerout', () => bookBtn.setFillStyle(0x886600));

    // ── 엔드리스 모드 버튼 (Phase 11-1) ──
    const isEndlessUnlocked = SaveManager.isEndlessUnlocked();
    const endlessRecord = SaveManager.getEndlessRecord();

    const endlessColor = isEndlessUnlocked ? 0x6622cc : 0x444444;
    const endlessBtn = this.add.rectangle(GAME_WIDTH / 2, 550, 180, 40, endlessColor)
      .setInteractive({ useHandCursor: isEndlessUnlocked });

    const endlessLabel = isEndlessUnlocked
      ? '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC'
      : '\uD83D\uDD12 \uC5D4\uB4DC\uB9AC\uC2A4 (6-3 \uD074\uB9AC\uC5B4 \uD544\uC694)';
    const endlessLabelColor = isEndlessUnlocked ? '#cc88ff' : '#666666';

    this.add.text(GAME_WIDTH / 2, 550, endlessLabel, {
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
      endlessBtn.on('pointerover', () => endlessBtn.setFillStyle(0x8833ee));
      endlessBtn.on('pointerout', () => endlessBtn.setFillStyle(0x6622cc));
    }

    // 엔드리스 베스트 기록 표시
    if (isEndlessUnlocked && endlessRecord.bestWave > 0) {
      this.add.text(GAME_WIDTH / 2, 574, `\uD83C\uDFC6 \uCD5C\uACE0 \uC6E8\uC774\uBE0C ${endlessRecord.bestWave}  \uC810\uC218 ${endlessRecord.bestScore}`, {
        fontSize: '11px', color: '#aa88cc',
      }).setOrigin(0.5);
    }

    // 평판 + 수집률 (Phase 11-1: y 598로 이동)
    const { current, max } = SaveManager.getTotalStars();
    const { unlocked, total, percent } = RecipeManager.getCollectionProgress();
    this.add.text(GAME_WIDTH / 2, 598, `\u2B50 ${current}/${max}    \uD83D\uDCD6 ${unlocked}/${total} (${percent}%)`, {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // 하단 설명 (Phase 11-1: y 620으로 이동)
    this.add.text(GAME_WIDTH / 2, 620, '\uC801\uC744 \uCC98\uCE58\uD558\uBA74 \uC7AC\uB8CC\uAC00 \uB4DC\uB86D\uB429\uB2C8\uB2E4', {
      fontSize: '12px',
      color: '#777777',
      align: 'center',
    }).setOrigin(0.5);

    // ── 설정 버튼 (Phase 10-6) ──
    this._createSettingsButton();

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);
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

    // 패널 크기/위치
    const panelW = 280;
    const panelH = 300;
    const panelX = cx - panelW / 2;  // 40
    const panelY = 170;

    const container = this.add.container(0, 0).setDepth(1000);
    this._settingsContainer = container;

    // ── 반투명 오버레이 배경 ──
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive(); // 하위 클릭 차단
    container.add(overlay);

    // ── 패널 배경 ──
    const panelBg = this.add.rectangle(cx, panelY + panelH / 2, panelW, panelH, 0x2a1500)
      .setStrokeStyle(2, 0xff6b35);
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
  }

  /**
   * 설정 패널을 닫는다 (컨테이너 파괴).
   * @private
   */
  _closeSettingsPanel() {
    if (this._settingsContainer) {
      this._settingsContainer.destroy();
      this._settingsContainer = null;
    }
    // 드래그 상태 정리
    this._activeDrag = null;
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

    // ── 토글 배경 ──
    const toggleBg = this.add.rectangle(cx, y, 240, 36, initMuted ? 0x882222 : 0x335533)
      .setStrokeStyle(1, 0x666666)
      .setInteractive({ useHandCursor: true });
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

      // 시각적 업데이트
      toggleBg.setFillStyle(muted ? 0x882222 : 0x335533);
      muteText.setText(muted ? '\ud83d\udd07 \uc804\uccb4 \uc74c\uc18c\uac70: ON' : '\ud83d\udd07 \uc804\uccb4 \uc74c\uc18c\uac70: OFF');
      muteText.setColor(muted ? '#ff6666' : '#88ff88');
      SoundManager.playSFX('sfx_ui_tap');
    });
  }
}
