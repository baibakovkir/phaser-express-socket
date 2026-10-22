import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function registerAndOpenGame(page: Page, label: string): Promise<void> {
  const unique = `${label}${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Username').fill(unique.slice(0, 20));
  await page.getByLabel('Email').fill(`${unique}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('local-test-password');
  await page.getByLabel('Confirm Password').fill('local-test-password');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto('/play', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Logged in as/)).toBeVisible();
}

test('auth forms show field validation and API errors', async ({ page }) => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Choose a username.')).toBeVisible();
  await expect(page.getByText('Enter your email address.')).toBeVisible();
  await page.getByLabel('Username').fill('tester');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Confirm Password').fill('different');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Use at least 6 characters.')).toBeVisible();
  await expect(page.getByText('Passwords do not match.')).toBeVisible();

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill('nobody@example.test');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  const toast = page.getByRole('alert');
  await expect(toast).toContainText('Invalid credentials');
  await toast.getByRole('button', { name: 'Dismiss error' }).click();
  await expect(toast).toHaveCount(0);
});

test('registration launches a playable client scene', async ({ page }) => {
  test.setTimeout(90_000);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Username').fill(`tester${unique.replace(/[^a-z0-9]/g, '').slice(-15)}`);
  await page.getByLabel('Email').fill(`playwright-${unique}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('local-test-password');
  await page.getByLabel('Confirm Password').fill('local-test-password');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await page.goto('/play', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp(`^http://localhost:${5173 + Number(process.env.E2E_PORT_OFFSET || 0)}/`));
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
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-x'))).toBeGreaterThan(initialX + 350);
  await page.keyboard.up('d');
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-x'))).toBeGreaterThan(0);
  const beforeDash = Number(await canvas.getAttribute('data-server-x'));
  await page.keyboard.press('q');
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-x'))).toBeGreaterThan(beforeDash + 150);
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-mana'))).toBeLessThan(100);
  await expect(page.getByLabel('Match timer')).toContainText('Lane 00:30');
  await page.keyboard.down('Space');
  await expect.poll(async () => Number(await canvas.getAttribute('data-attack-tick'))).toBeGreaterThan(0);
  await page.keyboard.up('Space');
  const beforeSkill = Number(await canvas.getAttribute('data-server-mana'));
  await page.keyboard.press('1');
  await expect.poll(async () => Number(await canvas.getAttribute('data-server-mana'))).toBeLessThan(beforeSkill);
  await expect.poll(async () => Number(await canvas.getAttribute('data-cast-tick'))).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('two players receive the same server match', async ({ browser }) => {
  test.setTimeout(90_000);
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

test('mobile player can scroll through setup and move with touch controls', async ({ browser }) => {
  test.setTimeout(90_000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await registerAndOpenGame(page, 'mobile');
    const refresh = page.getByRole('button', { name: 'Refresh' });
    await refresh.scrollIntoViewIfNeeded();
    await expect(refresh).toBeInViewport();
    const overlay = page.locator('.fixed.inset-0');
    expect(await overlay.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await overlay.evaluate(element => element.scrollTop)).toBeGreaterThan(0);

    await page.getByPlaceholder('Enter lobby name...').fill(`Mobile ${Date.now()}`);
    await page.getByRole('button', { name: 'Create Lobby' }).click();
    await page.getByRole('button', { name: /START GAME/ }).click();
    await expect(page.getByRole('heading', { name: 'Hero Select' })).toBeVisible();
    await page.getByRole('button', { name: /Warrior/ }).first().click();
    await expect(page.locator('img[src*="kenney/tiny-dungeon/warrior.png"]').first()).toHaveJSProperty('naturalWidth', 16);
    const lock = page.getByRole('button', { name: /LOCK HERO/ });
    await lock.scrollIntoViewIfNeeded();
    await expect(lock).toBeInViewport();
    expect(await overlay.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await lock.click();

    const canvas = page.locator('canvas[data-game-ready="true"]');
    await expect(canvas).toBeVisible();
    const joystick = page.getByTestId('move-joystick');
    await expect(joystick).toBeVisible();
    await joystick.scrollIntoViewIfNeeded();
    await expect(joystick).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Attack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cast Q' })).toBeVisible();

    const startX = Number(await canvas.getAttribute('data-server-x'));
    const box = await joystick.boundingBox();
    expect(box).not.toBeNull();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: centerX, y: centerY, id: 1 }] });
    await page.waitForTimeout(100);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: centerX + 45, y: centerY, id: 1 }] });
    await expect.poll(async () => {
      const style = await joystick.locator('div').getAttribute('style');
      return Number(style?.match(/\+ ([\d.]+)px/)?.[1] || 0);
    }).toBeGreaterThan(12);
    await expect.poll(async () => Number(await canvas.getAttribute('data-server-x'))).toBeGreaterThan(startX + 20);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await page.getByRole('button', { name: 'Cast Q' }).tap();
    await expect.poll(async () => Number(await canvas.getAttribute('data-server-mana'))).toBeLessThan(100);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(joystick).toBeVisible();
    await expect(page.getByRole('button', { name: 'Attack' })).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
