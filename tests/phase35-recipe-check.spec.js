import { test, expect } from '@playwright/test';

test('recipeData ALL_SERVING_RECIPES 21장 레시피 확인', async ({ page }) => {
  await page.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const result = await page.evaluate(async () => {
    const mod = await import('/js/data/recipeData.js');
    const RECIPES = mod.ALL_SERVING_RECIPES || mod.ALL_RECIPES || [];
    return {
      exports: Object.keys(mod),
      hasDiabloFireSalsa: !!RECIPES.find(r => r.id === 'diablo_fire_salsa'),
      hasElDiabloSalsaNegra: !!RECIPES.find(r => r.id === 'el_diablo_salsa_negra'),
      hasPepperSupremoFeast: !!RECIPES.find(r => r.id === 'pepper_supremo_feast'),
      hasElDiabloGrandFeast: !!RECIPES.find(r => r.id === 'el_diablo_grand_feast'),
      totalRecipes: RECIPES.length,
    };
  });
  console.log('recipeData exports:', result.exports);
  console.log('레시피 검증:', result);
  expect(result.hasDiabloFireSalsa).toBe(true);
  expect(result.hasElDiabloSalsaNegra).toBe(true);
  expect(result.hasPepperSupremoFeast).toBe(true);
  expect(result.hasElDiabloGrandFeast).toBe(true);
});
