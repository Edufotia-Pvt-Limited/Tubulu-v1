import { test, expect } from '@playwright/test';

// Configuration constants for the test
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'; 
const API_URL = process.env.API_URL || 'http://localhost:3008';
const SUPER_ADMIN_PHONE = '9999999999';
const SUPER_ADMIN_PASSWORD = 'testpassword'; // Replace with actual test password

test.describe('Vendor Onboarding E2E Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Add console and error listeners to debug the page
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.log(`[Browser Error] ${error.message}`));

    // 1. Bypass UI Login via API for faster test execution
    const response = await page.request.post(`${API_URL}/api/v1/integrations/admin/login`, {
      data: { username: 'admin', password: '123456' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const token = body.data.authToken;
    const user = body.data;

    // 2. We must navigate to the app origin first to set Storage
    await page.goto(`${BASE_URL}/auth/jwt/login`);

    // 3. Inject the tokens into browser storage
    await page.evaluate((userData) => {
      window.sessionStorage.setItem('accessToken', userData.authToken);
      window.localStorage.setItem('tubulu_session', JSON.stringify(userData));
    }, user);

    // 4. Reload the page to let the AuthProvider bootstrap the session and auto-redirect to dashboard
    await page.reload();
    await page.waitForURL('**/dashboard**', { timeout: 15000 });

    // 5. Soft navigate or hard navigate to the onboarding page
    await page.goto(`${BASE_URL}/merchants/onboard`);
  });

  test('should successfully onboard a new merchant', async ({ page }) => {
    // Wait for the form to be visible
    await page.waitForSelector('text=Store Information');

    // Generate a random 10-digit phone number for the new merchant to avoid collisions in DB
    const randomPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // ----------------------------------------------------
    // UI Interaction: Fill out the 'Store Information' section
    // ----------------------------------------------------
    await page.fill('input[placeholder="e.g. 9876543210"]', randomPhone); // Phone Number
    await page.fill('input[placeholder="e.g. Tubulu Snacks"]', `Tubulu E2E Store ${randomPhone}`); // Integration Name
    // Select the Business Category
    await page.getByLabel('Business Category').click();
    await page.getByRole('option', { name: 'Food & Beverage' }).click();

    // ----------------------------------------------------
    // UI Interaction: Fill out the 'Location Details' section
    // ----------------------------------------------------
    await page.fill('label:has-text("Address Line") + div input', '123 Test Street');
    await page.fill('label:has-text("City") + div input', 'Mumbai');
    await page.fill('label:has-text("State") + div input', 'Maharashtra');
    await page.fill('label:has-text("Pincode") + div input', '400001');

    // ----------------------------------------------------
    // UI Interaction: Submit the Form
    // ----------------------------------------------------
    await page.click('button:has-text("Finish Onboarding")');

    // ----------------------------------------------------
    // UI & Backend Validation
    // ----------------------------------------------------
    // 1. Verify the success alert appears
    await expect(page.locator('text=Merchant onboarded successfully!')).toBeVisible({ timeout: 10000 });
    
    // 2. Verify it automatically redirects to the merchants list view after success
    await expect(page).toHaveURL(`${BASE_URL}/merchants`, { timeout: 5000 });
  });

  test('should show error and prevent submission for duplicate phone number', async ({ page }) => {
    // Wait for the form to be visible
    await page.waitForSelector('text=Store Information');

    // ----------------------------------------------------
    // UI Interaction: Enter a known existing number
    // We use the Super Admin phone number since it is guaranteed to exist
    // ----------------------------------------------------
    await page.fill('input[placeholder="e.g. 9876543210"]', SUPER_ADMIN_PHONE);
    await page.fill('input[placeholder="e.g. Tubulu Snacks"]', 'Duplicate Store Attempt');

    // ----------------------------------------------------
    // UI Interaction: Attempt to submit the Form
    // ----------------------------------------------------
    await page.click('button:has-text("Finish Onboarding")');

    // ----------------------------------------------------
    // Validation: Verify submission is blocked
    // ----------------------------------------------------
    // Verify an error alert appears
    await expect(page.locator('.MuiAlert-standardError')).toBeVisible({ timeout: 10000 });
    
    // Ensure we are STILL on the onboarding page (no redirect happened)
    await expect(page).toHaveURL(`${BASE_URL}/merchants/onboard`);
  });

});
