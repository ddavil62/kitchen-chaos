import { test } from '@playwright/test';

async function waitForTavernScene(page) {
  await page.goto('http://localhost:5173/?scene=tavern');
  await page.waitForFunction(() => !!window.__game, { timeout: 15000 });
  await page.waitForFunction(() => {
    const game = window.__game;
    if (!game || !game.scene) return false;
    const scene = game.scene.getScene('TavernServiceScene');
    return scene && scene.sys && scene.sys.settings.status >= 5;
  }, { timeout: 30000 });
}

test('B1 AD3 - 추가 클로즈업', async ({ page }) => {
  await waitForTavernScene(page);
  await page.waitForTimeout(2000);
  // 입구 재캡처 (DOOR_ANCHOR x=60 y=480, 입구 left=44 top=480 32x40)
  await page.screenshot({
    path: 'tests/screenshots/phase-b1-entrance2.png',
    clip: { x: 20, y: 450, width: 120, height: 110 },
  });
  // 카운터 좌표 확인 (left=80 top=90 40x100)
  await page.screenshot({
    path: 'tests/screenshots/phase-b1-counter2.png',
    clip: { x: 60, y: 75, width: 80, height: 130 },
  });
  // 셰프 위치 (x=40 y=100, setOrigin(0.5,1) -> 발끝 y=100)
  await page.screenshot({
    path: 'tests/screenshots/phase-b1-chef2.png',
    clip: { x: 5, y: 50, width: 110, height: 100 },
  });
  // 런타임 레이아웃 정보 수집
  const info = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('TavernServiceScene');
    const children = scene.children.list;
    const images = children.filter(c => c.texture && c.texture.key && c.texture.key.startsWith('tavern_'));
    return images.map(c => ({
      key: c.texture.key,
      x: Math.round(c.x),
      y: Math.round(c.y),
      dw: Math.round(c.displayWidth),
      dh: Math.round(c.displayHeight),
      origin: { x: c.originX, y: c.originY },
    }));
  });
  console.log(JSON.stringify(info, null, 2));
});
