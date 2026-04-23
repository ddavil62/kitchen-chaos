# Kitchen Chaos -- 영업씬 태번 스타일 재설계 페이즈 마스터 플랜

> 최종 업데이트: 2026-04-24 (Phase A + A-bis + B-1 + B-2 완료, Phase B-3 준비)
> 관련 문서:
> - [SERVICE_SCENE_TAVERN_DIRECTION.md](SERVICE_SCENE_TAVERN_DIRECTION.md) -- 방향성/핵심 원칙 (V12 기준)
> - `.claude/specs/2026-04-23-kc-phase-b-asset-spec.md` -- Phase B 에셋 발주 규격서 (V12 규격 갱신 완료)

---

## 페이즈 총괄

기존 ServiceScene.js(아이소메트릭 격자 + 3레이어 분리 렌더링)를 Travellers Rest 스타일(탑다운 가구 + 사이드뷰 풀바디 캐릭터)로 전면 재설계한다. 기존 씬을 수정하지 않고 TavernServiceScene을 병렬 구현한 뒤, 최종적으로 교체한다.

| 페이즈 | 이름 | 핵심 범위 | 상태 |
|--------|------|-----------|------|
| **A** | 기반 시스템 골격 | 레이아웃 상수(V10), 슬롯 데이터 모델, 상태머신 키, 깊이정렬, PIL 더미 | **완료** |
| **A-bis** | V12 레이아웃 마이그레이션 | V10 가로 3세트 -> V12 4분면 세로, V12 placeholder 5종, 테스트 84/84 | **완료** |
| **B-1** | 실 에셋 1세트 발주 | 손님 seated 2종 + 셰프 미미 idle + 가구 5종 PixelLab 발주, ASSET_MODE 토글 통합 | **완료** |
| **B-2** | WARN 해소 + 스프라이트 전환 | 에셋 4종 재발주/신규(seated_left/bench L,R/chef_rin), 셰프+손님 Image 렌더링, vite 빌드 위생 | **완료** |
| **B-3+** | 에셋 확장 발주 | 손님 9종 추가 seated + 셰프 5명 idle + walk 시트 + 업그레이드 가구 | 준비 |
| **C** | 테마 변주 + UI | 챕터별 바닥/벽/소품 8세트, 인내심 게이지, 말풍선, 골드 플로팅 HUD/VFX | 미착수 |
| **D** | 게임 로직 연동 | 조리 슬롯, 레시피 선택, 골드 획득, 셰프 스킬, 손님 AI, 인내심 감소 | 미착수 |
| **E** | 마이그레이션 | 기존 ServiceScene -> TavernServiceScene 교체, 레거시 자산 정리 | 미착수 |

---

## Phase A -- 기반 시스템 골격 (완료)

### 범위

- A1: 360x640 캔버스 레이아웃 영역 상수 정의 + PIL 더미 합성
- A2: 긴 벤치 좌석 슬롯 데이터 모델 (lv0 4인, lv3 5인, lv4 6인) -- V10 가로 구조
- A3: 셰프/손님 상태머신 키 정의 (ChefState 7, CustomerState 7)
- A4: Y축 단순 깊이정렬 + 3레이어 분리 렌더링 폐기

### 산출물

| 파일 | 역할 |
|------|------|
| `js/scenes/TavernServiceScene.js` | 메인 씬 (A1~A4 통합, 디버그 전용) |
| `js/data/tavernLayoutData.js` | 레이아웃 상수, BENCH_SLOTS, occupy/vacate/findFreeSlot/getSlotWorldPos |
| `js/data/tavernStateData.js` | ChefState/CustomerState 열거형, 전환 맵, 더미 색상 |
| `assets/tavern_dummy/` (13개 PNG) | PIL 더미 에셋 |
| `tests/phase-a-tavern-qa.spec.js` | Playwright 14개 테스트 |

### 게이트 충족 상태

- [x] 영역 구획 상수 확정 (HUD 32px / WALL 24px / KITCHEN_W 120px / DINING_W 224px / CTRL 80px)
- [x] 테이블 세트 y좌표 확정 (V10: 232, 352, 472 / 간격 120px 균등) -- Phase A-bis에서 V12로 교체됨
- [x] 슬롯 데이터 모델 확정 (24석 lv0, occupySlot/vacateSlot API)
- [x] 상태머신 키 확정 (셰프 7 + 손님 7, scaleY 완전 배제)
- [x] 깊이정렬 공식 확정 (depth = y 단일 공식)
- [x] ServiceScene.js 미수정 확인
- [x] Phase B 진입 게이트 에셋 발주 규격서 작성

### QA 결과

PASS (40/40). AD 모드3 REVISE 1건(bench-top 4px 겹침) 반영 완료.

### 스펙/리포트

- 스펙: `.claude/specs/2026-04-23-kc-phase-a-tavern-spec.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase-a-tavern-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-23-kc-phase-a-tavern-ad3.md`
- QA: `.claude/specs/2026-04-23-kc-phase-a-tavern-qa.md`

---

## Phase A-bis -- V12 레이아웃 마이그레이션 (완료)

### 범위

Phase A(V10 가로 긴 테이블 3세트x8석=24석)를 V12(세로 짧은 테이블 4분면x6석=24석)로 전환. 코드 구조/상태머신/함수 인터페이스 유지, 좌표/에셋 크기 상수와 렌더링 배치만 V12 수치로 치환.

- TABLE_SET_ANCHORS: 3엔트리(x,y) -> 4엔트리(quadLeft,quadTop,key: tl/tr/bl/br)
- BENCH_SLOTS: top/bot(dx) -> left/right(dy)
- 카운터: 24x120 가로 -> 40x100 세로
- 셰프 2명 배치 (y=100, y=148)
- 입구: 우측 상단 -> 좌하단(entrance_v12, left=44, top=480)
- V12 PIL placeholder 5종 추가

### 산출물

| 파일 | 역할 |
|------|------|
| `assets/tavern_dummy/counter_v12.png` (40x100) | V12 카운터 placeholder |
| `assets/tavern_dummy/table_vertical_v12.png` (44x72) | V12 세로 테이블 placeholder |
| `assets/tavern_dummy/bench_vertical_l_v12.png` (14x76) | V12 좌측 벤치 placeholder |
| `assets/tavern_dummy/bench_vertical_r_v12.png` (14x76) | V12 우측 벤치 placeholder |
| `assets/tavern_dummy/entrance_v12.png` (32x40) | V12 입구 placeholder |
| `tests/phase-a-bis-v12-qa.spec.js` (27개) | QA 신규 테스트 |

### 게이트 충족 상태

- [x] TABLE_SET_ANCHORS 4엔트리 (tl/tr/bl/br quad 좌표)
- [x] 24석 총원 유지 (4quad x left3 + right3)
- [x] 세로 통로 20px, 가로 통로 40px
- [x] V12 placeholder 5종 존재 + preload 로드
- [x] ServiceScene.js 무손상 (git diff 0줄)
- [x] scaleY/flipY 코드 부재
- [x] Playwright 84/84 PASS, vite build PASS

### QA 결과

PASS (84/84 테스트, 게이트 12/12). AD 모드3 REVISE (WARN 4건, 모두 Phase B 이후 해소 예정).

### 스펙/리포트

- 스펙: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-spec.md`
- 목적: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-scope.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-coder-report.md`
- AD 모드3: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-ad3.md`
- QA: `.claude/specs/2026-04-23-kc-phase-a-bis-v12-migration-qa.md`

---

## Phase B-1 -- 실 에셋 1세트 발주 (완료)

### 범위

PixelLab으로 최소 1세트(normal 손님 seated 2장 + 미미 셰프 idle_side 1장 + V12 가구 5종)를 발주하여, Phase B 파이프라인(발주 -> 후처리 -> 통합 -> 검증)이 정상 동작함을 확인. 동시에 규격서 V10 잔재 7개소를 V12로 갱신.

### 산출물

| 파일 | 역할 |
|------|------|
| `assets/tavern/customer_normal_seated_right.png` (16x22) | 일반 손님 우향 앉기 |
| `assets/tavern/customer_normal_seated_left.png` (16x22) | 일반 손님 좌향 앉기 |
| `assets/tavern/chef_mimi_idle_side.png` (16x24) | 셰프 미미 idle |
| `assets/tavern/counter_v12.png` (40x100) | 실 에셋 카운터 |
| `assets/tavern/table_vertical_v12.png` (44x72) | 실 에셋 세로 테이블 |
| `assets/tavern/bench_vertical_l_v12.png` (14x76) | 실 에셋 좌측 벤치 |
| `assets/tavern/bench_vertical_r_v12.png` (14x76) | 실 에셋 우측 벤치 |
| `assets/tavern/entrance_v12.png` (32x40) | 실 에셋 입구 |
| `tests/phase-b1-asset-load.spec.js` (19개) | Playwright 테스트 |

### 게이트 충족 상태

- [x] 에셋 8종 native 크기 정확 일치 (0px 오차)
- [x] ASSET_MODE='real' 토글로 실 에셋/PIL placeholder 전환
- [x] 가구 5종 실 에셋 렌더링 확인
- [x] 캐릭터 3종 텍스처 로드 확인 (스프라이트 전환은 B-2)
- [x] tavern_dummy/ 보존, 두 세트 공존
- [x] ServiceScene.js 무손상 (git diff 0줄)
- [x] Playwright 46/46 PASS

### QA 결과

PASS (46/46 테스트, SC-1~SC-5 전항목 충족).

### Phase B-2에서 해소된 사항

- ~~손님 seated_left 셔츠 색상 불일치 (AD2 WARN-1)~~ -- 부분 개선 (0% -> 19.2% teal), WARN-1 잔여 -> B-3에서 완전 해소
- ~~벤치 14px crop 음영 약화 (AD2 WARN-2/3)~~ -- NEAREST 가로 스케일 다운 방식으로 **해소** (W-2 33.6%, W-3 67.4% 어둡)
- ~~chef-1 placeholder 잔존 (AD3 WARN-1)~~ -- chef_rin_idle_side.png 발주로 **해소**
- ~~캐릭터 스프라이트 전환~~ -- `_buildChef()`/`_buildCustomers()` -> `_placeImageOrRect()` 경로 전환 **완료**
- ~~`_postprocess.py`/`_raw/` 프로덕션 빌드 제외 필터~~ -- vite.config.js COPY_DIR_EXCLUDE/COPY_FILE_EXCLUDE **완료**

### Phase B-3 이후 해소 예정 사항

- seated_left 셔츠 청록 완전 일치 (WARN-1 잔여, size=44 큰 캔버스 또는 PIL 마스킹)
- 술통(barrel) 실 에셋 발주
- write_ad2_report.py untracked 파일 정리

### 스펙/리포트

- 목적: `.claude/specs/2026-04-23-kc-phase-b1-asset-scope.md`
- 스펙: `.claude/specs/2026-04-23-kc-phase-b1-asset-spec.md`
- AD 모드1: `.claude/specs/2026-04-23-kc-phase-b1-ad1.md`
- Coder 리포트: `.claude/specs/2026-04-23-kc-phase-b1-coder-report.md`
- AD 모드2: `.claude/specs/2026-04-23-kc-phase-b1-ad2.md`
- AD 모드3: `.claude/specs/2026-04-23-kc-phase-b1-ad3.md`
- QA: `.claude/specs/2026-04-23-kc-phase-b1-qa.md`

---

## Phase B-2 -- B-1 WARN 해소 + 스프라이트 전환 (완료)

### 범위

B-1 조건부 승인 WARN 4건(seated_left 셔츠 색상, 벤치 음영 x2, 셰프 placeholder)을 에셋 4종 재발주/신규 발주로 해소. `_buildChef()`/`_buildCustomers()`를 `_placeImageOrRect()` 경로로 전환하여 셰프+손님이 실 Image 오브젝트로 렌더링. vite 빌드에서 `_raw/` + `.py` 제외.

### 산출물

| 파일 | 역할 |
|------|------|
| `assets/tavern/chef_rin_idle_side.png` (16x24) | 두 번째 셰프 린 idle (W-4 해소) |
| `assets/tavern/customer_normal_seated_left.png` (16x22) | 재발주 (W-1 부분 개선) |
| `assets/tavern/bench_vertical_l_v12.png` (14x76) | 재발주 NEAREST 스케일 다운 (W-2 해소) |
| `assets/tavern/bench_vertical_r_v12.png` (14x76) | 재발주 NEAREST 스케일 다운 (W-3 해소) |
| `assets/tavern/_postprocess_b2.py` | B-2 후처리 스크립트 |
| `tests/phase-b2-sprite-transition.spec.js` (15개) | 스프라이트 전환 Playwright 테스트 |

### 게이트 충족 상태

- [x] 에셋 4종 native 크기 정확 일치 (0px 오차)
- [x] REAL_KEY_MAP 9개 매핑 (chef2 추가)
- [x] `_buildChef()` / `_buildCustomers()` 내 `add.rectangle` 직접 호출 0건
- [x] 셰프 2명(린 idx=0, 미미 idx=1) Image 타입 렌더링
- [x] 손님 Image 타입 렌더링 + SIT 텍스처 교체
- [x] vite build 산출물에 `_raw/` + `.py` 미포함
- [x] ServiceScene.js diff 0줄, scaleX/flipX 0건, tavern_dummy/ 변경 0건
- [x] Playwright 114/118 PASS (실패 4건 cold-start 인프라)

### QA 결과

PASS (114/118 테스트, SC-1 PARTIAL + SC-2~SC-7 PASS). B-2 회귀 0건.

### 스펙/리포트

- 목적: `.claude/specs/2026-04-24-kc-phase-b2-scope.md`
- 스펙: `.claude/specs/2026-04-24-kc-phase-b2-spec.md`
- AD 모드1: `.claude/specs/2026-04-24-kc-phase-b2-ad1.md`
- Coder 리포트: `.claude/specs/2026-04-24-kc-phase-b2-coder-report.md`
- AD 모드2: `.claude/specs/2026-04-24-kc-phase-b2-ad2.md`
- QA: `.claude/specs/2026-04-24-kc-phase-b2-qa.md`

---

## Phase B-3+ -- 에셋 확장 발주 (준비)

### 진입 조건

- [x] Phase B-1 완료 (발주 파이프라인 검증)
- [x] Phase B-2 완료 (스프라이트 전환 검증, WARN 해소)
- [ ] 사용자 최종 승인

### 범위

- seated_left 셔츠 청록 완전 일치 (WARN-1 해소: size=44 큰 캔버스 또는 PIL 마스킹)
- 손님 9종 추가 seated_right/seated_left 발주 (vip~business, 18장)
- 셰프 5명 추가 idle 발주 (메이지~아르준, 5장)
- 손님 10종 walk_l/walk_r 애니메이션 시트 발주 (20장)
- lv3/lv4 업그레이드 등급 가구 에셋
- 술통/바닥/벽 에셋

### 게이트 조건 (Phase C 진입)

- [x] 최소 normal 손님 1종 + 미미 셰프 1명 + lv0 V12 가구 1세트가 TavernServiceScene에서 실 스프라이트로 렌더링 확인 *(Phase B-2에서 충족)*
- [x] seated_left / seated_right가 scaleY/flipY 없이 별도 스프라이트로 자연스러운 정합 확인 *(Phase B-2에서 충족)*
- [ ] 사용자 최종 승인

---

## Phase C -- 테마 변주 + UI (미착수)

### 진입 조건

- [ ] Phase B 완료
- [ ] 사용자 최종 에셋 승인

### 범위

- C1: 챕터별 바닥/벽/소품 테마 에셋 8세트 발주 (g1/g2-jp/g2-cn/g2-fr/g3-in/g3-mx/g3-de/endless)
- C2: 인내심 게이지, 말풍선, 골드 플로팅 텍스트 등 HUD/VFX UI 구현
- C3: 벽 장식(액자/창문) 배치 시스템
- C4: 챕터별 테마 스위칭 시스템

### 게이트 조건 (Phase D 진입)

- [ ] 최소 2개 테마(g1 + g2-jp)가 전환 동작 확인
- [ ] HUD/VFX 기본 동작 확인

---

## Phase D -- 게임 로직 연동 (미착수)

### 진입 조건

- [ ] Phase C 완료

### 범위

- D1: 조리 슬롯 시스템 연동 (기존 ServiceScene 로직 포팅)
- D2: 레시피 선택/서빙/골드 획득 연동
- D3: 셰프 스킬 시스템 연동 (7셰프 패시브/액티브)
- D4: 손님 AI 정교화 (인내심 감소, 이탈 판정, 평론가/단골 특수 로직)
- D5: 셰프 운반 동선 Tween (카운터 -> 테이블 -> 복귀)
- D6: 유랑 미력사 패시브 적용

### 게이트 조건 (Phase E 진입)

- [ ] TavernServiceScene에서 1챕터 풀 영업 사이클(입장->주문->조리->서빙->결산) 완주
- [ ] 기존 ServiceScene과 동일 게임플레이 결과(골드, 별점 등)

---

## Phase E -- 마이그레이션 (미착수)

### 진입 조건

- [ ] Phase D 완료
- [ ] 사용자 최종 전환 승인

### 범위

- E1: main.js에서 ServiceScene -> TavernServiceScene 교체
- E2: EndlessScene 연동 (엔드리스 ServiceScene 호출 교체)
- E3: 레거시 자산 정리 (Phase 50~52 _back/_front 에셋, Phase 76 92x92 풀바디 에셋)
- E4: DevHelper ?scene=tavern 파라미터 제거 (기본 진입점으로 전환)
- E5: 회귀 테스트 전수 실행

### 게이트 조건 (완료)

- [ ] 전체 24챕터 영업 회귀 테스트 통과
- [ ] 엔드리스 모드 영업 삽입 정상 동작
- [ ] 레거시 코드/자산 제거 확인

---

## 변경 이력

| 일자 | 변경 |
|------|------|
| 2026-04-24 | Phase B-2 완료 반영. B-2 절 추가, B-2+ -> B-3+로 갱신, B-1 해소 예정 사항에 B-2 해소 결과 반영, 페이즈 총괄 테이블 B-2 행 추가, Phase C 게이트 2항목 B-2에서 충족으로 갱신. |
| 2026-04-23 | Phase B-1 완료 반영. Phase B를 B-1(완료)/B-2+(준비)로 분할, B-1 산출물/게이트/QA/해소 예정 사항 추가. |
| 2026-04-23 | Phase A-bis V12 마이그레이션 완료 반영. Phase A-bis 절 추가, Phase B를 V12 규격으로 갱신, 페이즈 총괄 테이블에 A-bis 추가. |
| 2026-04-23 | 신규 작성. Phase A 완료 반영. |
