/**
 * SOP Workflow Types - Specific types for workflow execution and management
 */

import { Static, Type } from '@sinclair/typebox';
import { SOPExecutionState, SOPPriority, SOPComplianceStatus } from './sop-types';

/**
 * Workflow Step Configuration
 */
export const SOPWorkflowStep = Type.Object({
    id: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    type: Type.Union([
        Type.Literal('action'),
        Type.Literal('decision'),
        Type.Literal('approval'),
        Type.Literal('notification'),
        Type.Literal('delay')
    ]),
    config: Type.Record(Type.String(), Type.Unknown()),
    dependencies: Type.Array(Type.String()),
    timeout: Type.Optional(Type.Number()),
    retryConfig: Type.Optional(Type.Object({
        maxAttempts: Type.Number({ minimum: 1, maximum: 10 }),
        delay: Type.Number({ minimum: 0 }),
        backoffMultiplier: Type.Optional(Type.Number({ minimum: 1 }))
    })),
    conditions: Type.Optional(Type.Array(Type.Object({
        field: Type.String(),
        operator: Type.String(),
        value: Type.Unknown()
    })))
});

export type SOPWorkflowStep = Static<typeof SOPWorkflowStep>;

/**
 * Workflow Definition
 */
export const SOPWorkflowDefinition = Type.Object({
    id: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    version: Type.String(),
    steps: Type.Array(SOPWorkflowStep),
    triggers: Type.Array(Type.Object({
        type: Type.String(),
        config: Type.Record(Type.String(), Type.Unknown())
    })),
    variables: Type.Optional(Type.Record(Type.String(), Type.Object({
        type: Type.String(),
        defaultValue: Type.Optional(Type.Unknown()),
        required: Type.Boolean()
    }))),
    settings: Type.Optional(Type.Object({
        enableParallel: Type.Boolean(),
        maxConcurrency: Type.Number(),
        defaultTimeout: Type.Number(),
        enableAuditTrail: Type.Boolean()
    }))
});

export type SOPWorkflowDefinition = Static<typeof SOPWorkflowDefinition>;

/**
 * Workflow Execution Instance
 */
export const SOPWorkflowExecution = Type.Object({
    id: Type.String(),
    workflowId: Type.String(),
    workflowVersion: Type.String(),
    status: Type.Enum(SOPExecutionState),
    startedAt: Type.String({ format: 'date-time' }),
    completedAt: Type.Optional(Type.String({ format: 'date-time' })),
    initiatedBy: Type.String(),
    currentStep: Type.Optional(Type.String()),
    stepExecutions: Type.Array(Type.Object({
        stepId: Type.String(),
        status: Type.Enum(SOPExecutionState),
        startedAt: Type.String({ format: 'date-time' }),
        completedAt: Type.Optional(Type.String({ format: 'date-time' })),
        executedBy: Type.String(),
        result: Type.Optional(Type.Unknown()),
        error: Type.Optional(Type.String()),
        retryCount: Type.Number({ minimum: 0 })
    })),
    variables: Type.Record(Type.String(), Type.Unknown()),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

export type SOPWorkflowExecution = Static<typeof SOPWorkflowExecution>;

/**
 * Workflow Template
 */
export const SOPWorkflowTemplate = Type.Object({
    id: Type.String(),
    name: Type.String(),
    description: Type.String(),
    category: Type.String(),
    tags: Type.Array(Type.String()),
    definition: SOPWorkflowDefinition,
    createdBy: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    isPublic: Type.Boolean(),
    usageCount: Type.Number({ minimum: 0 }),
    rating: Type.Optional(Type.Number({ minimum: 1, maximum: 5 }))
});

export type SOPWorkflowTemplate = Static<typeof SOPWorkflowTemplate>;