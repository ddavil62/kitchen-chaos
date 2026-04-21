# UI Refactoring 가이드

> Design Critique 기반 우선순위 개선 목록 (2026-04-20)

---

## 개요

360×640px 모바일 캔버스(Android Capacitor) 기준 UI/UX 점검 결과를 정리한다.
크리티컬→모더레이트→마이너 순으로 개선 항목을 기술한다.

---

## Critical (즉시 수정)

### 1. 타워 버튼 터치 타겟 확장

- **파일**: [`js/ui/GameUI.js:97`](../js/ui/GameUI.js)
- **현황**: `btnW = 36, btnH = 36` — WCAG 2.5.5 권장 44px 미달
- **수정**: 히트박스를 44×44px로 확장, 내부 아이콘 렌더링은 36px 유지

```js
// Before
const btnW = 36, btnH = 36;

// After
const btnW = 44, btnH = 44;
const iconSize = 36; // 내부 아이콘은 별도로 36px 유지
```

### 2. HUD 이모지 → PNG 아이콘 교체

- **파일**: [`js/ui/GameUI.js:51,61`](../js/ui/GameUI.js)
- **현황**: `'🪙 150'`, `'❤️ 10'` — Android Canvas에서 이모지 렌더링 불안정
- **수정**: 골드/하트 아이콘을 `assets/ui/` PNG 스프라이트로 교체

```js
// Before
this.goldText = s.add.text(10, 10, '🪙 150', { ... });
this.livesText = s.add.text(GAME_WIDTH - 10, 10, '❤️ 10', { ... });

// After
s.add.image(18, 18, 'icon_gold').setDepth(21).setDisplaySize(20, 20);
this.goldText = s.add.text(32, 10, '150', { ... });

s.add.image(GAME_WIDTH - 26, 18, 'icon_heart').setDepth(21).setDisplaySize(20, 20);
this.livesText = s.add.text(GAME_WIDTH - 10, 10, '10', { ... });
```

---

## Moderate (다음 스프린트)

### 3. 월드맵 미구현 챕터 정리

- **파일**: [`js/scenes/WorldMapScene.js:37-49`](../js/scenes/WorldMapScene.js)
- **현황**: 24챕터 중 15개가 `(미구현)` 텍스트로 노출 — 완성도 인식 저해
- **수정**: 미구현 챕터는 그룹 탭 내에서 마지막 노드를 "?" 단일 노드로 통합 표시

```js
// CHAPTERS 배열에서 theme: 'placeholder' 항목을 그룹별 더미 노드 1개로 축소
// 예: 그룹2의 미구현 챕터(13,15) → 노드 위치에 '?' + '더 많은 이야기가 찾아옵니다' 문구
```

### 4. HUD 웨이브 텍스트 크기 상향

- **파일**: [`js/ui/GameUI.js:57`](../js/ui/GameUI.js)
- **현황**: `fontSize: '14px'` — 게임 중 핵심 정보인데 최소 크기 수준
- **수정**: `fontSize: '16px'`로 상향, 필요 시 텍스트를 `W1/5` 약식으로 줄임

### 5. 하단 3패널 인지 부하 개선

- **현황**: 타워 선택/인벤토리/조리소가 360px 안에 동시 표시 — 정보 밀도 높음
- **수정 옵션 A** (권장): 조리소 패널을 슬라이드업 오버레이로 분리, 재료 터치 시 노출
- **수정 옵션 B**: 상단 작은 탭(타워 | 인벤 | 조리)으로 전환

### 6. 챕터 이모지 아이콘 → PNG 스프라이트 교체

- **파일**: [`js/scenes/WorldMapScene.js:24-50`](../js/scenes/WorldMapScene.js)
- **현황**: 🍝🍜🦞🔥🧁👨‍🍳🌸🍶🐉 이모지 — 플랫폼별 폰트 외관 차이
- **수정**: 챕터별 24×24px 아이콘 PNG를 `assets/ui/chapter-icons/`에 준비

---

## Minor (백로그)

### 7. 색상 토큰 중앙화

- **현황**: `0xff6b35`(Phaser hex)와 `'#ff6b35'`(CSS string) 혼재, 6단계 폰트 크기 상수 없음
- **수정**: `config.js`에 팔레트 + 타입 스케일 상수 추가

```js
// config.js 추가 제안
export const COLORS = {
  bg:        0x1a0a00,
  primary:   0xff6b35,
  accent:    0xffd700,
  danger:    0xff4444,
  divider:   0xffa500,
  textMuted: 0xcccccc,
};

export const FONT_SIZE = {
  display: '48px',
  title:   '28px',
  body:    '18px',
  ui:      '16px',
  caption: '14px',
};
```

### 8. 타이틀 화면 텍스트 통합

- **파일**: [`js/scenes/MenuScene.js:39-65`](../js/scenes/MenuScene.js)
- **현황**: "Kitchen / Chaos / Tycoon" 3개 별도 텍스트 오브젝트 — 타이틀 파편화
- **수정**: 로고 이미지(PNG) 사용 또는 TextStyle 통합으로 단일 블록 구성

### 9. HUD 구분선 색상 통일

- **현황**: HUD 하단 구분선 `0xffa500`, 하단 패널 내부 구분선 `0x555555` — 동일 역할 불일치
- **수정**: `COLORS.divider` 토큰으로 일원화

### 10. 한국어 폰트 베이스라인 정식 보정

- **현황**: `+4px top padding` workaround로 클리핑 대응 중
- **수정**: 실제 ascender/descender 측정 후 `lineHeight` 또는 `padding` 공식화

---

## 진행 현황

| # | 항목 | 심각도 | 상태 |
|---|------|--------|------|
| 1 | 타워 버튼 44px 터치 타겟 | 🔴 Critical | 미착수 |
| 2 | HUD 이모지 → PNG | 🔴 Critical | 미착수 |
| 3 | 월드맵 미구현 챕터 정리 | 🟡 Moderate | 미착수 |
| 4 | 웨이브 텍스트 16px | 🟡 Moderate | 미착수 |
| 5 | 하단 패널 분리 | 🟡 Moderate | 미착수 |
| 6 | 챕터 아이콘 PNG화 | 🟡 Moderate | 미착수 |
| 7 | 색상/타입 토큰 중앙화 | 🟢 Minor | 미착수 |
| 8 | 타이틀 텍스트 통합 | 🟢 Minor | 미착수 |
| 9 | 구분선 색상 통일 | 🟢 Minor | 미착수 |
| 10 | 폰트 베이스라인 정식 보정 | 🟢 Minor | 미착수 |
