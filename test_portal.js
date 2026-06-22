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

  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()}: ${request.failure()?.errorText}`);
  });

  console.log("Navigating to http://localhost:5173/ ...");
  try {
    await page.goto('http://localhost:5173/', { timeout: 10000, waitUntil: 'load' });
    console.log("Loaded page. Waiting 3 seconds for async errors...");
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log(`Page Title: "${title}"`);

    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log("Page Body HTML length:", bodyHtml.length);
    console.log("Page Body HTML snippet:", bodyHtml.substring(0, 1000));
  } catch (err) {
    console.error("Navigation/Test error:", err);
  } finally {
    await browser.close();
  }
}

run();
