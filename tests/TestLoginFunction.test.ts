import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("login should verify the page title after successful login", async ({ page }) => {
  const { LOGIN_USERNAME: username, LOGIN_PASSWORD: password } = process.env;

  if (!username || !password) {
    throw new Error("LOGIN_USERNAME and LOGIN_PASSWORD must be set in .env");
    //Exception to check if the username and password are set in the .env file. If not, it throws an error to prevent the test from running with undefined values.
  }

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(username, password);

  await expect(page).toHaveTitle("Swag Labs");
});

test("Login fails with incorrect username and password", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  const invalidUsername = "invalid_user";
  const invalidPassword = "invalid_password";
  await loginPage.login(invalidUsername, invalidPassword);
  await expect(
    page.getByText("Epic sadface: Username and password do not match any user in this service")
  ).toBeVisible();
});
