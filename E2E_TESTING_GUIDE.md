# E2E Testing Guide - ActivePieces SOP Tool

This guide covers comprehensive end-to-end testing for the ActivePieces SOP Tool, including setup, execution, and maintenance of the test suite.

## 🎯 Overview

The E2E testing suite validates the complete SOP Tool functionality through:
- **Core System Validation**: Project structure, deployment, configuration
- **Database Testing**: Schema validation, migrations, data integrity  
- **API Testing**: REST endpoints, authentication, error handling
- **UI Testing**: User workflows, cross-browser compatibility
- **Performance Testing**: Load testing, concurrent operations
- **Integration Testing**: Service communication, data flow

## 🏗️ Test Architecture

### Test Structure
```
tests/
├── e2e/                    # End-to-end test suites
│   └── sop-core.test.ts   # Core functionality tests
├── fixtures/               # Test data and fixtures
│   └── test-data.ts       # Realistic test data factory
├── helpers/               # Test utilities and helpers  
│   └── test-setup.ts      # Environment setup and utilities
├── global-setup.ts        # Global test initialization
├── global-teardown.ts     # Global test cleanup
└── test-results/          # Generated test reports
```

### Test Categories

#### 1. **Core System Tests** (`sop-core.test.ts`)
- ✅ Deployment script validation
- ✅ Database schema verification
- ✅ Frontend application loading
- ✅ Environment configuration validation
- ✅ Docker services configuration
- ✅ SOP piece structure validation  
- ✅ Documentation completeness
- ✅ File structure integrity

#### 2. **Template System Tests**
- ✅ Template data structure validation
- ✅ Step execution flow validation
- ✅ Business process templates (Onboarding, Security, Customer Service)

### Test Data Factory (`test-data.ts`)

**Realistic Business Scenarios:**
- **Employee Onboarding**: 7-step comprehensive process
- **IT Security Incident Response**: 8-step critical security workflow
- **Customer Service Escalation**: 6-step enterprise support process

**Performance Test Data:**
- Small dataset: 10 projects, 5 steps each
- Medium dataset: 100 projects, 8 steps each  
- Large dataset: 1000 projects, 12 steps each

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
```bash
# Node.js and npm
node --version  # Should be 20+
npm --version

# Playwright browsers
npx playwright install

# Docker (for service testing)
docker --version
docker-compose --version
```

### Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Test Environment**
   ```bash
   # Copy environment template
   cp .env.sop.example .env
   
   # Configure test-specific variables
   export TEST_BASE_URL=http://localhost:8080
   export TEST_API_URL=http://localhost:3000
   export TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/activepieces_sop_test
   ```

3. **Start Services** (Optional - for integration testing)
   ```bash
   # Deploy SOP Tool services
   ./deploy-sop.sh
   
   # Or start specific services
   docker-compose -f docker-compose.sop.yml up -d
   ```

## 🧪 Running Tests

### Basic Test Execution

```bash
# Run all E2E tests
npm run test:e2e:full

# Run core system tests only
npm run test:e2e:database

# Run UI tests only  
npm run test:e2e:ui

# Run API tests only
npm run test:e2e:api
```

### Advanced Test Options

```bash
# Run tests in specific browser
npm run test:e2e:ui -- --project=chromium

# Run tests with specific pattern
npm run test:e2e -- --grep="SOP Core"

# Run tests in headed mode (visible browser)
npm run test:e2e:ui -- --headed

# Run tests with debug output
npm run test:e2e -- --debug

# Run tests in CI mode
npm run test:e2e:ci
```

### Custom Test Execution

```bash
# Run specific test suite combinations
npx ts-node tests/run-e2e.ts --suites=database,api --browsers=chromium,firefox

# Run tests sequentially (non-parallel)
npx ts-node tests/run-e2e.ts --sequential

# Run performance tests
npx ts-node tests/run-e2e.ts --suites=performance --dataset=large
```

## 📊 Test Scenarios

### 1. Core System Validation

**What's Tested:**
- Project file structure integrity
- Environment configuration completeness  
- Docker Compose service definitions
- Database migration file existence
- Documentation file presence
- Deployment script functionality

**Sample Test:**
```typescript
test('should validate project structure integrity', async () => {
  const essentialFiles = [
    'package.json',
    'docker-compose.sop.yml', 
    'Dockerfile.sop',
    '.env.sop.example',
    'deploy-sop.sh'
  ];
  
  essentialFiles.forEach(file => {
    expect(TestSetup.fileExists(file)).toBe(true);
  });
});
```

### 2. Business Process Testing

**Employee Onboarding Workflow:**
- 7 sequential steps from workspace setup to first week check-in
- Role-based assignments (facilities, IT, HR, manager)
- Prerequisite validation and output verification
- Duration estimation and tracking

**IT Security Incident Response:**
- 8-step critical security workflow
- Time-sensitive containment and investigation phases
- Multi-stakeholder coordination (security, legal, forensics)
- Compliance tracking and evidence management

**Customer Service Escalation:**
- 6-step enterprise support process
- SLA compliance and priority handling
- Technical specialist engagement
- Customer communication and resolution validation

### 3. Template System Testing

**Template Categories:**
- Onboarding, IT, Security, Finance, HR, Operations
- Version control and change tracking
- Public/private template sharing
- Customization and parameterization

## 🔧 Test Utilities

### TestSetup Class (`test-setup.ts`)

**Core Functions:**
```typescript
// Environment management
await TestSetup.setupTestEnvironment()
await TestSetup.cleanupTestEnvironment()

// File system utilities  
TestSetup.fileExists('path/to/file')
TestSetup.readFile('relative/path')
TestSetup.executeCommand('bash script.sh')

// Docker integration
TestSetup.checkDockerServices()

// Project validation
TestSetup.validateProjectStructure()
```

### APITestClient Class

**HTTP Client for API Testing:**
```typescript
const client = new APITestClient('http://localhost:3000');
client.setAuthToken(token);

// CRUD operations
await client.get('/api/v1/sop/projects');
await client.post('/api/v1/sop/projects', projectData);
await client.put('/api/v1/sop/projects/123', updates);
await client.delete('/api/v1/sop/projects/123');

// Health checks
const isHealthy = await client.checkHealth();
```

### PerformanceTestUtils Class

**Performance Measurement:**
```typescript
// Time measurement
const { result, duration } = await PerformanceTestUtils.measureTime(() => 
  performExpensiveOperation()
);

// Concurrent execution
const results = await PerformanceTestUtils.runConcurrent(
  operations, 
  concurrency: 10
);

// Performance reporting
PerformanceTestUtils.generatePerformanceReport(
  'Database Operations', 
  operations: 1000, 
  totalTime: 5000
);
```

## 📈 Performance Benchmarks

### Expected Performance Targets

| Operation | Target Time | Max Concurrent |
|-----------|-------------|----------------|
| Project Creation | < 200ms | 50 |
| Step Update | < 100ms | 100 |
| Template Loading | < 500ms | 25 |
| Database Query | < 50ms | 200 |
| File Upload | < 1000ms | 10 |

### Load Testing Scenarios

```typescript
// Small scale testing
const smallData = TestDataFactory.createPerformanceTestData().small;
// 10 projects, 50 total steps

// Medium scale testing  
const mediumData = TestDataFactory.createPerformanceTestData().medium;
// 100 projects, 800 total steps

// Large scale testing
const largeData = TestDataFactory.createPerformanceTestData().large;
// 1000 projects, 12000 total steps
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Services Not Running**
```bash
# Check Docker services
docker-compose -f docker-compose.sop.yml ps

# Check API health
curl http://localhost:3000/health

# Check frontend
curl http://localhost:8080
```

#### 2. **Database Connection Issues**
```bash
# Verify PostgreSQL
docker-compose -f docker-compose.sop.yml logs postgres

# Test connection
docker-compose -f docker-compose.sop.yml exec postgres psql -U postgres -d activepieces_sop -c "SELECT version();"
```

#### 3. **Test Environment Issues**
```bash
# Reset test environment
npm run test:cleanup

# Reinstall Playwright browsers
npx playwright install --with-deps

# Clear test cache
rm -rf test-results/ playwright-report/
```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=pw:api npm run test:e2e

# Run specific test with trace
npm run test:e2e -- --trace on --grep "specific test"

# Run tests with video recording
npm run test:e2e -- --video on
```

## 📋 Test Reports

### Generated Reports

Tests generate comprehensive reports in multiple formats:

```bash
test-results/
├── html-report/           # Interactive HTML report
├── results.json          # Machine-readable results
├── coverage/             # Code coverage reports
└── screenshots/          # Failure screenshots
```

### Viewing Reports

```bash
# Open HTML report
npx playwright show-report

# View JSON results
cat test-results/results.json | jq '.stats'

# Check coverage
open test-results/coverage/lcov-report/index.html
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e:ci
        
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 🔄 Continuous Improvement

### Test Maintenance

1. **Regular Updates**
   - Update test data to reflect real business processes
   - Add new test scenarios for new features
   - Maintain browser compatibility matrix

2. **Performance Monitoring**
   - Track test execution times
   - Monitor flaky test patterns
   - Optimize slow-running tests

3. **Coverage Analysis**
   - Identify untested code paths
   - Add missing test scenarios
   - Remove redundant test cases

### Best Practices

✅ **DO:**
- Write tests that reflect real user workflows
- Use realistic test data from actual business processes
- Test error conditions and edge cases
- Maintain test independence and isolation
- Document test purpose and expected outcomes

❌ **DON'T:**
- Write tests that depend on external services
- Use hard-coded IDs or timestamps
- Skip cleanup in test teardown
- Write overly complex test assertions
- Ignore intermittently failing tests

## 📞 Support

### Getting Help

- **Documentation**: Check this guide and inline code comments
- **Issues**: Report test failures with logs and screenshots
- **Community**: Discuss testing strategies with the team
- **Debugging**: Use built-in debugging tools and trace functionality

### Contributing

When adding new tests:
1. Follow existing test patterns and naming conventions
2. Add appropriate test data to `test-data.ts`
3. Update this documentation for new test scenarios
4. Ensure tests pass in CI environment
5. Include performance benchmarks for new functionality

---

**This comprehensive E2E testing suite ensures the ActivePieces SOP Tool maintains high quality, reliability, and performance across all environments and use cases.**