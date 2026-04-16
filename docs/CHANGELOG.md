# Changelog

## [Phase 35] 2026-04-16 — 21장 엘 디아블로 최종전 (멕시칸 아크 완결)

### Added
- el_diablo_pepper 보스 스프라이트 (PixelLab pro, 64px, 8방향 + walking 애니메이션)
- gameData.js: el_diablo_pepper 보스 등록 — HP 2600, speed 22, fireZone + 소환 + 분노 메커닉
- dialogueData.js: 대화 6종 추가 (누적 94종)
  - chapter21_intro: 21-1 진입 시, 엘 디아블로 등장
  - chapter21_mid: 21장 중반, 스토리 전개
  - chapter21_boss: 21-6 진입 시, 보스전 직전 대사
  - chapter21_clear: 21-6 첫 클리어, 멕시칸 아크 완결
  - chapter21_epilogue: chapter21_clear 연쇄, 에필로그
  - team_side_21: 행상인 진입 시 팀원 리액션
- dialogueData.js: CHARACTERS에 el_diablo 추가 (portraitKey: 'el_diablo', boss 역할) — 누적 14종
- storyData.js: 트리거 7건 추가 (21장 전체 스토리 흐름) — 누적 96항목
- stageData.js: 21-1~21-6 구현 (21-1~21-5 일반, 21-6 el_diablo_pepper 보스전, theme: cactus_cantina)
- recipeData.js: 레시피 10종 추가 (diablo 테마 특선 레시피 + 아보카도 조합) — 누적 254종
- 멕시칸 아크(19~21장) 3챕터 아크 완결

### Changed
- SpriteLoader.js: BOSS_IDS 12종으로 갱신 (el_diablo_pepper 추가)
- SpriteLoader.js: BOSS_WALK_HASHES — el_diablo_pepper 'walking-acae25f3' 등록

### 참고
- 적 누적: 51종 (일반 38 + 미니보스 1 + 보스 12)
- 시즌3 멕시칸 아크(19~21장) 완결 — 다음: 22장 슈가 드림랜드 (디저트 아크)

---

## [Phase 32-5] 2026-04-14 — 18장 스테이지 구현 + maharaja/masala_guide/cardamom

### Added
- gameData.js: ENEMY_TYPES에 masala_guide(마살라 계승자) 추가
  - HP 330, speed 82, canvasSize 108, confuseOnHit(25%, 2500ms), charge(HP 50%, speed x2.0, 2s/10s CD)
  - ingredient: cardamom, bodyColor: 0xe67e22, group 2, reward 32
- gameData.js: ENEMY_TYPES에 maharaja(마하라자, 보스) 추가
  - HP 2200, speed 20, canvasSize 212, isBoss: true
  - spiceBlast: 7초마다 반경 100, damageReduction 25% + rangeReduction 20% (4s)
  - summon: HP 60% 이하 시 masala_guide 3마리 1회 소환
  - enrage: HP 30% 이하 시 speed 35, spiceBlastInterval 절반
  - bossDrops: cardamom x4, saffron x3, chai x2, bossReward 480
- gameData.js: INGREDIENT_TYPES에 cardamom(카다멈, color 0x4caf50) 추가
- SpriteLoader.js: ENEMY_IDS에 masala_guide 추가 (누적 35종)
- SpriteLoader.js: BOSS_IDS에 maharaja 추가 (누적 11종)
- SpriteLoader.js: ENEMY_WALK_HASHES.masala_guide = 'animating-3594d863'
- SpriteLoader.js: BOSS_WALK_HASHES.maharaja = 'animating-2c666ada'
- SpriteLoader.js: INGREDIENT_FILE_MAP.cardamom = 'cardamom'
- stageData.js: 18-1~18-6 placeholder → 완성 (theme: 'spice_palace', 5웨이브)
  - 18-1 황금 회랑: 세로→가로→세로 경로, 진입 난이도 (17-5보다 약간 낮음)
  - 18-2 향신료 회랑: S자형 경로, 완만한 상승
  - 18-3 마살라 문파 도장: masala_guide 대거 등장 고밀도
  - 18-4 황금 왕좌실 전실: 17-5 수준 도달 시작
  - 18-5 향신료 왕국의 정점: 17-5 수준 상한 도달
  - 18-6 마하라자의 왕좌: 일반 4웨이브 + maharaja 보스전(wave 5)
- recipeData.js: 서빙 레시피 7종 추가
  - cardamom_tea (2성, gateStage 18-1, baseReward 78)
  - spiced_cardamom_bread (2성, 18-1, 85)
  - cardamom_masala_bowl (3성, 18-2, 115)
  - masala_lamb (3성, 18-2, 128)
  - maharaja_grand_platter (5성, 18-3, 348)
  - spice_throne_feast (5성, 18-4, 378)
  - maharaja_final_banquet (5성, 18-5, 415)
- recipeData.js: 버프 레시피 1종 추가
  - cardamom_aura (4성, 18-3, 혼란 면역 + 공격력 +20%, 2웨이브)
- 에셋: assets/bosses/maharaja/ (212x212px pro, 8방향 rotations + animating-2c666ada 8방향x8프레임)
- 에셋: assets/enemies/masala_guide/ (108x108px pro, 8방향 rotations + animating-3594d863 8방향x8프레임)
- 에셋: assets/ingredients/cardamom.png (chai.png 복사 placeholder)

### Changed
- gameData.js: 파일 상단 주석 갱신 (적 35종, 재료 27종)
- SpriteLoader.js: 파일 상단 주석 갱신 (Phase 32-5 내역)
- recipeData.js: 파일 상단 주석 갱신 (누적 221종)

### 스펙 대비 변경
- canvasSize: 스펙(maharaja 192, masala_guide 160) → 실측(maharaja 212, masala_guide 108)으로 변경 (AD 모드2 에셋 크기 기준)
- 레시피 누적: 스펙 222종 → 실제 221종 (213+7+1=221, 스펙 산술 오류 수정)
- palace_cardamom_feast: 스펙 stageData 고객 dish에 있었으나 recipeData에 미정의 → maharaja_grand_platter로 대체

### 참고
- 스펙: `.claude/specs/2026-04-14-kc-phase32-5-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase32-5-qa.md` (33/33 PASS)
- cardamom.png는 placeholder (chai.png 복사). 고유 아이콘은 추후 페이즈에서 생성 예정
- maharaja의 spiceBlast/summon/enrage 기믹은 gameData.js 데이터 정의만 완료, 런타임 로직은 기존 보스 처리 코드에 의존

---

## [Phase 32-4] 2026-04-14 — 18장 대화 스크립트 6종

### Added
- dialogueData.js: CHARACTERS에 masala_guide(아르준), maharaja 2종 추가 (누적 13종)
  - masala_guide: id, nameKo='아르준', portrait='🪬', color=0xd4a017, role=ally
  - maharaja: id, nameKo='마하라자', portrait='👑', color=0xb8860b, role=boss
- dialogueData.js: 대화 스크립트 6종 추가 (누적 82종)
  - chapter18_intro: 12라인, 18-1 진입 시, 아르준 신원 공개
  - chapter18_mid: 12라인, 18-3 첫 클리어 후, 정화할수록 각성하는 마하라자
  - chapter18_boss: 10라인, 18-6 진입 시, 마하라자 각성 보스전 직전 대사
  - chapter18_clear: 9라인, 18-6 첫 클리어, onComplete→currentChapter:19 + chapter18_epilogue 연쇄(delay 1200ms)
  - chapter18_epilogue: 11라인, chapter18_clear의 chain으로만 재생, 인도 아크 완결
  - team_side_18: 8라인, merchant_enter에서 1회, 18장 진입 후 팀원 리액션
- storyData.js: 트리거 5건 추가 (누적 82항목)
  - chapter18_intro: gathering_enter, stageId=18-1
  - chapter18_mid: result_clear, stageId=18-3, isFirstClear+stars>0
  - chapter18_boss: gathering_enter, stageId=18-6 (isFirstClear 조건 없음, 기존 boss 패턴)
  - chapter18_clear: result_clear, stageId=18-6, isFirstClear+stars>0, onComplete(currentChapter=19+chapter18_cleared 플래그), chain(chapter18_epilogue, delay 1200ms)
  - team_side_18: merchant_enter, currentChapter>=18, seenDialogues 미포함 조건
- storyData.js: stage_first_clear 제외 목록에 18-1, 18-3, 18-6 추가

### Changed
- dialogueData.js: 17장 ??? 대사 16건 → 아르준(masala_guide) 소급 수정
  - chapter16_mid: 5건, chapter16_epilogue: 2건, chapter17_intro: 4건, chapter17_mid: 5건
  - speaker: '???' → '아르준', portrait: '🧿' → '🪬', portraitKey: 'masala_guide' 추가
- dialogueData.js: fileoverview 갱신 (76종 → 82종, Phase 32-4 항목)
- storyData.js: fileoverview 갱신 (Phase 32-4 항목)

### 참고
- 스펙: `.claude/specs/2026-04-14-kc-phase32-4-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase32-4-qa.md`
- chapter18_epilogue는 storyData.js에 독립 트리거 없이 chapter18_clear의 chain으로만 재생
- 스펙 요구사항의 라인 수(intro 11, boss 9, clear 10)와 스펙 본문 스크립트 라인 수(각 12, 10, 9)에 불일치가 있었으나, 구현은 본문 스크립트를 정확히 반영
- 18장 스테이지 데이터 구현은 Phase 32-5 범위

---

## [Phase 32-3] 2026-04-14 — 17장 스테이지 구현

### Added
- stageData.js: 17-1~17-5 완전 구현 (theme: 'spice_palace', placeholder 제거)
  - 17-1 향신료 궁전 내원: W자 변형 경로, 5웨이브, curry_djinn+naan_golem 중심
  - 17-2 향신료 제단: 대각 Z자형 경로, 5웨이브, 16장 적 점진적 퇴장
  - 17-3 향 제례당: 역U자형 경로, 6웨이브, incense_specter 첫 등장 (wave 3~6)
  - 17-4 정령 의식장: 계단형 경로, 6웨이브, spice_elemental 첫 등장 (wave 2~6)
  - 17-5 향신료 성역: 십자 역방향형 경로, 5웨이브 고밀도, incense_specter+spice_elemental 전 웨이브
  - service: duration 348~370, maxCustomers 59~66, customerInterval 2.1~1.9 (16-5 기준 344에서 선형 증가)
- recipeData.js: chai 활용 서빙 10종 + 버프 2종 추가 (누적 213종 = 서빙 173 + 버프 40)
  - 서빙 2성: chai_masala, spiced_chai_bread (gateStage 17-1)
  - 서빙 3성: chai_rice (17-1), incense_soup (17-2)
  - 서빙 4성: chai_chicken (17-2), deep_spice_stew (17-3)
  - 서빙 5성: chai_grand_curry (17-3), incense_palace_feast (17-4), elemental_platter (17-4), sanctum_grand_feast (17-5)
  - 버프 3성: chai_shield (17-2, 받는 피해 -20% 2웨이브)
  - 버프 4성: incense_blessing (17-4, 공격력+속도 +50% 2웨이브)
- Enemy.js: takeDamage 시그니처 `takeDamage(amount, towerType = null)` 변경
  - elementalResistance 처리: resistTypes 해당 타워 피해에 resistMultiplier(0.50) 적용 (L.883-886)
  - confuseOnHit 처리: 피격 시 confuseChance(0.35) 확률로 'enemy_confuse' 이벤트 emit, x/y/duration 포함 (L.925-931)
  - 자기 피해(burn, DoT)는 towerType=null로 호출 -- elementalResistance 미적용
- Projectile.js: _hit() 기본 피해 `takeDamage(this.damage, this.towerType)`, splash 피해 `takeDamage(splashDamage, this.towerType)` 변경

### 변경
- recipeData.js @fileoverview: 201종 -> 213종 (스펙 211종에서 Coder가 실제 계산 후 213종으로 정정)

### 참고
- 커밋: 53773ce
- 스펙: `.claude/specs/2026-04-14-kc-phase32-3-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase32-3-qa.md`
- QA LOW 소견: confuseOnHit가 towerType 무관하게 발동하여 burn/DoT 자기 피해에도 confuse emit 가능. 현재 수신측(TowerManager) 미구현이므로 실질적 영향 없음.
- confuse 이벤트 수신 측(TowerManager) 로직 구현은 스코프 외 -- emit만 구현

---

## [Phase 32-2] 2026-04-14 — 17장 신규 에셋 4종 생성

### Added
- assets/enemies/incense_specter/: 8방향 스프라이트 (176px 캔버스, 8프레임, animating-7f60bab8)
  - 향 혼령, HP 420, speed 58, confuseOnHit(35%/3초), group 2, reward 30
  - 스펙 canvasSize 92px -> AD 모드2 확정 176px
- assets/enemies/spice_elemental/: 8방향 스프라이트 (164px 캔버스, 8프레임, animating-6e040724)
  - 향신료 정령, HP 500, speed 45, elementalResistance(freezer/wasabi_cannon 50% 감소), group 2, reward 35
  - 스펙 canvasSize 92px -> AD 모드2 확정 164px
- assets/tilesets/spice_palace_interior.png: 128x128px Wang 타일셋 16종 (17장 심층부 실내, 대리석+로열블루+금)
- assets/ingredients/chai.png: 재료 아이콘 32px (클레이 컵 차이 티, 투명 배경)
- gameData.js: ENEMY_TYPES에 incense_specter, spice_elemental 추가 (누적 일반 33종)
- gameData.js: INGREDIENT_TYPES에 chai 추가 (누적 26종, 스펙에 미명시이나 incense_specter.ingredient 참조 충족 위해 추가)
- SpriteLoader.js: ENEMY_IDS +2종(33종), ENEMY_WALK_HASHES +2종, INGREDIENT_FILE_MAP +1종(chai), TILESET_IDS +1종(spice_palace_interior, 14종)

### 참고
- 커밋: 1c6c057
- 스펙: `.claude/specs/2026-04-14-kc-phase32-2-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase32-2-qa.md`
- confuseOnHit/elementalResistance 로직 구현은 Phase 32-3 스코프 (현재 데이터만 등록)
- INGREDIENT_TYPES(25->26종)과 INGREDIENT_FILE_MAP(26종) 카운트: herb_bundle 미등록 이슈는 Phase 28-2 이전 기존 문제

---

## [Phase 32-1] 2026-04-14

### Added
- dialogueData.js: 대화 스크립트 4종 추가 (누적 76종)
  - chapter16_epilogue: 16-5 클리어 직후, 심층부 진입 결의
  - chapter17_intro: 17-1 진입 시, 향신료 금고 발견
  - chapter17_mid: 17-3 클리어 후, 마하라자의 음모 일부 공개
  - team_side_17: merchant_enter에서 1회, 17장 진입 후 팀원 리액션
- storyData.js: 트리거 4건 추가 (누적 77항목)
  - chapter16_epilogue: result_clear 16-5 첫 클리어, currentChapter=17 설정
  - chapter17_intro: gathering_enter 17-1 진입 시
  - chapter17_mid: result_clear 17-3 첫 클리어, chapter17_mid_seen 플래그
  - team_side_17: merchant_enter, currentChapter >= 17 조건
- storyData.js: stage_first_clear 제외 목록에 16-5, 17-1, 17-3 추가

### 참고
- 커밋: e074e70
- 스펙: 없음 (quick 모드, visual_change: none)

---

## [Phase 31-3] 2026-04-14

### Added
- stageData.js: 스테이지 16-1 ~ 16-5 완전 구현 (theme: spice_palace)
  - 16-3부터 curry_djinn 등장, 16-4부터 naan_golem 등장
- recipeData.js: 인도 요리 레시피 15종 추가 (누적 201종 = 서빙 163 + 버프 38)
  - curry_leaf_soup, spiced_flatbread, saffron_rice, butter_chicken, tandoori_grill, chicken_tikka, saffron_biryani, maharaja_feast 등
- Enemy.js: curry_djinn 텔레포트 메커닉 (_updateTeleport, 6000ms 주기)
- Enemy.js: naan_golem 자가 회복 (regenRate 6, 기존 범용 로직 적용)
- gameData.js: curry_leaf/saffron 아이콘 PNG 경로 교체

### 참고
- 커밋: 05554e6
- 스펙: `.claude/specs/2026-04-14-kc-phase31-3-scope.md`

---

## [Phase 31-2] 2026-04-14

### Added
- assets/sprites/enemies/curry_djinn/: 8방향 walking 스프라이트 (164px 캔버스, 8프레임, animating-c40a2ab6)
  - HP 380, 텔레포트 능력
- assets/sprites/enemies/naan_golem/: 8방향 walking 스프라이트 (120px 캔버스, 8프레임, animating-33505870)
  - HP 450, 자가 회복 6HP/s
- assets/tilesets/spice_palace/: 128x128px Wang 타일셋 16종 (향신료 궁전)
- assets/icons/curry_leaf.png: 재료 아이콘 32px
- assets/icons/saffron.png: 재료 아이콘 32px
- gameData.js: ENEMY_TYPES에 curry_djinn(HP 380, teleport), naan_golem(HP 450, regen 6) 추가 (누적 일반 31종)
- gameData.js: INGREDIENT_TYPES에 curry_leaf, saffron 추가 (누적 25종)
- SpriteLoader.js: ENEMY_IDS +2종, ENEMY_WALK_HASHES +2종, INGREDIENT_FILE_MAP +2종, TILESET_IDS +1종

### 참고
- 커밋: 2d7e210 (feat), ca8a5a6 (fix)
- 스펙: `.claude/specs/2026-04-14-kc-phase31-2-scope.md`

---

## [Phase 31-1] 2026-04-14

### Added
- dialogueData.js: chapter16_intro, chapter16_mid, team_side_16 대화 3종 추가 (누적 72종)
  - chapter16_intro: 8줄 (향신료 시장 탐사, 강렬한 냄새, 인도 도착 첫 인상)
  - chapter16_mid: 11줄 (마살라 문파와의 첫 접촉, ??? speaker 5줄 portraitKey 미설정)
  - team_side_16: 8줄 (팀 사이드 대화, 향신료 시장 여담)
- storyData.js: 15장 트리거 5건 등록 (chapter15_boss, chapter15_clear, chapter15_epilogue, side_15a, side_15b)
  - chapter15_epilogue onComplete: currentChapter=16 설정, chapter15_cleared 플래그 설정
  - side_15b 조건에 seenDialogues.includes('side_15a') 순서 보장
- storyData.js: 16장 트리거 3건 등록 (chapter16_intro, chapter16_mid, team_side_16)
  - chapter16_intro: 16-1 진입 시 발화
  - chapter16_mid: 16-3 첫 클리어 시 발화
  - team_side_16: merchant 진입 시 발화 (ch>=16)
- storyData.js: stage_first_clear 제외 목록에 15-5/15-6/16-1/16-3 추가

### 참고
- QA 전체 PASS (정상 14개 + 대화품질 4개 = 총 18개)
- ??? speaker(마살라 문파 대표)는 Phase 31-2에서 캐릭터 확정 후 portraitKey 추가 예정
- chapter14_clear 대화는 여전히 미등록 (Phase 28-4에서 추가 필요)
- 스펙: `.claude/specs/2026-04-14-kc-phase31-1-scope.md`
- QA: `.claude/specs/2026-04-14-kc-phase31-1-qa.md`

---

## [Phase 30] 2026-04-14

### Added
- EndlessWaveGenerator.js: POOL_TIER_5 (그룹2 적 10종, 웨이브 21+ 적용)
  - sushi_ninja, tempura_monk, sake_specter, oni_minion, dumpling_warrior, wok_phantom, shadow_dragon_spawn, wok_guardian, wine_specter, foie_gras_knight
- EndlessWaveGenerator.js: BOSS_POOL에 그룹2 보스 3종 추가 (sake_oni, sake_master, dragon_wok, 총 9종)
- EndlessWaveGenerator.js: `_getEnemyPool`에 `waveNumber >= 21` 분기 추가
- storyData.js: 14장 STORY_TRIGGERS 4건 선등록 (chapter14_intro, chapter14_mid, team_side_14, chapter14_clear)
- storyData.js: stage_first_clear 제외 목록에 14-1/14-3/14-5 추가
- ROADMAP.md: Phase 28-3a(8장 구현), Phase 28-4(14장 구현) 항목 추가

### Analysis
- 7~15장(8·14장 제외) 구현 스테이지 42개 DPS/HP 커브 검증 완료
  - 장별 보스 HP 커브: oni_herald(800) → sake_oni(6000) → sake_master(7500) → dragon_wok(7000) → chef_noir(9000)
  - 과밀 경고 스테이지: 9-4~9-5, 12-4~12-5, 13-4~13-5, 15-4~15-5 (후속 Phase 조정 대상)
- wasabi_cannon, spice_grinder Lv1~3 DPS 적정 범위 확인 (조정 불필요)
  - wasabi_cannon Lv3: 33.3 DPS + 스플래시(55px) + 둔화(35%), CC 역할 특화
  - spice_grinder Lv3: 53.3 DPS (직접 29.3 + DoT 24.0), grill 대비 낮으나 역할 분리
- yuki_chef(cryo_execute), lao_chef(power_surge) 스킬 밸런스 양호 (조정 불필요)
  - cryo_execute: 빙결 수 의존 제한, 쿨다운 90초
  - power_surge: 전 도구 5초 2배, 쿨다운 120초 (업타임 4.2%)

### Known Issues
- chapter14_clear 대화가 dialogueData.js에 미등록 (14장 placeholder 상태, Phase 28-4에서 추가 필수)
- cellar_phantom, sommelier_wraith ENEMY_TYPES 미등록 (13-6/15장 DPS 판정 보류)
- chef_noir ENEMY_TYPES 미등록 (BOSS_POOL 제외 유지)

### 참고
- QA 전체 PASS (13항목: PASS 11, PASS(WARN) 2)
- 스펙: `.claude/specs/2026-04-14-kc-phase30-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase30-qa.md`

---

## [Phase 29-2] 2026-04-14

### Added
- stageData.js: 15-1~15-6 카타콩브 스테이지 구현 (양식 아크 완성)
  - 15-1 카타콩브 입구 (뱀형/M자, 5 waves)
  - 15-2 카타콩브 통로 (소용돌이/나선, 5 waves)
  - 15-3 카타콩브 지하 홀 (십자형, 6 waves)
  - 15-4 카타콩브 제단 (Z자, 6 waves)
  - 15-5 셰프 누아르의 어둠 (역T자, 6 waves, triggerDialogue: chapter15_boss)
  - 15-6 최후의 결전 (직선, 3 waves 보스전, isBossBattle, triggerDialogueClear: chapter15_clear)
- stageData.js: 13-6 비스트로 비밀 지하실 구현 (bistro_parisian, 5 waves, T자 패턴)
- recipeData.js: 허브 레시피 20종 추가 (서빙 16 + 버프 4), 누적 186종
  - 서빙: herb_butter_toast, herb_escargot_plate (tier2), catacomb_herb_roast, herb_mushroom_soup, herb_fish_meuniere, herb_truffle_bisque, cellar_herb_plate, herb_egg_galette (tier3), herb_noir_ragout, catacomb_herb_croute, herb_shrimp_bisque, herb_truffle_risotto, noir_herb_course (tier4), catacomb_grand_finale, herb_cellar_banquet, noir_final_tasting (tier5)
  - 버프: herb_focus_brew, herb_slow_essence (tier3), catacomb_awakening, noir_essence (tier4)

### Changed
- stageData.js fileoverview: Phase 29-2 이력 추가
- recipeData.js fileoverview: Phase 29-2 이력 추가, 누적 186종 표기

### 참고
- QA 16/16 PASS
- 15장 주력 적: cellar_phantom, sommelier_wraith (Phase 28-2), wine_specter, foie_gras_knight
- 15-6 보스: chef_noir (HP 9000, 3페이즈, bossReward 500)
- 13~15장 DPS 커브: 15-1~15-2는 13-5 대비 6~10% 상승, 15-3~15-5는 6웨이브 확장으로 총 HP 부하 154~190% 상승
- 스펙: `.claude/specs/2026-04-14-kc-phase29-2-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase29-2-qa.md`

---

## [2026-04-14] - Phase 29-1 15장 셰프 누아르 보스 에셋 + 대화 스크립트

### 추가

- **chef_noir 보스 스프라이트** (`assets/bosses/chef_noir/`)
  - PixelLab pro 모드, 64px 캐릭터, 124x124px 캔버스 (스펙 92px에서 PixelLab 출력 기준 124px로 변경, 런타임 영향 없음)
  - 8방향 rotations + 8방향 x 8프레임 walking 애니메이션 (animating-96100c0f)
  - 제트 블랙 셰프복, 토크 블랑슈(셰프 모자), 네온 그린(#4AFFA0) 미력 오라, 치비 비율
  - metadata.json export_version 2.0, character.name="chef_noir", template_id="mannequin"

- **대화 스크립트 5종** (`js/data/dialogueData.js`, 누적 69종)
  - chapter15_boss (14줄): 카타콩브 최심부, 셰프 누아르 첫 대면, "강요된 정화야말로 예술의 폭력이다" 철학 대립
  - chapter15_clear (12줄): 누아르 정화 후, 양식 아크 완결, WCA 자수 결정
  - chapter15_epilogue (13줄): 앙드레-누아르 사제 관계 공개, WCA 내부 개혁 암시, 포코 유머
  - side_15a (9줄): 전투 후 회복, 포코 할인 쿠폰, 캐릭터 개성
  - side_15b (11줄): 유럽 바깥 새 식란 징후, 다음 여정 암시 (시즌 확장 복선)

- **CHARACTERS.chef_noir** (`js/data/dialogueData.js`)
  - id='chef_noir', nameKo='셰프 누아르', portraitKey='chef_noir', role='boss', color=0x1a1a2e

### 변경

- **SpriteLoader.js** (`js/managers/SpriteLoader.js`)
  - BOSS_IDS: 9종 -> 10종 (chef_noir 추가, 인덱스 9)
  - BOSS_WALK_HASHES: chef_noir='animating-96100c0f' 추가
  - fileoverview 주석: "Phase 29-1: 15장 보스 1종(chef_noir) 추가"

- **dialogueData.js** fileoverview 주석: "Phase 29-1: 15장 셰프 누아르 최종전 대화 5종 추가 ... 누적 69종"

### 참고

- QA 15/15 PASS (에셋 5 + SpriteLoader 5 + dialogueData 5)
- 캔버스 크기 124px는 스펙 기술 92px와 다르지만, PixelLab pro 모드 64px 캐릭터의 실제 출력값. 런타임 영향 없음
- WALK_FRAME_COUNT=6 vs 8프레임 에셋 불일치는 Phase 21부터 존재하는 기존 이슈 (scope 외)
- 스펙: `.claude/specs/2026-04-14-kc-phase29-1-spec.md`
- QA: `.claude/specs/2026-04-14-kc-phase29-1-qa.md`
- AD 컨셉: `.claude/specs/2026-04-14-phase29-1-art-concept.md`

---

## [2026-04-14] - Phase 28-2 14장 에셋 생성

### 추가

- **cellar_phantom 적 스프라이트** (`assets/enemies/cellar_phantom/`)
  - 92x92px, 8방향 x 8프레임 걷기 애니메이션 (animating-387abc3e)
  - 남색/흑보라(#1010A0~#000060) 반투명 유령, 붉은 눈(#FF2020), 카타콩브 잠복형
  - HP ~400, 잠복+기습 메커닉 (게임 로직은 Phase 28-3에서 등록)

- **sommelier_wraith 적 스프라이트** (`assets/enemies/sommelier_wraith/`)
  - 92x92px, 8방향 x 8프레임 걷기 애니메이션 (animating-7cb39ccd)
  - 다크레드/버건디(#600020~#800030) 소믈리에 유령, 황금 눈(#FFD040), 와인 글라스 소품
  - HP ~380, 버프 해제 메커닉 (게임 로직은 Phase 28-3에서 등록)

- **wine_cellar 타일셋** (`assets/tilesets/wine_cellar.png/.json`)
  - 128x128px, Wang 16타일, 32x32 tile_size
  - 어두운 돌바닥 + 오크 와인 통 단면, 파리 카타콩브 분위기

- **herb_bundle 재료 아이콘** (`assets/ingredients/herb_bundle.png`)
  - 32x32px, 올리브 그린/갈색 말린 허브 묶음, 투명 배경(75.3%)

### 변경

- **SpriteLoader.js** (`js/managers/SpriteLoader.js`)
  - ENEMY_IDS: 27종 -> 29종 (cellar_phantom, sommelier_wraith 추가)
  - ENEMY_WALK_HASHES: cellar_phantom='animating-387abc3e', sommelier_wraith='animating-7cb39ccd' 추가
  - TILESET_IDS: 11종 -> 12종 (wine_cellar 추가)
  - INGREDIENT_FILE_MAP: 22종 -> 23종 (herb_bundle 추가)

### 참고

- QA 17/17 PASS (시각 검증 8항목 포함), 콘솔 에러 0건
- WALK_FRAME_COUNT=6 vs 8프레임 에셋 불일치는 Phase 21부터 존재하는 기존 이슈 (scope 외)
- TILESET_IDS 12종 중 dessert_cafe, grand_finale, sakura_izakaya 3종은 PNG 미생성 상태 (기존 이슈)
- 스펙: `.claude/specs/2026-04-14-kc-phase28-2-scope.md`
- QA: `.claude/specs/2026-04-14-kc-phase28-2-qa.md`
- AD 컨셉: `.claude/specs/2026-04-14-phase28-2-art-concept.md`

---

## [2026-04-14] - Phase 28-1 14장 대화 스크립트

### 추가

- **대화 스크립트 3종** (`.claude/specs/2026-04-14-kc-phase28-1-script.md`)
  - chapter14_intro (14줄): 카타콩브 진입, 셰프 누아르 요리 철학서 발견, "강요된 정화 = 예술의 폭력"
  - chapter14_mid (13줄): 피해 기록 발견, 팀 갈등 — 악인인가 피해자인가, 유키(원칙)/라오(실용)/미미(공감) 포지션
  - team_side_14 (12줄): 카타콩브 간식 파티, 라오의 말린 허브(herb_bundle 연결), 앙드레 유대

### 참고

- 셰프 누아르는 14장에서 직접 등장하지 않음 -- 노트와 기록을 통한 간접 복선
- Phase 29에서 첫 대면 + 보스전 예정
- 스펙: `.claude/specs/2026-04-14-kc-phase28-1-script.md`

---

## [2026-04-14] - Phase 27-3 13장 별빛 비스트로 스테이지/레시피 구현

### 추가

- **gameData.js**: truffle 재료 추가 (누적 22종), wine_specter/foie_gras_knight 적 데이터 등록
  - wine_specter: HP 320, speed 62, invisible:true, wineDebuff 데이터 선등록 (발동 로직은 후속 Phase)
  - foie_gras_knight: HP 420, speed 38, shieldFrontHeavy:0.70, enrageHpThreshold:0.35, enrageSpeedMultiplier:1.8

- **stageData.js**: 13-1~13-5 스테이지 5개 구현 (placeholder 교체)
  - 전체 theme: bistro_parisian, availableTowers 8종, gridCols:9/gridRows:10
  - 13-1 비스트로 외관 (5웨이브), 13-2 비스트로 입구 홀 (5웨이브), 13-3 비스트로 주방 (6웨이브), 13-4 비스트로 와인 셀러 (6웨이브), 13-5 셰프 누아르의 주방 (5웨이브, 보스 선등장 패턴)
  - 12장 4종 경로 순환 재사용 (L자/S자/W자/U자/역Z자)

- **recipeData.js**: 트러플 서빙 레시피 8종 + 버프 레시피 2종 추가 (156종 → 166종)
  - 서빙: truffle_bisque(T2), foie_gras_toast(T2), truffle_risotto(T3), wine_truffle_plate(T3), truffle_pasta(T3), bistro_full_course(T4), wine_seafood_bisque(T4), noir_tasting_course(T5)
  - 버프: truffle_essence(T3, 취기면역+공속+15%, 3웨이브), noir_awakening(T4, 공격력+속도+35%, 2웨이브)

- **storyData.js**: 13장 스토리 트리거 4건 등록 (누적 60항목)
  - chapter13_intro (13-1 입장 시), chapter13_mid (13-3 첫 클리어 시), mimi_side_13 (행상인 1회), chapter13_clear (13-5 첫 클리어 시 + currentChapter→14)
  - stage_first_clear 제외 목록에 13-1/13-3/13-5 추가

- **dialogueData.js**: chapter13_clear 대화 1종 추가 (누적 61종)
  - 6줄 (narrator + 앙드레x2 + 미미x2 + 라오x1), 비스트로 심층부 완파 + 14장 예고

### 참고

- buff_wine_immunity 면역 처리는 스펙상 RecipeManager.js로 기술되었으나, 실제 GatheringScene.js:1580에 구현됨 (기존 buff_narcotize_immunity와 동일 위치). 기능 정상 동작
- wineDebuff 발동 로직 자체는 미구현 (데이터 선등록 상태). 기존 buff_narcotize_immunity도 동일 상황 (Phase 22-3 선례)
- 난이도: 13장은 12장 대비 총 적 수는 적으나, wine_specter/foie_gras_knight의 높은 HP + 은신/전면방어/격노 메커닉으로 실질 난이도 상승
- QA 26/26 PASS (Playwright 테스트), 콘솔 에러 0건
- 스펙: `.claude/specs/2026-04-14-kc-phase27-3-scope.md`
- QA: `.claude/specs/2026-04-14-kc-phase27-3-qa.md`

---

## [2026-04-14] - Phase 27-2 13장 에셋 생성

### 추가

- **wine_specter 적 스프라이트** (`assets/enemies/wine_specter/`)
  - 92x92px, 8방향 x 8프레임 걷기 애니메이션 (animating-aaf41951)
  - 보라/마젠타 유령 실루엣, 하단 퍼플 글로우, 치비 스타일
  - HP ~350, 취기 디버프 (게임 로직은 Phase 27-3에서 등록)

- **foie_gras_knight 적 스프라이트** (`assets/enemies/foie_gras_knight/`)
  - 92x92px, 8방향 x 8프레임 걷기 애니메이션 (animating-d9b31bcd)
  - 황금 갑옷+방패+투구 기사, 치비 스타일
  - HP ~400, 방어 특화 (게임 로직은 Phase 27-3에서 등록)

- **bistro_parisian 타일셋** (`assets/tilesets/bistro_parisian.png/.json`)
  - 128x128px, Wang 16타일, 32x32 tile_size
  - 크림 화이트 마블 + 흑백 대각선 헤링본 패턴, 파리 비스트로 분위기

- **truffle 재료 아이콘** (`assets/ingredients/truffle.png`)
  - 32x32px, 흑보라 계열 흑트러플, 불투명 픽셀 415개

### 변경

- **SpriteLoader.js** (`js/managers/SpriteLoader.js`)
  - ENEMY_IDS: 25종 → 27종 (wine_specter, foie_gras_knight 추가)
  - ENEMY_WALK_HASHES: wine_specter='animating-aaf41951', foie_gras_knight='animating-d9b31bcd' 추가
  - TILESET_IDS: 9종 → 11종 (bistro_parisian 추가, 기타 미생성 ID도 선등록)
  - INGREDIENT_FILE_MAP: 15종 → 22종 (truffle 추가 + 이전 페이즈 누락분 일괄 등록)

### 참고

- AD 리뷰에서 wine_specter REVISE, foie_gras_knight FAIL 판정 후 92px 재생성으로 해결
- QA 48/48 PASS (Playwright 테스트 14.2s)
- 주석 3곳 stale 상태 (ENEMY_IDS/INGREDIENT_IDS/TILESET_IDS 수량 주석), 심각도 LOW
- WALK_FRAME_COUNT=6 vs animating- 에셋 8프레임 불일치는 Phase 21부터 존재하는 기존 설계 (frame_006/007 dead asset)
- 스펙: `.claude/specs/2026-04-14-kc-phase27-2-scope.md`
- QA: `.claude/specs/2026-04-14-kc-phase27-2-qa.md`
- AD: `.claude/specs/2026-04-14-kc-phase27-2-art-review.md`

---

## [2026-04-14] - Phase 27-1 13장 스크립트

### 추가

- **chapter13 대화 3종** (`js/data/dialogueData.js`, 누적 60종)
  - chapter13_intro (15줄): 파리 도착, WCA 유럽 지부장 앙드레와 첫 대면
  - chapter13_mid (13줄): 비스트로 심층부 접근, 셰프 누아르 첫 언급
  - mimi_side_13 (12줄): 파리에서의 팀 일상 (크루아상, 마카롱)

- **CHARACTERS에 앙드레(andre) 추가** (`js/data/dialogueData.js`)
  - nameKo: 'WCA 유럽 지부장', portrait: emoji, color: 0x4169e1 (로열 블루)
  - 누적 캐릭터 10종

### 참고

- `pipeline: quick`으로 처리 (스토리 대사 집필만, 코드 로직 변경 없음)
- 스토리 트리거는 Phase 27-3에서 stageData.js와 함께 등록 예정
- 스펙: `.claude/specs/2026-04-14-kc-phase27-1-script.md`

---

## [2026-04-13] - Phase 26 dragon_wok 리워크 + 12장 중식 아크 완성

### 추가

- **sake_master 보스** (`js/data/gameData.js`)
  - id: sake_master, hp: 7500, speed: 18, isBoss: true, bodyColor: 0x8844bb
  - brewCycle 기믹: 6초마다 90px 범위 도구에 발효 디버프(공격력 -25%, 4초) + 150px 범위 아군 적 80 HP 회복
  - 봉인 방어막: HP 55% 이하 시 1500 HP 방어막 활성화, 초과 피해 본체 전달
  - 분노: HP 30% 이하 시 brewInterval 3초로 단축 + range_reduction 이벤트 emit
  - bossReward: 420, bossDrops: sake x5, sashimi_tuna x3

- **Enemy.js 기믹 구현** (`js/entities/Enemy.js`)
  - `_updateBrewCycle()` + `_onBrewCycleActivate()`: brewCycle 기믹 로직
  - `takeDamage()`에 sealShield 방어막 흡수 로직 추가
  - enrage 로직: brewInterval 절반 + `range_reduction` 이벤트 emit
  - `hpOverride` 스폰 파라미터: constructor 4번째 인자 spawnData에서 maxHp/hp 덮어쓰기

- **WaveManager.js hpOverride 전달 체인** (`js/managers/WaveManager.js`)
  - `_buildSpawnQueue` -> `update` -> `_spawnEnemy` -> `Enemy constructor`로 hpOverride 전달

- **12장 레시피 10종** (`js/data/recipeData.js`, 누적 156종 = 서빙 126 + 버프 30)
  - 서빙 8종: dragon_soup(88), wok_flame_rice(80), dragon_dim_sum(72), fire_wok_noodle(95), palace_hotpot(120), imperial_tofu_feast(110), dragon_wok_banquet(145), final_dragon_course(180)
  - 버프 2종: dragon_fire_boost(화염 +50%, 2웨이브), dragon_wok_aura(공격력+속도 +35%, 2웨이브)
  - gateStage: 12-1 ~ 12-5 범위

- **chapter12 대화 5종** (`js/data/dialogueData.js`, 누적 57종)
  - chapter12_intro: 12-1 입장, 라오 용의 궁전 진입 결의
  - chapter12_lao_mid: 12-3 클리어, 라오 과거 회상 (dragon_wok 각성 고백)
  - chapter12_boss: 12-6 입장, dragon_wok 최후 대면
  - chapter12_clear: 12-6 클리어, dragon_wok 정화 완료, 중식 아크 완결, currentChapter -> 13
  - lao_side_12: 행상인 방문 시, 라오 감사 사이드 대화

- **CHARACTERS에 sake_master 추가** (`js/data/dialogueData.js`)
  - nameKo: '주조 달인', portrait: emoji, role: boss

- **SpriteLoader.js 보스 등록** (`js/managers/SpriteLoader.js`)
  - BOSS_IDS에 'sake_master' 추가 (누적 9종)
  - BOSS_WALK_HASHES: sake_master = 'animating-8d3d020e', dragon_wok = 'animating-30e6c64f' (신규)

- **보스 에셋 2종** (`assets/sprites/bosses/`)
  - `sake_master/animations/animating-8d3d020e/`: 64px, 8방향 x 8프레임 (보라-청자 계열 양조 노인)
  - `dragon_wok/animations/animating-30e6c64f/`: 64px, 8방향 x 8프레임 (붉은 드래곤 보스, 화염 디테일)

- **stageData 8개 스테이지 교체/완성** (`js/data/stageData.js`)
  - 10-6: sake_master 보스전으로 교체 (dragon_wok 제거), theme: izakaya_underground, 5웨이브
  - 11-6: dragon_wok 약화 선등장 미니전 완성, theme: dragon_lair, 6웨이브 (wave 6: dragon_wok hpOverride:2500)
  - 12-1: 용의 궁전 입구 (5웨이브)
  - 12-2: 용의 가문 훈련장 (5웨이브)
  - 12-3: 용의 불꽃 정원 (6웨이브)
  - 12-4: 용의 궁전 내전 (6웨이브)
  - 12-5: 용의 왕좌 앞 (6웨이브)
  - 12-6: 드래곤 웍 최후의 결전 (보스, 5웨이브, dragon_wok 정식 보스전)

- **chapter12 스토리 트리거 5건** (`js/data/storyData.js`, 누적 56항목)
  - gathering_enter 12-1 -> chapter12_intro
  - result_clear 12-3 -> chapter12_lao_mid + chapter12_mid_seen 플래그
  - gathering_enter 12-6 -> chapter12_boss
  - result_clear 12-6 -> chapter12_clear + chapter12_cleared 플래그 + currentChapter 13
  - merchant_enter -> lao_side_12 (12장 클리어 후 1회)
  - stage_first_clear 제외 목록에 12-1, 12-3, 12-6 추가

- **SaveManager v16 마이그레이션** (`js/managers/SaveManager.js`)
  - SAVE_VERSION: 15 -> 16
  - v15->v16 블록: storyFlags 객체 보장, chapter12_cleared: false, chapter12_mid_seen: false 기본값 추가
  - 10-6 기존 클리어 기록은 스테이지 데이터 변경과 독립적이므로 별도 처리 불필요

- **WorldMapScene 12장 활성화** (`js/scenes/WorldMapScene.js`)
  - ch12 nameKo: '12장: (미구현)' -> '12장: 용의 궁전'

### 변경

- **dragon_wok 스프라이트 해시 교체** (`js/managers/SpriteLoader.js`)
  - BOSS_WALK_HASHES.dragon_wok: `animating-8efd2218` (Phase 21) -> `animating-30e6c64f` (Phase 26)
  - 기존 에셋 폴더 디스크 잔존 (dead asset, 코드 참조 없음)

### 참고
- 스펙: `.claude/specs/2026-04-13-kc-phase26-impl.md`
- QA 26-1: `.claude/specs/2026-04-13-kc-phase26-1-qa.md` (45/45 PASS)
- QA 26-2: `.claude/specs/2026-04-13-kc-phase26-2-qa.md` (30/30 PASS)
- 스펙 대비 차이: lao_side_12 동시 대사("라오+미미: '안 돼!'")를 별도 lines로 분리 (대화 시스템 동시 표시 미지원)
- LOW 이슈: chapter12_lao_mid onComplete에 storyFlags 안전 가드 누락 (v16 마이그레이션으로 실사용 문제 없음, 코드 일관성 차원에서 후속 정리 권장)
- LOW 이슈: 기존 dragon_wok 에셋 animating-8efd2218 폴더 디스크 잔존 (빌드 용량 절감 위해 삭제 권장)

---

## [2026-04-13] - Phase 25-2 11장 walk 애니메이션 + dark_debuff 수신자

### 추가

- **shadow_dragon_spawn walk 애니메이션** (`assets/enemies/shadow_dragon_spawn/animations/walking-dde29672/`)
  - 8방향 x 6프레임 = 48 PNG (92x92px)
  - PixelLab animate_character API로 생성, character_id: `08983815-9751-476a-90b6-b5f6a8ee8802`
  - metadata.json에 animations 블록 추가 (export_version 2.0)

- **wok_guardian walk 애니메이션** (`assets/enemies/wok_guardian/animations/walking-bc1aca17/`)
  - 8방향 x 6프레임 = 48 PNG (92x92px)
  - PixelLab animate_character API로 생성, character_id: `9c33ea4c-e9b0-4fe3-a09c-5dc97400e416`
  - metadata.json에 animations 블록 추가 (export_version 2.0)

- **GatheringScene `_onDarkDebuff` 핸들러** (`js/scenes/GatheringScene.js`)
  - `dark_debuff` 이벤트 리스너 등록 (create) + 해제 (shutdown)
  - 범위(80px) 내 타워에 공격력 -20%, 5초 후 해제
  - delivery/soup_pot 타워 제외, `_darkDebuffed` 플래그로 중복 방지
  - 해제 시 `removeBuff()` + `_applyBuffToTower`로 레시피 버프 복원
  - `_onSporeDebuff` 패턴 준수 + `.setOrigin(0.5).setDepth(115)` 일관성 개선 추가

### 변경

- **SpriteLoader.js** (`js/managers/SpriteLoader.js`)
  - `ENEMY_WALK_HASHES.shadow_dragon_spawn`: `null` → `'walking-dde29672'`
  - `ENEMY_WALK_HASHES.wok_guardian`: `null` → `'walking-bc1aca17'`
  - `ENEMY_IDS` 주석: "23종" → "25종"

### 참고
- 스펙: `.claude/specs/2026-04-13-kc-phase25-2-impl.md`
- QA: `.claude/specs/2026-04-13-kc-phase25-2-qa.md` (30/30 PASS)
- QA LOW 이슈: removeBuff() 전역 초기화로 디버프 동시 만료 시 상호 간섭 가능 -- 기존 설계(spore/fire_zone/boss 모두 동일), 범위 밖
- 스펙 대비 차이: `_onDarkDebuff`에 `.setOrigin(0.5).setDepth(115)` 추가 (스펙 미포함, 기존 패턴 일관성 개선)

---

## [2026-04-13] - Phase 25-1 11장 용의 주방 심층부 기반 구축

### 추가

- **gameData.js** (`js/data/gameData.js`)
  - ENEMY_TYPES에 shadow_dragon_spawn 추가: hp:380, speed:60, darkDebuff:true, darkInterval:5000ms, darkRadius:80px, darkEffect:{damageReduction:0.20, duration:5000}
  - ENEMY_TYPES에 wok_guardian 추가: hp:450, speed:40, shieldFrontHeavy:0.70, ingredient:'star_anise'
  - INGREDIENT_TYPES에 star_anise(팔각) 추가: color:0x8b1a1a

- **SpriteLoader.js** (`js/managers/SpriteLoader.js`)
  - ENEMY_IDS 배열에 shadow_dragon_spawn, wok_guardian 추가
  - ENEMY_WALK_HASHES에 null 엔트리 2종 (PixelLab 생성 후 hash 기입 필요)
  - INGREDIENT_FILE_MAP에 star_anise 추가
  - TILESET_IDS에 dragon_lair 추가

- **Enemy.js** (`js/entities/Enemy.js`)
  - constructor에 darkDebuff 초기화 블록 추가 (_darkDebuffTimer)
  - update()에 _updateDarkDebuff 호출 분기 추가
  - _updateDarkDebuff() 메서드 신규: 5초마다 dark_debuff 이벤트 emit (x, y, radius, damageReduction, duration)
  - takeDamage()에 shieldFrontHeavy 분기 추가: 전면 피해 70% 감소 (실제 받는 피해 = 30%)
  - _buildShapeFallback 직사각형 분기에 wok_guardian 추가

- **stageData.js** (`js/data/stageData.js`)
  - 11-1~11-5 placeholder를 완전한 웨이브 데이터로 교체
  - 11-1: 5웨이브, 11-2~11-5: 각 6웨이브, theme: 'dragon_lair'
  - 11-6은 placeholder 유지 (Phase 26 범위)

- **recipeData.js** (`js/data/recipeData.js`)
  - 서빙 레시피 8종 추가: star_anise_broth_ramen(2성), five_spice_stir_fry(2성), mapo_star_anise_steam(3성), star_anise_hotpot(3성), star_anise_wok_noodle(3성), dragon_spice_banquet(4성), star_anise_duck_roast(4성), legendary_star_anise_course(5성)
  - 버프 레시피 2종 추가: star_anise_ward(어둠 면역+공격력 15%, 3웨이브), dragon_five_spice(공격력 30%+공속 20%, 2웨이브)
  - 누적: 서빙 118종 + 버프 28종 = 총 146종

- **dialogueData.js** (`js/data/dialogueData.js`)
  - chapter11_intro(8줄): 심층부 진입, 팔각 봉인 설명
  - chapter11_mid(8줄): 11-4 클리어 후, 최심층 개방
  - lao_side_11(10줄): 라오 팔각 회상 사이드 스토리

- **storyData.js** (`js/data/storyData.js`)
  - 트리거 3건: 11-1 gathering_enter→chapter11_intro, 11-4 result_clear→chapter11_mid, merchant_enter→lao_side_11
  - stage_first_clear 제외 목록에 11-1, 11-4 추가
  - chapter11_mid onComplete에서 storyFlags.chapter11_mid_seen 설정

- **WorldMapScene.js** (`js/scenes/WorldMapScene.js`)
  - ch11 nameKo '11장: (미구현)' → '11장: 용의 주방 심층부' 활성화, 테마 색상/아이콘 갱신

- **에셋 4종 생성**
  - `assets/enemies/shadow_dragon_spawn/`: 64px chibi 8방향 스프라이트 (그림자 용 새끼)
  - `assets/enemies/wok_guardian/`: 64px chibi 8방향 스프라이트 (웍 수호자)
  - `assets/tilesets/dragon_lair.png`: 16x16 Wang 타일셋
  - `assets/ingredients/star_anise.png`: 32px 투명 배경 재료 아이콘

- **ART-STANDARD.md** (`docs/ART-STANDARD.md`)
  - 에셋 레지스트리 적(Enemies) 표에 shadow_dragon_spawn, wok_guardian 항목 추가

### 참고
- 스펙: `.claude/specs/2026-04-13-kc-phase25-1-impl.md`
- 구현 리포트: `.claude/specs/2026-04-13-phase25-1-report.md`
- QA: `.claude/specs/2026-04-13-kc-phase25-1-qa.md`
- QA 판정: PASS (39/39 전체 통과 -- 수용기준 19, 예외시나리오 9, 에셋 6, UI안정성 3, 시각적 2)
- 스펙에서 WorldMapScene ch11 활성화는 "Phase 25-2 범위"로 기재되었으나, 구현 시 사용자 요청으로 Phase 25-1에서 완료
- 구현 리포트의 레시피 누적 수(136/30=166)는 오류. QA에서 실제 118/28=146으로 정정됨
- dark_debuff 이벤트 수신자(GatheringScene/ToolManager)는 미구현. 이벤트 emit은 되지만 리스너 없어 실질적 효과 없음. Phase 25-2에서 구현 필요
- ENEMY_WALK_HASHES에 null로 등록된 2종은 walk 애니메이션 미활성. Phase 25-2에서 hash 기입 필요
- SpriteLoader ENEMY_IDS 주석 "// 23종"이 실제 25종과 불일치 (사소한 주석 오류)

---

## [2026-04-13] - Phase 24-2 WorldMapScene 24챕터 3탭 UI 확장

### 추가

- **stageData.js** (`js/data/stageData.js`)
  - STAGES에 8장 placeholder 6개 추가 ('8-1'~'8-6', theme: 'placeholder')
  - STAGES에 16~24장 placeholder 54개 추가 ('16-1'~'24-6', theme: 'placeholder')
  - STAGE_ORDER를 78슬롯 → 138슬롯으로 확장 (그룹1 30 + 그룹2 54 + 그룹3 54)
  - 8장 삽입으로 unlock 체인 변경: 7-6 → 9-1 에서 8-6 → 9-1 (의도된 동작, 8장 placeholder로 9장 이후 영구 잠금)
  - 스펙 주석의 "144슬롯"은 계산 오류 (그룹2를 60으로 잘못 산출), 실제 138이 정확

- **WorldMapScene.js** (`js/scenes/WorldMapScene.js`)
  - CHAPTERS 12개 → 24개 확장 (그룹1: ch1~ch6, 그룹2: ch7~ch15, 그룹3: ch16~ch24)
  - NODE_POSITIONS 6노드 → 9노드 (3x3 격자)
  - SEASON_CONNECTIONS → GROUP_CONNECTIONS 교체 (9노드 3x3 격자 연결)
  - `_createGroupTabs()`: 3탭 UI (1~6장/7~15장/16~24장), 잠금 탭 자물쇠+회색 표시
  - `_switchGroup(group)`: 그룹 전환 + 탭 하이라이트 갱신 + 맵 재생성
  - `_buildGroupMap()`: 그룹별 챕터 슬라이스 + placeholder 상태 처리
  - `_drawConnections()`: undefined 가드 체크 추가 (그룹1 6챕터에서 인덱스 6~8 참조 방어)
  - `_drawNodes()`: groupBaseChapter 오프셋 계산 (그룹1=1, 그룹2=7, 그룹3=16)
  - `_openStagePanel()`: 그룹 오프셋 (그룹1=0, 그룹2=6, 그룹3=15) 적용
  - AD 검수 반영: tabH 28px → 40px, NODE_POSITIONS y축 균등 배치, 그룹1 전용 positions 인라인 배열, _drawConnections/_drawNodes에 positions 매개변수 추가

- **SaveManager.js** (`js/managers/SaveManager.js`)
  - createDefault()에 `season3Unlocked: false` 추가
  - _migrate() v15 블록에 `season3Unlocked` 패치 추가 (SAVE_VERSION 변경 없음)
  - `getTotalStars(group)`: season 필터 → group 필터 변경 (그룹1: ch<=6, 그룹2: 7<=ch<=15, 그룹3: ch>=16)

### 참고
- 스펙: `.claude/specs/2026-04-13-kc-phase24-2-impl.md`
- 구현 리포트: `.claude/specs/2026-04-13-kc-phase24-2-impl-report.md`
- QA: `.claude/specs/2026-04-13-kc-phase24-2-qa.md`
- QA 판정: PASS (32/32 전체 통과 -- 수용기준 13, 예외시나리오 10, 안정성 4, 시각검증 5)
- STAGE_ORDER.length가 스펙 144가 아닌 138인 것은 스펙 주석의 산술 오류이며 구현은 올바름
- `isUnlocked('16-1')`에 season3Unlocked 게이트 미구현. 그룹3 전체 placeholder인 현시점에서 영향 없으나, 향후 16장 실콘텐츠 구현 시 추가 필요
- AD 검수로 tabH, NODE_POSITIONS, positions 매개변수 등 스펙 원본과 다른 부분 있으나 모두 정상 반영 확인

---

## [2026-04-13] - Phase 24-1 데이터 재편 (chapter8→10 번호 치환 + stageData 78슬롯 + 세이브 v15)

### 변경

- **dialogueData.js** (`js/data/dialogueData.js`)
  - chapter8_intro/chapter8_lao_joins/chapter8_clear/chapter8_yuki_clue/chapter8_mid → chapter10_* 전면 치환 (5건)
  - lao_side_8, yuki_side_8은 캐릭터 사이드 스토리 ID로 유지
  - @fileoverview 및 섹션 주석 갱신 (Phase 24-1 기록)

- **storyData.js** (`js/data/storyData.js`)
  - gathering_enter/result_clear 트리거의 stageId 조건 8-x → 10-x 치환
  - dialogueId 참조 chapter8_* → chapter10_* 치환
  - storyFlags 키 chapter8_cleared → chapter10_cleared, chapter8_mid_seen → chapter10_mid_seen
  - stage_first_clear 제외 목록 8-x → 10-x
  - season2_lao_intro 조건 currentChapter >= 8 → >= 10, TODO 주석 삭제
  - chapter8_clear onComplete: currentChapter < 9 → < 11 승격

- **stageData.js** (`js/data/stageData.js`)
  - STAGES 키 '8-1'~'8-6' → '10-1'~'10-6' 재키잉 (id 필드 포함)
  - 기존 10~12장 플레이스홀더 18개(spice_palace/cactus_cantina/sugar_dreamland) 삭제
  - 11~15장 스텁 엔트리 30개 추가 (theme: 'placeholder')
  - STAGE_ORDER에서 '8-1'~'8-6' 제거, '13-1'~'15-6' 추가 → 전체 78슬롯
  - 시즌2 구간(7~15장, 8장 부재): 48슬롯

- **recipeData.js** (`js/data/recipeData.js`)
  - gateStage '8-1'~'8-5' → '10-1'~'10-5' 치환 (20건)
  - QA에서 발견된 연쇄 영향 — 스펙 범위 외 추가 수정

- **WorldMapScene.js** (`js/scenes/WorldMapScene.js`)
  - ch8 엔트리 삭제 (STAGES에 없는 '8-x' ID 참조 제거)
  - ch10: nameKo '10장: 용의 주방', stages ['10-1',...,'10-6']
  - ch11/ch12: nameKo '미구현'으로 갱신
  - QA에서 발견된 연쇄 영향 — 스펙 범위 외 추가 수정

- **SaveManager.js** (`js/managers/SaveManager.js`)
  - SAVE_VERSION 14 → 15
  - v14→v15 마이그레이션: chapter8_cleared → chapter10_cleared, chapter8_mid_seen → chapter10_mid_seen (멱등성 보장)

- **DevHelper.js** (`js/DevHelper.js`)
  - SAVE_VERSION 14 → 15
  - STAGE_ORDER에서 8-x 제거, 10-x~15-x 반영
  - CHAPTER_FLAGS: chapter8_cleared/chapter8_mid_seen → chapter10_*
  - skipStory() dialogueIds: chapter8_* → chapter10_*

- **saveFixtures.js** (`tests/fixtures/saveFixtures.js`)
  - SAVE_VERSION, STAGE_ORDER, CHAPTER_FLAGS, dialogueIds 동일 갱신

- **dev-launcher.html** (`public/dev-launcher.html`)
  - 8장 버튼 제거, 10장 버튼 추가

### 참고
- 스펙: `.claude/specs/2026-04-13-kc-phase24-1-scope.md`
- 구현 리포트: `.claude/specs/2026-04-13-kc-phase24-1-impl.md`
- QA: `.claude/specs/2026-04-13-phase24-1-qa.md`
- QA 초기 판정 PARTIAL — 스펙 범위 4개 파일은 전수 PASS, 스펙 누락으로 연쇄 영향 파일 5개(recipeData, WorldMapScene, DevHelper, saveFixtures, dev-launcher.html) 미수정. 이후 전수 수정 완료.
- 스펙에서 "54슬롯"은 시즌2(7~15장) 구간만의 수치. 실제 STAGE_ORDER는 시즌1 포함 78슬롯. 8장은 키만 제거되어 시즌2 실제 슬롯은 48개.
- dragon_wok 보스 스테이지 12-6 이동은 Phase 26에서 처리 예정 (24-1에서는 10-6 유지).

---

## [2026-04-13] - Phase 23-1 사케 오니 최종전 에셋 + 스크립트 구현

### 추가

- **sake_oni 보스 스프라이트** (`assets/sprites/bosses/sake_oni/`)
  - PixelLab pro 모드(size=64), 캔버스 124x124px
  - 8방향 rotations (south/south-east/east/north-east/north/north-west/west/south-west)
  - walking 애니메이션 6프레임 x 8방향 = 48파일, 해시: `walking-9fa1ac06`
  - 마젠타-핑크 색조, 사케 통, 오니 뿔 디자인
  - AD 모드2 APPROVED

- **SpriteLoader.js 갱신** (`js/managers/SpriteLoader.js`)
  - BOSS_WALK_HASHES.sake_oni: `null` → `'walking-9fa1ac06'`

- **9장 대사 3종** (`js/data/dialogueData.js`)
  - chapter9_intro (7대사): 9-1 진입, 이자카야 최심부 봉인의 방 발견
  - chapter9_boss (10대사): 9-6 진입, 사케 오니 정체 폭로 (타락한 옛 미력사)
  - chapter9_clear (11대사): 9-6 첫 클리어, 유키 감정 해소 + 일식 아크 완결

- **CHARACTERS.sake_oni** (`js/data/dialogueData.js`)
  - id: sake_oni, nameKo: '사케 오니', portrait: '🍶', color: 0xff4488, role: 'boss'
  - desc: '이자카야를 수호하던 식신. 정화된 사케 영기에 중독되어 타락한 옛 미력사.'
  - 누적 캐릭터: 8종, 누적 대사 스크립트: 49종

- **storyData.js 9장 트리거 3건** (`js/data/storyData.js`)
  - chapter9_intro: gathering_enter, stageId === '9-1', once: true
  - chapter9_boss: gathering_enter, stageId === '9-6', once: true
  - chapter9_clear: result_clear, stageId === '9-6', isFirstClear, onComplete → chapter9_cleared 플래그 + currentChapter 10 승격
  - stage_first_clear 제외 목록에 9-1, 9-6 추가
  - 누적 트리거: 48항목

### 참고
- 스펙: `.claude/specs/2026-04-13-kc-phase23-1-scope.md`
- 리포트: `.claude/specs/2026-04-13-phase23-1-report.md`
- QA: `.claude/specs/2026-04-13-phase23-1-qa.md`
- AD 리뷰: `.claude/specs/2026-04-13-phase23-1-art-review.md`
- 스펙에서는 64px 기준으로 명시했으나, PixelLab pro 모드의 실제 캔버스 크기는 124x124px로 생성됨
- 구현 리포트 시점에서 PixelLab MCP 도구 사용 불가로 스프라이트 미완료 상태였으나, 이후 세션에서 생성 완료하여 QA 13/13 PASS

## [2026-04-13] - Phase 22-3 이자카야 심층부 스테이지 + 레시피 구현

### 추가

- **적 2종 코드 등록** (`js/data/gameData.js` ENEMY_TYPES)
  - sake_specter: HP 300, speed 65, 마취 디버프 (5초 간격, 70px 범위, 공격속도 -20% 3초)
  - oni_minion: HP 350, speed 55, 돌진 (HP 60% 이하, 속도 2.5배, 2초간, 8초 쿨다운)
  - 누적: 일반 적 23종

- **재료 1종 등록** (`js/data/gameData.js` INGREDIENT_TYPES)
  - sake: nameKo '사케', color 0xc8a2c8, icon '🍶'
  - 누적: 20종

- **SpriteLoader 갱신** (`js/managers/SpriteLoader.js`)
  - ENEMY_IDS: 23종 (sake_specter, oni_minion 추가)
  - ENEMY_WALK_HASHES: sake_specter 'walking-e2f2a098', oni_minion 'walking-3d25e8be'
  - INGREDIENT_FILE_MAP: sake 추가
  - TILESET_IDS: 9종 (izakaya_underground 추가)
  - _loadTilesets: TILESET_16PX Set 분기 처리 (izakaya_underground만 16px, 기존 32px 유지)

- **스테이지 8-1~8-5 재구성** (`js/data/stageData.js`)
  - theme: 전부 'izakaya_underground'로 변경
  - 8-1 '이자카야 심층부 입구' (5웨이브, W3부터 sake_specter 소량 도입)
  - 8-2 '사케 저장고' (5웨이브, W1부터 sake_specter 주력)
  - 8-3 '지하 통로' (6웨이브, sake_specter+oni_minion 균형)
  - 8-4 '봉인 전실' (6웨이브, sake_specter+oni_minion 주력)
  - 8-5 '심층부 제단' (6웨이브, sake_specter+oni_minion 최고 밀도)
  - 8-6 보스 스테이지 변경 없음 (dragon_wok 유지)
  - customers: 사케 레시피(sake_cocktail~sake_kaiseki) 순차 참조
  - service: duration 240~280s, customerInterval 3.5~2.6, maxCustomers 35~44

- **서빙 레시피 8종** (`js/data/recipeData.js` ALL_SERVING_RECIPES)
  - sake_cocktail (1성, sake x1, 30G, 8-1)
  - sake_bowl (2성, sake+rice, 52G, 8-1)
  - sake_shrimp (2성, sake+shrimp, 55G, 8-2)
  - sake_sashimi (3성, sake+sashimi_tuna, 75G, 8-2)
  - sake_ramen (3성, sake+tofu+mushroom, 80G, 8-3)
  - sake_hotpot (3성, sake+tofu+shrimp, 82G, 8-3)
  - sake_oden (4성, sake+tofu+cilantro+mushroom, 105G, 8-4)
  - sake_kaiseki (5성, sake x2+sashimi_tuna+wasabi+tofu, 140G, 8-5)

- **버프 레시피 2종** (`js/data/recipeData.js` ALL_BUFF_RECIPES)
  - sake_clarity (3성, sake x2, 마취 면역+공격속도 +15% 3웨이브, 8-2)
  - sake_oni_spirit (4성, sake+tofu+cilantro, 공격력+공격속도 +25% 2웨이브, 8-3)
  - 누적 레시피: 136종 (서빙 110 + 버프 26)

### 참고
- 스펙: `.claude/specs/2026-04-13-phase22-3-scope.md`
- 리포트: `.claude/specs/2026-04-13-phase22-3-report.md`
- QA: `.claude/specs/2026-04-13-phase22-3-qa.md`
- 스펙 "배치 원칙" 텍스트에 "8-3부터 oni_minion 본격 등장"이라 기재되었으나, 스펙 코드 블록에는 8-1 W5, 8-2 W3에도 oni_minion이 배치됨. 구현은 코드 블록 기준으로 수행. "본격"은 주력 비중 증가의 의미로 해석.
- 스펙 "레시피 설계 원칙"에 "4성 2종"이라 기재되었으나, 코드 블록에는 4성 서빙 1종(sake_oden) + 4성 버프 1종(sake_oni_spirit). 서빙 기준 4성은 1종. 구현은 코드 블록 기준으로 올바름.
- `buff_narcotize_immunity` effectType은 BuffManager에 미구현 상태. 데이터만 등록됨. 후속 Phase에서 처리 로직 추가 필요.
- SpriteLoader.js 내 기존 JSDoc 주석 일부(적 "16종", 재료 "15종" 등)가 미갱신 상태 -- Phase 22-3 스펙 범위 외 누적 이슈.

---

## [2026-04-13] - Phase 22-2 8장 에셋 생성 (PixelLab)

### 추가

- **sake_specter 스프라이트** (`assets/sprites/enemies/`)
  - 48px, 8방향 + walking 애니메이션 6프레임
  - 8장 이자카야 심층부 적, 마취 디버프 메커닉 예정

- **oni_minion 스프라이트** (`assets/sprites/enemies/`)
  - 48px, 8방향 + walking 애니메이션 6프레임
  - 8장 이자카야 심층부 적, 돌진 메커닉 예정

- **izakaya_underground 타일셋** (`assets/tilesets/`)
  - 16x16px Wang tileset, 16타일
  - 8장 이자카야 지하 스테이지 배경용

- **sake 재료 아이콘** (`assets/icons/`)
  - 32px isometric 픽셀아트
  - Phase 22-3에서 ingredientData.js에 등록 예정

### 참고
- 코드 변경 없음. 에셋 파일만 추가.
- Phase 22-3에서 게임 로직(적 등록, 스테이지 배치, 레시피)에 통합 예정.

---

## [2026-04-13] - Phase 22-1 스크립트 & 7장 보스 재편

### 추가

- **미니보스 oni_herald** (`js/data/gameData.js` ENEMY_TYPES)
  - HP 800, speed 30, bodyColor 0xcc44aa, isMidBoss: true
  - heraldSummon: 6초마다 shrimp_samurai 2마리 소환 (boss_summon 이벤트)
  - enrage: HP 40% 이하 시 속도 1.5배 + 적색 틴트
  - bossReward: 120, bossDrops: wasabi x2 + sashimi_tuna x2
  - 누적: 30종 (일반 21 + 미니보스 1 + 보스 8)

- **Enemy.js isMidBoss 지원** (`js/entities/Enemy.js`)
  - _buildVisual: isMidBoss 전용 다이아몬드 도형 42px + HP 바 위치 조정
  - _updateHeraldSummon: 전령 소환 타이머 (heraldSummonInterval 기반)
  - enrage 로직: enrageHpThreshold 이하 시 enrageSpeedMultiplier 적용 + _heraldEnraged 1회 제한
  - 생성자에 heraldSummon 관련 프로퍼티 초기화

- **GatheringScene/EndlessScene isMidBoss 지원**
  - _onEnemyDied: isMidBoss도 보스 VFX 적용
  - _checkBossWaveBGM: isMidBoss도 보스 BGM 전환

- **대화 스크립트 3종** (`js/data/dialogueData.js`)
  - chapter8_yuki_clue: 8-4 클리어 후 유키 봉인 문양 단서 발견 (8줄)
  - chapter8_mid: 8-5 클리어 후 팀 갈등 -- 유키/라오 선두 다툼, 미미 중재 (9줄)
  - yuki_side_8: merchant_enter 시 유키 사이드 대화 -- 혼자 행동하는 버릇 (9줄)
  - 누적: 46종

- **스토리 트리거 3건** (`js/data/storyData.js`)
  - 8-4 result_clear: chapter8_yuki_clue (isFirstClear, stars>0)
  - 8-5 result_clear: chapter8_mid (isFirstClear, stars>0) + onComplete에서 chapter8_mid_seen 플래그 저장
  - merchant_enter: yuki_side_8 (chapter8_mid_seen 조건)
  - 누적: 45항목

### 변경

- **stageData.js**: 7-6 wave 5 첫 적 sake_oni -> oni_herald 교체 (L4384)
- **dialogueData.js**: chapter7_clear에 유키 복선 대사 3줄 삽입 ("봉인의 핵심이 거기 있을 수 있어")
- **storyData.js**: stage_first_clear 범용 트리거 제외 목록에 8-4, 8-5 추가

### 참고
- 스펙: `.claude/specs/2026-04-13-phase22-1-scope.md`
- 리포트: `.claude/specs/2026-04-13-phase22-1-report.md`
- QA: `.claude/specs/2026-04-13-phase22-1-qa.md`
- 스펙 AC #6은 "유키 복선 대사 4줄"로 기재되었으나, 스펙 상세 구현 섹션에는 3줄(유키/미미/유키)로 명시. 구현은 상세 섹션과 일치.
- 스펙의 chapter8_intro는 기존 Phase 21 대화 ID와 충돌하므로 chapter8_yuki_clue로 신규 작성됨.

---

## [2026-04-12] - Phase 21 8장 용의 주방 (중식)

### 추가

- **재료 2종** (`js/data/gameData.js` INGREDIENT_TYPES)
  - tofu (두부): color 0xF5F5DC, icon 재료 아이콘
  - cilantro (고수): color 0x228B22, icon 재료 아이콘
  - 누적: 19종

- **적 3종 + 보스 1종** (`js/data/gameData.js` ENEMY_TYPES)
  - dumpling_warrior (만두 전사): HP 280, speed 50, 분열 기믹 (split:true, splitCount:2, splitType:'mini_dumpling')
  - mini_dumpling (미니 만두): HP 60, speed 65, split:false (무한 분열 방지)
  - wok_phantom (웍 유령): HP 320, speed 40, 화염 장판 기믹 (fireZoneInterval:4000, fireZoneRadius:55, fireZoneDuration:3500)
  - dragon_wok (드래곤 웍): HP 7000, speed 22, isBoss, 3페이즈 화염 브레스
    - 페이즈 1 (HP 100~70%): 브레스 간격 5000ms, 각도 60도, 반경 90
    - 페이즈 2 (HP 70~35%): 브레스 간격 3500ms, speedBonus +15%, mini_dumpling 3마리 1회 소환
    - 페이즈 3 (HP 35% 이하): 브레스 간격 2500ms, 각도 90도, 즉발 fireZone 2개, speed +30%
    - bossReward: 400, bossDrops: tofu 4 + cilantro 4
  - 누적: 29종 (일반 21 + 보스 8)

- **Enemy.js 특수 메커닉 3종** (`js/entities/Enemy.js`)
  - 분열(split): _die()에서 split===true 시 `enemy_deterministic_split` 이벤트 발사, splitCount만큼 splitType 스폰, 부모 waypointIndex 이어받기
  - 화염 장판(fireZone): _fireZoneTimer 기반 주기적 장판 생성, Graphics 원(빨강, alpha 0.35), fireZoneDuration 후 자동 제거
  - 화염 브레스+3페이즈(fireBreath): _phase 상태 머신, hpRatio 기반 페이즈 전환, 이동 방향 부채꼴 범위 내 도구에 공격속도 디버프
  - BUG-01 방지: 페이즈 전환 로직을 update() 내 타이머 조건 완전 외부에 배치
  - 분열 이벤트: 기존 egg_sprite의 확률적 `enemy_split`과 구분하기 위해 `enemy_deterministic_split` 신규 이벤트 사용

- **GatheringScene 이벤트 핸들러 3종** (`js/scenes/GatheringScene.js`)
  - `enemy_deterministic_split`: 분열 스폰 처리 (waypointIndex 이어받기)
  - `enemy_fire_zone`: 화염 장판 Graphics 생성 + _fireZones 배열 관리
  - `dragon_fire_breath`: 화염 브레스 범위 내 도구 디버프 적용
  - `_updateFireZones()`: 주기적 장판 순회, 범위 내 도구에 speed -0.20 디버프
  - shutdown()에서 gfx.destroy() + timer.remove() + _fireZones=[] 정리

- **스테이지 8-1~8-6 웨이브 교체** (`js/data/stageData.js`)
  - 기존 스켈레톤을 dumpling_warrior/wok_phantom/dragon_wok 기반으로 전면 교체
  - theme: 'chinese_palace_kitchen'
  - customerPatience 27~21초 (7장 28~22초 대비 1초 감소)
  - 8-6: 4웨이브 사전 소환 파도 + 최종 웨이브 dragon_wok(count:1)

- **서빙 레시피 8종** (`js/data/gameData.js` SERVING_RECIPES, `js/data/recipeData.js`)
  - mapo_tofu (마파두부): tofu x2, 70g, 8000ms, ★★★
  - cilantro_tofu_steam (고수두부찜): tofu+cilantro, 55g, 6500ms, ★★
  - dim_sum (딤섬): tofu+flour, 50g, 5500ms, ★★
  - wok_noodles (웍 볶음면): cilantro+egg, 45g, 5000ms, ★★
  - tofu_hotpot (두부 훠궈): tofu x2+mushroom, 75g, 9000ms, ★★★
  - cilantro_shrimp_soup (고수 탕수): cilantro x2+shrimp, 75g, 9000ms, ★★★
  - peking_duck (베이징 덕): tofu+cilantro+butter, 90g, 10000ms, ★★★★
  - dragon_feast (용의 만찬): tofu x2+cilantro x2+meat, 130g, 13000ms, ★★★★★

- **버프 레시피 2종** (`js/data/gameData.js` BUFF_RECIPES)
  - dragon_qi (용기): tofu x2+cilantro, buff_damage +30%, 55초
  - wok_aura (웍 오라): tofu+cilantro x2, buff_both +25%, 50초 *(스펙 buff_attack_speed -> 기존 미구현으로 buff_both 대체)*

- **대화 스크립트 4종** (`js/data/dialogueData.js`)
  - chapter8_intro (8줄): 궁전 주방 도착, 라오 가문 소개, 드래곤 웍 설명
  - chapter8_lao_joins (10줄): 8-3 클리어 후 라오 정식 합류 선언
  - chapter8_clear (9줄): 드래곤 웍 정화, 라오 가족 회복, 파리 복선
  - lao_side_8 (9줄): 라오의 웍 철학, 팀 케미 심화
  - 누적: 43종

- **스토리 트리거 4건** (`js/data/storyData.js`)
  - chapter8_intro: gathering_enter, stageId==='8-1', once:true
  - chapter8_lao_joins: result_clear, isFirstClear && stageId==='8-3', once:true
  - chapter8_clear: result_clear, isFirstClear && stageId==='8-6', once:true, onComplete -> chapter8_cleared=true + currentChapter=9
  - lao_side_8: merchant_enter, storyFlags.chapter8_cleared, once:true
  - stage_first_clear 제외 목록에 8-1/8-3/8-6 추가
  - 누적: 42항목

- **SpriteLoader 등록** (`js/managers/SpriteLoader.js`)
  - ENEMY_IDS +3 (dumpling_warrior, mini_dumpling, wok_phantom)
  - BOSS_IDS +1 (dragon_wok)
  - TILESET_IDS +1 (chinese_palace_kitchen)
  - INGREDIENT_FILE_MAP +2 (tofu, cilantro)
  - ENEMY_WALK_HASHES +3(null), BOSS_WALK_HASHES +1(null) -- 에셋 생성 후 기입 예정

- **recipeData.js 레시피 컬렉션 등록** (`js/data/recipeData.js`)
  - ALL_SERVING_RECIPES 8종 (tier/category/gateStage 포함, gateStage: 8-1~8-5)
  - ALL_BUFF_RECIPES 2종

### 참고

- 스펙: `.claude/specs/2026-04-12-kitchen-chaos-phase21-scope.md`
- 리포트: `.claude/specs/2026-04-12-kitchen-chaos-phase21-report.md`
- QA: `.claude/specs/2026-04-12-phase21-qa.md`
- visual_change: art (에셋은 미생성, 코드 로직만 구현)
- QA: PASS (수용 기준 20/20, 예외 시나리오 8/8, Playwright 57/57, 시각적 1/1)
- 스펙 대비 변경: wok_aura buff_attack_speed -> buff_both (기존 effectType 미구현), 분열 이벤트 enemy_split -> enemy_deterministic_split (기존 확률적 분열과 충돌 방지)
- SaveManager 버전업 없음 (v13 유지, storyFlags에 chapter8_cleared 키 추가만)
- PixelLab 에셋 7종 미생성 (MCP 도구 미사용 가능). walk hash null, fallback 도형 렌더링 정상 동작
- LOW 이슈 3건: cilantro/wasabi 이모지 동일(색상으로 구분), HP 급락 시 phase 2/3 동시 발동(현실적 불가능), scene 참조 패턴(기존 관례 유지)

---

## [2026-04-12] - Phase 20 도구 정보 팝업 + 도감 도구 탭

### 추가

- **TOOL_DEFS 8종에 descKo, loreKo 필드 추가** (`js/data/gameData.js`)
  - descKo: 도구 기능 설명 텍스트
  - loreKo: 식란 세계관 기반 도구 로어 텍스트

- **MerchantScene 도구 정보 팝업** (`js/scenes/MerchantScene.js`)
  - 각 도구 행 우상단 ℹ 버튼 추가
  - `_showToolInfoPopup()`: 스탯 바 + descKo + loreKo 표시
  - 팝업 높이 동적 계산 (attack/support 카테고리별 스탯 바 수 반영)

- **RecipeCollectionScene 도구 탭** (`js/scenes/RecipeCollectionScene.js`)
  - "도구" 탭 추가, 8종 3열 그리드 표시
  - `_showToolDetail()`: Lv1/2/3 스탯 테이블 상세 팝업
  - 팝업 높이 동적 계산 (attack/support 카테고리별)

### 수정

- **OrderManager kill_count 오더 버그** — 웨이브 실제 적 수 초과 시 출현하던 버그 수정
- **조리 중 손님 퇴장 버그** — 마지막 재료 소비 직후 조리 중인 손님이 퇴장되던 버그 수정 (`_dismissSoldOutCustomers`)
- **조리 중 버리기 버튼** — 조리 중에도 버리기 버튼 활성화

### 참고

- visual_change: ui (팝업 UI + 도감 탭 추가)
- QA: PASS

---

## [2026-04-11] - Phase 19-6 영업씬 전체 UI 디자인 재설계

### 추가

- **홀 배경 데코 에셋 3종** (`assets/service/`)
  - `wall_back.png` (512x80): 홀 뒷벽 (배치: x=180, y=66, displaySize=360x52, depth=3)
  - `decor_plant.png` (64x96): 코너 화분 (좌: 18,120 / 우: 342,120 flipX, displaySize=28x42, depth=130)
  - `entrance_arch.png` (192x64): 입구 아치 (x=180, y=256, displaySize=120x40, depth=5)
  - SpriteLoader `_loadServiceAssets()`에 3종 키 등록 (SpriteLoader.js L329-331)

- **`_createHallDecor()` 메서드** (`js/scenes/ServiceScene.js` L480-506)
  - 뒷벽/화분/입구 아치 배치 (SpriteLoader.hasTexture() 기반 fallback)
  - `_createTables()` 내부에서 `_drawIsoFloor()` 직후 호출 (L523)

- **하단 패널 공통 배경** (`js/scenes/ServiceScene.js` L714-720)
  - COOK_Y~RECIPE_Y+RECIPE_H 구간 단일 배경 0x1c1008, depth=0
  - 기존 개별 배경(재고 0x1a1a2e, 레시피 0x111122) 제거

- **섹션 레이블 3종**
  - 조리 레이블 (L722-724): fontSize 10px, color #8B6914
  - 재고 레이블 (L853-855): fontSize 11px, color #8B6914
  - 레시피 레이블 (L897-899): fontSize 11px, color #8B6914

- **앰버 구분선 2개** (1px, 0x8B6914, depth=9)
  - COOK/STOCK 경계 (y=340, L726)
  - STOCK/RECIPE 경계 (y=440, L851)

### 변경

- **`SISO_ORIGIN_Y`** (ServiceScene.js L91)
  - 120 -> 100 (테이블 그리드 20px 상향 이동)

- **HUD 배경** (ServiceScene.js L369)
  - 0x1a1a2e (차가운 남색) -> 0x1c0e00 (웜 다크)
  - 하단 1px 골드 구분선 추가 (0xffd700, alpha=0.4, L372-374)
  - satText 색상: #ffcc00 -> #e8c87a (L386)

- **조리 슬롯** (ServiceScene.js L739-740)
  - 배경: 0x333344 -> 0x2d1a08, stroke: 0x555566 -> 0x4a3520

- **재고 패널** (ServiceScene.js L849, L875)
  - 개별 배경 0x1a1a2e 제거 (공통 배경으로 통합)
  - 활성 텍스트: #ffffff -> #e8c87a, 비활성: #555555 유지

- **레시피 패널** (ServiceScene.js L895, L919-935)
  - 개별 배경 0x111122 제거
  - 버튼 배경: 0x334455 -> 0x2d1a0a, stroke: 0x4a3520
  - 버튼 hover: 0x4a2e10
  - 텍스트: 이름 #e8c87a, 재료 #b89a5a
  - 비활성: fill 0x1c1008/alpha 0.5, text #6b4a2a

- **`_updateRecipeQuickSlots()` 색상 동기화** (ServiceScene.js L950-956)
  - 활성: fill=0x2d1a0a/alpha=1/text=#e8c87a
  - 비활성: fill=0x1c1008/alpha=0.5/text=#6b4a2a

### 변경된 파일 (2개 코드 + 3개 에셋)

| 파일 | 변경 유형 |
|------|----------|
| `js/managers/SpriteLoader.js` | 수정 (에셋 3종 키 등록) |
| `js/scenes/ServiceScene.js` | 수정 (SISO_ORIGIN_Y, _createHallDecor 추가, HUD/패널/슬롯 색상 통일) |
| `assets/service/wall_back.png` | 신규 (512x80, SD Forge DreamShaper 8) |
| `assets/service/decor_plant.png` | 신규 (64x96, SD Forge DreamShaper 8) |
| `assets/service/entrance_arch.png` | 신규 (192x64, SD Forge DreamShaper 8) |

### 참고

- 스펙: `.claude/specs/2026-04-11-kitchen-chaos-phase19-6-scope.md`
- QA: `.claude/specs/2026-04-11-kitchen-chaos-phase19-6-qa.md`
- visual_change: both (환경 에셋 3종 + UI 패널 색상/레이아웃 재설계)
- QA: PASS (수용 기준 24/24, 예외 시나리오 6/6, Playwright 34/34, 시각적 5/5)
- Vite 빌드 성공 (51 modules, chunk size 1948KB 경고는 기존 이슈)
- 스펙 대비 변경: 없음 (모든 요구사항 그대로 구현)
- 조리 레이블 fontSize 10px, 재고/레시피 레이블 11px (스펙 의도)
- 하단바(_createBottomBar) 0x0d0d1a 차가운 남색은 변경 범위 밖, 향후 톤 통일 검토 권장
- 영업 씬 에셋 누적: 15종 (기존 12종 + 데코 3종)

---

## [2026-04-11] - Phase 19-5 영업씬 아이소메트릭화

### 추가

- **아이소메트릭 상수 8개** (`js/scenes/ServiceScene.js`)
  - `SISO_COLS=4`, `SISO_ROWS=2`: 격자 크기
  - `SISO_HALF_W=40`, `SISO_HALF_H=30`: 셀 반폭 (4:3 비율)
  - `SISO_ORIGIN_X=140`, `SISO_ORIGIN_Y=120`: 그리드 원점 (스펙 ORIGIN_Y=100에서 경계 여백 확보를 위해 조정)
  - `SISO_TABLE_W=72`, `SISO_TABLE_H=56`: 테이블 표시 크기 (스펙 제안 80x60 대비 축소, 간격 확보)

- **`_cellToWorld(col, row)` 메서드** (`js/scenes/ServiceScene.js`)
  - 홀 격자 좌표 -> 아이소메트릭 월드 픽셀 좌표 변환
  - 공식: `x = SISO_ORIGIN_X + (col - row) * SISO_HALF_W`, `y = SISO_ORIGIN_Y + (col + row) * SISO_HALF_H`

- **`_drawIsoFloor()` 메서드** (`js/scenes/ServiceScene.js`)
  - floor_hall 이미지 + 아이소 그리드 오버레이 병렬 렌더링 (스펙의 양자택일 대신 병렬 방식 채택)

### 변경

- **`_createTables()` 전면 재작성** (`js/scenes/ServiceScene.js`)
  - flat top-down 직사각형 격자 -> 아이소메트릭 다이아몬드 격자 좌표
  - depth sorting: `container.setDepth(10 + cy)` 적용 (앞행이 뒷행 위에 렌더링)
  - 테이블 displaySize: `SISO_TABLE_W(72) x SISO_TABLE_H(56)`
  - 말풍선, 인내심 바, 손님 아이콘 y 오프셋 아이소 크기 기반으로 조정

- **`floor_hall.png` 재생성** (`assets/service/floor_hall.png`)
  - 이전: flat top-down 나무판자 텍스처 360x240
  - 이후: 헤링본 파케 원목 텍스처 360x240 (PixelLab create_map_object)

### 변경된 파일 (1개 코드 + 1개 에셋)

| 파일 | 변경 유형 |
|------|----------|
| `js/scenes/ServiceScene.js` | 수정 (상수 8개, 메서드 2개 추가, `_createTables()` 재작성) |
| `assets/service/floor_hall.png` | 재생성 (flat -> 헤링본 파케 아이소 텍스처) |

### 참고

- 스펙: `.claude/specs/2026-04-11-kitchen-chaos-phase19-5-spec.md`
- 리포트: `.claude/specs/2026-04-11-kitchen-chaos-phase19-5-report.md`
- QA: `.claude/specs/2026-04-11-kitchen-chaos-phase19-5-qa.md`
- 목적 정의서: `.claude/specs/2026-04-11-kitchen-chaos-phase19-5-scope.md`
- visual_change: both (floor_hall 에셋 재생성 + UI 레이아웃 전면 재배치)
- QA: PASS (15/15 -- 수용 기준 14개 + 예외 시나리오 6개 모두 통과)
- 스펙 대비 변경: SISO_ORIGIN_Y 100->120 (경계 여백 확보), SISO_TABLE_W/H 신규 추가 72/56 (가독성 향상), _drawIsoFloor 이미지+오버레이 병렬 (시각 품질 향상), SISO_COLS/ROWS 상수 추가 (매직넘버 제거)
- dead code: `tableW`, `tableH`, `tableCols` 잔존 (기능 무영향, 향후 정리 권장)
- config.js, GatheringScene.js, SpriteLoader.js 수정 없음 (스펙 제약 준수)
- `_updateTableUI()`, `_onTableTap()` 무변경 (setData 키 동일 유지)

---

## [2026-04-11] - Phase 19-4 영업 씬 비주얼 리워크

### 추가

- **PixelLab 에셋 12종** (`assets/service/`)
  - `table_lv0.png` ~ `table_lv4.png`: 테이블 5종 (80x64px, 쿼터뷰 픽셀아트, 등급별 소재 차등)
  - `customer_normal.png`, `customer_vip.png`, `customer_gourmet.png`, `customer_rushed.png`: 손님 캐릭터 4종 (48x48px, chibi 픽셀아트)
  - `customer_group.png`: 단체 손님 1종 (68x68px, 단일 인물로 대체 -- PixelLab API 제한으로 2인 구성 불가)
  - `floor_hall.png`: 식당 홀 바닥 타일 (360x240px, 목재 따뜻한 베이지)
  - `counter_cooking.png`: 조리 카운터 아이콘 (174x54px, 냄비 형태 아이콘)

- **SpriteLoader 서비스 에셋 로드** (`js/managers/SpriteLoader.js`)
  - 상수: SERVICE_ROOT, TABLE_GRADE_COUNT(5), CUSTOMER_TYPE_IDS(5종)
  - `_loadServiceAssets()`: 테이블 5종 + 손님 5종 + 바닥 + 카운터 텍스처 로드
  - `preload()`에 `_loadServiceAssets()` 호출 등록

- **ServiceScene 스프라이트 렌더링** (`js/scenes/ServiceScene.js`)
  - SpriteLoader import 추가
  - `_createTables()`: 홀 배경을 `floor_hall` Image로 교체 (fallback: 기존 색상 직사각형)
  - `_createTables()`: 테이블을 `table_lv{N}` 스프라이트로 교체 (fallback: TABLE_COLORS 직사각형)
  - `_createTables()`: 손님 아이콘을 custIconImg(Image) + custIconText(Text) 이중 구조로 교체
  - `_updateTableUI()`: SpriteLoader.hasTexture() 기반 Image/Text 표시 분기
  - `_createCookingSlots()`: 슬롯 배경을 `counter_cooking` Image로 교체 (fallback: 기존 색상 직사각형)

### 변경된 파일 (2개 코드 + 12개 에셋)

| 파일 | 변경 유형 |
|------|----------|
| `js/managers/SpriteLoader.js` | 수정 (상수 3개, 메서드 1개, preload 호출 1줄) |
| `js/scenes/ServiceScene.js` | 수정 (SpriteLoader import, 홀/테이블/손님/카운터 렌더링 교체) |
| `assets/service/table_lv0.png` ~ `table_lv4.png` | 신규 (5개) |
| `assets/service/customer_normal.png` ~ `customer_group.png` | 신규 (5개) |
| `assets/service/floor_hall.png` | 신규 |
| `assets/service/counter_cooking.png` | 신규 |

### 참고

- 스펙: `.claude/specs/2026-04-11-kitchen-chaos-phase19-4-scope.md`
- 리포트: `.claude/specs/2026-04-11-kitchen-chaos-phase19-4-report.md`
- QA: `.claude/specs/2026-04-11-kitchen-chaos-phase19-4-qa.md`
- visual_change: both (art 에셋 생성 + UI 렌더링 교체)
- Vite 빌드 성공 (51 modules)
- QA: PASS (27/28 테스트 통과, 1건 headless Chromium 타이밍 이슈 -- 코드 결함 아님)
- 스펙 대비 변경: 손님 에셋 해상도 32x48 -> 48x48 (group은 48x48 -> 68x68), counter_cooking 175x55 -> 174x54 (PixelLab 생성 오차), customer_group 2인 구성 -> 단일 인물 (API 제한). 모두 setDisplaySize로 렌더링에 영향 없음
- custIconImg 초기 텍스처 `__MISSING` 사용 (Phaser 내장 placeholder, visible=false 처리)
- counter_cooking 아이콘 46x46 정사각형 스케일링 (원본 3:1 비율 왜곡, 아이콘 장식 용도 허용 범위)
- 기존 TABLE_COLORS, CUSTOMER_TYPE_ICONS 등 fallback 상수 보존 (스펙 요구)

---

## [2026-04-11] - Phase 19-3 PixelLab 에셋 + 시즌2 프롤로그 스토리

### 추가

- **PixelLab 에셋 6종** (`assets/sprites/`)
  - `chefs/yuki_chef/rotations/south.png`: 유키 셰프 스프라이트 (48px, chibi, ice blue hair, white uniform)
  - `chefs/lao_chef/rotations/south.png`: 라오 셰프 스프라이트 (48px, chibi, red apron, black hair)
  - `portraits/portrait_yuki.png`: 유키 초상화 (64x64, pixel art portrait)
  - `portraits/portrait_lao.png`: 라오 초상화 (64x64, pixel art portrait)
  - `towers/wasabi_cannon/tower.png`: 와사비 대포 타워 (32x32, green launcher on bamboo base)
  - `towers/spice_grinder/tower.png`: 향신료 그라인더 타워 (32x32, orange mortar/pestle on wooden base)
  - SpriteLoader의 TOWER_IDS/CHEF_IDS/PORTRAIT_IDS에 19-1에서 이미 등록됨 -> 에셋 배치만으로 자동 로드

- **대화 스크립트 3종** (`js/data/dialogueData.js`)
  - season2_prologue (5줄): WCA 연락, 식란 동시다발 징후, 시즌2 개막 선언
  - season2_yuki_intro (4줄): 유키 합류, 이자카야 식란 잠식
  - season2_lao_intro (4줄): 라오 합류, 용 웍 오염
  - 누적: 대화 스크립트 35종, 캐릭터 7종

- **스토리 트리거 3건** (`js/data/storyData.js`)
  - season2_prologue: worldmap_enter, 6-3 클리어 + !season2Unlocked, onComplete -> season2Unlocked=true + currentChapter=7
  - season2_yuki_intro: worldmap_enter, season2Unlocked + currentChapter>=7 + !storyFlags.yuki_joined, onComplete -> storyFlags.yuki_joined=true
  - season2_lao_intro: worldmap_enter, season2Unlocked + currentChapter>=8 + !storyFlags.lao_joined, onComplete -> storyFlags.lao_joined=true
  - storyData.js에 `import SaveManager` 추가 (onComplete 콜백에서 세이브 조작)
  - 누적: STORY_TRIGGERS 34항목

- **StoryManager trigger.onComplete 지원** (`js/managers/StoryManager.js`)
  - _fire()에서 trigger.onComplete 콜백 실행 (기존 chain의 onComplete와 합성)
  - getProgress()에 stages, season2Unlocked 필드 추가 (시즌2 트리거 condition에서 참조)
  - setFlag/hasFlag: 배열 기반(includes/push) -> 객체 기반(key 접근)으로 전환
  - advanceChapter 기본값: storyFlags [] -> {}

- **SaveManager v12->v13** (`js/managers/SaveManager.js`)
  - SAVE_VERSION: 12 -> 13
  - createDefault(): storyProgress.storyFlags를 [] -> {} 객체로 변경
  - v12->v13 마이그레이션: Array.isArray(storyFlags) -> {} 변환

### 변경된 파일 (4개 코드 + 6개 에셋)

| 파일 | 변경 유형 |
|------|----------|
| `js/managers/SaveManager.js` | 수정 (v13 마이그레이션, storyFlags 타입 변경) |
| `js/managers/StoryManager.js` | 수정 (onComplete, getProgress 확장, setFlag/hasFlag 객체 전환) |
| `js/data/dialogueData.js` | 수정 (대화 3종 추가) |
| `js/data/storyData.js` | 수정 (import SaveManager, 트리거 3건 + onComplete 콜백) |
| `assets/sprites/chefs/yuki_chef/rotations/south.png` | 신규 |
| `assets/sprites/chefs/lao_chef/rotations/south.png` | 신규 |
| `assets/sprites/portraits/portrait_yuki.png` | 신규 |
| `assets/sprites/portraits/portrait_lao.png` | 신규 |
| `assets/sprites/towers/wasabi_cannon/tower.png` | 신규 |
| `assets/sprites/towers/spice_grinder/tower.png` | 신규 |

### 참고

- 스펙: `.claude/specs/2026-04-11-kitchen-chaos-phase19-3-spec.md`
- 리포트: `.claude/specs/2026-04-11-kitchen-chaos-phase19-3-report.md`
- QA: `.claude/specs/2026-04-11-kitchen-chaos-phase19-3-qa.md`
- visual_change: both
- Vite 빌드 성공 (1,944KB gzip 428KB)
- QA: PASS (10/10 수용 기준, 10/10 예외 시나리오, Playwright 17개 테스트 전수 통과)
- 스펙 대비 추가 변경: StoryManager.getProgress()에 stages/season2Unlocked 노출, setFlag/hasFlag 객체 전환, advanceChapter 기본값 storyFlags {} 변경
- LOW 이슈 3건 (기능 영향 없음): 시즌2 대화 skippable 필드 미설정, SaveManager lazy migration 패턴, 시즌2 트리거 배열 끝 위치(설계 의도)

---

## [2026-04-10] - Phase 19-2 UI 확장

### 추가

- **ChefSelectScene 5종 카드 리레이아웃** (`js/scenes/ChefSelectScene.js`)
  - cardHeight 145->100, cardGap 10->8, cardStartY 90->55로 조정 (5장 카드 640px 내 수용, 55+500+32=587px)
  - 아이콘 28->24px, 셰프 이름 16->15px, 스킬/설명 폰트 축소
  - 타이틀 Y 30->20, 서브타이틀 Y 55->38

- **시즌 2 셰프 잠금 표시** (`js/scenes/ChefSelectScene.js`)
  - season2Unlocked=false 시 yuki_chef, lao_chef 잠금 처리
  - 회색 배경(0x1a1a1a)+테두리(0x333333), 텍스트 #555555, 아이콘 alpha 0.3
  - 자물쇠 오버레이 + "6장 클리어 시 해금" 텍스트
  - setInteractive 미적용 (클릭 차단)

- **WorldMapScene 시즌 탭 시스템** (`js/scenes/WorldMapScene.js`)
  - `_createSeasonTabs()`: 상단 y=60에 시즌 1/2 탭 버튼 (140x28px, 13px bold)
  - `_switchSeason(season)`: 탭 하이라이트 갱신 + 패널 닫기 + 맵 재생성
  - `_buildSeasonMap()`: 현재 시즌 6개 챕터 노드/연결선 생성
  - season2Unlocked=false 시 시즌 2 탭 비활성 (회색+자물쇠, 클릭 무반응)

- **CHAPTERS 12개 확장** (`js/scenes/WorldMapScene.js`)
  - ch7: 사쿠라 이자카야 (0xffb7c5), ch8: 용의 주방 (0xff4500)
  - ch9: 별빛 비스트로 (0x4169e1), ch10: 향신료 궁전 (0xdaa520)
  - ch11: 선인장 칸티나 (0x228b22), ch12: 슈가 드림랜드 (0xff69b4)

- **시즌 2 스테이지 36개** (`js/data/stageData.js`)
  - STAGE_ORDER에 7-1~12-6 추가 (총 66개)
  - STAGES에 36개 엔트리: nameKo, waves(기존 적 재활용, 난이도 점진 상향), starThresholds
  - 상세 밸런스는 플레이테스트에서 별도 조정 예정

- **SaveManager.isUnlocked('7-1') 특수 조건** (`js/managers/SaveManager.js`)
  - 6-3 cleared + season2Unlocked 복합 조건 (early return 패턴)

- **SaveManager.getTotalStars(season)** (`js/managers/SaveManager.js`)
  - season 파라미터 추가 (0=전체, 1=시즌1 1~6장, 2=시즌2 7~12장)
  - 무인수 호출 시 전체 합계 반환 (하위 호환 유지)

### 변경

- **WorldMapScene NODE_POSITIONS** y값 +10 조정 (탭 영역 확보: 140->150, 270->280, 400->410)
- **WorldMapScene _drawConnections/_drawNodes**: chapters 매개변수 방식으로 변경 (시즌별 6노드 렌더링)
- **WorldMapScene _openStagePanel**: 시즌 오프셋 적용 (offset = currentSeason === 1 ? 0 : 6)
- **WorldMapScene HUD**: 탭 전환 시 해당 시즌 별점으로 갱신

### 변경된 파일 (4개)

| 파일 | 변경 유형 |
|------|----------|
| `js/scenes/ChefSelectScene.js` | 수정 (레이아웃 상수, 폰트 축소, 잠금 로직) |
| `js/scenes/WorldMapScene.js` | 수정 (CHAPTERS 12개, 탭 시스템, 시즌 전환) |
| `js/data/stageData.js` | 수정 (STAGE_ORDER/STAGES 시즌2 36개 추가) |
| `js/managers/SaveManager.js` | 수정 (isUnlocked 7-1 조건, getTotalStars season) |

### 참고

- 스펙: `.claude/specs/2026-04-10-kitchen-chaos-phase19-2-spec.md`
- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase19-2-report.md`
- QA: `.claude/specs/2026-04-10-kitchen-chaos-phase19-2-qa.md`
- visual_change: ui
- Vite 빌드 성공 (1,940KB gzip 427KB)
- QA: PASS (24/24 항목 통과, Playwright 26개 테스트 전수 통과)
- 시즌 2 스테이지 밸런스는 기본 데이터만 준비, 플레이테스트에서 조정 예정
- 스펙 대비 변경 사항 없음 (모든 요구사항 그대로 구현)

---

## [2026-04-10] - Phase 19-1 데이터 레이어 + 세이브 확장 + 도구 전투 로직

### 추가

- **SaveManager v11->v12** (`js/managers/SaveManager.js`)
  - tools에 wasabi_cannon, spice_grinder 필드 (초기값: [])
  - season2Unlocked: false (시즌 2 해금 여부)
  - lazy migration 방식 (load시 메모리 적용, save시 영속화)

- **도구 2종 데이터** (`js/data/gameData.js`, TOOL_DEFS)
  - wasabi_cannon: 범위 공격(splashRadius 40->55) + 둔화(30~35%, 1.5~2초), damage 18->30, fireRate 1200->900ms
  - spice_grinder: 지속 피해(DoT, dotDamage 5->12, 2000ms), damage 12->22, fireRate 1000->750ms
  - buyCost: wasabi_cannon [180,220,260], spice_grinder [160,200,240]
  - projectileSpeed: wasabi_cannon 200, spice_grinder 180 *(스펙 누락 보완)*
  - upgradeCost: [0, x, y] 형식으로 보정 *(기존 인덱싱 패턴 준수)*

- **셰프 2종 데이터** (`js/data/chefData.js`)
  - yuki_chef: 조리시간 -20%, 정밀 보너스(★★★+ 레시피 보상 +15%), 스킬 "정밀 절단" (90초 CD)
  - lao_chef: 도구 공격력 +15%, 재료 드롭률 +10%, 스킬 "불꽃 웍" (120초 CD)
  - CHEF_ORDER: ['petit_chef', 'flame_chef', 'ice_chef', 'yuki_chef', 'lao_chef'] 5종
  - 패시브/스킬 발동 로직은 데이터만 등록, 실행 로직은 19-2 이후 범위

- **캐릭터 정의** (`js/data/dialogueData.js`, CHARACTERS)
  - yuki: nameKo '유키', color 0x87ceeb, role 'ally', portraitKey 'yuki'
  - lao: nameKo '라오', color 0xff4500, role 'ally', portraitKey 'lao'

- **Enemy.js applyDot()** (`js/entities/Enemy.js`)
  - 500ms 간격 틱, _dotStacks 배열 독립 관리, _maxDotStacks=3
  - update()에서 remaining 소진 시 스택 제거 (역순 순회)
  - DoT 활성 중 주황 틴트(0xff8c00), 종료 시 clearTint()

- **Projectile.js 범위/DoT 분기** (`js/entities/Projectile.js`)
  - _hit()에 splashRadius 분기: 범위 내 적 damage * 0.6, 둔화 적용
  - _hit()에 dotDamage 분기: enemy.applyDot() 호출
  - wasabi_cannon 발사체: 연두(0x7cfc00), 1.2배 크기
  - spice_grinder 발사체: 오렌지(0xff8c00)

- **Tower.js fallback** (`js/entities/Tower.js`)
  - wasabi_cannon, spice_grinder 도형 fallback 비주얼 추가

- **ToolManager 확장** (`js/managers/ToolManager.js`)
  - _defaultTools()에 wasabi_cannon, spice_grinder 기본값 추가

### 변경

- **MerchantScene** (`js/scenes/MerchantScene.js`)
  - TOOL_ORDER: 6종 -> 8종 (wasabi_cannon, spice_grinder 추가)
  - TOOL_ICONS에 wasabi_cannon('🟢'), spice_grinder('🟠') 추가
  - 업그레이드 프리뷰에 splashRadius, slowRate, dotDamage 스탯 표시 추가

- **SpriteLoader** (`js/managers/SpriteLoader.js`)
  - CHEF_IDS: 3종 -> 5종 (+yuki_chef, lao_chef)
  - PORTRAIT_IDS: 4종 -> 6종 (+yuki, lao)
  - TOWER_IDS: 6종 -> 8종 (+wasabi_cannon, spice_grinder)

### 참고

- 스펙: `.claude/specs/2026-04-10-kitchen-chaos-phase19-spec.md`
- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase19-1-report.md`
- QA: `.claude/specs/2026-04-10-kitchen-chaos-phase19-1-qa.md`
- 목적 정의서: `.claude/specs/2026-04-10-kitchen-chaos-phase19-1-scope.md`
- visual_change: ui
- Vite 빌드 성공 (51 모듈, 18.13초)
- QA: PASS (수용 기준 7/7, Playwright 8/8, 예외 시나리오 10/10)
- salt 둔화와 wasabi_cannon 둔화 공존 안전 (applySlow가 더 강한 효과 우선 적용)
- 빙결 중 DoT 스택 정지 (burn과 불일치이나 게임플레이 영향 미미, 향후 일관성 검토 필요)
- ChefSelectScene 5종 카드 화면 오버플로는 19-2 범위 (현재 크래시 없이 off-screen 렌더링)
- 에셋 404(셰프 스프라이트, 초상화, 도구 에셋)는 19-3 범위, fallback 정상 동작

---

## [2026-04-10] - Phase 18 레거시 정리 + 기술 부채

### 삭제

- **레거시 씬 4개** (`js/scenes/`)
  - `StageSelectScene.js` — WorldMapScene으로 대체됨 (Phase 11)
  - `MarketScene.js` — GatheringScene으로 대체됨 (Phase 13)
  - `GameScene.js` — Phase 7 레거시, main.js 미등록
  - `GameOverScene.js` — Phase 7 레거시, ResultScene으로 대체됨

- **config.js 미사용 상수 3개** (`js/config.js`)
  - `STARTING_GOLD = 120` (레거시 씬에서만 사용)
  - `WAVE_CLEAR_BONUS = 25` (레거시 씬에서만 사용)
  - `INGREDIENT_SELL_PRICE = 10` (어떤 파일에서도 import되지 않음)
  - 관련 하위 호환 주석 2줄 제거

### 변경

- **main.js** (`js/main.js`)
  - StageSelectScene, MarketScene import 2줄 제거
  - scene 배열에서 StageSelectScene, MarketScene 2항목 제거

- **ResultScene.js** (`js/scenes/ResultScene.js`)
  - `_fadeToScene('StageSelectScene')` 2곳 -> `_fadeToScene('WorldMapScene')`
  - 버튼 레이블 "스테이지 선택" -> "월드맵으로"

- **config.js** (`js/config.js`)
  - @fileoverview: "Phase 7: MarketScene 풀스크린 레이아웃" -> "화면 크기, 게임 씬 레이아웃, ..." 현행화
  - 레이아웃 섹션 주석: "MarketScene 레이아웃 (Phase 7)" -> "게임 씬 레이아웃 (GatheringScene / EndlessScene)"
  - RestaurantScene 주석: "Phase 7-2에서 제거 예정" -> "KitchenPanelUI, CustomerZoneUI 사용" 현행화
  - STARTING_LIVES, FRESHNESS_WINDOW_MS는 활성 코드 사용 중이므로 유지

- **worldmap-qa.spec.js** (`tests/worldmap-qa.spec.js`)
  - "회귀 테스트" 섹션(StageSelectScene 검증 2건) 전체 삭제
  - test 이름에서 "(StageSelectScene 진입 안됨)" 괄호 내용 제거
  - stageSelectActive 관련 코드(assertion + evaluate) 삭제

- **endless-mode-qa.spec.js** (`tests/endless-mode-qa.spec.js`)
  - 캠페인 모드 회귀 테스트: `game.scene.start('StageSelectScene')` -> `'WorldMapScene'` 교체

- **docs/PROJECT.md**
  - 디렉토리 구조에서 레거시 씬 항목 삭제
  - "알려진 제약사항"에서 삭제된 파일/상수 관련 오래된 2줄 제거

### 추가

- **JSDoc 보강** — 7개 파일의 public/private 메서드에 JSDoc 추가
  - `js/scenes/GatheringScene.js`: create, _drawMap, _buildTowerBar, _buildIngredientBar, _buildWaveControl, _spawnEnemy, _onEnemyReachEnd, _onWaveClear, _deployTool, _relocateTool, _cancelRelocation, _transitionToService, _transitionToResult
  - `js/scenes/MerchantScene.js`: init, create, _buildToolList, _buildToolItem, _onBuy, _onSell, _onUpgrade, _updateGoldDisplay, _updateToolDisplay, _buildSummaryBar, _fadeToScene
  - `js/scenes/WorldMapScene.js`: create, _buildChapterNode, _buildConnections, _buildStagePanel, _onNodeTap, _closePanel, _buildEndlessSection
  - `js/managers/ToolManager.js`: buyTool, sellTool, upgradeTool, getToolStats, hasAnyTool, _defaultTools
  - `js/managers/StoryManager.js`: checkTriggers, advanceChapter, getProgress, setFlag, hasFlag
  - `js/managers/DialogueManager.js`: start, hasSeen, markSeen
  - `js/scenes/DialogueScene.js`: init, create, _startDialogue, _showLine, _typeText, _onTap, _showChoices, _onChoiceSelect

### 참고

- 스펙: `.claude/specs/2026-04-10-kitchen-chaos-phase18-spec.md`
- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase18-report.md`
- QA: `.claude/specs/2026-04-10-kitchen-chaos-phase18-qa.md`
- 목적 정의서: `.claude/specs/2026-04-10-kitchen-chaos-phase18-scope.md`
- visual_change: none
- Vite 빌드 성공 (51 모듈, 18.38초), 삭제된 씬 키에 대한 잔존 참조 0건
- RestaurantScene 레이아웃 상수(RESTAURANT_Y 등)는 KitchenPanelUI, CustomerZoneUI에서 활성 사용 중이므로 유지
- 잔여 LOW 이슈: SaveManager.js:29, gameData.js:90 주석에 MarketScene 참조 잔존 (런타임 영향 없음)

---

## [2026-04-10] - Phase 16 인게임 대화 통합

### 추가

- **튜토리얼 대화 연동** (`js/scenes/GatheringScene.js`, `js/scenes/ServiceScene.js`)
  - GatheringScene: 첫 도구 배치 시 `StoryManager.checkTriggers(this, 'tutorial_tool_placed')` 호출 (1줄 추가)
  - ServiceScene: 첫 서빙 완료 시 `StoryManager.checkTriggers(this, 'tutorial_first_serve')` 호출 (StoryManager import + 2곳 추가)
  - triggerPoint 2종 추가: tutorial_tool_placed, tutorial_first_serve

- **영업 이벤트 대화 연동** (`js/scenes/ServiceScene.js`)
  - ServiceScene._triggerRandomEvent() 내에서 `StoryManager.checkTriggers(this, 'service_event', {eventType})` 호출
  - 이벤트별 캐릭터 반응 대화 3종: event_happy_hour (해피아워), event_food_review (미식 평론가), event_kitchen_accident (주방 사고)

- **대화 선택지/분기 시스템** (`js/scenes/DialogueScene.js`, `js/data/dialogueData.js`)
  - DialogueScene에 선택지 버튼 UI 구현 (36px 버튼, 8px gap, 최대 2개)
  - dialogueData.js 형식에 choices 배열 지원 추가
  - AD 검수 반영: 버튼 높이 36px, 간격 8px, 최대 2개 제한

- **대화 스크립트 6종 추가** (`js/data/dialogueData.js`, 수정)
  - tutorial_tool_placed: 튜토리얼 - 첫 도구 배치 완료 시 캐릭터 반응
  - tutorial_first_serve: 튜토리얼 - 첫 서빙 완료 시 캐릭터 반응
  - event_happy_hour: 이벤트 - 해피아워 발생 시 캐릭터 반응
  - event_food_review: 이벤트 - 미식 평론가 방문 시 캐릭터 반응
  - event_kitchen_accident: 이벤트 - 주방 사고 발생 시 캐릭터 반응
  - choice_sample_merchant: 선택지 샘플 - 행상인 할인 요청 (분기 대화)
  - 누적: 대화 스크립트 32종 (26 + 6)

- **스토리 트리거 6개 추가** (`js/data/storyData.js`, 수정)
  - triggerPoint 4종 신규: tutorial_tool_placed, tutorial_first_serve, service_event, merchant_choice
  - 누적: STORY_TRIGGERS 30항목, triggerPoint 8종 (기존 4 + 신규 4)

### 변경된 파일 (5개)

- `js/data/dialogueData.js`: 스크립트 6종 추가 (26 -> 32종)
- `js/data/storyData.js`: 트리거 6개 추가 (24 -> 30항목)
- `js/scenes/DialogueScene.js`: 선택지 UI 구현 (36px 버튼, 8px gap, 최대 2개)
- `js/scenes/GatheringScene.js`: checkTriggers 호출 1줄 추가
- `js/scenes/ServiceScene.js`: StoryManager import + checkTriggers 호출 2곳 추가

### 유지

- SaveManager 버전업 없음 (v11 유지)
- 새 캐릭터(CHARACTERS) / 새 초상화 에셋 추가 없음
- 기존 26개 스크립트/24개 트리거 변경 없음

### 참고

- visual_change: ui (선택지 버튼 UI 추가)
- Phase 16 구현 순서: 16-1(튜토리얼 연동) -> 16-2(이벤트 연동) -> 16-3(선택지/분기)

---

## [2026-04-10] - Phase 15 스토리 콘텐츠 (챕터 2~6)

### 추가

- **대화 스크립트 13종 추가** (`js/data/dialogueData.js`, 수정)
  - chapter2_clear (8줄): 스시 쇼군 격파, 린 라이벌 인정, 메이지 복선
  - chapter3_clear (9줄): 크라켄 격파, 메이지 삼각측량, 팀플레이 첫 성공
  - chapter4_intro (8줄): 화산 지대 진입, 미력 농도 3배, 식란 격화
  - chapter4_mage_joins (10줄): 메이지 현장 합류 선언, 3인 팀 완성
  - chapter4_clear (9줄): 라바 골렘 격파, 인공 미력 증폭 장치 발견
  - chapter5_intro (7줄): 디저트 카페 진입, 포코 납치 복선
  - rin_side_5 (7줄): 린/미미 단둘이 대화, 동기 공유, 우정 진전
  - chapter5_clear (10줄): 파티시에 격파, 포코 구출, 퀴진 갓 이름 최초 등장
  - chapter6_intro (7줄): 그랑 가스트로노미 진입, 최종 결전 직전
  - team_side_6 (8줄): 최종 결전 직전 팀 각오 한 마디씩
  - chapter6_final_battle (9줄): 퀴진 갓 등장, 봉인 내막 폭로
  - chapter6_ending (11줄): 식란 종결, 할머니 유지 완성, 엔딩
  - poco_side_4 (6줄): BBQ 메뉴 제안 + 도구 판촉 코미디
  - 누적: 대화 스크립트 26종
  - 퀴진 갓은 CHARACTERS 미등록, narrator 스타일(portrait 빈 문자열, portraitKey 없음)로 처리

- **STORY_TRIGGERS 13항목 추가** (`js/data/storyData.js`, 수정)
  - worldmap_enter 3개: chapter4_intro (ch>=4), chapter5_intro (ch>=5), chapter6_intro (ch>=6)
  - merchant_enter 1개: poco_side_4 (ch>=4 + poco_discount_fail 시청 후)
  - gathering_enter 1개: chapter6_final_battle (stageId === '6-3')
  - result_clear 8개: chapter2_clear (2-3), chapter3_clear (3-6), chapter4_mage_joins (4-3), chapter4_clear (4-6), rin_side_5 (5-3), chapter5_clear (5-6), team_side_6 (6-2), chapter6_ending (6-3)
  - 일반 stage_first_clear 제외 목록에 신규 8개 stageId 추가 (2-3, 3-6, 4-3, 4-6, 5-3, 5-6, 6-2, 6-3)
  - 누적: STORY_TRIGGERS 배열 24항목

### 유지

- 씬 코드 수정 없음 (WorldMapScene, ResultScene, GatheringScene, MerchantScene)
- SaveManager 버전업 없음 (v11 유지)
- 기존 13개 스크립트/트리거 변경 없음
- 새 캐릭터(CHARACTERS) / 새 초상화 에셋 추가 없음

### 참고

- 스펙: `.claude/specs/2026-04-10-kitchen-chaos-phase15-spec.md`
- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase15-report.md`
- QA: `.claude/specs/2026-04-10-kitchen-chaos-phase15-qa.md`
- visual_change: none
- 스펙 테이블 헤더에 "12개"로 기재되어 있으나, 요구사항 상세 목록(13개)이 정확하며 구현이 이를 반영
- 스토리 아크: 미미 미력사 각성(1장) → 린 라이벌 인정(2장) → 팀 결성(3장) → 식란 인공적 원인 폭로(4장) → 포코 납치/구출, 퀴진 갓 최초 언급(5장) → 최종 결전, 식란 종결(6장)

---

## [2026-04-10] - Phase 14-3 StoryManager 트리거 중앙화

### 추가

- **StoryManager** (`js/managers/StoryManager.js`, 신규)
  - static 스토리 관리자
  - API: getProgress(), checkTriggers(scene, triggerPoint, context), advanceChapter(stageId), setFlag(key), hasFlag(key)
  - checkTriggers(): STORY_TRIGGERS 배열에서 triggerPoint 매칭 + condition 평가 -> 첫 매칭 트리거 실행
  - _fire(): delay 지원, chain 연쇄 실행 (onComplete 콜백)
  - STAGE_TO_CHAPTER 매핑으로 스테이지 -> 챕터 번호 추론

- **storyData.js** (`js/data/storyData.js`, 신규)
  - STORY_TRIGGERS 배열: 13종 트리거 데이터
  - 각 항목: triggerPoint, dialogueId, once, condition(ctx, save), delay, chain
  - triggerPoint 4종: worldmap_enter (4개), merchant_enter (2개), gathering_enter (1개), result_clear (4개) + result_market_failed (1개)
  - chain 연쇄: intro_welcome -> chapter1_start, stage_first_clear(1-6) -> chapter1_clear

### 변경

- **SaveManager** (`js/managers/SaveManager.js`)
  - SAVE_VERSION: 10 -> 11
  - createDefault(): storyProgress { currentChapter: 1, storyFlags: [] } 추가
  - _migrate(): v10->v11 블록 -- seenDialogues 기반 currentChapter 추론 복원 (chapter3_rin_joins -> 3, chapter2_intro/rin_first_meet -> 2)

- **WorldMapScene** (`js/scenes/WorldMapScene.js`)
  - `_triggerDialogues()` 메서드 전체 제거 (intro_welcome, chapter2_intro, mage_introduction, mage_research_hint if/else 분기)
  - DialogueManager import -> StoryManager import
  - create()에서 `StoryManager.checkTriggers(this, 'worldmap_enter')` 1줄로 교체

- **MerchantScene** (`js/scenes/MerchantScene.js`)
  - `_triggerMerchantDialogue()` 메서드 전체 제거 (merchant_first_meet, poco_discount_fail if/else 분기)
  - DialogueManager import -> StoryManager import
  - create()에서 `StoryManager.checkTriggers(this, 'merchant_enter')` 1줄로 교체

- **ResultScene** (`js/scenes/ResultScene.js`)
  - `_triggerResultDialogues()` 메서드 전체 제거 (stage_first_clear, chapter1_clear, rin_first_meet, chapter3_rin_joins, after_first_loss if/else 분기)
  - DialogueManager import -> StoryManager import
  - 캠페인 클리어: `StoryManager.checkTriggers(this, 'result_clear', {stageId, stars, isFirstClear})` + `StoryManager.advanceChapter(stageId)`
  - 장보기 실패: `StoryManager.checkTriggers(this, 'result_market_failed')`

- **GatheringScene** (`js/scenes/GatheringScene.js`)
  - `_triggerGatheringDialogues()` 메서드 전체 제거 (stage_boss_warning, chapter1_start if/else 분기)
  - DialogueManager import -> StoryManager import
  - create()에서 `StoryManager.checkTriggers(this, 'gathering_enter', {stageId})` 1줄로 교체

### 참고

- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase14-3-report.md`
- visual_change: none
- storyData.js에 트리거를 추가하는 것만으로 씬 코드 수정 없이 새 대화 삽입 가능

---

## [2026-04-10] - Phase 14-2 대화 콘텐츠 + 캐릭터 초상화

### 추가

- **캐릭터 초상화 4종** (`assets/portraits/`, 신규)
  - portrait_mimi.png, portrait_poco.png, portrait_rin.png, portrait_mage.png
  - 64x64px, 투명 배경, PixelLab 생성 (치비 스타일, single color outline, basic shading)

- **SpriteLoader 초상화 로드** (`js/managers/SpriteLoader.js`, 수정)
  - PORTRAIT_IDS 상수: `['mimi', 'poco', 'rin', 'mage']`
  - `_loadPortraits()` 메서드: 4종 초상화 텍스처 preload
  - `preload()`에서 `_loadPortraits()` 호출 추가

- **CHARACTERS 확장 + 스크립트 10종 추가** (`js/data/dialogueData.js`, 수정)
  - CHARACTERS에 린(rin, color:0xff4444, role:rival), 메이지(mage, color:0xcc88ff, role:researcher) 추가
  - 기존 mimi/poco에 `portraitKey` 필드 추가
  - 기존 3종 스크립트의 각 라인에 `portraitKey` 필드 추가
  - 신규 10종: chapter1_start, chapter1_clear, chapter2_intro, rin_first_meet, mage_introduction, poco_discount_fail, stage_boss_warning, after_first_loss, chapter3_rin_joins, mage_research_hint
  - 총 13개 스크립트, 식란 세계관(미력사/정화/식란) 용어 반영

- **대화 트리거 — WorldMapScene** (`js/scenes/WorldMapScene.js`, 수정)
  - DialogueManager import
  - `_triggerDialogues()`: intro_welcome (첫 진입), chapter2_intro (2장 해금), mage_introduction (3장 해금), mage_research_hint (메이지 등장 후 재방문)
  - intro_welcome -> chapter1_start 연쇄 트리거 (onComplete 콜백)

- **대화 트리거 — MerchantScene** (`js/scenes/MerchantScene.js`, 수정)
  - DialogueManager import
  - `_triggerMerchantDialogue()`: merchant_first_meet (최초 방문), poco_discount_fail (2회차 이후 방문)

- **대화 트리거 — ResultScene** (`js/scenes/ResultScene.js`, 수정)
  - DialogueManager import
  - `_triggerResultDialogues()`: stage_first_clear (최초 클리어, 800ms 딜레이), chapter1_clear (1-6 클리어 시 연쇄), rin_first_meet (2-1 최초 클리어), chapter3_rin_joins (3-3 최초 클리어), after_first_loss (첫 장보기 실패)

- **대화 트리거 — GatheringScene** (`js/scenes/GatheringScene.js`, 수정)
  - DialogueManager import
  - `_triggerGatheringDialogues()`: stage_boss_warning (보스 스테이지 x-6 최초 진입, 400ms 딜레이), chapter1_start (WorldMap 미시청 시 백업 트리거)

### 변경

- **DialogueScene** (`js/scenes/DialogueScene.js`, 수정)
  - PORTRAIT_SIZE: 24 -> 48
  - `_portraitText` (Text 오브젝트) -> `_portraitImage` (Phaser.Image) + `_portraitEmoji` (Text, fallback)
  - `_showLine()`: portraitKey 존재 + SpriteLoader.hasTexture() true -> 스프라이트 표시, false -> 이모지 fallback
  - `setTexture()` 호출 후 `setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE)` 적용 (QA BUG-001 수정)
  - 이름 텍스트 x좌표: NAME_X + PORTRAIT_SIZE + 6 = 74 (이미지 크기 반영)

### 수정 (QA 피드백)

- **BUG-001**: `DialogueScene._showLine()` Line 192에서 `setTexture()` 호출 시 Phaser가 내부 스케일을 리셋하여 초상화가 64px(네이티브)로 렌더링되던 문제. `setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE)` 체이닝으로 48px 정규화 적용

### 참고

- 스펙: `.claude/specs/2026-04-10-kitchen-chaos-phase14-2-spec.md`
- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase14-2-report.md`
- QA: `.claude/specs/2026-04-10-kitchen-chaos-phase14-2-qa.md`
- 목적 정의서: `.claude/specs/2026-04-10-kitchen-chaos-phase14-2-scope.md`
- 스펙의 14-3(초상화 교체)이 14-2에 통합됨

---

## [2026-04-10] - Phase 14-1 대화 엔진

### 추가

- **dialogueData.js** (`js/data/dialogueData.js`, 신규)
  - 3개 대화 스크립트: intro_welcome (8줄, 미미+포코 첫 만남), merchant_first_meet (6줄, 행상인 첫 방문), stage_first_clear (5줄, 첫 클리어)
  - CHARACTERS 정의 3종: mimi (주인공, 0xff8899), poco (행상인, 0xffaa33), narrator (0xcccccc)
  - 이모지 초상화: 미미=`U+1F467`, 포코=`U+1F392` (임시, 추후 스프라이트 교체 가능)

- **DialogueManager** (`js/managers/DialogueManager.js`, 신규)
  - static 대화 관리자
  - API: start(callerScene, dialogueId, options), hasSeen(dialogueId), markSeen(dialogueId), getScript(dialogueId), resetAll()
  - start(): 이미 본 대화는 건너뜀 (force 옵션으로 강제 재생 가능)
  - markSeen(): 대화 종료 시 onComplete 콜백 내에서 자동 호출

- **DialogueScene** (`js/scenes/DialogueScene.js`, 신규)
  - scene.launch() 오버레이 씬 (배경 씬 위에 표시)
  - 레이아웃: 딤 오버레이(0x000000, 0.3) + 하단 180px 패널(0x1a0a00, alpha 0.88) + 상단 구분선(0xff6b35)
  - 캐릭터: 이모지 초상화(24px, 좌측) + 이름(14px bold, #ffd700) + 대사(14px, wordWrap 320px)
  - 타이핑 애니메이션: 30ms/글자, time.addEvent 기반
  - 인터랙션: 탭 시 타이핑 중→즉시 완료, 완료→다음 대사, 마지막 대사→씬 종료+콜백
  - 건너뛰기: skippable 스크립트에 우상단 버튼 표시 (hitArea 60x44, AD 검수 반영)
  - narrator 스타일: 이탤릭, #cccccc, 이름/초상화 숨김
  - 진행 힌트: "▼" 깜빡임 tween (alpha 0.2~1, 500ms yoyo), 대사 하단에 동적 Y (AD 검수 반영)
  - shutdown(): 타이머 + tween 정리

### 변경

- **SaveManager** (`js/managers/SaveManager.js`)
  - SAVE_VERSION: 9 → 10
  - createDefault(): seenDialogues(빈 배열) 추가
  - _migrate(): v9→v10 블록 (seenDialogues=[] 초기화)
  - 신규 API: hasSeenDialogue(dialogueId), markDialogueSeen(dialogueId)

- **main.js** (`js/main.js`)
  - DialogueScene import + scene 배열 등록

### AD 검수 반영

- 건너뛰기 버튼 hitArea: 기본 텍스트 영역 → 60x44 Rectangle (터치 타겟 확대)
- 진행 힌트 "▼" 위치: 고정 y=620 → 대사 텍스트 하단 + 20px (동적 조정, max y=600)

### 참고

- 리포트: `.claude/specs/2026-04-10-kitchen-chaos-phase14-1-dialogue-engine-report.md`
- 커밋: cbd1f4f (구현), a6a5de8 (AD 수정)
- 대화 트리거 연동은 후속 Phase에서 구현 예정 (기존 씬 미수정)

---

## [2026-04-10] - Phase 13 도구 시스템 리워크

### 추가

- **ToolManager** (`js/managers/ToolManager.js`, 신규)
  - 영구 도구 인벤토리 매니저 (static 메서드)
  - API: getToolInventory, getGold, addGold, canBuyTool, buyTool, getBuyCost, canSellTool, getSellPrice, sellTool, canUpgradeTool, upgradeTool, getUpgradeCost, getToolStats, hasAnyTool, _defaultTools
  - 판매가 = buyCost[count-1] * sellRate(0.5), 레벨 유지

- **TOOL_DEFS** (`js/data/gameData.js`, +150줄)
  - 6종 도구 데이터: pan, salt, grill, delivery, freezer, soup_pot
  - 각 도구: maxCount(3~5), buyCost(점증), sellRate(0.5), maxLevel(3), upgradeCost, stats(레벨별), category(attack/support)
  - 특수 속성: projectileSpeed, burnInterval, canTargetInvisible 등

- **GatheringScene** (`js/scenes/GatheringScene.js`, 신규)
  - MarketScene 기반, 골드 시스템 완전 제거 (STARTING_GOLD, WAVE_CLEAR_BONUS 미사용)
  - ToolManager 기반 도구 배치 (보유 도구만 팔레트 표시, 잔여 수량 관리)
  - 도구 회수/재배치: 탭-탭 방식 (노란 테두리 + 회수 버튼)
  - 보스 처치 시 재료 드롭 (bossDrops 배열, 드롭 팝업 + 인벤토리 추가)
  - HUD: 골드 표시 제거 → 도구 수량(배치/보유) 표시

- **MerchantScene** (`js/scenes/MerchantScene.js`, 신규)
  - 360x640 레이아웃: 타이틀(y=20~60) + 도구 목록(y=80~530, 스크롤) + 요약 바(y=540~570) + 출발 버튼(y=580~620)
  - 도구 6종: 구매 버튼(골드 부족 시 비활성화, 상한 시 MAX) + 판매 버튼(미보유 시 비활성화) + 업그레이드 버튼(스탯 프리뷰)
  - 마지막 도구 판매 시 경고 팝업
  - 구매/판매/업그레이드 후 전체 UI 즉시 새로고침
  - 캠페인: MerchantScene → WorldMapScene / 엔드리스: MerchantScene → EndlessScene

- **보스 재료 드롭** (`js/data/gameData.js`, `js/entities/Enemy.js`)
  - 보스 6종에 bossDrops 배열 추가 (기존 bossReward 골드 대체)
  - pasta_boss: 밀가루3+달걀2 / dragon_ramen: 생선3+쌀3 / seafood_kraken: 새우4+문어3
  - lava_dessert_golem: 설탕4+버터3 / master_patissier: 우유5+설탕4 / cuisine_god: 고기5+치즈5+버터4
  - Enemy.js boss_killed 이벤트에 bossDrops 데이터 전달

### 변경

- **SaveManager** (`js/managers/SaveManager.js`)
  - SAVE_VERSION: 8 → 9
  - createDefault(): gold(0), tools(6종, 스타터: pan×2 Lv1), tutorialMerchant(false) 추가
  - _migrate(): v8→v9 블록 추가
  - 신규 API: getGold(), setGold()

- **EndlessScene** (`js/scenes/EndlessScene.js`)
  - 상속: MarketScene → GatheringScene
  - 골드 시스템 완전 제거 (WAVE_CLEAR_BONUS import 제거, gold 복원/전달 제거)
  - _onEndlessWaveCleared(): 골드 보너스 로직 제거
  - bossReward는 점수 전용으로만 사용 (골드 미지급)

- **ServiceScene** (`js/scenes/ServiceScene.js`)
  - _endService(): ToolManager.addGold() 호출로 영구 골드 누적
  - 엔드리스 모드 종료 시: EndlessScene 직접 복귀 → MerchantScene 경유로 변경

- **ResultScene** (`js/scenes/ResultScene.js`)
  - 캠페인 정상 정산 시 "행상인 방문" 버튼 추가
  - 장보기 실패/엔드리스 결과는 변경 없음

- **ChefSelectScene** (`js/scenes/ChefSelectScene.js`)
  - 캠페인 전환 대상: MarketScene → GatheringScene

- **main.js** (`js/main.js`)
  - GatheringScene, MerchantScene import + 씬 배열 등록

- **config.js** (`js/config.js`)
  - STARTING_GOLD, WAVE_CLEAR_BONUS에 Phase 13 하위 호환 주석 추가

### 유지

- **MarketScene.js** — 삭제하지 않고 레거시로 유지 (GatheringScene이 대체)
- **TOWER_TYPES** (gameData.js) — 기존 데이터 유지, TOOL_DEFS가 새 시스템용

### 참고

- 스펙: `.claude/specs/2026-04-10-kitchen-chaos-phase13-scope.md`
- 리포트 13-1: `.claude/specs/2026-04-10-kitchen-chaos-phase13-1-report.md`
- 리포트 13-2: `.claude/specs/2026-04-10-kitchen-chaos-phase13-2-report.md`
- 리포트 13-3: `.claude/specs/2026-04-10-kitchen-chaos-phase13-3-report.md`
- 리포트 13-4: `.claude/specs/2026-04-10-kitchen-chaos-phase13-4-report.md`
- 커밋: 13-1 `daa95d9` / 13-2 `e0e51f6` / 13-3 `fc90b66` / 13-4 `2f0da1d`

---

## [2026-04-10] - Phase 11-3d 출시 준비

### 추가

- **APP_VERSION 상수** (`js/config.js`, +3줄)
  - `export const APP_VERSION = '1.0.0'` 전역 버전 상수 추가
  - MenuScene, WorldMapScene에서 참조

- **MenuScene 버전 표기** (`js/scenes/MenuScene.js`, +5줄)
  - 화면 하단(y=632)에 `v1.0.0` 텍스트 표시 (10px, #555555)

- **전역 에러 핸들러** (`js/main.js`, +25줄)
  - `window.onerror`: 프로덕션에서 에러를 콘솔 로깅만 수행, 브라우저 에러 표시 억제
  - `window.onunhandledrejection`: 미처리 Promise 거부를 콘솔 로깅, 프로덕션에서 preventDefault

- **localStorage 용량 체크** (`js/managers/SaveManager.js`, +16줄)
  - `getStorageSize()` 유틸리티 메서드: 세이브 데이터 크기를 bytes/KB로 반환
  - BootScene 초기화 시 콘솔에 세이브 데이터 크기 로깅

### 변경

- **WorldMapScene** (`js/scenes/WorldMapScene.js`, +2줄)
  - 하드코딩 'v1.0.0' -> `APP_VERSION` 상수 참조로 변경

- **BootScene** (`js/scenes/BootScene.js`, +3줄)
  - create()에서 `SaveManager.getStorageSize()` 호출, 크기 콘솔 로깅

- **.gitignore** (`kitchen-chaos/.gitignore`, +5줄)
  - `*.zip`, `.DS_Store`, `Thumbs.db` 패턴 추가

### 문서

- **ROADMAP.md** — Phase 11 전체 완료 표시, 타임라인 갱신
- **CHANGELOG.md** — Phase 11-3b/3c/3d 변경이력 추가
- **PROJECT.md** — 출시 준비 "완료" 상태, 세이브 v8 반영

---

## [2026-04-10] - Phase 11-3c 성능 최적화

### 추가

- **ObjectPool** (`js/managers/ObjectPool.js`, 신규)
  - 범용 오브젝트 풀 클래스 (acquire/release/releaseAll/clear API)

### 변경

- **VFXManager** — ObjectPool 기반 Circle/Star 파티클 재활용, TTL 자동 정리
- **MarketScene** — 화면 밖 적 update 스킵 (y < -50 or y > 700), shutdown 시 tweens/timer 정리
- **ServiceScene** — 빈 테이블 _isEmpty 플래그로 중복 렌더 생략, shutdown 정리
- **GameScene, RestaurantScene** — shutdown 시 tweens/timer 정리 추가

---

## [2026-04-10] - Phase 11-3b UI/UX 통합 점검

### 변경

- 모든 씬에 fadeIn/fadeOut 300ms 일관 적용
- 도감 버튼 Secondary 팔레트(#886600) 적용
- 터치 피드백 pointerover/pointerout 색상 변경 통일

---

## [2026-04-10] - Phase 11-3a 튜토리얼 개선

### 추가

- **TutorialManager** (`js/managers/TutorialManager.js`, 신규) — 공용 오버레이 렌더링, 스텝 관리, 스킵 기능

### 변경

- **SaveManager** — v7->v8 마이그레이션: tutorialBattle/Service/Shop/Endless 4개 개별 플래그
- **MarketScene** — TutorialManager 위임으로 인라인 튜토리얼 교체
- **ServiceScene** — 영업 튜토리얼 4단계 추가
- **ShopScene** — 상점 튜토리얼 3단계 추가
- **EndlessScene** — 엔드리스 튜토리얼 3단계 추가

---

## [2026-04-10] - Phase 11-2 스테이지 월드맵

### 추가

- **WorldMapScene** (`js/scenes/WorldMapScene.js`, 622줄 신규)
  - StageSelectScene을 대체하는 비주얼 노드맵 씬
  - 6개 챕터를 2열 3행 지그재그 노드 그래프로 배치 (NODE_POSITIONS: 100,140 / 260,140 / 100,270 / 260,270 / 100,400 / 260,400)
  - 노드 간 연결선 7개 (Phaser Graphics): 해금 경로=실선(3px, 0xaaaaaa), 잠금 경로=점선(2px, 0x555555, 10px 간격)
  - 노드 상태 3종: 잠금(회색 원 + 자물쇠 아이콘) / 진행중(테마색 + glow tween 알파 0.1~0.35) / 올클리어(골든 테두리 4px + 체크마크)
  - `_buildChapterStates()`: SaveManager.isUnlocked() 기반 챕터 해금/진행/클리어 판정
  - `_openStagePanel(chapterIdx)`: 슬라이드업 패널 (300x400, 250ms Power2 tween), dim overlay, 패널 내 스크롤 지원
  - `_closeStagePanel()`: 슬라이드다운 닫기 (200ms Power2 tween)
  - `_createStageItem()`: StageSelectScene 로직 재활용, 스테이지 선택 -> ChefSelectScene 전환
  - `_createHUD()`: 상단 40px 영역 -- 뒤로가기(좌), 총 별점(중앙, SaveManager.getTotalStars), 레시피 수집률(우, RecipeManager.getCollectionProgress)
  - `_createEndlessSection()`: 하단 엔드리스 버튼(해금: 보라색 0x6622cc / 잠금: 회색 0x444444) + 최고 웨이브 기록 + v1.0.0 푸터
  - 모든 인터랙티브 요소: pointerover/pointerout 피드백 + SoundManager.playSFX('sfx_ui_tap')
  - fadeIn(400ms) / fadeOut(300ms) 일관 적용

### 변경

- **MenuScene** (`js/scenes/MenuScene.js`, +2줄)
  - "게임 시작" 전환 대상: `StageSelectScene` -> `WorldMapScene`
  - fileoverview에 Phase 11-2 기록 추가

- **main.js** (`js/main.js`, +2줄)
  - WorldMapScene import 추가
  - scene 배열에 WorldMapScene 등록 (StageSelectScene 뒤)

### 유지

- **StageSelectScene.js** -- 삭제하지 않고 유지 (scene 배열에도 존재, 직접 진입 경로만 끊김)

### 설계 결정

- **StageSelectScene 비삭제**: 하위 호환 보존 + 11-3에서 참조 가능성
- **CHAPTERS 상수 재정의**: StageSelectScene에서 import하지 않고 WorldMapScene 내부에 독립 정의 (씬 간 결합도 최소화)
- **3장 챕터명 축약**: StageSelectScene "3장: 바닷가 씨푸드 바" -> WorldMapScene "3장: 씨푸드 바" (노드 라벨 공간 제약)
- **엔드리스 y좌표 조정**: 스펙 y=560~600 -> 구현 y=555~625 (레이아웃 밸런스)
- **dim overlay depth 구조**: dim overlay(depth 100) > HUD(depth 50~52) > 노드/연결선(기본 depth) -- 패널 열린 상태에서 HUD 클릭 차단

### QA 결과

- **판정**: PASS (34/34)
- 수용 기준 14/14, 예외 시나리오 7/7, 회귀 2/2, 시각 검증 10건 확인
- Playwright 34개 통과 (테스트 파일: `tests/worldmap-qa.spec.js`)
- LOW 이슈 3건 (기능 영향 없음): 스크롤 리스너 방어 코드, dim overlay 좌표 주석, HUD 수집률 텍스트 우측 미세 클리핑

### 참고

- 스펙: `.claude/specs/2026-04-09-kitchen-chaos-phase11-2-spec.md`
- 리포트: `.claude/specs/2026-04-09-kitchen-chaos-phase11-2-report.md`
- QA: `.claude/specs/2026-04-09-kitchen-chaos-phase11-2-qa.md`
- Phase 11 기획서: `.claude/specs/2026-04-09-kitchen-chaos-phase11-scope.md`

---

## [2026-04-09] - Phase 11-1 엔드리스 모드

### 추가

- **EndlessScene** (`js/scenes/EndlessScene.js`, 387줄 신규)
  - MarketScene 상속, 무한 웨이브 TD 씬
  - `_patchWaveManagerForEndless()`: WaveManager MonkeyPatch로 무한 웨이브 주입
  - `_calcDailySpecials()`: UTC 기준 데일리 시드(LCG) 기반 스페셜 레시피 3종 선정
  - `_onEndlessWaveCleared()`: 5웨이브마다 ServiceScene 전환, 그 외 다음 웨이브 준비
  - `_triggerGameOver()`: 엔드리스 기록 저장 + ResultScene 전환
  - HUD: `waveText`를 `웨이브 {N}` 형식으로 override

- **EndlessWaveGenerator** (`js/managers/EndlessWaveGenerator.js`, 154줄 신규)
  - 웨이브 번호 입력 → 적 구성 반환 순수 로직 모듈
  - 4구간 적 풀: 1~5(5종) / 6~10(+3종) / 11~15(+6종) / 16~20(+2종) / 21+(전 16종)
  - 난이도 배율: `hpMultiplier = 1 + (wave-1)*0.12`, `speedMultiplier = min(2.0, 1 + (wave-1)*0.02)`, `countMultiplier = 1 + floor(wave/5)*0.15`
  - 10웨이브마다 보스 1체 추가 (보스 HP x1.5 추가 배율)
  - 보스 풀: pasta_boss, dragon_ramen, seafood_kraken, lava_dessert_golem, master_patissier, cuisine_god

- **MenuScene 엔드리스 버튼** (`js/scenes/MenuScene.js`, +63줄)
  - 6-3 미클리어: 회색(0x444444) 잠금, 클릭 비활성
  - 6-3 클리어: 보라색(0x6622cc) 활성, ChefSelectScene(stageId='endless')으로 전환
  - 베스트 기록 표시 (최고 웨이브/점수)
  - 기존 버튼 y좌표 재배치 (게임시작 390, 상점 450, 도감 500, 엔드리스 550)

- **ResultScene 엔드리스 분기** (`js/scenes/ResultScene.js`, +104줄)
  - `_createEndlessResultView()`: 보라색 배경, 도달 웨이브/점수/콤보, 신기록 NEW 하이라이트
  - "다시 도전" + "메인 메뉴" 버튼

- **ServiceScene 엔드리스 지원** (`js/scenes/ServiceScene.js`, +119줄)
  - `isEndless` 플래그 수신, 영업 종료 시 EndlessScene 복귀 분기
  - `_showDailySpecialsPopup()`: 스페셜 레시피 3종 안내 팝업 (280x200, 4초 자동닫기)
  - 스페셜 레시피 서빙 시 보상 x2.0 + VFX 플로팅 텍스트

- **ChefSelectScene 엔드리스 분기** (`js/scenes/ChefSelectScene.js`, +22줄)
  - `stageId='endless'` 시 EndlessScene으로 전환, 부제목 "엔드리스 모드" 표시

### 변경

- **SaveManager** (`js/managers/SaveManager.js`, +95줄)
  - `SAVE_VERSION`: 6 → 7
  - `createDefault()`: `data.endless` 필드 추가 (unlocked, bestWave, bestScore, bestCombo, lastDailySeed)
  - `_migrate()`: v6→v7 블록 (6-3 기클리어 시 자동 해금)
  - 신규 API: `isEndlessUnlocked()`, `unlockEndless()`, `saveEndlessRecord()`, `getEndlessRecord()`
  - `clearStage('6-3')` 시 `data.endless.unlocked = true` 설정

- **main.js** (+3줄): EndlessScene import 및 scene 배열 등록

### 설계 결정

- **MarketScene 상속**: EndlessScene이 MarketScene을 extends하여 TD 로직(타워, 적 AI, 재료 드롭) 100% 재사용. override 대상은 create, _triggerGameOver, _checkWaveProgress, _updateHUD, shutdown만.
- **WaveManager MonkeyPatch**: WaveManager.js 원본 수정 없이 `_buildSpawnQueue`, `_spawnEnemy`, `update`를 런타임 교체. WaveManager에 공식 override API가 없어 채택.
- **LCG 데일리 시드**: `seed = Math.floor(Date.now() / 86400000)`, LCG 파라미터 multiplier=1664525, increment=1013904223 (Numerical Recipes). 같은 날 동일 결과 보장.
- **gold vs endlessScore 이중 추적**: `this.gold`은 타워 구매용 소비 가능 골드, `this.endlessScore`는 누적 점수(WAVE_CLEAR_BONUS + bossReward + 영업 수입).

### QA 결과

- **판정**: PASS (24/24)
- 수용 기준 14/14, 예외 시나리오 10/10, Playwright 24개 통과
- 시각적 검증: 스크린샷 8장 확인 (메뉴 잠금/해금, 셰프선택, EndlessScene HUD, 레이아웃 등)

### 참고

- 스펙: `.claude/specs/2026-04-09-kitchen-chaos-phase11-1-spec.md`
- QA: `.claude/specs/2026-04-09-kitchen-chaos-phase11-1-qa.md`
- Phase 11 기획서: `.claude/specs/2026-04-09-kitchen-chaos-phase11-scope.md`
