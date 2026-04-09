/**
 * @fileoverview 손님 대기존 UI.
 * RestaurantScene 소속. 손님 슬롯 3개를 가로로 배치하여
 * 주문 정보, 인내심 게이지, 서빙 버튼을 표시한다.
 */

import { GAME_WIDTH, CUSTOMER_ZONE_HEIGHT } from '../config.js';

/** 슬롯 하나의 크기/간격 */
const SLOT_WIDTH = 112;
const SLOT_HEIGHT = 90;
const SLOT_GAP = 6;
const SLOT_START_X = (GAME_WIDTH - (SLOT_WIDTH * 3 + SLOT_GAP * 2)) / 2;

export class CustomerZoneUI {
  /**
   * @param {Phaser.Scene} scene - RestaurantScene
   * @param {object} callbacks
   * @param {function(number):void} callbacks.onServe - 서빙 버튼 탭 콜백(slotIndex)
   */
  constructor(scene, callbacks) {
    this.scene = scene;
    this.callbacks = callbacks;

    /** @type {SlotUI[]} */
    this.slotUIs = [];

    this._createBackground();
    for (let i = 0; i < 3; i++) {
      this.slotUIs.push(this._createSlot(i));
    }

    // 씬 이벤트 리스닝
    scene.events.on('customer_arrived', this._onCustomerArrived, this);
    scene.events.on('customer_served', this._onCustomerServed, this);
    scene.events.on('customer_left', this._onCustomerLeft, this);
  }

  /** 배경 패널 */
  _createBackground() {
    this.bg = this.scene.add.rectangle(
      GAME_WIDTH / 2, CUSTOMER_ZONE_HEIGHT / 2,
      GAME_WIDTH, CUSTOMER_ZONE_HEIGHT,
      0x1a1a2e, 1
    ).setDepth(0);
  }

  /**
   * 슬롯 UI 하나 생성.
   * @param {number} index
   * @returns {SlotUI}
   */
  _createSlot(index) {
    const x = SLOT_START_X + index * (SLOT_WIDTH + SLOT_GAP);
    const y = 5;

    // 슬롯 배경
    const bg = this.scene.add.rectangle(
      x + SLOT_WIDTH / 2, y + SLOT_HEIGHT / 2,
      SLOT_WIDTH, SLOT_HEIGHT,
      0x2a2a4a, 1
    ).setDepth(1);

    // 빈 슬롯 텍스트
    const emptyText = this.scene.add.text(
      x + SLOT_WIDTH / 2, y + SLOT_HEIGHT / 2,
      '---', { fontSize: '14px', color: '#555555' }
    ).setOrigin(0.5).setDepth(2);

    // 요리 아이콘 + 이름
    const dishText = this.scene.add.text(
      x + SLOT_WIDTH / 2, y + 12,
      '', { fontSize: '13px', color: '#ffffff', align: 'center' }
    ).setOrigin(0.5).setDepth(2).setVisible(false);

    // 인내심 게이지 배경
    const gaugeBg = this.scene.add.rectangle(
      x + SLOT_WIDTH / 2, y + 32,
      SLOT_WIDTH - 16, 8, 0x333333
    ).setDepth(2).setVisible(false);

    // 인내심 게이지 바
    const gaugeBar = this.scene.add.rectangle(
      x + 8, y + 32,
      SLOT_WIDTH - 16, 8, 0x44ff44
    ).setOrigin(0, 0.5).setDepth(3).setVisible(false);

    // 남은 시간 텍스트
    const timeText = this.scene.add.text(
      x + SLOT_WIDTH / 2, y + 47,
      '', { fontSize: '11px', color: '#aaaaaa' }
    ).setOrigin(0.5).setDepth(2).setVisible(false);

    // 서빙 버튼
    const btnBg = this.scene.add.rectangle(
      x + SLOT_WIDTH / 2, y + 70,
      SLOT_WIDTH - 20, 28, 0x228b22
    ).setDepth(2).setInteractive().setVisible(false);

    const btnText = this.scene.add.text(
      x + SLOT_WIDTH / 2, y + 70,
      '서빙!', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }
    ).setOrigin(0.5).setDepth(3).setVisible(false);

    btnBg.on('pointerdown', () => {
      this.callbacks.onServe(index);
    });

    return {
      bg, emptyText, dishText, gaugeBg, gaugeBar, timeText, btnBg, btnText,
      customer: null,
      x, y,
    };
  }

  /**
   * 손님 도착 이벤트 핸들러.
   * @param {{ slotIndex: number, customer: object }} data
   */
  _onCustomerArrived({ slotIndex, customer }) {
    const slot = this.slotUIs[slotIndex];
    slot.customer = customer;

    slot.emptyText.setVisible(false);
    slot.dishText.setText(`${customer.recipe.icon} ${customer.recipe.nameKo}`);
    slot.dishText.setVisible(true);
    slot.gaugeBg.setVisible(true);
    slot.gaugeBar.setVisible(true);
    slot.timeText.setVisible(true);
    slot.btnBg.setVisible(true);
    slot.btnText.setVisible(true);

    this._updateGauge(slot);

    // 등장 애니메이션
    slot.bg.setScale(0.8);
    this.scene.tweens.add({
      targets: slot.bg,
      scaleX: 1, scaleY: 1,
      duration: 200, ease: 'Back.easeOut',
    });
  }

  /**
   * 서빙 성공 이벤트 핸들러.
   * @param {{ slotIndex: number }} data
   */
  _onCustomerServed({ slotIndex }) {
    this._clearSlot(slotIndex);
  }

  /**
   * 손님 퇴장 이벤트 핸들러.
   * @param {{ slotIndex: number }} data
   */
  _onCustomerLeft({ slotIndex }) {
    const slot = this.slotUIs[slotIndex];

    // 퇴장 이펙트
    const angryText = this.scene.add.text(
      slot.x + SLOT_WIDTH / 2, slot.y + SLOT_HEIGHT / 2,
      '😠', { fontSize: '24px' }
    ).setOrigin(0.5).setDepth(10);

    this.scene.tweens.add({
      targets: angryText,
      y: angryText.y - 30, alpha: 0,
      duration: 600,
      onComplete: () => angryText.destroy(),
    });

    this._clearSlot(slotIndex);
  }

  /**
   * 슬롯을 빈 상태로 되돌린다.
   * @param {number} index
   * @private
   */
  _clearSlot(index) {
    const slot = this.slotUIs[index];
    slot.customer = null;
    slot.emptyText.setVisible(true);
    slot.dishText.setVisible(false);
    slot.gaugeBg.setVisible(false);
    slot.gaugeBar.setVisible(false);
    slot.timeText.setVisible(false);
    slot.btnBg.setVisible(false);
    slot.btnText.setVisible(false);
  }

  /**
   * 게이지 바 업데이트.
   * @param {SlotUI} slot
   * @private
   */
  _updateGauge(slot) {
    if (!slot.customer) return;

    const ratio = Math.max(0, slot.customer.patience / slot.customer.maxPatience);
    const maxWidth = SLOT_WIDTH - 16;
    slot.gaugeBar.width = maxWidth * ratio;

    // 색상: 초록 → 노랑 → 빨강
    if (ratio > 0.6) {
      slot.gaugeBar.setFillStyle(0x44ff44);
    } else if (ratio > 0.3) {
      slot.gaugeBar.setFillStyle(0xffcc00);
    } else {
      slot.gaugeBar.setFillStyle(0xff4444);
    }

    const sec = Math.ceil(slot.customer.patience / 1000);
    slot.timeText.setText(`${sec}초`);
  }

  /**
   * 서빙 버튼 활성/비활성 상태 갱신.
   * @param {import('../managers/IngredientManager.js').IngredientManager} ingredientManager
   */
  updateButtonStates(ingredientManager) {
    for (const slot of this.slotUIs) {
      if (!slot.customer) continue;
      const canServe = ingredientManager.canCook(slot.customer.recipe);
      slot.btnBg.setFillStyle(canServe ? 0x228b22 : 0x555555);
    }
  }

  /** 매 프레임 게이지 갱신 */
  update() {
    for (const slot of this.slotUIs) {
      if (slot.customer) {
        this._updateGauge(slot);
      }
    }
  }

  destroy() {
    this.scene.events.off('customer_arrived', this._onCustomerArrived, this);
    this.scene.events.off('customer_served', this._onCustomerServed, this);
    this.scene.events.off('customer_left', this._onCustomerLeft, this);
  }
}
