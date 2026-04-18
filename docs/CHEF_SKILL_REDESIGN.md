# 셰프 스킬 재설계 기획서

> 작성일: 2026-04-18
> Phase: 48-3 산출물
> 연계 시스템: Phase 48-1 (미력의 정수 화폐), Phase 48-2 (유랑 미력사 고용)

---

## 1. 현황 분석

### 1-1. 스토리 셰프 5종 스킬 현황

| 셰프 ID | 패시브 스킬 | 발동 씬 | 액티브 스킬 (채집) | 발동 씬 | 서비스 액티브 스킬 | 발동 씬 |
|---------|-----------|--------|-----------------|--------|----------------|--------|
| petit_chef (꼬마 셰프) | 재료 수거 범위 +30% | GatheringScene | 긴급 배달 — 맵 위 모든 드롭 재료 즉시 수거 (CD: 60s) | GatheringScene | 특급 서비스 — 다음 3명 손님 인내심 최대치 리셋 (CD: 90s) | ServiceScene |
| flame_chef (불꽃 요리사) | 화염 타워 피해 +20% | GatheringScene | 지옥 불꽃 — 전체 적에게 화상 5초 DPS 15 (CD: 90s) | GatheringScene | 화염 조리 — 조리 중인 모든 요리 즉시 완성 (CD: 120s) | ServiceScene |
| ice_chef (얼음 요리장) | CC(둔화/빙결) 지속 +25% | GatheringScene | 블리자드 코스 — 전체 적 3초 빙결 (CD: 120s) | GatheringScene | 시간 동결 — 전체 손님 인내심 10초 정지 (CD: 150s) | ServiceScene |
| yuki_chef (유키) | 조리시간 -20%, ★★★+ 레시피 보상 +15% | 양쪽 모두 | 빙결 처치 — 빙결된 적 전부 즉시 처치 (CD: 90s) | GatheringScene | 정밀 절단 — 다음 5개 요리 조리시간 0 (CD: 90s) | ServiceScene |
| lao_chef (라오) | 도구 공격력 +15%, 재료 드롭률 +10% | GatheringScene | 파워 서지 — 전 도구 5초간 공격력 2배 (CD: 120s) | GatheringScene | 불꽃 웍 — 전 테이블 주문 즉시 완성 (CD: 120s) | ServiceScene |

**현재 구현 상태 요약**

- 스토리 셰프 5종은 모두 `passiveType`, `skillType`(채집 액티브), `serviceSkill`(영업 액티브) 세 가지를 보유한다.
- ChefManager.js에서 두 씬에 걸쳐 메서드가 분산 구현되어 있다.
  - GatheringScene 전용: `getCollectRangeBonus()`, `getGrillDamageBonus()`, `getCCDurationBonus()`, `getTowerDamageBonus()`, `getDropRateBonus()`, `activatePowerSurge()`
  - ServiceScene 전용: `getCookTimeBonus()`, `getPatienceBonus()`, `getGrillRewardBonus()`, `getHighStarRewardBonus()`, `getServiceSkill()`
- `getCookTimeBonus()`는 petit_chef(−15%)와 yuki_chef(−20%)를 동시에 처리하는 예외 메서드다. petit_chef의 passiveDesc에는 조리시간 단축이 기재되지 않아 문서-코드 불일치가 존재한다.

---

## 2. 역할 분리 원칙

### 2-1. 캐릭터 타입별 주 담당 씬

| 캐릭터 타입 | 주 담당 씬 | 역할 |
|-----------|----------|-----|
| 스토리 셰프 (꼬마/불꽃/얼음/유키/라오) | GatheringScene (재료 채집 = 타워 디펜스) | 채집 효율 극대화. 전투 메커닉(도구 피해, CC, 수거, 드롭률) 직접 강화. |
| 유랑 미력사 | ServiceScene (영업) | 영업 효율 극대화. 손님 행동(인내심, 팁, 골드, 특수 손님 상호작용) 직접 강화. |

### 2-2. 기존 serviceSkill의 위치 재정의

스토리 셰프가 ServiceScene에서 사용하는 `serviceSkill`은 **지원 스킬**로 분류한다.

- **지원 스킬의 정의**: 영업을 완전히 대체하거나 영업 자체를 효율화하는 스킬이 아니라, 채집에서 데려온 셰프가 현장에서 보조적으로 발휘하는 순간 대응 능력.
- **유랑 미력사 스킬과의 차이**: 유랑 미력사는 영업 패시브(골드 보너스, 특수 손님 등장 확률, 팁 배율, 조리 속도)를 상시 제공한다. 스토리 셰프 지원 스킬은 쿨다운이 있는 단발 개입이다.
- 두 타입의 스킬이 **같은 수치를 중복 강화하지 않도록** 각 설계 단계에서 확인한다 (아래 2-3 참조).

### 2-3. 이중 강화 방지 원칙

| 영역 | 스토리 셰프 담당 | 유랑 미력사 담당 |
|------|--------------|--------------|
| 조리 시간 단축 | getCookTimeBonus() — 패시브 상시 (petit/yuki) | 미력사는 조리 속도 패시브 보유 가능하나, 배율이 중첩되지 않고 **대체** 적용 (MAX 취득 또는 별도 곱셈 슬롯) |
| 손님 인내심 상시 연장 | ice_chef 패시브 +20% | 미력사가 동일 인내심 패시브 보유 시 → **합산 아닌 독립 슬롯**으로 처리 (아래 2-4 참조) |
| 인내심 순간 조작 (쿨다운) | petit_chef serviceSkill (리셋), ice_chef serviceSkill (10초 정지) | 미력사는 순간 조작보다 상시 패시브로 차별화 |
| 골드/팁 수익 증폭 | flame_chef 그릴 보상 +25% (조리 연동) | 미력사 전담. 스토리 셰프는 골드 직접 배율 없음 |
| 특수 손님 등장 확률 | 없음 (스토리 셰프는 영향 없음) | 미력사 전담 |
| 채집 도구 피해/CC | 스토리 셰프 전담 | 미력사는 GatheringScene 효과 없음 |

### 2-4. 동시 활성화 시 버프 처리 원칙

스토리 셰프(1명)와 유랑 미력사(1~4명)가 동시에 활성화될 때의 버프 적용 규칙:

1. **같은 종류의 패시브 배율**: 스토리 셰프 값과 미력사 값을 **독립 계수로 곱한다**.
   - 예: 조리시간 — `cookTime × chefBonus × mireukBonus`
   - 독립 곱셈이므로 두 버프가 각각 의미를 유지한다.
2. **쿨다운 스킬(서비스 액티브)**: 스토리 셰프 serviceSkill과 미력사 스킬은 별개 버튼/슬롯으로 독립 발동. 같은 효과(예: 인내심 정지)를 동시에 발동해도 덮어쓰기가 아닌 가장 유리한 값으로 처리한다.
3. **유랑 미력사 간 중복 스킬**: 같은 타입의 패시브를 가진 미력사가 2명 이상 고용될 경우, 동일 종류는 **합산이 아닌 상한선 캡** 적용 (Phase 48-2 설계에서 상한 수치 확정).

---

## 3. 스토리 셰프 스킬 역할 명확화 및 미세 조정

Phase 48-3은 수치 대폭 변경보다 **역할 경계 명확화**에 집중한다. 코드 변경은 Phase 48-4 이후에서 구현한다.

### 3-1. 현황 문제점

| 셰프 | 문제점 | 분류 |
|------|-------|-----|
| petit_chef | passiveDesc에 "재료 수거 범위 +30%"만 기재되어 있으나 코드(getCookTimeBonus)에서 조리시간 −15% 패시브도 적용 중. 문서-코드 불일치. | 문서 오류 |
| flame_chef | 그릴 보상 +25% 패시브가 chefData.js의 passiveDesc에 없고 ChefManager에만 존재. passiveDesc는 "화염 타워 피해 +20%"만 기재. | 문서 오류 |
| ice_chef | 손님 인내심 +20% 패시브(ChefManager.getPatienceBonus)가 chefData.js에 명시되지 않음. passiveDesc는 "CC 지속 +25%"만 기재. | 문서 오류 |
| yuki_chef | passiveDesc에 "조리시간 -20%, ★★★+ 레시피 보상 +15%"로 정확히 기재. 코드와 일치. | 정상 |
| lao_chef | passiveDesc에 "도구 공격력 +15%, 재료 드롭률 +10%"로 기재. 코드와 일치. | 정상 |

### 3-2. 수정 방향 (chefData.js passiveDesc 보정안)

| 셰프 | 현재 passiveDesc | 수정 후 passiveDesc |
|------|----------------|------------------|
| petit_chef | 재료 수거 범위 +30% | 재료 수거 범위 +30%, 조리시간 −15% |
| flame_chef | 화염 타워 피해 +20% | 화염 타워 피해 +20%, 그릴 요리 수익 +25% |
| ice_chef | CC(둔화/빙결) 지속 +25% | CC(둔화/빙결) 지속 +25%, 손님 인내심 +20% |
| yuki_chef | (변경 없음) | (변경 없음) |
| lao_chef | (변경 없음) | (변경 없음) |

이 수정은 데이터 파일 passiveDesc 문자열만 교정하는 것으로, 로직 변경 없음.

### 3-3. 스킬 역할 구분 재정의 (수치 변경 없음)

#### 채집 전용 스킬 (GatheringScene에서만 의미 있음)

| 셰프 | 패시브 | 액티브 |
|------|-------|-------|
| 꼬마 셰프 | 수거 범위 | 즉시 수거 |
| 불꽃 요리사 | 화염 타워 피해 | 전체 화상 |
| 얼음 요리장 | CC 지속 | 전체 빙결 |
| 유키 | — (없음) | 빙결 처치 |
| 라오 | 도구 공격력 / 드롭률 | 파워 서지 |

#### 영업 보조 스킬 (ServiceScene에서 발동, 쿨다운 있음)

| 셰프 | 영업 패시브 (상시) | 영업 액티브 (지원 스킬) |
|------|-----------------|------------------|
| 꼬마 셰프 | 조리시간 −15% | 특급 서비스 (다음 3명 인내심 리셋) |
| 불꽃 요리사 | 그릴 요리 수익 +25% | 화염 조리 (조리 중 전체 즉시 완성) |
| 얼음 요리장 | 손님 인내심 +20% | 시간 동결 (전체 인내심 10초 정지) |
| 유키 | 조리시간 −20% / ★★★+ 보상 +15% | 정밀 절단 (다음 5개 즉시 조리) |
| 라오 | (없음) | 불꽃 웍 (전 테이블 주문 즉시 완성) |

**라오 영업 패시브 공백 주의**: 라오는 현재 ServiceScene에서 상시 패시브 효과가 없다. 채집 전문형 셰프로 의도된 설계일 수 있으나, 영업 씬에서 체감 효과가 없어 셰프 선택 시 매력도가 낮다. Phase 48-4 이후 검토 권장.

---

## 4. 스킬 발동 씬 매핑

| 스킬 카테고리 | 발동 씬 | 담당 캐릭터 |
|------------|--------|-----------|
| 채집 — 적 피해/CC/처치 | GatheringScene | 스토리 셰프 (전담) |
| 채집 — 수거/드롭 | GatheringScene | 스토리 셰프 (전담) |
| 채집 — 도구 강화 | GatheringScene | 스토리 셰프 (전담) |
| 영업 — 손님 인내심 (상시 패시브) | ServiceScene | 스토리 셰프 (일부) / 유랑 미력사 (전담) |
| 영업 — 조리 시간 (상시 패시브) | ServiceScene | 스토리 셰프 (일부) / 유랑 미력사 (일부) |
| 영업 — 골드/팁 수익 배율 (상시 패시브) | ServiceScene | 유랑 미력사 (전담) |
| 영업 — 특수 손님 등장/상호작용 | ServiceScene | 유랑 미력사 (전담) |
| 영업 — 미력의 정수 획득 관련 | ServiceScene | 유랑 미력사 (전담) |
| 영업 — 순간 개입 (쿨다운 지원 스킬) | ServiceScene | 스토리 셰프 (지원 역할) |
| 채집 + 영업 공통 | 양쪽 모두 | 유키 (조리시간 패시브 → 양 씬 영향) |

**"공통" 스킬 주의사항**: 유키의 조리시간 −20%는 ServiceScene에서만 사용되나, 개념적으로 "재료를 더 빠르게 가공"과 연계되어 GatheringScene 이후 바로 이어지는 영업 씬의 흐름을 가속한다. 두 씬을 넘나드는 간접 효과로 설명할 수 있다.

---

## 5. 시너지 체계

### 5-1. 기본 원칙

스토리 셰프와 유랑 미력사는 독립적으로 각 씬을 강화하며, **조합에 따른 추가 보너스(시너지 보너스)**를 통해 특정 플레이스타일을 유도한다.

### 5-2. 시너지 보너스 초안

Phase 48-2에서 유랑 미력사 스킬 설계가 확정된 후 수치를 조율한다. 아래는 방향성 기획안이다.

| 조합 | 시너지 효과 | 발동 조건 | 강도 |
|------|-----------|---------|-----|
| 꼬마 셰프 + 수집형 미력사 | 미력 나그네 등장 확률 +4% 추가 | 영업 세션 시작 시 자동 | 소 |
| 불꽃 요리사 + 조리 특화 미력사 | 화염 조리 스킬 CD −20% | 영업 씬 상시 | 소 |
| 얼음 요리장 + 접대형 미력사 | VIP/미식가 손님 팁 +10% 추가 | 영업 씬 상시 | 소 |
| 유키 + 레시피 특화 미력사 | ★★★+ 요리 서빙 시 미력의 정수 0.5 확률로 +1 | 서빙 완료 시 | 중 |
| 라오 + 전투형 미력사 | 엔드리스 모드 파워 서지 CD −30% | GatheringScene 상시 | 소 |

**시너지 구현 우선순위**: Phase 48-2 유랑 미력사 구현 완료 후 Phase 48-4 이상에서 단계적으로 추가. Phase 48-3 기획 문서에서는 방향성만 확정하고 수치는 구현 시 조정.

### 5-3. 시너지 정보 공개 방침

- 셰프 선택 화면(ChefSelectScene)과 미력사 고용 화면에서 "이 셰프와 잘 맞는 미력사" 힌트 텍스트 제공.
- 실제 수치는 게임 내에서 실험으로 발견하도록 하되, 시너지 발동 시 VFX(짧은 플래시 + 플로팅 텍스트 "시너지!")로 가시화.

---

## 6. 구현 영향 분석

Phase 48-3은 기획 문서 산출물이다. 코드 변경은 없으나, 향후 구현 시 아래 파일과 범위가 영향을 받는다.

### 6-1. 수정 필요 파일 목록

| 파일 | 수정 범위 | 우선순위 |
|------|---------|--------|
| `js/data/chefData.js` | passiveDesc 문자열 3건 교정 (petit/flame/ice). 로직 변경 없음. | Phase 48-4 초기 작업 |
| `js/managers/ChefManager.js` | 유랑 미력사 버프 독립 계수 곱셈 처리. `getMireukCookBonus()` 등 미력사 전용 메서드 추가 예정. | Phase 48-2 이후 |
| `js/scenes/ServiceScene.js` | 미력사 서비스 스킬 버튼 슬롯 추가 (스토리 셰프 스킬 버튼과 별개). 미력의 정수 HUD 추가. | Phase 48-2 이후 |
| `js/managers/SaveManager.js` | `data.hiredMireukChefs` 등 Phase 48-1 기획서 세이브 v18 스키마 추가. | Phase 48-2 이후 |
| `js/scenes/ChefSelectScene.js` | 시너지 힌트 텍스트 표시 로직 추가. | Phase 48-4 이후 |

### 6-2. 연동 포인트 상세

#### ChefManager.js 신규 메서드 (Phase 48-2 이후)

```
getMireukServicePassive(passiveType)
  — 고용된 미력사 중 해당 타입 패시브의 최대값 또는 합산값 반환

getMireukServiceSkills()
  — 고용된 미력사의 액티브 스킬 목록 반환

getSynergyBonus(chefId, mireukId)
  — 특정 셰프+미력사 조합의 시너지 보너스 반환
```

#### ServiceScene.js 신규 UI 구역

현재 BOTTOM_Y(570) 구역에 스킬 버튼 1개(셰프 전용). Phase 48-2 이후 미력사 스킬 슬롯 1~4개 추가 배치 필요. 화면 레이아웃 조정이 동반될 수 있으므로 AD 모드3 검수 대상.

#### SaveManager.js 세이브 버전

현재 v17. Phase 48-2 구현 시 v18로 마이그레이션(MIREUK_ESSENCE_ECONOMY.md 6장 참조).

---

## 7. 용어 정리

| 용어 | 정의 |
|------|------|
| 스토리 셰프 | 꼬마/불꽃/얼음/유키/라오. 스토리 진행으로 해금. GatheringScene 전문. |
| 유랑 미력사 | Phase 48-2 신규 캐릭터 타입. 미력의 정수로 고용. ServiceScene 전문. |
| 채집 액티브 | 셰프 선택 화면에서 `skillType`으로 정의되는 GatheringScene용 쿨다운 스킬. |
| 영업 지원 스킬 | chefData.js의 `serviceSkill`로 정의. ServiceScene에서 단일 버튼으로 발동. |
| 영업 패시브 | ChefManager의 각종 getXxxBonus() 메서드. 조건 충족 시 상시 적용. |
| 시너지 보너스 | 스토리 셰프와 유랑 미력사의 특정 조합 시 발동하는 추가 효과. |
| 미력의 정수 | 유랑 미력사 고용/강화 전용 화폐 (Phase 48-1 설계). |

---

## 8. 구현 현황

> Phase 51-3 (2026-04-19) 완료

### passiveDesc 교정

- [x] petit_chef: "재료 수거 범위 +30%, 조리시간 −15%" (chefData.js)
- [x] flame_chef: "화염 타워 피해 +20%, 그릴 요리 수익 +25%" (chefData.js)
- [x] ice_chef: "CC(둔화/빙결) 지속 +25%, 손님 인내심 +20%" (chefData.js)

### 독립 계수 곱셈 원칙

- [x] ServiceScene `_serveToCustomer()` totalGold 계산식에 독립 계수 원칙 주석 추가
- [x] 스토리 셰프 버프(ChefManager)와 유랑 미력사 버프가 독립 슬롯으로 곱셈 적용됨을 코드에 반영
- [x] earlyMult(시엔) / vipBonus(로살리오) / gourmetBonus(레이라) / yokoProtectBonus(요코) 4개 배율 변수를 독립 계수로 추가

### 미력사 버프 5종 연결

- [x] _buffServeSpeed (무오): effectiveServeDelay로 자동 서빙 딜레이 단축, 80% 상한 캡
- [x] _buffEarlyBonus / _buffEarlyDuration (시엔): 세션 초반 N초간 골드 배율 적용
- [x] _buffIngredientRefund / _buffNoFailDelay (아이다): 조리 실패(discard) 시 확률적 재료 회수
- [x] _buffVipRewardMult (로살리오): VIP 손님 서빙 시 골드 추가 배율
- [x] _buffGourmetRewardMult (레이라): 미식가 손님 서빙 시 골드 추가 배율
- [x] _buffVipFoodReviewBonus (로살리오 3단계): food_review 이벤트 확률 +30%

### 요코 chain_serve

- [x] _yokoChainThreshold / _yokoChainReward / _yokoChainCount / _yokoProtectNext / _yokoProtectActive 변수 구현
- [x] 연속 서빙 카운터 + 퇴장 방지(500ms 고정) + VFX + 골드 보너스(3단계 +50%)
- [x] 서빙 실패(자연 퇴장) 시 카운터 리셋

### 미구현 (후속 과제)

- [ ] 무오 3단계 _buffMuoFirstServeGuarantee (첫 서빙 인내심 80% 보장) -- wanderingChefData.js에 serve_speed skillValues2 데이터 추가 필요

---

## 9. 결정 사항 요약

1. **스토리 셰프는 GatheringScene 주 전문**으로, ServiceScene에서는 지원 역할(쿨다운 지원 스킬 + 소수 패시브)만 수행한다.
2. **유랑 미력사는 ServiceScene 전담**으로, GatheringScene 효과는 없다.
3. **passiveDesc 3건 문서 불일치** (petit/flame/ice)는 Phase 48-4 초기 chefData.js 교정으로 해결한다.
4. **라오의 영업 패시브 공백**은 Phase 48-4 이후 별도 검토한다.
5. **동시 버프 처리**는 독립 계수 곱셈 방식을 채택하고, 중복 종류는 합산 대신 상한선 캡을 적용한다.
6. **시너지 보너스**는 Phase 48-2 미력사 스킬 설계 완료 후 Phase 48-4에서 구현한다.

---

## 9. 참고 문서

| 문서 | 경로 |
|------|------|
| 미력의 정수 화폐 시스템 | `docs/MIREUK_ESSENCE_ECONOMY.md` |
| 프로젝트 전체 기획서 | `docs/PROJECT.md` |
| 셰프 데이터 | `js/data/chefData.js` |
| 셰프 관리자 | `js/managers/ChefManager.js` |
| 영업 씬 | `js/scenes/ServiceScene.js` |
| Phase 48-2 기획서 | (미작성 — 유랑 미력사 고용 시스템) |
