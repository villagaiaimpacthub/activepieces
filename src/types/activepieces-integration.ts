/**
 * Activepieces Integration Types
 * Complete TypeScript integration layer for Activepieces compatibility
 * 
 * This module provides seamless integration between SOP workflows and Activepieces
 * platform, ensuring full compatibility and type safety.
 */

import { Static, Type, TSchema } from '@sinclair/typebox';

// ============================================================================
// ACTIVEPIECES CORE TYPES
// ============================================================================

/**
 * Activepieces Property Types
 * Standard Activepieces property type definitions
 */
export enum ActivepiecesPropertyType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MARKDOWN = 'MARKDOWN',
  NUMBER = 'NUMBER',
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
  MULTI_SELECT_DROPDOWN = 'MULTI_SELECT_DROPDOWN',
  STATIC_DROPDOWN = 'STATIC_DROPDOWN',
  STATIC_MULTI_SELECT_DROPDOWN = 'STATIC_MULTI_SELECT_DROPDOWN',
  DATE_TIME = 'DATE_TIME',
  FILE = 'FILE',
  JSON = 'JSON',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  OAUTH2 = 'OAUTH2',
  SECRET_TEXT = 'SECRET_TEXT',
  BASIC_AUTH = 'BASIC_AUTH',
  CUSTOM_AUTH = 'CUSTOM_AUTH',
  DYNAMIC = 'DYNAMIC'
}

/**
 * Activepieces Authentication Types
 * Authentication method types supported by Activepieces
 */
export enum ActivepiecesAuthType {
  NONE = 'NONE',
  API_KEY = 'API_KEY',
  BEARER_TOKEN = 'BEARER_TOKEN',
  BASIC = 'BASIC',
  OAUTH2 = 'OAUTH2',
  CUSTOM = 'CUSTOM'
}

/**
 * Activepieces Piece Types
 * Types of pieces in Activepieces
 */
export enum ActivepiecesPieceType {
  OFFICIAL = 'OFFICIAL',
  COMMUNITY = 'COMMUNITY',
  CUSTOM = 'CUSTOM'
}

/**
 * Activepieces Flow Status
 * Flow execution status in Activepieces
 */
export enum ActivepiecesFlowStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

/**
 * Activepieces Run Status
 * Flow run status in Activepieces
 */
export enum ActivepiecesRunStatus {
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}

// ============================================================================
// ACTIVEPIECES BASE INTERFACES
// ============================================================================

/**
 * Activepieces Property Base interface
 * Base interface for all Activepieces properties
 */
export interface ActivepiecesPropertyBase {
  displayName: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
}

/**
 * Activepieces Property Options interface
 * Options for dropdown/select properties
 */
export interface ActivepiecesPropertyOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Activepieces Dynamic Property interface
 * Dynamic property configuration
 */
export interface ActivepiecesDynamicProperty {
  refreshers: string[];
  refreshOnSearch?: boolean;
  options: (context: any) => Promise<ActivepiecesPropertyOption[]>;
}

/**
 * Activepieces Validation interface
 * Property validation configuration
 */
export interface ActivepiecesValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
  custom?: (value: any, context: any) => string | null;
}

// ============================================================================
// ACTIVEPIECES PROPERTY DEFINITIONS
// ============================================================================

/**
 * Activepieces Short Text Property
 */
export interface ActivepiecesShortTextProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.SHORT_TEXT;
  placeholder?: string;
  validation?: ActivepiecesValidation;
}

/**
 * Activepieces Long Text Property
 */
export interface ActivepiecesLongTextProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.LONG_TEXT;
  placeholder?: string;
  validation?: ActivepiecesValidation;
}

/**
 * Activepieces Markdown Property
 */
export interface ActivepiecesMarkdownProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.MARKDOWN;
  placeholder?: string;
}

/**
 * Activepieces Number Property
 */
export interface ActivepiecesNumberProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.NUMBER;
  placeholder?: string;
  validation?: ActivepiecesValidation & {
    min?: number;
    max?: number;
    step?: number;
  };
}

/**
 * Activepieces Checkbox Property
 */
export interface ActivepiecesCheckboxProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.CHECKBOX;
}

/**
 * Activepieces Dropdown Property
 */
export interface ActivepiecesDropdownProperty<T = any> extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.DROPDOWN;
  refreshers: string[];
  options: (context: any) => Promise<ActivepiecesPropertyOption<T>[]>;
  placeholder?: string;
}

/**
 * Activepieces Multi-Select Dropdown Property
 */
export interface ActivepiecesMultiSelectDropdownProperty<T = any> extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.MULTI_SELECT_DROPDOWN;
  refreshers: string[];
  options: (context: any) => Promise<ActivepiecesPropertyOption<T>[]>;
  placeholder?: string;
}

/**
 * Activepieces Static Dropdown Property
 */
export interface ActivepiecesStaticDropdownProperty<T = any> extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.STATIC_DROPDOWN;
  options: ActivepiecesPropertyOption<T>[];
  placeholder?: string;
}

/**
 * Activepieces Static Multi-Select Dropdown Property
 */
export interface ActivepiecesStaticMultiSelectDropdownProperty<T = any> extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.STATIC_MULTI_SELECT_DROPDOWN;
  options: ActivepiecesPropertyOption<T>[];
  placeholder?: string;
}

/**
 * Activepieces Date Time Property
 */
export interface ActivepiecesDateTimeProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.DATE_TIME;
  format?: string;
}

/**
 * Activepieces File Property
 */
export interface ActivepiecesFileProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.FILE;
  acceptedTypes?: string[];
  maxSize?: number;
}

/**
 * Activepieces JSON Property
 */
export interface ActivepiecesJsonProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.JSON;
  validation?: ActivepiecesValidation;
}

/**
 * Activepieces Array Property
 */
export interface ActivepiecesArrayProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.ARRAY;
  properties: Record<string, ActivepiecesProperty>;
  validation?: ActivepiecesValidation & {
    minItems?: number;
    maxItems?: number;
  };
}

/**
 * Activepieces Object Property
 */
export interface ActivepiecesObjectProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.OBJECT;
  properties: Record<string, ActivepiecesProperty>;
  additionalProperties?: boolean;
}

/**
 * Activepieces OAuth2 Property
 */
export interface ActivepiecesOAuth2Property extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.OAUTH2;
  authUrl: string;
  tokenUrl: string;
  scope?: string[];
  extra?: Record<string, any>;
}

/**
 * Activepieces Secret Text Property
 */
export interface ActivepiecesSecretTextProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.SECRET_TEXT;
  placeholder?: string;
}

/**
 * Activepieces Basic Auth Property
 */
export interface ActivepiecesBasicAuthProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.BASIC_AUTH;
  username: ActivepiecesShortTextProperty;
  password: ActivepiecesSecretTextProperty;
}

/**
 * Activepieces Custom Auth Property
 */
export interface ActivepiecesCustomAuthProperty extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.CUSTOM_AUTH;
  properties: Record<string, ActivepiecesProperty>;
  validate?: (auth: any) => Promise<{ valid: boolean; error?: string }>;
}

/**
 * Activepieces Dynamic Property
 */
export interface ActivepiecesDynamicPropertyDef extends ActivepiecesPropertyBase {
  type: ActivepiecesPropertyType.DYNAMIC;
  props: (context: any) => Promise<ActivepiecesProperty>;
}

/**
 * Union type for all Activepieces properties
 */
export type ActivepiecesProperty = 
  | ActivepiecesShortTextProperty
  | ActivepiecesLongTextProperty
  | ActivepiecesMarkdownProperty
  | ActivepiecesNumberProperty
  | ActivepiecesCheckboxProperty
  | ActivepiecesDropdownProperty
  | ActivepiecesMultiSelectDropdownProperty
  | ActivepiecesStaticDropdownProperty
  | ActivepiecesStaticMultiSelectDropdownProperty
  | ActivepiecesDateTimeProperty
  | ActivepiecesFileProperty
  | ActivepiecesJsonProperty
  | ActivepiecesArrayProperty
  | ActivepiecesObjectProperty
  | ActivepiecesOAuth2Property
  | ActivepiecesSecretTextProperty
  | ActivepiecesBasicAuthProperty
  | ActivepiecesCustomAuthProperty
  | ActivepiecesDynamicPropertyDef;

// ============================================================================
// ACTIVEPIECES ACTION AND TRIGGER INTERFACES
// ============================================================================

/**
 * Activepieces Action Context interface
 * Context provided to action execution
 */
export interface ActivepiecesActionContext {
  auth: any;
  propsValue: Record<string, any>;
  store: ActivepiecesStore;
  connections: ActivepiecesConnections;
  files: ActivepiecesFiles;
  run: ActivepiecesRun;
}

/**
 * Activepieces Trigger Context interface
 * Context provided to trigger execution
 */
export interface ActivepiecesTriggerContext {
  auth: any;
  propsValue: Record<string, any>;
  store: ActivepiecesStore;
  webhookUrl?: string;
  connections: ActivepiecesConnections;
  files: ActivepiecesFiles;
}

/**
 * Activepieces Store interface
 * Key-value store for pieces
 */
export interface ActivepiecesStore {
  put: (key: string, value: any, scope?: 'FLOW' | 'PROJECT') => Promise<void>;
  get: (key: string, scope?: 'FLOW' | 'PROJECT') => Promise<any>;
  delete: (key: string, scope?: 'FLOW' | 'PROJECT') => Promise<void>;
}

/**
 * Activepieces Connections interface
 * Connection management
 */
export interface ActivepiecesConnections {
  get: (key: string) => Promise<any>;
}

/**
 * Activepieces Files interface
 * File management
 */
export interface ActivepiecesFiles {
  write: (data: Buffer | string, filename?: string) => Promise<ActivepiecesFile>;
}

/**
 * Activepieces File interface
 * File object
 */
export interface ActivepiecesFile {
  filename: string;
  data: Buffer;
  url?: string;
  extension: string;
}

/**
 * Activepieces Run interface
 * Current run information
 */
export interface ActivepiecesRun {
  id: string;
  flowId: string;
  projectId: string;
  status: ActivepiecesRunStatus;
  startTime: string;
  finishTime?: string;
}

/**
 * Activepieces Action interface
 * Action definition
 */
export interface ActivepiecesAction {
  name: string;
  displayName: string;
  description: string;
  props: Record<string, ActivepiecesProperty>;
  requireAuth?: boolean;
  sampleData?: any;
  run: (context: ActivepiecesActionContext) => Promise<any>;
  test?: (context: ActivepiecesActionContext) => Promise<any>;
}

/**
 * Activepieces Trigger interface
 * Trigger definition
 */
export interface ActivepiecesTrigger {
  name: string;
  displayName: string;
  description: string;
  props: Record<string, ActivepiecesProperty>;
  type: 'POLLING' | 'WEBHOOK';
  requireAuth?: boolean;
  sampleData?: any;
  
  // For polling triggers
  run?: (context: ActivepiecesTriggerContext) => Promise<any[]>;
  
  // For webhook triggers
  onEnable?: (context: ActivepiecesTriggerContext) => Promise<void>;
  onDisable?: (context: ActivepiecesTriggerContext) => Promise<void>;
  
  // Test function
  test?: (context: ActivepiecesTriggerContext) => Promise<any>;
}

// ============================================================================
// ACTIVEPIECES PIECE DEFINITION
// ============================================================================

/**
 * Activepieces Piece Auth interface
 * Authentication configuration for piece
 */
export interface ActivepiecesPieceAuth {
  type: ActivepiecesAuthType;
  properties?: Record<string, ActivepiecesProperty>;
  validate?: (auth: any) => Promise<{ valid: boolean; error?: string }>;
  refresh?: (auth: any) => Promise<any>;
}

/**
 * Activepieces Piece Metadata interface
 * Metadata for Activepieces piece
 */
export interface ActivepiecesPieceMetadata {
  name: string;
  displayName: string;
  description?: string;
  version: string;
  minimumSupportedRelease?: string;
  maximumSupportedRelease?: string;
  logoUrl?: string;
  tags?: string[];
  categories?: string[];
  authors?: string[];
  keywords?: string[];
}

/**
 * Activepieces Piece Definition interface
 * Complete piece definition for Activepieces
 */
export interface ActivepiecesPiece {
  metadata: ActivepiecesPieceMetadata;
  auth?: ActivepiecesPieceAuth;
  actions: Record<string, ActivepiecesAction>;
  triggers: Record<string, ActivepiecesTrigger>;
  events?: Record<string, any>;
}

// ============================================================================
// SOP-ACTIVEPIECES INTEGRATION TYPES
// ============================================================================

/**
 * SOP Activepieces Mapping interface
 * Mapping between SOP and Activepieces concepts
 */
export interface SOPActivepiecesMapping {
  // Process mapping
  sopProcess: {
    activepiecesFlow: string;
    mappingRules: SOPActivepiecesMappingRule[];
  };
  
  // Step mapping
  sopSteps: Record<string, {
    activepiecesPiece: string;
    activepiecesAction?: string;
    activepiecesTrigger?: string;
    propertyMapping: Record<string, string>;
    configurationMapping: Record<string, any>;
  }>;
  
  // Data mapping
  dataMapping: {
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
    transformationRules: SOPDataTransformationRule[];
  };
  
  // Authentication mapping
  authMapping: Record<string, {
    sopAuthType: string;
    activepiecesAuthType: ActivepiecesAuthType;
    credentialMapping: Record<string, string>;
  }>;
}

/**
 * SOP Activepieces Mapping Rule interface
 * Rule for mapping SOP concepts to Activepieces
 */
export interface SOPActivepiecesMappingRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  mapping: Record<string, any>;
  transformation?: string;
  enabled: boolean;
}

/**
 * SOP Data Transformation Rule interface
 * Rule for transforming data between SOP and Activepieces
 */
export interface SOPDataTransformationRule {
  id: string;
  name: string;
  sourceField: string;
  targetField: string;
  transformationType: 'direct' | 'format' | 'calculate' | 'lookup' | 'custom';
  transformationConfig: Record<string, any>;
  validationRules: string[];
  enabled: boolean;
}

/**
 * SOP Activepieces Integration Config interface
 * Configuration for SOP-Activepieces integration
 */
export interface SOPActivepiecesIntegrationConfig {
  // Connection settings
  activepiecesUrl: string;
  apiKey: string;
  projectId: string;
  
  // Sync settings
  enableAutoSync: boolean;
  syncInterval: number;
  syncDirection: 'sop_to_activepieces' | 'activepieces_to_sop' | 'bidirectional';
  
  // Mapping configuration
  defaultMapping: SOPActivepiecesMapping;
  customMappings: Record<string, SOPActivepiecesMapping>;
  
  // Error handling
  errorHandling: {
    retryAttempts: number;
    retryDelay: number;
    escalateAfter: number;
    notifyOnError: boolean;
  };
  
  // Performance settings
  batchSize: number;
  rateLimitPerSecond: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  
  // Security settings
  encryptionEnabled: boolean;
  validateCertificates: boolean;
  allowedIpRanges: string[];
  
  // Monitoring settings
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  metricsInterval: number;
}

/**
 * SOP Activepieces Flow Sync interface
 * Flow synchronization data
 */
export interface SOPActivepiecesFlowSync {
  sopProcessId: string;
  activepiecesFlowId: string;
  lastSyncTime: Date;
  syncStatus: 'success' | 'failure' | 'partial' | 'in_progress';
  syncDirection: 'sop_to_activepieces' | 'activepieces_to_sop';
  changesDetected: boolean;
  conflictResolution: 'manual' | 'automatic' | 'prefer_sop' | 'prefer_activepieces';
  syncLog: SOPActivepiecesSyncLogEntry[];
  nextSyncTime?: Date;
}

/**
 * SOP Activepieces Sync Log Entry interface
 * Log entry for sync operations
 */
export interface SOPActivepiecesSyncLogEntry {
  timestamp: Date;
  operation: 'sync_started' | 'sync_completed' | 'sync_failed' | 'conflict_detected' | 'conflict_resolved' | 'data_transformed' | 'validation_error';
  details: Record<string, any>;
  duration?: number;
  errorMessage?: string;
  affectedItems: string[];
}

/**
 * SOP Activepieces Piece Registry interface
 * Registry of available Activepieces pieces for SOP integration
 */
export interface SOPActivepiecesPieceRegistry {
  pieces: Record<string, SOPActivepiecesRegistryEntry>;
  categories: Record<string, string[]>;
  tags: Record<string, string[]>;
  lastUpdated: Date;
}

/**
 * SOP Activepieces Registry Entry interface
 * Registry entry for an Activepieces piece
 */
export interface SOPActivepiecesRegistryEntry {
  piece: ActivepiecesPiece;
  sopCompatibility: {
    compatible: boolean;
    compatibilityScore: number;
    supportedStepTypes: string[];
    limitations: string[];
    recommendations: string[];
  };
  mapping: {
    propertyMappings: Record<string, string>;
    defaultConfiguration: Record<string, any>;
    customizationOptions: Record<string, any>;
  };
  usage: {
    installCount: number;
    successRate: number;
    avgRating: number;
    reviews: number;
    lastUsed: Date;
  };
  metadata: {
    addedToRegistry: Date;
    lastUpdated: Date;
    version: string;
    changeLog: string[];
  };
}

// ============================================================================
// SOP PIECE CREATION HELPERS
// ============================================================================

/**
 * SOP Piece Factory interface
 * Factory for creating SOP-compatible Activepieces pieces
 */
export interface SOPPieceFactory {
  createAction: (config: SOPActionCreationConfig) => ActivepiecesAction;
  createTrigger: (config: SOPTriggerCreationConfig) => ActivepiecesTrigger;
  createPiece: (config: SOPPieceCreationConfig) => ActivepiecesPiece;
  validatePiece: (piece: ActivepiecesPiece) => SOPPieceValidationResult;
}

/**
 * SOP Action Creation Config interface
 * Configuration for creating SOP actions
 */
export interface SOPActionCreationConfig {
  sopStepConfig: any; // Reference to SOP step configuration
  activepiecesConfig: {
    name: string;
    displayName: string;
    description: string;
    properties: Record<string, ActivepiecesProperty>;
  };
  integrationConfig: SOPActivepiecesIntegrationConfig;
  customization?: Record<string, any>;
}

/**
 * SOP Trigger Creation Config interface
 * Configuration for creating SOP triggers
 */
export interface SOPTriggerCreationConfig {
  sopTriggerConfig: any; // Reference to SOP trigger configuration
  activepiecesConfig: {
    name: string;
    displayName: string;
    description: string;
    type: 'POLLING' | 'WEBHOOK';
    properties: Record<string, ActivepiecesProperty>;
  };
  integrationConfig: SOPActivepiecesIntegrationConfig;
  customization?: Record<string, any>;
}

/**
 * SOP Piece Creation Config interface
 * Configuration for creating SOP pieces
 */
export interface SOPPieceCreationConfig {
  sopProcessConfig: any; // Reference to SOP process configuration
  activepiecesMetadata: ActivepiecesPieceMetadata;
  actions: SOPActionCreationConfig[];
  triggers: SOPTriggerCreationConfig[];
  auth?: ActivepiecesPieceAuth;
  customization?: Record<string, any>;
}

/**
 * SOP Piece Validation Result interface
 * Result of SOP piece validation
 */
export interface SOPPieceValidationResult {
  valid: boolean;
  errors: SOPValidationError[];
  warnings: SOPValidationWarning[];
  recommendations: SOPValidationRecommendation[];
  compatibilityScore: number;
  sopComplianceScore: number;
}

/**
 * SOP Validation Error interface
 * Validation error details
 */
export interface SOPValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

/**
 * SOP Validation Warning interface
 * Validation warning details
 */
export interface SOPValidationWarning {
  code: string;
  message: string;
  field?: string;
  impact: 'low' | 'medium' | 'high';
  recommendation?: string;
}

/**
 * SOP Validation Recommendation interface
 * Validation recommendation details
 */
export interface SOPValidationRecommendation {
  type: 'performance' | 'security' | 'usability' | 'compliance';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  implementationGuide?: string;
}

// ============================================================================
// RUNTIME INTEGRATION TYPES
// ============================================================================

/**
 * SOP Activepieces Runtime Context interface
 * Runtime context for SOP-Activepieces integration
 */
export interface SOPActivepiecesRuntimeContext {
  sopExecutionId: string;
  activepiecesFlowRunId: string;
  activepiecesStepId?: string;
  sopStepId?: string;
  
  // Context data
  sopContext: Record<string, any>;
  activepiecesContext: ActivepiecesActionContext | ActivepiecesTriggerContext;
  
  // Integration metadata
  integrationMetadata: {
    mappingUsed: string;
    transformationApplied: string[];
    dataValidated: boolean;
    complianceChecked: boolean;
  };
  
  // Performance tracking
  performance: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    memoryUsed?: number;
    apiCallCount?: number;
  };
  
  // Error tracking
  errors: any[];
  warnings: any[];
}

/**
 * SOP Activepieces Event Bridge interface
 * Event bridge for SOP-Activepieces communication
 */
export interface SOPActivepiecesEventBridge {
  // Event emission
  emitSOPEvent: (event: SOPEvent) => Promise<void>;
  emitActivepiecesEvent: (event: ActivepiecesEvent) => Promise<void>;
  
  // Event handlers
  onSOPEvent: (eventType: string, handler: (event: SOPEvent) => Promise<void>) => void;
  onActivepiecesEvent: (eventType: string, handler: (event: ActivepiecesEvent) => Promise<void>) => void;
  
  // Event history
  getEventHistory: (filter?: EventFilter) => Promise<EventHistoryEntry[]>;
  
  // Configuration
  configure: (config: EventBridgeConfig) => void;
}

/**
 * SOP Event interface
 * Event from SOP system
 */
export interface SOPEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: Record<string, any>;
}

/**
 * Activepieces Event interface
 * Event from Activepieces system
 */
export interface ActivepiecesEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  flowId?: string;
  runId?: string;
  stepId?: string;
}

/**
 * Event Filter interface
 * Filter for event queries
 */
export interface EventFilter {
  types?: string[];
  sources?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

/**
 * Event History Entry interface
 * Historical event entry
 */
export interface EventHistoryEntry {
  event: SOPEvent | ActivepiecesEvent;
  processed: boolean;
  processedAt?: Date;
  processingTime?: number;
  errors?: string[];
}

/**
 * Event Bridge Config interface
 * Configuration for event bridge
 */
export interface EventBridgeConfig {
  bufferSize: number;
  batchSize: number;
  flushInterval: number;
  retryAttempts: number;
  deadLetterQueue: boolean;
  enableMetrics: boolean;
}

// ============================================================================
// TYPE SCHEMAS AND VALIDATION
// ============================================================================

/**
 * TypeBox schema for Activepieces Property validation
 */
export const ActivepiecesPropertySchema = Type.Object({
  displayName: Type.String(),
  description: Type.Optional(Type.String()),
  required: Type.Optional(Type.Boolean()),
  defaultValue: Type.Optional(Type.Any())
});

/**
 * TypeBox schema for Activepieces Action validation
 */
export const ActivepiecesActionSchema = Type.Object({
  name: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  props: Type.Record(Type.String(), Type.Any()),
  requireAuth: Type.Optional(Type.Boolean())
});

/**
 * TypeBox schema for Activepieces Piece validation
 */
export const ActivepiecesPieceSchema = Type.Object({
  metadata: Type.Object({
    name: Type.String(),
    displayName: Type.String(),
    version: Type.String()
  }),
  actions: Type.Record(Type.String(), Type.Any()),
  triggers: Type.Record(Type.String(), Type.Any())
});

/**
 * Validation helper functions
 */
export const ActivepiecesValidationHelpers = {
  validateProperty: (property: any): property is ActivepiecesProperty => {
    return typeof property.displayName === 'string' && 
           property.type && 
           Object.values(ActivepiecesPropertyType).includes(property.type);
  },
  
  validateAction: (action: any): action is ActivepiecesAction => {
    return typeof action.name === 'string' &&
           typeof action.displayName === 'string' &&
           typeof action.run === 'function';
  },
  
  validateTrigger: (trigger: any): trigger is ActivepiecesTrigger => {
    return typeof trigger.name === 'string' &&
           typeof trigger.displayName === 'string' &&
           (trigger.type === 'POLLING' || trigger.type === 'WEBHOOK');
  },
  
  validatePiece: (piece: any): piece is ActivepiecesPiece => {
    return piece.metadata &&
           typeof piece.metadata.name === 'string' &&
           typeof piece.actions === 'object' &&
           typeof piece.triggers === 'object';
  }
};

// ============================================================================
// UTILITY TYPES AND HELPERS
// ============================================================================

/**
 * Utility type for extracting property values
 */
export type ActivepiecesPropertyValue<T extends ActivepiecesProperty> = 
  T extends ActivepiecesNumberProperty ? number :
  T extends ActivepiecesCheckboxProperty ? boolean :
  T extends ActivepiecesDropdownProperty<infer U> ? U :
  T extends ActivepiecesMultiSelectDropdownProperty<infer U> ? U[] :
  T extends ActivepiecesStaticDropdownProperty<infer U> ? U :
  T extends ActivepiecesStaticMultiSelectDropdownProperty<infer U> ? U[] :
  T extends ActivepiecesDateTimeProperty ? Date :
  T extends ActivepiecesFileProperty ? ActivepiecesFile :
  T extends ActivepiecesJsonProperty ? any :
  T extends ActivepiecesArrayProperty ? any[] :
  T extends ActivepiecesObjectProperty ? Record<string, any> :
  string;

/**
 * Utility type for extracting property configuration from piece
 */
export type ActivepiecesPropsValue<T extends Record<string, ActivepiecesProperty>> = {
  [K in keyof T]: ActivepiecesPropertyValue<T[K]>;
};

/**
 * Type guard utilities
 */
export const ActivepiecesTypeGuards = {
  isShortTextProperty: (prop: ActivepiecesProperty): prop is ActivepiecesShortTextProperty => 
    prop.type === ActivepiecesPropertyType.SHORT_TEXT,
    
  isNumberProperty: (prop: ActivepiecesProperty): prop is ActivepiecesNumberProperty => 
    prop.type === ActivepiecesPropertyType.NUMBER,
    
  isDropdownProperty: (prop: ActivepiecesProperty): prop is ActivepiecesDropdownProperty => 
    prop.type === ActivepiecesPropertyType.DROPDOWN,
    
  isFileProperty: (prop: ActivepiecesProperty): prop is ActivepiecesFileProperty => 
    prop.type === ActivepiecesPropertyType.FILE,
    
  isOAuth2Property: (prop: ActivepiecesProperty): prop is ActivepiecesOAuth2Property => 
    prop.type === ActivepiecesPropertyType.OAUTH2
};

// ============================================================================
// EXPORT TYPES AND UTILITIES
// ============================================================================

// Export main types
export {
  ActivepiecesPropertyType,
  ActivepiecesAuthType,
  ActivepiecesPieceType,
  ActivepiecesFlowStatus,
  ActivepiecesRunStatus
};

// Export validation types
export type ValidActivepiecesProperty = Static<typeof ActivepiecesPropertySchema>;
export type ValidActivepiecesAction = Static<typeof ActivepiecesActionSchema>;
export type ValidActivepiecesPiece = Static<typeof ActivepiecesPieceSchema>;

// Export comprehensive type unions
export type AllActivepiecesTypes = 
  | ActivepiecesProperty 
  | ActivepiecesAction 
  | ActivepiecesTrigger 
  | ActivepiecesPiece;

export type AllSOPActivepiecesTypes = 
  | SOPActivepiecesMapping 
  | SOPActivepiecesIntegrationConfig 
  | SOPActivepiecesFlowSync 
  | SOPActivepiecesPieceRegistry;