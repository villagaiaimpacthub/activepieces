/**
 * Process Step Types - Specific types and interfaces for Process Step pieces
 */

import { Static, Type } from '@sinclair/typebox';
import { 
    SOPExecutionState, 
    SOPComplianceStatus, 
    SOPPriority,
    SOPExecutionContext 
} from '../../../../types/sop-types';

/**
 * Process Step Configuration
 */
export const ProcessStepConfig = Type.Object({
    title: Type.String({ description: 'Step title' }),
    instructions: Type.String({ description: 'Detailed instructions for the step' }),
    estimatedDuration: Type.Optional(Type.Number({ description: 'Estimated duration in minutes' })),
    priority: Type.Enum(SOPPriority, { description: 'Step priority' }),
    requiredPermissions: Type.Optional(Type.Array(Type.String(), { description: 'Required permissions to execute' })),
    inputSchema: Type.Optional(Type.Unknown({ description: 'JSON schema for input validation' })),
    outputSchema: Type.Optional(Type.Unknown({ description: 'JSON schema for output validation' })),
    validationRules: Type.Optional(Type.Array(Type.String(), { description: 'Custom validation rules' })),
    skipConditions: Type.Optional(Type.Array(Type.String(), { description: 'Conditions for skipping this step' })),
    successCriteria: Type.Optional(Type.Array(Type.String(), { description: 'Success validation criteria' })),
    failureCriteria: Type.Optional(Type.Array(Type.String(), { description: 'Failure detection criteria' }))
});

export type ProcessStepConfig = Static<typeof ProcessStepConfig>;

/**
 * Process Step Execution Result
 */
export const ProcessStepResult = Type.Object({
    success: Type.Boolean({ description: 'Whether the step executed successfully' }),
    executionId: Type.String({ description: 'Unique execution identifier' }),
    sopId: Type.String({ description: 'SOP identifier' }),
    stepTitle: Type.String({ description: 'Title of the executed step' }),
    executionTime: Type.Number({ description: 'Total execution time in milliseconds' }),
    result: Type.Optional(Type.Unknown({ description: 'Step execution result data' })),
    error: Type.Optional(Type.String({ description: 'Error message if step failed' })),
    complianceStatus: Type.Enum(SOPComplianceStatus, { description: 'Compliance validation status' }),
    auditTrail: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        action: Type.String(),
        userId: Type.String(),
        details: Type.Record(Type.String(), Type.Unknown())
    }), { description: 'Complete audit trail for this execution' }),
    metadata: Type.Object({
        executedBy: Type.String(),
        completedAt: Type.Optional(Type.String({ format: 'date-time' })),
        failedAt: Type.Optional(Type.String({ format: 'date-time' })),
        priority: Type.Enum(SOPPriority),
        tags: Type.Optional(Type.Array(Type.String())),
        retryCount: Type.Optional(Type.Number()),
        escalationLevel: Type.Optional(Type.Number())
    }, { description: 'Execution metadata' })
});

export type ProcessStepResult = Static<typeof ProcessStepResult>;

/**
 * Process Step Event Data
 */
export const ProcessStepEvent = Type.Object({
    eventType: Type.String({ description: 'Type of step event' }),
    timestamp: Type.String({ format: 'date-time', description: 'Event timestamp' }),
    executionId: Type.String({ description: 'Execution identifier' }),
    sopId: Type.String({ description: 'SOP identifier' }),
    stepDetails: Type.Object({
        title: Type.String(),
        description: Type.Optional(Type.String()),
        assignedTo: Type.Optional(Type.String()),
        priority: Type.Enum(SOPPriority),
        state: Type.Enum(SOPExecutionState),
        complianceStatus: Type.Enum(SOPComplianceStatus),
        tags: Type.Optional(Type.Array(Type.String())),
        estimatedDuration: Type.Optional(Type.Number()),
        actualDuration: Type.Optional(Type.Number()),
        inputData: Type.Optional(Type.Unknown()),
        outputData: Type.Optional(Type.Unknown())
    }, { description: 'Step details' }),
    executionContext: Type.Object({
        executedBy: Type.String(),
        startedAt: Type.String({ format: 'date-time' }),
        completedAt: Type.Optional(Type.String({ format: 'date-time' })),
        escalationLevel: Type.Number(),
        retryCount: Type.Number()
    }, { description: 'Execution context' }),
    auditTrail: Type.Optional(Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        action: Type.String(),
        userId: Type.String(),
        details: Type.Record(Type.String(), Type.Unknown())
    })), { description: 'Audit trail entries' }),
    customVariables: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: 'Custom variables' }))
});

export type ProcessStepEvent = Static<typeof ProcessStepEvent>;

/**
 * Approval Workflow Data
 */
export const ApprovalWorkflow = Type.Object({
    stepExecutionId: Type.String({ description: 'Step execution requiring approval' }),
    approvers: Type.Array(Type.String(), { description: 'List of approver user IDs' }),
    status: Type.Union([
        Type.Literal('pending'),
        Type.Literal('approved'),
        Type.Literal('rejected'),
        Type.Literal('timeout')
    ], { description: 'Approval status' }),
    requestedAt: Type.String({ format: 'date-time', description: 'When approval was requested' }),
    respondedAt: Type.Optional(Type.String({ format: 'date-time', description: 'When approval was given/denied' })),
    approvedBy: Type.Optional(Type.String({ description: 'User who provided approval' })),
    rejectionReason: Type.Optional(Type.String({ description: 'Reason for rejection' })),
    comments: Type.Optional(Type.String({ description: 'Approval comments' })),
    timeoutMinutes: Type.Optional(Type.Number({ description: 'Approval timeout in minutes' }))
});

export type ApprovalWorkflow = Static<typeof ApprovalWorkflow>;

/**
 * Step Validation Context
 */
export const StepValidationContext = Type.Object({
    stepConfig: ProcessStepConfig,
    inputData: Type.Unknown({ description: 'Input data to validate' }),
    executionContext: SOPExecutionContext,
    customRules: Type.Optional(Type.Array(Type.String(), { description: 'Additional validation rules' })),
    skipValidation: Type.Optional(Type.Boolean({ description: 'Whether to skip validation' }))
});

export type StepValidationContext = Static<typeof StepValidationContext>;

/**
 * Process Step Error Types
 */
export enum ProcessStepErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    EXECUTION_ERROR = 'EXECUTION_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    COMPLIANCE_ERROR = 'COMPLIANCE_ERROR',
    APPROVAL_ERROR = 'APPROVAL_ERROR',
    ESCALATION_ERROR = 'ESCALATION_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

/**
 * Process Step Error Details
 */
export const ProcessStepError = Type.Object({
    type: Type.Enum(ProcessStepErrorType, { description: 'Error type' }),
    message: Type.String({ description: 'Error message' }),
    code: Type.Optional(Type.String({ description: 'Error code' })),
    details: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: 'Error details' })),
    timestamp: Type.String({ format: 'date-time', description: 'When error occurred' }),
    stepId: Type.Optional(Type.String({ description: 'Step ID where error occurred' })),
    recoverable: Type.Boolean({ description: 'Whether error is recoverable' }),
    retryable: Type.Boolean({ description: 'Whether step can be retried' })
});

export type ProcessStepError = Static<typeof ProcessStepError>;

/**
 * Output Format Types
 */
export enum OutputFormat {
    JSON = 'json',
    TEXT = 'text',
    FILE = 'file',
    BOOLEAN = 'boolean',
    CUSTOM = 'custom'
}

/**
 * Step Execution Metrics
 */
export const StepExecutionMetrics = Type.Object({
    executionId: Type.String({ description: 'Execution identifier' }),
    stepTitle: Type.String({ description: 'Step title' }),
    startTime: Type.String({ format: 'date-time' }),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    duration: Type.Optional(Type.Number({ description: 'Execution duration in milliseconds' })),
    status: Type.Enum(SOPExecutionState),
    complianceStatus: Type.Enum(SOPComplianceStatus),
    retryCount: Type.Number({ default: 0 }),
    escalationLevel: Type.Number({ default: 0 }),
    inputDataSize: Type.Optional(Type.Number({ description: 'Size of input data in bytes' })),
    outputDataSize: Type.Optional(Type.Number({ description: 'Size of output data in bytes' })),
    validationTime: Type.Optional(Type.Number({ description: 'Time spent on validation in milliseconds' })),
    processingTime: Type.Optional(Type.Number({ description: 'Time spent on processing in milliseconds' })),
    auditTrailEntries: Type.Number({ description: 'Number of audit trail entries created' })
});

export type StepExecutionMetrics = Static<typeof StepExecutionMetrics>;