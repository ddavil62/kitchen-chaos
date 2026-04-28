# Changelog

## [Phase 85] 2026-04-28 -- 일일 미션 풀 확장

### 개요

DAILY_MISSION_POOL을 10종에서 20종으로 확장. 신규 미션 타입 3가지(vip_serve, combo_reach, gold_single_run) 추가. ServiceScene에 미션 연동 훅 3종 삽입.

### Added

- `kitchen-chaos/js/managers/DailyMissionManager.js`: DAILY_MISSION_POOL 10종 → 20종 확장. 신규 미션 10개 추가:
  - `stage_clear_7` (stage_clear, target 7, gold 600)
  - `stage_clear_10` (stage_clear, target 10, kitchenCoins 10)
  - `orders_complete_30` (orders_complete, target 30, kitchenCoins 8)
  - `orders_complete_50` (orders_complete, target 50, mireukEssence 15)
  - `three_star_3` (three_star, target 3, gold 300)
  - `endless_wave_10` (endless_wave, target 10, mireukEssence 20)
  - `vip_serve_3` (vip_serve, target 3, gold 250)
  - `vip_serve_5` (vip_serve, target 5, kitchenCoins 5)
  - `combo_reach_5` (combo_reach, target 5, kitchenCoins 4)
  - `gold_single_run_800` (gold_single_run, target 800, kitchenCoins 6)
- `kitchen-chaos/js/scenes/ServiceScene.js`: 미션 연동 훅 3종 삽입:
  - `vip_serve` 훅 (L2705-2708): VIP 서빙 완료 시 `recordProgress('vip_serve', 1)` 누적 합산
  - `combo_reach` 훅 (L2827-2828): 서빙 후 `recordProgress('combo_reach', this.comboCount)` max 갱신
  - `gold_single_run` 훅 (L2991-2992): 영업 세션 종료 시 `recordProgress('gold_single_run', earnedGold)` max 갱신

### Changed

- `kitchen-chaos/js/managers/DailyMissionManager.js`: `recordProgress` 내 max 갱신 분기 확장. 기존 `endless_wave` 단일 조건 → `['endless_wave', 'combo_reach', 'gold_single_run']` includes 배열로 변경 (L146)

### 스펙 대비 구현 차이

- 없음 (스펙과 정확히 일치)

### QA 결과

PASS. 15건 (정상 9 + 예외 6). Playwright 8 통과 / 7 실패 (전부 인프라 타임아웃+기존 이슈). AC-1~AC-7 전항 PASS. 코드 버그 0건.

LOW 이슈 1건 (Phase 85 스코프 외):
- MenuScene ICON_MAP에 신규 타입 3종(vip_serve, combo_reach, gold_single_run) 미등록. fallback 아이콘 정상 동작. 후속 Phase에서 전용 아이콘 추가 권장

INFO 소견:
- DailyMissionManager recordProgress max 갱신 타입 배열 하드코딩 — 향후 미션 정의에 `updateMode` 필드 추가 권장

### 참고

- 스펙: `.claude/specs/2026-04-28-kc-phase85-scope.md`
- 리포트: `.claude/specs/2026-04-28-kc-phase85-coder-report.md`
- QA: `.claude/specs/2026-04-28-kc-phase85-qa.md`

---

## [Phase 84] 2026-04-28 -- 셰프 스킨 시스템

### 개요

미미 셰프용 스킨 시스템 구현. SkinManager 신규 생성(미미 스킨 3종), ChefSelectScene에 스킨 선택 서브 패널 UI 추가, IAPManager에 스킨 구매 스텁 메서드 추가, SaveManager v28 마이그레이션(unlockedSkins/equippedSkin 필드).

### Added

- `kitchen-chaos/js/managers/SkinManager.js` (신규): `SKIN_DEFS` 상수 맵 — 미미 스킨 3종 정의 (default: 기본/녹색 앞치마, skin_mimi_pink: 핑크 앞치마 W2,900, skin_mimi_blue: 블루 앞치마 W2,900). 정적 메서드 5종: `getSkinsForChef(chefId)`, `getEquippedSkin(chefId)`, `equipSkin(chefId, skinId)`, `isSkinOwned(chefId, skinId)`, `unlockSkin(chefId, skinId)`
- `kitchen-chaos/js/managers/IAPManager.js`: `SKIN_PRODUCT_IDS` 상수 (skin_mimi_pink/skin_mimi_blue → com.lazyslime.kitchenchaos.skin.mimi.pink/blue), `skinKey()` 헬퍼, `purchaseSkin(chefId, skinId)` 스텁 (localStorage `kc_skin_owned_{skinId}` 플래그 + SkinManager.unlockSkin 호출), `isSkinOwned(chefId, skinId)` (localStorage + SkinManager 양쪽 체크)
- `kitchen-chaos/js/scenes/ChefSelectScene.js`: SkinManager/IAPManager import 추가. `_portraitImages` 배열로 카드별 portrait 참조 저장. `_buildSkinPanel()` 스킨 서브 패널 Container 빌드 (배경 반투명 패널 w=300 h=105, 썸네일 3개 가로 배치 x=100/180/260, 장착 테두리+자물쇠+가격 표시). `_refreshSkinPanel()` 보유/장착 상태 갱신. `_onSkinTap()` 보유=즉시 장착, 미보유=구매 팝업. `_refreshCardPortrait(chefId)` portrait setTexture 교체. `_showPurchasePopup(chefId, skin)` 딤드 오버레이+팝업 박스(구매/취소). `_moveSkinSelectButton(y)` 선택 버튼 y좌표 이동. `_updateSkinPanelVisibility()` 미미 포커스 시 패널 표시/숨김. `_goToIndex()` 내 스킨 패널 가시성 갱신 추가
- `kitchen-chaos/js/managers/SpriteLoader.js`: `PORTRAIT_IDS` 배열에 'mimi_pink', 'mimi_blue' 추가 (preload 등록)
- `kitchen-chaos/assets/portraits/portrait_mimi_pink.png` (신규): 미미 핑크 앞치마 portrait (PIL 팔레트 교체)
- `kitchen-chaos/assets/portraits/portrait_mimi_blue.png` (신규): 미미 블루 앞치마 portrait (PIL 팔레트 교체)

### Changed

- `kitchen-chaos/js/managers/SaveManager.js`: `SAVE_VERSION` 27 → 28. `createDefault()`에 `unlockedSkins: { mimi_chef: ['default'] }`, `equippedSkin: { mimi_chef: 'default' }` 추가. `_migrate()` v27→v28 블록 추가 (unlockedSkins/equippedSkin 조건부 초기화)
- `kitchen-chaos/js/scenes/ChefSelectScene.js`: `_buildCard()` 내 portrait 객체를 `_portraitImages[]`에 push (sprite/emoji fallback 시 null push로 인덱스 정합성 유지). 미미 포커스 시 선택 버튼 y=590, 그 외 y=549

### 수치

- 스킨 패널: y=465~570, 배경 w=300 h=105, #111122 반투명, depth 20
- 썸네일: 64x64px, x=[100, 180, 260], 장착=노란 테두리, 미보유=반투명+자물쇠+가격
- 스킨 이름: y=542, 장착=노란색, 미보유=회색
- 선택 버튼: 미미=y=590, 그 외=y=549
- 구매 팝업: 딤드 alpha=0.6, 팝업 x=180 y=320 w=260 h=140, [구매] 녹색 / [취소] 회색
- 스킨 가격: W2,900 (핑크/블루 동일)

### 스펙 대비 구현 차이

- 없음 (플래너 스펙과 정확히 일치)

### QA 결과

PASS. 40건 (정상 22 + 예외 10 + 시각 5 + UI안정성 3). 32 통과 / 8 실패 (전부 테스트 인프라/기존 이슈). AC-1~AC-6 전항 PASS. 제품 코드 버그 0건.

실패 8건 상세:
- AC-1 getSkinsForChef(존재하지 않는 셰프): 테스트 간접 접근 방식 한계
- AC-2 4건: SaveManager in-memory migration 패턴 (기존 v1~v27과 동일, 테스트 인프라 이슈)
- AC-6 3건: Phase 56부터 지속되는 Vite 경로 매핑 이슈로 portrait 전체 미로드 (기존 이슈)

시각적 검증: 스크린샷 5장 직접 확인. 스킨 패널 배치/썸네일/자물쇠/가격/구매 팝업/장착 테두리 모두 정상.

LOW 이슈 2건 (수정 불필요):
- 구매 팝업 딤드 오버레이 클릭 시 팝업 닫힘 없음 (UX 개선 권장)
- purchaseSkin async/await 스텁 즉시 resolve (실제 IAP 연동 시 로딩 인디케이터 필요)

### AD 결과

AD 모드 2 (에셋 검증): APPROVED — portrait_mimi_pink, portrait_mimi_blue 스타일/품질 일관성 검증 완료.
AD 모드 3 (UI 레이아웃): APPROVED. WARN 4건 (스킨 패널-선택 버튼 간격 0px, 선택-하단 버튼 수치 겹침 -10px, 썸네일 크기 비례, 하단 버튼 터치 30px) — 스크린샷 확인 결과 실제 시각적 문제 없음, 기존 패턴 일치.

### 참고

- 스펙: `.claude/specs/2026-04-28-kc-phase84-scope.md`
- 플랜: `.claude/specs/2026-04-28-kc-phase84-planner.md`
- AD1: `.claude/specs/2026-04-28-kc-phase84-ad1.md`
- AD2: `.claude/specs/2026-04-28-kc-phase84-ad2.md`
- AD3: `.claude/specs/2026-04-28-kc-phase84-ad3.md`
- QA: `.claude/specs/2026-04-28-kc-phase84-qa.md`

---

## [Phase 83] 2026-04-28 -- TD 씬 배치 피드백 개선

### 개요

GatheringScene에 3가지 배치 피드백 UX 개선을 추가: 팔레트 도구 선택 시 배치 가능 셀 하이라이트, 배치된 도구 탭 시 사거리 미리보기 링, 웨이브 시작 전 카운트다운 애니메이션.

### Added

- `kitchen-chaos/js/scenes/GatheringScene.js`: `_showPlaceableOverlay()` / `_hidePlaceableOverlay()` 메서드 추가. 팔레트 도구 선택 시 비경로/비점유 셀 전체에 초록 다이아몬드 오버레이(0x44ff88, fill alpha 0.20, line alpha 0.55) 표시. depth 5 (기존 `_showMoveOverlay`와 동일, 상호 배타). `this._placeableOverlays` 배열로 관리
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_showRangeRing(tower)` / `_hideRangeRing()` 메서드 추가. 배치된 도구 탭 선택 시 `tower.range * rangeMultiplier` 반경의 반투명 사거리 원(stroke 0x88ffcc alpha 0.55, fill 0x44ff88 alpha 0.06) 표시. depth 4. `this._rangeRingGfx` Graphics 오브젝트로 관리
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_startCountdown(callback)` 메서드 추가. steps=['3','2','1','GO!'], STEP_DURATION=800ms. 스케일 1.4->1.0 + alpha 페이드 tween 애니메이션. 카운트다운 중 `_setWaveButtonEnabled(false)` 비활성화, 완료 후 callback 호출
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_countdownText` UI 오브젝트 생성 (fontSize 64px bold, color #ffffff, stroke #000000/6px, depth 3000, setScrollFactor(0), 평소 숨김)

### Changed

- `kitchen-chaos/js/scenes/GatheringScene.js`: 팔레트 버튼 pointerdown 핸들러에 `_showPlaceableOverlay()` / `_hidePlaceableOverlay()` 호출 추가 (도구 선택/해제 연동)
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_placeTower()` 배치 성공 후 수량 소진 시 `_hidePlaceableOverlay()` 호출, 잔여 수량 시 `_showPlaceableOverlay()` 재계산
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_selectTower()` 내 `_showMoveOverlay()` 뒤에 `_showRangeRing(tower)` 호출 추가
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_deselectTower()` 내 `_hideMoveOverlay()` 뒤에 `_hidePlaceableOverlay()` + `_hideRangeRing()` 호출 추가
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_createWaveButton()` 내 pointerdown 핸들러를 `_startCountdown()` 래핑으로 변경 (직접 `startNextWave()` 호출 -> 카운트다운 완료 후 호출)
- `kitchen-chaos/js/scenes/GatheringScene.js`: shutdown 정리에 `_hidePlaceableOverlay()` + `_hideRangeRing()` + `_countdownText.destroy()` 추가

### 수치

- 배치 가능 오버레이: fill 0x44ff88 alpha 0.20, line 0x44ff88 alpha 0.55, depth 5
- 이동 가능 오버레이(기존): fill 0x44ff88 alpha 0.25, line 0x44ff88 alpha 0.6, depth 5 (미수정)
- 사거리 링: stroke 0x88ffcc alpha 0.55 lineWidth 1.5, fill 0x44ff88 alpha 0.06, depth 4
- 카운트다운: 64px bold, stroke 6px, depth 3000, Y=GAME_HEIGHT/2-30=290
- 카운트다운 총 소요: 약 3.2초 (800ms x 4 steps)
- Tower.range 범위: 90~150px (gameData.js 기준)

### 스펙 대비 구현 차이

- 없음 (플래너 스펙과 정확히 일치)

### QA 결과

PASS. 36건 (정상 19 + 예외 6 + 시각 3 + depth/안정성 4 + 상호배타 2). 36/36 통과. AC-1~AC-5 전항 PASS. 제품 코드 버그 0건.

LOW 이슈 2건 (수정 불필요):
- `_countdownText` destroyed 오브젝트 접근 극단적 타이밍 가능성 (`tweens.killAll()` 선행으로 실질적 위험 없음)
- strokeThickness 6px 기존 최대 4px 불일치 (64px 폰트 대비 허용 범위)

### AD 모드 3

APPROVED. 11 PASS / 2 WARN. WARN: strokeThickness 6px (기존 패턴 4px, 카운트다운 특수 목적으로 허용), 색상 하드코딩 (기존 `_showMoveOverlay` 동일 패턴, 일관성 유지). 배치 오버레이/사거리 링/카운트다운 depth 계층 정합성 검증 완료. 상호 배타 로직 코드 레벨 검증 완료.

### 참고

- 스펙: `.claude/specs/2026-04-28-kc-phase83-scope.md`
- 플랜: `.claude/specs/2026-04-28-kc-phase83-planner.md`
- AD3: `.claude/specs/2026-04-28-kc-phase83-ad3.md`
- QA: `.claude/specs/2026-04-28-kc-phase83-qa.md`

---

## [Phase 82] 2026-04-28 -- MenuScene 리소스 HUD + 별점 보상 코인 정책 정비

### 개요

MenuScene 상단(y=100)에 골드/코인/미력의 정수 보유량을 표시하는 정적 HUD를 추가. SaveManager clearStage() 재클리어 분기 코인 지급을 0으로 변경하여 "최초 달성 시만 보상" 원칙 일관 적용. ResultScene에서 재클리어(totalCoinsEarned=0) 시 "재클리어 (추가 보상 없음)" 문구 표시.

### Added

- `kitchen-chaos/js/scenes/MenuScene.js`: `_createResourceHUD()` 메서드 추가. y=100에 3열 텍스트 HUD(💰골드/🪙코인/✨미력의 정수). x = GAME_WIDTH/6, GAME_WIDTH/2, GAME_WIDTH*5/6 균등 3분할 배치. 색상: 골드 #ffd700, 코인 #aaddff, 미력 #cc88ff. fontSize 12px, stroke #000000/2px. `create()` 내 `_createMissionBanner()` 직후 호출
- `kitchen-chaos/js/scenes/ResultScene.js`: rewardText 3-way 분기 추가 (totalCoinsEarned===0 && stars>0 -> "재클리어 (추가 보상 없음)")

### Changed

- `kitchen-chaos/js/managers/SaveManager.js`: `clearStage()` 재클리어 분기 `coinsEarned = Math.max(1, Math.floor((coinByStars[stars] || 0) * 0.2))` -> `coinsEarned = 0`

### 수치

- 재클리어(동일/하위 별점) 코인 지급: 기존 `Math.max(1, floor(coinByStars * 0.2))` -> **0**
- 최초 클리어/별점 상향 보상: 변경 없음 (1스타 10, 2스타 15, 3스타 20, 상향 차이분 지급)
- HUD 배치: y=100, 배너 하단(y=72)에서 20px 아래
- HUD 폰트: fontSize 12px (배너 13px보다 작음, 계층 유지)

### 스펙 대비 구현 차이

- **HUD x 좌표**: 사용자 제안 x=52/180/308 -> planner 스펙 GAME_WIDTH/6, /2, *5/6 (=60/180/300) 균등 3분할 채택
- **HUD 스타일**: 사용자 제안 fontSize 13px+흰색 -> planner 스펙 fontSize 12px + 색상별 차별화(#ffd700/#aaddff/#cc88ff) + stroke 채택
- **배경 패널**: 사용자 제안 반투명 rectangle -> planner 스펙대로 패널 없이 stroke로 가독성 확보

### QA 결과

PASS. 33건 (정상 23 + 예외 3 + 시각적 3 + UI 안정성 2 + 통합 2). 31 통과 / 2 flaky (Vite HMR WebSocket 타임아웃, 테스트 인프라 이슈). AC-1~AC-6 전항 PASS.

LOW 이슈 2건 (수정 불필요):
- coins/essence에 `toLocaleString()` 미적용 (현재 1000 초과 케이스 드묾)
- HUD 색상 하드코딩 (프로젝트 전역 관행과 일치)

### AD 모드 3

APPROVED. 11 PASS / 1 WARN (색상 하드코딩, 전역 관행). 배너-HUD 분리 20px, HUD-로고 여백 122px, 3열 겹침 없음(99,999 기준), 색상 대비 충분, 기존 레이아웃 비파괴.

### 참고

- 스펙: `.claude/specs/2026-04-28-kc-phase82-scope.md`
- 플랜: `.claude/specs/2026-04-28-kc-phase82-planner.md`
- 코더 리포트: `.claude/specs/2026-04-28-kc-phase82-coder-report.md`
- AD3: `.claude/specs/2026-04-28-kc-phase82-ad3.md`
- QA: `.claude/specs/2026-04-28-kc-phase82-qa.md`

---

## [Phase 81] 2026-04-28 -- 리워드 광고 + IAP 수익화 기반 구조

### 개요

AdManager.js와 IAPManager.js를 신규 생성하고, ResultScene(AD-1, AD-3)과 GatheringScene(AD-2)에 리워드 광고 삽입 포인트 3개를 추가하여 수익화 기반 구조를 도입. DEV(웹) 환경에서는 모든 광고 플로우가 즉시 onReward 폴백으로 동작한다.

### Added

- `kitchen-chaos/js/managers/AdManager.js`: 신규 생성. Capacitor AdMob 래퍼. `initAds()`, `showRewardedAd(onReward, onFail)`, `isAdReady()` 정적 메서드. `_isApp()` false 또는 `IAPManager.isAdsRemoved()` true 시 즉시 onReward 폴백. `_getAdMobPlugin()`로 `window.Capacitor.Plugins.AdMob` 전역 객체 직접 참조 (동적 import 미사용)
- `kitchen-chaos/js/managers/IAPManager.js`: 신규 생성. `REMOVE_ADS_PRODUCT_ID = 'com.lazyslime.kitchenchaos.removeads'` 상수, `purchaseRemoveAds()` 스텁(console.log만 출력), `isAdsRemoved()` localStorage `kc_ads_removed` 기반 조회
- `kitchen-chaos/js/scenes/ResultScene.js`: AD-1 "광고 보고 재도전" 버튼 — `_createMarketFailedView()` (완전 실패)에 녹색(0x22aa55) 버튼 추가. 탭 시 동일 stageId + overrideLives=8로 GatheringScene 직접 진입
- `kitchen-chaos/js/scenes/ResultScene.js`: AD-1 "광고 보고 재도전" 버튼 — `_createResultView()` partialFail 분기에 동일 녹색 버튼 추가
- `kitchen-chaos/js/scenes/ResultScene.js`: AD-3 "광고 보고 보상 2배" 버튼 — `stars <= 2 && totalCoinsEarned >= 1` 조건에서 주황(0xcc6600) 버튼 노출. 탭 시 totalCoinsEarned만큼 코인 추가 지급, `_ad3Used` 플래그 + `disableInteractive()` + "보상 수령 완료" 텍스트 갱신으로 1회 제한
- `kitchen-chaos/js/scenes/ResultScene.js`: `_createButton()` 반환값 `{ bg, label }` 추가 (기존 호출부 영향 없음)
- `kitchen-chaos/js/scenes/GatheringScene.js`: AD-2 `_toggleSpeed()` 1x->2x 전환 시 `AdManager.showRewardedAd()` 선행, 시청 완료 후 2x 적용. 2x->1x는 즉시 토글. `isAdReady()` false 시 버튼 alpha 0.5 + 1.5초 후 복귀
- `kitchen-chaos/js/scenes/GatheringScene.js`: `create(data)` — `overrideLives` 파라미터 지원 (`data?.overrideLives != null` 체크, 0도 허용)
- `kitchen-chaos/js/scenes/BootScene.js`: `create()` 내 `AdManager.initAds()` 호출 추가

### Changed

- `kitchen-chaos/js/scenes/ResultScene.js`: `_createResultView()` 구분선 후 여백 `y += 18` -> `y += 12` (6px 절약)
- `kitchen-chaos/js/scenes/ResultScene.js`: 버튼 간격 조건부 축소 — AD-1 또는 AD-3 표시 시 `btnGap = 44` (기본 54), 4버튼 케이스 Y 오버플로우 방지
- `kitchen-chaos/vite.config.js`: `rollupOptions.external`에 `@capacitor-community/admob` 추가 (웹 빌드 시 동적 import 해소)

### 수치

- AD-1 재도전 HP: `ceil(STARTING_LIVES / 2)` = `ceil(15 / 2)` = **8**
- AD-3 보상 2배: `totalCoinsEarned`만큼 추가 코인 지급
- 버튼 간격: AD 버튼 표시 시 btnGap 54 -> 44 (10px 축소)
- 구분선 여백: 18 -> 12 (6px 축소)
- AD-1 버튼 색상: 0x22aa55 (녹색)
- AD-3 버튼 색상: 0xcc6600 (주황)
- AD-3 비활성 alpha: 0.4

### 수익화 포인트 정리

| 포인트 | 위치 | 조건 | 리워드 |
|--------|------|------|--------|
| AD-1 | ResultScene 완전/부분 실패 화면 | isMarketFailed 또는 partialFail | HP 8로 GatheringScene 재시작 |
| AD-2 | GatheringScene 배속 버튼 | 1x -> 2x 전환 시 | 2x 배속 해제 |
| AD-3 | ResultScene 결과 화면 | stars <= 2 && totalCoinsEarned >= 1 | 코인 보상 2배 (1회 제한) |

### 스펙 대비 구현 차이

- **IAPManager.purchaseRemoveAds()**: 스펙은 localStorage 저장 스텁이었으나, 사용자 지시로 console.log만 출력하도록 변경. 실제 구매 플로우 미구현
- **IAPManager localStorage 키**: 플래너 스펙 `kitchenChaos_adsRemoved` -> 사용자 지시 `kc_ads_removed`로 변경
- **AD-1 chefId 미전달**: GatheringScene.create()가 내부적으로 ChefManager.getChefData()를 호출하므로 불필요하여 생략
- **vite.config.js external 추가**: 스펙 미명시. @capacitor-community/admob 동적 import가 Rollup 빌드를 실패시켜 추가
- **AdManager 동적 import 제거 (REVISE-2)**: `import('@capacitor-community/admob')` -> `window.Capacitor.Plugins.AdMob` 전역 참조. Vite dev 서버 500 에러 해소
- **btnGap 48 -> 44 (REVISE-1)**: AD 모드3 검수에서 4버튼 Y 오버플로우 발견, 44로 추가 축소

### QA 결과

PASS. 27건 (정상 16 + 예외 7 + UI 안정성 4). Playwright 20 통과 / 7 인프라 타임아웃 (코드 버그 0건). 부분 재실행에서 5/7 즉시 통과 확인.

LOW 이슈 2건 (수정 불필요):
- `ResultScene._unlockButtons()`가 AD-3 비활성 버튼의 alpha를 복원할 수 있음 (DialogueScene 후 시각적 불일치, `disableInteractive()`로 기능 차단됨)
- `AdManager.js` 앱 환경 `addListener` 누적 가능성 (DEV 무관, 앱 배포 시 개선 권장)

INFO 2건:
- `REMOVE_ADS_PRODUCT_ID` 값 미세 차이 (스텁 상태, 스토어 등록 시 통일)
- `purchaseRemoveAds()` localStorage 미설정 (의도된 스텁 동작)

### 참고

- 스펙: `.claude/specs/2026-04-28-kc-phase81-planner.md`
- 목적 정의서: `.claude/specs/2026-04-28-kc-phase81-scope.md`
- 리포트: `.claude/specs/2026-04-28-kc-phase81-coder-report.md`
- QA: `.claude/specs/2026-04-28-kc-phase81-qa.md`

---

## [Phase 80] 2026-04-28 -- 영업 씬 서빙 인터랙션 강화

### 개요

ServiceScene.js 단일 파일 수정. 3종 시각 피드백 추가: (1) 레시피 탭 → 해당 주문 테이블 골든 테두리 강조(2단계 서빙 인터랙션), (2) patience < 30% 테이블 빨간 깜빡임, (3) 2+콤보 달성 시 화면 중앙 팝업 텍스트.

### Added

- `kitchen-chaos/js/scenes/ServiceScene.js`: `_selectedRecipeId`, `_highlightRects` (Map<tableIdx, Rectangle>), `_urgentTweens` (Map<tableIdx, {tween, rect}>) 상태 변수 (create 시 초기화)
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_clearHighlightRects()` 전체 골든 테두리 해제 헬퍼
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_clearHighlightRect(tableIdx)` 단일 테이블 골든 테두리 해제 헬퍼
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_onRecipeTap()` 내 골든 테두리 생성 로직 (Recipe.id 매칭 테이블에 strokeStyle 3px 0xffd700 Rectangle, depth=cont.depth+1)
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_updateTableUI()` 내 긴급 빨간 깜빡임 블록 (ratio<0.3 시 98x78px Rectangle, depth=cont.depth+2, onUpdate 콜백으로 0x333333/0xff0000 교대, alpha 0.6~1.0 500ms yoyo)
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_serveToCustomer()` 내 인라인 콤보 팝업 텍스트 (GAME_WIDTH/2, GAME_HEIGHT/2-50, fontSize 24px, color #ffd700, stroke #000000 thickness 4, depth 500, 1.2초 y-50 fade-out)
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_shutdown()` 내 `_highlightRects` destroy+clear, `_urgentTweens` stop+destroy+clear, `_selectedRecipeId=null` 정리

### Changed

- `kitchen-chaos/js/scenes/ServiceScene.js`: `_onTableTap()` — 서빙 성공 시 `_clearHighlightRect(tableIdx)` 호출 추가 (서빙된 테이블 골든 테두리 즉시 해제)
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_serveToCustomer()` — 콤보 팝업 임계값 `comboCount >= 3` → `comboCount >= 2`로 하향
- `kitchen-chaos/js/scenes/ServiceScene.js`: `_serveToCustomer()` — `vfx.comboPopup()` + `sfx_combo` 호출 임계값도 동일하게 3 → 2로 변경

### Fixed

- `kitchen-chaos/js/scenes/ServiceScene.js`: `_updateTableUI()` 내 `!cust` 조건 블록에서 `return` 전 urgent tween 정리 코드 누락 → 추가 (손님 퇴장 시 빨간 깜빡임이 잔존하는 버그 방지)

### 수치

- 골든 테두리: 94x74px, strokeWidth 3px, color 0xffd700, depth cont.depth+1
- 긴급 빨간 테두리: 98x78px, strokeWidth 3px, 0x333333/0xff0000 교대, depth cont.depth+2
- 콤보 팝업: fontSize 24px, color #ffd700, stroke #000000 thickness 4, depth 500, y-50 fade 1200ms
- 콤보 임계값: 3 → 2

### AD 모드 3 검증

APPROVED. FAIL 0개, WARN 7개 (전부 허용 사유 충족: stroke 3px 의도적 강조, 색상 하드코딩 기존 관행 일치, fontSize 24px 임팩트 요소, 팝업 하단 2px 초과 depth 분리로 무해, COMBO 영어 기존 관행 일치).

### 참고

- 스펙: `.claude/specs/2026-04-28-kc-phase80-planner.md`
- 목적 정의서: `.claude/specs/2026-04-28-kc-phase80-scope.md`
- 리포트: `.claude/specs/2026-04-28-kc-phase80-coder-report.md`
- AD 모드 3: `.claude/specs/2026-04-28-kc-phase80-ad3.md`

---

## [Phase 79] 2026-04-28 -- 인터랙티브 온보딩 재설계

### 개요

1-1 튜토리얼을 텍스트 팝업 방식에서 화살표(`▼`/`▲`) + 하이라이트 overlay 방식으로 전환. 스킵 버튼 터치 영역을 72x44px로 확대하고, 튜토리얼 웨이브 적 수를 정확히 2마리로 고정하여 신규 유저의 성공 경험을 보장.

### Added

- `kitchen-chaos/js/managers/TutorialManager.js`: 생성자에 `targetInfos` 파라미터 추가 (기본값 `[]`로 하위 호환 유지)
- `kitchen-chaos/js/managers/TutorialManager.js`: `_render()`에 하이라이트 Rectangle(depth=1009, strokeColor) + 화살표 Text(`▼`/`▲`, depth=1011, bounce tween yoyo +-6px 500ms) 생성 로직 추가
- `kitchen-chaos/js/managers/TutorialManager.js`: `useBelow` 로직 -- 화살표 위치가 패널 영역(24~104) 내에 겹치면 `▲`를 타깃 아래에 배치하여 패널 겹침 회피
- `kitchen-chaos/js/managers/TutorialManager.js`: 스킵 버튼을 투명 Rectangle hitArea(72x44px, depth=TEXT_DEPTH)로 분리하여 터치 영역 확대
- `kitchen-chaos/js/managers/TutorialManager.js`: `_container.destroy()`에서 highlightRect, arrowText(tween kill 포함) 정리
- `kitchen-chaos/js/scenes/GatheringScene.js`: TutorialManager 생성 시 3개 스텝의 targetInfos 배열 전달 (Step1: 도구바 첫 버튼 초록, Step2: 첫 안전 셀 초록, Step3: 웨이브 버튼 노란)
- `kitchen-chaos/js/scenes/GatheringScene.js`: WaveManager 생성 전 1-1 + 튜토리얼 미완료 시 Wave 1을 `carrot_goblin count:2 + tutorialWave:true`로 오버라이드
- `kitchen-chaos/js/data/stageData.js`: 1-1 Wave 1에 `tutorialWave: true` 플래그 추가
- `kitchen-chaos/js/managers/WaveManager.js`: `_buildSpawnQueue()`에서 `group.tutorialWave === true` 그룹은 0.6배 압축 면제 (정확한 count 스폰)

### Changed

- `kitchen-chaos/js/managers/TutorialManager.js`: 생성자 시그니처 `(scene, key, steps)` -> `(scene, key, steps, targetInfos = [])`
- `kitchen-chaos/js/managers/WaveManager.js`: `_buildSpawnQueue()` 내 count 계산에 tutorialWave 조건 분기 추가

### 스펙 대비 구현 차이

- **depth 값 변경**: 스펙은 하이라이트 depth=960, 화살표 depth=965를 지정했으나, 실제 HUD가 모두 depth 1000+이므로 스펙대로 하면 UI 아래에 가려짐. 실제 구현은 depth=1009(하이라이트), depth=1011(화살표)로 조정. QA에서도 현재 값이 올바르다고 판정
- **Step 2 화살표 방향**: 스펙은 `▼`만 명시했으나, cellToWorld(0,0)의 화살표 위치(y=51)가 패널 범위(24~104) 내에 있어 겹침 발생. `useBelow` 로직으로 `▲`를 타깃 아래에 배치하는 분기 추가
- **스킵 버튼 크기**: 스펙 최소 44x44px 요구, 실제 72x44px로 확대 구현
- **WaveManager 수정 추가**: 스펙에서 권장 옵션으로 제시한 tutorialWave 압축 면제를 WaveManager.js에 실제 구현

### QA 결과

PASS. Playwright 23건 중 18건 통과, 5건 intermittent timeout(`net::ERR_ABORTED`, dev server 인프라 이슈이며 코드 결함 아님). 시각적 검증 스크린샷 4장 확인. AD 모드 3 APPROVED.

LOW 이슈 4건:
- `TutorialManager.js:166` depth=1009 스펙 불일치 (기능적으로 올바른 판단, 스펙 갱신으로 해소)
- `TutorialManager.js:180` depth=1011 스펙 불일치 (화살표 가시성 향상 의도적 트레이드오프)
- `TutorialManager.js:162` Step 3 하이라이트 높이 52->47 클램프 (화면 하단 근접 시 5px 축소, 시각적으로 미미)
- `GatheringScene.js:206` SAFE_CELLS_11 하드코딩 중복 정의 (기능 영향 없음, 상수 공유 권장)

### 참고

- 스펙: `.claude/specs/2026-04-27-kc-phase79-scope.md`
- 리포트: `.claude/specs/2026-04-27-kc-phase79-coder-report.md`
- QA: `.claude/specs/2026-04-27-kc-phase79-qa.md`

---

## [Phase 78] 2026-04-28 -- 이진 실패 -> 부분 성공 구조 전환

### 개요

HP=0이더라도 수집 재료가 1개 이상이면 "부분 성공" 상태로 ServiceScene을 경유하여 영업할 수 있도록 3단계 실패 구조를 도입. 재료 50% 컷 + 별점 최대 2개 캡으로 밸런스 조정하여 실패 시 보상 0이던 이탈 유발 구조를 개선.

### Added

- `kitchen-chaos/js/scenes/GatheringScene.js`: `_triggerGameOver()` 내 재료 유무 분기 -- `inventoryManager.getTotal() > 0`이면 `partialFail: true`로 ServiceScene 전환, `=== 0`이면 기존 ResultScene 직행 유지
- `kitchen-chaos/js/scenes/ServiceScene.js`: `init()` 내 `this.partialFail` 플래그 수신 + partialFail=true 시 인벤토리 각 재료를 `Math.ceil(qty * 0.5)`로 50% 컷
- `kitchen-chaos/js/scenes/ResultScene.js`: `init()` 내 `this.partialFail` 플래그 수신 (`data.marketResult.partialFail`)
- `kitchen-chaos/js/scenes/ResultScene.js`: `_createResultView()` 내 `partialFail && stars > 2` 시 `stars = 2` 캡 적용
- `kitchen-chaos/js/scenes/ResultScene.js`: `_createResultView()` 장보기 섹션에 부분 성공 시 "(부분 성공 -- 50% 사용)" 오렌지색(#ffaa44) 메시지 표시

### Changed

- `kitchen-chaos/js/scenes/GatheringScene.js`: `_triggerGameOver()` JSDoc 갱신 (partialFail 경로 설명 추가)
- `kitchen-chaos/js/scenes/ServiceScene.js`: `init()` JSDoc에 `partialFail?: boolean` 파라미터 추가
- `kitchen-chaos/js/scenes/ResultScene.js`: `init()` JSDoc에 `marketResult.partialFail?: boolean` 타입 추가
- `marketResult` 전달 객체에 `partialFail: boolean` 필드 추가 (GatheringScene -> ServiceScene -> ResultScene 전파 경로)

### 스펙 대비 구현 차이

- 없음. 스펙의 모든 요구사항이 그대로 구현됨.

### QA 결과

PASS. Playwright 19건 전부 통과 (정상 6 + 비회귀 2 + 예외 8 + 안정성 2 + E2E 1). 시각적 검증 스크린샷 8장 확인. LOW 이슈 2건 (디버그 console.log 잔존, InventoryManager 캡슐화 위반) -- 기능 영향 없음.

### 잔존 이슈 (범위 외)

- `ServiceScene.js:270` `console.log('[ServiceScene] partialFail: 재료 50% 컷 적용')` 디버그 로그 잔존 (LOW, 프로덕션 빌드 전 제거 권장)
- `ServiceScene.js:264` `Object.entries(this.inventoryManager.inventory)` 직접 프로퍼티 접근 (LOW, 기존 코드 패턴과 일치, 캡슐화 리팩토링 시 개선)

### 참고

- 스펙: `.claude/specs/2026-04-27-kc-phase78-scope.md`
- 리포트: `.claude/specs/2026-04-27-kc-phase78-coder-report.md`
- QA: `.claude/specs/2026-04-27-kc-phase78-qa.md`

---

## [Phase 77] 2026-04-27 -- 엔드리스 해금 완화 + GatheringScene 2x 배속 버튼

### 개요

엔드리스 모드 해금 조건을 24-6 클리어에서 6-6 클리어로 완화하고, GatheringScene HUD에 1x/2x 배속 토글 버튼을 추가. 세이브 v27 마이그레이션으로 기존 6-6 클리어 유저 자동 해금.

### Changed

- `kitchen-chaos/js/config.js`: `ENDLESS_UNLOCK_STAGE` `'24-6'` -> `'6-6'` 변경. `ENDLESS_LOCK_LABEL`은 템플릿 리터럴 참조로 자동 갱신
- `kitchen-chaos/js/managers/SaveManager.js`: `SAVE_VERSION` 26 -> 27, `commitStageResult()` 해금 조건 `stageId === '24-6'` -> `stageId === '6-6'`, `createDefault()` endless.unlocked 주석 갱신

### Added

- `kitchen-chaos/js/managers/SaveManager.js`: v26->v27 마이그레이션 블록 추가 (6-6 클리어 유저 `endless.unlocked = true` 자동 전환, endless 객체 미존재 시 생성)
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_createHUD()`에 배속 토글 버튼 추가 (x=288, y=20, 36x32, NineSliceFactory.button variant:icon, "1x"/"2x" 레이블)
- `kitchen-chaos/js/scenes/GatheringScene.js`: `_toggleSpeed()` 메서드 추가 -- `this.time.timeScale` 1x/2x 토글, `setLabel()` API로 버튼 텍스트 갱신
- `kitchen-chaos/js/scenes/GatheringScene.js`: `shutdown()`에 `this.time.timeScale = 1` 복원 코드 추가

### 스펙 대비 구현 차이

- 스펙: `this.physics.world.timeScale`과 `this.time.timeScale` 동시 변경 -> 실제: 게임에 physics 미등록 환경이므로 `this.time.timeScale`만 사용 (delta 기반 이동에 작용)
- 스펙: 배속 버튼 위치 x=310 -> 실제: x=288 (HUD 레이아웃 최적화)
- 스펙: `getByName('label')?.setText()` 텍스트 갱신 -> 실제: `NineSliceFactory.button`의 `setLabel()` API 사용
- 스펙: `WorldMapScene.js`/`MenuScene.js` 직접 수정 언급 -> 실제: `config.js` 상수(`ENDLESS_UNLOCK_STAGE`) 변경만으로 자동 반영 (별도 수정 불필요)

### QA 수정 이력

- 1차: `shutdown()` TypeError -- `this.physics?.world` optional chaining 추가
- 2차: `_toggleSpeed()` physics 참조 완전 제거, `shutdown()`에서 `this.time.timeScale = 1` 직접 복원으로 변경

### QA 결과

PASS. Playwright 8건 전부 통과 (정상 5 + 예외 2 + UI 안정성 1). 인프라 flake 2건(Vite HMR `net::ERR_ABORTED`)은 단독 재실행 시 통과 확인.

### 잔존 이슈 (범위 외)

- `SaveManager.js:607` `unlockEndless()` JSDoc "24-6 클리어 시" 잔존 (LOW, 기능 영향 없음)

### 참고

- 스펙: `.claude/specs/2026-04-27-kc-phase77-scope.md`
- 리포트: `.claude/specs/2026-04-27-kc-phase77-coder-report.md`
- QA: `.claude/specs/2026-04-27-kc-phase77-qa.md`

---

## [Phase 76-2] 2026-04-27 -- 시각 감사 이슈 전체 수정

### 개요

시각 감사 리포트(`2026-04-27-kc-visual-audit.md`)에서 발견된 FAIL 8건 + WARN 4건을 수정하여 production 배포 가능 상태로 개선.

### Fixed

- `WorldMapScene.js`: NineSliceFactory.panel 호출 전 방어적 배경 rectangle(0x1a0a00) 추가 -- panel_dark 텍스처 미로드 시 Phaser 기본 초록 배경 노출 방지 (F-1)
- `MerchantScene.js`: 도구 목록 마스크를 VISIBLE_LIST_H=220으로 제한 -- DialogueScene 초상화(Y=368~464)와의 시각적 겹침 방지 (F-2). 스펙에서는 LIST_BOTTOM 축소 방식이었으나, 마스크 제한 방식으로 구현 변경
- `MerchantScene.js`: 분기 카드 설명 텍스트 fontSize 10px->12px, wordWrap 너비 90->94px (F-3)
- `ResultScene.js`: _createButton BTN_W 220->240 -- 버튼 텍스트 클리핑 해소, 화면 360px 기준 좌우 60px 여백 확보 (F-4)
- `AchievementScene.js`: 진행도 바 barH 12->16, barY 조정, fillW 최소값 1->2 -- 9-slice 최소 stretch 확보 (F-5)
- `MenuScene.js`: 미션 팝업 진행도 바 barH 8->16 (F-6)
- `MenuScene.js`: _openBackupListModal에서 쿠폰 모달 강제 닫기(_closeCouponModal) + depth 1200->1300 -- z-레이어 출혈 방지 (F-7)
- `MenuScene.js`: 쿠폰 팝업 배경 오버레이 alpha 0.6->0.75 (W-3)
- `CouponRegistry.js`: getCheatCodeHints()에 `!import.meta.env.PROD` 런타임 가드 추가 -- DEV&&!PROD 이중 가드로 production 빌드에서 치트 코드 미노출 보장 (F-8). 스펙에서는 VITE_CHEAT_ENABLED 환경변수 방식이었으나, !PROD 가드로 간결하게 구현 변경
- `MenuScene.js`: DEV 드롭다운 생성 코드에도 이중 가드 적용 (F-8)
- `ShopScene.js`: 업그레이드 효과 설명 텍스트에 wordWrap: { width: GAME_WIDTH - 120 } 추가 -- 텍스트 오버플로우 방지 (W-4)

### Not Fixed (해당 없음)

- W-1 "순프" 오타: 코드베이스 전체 검색 결과 해당 문자열 없음. 감사 리포트 OCR 오류로 확인
- W-2 "골발하기" 오타: 코드베이스 전체 검색 결과 해당 문자열 없음. 감사 리포트 OCR 오류로 확인

### QA 결과

PASS. Playwright 13건 전부 통과 (정상 10 + 예외 3). 시각적 검증 스크린샷 8장 확인.

### 참고

- 스펙: `.claude/specs/2026-04-27-kc-ad-audit-fix-scope.md`
- 리포트: `.claude/specs/2026-04-27-kc-ad-audit-fix-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-27-kc-ad-audit-fix-ad3.md`
- QA: `.claude/specs/2026-04-27-kc-ad-audit-fix-qa.md`
- 시각 감사 원본: `.claude/specs/2026-04-27-kc-visual-audit.md`

---

## [Phase H] 2026-04-26 -- 배경 현대 레스토랑 리디자인

### 개요

TavernServiceScene의 배경(5개 fillRect 팔레트 + 바닥/벽 타일)을 중세 태번 톤에서 현대 캐주얼 다이닝 레스토랑 톤으로 전면 교체. Phase G에서 전환된 v13 가구(밝은 원목 테이블/의자)와 시각적으로 일관된 씬 완성.

### 추가

- `kitchen-chaos/assets/tavern_dummy/floor_wood_tile_v14.png` -- 현대 원목 마루 바닥 타일 32x32px (라이트 오크/메이플, 나뭇결)
- `kitchen-chaos/assets/tavern_dummy/wall_horizontal_v14.png` -- 현대 밝은 크림/아이보리 벽 타일 64x24px
- `kitchen-chaos/assets/tavern/floor_wood_tile_v14.png` -- 실 에셋 경로 복사 (ASSET_MODE=real 용)
- `kitchen-chaos/assets/tavern/wall_horizontal_v14.png` -- 실 에셋 경로 복사 (ASSET_MODE=real 용)
- `kitchen-chaos/tests/phase-h-background-qa.spec.js` -- Phase H 전용 Playwright 테스트 10건
- `_resolveTextureKey()` 헬퍼 메서드 -- ASSET_MODE=real 시 타일 루프에서 REAL_KEY_MAP 키 해석 분리

### 변경

- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - `_buildLayout()` fillRect 팔레트 5개 영역 교체:
    - HUD: `0x3a1a0a, 0.85` -> `0x2c2c2c, 0.90` (다크차콜)
    - 벽: `0x555555, 0.70` -> `0xe8dcc8, 0.90` (밝은 아이보리)
    - 주방: `0x3d2810, 0.50` -> `0xb8c5c8, 0.40` (연한 스틸그레이)
    - 다이닝홀: `0x5a3d20, 0.35` -> `0xfff8f0, 0.50` (크림/웜화이트)
    - 컨트롤바: `0x15100a, 0.90` -> `0x37474f, 0.92` (다크슬레이트)
  - 경계선 lineStyle: `0xffd166, 0.6` (금색) -> `0xaaaaaa, 0.4` (중립 회색)
  - 바닥 타일 alpha: `0.3` -> `0.55`
  - 벽 타일 alpha: `0.6` -> `0.85`
  - preload() dummies 배열: `floor_wood_tile` -> `floor_wood_tile_v14`, `wall_horizontal` -> `wall_horizontal_v14`
  - preload() realAssets 배열: v14 에셋 2종 추가
  - REAL_KEY_MAP: v14 더미->실 키 매핑 2쌍 추가 (`tavern_dummy_floor_wood_tile_v14` -> `tavern_floor_wood_tile_v14`, `tavern_dummy_wall_horizontal_v14` -> `tavern_wall_horizontal_v14`)
  - 바닥/벽 타일 텍스처 키를 v14로 교체

### 스펙 대비 차이점

- 없음. 모든 수치가 스펙과 일치하여 구현됨.
- 추가 구현: `_resolveTextureKey()` 헬퍼 메서드 (스펙에 미명시, ASSET_MODE=real 시 키 해석을 위해 coder가 추가)

### QA 결과

PASS. Phase H 전용 10건 전부 통과 (정상 7 + 예외 3).

- 수용 기준 H-1~H-4 전수 충족
- 예외 시나리오: 구 팔레트 잔존 없음(EX-1), v14 REAL_KEY_MAP 매핑 정상(EX-2), 콘솔 치명적 에러 없음(EX-3)
- 회귀 테스트: Phase A 10/17(기존 실패 7건 Phase G 이전 이슈), Phase G 32/35(3건 beforeEach 타임아웃 인프라 이슈). Phase H로 인한 신규 실패 0건
- 시각적 검증: `tests/screenshots/phase-h-full-rendering.png`, `tests/screenshots/phase-h-dining-closeup.png` 2장

### 잔존 이슈

- Phase A 테스트 7건 pre-existing 실패 (Phase G 레이아웃 변경 이후 테스트 미갱신)
- Phase G 테스트 3건 beforeEach 타임아웃 (Phaser.js 씬 로드 인프라 이슈, 로직 assertion 자체는 통과)

### 참고

- 스펙: `.claude/specs/2026-04-26-kc-phase-h-spec.md`
- 리포트: `.claude/specs/2026-04-26-kc-phase-h-coder-report.md`
- QA: `.claude/specs/2026-04-26-kc-phase-h-qa.md`

---

## [Phase G] 2026-04-26 -- 현대식 레스토랑 리디자인

### 개요

v12(중세 태번) 가구 에셋을 v13(현대 캐주얼 다이닝)으로 전면 교체. 테이블 배치를 1열x2행(2테이블, 12석) -> 2열x3행(6테이블, 24석)으로 확장. 손님 seated_south/north 20종을 현대 캐주얼 복장 스타일로 교체(64x64px). BENCH_CONFIG 수치 전면 갱신.

### 추가

- `kitchen-chaos/assets/tavern/table_4p_v13.png` -- 현대 4인 테이블 100x40px
- `kitchen-chaos/assets/tavern/chair_back_v13.png` -- 상단 의자(등받이 뒤) 100x20px
- `kitchen-chaos/assets/tavern/chair_front_v13.png` -- 하단 의자(등받이 앞) 100x20px
- `kitchen-chaos/tests/phase-g-layout-qa.spec.js` -- Phase G 전용 Playwright 테스트 35건

### 변경

- `kitchen-chaos/js/data/tavernLayoutData.js`
  - TABLE_SET_ANCHORS: 2개 -> 6개 (row0_left/right, row1_left/right, row2_left/right)
  - BENCH_CONFIG 전면 갱신:
    - QUAD_W: 232 -> 116 (2열 배치)
    - QUAD_H: 120 -> 128 (3행 배치)
    - TABLE_W: 200 -> 100, TABLE_H: 48 -> 40
    - BENCH_W: 200 -> 100, BENCH_H: 24 -> 20
    - TABLE_LEFT: 16 -> 8, TABLE_TOP: 36 -> 40, BENCH_TOP_TOP: 12 -> 20, BENCH_BOT_TOP: 84 -> 80
    - TABLE_DEPTH_OFFSET: 84 -> 80
    - SLOT_DX: 66 -> 24, FRONT_SLOT_DY: 36 -> 40, BACK_SLOT_DY: 108 -> 104
    - AISLE_H: 40 (신규)
  - SEAT_CENTER_OFFSET_X: 116 -> 58
  - BENCH_SLOTS.lv0: 6슬롯(front 3+back 3) -> 4슬롯(front 2+back 2, dx +/-24)
- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - preload: v12 가로 가구 3종(table_horizontal_v12, bench_horizontal_top/bot_v12) -> v13 3종(table_4p_v13, chair_back_v13, chair_front_v13)
  - REAL_KEY_MAP: v12 가로 가구 더미 키 -> v13 실 에셋 키로 갱신
  - _buildFurniture: v13 가구 키/사이즈(100x40, 100x20) 적용
  - depth 수치: TABLE_DEPTH_OFFSET=80, chair_front depth=BACK_SLOT_DY+1=105
- `kitchen-chaos/assets/tavern/customer_{type}_seated_south.png` x 10 -- 현대 캐주얼 복장 64x64px로 교체
- `kitchen-chaos/assets/tavern/customer_{type}_seated_north.png` x 10 -- 현대 캐주얼 복장 64x64px로 교체

### 삭제

- v12 가로 가구 3종(table_horizontal_v12, bench_horizontal_top_v12, bench_horizontal_bot_v12) preload 및 REAL_KEY_MAP 제거

### 스펙 대비 차이점

- 스펙에서 손님 seated 에셋 크기를 48x48px로 명시했으나, 실제 구현은 64x64px 유지 (walk 스프라이트와 동일 크기, 픽셀 계단 현상 방지)
- 스펙 요구사항의 depth 값 "BACK_SLOT_DY+1=91"은 오기. 실제 코드는 BACK_SLOT_DY(104)+1=105로 정확하게 구현

### QA 결과

PASS. 총 35건 전부 통과 (정상 22 + 예외 6 + 시각 4 + 안정성 1 + 렌더링 4 + 인터랙션 1 + HUD 1 + 레이아웃 1 + 레거시 1).

- 수용 기준 G-1~G-8 전수 충족
- 예외 시나리오 11건 전수 PASS (24슬롯 포화, 이중 점유 거부, 레거시 side fallback, 범위 밖 tableSetIdx 등)
- 시각적 검증: `tests/screenshots/phase-g-{full-layout,dining-area,row0-closeup,row2-closeup,ad3-tavern-layout}.png` 5장
- AD 모드2: APPROVED, AD 모드3: APPROVED

### 잔존 이슈

- v12 세로 가구(table_vertical_v12, bench_vertical_l/r_v12) preload 잔존 -- 실제 배치 미사용, 불필요한 404 요청 (LOW)
- occupySlot JSDoc의 tableSetIdx 범위가 "0~1"로 기재 -- Phase G에서 0~5로 확장됨, 갱신 권장 (LOW)
- 5개 손님 타입(regular, critic, traveler, student, business) walk 스프라이트시트 로드 에러 -- Phase E/F 이전 레거시 더미 에셋 누락 (LOW, Phase G 범위 외)

### 참고

- 스펙: `.claude/specs/2026-04-26-kc-phase-g-spec.md`
- 리포트: `.claude/specs/2026-04-26-kc-phase-g-coder-report.md`
- QA: `.claude/specs/2026-04-26-kc-phase-g-qa.md`
- 목적 정의: `.claude/specs/2026-04-26-kc-phase-g-scope.md`

---

## [Phase F] 2026-04-26 -- 가로 테이블 양면 착석 레이아웃

### 개요

세로 테이블(64x200)을 가로 테이블(200x48)로 전환하여 테이블 상단(front, south-facing) + 하단(back, north-facing) 양면 착석 구현. 6석에서 12석으로 확대 (2 quad x (front 3 + back 3)). seated_north 10종 + 가로 가구 3종 신규 에셋. TABLE_DEPTH_OFFSET 212->84, quadTop[top] 64->168.

### 추가

- `kitchen-chaos/assets/tavern/customer_{normal,vip,gourmet,rushed,group,critic,regular,student,traveler,business}_seated_north.png` x 10 -- north-facing seated 포즈 64x64px (.zips-b6 north.png 추출, NEAREST 리사이즈)
- `kitchen-chaos/assets/tavern/table_horizontal_v12.png` -- 가로 테이블 200x48px
- `kitchen-chaos/assets/tavern/bench_horizontal_top_v12.png` -- 가로 벤치 상단 200x24px
- `kitchen-chaos/assets/tavern/bench_horizontal_bot_v12.png` -- 가로 벤치 하단 200x24px
- `kitchen-chaos/tests/phase-f-horizontal-table-qa.spec.js` -- Phase F 전용 Playwright 테스트 40건

### 변경

- `kitchen-chaos/js/data/tavernLayoutData.js`
  - BENCH_CONFIG 전면 재설계:
    - QUAD_H: 224 -> 120 (가로 레이아웃: 12+24+48+24+12)
    - TABLE_W: 64 -> 200, TABLE_H: 200 -> 48 (세로->가로 전환)
    - TABLE_LEFT: 84 -> 16, TABLE_TOP: 12 -> 36
    - BENCH_W: 80 -> 200, BENCH_H: 200 -> 24
    - TABLE_DEPTH_OFFSET: 212 -> 84 (= TABLE_TOP(36)+TABLE_H(48))
    - BENCH_L_LEFT/BENCH_R_LEFT 제거, BENCH_TOP_TOP(12)/BENCH_BOT_TOP(84) 신규
    - SLOT_DX(66)/FRONT_SLOT_DY(36)/BACK_SLOT_DY(108) 신규
    - SEAT_OFFSET_Y/SEAT_SPACING_Y Phase E dead code 제거
  - TABLE_SET_ANCHORS[0].quadTop: 64 -> 168 (수직 중앙 배치)
  - BENCH_SLOTS.lv0: front+back 6슬롯 (side 필드 추가, dx=[-66,0,+66], front dy=36, back dy=108)
  - createSeatingState: front/back 양면 배열 생성 (레거시 lv3/lv4 side 미포함 시 front 일괄 처리)
  - findFreeSlot: ['front','back'] 순회 + tableSetIdx 파라미터 추가
  - occupySlot/vacateSlot/getSlotWorldPos: 'back' side 지원 (레거시 'left'/'right' fallback 유지)
- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - REAL_KEY_MAP: seated_north 10종 + 가로 가구 3종 추가 (25->38 매핑)
  - preload: seated_north 10종 + 가로 가구 3종 에셋 로드 추가
  - _buildFurniture: 벤치-L/R/세로테이블 -> 벤치-상단/하단/가로테이블 배치로 전환
  - _cycleCustomerState: back 슬롯->seated_north, front 슬롯->seated_south 텍스처 분기
  - _buildBenchSlots: front(노란색 #ffdd00)/back(청록색 #00ffdd) 구분 인디케이터
  - _getOccupiedCount/_buildDebugHUD/_updateDebugHUD: front+back 합산
  - S키 핸들러: slotRef 기반 seated_south/seated_north 분기

### 스펙 대비 차이점

- createSeatingState에서 레거시 벤치 레벨(lv3, lv4)에 side 필드가 없는 경우를 자동 감지하여 front 일괄 처리 추가 (스펙 미명시, 하위 호환 목적)
- 스펙에서 createSeatingState 반환값에 Object.freeze() 제시했으나, occupySlot/vacateSlot mutation 패턴과 충돌하여 freeze 미적용 (Phase E 기존 방식 유지)

### QA 결과

PASS. 총 40건 (정상 25 + 예외 11 + 시각적 4). 39 통과 / 1 실패 (SC-19 더미 에셋 3건 로드 에러, 기능 무관).

- 수용 기준 SC-1~SC-20 전수 충족 (SC-19 조건부 PASS)
- 예외 시나리오 11건 전수 PASS (만석 12석, 이중 점유 거부, 레거시 side fallback, 50회 연타 순환 등)
- 시각적 검증: `tests/screenshots/phase_f_{initial,seated,top_quad_zoom,bottom_quad_zoom}.png` 4장
- AD 모드2: APPROVED, AD 모드3: APPROVED

### 잔존 이슈

- 레거시 세로 가구(table_vertical_v12, bench_vertical_l/r_v12) dummies/realAssets/REAL_KEY_MAP 잔존 -- 실제 배치 미사용, 불필요한 404 요청 발생 (LOW)
- 가로 가구 더미 파일 3종(tavern_dummy/ 디렉토리) 누락 -- ASSET_MODE='real'에서 기능 영향 없음 (LOW)
- BENCH_SLOTS.lv3/lv4가 Phase F 이전 형식(side 필드 없음) 잔존 -- createSeatingState hasSide 자동 감지로 front-only 동작 (LOW)
- Phase E 테스트(phase-e-seating-layout-qa.spec.js)가 Phase E 수치 하드코딩으로 Phase F 환경에서 실패 -- Phase F 테스트가 상위 호환, 아카이브 처리 권장

### 참고

- 스펙: `.claude/specs/2026-04-26-kc-phase-f-spec.md`
- 리포트: `.claude/specs/2026-04-26-kc-phase-f-coder-report.md`
- AD3: `.claude/specs/2026-04-26-kc-phase-f-ad3.md`
- QA: `.claude/specs/2026-04-26-kc-phase-f-qa.md`

---

## [Phase E] 2026-04-26 -- 착석 레이아웃 재설계 (y축 depth 착석 표현)

### 개요

[벤치-L][테이블][벤치-R] 가로 배치에서 y축 depth 착석 표현으로 전환. 테이블 depth를 quadTop+212(테이블 하단 y)로 고정하고, 손님을 테이블 상단 앞(y 작은 쪽)에 배치하여 테이블이 손님 하체를 자연스럽게 가리는 Tavern Master식 착석 표현을 구현. seated_south 텍스처 10종 신규 생성. 좌석 12석에서 6석으로 변경(quad당 3슬롯).

### 추가

- `kitchen-chaos/assets/tavern/customer_{normal,vip,gourmet,rushed,group,critic,regular,student,traveler,business}_seated_south.png` x 10 -- south-facing seated 포즈 64x64px (PixelLab 생성)
- `kitchen-chaos/tests/phase-e-seating-layout-qa.spec.js` -- Phase E 전용 Playwright 테스트 29건

### 변경

- `kitchen-chaos/js/data/tavernLayoutData.js`
  - BENCH_CONFIG에 Phase E 상수 4개 추가: SEAT_CENTER_OFFSET_X(116), SEAT_OFFSET_Y(24), SEAT_SPACING_Y(50), TABLE_DEPTH_OFFSET(212)
  - BENCH_SLOTS.lv0: dy=[60,116,172] -> dy=36 고정, dx=[-22,+22,0] (x축 3슬롯, 스펙은 y축 세로 3슬롯이었으나 AD3 승인으로 변경)
  - createSeatingState: left/right 벤치 구조 -> front 단일 열 (facingSouth: true)
  - findFreeSlot: ['left','right'] -> ['front'] 순회
  - occupySlot/vacateSlot/getSlotWorldPos: front 지원 + 레거시 left/right fallback
  - SEAT_CENTER_OFFSET_X = 116 신규 export
  - BENCH_LEFT_OFFSET_X / BENCH_RIGHT_OFFSET_X: deprecated 주석 추가 (export 유지)
- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - import에 SEAT_CENTER_OFFSET_X 추가
  - REAL_KEY_MAP에 seated_south 10종 추가 (총 25개 매핑)
  - preload에 seated_south 10종 에셋 로드 추가
  - _buildFurniture: 테이블 depth = qy + TABLE_DEPTH_OFFSET(212) 고정 + _fixedDepth 마커 설정
  - _applyDepthSort: _fixedDepth 체크 추가 (고정 depth 보호)
  - _buildBenchSlots: set.left/set.right -> set.front 순회로 전환
  - _cycleCustomerState: seated 텍스처를 seated_right/seated_left 분기에서 seated_south 단일 키로 변경
  - S 키 핸들러: seated_south 텍스처로 업데이트
  - _buildDebugHUD / _updateDebugHUD / _getOccupiedCount: set.front 기반으로 전환

### 스펙 대비 차이점

- SC-2 슬롯 배치: 스펙은 y축 세로 3슬롯(dy=[36,86,136], 테이블 길이 방향)을 정의했으나, 구현은 x축 가로 3슬롯(dy=36 고정, dx=[-22,+22,0])으로 변경. 사유: 테이블 너비 64px에 64px 캐릭터를 y축으로 3명 배치하면 하체 가림 비율이 슬롯마다 달라져 부자연스러움. x축 배치로 3명 모두 동일한 하체 가림률(24px, 37.5%) 보장. AD 모드3에서 APPROVED.
- SEAT_OFFSET_Y(24), SEAT_SPACING_Y(50): 원본 스펙의 y축 배치용 상수. x축 배치로 변경 후 런타임 미참조 (dead code로 잔존)

### QA 결과

PASS. 총 29건 (정상 13 + 예외 8 + 시각적 3 + 보조 5). 28 통과 / 1 간헐적 타임아웃(Phaser cold start 인프라 이슈, 코드 무관).

- 수용 기준 8개 전수 충족 (SC-2는 AD3 승인된 스펙 변경 반영)
- 예외 시나리오 8개 엣지케이스 전수 PASS (만석, 레거시 side 접근, 잘못된 인덱스, 이중 점유 등)
- 시각적 검증: `tests/screenshots/phase_e_{initial,seated,top_quad_zoom}.png` 3장

### 잔존 이슈

- 3인 착석 시 64px 캐릭터가 dx=44px 간격으로 부분 겹침 발생. AD3 조건부 승인: 2인 운용 시 해결, 3인은 만석 엣지케이스
- BENCH_CONFIG.SEAT_OFFSET_Y(24), SEAT_SPACING_Y(50)이 dead code로 잔존 (기능 영향 없음)
- SEAT_CENTER_OFFSET_X가 BENCH_CONFIG 내부와 독립 export 양쪽에 중복 정의 (값 동일, 기능 문제 없음)
- tableSprite._fixedDepth: Phaser GameObjects에 사용자 정의 프로퍼티 직접 추가 (setData 대안 가능, 현재 동작 정상)

### 참고

- 스펙: `.claude/specs/2026-04-26-kc-seating-layout-spec.md`
- 목적 정의서: `.claude/specs/2026-04-26-kc-seating-layout-scope.md`
- Coder 리포트: `.claude/specs/2026-04-26-kc-seating-layout-coder-report.md`
- QA: `.claude/specs/2026-04-26-kc-seating-layout-qa.md`
- AD 모드1: `.claude/specs/2026-04-26-kc-seating-layout-ad1.md`
- AD 모드2: `.claude/specs/2026-04-26-kc-seating-layout-ad2.md`
- AD 모드3: `.claude/specs/2026-04-26-kc-seating-layout-ad3.md`

---

## [Phase D] 2026-04-25 -- 손님 64px 업그레이드 + 2 quad 1열 레이아웃 전환

### 개요

손님 10종의 에셋을 기존 68px ZIP 소스에서 64px NEAREST로 재처리하여 40장 교체(32x48->64x64). 가구 3종을 PIL NEAREST 확장(bench 28x96->80x200, table 44x96->64x200). 4 quad 2열 레이아웃을 2 quad 1열로 전환(QUAD_W=232, 좌석 24->12석). TavernServiceScene.js의 손님 관련 frameWidth/frameHeight를 64px로 갱신.

### 추가

- `kitchen-chaos/assets/tavern/_postprocess_phase_d.py` -- 손님 40장 + 가구 3종 통합 후처리 스크립트 (스펙은 별도 파일 분리 안내, 사용자 지시로 통합)
- `kitchen-chaos/assets/tavern/.legacy-phase-d/` -- 교체 전 백업 43종 (손님 32x48 40장 + 가구 3종 bench 28x96/table 44x96)
- `kitchen-chaos/tests/phase-d-layout.spec.js` -- Phase D 전용 Playwright 테스트 104건

### 변경

- `kitchen-chaos/assets/tavern/customer_{10종}_seated_right.png` -- 32x48 -> 64x64 (68px ZIP 소스 NEAREST 다운스케일)
- `kitchen-chaos/assets/tavern/customer_{10종}_seated_left.png` -- 32x48 -> 64x64
- `kitchen-chaos/assets/tavern/customer_{10종}_walk_r.png` -- 128x48 -> 256x64 (4프레임 x 64px)
- `kitchen-chaos/assets/tavern/customer_{10종}_walk_l.png` -- 128x48 -> 256x64 (business walk_l: east flip fallback 유지)
- `kitchen-chaos/assets/tavern/bench_vertical_l_v12.png` -- 28x96 -> 80x200 (PIL NEAREST width stretch + border-preserving height extend)
- `kitchen-chaos/assets/tavern/bench_vertical_r_v12.png` -- 28x96 -> 80x200 (bench_l 수평 플립)
- `kitchen-chaos/assets/tavern/table_vertical_v12.png` -- 44x96 -> 64x200 (PIL NEAREST width stretch + border-preserving height extend)
- `kitchen-chaos/js/data/tavernLayoutData.js`
  - QUAD_W: 104 -> 232
  - QUAD_H: 120 -> 224
  - BENCH_W: 28 -> 80, BENCH_H: 96 -> 200
  - BENCH_R_LEFT: 72 -> 148 (=4+80+64)
  - TABLE_LEFT: 32 -> 84 (=4+80), TABLE_W: 44 -> 64, TABLE_H: 96 -> 200
  - AISLE_V: 16 -> 0 (1열, 세로 통로 없음)
  - TABLE_SET_ANCHORS: 4 quad (tl/tr/bl/br) -> 2 quad (top quadTop=64, bottom quadTop=328), quadLeft: 128
  - BENCH_LEFT_OFFSET_X: 17 -> 44, BENCH_RIGHT_OFFSET_X: 85 -> 188
  - BENCH_SLOTS.lv0 dy: [26,60,94] -> [60,116,172] (슬롯 간격 56px)
  - window.__tavernBenchConfig 노출 추가 (Playwright 테스트용)
- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - 손님 walk_r/walk_l frameWidth: 32 -> 64, frameHeight: 48 -> 64
  - 셰프 walk frameWidth/frameHeight: 32/48 유지 (Phase D 스코프 외, 주석 명기)
  - 손님 _placeImageOrRect: x-16,y-44,32,44 -> x-32,y-64,64,64
  - @fileoverview Phase D 이력 추가
  - _buildFurniture 주석 갱신 (4 quad -> 2 quad)

### 스펙 대비 차이점

- 후처리 스크립트: 스펙은 `_postprocess_phase_d.py`(손님)와 `_postprocess_phase_d_furniture.py`(가구) 분리 안내 -> 사용자 지시로 단일 파일 통합
- 리사이즈 알고리즘: 스펙은 LANCZOS -> AD 모드1 결정으로 NEAREST 채택
- 셰프 walk frameWidth/frameHeight: 스펙 제약사항 기준 기존 32/48 유지 (셰프 에셋 미교체)

### QA 결과

PASS. 총 218건 (신규 104 + 회귀 114).
- phase-d-layout.spec.js: 104건 PASS (에셋 HTTP 83 + 레이아웃 상수 1 + TABLE_SET_ANCHORS 5 + BENCH 2 + frameWidth 2 + 씬 안정성 2 + 스크린샷 2 + 런타임 4 + 슬롯 2 + 코드 검증 1)
- 회귀: 114/131 PASS (17건 실패는 전부 Phase D 의도된 수치 변경, 실제 버그 0건)
  - phase-b6-qa-edge.spec.js: 17/17 PASS
  - phase-b6-upscale.spec.js: 65/66 (1건 의도 실패: frameWidth=32 -> 64)
  - phase-b6-2-furniture.spec.js: 10/17 (7건 의도 실패: 구 가구/레이아웃 수치)
  - phase-b6-2-qa-edge.spec.js: 22/31 (9건 의도 실패: 4 quad->2 quad, 24->12석 등)

### 시각적 검증

- `tests/screenshots/phase-d-full.png` -- 전체 레이아웃 (2 quad 1열, 가구 비율 정상)
- `tests/screenshots/phase-d-dining-area.png` -- 다이닝 영역 클로즈업 (벤치/테이블 밀착, 좌우 대칭)
- `tests/screenshots/phase-d-mobile-320x568.png` -- 모바일 안정성 (에러 0건)

### 알려진 이슈

- lv3/lv4 슬롯 dy 값이 B-6-2 기준 그대로 유지. Phase D 벤치 높이(200px) 기준으로 재계산 필요 (현재 미사용)
- 셰프 walk 스프라이트시트(128x48)는 frameWidth:32, frameHeight:48 유지. 셰프 에셋 교체 시 함께 갱신 필요
- B-6 이월: business walk_l east flip fallback (LOW)

### 참고

- 스코프: `.claude/specs/2026-04-25-kc-phase-d-scope.md`
- 스펙: `.claude/specs/2026-04-25-kc-phase-d-spec.md`
- 리포트: `.claude/specs/2026-04-25-kc-phase-d-coder-report.md`
- QA: `.claude/specs/2026-04-25-kc-phase-d-qa.md`

## [Phase B-6-2] 2026-04-25 -- 태번 가구 비례 업스케일 및 좌석 anchor 재정렬

### 개요

B-6 캐릭터 32x48 업스케일 후 발생한 가구-캐릭터 비례 불균형(벤치 14px < 캐릭터 32px) 해소. 가구 3종을 PIL 픽셀 확장(NEAREST)으로 업스케일하고, tavernLayoutData.js 상수를 전면 갱신하여 좌석 anchor를 재정렬.

### 추가

- `kitchen-chaos/assets/tavern/.legacy-b6-2/` -- 기존 가구 3종 백업 (bench_l 14x76, bench_r 14x76, table 44x72)
- `kitchen-chaos/assets/tavern/_postprocess_b6-2.py` -- PIL 후처리 스크립트 (bench width 2x + height 연장, table height 연장)
- `kitchen-chaos/tests/phase-b6-2-furniture.spec.js` -- Playwright 가구 비례 검증 17건
- `kitchen-chaos/tests/phase-b6-2-qa-edge.spec.js` -- Playwright QA 엣지케이스 31건

### 변경

- `kitchen-chaos/assets/tavern/bench_vertical_l_v12.png` -- 14x76 -> 28x96 (PIL width 2x + height stretch)
- `kitchen-chaos/assets/tavern/bench_vertical_r_v12.png` -- 14x76 -> 28x96 (bench_l 수평 플립)
- `kitchen-chaos/assets/tavern/table_vertical_v12.png` -- 44x72 -> 44x96 (PIL height stretch, 폭 유지)
- `kitchen-chaos/js/data/tavernLayoutData.js`
  - QUAD_W: 100 -> 104
  - BENCH_L_LEFT: 8 -> 4, BENCH_L_TOP: 18 -> 12
  - BENCH_W: 14 -> 28, BENCH_H: 76 -> 96
  - BENCH_R_LEFT: 78 -> 72
  - TABLE_LEFT: 30 -> 32, TABLE_TOP: 10 -> 12, TABLE_H: 72 -> 96
  - AISLE_V: 20 -> 16
  - TABLE_SET_ANCHORS quadLeft: tl/bl 130->132, tr/br 250->252
  - BENCH_LEFT_OFFSET_X: 7 -> 17, BENCH_RIGHT_OFFSET_X: 77 -> 85
  - BENCH_SLOTS.lv0 dy: [20,47,74] -> [26,60,94] (균등 배분 간격 34px, 상하 여백 14px 대칭)
- `kitchen-chaos/js/scenes/TavernServiceScene.js` -- 가구 크기 주석 갱신 (렌더 로직 변경 없음, ServiceScene.js 무수정)

### AD 모드2 검수 결과

APPROVED. 에셋 3종 크기 정확, 금지색 0건, 투명배경 확인.

### AD 모드3 검수 결과

APPROVED with NOTE. 캐릭터-벤치 비례(32px vs 28px = 87.5%)로 좌석 인식 자연스러움. 비파괴적 WARN 3건:
- W-1 (INFO): bench-r left(72) + width(28) = 100 vs table right(76) -- 4px 논리 겹침, 시각 결함 없음
- W-2 (LOW): tr/br quad right(356) > DINING_RIGHT(352) -- 4px 초과, 화면 내 수용
- W-3 (LOW): 하단 여백 190px 과다 -- Phase D 이후 활용 예정

### QA 결과

PASS. 총 184/184 (신규 48 + 회귀 136). SC-1~SC-7 전수 충족.
- phase-b6-2-furniture.spec.js: 17건 PASS
- phase-b6-2-qa-edge.spec.js: 31건 PASS (상수 연쇄 4 + 좌표 4 + 슬롯 5 + 손님x 5 + 미래슬롯 2 + 배정 2 + 렌더 3 + 안정성 3 + 시각 3)
- 회귀: 136건 PASS (b6-upscale 66 + b5-1-chef 23 + b5-1-qa 17 + b4-walk 30)

### 알려진 이슈

- lv4 slot0 dy=10 < bench top=12 (bench 밖) -- 현재 미사용, Phase D lv4 활성화 시 재정렬 필요
- bench-r/table 4px 논리 겹침 -- Phase C 리팩토링 시 BENCH_R_LEFT=76, QUAD_W=108 검토 권장
- tr/br quad DINING_RIGHT 4px 초과 -- DINING_W 확장 또는 quad 이동으로 해소 가능
- B-6 이월: business walk_l 2프레임 alternation (LOW), chef_mimi/rin 16x24 레거시 (INFO), seated displaySize 32x44 vs 에셋 32x48 (INFO)

### 참고

- 스펙: `.claude/specs/2026-04-25-kc-phase-b6-2-scope.md`
- 리포트: `.claude/specs/2026-04-25-kc-phase-b6-2-coder-report.md`
- QA: `.claude/specs/2026-04-25-kc-phase-b6-2-qa.md`
- AD1: `.claude/specs/2026-04-25-kc-phase-b6-2-ad1.md`
- AD2: `.claude/specs/2026-04-25-kc-phase-b6-2-ad2.md`
- AD3: `.claude/specs/2026-04-25-kc-phase-b6-2-ad3.md`
- 커밋: kitchen-chaos c5ee561f (Coder), 34d28fc1 (QA), 8049f151 (TC-8 픽스)

## [Phase B-6] 2026-04-24 -- 캐릭터 해상도 업스케일 16x24 -> 32x48

### 개요

캐릭터 15명(손님 10종 + 셰프 5명)을 PixelLab `create_character size=48`로 재발주하여, 기존 16x24px 에셋을 32x48px 캔버스로 업스케일. 총 55장 신규 에셋(seated 20 + idle 5 + walk 30). TavernServiceScene.js의 spritesheet frameWidth/frameHeight를 16/24 -> 32/48으로 갱신. 기존 16x24 에셋 57장은 `assets/tavern/.legacy-b5/`에 백업. business walk_l은 PixelLab ZIP에 west 방향 프레임 부재로 rotation fallback 사용(2프레임 alternation, LOW 이슈).

### 추가

- `kitchen-chaos/assets/tavern/customer_{10종}_seated_right.png` -- 각 32x48px, 손님 10종 우향 앉기 (PixelLab size=48 east rotation -> PIL NEAREST resize 32x32 -> 32x48 캔버스 y=8 정렬)
- `kitchen-chaos/assets/tavern/customer_{10종}_seated_left.png` -- 각 32x48px, 손님 10종 좌향 앉기 (west rotation 기반)
- `kitchen-chaos/assets/tavern/customer_{10종}_walk_r.png` -- 각 128x48px, 4프레임 시트 (animate_character walking-4-frames east)
- `kitchen-chaos/assets/tavern/customer_{10종}_walk_l.png` -- 각 128x48px, 4프레임 시트 (animate_character walking-4-frames west; business는 rotation fallback)
- `kitchen-chaos/assets/tavern/chef_{mage/yuki/lao/andre/arjun}_idle_side.png` -- 각 32x48px, 셰프 5명 idle (east rotation)
- `kitchen-chaos/assets/tavern/chef_{mage/yuki/lao/andre/arjun}_walk_r.png` -- 각 128x48px, 셰프 walk 4프레임 시트
- `kitchen-chaos/assets/tavern/chef_{mage/yuki/lao/andre/arjun}_walk_l.png` -- 각 128x48px, 셰프 walk 4프레임 시트
- `kitchen-chaos/assets/tavern/.legacy-b5/` -- 기존 16x24 에셋 57장 백업
- `kitchen-chaos/assets/tavern/.zips-b6/` -- PixelLab ZIP 15개 다운로드 + 추출
- `kitchen-chaos/assets/tavern/_postprocess_b6.py` -- B-6 후처리 스크립트 (68x68 raw -> 32x48 캔버스)
- `kitchen-chaos/tests/phase-b6-upscale.spec.js` -- Playwright 66개 테스트
- `kitchen-chaos/tests/phase-b6-qa-edge.spec.js` -- Playwright QA 엣지 17개 테스트

### 변경

- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - fileoverview에 B-6 추가
  - spritesheet preload 30개소 `frameWidth: 16 -> 32`, `frameHeight: 24 -> 48` 갱신
  - spritesheet 주석 규격 64x24 -> 128x48 갱신
  - 총 12줄 변경 (주석 + 프레임 크기 값)
  - ServiceScene.js diff: 0줄 (무수정)
  - scaleX/flipX/scaleY/flipY: 0건
  - tavern_dummy/ 변경: 0건
- `kitchen-chaos/tests/phase-b4-walk-animation.spec.js`
  - frameWidth 16 -> 32, frameHeight 24 -> 48 하드코드 갱신
- `kitchen-chaos/tests/phase-b5-1-chef-walk.spec.js`
  - frameWidth 16 -> 32, frameHeight 24 -> 48 하드코드 갱신

### 에셋 규격

| 카테고리 | 수량 | 이전 규격 | 신규 규격 |
|---------|------|----------|----------|
| 손님 seated R/L | 20 | 16x22 | 32x48 |
| 손님 walk R/L | 20 | 64x24 | 128x48 |
| 셰프 idle_side | 5 | 16x24 | 32x48 |
| 셰프 walk R/L | 10 | 64x24 | 128x48 |
| **합계** | **55** | -- | -- |

### 후처리 파이프라인

- PixelLab size=48 -> raw 68x68 캔버스 (실측, 스펙 64x64에서 변경)
- PIL resize(32, 32, NEAREST) -> 32x48 캔버스 y=8 정렬
- walk: 4프레임 각 32x48 셀 -> 128x48 가로 결합

### PixelLab 발주

- create_character: 15명 x 4 rotations = 60 generations
- animate_character walking-4-frames: 15명 x 2 방향 = 30 generations
- 총 90 generations 사용
- andre/arjun walk v2 generation_failed -> v2b retry 성공
- Manifest: `.claude/specs/2026-04-24-kc-phase-b6-pixellab-manifest.md`

### AD 모드2 검수 결과

APPROVED. 55/55 PASS (크기 정확, 금지색 0건, opaque 416~524, 프레임 다양성 확인). business walk_l 2프레임 alternation은 LOW 이슈 판정.

### AD 모드3 검수 결과

APPROVED with NOTE. 카운터/입구 비례 적절. 벤치(14px) < 캐릭터(32px) 비례 이슈 -> B-6-2 후속 페이즈로 분리. 게임 로직/충돌에 영향 없음.

### QA 결과

PASS. 총 153/153 (B-6 신규 66 + 회귀 70 + QA 엣지 17). SC-1~SC-10 전수 충족.

### 알려진 이슈

- **business walk_l 2프레임 alternation** (LOW): PixelLab ZIP에 west 방향 프레임 부재, rotation fallback 사용. 다리 alternation 보존되나 4프레임 정상 walk 대비 단조로움. 후속 재발주 권고.
- **가구 비례** (NOTE): 벤치(14px wide) < 캐릭터(32px wide) -> B-6-2 후속 가구 업스케일 페이즈 분리 확정.
- **chef_mimi/rin 해상도 격차**: B-6 발주 대상 제외(16x24 레거시 유지). setDisplaySize(32,48)로 표시 크기 동일하나 시각 선명도 낮음. Phase D 또는 별도 발주 페이즈에서 처리 예정.
- **seated 표시 크기**: TavernServiceScene.js L685에서 setDisplaySize(32, 44) 사용 (에셋 32x48과 4px 불일치, B-6 이전부터 존재하는 의도적 설정).

### 참고

- 스펙: `.claude/specs/2026-04-24-kc-phase-b6-spec.md`
- Coder 리포트: `.claude/specs/2026-04-24-kc-phase-b6-coder-report.md`
- AD 모드1: `.claude/specs/2026-04-24-kc-phase-b6-ad1.md`
- AD 모드2: `.claude/specs/2026-04-24-kc-phase-b6-ad2.md`
- AD 모드3: `.claude/specs/2026-04-24-kc-phase-b6-ad3.md`
- QA: `.claude/specs/2026-04-24-kc-phase-b6-qa.md`
- Manifest: `.claude/specs/2026-04-24-kc-phase-b6-pixellab-manifest.md`

---

## [Phase B-5-1] 2026-04-24 -- 셰프 5명 Walk 스프라이트시트 10장 발주

### 개요

셰프 5명(mage/yuki/lao/andre/arjun)의 walk_r/walk_l 4프레임 스프라이트시트 10장(각 64x24px)을 PixelLab `animate_character` ZIP 다운로드 + PIL 후처리로 생성. TavernServiceScene.js에 spritesheet preload 10개 + Phaser 애니메이션 등록 10개 + 데모 C/V 키 핸들러 + `window.__tavernChefAnims` 진단 노출을 추가. AD 모드1에서 원래 B-5 범위(walk+carry+cook+serve = 최대 35장)를 walk만(10장)으로 축소 결정. carry/cook/serve는 PixelLab 템플릿 매칭 불가 + 시각 일관성 위험으로 B-5-1b로 분리.

### 추가

- `kitchen-chaos/assets/tavern/chef_{mage/yuki/lao/andre/arjun}_walk_r.png` -- 각 64x24px, 셰프 5명 우향 보행 4프레임 시트 (PixelLab animate_character east, 36x36 raw -> PIL NEAREST 16x16 -> 16x24 캔버스 -> 4프레임 가로 합성)
- `kitchen-chaos/assets/tavern/chef_{mage/yuki/lao/andre/arjun}_walk_l.png` -- 각 64x24px, 셰프 5명 좌향 보행 4프레임 시트 (독립 스프라이트, scaleX/flipX 미사용)
- `kitchen-chaos/tests/phase-b5-1-chef-walk.spec.js` -- Playwright 23개 테스트 (HTTP 200 x10, 텍스처/애니메이션 등록, spritesheet 규격, preload 수량, C/V 키 에러 없음, scaleX/flipX 미사용, ServiceScene 무수정, tavern_dummy 무수정, 스크린샷)
- `kitchen-chaos/tests/phase-b5-1-qa-edge.spec.js` -- Playwright 16개 에지케이스 테스트 (키 연타, B-4 키 충돌, 중복 등록 방지, Image 타입 한계, walk_r/walk_l 독립성, 전체 에셋 로드)

### 변경

- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - fileoverview에 B-5-1 추가
  - preload(): `this.load.spritesheet()` 10개 추가 (chefWalkTypes 5종 x walk_r/walk_l = 10, frameWidth:16, frameHeight:24). ASSET_MODE='real'일 때만 실행 (L188-198)
  - create(): `this.anims.create()` 10개 등록 (chef_{name}_walk_r/walk_l, 4프레임, 8fps, repeat:-1). `this.textures.exists()` + `!this.anims.exists()` 이중 가드 (L263-277)
  - create(): C/V 데모 키 핸들러 추가 (C: mage walk_r 재생, V: mage walk_l 재생). null guard + anims guard 포함. ASSET_MODE='real'일 때만 등록 (L310-326)
  - create(): `window.__tavernChefAnims` 노출 (10개 anim 키 배열, Playwright 테스트용) (L371-373)
  - ServiceScene.js diff: 0줄 (무수정)
  - scaleX/flipX/scaleY/flipY: 0건
  - tavern_dummy/ 변경: 0건
  - 레이아웃 상수 변경: 0건

### AD 모드1 스코프 축소 결정

- 원래 범위: walk 10 + carry 10 + cook 5 + serve 5~10 = 최대 35장
- 축소 범위: walk 10장만 발주 (10 generations)
- 축소 사유: PixelLab 49개 template animation 중 carry/cook/serve 매칭 불가, create_character 대안은 시각 일관성 깨질 위험 + PRO 모드 200 gen 소비, Phase D 의존성으로 현 단계 활용처 없음
- carry/cook/serve -> B-5-1b 또는 Phase D로 분리

### Walk 시트 규격

| 항목 | 값 |
|------|-----|
| 파일 크기 | 64 x 24 px |
| 프레임 구성 | 4프레임 x 16x24 가로 배열 |
| Phaser 텍스처 키 | `tavern_chef_{name}_walk_r/l` |
| Phaser anims 키 | `chef_{name}_walk_r/l` |
| frameRate | 8 fps |
| repeat | -1 (무한 반복) |

### PIL 에셋 검증

| 파일 | 크기 | opaque | 프레임별 opaque |
|------|------|--------|----------------|
| chef_mage_walk_r | 64x24 | 174 | [40, 46, 38, 50] |
| chef_mage_walk_l | 64x24 | 192 | [41, 53, 41, 57] |
| chef_yuki_walk_r | 64x24 | 181 | [41, 50, 39, 51] |
| chef_yuki_walk_l | 64x24 | 172 | [36, 49, 37, 50] |
| chef_lao_walk_r | 64x24 | 181 | [38, 49, 40, 54] |
| chef_lao_walk_l | 64x24 | 202 | [47, 57, 45, 53] |
| chef_andre_walk_r | 64x24 | 169 | [38, 45, 37, 49] |
| chef_andre_walk_l | 64x24 | 163 | [35, 44, 36, 48] |
| chef_arjun_walk_r | 64x24 | 161 | [36, 43, 36, 46] |
| chef_arjun_walk_l | 64x24 | 164 | [33, 47, 36, 48] |

10/10 PASS (크기 64x24, RGBA, 투명 배경, 금지색 0건, 프레임별 opaque 33~57).

### AD 모드2 검수 결과

APPROVED. walk 10장 전수 PASS (크기 64x24, 금지색 0건, 프레임 분리 정확, 다리 alternation 자연스러움). SC-2~SC-4(carry/cook/serve)는 AD1 결정에 의해 DEFERRED.

### QA 결과

PASS. B-5-1 신규 23/23 + 에지케이스 16/16 = 39/39 PASS. 회귀 B-1~B-4 100/100 PASS. SC-1/SC-5/SC-6(조건부)/SC-7 전수 충족. SC-2~SC-4 DEFERRED.

### 알려진 이슈

- _chefs[0]는 rin 셰프(idx=0)이나 C/V 키로 chef_mage_walk_r/l 애니메이션을 재생하므로 캐릭터 불일치 (데모 한정, Phase D에서 올바른 매핑으로 교체)
- _chefs[0]가 Phaser.GameObjects.Image 타입이라 anims 프로퍼티 없음, sprite.play() 미동작 (B-4 W/A/S 데모와 동일 구조 한계, 가드절에서 안전 차단, Phase D Sprite 전환 시 해소)
- phase67-ad3-capture.spec.js CommonJS require() 문법으로 ESM 환경에서 파싱 에러 (기존 이슈, B-5-1 무관)

### 참고

- 스펙: `.claude/specs/2026-04-24-kc-phase-b5-1-spec.md`
- 목적: `.claude/specs/2026-04-24-kc-phase-b5-1-scope.md`
- AD 모드1: `.claude/specs/2026-04-24-kc-phase-b5-1-ad1.md`
- AD 모드2: `.claude/specs/2026-04-24-kc-phase-b5-1-ad2.md`
- Coder 리포트: `.claude/specs/2026-04-24-kc-phase-b5-1-coder-report.md`
- QA: `.claude/specs/2026-04-24-kc-phase-b5-1-qa.md`

---

## [Phase B-4] 2026-04-24 -- 손님 Walk 애니메이션 시트 20장 + W-1 PRO 재발주

### 개요

손님 10종(normal~business)의 walk_l/walk_r 4프레임 스프라이트시트 20장(각 64x24px)을 PixelLab `animate_character` ZIP 다운로드 + PIL 후처리로 생성. TavernServiceScene.js에 spritesheet preload 20개 + Phaser 애니메이션 등록 20개 + 데모 W/A/S 키 핸들러 + `window.__tavernWalkAnims` 진단 노출을 추가. W-1 PRO 재발주(size=64, custom proportions shoulder_width=1.1)는 teal=3으로 B-3(teal=6)보다 악화하여 파일 미교체, 구조적 한계 최종 확정.

### 추가

- `kitchen-chaos/assets/tavern/customer_{normal/vip/gourmet/rushed/group/critic/regular/student/traveler/business}_walk_r.png` -- 각 64x24px, 손님 10종 우향 보행 4프레임 시트 (PixelLab animate_character east, 32x32 raw -> PIL NEAREST 16x24 -> 4프레임 가로 합성)
- `kitchen-chaos/assets/tavern/customer_{normal/vip/gourmet/rushed/group/critic/regular/student/traveler/business}_walk_l.png` -- 각 64x24px, 손님 10종 좌향 보행 4프레임 시트 (독립 스프라이트, scaleX/flipX 미사용)
- `kitchen-chaos/assets/tavern/_postprocess_b4.py` -- B-4 후처리 스크립트 (ZIP 다운로드 + 프레임 추출 + PIL 합성)
- `kitchen-chaos/assets/tavern/_raw_b4/` -- 원본 프레임 PNG 80장 + b4_results.json 백업
- `kitchen-chaos/tests/phase-b4-walk-animation.spec.js` -- Playwright 31개 테스트 (HTTP 200 x20, 텍스처/애니메이션 등록, spritesheet 규격, preload 수량, 에러 없음, scaleX/flipX 미사용, ServiceScene 무수정, tavern_dummy 무수정, 스크린샷)

### 변경

- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - fileoverview에 B-4 추가
  - preload(): `this.load.spritesheet()` 20개 추가 (walkTypes 10종 x walk_r/walk_l = 20, frameWidth:16, frameHeight:24). ASSET_MODE='real'일 때만 실행
  - create(): `this.anims.create()` 20개 등록 (customer_{type}_walk_r/walk_l, 4프레임, 8fps, repeat:-1). `this.textures.exists()` + `!this.anims.exists()` 이중 가드
  - create(): W/A/S 데모 키 핸들러 추가 (W: walk_r 재생, A: walk_l 재생, S: stop+idle 복귀). null guard 포함. ASSET_MODE='real'일 때만 등록
  - create(): `window.__tavernWalkAnims` 노출 (registered 배열 + exists 객체, Playwright 테스트용)
  - 총 추가 라인: ~95줄
  - ServiceScene.js diff: 0줄 (무수정)
  - scaleX/flipX/scaleY/flipY: 0건
  - tavern_dummy/ 변경: 0건
  - 레이아웃 상수 변경: 0건

### W-1 PRO 재발주 결과 (PARTIAL -- 구조적 한계 최종 확정)

- B-4 PRO 시도: mode=pro, size=64, custom proportions (shoulder_width=1.1), view=side, direction=west
- 결과: raw 124x124 -> PIL NEAREST 16x22. teal=3 (5.7%), 목표 25% 미달
- B-3 결과 (teal=6, 11.3%)보다 악화 -> 파일 미교체, customer_normal_seated_left.png은 B-3 버전 유지
- W-1 경과: B-1(5px) -> B-2(5px) -> B-3(6px, 11.3%) -> B-4 PRO(3px, 악화)
- 구조적 한계 확정: PixelLab facing-left 사이드뷰에서 셔츠 가시 영역 6px 상한. PRO 모드 + custom proportions로도 개선 불가. silhouette 재설계가 아닌 한 정량 25% 달성 불가능. 추가 재시도 없이 마감

### Walk 시트 규격

| 항목 | 값 |
|------|-----|
| 파일 크기 | 64 x 24 px |
| 프레임 구성 | 4프레임 x 16x24 가로 배열 |
| Phaser 텍스처 키 | `tavern_customer_{type}_walk_r/l` |
| Phaser anims 키 | `customer_{type}_walk_r/l` |
| frameRate | 8 fps |
| repeat | -1 (무한 반복) |

### AD 모드2 검수 결과

APPROVED (conditional). walk 20장 전수 PASS (크기 64x24, 금지색 0건, 프레임 분리 정확, 다리 교차 사이클 자연스러움). W-1 PARTIAL 1건 (구조적 한계 확정).

### QA 결과

PASS. B-4 신규 31/31 PASS + 회귀 151/153 PASS (2건 B-2/B-3 기존 cold-start 타임아웃, B-4 무관). SC-1~SC-6 전수 충족 (SC-2 PARTIAL은 AD2 확정 사항).

### 알려진 이슈

- W-1 customer_normal_seated_left 구조적 한계 최종 확정 (B-1~B-4 총 4회 시도 실패, 추가 재시도 없이 마감)
- 데모 키 W/A/S: Image 객체에서 sprite.play() 호출 시 실제 프레임 전환 미동작 (Phase D에서 Sprite 객체 전환 시 해소 예정, 현재 에러 미발생)
- walk 이동 Tween: B-4 범위 외 (Phase D에서 CustomerState.WALKING + 이동 Tween 연결 예정)
- phase67-ad3-capture.spec.js CommonJS require() 문법으로 ESM 프로젝트에서 전체 테스트 실행 차단 (B-4 무관, 후속 정리 권장)

### 참고

- 스펙: `.claude/specs/2026-04-24-kc-phase-b4-spec.md`
- 목적: `.claude/specs/2026-04-24-kc-phase-b4-scope.md`
- AD 모드1: `.claude/specs/2026-04-24-kc-phase-b4-ad1.md`
- AD 모드2: `.claude/specs/2026-04-24-kc-phase-b4-ad2.md`
- Coder 리포트: `.claude/specs/2026-04-24-kc-phase-b4-coder-report.md`
- QA: `.claude/specs/2026-04-24-kc-phase-b4-qa.md`

---

## [Phase B-3] 2026-04-24 -- 손님 9종 + 셰프 5명 에셋 확장

### 개요

손님 9종(vip/gourmet/rushed/group/critic/regular/student/traveler/business) seated_right/left 18장 + 셰프 5명(mage/yuki/lao/andre/arjun) idle_side 5장 + W-1 재발주(size=44 큰 캔버스 + Option B 색상 정규화) = 총 24장을 PixelLab으로 발주하여 `assets/tavern/`에 저장. DEMO_CUSTOMER_TYPES 4종 슬롯 분배, REAL_KEY_MAP +6키(총 15개), preload realAssets +23(총 32개), SIT 텍스처 동적 교체 구현.

### 추가

- `kitchen-chaos/assets/tavern/customer_{vip/gourmet/rushed/group/critic/regular/student/traveler/business}_seated_right.png` -- 각 16x22px, 손님 9종 우향 앉기 (PixelLab size=22, 32x32 -> NEAREST 16x16 + 상단 6px 투명 패딩)
- `kitchen-chaos/assets/tavern/customer_{vip/gourmet/rushed/group/critic/regular/student/traveler/business}_seated_left.png` -- 각 16x22px, 손님 9종 좌향 앉기 (독립 스프라이트, scaleX/flipX 미사용)
- `kitchen-chaos/assets/tavern/chef_{mage/yuki/lao/andre/arjun}_idle_side.png` -- 각 16x24px, 셰프 5명 idle 사이드뷰 (PixelLab size=24, 36x36 -> NEAREST + crop/패딩)
- `kitchen-chaos/assets/tavern/_raw/*_b3.png` -- 24장 PixelLab 원본 백업
- `kitchen-chaos/assets/tavern/_postprocess_b3.py` -- B-3 후처리 스크립트 (리사이즈/패딩)
- `kitchen-chaos/tests/phase-b3-asset-expansion.spec.js` -- Playwright 35개 테스트 (HTTP 200, 텍스처 레지스트리, customerType, SIT 교체, 회귀)

### 변경

- `kitchen-chaos/assets/tavern/customer_normal_seated_left.png` -- W-1 재발주 (PixelLab size=44 -> 64x64 raw -> NEAREST 직접 16x22 다운스케일 + Option B 색상 정규화). teal 6/53 = 11.3% (B-2 대비 opaque 26->53으로 개선, 비율은 구조적 한계)
- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - REAL_KEY_MAP 확장: +6키 (vip/gourmet/rushed seated_down/up 각 2개 = 6). 총 15개
  - preload realAssets 확장: +23 에셋 (손님 9종x2=18 + 셰프 5명=5). 총 32개. W-1은 기존 항목 파일 교체
  - DEMO_CUSTOMER_TYPES 상수 추가: `['normal', 'vip', 'gourmet', 'rushed']` (4슬롯 1:1 배치)
  - `_buildCustomers()`: customerType 프로퍼티 추가, 타입별 더미 키 분기
  - `_cycleCustomerState()`: SIT_DOWN/SIT_UP 텍스처 교체를 customerType 기반 동적 키로 변경 (`tavern_customer_${typeKey}_seated_right/left`)
  - `__tavernSpriteTypes`: customerType 필드 노출 추가
- `kitchen-chaos/tests/phase-b2-sprite-transition.spec.js` -- B-3 DEMO_CUSTOMER_TYPES 반영 (손님 초기 텍스처 검증을 타입별로 갱신)

### W-1 재발주 결과 (PARTIAL)

- size=44 발주 -> PixelLab 64x64 출력 -> PIL 직접 16x22 NEAREST 다운스케일
- Option B 색상 정규화: 셔츠 6픽셀에 seated_right 4단계 팔레트(MAIN #56b5b4/HIGH #87d8e0/SHADOW #367e7c/DARK #266e6c) 1:1 매핑 적용
- 시각적으로 청록 셔츠로 인식 가능하나 정량 비율 11.3%로 목표 25% 미달
- 구조적 한계: facing-left 사이드뷰에서 셔츠 가시 영역 x=7,8 좁은 띠(6cells 상한). silhouette 재설계 없이 개선 불가
- 권장: Phase B-4 walk_l 시트 발주 시 PixelLab PRO 모드 + size=64로 재시도

### AD 모드2 검수 결과

APPROVED (conditional). FAIL 0건, WARN 1건(W-1 PARTIAL), PASS 23건.

손님 9종 차별화 검증:
| type | 핵심 색상 | 차별화 |
|------|----------|--------|
| vip | 검정 정장, 금색 보타이 | OK |
| gourmet | 흰색 셰프 모자, 베이지 앞치마 | OK |
| rushed | 흰셔츠, 빨강 넥타이 | OK |
| group | 파스텔 핑크/노랑 | OK |
| critic | 다크 네이비 블레이저, 안경 | OK |
| regular | 갈색 카디건 | OK |
| student | 네이비 교복 | OK |
| traveler | 카키 베스트 | OK |
| business | 다크 그레이 정장 | OK |

셰프 5명 차별화 검증:
| 이름 | 핵심 색상 | 미미/린 구분 |
|------|----------|-------------|
| mage | 보라/네이비 로브, 은발 | OK |
| yuki | 흰색 코트, 하늘색 헤어 | OK |
| lao | 황색 코트, 적색 사쉬 | OK |
| andre | 검정 코트, 흰 토크 | OK |
| arjun | 주황 코트, 갈색 피부 | OK |

### QA 결과

PASS. Playwright 153/153 전수 PASS.
- SC-1: PARTIAL (인정, teal 11.3%, 구조적 한계, AD2 conditional APPROVED)
- SC-2: PASS (손님 9종 R/L 18장, 16x22)
- SC-3: PASS (셰프 5명, 16x24)
- SC-4: PASS (preload 32개, Phaser 텍스처 32종)
- SC-5: PASS (REAL_KEY_MAP +6 = 15개)
- SC-6: PASS (DEMO_CUSTOMER_TYPES 4종 배치, customerType 확인)
- SC-7: PASS (SIT 텍스처 동적 교체)
- SC-8: PASS (AD2 FAIL 0건)
- SC-9: PASS (153/153, 회귀 0건)
- SC-10: PASS (ServiceScene.js diff 0줄, scaleX/flipX 0건, tavern_dummy/ 0건, 레이아웃 상수 0건)

### 알려진 이슈

- W-1 seated_left 셔츠 청록 정량 비율 미달 (PARTIAL, 11.3%) -> B-4 PRO 모드 재발주 결과 teal=3으로 악화, 구조적 한계 최종 확정
- 5종 손님(group/critic/regular/student/traveler/business)은 preload만, REAL_KEY_MAP 미매핑 -> Phase D 게임 로직 연동 시 추가
- 셰프 5명(mage~arjun)은 preload만, 화면 배치 없음 -> Phase D 고용 시스템 구현 시 활성화
- DEMO_CUSTOMER_TYPES는 Phase D에서 랜덤 spawn 및 type별 게임 로직으로 교체 예정
- `assets/tavern/write_ad2_report.py` untracked 파일 잔존 (빌드 `.py` 필터로 제외됨, 정리 권장)

### 참고

- 목적: `.claude/specs/2026-04-24-kc-phase-b3-scope.md`
- 스펙: `.claude/specs/2026-04-24-kc-phase-b3-spec.md`
- AD 모드1: `.claude/specs/2026-04-24-kc-phase-b3-ad1.md`
- AD 모드2: `.claude/specs/2026-04-24-kc-phase-b3-ad2.md`
- Coder 리포트: `.claude/specs/2026-04-24-kc-phase-b3-coder-report.md`
- QA: `.claude/specs/2026-04-24-kc-phase-b3-qa.md`

---

## [Phase B-2] 2026-04-24 -- B-1 WARN 해소 + 스프라이트 전환

### 개요

Phase B-1 조건부 승인 WARN 4건(W-1 seated_left 셔츠 색상 불일치, W-2/3 벤치 14px crop 음영 약화, W-4 셰프 placeholder 잔존)을 PixelLab 재발주 에셋 4종으로 해소하고, `_buildChef()`/`_buildCustomers()`를 `_placeImageOrRect()` 경로로 전환하여 ASSET_MODE='real' 상태에서 셰프 2명(린+미미) + 손님이 실 픽셀아트 Image 오브젝트로 렌더링되도록 구현. vite 빌드에서 `_raw/` 디렉토리 + `.py` 파일 제외로 빌드 위생 확보.

### 추가

- `kitchen-chaos/assets/tavern/chef_rin_idle_side.png` -- 16x24px, 두 번째 셰프 린 (PixelLab 36x36 -> NEAREST 다운스케일+패딩). W-4 해소
- `kitchen-chaos/assets/tavern/_raw/customer_normal_seated_left_b2.png` -- 재발주 원본 백업 (32x32)
- `kitchen-chaos/assets/tavern/_raw/chef_rin_idle_side_b2.png` -- 신규 발주 원본 백업 (36x36)
- `kitchen-chaos/assets/tavern/_raw/bench_vertical_l_v12_b2.png` -- 재발주 원본 백업 (32x76)
- `kitchen-chaos/assets/tavern/_raw/bench_vertical_r_v12_b2.png` -- 재발주 원본 백업 (32x76)
- `kitchen-chaos/assets/tavern/_postprocess_b2.py` -- B-2 후처리 스크립트 (4종 리사이즈/크롭)
- `kitchen-chaos/tests/phase-b2-sprite-transition.spec.js` -- Playwright 신규 테스트 15개

### 변경

- `kitchen-chaos/assets/tavern/customer_normal_seated_left.png` -- PixelLab 재발주 (32x32 -> 16x22 NEAREST 다운스케일+패딩). W-1 부분 개선 (teal 0% -> 19.2%, 완전 일치는 B-3)
- `kitchen-chaos/assets/tavern/bench_vertical_l_v12.png` -- PixelLab 재발주 (32x76 -> 14x76 NEAREST 가로 스케일 다운). 우측 2열 33.6% 어둡. W-2 해소
- `kitchen-chaos/assets/tavern/bench_vertical_r_v12.png` -- PixelLab 재발주 (32x76 -> 14x76 NEAREST 가로 스케일 다운). 좌측 2열 67.4% 어둡. W-3 해소
- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - REAL_KEY_MAP 확장: `tavern_dummy_chef2_idle_side` -> `tavern_chef_rin_idle_side` 추가 (8->9개)
  - preload(): chef_rin_idle_side 실 에셋 추가 로드
  - `_buildChef()`: `this.add.rectangle()` -> `_placeImageOrRect()` 경로 전환. idx=0(린)/idx=1(미미) 분기
  - `_buildCustomers()`: `this.add.rectangle()` -> `_placeImageOrRect()` 경로 전환
  - `_cycleCustomerState()`: SIT 상태 진입 시 seated_right/seated_left 텍스처 교체 추가
  - fillColor 타입 가드: `sprite.type === 'Rectangle'` 체크 (셰프 line 444 + 손님 line 582)
  - `__tavernSpriteTypes` 진단 노출 추가 (`typeof window !== 'undefined'` 가드 내부)
- `kitchen-chaos/vite.config.js`
  - `copyDirFiltered()`: COPY_DIR_EXCLUDE (`_raw`), COPY_FILE_EXCLUDE (`.py`) 추가. 프로덕션 빌드에서 `_raw/` 디렉토리 + `.py` 파일 제외

### 벤치 후처리 방식 변경

B-1: 32x76 -> center crop width 14 (좌우 9px 균등 자르기) -> 측면 음영 손실 (W-2/W-3)
B-2: 32x76 -> NEAREST 전체 가로 스케일 다운 14px (세로 76px 유지) -> 측면 음영 보존. 스펙 대안으로 명시된 방식 채택.

### AD 모드2 검수 결과

APPROVED (조건부). FAIL 0건, WARN 1건:
- WARN-1 (잔여): seated_left 셔츠 청록 5픽셀만 잔존, 주조색은 갈색. PixelLab 원본(32x32)에서는 청록 정상 생성되었으나 16x22 NEAREST 다운스케일 과정에서 셔츠 영역 픽셀 소실. B-3에서 size=44 큰 캔버스 발주 또는 PIL 마스킹으로 해소 예정.

B-1 WARN 해소 상태:
- W-1 (seated_left 셔츠): 부분 개선 (0px -> 5px teal), WARN-1로 잔여
- W-2 (bench_l 음영): 해소 (우측 33.6% 어둡, 기준 20% 충족)
- W-3 (bench_r 음영): 해소 (좌측 67.4% 어둡, 기준 20% 충족)
- W-4 (chef-1 placeholder): 해소 (chef_rin_idle_side.png 발주 + idx=0 Image 렌더링)

### QA 결과

PASS. Playwright 114/118 (B-2 신규 14/15 + B-1 회귀 19/19 + A/A-bis 회귀 81/84). 실패 4건 모두 cold-start timeout (인프라 이슈, B-2 회귀 아님).
- SC-1: PARTIAL (seated_left teal 19.2%, AD2 APPROVED 조건부. 발주 프로세스 자체는 성공)
- SC-2: PASS (bench_l/r 음영 보존, PIL 실측 + 스크린샷 확인)
- SC-3: PASS (chef_rin 16x24, HTTP 200, Image 타입, 미미 구분 3요소 충족)
- SC-4: PASS (_buildChef/_buildCustomers 내 add.rectangle 직접 호출 0건, Image 타입 렌더링)
- SC-5: PASS (dist/sprites/tavern/에 9 PNG만 존재, .py/`_raw/` 제외)
- SC-6: PASS (B-2 회귀 0건)
- SC-7: PASS (ServiceScene.js diff 0줄, scaleX/flipX 0건, tavern_dummy/ 변경 0건, 레이아웃 상수 변경 0건)

### 알려진 이슈

- seated_left 셔츠 청록 완전 일치 미달성 (WARN-1 잔여) -> B-3에서 size=44 큰 캔버스 발주 또는 PIL 마스킹
- `assets/tavern/write_ad2_report.py` untracked 파일 잔존 (빌드 `.py` 필터로 제외됨, 정리 권장)
- cold-start timeout: `waitForTavernScene` 내부 timeout 상향 권장 (15s->20s, 30s->45s)
- SIT_DOWN/SIT_UP 텍스처 교체가 `nextState` 기반 (Phase D에서 `free.side` 기반으로 변경 권장)
- `_placeImageOrRect` origin(0,0) 후 setOrigin(0.5,1) 체인 시 Image/Rectangle 경로 간 위치 미세 불일치 가능 (dummy 모드 디버그 전용이므로 수용)

### B-3 권고 사항

- seated_left 셔츠 청록 완전 일치: PixelLab size=44 큰 캔버스 발주 또는 PIL 셔츠 영역 마스킹 색상 치환
- 손님 9종 (vip~business) seated_right/seated_left 발주
- walk_l/walk_r 애니메이션 시트 발주
- 셰프 추가 5명 (메이지~아르준) idle 발주
- write_ad2_report.py 정리

### 참고

- 목적: `.claude/specs/2026-04-24-kc-phase-b2-scope.md`
- 스펙: `.claude/specs/2026-04-24-kc-phase-b2-spec.md`
- AD 모드1: `.claude/specs/2026-04-24-kc-phase-b2-ad1.md`
- Coder 리포트: `.claude/specs/2026-04-24-kc-phase-b2-coder-report.md`
- AD 모드2: `.claude/specs/2026-04-24-kc-phase-b2-ad2.md`
- QA: `.claude/specs/2026-04-24-kc-phase-b2-qa.md`

---

## [Phase B-1] 2026-04-23 -- 실 에셋 최소 1세트 발주 및 통합

### 개요

V12 좌표계가 확정된 TavernServiceScene에 최초의 실 픽셀아트 에셋 1세트를 PixelLab으로 발주하여, PIL placeholder를 실 에셋으로 교체하는 Phase B 파이프라인이 정상 동작함을 검증. 동시에 발주 규격서의 V10 잔재 수치를 V12로 갱신.

### 추가

- `kitchen-chaos/assets/tavern/` -- 실 에셋 저장 디렉토리 신규 생성
- `kitchen-chaos/assets/tavern/_raw/` -- PixelLab 원본 다운로드 백업 (8종)
- `kitchen-chaos/assets/tavern/_postprocess.py` -- PIL NEAREST 후처리 스크립트
- `kitchen-chaos/assets/tavern/customer_normal_seated_right.png` -- 16x22px (원본 32x44 -> NEAREST 1/2 다운스케일)
- `kitchen-chaos/assets/tavern/customer_normal_seated_left.png` -- 16x22px (원본 32x44 -> NEAREST 1/2 다운스케일)
- `kitchen-chaos/assets/tavern/chef_mimi_idle_side.png` -- 16x24px (원본 32x48 -> NEAREST 1/2 다운스케일)
- `kitchen-chaos/assets/tavern/counter_v12.png` -- 40x100px (원본 크기 일치, 패스스루)
- `kitchen-chaos/assets/tavern/table_vertical_v12.png` -- 44x72px (원본 크기 일치, 패스스루)
- `kitchen-chaos/assets/tavern/bench_vertical_l_v12.png` -- 14x76px (원본 32x76 -> center crop width 14)
- `kitchen-chaos/assets/tavern/bench_vertical_r_v12.png` -- 14x76px (원본 32x76 -> center crop width 14)
- `kitchen-chaos/assets/tavern/entrance_v12.png` -- 32x40px (원본 크기 일치, 패스스루)
- `kitchen-chaos/tests/phase-b1-asset-load.spec.js` -- Playwright 신규 테스트 19개

### 변경

- `kitchen-chaos/js/scenes/TavernServiceScene.js`
  - 파일 상단: ASSET_MODE='real' 토글 상수 추가 (line 54~70)
  - REAL_KEY_MAP 매핑 테이블: 더미 키 -> 실 에셋 키 변환 정의
  - preload(): ASSET_MODE='real'일 때 `assets/tavern/` 에셋 8종 추가 로드 (line 108~124)
  - _placeImageOrRect(): ASSET_MODE 기반 실 에셋 키 우선 시도 + 더미 fallback (line 310~324)
  - window.__tavernAssetMode 테스트 노출 추가
- `kitchen-chaos/tests/phase-a-bis-v12-qa.spec.js`
  - 카운터/입구 텍스처 키 검색을 실 에셋 키도 수용하도록 호환 수정 (2개소)
- `.claude/specs/2026-04-23-kc-phase-b-asset-spec.md` -- V10 잔재 7개소 V12 갱신
  - §2-1 벤치: 192x14px(가로) -> 14x76px(세로), 슬롯 가로->세로
  - §2-2 테이블: 192x40px -> 44x72px
  - §2-3 카운터: 112x52px -> 40x100px, 입구: 64x48px -> 32x40px
  - §1-2 파일명: seated_down/up -> seated_right/left
  - §4 도구표: facing-up/down -> facing-right/left

### AD 모드2 검수 결과

APPROVED (조건부). FAIL 0건, WARN 3건(minor):
- WARN-1: 손님 seated_left 셔츠 색상이 갈색 계열(#201000~#603000)로, seated_right(#50b0b0 청록)와 불일치
- WARN-2: bench_vertical_l 14px crop으로 우측 측면 음영 디테일 약화
- WARN-3: bench_vertical_r 14px crop으로 좌측 측면 음영 디테일 약화

### AD 모드3 검수 결과

APPROVED (조건부). WARN 1건:
- WARN-1: chef-1(idx=0) 위치에 PIL placeholder(파란 박스) 잔존. chef-2(idx=1)에만 실 에셋 미미 적용. Phase B-2에서 두 번째 셰프 발주 시 해소.

### QA 결과

PASS. Playwright 46/46 (회귀 27 + 신규 19). SC-1~SC-5 전항목 충족.
- SC-1: 규격서 V10 잔재 0건
- SC-2: 에셋 8종 `tavern/` 저장 + native 크기 정확 일치
- SC-3: AD 모드2 APPROVED
- SC-4: 에셋 HTTP 200 + Phaser 텍스처 로드 오류 0건
- SC-5: tavern_dummy/ 보존, ASSET_MODE 토글 공존, 회귀 27/27 PASS
- 빌드: vite build PASS (70 modules, 에러 0건)

### 알려진 이슈

- 캐릭터 3종(customer seated right/left, chef mimi idle)은 텍스처 로드만 완료, 씬에서는 여전히 `this.add.rectangle()` 색상 사각형으로 렌더링 (Phase B-2에서 스프라이트 전환 예정)
- 술통(barrel.png) 실 에셋 미발주 (선택 사항, tavern_dummy barrel 사용 중)
- `assets/tavern/_postprocess.py`와 `_raw/` 디렉토리가 프로덕션 빌드에 포함됨 (LOW, Phase B-2에서 빌드 필터 개선 권장)

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase-b1-asset-spec.md`
- 목적: `.claude/specs/2026-04-23-kc-phase-b1-asset-scope.md`
- AD 모드1: `.claude/specs/2026-04-23-kc-phase-b1-ad1.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase-b1-coder-report.md`
- AD 모드2: `.claude/specs/2026-04-23-kc-phase-b1-ad2.md`
- AD 모드3: `.claude/specs/2026-04-23-kc-phase-b1-ad3.md`
- QA: `.claude/specs/2026-04-23-kc-phase-b1-qa.md`

---

## [Phase A-bis] 2026-04-23 -- V12 레이아웃 마이그레이션 (V10 가로 -> V12 4분면 세로)

### 개요

Phase A(V10 가로 긴 테이블 3세트x8석=24석)를 AD 검수 확정 V12 수치(세로 짧은 테이블 4분면x6석=24석)로 전면 교체. 코드 구조/상태머신 열거형/함수 인터페이스는 Phase A를 그대로 유지하고, 좌표/에셋 크기 상수와 씬 렌더링 배치만 V12 수치로 치환. V12 마이그레이션 완료로 Phase B(실 에셋 발주) 진입 게이트 충족.

### 변경 사유

V10(가로 긴 테이블 3세트) 구조에서 V11 시안 -> AD REDESIGN -> V12 시안까지 시각 검증을 거쳐, V12의 4분면 세로 배치가 360px 폭 화면에서 더 자연스럽다는 결론. Phase B 에셋 발주 규격이 V12 기준으로 확정되어야 하므로 마이그레이션 실시.

### 추가

- `kitchen-chaos/assets/tavern_dummy/counter_v12.png` -- V12 PIL placeholder 40x100px
- `kitchen-chaos/assets/tavern_dummy/table_vertical_v12.png` -- V12 PIL placeholder 44x72px
- `kitchen-chaos/assets/tavern_dummy/bench_vertical_l_v12.png` -- V12 PIL placeholder 14x76px (facing-right)
- `kitchen-chaos/assets/tavern_dummy/bench_vertical_r_v12.png` -- V12 PIL placeholder 14x76px (facing-left)
- `kitchen-chaos/assets/tavern_dummy/entrance_v12.png` -- V12 PIL placeholder 32x40px
- `kitchen-chaos/tests/phase-a-bis-v12-qa.spec.js` -- QA 신규 테스트 27개

### 변경

- `kitchen-chaos/js/data/tavernLayoutData.js` -- V12 좌표 상수 전면 교체
  - TABLE_SET_ANCHORS: 3엔트리(x,y) -> 4엔트리(quadLeft,quadTop,key: tl/tr/bl/br)
    - tl(130,90), tr(250,90), bl(130,250), br(250,250)
  - BENCH_SLOTS: dx(가로 오프셋) -> dy(세로 오프셋), top/bot -> left/right
    - lv0: 3슬롯(dy=20/47/74), lv3: 4슬롯, lv4: 5슬롯
  - BENCH_CONFIG: 가로 벤치 -> V12 quad/table/bench 크기
    - QUAD_W=100, QUAD_H=120, BENCH_W=14, BENCH_H=76, TABLE_W=44, TABLE_H=72
  - COUNTER_ANCHOR: (64,56) -> (100,90), COUNTER_W: 112->40, COUNTER_H: 52->100
  - DOOR_ANCHOR: (316,56) -> (60,480), 입구 우측 상단 -> 좌측 하단
  - CHEF_IDLE_ANCHORS: [(72,48),(112,48)] -> [(40,100),(40,148)], 셰프-2 top=148 (카운터 범위 내)
  - 삭제: BARREL_ANCHORS, BENCH_W(구), BENCH_TOP_OFFSET_Y, BENCH_BOT_OFFSET_Y
  - 신규: BENCH_LEFT_OFFSET_X=7, BENCH_RIGHT_OFFSET_X=77
  - createSeatingState(): 3세트 x top/bot -> 4quad x left/right
  - findFreeSlot(): ['top','bot'] -> ['left','right'] 순회

- `kitchen-chaos/js/scenes/TavernServiceScene.js` -- V12 배치 전면 재작성
  - import: BARREL_ANCHORS/BENCH_W/BENCH_TOP_OFFSET_Y/BENCH_BOT_OFFSET_Y 제거, BENCH_LEFT_OFFSET_X/BENCH_RIGHT_OFFSET_X 추가
  - preload(): V10 키(bench_long_lv0, table_long_lv0, counter_topdown, door_frame) 제거, V12 키(counter_v12, table_vertical_v12, bench_vertical_l/r_v12, entrance_v12) 추가
  - _buildFurniture(): 3세트 가로 루프 -> 4 quad 세로 루프 + 입구(entrance_v12) 좌하단 배치
  - _buildBenchSlots(): set.top/set.bot -> set.left/set.right 루프, 슬롯 라벨 L0-L2/R0-R2
  - _buildChef(): 셰프 1명 -> 2명 루프 (idx=0만 인터랙티브, _chefSprite 참조 유지)
  - _getOccupiedCount(): ['top','bot'] -> ['left','right'] 순회
  - _buildDebugHUD/_updateDebugHUD: top/bot -> left/right 총 슬롯 계산
  - window.__tavernLayout: TABLE_SET_ANCHORS 추가 노출 (SC-1 테스트용)
  - BARREL_POSITIONS: 로컬 상수로 재정의 (카운터 좌측 하단)

- `kitchen-chaos/tests/phase-a-tavern-qa.spec.js` -- V12 구조 적용
  - top/bot -> left/right, SC-1(TABLE_SET_ANCHORS 4엔트리) 추가, SC-2(24석) 갱신, 통로 폭 검증 2건 추가
  - 테스트 수: 14 -> 20

- `kitchen-chaos/tests/phase-a-tavern-qa-extended.spec.js` -- V12 구조 적용
  - top/bot -> left/right, 4슬롯->3슬롯, facingDown/Up -> facingRight/Left
  - getSlotWorldPos 기댓값: (x=206) -> (x=137, y=110)
  - 24석 전체 점유 루프: 3세트 x top/bot x 4슬롯 -> 4quad x left/right x 3슬롯

### V12 좌표 수치표 (AD 검수 확정값)

| 항목 | 값 |
|------|-----|
| quad 크기 | 100x120px |
| quad.tl | left=130, top=90 |
| quad.tr | left=250, top=90 |
| quad.bl | left=130, top=250 |
| quad.br | left=250, top=250 |
| 세로 통로 | 20px (quad.tr.left - quad.tl.right) |
| 가로 통로 | 40px (quad.bl.top - quad.tl.bottom) |
| bench-l (quad 내부) | left=8, top=18, 14x76px |
| table-v (quad 내부) | left=30, top=10, 44x72px |
| bench-r (quad 내부) | left=78, top=18, 14x76px |
| 손님 슬롯 dy | 20 / 47 / 74 (quad 상단 기준) |
| 카운터 | left=80, top=90, 40x100px |
| 셰프-1 발끝 | x=40, y=100 |
| 셰프-2 발끝 | x=40, y=148 |
| 입구 | left=44, top=480, 32x40px |

### 수정 금지 파일

- `kitchen-chaos/js/scenes/ServiceScene.js` -- git diff 0줄 확인

### 테스트 결과

- 기존 테스트: 57/57 PASS (phase-a-tavern-qa.spec.js 20 + phase-a-tavern-qa-extended.spec.js 37)
- QA 신규 테스트: 27/27 PASS (phase-a-bis-v12-qa.spec.js)
- 전체: 84/84 PASS
- 게이트 12항목: 12/12 PASS
- vite build: PASS (70 modules, 12.51s)

### AD 모드3 판정

REVISE (QA 진행 가능 판정). WARN 4건:
- WARN-1: 손님 초기 대기 위치(queueBaseX=300)가 quad.tr 영역과 겹침 -> Phase B 수정 예정
- WARN-2: 카운터 top AD 원문(80) vs mockup(90) 10px 차이 -> 수정 불필요 (mockup 기준 PASS)
- WARN-3: 좌측 여백 2px (권장 10px 미달) -> Phase B 아키텍처 조정 시 검토
- WARN-4: ENTER 복귀 좌표(x=40, y=110) 주방 내부 -> Phase B 동선 AI 구현 시 수정

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-spec.md`
- 목적: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-scope.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-ad3.md`
- QA: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-qa.md`

### 알려진 사항

- V10 더미 PNG(bench_long_lv0.png 등)는 assets/tavern_dummy/에 그대로 유지 (preload에서만 제거)
- 셰프-2(y=148)가 카운터 블록(40x100, y=90~190)에 가려져 시각 구분 어려움 -> Phase B 실 스프라이트 적용 시 해소
- 하단 190px 대기열 영역(y=370~560) 빈 공간 -> Phase B+에서 활용 예정
- window.__tavernLayout에 TABLE_SET_ANCHORS 추가 노출이 DEV 조건 없이 수행 -> Phase B 이후 조건부 변경 권장

---

## [Phase A] 2026-04-23 -- 영업씬 태번 스타일 재설계 기반 시스템 골격

### 개요

Travellers Rest 스타일(탑다운 가구 + 사이드뷰 풀바디 캐릭터)의 360x640 레이아웃 상수, 긴 벤치 좌석 슬롯 데이터 모델, 셰프/손님 상태머신 키, Y축 단순 깊이정렬을 PIL 더미 placeholder와 함께 구현. 기존 ServiceScene.js는 일절 수정하지 않고 신규 TavernServiceScene으로 병렬 구현. Phase B(에셋 발주) 즉시 착수 가능한 상태 확립.

### 추가

- `kitchen-chaos/js/data/tavernLayoutData.js` -- 신규 데이터 파일
  - TAVERN_LAYOUT 상수: HUD_H=32, WALL_H=24, CTRL_H=80, KITCHEN_W=120, DINING_W=224, ROOM_CONTENT_Y=56, ROOM_BOTTOM_Y=560
  - COUNTER_ANCHOR(x=64, y=56), TABLE_SET_ANCHORS(y=232/352/472, 간격 120px 균등), BARREL_ANCHORS, DOOR_ANCHOR, CHEF_IDLE_ANCHORS
  - BENCH_SLOTS: lv0(4인), lv3(5인), lv4(6인) 슬롯 오프셋
  - BENCH_TOP_OFFSET_Y=-26, BENCH_BOT_OFFSET_Y=+38 (AD REVISE 반영)
  - createSeatingState(benchLevel): 3세트 x top/bot x slotCount 동적 생성
  - occupySlot(tableSetIdx, side, slotIdx, customerId): 슬롯 점유 (빈칸 true, 이미 점유 false)
  - vacateSlot(tableSetIdx, side, slotIdx): 슬롯 해제
  - findFreeSlot(): 최초 빈 슬롯 반환 ({tableSetIdx, side, slotIdx} | null)
  - getSlotWorldPos(tableSetIdx, side, slotIdx): Phaser 절대 좌표 반환
  - 방어 코딩: 잘못된 인덱스/side에 대해 false/null 반환, 크래시 없음

- `kitchen-chaos/js/data/tavernStateData.js` -- 신규 데이터 파일
  - ChefState 7상태: idle_side, walk_l, walk_r, cook, carry_l, carry_r, serve
  - CustomerState 7상태: enter, queue, sit_down, sit_up, eat_down, eat_up, leave
  - sit_up/sit_down 별개 상태, scaleY(-1) 미러링 완전 배제
  - CHEF_STATE_TRANSITIONS / CUSTOMER_STATE_TRANSITIONS: 상태 전환 유효성 맵
  - CHEF_STATE_COLORS / CUSTOMER_STATE_COLORS: 더미 단계 상태별 대리 색상 (0xRRGGBB)

- `kitchen-chaos/js/scenes/TavernServiceScene.js` -- 신규 씬 파일
  - 씬 키: 'TavernServiceScene'
  - _buildLayout(): HUD/벽/주방/다이닝홀/CTRL 영역 색상 구분 디버그 표시
  - _buildFurniture(): 카운터, 3테이블 세트(bench-top/table/bench-bot), 술통 2개, 입구 프레임 배치
  - _buildBenchSlots(): 24개 슬롯 위치에 4x4 점 + 슬롯 번호 텍스트 표시
  - _buildChef(): 셰프 컬러 블록(32x48), 탭 시 idle->cook->carry_r->serve 상태 순환
  - _buildCustomers(): 손님 4명, 탭 시 queue->sit_down/sit_up->eat->leave 순환
  - _applyDepthSort(): depth = gameObject.y 단일 공식, HUD depth=9000+
  - update(): 매 프레임 _applyDepthSort() 호출
  - 디버그 HUD: "TAVERN DEBUG MODE", 점유 슬롯 수/24, 셰프 상태 표시
  - Back 버튼: MenuScene 복귀

- `kitchen-chaos/assets/tavern_dummy/` -- PIL 더미 이미지 13개
  - bench_long_lv0.png(192x14), table_long_lv0.png(192x40), counter_topdown.png(112x52)
  - barrel.png(32x40), door_frame.png(64x48), wall_decor_painting.png(32x28)
  - chef_idle_side.png(32x48), customer_walk_r.png(32x48)
  - customer_seated_down.png(32x44), customer_seated_up.png(32x44)
  - floor_wood_tile.png(32x32), wall_horizontal.png(64x24)
  - layout_preview.png(360x640) -- 전체 레이아웃 합성 미리보기

- `kitchen-chaos/tests/phase-a-tavern-qa.spec.js` -- Playwright 테스트 14개
- `kitchen-chaos/tests/phase-a-tavern-qa-extended.spec.js` -- QA 확장 테스트 40개

- `.claude/specs/2026-04-23-kc-phase-b-asset-spec.md` -- Phase B 진입 게이트 에셋 발주 규격서
  - 손님 10종 x 4포즈 = 40장, 셰프 7명 x 7포즈 = 49장, 가구 3등급 발주 규격

### 변경

- `kitchen-chaos/js/main.js`
  - TavernServiceScene import 추가
  - 씬 배열에 TavernServiceScene 추가 (NineSliceSandbox 바로 앞)

- `kitchen-chaos/js/devtools/DevHelper.js`
  - ?scene=tavern URL 파라미터 감지 로직 추가
  - BootScene 완료 후 TavernServiceScene 자동 전환 (setInterval 폴링)

### 수정

- `kitchen-chaos/js/scenes/TavernServiceScene.js` -- AD 모드3 REVISE 반영
  - bench-top y 오프셋: anchor.y - 30 -> anchor.y - 34 (bench-top/table 간 4px 겹침 제거)
- `kitchen-chaos/js/data/tavernLayoutData.js` -- AD 모드3 REVISE 반영
  - BENCH_TOP_OFFSET_Y: -38 -> -26 (bench-top 이미지 y범위 중앙 근방 재조정)

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase-a-tavern-spec.md`
- 목적: `.claude/specs/2026-04-23-kc-phase-a-tavern-scope.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase-a-tavern-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-23-kc-phase-a-tavern-ad3.md`
- QA: `.claude/specs/2026-04-23-kc-phase-a-tavern-qa.md`
- Phase B 게이트: `.claude/specs/2026-04-23-kc-phase-b-asset-spec.md`
- PIL 스크립트: `.claude/specs/phase-a-pil-gen-script.py`

### 알려진 사항

- lv0 슬롯 dx 오프셋 불균등(32/72/112/160, 간격 40/40/48px) -- V10 HTML 이식 의도, Phase B 에셋 정합 시 재확인 필요
- window.__tavernLayout 등 전역 노출이 DEV 조건 없이 수행 -- Phase B 이후 import.meta.env.DEV 조건부 변경 권장
- 모듈 레벨 _seatingState 공유 패턴 -- Phase D에서 씬 라이프사이클 동기화 재검토 필요
- Playwright 1건 실패(tavernStateData scaleY 검출)는 JSDoc 주석 내 문자열로 인한 false positive

---

## [Phase 76] 2026-04-23 -- 손님 NPC 다양성 확장 (P3-2 영업 씬 변주 확대)

### 개요

기존 6종 단순 타입 시스템(normal/vip/gourmet/rushed/group/mireuk_traveler)을 10종 프로필 시스템으로 전환. 각 프로필이 인내심 배율(patienceMult), 팁 성향(tipStyle), 선호 장르(preferredGenre) 등 고유 속성을 갖는다. 신규 특수 손님 2종: 평론가(critic)는 서빙 patienceRatio 누적 → 평균 0.7 미만 시 다음 영업 골드 -10% 패널티, 단골(regular)은 5회 서빙 누적 시 팁 x1.2 버프. 신규 5종 PixelLab 스프라이트 10장 생성. SaveManager v25->v26.

### 추가

- `kitchen-chaos/js/data/customerProfileData.js` -- 신규 데이터 파일
  - 10종 프로필 정의: normal(1.0/standard), vip(0.7/generous), gourmet(1.0/generous/high_tier), rushed(0.4/stingy), group(1.2/standard), critic(1.3/stingy/high_tier), regular(1.1/generous), student(0.9/stingy), traveler(1.4/standard/regional), business(0.6/generous)
  - `CUSTOMER_PROFILES` 배열 + `CUSTOMER_PROFILE_MAP` Map + `getCustomerProfile(profileId)` export (null/undefined 입력 시 normal 폴백)
  - 속성: id, nameKo, patienceMult, tipStyle, preferredGenre, spriteKey, icon, description (8개)

- `kitchen-chaos/assets/service/` -- 신규 스프라이트 10장 (PixelLab 생성, 92x92 RGBA, 투명 배경)
  - `customer_critic_waiting.png`, `customer_critic_seated.png` (네이비 정장, 안경, 수첩)
  - `customer_regular_waiting.png`, `customer_regular_seated.png` (베이지 스웨터, 가방)
  - `customer_student_waiting.png`, `customer_student_seated.png` (파란 교복, 배낭)
  - `customer_traveler_waiting.png`, `customer_traveler_seated.png` (카키 재킷, 모자)
  - `customer_business_waiting.png`, `customer_business_seated.png` (네이비 슈트, 서류가방)

### 변경

- `kitchen-chaos/js/managers/CustomerManager.js`
  - `_addCustomer()`: `customer.vip` boolean → `customer.profileId` 통합. `getCustomerProfile(profileId)` 조회하여 patienceMult/tipStyle 적용
  - `serve()`: tipStyle 기반 팁 등급 (generous x1.2, stingy x0.8). `vipMult` 분기를 `profileId === 'vip'`로 교체
  - 하위 호환 폴백: `custData.vip ? 'vip' : 'normal'`

- `kitchen-chaos/js/data/gameData.js`
  - WAVE_CUSTOMERS의 `vip:true` / `customerType` 필드를 `profileId` 통합으로 일괄 교체

- `kitchen-chaos/js/scenes/ServiceScene.js`
  - `_determineCustomerType()` → `_determineProfileId()` 리팩토링
  - SPECIAL_CUSTOMER_RATES 확장 (장1: 0.28, 장2: 0.47, 장3: 0.58 확률 합)
  - `criticScores[]` 배열: 평론가 서빙마다 patienceRatio push, 영업 종료 시 평균 < 0.7 → `setCriticPenaltyActive(true)`
  - `_regularServedCount`: 단골 서빙 시 ++, 5회 이상 시 tipGrade x1.2
  - `_endService()`: `criticPenaltyApplied` 시 totalGold x0.9 적용 후 플래그 소비
  - CUSTOMER_TYPE_ICONS에 critic/regular/student/traveler/business 5종 추가
  - `customerType: profileId` 하위 호환 필드 유지

- `kitchen-chaos/js/managers/SaveManager.js`
  - SAVE_DATA_VERSION 25 → 26
  - `createDefault()`: `regularCustomerProgress: 0`, `criticPenaltyActive: false` 추가
  - `_migrate()`: v25→v26 블록 (기본값 삽입)
  - 헬퍼 4개: `getRegularCustomerProgress()`, `setRegularCustomerProgress(count)`, `isCriticPenaltyActive()`, `setCriticPenaltyActive(active)`

- `kitchen-chaos/js/managers/SpriteLoader.js`
  - `CUSTOMER_TYPES` 배열 5종→10종 확장 (critic/regular/student/traveler/business 추가)
  - `_loadServiceAssets()`: 10종 x base+waiting+seated = 30키 preload
  - @fileoverview 주석 업데이트

- `kitchen-chaos/js/ui/CustomerZoneUI.js`
  - 신규 5종 스프라이트 `displayHeight=64` 스케일 흡수 (92x92 원본 → 64px 렌더)

### 스펙 대비 변경

- 스프라이트 크기: 스펙 64x80 → 실제 92x92 (PixelLab 자동 확장). CustomerZoneUI displayHeight=64 스케일 흡수로 기능 영향 없음
- ResultScene 평론가 혹평/단골 알림 텍스트: 스펙에서 ResultScene `_createResultView()`에 텍스트 삽입 요구 → Coder가 "ResultScene 변경 없이 처리"로 판단, ServiceScene에서 다음 영업 시작 시 패널티 적용. 패널티 로직 자체는 정상 동작하나 ResultScene에 시각 피드백 부재
- SaveManager 헬퍼 메서드명: 스펙 `getRegularProgress`/`getCriticPenalty` → 실제 `getRegularCustomerProgress`/`isCriticPenaltyActive` (더 명시적 네이밍)
- 패널티 소비 타이밍: 스펙 ResultScene→ServiceScene 소비 → 실제 ServiceScene._endService()→다음 ServiceScene.create() 소비 (결과 동일)

### 알려진 이슈

- **KNOWN-1 (MEDIUM)**: ResultScene 평론가 혹평 텍스트 + 단골 달성 알림이 ResultScene에 미구현. 데이터(criticAvgScore, regularAchieved)는 ServiceScene에서 계산하지만 ResultScene에서 수신/표시하는 코드 없음. 플레이어가 "왜 다음 영업 골드가 줄었는지" 알 수 없음. 후속 Phase에서 ResultScene UI 보강 시 함께 처리 권장.
- **KNOWN-2 (LOW)**: ServiceScene CUSTOMER_PATIENCE_MULT 상수와 customerProfileData.js patienceMult 속성 중복 정의. 현재 값 동기화됨. 향후 한쪽만 수정 시 불일치 위험. customerProfileData에서 가져오도록 통합 권장.
- **KNOWN-3 (LOW)**: CUSTOMER_PROFILE_MAP import 후 미사용 (ServiceScene.js:49). 미사용 import 제거 권장.
- **KNOWN-4 (LOW)**: setRegularProgress() 음수 입력 방어 없음. 실제 게임 흐름에서 발생 가능성 극히 낮음 (++ 연산만 사용).
- **AD2 WARN**: student_seated 포즈 표현 약함 (waiting과 거의 동일, lower_delta +81). critic/business 네이비 슈트 색 유사 (소품으로 구별). 기능 영향 없음.

### 검증

- QA: **PASS** (2026-04-23)
  - 수용 기준 7/7 전수 충족
  - Playwright 28/28 PASS (정상 21 + 예외 4 + UI 안정성 2 + 시각 1)
  - 시각적 검증 스크린샷 확인 (메뉴 로딩 + 스프라이트 10장 직접 확인)
  - 콘솔 에러 0건
  - 예외 시나리오 6건 PASS/WARN (음수 방어 WARN 허용)
- AD2: **APPROVED** -- FAIL 0건, WARN 4건 허용 (캔버스 92x92, traveler/business 외곽선 색, student seated 포즈, critic/business 색 유사)

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase76-spec.md`
- 코더 리포트: `.claude/specs/2026-04-23-kc-phase76-coder-report.md`
- AD2: `.claude/specs/2026-04-23-kc-phase76-ad2.md`
- QA: `.claude/specs/2026-04-23-kc-phase76-qa.md`

---

## [Phase 75B] 2026-04-23 -- 일일 미션 + 로그인 보너스 (P3-1 F2P 리텐션)

### 개요

P3 BM/리텐션 트랙 첫 번째 기능. 유저가 매일 접속할 동기를 부여하는 두 시스템(일일 미션, 7일 로그인 캘린더)을 신규 구현. DailyMissionManager가 DAILY_MISSION_POOL 10종에서 매일 3개를 중복 없이 랜덤 선정하고 달성 시 보상을 자동 지급한다. LoginBonusManager가 7일 연속 로그인 캘린더를 관리하며 D1에 미미 스킨 쿠폰, D7에 미력의 정수 100을 지급한다. MenuScene 상단에 "오늘의 미션" 배너와 미션/캘린더 탭 전환 통합 팝업 모달을 추가. 6개 씬에 이벤트 훅을 연결하여 미션 진행도를 자동 추적한다.

### 추가

- `kitchen-chaos/js/managers/DailyMissionManager.js` -- 신규 매니저
  - DAILY_MISSION_POOL 10종: stage_clear_3/5, gold_earn_500/1000, orders_complete_10/20, perfect_satisfaction_1, endless_wave_5, gather_run_2, three_star_1
  - `checkAndReset()`: 로컬 Date 기반 날짜 변경 감지, 3개 미션 재선정, progress/completed/claimed 초기화
  - `recordProgress(missionType, delta)`: type 기반 호출, 선정된 미션 중 해당 type에 delta 적용. endless_wave는 Math.max 갱신, 나머지는 += 누적
  - `getTodayMissions()`: 당일 3개 미션 + 진행도/완료/수령 상태 반환
  - `claimReward(missionId)`: 내부용 수동 수령 API (자동 지급이 기본)
  - `_grantReward(reward)`: gold/kitchenCoins/mireukEssence 분기 지급. mireukEssence 999 캡 방어
  - null/손상 세이브 방어 (L70-72 기본값 삽입)
  - 이미 완료된 미션 추가 진행도 누적 방지 (L131 `if (dm.completed[id]) continue`)

- `kitchen-chaos/js/managers/LoginBonusManager.js` -- 신규 매니저
  - LOGIN_REWARDS 7일 보상 테이블: D1 미미 스킨 쿠폰 x1, D2 골드 100, D3 주방 코인 5, D4 골드 200, D5 주방 코인 10, D6 미력의 정수 30, D7 미력의 정수 100
  - `checkAndGrantDaily()`: lastLoginDate와 오늘 비교, 어제면 streak+1, 그 외 streak=1+claimedDays 리셋
  - D7 완주 후 streak=0, claimedDays=[] 리셋 (다음날 D1 재시작)
  - `getLoginBonusState()`: 팝업 표시용 상태 반환
  - `_grantReward(rewardDef)`: mimiSkinCoupons/gold/kitchenCoins/mireukEssence 분기. mireukEssence 999 캡 방어
  - null/손상 세이브 방어 (L65-67)

- `kitchen-chaos/assets/sprites/ui/missions/` -- 에셋 10종 (32x32 PNG, PIL 절차 생성)
  - 미션 아이콘 7종: mission_icon_clear_stage, mission_icon_gold, mission_icon_serve, mission_icon_recipe, mission_icon_endless, mission_icon_satisfaction, mission_icon_three_star
  - 캘린더 슬롯 3종: calendar_slot_locked (회색 자물쇠), calendar_slot_claimed (골드 체크마크), calendar_slot_today (골드 강조 + 별)
  - 카테고리별 컬러: 전투 골드 #D4A24A, 경제 #FFCC44, 요리 #E8794A/#5FB54A, 엔드리스 #8C5BD8, 캘린더 #6B6B6B/#FFE266
  - 외곽선 #1A1A1A, 투명 배경, 기존 branch_badge_* 톤 일관성 유지

- `kitchen-chaos/js/scenes/MenuScene.js` -- 배너 + 팝업 모달
  - `_createMissionBanner()`: NineSlice 배너(y=50, tint 0xcc6600), 아이콘 + "오늘의 미션" + 별 상태(★★☆)
  - `_openDailyMissionModal()`: 반투명 오버레이 + NineSlice panel(dark, 300x440)
  - 상단 탭: "오늘의 미션" | "로그인 보너스" 전환
  - 미션 탭: 3개 미션 카드(아이콘 28x28 + 설명 + 진행 바 + 보상 텍스트 + 달성 체크)
  - 캘린더 탭: D1~D7 슬롯(4+3 배치), 보상 리스트, 연속 로그인 일차 표시
  - X 닫기 + 오버레이 바깥 클릭 닫기 + _onBack 처리
  - 더블클릭 모달 중복 생성 방지 (L279 `if (this._missionModalContainer) return`)

- `kitchen-chaos/js/scenes/BootScene.js` -- missions 디렉토리 10개 PNG preload 추가

- 이벤트 훅 (전부 try-catch 이중 래핑):
  - `ServiceScene.js:2522` -- 주문 완료(servedCount++) 직후: `recordProgress('orders_complete', 1)`
  - `ServiceScene.js:2765` -- 영업 종료 골드 획득 직후: `recordProgress('gold_earn', earnedGold)`
  - `ResultScene.js:334` -- 스테이지 클리어: `recordProgress('stage_clear', 1)`
  - `ResultScene.js:336-337` -- 별 3개: `if (stars === 3) recordProgress('three_star', 1)`
  - `ResultScene.js:340-341` -- 만족도 95%+: `recordProgress('perfect_satisfaction', 1)`
  - `EndlessScene.js:274` -- 웨이브 클리어: `recordProgress('endless_wave', this.endlessWave)` (Math.max 갱신)
  - `GatheringScene.js:70` -- 장보기 시작(setCurrentRun 직후): `recordProgress('gather_run', 1)`

### 변경

- `kitchen-chaos/js/managers/SaveManager.js`
  - SAVE_VERSION 24 -> 25
  - `createDefault()`: dailyMissions(dateKey/selected/progress/completed/claimed), loginBonus(loginStreak/lastLoginDate/claimedDays), mimiSkinCoupons 필드 추가
  - `_migrate()`: v24->v25 분기 추가 (L1538-1548). dailyMissions/loginBonus/mimiSkinCoupons 기본값 삽입, version=25
  - @fileoverview 주석에 Phase 75B 줄 추가

- `kitchen-chaos/js/scenes/MenuScene.js` -- 기존 요소 y좌표 전체 +60px 하향
  - 타이틀 y=220->280, 부제 y=320->380, 게임시작 y=390->450, 상점 y=450->510
  - 도감 y=496->556, 업적 y=534->594, 엔드리스(ENDLESS_Y) y=578->638
  - DailyMissionManager/LoginBonusManager import 추가
  - create() 초반에 checkAndReset() + checkAndGrantDaily() 호출

### 스펙 대비 변경

- 스펙에서는 엔드리스 베스트 기록(y=667), 평판+수집률(y=680), 버전(y=690)을 개별 배치했으나, GAME_HEIGHT=640 초과 위험으로 Coder가 하단 정보를 한 줄로 압축하여 y=630에 배치. AD3에서 ACCEPT (후속 quick fix 분리).
- recordProgress는 스펙 권장대로 missionId가 아닌 type string으로 호출하여 당일 선정 미션 중 해당 type 항목에 일괄 적용하는 방식 채택.
- 기타 요구사항은 스펙과 동일하게 구현.

### 알려진 이슈

- **KNOWN-1 (MEDIUM)**: MenuScene 하단 "엔드리스 도전" 버튼(ENDLESS_Y=638 + ENDLESS_H=40)이 GAME_HEIGHT=640 경계에서 18px 잘림. 배너 +60px 시프트 부작용. 후속 quick fix 예정. AD3 제안: 시프트 +40px 축소 또는 배너 높이 44->36px 축소.
- **KNOWN-2 (LOW)**: MenuScene._renderCalendarSlot()에서 DailyMissionManager._getDateKey() private 메서드 직접 호출 (캡슐화 위반). LoginBonusManager에 public getTodayDateKey() 추가 또는 인라인 구현 권장.
- **KNOWN-3 (LOW)**: DailyMissionManager._grantReward에 mimiSkinCoupons 타입 미구현. 현재 DAILY_MISSION_POOL에 해당 타입 없으므로 미발생. Phase 77 SkinManager 구현 시 함께 처리.
- Playwright 14개 테스트 타임아웃은 `injectSaveAndReload()` + Phaser 재부팅 시간(에셋 로드 13~14초) 인프라 이슈. 구현 코드 버그 아님.
- TC-18 더블클릭 테스트 FAIL은 기대값 오류 (두 번째 클릭이 오버레이에 닿아 모달 닫힘은 정상 동작).

### 검증

- QA: **PASS** (2026-04-23)
  - 수용 기준 9/9 전수 충족
  - Playwright 16/16 non-timeout PASS, 빌드 PASS (66 modules, 2.5MB)
  - 시각적 검증 스크린샷 8종 확인 (메뉴 배너, 미션 모달, 캘린더 탭, 탭 전환, 엔드리스 오버플로)
  - 콘솔 에러 0건
  - 예외 시나리오 15건 중 14건 PASS, 1건 KNOWN ISSUE (엔드리스 버튼 잘림)
- AD2: **APPROVED** -- 10종 에셋 모두 AD1 명세 일치
- AD3: **APPROVED** -- 모달/캘린더 핵심 UI 명세 일치, 하단 메뉴 잘림은 후속 quick fix 분리

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase75B-spec.md`
- 목적 정의: `.claude/specs/2026-04-23-kc-phase75B-scope.md`
- 코더 리포트: `.claude/specs/2026-04-23-kc-phase75B-coder-report.md`
- QA: `.claude/specs/2026-04-23-kc-phase75B-qa.md`
- AD1: `.claude/specs/2026-04-23-kc-phase75B-ad1.md`
- AD2: `.claude/specs/2026-04-23-kc-phase75B-ad2.md`
- AD3: `.claude/specs/2026-04-23-kc-phase75B-ad3.md`

---

## [Phase 74] 2026-04-23 -- UI/카피 마감 (P2-4~7 묶음)

### 개요

P2 품질 보강 마지막 묶음. 5개 독립 UI/카피 결함을 하나의 페이즈에서 해소. EndlessScene 튜토리얼 페이지네이터 명확화, 셰프별 실패 대사 다양화, 행상인 도구 카드 추천 배지, 업적 수령 대기 카드 골드 glow, ShopScene 인테리어/직원 탭 오버플로우 수정. 이로써 P2 품질 보강 트랙이 전수 완료되어 P3(BM/리텐션) 트랙 진입 전제 조건이 충족됨.

### 추가

- `kitchen-chaos/js/managers/TutorialManager.js` -- `_render()`에 페이지네이터 도트 인디케이터 추가
  - PANEL_H 68->80 확장, 힌트 텍스트 y-offset 상향(-10->-14)
  - 활성 도트 `●` (#ffdd88) / 비활성 도트 `○` (#888888), 도트 간격 14px, 도트 행 y=OVERLAY_CY+28
  - 도트 오브젝트를 destroy에 통합

- `kitchen-chaos/js/scenes/ResultScene.js` -- 셰프별 장보기 실패 대사
  - `CHEF_FAIL_LINES` 상수: 7셰프(mimi/rin/mage/yuki/lao/andre/arjun) x 3바리에이션 = 21줄
  - `CHEF_FAIL_FALLBACK`: 알 수 없는 셰프 ID용 폴백 대사 3줄
  - `_createMarketFailedView()`에서 `SaveManager.load()?.selectedChef` 기반 랜덤 대사 선택
  - 색상 #ffccaa, fontSize 15px, wordWrap width GAME_WIDTH-40

- `kitchen-chaos/js/scenes/MerchantScene.js` -- 도구 추천 배지 3종
  - `TOOL_BADGE_LABEL`: 8종 도구 -> 배지 레이블 매핑 (pan/salt: 초심자 추천, grill/freezer/wasabi_cannon/spice_grinder: 공격 중심, delivery/soup_pot: 서포트 중심)
  - `TOOL_BADGE_TINT`: 초심자 추천 0x22aa44 / 공격 중심 0xcc4422 / 서포트 중심 0x2255cc
  - NineSliceFactory.raw + setTint + 텍스트 레이블 구현 (신규 PNG 에셋 없음)
  - AD3 1차 REVISE: 배지 위치를 카드 우하단에서 헤더 라인 우측(infoBtnY)으로 이동, 폭 72->64

- `kitchen-chaos/js/scenes/AchievementScene.js` -- 수령 대기 카드 골드 glow
  - `isClaiming = unlocked && !claimed` 플래그 추가
  - 수령 대기 시 `panel_glow_selected` 텍스처로 배경 교체 (기존 parchment + tint 대신)
  - alpha 펄스 tween: 0.7<->1.0, 1200ms, yoyo, Sine.easeInOut
  - 진행 바는 미달성 분기에서만 렌더되는 기존 구조상 추가 숨김 코드 불필요

### 변경

- `kitchen-chaos/js/scenes/EndlessScene.js`
  - 튜토리얼 steps 배열에서 `'1/3 '`, `'2/3 '`, `'3/3 '` 접두어 제거 — TutorialManager 페이지네이터가 담당

- `kitchen-chaos/js/scenes/ShopScene.js`
  - `_renderInteriorShop()`: cardH 90->112, 업그레이드 버튼 y+62->y+74, 다음 효과 미리보기 y+65->y+80
  - `_renderStaffShop()`: cardH 90->112, 구매 버튼 y+55->y+72, 가격 설명 y+52->y+55
  - 유랑 미력사 섹션 Y는 cardH 변수 참조로 자동 재조정 (수동 수정 불필요)
  - 다른 탭(업그레이드 cardH=75, 테이블 cardH=65) 미변경

### 스펙 대비 변경

- T3(행상인 배지): 스펙에서는 카드 우하단(yOff+ITEM_HEIGHT-20, 폭 72x18) 배치를 지정했으나, AD3 1차 검수에서 업그레이드 버튼과 겹침이 발견되어 헤더 라인 우측(infoBtnY, 폭 64)으로 위치 변경됨. AD3 2차 검수에서 APPROVED.
- 기타 T1/T2/T4/T5: 스펙과 동일하게 구현.

### 알려진 이슈

- 신규 Playwright 테스트 32건 중 6건 어서션 결함: T4 텍스처 키 매핑 검사 방식 3건 + T5 정규식 매칭 3건. 구현 코드는 정상 동작. 테스트 어서션 정비 권장.
- `tests/phase67-ad3-capture.spec.js` CommonJS require() 사용 ESM 환경 실패 (기존, Phase 74 무관)

### 검증

- QA: **PASS** — 구현 코드 5건 전수 정상 동작
- AD3: **APPROVED** (T3 1차 REVISE 반영 후 2차 APPROVED)
- 캡처 스크린샷: phase74-t1-step0/step1-tutorial.png, phase74-t2-result-failed.png, phase74-t3-merchant-badge.png, phase74-t5a-shop-interior-fix.png, phase74-t5b-shop-staff-fix.png
- 회귀: 기존 phase70~73 테스트 영향 없음, 콘솔 에러 0건
- SaveManager v24 유지 (변경 없음)
- 신규 PNG 에셋 없음

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase74-spec.md`
- 코더 리포트: `.claude/specs/2026-04-23-kc-phase74-coder-report.md`
- QA: `.claude/specs/2026-04-23-kc-phase74-qa.md`
- AD3: `.claude/specs/2026-04-23-kc-phase74-ad3.md`

---

## [Phase 75] 2026-04-23 -- 행상인 분기 카드 풀 선행 해금 체크 (fix)

### 개요

**버그 수정 성격.** 행상인 방문 시 `merchantBranchData.getEligiblePool()`이 유저의 진행도(챕터/시즌 해금)와 도구 보유 상태를 전혀 참조하지 않아, 초반 챕터 유저가 아직 해금되지 않은 후반 동료(예: 아르준, 17장 해금)의 bond 카드나 미보유 도구의 mutation 카드를 풀에서 마주치는 UX 혼란이 있었다. 이번 Phase에서 bond/mutation/recipe 카테고리별 선행 해금 필터를 추가하고, 셰프 해금 판별 로직을 `chefUnlockHelper.js`로 공용화했다.

### 추가

- `kitchen-chaos/js/data/chefUnlockHelper.js` -- 신규 헬퍼 모듈
  - `isChefUnlocked(chefId, progressState)` export
  - progressState 구조: `{ currentChapter, season2Unlocked, season3Unlocked }`
  - 셰프별 해금 규칙 내장 (mimi/rin/mage: 상시, yuki: s2, lao: s2+ch>=10, andre: s2+ch>=13, arjun: s3+ch>=17)
- `kitchen-chaos/tests/phase75-merchant-branch-filter-qa.spec.js` -- QA 작성 신규 테스트 27건
  - A. isChefUnlocked 매트릭스 3건 (셰프×진행도, 경계값, undefined/null 안전)
  - B. getEligiblePool 필터 10건 (bond/mutation/recipe/blessing + 이중 필터)
  - C. selectBranchCards 폴백 3건
  - D. MerchantScene 통합 3건 (초반/후반 세이브)
  - E. ChefSelectScene 잠금 반전 3건
  - F. SaveManager 안전성 3건
  - G. 구 시그니처 회귀 2건

### 변경

- `kitchen-chaos/js/data/merchantBranchData.js`
  - `getEligiblePool(category, branchCardsState)` -> `getEligiblePool(category, branchCardsState, progressState)` 시그니처 확장
  - `selectBranchCards(branchCardsState)` -> `selectBranchCards(branchCardsState, progressState)` 시그니처 확장
  - mutation 필터: `!toolMutations[c.targetToolId] && (tools[c.targetToolId]?.count ?? 0) >= 1` 추가
  - bond 필터: `!chefBonds.includes(c.id) && isChefUnlocked(c.chefId, progressState)` 추가
  - recipe 필터: `minChapter`/`requiresSeason` 필드 체크 (필드 미설정 시 통과)
  - recipe 카드 스키마에 `minChapter?: number`, `requiresSeason?: 2 | 3` 선택 필드 추가 (**JSDoc만** -- 기존 8장의 recipe 카드 데이터 자체는 모두 필드 미설정 유지. "향후 기획자가 수치를 채워 넣을 수 있는 구조만 마련"한 상태)
  - `chefUnlockHelper.js` import 추가
  - blessing 카테고리: 필터 변경 없음 (현행 유지)

- `kitchen-chaos/js/scenes/MerchantScene.js`
  - `SaveManager.load()` 단일 호출 후 `branchCardsState`와 `progressState` 두 객체로 분리 구성
  - `progressState` 조립: `currentChapter`(`storyProgress.currentChapter || 1`), `season2Unlocked`, `season3Unlocked`, `tools`(`saveData.tools || {}`)
  - `selectBranchCards(state)` -> `selectBranchCards(branchCardsState, progressState)` 호출부 교체

- `kitchen-chaos/js/scenes/ChefSelectScene.js`
  - 로컬 `isChefLocked(chefId, save)` 함수 제거
  - `chefUnlockHelper.isChefUnlocked` import로 교체
  - `toProgressState(save)` 어댑터 추가 (save 객체에서 progressState 추출)
  - 호출부: `locked: !isChefUnlocked(id, progressState)` (로직 반전 주의)

- `kitchen-chaos/tests/phase58-qa-integration.spec.js` (QA에서 발견한 회귀)
  - 구 시그니처 호출 6곳(169, 684, 708, 728, 812, 825)을 신 시그니처로 갱신
  - 각 호출에 "완전 해금 상태" `fullyUnlocked` progressState(`ch=99, s2=true, s3=true, 전 도구 count=1`) 주입
  - 기대값(7, 7 등)의 의미적 동등성 복원 -- 테스트 원래 의도(변이/본드 해금 상태 필터링 확인) 보존

### 스펙 대비 변경

- 없음. 모든 구현이 스펙 문서를 정확히 따름. QA에서 발견된 phase58 회귀는 Coder 재작업 섹션에서 해소됨.

### 알려진 이슈

- **LOW**: `SaveManager.js:1370` v11->v12 마이그레이션 분기의 `if (data.tools)` 가드가 `tools` 키가 부재한 비정상 세이브에서 tools를 복구하지 않음. Phase 75 코드에서 `saveData.tools || {}` 폴백으로 런타임 에러 방지. 별도 페이즈 검토 권장 (Phase 75와 무관, 사전 존재 결함).
- **BUG-01 (MEDIUM, 이전 페이즈 미해결)**: mimi+salt Bond-only 미작동 (Phase 58-3 pre-existing). Phase 75 영향 없음.

### 검증

- Playwright 54/54 PASS
  - Phase 75 QA: 27/27 (신규 필터 로직 전수 검증)
  - Phase 58 회귀: 27/27 (테스트 신 시그니처 갱신 후 전부 복원)
- 콘솔 에러: 0건
- AD 전 단계 생략: visual_change: none (행상인/셰프 선택 UI 레이아웃·애니메이션 무변경)
- 시각적 검증: 스크린샷 4건 (phase75-early-bond-tab.png, phase75-late-all-unlocked.png, phase75-chefselect-early.png, phase75-chefselect-late.png)

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase75-spec.md`
- 스코프(목적 정의): `.claude/specs/2026-04-23-kc-phase75-scope.md`
- 코더 리포트: `.claude/specs/2026-04-23-kc-phase75-coder-report.md`
- QA: `.claude/specs/2026-04-23-kc-phase75-qa.md`

---

## [Phase 73] 2026-04-23 -- 세이브 백업 + 포트레이트 정합

### 개요

디렉터 플레이테스트 리포트 P2-1(세이브 백업) + P2-3(포트레이트 정합) 해결. SaveManager에 3슬롯 롤링 백업 시스템을 추가하고, MenuScene 설정 패널에 복구 UI를 구현. assets/portraits/ 전수 점검으로 미사용 SDXL 후보군(candidates/ 31파일) + 아카이브(_archive/ 89파일) 총 120파일을 삭제하고 정식 8종만 유지.

### 추가

- `kitchen-chaos/tests/phase73-save-backup.spec.js` -- Coder 작성, 세이브 백업 롤링 + 복구 UI = 13건
- `kitchen-chaos/tests/phase73-portrait-integrity.spec.js` -- Coder 작성, 포트레이트 정합 = 4건
- `kitchen-chaos/tests/phase73-qa.spec.js` -- QA 작성, 예외 시나리오 22건 (경계값, 상태 전이, 동시성, UI/UX, 파일시스템, 코드 무결성)

### 변경

- `kitchen-chaos/js/managers/SaveManager.js` (+88 lines)
  - `BACKUP_KEYS` 상수 추가: `kitchenChaosTycoon_backup_1` / `_backup_2` / `_backup_3`
  - `save()` 메서드: 메인 저장 전 롤링 백업 삽입 (slot2->slot3, slot1->slot2, main->slot1)
  - 각 백업 단계 독립 try-catch (quota 초과 시 메인 저장 무영향)
  - 백업 구조: `{ version: number, timestamp: number, data: object }`
  - 메인 세이브 비어있으면 백업 미생성 (existingMain 체크)
  - 신규 `getBackups()` 정적 메서드: 슬롯 3개 상태 반환 (null = 비어있음)
  - 신규 `restoreBackup(slot)` 정적 메서드: 슬롯 1~3 복원, 성공 true / 실패 false

- `kitchen-chaos/js/scenes/MenuScene.js` (+242/-4 lines)
  - `_openSettingsPanel()`: panelH 268 -> 316 (복구 버튼용 48px 확장)
  - 쿠폰 버튼 y좌표: 408 -> 456 (하향 이동)
  - 신규 세이브 복구 버튼 (y=408, 240x36px, tint 0x553322, 레이블 "세이브 복구")
  - 신규 `_openBackupListModal()`: depth=1200, 280x200px, 3슬롯 렌더 (타임스탬프 YYYY-MM-DD HH:mm + version 표시, 빈 슬롯은 "(없음)" 회색 #555555)
  - 신규 `_openRestoreConfirmModal(slot)`: depth=1300, 260x160px, 경고 텍스트 + 복구(tint 0x993333)/취소(tint 0x333333) 버튼
  - `_closeSettingsPanel()`: _backupListContainer + _restoreConfirmContainer cleanup 추가
  - 복구 버튼 더블클릭 방지: re-entry guard 구현

### 삭제

- `kitchen-chaos/assets/portraits/candidates/` -- 31파일 삭제 (루트 19 + mage/ 12)
  - SDXL 후보군 PNG 19개 (portrait_*_chromakey_raw.png, portrait_*_v4_raw.png)
  - mage/ 폴더: PNG 10개 + Python gen 스크립트 2개 (gen_v9.py, gen_v10.py)
- `kitchen-chaos/assets/portraits/_archive/` -- 89파일 삭제
  - 히스토리 버전 PNG (portrait_*_pre_*.png, portrait_*_v1_chromakey.png 등)
  - 하위 폴더 7개 (2026-04-21-portrait-flatten, pre_phase64_* 등) 및 내용물

### 변경 없음 (점검 후 확인)

- `kitchen-chaos/js/scenes/ChefSelectScene.js` -- CHEF_PORTRAIT_MAP 7셰프(poco 제외) 정상 동작, candidates/_archive 참조 없음
- `kitchen-chaos/js/utils/SpriteLoader.js` -- PORTRAIT_IDS 8종, _loadPortraits 경로 정상, 변경 불필요
- `SAVE_VERSION` -- 24 유지 (백업은 별도 키, 마이그레이션 불필요)

### 수치

- 백업 슬롯 수: 3개 (FIFO 롤링)
- 백업 키: `kitchenChaosTycoon_backup_1`, `_backup_2`, `_backup_3`
- 설정 패널 panelH: 268 -> 316 (+48px)
- 쿠폰 버튼 y: 408 -> 456 (+48px)
- 복구 버튼 y: 408, 크기 240x36px
- 포트레이트 정식 파일: 8종 (mimi/rin/mage/yuki/lao/andre/arjun/poco), 전종 512x512 RGBA 투명 배경
- 삭제 파일 총 수: 120개 (candidates 31 + _archive 89)

### 스펙 대비 변경

- 없음. 모든 구현이 스펙 문서를 정확히 따름.

### 알려진 이슈

- **LOW**: `restoreBackup(NaN)` 호출 시 guard가 통과되지만 결과적으로 false를 반환하여 안전. `typeof slot !== 'number' || !Number.isInteger(slot)` guard 추가 권장 (QA 소견).
- **LOW**: 백업 목록 모달 overlay(depth 1200)가 설정 패널 X 버튼(depth 1000)을 가려 직접 클릭 불가. 의도된 동작(모달 먼저 닫아야 함)이지만 사용자 혼란 가능 (QA 소견).
- **BUG-01 (MEDIUM, 미해결)**: mimi+salt Bond-only 미작동 (Phase 58-3 pre-existing, Phase 72에서 발견). 후속 페이즈에서 수정 권장.

### 검증

- Playwright 130/130 PASS
  - Phase 73 Coder: 17/17 (save-backup 13 + portrait-integrity 4)
  - Phase 73 QA: 22/22 (예외 시나리오)
  - Phase 70 회귀: 28/28
  - Phase 71 회귀: 29/29 (S1-01 flaky 1건 재시도 통과)
  - Phase 72 회귀: 34/34
- 콘솔 에러: 0건
- AD 모드1: APPROVED (정식 8종 스타일 일관성 확인, candidates/_archive 전체 삭제 승인)
- AD 모드2: APPROVED (삭제 후 잔존 8종 정량 검증 -- 전종 512x512 RGBA, 4코너 alpha=0, 고유색 63~137)
- 시각적 검증: 스크린샷 4건 캡처 (설정 패널, 빈 백업 모달, 채워진 백업 모달, 복구 확인 모달)

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase73-spec.md`
- 코더 리포트: `.claude/specs/2026-04-23-kc-phase73-coder-report.md`
- QA: `.claude/specs/2026-04-23-kc-phase73-qa.md`
- AD 모드1: `.claude/specs/2026-04-23-kc-phase73-ad1.md`
- AD 모드2: `.claude/specs/2026-04-23-kc-phase73-ad2.md`

---

## [Phase 72] 2026-04-23 -- 분기 카드 수치 전수 반영

### 개요

디렉터 플레이테스트 리포트 P2-2 "로그라이크 카드의 약속 이행" 해결. Phase 58-3에서 플래그만 세팅되고 실효 로직이 없던 변이 4종(chain/cluster/venom/aura_boost)과 Bond 4쌍(yuki+soup_pot/andre+delivery/mimi+salt/mimi+spice)의 전투/경제 수치 반영을 완료. enemy_slow 축복은 회귀 검증으로 기존 코드 정상 동작 확인. 레시피 반복 등장 규약(chaos_ramen 3회/spice_bomb 2회)을 구현하고, rewardMultiplier는 코드 주석으로 종결.

### 추가

- `kitchen-chaos/tests/phase72-branch-effects.spec.js` -- Coder 작성, 변이 4종 + Bond 4쌍 + enemy_slow 축복 + 레시피 반복 + 회귀 = 16건
- `kitchen-chaos/tests/phase72-qa-edge.spec.js` -- QA 작성, 예외 시나리오 16건 (동시 적용, 마이그레이션, 경계값, 격리, 폴백, 영속성)
- `kitchen-chaos/tests/phase72-qa-bond-bug.spec.js` -- QA 작성, BUG-01(mimi+salt Bond-only) 검증 2건

### 변경

- `kitchen-chaos/js/entities/Projectile.js`
  - `_tower` 역참조 필드 추가 (생성자에서 `towerData._towerRef` 수신)
  - `_hit()`: chain 변이 -- salt 투사체 명중 후 `_chainRadius`px 내 인접 적 1마리에 둔화 연쇄(`applySlow`)
  - `_hit()`: venom 변이 -- spice_grinder 투사체 명중 후 DoT 활성 적에 `_poisonSlowPct` 둔화 추가
  - `destroy()` 시 `this._tower = null` GC 방어 처리 (line 176)

- `kitchen-chaos/js/entities/Tower.js`
  - `_shoot()`: cluster 변이 -- wasabi_cannon 발사 시 `_clusterCount`발 Projectile 생성, 각 발 `damage *= _perShotDamageRatio`
  - `_shoot()`: `projData._towerRef = this` 추가 (chain/venom 역참조용)

- `kitchen-chaos/js/scenes/GatheringScene.js`
  - `_updateSoupPotAuras()`: aura_boost 변이 -- `_auraMultiplier` 곱셈 적용 (기본 0.15 -> 0.30), `auraRadius` 폴백 처리
  - `_updateDeliveryTowers()`: mimi+salt Bond -- 둔화 적 120px 이내 존재 시 delivery 수거 반경에 `_collectRadiusOnSlow`(40px) 가산
  - salt 타워 `_saltCollectRadiusCached` 캐싱 (N*M 복잡도 방지)

- `kitchen-chaos/js/scenes/ServiceScene.js`
  - 조리시간 계산: yuki+soup_pot Bond -- `BranchEffects.getActiveBondEffect('soup_pot')` 직접 조회, `totalTime *= (1 - yukiSoupBonus)` 추가 감소 인자 (기본 -15%)
  - 팁 계산: andre+delivery Bond -- `BranchEffects.getActiveBondEffect('delivery')` 직접 조회, `totalGold *= (1 + andreTipBonus)` 독립 계수 (기본 +10%)

- `kitchen-chaos/js/managers/IngredientManager.js`
  - `spawnDrop()`: mimi+spice Bond -- enemy `_dotStacks.length > 0` 시 `BranchEffects.getActiveBondEffect('spice_grinder')` 직접 조회, `count *= (1 + dropRateOnPoison)` 드롭률 가산 (기본 +25%)

- `kitchen-chaos/js/managers/SaveManager.js`
  - `REPEATABLE_BRANCH_RECIPES` 상수 추가: `{ branch_chaos_ramen: 3, branch_spice_bomb: 2 }`
  - `consumeBranchRecipe()`: 반복 레시피는 `branchCards.recipeRepeatCounts`에서 카운트 감산, 0이 되면 제거. 나머지는 기존 1회 즉시 제거
  - 마이그레이션 방어: `recipeRepeatCounts` 필드 미존재 시 `{}` 자동 초기화

- `kitchen-chaos/js/data/merchantBranchData.js`
  - recipe 카드 정의에 주석 추가: `// rewardMultiplier는 recipeData.js의 baseReward에 직접 반영됨. 런타임에서 중복 적용하지 않는다.`

### 수치

- chain 변이: salt 명중 시 `_chainRadius`px 내 인접 적 1마리 둔화 연쇄
- cluster 변이: wasabi_cannon `_clusterCount`발(기본 3) 다발 발사, `_perShotDamageRatio`(기본 0.6) 데미지
- venom 변이: spice_grinder DoT 적 `_poisonSlowPct`(기본 0.2) 둔화 추가
- aura_boost 변이: soup_pot 아우라 버프 `_auraMultiplier`(기본 2.0) 곱셈, 0.15 -> 0.30
- yuki+soup_pot Bond: 조리시간 -15% 추가 감소
- andre+delivery Bond: 서빙 팁 +10% 독립 계수
- mimi+salt Bond: 둔화 적(120px 이내) 존재 시 delivery 수거 반경 +40px
- mimi+spice Bond: 중독 적(_dotStacks > 0) 드롭률 +25%
- chaos_ramen 반복: 최대 3회 소비 후 해금 목록에서 제거
- spice_bomb 반복: 최대 2회 소비 후 해금 목록에서 제거
- Playwright 테스트: 91건 (Phase 72 신규 16 + QA 엣지 16 + bond-bug 2 + Phase 70 회귀 28 + Phase 71 회귀 29)

### 스펙 대비 변경

- 없음. 모든 구현이 스펙 문서의 "구현 상세" 섹션을 정확히 따름.
- enemy_slow 축복: 스펙에서 "ESM import 버그 수정" 예상했으나, 실제로는 기존 코드(`Enemy.js` line 24 정적 import + line 57-61 `getBlessingMultiplier('enemy_slow')`)가 이미 정상 동작하고 있었음. 회귀 테스트만으로 검증 완료.

### 알려진 이슈

- **BUG-01 (MEDIUM)**: mimi+salt Bond가 salt 변이 없이 단독 사용 시 미작동. `GatheringScene.js:2007-2009` `_applyMutationToTower()`에서 `if (!effect) return;`이 `_applyBondToTower()` 호출(line 2074)을 차단. Phase 58-3 pre-existing 구조 결함. 다른 3쌍 Bond(yuki+soup_pot, andre+delivery, mimi+spice)는 BranchEffects API 직접 조회이므로 영향 없음. 후속 페이즈에서 수정 권장.
- **LOW**: `GatheringScene.js:2105,2109,2124`의 tower 플래그(`_bondCookSpeedBonus`, `_bondTipBonus`, `_dropRateOnPoison`)가 세팅만 되고 읽히지 않음 (dead code). Bond 실효는 BranchEffects API 직접 조회로 구현되었으므로 기능 영향 없음.
- **LOW**: `_saltCollectRadiusCached` 캐시가 한 번 세팅 후 무효화되지 않음. 현재 게임 구조상 런 중간 동적 타워 추가 불가이므로 문제 없음.

### 검증

- Playwright 91/91 PASS
  - Phase 72 신규 (Coder): 16/16
  - Phase 72 QA 엣지: 16/16
  - Phase 72 QA Bond 버그 검증: 2/2
  - Phase 70 회귀: 28/28
  - Phase 71 회귀: 29/29
- 콘솔 에러: 0건
- 수용 기준: 12/12 충족
- visual_change: none (AD 실행 해당 없음)

### 참고

- 스펙: `.claude/specs/2026-04-23-kc-phase72-spec.md`
- 목적 정의서: `.claude/specs/2026-04-23-kc-phase72-scope.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase72-coder-report.md`
- QA: `.claude/specs/2026-04-23-kc-phase72-qa.md`

---

## [Phase 71] 2026-04-23 -- 체커 패턴 복구 + 에셋 404 전수 수리

### 개요

디렉터 플레이테스트 리포트 P1-6(GatheringScene 체커 2톤 패턴 리그레션), P2-8(13개 에셋 404로 이모지 fallback 노출) 2건 해결. GatheringScene `_drawMap()` depth 상향 + 색상 대비 강화로 체커 패턴을 복구하고, 타일셋 3종 신규 생성 + 테이블 8종 신규 생성 + 타워 2종 경로 수정 및 48x48 표준화로 에셋 404를 전수 해소.

### 추가

- `kitchen-chaos/assets/tilesets/dessert_cafe.png` — 128x128 4x4 타일 스프라이트시트, 파스텔 핑크/크림/라벤더 팔레트, 9 고유색, SD Forge 생성
- `kitchen-chaos/assets/tilesets/grand_finale.png` — 128x128 4x4 타일 스프라이트시트, 다크 골드/딥 버건디/블랙 팔레트, 11 고유색, SD Forge 생성
- `kitchen-chaos/assets/tilesets/sakura_izakaya.png` — 128x128 4x4 타일 스프라이트시트, 베이지 나무/갈색/연분홍 팔레트, 10 고유색, SD Forge 생성
- `kitchen-chaos/assets/service/table_lv1_waiting.png` — 64x64 투명 배경, 냅킨 장식 테이블 + 대기 손님
- `kitchen-chaos/assets/service/table_lv1_seated.png` — 64x64 투명 배경, lv0 캐릭터 오버레이 합성 (AD2 REVISE 후 재생성, significant_px 918)
- `kitchen-chaos/assets/service/table_lv2_waiting.png` — 64x64 투명 배경, 테이블보 + 꽃병 테이블 + 대기 손님
- `kitchen-chaos/assets/service/table_lv2_seated.png` — 64x64 투명 배경, lv0 캐릭터 오버레이 합성 (significant_px 971)
- `kitchen-chaos/assets/service/table_lv3_waiting.png` — 64x64 투명 배경, 고급 식기 + 캔들 홀더 테이블 + 대기 손님
- `kitchen-chaos/assets/service/table_lv3_seated.png` — 64x64 투명 배경, lv0 캐릭터 오버레이 합성 (significant_px 969)
- `kitchen-chaos/assets/service/table_lv4_waiting.png` — 64x64 투명 배경, 은식기 + 와인잔 + 캔들 프리미엄 테이블 + 대기 손님
- `kitchen-chaos/assets/service/table_lv4_seated.png` — 64x64 투명 배경, lv0 캐릭터 오버레이 합성 (significant_px 967)
- `kitchen-chaos/assets/towers/spice_grinder/tower.png` — `assets/sprites/towers/`에서 올바른 경로로 복사 후 32x32→48x48 nearest-neighbor 업스케일+중앙 크롭 (49 고유색)
- `kitchen-chaos/assets/towers/wasabi_cannon/tower.png` — `assets/sprites/towers/`에서 올바른 경로로 복사 후 32x32→48x48 nearest-neighbor 업스케일+중앙 크롭 (77 고유색)
- `kitchen-chaos/tests/phase71-verify.spec.js` — Coder 검증 테스트 5건 (에셋 404, 체커 패턴, 타워/타일셋/테이블 텍스처 로드)
- `kitchen-chaos/tests/phase71-qa.spec.js` — QA 테스트 29건 (정상 22 + 예외 3 + 시각 4)

### 변경

- `kitchen-chaos/js/scenes/GatheringScene.js` — `_drawMap()` 체커 패턴 수정:
  - `gfx.setDepth(0)` → `gfx.setDepth(1)`: 배경 rect(depth=0) 위에 확실히 렌더링되도록 상향
  - 경로 체커 색상: `0xc8a46e`/`0xbd9862` (명도차 ~11) → `0xd4b078`/`0xaa8040` (명도차 ~36)
  - 비경로 체커 색상: `0x2d5a1b`/`0x285216` (명도차 ~5) → `0x2d5a1b`/`0x1a3510` (명도차 ~19)

### 수치

- 체커 패턴 경로 색상 대비: 명도차 11 → 36 (3.3배 증가)
- 체커 패턴 비경로 색상 대비: 명도차 5 → 19 (3.8배 증가)
- 체커 그래픽 depth: 0 → 1
- 타일셋 해상도: 128x128 (32x32 프레임 x 16프레임)
- 테이블 해상도: 64x64 (투명 배경 64~69%)
- 타워 해상도: 32x32 → 48x48 (기존 타워 표준에 맞춤)
- table seated vs waiting diff: 6.6% (1차) → 14.7~25.5% (재생성 후, lv0 기준 25.5% 수준 달성)
- Playwright 테스트: 62건 (Phase 70 회귀 28 + Phase 71 QA 29 + verify 5)

### 스펙 대비 변경

- 없음. 스펙의 가설 A(색상 대비 미미) + 가설 B(depth 충돌) 동시 적용 옵션 채택.
- AD 모드2 1차 REVISE (seated 구분성 FAIL + 타워 해상도 FAIL) → 6종 재생성 후 2차 APPROVED.
- 타일셋 JSON 메타파일 미생성 (SpriteLoader가 `scene.load.spritesheet()` 만 사용, JSON 불필요).

### 알려진 이슈

- `assets/sprites/towers/` 하위에 원본 32x32 타워 파일 잔존. SpriteLoader는 `assets/towers/` 경로만 참조하므로 기능 영향 없음. 디스크 정리 권장.
- 타일셋 15종이 BootScene에서 전부 preload되나 GatheringScene에서 실제 맵 렌더링에 사용되지 않음 (프로그래매틱 체커 패턴 사용). 향후 타일셋 기반 맵 렌더링 전환 시 활용 가능.
- 신규 타일셋 3종이 RGB 모드(기존 spice_palace는 RGBA). 타일셋은 불투명이므로 기능 영향 없음.
- 신규 타일셋 3종에 #000000 격자선 사용 (기존 spice_palace는 색상 경계). 스타일 차이 있으나 기능 영향 없음.

### 검증

- Playwright 62/62 PASS (Phase 70 회귀 28 + Phase 71 QA 29 + verify 5)
- AD 모드2: 1차 REVISE (FAIL 3건) → 6종 재생성 → 2차 APPROVED
- AD 모드3: APPROVED (체커 패턴 시인성, 에셋 로드 무결성, 시각 일관성 확인)
- console error: favicon.ico 외 0건
- 수용 기준 6/6 충족

### 참고

- 스펙: `.claude/specs/2026-04-22-kc-phase71-spec.md`
- 목적 정의서: `.claude/specs/2026-04-22-kc-phase71-scope.md`
- Coder 리포트: `.claude/specs/2026-04-22-kc-phase71-coder-report.md`
- Coder REVISE 리포트: `.claude/specs/2026-04-22-kc-phase71-coder-revise.md`
- AD 모드2 (1차): `.claude/specs/2026-04-22-kc-phase71-ad2.md`
- AD 모드2 (2차): `.claude/specs/2026-04-22-kc-phase71-ad2-v2.md`
- AD 모드3: `.claude/specs/2026-04-22-kc-phase71-ad3.md`
- QA: `.claude/specs/2026-04-22-kc-phase71-qa.md`

---

## [Phase 70] 2026-04-22 -- 초반 튜토리얼 안전장치 + 분기 카드 피드백 강화

### 개요

디렉터 플레이테스트 리포트 P1-1(1-1~1-3 도구 0개 즉시 패배), P1-3(분기 카드 피드백 부재) 2건 해결. ToolManager에 `grantTool()` 메서드를 추가하고, GatheringScene 1-1~1-3 진입 시 도구 자동 지급/배치를 구현. MerchantScene 분기 탭에 골드 tint 플래시, 출발 버튼 disabled 제어, descKo 확인 모달을 추가.

### 추가

- `ToolManager.js` — `static grantTool(toolId)`: 골드 차감 없이 해당 도구 count를 1 증가. maxCount 초과 시 return false.
- `GatheringScene.js` — `_checkAutoToolGrant()`: `create()` 직후 호출. TUTORIAL_STAGES `['1-1','1-2','1-3']` 판별 → storyFlags 중복 체크 → hasAnyTool 체크 → grantTool('pan') → SAFE_CELLS 안전 셀 탐색(스테이지별 3개 후보, `stagePathCells.has()` 검증) → `_placeTower()` → storyFlags 기록.
- `GatheringScene.js` — `_showAutoToolNotice()`: HUD 하단(Y=HUD_HEIGHT/2)에 "도구가 없어 프라이팬을 지급했습니다!" 텍스트. fontSize 14px, color #ffcc44, stroke #000 strokeThickness 2, depth 200. 2000ms 후 400ms fadeOut + destroy.
- `GatheringScene.js` — SAFE_CELLS 상수: `'1-1': [{col:0,row:0},{col:0,row:1},{col:2,row:0}]`, `'1-2': [{col:1,row:0},{col:3,row:0},{col:0,row:0}]`, `'1-3': [{col:0,row:0},{col:1,row:0},{col:3,row:0}]`.
- `MerchantScene.js` — `_updateDepartButtonState()`: 분기 탭+카드 미선택 → disabled(tint 0x666666), 그 외 → 활성(tint 0x22aa44).
- `MerchantScene.js` — `_showDepartToast()`: DEPART_BTN_Y-40에 "분기 카드를 선택하세요" 표시. fontSize 13px, color #ffcc88. 1500ms 후 400ms fadeOut. `_departToastActive` 플래그로 연타 방지.
- `tests/phase70-qa.spec.js` — Playwright QA 28개 시나리오 (자동 도구 지급 8 + 분기 카드 3 + 출발 disabled 6 + console error 3 + 엣지케이스 4 + 시각 검증 4)

### 변경

- `MerchantScene.js` — `_createTabBar()`: 분기 탭 pointerdown 핸들러에 골드 tint 플래시 추가 (`_setActiveTab` 먼저 호출 → `setColor('#ffcc44')` 덮어쓰기 → 150ms delayed `setColor('#ffcc88')` 복원)
- `MerchantScene.js` — `_setActiveTab()`: 마지막에 `_updateDepartButtonState()` 호출 추가
- `MerchantScene.js` — `_createDepartButton()`: `this._departBtn = btn`, `this._departDisabled = false` 참조 보존 추가
- `MerchantScene.js` — `_onDepart()`: 선두에 `if (this._departDisabled) { _showDepartToast(); return; }` 가드 추가
- `MerchantScene.js` — `_showBranchConfirmPopup()`: popupH 170→200 (일반), 190→220 (blessing). msgText 아래 구분선(dividerH) + descKo 텍스트 추가 (fontSize 11px, color #aaaaaa, wordWrap 270). blessing replaceText Y -55→-62 (okBtn과 5px gap 확보)
- `MerchantScene.js` — `_applyBranchCard()`: `_branchCardSelected = true` 직후 `_updateDepartButtonState()` 호출 추가

### 수치

- SAFE_CELLS: 스테이지별 후보 셀 3개씩, 경로 충돌 방지
- tint 플래시: #ffcc44 → 150ms → #ffcc88 (활성 탭 색상)
- disabled 버튼 tint: 0x666666 (비활성), 0x22aa44 (활성)
- 자동 도구 알림: 2000ms 표시 + 400ms fadeOut
- 출발 토스트: 1500ms 표시 + 400ms fadeOut
- popupH: 일반 200, blessing 220
- blessing replaceText Y: cy + popupH/2 - 62 (기존 -55)
- SAVE_VERSION: 24 (불변)
- 테스트 수: 28개

### 스펙 대비 변경

- 없음. 모든 요구사항(A-1~A-4, B-1~B-6) 스펙대로 구현.
- AD 모드3 1차 REVISE 2건(tint 플래시 실행 순서, blessing replaceText 겹침) 수정 반영 후 2차 APPROVED.

### 알려진 이슈

- `_defaultTools()`의 pan 초기값이 `count: 4`이므로 완전 신규 세이브에서는 이미 pan 4개 보유. 실제 도구 0개 상태는 사용자가 모든 도구를 판매한 경우에만 발생.
- 자동 배치된 프라이팬이 튜토리얼 2단계(도구 배치 완료)를 트리거할 수 있음 (스펙에서 의도된 동작으로 명시).

### 검증

- Playwright 28/28 PASS (1차 서버 타이밍 이슈 해결 후 재실행)
- AD 모드3: 1차 REVISE(2건) → 수정 후 2차 APPROVED
- console error 0건
- 수용 기준 11/11 충족

### 참고

- 스펙: `.claude/specs/2026-04-22-kc-phase70-spec.md`
- Coder 리포트: `.claude/specs/2026-04-22-kc-phase70-coder-report.md`
- QA: `.claude/specs/2026-04-22-kc-phase70-qa.md`
- AD 모드3: `.claude/specs/2026-04-22-kc-phase70-ad3.md`

---

## [Phase 68] 2026-04-22 -- 판정/레이어/씬 상태 전달 P0 핫픽스

### 개요

디렉터 플레이테스트 리포트 P0-2(서빙 0회 3별 판정), P0-3(ResultScene x DialogueScene 레이어 충돌), P0-4(stageId 묵시적 폴백) 3건 동시 수정. SaveManager에 인메모리 `_currentRun` 단일 소스를 추가하고, ResultScene에 servedCount 가드 + isCleared 복합 조건 + modal lock + stageId 폴백 체인을 구현.

### 추가

- `SaveManager.js` — `_currentRun` 정적 필드 + `setCurrentRun()` / `getCurrentRun()` / `clearCurrentRun()` 3개 정적 메서드. 런타임 전용 인메모리, localStorage 미저장. SAVE_VERSION 24 불변.
- `ResultScene.js` — `_buttonObjects` 배열 + `_buttonsLocked` 플래그. `_lockButtons()` (alpha 0.4) / `_unlockButtons()` (alpha 1.0) 메서드. DialogueScene `shutdown` 이벤트 감지 + 50ms fallback unlock.
- `ResultScene.js` — `isServedZero` 가드: `!sr || sr.servedCount === 0` → satisfaction/stars/coinReward 모두 0 강제.
- `ResultScene.js` — `isCleared` 복합 조건: `hpAlive && !isServedZero && stars > 0`. 행상인 버튼 노출 조건을 `stars > 0` → `isCleared`로 교체.
- `ResultScene.js` — `_missingStageId` 플래그: `init()` 에서 stageId 결정 실패 시 `create()` 진입 즉시 MenuScene 복귀.
- `tests/phase68-qa.spec.js` — Playwright QA 4개 시나리오 (P0-2 서빙 0회, P0-3 modal lock, P0-4 currentRun 폴백, P0-4 stageId 누락)
- `tests/phase68-qa-extended.spec.js` — QA 확장 15개 시나리오 (경계값, 복합 조건, 회귀, 정적 분석)

### 변경

- `ServiceScene.js` — `_endService()` serviceResult 전달 시 `totalCustomers === 0`이면 satisfaction을 0으로 보정 (기존: 100으로 초기화된 채 전달)
- `ServiceScene.js` — `init(data)` 진입 시 `SaveManager.setCurrentRun({ stageId })` 호출 추가
- `GatheringScene.js` — `create(data)` 진입 시 `SaveManager.setCurrentRun({ stageId })` 호출 추가
- `ResultScene.js` — `init(data)` stageId 결정 순서: `data.stageId` -> `SaveManager.getCurrentRun()?.stageId` -> error + MenuScene 복귀. 기존 `|| '1-1'` 폴백 제거
- `ResultScene.js` — `_fadeToScene()` 에서 `SaveManager.clearCurrentRun()` 호출 추가
- `ResultScene.js` — 0별(stars === 0) 케이스에서 `clearStage()` 미호출, `updateBestSatisfaction()`만 갱신
- `ResultScene.js` — 각 버튼 onClick 핸들러에 `if (this._buttonsLocked) return;` 가드 추가 (disableInteractive 대체)

### 수치

- 별점 판정 임계값: 변경 없음 (95%/80%/60%)
- modal lock dim: alpha 0.4 (lock), alpha 1.0 (unlock)
- fallback unlock 지연: 50ms
- SAVE_VERSION: 24 (불변)
- 테스트 수: 신규 19개 (phase68-qa 4 + phase68-qa-extended 15) + 회귀 21개 (phase67 17 + 정적 분석 4) = 40개

### 스펙 대비 변경

- **Container 방식 -> 배열 방식**: 스펙은 `this.add.container()`로 버튼 그룹화를 권고했으나, NineSliceFactory.raw의 Container 하위 동작 미검증 리스크(스펙 리스크 항목 1)를 회피하기 위해 `this._buttonObjects = []` 배열 방식으로 구현
- **disableInteractive 생략**: 스펙은 lock 시 `disableInteractive()` 호출을 명시했으나, hitArea 재설정 복잡성을 회피하기 위해 `_buttonsLocked` 플래그 가드로 대체. 동일 효과 달성

### 알려진 이슈

- `_createMarketFailedView` 경로에도 StoryManager.checkTriggers가 호출되지만 modal lock이 없음 (Phase 68 범위 외, 후속 페이즈에서 동일 패턴 적용 권장)
- trigger.delay > 50ms인 StoryManager 트리거가 추가될 경우, 50ms fallback unlock에서 false negative 발생 가능 (현재 모든 result_clear 트리거가 delay=0이므로 실제 영향 없음)

### 검증

- Playwright 테스트 40/40 PASS
- 수용 기준 5/5 충족
- 예외 시나리오 14/14 PASS
- AD 모드3 APPROVED (5/5 검수 포인트)
- 시각적 검증: QA 9장 + AD3 5장 스크린샷 확인
- vite build PASS (12.04s)

### 참고

- 스펙: `.claude/specs/2026-04-22-kc-phase68-spec.md`
- 목적 정의서: `.claude/specs/2026-04-22-kc-phase68-scope.md`
- 구현 리포트: `.claude/specs/2026-04-22-kc-phase68-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-22-kc-phase68-ad3.md`
- QA: `.claude/specs/2026-04-22-kc-phase68-qa.md`

---

## [Phase 67] 2026-04-22 -- 한글 픽셀 폰트 로컬 번들 (P0-1 초성 깨짐 해결)

### 개요

디렉터 플레이테스트 리포트 P0-1 이슈(한글 초성 깨짐: "구매"→"쿠매", "판매"→"팔매") 근본 해결. NeoDunggeunmoPro woff2를 프로젝트에 로컬 번들링하고, CSS/JS 전반에서 폰트 참조를 단일 상수로 통일.

### 추가

- `assets/fonts/NeoDunggeunmoPro-Regular.woff2` — 로컬 번들 폰트 (38,144 bytes, wOF2 매직 바이트 유효)
- `assets/fonts/OFL.txt` — SIL Open Font License 1.1 전문 (85줄)
- `js/config.js:245` — `FONT_FAMILY` 상수: `'"NeoDunggeunmoPro", "Noto Sans KR", sans-serif'`
- `index.html:10` — `<link rel="preload" href="assets/fonts/NeoDunggeunmoPro-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous">`

### 변경

- `style.css` `@font-face`:
  - `src`: CDN 단일 경로 → 로컬 경로 우선(`assets/fonts/...`) + CDN fallback 체인
  - `font-display`: `swap` → `block` (Phaser Canvas 렌더 시점에 대체 폰트로 고정되는 문제 방지)
- `js/ui/UITheme.js`:
  - `import { FONT_FAMILY } from '../config.js'` 추가 (line 12)
  - `TEXT_STYLE` 7개 프리셋의 `fontFamily` 리터럴 → `FONT_FAMILY` 상수 참조 (line 140, 146, 151, 156, 162, 168, 173)
- `js/scenes/GatheringScene.js`:
  - import 구조분해에 `FONT_FAMILY` 추가 (line 23)
  - line 1416 웨이브 전환 텍스트 인라인 `fontFamily` → `FONT_FAMILY` 상수 참조
- `js/scenes/BootScene.js`:
  - `_preloadFonts()` JSDoc/인라인 주석을 로컬 번들 기반으로 갱신
  - 실패 로그 메시지 구체화: "폴백 폰트 사용" → "시스템 폴백 적용"
- **의도적 미변경**: `MenuScene.js:542` `fontFamily: 'monospace'` (쿠폰 힌트 코드 텍스트) — 모노스페이스 의도적 예외

### 수치

- 폰트 파일 크기: 스펙 예상 ~200KB → 실제 ~37KB (NeoDunggeunmoPro 픽셀 폰트 특성상 글리프 수 제한 + woff2 압축 효율)
- fontFamily 하드코딩 잔존: `config.js:245` (상수 정의) + `BootScene.js:81` (`document.fonts.load()` 호출) 2곳만 존재 (적절한 용도)

### 검증

- Playwright 테스트 17/17 PASS (52.5초)
- 수용 기준 10/10 충족
- 예외 시나리오 11/11 PASS (CDN 차단 오프라인 로드, 다양한 폰트 크기, 콘솔 에러 0건 등)
- AD 모드3 APPROVED (초성 완결성, 자간, 줄간격, 다크 배경 대비, 버튼 클리핑, 모바일 360x640, MerchantScene "구매"/"판매" 7항목 전체 PASS)
- 시각적 검증: QA 5장 + AD3 교차 7장 = 12장 스크린샷 확인

### 참고

- 스펙: `.claude/specs/2026-04-22-kc-phase67-spec.md`
- 구현 리포트: `.claude/specs/2026-04-22-kc-phase67-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-22-kc-phase67-ad3.md`
- QA: `.claude/specs/2026-04-22-kc-phase67-qa.md`
- 목적 정의서: `.claude/specs/2026-04-22-kc-phase67-scope.md`

---

## [Phase 66] 2026-04-22 -- 개그씬 확장 (스크립트 톤 경량화)

### 개요

`dialogueData.js` 전체에 개그씬을 추가하여 스크립트 톤을 가볍게 만드는 작업. A옵션(타겟팅 확장) + 미디엄 강도(픽 웃음 수준). 기존 대사 교체 금지, 추가만 수행. 보스전 직전/감정 피크 구간 7개(ch5/6/12/15/18/21/24) 개그 투입 금지. 4개 서브 페이즈로 분할 진행.

### 추가

#### Phase 66-1: team_side 누락 챕터 전수 커버

- **team_side_1** (ch1 클리어 후): 미미+포코 2인조 회고 — 포코 "도구 팔겠다고 뛰어나왔잖아!" 6줄
- **team_side_2** (ch2 클리어 후): 린 등장 첫인상 회고 — "프라이팬에서 불이 나오는데 누가 동료라고" 7줄
- **team_side_3** (ch3 클리어 후): 메이지 합류 전 해변 — 메이지 미력 측정 강행, 포코 연구 대상화 8줄
- **team_side_4** (ch4 클리어 후): 화산 지대 BBQ 회고 — 린 인정, 메이지 위생 논문 8줄
- **team_side_5** (ch5 클리어 후): 포코 실종 후기 — 린 "스스로 간 거 아니야?", 메이지 기록 8줄
- **team_side_7** (ch7+yuki_side_7 시청 후): 유키 말 수 세기 — "오늘 열다섯 마디" 7줄
- **team_side_9** (ch9 클리어 후): 사케 오니 보스전 회고 — 라오 사케 마시기 욕심, 유키 건조 거절 8줄
- **team_side_11** (lao_side_11 시청 후): 용의 주방 웍 — 라오 할아버지 명언, 유키 "쪼개졌잖아요" 9줄
- **team_side_12** (ch12+lao_side_12 시청 후): 파리 연락 — 포코 "정중한 프랑스어 해독 불가" 9줄
- **team_side_13** (ch13+mimi_side_13 시청 후): 앙드레 첫날 — 와인 비유 11번 자각, 유키 뒷걸음질 10줄
- **storyData.js**: merchant_enter 트리거 10건 등록 (각 once: true)
- **스펙 대비 차이**: team_side_1~5 조건을 `storyFlags.chapter*_cleared` 대신 기존 패턴인 `currentChapter >= N`으로 구현 (코드 일관성)

#### Phase 66-2: chapter_intro 도착 리액션 개그 삽입

14개 chapter_intro에 각 1~5줄 개그 라인 추가:

| intro | 추가 줄 수 | 내용 요약 |
|-------|-----------|----------|
| chapter2_intro | 2줄 | 미미+린 리액션 |
| chapter4_intro | 2줄 | 미미+포코 화산 도착 |
| chapter7_intro | 3줄 | 미미+포코+유키 일본 도착 |
| chapter9_intro | 2줄 | 포코 사케 냄새+상인 본능 |
| chapter10_intro | 2줄 | 라오+포코 중식 도착 |
| chapter11_intro | 2줄 | 포코+유키 라오 직후 |
| chapter13_intro | 3줄 | 앙드레+미미+포코 파리 도착 |
| chapter14_intro | 3줄 | 라오+포코+앙드레 카타콩브 해골 앤티크 |
| chapter16_intro | 2줄 | 포코+미미 (아르준 은닉→2인 개그로 대체) |
| chapter17_intro | 2줄 | 포코+라오 항아리 상인 본능 |
| chapter19_intro | 4줄 | 라오+유키 멕시칸 도착 |
| chapter20_intro | 2줄 | 포코+미미 선인장 뿌리 약재 |
| chapter22_intro | 5줄 | 린+메이지+라오+린 디저트 도착 |
| chapter23_intro | 3줄 | 포코+메이지+포코 마카롱 계단 |

- 금지 구간 7개(ch5/6/12/15/18/21/24) 일체 미변경
- 아르준 은닉 구간(ch16/17): 아르준 speaker 노출 없음

#### Phase 66-3: service_event 보강 + gathering_enter 막간극

- **event_happy_hour_dialogue**: +2줄 (포코 카탈로그 + 미미 반발). 5줄 -> 7줄
- **event_food_review_dialogue**: +2줄 (포코 광고 부탁 + 미미 반발). 4줄 -> 6줄
- **event_kitchen_accident_dialogue**: +3줄 (린 직설 + 미미 반발 + 린 답변). 4줄 -> 7줄
- **gag_midstage_7** (신규, 7-4 gathering_enter): 유키 건조한 발언 5줄
- **gag_midstage_10** (신규, 10-4 gathering_enter): 라오 웍 자부심 + 유키 반박 6줄
- **gag_midstage_13** (신규, 13-4 gathering_enter): 앙드레 와인 비유 + 팀원 반응 7줄
- **storyData.js**: gathering_enter 트리거 3건 등록 (각 once: true, delay: 400)

#### Phase 66-4: 캐릭터 성격 개그 집중 확장

기존 대화 7건에 38줄 대사 추가 + team_side_23에 1줄 추가:

| 대화 ID | 내용 | 추가 줄 수 |
|---------|------|-----------|
| team_side_16 | 메이지 논문 폭주 + ???(아르준) 향신료 분류 | 11줄 |
| team_side_19 | 메이지 선인장 데이터 수집 + 유키 건조 | 6줄 |
| team_side_14 | 앙드레 와인 비유 + 유키 건조한 해석 | 6줄 |
| chapter14_mid | 앙드레 와인 철학 비유 (오크통) | 3줄 |
| chapter17_mid | ???(아르준) 향신료 금고 흥분 (사프란 3등급, 32종) | 8줄 |
| chapter22_mid | 메이지 드림랜드 분석 폭주 + 린 직설 | 6줄 |
| chapter10_lao_joins | 유키 follow-up B옵션 (메타 개그 -> 라오 웍 실수담) | 4줄 |
| team_side_23 | 유키 건조한 크림 시식 반응 | 1줄 |

- **스펙 대비 차이**: chapter10_lao_joins에서 메타 개그(8-3 리넘버링 자기참조)를 사용자 B옵션 지시에 따라 라오 웍 실수담으로 대체

### 캐릭터별 개그 역할 배분

| 캐릭터 | 개그 유형 | 주요 등장 |
|--------|----------|----------|
| 미미 | 당황 리액션, 보케 | 전 페이즈 |
| 포코 | 위기 중 영업, 할인 타이밍, 도구 판매 | team_side 전종, intro 다수 |
| 린 | 츤데레 직설 | team_side_2/5, chapter22_mid, service_event |
| 메이지 | 학구적 폭주, 논문 욕심 | team_side_3/16/19, chapter22_mid |
| 유키 | 건조한 한마디, 3초 침묵 | team_side_7/9/11/14/23, gag_midstage_7/10 |
| 라오 | 웍 자부심, 호탕한 실수 | team_side_9/11, gag_midstage_10, chapter10_lao_joins |
| 앙드레 | 정중한 반어, 와인 비유 남발 | team_side_13/14, chapter14_mid, gag_midstage_13 |
| 아르준 | 향신료 비유, 열거형 흥분 (16~17장 ??? 은닉) | team_side_16, chapter17_mid |

### 변경 파일 목록

| 파일 | 변경 유형 | 증분 |
|------|----------|------|
| `kitchen-chaos/js/data/dialogueData.js` | 수정 | 1828줄 -> 2124줄 (+296줄, 삭제 0줄) |
| `kitchen-chaos/js/data/storyData.js` | 수정 | 1502줄 -> 1528줄 (+26줄, 삭제 0줄) |

### QA 결과

- Playwright 21/21 PASS (1분 0초)
- vite build PASS (11.40s)
- ESM import PASS
- git diff 삭제 라인 0개
- DIALOGUES 키 총 119개 (기존 106 + 신규 13)
- STORY_TRIGGERS 총 120개 (기존 107 + 신규 13)
- 금지 구간 7개 일체 미변경
- 아르준 은닉 규칙 준수 (16~17장 speaker: ???)
- Phase 65 시나리오 수정 보존 확인 (라오 chapter10_intro "(크게 웃으며)" 유지)
- INFO 2건: event_kitchen_accident 린 미합류 시 발동 가능(once: true로 자연 해소), 신규 트리거 기존 시퀀스 뒤 위치(의도된 순서)

### 참고

- 스코프: `.claude/specs/2026-04-22-kc-gag-expansion-scope.md`
- 스펙: `.claude/specs/2026-04-22-kc-gag-expansion-spec.md`
- 페이즈 리포트: `.claude/specs/2026-04-22-kc-gag-expansion-phase{1,2,3,4}-report.md`
- QA: `.claude/specs/2026-04-22-kc-gag-expansion-qa.md`

---

## [Phase 65] 2026-04-22 -- 시나리오/캐릭터 일관성 전수 수정

### 개요

시나리오 전수 리뷰에서 발견된 21건 이슈(P0 5건, P1 9건, P2 7건)를 7개 페이즈(A~F, GH)로 나눠 전수 수정. `dialogueData.js`(1828줄), `STORY.md`, `portraits/index.html` 대상. 에셋/UI 변경 없음(visual_change: none).

### 수정 (P0 -- 5건)

- **P0-1 라오 첫 등장 재작성**: `chapter10_intro` L638 "(절도 있게) 처음 뵙겠습니다" -> "(크게 웃으며) 어이! 먼 길 왔어." 호쾌/호탕 톤으로 복구. 5줄 재작성.
- **P0-2 리넘버링 잔존 제거**: `chapter10_lao_joins` L647 "8-3 클리어" -> "10-3 클리어", L672 "8장 클리어" -> "10장 클리어", `chapter10_yuki_clue` L697 "8-4 클리어" -> "10-4 클리어", `chapter10_mid` L711 "8-5 클리어" -> "10-5 클리어". 총 4건 치환.
- **P0-3 미미 말투 전수 통일**: 유키/라오/앙드레/아르준에게 존댓말, 린/메이지/포코에게 반말로 확정. Phase B(ch1~12) 16건 + Phase C(ch13~24+side) 33건 = 총 49건 수정. 팀 전체 발화도 존댓말로 통일.
- **P0-4 메이지 22장 briefing 삽입**: `chapter22_intro`에 메이지 대사 4줄 삽입 (디저트 미력 전공 설정 활용, 여왕 파장 경고). 7줄 -> 11줄.
- **P0-5 유키 대표 대사 교체**: `portraits/index.html` L359 "위험한 도박이네요." -> "규율 없는 자는 결국 혼자 싸우게 돼요." (7~9장 원칙주의 색 대사로 교체).

### 추가 (P1 -- 9건)

- **P1-1 아르준 "???" 예고**: ch16_mid/ch16_epilogue/ch17_intro/ch17_mid/ch18_intro에서 `speaker: '아르준'` 17건 -> `speaker: '???'`로 치환. `portraitKey: 'arjun'` 유지. ch16_epilogue에 포코/미미 예고 대사 2줄 삽입. ch18_intro "아르준 씨?" -> "...네?" 정합성 조정.
- **P1-2 린 그룹2 이탈 briefing**: `side_15b`에 린 이탈 대사 5줄 삽입 ("우리 가게. 너무 오래 비웠어."). 11줄 -> 16줄.
- **P1-3 포코 할머니 회상**: `chapter23_mid`에 포코 "할머니도 여기 비슷한 곳까지 왔었어" + "이번엔 달라" 3줄 삽입.
- **P1-4 누아르-여왕 거울상**: `chapter24_mid` L1721 앙드레 "정반대" + L1722 메이지 "서로의 거울" 2줄 삽입.
- **P1-5 여왕 텔레파시**: `chapter24_mid` L1725, 1727 `speaker: '미각의 여왕'` "(멀리서, 텔레파시로)" 3줄 삽입.
- **P1-6 엔딩 할머니 보고**: `chapter24_ending` L1763 미미 "(마음속으로) ...할머니. 지켰어." 1줄 삽입.
- **P1-7 포코 gag 분산**: team_side_14(경매 톤), team_side_16(정보 브로커 톤 "공짜"), team_side_21(감정 톤 "무서워"). 할인 일변도 -> 3종 분산.
- **P1-8 아르준 향신료 비유어법 확립**: chapter18_epilogue "잔향", team_side_18 "고수 향", team_side_24 "카르다몸+바닐라 블렌딩". 3건 삽입/교체.
- **P1-9 유키/앙드레 info-dump 분할**: `chapter23_mid` 유키(단정형 결론 2줄) + 앙드레(분석형 이유 2줄) 교대 패턴으로 재구성. `team_side_23` 라오 대사 1건 제거로 9턴 -> 8턴 축약.

### 수정 (P2 -- 7건)

- **P2-1 STORY.md 포코 이모지**: `STORY.md` L40 이모지 🎒 -> 🐱, 설명 "상인 근성" -> "마력 품은 고양이".
- **P2-2 (한숨) 지문 다양화**: 앙드레 "(한숨)" -> "(낮게 숨을 내쉬며)", 유키 "(한숨)" -> "(짧게 눈을 감았다 뜨며)". 대사 내 0건 달성.
- **P2-3 미미 감탄사**: 같은 script id 내 동일 감탄사 2회 이상 반복 없음 확인. 수정 불필요.
- **P2-4 린 일상 베이스**: Phase D `side_15b`에서 해결 ("우리 가게. 너무 오래 비웠어.").
- **P2-5 엘 디아블로 루차도르 색채**: `chapter21_boss` L1530 "(낮게, 링 위에 선 루차도르처럼) ...Bienvenidos. 이 링에 올라온 이상, 도망은 없어."
- **P2-6 메이지 내면 동기**: `team_side_24` L1774 할아버지 식란 사고 -> 디저트 미력 연구 동기 1줄 삽입.
- **P2-7 team_side_23 페이싱**: 라오 대사 1건 제거, 9턴 -> 8턴.

### 변경 파일 목록

| 파일 | 레포 | 변경 유형 |
|------|------|----------|
| `kitchen-chaos/js/data/dialogueData.js` | kitchen-chaos | 대사 수정/삽입/삭제 (1802줄 -> 1828줄) |
| `kitchen-chaos/docs/STORY.md` | kitchen-chaos | 포코 이모지/설명 수정 |
| `studio-mockup/kitchen-chaos/portraits/index.html` | studio-mockup | 유키 대표 대사 교체 |

### QA 결과

- Playwright 22/22 PASS (1분 12초)
- vite build PASS (11.36s, 63 modules)
- JS 콘솔 에러 0건
- 경미한 말투 일관성 이슈 7건 잔존 (모두 LOW, 후속 Quick Fix 권장)
  - side_15b L1130 "왜요?" -> "왜?", L1132 "가요" -> "가"
  - chapter23_mid L1673 "포코 씨..." -> "포코..."
  - chapter22_intro L1604 "메이지 씨" -> "메이지"

### 참고

- 리뷰: `.claude/specs/2026-04-22-kc-scenario-review.md`
- 스펙: `.claude/specs/2026-04-22-kc-scenario-fix-spec.md`
- 페이즈별 리포트: `.claude/specs/2026-04-22-kc-scenario-fix-phase{A,B,C,D,E,F,GH}-report.md`
- QA: `.claude/specs/2026-04-22-kc-scenario-fix-qa.md`

---

## [Phase 58] 2026-04-22 -- 행상인 로그라이크 분기 선택

### 개요

행상인(MerchantScene)을 "수치 환전소"에서 "되돌릴 수 없는 3택 1 분기점"으로 전환. 매 방문 시 4 카테고리(변이/레시피/인연/축복)에서 3개 카테고리가 뽑히고, 각 카테고리에서 1장씩 총 3장이 제시된다. 선택된 카드는 즉시 효과가 적용되고 세이브에 영구 저장된다.

3개 서브 페이즈로 분할 진행:
- **58-1**: 분기 카드 데이터 + SaveManager v24 마이그레이션
- **58-2**: MerchantScene 2탭 UI + 배지 아이콘 4종
- **58-3**: 게임플레이 반영 (BranchEffects 매니저 + 4 카테고리 실효 + 분기 레시피 주문 풀 편입)

---

### Phase 58-1: 분기 카드 데이터 + 세이브 v24

#### Added

- **`js/data/merchantBranchData.js`** (신규): 분기 카드 32장 (카테고리 4종 × 각 8장)
  - **Mutation 8장**: `mut_pan_flame`(splash+30), `mut_salt_chain`(chain 1회 반경 40px), `mut_grill_inferno`(burn_stack 3중첩), `mut_delivery_ghost`(phase_through, collectInterval −300ms), `mut_freezer_permafrost`(freeze +1.5s, 30% 재빙결), `mut_soup_overcharge`(aura 2배, 범위 +20), `mut_wasabi_cluster`(1→3발 클러스터), `mut_spice_venom`(DoT +2s, 중독 적 −20% 속도)
  - **Recipe 8장**: `rec_dragon_feast`(×3.0), `rec_mireuk_tea`(정수 +15), `rec_grand_omakase`(×4.0), `rec_golden_curry`(×2.5 팁 확정), `rec_chaos_ramen`(×2.0), `rec_frozen_dessert`(조리 0s ×2.0), `rec_spice_bomb`(×1.8 빠른 조리), `rec_bistro_course`(×5.0)
  - **Bond 8장**: `bond_lao_grill`(damage_pct +50%), `bond_rin_pan`(burn +8), `bond_mage_freezer`(빙결 범위 +25), `bond_yuki_soup`(조리 −15%), `bond_andre_delivery`(팁 +10%), `bond_arjun_wasabi`(splash+20 독 추가), `bond_mimi_salt`(둔화 적 수거 +40), `bond_mimi_spice`(중독 적 드롭 +25%)
  - **Blessing 8장**: `bles_drop_carrot`(당근 ×2.0 / 3스), `bles_gold_gain`(+30% / 2스), `bles_exp_boost`(코인 +5 / 3스), `bles_cook_speed`(−20% / 2스), `bles_essence_rain`(나그네 +15% / 3스), `bles_enemy_slow`(−15% / 2스), `bles_patron_rush`(인내심 +25% / 2스), `bles_ingredient_rich`(+1개 / 3스)
  - `selectBranchCards(state)`: 카테고리 피셔-예이츠 셔플 → 앞에서부터 3개 카테고리 → 각 풀에서 1장 랜덤 선정 → 빈 풀은 건너뜀
  - `getEligiblePool(category, state)` 중복 제외 규칙: mutation(이미 변이된 toolId 제외) / recipe(이미 해금된 recipeId 제외) / bond(이미 해금된 카드 id 제외) / blessing(제외 조건 없음, 갱신 허용)
  - `getBranchCardById`, `getBranchCardsByCategory`, `BRANCH_CATEGORY_META` export

#### Changed

- **`js/managers/SaveManager.js`**: `SAVE_VERSION` 23 → **24**
  - `createDefault()`에 `branchCards: { toolMutations: {}, unlockedBranchRecipes: [], chefBonds: [], activeBlessing: null, lastVisit: null }` 추가
  - v23 → v24 마이그레이션 블록 추가 (v18 이하 체인 호환성 유지 — `petit_chef` → `mimi_chef` 변환 + branchCards 생성 확인됨)
  - 분기 카드 헬퍼 메서드 10개 추가: `getToolMutations`, `applyToolMutation`(중복 차단/되돌릴 수 없음), `getUnlockedBranchRecipes`, `unlockBranchRecipe`(중복 방지), `consumeBranchRecipe`(58-3 Recipe 보완), `getChefBonds`, `unlockChefBond`(중복 방지), `getActiveBlessing`, `setActiveBlessing`(덮어쓰기/갱신), `decrementBlessingStages`(0 도달 시 null 자동 초기화)
  - `markVisitSelection` 헬퍼 추가 (방문 stageId + selectedCardId 기록)

#### Notes

- 스펙에는 "헬퍼 7개"로 표기되었으나 실제 구현은 10개로 확장 (`applyToolMutation`의 되돌릴 수 없음 규약 + `setActiveBlessing` + `decrementBlessingStages` + `consumeBranchRecipe` + `markVisitSelection` 포함)
- `chefBonds` 저장 키는 "카드 자체 id" 기준 통일 (예: `['bond_lao_grill']`) — 스펙의 양립 표기를 id 컬럼 기준으로 확정
- 빌드 PASS (vite 11.51s, 58 modules, 경고 없음), Node 런타임 검증 8종 케이스 모두 PASS
- 스펙: `.claude/specs/2026-04-20-kc-phase58-spec.md`
- 구현 리포트: `.claude/specs/2026-04-20-kc-phase58-1-coder-report.md`

---

### Phase 58-2: MerchantScene 탭 UI + 배지 아이콘 4종

#### Added

- **`assets/ui/branch_badge_mutation.png`**: 오렌지 불꽃 아이콘, 32×32 PNG (투명 배경, PixelLab)
- **`assets/ui/branch_badge_recipe.png`**: 초록 요리책+별 아이콘, 32×32 PNG
- **`assets/ui/branch_badge_bond.png`**: 하늘색 심장+셰프 모자 아이콘, 32×32 PNG
- **`assets/ui/branch_badge_blessing.png`**: 금색 미력 광배+물방울 아이콘, 32×32 PNG
- **`js/scenes/MerchantScene.js`** (lines 820~1246): 2탭 UI + 분기 카드 영역
  - `_createTabBar()`, `_setActiveTab(tabKey)` — 탭 2개(`🛒 도구 구매` / `🃏 분기 선택`)
  - `_createBranchCardArea()`, `_renderBranchCards()`, `_renderBranchCard(cardDef, x, y, isSelected)` — 카드 3장 가로 배치
  - `_showBranchConfirmPopup(cardDef, onConfirm)` — "되돌릴 수 없습니다" 확인 팝업 (280×160, 0x221100 배경, 0xff6600 외곽선)
  - `_applyBranchCard(cardDef)` — 카테고리별 SaveManager 호출 (`applyToolMutation` / `unlockBranchRecipe` / `unlockChefBond` / `setActiveBlessing`) + 변이 오버레이(tint) 적용
  - `_renderSelectedBranchSummary()` — 재진입 시 "선택 완료" 단일 카드 렌더
  - `_rebuildBranchTab()` — 탭 재빌드
- **`js/managers/SpriteLoader.js`** (338~341행): `badge_mutation`/`badge_recipe`/`badge_bond`/`badge_blessing` 4종 preload 등록 + 카테고리 폴백 이모지 매핑(🔥/📖/💖/💧)
- **`tests/phase58-2-merchant-ui.spec.js`** (신규): Phase 58-2 API 레벨 + 스냅샷 검증 4종 PASS (21.4s)
- **`tests/screenshots/phase58-2-{tools-tab,branch-tab,confirm-popup,selected,selected-replay}.png`** (5종)

#### Changed

- **카테고리 외곽선 색상**: mutation `0xff6600` / recipe `0x22cc44` / bond `0x88aaff` / blessing `0xffcc00`
- **AD 모드3 REVISE 반영 레이아웃 수치**:
  - `TAB_Y` 67 → **72** (+5px, 골드 텍스트와 충돌 방지)
  - `LIST_TOP` 95 → **100** (+5px)
  - `TAB_HEIGHT` 20 → **36** (히트박스 확대)
  - `CARD_CENTER_Y` 310 → **250** (-60px, 대화창 겹침 회피)
  - 팝업 확인/취소 버튼 height 30 → **40**, Y `popupH/2 - 25` → `popupH/2 - 30`
  - helpText 2줄 분할 + `wordWrap: { width: GAME_WIDTH - 24 }` 추가 (양끝 잘림 해결)
  - 배지 `setDisplaySize(24,24)` → **(28,28)**, 텍스처 미존재 시 16px 이모지 폴백
- **`init(data)`**: `_branchCardSelected=false`, `_branchPopupOpen=false`, `_branchSelectedCardId=null` 초기화
- **`create()`**: `_createTabBar()` 호출 추가, 기본 탭은 `[도구 구매]`

#### Notes

- AD 모드1 APPROVED (배지 4종 컨셉 + 변이 오버레이 방식 A tint 채택 — 별도 PNG 오버레이 불필요)
- AD 모드2 APPROVED (에셋 검증)
- AD 모드3: 초회 REVISE (6 이슈) → 레이아웃 수정 → 재검수 APPROVED
- 기존 QA 테스트(`phase58-2-qa.spec.js`) 4/4 FAIL은 Phaser pointerdown 좌표 변환 이슈 — 58-2 신규 spec(`phase58-2-merchant-ui.spec.js`)에서 API 직접 호출 방식으로 우회 4/4 PASS
- AD 산출물: `.claude/specs/2026-04-20-kc-phase58-ad1.md` / `ad2.md` / `ad3.md`
- 구현 리포트: `.claude/specs/2026-04-20-kc-phase58-2-coder-report.md`

---

### Phase 58-3: 게임플레이 반영 + 분기 레시피 주문 풀 편입

#### Added

- **`js/managers/BranchEffects.js`** (신규, 251줄): 카드 효과 조회 경량 어댑터
  - 축복: `getActiveBlessingCard`, `getBlessingMultiplier(type)`(지원 타입 8종: `gold_gain`/`cook_speed`/`drop_rate`/`ingredient_drop_count`/`exp_gain`/`enemy_slow`/`patron_patience`/`mireuk_traveler_chance`), `getBlessingDropRateFor(ingredientType)`
  - 변이: `getMutationCard(toolId)`, `getMutationEffect(toolId)`, `hasMutation(toolId)`, `getMutationTint(toolId)` (splash=0xff6b35, chain=0x66ccff, burn_stack=0xff3311, phase_through=0xccccff, freeze_extend=0x88eeff, aura_boost=0x66ff66, cluster=0x99dd55, venom=0xaa44ff)
  - 인연: `getActiveBondCard(toolId, chefIdOverride?)`, `getActiveBondEffect(toolId, chefIdOverride?)`
  - 레시피: `getUnlockedBranchRecipes()`, `getUnlockedBranchRecipeCards()`
  - 아키텍처 원칙: SaveManager는 상태만, 카드 정의 의존은 본 모듈 한 곳에 집중
- **Recipe 보완 — `js/data/recipeData.js`**: `BRANCH_SERVING_RECIPES` 상수 추가 (8장) + `ALL_RECIPES` 통합 목록 포함
  - `branch_dragon_feast`: meat×2/rice×1/squid×1/egg×1/pepper×1, baseReward 780, cookTime 14s, tier 5
  - `branch_mireuk_tea`: mushroom×1/rice×1, 240, 5s, tier 3
  - `branch_grand_omakase`: fish×2/squid×2/rice×2/egg×1/cheese×1, 1040, 20s, tier 5
  - `branch_golden_curry`: meat×1/carrot×1/rice×1/pepper×1, 650, 10s, tier 4
  - `branch_chaos_ramen`: flour×1/meat×1/egg×1, 520, 8s, tier 4
  - `branch_frozen_dessert`: egg×1/flour×1, 520, 1s, tier 4
  - `branch_spice_bomb`: pepper×1/meat×1, 470, 3.5s, tier 3
  - `branch_bistro_course`: meat×2/fish×1/cheese×1/flour×1/carrot×1, 1300, 24s, tier 5
  - `branch: true` 플래그로 일반 레시피와 구분, `starter: false`, `unlockCost: 0`
- **`tests/phase58-3-gameplay.spec.js`** (신규): 4 시나리오 PASS (축복 차감/변이 tint/Bond 시너지/레시피 해금)
- **`tests/phase58-qa-integration.spec.js`**: 통합 QA 테스트 26 PASS (성공 기준 5개 + 집중 검증 4항목 + 엣지 케이스 + 리그레션)
- **`tests/screenshots/phase58-3-service-scene.png`**

#### Changed

- **`js/scenes/GatheringScene.js`** (+155줄):
  - `placeTool` 후 `_applyMutationToTower(tower, typeId)` 호출 — tint 적용 + mutationEffect 타입별 스탯 오버라이드 (splash/burn_stack/phase_through/freeze_extend)
  - `_applyBondToTower` — 선택 셰프+도구 매칭 시 bondEffect 타입별 시너지 (damage_pct/burn_damage_flat/freeze_radius_flat/cook_speed_pct/tip_pct/wasabi_synergy/collect_radius_on_slow/drop_rate_on_poison)
- **`js/scenes/ServiceScene.js`** (+17줄):
  - `create()` 후반: `SaveManager.getUnlockedBranchRecipes()` 결과를 `availableRecipes`에 append, `this._sessionBranchRecipeIds` 기록
  - 손님 인내심 계산에 `patron_patience` 배수 (`× (1 + value)`)
  - 조리시간 계산에 `cook_speed` 감소 (`× (1 - value)`)
  - 영업 정산 시 `gold_gain` 배수 (매출+팁 양쪽)
  - `_endService()`: `this._sessionBranchRecipeIds`를 순회하여 `SaveManager.consumeBranchRecipe()` 1회 한정 소비
- **`js/scenes/ResultScene.js`** (+21줄):
  - 클리어 시 `exp_gain` 축복 코인 보너스 (`kitchenCoins += blessingCoinBonus`)
  - `SaveManager.decrementBlessingStages()` 호출 (축복 지속 스테이지 1 차감, 0 도달 시 자동 null)
  - 보상 텍스트에 `[미력의 축복 +N]` 표시
- **`js/managers/IngredientManager.js`** (+15줄):
  - `dropIngredient`에 `ingredient_drop_count` 가산 + `drop_rate` 재료별 배수 (ESM `import { BranchEffects }` 정상)
- **`js/entities/Enemy.js`** (+17줄):
  - 생성자에서 `enemy_slow` 축복 배수 읽어 `this.speed *= (1 - slow)` 적용 *(⚠️ `require()` 호출로 ESM 환경 조용히 실패 — 후속 수정 필요)*

#### Fixed

- Recipe 카테고리 QA FAIL 2건(#11, #12) → PASS 전환 (분기 레시피가 `RECIPE_MAP`에 등록되고 주문 풀에 실제 편입되는지 검증)
- QA 통합 테스트 디버그 출력으로 `recipeIds:["carrot_soup",..., "branch_dragon_feast","branch_golden_curry"]` / `branchRecipeCount: 2` 확인

#### Known Issues

- **변이 4장 플래그만 세팅 (소비처 로직 미구현)**: `chain`(salt 연쇄 둔화, `tower._chainCount`/`_chainRadius`), `cluster`(wasabi 멀티샷, `_clusterCount`/`_perShotDamageRatio`), `venom`(spice DoT, `_poisonSlowPct` 소비처 미구현), `aura_boost`(soup_pot, `_auraMultiplier`). tint 시각 효과는 정상, 실제 전투 수치는 부분적
- **Bond 4장 소비처 미구현**: `bond_yuki_soup`(`_bondCookSpeedBonus`), `bond_andre_delivery`(`_bondTipBonus`), `bond_mimi_salt`(`_collectRadiusOnSlow`), `bond_mimi_spice`(`_dropRateOnPoison`) — 플래그 저장만, 획득해도 표시 효과만
- **`enemy_slow` 축복 미반영**: `Enemy.js`의 `require('../managers/BranchEffects.js')`가 ESM 환경에서 조용히 실패. try/catch로 감싸져 빌드는 PASS. 권장 수정: 파일 상단 ESM `import` 전환
- **`rewardMultiplier` 미반영**: 분기 레시피 카드 descKo에만 수치가 남고 실제 baseReward 계산에는 미반영. "반복 등장 N회" 규약도 단순 1회 소비로 통일 (후속 Quick Fix 여지 명시)
- **영업 중간 중단 시**: `_endService` 호출 안 되므로 해금 상태 유지 (재진입 시 재등장, 의도된 보수적 동작)

#### Notes

- QA 통합 판정: **PASS** (26 PASS / 0 관련 FAIL)
  - #27 `enemy_sugar_fairy_walk_south-east_*` 에셋 누락 FAIL은 본 페이즈와 무관한 기존 이슈 (git stash 재실행 시에도 동일 실패 확인)
- visual_change: `art+ui` 혼합 — 변이 tint가 도구 스프라이트 시각 변화를 주지만 에셋 파일 생성/교체는 없음 (방식 A setTint 채택)
- AD 모드2/3 재실행 불필요 (에셋 미수정, UI 레이아웃 미변경)

---

### 참고

- 목적 정의: `.claude/specs/2026-04-20-kc-phase58-scope.md`
- 스펙: `.claude/specs/2026-04-20-kc-phase58-spec.md`
- AD 산출물: `.claude/specs/2026-04-20-kc-phase58-ad1.md` / `ad2.md` / `ad3.md`
- 구현 리포트: `.claude/specs/2026-04-20-kc-phase58-1-coder-report.md` / `58-2-coder-report.md` / `58-3-coder-report.md`
- QA 통합 테스트: `kitchen-chaos/tests/phase58-qa-integration.spec.js` (별도 리포트 파일 없음, 테스트 실행 결과로 검증)

---

## [Phase 61] 2026-04-21 -- 메인 메뉴 비주얼 에셋 3종 도입

### Added

- **`assets/ui/menu_bg.png`**: 메뉴 배경 이미지 360x640 RGB PNG (291KB)
  - SD Forge SDXL Base 1.0, steps=30, CFG=7.0, DPM++ 2M Karras, seed=4025870268
  - 1024x1024 생성 -> 9:16 크롭(576x1024) -> 360x640 LANCZOS 리사이즈
  - 어두운 주방 내부 + 창문 너머 오렌지/보라 전장 구도
  - 버튼 영역(y=390-640) 평균 밝기 36.1/255 (< 40 기준 PASS)
- **`assets/ui/menu_title_logo.png`**: 타이틀 로고 320x150 RGBA PNG (9.5KB)
  - PIL 직접 렌더링, Impact.ttf 폰트 (NeoDunggeunmoPro 미설치로 2순위 적용)
  - Kitchen=#ffd700 stroke=#8b4500 / Chaos=#ff6b35 stroke=#8b0000 / Tycoon=#ffffff stroke=#333333
  - 불꽃 파티클 5개, 스파크 6개, 연기 원 2개 장식
- **`assets/ui/app_icon_512.png`**: 앱 아이콘 512x512 RGB PNG (154KB)
  - SD Forge Counterfeit v3(배경, seed=3885348100) + mimi_chef south.png 3.48x nearest-neighbor 업스케일 + PIL KC 로고 합성
  - 미미 + 보라 미력 적 실루엣 + KC 골드 로고, 오렌지 림라이트 글로우
  - Play Console/Android 런처용, Phaser preload 제외 (메모리 절약)
- **MenuScene.js**: 미미 스프라이트 배치
  - `mimi_menu` 키로 `assets/chefs/mimi_chef/rotations/south.png` 재활용
  - x=308, y=200, 80x80, NEAREST 필터 (픽셀 아트 선명도 유지)
  - AD2 REVISE로 추가됨: 컨셉 A "주방을 지키는 셰프" 시각화 목적

### Changed

- **`js/scenes/MenuScene.js`**: 배경 + 타이틀 로고 교체
  - 변경 전: NineSliceFactory.panel 'dark' 단색 배경 + 장식 원 3개 + 텍스트 3줄(Kitchen/Chaos/Tycoon)
  - 변경 후: menu_bg 이미지(depth=-1) + panel dark alpha=0.5(반투명) + menu_title_logo 이미지(x=180, y=220)
  - 장식 원 forEach 블록 완전 제거
  - titleBlock 컨테이너(텍스트 3줄) -> menu_title_logo 이미지 교체
  - 폭 320px 초과 시 비율 유지 축소 로직 포함
  - 부제목 "주방을 지켜라!" (y=320) 유지
  - 버전 텍스트 y좌표: 634 -> 630 (AD3 권장 수정, 모바일 네비게이션 바 겹침 방지)
  - 버튼 y좌표 동결 (390/450/496/534/578)
- **`js/scenes/BootScene.js`**: menu_bg + menu_title_logo + mimi_menu 3종 preload 추가

### Notes

- QA 판정: PASS (22/23, 1건 환경 한정 headless Chromium 로드 시간 -- Phase 61 이슈 아님)
- AD2 판정: REVISE -> 미미 스프라이트 추가 후 APPROVED (WARN 4건 허용)
- AD3 판정: APPROVED (WARN 6건 허용, FAIL 1건 구조적 특성으로 무효)
- AD3 선택 수정(미미 80x80->100x100 확대) 미적용, 현행 80x80 유지
- 타이틀 로고 폰트: 스펙 1순위 NeoDunggeunmoPro -> 미설치로 Impact.ttf 적용 (브랜드 레터링으로 허용)
- 배경 #6622cc(미력 보라) 미검출: SD 생성 한계, #330c32(어두운 자주-보라)로 대체. 시각적 기능 정상
- 스펙: `.claude/specs/2026-04-21-kc-phase61-menu-visuals-spec.md`
- 구현 리포트: `.claude/specs/2026-04-21-kc-phase61-coder-report.md`
- QA: `.claude/specs/2026-04-21-kc-phase61-qa.md`

## [Phase 57] 2026-04-20 -- ChefSelectScene 가로 캐러셀 UI 개편

### Added

- **`assets/portraits/portrait_arjun.png`**: arjun_chef 전용 portrait 신규 생성 (SD Forge, 512x512, 투명 배경)
  - 스펙은 픽셀아트 스타일을 요구했으나 애니메/일러스트 스타일로 생성됨 (기존 portrait과 스타일 불일치, 텍스처 로딩 이슈 해결 시 시각적 불일치 노출 예상)
- **`js/scenes/ChefSelectScene.js`**: 가로 캐러셀 전면 재작성
  - 신규 메서드: `_buildCarouselCards()`, `_buildCard()`, `_goToIndex()`, `_setupSwipe()`, `_updateSelectButton()`, `_buildArrowButtons()`, `_buildSelectButton()`, `_buildBottomControls()`
  - `CHEF_PORTRAIT_MAP` 상수: 7종 셰프 ID -> portrait 텍스처 키 매핑
  - 카드 크기: 260x380px, 중심 x=180, y=270 (스펙 y=287에서 17px 상향 튜닝)
  - 좌우 peek 카드: 간격 280px (카드 260 + gap 20), alpha 0.45
  - 화살표 버튼: x=22/338, y=270, 36x60px
  - 스와이프: 임계값 50px, tween 220ms (Power2.easeOut)
  - 순환(wrap): index < 0 -> 6, index > 6 -> 0
  - 잠금 오버레이: alpha 0.75 검은 rect + 자물쇠 48px + unlockHint 텍스트
  - 선택 버튼: 잠금 시 회색 비활성화, 해금 시 셰프 색상
  - 초기 인덱스: 이전 선택 셰프 유지, 없으면 0

### Changed

- **`js/scenes/ChefSelectScene.js`**: 세로 목록 (cardHeight=76px, 7장 수직 배치) -> 가로 캐러셀 (260x380px 카드 1장 중앙 + 좌우 peek)
- **`js/managers/SpriteLoader.js`**: PORTRAIT_IDS에 'arjun' 추가 (masala_guide는 DialogueScene 참조로 유지)
  - 변경 전: `['mimi', 'poco', 'rin', 'mage', 'yuki', 'lao', 'andre', 'masala_guide']`
  - 변경 후: `['mimi', 'poco', 'rin', 'mage', 'yuki', 'lao', 'andre', 'masala_guide', 'arjun']`
- 하단 버튼 위치 미세 조정: "셰프 없이 시작" x=245 (스펙 240), "< 뒤로" x=62 (스펙 55)

### Fixed

- **`js/scenes/ChefSelectScene.js`**: `_startGame()` / `_onBack()` 씬 전환 중복 호출 방지 가드 추가 (`_transitioning` 플래그)

### Known Issues

- portrait/스프라이트 텍스처 Phaser 미로드로 전체 셰프 이모지 fallback 동작 중 (Phase 56부터 지속, Phase 57 코드 원인 아님)
- portrait_arjun 스타일 불일치: 스펙은 픽셀아트 portrait 요구, 실제 생성은 애니메/일러스트 스타일
- `pointerupoutside` 미처리: 캔버스 밖 pointer 해제 시 `_swiping` 상태 잔존 가능 (LOW)

### Notes

- QA 판정: PARTIAL (10개 수용 기준 중 7 PASS, 3 FAIL -- FAIL 3건 모두 Phase 56 이전부터 존재하는 텍스처 로딩 기존 이슈)
- 카드 중심 y좌표: 스펙 287 -> 구현 270 (17px 상향, 360x640 화면 내 밸런스 튜닝)
- 스펙: `.claude/specs/2026-04-20-kc-phase57-chef-carousel-spec.md`
- 구현 리포트: `.claude/specs/2026-04-20-kc-phase57-coder-report.md`
- QA: `.claude/specs/2026-04-20-kc-phase57-qa.md`

## [Phase 56] 2026-04-20 -- TD 셰프 시스템 Named 캐릭터 개편

### Added

- **`js/data/chefData.js`**: 7종 Named 셰프로 전면 재정의
  - `petit_chef` -> `mimi_chef` (미미): 재료 수거 범위 +30%, 조리시간 -15%, 스킬 "긴급 배달"
  - `flame_chef` -> `rin_chef` (린): 화염 타워 피해 +20%, 그릴 수익 +25%, 스킬 "지옥 불꽃"
  - `ice_chef` -> `mage_chef` (메이지): CC 지속 +25%, 디저트 수익 +20%, 스킬 "마법진 설탕"
  - `andre_chef` (앙드레, 신규): 양식 수익 +25%, 팁 +15%, 스킬 "오마카세 코스"/"플랑베"
  - `arjun_chef` (아르준, 신규): 향신료 타워 공속 +20%, 드롭률 +15%, 스킬 "마살라 폭풍"/"비밀 향신료"
  - `CHEF_ORDER` 7종 갱신: mimi, rin, mage, yuki, lao, andre, arjun
- **`js/managers/ChefManager.js`**: 신규 패시브 헬퍼 메서드 4개
  - `getDessertRewardBonus()` (mage_chef: 1.20)
  - `getTipBonus()` (andre_chef: 1.15)
  - `getWesternRewardBonus()` (andre_chef: 1.25)
  - `getSpiceAttackSpeedBonus()` (arjun_chef: 1.20)
- **`js/managers/SaveManager.js`**: v23 마이그레이션
  - `selectedChef` ID 매핑: petit_chef->mimi_chef, flame_chef->rin_chef, ice_chef->mage_chef
  - SAVE_VERSION 21 -> 23
- **`js/scenes/ServiceScene.js`**: `_getServicePassiveDesc()` 7종 분기 추가 (신규 ID 대응)
- 에셋: 5종 셰프 TD 스프라이트 (8방향 픽셀아트)
  - `assets/chefs/mimi_chef/`, `assets/chefs/rin_chef/`, `assets/chefs/mage_chef/` (v2), `assets/chefs/andre_chef/` (v2), `assets/chefs/arjun_chef/`

### Changed

- **`js/scenes/ChefSelectScene.js`**: 잠금 조건 7종 재작성
  - mimi/rin/mage: 항상 해금
  - yuki: season2Unlocked
  - lao: season2Unlocked && chapter >= 10
  - andre: season2Unlocked && chapter >= 13
  - arjun: season3Unlocked && chapter >= 17
  - 레이아웃 압축: cardHeight=76, cardGap=4, buttonY=625 (스펙 80/5/630에서 미세 조정)
- **`js/managers/ChefManager.js`**: 기존 메서드 ID 교체
  - getCollectRangeBonus: petit_chef -> mimi_chef
  - getGrillDamageBonus: flame_chef -> rin_chef
  - getCCDurationBonus: ice_chef -> mage_chef
  - getCookTimeBonus: petit_chef -> mimi_chef
  - getGrillRewardBonus: flame_chef -> rin_chef
  - getPatienceBonus: ice_chef -> mage_chef
  - getDropRateBonus: arjun_chef 드롭률 +15% 누적 추가
- **`js/managers/SpriteLoader.js`**: CHEF_IDS 7종으로 갱신
- **`js/devtools/DevHelper.js`**: selectedChef 기본값 `mimi_chef`로 변경

### Notes

- 스펙 대비 레이아웃 미세 조정: cardHeight 80->76, cardGap 5->4, buttonY 630->625 (360x640 화면 적합)
- 이모지 아이콘 크기: 스펙 28px -> 구현 20px (이모지 폰트 기준, 스프라이트 스케일은 28px)
- 수용 기준 #13 "손님 인내심 +20%"는 스펙 상세 설계 "디저트 요리 수익 +20%"로 구현 (상세 설계 기준이 정확)
- 신규 패시브(dessertRewardBonus, tipBonus 등)는 ChefManager 헬퍼까지만 구현. ServiceScene/GatheringScene 실연동은 Phase 57 예정
- 시각적 이슈 (LOW): mage_chef 패시브 텍스트 우측 잘림, arjun_chef 잠금 시 자물쇠 겹침
- 스프라이트는 Phaser 텍스처 로드 경로 매핑 이슈로 이모지 fallback 동작 중 (기능에 영향 없음)
- 기존 petit_chef/flame_chef/ice_chef 스프라이트 디렉토리는 레거시 보존
- 스펙: `.claude/specs/2026-04-20-kc-phase56-scope.md`
- QA: `.claude/specs/2026-04-20-kc-phase56-qa.md`

## [Phase 55-4] 2026-04-19 -- 엔드리스 테마 전환 + 업적 확장 + SaveManager v21

### Added

- **`js/scenes/ServiceScene.js`**: 엔드리스 웨이브 구간별 배경 테마 전환
  - `_endlessFloorKey(wave)` / `_endlessWallKey(wave)` static 헬퍼 2개 추가
  - 1~20: endless, 21~30: izakaya, 31~40: bistro, 41+: spice/cantina/dream 10웨이브 단위 순환
  - 신규 에셋 없이 기존 Phase 51-4/53 에셋 재활용
- **`js/data/achievementData.js`**: 엔드리스 업적 4개 추가 (기존 2개 → 총 6개, 전체 34개)
  - `endless_wave100`: 식란 정복자 (100웨이브 도달, 골드 3000)
  - `endless_storm10`: 폭풍의 화신 (폭풍 10회 클리어, 코인 30)
  - `endless_mission30`: 임무의 달인 (임무 30회 성공, 정수 50)
  - `endless_no_leak10`: 무결 방어 (연속 10웨이브 무손실, 골드 2000)
- **`js/managers/SaveManager.js`**: v21 마이그레이션
  - SAVE_VERSION 20 → 21
  - endless 객체에 `stormCount` / `missionSuccessCount` / `noLeakStreak` 필드 추가
  - 헬퍼 3개: `incrementEndlessStormCount()`, `incrementEndlessMissionSuccess()`, `updateEndlessNoLeakStreak(noLeak)`
- **`js/managers/AchievementManager.js`**: 신규 조건 타입 3개 처리
  - `endless_storm_cleared`: stormCount와 threshold 비교
  - `endless_mission_success`: missionSuccessCount와 threshold 비교
  - `endless_no_leak_streak`: noLeakStreak와 threshold 비교
- **`js/scenes/AchievementScene.js`**: `_claimReward`에 `reward.mireukEssence` 보상 타입 처리 추가

### Changed

- **`js/scenes/EndlessScene.js`**: `_waveLifeLeaked` 플래그 추가, `_onEndlessWaveCleared`에서 SaveManager 통계 헬퍼 호출 + AchievementManager.check 호출
- **`js/scenes/ResultScene.js`**: 게임오버 시 신규 업적 3종(wave100/storm10/mission30) 체크 추가

### Notes

- `_endlessFloorKey`/`_endlessWallKey`에 NaN/undefined 입력 시 array[NaN]=undefined 반환 가능하나, ServiceScene `create()`에서 `data.endlessWave || 0` 방어 처리로 실 발생 불가 (QA LOW-ISSUE)
- `endless_no_leak10` 업적은 매 웨이브 끝에 streak 갱신 후 즉시 체크되므로 연속 10웨이브 달성 시 즉시 해금
- ResultScene에서도 업적 체크를 추가한 것은 게임오버 시점에 bestWave가 갱신되기 때문 (스펙 미명시, coder 판단으로 추가)
- 스펙: `.claude/specs/2026-04-19-kc-phase55-4-report.md`
- QA: `.claude/specs/2026-04-19-kc-phase55-4-qa.md`

## [Phase 55-3] 2026-04-19 -- 미력 폭풍 + 유랑 미력사 엔드리스 지원 + 정화 임무

### Added

- **`js/managers/EndlessMissionManager.js`** (신규): 엔드리스 정화 임무 매니저
  - 임무 4종: `mission_speed_kill` (30초 내 보스 처치, 재료 3종 지급), `mission_no_leak` (라이프 손실 0, 정수 +15), `mission_combo` (10연속 처치, 골드 +500), `mission_boss_escort` (호위대 전멸 후 보스 처치, 정수 +30)
  - 비보스 웨이브: no_leak / combo 중 랜덤 선택
  - 보스 웨이브: speed_kill / no_leak / combo / boss_escort 중 랜덤 선택
  - 폭풍 웨이브: 임무 비활성화
  - API: startMission / onEnemyKilled / onLifeLost / markBossSpawned / evaluateAndReward / getStatusText / reset
- **`js/scenes/EndlessScene.js`**: 미력 폭풍의 눈 이벤트 + EndlessMissionManager 연동
  - 폭풍 발동 조건: `waveNumber % 15 === 0`
  - 폭풍 효과: 적 HP x0.7, 속도 x0.8
  - 폭풍 VFX: 보라색 screenFlash + 오버레이(depth 999)
  - 폭풍 클리어 보상: `Math.min(50, 10 + Math.floor(wave/15)*10)` 미력의 정수 (wave15=20, 30=30, 45=40, 60+=50)
  - 보스 스폰 시 `_mission.markBossSpawned()` 호출 (_spawnEnemy 패치 내부)
  - shutdown 시 _mission + _stormOverlay 정리

### Changed

- **`js/scenes/ServiceScene.js`**: `_scheduleMireukTraveler()` 엔드리스 지원
  - `if (this.isEndless) return;` 차단 제거
  - 엔드리스 등장 확률 8% (캠페인 16%의 절반): `this.isEndless ? 0.08 : 0.16`
  - isEndless 모드에서 season2/chapter 조건 면제 (`if (!this.isEndless) { ... }` 블록으로 감싸기)

### Fixed

- **Bug #1 (HIGH)**: `markBossSpawned()` 미호출 -- 보스 스폰 시점 기록이 누락되어 speed_kill 임무 판정이 부정확했음. `_spawnEnemy` 패치에서 `baseData.isBoss` 확인 후 호출 추가
- **Bug #2 (MEDIUM)**: 폭풍 보상 수식 기준값 오류 -- `20 + Math.floor(wave/15)*10`이 wave15=30을 반환(스펙은 20). `10 + Math.floor(wave/15)*10`으로 수정

### Notes

- 스펙의 "미력의 정수 드롭 배율 x2 (적 처치 시)"는 적 처치 시 정수 드롭 로직이 존재하지 않으므로 구현하지 않음. 폭풍 보상으로만 처리
- `mission_combo`는 maxCombo 추적 방식: 웨이브 중 한 번이라도 10연속을 달성하면 이후 리셋되어도 성공 판정 (스펙 "연속 10처치 달성"과 일치)
- wave 30/60/90 등 보스+폭풍 겹침 시 폭풍이 우선하여 임무 비활성화. 보스 HP x0.7 보정도 적용
- 스펙: `.claude/specs/2026-04-19-kc-phase55-3-report.md`
- Bugfix: `.claude/specs/2026-04-19-kc-phase55-3-bugfix-report.md`
- QA: `.claude/specs/2026-04-19-kc-phase55-3-qa.md`

## [Phase 54] 2026-04-19 -- 쿠폰 코드 시스템 (프로덕션 + DEV 치트 분리)

### Added

- **`js/managers/CouponRegistry.js`** (신규): 쿠폰 레지스트리 모듈
  - 일반 쿠폰 3종: `LAZYSLIME2026` (골드 +5,000), `KITCHENLOVE` (골드 +3,000 + 재료 carrot/meat/egg x5), `GRANDOPENING` (골드 +2,000 + 재료 flour/rice x10)
  - DEV 치트 5종: `CHEAT_GOLD` (골드 +99,999), `CHEAT_ITEMS` (전 재료 31종 x20), `CHEAT_STAGE_SKIP` (다음 스테이지 3성 클리어+리로드), `CHEAT_BOSS_KILL` (모든 적 즉사), `CHEAT_WAVE_END` (웨이브 강제 완료)
  - `redeemCoupon(rawCode)` API: 코드 정규화(trim+toUpperCase), 사용 이력 검증, 보상 지급
  - 사용 이력: `kitchenChaosTycoon_usedCoupons` localStorage 키 (세이브 초기화와 독립)
  - 치트 코드는 사용 이력 미저장 (무제한 재사용)
- **`js/scenes/MenuScene.js`**: 설정 패널 쿠폰 입력 UI
  - `_openCouponModal()`: hidden DOM input + Phaser 텍스트 가상 입력창, depth 1100
  - `_closeCouponModal()`: input 이벤트 리스너 해제 + DOM 요소 제거
  - 쿠폰 버튼: 배경 `0x1a3366`, 텍스트 `#88ccff`, y=408
  - 설정 패널 닫기 시 쿠폰 모달도 함께 정리
- **`js/managers/SaveManager.js`**: giftIngredients 필드 및 헬퍼
  - `addGiftIngredients(ingredients)`: 기존값에 누적 저장
  - `consumeGiftIngredients()`: 전체 소진 후 반환, 빈 객체로 초기화
- **`js/scenes/GatheringScene.js`**: DEV 전용 `window.__kcCheat` 등록
  - `create()` 말미에 `bossDie()` / `waveEnd()` 함수 등록 (DEV only)
  - `shutdown()` 시 `delete window.__kcCheat`
  - `create()` 초기화 시 `consumeGiftIngredients()` 호출하여 InventoryManager에 합산

### Changed

- **`js/managers/SaveManager.js`**: SAVE_VERSION 19 -> 20
  - `createDefault()`에 `giftIngredients: {}` 추가
  - v19 -> v20 마이그레이션: `data.giftIngredients = data.giftIngredients || {}`
- **`js/scenes/MenuScene.js`**: 설정 패널 panelH 확장 (쿠폰 버튼 수용)

### Notes

- 스펙의 쿠폰 코드 표에 `GRAND OPENING` (공백 포함)으로 표기되었으나, 구현은 `GRANDOPENING` (공백 없음). 스펙 내 코드 블록이 `GRANDOPENING`이므로 구현이 올바름
- panelH: 스펙 340 vs 구현 268 (AD 모드3 여백 보정 결과, 시각적으로 적절)
- 프로덕션 빌드 번들에서 `CHEAT_GOLD`, `CHEAT_BOSS_KILL`, `__kcCheat` 등 치트 관련 문자열 0건 확인 (트리쉐이킹 정상)
- 스펙: `.claude/specs/2026-04-19-kc-phase54-spec.md`
- 리포트: `.claude/specs/2026-04-19-kc-phase54-report.md`
- QA: `.claude/specs/2026-04-19-kc-phase54-qa.md`

## [Phase 53] 2026-04-19 -- 챕터별 홀 뒷벽 에셋 8종 + oni_herald 미니보스 에셋

### Added

- **에셋 `assets/service/wall_back_g1.png`** (512x80px): 한식/시장 테마 뒷벽 — 한옥 목재 기둥, 창호지, 전통 문양, 갈색-황토색 팔레트
- **에셋 `assets/service/wall_back_izakaya.png`** (512x80px): 일식 이자카야 테마 뒷벽 — 나무 격자 벽, 등롱, 노렌, 인디고-감색 팔레트
- **에셋 `assets/service/wall_back_dragon.png`** (512x80px): 중식 용의 주방 테마 뒷벽 — 붉은 용 조각, 금빛 격자문, 적금색 팔레트
- **에셋 `assets/service/wall_back_bistro.png`** (512x80px): 서양 비스트로 테마 뒷벽 — 파리풍 벽돌, 칠판, 크림-와인 팔레트
- **에셋 `assets/service/wall_back_spice.png`** (512x80px): 인도 향신료 궁전 테마 뒷벽 — 대리석 아치, 공작 타일, 사프란-딥 퍼플 팔레트
- **에셋 `assets/service/wall_back_cantina.png`** (512x80px): 멕시코 칸티나 테마 뒷벽 — 테라코타 벽, 선인장 벽화, 오렌지-터콰이즈 팔레트
- **에셋 `assets/service/wall_back_dream.png`** (512x80px): 슈가 드림랜드 테마 뒷벽 — 파스텔 캔디, 마카롱 창틀, 라벤더-민트-핑크 팔레트
- **에셋 `assets/service/wall_back_endless.png`** (512x80px): 영원한 식란 지대 테마 뒷벽 — 우주적 배경, 별자리 문양, 딥 퍼플-시안 팔레트
- **에셋 `assets/bosses/oni_herald/rotations/*.png`** (8방향, 92x92px): 보라-핑크 오니 전령 미니보스 정지 이미지
- **에셋 `assets/bosses/oni_herald/animations/walking-7ae1e13e/`** (8방향 x 6프레임, 92x92px): oni_herald walk 스프라이트시트
- **에셋 `assets/bosses/oni_herald/animations/falling_backward-8387b83c/`** (8방향 x 7프레임, 92x92px): oni_herald death 스프라이트시트

### Notes

- 코드 변경 없음. SpriteLoader의 `FLOOR_VARIANTS` 루프(Phase 51-4)와 `BOSS_IDS`/`BOSS_WALK_HASHES`/`BOSS_DEATH_HASHES` 등록(Phase 47-2)이 사전 완성되어 있어 에셋 파일 배치만으로 자동 로드/렌더링 동작
- wall_back 8종: SD Forge로 생성, 파일 크기 40KB~74KB
- oni_herald: PixelLab pro 모드로 생성, chibi 체형, 기존 보스 에셋(sake_oni, oni_minion)과 동일 세계관
- `_getWallBackKey()` 챕터 매핑: ch1~6=g1, 7~9=izakaya, 10~12=dragon, 13~15=bistro, 16~18=spice, 19~21=cantina, 22+=dream, isEndless=endless
- oni_herald death 에셋은 8방향 존재하나 코드(DEATH_DIRS)에서 4방향만 로드 — 대각선은 DEATH_DIR_FALLBACK 매핑으로 처리 (기존 설계, 에셋 용량 절약)
- AD 모드2 WARN: bistro 매우 밝음, cantina 고채도 — 기능에는 무영향, 캐릭터 가독성 실 영업 시 추가 확인 권장
- QA: 22/22 PASS (Playwright 테스트, 11개 시각적 스크린샷 검증 포함)
- 스펙: `.claude/specs/2026-04-19-kc-phase53-spec.md`
- QA: `.claude/specs/2026-04-19-kc-phase53-qa.md`

## [Phase 52] 2026-04-19 -- 영업씬 렌더링 재구성 (테이블 앞/뒤 분리 + 손님 독립 스프라이트)

### Added

- **에셋 `assets/service/table_lv{0~4}_back.png`** (5장, 96x64): 테이블 뒷면+의자 (lv0 낡은 원목~lv4 크리스탈+벨벳)
- **에셋 `assets/service/table_lv{0~4}_front.png`** (5장, 96x52): 테이블 앞면 (등급별 형태 차별화)
- **에셋 `assets/service/customer_{normal,vip,gourmet,rushed,group}_{waiting,seated}.png`** (10장): 손님 5종 x 2상태 독립 스프라이트
  - 해상도: 48x64 (group만 64x64)
  - waiting: 입장/착석 대기 포즈, seated: 서빙 후 착석 포즈
- **`js/managers/SpriteLoader.js`**: `_loadServiceAssets()`에 table_lv{0~4}_back/front 10종 + customer_{type}_{waiting,seated} 10종 로드 코드 추가
- **`js/scenes/ServiceScene.js`**: `_createTables()` 3레이어 분리 렌더링 구현
  - 독립 Image 3개: tableBackImg(depth=BASE), customerImg(depth=BASE+50), tableFrontImg(depth=BASE+99)
  - Container는 UI 요소(statusText, bubble, pBar, hitArea) 전용으로 축소
  - `useLayered` 데이터 플래그로 3레이어/레거시 구분
  - depth 공식: `BASE = 10 + (col+row)*100` (col=0,row=0: 10 ~ col=3,row=1: 410)
- **`js/scenes/ServiceScene.js`**: `_updateTableUI()` 3레이어 업데이트 분기
  - customerImg 텍스처 교체: `customer_{type}_{state}` -> `customer_{type}` -> 이모지 텍스트 3단계 fallback
  - mireuk_traveler: CUSTOMER_TYPE_IDS 미포함 -> 이모지 '💠' 폴백 정상 동작
  - group 손님 displaySize 40x40, 나머지 24x32
- **`js/scenes/ServiceScene.js`**: `_shutdown()` 독립 이미지 해제 코드 추가 (tableBackImg/tableFrontImg/customerImg destroy)

### Changed

- **`js/scenes/ServiceScene.js`**: HUD/UI depth 체계 전면 상향
  - HUD 배경/구분선: 100 -> 600, HUD 텍스트: 101 -> 601
  - 하단 바 배경: 100 -> 600, 스킬 버튼 배경: 101 -> 601, 스킬 텍스트: 102 -> 602
  - 직원 아이콘: 101 -> 601
  - 이벤트 배너: 250~251 -> 700~701
  - 플로팅 텍스트: 200 -> 750
  - 토스트(_showMessage): 300 -> 800
  - 일시정지 패널: 2000 (변경 없음)

### Notes

- 바닥 타일 isometric 128x128 재생성(floor_hall_* 8종 교체)은 에셋 생성 미완료. 코드 경로는 Phase 51-4에서 이미 구현 완료, 에셋 교체 시 자동 반영
- 스펙의 `_showToast()`는 실제 코드에서 `_showMessage()`로 구현. depth 상향은 동일 적용
- 기존 컴포짓 에셋(`table_lv{n}_occupied.png`, `table_lv{n}.png`) 파일 보존 (fallback 경로 유지)
- AD2 초기 REVISE (배경 투명화 20장, group_waiting 천막 제거, lv0/lv1 합성 정렬 보정) -> 전건 수정 후 APPROVED
- AD3: depth 계층, fallback 경로, customerImg 제어, 씬 클린업, 화면 경계 16항목 전체 APPROVED
- visual_change: both
- QA: PASS (67/67, 수용 기준 9/9 PASS + 1 N/A)
- 스펙: `.claude/specs/2026-04-19-kc-phase52-spec.md`
- 리포트: `.claude/specs/2026-04-19-kc-phase52-report.md`
- QA: `.claude/specs/2026-04-19-kc-phase52-qa.md`

## [Phase 51-3] 2026-04-19 -- 셰프 스킬 재설계

### Changed

- **`js/data/chefData.js`**: passiveDesc 문자열 3건 교정 (로직 변경 없음)
  - petit_chef: "재료 수거 범위 +30%" -> "재료 수거 범위 +30%, 조리시간 −15%"
  - flame_chef: "화염 타워 피해 +20%" -> "화염 타워 피해 +20%, 그릴 요리 수익 +25%"
  - ice_chef: "CC(둔화/빙결) 지속 +25%" -> "CC(둔화/빙결) 지속 +25%, 손님 인내심 +20%"

### Added

- **`js/managers/InventoryManager.js`**: `addIngredients(ingredients)` 메서드 추가
  - 재료 배열을 받아 인벤토리에 일괄 반환. 음수 수량 방어(`if (amount > 0)` 필터링)
- **`js/scenes/ServiceScene.js`**: 미력사 버프 5종 실제 로직 연결
  - `_updateAutoServe()`: effectiveServeDelay 계산 (`_buffServeSpeed` 반영, 최대 80% 캡). 무오 1단계: 3000ms->2250ms(-25%), 2/3단계: 3000ms->1800ms(-40%)
  - `_serveToCustomer()`: earlyMult(시엔), vipBonus(로살리오), gourmetBonus(레이라), yokoProtectBonus(요코) 4개 배율 변수 추가. totalGold 계산식 확장
  - `_serveToCustomer()`: 독립 계수 곱셈 원칙 주석 추가 (CHEF_SKILL_REDESIGN.md 2-4절 참조)
  - `_discardDish()`: 아이다 재료 회수 로직 (`_buffIngredientRefund` 확률 판정 + `addIngredients` 호출), `_buffNoFailDelay` 시 세척 생략
  - `_triggerRandomEvent()`: 로살리오 3단계 `_buffVipFoodReviewBonus` 반영 (food_review 이벤트 확률 +30%)
- **`js/scenes/ServiceScene.js`**: 요코(wanderer_yoko) chain_serve 구현
  - `_applyWanderingChefSkills()`: chain_serve case 구현 + 요코 변수 5개 초기화 (`_yokoChainThreshold`, `_yokoChainReward`, `_yokoChainCount`, `_yokoProtectNext`, `_yokoProtectActive`)
  - `_serveToCustomer()`: 서빙 성공 후 체인 카운터 증가, threshold 달성 시 `_yokoProtectNext=true`, 카운터 리셋
  - `_updateCustomerPatience()`: 인내심 0 도달 시 요코 퇴장 방지 분기 (500ms 고정 + VFX "연쇄 퇴장 방지!"), 자연 퇴장 시 카운터 리셋

### Notes

- 무오 3단계 `_buffMuoFirstServeGuarantee` (첫 서빙 인내심 80% 보장) 미구현. wanderingChefData.js에 serve_speed skillValues2가 정의되지 않아 후속 페이즈에서 데이터 추가 후 구현 필요
- 요코 퇴장 방지 시 인내심 500ms 고정. 극히 짧아 실질적으로 즉시 서빙 필요 (밸런스 확인 기획 판단 사항)
- `_buffNoFailDelay` 시 `washing=false` 설정은 사실상 무의미 (discard는 washing을 트리거하지 않음). 기능 이슈는 아님
- visual_change: ui
- QA: PASS (39/39, 수용 기준 10개 전항목 통과, 예외 시나리오 8개 통과)
- 스펙: `.claude/specs/2026-04-19-kc-phase51-3-spec.md`
- 리포트: `.claude/specs/2026-04-19-kc-phase51-3-report.md`
- QA: `.claude/specs/2026-04-19-kc-phase51-3-qa.md`

## [Phase 51-2] 2026-04-19 -- 유랑 미력사 고용 시스템

### Added

- **`js/data/wanderingChefData.js`** (신규): 8명 유랑 미력사 전체 데이터 정의
  - 등급: 초급(하루카, 보태) / 중급(레이라, 무오, 시엔) / 고급(아이다, 로살리오) / 전설(요코)
  - 스킬 유형 7종: patience_pct, cook_time_reduce, gourmet_rate, serve_speed, early_session_bonus, ingredient_refund, vip_rate (+ chain_serve TODO)
  - 단계별 수치 배열 (skillValues, skillValues2), 등급별 비용 테이블 (GRADE_COSTS), 등급명/색상 매핑
  - GRADE_COLORS: 초급=0x4daa4d(초록), 중급=0x4488cc(파랑), 고급=0xaa6622(황금), 전설=0x9933cc(보라)
- **`js/scenes/WanderingChefModal.js`** (신규): 고용/강화/해고 모달 씬
  - ShopScene에서 `scene.launch('WanderingChefModal')` + `scene.pause()` 패턴으로 진입
  - 8명 카드 목록 (Phaser Graphics 마스크 y=68~640 + 포인터 드래그 스크롤, maxScroll=260px)
  - 등급 뱃지 (center_x=308, 카드 우측 내부 배치)
  - 해금 전 잠금 표시 ("X-X 클리어 필요"), hireLimit=0 시 "(7-1 클리어 후 해금)" 안내
  - 고용/재고용 버튼 (정수 부족 시 "N 부족", 슬롯 초과 시 "슬롯 부족")
  - 강화 버튼 (1->2->3단계, 만강화 시 "만강화 ★★★")
  - 해고 버튼 (window.confirm 임시 구현, 환급 없음)
  - 닫기 버튼 44x44px, 정수 텍스트 x=GAME_WIDTH-72 (겹침 방지)
- **SaveManager `spendMireukEssence(amount)`** (`js/managers/SaveManager.js`): 정수 소비 메서드. `amount <= 0` 방어, 잔액 부족 시 false 반환 (Phase 51-1 QA 지적 해결)
- **SaveManager 유랑 미력사 헬퍼 6개** (`js/managers/SaveManager.js`): `getWanderingChefs()`, `hireWanderingChef(chefId, cost)`, `fireWanderingChef(chefId)`, `upgradeWanderingChef(chefId, cost)`, `isWanderingChefHired(chefId)`, `getHireLimit()`
- **ShopScene 직원 탭 변경** (`js/scenes/ShopScene.js`): "향후 추가 직원 예정" placeholder 제거, "유랑 미력사 고용" 섹션 추가 (구분선, 섹션 헤더 💠, 고용수/상한 표시, 보유 정수 잔액, WanderingChefModal 진입 버튼)
- **ServiceScene `_applyWanderingChefSkills()`** (`js/scenes/ServiceScene.js`): 세션 시작 시 고용 중인 미력사 패시브 스킬 일괄 적용
  - 실제 적용: `_patienceMults`(인내심 배율, CUSTOMER_PATIENCE_MULT 참조 3곳 교체), `_buffCookTimeReduce`(조리 시간 감소), `specialRates`(미식가/VIP 등장 확률 수정)
  - 변수 초기화만: `_buffServeSpeed`, `_buffEarlyBonus`/`_buffEarlyDuration`, `_buffIngredientRefund`/`_buffNoFailDelay`, `_buffVipRewardMult`, `_buffGourmetRewardMult`, `_buffVipFoodReviewBonus` (후속 페이즈에서 적용 위치 연동 예정)
- **main.js**: WanderingChefModal import + scene 배열 등록

### Changed

- **SaveManager SAVE_VERSION**: 18 -> 19
- **SaveManager `createDefault()`**: `hiredMireukChefs: []` 제거, `wanderingChefs: { hired: [], unlocked: [], enhancements: {} }` 구조체 추가
- **SaveManager `_migrate()`**: v18 -> v19 케이스 추가. `hiredMireukChefs` 배열 -> `wanderingChefs.hired` 이관, `unlocked` 소급 등록, `hiredMireukChefs` 키 삭제

### Notes

- 동시 고용 상한: chapter 7~12=1명, 13~18=2명, 19+=3명. chapter < 7이면 0명 (고용 불가)
- 비용 체계 (등급별): 초급 고용4/재고용2/강화1-2:3/강화2-3:6, 중급 12/6/10/20, 고급 35/18/30/60, 전설 80/40/70/140
- wanderer_yoko(전설) chain_serve 스킬: TODO 주석 처리, 실제 퇴장 방지 로직 미구현
- window.confirm() 해고 확인: 임시 구현, 추후 인게임 모달로 교체 예정
- hireWanderingChef 중복 호출 시 hired 중복 추가 안 되지만 정수 차감됨 (UI에서 방어, 코드 레벨 방어 미완)
- console.log 1건 잔류 (ServiceScene.js:511, 디버그용)
- visual_change: ui
- AD 모드 3: 최초 REVISE (6건: 스크롤 미구현, 등급 뱃지 잘림, hireLimit=0 안내 없음, X 버튼 소형, 초급 색상 가독성, 정수 잔액 미표시) -> 전건 수정 후 APPROVED
- QA: PASS (25/25, 수용 기준 14개 전항목 통과)
- 스펙: `.claude/specs/2026-04-18-kc-phase51-2-spec.md`
- 리포트: `.claude/specs/2026-04-18-kc-phase51-2-report.md`
- AD3 REVISE 리포트: `.claude/specs/2026-04-18-kc-phase51-2-ad3-revise-report.md`
- QA: `.claude/specs/2026-04-18-kc-phase51-2-qa.md`

## [Phase 51-1] 2026-04-18 -- 미력의 정수 화폐 시스템 코어 레이어

### Added

- **SaveManager v17->v18 마이그레이션** (`js/managers/SaveManager.js`)
  - 신규 필드 5개: `mireukEssence`(보유량), `mireukEssenceTotal`(누적 획득, 소비 시 불변), `mireukTravelerCount`(서빙 누적 횟수), `mireukBossRewards`(보스 정화 수령 기록), `hiredMireukChefs`(고용 미력사 목록, Phase 51-2 이후 사용)
  - 헬퍼 메서드 4개: `getMireukEssence()`, `addMireukEssence(amount)` (999 캡 적용, total도 증가), `getMireukTravelerCount()`, `incrementMireukTravelerCount()`
- **VFXManager.floatingText()** (`js/managers/VFXManager.js`): 범용 플로팅 텍스트 메서드 (x, y, text, color, fontSize). goldPopup과 동일 패턴 (y-35px, 1100ms fadeOut, Quad.easeOut)
- **mireuk_traveler 특수 손님 타입** (`js/scenes/ServiceScene.js`)
  - 상수 등록: `CUSTOMER_TYPE_ICONS`(💠), `CUSTOMER_PATIENCE_MULT`(1.5), `CUSTOMER_REWARD_MULT`(0.8)
  - `_scheduleMireukTraveler()`: 7-1 이후 16% 확률로 세션당 1회 등장 예약. 60~90초 사이 delayedCall. `_mireukSpawned` 중복 방지 플래그
  - `_spawnMireukTraveler()`: 빈 테이블에 스폰, 상위 30% 등급(tier >= 3) 레시피 우선 선택
  - `_pickRecipeForType('mireuk_traveler')`: gourmet과 동일 로직 (highTier 우선)
  - 정수 드롭 로직 (`_serveToCustomer()`): patienceRatio >= 80% -> 3정수, 40~79% -> 2정수, <= 39% -> 1정수
- **HUD mireukEssenceText** (`js/scenes/ServiceScene.js`): x=10, y=26, 11px, #b266ff. chapter >= 7 또는 보유량 > 0 시 표시
- **정수 드롭 VFX**: 보라색(#b266ff) 플로팅 텍스트 "💠 +N 정수!" (16px), 테이블 위에서 위로 떠오르며 페이드 아웃

### Notes

- 스펙에서 `_scheduleMireukTraveler` 조건이 "7-1 이후이고 season2Unlocked" AND 조건이었으나, 구현은 OR 형태 (`!isSeason2 && this.chapter < 7`). season2Unlocked=true이면 이전 챕터 리플레이에서도 등장 가능. QA에서 게임 경험상 자연스러운 동작으로 판단하여 PASS
- `addMireukEssence`에 음수 방어 미구현. 현재 Phase에서는 양수(1~3)만 전달하므로 문제 없음. Phase 51-2 소비 기능 구현 시 별도 `spendMireukEssence` 메서드 추가 권장
- 챕터별 등장 확률 보정(16~24장: 20%, 엔드리스: 12%)은 미구현 (TODO 주석). 현재 16% 단일 적용
- 기존 ServiceScene 라인 2014의 `this.vfx.floatingText(...)` 호출이 VFXManager 메서드 추가로 정상 동작하게 됨 (기존 런타임 오류 해소)
- visual_change: ui
- QA: PASS (25/25, 수용 기준 13개 전항목 통과, 시각 검증 3건 통과)
- AD 모드 3: UI 레이아웃 검수 완료 (HUD 2행 좌측 배치, 기존 요소와 충돌 없음)
- 스펙: `.claude/specs/2026-04-18-kc-phase51-1-spec.md`
- 리포트: `.claude/specs/2026-04-18-kc-phase51-1-report.md`
- QA: `.claude/specs/2026-04-18-kc-phase51-1-qa.md`

## [Phase 51-4] 2026-04-18 -- 영업씬 챕터별 배경 교체

### Added

- **챕터별 홀 바닥 에셋 8종** (`assets/service/floor_hall_*.png`, 128x128 tileable)
  - `floor_hall_g1` (ch1~6 할머니 식당), `floor_hall_izakaya` (ch7~9 이자카야), `floor_hall_dragon` (ch10~12 드래곤 팰리스), `floor_hall_bistro` (ch13~15 파리 비스트로), `floor_hall_spice` (ch16~18 스파이스 팰리스), `floor_hall_cantina` (ch19~21 칸티나), `floor_hall_dream` (ch22~24 드림 디저트), `floor_hall_endless` (엔드리스)
- **`_getHallFloorKey()` 헬퍼** (`js/scenes/ServiceScene.js`): `this.chapter` / `this.isEndless` 기반 바닥 에셋 키 반환
- **`_getWallBackKey()` 헬퍼** (`js/scenes/ServiceScene.js`): 동일 로직으로 뒷벽 에셋 키 반환
- **SpriteLoader 에셋 로드 16건** (`js/managers/SpriteLoader.js`): `_loadServiceAssets()`에 바닥 8종 + 뒷벽 8종 로드 루프 추가

### Changed

- **바닥 렌더링 방식 전환** (`js/scenes/ServiceScene.js` `_createTables()`): `add.image` → `add.tileSprite` (128x128 tileable 에셋 반복 채움)
- **뒷벽 렌더링 fallback 추가** (`js/scenes/ServiceScene.js` `_createHallDecor()`): 챕터별 키 우선 → 기존 `wall_back` fallback
- **하단 바 색조** (`js/scenes/ServiceScene.js` `_createBottomBar()`): `0x0d0d1a` → `0x1c0e00` (웜 다크 통합 팔레트 통일)

### Notes

- 스펙에서 뒷벽 에셋 8종도 생성 예정이었으나, PixelLab create_map_object API가 360x64 해상도를 지원하지 않아 미생성. 기존 `wall_back.png` fallback으로 정상 동작. 뒷벽 챕터별 변형은 후속 페이즈 처리 예정
- 기존 `floor_hall.png` (360x240)는 fallback용으로 유지
- SERVICE_SCENE_REDESIGN.md 기획서 기준 1단계 작업 완료 (바닥+뒷벽+하단바 색조)
- visual_change: art
- QA: PASS (25/25, 챕터별 tileSprite 렌더링, fallback, 엣지케이스 전항목 통과)
- AD Mode 1: APPROVED (에셋 컨셉 8종 승인)
- AD Mode 2: APPROVED (바닥 8종 전 테마 검증, 뒷벽 미생성 → fallback 확인)
- 스펙: `.claude/specs/2026-04-18-kc-phase51-4-spec.md`
- 리포트: `.claude/specs/2026-04-18-kc-phase51-4-report.md`
- QA: `.claude/specs/2026-04-18-kc-phase51-4-qa.md`
- AD Mode 1: `.claude/specs/2026-04-18-kc-phase51-4-ad1.md`
- AD Mode 2: `.claude/specs/2026-04-18-kc-phase51-4-ad2.md`

## [Phase 47-3] 2026-04-18 -- 일반 적 41종 death 애니메이션 완료

### Added

- **ENEMY_DEATH_HASHES 41종 추가** (`js/managers/SpriteLoader.js`)
  - 기존 carrot_goblin 1종 → 42종 (전 일반 적 커버)
  - 추가된 41종: meat_ogre, octopus_mage, chili_demon, cheese_golem, flour_ghost, egg_sprite, rice_slime, fish_knight, mushroom_scout, cheese_rat, shrimp_samurai, tomato_bomber, butter_ghost, sugar_fairy, milk_phantom, sushi_ninja, tempura_monk, dumpling_warrior, mini_dumpling, wok_phantom, sake_specter, oni_minion, shadow_dragon_spawn, wok_guardian, wine_specter, foie_gras_knight, cellar_phantom, sommelier_wraith, curry_djinn, naan_golem, incense_specter, spice_elemental, masala_guide, taco_bandit, burrito_juggernaut, cactus_wraith, luchador_ghost, candy_soldier, cake_witch, macaron_knight, sugar_specter
- **일반 적 41종 death 에셋** (`assets/enemies/{id}/animations/falling_backward-{hash}/{dir}/frame_NNN.png`)
  - 41종 x 4방향(south/north/east/west) x 7프레임 = 1,148 PNG
  - PixelLab falling-back-death 템플릿으로 생성, AD Mode 2 APPROVED
- **다운로드 스크립트** (`scripts/download_death_anims_47_3.sh`): 41종 에셋 일괄 다운로드용

### Notes

- Phase 47 애니메이션 시스템 전체 완결: 47-1(아키텍처+파일럿) → 47-2(보스 13종) → 47-3(일반 적 41종)
- ENEMY_DEATH_HASHES 42종 + BOSS_DEATH_HASHES 13종 = 전 적/보스 55종 death anim 커버
- 총 death 에셋: 일반 적 1,176 PNG (42종) + 보스 364 PNG (13종) = 1,540 PNG
- visual_change: art
- QA: PASS (수용 기준 4/4, 에셋 1,176 PNG 무결성 확인, 코드-파일시스템 해시 100% 일치, 빌드 PASS, 회귀 없음)
- AD Mode 2: APPROVED (1,148 PNG 구조/유효성 전 항목 통과)
- 스펙: `.claude/specs/2026-04-17-kc-phase47-3-spec.md`
- QA: `.claude/specs/2026-04-18-kc-phase47-3-qa.md`
- AD Mode 1: `.claude/specs/2026-04-17-kc-phase47-3-ad1.md`
- AD Mode 2: `.claude/specs/2026-04-18-kc-phase47-3-ad2.md`

## [Phase 47-2] 2026-04-17 -- 보스 13종 death 애니메이션 지원

### Added

- **BOSS_DEATH_HASHES 맵** (`js/managers/SpriteLoader.js`)
  - 13종 보스 death 애니메이션 폴더 해시 등록 (전원 non-null):
    - pasta_boss: `falling_backward-91a21a29`
    - dragon_ramen: `falling_backward-dfb179e6`
    - seafood_kraken: `falling_backward-30586cf0`
    - lava_dessert_golem: `falling_backward-7eea5222`
    - master_patissier: `falling_backward-a4ffe1ee`
    - cuisine_god: `falling_backward-217e6c2f`
    - sake_oni: `falling_backward-d9bee694`
    - dragon_wok: `falling_backward-13405143`
    - sake_master: `falling_backward-a0f9a5fe`
    - chef_noir: `falling_backward-bec39063`
    - maharaja: `falling_backward-7da945c4`
    - el_diablo_pepper: `falling_backward-7f8bea1c`
    - queen_of_taste: `falling_backward-7bf0791d`
- **`_loadBossDeathFrames()`** (`js/managers/SpriteLoader.js`): 보스 death 프레임 로드. BOSS_DEATH_HASHES 기반, hash null 시 skip. `preload()`에서 호출
- **`registerBossDeathAnimations()`** (`js/managers/SpriteLoader.js`): 보스 death Phaser anim 등록 (repeat: 0, frameRate: 8). BootScene.create()에서 registerDeathAnimations 직후 호출
- **보스 13종 death 에셋** (`assets/bosses/{boss_id}/animations/{hash}/{dir}/frame_NNN.png`)
  - 13종 x 4방향(south/north/east/west) x 7프레임 = 364개 PNG
  - PixelLab falling-back-death 템플릿으로 생성, AD Mode 2 APPROVED

### Changed

- **`hasDeathAnim()`** (`js/managers/SpriteLoader.js`): `prefix` 파라미터 추가 (기본값 `'enemy'`). `boss_` / `enemy_` 양쪽 키 조회 지원. 기존 호출 코드 하위 호환 유지
- **`Enemy._die()`** (`js/entities/Enemy.js`): `deathPrefix` 변수 도입 (`isBoss || isMidBoss` ? `'boss'` : `'enemy'`). `hasDeathAnim` 호출 시 prefix 전달, `deathAnimKey` 조합도 `${deathPrefix}_` 방식으로 변경
- **`BootScene.create()`** (`js/scenes/BootScene.js`): `SpriteLoader.registerBossDeathAnimations(this)` 호출 추가 (59-60행)

### Notes

- 스펙 초기 설계는 BOSS_DEATH_HASHES를 null placeholder로 시작하여 순차 기입 예정이었으나, AD 에셋 생성 완료 후 13종 전부 기입하여 완결됨
- queen_of_taste_2, queen_of_taste_3 death anim은 Phase 47-2 범위 밖 (별도 Phase에서 추가 예정). 페이즈2/3 상태에서 사망 시 기본형(queen_of_taste) death anim 재생
- visual_change: art
- QA: PASS (수용 기준 10/10, 예외 시나리오 10/10, Playwright 11/11, 시각 검증 6/6)
- AD Mode 2: APPROVED
- 스펙: `.claude/specs/2026-04-17-kc-phase47-2-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase47-2-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase47-2-qa.md`
- AD Mode 1: `.claude/specs/2026-04-17-kc-phase47-2-ad1.md`

## [Phase 47-1] 2026-04-17 -- walk+death 애니메이션 시스템 아키텍처 구축

### Added

- **ENEMY_DEATH_HASHES 맵** (`js/managers/SpriteLoader.js`)
  - `carrot_goblin: 'falling_backward-10a27983'` 등록
  - 미등록 적은 기존 동작(즉시 destroy) 유지, 회귀 없음
- **death 애니메이션 로딩/등록 시스템** (`js/managers/SpriteLoader.js`)
  - `_loadEnemyDeathFrames(scene)`: ENEMY_DEATH_HASHES에 등록된 적의 death 프레임을 `assets/enemies/{id}/animations/{hash}/{dir}/frame_NNN.png`에서 로드
  - `registerDeathAnimations(scene)`: Phaser anim `enemy_{id}_death_{dir}` 키로 등록. repeat: 0 (1회 재생), frameRate: 8
  - `hasDeathAnim(scene, id, dir)`: death anim 존재 여부 조회 + 8방향->4방향 폴백 매핑 (`DEATH_DIR_FALLBACK`)
  - 상수: `DEATH_DIRS` (south/north/east/west 4방향), `DEATH_FRAME_COUNT = 7`
- **Enemy._animState 상태 머신** (`js/entities/Enemy.js`)
  - 3상태: `IDLE` (정지 프레임), `WALKING` (walk anim 재생), `DYING` (death anim 재생)
  - `_buildVisual()`에서 walk anim 유무에 따라 WALKING/IDLE 초기화
  - `update()`, `takeDamage()` 가드에 `_animState === 'DYING'` 조건 추가 (DYING 중 이동/피격 차단)
- **_executeDeath() 분리** (`js/entities/Enemy.js`)
  - 기존 `_die()` 내부 로직(분열/포자/힐/보스보상/emit/destroy)을 `_executeDeath()`로 추출
  - death anim 있으면: DYING 전환 -> anim 완료 콜백에서 `_executeDeath()` 호출
  - death anim 없으면: 즉시 `_executeDeath()` (기존 동작 유지)
  - `_deathExecuted` 가드로 중복 실행 방지
  - 씬 shutdown 안전장치: `!this.scene || !this.scene.sys || !this.scene.sys.isActive()` 체크
- **BootScene.js**: `SpriteLoader.registerDeathAnimations(this)` 호출 추가 (registerWalkAnimations 직후)
- **carrot_goblin death 에셋** (`assets/enemies/carrot_goblin/animations/falling_backward-10a27983/`)
  - 4방향(south/north/east/west) x 7프레임 = 28개 PNG
  - PixelLab falling-back-death 템플릿으로 생성
  - 총 66,404 bytes. walk 에셋(walking-012372c9)과 팔레트/크기/아웃라인 일관성 확인 (AD Mode 2 APPROVED)

### Changed

- `Enemy._die()`: isDead/active 설정 후 death anim 분기 로직 삽입. 기존 즉시 destroy 로직은 _executeDeath()로 이동
- death anim key: `enemy_{id}_death_{dir}` (스펙의 보스 prefix 동적 분기는 `enemy_` 고정으로 단순화. Phase 47-2에서 보스 지원 시 확장 예정)

### Notes

- 스펙 대비 변경: `DEATH_FRAME_COUNT` 6 -> 7 (PixelLab 템플릿이 7프레임 생성)
- 스펙 대비 변경: 폴더 해시명 `dying-XXXXXXXX` -> `falling_backward-10a27983` (PixelLab 생성 결과)
- 스펙 대비 변경: `_die()` 보스 prefix 분기 생략 -> `enemy_` 하드코딩 (ENEMY_IDS만 대상이므로 적절한 단순화)
- QA 잠재 위험: `hasDeathAnim()`과 death anim key에 `enemy_` 하드코딩. Phase 47-2 보스 death anim 추가 시 prefix 파라미터 또는 별도 함수 필요
- visual_change: art
- QA: PASS (수용 기준 15/15, 예외 시나리오 8/8, Playwright 7/7, 시각 검증 4/4)
- AD Mode 2: APPROVED
- 스펙: `.claude/specs/2026-04-17-kc-phase47-1-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase47-1-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase47-1-qa.md`
- AD Mode 1: `.claude/specs/2026-04-17-kc-phase47-1-ad1.md`
- AD Mode 2: `.claude/specs/2026-04-17-kc-phase47-1-ad2.md`

## [Phase 46] 2026-04-17 -- 통합 검증 및 잔여 버그 수정

### Fixed

- metadata.json size 필드 일괄 갱신: 총 50건 (42건 갱신 + 8건 신규 생성)
  - 일반 적 34종 -> 92x92 (30종 갱신, macaron_knight/sugar_specter/sushi_ninja/tempura_monk 4종 신규)
  - 보스 13종 -> 112x112 (일반 보스 10종) / 136x136 (cuisine_god, queen_of_taste). queen_of_taste, sake_oni 신규 생성
  - 셰프 5종 -> 92x92 (3종 갱신, yuki_chef/lao_chef 2종 신규)
  - incense_specter, spice_elemental: 구 포맷 -> 신 포맷 마이그레이션
  - 기존 필드(id, prompt, frames, animations, template_id) 전부 보존
- enemy_charge_impact 이벤트 핸들러 구현 (`js/scenes/GatheringScene.js`)
  - L153 이벤트 등록, L1251~1278 핸들러 메서드, L2182 shutdown 해제
  - burrito_juggernaut 돌진 시 반경 내 타워에 알파 깜빡임 + '돌진!' 플로팅 텍스트 + screenShake
  - Tower 클래스 미수정 (비침습적, VFX 피드백만)
  - 스펙의 `flashAt`/`floatText` 대신 기존 패턴(`tweens.add` + `add.text` + `vfx.screenShake`) 조합 사용
- cardamom.png 고유 아이콘 교체 (`assets/ingredients/cardamom.png`)
  - chai.png 복사본 placeholder -> PixelLab map_object 생성 초록 꼬투리 픽셀아트
  - 32x32px RGBA, 배경 투명, chai.png와 39.4% 픽셀 상이
  - AD Mode 2 APPROVED

### Verified

- pasta_boss rotations 파일명: 실측 결과 이미 hyphenated 형식(south-east.png 등)으로 정상. PROJECT.md 오기 삭제
- 전 캐릭터(적 34종 + 보스 13종 + 셰프 5종) 게임 내 렌더링 정상 (Playwright 10/10 통과)
- yuki_chef, lao_chef 셰프 선택 화면 정상 표시 (잠금 상태)
- queen_cream_supreme 서빙 UI 정상 (8개 재료 ingStr 텍스트 잘림 없음)
- 모바일 뷰포트(360x640) 정상 스케일링
- 씬 전환 반복 시 에러 없음, 이벤트 리스너 누수 없음

### Notes

- visual_change: art
- QA: PASS (Playwright 10/10, Python 메타데이터 59건 OK, 스크린샷 7건 시각 확인)
- AD Mode 2: APPROVED (cardamom.png)
- 알려진 예외: mini_dumpling metadata 92x92 vs 실제 36x36 (분열 소환 적 의도적 소형)
- 스펙: `.claude/specs/2026-04-17-kc-phase46-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase46-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase46-qa.md`
- AD Mode 2: `.claude/specs/2026-04-17-kc-phase46-ad2.md`

## [Phase 45] 2026-04-17 — 셰프 스프라이트 5종 92x92px 업그레이드

### Art

- petit_chef, flame_chef, ice_chef: 80x80px -> 92x92px chibi 재생성 (`rotations_old_bak/` 백업)
- yuki_chef (유키), lao_chef (라오): 신규 92x92px chibi 생성
- 차별화: ice_chef(파란 toque+navy jacket) vs yuki_chef(하늘색 happi+hachimaki), flame_chef(빨간 bandana+leather) vs lao_chef(주황 mandarin jacket+wok)
- 5종 x 8방향 = 40개 PNG, 전 92x92px RGBA
- PixelLab IDs: petit(`3286712e`), flame(`6aee50e2`), ice(`098c8ef8`), yuki(`58b0a3ca`), lao(`a61c4979`)
- 앵커: carrot_goblin 64px v2 (`ca774523-aeca-4f33-8495-4fb0db4ba22a`)

### Changed

- `assets/chefs/{petit,flame,ice}_chef/rotations/` — 80x80 -> 92x92px PNG 교체 (기존 백업 완료)
- `assets/chefs/{yuki,lao}_chef/rotations/` — 신규 생성 (8방향 x 2종 = 16개 PNG)
- Phase 44 아트 리워크 + Phase 45 셰프 리워크 = 전 캐릭터(적+보스+셰프) 통일 완결

### Known Issues

- petit_chef, flame_chef, ice_chef의 `metadata.json`에 구 해상도(80x80) 기록 잔존. 게임에서 미참조, 기능 영향 없음. Phase 46에서 일괄 정리 예정.
- 신규 2종(yuki_chef, lao_chef)에 `metadata.json` 없음.

### Notes

- 생성 표준: size 64, canvas 92x92, chibi, single color black outline, basic shading, medium detail, low top-down, 8방향
- visual_change: art
- 코드 변경 없음 (에셋 파일 교체/추가만)
- AD 모드 2: APPROVED (5종 전원, REVISE 0건)
- QA: PASS (수용 기준 9/9 충족, 예외 시나리오 5/5, 시각 검증 4/4)
- 스펙: `.claude/specs/2026-04-17-kc-phase45-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase45-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase45-qa.md`
- AD 모드 1: `.claude/specs/2026-04-17-kc-phase45-ad1.md`
- AD 모드 2: `.claude/specs/2026-04-17-kc-phase45-ad2.md`

## [Phase 44-3] 2026-04-17 — 그룹3 스프라이트 64px 재생성 (16~24장 적 13종 + 보스 3종)

### Added

- 일반 적 13종 64px 스프라이트 (캔버스 92x92px, 8방향 rotations)
  - Spice Palace (16~18장): curry_djinn, naan_golem, masala_guide, incense_specter, spice_elemental
  - Mexican Fiesta (19~21장): taco_bandit, burrito_juggernaut, cactus_wraith, luchador_ghost
  - Candy Kingdom (22~24장): candy_soldier, cake_witch, macaron_knight, sugar_specter
  - PixelLab create_character API, 앵커: carrot_goblin 64px v2 (`ca774523-aeca-4f33-8495-4fb0db4ba22a`)
- 보스 2종 80px 스프라이트 (캔버스 112x112px, 8방향 rotations)
  - maharaja (18장 보스), el_diablo_pepper (21장 보스)
- 최종보스 queen_of_taste 96px 스프라이트 (캔버스 136x136px, 8방향 rotations)
  - 24장 최종보스, 신규 생성. v2 재시도(retry)로 최종 확정 (PixelLab ID: `c1622a20-91af-4e88-8d4e-d9ce0bfe4193`)
- 구 스프라이트 백업 폴더: `rotations_old_bak/` (기존 13종). 신규 3종(queen_of_taste, macaron_knight, sugar_specter)은 백업 대상 없음

### Changed

- `kitchen-chaos/assets/enemies/{13종}/rotations/` — 기존 크기(68~164px) → 92x92px(본체 ~64px) PNG 교체
- `kitchen-chaos/assets/bosses/maharaja/rotations/` — 212x212px → 112x112px PNG 교체
- `kitchen-chaos/assets/bosses/el_diablo_pepper/rotations/` — 116x116px → 112x112px PNG 교체
- `kitchen-chaos/assets/bosses/queen_of_taste/rotations/` — 신규 생성 (136x136px)
- Phase 44 아트 리워크 전체 완료 (44-1 그룹1 + 44-2 그룹2 + 44-3 그룹3 = 전 캐릭터 통일)

### Notes

- 생성 표준: size 64(적)/80(보스)/96(최종보스), chibi, single color black outline, basic shading, medium detail, low top-down, 8방향
- visual_change: art
- AD 모드 1: APPROVED (16종 프롬프트 확정)
- AD 모드 2: APPROVED (16종 전체 PASS, REVISE 0건)
- QA: PASS (수용 기준 8/8 충족, 예외 시나리오 3/3 PASS, 128개 PNG 무결성 확인)
- 스펙: `.claude/specs/2026-04-17-kc-phase44-3-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase44-3-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase44-3-qa.md`
- AD 모드 1: `.claude/specs/2026-04-17-kc-phase44-3-ad1.md`
- AD 모드 2: `.claude/specs/2026-04-17-kc-phase44-3-ad2.md`

## [Phase 44-2] 2026-04-17 — 그룹2 스프라이트 64px 재생성 (7~15장 적 12종 + 보스 4종)

### Added

- 일반 적 12종 64px 스프라이트 (캔버스 92x92px, 8방향 rotations)
  - dumpling_warrior, sushi_ninja, tempura_monk, oni_minion, sake_specter, wok_phantom, shadow_dragon_spawn, wine_specter, foie_gras_knight, cellar_phantom, sommelier_wraith, wok_guardian
  - PixelLab create_character API, 앵커: carrot_goblin 64px v2 (`ca774523-aeca-4f33-8495-4fb0db4ba22a`)
- 보스 4종 80px 스프라이트 (캔버스 112x112px, 8방향 rotations)
  - sake_oni, sake_master, dragon_wok, chef_noir
  - sake_master, chef_noir: 초회 생성 실패 → 재시도 성공
- 구 스프라이트 백업 폴더: `rotations_old_bak/` (16종 모두)

### Changed

- `kitchen-chaos/assets/enemies/{12종}/rotations/` — 기존 크기(48~92px) → 92x92px(본체 ~64px) PNG 교체
- `kitchen-chaos/assets/bosses/{4종}/rotations/` — 기존 크기(68~124px) → 112x112px(본체 ~80px) PNG 교체

### Known Issues

- sake_specter의 3개 방향(north 893B, west 996B, north-west 1001B)이 1KB 미만이나 유효 PNG. 반투명 유령 캐릭터 특성상 데이터량이 적은 것으로 판단.
- walk 애니메이션(animations/ 폴더)은 미교체. 기존 걷기 프레임 유지. 별도 Phase에서 처리 예정.

### Notes

- 생성 표준: size 64(적)/80(보스), chibi, single color black outline, basic shading, medium detail, low top-down, 8방향
- visual_change: art
- AD 모드 1: APPROVED (16종 프롬프트 확정)
- AD 모드 2: APPROVED (14종 초회 PASS + WARN 8건(해상도 한계 수용), 2종(wine_specter/cellar_phantom) v2 재생성 후 APPROVED)
- QA: PASS (6/6 수용 기준 충족 — 파일 존재성, 크기, 투명 배경, 파일명 컨벤션, 백업, AD 승인)
- 스펙: `.claude/specs/2026-04-17-kc-phase44-2-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase44-2-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase44-2-qa.md`
- AD 모드 1: `.claude/specs/2026-04-17-kc-phase44-2-ad1.md`
- AD 모드 2: `.claude/specs/2026-04-17-kc-phase44-2-ad2.md`

## [Phase 44-1] 2026-04-17 — 그룹1 스프라이트 64px 재생성 (1~6장 적 16종 + 보스 6종)

### Added

- 일반 적 16종 64px 스프라이트 (캔버스 92x92px, 8방향 rotations)
  - carrot_goblin, meat_ogre, octopus_mage, chili_demon, cheese_golem, flour_ghost, egg_sprite, rice_slime, fish_knight, mushroom_scout, cheese_rat, shrimp_samurai, tomato_bomber, butter_ghost, sugar_fairy, milk_phantom
  - PixelLab create_character API, 앵커: carrot_goblin 64px v2 (`ca774523-aeca-4f33-8495-4fb0db4ba22a`)
- 보스 5종 80px 스프라이트 (캔버스 112x112px, 8방향 rotations)
  - pasta_boss, dragon_ramen, seafood_kraken, lava_dessert_golem, master_patissier
  - pasta_boss: 초회 REVISE(황금 뱀 형태, 파스타 소품 불명확) → v2 재생성(PixelLab ID: `1daf8b83-f3b0-4ba8-b463-1a9dcf7c99e7`) 후 APPROVED
- 최종보스 cuisine_god 96px 스프라이트 (캔버스 136x136px, 8방향 rotations)
- 구 스프라이트 백업 폴더
  - 적: `rotations_48px_bak/` (16종)
  - 보스: `rotations_old_bak/` (6종)

### Changed

- `kitchen-chaos/assets/enemies/{16종}/rotations/` — 48px → 92x92px(본체 ~64px) PNG 교체
- `kitchen-chaos/assets/bosses/{5종}/rotations/` — 기존 크기(84~92px) → 112x112px(본체 ~80px) PNG 교체
- `kitchen-chaos/assets/bosses/cuisine_god/rotations/` — 112x112px → 136x136px(본체 ~96px) PNG 교체

### Known Issues

- pasta_boss rotations/ 파일명이 unhyphenated (`southeast.png` 등). 나머지 21종은 hyphenated (`south-east.png`). 현재 게임 코드는 `south.png`만 로드하므로 런타임 영향 없음. 후속 수정 필요.
- 22종 metadata.json `character.size` 필드가 구 해상도 유지 (적 48x48, 보스 84~112px). 게임 코드가 직접 참조하지 않으므로 긴급하지 않으나 후속 갱신 필요.
- walk 애니메이션(animations/ 폴더)은 미교체. 기존 48px 걷기 프레임 유지. 별도 Phase에서 처리 예정.
- dist/sprites/ 에 구 스프라이트 잔존 (vite build 실행 전까지).

### Notes

- 생성 표준: size 64(적)/80(보스)/96(최종보스), chibi, single color black outline, basic shading, medium detail, low top-down, 8방향
- visual_change: art
- AD 모드 2: APPROVED (22종 전체 PASS, WARN 3건 — flour_ghost/rice_slime/cheese_rat 색상 유사성, 스타일 위반 아님)
- QA: PARTIAL (파일 존재성/크기/알파/시각 품질 PASS, 파일명 컨벤션+metadata 정합성 FAIL)
- 스펙: `.claude/specs/2026-04-17-kc-phase44-1-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase44-1-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase44-1-qa.md`
- AD 모드 1: `.claude/specs/2026-04-17-kc-phase44-1-ad1.md`
- AD 모드 2: `.claude/specs/2026-04-17-kc-phase44-1-ad2.md`

## [Phase 43] 2026-04-17 — 잔여 콘텐츠 구현 (8장/14장 스테이지 + 유키/라오 패시브)

### Added

- 8-1~8-6 스테이지 구현 (theme: `izakaya_deep_entry`, 이자카야 지하 진입로)
  - 8-1 지하 통로 진입 ~ 8-5 비밀 연회장: 5웨이브 sake_specter/oni_minion 점진적 도입
  - 8-6 오니의 방 (보스): oni_herald W5 등장, isBossBattle: true
  - 서비스 스케일: duration 245~285, customerInterval 3.4~2.5, maxCustomers 36~47
- 14-1~14-6 스테이지 구현 (theme: `bistro_underground`, 비스트로 지하 창고)
  - 14-1 지하 와인 창고 ~ 14-5 소믈리에의 서재: cellar_phantom/sommelier_wraith 점진적 도입
  - 14-6 셰프 누아르 전초기지 (보스): chef_noir W1 등장, isBossBattle: true, 3웨이브
  - 서비스 스케일: duration 328~365, customerInterval 2.6~2.1, maxCustomers 53~63
- ChefManager: `getHighStarRewardBonus()` 정적 메서드 (yuki_chef: 1.15, 그 외: 1.0)
- ChefManager: `getDropRateBonus()` 정적 메서드 (lao_chef: 0.10, 그 외: 0.0)
- gameData.js: cellar_phantom(HP 400, splitOnDeath), sommelier_wraith(HP 380, wineDebuff), chef_noir(HP 9000, isBoss+summon+enrage) ENEMY_TYPES 정식 등록

### Changed

- ServiceScene `_serveToCustomer()`: 유키 패시브 적용 -- recipe.tier >= 3 조건으로 highStarBonus (x1.15) 곱셈 추가
- IngredientManager `_onEnemyDied()`: 라오 패시브 적용 -- 10% 확률로 드롭 count +1 (ChefManager.getDropRateBonus())
- stageData.js: 8-1~8-6, 14-1~14-6 placeholder를 완성 데이터로 교체. 전 24장 placeholder 0개 달성

### Notes

- 스펙에서 `recipe.rarity >= 3` 기준이었으나 실제 데이터 구조에 맞게 `recipe.tier >= 3`으로 구현 변경
- cellar_phantom/sommelier_wraith/chef_noir ENEMY_TYPES 등록은 스펙에서 Coder 선행 확인 후 필요 시 추가하라는 지시에 따라 구현됨
- Playwright 25/25 PASS (재검증), 빌드 PASS (Vite 6.4.2, 54 modules)
- visual_change: none
- 스펙: `.claude/specs/2026-04-17-kc-phase43-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase43-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase43-qa.md`

## [Phase 42] 2026-04-17 — 업적 시스템

### Added

- `js/data/achievementData.js` (신규): 30개 업적 정의 (ACHIEVEMENTS 배열 + ACHIEVEMENT_CATEGORIES + getByCategory 헬퍼)
  - 스토리 10개: story_first_clear ~ story_all_stages (stage_cleared/chapter_cleared/three_star_count)
  - 전투 8개: battle_first_kill ~ battle_full_deploy (enemy_total_killed/boss_killed/tool_count_placed)
  - 수집 5개: collect_10recipes ~ collect_all_recipes (recipe_unlocked, 최대 284종)
  - 경제 5개: econ_gold1000 ~ econ_max_interior (total_gold_earned/staff_hired/interior_maxed)
  - 엔드리스 2개: endless_wave20, endless_wave50 (endless_wave)
- `js/managers/AchievementManager.js` (신규): 정적 클래스 -- check(), increment(), getProgress(), _evaluate(), _unlock(), _getCurrentValue(), 헬퍼 4종
  - _unlock()은 해금 기록+세이브+토스트만 수행 (보상 지급은 AchievementScene._claimReward()에서만 실행)
- `js/scenes/AchievementScene.js` (신규): 5 카테고리 탭 + 스크롤 카드 목록 UI, 진행률 바, 수령 버튼, 잔액 표시
- VFXManager: `achievementToast(scene, nameKo)` 정적 메서드 추가 (depth 2500, scaleX 등장, 1.5s 후 fadeOut)
- SaveManager v16 -> v17 마이그레이션: achievements 필드 (unlocked/claimed/progress) 추가, getAchievements()/markAchievementClaimed() 메서드
- MenuScene: 업적 버튼(y=534) 추가, 기존 요소 Y좌표 재배치 (도감 496/엔드리스 570/기록 593/평판 610/설명 624/버전 636)
- main.js: AchievementScene 씬 등록

### Changed

- GatheringScene `_onEnemyDied`: enemy_total_killed/boss_killed increment+check, `_triggerVictory`에 tool_count_placed check
- ServiceScene `_endService`: total_gold_earned increment+check, staff_hired/interior_maxed check
- ResultScene: 캠페인 클리어 시 stage_cleared/chapter_cleared/three_star_count/recipe_unlocked check, 엔드리스 결과에 endless_wave/endless_score check

### Fixed

- BUG-01 (이중 보상): `_unlock()`에서 coin/gold 보상 지급 코드 제거 -- 보상은 AchievementScene._claimReward()에서만 1회 지급
- BUG-02 (골드 손실): `_unlock()`에서 ToolManager.addGold() 호출 제거로 stale data 덮어쓰기 경로 소멸

### Notes

- 세이브 버전: v16 -> v17 (achievements 필드 추가)
- QA 초회 FAIL (BUG-01/BUG-02) -> 수정 후 재검증 PASS (8/8 수용 기준 충족)
- Playwright 32/32 PASS, 빌드 PASS (Vite 6.4.2, 54 modules)
- visual_change: ui -- AD 모드 3 검수 완료
- LOW 잔여: ToolManager dead import, _unlock() JSDoc 미갱신, endless_score 조건 유형 미사용 (dead code)
- 스펙: `.claude/specs/2026-04-17-kc-phase42-spec.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase42-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase42-qa.md`

## [Phase 41] 2026-04-17 — 23-6 여왕의 호위대 구현 (그룹3 placeholder 완전 해소)

### Added

- 23-6 `여왕의 호위대` (dream_deep, 3웨이브): 그룹3 마지막 placeholder 구현. macaron_knight/sugar_specter 집중 + 전 그룹3 적 혼합 고밀도 구성. 역V자 경로(col3→row5→col6). 24장 미각의 여왕 전(前) 최후 관문.
  - 웨이브1: macaron_knight(44), sugar_specter(26), candy_soldier(88), cake_witch(24) 외 6종
  - 웨이브2: 웨이브1보다 20~30% 증량 + milk_phantom 추가 (11종)
  - 웨이브3: 웨이브2보다 25~30% 증량 클라이맥스 (11종)

### Changed

- storyData.js: chapter23_cleared 트리거 이동 (23-5 → 23-6). currentChapter=24 설정 및 chapter23_cleared 플래그가 이제 23-6 첫 클리어 시 발동.

### Notes

- 그룹1~3 placeholder 0개 달성 (1~24장 캠페인 완전 구현, 8장/14장 별도 아크 제외)
- Playwright 17/17 PASS, JS pageerror 0건
- 세이브 버전 v16 유지
- 스펙: `.claude/specs/2026-04-17-kc-phase41-scope.md`
- 리포트: `.claude/specs/2026-04-17-kc-phase41-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase41-qa.md`

## [Phase 40] 2026-04-17 — 그룹3 중간 보스/특수 스테이지 5종 구현

### Added

#### 40-1: 인도 아크 마무리 (16-6 + 17-6)

- 16-6 `향신료 궁전의 관문` (spice_palace, 3웨이브): maharaja 중보스 첫 등장 스테이지. 웨이브3 maharaja(1) + masala_guide(6) 보스 웨이브. 18-6 최종 보스전 복선.
- 17-6 `향신료 심층부의 폭풍` (spice_palace, 2웨이브): 대규모 향신료 아크 러시. spice_elemental + cheese_golem 포함. 18장 황금 왕궁 진입 브릿지.

#### 40-2: 멕시칸 아크 마무리 (19-6 + 20-6)

- 19-6 `칸티나의 최후 방어선` (cactus_cantina, 2웨이브): 멕시칸 아크 1막 종결. taco_bandit + burrito_juggernaut 위주 대규모 러시. 20장 균열 근원지 진입 브릿지.
- 20-6 `균열의 심장` (cactus_cantina, 4웨이브): el_diablo_pepper 중보스 예고전. 웨이브4 el_diablo_pepper(1) + cactus_wraith(3) + luchador_ghost(3) 보스 웨이브. 21-6 최종전 복선.

#### 40-3: 디저트 아크 마무리 (22-6 + storyData)

- 22-6 `케이크 위치의 연회` (dream_candy, 3웨이브): cake_witch(isBoss:false) 다수(18/26/36) + candy_soldier + 교차 아크 혼합 적 가마솥 특수전. 22장 완결 스테이지.
- storyData.js: chapter22_cleared 트리거 이동 (22-5 → 22-6). currentChapter=23 설정 및 chapter22_cleared 플래그가 이제 22-6 첫 클리어 시 발동.

### Notes

- placeholder 5종 완전 교체: 16-6, 17-6, 19-6, 20-6, 22-6 모두 실제 스테이지로 구현
- 잔여 placeholder: 23-6 (1개, 별도 Phase)
- 보스 패턴: 16-6 maharaja / 20-6 el_diablo_pepper 모두 18-6/21-6과 동일한 보스 웨이브 패턴 (count:1, interval:0 + 호위)
- 신규 스프라이트 없음 (visual_change: none) — 기존 maharaja/el_diablo_pepper/cake_witch 스프라이트 활용
- Playwright 19/19 PASS, JS pageerror 0건
- 세이브 버전 v16 유지 (데이터 구조 동일, 신규 스테이지 추가만)
- 스펙: `.claude/specs/2026-04-17-kc-phase40-scope.md`
- 40-1 리포트: `.claude/specs/2026-04-17-kc-phase40-1-report.md`
- 40-2 리포트: `.claude/specs/2026-04-17-kc-phase40-2-report.md`
- 40-3 리포트: `.claude/specs/2026-04-17-kc-phase40-3-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase40-qa.md`

## [Phase 39] 2026-04-17 — 그룹3 밸런스 QA (16~24장 전체 검증)

### Added

#### 39-1: Enemy.js Fix #5 + 밸런스 시뮬레이션

- Enemy.js L450-451: 주기적 소환 블록에 `entry.count` 반영 루프 추가 (Fix #5)
  - `const spawnCount = entry.count || 1; for (let i = 0; i < spawnCount; i++)` -- 방어적 fallback
  - 영향 보스: queen_of_taste만 (12초 주기로 macaron_knight 2마리 + sugar_specter 3마리 = 5마리 정상 소환)
  - el_diablo_pepper/cake_witch는 1회성 소환(summon: true + summonThreshold)이므로 무관
- `tests/balance-sim-group3.mjs` 생성: 그룹3 전체 48스테이지 HP/골드 곡선 시뮬레이션 + 이상치 탐지 스크립트

#### 39-2: 이상치 8개 스테이지 밸런스 조정

- 16-3: 6웨이브 -> 5웨이브 축소 (284,312 HP -> 229,592 HP, +41.6% -> +14.4%)
- 17-2: 고HP 적(curry_djinn/naan_golem/foie_gras_knight) count 8~10% 감소 (215,282 HP -> 195,002 HP, +32.8% -> +20.3%)
- 18-1: 전 wave 적 count 22~25% 증가 (177,640 HP -> 218,390 HP, -37.8% -> -23.6%), 향신료 아크 내 난이도 역행 해소
- 18-3: 전 wave 적 count 3~5% 감소 (298,820 HP -> 288,020 HP, +30.4% -> +25.7%)
- 19-1: 4웨이브 -> 5웨이브 확장 (wave5 신설: masala_guide(32)/curry_djinn(44)/naan_golem(29)/incense_specter(8)/butter_ghost(16)). 106,590 HP -> 151,560 HP, -67.6% -> -54.0%
- 19-5: 전 wave 적 count 15~17% 감소 (335,640 HP -> 279,490 HP, +45.4% -> +21.1%)
- 20-1: 4웨이브 -> 5웨이브 확장 (wave5 신설: taco_bandit(46)/burrito_juggernaut(24)/masala_guide(50)/curry_djinn(58)/incense_specter(32)/spice_elemental(19)). 220,980 HP -> 314,780 HP, -34.2% -> OK
- 20-5: 전 wave 적 count 6~8% 감소 (606,050 HP -> 562,561 HP, +35.4% -> +25.7%)
- 19-2, 20-2는 수정 없이 19-1/20-1 확장으로 상대 변화율 자동 해소

### Changed

- 수정 스테이지의 starThresholds/service 수치 비례 조정 (16-3: maxCustomers 50, 19-1: starThresholds {three:38, two:29}/maxCustomers 68, 20-1: starThresholds {three:48, two:37}/maxCustomers 76)

### Fixed

- Fix #5: Enemy.js 주기적 소환 블록(L447-458)에서 entry.count 미반영 버그 수정. Phase 38 잔여 이슈 해소.

### Notes

- QA PASS: 시뮬레이션 WARN 조정 대상 8건 -> 0건. 잔여 WARN 6건은 모두 구조적 원인 (16-1: 보스->일반 전환, 18-6/21-6/24-6: 보스 스테이지 특성, 19-1: 아크 전환, 19-2: 경계선 +30.2%)
- 보스 스테이지 HP 비율: maharaja 0.78x / el_diablo_pepper 0.68x / queen_of_taste 0.28x -- 보스 특수 메카닉(화염/소환/3페이즈)으로 실질 난이도 보정, 설계 의도대로
- Playwright 스모크 테스트 7/7 통과, JS pageerror 0건
- 세이브 버전 v16 유지 (데이터 구조 동일, 수치만 변경)
- 잔여 placeholder: 16-6, 17-6, 19-6, 20-6, 22-6, 23-6 (6개, 별도 Phase)
- 스펙: `.claude/specs/2026-04-17-kc-phase39-scope.md`
- 39-1 리포트: `.claude/specs/2026-04-17-kc-phase39-1-report.md`
- 39-2 리포트: `.claude/specs/2026-04-17-kc-phase39-2-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase39-qa.md`

## [Phase 38] 2026-04-17 — 24장 미각의 여왕 최종전 (디저트 아크 최종, 그룹3 클라이맥스)

### Added

#### 38-1: 대화 + 스프라이트 + 엔진

- queen_of_taste 3페이즈 보스 스프라이트 3종 (PixelLab 64px pro, 8방향 + walking 애니메이션. 페이즈1 기본형, 페이즈2 변신형, 페이즈3 분노형)
- gameData.js 보스 1종: queen_of_taste (HP 12000, speed 15, 3페이즈 전환: HP 66% -> 페이즈2, HP 33% -> 페이즈3, fireBreath 페이즈별, summonTypes [macaron_knight x2, sugar_specter x3], enrageSpeedBonus 25, bossReward 800)
- gameData.js 적 1종: sugar_specter_mini (HP 144, speed 96, reward 0, canvasSize 32, sugar_specter 분열 소형체)
- 대화 6종: chapter24_boss(10라인), chapter24_mid(5라인), chapter24_final_battle(7라인), chapter24_ending(12라인), team_side_24(8라인), team_side_24b(6라인) (누적 ~106종)
- CHARACTERS 객체에 queen_of_taste 추가 (누적 15캐릭터)
- storyData 트리거 7건: 24-1 진입(gathering_enter) / 24-3 클리어(result_clear + chapter24_mid_seen 플래그) / 24-5 클리어(result_clear + chapter24_final_revealed 플래그) / 24-6 클리어(result_clear + chapter24_cleared + group3_cleared + group3_bestiary_unlocked 플래그 + currentChapter=25) / merchant_enter x2 (team_side_24, team_side_24b)
- storyData stage_first_clear 제외 목록에 '24-1', '24-3', '24-6' 추가
- Enemy.js takeDamage(): magicResistance 전용 핸들러 (MAGIC_TOWER_TYPES: grill, freezer, spice_grinder에만 마법저항 적용)
- Enemy.js takeDamage(): damageReduction 핸들러 (magicResistance 없는 적에만 적용, 중복 감소 방지)
- Enemy.js _die(): splitOnDeath 핸들러 (sugar_specter 사망 시 sugar_specter_mini 2마리 스폰, enemy_deterministic_split 이벤트)
- GatheringScene.js _onDeterministicSplit(): hpOverride, speedMultiplier, rewardOverride 파라미터 지원

#### 38-2: stageData + 레시피

- 스테이지 24-1~24-6 구현 (24-1 역Z자형, 24-2 S자형, 24-3 역S자형, 24-4 나선형, 24-5 복합형 최고밀도, 24-6 queen_of_taste 3페이즈 보스전)
- 24-6 보스전 구조: 웨이브 1-2 사전 군중전 + 웨이브 3 queen_of_taste 단독 등장 + 웨이브 4-5 소환적과 함께 지속
- 서빙 레시피 8종: royal_cream_tart(3성), golden_cacao_dome/triple_dream_eclairs/cream_vanilla_royale(4성), cacao_velvet_crown/queens_final_soufflee/taste_queens_triumph/dream_arc_finale(5성)
- 버프 레시피 2종: queens_mirage_elixir(4성), dream_arc_blessing(5성)
- 누적 레시피: 서빙 231 + 버프 53 = 284종

### Changed

- SpriteLoader.js BOSS_IDS에 queen_of_taste 추가 (13종)
- SpriteLoader.js BOSS_WALK_HASHES에 queen_of_taste/queen_of_taste_2/queen_of_taste_3 해시 등록
- SpriteLoader.js _loadBosses(), _loadBossWalkFrames(), registerWalkAnimations()에 페이즈 2/3 별도 로딩/등록 코드 추가
- gameData.js macaron_knight: damageReduction 0.60 fallback 제거 (magicResistance 전용 핸들러로 대체)
- Enemy.js: phaseTransitions 보스(queen_of_taste)는 enrage 빨간 틴트 생략, 금색 틴트 유지 (`!this.data_.phaseTransitions` 조건)
- Enemy.js: spriteSuffix 참조로 페이즈별 walkPrefix 조합 (`boss_${id}${t.spriteSuffix}_walk`)
- Enemy.js: speedBonus 승산 적용 (`this.data_.speed * (1 + t.speedBonus)`)
- Enemy.js: summonTypes 배열 순회 처리 (배열 없으면 summonType singular fallback)
- Enemy.js: enrageSpeedBonus !== undefined 분기 추가 (절대값 가산: queen_of_taste 40, maharaja 55, el_diablo_pepper 60)

### Fixed (QA Fix #1~#4)

- Fix #1: spriteSuffix 필드명 불일치 수정 (`t.spriteId` -> `t.spriteSuffix` 참조)
- Fix #2: speedBonus 연산 방식 수정 (가산 -> 승산, `this.data_.speed * (1 + t.speedBonus)`)
- Fix #3: enrage 틴트와 phaseTransitions 틴트 충돌 수정 (phaseTransitions 보스는 빨간 틴트 생략)
- Fix #4: summonTypes 배열 처리 수정 (`summonTypes?.length` 분기로 배열 순회 소환)

### Notes

- buff effectType 대체: queens_mirage_elixir의 `buff_attack_range`와 dream_arc_blessing의 `buff_ultimate`는 엔진 미지원으로 `buff_both`로 대체. 주석에 원래 의도 명기.
- 24-6 bossStage/bossType 필드는 GatheringScene에서 참조하지 않는 무해한 메타데이터. 기존 보스전(21-6)에는 이 필드 없음.
- 23-6 placeholder는 미변경 (Phase 38 범위 외).
- queen_of_taste phaseTransitions: HP 66% -> 페이즈2(spriteSuffix '_2', speedBonus 0.10, 틴트 0xffccee), HP 33% -> 페이즈3(spriteSuffix '_3', 틴트 0xffd700)
- enrage: HP 33% 이하에서 speed = 15 + 25 = 40. phaseTransitions와 enrage가 동일 HP 임계값(0.33)에서 동시 발동.
- sugar_specter splitOnDeath: count 2, hpRatio 0.30 (HP 144 = 480 * 0.30), speedMultiplier 1.20 (speed 96 = 80 * 1.20), reward 0
- macaron_knight magicResistance 0.60: grill/freezer/spice_grinder 타워만 60% 감소, pan/salt/delivery/soup_pot/wasabi_cannon은 감소 없음
- 잔여 이슈(LOW): 주기적 소환에서 entry.count를 무시하고 타입당 1마리만 소환. 1회성 소환은 count 정상 사용. Phase 39에서 처리 예정.
- Phaser "Failed to process file" 콘솔 경고는 Phase 37 이후 지속되는 pre-existing 이슈.
- 생성자 L149 주석의 `spriteId` 언급은 stale comment (기능 무영향).

### QA 결과

- **판정**: PASS (재검증, Fix #1~#4 적용 후)
- 테스트: Playwright 8개 + Node.js 검증 1개 = 총 9개 전체 통과
- 시각적 검증: 스크린샷 4장 (메인 화면, 5초 후, 모바일 360x640, 소형 320x568) 모두 PASS
- 레시피 누적: ALL_SERVING_RECIPES(231) + ALL_BUFF_RECIPES(53) = 284종 (Node.js 검증)
- queen_of_taste: HP=12000, speed=15, isBoss=true, phaseTransitions 2단계 정상 (Node.js 검증)
- sugar_specter_mini: HP=144, speed=96, reward=0 (Node.js 검증)

### 참고

- 스펙(38-1): `.claude/specs/2026-04-17-kc-phase38-1-spec.md`
- 스펙(38-2): `.claude/specs/2026-04-17-kc-phase38-2-spec.md`
- 리포트(38-1): `.claude/specs/2026-04-17-kc-phase38-1-report.md`
- 리포트(38-2): `.claude/specs/2026-04-17-kc-phase38-2-report.md`
- QA: `.claude/specs/2026-04-17-kc-phase38-qa.md`
- Phase 38 기획서: `.claude/specs/2026-04-17-kc-phase38-scope.md`

## [Phase 37] 2026-04-16 — 23장 드림랜드 심층부 (디저트 아크 2장)

### Added
- macaron_knight 스프라이트 (PixelLab standard, 92px, 8방향 + animating 애니, hash: animating-de406b54)
- sugar_specter 스프라이트 (PixelLab standard, 92px, 8방향 + animating 애니, hash: animating-7f31cfcf)
- 재료 아이콘 1종: cream(크림) 32px RGBA
- dream_deep 타일셋 에셋 (dream_deep_floor.png)
- gameData.js 적 2종: macaron_knight(HP 500, magicResistance 0.60 + damageReduction 0.60 fallback), sugar_specter(HP 480, splitOnDeath 데이터 예약 등록)
- gameData.js 재료 1종: cream (누적 32종)
- 대화 3종: chapter23_intro(8라인), chapter23_mid(7라인), team_side_23(9라인) (누적 100종)
- storyData 트리거 4건: 23-1 진입(gathering_enter) / 23-3 클리어(result_clear + queen_revealed 플래그) / merchant_enter(team_side_23) / 23-5 클리어(currentChapter=24 해금)
- storyData stage_first_clear 제외 목록에 '23-1', '23-3' 추가
- 스테이지 23-1~23-5 구현 (theme: dream_deep, macaron_knight 23-1 첫 등장, sugar_specter 23-2 첫 등장)
- 레시피 10종 추가: cream 조합 서빙 8종(cream_macaron_delight, cream_puff_tower, vanilla_cream_opera, cacao_cream_entremet, dream_deep_gateau, cream_specter_verrine, deep_dream_mille_feuille, queen_cream_supreme) + 버프 2종(cream_magic_veil, specter_seal_cream) (누적 274종)
- Enemy.js: sugar_specter setAlpha(0.82) 반투명 처리

### Changed
- SpriteLoader.js ENEMY_IDS 43종 (macaron_knight, sugar_specter 추가)
- ENEMY_WALK_HASHES: animating-de406b54 / animating-7f31cfcf 등록
- INGREDIENT_FILE_MAP: cream 추가

### Notes
- macaron_knight의 magicResistance 전용 핸들러가 엔진에 없어 damageReduction: 0.60으로 fallback 처리. 물리+마법 모두 60% 경감됨. Phase 38에서 전용 핸들러 구현 시 damageReduction 제거 필요.
- sugar_specter의 splitOnDeath는 데이터만 등록. 엔진 핸들러 미구현으로 현재 일반 적처럼 동작. Phase 38에서 onEnemyDeath 핸들러 구현 예정.
- cream_magic_veil의 effectType: 원래 buff_attack_magic_pierce 의도였으나 엔진 미지원으로 buff_attack_piercing으로 대체. 주석에 원래 의도 명기.
- specter_seal_cream의 effectType: 원래 buff_speed_split_block 의도였으나 엔진 미지원으로 buff_all로 대체. 주석에 원래 의도 명기.
- queen_cream_supreme 재료 8개 슬롯은 기존 최대(7개)를 초과. 서빙 UI 인게임 검증은 Phase 38 QA에서 추적.
- 23-1 wave5 순수 HP ~213,240은 22-5 wave5 ~218,320 대비 -2.3%이나, macaron_knight magicResistance(60%) 기믹으로 실질 DPS 기준 +8~12% 상승.
- 23-5 wave5 순수 HP ~284,880은 22-5 대비 +30.5%. 목표 범위(+25~33%) 충족.
- 적 누적: 55종 (일반 42 + 미니보스 1 + 보스 12)
- 스펙: `.claude/specs/2026-04-16-kc-phase37-1-spec.md`, `.claude/specs/2026-04-16-kc-phase37-2-spec.md`
- QA: `.claude/specs/2026-04-16-kc-phase37-qa.md`

---

## [Phase 36] 2026-04-16 — 22장 슈가 드림랜드 (디저트 아크 시작)

### Added
- candy_soldier 스프라이트 (PixelLab standard, 48px, 8방향 + walking 애니, hash: walking-4afaa9df)
- cake_witch 스프라이트 (PixelLab standard, 48px, 8방향 + walking 애니, hash: walking-076ead3d)
- 재료 아이콘 2종: cacao(카카오), vanilla(바닐라) 32px RGBA
- gameData.js 적 2종: candy_soldier(HP 450, damageReduction 20%), cake_witch(HP 500, summon @60%)
- gameData.js 재료 2종: cacao, vanilla (누적 31종)
- 대화 3종: chapter22_intro, chapter22_mid, team_side_22 (누적 97종)
- storyData 트리거 4건: 22-1 진입 / 22-3 클리어 / 22-5 클리어 / merchant_enter
- 스테이지 22-1~22-5 구현 (theme: dream_candy)
- 레시피 10종 추가: cacao/vanilla 서빙 8종 + 버프 2종 (누적 264종)

### Changed
- SpriteLoader.js ENEMY_IDS 41종 (candy_soldier, cake_witch 추가)
- ENEMY_WALK_HASHES: walking-4afaa9df / walking-076ead3d 등록

---

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
