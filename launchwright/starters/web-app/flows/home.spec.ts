import { expect, test } from '@playwright/test';

test('the home page opens with the app name and its words', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Starter Web App').first()).toBeVisible();
  await expect(page.getByText('Your app starts here.')).toBeVisible();
});
