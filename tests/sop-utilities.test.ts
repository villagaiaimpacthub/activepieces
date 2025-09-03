/**
 * SOP Utilities Test Suite
 * Comprehensive tests for all SOP utility functions and validators
 */

import {
  SOPValidator,
  SOPProcessUtilities,
  SOPWorkflowHelpers,
  SOPComplianceTools,
  SOPTestingUtilities,
  SOPActivepiecesIntegration,
  initializeSOPUtilities,
  getSOPUtilitiesHealth,
  ValidationResult,
  ProcessingResult,
  ComplianceResult
} from '../src/backend/utils';

describe('SOP Utilities Integration Tests', () => {
  beforeAll(() => {
    // Initialize utilities before running tests
    initializeSOPUtilities();
  });

  describe('SOP Validator', () => {
    test('should validate valid SOP process', () => {
      const validProcess = {
        project: {
          name: 'Test Process',
          description: 'Test description',
          status: 'draft' as const,
          version: 1
        },
        steps: [
          {
            id: 'step-1',
            project_id: 'project-1',
            name: 'Test Step',
            description: 'Test step description',
            step_type: 'data_processing',
            position: 0,
            is_active: true
          }
        ]
      };

      const result = SOPValidator.validateSOPProcess(validProcess);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid SOP process', () => {
      const invalidProcess = {
        project: {
          name: '', // Invalid: empty name
          status: 'invalid_status' as any
        },
        steps: [] // Invalid: no steps
      };

      const result = SOPValidator.validateSOPProcess(invalidProcess);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('SOP Process Utilities', () => {
    test('should parse valid SOP process', () => {
      const processData = {
        id: 'process-1',
        name: 'Test Process',
        description: 'Test process description',
        steps: [
          {
            id: 'step-1',
            name: 'Step 1',
            step_type: 'data_processing',
            position: 0
          },
          {
            id: 'step-2',
            name: 'Step 2',
            step_type: 'approval',
            position: 1,
            parent_step_id: 'step-1'
          }
        ]
      };

      const result = SOPProcessUtilities.parseSOPProcess(processData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.process.steps).toHaveLength(2);
      expect(result.data.execution_order).toContain('step-1');
      expect(result.data.execution_order).toContain('step-2');
    });

    test('should transform JSON to Activepieces format', () => {
      const jsonData = {
        name: 'Test Process',
        description: 'Test description',
        version: 1,
        steps: [
          {
            id: 'step-1',
            name: 'Process Data',
            step_type: 'data_processing',
            configuration: {
              transformations: [{ type: 'map_field', source_field: 'input', target_field: 'output' }]
            }
          }
        ]
      };

      const result = SOPProcessUtilities.transformSOPData(
        jsonData,
        'json',
        'activepieces'
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.displayName).toBe('Test Process');
      expect(result.data.actions).toBeDefined();
    });

    test('should execute SOP step successfully', async () => {
      const step = {
        id: 'step-1',
        project_id: 'project-1',
        name: 'Test Step',
        step_type: 'data_processing',
        configuration: {
          transformations: [{ type: 'map_field', source_field: 'input', target_field: 'output' }]
        },
        position: 0,
        is_active: true
      };

      const context = SOPProcessUtilities.createExecutionContext('project-1', 'user-1');
      const inputData = { input: 'test_value' };

      const result = await SOPProcessUtilities.executeSOPStep(step, context, inputData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('SOP Workflow Helpers', () => {
    test('should initialize workflow correctly', () => {
      const processId = 'process-1';
      const userId = 'user-1';
      const initialData = { test: 'data' };

      const workflowState = SOPWorkflowHelpers.initializeWorkflow(
        processId,
        userId,
        initialData
      );
      
      expect(workflowState.process_id).toBe(processId);
      expect(workflowState.status).toBe('initialized');
      expect(workflowState.data).toEqual(initialData);
      expect(workflowState.metadata.initiated_by).toBe(userId);
    });

    test('should advance workflow to next step', async () => {
      const processId = 'process-1';
      const workflowState = SOPWorkflowHelpers.initializeWorkflow(processId, 'user-1');
      const nextStepId = 'step-2';

      const result = await SOPWorkflowHelpers.advanceWorkflow(
        workflowState.execution_id,
        nextStepId
      );
      
      expect(result.success).toBe(true);
      expect(result.data?.current_step_id).toBe(nextStepId);
      expect(result.data?.status).toBe('running');
    });

    test('should process approval gate', async () => {
      const approvalGateId = 'approval-1';
      const approverId = 'approver-1';
      
      // First create an approval gate through workflow helpers
      const processId = 'process-1';
      const workflowState = SOPWorkflowHelpers.initializeWorkflow(processId);
      
      // Create a mock approval decision
      const decision = {
        id: 'decision-1',
        step_id: 'step-1',
        decision_type: 'approval' as const,
        decision_data: {
          approval_type: 'single',
          required_approvers: [approverId]
        },
        result: 'approved' as const,
        timestamp: new Date()
      };

      const context = {
        execution_id: workflowState.execution_id,
        process_id: processId,
        user_id: 'user-1',
        status: 'running' as const
      };

      // Handle the approval decision first to create approval gate
      const decisionResult = await SOPWorkflowHelpers.handleSOPDecision(
        decision,
        context,
        []
      );
      
      expect(decisionResult.success).toBe(true);
      expect(decisionResult.metadata?.requires_approval).toBe(true);
    });
  });

  describe('SOP Compliance Tools', () => {
    test('should perform compliance audit', async () => {
      const processId = 'process-1';
      
      const result = await SOPComplianceTools.auditSOPExecution(processId);
      
      expect(result.isCompliant).toBeDefined();
      expect(result.violations).toBeInstanceOf(Array);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.auditTrail).toBeInstanceOf(Array);
    });

    test('should log audit entries', () => {
      const processId = 'process-1';
      const executionId = 'execution-1';
      const stepId = 'step-1';
      const action = 'step_executed';
      
      // Should not throw
      expect(() => {
        SOPComplianceTools.logAudit(
          processId,
          executionId,
          stepId,
          action,
          'step',
          stepId,
          { test: 'metadata' }
        );
      }).not.toThrow();
      
      const auditLogs = SOPComplianceTools.getAuditLogs(processId, executionId, stepId);
      expect(auditLogs.length).toBeGreaterThan(0);
      
      const latestLog = auditLogs[0];
      expect(latestLog.action).toBe(action);
      expect(latestLog.process_id).toBe(processId);
      expect(latestLog.execution_id).toBe(executionId);
      expect(latestLog.step_id).toBe(stepId);
    });

    test('should generate compliance report', () => {
      const reportType = 'process';
      const scope = {
        process_ids: ['process-1'],
        date_from: new Date(Date.now() - 24 * 60 * 60 * 1000),
        date_to: new Date()
      };

      const report = SOPComplianceTools.generateComplianceReport(
        reportType,
        scope,
        'test-user'
      );
      
      expect(report.report_type).toBe(reportType);
      expect(report.scope).toEqual(scope);
      expect(report.summary).toBeDefined();
      expect(report.violations).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.generated_by).toBe('test-user');
    });
  });

  describe('SOP Testing Utilities', () => {
    test('should generate mock SOP process', () => {
      const processName = 'Test Process';
      const complexity = 'medium';
      
      const mockProcess = SOPTestingUtilities.generateMockSOPProcess(
        processName,
        complexity
      );
      
      expect(mockProcess.name).toContain(processName);
      expect(mockProcess.steps.length).toBeGreaterThan(0);
      expect(mockProcess.metadata?.complexity).toBe(complexity);
      expect(mockProcess.metadata?.generated_for_testing).toBe(true);
    });

    test('should create comprehensive test suite', () => {
      const processName = 'Test Process';
      const processConfig = {
        id: 'process-1',
        name: processName,
        steps: [
          {
            id: 'step-1',
            project_id: 'process-1',
            name: 'Test Step',
            step_type: 'data_processing',
            position: 0,
            is_active: true
          }
        ]
      };
      
      const testSuite = SOPTestingUtilities.createTestSuite(
        processName,
        processConfig
      );
      
      expect(testSuite.length).toBeGreaterThan(0);
      
      // Check that we have different types of tests
      const testTypes = testSuite.map(test => test.test_type);
      expect(testTypes).toContain('unit');
      expect(testTypes).toContain('integration');
      expect(testTypes).toContain('end_to_end');
      expect(testTypes).toContain('compliance');
    });

    test('should run test case successfully', async () => {
      const testCase = {
        id: 'test-1',
        name: 'Sample Test',
        description: 'A sample test case',
        test_type: 'unit' as const,
        setup: {},
        input: {
          process_data: {
            project: {
              name: 'Test Process',
              status: 'draft' as const
            },
            steps: []
          }
        },
        expected: {
          success: true
        },
        assertions: [
          {
            type: 'equals' as const,
            field_path: 'validation_result.isValid',
            expected_value: true,
            error_message: 'Validation should pass'
          }
        ]
      };
      
      const result = await SOPTestingUtilities.runTestCase(testCase);
      
      expect(result.test_case_id).toBe(testCase.id);
      expect(result.duration_ms).toBeGreaterThan(0);
      expect(result.details.assertion_results).toBeInstanceOf(Array);
    });
  });

  describe('SOP Activepieces Integration', () => {
    test('should convert SOP to Activepieces piece', () => {
      const sopConfig = {
        name: 'Test SOP Piece',
        version: '1.0.0',
        description: 'Test SOP piece for integration',
        process: {
          id: 'process-1',
          name: 'Test Process',
          description: 'Test process description',
          steps: [
            {
              id: 'step-1',
              project_id: 'process-1',
              name: 'Data Processing Step',
              description: 'Processes data',
              step_type: 'data_processing',
              configuration: {
                transformations: [
                  { type: 'map_field', source_field: 'input', target_field: 'output' }
                ]
              },
              position: 0,
              is_active: true
            },
            {
              id: 'step-2',
              project_id: 'process-1',
              name: 'Notification Step',
              description: 'Sends notification',
              step_type: 'notification',
              configuration: {
                notification_type: 'email',
                message: 'Process completed'
              },
              position: 1,
              is_active: true
            }
          ],
          status: 'active' as const,
          version: 1
        }
      };
      
      const result = SOPActivepiecesIntegration.convertSOPToActivepiecesPiece(sopConfig);
      
      expect(result.success).toBe(true);
      expect(result.piece_definition).toBeDefined();
      expect(result.piece_definition?.displayName).toBe(sopConfig.name);
      expect(result.piece_definition?.description).toBe(sopConfig.description);
      expect(result.piece_definition?.version).toBe(sopConfig.version);
      
      // Check that actions were created
      expect(Object.keys(result.piece_definition?.actions || {})).toContain('data_processing_step');
      expect(Object.keys(result.piece_definition?.actions || {})).toContain('notification_step');
      
      // Check generated files
      expect(result.generated_files?.length).toBeGreaterThan(0);
      
      const mainFile = result.generated_files?.find(f => f.filename.includes('test-sop-piece.ts'));
      expect(mainFile).toBeDefined();
      expect(mainFile?.type).toBe('typescript');
    });

    test('should validate SOP for conversion', () => {
      const invalidConfig = {
        name: '', // Invalid: empty name
        version: '1.0.0',
        description: 'Test',
        process: {
          id: 'process-1',
          name: 'Test Process',
          steps: [], // Invalid: no steps
          status: 'active' as const,
          version: 1
        }
      };
      
      const result = SOPActivepiecesIntegration.convertSOPToActivepiecesPiece(invalidConfig);
      
      expect(result.success).toBe(false);
      expect(result.validation_errors?.length).toBeGreaterThan(0);
    });
  });

  describe('System Health and Statistics', () => {
    test('should return system health status', () => {
      const health = getSOPUtilitiesHealth();
      
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
      expect(health.services).toBeDefined();
      expect(health.timestamp).toBeDefined();
      expect(typeof health.services.validator).toBe('boolean');
      expect(typeof health.services.process_utilities).toBe('boolean');
      expect(typeof health.services.workflow_helpers).toBe('boolean');
    });

    test('should return usage statistics', () => {
      // First generate some test data
      const processName = 'Stats Test Process';
      SOPTestingUtilities.generateMockSOPProcess(processName, 'simple');
      SOPWorkflowHelpers.initializeWorkflow('stats-process-1', 'stats-user-1');
      
      const { getSOPUtilitiesStats } = require('../src/backend/utils');
      const stats = getSOPUtilitiesStats();
      
      expect(stats.workflow_stats).toBeDefined();
      expect(stats.testing_stats).toBeDefined();
      expect(stats.compliance_stats).toBeDefined();
      
      expect(typeof stats.workflow_stats.active_workflows).toBe('number');
      expect(typeof stats.testing_stats.total_tests).toBe('number');
      expect(typeof stats.compliance_stats.active_rules).toBe('number');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid process data gracefully', () => {
      const invalidData = null;
      
      const result = SOPValidator.validateSOPProcess(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing execution context', async () => {
      const step = {
        id: 'step-1',
        project_id: 'project-1',
        name: 'Test Step',
        step_type: 'data_processing',
        position: 0,
        is_active: true
      };

      const invalidContext = null as any;
      
      await expect(
        SOPProcessUtilities.executeSOPStep(step, invalidContext)
      ).resolves.toBeDefined(); // Should handle gracefully, not throw
    });

    test('should handle workflow state not found', async () => {
      const nonExistentExecutionId = 'non-existent-execution-id';
      
      const result = await SOPWorkflowHelpers.advanceWorkflow(
        nonExistentExecutionId,
        'next-step'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent workflows', async () => {
      const numWorkflows = 10;
      const workflows = [];
      
      // Create multiple workflows concurrently
      for (let i = 0; i < numWorkflows; i++) {
        const workflow = SOPWorkflowHelpers.initializeWorkflow(
          `process-${i}`,
          `user-${i}`,
          { test: `data-${i}` }
        );
        workflows.push(workflow);
      }
      
      expect(workflows.length).toBe(numWorkflows);
      
      // Verify all workflows were created with unique IDs
      const executionIds = workflows.map(w => w.execution_id);
      const uniqueIds = new Set(executionIds);
      expect(uniqueIds.size).toBe(numWorkflows);
      
      // Check active workflows count
      const activeWorkflows = SOPWorkflowHelpers.getActiveWorkflows();
      expect(activeWorkflows.length).toBeGreaterThanOrEqual(numWorkflows);
    });

    test('should handle large test suites efficiently', async () => {
      const startTime = Date.now();
      
      // Create a larger process with more steps
      const complexProcess = {
        id: 'complex-process',
        name: 'Complex Test Process',
        steps: Array.from({ length: 20 }, (_, i) => ({
          id: `step-${i}`,
          project_id: 'complex-process',
          name: `Step ${i + 1}`,
          step_type: i % 4 === 0 ? 'approval' : 'data_processing',
          position: i,
          is_active: true
        }))
      };
      
      const testSuite = SOPTestingUtilities.createTestSuite(
        'Complex Process',
        complexProcess
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(testSuite.length).toBeGreaterThan(20); // Should create tests for all steps plus process-level tests
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});