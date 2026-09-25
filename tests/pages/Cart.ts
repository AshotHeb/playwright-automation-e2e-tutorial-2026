import { Page, expect } from "@playwright/test";

export async function assertProduct(page: Page, heading: string) {
  const firstProductHeading = page.getByRole("heading", {
    name: heading,
  });
  await expect(firstProductHeading).toBeVisible();
}

export async function getSubTotal(page: Page) {
  const subTotalWrapper = page
    .getByText("Subtotal")
    .locator("..")
    .locator(".font-semibold");
  const subtotal = await subTotalWrapper.textContent();
  return Number(subtotal?.substring(1));
}
