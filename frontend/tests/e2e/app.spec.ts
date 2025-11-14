import { test, expect } from '@playwright/test';

test('displays wizard and visualizer sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Krubik Solver/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'R' })).toBeVisible();
});
