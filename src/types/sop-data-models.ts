/**
 * SOP Data Models and Entity Types
 * Comprehensive data model definitions for SOP workflow entities
 * 
 * This module provides complete data model types for SOP entities with database
 * mapping, validation, and relationship management capabilities.
 */

// ============================================================================
// DATABASE ENTITY BASE TYPES
// ============================================================================

/**
 * Base Entity interface
 * Common fields for all SOP database entities
 */
export interface SOPBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  metadata?: Record<string, any>;
}

/**
 * Auditable Entity interface
 * Entity with full audit trail capabilities
 */
export interface SOPAuditableEntity extends SOPBaseEntity {
  createdBy: string;
  updatedBy: string;
  lastModifiedBy: string;
  changeLog: SOPChangeLogEntry[];
  auditTrail: SOPAuditTrailEntry[];
}

/**
 * Versionable Entity interface
 * Entity with version control capabilities
 */
export interface SOPVersionableEntity extends SOPAuditableEntity {
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  versionLabel?: string;
  isLatestVersion: boolean;
  parentVersionId?: string;
  versionHistory: SOPVersionHistoryEntry[];
}

/**
 * Workflow Entity interface
 * Entity that participates in workflow processes
 */
export interface SOPWorkflowEntity extends SOPVersionableEntity {
  workflowStatus: 'draft' | 'pending_approval' | 'approved' | 'active' | 'suspended' | 'archived';
  workflowStage: string;
  assignedTo?: string;
  dueDate?: Date;
  escalationLevel: number;
  workflowData: Record<string, any>;
}

// ============================================================================
// CHANGE LOG AND AUDIT TRAIL TYPES
// ============================================================================

/**
 * Change Log Entry interface
 * Individual change log entry
 */
export interface SOPChangeLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'archive' | 'publish';
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  changeReason?: string;
  changeDescription?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Trail Entry interface
 * Comprehensive audit trail entry
 */
export interface SOPAuditTrailEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  outcome: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  duration?: number;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  riskScore?: number;
  complianceImpact?: 'none' | 'low' | 'medium' | 'high';
  hash: string;
}

/**
 * Version History Entry interface
 * Version history tracking entry
 */
export interface SOPVersionHistoryEntry {
  id: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  changeType: 'major' | 'minor' | 'patch';
  changeDescription: string;
  changeReason: string;
  approvedBy?: string;
  approvedAt?: Date;
  rollbackable: boolean;
  backupLocation?: string;
  migrationRequired: boolean;
  migrationScript?: string;
  tags: string[];
}

// ============================================================================
// SOP PROJECT DATA MODELS
// ============================================================================

/**
 * SOP Project Entity
 * Complete project data model
 */
export interface SOPProjectEntity extends SOPWorkflowEntity {
  // Basic information
  name: string;
  sopName: string;
  displayName: string;
  sopDisplayName: string;
  description?: string;
  sopDescription?: string;
  
  // Project classification
  category: string;
  subCategory?: string;
  businessFunction: string;
  department: string;
  businessUnit?: string;
  
  // Status and lifecycle
  status: 'draft' | 'active' | 'paused' | 'archived' | 'terminated';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  lifecycle: 'development' | 'testing' | 'production' | 'maintenance' | 'sunset';
  
  // Ownership and governance
  owner: string;
  ownerEmail: string;
  stakeholders: SOPStakeholder[];
  approvers: string[];
  reviewers: string[];
  
  // Business context
  businessJustification?: string;
  expectedBenefits: string[];
  successCriteria: string[];
  riskAssessment?: SOPRiskAssessment;
  
  // Compliance and regulatory
  regulatoryRequirements: string[];
  complianceFrameworks: string[];
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod: number;
  
  // Relationships
  parentProjectId?: string;
  childProjectIds: string[];
  relatedProjectIds: string[];
  dependentProjectIds: string[];
  
  // Configuration
  configuration: SOPProjectConfiguration;
  
  // Performance and metrics
  metrics?: SOPProjectMetricsData;
  
  // Documentation and resources
  documentationUrls: string[];
  trainingMaterials: string[];
  supportContacts: SOPContact[];
  
  // Scheduling and timing
  plannedStartDate?: Date;
  actualStartDate?: Date;
  plannedEndDate?: Date;
  actualEndDate?: Date;
  lastExecutionDate?: Date;
  nextScheduledDate?: Date;
  
  // Custom fields
  customFields: SOPCustomFieldValue[];
  
  // Integration
  integrations: SOPProjectIntegration[];
  
  // Notifications
  notifications: SOPNotificationSubscription[];
}

/**
 * SOP Stakeholder interface
 * Project stakeholder information
 */
export interface SOPStakeholder {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'sponsor' | 'approver' | 'reviewer' | 'contributor' | 'viewer';
  department: string;
  permissions: string[];
  notificationPreferences: string[];
  isActive: boolean;
}

/**
 * SOP Risk Assessment interface
 * Risk assessment data model
 */
export interface SOPRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: SOPRiskFactor[];
  mitigationStrategies: SOPMitigationStrategy[];
  contingencyPlans: SOPContingencyPlan[];
  lastAssessmentDate: Date;
  nextAssessmentDate: Date;
  assessedBy: string;
  approvedBy?: string;
}

/**
 * SOP Risk Factor interface
 * Individual risk factor
 */
export interface SOPRiskFactor {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'business' | 'regulatory' | 'security' | 'operational';
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number;
  status: 'identified' | 'analyzed' | 'mitigated' | 'accepted' | 'transferred';
  owner: string;
  dueDate?: Date;
}

/**
 * SOP Mitigation Strategy interface
 * Risk mitigation strategy
 */
export interface SOPMitigationStrategy {
  id: string;
  riskFactorId: string;
  strategy: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  description: string;
  actions: SOPMitigationAction[];
  cost?: number;
  timeline?: number;
  effectiveness: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'implemented' | 'verified';
  owner: string;
}

/**
 * SOP Mitigation Action interface
 * Individual mitigation action
 */
export interface SOPMitigationAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: Date;
  notes?: string;
  evidence?: string[];
}

/**
 * SOP Contingency Plan interface
 * Contingency plan for risk scenarios
 */
export interface SOPContingencyPlan {
  id: string;
  name: string;
  description: string;
  triggerConditions: string[];
  actions: SOPContingencyAction[];
  owner: string;
  activationCriteria: string;
  communicationPlan: string;
  resourceRequirements: SOPResourceRequirement[];
  testDate?: Date;
  testResults?: string;
}

/**
 * SOP Contingency Action interface
 * Individual contingency action
 */
export interface SOPContingencyAction {
  id: string;
  sequence: number;
  description: string;
  assignedTo: string;
  estimatedDuration: number;
  dependencies: string[];
  successCriteria: string;
}

/**
 * SOP Resource Requirement interface
 * Resource requirement specification
 */
export interface SOPResourceRequirement {
  id: string;
  type: 'human' | 'technical' | 'financial' | 'infrastructure';
  description: string;
  quantity: number;
  unit: string;
  cost?: number;
  availability: 'available' | 'reserved' | 'unavailable';
  alternativeOptions: string[];
}

/**
 * SOP Contact interface
 * Contact information
 */
export interface SOPContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  isActive: boolean;
  contactPreferences: string[];
}

/**
 * SOP Custom Field Value interface
 * Custom field value storage
 */
export interface SOPCustomFieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: 'string' | 'number' | 'boolean' | 'date' | 'object';
  value: any;
  lastUpdated: Date;
  updatedBy: string;
}

/**
 * SOP Project Integration interface
 * Project integration configuration
 */
export interface SOPProjectIntegration {
  id: string;
  name: string;
  type: 'activepieces' | 'api' | 'database' | 'webhook' | 'file' | 'custom';
  configuration: Record<string, any>;
  isEnabled: boolean;
  lastSync?: Date;
  syncStatus: 'success' | 'failure' | 'partial' | 'not_configured';
  errorMessage?: string;
  metadata: Record<string, any>;
}

/**
 * SOP Notification Subscription interface
 * Notification subscription data
 */
export interface SOPNotificationSubscription {
  id: string;
  userId: string;
  eventTypes: string[];
  channels: string[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  isEnabled: boolean;
  filters: Record<string, any>;
  lastNotification?: Date;
}

/**
 * SOP Project Configuration interface
 * Project configuration settings
 */
export interface SOPProjectConfiguration {
  // Execution settings
  enableParallelExecution: boolean;
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  maxRetries: number;
  retryInterval: number;
  
  // Approval settings
  requireApproval: boolean;
  approvalWorkflow: string;
  approvalTimeout: number;
  escalationEnabled: boolean;
  escalationInterval: number;
  
  // Notification settings
  enableNotifications: boolean;
  notificationChannels: string[];
  notificationTemplates: Record<string, string>;
  
  // Monitoring settings
  enableMonitoring: boolean;
  monitoringLevel: 'basic' | 'detailed' | 'comprehensive';
  alertThresholds: Record<string, number>;
  
  // Compliance settings
  enableCompliance: boolean;
  complianceLevel: 'basic' | 'enhanced' | 'strict';
  auditLevel: 'minimal' | 'standard' | 'comprehensive';
  dataRetention: number;
  
  // Security settings
  encryptionEnabled: boolean;
  encryptionLevel: 'standard' | 'enhanced';
  accessControlEnabled: boolean;
  ipRestrictions: string[];
  
  // Integration settings
  enableIntegrations: boolean;
  allowedIntegrations: string[];
  integrationTimeout: number;
  
  // Custom settings
  customSettings: Record<string, any>;
}

/**
 * SOP Project Metrics Data interface
 * Project performance metrics
 */
export interface SOPProjectMetricsData {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  
  // Success rates
  successRate: number;
  failureRate: number;
  timeoutRate: number;
  
  // Approval metrics
  averageApprovalTime: number;
  approvalSuccessRate: number;
  escalationRate: number;
  
  // Compliance metrics
  complianceScore: number;
  violationCount: number;
  auditScore: number;
  
  // Cost metrics
  executionCost: number;
  totalCost: number;
  costPerExecution: number;
  
  // Business metrics
  businessValue: number;
  timeToValue: number;
  customerSatisfaction: number;
  
  // Resource utilization
  cpuUtilization: number;
  memoryUtilization: number;
  storageUtilization: number;
  
  // Trend data
  dailyTrends: SOPMetricTrendPoint[];
  weeklyTrends: SOPMetricTrendPoint[];
  monthlyTrends: SOPMetricTrendPoint[];
  
  // Last calculation
  lastCalculated: Date;
  calculatedBy: string;
}

/**
 * SOP Metric Trend Point interface
 * Individual metric trend data point
 */
export interface SOPMetricTrendPoint {
  timestamp: Date;
  value: number;
  count: number;
  label: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// SOP STEP DATA MODELS
// ============================================================================

/**
 * SOP Step Entity
 * Complete step data model
 */
export interface SOPStepEntity extends SOPWorkflowEntity {
  // Basic information
  projectId: string;
  name: string;
  sopName: string;
  displayName: string;
  sopDisplayName: string;
  description?: string;
  sopDescription?: string;
  
  // Step classification
  stepType: 'action' | 'trigger' | 'decision' | 'approval' | 'manual' | 'automation' | 'notification' | 'data_collection' | 'validation' | 'integration';
  category: string;
  subCategory?: string;
  
  // Step positioning and relationships
  position: number;
  parentStepId?: string;
  childStepIds: string[];
  dependsOn: string[];
  dependents: string[];
  
  // Step configuration
  configuration: SOPStepConfiguration;
  
  // Properties and schema
  properties: SOPStepProperty[];
  inputSchema?: any;
  outputSchema?: any;
  validationRules: SOPStepValidationRule[];
  
  // Execution settings
  executionSettings: SOPStepExecutionConfiguration;
  
  // Activepieces integration
  activepiecesIntegration?: SOPActivepiecesIntegration;
  
  // Compliance and audit
  complianceSettings: SOPStepComplianceSettings;
  
  // Performance and monitoring
  monitoringSettings: SOPStepMonitoringSettings;
  metrics?: SOPStepMetricsData;
  
  // Error handling
  errorHandling: SOPStepErrorHandling;
  
  // Custom configuration
  customSettings: Record<string, any>;
  
  // Status and lifecycle
  isActive: boolean;
  status: 'draft' | 'testing' | 'active' | 'deprecated' | 'disabled';
  
  // Testing and validation
  testCases: SOPStepTestCase[];
  lastTestDate?: Date;
  testStatus: 'not_tested' | 'passed' | 'failed' | 'partial';
}

/**
 * SOP Step Property interface
 * Step property definition
 */
export interface SOPStepProperty {
  id: string;
  name: string;
  sopName: string;
  displayName: string;
  sopDisplayName: string;
  description?: string;
  sopDescription?: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file' | 'date' | 'email' | 'url';
  required: boolean;
  defaultValue?: any;
  validationRules: SOPStepValidationRule[];
  displayOrder: number;
  isVisible: boolean;
  isReadonly: boolean;
  category?: string;
  helpText?: string;
  placeholder?: string;
  options?: SOPPropertyOption[];
  dependsOn?: string[];
  showConditions?: SOPShowCondition[];
  customAttributes: Record<string, any>;
}

/**
 * SOP Property Option interface
 * Option for select/dropdown properties
 */
export interface SOPPropertyOption {
  value: any;
  label: string;
  sopLabel: string;
  description?: string;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, any>;
}

/**
 * SOP Show Condition interface
 * Condition for showing/hiding properties
 */
export interface SOPShowCondition {
  propertyName: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

/**
 * SOP Step Validation Rule interface
 * Validation rule for step properties
 */
export interface SOPStepValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'length' | 'range' | 'custom' | 'regex' | 'business_rule';
  rule: string | RegExp | ((value: any) => boolean);
  errorMessage: string;
  warningMessage?: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  applicableWhen?: SOPShowCondition[];
  customData?: Record<string, any>;
}

/**
 * SOP Step Configuration interface
 * Step-specific configuration
 */
export interface SOPStepConfiguration {
  // Basic settings
  timeout: number;
  retryCount: number;
  retryDelay: number;
  skipOnFailure: boolean;
  continueOnError: boolean;
  
  // Execution settings
  async: boolean;
  parallel: boolean;
  batchProcessing: boolean;
  batchSize?: number;
  
  // Input/Output settings
  inputMapping: SOPDataMapping[];
  outputMapping: SOPDataMapping[];
  dataTransformations: SOPDataTransformation[];
  
  // Custom code
  customCode?: string;
  customCodeLanguage?: 'javascript' | 'typescript' | 'python' | 'sql';
  
  // Manual instructions
  manualInstructions?: string;
  manualCheckpoints: SOPManualCheckpoint[];
  
  // Automation script
  automationScript?: string;
  automationParameters: Record<string, any>;
  
  // Conditional execution
  executionConditions: SOPExecutionCondition[];
  
  // Hooks and events
  hooks: SOPStepHookConfiguration[];
  
  // Custom settings
  customConfiguration: Record<string, any>;
}

/**
 * SOP Data Mapping interface
 * Data mapping configuration
 */
export interface SOPDataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
  required: boolean;
  validationRules: SOPStepValidationRule[];
}

/**
 * SOP Data Transformation interface
 * Data transformation rule
 */
export interface SOPDataTransformation {
  id: string;
  name: string;
  type: 'format' | 'convert' | 'calculate' | 'lookup' | 'custom';
  sourceFields: string[];
  targetField: string;
  transformationRule: string | Function;
  parameters: Record<string, any>;
  enabled: boolean;
}

/**
 * SOP Manual Checkpoint interface
 * Manual checkpoint definition
 */
export interface SOPManualCheckpoint {
  id: string;
  name: string;
  description: string;
  instructions: string;
  required: boolean;
  estimatedDuration: number;
  skillsRequired: string[];
  checklistItems: SOPChecklistItem[];
  evidenceRequired: boolean;
  approvalRequired: boolean;
}

/**
 * SOP Checklist Item interface
 * Individual checklist item
 */
export interface SOPChecklistItem {
  id: string;
  description: string;
  required: boolean;
  order: number;
  category?: string;
  helpText?: string;
  evidenceRequired: boolean;
}

/**
 * SOP Execution Condition interface
 * Condition for step execution
 */
export interface SOPExecutionCondition {
  id: string;
  name: string;
  condition: string;
  action: 'execute' | 'skip' | 'fail' | 'wait';
  parameters?: Record<string, any>;
  priority: number;
  enabled: boolean;
}

/**
 * SOP Step Hook Configuration interface
 * Hook configuration for step events
 */
export interface SOPStepHookConfiguration {
  id: string;
  event: 'before_execution' | 'after_execution' | 'on_success' | 'on_failure' | 'on_timeout' | 'on_retry';
  action: 'log' | 'notify' | 'execute_code' | 'call_webhook' | 'update_data' | 'trigger_step';
  configuration: Record<string, any>;
  enabled: boolean;
  order: number;
  conditions?: SOPExecutionCondition[];
}

/**
 * SOP Step Execution Configuration interface
 * Execution-specific configuration
 */
export interface SOPStepExecutionConfiguration {
  // Execution mode
  mode: 'synchronous' | 'asynchronous' | 'scheduled' | 'manual';
  
  // Resource limits
  maxMemory?: number;
  maxCpu?: number;
  maxDuration?: number;
  
  // Concurrency
  allowConcurrent: boolean;
  maxConcurrentInstances?: number;
  
  // Queue settings
  queuePriority: 'low' | 'normal' | 'high' | 'critical';
  queueTimeout?: number;
  
  // Caching
  cacheEnabled: boolean;
  cacheTtl?: number;
  cacheKey?: string;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetention: number;
  structuredLogging: boolean;
  
  // Monitoring
  enableMetrics: boolean;
  enableTracing: boolean;
  enableHealthChecks: boolean;
  
  // Security
  encryptOutput: boolean;
  sanitizeInputs: boolean;
  allowedNetworkAccess: string[];
  
  // Custom settings
  customExecutionSettings: Record<string, any>;
}

/**
 * SOP Activepieces Integration interface
 * Activepieces-specific integration settings
 */
export interface SOPActivepiecesIntegration {
  pieceId: string;
  pieceName: string;
  pieceVersion: string;
  actionId?: string;
  triggerId?: string;
  
  // Configuration mapping
  configurationMapping: Record<string, any>;
  
  // Property overrides
  propertyOverrides: Record<string, any>;
  
  // Authentication
  authenticationConfig?: Record<string, any>;
  
  // Compatibility
  compatibilityVersion: string;
  migrationRequired: boolean;
  
  // Custom settings
  customIntegrationSettings: Record<string, any>;
}

/**
 * SOP Step Compliance Settings interface
 * Compliance settings for steps
 */
export interface SOPStepComplianceSettings {
  enabled: boolean;
  requirements: string[];
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
  logAllData: boolean;
  encryptLogs: boolean;
  retentionPeriod: number;
  approvalRequired: boolean;
  witnessRequired: boolean;
  digitalSignatureRequired: boolean;
  evidenceRequired: boolean;
  complianceChecks: SOPComplianceCheck[];
}

/**
 * SOP Compliance Check interface
 * Individual compliance check
 */
export interface SOPComplianceCheck {
  id: string;
  name: string;
  description: string;
  type: 'automated' | 'manual' | 'hybrid';
  checkScript?: string;
  checkCriteria: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  frequency: 'every_execution' | 'daily' | 'weekly' | 'monthly';
}

/**
 * SOP Step Monitoring Settings interface
 * Monitoring settings for steps
 */
export interface SOPStepMonitoringSettings {
  enabled: boolean;
  collectMetrics: boolean;
  collectLogs: boolean;
  collectTraces: boolean;
  
  // Alert settings
  alerting: SOPStepAlerting;
  
  // Performance monitoring
  performanceThresholds: SOPPerformanceThreshold[];
  
  // Health checks
  healthChecks: SOPHealthCheckConfiguration[];
  
  // Custom monitoring
  customMonitoring: Record<string, any>;
}

/**
 * SOP Step Alerting interface
 * Alerting configuration for steps
 */
export interface SOPStepAlerting {
  enabled: boolean;
  channels: string[];
  thresholds: SOPAlertThresholdConfiguration[];
  escalation: SOPAlertEscalation;
  suppression: SOPAlertSuppression;
}

/**
 * SOP Alert Threshold Configuration interface
 * Alert threshold configuration
 */
export interface SOPAlertThresholdConfiguration {
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number;
  duration: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * SOP Alert Escalation interface
 * Alert escalation configuration
 */
export interface SOPAlertEscalation {
  enabled: boolean;
  levels: SOPEscalationLevel[];
  maxLevels: number;
  cooldownPeriod: number;
}

/**
 * SOP Escalation Level interface
 * Individual escalation level
 */
export interface SOPEscalationLevel {
  level: number;
  delayMinutes: number;
  channels: string[];
  recipients: string[];
  message?: string;
}

/**
 * SOP Alert Suppression interface
 * Alert suppression configuration
 */
export interface SOPAlertSuppression {
  enabled: boolean;
  suppressDuplicates: boolean;
  suppressionWindow: number;
  maxAlerts: number;
  suppressionRules: SOPSuppressionRule[];
}

/**
 * SOP Suppression Rule interface
 * Alert suppression rule
 */
export interface SOPSuppressionRule {
  id: string;
  name: string;
  condition: string;
  action: 'suppress' | 'group' | 'delay';
  parameters: Record<string, any>;
  enabled: boolean;
}

/**
 * SOP Performance Threshold interface
 * Performance threshold definition
 */
export interface SOPPerformanceThreshold {
  metric: 'execution_time' | 'memory_usage' | 'cpu_usage' | 'error_rate' | 'throughput';
  warning: number;
  critical: number;
  unit: string;
  enabled: boolean;
}

/**
 * SOP Health Check Configuration interface
 * Health check configuration
 */
export interface SOPHealthCheckConfiguration {
  id: string;
  name: string;
  type: 'endpoint' | 'database' | 'file' | 'custom';
  configuration: Record<string, any>;
  interval: number;
  timeout: number;
  retries: number;
  enabled: boolean;
}

/**
 * SOP Step Metrics Data interface
 * Performance metrics for steps
 */
export interface SOPStepMetricsData {
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  
  // Error metrics
  errorRate: number;
  timeoutRate: number;
  retryRate: number;
  
  // Performance metrics
  throughput: number;
  latency: number;
  resourceUtilization: SOPResourceUtilizationData;
  
  // Business metrics
  businessValue?: number;
  costPerExecution?: number;
  
  // Trend data
  hourlyTrends: SOPMetricTrendPoint[];
  dailyTrends: SOPMetricTrendPoint[];
  weeklyTrends: SOPMetricTrendPoint[];
  
  // Last update
  lastUpdated: Date;
}

/**
 * SOP Resource Utilization Data interface
 * Resource utilization metrics
 */
export interface SOPResourceUtilizationData {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  customResources: Record<string, number>;
}

/**
 * SOP Step Error Handling interface
 * Error handling configuration
 */
export interface SOPStepErrorHandling {
  strategy: 'fail_fast' | 'retry' | 'fallback' | 'circuit_breaker';
  maxRetries: number;
  retryDelay: number;
  retryBackoff: 'linear' | 'exponential' | 'fixed';
  fallbackSteps: string[];
  circuitBreakerSettings?: SOPCircuitBreakerSettings;
  errorMapping: SOPErrorMappingRule[];
  alertOnError: boolean;
  escalateOnError: boolean;
  logErrors: boolean;
  customErrorHandling: Record<string, any>;
}

/**
 * SOP Circuit Breaker Settings interface
 * Circuit breaker configuration
 */
export interface SOPCircuitBreakerSettings {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
  enabled: boolean;
}

/**
 * SOP Error Mapping Rule interface
 * Error mapping and handling rule
 */
export interface SOPErrorMappingRule {
  errorCode: string;
  errorType: string;
  action: 'retry' | 'fail' | 'fallback' | 'ignore';
  retryCount?: number;
  fallbackStep?: string;
  alertLevel: 'info' | 'warning' | 'error' | 'critical';
  customMessage?: string;
}

/**
 * SOP Step Test Case interface
 * Test case for step validation
 */
export interface SOPStepTestCase {
  id: string;
  name: string;
  description: string;
  inputData: Record<string, any>;
  expectedOutput: Record<string, any>;
  testType: 'unit' | 'integration' | 'performance' | 'security' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  testScript?: string;
  lastRunDate?: Date;
  lastRunResult?: 'passed' | 'failed' | 'skipped';
  lastRunDuration?: number;
  lastRunDetails?: string;
  enabled: boolean;
}

// ============================================================================
// EXECUTION AND RUNTIME DATA MODELS
// ============================================================================

/**
 * SOP Execution Entity
 * Complete execution instance data model
 */
export interface SOPExecutionEntity extends SOPAuditableEntity {
  // Basic information
  projectId: string;
  projectName: string;
  processName: string;
  processVersion: number;
  
  // Execution metadata
  executionNumber: number;
  correlationId?: string;
  parentExecutionId?: string;
  childExecutionIds: string[];
  
  // Trigger information
  triggeredBy: string;
  triggerType: 'manual' | 'scheduled' | 'event' | 'api' | 'webhook' | 'system';
  triggerData?: Record<string, any>;
  triggerSource?: string;
  
  // Execution context
  executionMode: 'production' | 'test' | 'debug' | 'simulation';
  environment: string;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  
  // Status and timing
  status: 'pending' | 'running' | 'waiting' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  duration?: number;
  estimatedCompletionTime?: Date;
  
  // Current state
  currentStepId?: string;
  currentStepName?: string;
  currentStepPosition?: number;
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];
  pendingSteps: string[];
  
  // Progress tracking
  progressPercentage: number;
  totalSteps: number;
  completedStepCount: number;
  
  // Data and variables
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  variables: Record<string, any>;
  stepData: Record<string, SOPStepExecutionData>;
  
  // Decision and approval tracking
  decisions: SOPExecutionDecision[];
  approvals: SOPExecutionApproval[];
  
  // Error and warning tracking
  errors: SOPExecutionErrorData[];
  warnings: SOPExecutionWarningData[];
  
  // Performance metrics
  metrics: SOPExecutionMetricsData;
  
  // Compliance and audit
  complianceRecord?: SOPExecutionComplianceRecord;
  auditEvents: SOPExecutionAuditEvent[];
  
  // Resource usage
  resourceUsage: SOPExecutionResourceUsage;
  
  // Attachments and references
  attachments: SOPExecutionAttachment[];
  externalReferences: SOPExecutionExternalReference[];
  
  // Custom data
  customData: Record<string, any>;
  tags: string[];
  
  // Retention and cleanup
  retentionDate?: Date;
  cleanupStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * SOP Step Execution Data interface
 * Data for individual step execution
 */
export interface SOPStepExecutionData {
  stepId: string;
  stepName: string;
  stepType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout';
  
  // Timing
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  
  // Data
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  
  // Error information
  error?: SOPStepExecutionError;
  warnings: SOPStepExecutionWarning[];
  
  // Retry information
  attemptCount: number;
  maxAttempts: number;
  retryReasons: string[];
  
  // Performance data
  performanceMetrics: SOPStepPerformanceMetrics;
  
  // Compliance data
  complianceChecks: SOPStepComplianceResult[];
  
  // Custom data
  customData: Record<string, any>;
}

/**
 * SOP Step Execution Error interface
 * Error information for step execution
 */
export interface SOPStepExecutionError {
  errorType: 'system' | 'business' | 'validation' | 'timeout' | 'permission' | 'integration';
  errorCode: string;
  message: string;
  details: Record<string, any>;
  stackTrace?: string;
  timestamp: Date;
  isRetryable: boolean;
  resolution?: string;
}

/**
 * SOP Step Execution Warning interface
 * Warning information for step execution
 */
export interface SOPStepExecutionWarning {
  warningType: 'performance' | 'data' | 'business_rule' | 'configuration' | 'compliance';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

/**
 * SOP Step Performance Metrics interface
 * Performance metrics for step execution
 */
export interface SOPStepPerformanceMetrics {
  executionTime: number;
  cpuTime: number;
  memoryUsed: number;
  diskIO: number;
  networkIO: number;
  customMetrics: Record<string, number>;
}

/**
 * SOP Step Compliance Result interface
 * Compliance check result for step execution
 */
export interface SOPStepComplianceResult {
  checkId: string;
  checkName: string;
  result: 'pass' | 'fail' | 'warning' | 'not_applicable';
  score: number;
  details: Record<string, any>;
  evidence?: string;
  timestamp: Date;
}

/**
 * SOP Execution Decision interface
 * Decision made during execution
 */
export interface SOPExecutionDecision {
  decisionPointId: string;
  decisionPointName: string;
  selectedOption: string;
  selectedOptionName: string;
  decisionMaker?: string;
  decisionReason?: string;
  isAutomated: boolean;
  timestamp: Date;
  confidence?: number;
  alternativeOptions: string[];
  decisionData: Record<string, any>;
}

/**
 * SOP Execution Approval interface
 * Approval process during execution
 */
export interface SOPExecutionApproval {
  approvalGateId: string;
  approvalGateName: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'timeout';
  requestedAt: Date;
  completedAt?: Date;
  approvers: SOPApproverDecision[];
  finalDecision: 'approved' | 'rejected';
  comments?: string;
  attachments: string[];
  escalationLevel: number;
}

/**
 * SOP Approver Decision interface
 * Individual approver's decision
 */
export interface SOPApproverDecision {
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'delegated' | 'no_response';
  timestamp: Date;
  comments?: string;
  attachments: string[];
  delegatedTo?: string;
  responseTime: number;
}

/**
 * SOP Execution Error Data interface
 * Error data for execution
 */
export interface SOPExecutionErrorData {
  id: string;
  timestamp: Date;
  stepId?: string;
  stepName?: string;
  errorType: 'system' | 'business' | 'validation' | 'timeout' | 'permission' | 'integration';
  errorCode: string;
  message: string;
  details: Record<string, any>;
  stackTrace?: string;
  isResolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

/**
 * SOP Execution Warning Data interface
 * Warning data for execution
 */
export interface SOPExecutionWarningData {
  id: string;
  timestamp: Date;
  stepId?: string;
  stepName?: string;
  warningType: 'performance' | 'data' | 'compliance' | 'business_rule' | 'configuration';
  message: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

/**
 * SOP Execution Metrics Data interface
 * Performance metrics for execution
 */
export interface SOPExecutionMetricsData {
  totalDuration: number;
  actualExecutionTime: number;
  waitTime: number;
  queueTime: number;
  
  // Step metrics
  stepMetrics: Record<string, SOPStepPerformanceMetrics>;
  
  // Resource metrics
  resourceUsage: SOPExecutionResourceUsage;
  
  // Throughput metrics
  throughput: number;
  itemsProcessed: number;
  
  // Error metrics
  errorCount: number;
  warningCount: number;
  retryCount: number;
  
  // Business metrics
  businessValue?: number;
  cost?: number;
  
  // Custom metrics
  customMetrics: Record<string, number>;
}

/**
 * SOP Execution Resource Usage interface
 * Resource usage metrics for execution
 */
export interface SOPExecutionResourceUsage {
  maxCpuUsage: number;
  avgCpuUsage: number;
  maxMemoryUsage: number;
  avgMemoryUsage: number;
  diskReadBytes: number;
  diskWriteBytes: number;
  networkInBytes: number;
  networkOutBytes: number;
  databaseConnections: number;
  externalApiCalls: number;
  customResourceUsage: Record<string, number>;
}

/**
 * SOP Execution Compliance Record interface
 * Compliance record for execution
 */
export interface SOPExecutionComplianceRecord {
  overallStatus: 'compliant' | 'non_compliant' | 'partial_compliant' | 'pending_review';
  complianceScore: number;
  requirementResults: SOPComplianceRequirementExecutionResult[];
  violations: SOPComplianceViolationExecution[];
  auditTrail: SOPComplianceAuditEntry[];
  lastReviewed?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

/**
 * SOP Compliance Requirement Execution Result interface
 * Compliance requirement result for execution
 */
export interface SOPComplianceRequirementExecutionResult {
  requirementId: string;
  requirementName: string;
  status: 'compliant' | 'non_compliant' | 'partial_compliant' | 'not_applicable';
  score: number;
  checkResults: SOPComplianceCheckExecutionResult[];
  evidence: SOPComplianceEvidenceExecution[];
  issues: string[];
  timestamp: Date;
}

/**
 * SOP Compliance Check Execution Result interface
 * Individual compliance check result for execution
 */
export interface SOPComplianceCheckExecutionResult {
  checkId: string;
  checkName: string;
  result: 'pass' | 'fail' | 'warning' | 'not_applicable';
  score: number;
  details: Record<string, any>;
  evidence?: string;
  timestamp: Date;
  executionTime: number;
}

/**
 * SOP Compliance Evidence Execution interface
 * Evidence collected during execution
 */
export interface SOPComplianceEvidenceExecution {
  id: string;
  type: 'document' | 'log' | 'screenshot' | 'signature' | 'timestamp' | 'hash' | 'digital_signature';
  description: string;
  reference: string;
  hash?: string;
  digitalSignature?: string;
  timestamp: Date;
  collectedBy?: string;
  verificationStatus: 'verified' | 'unverified' | 'invalid' | 'pending';
  metadata: Record<string, any>;
}

/**
 * SOP Compliance Violation Execution interface
 * Compliance violation during execution
 */
export interface SOPComplianceViolationExecution {
  id: string;
  executionId: string;
  requirementId: string;
  violationType: 'process' | 'data' | 'access' | 'timing' | 'documentation' | 'approval';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  stepId?: string;
  evidence: SOPComplianceEvidenceExecution[];
  isResolved: boolean;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  impactAssessment?: string;
}

/**
 * SOP Compliance Audit Entry interface
 * Audit entry for compliance tracking
 */
export interface SOPComplianceAuditEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  outcome: 'success' | 'failure' | 'warning';
  complianceImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  hash: string;
  digitalSignature?: string;
}

/**
 * SOP Execution Audit Event interface
 * Audit event during execution
 */
export interface SOPExecutionAuditEvent {
  id: string;
  timestamp: Date;
  eventType: 'execution_started' | 'step_started' | 'step_completed' | 'step_failed' | 'decision_made' | 'approval_requested' | 'approval_granted' | 'execution_completed' | 'execution_failed' | 'execution_cancelled';
  userId?: string;
  userName?: string;
  stepId?: string;
  stepName?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  hash: string;
}

/**
 * SOP Execution Attachment interface
 * File attachment during execution
 */
export interface SOPExecutionAttachment {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  storageLocation: string;
  uploadedBy: string;
  uploadedAt: Date;
  stepId?: string;
  checksum: string;
  isEncrypted: boolean;
  metadata: Record<string, any>;
  retentionDate?: Date;
}

/**
 * SOP Execution External Reference interface
 * External reference during execution
 */
export interface SOPExecutionExternalReference {
  id: string;
  type: 'system' | 'document' | 'api' | 'database' | 'file' | 'service';
  identifier: string;
  name: string;
  url?: string;
  description?: string;
  stepId?: string;
  accessedAt: Date;
  accessMethod: string;
  responseStatus?: string;
  responseTime?: number;
  metadata: Record<string, any>;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

// Export all entity types
export type SOPEntityType = 
  | SOPProjectEntity 
  | SOPStepEntity 
  | SOPExecutionEntity;

// Export all data model types
export type SOPDataModelType = 
  | SOPBaseEntity 
  | SOPAuditableEntity 
  | SOPVersionableEntity 
  | SOPWorkflowEntity;

// Export comprehensive type unions
export type AllSOPEntities = SOPEntityType;
export type AllSOPDataModels = SOPDataModelType;