import { Static, Type } from '@sinclair/typebox'
import { Cursor } from '@activepieces/shared'

// Enum for SOP Execution Status
export const SopExecutionStatus = Type.Union([
  Type.Literal('pending'),
  Type.Literal('running'),
  Type.Literal('completed'),
  Type.Literal('failed'),
  Type.Literal('cancelled'),
])

// SOP Execution ID type
export const SopExecutionId = Type.String({ format: 'uuid' })

// Base SOP Execution entity
export const SopExecution = Type.Object({
  id: SopExecutionId,
  projectId: Type.String({ format: 'uuid' }),
  stepId: Type.Optional(Type.String({ format: 'uuid' })),
  userId: Type.Optional(Type.String({ format: 'uuid' })),
  status: SopExecutionStatus,
  inputData: Type.Optional(Type.Record(Type.String(), Type.Any())),
  outputData: Type.Optional(Type.Record(Type.String(), Type.Any())),
  errorMessage: Type.Optional(Type.String()),
  startedAt: Type.Optional(Type.String({ format: 'date-time' })),
  completedAt: Type.Optional(Type.String({ format: 'date-time' })),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})

// Create SOP Execution Request
export const CreateSopExecutionRequest = Type.Object({
  sopProjectId: Type.String({ format: 'uuid' }),
  stepId: Type.Optional(Type.String({ format: 'uuid' })),
  inputData: Type.Optional(Type.Record(Type.String(), Type.Any())),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  priority: Type.Optional(Type.Union([
    Type.Literal('low'),
    Type.Literal('normal'),
    Type.Literal('high'),
    Type.Literal('urgent'),
  ], { default: 'normal' })),
})

// Update SOP Execution Request
export const UpdateSopExecutionRequest = Type.Object({
  status: Type.Optional(SopExecutionStatus),
  outputData: Type.Optional(Type.Record(Type.String(), Type.Any())),
  errorMessage: Type.Optional(Type.String()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
})

// List SOP Executions Request
export const ListSopExecutionsRequest = Type.Object({
  sopProjectId: Type.Optional(Type.String({ format: 'uuid' })),
  status: Type.Optional(Type.Array(SopExecutionStatus)),
  userId: Type.Optional(Type.String({ format: 'uuid' })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  cursor: Type.Optional(Type.String()),
  startedAfter: Type.Optional(Type.String({ format: 'date-time' })),
  startedBefore: Type.Optional(Type.String({ format: 'date-time' })),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('createdAt'),
    Type.Literal('startedAt'),
    Type.Literal('completedAt'),
    Type.Literal('status'),
  ], { default: 'createdAt' })),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc'),
  ], { default: 'desc' })),
})

// SOP Execution with relationships
export const SopExecutionWithRelations = Type.Intersect([
  SopExecution,
  Type.Object({
    project: Type.Optional(Type.Object({
      id: Type.String(),
      name: Type.String(),
      status: Type.String(),
    })),
    step: Type.Optional(Type.Object({
      id: Type.String(),
      name: Type.String(),
      type: Type.String(),
      order: Type.Number(),
    })),
    user: Type.Optional(Type.Object({
      id: Type.String(),
      email: Type.String(),
      firstName: Type.Optional(Type.String()),
      lastName: Type.Optional(Type.String()),
    })),
  }),
])

// Export types
export type SopExecution = Static<typeof SopExecution>
export type SopExecutionId = Static<typeof SopExecutionId>
export type SopExecutionStatus = Static<typeof SopExecutionStatus>
export type CreateSopExecutionRequest = Static<typeof CreateSopExecutionRequest>
export type UpdateSopExecutionRequest = Static<typeof UpdateSopExecutionRequest>
export type SopExecutionWithRelations = Static<typeof SopExecutionWithRelations>
export type ListSopExecutionsRequest = Omit<Static<typeof ListSopExecutionsRequest>, 'cursor'> & { 
  cursor: Cursor | undefined 
}