/**
 * @fileoverview Kitchen Chaos Tycoon 게임 진입점(Entry Point).
 * Phaser.Game 인스턴스를 생성하고 모든 씬을 등록한다.
 * Phase 11-3d: 프로덕션 전역 에러 핸들러 추가.
 */

import Phaser from 'phaser';
import { FONT_PADDING_TOP } from './config.js';

// ── 한글 폰트 윗줄 잘림 방지: 모든 Text에 기본 top padding 주입 ──
// 보정값 근거: config.js FONT_PADDING_TOP 참조 (Phase 57-10)
const _origTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  const s = style && typeof style === 'object' ? style : {};
  if (!s.padding) s.padding = {};
  if (s.padding.top === undefined) s.padding.top = FONT_PADDING_TOP;
  return _origTextFactory.call(this, x, y, text, s);
};

import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { ChefSelectScene } from './scenes/ChefSelectScene.js';
import { GatheringScene } from './scenes/GatheringScene.js';
import { EndlessScene } from './scenes/EndlessScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { MerchantScene } from './scenes/MerchantScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { RecipeCollectionScene } from './scenes/RecipeCollectionScene.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { AchievementScene } from './scenes/AchievementScene.js';
import { WanderingChefModal } from './scenes/WanderingChefModal.js';
import { TavernServiceScene } from './scenes/TavernServiceScene.js';
import { NineSliceSandbox } from './devtools/NineSliceSandbox.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';

/**
 * Phaser 게임 설정.
 * @type {Phaser.Types.Core.GameConfig}
 */
const config = {
  type: Phaser.CANVAS,  // Android WebView WebGL 실패 방지 — Canvas2D 강제
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a0a00',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, WorldMapScene, ChefSelectScene, GatheringScene, EndlessScene, TavernServiceScene, ResultScene, MerchantScene, ShopScene, RecipeCollectionScene, DialogueScene, AchievementScene, WanderingChefModal, NineSliceSandbox],
  input: {
    activePointers: 1,
  },
  render: {
    pixelArt: true,    // Phase 9-4: 픽셀 아트 스프라이트 선명도 유지
    antialias: false,
  },
};

/** @type {Phaser.Game} */
const game = new Phaser.Game(config);

// Playwright 테스트에서 게임 인스턴스 접근용
window.__game = game;

// 개발 환경 전용 Dev Helper (프로덕션 빌드에서 트리-쉐이킹으로 제거됨)
if (import.meta.env.DEV) {
  import('./devtools/DevHelper.js');
}

// ── 전역 에러 핸들러 (Phase 11-3d) ──
// 프로덕션에서는 에러를 콘솔에만 로깅하고 사용자에게 노출하지 않는다.

/**
 * 동기 에러 핸들러. 프로덕션에서는 조용히 로깅만 수행한다.
 * @param {string} message
 * @param {string} source
 * @param {number} lineno
 * @param {number} colno
 * @param {Error} error
 * @returns {boolean} 프로덕션에서 true 반환으로 브라우저 기본 에러 표시 억제
 */
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[KitchenChaosTycoon]', message, { source, lineno, colno, error });
  // 프로덕션에서는 에러 오버레이 억제, 개발 환경에서는 기본 동작 유지
  if (import.meta.env.PROD) return true;
  return false;
};

/**
 * 비동기 Promise 거부 핸들러. 프로덕션에서는 조용히 로깅만 수행한다.
 * @param {PromiseRejectionEvent} event
 */
window.onunhandledrejection = (event) => {
  console.error('[KitchenChaosTycoon] Unhandled rejection:', event.reason);
  if (import.meta.env.PROD) {
    event.preventDefault();
  }
};
