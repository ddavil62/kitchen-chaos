/**
 * @fileoverview Phase 32-3 QA 테스트 -- 17장 스테이지 + 레시피 + Enemy/Projectile 로직 검증.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 32-3 데이터 검증', () => {
  test.beforeEach(async ({ page }) => {
    page._consoleErrors = [];
    page.on('pageerror', err => page._consoleErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') page._consoleErrors.push(msg.text());
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  test('게임이 크래시 없이 로드된다', async ({ page }) => {
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/phase32-3-loaded.png' });

    const fatalErrors = page._consoleErrors.filter(
      e => e.includes('SyntaxError') || e.includes('ReferenceError') || e.includes('TypeError')
    );
    expect(fatalErrors).toEqual([]);
  });

  test('stageData 17-1~17-5가 완전 구현 상태이다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const stages = {};
      for (let i = 1; i <= 5; i++) {
        const s = mod.STAGES['17-' + i];
        stages['17-' + i] = {
          exists: !!s,
          hasTheme: s?.theme === 'spice_palace',
          notPlaceholder: s?.theme !== 'placeholder',
          hasPathSegments: Array.isArray(s?.pathSegments) && s.pathSegments.length >= 1,
          hasWaves: Array.isArray(s?.waves) && s.waves.length >= 1,
          hasCustomers: Array.isArray(s?.customers),
          hasStarThresholds: !!s?.starThresholds && typeof s.starThresholds.three === 'number',
          hasService: !!s?.service && typeof s.service.duration === 'number',
        };
      }
      return stages;
    });

    for (let i = 1; i <= 5; i++) {
      const k = '17-' + i;
      expect(result[k].exists, `${k} 존재`).toBe(true);
      expect(result[k].hasTheme, `${k} theme=spice_palace`).toBe(true);
      expect(result[k].notPlaceholder, `${k} not placeholder`).toBe(true);
      expect(result[k].hasPathSegments, `${k} pathSegments`).toBe(true);
      expect(result[k].hasWaves, `${k} waves`).toBe(true);
      expect(result[k].hasCustomers, `${k} customers`).toBe(true);
      expect(result[k].hasStarThresholds, `${k} starThresholds`).toBe(true);
      expect(result[k].hasService, `${k} service`).toBe(true);
    }
  });

  test('17-3 wave 3~6에 incense_specter가 포함된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const s = mod.STAGES['17-3'];
      return s.waves.map(w => ({
        wave: w.wave,
        hasIS: w.enemies.some(e => e.type === 'incense_specter'),
      }));
    });

    // wave 1,2에는 없어야 하고, wave 3~6에는 있어야 함
    expect(result.find(w => w.wave === 1).hasIS).toBe(false);
    expect(result.find(w => w.wave === 2).hasIS).toBe(false);
    expect(result.find(w => w.wave === 3).hasIS).toBe(true);
    expect(result.find(w => w.wave === 4).hasIS).toBe(true);
    expect(result.find(w => w.wave === 5).hasIS).toBe(true);
    expect(result.find(w => w.wave === 6).hasIS).toBe(true);
  });

  test('17-4 wave 2~6에 spice_elemental이 포함된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const s = mod.STAGES['17-4'];
      return s.waves.map(w => ({
        wave: w.wave,
        hasSE: w.enemies.some(e => e.type === 'spice_elemental'),
      }));
    });

    expect(result.find(w => w.wave === 1).hasSE).toBe(false);
    for (let wave = 2; wave <= 6; wave++) {
      expect(result.find(w => w.wave === wave).hasSE, `17-4 wave ${wave}`).toBe(true);
    }
  });

  test('17-5 wave 1~5에 incense_specter + spice_elemental 양쪽 모두 포함된다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/stageData.js');
      const s = mod.STAGES['17-5'];
      return s.waves.map(w => ({
        wave: w.wave,
        hasIS: w.enemies.some(e => e.type === 'incense_specter'),
        hasSE: w.enemies.some(e => e.type === 'spice_elemental'),
      }));
    });

    for (let wave = 1; wave <= 5; wave++) {
      const w = result.find(r => r.wave === wave);
      expect(w.hasIS, `17-5 wave ${wave} incense_specter`).toBe(true);
      expect(w.hasSE, `17-5 wave ${wave} spice_elemental`).toBe(true);
    }
  });

  test('recipeData ALL_SERVING_RECIPES에 chai 서빙 레시피 10종이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/recipeData.js');
      const ids = ['chai_masala', 'spiced_chai_bread', 'chai_rice', 'incense_soup', 'chai_chicken',
        'deep_spice_stew', 'chai_grand_curry', 'incense_palace_feast', 'elemental_platter', 'sanctum_grand_feast'];
      return ids.map(id => {
        const found = mod.ALL_SERVING_RECIPES.find(r => r.id === id);
        return {
          id,
          found: !!found,
          hasChai: found?.ingredients?.chai !== undefined,
          gateStage: found?.gateStage,
        };
      });
    });

    for (const r of result) {
      expect(r.found, `${r.id} in ALL_SERVING_RECIPES`).toBe(true);
      expect(r.hasChai, `${r.id} has chai ingredient`).toBe(true);
      expect(r.gateStage, `${r.id} gateStage`).toMatch(/^17-[1-5]$/);
    }
  });

  test('recipeData ALL_BUFF_RECIPES에 chai 버프 레시피 2종이 존재한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = await import('/js/data/recipeData.js');
      return ['chai_shield', 'incense_blessing'].map(id => {
        const found = mod.ALL_BUFF_RECIPES.find(r => r.id === id);
        return {
          id,
          found: !!found,
          hasChai: found?.ingredients?.chai !== undefined,
          gateStage: found?.gateStage,
        };
      });
    });

    for (const r of result) {
      expect(r.found, `${r.id} in ALL_BUFF_RECIPES`).toBe(true);
      expect(r.hasChai, `${r.id} has chai`).toBe(true);
    }
  });

  test('17-x customers dish가 모두 RECIPE_MAP에 등록되어 있다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const { RECIPE_MAP } = await import('/js/data/recipeData.js');
      const missing = [];
      for (let i = 1; i <= 5; i++) {
        const stage = STAGES['17-' + i];
        if (!stage?.customers) continue;
        for (const cw of stage.customers) {
          for (const c of cw.customers) {
            if (!RECIPE_MAP[c.dish]) {
              missing.push(`17-${i} wave ${cw.wave}: ${c.dish}`);
            }
          }
        }
      }
      return missing;
    });

    expect(result).toEqual([]);
  });

  test('Enemy.js takeDamage 시그니처 + elementalResistance + confuseOnHit 로직 확인', async ({ page }) => {
    // Phaser 종속 클래스이므로 소스 텍스트를 fetch하여 검증
    const src = await page.evaluate(async () => {
      const resp = await fetch('/js/entities/Enemy.js');
      return resp.text();
    });

    expect(src).toContain('takeDamage(amount, towerType = null)');
    expect(src).toContain('elementalResistance');
    expect(src).toContain('resistTypes.includes(towerType)');
    expect(src).toContain('resistMultiplier');
    expect(src).toContain('confuseOnHit');
    expect(src).toContain("'enemy_confuse'");
    expect(src).toContain('confuseChance');
    expect(src).toContain('confuseDuration');
  });

  test('Projectile.js _hit()에서 towerType이 전달된다', async ({ page }) => {
    const src = await page.evaluate(async () => {
      const resp = await fetch('/js/entities/Projectile.js');
      return resp.text();
    });

    expect(src).toContain('takeDamage(this.damage, this.towerType)');
    expect(src).toContain('takeDamage(splashDamage, this.towerType)');
  });

  test('service duration이 16-5 기준(344)에서 선형 증가한다', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { STAGES } = await import('/js/data/stageData.js');
      const durations = [];
      for (let i = 1; i <= 5; i++) {
        durations.push(STAGES['17-' + i].service.duration);
      }
      return durations;
    });

    // 16-5 기준 344보다 모두 커야 함
    for (const d of result) {
      expect(d).toBeGreaterThan(344);
    }
    // 순증가 확인
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1]);
    }
  });

  test('콘솔에 JavaScript 에러가 없다', async ({ page }) => {
    await page.waitForTimeout(3000);

    const jsErrors = page._consoleErrors.filter(
      e => e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
    );

    if (jsErrors.length > 0) {
      console.log('JS errors:', jsErrors);
    }

    expect(jsErrors).toEqual([]);
  });

  test('recipeData 총 레시피 수가 213종이다', async ({ page }) => {
    const count = await page.evaluate(async () => {
      const { ALL_RECIPES } = await import('/js/data/recipeData.js');
      return ALL_RECIPES.length;
    });
    expect(count).toBe(213);
  });
});
