import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("Navigate to login page", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.expectLoaded();

  await expect(page).toHaveTitle("Swag Labs");
});
