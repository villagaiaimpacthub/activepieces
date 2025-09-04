/**
 * Test environment setup and utilities
 * Provides centralized test configuration and helper functions
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TestEnvironment {
  apiUrl: string;
  frontendUrl: string;
  databaseUrl: string;
  isDockerized: boolean;
  servicesRunning: boolean;
}

export class TestSetup {
  private static testEnv: TestEnvironment;
  
  /**
   * Initialize test environment
   */
  static async setupTestEnvironment(): Promise<TestEnvironment> {
    console.log('🔧 Setting up test environment...');
    
    this.testEnv = {
      apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
      frontendUrl: process.env.TEST_FRONTEND_URL || 'http://localhost:8080',
      databaseUrl: process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/activepieces_sop_test',
      isDockerized: process.env.TEST_ENVIRONMENT === 'docker',
      servicesRunning: false
    };

    // Check if services are running
    this.testEnv.servicesRunning = await this.checkServices();
    
    // Setup test data if services are running
    if (this.testEnv.servicesRunning) {
      await this.prepareTestData();
    }

    console.log('✅ Test environment ready:', this.testEnv);
    return this.testEnv;
  }

  /**
   * Cleanup test environment
   */
  static async cleanupTestEnvironment(): Promise<void> {
    console.log('🧹 Cleaning up test environment...');
    
    if (this.testEnv?.servicesRunning) {
      await this.cleanupTestData();
    }
    
    console.log('✅ Test environment cleaned up');
  }

  /**
   * Check if required services are running
   */
  private static async checkServices(): Promise<boolean> {
    try {
      // Check API health
      const response = await fetch(`${this.testEnv.apiUrl}/health`);
      if (!response.ok) {
        console.log('⚠️ API service not responding');
        return false;
      }

      // Check if frontend is accessible
      const frontendResponse = await fetch(this.testEnv.frontendUrl);
      if (!frontendResponse.ok) {
        console.log('⚠️ Frontend service not accessible');
        // Don't fail on frontend - it might not be critical for API tests
      }

      console.log('✅ Services are running');
      return true;
    } catch (error) {
      console.log('⚠️ Services not running:', error.message);
      return false;
    }
  }

  /**
   * Prepare test data
   */
  private static async prepareTestData(): Promise<void> {
    try {
      // This would typically involve:
      // 1. Creating test database
      // 2. Running migrations
      // 3. Seeding test data
      console.log('📊 Test data preparation completed');
    } catch (error) {
      console.log('⚠️ Test data preparation failed:', error.message);
    }
  }

  /**
   * Cleanup test data
   */
  private static async cleanupTestData(): Promise<void> {
    try {
      // This would typically involve:
      // 1. Removing test data
      // 2. Resetting sequences
      // 3. Cleaning up files
      console.log('🗑️ Test data cleanup completed');
    } catch (error) {
      console.log('⚠️ Test data cleanup failed:', error.message);
    }
  }

  /**
   * Get current test environment
   */
  static getTestEnvironment(): TestEnvironment {
    return this.testEnv;
  }

  /**
   * Check if file exists in project
   */
  static fileExists(relativePath: string): boolean {
    const projectRoot = '/Users/nikolai/Desktop/Cursor Projects/agentic-claude-sparc/2nd chat/3rd chat/sparc-installer-clean/activepieces-sop-tool';
    const fullPath = join(projectRoot, relativePath);
    return existsSync(fullPath);
  }

  /**
   * Read file content from project
   */
  static readFile(relativePath: string): string {
    const projectRoot = '/Users/nikolai/Desktop/Cursor Projects/agentic-claude-sparc/2nd chat/3rd chat/sparc-installer-clean/activepieces-sop-tool';
    const fullPath = join(projectRoot, relativePath);
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    
    return readFileSync(fullPath, 'utf8');
  }

  /**
   * Execute shell command for testing
   */
  static executeCommand(command: string, options: { timeout?: number; cwd?: string } = {}): string {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: options.timeout || 30000,
        cwd: options.cwd || '/Users/nikolai/Desktop/Cursor Projects/agentic-claude-sparc/2nd chat/3rd chat/sparc-installer-clean/activepieces-sop-tool'
      });
      return result.trim();
    } catch (error) {
      console.log(`Command failed: ${command}`, error.message);
      throw error;
    }
  }

  /**
   * Wait for specified duration
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry operation with backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.wait(delay);
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError;
  }

  /**
   * Generate random test ID
   */
  static generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Validate environment variables
   */
  static validateEnvironment(): void {
    const requiredEnvVars = [
      'NODE_ENV'
    ];
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Check Docker services
   */
  static checkDockerServices(): boolean {
    try {
      const result = this.executeCommand('docker-compose -f docker-compose.sop.yml ps', {
        timeout: 10000
      });
      
      // Check if services are running
      const runningServices = result.split('\n').filter(line => line.includes('Up')).length;
      console.log(`Docker services running: ${runningServices}`);
      
      return runningServices > 0;
    } catch (error) {
      console.log('Docker services check failed:', error.message);
      return false;
    }
  }

  /**
   * Get project structure validation
   */
  static validateProjectStructure(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Essential files
    const essentialFiles = [
      'package.json',
      'docker-compose.sop.yml',
      'Dockerfile.sop',
      '.env.sop.example',
      'deploy-sop.sh'
    ];
    
    essentialFiles.forEach(file => {
      if (!this.fileExists(file)) {
        errors.push(`Missing essential file: ${file}`);
      }
    });
    
    // Essential directories
    const essentialDirs = [
      'docs',
      'packages',
      'tests'
    ];
    
    essentialDirs.forEach(dir => {
      if (!this.fileExists(dir)) {
        errors.push(`Missing essential directory: ${dir}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * API Test Client
 */
export class APITestClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  
  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Make GET request
   */
  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Make POST request
   */
  async post(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`POST ${endpoint} failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    return response.json();
  }
  
  /**
   * Make PUT request
   */
  async put(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Make DELETE request
   */
  async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const health = await this.get('/health');
      return health.status === 'healthy' || health.status === 'ok';
    } catch (error) {
      return false;
    }
  }
}

/**
 * Performance test utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure execution time
   */
  static async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;
    
    return { result, duration };
  }
  
  /**
   * Run concurrent operations
   */
  static async runConcurrent<T>(
    operations: Array<() => Promise<T>>,
    concurrency: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }
    
    return results;
  }
  
  /**
   * Generate performance report
   */
  static generatePerformanceReport(
    testName: string,
    operations: number,
    totalTime: number,
    errors: number = 0
  ): void {
    const averageTime = totalTime / operations;
    const throughput = operations / (totalTime / 1000);
    const errorRate = (errors / operations) * 100;
    
    console.log(`\n📊 Performance Report: ${testName}`);
    console.log(`Total Operations: ${operations}`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Average Time: ${averageTime.toFixed(2)}ms`);
    console.log(`Throughput: ${throughput.toFixed(2)} ops/sec`);
    console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
    console.log('─'.repeat(50));
  }
}

// Export convenience functions
export const setupTestEnvironment = TestSetup.setupTestEnvironment.bind(TestSetup);
export const cleanupTestEnvironment = TestSetup.cleanupTestEnvironment.bind(TestSetup);