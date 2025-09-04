/**
 * SOP Decision Point Piece - Handles conditional logic and branching within SOP workflows
 * 
 * This piece enables decision-making capabilities in SOP workflows with support for:
 * - Automated decision logic based on conditions
 * - Manual decision points requiring human input
 * - Complex decision trees with multiple outcomes
 * - Decision audit trails and escalation handling
 * - Integration with approval workflows
 */

import { createAction, Property, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { BaseSoPiece, BaseSoPieceConfig } from '../framework/base-sop-piece';
import {
    SOPPieceType,
    SOPPieceCategory,
    SOPExecutionContext,
    SOPExecutionState,
    SOPPriority,
    SOPComplianceStatus
} from '../types/sop-types';
import {
    SOPDecisionPoint,
    SOPDecisionLogic,
    SOPDecisionOption,
    SOPCondition,
    SOPDecisionResult
} from '../types/sop-decision-types';
import { nanoid } from 'nanoid';

/**
 * Decision Point configuration interface
 */
export interface DecisionPointConfig extends BaseSoPieceConfig {
    decisionType: 'automated' | 'manual' | 'hybrid';
    timeoutMinutes?: number;
    requiresJustification?: boolean;
    escalationEnabled?: boolean;
    escalationTimeoutMinutes?: number;
    auditDecisionRationale?: boolean;
}

/**
 * Decision evaluation result interface
 */
export interface DecisionEvaluationResult {
    decisionMade: boolean;
    selectedOption?: SOPDecisionOption;
    selectedOptionId?: string;
    decisionReason?: string;
    confidenceScore?: number;
    evaluationTime: number;
    requiresEscalation: boolean;
    requiresManualIntervention: boolean;
    auditData: DecisionAuditData;
}

/**
 * Decision audit data interface
 */
export interface DecisionAuditData {
    timestamp: string;
    decisionMaker: 'system' | 'user' | 'escalation';
    decisionMethod: 'automated' | 'manual' | 'timeout_default' | 'escalation';
    conditionsEvaluated: ConditionEvaluationResult[];
    decisionPath: string[];
    contextData: Record<string, any>;
    justification?: string;
    reviewRequired: boolean;
}

/**
 * Condition evaluation result interface
 */
export interface ConditionEvaluationResult {
    conditionId: string;
    field: string;
    operator: string;
    expectedValue: any;
    actualValue: any;
    result: boolean;
    evaluationTime: number;
    error?: string;
}

/**
 * Decision point execution properties interface
 */
export interface DecisionPointProps {
    sopMetadata: any;
    priority: SOPPriority;
    assignedTo?: string;
    dueDate?: string;
    enableComplianceCheck: boolean;
    enableAuditTrail: boolean;
    customVariables: Record<string, any>;
    tags: string[];
    notes?: string;
    
    // Decision-specific properties
    decisionConfiguration: SOPDecisionPoint;
    contextData: Record<string, any>;
    manualDecisionRequired?: boolean;
    manualDecisionJustification?: string;
    overrideAutomatedDecision?: boolean;
    escalationLevel?: number;
    timeoutBehavior: 'default' | 'fail' | 'escalate';
    reviewRequired?: boolean;
}

/**
 * SOP Decision Point Piece implementation
 */
export class SOPDecisionPointPiece extends BaseSoPiece {
    private decisionConfig: DecisionPointConfig;
    
    constructor(config: DecisionPointConfig = {
        displayName: 'SOP Decision Point',
        description: 'Handles conditional logic and branching within SOP workflows',
        sopPieceType: SOPPieceType.DECISION_POINT,
        sopCategory: SOPPieceCategory.DECISION_SUPPORT,
        priority: SOPPriority.NORMAL,
        complianceRequired: true,
        auditTrailRequired: true,
        decisionType: 'automated',
        timeoutMinutes: 60,
        requiresJustification: false,
        escalationEnabled: true,
        escalationTimeoutMinutes: 240,
        auditDecisionRationale: true
    }) {
        super(config);
        this.decisionConfig = config;
    }

    /**
     * Get SOP-specific properties for decision point
     */
    protected getSOPSpecificProperties(): Record<string, any> {
        return {
            decisionConfiguration: Property.Json({
                displayName: 'Decision Configuration',
                description: 'Complete decision point configuration including logic and options',
                required: true,
            }),
            contextData: Property.Object({
                displayName: 'Context Data',
                description: 'Data available for decision evaluation',
                required: true
            }),
            manualDecisionRequired: Property.Checkbox({
                displayName: 'Manual Decision Required',
                description: 'Force manual decision even if automated logic is configured',
                required: false,
                defaultValue: false
            }),
            manualDecisionJustification: Property.LongText({
                displayName: 'Decision Justification',
                description: 'Manual justification for decision (required for manual decisions)',
                required: false
            }),
            overrideAutomatedDecision: Property.Checkbox({
                displayName: 'Override Automated Decision',
                description: 'Allow manual override of automated decision results',
                required: false,
                defaultValue: false
            }),
            escalationLevel: Property.Number({
                displayName: 'Escalation Level',
                description: 'Current escalation level (0 = no escalation)',
                required: false,
                defaultValue: 0
            }),
            timeoutBehavior: Property.StaticDropdown({
                displayName: 'Timeout Behavior',
                description: 'What to do when decision times out',
                required: false,
                defaultValue: 'default',
                options: {
                    options: [
                        { label: 'Use Default Option', value: 'default' },
                        { label: 'Fail', value: 'fail' },
                        { label: 'Escalate', value: 'escalate' }
                    ]
                }
            }),
            reviewRequired: Property.Checkbox({
                displayName: 'Review Required',
                description: 'Require review of decision outcome',
                required: false,
                defaultValue: false
            })
        };
    }

    /**
     * Main execution method for decision point
     */
    public async execute(propsValue: DecisionPointProps, executedBy: string): Promise<SOPDecisionResult> {
        // Create execution context
        const context = this.createExecutionContext(propsValue, executedBy);
        
        try {
            // Validate execution
            const validation = await this.validateExecution(context, propsValue);
            if (!validation.isValid) {
                throw new Error(`Decision point validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }

            // Execute pre-run hooks
            await this.executePreRunHooks(context, propsValue);

            // Update execution state
            context.currentState = SOPExecutionState.IN_PROGRESS;

            // Perform decision evaluation
            const evaluationResult = await this.evaluateDecision(context, propsValue);

            // Create decision result
            const decisionResult = await this.createDecisionResult(context, propsValue, evaluationResult);

            // Handle post-decision actions
            await this.handlePostDecisionActions(context, propsValue, decisionResult);

            // Execute post-run hooks
            await this.executePostRunHooks(context, decisionResult);

            return decisionResult;

        } catch (error) {
            await this.handleExecutionError(context, error as Error);
            throw error;
        }
    }

    /**
     * Evaluate decision based on configuration and context
     */
    private async evaluateDecision(
        context: SOPExecutionContext,
        props: DecisionPointProps
    ): Promise<DecisionEvaluationResult> {
        const startTime = Date.now();
        const decisionConfig = props.decisionConfiguration;
        
        const auditData: DecisionAuditData = {
            timestamp: new Date().toISOString(),
            decisionMaker: 'system',
            decisionMethod: 'automated',
            conditionsEvaluated: [],
            decisionPath: [],
            contextData: props.contextData,
            reviewRequired: props.reviewRequired || false
        };

        try {
            // Check if manual decision is forced
            if (props.manualDecisionRequired || decisionConfig.decisionLogic.type === 'manual') {
                return await this.handleManualDecision(context, props, auditData);
            }

            // Handle hybrid decisions
            if (decisionConfig.decisionLogic.type === 'hybrid') {
                const automatedResult = await this.evaluateAutomatedDecision(context, props, auditData);
                
                if (automatedResult.requiresManualIntervention || props.overrideAutomatedDecision) {
                    return await this.handleManualDecision(context, props, auditData);
                }
                
                return automatedResult;
            }

            // Handle automated decisions
            return await this.evaluateAutomatedDecision(context, props, auditData);

        } catch (error) {
            auditData.decisionMethod = 'escalation';
            
            const evaluationResult: DecisionEvaluationResult = {
                decisionMade: false,
                evaluationTime: Date.now() - startTime,
                requiresEscalation: true,
                requiresManualIntervention: true,
                auditData
            };

            if (this.decisionConfig.escalationEnabled) {
                evaluationResult.requiresEscalation = true;
            }

            throw new Error(`Decision evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Evaluate automated decision logic
     */
    private async evaluateAutomatedDecision(
        context: SOPExecutionContext,
        props: DecisionPointProps,
        auditData: DecisionAuditData
    ): Promise<DecisionEvaluationResult> {
        const startTime = Date.now();
        const decisionConfig = props.decisionConfiguration;
        const conditions = decisionConfig.decisionLogic.conditions;

        auditData.decisionMaker = 'system';
        auditData.decisionMethod = 'automated';

        // Evaluate all conditions
        const conditionResults: ConditionEvaluationResult[] = [];
        
        for (const condition of conditions) {
            const conditionResult = await this.evaluateCondition(condition, props.contextData);
            conditionResults.push(conditionResult);
            auditData.conditionsEvaluated.push(conditionResult);
        }

        // Apply decision logic
        const decisionLogic = decisionConfig.decisionLogic;
        let overallResult: boolean;

        switch (decisionLogic.operatorLogic) {
            case 'AND':
                overallResult = conditionResults.every(r => r.result);
                break;
            case 'OR':
                overallResult = conditionResults.some(r => r.result);
                break;
            case 'CUSTOM':
                overallResult = await this.evaluateCustomLogic(
                    decisionLogic.customLogic!,
                    conditionResults,
                    props.contextData
                );
                break;
            default:
                overallResult = conditionResults.every(r => r.result);
        }

        // Find matching decision option
        const selectedOption = this.findMatchingOption(
            decisionConfig.options,
            conditionResults,
            props.contextData
        );

        const evaluationResult: DecisionEvaluationResult = {
            decisionMade: selectedOption !== null,
            selectedOption: selectedOption || undefined,
            selectedOptionId: selectedOption?.id,
            decisionReason: this.generateDecisionReason(conditionResults, overallResult),
            confidenceScore: this.calculateConfidenceScore(conditionResults),
            evaluationTime: Date.now() - startTime,
            requiresEscalation: !selectedOption && (this.decisionConfig.escalationEnabled || false),
            requiresManualIntervention: !selectedOption,
            auditData
        };

        auditData.decisionPath = this.buildDecisionPath(conditionResults, selectedOption);

        return evaluationResult;
    }

    /**
     * Handle manual decision requirements
     */
    private async handleManualDecision(
        context: SOPExecutionContext,
        props: DecisionPointProps,
        auditData: DecisionAuditData
    ): Promise<DecisionEvaluationResult> {
        const startTime = Date.now();

        auditData.decisionMaker = 'user';
        auditData.decisionMethod = 'manual';
        auditData.justification = props.manualDecisionJustification;

        // In a real implementation, this would integrate with a UI or API
        // for collecting manual decisions. For now, we simulate the behavior.
        
        // Check if justification is required and provided
        if (this.decisionConfig.requiresJustification && !props.manualDecisionJustification) {
            throw new Error('Decision justification is required for manual decisions');
        }

        // Update execution state to indicate waiting for manual decision
        context.currentState = SOPExecutionState.WAITING_APPROVAL;

        // For demo purposes, we'll assume a manual decision was made
        // In practice, this would wait for user input or timeout
        const selectedOption = props.decisionConfiguration.options[0]; // Default selection

        return {
            decisionMade: true,
            selectedOption,
            selectedOptionId: selectedOption.id,
            decisionReason: props.manualDecisionJustification || 'Manual decision made',
            evaluationTime: Date.now() - startTime,
            requiresEscalation: false,
            requiresManualIntervention: false,
            auditData
        };
    }

    /**
     * Evaluate individual condition
     */
    private async evaluateCondition(
        condition: SOPCondition,
        contextData: Record<string, any>
    ): Promise<ConditionEvaluationResult> {
        const startTime = Date.now();
        
        try {
            const actualValue = this.getValueFromContext(condition.field, contextData);
            const expectedValue = condition.value;
            let result: boolean;

            switch (condition.operator) {
                case 'equals':
                    result = actualValue === expectedValue;
                    break;
                case 'not_equals':
                    result = actualValue !== expectedValue;
                    break;
                case 'greater_than':
                    result = Number(actualValue) > Number(expectedValue);
                    break;
                case 'less_than':
                    result = Number(actualValue) < Number(expectedValue);
                    break;
                case 'contains':
                    result = String(actualValue).includes(String(expectedValue));
                    break;
                case 'regex':
                    result = new RegExp(String(expectedValue)).test(String(actualValue));
                    break;
                case 'exists':
                    result = actualValue !== undefined && actualValue !== null;
                    break;
                case 'custom':
                    result = await this.evaluateCustomFunction(condition.customFunction!, actualValue, expectedValue);
                    break;
                default:
                    throw new Error(`Unknown operator: ${condition.operator}`);
            }

            return {
                conditionId: condition.id,
                field: condition.field,
                operator: condition.operator,
                expectedValue,
                actualValue,
                result,
                evaluationTime: Date.now() - startTime
            };

        } catch (error) {
            return {
                conditionId: condition.id,
                field: condition.field,
                operator: condition.operator,
                expectedValue: condition.value,
                actualValue: undefined,
                result: false,
                evaluationTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get value from context data using field path
     */
    private getValueFromContext(field: string, contextData: Record<string, any>): any {
        // Support dot notation for nested fields
        const fieldParts = field.split('.');
        let value = contextData;
        
        for (const part of fieldParts) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[part];
        }
        
        return value;
    }

    /**
     * Evaluate custom logic function
     */
    private async evaluateCustomLogic(
        customLogic: string,
        conditionResults: ConditionEvaluationResult[],
        contextData: Record<string, any>
    ): Promise<boolean> {
        // In a production environment, this would use a secure sandbox
        // For now, we implement basic custom logic evaluation
        
        try {
            // Create evaluation context
            const evalContext = {
                conditions: conditionResults.reduce((acc, result) => {
                    acc[result.conditionId] = result.result;
                    return acc;
                }, {} as Record<string, boolean>),
                context: contextData
            };

            // Simple custom logic evaluation
            // This is a simplified version - production would use a proper expression engine
            const result = new Function('ctx', `return ${customLogic}`)(evalContext);
            return Boolean(result);

        } catch (error) {
            throw new Error(`Custom logic evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Evaluate custom function for conditions
     */
    private async evaluateCustomFunction(
        customFunction: string,
        actualValue: any,
        expectedValue: any
    ): Promise<boolean> {
        try {
            const result = new Function('actual', 'expected', `return ${customFunction}`)(actualValue, expectedValue);
            return Boolean(result);
        } catch (error) {
            throw new Error(`Custom function evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find matching decision option based on conditions
     */
    private findMatchingOption(
        options: SOPDecisionOption[],
        conditionResults: ConditionEvaluationResult[],
        contextData: Record<string, any>
    ): SOPDecisionOption | null {
        // Sort options by priority (higher priority first)
        const sortedOptions = [...options].sort((a, b) => b.priority - a.priority);

        for (const option of sortedOptions) {
            if (option.conditions && option.conditions.length > 0) {
                // Check if all conditions for this option are met
                const optionMatches = option.conditions.every(condition => {
                    const conditionResult = conditionResults.find(r => r.conditionId === condition.id);
                    return conditionResult?.result === true;
                });

                if (optionMatches) {
                    return option;
                }
            }
        }

        // Return default option if no specific option matches
        return sortedOptions.find(option => !option.conditions || option.conditions.length === 0) || null;
    }

    /**
     * Generate human-readable decision reason
     */
    private generateDecisionReason(
        conditionResults: ConditionEvaluationResult[],
        overallResult: boolean
    ): string {
        const passedConditions = conditionResults.filter(r => r.result);
        const failedConditions = conditionResults.filter(r => !r.result);

        let reason = `Decision based on ${conditionResults.length} condition(s): `;
        
        if (passedConditions.length > 0) {
            reason += `${passedConditions.length} passed`;
        }
        
        if (failedConditions.length > 0) {
            reason += `, ${failedConditions.length} failed`;
        }

        reason += `. Overall result: ${overallResult ? 'PASS' : 'FAIL'}`;

        return reason;
    }

    /**
     * Calculate confidence score based on condition evaluation
     */
    private calculateConfidenceScore(conditionResults: ConditionEvaluationResult[]): number {
        if (conditionResults.length === 0) {
            return 0;
        }

        const passedConditions = conditionResults.filter(r => r.result).length;
        const score = (passedConditions / conditionResults.length) * 100;

        // Reduce confidence if there were any errors
        const errorsCount = conditionResults.filter(r => r.error).length;
        const errorPenalty = (errorsCount / conditionResults.length) * 20;

        return Math.max(0, Math.round(score - errorPenalty));
    }

    /**
     * Build decision path for audit trail
     */
    private buildDecisionPath(
        conditionResults: ConditionEvaluationResult[],
        selectedOption: SOPDecisionOption | null
    ): string[] {
        const path: string[] = [];

        for (const result of conditionResults) {
            path.push(`${result.field} ${result.operator} ${result.expectedValue} => ${result.result ? 'PASS' : 'FAIL'}`);
        }

        if (selectedOption) {
            path.push(`Selected: ${selectedOption.name}`);
        } else {
            path.push('No matching option found');
        }

        return path;
    }

    /**
     * Create decision result from evaluation
     */
    private async createDecisionResult(
        context: SOPExecutionContext,
        props: DecisionPointProps,
        evaluation: DecisionEvaluationResult
    ): Promise<SOPDecisionResult> {
        const result: SOPDecisionResult = {
            decisionPointId: props.decisionConfiguration.id,
            selectedOptionId: evaluation.selectedOptionId || '',
            selectedOptionName: evaluation.selectedOption?.name || 'No option selected',
            decisionMaker: context.executedBy,
            decisionReason: evaluation.decisionReason,
            isAutomated: evaluation.auditData.decisionMethod === 'automated',
            timestamp: new Date().toISOString(),
            confidenceScore: evaluation.confidenceScore,
            alternativeOptions: props.decisionConfiguration.options
                .filter(opt => opt.id !== evaluation.selectedOptionId)
                .map(opt => opt.id)
        };

        // Add to audit trail
        if (props.enableAuditTrail) {
            context.auditTrail.push({
                timestamp: result.timestamp,
                action: 'decision_made',
                userId: context.executedBy,
                details: {
                    decisionPointId: result.decisionPointId,
                    selectedOption: result.selectedOptionName,
                    automated: result.isAutomated,
                    confidenceScore: result.confidenceScore,
                    evaluationTime: evaluation.evaluationTime,
                    auditData: evaluation.auditData
                }
            });
        }

        return result;
    }

    /**
     * Handle post-decision actions
     */
    private async handlePostDecisionActions(
        context: SOPExecutionContext,
        props: DecisionPointProps,
        result: SOPDecisionResult
    ): Promise<void> {
        // Update execution state based on decision
        if (result.selectedOptionId) {
            const selectedOption = props.decisionConfiguration.options.find(opt => opt.id === result.selectedOptionId);
            
            if (selectedOption?.terminateProcess) {
                context.currentState = SOPExecutionState.COMPLETED;
            } else if (selectedOption?.nextStepId || selectedOption?.nextProcessId) {
                context.currentState = SOPExecutionState.COMPLETED;
                // In a full workflow engine, this would trigger the next step
                context.variables.nextStepId = selectedOption.nextStepId;
                context.variables.nextProcessId = selectedOption.nextProcessId;
            } else {
                context.currentState = SOPExecutionState.COMPLETED;
            }
        } else {
            // No decision made - may require escalation
            if (props.decisionConfiguration.timeoutBehavior === 'fail') {
                context.currentState = SOPExecutionState.FAILED;
            } else if (props.decisionConfiguration.timeoutBehavior === 'escalate') {
                context.currentState = SOPExecutionState.ESCALATED;
                context.escalationLevel = (context.escalationLevel || 0) + 1;
            } else {
                // Use default option
                const defaultOption = props.decisionConfiguration.options.find(opt => 
                    opt.id === props.decisionConfiguration.defaultOption
                );
                if (defaultOption) {
                    result.selectedOptionId = defaultOption.id;
                    result.selectedOptionName = defaultOption.name;
                    result.decisionReason = 'Default option selected due to timeout';
                    context.currentState = SOPExecutionState.COMPLETED;
                }
            }
        }

        // Handle compliance status update
        if (props.enableComplianceCheck) {
            context.complianceStatus = result.selectedOptionId 
                ? SOPComplianceStatus.COMPLIANT 
                : SOPComplianceStatus.REQUIRES_ATTENTION;
        }
    }

    /**
     * Get Activepieces piece configuration
     */
    public getPieceConfiguration() {
        return {
            displayName: this.decisionConfig.displayName,
            description: this.decisionConfig.description,
            category: this.getActivepiecesCategory(),
            logoUrl: 'https://cdn.activepieces.com/pieces/sop-decision-point.svg',
            actions: {
                evaluateDecision: createAction({
                    name: 'evaluateDecision',
                    displayName: 'Evaluate Decision Point',
                    description: 'Evaluate decision logic and determine workflow branching',
                    props: {
                        ...this.getCommonSOPProperties(),
                        ...this.getSOPSpecificProperties()
                    },
                    async run(context) {
                        const piece = new SOPDecisionPointPiece();
                        return await piece.execute(context.propsValue as DecisionPointProps, 'system');
                    }
                })
            },
            triggers: {},
            auth: PieceAuth.None()
        };
    }

    /**
     * Custom pre-run hook for decision point
     */
    protected async onPreRun(context: SOPExecutionContext, propsValue: DecisionPointProps): Promise<void> {
        // Validate decision configuration
        if (!propsValue.decisionConfiguration) {
            throw new Error('Decision configuration is required');
        }

        if (!propsValue.decisionConfiguration.options || propsValue.decisionConfiguration.options.length === 0) {
            throw new Error('At least one decision option must be configured');
        }

        // Log decision point start
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'decision_point_started',
            userId: context.executedBy,
            details: {
                decisionPointId: propsValue.decisionConfiguration.id,
                decisionType: propsValue.decisionConfiguration.decisionLogic.type,
                optionsCount: propsValue.decisionConfiguration.options.length,
                hasContextData: Object.keys(propsValue.contextData || {}).length > 0
            }
        });
    }

    /**
     * Custom post-run hook for decision point
     */
    protected async onPostRun(context: SOPExecutionContext, result: SOPDecisionResult): Promise<void> {
        // Log decision completion
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'decision_point_completed',
            userId: context.executedBy,
            details: {
                decisionPointId: result.decisionPointId,
                selectedOption: result.selectedOptionName,
                automated: result.isAutomated,
                confidenceScore: result.confidenceScore,
                finalState: context.currentState
            }
        });

        // Handle escalation if needed
        if (context.currentState === SOPExecutionState.ESCALATED) {
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'decision_escalated',
                userId: context.executedBy,
                details: {
                    escalationLevel: context.escalationLevel,
                    reason: 'Decision could not be resolved automatically'
                }
            });
        }
    }
}

// Export the piece configuration for Activepieces
export const sopDecisionPointPiece = new SOPDecisionPointPiece().getPieceConfiguration();