/**
 * SOP Database Entity Types
 * TypeScript type definitions for SOP entities
 */

import { SopProjectStatus } from './sop-project.entity';
import { SopExecutionStatus } from './sop-execution.entity';
import { SopAuditAction, SopAuditEntityType } from './sop-audit-log.entity';

// Core entity interfaces for type safety
export interface ISopProject {
  id: string;
  name: string;
  description?: string | null;
  status: SopProjectStatus;
  metadata?: Record<string, any> | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISopStep {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  stepType: string;
  configuration?: Record<string, any> | null;
  position: number;
  parentStepId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISopTemplate {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  templateData: Record<string, any>;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISopExecution {
  id: string;
  projectId: string;
  stepId?: string | null;
  userId?: string | null;
  status: SopExecutionStatus;
  inputData?: Record<string, any> | null;
  outputData?: Record<string, any> | null;
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISopAuditLog {
  id: string;
  entityType: SopAuditEntityType;
  entityId: string;
  action: SopAuditAction;
  userId?: string | null;
  projectId?: string | null;
  stepId?: string | null;
  executionId?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

// Create/Update DTOs (Data Transfer Objects)
export interface CreateSopProjectDto {
  name: string;
  description?: string;
  status?: SopProjectStatus;
  metadata?: Record<string, any>;
}

export interface UpdateSopProjectDto extends Partial<CreateSopProjectDto> {
  version?: number;
}

export interface CreateSopStepDto {
  projectId: string;
  name: string;
  description?: string;
  stepType: string;
  configuration?: Record<string, any>;
  position: number;
  parentStepId?: string;
  isActive?: boolean;
}

export interface UpdateSopStepDto extends Partial<CreateSopStepDto> {}

export interface CreateSopTemplateDto {
  name: string;
  description?: string;
  category: string;
  templateData: Record<string, any>;
  isPublic?: boolean;
}

export interface UpdateSopTemplateDto extends Partial<CreateSopTemplateDto> {}

export interface CreateSopExecutionDto {
  projectId: string;
  stepId?: string;
  userId?: string;
  inputData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateSopExecutionDto {
  status?: SopExecutionStatus;
  outputData?: Record<string, any>;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface CreateSopAuditLogDto {
  entityType: SopAuditEntityType;
  entityId: string;
  action: SopAuditAction;
  userId?: string;
  projectId?: string;
  stepId?: string;
  executionId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}