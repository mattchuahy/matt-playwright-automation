import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const storeUrl = "https://demowebshop.tricentis.com";
const testAccount = {
  email: `playwright-${randomUUID()}@example.com`,
  password: "DemoShopTest!2026",
};

async function addProductToCart(
  page: Page,
  productPath: string,
  expectedCartCount: number,
) {
  await page.goto(`${storeUrl}/${productPath}`);

  // Add the product from its details page and wait for the cart badge to update.
  await page.locator(".add-to-cart-button").click();
  await expect(page.locator(".ico-cart .cart-qty")).toContainText(
    `(${expectedCartCount})`,
  );
}

test("adds an item to the cart", async ({ page }) => {
  // Start from an isolated browser context and add a simple product.
  await addProductToCart(page, "141-inch-laptop", 1);
  await page.goto(`${storeUrl}/cart`);

  // Confirm the selected product appears in the cart.
  await expect(page.locator(".cart-item-row")).toHaveCount(1);
  await expect(page.locator(".cart-item-row")).toContainText("14.1-inch Laptop");
});

test("empties the cart", async ({ page }) => {
  // Add a product, then remove it using the cart's remove checkbox.
  await addProductToCart(page, "141-inch-laptop", 1);
  await page.goto(`${storeUrl}/cart`);
  await page.locator(".cart-item-row input[type='checkbox']").check();
  await page.getByRole("button", { name: "Update shopping cart" }).click();

  // Verify the product and cart count are both cleared.
  await expect(page.locator(".cart-item-row")).toHaveCount(0);
  await expect(page.getByText("Your Shopping Cart is empty!")).toBeVisible();
  await expect(page.locator(".ico-cart .cart-qty")).toContainText("(0)");
});

test("adds multiple items to the cart", async ({ page }) => {
  // Add two different products and wait for each cart update.
  await addProductToCart(page, "141-inch-laptop", 1);
  await addProductToCart(page, "computing-and-internet", 2);
  await page.goto(`${storeUrl}/cart`);

  // Check that both selected products are present.
  await expect(page.locator(".cart-item-row")).toHaveCount(2);
  await expect(page.locator(".cart-item-row")).toContainText([
    "14.1-inch Laptop",
    "Computing and Internet",
  ]);
});

test("checks out an item from the cart as a guest", async ({ page }) => {
  // Add a product and proceed through the cart's guest checkout entry point.
  await addProductToCart(page, "141-inch-laptop", 1);
  await page.goto(`${storeUrl}/cart`);
  await page.locator("#termsofservice").check();
  await page.locator("#checkout").click();
  await page.locator(".checkout-as-guest-button").click();
  await expect(page).toHaveURL(/onepagecheckout/);

  // Fill in fictional checkout details for the demo storefront.
  await page.locator("#BillingNewAddress_FirstName").fill("Taylor");
  await page.locator("#BillingNewAddress_LastName").fill("Example");
  await page.locator("#BillingNewAddress_Email").fill("taylor@example.com");
  await page
    .locator("#BillingNewAddress_CountryId")
    .selectOption({ label: "United States" });
  await page
    .locator("#BillingNewAddress_StateProvinceId")
    .selectOption({ label: "New York" });
  await page.locator("#BillingNewAddress_City").fill("New York");
  await page.locator("#BillingNewAddress_Address1").fill("123 Demo Street");
  await page.locator("#BillingNewAddress_ZipPostalCode").fill("10001");
  await page.locator("#BillingNewAddress_PhoneNumber").fill("2125550100");

  // Complete the billing, shipping, payment, and payment-information steps.
  await page.locator(".new-address-next-step-button:visible").click();
  await expect(page.locator("#shipping-address-select")).toBeVisible();
  await page.locator(".new-address-next-step-button:visible").click();
  await page.locator(".shipping-method-next-step-button").click();
  await page.locator("#paymentmethod_0").check();
  await page.locator(".payment-method-next-step-button").click();
  await page.locator(".payment-info-next-step-button").click();

  // Review the order before placing it, then confirm successful checkout.
  await expect(
    page.getByRole("link", { name: "14.1-inch Laptop", exact: true }),
  ).toBeVisible();
  await page.locator(".confirm-order-next-step-button").click();
  await expect(
    page.getByText("Your order has been successfully processed!", {
      exact: true,
    }),
  ).toBeVisible();
});

test("shows the guest wishlist behavior available on the storefront", async ({
  page,
}) => {
  // The live storefront does not render an add-to-wishlist action for guests.
  await page.goto(`${storeUrl}/141-inch-laptop`);
  await expect(page.locator(".add-to-wishlist-button")).toHaveCount(0);

  // Document the guest-facing outcome: the wishlist remains empty.
  await page.goto(`${storeUrl}/wishlist`);
  await expect(page.getByText("The wishlist is empty!")).toBeVisible();
  await expect(page.locator(".ico-wishlist .wishlist-qty")).toContainText(
    "(0)",
  );
});

test("checks category page headers without checking the URL", async ({
  page,
}) => {
  const categories = [
    { path: "/books", heading: "Books" },
    { path: "/computers", heading: "Computers" },
    { path: "/electronics", heading: "Electronics" },
    { path: "/apparel-shoes", heading: "Apparel & Shoes" },
    { path: "/digital-downloads", heading: "Digital downloads" },
    { path: "/jewelry", heading: "Jewelry" },
    { path: "/gift-cards", heading: "Gift Cards" },
  ];

  // Use the category tabs and assert only the visible page heading.
  await page.goto(storeUrl);
  for (const category of categories) {
    await page.locator(`.top-menu a[href="${category.path}"]`).click();
    await expect(page.locator("h1")).toHaveText(category.heading);
  }
});

test.describe.serial("customer account flows", () => {
  test("registers a new account", async ({ page }) => {
    // Create a unique customer account for the login test in this serial group.
    await page.goto(`${storeUrl}/register`);
    await page.locator("#gender-male").check();
    await page.locator("#FirstName").fill("Playwright");
    await page.locator("#LastName").fill("Test");
    await page.locator("#Email").fill(testAccount.email);
    await page.locator("#Password").fill(testAccount.password);
    await page.locator("#ConfirmPassword").fill(testAccount.password);
    await page.locator("#register-button").click();

    // Confirm the storefront reports that registration completed successfully.
    await expect(page.locator(".result")).toHaveText(
      "Your registration completed",
    );
  });

  test("logs in with the newly registered account", async ({ page }) => {
    // Sign in with the account created by the previous test.
    await page.goto(`${storeUrl}/login`);
    await page.locator("#Email").fill(testAccount.email);
    await page.locator("#Password").fill(testAccount.password);
    await page.locator(".login-button").click();

    // A successful login displays the customer email and logout link.
    await expect(
      page.getByRole("link", { name: testAccount.email, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Log out", exact: true }),
    ).toBeVisible();
  });

  test("rejects invalid login credentials", async ({ page }) => {
    // Submit credentials that do not belong to a registered customer.
    await page.goto(`${storeUrl}/login`);
    await page.locator("#Email").fill(`invalid-${randomUUID()}@example.com`);
    await page.locator("#Password").fill("DefinitelyWrong!2026");
    await page.locator(".login-button").click();

    // Verify the storefront explains that the login credentials are incorrect.
    await expect(page.locator(".validation-summary-errors")).toContainText(
      "No customer account found",
    );
  });
});
