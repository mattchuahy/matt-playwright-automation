import { test, expect } from "@playwright/test";

test("Navigate to login page", async ({ page }) => {
  await page.goto("https://www.saucedemo.com/");
  // The saucedemo homepage is the login page; verify login form elements are present
  const username = page.locator('#user-name');
  const password = page.locator('#password');
  const loginBtn = page.locator('#login-button');

  await expect(username).toBeVisible();
  await expect(password).toBeVisible();
  await expect(loginBtn).toBeVisible();

  await expect(page).toHaveTitle("Swag Labs");
});
