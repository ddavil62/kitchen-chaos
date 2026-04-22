/**
 * @fileoverview 대화 스크립트 데이터.
 * Phase 14-1: JSON 형태의 대화 스크립트를 export한다.
 * Phase 14-2b: portraitKey 필드 추가, CHARACTERS 확장 (린/메이지).
 * Phase 14-2c: 신규 대화 스크립트 10개 추가.
 * Phase 15: 신규 대화 스크립트 13개 추가 (챕터 2~6 메인 시나리오 + 사이드).
 * Phase 16: 튜토리얼 연동 2종, 영업 이벤트 3종, 선택지 샘플 1종 추가.
 * Phase 19-1: 시즌 2 캐릭터 2종(유키, 라오) CHARACTERS에 추가.
 * Phase 19-3: 시즌 2 프롤로그 대화 3종 추가 (season2_prologue, season2_yuki_intro, season2_lao_intro).
 * Phase 20: 7장 사쿠라 이자카야 대화 4종 추가 (chapter7_intro, chapter7_yuki_joins, chapter7_clear, yuki_side_7).
 * Phase 21: 10장 용의 주방 대화 4종 추가 (chapter10_intro, chapter10_lao_joins, chapter10_clear, lao_side_8).
 * Phase 22-1: chapter7_clear 복선 대사 삽입, 10장 추가 대화 3종 추가 (chapter10_yuki_clue, chapter10_mid, yuki_side_8).
 * Phase 24-1: chapter8_* → chapter10_* 번호 이동.
 * Phase 23-1: chapter9_intro, chapter9_boss, chapter9_clear 추가. CHARACTERS에 sake_oni 추가.
 * Phase 25-1: 11장 용의 주방 심층부 대화 3종 추가 (chapter11_intro, chapter11_mid, lao_side_11).
 * Phase 26-1: 12장 용의 궁전 결전 대화 5종 추가 (chapter12_intro, chapter12_lao_mid, chapter12_boss, chapter12_clear, lao_side_12). CHARACTERS에 sake_master 추가.
 * Phase 27-1: 13장 별빛 비스트로 대화 3종 추가 (chapter13_intro, chapter13_mid, mimi_side_13). CHARACTERS에 앙드레 추가.
 * Phase 27-3: chapter13_clear 대화 추가 (13-5 클리어 후, 14장 예고). 누적 61종.
 * Phase 28-1: 14장 비스트로 심층부 대화 3종 추가 (chapter14_intro, chapter14_mid, team_side_14). 누적 64종.
 * Phase 29-1: 15장 셰프 누아르 최종전 대화 5종 추가 (chapter15_boss, chapter15_clear, chapter15_epilogue, side_15a, side_15b). 누적 69종.
 * Phase 31-1: 16장 향신료 궁전 대화 3종 추가 (chapter16_intro, chapter16_mid, team_side_16). 누적 72종.
 * Phase 32-1: 16장 에필로그 + 17장 향신료 궁전 심층부 대화 4종 추가 (chapter16_epilogue, chapter17_intro, chapter17_mid, team_side_17). 누적 76종.
 * Phase 32-4: 18장 대화 6종 추가 (chapter18_intro, chapter18_mid, chapter18_boss, chapter18_clear, chapter18_epilogue, team_side_18). CHARACTERS에 masala_guide(아르준), maharaja 추가. 17장 ??? 대사 아르준으로 소급 수정. 누적 82종.
 * Phase 33-1: 19장 선인장 칸티나 대화 3종 추가 (chapter19_intro, chapter19_mid, team_side_19). 누적 85종.
 * Phase 34-1: 20장 칸티나 심층부 대화 3종 추가 (chapter20_intro, chapter20_mid, team_side_20). 누적 88종.
 * Phase 35-1: 21장 대화 6종 추가 (chapter21_intro, chapter21_mid, chapter21_boss, chapter21_clear, chapter21_epilogue, team_side_21). CHARACTERS에 el_diablo 추가. 누적 94종.
 * Phase 36-1: 22장 슈가 드림랜드 대화 3종 추가 (chapter22_intro, chapter22_mid, team_side_22). 누적 97종.
 * Phase 37-1: 23장 드림랜드 심층부 대화 3종 추가 (chapter23_intro, chapter23_mid, team_side_23). 누적 100종.
 * Phase 38-1: 24장 대화 6종 추가 (chapter24_boss, chapter24_mid, chapter24_final_battle,
 *   chapter24_ending, team_side_24, team_side_24b). 누적 ~106종. CHARACTERS에 queen_of_taste 추가.
 * Phase D 시나리오 수정: chapter22_intro 메이지 briefing 삽입, chapter16_mid~17장 아르준 speaker를 ???로 은닉(18장 공개 유지),
 *   chapter16_epilogue 포코/미미 예고 2줄 추가, side_15b 린 그룹2 이탈 briefing 5줄 추가.
 * Phase GH 시나리오 수정: (한숨) 지문 다양화(2건→0건), chapter21_boss 엘 디아블로 루차도르 색채 강화,
 *   team_side_24 메이지 내면 동기 대사 1줄 삽입.
 * 각 대화는 id, skippable 여부, lines 배열(speaker, portrait, portraitKey, text, choices?)로 구성된다.
 *
 * 세계관: "식란(食亂)" — 음식의 미력(味力)이 폭주하여 식재료가 괴물로 변하는 자연 현상.
 * 미력사(味力師)는 조리 도구의 정화 마법으로 폭주한 식재료를 진정시키는 비밀 요리사 혈통.
 */

// ── 대화 스크립트 ──

/** @type {Object<string, {id: string, skippable: boolean, lines: Array<{speaker: string, portrait: string, portraitKey?: string, text: string, choices?: Array<{label: string, next: number}>}>}>} */
export const DIALOGUES = {
  // ── 기존 3종 (Phase 14-1, portraitKey 추가) ──

  intro_welcome: {
    id: 'intro_welcome',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '여기가... 할머니가 남겨주신 식당이라고?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '완전 폐허잖아! 거미줄이 메뉴판보다 많아!' },
      { speaker: 'narrator', portrait: '', text: '그날 밤, 식당 주변의 공기가 이상하게 떨리기 시작했다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '뭐, 뭐야?! 저 당근이... 움직이는 건가?!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '당근이 칼을 들고 있어!! 당근이!! 칼을!!!' },
      { speaker: '???', portrait: '\u{1F431}', portraitKey: 'poco', text: '조용히 해, 꼬맹이! 식란이 시작됐어!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '나는 포코. 네 할머니의 오랜 협력자지.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '식란... 음식의 미력이 폭주해서 재료가 괴물로 변하는 현상이야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '미력? 식란? 무슨 소리야 대체?!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '네 할머니는 미력사였어. 조리 도구로 폭주한 식재료를 정화하는 비밀 요리사.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '그리고 너도 그 혈통이야. 이 프라이팬 잡아봐.' },
      { speaker: 'narrator', portrait: '', text: '낡은 프라이팬이 미미의 손에서 은은하게 빛나기 시작했다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '뭐야 이거... 따뜻해... 그리고 왠지 기분이 좋은데?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '역시! 미력사의 피는 못 속이는군!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '자, 이제부터 낮에는 식당 운영, 밤에는 식란 정화! 바쁘겠다~' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '잠깐, 나 아직 동의 안 했는데?!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '아 참, 내 도구들도 좀 사줘. 정화에 꼭 필요하거든. 할인은 없어!' },
    ]
  },
  merchant_first_meet: {
    id: 'merchant_first_meet',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '야호~ 영업은 잘 됐어? 싱싱한 정화 도구 들고 왔다!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코! 이 프라이팬 왜 이렇게 비싸? 정화 도구라며!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '미력이 깃든 도구는 원래 비싼 거야. 장인의 손맛이 들어갔거든!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '게다가 이 프라이팬으로 폭주한 양파를 패면... 아, 정화하면!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '싱싱한 양파가 되어 돌아온다고! 거의 자급자족 아닌가?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '패면... 이라고 할 뻔 했지?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '정화라니까! 고급스러운 정화!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '...결국 프라이팬으로 때리는 거잖아.' },
    ]
  },
  stage_first_clear: {
    id: 'stage_first_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '해냈다! 식란 정화 완료!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '오호, 초보 미력사 치고는 솜씨가 있는데?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '초보라고 하지 마! 원래 요리학교 수석이었다고!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '요리 실력이랑 식란 정화는 좀 다른데... 뭐, 결과가 좋으니까.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '정화된 재료들 봐. 전부 싱싱해! 내일 영업에 쓰면 되겠다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '밤새 싸우고 낮에 요리라니... 이게 할머니의 일상이었구나.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '할머니 식당... 어쩌면 진짜 되살릴 수 있을지도?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '당연하지! 기다려, 할머니. 이 식당, 내가 지킬게!' },
    ]
  },

  // ── 신규 10종 (Phase 14-2c) ──

  chapter1_start: {
    id: 'chapter1_start',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '좋아, 첫 번째 식란 정화다! 긴장되지만 할 수 있어!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '그 자신감 좋은데... 일단 당근들이 몇 마리나 오는지 알고 가자.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '몇 마리?! 당근이 떼거리로 오는 거야?!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '식란은 규모가 클수록 많이 오지. 오늘은... 음, 좀 많다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '됐어! 프라이팬 꽉 잡고 간다!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '아 참, 그 프라이팬 지금 업그레이드하면 20% 할인인데—' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '나중에!!' },
    ]
  },
  chapter1_clear: {
    id: 'chapter1_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '휴우... 1장 식란 전부 정화 완료! 파스타 보스도 해치웠어!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '파스타 보스가 꽤 질겼는데? 면발이 칼날처럼 날아오더만.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '솔직히 면발에 맞을 뻔 했어... 탄력이 장난 아니었다고!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '하지만 정화된 파스타 면은 최고급이야! 오늘 메뉴에 올려봐.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '방금 나한테 달려들던 녀석을 요리에 쓰라고?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '그게 미력사의 길이지~ 정화해서 쓰는 거야. 에코 라이프!' },
      { speaker: 'narrator', portrait: '', text: '1장 클리어. 미미의 미력사 수련은 이제 막 시작되었을 뿐이다.' },
    ]
  },
  chapter2_intro: {
    id: 'chapter2_intro',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '2장이라... 동양 요리 구역? 여긴 좀 다른 분위기네.' },
      { speaker: 'narrator', portrait: '', text: '그때, 식당 맞은편에서 불꽃이 솟아올랐다.' },
      { speaker: '???', portrait: '\u{1F525}', portraitKey: 'rin', text: '거기! 이 구역 식란은 내가 맡았으니까 빠져!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '누, 누구야?! 왜 프라이팬에서 불이 나와?!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '린이야. 불꽃의 미력사. 너 같은 초보한테 이 구역은 무리라고.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(속삭임) 저 아이... 유명한 불꽃 미력사 가문의 후계자야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '초보?! 나도 파스타 보스를 혼자 정화했다고!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '파스타 하나로? 하, 흥미롭네. 그럼 증명해 봐!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '아이고... 둘 다 불이야 불. 프라이팬 태우지 말고...' },
    ]
  },
  rin_first_meet: {
    id: 'rin_first_meet',
    skippable: true,
    lines: [
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...인정할 건 인정해야지. 솜씨가 있네, 초보.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '또 초보? 방금 스테이지 클리어한 사람한테?' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '한 번 클리어한 걸로 자만하면 안 돼. 식란은 점점 강해지니까.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '...너도 식란이랑 싸우는 거야?' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '당연하지. 우리 가문은 대대로 화염 정화를 담당했어.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '다음엔 내가 먼저 정화한다. 기다려 봐!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '뭐야 저 사람... 라이벌 선언이야?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '경쟁은 좋은 거야~ 참, 불꽃 미력사용 도구도 있는데—' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '지금은 영업 얘기 좀 하지 마!!' },
    ]
  },
  mage_introduction: {
    id: 'mage_introduction',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '3장은 씨푸드 바? 바다 냄새가 나네...' },
      { speaker: 'narrator', portrait: '', text: '해변가 연구소에서 안경을 쓴 소녀가 나타났다.' },
      { speaker: '???', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '혹시... 미력 반응이 감지되는 분이신가요?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '네? 미력 반응이요?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '아, 실례. 저는 메이지. 식란 현상을 학술적으로 연구하고 있어요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '이 해변에서 비정상적인 미력 농도가 측정되었는데... 흥미롭군요.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '연구원이라... 식란의 원인을 조사 중인 거야?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '네. 식란은 자연현상이 아닐 수도 있어요. 미력의 근원지가 있을 거예요.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '자연현상이 아니라고? 그럼 누가 일부러...?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '아직 확실하진 않아요. 하지만 데이터는 거짓말을 하지 않죠.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '정화 과정에서 수집되는 미력 잔여물... 혹시 모아줄 수 있나요?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '잘 모르겠지만, 도움이 된다면 당연하지!' },
    ]
  },
  poco_discount_fail: {
    id: 'poco_discount_fail',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코~ 이번에는 좀 깎아줘. 단골이잖아!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '단골? 두 번 온 걸로 단골이라고?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '두 번이면 충분하지! VIP 대우 해줘!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '내 VIP 기준은 최소 100회 구매야. 아직 98회 남았어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그건 평생 할인 안 해주겠다는 소리잖아!!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '에이~ 그래도 맛있는 정보는 공짜로 줄게.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '도구 레벨을 올리면 정화 효율이 훨씬 좋아진다는 거!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그건 이미 알아!! 업그레이드 비용이나 깎아줘!!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '하하... 다음에 또 와~' },
    ]
  },
  stage_boss_warning: {
    id: 'stage_boss_warning',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '잠깐! 이 구역에서 엄청난 미력이 느껴져...' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '엄청난 미력? 보스급 식란이라는 거야?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '맞아. 보스급 식재료는 일반 녀석들과 차원이 다르거든.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '체력도 높고, 특수 능력도 있어. 도구 배치를 신중하게 해야 해.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '알겠어! 프라이팬 최대 화력으로 간다!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '무작정 화력만으론 안 돼! 다양한 도구를 조합해 봐.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '...참, 보스전 전용 프리미엄 도구 세트가 지금 할인—' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '싸울 때도 장사 얘기야?!' },
    ]
  },
  after_first_loss: {
    id: 'after_first_loss',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '으으... 재료를 못 모았어. 영업도 못 하고...' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '괜찮아, 괜찮아. 첫술에 배부를 순 없는 법이야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '할머니는 이런 적 없었겠지...' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '무슨 소리! 네 할머니도 처음엔 매일 실패했어.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '한번은 당근 한 마리한테 쫓겨서 식당 지붕까지 도망간 적도 있다고.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '정말?! 할머니가?!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '진짜야. 그래도 포기 안 했으니까 이 식당이 있는 거지.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '...그래. 나도 포기 안 해! 다시 해보자!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '그 정신이야! 도구 보강도 생각해 보고~ 특별 세일은 안 하지만!' },
    ]
  },
  chapter3_rin_joins: {
    id: 'chapter3_rin_joins',
    skippable: true,
    lines: [
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...또 만났네, 초보.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '아직도 초보라고 불러? 여기까지 온 실력을 봐!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '솔직히... 인정해. 네 성장 속도는 비정상적이야.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '오호~ 린이 칭찬을 하다니! 이건 역사적인 순간이야.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '시끄러, 장사꾼! ...이 구역 식란이 심상치 않아.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '혼자서는 무리야. 같이 정화하자.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '린이... 동료로 함께하겠다는 거야?' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '오해하지 마! 이건 효율적인 전략적 협력이야.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '츤데레는 빼고 말해~ 환영해, 린!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '츤데레가 아니라고!!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '하하! 환영해, 린! 같이 힘내자!' },
    ]
  },
  mage_research_hint: {
    id: 'mage_research_hint',
    skippable: true,
    lines: [
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미미 씨, 잠깐 들러주셨네요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '연구 진행 상황을 공유하고 싶었어요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '식란 발생 패턴을 분석한 결과, 흥미로운 점을 발견했어요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '식란이 갈수록 강해지는 건 자연 순환이 아닌 것 같아요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미력 농도가 특정 지점을 중심으로 동심원 형태로 퍼지고 있거든요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '누군가, 혹은 무언가가 미력을 의도적으로 증폭시키고 있을 가능성이...' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '아직 가설 단계이지만, 정화를 계속하면서 데이터를 더 모아야 해요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미미 씨의 정화 활동이 큰 도움이 되고 있어요. 감사합니다.' },
    ]
  },

  // ── 신규 13종 (Phase 15) ──

  chapter2_clear: {
    id: 'chapter2_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '스시 쇼군 해치웠다! 동양 식란 정화 완료!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '정화된 스시 재료... 특상급이야! 오늘 메뉴에 올려!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '(나타나며) ...그 보스를 혼자 정화했다고?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '보고 있었으면 도와줄 것이지!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '도울 필요가 없었으니까. 하지만... 인정해. 넌 생각보다 강해.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '방금... 칭찬했어?' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '착각이야! 다음엔 내가 먼저 정화한다!' },
      { speaker: 'narrator', portrait: '', text: '한편, 해변가 연구소에서 누군가 미력 데이터를 기록하고 있었다...' },
    ]
  },
  chapter3_clear: {
    id: 'chapter3_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '크라켄 정화 완료! 다리가 너무 많아서 힘들었어!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '마지막 결정타는 내 화염이었지. 감사는 안 해도 돼.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '둘 다 잘했어~ 정화된 해산물이 이렇게 많다니... 씨푸드 뷔페 하자!' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '(등장) 잠깐, 중요한 발견이 있어요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '크라켄의 미력 잔여물을 분석했는데, 삼각측량이 가능해졌어요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '식란의 미력이 수렴하는 좌표가... 대략 남서쪽 화산 지대예요.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '화산? ...거기가 미력 근원이라는 거야?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '아직 가설이에요. 하지만 갈수록 확실해지고 있어요.' },
      { speaker: 'narrator', portrait: '', text: '식란의 실체가 서서히 드러나기 시작했다.' },
    ]
  },
  chapter4_intro: {
    id: 'chapter4_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '화산 지대. 대기 중 미력 농도가 급격히 상승했다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '여기... 공기가 달라. 매콤하면서 뜨거운 느낌?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미력 농도가 이전 구역의 3배예요. 근원지가 가까워지고 있어요.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '불꽃 미력사인 나도 이 정도 열기는 좀 부담인데...' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '화산 지대 식재료는 정화하면 최고급 BBQ 재료야! 기대돼!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코, 지금 상황 파악 좀...' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '뭐? 위기와 기회는 한 끗 차이야!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...저 고양이는 정말 대단해. 다른 의미로.' },
    ]
  },
  chapter4_mage_joins: {
    id: 'chapter4_mage_joins',
    skippable: true,
    lines: [
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미미 씨, 잠깐 기다려 주세요!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '메이지? 여기까지 직접 온 거야?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '연구실에서 데이터만 보는 건 한계가 있어요. 현장에서 직접 확인해야 해요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '그리고... 저도 디저트 미력사이거든요. 전투도 할 수 있어요.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '연구원이 전투를? ...말은 쉽지.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '(디저트 도구를 꺼내며) 보여드릴까요?' },
      { speaker: 'narrator', portrait: '', text: '메이지의 도구에서 차가운 미력이 흘러나왔다. 달콤하면서도 날카로운.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...인정. 꽤 하잖아.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '우와! 3인 팀 결성! 이 기념으로 도구 3+1 세트 할인\u2014' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '분위기 좀 살려줘, 포코!!' },
    ]
  },
  chapter4_clear: {
    id: 'chapter4_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '라바 디저트 골렘... 정화 완료! 엄청 뜨거웠어!' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '잠깐, 골렘 내부에서 뭔가 발견했어요.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '이건... 인공 미력 증폭 장치예요. 자연 식란이 아니에요!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '뭐?! 누군가 일부러 식란을 일으킨다는 거야?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그럼 지금까지 우리가 싸운 식란이 전부...' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '누군가가 의도적으로 미력을 증폭시키고 있어요. 이 장치가 증거예요.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '...나도 알고 있었어. 네 할머니도 이 정체를 쫓다가 멈췄지.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코?! 알고 있었다고?! 왜 말 안 했어!' },
      { speaker: 'narrator', portrait: '', text: '식란의 이면에 감춰진 진실이 모습을 드러내기 시작했다.' },
    ]
  },
  chapter5_intro: {
    id: 'chapter5_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '마법사 디저트 카페. 달콤한 미력이 역겹게 폭주한 공간.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '여기가 미력 근원지에 가장 가까운 지점이에요.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '공기가... 달콤한데 무거워. 머리가 어지러워.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '집중해. 여기서 방심하면 위험해.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '어라? 포코는? 분명 같이 왔는데...' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...사라졌어? 그 고양이가?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미력 반응이 급변했어요. 포코 씨에게 무슨 일이...!' },
    ]
  },
  rin_side_5: {
    id: 'rin_side_5',
    skippable: true,
    lines: [
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...미미. 잠깐 얘기 좀 하자.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '린? 무슨 일이야? 린이 먼저 말 거는 건 처음인데.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '왜 포기 안 하는 거야? 포코도 사라졌고, 식란은 갈수록 강해지는데.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '할머니가 여기서 포기 안 했으니까. 나도 이 식당을 지킬 거야.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...나도 비슷해. 우리 가문이 못 끝낸 싸움이 있거든.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그래서 여기까지 온 거구나. 린도 지키고 싶은 게 있는 거지?' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '(고개를 돌리며) ...오해하지 마. 전략적 판단이야.' },
    ]
  },
  chapter5_clear: {
    id: 'chapter5_clear',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '마스터 파티시에 정화 완료! ...포코! 어디 있어?!' },
      { speaker: 'narrator', portrait: '', text: '무너진 파티시에 뒤편에서 포코가 비틀거리며 나타났다.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '으으... 여기야, 여기...' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코! 괜찮아?! 누가 납치한 거야!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '그 놈... 자신을 \'퀴진 갓\'이라고 했어. 요리의 신이라고.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '퀴진 갓? 요리의 신?' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '전설에만 나오던... 수백 년 전 미력사들이 봉인한 존재!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '봉인이 풀리고 있어. 식란은 그놈이 부활하려고 일으킨 거야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그 퀴진 갓이 할머니도...?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(고개를 끄덕이며) ...네 할머니의 미완성 싸움이야. 끝내야 해.' },
    ]
  },
  chapter6_intro: {
    id: 'chapter6_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '그랑 가스트로노미. 세상에서 가장 고귀한 요리의 전당이 식란에 잠식되었다.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미력 농도 최고치... 이 안에 퀴진 갓이 있어요.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '여기가 끝이야. 다 정리하자.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '이건 내가 갚아야 할 빚이기도 해. 네 할머니한테.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '할머니의 프라이팬이... 전보다 더 뜨겁게 빛나고 있어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '(도구를 꽉 쥐며) 가자. 끝내러.' },
      { speaker: 'narrator', portrait: '', text: '미력사 미미와 동료들의 최종 결전이 시작된다.' },
    ]
  },
  team_side_6: {
    id: 'team_side_6',
    skippable: true,
    lines: [
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '이 다음이 마지막이야. 각오는 됐어?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '당연하지. 여기까지 왔잖아.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '지면 죽는다. 이기면... 같이 밥이나 먹자.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '린이 밥 같이 먹자고 하다니... 진짜 최종전이긴 하네.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '승률 계산은 패스할게요. 데이터보다 경험이 중요한 순간이니까.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '이기면 파티 비용은 내가 낸다. 도구 판촉은 내일부터 쉬고!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코가 돈을 쓰겠다니... 진짜 진심이구나.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '이 정도는 해야지! ...단, 파티 음식 재료비는 별도야.' },
    ]
  },
  chapter6_final_battle: {
    id: 'chapter6_final_battle',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '거대한 미력의 소용돌이 속에서 \'무언가\'가 깨어난다.' },
      { speaker: '퀴진 갓', portrait: '', text: '수백 년이다... 드디어 이 봉인에서 벗어난다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '당신이 퀴진 갓?! 식란을 일으킨 거야?!' },
      { speaker: '퀴진 갓', portrait: '', text: '요리의 미력은 신인 내 것이다. 너희 인간이 감히 요리를 즐기다니.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '요리는 모두의 거야! 누군가를 위해 만드는 거라고!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '저놈이... 네 할머니도 막으려 했던 존재야!' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '말은 나중에! 먼저 정화한다!' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '전원 미력 집중! 지금이에요!' },
      { speaker: 'narrator', portrait: '', text: '최후의 식란 정화가 시작된다.' },
    ]
  },
  chapter6_ending: {
    id: 'chapter6_ending',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '퀴진 갓이 정화되었다. 세상의 식란이 모두 잠잠해졌다.' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '미력 농도가 정상으로 돌아왔어요. 식란 근원이 소멸했습니다.' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '...해냈어. 진짜로. (작게 웃으며)' },
      { speaker: '린', portrait: '\u{1F525}', portraitKey: 'rin', text: '잘했어. 오해하지 마, 칭찬 아냐.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '완전 칭찬이잖아!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(눈물) 드디어... 네 할머니가 못 끝낸 걸 네가 해냈어, 미미.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '울지 마, 포코! 나도 울잖아!' },
      { speaker: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', text: '이 연구 결과로 세계 최초의 식란 해명 논문을 쓸 수 있겠어요. 감사합니다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '고마워, 모두. 혼자였으면 절대 못 했어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '할머니, 식당 지켰어. 앞으로도 여기서, 계속 지킬게.' },
      { speaker: 'narrator', portrait: '', text: '식란이 사라진 세상. 하지만 미미의 식당에는 오늘도 손님이 찾아온다. 맛있는 요리와 함께.' },
    ]
  },
  poco_side_4: {
    id: 'poco_side_4',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '화산 지역 재료가 정화되면 질이 최고야! BBQ 메뉴 추가해 봐!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '지금 식당 하나도 바쁜데 BBQ까지?!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '그러니까 화력 좋은 도구가 필요한 거지~ 마그마 강화 프라이팬 어때?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '마그마 강화?! 그거 안전한 거야?!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '미력사 전용이니까 괜찮아! 일반인이 쓰면... 음, 좀 위험하지.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그건 안 괜찮은 거잖아!! 다음에 봐, 포코!' },
    ]
  },

  // ── 신규 6종 (Phase 16) ──

  // ── Phase 16-1: 튜토리얼 대화 2종 ──

  tutorial_tool_placed_dialogue: {
    id: 'tutorial_tool_placed_dialogue',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '오, 배치 감각이 있는데? 할머니의 피는 속일 수 없군!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '도구는 경로 옆에 놓아야 효과적이야. 잘 기억해 둬!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '이렇게 하면 식재료들을 정화할 수 있는 거지?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '맞아! 녀석들이 경로를 따라 오면 도구가 알아서 정화해 줄 거야.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '자, 이제 웨이브 시작 버튼을 눌러봐! 식란이 온다!' },
    ]
  },
  tutorial_first_serve_dialogue: {
    id: 'tutorial_first_serve_dialogue',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '첫 번째 서빙 완료! 손님이 맛있게 먹고 있어!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '잘했어! 정화한 재료로 만든 요리는 역시 다르다니까~' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '이제 좀 식당 분위기가 나는 것 같아!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '이 페이스를 유지해! 시간이 끝나기 전에 최대한 서빙하는 거야.' },
    ]
  },

  // ── Phase 16-2: 영업 이벤트 대화 3종 ──

  event_happy_hour_dialogue: {
    id: 'event_happy_hour_dialogue',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '갑자기 손님이 몰려오고 있어?! 무슨 일이야!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '해피아워야! 어디선가 소문이 난 모양이군~' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '소문?! 아직 개업한 지 얼마 안 됐는데!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '미력사가 만든 요리는 소문이 빠르거든. 자, 빨리 조리 시작!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '알겠어! 최대한 빨리 서빙할게!' },
    ]
  },
  event_food_review_dialogue: {
    id: 'event_food_review_dialogue',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '저, 저 사람... 미식 평론가 같아! 메모하면서 먹고 있어!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '오호~ 맛집 리뷰어가 왔군! 이건 대박 기회야!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '서빙 5명 분량을 완벽하게 해내면 좋은 평가를 받을 수 있어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '긴장되지만... 할머니 식당의 명예를 위해! 최선을 다할게!' },
    ]
  },
  event_kitchen_accident_dialogue: {
    id: 'event_kitchen_accident_dialogue',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '으악! 조리대에서 불이?! 어떡해!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '침착해! 주방 사고는 가끔 일어나는 거야!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '조리 슬롯 하나를 잠깐 못 쓰게 되겠지만, 다른 슬롯으로 버텨!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '알겠어! 하나 없어도 해낼 수 있어! 아마도!' },
    ]
  },

  // ── Phase 16-3: 선택지 샘플 대화 1종 ──

  choice_sample_merchant: {
    id: 'choice_sample_merchant',
    skippable: true,
    lines: [
      // 0: 도입
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '이번에 새 정화 도구 세트가 들어왔는데~ 관심 있어?' },
      // 1: 선택지 제시
      {
        speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi',
        text: '음... 어떻게 할까?',
        choices: [
          { label: '할인해 달라고 하기', next: 2 },
          { label: '그냥 구경만 할게', next: 5 },
        ]
      },
      // 2: 할인 요청 분기
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '포코~ 단골인데 좀 깎아줘! 제발~!' },
      // 3
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '에이~ 또 할인? 미력사 도구는 원가가 비싸다니까!' },
      // 4
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '대신 다음에 특별한 거 하나 서비스로 줄게. 약속!' },
      // 5: 구경만 분기
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '오늘은 구경만 할게~ 눈이 즐거우니까!' },
      // 6
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '구경만?! 만지면 사야 한다고! ...농담이야, 농담!' },
      // 7 (공통 결말)
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '다음에 또 와~ 맛있는 도구 많이 준비해 둘게!' },
    ]
  },

  // ── 시즌 2 프롤로그 (Phase 19-3) ──

  season2_prologue: {
    id: 'season2_prologue',
    lines: [
      { speaker: 'narrator', portrait: '', text: '요리의 신이 정화되고 며칠이 흘렀다. 식당 앞에 낯선 봉투가 놓여 있었다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '세계 미력사 연합... WCA? 처음 들어보는 곳인데.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(편지를 읽으며) 해외에서 동시다발 식란이 재발하고 있대. 일본, 중국, 인도...' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '우리 쪽 봉인만 풀린 게 아니었구나. 다른 나라에도 봉인이 있었던 거야?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(진지하게) 아마도. WCA가 도움을 요청하고 있어. 할머니도 이 연합을 알고 계셨을지 몰라.' },
    ],
  },
  season2_yuki_intro: {
    id: 'season2_yuki_intro',
    lines: [
      { speaker: 'narrator', portrait: '', text: 'WCA 연락을 받고 며칠 후, 한 사람이 직접 찾아왔다.' },
      { speaker: '???', portrait: '\u2744\uFE0F', text: '미미... 맞죠. WCA에서 당신 팀 얘기를 들었어요.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '네, 맞아요. 처음 뵙는데... 어떻게 오셨어요?' },
      { speaker: '유키', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '유키라고 해요. 일본 미력사예요. (낮게) 제 고향 이자카야가 식란에 잠식됐어요. 도움을 요청드리고 싶어요.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨! 물론이죠, 같이 가요!' },
      { speaker: '유키', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(살짝 놀라며) ...바로 결정하시는군요. 감사합니다.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(작게) 꽤 오래 혼자 버텨온 사람이네. 눈빛이 그래.' },
    ],
  },
  season2_lao_intro: {
    id: 'season2_lao_intro',
    lines: [
      { speaker: 'narrator', portrait: '', text: '일본 식란 정화 임무가 계속되던 어느 날, WCA로부터 낯선 연락이 도착했다.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(읽으며) 중국 쪽이야. 라오라는 사람이 가문의 드래곤 웍이 식란에 오염됐다며 도움을 요청했어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '라오... 어떤 사람이야?' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: 'WCA 정식 소속은 아니야. 비공개로 연락을 취했어. 자존심 강해 보이는데 — 먼저 도움을 구했다는 건 그만큼 심각하다는 거겠지.' },
    ],
  },

  // ── 시즌 2: 7장 사쿠라 이자카야 (Phase 20) ──

  chapter7_intro: {
    id: 'chapter7_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '일본 어딘가, 벚꽃 내음이 나는 전통 이자카야 마을. 처음으로 함께 땅을 밟았다.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(조용히 걸으며) 여기야... 내 고향이야. 이렇게 된 줄은 몰랐어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨 고향이 이런 상태라니...' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '이자카야 거리 전체가 식란에 잠식됐어. 길드 동료들도 연락이 끊겼고.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '사케 오니야. 이 식란의 핵이 그 녀석이야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '사케 오니?' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '쓰러뜨리면 마을이 회복될 거야. 이게 처음부터 내 목적이었어.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(진지하게) 조심해야 해. 우리 구역 식란보다 오래된 놈이야.' },
    ],
  },
  chapter7_yuki_joins: {
    id: 'chapter7_yuki_joins',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '7-3 클리어 직후. 유키가 고향 마을의 폐허가 된 길드 본부 앞에 선다.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...여기가 길드 훈련소였어. 내가 처음 정화를 배운 곳이야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨, 괜찮으세요? 많이 힘들어 보여요.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(고개를 끄덕이며) ...괜찮아. 감상에 잠길 시간이 없어. 사케 오니가 이 모든 걸 일으킨 주범이야.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '미미... 나도 같이 싸울게. 처음부터 그러고 싶었지만, 혼자 처리해야 한다고 생각했어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '혼자 처리하실 필요 없잖아요! 우리 팀이잖아요, 유키 씨.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '환영해, 유키! 그나저나 새 동료 특별 도구 세트가\u2014' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(차갑게) 지금은 됐어요.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(작게) 역시 성격이 차갑다...' },
    ],
  },
  chapter7_clear: {
    id: 'chapter7_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '이자카야를 장악한 오니 전령이 정화되었다. 마을에 숨통이 트인다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '해냈다! 오니 전령 정화 완료!' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...고마워. 혼자였다면 절대 못 했을 거야.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(마을을 둘러보며) 이제 재건할 수 있겠어. 미력사 길드도 다시 세울 수 있고.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '정화된 사케... 이게 최상급 주류가 되겠군. 이자카야 다시 열면 대박 날 텐데~' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '아직 이자카야 심층부가 남아 있어. 지하 봉인 흔적... 계속 파봐야 해.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '당연하지. 같이 가자.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...그런데 한 가지 신경 쓰이는 게 있어. 이자카야 아래 지하 구조물 — 봉인의 핵심이 거기 있을 수 있어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '봉인의 핵심? 그게 뭔데?' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '자세한 건 나도 몰라. 하지만 미력사 길드 고문서에 그런 기록이 있어. 지금은 일단 움직이자.' },
      { speaker: 'narrator', portrait: '', text: '7장 클리어. 유키가 정식으로 미미 팀의 일원이 되었다.' },
    ],
  },
  yuki_side_7: {
    id: 'yuki_side_7',
    skippable: true,
    lines: [
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '미미, 잠깐 좋을까.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '응? 무슨 일이에요, 유키 씨?' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...내가 왜 혼자 처리하려 했는지 알아? 동료를 잃을 게 두려웠어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨...' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '길드 동료들이 식란에 당했을 때, 내가 곁에 없었거든. 그래서 다음엔 혼자 다 막겠다고 생각했어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그건 유키 씨 잘못이 아니에요. 그리고 혼자 전부 막을 수 있는 사람은 없어요.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...알아. 이제는 알 것 같아. 함께라서 이길 수 있었던 거니까.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(뒤에서 훌쩍) 좋은 얘기다... 참, 동료 할인 이벤트\u2014' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '포코 씨. 저리 가 줄래요.' },
    ],
  },

  // ── 시즌 2: 10장 용의 주방 (Phase 21/24-1) ──

  chapter10_intro: {
    id: 'chapter10_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '중국 어딘가. 황금빛 용이 새겨진 거대한 궁전 주방 앞, 한 사람이 기다리고 있었다.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(크게 웃으며) 어이! 먼 길 왔어. 나는 라오야. 이 주방 주인 — 아, 원래 주인. 지금은 드래곤 웍한테 뺏겼지만!' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '라오 씨! 저희가 도움이 될 수 있을 것 같아서요.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(팔짱을 끼며) 솔직히 말할게. 혼자 처리하려다 안 됐어. 가문 주방에 외부인 들이는 건 — 쉬운 결정이 아니었는데.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(주변을 살피며) 미력이 강해. 단순한 오염이 아니야.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(진지하게) 맞아. 드래곤 웍 — 이 주방 심층부를 통째로 삼켰어. 같이 들어가서 끝내보자고.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '연락 주셔서 다행이에요. 같이 해봐요!' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(긴장하며) 용 형상의 웍... 이건 예사 보스가 아니겠군.' },
    ],
  },
  chapter10_lao_joins: {
    id: 'chapter10_lao_joins',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '10-3 클리어 직후. 라오가 오래된 웍 앞에서 발걸음을 멈췄다.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '...이 웍으로 할아버지가 첫 요리를 가르쳐줬어요.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '라오 씨... 이 웍이 정말 소중하군요.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(고개를 들며) ...처음 연락할 때 망설였어요. 가문의 일을 외부에 부탁하는 건 — 쉬운 일이 아니라서.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '그래도 연락해줘서 다행이에요. 혼자였으면 더 힘들었을 거예요.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(작게) ...나, 이 정화에 끝까지 같이 있어도 될까요?' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '당연히 같이 해야죠! 유키 씨도 처음엔 혼자 하려 했는데, 이젠 우리 팀이잖아요.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(차갑게) ...나는 그런 말 한 적 없어.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '했어.' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '환영해요, 라오!' },
      { speaker: 'narrator', portrait: '', text: '라오가 정식으로 미미 팀의 일원이 되었다.' },
    ],
  },
  chapter10_clear: {
    id: 'chapter10_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '드래곤 웍이 정화되었다. 가문의 주방에 평화가 돌아온다.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '해냈다! 드래곤 웍 정화 완료!' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(웍을 천천히 어루만지며) ...할아버지 웍이 돌아왔어. 감사합니다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '...수고했어요, 라오 씨.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(놀란 듯) ...유키 씨가 그런 말을 다 하시네요.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(고개를 돌리며) 사실이니까 한 거예요.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '이제 진짜 팀이 된 것 같아! 다음엔 어디야, 포코 씨?' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '다음은 유럽 쪽에서 연락이 왔어. 파리의 고급 레스토랑이 식란의 진원지라고 하더군.' },
      { speaker: 'narrator', portrait: '', text: '10장 클리어. 라오가 정식으로 미미 팀의 일원이 되었다.' },
    ],
  },
  lao_side_8: {
    id: 'lao_side_8',
    skippable: true,
    lines: [
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '미미, 잠깐 좋을까.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '응? 무슨 일이에요, 라오 씨?' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '웍이라는 건 말이야... 불과 재료와 요리사가 하나가 되는 순간이야. 그 웍이 오염됐을 때, 내가 얼마나 무서웠는지 몰라.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '그래서 혼자 처리하려 하신 거예요?' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '응. 하지만 이제 알아. 요리도 싸움도 혼자가 아니야. 팀이 있어야 진짜 웍의 불길이 살아나는 거야.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '뭔가 멋있는 말 같은데... 맞는 말인 것 같기도 해!' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(감동받은 척) 진짜 멋있어. 그 정신으로 도구 업그레이드도\u2014' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(무표정) ...포코 씨는 항상 거기서 나오네.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(작게) 포코를 대하는 방법이 나랑 비슷하네, 라오.' },
    ],
  },

  // ── 시즌 2: 10장 추가 스토리 (Phase 22-1/24-1) ──

  chapter10_yuki_clue: {
    id: 'chapter10_yuki_clue',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '10-4 클리어 직후. 유키가 홀로 궁전 기둥에 새겨진 문양을 들여다보고 있다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(문양을 손으로 짚으며) ...이 문양. 일본 이자카야 지하에서 본 것과 같아.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '유키 씨, 뭔가요?' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '미미. 식란의 원점이 지하 어딘가에 있을 것 같아. 이 문양이 봉인 표식이야.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(다가서며) ...우리 가문 고서에도 있었어. "용의 주방 아래, 봉인이 잠든다"는 구절이.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '그럼 여기도?!' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '아직 확신은 없어. 하지만 \u2014 계속 싸우면서 단서를 모아야 해.' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(진지하게) ...이번엔 나도 쉽게 넘길 얘기가 아닌 것 같군.' },
    ],
  },
  chapter10_mid: {
    id: 'chapter10_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '10-5 클리어 직후. 드래곤 웍이 가까워지며 팀 내 긴장이 고조된다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '라오. 나 혼자 선두로 들어갈게. 봉인 지점을 먼저 확인해야 해.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(차분하게) 안 돼. 여기는 내 가문의 주방이야. 내가 선두다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '...봉인에 대해 가장 많이 아는 건 나야. 판단은 내가 해.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '잠깐, 두 분 다! 싸울 시간 없어요. 같이 들어가면 되잖아요!' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(잠시 침묵 후) ...미미가 맞아. 혼자 행동하는 건 내 나쁜 버릇이야.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(끄덕이며) 나도 마찬가지야. 같이 가자, 유키.' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(눈물 닦으며) 이 팀... 진짜 성장하고 있어. 감동이야.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '포코 씨. 지금 상황이 그런 상황이 아닌 거 알죠.' },
    ],
  },
  yuki_side_8: {
    id: 'yuki_side_8',
    skippable: true,
    lines: [
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '미미, 잠깐 좋을까.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '응? 무슨 일이에요, 유키 씨?' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '...아까 라오랑 다퉜던 거. 내가 너무 혼자 결정하려 했어. 나쁜 버릇이라는 건 알지만.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '유키 씨가 봉인에 대해 걱정되니까 그런 거잖아요. 알아요.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '미력사 길드가 무너졌을 때, 나 혼자 모든 정보를 짊어졌어. 그 버릇이 아직 남아 있나봐.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '이제는 우리가 다 같이 짊어지면 돼요. 봉인 정보도, 싸움도, 전부요.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(작게 웃으며) ...그렇군. 팀이라는 게 그런 거구나.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(지나가며) 맞아, 유키. 웍도 혼자 들면 무거워.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '...라오, 그 비유 되게 마음에 들어.' },
    ],
  },

  // ── 시즌 2: 9장 이자카야 최심부 (Phase 23-1) ──

  chapter9_intro: {
    id: 'chapter9_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '이자카야 지하 최심부. 공기 자체가 발효된 사케 냄새로 가득 차 있다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(멈추며) ...여기야. 고문서에 나온 봉인의 방이 \u2014 바로 여기야.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '문에 미력이 가득 차 있어. 이게 봉인이야?' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(문을 손으로 짚으며) 오래된 거야. 아주 오래된 봉인. 봉인을 친 사람이 누군지 \u2014' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(긴장하며) 사케 오니가 안에 있어. 문 너머에서 미력이 흘러나오고 있어.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '자, 들어가자. 거기서 끝내는 거야.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(조용히) ...응. 여기서 끝낸다.' },
    ],
  },
  chapter9_boss: {
    id: 'chapter9_boss',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '봉인의 방 가장 깊은 곳. 뿌연 사케 안개 속에서 거대한 형체가 모습을 드러냈다.' },
      { speaker: '\uC0AC\uCF00 \uC624\uB2C8', portrait: '\uD83C\uDF76', text: '(낮고 취한 목소리로) ...오셨군요, 미력사들이여. 오래 기다렸습니다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(충격받아) ...이 미력. 사케 오니 \u2014 당신은, 미력사야?!' },
      { speaker: '\uC0AC\uCF00 \uC624\uB2C8', portrait: '\uD83C\uDF76', text: '(쓴웃음) 이자카야의 미력사였지요. 이 마을을 지키던 사람이었어요. 하지만 정화하려다 \u2014 스스로 사케 영기에 잠식됐습니다.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '정화하다가... 타락한 거야?' },
      { speaker: '\uC0AC\uCF00 \uC624\uB2C8', portrait: '\uD83C\uDF76', text: '(목소리가 흔들리며) 더 강하게 정화하려 했어요. 혼자. 아무도 부르지 않고, 아무도 믿지 않고. 그게 \u2014 잘못이었어요.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(이를 악물며) ...그건, 나도 했던 짓이야.' },
      { speaker: '\uC0AC\uCF00 \uC624\uB2C8', portrait: '\uD83C\uDF76', text: '(조용히) 그래서 당신이 여기까지 온 거겠죠, 유키. 날 정화해 주세요. 제대로 된 방식으로.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '유키 씨...' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(칼을 꺼내며) 알겠어. 같이 끝냅시다.' },
    ],
  },
  chapter9_clear: {
    id: 'chapter9_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '사케 오니가 정화되었다. 뿌연 안개가 걷히고, 방 안에 맑은 미력이 흐른다.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(떨리는 목소리로) ...끝났어. 정말로 끝났어.' },
      { speaker: '\uBBF8\uBBF8', portrait: '\uD83D\uDC67', portraitKey: 'mimi', text: '유키 씨, 괜찮으세요?' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(눈을 감으며) 응. 괜찮아. 아니, 처음으로 \u2014 진짜 괜찮은 것 같아.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '혼자 끝내려 했다면 나도 저렇게 됐을 거야. 미력에 잠식되어서, 끝내 봉인 안에 갇혀서.' },
      { speaker: '\uB77C\uC624', portrait: '\uD83D\uDC09', portraitKey: 'lao', text: '(조용히) ...유키. 수고했어요.' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(고개를 끄덕이며) 고마워요, 라오 씨. 미미도, 포코 씨도.' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(콧물 훔치며) 나야말로... 감동이야. 참, 클리어 보너스 장비가\u2014' },
      { speaker: '\uC720\uD0A4', portrait: '\u2744\uFE0F', portraitKey: 'yuki', text: '(부드럽게) 포코 씨. 5초만 조용히 있어줘요.' },
      { speaker: '\uD3EC\uCF54', portrait: '\uD83D\uDC31', portraitKey: 'poco', text: '(소곤) ...3초는 안 돼?' },
      { speaker: 'narrator', portrait: '', text: '9장 클리어. 일식 아크 완결. 이자카야의 봉인이 해제되었다.' },
    ],
  },

  // ── 시즌 2: 11장 용의 주방 심층부 (Phase 25-1) ──

  chapter11_intro: {
    id: 'chapter11_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '사케 오니의 봉인이 해제된 후. 라오가 이끄는 팀이 가문 주방 아래 심층부로 들어선다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(멈추며) ...이 아래가 진짜 심층부야. 할아버지도 이곳엔 거의 들어오지 않았다고 하셨어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '공기가 달라. 향신료 냄새가 엄청나게 진해.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(벽에 새겨진 문양을 보며) 팔각 문양이야. 중국 미력사가 봉인에 사용하던 표식이에요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(작게) ...가문 문서에 있었어. "심층부 팔각 봉인은 용의 미력을 가두는 마지막 방어선"이라고.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(긴장하며) 그 봉인이 지금 흔들리고 있다는 거군. 그림자 드래곤들이 심층부를 점령했어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '그럼 시작하자. 우리가 여기까지 왔잖아!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(결의에 차서) 응. 이 심층부는 내가 책임진다. 같이 가자.' },
    ],
  },
  chapter11_mid: {
    id: 'chapter11_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '11-4 클리어 직후. 웍 수호자들이 물러서고 심층부 최심층이 눈앞에 열린다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(숨을 고르며) 웍 수호자들... 예전에는 이 주방을 지키던 미력 존재였을 텐데. 이렇게 됐구나.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '봉인이 많이 약해졌어. 드래곤 웍이 심층부 미력을 다 흡수하고 있는 것 같아.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '라오 씨, 이 주방을 되찾는 거예요. 그러려면 마지막 방으로 들어가야 해요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(고개를 끄덕이며) 알아. ...사실 이 방에 대한 기억이 있어. 아이였을 때, 할아버지가 말했어.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '"심층부는 네가 지켜야 한다. 언젠가 네가 혼자가 아닐 때 들어가라." 그때가 지금인 것 같아.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(눈이 빛나며) 맞아. 지금이야! 우리 같이 들어가자!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(작게) ...라오 할아버지, 지켜보고 있겠지.' },
    ],
  },
  lao_side_11: {
    id: 'lao_side_11',
    skippable: true,
    lines: [
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '미미, 잠깐 괜찮아?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '응? 무슨 일이에요, 라오 씨?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '팔각 향. 어릴 때 할아버지가 이 냄새 나는 주방에서 요리를 가르쳐줬어. 웍에 팔각 넣고 볶으면 향이 온 집 안을 가득 채운다고 했지.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '그래서 팔각이 봉인 재료가 된 건가요? 가문 요리와 연관이 있어서요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(끄덕이며) 아마도. 미력과 요리는 분리할 수 없어. 가장 강한 향신료가 가장 강한 봉인이 되는 거야.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(옆에서 듣다가) ...그것과 비슷한 이야기가 일식 고문서에도 있어. 가장 짙은 맛이 가장 강한 정화를 만든다고.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(유키를 보며) 유키, 언제부터 거기 있었어?' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '처음부터.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(끼어들며) 감동적인 대화에 방해하는 건 아닌데... 저 팔각 장수에게 레시피 얻으면 대박 나지 않을까요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(무표정) ...포코 씨는 역시 변하지 않네.' },
    ],
  },

  // ── 시즌 2: 12장 용의 궁전 결전 (Phase 26-1) ──

  chapter12_intro: {
    id: 'chapter12_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '11-6 최후의 관문 돌파 후. 드래곤 웍의 본거지, 용의 궁전에 발을 들이다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '이 기운... 예전보다 훨씬 강해졌어. 11-6의 선등장은 경고였던 거야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '겨우 경고? 그게 경고라면 본체는 얼마나 강한 거야?!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(조용히) 가문의 잘못된 미력이 응집된 곳이야. 내가 끝내야 해.' },
    ],
  },
  chapter12_lao_mid: {
    id: 'chapter12_lao_mid',
    skippable: true,
    lines: [
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '...사실, 내가 처음 드래곤 웍을 깨웠어. 어렸을 때 금지된 조리법을 시도했다가.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '라오...' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(낮은 목소리) 그래서 네가 이 아크를 책임지겠다고 한 거구나.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '응. 내가 시작했으니, 내가 마무리짓는 거야.' },
    ],
  },
  chapter12_boss: {
    id: 'chapter12_boss',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '용의 궁전 최심부. 드래곤 웍의 미력이 방 전체를 압도한다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '드래곤 웍. 오래 기다렸어. 이번엔 달아나지 않을 거야.' },
      { speaker: 'narrator', portrait: '', text: '거대한 웍이 불꽃을 내뿜으며 전진해왔다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(도구를 꽉 쥐며) 모두, 준비해!' },
    ],
  },
  chapter12_clear: {
    id: 'chapter12_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '드래곤 웍이 정화되었다. 용의 궁전에 오랫동안 깔려 있던 폭주 미력이 흩어진다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(긴 침묵 후) ...끝났어. 드디어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '라오 씨, 고생하셨어요. 진짜로.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '이제 이 미력... 정화된 중식 재료로 돌아올 거야. 할아버지가 기뻐하시겠지.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '응. (미소) ...이제 진짜 요리를 시작할 수 있겠어.' },
      { speaker: 'narrator', portrait: '', text: '중식 아크 완결. 라오는 가문의 짐을 내려놓고, 새로운 여정으로 향한다.' },
    ],
  },
  lao_side_12: {
    id: 'lao_side_12',
    skippable: true,
    lines: [
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '미미, 잠깐. 고마워. 혼자였으면 못 했을 거야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '뭘~ 팀이잖아!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(훌쩍) 감동이야... 그나저나 이번 대가는 좀 깎아줄 수 없—' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '안 돼!' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '안 돼!' },
    ],
  },

  // ── 시즌 2: 13장 별빛 비스트로 (Phase 27-1) ──

  chapter13_intro: {
    id: 'chapter13_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '중식 아크 완결 직후. 팀은 WCA의 긴급 연락을 받아 파리로 향했다.' },
      { speaker: 'narrator', portrait: '', text: '밤의 파리. 에펠탑 불빛 아래, 센 강변의 고급 레스토랑 거리가 이상하게 조용하다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '와... 파리야. 진짜 파리. (두리번거리며) 근데 가게들이 왜 다 불이 꺼져 있어?' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(냉정하게) 식란 구역이에요. WCA 보고서에 따르면 3주 전부터 거리 전체가 봉쇄됐다고.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(긴장하며) 이 정도면... 드래곤 웍 때보다 훨씬 광범위해.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(귀를 쫑긋) 누군가 오고 있어.' },
      { speaker: '???', portrait: '🥐', text: '잘 오셨습니다. 동방의 미력사분들.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '저는 앙드레. WCA 유럽 지부장입니다. (정중히 고개를 숙이며) 연락을 기다렸어요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '이 별빛 비스트로... 파리 최고의 미슐랭 3스타 레스토랑이었습니다. 지금은 식란의 중심지가 됐지만.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '왜 저희한테 연락하신 거예요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(진지하게) 이 식란... 유럽 미력사들의 방식으로는 막을 수 없기 때문입니다. 무언가가 다릅니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '다르다는 게 무슨 의미입니까?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '음식의 맛이 아니라 \'예술\'에서 미력이 폭주하고 있어요. 극단적인 요리 집착이 식재료를 변이시키는 건지...' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(결의에 차서) 이유야 어떻든 정화하면 되는 거잖아요. 시작하겠습니다!' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(가볍게 미소 지으며) 역시. 동방 미력사는 대담하군요.' },
    ],
  },
  chapter13_mid: {
    id: 'chapter13_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '13-3 클리어. 별빛 비스트로 심층부에 가까워질수록 미력 농도가 짙어진다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(경계하며) 여기부터는... 저도 경험한 적 없는 구역입니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코, 이 미력 냄새, 뭔가 달라. 전에 없던 향이야.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(조심스럽게) 트러플. 흑트러플인데... 이걸 이렇게 고농도로 쓰는 요리사는 흔치 않아.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(낮은 목소리로 앙드레에게) ...혹시 이 구역, 특정 인물과 연관이 있습니까?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(잠시 멈추며) ...셰프 누아르.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '셰프 누아르? 누구예요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '유럽 미력사 세계에서 전설적인 이름입니다. 극한의 요리 미학으로 재료의 미력을 \'조각\'하듯 다룬다고 했었는데...' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '3년 전 WCA에서 제명됐어요. \'미력의 폭주를 의도적으로 유발했다\'는 의혹으로.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(표정이 굳으며) ...의도적이라고요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '아직 확실하지 않습니다. 하지만 이 식란의 방식이 그의 요리 철학과 너무 닮아 있어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(입술을 깨물며) ...찾아야겠어.' },
    ],
  },
  // chapter13_clear -- 13-5 클리어 후 (비스트로 심층부 완파, 14장 예고)
  chapter13_clear: {
    id: 'chapter13_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '별빛 비스트로의 식란이 걷히기 시작했다. 하지만 셰프 누아르의 흔적은 발견되지 않았다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '...여기까지 와주셔서 감사합니다. 솔직히, 혼자였다면 엄두도 못 냈을 거예요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '아직 안 끝난 거잖아요. 셰프 누아르, 어디 있는 거예요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(고민하며) 파리 지하. 오래된 카타콩브 구역에 연결된 비밀 조리장이 있다는 정보가 있습니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '...더 들어간다는 거군요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(결의에 차서) 당연하죠. 시작했으면 끝을 봐야죠!' },
    ],
  },
  mimi_side_13: {
    id: 'mimi_side_13',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코, 파리 빵 진짜 맛있다. 크루아상이 이렇게 맛있는 거였어?' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(흐뭇하게) 오~ 싸게 먹고 싶으면 다음엔 내가 파리 분점 열어줄게!' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(조용히 지나가며) ...팀장, 지금 식란 조사 중입니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '알아요, 알아요! 그냥 잠깐 먹은 거예요!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(옆에서 크루아상을 천천히 먹으며) ...맛있긴 해. 중국 꽃빵이랑 결이 다른 맛이야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '라오 씨도 먹고 있잖아요!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(무표정으로) 에너지 보충.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(웃으며) 세계 어딜 가도 맛있는 게 최고야! 이 전통은 지켜야지.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(씩 웃으며) 그럼 식란 정화하고 마카롱도 사 먹어요!' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(멀리서 조용히) ...나도.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '유키 씨! 먹고 싶으면 먹고 싶다고 하세요!' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '...간다.' },
    ],
  },

  // ── 시즌 2: 14장 비스트로 심층부 (Phase 28-1) ──

  // chapter14_intro — 14-1 진입 시 (파리 카타콩브 진입, 셰프 누아르의 요리 철학 노트 발견)
  chapter14_intro: {
    id: 'chapter14_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '파리 지하. 수백 년 된 카타콩브 구역. 13장 비스트로 완파 후, 팀은 앙드레의 안내로 지하로 내려갔다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(목소리가 약간 떨리며) ...여기, 뭔가 냄새가 달라요. 아직도 요리하고 있는 사람이 있는 건가요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(조심스럽게) 트러플과 허브 향이 섞여 있어요. 최근까지 누군가가 이 통로를 사용했다는 뜻입니다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(코를 벌름이며) 미력 농도가 꽤 높아. 단순한 식란이 아니야 — 누군가가 의도적으로 집중시키고 있어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(벽 쪽에서 무언가를 발견하며) ...이거.' },
      { speaker: 'narrator', portrait: '', text: '낡은 가죽 노트 한 권. 표지에는 흐릿하게 「N」 이니셜이 새겨져 있다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(숨을 들이켜며) ...이건. 누아르의 요리 철학서입니다. 제가 WCA에서 본 적 있어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '뭐라고 쓰여 있어요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(천천히 읽으며) 「재료가 스스로 미력을 방출할 때만, 요리는 진정한 예술이 된다. 강요된 정화는 예술의 폭력이다.」' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(조용히) ...식란을 자연스러운 현상으로 보고 있다는 건가요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(심각하게) 그게 문제야. 미력 폭주를 "해방"이라고 보면... 멈출 이유가 없는 거거든.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '하지만 그 사람, 왜 이 노트를 여기 두고 갔을까요. 일부러 남긴 건 아닐까요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(착잡하게) ...그 가능성도 있습니다. 더 깊이 들어가야 알 수 있어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(노트를 조심히 챙기며) 가죠. 직접 만나서 물어볼 거예요.' },
    ],
  },

  // chapter14_mid — 14-3 클리어 후 (셰프 누아르의 피해 보고서 발견, 팀 갈등)
  chapter14_mid: {
    id: 'chapter14_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '14-3 클리어. 지하 깊은 곳, 오래된 주방의 흔적. 누군가 최근까지 여기서 요리했다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(진지하게) 화덕이 아직 따뜻해. 하루 이틀 전까지 사람이 있었어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(서류 뭉치를 집으며) ...이건 피해 기록입니다. 날짜별로 정리된.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(읽으며, 표정이 복잡해지며) 「내 실험으로 인해 마르세유 지구의 식란이 악화되었다. 의도치 않은 결과였다.」...' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '의도치 않게... 라고요? 그럼 일부러 한 게 아닌 건가요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(냉정하게) 의도가 있든 없든, 결과는 같아. 사람들이 피해를 입었어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '동의합니다. 철학으로 피해를 정당화할 수는 없어요. 책임은 결과에 있습니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(조용히) 하지만... 기록하고 있었잖아요. 피해를 알고 있었다는 거잖아요. 모른 척한 게 아니라.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(먼 곳을 보며) ...누아르는 WCA에서 가장 뛰어난 미력사였어요. 우리 모두의 선배이자 기준이었죠. 아무도 이렇게 될 거라고 생각 안 했습니다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '과거가 어떻든, 지금도 도망치고 있잖아. 책임지려는 사람이 도망가나?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(잠시 생각하다 조용히) ...일단 찾아야겠지. 그 다음 판단은, 만나고 나서.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(고개를 끄덕이며) ...맞아요. 만나기 전엔 아무것도 모르는 거예요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(서류를 챙기며) 가죠.' },
    ],
  },

  // team_side_14 — merchant_enter 1회 (카타콩브에서의 허기, 팀 유대)
  team_side_14: {
    id: 'team_side_14',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '배고파... 카타콩브에 편의점이 없나?' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '여기가 파리 지하 납골당인데 편의점이 어딨어.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(조용히 말린 허브 한 봉지를 꺼내며) ...여기.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(눈이 빛나며) 라오 씨 천재예요! 이게 뭐예요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '말린 허브. 에너지 보충용이야. 파리 오기 전에 챙겼어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(조용히 손을 내밀며) ...감사합니다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(황당하게 웃으며) 카타콩브에서 간식 파티를 하시는군요...' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '배고프면 집중 못 해요! 이건 전술적 에너지 보충이에요!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(진지한 표정으로) 내가 이 구역에서 수집한 재료들... 한 번 경매 붙여볼까? 시작가 낮게 잡을게.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(미소 지으며) ...오히려 좋아요. 저도 하나 주시겠어요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(묵묵히 하나 더 건네며) ...' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(씩 웃으며) 우리 팀 최고예요!' },
    ],
  },

  // ── 시즌 2: 15장 셰프 누아르 최종전 (Phase 29-1) ──

  // chapter15_boss — 15-5 진입 시, 셰프 누아르 첫 대면
  chapter15_boss: {
    id: 'chapter15_boss',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '카타콩브 최심부. 무너질 듯한 석조 궁륭 아래 거대한 조리대가 놓여 있다. 그 뒤에 서 있는 검은 실루엣.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(목소리를 높여) 셰프 누아르! 드디어 찾았어요!' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(천천히 돌아서며) ...오래 걸렸군.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '동방의 미력사들. WCA의 개들이 보낸 건가.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(비통하게) 누아르... 이게 당신이 원하던 방향입니까?' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(냉소하며) 앙드레. 자네는 아직도 WCA의 언어로 말하는군. 실망이야.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(낮은 목소리로) 당신 때문에 마르세유 사람들이 피해를 입었습니다.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '피해? (비웃으며) 재료가 스스로 미력을 방출하는 것을 인간이 피해라고 부르는 거야. 오만한 정의로군.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '사람이 다쳤는데 그게 오만이에요?!' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '강요된 정화야말로 예술의 폭력이다. 너희가 하는 일이 그것이야. 미력을 억누르고, 재료를 길들이고, 자연을 지배한다고 믿는 것.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '요리는 지배가 아니야. 요리는... 해방이어야 해.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(차갑게) 철학은 들었습니다. 하지만 결과가 피해라면, 멈춰야 합니다.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(칼을 들어 올리며) 멈추는 것은 내 사전에 없어. 보여주마, 진정한 미력이 무엇인지.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(도구를 꽉 쥐며) 모두, 가요!' },
    ],
  },

  // chapter15_clear — 누아르 정화 후
  chapter15_clear: {
    id: 'chapter15_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '셰프 누아르의 미력이 꺾이기 시작했다. 칼이 바닥에 떨어진다.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(무릎을 꿇으며) ...이런 결말이라니.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(숨을 고르며) 이제 그만해요. 당신 때문에 상처 입은 사람들이 있어요.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(힘없이) ...알고 있었어. 처음부터. 노트에 다 기록했잖아. 하지만 멈출 수가 없었어.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(조용히 다가서며) 누아르... 왜 저한테는 말하지 않았습니까.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(쓴웃음) 자네가 WCA에 보고할 거 아닌가. 나는... 이미 그 세계에서 끝난 사람이라고 생각했으니까.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(조용하게) 미력이 해방됐어. 카타콩브의 폭주 농도가 빠르게 내려가고 있어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(누아르를 보며 천천히) 당신 생각이 완전히 틀렸다고는 못 하겠어요. 하지만 방법이 틀렸어요.' },
      { speaker: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', text: '(긴 침묵 후) ...그 말, 오래전에 들었어야 했는데.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(담담하게) 이제부터라도 달라질 수 있습니다.' },
      { speaker: 'narrator', portrait: '', text: '카타콩브의 어둠이 걷히기 시작했다. 오랫동안 응집된 미력이 천천히, 자연스럽게 흩어졌다.' },
      { speaker: 'narrator', portrait: '', text: '양식 아크 완결. 셰프 누아르는 WCA에 자수를 결정했다.' },
    ],
  },

  // chapter15_epilogue — 팀 전원, 아크 종료 직후
  chapter15_epilogue: {
    id: 'chapter15_epilogue',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '카타콩브 밖. 파리의 새벽빛이 센 강 위로 번지기 시작한다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(깊게 숨을 들이쉬며) ...끝났군요. 3년 넘게 쫓던 일이.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '앙드레 씨, 누아르 씨... 알고 지낸 분이었죠?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(조용히) 스승이었습니다. WCA에 들어갔을 때, 가장 처음 가르침을 주신 분이에요. 그가 이렇게 될 줄은...' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '...미력에 대한 신념이 너무 강하면, 결과를 보지 못하게 되는 거겠죠.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(멀리 바라보며) 나도 같은 실수를 했었으니까. 드래곤 웍 사건처럼. 강한 신념일수록 더 위험해.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(조심스럽게) 그래서 우리가 서로 견제하는 거잖아. 팀이라는 게 그런 거야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(앙드레를 보며 힘주어) WCA는 어떻게 되는 거예요? 누아르 씨가 제명된 것도, 그쪽이 대응을 못 한 거잖아요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(긴 침묵 후) ...맞습니다. 저도 WCA 내부를 다시 들여다봐야 할 것 같아요. 이번 일로 뭔가가 명확해졌습니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(씩 웃으며) 그럼 같이 바꿔요. WCA도, 요리도, 미력도. 혼자 안 해도 되잖아요!' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(가볍게 미소 지으며) ...고맙습니다. 미미 씨.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(박수치며) 명장면이야! 그나저나 이제 파리 일은 끝난 거죠? 마카롱 사러 가도 되나요?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(웃음을 터뜨리며) 포코!!' },
    ],
  },

  // side_15a — 전원 집합 대화 (상점 1회)
  side_15a: {
    id: 'side_15a',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '다들 괜찮아요? 오늘 진짜 힘들었죠.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(팔뚝의 상처를 보며) ...가벼운 열상 정도입니다. 신경 쓰지 마세요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '나도 괜찮아. 미력 소모가 좀 컸지만.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(진지하게) 여러분, 오늘 보스 상대로 다들 정말 잘 싸웠어요. 자랑스러워요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코가 진지한 건 처음 보는 것 같아.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(돌아서며) 그, 그러니까 이번엔 도구 값 10% 할인 쿠폰 드릴게요!' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(풋 웃으며) 역시 포코 씨군요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(아주 작게) ...10%면 쓸 만하네.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '라오 씨도 그런 말 해요?!' },
    ],
  },

  // side_15b — 다음 여정 암시 (상점 2회 이상)
  side_15b: {
    id: 'side_15b',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(지도를 펼치며) 자자, 다음 목적지는 어디야? WCA 본부? 아니면 다른 나라?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '아직 정해진 건 없어요. 앙드레 씨, WCA에서 뭔가 연락 왔어요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(표정이 굳으며) ...어젯밤에 연락이 왔습니다. 유럽 바깥에서 새로운 식란 징후가 보인다고.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '어느 지역입니까?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '아직 정보가 불완전해요. 하지만... WCA가 단독으로 대응하기에는 규모가 크다고 판단하고 있는 것 같습니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(차분하게) 그러면 우리가 필요하다는 거겠지.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(두 주먹을 꽉 쥐며) 좋아요. 어디든 가요! 식란이 있는 곳이라면!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(씩 웃으며) 역시 우리 미미야. 그럼 출발 전에 도구 보충은 필수~' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코... 지금 그게 중요해?!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '항상 중요해! 도구 없이 식란 못 잡아!' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '미미. 나는 여기서 빠져.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(놀라며) 린? 왜?' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '우리 가게. 너무 오래 비웠어. 가게 단골들도 있고... 혼자 처리할 수 있는 식란이 나타나면 연락 줘. 그때 가겠어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '...알겠어. 조심히 가, 린.' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(돌아서며) 인도든 멕시코든 거기서도 날 이기면 안 돼. 돌아올 때 네가 더 강해져 있으면 재미없잖아.' },
      { speaker: 'narrator', portrait: '', text: '팀은 다음 목적지를 향한 준비를 시작했다. 여정은 아직 끝나지 않았다.' },
    ],
  },

  // ── 16장: 향신료 궁전 (Phase 31-1) ──────────────────────────────────

  // chapter16_intro — 16-1 진입 시, 인도 향신료 시장 도착
  chapter16_intro: {
    id: 'chapter16_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '인도, 어느 오래된 향신료 시장. 미로처럼 뻗은 골목마다 색깔이 다른 가루들이 산처럼 쌓여 있다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '으아... 눈이 매워! 코도 매워! 전부 매운 거야?!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(깊게 들이마시며) 커민, 코리앤더, 카르다몸... 이 냄새, 예전에 한번 맡아봤어. 강렬하다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '야, 이 시장 엄청 크다? 도구 재료도 여기서 나는 거 아닐까~' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코, 지금 그게 중요한 게 아니잖아! WCA가 식란 징후 신고했잖아!' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(시장을 훑어보며) 미미 씨 말이 맞습니다. 냄새가... 단순한 향신료가 아니에요. 미력 반응이 섞여 있어요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(조용히 칼을 잡으며) 방향은 시장 안쪽. 깊어질수록 반응이 강해집니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(긴장하며 프라이팬을 꽉 쥐고) ...가자. 조심히.' },
    ],
  },

  // chapter16_mid — 16-3 첫 클리어 후, 인도 미력사 가문 마살라 문파와 첫 접촉
  chapter16_mid: {
    id: 'chapter16_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '시장 깊숙한 곳, 향신료 탑들 사이. 갑자기 사방에서 등불이 켜진다.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(낮고 단호한 목소리로) 멈춰라. 이 구역은 외부인 출입 금지다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '누, 누구야?! 갑자기 나타나서!' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '우리는 마살라 문파. 이 시장의 식란을 대대로 다스려온 자들이다. 당신들은 누구이고, 무슨 목적으로 왔나.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(한 걸음 앞으로 나서며) 저희는 WCA 소속 미력사입니다. 새로운 식란 징후를 추적해왔습니다.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(비웃듯) WCA? 유럽 미력사들이 인도까지 왔군. 우리 일에 간섭하려고?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(팔짱을 끼며) 식란이 국경을 알겠어? 혼자 다 막을 수 있다면 진작 막았겠지.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(잠시 침묵) ...말이 거칩구나, 중국인. 하지만 틀린 말은 아니야.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '지금 당장 협력하겠다는 건 아니다. 하지만 쫓아내지도 않겠다. 일단... 지켜보겠어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(작은 목소리로) ...경계하는 건지 인정하는 건지 모르겠어.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(미미 귀에 속삭이며) 쫓겨나지 않았잖아. 우린 늘 이렇게 시작하는 거야!' },
    ],
  },

  // team_side_16 — merchant_enter에서 1회, 향신료 시장 관련 팀원 리액션
  team_side_16: {
    id: 'team_side_16',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(커다란 봉지를 들고 나타나며) 야호~ 향신료 한 트럭 구했어! 거저나 다름없었다고!' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코, 그거 다 뭐야?! 짐이 얼마야!' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(봉지 하나를 열어 냄새 맡고는 즉시 닫으며) ...강합니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(다른 봉지를 집어 들며) 이건 마살라 블렌드네. 웍에 넣으면 폭발하겠는데. 좋다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '라오 씨, 좋다는 게 요리용이에요, 정화용이에요?!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(씩 웃으며) 둘 다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(귀를 쫑긋 세우며) 참, 마살라 문파 정보... 이 시장 상인들한테 묻고 다니는 중이야. 공짜로 알려줄게. 조건은 없어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '결국 장사 얘기야!!' },
    ],
  },

  // ── 16장 에필로그 + 17장: 향신료 궁전 심층부 (Phase 32-1) ──────────

  // chapter16_epilogue — 16-5 클리어 직후, 심층부 진입 결의
  chapter16_epilogue: {
    id: 'chapter16_epilogue',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '시장 외곽의 식란이 잦아들었다. 그러나 중심부의 공기는 여전히 뜨겁다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '전부 다 끝난 건 아니죠? 저 안쪽이 더 진하게 느껴져요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '미력 반응 수치가 오히려 올라갑니다. 심층부가 진원지입니다.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(낮은 목소리로) 거기까지 들어가려면… 각오가 있어야 한다. 그 안에 있는 것은 우리도 오래 봉인해온 것이다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '봉인이 풀리고 있다는 뜻이야?' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '그렇다. 그래서 너희가 온 것이 운이 좋다고 생각하기 시작했다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(작게) 첫 인사보다 많이 풀렸는걸~' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(결의를 다지며) 좋아. 심층부로 간다. 함께 막아요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(미미에게 낮게) 저 마살라 문파 사람... 이름도 안 밝혔어. 뭔가 숨기고 있는 것 같아.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '그래도 심층부 같이 간다고 했어요. 일단은 믿어야죠.' },
      { speaker: 'narrator', portrait: '', text: '팀은 향신료 궁전의 심층부, 금고의 층으로 발걸음을 내디뎠다.' },
    ],
  },

  // chapter17_intro — 17-1 진입 시, 향신료 금고 발견
  chapter17_intro: {
    id: 'chapter17_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '거대한 석문이 열리자 향신료 먼지가 폭포처럼 쏟아졌다. 안쪽에는 황금빛 항아리들이 천장까지 쌓여 있었다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '이게… 향신료 금고야? 이 양이 다 뭐야!' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '수백 년 전, 우리 조상이 미력을 담은 향신료들을 봉인해 쌓아온 장소다. 그것이 지금 풀려나고 있다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(주위를 살피며) 내부에서 누군가 건드렸다는 흔적이 있습니다. 봉인이 저절로 풀리지 않아요.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(표정이 굳으며) …맞다. 안에서부터 열린 것이다. 우리가 알아채지 못한 사이에.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '누가 이걸 열 수 있는 겁니까? 마살라 문파 외부 인물이?' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(긴 침묵 후, 낮게) …그 이름을 입에 올리고 싶지 않지만. 마하라자. 그 이름이 떠오른다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '마하라자? 누구예요?' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '나중에 설명하겠다. 지금은 먼저 이 안을 정화해라.' },
    ],
  },

  // chapter17_mid — 17-3 클리어 후, 마하라자의 음모 일부 공개
  chapter17_mid: {
    id: 'chapter17_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '금고 한 층이 고요해졌다. 황금빛 먼지가 천천히 가라앉으며, 벽에 새겨진 문양이 드러났다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(문양을 가리키며) 이 각인… 마살라 문파의 봉인 문양과 다릅니다. 형태가 달라요.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(표정이 굳으며) …그건 마하라자의 인장이다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '마하라자. 아까 그 이름이군요. 설명해줄 수 있습니까?' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '300년 전, 우리 문파에서 추방된 미력사다. 향신료의 미력을 무기로 바꾸려 했다. 정화가 아닌 — 지배를.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(차갑게) 추방됐다면 이미 죽었을 텐데.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '그가 죽었는지는 모른다. 하지만 이 인장은… 그의 기술로 다시 새겨진 것이다. 누군가가 그의 방법을 재현했다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '추종자가 있다는 건가요?' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '(고개를 끄덕이며) 그리고 그들이 이 금고를 열고, 안에 잠든 것을 깨우려 하고 있다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(긴장된 표정으로) 안에 잠든 게 뭔데?' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '금고의 수호자. 봉인이 풀리면 — 그것이 깨어난다. 다음 층에서 마주칠 것이다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(프라이팬을 단단히 쥐며) …이 팀이라면 막을 수 있어요. 같이 가요.' },
    ],
  },

  // team_side_17 — merchant_enter에서 1회, 17장 진입 후 팀원 리액션
  team_side_17: {
    id: 'team_side_17',
    skippable: true,
    lines: [
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(조용히) 마하라자라는 인물… WCA 문서에도 기록이 없는 이름이에요. 그만큼 오래된 이야기라는 뜻이겠죠.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '300년 전 기술이 지금 재현된다면, 누군가 자료를 갖고 있다는 뜻입니다. 외부 세력이 개입해 있을 가능성이 높아요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(팔짱을 끼며) 마살라 문파도 전부 공개하지 않는 게 있어. 뭔가 더 알고 있는 것 같던데.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '그래도 이제 같이 싸우고 있잖아요. 조금씩 열어주는 거 아닐까요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(짧게) …그러길 바라지.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(봉지를 흔들며) 참, 나 금고 안에서 희귀 향신료 몇 가지 챙겼는데~ 도구 강화 재료로 딱이야!' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코!! 그거 무단으로 가져온 거야?!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '정화된 거니까 반환 완료 아닌가요~?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(낮게 숨을 내쉬며) …그 논리, 절대 통하지 않습니다.' },
    ],
  },

  // ── 18장: 향신료 궁전 최심층 — 마하라자 (Phase 32-4) ──────────────

  // chapter18_intro — 18-1 진입 시, 아르준 신원 공개
  chapter18_intro: {
    id: 'chapter18_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '금고의 마지막 층. 향신료 먼지가 가라앉고, 황금빛 인장이 새겨진 거대한 문이 드러났다.' },
      { speaker: '???', portrait: '🪬', portraitKey: 'arjun', text: '...여기까지 와줬으니 이제 말해야겠어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '...네?' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '내 이름은 아르준. 마살라 문파 12대 계승자야. 지금까지 이름을 숨긴 건... 이 봉인이 풀리는 걸 막지 못할 경우를 대비해서였어.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '혼자 책임지려 했던 거야?' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '마하라자는 300년 전 우리 문파가 봉인했어. 미력을 정화가 아닌 지배를 위해 쓴 자야. 음식의 힘을 독점해 왕국 전체를 통제했지.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '...그래서 WCA 어디에도 기록이 없었군요. 마살라 문파가 역사를 지웠던 거예요.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '수치스러운 역사니까. 우리 조상이 만든 괴물이니까.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '과거가 어떻든, 지금 막아야 한다는 건 변함없어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(아르준의 어깨에 손을 얹으며) 혼자 짊어진 거 내려놓으세요. 지금은 같이 가는 거예요.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '...고마워. 같이 가자.' },
      { speaker: 'narrator', portrait: '', text: '문이 열렸다. 300년간 잠들어 있던 미력이 방 전체를 가득 채웠다.' },
    ],
  },

  // chapter18_mid — 18-3 첫 클리어 후, 정화할수록 각성하는 마하라자
  chapter18_mid: {
    id: 'chapter18_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '세 층이 정화되었다. 그러나 미력 농도는 내려가지 않았다 — 오히려 올라가고 있었다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '이상해. 정화할수록 미력 수치가 올라가고 있어.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '...알고 있었어. 말하지 못했지만.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '아르준 씨?' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '마하라자의 봉인은 분산형이야. 정화하면 억제력이 줄어들어.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '즉, 우리가 정화할수록 마하라자가 깨어난다는 거야.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '최심층에서 그의 잔영이 완전히 응집되면 — 그게 진짜 마하라자야. 응집 완료 전에 직접 정화해야 해.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '위험한 도박이네요.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '나는 이 위험을 혼자 처리하려 했어. 하지만 이제 포기했어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포기한 게 아니에요. 우리한테 맡긴 거잖아요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '좋아, 진짜 마하라자 잡으러 가는 거야. 완벽한 클라이맥스 아니야~?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '가자.' },
    ],
  },

  // chapter18_boss — 18-6 진입 시, 마하라자 각성
  chapter18_boss: {
    id: 'chapter18_boss',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '최심층. 황금빛 연기가 사람의 형체를 이루기 시작했다.' },
      { speaker: '마하라자', portrait: '👑', portraitKey: 'maharaja', text: '...300년. 오래 기다렸다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '마하라자...!' },
      { speaker: '마하라자', portrait: '👑', portraitKey: 'maharaja', text: '작은 미력사들. 나를 정화하러 왔는가. 참으로 오만하군.' },
      { speaker: '마하라자', portrait: '👑', portraitKey: 'maharaja', text: '미력이란 지배하는 자만이 다룰 수 있다. 너희는 재료를 낭비하고 있을 뿐이야.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '마하라자. 나는 마살라 문파 12대 계승자 아르준이다. 조상을 대신해 선언한다.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '당신의 봉인을 해제한 건 실수였어. 하지만 당신을 정화하는 건 우리의 책임이야.' },
      { speaker: '마하라자', portrait: '👑', portraitKey: 'maharaja', text: '계승자라고? 문파의 잔재가 이 꼴이라니. 실망스럽군.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '실망스러우면 직접 확인해봐.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '모두, 가요!' },
    ],
  },

  // chapter18_clear — 18-6 첫 클리어 후, 마하라자 정화 완료 + 에필로그 연쇄
  chapter18_clear: {
    id: 'chapter18_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '황금빛 형체가 흩어지기 시작했다. 마지막 미력이 조각조각 풀려나며 향신료 향기로 변했다.' },
      { speaker: '마하라자', portrait: '👑', portraitKey: 'maharaja', text: '...이런 결말이라니. 내 미력이... 이렇게 작은 손들에게.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '당신의 미력은 지배를 위한 게 아니었어요. 원래는 요리를 위한 것이었겠죠.' },
      { speaker: '마하라자', portrait: '👑', portraitKey: 'maharaja', text: '...300년 전. 처음 그 향신료를 다뤘을 때. 나는 단지... 영원히 맛있는 것을 만들고 싶었을 뿐이었지.' },
      { speaker: 'narrator', portrait: '', text: '황금빛 연기가 천천히 사라지며, 금고 전체에 따뜻한 향신료 향이 퍼졌다.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '마살라 문파 12대 계승자 아르준, 여기서 봉인을 영구히 해제하겠습니다. 이 짐은 더 이상 다음 세대로 이어지지 않아도 됩니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '...잘 했어요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '야, 향신료 냄새 때문에 눈이 매워서 그래. 진짜야.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '인도의 봉인이 풀렸어요. 이제 진짜 끝났군요.' },
    ],
  },

  // chapter18_epilogue — chapter18_clear onComplete에서 딜레이 1200ms 후 연쇄 재생
  chapter18_epilogue: {
    id: 'chapter18_epilogue',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '향신료 궁전 밖. 석양빛 인도의 하늘이 붉게 물들어 있었다.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '...끝났어. 300년 동안 우리 문파를 짓눌렀던 것이. 마치 긴 시간 우려낸 향신료처럼 — 진하고 무거운 잔향이 이제야 사라지는 것 같아.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '아르준 씨는 이제 어쩔 거예요?' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '마살라 문파를 다시 세울 거야. 이번엔 봉인을 지키는 게 아니라, 미력을 요리로 해방하는 문파로.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: 'WCA와도 협력할 수 있을 것 같아요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '우리 다음엔 어디야?' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '다음 식란 정보~ 멕시코에서 왔어. 타코 재료가 폭주 중이래!' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '멕시코! 타코!' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '벌써 요리 생각을 하는군요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '요리와 정화는 같은 거잖아요! 가자, 다음 여정!' },
      { speaker: 'narrator', portrait: '', text: '인도 아크 완결. 향신료 궁전의 300년 봉인이 풀렸다.' },
    ],
  },

  // team_side_18 — merchant_enter에서 1회, 18장 진입 후 팀원 리액션
  team_side_18: {
    id: 'team_side_18',
    skippable: true,
    lines: [
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '아, 맞다. 아르준한테 마살라 향신료 몇 가지 달라고 해도 되겠지?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '친해졌다고 바로 요구하지는 마.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '이미 챙겨놨어. 이 정도는 감사 표시지.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '아르준! 역시! 눈치가 빨라~' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '아르준 씨도 포코 페이스에 적응한 건가요?' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '(조용히) 고수 향 같아. 처음엔 낯설고 강렬한데, 익숙해지면 없으면 아쉬운. ...어느 순간부터 이 팀이 그래.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '저도 처음엔 이 팀 분위기가 낯설었는데, 지금은 없으면 어색할 것 같아요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '그게 팀의 무서움이죠.' },
    ],
  },

  // ── 19장: 선인장 칸티나 (Phase 33-1) ──────────────────────────────

  // chapter19_intro — 19-1 진입 시, 사막 도착 + 칸티나 발견 + 멕시칸 미력사 단서
  chapter19_intro: {
    id: 'chapter19_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '인도의 열기를 뒤로 하고 사흘이 지났다. 지평선 끝까지 펼쳐진 붉은 사막, 그 한가운데 낡은 간판 하나가 보였다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(눈을 가리며) 저게 뭐야? 사막 한복판에 식당이?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '선인장 칸티나... 음식 냄새가 나. 근데 뭔가 이상해.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(계기를 들여다보며) 미력 반응 확인됩니다. 선인장 군락 전체에서 에너지가 폭주하고 있어요. 멕시코 식란입니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(칸티나 문을 밀며) 사람이 있었던 것 같은데. 최근까지.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(바닥에서 수첩을 집으며) 이건... WCA 마크예요. 하지만 수첩이 많이 낡았어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(수첩을 받아 펼치며) 멕시칸 미력사가 있었던 거야? 왜 아무도 모르고 있었지?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(조용히) WCA 실종 기록에 이 지역 담당자가 두 명 있어요. 오래된 케이스들이에요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(진지하게) 즉, 먼저 들어갔다가 안 돌아온 사람들이 있다는 거야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(프라이팬을 꽉 쥐며) 찾아야 해요. 그리고 이 식란도 막아야 해요. 들어가요.' },
    ],
  },

  // chapter19_mid — 19-3 첫 클리어 후, 칸티나 지하 탐색 + 균열 감지
  chapter19_mid: {
    id: 'chapter19_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '칸티나 내부의 식란이 잦아들었다. 그러나 발 아래, 바닥 깊은 곳에서 진동이 느껴졌다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(무릎을 꿇고 바닥을 짚으며) 진동이 아래에서 올라온다. 지하 구조가 있어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(미력 탐지기를 보며) 지상보다 지하의 미력 농도가 두 배 이상이에요. 선인장 뿌리들이 전부 아래로 뻗어 있어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(수첩을 다시 열며) 잠깐... 여기 수첩에 적혀 있어. "칸티나 바닥 아래에 고대 제단이 있다. 선인장이 전부 그걸 향해 자란다. 이걸 알아낸 날부터 이상한 소리가 들린다."' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(표정을 굳히며) 그 이후 페이지는?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(침묵 후) 비어 있어.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(조용히) ...여기서 무슨 일이 있었는지 알 것 같아.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(일어서며) 내려가야 해. 그게 식란의 근원일 가능성이 높아.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(고개를 끄덕이며) 그래. 지하까지 끝내야 진짜 끝인 거야.' },
      { speaker: 'narrator', portrait: '', text: '균열 너머에서 건조한 열기가 올라왔다. 선인장 향과 낡은 흙 냄새가 섞였다.' },
    ],
  },

  // team_side_19 — merchant_enter에서 1회, 19장 진입 후 팀원 리액션
  team_side_19: {
    id: 'team_side_19',
    skippable: true,
    lines: [
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(수첩을 들여다보며) 이 수첩의 마지막 날짜... 4년 전이에요. 그동안 아무도 이 지역을 확인하지 않았다는 건가요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: 'WCA 담당 구역이 너무 넓었거나, 아니면 의도적으로 누가 보고를 막았거나.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(팔짱을 끼며) 낙관적으로 보면 전자겠지.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '어느 쪽이든 우리가 여기 있어. 이제 확인할 수 있어.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '그렇죠. 일단 지금 할 수 있는 것부터.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(어딘가에서 타코를 꺼내며) 오, 칸티나에 이게 남아 있었어! 할라피뇨 타코! 비상식량으로 완벽해~' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '언제 그걸 챙겼어?!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '탐색 중에 발견한 거야. 재료를 낭비하면 안 되지. 자, 한 입씩~' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(짧게 웃으며) ...그래, 먹자.' },
    ],
  },

  // ── 20장: 칸티나 심층부 (Phase 34-1) ──────────────────────────────

  // chapter20_intro — 20-1 진입 시, 균열 근원지 진입 + 불길한 기운
  chapter20_intro: {
    id: 'chapter20_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '지하로 내려갈수록 공기가 달라졌다. 사막의 건조함 대신 뜨겁고 눅진한 열기, 그리고 선인장 미력의 불빛이 바닥과 벽을 물들이고 있었다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(손을 벽에 짚으며) 뿌리가 살아 있어. 이 깊이까지 침투해 있는 게 자연이 아니야.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(탐지기를 응시하며) 지상의 열 배는 넘어요. 탐지기 값이 경고 범위를 넘었어요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '이 농도라면 식란이 이미 \'근원 단계\'에 접어들었을 가능성이 있어요. 이 정도 규모가 혼자 발생하기는 어렵습니다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '의도적이라는 거요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(표정을 굳히며) 그렇게 봐야 합니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(바닥에서 무언가를 집어 들며) 이건... 미력사 도구 파편이야. WCA 로고가 있어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(확인하며) 최근 것은 아니에요. 수년 전이에요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '즉, 누군가가 먼저 여기까지 들어왔다는 거야. 그리고 돌아가지 못했다는 거고.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(짧게 숨을 들이쉬며) 경계를 최고로 올립니다. 여기서부터는 전투가 뒤섞일 수 있어요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(프라이팬 손잡이를 꽉 쥐며) 그래도 가야 해요. 이게 식란의 근원이면, 여기서 끝내야 해요.' },
      { speaker: 'narrator', portrait: '', text: '팀은 말을 줄이고 전진했다. 선인장 뿌리의 붉은 빛이 그들의 발치를 길처럼 이어졌다.' },
    ],
  },

  // chapter20_mid — 20-3 첫 클리어 후, 엘 디아블로 첫 등장 + 최종전 암시
  chapter20_mid: {
    id: 'chapter20_mid',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '세 번째 전투가 끝난 순간이었다. 열기가 급격히 치솟으며 공기 자체가 일그러지기 시작했다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(주위를 살피며) 뭔가... 온도가 이상해요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '탐지기 수치가 급등하고 있어요. 이건 스테이지 잔류 미력이 아니에요.' },
      { speaker: 'narrator', portrait: '', text: '통로 깊은 곳에서 천천히 형체가 나타났다. 검붉은 세라페를 두른, 키가 큰 인물이었다.' },
      { speaker: 'El Diablo', portrait: '😈', text: '(낮고 느린 목소리로) ...잘들 왔군. 이 깊은 곳까지.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(경계하며) 당신이 이 식란을 일으킨 거예요?' },
      { speaker: 'El Diablo', portrait: '😈', text: '(비웃듯) 일으켰다? 아니. 나는 그저 이미 잠들어 있던 것을 깨웠을 뿐이야. 선인장은 원래 배고프다. 아주, 오래전부터.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(낮게) 저 미력 수치... WCA 데이터베이스에 없는 종류예요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '대체 당신은 누구예요?' },
      { speaker: 'El Diablo', portrait: '😈', text: '(돌아서며) 지금은 소개할 시간이 없어. 아직 준비가 안 됐으니까. — 하지만 곧.' },
      { speaker: 'narrator', portrait: '', text: '형체는 어둠 속으로 사라졌다. 열기도, 붉은 빛도, 함께 사라졌다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(조용히) ...저 사람이 배후예요. 이 선인장 아크 전체의.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(고개를 끄덕이며) 알아요. 그리고 우리를 시험하고 있는 것 같아요. — 다음 번에는 끝낼 거예요.' },
    ],
  },

  // team_side_20 — merchant_enter에서 1회, 20장 진입 후 아보카도 레시피 개발 시도
  team_side_20: {
    id: 'team_side_20',
    skippable: true,
    lines: [
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(아보카도를 들고 진지하게) 지하실 창고에서 신선한 아보카도를 발견했습니다. 이 재료라면... 과카몰리 소스 기반의 새 레시피가 가능할 것 같아요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(관심 없는 표정으로) 지금 그게 중요해?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '전투 외 시간에도 재료를 연구해야 합니다. 라오 씨도 아실 거예요, 레시피는 준비된 자에게만 열립니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(팔짱을 끼며) ...알겠어. 해봐.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(10분 후, 그릇을 들고 등장하며) 완성입니다. 과카몰리 드레싱 리솔레.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(그릇을 들여다보며) ...이게 왜 초록색이야?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(당황하며) 아보카도가... 너무 잘 익었나봐요. 색이 조금 진하게 나왔습니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(한 숟가락 먹으며 표정이 바뀌고) ...맛은 있어.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(안도하며) 다음 번엔 색도 잡겠습니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(작게 웃으며) 색은 신경 쓰지 마. 맛만 이러면 돼.' },
    ],
  },

  // ── 21장: 엘 디아블로 최종전 (Phase 35-1) ──────────────────────────────

  // chapter21_intro — 21-1 진입 시 (선인장 땅의 심층부 마지막 구역 진입)
  chapter21_intro: {
    id: 'chapter21_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '가장 깊은 곳. 선인장 뿌리가 더 이상 자라지 않는 공간. 팀은 El Diablo의 흔적을 따라 마지막 구역에 발을 디뎠다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '여기야. 여기가 끝이야.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(긴장한 표정으로) 도구 점검해. 어떤 것도 내려놓지 마.' },
    ],
  },

  // chapter21_mid — 21-3 첫 클리어 후, 보스전 전 마지막 준비
  chapter21_mid: {
    id: 'chapter21_mid',
    skippable: true,
    lines: [
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(수치를 분석하며) 미력 농도가 정점에 가까워지고 있어요. 이 패턴... 마하라자 보스전 직전과 유사합니다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '즉, 다음 전투가 결전이에요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(팀원들을 둘러보며) 다들... 괜찮아요?' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(짧게) 늘 그래왔어. 지금도 마찬가지야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(고개를 끄덕이며) 그래요. 함께라면 괜찮아요.' },
    ],
  },

  // chapter21_boss — 21-6 진입 직전 GatheringScene, 보스전 전야 재회
  chapter21_boss: {
    id: 'chapter21_boss',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '21번째 전투지에 발을 딛자마자, 공기가 달라졌다. 뜨겁고 짙은 열기 — 고추가 불에 닿을 때 나는 그 냄새가 공간 전체를 가득 채웠다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(주변을 둘러보며) 이 냄새... 지난번이랑 같아. 그 사람이 여기 있어.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(탐지기를 확인하며) 미력 수치가 이전과 차원이 달라요. 20장의 세 배 이상입니다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(냉정하게) 즉, 이번엔 도망치지 않는다는 거예요.' },
      { speaker: 'narrator', portrait: '', text: '바닥 균열에서 붉은 불꽃이 솟구쳤다. 그 중심에서 El Diablo가 천천히 모습을 드러냈다. 이번엔 물러서지 않는 눈빛이었다.' },
      { speaker: 'El Diablo', portrait: '😈', portraitKey: 'el_diablo', text: '(낮게, 링 위에 선 루차도르처럼) ...Bienvenidos. 이 링에 올라온 이상, 도망은 없어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '당신이 이 모든 식란을 일으킨 거잖아. 왜? 대체 왜!' },
      { speaker: 'El Diablo', portrait: '😈', portraitKey: 'el_diablo', text: '(느릿하게 웃으며) 왜라고. 선인장은 태양 없이 자라지 않아. 나는 그저... 이 땅에 태양이 되었을 뿐이지.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(이를 갈며) 말장난은 됐어. 정화하면 끝난다.' },
      { speaker: 'El Diablo', portrait: '😈', portraitKey: 'el_diablo', text: '(검붉은 불꽃을 손에 감으며) 정화? 아이야... 이 불꽃은 꺼지지 않아. 멕시칸 땅의 심장이 타오르는 한.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(프라이팬을 꽉 쥐며) 그래도 우리가 끌 거예요. 반드시!' },
      { speaker: 'narrator', portrait: '', text: '고추 형태의 악마가 두 발을 딛었다. 바닥이 진동했다. 결전이 시작되었다.' },
    ],
  },

  // chapter21_clear — 21-6 첫 클리어 후, 멕시칸 아크 클라이맥스
  chapter21_clear: {
    id: 'chapter21_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '마지막 불꽃이 꺼졌다. El Diablo의 실루엣이 천천히 빛으로 분해되기 시작했다.' },
      { speaker: 'El Diablo', portrait: '😈', portraitKey: 'el_diablo', text: '(무릎을 꿇으며, 낮은 목소리로) ...이렇게 되는군. 미력사가 이 땅에 다시 발을 딛는 날이 올 줄은.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(숨을 고르며) 끝났어. 이 아크는... 끝났어.' },
      { speaker: 'El Diablo', portrait: '😈', portraitKey: 'el_diablo', text: '(빛 속에서) 선인장은 또 자라. 뿌리가 남아 있는 한... 언젠가 다시 깨어난다. 그걸 알아두어라.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(조용히) 그 뿌리까지 우리가 정화하면 되죠.' },
      { speaker: 'narrator', portrait: '', text: 'El Diablo가 사라졌다. 붉은 불꽃도, 고추 향도, 균열의 진동도 함께 가라앉았다.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(탐지기를 응시하며) ...수치가 정상으로 돌아왔습니다. 이 구역의 식란 — 완전히 소멸했습니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(길게 숨을 내쉬며) 그래. 이제 끝이야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(눈물을 참으며) 선인장 칸티나... 할머니가 남겨주신 단서의 끝이 여기였구나.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(조용히) 네 할머니도 여기까지 왔었어. 하지만 혼자였지. 그래서 뒤로 물러날 수밖에 없었던 거야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(포코를 보며) 포코...' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '이번엔 혼자가 아니었어. 그래서 이길 수 있었던 거야.' },
      { speaker: 'narrator', portrait: '', text: '멕시칸 아크가 끝났다. 선인장 땅의 심장이 처음으로 조용히 숨을 쉬었다.' },
    ],
  },

  // chapter21_epilogue — chapter21_clear 체인 연결, 22장 예고
  chapter21_epilogue: {
    id: 'chapter21_epilogue',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '이틀 후. 칸티나 지상부로 올라온 팀은 처음으로 사막의 석양을 온전히 바라볼 수 있었다.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(데이터를 정리하며) 멕시칸 아크 전체 데이터를 WCA 본부에 전송했습니다. 이 규모의 식란 발생 패턴은 전례가 없어요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '의도적인 미력 증폭. 배후가 있다는 뜻이죠. El Diablo 혼자서는 이 규모를 만들 수 없었을 거예요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(하늘을 바라보며) 다음은 어디일까요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(수첩을 꺼내며) 할머니 수첩에 마지막 페이지가 하나 있었어요. "달콤한 것들이 무너지는 날." — 무슨 뜻인지 몰랐는데요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '달콤한 것들? 디저트 아크 같은 소리네.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(눈을 가늘게 뜨며) ...설마 슈가 드림랜드?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(고개를 들며) 가야지. 다음 땅이 어디든.' },
      { speaker: 'narrator', portrait: '', text: '멕시칸 아크가 완전히 막을 내렸다. 팀은 새로운 지도 위의 한 점을 향해 발걸음을 옮겼다.' },
    ],
  },

  // team_side_21 — merchant_enter에서 1회, 21장 진입 후 팀원 리액션 (경량 대화)
  team_side_21: {
    id: 'team_side_21',
    skippable: true,
    lines: [
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(아보카도 씨앗을 들고) 선인장 지대를 정화한 기념으로... 이 씨앗을 심어보는 건 어떨까요. 아보카도는 건조한 땅에서도 자라니까요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '칸티나 안에 나무를 심겠다는 거예요?' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '정화된 장소에 생명이 자라면... 나쁘지 않다고 생각해요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(잠깐 생각하더니) ...해봐. 그게 자라면 내가 첫 번째 요리에 쓸게.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '둘 다 이미 레시피 생각부터 하고 있잖아요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(잠시 조용히) ...사실 이 땅, 좀 무서워. 선인장 뿌리가 이렇게까지 깊이 파고드는 건 자연이 아니거든. 도구를 파는 나도... 이런 건 처음이야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '...포코.' },
    ],
  },

  // ── Phase 36-1: 22장 슈가 드림랜드 (디저트 아크 1장) ──

  // chapter22_intro — 22-1 진입 시 (mexican_arc_cleared 플래그 확인 후)
  chapter22_intro: {
    id: 'chapter22_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '멕시칸 대지를 뒤로하고 팀이 발을 내디딘 곳. 공기부터 달랐다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '이게... 설탕 냄새야? 진짜 설탕 냄새가 나!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '슈가 드림랜드야. 과자와 디저트로 이루어진 땅이지. 달콤하다고 방심하면 안 돼.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(데이터 패드를 들여다보며) ...미력 구조가 완전히 달라요. 향신료나 곡물 계열과 다르게, 디저트 미력은 당류의 결정 구조를 타고 전파돼요. 방어 패턴이 완전히 새로워요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '메이지, 디저트 미력을 연구한 적 있어?' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '제 전공이 디저트 미력이에요. 오래 기다렸어요, 이 구역을. 동시에... 가장 까다로울 거예요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(땅을 발로 툭 치며) 바닥이 쿠키 재질이네. 신기하군.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '미력이... 뭔가 다른 주파수예요. 멕시칸 아크보다 더 섬세하고 복잡한 파장이에요.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(고개를 끄덕이며) 그 파장이 여왕의 미력이에요. 이 땅 전체를 단일 의지로 제어하고 있는 거예요. 조심해야 해요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '달콤한 것들이 폭주한다는 게 어떤 모습인지... 직접 보게 되겠지.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(귀를 쫑긋 세우며) 저 안쪽에 "미각의 여왕"이 있다는 소문이 돌아. 조심해.' },
    ],
  },

  // chapter22_mid — 22-3 첫 클리어 후 (캔디 솔저 전투 경험 후 중반부 대화)
  chapter22_mid: {
    id: 'chapter22_mid',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '캔디 솔저... 설탕 결정이 굳어서 갑옷이 된 건가요? 공격이 제대로 안 먹혔어요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '경화 미력이에요. 단단하게 굳는 방향으로 식란이 폭주한 거죠.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '여왕이 이걸 만들었다면... 단순히 달콤한 세계가 아니야. 의도적으로 군대를 꾸리고 있어.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '여왕은 이 땅의 미력 전체를 자신의 입맛대로 바꾸려 하고 있어. "내가 원하는 맛만이 진짜 맛"이라는 신념으로.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(주먹을 쥐며) 그게 사람들이 원하는 맛인지는 여왕이 결정할 게 아니잖아요.' },
    ],
  },

  // team_side_22 — merchant_enter 조건, 22장 진입 후 팀원 가벼운 리액션
  team_side_22: {
    id: 'team_side_22',
    skippable: true,
    lines: [
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(주변을 보며) 마카롱 돌, 초콜릿 강... 파티시에로서 이 땅은 꿈의 재료 창고예요. 하지만 폭주한 미력이 섞여 있으면 이야기가 달라지죠.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '폭주한 카카오가 어떻게 생겼을지 생각만 해도 무서워.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '달콤할수록 독할 수 있지. 설탕이 발효되면 결국 독이 되는 것처럼.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(팔짱을 끼며) 그래도 싸우고 나면 레시피 연구를 해볼 수 있겠죠. 카카오와 바닐라... 조합이 기대돼요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '이 땅에서 얻은 재료, 제대로 쓰자. 달콤함에 지지 않게.' },
    ],
  },

  // ── Phase 37-1: 23장 드림랜드 심층부 (디저트 아크 2장) ──

  // chapter23_intro — 23-1 진입 시 (chapter22_cleared 플래그 확인 후)
  chapter23_intro: {
    id: 'chapter23_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '슈가 드림랜드를 뒤로하고 들어선 심층부. 공기가 달라졌다. 달콤함보다 무거운 무언가가 섞여 있었다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '여기는... 냄새가 달라. 설탕 냄새가 아니라 뭔가 더 진하고 농밀한 느낌이야.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '미력의 파장이 굉장히 조밀해요. 22장보다 훨씬 집약되어 있어요. 여왕이 이 깊이를 직접 통제하고 있다는 증거예요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(주먹을 쥐며) 벽이 마카롱이야. 계단도 마카롱이야. 어디에 발을 디뎌야 할지 모르겠군.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(낮은 목소리로) 이건 단순한 디저트 세계가 아니에요. 계획된 공간이에요. 누군가가 이 땅 전체를 설계했어요.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '여왕이 여기서 뭔가를 만들고 있어. "완벽한 맛"이라는 걸.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '완벽한 맛? 그게 뭔데?' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '모든 사람이 같은 맛을 원하게 만드는 것. 선택권이 없는 완벽함이지.' },
    ],
  },

  // chapter23_mid — 23-3 첫 클리어 후 (macaron_knight/sugar_specter 조우 후 중반부)
  chapter23_mid: {
    id: 'chapter23_mid',
    skippable: true,
    lines: [
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '마카롱 기사... 마법이 아예 안 먹혀요. 원소 공격이 전부 흡수되는 느낌이에요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '마카롱 기사는 물리 공격이 필요해요. 원소가 안 먹혀요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(분석하며) 마카롱 껍질이 원소 에너지를 차단하는 구조예요. 당류 결정이 방어막처럼 작용하는 거죠. 물리로 껍질을 먼저 부수고 내부를 공략해야 합니다.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(목소리를 낮추며) 그리고 그 설탕 유령... 죽어도 죽지 않아. 두 개로 갈라져서 다시 온다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '분열 미력이에요. 우선순위 집중이 중요해요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '동시에 처리하려 하면 지속적으로 증식해요. 한 마리씩 완전 소멸시키는 게 맞습니다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '그리고 저 너머에 여왕이 있다는 거잖아요. 이 두 가지를 넘어야만 갈 수 있는 방에.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(귀를 눕히며) 미미. 다음 방에 여왕이 있어. 거기가 마지막이야. 준비됐어?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '...응. 할머니가 이 길을 걸었을 거야. 나도 걸을게.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(조용히, 처음으로 진지하게) ...사실 네 할머니도 여기 비슷한 곳까지 왔었어. 이 냄새야. 당시에도 달콤하고 무거운 냄새가 났거든. 그때는 혼자였어.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코...' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '이번엔 달라. 너는 혼자가 아니잖아.' },
    ],
  },

  // team_side_23 — merchant_enter 조건, 23장 진입 후 린의 크림 디저트 코미디 대화
  team_side_23: {
    id: 'team_side_23',
    skippable: true,
    lines: [
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(크림 덩어리를 집어 들며) 이 크림... 미력이 빠지면 그냥 먹을 수 있을 것 같은데.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '린! 그거 방금 폭주한 크림이잖아!' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(진지하게) 맛은 봐야 알지. 적을 알려면 먼저 먹어봐야 한다고.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(몰래 조금 뜯으며) ...사실 저도 궁금하긴 해요. 농도가 상당히 좋아 보여서요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(짧게 눈을 감았다 뜨며) 둘 다요?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '정화 먼저. 레시피 연구는 그 다음이야.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(소매 안에서 작은 스푼을 꺼내며) 미미, 나도 잠깐만 —' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코도요?!' },
    ],
  },

  // ── Phase 38-1: 24장 미각의 여왕 최종전 ──

  // chapter24_boss — 24-1 진입 시 (chapter23_cleared 확인), 여왕과의 첫 대면
  chapter24_boss: {
    id: 'chapter24_boss',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '드림랜드의 가장 깊은 곳. 공기가 달라졌다. 달콤하지 않았다. 차갑고, 묵직하고, 왠지 모르게 숨막혔다.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(멈추며) 저기... 뭔가 있어. 느껴져.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(조용히) 보스야. 이 구역 전체의 미력... 하나로 수렴하고 있어.' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '(어딘가에서, 목소리만) ...오셨군요. 오래 기다렸어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '누구야?! 어디 있어?!' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '이 땅의 모든 맛이 나예요. 설탕, 크림, 카카오... 전부 내 미력이 빚은 것들이지.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(미미에게 낮게) 저 목소리... WCA 기록에 없어. 어디서 왔는지 모르는 존재야.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(긴장하며) 미력 농도가... 마하라자의 세 배. 이건 단순한 식란이 아니에요.' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '\'정화\'라고 부르죠? 귀엽네요. 이 완벽한 세계를 되돌리겠다는 발상이.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '완벽하지 않아. 선택할 수 없는 맛은 맛이 아니야.' },
    ],
  },

  // chapter24_mid — 24-3 첫 클리어 후, 중반부 위기감
  chapter24_mid: {
    id: 'chapter24_mid',
    skippable: true,
    lines: [
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(장비를 점검하며) 이 적들... 여왕이 직접 소환한 거예요. 마카롱 기사, 슈가 스펙터 — 전부 그녀의 미력으로 빚은 근위대예요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '소환된 적의 밀도가 24-1보다 40% 이상 높습니다. 후반으로 갈수록 기하급수적으로 늘어날 거예요.' },
      { speaker: '앙드레', portrait: '🥐', portraitKey: 'andre', text: '(낮게) ...그리고 여왕의 철학이 셰프 누아르와 정반대예요. 누아르는 미력을 완전히 해방시키려 했죠. 여왕은 모든 맛을 하나로 통일하려 해요. 극단이 다를 뿐, 둘 다 선택권을 빼앗는 거예요.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(고개를 끄덕이며) 자유와 통제. 서로의 거울 같네요.' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(잠시 생각하다가) 저 여왕... 여기서 뭘 원하는 거야? 그냥 막는 게 목표인 건지, 아니면 뭔가 다른 게 있는 건지.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '모르겠어. WCA 데이터베이스에도 기록이 없고, 어디서 왔는지도 불분명해. 식란이 이 규모를 만들어낸 건 맞는데...' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '(멀리서, 텔레파시로) ...아직도 저항하시는군요. 완벽함을 거부하는 그 마음... 어디서 배우셨나요?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(목소리가 들리는 방향을 노려보며) 할머니한테. 그리고 이 팀 모두한테요.' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '(멀리서) ...재미있는 답이네요. 직접 확인해보고 싶군요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(묵묵히) 일단 나아가요. 멈추면 더 모르게 돼요.' },
    ],
  },

  // chapter24_final_battle — 24-5 첫 클리어 후, 결전 직전
  chapter24_final_battle: {
    id: 'chapter24_final_battle',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '마지막 문 앞이었다. 미미의 팀은 아무 말도 하지 않았다. 다들 알고 있었다. 저 안에 답이 있다는 것을.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(팀원들을 천천히 바라보며) 다들... 고마워요. 여기까지 함께 와줘서요.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(짧게) 아직 안 끝났어요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(끄덕이며) 그래. 끝나고 고마워해도 늦지 않아.' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(이를 악물며) 들어가서 끝냅시다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(배낭을 추스르며) 나는... 뭔가 팔 게 있나 확인하고 있을게. (진지하게) 진심으로 — 잘 해낼 거야.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(프라이팬을 쥐며) 가자.' },
    ],
  },

  // chapter24_ending — 24-6 첫 클리어 후, 그룹3 최종 엔딩 (코미디 톤 + 여운)
  chapter24_ending: {
    id: 'chapter24_ending',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '미각의 여왕이 무릎을 꿇었다. 황금빛 미력이 조용히 흩어졌다. 드림랜드 전체가 처음으로 숨을 쉬었다.' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '(흐릿해지며) ...당신들의 맛은 제각각이군요. 제가 예상하지 못했어요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '그게 맛이라는 거야. 하나로 정해지면 맛이 아니거든.' },
      { speaker: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', text: '(마지막으로) ...그렇군요. 아마도 그게... 제가 몰랐던 거겠죠.' },
      { speaker: 'narrator', portrait: '', text: '여왕이 사라졌다. 어디서 왔는지, 왜 드림랜드를 만들었는지 — 아무도 완전히 알지 못했다.' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '(주변을 두리번거리며) 어... 크림이랑 바닐라가 엄청나게 남았는데. 이거 팔면 대박 나겠는데?' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '포코!!' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '아, 맞다. 감동적인 순간이었지. (헛기침) ...그래도 이거 팔면 안 돼?' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(앞을 바라보며) 다음엔 어디야.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(조용히 미소지으며) 일단 식당부터요. 손님이 기다리고 있을 것 같아요.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(웃으며) 맞아요. 일단 돌아가자고요. 오늘은... 정말 수고하셨어요, 다들.' },
      { speaker: '미미', portrait: '👧', portraitKey: 'mimi', text: '(마음속으로, 조용히) ...할머니. 지켰어. 식당도, 이 맛들도. 다음에도 지킬게.' },
      { speaker: 'narrator', portrait: '', text: '식란의 드림랜드가 조용해졌다. 그리고 미미의 식당은, 오늘도 문을 열었다.' },
    ],
  },

  // team_side_24 — merchant_enter, 24장 진입 후 1회 (메이지+아르준 디저트 연구 코미디)
  team_side_24: {
    id: 'team_side_24',
    skippable: true,
    lines: [
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(크림 샘플을 분석하며) 이 크림의 미력 구조... 완전히 새로운 패턴이에요.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(잠시 멈추며) ...어릴 때 동네 디저트 가게 식란으로 할아버지가 돌아가셨어요. 그때부터 디저트 미력을 연구했어요. 이 아크가 끝나면 그 연구를 완성하고 싶어요.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '(관심 있게) 미력 구조를 논문으로? 향신료 마살라 문파에도 이런 분석법이 있어요. 비교 연구 해보고 싶네요.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '정말요?! 저는 디저트 계열만 봤는데 — 아르준 선생님 쪽은 향신료 미력이잖아요. 완전히 다른 계통이라...' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '다르기 때문에 흥미로운 거죠. (웃으며) 카르다몸과 바닐라처럼 — 처음엔 어울릴 것 같지 않지만, 블렌딩하면 전혀 다른 향이 열려요. 마살라와 디저트 미력도 그럴 것 같아요.' },
      { speaker: '린', portrait: '🔥', portraitKey: 'rin', text: '(끼어들며) 그 연구, 나중에 해. 지금은 싸워야 할 것들이 남아있거든.' },
      { speaker: '메이지', portrait: '🧁', portraitKey: 'mage', text: '(당황하며) 아, 맞다! 완전히 빠져들었다...' },
      { speaker: '포코', portrait: '🐱', portraitKey: 'poco', text: '연구 결과 나오면 나한테도 알려줘. 논문이 팔리면 좋으니까.' },
      { speaker: '아르준', portrait: '🪬', portraitKey: 'arjun', text: '...미력사 협력자는 역시 독특하군요.' },
    ],
  },

  // team_side_24b — merchant_enter, team_side_24 시청 후 (라오+유키 여운 사이드)
  team_side_24b: {
    id: 'team_side_24b',
    skippable: true,
    lines: [
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(조용히) 라오... 여기 오면서 뭔가 이상하게 차분하다는 느낌이 들었어요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(천천히) 디저트랑 싸우는 게 왠지 더 피곤하더라. 고추나 매운 거랑 싸울 때랑 달라.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '(웃으며) 달콤한 것들이 더 집요한 것 같아요. 지치게 만드는 방식이.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '맞아. 지고 싶지 않은데 지치게 만들어. (잠시 후) 그래도 여기까지 왔어.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '여기까지 왔어요.' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '(짧게 웃으며) ...끝내자.' },
    ],
  },
};

// ── 캐릭터 정의 ──
// 세계관: 미력사(味力師) — 조리 도구의 정화 마법으로 식란을 잠재우는 비밀 요리사 혈통

/** @type {Object<string, {id: string, nameKo: string, portrait: string, portraitKey?: string, color: number, role: string, desc: string}>} */
export const CHARACTERS = {
  mimi: { id: 'mimi', nameKo: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', color: 0xff8899, role: 'protagonist', desc: '초보 미력사. 할머니의 식당을 물려받은 요리학교 졸업생.' },
  poco: { id: 'poco', nameKo: '포코', portrait: '\u{1F431}', portraitKey: 'poco', color: 0xffaa33, role: 'merchant', desc: '할머니의 동료였던 마력 품은 고양이. 정화 도구 전문 장인.' },
  rin:  { id: 'rin',  nameKo: '린',   portrait: '\u{1F525}', portraitKey: 'rin',  color: 0xff4444, role: 'rival',      desc: '불꽃 요리사. 미미의 라이벌이자 나중에 동료.' },
  mage: { id: 'mage', nameKo: '메이지', portrait: '\u{1F9C1}', portraitKey: 'mage', color: 0xcc88ff, role: 'researcher', desc: '디저트 전문 미력사. 식란의 원인을 학문적으로 추적.' },
  narrator: { id: 'narrator', nameKo: '', portrait: '', color: 0xcccccc, role: 'narrator', desc: '' },
  // ── Phase 19-1: 시즌 2 캐릭터 ──
  yuki: { id: 'yuki', nameKo: '유키', portrait: '❄️', portraitKey: 'yuki', color: 0x87ceeb, role: 'ally', desc: '일본 출신 미력사. 차분하고 정밀한 칼잡이.' },
  lao: { id: 'lao', nameKo: '라오', portrait: '🐉', portraitKey: 'lao', color: 0xff4500, role: 'ally', desc: '중국 출신 미력사. 호쾌한 웍 마스터.' },
  // ── Phase 23-1: 9장 보스 캐릭터 ──
  sake_oni: { id: 'sake_oni', nameKo: '사케 오니', portrait: '🍶', color: 0xff4488, role: 'boss', desc: '이자카야를 수호하던 식신. 정화된 사케 영기에 중독되어 타락한 옛 미력사.' },
  // ── Phase 26-1: 10장 보스 캐릭터 ──
  sake_master: { id: 'sake_master', nameKo: '주조 달인', portrait: '🍶', color: 0x8844bb, role: 'boss', desc: '이자카야 심층부 최심층을 지키는 고대 일식 양조 정령. sake_oni의 스승이자 원형.' },
  // ── Phase 27-1: WCA 유럽 지부장 ──
  andre: { id: 'andre', nameKo: '앙드레', portrait: '🥐', portraitKey: 'andre', color: 0x4169e1, role: 'ally', desc: 'WCA 유럽 지부장. 파리 출신 미력사로, 별빛 비스트로 식란 사태를 조사 중이다.' },
  // ── Phase 29-1: 15장 보스 캐릭터 ──
  chef_noir: { id: 'chef_noir', nameKo: '셰프 누아르', portrait: '🍴', portraitKey: 'chef_noir', color: 0x1a1a2e, role: 'boss', desc: '파리 카타콩브 출신의 전 WCA 수석 미력사. 식란을 자연적 해방으로 보는 극단적 요리 철학의 소유자. 양식 아크 최종 보스.' },
  // ── Phase 32-4: 18장 인도 아크 캐릭터 ──
  masala_guide: { id: 'masala_guide', nameKo: '아르준', portrait: '🪬', portraitKey: 'arjun', color: 0xd4a017, role: 'ally', desc: '마살라 문파 12대 계승자. 인도 향신료 시장의 식란을 대대로 수호해온 비밀 결사의 후계자.' },
  maharaja: { id: 'maharaja', nameKo: '마하라자', portrait: '👑', portraitKey: 'maharaja', color: 0xb8860b, role: 'boss', desc: '300년 전 향신료 왕국을 지배했던 자. 미력을 지배의 도구로 삼았다가 마살라 문파에 봉인되었다. 인도 아크 최종 보스.' },
  // ── Phase 35-1: 21장 보스 캐릭터 ──
  el_diablo: { id: 'el_diablo', nameKo: '엘 디아블로', portrait: '😈', portraitKey: 'el_diablo', color: 0x8b0000, role: 'boss', desc: '선인장 땅의 심장을 깨운 자. 고추 형태의 악마 루차도르로 멕시칸 미력의 폭주를 의도적으로 증폭시켰다. 멕시칸 아크 최종 보스.' },
  // ── Phase 38-1: 24장 최종 보스 캐릭터 ──
  queen_of_taste: { id: 'queen_of_taste', nameKo: '미각의 여왕', portrait: '👑', portraitKey: 'queen_of_taste', color: 0xd4af37, role: 'boss', desc: '드림랜드의 창조자. 모든 맛을 하나로 통일하려는 의지의 결정체. 디저트 아크 최종 보스.' },
};
