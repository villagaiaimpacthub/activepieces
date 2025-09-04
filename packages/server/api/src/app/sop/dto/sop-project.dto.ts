import { Static, Type } from '@sinclair/typebox'
import { Cursor } from '@activepieces/shared'

// Enum for SOP Project Status
export const SopProjectStatus = Type.Union([
  Type.Literal('draft'),
  Type.Literal('active'),
  Type.Literal('archived'),
])

// SOP Project ID type
export const SopProjectId = Type.String({ format: 'uuid' })

// Base SOP Project entity
export const SopProject = Type.Object({
  id: SopProjectId,
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  status: SopProjectStatus,
  version: Type.Number({ minimum: 1, default: 1 }),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  steps: Type.Optional(Type.Array(Type.Object({
    id: Type.String(),
    name: Type.String(),
    order: Type.Number(),
    type: Type.String(),
  }))),
})

// Create SOP Project Request
export const CreateSopProjectRequest = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  status: Type.Optional(SopProjectStatus),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  steps: Type.Optional(Type.Array(Type.Object({
    name: Type.String(),
    type: Type.String(),
    description: Type.Optional(Type.String()),
    configuration: Type.Optional(Type.Record(Type.String(), Type.Any())),
    order: Type.Number({ minimum: 0 }),
  }))),
})

// Update SOP Project Request
export const UpdateSopProjectRequest = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String()),
  status: Type.Optional(SopProjectStatus),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  version: Type.Optional(Type.Number({ minimum: 1 })),
})

// List SOP Projects Request
export const ListSopProjectsRequest = Type.Object({
  status: Type.Optional(Type.Array(SopProjectStatus)),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  cursor: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  includeSteps: Type.Optional(Type.Boolean({ default: false })),
})

// Export types
export type SopProject = Static<typeof SopProject>
export type SopProjectId = Static<typeof SopProjectId>
export type CreateSopProjectRequest = Static<typeof CreateSopProjectRequest>
export type UpdateSopProjectRequest = Static<typeof UpdateSopProjectRequest>
export type ListSopProjectsRequest = Omit<Static<typeof ListSopProjectsRequest>, 'cursor'> & { 
  cursor: Cursor | undefined 
}