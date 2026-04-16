/**
 * @fileoverview 스프라이트 에셋 로더.
 * Phaser preload()에서 호출하여 적/보스/타워/셰프/재료 아이콘을 로드한다.
 * Phase 9-4: south 방향 정지 이미지만 우선 로드.
 * Phase 12: 적/보스 8방향 걷기 애니메이션 프레임 로드 + Phaser anim 등록.
 * Phase 19-4: 서비스씬 에셋 (테이블 5종, 손님 5종, 바닥, 카운터) 로드.
 * Phase 20: 7장 적 2종(sushi_ninja, tempura_monk), 보스 1종(sake_oni), 타일셋 1종(sakura_izakaya), 재료 2종(sashimi_tuna, wasabi) 추가.
 * Phase 21: 8장 적 3종(dumpling_warrior, mini_dumpling, wok_phantom), 보스 1종(dragon_wok), 타일셋 1종(chinese_palace_kitchen), 재료 2종(tofu, cilantro) 추가.
 * Phase 22-3: 적 2종(sake_specter, oni_minion), 타일셋 1종(izakaya_underground, 16px), 재료 1종(sake) 추가.
 * Phase 25-1: 11장 적 2종(shadow_dragon_spawn, wok_guardian), 타일셋 1종(dragon_lair), 재료 1종(star_anise) 추가.
 * Phase 26-1: sake_master 보스 추가, dragon_wok 스프라이트 교체.
 * Phase 27-2: 13장 적 2종(wine_specter, foie_gras_knight), 타일셋 1종(bistro_parisian), 재료 1종(truffle) 추가.
 * Phase 28-2: 14장 적 2종(cellar_phantom, sommelier_wraith), 타일셋 1종(wine_cellar), 재료 1종(herb_bundle) 추가.
 * Phase 29-1: 15장 보스 1종(chef_noir) 추가.
 * Phase 31-2: 16장 적 2종(curry_djinn, naan_golem), 타일셋 1종(spice_palace), 재료 2종(curry_leaf, saffron) 추가.
 * Phase 32-2: 17장 적 2종(incense_specter, spice_elemental), 타일셋 1종(spice_palace_interior), 재료 1종(chai) 추가.
 * Phase 32-5: 18장 보스 1종(maharaja), 적 1종(masala_guide), 재료 1종(cardamom) 추가.
 * Phase 33-2: 19장 적 2종(taco_bandit, burrito_juggernaut), 타일셋 1종(cactus_cantina), 재료 1종(jalapeno) 추가.
 * Phase 34-2: 20장 적 2종(cactus_wraith, luchador_ghost), 재료 1종(avocado) 추가.
 * Phase 35-2: 21장 보스 1종(el_diablo_pepper) 추가.
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

// ── 적 ID 목록 (39종, Phase 34-2: cactus_wraith, luchador_ghost 추가) ──
const ENEMY_IDS = [
  'carrot_goblin', 'meat_ogre', 'octopus_mage', 'chili_demon',
  'cheese_golem', 'flour_ghost', 'egg_sprite', 'rice_slime',
  'fish_knight', 'mushroom_scout', 'cheese_rat', 'shrimp_samurai',
  'tomato_bomber', 'butter_ghost', 'sugar_fairy', 'milk_phantom',
  'sushi_ninja', 'tempura_monk',
  'dumpling_warrior', 'mini_dumpling', 'wok_phantom',
  'sake_specter', 'oni_minion',
  'shadow_dragon_spawn', 'wok_guardian',  // Phase 25-1
  'wine_specter', 'foie_gras_knight',     // Phase 27-2
  'cellar_phantom', 'sommelier_wraith',   // Phase 28-2
  'curry_djinn', 'naan_golem',            // Phase 31-2 (164px curry_djinn, 120px naan_golem)
  'incense_specter', 'spice_elemental',   // Phase 32-2 (176px/164px, pro)
  'masala_guide',                          // Phase 32-5 (108px, pro)
  'taco_bandit', 'burrito_juggernaut',    // Phase 33-2 (160px/172px, pro)
  'cactus_wraith', 'luchador_ghost',      // Phase 34-2 (216px/252px, pro)
];

// ── 보스 ID 목록 (12종, Phase 35-2: el_diablo_pepper 추가) ──
const BOSS_IDS = [
  'pasta_boss', 'dragon_ramen', 'seafood_kraken', 'lava_dessert_golem',
  'master_patissier', 'cuisine_god',
  'sake_oni',
  'dragon_wok',
  'sake_master',  // Phase 26-1
  'chef_noir',    // Phase 29-1
  'maharaja',     // Phase 32-5
  'el_diablo_pepper', // Phase 35-2
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
  sashimi_tuna: 'sashimi_tuna',
  wasabi: 'wasabi',
  tofu: 'tofu',
  cilantro: 'cilantro',
  sake: 'sake',                            // Phase 22-3
  star_anise: 'star_anise',   // Phase 25-1
  truffle: 'truffle',         // Phase 27-2
  herb_bundle: 'herb_bundle', // Phase 28-2
  curry_leaf: 'curry_leaf',  // Phase 31-2
  saffron: 'saffron',        // Phase 31-2
  chai: 'chai',              // Phase 32-2
  cardamom: 'cardamom',      // Phase 32-5
  jalapeno: 'jalapeno',      // Phase 33-2
  avocado: 'avocado',        // Phase 34-2
};

// ── 재료 ID 목록 (26종, 게임 내 ID 기준) ──
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
  sushi_ninja: null,    // PixelLab 생성 후 hash 기입
  tempura_monk: null,   // PixelLab 생성 후 hash 기입
  dumpling_warrior: 'animating-1e8cfa3d',  // Phase 21
  mini_dumpling: 'animating-8123f320',     // Phase 21
  wok_phantom: 'animating-4a4ef775',       // Phase 21
  sake_specter: 'walking-e2f2a098',        // Phase 22-3
  oni_minion:   'walking-3d25e8be',        // Phase 22-3
  shadow_dragon_spawn: 'walking-dde29672',  // Phase 25-2
  wok_guardian: 'walking-bc1aca17',         // Phase 25-2
  wine_specter: 'animating-aaf41951',      // Phase 27-2 (92px, chibi)
  foie_gras_knight: 'animating-d9b31bcd', // Phase 27-2 (92px, chibi)
  cellar_phantom: 'animating-387abc3e',   // Phase 28-2 (92px, chibi)
  sommelier_wraith: 'animating-7cb39ccd', // Phase 28-2 (92px, chibi)
  curry_djinn: 'animating-c40a2ab6',      // Phase 31-2 (164px, chibi)
  naan_golem: 'animating-33505870',       // Phase 31-2 (120px, chibi)
  incense_specter: 'animating-7f60bab8',  // Phase 32-2 (176px, pro)
  spice_elemental: 'animating-6e040724',  // Phase 32-2 (164px, pro)
  masala_guide: 'animating-3594d863',     // Phase 32-5 (108px, pro)
  taco_bandit: 'animating-a8a759af',      // Phase 33-2 (160px, pro)
  burrito_juggernaut: 'animating-ca0e68fa', // Phase 33-2 (172px, pro)
  cactus_wraith: 'animating-377c9fa7',    // Phase 34-2 (216px, pro)
  luchador_ghost: 'animating-0469ac97',  // Phase 34-2 (252px, pro)
};

const BOSS_WALK_HASHES = {
  cuisine_god: 'walking-84e4ae22',
  dragon_ramen: 'walking-dcd66668',
  lava_dessert_golem: 'walking-5514895b',
  master_patissier: 'walking-b21b062a',
  pasta_boss: 'walking-49c92768',
  seafood_kraken: 'walking-f85ec5ca',
  sake_oni: 'walking-9fa1ac06',  // Phase 23-1
  dragon_wok: 'animating-30e6c64f',     // Phase 26-1 신규 스프라이트 (기존 animating-8efd2218 교체)
  sake_master: 'animating-8d3d020e',   // Phase 26-1 신규
  chef_noir: 'animating-96100c0f',     // Phase 29-1 (pro 모드, 124px canvas)
  maharaja: 'animating-2c666ada',     // Phase 32-5 (pro 모드, 212px canvas)
  el_diablo_pepper: 'walking-acae25f3', // Phase 35-2 (pro 모드, 116px canvas)
};

/** 걷기 애니메이션 방향 목록 */
const WALK_DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
/** 걷기 애니메이션 프레임 수 */
const WALK_FRAME_COUNT = 6;

// ── 초상화 ID 목록 (Phase 14-2b, Phase 19-1: yuki, lao 추가, Phase 27-1: andre, Phase 32-4: arjun 추가) ──
const PORTRAIT_IDS = ['mimi', 'poco', 'rin', 'mage', 'yuki', 'lao', 'andre', 'masala_guide'];

// ── 타일셋 ID 목록 (15종, Phase 33-2: cactus_cantina 추가) ──
const TILESET_IDS = [
  'pasta_field', 'oriental_bamboo', 'seafood_beach', 'volcano_lava',
  'dessert_cafe', 'grand_finale',
  'sakura_izakaya',
  'chinese_palace_kitchen',
  'izakaya_underground',
  'dragon_lair',          // Phase 25-1
  'bistro_parisian',      // Phase 27-2
  'wine_cellar',          // Phase 28-2
  'spice_palace',         // Phase 31-2
  'spice_palace_interior',  // Phase 32-2
  'cactus_cantina',         // Phase 33-2
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
   * 타일셋 스프라이트시트 로드.
   * 기본 frameWidth: 32, frameHeight: 32.
   * izakaya_underground는 예외적으로 16×16 타일 (Phase 22-3).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadTilesets(scene) {
    // izakaya_underground는 16×16 타일 (Phase 22-2 PixelLab 생성 결과)
    const TILESET_16PX = new Set(['izakaya_underground']);

    for (const id of TILESET_IDS) {
      const frameSize = TILESET_16PX.has(id) ? 16 : 32;
      scene.load.spritesheet(
        `tileset_${id}`,
        `${SPRITES_ROOT}/tilesets/${id}.png`,
        { frameWidth: frameSize, frameHeight: frameSize }
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
    // Phase 19-6: 홀 배경 데코 에셋
    scene.load.image('wall_back',     `${SERVICE_ROOT}/wall_back.png`);
    scene.load.image('decor_plant',   `${SERVICE_ROOT}/decor_plant.png`);
    scene.load.image('entrance_arch', `${SERVICE_ROOT}/entrance_arch.png`);
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
