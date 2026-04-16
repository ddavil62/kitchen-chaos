/**
 * @fileoverview Phase 35 AD3 최종 검증 - el_diablo_pepper 에러 세분화.
 */
import { test, expect } from '@playwright/test';

test('el_diablo_pepper 관련 에러 전체 목록 출력', async ({ page }) => {
  const allErrors = [];
  const allNetworkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') allErrors.push(msg.text());
  });
  page.on('pageerror', err => allErrors.push(err.message));
  page.on('response', resp => {
    if (resp.status() === 404) allNetworkErrors.push(`404: ${resp.url()}`);
  });

  await page.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // el_diablo_pepper 관련 에러만 필터링
  const diabloErrors = allErrors.filter(e =>
    e.includes('el_diablo') || e.includes('el_diablo_pepper')
  );
  const diablo404 = allNetworkErrors.filter(e =>
    e.includes('el_diablo') || e.includes('el_diablo_pepper')
  );

  // 전체 에러에서 보스 이름별 분류
  const bossNames = ['cuisine_god', 'sake_oni', 'el_diablo_pepper', 'dragon_ramen', 'lava_dessert_golem', 'maharaja', 'master_patissier', 'chef_noir', 'sake_master', 'pasta_boss', 'seafood_kraken', 'dragon_wok'];
  const bossSummary = {};
  for (const name of bossNames) {
    bossSummary[name] = allErrors.filter(e => e.includes(name)).length;
  }

  console.log('보스별 에러 수:', bossSummary);
  console.log('el_diablo 에러:', diabloErrors);
  console.log('el_diablo 404:', diablo404);
  console.log('총 콘솔 에러 수:', allErrors.length);
  console.log('총 404 에러 수:', allNetworkErrors.length);

  // el_diablo_pepper 에러만 없으면 됨
  expect(diabloErrors).toHaveLength(0);
  expect(diablo404).toHaveLength(0);
});
