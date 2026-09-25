# Playwright Practice

Course: [Playwright E2E Testing for Beginners (JS/TS)](https://www.udemy.com/course/playwright-e2e-testing-for-beginners-js-ts/)

Started: 08.09.2026

## Installation

```bash
npm init playwright@latest
```

## 1. User behavior vs. machine behavior

- `getByRole`: user behavior (finds elements the way a user or screen reader sees them)
- `getByText`, `getByTestId`: machine behavior

## 2. Tooling

- `npx playwright codegen`: records your actions in the browser and generates locators and test code
- VS Code debugger: set breakpoints and debug inside test files
- `npx playwright test --ui`: runs Playwright in UI mode

## 6. Organizing and managing Playwright tests

### Test annotations

```ts
test.fail("title", async ({ page }) => {}); // test is expected to fail
test.skip("title", async ({ page }) => {}); // test is skipped
test.only("title", async ({ page }) => {}); // runs only the `.only` tests in the whole suite
```

### Test hooks

Hooks work like middleware and reduce duplication:

```ts
test.beforeAll(async () => {});           // runs once, before the first test
test.beforeEach(async ({ page }) => {});  // runs before each test
test.afterEach(async ({ page }) => {});   // runs after each test
test.afterAll(async () => {});            // runs once, after the last test
```

Use `afterEach` / `afterAll` to clean up the database after your tests.

### Grouping tests with `describe`

```ts
test.describe("group name", () => {
  test("title", async ({ page }) => {});
});
```

Each `describe` block has its own hooks and scope.

### Tags

```ts
test.describe("group name", { tag: ["@Field", "@Error"] }, () => {
  test("title", async ({ page }) => {});
});
```

Run only the tests with these tags:

```bash
npx playwright test --grep "@Field|@Error"
```

### HTML report

Add `reporter: "html"` to `playwright.config.ts` to generate the HTML report.

### Configuration layers

`test.use` overrides config for a scope, like middleware:

```ts
test.describe("German locale", () => {
  test.use({ locale: "de-DE" });

  test("title", async ({ page }) => {});
});
```

### Configuring the test device

```ts
import { test, devices } from "@playwright/test";

// Option 1: custom settings
test.use({
  baseURL: "https://example.com",
  defaultBrowserType: "firefox",
  viewport: { width: 1280, height: 720 },
});

// Option 2: a predefined device
test.use({ ...devices["iPhone 13 Pro"] });

// Option 3: geolocation
test.use({
  geolocation: { latitude: -15.79374, longitude: -47.88477 },
  permissions: ["geolocation"],
});
```

### Test runner options

These options speed up test execution. They can be set globally in `playwright.config.ts` or locally per file.

```ts
export default defineConfig({
  fullyParallel: true, // run tests in parallel
  workers: 3,          // number of parallel workers
});
```

### Multiple projects

A project is a group of tests that share the same config. Use projects to run tests against staging and production, or in different browsers.

```ts
export default defineConfig({
  projects: [{ name: "chromium" }, { name: "firefox" }],
});
```

A project can list `dependencies`: other projects that must run first, for example an auth setup project (see [Reusing authentication](#reusing-authentication)).

## 7. Hands-on practice: testing real workflows

### Project setup

```bash
npm init playwright@latest
```

`playwright.config.ts`:

```ts
use: {
  baseURL: "https://valentinos-magic-beans.click",
}
```

### Basic test: add a product to the cart

[tests/basic/Cart.spec.ts](tests/basic/Cart.spec.ts): adds a product to the cart, opens the cart, and checks that the item is there.

### Page Object Model (POM)

POM structures the test suite and keeps it maintainable: each page gets its own file of reusable functions in [tests/pages/](tests/pages/).

Example: "Item is added to the shopping cart" in [tests/product-flow.spec.ts](tests/product-flow.spec.ts).

### End-to-end test of the order flow

See "Complete workflow for product order" in [tests/product-flow.spec.ts](tests/product-flow.spec.ts).

### Clear reporting

```bash
npx playwright show-report
```

This opens the HTML test report. Wrap actions in `test.step("name", async () => {})` so the report shows a clearer breakdown of each test.

### Sandbox email

Access an inbox through an API to read verification codes and similar emails:

- MailSlurp: paid
- Mailtrap: paid
- Mail.tm: free

### Sign-up flow

[tests/auth-flow.spec.ts](tests/auth-flow.spec.ts) signs up with a Mail.tm inbox ([tests/utils/EmailUtils.ts](tests/utils/EmailUtils.ts)) and reads the confirmation code from the email.

### Storing credentials securely

`writeLoginData` ([tests/utils/AuthFileUtils.ts](tests/utils/AuthFileUtils.ts)) saves the login details to `playwright/.auth/`. That folder is in `.gitignore` so credentials never get committed.

### Reusing authentication

Log in once in a setup project, save the session with `storageState`, and make the browser projects depend on it:

```ts
projects: [
  {
    name: "signup",
    testMatch: /auth-flow\.spec\.ts/,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "auth-setup",
    testMatch: /auth\.setup\.ts/,
    dependencies: ["signup"],
  },
  {
    name: "chromium",
    testIgnore: [/auth-flow\.spec\.ts/, /auth\.setup\.ts/],
    use: {
      ...devices["Desktop Chrome"],
      storageState: "playwright/.auth/user.json",
    },
    dependencies: ["auth-setup"],
  },
],
```

The run order is `signup` → `auth-setup` → `chromium`.

The sign-up test must not load `storageState`, because `user.json` doesn't exist until sign-up and login have run. Otherwise it fails with `ENOENT: no such file or directory, open 'playwright/.auth/user.json'`.

If you run tests from the VS Code extension, enable the `signup` and `auth-setup` projects too.

### Intercepting and asserting API calls

Playwright can intercept every network request and mock or block it.

Use cases:

- Mock an error response to check how the frontend handles it
- Block unneeded requests (images, analytics) so tests run faster

```ts
await page.route("**/api/products", (route) =>
  route.fulfill({ status: 500, body: "Server error" })
);

await page.route("**/*.{png,jpg}", (route) => route.abort());
```
