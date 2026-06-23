const { chromium } = require('@playwright/test');

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER PAGEERROR]`, err);
  });

  page.on('request', request => {
    if (request.url().includes('/api/v1/')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/v1/')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log("1. Navigating to login page...");
    await page.goto('http://localhost:5173/', { timeout: 15000, waitUntil: 'networkidle' });

    console.log("2. Filling phone number...");
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
    await phoneInput.fill('9999999999');

    console.log("3. Submitting phone number...");
    await page.click('button:has-text("Continue")');

    console.log("4. Determining next screen (PIN or OTP)...");
    await page.waitForTimeout(2000);

    const pinVisible = await page.getByPlaceholder('Enter your PIN').isVisible();
    if (pinVisible) {
      console.log("Found PIN input. Clicking 'Forgot PIN? Use OTP instead'...");
      await page.click('text="Forgot PIN? Use OTP instead"');
    }

    console.log("5. Waiting for OTP field...");
    const otpInput = page.getByPlaceholder('Enter 6-digit OTP');
    await otpInput.waitFor({ state: 'visible', timeout: 10000 });

    console.log("6. Entering OTP...");
    await otpInput.fill('000000');

    console.log("7. Submitting OTP...");
    await page.click('button:has-text("Verify OTP")');

    // Wait and check if we are on the Set PIN screen
    console.log("8. Checking if 'Create Your PIN' is visible...");
    await page.waitForTimeout(2000);
    const setPinVisible = await page.getByPlaceholder('Choose a 4-digit PIN').isVisible();
    if (setPinVisible) {
      console.log("Found PIN setup screen. Setting PIN to 0000...");
      await page.getByPlaceholder('Choose a 4-digit PIN').fill('0000');
      await page.getByPlaceholder('Re-enter your PIN').fill('0000');
      console.log("Submitting PIN setup...");
      await page.click('button:has-text("Set PIN & Login")');
    }

    console.log("9. Waiting for dashboard navigation...");
    try {
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      console.log(`Successfully navigated! Current URL: ${page.url()}`);
    } catch (navErr) {
      console.error("Navigation wait failed:", navErr.message);
    }

    // Diagnostic information
    console.log("--- DIAGNOSTIC INFO ---");
    console.log(`Final URL: ${page.url()}`);
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log("Body HTML length:", bodyHtml.length);
    console.log("Body HTML content snippet:");
    console.log(bodyHtml.substring(0, 2000));
    console.log("-----------------------");

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
}

run();
