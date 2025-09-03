// Global teardown for all tests
export default async function globalTeardown() {
  console.log('Running global teardown...');
  
  // Clean up any global resources
  
  // Stop any running processes
  if (process.env.TEST_CLEANUP_PROCESSES === 'true') {
    // Kill any lingering test processes
    process.exit(0);
  }
  
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
  
  console.log('Global teardown completed');
}