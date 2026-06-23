import { test, expect } from '@playwright/test';

/**
 * TUBULU ADMIN PORTAL - AUDIT COMPLIANCE SPECIFICATION
 * 
 * Verifies all key features deployed, patched, and seeded are performing
 * correctly in an active rendered browser context.
 */
test.describe('Tubulu Admin Portal Visual Integration Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Automatically routes to dashboard, uses cached Auth State!
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard Component Audit — Metrics & Graphics', async ({ page }) => {
    // Confirm header greeting for Master Admin view
    await expect(page.locator('text="Welcome back"')).toBeVisible({ timeout: 15000 });
    
    // Verify the major Metric Cards exist on Master Admin grid
    await expect(page.locator('text="Total Platform Users"')).toBeVisible();
    await expect(page.locator('text="Total Conversations"')).toBeVisible();
    
    // Ensure analytics vector graphics (canvas) initialized fully
    const graphCanvas = page.locator('canvas').first();
    await expect(graphCanvas).toBeVisible({ timeout: 15000 });
  });

  test('Financial Audit — Dynamic Settlement Records Present', async ({ page }) => {
    // 1. Head directly to protected settlements route
    await page.goto('/dashboard/settlements');
    
    // 2. Wait for clear page identity marker confirmed via visual inspection
    await expect(page.locator('text="Payout Settlements"')).toBeVisible({ timeout: 15000 });
    
    // 3. Verify presence of transaction status markers from live db records
    await expect(page.locator('text="Success"').first()).toBeVisible({ timeout: 15000 });
    console.log(`✅ SUCCESS: Confirmed settlement activity renders live on browser page.`);
  });

  test('Super Admin Audit — Master AI Playbook Sync', async ({ page }) => {
    // Navigate directly to Playbooks suite
    await page.goto('/dashboard/ai-playbooks');
    
    // Wait for the authoritative page header seen in debug
    await expect(page.locator('text="Business Verticals"')).toBeVisible({ timeout: 15000 });

    // Assert the platform recognized seeded base categories
    await expect(page.locator('text="Food & Beverage"')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text="Retail & E-commerce"')).toBeVisible();
    
    console.log("Confirmed all AI categories actively rendered on Super Admin view!");
  });
});
