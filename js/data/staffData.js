/**
 * @fileoverview 직원 데이터 정의.
 * Phase 8-4: 서빙 도우미, 세척 도우미. IAP 전환 대비 추상화 구조.
 */

export const STAFF_TYPES = {
  waiter: {
    id: 'waiter',
    nameKo: '서빙 도우미',
    icon: '🤵',
    desc: '조리 완료 자동 서빙 (3초 딜레이)',
    purchaseType: 'coin',   // 'coin' | 'iap'
    price: 150,
    iapProductId: null,
  },
  dishwasher: {
    id: 'dishwasher',
    nameKo: '세척 도우미',
    icon: '🧹',
    desc: '세척 대기시간 제거',
    purchaseType: 'coin',
    price: 120,
    iapProductId: null,
  },
};
