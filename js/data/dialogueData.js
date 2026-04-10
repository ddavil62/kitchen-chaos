/**
 * @fileoverview 대화 스크립트 데이터.
 * Phase 14-1: JSON 형태의 대화 스크립트를 export한다.
 * Phase 14-2b: portraitKey 필드 추가, CHARACTERS 확장 (린/메이지).
 * Phase 14-2c: 신규 대화 스크립트 10개 추가.
 * 각 대화는 id, skippable 여부, lines 배열(speaker, portrait, portraitKey, text)로 구성된다.
 *
 * 세계관: "식란(食亂)" — 음식의 미력(味力)이 폭주하여 식재료가 괴물로 변하는 자연 현상.
 * 미력사(味力師)는 조리 도구의 정화 마법으로 폭주한 식재료를 진정시키는 비밀 요리사 혈통.
 */

// ── 대화 스크립트 ──

/** @type {Object<string, {id: string, skippable: boolean, lines: Array<{speaker: string, portrait: string, portraitKey?: string, text: string}>}>} */
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
};
