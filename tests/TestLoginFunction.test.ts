import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('login should verify the page title after successful login', async ({ page }) => {
  const { LOGIN_USERNAME: username, LOGIN_PASSWORD: password } = process.env;

  if (!username || !password) {
    throw new Error('LOGIN_USERNAME and LOGIN_PASSWORD must be set in .env');
  }

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(username, password);

  await expect(page).toHaveTitle('Swag Labs');
});
