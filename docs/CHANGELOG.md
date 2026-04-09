# Changelog

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
