import { Static, Type } from '@sinclair/typebox'
import { Cursor } from '@activepieces/shared'

// SOP Template ID type
export const SopTemplateId = Type.String({ format: 'uuid' })

// Base SOP Template entity
export const SopTemplate = Type.Object({
  id: SopTemplateId,
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  category: Type.String({ minLength: 1, maxLength: 100 }),
  templateData: Type.Record(Type.String(), Type.Any()),
  isPublic: Type.Boolean({ default: false }),
  usageCount: Type.Number({ minimum: 0, default: 0 }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})

// Create SOP Template Request
export const CreateSopTemplateRequest = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  category: Type.String({ minLength: 1, maxLength: 100 }),
  templateData: Type.Record(Type.String(), Type.Any()),
  isPublic: Type.Optional(Type.Boolean({ default: false })),
})

// Update SOP Template Request
export const UpdateSopTemplateRequest = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String()),
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  templateData: Type.Optional(Type.Record(Type.String(), Type.Any())),
  isPublic: Type.Optional(Type.Boolean()),
})

// List SOP Templates Request
export const ListSopTemplatesRequest = Type.Object({
  category: Type.Optional(Type.String()),
  isPublic: Type.Optional(Type.Boolean()),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  cursor: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('name'),
    Type.Literal('createdAt'),
    Type.Literal('usageCount'),
  ], { default: 'createdAt' })),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc'),
  ], { default: 'desc' })),
})

// Import SOP Template Request
export const ImportSopTemplateRequest = Type.Object({
  projectName: Type.String({ minLength: 1, maxLength: 255 }),
  projectDescription: Type.Optional(Type.String()),
  customizations: Type.Optional(Type.Record(Type.String(), Type.Any())),
})

// Export types
export type SopTemplate = Static<typeof SopTemplate>
export type SopTemplateId = Static<typeof SopTemplateId>
export type CreateSopTemplateRequest = Static<typeof CreateSopTemplateRequest>
export type UpdateSopTemplateRequest = Static<typeof UpdateSopTemplateRequest>
export type ImportSopTemplateRequest = Static<typeof ImportSopTemplateRequest>
export type ListSopTemplatesRequest = Omit<Static<typeof ListSopTemplatesRequest>, 'cursor'> & { 
  cursor: Cursor | undefined 
}