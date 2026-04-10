# Kitchen Chaos Tycoon 기획서

> 최종 업데이트: 2026-04-10

## 프로젝트 개요

모바일 타워 디펜스 + 레스토랑 타이쿤 하이브리드 게임(구 Kitchen Chaos Defense). 영구 도구를 배치해 적을 처치하고 재료를 채집하는(재료 채집 페이즈) → 재료로 손님에게 요리를 서빙하여 골드를 획득하는(영업 페이즈) → 골드로 도구를 구매/업그레이드하는(행상인) 3단계 루프 구조. Phaser.js 3 기반 웹 게임, Android 우선 배포.

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
      WorldMapScene.js       # 월드맵 (6챕터 노드맵 + 스테이지 패널)
      StageSelectScene.js    # 스테이지 선택 (레거시, WorldMapScene으로 교체됨)
      ChefSelectScene.js     # 셰프 선택 (캠페인/엔드리스 분기)
      GatheringScene.js      # 재료 채집 페이즈 (TD, 도구 배치/회수/재배치)
      MarketScene.js         # TD 페이즈 (레거시, GatheringScene으로 교체됨)
      EndlessScene.js        # 엔드리스 TD 페이즈 (GatheringScene 상속)
      ServiceScene.js        # 영업 페이즈 (타이쿤, 골드→영구 저장)
      ResultScene.js         # 결과 화면 (캠페인/엔드리스 분기)
      MerchantScene.js       # 행상인 (도구 구매/판매/업그레이드)
      ShopScene.js           # 상점 (업그레이드/레시피/테이블/인테리어/직원)
      RecipeCollectionScene.js # 레시피 도감
    managers/
      SaveManager.js         # 세이브/로드 + 마이그레이션 (현재 v9)
      ToolManager.js         # 영구 도구 인벤토리 (구매/판매/업그레이드/스탯)
      WaveManager.js         # 웨이브 적 스폰 관리
      EndlessWaveGenerator.js # 엔드리스 무한 웨이브 생성기
      RecipeManager.js       # 레시피 해금/조리 관리
      SoundManager.js        # BGM/SFX 프로시저럴 생성
      VFXManager.js          # 파티클/스크린 효과/플로팅 텍스트
      ObjectPool.js          # 범용 오브젝트 풀 (성능 최적화)
      ChefManager.js         # 셰프 선택/스킬 관리
      OrderManager.js        # 오더(미션) 시스템
    data/
      gameData.js            # 적/도구(TOOL_DEFS)/재료/스테이지 정의
      recipeData.js          # 레시피 106종 정의
  assets/                    # 스프라이트/타일셋/아이콘
  tests/                     # Playwright 테스트
  docs/                      # 프로젝트 문서
```

### 핵심 모듈

| 모듈 | 파일 | 역할 |
|------|------|------|
| 재료 채집 | GatheringScene.js | 도구 배치/회수/재배치, 적 AI, 재료 드롭, 보스 재료 드롭, 웨이브 진행 |
| 도구 관리 | ToolManager.js | 영구 도구 인벤토리 (구매/판매/업그레이드/스탯 조회) |
| 행상인 | MerchantScene.js | 영업 후 도구 구매/판매/업그레이드 UI |
| 월드맵 | WorldMapScene.js | 6챕터 노드맵, 슬라이드업 스테이지 패널, 진행률 HUD |
| 엔드리스 | EndlessScene.js + EndlessWaveGenerator.js | 무한 웨이브 TD, 5웨이브마다 영업+행상인 삽입 |
| 영업 코어 | ServiceScene.js | 손님 입장/주문/조리/서빙/팁, 골드→영구 저장 |
| 결과 | ResultScene.js | 캠페인 별점/엔드리스 기록 표시, 행상인 방문 연결 |
| 세이브 | SaveManager.js | localStorage, 마이그레이션 체인 v1~v9 |
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
| 캠페인 | 6장 30스테이지, 보스 6종, 별점 시스템 | 완료 |
| 레시피 | 106종 (서빙 86 + 버프 20), 5등급, 도감 | 완료 |
| 셰프 시스템 | 3종 셰프, 패시브 + 액티브 스킬 (TD/영업 모두) | 완료 |
| 상점 | 5탭 (업그레이드/레시피/테이블/인테리어/직원) | 완료 |
| 영업 심화 | 테이블 8석, 인테리어, 직원 2종, 특수손님, 이벤트 | 완료 |
| 사운드 | SFX 20종 + BGM 5종, 설정 UI | 완료 |
| VFX | 파티클, 스크린 효과, 플로팅 텍스트 | 완료 |
| 엔드리스 모드 | 무한 웨이브 TD, 데일리 스페셜, 로컬 랭킹 | 완료 |
| 월드맵 UI | 6챕터 노드맵, 슬라이드업 스테이지 패널, 진행률 HUD, 엔드리스 섹션 | 완료 |
| 튜토리얼 개선 | 영업/상점/엔드리스 안내, 개별 플래그 | 완료 |
| UI/UX 폴리시 | 씬 전환, 버튼 스타일, 터치 피드백 통일 | 완료 |
| 성능 최적화 | 오브젝트 풀링, 불필요 렌더링 제거, 메모리 관리 | 완료 |
| 출시 준비 | 버전 표기(APP_VERSION), 전역 에러 핸들러, localStorage 용량 체크 | 완료 |
| 도구 시스템 | 영구 도구 6종, 구매/판매/업그레이드, ToolManager | 완료 |
| 행상인 | MerchantScene, 영업 후 도구 거래 UI | 완료 |
| 재료 채집 | GatheringScene, 골드 제거, 보스 재료 드롭, 도구 배치 전용 | 완료 |

## 콘텐츠 규모

| 항목 | 수량 |
|------|------|
| 적 | 22종 (일반 16 + 보스 6) |
| 도구 | 6종 (pan, salt, grill, delivery, freezer, soup_pot) |
| 재료 | 15종 |
| 레시피 | 106종 (서빙 86 + 버프 20) |
| 스테이지 | 30개 (6장) |
| 셰프 | 3종 |
| 세이브 버전 | v9 |

## 알려진 제약사항

- WaveManager에 공식 override API가 없어 EndlessScene이 MonkeyPatch로 연동 (WaveManager 변경 시 동기화 필요)
- 온라인 랭킹 미구현 (엔드리스는 로컬 기록만)
- 엔드리스 ServiceScene은 1장(stageId='1-1') 기준 config 사용
- WorldMapScene HUD 레시피 수집률 텍스트가 3자리 수("100/106")일 때 우측 끝 미세 클리핑 (LOW)
- StageSelectScene.js, MarketScene.js는 레거시로 유지 중 (각각 WorldMapScene, GatheringScene으로 교체됨)
- config.js의 STARTING_GOLD, WAVE_CLEAR_BONUS는 하위 호환용으로 유지 (GatheringScene/EndlessScene에서 미사용)
- Tower 엔티티의 hitArea가 Container 기반 Circle(0,0,20)로 설정되어 타워 바디 위치와 미세 불일치 가능 (LOW)

## 향후 계획

- Phase 13 완료 (도구 시스템 리워크, 행상인, 재료 채집).
- 상세: `docs/ROADMAP.md` 참조
