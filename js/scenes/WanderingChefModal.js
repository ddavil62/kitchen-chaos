/**
 * @fileoverview 유랑 미력사 고용 모달 씬.
 * Phase 51-2: ShopScene 직원 탭에서 진입. 고용/강화/해고 3가지 액션을 처리한다.
 * 이모지 폴백 사용 (픽셀아트 에셋 미생성).
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { SaveManager } from '../managers/SaveManager.js';
import { WANDERING_CHEFS, GRADE_NAMES, GRADE_COLORS, GRADE_COSTS } from '../data/wanderingChefData.js';

export class WanderingChefModal extends Phaser.Scene {
  constructor() {
    super({ key: 'WanderingChefModal' });
  }

  create() {
    // 반투명 오버레이
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    // 메인 패널
    const panelW = GAME_WIDTH - 20;
    const panelH = GAME_HEIGHT - 80;
    const panelX = GAME_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2 + 10;
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x150c22)
      .setStrokeStyle(2, 0x8833cc);

    // ── 헤더 ──
    this.add.text(GAME_WIDTH / 2, 52, '유랑 미력사', {
      fontSize: '18px', fontStyle: 'bold', color: '#e0aaff',
      stroke: '#330066', strokeThickness: 3,
    }).setOrigin(0.5);

    this._essenceText = this.add.text(GAME_WIDTH - 22, 52, '', {
      fontSize: '13px', color: '#b266ff',
    }).setOrigin(1, 0.5);

    this._limitText = this.add.text(22, 52, '', {
      fontSize: '11px', color: '#888888',
    }).setOrigin(0, 0.5);

    // ── 닫기 버튼 ──
    const closeBtn = this.add.rectangle(GAME_WIDTH - 22, 32, 36, 24, 0x443344)
      .setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH - 22, 32, '\u2715', {
      fontSize: '14px', color: '#ccaadd',
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => this._close());
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x664466));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x443344));

    // ── 카드 목록 ──
    this._listContainer = this.add.container(0, 0);

    this._render();
  }

  /**
   * 전체 화면 렌더링 (상태 변경 후 재호출).
   * @private
   */
  _render() {
    // 기존 카드 파괴
    this._listContainer.removeAll(true);

    const essence = SaveManager.getMireukEssence();
    const wc = SaveManager.getWanderingChefs();
    const hireLimit = SaveManager.getHireLimit();
    const hiredCount = wc.hired.length;

    this._essenceText.setText(`\uD83D\uDCA0 ${essence} \uC815\uC218`);
    this._limitText.setText(`\uACE0\uC6A9: ${hiredCount}/${hireLimit}\uBA85`);

    // 해금 조건 충족 여부 판별
    const saveData = SaveManager.load();

    const CARD_H = 88;
    const CARD_W = GAME_WIDTH - 32;
    const listStartY = 80;

    WANDERING_CHEFS.forEach((chef, i) => {
      const y = listStartY + i * (CARD_H + 6);

      // 해금 조건 확인 (스테이지 클리어 여부)
      const isUnlocked = chef.unlockStage === '' ||
        !!saveData.stages?.[chef.unlockStage]?.cleared;
      const isHired = wc.hired.includes(chef.id);
      const enhLevel = wc.enhancements[chef.id] || 1;
      const costs = GRADE_COSTS[chef.grade];

      // 카드 배경
      const cardBg = this.add.rectangle(GAME_WIDTH / 2, y + CARD_H / 2, CARD_W, CARD_H, 0x1a1030)
        .setStrokeStyle(1, isHired ? 0x9944cc : (isUnlocked ? 0x554466 : 0x333333));
      this._listContainer.add(cardBg);

      // 아이콘 + 이름 + 칭호
      const nameColor = isHired ? '#e0aaff' : (isUnlocked ? '#ffffff' : '#555555');

      this._listContainer.add(
        this.add.text(18, y + 10, chef.icon, { fontSize: '22px' })
      );
      this._listContainer.add(
        this.add.text(48, y + 10, chef.nameKo, {
          fontSize: '14px', fontStyle: 'bold', color: nameColor,
        })
      );
      this._listContainer.add(
        this.add.text(48, y + 28, chef.title, {
          fontSize: '10px', color: '#888888',
        })
      );

      // 등급 뱃지
      const gradeColor = GRADE_COLORS[chef.grade];
      const gradeBadge = this.add.rectangle(GAME_WIDTH - 18, y + 10, 60, 18, gradeColor, 0.8);
      this._listContainer.add(gradeBadge);
      this._listContainer.add(
        this.add.text(GAME_WIDTH - 18, y + 10, GRADE_NAMES[chef.grade], {
          fontSize: '9px', color: '#ffffff',
        }).setOrigin(0.5)
      );

      if (!isUnlocked) {
        // 해금 전: 잠금 표시
        this._listContainer.add(
          this.add.text(18, y + 50, `\uD83D\uDD12 ${chef.unlockStage} \uD074\uB9AC\uC5B4 \uD544\uC694`, {
            fontSize: '10px', color: '#555555',
          })
        );
        return;
      }

      // 스킬 설명 (단계 표시 포함)
      const skillDesc = this._buildSkillDesc(chef, enhLevel);
      this._listContainer.add(
        this.add.text(18, y + 44, skillDesc, {
          fontSize: '10px', color: isHired ? '#cc99ff' : '#aaaaaa',
          wordWrap: { width: CARD_W - 100 },
        })
      );

      // ── 고용 중 상태 ──
      if (isHired) {
        // 강화 단계 표시
        const starsStr = '\u2605'.repeat(enhLevel) + '\u2606'.repeat(3 - enhLevel);
        this._listContainer.add(
          this.add.text(18, y + 60, `\uAC15\uD654: ${starsStr}`, {
            fontSize: '11px', color: '#ffcc44',
          })
        );

        // 강화 버튼
        if (enhLevel < 3) {
          const upgCost = enhLevel === 1 ? costs.upgrade1to2 : costs.upgrade2to3;
          const canUpg = essence >= upgCost;
          const upgBtn = this.add.rectangle(GAME_WIDTH - 85, y + CARD_H - 18, 80, 22, canUpg ? 0x774400 : 0x333333)
            .setInteractive({ useHandCursor: canUpg });
          this._listContainer.add(upgBtn);
          this._listContainer.add(
            this.add.text(GAME_WIDTH - 85, y + CARD_H - 18, `\uAC15\uD654 \uD83D\uDCA0${upgCost}`, {
              fontSize: '11px', color: canUpg ? '#ffcc00' : '#555555',
            }).setOrigin(0.5)
          );
          if (canUpg) {
            upgBtn.on('pointerdown', () => {
              if (SaveManager.upgradeWanderingChef(chef.id, upgCost)) {
                this._render();
              }
            });
          }
        } else {
          this._listContainer.add(
            this.add.text(GAME_WIDTH - 85, y + CARD_H - 18, '\uB9CC\uAC15\uD654 \u2605\u2605\u2605', {
              fontSize: '11px', color: '#ffcc44',
            }).setOrigin(0.5)
          );
        }

        // 해고 버튼
        const fireBtn = this.add.rectangle(GAME_WIDTH - 18, y + CARD_H - 18, 54, 22, 0x440022)
          .setInteractive({ useHandCursor: true });
        this._listContainer.add(fireBtn);
        this._listContainer.add(
          this.add.text(GAME_WIDTH - 18, y + CARD_H - 18, '\uD574\uACE0', {
            fontSize: '11px', color: '#ff6666',
          }).setOrigin(0.5)
        );
        fireBtn.on('pointerdown', () => {
          // 해고 확인: 간단한 confirm 대화상자
          if (window.confirm(`${chef.nameKo}\uC744(\uB97C) \uD574\uACE0\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC815\uC218\uB294 \uD658\uAE09\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`)) {
            SaveManager.fireWanderingChef(chef.id);
            this._render();
          }
        });

      } else {
        // ── 미고용 상태 ──
        const isUnlockedBefore = wc.unlocked.includes(chef.id);
        const hireCost = isUnlockedBefore ? costs.rehire : costs.hire;
        const canHire = essence >= hireCost && hiredCount < hireLimit;
        const slotFull = hiredCount >= hireLimit;

        const hireBtnColor = canHire ? 0x442266 : 0x222222;
        const hireBtn = this.add.rectangle(GAME_WIDTH - 65, y + CARD_H - 18, 100, 22, hireBtnColor)
          .setInteractive({ useHandCursor: canHire });
        this._listContainer.add(hireBtn);

        let hireBtnLabel;
        let hireLabelColor;
        if (slotFull) {
          hireBtnLabel = '\uC2AC\uB86F \uBD80\uC871';
          hireLabelColor = '#555555';
        } else if (!canHire) {
          hireBtnLabel = `\uD83D\uDCA0${hireCost} \uBD80\uC871`;
          hireLabelColor = '#555555';
        } else {
          hireBtnLabel = isUnlockedBefore ? `\uC7AC\uACE0\uC6A9 \uD83D\uDCA0${hireCost}` : `\uACE0\uC6A9 \uD83D\uDCA0${hireCost}`;
          hireLabelColor = '#cc88ff';
        }

        this._listContainer.add(
          this.add.text(GAME_WIDTH - 65, y + CARD_H - 18, hireBtnLabel, {
            fontSize: '11px', color: hireLabelColor,
          }).setOrigin(0.5)
        );

        if (canHire) {
          hireBtn.on('pointerdown', () => {
            if (SaveManager.hireWanderingChef(chef.id, hireCost)) {
              this._render();
            }
          });
        }
      }
    });
  }

  /**
   * 스킬 설명 텍스트 생성.
   * @param {object} chef
   * @param {number} level - 현재 강화 단계 (1~3)
   * @returns {string}
   * @private
   */
  _buildSkillDesc(chef, level) {
    const idx = level - 1;
    const v = chef.skillValues[idx];
    const v2 = chef.skillValues2 ? chef.skillValues2[idx] : 0;

    switch (chef.skillType) {
      case 'patience_pct':
        return `${chef.skillName}: \uC778\uB0B4\uC2EC +${Math.round(v * 100)}%${v2 > 0 ? ` (\uAE09\uD55C\uC190\uB2D8 \uCD94\uAC00 +${Math.round(v2 * 100)}%)` : ''}`;
      case 'cook_time_reduce':
        return `${chef.skillName}: \uC870\uB9AC \uC2DC\uAC04 -${Math.round(v * 100)}%${v2 > 0 ? ` (+\uCF64\uBCF4 \uBCF4\uB108\uC2A4 -${Math.round(v2 * 100)}%)` : ''}`;
      case 'gourmet_rate':
        return `${chef.skillName}: \uBBF8\uC2DD\uAC00 \uD655\uB960 +${Math.round(v * 100)}%, \uBCF4\uC0C1 +${Math.round(v2 * 100)}%`;
      case 'serve_speed':
        return `${chef.skillName}: \uC11C\uBE59 \uC18D\uB3C4 +${Math.round(v * 100)}%`;
      case 'early_session_bonus':
        return `${chef.skillName}: \uCD08\uBC18 ${v2}\uCD08 \uBCF4\uC0C1 +${Math.round(v * 100)}%`;
      case 'ingredient_refund':
        return `${chef.skillName}: \uC2E4\uD328 \uC7AC\uB8CC ${Math.round(v * 100)}% \uD68C\uC218${v2 > 0 ? ' (\uC989\uC2DC \uC7AC\uC870\uB9AC)' : ''}`;
      case 'vip_rate':
        return `${chef.skillName}: VIP \uD655\uB960 \u00D7${v}, \uBCF4\uC0C1 +${Math.round(v2 * 100)}%`;
      case 'chain_serve':
        return `${chef.skillName}: ${v}\uC5F0\uC18D \uC11C\uBE59 \uD6C4 \uD1F4\uC7A5 \uBC29\uC9C0 1\uD68C${v2 > 0 ? ` + \uBCF4\uC0C1 +${Math.round(v2 * 100)}%` : ''}`;
      default:
        return chef.skillName;
    }
  }

  /**
   * 모달 닫기. ShopScene 재개 + 직원 탭 리렌더.
   * @private
   */
  _close() {
    const shopScene = this.scene.get('ShopScene');
    if (shopScene) {
      shopScene.scene.resume();
      // 직원 탭 상태 갱신
      if (shopScene._activeTab === 'staff') {
        shopScene._renderContent();
      }
    }
    this.scene.stop();
  }
}
