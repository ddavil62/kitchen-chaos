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
      { speaker: '', portrait: '', text: '식란이 잠시 수그러들었지만... 세계 곳곳에서 이상 징후가 감지되기 시작했다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '할머니, 해외에서 편지가 왔어요!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '세계 미력사 연합(WCA)이라... 해외에서 동시다발 식란이 발생했대.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '우리가 도와야 해! 이제 세계를 무대로!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '좋아, 시즌 2 개막이다! 새로운 동료들도 만나게 될 거야.' },
    ],
  },
  season2_yuki_intro: {
    id: 'season2_yuki_intro',
    lines: [
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '당신이 미미... WCA에서 이야기 들었습니다.' },
      { speaker: '유키', portrait: '❄️', portraitKey: 'yuki', text: '제 고향 이자카야가 식란에 잠식됐어요. 도와주실 수 있나요?' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '물론이죠! 같이 가요, 유키 씨!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '유키의 정밀한 칼솜씨... 든든한 동료가 됐군!' },
    ],
  },
  season2_lao_intro: {
    id: 'season2_lao_intro',
    lines: [
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '하하! 너희가 그 유명한 미미 팀이구나!' },
      { speaker: '라오', portrait: '🐉', portraitKey: 'lao', text: '내 가문의 용 웍이 식란에 오염됐다... 도와달라!' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '라오 씨! 당연히 도와드릴게요!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '또 새 동료야? 밥값은 내라구! ...농담이야~' },
    ],
  },

  // ── 시즌 2: 7장 사쿠라 이자카야 (Phase 20) ──

  chapter7_intro: {
    id: 'chapter7_intro',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '일본 어딘가, 벚꽃이 흩날리는 전통 이자카야 마을.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '여기야... 내 고향이야.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '이자카야 거리 전체가 식란에 잠식됐어. 동료들도 연락이 끊겼고.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨... 힘들겠다. 같이 찾아줄게, 동료들!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '식란이 이자카야 재료들을 뒤틀어놨군. 초밥이 칼 들고 나오는 건 좀 과한데...' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '이 마을의 미력사 길드가 모두 쓰러졌어. 우리가 마지막이야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '마지막이라도 포기하면 안 되지. 자, 가자!' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '참, 이자카야 재료를 정화하면 최상급 일식 식재료가 돼! ...아, 지금 그 얘기 아닌가?' },
    ],
  },
  chapter7_yuki_joins: {
    id: 'chapter7_yuki_joins',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '7-3 클리어 직후. 유키가 고향 마을의 폐허가 된 길드 본부 앞에 선다.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...여기가 길드 훈련소였어. 내가 처음 정화를 배운 곳이야.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨, 괜찮아? 많이 힘들어 보여.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(고개를 끄덕이며) ...괜찮아. 감상에 잠길 시간이 없어. 사케 오니가 이 모든 걸 일으킨 주범이야.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '미미... 나도 같이 싸울게. 처음부터 그러고 싶었지만, 혼자 처리해야 한다고 생각했어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '혼자 처리할 필요 없잖아! 우리 팀이잖아, 유키 씨.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '환영해, 유키! 그나저나 새 동료 특별 도구 세트가\u2014' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(차갑게) 지금은 됐어요.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(작게) 역시 성격이 차갑다...' },
    ],
  },
  chapter7_clear: {
    id: 'chapter7_clear',
    skippable: true,
    lines: [
      { speaker: 'narrator', portrait: '', text: '사케 오니가 정화되었다. 이자카야 마을에 평화가 돌아온다.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '해냈다! 사케 오니 정화 완료!' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...고마워. 혼자였다면 절대 못 했을 거야.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '(마을을 둘러보며) 이제 재건할 수 있겠어. 미력사 길드도 다시 세울 수 있고.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '정화된 사케... 이게 최상급 주류가 되겠군. 이자카야 다시 열면 대박 날 텐데~' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '아직 8장이 남아 있어. 라오 씨 고향도 도와야 해!' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '당연하지. 같이 가자.' },
      { speaker: 'narrator', portrait: '', text: '7장 클리어. 유키가 정식으로 미미 팀의 일원이 되었다.' },
    ],
  },
  yuki_side_7: {
    id: 'yuki_side_7',
    skippable: true,
    lines: [
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '미미, 잠깐 좋을까.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '응? 무슨 일이야, 유키 씨?' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...내가 왜 혼자 처리하려 했는지 알아? 동료를 잃을 게 두려웠어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '유키 씨...' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '길드 동료들이 식란에 당했을 때, 내가 곁에 없었거든. 그래서 다음엔 혼자 다 막겠다고 생각했어.' },
      { speaker: '미미', portrait: '\u{1F467}', portraitKey: 'mimi', text: '그건 유키 씨 잘못이 아니야. 그리고 혼자 전부 막을 수 있는 사람은 없어.' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '...알아. 이제는 알 것 같아. 함께라서 이길 수 있었던 거니까.' },
      { speaker: '포코', portrait: '\u{1F431}', portraitKey: 'poco', text: '(뒤에서 훌쩍) 좋은 얘기다... 참, 동료 할인 이벤트\u2014' },
      { speaker: '유키', portrait: '\u{2744}\u{FE0F}', portraitKey: 'yuki', text: '포코 씨. 저리 가 줄래요.' },
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
};
