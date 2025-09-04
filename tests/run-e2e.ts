/**
 * E2E Test Runner Script
 * Orchestrates the complete E2E test suite execution
 * REALITY: Designed for actual ActivePieces SOP Tool testing
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestRunOptions {
  suites: string[];
  browsers: string[];
  environment: 'development' | 'staging' | 'ci';
  parallel: boolean;
  retries: number;
  timeout: number;
  generateReport: boolean;
  cleanup: boolean;
}

interface TestResult {
  suite: string;
  browser: string;
  passed: number;
  failed: number;
  duration: number;
  errors: string[];
}

class E2ETestRunner {
  private options: TestRunOptions;
  private results: TestResult[] = [];

  constructor(options: Partial<TestRunOptions> = {}) {
    this.options = {
      suites: ['database', 'api', 'integration', 'ui', 'export'],
      browsers: ['chromium'],
      environment: 'development',
      parallel: true,
      retries: 2,
      timeout: 60000,
      generateReport: true,
      cleanup: true,
      ...options
    };
  }

  async run(): Promise<void> {
    console.log('🚀 Starting ActivePieces SOP Tool E2E Test Suite');
    console.log(`📋 Test Configuration:`);
    console.log(`   Environment: ${this.options.environment}`);
    console.log(`   Suites: ${this.options.suites.join(', ')}`);
    console.log(`   Browsers: ${this.options.browsers.join(', ')}`);
    console.log(`   Parallel: ${this.options.parallel}`);
    console.log(`   Retries: ${this.options.retries}`);

    try {
      await this.setupEnvironment();
      await this.runTestSuites();
      
      if (this.options.generateReport) {
        await this.generateReport();
      }

      await this.displaySummary();

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    } finally {
      if (this.options.cleanup) {
        await this.cleanup();
      }
    }
  }

  private async setupEnvironment(): Promise<void> {
    console.log('\n🔧 Setting up test environment...');

    // Set environment variables
    const envVars = this.getEnvironmentVariables();
    Object.assign(process.env, envVars);

    // Ensure test directories exist
    const testDirs = [
      'test-results',
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces',
      'tests/temp'
    ];

    for (const dir of testDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Verify services are running
    await this.verifyServices();

    console.log('✅ Environment setup complete');
  }

  private getEnvironmentVariables(): Record<string, string> {
    const baseVars = {
      NODE_ENV: 'test',
      TEST_RUN_ID: Date.now().toString(),
    };

    switch (this.options.environment) {
      case 'development':
        return {
          ...baseVars,
          SOP_API_URL: 'http://localhost:3000',
          SOP_UI_URL: 'http://localhost:8080',
          TEST_DB_HOST: 'localhost',
          TEST_DB_PORT: '5432',
          TEST_DB_NAME: 'test_activepieces_sop',
          TEST_USER: 'test@example.com',
          TEST_PASSWORD: 'testpassword',
        };

      case 'ci':
        return {
          ...baseVars,
          CI: 'true',
          SOP_API_URL: process.env.CI_API_URL || 'http://localhost:3000',
          SOP_UI_URL: process.env.CI_UI_URL || 'http://localhost:8080',
          TEST_DB_HOST: process.env.CI_DB_HOST || 'localhost',
          TEST_DB_NAME: process.env.CI_DB_NAME || 'test_activepieces_sop',
          TEST_USER: process.env.CI_TEST_USER || 'test@example.com',
          TEST_PASSWORD: process.env.CI_TEST_PASSWORD || 'testpassword',
        };

      case 'staging':
        return {
          ...baseVars,
          SOP_API_URL: process.env.STAGING_API_URL!,
          SOP_UI_URL: process.env.STAGING_UI_URL!,
          TEST_DB_HOST: process.env.STAGING_DB_HOST!,
          TEST_DB_NAME: process.env.STAGING_DB_NAME!,
          TEST_USER: process.env.STAGING_TEST_USER!,
          TEST_PASSWORD: process.env.STAGING_TEST_PASSWORD!,
        };

      default:
        throw new Error(`Unknown environment: ${this.options.environment}`);
    }
  }

  private async verifyServices(): Promise<void> {
    console.log('🔍 Verifying services...');

    const services = [
      {
        name: 'API',
        url: process.env.SOP_API_URL + '/api/health',
        timeout: 10000
      },
      {
        name: 'UI',
        url: process.env.SOP_UI_URL,
        timeout: 10000
      }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url, {
          signal: AbortSignal.timeout(service.timeout)
        });
        
        if (response.ok) {
          console.log(`✅ ${service.name} service is running`);
        } else {
          throw new Error(`Service returned status ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ ${service.name} service check failed:`, error.message);
        throw new Error(`Failed to verify ${service.name} service`);
      }
    }
  }

  private async runTestSuites(): Promise<void> {
    console.log('\n🧪 Running test suites...');

    for (const suite of this.options.suites) {
      console.log(`\n📦 Running ${suite} test suite...`);
      
      if (this.options.parallel && this.options.browsers.length > 1) {
        await this.runSuiteParallel(suite);
      } else {
        await this.runSuiteSequential(suite);
      }
    }
  }

  private async runSuiteSequential(suite: string): Promise<void> {
    for (const browser of this.options.browsers) {
      await this.runSingleTest(suite, browser);
    }
  }

  private async runSuiteParallel(suite: string): Promise<void> {
    const promises = this.options.browsers.map(browser => 
      this.runSingleTest(suite, browser)
    );
    
    await Promise.all(promises);
  }

  private async runSingleTest(suite: string, browser: string): Promise<void> {
    const startTime = Date.now();
    console.log(`   🔸 ${suite} on ${browser}...`);

    const command = this.getTestCommand(suite, browser);
    
    try {
      const output = await this.executeCommand(command);
      const duration = Date.now() - startTime;
      
      const result = this.parseTestOutput(output, suite, browser, duration);
      this.results.push(result);
      
      if (result.failed === 0) {
        console.log(`   ✅ ${suite} on ${browser} - ${result.passed} passed (${duration}ms)`);
      } else {
        console.log(`   ❌ ${suite} on ${browser} - ${result.passed} passed, ${result.failed} failed (${duration}ms)`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   💥 ${suite} on ${browser} - execution failed (${duration}ms)`);
      
      this.results.push({
        suite,
        browser,
        passed: 0,
        failed: 1,
        duration,
        errors: [error.message]
      });
    }
  }

  private getTestCommand(suite: string, browser: string): string[] {
    const baseCmd = ['npx', 'playwright', 'test'];
    
    // Add suite-specific test files
    switch (suite) {
      case 'database':
        baseCmd.push('--grep', 'Database.*E2E');
        break;
      case 'api':
        baseCmd.push('--grep', 'API|Integration.*E2E');
        break;
      case 'ui':
        baseCmd.push('--grep', 'UI.*E2E');
        break;
      case 'export':
        baseCmd.push('--grep', 'Export.*E2E');
        break;
      case 'integration':
        baseCmd.push('--grep', 'ActivePieces Integration|SOP Workflows');
        break;
      default:
        baseCmd.push(`tests/e2e/${suite}*.test.ts`);
    }

    // Add browser project
    if (browser !== 'all') {
      baseCmd.push('--project', browser);
    }

    // Add configuration options
    baseCmd.push(
      '--retries', this.options.retries.toString(),
      '--timeout', this.options.timeout.toString(),
      '--output', 'test-results'
    );

    if (this.options.environment === 'ci') {
      baseCmd.push('--reporter', 'github');
    }

    return baseCmd;
  }

  private async executeCommand(command: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      
      const process = spawn(command[0], command.slice(1), {
        stdio: ['inherit', 'pipe', 'pipe']
      });

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with exit code ${code}\n${output}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private parseTestOutput(output: string, suite: string, browser: string, duration: number): TestResult {
    // Parse Playwright output to extract test results
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const errorMatches = output.match(/Error: .+/g);

    return {
      suite,
      browser,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      duration,
      errors: errorMatches || []
    };
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 Generating test report...');

    const report = {
      testRun: {
        id: process.env.TEST_RUN_ID,
        timestamp: new Date().toISOString(),
        environment: this.options.environment,
        configuration: this.options
      },
      summary: {
        totalSuites: this.options.suites.length,
        totalBrowsers: this.options.browsers.length,
        totalTests: this.results.reduce((sum, r) => sum + r.passed + r.failed, 0),
        totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
        successRate: 0
      },
      results: this.results,
      coverage: await this.generateCoverage(),
      performance: await this.generatePerformanceReport()
    };

    report.summary.successRate = report.summary.totalTests > 0 
      ? (report.summary.totalPassed / report.summary.totalTests) * 100 
      : 0;

    // Save JSON report
    fs.writeFileSync(
      'test-results/e2e-report.json',
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    await this.generateHTMLReport(report);

    console.log('✅ Test report generated: test-results/e2e-report.json');
    console.log('✅ HTML report generated: test-results/e2e-report.html');
  }

  private async generateCoverage(): Promise<any> {
    // Test coverage report based on which features were tested
    const featureCoverage = {
      sopCreation: this.results.some(r => r.suite.includes('ui') || r.suite.includes('api')),
      sopExport: this.results.some(r => r.suite.includes('export')),
      templateSystem: this.results.some(r => r.suite.includes('ui') || r.suite.includes('integration')),
      databaseOperations: this.results.some(r => r.suite.includes('database')),
      activepiecesIntegration: this.results.some(r => r.suite.includes('integration')),
      workflowExecution: this.results.some(r => r.suite.includes('integration') || r.suite.includes('workflow'))
    };

    const coveragePercentage = Object.values(featureCoverage).filter(Boolean).length / Object.keys(featureCoverage).length * 100;

    return {
      features: featureCoverage,
      percentage: coveragePercentage
    };
  }

  private async generatePerformanceReport(): Promise<any> {
    // Extract performance metrics from test results
    const performanceMetrics = {
      averageTestDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
      slowestSuite: this.results.reduce((slowest, current) => 
        current.duration > slowest.duration ? current : slowest, this.results[0]),
      fastestSuite: this.results.reduce((fastest, current) => 
        current.duration < fastest.duration ? current : fastest, this.results[0])
    };

    return performanceMetrics;
  }

  private async generateHTMLReport(report: any): Promise<void> {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>ActivePieces SOP Tool - E2E Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 4px; flex: 1; }
        .metric.passed { border-left: 4px solid #28a745; }
        .metric.failed { border-left: 4px solid #dc3545; }
        .results table { width: 100%; border-collapse: collapse; }
        .results th, .results td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .results th { background-color: #f8f9fa; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .coverage { background: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ActivePieces SOP Tool - E2E Test Report</h1>
        <p><strong>Test Run ID:</strong> ${report.testRun.id}</p>
        <p><strong>Environment:</strong> ${report.testRun.environment}</p>
        <p><strong>Timestamp:</strong> ${report.testRun.timestamp}</p>
    </div>

    <div class="summary">
        <div class="metric passed">
            <h3>Tests Passed</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.totalPassed}</div>
        </div>
        <div class="metric failed">
            <h3>Tests Failed</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.totalFailed}</div>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.successRate.toFixed(1)}%</div>
        </div>
        <div class="metric">
            <h3>Total Duration</h3>
            <div style="font-size: 2em; font-weight: bold;">${(report.summary.totalDuration / 1000).toFixed(1)}s</div>
        </div>
    </div>

    <div class="coverage">
        <h3>Feature Coverage</h3>
        <p><strong>Coverage:</strong> ${report.coverage.percentage.toFixed(1)}%</p>
        <ul>
            ${Object.entries(report.coverage.features).map(([feature, covered]) => 
              `<li><span class="${covered ? 'passed' : 'failed'}">${covered ? '✓' : '✗'}</span> ${feature}</li>`
            ).join('')}
        </ul>
    </div>

    <div class="results">
        <h3>Test Results</h3>
        <table>
            <thead>
                <tr>
                    <th>Suite</th>
                    <th>Browser</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${report.results.map(result => `
                    <tr>
                        <td>${result.suite}</td>
                        <td>${result.browser}</td>
                        <td class="passed">${result.passed}</td>
                        <td class="failed">${result.failed}</td>
                        <td>${(result.duration / 1000).toFixed(1)}s</td>
                        <td class="${result.failed === 0 ? 'passed' : 'failed'}">
                            ${result.failed === 0 ? 'PASS' : 'FAIL'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

    fs.writeFileSync('test-results/e2e-report.html', htmlTemplate);
  }

  private async displaySummary(): Promise<void> {
    console.log('\n📈 Test Run Summary');
    console.log('==================');
    
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);

    if (totalFailed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.failed > 0).forEach(result => {
        console.log(`   - ${result.suite} on ${result.browser}: ${result.failed} failures`);
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            console.log(`     Error: ${error}`);
          });
        }
      });
    }

    console.log(`\n📊 Full report available at: test-results/e2e-report.html`);
    
    if (totalFailed > 0) {
      process.exit(1);
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');

    // Remove temporary files
    const tempPaths = [
      'tests/auth-state.json',
      'tests/temp'
    ];

    for (const tempPath of tempPaths) {
      if (fs.existsSync(tempPath)) {
        if (fs.statSync(tempPath).isDirectory()) {
          fs.rmSync(tempPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(tempPath);
        }
      }
    }

    console.log('✅ Cleanup complete');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: Partial<TestRunOptions> = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--suites':
        options.suites = args[++i].split(',');
        break;
      case '--browsers':
        options.browsers = args[++i].split(',');
        break;
      case '--env':
        options.environment = args[++i] as any;
        break;
      case '--sequential':
        options.parallel = false;
        break;
      case '--no-cleanup':
        options.cleanup = false;
        break;
      case '--no-report':
        options.generateReport = false;
        break;
    }
  }

  const runner = new E2ETestRunner(options);
  runner.run().catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}