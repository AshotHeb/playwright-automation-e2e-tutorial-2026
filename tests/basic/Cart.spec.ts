import { test, expect } from "@playwright/test";

test("Item is added to the shopping cart", async ({ page }) => {
  await page.goto("/products");

  const firstProductWrapper = page.locator(".p-6").first();
  const firstProductName = await firstProductWrapper
    .getByRole("heading")
    .first()
    .textContent();
  const firstProductPrice = await firstProductWrapper
    .locator(".font-bold")
    .textContent();
  const firstButton = firstProductWrapper.getByRole("button", {
    name: "Add to Cart",
  });

  await firstButton.click();
  await page
    .locator('[data-test-id="header-cart-button"]')
    .getByRole("button")
    .click();

  // assert first product name
  const firstProductHeading = page.getByRole("heading", {
    name: firstProductName!,
  });
  await expect(firstProductHeading).toBeVisible();

  // assert subtotal:
  const subTotalWrapper = page
    .getByText("Subtotal")
    .locator("..")
    .locator(".font-semibold");
  const subtotal = await subTotalWrapper.textContent();
  const expectedSubtotal = Number(subtotal?.substring(1));
  const actualSubtotal = Number(firstProductPrice?.substring(1));
  expect(actualSubtotal).toEqual(expectedSubtotal);
});
