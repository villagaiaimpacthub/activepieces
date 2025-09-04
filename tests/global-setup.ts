import { chromium, FullConfig } from '@playwright/test';
import { TestSetup } from './helpers/test-setup';

/**
 * Global setup for Playwright tests
 * Runs once before all tests start
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Setup test environment
    await TestSetup.setupTestEnvironment();
    
    // Validate project structure
    const validation = TestSetup.validateProjectStructure();
    if (!validation.valid) {
      console.log('⚠️ Project structure validation failed:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Check if services are running
    const servicesRunning = TestSetup.checkDockerServices();
    if (!servicesRunning) {
      console.log('⚠️ Docker services not running - some tests may be skipped');
    }
    
    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;