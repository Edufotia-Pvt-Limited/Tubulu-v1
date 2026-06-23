import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate via OTP or PIN as Master Admin User', async ({ page }) => {
  console.log("🔐 Starting Tubulu Multi-Step Auth Sequence...");
  
  // 1. Load Login Page
  await page.goto('/auth/jwt/login');
  await page.waitForLoadState('networkidle');

  // 2. Fill Phone Number (Super Admin Master Number)
  await page.fill('input[name="phoneNumber"]', '9999999999');
  
  // 3. Click "Send OTP / Continue"
  console.log("📩 Submitting Phone number...");
  await page.click('button[type="submit"]');

  // 4. Determine if we are at OTP or PIN step
  const otpField = page.locator('input[name="otp"]');
  const pinField = page.locator('input[name="pin"]');
  
  // Wait up to 10 seconds for either the OTP input or the PIN input to show up
  await Promise.race([
    otpField.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
    pinField.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
  ]);

  if (await pinField.isVisible()) {
    console.log("🔑 Direct PIN input field rendered!");
    await pinField.fill('2123');
    console.log("🔑 Submitting PIN...");
    await page.click('button[type="submit"]');
  } else if (await otpField.isVisible()) {
    console.log("✅ OTP input field rendered!");
    await otpField.fill('000000');
    console.log("🔑 Verifying OTP...");
    await page.click('button[type="submit"]');
    
    // Check if we need to set PIN
    const confirmPinField = page.locator('input[name="confirmPin"]');
    try {
      await confirmPinField.waitFor({ state: 'visible', timeout: 5000 });
      console.log("📝 PIN Setup field rendered! Setting PIN to 2123...");
      await page.fill('input[name="pin"]', '2123');
      await confirmPinField.fill('2123');
      await page.click('button[type="submit"]');
    } catch (e) {
      console.log("No PIN setup required, proceeding to dashboard...");
    }
  } else {
    throw new Error("Neither OTP nor PIN field became visible after submitting phone number.");
  }

  // 7. Wait for primary content rendering which guarantees successful login routing
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log("🎉 Verified visual elements rendered!");
  
  console.log("🎉 Login Success! Landing page confirmed.");

  // Final delay and save to persist current window state
  await page.waitForTimeout(1000);
  await page.context().storageState({ path: authFile });
  console.log(`💾 Auth credentials saved to cache store.`);
});
