/**
 * SOP Framework - Foundational framework for Standard Operating Procedure workflow components
 * 
 * This is the main entry point for the SOP Framework that provides:
 * - Base SOP piece infrastructure
 * - Common SOP workflow patterns
 * - Integration with Activepieces core system
 * - SOP-specific validation and execution frameworks
 */

// Core Framework Exports
export { BaseSoPiece } from './framework/base-sop-piece';
export type { BaseSoPieceConfig } from './framework/base-sop-piece';
export { SOPWorkflowContext } from './framework/sop-workflow-context';
export type { SOPContextData } from './framework/sop-workflow-context';
export { SOPPieceRegistry } from './framework/sop-piece-registry';
export { SOPExecutionEngine } from './framework/sop-execution-engine';
export { SOPValidationFramework } from './framework/sop-validation-framework';
export type { SOPValidationRule } from './framework/sop-validation-framework';
export { SOPIntegrationHelpers } from './framework/sop-integration-helpers';

// Types and Interfaces
export * from './types/sop-types';
export * from './types/sop-workflow-types';
export * from './types/sop-execution-types';
export * from './types/sop-decision-types';

// Utilities
export * from './utils/sop-helpers';
export * from './utils/sop-validators';
export * from './utils/sop-formatters';
export * from './utils/decision-engine-utils';

// Constants
export * from './constants/sop-constants';

// Props and Common Elements
export * from './common/sop-props';
export * from './common/sop-auth';

// Concrete SOP Pieces
export { sopProcessStep } from './pieces/process-step';
export * from './pieces/process-step/lib/common/process-step-types';
export * from './pieces/process-step/lib/utils/process-step-helpers';

// Decision Point Piece
export { SOPDecisionPointPiece, sopDecisionPointPiece } from './pieces/decision-point-piece';
export type { DecisionPointConfig, DecisionPointProps, DecisionEvaluationResult } from './pieces/decision-point-piece';

// Data Form Piece
export { sopDataForm } from './pieces/data-form';
export * from './pieces/data-form/lib/common/data-form-types';
export { DataFormValidator } from './pieces/data-form/lib/validation/data-form-validator';
export { DataFormHelpers } from './pieces/data-form/lib/utils/data-form-helpers';
export { dataFormAction } from './pieces/data-form/lib/actions/data-form-action';
export * from './pieces/data-form/lib/triggers/data-form-trigger';

// Notification Piece
export { sopNotification } from './pieces/notification';
export * from './pieces/notification/lib/common/notification-types';
export { NotificationValidator } from './pieces/notification/lib/validation/notification-validator';
export { NotificationHelpers } from './pieces/notification/lib/utils/notification-helpers';
export { notificationAction } from './pieces/notification/lib/actions/notification-action';
export * from './pieces/notification/lib/triggers/notification-trigger';

// Compliance Piece
export { sopCompliance } from './pieces/compliance';
export * from './pieces/compliance/lib/common/compliance-types';
export { ComplianceValidator } from './pieces/compliance/lib/validation/compliance-validator';
export { ComplianceHelpers } from './pieces/compliance/lib/utils/compliance-helpers';
export { complianceAction } from './pieces/compliance/lib/actions/compliance-action';
export * from './pieces/compliance/lib/triggers/compliance-trigger';

// Framework Version
export const SOP_FRAMEWORK_VERSION = '0.1.0';
export const SOP_FRAMEWORK_NAME = 'SOP Framework';
export const SOP_FRAMEWORK_DESCRIPTION = 'Foundational framework for Standard Operating Procedure workflow components';