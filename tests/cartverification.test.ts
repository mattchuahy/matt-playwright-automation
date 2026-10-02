import { expect, test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("cart contains the products added from the inventory page", async ({ page }) => {
  // Read the SauceDemo credentials from the repository's .env file.
  const { LOGIN_USERNAME: username, LOGIN_PASSWORD: password } = process.env;

  if (!username || !password) {
    throw new Error("LOGIN_USERNAME and LOGIN_PASSWORD must be set in .env");
  }

  // Sign in and confirm the inventory page is open.
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);

  await expect(page).toHaveURL(/inventory\.html$/);
  await expect(page.getByText("Products", { exact: true })).toBeVisible();

  // Add the selected products and verify the cart badge count.
  const itemNames = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

  for (const itemName of itemNames) {
    const item = page.locator(".inventory_item").filter({
      has: page.getByText(itemName, { exact: true }),
    });

    await expect(item).toHaveCount(1);
    await item.getByRole("button", { name: "Add to cart" }).click();
  }

  await expect(page.locator(".shopping_cart_badge")).toHaveText(
    String(itemNames.length),
  );

  // Open the cart and check its products match the selected inventory items.
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL(/cart\.html$/);
  await expect(page.locator(".cart_item .inventory_item_name")).toHaveText(
    itemNames,
  );
});

test("removing a product removes it from the cart", async ({ page }) => {
  // Read credentials and sign in to SauceDemo.
  const { LOGIN_USERNAME: username, LOGIN_PASSWORD: password } = process.env;

  if (!username || !password) {
    throw new Error("LOGIN_USERNAME and LOGIN_PASSWORD must be set in .env");
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);

  // Find and add the product to the cart.
  await expect(page).toHaveURL(/inventory\.html$/);

  const itemName = "Sauce Labs Backpack";
  const item = page.locator(".inventory_item").filter({
    has: page.getByText(itemName, { exact: true }),
  });

  await item.getByRole("button", { name: "Add to cart" }).click();
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL(/cart\.html$/);

  // Remove the product and verify both the cart and its badge are empty.
  const cartItem = page.locator(".cart_item").filter({
    has: page.getByText(itemName, { exact: true }),
  });
  await expect(cartItem).toHaveCount(1);
  await cartItem.getByRole("button", { name: "Remove" }).click();
  await expect(page.locator(".cart_item")).toHaveCount(0);
  await expect(page.locator(".shopping_cart_badge")).toHaveCount(0);
});
