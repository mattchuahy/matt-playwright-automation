import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("Navigate to login page", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(page).toHaveTitle("Swag Labs");
});

test("Verify elements loaded", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.expectLoaded();
});
