/**
 * SOP Database Entities Index
 * Exports all TypeORM entity classes for SOP functionality
 */

// Core SOP entities
export { SopProject, SopProjectStatus } from './sop-project.entity';
export { SopStep } from './sop-step.entity';
export { SopTemplate } from './sop-template.entity';

// Execution and audit entities
export { SopExecution, SopExecutionStatus } from './sop-execution.entity';
export {
  SopAuditLog,
  SopAuditAction,
  SopAuditEntityType,
} from './sop-audit-log.entity';

// TypeScript interfaces and DTOs
export * from './types';

// Entity array for TypeORM configuration
export const SOP_ENTITIES = [
  SopProject,
  SopStep,
  SopTemplate,
  SopExecution,
  SopAuditLog,
];