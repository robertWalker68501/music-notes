import { expect, test } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';

const TEST_EMAIL = 'e2e-auth-guards@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Guards-2026!';
const TEST_NAME = 'E2E Auth Guards';

test.describe('authentication route guards and redirects', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('protects the dashboard and redirects users according to authentication state', async ({
    page,
  }) => {
    // Anonymous users cannot access the authenticated dashboard.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);

    // Create an account. Because email verification is required, signup does
    // not create an authenticated session.
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

    // The account is still unauthenticated until verification + sign-in.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);

    // Verify the account and sign in.
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

    // Authenticated verified users should not be sent back through auth pages.
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    await page.goto('/sign-up');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    await page.goto('/verify');
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  });
});
