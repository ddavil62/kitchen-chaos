/**
 * @fileoverview Kitchen Chaos Tycoon 밸런스 시뮬레이션 스크립트.
 * Phase 17: 수치 기반 분석 — DPS/HP 곡선, 경제 시뮬, 레시피 효율, 난이도 커브.
 *
 * 실행: node tests/balance-sim.mjs
 */

// ── 적 데이터 (gameData.js에서 추출) ──
const ENEMIES = {
  carrot_goblin:  { hp: 80,   speed: 90,  name: '당근 고블린' },
  meat_ogre:      { hp: 220,  speed: 45,  name: '고기 오우거' },
  octopus_mage:   { hp: 150,  speed: 60,  name: '문어 마법사' },
  chili_demon:    { hp: 100,  speed: 110, name: '고추 악마' },
  cheese_golem:   { hp: 400,  speed: 30,  name: '치즈 골렘', regen: 3 },
  flour_ghost:    { hp: 60,   speed: 75,  name: '밀가루 유령', invisible: true },
  egg_sprite:     { hp: 70,   speed: 95,  name: '달걀 요정' },
  rice_slime:     { hp: 120,  speed: 55,  name: '밥 슬라임' },
  fish_knight:    { hp: 180,  speed: 50,  name: '생선 기사', shield: 0.5 },
  mushroom_scout: { hp: 60,   speed: 120, name: '버섯 정찰병' },
  cheese_rat:     { hp: 90,   speed: 100, name: '치즈 쥐' },
  shrimp_samurai: { hp: 160,  speed: 70,  name: '새우 사무라이', dodge: 0.2 },
  tomato_bomber:  { hp: 100,  speed: 55,  name: '토마토 폭격수' },
  butter_ghost:   { hp: 80,   speed: 85,  name: '버터 유령' },
  sugar_fairy:    { hp: 60,   speed: 95,  name: '설탕 요정' },
  milk_phantom:   { hp: 200,  speed: 40,  name: '우유 팬텀', healPercent: 0.1 },
  // 보스
  pasta_boss:          { hp: 2000,  speed: 25, name: '거대 파스타', boss: true, reward: 100 },
  dragon_ramen:        { hp: 3000,  speed: 20, name: '용 라멘', boss: true, reward: 150 },
  seafood_kraken:      { hp: 4000,  speed: 18, name: '해물탕 크라켄', boss: true, reward: 200 },
  lava_dessert_golem:  { hp: 5000,  speed: 15, name: '용암 디저트 골렘', boss: true, reward: 250 },
  master_patissier:    { hp: 6000,  speed: 12, name: '마스터 파티시에', boss: true, reward: 300 },
  cuisine_god:         { hp: 8000,  speed: 10, name: '요리의 신', boss: true, reward: 500 },
};

// ── 도구(타워) 데이터 ──
const TOOLS = {
  pan:      { maxCount: 5, buyCost: [80,120,180,250,350], upgradeCost: [0,150,400],
              stats: { 1: {dmg:25, rate:1000}, 2: {dmg:35, rate:900}, 3: {dmg:50, rate:800} } },
  salt:     { maxCount: 4, buyCost: [120,180,260,360], upgradeCost: [0,200,500],
              stats: { 1: {dmg:12, rate:600, slow:0.5}, 2: {dmg:16, rate:550, slow:0.55}, 3: {dmg:22, rate:500, slow:0.60} } },
  grill:    { maxCount: 3, buyCost: [200,300,450], upgradeCost: [0,300,700],
              stats: { 1: {dmg:18, rate:800, burn:5, burnDur:3000, burnInt:500},
                       2: {dmg:25, rate:750, burn:8, burnDur:3500, burnInt:500},
                       3: {dmg:35, rate:700, burn:12, burnDur:4000, burnInt:500} } },
  freezer:  { maxCount: 3, buyCost: [160,240,360], upgradeCost: [0,250,600],
              stats: { 1: {dmg:8, rate:1500, freeze:1.5}, 2: {dmg:12, rate:1300, freeze:2.0}, 3: {dmg:18, rate:1100, freeze:2.5} } },
};

// ── 스테이지별 웨이브/서비스 데이터 (stageData.js 요약) ──
const STAGES = [
  { id:'1-1', ch:1, waves:[ {e:[{t:'carrot_goblin',c:6},{t:'meat_ogre',c:0}]}, {e:[{t:'carrot_goblin',c:8},{t:'meat_ogre',c:1}]}, {e:[{t:'carrot_goblin',c:10},{t:'meat_ogre',c:3}]}, {e:[{t:'carrot_goblin',c:10},{t:'meat_ogre',c:5},{t:'octopus_mage',c:3}]}, {e:[{t:'carrot_goblin',c:15},{t:'chili_demon',c:5},{t:'octopus_mage',c:3}]}, {e:[{t:'meat_ogre',c:8},{t:'octopus_mage',c:5},{t:'cheese_golem',c:2}]} ], svc:{dur:180, intv:6, max:15, pat:50} },
  { id:'1-2', ch:1, waves:[ {e:[{t:'carrot_goblin',c:8},{t:'meat_ogre',c:1}]}, {e:[{t:'carrot_goblin',c:10},{t:'meat_ogre',c:3}]}, {e:[{t:'carrot_goblin',c:12},{t:'chili_demon',c:3},{t:'meat_ogre',c:2}]}, {e:[{t:'carrot_goblin',c:12},{t:'octopus_mage',c:4},{t:'chili_demon',c:3}]}, {e:[{t:'meat_ogre',c:6},{t:'chili_demon',c:6},{t:'octopus_mage',c:4}]}, {e:[{t:'carrot_goblin',c:18},{t:'cheese_golem',c:2},{t:'octopus_mage',c:5}]}, {e:[{t:'meat_ogre',c:8},{t:'chili_demon',c:8},{t:'cheese_golem',c:3}]} ], svc:{dur:180, intv:5.5, max:18, pat:48} },
  { id:'1-3', ch:1, waves:[ {e:[{t:'carrot_goblin',c:10},{t:'chili_demon',c:3}]}, {e:[{t:'meat_ogre',c:5},{t:'octopus_mage',c:4}]}, {e:[{t:'carrot_goblin',c:15},{t:'cheese_golem',c:2},{t:'chili_demon',c:5}]}, {e:[{t:'meat_ogre',c:8},{t:'octopus_mage',c:6},{t:'flour_ghost',c:3}]}, {e:[{t:'carrot_goblin',c:20},{t:'chili_demon',c:8},{t:'cheese_golem',c:3}]}, {e:[{t:'meat_ogre',c:10},{t:'cheese_golem',c:4},{t:'flour_ghost',c:5}]}, {e:[{t:'carrot_goblin',c:25},{t:'meat_ogre',c:10},{t:'cheese_golem',c:5}]} ], svc:{dur:200, intv:5, max:20, pat:45} },
  { id:'1-4', ch:1, waves:[ {e:[{t:'carrot_goblin',c:12},{t:'meat_ogre',c:3}]}, {e:[{t:'chili_demon',c:6},{t:'octopus_mage',c:4}]}, {e:[{t:'carrot_goblin',c:15},{t:'cheese_golem',c:3},{t:'flour_ghost',c:4}]}, {e:[{t:'meat_ogre',c:8},{t:'egg_sprite',c:6},{t:'chili_demon',c:5}]}, {e:[{t:'carrot_goblin',c:20},{t:'rice_slime',c:5},{t:'cheese_golem',c:3}]}, {e:[{t:'meat_ogre',c:10},{t:'octopus_mage',c:8},{t:'flour_ghost',c:6}]}, {e:[{t:'carrot_goblin',c:25},{t:'chili_demon',c:10},{t:'cheese_golem',c:4},{t:'egg_sprite',c:8}]} ], svc:{dur:200, intv:5, max:20, pat:42} },
  { id:'1-5', ch:1, waves:[ {e:[{t:'carrot_goblin',c:15},{t:'chili_demon',c:5}]}, {e:[{t:'meat_ogre',c:6},{t:'octopus_mage',c:5},{t:'egg_sprite',c:4}]}, {e:[{t:'carrot_goblin',c:18},{t:'cheese_golem',c:3},{t:'rice_slime',c:4}]}, {e:[{t:'chili_demon',c:8},{t:'flour_ghost',c:6},{t:'meat_ogre',c:8}]}, {e:[{t:'carrot_goblin',c:22},{t:'egg_sprite',c:8},{t:'cheese_golem',c:4}]}, {e:[{t:'meat_ogre',c:12},{t:'octopus_mage',c:8},{t:'rice_slime',c:5}]}, {e:[{t:'carrot_goblin',c:28},{t:'chili_demon',c:12},{t:'cheese_golem',c:5},{t:'flour_ghost',c:6}]}, {e:[{t:'meat_ogre',c:15},{t:'cheese_golem',c:6},{t:'egg_sprite',c:10},{t:'rice_slime',c:6}]} ], svc:{dur:220, intv:4.5, max:22, pat:40} },
  { id:'1-6', ch:1, waves:[ {e:[{t:'carrot_goblin',c:20},{t:'meat_ogre',c:5},{t:'chili_demon',c:5}]}, {e:[{t:'octopus_mage',c:8},{t:'cheese_golem',c:3},{t:'flour_ghost',c:5}]}, {e:[{t:'carrot_goblin',c:25},{t:'egg_sprite',c:8},{t:'rice_slime',c:5}]}, {e:[{t:'meat_ogre',c:12},{t:'chili_demon',c:10},{t:'cheese_golem',c:4}]}, {e:[{t:'carrot_goblin',c:30},{t:'octopus_mage',c:10},{t:'flour_ghost',c:6}]}, {e:[{t:'pasta_boss',c:1}]} ], svc:{dur:240, intv:4, max:25, pat:38}, boss: 'pasta_boss' },
  // 2장
  { id:'2-1', ch:2, waves:[ {e:[{t:'fish_knight',c:6},{t:'carrot_goblin',c:10}]}, {e:[{t:'mushroom_scout',c:8},{t:'meat_ogre',c:4}]}, {e:[{t:'fish_knight',c:8},{t:'cheese_rat',c:6},{t:'chili_demon',c:5}]}, {e:[{t:'mushroom_scout',c:10},{t:'octopus_mage',c:5},{t:'cheese_golem',c:2}]}, {e:[{t:'fish_knight',c:10},{t:'cheese_rat',c:10},{t:'carrot_goblin',c:15}]}, {e:[{t:'mushroom_scout',c:12},{t:'fish_knight',c:8},{t:'cheese_golem',c:3}]} ], svc:{dur:240, intv:4, max:25, pat:38} },
  { id:'2-2', ch:2, waves:[ {e:[{t:'fish_knight',c:8},{t:'mushroom_scout',c:6}]}, {e:[{t:'cheese_rat',c:10},{t:'carrot_goblin',c:12}]}, {e:[{t:'fish_knight',c:10},{t:'cheese_rat',c:8},{t:'octopus_mage',c:5}]}, {e:[{t:'mushroom_scout',c:12},{t:'meat_ogre',c:6},{t:'cheese_golem',c:3}]}, {e:[{t:'fish_knight',c:12},{t:'cheese_rat',c:12},{t:'flour_ghost',c:5}]}, {e:[{t:'mushroom_scout',c:15},{t:'fish_knight',c:10},{t:'cheese_golem',c:4}]}, {e:[{t:'fish_knight',c:15},{t:'cheese_rat',c:15},{t:'meat_ogre',c:8},{t:'cheese_golem',c:3}]} ], svc:{dur:260, intv:3.5, max:28, pat:35} },
  { id:'2-3', ch:2, waves:[ {e:[{t:'fish_knight',c:10},{t:'cheese_rat',c:8}]}, {e:[{t:'mushroom_scout',c:10},{t:'meat_ogre',c:6},{t:'octopus_mage',c:5}]}, {e:[{t:'fish_knight',c:12},{t:'cheese_rat',c:12},{t:'cheese_golem',c:3}]}, {e:[{t:'mushroom_scout',c:15},{t:'chili_demon',c:8},{t:'flour_ghost',c:5}]}, {e:[{t:'fish_knight',c:15},{t:'cheese_rat',c:15},{t:'cheese_golem',c:5}]}, {e:[{t:'dragon_ramen',c:1}]} ], svc:{dur:280, intv:3, max:30, pat:32}, boss: 'dragon_ramen' },
  // 3장
  { id:'3-1', ch:3, waves:[ {e:[{t:'shrimp_samurai',c:6},{t:'carrot_goblin',c:12}]}, {e:[{t:'tomato_bomber',c:5},{t:'fish_knight',c:6}]}, {e:[{t:'shrimp_samurai',c:8},{t:'butter_ghost',c:4},{t:'meat_ogre',c:5}]}, {e:[{t:'tomato_bomber',c:8},{t:'mushroom_scout',c:8}]}, {e:[{t:'shrimp_samurai',c:10},{t:'cheese_rat',c:8},{t:'octopus_mage',c:5}]}, {e:[{t:'tomato_bomber',c:10},{t:'butter_ghost',c:6},{t:'cheese_golem',c:3}]} ], svc:{dur:200, intv:5, max:20, pat:45} },
  { id:'3-2', ch:3, waves:[ {e:[{t:'shrimp_samurai',c:8},{t:'tomato_bomber',c:5}]}, {e:[{t:'butter_ghost',c:6},{t:'fish_knight',c:8}]}, {e:[{t:'shrimp_samurai',c:10},{t:'tomato_bomber',c:8},{t:'cheese_rat',c:6}]}, {e:[{t:'butter_ghost',c:8},{t:'mushroom_scout',c:10}]}, {e:[{t:'shrimp_samurai',c:12},{t:'tomato_bomber',c:10},{t:'cheese_golem',c:3}]}, {e:[{t:'butter_ghost',c:10},{t:'fish_knight',c:10},{t:'meat_ogre',c:6}]} ], svc:{dur:210, intv:4.5, max:22, pat:42} },
  { id:'3-3', ch:3, waves:[ {e:[{t:'shrimp_samurai',c:10},{t:'butter_ghost',c:6}]}, {e:[{t:'tomato_bomber',c:10},{t:'fish_knight',c:8}]}, {e:[{t:'shrimp_samurai',c:12},{t:'butter_ghost',c:8},{t:'cheese_golem',c:3}]}, {e:[{t:'tomato_bomber',c:12},{t:'cheese_rat',c:10}]}, {e:[{t:'shrimp_samurai',c:15},{t:'butter_ghost',c:10},{t:'mushroom_scout',c:8}]}, {e:[{t:'tomato_bomber',c:15},{t:'fish_knight',c:12},{t:'cheese_golem',c:4}]}, {e:[{t:'shrimp_samurai',c:18},{t:'butter_ghost',c:12},{t:'meat_ogre',c:8}]} ], svc:{dur:220, intv:4, max:24, pat:40} },
  { id:'3-4', ch:3, waves:[ {e:[{t:'shrimp_samurai',c:12},{t:'tomato_bomber',c:8}]}, {e:[{t:'butter_ghost',c:10},{t:'fish_knight',c:10}]}, {e:[{t:'shrimp_samurai',c:15},{t:'tomato_bomber',c:12},{t:'cheese_golem',c:3}]}, {e:[{t:'butter_ghost',c:12},{t:'mushroom_scout',c:10}]}, {e:[{t:'shrimp_samurai',c:18},{t:'tomato_bomber',c:15},{t:'cheese_rat',c:10}]}, {e:[{t:'butter_ghost',c:15},{t:'fish_knight',c:12},{t:'meat_ogre',c:8}]}, {e:[{t:'shrimp_samurai',c:20},{t:'butter_ghost',c:15},{t:'cheese_golem',c:5}]} ], svc:{dur:240, intv:3.5, max:28, pat:38} },
  { id:'3-5', ch:3, waves:[ {e:[{t:'shrimp_samurai',c:15},{t:'tomato_bomber',c:10}]}, {e:[{t:'butter_ghost',c:12},{t:'fish_knight',c:12}]}, {e:[{t:'shrimp_samurai',c:18},{t:'tomato_bomber',c:15},{t:'cheese_golem',c:4}]}, {e:[{t:'butter_ghost',c:15},{t:'mushroom_scout',c:12}]}, {e:[{t:'shrimp_samurai',c:20},{t:'tomato_bomber',c:18},{t:'cheese_rat',c:12}]}, {e:[{t:'butter_ghost',c:18},{t:'fish_knight',c:15},{t:'meat_ogre',c:10}]}, {e:[{t:'shrimp_samurai',c:22},{t:'butter_ghost',c:18},{t:'cheese_golem',c:6}]}, {e:[{t:'shrimp_samurai',c:25},{t:'tomato_bomber',c:20},{t:'butter_ghost',c:15}]} ], svc:{dur:260, intv:3, max:32, pat:36} },
  { id:'3-6', ch:3, waves:[ {e:[{t:'shrimp_samurai',c:18},{t:'tomato_bomber',c:12}]}, {e:[{t:'butter_ghost',c:15},{t:'fish_knight',c:12}]}, {e:[{t:'shrimp_samurai',c:20},{t:'cheese_golem',c:5}]}, {e:[{t:'tomato_bomber',c:18},{t:'butter_ghost',c:15}]}, {e:[{t:'shrimp_samurai',c:25},{t:'fish_knight',c:15},{t:'cheese_golem',c:6}]}, {e:[{t:'seafood_kraken',c:1}]} ], svc:{dur:300, intv:2.5, max:40, pat:34}, boss:'seafood_kraken' },
  // 4장
  { id:'4-1', ch:4, waves:[ {e:[{t:'sugar_fairy',c:8},{t:'carrot_goblin',c:12}]}, {e:[{t:'milk_phantom',c:3},{t:'shrimp_samurai',c:6}]}, {e:[{t:'sugar_fairy',c:10},{t:'butter_ghost',c:6},{t:'meat_ogre',c:5}]}, {e:[{t:'milk_phantom',c:4},{t:'fish_knight',c:8}]}, {e:[{t:'sugar_fairy',c:12},{t:'tomato_bomber',c:8},{t:'cheese_golem',c:3}]}, {e:[{t:'milk_phantom',c:5},{t:'shrimp_samurai',c:10},{t:'octopus_mage',c:5}]} ], svc:{dur:220, intv:4.5, max:24, pat:42} },
  { id:'4-2', ch:4, waves:[ {e:[{t:'sugar_fairy',c:10},{t:'milk_phantom',c:3}]}, {e:[{t:'butter_ghost',c:8},{t:'shrimp_samurai',c:8}]}, {e:[{t:'sugar_fairy',c:12},{t:'milk_phantom',c:5},{t:'cheese_golem',c:3}]}, {e:[{t:'tomato_bomber',c:10},{t:'fish_knight',c:10}]}, {e:[{t:'sugar_fairy',c:15},{t:'milk_phantom',c:6},{t:'meat_ogre',c:8}]}, {e:[{t:'butter_ghost',c:12},{t:'shrimp_samurai',c:12},{t:'cheese_golem',c:4}]}, {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:8},{t:'tomato_bomber',c:10}]} ], svc:{dur:240, intv:4, max:26, pat:40} },
  { id:'4-3', ch:4, waves:[ {e:[{t:'sugar_fairy',c:12},{t:'milk_phantom',c:4}]}, {e:[{t:'butter_ghost',c:10},{t:'shrimp_samurai',c:10}]}, {e:[{t:'sugar_fairy',c:15},{t:'milk_phantom',c:6},{t:'cheese_golem',c:4}]}, {e:[{t:'tomato_bomber',c:12},{t:'fish_knight',c:10}]}, {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:8},{t:'meat_ogre',c:10}]}, {e:[{t:'butter_ghost',c:15},{t:'shrimp_samurai',c:15},{t:'cheese_golem',c:5}]}, {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:10},{t:'tomato_bomber',c:12}]} ], svc:{dur:250, intv:3.8, max:28, pat:38} },
  { id:'4-4', ch:4, waves:[ {e:[{t:'sugar_fairy',c:15},{t:'milk_phantom',c:5}]}, {e:[{t:'butter_ghost',c:12},{t:'shrimp_samurai',c:12}]}, {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:8},{t:'cheese_golem',c:5}]}, {e:[{t:'tomato_bomber',c:15},{t:'fish_knight',c:12}]}, {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:10},{t:'meat_ogre',c:12}]}, {e:[{t:'butter_ghost',c:18},{t:'shrimp_samurai',c:18},{t:'cheese_golem',c:6}]}, {e:[{t:'sugar_fairy',c:22},{t:'milk_phantom',c:12},{t:'tomato_bomber',c:15}]} ], svc:{dur:270, intv:3.5, max:30, pat:36} },
  { id:'4-5', ch:4, waves:[ {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:6}]}, {e:[{t:'butter_ghost',c:15},{t:'shrimp_samurai',c:15}]}, {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:10},{t:'cheese_golem',c:6}]}, {e:[{t:'tomato_bomber',c:18},{t:'fish_knight',c:15}]}, {e:[{t:'sugar_fairy',c:22},{t:'milk_phantom',c:12},{t:'meat_ogre',c:15}]}, {e:[{t:'butter_ghost',c:20},{t:'shrimp_samurai',c:20},{t:'cheese_golem',c:7}]}, {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:15},{t:'tomato_bomber',c:18}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:18},{t:'cheese_golem',c:8}]} ], svc:{dur:280, intv:3, max:34, pat:34} },
  { id:'4-6', ch:4, waves:[ {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:8}]}, {e:[{t:'butter_ghost',c:18},{t:'shrimp_samurai',c:18}]}, {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:12},{t:'cheese_golem',c:6}]}, {e:[{t:'tomato_bomber',c:20},{t:'fish_knight',c:15}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:15},{t:'cheese_golem',c:8}]}, {e:[{t:'lava_dessert_golem',c:1}]} ], svc:{dur:320, intv:2.5, max:42, pat:32}, boss:'lava_dessert_golem' },
  // 5장
  { id:'5-1', ch:5, waves:[ {e:[{t:'sugar_fairy',c:12},{t:'milk_phantom',c:4},{t:'shrimp_samurai',c:8}]}, {e:[{t:'butter_ghost',c:8},{t:'tomato_bomber',c:8},{t:'fish_knight',c:6}]}, {e:[{t:'sugar_fairy',c:15},{t:'milk_phantom',c:6},{t:'cheese_golem',c:4}]}, {e:[{t:'shrimp_samurai',c:12},{t:'cheese_rat',c:10}]}, {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:8},{t:'butter_ghost',c:10}]}, {e:[{t:'tomato_bomber',c:12},{t:'fish_knight',c:10},{t:'cheese_golem',c:5}]} ], svc:{dur:300, intv:2.8, max:36, pat:32} },
  { id:'5-2', ch:5, waves:[ {e:[{t:'sugar_fairy',c:15},{t:'milk_phantom',c:5}]}, {e:[{t:'shrimp_samurai',c:10},{t:'butter_ghost',c:10}]}, {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:8},{t:'cheese_golem',c:4}]}, {e:[{t:'tomato_bomber',c:12},{t:'fish_knight',c:12}]}, {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:10},{t:'butter_ghost',c:12}]}, {e:[{t:'shrimp_samurai',c:15},{t:'cheese_golem',c:6}]}, {e:[{t:'sugar_fairy',c:22},{t:'milk_phantom',c:12},{t:'tomato_bomber',c:15}]} ], svc:{dur:310, intv:2.6, max:38, pat:30} },
  { id:'5-3', ch:5, waves:[ {e:[{t:'sugar_fairy',c:18},{t:'milk_phantom',c:6}]}, {e:[{t:'shrimp_samurai',c:12},{t:'butter_ghost',c:12}]}, {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:10},{t:'cheese_golem',c:5}]}, {e:[{t:'tomato_bomber',c:15},{t:'fish_knight',c:15}]}, {e:[{t:'sugar_fairy',c:22},{t:'milk_phantom',c:12},{t:'butter_ghost',c:15}]}, {e:[{t:'shrimp_samurai',c:18},{t:'cheese_golem',c:7}]}, {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:15},{t:'tomato_bomber',c:18}]} ], svc:{dur:320, intv:2.4, max:40, pat:28} },
  { id:'5-4', ch:5, waves:[ {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:8}]}, {e:[{t:'shrimp_samurai',c:15},{t:'butter_ghost',c:15}]}, {e:[{t:'sugar_fairy',c:22},{t:'milk_phantom',c:12},{t:'cheese_golem',c:6}]}, {e:[{t:'tomato_bomber',c:18},{t:'fish_knight',c:15}]}, {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:15},{t:'butter_ghost',c:18}]}, {e:[{t:'shrimp_samurai',c:20},{t:'cheese_golem',c:8}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:18},{t:'tomato_bomber',c:20}]} ], svc:{dur:340, intv:2.2, max:44, pat:26} },
  { id:'5-5', ch:5, waves:[ {e:[{t:'sugar_fairy',c:22},{t:'milk_phantom',c:10}]}, {e:[{t:'shrimp_samurai',c:18},{t:'butter_ghost',c:18}]}, {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:15},{t:'cheese_golem',c:7}]}, {e:[{t:'tomato_bomber',c:20},{t:'fish_knight',c:18}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:18},{t:'butter_ghost',c:20}]}, {e:[{t:'shrimp_samurai',c:22},{t:'cheese_golem',c:9}]}, {e:[{t:'sugar_fairy',c:30},{t:'milk_phantom',c:20},{t:'tomato_bomber',c:22}]}, {e:[{t:'sugar_fairy',c:32},{t:'milk_phantom',c:22},{t:'cheese_golem',c:10}]} ], svc:{dur:360, intv:2, max:48, pat:24} },
  { id:'5-6', ch:5, waves:[ {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:12}]}, {e:[{t:'shrimp_samurai',c:20},{t:'butter_ghost',c:20}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:18},{t:'cheese_golem',c:8}]}, {e:[{t:'tomato_bomber',c:22},{t:'fish_knight',c:18}]}, {e:[{t:'sugar_fairy',c:30},{t:'milk_phantom',c:20},{t:'cheese_golem',c:10}]}, {e:[{t:'master_patissier',c:1}]} ], svc:{dur:400, intv:1.8, max:55, pat:22}, boss:'master_patissier' },
  // 6장
  { id:'6-1', ch:6, waves:[ {e:[{t:'sugar_fairy',c:20},{t:'milk_phantom',c:10},{t:'shrimp_samurai',c:15}]}, {e:[{t:'butter_ghost',c:15},{t:'tomato_bomber',c:15},{t:'fish_knight',c:12}]}, {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:12},{t:'cheese_golem',c:6}]}, {e:[{t:'shrimp_samurai',c:18},{t:'cheese_rat',c:15}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:15},{t:'butter_ghost',c:18}]}, {e:[{t:'tomato_bomber',c:20},{t:'fish_knight',c:15},{t:'cheese_golem',c:8}]} ], svc:{dur:400, intv:1.8, max:55, pat:22} },
  { id:'6-2', ch:6, waves:[ {e:[{t:'sugar_fairy',c:25},{t:'milk_phantom',c:12}]}, {e:[{t:'shrimp_samurai',c:20},{t:'butter_ghost',c:20}]}, {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:15},{t:'cheese_golem',c:8}]}, {e:[{t:'tomato_bomber',c:22},{t:'fish_knight',c:18}]}, {e:[{t:'sugar_fairy',c:30},{t:'milk_phantom',c:18},{t:'butter_ghost',c:22}]}, {e:[{t:'shrimp_samurai',c:25},{t:'cheese_golem',c:10}]}, {e:[{t:'sugar_fairy',c:32},{t:'milk_phantom',c:20},{t:'tomato_bomber',c:25}]} ], svc:{dur:420, intv:1.6, max:60, pat:20} },
  { id:'6-3', ch:6, waves:[ {e:[{t:'sugar_fairy',c:28},{t:'milk_phantom',c:15}]}, {e:[{t:'shrimp_samurai',c:22},{t:'butter_ghost',c:22}]}, {e:[{t:'sugar_fairy',c:30},{t:'milk_phantom',c:18},{t:'cheese_golem',c:10}]}, {e:[{t:'tomato_bomber',c:25},{t:'fish_knight',c:20}]}, {e:[{t:'sugar_fairy',c:32},{t:'milk_phantom',c:20},{t:'cheese_golem',c:12}]}, {e:[{t:'cuisine_god',c:1}]} ], svc:{dur:480, intv:1.5, max:70, pat:18}, boss:'cuisine_god' },
];

// ── 레시피 효율 데이터 (recipeData.js 대표 샘플) ──
const RECIPES = [
  // tier1
  { id:'carrot_soup', tier:1, reward:20, cookTime:3, cost:0, ingr:'carrot×1' },
  { id:'basic_stew', tier:1, reward:22, cookTime:3, cost:0, ingr:'carrot×1+meat×0' },
  // tier2
  { id:'steak_plate', tier:2, reward:50, cookTime:6, cost:0, ingr:'meat×2' },
  { id:'mixed_platter', tier:2, reward:65, cookTime:8, cost:0, ingr:'carrot×2+meat×1' },
  { id:'seafood_pasta', tier:2, reward:55, cookTime:7, cost:0, ingr:'squid×1+flour×1' },
  { id:'spicy_stir_fry', tier:2, reward:45, cookTime:5, cost:0, ingr:'pepper×1+meat×1' },
  { id:'cheese_fondue', tier:2, reward:55, cookTime:6, cost:0, ingr:'cheese×2' },
  // tier3
  { id:'grilled_fish', tier:3, reward:65, cookTime:7, cost:50, ingr:'fish×2+butter×1' },
  { id:'mushroom_risotto', tier:3, reward:70, cookTime:7, cost:55, ingr:'mushroom×2+rice×1+cheese×1' },
  { id:'shrimp_tempura', tier:3, reward:75, cookTime:7.5, cost:60, ingr:'shrimp×2+flour×1' },
  { id:'tomato_pasta', tier:3, reward:72, cookTime:7, cost:55, ingr:'tomato×2+flour×1' },
  { id:'butter_lobster', tier:3, reward:85, cookTime:8, cost:70, ingr:'shrimp×2+butter×2' },
  // tier4
  { id:'royal_sushi', tier:4, reward:105, cookTime:10, cost:100, ingr:'fish×2+rice×2+squid×1' },
  { id:'lava_bbq', tier:4, reward:115, cookTime:10, cost:110, ingr:'meat×3+pepper×2' },
  { id:'cream_gratin', tier:4, reward:110, cookTime:10, cost:105, ingr:'cheese×2+milk×2+butter×1' },
  { id:'seafood_tower', tier:4, reward:125, cookTime:11, cost:120, ingr:'shrimp×2+squid×2+fish×1' },
  // tier5
  { id:'grand_feast', tier:5, reward:180, cookTime:15, cost:250, ingr:'meat×3+fish×2+cheese×2' },
  { id:'divine_dessert', tier:5, reward:200, cookTime:16, cost:300, ingr:'sugar×3+milk×2+butter×2+egg×1' },
  { id:'cuisine_god_banquet', tier:5, reward:220, cookTime:18, cost:350, ingr:'7종' },
];

// ── 영구 업그레이드 ──
const UPGRADES = {
  fridge:         { maxLv: 5, costs: [15,30,50,80,120], totalCost: 295 },
  knife:          { maxLv: 5, costs: [20,40,65,100,150], totalCost: 375, effect: '+25% 공격속도' },
  delivery_speed: { maxLv: 3, costs: [25,50,100], totalCost: 175, effect: '+60% 수거속도' },
  cook_training:  { maxLv: 3, costs: [30,60,120], totalCost: 210, effect: '-30% 조리시간' },
};

// ══════════════════════════════════════════════════════
// 분석 1: DPS vs 적 HP 곡선
// ══════════════════════════════════════════════════════
function analyzeDpsHp() {
  console.log('\n' + '═'.repeat(60));
  console.log('  분석 1: 스테이지별 적 총 HP vs 이론 DPS');
  console.log('═'.repeat(60));

  const results = [];

  for (const stage of STAGES) {
    let totalHp = 0;
    let totalEnemies = 0;

    for (const wave of stage.waves) {
      for (const eg of wave.e) {
        const enemy = ENEMIES[eg.t];
        if (!enemy) continue;
        let effectiveHp = enemy.hp * eg.c;
        // 보스는 따로 집계
        if (enemy.boss) {
          totalHp += enemy.hp;
          totalEnemies += 1;
          continue;
        }
        // 특수 능력 보정: dodge → 유효 HP 증가
        if (enemy.dodge) effectiveHp /= (1 - enemy.dodge);
        // shield → 전면 피해 감소
        if (enemy.shield) effectiveHp *= (1 + enemy.shield * 0.3); // 근사
        totalHp += effectiveHp;
        totalEnemies += eg.c;
      }
    }

    results.push({
      id: stage.id,
      ch: stage.ch,
      totalHp: Math.round(totalHp),
      enemies: totalEnemies,
      waves: stage.waves.length,
      boss: stage.boss || '-',
      svcPat: stage.svc.pat,
      svcIntv: stage.svc.intv,
    });
  }

  console.log('\n스테이지 | 챕터 | 웨이브 | 적수 | 총HP      | 이전대비 | 인내심 | 손님간격 | 보스');
  console.log('-'.repeat(95));

  let prevHp = 0;
  for (const r of results) {
    const ratio = prevHp > 0 ? ((r.totalHp / prevHp - 1) * 100).toFixed(0) + '%' : '-';
    console.log(
      `${r.id.padEnd(8)} | ${r.ch}     | ${String(r.waves).padStart(4)}   | ${String(r.enemies).padStart(4)} | ${String(r.totalHp).padStart(9)} | ${ratio.padStart(6)}   | ${String(r.svcPat).padStart(4)}초 | ${String(r.svcIntv).padStart(5)}초 | ${r.boss}`
    );
    prevHp = r.totalHp;
  }

  // 난이도 점프 탐지
  console.log('\n[!] 난이도 급점프 탐지 (이전 대비 +50% 이상):');
  prevHp = 0;
  let alerts = [];
  for (const r of results) {
    if (prevHp > 0) {
      const jump = (r.totalHp / prevHp - 1) * 100;
      if (jump > 50) alerts.push(`  ⚠️ ${r.id}: +${jump.toFixed(0)}% (${prevHp.toLocaleString()} → ${r.totalHp.toLocaleString()})`);
    }
    prevHp = r.totalHp;
  }
  if (alerts.length === 0) console.log('  없음 (모든 스테이지 간 점프 < 50%)');
  else alerts.forEach(a => console.log(a));

  return results;
}

// ══════════════════════════════════════════════════════
// 분석 2: 도구 DPS 효율
// ══════════════════════════════════════════════════════
function analyzeToolDps() {
  console.log('\n' + '═'.repeat(60));
  console.log('  분석 2: 도구 DPS / 골드 효율');
  console.log('═'.repeat(60));

  console.log('\n도구     | Lv | 직접DPS | 화상DPS | 총DPS  | 구매비 | 업비 | 누적투자 | 골드당DPS');
  console.log('-'.repeat(90));

  for (const [id, tool] of Object.entries(TOOLS)) {
    for (let lv = 1; lv <= 3; lv++) {
      const s = tool.stats[lv];
      const directDps = s.rate > 0 ? (s.dmg / (s.rate / 1000)) : 0;
      let burnDps = 0;
      if (s.burn) {
        // 화상 tick 수 = burnDur / burnInt
        burnDps = s.burn * (s.burnDur / s.burnInt) / (s.rate / 1000);
        // 실제로는 화상이 독립 DoT이므로 단일 타겟 DPS로 근사
        burnDps = s.burn; // 초당 화상 DPS (500ms 간격 = 2tick/s × burnDmg/2)
      }
      const totalDps = directDps + burnDps;

      const buyCost = tool.buyCost[0]; // 첫 번째 구매 비용
      const upgCost = tool.upgradeCost[lv - 1] || 0;
      const cumCost = buyCost + tool.upgradeCost.slice(0, lv).reduce((a, b) => a + b, 0);
      const goldPerDps = totalDps > 0 ? (cumCost / totalDps).toFixed(1) : '-';

      console.log(
        `${id.padEnd(8)} | ${lv}  | ${directDps.toFixed(1).padStart(7)} | ${burnDps.toFixed(1).padStart(7)} | ${totalDps.toFixed(1).padStart(6)} | ${String(buyCost).padStart(5)}g | ${String(upgCost).padStart(4)}g | ${String(cumCost).padStart(7)}g | ${String(goldPerDps).padStart(7)}`
      );
    }
  }

  // 이론적 팀 DPS (완전 업그레이드)
  console.log('\n[이론 팀 DPS] 전도구 Lv3 풀배치 시:');
  let teamDps = 0;
  for (const [id, tool] of Object.entries(TOOLS)) {
    const s = tool.stats[3];
    const directDps = s.rate > 0 ? (s.dmg / (s.rate / 1000)) : 0;
    const burnDps = s.burn ? s.burn : 0;
    const unitDps = directDps + burnDps;
    const count = tool.maxCount;
    const total = unitDps * count;
    teamDps += total;
    console.log(`  ${id}: ${unitDps.toFixed(1)} DPS × ${count}개 = ${total.toFixed(1)} DPS`);
  }
  console.log(`  ─── 팀 총 DPS: ${teamDps.toFixed(1)} (soup_pot 버프 미적용)`);
  console.log(`  soup_pot +25% 적용 시: ${(teamDps * 1.25).toFixed(1)} DPS`);
  console.log(`  knife 업그레이드 +25% 적용 시: ${(teamDps * 1.25 * 1.25).toFixed(1)} DPS`);

  return teamDps;
}

// ══════════════════════════════════════════════════════
// 분석 3: 레시피 효율 랭킹
// ══════════════════════════════════════════════════════
function analyzeRecipeEfficiency() {
  console.log('\n' + '═'.repeat(60));
  console.log('  분석 3: 레시피 효율 랭킹 (골드/초)');
  console.log('═'.repeat(60));

  const ranked = RECIPES.map(r => ({
    ...r,
    goldPerSec: r.reward / r.cookTime,
  })).sort((a, b) => b.goldPerSec - a.goldPerSec);

  console.log('\n순위 | 레시피               | 등급 | 보상   | 조리(초) | 골드/초  | 해금비용');
  console.log('-'.repeat(80));

  ranked.forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(3)}  | ${r.id.padEnd(20)} | T${r.tier}   | ${String(r.reward).padStart(5)}g | ${String(r.cookTime).padStart(6)}s | ${r.goldPerSec.toFixed(2).padStart(7)} | ${String(r.cost).padStart(5)}코인`
    );
  });

  // cook_training 적용 시
  console.log('\n[조리특훈 Lv3 적용 시] (조리시간 -30%):');
  const top5 = ranked.slice(0, 5);
  top5.forEach(r => {
    const boosted = r.reward / (r.cookTime * 0.7);
    console.log(`  ${r.id}: ${r.goldPerSec.toFixed(2)} → ${boosted.toFixed(2)} 골드/초 (+${((boosted/r.goldPerSec-1)*100).toFixed(0)}%)`);
  });
}

// ══════════════════════════════════════════════════════
// 분석 4: 경제 시뮬레이션 (스테이지 진행 골드 추이)
// ══════════════════════════════════════════════════════
function analyzeEconomy() {
  console.log('\n' + '═'.repeat(60));
  console.log('  분석 4: 스테이지 진행 경제 시뮬레이션');
  console.log('═'.repeat(60));

  const STARTING_GOLD = 120;
  const WAVE_CLEAR = 25;

  // 가정: 플레이어가 각 스테이지에서 최소 서빙 효율(tier1 위주)로 플레이
  // 서빙 수입 = 서빙 가능 횟수 × 평균 보상
  // 서빙 가능 횟수 ≈ min(maxCustomers, duration / customerInterval)

  let cumulativeGold = 0;
  let cumulativeSpent = 0;

  console.log('\n스테이지 | 웨이브보너스 | 예상서빙수입 | 보스보상 | 소계수입 | 누적수입 | 투자여력');
  console.log('-'.repeat(85));

  for (const stage of STAGES) {
    const waveBonus = stage.waves.length * WAVE_CLEAR;

    // 서빙 수입 추정
    const potentialCustomers = Math.min(stage.svc.max, Math.floor(stage.svc.dur / stage.svc.intv));
    // 서빙 성공률 추정: 인내심이 충분하면 80%, 낮으면 60%
    const serveRate = stage.svc.pat >= 35 ? 0.80 : stage.svc.pat >= 25 ? 0.70 : 0.60;
    const servedCount = Math.floor(potentialCustomers * serveRate);
    // 평균 서빙 보상: 챕터별 레시피 티어에 따라
    const avgRewardByChapter = { 1: 35, 2: 50, 3: 60, 4: 70, 5: 80, 6: 90 };
    const avgReward = avgRewardByChapter[stage.ch] || 40;
    const tipMult = 1.2; // 평균 팁 배율
    const serviceIncome = Math.round(servedCount * avgReward * tipMult);

    const bossReward = stage.boss ? (ENEMIES[stage.boss]?.reward || 0) : 0;
    const stageTotal = waveBonus + serviceIncome + bossReward;

    cumulativeGold += stageTotal;

    console.log(
      `${stage.id.padEnd(8)} | ${String(waveBonus).padStart(8)}g   | ${String(serviceIncome).padStart(9)}g   | ${String(bossReward).padStart(5)}g  | ${String(stageTotal).padStart(6)}g | ${String(cumulativeGold).padStart(7)}g | ${stage.svc.pat >= 30 ? '여유' : stage.svc.pat >= 22 ? '빡빡' : '부족'}`
    );
  }

  // 전도구 풀업그레이드 비용
  let fullToolCost = 0;
  for (const tool of Object.values(TOOLS)) {
    const allBuyCost = tool.buyCost.reduce((a, b) => a + b, 0);
    const allUpgCost = tool.upgradeCost.reduce((a, b) => a + b, 0);
    fullToolCost += allBuyCost + allUpgCost;
  }

  let fullUpgCost = 0;
  for (const upg of Object.values(UPGRADES)) {
    fullUpgCost += upg.totalCost;
  }

  console.log(`\n[투자 비용 요약]`);
  console.log(`  전도구 풀구매+풀업그레이드: ${fullToolCost}g`);
  console.log(`  영구 업그레이드 전체: ${fullUpgCost} 코인`);
  console.log(`  누적 수입 (30스테이지): ${cumulativeGold}g`);
  console.log(`  도구 투자 후 잔여: ${cumulativeGold - fullToolCost}g`);
}

// ══════════════════════════════════════════════════════
// 분석 5: 엔드리스 스케일링 분석
// ══════════════════════════════════════════════════════
function analyzeEndless(maxTeamDps) {
  console.log('\n' + '═'.repeat(60));
  console.log('  분석 5: 엔드리스 스케일링 붕괴점');
  console.log('═'.repeat(60));

  // 공식: hpMult = 1 + (wave-1)*0.12, speedMult = min(2, 1+(wave-1)*0.02)
  // countMult = 1 + floor(wave/5)*0.15

  // 풀업그레이드 팀 DPS (soup_pot + knife 포함)
  const fullDps = maxTeamDps * 1.25 * 1.25; // soup_pot + knife

  console.log(`\n풀업 팀 DPS: ${fullDps.toFixed(1)}`);
  console.log('\n웨이브 | HP배율 | 속도배율 | 수배율 | 기본적HP | 유효팀DPS | 처리시간(초) | 상태');
  console.log('-'.repeat(85));

  const baseEnemyHp = 120; // 중간급 적 HP 가정
  const baseCount = 15; // 기본 적 수

  for (let w = 1; w <= 60; w += (w < 20 ? 1 : 5)) {
    const hpMult = 1 + (w - 1) * 0.12;
    const speedMult = Math.min(2.0, 1 + (w - 1) * 0.02);
    const countMult = 1 + Math.floor(w / 5) * 0.15;

    const enemyHp = baseEnemyHp * hpMult;
    const enemyCount = Math.round(baseCount * countMult);
    const totalHp = enemyHp * enemyCount;

    // 적이 빨라지면 도구 유효 시간 감소 → DPS 효율 하락
    const effectiveDps = fullDps / speedMult; // 근사
    const killTime = totalHp / effectiveDps;

    let status = '여유';
    if (killTime > 45) status = '⚠️ 빡빡';
    if (killTime > 60) status = '🔴 위험';
    if (killTime > 90) status = '💀 붕괴';

    console.log(
      `${String(w).padStart(4)}   | ${hpMult.toFixed(2).padStart(5)}× | ${speedMult.toFixed(2).padStart(6)}× | ${countMult.toFixed(2).padStart(5)}× | ${String(Math.round(enemyHp)).padStart(7)} | ${effectiveDps.toFixed(1).padStart(9)} | ${killTime.toFixed(1).padStart(10)} | ${status}`
    );
  }
}

// ══════════════════════════════════════════════════════
// 분석 6: 서비스 난이도 곡선 (인내심 vs 조리시간)
// ══════════════════════════════════════════════════════
function analyzeServiceDifficulty() {
  console.log('\n' + '═'.repeat(60));
  console.log('  분석 6: 서비스 난이도 (인내심 vs 조리시간)');
  console.log('═'.repeat(60));

  // 가장 빠른 레시피(3초) ~ 가장 느린(18초)
  // 인내심 내에 몇 개 요리를 서빙할 수 있는가?
  const cookTimes = { T1: 3, T2: 6, T3: 7.5, T4: 10, T5: 16 };

  console.log('\n스테이지 | 인내심 | T1(3s)서빙 | T2(6s)서빙 | T3(7.5s)서빙 | T4(10s)서빙 | T5(16s)서빙 | 판정');
  console.log('-'.repeat(95));

  for (const stage of STAGES) {
    const pat = stage.svc.pat;
    const results = {};
    let danger = false;

    for (const [tier, ct] of Object.entries(cookTimes)) {
      // 서빙 가능 횟수 = floor(patience / cookTime) (단순화: 세척 2초 추가)
      const servings = Math.floor(pat / (ct + 2));
      results[tier] = servings;
      if (tier === 'T3' && servings < 2) danger = true;
    }

    const verdict = danger ? '⚠️ T3 2회 불가' :
                    results.T2 < 3 ? '⚠️ T2 빡빡' : '✅ OK';

    console.log(
      `${stage.id.padEnd(8)} | ${String(pat).padStart(4)}초 | ${String(results.T1).padStart(8)}회 | ${String(results.T2).padStart(8)}회 | ${String(results.T3).padStart(10)}회 | ${String(results.T4).padStart(9)}회 | ${String(results.T5).padStart(9)}회 | ${verdict}`
    );
  }
}

// ══════════════════════════════════════════════════════
// 메인 실행
// ══════════════════════════════════════════════════════
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  Kitchen Chaos Tycoon — 밸런스 시뮬레이션 v1.0          ║');
console.log('║  Phase 17: 수치 기반 종합 분석                          ║');
console.log('╚══════════════════════════════════════════════════════════╝');

analyzeDpsHp();
const maxDps = analyzeToolDps();
analyzeRecipeEfficiency();
analyzeEconomy();
analyzeEndless(maxDps);
analyzeServiceDifficulty();

console.log('\n' + '═'.repeat(60));
console.log('  시뮬레이션 완료');
console.log('═'.repeat(60));
