/**
 * @fileoverview 스킨 매니저.
 * Phase 84: 셰프 스킨 데이터 정의, 보유/장착 상태 read/write.
 * SaveManager를 통해 unlockedSkins, equippedSkin 필드를 관리한다.
 */

import { SaveManager } from './SaveManager.js';

// ── 스킨 정의 상수 ──

/**
 * 셰프별 스킨 정의 맵.
 * @type {{ [chefId: string]: Array<{ id: string, nameKo: string, portraitKey: string, price: number, unlockType: string }> }}
 */
const SKIN_DEFS = {
  mimi_chef: [
    {
      id: 'default',
      nameKo: '기본',
      portraitKey: 'portrait_mimi',
      price: 0,
      unlockType: 'default',
    },
    {
      id: 'skin_mimi_pink',
      nameKo: '핑크 앞치마',
      portraitKey: 'portrait_mimi_pink',
      price: 2900,
      unlockType: 'iap',
    },
    {
      id: 'skin_mimi_blue',
      nameKo: '블루 앞치마',
      portraitKey: 'portrait_mimi_blue',
      price: 2900,
      unlockType: 'iap',
    },
  ],
};

export class SkinManager {
  /**
   * 특정 셰프의 스킨 목록을 반환한다.
   * @param {string} chefId
   * @returns {Array<{ id: string, nameKo: string, portraitKey: string, price: number, unlockType: string }>}
   */
  static getSkinsForChef(chefId) {
    return SKIN_DEFS[chefId] || [];
  }

  /**
   * 특정 셰프의 현재 장착 스킨 ID를 반환한다.
   * 세이브에 없으면 'default' 반환.
   * @param {string} chefId
   * @returns {string}
   */
  static getEquippedSkin(chefId) {
    const save = SaveManager.load();
    return save.equippedSkin?.[chefId] || 'default';
  }

  /**
   * 특정 셰프의 스킨을 장착한다 (세이브에 equippedSkin[chefId] 기록).
   * 보유하지 않은 스킨이면 아무것도 하지 않는다.
   * @param {string} chefId
   * @param {string} skinId
   */
  static equipSkin(chefId, skinId) {
    if (!SkinManager.isSkinOwned(chefId, skinId)) return;
    const save = SaveManager.load();
    if (!save.equippedSkin) save.equippedSkin = {};
    save.equippedSkin[chefId] = skinId;
    SaveManager.save(save);
  }

  /**
   * 특정 셰프의 스킨 보유 여부를 반환한다.
   * 'default' 타입은 항상 true 반환.
   * @param {string} chefId
   * @param {string} skinId
   * @returns {boolean}
   */
  static isSkinOwned(chefId, skinId) {
    const skins = SKIN_DEFS[chefId];
    if (!skins) return false;
    const skinDef = skins.find(s => s.id === skinId);
    if (!skinDef) return false;
    if (skinDef.unlockType === 'default') return true;
    const save = SaveManager.load();
    return save.unlockedSkins?.[chefId]?.includes(skinId) || false;
  }

  /**
   * 특정 셰프의 스킨을 보유 목록에 추가한다 (세이브에 unlockedSkins[chefId] 배열 push).
   * 이미 보유 중이면 중복 추가하지 않는다.
   * @param {string} chefId
   * @param {string} skinId
   */
  static unlockSkin(chefId, skinId) {
    const save = SaveManager.load();
    if (!save.unlockedSkins) save.unlockedSkins = {};
    if (!save.unlockedSkins[chefId]) save.unlockedSkins[chefId] = [];
    if (save.unlockedSkins[chefId].includes(skinId)) return;
    save.unlockedSkins[chefId].push(skinId);
    SaveManager.save(save);
  }
}
