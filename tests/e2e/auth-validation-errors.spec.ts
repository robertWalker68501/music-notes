import { expect, test } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
} from './helpers/auth-workflow';

const TEST_EMAIL = 'e2e-auth-errors@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Errors-2026!';
const TEST_NAME = 'E2E Auth Errors';

test.describe('authentication validation and errors', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('shows client-side sign-up validation errors without creating an account', async ({
    page,
  }) => {
    await page.goto('/sign-up');

    await page.getByLabel('Full Name').fill('A');
    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(`${TEST_PASSWORD}-mismatch`);
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(
      page.getByText('Name must be at least 3 characters in length'),
    ).toBeVisible();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(/\/sign-up$/);
  });

  test('handles an existing unverified email without exposing account existence', async ({
    page,
  }) => {
    await page.goto('/sign-up');

    await page.getByLabel('Full Name').fill(TEST_NAME);
    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(page).toHaveURL(/\/verify$/, { timeout: 15_000 });

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
  });

  test('rejects invalid sign-in credentials and keeps the user unauthenticated', async ({
    page,
  }) => {
    await page.goto('/sign-in');

    await page.getByLabel('Email Address').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Failed to sign in' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
