/**
 * @fileoverview 스프라이트 에셋 로더.
 * Phaser preload()에서 호출하여 적/보스/타워/셰프/재료 아이콘을 로드한다.
 * Phase 9-4: south 방향 정지 이미지만 우선 로드 (walk 애니메이션은 추후 확장).
 *
 * 키 컨벤션:
 *   적:     enemy_{id}     (예: enemy_carrot_goblin)
 *   보스:   boss_{id}      (예: boss_pasta_boss)
 *   타워:   tower_{id}     (예: tower_pan)
 *   셰프:   chef_{id}      (예: chef_petit_chef)
 *   재료:   ingredient_{id} (예: ingredient_carrot)
 *   타일셋: tileset_{id}    (예: tileset_pasta_field)
 */

// ── 에셋 경로 루트 ──
const SPRITES_ROOT = '/sprites';

// ── 적 ID 목록 (16종) ──
const ENEMY_IDS = [
  'carrot_goblin', 'meat_ogre', 'octopus_mage', 'chili_demon',
  'cheese_golem', 'flour_ghost', 'egg_sprite', 'rice_slime',
  'fish_knight', 'mushroom_scout', 'cheese_rat', 'shrimp_samurai',
  'tomato_bomber', 'butter_ghost', 'sugar_fairy', 'milk_phantom',
];

// ── 보스 ID 목록 (6종) ──
const BOSS_IDS = [
  'pasta_boss', 'dragon_ramen', 'seafood_kraken', 'lava_dessert_golem',
  'master_patissier', 'cuisine_god',
];

// ── 타워 ID 목록 (6종) ──
const TOWER_IDS = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot'];

// ── 셰프 ID 목록 (3종) ──
const CHEF_IDS = ['petit_chef', 'flame_chef', 'ice_chef'];

// ── 재료 파일 매핑 (게임 내 ID → 에셋 파일명) ──
// gameData.js의 INGREDIENT_TYPES ID와 에셋 파일명이 다른 경우를 매핑한다.
const INGREDIENT_FILE_MAP = {
  carrot: 'carrot',
  meat: 'meat',
  squid: 'octopus',    // 게임: squid → 파일: octopus.png
  pepper: 'chili',     // 게임: pepper → 파일: chili.png
  cheese: 'cheese',
  flour: 'flour',
  egg: 'egg',
  rice: 'rice',
  fish: 'fish',
  mushroom: 'mushroom',
  shrimp: 'shrimp',
  tomato: 'tomato',
  butter: 'butter',
  sugar: 'sugar',
  milk: 'milk',
};

// ── 재료 ID 목록 (15종, 게임 내 ID 기준) ──
const INGREDIENT_IDS = Object.keys(INGREDIENT_FILE_MAP);

// ── 타일셋 ID 목록 (6종) ──
const TILESET_IDS = [
  'pasta_field', 'oriental_bamboo', 'seafood_beach', 'volcano_lava',
  'dessert_cafe', 'grand_finale',
];

export class SpriteLoader {
  /**
   * Phaser scene의 preload()에서 호출.
   * 모든 스프라이트 에셋을 로드 큐에 등록한다.
   * @param {Phaser.Scene} scene
   */
  static preload(scene) {
    SpriteLoader._loadEnemies(scene);
    SpriteLoader._loadBosses(scene);
    SpriteLoader._loadTowers(scene);
    SpriteLoader._loadChefs(scene);
    SpriteLoader._loadIngredients(scene);
    SpriteLoader._loadTilesets(scene);
  }

  /**
   * 적 16종 — south 방향 정지 이미지.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadEnemies(scene) {
    for (const id of ENEMY_IDS) {
      scene.load.image(
        `enemy_${id}`,
        `${SPRITES_ROOT}/enemies/${id}/rotations/south.png`
      );
    }
  }

  /**
   * 보스 4종 — south 방향 정지 이미지.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadBosses(scene) {
    for (const id of BOSS_IDS) {
      scene.load.image(
        `boss_${id}`,
        `${SPRITES_ROOT}/bosses/${id}/rotations/south.png`
      );
    }
  }

  /**
   * 타워 6종 — south 방향 정지 이미지.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadTowers(scene) {
    for (const id of TOWER_IDS) {
      scene.load.image(
        `tower_${id}`,
        `${SPRITES_ROOT}/towers/${id}/tower.png`
      );
    }
  }

  /**
   * 셰프 3종 — south 방향 정지 이미지.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadChefs(scene) {
    for (const id of CHEF_IDS) {
      scene.load.image(
        `chef_${id}`,
        `${SPRITES_ROOT}/chefs/${id}/rotations/south.png`
      );
    }
  }

  /**
   * 재료 아이콘 15종 — 단일 PNG.
   * 게임 내 ID(squid, pepper)와 파일명(octopus, chili)이 다른 경우를 매핑.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadIngredients(scene) {
    for (const id of INGREDIENT_IDS) {
      const fileName = INGREDIENT_FILE_MAP[id] || id;
      scene.load.image(
        `ingredient_${id}`,
        `${SPRITES_ROOT}/ingredients/${fileName}.png`
      );
    }
  }

  /**
   * 타일셋 4종 — 스프라이트시트 (32x32 프레임).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadTilesets(scene) {
    for (const id of TILESET_IDS) {
      scene.load.spritesheet(
        `tileset_${id}`,
        `${SPRITES_ROOT}/tilesets/${id}.png`,
        { frameWidth: 32, frameHeight: 32 }
      );
    }
  }

  /**
   * 특정 텍스처 키가 정상 로드되어 있는지 확인.
   * Phaser는 로드 실패 시 __MISSING 텍스처를 대체 등록하므로,
   * 실제 이미지 크기(1x1이 아닌지)를 추가 검증한다.
   * @param {Phaser.Scene} scene
   * @param {string} key - 텍스처 키
   * @returns {boolean}
   */
  static hasTexture(scene, key) {
    if (!scene.textures.exists(key)) return false;
    // __MISSING 텍스처는 보통 32x32 녹색이지만, 키가 등록만 되고
    // 실제 이미지가 없을 수도 있으므로 소스 프레임 크기로 검증
    const tex = scene.textures.get(key);
    const frame = tex.get();
    return frame && frame.width > 1 && frame.height > 1;
  }
}
