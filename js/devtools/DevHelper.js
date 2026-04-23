/**
 * @fileoverview Kitchen Chaos 개발 전용 헬퍼 (window.__kc).
 * import.meta.env.DEV 환경에서만 로드된다 — 프로덕션 빌드에 포함되지 않는다.
 *
 * 사용법: 브라우저 콘솔에서 __kc.help() 참조.
 */

const SAVE_KEY = 'kitchenChaosTycoon_save';
const SAVE_VERSION = 15;

// ── 전체 스테이지 순서 (stageData.js 기준) ──
const STAGE_ORDER = [
  '1-1','1-2','1-3','1-4','1-5','1-6',
  '2-1','2-2','2-3',
  '3-1','3-2','3-3','3-4','3-5','3-6',
  '4-1','4-2','4-3','4-4','4-5','4-6',
  '5-1','5-2','5-3','5-4','5-5','5-6',
  '6-1','6-2','6-3',
  '7-1','7-2','7-3','7-4','7-5','7-6',
  '9-1','9-2','9-3','9-4','9-5','9-6',
  '10-1','10-2','10-3','10-4','10-5','10-6',
];

// ── 챕터별 완료 시 설정되는 storyFlags ──
const CHAPTER_FLAGS = {
  7:  { chapter7_cleared: true },
  9:  { chapter7_cleared: true, chapter9_cleared: true },
  10: { chapter7_cleared: true, chapter9_cleared: true, chapter10_cleared: true, chapter10_mid_seen: true, lao_joined: true },
  11: { chapter7_cleared: true, chapter9_cleared: true, chapter10_cleared: true, chapter10_mid_seen: true, lao_joined: true },
};

/**
 * 세이브 데이터를 로드한다. 없으면 기본값 반환.
 * @returns {object}
 */
function getSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : buildDefault();
  } catch {
    return buildDefault();
  }
}

/**
 * 세이브 데이터를 저장한다.
 * @param {object} data
 */
function setSave(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/**
 * 기본 세이브 데이터 골격을 생성한다.
 * @returns {object}
 */
function buildDefault() {
  return {
    version: SAVE_VERSION,
    stages: {},
    gold: 500,
    kitchenCoins: 0,
    upgrades: { fridge: 0, knife: 0, delivery_speed: 0, cook_training: 0 },
    unlockedRecipes: [],
    selectedChef: 'mimi_chef',
    cookingSlots: 2,
    tools: {
      pan: { count: 1, level: 1 },
      salt: { count: 0, level: 1 },
      grill: { count: 0, level: 1 },
      delivery: { count: 0, level: 1 },
      freezer: { count: 0, level: 1 },
      soup_pot: { count: 0, level: 1 },
      wasabi_cannon: { count: 0, level: 1 },
      spice_grinder: { count: 0, level: 1 },
    },
    tutorialBattle: true,
    tutorialService: true,
    tutorialShop: true,
    tutorialMerchant: true,
    tutorialEndless: true,
    season2Unlocked: false,
    seenDialogues: [],
    storyProgress: { currentChapter: 1, storyFlags: {} },
    endless: { unlocked: false, bestWave: 0, bestScore: 0, bestCombo: 0, lastDailySeed: 0 },
    soundSettings: { bgmVolume: 0.7, sfxVolume: 0.8, muted: false },
  };
}

// ── 챕터 번호 추출 헬퍼 ──
function chapterOf(stageId) {
  return parseInt(stageId.split('-')[0], 10);
}

// ── window.__kc 노출 ──
window.__kc = {

  /**
   * 지정한 스테이지 직전 상태로 세이브를 설정하고 리로드한다.
   * 예: __kc.go('9-6') → 9-1~9-5 클리어, 9-6 입장 직전
   * 예: __kc.go('8-1') → 7장까지 클리어, 8장 시작
   * @param {string} stageId
   */
  go(stageId) {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx === -1) {
      console.error(`❌ 알 수 없는 stageId: '${stageId}'\n사용 가능: ${STAGE_ORDER.join(', ')}`);
      return;
    }
    const chapter = chapterOf(stageId);
    const data = buildDefault();

    // 해당 스테이지 이전까지 모두 3성 클리어 처리
    for (let i = 0; i < idx; i++) {
      data.stages[STAGE_ORDER[i]] = { cleared: true, stars: 3, satisfaction: 100 };
    }

    // 시즌2 해금 (7장 이상)
    if (chapter >= 7) {
      data.season2Unlocked = true;
    }

    // 챕터 진행 상태
    data.storyProgress.currentChapter = chapter;
    data.storyProgress.storyFlags = { ...(CHAPTER_FLAGS[chapter - 1] || {}) };

    // 충분한 골드와 도구
    data.gold = 9999;
    data.tools.pan.count = 3;
    data.tools.salt.count = 2;
    data.tools.grill.count = 2;
    data.tools.delivery.count = 2;
    data.tools.freezer.count = 1;
    data.tools.soup_pot.count = 1;
    data.tools.wasabi_cannon.count = 1;

    // 6장까지 클리어됐으면 엔드리스 해금
    if (chapter >= 7) data.endless.unlocked = true;

    setSave(data);
    console.log(`✅ ${stageId} 직전 상태 설정 완료 (${idx}개 스테이지 클리어, chapter=${chapter}). 리로드...`);
    location.reload();
  },

  /**
   * 골드를 추가한다. 리로드 없이 즉시 반영 (다음 씬 전환 시 적용).
   * @param {number} [amount=9999]
   */
  gold(amount = 9999) {
    const data = getSave();
    data.gold = (data.gold || 0) + amount;
    setSave(data);
    console.log(`✅ 골드 +${amount} → 현재: ${data.gold}`);
  },

  /**
   * 모든 대사를 이미 본 것으로 처리한다 (스토리 스킵).
   * 이 설정 후에는 스토리 대사가 다시 재생되지 않는다.
   */
  skipStory() {
    const data = getSave();
    // storyData.js에 등록된 모든 dialogueId를 seenDialogues에 추가
    const allIds = [
      'season2_prologue','season2_yuki_intro','season2_lao_intro',
      'chapter7_intro','chapter7_clear','chapter7_boss',
      'chapter10_intro','chapter10_lao_joins','chapter10_clear','chapter10_mid','chapter10_yuki_clue',
      'chapter9_intro','chapter9_boss','chapter9_clear',
    ];
    const seen = new Set(data.seenDialogues || []);
    allIds.forEach(id => seen.add(id));
    data.seenDialogues = [...seen];
    setSave(data);
    console.log(`✅ ${seen.size}개 대사 스킵 처리 완료.`);
  },

  /**
   * 현재 세이브 상태를 콘솔에 출력한다.
   */
  state() {
    const data = getSave();
    const cleared = Object.keys(data.stages || {}).filter(k => data.stages[k].cleared);
    console.group('🍳 Kitchen Chaos 현재 상태');
    console.log('챕터:', data.storyProgress?.currentChapter);
    console.log('골드:', data.gold);
    console.log('클리어 스테이지:', cleared.length, '개', cleared);
    console.log('시즌2:', data.season2Unlocked);
    console.log('storyFlags:', data.storyProgress?.storyFlags);
    console.log('seenDialogues:', data.seenDialogues?.length, '개');
    console.log('버전:', data.version);
    console.groupEnd();
  },

  /**
   * 세이브를 완전히 초기화하고 리로드한다.
   */
  reset() {
    localStorage.removeItem(SAVE_KEY);
    console.log('✅ 세이브 초기화 완료. 리로드...');
    location.reload();
  },

  /**
   * 사용 가능한 명령어 목록을 출력한다.
   */
  help() {
    console.log(`🍳 Kitchen Chaos Dev Tools (window.__kc)

  __kc.go('9-6')    스테이지 직전 상태로 이동 (이전 모두 클리어)
  __kc.gold(9999)   골드 추가 (기본값 9999)
  __kc.skipStory()  모든 스토리 대사 스킵 처리
  __kc.state()      현재 세이브 상태 출력
  __kc.reset()      세이브 초기화 후 리로드
  __kc.help()       이 도움말

  스테이지 목록:
  ${STAGE_ORDER.join('  ')}`);
  },
};

// ── ?scene=tavern URL 파라미터 처리 (Phase A) ──
// BootScene 완료 후 TavernServiceScene으로 자동 전환.
// 프로덕션에서는 DevHelper 전체가 트리-쉐이킹 제거되므로 개발 환경 전용.
try {
  const _urlParams = new URLSearchParams(window.location.search);
  if (_urlParams.get('scene') === 'tavern') {
    const _waitForBoot = setInterval(() => {
      const game = window.__game;
      if (!game || !game.scene) return;
      const boot = game.scene.getScene('BootScene');
      // BootScene._bootComplete가 true가 되면 전환 트리거
      if (boot && boot._bootComplete) {
        clearInterval(_waitForBoot);
        // MenuScene이 이미 시작되었을 수 있으므로 stop 후 전환
        if (game.scene.isActive('MenuScene')) {
          game.scene.stop('MenuScene');
        }
        game.scene.start('TavernServiceScene');
        console.log('🍳 ?scene=tavern → TavernServiceScene 전환 완료');
      }
    }, 100);
  }
} catch { /* URL 파싱 실패 무시 */ }

console.log('🍳 Dev Tools 활성화 — __kc.help() 로 사용법 확인');
