/**
 * @fileoverview 9-slice 팩토리 dev 샌드박스 씬 (Phase 60-2 검증용).
 * URL 쿼리 `?dev=nineslice` 로 진입 가능. 프로덕션에서는 진입 경로가 없다.
 * 패널/버튼/바/탭/툴팁/뱃지/레터박스를 시각적으로 확인한다.
 */

import Phaser from 'phaser';
import { NineSliceFactory } from '../ui/NineSliceFactory.js';
import { TINT } from '../ui/UITheme.js';

export class NineSliceSandbox extends Phaser.Scene {
  constructor() {
    super({ key: 'NineSliceSandbox' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#1a1a1f');

    this.add.text(width / 2, 22, 'NineSlice 샌드박스 (Phase 60-2)', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── 패널 5종 ──
    const panelY = 100;
    const panels = [
      { v: 'wood',      label: 'wood' },
      { v: 'parchment', label: 'parchment' },
      { v: 'dark',      label: 'dark' },
      { v: 'stone',     label: 'stone' },
      { v: 'glow',      label: 'glow' },
    ];
    panels.forEach((p, i) => {
      const px = 80 + i * 130;
      NineSliceFactory.panel(this, px, panelY, 110, 80, p.v);
      this.add.text(px, panelY + 55, p.label, {
        fontSize: '11px', color: '#aaaaaa',
      }).setOrigin(0.5);
    });

    // ── 버튼 variant × state ──
    const btnStartY = 180;
    const variants = ['primary', 'secondary', 'danger'];
    const states = ['normal', 'pressed', 'disabled'];
    variants.forEach((variant, rowIdx) => {
      const rowY = btnStartY + rowIdx * 75;
      this.add.text(30, rowY, variant, { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0, 0.5);
      states.forEach((state, colIdx) => {
        const bx = 130 + colIdx * 150;
        const btn = NineSliceFactory.button(this, bx, rowY, 130, 52, `${variant}`, {
          variant,
          disabled: state === 'disabled',
          onClick: () => console.log(`[sandbox] click ${variant}/${state}`),
        });
        // pressed state 시각 확인을 위해 state 강제 표시
        if (state === 'pressed' && !btn._disabled) {
          btn._bg.setTexture(`ui_ns_btn_${variant}_pressed`);
        }
        this.add.text(bx, rowY + 36, state, { fontSize: '10px', color: '#808090' }).setOrigin(0.5);
      });
    });

    // ── 아이콘 버튼 3-state ──
    const iconY = btnStartY + 3 * 75 + 10;
    this.add.text(30, iconY, 'icon', { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0, 0.5);
    states.forEach((state, idx) => {
      const ix = 130 + idx * 150 + 41;
      const btn = NineSliceFactory.button(this, ix, iconY, 48, 48, '✦', {
        variant: 'icon',
        disabled: state === 'disabled',
      });
      if (state === 'pressed') btn._bg.setTexture('ui_ns_btn_icon_pressed');
      this.add.text(ix, iconY + 30, state, { fontSize: '10px', color: '#808090' }).setOrigin(0.5);
    });

    // ── 진행 바 ──
    const barY = iconY + 80;
    this.add.text(30, barY - 20, '진행 바', { fontSize: '12px', color: '#ffd36e' });
    const bar1 = NineSliceFactory.progressBar(this, 200, barY, 300, 24, { tint: TINT.HP, value: 0.7 });
    this.add.text(30, barY, 'HP 70%', { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0, 0.5);
    const bar2 = NineSliceFactory.progressBar(this, 200, barY + 40, 300, 36, { tint: TINT.GOLD, value: 0.35, thick: true });
    this.add.text(30, barY + 40, 'GOLD 35%', { fontSize: '11px', color: '#aaaaaa' }).setOrigin(0, 0.5);

    // 애니메이션: bar1을 주기적으로 변동
    this.tweens.add({
      targets: { v: 0.7 },
      v: 0.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      onUpdate: (tw, tgt) => bar1.setValue(tgt.v),
    });

    // ── 탭 ──
    const tabY = barY + 110;
    this.add.text(30, tabY - 20, '탭', { fontSize: '12px', color: '#ffd36e' });
    NineSliceFactory.tab(this, 120, tabY, 100, 40, '활성', { active: true });
    NineSliceFactory.tab(this, 225, tabY, 100, 40, '비활성', { active: false });
    NineSliceFactory.tab(this, 330, tabY, 100, 40, '비활성', { active: false });

    // ── 툴팁 + 뱃지 + 구분선 + 레터박스 ──
    const extrasY = tabY + 70;
    NineSliceFactory.tooltip(this, 120, extrasY, 180, 48, '툴팁 예시 텍스트');
    NineSliceFactory.badge(this, 230, extrasY - 10, 24, TINT.DANGER);
    NineSliceFactory.badge(this, 255, extrasY - 10, 24, TINT.SUCCESS);
    NineSliceFactory.badge(this, 280, extrasY - 10, 24, TINT.WARNING);
    NineSliceFactory.dividerH(this, 400, extrasY - 10, 150, 6);
    NineSliceFactory.dividerV(this, 500, extrasY, 8, 60);

    const lbY = extrasY + 60;
    NineSliceFactory.letterbox(this, width / 2, lbY, width - 40, 28);
    this.add.text(width / 2, lbY, '레터박스', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

    // ── 복귀 버튼 ──
    const back = NineSliceFactory.button(this, width - 80, 22, 120, 32, '← 메뉴', {
      variant: 'secondary',
      onClick: () => this.scene.start('MenuScene'),
    });
  }
}
