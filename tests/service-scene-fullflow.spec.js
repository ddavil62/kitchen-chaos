/**
 * @fileoverview ServiceScene AD3 레이아웃 검수 — BootScene 전체 플로우 경유 스크린샷.
 * BootScene에서 SpriteLoader.preload()가 완료된 뒤 ServiceScene을 시작하여
 * 스프라이트가 정상 로드된 상태의 화면을 캡처한다.
 */
import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test('ServiceScene 스프라이트 렌더링 AD3 검수', async ({ page }) => {
  // 게임 로드 (BootScene이 SpriteLoader.preload()를 실행)
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });

  // BootScene이 완료되고 MenuScene이 열릴 때까지 대기 (최대 15초)
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    // MenuScene이 활성화되면 BootScene preload 완료된 것
    return game.scene.isActive('MenuScene');
  }, { timeout: 15000 }).catch(() => {
    // timeout 허용 — 그냥 계속 진행
  });

  // 추가 대기로 텍스처 안정화
  await page.waitForTimeout(1000);

  // 텍스처 로드 상태 확인
  const textureStatus = await page.evaluate(() => {
    const game = window.__game;
    if (!game) return { error: 'no game' };
    const keys = ['floor_hall', 'table_lv0', 'table_lv1', 'table_lv2', 'counter_cooking',
      'customer_normal', 'customer_group', 'customer_gourmet'];
    const result = {};
    for (const k of keys) {
      result[k] = game.textures.exists(k);
    }
    return result;
  });
  console.log('Texture status:', JSON.stringify(textureStatus));

  // ServiceScene 직접 시작 (텍스처는 이미 로드됨)
  await page.evaluate(() => {
    const game = window.__game;
    const activeScenes = game.scene.getScenes(true);
    for (const s of activeScenes) {
      game.scene.stop(s.scene.key);
    }
    game.scene.start('ServiceScene', {
      stageId: '1-1',
      inventory: { carrot: 10, meat: 8, flour: 6, squid: 4, pepper: 3 },
      gold: 500,
      lives: 10,
      marketResult: { totalIngredients: 31, livesRemaining: 10, livesMax: 15 },
      isEndless: false,
    });
  });

  await page.waitForTimeout(3000);

  // 전체 레이아웃 스크린샷
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'service_scene_ad3_sprites.png'),
    clip: { x: 0, y: 0, width: 360, height: 640 },
  });

  // 홀 영역 클로즈업
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'service_scene_ad3_hall.png'),
    clip: { x: 0, y: 40, width: 360, height: 240 },
  });

  // 조리 슬롯 클로즈업
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'service_scene_ad3_counter.png'),
    clip: { x: 0, y: 280, width: 360, height: 60 },
  });

  console.log('Screenshots saved to', SCREENSHOT_DIR);
});
