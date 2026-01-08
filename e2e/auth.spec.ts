import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    
    // Check page title and form elements
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await page.goto("/login");
    
    // Click sign in without filling form
    await page.getByRole("button", { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/login");
    
    // Click forgot password link
    await page.getByRole("link", { name: /forgot.*password/i }).click();
    
    // Should be on forgot password page
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByRole("heading", { name: /reset.*password|forgot.*password/i })).toBeVisible();
  });

  test("should display signup page for invited users", async ({ page }) => {
    await page.goto("/signup");
    
    // Check page loads (may redirect or show message about invitations)
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("should redirect unauthenticated users from dashboard to login", async ({ page }) => {
    await page.goto("/");
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect unauthenticated users from cases to login", async ({ page }) => {
    await page.goto("/cases");
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect unauthenticated users from invoices to login", async ({ page }) => {
    await page.goto("/invoices");
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect unauthenticated users from settings to login", async ({ page }) => {
    await page.goto("/settings");
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});

