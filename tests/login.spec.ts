import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// This test reads credentials from environment variables to avoid committing secrets.
// Locally, create a .env file (gitignored) with TEST_USERNAME and TEST_PASSWORD,
// or export environment variables in your shell/CI.

test('user can login with credentials from env', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  // Skip the test with a clear message if credentials are not provided.
  if (!username || !password) {
    test.skip('TEST_USERNAME/TEST_PASSWORD not set. Create a .env file or set environment variables.');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.expectLoaded();

  // Do not log or print credentials anywhere — use them directly.
  await loginPage.loginWithCredentials(username, password);

  // Verify successful login by checking elements on the inventory page.
  await expect(page).toHaveURL(/.*inventory.html/);
  await expect(page.locator('#inventory_container')).toBeVisible();
  // Ensure at least one inventory item is shown after login.
  await expect(page.locator('.inventory_item').first()).toBeVisible();
});
