/**
 * @fileoverview Kitchen Chaos Defense 게임 진입점(Entry Point).
 * Phaser.Game 인스턴스를 생성하고 모든 씬을 등록한다.
 */

import Phaser from 'phaser';

import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { StageSelectScene } from './scenes/StageSelectScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { ChefSelectScene } from './scenes/ChefSelectScene.js';
import { MarketScene } from './scenes/MarketScene.js';
import { EndlessScene } from './scenes/EndlessScene.js';
import { ServiceScene } from './scenes/ServiceScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { RecipeCollectionScene } from './scenes/RecipeCollectionScene.js';
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
  scene: [BootScene, MenuScene, StageSelectScene, WorldMapScene, ChefSelectScene, MarketScene, EndlessScene, ServiceScene, ResultScene, ShopScene, RecipeCollectionScene],
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
