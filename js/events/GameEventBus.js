/**
 * @fileoverview 씬 간 공유 이벤트 버스.
 * GameScene과 RestaurantScene이 직접 참조 없이 느슨하게 통신한다.
 */

import Phaser from 'phaser';

/**
 * 전역 이벤트 이미터. 두 씬 간 데이터 교환용.
 *
 * 이벤트 목록:
 * - ingredient_collected  { type, count, isFresh }  Game → Restaurant
 * - wave_started          { waveNum }                Game → Restaurant
 * - wave_cleared          { waveNum }                Game → Restaurant
 * - game_over             { isVictory, score }       Game → Restaurant
 * - gold_earned           { amount, source }         Restaurant → Game
 * - buff_activated        { effectType, effectValue, duration }  Restaurant → Game
 * - buff_expired          {}                         Restaurant → Game
 * - combo_changed         { count }                  Restaurant → Game
 * - serve_success         {}                         Restaurant → Game
 */
export const GameEventBus = new Phaser.Events.EventEmitter();
