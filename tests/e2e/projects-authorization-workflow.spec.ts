import { expect, test, type Page } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';
import {
  createProjectIsolationFixture,
  deleteProjectIsolationFixture,
  getProjectByOwnerEmailAndName,
} from './helpers/project-workflow-db';

const TEST_EMAIL = 'e2e-projects-isolation@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Projects-2026!';
const TEST_NAME = 'E2E Project Viewer';

const OWNER_EMAIL = 'e2e-projects-owner@example.test';
const OWNER_NAME = 'E2E Project Owner';
const FOREIGN_PROJECT_NAME = 'Private Album Sessions';

async function signUpVerifyAndSignIn(page: Page) {
  await page.goto('/sign-up');

  await page.getByLabel('Full Name').fill(TEST_NAME);
  await page.getByLabel('Email Address').fill(TEST_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

  await expect(page).toHaveURL(/\/verify$/, { timeout: 15_000 });

  const verificationUrl = await waitForVerificationUrl(TEST_EMAIL);
  await page.goto(verificationUrl);

  await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);

  await page.getByLabel('Email Address').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

test.describe('projects authorization and ownership isolation', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
    await deleteProjectIsolationFixture(OWNER_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
    await deleteProjectIsolationFixture(OWNER_EMAIL);
  });

  test('a user cannot discover or directly open another user project', async ({
    page,
  }) => {
    const { projectId } = await createProjectIsolationFixture({
      ownerEmail: OWNER_EMAIL,
      ownerName: OWNER_NAME,
      projectName: FOREIGN_PROJECT_NAME,
    });

    await signUpVerifyAndSignIn(page);

    await page.goto('/dashboard/projects');

    await expect(
      page.getByRole('heading', { name: 'Projects', level: 1 }),
    ).toBeVisible();

    await expect(
      page.getByRole('main').getByText(FOREIGN_PROJECT_NAME, { exact: true }),
    ).toHaveCount(0);

    const detailResponse = await page.goto(`/dashboard/projects/${projectId}`);

    expect(detailResponse?.status()).toBe(404);
    await expect(
      page.getByText('This page could not be found.', { exact: true }),
    ).toBeVisible();

    const editResponse = await page.goto(
      `/dashboard/projects/${projectId}/edit`,
    );

    expect(editResponse?.status()).toBe(404);
    await expect(
      page.getByText('This page could not be found.', { exact: true }),
    ).toBeVisible();

    const foreignProject = await getProjectByOwnerEmailAndName(
      OWNER_EMAIL,
      FOREIGN_PROJECT_NAME,
    );

    expect(foreignProject).toMatchObject({
      id: projectId,
      name: FOREIGN_PROJECT_NAME,
      type: 'ALBUM',
      status: 'RECORDING',
    });
  });
});
