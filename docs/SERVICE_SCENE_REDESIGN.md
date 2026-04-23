# Kitchen Chaos — 영업씬(ServiceScene) 비주얼 재구성 기획서

> 작성일: 2026-04-18 (Phase 50 산출물)
> 최종 수정: 2026-04-23 — **카이로 스타일로 방향성 전환 노트 추가**
> 상태: 1단계 완료 (Phase 51-4), 2단계 완료 (Phase 52), 3단계 미착수
> ⚠️ **본 문서는 Phase 50~52 시점의 방향성 기준이다. Phase 76 이후 영업씬은 카이로 소프트 스타일로 재설계되며, 신규 방향성은 [SERVICE_SCENE_KAIRO_DIRECTION.md](SERVICE_SCENE_KAIRO_DIRECTION.md)를 참조한다.**

---

## 0. 본 문서의 위치 (2026-04-23 추가)

본 문서는 **Phase 50~52에서 진행된 아이소메트릭 격자 + 3레이어 분리 렌더링** 방향이다. Phase 76 손님 NPC 다양성 확장 결과 다음 한계가 드러나, 영업씬을 **카이로 소프트 스타일**로 전면 재설계하기로 결정했다:

- 신규 92×92 손님 풀바디 스프라이트가 기존 48×64 규격과 호환되지 않음
- 의자 정합 문제(다리·하반신이 의자에 자연스럽게 박히지 않음)가 근본적으로 해결되지 않음
- 동시 처리 손님 수가 카오스 분위기를 살리기에 부족

신규 방향성은 [**SERVICE_SCENE_KAIRO_DIRECTION.md**](SERVICE_SCENE_KAIRO_DIRECTION.md)에 정리되어 있다. 본 문서의 §2-3, §2-4, §3-2, §4 등 **렌더링 아키텍처 관련 절은 폐기**된다. **§2-2 챕터별 배경 차별화·§7 에셋 생성 스타일 가이드** 등 일반 미술 가이드는 신규 방향에서도 계승된다.

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

#### 렌더링 방식 (현재 — 레거시)

- **테이블**: 착석 시 `table_lv{grade}_occupied.png` 컴포짓 사용 (테이블+손님 합성 1장). 미로드 시 다이아몬드 폴리곤 fallback.
- **손님 아이콘**: 컴포짓 에셋 없을 때 `customer_{type}.png` → 없으면 이모지 텍스트 fallback.
- **바닥**: `floor_hall_{theme}.png` 128×128 tileSprite 반복 → 없으면 `0x5C3A1E` 단색 rectangle fallback. (Phase 51-4 적용)
- **격자선**: Graphics API로 다이아몬드 테두리 오버레이 (opacity 0.3).
- **하단 바**: `0x1c0e00` 단색 rectangle. (Phase 51-4에서 색조 수정)
- **조리/재고/레시피 구역 배경**: `0x1c1008` 단색 rectangle (이미지 에셋 없음).
- **HUD 배경**: `0x1c0e00` 단색 rectangle.

### 1-3. 현재 방식의 한계점

1. **바닥 (`floor_hall.png`, 117 KB)**: 단일 정적 이미지 한 장. 챕터별 배경 분위기 차별화가 없다. 1장~24장 어디서 영업하든 동일한 파케 바닥이 표시된다.
2. **손님 스프라이트**: 48×48 단일 픽셀아트 스탠딩 이미지. 착석/대기/만족 등 상태 변화를 애니메이션 없이 컴포짓 PNG 교체로 처리한다. 생동감 부족.
3. **뒷벽/데코**: `wall_back.png` + `decor_plant.png` + `entrance_arch.png` 3개 고정 데코가 전 챕터에서 동일하게 쓰인다. 테마 연출이 없다.
4. **조리/재고/레시피 하단 구역**: 이미지 에셋이 전혀 없고 단색 사각형으로만 구성된다. 레스토랑 주방 분위기가 전혀 느껴지지 않는다.
5. **하단 바**: `0x0d0d1a` 진한 남색 배경. 게임의 웜 다크 테마(`0x1c0e00`)와 색조가 어긋난다.
6. **테이블 등급 시각 차이**: lv0~lv4 테이블이 색상 차이 외에 형태적 구분이 약하다. 업그레이드 동기 부여가 시각적으로 충분하지 않다.
7. **챕터 연동 배경 없음**: GatheringScene은 챕터별 타일셋(spice_palace, izakaya_underground, bistro_parisian 등)으로 배경을 차별화하지만, ServiceScene은 챕터와 무관하게 동일한 홀 이미지를 쓴다. 스토리 몰입감이 끊긴다. (→ Phase 51-4에서 바닥 8종 교체로 부분 해결)
8. **컴포짓 occupied 시스템의 확장성 한계** ⚠️: `table_lv{n}_occupied.png`가 테이블+손님을 미리 합성한 단일 이미지이므로, 손님 유형이 늘어날수록 `등급 수 × 손님 종류 × 상태` 배수로 에셋이 증가한다. 새 손님 1종 추가 시 최소 5장(등급별)이 필요하고, 손님 애니메이션 도입 시에는 프레임 수까지 곱해진다. 이 구조로는 손님 캐릭터 다양화가 근본적으로 불가능하다.

---

## 2. 재구성 방향 설계

### 2-1. 뷰 방식 (확정)

**아이소메트릭 다이아몬드 격자 유지** (Phase 19-5 도입 구조 계승).

사이드뷰 전환도 검토했으나 다음 이유로 아이소메트릭을 유지한다:
- 기존 이소좌표계·격자 렌더링·depth 체계가 모두 재작성 필요 (공수 3~4 phase)
- GatheringScene(아이소메트릭)과의 시각적 연속성이 끊김
- **손님 착석 겹침 문제**는 뷰 전환 없이 렌더링 레이어 분리로 해결 가능 (→ 2-3 참조)

바닥 타일은 `square_topdown`이 아닌 **`isometric` 타입**으로 재생성한다. (Phase 51-4에서 생성한 128×128 `square_topdown` 타일은 아이소메트릭 테이블과 원근감이 충돌하므로 차기 단계에서 교체 대상.)

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

### 2-3. 손님 캐릭터 — 렌더링 아키텍처 전환 (핵심 결정) ⭐

**컴포짓 방식 → 독립 스프라이트 방식으로 전환한다.**

#### 문제: 기존 컴포짓 방식

```
table_lv2_occupied.png = [테이블 뒷면 + 의자 + 손님 캐릭터 + 테이블 앞면] 합성 1장
```
→ 손님 종류 × 테이블 등급 수만큼 에셋 폭증. 확장 불가.

#### 해결: 3레이어 분리 렌더링

```
레이어 1: table_lv{n}_back.png   (테이블 뒷면 + 의자 뒷부분)   depth = (col+row)*100
레이어 2: customer_{type}.png    (손님 스프라이트, 독립)        depth = (col+row)*100 + 50
레이어 3: table_lv{n}_front.png  (테이블 앞면 + 의자 앞부분)    depth = (col+row)*100 + 99
```

손님이 테이블 뒷면에 가려지고, 테이블 앞면 아래로 숨는 자연스러운 착석 연출이 된다.

#### 에셋 수 비교

| 방식 | 에셋 수 | 손님 1종 추가 시 |
|------|--------|----------------|
| 기존 컴포짓 | 5등급 × 손님종류 × 상태 = 75장+ | 5장 추가 |
| **분리 렌더링** | 테이블 5×2(앞/뒤) + 손님 N×2(대기/착석) | **2장만 추가** |

#### 손님 스프라이트 스펙

- **크기**: 48×64 (아이소메트릭 셀 80×60 기준, 캐릭터가 약간 높게 보임)
- **상태**: `waiting` (입장 대기/착석 대기), `seated` (음식 받은 후 착석)
- **추후 확장**: `eating_0`, `eating_1` 애니메이션 프레임 (3단계에서 추가)
- **종류**: 기존 5종 (normal, vip, gourmet, rushed, group) → 손님 추가 시 2장만 생성

#### depth 계산식

```javascript
const BASE_DEPTH = (col + row) * 100;
tableBack.setDepth(BASE_DEPTH);        // 테이블 뒷면
customer.setDepth(BASE_DEPTH + 50);    // 손님
tableFront.setDepth(BASE_DEPTH + 99);  // 테이블 앞면
```

의자는 테이블 뒷면(`_back`)에 포함하여 별도 에셋 불필요.

### 2-4. 테이블 비주얼 정교화

현행 lv0~lv4 테이블은 색상 차이만 있다. 등급별 형태 차별화 + 앞/뒤 분리 에셋으로 재생성한다.

| 등급 | 디자인 | 앞면 파일 | 뒷면 파일 |
|------|--------|----------|----------|
| lv0 | 낡은 나무 식탁 + 플라스틱 의자 | `table_lv0_front.png` | `table_lv0_back.png` |
| lv1 | 깔끔한 원목 + 나무 의자 | `table_lv1_front.png` | `table_lv1_back.png` |
| lv2 | 원목+체크 식탁보 + 패딩 의자 | `table_lv2_front.png` | `table_lv2_back.png` |
| lv3 | 대리석 상판 + 쿠션 의자 | `table_lv3_front.png` | `table_lv3_back.png` |
| lv4 | 크리스탈 상판 + 벨벳 의자 | `table_lv4_front.png` | `table_lv4_back.png` |

**해상도**: 96×52 (앞면), 96×64 (뒷면+의자 포함). 기존 96×80 단일 에셋에서 분리.
**기존 `table_lv{n}.png`, `table_lv{n}_occupied.png`**: 분리 렌더링 전환 후 레거시로 유지(fallback용).

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

### 3-2. 2단계 에셋 (렌더링 재구성 — 테이블 분리 + 손님 독립화)

**핵심 변경**: `_occupied` 컴포짓 방식 폐기 → 테이블 앞/뒤 분리 + 손님 독립 스프라이트

#### 테이블 분리 에셋 (10장)

| 에셋 | 파일명 | 해상도 | 내용 |
|------|--------|--------|------|
| lv0 뒷면 | `table_lv0_back.png` | 96×64 | 낡은 원목 뒤판 + 플라스틱 의자 |
| lv0 앞면 | `table_lv0_front.png` | 96×52 | 낡은 원목 앞판 + 다리 |
| lv1 뒷면 | `table_lv1_back.png` | 96×64 | 원목 뒤판 + 나무 의자 |
| lv1 앞면 | `table_lv1_front.png` | 96×52 | 원목 앞판 |
| lv2 뒷면 | `table_lv2_back.png` | 96×64 | 체크 식탁보 뒤 + 패딩 의자 |
| lv2 앞면 | `table_lv2_front.png` | 96×52 | 체크 식탁보 앞 |
| lv3 뒷면 | `table_lv3_back.png` | 96×64 | 대리석 뒤 + 쿠션 의자 |
| lv3 앞면 | `table_lv3_front.png` | 96×52 | 대리석 앞판 |
| lv4 뒷면 | `table_lv4_back.png` | 96×64 | 크리스탈 뒤 + 벨벳 의자 |
| lv4 앞면 | `table_lv4_front.png` | 96×52 | 크리스탈 앞판 + 금속 프레임 |

#### 손님 독립 스프라이트 (10장)

| 에셋 | 파일명 | 해상도 | 상태 |
|------|--------|--------|------|
| 일반 대기 | `customer_normal_waiting.png` | 48×64 | 입장/착석 대기 |
| 일반 착석 | `customer_normal_seated.png` | 48×64 | 서빙 받은 후 |
| VIP 대기 | `customer_vip_waiting.png` | 48×64 | 정장+왕관 |
| VIP 착석 | `customer_vip_seated.png` | 48×64 | |
| 미식가 대기 | `customer_gourmet_waiting.png` | 48×64 | 안경+양복 |
| 미식가 착석 | `customer_gourmet_seated.png` | 48×64 | |
| 급한 대기 | `customer_rushed_waiting.png` | 48×64 | 긴장 표정 |
| 급한 착석 | `customer_rushed_seated.png` | 48×64 | |
| 단체 대기 | `customer_group_waiting.png` | 64×64 | 가족 |
| 단체 착석 | `customer_group_seated.png` | 64×64 | |

#### 데코 (옵션, 우선순위 낮음)

| 에셋 | 현재 파일 | 개선 방향 | 해상도 |
|------|-----------|---------|--------|
| 화분 데코 | `decor_plant.png` | 챕터별 변형 (화분/대나무/선인장) | 64×96 |
| 입구 아치 | `entrance_arch.png` | 챕터별 문 디자인 변형 | 192×64 |

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

#### 1단계 — 챕터별 바닥 (Phase 51-4 완료)

`_getHallFloorKey()`, `_getWallBackKey()` 헬퍼 추가, `add.tileSprite` 전환, 하단 바 색조 수정 완료.

#### 2단계 — 테이블 앞/뒤 분리 렌더링 (핵심 변경)

`_createTables()` 내 테이블 렌더 로직을 아래와 같이 교체한다.

```javascript
// 변경 전 (컴포짓 방식)
const occKey = `table_lv${grade}_occupied`;
if (isOccupied && SpriteLoader.hasTexture(this, occKey)) {
  this.add.image(x, y, occKey).setDepth(depth);
} else {
  this.add.image(x, y, `table_lv${grade}`).setDepth(depth);
}

// 변경 후 (3레이어 분리 방식)
const BASE = (col + row) * 100;
const backKey  = `table_lv${grade}_back`;
const frontKey = `table_lv${grade}_front`;
const custKey  = isOccupied ? `customer_${custType}_seated` : null;

// fallback: 기존 단일 에셋
if (!SpriteLoader.hasTexture(this, backKey)) {
  const legacyKey = isOccupied ? `table_lv${grade}_occupied` : `table_lv${grade}`;
  this.add.image(x, y, legacyKey).setDepth(BASE);
  return;
}

this.add.image(x, y, backKey).setDepth(BASE);          // 레이어 1: 테이블 뒷면
if (custKey && SpriteLoader.hasTexture(this, custKey)) {
  this.add.image(x, y - 8, custKey).setDepth(BASE + 50); // 레이어 2: 손님
}
this.add.image(x, y, frontKey).setDepth(BASE + 99);    // 레이어 3: 테이블 앞면
```

**depth 계산 기준**:
```
(col + row) * 100       → 테이블 뒷면 (배경에 가까운 쪽)
(col + row) * 100 + 50  → 손님 스프라이트
(col + row) * 100 + 99  → 테이블 앞면 (플레이어에 가까운 쪽)
```

#### SpriteLoader 수정 포인트

```javascript
// _loadServiceAssets() 에 추가
const TABLE_GRADES = [0, 1, 2, 3, 4];
const CUST_TYPES   = ['normal', 'vip', 'gourmet', 'rushed', 'group'];
const CUST_STATES  = ['waiting', 'seated'];

for (const g of TABLE_GRADES) {
  scene.load.image(`table_lv${g}_back`,  `${SERVICE_ROOT}/table_lv${g}_back.png`);
  scene.load.image(`table_lv${g}_front`, `${SERVICE_ROOT}/table_lv${g}_front.png`);
}
for (const t of CUST_TYPES) {
  for (const s of CUST_STATES) {
    scene.load.image(`customer_${t}_${s}`, `${SERVICE_ROOT}/customer_${t}_${s}.png`);
  }
}
```

### 4-2. `PreloadScene.js` (또는 동등 씬) 수정 포인트

챕터별 홀 바닥 에셋은 Phase 51-4에서 SpriteLoader에 이미 추가됨.
2단계에서 테이블 앞/뒤 + 손님 스프라이트 경로 추가 (SpriteLoader 방식으로 통일).

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

### 2단계 — 렌더링 재구성 (Phase 52 완료, 2026-04-19)

**목표**: 컴포짓 occupied 방식 폐기. 테이블 앞/뒤 분리 에셋 + 손님 독립 스프라이트 도입.

| 작업 | 내용 | 상태 |
|------|------|------|
| 에셋 생성 | 테이블 lv0~lv4 뒷면 5장 (96x64) + 앞면 5장 (96x52) = 10장 (PixelLab) | 완료 |
| 에셋 생성 | 손님 5종 x 2상태(waiting/seated) = 10장 (48x64, group 64x64) | 완료 |
| SpriteLoader.js | table_lv{0~4}_back/front + customer_{type}_{state} 로드 추가 | 완료 |
| ServiceScene.js | `_createTables()` 3레이어 분리 렌더링 (tableBackImg/customerImg/tableFrontImg 독립 Image) | 완료 |
| ServiceScene.js | `_updateTableUI()` waiting/seated 상태 전환, 3단계 fallback 체인 | 완료 |
| ServiceScene.js | depth 공식 `BASE = 10 + (col+row)*100` + HUD 600+ 상향 | 완료 |
| ServiceScene.js | `_shutdown()` 독립 이미지 오브젝트 해제 추가 | 완료 |
| 바닥 타일 재생성 | `isometric` 타입 128x128 타일로 교체 (square_topdown 대체) | 미완료 (에셋 미생성, 코드 경로는 Phase 51-4에서 구현 완료) |

**구현 상세**:
- depth 체계: back=BASE, customer=BASE+50, front=BASE+99, HUD=600+, 배너=700+, 플로팅=750, 토스트=800
- Container는 UI 요소(statusText, bubble, pBar) 전용으로 축소, 3레이어 이미지는 씬에 직접 추가
- `useLayered` 데이터 플래그로 3레이어/레거시 자동 분기
- fallback: `_back` 미로드 시 기존 `_occupied` 컴포짓 방식 유지, 그마저 없으면 다이아몬드 폴리곤
- QA 67/67 PASS, AD2 APPROVED, AD3 APPROVED

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

### Phase 51 이후 별도 처리 항목 (2단계로 이동)

| 항목 | 내용 |
|------|------|
| 테이블 앞/뒤 분리 에셋 10장 | lv0~lv4 × front/back, PixelLab 생성 |
| 손님 독립 스프라이트 10장 | 5종 × waiting/seated, 48×64 |
| ServiceScene 3레이어 렌더링 | `_createTables()` 재작성 |
| 바닥 타일 isometric 재생성 | square_topdown → isometric 타입 교체 |
| 화분/아치 챕터별 변형 | 우선순위 낮음, 2단계 이후 |
| 손님 eating 애니메이션 | 3단계 (SpriteLoader anim 구조 변경 필요) |
| 카운터 배경 텍스처 | 3단계 (SD Forge 생성) |

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
- **[2단계 이후]** `table_lv{n}_occupied.png` 컴포짓은 레거시 fallback으로만 남긴다. 분리 렌더링 전환 후에는 `_back`/`_front` 미로드 시에만 컴포짓을 사용하는 fallback 경로를 유지한다.
- **[확정]** 손님 스프라이트는 테이블 등급과 독립이므로, 새 손님 추가 시 `customer_{type}_waiting.png` + `customer_{type}_seated.png` 2장만 생성하면 모든 테이블 등급에서 동작한다.
