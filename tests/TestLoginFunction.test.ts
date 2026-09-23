import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('login should verify the page title after successful login', async ({ page }) => {
  const env = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {};

  const username = env.LOGIN_USERNAME ?? 'standard_user';
  const password = env.LOGIN_PASSWORD ?? 'secret_sauce';

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(username, password);

  await expect(page).toHaveTitle('Swag Labs');
});
