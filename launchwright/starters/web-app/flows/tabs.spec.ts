import { expect, test } from '@playwright/test';

test('the main button opens More, and the Home tab comes back', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open More' }).click();
  await expect(page.getByText('Try a tap')).toBeVisible();
  await page.getByRole('tab', { name: 'Home' }).click();
  await expect(page.getByText('Starter screen')).toBeVisible();
});

test('a tap changes what is on screen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'More' }).click();
  await expect(page.getByText('Nothing tapped yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Tap here' }).click();
  await expect(page.getByText('Tap received.')).toBeVisible();
});

test('every tap target is at least 44 by 44', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  // The page is drawn once for a phone and again after it starts, so measure until the sizes settle.
  await expect
    .poll(async () => {
      const sizes = await page
        .getByRole('button')
        .or(page.getByRole('tab'))
        .evaluateAll((els) => els.map((el) => { const r = el.getBoundingClientRect(); return Math.min(r.width, r.height); }));
      return sizes.length ? Math.min(...sizes) : 0;
    })
    .toBeGreaterThanOrEqual(44);
});
