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
 * Phase 36-2: 22장 적 2종(candy_soldier, cake_witch), 재료 2종(cacao, vanilla) 추가.
 * Phase 37-1: 23장 적 2종(macaron_knight, sugar_specter), 재료 1종(cream) 추가.
 * Phase 38-1: 24장 보스 1종(queen_of_taste, 3페이즈) 추가. BOSS_WALK_HASHES에 queen_of_taste 3종 등록.
 * Phase 47-1: death 애니메이션 프레임 로드 + Phaser anim 등록 시스템 추가.
 * Phase 47-2: 보스 13종 death 애니메이션 프레임 로드 + Phaser anim 등록 시스템 추가.
 * Phase 51-4: 챕터별 홀 바닥 타일 8종 + 뒷벽 8종 추가 로드 (SERVICE_ROOT/floor_hall_*.png, wall_back_*.png).
 * Phase 76: 손님 프로필 10종(기존 5종 + 신규 5종) × 2상태 preload로 확장.
 *
 * 키 컨벤션:
 *   적:     enemy_{id}     (예: enemy_carrot_goblin)
 *   보스:   boss_{id}      (예: boss_pasta_boss)
 *   걷기:   enemy_{id}_walk_{dir}_{frame} (예: enemy_carrot_goblin_walk_south_0)
 *   사망:   enemy_{id}_death_{dir}_{frame} (예: enemy_carrot_goblin_death_south_0)
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

// ── 적 ID 목록 (43종, Phase 37-1: macaron_knight, sugar_specter 추가) ──
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
  'candy_soldier', 'cake_witch',           // Phase 36-2 (22장 슈가 드림랜드)
  'macaron_knight', 'sugar_specter',       // Phase 37-1 (23장 드림랜드 심층부, 64px standard)
];

// ── 보스 ID 목록 (13종, Phase 38-1: queen_of_taste 추가) ──
const BOSS_IDS = [
  'pasta_boss', 'dragon_ramen', 'seafood_kraken', 'lava_dessert_golem',
  'master_patissier', 'cuisine_god',
  'sake_oni',
  'dragon_wok',
  'sake_master',  // Phase 26-1
  'chef_noir',    // Phase 29-1
  'maharaja',     // Phase 32-5
  'el_diablo_pepper', // Phase 35-2
  'queen_of_taste',   // Phase 38-1
  'oni_herald',       // Phase 53: 미니보스 (isMidBoss=true), boss prefix 경로 사용
];

// ── 타워 ID 목록 (8종, Phase 19-1: wasabi_cannon, spice_grinder 추가) ──
const TOWER_IDS = ['pan', 'salt', 'grill', 'delivery', 'freezer', 'soup_pot', 'wasabi_cannon', 'spice_grinder'];

// ── 셰프 ID 목록 (7종, Phase 56: Named 동료 7종으로 갱신) ──
const CHEF_IDS = ['mimi_chef', 'rin_chef', 'mage_chef', 'yuki_chef', 'lao_chef', 'andre_chef', 'arjun_chef'];

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
  cacao: 'cacao',            // Phase 36-2
  vanilla: 'vanilla',        // Phase 36-2
  cream: 'cream',            // Phase 37-1
};

// ── 재료 ID 목록 (32종, Phase 37-1: cream 추가) ──
const INGREDIENT_IDS = Object.keys(INGREDIENT_FILE_MAP);

// ── 걷기 애니메이션 폴더 해시 맵 (Phase 12) ──
const ENEMY_WALK_HASHES = {
  butter_ghost: 'walking-26dbc106',     // Phase 58: 92px (구: walking-166fb6f3 48px)
  carrot_goblin: 'walking-6def8c8c',  // Phase 58: 92px 리뉴얼 (구: walking-012372c9 48px)
  cheese_golem: 'walking-2047818a',  // Phase 58: 92px 리뉴얼 (구: walking-e8ab7eac 48px)
  cheese_rat: 'walking-b6028e43',       // Phase 58: 92px (구: walking-15884a43 48px)
  chili_demon: 'walking-a04147cb',  // Phase 58: 92px 리뉴얼 (구: walking-98c5d521 48px)
  egg_sprite: 'walking-bc2a5aed',  // Phase 58: 92px 리뉴얼 (구: walking-53299222 48px)
  fish_knight: 'walking-8f7c23b3',  // Phase 58: 92px 리뉴얼 (구: walking-32ddc272 48px)
  flour_ghost: 'walking-79d3f8e7',  // Phase 58: 92px 리뉴얼 (구: walking-dafa8589 48px)
  meat_ogre: 'walking-2bffc631',  // Phase 58: 92px 리뉴얼 (구: walking-dff9d5bc 48px)
  milk_phantom: 'walking-126cf281',     // Phase 58: 92px (구: walking-df77f532 48px)
  mushroom_scout: 'walking-c6b60e14',   // Phase 58: 92px (구: walking-5e4378eb 48px)
  octopus_mage: 'walking-6fb8c0e7',  // Phase 58: 92px 리뉴얼 (구: walking-c62120db 48px)
  rice_slime: 'walking-a2fc069d',  // Phase 58: 92px 리뉴얼 (구: walking-fe48e722 48px)
  shrimp_samurai: 'walking-bfaf160f',   // Phase 58: 92px (구: walking-52be561d 48px)
  sugar_fairy: 'walking-5af6b5c3',      // Phase 58: 92px (구: walking-83b51e9e 48px)
  tomato_bomber: 'walking-55ce69da',    // Phase 58: 92px (구: walking-0dd2efa9 48px)
  sushi_ninja:          'walking-73e8aef5',   // Phase 47-3
  tempura_monk:         'walking-aaf52389',   // Phase 47-3
  dumpling_warrior: 'walking-13c0cc26',    // Phase 58: 92px (구: animating-1e8cfa3d 48px)
  mini_dumpling: 'animating-8123f320',     // Phase 21
  wok_phantom: 'walking-42e907ce',         // Phase 59-4: 새 ZIP (구: walking-ca9d64ee)
  sake_specter: 'walking-61116124',        // Phase 58: 92px (구: walking-e2f2a098 68px)
  oni_minion:   'walking-cedb398e',        // Phase 58: 92px (구: walking-3d25e8be 68px)
  shadow_dragon_spawn: 'animating-3f6fab85',  // Phase 59-4: 새 ZIP (구: walking-dde29672)
  wok_guardian: 'animating-31e2e54f',         // Phase 59-4: 새 ZIP (구: walking-bc1aca17)
  wine_specter: 'animating-01bb6261',      // Phase 59-4: 새 ZIP (구: animating-aaf41951)
  foie_gras_knight: 'animating-0fa59ad7', // Phase 59-4: 새 ZIP (구: animating-d9b31bcd)
  cellar_phantom: 'animating-bbac58ec',   // Phase 59-4: 새 ZIP (구: animating-387abc3e)
  sommelier_wraith: 'animating-8a174a13', // Phase 59-4: 새 ZIP (구: animating-7cb39ccd)
  curry_djinn: 'animating-57b6ea42',      // Phase 59-4: 새 ZIP (구: animating-c40a2ab6)
  naan_golem: 'animating-9c73b120',       // Phase 59-4: 새 ZIP (구: animating-33505870)
  incense_specter: 'walking-6d4f930d',    // Phase 58: 92px 리뉴얼 (구: animating-7f60bab8 176px)
  spice_elemental: 'walking-201cc29e',    // Phase 58: 92px 리뉴얼 (구: animating-6e040724 164px)
  masala_guide: 'animating-0c482b82',     // Phase 59-4: 새 ZIP (구: animating-3594d863)
  taco_bandit: 'animating-56e93148',      // Phase 59-4: 새 ZIP (구: animating-a8a759af)
  burrito_juggernaut: 'animating-95c9c6c4', // Phase 59-4: 새 ZIP (구: animating-ca0e68fa)
  cactus_wraith: 'animating-e8f6f2da',    // Phase 59-4: 새 ZIP (구: animating-377c9fa7)
  luchador_ghost: 'animating-bd76c5a1',  // Phase 59-4: 새 ZIP (구: animating-0469ac97)
  candy_soldier: 'animating-fd901db6',     // Phase 59-4: 새 ZIP (구: walking-4afaa9df)
  cake_witch: 'animating-739689cb',        // Phase 59-4: 새 ZIP (구: walking-076ead3d)
  macaron_knight: 'walking-532f38a1',    // Phase 47-3
  sugar_specter:  'walking-2cf239b9',    // Phase 47-3
};

// ── 보스 death 애니메이션 폴더 해시 맵 (Phase 47-2) ──
// 에셋 생성(PixelLab AD 모드1) 및 AD 모드2 승인 후 hash를 기입한다.
// 미기입(null) 보스는 로드/등록 시 skip — 즉시 제거로 fallback.
const BOSS_DEATH_HASHES = {
  pasta_boss:          'falling_backward-91a21a29',
  dragon_ramen:        'falling_backward-dfb179e6',
  seafood_kraken:      'falling_backward-30586cf0',
  lava_dessert_golem:  'falling_backward-7eea5222',
  master_patissier:    'falling_backward-a4ffe1ee',
  cuisine_god:         'falling_backward-217e6c2f',
  sake_oni:            'falling_backward-d9bee694',
  dragon_wok:          'falling_backward-13405143',
  sake_master:         'falling_backward-a0f9a5fe',
  chef_noir:           'falling_backward-bec39063',
  maharaja:            'falling_backward-7da945c4',
  el_diablo_pepper:    'falling_backward-7f8bea1c',
  queen_of_taste:      'falling_backward-7bf0791d',
  oni_herald:          'falling_backward-8387b83c',  // Phase 53: 미니보스 death
};

const BOSS_WALK_HASHES = {
  cuisine_god: 'animating-a4934f99',  // Phase 59-4: 새 ZIP (구: walking-a3de1caf)
  dragon_ramen: 'animating-9d38e07f', // Phase 59-4: 새 ZIP (구: walking-dcd66668)
  lava_dessert_golem: 'animating-716b746e', // Phase 59-4: 새 ZIP (구: walking-5514895b)
  master_patissier: 'animating-911ef277',   // Phase 59-4: 새 ZIP (구: walking-b21b062a)
  pasta_boss: 'animating-f3dd488a',         // Phase 59-4: 새 ZIP (구: walking-49c92768)
  seafood_kraken: 'animating-a59183f6',     // Phase 59-4: 새 ZIP (구: walking-f85ec5ca)
  sake_oni: 'walking-910cce10',  // Phase 47-3
  dragon_wok: 'animating-45def3b2',     // Phase 59-4: 새 ZIP (구: animating-30e6c64f)
  sake_master: 'animating-72975717',    // Phase 59-4: 새 ZIP (구: animating-8d3d020e)
  chef_noir: 'animating-b1abb9f5',      // Phase 59-4: 새 ZIP (구: animating-96100c0f)
  maharaja: 'animating-4971401e',       // Phase 59-4: 새 ZIP (구: animating-2c666ada)
  el_diablo_pepper: 'animating-546539e4', // Phase 59-4: 새 ZIP (구: walking-acae25f3)
  // Phase 38-1: queen_of_taste 3페이즈 스프라이트 (136px/116px/112px canvas)
  queen_of_taste:   'walking-d0fa0cc7',  // Phase 47-3
  oni_herald:       'walking-7ae1e13e',   // Phase 53: 미니보스 walk (92x92px)
  queen_of_taste_2: 'walking-131877f4',  // Phase 47-4 (116x116px canvas)
  queen_of_taste_3: 'walking-30ddc8c8',  // Phase 47-4 (112x112px canvas)
};

/** 걷기 애니메이션 방향 목록 */
const WALK_DIRS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
/** 걷기 애니메이션 프레임 수 */
const WALK_FRAME_COUNT = 6;

/**
 * Phase 63 FIX-15: 일부 적의 특정 방향 walk 프레임이 PixelLab 생성에서 누락된 경우,
 * 로드를 스킵하고 인접 방향으로 폴백한다. (콘솔 404 에러 13건 방지)
 * 각 값은 폴백 방향. 추후 누락 에셋이 추가되면 항목 삭제.
 */
const ENEMY_WALK_MISSING = {
  sugar_fairy: { 'south-east': 'east' },
  wok_phantom: { 'south-west': 'west' },
};

// ── death 애니메이션 폴더 해시 맵 (Phase 47-1~47-3) ──
// walk hash와 별도 관리. AD 모드2 승인 후 hash를 기입한다.
const ENEMY_DEATH_HASHES = {
  carrot_goblin:       'falling_backward-10a27983',  // Phase 47-1 파일럿
  // Phase 47-3: 일반 적 41종
  meat_ogre:           'falling_backward-3b46da94',  // Phase 58: 92px (구: falling_backward-1dcb3925 48px)
  octopus_mage:        'falling_backward-75908049',  // Phase 58: 92px (구: falling_backward-a5626f46 48px)
  chili_demon:         'falling_backward-e859c003',  // Phase 58: 92px (구: falling_backward-238579d1 48px)
  cheese_golem:        'falling_backward-d87e9476',  // Phase 58: 92px (구: falling_backward-f870b6a3 48px)
  flour_ghost:         'falling_backward-bb34e07c',  // Phase 58: 92px (구: falling_backward-8e782eea 48px)
  egg_sprite:          'falling_backward-e832ce75',  // Phase 58: 92px (구: falling_backward-01e1a20f 48px)
  rice_slime:          'falling_backward-61da2fd9',  // Phase 58: 92px (구: falling_backward-b01cd02f 48px)
  fish_knight:         'falling_backward-fad77daa',  // Phase 58: 92px (구: falling_backward-070b26eb 48px)
  mushroom_scout:      'falling_backward-eb8ca6ee',  // Phase 58: 92px (구: falling_backward-3144afe7 48px)
  cheese_rat:          'falling_backward-866abb6f',  // Phase 58: 92px (구: falling_backward-ebbb6c57 48px)
  shrimp_samurai:      'falling_backward-01bb1d13',  // Phase 58: 92px (구: falling_backward-bec5dc6a 48px)
  tomato_bomber:       'falling_backward-f0d2aa6d',  // Phase 58: 92px (구: falling_backward-b04b417e 48px)
  butter_ghost:        'falling_backward-19badcb6',  // Phase 58: 92px (구: falling_backward-1199988e 48px)
  sugar_fairy:         'falling_backward-af88a469',  // Phase 58: 92px (구: falling_backward-cd70b305 48px)
  milk_phantom:        'falling_backward-b5f212bc',  // Phase 58: 92px (구: falling_backward-5cfc354e 48px)
  sushi_ninja:         'falling_backward-036fb035',
  tempura_monk:        'falling_backward-ea0f855c',
  dumpling_warrior:    'falling_backward-0344be11',  // Phase 58: 92px (구: falling_backward-5adb5411 48px)
  mini_dumpling:       'falling_backward-254f2d4c',
  wok_phantom:         'falling_backward-be00fd6f',  // Phase 58: 92px (구: falling_backward-fcb57ede 48px)
  sake_specter:        'falling_backward-f030d5f0',  // Phase 58: 92px (구: falling_backward-5ec8cea7 68px)
  oni_minion:          'falling_backward-91d3d636',  // Phase 58: 92px (구: falling_backward-b07d776d 68px)
  shadow_dragon_spawn: 'falling_backward-ba7cab6b',
  wok_guardian:        'falling_backward-b8766bba',
  wine_specter:        'falling_backward-01346db3',
  foie_gras_knight:    'falling_backward-e5db70f7',
  cellar_phantom:      'falling_backward-90fd913d',
  sommelier_wraith:    'falling_backward-85b3115e',
  curry_djinn:         'falling_backward-43dd0623',
  naan_golem:          'falling_backward-a4d544a1',
  incense_specter:     'falling_backward-76eecf73',
  spice_elemental:     'falling_backward-96fa0264',
  masala_guide:        'falling_backward-a14b001f',
  taco_bandit:         'falling_backward-894b20e3',
  burrito_juggernaut:  'falling_backward-debe07a7',
  cactus_wraith:       'falling_backward-0e691e8a',
  luchador_ghost:      'falling_backward-92e75030',
  candy_soldier:       'falling_backward-f539198c',
  cake_witch:          'falling_backward-247afbee',
  macaron_knight:      'falling_backward-013fd96c',
  sugar_specter:       'falling_backward-129e3534',
};

/** death 방향 목록 (4방향 기본, PixelLab 생성 결과에 따라 8방향으로 확장 가능) */
const DEATH_DIRS = ['south', 'north', 'east', 'west'];
/** death 방향 폴백 매핑 (8방향 요청 시 4방향 에셋으로 매핑) */
const DEATH_DIR_FALLBACK = {
  'south-east': 'south',
  'south-west': 'south',
  'north-east': 'north',
  'north-west': 'north',
};
/** death 애니메이션 프레임 수 (falling-back-death 템플릿 기준 7프레임) */
const DEATH_FRAME_COUNT = 7;

// ── 초상화 ID 목록 (Phase 14-2b, Phase 19-1: yuki, lao 추가, Phase 27-1: andre, Phase 32-4: masala_guide, Phase 57: arjun 추가) ──
const PORTRAIT_IDS = ['mimi', 'poco', 'rin', 'mage', 'yuki', 'lao', 'andre', 'arjun'];

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

// ── 손님 프로필 ID 목록 (Phase 76: 10종 확장) ──
const CUSTOMER_PROFILE_IDS = [
  'normal', 'vip', 'gourmet', 'rushed', 'group',            // 기존 5종
  'critic', 'regular', 'student', 'traveler', 'business',   // 신규 5종 (Phase 76)
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
    SpriteLoader._loadEnemyWalkFrames(scene);
    SpriteLoader._loadEnemyDeathFrames(scene);  // Phase 47-1
    SpriteLoader._loadBossWalkFrames(scene);
    SpriteLoader._loadBossDeathFrames(scene);  // Phase 47-2
    SpriteLoader._loadTowers(scene);
    SpriteLoader._loadChefs(scene);
    SpriteLoader._loadIngredients(scene);
    SpriteLoader._loadTilesets(scene);
    SpriteLoader._loadPortraits(scene);
    SpriteLoader._loadServiceAssets(scene);
    SpriteLoader._loadUIIcons(scene);           // Phase 57-2
    SpriteLoader._loadChapterIcons(scene);      // Phase 57-4
  }

  /**
   * HUD·UI 아이콘 (Phase 57-2).
   * Phase 58-2: 행상인 분기 카드 카테고리 배지 4종 추가.
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadUIIcons(scene) {
    scene.load.image('icon_gold',  'assets/ui/icon_gold.png');
    scene.load.image('icon_heart', 'assets/ui/icon_heart.png');
    // ── Phase 58-2: 행상인 분기 카드 배지 아이콘 4종 ──
    scene.load.image('badge_mutation', 'assets/ui/branch_badge_mutation.png');
    scene.load.image('badge_recipe',   'assets/ui/branch_badge_recipe.png');
    scene.load.image('badge_bond',     'assets/ui/branch_badge_bond.png');
    scene.load.image('badge_blessing', 'assets/ui/branch_badge_blessing.png');
  }

  /**
   * 월드맵 챕터 노드 아이콘 13종 (Phase 57-4).
   * ch1~ch12, ch14 (ch13/ch15+ 플레이스홀더는 제외).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadChapterIcons(scene) {
    const ids = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8','ch9','ch10','ch11','ch12','ch14'];
    for (const id of ids) {
      scene.load.image(`chapter_icon_${id}`, `assets/ui/chapter-icons/chapter_icon_${id}.png`);
    }
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
    // Phase 38-1: queen_of_taste 페이즈 2/3 정지 이미지 별도 로드
    const QOT_PHASE_STATICS = ['queen_of_taste_2', 'queen_of_taste_3'];
    for (const phaseId of QOT_PHASE_STATICS) {
      scene.load.image(
        `boss_${phaseId}`,
        `${SPRITES_ROOT}/bosses/${phaseId}/rotations/south.png`
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
      const missing = ENEMY_WALK_MISSING[id] || {};
      for (const dir of WALK_DIRS) {
        // Phase 63 FIX-15: 누락된 방향은 로드 스킵 → registerWalkAnimations에서 폴백 애니메이션 복제
        if (missing[dir]) continue;
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
      if (!hash || hash.startsWith('TBD')) continue;  // AD 완료 전 skip
      for (const dir of WALK_DIRS) {
        for (let f = 0; f < WALK_FRAME_COUNT; f++) {
          const key = `boss_${id}_walk_${dir}_${f}`;
          const path = `${SPRITES_ROOT}/bosses/${id}/animations/${hash}/${dir}/frame_${String(f).padStart(3, '0')}.png`;
          scene.load.image(key, path);
        }
      }
    }
    // Phase 38-1: queen_of_taste 페이즈 2/3 걷기 애니메이션 별도 로딩
    const QOT_PHASE_SPRITES = ['queen_of_taste_2', 'queen_of_taste_3'];
    for (const phaseId of QOT_PHASE_SPRITES) {
      const hash = BOSS_WALK_HASHES[phaseId];
      if (!hash || hash.startsWith('TBD')) continue;  // AD 완료 전 skip
      for (const dir of WALK_DIRS) {
        for (let f = 0; f < WALK_FRAME_COUNT; f++) {
          const key = `boss_${phaseId}_walk_${dir}_${f}`;
          const path = `${SPRITES_ROOT}/bosses/${phaseId}/animations/${hash}/${dir}/frame_${String(f).padStart(3, '0')}.png`;
          scene.load.image(key, path);
        }
      }
    }
  }

  /**
   * 보스 death 애니메이션 프레임 로드.
   * BOSS_DEATH_HASHES에 등록된 boss_id에 한해 로드.
   * 미등록(null) 시 스킵 (기존 정지 프레임 유지).
   * 에셋 경로: sprites/bosses/{id}/animations/{hash}/{dir}/frame_NNN.png
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadBossDeathFrames(scene) {
    for (const id of BOSS_IDS) {
      const hash = BOSS_DEATH_HASHES[id];
      if (!hash) continue;
      for (const dir of DEATH_DIRS) {
        for (let f = 0; f < DEATH_FRAME_COUNT; f++) {
          const key = `boss_${id}_death_${dir}_${f}`;
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

    // Phase 63 FIX-15: 누락 방향 → 폴백 방향의 애니메이션을 동일 키로 복제
    for (const [id, fallbacks] of Object.entries(ENEMY_WALK_MISSING)) {
      for (const [missingDir, fallbackDir] of Object.entries(fallbacks)) {
        const missingKey = `enemy_${id}_walk_${missingDir}`;
        const fallbackKey = `enemy_${id}_walk_${fallbackDir}`;
        if (scene.anims.exists(missingKey)) continue;
        const fallbackAnim = scene.anims.get(fallbackKey);
        if (!fallbackAnim) continue;
        scene.anims.create({
          key: missingKey,
          frames: fallbackAnim.frames.map(fr => ({ key: fr.textureKey })),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
    // Phase 38-1: queen_of_taste 페이즈 2/3 Phaser 애니메이션 등록
    for (const phaseId of ['queen_of_taste_2', 'queen_of_taste_3']) {
      if (!BOSS_WALK_HASHES[phaseId] || BOSS_WALK_HASHES[phaseId].startsWith('TBD')) continue;
      register('boss', phaseId);
    }
  }

  /**
   * 적 death 애니메이션 프레임 로드.
   * ENEMY_DEATH_HASHES에 등록된 enemy_id에 한해 로드.
   * 미등록 시 스킵 (기존 정지 프레임 유지).
   * @param {Phaser.Scene} scene
   * @private
   */
  static _loadEnemyDeathFrames(scene) {
    for (const id of ENEMY_IDS) {
      const hash = ENEMY_DEATH_HASHES[id];
      if (!hash) continue;
      for (const dir of DEATH_DIRS) {
        for (let f = 0; f < DEATH_FRAME_COUNT; f++) {
          const key = `enemy_${id}_death_${dir}_${f}`;
          const path = `${SPRITES_ROOT}/enemies/${id}/animations/${hash}/${dir}/frame_${String(f).padStart(3, '0')}.png`;
          scene.load.image(key, path);
        }
      }
    }
  }

  /**
   * 적 death Phaser 애니메이션을 등록한다.
   * BootScene.create()에서 registerWalkAnimations() 직후 호출해야 한다.
   * repeat: 0 (1회 재생). frameRate: 8.
   * @param {Phaser.Scene} scene
   */
  static registerDeathAnimations(scene) {
    for (const id of ENEMY_IDS) {
      if (!ENEMY_DEATH_HASHES[id]) continue;
      for (const dir of DEATH_DIRS) {
        const animKey = `enemy_${id}_death_${dir}`;
        if (scene.anims.exists(animKey)) continue;
        const frames = [];
        for (let f = 0; f < DEATH_FRAME_COUNT; f++) {
          const frameKey = `enemy_${id}_death_${dir}_${f}`;
          if (scene.textures.exists(frameKey)) {
            frames.push({ key: frameKey });
          }
        }
        if (frames.length > 0) {
          scene.anims.create({
            key: animKey,
            frames,
            frameRate: 8,
            repeat: 0,  // 1회 재생 후 정지
          });
        }
      }
    }
  }

  /**
   * 보스 death Phaser 애니메이션을 등록한다.
   * BootScene.create()에서 registerDeathAnimations() 직후 호출해야 한다.
   * repeat: 0 (1회 재생). frameRate: 8.
   * queen_of_taste_2, queen_of_taste_3 death는 Phase 47-3 이후 별도 추가.
   * @param {Phaser.Scene} scene
   */
  static registerBossDeathAnimations(scene) {
    for (const id of BOSS_IDS) {
      if (!BOSS_DEATH_HASHES[id]) continue;
      for (const dir of DEATH_DIRS) {
        const animKey = `boss_${id}_death_${dir}`;
        if (scene.anims.exists(animKey)) continue;
        const frames = [];
        for (let f = 0; f < DEATH_FRAME_COUNT; f++) {
          const frameKey = `boss_${id}_death_${dir}_${f}`;
          if (scene.textures.exists(frameKey)) {
            frames.push({ key: frameKey });
          }
        }
        if (frames.length > 0) {
          scene.anims.create({
            key: animKey,
            frames,
            frameRate: 8,
            repeat: 0,  // 1회 재생 후 정지
          });
        }
      }
    }
  }

  /**
   * 특정 id + 방향에 대한 death 애니메이션이 등록되어 있는지 확인.
   * 폴백 방향(south-east -> south 등)도 체크한다.
   * @param {Phaser.Scene} scene
   * @param {string} id - enemy_id 또는 boss_id
   * @param {string} dir - 방향 문자열
   * @param {string} [prefix='enemy'] - 'enemy' 또는 'boss'
   * @returns {{ exists: boolean, resolvedDir: string }}
   */
  static hasDeathAnim(scene, id, dir, prefix = 'enemy') {
    const directKey = `${prefix}_${id}_death_${dir}`;
    if (scene.anims.exists(directKey)) {
      return { exists: true, resolvedDir: dir };
    }
    const fallbackDir = DEATH_DIR_FALLBACK[dir];
    if (fallbackDir) {
      const fallbackKey = `${prefix}_${id}_death_${fallbackDir}`;
      if (scene.anims.exists(fallbackKey)) {
        return { exists: true, resolvedDir: fallbackDir };
      }
    }
    return { exists: false, resolvedDir: dir };
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
    // Phase 52: 테이블 앞/뒤 분리 에셋 (3레이어 렌더링)
    for (let lv = 0; lv < TABLE_GRADE_COUNT; lv++) {
      scene.load.image(`table_lv${lv}_back`,  `${SERVICE_ROOT}/table_lv${lv}_back.png`);
      scene.load.image(`table_lv${lv}_front`, `${SERVICE_ROOT}/table_lv${lv}_front.png`);
    }
    // Phase 52+: 테이블+손님 통합 복합 이미지 (waiting/seated 상태별)
    for (let lv = 0; lv < TABLE_GRADE_COUNT; lv++) {
      scene.load.image(`table_lv${lv}_waiting`, `${SERVICE_ROOT}/table_lv${lv}_waiting.png`);
      scene.load.image(`table_lv${lv}_seated`,  `${SERVICE_ROOT}/table_lv${lv}_seated.png`);
    }
    // 손님 프로필별 정지 이미지 (레거시 키, 폴백용 유지)
    // Phase 76 신규 5종(critic, regular, student, traveler, business)은
    // 독립 프로필 이미지가 없으므로 기존 5종만 로드
    const LEGACY_PROFILE_IDS = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
    for (const id of LEGACY_PROFILE_IDS) {
      scene.load.image(`customer_${id}`, `${SERVICE_ROOT}/customer_${id}.png`);
    }
    // Phase 52+: 손님 독립 스프라이트 (waiting/seated 2상태) — Phase 76: 10종 × 2상태 = 20키
    const CUST_STATES = ['waiting', 'seated'];
    for (const id of CUSTOMER_PROFILE_IDS) {
      for (const state of CUST_STATES) {
        scene.load.image(`customer_${id}_${state}`, `${SERVICE_ROOT}/customer_${id}_${state}.png`);
      }
    }
    // 홀 바닥 + 카운터
    scene.load.image('floor_hall', `${SERVICE_ROOT}/floor_hall.png`);
    scene.load.image('counter_cooking', `${SERVICE_ROOT}/counter_cooking.png`);
    // Phase 19-6: 홀 배경 데코 에셋
    scene.load.image('wall_back',     `${SERVICE_ROOT}/wall_back.png`);
    scene.load.image('decor_plant',   `${SERVICE_ROOT}/decor_plant.png`);
    scene.load.image('entrance_arch', `${SERVICE_ROOT}/entrance_arch.png`);
    // Phase 51-4: 챕터별 홀 바닥 타일 (128×128 seamless, tileSprite용) + 뒷벽
    const FLOOR_VARIANTS = ['g1','izakaya','dragon','bistro','spice','cantina','dream','endless'];
    for (const v of FLOOR_VARIANTS) {
      scene.load.image(`floor_hall_${v}`, `${SERVICE_ROOT}/floor_hall_${v}.png`);
      scene.load.image(`wall_back_${v}`,  `${SERVICE_ROOT}/wall_back_${v}.png`);
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
