# Kitchen Chaos -- 영업씬 태번 스타일 재설계 페이즈 마스터 플랜

> 최종 업데이트: 2026-04-23 (Phase A 완료)
> 관련 문서:
> - [SERVICE_SCENE_TAVERN_DIRECTION.md](SERVICE_SCENE_TAVERN_DIRECTION.md) -- 방향성/핵심 원칙
> - `.claude/specs/2026-04-23-kc-phase-b-asset-spec.md` -- Phase B 진입 게이트 에셋 발주 규격서

---

## 페이즈 총괄

기존 ServiceScene.js(아이소메트릭 격자 + 3레이어 분리 렌더링)를 Travellers Rest 스타일(탑다운 가구 + 사이드뷰 풀바디 캐릭터)로 전면 재설계한다. 기존 씬을 수정하지 않고 TavernServiceScene을 병렬 구현한 뒤, 최종적으로 교체한다.

| 페이즈 | 이름 | 핵심 범위 | 상태 |
|--------|------|-----------|------|
| **A** | 기반 시스템 골격 | 레이아웃 상수, 슬롯 데이터 모델, 상태머신 키, 깊이정렬, PIL 더미 | **완료** |
| **B** | 에셋 발주 | 손님 10종 + 셰프 7명 + 가구 스프라이트 PixelLab/SD 발주 및 교체 | 대기 |
| **C** | 테마 변주 + UI | 챕터별 바닥/벽/소품 8세트, 인내심 게이지, 말풍선, 골드 플로팅 HUD/VFX | 미착수 |
| **D** | 게임 로직 연동 | 조리 슬롯, 레시피 선택, 골드 획득, 셰프 스킬, 손님 AI, 인내심 감소 | 미착수 |
| **E** | 마이그레이션 | 기존 ServiceScene -> TavernServiceScene 교체, 레거시 자산 정리 | 미착수 |

---

## Phase A -- 기반 시스템 골격 (완료)

### 범위

- A1: 360x640 캔버스 레이아웃 영역 상수 정의 + PIL 더미 합성
- A2: 긴 벤치 좌석 슬롯 데이터 모델 (lv0 4인, lv3 5인, lv4 6인)
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
- [x] 테이블 세트 y좌표 확정 (232, 352, 472 / 간격 120px 균등)
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

## Phase B -- 에셋 발주 (대기)

### 진입 조건

- [x] Phase A 완료
- [x] Phase B 진입 게이트 에셋 발주 규격서 존재 (`.claude/specs/2026-04-23-kc-phase-b-asset-spec.md`)

### 범위

- B1: 손님 10종 사이드뷰 스프라이트 발주 (걷기 4방향 + seated_up/down = 40장)
- B2: 셰프 7명 사이드뷰 스프라이트 발주 (idle/walk/carry/cook/serve = 49장)
- B3: 가구(벤치 lv0/lv3/lv4 + 테이블 lv0/lv3/lv4 + 카운터 + 술통 + 입구) 탑다운 발주
- B4: PIL 더미를 실제 에셋으로 교체, TavernServiceScene에서 렌더링 검증

### 발주 도구 (방향성 문서 SS5-4 기준)

| 종류 | 우선 도구 |
|------|----------|
| 손님 걷기 시트 | PixelLab character (mode: standard, n_directions: 4) |
| 손님 앉기 | PixelLab character (custom action) |
| 셰프 포즈 | PixelLab character + animate_character |
| 가구 | PixelLab tiles_pro (square_topdown) |
| 소품 | PixelLab map_object |

### 게이트 조건 (Phase C 진입)

- [ ] 최소 normal 손님 1종 + 미미 셰프 1명 + lv0 가구 1세트가 TavernServiceScene에서 렌더링 확인
- [ ] seated_up / seated_down이 scaleY 없이 별도 스프라이트로 자연스러운 정합 확인
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
| 2026-04-23 | 신규 작성. Phase A 완료 반영. |
