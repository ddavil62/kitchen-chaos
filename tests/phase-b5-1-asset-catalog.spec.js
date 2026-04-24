/**
 * @fileoverview Phase B-5-1 에셋 카탈로그 시안. 모든 손님/셰프/walk를 한 화면에 펼쳐 캡처.
 */
import { test } from '@playwright/test';
import path from 'node:path';

const SHOTS = 'tests/screenshots';

const CUSTOMERS = ['normal','vip','gourmet','rushed','group','critic','regular','student','traveler','business'];
const CHEFS = ['mage','yuki','lao','andre','arjun'];

test('B-5-1 catalog: full asset overview', async ({ page }) => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body { background:#222; color:#eee; font-family:sans-serif; padding:16px; margin:0; }
    h2 { margin: 16px 0 8px; font-size: 14px; color: #ffd54a; border-bottom: 1px solid #555; padding-bottom: 4px; }
    h3 { margin: 8px 0 4px; font-size: 11px; color: #aaa; }
    .row { display:flex; flex-wrap:wrap; gap: 12px; }
    .cell { display:flex; flex-direction:column; align-items:center; background:#333; padding:6px 4px; border-radius:4px; min-width: 56px; }
    .cell img { image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; }
    .cell .lbl { font-size: 9px; color:#bbb; margin-top:4px; }
    .seated img { width: 64px; height: 96px; }
    .walk img { width: 192px; height: 72px; }
    .chef img { width: 64px; height: 96px; }
    .chefwalk img { width: 192px; height: 72px; }
    @keyframes step4 { from { background-position: 0 0; } to { background-position: -64px 0; } }
    .anim { width: 64px; height: 96px; image-rendering: pixelated; background-size: 256px 96px; background-repeat:no-repeat; animation: step4 0.5s steps(4) infinite; }
  </style></head><body>
    <h2>손님 10종 — seated_right (앉은 자세 R)</h2>
    <div class="row">
      ${CUSTOMERS.map(c => `<div class="cell seated"><img src="/assets/tavern/customer_${c}_seated_right.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>손님 10종 — seated_left (앉은 자세 L)</h2>
    <div class="row">
      ${CUSTOMERS.map(c => `<div class="cell seated"><img src="/assets/tavern/customer_${c}_seated_left.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>손님 10종 — walk_r (4프레임 시트, 정지 표시)</h2>
    <div class="row">
      ${CUSTOMERS.map(c => `<div class="cell walk"><img src="/assets/tavern/customer_${c}_walk_r.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>손님 10종 — walk_l (4프레임 시트, 정지 표시)</h2>
    <div class="row">
      ${CUSTOMERS.map(c => `<div class="cell walk"><img src="/assets/tavern/customer_${c}_walk_l.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>손님 walk 애니메이션 재생 (CSS, 8fps)</h2>
    <div class="row">
      ${CUSTOMERS.map(c => `<div class="cell"><div class="anim" style="background-image:url(/assets/tavern/customer_${c}_walk_r.png)"></div><div class="lbl">${c} R</div></div>`).join('')}
    </div>
    <h2>셰프 5명 — idle_side (B-3)</h2>
    <div class="row">
      ${CHEFS.map(c => `<div class="cell chef"><img src="/assets/tavern/chef_${c}_idle_side.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>셰프 5명 — walk_r (B-5-1, 4프레임 시트)</h2>
    <div class="row">
      ${CHEFS.map(c => `<div class="cell chefwalk"><img src="/assets/tavern/chef_${c}_walk_r.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>셰프 5명 — walk_l (B-5-1, 4프레임 시트)</h2>
    <div class="row">
      ${CHEFS.map(c => `<div class="cell chefwalk"><img src="/assets/tavern/chef_${c}_walk_l.png"><div class="lbl">${c}</div></div>`).join('')}
    </div>
    <h2>셰프 walk 애니메이션 재생 (CSS, 8fps)</h2>
    <div class="row">
      ${CHEFS.map(c => `<div class="cell"><div class="anim" style="background-image:url(/assets/tavern/chef_${c}_walk_r.png)"></div><div class="lbl">${c} R</div></div>`).join('')}
    </div>
  </body></html>`;

  await page.setViewportSize({ width: 1400, height: 900 });
  await page.setContent(html, { baseURL: 'http://localhost:5173/' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS, 'phase-b5-1-catalog.png'), fullPage: true });
});
