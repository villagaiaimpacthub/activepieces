import { FullConfig } from '@playwright/test';
import { TestSetup } from './helpers/test-setup';

/**
 * Global teardown for Playwright tests
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Cleanup test environment
    await TestSetup.cleanupTestEnvironment();
    
    // Clean up temporary files
    const fs = require('fs');
    const path = require('path');
    
    const tempDirs = [
      'test-results',
      'coverage',
      '.tmp',
    ];
    
    for (const dir of tempDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath) && process.env.KEEP_TEST_FILES !== 'true') {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`Cleaned up ${dir} directory`);
        } catch (error) {
          console.warn(`Failed to clean up ${dir}:`, error.message);
        }
      }
    }
    
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - we don't want to fail the test run on cleanup issues
  }
}

export default globalTeardown;