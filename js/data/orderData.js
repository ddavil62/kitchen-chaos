/**
 * @fileoverview 오더(웨이브 내 미션) 템플릿 데이터.
 * Phase 6: 웨이브 시작 시 30% 확률로 출현, 달성 시 보너스.
 */

export const ORDER_TEMPLATES = [
  {
    id: 'kill_15',
    descKo: '이번 웨이브에서 적 15마리 처치',
    type: 'kill_count',
    target: 15,
    rewardGold: 30,
    rewardCoin: 5,
  },
  {
    id: 'kill_20',
    descKo: '이번 웨이브에서 적 20마리 처치',
    type: 'kill_count',
    target: 20,
    rewardGold: 40,
    rewardCoin: 8,
  },
  {
    id: 'serve_1',
    descKo: '이번 웨이브에서 요리 1개 서빙',
    type: 'serve_count',
    target: 1,
    rewardGold: 25,
    rewardCoin: 4,
  },
  {
    id: 'serve_2',
    descKo: '이번 웨이브에서 요리 2개 서빙',
    type: 'serve_count',
    target: 2,
    rewardGold: 40,
    rewardCoin: 7,
  },
  {
    id: 'no_leak',
    descKo: '이번 웨이브에서 적 통과 0',
    type: 'no_leak',
    target: 0,
    rewardGold: 35,
    rewardCoin: 6,
  },
  {
    id: 'collect_5',
    descKo: '이번 웨이브에서 재료 5개 수거',
    type: 'collect_count',
    target: 5,
    rewardGold: 20,
    rewardCoin: 3,
  },
];

/** 오더 출현 확률 */
export const ORDER_CHANCE = 0.30;

/** 오더 출현 시작 웨이브 (이전 웨이브에서는 출현하지 않음) */
export const ORDER_MIN_WAVE = 3;
