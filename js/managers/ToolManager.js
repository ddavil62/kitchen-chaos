/**
 * @fileoverview 도구 인벤토리 매니저.
 * Phase 13: 영구 도구 시스템. 구매/판매/업그레이드/배치 관리.
 */

import { TOOL_DEFS } from '../data/gameData.js';
import { SaveManager } from './SaveManager.js';

/**
 * 영구 도구 인벤토리를 관리한다.
 * 세이브 데이터의 gold / tools 필드를 직접 읽고 쓴다.
 */
export class ToolManager {
  /**
   * 보유 도구 전체 조회.
   * @returns {Object.<string, {count: number, level: number}>}
   */
  static getToolInventory() {
    const data = SaveManager.load();
    return data.tools || ToolManager._defaultTools();
  }

  /**
   * 영구 골드 잔액 조회.
   * @returns {number}
   */
  static getGold() {
    return SaveManager.load().gold || 0;
  }

  /**
   * 영구 골드 추가 (영업 수입).
   * @param {number} amount
   */
  static addGold(amount) {
    const data = SaveManager.load();
    data.gold = (data.gold || 0) + amount;
    data.totalGoldEarned = (data.totalGoldEarned || 0) + amount;
    SaveManager.save(data);
  }

  // ── 구매 ──

  /**
   * 도구 구매 가능 여부.
   * @param {string} toolId
   * @returns {boolean}
   */
  static canBuyTool(toolId) {
    const def = TOOL_DEFS[toolId];
    if (!def) return false;
    const data = SaveManager.load();
    const tool = (data.tools || {})[toolId] || { count: 0, level: 1 };
    if (tool.count >= def.maxCount) return false;
    const cost = def.buyCost[tool.count]; // 다음 구매 비용
    return (data.gold || 0) >= cost;
  }

  /**
   * 도구 구매. 골드 차감, count+1.
   * @param {string} toolId
   * @returns {boolean} 성공 여부
   */
  static buyTool(toolId) {
    if (!ToolManager.canBuyTool(toolId)) return false;
    const def = TOOL_DEFS[toolId];
    const data = SaveManager.load();
    if (!data.tools) data.tools = ToolManager._defaultTools();
    const tool = data.tools[toolId];
    const cost = def.buyCost[tool.count];
    data.gold -= cost;
    tool.count++;
    SaveManager.save(data);
    return true;
  }

  /**
   * 다음 구매 비용 조회.
   * @param {string} toolId
   * @returns {number|null} 상한 도달 시 null
   */
  static getBuyCost(toolId) {
    const def = TOOL_DEFS[toolId];
    if (!def) return null;
    const tool = ToolManager.getToolInventory()[toolId] || { count: 0 };
    if (tool.count >= def.maxCount) return null;
    return def.buyCost[tool.count];
  }

  // ── 판매 ──

  /**
   * 도구 판매 가능 여부.
   * @param {string} toolId
   * @returns {boolean}
   */
  static canSellTool(toolId) {
    const tool = ToolManager.getToolInventory()[toolId];
    return tool && tool.count > 0;
  }

  /**
   * 도구 판매가 조회. buyCost[count-1] * sellRate.
   * @param {string} toolId
   * @returns {number} 판매가 (0이면 판매 불가)
   */
  static getSellPrice(toolId) {
    const def = TOOL_DEFS[toolId];
    if (!def) return 0;
    const tool = ToolManager.getToolInventory()[toolId];
    if (!tool || tool.count <= 0) return 0;
    return Math.floor(def.buyCost[tool.count - 1] * def.sellRate);
  }

  /**
   * 도구 판매. count-1, 환불 골드 추가.
   * @param {string} toolId
   * @returns {boolean} 성공 여부
   */
  static sellTool(toolId) {
    if (!ToolManager.canSellTool(toolId)) return false;
    const def = TOOL_DEFS[toolId];
    const data = SaveManager.load();
    if (!data.tools) data.tools = ToolManager._defaultTools();
    const tool = data.tools[toolId];
    const refund = Math.floor(def.buyCost[tool.count - 1] * def.sellRate);
    data.gold = (data.gold || 0) + refund;
    tool.count--;
    SaveManager.save(data);
    return true;
  }

  // ── 업그레이드 ──

  /**
   * 도구 업그레이드 가능 여부.
   * @param {string} toolId
   * @returns {boolean}
   */
  static canUpgradeTool(toolId) {
    const def = TOOL_DEFS[toolId];
    if (!def) return false;
    const data = SaveManager.load();
    const tool = (data.tools || {})[toolId] || { count: 0, level: 1 };
    if (tool.count < 1) return false;           // 미보유 시 업그레이드 불가
    if (tool.level >= def.maxLevel) return false;
    const cost = def.upgradeCost[tool.level];    // 다음 레벨 비용
    return (data.gold || 0) >= cost;
  }

  /**
   * 도구 업그레이드. 골드 차감, level+1 (해당 타입 전체 적용).
   * @param {string} toolId
   * @returns {boolean} 성공 여부
   */
  static upgradeTool(toolId) {
    if (!ToolManager.canUpgradeTool(toolId)) return false;
    const def = TOOL_DEFS[toolId];
    const data = SaveManager.load();
    if (!data.tools) data.tools = ToolManager._defaultTools();
    const tool = data.tools[toolId];
    const cost = def.upgradeCost[tool.level];
    data.gold -= cost;
    tool.level++;
    SaveManager.save(data);
    return true;
  }

  /**
   * 다음 업그레이드 비용 조회.
   * @param {string} toolId
   * @returns {number|null} 최대 레벨 시 null
   */
  static getUpgradeCost(toolId) {
    const def = TOOL_DEFS[toolId];
    if (!def) return null;
    const tool = ToolManager.getToolInventory()[toolId] || { level: 1 };
    if (tool.level >= def.maxLevel) return null;
    return def.upgradeCost[tool.level];
  }

  // ── 스탯/유틸 ──

  /**
   * 현재 레벨 기준 도구 스탯 조회.
   * @param {string} toolId
   * @returns {object|null}
   */
  static getToolStats(toolId) {
    const def = TOOL_DEFS[toolId];
    if (!def) return null;
    const tool = ToolManager.getToolInventory()[toolId] || { level: 1 };
    return def.stats[tool.level] || def.stats[1];
  }

  /**
   * 보유 도구가 하나라도 있는지 확인.
   * @returns {boolean}
   */
  static hasAnyTool() {
    const tools = ToolManager.getToolInventory();
    return Object.values(tools).some(t => t.count > 0);
  }

  /**
   * 기본 도구 데이터 생성 (스타터 키트 포함).
   * @returns {Object}
   * @private
   */
  static _defaultTools() {
    return {
      pan:            { count: 4, level: 1 },
      salt:           { count: 0, level: 1 },
      grill:          { count: 0, level: 1 },
      delivery:       { count: 0, level: 1 },
      freezer:        { count: 0, level: 1 },
      soup_pot:       { count: 0, level: 1 },
      // ── Phase 19-1: 시즌 2 도구 ──
      wasabi_cannon:  { count: 0, level: 1 },
      spice_grinder:  { count: 0, level: 1 },
    };
  }
}
