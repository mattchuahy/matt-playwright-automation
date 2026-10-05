import { expect, test } from "@playwright/test";

test("submits the practice form with student details", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form");

  await page.locator("#firstName").fill("Alex");
  await page.locator("#lastName").fill("Morgan");
  await page.locator("#userEmail").fill("alex.morgan@example.com");
  await page.getByText("Male", { exact: true }).click();
  await page.locator("#userNumber").fill("1234567890");
  await page.getByText("Sports", { exact: true }).click();
  await page.locator("#currentAddress").fill("123 Test Street");

  await page.getByRole("button", { name: "Submit" }).click();

  const confirmationDialog = page.getByRole("dialog", {
    name: "Thanks for submitting the form",
  });

  await expect(confirmationDialog).toBeVisible();
  for (const detailsRow of [
    "Student Name Alex Morgan",
    "Student Email alex.morgan@example.com",
    "Gender Male",
    "Mobile 1234567890",
    "Hobbies Sports",
    "Address 123 Test Street",
  ]) {
    await expect(
      confirmationDialog.getByRole("row", { name: detailsRow }),
    ).toBeVisible();
  }
});