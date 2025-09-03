/**
 * SOP Types Index
 * Central export point for all SOP TypeScript types and interfaces
 * 
 * This module provides a comprehensive type system for SOP workflow development
 * with full Activepieces compatibility and complete type safety.
 */

// ============================================================================
// CORE SOP TYPES
// ============================================================================

export * from './sop-core';
export * from './sop-data-models';
export * from './activepieces-integration';

// ============================================================================
// NAVIGATION TYPES (Re-export from existing navigation types)
// ============================================================================

export * from '../frontend/navigation/types';

// ============================================================================
// TYPE UTILITY FUNCTIONS
// ============================================================================

import { 
  SOPProcess, 
  SOPProcessStep, 
  SOPExecutionContext,
  SOPPieceConfig,
  SOPValidationRule,
  ValidSOPProcess,
  ValidSOPProperty
} from './sop-core';

import {
  SOPProjectEntity,
  SOPStepEntity,
  SOPExecutionEntity,
  SOPBaseEntity
} from './sop-data-models';

import {
  ActivepiecesProperty,
  ActivepiecesPiece,
  ActivepiecesAction,
  ActivepiecesTrigger,
  SOPActivepiecesMapping,
  ActivepiecesValidationHelpers
} from './activepieces-integration';

/**
 * Type utility functions for SOP development
 */
export const SOPTypeUtils = {
  
  // ============================================================================
  // SOP PROCESS UTILITIES
  // ============================================================================
  
  /**
   * Check if an object is a valid SOP Process
   */
  isSOPProcess: (obj: any): obj is SOPProcess => {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.name === 'string' && 
           typeof obj.sopName === 'string' && 
           typeof obj.version === 'number' && 
           Array.isArray(obj.steps);
  },
  
  /**
   * Check if an object is a valid SOP Process Step
   */
  isSOPProcessStep: (obj: any): obj is SOPProcessStep => {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.name === 'string' && 
           typeof obj.stepType === 'string' && 
           typeof obj.position === 'number';
  },
  
  /**
   * Check if an object is a valid SOP Execution Context
   */
  isSOPExecutionContext: (obj: any): obj is SOPExecutionContext => {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.processId === 'string' && 
           obj.currentState && 
           obj.executionData;
  },
  
  /**
   * Extract step IDs from a process
   */
  extractStepIds: (process: SOPProcess): string[] => {
    return process.steps.map(step => step.id);
  },
  
  /**
   * Extract step names from a process
   */
  extractStepNames: (process: SOPProcess): string[] => {
    return process.steps.map(step => step.name);
  },
  
  /**
   * Get steps by type
   */
  getStepsByType: (process: SOPProcess, stepType: string): SOPProcessStep[] => {
    return process.steps.filter(step => step.stepType === stepType);
  },
  
  /**
   * Validate process structure
   */
  validateProcessStructure: (process: SOPProcess): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!process.id) errors.push('Process ID is required');
    if (!process.name) errors.push('Process name is required');
    if (!process.sopName) errors.push('Process SOP name is required');
    if (process.version < 1) errors.push('Process version must be >= 1');
    if (!Array.isArray(process.steps)) errors.push('Process steps must be an array');
    
    // Check for duplicate step IDs
    const stepIds = process.steps.map(step => step.id);
    const duplicateIds = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate step IDs found: ${duplicateIds.join(', ')}`);
    }
    
    // Check for invalid positions
    const positions = process.steps.map(step => step.position).sort((a, b) => a - b);
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] !== i + 1) {
        errors.push('Step positions must be consecutive starting from 1');
        break;
      }
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  // ============================================================================
  // DATA MODEL UTILITIES
  // ============================================================================
  
  /**
   * Check if an object is a valid SOP Entity
   */
  isSOPEntity: (obj: any): obj is SOPBaseEntity => {
    return obj && 
           typeof obj.id === 'string' && 
           obj.createdAt instanceof Date && 
           obj.updatedAt instanceof Date && 
           typeof obj.version === 'number';
  },
  
  /**
   * Check if an object is a valid SOP Project Entity
   */
  isSOPProjectEntity: (obj: any): obj is SOPProjectEntity => {
    return obj && 
           SOPTypeUtils.isSOPEntity(obj) && 
           typeof obj.name === 'string' && 
           typeof obj.sopName === 'string' && 
           typeof obj.status === 'string';
  },
  
  /**
   * Check if an object is a valid SOP Step Entity
   */
  isSOPStepEntity: (obj: any): obj is SOPStepEntity => {
    return obj && 
           SOPTypeUtils.isSOPEntity(obj) && 
           typeof obj.projectId === 'string' && 
           typeof obj.name === 'string' && 
           typeof obj.stepType === 'string' && 
           typeof obj.position === 'number';
  },
  
  /**
   * Check if an object is a valid SOP Execution Entity
   */
  isSOPExecutionEntity: (obj: any): obj is SOPExecutionEntity => {
    return obj && 
           SOPTypeUtils.isSOPEntity(obj) && 
           typeof obj.projectId === 'string' && 
           typeof obj.processName === 'string' && 
           typeof obj.status === 'string' && 
           obj.startedAt instanceof Date;
  },
  
  // ============================================================================
  // ACTIVEPIECES INTEGRATION UTILITIES
  // ============================================================================
  
  /**
   * Check if an object is a valid Activepieces Property
   */
  isActivepiecesProperty: (obj: any): obj is ActivepiecesProperty => {
    return ActivepiecesValidationHelpers.validateProperty(obj);
  },
  
  /**
   * Check if an object is a valid Activepieces Action
   */
  isActivepiecesAction: (obj: any): obj is ActivepiecesAction => {
    return ActivepiecesValidationHelpers.validateAction(obj);
  },
  
  /**
   * Check if an object is a valid Activepieces Trigger
   */
  isActivepiecesTrigger: (obj: any): obj is ActivepiecesTrigger => {
    return ActivepiecesValidationHelpers.validateTrigger(obj);
  },
  
  /**
   * Check if an object is a valid Activepieces Piece
   */
  isActivepiecesPiece: (obj: any): obj is ActivepiecesPiece => {
    return ActivepiecesValidationHelpers.validatePiece(obj);
  },
  
  /**
   * Extract property names from Activepieces action/trigger
   */
  extractPropertyNames: (actionOrTrigger: ActivepiecesAction | ActivepiecesTrigger): string[] => {
    return Object.keys(actionOrTrigger.props || {});
  },
  
  /**
   * Validate Activepieces piece structure
   */
  validateActivepiecesPiece: (piece: ActivepiecesPiece): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!piece.metadata) errors.push('Piece metadata is required');
    if (!piece.metadata?.name) errors.push('Piece name is required');
    if (!piece.metadata?.displayName) errors.push('Piece display name is required');
    if (!piece.metadata?.version) errors.push('Piece version is required');
    
    if (!piece.actions && !piece.triggers) {
      errors.push('Piece must have at least one action or trigger');
    }
    
    // Validate actions
    if (piece.actions) {
      Object.entries(piece.actions).forEach(([key, action]) => {
        if (!SOPTypeUtils.isActivepiecesAction(action)) {
          errors.push(`Invalid action: ${key}`);
        }
      });
    }
    
    // Validate triggers
    if (piece.triggers) {
      Object.entries(piece.triggers).forEach(([key, trigger]) => {
        if (!SOPTypeUtils.isActivepiecesTrigger(trigger)) {
          errors.push(`Invalid trigger: ${key}`);
        }
      });
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  // ============================================================================
  // MAPPING AND TRANSFORMATION UTILITIES
  // ============================================================================
  
  /**
   * Create default SOP-Activepieces mapping
   */
  createDefaultMapping: (sopProcess: SOPProcess): SOPActivepiecesMapping => {
    return {
      sopProcess: {
        activepiecesFlow: `sop_${sopProcess.id}`,
        mappingRules: []
      },
      sopSteps: sopProcess.steps.reduce((acc, step) => {
        acc[step.id] = {
          activepiecesPiece: 'custom',
          propertyMapping: {},
          configurationMapping: {}
        };
        return acc;
      }, {} as Record<string, any>),
      dataMapping: {
        inputMapping: {},
        outputMapping: {},
        transformationRules: []
      },
      authMapping: {}
    };
  },
  
  /**
   * Validate SOP-Activepieces mapping
   */
  validateMapping: (mapping: SOPActivepiecesMapping): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!mapping.sopProcess?.activepiecesFlow) {
      errors.push('Activepieces flow mapping is required');
    }
    
    if (!mapping.sopSteps || Object.keys(mapping.sopSteps).length === 0) {
      errors.push('At least one step mapping is required');
    }
    
    // Validate step mappings
    Object.entries(mapping.sopSteps || {}).forEach(([stepId, stepMapping]) => {
      if (!stepMapping.activepiecesPiece) {
        errors.push(`Activepieces piece is required for step: ${stepId}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  },
  
  // ============================================================================
  // VALIDATION UTILITIES
  // ============================================================================
  
  /**
   * Validate SOP validation rule
   */
  validateSOPValidationRule: (rule: SOPValidationRule): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!rule.id) errors.push('Validation rule ID is required');
    if (!rule.name) errors.push('Validation rule name is required');
    if (!rule.type) errors.push('Validation rule type is required');
    if (!rule.rule) errors.push('Validation rule logic is required');
    if (!rule.errorMessage) errors.push('Validation rule error message is required');
    
    return { valid: errors.length === 0, errors };
  },
  
  /**
   * Apply validation rules to data
   */
  applyValidationRules: (data: any, rules: SOPValidationRule[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      try {
        let isValid = true;
        
        switch (rule.type) {
          case 'required':
            isValid = data != null && data !== '';
            break;
          case 'format':
            if (typeof rule.rule === 'string') {
              const regex = new RegExp(rule.rule);
              isValid = regex.test(String(data));
            } else if (rule.rule instanceof RegExp) {
              isValid = rule.rule.test(String(data));
            }
            break;
          case 'custom':
            if (typeof rule.rule === 'function') {
              isValid = rule.rule(data);
            }
            break;
          default:
            // Handle other validation types
            break;
        }
        
        if (!isValid) {
          errors.push(rule.errorMessage);
        }
      } catch (error) {
        errors.push(`Validation error in rule ${rule.name}: ${error}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  // ============================================================================
  // DEEP CLONING UTILITIES
  // ============================================================================
  
  /**
   * Deep clone SOP Process
   */
  cloneSOPProcess: (process: SOPProcess): SOPProcess => {
    return JSON.parse(JSON.stringify(process));
  },
  
  /**
   * Deep clone SOP Execution Context
   */
  cloneSOPExecutionContext: (context: SOPExecutionContext): SOPExecutionContext => {
    return JSON.parse(JSON.stringify(context));
  },
  
  /**
   * Deep clone Activepieces Piece
   */
  cloneActivepiecesPiece: (piece: ActivepiecesPiece): ActivepiecesPiece => {
    return JSON.parse(JSON.stringify(piece));
  },
  
  // ============================================================================
  // SERIALIZATION UTILITIES
  // ============================================================================
  
  /**
   * Serialize SOP Process to JSON
   */
  serializeSOPProcess: (process: SOPProcess): string => {
    return JSON.stringify(process, null, 2);
  },
  
  /**
   * Deserialize SOP Process from JSON
   */
  deserializeSOPProcess: (json: string): SOPProcess => {
    return JSON.parse(json);
  },
  
  /**
   * Serialize Activepieces Piece to JSON
   */
  serializeActivepiecesPiece: (piece: ActivepiecesPiece): string => {
    return JSON.stringify(piece, (key, value) => {
      // Handle function serialization
      if (typeof value === 'function') {
        return value.toString();
      }
      return value;
    }, 2);
  },
  
  /**
   * Safe JSON parse with error handling
   */
  safeJSONParse: <T>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.warn('JSON parse error:', error);
      return fallback;
    }
  }
};

// ============================================================================
// TYPE GUARDS COLLECTION
// ============================================================================

/**
 * Comprehensive type guards for SOP types
 */
export const SOPTypeGuards = {
  
  // Core SOP types
  isSOPProcess: SOPTypeUtils.isSOPProcess,
  isSOPProcessStep: SOPTypeUtils.isSOPProcessStep,
  isSOPExecutionContext: SOPTypeUtils.isSOPExecutionContext,
  
  // Data model types
  isSOPEntity: SOPTypeUtils.isSOPEntity,
  isSOPProjectEntity: SOPTypeUtils.isSOPProjectEntity,
  isSOPStepEntity: SOPTypeUtils.isSOPStepEntity,
  isSOPExecutionEntity: SOPTypeUtils.isSOPExecutionEntity,
  
  // Activepieces types
  isActivepiecesProperty: SOPTypeUtils.isActivepiecesProperty,
  isActivepiecesAction: SOPTypeUtils.isActivepiecesAction,
  isActivepiecesTrigger: SOPTypeUtils.isActivepiecesTrigger,
  isActivepiecesPiece: SOPTypeUtils.isActivepiecesPiece,
  
  // Generic type checking
  isString: (value: any): value is string => typeof value === 'string',
  isNumber: (value: any): value is number => typeof value === 'number',
  isBoolean: (value: any): value is boolean => typeof value === 'boolean',
  isArray: (value: any): value is any[] => Array.isArray(value),
  isObject: (value: any): value is Record<string, any> => 
    value !== null && typeof value === 'object' && !Array.isArray(value),
  isDate: (value: any): value is Date => value instanceof Date,
  isFunction: (value: any): value is Function => typeof value === 'function'
};

// ============================================================================
// CONSTANTS AND ENUMS
// ============================================================================

/**
 * SOP Type Constants
 */
export const SOP_CONSTANTS = {
  
  // Version information
  TYPE_SYSTEM_VERSION: '1.0.0',
  SUPPORTED_ACTIVEPIECES_VERSIONS: ['0.68.0', '0.68.3'],
  
  // Default values
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRY_COUNT: 3,
  DEFAULT_RETRY_DELAY: 1000,
  
  // Validation limits
  MAX_PROCESS_STEPS: 1000,
  MAX_STEP_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_CUSTOM_FIELDS: 50,
  
  // Supported step types
  SUPPORTED_STEP_TYPES: [
    'action',
    'trigger', 
    'decision',
    'approval',
    'manual',
    'automation',
    'notification',
    'data_collection',
    'validation',
    'integration'
  ],
  
  // Supported property types
  SUPPORTED_PROPERTY_TYPES: [
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'file',
    'date',
    'email',
    'url'
  ],
  
  // Error codes
  ERROR_CODES: {
    INVALID_PROCESS: 'INVALID_PROCESS',
    INVALID_STEP: 'INVALID_STEP',
    INVALID_PROPERTY: 'INVALID_PROPERTY',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    MAPPING_ERROR: 'MAPPING_ERROR',
    INTEGRATION_ERROR: 'INTEGRATION_ERROR'
  }
};

// ============================================================================
// HELPER TYPE ALIASES
// ============================================================================

/**
 * Common type aliases for easier usage
 */
export type SOPProcessId = string;
export type SOPStepId = string;
export type SOPExecutionId = string;
export type ActivepiecesPieceId = string;
export type ActivepiecesFlowId = string;

export type SOPPropertyValue = any;
export type SOPConfigurationValue = any;
export type SOPValidationResult = { valid: boolean; errors: string[] };

export type SOPProcessCollection = Record<SOPProcessId, SOPProcess>;
export type SOPStepCollection = Record<SOPStepId, SOPProcessStep>;
export type SOPExecutionCollection = Record<SOPExecutionId, SOPExecutionContext>;

export type ActivepiecesPieceCollection = Record<ActivepiecesPieceId, ActivepiecesPiece>;
export type SOPMappingCollection = Record<string, SOPActivepiecesMapping>;

// ============================================================================
// FINAL EXPORTS
// ============================================================================

// Export utilities and guards
export { SOPTypeUtils };

// Export validation schemas (re-export)
export { 
  SOPProcessSchema, 
  SOPPropertySchema,
  ActivepiecesPropertySchema,
  ActivepiecesActionSchema,
  ActivepiecesPieceSchema
} from './sop-core';

export {
  ValidSOPProcess,
  ValidSOPProperty
} from './sop-core';

export {
  ValidActivepiecesProperty,
  ValidActivepiecesAction,
  ValidActivepiecesPiece
} from './activepieces-integration';

// Default export with complete type system
export default {
  TypeUtils: SOPTypeUtils,
  TypeGuards: SOPTypeGuards,
  Constants: SOP_CONSTANTS,
  ValidationHelpers: ActivepiecesValidationHelpers
};

// ============================================================================
// TYPE SYSTEM METADATA
// ============================================================================

/**
 * Type system metadata for tooling and documentation
 */
export const SOPTypeSystemMetadata = {
  version: SOP_CONSTANTS.TYPE_SYSTEM_VERSION,
  created: new Date('2025-01-01'),
  lastUpdated: new Date(),
  description: 'Comprehensive TypeScript type system for SOP workflow development with Activepieces integration',
  features: [
    'Complete SOP workflow type definitions',
    'Full Activepieces compatibility',
    'Comprehensive data models',
    'Runtime type validation',
    'Type-safe integration patterns',
    'Extensive utility functions',
    'Schema validation support'
  ],
  compatibility: {
    activepieces: SOP_CONSTANTS.SUPPORTED_ACTIVEPIECES_VERSIONS,
    typescript: '>= 4.5.0',
    nodejs: '>= 16.0.0'
  },
  maintainers: [
    'SOP Development Team'
  ]
};

/**
 * Export comprehensive type information for development tools
 */
export const SOPTypeInformation = {
  coreTypes: [
    'SOPProcess',
    'SOPProcessStep', 
    'SOPExecutionContext',
    'SOPPieceConfig',
    'SOPValidationRule'
  ],
  dataModelTypes: [
    'SOPProjectEntity',
    'SOPStepEntity',
    'SOPExecutionEntity',
    'SOPBaseEntity'
  ],
  activepiecesTypes: [
    'ActivepiecesProperty',
    'ActivepiecesPiece',
    'ActivepiecesAction',
    'ActivepiecesTrigger'
  ],
  integrationTypes: [
    'SOPActivepiecesMapping',
    'SOPActivepiecesIntegrationConfig',
    'SOPActivepiecesPieceRegistry'
  ],
  utilityTypes: [
    'SOPTypeUtils',
    'SOPTypeGuards',
    'ActivepiecesValidationHelpers'
  ]
};