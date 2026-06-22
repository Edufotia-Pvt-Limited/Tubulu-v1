import { test, expect } from '@playwright/test';

test.describe('Store Feeds and Moments Scheduling E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Capture browser console logs and exceptions
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER EXCEPTION]: ${err.message}\nStack:\n${err.stack}`));

    console.log("🔑 Logging in as Merchant (Nagpur Coffee House)...");
    await page.goto('/auth/jwt/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="phoneNumber"]', '9900000101');
    await page.click('button[type="submit"]');

    const otpField = page.locator('input[name="otp"]');
    const pinField = page.locator('input[name="pin"]');
    
    await Promise.race([
      otpField.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
      pinField.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    ]);

    if (await pinField.isVisible()) {
      console.log("🔑 Direct PIN input field rendered!");
      await pinField.fill('2123');
      await page.click('button[type="submit"]');
    } else if (await otpField.isVisible()) {
      console.log("✅ OTP input field rendered!");
      await otpField.fill('000000');
      await page.click('button[type="submit"]');
      
      const confirmPinField = page.locator('input[name="confirmPin"]');
      try {
        await confirmPinField.waitFor({ state: 'visible', timeout: 5000 });
        await page.fill('input[name="pin"]', '2123');
        await confirmPinField.fill('2123');
        await page.click('button[type="submit"]');
      } catch (e) {}
    }
    
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log("🎉 Logged in successfully. Extracting token...");
    
    // Extract token from sessionStorage
    const token = await page.evaluate(() => sessionStorage.getItem('accessToken'));
    if (!token) {
      throw new Error("Failed to extract accessToken from sessionStorage after login.");
    }
    
    // Set both sessionStorage and localStorage in the browser context before navigating
    await page.evaluate((t) => {
      sessionStorage.setItem('accessToken', t);
      localStorage.setItem('tubulu_session', JSON.stringify({
        authToken: t,
        role: 'merchant_admin',
        phoneNumber: '9900000101',
        isOnboarded: true,
        isApproved: true,
        isDocumentsUploaded: true,
        isTubuluAppSetupDone: true
      }));
    }, token);

    console.log("🎉 Token secured and stored in localStorage. Navigating to feeds...");
    await page.goto('/dashboard/feeds');
    await page.waitForLoadState('networkidle');
  });

  test('Should render Store Feeds page and create/delete scheduled & active moments', async ({ page }) => {
    // 1. Verify page identity
    await expect(page.locator('text="Store Feed & Moments"')).toBeVisible({ timeout: 15000 });
    console.log('✅ Page loaded successfully.');

    // 2. Open "Add Moment" Modal
    const addMomentBtn = page.locator('button:has-text("Add Moment"), button:has-text("Create Your First Moment")').first();
    await addMomentBtn.click();
    await expect(page.locator('text="Post New Moment / Vibe"')).toBeVisible();

    // 3. Fill headline and description
    const uniqueId = Date.now();
    const activeTitle = `Active Promo ${uniqueId}`;
    await page.fill('input[placeholder="e.g. Special Weekend Offer!"]', activeTitle);
    await page.fill('textarea[placeholder="Details of the announcement or campaign..."]', 'Instant active moment E2E test description.');

    // Submit as immediately active (no start/expire dates filled)
    await page.click('button:has-text("Post Moment")');

    // Verify snackbar/toast or modal closes, and the new feed item appears in the list
    await expect(page.locator(`text="${activeTitle}"`)).toBeVisible({ timeout: 10000 });
    
    // Find the row containing this new moment and verify the status badge is ACTIVE
    const activeRow = page.locator(`tr:has-text("${activeTitle}")`);
    await expect(activeRow.locator('text="ACTIVE"')).toBeVisible();
    console.log('✅ Immediately active moment created and verified.');

    // 4. Create a Scheduled Moment
    await page.click('button:has-text("Add Moment")');
    await expect(page.locator('text="Post New Moment / Vibe"')).toBeVisible();

    const scheduledTitle = `Scheduled Promo ${uniqueId}`;
    await page.fill('input[placeholder="e.g. Special Weekend Offer!"]', scheduledTitle);
    await page.fill('textarea[placeholder="Details of the announcement or campaign..."]', 'Scheduled moment E2E test description.');

    // Fill StartsAt to +1 day (using local ISO format yyyy-MM-ddThh:mm)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startsAtStr = tomorrow.toISOString().slice(0, 16); // e.g., '2026-06-17T12:00'
    
    const expiresAtDate = new Date();
    expiresAtDate.setDate(expiresAtDate.getDate() + 2);
    const expiresAtStr = expiresAtDate.toISOString().slice(0, 16);

    // Locate the datetime-local input fields
    const startInput = page.locator('input[type="datetime-local"]').first();
    const expireInput = page.locator('input[type="datetime-local"]').last();

    await startInput.fill(startsAtStr);
    await expireInput.fill(expiresAtStr);

    await page.click('button:has-text("Post Moment")');

    // Verify the scheduled feed item appears in the list
    await expect(page.locator(`text="${scheduledTitle}"`)).toBeVisible({ timeout: 10000 });

    // Find the row containing the scheduled moment and verify the status badge is SCHEDULED
    const scheduledRow = page.locator(`tr:has-text("${scheduledTitle}")`);
    await expect(scheduledRow.locator('text="SCHEDULED"')).toBeVisible();
    console.log('✅ Scheduled moment created and verified.');

    // 5. Clean up created test items
    console.log('🗑️ Cleaning up test items...');
    
    // Delete Active Promo
    const activeDeleteBtn = activeRow.locator('button[aria-label="Delete Moment"], button:has(.fa-trash), button:has(svg)');
    await activeDeleteBtn.click();
    await expect(page.locator('text="Delete Feed Post"')).toBeVisible();
    await page.click('button:has-text("Confirm"), button:has-text("Delete")');
    await expect(page.locator(`text="${activeTitle}"`)).not.toBeVisible({ timeout: 10000 });

    // Delete Scheduled Promo
    const scheduledDeleteBtn = scheduledRow.locator('button[aria-label="Delete Moment"], button:has(.fa-trash), button:has(svg)');
    await scheduledDeleteBtn.click();
    await expect(page.locator('text="Delete Feed Post"')).toBeVisible();
    await page.click('button:has-text("Confirm"), button:has-text("Delete")');
    await expect(page.locator(`text="${scheduledTitle}"`)).not.toBeVisible({ timeout: 10000 });

    console.log('✅ Clean up completed successfully.');
  });
});
