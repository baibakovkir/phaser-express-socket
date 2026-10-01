import { test, expect } from '@playwright/test';

test('registration launches a playable client scene', async ({ page }) => {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/register');
  await page.getByLabel('Username').fill(`tester${unique.replace(/[^a-z0-9]/g, '').slice(-15)}`);
  await page.getByLabel('Email').fill(`playwright-${unique}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('local-test-password');
  await page.getByLabel('Confirm Password').fill('local-test-password');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await page.goto('/play');
  await expect(page).toHaveURL(/^http:\/\/localhost:5173\//);
  await expect(page.getByText(/Logged in as/)).toBeVisible();

  await page.getByPlaceholder('Enter lobby name...').fill(`E2E ${unique}`);
  await page.getByRole('button', { name: 'Create Lobby' }).click();
  const startGame = page.getByRole('button', { name: /START GAME/ });
  await expect(startGame).toBeVisible();
  await startGame.click();

  await expect(page.getByRole('heading', { name: 'Hero Select' })).toBeVisible();
  await page.getByRole('button', { name: /Warrior/ }).first().click();
  await page.getByRole('button', { name: /LOCK HERO/ }).click();
  await expect(page.getByText('Health', { exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
