/**
 * @fileoverview Kitchen Chaos Defense 게임 진입점(Entry Point).
 * Phaser.Game 인스턴스를 생성하고 모든 씬을 등록한다.
 */

import Phaser from 'phaser';

import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { StageSelectScene } from './scenes/StageSelectScene.js';
import { ChefSelectScene } from './scenes/ChefSelectScene.js';
import { MarketScene } from './scenes/MarketScene.js';
import { RestaurantScene } from './scenes/RestaurantScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
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
  scene: [BootScene, MenuScene, StageSelectScene, ChefSelectScene, MarketScene, RestaurantScene, GameOverScene, ShopScene, RecipeCollectionScene],
  input: {
    activePointers: 1,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

/** @type {Phaser.Game} */
const game = new Phaser.Game(config);

// Playwright 테스트에서 게임 인스턴스 접근용
window.__game = game;
