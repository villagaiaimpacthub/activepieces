/**
 * SOP Testing Utilities
 * Comprehensive testing helpers, mock data generators, and validation utilities for SOP pieces
 */

import { logger } from './logger';
import { SOPValidator, ValidationResult } from './sop-validators';
import { SOPProcess, SOPStep, SOPExecutionContext, ProcessingResult } from './sop-process-utilities';
import { WorkflowState, ApprovalGate } from './sop-workflow-helpers';
import { ComplianceRule } from './sop-compliance-tools';

// Testing interfaces and types
export interface TestCase {
  id: string;
  name: string;
  description: string;
  test_type: 'unit' | 'integration' | 'end_to_end' | 'compliance' | 'performance';
  setup: TestSetup;
  input: TestInput;
  expected: TestExpectation;
  assertions: TestAssertion[];
  cleanup?: TestCleanup;
  metadata?: Record<string, any>;
}

export interface TestSetup {
  mock_data?: MockDataConfig;
  process_config?: Partial<SOPProcess>;
  execution_context?: Partial<SOPExecutionContext>;
  environment_vars?: Record<string, string>;
  prerequisites?: string[];
}

export interface TestInput {
  process_data?: any;
  step_data?: any;
  execution_data?: any;
  user_input?: any;
  external_data?: any;
}

export interface TestExpectation {
  success: boolean;
  validation_result?: Partial<ValidationResult>;
  processing_result?: Partial<ProcessingResult>;
  final_state?: any;
  side_effects?: any[];
  performance_metrics?: PerformanceExpectation;
}

export interface TestAssertion {
  type: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists' | 'matches_regex' | 'custom';
  field_path: string;
  expected_value?: any;
  custom_assertion?: (actual: any) => boolean;
  error_message?: string;
}

export interface TestCleanup {
  reset_state?: boolean;
  clear_mocks?: boolean;
  restore_environment?: boolean;
  custom_cleanup?: () => void;
}

export interface PerformanceExpectation {
  max_execution_time_ms?: number;
  max_memory_usage_mb?: number;
  min_throughput_per_second?: number;
}

export interface MockDataConfig {
  processes?: MockProcessConfig[];
  steps?: MockStepConfig[];
  users?: MockUserConfig[];
  approvals?: MockApprovalConfig[];
  external_services?: MockServiceConfig[];
}

export interface MockProcessConfig {
  id: string;
  name: string;
  status?: 'draft' | 'active' | 'archived';
  step_count?: number;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface MockStepConfig {
  id: string;
  type: string;
  configuration?: Record<string, any>;
  dependencies?: string[];
  approval_required?: boolean;
}

export interface MockUserConfig {
  id: string;
  role: string;
  permissions: string[];
  approval_authority?: string[];
}

export interface MockApprovalConfig {
  id: string;
  type: 'single' | 'multiple' | 'sequential';
  approvers: string[];
  timeout_hours?: number;
}

export interface MockServiceConfig {
  service_name: string;
  endpoints: MockEndpoint[];
  response_delay_ms?: number;
  error_rate?: number;
}

export interface MockEndpoint {
  path: string;
  method: string;
  response: any;
  status_code?: number;
}

export interface TestResult {
  test_case_id: string;
  success: boolean;
  duration_ms: number;
  assertions_passed: number;
  assertions_failed: number;
  error_message?: string;
  performance_metrics?: PerformanceMetrics;
  details: TestDetails;
}

export interface PerformanceMetrics {
  execution_time_ms: number;
  memory_usage_mb: number;
  throughput_per_second: number;
  cpu_usage_percent: number;
}

export interface TestDetails {
  setup_time_ms: number;
  execution_time_ms: number;
  cleanup_time_ms: number;
  assertion_results: AssertionResult[];
  mock_interactions: MockInteraction[];
  logs: string[];
}

export interface AssertionResult {
  assertion_type: string;
  field_path: string;
  expected: any;
  actual: any;
  passed: boolean;
  error_message?: string;
}

export interface MockInteraction {
  mock_type: string;
  mock_id: string;
  interaction_type: string;
  data: any;
  timestamp: Date;
}

/**
 * SOP Testing Utilities Class
 */
export class SOPTestingUtilities {
  private static mockData = new Map<string, any>();
  private static testResults = new Map<string, TestResult>();
  private static activeTests = new Set<string>();
  private static mockInteractions: MockInteraction[] = [];

  /**
   * Creates comprehensive test suite for SOP process
   */
  static createTestSuite(
    processName: string,
    processConfig: Partial<SOPProcess>
  ): TestCase[] {
    const testSuite: TestCase[] = [];
    const baseId = this.generateId();

    // Unit tests for process validation
    testSuite.push({
      id: `${baseId}_validation`,
      name: `${processName} - Process Validation`,
      description: 'Tests process structure and validation rules',
      test_type: 'unit',
      setup: {
        process_config: processConfig
      },
      input: {
        process_data: processConfig
      },
      expected: {
        success: true,
        validation_result: {
          isValid: true,
          errors: []
        }
      },
      assertions: [
        {
          type: 'equals',
          field_path: 'validation_result.isValid',
          expected_value: true,
          error_message: 'Process validation should pass'
        }
      ]
    });

    // Integration tests for step execution
    if (processConfig.steps) {
      processConfig.steps.forEach((step, index) => {
        testSuite.push({
          id: `${baseId}_step_${index}`,
          name: `${processName} - Step ${index + 1} Execution`,
          description: `Tests execution of step: ${step.name}`,
          test_type: 'integration',
          setup: {
            mock_data: {
              processes: [{ id: processConfig.id!, name: processName }],
              steps: [{
                id: step.id,
                type: step.step_type,
                configuration: step.configuration
              }]
            },
            execution_context: {
              process_id: processConfig.id,
              step_id: step.id
            }
          },
          input: {
            step_data: step,
            execution_data: {}
          },
          expected: {
            success: true,
            processing_result: {
              success: true
            }
          },
          assertions: [
            {
              type: 'equals',
              field_path: 'processing_result.success',
              expected_value: true,
              error_message: 'Step execution should succeed'
            }
          ]
        });
      });
    }

    // End-to-end workflow test
    testSuite.push({
      id: `${baseId}_e2e_workflow`,
      name: `${processName} - End-to-End Workflow`,
      description: 'Tests complete workflow execution from start to finish',
      test_type: 'end_to_end',
      setup: {
        mock_data: {
          processes: [{ id: processConfig.id!, name: processName, status: 'active' }],
          users: [{
            id: 'test_user_1',
            role: 'process_executor',
            permissions: ['execute_process', 'approve_steps']
          }]
        }
      },
      input: {
        process_data: processConfig,
        user_input: { user_id: 'test_user_1' }
      },
      expected: {
        success: true,
        final_state: {
          status: 'completed'
        }
      },
      assertions: [
        {
          type: 'equals',
          field_path: 'final_state.status',
          expected_value: 'completed',
          error_message: 'Workflow should complete successfully'
        }
      ]
    });

    // Compliance test
    testSuite.push({
      id: `${baseId}_compliance`,
      name: `${processName} - Compliance Check`,
      description: 'Tests process compliance with organizational rules',
      test_type: 'compliance',
      setup: {
        process_config: processConfig
      },
      input: {
        process_data: processConfig
      },
      expected: {
        success: true,
        validation_result: {
          isValid: true
        }
      },
      assertions: [
        {
          type: 'greater_than',
          field_path: 'compliance_result.score',
          expected_value: 80,
          error_message: 'Compliance score should be above 80'
        }
      ]
    });

    logger.info(`Created test suite with ${testSuite.length} test cases for ${processName}`);
    return testSuite;
  }

  /**
   * Generates mock SOP process data
   */
  static generateMockSOPProcess(
    name: string,
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): SOPProcess {
    const processId = this.generateId();
    
    const stepCounts = {
      simple: 3,
      medium: 7,
      complex: 12
    };
    
    const stepCount = stepCounts[complexity];
    const steps: SOPStep[] = [];
    
    // Generate steps based on complexity
    for (let i = 0; i < stepCount; i++) {
      const stepType = this.selectRandomStepType(complexity);
      const stepConfig = this.generateStepConfiguration(stepType);
      
      steps.push({
        id: `step_${processId}_${i}`,
        project_id: processId,
        name: `${stepType.replace('_', ' ').toUpperCase()} Step ${i + 1}`,
        description: `Mock ${stepType} step for testing purposes`,
        step_type: stepType,
        configuration: stepConfig,
        position: i,
        parent_step_id: i > 0 ? `step_${processId}_${i - 1}` : undefined,
        is_active: true
      });
    }
    
    const mockProcess: SOPProcess = {
      id: processId,
      name: `Mock ${name} Process`,
      description: `Generated mock process for ${complexity} complexity testing`,
      steps,
      status: 'active',
      version: 1,
      metadata: {
        generated_for_testing: true,
        complexity,
        generated_at: new Date().toISOString()
      }
    };
    
    // Store mock data
    this.mockData.set(processId, mockProcess);
    
    logger.info(`Generated mock SOP process: ${name}`, {
      process_id: processId,
      step_count: stepCount,
      complexity
    });
    
    return mockProcess;
  }

  /**
   * Generates mock execution context
   */
  static generateMockExecutionContext(
    processId: string,
    userId?: string
  ): SOPExecutionContext {
    return {
      process_id: processId,
      execution_id: this.generateId(),
      user_id: userId || `test_user_${Date.now()}`,
      status: 'pending',
      input_data: this.generateMockInputData(),
      metadata: {
        generated_for_testing: true,
        created_at: new Date().toISOString()
      }
    };
  }

  /**
   * Generates mock approval gate
   */
  static generateMockApprovalGate(
    stepId: string,
    executionId: string,
    approvalType: 'single' | 'multiple' | 'sequential' = 'single'
  ): ApprovalGate {
    const approvers = this.generateMockApprovers(approvalType);
    
    return {
      id: this.generateId(),
      step_id: stepId,
      execution_id: executionId,
      approval_type: approvalType,
      required_approvers: approvers,
      current_approvers: [],
      approval_data: {
        generated_for_testing: true,
        approval_requirements: {
          documentation_required: true,
          justification_required: approvalType !== 'single'
        }
      },
      status: 'pending',
      timeout_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      created_at: new Date()
    };
  }

  /**
   * Generates mock compliance rules
   */
  static generateMockComplianceRules(): ComplianceRule[] {
    const rules: ComplianceRule[] = [
      {
        id: this.generateId(),
        name: 'Test Required Approvals Rule',
        description: 'Ensures critical steps have approvals for testing',
        type: 'required_approvals',
        severity: 'high',
        category: 'governance',
        configuration: {
          minimum_approvals: 1,
          critical_step_types: ['approval', 'data_modification']
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: this.generateId(),
        name: 'Test Documentation Rule',
        description: 'Ensures proper documentation for testing',
        type: 'step_documentation',
        severity: 'medium',
        category: 'operational',
        configuration: {
          minimum_description_length: 5,
          required_fields: ['description']
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    return rules;
  }

  /**
   * Runs a single test case
   */
  static async runTestCase(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    this.activeTests.add(testCase.id);
    
    const testResult: TestResult = {
      test_case_id: testCase.id,
      success: false,
      duration_ms: 0,
      assertions_passed: 0,
      assertions_failed: 0,
      details: {
        setup_time_ms: 0,
        execution_time_ms: 0,
        cleanup_time_ms: 0,
        assertion_results: [],
        mock_interactions: [],
        logs: []
      }
    };
    
    try {
      logger.info(`Running test case: ${testCase.name}`, { test_id: testCase.id });
      
      // Setup phase
      const setupStart = Date.now();
      await this.setupTest(testCase.setup);
      testResult.details.setup_time_ms = Date.now() - setupStart;
      
      // Execution phase
      const executionStart = Date.now();
      const executionResult = await this.executeTest(testCase);
      testResult.details.execution_time_ms = Date.now() - executionStart;
      
      // Assertions phase
      const assertionResults = await this.runAssertions(
        testCase.assertions,
        executionResult
      );
      testResult.details.assertion_results = assertionResults;
      
      // Calculate results
      testResult.assertions_passed = assertionResults.filter(r => r.passed).length;
      testResult.assertions_failed = assertionResults.filter(r => !r.passed).length;
      testResult.success = testResult.assertions_failed === 0;
      
      // Performance metrics
      if (testCase.expected.performance_metrics) {
        testResult.performance_metrics = this.calculatePerformanceMetrics(
          testResult.details.execution_time_ms
        );
        
        // Check performance expectations
        const perfExpected = testCase.expected.performance_metrics;
        if (perfExpected.max_execution_time_ms && 
            testResult.performance_metrics.execution_time_ms > perfExpected.max_execution_time_ms) {
          testResult.success = false;
          testResult.error_message = 'Performance expectation failed: execution time exceeded';
        }
      }
      
      // Cleanup phase
      const cleanupStart = Date.now();
      if (testCase.cleanup) {
        await this.cleanupTest(testCase.cleanup);
      }
      testResult.details.cleanup_time_ms = Date.now() - cleanupStart;
      
    } catch (error) {
      testResult.success = false;
      testResult.error_message = error instanceof Error ? error.message : 'Unknown test error';
      logger.error('Test case execution failed', { 
        test_id: testCase.id, 
        error: testResult.error_message 
      });
    } finally {
      this.activeTests.delete(testCase.id);
      testResult.duration_ms = Date.now() - startTime;
      this.testResults.set(testCase.id, testResult);
    }
    
    logger.info(`Test case completed: ${testCase.name}`, {
      test_id: testCase.id,
      success: testResult.success,
      duration_ms: testResult.duration_ms
    });
    
    return testResult;
  }

  /**
   * Runs multiple test cases
   */
  static async runTestSuite(testCases: TestCase[]): Promise<TestResult[]> {
    logger.info(`Running test suite with ${testCases.length} test cases`);
    
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await this.runTestCase(testCase);
      results.push(result);
      
      // Short delay between tests to avoid resource conflicts
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;
    
    logger.info(`Test suite completed`, {
      total_tests: results.length,
      passed,
      failed,
      success_rate: Math.round((passed / results.length) * 100)
    });
    
    return results;
  }

  /**
   * Sets up test environment
   */
  private static async setupTest(setup: TestSetup): Promise<void> {
    // Setup mock data
    if (setup.mock_data) {
      await this.setupMockData(setup.mock_data);
    }
    
    // Setup environment variables
    if (setup.environment_vars) {
      Object.entries(setup.environment_vars).forEach(([key, value]) => {
        process.env[key] = value;
      });
    }
    
    // Check prerequisites
    if (setup.prerequisites) {
      for (const prerequisite of setup.prerequisites) {
        await this.checkPrerequisite(prerequisite);
      }
    }
  }

  /**
   * Executes test case
   */
  private static async executeTest(testCase: TestCase): Promise<any> {
    switch (testCase.test_type) {
      case 'unit':
        return this.executeUnitTest(testCase);
      case 'integration':
        return this.executeIntegrationTest(testCase);
      case 'end_to_end':
        return this.executeE2ETest(testCase);
      case 'compliance':
        return this.executeComplianceTest(testCase);
      case 'performance':
        return this.executePerformanceTest(testCase);
      default:
        throw new Error(`Unknown test type: ${testCase.test_type}`);
    }
  }

  /**
   * Executes unit test
   */
  private static async executeUnitTest(testCase: TestCase): Promise<any> {
    // Execute validation or processing function
    if (testCase.input.process_data) {
      const validationResult = SOPValidator.validateSOPProcess(testCase.input.process_data);
      return { validation_result: validationResult };
    }
    
    return { success: true };
  }

  /**
   * Executes integration test
   */
  private static async executeIntegrationTest(testCase: TestCase): Promise<any> {
    // Simulate step execution
    if (testCase.input.step_data && testCase.setup.execution_context) {
      const context = this.generateMockExecutionContext(
        testCase.setup.execution_context.process_id!,
        testCase.setup.execution_context.user_id
      );
      
      // Mock step execution
      const processingResult = {
        success: true,
        data: { step_executed: true, step_id: testCase.input.step_data.id }
      };
      
      return { processing_result: processingResult };
    }
    
    return { success: true };
  }

  /**
   * Executes end-to-end test
   */
  private static async executeE2ETest(testCase: TestCase): Promise<any> {
    // Simulate complete workflow execution
    const workflowState: WorkflowState = {
      execution_id: this.generateId(),
      process_id: testCase.input.process_data.id,
      status: 'completed',
      data: { workflow_completed: true },
      metadata: { test_execution: true },
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return { final_state: workflowState };
  }

  /**
   * Executes compliance test
   */
  private static async executeComplianceTest(testCase: TestCase): Promise<any> {
    // Mock compliance check
    const complianceResult = {
      isCompliant: true,
      violations: [],
      score: 95,
      auditTrail: []
    };
    
    return { compliance_result: complianceResult };
  }

  /**
   * Executes performance test
   */
  private static async executePerformanceTest(testCase: TestCase): Promise<any> {
    const startTime = Date.now();
    
    // Simulate workload
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const executionTime = Date.now() - startTime;
    
    return {
      performance_metrics: {
        execution_time_ms: executionTime,
        memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024
      }
    };
  }

  /**
   * Runs assertions against test result
   */
  private static async runAssertions(
    assertions: TestAssertion[],
    executionResult: any
  ): Promise<AssertionResult[]> {
    const results: AssertionResult[] = [];
    
    for (const assertion of assertions) {
      const result = await this.runSingleAssertion(assertion, executionResult);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Runs single assertion
   */
  private static async runSingleAssertion(
    assertion: TestAssertion,
    executionResult: any
  ): Promise<AssertionResult> {
    const actual = this.getValueByPath(executionResult, assertion.field_path);
    let passed = false;
    let errorMessage: string | undefined;
    
    try {
      switch (assertion.type) {
        case 'equals':
          passed = actual === assertion.expected_value;
          break;
        case 'not_equals':
          passed = actual !== assertion.expected_value;
          break;
        case 'contains':
          passed = String(actual).includes(String(assertion.expected_value));
          break;
        case 'not_contains':
          passed = !String(actual).includes(String(assertion.expected_value));
          break;
        case 'greater_than':
          passed = Number(actual) > Number(assertion.expected_value);
          break;
        case 'less_than':
          passed = Number(actual) < Number(assertion.expected_value);
          break;
        case 'exists':
          passed = actual !== undefined && actual !== null;
          break;
        case 'not_exists':
          passed = actual === undefined || actual === null;
          break;
        case 'matches_regex':
          passed = new RegExp(assertion.expected_value).test(String(actual));
          break;
        case 'custom':
          if (assertion.custom_assertion) {
            passed = assertion.custom_assertion(actual);
          }
          break;
        default:
          passed = false;
          errorMessage = `Unknown assertion type: ${assertion.type}`;
      }
      
      if (!passed && !errorMessage) {
        errorMessage = assertion.error_message || 
          `Assertion failed: ${assertion.field_path} ${assertion.type} ${assertion.expected_value}`;
      }
    } catch (error) {
      passed = false;
      errorMessage = `Assertion execution error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    
    return {
      assertion_type: assertion.type,
      field_path: assertion.field_path,
      expected: assertion.expected_value,
      actual,
      passed,
      error_message: errorMessage
    };
  }

  /**
   * Helper methods
   */
  private static selectRandomStepType(complexity: string): string {
    const stepTypes = {
      simple: ['data_processing', 'notification'],
      medium: ['data_processing', 'notification', 'approval', 'conditional'],
      complex: ['data_processing', 'notification', 'approval', 'conditional', 'integration', 'custom']
    };
    
    const types = stepTypes[complexity as keyof typeof stepTypes];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static generateStepConfiguration(stepType: string): Record<string, any> {
    const configs = {
      data_processing: {
        transformations: [{ type: 'map_field', source_field: 'input', target_field: 'output' }]
      },
      notification: {
        notification_type: 'email',
        subject: 'Test Notification',
        message: 'Test message'
      },
      approval: {
        approval_type: 'single',
        required_approvers: ['test_approver_1']
      },
      conditional: {
        conditions: [{ field: 'status', operator: 'equals', value: 'ready' }]
      },
      integration: {
        integration_type: 'webhook',
        endpoint: 'https://test.example.com/webhook'
      }
    };
    
    return configs[stepType as keyof typeof configs] || {};
  }

  private static generateMockInputData(): Record<string, any> {
    return {
      user_input: 'test_input',
      status: 'ready',
      priority: 'high',
      data: { test: true },
      timestamp: new Date().toISOString()
    };
  }

  private static generateMockApprovers(approvalType: string): string[] {
    switch (approvalType) {
      case 'single':
        return ['test_approver_1'];
      case 'multiple':
        return ['test_approver_1', 'test_approver_2'];
      case 'sequential':
        return ['test_approver_1', 'test_approver_2', 'test_approver_3'];
      default:
        return ['test_approver_1'];
    }
  }

  private static async setupMockData(mockData: MockDataConfig): Promise<void> {
    // Setup mock processes
    if (mockData.processes) {
      mockData.processes.forEach(process => {
        this.mockData.set(`process_${process.id}`, process);
      });
    }
    
    // Setup mock users
    if (mockData.users) {
      mockData.users.forEach(user => {
        this.mockData.set(`user_${user.id}`, user);
      });
    }
    
    // Record mock interactions
    this.mockInteractions.push({
      mock_type: 'data_setup',
      mock_id: 'global',
      interaction_type: 'setup',
      data: mockData,
      timestamp: new Date()
    });
  }

  private static async checkPrerequisite(prerequisite: string): Promise<void> {
    // Check if prerequisite is met
    // This is a placeholder - implement actual prerequisite checks
    logger.debug(`Checking prerequisite: ${prerequisite}`);
  }

  private static async cleanupTest(cleanup: TestCleanup): Promise<void> {
    if (cleanup.reset_state) {
      // Reset application state
    }
    
    if (cleanup.clear_mocks) {
      this.mockData.clear();
      this.mockInteractions = [];
    }
    
    if (cleanup.restore_environment) {
      // Restore original environment variables
    }
    
    if (cleanup.custom_cleanup) {
      cleanup.custom_cleanup();
    }
  }

  private static calculatePerformanceMetrics(executionTimeMs: number): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      execution_time_ms: executionTimeMs,
      memory_usage_mb: memUsage.heapUsed / 1024 / 1024,
      throughput_per_second: executionTimeMs > 0 ? 1000 / executionTimeMs : 0,
      cpu_usage_percent: 0 // Would need actual CPU monitoring
    };
  }

  private static getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public utility methods
   */
  
  /**
   * Gets test result by ID
   */
  static getTestResult(testId: string): TestResult | undefined {
    return this.testResults.get(testId);
  }

  /**
   * Gets all test results
   */
  static getAllTestResults(): TestResult[] {
    return Array.from(this.testResults.values());
  }

  /**
   * Gets mock data by ID
   */
  static getMockData(mockId: string): any {
    return this.mockData.get(mockId);
  }

  /**
   * Clears all test data
   */
  static clearAllTestData(): void {
    this.mockData.clear();
    this.testResults.clear();
    this.activeTests.clear();
    this.mockInteractions = [];
    logger.info('All test data cleared');
  }

  /**
   * Gets test summary
   */
  static getTestSummary(): {
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    success_rate: number;
    active_tests: number;
  } {
    const results = Array.from(this.testResults.values());
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    return {
      total_tests: total,
      passed_tests: passed,
      failed_tests: total - passed,
      success_rate: total > 0 ? Math.round((passed / total) * 100) : 0,
      active_tests: this.activeTests.size
    };
  }
}
