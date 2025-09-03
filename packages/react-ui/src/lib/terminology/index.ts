/**
 * SOP Terminology Service - Main Export
 * 
 * Central export point for the complete terminology service
 */

// Core types
export * from './types';

// Terminology mappings and sets
export * from './mappings';

// Core service
export { terminologyService } from './service';
export type { TerminologyService } from './service';

// React hooks
export * from './hooks';

// React components
export * from './components';

// i18n integration
export * from './i18n-integration';

// Example usage (for development and testing)
export * from './example-usage';

// Setup and initialization
export * from './setup';

// Configuration utilities
export {
  createDefaultConfig,
  validateConfig,
  migrateConfig,
  exportConfig,
  importConfig,
  createTerminologySet,
  mergeTerminologySets,
  filterMappingsByContext,
  searchMappings,
  generateMappingStats,
  optimizeMappings
} from './utils';

// Development helpers
export {
  createTestMapping,
  mockTerminologyService,
  terminologyTestUtils,
  MockTerminologyService,
  createTestSet,
  createTestConfig
} from './test-utils';

// Version information
export const TERMINOLOGY_SERVICE_VERSION = '1.0.0';

// Re-export key constants for easy access
export {
  DEFAULT_TERMINOLOGY_SET,
  SOP_TERMINOLOGY_SET,
  CUSTOM_TERMINOLOGY_SET,
  TERMINOLOGY_SETS
} from './mappings';