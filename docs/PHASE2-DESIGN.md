# Kitchen Chaos Defense — Phase 2 기획서: 주문-요리-서빙 시스템

> 작성일: 2026-04-09
> 상태: 기획 (v1.1)
> Phase 1 기반: 코어 TD + 재료 드롭 + 조리소 버프 완성

---

## 1. Phase 2 목표

Phase 1은 일반적인 타워 디펜스 루프를 완성했다. Phase 2에서는 **"주문-요리-서빙"** 경제 순환을 도입하여 Kitchen Chaos만의 차별화된 핵심 루프를 만든다.

### 아키텍처 결정사항

| 결정 | 내용 | 근거 |
|------|------|------|
| **뷰 시점** | Phase 2는 직교(탑뷰) 유지, **아이소메트릭은 Phase 3** | 서빙 시스템 검증 우선. 좌표계+렌더링+에셋 전면 교체를 별도 페이즈로 분리해 리스크 감소 |
| **씬 구조** | **듀얼 씬** — GameScene(전투) + RestaurantScene(서빙) 병렬 실행 | 관심사 분리, 독립 테스트 가능, 화면 영역 명확 분할 |

### 핵심 변경 요약

| 항목 | Phase 1 (현재) | Phase 2 (변경) |
|------|---------------|----------------|
| 골드 획득 | 적 처치 시 직접 골드 드롭 | 적은 **재료만** 드롭, 골드는 **서빙으로만** 획득 |
| 재료 용도 | 조리소에서 타워 버프 | **손님 주문 요리 → 서빙 → 골드** |
| 조리소 역할 | 버프 생산기 | **레스토랑 주방** (주문 접수 → 조리 → 서빙) |
| 타워 구매 | 적 처치 골드로 구매 | **서빙 수입**으로 구매 |
| 전략 깊이 | "어디에 타워를 놓을까" | "어떤 적을 먼저 잡아서 어떤 요리를 서빙할까" |
| 씬 구조 | 단일 GameScene | **GameScene + RestaurantScene** 병렬 실행 |

---

## 2. 핵심 루프: 주문-요리-서빙 순환

```
적 출현 → 타워가 적 처치 → 재료 드롭 → 재료 수거
                                            ↓
                                   손님 주문 확인
                                            ↓
                                   보유 재료로 요리
                                            ↓
                                   손님에게 서빙 → 골드 획득 (+팁)
                                            ↓
                                   골드로 타워 구매/업그레이드
                                            ↓
                                   더 강한 적 처치 가능 → 더 많은 재료...
```

### 2-1. 적 처치 → 재료 드롭 (변경)

- **적 처치 시 골드 직접 드롭을 제거한다** (`goldReward` → 삭제 또는 0)
- 적은 재료만 드롭 (기존 시스템 유지)
- 신선도 보너스(빠른 처치 시 2배 드롭)는 Phase 1과 동일하게 유지
- 적 HP, 속도 등 스탯은 Phase 1 기준 유지

### 2-2. 손님(Customer) 시스템 — 새 시스템

매 웨이브 시작 시 **손님**이 레스토랑에 방문한다. 손님은 특정 요리를 주문하고, 인내심 게이지가 있다.

#### 손님 데이터 구조

```javascript
// 손님 1명의 정의
{
  id: 'customer_1',
  dish: 'carrot_stew',       // 주문한 요리 (RECIPES에서 참조)
  patience: 30000,            // 인내심 (ms) — 이 시간 안에 서빙해야 함
  baseReward: 40,             // 기본 서빙 골드
  tipMultiplier: 1.5,         // 빠른 서빙 시 팁 배율
}
```

#### 손님 행동 흐름

```
[웨이브 시작] → 손님 1~3명 도착 (웨이브 번호에 비례)
       ↓
[주문 표시] → UI 상단 또는 서빙존에 주문 말풍선 표시
       ↓
[인내심 게이지 감소 시작] → 초록 → 노랑 → 빨강 → 퇴장
       ↓
[서빙 성공 시] → 골드 획득 (잔여 인내심에 따라 팁 차등)
[인내심 소진 시] → 손님 퇴장, 골드 없음 + 평판 감소
```

#### 손님 슬롯

- 화면에 동시에 최대 **3명**의 손님이 대기 가능
- 새 손님은 빈 슬롯에 순차적으로 배치
- 3슬롯 모두 점유 중이면 새 손님은 대기열에 쌓인다 (최대 2명 대기)

#### 인내심 & 팁 시스템

| 잔여 인내심 | 팁 등급 | 보상 계산 |
|------------|---------|-----------|
| 70% 이상 | 대만족 (★★★) | baseReward × tipMultiplier |
| 40~70% | 보통 (★★) | baseReward × 1.0 |
| 40% 미만 | 불만 (★) | baseReward × 0.7 |
| 0% | 퇴장 | 0골드 + 평판 -1 |

### 2-3. 요리 흐름 (변경)

Phase 1의 조리소는 "재료 → 버프" 구조였다. Phase 2에서는 "재료 → 요리 → 서빙 → 골드"로 변경한다.

#### 요리 과정

1. **손님 주문 확인** — UI에서 주문한 요리와 필요 재료 확인
2. **요리 버튼 탭** — 보유 재료 충분 시 즉시 요리 완성 (조리 시간 없음, Phase 2에서는 단순화)
3. **자동 서빙** — 완성된 요리는 해당 주문 손님에게 즉시 서빙
4. **골드 획득** — 서빙 시 골드 + 팁 획득

> **설계 의도**: 조리 시간은 Phase 3에서 도입 가능. Phase 2에서는 "재료 관리 + 서빙 타이밍"에 집중한다.

### 2-4. 서빙 콤보 시스템 — 새 시스템

연속 서빙 시 보너스 골드를 부여하여 빠른 플레이를 보상한다.

| 연속 서빙 수 | 콤보 보너스 |
|-------------|------------|
| 1~2회 | 없음 |
| 3회 연속 | +10% 골드 |
| 5회 연속 | +25% 골드 |
| 8회 이상 | +50% 골드 |

- **콤보 카운터 리셋 조건**: 손님 퇴장(인내심 소진) 시 0으로 리셋
- **콤보 표시**: HUD에 "🔥 ×3 콤보!" 형태로 표시

### 2-5. 요리 버프 (기존 시스템 축소 유지)

Phase 1의 레시피 3종(당근 스튜, 그릴 스테이크, 혼합 스튜) 버프 효과는 **보너스 메뉴**로 유지한다.

- 손님 주문과 별개로, 여유 재료로 직접 조리 가능
- 타워 버프 효과는 동일하게 유지
- 단, 버프에 재료를 쓰면 서빙할 재료가 줄어드는 **트레이드오프** 발생

---

## 3. 레시피 확장

Phase 1 레시피 3종을 유지하면서, Phase 2 전용 레시피 3종을 추가한다.

### 3-1. 기존 레시피 (버프 전용 — 손님 주문 불가)

| ID | 이름 | 재료 | 효과 |
|----|------|------|------|
| `carrot_stew` | 당근 스튜 | 당근 ×2 | 전 타워 공격속도 +30% (60초) |
| `grilled_steak` | 그릴 스테이크 | 고기 ×2 | 전 타워 공격력 +40% (60초) |
| `mixed_stew` | 혼합 스튜 | 당근 ×1 + 고기 ×1 | 전 타워 공격력+속도 +20% (45초) |

### 3-2. 새 레시피 (서빙 전용 — 손님이 주문 가능)

| ID | 이름 | 재료 | 기본 서빙 가격 | 비고 |
|----|------|------|--------------|------|
| `carrot_soup` | 당근 수프 | 당근 ×1 | 20g | 가장 쉬운 요리 |
| `steak_plate` | 스테이크 정식 | 고기 ×2 | 50g | 고급 요리, 높은 보상 |
| `mixed_platter` | 혼합 플래터 | 당근 ×2 + 고기 ×1 | 65g | 최고급 요리 |

> **확장성**: Phase 3에서 새 재료(해산물, 향신료 등)와 함께 레시피 추가 가능

---

## 4. 경제 밸런스

### 4-1. 골드 수입원

| 수입원 | 금액 | 빈도 |
|--------|------|------|
| 당근 수프 서빙 | 20~30g (팁 포함) | 빈번 |
| 스테이크 정식 서빙 | 50~75g (팁 포함) | 중간 |
| 혼합 플래터 서빙 | 65~97g (팁 포함) | 드물 |
| 웨이브 클리어 보너스 | 15g 고정 | 웨이브당 1회 |

### 4-2. 골드 지출처

| 항목 | 비용 |
|------|------|
| 프라이팬 타워 | 30g |
| 소금 분사기 | 55g |
| 화염 그릴 | 90g |

### 4-3. 밸런스 설계 원칙

- **웨이브 1**: 시작 골드(150g)로 타워 2~3개 배치 가능. 이 타워로 적을 잡아 첫 재료 확보
- **웨이브 2~3**: 재료 서빙으로 추가 타워 1~2개 구매 가능
- **웨이브 4~5**: 효율적 서빙 + 콤보 보너스 필요. 버프 vs 서빙 트레이드오프 중요해짐
- **인내심 기본값**: 30초 → 후반 웨이브일수록 15초까지 감소 (긴장감)

### 4-4. 초기 골드 조정

- `STARTING_GOLD`: 150 → **100** (서빙 수입이 추가되므로 초기 골드 하향)
- 또는 유지(150)하고 테스트 후 조정

---

## 5. 웨이브별 손님 구성

### 5-1. 웨이브-손님 데이터

```javascript
export const WAVE_CUSTOMERS = [
  // 웨이브 1: 쉬운 주문 1명
  {
    wave: 1,
    customers: [
      { dish: 'carrot_soup', patience: 35000, baseReward: 25, tipMultiplier: 1.5 },
    ],
  },
  // 웨이브 2: 2명, 난이도 소폭 상승
  {
    wave: 2,
    customers: [
      { dish: 'carrot_soup', patience: 30000, baseReward: 25, tipMultiplier: 1.5 },
      { dish: 'steak_plate', patience: 35000, baseReward: 55, tipMultiplier: 1.5 },
    ],
  },
  // 웨이브 3: 2명, 고급 요리 등장
  {
    wave: 3,
    customers: [
      { dish: 'steak_plate', patience: 28000, baseReward: 55, tipMultiplier: 1.5 },
      { dish: 'carrot_soup', patience: 25000, baseReward: 25, tipMultiplier: 1.3 },
    ],
  },
  // 웨이브 4: 3명, 복합 요리 등장
  {
    wave: 4,
    customers: [
      { dish: 'carrot_soup', patience: 22000, baseReward: 30, tipMultiplier: 1.3 },
      { dish: 'mixed_platter', patience: 30000, baseReward: 70, tipMultiplier: 1.5 },
      { dish: 'steak_plate', patience: 25000, baseReward: 55, tipMultiplier: 1.3 },
    ],
  },
  // 웨이브 5: 3명, 짧은 인내심
  {
    wave: 5,
    customers: [
      { dish: 'mixed_platter', patience: 25000, baseReward: 70, tipMultiplier: 1.5 },
      { dish: 'steak_plate', patience: 20000, baseReward: 55, tipMultiplier: 1.3 },
      { dish: 'carrot_soup', patience: 18000, baseReward: 30, tipMultiplier: 1.3 },
    ],
  },
];
```

### 5-2. 손님 도착 타이밍

- 각 웨이브의 손님은 웨이브 시작 후 **2초 간격**으로 순차 등장
- 첫 손님은 웨이브 시작 즉시 등장

---

## 6. 듀얼 씬 아키텍처 & UI 레이아웃

### 6-1. 씬 분리 구조

Phaser의 **병렬 씬 실행**(`scene.launch`)을 활용하여 전투와 레스토랑을 독립 씬으로 분리한다.

```
┌─────────────────────────────────────────────────┐
│                  Phaser Game                     │
│                                                  │
│  ┌─────────────────────────────────────────┐     │
│  │  GameScene (전투)                        │     │
│  │  - 맵 그리드 + 경로 렌더링              │     │
│  │  - 타워 배치/발사                        │     │
│  │  - 적 스폰/이동/처치                     │     │
│  │  - 재료 드롭/수거                        │     │
│  │  - HUD (골드, 웨이브, 목숨, 콤보)        │     │
│  │  - 타워 선택 UI                          │     │
│  └─────────────────────────────────────────┘     │
│                    ↕ 이벤트 버스                   │
│  ┌─────────────────────────────────────────┐     │
│  │  RestaurantScene (레스토랑)              │     │
│  │  - 손님 슬롯 3개 (주문/인내심/서빙)      │     │
│  │  - 재료 보유량 표시                       │     │
│  │  - 서빙 레시피 버튼 3종                   │     │
│  │  - 버프 레시피 버튼 3종                   │     │
│  │  - CustomerManager 소유                   │     │
│  └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

#### 씬 생명주기

```javascript
// GameScene.create() 내부
this.scene.launch('RestaurantScene', { gameScene: this });
// → RestaurantScene이 병렬 실행, 동시에 렌더링

// 게임 오버/승리 시
this.scene.stop('RestaurantScene');
this.scene.start('GameOverScene', { ... });
```

#### 씬 간 통신: 공유 EventEmitter

두 씬은 직접 참조 대신 **공유 이벤트 버스**를 통해 느슨하게 결합한다.

```javascript
// js/events/GameEventBus.js — 새 파일
import Phaser from 'phaser';
export const GameEventBus = new Phaser.Events.EventEmitter();
```

| 방향 | 이벤트 | 데이터 |
|------|--------|--------|
| Game → Restaurant | `ingredient_collected` | `{ type, count, isFresh }` |
| Game → Restaurant | `wave_started` | `{ waveNum }` |
| Game → Restaurant | `game_over` | `{ isVictory }` |
| Restaurant → Game | `gold_earned` | `{ amount, source }` |
| Restaurant → Game | `buff_activated` | `{ effectType, effectValue, duration }` |
| Restaurant → Game | `combo_changed` | `{ count }` |

> **설계 원칙**: GameScene은 RestaurantScene의 존재를 모른다. 골드 변경은 이벤트로만 전달.

### 6-2. 화면 구조 (360×640)

```
┌────────────────────────────────────┐  0
│  HUD (50px)                  [Game]│
│  🪙 100  웨이브 1/5  ❤️ 10  🔥×3  │
├────────────────────────────────────┤  50
│                              [Game]│
│        게임 맵 영역 (370px)        │
│                                    │
│   타워 + 적 + 경로 + 재료 드롭     │
│                                    │
│  ┌────┬────┬────┐                 │
│  │ 🍳 │ 🧂 │ 🔥 │  ← 타워 선택   │
│  └────┴────┴────┘                 │
├════════════════════════════════════┤  420  ← 씬 경계
│  손님 대기존 (100px)    [Restaurant]│
│  ┌──────────┬──────────┬────────┐ │
│  │🍲 당근수프 │🥩 스테이크│  빈슬롯 │ │
│  │████░░░░  │██░░░░░░ │  ---   │ │
│  │ 28s      │ 12s     │        │ │
│  │ [서빙!]  │ [서빙!] │        │ │
│  └──────────┴──────────┴────────┘ │
├────────────────────────────────────┤  520
│  주방 패널 (120px)      [Restaurant]│
│  ┌─────────────┬──────────────┐   │
│  │  재료 보유   │  요리 메뉴    │   │
│  │  🥕 ×3      │ ── 서빙 ──   │   │
│  │  🥩 ×2      │ 수프  정식    │   │
│  │             │ 플래터       │   │
│  │             │ ── 버프 ──   │   │
│  │             │ 스튜  스테이크│   │
│  └─────────────┴──────────────┘   │
└────────────────────────────────────┘  640
```

### 6-3. 씬별 영역 상세

#### GameScene 영역 (0~420px)

| 영역 | Y범위 | 내용 | 변경 |
|------|-------|------|------|
| HUD | 0~50px | 골드, 웨이브, 목숨 | 콤보 카운터 추가 |
| 맵 | 50~380px | 그리드 + 경로 + 전투 | 행수 축소 (11→8행, 330px) |
| 타워 선택 | 380~420px | 타워 3종 가로 버튼 | 기존 하단 UI에서 이동 |

- 맵 영역: `GAME_AREA_HEIGHT = 330px` → `GRID_ROWS = 8`
- 타워 선택 바를 맵 바로 아래에 배치하여 **맵 터치 → 타워 배치** 동선 최적화
- 경로 웨이포인트를 8행에 맞게 재조정

#### RestaurantScene 영역 (420~640px)

| 영역 | Y범위 | 내용 |
|------|-------|------|
| 손님 대기존 | 420~520px | 손님 슬롯 3개 (가로 배치, 각 ~115px) |
| 주방 패널 | 520~640px | 좌측 재료 보유량 + 우측 요리 메뉴 (서빙/버프) |

**손님 슬롯 구조** (115×95px):
```
┌─────────────┐
│ 🍲 당근 수프  │  요리 아이콘 + 이름 (14px)
│ ██████░░░░  │  인내심 게이지 (초록→노랑→빨강)
│   28초       │  남은 시간 (12px)
│  [ 서빙! ]   │  서빙 버튼 (재료 충족 시 활성화)
└─────────────┘
```

**주방 패널 구조** (360×120px):
- 좌측(0~160px): 재료 보유량 (아이콘 + 수량)
- 우측(160~360px): 요리 메뉴
  - 서빙 레시피 3종 (탭 → 즉시 조리+서빙)
  - 구분선
  - 버프 레시피 3종 (탭 → 타워 버프 발동)
  - 재료 부족 시 해당 버튼 비활성(회색)

### 6-4. config.js 변경

```javascript
// ── Phase 2 레이아웃 ──
export const HUD_HEIGHT = 50;
export const TOWER_BAR_HEIGHT = 40;        // 타워 선택 바
export const GAME_AREA_HEIGHT = 330;        // 맵 영역 (8행 × 40px + 여유)
export const RESTAURANT_Y = 420;            // RestaurantScene 시작 Y
export const CUSTOMER_ZONE_HEIGHT = 100;    // 손님 대기존
export const KITCHEN_PANEL_HEIGHT = 120;    // 주방 패널

// GameScene 총 높이: 50 + 330 + 40 = 420px
// RestaurantScene 총 높이: 100 + 120 = 220px
// 합계: 420 + 220 = 640px

// 그리드 (맵 영역 내)
export const CELL_SIZE = 40;
export const GRID_COLS = 9;   // 360 / 40
export const GRID_ROWS = 8;   // 330 / 40 ≈ 8 (320px 사용, 10px 여유)
```

> **경로 재설정 필요**: 기존 11행 경로를 8행에 맞게 웨이포인트 재조정.
> 지그재그 패턴은 유지하되 한 단계 줄인다 (3턴 → 2턴).

---

## 7. 데이터 구조 변경

### 7-1. gameData.js 변경

```javascript
// ── 적 타입 변경 ──
// goldReward 제거 (또는 0)
export const ENEMY_TYPES = {
  carrot_goblin: {
    id: 'carrot_goblin',
    nameKo: '당근 고블린',
    hp: 80,
    speed: 90,
    // goldReward 삭제
    ingredient: 'carrot',
  },
  meat_ogre: {
    id: 'meat_ogre',
    nameKo: '고기 오우거',
    hp: 220,
    speed: 45,
    // goldReward 삭제
    ingredient: 'meat',
  },
};

// ── 서빙 레시피 추가 ──
export const SERVING_RECIPES = [
  {
    id: 'carrot_soup',
    nameKo: '당근 수프',
    ingredients: { carrot: 1 },
    baseReward: 20,
    icon: '🍲',
    color: 0xffa500,
  },
  {
    id: 'steak_plate',
    nameKo: '스테이크 정식',
    ingredients: { meat: 2 },
    baseReward: 50,
    icon: '🥩',
    color: 0x8b0000,
  },
  {
    id: 'mixed_platter',
    nameKo: '혼합 플래터',
    ingredients: { carrot: 2, meat: 1 },
    baseReward: 65,
    icon: '🍽️',
    color: 0xcd853f,
  },
];

// ── 버프 레시피 (기존 RECIPES 유지) ──
export const BUFF_RECIPES = [
  // ... 기존 3종 동일
];

// ── 웨이브별 손님 데이터 ──
export const WAVE_CUSTOMERS = [
  // ... 섹션 5-1 참조
];
```

### 7-2. 새 파일

| 파일 | 클래스/모듈 | 소속 씬 | 역할 |
|------|------------|---------|------|
| `js/events/GameEventBus.js` | `GameEventBus` | 공유 | 씬 간 이벤트 통신 버스 |
| `js/scenes/RestaurantScene.js` | `RestaurantScene` | 독립 | 레스토랑 씬 — 손님/서빙/버프 통합 |
| `js/managers/CustomerManager.js` | `CustomerManager` | Restaurant | 손님 생성, 인내심, 서빙, 콤보 |
| `js/ui/CustomerZoneUI.js` | `CustomerZoneUI` | Restaurant | 손님 슬롯 3개 렌더링 |
| `js/ui/KitchenPanelUI.js` | `KitchenPanelUI` | Restaurant | 재료창 + 서빙/버프 레시피 버튼 |

### 7-3. 기존 파일 변경

| 파일 | 변경 내용 |
|------|----------|
| `config.js` | 듀얼 씬 레이아웃 상수, 맵 8행 재조정, 경로 웨이포인트 재설정 |
| `gameData.js` | `SERVING_RECIPES`, `WAVE_CUSTOMERS` 추가, `ENEMY_TYPES` goldReward 제거 |
| `GameScene.js` | RestaurantScene launch, GameEventBus 통신, 골드 이벤트 수신, 타워바 이동 |
| `GameUI.js` | 하단 패널 제거 (RestaurantScene으로 이관), HUD 콤보 카운터 추가 |
| `CookingStation.js` | RestaurantScene 소속으로 이동, 서빙 함수 추가 |
| `IngredientManager.js` | GameEventBus를 통해 재료 변동을 RestaurantScene에 알림 |
| `main.js` | Phaser config scene 배열에 `RestaurantScene` 추가 |

---

## 8. RestaurantScene 설계

### 8-1. RestaurantScene 생명주기

```javascript
/**
 * @fileoverview 레스토랑 씬.
 * GameScene과 병렬 실행. 손님 관리, 서빙, 버프 요리를 처리한다.
 * 화면 하단 220px (Y: 420~640) 영역을 소유한다.
 */
export class RestaurantScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RestaurantScene' });
  }

  /**
   * @param {{ gameScene: GameScene }} data - GameScene 참조 (초기 설정용)
   */
  create(data) {
    // 카메라를 하단 220px 영역에만 렌더링
    this.cameras.main.setViewport(0, 420, 360, 220);
    this.cameras.main.setScroll(0, 0);

    // 매니저
    this.customerManager = new CustomerManager(this);
    this.cookingStation = new CookingStation(this);

    // UI
    this.customerZoneUI = new CustomerZoneUI(this);
    this.kitchenPanelUI = new KitchenPanelUI(this);

    // GameEventBus 이벤트 리스닝
    GameEventBus.on('ingredient_collected', this._onIngredientCollected, this);
    GameEventBus.on('wave_started', this._onWaveStarted, this);
    GameEventBus.on('game_over', this._onGameOver, this);
  }

  /** 웨이브 시작 → 손님 배치 */
  _onWaveStarted({ waveNum }) {
    this.customerManager.spawnCustomers(waveNum - 1);
  }

  /** 재료 수거 → 보유량 UI 갱신 */
  _onIngredientCollected({ type, count }) {
    this.kitchenPanelUI.updateIngredients();
  }

  /** 서빙 버튼 탭 → 골드 이벤트 발신 */
  _onServe(slotIndex) {
    const result = this.customerManager.serve(slotIndex);
    if (result.success) {
      GameEventBus.emit('gold_earned', {
        amount: result.totalGold,
        source: 'serving',
      });
      GameEventBus.emit('combo_changed', {
        count: this.customerManager.comboCount,
      });
    }
  }

  update(time, delta) {
    this.customerManager.update(delta);
  }

  shutdown() {
    GameEventBus.off('ingredient_collected', this._onIngredientCollected, this);
    GameEventBus.off('wave_started', this._onWaveStarted, this);
    GameEventBus.off('game_over', this._onGameOver, this);
    this.customerManager?.destroy();
    this.customerZoneUI?.destroy();
    this.kitchenPanelUI?.destroy();
  }
}
```

### 8-2. CustomerManager 설계

```javascript
/**
 * @fileoverview 손님 매니저.
 * RestaurantScene 소속. 손님 생성, 인내심 타이머, 서빙 처리를 관리한다.
 */
export class CustomerManager {
  constructor(scene) {
    this.scene = scene;
    this.slots = [null, null, null];  // 최대 3슬롯
    this.waitQueue = [];              // 대기 손님
    this.comboCount = 0;              // 연속 서빙 콤보
    this.totalServed = 0;
    this.totalLeft = 0;               // 퇴장 손님 수
  }

  /**
   * 웨이브 시작 시 손님 배치.
   * @param {number} waveIndex - 0-based
   */
  spawnCustomers(waveIndex) { /* ... */ }

  /**
   * 손님에게 서빙 시도.
   * @param {number} slotIndex - 0~2
   * @returns {{ success, totalGold, baseReward, tip, comboBonus }|{ success: false }}
   */
  serve(slotIndex) { /* ... */ }

  /**
   * 매 프레임 - 인내심 감소 + 퇴장 처리.
   * @param {number} delta
   */
  update(delta) { /* ... */ }

  /**
   * 콤보 보너스 배율.
   * @returns {number}
   */
  getComboMultiplier() {
    if (this.comboCount >= 8) return 1.50;
    if (this.comboCount >= 5) return 1.25;
    if (this.comboCount >= 3) return 1.10;
    return 1.0;
  }
}
```

---

## 9. 이벤트 흐름 (듀얼 씬)

### 9-1. 이벤트 분류

씬 내부 이벤트(`scene.events`)와 씬 간 이벤트(`GameEventBus`)를 분리한다.

#### GameEventBus (씬 간 통신)

| 이벤트 | 발신 씬 | 수신 씬 | 데이터 |
|--------|---------|---------|--------|
| `ingredient_collected` | Game | Restaurant | `{ type, count, isFresh }` |
| `wave_started` | Game | Restaurant | `{ waveNum }` |
| `wave_cleared` | Game | Restaurant | `{ waveNum }` |
| `game_over` | Game | Restaurant | `{ isVictory, score }` |
| `gold_earned` | Restaurant | Game | `{ amount, source }` |
| `buff_activated` | Restaurant | Game | `{ effectType, effectValue, duration }` |
| `combo_changed` | Restaurant | Game | `{ count }` |

#### 씬 내부 이벤트 (scene.events)

| 이벤트 | 씬 | 발신 | 수신 |
|--------|-----|------|------|
| `enemy_died` | Game | Enemy | GameScene |
| `enemy_reached_base` | Game | Enemy | GameScene |
| `customer_arrived` | Restaurant | CustomerManager | CustomerZoneUI |
| `customer_served` | Restaurant | CustomerManager | CustomerZoneUI, KitchenPanelUI |
| `customer_left` | Restaurant | CustomerManager | CustomerZoneUI |

### 9-2. 서빙 처리 시퀀스 (크로스 씬)

```
[RestaurantScene]
1. 플레이어가 손님 슬롯의 [서빙!] 버튼 탭
2. RestaurantScene._onServe(slotIndex) 호출
3. CustomerManager.serve(slotIndex) 호출
4. 재료 충족 확인 → IngredientManager.consume(recipe.ingredients)
5. 골드 계산: baseReward × tipGrade × comboMultiplier
6. comboCount++
7. scene.events.emit('customer_served', { slotIndex, gold })
8. GameEventBus.emit('gold_earned', { amount, source: 'serving' })
9. GameEventBus.emit('combo_changed', { count })

[GameScene]
10. GameEventBus.on('gold_earned') → this.gold += amount
11. GameEventBus.on('combo_changed') → HUD 콤보 카운터 갱신
```

---

## 10. 구현 순서 (서브 태스크)

### Step 1: 인프라 — 이벤트 버스 & 설정 변경
- [ ] `GameEventBus.js` 생성 — 공유 이벤트 이미터
- [ ] `config.js` — 듀얼 씬 레이아웃 상수, 맵 8행 재조정
- [ ] `config.js` — 경로 웨이포인트 8행용 재설정 (2턴 지그재그)
- [ ] `gameData.js` — `SERVING_RECIPES`, `WAVE_CUSTOMERS` 추가, `goldReward` 제거

### Step 2: RestaurantScene 기본 골격
- [ ] `RestaurantScene.js` — 씬 등록, 카메라 뷰포트(420~640), 생명주기
- [ ] `main.js` — scene 배열에 RestaurantScene 추가
- [ ] GameScene에서 `scene.launch('RestaurantScene')` 호출
- [ ] 두 씬 병렬 렌더링 확인 (빈 영역이라도)

### Step 3: CustomerManager 구현
- [ ] `CustomerManager.js` — 손님 생성, 인내심 타이머, 서빙 로직, 콤보 시스템
- [ ] GameEventBus `wave_started` 수신 → 손님 스폰
- [ ] 씬 내부 이벤트 (`customer_arrived`, `customer_served`, `customer_left`)

### Step 4: RestaurantScene UI
- [ ] `CustomerZoneUI.js` — 손님 슬롯 3개, 인내심 게이지, 서빙 버튼
- [ ] `KitchenPanelUI.js` — 재료 보유량 + 서빙/버프 레시피 버튼
- [ ] CookingStation → RestaurantScene 소속으로 이관

### Step 5: GameScene 적응
- [ ] GameScene — GameEventBus 이벤트 발신 (ingredient_collected, wave_started)
- [ ] GameScene — `gold_earned` 이벤트 수신 → 골드 갱신
- [ ] GameScene — `combo_changed` 이벤트 수신 → HUD 콤보 표시
- [ ] GameScene — 적 처치 시 골드 직접 지급 제거
- [ ] GameUI — 하단 패널(재료창/조리소) 제거, 타워 선택 바 맵 아래로 이동
- [ ] 게임 오버/승리 시 `scene.stop('RestaurantScene')` 처리

### Step 6: 밸런스 테스트
- [ ] 웨이브 1~5 전체 플레이 테스트
- [ ] 골드 수입/지출 밸런스 확인
- [ ] 인내심 타이밍 조정
- [ ] 콤보 보너스 적정성 확인
- [ ] 씬 전환(게임오버/재시작) 시 리소스 누수 확인

---

## 11. Phase 3 확장 고려사항

Phase 2에서 도입된 시스템의 Phase 3 확장 방향:

| 항목 | Phase 3 확장 |
|------|-------------|
| **아이소메트릭 뷰** | 직교 탑뷰 → 아이소메트릭 다이아몬드 그리드. 좌표 변환, 렌더링, depth sorting, 터치 히트박스, 스프라이트 에셋 전면 교체 |
| 새 재료 | 해산물, 향신료, 과일 → 적 3~4종 추가 |
| 새 레시피 | 서빙 + 버프 각 3종 추가 (총 12종) |
| 조리 시간 | 즉시 요리 → 3~10초 조리 시간 도입 |
| VIP 손님 | 2배 보상 + 특수 주문 (레어 레시피) |
| 평판 시스템 | 손님 퇴장 횟수 → 평판 감소 → 스테이지 랭크 영향 |
| 셰프 캐릭터 | 패시브: 특정 요리 자동 조리, 팁 보너스 |
| 배달 타워 | 맵 내 재료 자동 수거 + 조리소 자동 운반 |

### Phase 3 아이소메트릭 전환 사전 준비 (Phase 2에서 고려)

Phase 2 구현 시 아이소메트릭 전환을 수월하게 하기 위한 설계 원칙:

1. **좌표 변환 함수 중앙화**: `cellToWorld()`, `worldToCell()`을 Phase 2에서도 반드시 사용. Phase 3에서 이 함수만 교체하면 전체 전환 가능.
2. **렌더링과 로직 분리**: 타워/적/경로의 논리 좌표(col, row)와 렌더링 좌표(px)를 분리 유지.
3. **듀얼 씬 이점**: RestaurantScene은 아이소메트릭 전환과 무관. GameScene만 교체하면 된다.

---

## 12. 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| 맵 영역 축소(470→330px)로 게임이 답답해질 수 있음 | 경로를 2턴 지그재그로 단순화하여 8행에 최적화. 필요 시 CELL_SIZE 36px 검토 |
| 서빙 조작이 TD 조작과 충돌 | **씬 분리로 해결** — 터치 영역이 물리적으로 분리 (맵=0~420, 레스토랑=420~640) |
| 씬 간 상태 동기화 버그 | GameEventBus 단일 경로로 통신. 이벤트 리스너 shutdown 시 반드시 해제 |
| 경제 밸런스가 어려울 수 있음 | 첫 테스트는 넉넉한 보상으로 시작 → 점진적 하향 조정 |
| 재료 부족 → 골드 부족 → 타워 구매 불가 → 막힘 | 웨이브 클리어 보너스(15g 고정) + 긴급 골드(재료 직접 판매 10g/개) 안전장치 |
| 손님 퇴장이 너무 빈번하면 스트레스 | 인내심 기본값 넉넉하게 설정(30초), 후반에만 압박 |
| RestaurantScene 리소스 누수 | shutdown()에서 GameEventBus 리스너 + UI 오브젝트 일괄 정리. 재시작 테스트 필수 |
