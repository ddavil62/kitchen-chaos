# Kitchen Chaos — 영업씬(ServiceScene) 비주얼 재구성 기획서

> 작성일: 2026-04-18 (Phase 50 산출물)
> 상태: 1단계 완료 (Phase 51-4, 2026-04-18), 2~3단계 미착수

---

## 1. 현황 분석

### 1-1. 화면 레이아웃 구조 (360×640 기준)

| 구역 | Y 범위 | 내용 |
|------|--------|------|
| HUD | 0~40 | 골드, 영업시간, 만족도, 콤보, 이벤트 아이콘 |
| 홀(Hall) | 40~280 | 아이소메트릭 다이아몬드 격자 + 테이블 + 손님 |
| 조리 슬롯 | 280~340 | 2슬롯 진행 바 + 버리기 버튼 |
| 재고 패널 | 340~440 | 재료 아이콘×수량 텍스트 5열 |
| 레시피 퀵슬롯 | 440~570 | 3열 버튼 그리드 |
| 하단 바 | 570~640 | 셰프 스킬 버튼 + 직원 아이콘 + 일시정지 |

### 1-2. 현재 사용 중인 에셋 목록

#### 홀 영역 (`assets/service/`)

| 파일 | 해상도 | 파일 크기 | 용도 |
|------|--------|----------|------|
| `floor_hall.png` | 360×240 | 117 KB | 홀 전체 바닥 텍스처 (헤링본 파케 패턴) |
| `wall_back.png` | 512×80 | 24 KB | 뒷벽 상단 데코 |
| `decor_plant.png` | 64×96 | 10 KB | 좌우 코너 화분 |
| `entrance_arch.png` | 192×64 | 14 KB | 홀/조리 경계 아치 |
| `table_lv0.png` ~ `table_lv4.png` | 96×80 | 2.5~5.6 KB | 테이블 등급별 빈 상태 |
| `table_lv0_occupied.png` ~ `table_lv4_occupied.png` | 96×96 | 3.7~6.3 KB | 테이블 등급별 착석 상태 (손님 합성) |
| `counter_cooking.png` | 96×64 | 4.3 KB | 조리 슬롯 카운터 아이콘 |

#### 손님 스프라이트 (`assets/service/`)

| 파일 | 해상도 | 손님 유형 |
|------|--------|---------|
| `customer_normal.png` | 48×48 | 일반 |
| `customer_vip.png` | 48×48 | VIP (👑) |
| `customer_gourmet.png` | 48×48 | 미식가 (🧐) |
| `customer_rushed.png` | 48×48 | 급한 (😰) |
| `customer_group.png` | 68×68 | 단체 (👨‍👩‍👧‍👦) |
| `customer_normal_sitting.png` | 48×48 | 착석 일반 |
| `customer_sitting.png` | 48×48 | 착석 (공용) |

#### 렌더링 방식

- **테이블**: 착석 시 `table_lv{grade}_occupied.png` 컴포짓 사용. 미로드 시 다이아몬드 폴리곤 fallback.
- **손님 아이콘**: 컴포짓 에셋 없을 때 `customer_{type}.png` → 없으면 이모지 텍스트 fallback.
- **바닥**: `floor_hall.png` 단일 이미지 → 없으면 `0x5C3A1E` 단색 rectangle fallback.
- **격자선**: Graphics API로 다이아몬드 테두리 오버레이 (opacity 0.3).
- **하단 바**: 순수 `0x0d0d1a` 사각형 (이미지 에셋 없음).
- **조리/재고/레시피 구역 배경**: `0x1c1008` 단색 rectangle (이미지 에셋 없음).
- **HUD 배경**: `0x1c0e00` 단색 rectangle.

### 1-3. 현재 방식의 한계점

1. **바닥 (`floor_hall.png`, 117 KB)**: 단일 정적 이미지 한 장. 챕터별 배경 분위기 차별화가 없다. 1장~24장 어디서 영업하든 동일한 파케 바닥이 표시된다.
2. **손님 스프라이트**: 48×48 단일 픽셀아트 스탠딩 이미지. 착석/대기/만족 등 상태 변화를 애니메이션 없이 컴포짓 PNG 교체로 처리한다. 생동감 부족.
3. **뒷벽/데코**: `wall_back.png` + `decor_plant.png` + `entrance_arch.png` 3개 고정 데코가 전 챕터에서 동일하게 쓰인다. 테마 연출이 없다.
4. **조리/재고/레시피 하단 구역**: 이미지 에셋이 전혀 없고 단색 사각형으로만 구성된다. 레스토랑 주방 분위기가 전혀 느껴지지 않는다.
5. **하단 바**: `0x0d0d1a` 진한 남색 배경. 게임의 웜 다크 테마(`0x1c0e00`)와 색조가 어긋난다.
6. **테이블 등급 시각 차이**: lv0~lv4 테이블이 색상 차이 외에 형태적 구분이 약하다. 업그레이드 동기 부여가 시각적으로 충분하지 않다.
7. **챕터 연동 배경 없음**: GatheringScene은 챕터별 타일셋(spice_palace, izakaya_underground, bistro_parisian 등)으로 배경을 차별화하지만, ServiceScene은 챕터와 무관하게 동일한 홀 이미지를 쓴다. 스토리 몰입감이 끊긴다.

---

## 2. 재구성 방향 설계

### 2-1. 뷰 방식

현행 **아이소메트릭 다이아몬드 격자 (Phase 19-5 도입)** 를 유지한다. 뷰 전환(탑다운↔사이드뷰)은 기존 좌표 체계와 depth sorting 로직을 전면 재작성해야 하므로 리스크가 크다. 비주얼 품질은 에셋 교체로 충분히 달성 가능하다.

### 2-2. 챕터별 배경 차별화

가장 즉각적인 분위기 전환 효과를 내는 방법이다. `floor_hall.png` 한 장을 챕터 그룹별로 교체한다.

| 그룹 | 챕터 | 배경 테마 | 분위기 키워드 |
|------|------|---------|-------------|
| 그룹1 | 1~6장 | 미미의 낡은 할머니 식당 | 따뜻한 나무 바닥, 빛바랜 타일, 가정적 |
| 그룹2 (일식) | 7~9장 | 이자카야 지하 홀 | 어두운 원목, 등롱, 다다미 느낌 |
| 그룹2 (중식) | 10~12장 | 드래곤 팰리스 홀 | 붉은 주단, 금색 장식, 대형 홀 |
| 그룹2 (양식) | 13~15장 | 파리 비스트로 홀 | 체크무늬 바닥, 테라조, 샹들리에 |
| 그룹3 (인도) | 16~18장 | 스파이스 팰리스 홀 | 모자이크 타일, 아치 기둥, 카펫 |
| 그룹3 (멕시칸) | 19~21장 | 칸티나 홀 | 테라코타 바닥, 선인장, 밝은 원색 |
| 그룹3 (디저트) | 22~24장 | 드림 디저트 홀 | 파스텔 대리석, 유리 천장, 파티시에 무드 |
| 엔드리스 | ∞ | 미력 폭풍의 눈 | 보라·금색 에너지 격자, 판타지 |

뒷벽(`wall_back.png`)과 데코(`decor_plant.png`, `entrance_arch.png`)도 각 테마에 맞는 변형 버전을 제작한다. 단, 데코는 중요도가 낮으므로 1단계에서 배경만 교체하고, 데코는 2단계에서 순차 추가한다.

### 2-3. 손님 캐릭터 비주얼 업그레이드

현재 5종 손님 유형 × 1장 스탠딩 이미지 구조를 **3프레임 착석 애니메이션** 방식으로 개선한다.

- 프레임 구성: `idle_0`, `idle_1`, `idle_2` (waiting 루프), `eating_0`, `eating_1` (served 상태)
- 크기: 64×64 (현행 48×48 → 1.33배 확대, 아이소메트릭 셀 크기 80×60에 맞춤)
- 유형 추가 연동: 챕터별 손님 외모 변형 (예: 7~9장은 기모노 착용 일반 손님)
- 컴포짓 방식 유지: `table_lv{n}_occupied.png`를 기반으로 손님 프레임을 별도 오버레이로 분리하거나, 기존 컴포짓 구조를 재활용한다.

단, 애니메이션 도입은 Phaser anim 등록과 SpriteLoader 연동이 필요하므로 **3단계**에서 처리한다. 1단계에서는 우선 64×64 단일 프레임 고품질 이미지로 교체한다.

### 2-4. 테이블 비주얼 정교화

현행 lv0~lv4 테이블은 색상 차이만 있다. 등급별로 형태를 달리하여 업그레이드 만족감을 높인다.

| 등급 | 현재 | 개선안 |
|------|------|--------|
| lv0 | 기본 갈색 나무 | 낡은 나무 식탁, 흠집 텍스처 |
| lv1 | 밝은 갈색 | 깔끔한 원목 |
| lv2 | 베이지 | 원목+체크 식탁보 |
| lv3 | 골드 테두리 | 대리석 상판 |
| lv4 | 황금색 | 크리스탈 상판, 화려한 금속 프레임 |

### 2-5. 하단 UI 구역 개선

조리/재고/레시피 구역(280~570px)에 배경 텍스처를 도입한다.

- **카운터 배경**: 주방 카운터 상단 뷰 이미지 (타일 패턴 또는 스테인리스 질감) 360×290px
- **레시피 버튼**: 현행 단색 rectangle → 양피지/메뉴판 질감 버튼 이미지로 교체
- **하단 바**: `0x0d0d1a` → `0x1c0e00` 웜 다크 계열로 색조 통일 (코드 수정만)

---

## 3. 에셋 교체 목록

### 3-1. 1단계 에셋 (즉시 효과, Phase 51 포함 권장)

| 에셋 | 현재 파일 | 개선 방향 | 해상도 | 생성 방법 |
|------|-----------|---------|--------|----------|
| 홀 바닥 — 그룹1 | `floor_hall.png` | 할머니 식당 목재 파케 (재생성) | 360×240 | PixelLab |
| 홀 바닥 — 그룹2 일식 | 없음 | 이자카야 다다미+원목 | 360×240 | PixelLab |
| 홀 바닥 — 그룹2 중식 | 없음 | 드래곤 팰리스 붉은 주단 | 360×240 | PixelLab |
| 홀 바닥 — 그룹2 양식 | 없음 | 파리 비스트로 체크 타일 | 360×240 | PixelLab |
| 홀 바닥 — 그룹3 인도 | 없음 | 스파이스 팰리스 모자이크 | 360×240 | PixelLab |
| 홀 바닥 — 그룹3 멕시칸 | 없음 | 칸티나 테라코타 | 360×240 | PixelLab |
| 홀 바닥 — 그룹3 디저트 | 없음 | 드림 파스텔 대리석 | 360×240 | PixelLab |
| 홀 바닥 — 엔드리스 | 없음 | 미력 에너지 격자 | 360×240 | PixelLab |
| 뒷벽 | `wall_back.png` | 그룹별 벽지/벽면 변형 (8종) | 512×80 (동일) | PixelLab |

### 3-2. 2단계 에셋 (손님 + 데코, Phase 51 이후)

| 에셋 | 현재 파일 | 개선 방향 | 해상도 | 생성 방법 |
|------|-----------|---------|--------|----------|
| 일반 손님 | `customer_normal.png` 48×48 | 고품질 픽셀아트 64×64 | 64×64 | PixelLab |
| VIP 손님 | `customer_vip.png` 48×48 | 정장+왕관, 64×64 | 64×64 | PixelLab |
| 미식가 손님 | `customer_gourmet.png` 48×48 | 안경+양복, 64×64 | 64×64 | PixelLab |
| 급한 손님 | `customer_rushed.png` 48×48 | 달리는 포즈, 64×64 | 64×64 | PixelLab |
| 단체 손님 | `customer_group.png` 68×68 | 가족 구성 정리, 80×80 | 80×80 | PixelLab |
| 화분 데코 | `decor_plant.png` 64×96 | 챕터별 변형 (화분/대나무/선인장/허브) | 64×96 | PixelLab |
| 입구 아치 | `entrance_arch.png` 192×64 | 챕터별 문 디자인 변형 | 192×64 | PixelLab |
| 테이블 lv0 occupied | `table_lv0_occupied.png` | 새 손님 크기 맞춤 재생성 | 96×96 | PixelLab |
| 테이블 lv4 occupied | `table_lv4_occupied.png` | 크리스탈 상판 + 새 손님 | 96×96 | PixelLab |

### 3-3. 3단계 에셋 (주방 구역 + 애니메이션, 별도 페이즈)

| 에셋 | 현재 파일 | 개선 방향 | 해상도 | 생성 방법 |
|------|-----------|---------|--------|----------|
| 카운터 배경 | 없음 (단색) | 주방 카운터 상단뷰 텍스처 | 360×290 | SD Forge |
| 레시피 버튼 배경 | 없음 (단색) | 메뉴판/양피지 질감 | 110×48 | PixelLab |
| 손님 idle 애니 | 없음 | 3프레임 호흡/흔들기 | 64×64×3 | PixelLab |
| 손님 eating 애니 | 없음 | 2프레임 식사 모션 | 64×64×2 | PixelLab |

---

## 4. 구현 영향 분석

### 4-1. `ServiceScene.js` 수정 포인트

#### 챕터별 바닥 로드 (1단계)

현재 `_createTables()`에서 `'floor_hall'` 단일 키로 이미지를 로드한다. 챕터별 키를 반환하는 헬퍼 함수를 추가해야 한다.

```javascript
// 변경 전
if (SpriteLoader.hasTexture(this, 'floor_hall')) {
  this.add.image(..., 'floor_hall')...
}

// 변경 후
const floorKey = this._getHallFloorKey();   // 예: 'floor_hall_izakaya'
if (SpriteLoader.hasTexture(this, floorKey) || SpriteLoader.hasTexture(this, 'floor_hall')) {
  this.add.image(..., SpriteLoader.hasTexture(this, floorKey) ? floorKey : 'floor_hall')...
}
```

헬퍼 함수 `_getHallFloorKey()`: `this.chapter` 값으로 챕터 그룹을 판별하고 해당 에셋 키를 반환한다.

```
chapter 1~6   → 'floor_hall_g1'
chapter 7~9   → 'floor_hall_izakaya'
chapter 10~12 → 'floor_hall_dragon'
chapter 13~15 → 'floor_hall_bistro'
chapter 16~18 → 'floor_hall_spice'
chapter 19~21 → 'floor_hall_cantina'
chapter 22~24 → 'floor_hall_dream'
isEndless     → 'floor_hall_endless'
```

뒷벽 키도 동일한 패턴으로 `_getWallBackKey()` 헬퍼를 추가한다.

#### 에셋 Preload 연동

`PreloadScene.js` (또는 해당 씬의 preload 단계)에서 챕터별 에셋을 모두 로드하거나, 현재 챕터에 해당하는 에셋만 동적으로 로드하는 전략을 선택해야 한다. 바닥 이미지 8종 × 약 20~60 KB = 최대 480 KB 추가이므로 전부 미리 로드해도 허용 범위다.

#### 손님 크기 변경 (2단계)

`_createTables()`에서 `custIconImg.setDisplaySize(32, 32)` → `setDisplaySize(48, 48)` (64×64 원본 기준 스케일링). `table_lv{n}_occupied.png` 컴포짓의 높이 계산도 변경 필요:
```javascript
// 현행: occH = Math.round(SISO_TABLE_H * 1.2) = 67
// 변경: 손님 크기가 커지면 컴포짓 높이 조정 필요 (재생성 에셋 치수에 맞게)
```

#### 하단 바 색조 통일 (즉시, 코드만)

`_createBottomBar()`에서:
```javascript
// 변경 전
0x0d0d1a
// 변경 후
0x1c0e00
```

### 4-2. `PreloadScene.js` (또는 동등 씬) 수정 포인트

챕터별 홀 바닥 에셋 키-경로 매핑을 추가한다.

```javascript
this.load.image('floor_hall_g1',      'assets/service/floor_hall_g1.png');
this.load.image('floor_hall_izakaya', 'assets/service/floor_hall_izakaya.png');
// ... (각 챕터 그룹별 8개 키)
this.load.image('wall_back_g1',       'assets/service/wall_back_g1.png');
// ...
```

---

## 5. 단계적 구현 계획

### 1단계 — 배경 교체 (Phase 51-4 완료, 2026-04-18)

**목표**: 챕터별 홀 바닥 + 뒷벽 이미지 8세트 교체. 코드 변경 최소화.

| 작업 | 내용 | 상태 |
|------|------|------|
| 에셋 생성 | floor_hall 8종 (128x128 tileable, PixelLab) | 완료 |
| 에셋 생성 | wall_back 8종 (360x64) | 미생성 (PixelLab API 한계, 기존 wall_back.png fallback) |
| ServiceScene.js | `_getHallFloorKey()`, `_getWallBackKey()` 헬퍼 추가 | 완료 |
| ServiceScene.js | `_createTables()` tileSprite 전환, `_createHallDecor()` fallback 방식 | 완료 |
| SpriteLoader.js | 신규 에셋 16개 로드 경로 추가 | 완료 |
| 하단 바 색조 | `0x0d0d1a` → `0x1c0e00` | 완료 |

**구현 상세**: 바닥 해상도를 기획서 360x240에서 128x128 tileable로 변경하여 `add.tileSprite`로 반복 렌더링. QA 25/25 PASS.

### 2단계 — 손님 캐릭터 + 데코 (Phase 51 이후, 별도 페이즈)

**목표**: 손님 5종 64×64 재생성. 화분/아치 챕터별 변형.

| 작업 | 내용 |
|------|------|
| 에셋 생성 | 손님 5종 × 64×64 (PixelLab) |
| 에셋 생성 | occupied 컴포짓 5등급 재생성 (새 손님 크기 반영) |
| ServiceScene.js | `custIconImg.setDisplaySize` 수치 조정 |
| ServiceScene.js | occupied 컴포짓 높이 비율 재조정 |

**기대 효과**: 손님 캐릭터 존재감 강화, VIP/미식가 시각적 구분 명확화.

### 3단계 — 주방 구역 + 애니메이션 (장기, 별도 페이즈)

**목표**: 하단 주방 구역 배경 텍스처 도입 + 손님 idle/eating 애니메이션.

| 작업 | 내용 |
|------|------|
| 에셋 생성 | 카운터 배경 360×290 (SD Forge) |
| 에셋 생성 | 손님 idle 3프레임 + eating 2프레임 × 5종 (PixelLab) |
| ServiceScene.js | SpriteLoader anim 등록 연동, `_createTables()` 애니메이션 재생 |
| SpriteLoader.js | 손님 전용 anim 등록 로직 추가 |

---

## 6. Phase 51 구현 범위 제안

Phase 51은 "Phase 48~50 기획 구현"을 목표로 한다. 영업씬 재구성 중 Phase 51에서 처리할 항목과 이후 미룰 항목을 구분한다.

### Phase 51 포함 항목 (1단계)

| 항목 | 이유 |
|------|------|
| 챕터별 홀 바닥 이미지 8종 생성 및 교체 | 즉시 효과 최대, 코드 변경 최소 |
| 챕터별 뒷벽 이미지 8종 생성 및 교체 | 바닥과 세트, 작업량 부담 없음 |
| `_getHallFloorKey()`, `_getWallBackKey()` 헬퍼 추가 | 단순 switch/map 구조, 15~20줄 |
| 하단 바 색조 통일 (`0x0d0d1a` → `0x1c0e00`) | 1줄 코드 수정 |
| PreloadScene 에셋 경로 추가 | 16줄 추가 |

### Phase 51 이후 별도 처리 항목

| 항목 | 이유 |
|------|------|
| 손님 64×64 재생성 | occupied 컴포짓 5등급 전체 재생성 필요, 작업량 큼 |
| 화분/아치 챕터별 변형 | 우선순위 낮음, 1단계 효과 확인 후 결정 |
| 카운터 배경 텍스처 | SD Forge 생성, 코드 연동 복잡도 있음 |
| 손님 애니메이션 | SpriteLoader 구조 변경 필요, 별도 설계 필요 |
| 테이블 lv0~lv4 형태 차별화 | 재생성 10종 (empty + occupied), 2단계 에셋 작업 병행 |

---

## 7. 에셋 생성 스타일 가이드

기존 `docs/ART-STANDARD.md` 기준을 따르되, 영업씬 바닥 에셋에 대해 추가 지침을 적용한다.

### 홀 바닥 공통 요구사항

- **해상도**: 360×240 (게임 해상도 1:1 매핑, 업스케일링 없음)
- **픽셀 아트 스타일**: 타일 반복 패턴 기반. 너무 사실적인 텍스처는 금지.
- **아이소메트릭 격자 공존**: 그 위에 `Graphics` 격자 오버레이(opacity 0.3)가 렌더링되므로, 바닥 자체에 격자선을 과도하게 그리지 않는다.
- **깊이감**: 원근감 없이 평면 톱뷰(top-down) 패턴. 아이소메트릭 착시는 격자 오버레이가 담당한다.
- **색 팔레트**: 웜 다크 계열 주색조 유지 (너무 밝은 흰색 바닥 금지). HUD와 하단 바(`0x1c0e00`) 색조와 어울리는 계열.
- **파일 형식**: PNG, 투명도 없음(배경 없는 에셋이 아님).

### 챕터별 분위기 키워드 요약

| 키 | 주조색 | 패턴 | 금지 요소 |
|----|--------|------|-----------|
| `floor_hall_g1` | 갈색 나무 | 헤링본 파케 | 너무 밝거나 새것처럼 보이는 바닥 |
| `floor_hall_izakaya` | 짙은 원목 + 짚 | 다다미 격자 | 서양식 패턴 |
| `floor_hall_dragon` | 진홍 + 금 | 주단 패턴 | 차가운 색조 |
| `floor_hall_bistro` | 흑백 체크 + 베이지 | 비스트로 타일 | 아시아 패턴 |
| `floor_hall_spice` | 코발트 + 모래 | 모자이크 기하학 | 직선 단순 패턴 |
| `floor_hall_cantina` | 테라코타 + 흰 | 멕시코 타일 | 어두운 색조 |
| `floor_hall_dream` | 파스텔 라벤더 + 크림 | 대리석 / 체크 | 강렬한 원색 |
| `floor_hall_endless` | 보라 + 금 | 에너지 격자 | 유기적 패턴 |

---

## 8. 참고 사항

- GatheringScene은 챕터별 타일셋 (`assets/tilesets/`)을 이미 사용하고 있으나, ServiceScene은 별도 폴더(`assets/service/`)를 사용한다. 일관성 유지를 위해 신규 홀 바닥 에셋도 `assets/service/` 하위에 저장한다.
- 기존 `floor_hall.png`는 제거하지 않고 유지한다 (fallback 역할 + 엔드리스 또는 기타 fallback 대응).
- 엔드리스 모드는 `isEndless === true` 플래그로 판별한다 (`this.isEndless` 참조, `init()` 메서드).
- `chapter` 값은 `parseInt(stageId.split('-')[0])` 로 파싱된다 (ServiceScene.js `init()` 참조).
- 에셋 preload는 현재 `PreloadScene.js` 또는 동등 씬에서 처리한다. 해당 씬 구조 확인 후 경로 추가.
- 손님 스프라이트 변경 시 `table_lv{n}_occupied.png` 컴포짓도 반드시 세트로 재생성해야 한다. 손님 이미지만 교체하면 컴포짓 에셋과 크기 불일치가 발생한다.
