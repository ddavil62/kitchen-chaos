/**
 * @fileoverview 대화 스크립트 데이터.
 * Phase 14-1: JSON 형태의 대화 스크립트를 export한다.
 * 각 대화는 id, skippable 여부, lines 배열(speaker, portrait, text)로 구성된다.
 *
 * 세계관: "식란(食亂)" — 음식의 미력(味力)이 폭주하여 식재료가 괴물로 변하는 자연 현상.
 * 미력사(味力師)는 조리 도구의 정화 마법으로 폭주한 식재료를 진정시키는 비밀 요리사 혈통.
 */

// ── 대화 스크립트 ──

/** @type {Object<string, {id: string, skippable: boolean, lines: Array<{speaker: string, portrait: string, text: string}>}>} */
export const DIALOGUES = {
  intro_welcome: {
    id: 'intro_welcome',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', text: '여기가... 할머니가 남겨주신 식당이라고?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '완전 폐허잖아! 거미줄이 메뉴판보다 많아!' },
      { speaker: 'narrator', portrait: '', text: '그날 밤, 식당 주변의 공기가 이상하게 떨리기 시작했다.' },
      { speaker: '미미', portrait: '\u{1F467}', text: '뭐, 뭐야?! 저 당근이... 움직이는 건가?!' },
      { speaker: '미미', portrait: '\u{1F467}', text: '당근이 칼을 들고 있어!! 당근이!! 칼을!!!' },
      { speaker: '???', portrait: '\u{1F392}', text: '조용히 해, 꼬맹이! 식란이 시작됐어!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '나는 포코. 네 할머니의 오랜 협력자지.' },
      { speaker: '포코', portrait: '\u{1F392}', text: '식란... 음식의 미력이 폭주해서 재료가 괴물로 변하는 현상이야.' },
      { speaker: '미미', portrait: '\u{1F467}', text: '미력? 식란? 무슨 소리야 대체?!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '네 할머니는 미력사였어. 조리 도구로 폭주한 식재료를 정화하는 비밀 요리사.' },
      { speaker: '포코', portrait: '\u{1F392}', text: '그리고 너도 그 혈통이야. 이 프라이팬 잡아봐.' },
      { speaker: 'narrator', portrait: '', text: '낡은 프라이팬이 미미의 손에서 은은하게 빛나기 시작했다.' },
      { speaker: '미미', portrait: '\u{1F467}', text: '뭐야 이거... 따뜻해... 그리고 왠지 기분이 좋은데?' },
      { speaker: '포코', portrait: '\u{1F392}', text: '역시! 미력사의 피는 못 속이는군!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '자, 이제부터 낮에는 식당 운영, 밤에는 식란 정화! 바쁘겠다~' },
      { speaker: '미미', portrait: '\u{1F467}', text: '잠깐, 나 아직 동의 안 했는데?!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '아 참, 내 도구들도 좀 사줘. 정화에 꼭 필요하거든. 할인은 없어!' },
    ]
  },
  merchant_first_meet: {
    id: 'merchant_first_meet',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '\u{1F392}', text: '야호~ 영업은 잘 됐어? 싱싱한 정화 도구 들고 왔다!' },
      { speaker: '미미', portrait: '\u{1F467}', text: '포코! 이 프라이팬 왜 이렇게 비싸? 정화 도구라며!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '미력이 깃든 도구는 원래 비싼 거야. 장인의 손맛이 들어갔거든!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '게다가 이 프라이팬으로 폭주한 양파를 패면... 아, 정화하면!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '싱싱한 양파가 되어 돌아온다고! 거의 자급자족 아닌가?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '패면... 이라고 할 뻔 했지?' },
      { speaker: '포코', portrait: '\u{1F392}', text: '정화라니까! 고급스러운 정화!' },
      { speaker: '미미', portrait: '\u{1F467}', text: '...결국 프라이팬으로 때리는 거잖아.' },
    ]
  },
  stage_first_clear: {
    id: 'stage_first_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', text: '해냈다! 식란 정화 완료!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '오호, 초보 미력사 치고는 솜씨가 있는데?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '초보라고 하지 마! 원래 요리학교 수석이었다고!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '요리 실력이랑 식란 정화는 좀 다른데... 뭐, 결과가 좋으니까.' },
      { speaker: '포코', portrait: '\u{1F392}', text: '정화된 재료들 봐. 전부 싱싱해! 내일 영업에 쓰면 되겠다.' },
      { speaker: '미미', portrait: '\u{1F467}', text: '밤새 싸우고 낮에 요리라니... 이게 할머니의 일상이었구나.' },
      { speaker: '포코', portrait: '\u{1F392}', text: '할머니 식당... 어쩌면 진짜 되살릴 수 있을지도?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '당연하지! 기다려, 할머니. 이 식당, 내가 지킬게!' },
    ]
  }
};

// ── 캐릭터 정의 (추후 Phase에서 확장) ──
// 세계관: 미력사(味力師) — 조리 도구의 정화 마법으로 식란을 잠재우는 비밀 요리사 혈통

/** @type {Object<string, {id: string, nameKo: string, portrait: string, color: number, role: string, desc: string}>} */
export const CHARACTERS = {
  mimi: { id: 'mimi', nameKo: '미미', portrait: '\u{1F467}', color: 0xff8899, role: 'protagonist', desc: '초보 미력사. 할머니의 식당을 물려받은 요리학교 졸업생.' },
  poco: { id: 'poco', nameKo: '포코', portrait: '\u{1F392}', color: 0xffaa33, role: 'merchant', desc: '정화 도구 전문 장인. 미력사 가문의 오랜 협력자.' },
  // 추후 Phase 14-2에서 추가 예정
  // rin: { id: 'rin', nameKo: '린', portrait: '\u{1F525}', color: 0xff4444, role: 'rival', desc: '불꽃 요리사. 미미의 라이벌이자 나중에 동료.' },
  // mage: { id: 'mage', nameKo: '메이지', portrait: '\u{1F9C1}', color: 0xcc88ff, role: 'researcher', desc: '디저트 전문 미력사. 식란의 원인을 학문적으로 추적.' },
  narrator: { id: 'narrator', nameKo: '', portrait: '', color: 0xcccccc, role: 'narrator', desc: '' },
};
