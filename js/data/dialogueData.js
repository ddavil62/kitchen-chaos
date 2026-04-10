/**
 * @fileoverview 대화 스크립트 데이터.
 * Phase 14-1: JSON 형태의 대화 스크립트를 export한다.
 * 각 대화는 id, skippable 여부, lines 배열(speaker, portrait, text)로 구성된다.
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
      { speaker: '???', portrait: '\u{1F392}', text: '어이, 거기 꼬맹이! 여기서 뭐 해?' },
      { speaker: '포코', portrait: '\u{1F392}', text: '나? 나는 포코! 이 근처 떠돌이 행상인이지.' },
      { speaker: '포코', portrait: '\u{1F392}', text: '이 식당을 되살리겠다고? 하하, 대단한 배짱이네!' },
      { speaker: '미미', portrait: '\u{1F467}', text: '웃지 마! 할머니의 비밀 레시피만 있으면 된다구!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '비밀 레시피? 흥미롭군. 좋아, 내가 도와줄게.' },
      { speaker: '포코', portrait: '\u{1F392}', text: '대신 내 물건 좀 사줘. 윈윈이잖아? 하하!' },
    ]
  },
  merchant_first_meet: {
    id: 'merchant_first_meet',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '\u{1F392}', text: '야호~ 영업 잘 됐어? 여기 싱싱한 도구 왔다!' },
      { speaker: '미미', portrait: '\u{1F467}', text: '포코! 이 프라이팬 왜 이렇게 비싸?' },
      { speaker: '포코', portrait: '\u{1F392}', text: '비싼 게 아니라 가치가 있는 거지~' },
      { speaker: '포코', portrait: '\u{1F392}', text: '특히 이 프라이팬은 몬스터를 한 방에... 는 안 되지만' },
      { speaker: '포코', portrait: '\u{1F392}', text: '두세 방이면 되니까! 거의 한 방 아닌가?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '...논리가 좀 이상한데.' },
    ]
  },
  stage_first_clear: {
    id: 'stage_first_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', text: '해냈다! 첫 번째 스테이지 클리어!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '오오, 의외로 솜씨가 있네?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '의외는 무슨! 원래 잘한다고!' },
      { speaker: '포코', portrait: '\u{1F392}', text: '할머니 식당... 어쩌면 진짜 되살릴 수 있을지도?' },
      { speaker: '미미', portrait: '\u{1F467}', text: '당연하지! 기다려, 할머니!' },
    ]
  }
};

// ── 캐릭터 정의 (추후 Phase에서 확장) ──

/** @type {Object<string, {id: string, nameKo: string, portrait: string, color: number, role: string}>} */
export const CHARACTERS = {
  mimi: { id: 'mimi', nameKo: '미미', portrait: '\u{1F467}', color: 0xff8899, role: 'protagonist' },
  poco: { id: 'poco', nameKo: '포코', portrait: '\u{1F392}', color: 0xffaa33, role: 'merchant' },
  narrator: { id: 'narrator', nameKo: '', portrait: '', color: 0xcccccc, role: 'narrator' },
};
