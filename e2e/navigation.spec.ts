import { test, expect } from "@playwright/test";

test.describe("Public Navigation", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/peak|dental|login/i);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("forgot password page loads correctly", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("signup page loads correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading")).toBeVisible();
  });
});

test.describe("Protected Routes Redirect", () => {
  const protectedRoutes = [
    "/",
    "/cases",
    "/cases/new",
    "/invoices",
    "/shipping",
    "/shipping/new",
    "/notifications",
    "/settings",
    "/settings/practice",
    "/settings/notifications",
    "/settings/security",
    "/settings/payment-methods",
    "/settings/users",
    "/help",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      
      // Should redirect to login page
      await expect(page).toHaveURL(/login/, { timeout: 10000 });
    });
  }
});

test.describe("Page Load Performance", () => {
  test("login page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe("Responsive Design", () => {
  test("login page is responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");
    
    // Form should still be visible and usable
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("login page is responsive on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/login");
    
    // Form should still be visible and usable
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});

