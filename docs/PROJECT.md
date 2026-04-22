# Kitchen Chaos Tycoon 기획서

> 최종 업데이트: 2026-04-22 (Phase 63 Tile Detail & Minor Polish 완료)

## 프로젝트 개요

모바일 타워 디펜스 + 레스토랑 타이쿤 하이브리드 게임(구 Kitchen Chaos Defense). 영구 도구를 배치해 적을 처치하고 재료를 채집하는(재료 채집 페이즈) → 재료로 손님에게 요리를 서빙하여 골드를 획득하는(영업 페이즈) → 골드로 도구를 구매/업그레이드하거나 되돌릴 수 없는 로그라이크 분기 카드 3장 중 1장을 선택하는(행상인) 3단계 루프 구조. Phaser.js 3 기반 웹 게임, Android 우선 배포.

세계관/스토리/캐릭터 상세: [STORY.md](STORY.md) 참조.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 엔진 | Phaser.js 3 |
| 언어 | JavaScript (바닐라) |
| 아트 | PixelLab API + SD Forge SDXL (픽셀 아트, 메뉴 비주얼) |
| 사운드 | Web Audio API (프로시저럴) |
| 빌드 | Vite + Capacitor (Android) |
| 테스트 | Playwright |

## 아키텍처

### 핵심 모듈

| 모듈 | 파일 | 역할 |
|------|------|------|
| 재료 채집 | GatheringScene.js | 도구 배치/회수/재배치, 적 AI, 재료 드롭, 보스 재료 드롭, 웨이브 진행 |
| 도구 관리 | ToolManager.js | 영구 도구 인벤토리 (구매/판매/업그레이드/스탯 조회) |
| 행상인 | MerchantScene.js | 2탭 UI (도구 구매/분기 선택), 도구 구매·판매·업그레이드 + 되돌릴 수 없는 3택 1 분기 카드 |
| 분기 효과 | BranchEffects.js + merchantBranchData.js | 분기 카드 32장 정의(mutation/recipe/bond/blessing × 8), 게임플레이 씬에서 배수·시너지·tint 조회하는 경량 어댑터 |
| 월드맵 | WorldMapScene.js | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률 HUD |
| 엔드리스 | EndlessScene.js + EndlessWaveGenerator.js + EndlessMissionManager.js | 무한 웨이브 TD, 5웨이브마다 영업+행상인 삽입, 미력 폭풍 이벤트, 정화 임무 4종, 통계 트래킹(폭풍/임무/무결) |
| 영업 코어 | ServiceScene.js | 손님 입장/주문/조리/서빙/팁, 골드→영구 저장, 아이소메트릭 홀 (3레이어 분리 렌더링+depth sorting+홀 데코), 챕터별 홀 배경 (바닥 8종 tileSprite+뒷벽 8종), 엔드리스 웨이브 구간별 배경 테마 전환, 웜 다크 통합 팔레트, 픽셀아트 렌더링 (fallback 지원) |
| 결과 | ResultScene.js | 캠페인 별점/엔드리스 기록 표시, 행상인 방문 연결 |
| 대화 시스템 | DialogueManager.js + DialogueScene.js + dialogueData.js | 대화 스크립트 ~106종 재생, 선택지 분기 UI, 픽셀아트 초상화 렌더링, 시청 기록 |
| 스토리 시스템 | StoryManager.js + storyData.js | 트리거 중앙 디스패처(triggerPoint 8종), ~111항목, 챕터 진행도, 스토리 플래그(객체), onComplete 콜백, 씬 1줄 호출 |
| 세이브 | SaveManager.js | localStorage, 마이그레이션 체인 v1~v24, season3Unlocked, getTotalStars(group), achievements, mireukEssence/wanderingChefs/giftIngredients/endless통계/branchCards 헬퍼 |
| 쿠폰 | CouponRegistry.js | 쿠폰 레지스트리, redeemCoupon() API, 일반 3종+DEV 치트 5종, 사용 이력 localStorage 관리 |
| 사운드 | SoundManager.js | 프로시저럴 SFX 20종 + BGM 5종 |
| VFX | VFXManager.js | Canvas2D 파티클, 스크린 플래시/셰이크, 플로팅 텍스트, 범용 floatingText |
| 적 | Enemy.js | 적 AI, 메커닉(dodge/charge/thorns/taunt/summon/split/magic resistance 등), 주기적 소환, _animState 상태 머신(IDLE/WALKING/DYING) |
| 업적 | AchievementManager.js + achievementData.js + AchievementScene.js | 34개 업적, 해금 판정/보상(골드/코인/정수), 카테고리 탭 UI |
| 스프라이트 | SpriteLoader.js | walk/death 프레임 시퀀스 로딩 (적+보스+미니보스), Phaser anim 등록, 방향 폴백 매핑, 챕터별 홀 바닥·뒷벽 에셋 로드, 테이블 front/back+손님 waiting/seated 에셋 로드, portrait 9종 (arjun 포함) |
| 메인 메뉴 | MenuScene.js | 배경 이미지(menu_bg) + 타이틀 로고(menu_title_logo) + 미미 스프라이트 + 버튼 5종 + 설정/쿠폰 |
| 데이터 | stageData.js / gameData.js / recipeData.js / merchantBranchData.js | 스테이지 143슬롯, 적 57종, 재료 32종, 레시피 292종(일반 284+분기 8), 분기 카드 32장 |

### 게임 루프

```
메뉴 → 월드맵 → 셰프 선택 → GatheringScene(재료 채집) → ServiceScene(영업) → ResultScene → MerchantScene(행상인) → 월드맵
메뉴 → 월드맵 → 엔드리스 → 셰프 선택 → EndlessScene(TD) ↔ ServiceScene(영업) → MerchantScene(행상인) → EndlessScene(계속) → ... → ResultScene(게임오버)
```

## 기능 목록

| 기능 | 설명 | 상태 |
|------|------|------|
| 코어 TD | 아이소메트릭 그리드, 도구 배치/회수/재배치, 적 AI, 재료 드롭 | 완료 |
| 3단계 루프 | GatheringScene(재료 채집) + ServiceScene(영업) + MerchantScene(행상인) + ResultScene | 완료 |
| 캠페인 | 24챕터 체계(그룹1~3), 보스 13종, 별점 시스템 | 완료 |
| 레시피 | 284종, 5등급, 도감 | 완료 |
| 셰프 시스템 | 7종 Named 셰프 (미미/린/메이지/유키/라오/앙드레/아르준), 전원 패시브+액티브 스킬, 챕터 기반 잠금 해제, 가로 캐러셀 UI (260x380px 카드, 스와이프/화살표 전환, 순환 탐색) | 완료 |
| 상점 | 5탭 (업그레이드/레시피/테이블/인테리어/직원) | 완료 |
| 영업 심화 | 테이블 8석, 인테리어, 직원 2종, 특수손님, 이벤트 | 완료 |
| 사운드 | SFX 20종 + BGM 5종, 설정 UI | 완료 |
| VFX | 파티클, 스크린 효과, 플로팅 텍스트 | 완료 |
| 엔드리스 모드 | 무한 웨이브 TD, 데일리 스페셜, 로컬 랭킹, 미력 폭풍의 눈 이벤트(15웨이브 배수), 정화 임무 4종, 유랑 미력사 8% 등장, 웨이브 구간별 배경 테마 전환 | 완료 |
| 월드맵 UI | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률 HUD, 엔드리스 섹션 | 완료 |
| 튜토리얼 개선 | 영업/상점/엔드리스 안내, 개별 플래그 | 완료 |
| UI/UX 폴리시 | 씬 전환, 버튼 스타일, 터치 피드백 통일 | 완료 |
| 성능 최적화 | 오브젝트 풀링, 불필요 렌더링 제거, 메모리 관리 | 완료 |
| 출시 준비 | 버전 표기(APP_VERSION), 전역 에러 핸들러, localStorage 용량 체크 | 완료 |
| 도구/행상인/채집 | 영구 도구 8종, 구매/판매/업그레이드, 행상인 UI, 재료 채집 TD, 도구 도감/팝업 | 완료 |
| 대화/스토리 | 스크립트 ~106종, 트리거 ~111항목, 선택지 분기, 초상화 6종, 15캐릭터 | 완료 |
| 영업 씬 비주얼 | 아이소메트릭 홀 (3레이어 분리 렌더링, 테이블 front/back 10종+손님 10종+챕터별 바닥 8종+뒷벽 8종, 홀 데코, depth 체계 정비) | 완료 |
| 그룹2 콘텐츠 (7~15장) | 일식/중식/양식 아크, 적 16종+보스 4종, 레시피 80종, 대화 32종, 42스테이지 밸런스 검증 완료 | 완료 |
| 그룹3 콘텐츠 (16~24장) | 인도(16~18)/멕시칸(19~21)/디저트·최종(22~24) 아크, 적 14종+보스 3종(maharaja/el_diablo_pepper/queen_of_taste 3페이즈), 레시피 57종, 대화 28종, 전 스테이지(16-1~24-6) 구현, 밸런스 QA 완료 | 완료 |
| 업적 시스템 | 34개 업적 (5카테고리), 조건 판정+보상(골드/코인/정수), 토스트 알림, 전용 AchievementScene UI | 완료 |
| 아트 리워크 | 레거시 스프라이트 64px 재생성. Phase 44(적/보스 전종) + Phase 45(셰프 5종) 완료. Phase 46에서 metadata.json 일괄 갱신 + cardamom.png 교체 + 렌더링 검증까지 완결 | 완료 |
| 애니메이션 시스템 | walk+death 프레임 시퀀스 아키텍처 (SpriteLoader death 로딩/등록, Enemy _animState 상태 머신, 비동기 death anim). 보스 13종+일반 적 42종 전종 death anim 완료 | 완료 |
| 미력의 정수 코어 | mireukEssence 화폐 세이브 v18, mireuk_traveler 특수 손님 (정수 드롭 1~3), HUD 보유량 표시, VFX 플로팅 텍스트, spendMireukEssence 소비 메서드 | 완료 |
| 유랑 미력사 고용 | 8명 미력사(4등급) 고용/강화(3단계)/해고 시스템, WanderingChefModal(스크롤, 등급 뱃지), ServiceScene 패시브 스킬 적용(인내심/조리시간/특수손님), 세이브 v19 | 완료 |
| 셰프 스킬 재설계 | passiveDesc 3건 교정, 미력사 버프 5종 ServiceScene 실제 로직 연결, 요코 chain_serve 구현, 독립 계수 곱셈 원칙 코드 반영 | 완료 |
| 영업씬 렌더링 재구성 | 테이블 3레이어 분리 렌더링(back/customer/front), 손님 독립 스프라이트(5종x2상태), HUD depth 600+ 상향 | 완료 |
| 쿠폰 코드 시스템 | 설정 메뉴 쿠폰 입력 UI, 일반 쿠폰 3종(프로덕션), DEV 치트 5종(트리쉐이킹), giftIngredients 세이브 v20 | 완료 |
| 메뉴 비주얼 에셋 | MenuScene에 배경 이미지(menu_bg), 타이틀 로고(menu_title_logo), 미미 스프라이트, 앱 아이콘(app_icon_512) 도입. 장식 원 제거, panel dark alpha 0.5 | 완료 |
| 행상인 분기 카드 | 4카테고리(변이/레시피/인연/축복) × 각 8장 = 32장, 매 방문 3장 중 1장 선택(되돌릴 수 없음), 배지 아이콘 4종, 세이브 v24 영구 저장, 변이 tint + Bond 시너지 + Blessing 실효(골드·조리속도·인내심·코인·드롭) + 분기 레시피 1회 한정 주문 풀 편입 | 완료 |

## 콘텐츠 규모

| 항목 | 수량 |
|------|------|
| 적 | 57종 (일반 43 + 미니보스 1 + 보스 13, oni_herald 미니보스 에셋 완료) |
| 도구 | 8종 (pan, salt, grill, delivery, freezer, soup_pot, wasabi_cannon, spice_grinder) |
| 재료 | 32종 |
| 레시피 | 292종 (서빙 231 + 버프 53 + 분기 8) |
| 스테이지 | 143슬롯 (1~24장 전체 구현, placeholder 0개) |
| 셰프 | 7종 Named (미미/린/메이지/유키/라오/앙드레/아르준, 전원 패시브+액티브 스킬) |
| 업적 | 34개 (스토리 10 / 전투 8 / 수집 5 / 경제 5 / 엔드리스 6) |
| 분기 카드 | 32장 (변이 8 / 레시피 8 / 인연 8 / 축복 8) |
| 세이브 버전 | v24 |

## 알려진 제약사항

- EndlessScene이 WaveManager를 MonkeyPatch로 연동 (공식 override API 없음)
- 온라인 랭킹 미구현, 엔드리스 ServiceScene은 1장 기준 config
- removeBuff()가 모든 멀티플라이어를 전역 초기화하므로, 디버프 동시 적용 시 먼저 만료된 디버프가 나머지도 해제할 수 있음 (기존 설계, 향후 멀티 버프 스택 구현 시 개선)
- enemy_charge_impact는 VFX/경고 텍스트만 구현 (Tower HP 시스템 미도입). 타워 내구도 도입 시 별도 페이즈에서 검토
- 신규 생성 metadata.json 8건(macaron_knight, sugar_specter, sushi_ninja, tempura_monk, queen_of_taste, sake_oni, yuki_chef, lao_chef)의 id 필드가 "unknown". 향후 PixelLab 재생성 시 업데이트 필요
- mini_dumpling metadata 92x92 vs 실제 PNG 36x36 불일치 (분열 소환 적 의도적 소형, SpriteLoader 스케일 처리)
- portrait/스프라이트 텍스처가 Phaser에 로드되지 않아 이모지 fallback으로 동작 중 (Vite 경로 매핑 이슈, Phase 56부터 지속)
- portrait 8종이 SDXL 애니메 일러스트로 생성되어 픽셀 UI와 스타일 충돌 → Phase 62-2에서 nearest-neighbor 픽셀화(96px 가상 해상도)로 **단기 해소**. 장기적으로 Phase 64 PixelLab pro 재발주 예정
- 분기 카드 중 일부 변이(chain/cluster/venom/aura_boost)와 Bond(yuki+soup_pot / andre+delivery / mimi+salt / mimi+spice)는 플래그만 저장되고 소비처 로직 미구현 상태 (tint 시각 효과는 정상, 실제 전투 수치 반영은 부분적). 후속 Quick Fix로 보완 예정
- `Enemy.js`의 `enemy_slow` 축복 처리가 `require()` 호출로 작성되어 ESM 환경에서 조용히 실패. `bles_enemy_slow` 카드는 실효 미반영 (후속 수정 필요)
- 분기 레시피 `rewardMultiplier` 및 "반복 등장 N회" 규약은 현재 단순 1회 소비로 통일됨 (카드 descKo의 수치와 실제 동작 불일치, 후속 밸런스 조정 예정)

## 향후 계획

로드맵은 [ROADMAP.md](ROADMAP.md) 참조.

## 개발 이력 (최근)

### Phase 63 — Tile Detail & Minor Polish (2026-04-22)

AD 리포트 M-P2 × 2 + L-P3 × 3 = 5건 해결. 코드 변경만 (에셋 신규 생성 없음).

- **FIX-12 WorldMap 챕터 노드 식별성**: 배경 원 반지름 40 → 46, 아이콘 24×24 → 34×34, 번호 라벨 y+18 → y+22, 별점 y+30 → y+36, 자물쇠/체크 위치 (x+18,y-22) → (x+22,y-26), 히트 영역 44 → 50.
- **FIX-13 GatheringScene 타일 디테일**: 플랫 컬러 다이아몬드 → 체커 패턴 2톤. 경로 셀 0xc8a46e/0xbd9862, 비경로 0x2d5a1b/0x285216.
- **FIX-14 ServiceScene 바닥/테이블 대비**: 홀 배경 0xC8A07A → 0xB08862 (한 단계 어둡게), tileSprite alpha 0.35 → 0.5로 텍스처 디테일 강화.
- **FIX-15 SpriteLoader 폴백 매핑**: `ENEMY_WALK_MISSING` 상수 추가. sugar_fairy.south-east → east, wok_phantom.south-west → west. 콘솔 404 13건 제거. 애니메이션 등록 시 누락 키를 폴백 프레임으로 복제.
- **FIX-16 MenuScene 엔드리스 배너 대비**: 잠김 tint 0x444444 → 0x555555, 라벨 색 #666666 → #888888 (대비 +1 스텝).
- QA 스크린샷: `tests/screenshots/phase63-after/` 4장.
- 콘솔 에러: sugar_fairy/wok_phantom walk 404 13건 → 0건. 나머지 tower/tileset/table 404는 Phase 64+ 별도 스코프.

### Phase 62-2 — Portrait Pixelization (2026-04-22)

AD 리포트 FIX-10: SDXL 애니메 일러스트 포트레이트 8종과 픽셀 UI의 스타일 충돌을 단기 해소.

- `scripts/pixelize_portraits.py` 신규: 512×512 → 96×96 nearest 다운샘플 → 512×512 nearest 업샘플 → 알파 이진화(threshold 128). 96px는 chef_sprite 92px와 유사한 해상도로 매칭도 최상.
- 적용 대상: `portrait_mimi/rin/mage/yuki/lao/andre/arjun/poco.png` (8종).
- 원본은 `assets/portraits/_archive/pre_pixelize_20260422_122945/` 에 백업.
- 코드 변경 없음 (파일명 유지로 SpriteLoader/DialogueScene/ChefSelectScene/MerchantScene 자동 반영).
- 장기 과제로 Phase 64 PixelLab pro 재발주(별도 스펙) 예정.
- QA 스크린샷: `tests/screenshots/phase62-2-after/` 3장.

### Phase 62 — Unified Warm-Tone Pass (2026-04-22)

AD 리포트(`2026-04-22-kc-ad-review.md`) 기반 Quick Fix. 웜톤 갈색 테마와 충돌하는 파란색 튜토리얼 팝업, 어두운 tint 버튼, 저대비 업적 카드 텍스트를 통일. 7개 파일, 9개 이슈 해결.

- **FIX-01/02**: `TutorialManager.js` 파란색 Rectangle(0x0000aa) → `NineSliceFactory.panel('dark')` 로 교체. Gathering/Service/Shop/Endless 4종 튜토리얼 팝업이 동시에 갈색화. PANEL_H 60→68, 스킵 버튼 stroke 추가.
- **FIX-03**: `setTint(0x444444)` → `0x888888` (hover `0x666666` → `0xaaaaaa`) 업그레이드. 뒤로가기/취소/스킵 버튼 가독성 복구. 적용 파일: WorldMapScene, ChefSelectScene, AchievementScene, MerchantScene. (의도적 disabled 상태인 locked endless 표시와 inactive 탭 배경은 유지)
- **FIX-04**: AchievementScene 설명 텍스트 `#999999` → 카드 상태별 분기(`#c8e6c8`/`#ffe0a8`/`#d8d8d8`) + stroke. 진행률 바 수치도 bold + stroke.
- **FIX-05**: MerchantScene 도구 카드 우측 녹색 사각형 → Ⓘ (U+24D8) 웜톤 정보 아이콘(0x886644, `#ffd56a`). 크기 20×20 → 24×24.
- **FIX-07**: MenuScene 타이틀 로고 최대 폭 320 → 296 (0.925배 축소) 로 후광 번짐 완화.
- **FIX-09**: RecipeCollectionScene 서브카피 `#aaaaaa` → `#e8d8a8` + stroke로 제목과 시각적 정렬 강화.
- QA 스크린샷: `tests/screenshots/phase62-after/` (6장) — 모든 변경 씬 Playwright 360x640 검증.
