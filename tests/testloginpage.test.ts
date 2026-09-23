import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("Check Login page title", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await expect(page).toHaveTitle("Swag Labs");
});

test("Check elements loaded", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.expectLoaded();
});
