import { expect, test } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';

const TEST_EMAIL = 'e2e-auth-verification@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Verify-2026!';
const TEST_NAME = 'E2E Auth Verification';

test.describe('authentication email verification', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('an unverified user can request a fresh verification link', async ({
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

    // Auth #1 already covers signup -> verify navigation. Reload here so this
    // resend-focused test starts from a fully loaded/hydrated verify page.
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Check your email' }),
    ).toBeVisible();

    // Remove the signup capture so the next captured URL must come from resend.
    await clearCapturedVerificationEmail(TEST_EMAIL);

    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page
      .getByRole('button', { name: 'Resend Verification Email', exact: true })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Verification email sent' }),
    ).toBeVisible();

    const resentVerificationUrl = await waitForVerificationUrl(TEST_EMAIL);
    expect(resentVerificationUrl).toContain('/api/auth/verify-email');

    await page.goto(resentVerificationUrl);
    await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);

    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  });

  test('an invalid verification token does not authenticate a user', async ({
    page,
  }) => {
    await page.goto(
      '/api/auth/verify-email?token=e2e-invalid-verification-token&callbackURL=%2Fsign-in',
    );

    // Do not couple this test to Better Auth's exact invalid-token error page.
    // The security boundary is that an invalid token must not create a session.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
