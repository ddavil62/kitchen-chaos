# Kitchen Chaos Tycoon — 장기 로드맵

> 최종 업데이트: 2026-04-12
> 기준: Phase 20 완료

---

## 현재 완료 상태

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 코어 TD 루프 (적, 타워, 웨이브, 재료 드롭) | ✅ 완료 |
| Phase 2 | 듀얼 씬 아키텍처, 주문-요리-서빙 경제 | ✅ 완료 |
| Phase 3 | 아이소메트릭 그리드, 5적/4타워/5재료/12레시피/8웨이브 | ✅ 완료 |
| Phase 4 | 밸런스, 튜토리얼, 스테이지 1-1~1-3, 세이브, 6적/6타워 | ✅ 완료 |
| Phase 5 | 주방 코인, 영구 업그레이드 4종, 레시피 24종, 상점, 도감, 1-4~1-6, 보스 | ✅ 완료 |
| Phase 6 | 셰프 3종, 오더 시스템, 생선/버섯/치즈, 2장 3스테이지, 레시피 42종 | ✅ 완료 |
| Phase 7 | 게임 루프 리디자인 (MarketScene + ServiceScene + ResultScene) | ✅ 완료 |
| Phase 8 | 영업 심화 (테이블/인테리어/직원/특수손님/이벤트/셰프스킬), 새우/토마토/버터, 3장 6스테이지, 레시피 66종 | ✅ 완료 |
| Phase 9 | 설탕/우유, 4장 화산 BBQ, 레시피 89종, PixelLab 픽셀아트 에셋, SpriteLoader | ✅ 완료 |
| Phase 10 | 5장+6장 캠페인 30스테이지 완성, 레시피 106종, SoundManager, VFXManager, 설정 UI | ✅ 완료 |
| Phase 11 | 엔드리스 모드, 월드맵, 튜토리얼, UI/UX 폴리시, 성능 최적화, 출시 준비 | ✅ 완료 |
| Phase 12 | 리네이밍 (Kitchen Chaos Defense → Kitchen Chaos Tycoon) | ✅ 완료 |
| Phase 13 | 도구 시스템 리워크, 행상인 씬, 재료 채집, 엔드리스 적용 | ✅ 완료 |
| Phase 14-1 | 대화 엔진 (DialogueManager + DialogueScene + dialogueData) | ✅ 완료 |
| Phase 14-2 | 대화 콘텐츠 (초상화 4종 + 스크립트 13종 + 4씬 트리거 연결) | ✅ 완료 |
| Phase 14-3 | StoryManager 트리거 중앙화, 챕터 진행도 추적, 세이브 v11 | ✅ 완료 |
| Phase 15 | 챕터 2~6 스토리 콘텐츠 (대화 스크립트 26종, 트리거 24종) | ✅ 완료 |
| Phase 16 | 인게임 대화 통합 (튜토리얼/이벤트 연동, 선택지 분기, 스크립트 32종) | ✅ 완료 |
| Phase 17 | 밸런스 QA (수치 시뮬레이션, 병목 탐지, 조정) | ✅ 완료 |
| Phase 18 | 레거시 정리 + 기술 부채 | ✅ 완료 |
| Phase 19 | 시즌 2 기반 인프라 (월드맵 확장, 신규 캐릭터, 세이브) | ✅ 완료 |
| Phase 20 | 7장 — 사쿠라 이자카야 (일식) | ✅ 완료 |
| Phase 21 | 8장 — 용의 주방 (중식) | 📋 계획 |
| Phase 22 | 9장 — 별빛 비스트로 (양식) | 📋 계획 |
| Phase 23 | 10장 — 향신료 궁전 (인도) | 📋 계획 |
| Phase 24 | 11장 — 선인장 칸티나 (멕시칸) | 📋 계획 |
| Phase 25 | 12장 — 슈가 드림랜드 (디저트 월드, 시즌 2 최종) | 📋 계획 |
| Phase 26 | 시즌 2 밸런스 QA + 스토리 종합 | 📋 계획 |
| Phase 27 | 업적 시스템 (30~50개, 보상, 업적 UI) | 📋 계획 |
| Phase 28 | 아트 리워크 — Phase 1~19 레거시 스프라이트 64px 재생성 | 🎨 예정 |

**현재 구현 완성도**: 시즌 1 완성, Phase 20 완료 (시즌2 7장 콘텐츠 -- 적 3종+재료 2종+레시피 10종+스토리 4종+은신/배리어/취권/아우라 메커닉+PixelLab 에셋)

### 현재 콘텐츠 규모

| 항목 | 수량 |
|------|------|
| 적 종류 | 25종 (일반 18 + 보스 7) |
| 도구 종류 | 8종 (pan, salt, grill, delivery, freezer, soup_pot, wasabi_cannon, spice_grinder) — 영구 보유, 업그레이드 3단계 |
| 재료 종류 | 17종 (당근, 고기, 문어, 고추, 밀가루, 달걀, 쌀, 생선, 버섯, 치즈, 새우, 토마토, 버터, 설탕, 우유, 참치, 와사비) |
| 레시피 | 116종 (서빙 94 + 버프 22) |
| 스테이지 | 66개 (시즌1: 30개 + 시즌2: 36개) |
| 셰프 | 5종 (꼬마/불꽃/얼음/유키/라오) — 패시브 + 액티브 스킬 (유키/라오는 데이터만 등록, 스킬 로직 미구현) |
| 영구 업그레이드 | 4종 |
| 테이블 | 4~8석 (5단계 업그레이드) |
| 인테리어 | 3종 × 5단계 |
| 직원 | 2종 (서빙/세척 도우미, IAP 추상화) |
| 사운드 | SFX 20종 + BGM 5종 (Web Audio API 프로시저럴) |
| VFX | 파티클 + 스크린 효과 + 플로팅 텍스트 (Canvas2D) |
| 대화 스크립트 | 39종 |
| 스토리 트리거 | 38항목 (triggerPoint 8종) |
| 세이브 버전 | v13 |

### 게임 루프

```
메뉴 → 월드맵 → 셰프 선택 → GatheringScene(재료 채집) → ServiceScene(영업) → ResultScene → MerchantScene(행상인) → 월드맵
메뉴 → 월드맵 → 엔드리스 → 셰프 선택 → EndlessScene(TD) ↔ ServiceScene(영업) → MerchantScene(행상인) → EndlessScene(계속) → ... → ResultScene(게임오버)
```

---

## 레시피 컬렉션 현황

게임 목표: **106종 레시피 컬렉션** (Phase 10 완성).

### 재료 확장 이력

| Phase | 추가 재료 | 누적 | 함께 추가된 적 | 상태 |
|-------|----------|------|---------------|------|
| Phase 5 | 달걀(🥚), 쌀(🍚) | 7종 | egg_sprite, rice_slime, pasta_boss | ✅ |
| Phase 6 | 생선(🐟), 버섯(🍄), 치즈(🧀) | 10종 | fish_knight, mushroom_scout, cheese_rat | ✅ |
| Phase 8 | 새우(🦐), 토마토(🍅), 버터(🧈) | 13종 | shrimp_samurai, tomato_bomber, butter_ghost, seafood_kraken | ✅ |
| Phase 9 | 설탕(🍬), 우유(🥛) | 15종 | sugar_fairy, milk_phantom, lava_dessert_golem | ✅ |
| Phase 20 | 참치(🍣 sashimi_tuna), 와사비(🌿 wasabi) | 17종 | sushi_ninja, tempura_monk, sake_oni | ✅ |

### 레시피 확장 이력

| Phase | 신규 서빙 | 신규 버프 | 누적 | 비고 | 상태 |
|-------|----------|----------|------|------|------|
| Phase 5 | 10 | 2 | 24 | 스타터 12 + 달걀/쌀 조합 | ✅ |
| Phase 6 | +15 | +3 | 42 | 생선/버섯/치즈 조합 | ✅ |
| Phase 8 | +20 | +4 | 66 | 새우/토마토/버터, 3재료 레시피 | ✅ |
| Phase 9 | +20 | +3 | 89 | 설탕/우유, 디저트 카테고리 대량 | ✅ |
| Phase 10 | +15 | +2 | 106 | 특선/전설 등급 집중 | ✅ |
| Phase 20 | +8 | +2 | 116 | 참치/와사비 일식 조합, 사쿠라 가이세키 | ✅ |

### 등급 분포 (현재)

| 등급 | 해금 비용 | 서빙 보상 | 수량 |
|------|----------|----------|------|
| ★ 일반 | 10~20 코인 | 15~30g | ~30종 |
| ★★ 고급 | 25~45 코인 | 35~55g | ~30종 |
| ★★★ 희귀 | 55~85 코인 | 60~85g | ~25종 |
| ★★★★ 특선 | 100~160 코인 | 90~130g | ~10종 |
| ★★★★★ 전설 | 220~350 코인 | 150~220g | ~5종 |

---

## ✅ Phase 6 — 콘텐츠 확장 + 셰프 캐릭터 (완료)

> 목표: 재료 풀 확장, 레시피 42종 달성, 셰프 시스템으로 전략 다양성 확보

### 6-1. 신규 재료/적 + 캠페인 확장

- [x] 재료 3종 추가: 생선(🐟), 버섯(🍄), 치즈(🧀)
- [x] 적 3종 추가: fish_knight, mushroom_scout, cheese_rat
- [x] 스테이지 2-1 ~ 2-3 추가 (2장: 동양 요리 식당 테마)
- [x] 2장 보스 적 1종 (sushi_shogun)

### 6-2. 레시피 확장 (+18종)

- [x] 서빙 +16종
- [x] 버프 +2종
- [x] 누적 42종

### 6-3. 셰프 캐릭터 시스템

- [x] 3종 셰프 캐릭터 (선택 UI)
  - 꼬마 셰프: 재료 수거 범위 +30%, 조리시간 -15%
  - 불꽃 요리사: 화염 타워 +20%, 구이 보상 +25%
  - 얼음 요리장: CC +25%, 인내심 +20%
- [x] 셰프 선택 씬 (ChefSelectScene)
- [x] 패시브 효과 게임 내 반영
- [x] 스킬 버튼 UI + 쿨다운

### 6-4. 오더 시스템

- [x] 특정 웨이브에 조건부 미션
- [x] 오더 UI (웨이브 시작 시 팝업)
- [x] 오더 보상 (추가 골드/코인)

---

## ✅ Phase 7 — 게임 루프 리디자인 (완료)

> 목표: 단일 GameScene → MarketScene(TD) + ServiceScene(타이쿤) + ResultScene 3단계 루프

### 7-1. MarketScene (장보기 = TD)

- [x] 기존 GameScene 리팩토링 → 장보기 씬
- [x] 적 처치 → 재료 수집 → 인벤토리에 저장
- [x] 전 웨이브 클리어 or 라이프 0 → ServiceScene으로 전환

### 7-2. ServiceScene (영업 타이쿤)

- [x] 레스토랑 영업 씬 신규 구현
- [x] 손님 입장 → 주문 → 조리 → 서빙 → 골드 획득
- [x] 테이블 4석, 조리 슬롯 2개, 재료 재고, 레시피 퀵슬롯
- [x] 만족도, 콤보 시스템

### 7-3. ResultScene (결과)

- [x] 장보기 + 영업 통합 결과 표시
- [x] 별점 시스템 (1~3성)
- [x] 보상 지급, 스테이지 해금

---

## ✅ Phase 8 — 영업 모드 심화 + 콘텐츠 확장 (완료)

> 목표: ServiceScene을 본격적인 레스토랑 타이쿤으로 강화 + 신규 재료/적/레시피

### 8-1. 신규 재료/적 + 3장 캠페인

- [x] 재료 3종: 새우(🦐), 토마토(🍅), 버터(🧈) — 누적 13종
- [x] 적 3종: shrimp_samurai, tomato_bomber, butter_ghost
- [x] 보스: seafood_kraken (HP 4000, 촉수 소환, 먹물 디버프)
- [x] 스테이지 3-1 ~ 3-6 (3장: 바닷가 씨푸드 바) — 누적 15스테이지

### 8-2. 레시피 확장 (+24종)

- [x] 서빙 +20종 (★~★★★★★)
- [x] 버프 +4종 (durationUnit 필드 추가)
- [x] 누적 66종 (서빙 51 + 버프 15)

### 8-3. 테이블 5단계 + 4→8석 + 인테리어 5단계

- [x] 테이블 개별 5단계 업그레이드 (팁 배율, 인내심 보너스, 비주얼)
- [x] 테이블 4→8석 확장 (동적 레이아웃)
- [x] 인테리어 3종 × 5단계 (꽃병/오픈키친/고급조명)
- [x] 상점 5탭 (업그레이드/레시피/테이블/인테리어/직원)

### 8-4. 직원 시스템

- [x] 서빙 도우미 (자동 서빙 3초 딜레이, 150코인)
- [x] 세척 도우미 (세척 대기시간 제거, 120코인)
- [x] IAP 추상화 (purchaseType: 'coin' | 'iap')
- [x] 세이브 v4→v5 마이그레이션

### 8-5. 특수 손님 + 영업 이벤트

- [x] 특수 손님 5종 (일반/VIP/미식가/급한/단체)
- [x] 단체 손님: 2석 점유, 공유 인내심, 부분 서빙
- [x] 영업 이벤트 4종 (해피아워/비오는날/맛집리뷰/주방사고)

### 8-6. 셰프 영업 액티브 스킬

- [x] 꼬마 셰프: 특급 서비스 (다음 3명 인내심 리셋, 90초 CD)
- [x] 불꽃 요리사: 화염 조리 (모든 요리 즉시 완성, 120초 CD)
- [x] 얼음 요리장: 시간 동결 (인내심 10초 정지, 150초 CD)
- [x] 하단 바 스킬 버튼 + 쿨다운 시각 표시

---

## ✅ Phase 9 — 콘텐츠 확장 3 + 픽셀 아트 (완료)

> 목표: 재료 15종 완성, 레시피 89종, 도형→픽셀 아트 교체

### 9-1. 신규 재료/적 + 캠페인 확장

- [x] 재료 2종 추가: 설탕(🍬), 우유(🥛) — 누적 15종
- [x] 적 2종 추가: sugar_fairy, milk_phantom
- [x] 스테이지 4-1 ~ 4-6 (4장: 화산 BBQ) — 누적 21스테이지
- [x] 4장 보스: lava_dessert_golem (HP 5000, 용암 장판, 디저트 소환)

### 9-2. 레시피 확장 (+23종)

- [x] 서빙 +20종 (디저트 카테고리 대량 투입 — 설탕+우유 조합)
- [x] 버프 +3종
- [x] 누적 89종

### 9-3. 캐릭터 에셋 (PixelLab)

- [x] 적 16종 스프라이트 (32px, 8방향, walk 애니메이션)
- [x] 보스 4종 스프라이트 (48px, 8방향, walk 애니메이션)
- [x] 타워 6종 (도구/장비 스타일 map_object)
- [x] 셰프 3종 (48px, 8방향)
- [x] 재료 아이콘 15종 (32px)

### 9-4. 환경 에셋 + 스프라이트 로더

- [x] 아이소메트릭 타일셋 4종 (파스타/동양/씨푸드/화산)
- [x] SpriteLoader 통합 로더 (적/보스/타워/셰프/재료/타일셋)
- [x] 기존 도형 렌더링 → 픽셀 스프라이트 교체

---

## ✅ Phase 10 — 캠페인 완성 + 사운드/VFX (완료)

> 목표: 30스테이지 완성, 레시피 106종, 사운드/VFX 추가

### 10-1. 캠페인 완성

- [x] 스테이지 5-1 ~ 5-6 (5장: 마법사 디저트 카페) — 누적 27스테이지
- [x] 스테이지 6-1 ~ 6-3 (6장: 그랑 가스트로노미) — 누적 30스테이지
- [x] 최종 보스 cuisine_god (HP 8000, 3페이즈 전투)
- [x] 5장 보스 master_patissier (HP 6000, 케이크화 디버프)

### 10-2. 레시피 확장 (+17종)

- [x] 서빙 +15종 (★★~★★★★★)
- [x] 버프 +2종 (wizard_blessing, final_awakening)
- [x] ★★★★★ 전설 레시피 5종 완성 (4~5재료, 보상 150~220)
- [x] 누적 106종 (서빙 86 + 버프 20)

### 10-3. 보스 스프라이트

- [x] master_patissier (48px, pro, 8방향 walk)
- [x] cuisine_god (64px, pro, 8방향 walk)
- [x] SpriteLoader 보스 6종, 타일셋 6종 확장

### 10-4. SoundManager

- [x] Web Audio API 프로시저럴 SFX 20종 (톤/노이즈/시퀀스)
- [x] BGM 5종 (메뉴/전투/보스/영업/결과)
- [x] GameEventBus 자동 트리거, 타워별 사격 SFX
- [x] 모바일 AudioContext.resume() 지원

### 10-5. VFXManager

- [x] Canvas2D 호환 파티클 효과 (Phaser Graphics + Tweens)
- [x] 스크린 플래시/셰이크
- [x] 플로팅 텍스트 (골드/콤보/웨이브/보스/클리어/고객 이모지)

### 10-6. 사운드 설정 UI

- [x] MenuScene 기어(⚙) 버튼 + 설정 패널
- [x] BGM/SFX 볼륨 슬라이더, 전체 음소거 토글
- [x] 세이브 v5→v6 마이그레이션 (soundSettings)

---

## ✅ Phase 11 — 엔드리스 + 월드맵 + 폴리시 (완료)

> 목표: 엔드리스 모드로 리플레이성 확보, 월드맵 UI, 최종 폴리시
> 상세 기획서: `.claude/specs/2026-04-09-kitchen-chaos-phase11-scope.md`

### ✅ 11-1. 엔드리스 모드 (완료)

- [x] EndlessScene (MarketScene 상속) + EndlessWaveGenerator
- [x] 무한 웨이브 시스템 (HP +12%/wave, 속도 +2%/wave, 10wave마다 보스)
- [x] "오늘의 스페셜 레시피" (데일리 시드 기반 랜덤 3종, 보상 ×2)
- [x] 5웨이브 단위 영업 삽입 (TD→영업→TD 반복)
- [x] 로컬 랭킹 (최고 웨이브, 최고 점수, 최고 콤보)
- [x] 세이브 v6→v7 마이그레이션 (endless 기록)
- [x] 6-3 클리어 시 해금, MenuScene 엔드리스 버튼
- [x] ChefSelectScene stageId='endless' 분기
- [x] ResultScene 엔드리스 결과 화면 (신기록 하이라이트)

### ✅ 11-2. 스테이지 월드맵 (완료)

- [x] WorldMapScene (StageSelectScene 교체)
- [x] 6개 레스토랑 노드 (테마 색상, 잠금/진행중/올클리어 상태)
- [x] 노드 터치 → 스테이지 리스트 슬라이드업 패널
- [x] 진행률 HUD (총 별점, 레시피 수집률)
- [x] 엔드리스 베스트 기록 표시

### ✅ 11-3. 최종 폴리시 (완료)

- [x] 튜토리얼 개선 (영업/상점/엔드리스 안내, 개별 플래그, 세이브 v8)
- [x] UI/UX 통합 점검 (씬 전환 fadeIn/fadeOut 300ms, 버튼 스타일 통일, 터치 피드백)
- [x] 성능 최적화 (오브젝트 풀링, 화면 밖 적 스킵, Tween/Timer 정리)
- [x] 출시 준비 (APP_VERSION 상수, 버전 표기, 전역 에러 핸들러, localStorage 용량 체크)

**구현 단위**: ~~11-1~~ → ~~11-2~~ → ~~11-3a(튜토리얼)~~ → ~~11-3b(UI/UX)~~ → ~~11-3c(성능)~~ → ~~11-3d(출시)~~

---

## ✅ Phase 12 — 리네이밍 (완료)

> 목표: "Kitchen Chaos Defense" → "Kitchen Chaos Tycoon" 전면 리브랜딩

- [x] 게임 타이틀, UI 텍스트, 코드 주석/JSDoc 전면 교체
- [x] GitHub 레포명 변경 (kitchen-chaos → kitchen-chaos-tycoon)
- [x] package.json, Capacitor 설정, HTML title 갱신
- [x] 세이브 키 변경 (kitchenChaos_save → kitchenChaosTycoon_save)
- [x] 루트 레포 문서 (CLAUDE.md, docs/) 참조 갱신

---

## ✅ Phase 13 — 도구 시스템 리워크 (완료)

> 목표: 핵심 경제 루프 분리 — 재료 채집(TD)에서 골드 제거, 타워를 영구 도구로 전환, 행상인 씬 추가
> 상세 기획서: `.claude/specs/2026-04-10-kitchen-chaos-phase13-scope.md`

### 핵심 변경

- 장보기 → "재료 채집" 리브랜딩 (MarketScene → GatheringScene)
- 타워 → 영구 도구 (영업 골드로 구매/업그레이드, 스테이지 간 유지)
- 재료 채집에서 골드 보상 완전 제거 (웨이브 보너스, 보스 골드 삭제)
- 보스 처치 → 희귀 재료 대량 드롭
- 행상인 씬 (MerchantScene): 영업 종료 후 방문, 도구 구매/판매/업그레이드
- 도구 자유 재배치 (배치된 도구를 전투 중 이동 가능, 탭-탭 방식)

### ✅ 13-1. 도구 데이터 + ToolManager + 세이브 v9 (완료)

- [x] gameData.js에 TOOL_DEFS 6종 추가 (pan, salt, grill, delivery, freezer, soup_pot)
- [x] ToolManager.js 신규 (static 메서드: 구매/판매/업그레이드/스탯 조회)
- [x] SaveManager v8→v9 마이그레이션 (gold, tools, tutorialMerchant 필드)
- [x] 스타터 키트: 프라이팬 2개 (Lv1)

### ✅ 13-2. 행상인 씬 (완료)

- [x] MerchantScene.js 신규 (360x640 레이아웃, 도구 구매/판매/업그레이드 UI)
- [x] 도구 목록 스크롤, 스탯 프리뷰, 도구 요약 바
- [x] 모든 도구 판매 시 경고 팝업
- [x] ResultScene에 "행상인 방문" 버튼 추가
- [x] ServiceScene에서 영업 종료 시 영구 골드 누적 (ToolManager.addGold)
- [x] main.js에 MerchantScene 등록

### ✅ 13-3. 재료 채집 씬 리워크 (완료)

- [x] GatheringScene.js 신규 (MarketScene 기반, 골드 시스템 완전 제거)
- [x] 도구 배치/회수/재배치 (탭-탭 방식, 노란 테두리, 회수 버튼)
- [x] 보스 처치 → 재료 드롭 (bossDrops, 보스 6종)
- [x] HUD: 골드 표시 → 도구 수량 (배치/보유)
- [x] ChefSelectScene 전환 대상 → GatheringScene
- [x] Enemy.js bossDrops 이벤트 전달

### ✅ 13-4. 엔드리스 적용 + 밸런싱 (완료)

- [x] EndlessScene 상속: MarketScene → GatheringScene
- [x] 엔드리스 골드 시스템 완전 제거 (WAVE_CLEAR_BONUS, gold 복원/전달 제거)
- [x] 엔드리스 루프에 행상인 삽입 (ServiceScene → MerchantScene → EndlessScene)
- [x] config.js STARTING_GOLD/WAVE_CLEAR_BONUS 하위 호환 주석 추가

**구현 순서**: ~~13-1~~ → ~~13-2~~ → ~~13-3~~ → ~~13-4~~

---

## ✅ Phase 14-1 — 대화 엔진 (완료)

> 목표: 대화 시스템 기반 인프라 구축 (스크립트 데이터 + 매니저 + 오버레이 씬)

### 핵심 변경

- DialogueManager: 대화 재생 제어 (start/hasSeen/markSeen/getScript/resetAll)
- DialogueScene: 오버레이 씬, 하단 180px 패널, 타이핑 애니메이션(30ms/글자), 건너뛰기 버튼
- dialogueData.js: 3개 샘플 스크립트 + CHARACTERS 캐릭터 정의
- SaveManager v9→v10: seenDialogues 필드 추가

### ✅ 14-1. 대화 엔진 (완료)

- [x] dialogueData.js: 3개 대화 스크립트 (intro_welcome, merchant_first_meet, stage_first_clear)
- [x] dialogueData.js: CHARACTERS 정의 (mimi, poco, narrator)
- [x] DialogueManager.js: start, hasSeen, markSeen, getScript, resetAll
- [x] DialogueScene.js: 하단 180px 패널 (0x1a0a00, alpha 0.88), 구분선 (0xff6b35)
- [x] DialogueScene.js: 캐릭터 이름 + 이모지 초상화 + 대사 텍스트(타이핑 30ms/글자)
- [x] DialogueScene.js: 탭 → 타이핑 즉시 완료 / 완료 상태 → 다음 대사
- [x] DialogueScene.js: 건너뛰기 버튼 (skippable, 터치 타겟 44px) *(AD 검수: hitArea 60x44로 확대)*
- [x] DialogueScene.js: narrator 스타일 (이탤릭, 이름/초상화 없음)
- [x] DialogueScene.js: 진행 힌트 "▼" 깜빡임 *(AD 검수: 대사 하단에 근접 배치, 동적 Y좌표)*
- [x] DialogueScene.js: 딤 오버레이 input 블로킹
- [x] SaveManager v10: seenDialogues 필드, hasSeenDialogue, markDialogueSeen
- [x] main.js: DialogueScene 씬 배열 등록

---

## ✅ Phase 14 — 스토리 시스템 (완료)

> 목표: 식란 세계관 기반 스토리 콘텐츠 구현, 대화 트리거 연결, 캐릭터 확장, 트리거 중앙화
> 세계관 상세: `docs/PROJECT.md` "세계관 — 식란(食亂)의 세계" 참조

### ✅ 14-1. 대화 엔진 (완료)

- [x] DialogueManager + DialogueScene + dialogueData 기반 인프라

### ✅ 14-2. 대화 콘텐츠 + 캐릭터 초상화 + 트리거 연결 (완료)

> 원래 14-2(스크립트 확장/트리거) + 14-3(초상화 교체)을 통합 구현

#### 14-2a. PixelLab 캐릭터 초상화 4종

- [x] 미미(mimi), 포코(poco), 린(rin), 메이지(mage) 픽셀아트 초상화 생성
- [x] 64x64px, 투명 배경, 일관된 스타일(single color outline, basic shading)
- [x] 저장: `assets/portraits/portrait_{id}.png`

#### 14-2b. DialogueScene 스프라이트 렌더링

- [x] SpriteLoader._loadPortraits(): 초상화 4종 텍스처 로드
- [x] DialogueScene: PORTRAIT_SIZE 24->48, _portraitImage(Image) + _portraitEmoji(Text) 이중 시스템
- [x] portraitKey 기반 스프라이트 표시 + 이모지 fallback
- [x] setDisplaySize(48,48) 적용으로 렌더 크기 정규화 *(QA에서 setTexture() 후 setDisplaySize 누락 발견, 수정 완료)*

#### 14-2c. 대화 스크립트 확장

- [x] CHARACTERS에 린(rin, 0xff4444), 메이지(mage, 0xcc88ff) 추가
- [x] 기존 mimi/poco에 portraitKey 필드 추가
- [x] 10개 신규 대화 스크립트 추가 (총 13개)

#### 14-2d. 대화 트리거 연결 (4개 씬)

- [x] WorldMapScene: intro_welcome, chapter2_intro, mage_introduction, mage_research_hint
- [x] MerchantScene: merchant_first_meet, poco_discount_fail
- [x] ResultScene: stage_first_clear, chapter1_clear, rin_first_meet, chapter3_rin_joins, after_first_loss
- [x] GatheringScene: stage_boss_warning, chapter1_start

### ✅ 14-3. StoryManager 트리거 중앙화 (완료)

- [x] StoryManager.js 신규: getProgress, checkTriggers, advanceChapter, setFlag, hasFlag
- [x] storyData.js 신규: STORY_TRIGGERS 13종 (triggerPoint, condition, dialogueId, once, delay, chain)
- [x] SaveManager v10->v11: storyProgress {currentChapter, storyFlags} 추가
- [x] v10->v11 마이그레이션: seenDialogues 기반 currentChapter 추론 복원
- [x] WorldMapScene: `_triggerDialogues()` 제거 -> `StoryManager.checkTriggers(this, 'worldmap_enter')` *(씬 코드에서 if/else 분기 전부 제거)*
- [x] MerchantScene: `_triggerMerchantDialogue()` 제거 -> `StoryManager.checkTriggers(this, 'merchant_enter')`
- [x] ResultScene: `_triggerResultDialogues()` 제거 -> `StoryManager.checkTriggers()` + `advanceChapter()`
- [x] GatheringScene: `_triggerGatheringDialogues()` 제거 -> `StoryManager.checkTriggers(this, 'gathering_enter', {stageId})`

---

## ✅ Phase 15 — 스토리 콘텐츠 (완료)

> 목표: 챕터 2~6 메인 시나리오 + 사이드 대화 스크립트 작성
> StoryManager + storyData.js 기반으로 씬 코드 수정 없이 트리거 추가

- [x] 챕터 2~3 클리어 대화 스크립트 (chapter2_clear, chapter3_clear)
- [x] 챕터 4 인트로 + 메이지 합류 + 클리어 (chapter4_intro, chapter4_mage_joins, chapter4_clear)
- [x] 챕터 5 인트로 + 린 사이드 + 클리어 (chapter5_intro, rin_side_5, chapter5_clear)
- [x] 챕터 6 인트로 + 팀 사이드 + 최종 결전 + 엔딩 (chapter6_intro, team_side_6, chapter6_final_battle, chapter6_ending)
- [x] 포코 사이드 대화 (poco_side_4)
- [x] STORY_TRIGGERS 13개 추가 (worldmap_enter 3개, merchant_enter 1개, gathering_enter 1개, result_clear 8개)
- [x] 누적: 대화 스크립트 26종, STORY_TRIGGERS 24항목
- [x] 씬 코드 수정 없음, SaveManager 버전업 없음

---

## ✅ Phase 16 — 인게임 대화 통합 (완료)

> 목표: 튜토리얼/이벤트 대화 연동, 대화 선택지/분기 시스템

### ✅ 16-1. 튜토리얼 대화 연동 (완료)

- [x] GatheringScene: 첫 도구 배치 시 StoryManager.checkTriggers() 호출 (triggerPoint: tutorial_tool_placed)
- [x] ServiceScene: 첫 서빙 완료 시 StoryManager.checkTriggers() 호출 (triggerPoint: tutorial_first_serve)
- [x] 대화 스크립트 2종 추가 (tutorial_tool_placed, tutorial_first_serve)

### ✅ 16-2. 영업 이벤트 대화 연동 (완료)

- [x] ServiceScene._triggerRandomEvent() 내에서 service_event triggerPoint 호출
- [x] 이벤트별 캐릭터 반응 대화 3종 추가 (event_happy_hour, event_food_review, event_kitchen_accident)

### ✅ 16-3. 대화 선택지/분기 시스템 (완료)

- [x] DialogueScene에 선택지 버튼 UI 구현 (36px 버튼, 8px gap, 최대 2개)
- [x] dialogueData.js 형식에 choices 배열 지원 추가
- [x] 샘플 분기 대화 1종 추가 (choice_sample_merchant)
- [x] 누적: 대화 스크립트 32종, STORY_TRIGGERS 30항목, triggerPoint 8종

---

## ✅ Phase 17 — 밸런스 QA (완료)

> 목표: 전체 게임 밸런스 수치 시뮬레이션 분석, 병목 구간 탐지 및 조정

- [x] DPS vs 적 HP 곡선 분석 (30스테이지 전체)
- [x] 스테이지별 경제 시뮬레이션 (골드 수입/지출 추이)
- [x] 레시피 효율 랭킹 (골드/초 기준 OP/함정 레시피 탐지)
- [x] 난이도 커브 분석 (스테이지 간 점프율, 병목 스테이지)
- [x] 엔드리스 스케일링 붕괴점 분석
- [x] 밸런스 조정 P1+P2 4건 적용 (2-2/1-5 HP 스파이크 완화, 6-2/6-3 인내심 조정)

---

## ✅ Phase 18 — 레거시 정리 + 기술 부채 (완료)

> 목표: 사용하지 않는 레거시 코드 제거, 코드 품질 향상, 빌드 크기 절감

### ✅ 18-1. 레거시 씬 삭제 (완료)

- [x] MarketScene.js 삭제 (GatheringScene으로 완전 대체됨)
- [x] StageSelectScene.js 삭제 (WorldMapScene으로 완전 대체됨)
- [x] GameScene.js 삭제 (Phase 7 레거시, main.js 미등록)
- [x] GameOverScene.js 삭제 (Phase 7 레거시, ResultScene으로 대체)
- [x] main.js 씬 등록에서 제거 + import 참조 정리
- [x] ResultScene.js의 StageSelectScene 참조 -> WorldMapScene으로 교체

### ✅ 18-2. config.js 정리 (완료)

- [x] STARTING_GOLD, WAVE_CLEAR_BONUS, INGREDIENT_SELL_PRICE 미사용 상수 제거
- [x] 하위 호환 주석 정리, @fileoverview 현행화
- [x] MarketScene 레이아웃 섹션 주석 -> 게임 씬 레이아웃으로 교체
- [x] RestaurantScene 상수는 활성 코드 사용 중이므로 주석만 현행화 (유지)

### ✅ 18-3. 코드 품질 (완료)

- [x] JSDoc 누락분 보강 — 7개 파일 (GatheringScene, MerchantScene, WorldMapScene, ToolManager, StoryManager, DialogueManager, DialogueScene)
- [x] Playwright 테스트 정리 (worldmap-qa.spec.js 회귀 테스트 삭제, endless-mode-qa.spec.js StageSelectScene -> WorldMapScene 교체)

---

## Phase 19 — 시즌 2 기반 인프라

> 목표: 시즌 2 "국제 식란 SOS" 진입을 위한 인프라 확장
> 스토리: 시즌 1 엔딩 후, 해외 미력사 조직 "세계 미력사 연합(WCA)"에서 긴급 SOS. 각국에서 동시다발 대식란 발생. 미미 일행이 국제 원정을 떠난다.

### ✅ 19-1. 데이터 레이어 + 세이브 확장 + 도구 전투 로직 (완료)

- [x] SaveManager v11->v12 (wasabi_cannon/spice_grinder 도구, season2Unlocked)
- [x] TOOL_DEFS에 wasabi_cannon(범위+둔화), spice_grinder(DoT) 추가 (8종)
- [x] chefData.js에 yuki_chef, lao_chef 추가, CHEF_ORDER 5종
- [x] dialogueData.js CHARACTERS에 yuki, lao 캐릭터 정의
- [x] MerchantScene TOOL_ORDER 8종, 업그레이드 프리뷰 확장
- [x] SpriteLoader CHEF_IDS(5), PORTRAIT_IDS(6), TOWER_IDS(8) 확장
- [x] Enemy.js applyDot() (500ms 틱, 3스택, 주황 틴트)
- [x] Projectile.js 범위 공격(splashRadius) + DoT 분기
- [x] Tower.js/ToolManager 신규 도구 fallback + 기본값

### ✅ 19-2. UI 확장 (완료)

- [x] ChefSelectScene 5종 셰프 카드 레이아웃 (카드 높이 145→100, 간격 10→8, 시즌2 셰프 잠금 표시)
- [x] WorldMapScene 시즌 1/2 탭 전환 (6노드 → 12노드, CHAPTERS 12개)
- [x] 시즌 2 미해금 시 탭 비활성 + 자물쇠
- [x] stageData.js STAGE_ORDER/STAGES 시즌 2 36개 스테이지 추가
- [x] SaveManager isUnlocked('7-1') 복합 조건 (6-3 클리어 + season2Unlocked)
- [x] SaveManager getTotalStars(season) 시즌별 필터

### ✅ 19-3. PixelLab 에셋 + 시즌 2 프롤로그 스토리 (완료)

- [x] PixelLab 에셋 6종 (유키/라오 셰프 스프라이트, 초상화, 도구 2종)
- [x] 시즌 2 프롤로그 대화 스크립트 3종 (season2_prologue, season2_yuki_intro, season2_lao_intro)
- [x] STORY_TRIGGERS에 트리거 3건 등록 (onComplete 콜백으로 세이브 상태 변경)
- [x] season2_prologue 완료 시 season2Unlocked = true + currentChapter = 7
- [x] SaveManager v12→v13 (storyFlags 배열→객체 마이그레이션)
- [x] StoryManager._fire() trigger.onComplete 지원, setFlag/hasFlag 객체 패턴 전환

### ✅ 19-4. 영업 씬 비주얼 리워크 (완료)

- [x] PixelLab 에셋 12종 생성 (테이블 5종, 손님 5종, 홀 바닥, 조리 카운터) → `assets/service/`
- [x] SpriteLoader `_loadServiceAssets()` 메서드 추가 + preload 등록
- [x] ServiceScene 홀 배경 → `floor_hall` 스프라이트 교체 (fallback: 색상 직사각형)
- [x] ServiceScene 테이블 → `table_lv{N}` 스프라이트 교체 (fallback: TABLE_COLORS 직사각형)
- [x] ServiceScene 손님 아이콘 → `customer_{type}` 스프라이트 교체 (custIconImg + custIconText 이중 구조)
- [x] ServiceScene 조리 슬롯 → `counter_cooking` 스프라이트 교체 (fallback: 색상 직사각형)
- [x] SpriteLoader.hasTexture() 기반 fallback 전략 전체 적용
- [x] 기존 인터랙션 로직 무변경 (테이블 터치/서빙/조리 진행 바/버리기 버튼)

---

## ✅ Phase 20 — 7장: 사쿠라 이자카야 (일식, 완료)

> 테마: 벚꽃 아래 전통 이자카야. 정갈하면서도 날카로운 적들.
> 스토리: 유키의 고향. 현지 미력사 길드가 괴멸, 유키가 합류.

### ✅ 20-1. 신규 재료/적 + 기믹 메커닉 (완료)

- [x] 재료 2종: 참치(🍣 sashimi_tuna), 와사비(🌿 wasabi) — 누적 17종
- [x] 적 2종: sushi_ninja (HP 250, 은신+백어택 디버프), tempura_monk (HP 300, 배리어)
- [x] 보스: sake_oni (HP 6000, 취권 패턴, 아우라 버프, 분노)
- [x] Enemy.js 특수 메커닉 4종: 은신(stealth), 배리어(barrier), 만취걸음(drunkWalk), 아우라(aura)
- [x] Tower.js canBeTargeted 은신 적 필터링, freezer canTargetInvisible
- [x] GatheringScene stealth_back_attack 이벤트 핸들러
- [x] PixelLab 스프라이트: sushi_ninja(32px), tempura_monk(32px), sake_oni(48px), 재료 아이콘 2종 *(백어택은 도구 HP 미지원으로 공격속도 -30% 디버프로 대체)*

### ✅ 20-2. 스테이지 7-1 ~ 7-6 (완료)

- [x] 6스테이지 웨이브 데이터 교체 (sushi_ninja/tempura_monk/sake_oni 구성)
- [x] SpriteLoader에 ENEMY_IDS +2, BOSS_IDS +1, TILESET_IDS +1, INGREDIENT_FILE_MAP +2 등록
- [x] 서비스 설정 (인내심 28~22초 구간)
- [x] 7-6 보스 스테이지: 최종 웨이브에 sake_oni (count:1) + 사전 소환 파도

### ✅ 20-3. 레시피 확장 (10종, 완료)

- [x] 서빙 8종 (사시미 정식, 와사비롤, 니기리 스시, 와사비 튀김, 참치 덮밥, 와사비 된장국, 사쿠라 가이세키, 이자카야 플래터)
- [x] 버프 2종: wasabi_kick(공격력 +35%), tuna_precision(공속+공격력 +20%) *(buff_crit_speed -> buff_both로 단순화)*
- [x] recipeData.js ALL_SERVING_RECIPES/ALL_BUFF_RECIPES에 등록 (gateStage 설정 포함)
- [x] 누적 116종 (서빙 94 + 버프 22)

### ✅ 20-4. 스토리 스크립트 (완료)

- [x] chapter7_intro (7-1 진입 시, 유키 고향 소개)
- [x] chapter7_yuki_joins (7-3 첫 클리어 시, 유키 정식 합류)
- [x] chapter7_clear (7-6 첫 클리어 시, 사케 오니 정화 + chapter7_cleared 플래그 + currentChapter=8)
- [x] yuki_side_7 (7장 클리어 후 행상인 진입 시, 유키 캐릭터 심화)
- [x] storyData.js 트리거 4건 + stage_first_clear 제외 목록에 7-1/7-3/7-6 추가

**구현 순서**: ~~20-1~~ → ~~20-2~~ → ~~20-3~~ → ~~20-4~~

---

## Phase 21 — 8장: 용의 주방 (중식)

> 테마: 거대한 중화 궁전 주방. 웍 불길과 증기 가득.
> 스토리: 라오의 본거지. 가문의 전설적 웍이 식란에 오염. 라오 합류.

### 21-1. 신규 재료/적

- [ ] 재료 2종: 두부(🧈→🫘 tofu), 고수(🌿 cilantro) — 누적 19종
- [ ] 적 2종: dumpling_warrior (HP ~280, 분열), wok_phantom (HP ~320, 화염 장판)
- [ ] 보스: dragon_wok (HP 7000, 화염 브레스, 3페이즈)
- [ ] PixelLab 스프라이트

### 21-2. 스테이지 8-1 ~ 8-6

- [ ] 6스테이지 + 웨이브 구성
- [ ] 중식 전용 타일셋
- [ ] 서비스 설정

### 21-3. 레시피 확장 (~10종)

- [ ] 서빙 8~9종 (두부+고수 조합: 마파두부, 딤섬, 볶음면 등)
- [ ] 버프 1~2종
- [ ] 누적 ~126종

### 21-4. 스토리 스크립트

- [ ] chapter8_intro (라오 등장, 오염된 웍)
- [ ] chapter8_lao_joins (라오 합류)
- [ ] chapter8_clear (용의 웍 정화)
- [ ] 사이드 대화 1~2종

---

## Phase 22 — 9장: 별빛 비스트로 (양식)

> 테마: 파리풍 고급 레스토랑. 우아하지만 치명적인 적들.
> 스토리: WCA 유럽 지부장의 요청. 미슐랭 레스토랑이 식란의 진원지.

### 22-1. 신규 재료/적

- [ ] 재료 1종: 트러플(🍄→🫘 truffle) — 누적 20종
- [ ] 적 2종: wine_specter (HP ~350, 취기 디버프), foie_gras_knight (HP ~400, 방어 특화)
- [ ] 보스: chef_noir (HP 7500, 다크 쿠진 공격, 소환)
- [ ] PixelLab 스프라이트

### 22-2. 스테이지 9-1 ~ 9-6

- [ ] 6스테이지 + 웨이브 구성
- [ ] 양식 전용 타일셋 (비스트로 인테리어)
- [ ] 서비스 설정

### 22-3. 레시피 확장 (~10종)

- [ ] 서빙 8~9종 (트러플+기존 재료 조합: 트러플 파스타, 꽁피, 부야베스 등)
- [ ] 버프 1~2종
- [ ] 누적 ~136종

### 22-4. 스토리 스크립트

- [ ] chapter9_intro (파리 도착, WCA 유럽 지부)
- [ ] chapter9_clear (셰프 누아르 격퇴)
- [ ] 사이드 대화 1~2종 (미미+유키+라오 팀 케미)

---

## Phase 23 — 10장: 향신료 궁전 (인도)

> 테마: 화려한 향신료 시장과 궁전. 강렬한 향과 색채.
> 스토리: 인도 미력사 가문의 비밀 향신료가 식란을 증폭시키고 있다.

### 23-1. 신규 재료/적

- [ ] 재료 2종: 커리잎(🍃 curry_leaf), 사프란(🌸 saffron) — 누적 22종
- [ ] 적 2종: curry_djinn (HP ~380, 텔레포트), naan_golem (HP ~450, 자가 회복)
- [ ] 보스: spice_maharaja (HP 8000, 향신료 폭풍, 디버프 중첩)
- [ ] PixelLab 스프라이트

### 23-2. 스테이지 10-1 ~ 10-6

- [ ] 6스테이지 + 웨이브 구성
- [ ] 인도 전용 타일셋
- [ ] 서비스 설정

### 23-3. 레시피 확장 (~10종)

- [ ] 서빙 8~9종 (커리잎+사프란 조합: 버터치킨, 탄두리, 비리야니 등)
- [ ] 버프 1~2종
- [ ] 누적 ~146종

### 23-4. 스토리 스크립트

- [ ] chapter10_intro (향신료 시장 탐사)
- [ ] chapter10_clear (마하라자 격퇴, 향신료 비밀 해명)
- [ ] 사이드 대화 1~2종

---

## Phase 24 — 11장: 선인장 칸티나 (멕시칸)

> 테마: 사막 한가운데 네온 칸티나. 매운맛과 축제 분위기.
> 스토리: 멕시코 미력사가 실종. 칸티나 지하에 식란 균열 발견.

### 24-1. 신규 재료/적

- [ ] 재료 1종: 할라피뇨(🌶️ jalapeno) — 누적 23종
- [ ] 적 2종: taco_bandit (HP ~400, 빠른 이동+회피), burrito_juggernaut (HP ~500, 고HP 돌진)
- [ ] 보스: el_diablo_pepper (HP 8500, 화염+폭발, 분열)
- [ ] PixelLab 스프라이트

### 24-2. 스테이지 11-1 ~ 11-6

- [ ] 6스테이지 + 웨이브 구성
- [ ] 멕시칸 전용 타일셋 (사막+네온)
- [ ] 서비스 설정

### 24-3. 레시피 확장 (~10종)

- [ ] 서빙 8~9종 (할라피뇨 조합: 타코, 부리토, 나초, 과카몰리 등)
- [ ] 버프 1~2종
- [ ] 누적 ~156종

### 24-4. 스토리 스크립트

- [ ] chapter11_intro (사막 도착, 실종 미력사 단서)
- [ ] chapter11_clear (엘 디아블로 격퇴, 균열 봉인)
- [ ] 사이드 대화 1~2종

---

## Phase 25 — 12장: 슈가 드림랜드 (디저트 월드, 시즌 2 최종)

> 테마: 과자와 사탕으로 이루어진 이세계. 식란의 진원지.
> 스토리: 모든 국제 식란의 배후에 "미각의 여왕"이 있었다. 최종 결전.

### 25-1. 신규 재료/적

- [ ] 재료 2종: 카카오(🍫 cacao), 바닐라(🌸 vanilla) — 누적 25종
- [ ] 적 2종: candy_soldier (HP ~450, 경화 방어), cake_witch (HP ~400, 소환+버프)
- [ ] 최종 보스: queen_of_taste (HP 10000, 3페이즈, 전 속성 공격)
- [ ] PixelLab 스프라이트 (보스 64px pro)

### 25-2. 스테이지 12-1 ~ 12-6

- [ ] 6스테이지 + 웨이브 구성 (시즌 2 최고 난이도)
- [ ] 디저트 월드 전용 타일셋 (과자/사탕 환경)
- [ ] 서비스 설정 (최고 난이도)

### 25-3. 레시피 확장 (~10종)

- [ ] 서빙 8~9종 (카카오+바닐라 조합: 트러플 초콜릿, 크렘 브륄레, 마카롱 등)
- [ ] 버프 1~2종
- [ ] 누적 ~166종

### 25-4. 스토리 스크립트

- [ ] chapter12_intro (드림랜드 진입, 미각의 여왕 정체)
- [ ] chapter12_final_battle (최종 결전)
- [ ] chapter12_ending (시즌 2 엔딩, 시즌 3 떡밥)
- [ ] 사이드 대화 2~3종 (전원 회상, 유키+라오 마무리)

---

## Phase 26 — 시즌 2 밸런스 QA + 스토리 종합

> 목표: 시즌 2 전체 밸런스 검증, 스토리 흐름 정합성 확인

- [ ] 36스테이지 DPS/HP 커브 시뮬레이션 (7장~12장)
- [ ] 시즌 2 경제 시뮬레이션 (골드/코인 수급 균형)
- [ ] 신규 도구 2종 밸런스 검증
- [ ] 신규 셰프 2종 스킬 밸런스 검증
- [ ] 엔드리스 시즌 2 적 통합 검증
- [ ] 스토리 연결성 검증 (시즌 1→2 전환, 캐릭터 합류 시점, 대화 정합성)

---

## Phase 27 — 업적 시스템

> 목표: 30~50개 업적, 보상 체계, 업적 UI. 시즌 1+2 콘텐츠 완성 이후 메타 요소로 추가.

- [ ] 업적 데이터 설계 (achievementData.js): 30~50개 (스토리/전투/수집/경제/엔드리스 카테고리)
- [ ] AchievementManager.js: 업적 해금 조건 판정, 진행도 추적, 보상 지급
- [ ] 업적 UI (AchievementScene 또는 팝업): 카테고리 탭, 진행률 바, 보상 수령 버튼
- [ ] 업적 달성 알림 (플로팅 토스트, SFX)
- [ ] SaveManager 버전업: achievements 필드 추가
- [ ] 업적 보상: 코인, 골드, 한정 레시피, 셰프 스킨 등

---

## 시즌별 장기 확장 계획

> "식란(食亂)"은 반복적 자연현상이므로 시즌 단위로 콘텐츠 확장 가능

### 시즌 1 — 첫 번째 대식란 (챕터 1~6) ✅ 완료

- 할머니의 식당 복원, 미력사 각성, 지역 식란 진정
- 30스테이지, 106레시피, 15재료, 22적, 6보스, 6도구, 3셰프

### 시즌 2 — 국제 식란 SOS (챕터 7~12, Phase 19~26)

- 해외 미력사 조직 "세계 미력사 연합(WCA)"의 구원 요청
- 각국 요리 테마: 일식, 중식, 양식, 인도, 멕시칸, 디저트 월드
- +36스테이지, +60레시피, +10재료, +12적+6보스, +2도구, +2셰프
- 시즌 2 완료 시: 66스테이지, ~166레시피, 25재료, 40적, 8도구, 5셰프

### 시즌 3 — 극한 환경 식란 (챕터 13~18, 미래)

- 심해/화산/빙하/사막/밀림/우주정거장
- 극한 환경 전용 재료+도구, 환경 기믹
- 신규 재료 ~10종, 레시피 ~60종, 적 ~12종, 도구 ~2종

### 엔드리스 확장

- 영구 식란 지대(미력 폭풍의 눈), 끝없는 정화 임무
- 시즌별 엔드리스 테마 추가

---

## 요약 타임라인

| Phase | 핵심 키워드 | 레시피 누적 | 재료 | 상태 |
|-------|-----------|-----------|------|------|
| ~~1~~ | ~~코어 TD 루프~~ | - | - | ✅ 완료 |
| ~~2~~ | ~~듀얼 씬 아키텍처~~ | - | - | ✅ 완료 |
| ~~3~~ | ~~아이소메트릭, 적/타워/레시피~~ | 12 | 5 | ✅ 완료 |
| ~~4~~ | ~~밸런스, 스테이지, 세이브~~ | 12 | 5 | ✅ 완료 |
| ~~5~~ | ~~주방 코인, 레시피 컬렉션, 보스~~ | 24 | 7 | ✅ 완료 |
| ~~6~~ | ~~셰프 캐릭터, 오더, 생선/버섯/치즈~~ | 42 | 10 | ✅ 완료 |
| ~~7~~ | ~~게임 루프 리디자인 (3씬 구조)~~ | 42 | 10 | ✅ 완료 |
| ~~8~~ | ~~영업 심화, 새우/토마토/버터~~ | 66 | 13 | ✅ 완료 |
| ~~9~~ | ~~설탕/우유, 디저트, 픽셀 아트 교체~~ | 89 | 15 | ✅ 완료 |
| ~~10~~ | ~~30스테이지 완성, 사운드/VFX~~ | 106 | 15 | ✅ 완료 |
| ~~11~~ | ~~엔드리스, 월드맵, 최종 폴리시~~ | 106 | 15 | ✅ 완료 |
| ~~12~~ | ~~리네이밍 (Kitchen Chaos Tycoon)~~ | 106 | 15 | ✅ 완료 |
| ~~13~~ | ~~도구 시스템 리워크, 행상인, 재료 채집~~ | 106 | 15 | ✅ 완료 |
| ~~14-1~~ | ~~대화 엔진 (DialogueManager + DialogueScene)~~ | 106 | 15 | ✅ 완료 |
| ~~14-2~~ | ~~초상화 4종, 스크립트 13종, 4씬 트리거~~ | 106 | 15 | ✅ 완료 |
| ~~14-3~~ | ~~StoryManager 트리거 중앙화, 챕터 진행도~~ | 106 | 15 | ✅ 완료 |
| ~~15~~ | ~~스토리 콘텐츠 (챕터 2~6 시나리오 + 사이드 대화)~~ | 106 | 15 | ✅ 완료 |
| ~~16~~ | ~~인게임 대화 통합 (튜토리얼/이벤트/선택지)~~ | 106 | 15 | ✅ 완료 |
| ~~17~~ | ~~밸런스 QA (시뮬레이션, P1+P2 조정)~~ | 106 | 15 | ✅ 완료 |
| ~~18~~ | ~~레거시 정리 + 기술 부채~~ | 106 | 15 | ✅ 완료 |
| ~~19~~ | ~~시즌 2 기반 (월드맵 12챕터, 셰프 2종, 도구 2종, 영업 씬 비주얼)~~ | 106 | 15 | ✅ 완료 |
| ~~20~~ | ~~7장 사쿠라 이자카야 (참치, 와사비)~~ | 116 | 17 | ✅ 완료 |
| 21 | 8장 용의 주방 (두부, 고수) | ~126 | 19 | 📋 계획 |
| 22 | 9장 별빛 비스트로 (트러플) | ~136 | 20 | 📋 계획 |
| 23 | 10장 향신료 궁전 (커리잎, 사프란) | ~146 | 22 | 📋 계획 |
| 24 | 11장 선인장 칸티나 (할라피뇨) | ~156 | 23 | 📋 계획 |
| 25 | 12장 슈가 드림랜드 (카카오, 바닐라) — 시즌 2 최종 | ~166 | 25 | 📋 계획 |
| 26 | 시즌 2 밸런스 QA + 스토리 종합 | ~166 | 25 | 📋 계획 |
| 27 | 업적 시스템 (30~50개, 보상 UI) | ~166 | 25 | 📋 계획 |
| 28 | 아트 리워크 (전체 스프라이트 64px 재생성) | ~166 | 25 | 🎨 예정 |

---

## Phase 28 — 아트 리워크: 레거시(Phase 1~19) 스프라이트 64px 재생성

> 목표: 기존 32~48px 스프라이트를 64px로 재생성하여 시각 품질 개선

### 배경

- 현재 적/보스/셰프 스프라이트: 32~48px (레트로 도트 느낌이 강함)
- 실제 렌더 크기: 일반 적 35px, 보스 50px (게임 캔버스 360×640)
- 64px 원본으로 재생성 시: 축소 스케일이 줄어 선명하고 덜 레트로한 느낌

### 앵커 이미지 (아트 방향 기준)

- **당근 고블린 64px v2** — 아트 리워크 기준 레퍼런스
  - 파일: `assets/enemies/carrot_goblin/carrot_goblin_64px_anchor.png`
  - PixelLab Character ID: `ca774523-aeca-4f33-8495-4fb0db4ba22a`
  - 설정: size=64, outline=single color black outline, shading=basic shading, detail=medium detail, proportions=chibi, view=low top-down

### 생성 표준 설정

```
size: 64
outline: "single color black outline"
shading: "basic shading"
detail: "medium detail"
proportions: {"type": "preset", "name": "chibi"}
view: "low top-down"
n_directions: 8
```

### 대상 에셋 목록

- [ ] 적 일반 (16종) — 32px → 64px
- [ ] 보스 (4종) — 48px → 64px
- [ ] 셰프 캐릭터 스프라이트 (5종)
- [ ] 초상화는 제외 (별도 포맷)
