import { expect, test, type Page } from "@playwright/test";

const storeUrl = "https://demowebshop.tricentis.com";

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

test("navigates between category tabs and updates the page header", async ({
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

  // Start at the store home page before using the primary category navigation.
  await page.goto(storeUrl);

  // Each navigation tab should open its category and update the page heading.
  for (const category of categories) {
    await page.locator(`.top-menu a[href="${category.path}"]`).click();
    await expect(page).toHaveURL(`${storeUrl}${category.path}`);
    await expect(page.locator("h1")).toHaveText(category.heading);
  }
});
