# Kitchen Chaos Tycoon 기획서

> 최종 업데이트: 2026-05-04 (앱 아이콘 신규 적용)

## 프로젝트 개요

모바일 타워 디펜스 + 레스토랑 타이쿤 하이브리드 게임(구 Kitchen Chaos Defense). 영구 도구를 배치해 적을 처치하고 재료를 채집하는(재료 채집 페이즈) → 재료로 손님에게 요리를 서빙하여 골드를 획득하는(영업 페이즈) → 골드로 도구를 구매/업그레이드하거나 되돌릴 수 없는 로그라이크 분기 카드 3장 중 1장을 선택하는(행상인) 3단계 루프 구조. Phaser.js 3 기반 웹 게임, Android 우선 배포.

세계관/스토리/캐릭터 상세: [STORY.md](STORY.md) 참조.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 엔진 | Phaser.js 3 |
| 언어 | JavaScript (바닐라) |
| 아트 | PixelLab API + SD Forge SDXL (픽셀 아트, 메뉴 비주얼) |
| 폰트 | NeoDunggeunmoPro (로컬 번들 woff2 + CDN fallback, SIL OFL 1.1) |
| 사운드 | Web Audio API (프로시저럴) |
| 빌드 | Vite + Capacitor (Android) |
| 테스트 | Playwright |

## 아키텍처

### 핵심 모듈

| 모듈 | 파일 | 역할 |
|------|------|------|
| 재료 채집 | GatheringScene.js | 도구 배치/회수/재배치, 적 AI, 재료 드롭, 보스 재료 드롭, 웨이브 진행, 1x/2x 배속 토글(AD-2 광고 선행), HP=0 부분 성공 분기, overrideLives 파라미터 지원, 배치 가능 셀 하이라이트, 사거리 미리보기, 웨이브 카운트다운 |
| 도구 관리 | ToolManager.js | 영구 도구 인벤토리 (구매/판매/업그레이드/스탯 조회/자동 지급) |
| 행상인 | MerchantScene.js | 2탭 UI (도구 구매/분기 선택), 도구 구매·판매·업그레이드 + 되돌릴 수 없는 3택 1 분기 카드, 분기 탭 피드백(tint 플래시/출발 disabled/descKo 모달), 도구 추천 배지 3종, 3색 버튼(구매=초록/판매=주황/업그레이드=파랑), 분기 카드 CARD_WIDTH=96 + wordWrap 패딩, TAB_Y=80/LIST_TOP=108 간격 확보, CARD_HEIGHT=180+maxLines:4 overflow 방지 |
| 분기 효과 | BranchEffects.js + merchantBranchData.js + chefUnlockHelper.js | 분기 카드 32장 정의(mutation/recipe/bond/blessing × 8), 게임플레이 씬에서 배수·시너지·tint 조회하는 경량 어댑터, `getEligiblePool(category, branchCardsState, progressState)` 선행 해금 필터(셰프·도구·챕터/시즌), 셰프 해금 판별 헬퍼 공용화 |
| 월드맵 | WorldMapScene.js | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률+에너지 HUD(에너지 0 빨간색), 에너지 게이트 + 충전 모달, 대화 트리거 350ms 지연 |
| 엔드리스 | EndlessScene.js + EndlessWaveGenerator.js + EndlessMissionManager.js | 무한 웨이브 TD, 5웨이브마다 영업+행상인 삽입, 미력 폭풍 이벤트, 정화 임무 4종, 통계 트래킹(폭풍/임무/무결) |
| 손님 프로필 | customerProfileData.js | 10종 프로필 정의 (normal/vip/gourmet/rushed/group/critic/regular/student/traveler/business), patienceMult/tipStyle/preferredGenre 속성, getCustomerProfile() 조회 |
| 영업 코어 | ServiceScene.js | 손님 입장/주문/조리/서빙/팁, 골드→영구 저장, 재료 0개 진입 즉시 종료 방어, 아이소메트릭 홀 (3레이어 분리 렌더링+depth sorting+홀 데코), 챕터별 홀 배경 (바닥 8종 tileSprite+뒷벽 8종), 엔드리스 웨이브 구간별 배경 테마 전환, 웜 다크 통합 팔레트, 픽셀아트 렌더링 (fallback 지원), 10종 프로필 기반 손님 스폰/평론가 점수 집계/단골 추적, 서빙 2단계 인터랙션, 레시피 재료 아이콘 12px+축약 |
| 결과 | ResultScene.js | 캠페인 별점/엔드리스 기록 표시, 행상인 방문 연결, modal lock (DialogueScene 시 alpha=0.3+disableInteractive, 종료 시 복원), isCleared 복합 조건, 셰프별 장보기 실패 대사 (7셰프 x 3 바리에이션), BTN_W=240, partialFail 별점 2개 캡+오렌지 메시지, AD-1 광고 재도전(완전/부분 실패)+AD-3 보상 2배(stars<=2) 버튼, btnGap 조건부 축소(44/54), 재클리어 시 회색 이탤릭 안내 문구, 이벤트 보너스 골드 조건부 표시, 스테이지 클리어 시즌 XP 훅, stageId/nameKo 중복 방지 포맷, 섹션 여백 압축(~30px 절약) |
| 대화 시스템 | DialogueManager.js + DialogueScene.js + dialogueData.js | 대화 스크립트 119종 재생, 선택지 분기 UI, 픽셀아트 초상화 렌더링, 시청 기록 |
| 스토리 시스템 | StoryManager.js + storyData.js | 트리거 중앙 디스패처(triggerPoint 8종), 120항목, 챕터 진행도, 스토리 플래그(객체), onComplete 콜백, 씬 1줄 호출 |
| 일일 미션 | DailyMissionManager.js | DAILY_MISSION_POOL 20종에서 매일 3개 랜덤 선정, 자정 리셋, 진행도 추적(updateMode 필드 기반 sum/max 갱신), 보상 자동 지급, 미션 완료 시 시즌 XP 훅 |
| 로그인 보너스 | LoginBonusManager.js | 7일 연속 로그인 캘린더, streak 관리, D1~D7 보상 지급 |
| 에너지 관리 | EnergyManager.js | 에너지 read/write, 재진입 시 경과 시간 기반 자동 충전, 광고 즉시 충전 API, canPlay 게이트 판정, energy_festival 이벤트 면제 |
| 주간 이벤트 | WeeklyEventManager.js | 요일 기반 주간 이벤트 조회(getActiveEvent/isActive), config.js WEEKLY_EVENT_POOL 참조, 이벤트 3종(bonus_gold/double_mission/energy_festival) |
| 광고 관리 | AdManager.js | Capacitor AdMob 래퍼. DEV/웹 환경 즉시 리워드 폴백. IAPManager.isAdsRemoved() 연동. 리워드 광고 3포인트(실패 재도전/배속 해제/보상 2배) |
| 스킨 관리 | SkinManager.js | 셰프 스킨 정의(SKIN_DEFS), 보유/장착 상태 read/write, SaveManager 연동. 미미 스킨 3종(기본/핑크/블루) |
| 시즌 패스 | SeasonManager.js | 50단계 XP 시스템: stage_clear/daily_mission XP 적립, 무료/유료 트랙 보상 수령, SaveManager v31 연동 |
| IAP 관리 | IAPManager.js | IAP 5종 스텁(광고 제거/스킨 2종/시즌 패스/코인 팩). localStorage 기반 상태 조회. 실제 결제 플로우 미구현 |
| 세이브 | SaveManager.js | localStorage, 마이그레이션 체인 v1~v31, 3슬롯 롤링 백업(backup_1~3) + getBackups/restoreBackup API, dailyMissions/loginBonus/mimiSkinCoupons/unlockedSkins/equippedSkin/regularCustomerProgress/criticPenaltyActive/energy/energyLastRecharge/weeklyEvent/seasonPass 필드, `_currentRun` 인메모리 단일 소스 (씬 간 stageId 전달) |
| 쿠폰 | CouponRegistry.js | 쿠폰 레지스트리, redeemCoupon() API, 일반 3종+DEV 치트 5종(DEV&&!PROD 이중 가드), 사용 이력 localStorage 관리 |
| 사운드 | SoundManager.js | 프로시저럴 SFX 20종 + BGM 5종 |
| VFX | VFXManager.js | Canvas2D 파티클, 스크린 플래시/셰이크, 플로팅 텍스트, 범용 floatingText |
| 적 | Enemy.js | 적 AI, 메커닉(dodge/charge/thorns/taunt/summon/split/magic resistance 등), 주기적 소환, _animState 상태 머신(IDLE/WALKING/DYING) |
| 업적 | AchievementManager.js + achievementData.js + AchievementScene.js | 34개 업적, 해금 판정/보상(골드/코인/정수), 카테고리 탭 UI, 진행도 바 barH=16 |
| 스프라이트 | SpriteLoader.js | walk/death 프레임 시퀀스 로딩 (적+보스+미니보스), Phaser anim 등록, 방향 폴백 매핑, 챕터별 홀 바닥·뒷벽 에셋 로드, 테이블 front/back+손님 waiting/seated(10종 프로필, seated_south+seated_north) 에셋 로드, 타일셋 15종+타워 8종 preload, portrait 11종 (arjun+mimi_pink+mimi_blue 포함) |
| 메인 메뉴 | MenuScene.js | 배경 이미지(이벤트 분기 stub) + 타이틀 로고 + 미미 스프라이트 + 버튼 5종 + 설정/쿠폰/세이브 복구 + 오늘의 미션 배너 + 주간 이벤트 배너(y=96, wordWrap 160px+maxLines 1) + 시즌 패스 바로가기 버튼 + 미션/캘린더/시즌패스 3탭 모달(MODAL_W=320, TAB_W=90, cx+-106, defaultTab 파라미터) + 리소스 HUD 2행(1행: 골드/코인/정수, 2행: 에너지 N/5+카운트다운), 미션 안내 문구, 쿠폰 팝업 alpha=0.75, 세이브 팝업 depth=1300 |
| 데이터 | stageData.js / gameData.js / recipeData.js / merchantBranchData.js | 스테이지 143슬롯, 적 57종, 재료 32종, 레시피 292종(일반 284+분기 8), 분기 카드 32장 |

### 게임 루프

```
메뉴 → 월드맵 → 셰프 선택 → GatheringScene(재료 채집) → ServiceScene(영업) → ResultScene → MerchantScene(행상인) → 월드맵
메뉴 → 월드맵 → 엔드리스 → 셰프 선택 → EndlessScene(TD) ↔ ServiceScene(영업) → MerchantScene(행상인) → EndlessScene(계속) → ... → ResultScene(게임오버)
```

## 기능 목록

| 기능 | 설명 | 상태 |
|------|------|------|
| 코어 TD | 아이소메트릭 그리드, 도구 배치/회수/재배치, 적 AI, 재료 드롭, 배치 가능 셀 하이라이트, 사거리 미리보기, 웨이브 카운트다운 | 완료 |
| 3단계 루프 | GatheringScene(재료 채집) + ServiceScene(영업) + MerchantScene(행상인) + ResultScene | 완료 |
| 캠페인 | 24챕터 체계(그룹1~3), 보스 13종, 별점 시스템 | 완료 |
| 레시피 | 284종, 5등급, 도감 | 완료 |
| 셰프 시스템 | 7종 Named 셰프 (미미/린/메이지/유키/라오/앙드레/아르준), 전원 패시브+액티브 스킬, 챕터 기반 잠금 해제, 가로 캐러셀 UI (260x380px 카드, 스와이프/화살표 전환, 순환 탐색), 미미 스킨 3종(기본/핑크/블루 앞치마) + 스킨 선택 서브 패널 + IAP 구매 스텁 | 완료 |
| 상점 | 5탭 (업그레이드/레시피/테이블/인테리어/직원), 탭 depth 1020/1021(TutorialManager 위), 업그레이드 버튼 76px | 완료 |
| 영업 심화 | 테이블 12석(양면 착석), 인테리어, 직원 2종, 10종 프로필 손님(평론가·단골 특수 메커니즘), 이벤트, 서빙 2단계 인터랙션+긴급 피드백+콤보 팝업 | 완료 |
| 사운드 | SFX 20종 + BGM 5종, 설정 UI | 완료 |
| VFX | 파티클, 스크린 효과, 플로팅 텍스트 | 완료 |
| 엔드리스 모드 | 무한 웨이브 TD, 6-6 클리어로 해금, 데일리 스페셜, 로컬 랭킹, 미력 폭풍의 눈 이벤트(15웨이브 배수), 정화 임무 4종, 유랑 미력사 8% 등장, 웨이브 구간별 배경 테마 전환 | 완료 |
| 월드맵 UI | 24챕터 3그룹 탭(1~6/7~15/16~24장), 9노드 3x3 맵, 스테이지 패널, 진행률 HUD, 엔드리스 섹션 | 완료 |
| 튜토리얼 개선 | 영업/상점/엔드리스 안내, 1-1~1-3 자동 도구 지급, 개별 플래그, 엔드리스 페이지네이터 도트 인디케이터, 1-1 인터랙티브 온보딩(화살표+하이라이트 3스텝, tutorialWave 2마리 제한) | 완료 |
| UI/UX 폴리시 | 씬 전환, 버튼 스타일, 터치 피드백 통일 | 완료 |
| 성능 최적화 | 오브젝트 풀링, 불필요 렌더링 제거, 메모리 관리 | 완료 |
| 출시 준비 | 버전 표기(APP_VERSION), 전역 에러 핸들러, localStorage 용량 체크 | 완료 |
| 도구/행상인/채집 | 영구 도구 8종, 구매/판매/업그레이드, 행상인 UI, 재료 채집 TD, 도구 도감/팝업 | 완료 |
| 대화/스토리 | 스크립트 119종, 트리거 120항목, 선택지 분기, 초상화 9종, 15캐릭터, 시나리오 일관성 검증+개그씬 확장 완료 | 완료 |
| 영업 씬 비주얼 | 아이소메트릭 홀 (3레이어 분리 렌더링, 테이블 front/back 10종+손님 10종+챕터별 바닥 8종+뒷벽 8종, 홀 데코, depth 체계 정비), 현대 캐주얼 다이닝 v13 가구(table_4p 100x40, chair_back/front 100x20) + 손님 seated_south/north 20종(64x64px) + 2열x3행 6테이블 24석(front 2+back 2/quad), depth 착석 표현(BENCH_CONFIG: QUAD_W=116, QUAD_H=128, SLOT_DX=24, BACK_SLOT_DY=104) | 완료 |
| 그룹2 콘텐츠 (7~15장) | 일식/중식/양식 아크, 적 16종+보스 4종, 레시피 80종, 대화 32종, 42스테이지 밸런스 검증 완료 | 완료 |
| 그룹3 콘텐츠 (16~24장) | 인도(16~18)/멕시칸(19~21)/디저트·최종(22~24) 아크, 적 14종+보스 3종(maharaja/el_diablo_pepper/queen_of_taste 3페이즈), 레시피 57종, 대화 28종, 전 스테이지(16-1~24-6) 구현, 밸런스 QA 완료 | 완료 |
| 업적 시스템 | 34개 업적 (5카테고리), 조건 판정+보상(골드/코인/정수), 토스트 알림, 전용 AchievementScene UI, 수령 대기 카드 골드 glow + alpha 펄스 | 완료 |
| 아트 리워크 | 레거시 스프라이트 64px 재생성. Phase 44(적/보스 전종) + Phase 45(셰프 5종) 완료. Phase 46에서 metadata.json 일괄 갱신 + cardamom.png 교체 + 렌더링 검증까지 완결 | 완료 |
| 애니메이션 시스템 | walk+death 프레임 시퀀스 아키텍처 (SpriteLoader death 로딩/등록, Enemy _animState 상태 머신, 비동기 death anim). 보스 13종+일반 적 42종 전종 death anim 완료 | 완료 |
| 미력의 정수 코어 | mireukEssence 화폐 세이브 v18, mireuk_traveler 특수 손님 (정수 드롭 1~3), HUD 보유량 표시, VFX 플로팅 텍스트, spendMireukEssence 소비 메서드 | 완료 |
| 유랑 미력사 고용 | 8명 미력사(4등급) 고용/강화(3단계)/해고 시스템, WanderingChefModal(스크롤, 등급 뱃지), ServiceScene 패시브 스킬 적용(인내심/조리시간/특수손님), 세이브 v19 | 완료 |
| 셰프 스킬 재설계 | passiveDesc 3건 교정, 미력사 버프 5종 ServiceScene 실제 로직 연결, 요코 chain_serve 구현, 독립 계수 곱셈 원칙 코드 반영 | 완료 |
| 영업씬 렌더링 재구성 | 테이블 3레이어 분리 렌더링(back/customer/front), 손님 독립 스프라이트(5종x2상태), HUD depth 600+ 상향 | 완료 |
| 쿠폰 코드 시스템 | 설정 메뉴 쿠폰 입력 UI, 일반 쿠폰 3종(프로덕션), DEV 치트 5종(트리쉐이킹), giftIngredients 세이브 v20 | 완료 |
| 메뉴 비주얼 에셋 | MenuScene에 배경 이미지(menu_bg), 타이틀 로고(menu_title_logo), 미미 스프라이트, 신규 앱 아이콘(app_icon_1024/app_icon_512) 도입. Android 런처 아이콘도 동일 원본 기반으로 동기화. 장식 원 제거, panel dark alpha 0.5 | 완료 |
| 행상인 분기 카드 | 4카테고리(변이/레시피/인연/축복) × 각 8장 = 32장, 매 방문 3장 중 1장 선택(되돌릴 수 없음), 배지 아이콘 4종, 세이브 v24 영구 저장, 변이 8종 전수 실효 + Bond 8쌍 시너지 + Blessing 실효 + 분기 레시피 반복 등장. 선행 해금 체크 적용 | 완료 |
| 세이브 백업 | 3슬롯 롤링 백업(backup_1~3), 설정 패널 복구 버튼 + 백업 목록 모달 + 확인 모달, quota 초과 시 메인 저장 보호 | 완료 |
| 일일 미션 | DailyMissionManager: 20종 풀(6타입+신규 3타입)에서 매일 3개 랜덤 선정, 9개 씬 이벤트 훅(try-catch), 자정 리셋, updateMode 필드 기반 sum/max 갱신, 보상 자동 지급, 미션 완료 시 시즌 XP 훅. 메뉴 배너 + 미션/로그인/시즌패스 3탭 모달. 전 미션 타입 전용 아이콘 완비 | 완료 |
| 로그인 보너스 | LoginBonusManager: 7일 캘린더(D1 미미 스킨 쿠폰, D7 미력의 정수 100), streak 단절 시 D1 재시작. 세이브 v25 | 완료 |
| 수익화 기반 | AdManager(리워드 광고 3포인트: 실패 재도전/배속 해제/보상 2배) + IAPManager(5종 스텁: 광고 제거/스킨 2종/시즌 패스/코인 팩). DEV 환경 즉시 폴백 | 완료 |
| 시즌 패스 | SeasonManager 50단계 XP 시스템. 스테이지 클리어/일일 미션 완료로 XP 적립, 무료/유료 트랙 보상. MenuScene 미션 모달 시즌 패스 탭 | 완료 |
| 에너지 시스템 | 스테이지/엔드리스 진입 시 에너지 1소비, 최대 5개, 30분 자동 충전, 리워드 광고 즉시 충전, 광고 제거 구매자 면제, energy_festival 이벤트 면제 | 완료 |
| 메뉴 리소스 HUD | MenuScene 상단 2행(1행: 골드/코인/정수, 2행: 에너지+카운트다운) 상시 표시. 재클리어 코인 0 정책 + ResultScene 재클리어 문구 | 완료 |
| 주간 이벤트 시스템 | 요일 기반 주간 이벤트 3종: 황금 주방 주간(금~일, 골드 +50%), 미션 더블 위크(화~목, 보상 2배), 에너지 축제(월, 진입 무료). MenuScene 이벤트 배너 + ResultScene 이벤트 보너스 표시 | 완료 |

## 콘텐츠 규모

| 항목 | 수량 |
|------|------|
| 적 | 57종 (일반 43 + 미니보스 1 + 보스 13, oni_herald 미니보스 에셋 완료) |
| 도구 | 8종 (pan, salt, grill, delivery, freezer, soup_pot, wasabi_cannon, spice_grinder) |
| 재료 | 32종 |
| 레시피 | 292종 (서빙 231 + 버프 53 + 분기 8) |
| 스테이지 | 143슬롯 (1~24장 전체 구현, placeholder 0개) |
| 셰프 | 7종 Named (미미/린/메이지/유키/라오/앙드레/아르준, 전원 패시브+액티브 스킬) |
| 업적 | 34개 (스토리 10 / 전투 8 / 수집 5 / 경제 5 / 엔드리스 6) |
| 분기 카드 | 32장 (변이 8 / 레시피 8 / 인연 8 / 축복 8) |
| 손님 프로필 | 10종 (normal/vip/gourmet/rushed/group/critic/regular/student/traveler/business) |
| 세이브 버전 | v31 |

## 알려진 제약사항

- EndlessScene이 WaveManager를 MonkeyPatch로 연동 (공식 override API 없음)
- 온라인 랭킹 미구현, 엔드리스 ServiceScene은 1장 기준 config
- removeBuff()가 모든 멀티플라이어를 전역 초기화하므로, 디버프 동시 적용 시 먼저 만료된 디버프가 나머지도 해제할 수 있음 (기존 설계, 향후 멀티 버프 스택 구현 시 개선)
- enemy_charge_impact는 VFX/경고 텍스트만 구현 (Tower HP 시스템 미도입). 타워 내구도 도입 시 별도 페이즈에서 검토
- 신규 생성 metadata.json 8건(macaron_knight, sugar_specter, sushi_ninja, tempura_monk, queen_of_taste, sake_oni, yuki_chef, lao_chef)의 id 필드가 "unknown". 향후 PixelLab 재생성 시 업데이트 필요
- mini_dumpling metadata 92x92 vs 실제 PNG 36x36 불일치 (분열 소환 적 의도적 소형, SpriteLoader 스케일 처리)
- portrait/스프라이트 텍스처가 Phaser에 로드되지 않아 이모지 fallback으로 동작 중 (Vite 경로 매핑 이슈, Phase 56부터 지속). 단, 타일셋/테이블/타워 에셋 404는 Phase 71에서 전수 해결 완료
- `assets/sprites/towers/` 하위에 원본 32x32 타워 파일이 잔존 (SpriteLoader가 `assets/towers/` 경로만 참조하므로 기능 영향 없음, 디스크 정리 권장)
- 타일셋 15종을 BootScene에서 전부 preload하나 GatheringScene에서 맵 렌더링에 사용하지 않음 (프로그래매틱 체커 패턴 사용). 향후 타일셋 기반 테마별 맵 렌더링 전환 시 활용 가능
- ~~portrait 8종이 SDXL 애니메 일러스트로 생성되어 픽셀 UI와 스타일 충돌~~ → **Phase 64에서 PixelLab 네이티브 128px 반신 포트레이트로 교체 완료 (2026-04-22)**
- ~~분기 카드 변이/Bond 미구현~~ → **Phase 72에서 변이 4종(chain/cluster/venom/aura_boost) + Bond 4쌍 전수 실효 구현 완료 (2026-04-23)**
- ~~enemy_slow ESM import 버그~~ → **Phase 72 회귀 검증 결과 기존 코드 정상 동작 확인 (2026-04-23)**
- ~~분기 레시피 반복 규약 불일치~~ → **Phase 72에서 chaos_ramen 3회/spice_bomb 2회 카운트 감산 구현 완료 (2026-04-23)**
- ~~assets/portraits/에 candidates/(31파일) + _archive/(89파일) 미사용 SDXL 후보군/아카이브 잔존~~ → **Phase 73에서 전수 삭제, 정식 8종만 유지 (2026-04-23)**
- mimi+salt Bond가 salt 변이 없이 단독 사용 시 미작동 (Phase 58-3 pre-existing 구조 결함: `_applyMutationToTower()`에서 변이 없으면 `_applyBondToTower()` 호출이 차단됨). 다른 3쌍 Bond는 BranchEffects API 직접 조회라 영향 없음. 후속 페이즈에서 수정 권장
- MenuScene 하단 "엔드리스 도전" 버튼(y=638)이 GAME_HEIGHT=640 경계에서 18px 잘림 (Phase 75B 배너 +60px 시프트 부작용). 후속 quick fix 예정
- MenuScene._renderCalendarSlot()에서 DailyMissionManager._getDateKey() private 메서드 직접 호출 (캡슐화 위반, 기능 동작에 영향 없음)
- `SaveManager.js:607` `unlockEndless()` JSDoc에 "24-6 클리어 시" 문구 잔존 (기능 영향 없음, 주석만 미갱신)
- 미미 스킨 쿠폰(mimiSkinCoupons)은 카운터만 저장, 교환/사용 UI 미구현. SkinManager와 연동되지 않음
- SkinManager._buildSkinPanel()이 'mimi_chef' 하드코딩 — 다른 셰프에 스킨 추가 시 파라미터화 리팩토링 필요
- 구매 팝업 딤드 오버레이 클릭 시 팝업 닫힘 없음 (취소 버튼으로만 닫기 가능, UX 개선 권장)
- 자정 리셋은 클라이언트 로컬 Date 기반, 기기 시간 조작에 취약 (Phase 78 서버 검증 예정)
- energyLastRecharge는 클라이언트 로컬 시스템 시각(Unix ms) 기반, 기기 시각 조작에 취약 (서버 검증 미구현)
- 에너지 카운트다운 타이머는 MenuScene에만 존재, WorldMapScene에서는 현재 에너지 수치만 표시(카운트다운 미표시)
- MenuScene 배경 이미지 이벤트 분기 코드 구조만 준비됨. `menu_bg_default` 에셋 미존재로 항상 기존 `menu_bg` 폴백. 에셋 추가는 별도 AD Phase 필요
- ResultScene에 평론가 혹평/단골 달성 알림 텍스트 미구현 (Phase 76 QA MEDIUM 이슈, 패널티 로직 자체는 ServiceScene에서 정상 동작, 플레이어 시각 피드백 부재). 후속 Phase에서 ResultScene UI 보강 시 함께 처리 권장
- ServiceScene CUSTOMER_PATIENCE_MULT 상수와 customerProfileData.js patienceMult 중복 정의 (현재 값 동기화됨, 향후 통합 권장)
- MenuScene 이벤트 배너 텍스트에 wordWrap 160px + maxLines 1 적용으로 긴 이벤트 설명이 잘릴 수 있음 (시즌 패스 숏컷과의 X축 겹침 방지 트레이드오프, Phase 91)

## 향후 계획

로드맵은 [ROADMAP.md](ROADMAP.md) 참조.

### 영업씬 태번(Travellers Rest) 스타일 재설계 (Phase A ~ H 완료)

Travellers Rest 식 탑다운 가구 + 사이드뷰 풀바디 캐릭터로 영업씬 전면 재설계. Phase G에서 v13 현대 캐주얼 다이닝 가구로 전면 교체하고, 2열x3행 6테이블 24석 레이아웃으로 확장. Phase H에서 배경 팔레트를 현대 크림/차콜로 교체하고 v14 배경 타일 2종 적용. front=seated_south(정면), back=seated_north(뒷모습) depth 착석 표현.

- **신규 파일**: `js/scenes/TavernServiceScene.js`, `js/data/tavernLayoutData.js`, `js/data/tavernStateData.js`
- **실 에셋**: `assets/tavern/` (v14 배경 타일 2종 + v13 가구 3종 + 손님 seated_south/north 20종 + 손님 walk 20종 + 셰프 idle 7 + 셰프 walk 10 + 레거시 가구)
- **레거시 백업**: `assets/tavern/.legacy-b5/`, `.legacy-b6-2/`, `.legacy-phase-d/`
- **진입점**: `?scene=tavern` URL 파라미터 (디버그 전용)
- **현재 레이아웃**: 2열x3행 6테이블 4인석(front 2+back 2) = 24석 (QUAD_W=116, QUAD_H=128)
- **REAL_KEY_MAP**: v14 배경 타일 2종 + v13 가구 3종 + 손님 seated_south/north 20종 + 셰프 2종 + normal 2종
- **walk 데모 키**: W(walk_r)/A(walk_l)/S(stop+seated_south or seated_north) 손님, C(walk_r)/V(walk_l) 셰프 mage
- **Phase B 규격서**: `.claude/specs/2026-04-23-kc-phase-b-asset-spec.md` (V12 규격, B-2 반영)
- **페이즈 마스터 플랜**: [SERVICE_SCENE_TAVERN_PHASES.md](SERVICE_SCENE_TAVERN_PHASES.md)
- **방향성 문서**: [SERVICE_SCENE_TAVERN_DIRECTION.md](SERVICE_SCENE_TAVERN_DIRECTION.md)

## 개발 이력 (최근)

### Phase 93 -- 버튼 인터랙션 전수 감사 (2026-04-29)

10개 씬(WorldMapScene, ShopScene, WanderingChefModal, MerchantScene, RecipeCollectionScene, GatheringScene, DialogueScene, ChefSelectScene, MenuScene, TavernServiceScene)에서 setInteractive 오브젝트에 누락된 pointerover/pointerout hover 핸들러 37개소 추가. QA에서 발견된 중복 hover 리스너 4건(ChefSelectScene 리스너 누적, WorldMapScene 엔드리스/adBtnBg 중복, GatheringScene 스킬 버튼 중복) 제거. 세이브 변경 없음(v31).

- QA: PASS (3차 최종 검증, 이슈 4건 전부 수정 완료)
- 스펙: `.claude/specs/2026-04-29-kc-phase93-scope.md`

### Phase 91 -- UI 과밀/침범 이슈 7건 수정 (2026-04-29)

ResultScene(스테이지명 중복 표시 수정, 섹션 여백 압축), MerchantScene(골드/탭 헤더 간격 확보, 분기 카드 텍스트 overflow 방지), ChefSelectScene(하단 버튼 3개 겹침 해소), MenuScene(미션 모달 탭 레이블 잘림 수정, 이벤트 배너/시즌 패스 숏컷 겹침 해소). 세이브 변경 없음(v31).

- QA: PASS (20/20 테스트, 13건 스크린샷 검증)
- LOW: 이벤트 배너 텍스트 일부 잘림 (wordWrap 160px 의도적 트레이드오프)
- 스펙: `.claude/specs/2026-04-29-kc-phase91-scope.md`

### Phase 90 -- 플레이테스트 이슈 20건 수정 (2026-04-29)

P0 4건(ShopScene 탭 depth, ResultScene 버튼 차단, 시즌 패스 undefined, ServiceScene 재료 0), P1 7건(에너지 HUD, 대화 지연, 아이콘 크기, 도구 이모지, 미션 안내, 판매 색상, 업그레이드 버튼), P2 9건(화살표 크기, 업적 아이콘, 텍스트 wrap, 카드 패딩, 노드 라벨, 재료 아이콘, 배경 stub, 시즌 패스 바로가기, 재클리어 문구) 수정. 세이브 변경 없음(v31).

- QA: PASS (23/23 테스트, 15건 스크린샷 검증)
- 스펙: `.claude/specs/2026-04-29-kc-phase90-scope.md`

이전 이력은 [CHANGELOG.md](CHANGELOG.md) 참조.
