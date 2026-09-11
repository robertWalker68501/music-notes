import { expect, test, type Page } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';
import {
  countProjectsByOwnerEmail,
  getProjectByOwnerEmailAndName,
} from './helpers/project-workflow-db';

const TEST_EMAIL = 'e2e-projects-validation@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Projects-2026!';
const TEST_NAME = 'E2E Projects Validation';

const VALID_PROJECT_NAME = 'Validation Demo';
const VALID_DESCRIPTION = 'A valid project used to verify edit validation.';

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

test.describe('projects validation and error handling', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('rejects an empty project name without creating a record', async ({
    page,
  }) => {
    await signUpVerifyAndSignIn(page);
    await page.goto('/dashboard/projects/new');

    await page.getByLabel('Project name').fill('   ');
    await page
      .getByRole('button', { name: 'Create project', exact: true })
      .click();

    await expect(
      page.getByText('Project name is required', { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/projects\/new$/);

    expect(await countProjectsByOwnerEmail(TEST_EMAIL)).toBe(0);
  });

  test('rejects an overlong edit and preserves the stored project', async ({
    page,
  }) => {
    await signUpVerifyAndSignIn(page);
    await page.goto('/dashboard/projects/new');

    await page.getByLabel('Project name').fill(VALID_PROJECT_NAME);
    await page.getByLabel('Description').fill(VALID_DESCRIPTION);
    await page
      .getByRole('button', { name: 'Create project', exact: true })
      .click();

    await expect(page).toHaveURL(/\/dashboard\/projects\/[^/]+$/, {
      timeout: 15_000,
    });

    const createdProject = await getProjectByOwnerEmailAndName(
      TEST_EMAIL,
      VALID_PROJECT_NAME,
    );

    expect(createdProject).not.toBeNull();

    await page
      .getByRole('button', { name: 'Edit project', exact: true })
      .click();

    const overlongName = 'P'.repeat(121);
    await page.getByLabel('Project name').fill(overlongName);
    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();

    await expect(
      page.getByText(
        'Project name must be 120 characters or fewer',
        { exact: true },
      ),
    ).toBeVisible();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/projects/${createdProject!.id}/edit$`),
    );

    const persistedProject = await getProjectByOwnerEmailAndName(
      TEST_EMAIL,
      VALID_PROJECT_NAME,
    );

    expect(persistedProject).toMatchObject({
      id: createdProject!.id,
      name: VALID_PROJECT_NAME,
      description: VALID_DESCRIPTION,
      type: 'OTHER',
      status: 'PLANNING',
    });

    expect(await countProjectsByOwnerEmail(TEST_EMAIL)).toBe(1);
  });
});
