// End-to-end test setup
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

// Global browser instances
let browser: Browser;
let context: BrowserContext;
let page: Page;

// E2E test configuration
export const e2eConfig = {
  baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
  apiURL: process.env.E2E_API_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.E2E_TIMEOUT || '30000'),
  slowMo: parseInt(process.env.E2E_SLOW_MO || '0'),
  headless: process.env.E2E_HEADLESS !== 'false',
  video: process.env.E2E_VIDEO === 'true',
  screenshot: process.env.E2E_SCREENSHOT || 'only-on-failure',
};

export class E2ETestUtils {
  static async setupBrowser(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    const browser = await chromium.launch({
      headless: e2eConfig.headless,
      slowMo: e2eConfig.slowMo,
    });

    const context = await browser.newContext({
      baseURL: e2eConfig.baseURL,
      viewport: { width: 1280, height: 720 },
      recordVideo: e2eConfig.video ? { dir: 'test-results/videos' } : undefined,
    });

    // Enable request/response logging in debug mode
    if (process.env.DEBUG_E2E === 'true') {
      context.on('request', request => {
        console.log(`REQUEST: ${request.method()} ${request.url()}`);
      });
      
      context.on('response', response => {
        console.log(`RESPONSE: ${response.status()} ${response.url()}`);
      });
    }

    const page = await context.newPage();
    
    // Set default timeout
    page.setDefaultTimeout(e2eConfig.timeout);

    return { browser, context, page };
  }

  static async login(page: Page, email: string = 'test@example.com', password: string = 'testPassword123') {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for login to complete
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  static async logout(page: Page) {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/auth/login');
  }

  static async createSopProject(page: Page, projectName: string = 'Test SOP Project') {
    await page.goto('/sop-designer');
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', projectName);
    await page.fill('[data-testid="project-description-input"]', 'Test description for ' + projectName);
    await page.click('[data-testid="save-project-button"]');
    
    // Wait for project to be created
    await page.waitForSelector('[data-testid="sop-designer-canvas"]');
    
    return projectName;
  }

  static async addSopStep(page: Page, stepName: string, stepType: string = 'action') {
    // Open step palette
    await page.click('[data-testid="step-palette-button"]');
    
    // Select step type
    await page.click(`[data-testid="step-type-${stepType}"]`);
    
    // Drag to canvas (simplified - in real tests you'd use proper drag & drop)
    await page.click('[data-testid="sop-designer-canvas"]');
    
    // Configure step
    await page.fill('[data-testid="step-name-input"]', stepName);
    await page.click('[data-testid="save-step-button"]');
    
    // Wait for step to appear
    await page.waitForSelector(`[data-testid="sop-step-${stepName}"]`);
  }

  static async exportSopProject(page: Page, format: string = 'json') {
    await page.click('[data-testid="export-menu-button"]');
    await page.click(`[data-testid="export-${format}-button"]`);
    
    // Wait for download to start
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="confirm-export-button"]');
    const download = await downloadPromise;
    
    return download;
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  static async waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout: number = 10000) {
    return page.waitForResponse(
      response => {
        const url = response.url();
        return typeof urlPattern === 'string' 
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      },
      { timeout }
    );
  }

  static async mockApiResponse(context: BrowserContext, urlPattern: string, responseData: any) {
    await context.route(urlPattern, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });
  }

  static async fillAndSubmitForm(page: Page, formSelector: string, formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await page.fill(`${formSelector} [data-testid="${field}-input"]`, value);
    }
    await page.click(`${formSelector} [data-testid="submit-button"]`);
  }

  static async assertElementText(page: Page, selector: string, expectedText: string) {
    const element = page.locator(selector);
    await expect(element).toHaveText(expectedText);
  }

  static async assertElementVisible(page: Page, selector: string) {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
  }

  static async assertPageTitle(page: Page, expectedTitle: string) {
    await expect(page).toHaveTitle(expectedTitle);
  }
}

// Setup and teardown for E2E tests
beforeAll(async () => {
  if (process.env.JEST_PROJECT_NAME === 'e2e') {
    const browserSetup = await E2ETestUtils.setupBrowser();
    browser = browserSetup.browser;
    context = browserSetup.context;
    page = browserSetup.page;
  }
}, 30000);

afterAll(async () => {
  if (context) await context.close();
  if (browser) await browser.close();
}, 30000);

beforeEach(async () => {
  if (page) {
    // Clear storage before each test
    await context.clearCookies();
    await context.clearPermissions();
    
    // Reset to base URL
    await page.goto('/');
  }
});

afterEach(async () => {
  if (page && e2eConfig.screenshot === 'always') {
    await E2ETestUtils.takeScreenshot(page, `test-${Date.now()}`);
  }
});

export { browser, context, page };