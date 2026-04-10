# Changelog

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
