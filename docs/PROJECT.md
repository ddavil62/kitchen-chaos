# Kitchen Chaos Tycoon 기획서

> 최종 업데이트: 2026-04-23 (Phase 73 세이브 백업 + 포트레이트 정합 완료)

## 프로젝트 개요

모바일 타워 디펜스 + 레스토랑 타이쿤 하이브리드 게임(구 Kitchen Chaos Defense). 영구 도구를 배치해 적을 처치하고 재료를 채집하는(재료 채집 페이즈) → 재료로 손님에게 요리를 서빙하여 골드를 획득하는(영업 페이즈) → 골드로 도구를 구매/업그레이드하거나 되돌릴 수 없는 로그라이크 분기 카드 3장 중 1장을 선택하는(행상인) 3단계 루프 구조. Phaser.js 3 기반 웹 게임, Android 우선 배포.

세계관/스토리/캐릭터 상세: [STORY.md](STORY.md) 참조.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 엔진 | Phaser.js 3 |
| 언어 | JavaScript (바닐라) |
| 아트 | PixelLab API + SD Forge SDXL (픽셀 아트, 메뉴 비주얼) |
| 폰트 | NeoDunggeunmoPro (로컬 번들 woff2 + CDN fallback, SIL OFL 1.1) |
| 사운드 | Web Audio API (프로시저럴) |
| 빌드 | Vite + Capacitor (Android) |
| 테스트 | Playwright |

## 아키텍처

### 핵심 모듈

| 모듈 | 파일 | 역할 |
|------|------|------|
| 재료 채집 | GatheringScene.js | 도구 배치/회수/재배치, 적 AI, 재료 드롭, 보스 재료 드롭, 웨이브 진행 |
| 도구 관리 | ToolManager.js | 영구 도구 인벤토리 (구매/판매/업그레이드/스탯 조회/자동 지급) |
| 행상인 | MerchantScene.js | 2탭 UI (도구 구매/분기 선택), 도구 구매·판매·업그레이드 + 되돌릴 수 없는 3택 1 분기 카드, 분기 탭 피드백(tint 플래시/출발 disabled/descKo 모달) |
| 분기 효과 | BranchEffects.js + merchantBranchData.js | 분기 카드 32장 정의(mutation/recipe/bond/blessing × 8), 게임플레이 씬에서 배수·시너지·tint 조회하는 경량 어댑터 |
| 월드맵 | WorldMapScene.js | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률 HUD |
| 엔드리스 | EndlessScene.js + EndlessWaveGenerator.js + EndlessMissionManager.js | 무한 웨이브 TD, 5웨이브마다 영업+행상인 삽입, 미력 폭풍 이벤트, 정화 임무 4종, 통계 트래킹(폭풍/임무/무결) |
| 영업 코어 | ServiceScene.js | 손님 입장/주문/조리/서빙/팁, 골드→영구 저장, 아이소메트릭 홀 (3레이어 분리 렌더링+depth sorting+홀 데코), 챕터별 홀 배경 (바닥 8종 tileSprite+뒷벽 8종), 엔드리스 웨이브 구간별 배경 테마 전환, 웜 다크 통합 팔레트, 픽셀아트 렌더링 (fallback 지원) |
| 결과 | ResultScene.js | 캠페인 별점/엔드리스 기록 표시, 행상인 방문 연결, modal lock (DialogueScene 오버레이 시 버튼 비활성), isCleared 복합 조건 |
| 대화 시스템 | DialogueManager.js + DialogueScene.js + dialogueData.js | 대화 스크립트 119종 재생, 선택지 분기 UI, 픽셀아트 초상화 렌더링, 시청 기록 |
| 스토리 시스템 | StoryManager.js + storyData.js | 트리거 중앙 디스패처(triggerPoint 8종), 120항목, 챕터 진행도, 스토리 플래그(객체), onComplete 콜백, 씬 1줄 호출 |
| 세이브 | SaveManager.js | localStorage, 마이그레이션 체인 v1~v24, 3슬롯 롤링 백업(backup_1~3) + getBackups/restoreBackup API, season3Unlocked, getTotalStars(group), achievements, mireukEssence/wanderingChefs/giftIngredients/endless통계/branchCards 헬퍼, `_currentRun` 인메모리 단일 소스 (씬 간 stageId 전달) |
| 쿠폰 | CouponRegistry.js | 쿠폰 레지스트리, redeemCoupon() API, 일반 3종+DEV 치트 5종, 사용 이력 localStorage 관리 |
| 사운드 | SoundManager.js | 프로시저럴 SFX 20종 + BGM 5종 |
| VFX | VFXManager.js | Canvas2D 파티클, 스크린 플래시/셰이크, 플로팅 텍스트, 범용 floatingText |
| 적 | Enemy.js | 적 AI, 메커닉(dodge/charge/thorns/taunt/summon/split/magic resistance 등), 주기적 소환, _animState 상태 머신(IDLE/WALKING/DYING) |
| 업적 | AchievementManager.js + achievementData.js + AchievementScene.js | 34개 업적, 해금 판정/보상(골드/코인/정수), 카테고리 탭 UI |
| 스프라이트 | SpriteLoader.js | walk/death 프레임 시퀀스 로딩 (적+보스+미니보스), Phaser anim 등록, 방향 폴백 매핑, 챕터별 홀 바닥·뒷벽 에셋 로드, 테이블 front/back+손님 waiting/seated(lv0~lv4) 에셋 로드, 타일셋 15종+타워 8종 preload, portrait 9종 (arjun 포함) |
| 메인 메뉴 | MenuScene.js | 배경 이미지(menu_bg) + 타이틀 로고(menu_title_logo) + 미미 스프라이트 + 버튼 5종 + 설정/쿠폰/세이브 복구 |
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
| 튜토리얼 개선 | 영업/상점/엔드리스 안내, 1-1~1-3 자동 도구 지급, 개별 플래그 | 완료 |
| UI/UX 폴리시 | 씬 전환, 버튼 스타일, 터치 피드백 통일 | 완료 |
| 성능 최적화 | 오브젝트 풀링, 불필요 렌더링 제거, 메모리 관리 | 완료 |
| 출시 준비 | 버전 표기(APP_VERSION), 전역 에러 핸들러, localStorage 용량 체크 | 완료 |
| 도구/행상인/채집 | 영구 도구 8종, 구매/판매/업그레이드, 행상인 UI, 재료 채집 TD, 도구 도감/팝업 | 완료 |
| 대화/스토리 | 스크립트 119종, 트리거 120항목, 선택지 분기, 초상화 9종, 15캐릭터, 시나리오 일관성 검증+개그씬 확장 완료 | 완료 |
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
| 행상인 분기 카드 | 4카테고리(변이/레시피/인연/축복) × 각 8장 = 32장, 매 방문 3장 중 1장 선택(되돌릴 수 없음), 배지 아이콘 4종, 세이브 v24 영구 저장, 변이 8종 전수 실효(tint+전투 수치) + Bond 8쌍 시너지 + Blessing 실효(골드·조리속도·인내심·코인·드롭·적 둔화) + 분기 레시피 반복 등장(chaos_ramen 3회/spice_bomb 2회) | 완료 |
| 세이브 백업 | 3슬롯 롤링 백업(backup_1~3), 설정 패널 복구 버튼 + 백업 목록 모달 + 확인 모달, quota 초과 시 메인 저장 보호 | 완료 |

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
- portrait/스프라이트 텍스처가 Phaser에 로드되지 않아 이모지 fallback으로 동작 중 (Vite 경로 매핑 이슈, Phase 56부터 지속). 단, 타일셋/테이블/타워 에셋 404는 Phase 71에서 전수 해결 완료
- `assets/sprites/towers/` 하위에 원본 32x32 타워 파일이 잔존 (SpriteLoader가 `assets/towers/` 경로만 참조하므로 기능 영향 없음, 디스크 정리 권장)
- 타일셋 15종을 BootScene에서 전부 preload하나 GatheringScene에서 맵 렌더링에 사용하지 않음 (프로그래매틱 체커 패턴 사용). 향후 타일셋 기반 테마별 맵 렌더링 전환 시 활용 가능
- ~~portrait 8종이 SDXL 애니메 일러스트로 생성되어 픽셀 UI와 스타일 충돌~~ → **Phase 64에서 PixelLab 네이티브 128px 반신 포트레이트로 교체 완료 (2026-04-22)**
- ~~분기 카드 변이/Bond 미구현~~ → **Phase 72에서 변이 4종(chain/cluster/venom/aura_boost) + Bond 4쌍 전수 실효 구현 완료 (2026-04-23)**
- ~~enemy_slow ESM import 버그~~ → **Phase 72 회귀 검증 결과 기존 코드 정상 동작 확인 (2026-04-23)**
- ~~분기 레시피 반복 규약 불일치~~ → **Phase 72에서 chaos_ramen 3회/spice_bomb 2회 카운트 감산 구현 완료 (2026-04-23)**
- ~~assets/portraits/에 candidates/(31파일) + _archive/(89파일) 미사용 SDXL 후보군/아카이브 잔존~~ → **Phase 73에서 전수 삭제, 정식 8종만 유지 (2026-04-23)**
- mimi+salt Bond가 salt 변이 없이 단독 사용 시 미작동 (Phase 58-3 pre-existing 구조 결함: `_applyMutationToTower()`에서 변이 없으면 `_applyBondToTower()` 호출이 차단됨). 다른 3쌍 Bond는 BranchEffects API 직접 조회라 영향 없음. 후속 페이즈에서 수정 권장

## 향후 계획

로드맵은 [ROADMAP.md](ROADMAP.md) 참조.

## 개발 이력 (최근)

### Phase 73 — 세이브 백업 + 포트레이트 정합 (2026-04-23)

P2-1, P2-3 해결. SaveManager에 3슬롯 롤링 백업(backup_1~3) + getBackups/restoreBackup API 추가. MenuScene 설정 패널에 복구 버튼 + 백업 목록 모달 + 확인 모달 구현. assets/portraits/ 전수 점검: candidates/(31파일) + _archive/(89파일) 삭제, 정식 8종만 유지.

- 수정 파일: SaveManager.js (+88), MenuScene.js (+242/-4)
- 삭제: assets/portraits/candidates/ (31파일), assets/portraits/_archive/ (89파일)
- 신규 테스트: phase73-save-backup.spec.js (13건), phase73-portrait-integrity.spec.js (4건), phase73-qa.spec.js (22건)
- QA: Playwright 130/130 PASS (Phase 73 39 + Phase 70~72 회귀 91), 콘솔 에러 0건
- 스펙: `.claude/specs/2026-04-23-kc-phase73-spec.md`

### Phase 72 — 분기 카드 수치 전수 반영 (2026-04-23)

P2-2 해결: "로그라이크 카드의 약속 이행". 변이 4종(chain/cluster/venom/aura_boost) 실효 구현, Bond 4쌍(yuki+soup_pot/andre+delivery/mimi+salt/mimi+spice) 시너지 구현, enemy_slow 축복 회귀 확인(정상 동작), 레시피 반복 규약(chaos_ramen 3회/spice_bomb 2회) 구현.

- 수정 파일: Projectile.js, Tower.js, GatheringScene.js, ServiceScene.js, IngredientManager.js, SaveManager.js, merchantBranchData.js
- 신규 테스트: phase72-branch-effects.spec.js (16건), phase72-qa-edge.spec.js (16건), phase72-qa-bond-bug.spec.js (2건)
- QA: Playwright 91/91 PASS (Phase 72 34 + Phase 70 회귀 28 + Phase 71 회귀 29), 콘솔 에러 0건
- 스펙: `.claude/specs/2026-04-23-kc-phase72-spec.md`

### Phase 71 — 체커 패턴 복구 + 에셋 404 전수 수리 (2026-04-23)

P1-6, P2-8 해결. GatheringScene 체커 depth+색상 대비 강화, 타일셋 3종+테이블 8종+타워 2종 신규/수정.

- QA: Playwright 62/62 PASS, AD 모드2/3 APPROVED
- 스펙: `.claude/specs/2026-04-22-kc-phase71-spec.md`

### Phase 70 — 초반 튜토리얼 안전장치 + 분기 카드 피드백 강화 (2026-04-22)

P1-1, P1-3 해결. ToolManager.grantTool() + 1-1~1-3 자동 도구 지급, MerchantScene 분기 탭 UX 개선.

- QA: Playwright 28/28 PASS, AD 모드3 APPROVED
- 스펙: `.claude/specs/2026-04-22-kc-phase70-spec.md`

### Phase 68 — P0 판정/레이어/씬 상태 전달 핫픽스 (2026-04-22)

P0-2~4 해결. isCleared 복합 조건, modal lock, _currentRun 인메모리 단일 소스.

- QA: Playwright 40/40 PASS, AD 모드3 APPROVED

이전 이력은 [CHANGELOG.md](CHANGELOG.md) 참조.
