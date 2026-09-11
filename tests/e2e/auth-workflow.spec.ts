import { expect, test } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';

const TEST_EMAIL = 'e2e-auth-flow@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-2026!';
const TEST_NAME = 'E2E Auth User';

test.describe('authentication workflow', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('user can sign up, verify email, sign in, reach the dashboard, and sign out', async ({
    page,
  }) => {
    await page.goto('/sign-up');

    await page.getByLabel('Full Name').fill(TEST_NAME);
    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(page).toHaveURL(/\/verify$/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: 'Check your email' }),
    ).toBeVisible();

    const verificationUrl = await waitForVerificationUrl(TEST_EMAIL);
    await page.goto(verificationUrl);

    await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);

    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /Welcome back, E2E/i, level: 1 }),
    ).toBeVisible();

    const userMenu = page.getByRole('button', { name: 'User menu' });

    // Under combined dev-server load, the server-rendered trigger can become
    // visible just before its client dropdown behavior is hydrated. Retry the
    // user action until Base UI confirms the menu is actually open.
    await expect(async () => {
      if ((await userMenu.getAttribute('aria-expanded')) !== 'true') {
        await userMenu.click();
      }

      await expect(userMenu).toHaveAttribute('aria-expanded', 'true');
    }).toPass({ timeout: 20_000 });

    await page.getByRole('menuitem', { name: 'Log out' }).click();

    await expect(page).toHaveURL('/', { timeout: 15_000 });
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible({ timeout: 15_000 });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
