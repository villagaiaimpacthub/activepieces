/**
 * Test Utilities and Helpers
 * Common utilities for E2E testing of the SOP Tool
 * REALITY: Based on actual project structure and testing needs
 */

import { DataSource } from 'typeorm';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import axios, { AxiosInstance } from 'axios';
import { SOPTestDataSeeder } from '../fixtures/test-data';

export interface TestEnvironment {
  database: DataSource;
  browser?: Browser;
  page?: Page;
  api: AxiosInstance;
  config: TestConfig;
}

export interface TestConfig {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  api: {
    baseURL: string;
    timeout: number;
  };
  ui: {
    baseURL: string;
    headless: boolean;
    slowMo: number;
  };
  auth: {
    testUser: string;
    testPassword: string;
    adminUser?: string;
    adminPassword?: string;
  };
}

export class TestEnvironmentManager {
  private environment: Partial<TestEnvironment> = {};

  constructor(private config: TestConfig) {}

  async setup(): Promise<TestEnvironment> {
    // Setup database
    this.environment.database = await this.setupDatabase();
    
    // Setup API client
    this.environment.api = this.setupAPIClient();
    
    // Setup browser (for UI tests)
    if (process.env.RUN_UI_TESTS === 'true') {
      const { browser, page } = await this.setupBrowser();
      this.environment.browser = browser;
      this.environment.page = page;
    }

    this.environment.config = this.config;

    return this.environment as TestEnvironment;
  }

  async teardown(): Promise<void> {
    if (this.environment.browser) {
      await this.environment.browser.close();
    }
    
    if (this.environment.database) {
      await this.environment.database.destroy();
    }
  }

  private async setupDatabase(): Promise<DataSource> {
    const dataSource = new DataSource({
      type: 'postgres',
      host: this.config.database.host,
      port: this.config.database.port,
      username: this.config.database.username,
      password: this.config.database.password,
      database: this.config.database.database,
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();
    return dataSource;
  }

  private setupAPIClient(): AxiosInstance {
    return axios.create({
      baseURL: this.config.api.baseURL,
      timeout: this.config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async setupBrowser(): Promise<{ browser: Browser; page: Page }> {
    const browser = await chromium.launch({
      headless: this.config.ui.headless,
      slowMo: this.config.ui.slowMo,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    const page = await context.newPage();
    return { browser, page };
  }
}

export class DatabaseTestHelper {
  constructor(private dataSource: DataSource) {}

  /**
   * Clean all test data from database
   */
  async cleanDatabase(): Promise<void> {
    await this.dataSource.query('TRUNCATE TABLE sop_steps CASCADE');
    await this.dataSource.query('TRUNCATE TABLE sop_projects CASCADE');
    await this.dataSource.query('TRUNCATE TABLE sop_templates CASCADE');
  }

  /**
   * Seed database with test data
   */
  async seedTestData(): Promise<void> {
    const seeder = new SOPTestDataSeeder(this.dataSource);
    await seeder.seedBasicData();
  }

  /**
   * Execute raw SQL query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    return await this.dataSource.query(sql, params);
  }

  /**
   * Check if database connection is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get database statistics for test validation
   */
  async getStats(): Promise<{
    projectCount: number;
    stepCount: number;
    templateCount: number;
  }> {
    const [projectResult] = await this.dataSource.query('SELECT COUNT(*) as count FROM sop_projects');
    const [stepResult] = await this.dataSource.query('SELECT COUNT(*) as count FROM sop_steps');
    const [templateResult] = await this.dataSource.query('SELECT COUNT(*) as count FROM sop_templates');

    return {
      projectCount: parseInt(projectResult.count),
      stepCount: parseInt(stepResult.count),
      templateCount: parseInt(templateResult.count),
    };
  }

  /**
   * Create backup of current database state
   */
  async createSnapshot(snapshotName: string): Promise<void> {
    // In a real implementation, this would create a database snapshot
    // For testing purposes, we'll store the data in temporary tables
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS snapshot_${snapshotName}_projects AS 
      SELECT * FROM sop_projects
    `);
    
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS snapshot_${snapshotName}_steps AS 
      SELECT * FROM sop_steps
    `);
    
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS snapshot_${snapshotName}_templates AS 
      SELECT * FROM sop_templates
    `);
  }

  /**
   * Restore database from snapshot
   */
  async restoreSnapshot(snapshotName: string): Promise<void> {
    await this.cleanDatabase();
    
    await this.dataSource.query(`
      INSERT INTO sop_projects SELECT * FROM snapshot_${snapshotName}_projects
    `);
    
    await this.dataSource.query(`
      INSERT INTO sop_steps SELECT * FROM snapshot_${snapshotName}_steps
    `);
    
    await this.dataSource.query(`
      INSERT INTO sop_templates SELECT * FROM snapshot_${snapshotName}_templates
    `);
    
    // Clean up snapshot tables
    await this.dataSource.query(`DROP TABLE IF EXISTS snapshot_${snapshotName}_projects`);
    await this.dataSource.query(`DROP TABLE IF EXISTS snapshot_${snapshotName}_steps`);
    await this.dataSource.query(`DROP TABLE IF EXISTS snapshot_${snapshotName}_templates`);
  }
}

export class APITestHelper {
  constructor(private api: AxiosInstance) {}

  private authToken?: string;

  /**
   * Authenticate with the API
   */
  async authenticate(email: string, password: string): Promise<string> {
    try {
      const response = await this.api.post('/v1/authentication/sign-in', {
        email,
        password,
      });
      
      this.authToken = response.data.token;
      this.api.defaults.headers['Authorization'] = `Bearer ${this.authToken}`;
      
      return this.authToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create SOP via API
   */
  async createSOP(sopData: {
    name: string;
    description?: string;
    metadata?: any;
  }): Promise<{ id: string }> {
    const response = await this.api.post('/api/v1/sop/projects', sopData);
    return response.data;
  }

  /**
   * Add step to SOP via API
   */
  async addStepToSOP(projectId: string, stepData: {
    name: string;
    step_type: string;
    position: number;
    configuration?: any;
  }): Promise<{ id: string }> {
    const response = await this.api.post(`/api/v1/sop/projects/${projectId}/steps`, stepData);
    return response.data;
  }

  /**
   * Export SOP via API
   */
  async exportSOP(projectId: string, format: string): Promise<any> {
    const response = await this.api.get(`/api/v1/sop/projects/${projectId}/export`, {
      params: { format },
    });
    return response.data;
  }

  /**
   * Get SOP project details
   */
  async getSOP(projectId: string): Promise<any> {
    const response = await this.api.get(`/api/v1/sop/projects/${projectId}`);
    return response.data;
  }

  /**
   * List all SOPs
   */
  async listSOPs(filters?: {
    status?: string;
    department?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await this.api.get('/api/v1/sop/projects', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Health check API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/api/v1/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for async operation to complete
   */
  async waitForOperation(operationId: string, maxWaitTime = 30000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await this.api.get(`/api/v1/operations/${operationId}`);
        
        if (response.data.status === 'completed') {
          return response.data.result;
        }
        
        if (response.data.status === 'failed') {
          throw new Error(`Operation failed: ${response.data.error}`);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
        // 404 might mean operation is not ready yet
      }
    }
    
    throw new Error('Operation timeout');
  }
}

export class UITestHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to SOP dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.page.goto('/sop-dashboard');
    await this.page.waitForSelector('[data-testid="sop-dashboard"]', { timeout: 10000 });
  }

  /**
   * Create SOP via UI
   */
  async createSOP(name: string, description?: string): Promise<void> {
    await this.page.click('[data-testid="create-sop-button"]');
    await this.page.waitForSelector('[data-testid="sop-creation-form"]');
    
    await this.page.fill('[data-testid="sop-name-input"]', name);
    if (description) {
      await this.page.fill('[data-testid="sop-description-input"]', description);
    }
    
    await this.page.click('[data-testid="submit-sop-button"]');
    await this.page.waitForSelector('[data-testid="sop-created-confirmation"]');
  }

  /**
   * Wait for element with timeout
   */
  async waitForElement(selector: string, timeout = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for console errors
   */
  async getConsoleErrors(): Promise<string[]> {
    const logs = await this.page.evaluate(() => {
      return (window as any).testLogs?.errors || [];
    });
    return logs;
  }

  /**
   * Validate accessibility
   */
  async validateAccessibility(): Promise<{ passed: boolean; violations: any[] }> {
    // This would integrate with an accessibility testing library like axe-core
    // For now, basic checks
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    const images = await this.page.locator('img').count();
    const imagesWithAlt = await this.page.locator('img[alt]').count();
    
    const violations = [];
    
    if (headings === 0) {
      violations.push('No headings found on page');
    }
    
    if (images > imagesWithAlt) {
      violations.push(`${images - imagesWithAlt} images missing alt text`);
    }
    
    return {
      passed: violations.length === 0,
      violations
    };
  }
}

export class PerformanceTestHelper {
  private metrics: {
    startTime: number;
    endTime?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    queryCount?: number;
  } = { startTime: 0 };

  /**
   * Start performance measurement
   */
  startMeasurement(): void {
    this.metrics.startTime = Date.now();
    this.metrics.memoryUsage = process.memoryUsage();
  }

  /**
   * End performance measurement
   */
  endMeasurement(): {
    duration: number;
    memoryDelta: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
  } {
    this.metrics.endTime = Date.now();
    const endMemory = process.memoryUsage();
    
    return {
      duration: this.metrics.endTime - this.metrics.startTime,
      memoryDelta: {
        rss: endMemory.rss - (this.metrics.memoryUsage?.rss || 0),
        heapUsed: endMemory.heapUsed - (this.metrics.memoryUsage?.heapUsed || 0),
        heapTotal: endMemory.heapTotal - (this.metrics.memoryUsage?.heapTotal || 0),
      },
    };
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(operation: () => Promise<T>): Promise<{
    result: T;
    metrics: ReturnType<typeof this.endMeasurement>;
  }> {
    this.startMeasurement();
    const result = await operation();
    const metrics = this.endMeasurement();
    
    return { result, metrics };
  }

  /**
   * Assert performance meets criteria
   */
  assertPerformance(
    metrics: ReturnType<typeof this.endMeasurement>,
    criteria: {
      maxDuration?: number;
      maxMemoryUsage?: number;
    }
  ): void {
    if (criteria.maxDuration && metrics.duration > criteria.maxDuration) {
      throw new Error(`Performance assertion failed: duration ${metrics.duration}ms exceeds max ${criteria.maxDuration}ms`);
    }
    
    if (criteria.maxMemoryUsage && metrics.memoryDelta.heapUsed > criteria.maxMemoryUsage) {
      throw new Error(`Performance assertion failed: memory usage ${metrics.memoryDelta.heapUsed} bytes exceeds max ${criteria.maxMemoryUsage} bytes`);
    }
  }
}

export class TestReportGenerator {
  private results: Array<{
    test: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: string;
    metrics?: any;
  }> = [];

  addResult(result: {
    test: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: string;
    metrics?: any;
  }): void {
    this.results.push(result);
  }

  generateReport(): {
    summary: {
      total: number;
      passed: number;
      failed: number;
      duration: number;
    };
    details: typeof this.results;
  } {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      duration: this.results.reduce((sum, r) => sum + r.duration, 0),
    };

    return { summary, details: this.results };
  }

  exportToJSON(filePath: string): void {
    const report = this.generateReport();
    require('fs').writeFileSync(filePath, JSON.stringify(report, null, 2));
  }
}

/**
 * Configuration factory for different test environments
 */
export class TestConfigFactory {
  static development(): TestConfig {
    return {
      database: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test_activepieces_sop',
      },
      api: {
        baseURL: 'http://localhost:3000',
        timeout: 10000,
      },
      ui: {
        baseURL: 'http://localhost:8080',
        headless: false,
        slowMo: 50,
      },
      auth: {
        testUser: 'test@example.com',
        testPassword: 'testpassword',
      },
    };
  }

  static ci(): TestConfig {
    return {
      database: {
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        username: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        database: process.env.TEST_DB_NAME || 'test_activepieces_sop',
      },
      api: {
        baseURL: process.env.TEST_API_URL || 'http://localhost:3000',
        timeout: 30000,
      },
      ui: {
        baseURL: process.env.TEST_UI_URL || 'http://localhost:8080',
        headless: true,
        slowMo: 0,
      },
      auth: {
        testUser: process.env.TEST_USER || 'test@example.com',
        testPassword: process.env.TEST_PASSWORD || 'testpassword',
      },
    };
  }

  static staging(): TestConfig {
    return {
      database: {
        host: process.env.STAGING_DB_HOST!,
        port: parseInt(process.env.STAGING_DB_PORT!),
        username: process.env.STAGING_DB_USER!,
        password: process.env.STAGING_DB_PASSWORD!,
        database: process.env.STAGING_DB_NAME!,
      },
      api: {
        baseURL: process.env.STAGING_API_URL!,
        timeout: 15000,
      },
      ui: {
        baseURL: process.env.STAGING_UI_URL!,
        headless: true,
        slowMo: 0,
      },
      auth: {
        testUser: process.env.STAGING_TEST_USER!,
        testPassword: process.env.STAGING_TEST_PASSWORD!,
      },
    };
  }
}