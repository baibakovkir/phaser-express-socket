import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function registerAndOpenGame(page: Page, label: string): Promise<void> {
  const unique = `${label}${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  await page.goto('/register');
  await page.getByLabel('Username').fill(unique.slice(0, 20));
  await page.getByLabel('Email').fill(`${unique}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('local-test-password');
  await page.getByLabel('Confirm Password').fill('local-test-password');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto('/play');
  await expect(page.getByText(/Logged in as/)).toBeVisible();
}

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
  const canvas = page.locator('canvas[data-game-ready="true"]');
  await expect(canvas).toBeVisible();
  const initialX = Number(await canvas.getAttribute('data-server-x'));
  await page.keyboard.down('d');
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-x'))).toBeGreaterThan(initialX + 30);
  await page.keyboard.up('d');
  const beforeDash = Number(await canvas.getAttribute('data-server-x'));
  await page.keyboard.press('q');
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-x'))).toBeGreaterThan(beforeDash + 150);
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-mana'))).toBeLessThan(100);
  expect(errors).toEqual([]);
});

test('two players receive the same server match', async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  const errors: string[] = [];
  for (const page of [host, guest]) page.on('pageerror', error => errors.push(error.message));

  try {
    await Promise.all([
      registerAndOpenGame(host, 'host'),
      registerAndOpenGame(guest, 'guest'),
    ]);
    const lobbyName = `Duo ${Date.now()}`;
    await host.getByPlaceholder('Enter lobby name...').fill(lobbyName);
    await host.getByRole('button', { name: 'Create Lobby' }).click();
    await guest.getByRole('button', { name: 'Refresh' }).click();
    await expect(guest.getByText(lobbyName, { exact: false })).toBeVisible();
    await guest.getByText(lobbyName, { exact: false }).locator('..').getByRole('button', { name: 'Join' }).click();
    await expect(host.getByText('Players (2/6)')).toBeVisible();
    await host.getByRole('button', { name: /START GAME/ }).click();

    for (const page of [host, guest]) {
      await expect(page.getByRole('heading', { name: 'Hero Select' })).toBeVisible();
      await page.getByRole('button', { name: /Warrior/ }).first().click();
      await page.getByRole('button', { name: /LOCK HERO/ }).click();
    }
    const hostCanvas = host.locator('canvas[data-game-ready="true"]');
    const guestCanvas = guest.locator('canvas[data-game-ready="true"]');
    await expect(hostCanvas).toBeVisible();
    await expect(guestCanvas).toBeVisible();
    const hostTick = Number(await hostCanvas.getAttribute('data-server-tick'));
    await expect.poll(async () => Number(await hostCanvas.getAttribute('data-server-tick'))).toBeGreaterThan(hostTick + 10);
    await expect.poll(async () => Number(await guestCanvas.getAttribute('data-server-tick'))).toBeGreaterThan(hostTick + 10);
    expect(errors).toEqual([]);
  } finally {
    await Promise.all([hostContext.close(), guestContext.close()]);
  }
});
