# Kitchen Chaos Tycoon 기획서

> 최종 업데이트: 2026-04-16 (Phase 35 완료)

## 프로젝트 개요

모바일 타워 디펜스 + 레스토랑 타이쿤 하이브리드 게임(구 Kitchen Chaos Defense). 영구 도구를 배치해 적을 처치하고 재료를 채집하는(재료 채집 페이즈) → 재료로 손님에게 요리를 서빙하여 골드를 획득하는(영업 페이즈) → 골드로 도구를 구매/업그레이드하는(행상인) 3단계 루프 구조. Phaser.js 3 기반 웹 게임, Android 우선 배포.

## 세계관 — 식란(食亂)의 세계

### 핵심 설정

**식란(食亂)**은 음식의 맛 에너지("미력/味力")가 폭주하여 식재료가 괴물로 변하는 자연 현상이다. 지진이나 태풍처럼 불규칙하게 발생하며, 강도와 범위도 매번 다르다. 식란이 일어나면 식재료들이 자아를 갖고 폭주하며, 이를 "정화(淨化)"하여 원래의 식재료로 되돌리는 것이 게임의 핵심 루프이다.

**미력사(味力師)**는 대대로 식란을 잠재우는 비밀 요리사 혈통이다. 일반인에게는 그저 실력 좋은 요리사로 보이지만, 실제로는 조리 도구에 깃든 정화 마법으로 폭주한 식재료를 진정시킨다. 조리 행위(굽기, 볶기, 끓이기) 자체가 정화 의식이며, 만족한 손님들의 "맛있다!"는 감탄이 도구의 미력을 충전한다.

### 게임플레이와의 연결

| 게임 메커닉 | 세계관 설명 |
|------------|-----------|
| 재료 채집 (TD) | 식란으로 폭주한 식재료를 조리 도구로 정화 |
| 적 = 식재료 몬스터 | 미력이 폭주하여 자아를 가진 식재료들 |
| 도구 = 타워 | 미력사 가문 대대로 전해지는 정화 도구 |
| 영업 = 충전 | 손님의 감탄이 도구의 미력을 충전 |
| 행상인 | 미력사 가문의 오랜 협력자, 정화 도구 전문 장인 |
| 셰프 시스템 | 각기 다른 미력 특성을 지닌 요리사들 |

### 스토리 개요

주인공 **미미**는 평범한 요리학교 졸업생이었으나, 돌아가신 할머니가 남긴 낡은 식당을 물려받으면서 미력사 혈통임을 알게 된다. 첫날 밤, 식당 주변에서 소규모 식란이 발생하고, 할머니의 오래된 프라이팬이 빛나기 시작한다. 떠돌이 행상인 **포코**가 나타나 미력사의 사명을 설명하고, 미미의 이중생활이 시작된다 — 낮에는 식당 운영, 밤에는 식란 정화.

### 코미디 톤

- **낮/밤 갭**: 낮에는 "오늘도 신선한 재료로 맛있는 요리를!" → 밤에는 "저 당근이 또 칼 들고 온다!"
- **아무도 모름**: 손님들은 미미가 밤마다 식재료와 싸우는 줄 모른다. "여기 재료가 왜 이렇게 신선해요?" "아, 그게... 직접 고르거든요! (물리적으로)"
- **포코의 상인 근성**: 위기 상황에서도 "이 프라이팬 지금 사면 10% 할인!"
- **자아 있는 보스**: "난 그냥 참치인데 왜 자꾸 초밥으로 만들려는 거야!"

### 주요 캐릭터

| 캐릭터 | 이모지 | 역할 | 설명 |
|--------|--------|------|------|
| 미미 | 👧 | 주인공 | 초보 미력사. 할머니의 식당을 물려받은 요리학교 졸업생. 낮엔 요리사, 밤엔 식란 정화사. |
| 포코 | 🎒 | 행상인 | 미력사 가문의 오랜 협력자이자 정화 도구 전문 장인. 위기에도 장사를 놓지 않는 상인 근성. |
| 린 | 🔥 | 라이벌→동료 | 불꽃 요리사. 미미의 라이벌이자 나중에 동료가 되는 실력파 셰프. |
| 메이지 | 🧁 | 연구원→동료 | 디저트 전문 미력사이자 식란 연구원. 식란의 원인을 학문적으로 추적. |
| 유키 | ❄️ | 그룹2 동료 | 일본 출신 미력사. 차분하고 정밀한 칼잡이. 7장에서 합류. |
| 라오 | 🐉 | 그룹2 동료 | 중국 출신 미력사. 호쾌한 웍 마스터. 8장(구)에서 합류. |
| 아르준 | 🪬 | 그룹3 동료 | 마살라 문파 12대 계승자. 17장에서 ???로 등장, 18장에서 신원 공개. |

### 챕터 확장 구조 (80~100시간 분량)

"식란"은 일회성 저주가 아닌 반복적 자연현상이므로, 챕터 단위로 콘텐츠를 확장할 수 있다.

| 그룹 | 챕터 | 테마 | 키워드 |
|------|------|------|--------|
| 그룹1 | 1~6장 ✅ | 첫 번째 대식란 | 할머니의 식당 복원, 미력사 각성, 지역 식란 진정 |
| 그룹2 | 7~15장 | 국제 식란 SOS | 일식(7~9장), 중식(10~12장), 양식(13~15장) |
| 그룹3 | 16~24장 | 식란의 근원 | 인도(16~18장), 멕시칸(19~21장), 디저트·최종(22~24장) |
| 엔드리스 | ∞ | 영구 식란 지대 | 미력 폭풍의 눈, 끝없는 정화 임무 |

각 그룹은 새로운 재료, 적, 레시피, 캐릭터, 도구를 추가하며 독립적으로 즐길 수 있다.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 엔진 | Phaser.js 3 |
| 언어 | JavaScript (바닐라) |
| 아트 | PixelLab API (픽셀 아트) |
| 사운드 | Web Audio API (프로시저럴) |
| 빌드 | Vite + Capacitor (Android) |
| 테스트 | Playwright |

## 아키텍처

### 디렉토리 구조

```
kitchen-chaos/
  js/
    main.js                  # Phaser 게임 설정 + 씬 등록
    scenes/
      BootScene.js           # 에셋 로드
      MenuScene.js           # 메인 메뉴 (캠페인/엔드리스/상점/도감)
      WorldMapScene.js       # 월드맵 (24챕터 3그룹 탭 + 9노드 맵 + 스테이지 패널, ch12=용의 궁전)
      ChefSelectScene.js     # 셰프 선택 (캠페인/엔드리스 분기)
      GatheringScene.js      # 재료 채집 페이즈 (TD, 도구 배치/회수/재배치)
      EndlessScene.js        # 엔드리스 TD 페이즈 (GatheringScene 상속)
      ServiceScene.js        # 영업 페이즈 (타이쿤, 골드→영구 저장)
      ResultScene.js         # 결과 화면 (캠페인/엔드리스 분기)
      MerchantScene.js       # 행상인 (도구 구매/판매/업그레이드)
      ShopScene.js           # 상점 (업그레이드/레시피/테이블/인테리어/직원)
      RecipeCollectionScene.js # 레시피 도감
      DialogueScene.js       # 대화 오버레이 씬 (타이핑 애니메이션, 건너뛰기)
    managers/
      SaveManager.js         # 세이브/로드 + 마이그레이션 (현재 v16)
      ToolManager.js         # 영구 도구 인벤토리 (구매/판매/업그레이드/스탯)
      DialogueManager.js     # 대화 관리자 (start/hasSeen/markSeen)
      StoryManager.js        # 스토리 진행도 추적 + 트리거 중앙 디스패처
      WaveManager.js         # 웨이브 적 스폰 관리
      EndlessWaveGenerator.js # 엔드리스 무한 웨이브 생성기
      RecipeManager.js       # 레시피 해금/조리 관리
      SoundManager.js        # BGM/SFX 프로시저럴 생성
      VFXManager.js          # 파티클/스크린 효과/플로팅 텍스트
      ObjectPool.js          # 범용 오브젝트 풀 (성능 최적화)
      ChefManager.js         # 셰프 선택/스킬 관리
      OrderManager.js        # 오더(미션) 시스템
    data/
      gameData.js            # 적(51종)/도구(TOOL_DEFS)/재료(29종) 정의
      stageData.js           # 스테이지 데이터 138슬롯 (구현: 1~7/9~13/15~21장, placeholder: 8/14/22~24장)
      recipeData.js          # 레시피 254종 정의
      dialogueData.js        # 대화 스크립트 94종 + 캐릭터 14종 정의 (시즌2 7~15장 31종, 16장 4종, 17장 3종, 18장 6종, 19장 3종, 20장 3종, 21장 6종 포함)
      storyData.js           # STORY_TRIGGERS 트리거 데이터 96항목 (triggerPoint 8종, import SaveManager)
  assets/                    # 스프라이트/타일셋/아이콘 (PixelLab 픽셀아트)
    sprites/portraits/       # 캐릭터 초상화 6종 (64x64 PixelLab)
    sprites/chefs/           # 셰프 스프라이트 5종 (48px)
    sprites/enemies/         # 적 스프라이트 39종 (masala_guide 108px, taco_bandit 160px, burrito_juggernaut 172px, cactus_wraith, luchador_ghost 포함)
    sprites/bosses/el_diablo_pepper/ # el_diablo_pepper 보스 스프라이트 (64px pro, 8방향 + walking 애니메이션)
    sprites/bosses/sake_oni/ # sake_oni 보스 스프라이트 (124x124px, 8방향 rotations + walking-9fa1ac06)
    sprites/bosses/sake_master/ # sake_master 보스 스프라이트 (64px, 8방향 animating-8d3d020e)
    sprites/bosses/dragon_wok/  # dragon_wok 보스 스프라이트 (64px, 8방향 animating-30e6c64f)
    sprites/bosses/chef_noir/   # chef_noir 보스 스프라이트 (64px pro, 8방향 animating-96100c0f, 124x124px)
    sprites/bosses/maharaja/    # maharaja 보스 스프라이트 (212px pro, 8방향 animating-2c666ada)
    sprites/towers/          # 타워 스프라이트 8종 (32x32)
    tilesets/                # 타일셋 15종 (spice_palace, spice_palace_interior, cactus_cantina 포함)
    icons/                   # 재료 아이콘 29종 (curry_leaf, saffron, chai, cardamom, jalapeno, avocado 32px 포함)
    service/                 # 영업 씬 에셋 15종 (테이블/손님/바닥/카운터/홀 데코)
  tests/                     # Playwright 테스트
  docs/                      # 프로젝트 문서
```

### 핵심 모듈

| 모듈 | 파일 | 역할 |
|------|------|------|
| 재료 채집 | GatheringScene.js | 도구 배치/회수/재배치, 적 AI, 재료 드롭, 보스 재료 드롭, 웨이브 진행 |
| 도구 관리 | ToolManager.js | 영구 도구 인벤토리 (구매/판매/업그레이드/스탯 조회) |
| 행상인 | MerchantScene.js | 영업 후 도구 구매/판매/업그레이드 UI |
| 월드맵 | WorldMapScene.js | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률 HUD |
| 엔드리스 | EndlessScene.js + EndlessWaveGenerator.js | 무한 웨이브 TD, 5웨이브마다 영업+행상인 삽입 |
| 영업 코어 | ServiceScene.js | 손님 입장/주문/조리/서빙/팁, 골드→영구 저장, 아이소메트릭 홀 (다이아몬드 격자+depth sorting+홀 데코), 웜 다크 통합 팔레트, 픽셀아트 렌더링 (fallback 지원) |
| 결과 | ResultScene.js | 캠페인 별점/엔드리스 기록 표시, 행상인 방문 연결 |
| 대화 시스템 | DialogueManager.js + DialogueScene.js + dialogueData.js | 대화 스크립트 94종 재생, 선택지 분기 UI, 픽셀아트 초상화 렌더링, 시청 기록 |
| 스토리 시스템 | StoryManager.js + storyData.js | 트리거 중앙 디스패처(triggerPoint 8종), 96항목, 챕터 진행도, 스토리 플래그(객체), onComplete 콜백, 씬 1줄 호출 |
| 세이브 | SaveManager.js | localStorage, 마이그레이션 체인 v1~v16, season3Unlocked, getTotalStars(group) |
| 사운드 | SoundManager.js | 프로시저럴 SFX 20종 + BGM 5종 |
| VFX | VFXManager.js | Canvas2D 파티클, 스크린 플래시/셰이크, 플로팅 텍스트 |

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
| 캠페인 | 24챕터 체계(그룹1~3), 구현 완료 1~7/9~13/15~21장, 보스 12종, 별점 시스템 | 완료 |
| 레시피 | 254종, 5등급, 도감 | 완료 |
| 셰프 시스템 | 5종 셰프(유키/라오 데이터 등록+잠금 표시, 스킬 로직 미구현), 패시브 + 액티브 스킬 (TD/영업) | 완료 |
| 상점 | 5탭 (업그레이드/레시피/테이블/인테리어/직원) | 완료 |
| 영업 심화 | 테이블 8석, 인테리어, 직원 2종, 특수손님, 이벤트 | 완료 |
| 사운드 | SFX 20종 + BGM 5종, 설정 UI | 완료 |
| VFX | 파티클, 스크린 효과, 플로팅 텍스트 | 완료 |
| 엔드리스 모드 | 무한 웨이브 TD, 데일리 스페셜, 로컬 랭킹 | 완료 |
| 월드맵 UI | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률 HUD, 엔드리스 섹션 | 완료 |
| 튜토리얼 개선 | 영업/상점/엔드리스 안내, 개별 플래그 | 완료 |
| UI/UX 폴리시 | 씬 전환, 버튼 스타일, 터치 피드백 통일 | 완료 |
| 성능 최적화 | 오브젝트 풀링, 불필요 렌더링 제거, 메모리 관리 | 완료 |
| 출시 준비 | 버전 표기(APP_VERSION), 전역 에러 핸들러, localStorage 용량 체크 | 완료 |
| 도구/행상인/채집 | 영구 도구 8종, 구매/판매/업그레이드, 행상인 UI, 재료 채집 TD, 도구 도감/팝업 | 완료 |
| 대화/스토리 | 스크립트 94종, 트리거 96항목, 선택지 분기, 초상화 6종, 14캐릭터 | 완료 |
| 영업 씬 비주얼 | 아이소메트릭 홀 (다이아몬드 격자, depth sorting, 에셋 15종, 홀 데코, 웜 다크 팔레트) | 완료 |
| 그룹2 콘텐츠 (7~15장) | 일식/중식/양식 아크, 적 16종+보스 4종, 레시피 80종, 대화 32종, 42스테이지 밸런스 검증 완료 | 완료 |
| 인도 아크 (16~18장, Phase 31~32) | 적 6종+보스 1종, 재료 4종, 레시피 35종, 대화 16종, 텔레포트/자가회복/혼란/원소저항/다단계 메커닉 | 완료 |
| 19장 선인장 칸티나 (Phase 33) | 대화 3종, 적 2종(taco_bandit/burrito_juggernaut), 재료 1종(jalapeno), 레시피 12종, 스테이지 19-1~19-5, 회피/돌진 메커닉 | 완료 |
| 20장 칸티나 심층부 (Phase 34) | 대화 3종, 적 2종(cactus_wraith/luchador_ghost), 재료 1종(avocado), 레시피 10종, 스테이지 20-1~20-5, thornReflect/taunt+dodge 메커닉 | 완료 |
| 21장 엘 디아블로 최종전 (Phase 35) | 대화 6종, 보스 1종(el_diablo_pepper), 레시피 10종, 스테이지 21-1~21-6, fireZone/소환/분노 메커닉, 멕시칸 아크(19~21장) 완결 | 완료 |

## 콘텐츠 규모

| 항목 | 수량 |
|------|------|
| 적 | 51종 (일반 38 + 미니보스 1 + 보스 12) |
| 도구 | 8종 (pan, salt, grill, delivery, freezer, soup_pot, wasabi_cannon, spice_grinder) |
| 재료 | 29종 |
| 레시피 | 254종 |
| 스테이지 | 138슬롯 (구현 완료: 1~7/9~13/15~21장, placeholder: 8/14/22~24장) |
| 셰프 | 5종 (꼬마/불꽃/얼음 + 유키/라오, 유키/라오는 데이터 등록 상태, 스킬 로직 미구현) |
| 세이브 버전 | v16 |

## 알려진 제약사항

- EndlessScene이 WaveManager를 MonkeyPatch로 연동 (공식 override API 없음)
- 온라인 랭킹 미구현, 엔드리스 ServiceScene은 1장 기준 config
- removeBuff()가 모든 멀티플라이어를 전역 초기화하므로, 디버프 동시 적용 시 먼저 만료된 디버프가 나머지도 해제할 수 있음 (기존 설계, 향후 멀티 버프 스택 구현 시 개선)
- cardamom.png 아이콘은 chai.png 복사본 placeholder (고유 아이콘 미생성)
- enemy_charge_impact 이벤트의 TowerManager 수신 로직 미구현 (돌진 시 타워 피해 미적용, 후속 페이즈에서 구현 필요)

## 향후 계획

- Phase 36~: 그룹3(22~24장) 확장. 상세: `docs/ROADMAP.md`
- Phase 28-3a: 8장 placeholder 스테이지 구현 (일식 아크 완성)
- Phase 28-4: 14장 placeholder 스테이지 구현 (양식 아크 중간)
