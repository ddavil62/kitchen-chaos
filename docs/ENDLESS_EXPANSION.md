# Kitchen Chaos — 엔드리스 모드 확장 기획서

> 작성일: 2026-04-19
> 기준: Phase 54 완료
> 대상 Phase: 55-2 / 55-3 / 55-4

---

## 현황 요약

Phase 54 기준 엔드리스 모드는 다음 상태이다.

| 항목 | 현황 |
|------|------|
| 적 풀 | 그룹1+2 23종 (POOL_TIER_1~5) |
| 보스 풀 | 그룹1+2 9종 |
| 유랑 미력사 | ServiceScene 534라인에서 `if (this.isEndless) return;` 차단 |
| 특수 이벤트 | 없음 |
| 정화 임무 | 없음 |
| 배경 테마 | floor_hall_endless / wall_back_endless 단일 고정 |
| 엔드리스 업적 | 2개 (endless_wave20, endless_wave50) |
| 세이브 버전 | v20 |

---

## Phase 55-2: 그룹3 적/보스 통합

### 개요

- visual_change: none
- pipeline: quick
- 수정 파일: `kitchen-chaos/js/managers/EndlessWaveGenerator.js` 1개

### POOL_TIER_6 구성 (웨이브 31+)

그룹3 일반 적 13종 중 12종을 POOL_TIER_6에 편입한다.

```js
/** 31+ 웨이브 추가 적 (그룹3: 인도·멕시칸·디저트 적) */
const POOL_TIER_6 = [
  'curry_djinn', 'naan_golem', 'incense_specter', 'spice_elemental', 'masala_guide',
  'taco_bandit', 'burrito_juggernaut', 'cactus_wraith', 'luchador_ghost',
  'candy_soldier', 'cake_witch', 'macaron_knight',
];
```

**sugar_specter 제외 이유:**
`sugar_specter`는 Phase 37에서 그룹3 일반 적으로 추가되었으나, `sugar_specter_mini`는 24장 보스 `queen_of_taste`의 분열 소환체이다. `sugar_specter_mini`는 이미 Phase 47-3에서 `sugar_specter_mini: isMini` 플래그로 별도 처리되어 ENEMY_IDS에 등록되지 않았고, EndlessWaveGenerator는 `ENEMY_TYPES`에서 직접 조회하므로 누락 시 `if (!baseData) continue`로 안전하게 스킵된다. 단, `sugar_specter`(소문자, 일반 적)는 POOL_TIER_6에 포함해도 무방하다.

최종 확정 12종:
`curry_djinn`, `naan_golem`, `incense_specter`, `spice_elemental`, `masala_guide`, `taco_bandit`, `burrito_juggernaut`, `cactus_wraith`, `luchador_ghost`, `candy_soldier`, `cake_witch`, `macaron_knight`

### BOSS_POOL 확장

기존 9종에 그룹3 보스 3종을 추가하여 12종으로 확장한다.

```js
const BOSS_POOL = [
  // 그룹1
  'pasta_boss', 'dragon_ramen', 'seafood_kraken',
  'lava_dessert_golem', 'master_patissier', 'cuisine_god',
  // 그룹2
  'sake_oni', 'sake_master', 'dragon_wok',
  // 그룹3 (신규)
  'maharaja', 'el_diablo_pepper', 'queen_of_taste',
];
```

**queen_of_taste 3페이즈 처리 방식:**
`queen_of_taste`는 캠페인(24-6)에서 3페이즈(Phase 1/2/3)로 등장한다. 엔드리스 모드에서는 별도 페이즈 연출 없이 **BOSS_POOL에서 단일 유닛으로 랜덤 선택**되며, `ENEMY_TYPES['queen_of_taste']`의 기본 스탯 그대로 적용한다(`queen_of_taste_2`, `queen_of_taste_3`는 포함하지 않는다). 이는 엔드리스가 웨이브당 1보스 구조이므로 페이즈 전환 로직이 없기 때문이다. 향후 보스 페이즈 연출이 필요할 경우 별도 Phase에서 구현한다.

### 웨이브 구간 테이블 (누적 풀)

| 웨이브 구간 | 활성 적 풀 (누적) | 보스 풀 |
|------------|-----------------|--------|
| 1~5 | TIER_1 (5종) | BOSS_POOL 전체 |
| 6~10 | TIER_1~2 (8종) | BOSS_POOL 전체 |
| 11~15 | TIER_1~3 (14종) | BOSS_POOL 전체 |
| 16~20 | TIER_1~4 (16종) | BOSS_POOL 전체 |
| 21~30 | TIER_1~5 (26종) | BOSS_POOL 전체 |
| 31+ | TIER_1~6 (38종) | BOSS_POOL 전체 |

### 구현 방법

`_getEnemyPool(waveNumber)` 함수에 1행 추가:

```js
static _getEnemyPool(waveNumber) {
  let pool = [...POOL_TIER_1];
  if (waveNumber >= 6)  pool = pool.concat(POOL_TIER_2);
  if (waveNumber >= 11) pool = pool.concat(POOL_TIER_3);
  if (waveNumber >= 16) pool = pool.concat(POOL_TIER_4);
  if (waveNumber >= 21) pool = pool.concat(POOL_TIER_5);
  if (waveNumber >= 31) pool = pool.concat(POOL_TIER_6); // 신규
  return pool;
}
```

---

## Phase 55-3: 미력 폭풍 + 유랑 미력사 + 정화 임무

### 개요

- visual_change: ui
- pipeline: full
- 수정 파일:
  - `kitchen-chaos/js/scenes/ServiceScene.js` — 유랑 미력사 차단 제거 + 엔드리스 확률 보정
  - `kitchen-chaos/js/scenes/EndlessScene.js` — 폭풍 이벤트 + 임무 연동
  - `kitchen-chaos/js/managers/EndlessMissionManager.js` — 신규 생성

---

### 유랑 미력사 엔드리스 지원

**수정 위치:** `ServiceScene.js` `_scheduleMireukTraveler()` 함수 (534라인)

**현재 코드:**
```js
if (this.isEndless) return; // 엔드리스는 현재 미지원 (TODO)
```

**변경 후:**
```js
// 엔드리스 모드에서는 낮은 확률(8%)로 등장 허용
const spawnChance = this.isEndless ? 0.08 : 0.16;
if (Math.random() >= spawnChance) return;
```

- 기존 `if (Math.random() >= 0.16) return;` 라인도 `spawnChance`로 통합
- 엔드리스 등장 확률: 8% (캠페인 16%의 절반)
- 등장 딜레이: 60~90초 그대로 유지
- 등장 조건 나머지(isSeason2, chapter < 7)는 isEndless 모드에서 조건 없이 통과시킨다. 구체적으로 isEndless이면 season2/chapter 체크를 건너뛴다:

```js
_scheduleMireukTraveler() {
  if (!this.isEndless) {
    const saveData = SaveManager.load();
    const isSeason2 = !!saveData.season2Unlocked;
    if (!isSeason2 && this.chapter < 7) return;
  }

  const spawnChance = this.isEndless ? 0.08 : 0.16;
  if (Math.random() >= spawnChance) return;

  const delayMs = Phaser.Math.Between(60000, 90000);
  this.time.delayedCall(delayMs, () => {
    if (this.isServiceOver || this.isPaused || this._mireukSpawned) return;
    this._spawnMireukTraveler();
  });
}
```

---

### 미력 폭풍의 눈 이벤트

**발동 조건:** `waveNumber % 15 === 0` (웨이브 15, 30, 45, 60 ...)

**효과 (발동부터 해당 웨이브 종료까지):**
- 모든 적 HP: 기본 대비 ×0.7 (= `hpMultiplier * 0.7`)
- 모든 적 이동속도: 기본 대비 ×0.8 (= `speedMultiplier * 0.8`)
- 미력의 정수 드롭 배율: ×2 (적 처치 시 정수 드롭이 있다면 2배. 현재 적 처치 정수 드롭 로직이 없다면 폭풍 보상으로만 처리)

**보상 (웨이브 클리어 시):**
- 미력의 정수 지급량 = `20 + Math.floor(waveNumber / 15) * 10`
  - 웨이브 15: +20개
  - 웨이브 30: +30개
  - 웨이브 45: +40개
  - 웨이브 60: +50개 (최대 캡 50개)
- `SaveManager.addMireukEssence(amount)` 호출

**VFX:**
- 화면 전체: 보라색(`0x9900ff`) 오버레이 파티클, 투명도 0.15, 폭풍 지속 내내 유지
- 웨이브 시작 시: `this.vfx.screenFlash(0x9900ff, 0.6, 500)` 호출
- 보상 지급 시: `this.vfx.screenFlash(0xffd700, 0.4, 400)` 골드 플래시
- HUD에 "미력 폭풍의 눈" 텍스트 표시 (폭풍 웨이브 지속 중)

**EndlessScene 구현 위치:**
- `_prepareEndlessWave(waveNumber)` 내부에서 `this._isStormWave` 플래그 설정
- `_onWaveStarted(waveNum)` override에서 폭풍 이펙트 발동
- `_onEndlessWaveCleared()` 내부에서 보상 지급 및 HUD 복원

```js
// _prepareEndlessWave 내 추가
this._isStormWave = (waveNumber % 15 === 0);
if (this._isStormWave) {
  // hpMultiplier, speedMultiplier를 0.7/0.8 보정하여 waveDef 재계산
}
```

```js
// _onWaveStarted 내 추가
if (this._isStormWave) {
  this._showMessage('미력 폭풍의 눈!\n적이 약해지고, 정수가 2배 드롭됩니다!', 3000);
  this.vfx.screenFlash(0x9900ff, 0.6, 500);
  this._stormOverlay = this.add.rectangle(
    GAME_WIDTH / 2, 320, GAME_WIDTH, 640, 0x9900ff, 0.12
  ).setDepth(999);
}
```

```js
// _onEndlessWaveCleared 내 추가
if (this._isStormWave) {
  const bonus = Math.min(50, 20 + Math.floor(this.endlessWave / 15) * 10);
  SaveManager.addMireukEssence(bonus);
  this._showMessage(`폭풍 정화 완료!\n미력의 정수 +${bonus}`, 2500);
  this.vfx.screenFlash(0xffd700, 0.4, 400);
  if (this._stormOverlay) { this._stormOverlay.destroy(); this._stormOverlay = null; }
}
```

---

### 끝없는 정화 임무 (EndlessMissionManager)

신규 파일: `kitchen-chaos/js/managers/EndlessMissionManager.js`

매 웨이브 시작 시 4종 중 1개가 무작위로 활성화된다 (보스 웨이브 및 폭풍 웨이브 제외).

#### 임무 4종 정의

| 임무 ID | 이름 | 조건 | 보상 |
|---------|------|------|------|
| `mission_speed_kill` | 신속 처단 | 보스 처치를 30초 이내에 완료 | 재료 3종 각 1개 랜덤 지급 |
| `mission_no_leak` | 완벽 방어 | 해당 웨이브에서 라이프 손실 0 | 미력의 정수 +15 |
| `mission_combo` | 연속 처치 | 해당 웨이브에서 10연속 처치 콤보 | 골드 +500 |
| `mission_boss_escort` | 호위대 섬멸 | 보스 웨이브에서 호위 적 전멸 후 보스 처치 | 미력의 정수 +30 |

#### 선택 로직

```js
// 비보스 웨이브: mission_speed_kill 제외 (보스 없음), mission_boss_escort 제외
// 보스 웨이브: mission_no_leak, mission_combo, mission_boss_escort 중 랜덤
// 폭풍 웨이브: 임무 활성화 안 함 (폭풍 이벤트 자체가 보상 제공)
```

#### EndlessMissionManager API

```js
export class EndlessMissionManager {
  /**
   * @param {EndlessScene} scene - 오너 씬 레퍼런스
   */
  constructor(scene) { ... }

  /**
   * 웨이브 시작 시 임무를 선택하고 초기화한다.
   * @param {number} waveNumber
   * @param {boolean} isBossWave
   * @param {boolean} isStormWave
   */
  startMission(waveNumber, isBossWave, isStormWave) { ... }

  /**
   * 적 처치 시 콤보/호위대 카운트 업데이트.
   * @param {object} enemy - 처치된 적 데이터
   */
  onEnemyKilled(enemy) { ... }

  /**
   * 라이프 손실 이벤트 수신.
   */
  onLifeLost() { ... }

  /**
   * 웨이브 종료 시 임무 성공/실패 판정 및 보상 지급.
   * @returns {{ success: boolean, missionId: string, reward: object }}
   */
  evaluateAndReward() { ... }

  /**
   * HUD용 현재 임무 상태 문자열 반환.
   * @returns {string}
   */
  getStatusText() { ... }

  /** 임무 상태 초기화 */
  reset() { ... }
}
```

#### 내부 상태 필드

```js
this._active = false;        // 현재 임무 활성 여부
this._missionId = null;      // 현재 임무 ID
this._comboCount = 0;        // 연속 처치 카운트 (적 사이 누락 시 리셋)
this._lifeLeaked = false;    // 라이프 손실 발생 여부
this._bossKillTime = null;   // 보스 등장 시각 (Date.now())
this._escortKilled = 0;      // 호위대 처치 수
this._escortTotal = 0;       // 호위대 전체 수
```

#### mission_speed_kill 판정

보스가 등장하는 순간 `this._bossKillTime = Date.now()`로 기록 시작. 보스 처치 시:
```js
const elapsed = (Date.now() - this._bossKillTime) / 1000;
const success = elapsed <= 30;
```

#### mission_no_leak 판정

`onLifeLost()` 호출 시 `this._lifeLeaked = true`. 웨이브 종료 시 `!this._lifeLeaked`이면 성공.

#### mission_combo 판정

`onEnemyKilled()` 호출 시마다 `this._comboCount++`. 적이 경로 탈출(leak)하면 `this._comboCount = 0` 리셋. 최대 카운트가 10 이상이면 성공.

#### mission_boss_escort 판정

`EndlessWaveGenerator.generateWave()`의 보스 웨이브 결과에서 호위 적 수를 `_escortTotal`로 설정. 호위 적 처치마다 `_escortKilled++`. 보스 처치 직전에 `_escortKilled >= _escortTotal` 조건 충족이면 성공.

#### 보상 지급 구현

```js
// mission_speed_kill: 재료 3종 랜덤 (SaveManager.addGiftIngredients 활용)
const ingredientIds = ['carrot', 'meat', 'fish', /* ... 전체 32종 풀에서 랜덤 3종 */];
const picked = pickRandom(ingredientIds, 3);
const gifts = {};
picked.forEach(id => { gifts[id] = 1; });
SaveManager.addGiftIngredients(gifts);

// mission_no_leak:
SaveManager.addMireukEssence(15);

// mission_combo:
SaveManager.setGold(SaveManager.getGold() + 500);

// mission_boss_escort:
SaveManager.addMireukEssence(30);
```

---

### EndlessScene 연동

`EndlessScene`에서 `EndlessMissionManager`를 인스턴스화하고 각 이벤트에 연결한다.

```js
// create()에서
import { EndlessMissionManager } from '../managers/EndlessMissionManager.js';
this._mission = new EndlessMissionManager(this);

// _onWaveStarted() 내
this._mission.startMission(
  this.endlessWave,
  EndlessWaveGenerator.isBossWave(this.endlessWave),
  this._isStormWave
);

// _onEnemyDied() 내
this._mission.onEnemyKilled(enemy);

// 라이프 감소 처리 위치에서 (_onEnemyLeaked 또는 live 감소 부분)
this._mission.onLifeLost();

// _onEndlessWaveCleared() 내
const missionResult = this._mission.evaluateAndReward();
if (missionResult.success) {
  this._showMessage(`임무 성공: ${missionResult.missionId}\n보상 획득!`, 2000);
}
this._mission.reset();

// shutdown()에서
if (this._mission) { this._mission.reset(); this._mission = null; }
```

---

## Phase 55-4: 테마 전환 + 업적 확장

### 개요

- visual_change: none
- pipeline: full
- 수정 파일:
  - `kitchen-chaos/js/scenes/ServiceScene.js` — 엔드리스 배경 테마 분기 추가
  - `kitchen-chaos/js/data/achievementData.js` — 엔드리스 업적 4개 추가
  - `kitchen-chaos/js/managers/AchievementManager.js` — 신규 업적 조건 처리
  - `kitchen-chaos/js/managers/SaveManager.js` — v21 마이그레이션 (3개 필드 추가)

---

### 웨이브 구간별 ServiceScene 배경 테마 전환

엔드리스 모드에서 ServiceScene 진입 시(`isEndless: true`), `endlessWave` 값에 따라 홀 배경을 다르게 적용한다.

**현재 코드 위치:** `ServiceScene.js` 741라인 `_floorKey()`, 757라인 `_wallKey()` 헬퍼 함수

```js
// 현재
if (this.isEndless) return 'floor_hall_endless';
if (this.isEndless) return 'wall_back_endless';
```

**변경 후:**

```js
_floorKey() {
  if (this.isEndless) return ServiceScene._endlessFloorKey(this.endlessWave);
  // ... (기존 챕터별 분기 유지)
}

_wallKey() {
  if (this.isEndless) return ServiceScene._endlessWallKey(this.endlessWave);
  // ... (기존 챕터별 분기 유지)
}

/**
 * 엔드리스 웨이브 구간에 따른 홀 바닥 타일 키 반환.
 * @param {number} wave
 * @returns {string}
 * @private
 */
static _endlessFloorKey(wave) {
  if (wave <= 20) return 'floor_hall_endless';
  if (wave <= 30) return 'floor_hall_izakaya';
  if (wave <= 40) return 'floor_hall_bistro';
  const cycle = Math.floor((wave - 41) / 10) % 3;
  return ['floor_hall_spice', 'floor_hall_cantina', 'floor_hall_dream'][cycle];
}

/**
 * 엔드리스 웨이브 구간에 따른 홀 뒷벽 키 반환.
 * @param {number} wave
 * @returns {string}
 * @private
 */
static _endlessWallKey(wave) {
  if (wave <= 20) return 'wall_back_endless';
  if (wave <= 30) return 'wall_back_izakaya';
  if (wave <= 40) return 'wall_back_bistro';
  const cycle = Math.floor((wave - 41) / 10) % 3;
  return ['wall_back_spice', 'wall_back_cantina', 'wall_back_dream'][cycle];
}
```

**테마 매핑 표:**

| 웨이브 구간 | 바닥 키 | 뒷벽 키 | 세계관 분위기 |
|------------|--------|--------|------------|
| 1~20 | `floor_hall_endless` | `wall_back_endless` | 영구 식란 지대 (기본) |
| 21~30 | `floor_hall_izakaya` | `wall_back_izakaya` | 이자카야 (일식) |
| 31~40 | `floor_hall_bistro` | `wall_back_bistro` | 비스트로 (양식) |
| 41~50 | `floor_hall_spice` | `wall_back_spice` | 향신료 궁전 (인도) |
| 51~60 | `floor_hall_cantina` | `wall_back_cantina` | 칸티나 (멕시칸) |
| 61~70 | `floor_hall_dream` | `wall_back_dream` | 드림랜드 (디저트) |
| 71~80 | `floor_hall_spice` (반복) | `wall_back_spice` | 순환 |
| ... | (41+ 패턴 3종 순환) | | |

**신규 에셋 불필요:** 위 키들은 모두 Phase 51-4(바닥 타일 8종) 및 Phase 53(뒷벽 8종)에서 이미 생성·등록된 에셋이다.

**`endlessWave` 전달 확인:** EndlessScene `_transitionToService()`에서 이미 `endlessWave`를 ServiceScene으로 전달 중이다. ServiceScene `create()`에서 `this.endlessWave = data.endlessWave || 0`으로 저장하면 헬퍼 함수에서 참조 가능하다.

---

### 엔드리스 업적 확장 (6개)

**기존 2개 유지:**

| ID | 조건 | 보상 |
|----|------|------|
| `endless_wave20` | 엔드리스 20웨이브 도달 | 주방 코인 20 |
| `endless_wave50` | 엔드리스 50웨이브 도달 | 골드 1000 |

**신규 4개 추가:**

| ID | 이름 | 설명 | 조건 | 보상 |
|----|------|------|------|------|
| `endless_wave100` | 식란 정복자 | 엔드리스 100웨이브에 도달한다 | `endless_wave`, threshold: 100 | 골드 3000 |
| `endless_storm10` | 폭풍의 화신 | 미력 폭풍의 눈을 10회 클리어한다 | `endless_storm_cleared`, threshold: 10 | 주방 코인 30 |
| `endless_mission30` | 임무의 달인 | 끝없는 정화 임무를 30회 성공한다 | `endless_mission_success`, threshold: 30 | 미력의 정수 50 |
| `endless_no_leak10` | 무결 방어 | 라이프 손실 없이 10웨이브를 연속으로 클리어한다 | `endless_no_leak_streak`, threshold: 10 | 골드 2000 |

**`achievementData.js` 추가 코드:**

```js
// 엔드리스 섹션 끝에 추가
{
  id: 'endless_wave100',
  nameKo: '식란 정복자',
  descKo: '엔드리스 모드에서 100웨이브에 도달한다',
  category: 'endless',
  icon: '👑',
  condition: { type: 'endless_wave', threshold: 100 },
  reward: { gold: 3000 },
},
{
  id: 'endless_storm10',
  nameKo: '폭풍의 화신',
  descKo: '미력 폭풍의 눈을 10회 클리어한다',
  category: 'endless',
  icon: '🌀',
  condition: { type: 'endless_storm_cleared', threshold: 10 },
  reward: { coin: 30 },
},
{
  id: 'endless_mission30',
  nameKo: '임무의 달인',
  descKo: '끝없는 정화 임무를 30회 성공한다',
  category: 'endless',
  icon: '📋',
  condition: { type: 'endless_mission_success', threshold: 30 },
  reward: { mireukEssence: 50 },
},
{
  id: 'endless_no_leak10',
  nameKo: '무결 방어',
  descKo: '라이프 손실 없이 10웨이브를 연속으로 클리어한다',
  category: 'endless',
  icon: '🛡️',
  condition: { type: 'endless_no_leak_streak', threshold: 10 },
  reward: { gold: 2000 },
},
```

---

### SaveManager v21 마이그레이션

**추가 필드 3개:**

```js
// endless 객체 내부에 추가
endless: {
  unlocked: false,
  bestWave: 0,
  bestScore: 0,
  bestCombo: 0,
  lastDailySeed: 0,
  // v21 신규
  stormCount: 0,          // 누적 미력 폭풍의 눈 클리어 횟수
  missionSuccessCount: 0, // 누적 정화 임무 성공 횟수
  noLeakStreak: 0,        // 현재 라이프 손실 없이 연속 클리어 중인 웨이브 수
}
```

**마이그레이션 블록:**

```js
// v20 → v21: 엔드리스 확장 통계 필드 추가 (Phase 55-4)
if (data.version < 21) {
  if (!data.endless) {
    data.endless = { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 };
  }
  data.endless.stormCount          = data.endless.stormCount          ?? 0;
  data.endless.missionSuccessCount = data.endless.missionSuccessCount ?? 0;
  data.endless.noLeakStreak        = data.endless.noLeakStreak        ?? 0;
  data.version = 21;
}
```

**신규 헬퍼 메서드:**

```js
/** 폭풍 클리어 횟수 증가 + 업적 체크 트리거 */
static incrementEndlessStormCount() { ... }

/** 임무 성공 횟수 증가 + 업적 체크 트리거 */
static incrementEndlessMissionSuccess() { ... }

/** noLeakStreak 갱신 (웨이브 종료 시 호출: noLeak=true이면 ++, false이면 0 리셋) */
static updateEndlessNoLeakStreak(noLeak) { ... }
```

---

### AchievementManager 수정

신규 업적 조건 타입 4개를 AchievementManager의 `checkProgress()` 또는 이벤트 핸들러에 추가한다.

| condition.type | 처리 방식 |
|---------------|---------|
| `endless_wave` | 기존 로직 이미 존재 — bestWave 갱신 시 체크. threshold 100 추가만으로 충분 |
| `endless_storm_cleared` | `SaveManager.incrementEndlessStormCount()` 호출 후 `data.endless.stormCount`와 threshold 비교 |
| `endless_mission_success` | `SaveManager.incrementEndlessMissionSuccess()` 호출 후 비교 |
| `endless_no_leak_streak` | `SaveManager.updateEndlessNoLeakStreak(noLeak)` 후 `noLeakStreak`과 비교 |

---

## 구현 파일 요약

| Phase | 파일 | 작업 유형 | 설명 |
|-------|------|----------|------|
| 55-2 | `js/managers/EndlessWaveGenerator.js` | 수정 | POOL_TIER_6 추가, BOSS_POOL 12종 확장, _getEnemyPool 1행 추가 |
| 55-3 | `js/scenes/ServiceScene.js` | 수정 | _scheduleMireukTraveler isEndless 차단 제거, 확률 8% 보정 |
| 55-3 | `js/scenes/EndlessScene.js` | 수정 | 폭풍 이벤트 로직, EndlessMissionManager 연동 |
| 55-3 | `js/managers/EndlessMissionManager.js` | 신규 생성 | 4종 임무 관리, 보상 지급 |
| 55-4 | `js/scenes/ServiceScene.js` | 수정 | _endlessFloorKey/_endlessWallKey 헬퍼, endlessWave 수신 |
| 55-4 | `js/data/achievementData.js` | 수정 | 엔드리스 업적 4개 추가 (총 6개) |
| 55-4 | `js/managers/AchievementManager.js` | 수정 | 신규 조건 타입 3개 처리 추가 |
| 55-4 | `js/managers/SaveManager.js` | 수정 | v21 마이그레이션, endless 필드 3개, 헬퍼 3개 추가 |

---

## 수용 기준 체크리스트

### Phase 55-2
- [ ] POOL_TIER_6 12종이 웨이브 31+ 적 풀에 포함된다
- [ ] BOSS_POOL이 12종(기존 9 + maharaja/el_diablo_pepper/queen_of_taste)이다
- [ ] 웨이브 30에서 그룹3 적이 등장하지 않는다 (웨이브 31+에서만)
- [ ] 웨이브 40 보스 웨이브에서 queen_of_taste가 단일 유닛으로 등장 가능하다
- [ ] `if (!baseData) continue` 방어 코드가 유지된다

### Phase 55-3
- [ ] 엔드리스 ServiceScene에서 유랑 미력사가 8% 확률로 등장한다
- [ ] 웨이브 15/30/45에서 미력 폭풍의 눈 이펙트가 발동한다
- [ ] 폭풍 웨이브 적 HP가 기본의 70%이다
- [ ] 폭풍 클리어 시 미력의 정수가 20/30/40개 지급된다
- [ ] 4종 임무가 조건에 따라 선택적으로 활성화된다
- [ ] 각 임무 보상이 올바르게 지급된다 (재료/정수/골드)
- [ ] 임무 미성공 시 아무 보상도 지급되지 않는다

### Phase 55-4
- [ ] 웨이브 21~30 ServiceScene에서 이자카야 배경이 표시된다
- [ ] 웨이브 31~40에서 비스트로 배경이 표시된다
- [ ] 웨이브 41+에서 spice→cantina→dream 3종이 10웨이브 단위로 순환한다
- [ ] SaveManager SAVE_VERSION이 21이다
- [ ] 기존 세이브(v20)가 v21로 정상 마이그레이션된다
- [ ] 엔드리스 업적이 achievementData.js에 6개 존재한다
- [ ] endless_wave100 조건이 bestWave 100 달성 시 해금된다
- [ ] `reward: { mireukEssence: 50 }` 형식을 AchievementManager가 처리한다

---

## 참고 사항

- `floor_hall_cantina`와 `wall_back_cantina`는 Phase 53 기준 에셋 키 목록에 포함 여부를 SpriteLoader에서 재확인한다. 없을 경우 대체 키 `floor_hall_spice`/`wall_back_spice` 사용.
- 미력의 정수 상한은 현재 999 (SaveManager.addMireukEssence의 `Math.min(999, ...)`). 폭풍/임무 보상 지급 후 상한 초과 시 자동 클램핑된다.
- `endless_mission30` 보상 `{ mireukEssence: 50 }`은 기존 reward 스키마(`{ gold?, coin? }`)에 없는 신규 타입이다. AchievementManager에서 `reward.mireukEssence` 분기를 추가해야 한다.
- ServiceScene에서 `endlessWave`를 받는 라인이 현재 존재하지 않을 수 있다. `create(data)` 내에서 `this.endlessWave = data?.endlessWave || 0;` 추가 필요.
