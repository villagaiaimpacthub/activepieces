/**
 * SOP Decision Point Types - Types specific to decision logic and branching
 * 
 * This module defines types for decision points, conditions, logic evaluation,
 * and decision outcomes within SOP workflows.
 */

import { Static, Type } from '@sinclair/typebox';

/**
 * Decision Point Type enumeration
 */
export enum DecisionPointType {
    AUTOMATED = 'automated',
    MANUAL = 'manual',
    HYBRID = 'hybrid',
    TIME_BASED = 'time_based',
    DATA_DRIVEN = 'data_driven',
    RULE_BASED = 'rule_based'
}

/**
 * Decision Operator enumeration for conditions
 */
export enum DecisionOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    GREATER_EQUAL = 'greater_equal',
    LESS_EQUAL = 'less_equal',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains',
    STARTS_WITH = 'starts_with',
    ENDS_WITH = 'ends_with',
    REGEX = 'regex',
    EXISTS = 'exists',
    NOT_EXISTS = 'not_exists',
    IN_LIST = 'in_list',
    NOT_IN_LIST = 'not_in_list',
    CUSTOM = 'custom'
}

/**
 * Logic Operator enumeration for combining conditions
 */
export enum LogicOperator {
    AND = 'AND',
    OR = 'OR',
    NOT = 'NOT',
    XOR = 'XOR',
    CUSTOM = 'CUSTOM'
}

/**
 * Decision Timeout Behavior enumeration
 */
export enum DecisionTimeoutBehavior {
    DEFAULT = 'default',
    FAIL = 'fail',
    ESCALATE = 'escalate',
    SKIP = 'skip',
    RETRY = 'retry'
}

/**
 * Decision Condition interface
 */
export interface SOPCondition {
    id: string;
    name?: string;
    description?: string;
    field: string;
    operator: DecisionOperator;
    value: any;
    customFunction?: string;
    weight?: number;
    required?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Decision Logic Configuration interface
 */
export interface SOPDecisionLogic {
    type: DecisionPointType;
    conditions: SOPCondition[];
    evaluationOrder: 'sequential' | 'parallel';
    operatorLogic: LogicOperator;
    customLogic?: string;
    timeoutMinutes?: number;
    retryAttempts?: number;
    retryDelayMinutes?: number;
    failureHandling: 'fail' | 'skip' | 'escalate' | 'default';
    cacheable?: boolean;
    cacheExpirationMinutes?: number;
}

/**
 * Decision Option interface
 */
export interface SOPDecisionOption {
    id: string;
    name: string;
    sopName: string;
    description?: string;
    nextStepId?: string;
    nextProcessId?: string;
    terminateProcess?: boolean;
    priority: number;
    conditions?: SOPCondition[];
    metadata?: Record<string, any>;
    outcomes?: DecisionOutcome[];
    validationRules?: ValidationRule[];
}

/**
 * Decision Outcome interface
 */
export interface DecisionOutcome {
    id: string;
    type: 'continue' | 'branch' | 'terminate' | 'escalate' | 'loop' | 'parallel';
    target?: string;
    data?: Record<string, any>;
    conditions?: SOPCondition[];
}

/**
 * Validation Rule interface for decisions
 */
export interface ValidationRule {
    id: string;
    type: 'required' | 'format' | 'range' | 'custom' | 'business_rule';
    rule: string | RegExp | ((value: any) => boolean);
    errorMessage: string;
    severity: 'error' | 'warning' | 'info';
    enabled: boolean;
}

/**
 * Decision Point Configuration interface
 */
export interface SOPDecisionPoint {
    id: string;
    name: string;
    sopName: string;
    description?: string;
    stepId: string;
    
    // Decision logic
    decisionLogic: SOPDecisionLogic;
    
    // Decision options
    options: SOPDecisionOption[];
    
    // Default behavior
    defaultOption?: string;
    timeoutBehavior: DecisionTimeoutBehavior;
    timeoutMinutes?: number;
    
    // Decision metadata
    decisionMaker?: string;
    requiresJustification: boolean;
    auditRequired: boolean;
    
    // Escalation settings
    escalationEnabled?: boolean;
    escalationRules?: EscalationRule[];
    maxEscalationLevel?: number;
    
    // Approval integration
    requiresApproval?: boolean;
    approvalWorkflow?: string;
    
    // Status
    isActive: boolean;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
    
    // Configuration
    configuration?: DecisionPointConfiguration;
}

/**
 * Decision Point Configuration interface
 */
export interface DecisionPointConfiguration {
    enableParallelEvaluation?: boolean;
    enableCaching?: boolean;
    cacheExpirationMinutes?: number;
    enableDebugLogging?: boolean;
    enableMetricsCollection?: boolean;
    customProperties?: Record<string, any>;
    notificationSettings?: NotificationSettings;
    integrationSettings?: IntegrationSettings;
}

/**
 * Escalation Rule interface
 */
export interface EscalationRule {
    id: string;
    name: string;
    triggerCondition: 'timeout' | 'no_decision' | 'high_confidence_required' | 'manual_review' | 'custom';
    triggerValue?: any;
    action: 'escalate' | 'notify' | 'assign' | 'approval_required' | 'custom';
    escalateTo?: string[];
    customAction?: string;
    maxEscalations?: number;
    cooldownMinutes?: number;
    isActive: boolean;
}

/**
 * Notification Settings interface
 */
export interface NotificationSettings {
    enabled: boolean;
    channels: string[];
    templates: Record<string, string>;
    recipients: string[];
    escalationNotifications: boolean;
    timeoutNotifications: boolean;
}

/**
 * Integration Settings interface
 */
export interface IntegrationSettings {
    enabledIntegrations: string[];
    webhookEndpoints?: string[];
    apiCallbacks?: string[];
    dataSourceIntegrations?: Record<string, any>;
}

/**
 * Decision Result interface
 */
export interface SOPDecisionResult {
    decisionPointId: string;
    selectedOptionId: string;
    selectedOptionName: string;
    decisionMaker?: string;
    decisionReason?: string;
    isAutomated: boolean;
    timestamp: string;
    confidenceScore?: number;
    alternativeOptions?: string[];
    
    // Evaluation details
    evaluationMetrics?: DecisionEvaluationMetrics;
    conditionResults?: ConditionEvaluationResult[];
    
    // Audit information
    auditData?: DecisionAuditData;
    
    // Escalation information
    escalationLevel?: number;
    escalationHistory?: EscalationHistoryEntry[];
    
    // Approval information (if required)
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    approvalDetails?: ApprovalDetails;
}

/**
 * Decision Evaluation Metrics interface
 */
export interface DecisionEvaluationMetrics {
    evaluationTime: number;
    conditionsEvaluated: number;
    conditionsPassed: number;
    conditionsFailed: number;
    customLogicExecuted: boolean;
    cacheHit?: boolean;
    retryCount?: number;
    memoryUsage?: number;
    cpuUsage?: number;
}

/**
 * Condition Evaluation Result interface
 */
export interface ConditionEvaluationResult {
    conditionId: string;
    field: string;
    operator: DecisionOperator;
    expectedValue: any;
    actualValue: any;
    result: boolean;
    evaluationTime: number;
    error?: string;
    weight?: number;
    metadata?: Record<string, any>;
}

/**
 * Decision Audit Data interface
 */
export interface DecisionAuditData {
    timestamp: string;
    decisionMaker: 'system' | 'user' | 'escalation';
    decisionMethod: 'automated' | 'manual' | 'timeout_default' | 'escalation' | 'error';
    conditionsEvaluated: ConditionEvaluationResult[];
    decisionPath: string[];
    contextData: Record<string, any>;
    justification?: string;
    reviewRequired: boolean;
    
    // Additional audit information
    sessionId?: string;
    correlationId?: string;
    sourceSystem?: string;
    userAgent?: string;
    ipAddress?: string;
    environment?: string;
}

/**
 * Escalation History Entry interface
 */
export interface EscalationHistoryEntry {
    id: string;
    level: number;
    timestamp: string;
    triggeredBy: string;
    reason: string;
    escalatedTo: string[];
    status: 'pending' | 'acknowledged' | 'resolved' | 'timeout';
    resolution?: string;
    resolvedAt?: string;
    resolvedBy?: string;
}

/**
 * Approval Details interface
 */
export interface ApprovalDetails {
    approvalId: string;
    approvalWorkflow: string;
    requestedAt: string;
    approvers: ApprovalApprover[];
    currentApprover?: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    comments?: string;
    attachments?: string[];
}

/**
 * Approval Approver interface
 */
export interface ApprovalApprover {
    id: string;
    name: string;
    email?: string;
    role?: string;
    level: number;
    required: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'timeout';
    respondedAt?: string;
    comments?: string;
    delegatedTo?: string;
}

/**
 * Decision Context interface
 */
export interface DecisionContext {
    executionId: string;
    processId: string;
    stepId: string;
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    
    // Input data
    inputData: Record<string, any>;
    variables: Record<string, any>;
    
    // Workflow context
    workflowState: Record<string, any>;
    previousDecisions: SOPDecisionResult[];
    
    // Environment context
    environment: string;
    timestamp: string;
    timezone?: string;
    locale?: string;
    
    // Security context
    permissions: string[];
    securityClassification?: string;
    
    // Metadata
    metadata?: Record<string, any>;
}

/**
 * Decision Configuration Schema using TypeBox
 */
export const DecisionPointSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    sopName: Type.String(),
    description: Type.Optional(Type.String()),
    stepId: Type.String(),
    decisionLogic: Type.Object({
        type: Type.Enum(DecisionPointType),
        conditions: Type.Array(Type.Object({
            id: Type.String(),
            field: Type.String(),
            operator: Type.Enum(DecisionOperator),
            value: Type.Unknown(),
            weight: Type.Optional(Type.Number())
        })),
        evaluationOrder: Type.Union([Type.Literal('sequential'), Type.Literal('parallel')]),
        operatorLogic: Type.Enum(LogicOperator),
        customLogic: Type.Optional(Type.String())
    }),
    options: Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        sopName: Type.String(),
        priority: Type.Number(),
        nextStepId: Type.Optional(Type.String()),
        terminateProcess: Type.Optional(Type.Boolean())
    })),
    defaultOption: Type.Optional(Type.String()),
    timeoutBehavior: Type.Enum(DecisionTimeoutBehavior),
    requiresJustification: Type.Boolean(),
    auditRequired: Type.Boolean(),
    isActive: Type.Boolean(),
    createdAt: Type.String(),
    updatedAt: Type.String()
});

export type ValidDecisionPoint = Static<typeof DecisionPointSchema>;

/**
 * Decision Result Schema using TypeBox
 */
export const DecisionResultSchema = Type.Object({
    decisionPointId: Type.String(),
    selectedOptionId: Type.String(),
    selectedOptionName: Type.String(),
    isAutomated: Type.Boolean(),
    timestamp: Type.String(),
    confidenceScore: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
    decisionReason: Type.Optional(Type.String())
});

export type ValidDecisionResult = Static<typeof DecisionResultSchema>;

// Export all enums
export {
    DecisionPointType,
    DecisionOperator,
    LogicOperator,
    DecisionTimeoutBehavior
};