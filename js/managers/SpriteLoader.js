/**
 * @fileoverview 스프라이트 에셋 로더.
 * Phaser preload()에서 호출하여 적/보스/타워/셰프/재료 아이콘을 로드한다.
 * Phase 9-4: south 방향 정지 이미지만 우선 로드.
 * Phase 12: 적/보스 8방향 걷기 애니메이션 프레임 로드 + Phaser anim 등록.
 * Phase 19-4: 서비스씬 에셋 (테이블 5종, 손님 5종, 바닥, 카운터) 로드.
 *
 * 키 컨벤션:
 *   적:     enemy_{id}     (예: enemy_carrot_goblin)
 *   보스:   boss_{id}      (예: boss_pasta_boss)
 *   걷기:   enemy_{id}_walk_{dir}_{frame} (예: enemy_carrot_goblin_walk_south_0)
 *   타워:   tower_{id}     (예: tower_pan)
 *   셰프:   chef_{id}      (예: chef_petit_chef)
 *   재료:   ingredient_{id} (예: ingredient_carrot)
 *   타일셋: tileset_{id}    (예: tileset_pasta_field)
 *   테이블: table_lv{N}    (예: table_lv0)
 *   손님:   customer_{type} (예: customer_normal)
 *   바닥:   floor_hall
 *   카운터: counter_cooking
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

// ── 타워 ID 목록 (8종, Phase 19-1: wasabi_cannon, spice_grinder 추가) ──
const TOWER_IDS = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];

// ── 셰프 ID 목록 (5종, Phase 19-1: yuki_chef, lao_chef 추가) ──
const CHEF_IDS = ['petit_chef', 'flame_chef', 'ice_chef', 'yuki_chef', 'lao_chef'];

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

// ── 걷기 애니메이션 폴더 해시 맵 (Phase 12) ──
const ENEMY_WALK_HASHES = {
  butter_ghost: 'walking-166fb6f3',
  carrot_goblin: 'walking-012372c9',
  cheese_golem: 'walking-e8ab7eac',
  cheese_rat: 'walking-15884a43',
  chili_demon: 'walking-98c5d521',
  egg_sprite: 'walking-53299222',
  fish_knight: 'walking-32ddc272',
  flour_ghost: 'walking-dafa8589',
  meat_ogre: 'walking-dff9d5bc',
  milk_phantom: 'walking-df77f532',
  mushroom_scout: 'walking-5e4378eb',
  octopus_mage: 'walking-c62120db',
  rice_slime: 'walking-fe48e722',
  shrimp_samurai: 'walking-52be561d',
  sugar_fairy: 'walking-83b51e9e',
  tomato_bomber: 'walking-0dd2efa9',
};

const BOSS_WALK_HASHES = {
  cuisine_god: 'walking-84e4ae22',
  dragon_ramen: 'walking-dcd66668',
  lava_dessert_golem: 'walking-5514895b',
  master_patissier: 'walking-b21b062a',
  pasta_boss: 'walking-49c92768',
  seafood_kraken: 'walking-f85ec5ca',
};

/** 걷기 애니메이션 방향 목록 */
const WALK_DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
/** 걷기 애니메이션 프레임 수 */
const WALK_FRAME_COUNT = 6;

// ── 초상화 ID 목록 (Phase 14-2b, Phase 19-1: yuki, lao 추가) ──
const PORTRAIT_IDS = ['mimi', 'poco', 'rin', 'mage', 'yuki', 'lao'];

// ── 타일셋 ID 목록 (6종) ──
const TILESET_IDS = [
  'pasta_field', 'oriental_bamboo', 'seafood_beach', 'volcano_lava',
  'dessert_cafe', 'grand_finale',
];

// ── 서비스씬 에셋 경로 (Phase 19-4) ──
const SERVICE_ROOT = '/sprites/service';

// ── 테이블 등급 수 ──
const TABLE_GRADE_COUNT = 5; // Lv0 ~ Lv4

// ── 손님 유형 목록 ──
const CUSTOMER_TYPE_IDS = ['normal', 'vip', 'gourmet', 'rushed', 'group'];

export class SpriteLoader {
  /**
   * Phaser scene의 preload()에서 호출.
   * 모든 스프라이트 에셋을 로드 큐에 등록한다.
   * @param {Phaser.Scene} scene
   */
  static preload(scene) {
    SpriteLoader._loadEnemies(scene);
    SpriteLoader._loadBosses(scene);
    SpriteLoader._loadEnemyWalkFrames(scene);
    SpriteLoader._loadBossWalkFrames(scene);
    SpriteLoader._loadTowers(scene);
    SpriteLoader._loadChefs(scene);
    SpriteLoader._loadIngredients(scene);
    SpriteLoader._loadTilesets(scene);
    SpriteLoader._loadPortraits(scene);
    SpriteLoader._loadServiceAssets(scene);
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
   * 적 16종 걷기 애니메이션 프레임 로드 (8방향 x 6프레임).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadEnemyWalkFrames(scene) {
    for (const id of ENEMY_IDS) {
      const hash = ENEMY_WALK_HASHES[id];
      if (!hash) continue;
      for (const dir of WALK_DIRS) {
        for (let f = 0; f < WALK_FRAME_COUNT; f++) {
          const key = `enemy_${id}_walk_${dir}_${f}`;
          const path = `${SPRITES_ROOT}/enemies/${id}/animations/${hash}/${dir}/frame_${String(f).padStart(3, '0')}.png`;
          scene.load.image(key, path);
        }
      }
    }
  }

  /**
   * 보스 6종 걷기 애니메이션 프레임 로드 (8방향 x 6프레임).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadBossWalkFrames(scene) {
    for (const id of BOSS_IDS) {
      const hash = BOSS_WALK_HASHES[id];
      if (!hash) continue;
      for (const dir of WALK_DIRS) {
        for (let f = 0; f < WALK_FRAME_COUNT; f++) {
          const key = `boss_${id}_walk_${dir}_${f}`;
          const path = `${SPRITES_ROOT}/bosses/${id}/animations/${hash}/${dir}/frame_${String(f).padStart(3, '0')}.png`;
          scene.load.image(key, path);
        }
      }
    }
  }

  /**
   * 적/보스 걷기 Phaser 애니메이션을 등록한다.
   * BootScene.create()에서 preload 완료 후 호출해야 한다.
   * @param {Phaser.Scene} scene
   */
  static registerWalkAnimations(scene) {
    const register = (prefix, id) => {
      for (const dir of WALK_DIRS) {
        const animKey = `${prefix}_${id}_walk_${dir}`;
        if (scene.anims.exists(animKey)) continue;
        const frames = [];
        for (let f = 0; f < WALK_FRAME_COUNT; f++) {
          const frameKey = `${prefix}_${id}_walk_${dir}_${f}`;
          if (scene.textures.exists(frameKey)) {
            frames.push({ key: frameKey });
          }
        }
        if (frames.length > 0) {
          scene.anims.create({
            key: animKey,
            frames,
            frameRate: 8,
            repeat: -1,
          });
        }
      }
    };

    for (const id of ENEMY_IDS) register('enemy', id);
    for (const id of BOSS_IDS) register('boss', id);
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
   * 캐릭터 초상화 4종 로드 (Phase 14-2b).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadPortraits(scene) {
    for (const id of PORTRAIT_IDS) {
      scene.load.image(
        `portrait_${id}`,
        `${SPRITES_ROOT}/portraits/portrait_${id}.png`
      );
    }
  }

  /**
   * 서비스씬 에셋 로드 — 테이블 5종, 손님 5종, 바닥, 카운터.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadServiceAssets(scene) {
    // 테이블 Lv0~4 (빈 상태 + 손님 착석 컴포짓)
    for (let lv = 0; lv < TABLE_GRADE_COUNT; lv++) {
      scene.load.image(`table_lv${lv}`, `${SERVICE_ROOT}/table_lv${lv}.png`);
      scene.load.image(`table_lv${lv}_occupied`, `${SERVICE_ROOT}/table_lv${lv}_occupied.png`);
    }
    // 손님 유형별
    for (const type of CUSTOMER_TYPE_IDS) {
      scene.load.image(`customer_${type}`, `${SERVICE_ROOT}/customer_${type}.png`);
    }
    // 홀 바닥 + 카운터
    scene.load.image('floor_hall', `${SERVICE_ROOT}/floor_hall.png`);
    scene.load.image('counter_cooking', `${SERVICE_ROOT}/counter_cooking.png`);
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
