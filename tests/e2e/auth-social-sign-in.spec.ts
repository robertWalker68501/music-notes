import { expect, test, type Page } from '@playwright/test';

type SocialProvider = 'google' | 'github';

async function expectSocialSignInRequest(
  page: Page,
  provider: SocialProvider,
) {
  const requestPromise = page.waitForRequest((request) => {
    return (
      request.method() === 'POST' &&
      request.url().includes('/api/auth/sign-in/social')
    );
  });

  await page
    .getByRole('button', {
      name: `Sign in with ${provider === 'google' ? 'Google' : 'GitHub'}`,
      exact: true,
    })
    .click();

  const request = await requestPromise;
  const payload = request.postDataJSON() as {
    provider?: string;
    callbackURL?: string;
  };

  expect(payload.provider).toBe(provider);
  expect(payload.callbackURL).toBe('/dashboard');
}

test.describe('authentication social sign-in boundaries', () => {
  for (const route of ['/sign-in', '/sign-up']) {
    test(`${route} exposes Google and GitHub sign-in and starts the correct OAuth flow`, async ({
      page,
    }) => {
      await page.route('**/api/auth/sign-in/social', async (route) => {
        await route.abort();
      });

      await page.goto(route);

      await expect(
        page.getByRole('button', { name: 'Sign in with Google', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Sign in with GitHub', exact: true }),
      ).toBeVisible();

      await expectSocialSignInRequest(page, 'google');

      await page.reload();

      await expectSocialSignInRequest(page, 'github');
    });
  }
});
