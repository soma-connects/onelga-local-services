import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form and allow user to type', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
  });
});
