import { expect, test } from "@playwright/test";
import * as loginPage from "../pages/Login";
import { readLoginData, getAuthSessionPath } from "../utils/AuthFileUtils";

test("authenticate", async ({ page }) => {
  const loginData = readLoginData();

  if (loginData) {
    await page.goto("/login");

    await loginPage.login(page, loginData.email, loginData.pass);
    // After successful login, user should be redirected to home page
    await expect(page).toHaveURL("/");

    await page.context().storageState({
      path: getAuthSessionPath(),
    });
  } else {
    console.warn("No valid credentials found");
  }
});
