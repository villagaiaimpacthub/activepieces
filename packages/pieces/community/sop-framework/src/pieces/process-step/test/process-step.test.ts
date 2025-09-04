/**
 * Process Step Piece Tests
 * 
 * Comprehensive tests for the Process Step piece implementation
 */

import { 
    ProcessStepValidator,
    ProcessStepExecutor,
    ProcessStepAuditor,
    ProcessStepStateManager 
} from '../lib/utils/process-step-helpers';
import { 
    ProcessStepConfig,
    ProcessStepError,
    ProcessStepErrorType,
    StepValidationContext,
    OutputFormat 
} from '../lib/common/process-step-types';
import {
    SOPExecutionState,
    SOPComplianceStatus,
    SOPPriority,
    SOPExecutionContext,
    SOPPieceType,
    SOPPieceCategory
} from '../../../types/sop-types';

/**
 * Test Process Step Configuration Validation
 */
describe('ProcessStepValidator', () => {
    
    describe('validateStepConfig', () => {
        it('should pass with valid configuration', () => {
            const config: ProcessStepConfig = {
                title: 'Test Step',
                instructions: 'Test instructions for the step',
                priority: SOPPriority.NORMAL,
                estimatedDuration: 30
            };
            
            const errors = ProcessStepValidator.validateStepConfig(config);
            expect(errors).toHaveLength(0);
        });
        
        it('should fail with missing title', () => {
            const config: Partial<ProcessStepConfig> = {
                instructions: 'Test instructions',
                priority: SOPPriority.NORMAL
            };
            
            const errors = ProcessStepValidator.validateStepConfig(config);
            expect(errors).toHaveLength(1);
            expect(errors[0].type).toBe(ProcessStepErrorType.VALIDATION_ERROR);
            expect(errors[0].message).toContain('title is required');
        });
        
        it('should fail with invalid duration', () => {
            const config: ProcessStepConfig = {
                title: 'Test Step',
                instructions: 'Test instructions',
                priority: SOPPriority.NORMAL,
                estimatedDuration: -5
            };
            
            const errors = ProcessStepValidator.validateStepConfig(config);
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toContain('positive number');
        });
    });
    
    describe('validateSuccessCriteria', () => {
        it('should pass with no criteria', () => {
            const result = ProcessStepValidator.validateSuccessCriteria({}, []);
            expect(result).toBe(true);
        });
        
        it('should pass with valid output_not_null criteria', () => {
            const output = { result: 'success' };
            const result = ProcessStepValidator.validateSuccessCriteria(output, ['output_not_null']);
            expect(result).toBe(true);
        });
        
        it('should fail with null output and output_not_null criteria', () => {
            const result = ProcessStepValidator.validateSuccessCriteria(null, ['output_not_null']);
            expect(result).toBe(false);
        });
        
        it('should validate output_has_field criteria', () => {
            const output = { userId: '123', name: 'John' };
            const result = ProcessStepValidator.validateSuccessCriteria(output, ['output_has_field:userId']);
            expect(result).toBe(true);
            
            const failResult = ProcessStepValidator.validateSuccessCriteria(output, ['output_has_field:email']);
            expect(failResult).toBe(false);
        });
    });
});

/**
 * Test Process Step Execution Helpers
 */
describe('ProcessStepExecutor', () => {
    
    describe('createExecutionMetrics', () => {
        it('should create valid execution metrics', () => {
            const metrics = ProcessStepExecutor.createExecutionMetrics(
                'exec_123',
                'Test Step',
                '2024-01-15T10:00:00.000Z',
                { test: 'data' }
            );
            
            expect(metrics.executionId).toBe('exec_123');
            expect(metrics.stepTitle).toBe('Test Step');
            expect(metrics.status).toBe(SOPExecutionState.PENDING);
            expect(metrics.inputDataSize).toBeGreaterThan(0);
        });
    });
    
    describe('formatOutput', () => {
        it('should format JSON output correctly', () => {
            const data = { result: 'success', count: 5 };
            const formatted = ProcessStepExecutor.formatOutput(data, OutputFormat.JSON);
            expect(formatted).toEqual(data);
        });
        
        it('should format text output correctly', () => {
            const data = { result: 'success' };
            const formatted = ProcessStepExecutor.formatOutput(data, OutputFormat.TEXT);
            expect(typeof formatted).toBe('string');
            expect(formatted).toContain('success');
        });
        
        it('should format boolean output correctly', () => {
            const data = 'success';
            const formatted = ProcessStepExecutor.formatOutput(data, OutputFormat.BOOLEAN);
            expect(formatted).toBe(true);
            
            const emptyData = '';
            const emptyFormatted = ProcessStepExecutor.formatOutput(emptyData, OutputFormat.BOOLEAN);
            expect(emptyFormatted).toBe(false);
        });
        
        it('should format file output correctly', () => {
            const data = { result: 'success' };
            const formatted = ProcessStepExecutor.formatOutput(data, OutputFormat.FILE);
            
            expect(formatted.fileGenerated).toBe(true);
            expect(formatted.fileName).toContain('step_output_');
            expect(formatted.content).toContain('success');
            expect(formatted.mimeType).toBe('application/json');
        });
    });
});

/**
 * Test Process Step Auditing
 */
describe('ProcessStepAuditor', () => {
    
    describe('createAuditEntry', () => {
        it('should create valid audit entry', () => {
            const entry = ProcessStepAuditor.createAuditEntry(
                'test_action',
                'user123',
                { detail: 'value' }
            );
            
            expect(entry.action).toBe('test_action');
            expect(entry.userId).toBe('user123');
            expect(entry.details.detail).toBe('value');
            expect(entry.details.source).toBe('process-step-piece');
            expect(entry.timestamp).toBeDefined();
        });
    });
    
    describe('createComplianceAuditEntry', () => {
        it('should create compliance audit entry', () => {
            const entry = ProcessStepAuditor.createComplianceAuditEntry(
                'user123',
                SOPComplianceStatus.COMPLIANT,
                ['rule1', 'rule2']
            );
            
            expect(entry.action).toBe('compliance_check');
            expect(entry.details.complianceStatus).toBe(SOPComplianceStatus.COMPLIANT);
            expect(entry.details.checksPerformed).toBe(2);
        });
    });
    
    describe('summarizeAuditTrail', () => {
        it('should summarize audit trail correctly', () => {
            const auditTrail = [
                {
                    timestamp: '2024-01-15T10:00:00.000Z',
                    action: 'step_started',
                    userId: 'user1',
                    details: {}
                },
                {
                    timestamp: '2024-01-15T10:05:00.000Z',
                    action: 'error_occurred',
                    userId: 'user1',
                    details: {}
                },
                {
                    timestamp: '2024-01-15T10:10:00.000Z',
                    action: 'compliance_check',
                    userId: 'user2',
                    details: {}
                }
            ];
            
            const summary = ProcessStepAuditor.summarizeAuditTrail(auditTrail);
            
            expect(summary.totalEntries).toBe(3);
            expect(summary.actions.step_started).toBe(1);
            expect(summary.actions.error_occurred).toBe(1);
            expect(summary.uniqueUsers).toContain('user1');
            expect(summary.uniqueUsers).toContain('user2');
            expect(summary.errors).toBe(1);
            expect(summary.complianceChecks).toBe(1);
        });
    });
});

/**
 * Test Process Step State Management
 */
describe('ProcessStepStateManager', () => {
    
    describe('getNextState', () => {
        it('should transition from PENDING to IN_PROGRESS on start', () => {
            const nextState = ProcessStepStateManager.getNextState(
                SOPExecutionState.PENDING,
                'start'
            );
            expect(nextState).toBe(SOPExecutionState.IN_PROGRESS);
        });
        
        it('should transition to FAILED when there are errors', () => {
            const nextState = ProcessStepStateManager.getNextState(
                SOPExecutionState.IN_PROGRESS,
                'complete',
                true // hasErrors = true
            );
            expect(nextState).toBe(SOPExecutionState.FAILED);
        });
        
        it('should transition from IN_PROGRESS to COMPLETED on completion', () => {
            const nextState = ProcessStepStateManager.getNextState(
                SOPExecutionState.IN_PROGRESS,
                'complete'
            );
            expect(nextState).toBe(SOPExecutionState.COMPLETED);
        });
        
        it('should handle approval workflow transitions', () => {
            const waitingState = ProcessStepStateManager.getNextState(
                SOPExecutionState.IN_PROGRESS,
                'require_approval'
            );
            expect(waitingState).toBe(SOPExecutionState.WAITING_APPROVAL);
            
            const approvedState = ProcessStepStateManager.getNextState(
                SOPExecutionState.WAITING_APPROVAL,
                'approve'
            );
            expect(approvedState).toBe(SOPExecutionState.APPROVED);
        });
    });
    
    describe('isValidTransition', () => {
        it('should validate correct transitions', () => {
            const valid = ProcessStepStateManager.isValidTransition(
                SOPExecutionState.PENDING,
                SOPExecutionState.IN_PROGRESS
            );
            expect(valid).toBe(true);
        });
        
        it('should reject invalid transitions', () => {
            const invalid = ProcessStepStateManager.isValidTransition(
                SOPExecutionState.COMPLETED,
                SOPExecutionState.PENDING
            );
            expect(invalid).toBe(false);
        });
        
        it('should allow retry from failed state', () => {
            const valid = ProcessStepStateManager.isValidTransition(
                SOPExecutionState.FAILED,
                SOPExecutionState.IN_PROGRESS
            );
            expect(valid).toBe(true);
        });
    });
    
    describe('getAvailableActions', () => {
        it('should return correct actions for PENDING state', () => {
            const actions = ProcessStepStateManager.getAvailableActions(SOPExecutionState.PENDING);
            expect(actions).toContain('start');
            expect(actions).toContain('cancel');
        });
        
        it('should return correct actions for IN_PROGRESS state', () => {
            const actions = ProcessStepStateManager.getAvailableActions(SOPExecutionState.IN_PROGRESS);
            expect(actions).toContain('complete');
            expect(actions).toContain('pause');
            expect(actions).toContain('fail');
            expect(actions).toContain('require_approval');
            expect(actions).toContain('escalate');
        });
        
        it('should return empty actions for terminal states', () => {
            const completedActions = ProcessStepStateManager.getAvailableActions(SOPExecutionState.COMPLETED);
            expect(completedActions).toHaveLength(0);
            
            const cancelledActions = ProcessStepStateManager.getAvailableActions(SOPExecutionState.CANCELLED);
            expect(cancelledActions).toHaveLength(0);
        });
    });
});

/**
 * Integration Tests
 */
describe('Process Step Integration', () => {
    
    it('should handle complete step execution workflow', async () => {
        // Create step configuration
        const config: ProcessStepConfig = {
            title: 'Integration Test Step',
            instructions: 'Complete test step with all features',
            priority: SOPPriority.HIGH,
            estimatedDuration: 15,
            validationRules: ['data_not_empty'],
            successCriteria: ['output_not_null']
        };
        
        // Validate configuration
        const configErrors = ProcessStepValidator.validateStepConfig(config);
        expect(configErrors).toHaveLength(0);
        
        // Create execution metrics
        const startTime = new Date().toISOString();
        const metrics = ProcessStepExecutor.createExecutionMetrics(
            'integration_test_123',
            config.title,
            startTime,
            { testData: 'value' }
        );
        
        expect(metrics.stepTitle).toBe(config.title);
        expect(metrics.status).toBe(SOPExecutionState.PENDING);
        
        // Simulate state transitions
        let currentState = SOPExecutionState.PENDING;
        
        // Start execution
        currentState = ProcessStepStateManager.getNextState(currentState, 'start');
        expect(currentState).toBe(SOPExecutionState.IN_PROGRESS);
        
        // Complete execution
        currentState = ProcessStepStateManager.getNextState(currentState, 'complete');
        expect(currentState).toBe(SOPExecutionState.COMPLETED);
        
        // Create audit trail
        const auditEntry = ProcessStepAuditor.createAuditEntry(
            'step_completed',
            'test_user',
            { 
                stepTitle: config.title,
                executionTime: 14500,
                result: 'success'
            }
        );
        
        expect(auditEntry.action).toBe('step_completed');
        expect(auditEntry.details.stepTitle).toBe(config.title);
        
        // Format output
        const output = { result: 'success', processingCompleted: true };
        const formattedOutput = ProcessStepExecutor.formatOutput(output, OutputFormat.JSON);
        
        expect(formattedOutput).toEqual(output);
        
        // Validate success criteria
        const criteriaValid = ProcessStepValidator.validateSuccessCriteria(
            output,
            config.successCriteria || []
        );
        expect(criteriaValid).toBe(true);
    });
    
    it('should handle step execution with approval workflow', async () => {
        const config: ProcessStepConfig = {
            title: 'Approval Test Step',
            instructions: 'Test step requiring approval',
            priority: SOPPriority.URGENT,
            estimatedDuration: 60
        };
        
        // Start execution
        let currentState = SOPExecutionState.PENDING;
        currentState = ProcessStepStateManager.getNextState(currentState, 'start');
        expect(currentState).toBe(SOPExecutionState.IN_PROGRESS);
        
        // Require approval
        currentState = ProcessStepStateManager.getNextState(currentState, 'require_approval');
        expect(currentState).toBe(SOPExecutionState.WAITING_APPROVAL);
        
        // Grant approval
        currentState = ProcessStepStateManager.getNextState(currentState, 'approve');
        expect(currentState).toBe(SOPExecutionState.APPROVED);
        
        // Complete after approval
        currentState = ProcessStepStateManager.getNextState(currentState, 'complete');
        expect(currentState).toBe(SOPExecutionState.COMPLETED);
        
        // Create approval audit trail
        const auditTrail = [
            ProcessStepAuditor.createAuditEntry('step_started', 'user1', {}),
            ProcessStepAuditor.createAuditEntry('approval_requested', 'user1', { approvers: ['manager1'] }),
            ProcessStepAuditor.createAuditEntry('approval_granted', 'manager1', { decision: 'approved' }),
            ProcessStepAuditor.createAuditEntry('step_completed', 'user1', { result: 'success' })
        ];
        
        const summary = ProcessStepAuditor.summarizeAuditTrail(auditTrail);
        expect(summary.totalEntries).toBe(4);
        expect(summary.uniqueUsers).toContain('user1');
        expect(summary.uniqueUsers).toContain('manager1');
    });
    
    it('should handle step execution failure and retry', async () => {
        // Start execution
        let currentState = SOPExecutionState.PENDING;
        currentState = ProcessStepStateManager.getNextState(currentState, 'start');
        expect(currentState).toBe(SOPExecutionState.IN_PROGRESS);
        
        // Fail due to error
        currentState = ProcessStepStateManager.getNextState(currentState, 'complete', true); // hasErrors = true
        expect(currentState).toBe(SOPExecutionState.FAILED);
        
        // Retry
        currentState = ProcessStepStateManager.getNextState(currentState, 'retry');
        expect(currentState).toBe(SOPExecutionState.IN_PROGRESS);
        
        // Complete successfully
        currentState = ProcessStepStateManager.getNextState(currentState, 'complete');
        expect(currentState).toBe(SOPExecutionState.COMPLETED);
        
        // Create error audit entry
        const error: ProcessStepError = {
            type: ProcessStepErrorType.EXECUTION_ERROR,
            message: 'Test execution error',
            timestamp: new Date().toISOString(),
            recoverable: true,
            retryable: true
        };
        
        const errorAuditEntry = ProcessStepAuditor.createErrorAuditEntry(
            'test_user',
            error,
            'step_123'
        );
        
        expect(errorAuditEntry.action).toBe('error_occurred');
        expect(errorAuditEntry.details.errorType).toBe(ProcessStepErrorType.EXECUTION_ERROR);
        expect(errorAuditEntry.details.retryable).toBe(true);
    });
});

// Mock Jest functions for testing
const mockJestFunctions = () => {
    if (typeof describe === 'undefined') {
        (global as any).describe = (name: string, fn: () => void) => {
            console.log(`Test Suite: ${name}`);
            fn();
        };
    }
    
    if (typeof it === 'undefined') {
        (global as any).it = (name: string, fn: () => void) => {
            console.log(`  Test: ${name}`);
            try {
                fn();
                console.log('    ✓ PASS');
            } catch (error) {
                console.log('    ✗ FAIL:', error);
            }
        };
    }
    
    if (typeof expect === 'undefined') {
        (global as any).expect = (actual: any) => ({
            toBe: (expected: any) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, got ${actual}`);
                }
            },
            toEqual: (expected: any) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
                }
            },
            toHaveLength: (length: number) => {
                if (!actual || actual.length !== length) {
                    throw new Error(`Expected length ${length}, got ${actual?.length}`);
                }
            },
            toContain: (item: any) => {
                if (!actual || !actual.includes(item)) {
                    throw new Error(`Expected to contain ${item}`);
                }
            },
            toBeGreaterThan: (value: number) => {
                if (actual <= value) {
                    throw new Error(`Expected ${actual} to be greater than ${value}`);
                }
            },
            toBeDefined: () => {
                if (actual === undefined) {
                    throw new Error('Expected value to be defined');
                }
            }
        });
    }
};

// Initialize mock functions if testing environment is not available
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    mockJestFunctions();
}