/**
 * Decision Point Piece Tests
 * 
 * Comprehensive test suite for the SOP Decision Point Piece functionality
 * including condition evaluation, decision logic, and workflow routing.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { SOPDecisionPointPiece, DecisionPointConfig, DecisionPointProps } from '../pieces/decision-point-piece';
import {
    SOPDecisionPoint,
    SOPDecisionLogic,
    SOPDecisionOption,
    SOPCondition,
    DecisionPointType,
    DecisionOperator,
    LogicOperator,
    DecisionTimeoutBehavior
} from '../types/sop-decision-types';
import { SOPPriority, SOPExecutionState, SOPComplianceStatus } from '../types/sop-types';
import { DecisionEngineUtils } from '../utils/decision-engine-utils';

describe('SOPDecisionPointPiece', () => {
    let decisionPiece: SOPDecisionPointPiece;
    let mockDecisionConfig: DecisionPointConfig;
    let mockDecisionPoint: SOPDecisionPoint;
    let mockProps: DecisionPointProps;

    beforeEach(() => {
        // Setup mock decision configuration
        mockDecisionConfig = {
            displayName: 'Test Decision Point',
            description: 'Test decision point for unit tests',
            sopPieceType: 'DECISION_POINT' as any,
            sopCategory: 'DECISION_SUPPORT' as any,
            priority: SOPPriority.NORMAL,
            complianceRequired: true,
            auditTrailRequired: true,
            decisionType: 'automated',
            timeoutMinutes: 30,
            requiresJustification: false,
            escalationEnabled: true,
            escalationTimeoutMinutes: 120,
            auditDecisionRationale: true
        };

        // Setup mock decision point configuration
        mockDecisionPoint = {
            id: 'dp-001',
            name: 'Test Decision Point',
            sopName: 'Test Decision Point',
            description: 'Test decision point configuration',
            stepId: 'step-001',
            decisionLogic: {
                type: DecisionPointType.AUTOMATED,
                conditions: [
                    {
                        id: 'cond-001',
                        field: 'input.amount',
                        operator: DecisionOperator.GREATER_THAN,
                        value: 1000,
                        weight: 2
                    },
                    {
                        id: 'cond-002',
                        field: 'input.department',
                        operator: DecisionOperator.EQUALS,
                        value: 'finance',
                        weight: 1
                    }
                ],
                evaluationOrder: 'sequential',
                operatorLogic: LogicOperator.AND,
                timeoutMinutes: 30,
                retryAttempts: 0,
                failureHandling: 'escalate'
            },
            options: [
                {
                    id: 'opt-001',
                    name: 'Approve High Amount',
                    sopName: 'Approve High Amount',
                    description: 'Approve finance department high amount request',
                    nextStepId: 'approval-step',
                    priority: 10,
                    conditions: [
                        { id: 'cond-001', field: 'input.amount', operator: DecisionOperator.GREATER_THAN, value: 1000 },
                        { id: 'cond-002', field: 'input.department', operator: DecisionOperator.EQUALS, value: 'finance' }
                    ]
                },
                {
                    id: 'opt-002',
                    name: 'Standard Processing',
                    sopName: 'Standard Processing',
                    description: 'Standard processing for other requests',
                    nextStepId: 'standard-step',
                    priority: 5
                }
            ],
            defaultOption: 'opt-002',
            timeoutBehavior: DecisionTimeoutBehavior.DEFAULT,
            timeoutMinutes: 30,
            requiresJustification: false,
            auditRequired: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Setup mock props
        mockProps = {
            sopMetadata: {
                sopId: 'sop-001',
                version: '1.0.0',
                title: 'Test SOP',
                category: 'DECISION_SUPPORT',
                pieceType: 'DECISION_POINT',
                priority: SOPPriority.NORMAL,
                complianceRequired: true,
                auditTrailRequired: true,
                tags: ['test'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'test-user'
            },
            priority: SOPPriority.NORMAL,
            enableComplianceCheck: true,
            enableAuditTrail: true,
            customVariables: {},
            tags: ['test', 'decision'],
            decisionConfiguration: mockDecisionPoint,
            contextData: {
                input: {
                    amount: 1500,
                    department: 'finance',
                    requestor: 'john.doe@example.com'
                },
                variables: {
                    processId: 'proc-001'
                }
            },
            timeoutBehavior: 'default' as const
        };

        decisionPiece = new SOPDecisionPointPiece(mockDecisionConfig);
    });

    describe('Constructor and Configuration', () => {
        test('should create decision point piece with default configuration', () => {
            const piece = new SOPDecisionPointPiece();
            expect(piece).toBeDefined();
        });

        test('should create decision point piece with custom configuration', () => {
            const customConfig: DecisionPointConfig = {
                ...mockDecisionConfig,
                decisionType: 'manual',
                timeoutMinutes: 60
            };
            const piece = new SOPDecisionPointPiece(customConfig);
            expect(piece).toBeDefined();
        });

        test('should return SOP-specific properties', () => {
            const properties = (decisionPiece as any).getSOPSpecificProperties();
            expect(properties).toHaveProperty('decisionConfiguration');
            expect(properties).toHaveProperty('contextData');
            expect(properties).toHaveProperty('manualDecisionRequired');
            expect(properties).toHaveProperty('timeoutBehavior');
        });
    });

    describe('Decision Execution', () => {
        test('should execute automated decision with passing conditions', async () => {
            const result = await decisionPiece.execute(mockProps, 'test-user');

            expect(result).toBeDefined();
            expect(result.decisionPointId).toBe('dp-001');
            expect(result.selectedOptionId).toBe('opt-001');
            expect(result.selectedOptionName).toBe('Approve High Amount');
            expect(result.isAutomated).toBe(true);
            expect(result.confidenceScore).toBeGreaterThan(0);
            expect(result.decisionReason).toContain('2 passed');
        });

        test('should execute automated decision with failing conditions', async () => {
            // Modify context to make conditions fail
            const failingProps = {
                ...mockProps,
                contextData: {
                    input: {
                        amount: 500, // Less than 1000
                        department: 'hr' // Not finance
                    }
                }
            };

            const result = await decisionPiece.execute(failingProps, 'test-user');

            expect(result.selectedOptionId).toBe('opt-002'); // Should select default option
            expect(result.selectedOptionName).toBe('Standard Processing');
        });

        test('should handle manual decision requirement', async () => {
            const manualProps = {
                ...mockProps,
                manualDecisionRequired: true,
                manualDecisionJustification: 'Manual override required for special case'
            };

            const result = await decisionPiece.execute(manualProps, 'test-user');

            expect(result.isAutomated).toBe(false);
            expect(result.decisionReason).toContain('Manual decision made');
        });

        test('should throw error when manual justification is required but missing', async () => {
            const manualConfigWithJustification: DecisionPointConfig = {
                ...mockDecisionConfig,
                requiresJustification: true
            };
            const pieceWithJustification = new SOPDecisionPointPiece(manualConfigWithJustification);

            const manualProps = {
                ...mockProps,
                manualDecisionRequired: true
                // No justification provided
            };

            await expect(
                pieceWithJustification.execute(manualProps, 'test-user')
            ).rejects.toThrow('Decision justification is required');
        });

        test('should handle validation errors', async () => {
            const invalidProps = {
                ...mockProps,
                decisionConfiguration: null as any
            };

            await expect(
                decisionPiece.execute(invalidProps, 'test-user')
            ).rejects.toThrow('Decision configuration is required');
        });
    });

    describe('Condition Evaluation', () => {
        test('should evaluate EQUALS operator correctly', async () => {
            const condition: SOPCondition = {
                id: 'test-001',
                field: 'input.department',
                operator: DecisionOperator.EQUALS,
                value: 'finance'
            };

            const context = {
                inputData: { department: 'finance' },
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const result = await DecisionEngineUtils.evaluateCondition(condition, context);
            expect(result.result).toBe(true);
            expect(result.actualValue).toBe('finance');
        });

        test('should evaluate GREATER_THAN operator correctly', async () => {
            const condition: SOPCondition = {
                id: 'test-002',
                field: 'input.amount',
                operator: DecisionOperator.GREATER_THAN,
                value: 1000
            };

            const context = {
                inputData: { amount: 1500 },
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const result = await DecisionEngineUtils.evaluateCondition(condition, context);
            expect(result.result).toBe(true);
            expect(result.actualValue).toBe(1500);
        });

        test('should evaluate CONTAINS operator correctly', async () => {
            const condition: SOPCondition = {
                id: 'test-003',
                field: 'input.description',
                operator: DecisionOperator.CONTAINS,
                value: 'urgent'
            };

            const context = {
                inputData: { description: 'This is an URGENT request' },
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const result = await DecisionEngineUtils.evaluateCondition(condition, context);
            expect(result.result).toBe(true); // Case-insensitive match
        });

        test('should handle nested field paths', async () => {
            const condition: SOPCondition = {
                id: 'test-004',
                field: 'input.user.department',
                operator: DecisionOperator.EQUALS,
                value: 'engineering'
            };

            const context = {
                inputData: {
                    user: {
                        department: 'engineering',
                        role: 'developer'
                    }
                },
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const result = await DecisionEngineUtils.evaluateCondition(condition, context);
            expect(result.result).toBe(true);
            expect(result.actualValue).toBe('engineering');
        });
    });

    describe('Logic Operators', () => {
        test('should evaluate AND logic correctly', () => {
            const conditionResults = [
                { conditionId: '1', result: true, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'a', actualValue: 'a', evaluationTime: 0 },
                { conditionId: '2', result: true, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'b', actualValue: 'b', evaluationTime: 0 }
            ];

            const result = DecisionEngineUtils.evaluateConditionsWithLogic(
                conditionResults,
                LogicOperator.AND
            );
            expect(result).toBe(true);
        });

        test('should evaluate OR logic correctly', () => {
            const conditionResults = [
                { conditionId: '1', result: false, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'a', actualValue: 'x', evaluationTime: 0 },
                { conditionId: '2', result: true, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'b', actualValue: 'b', evaluationTime: 0 }
            ];

            const result = DecisionEngineUtils.evaluateConditionsWithLogic(
                conditionResults,
                LogicOperator.OR
            );
            expect(result).toBe(true);
        });

        test('should evaluate XOR logic correctly', () => {
            const conditionResults = [
                { conditionId: '1', result: true, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'a', actualValue: 'a', evaluationTime: 0 },
                { conditionId: '2', result: false, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'b', actualValue: 'x', evaluationTime: 0 }
            ];

            const result = DecisionEngineUtils.evaluateConditionsWithLogic(
                conditionResults,
                LogicOperator.XOR
            );
            expect(result).toBe(true); // Exactly one condition is true
        });
    });

    describe('Weighted Decision Making', () => {
        test('should calculate weighted decision result correctly', () => {
            const conditionResults = [
                { conditionId: '1', result: true, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'a', actualValue: 'a', evaluationTime: 0, weight: 3 },
                { conditionId: '2', result: false, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'b', actualValue: 'x', evaluationTime: 0, weight: 1 }
            ];

            const result = DecisionEngineUtils.calculateWeightedResult(conditionResults);
            expect(result.result).toBe(true); // 3/4 = 75% > 50% threshold
            expect(result.score).toBe(75);
            expect(result.totalWeight).toBe(4);
        });
    });

    describe('Decision Option Matching', () => {
        test('should find best matching option based on conditions', () => {
            const options: SOPDecisionOption[] = [
                {
                    id: 'opt-high',
                    name: 'High Priority',
                    sopName: 'High Priority',
                    priority: 10,
                    conditions: [
                        { id: 'cond-1', field: 'amount', operator: DecisionOperator.GREATER_THAN, value: 1000 }
                    ]
                },
                {
                    id: 'opt-standard',
                    name: 'Standard',
                    sopName: 'Standard',
                    priority: 5,
                    conditions: []
                }
            ];

            const conditionResults = [
                { conditionId: 'cond-1', result: true, field: 'amount', operator: DecisionOperator.GREATER_THAN, expectedValue: 1000, actualValue: 1500, evaluationTime: 0 }
            ];

            const context = {
                inputData: { amount: 1500 },
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const bestOption = DecisionEngineUtils.findBestMatchingOption(options, conditionResults, context);
            expect(bestOption?.id).toBe('opt-high');
        });
    });

    describe('Confidence Score Calculation', () => {
        test('should calculate confidence score correctly', () => {
            const conditionResults = [
                { conditionId: '1', result: true, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'a', actualValue: 'a', evaluationTime: 0, weight: 2 },
                { conditionId: '2', result: false, field: 'test', operator: DecisionOperator.EQUALS, expectedValue: 'b', actualValue: 'x', evaluationTime: 0, weight: 1 }
            ];

            const selectedOption: SOPDecisionOption = {
                id: 'opt-001',
                name: 'Test Option',
                sopName: 'Test Option',
                priority: 10,
                conditions: [{ id: '1', field: 'test', operator: DecisionOperator.EQUALS, value: 'a' }]
            };

            const score = DecisionEngineUtils.calculateConfidenceScore(conditionResults, selectedOption);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('Decision Path Generation', () => {
        test('should generate decision path for audit trail', () => {
            const conditionResults = [
                { conditionId: '1', result: true, field: 'amount', operator: DecisionOperator.GREATER_THAN, expectedValue: 1000, actualValue: 1500, evaluationTime: 0 },
                { conditionId: '2', result: true, field: 'department', operator: DecisionOperator.EQUALS, expectedValue: 'finance', actualValue: 'finance', evaluationTime: 0 }
            ];

            const selectedOption: SOPDecisionOption = {
                id: 'opt-approve',
                name: 'Approve Request',
                sopName: 'Approve Request',
                priority: 10
            };

            const path = DecisionEngineUtils.generateDecisionPath(
                conditionResults,
                selectedOption,
                LogicOperator.AND
            );

            expect(path).toHaveLength(4); // 2 conditions + logic + selection
            expect(path[0]).toContain('amount greater_than');
            expect(path[1]).toContain('department equals');
            expect(path[2]).toContain('Logic: AND');
            expect(path[3]).toContain('Selected: "Approve Request"');
        });
    });

    describe('Error Handling', () => {
        test('should handle condition evaluation errors gracefully', async () => {
            const condition: SOPCondition = {
                id: 'test-error',
                field: 'nonexistent.field.path',
                operator: DecisionOperator.GREATER_THAN,
                value: 100
            };

            const context = {
                inputData: {},
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const result = await DecisionEngineUtils.evaluateCondition(condition, context);
            expect(result.result).toBe(false);
            expect(result.actualValue).toBeUndefined();
        });

        test('should handle custom function errors', async () => {
            const condition: SOPCondition = {
                id: 'test-custom-error',
                field: 'input.value',
                operator: DecisionOperator.CUSTOM,
                value: 10,
                customFunction: 'invalid javascript code {'
            };

            const context = {
                inputData: { value: 5 },
                variables: {},
                workflowState: {},
                previousDecisions: [],
                environment: 'test',
                timestamp: new Date().toISOString(),
                permissions: [],
                executionId: 'exec-001',
                processId: 'proc-001',
                stepId: 'step-001'
            };

            const result = await DecisionEngineUtils.evaluateCondition(condition, context);
            expect(result.result).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('Audit Trail', () => {
        test('should generate comprehensive audit trail', async () => {
            const result = await decisionPiece.execute(mockProps, 'test-user');

            // The execution should create audit entries in the context
            // This would be verified by checking the context's audit trail
            expect(result.timestamp).toBeDefined();
            expect(result.decisionMaker).toBe('test-user');
            expect(result.decisionReason).toBeDefined();
        });
    });

    describe('Piece Configuration', () => {
        test('should return valid Activepieces piece configuration', () => {
            const config = decisionPiece.getPieceConfiguration();

            expect(config).toHaveProperty('displayName');
            expect(config).toHaveProperty('description');
            expect(config).toHaveProperty('category');
            expect(config).toHaveProperty('actions');
            expect(config.actions).toHaveProperty('evaluateDecision');
        });
    });

    describe('Integration with SOP Framework', () => {
        test('should integrate with SOP execution context', async () => {
            const result = await decisionPiece.execute(mockProps, 'test-user');

            expect(result).toBeDefined();
            expect(result.decisionPointId).toBe(mockProps.decisionConfiguration.id);
            expect(result.isAutomated).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });

        test('should handle compliance checking', async () => {
            const complianceProps = {
                ...mockProps,
                enableComplianceCheck: true
            };

            const result = await decisionPiece.execute(complianceProps, 'test-user');
            expect(result).toBeDefined();
            // Compliance status would be checked in the execution context
        });

        test('should support escalation scenarios', async () => {
            // Create scenario where no options match
            const escalationProps = {
                ...mockProps,
                contextData: {
                    input: {
                        amount: 500,
                        department: 'unknown'
                    }
                },
                decisionConfiguration: {
                    ...mockDecisionPoint,
                    options: [
                        {
                            id: 'opt-specific',
                            name: 'Specific Option',
                            sopName: 'Specific Option',
                            priority: 10,
                            conditions: [
                                { id: 'impossible', field: 'input.impossible', operator: DecisionOperator.EQUALS, value: 'never' }
                            ]
                        }
                    ],
                    defaultOption: undefined, // No default option
                    timeoutBehavior: DecisionTimeoutBehavior.ESCALATE
                }
            };

            const result = await decisionPiece.execute(escalationProps, 'test-user');
            // Should handle escalation scenario appropriately
            expect(result).toBeDefined();
        });
    });
});