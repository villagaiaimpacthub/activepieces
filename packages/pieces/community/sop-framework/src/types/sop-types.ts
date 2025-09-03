/**
 * Core SOP Types and Interfaces
 * 
 * This file defines the fundamental types used throughout the SOP Framework,
 * including piece types, execution states, and core data structures.
 */

import { Static, Type } from '@sinclair/typebox';

/**
 * SOP Piece Categories - Extends Activepieces categories with SOP-specific ones
 */
export enum SOPPieceCategory {
    PROCESS_MANAGEMENT = 'PROCESS_MANAGEMENT',
    APPROVAL_WORKFLOWS = 'APPROVAL_WORKFLOWS',
    COMPLIANCE = 'COMPLIANCE',
    QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
    DOCUMENTATION = 'DOCUMENTATION',
    AUDIT_TRAIL = 'AUDIT_TRAIL',
    DECISION_SUPPORT = 'DECISION_SUPPORT',
    ESCALATION = 'ESCALATION'
}

/**
 * SOP Piece Types - Different categories of SOP workflow components
 */
export enum SOPPieceType {
    PROCESS_STEP = 'PROCESS_STEP',
    DECISION_POINT = 'DECISION_POINT',
    APPROVAL_GATE = 'APPROVAL_GATE',
    ESCALATION_TRIGGER = 'ESCALATION_TRIGGER',
    COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
    AUDIT_LOG = 'AUDIT_LOG',
    NOTIFICATION = 'NOTIFICATION',
    DATA_VALIDATION = 'DATA_VALIDATION',
    DOCUMENT_GENERATOR = 'DOCUMENT_GENERATOR',
    STATUS_TRACKER = 'STATUS_TRACKER'
}

/**
 * SOP Execution States
 */
export enum SOPExecutionState {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    WAITING_APPROVAL = 'WAITING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ESCALATED = 'ESCALATED',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    PAUSED = 'PAUSED'
}

/**
 * SOP Priority Levels
 */
export enum SOPPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
    CRITICAL = 'CRITICAL'
}

/**
 * SOP Compliance Status
 */
export enum SOPComplianceStatus {
    COMPLIANT = 'COMPLIANT',
    NON_COMPLIANT = 'NON_COMPLIANT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    REQUIRES_ATTENTION = 'REQUIRES_ATTENTION',
    EXEMPT = 'EXEMPT'
}

/**
 * Base SOP Metadata Structure
 */
export const SOPMetadata = Type.Object({
    sopId: Type.String({ description: 'Unique SOP identifier' }),
    version: Type.String({ description: 'SOP version number' }),
    title: Type.String({ description: 'SOP title' }),
    description: Type.Optional(Type.String({ description: 'SOP description' })),
    category: Type.Enum(SOPPieceCategory, { description: 'SOP category' }),
    pieceType: Type.Enum(SOPPieceType, { description: 'Type of SOP piece' }),
    priority: Type.Enum(SOPPriority, { description: 'Priority level' }),
    complianceRequired: Type.Boolean({ description: 'Whether compliance tracking is required' }),
    auditTrailRequired: Type.Boolean({ description: 'Whether audit trail is required' }),
    tags: Type.Array(Type.String(), { description: 'Tags for categorization' }),
    createdAt: Type.String({ format: 'date-time', description: 'Creation timestamp' }),
    updatedAt: Type.String({ format: 'date-time', description: 'Last update timestamp' }),
    createdBy: Type.String({ description: 'Creator user ID' }),
    department: Type.Optional(Type.String({ description: 'Responsible department' })),
    approvers: Type.Optional(Type.Array(Type.String(), { description: 'List of approver user IDs' }))
});

export type SOPMetadata = Static<typeof SOPMetadata>;

/**
 * SOP Execution Context
 */
export const SOPExecutionContext = Type.Object({
    executionId: Type.String({ description: 'Unique execution instance ID' }),
    sopMetadata: SOPMetadata,
    currentState: Type.Enum(SOPExecutionState, { description: 'Current execution state' }),
    startedAt: Type.String({ format: 'date-time', description: 'Execution start time' }),
    completedAt: Type.Optional(Type.String({ format: 'date-time', description: 'Execution completion time' })),
    executedBy: Type.String({ description: 'User ID who executed the step' }),
    assignedTo: Type.Optional(Type.String({ description: 'User ID assigned to current step' })),
    escalationLevel: Type.Number({ minimum: 0, description: 'Current escalation level' }),
    complianceStatus: Type.Enum(SOPComplianceStatus, { description: 'Compliance status' }),
    auditTrail: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        action: Type.String(),
        userId: Type.String(),
        details: Type.Record(Type.String(), Type.Unknown())
    }), { description: 'Audit trail entries' }),
    variables: Type.Record(Type.String(), Type.Unknown(), { description: 'SOP instance variables' }),
    attachments: Type.Optional(Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        type: Type.String(),
        url: Type.String(),
        uploadedAt: Type.String({ format: 'date-time' }),
        uploadedBy: Type.String()
    }), { description: 'Attached files and documents' }))
});

export type SOPExecutionContext = Static<typeof SOPExecutionContext>;

/**
 * SOP Validation Result
 */
export const SOPValidationResult = Type.Object({
    isValid: Type.Boolean({ description: 'Whether validation passed' }),
    errors: Type.Array(Type.Object({
        field: Type.String({ description: 'Field that failed validation' }),
        message: Type.String({ description: 'Error message' }),
        code: Type.String({ description: 'Error code' }),
        severity: Type.Union([Type.Literal('error'), Type.Literal('warning'), Type.Literal('info')])
    }), { description: 'Validation errors' }),
    warnings: Type.Array(Type.Object({
        field: Type.String(),
        message: Type.String(),
        code: Type.String()
    }), { description: 'Validation warnings' }),
    complianceChecks: Type.Array(Type.Object({
        rule: Type.String({ description: 'Compliance rule name' }),
        status: Type.Enum(SOPComplianceStatus),
        message: Type.Optional(Type.String({ description: 'Compliance check message' }))
    }), { description: 'Compliance validation results' })
});

export type SOPValidationResult = Static<typeof SOPValidationResult>;

/**
 * SOP Event Data
 */
export const SOPEventData = Type.Object({
    eventId: Type.String({ description: 'Unique event identifier' }),
    eventType: Type.String({ description: 'Type of SOP event' }),
    timestamp: Type.String({ format: 'date-time', description: 'Event timestamp' }),
    sopId: Type.String({ description: 'Related SOP ID' }),
    executionId: Type.Optional(Type.String({ description: 'Related execution ID' })),
    userId: Type.Optional(Type.String({ description: 'User who triggered the event' })),
    data: Type.Record(Type.String(), Type.Unknown(), { description: 'Event-specific data' }),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: 'Additional event metadata' }))
});

export type SOPEventData = Static<typeof SOPEventData>;

/**
 * SOP Configuration Schema
 */
export const SOPConfiguration = Type.Object({
    enableAuditTrail: Type.Boolean({ default: true, description: 'Enable audit trail tracking' }),
    enableComplianceChecking: Type.Boolean({ default: true, description: 'Enable compliance validation' }),
    enableNotifications: Type.Boolean({ default: true, description: 'Enable notifications' }),
    defaultPriority: Type.Enum(SOPPriority, { default: SOPPriority.NORMAL, description: 'Default priority level' }),
    escalationTimeouts: Type.Record(Type.String(), Type.Number(), { description: 'Escalation timeouts in minutes' }),
    approvalTimeouts: Type.Record(Type.String(), Type.Number(), { description: 'Approval timeouts in minutes' }),
    complianceRules: Type.Array(Type.String(), { description: 'Enabled compliance rules' }),
    customFields: Type.Optional(Type.Record(Type.String(), Type.Object({
        type: Type.String(),
        required: Type.Boolean(),
        default: Type.Optional(Type.Unknown())
    }), { description: 'Custom field definitions' }))
});

export type SOPConfiguration = Static<typeof SOPConfiguration>;

/**
 * SOP Integration Point
 */
export interface SOPIntegrationPoint {
    name: string;
    type: 'input' | 'output' | 'bidirectional';
    description: string;
    required: boolean;
    dataSchema: unknown;
    validationRules?: string[];
}