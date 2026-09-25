import { test } from "@playwright/test";
import { EmailUtils } from "./utils/EmailUtils";
import * as signUpPage from "./pages/SignUp";
import * as loginPage from "./pages/Login";
import { loginDataFileExists, writeLoginData } from "./utils/AuthFileUtils";

test("Sign up", async ({ page }) => {
  // skip the test if login data already exists
  test.skip(
    loginDataFileExists(),
    "Login data already exists, skipping sign up test."
  );

  const emailUtils = new EmailUtils();
  const inbox = await emailUtils.createInbox();

  await page.goto("/signup");

  await signUpPage.signUp(page, inbox.emailAddress);

  const email = await emailUtils.waitForLatestEmail(inbox.id);

  // get the code\ from the email body:
  const code = /([0-9]{6})$/.exec(email?.body!)![1];

  await signUpPage.addConfirmationCode(page, code);

  await loginPage.login(page, inbox.emailAddress, signUpPage.signUpData.pass);

  await loginPage.verifySuccessfulLogin(page);

  // persist login data:
  writeLoginData({
    email: inbox.emailAddress,
    pass: signUpPage.signUpData.pass,
  });
});
