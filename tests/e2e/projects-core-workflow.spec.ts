import { expect, test, type Page } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';
import { getProjectByOwnerEmailAndName } from './helpers/project-workflow-db';

const TEST_EMAIL = 'e2e-projects-core@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Projects-2026!';
const TEST_NAME = 'E2E Projects User';

const PROJECT_NAME = 'Midnight Demo Sessions';
const PROJECT_DESCRIPTION =
  'A home-recording demo project for tracking the songs and takes from the September sessions.';
const UPDATED_PROJECT_NAME = 'Midnight Demo Sessions — Revised';
const UPDATED_DESCRIPTION =
  'Updated notes for the demo after the first round of recording sessions.';

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

async function chooseSelectOption(
  page: Page,
  label: string,
  option: string,
) {
  await page.getByLabel(label).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test.describe('projects core CRUD workflow', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('user can create, view, edit, persist, and delete a project', async ({
    page,
  }) => {
    await signUpVerifyAndSignIn(page);

    await page.goto('/dashboard/projects');

    await expect(
      page.getByRole('heading', { name: 'Projects', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('No projects yet')).toBeVisible({ timeout: 15_000 });

    await page
      .getByRole('button', { name: 'New project', exact: true })
      .click();

    await expect(page).toHaveURL(/\/dashboard\/projects\/new$/);
    await expect(
      page.getByRole('heading', { name: 'Create project', level: 1 }),
    ).toBeVisible();

    await page.getByLabel('Project name').fill(PROJECT_NAME);
    await page.getByLabel('Description').fill(PROJECT_DESCRIPTION);
    await chooseSelectOption(page, 'Project type', 'Demo');
    await chooseSelectOption(page, 'Status', 'Recording');

    await page
      .getByRole('button', { name: 'Create project', exact: true })
      .click();

    await expect(page).toHaveURL(
      /\/dashboard\/projects\/[^/]+$/,
      { timeout: 15_000 },
    );

    await expect(
      page.getByRole('heading', { name: PROJECT_NAME, level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(PROJECT_DESCRIPTION)).toBeVisible();
    await expect(
      page.getByRole('main').getByText('Demo', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByText('Recording', { exact: true }).first(),
    ).toBeVisible();

    const createdProject = await getProjectByOwnerEmailAndName(
      TEST_EMAIL,
      PROJECT_NAME,
    );

    expect(createdProject).toMatchObject({
      name: PROJECT_NAME,
      description: PROJECT_DESCRIPTION,
      type: 'DEMO',
      status: 'RECORDING',
    });

    const projectId = createdProject?.id;
    expect(projectId).toBeTruthy();

    await page
      .getByRole('button', { name: 'Edit project', exact: true })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/projects/${projectId}/edit$`),
    );
    await expect(
      page.getByRole('heading', { name: 'Edit project', level: 1 }),
    ).toBeVisible();

    await expect(page.getByLabel('Project name')).toHaveValue(PROJECT_NAME);
    await expect(page.getByLabel('Description')).toHaveValue(PROJECT_DESCRIPTION);

    await page.getByLabel('Project name').fill(UPDATED_PROJECT_NAME);
    await page.getByLabel('Description').fill(UPDATED_DESCRIPTION);
    await chooseSelectOption(page, 'Project type', 'EP');
    await chooseSelectOption(page, 'Status', 'Mixing');

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/projects/${projectId}$`),
      { timeout: 15_000 },
    );

    await expect(
      page.getByRole('heading', {
        name: UPDATED_PROJECT_NAME,
        level: 1,
      }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(UPDATED_DESCRIPTION)).toBeVisible();
    await expect(
      page.getByRole('main').getByText('EP', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByText('Mixing', { exact: true }).first(),
    ).toBeVisible();

    const updatedProject = await getProjectByOwnerEmailAndName(
      TEST_EMAIL,
      UPDATED_PROJECT_NAME,
    );

    expect(updatedProject).toMatchObject({
      id: projectId,
      name: UPDATED_PROJECT_NAME,
      description: UPDATED_DESCRIPTION,
      type: 'EP',
      status: 'MIXING',
    });

    await page
      .getByRole('button', { name: 'Delete project', exact: true })
      .click();

    const dialog = page.getByRole('alertdialog');
    await expect(
      dialog.getByRole('heading', { name: 'Delete this project?' }),
    ).toBeVisible();

    await dialog
      .getByRole('button', { name: 'Delete project', exact: true })
      .click();

    await expect(page).toHaveURL(/\/dashboard\/projects$/, {
      timeout: 15_000,
    });
    await expect(page.getByText('No projects yet')).toBeVisible({ timeout: 15_000 });

    await expect
      .poll(async () =>
        getProjectByOwnerEmailAndName(TEST_EMAIL, UPDATED_PROJECT_NAME),
      )
      .toBeNull();
  });
});
