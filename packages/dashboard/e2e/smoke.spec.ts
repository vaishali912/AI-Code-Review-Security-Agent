import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002';

test.describe('Sherlock Route Smoke Tests', () => {
  test('Landing Page (/) renders headline, trace line, and nav', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveTitle(/Sherlock/);
    await expect(page.locator('h1')).toContainText('Every pull request, security-reviewed');
    await expect(page.locator('text=All systems operational')).toBeVisible();
  });

  test('Findings Inbox (/app/findings) renders summary strip and list', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/findings`);
    await expect(page.locator('text=Blocking:')).toBeVisible();
    await expect(page.locator('text=Open:')).toBeVisible();
    await expect(page.locator('text=Proven:')).toBeVisible();
    await expect(page.locator('text=SQL injection via unparameterized query')).toBeVisible();
  });

  test('Finding Detail (/app/findings/:id) renders tabs and proof runner', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/findings/fnd_sqli_users_01`);
    await expect(page.locator('h2')).toContainText('SQL injection via unparameterized query');
    await expect(page.locator('button:has-text("Apply Fix")')).toBeVisible();
    await expect(page.locator('button:has-text("Run Proof")')).toBeVisible();
  });

  test('Pull Requests View (/app/pulls) renders PR header and topology', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/pulls`);
    await expect(page.locator('text=PR #42: Feature/User-Management-API')).toBeVisible();
    await expect(page.locator('text=RISK LEVEL: CRITICAL')).toBeVisible();
  });

  test('Live Scanner View (/app/scan) renders editor and terminal', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/scan`);
    await expect(page.locator('text=Live Scanner & Taint Reachability Engine')).toBeVisible();
    await expect(page.locator('button:has-text("Run Scan")')).toBeVisible();
  });

  test('Insights View (/app/insights) renders 4 KPIs and charts', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/insights`);
    await expect(page.locator('text=Mean Time to Remediate (MTTR)')).toBeVisible();
    await expect(page.locator('text=True Positive Precision')).toBeVisible();
  });

  test('Settings View (/app/settings) renders policy YAML editor', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/settings`);
    await expect(page.locator('text=Policy Configuration (.secreview.yml)')).toBeVisible();
    await expect(page.locator('text=Active Learned Suppressions')).toBeVisible();
  });
});
