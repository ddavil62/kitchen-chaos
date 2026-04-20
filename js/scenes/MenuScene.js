/**
 * @fileoverview 메뉴 씬. 타이틀 화면과 게임 시작 버튼을 표시한다.
 * Phase 10-4: BGM 재생 추가.
 * Phase 10-6: 사운드 설정 UI(기어 버튼 + 설정 패널) 추가.
 * Phase 11-2: "게임 시작" -> WorldMapScene 전환.
 * Phase 11-3b: fadeIn 300ms 통일, 도감 버튼 Secondary 팔레트 적용.
 * Phase 11-3d: 하단 버전 표기(APP_VERSION) 추가.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, APP_VERSION } from '../config.js';
import { SaveManager } from '../managers/SaveManager.js';
import { RecipeManager } from '../managers/RecipeManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { redeemCoupon, getCheatCodeHints } from '../managers/CouponRegistry.js';

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

    // 타이틀 블록 (Container로 단일 관리)
    const titleBlock = this.add.container(GAME_WIDTH / 2, 220);
    titleBlock.add(this.add.text(0, -60, 'Kitchen', {
      fontSize: '48px', fontStyle: 'bold',
      color: '#ffd700', stroke: '#8b4500', strokeThickness: 6,
    }).setOrigin(0.5));
    titleBlock.add(this.add.text(0, 0, 'Chaos', {
      fontSize: '48px', fontStyle: 'bold',
      color: '#ff6b35', stroke: '#8b0000', strokeThickness: 6,
    }).setOrigin(0.5));
    titleBlock.add(this.add.text(0, 55, 'Tycoon', {
      fontSize: '28px',
      color: '#ffffff', stroke: '#333333', strokeThickness: 4,
    }).setOrigin(0.5));

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

    // 도감 버튼 (Phase 11-1: y 500으로 이동, Phase 11-3b: Secondary 팔레트 적용, Phase 42: y 496)
    const bookBtn = this.add.rectangle(GAME_WIDTH / 2, 496, 160, 36, 0x886600)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 496, '\uD83D\uDCD6 \uB808\uC2DC\uD53C \uB3C4\uAC10', {
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

    // ── 업적 버튼 (Phase 42) ──
    const achieveBtn = this.add.rectangle(GAME_WIDTH / 2, 534, 160, 36, 0x886600)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 534, '\uD83C\uDFC6 \uC5C5\uC801', {
      fontSize: '14px', fontStyle: 'bold', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    achieveBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AchievementScene');
      });
    });
    achieveBtn.on('pointerover', () => achieveBtn.setFillStyle(0xaa8800));
    achieveBtn.on('pointerout', () => achieveBtn.setFillStyle(0x886600));

    // ── 엔드리스 모드 버튼 (Phase 11-1, Phase 42: y 550 -> 570 -> 578) ──
    const isEndlessUnlocked = SaveManager.isEndlessUnlocked();
    const endlessRecord = SaveManager.getEndlessRecord();

    const endlessColor = isEndlessUnlocked ? 0x6622cc : 0x444444;
    const endlessBtn = this.add.rectangle(GAME_WIDTH / 2, 578, 180, 40, endlessColor)
      .setInteractive({ useHandCursor: isEndlessUnlocked });

    const endlessLabel = isEndlessUnlocked
      ? '\u221E \uC5D4\uB4DC\uB9AC\uC2A4 \uBAA8\uB4DC'
      : '\uD83D\uDD12 \uC5D4\uB4DC\uB9AC\uC2A4 (6-3 \uD074\uB9AC\uC5B4 \uD544\uC694)';
    const endlessLabelColor = isEndlessUnlocked ? '#cc88ff' : '#666666';

    this.add.text(GAME_WIDTH / 2, 578, endlessLabel, {
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

    // 엔드리스 베스트 기록 표시 (Phase 42: y 574 -> 593 -> 602 -> 607)
    if (isEndlessUnlocked && endlessRecord.bestWave > 0) {
      this.add.text(GAME_WIDTH / 2, 607, `\uD83C\uDFC6 \uCD5C\uACE0 \uC6E8\uC774\uBE0C ${endlessRecord.bestWave}  \uC810\uC218 ${endlessRecord.bestScore}`, {
        fontSize: '11px', color: '#aa88cc',
      }).setOrigin(0.5);
    }

    // 평판 + 수집률 (Phase 42: y 598 -> 610 -> 618 -> 620)
    const { current, max } = SaveManager.getTotalStars();
    const { unlocked, total, percent } = RecipeManager.getCollectionProgress();
    this.add.text(GAME_WIDTH / 2, 620, `\u2B50 ${current}/${max}    \uD83D\uDCD6 ${unlocked}/${total} (${percent}%)`, {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // ── 버전 표기 (Phase 42: y 632 -> 636 -> 634 -> 632 -> 634) ──
    this.add.text(GAME_WIDTH / 2, 634, `v${APP_VERSION}`, {
      fontSize: '10px',
      color: '#555555',
    }).setOrigin(0.5);

    // ── 설정 버튼 (Phase 10-6) ──
    this._createSettingsButton();

    // ── Phase 11-3b: 씬 전환 fadeIn 일관 적용 (300ms) ──
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ── 하드웨어 백버튼 (Phase 12) ──────────────────────────────────

  /**
   * 하드웨어 뒤로가기 핸들러.
   * 설정 패널이 열려있으면 닫고, 아니면 앱을 종료한다.
   */
  _onBack() {
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

    // 패널 크기/위치 (Phase 54: panelH 268, 쿠폰 버튼 추가, AD3 여백 보정)
    const panelW = 280;
    const panelH = 268;
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

    // ── 쿠폰 입력 버튼 (y=408, Phase 54) ──
    const couponBg = this.add.rectangle(cx, 408, 240, 36, 0x1a3366)
      .setStrokeStyle(1, 0x666666)
      .setInteractive({ useHandCursor: true });
    container.add(couponBg);

    const couponLabel = this.add.text(cx, 408, '\uD83C\uDF9F \uCFE0\uD3F0 \uC785\uB825', {
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
    couponBg.on('pointerover', () => couponBg.setFillStyle(0x264d99));
    couponBg.on('pointerout', () => couponBg.setFillStyle(0x1a3366));
  }

  /**
   * 설정 패널을 닫는다 (컨테이너 파괴).
   * Phase 54: 쿠폰 모달이 열려있으면 함께 닫는다.
   * @private
   */
  _closeSettingsPanel() {
    // 쿠폰 모달이 열려있으면 먼저 닫기
    this._closeCouponModal();
    if (this._settingsContainer) {
      this._settingsContainer.destroy();
      this._settingsContainer = null;
    }
    // 드래그 상태 정리
    this._activeDrag = null;
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

    // ── 반투명 오버레이 ──
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setInteractive();
    container.add(overlay);

    // ── 모달 배경 ──
    const modalBg = this.add.rectangle(cx, cy, modalW, modalH, 0x1a1a2e)
      .setStrokeStyle(2, 0x88ccff);
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

    // ── 입력 영역 배경 ──
    const inputBg = this.add.rectangle(cx, cy - 35, 220, 36, 0x2a2a4a)
      .setStrokeStyle(1, 0x555555)
      .setInteractive({ useHandCursor: true });
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
    // 프로덕션 빌드에서는 트리쉐이킹된다.
    if (import.meta.env.DEV) {
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

    // ── 제출 버튼 ──
    const submitBg = this.add.rectangle(cx, cy + 65, 160, 36, 0x335533)
      .setStrokeStyle(1, 0x666666)
      .setInteractive({ useHandCursor: true });
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
    submitBg.on('pointerover', () => submitBg.setFillStyle(0x447744));
    submitBg.on('pointerout', () => submitBg.setFillStyle(0x335533));

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
