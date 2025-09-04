import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ActivePieces SOP Tool E2E testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Test timeout configuration
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for expect assertions
  },
  
  // Global setup and teardown
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  
  // Reporter configuration
  reporter: process.env.CI 
    ? [['html'], ['json', { outputFile: 'test-results/results.json' }]]
    : [['html'], ['list']],
  
  use: {
    // Base URL for the application
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:8080',
    
    // Browser configuration
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Network configuration
    ignoreHTTPSErrors: true,
    
    // Test data
    storageState: undefined, // Will be set per test if needed
  },

  projects: [
    // Setup project (runs first)
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Desktop Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          // Permissions for file upload tests
          permissions: ['camera', 'microphone']
        }
      },
      dependencies: ['setup'],
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },

    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },

    // API testing (no browser)
    {
      name: 'api',
      testMatch: /.*\.api\.test\.ts/,
      use: {
        // API tests don't need a browser
        headless: true,
      },
    },
  ],

  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'echo "Using existing services"',
    port: 8080,
    reuseExistingServer: true,
    timeout: 10000,
  },
  
  // Output directories
  outputDir: 'test-results/',
  
  // Test configuration
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.setup.ts'
  ],
  
  // Grep configuration for test filtering
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,
});