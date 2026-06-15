import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("sign-in page shows login form", async ({ page }) => {
    await page.goto("/en/sign-in");
    await expect(page.getByTestId("sign-in-identifier")).toBeVisible();
    await expect(page.getByTestId("sign-in-password")).toBeVisible();
    await expect(page.getByTestId("sign-in-submit")).toBeVisible();
  });

  test("sign-up role selection is reachable", async ({ page }) => {
    await page.goto("/en/sign-up/role");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Auth guards", () => {
  test("unauthenticated user is redirected from worker portal", async ({ page }) => {
    await page.goto("/en/worker/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("unauthenticated user is redirected from employer portal", async ({ page }) => {
    await page.goto("/en/employer");
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("Sign-in (live API)", () => {
  const identifier = process.env.PLAYWRIGHT_WORKER_EMAIL ?? process.env.PLAYWRIGHT_WORKER_PHONE;
  const password = process.env.PLAYWRIGHT_WORKER_PASSWORD;

  test.skip(!identifier || !password, "Set PLAYWRIGHT_WORKER_EMAIL/PHONE and PLAYWRIGHT_WORKER_PASSWORD");

  test("worker can sign in and reach dashboard", async ({ page }) => {
    await page.goto("/en/sign-in/email");
    await page.getByTestId("sign-in-identifier").fill(identifier!);
    await page.getByTestId("sign-in-password").fill(password!);
    await page.getByTestId("sign-in-submit").click();
    await expect(page).toHaveURL(/\/en\/worker/, { timeout: 30_000 });
  });
});
