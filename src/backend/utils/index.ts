/**
 * SOP Utilities Index
 * Central export file for all SOP utility functions and validators
 */

// Core validation system
export {
  SOPValidator,
  ValidationResult,
  ComplianceResult,
  ComplianceViolation,
  AuditEntry,
  sopProjectSchema,
  sopStepSchema,
  sopTemplateSchema,
  sopExecutionContextSchema,
  sopDecisionSchema
} from './sop-validators';

// Process utilities
export {
  SOPProcessUtilities,
  SOPProcess,
  SOPStep,
  SOPExecutionContext,
  SOPDecision,
  ProcessingResult
} from './sop-process-utilities';

// Workflow management helpers
export {
  SOPWorkflowHelpers,
  WorkflowState,
  ApprovalGate,
  DecisionRoute,
  WorkflowTransition
} from './sop-workflow-helpers';

// Compliance tools
export {
  SOPComplianceTools,
  ComplianceRule,
  ComplianceCheck,
  AuditLog,
  ComplianceReport
} from './sop-compliance-tools';

// Testing utilities
export {
  SOPTestingUtilities,
  TestCase,
  TestSetup,
  TestInput,
  TestExpectation,
  TestAssertion,
  TestResult,
  MockDataConfig
} from './sop-testing-utilities';

// Activepieces integration
export {
  SOPActivepiecesIntegration,
  ActivepiecesProperty,
  ActivepiecesAction,
  ActivepiecesTrigger,
  ActivepiecesContext,
  ActivepiecesPieceDefinition,
  SOPPieceConfig,
  PieceGenerationResult
} from './sop-activepieces-integration';

// Logger utility
export { logger } from './logger';

/**
 * Utility function to initialize all SOP utilities
 */
export function initializeSOPUtilities(): void {
  // Initialize compliance rules
  SOPComplianceTools.initializeDefaultRules();
  
  console.log('SOP Utilities initialized successfully');
}

/**
 * Utility function to get system health status
 */
export function getSOPUtilitiesHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, boolean>;
  timestamp: string;
} {
  const services = {
    validator: true, // SOPValidator is stateless
    process_utilities: true, // SOPProcessUtilities is stateless
    workflow_helpers: true, // Has in-memory state
    compliance_tools: true, // Has in-memory state
    testing_utilities: true, // Has in-memory state
    activepieces_integration: true // Stateless
  };
  
  const healthyServices = Object.values(services).filter(s => s).length;
  const totalServices = Object.values(services).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyServices === totalServices) {
    status = 'healthy';
  } else if (healthyServices > totalServices / 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }
  
  return {
    status,
    services,
    timestamp: new Date().toISOString()
  };
}

/**
 * Utility function to clear all cached/temporary data
 */
export function clearSOPUtilitiesCache(): void {
  // Clear workflow helpers cache
  SOPWorkflowHelpers.cleanupCompletedWorkflows(0);
  
  // Clear compliance tools cache
  SOPComplianceTools.cleanupAuditLogs(0);
  
  // Clear testing utilities cache
  SOPTestingUtilities.clearAllTestData();
  
  console.log('SOP Utilities cache cleared');
}

/**
 * Utility function to get usage statistics
 */
export function getSOPUtilitiesStats(): {
  workflow_stats: {
    active_workflows: number;
  };
  testing_stats: {
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    success_rate: number;
  };
  compliance_stats: {
    active_rules: number;
  };
} {
  const workflowStats = {
    active_workflows: SOPWorkflowHelpers.getActiveWorkflows().length
  };
  
  const testingStats = SOPTestingUtilities.getTestSummary();
  
  const complianceStats = {
    active_rules: SOPComplianceTools.getActiveComplianceRules().length
  };
  
  return {
    workflow_stats: workflowStats,
    testing_stats: testingStats,
    compliance_stats: complianceStats
  };
}
