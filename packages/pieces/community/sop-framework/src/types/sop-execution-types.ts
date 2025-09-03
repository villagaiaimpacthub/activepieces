/**
 * SOP Execution Types - Types specific to execution engine and runtime
 */

import { Static, Type } from '@sinclair/typebox';
import { SOPExecutionState, SOPComplianceStatus } from './sop-types';

/**
 * Execution Plan
 */
export const SOPExecutionPlan = Type.Object({
    id: Type.String(),
    sopId: Type.String(),
    executionOrder: Type.Array(Type.Object({
        stepId: Type.String(),
        dependsOn: Type.Array(Type.String()),
        parallel: Type.Boolean(),
        critical: Type.Boolean()
    })),
    estimatedDuration: Type.Number(),
    requiredResources: Type.Array(Type.String()),
    riskLevel: Type.Union([
        Type.Literal('low'),
        Type.Literal('medium'),
        Type.Literal('high'),
        Type.Literal('critical')
    ]),
    createdAt: Type.String({ format: 'date-time' })
});

export type SOPExecutionPlan = Static<typeof SOPExecutionPlan>;

/**
 * Execution Runtime
 */
export const SOPExecutionRuntime = Type.Object({
    executionId: Type.String(),
    startTime: Type.String({ format: 'date-time' }),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    state: Type.Enum(SOPExecutionState),
    currentStep: Type.Optional(Type.String()),
    progress: Type.Number({ minimum: 0, maximum: 100 }),
    metrics: Type.Object({
        stepsCompleted: Type.Number({ minimum: 0 }),
        stepsTotal: Type.Number({ minimum: 0 }),
        averageStepTime: Type.Number({ minimum: 0 }),
        failureCount: Type.Number({ minimum: 0 }),
        retryCount: Type.Number({ minimum: 0 })
    }),
    resources: Type.Object({
        memory: Type.Optional(Type.Number()),
        cpu: Type.Optional(Type.Number()),
        storage: Type.Optional(Type.Number())
    }),
    environment: Type.Record(Type.String(), Type.String())
});

export type SOPExecutionRuntime = Static<typeof SOPExecutionRuntime>;

/**
 * Step Execution Details
 */
export const SOPStepExecution = Type.Object({
    stepId: Type.String(),
    executionId: Type.String(),
    parentExecutionId: Type.Optional(Type.String()),
    state: Type.Enum(SOPExecutionState),
    startedAt: Type.String({ format: 'date-time' }),
    completedAt: Type.Optional(Type.String({ format: 'date-time' })),
    executedBy: Type.String(),
    assignedTo: Type.Optional(Type.String()),
    input: Type.Record(Type.String(), Type.Unknown()),
    output: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    error: Type.Optional(Type.Object({
        message: Type.String(),
        code: Type.String(),
        stack: Type.Optional(Type.String()),
        recoverable: Type.Boolean()
    })),
    validation: Type.Optional(Type.Object({
        isValid: Type.Boolean(),
        errors: Type.Array(Type.String()),
        warnings: Type.Array(Type.String())
    })),
    compliance: Type.Optional(Type.Object({
        status: Type.Enum(SOPComplianceStatus),
        checks: Type.Array(Type.Object({
            rule: Type.String(),
            status: Type.Enum(SOPComplianceStatus),
            message: Type.Optional(Type.String())
        }))
    })),
    metrics: Type.Object({
        duration: Type.Optional(Type.Number()),
        retryCount: Type.Number({ minimum: 0 }),
        memoryPeak: Type.Optional(Type.Number()),
        cpuTime: Type.Optional(Type.Number())
    }),
    logs: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        level: Type.Union([
            Type.Literal('debug'),
            Type.Literal('info'),
            Type.Literal('warn'),
            Type.Literal('error')
        ]),
        message: Type.String(),
        data: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
    }))
});

export type SOPStepExecution = Static<typeof SOPStepExecution>;

/**
 * Execution Report
 */
export const SOPExecutionReport = Type.Object({
    executionId: Type.String(),
    sopId: Type.String(),
    sopTitle: Type.String(),
    executedBy: Type.String(),
    startTime: Type.String({ format: 'date-time' }),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    status: Type.Enum(SOPExecutionState),
    duration: Type.Optional(Type.Number()),
    summary: Type.Object({
        totalSteps: Type.Number({ minimum: 0 }),
        completedSteps: Type.Number({ minimum: 0 }),
        failedSteps: Type.Number({ minimum: 0 }),
        skippedSteps: Type.Number({ minimum: 0 }),
        successRate: Type.Number({ minimum: 0, maximum: 100 })
    }),
    compliance: Type.Object({
        overallStatus: Type.Enum(SOPComplianceStatus),
        checkedRules: Type.Number({ minimum: 0 }),
        passedRules: Type.Number({ minimum: 0 }),
        failedRules: Type.Number({ minimum: 0 })
    }),
    performance: Type.Object({
        averageStepTime: Type.Number({ minimum: 0 }),
        totalRetries: Type.Number({ minimum: 0 }),
        peakMemoryUsage: Type.Optional(Type.Number()),
        totalCpuTime: Type.Optional(Type.Number())
    }),
    issues: Type.Array(Type.Object({
        severity: Type.Union([
            Type.Literal('low'),
            Type.Literal('medium'),
            Type.Literal('high'),
            Type.Literal('critical')
        ]),
        category: Type.String(),
        message: Type.String(),
        stepId: Type.Optional(Type.String()),
        recommendation: Type.Optional(Type.String())
    })),
    attachments: Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        type: Type.String(),
        size: Type.Number(),
        url: Type.String()
    })),
    metadata: Type.Record(Type.String(), Type.Unknown())
});

export type SOPExecutionReport = Static<typeof SOPExecutionReport>;