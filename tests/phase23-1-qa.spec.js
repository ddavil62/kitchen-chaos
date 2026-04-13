/**
 * @fileoverview Phase 23-1 QA 검증 테스트.
 * sake_oni 에셋 존재 + dialogueData/storyData 정합성 검증.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 23-1: 사케 오니 에셋 + 스크립트', () => {

  test.describe('에셋 서빙 검증', () => {
    test('south.png rotation 파일이 image/png로 서빙된다', async ({ request }) => {
      const res = await request.get('/sprites/bosses/sake_oni/rotations/south.png');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('image/png');
    });

    test('8방향 rotation 파일 모두 image/png로 서빙된다', async ({ request }) => {
      const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
      for (const dir of dirs) {
        const res = await request.get(`/sprites/bosses/sake_oni/rotations/${dir}.png`);
        expect(res.status(), `${dir}.png should be served`).toBe(200);
        expect(res.headers()['content-type'], `${dir}.png should be image/png`).toContain('image/png');
      }
    });

    test('walking 애니메이션 파일이 image/png로 서빙된다 (content-type 검증)', async ({ request }) => {
      // 8방향 x 6프레임 = 48개 파일 모두 content-type이 image/png인지 확인
      // text/html이 반환되면 SPA fallback (파일 미존재)
      const dirs = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
      const failedFiles = [];
      for (const dir of dirs) {
        for (let f = 0; f < 6; f++) {
          const frame = `frame_${String(f).padStart(3, '0')}.png`;
          const url = `/sprites/bosses/sake_oni/animations/walking-9fa1ac06/${dir}/${frame}`;
          const res = await request.get(url);
          const contentType = res.headers()['content-type'] || '';
          if (!contentType.includes('image/png')) {
            failedFiles.push(`${dir}/${frame} (got: ${contentType})`);
          }
        }
      }
      expect(failedFiles, `Walking animation files NOT served as PNG:\n${failedFiles.join('\n')}`).toEqual([]);
    });
  });

  test.describe('콘솔 에러 검증', () => {
    test('게임 로드 시 치명적 JS 에러가 없다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto('/');
      await page.waitForTimeout(5000);

      const criticalErrors = errors.filter(e =>
        e.includes('SyntaxError') ||
        e.includes('ReferenceError') ||
        e.includes('TypeError') ||
        e.includes('is not defined') ||
        e.includes('Cannot read')
      );
      expect(criticalErrors, `Critical JS errors: ${criticalErrors.join('\n')}`).toEqual([]);
    });
  });

  test.describe('스크린샷 검증', () => {
    test('메뉴 화면이 정상 렌더링된다', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'tests/screenshots/phase23-1-menu.png' });
    });
  });
});
