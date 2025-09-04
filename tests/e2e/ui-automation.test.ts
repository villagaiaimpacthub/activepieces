/**
 * UI Automation End-to-End Tests
 * Tests the user interface automation for SOP Tool
 * REALITY: Based on ActivePieces customization, not standalone React app
 */

import { test, expect, Page } from '@playwright/test';
import { chromium, Browser, BrowserContext } from 'playwright';

interface SOPUIContext {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  baseURL: string;
  authToken?: string;
}

class SOPUIHelper {
  private ctx: SOPUIContext;

  constructor(ctx: SOPUIContext) {
    this.ctx = ctx;
  }

  async navigateToSOPDashboard() {
    await this.ctx.page.goto(`${this.ctx.baseURL}/sop-dashboard`);
    await this.ctx.page.waitForSelector('[data-testid="sop-dashboard"]', { timeout: 10000 });
  }

  async createNewSOP(name: string, description?: string) {
    await this.ctx.page.click('[data-testid="create-sop-button"]');
    await this.ctx.page.waitForSelector('[data-testid="sop-creation-form"]');
    
    await this.ctx.page.fill('[data-testid="sop-name-input"]', name);
    if (description) {
      await this.ctx.page.fill('[data-testid="sop-description-input"]', description);
    }
    
    await this.ctx.page.click('[data-testid="submit-sop-button"]');
    await this.ctx.page.waitForSelector('[data-testid="sop-created-confirmation"]');
  }

  async addStepToSOP(stepName: string, stepType: string) {
    await this.ctx.page.click('[data-testid="add-step-button"]');
    await this.ctx.page.waitForSelector('[data-testid="step-creation-modal"]');
    
    await this.ctx.page.fill('[data-testid="step-name-input"]', stepName);
    await this.ctx.page.selectOption('[data-testid="step-type-select"]', stepType);
    
    await this.ctx.page.click('[data-testid="add-step-submit"]');
    await this.ctx.page.waitForSelector(`[data-testid="step-${stepName}"]`);
  }

  async exportSOP(format: 'json' | 'markdown' | 'csv') {
    await this.ctx.page.click('[data-testid="export-sop-button"]');
    await this.ctx.page.waitForSelector('[data-testid="export-options-modal"]');
    
    await this.ctx.page.click(`[data-testid="export-${format}-option"]`);
    await this.ctx.page.click('[data-testid="confirm-export-button"]');
    
    // Wait for download to initiate
    const downloadPromise = this.ctx.page.waitForEvent('download');
    const download = await downloadPromise;
    return download;
  }

  async waitForSOPLoad(sopName: string) {
    await this.ctx.page.waitForSelector(`[data-testid="sop-title"][text="${sopName}"]`, { timeout: 15000 });
  }

  async validateSOPTerminology() {
    // Ensure SOP-specific terminology is used, not "flows" or "pieces"
    const prohibitedTerms = ['flow', 'piece', 'trigger', 'action'];
    const allowedTerms = ['sop', 'step', 'process', 'procedure'];
    
    const pageContent = await this.ctx.page.textContent('body');
    
    for (const term of prohibitedTerms) {
      if (pageContent?.toLowerCase().includes(term)) {
        throw new Error(`Prohibited ActivePieces terminology found: "${term}"`);
      }
    }
    
    return true;
  }
}

describe('SOP Tool UI Automation Tests', () => {
  let uiContext: SOPUIContext;
  let sopHelper: SOPUIHelper;

  beforeAll(async () => {
    const browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.CI ? 0 : 50
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    
    const page = await context.newPage();
    
    uiContext = {
      browser,
      context,
      page,
      baseURL: process.env.SOP_UI_URL || 'http://localhost:8080'
    };
    
    sopHelper = new SOPUIHelper(uiContext);

    // Authenticate if required
    if (process.env.SOP_TEST_USER && process.env.SOP_TEST_PASSWORD) {
      await page.goto(`${uiContext.baseURL}/login`);
      await page.fill('[data-testid="email-input"]', process.env.SOP_TEST_USER);
      await page.fill('[data-testid="password-input"]', process.env.SOP_TEST_PASSWORD);
      await page.click('[data-testid="login-button"]');
      await page.waitForSelector('[data-testid="dashboard-welcome"]');
    }
  });

  afterAll(async () => {
    if (uiContext.browser) {
      await uiContext.browser.close();
    }
  });

  beforeEach(async () => {
    // Reset to dashboard before each test
    await sopHelper.navigateToSOPDashboard();
  });

  describe('SOP Dashboard Navigation', () => {
    test('should display SOP dashboard with correct branding', async () => {
      await sopHelper.navigateToSOPDashboard();
      
      // Check for SOP-specific branding
      const pageTitle = await uiContext.page.title();
      expect(pageTitle).toContain('SOP');
      expect(pageTitle).not.toContain('ActivePieces');

      // Validate SOP terminology
      await sopHelper.validateSOPTerminology();

      // Check main dashboard elements
      await expect(uiContext.page.locator('[data-testid="sop-dashboard"]')).toBeVisible();
      await expect(uiContext.page.locator('[data-testid="create-sop-button"]')).toBeVisible();
      await expect(uiContext.page.locator('[data-testid="sop-list"]')).toBeVisible();
    });

    test('should navigate between SOP sections correctly', async () => {
      const sections = [
        { testId: 'dashboard-nav', url: '/sop-dashboard', title: 'Dashboard' },
        { testId: 'templates-nav', url: '/sop-templates', title: 'Templates' },
        { testId: 'export-center-nav', url: '/sop-exports', title: 'Export Center' },
        { testId: 'analytics-nav', url: '/sop-analytics', title: 'Analytics' }
      ];

      for (const section of sections) {
        await uiContext.page.click(`[data-testid="${section.testId}"]`);
        await uiContext.page.waitForURL(`*${section.url}`);
        
        const heading = await uiContext.page.locator('h1').first().textContent();
        expect(heading).toContain(section.title);
        
        // Validate no ActivePieces terminology in section
        await sopHelper.validateSOPTerminology();
      }
    });

    test('should display responsive layout on mobile viewport', async () => {
      // Switch to mobile viewport
      await uiContext.context.newPage();
      await uiContext.page.setViewportSize({ width: 375, height: 667 });
      
      await sopHelper.navigateToSOPDashboard();
      
      // Check mobile navigation
      const mobileMenu = uiContext.page.locator('[data-testid="mobile-menu-toggle"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await expect(uiContext.page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
      }

      // Verify main content is accessible
      await expect(uiContext.page.locator('[data-testid="sop-dashboard"]')).toBeVisible();
      
      // Check that create button is accessible
      const createButton = uiContext.page.locator('[data-testid="create-sop-button"]');
      await expect(createButton).toBeVisible();
      
      // Restore desktop viewport
      await uiContext.page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  describe('SOP Creation Workflow', () => {
    test('should create new SOP with basic information', async () => {
      const sopName = `Test SOP ${Date.now()}`;
      const sopDescription = 'Test SOP created via UI automation';

      await sopHelper.createNewSOP(sopName, sopDescription);

      // Verify SOP was created
      await sopHelper.waitForSOPLoad(sopName);
      
      // Check SOP details display
      const nameElement = await uiContext.page.locator('[data-testid="sop-title"]').textContent();
      expect(nameElement).toBe(sopName);

      const descElement = await uiContext.page.locator('[data-testid="sop-description"]').textContent();
      expect(descElement).toBe(sopDescription);

      // Verify it appears in dashboard list
      await sopHelper.navigateToSOPDashboard();
      await expect(uiContext.page.locator(`[data-testid="sop-item-${sopName}"]`)).toBeVisible();
    });

    test('should create SOP with multiple steps in sequence', async () => {
      const sopName = `Multi-Step SOP ${Date.now()}`;
      await sopHelper.createNewSOP(sopName);

      const steps = [
        { name: 'Initial Setup', type: 'process_step' },
        { name: 'Data Collection', type: 'data_collection' },
        { name: 'Review Process', type: 'review_step' },
        { name: 'Final Approval', type: 'approval_step' }
      ];

      // Add steps sequentially
      for (const step of steps) {
        await sopHelper.addStepToSOP(step.name, step.type);
        
        // Verify step was added
        await expect(uiContext.page.locator(`[data-testid="step-${step.name}"]`)).toBeVisible();
      }

      // Verify all steps are listed in correct order
      const stepElements = await uiContext.page.locator('[data-testid^="step-"]').all();
      expect(stepElements).toHaveLength(4);

      // Check step sequence
      for (let i = 0; i < steps.length; i++) {
        const stepText = await stepElements[i].textContent();
        expect(stepText).toContain(steps[i].name);
      }
    });

    test('should validate SOP creation form inputs', async () => {
      await uiContext.page.click('[data-testid="create-sop-button"]');
      await uiContext.page.waitForSelector('[data-testid="sop-creation-form"]');

      // Try to submit empty form
      await uiContext.page.click('[data-testid="submit-sop-button"]');
      
      // Should show validation error
      await expect(uiContext.page.locator('[data-testid="name-error"]')).toBeVisible();

      // Enter invalid name (too short)
      await uiContext.page.fill('[data-testid="sop-name-input"]', 'A');
      await uiContext.page.click('[data-testid="submit-sop-button"]');
      
      // Should show length validation
      const errorText = await uiContext.page.locator('[data-testid="name-error"]').textContent();
      expect(errorText).toContain('minimum');

      // Enter valid name
      await uiContext.page.fill('[data-testid="sop-name-input"]', 'Valid SOP Name');
      
      // Error should disappear and form should submit
      await uiContext.page.click('[data-testid="submit-sop-button"]');
      await uiContext.page.waitForSelector('[data-testid="sop-created-confirmation"]');
    });

    test('should support drag-and-drop step reordering', async () => {
      const sopName = `Reorder Test SOP ${Date.now()}`;
      await sopHelper.createNewSOP(sopName);

      // Add multiple steps
      await sopHelper.addStepToSOP('Step A', 'process_step');
      await sopHelper.addStepToSOP('Step B', 'process_step');
      await sopHelper.addStepToSOP('Step C', 'process_step');

      // Get initial step order
      let stepOrder = await uiContext.page.locator('[data-testid^="step-"]').allTextContents();
      expect(stepOrder[0]).toContain('Step A');
      expect(stepOrder[1]).toContain('Step B');
      expect(stepOrder[2]).toContain('Step C');

      // Perform drag and drop (Step C to position 1)
      const stepC = uiContext.page.locator('[data-testid="step-Step C"]');
      const stepA = uiContext.page.locator('[data-testid="step-Step A"]');
      
      await stepC.dragTo(stepA, { targetPosition: { x: 0, y: 0 } });
      
      // Wait for reorder animation/update
      await uiContext.page.waitForTimeout(1000);

      // Verify new order
      stepOrder = await uiContext.page.locator('[data-testid^="step-"]').allTextContents();
      expect(stepOrder[0]).toContain('Step C');
      expect(stepOrder[1]).toContain('Step A');
      expect(stepOrder[2]).toContain('Step B');

      // Save and verify persistence
      await uiContext.page.click('[data-testid="save-sop-button"]');
      await uiContext.page.waitForSelector('[data-testid="save-confirmation"]');

      // Refresh page and check order persists
      await uiContext.page.reload();
      await sopHelper.waitForSOPLoad(sopName);
      
      const persistedOrder = await uiContext.page.locator('[data-testid^="step-"]').allTextContents();
      expect(persistedOrder[0]).toContain('Step C');
    });
  });

  describe('Template System UI', () => {
    test('should browse and filter SOP templates', async () => {
      await uiContext.page.click('[data-testid="templates-nav"]');
      await uiContext.page.waitForSelector('[data-testid="template-library"]');

      // Check template categories
      const categories = ['Quality Control', 'Approval Process', 'Onboarding', 'Security'];
      
      for (const category of categories) {
        await uiContext.page.click(`[data-testid="filter-${category.toLowerCase().replace(' ', '-')}"]`);
        
        // Wait for filter to apply
        await uiContext.page.waitForTimeout(500);
        
        const templateCards = await uiContext.page.locator('[data-testid^="template-card-"]').all();
        
        // Verify filtered templates contain category
        for (const card of templateCards) {
          const cardText = await card.textContent();
          expect(cardText?.toLowerCase()).toContain(category.toLowerCase().split(' ')[0]);
        }
      }

      // Clear filters
      await uiContext.page.click('[data-testid="clear-filters"]');
      
      // Should show all templates
      const allTemplates = await uiContext.page.locator('[data-testid^="template-card-"]').all();
      expect(allTemplates.length).toBeGreaterThan(0);
    });

    test('should create SOP from template with customization', async () => {
      await uiContext.page.click('[data-testid="templates-nav"]');
      await uiContext.page.waitForSelector('[data-testid="template-library"]');

      // Select a template
      await uiContext.page.click('[data-testid="template-card-approval-process"]');
      await uiContext.page.waitForSelector('[data-testid="template-preview"]');

      // Preview should show template details
      await expect(uiContext.page.locator('[data-testid="template-name"]')).toBeVisible();
      await expect(uiContext.page.locator('[data-testid="template-description"]')).toBeVisible();
      await expect(uiContext.page.locator('[data-testid="template-steps-preview"]')).toBeVisible();

      // Use template
      await uiContext.page.click('[data-testid="use-template-button"]');
      await uiContext.page.waitForSelector('[data-testid="template-customization-form"]');

      // Customize template
      const customSopName = `Custom Approval Process ${Date.now()}`;
      await uiContext.page.fill('[data-testid="custom-sop-name"]', customSopName);
      
      // Set customization parameters
      await uiContext.page.selectOption('[data-testid="department-select"]', 'Engineering');
      await uiContext.page.selectOption('[data-testid="approval-level-select"]', 'Manager');
      
      // Create customized SOP
      await uiContext.page.click('[data-testid="create-from-template-button"]');
      await uiContext.page.waitForSelector('[data-testid="sop-created-confirmation"]');

      // Verify customized SOP was created
      await sopHelper.waitForSOPLoad(customSopName);
      
      // Check that template-specific steps were added
      const steps = await uiContext.page.locator('[data-testid^="step-"]').all();
      expect(steps.length).toBeGreaterThan(0);

      // Verify customization was applied (steps should contain "Engineering" context)
      const firstStepText = await steps[0].textContent();
      expect(firstStepText).toContain('Engineering');
    });

    test('should save custom SOP as new template', async () => {
      // Create a custom SOP first
      const sopName = `Template Source SOP ${Date.now()}`;
      await sopHelper.createNewSOP(sopName);
      
      await sopHelper.addStepToSOP('Custom Step 1', 'process_step');
      await sopHelper.addStepToSOP('Custom Step 2', 'review_step');

      // Save as template
      await uiContext.page.click('[data-testid="save-as-template-button"]');
      await uiContext.page.waitForSelector('[data-testid="template-creation-modal"]');

      const templateName = `Custom Template ${Date.now()}`;
      await uiContext.page.fill('[data-testid="template-name-input"]', templateName);
      await uiContext.page.fill('[data-testid="template-description-input"]', 'Custom template created from SOP');
      await uiContext.page.selectOption('[data-testid="template-category-select"]', 'Custom');
      
      await uiContext.page.click('[data-testid="save-template-button"]');
      await uiContext.page.waitForSelector('[data-testid="template-saved-confirmation"]');

      // Verify template was saved
      await uiContext.page.click('[data-testid="templates-nav"]');
      await uiContext.page.waitForSelector('[data-testid="template-library"]');
      
      // Filter to show custom templates
      await uiContext.page.click('[data-testid="filter-custom"]');
      
      // Should find the newly created template
      await expect(uiContext.page.locator(`[data-testid="template-card-${templateName.toLowerCase().replace(' ', '-')}"]`)).toBeVisible();
    });
  });

  describe('Export Functionality UI', () => {
    test('should export SOP in multiple formats', async () => {
      // Create test SOP
      const sopName = `Export Test SOP ${Date.now()}`;
      await sopHelper.createNewSOP(sopName);
      await sopHelper.addStepToSOP('Test Step', 'process_step');

      const formats: Array<'json' | 'markdown' | 'csv'> = ['json', 'markdown', 'csv'];
      
      for (const format of formats) {
        const download = await sopHelper.exportSOP(format);
        
        expect(download.suggestedFilename()).toContain(format);
        
        // Verify download started
        const downloadPath = await download.path();
        expect(downloadPath).toBeTruthy();
      }
    });

    test('should show export progress and completion', async () => {
      const sopName = `Export Progress SOP ${Date.now()}`;
      await sopHelper.createNewSOP(sopName);
      
      // Add multiple steps to make export take longer
      for (let i = 1; i <= 5; i++) {
        await sopHelper.addStepToSOP(`Step ${i}`, 'process_step');
      }

      await uiContext.page.click('[data-testid="export-sop-button"]');
      await uiContext.page.waitForSelector('[data-testid="export-options-modal"]');
      
      await uiContext.page.click('[data-testid="export-json-option"]');
      await uiContext.page.click('[data-testid="confirm-export-button"]');

      // Should show progress indicator
      await expect(uiContext.page.locator('[data-testid="export-progress"]')).toBeVisible();
      
      // Wait for export completion
      await uiContext.page.waitForSelector('[data-testid="export-complete"]', { timeout: 10000 });
      
      // Success message should be shown
      const successMessage = await uiContext.page.locator('[data-testid="export-success-message"]').textContent();
      expect(successMessage).toContain('exported successfully');
    });

    test('should provide export history and management', async () => {
      await uiContext.page.click('[data-testid="export-center-nav"]');
      await uiContext.page.waitForSelector('[data-testid="export-history"]');

      // Should show export history table
      await expect(uiContext.page.locator('[data-testid="export-history-table"]')).toBeVisible();
      
      // Check table headers
      const headers = ['SOP Name', 'Format', 'Exported Date', 'Status', 'Actions'];
      for (const header of headers) {
        await expect(uiContext.page.locator(`[data-testid="header-${header.toLowerCase().replace(' ', '-')}"]`)).toBeVisible();
      }

      // Should allow filtering by format
      await uiContext.page.selectOption('[data-testid="format-filter"]', 'json');
      
      // Wait for filter to apply
      await uiContext.page.waitForTimeout(500);
      
      const filteredRows = await uiContext.page.locator('[data-testid^="export-row-"]').all();
      for (const row of filteredRows) {
        const rowText = await row.textContent();
        expect(rowText).toContain('JSON');
      }

      // Should allow re-downloading previous exports
      if (filteredRows.length > 0) {
        const downloadButton = filteredRows[0].locator('[data-testid="redownload-button"]');
        if (await downloadButton.isVisible()) {
          const downloadPromise = uiContext.page.waitForEvent('download');
          await downloadButton.click();
          const download = await downloadPromise;
          expect(download).toBeTruthy();
        }
      }
    });
  });

  describe('Analytics Dashboard UI', () => {
    test('should display SOP performance metrics', async () => {
      await uiContext.page.click('[data-testid="analytics-nav"]');
      await uiContext.page.waitForSelector('[data-testid="analytics-dashboard"]');

      // Check key metric cards
      const metricCards = [
        'total-sops',
        'active-sops',
        'completion-rate',
        'avg-execution-time'
      ];

      for (const metric of metricCards) {
        await expect(uiContext.page.locator(`[data-testid="metric-${metric}"]`)).toBeVisible();
        
        // Should show numeric value
        const value = await uiContext.page.locator(`[data-testid="metric-${metric}-value"]`).textContent();
        expect(value).toMatch(/\d+/);
      }

      // Check charts
      await expect(uiContext.page.locator('[data-testid="sop-creation-chart"]')).toBeVisible();
      await expect(uiContext.page.locator('[data-testid="execution-time-chart"]')).toBeVisible();
      await expect(uiContext.page.locator('[data-testid="completion-rate-chart"]')).toBeVisible();
    });

    test('should filter analytics by date range', async () => {
      await uiContext.page.click('[data-testid="analytics-nav"]');
      await uiContext.page.waitForSelector('[data-testid="analytics-dashboard"]');

      // Open date range picker
      await uiContext.page.click('[data-testid="date-range-picker"]');
      await uiContext.page.waitForSelector('[data-testid="date-picker-modal"]');

      // Select last 30 days
      await uiContext.page.click('[data-testid="last-30-days"]');
      await uiContext.page.click('[data-testid="apply-date-range"]');

      // Wait for data to refresh
      await uiContext.page.waitForSelector('[data-testid="data-refreshed"]');

      // Verify date range is applied
      const dateRangeLabel = await uiContext.page.locator('[data-testid="current-date-range"]').textContent();
      expect(dateRangeLabel).toContain('Last 30 days');

      // Metrics should update
      const updatedMetric = await uiContext.page.locator('[data-testid="metric-total-sops-value"]').textContent();
      expect(updatedMetric).toBeTruthy();
    });

    test('should export analytics data', async () => {
      await uiContext.page.click('[data-testid="analytics-nav"]');
      await uiContext.page.waitForSelector('[data-testid="analytics-dashboard"]');

      await uiContext.page.click('[data-testid="export-analytics-button"]');
      await uiContext.page.waitForSelector('[data-testid="analytics-export-options"]');

      // Export as CSV
      const downloadPromise = uiContext.page.waitForEvent('download');
      await uiContext.page.click('[data-testid="export-analytics-csv"]');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.csv');
      expect(download.suggestedFilename()).toContain('analytics');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await uiContext.context.setOffline(true);

      try {
        await sopHelper.createNewSOP('Network Test SOP');
      } catch (error) {
        // Should show error message
        await expect(uiContext.page.locator('[data-testid="network-error-message"]')).toBeVisible();
        
        const errorText = await uiContext.page.locator('[data-testid="error-message-text"]').textContent();
        expect(errorText).toContain('network');
      }

      // Restore network
      await uiContext.context.setOffline(false);
      
      // Should show connection restored message
      await expect(uiContext.page.locator('[data-testid="connection-restored"]')).toBeVisible();
    });

    test('should validate user permissions and show appropriate UI', async () => {
      // Test read-only user scenario
      if (process.env.READONLY_TEST_USER) {
        // Login as read-only user
        await uiContext.page.goto(`${uiContext.baseURL}/login`);
        await uiContext.page.fill('[data-testid="email-input"]', process.env.READONLY_TEST_USER);
        await uiContext.page.fill('[data-testid="password-input"]', process.env.READONLY_TEST_PASSWORD);
        await uiContext.page.click('[data-testid="login-button"]');
        
        await sopHelper.navigateToSOPDashboard();

        // Create button should be disabled or hidden
        const createButton = uiContext.page.locator('[data-testid="create-sop-button"]');
        
        if (await createButton.isVisible()) {
          await expect(createButton).toBeDisabled();
        } else {
          await expect(createButton).not.toBeVisible();
        }

        // Should show read-only indicator
        await expect(uiContext.page.locator('[data-testid="readonly-indicator"]')).toBeVisible();
      }
    });

    test('should handle unsaved changes warning', async () => {
      const sopName = `Unsaved Changes Test ${Date.now()}`;
      await sopHelper.createNewSOP(sopName);
      
      // Make changes without saving
      await sopHelper.addStepToSOP('Unsaved Step', 'process_step');
      
      // Try to navigate away
      await uiContext.page.click('[data-testid="dashboard-nav"]');
      
      // Should show unsaved changes warning
      await expect(uiContext.page.locator('[data-testid="unsaved-changes-modal"]')).toBeVisible();
      
      const warningText = await uiContext.page.locator('[data-testid="unsaved-warning-text"]').textContent();
      expect(warningText).toContain('unsaved changes');

      // Cancel navigation
      await uiContext.page.click('[data-testid="cancel-navigation"]');
      
      // Should stay on current page
      await expect(uiContext.page.locator(`[data-testid="sop-title"][text="${sopName}"]`)).toBeVisible();

      // Save changes
      await uiContext.page.click('[data-testid="save-sop-button"]');
      await uiContext.page.waitForSelector('[data-testid="save-confirmation"]');
      
      // Now navigation should work without warning
      await uiContext.page.click('[data-testid="dashboard-nav"]');
      await expect(uiContext.page.locator('[data-testid="sop-dashboard"]')).toBeVisible();
    });
  });

  describe('Performance and Accessibility', () => {
    test('should meet basic accessibility standards', async () => {
      await sopHelper.navigateToSOPDashboard();
      
      // Check for basic accessibility attributes
      const mainContent = uiContext.page.locator('[data-testid="main-content"]');
      await expect(mainContent).toHaveAttribute('role', 'main');
      
      // Check for skip links
      await expect(uiContext.page.locator('[data-testid="skip-to-main"]')).toBeVisible();
      
      // Check form labels
      await uiContext.page.click('[data-testid="create-sop-button"]');
      await uiContext.page.waitForSelector('[data-testid="sop-creation-form"]');
      
      const nameInput = uiContext.page.locator('[data-testid="sop-name-input"]');
      await expect(nameInput).toHaveAttribute('aria-label');
      
      // Check for proper heading hierarchy
      const headings = await uiContext.page.locator('h1, h2, h3').all();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should load dashboard within performance budget', async () => {
      const startTime = Date.now();
      
      await sopHelper.navigateToSOPDashboard();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check for performance indicators
      const sopList = uiContext.page.locator('[data-testid="sop-list"]');
      await expect(sopList).toBeVisible();
      
      // Lazy loading should work for large lists
      if (await uiContext.page.locator('[data-testid="load-more-sops"]').isVisible()) {
        await uiContext.page.click('[data-testid="load-more-sops"]');
        await uiContext.page.waitForSelector('[data-testid="loading-more-sops"]');
        await uiContext.page.waitForSelector('[data-testid="more-sops-loaded"]');
      }
    });

    test('should handle keyboard navigation', async () => {
      await sopHelper.navigateToSOPDashboard();
      
      // Focus on create button using keyboard
      await uiContext.page.keyboard.press('Tab');
      
      const focusedElement = await uiContext.page.locator(':focus').getAttribute('data-testid');
      expect(['create-sop-button', 'skip-to-main']).toContain(focusedElement);
      
      // Navigate through SOPs using arrow keys
      await uiContext.page.keyboard.press('Enter'); // Open create modal
      await uiContext.page.waitForSelector('[data-testid="sop-creation-form"]');
      
      // Use Tab to navigate form fields
      await uiContext.page.keyboard.press('Tab');
      const nameInputFocused = await uiContext.page.locator('[data-testid="sop-name-input"]').evaluate(el => el === document.activeElement);
      expect(nameInputFocused).toBe(true);
      
      // Escape should close modal
      await uiContext.page.keyboard.press('Escape');
      await expect(uiContext.page.locator('[data-testid="sop-creation-form"]')).not.toBeVisible();
    });
  });
});