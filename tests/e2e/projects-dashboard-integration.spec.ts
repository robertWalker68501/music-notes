import { expect, test, type Page } from '@playwright/test';

import {
  clearCapturedVerificationEmail,
  deleteE2EAuthUser,
  waitForVerificationUrl,
} from './helpers/auth-workflow';
import { createProjectForExistingUser } from './helpers/project-workflow-db';

const TEST_EMAIL = 'e2e-projects-integration@example.test';
const TEST_PASSWORD = 'MusicNotes-E2E-Projects-2026!';
const TEST_NAME = 'E2E Dashboard Projects';

const PROJECT_NAME = 'Dashboard Integration EP';
const PROJECT_DESCRIPTION =
  'A seeded project used to verify dashboard and sidebar project integration.';

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

test.describe('projects dashboard and sidebar integration', () => {
  test.beforeEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await deleteE2EAuthUser(TEST_EMAIL);
    await clearCapturedVerificationEmail(TEST_EMAIL);
  });

  test('dashboard reflects project data and project navigation stays connected', async ({
    page,
  }) => {
    await signUpVerifyAndSignIn(page);

    await expect(
      page.getByRole('heading', { name: /Welcome back, E2E/i, level: 1 }),
    ).toBeVisible();

    await expect(
      page.getByText('Create your first project', { exact: true }),
    ).toBeVisible();

    const projectId = await createProjectForExistingUser({
      ownerEmail: TEST_EMAIL,
      name: PROJECT_NAME,
      description: PROJECT_DESCRIPTION,
      type: 'EP',
      status: 'RECORDING',
    });

    await page.reload();

    const workspaceStatus = page.getByRole('region', {
      name: 'Workspace status',
    });

    await expect(workspaceStatus.getByText('1', { exact: true })).toBeVisible();

    const recentProjects = page.getByRole('region', {
      name: 'Recent projects',
    });

    const recentProjectLink = recentProjects.getByRole('link', {
      name: new RegExp(PROJECT_NAME),
    });

    await expect(recentProjectLink).toBeVisible();
    await expect(recentProjects.getByText('EP · Recording')).toBeVisible();

    await recentProjectLink.click();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/projects/${projectId}$`),
    );
    await expect(
      page.getByRole('heading', { name: PROJECT_NAME, level: 1 }),
    ).toBeVisible();

    await page.goto('/dashboard');

    const projectsNav = page.getByRole('link', {
      name: 'Projects',
      exact: true,
    });

    await projectsNav.click();

    await expect(page).toHaveURL(/\/dashboard\/projects$/);
    await expect(
      page.getByRole('heading', { name: 'Projects', level: 1 }),
    ).toBeVisible();
    await expect(projectsNav).toHaveAttribute('data-active', '');

    await expect(
      page.getByRole('main').getByText(PROJECT_NAME, { exact: true }),
    ).toBeVisible();

    await page.goto('/dashboard');

    await page
      .getByRole('button', { name: 'New project', exact: true })
      .click();

    await expect(page).toHaveURL(/\/dashboard\/projects\/new$/);
    await expect(
      page.getByRole('heading', { name: 'Create project', level: 1 }),
    ).toBeVisible();
  });
});
