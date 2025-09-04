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
export { BaseSoPiece, type BaseSoPieceConfig } from './framework/base-sop-piece';
export { SOPWorkflowContext, type SOPContextData } from './framework/sop-workflow-context';
export { SOPPieceRegistry } from './framework/sop-piece-registry';
export { SOPExecutionEngine } from './framework/sop-execution-engine';
export { SOPValidationFramework, type SOPValidationRule } from './framework/sop-validation-framework';
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

// Framework Version
export const SOP_FRAMEWORK_VERSION = '0.1.0';
export const SOP_FRAMEWORK_NAME = 'SOP Framework';
export const SOP_FRAMEWORK_DESCRIPTION = 'Foundational framework for Standard Operating Procedure workflow components';