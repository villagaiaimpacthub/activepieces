/**
 * SOP Core Type Definitions
 * Comprehensive TypeScript types for SOP workflow components and Activepieces integration
 * 
 * This module provides complete type safety for SOP piece development with full
 * Activepieces compatibility and comprehensive workflow management types.
 */

import { Static, Type } from '@sinclair/typebox';

// ============================================================================
// BASE TYPES AND ENUMS
// ============================================================================

/**
 * SOP Process Status enumeration
 * Defines all possible states of an SOP process
 */
export enum SOPProcessStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  TERMINATED = 'terminated'
}

/**
 * SOP Step Types enumeration
 * Defines all possible types of steps in an SOP process
 */
export enum SOPStepType {
  ACTION = 'action',
  TRIGGER = 'trigger',
  DECISION = 'decision',
  APPROVAL = 'approval',
  MANUAL = 'manual',
  AUTOMATION = 'automation',
  NOTIFICATION = 'notification',
  DATA_COLLECTION = 'data_collection',
  VALIDATION = 'validation',
  INTEGRATION = 'integration'
}

/**
 * SOP Execution Status enumeration
 * Defines all possible states of SOP execution
 */
export enum SOPExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  WAITING = 'waiting',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

/**
 * SOP Compliance Status enumeration
 * Defines compliance tracking states
 */
export enum SOPComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIAL_COMPLIANT = 'partial_compliant',
  PENDING_REVIEW = 'pending_review',
  REQUIRES_ACTION = 'requires_action'
}

/**
 * SOP Priority Levels enumeration
 * Defines priority levels for SOP processes and steps
 */
export enum SOPPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// ============================================================================
// ACTIVEPIECES COMPATIBILITY TYPES
// ============================================================================

/**
 * Base Activepieces Property interface
 * Extended for SOP-specific property requirements
 */
export interface ActivepiecesPropertyBase {
  displayName: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
}

/**
 * SOP-specific property extensions
 * Adds SOP workflow capabilities to Activepieces properties
 */
export interface SOPPropertyExtensions {
  sopLabel?: string;
  sopDescription?: string;
  complianceRequired?: boolean;
  auditTrail?: boolean;
  validationRules?: SOPValidationRule[];
  approvalRequired?: boolean;
}

/**
 * Combined SOP Property interface
 * Merges Activepieces base properties with SOP extensions
 */
export interface SOPProperty extends ActivepiecesPropertyBase, SOPPropertyExtensions {
  id: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file' | 'date' | 'email' | 'url';
  sopType?: 'input' | 'output' | 'config' | 'runtime';
}

/**
 * SOP Validation Rule interface
 * Defines validation rules for SOP properties and data
 */
export interface SOPValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'custom' | 'regex' | 'business_rule';
  rule: string | RegExp | ((value: any) => boolean);
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
}

// ============================================================================
// SOP PROCESS TYPES
// ============================================================================

/**
 * SOP Process Definition interface
 * Defines the complete structure of an SOP process
 */
export interface SOPProcess {
  id: string;
  name: string;
  sopName: string;
  description?: string;
  sopDescription?: string;
  version: number;
  status: SOPProcessStatus;
  priority: SOPPriority;
  category: string;
  tags: string[];
  
  // Process metadata
  metadata: SOPProcessMetadata;
  
  // Process structure
  steps: SOPProcessStep[];
  decisionPoints: SOPDecisionPoint[];
  approvalGates: SOPApprovalGate[];
  
  // Compliance and governance
  compliance: SOPComplianceConfig;
  
  // Process configuration
  configuration: SOPProcessConfiguration;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  
  // Relationships
  parentProcessId?: string;
  childProcessIds: string[];
  
  // Performance metrics
  metrics?: SOPProcessMetrics;
}

/**
 * SOP Process Metadata interface
 * Extended metadata for SOP processes
 */
export interface SOPProcessMetadata {
  owner: string;
  department: string;
  businessUnit?: string;
  businessCriticality: SOPPriority;
  regulatoryRequirements: string[];
  documentationLinks: string[];
  trainingMaterials: string[];
  lastReviewDate?: string;
  nextReviewDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  customFields: Record<string, any>;
}

/**
 * SOP Process Configuration interface
 * Runtime configuration for SOP processes
 */
export interface SOPProcessConfiguration {
  timeoutMinutes?: number;
  maxRetries?: number;
  retryDelayMinutes?: number;
  parallelExecution?: boolean;
  requiresApproval?: boolean;
  autoStart?: boolean;
  notificationSettings: SOPNotificationSettings;
  integrationSettings: SOPIntegrationSettings;
  errorHandling: SOPErrorHandlingConfig;
}

/**
 * SOP Process Step interface
 * Individual step within an SOP process
 */
export interface SOPProcessStep {
  id: string;
  name: string;
  sopName: string;
  description?: string;
  sopDescription?: string;
  stepType: SOPStepType;
  position: number;
  
  // Step configuration
  configuration: SOPStepConfiguration;
  
  // Relationships
  parentStepId?: string;
  childStepIds: string[];
  dependsOn: string[];
  
  // Execution settings
  executionSettings: SOPStepExecutionSettings;
  
  // Properties and data
  properties: SOPProperty[];
  inputSchema?: any;
  outputSchema?: any;
  
  // Compliance
  complianceRequired: boolean;
  auditTrail: boolean;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * SOP Step Configuration interface
 * Configuration settings for individual SOP steps
 */
export interface SOPStepConfiguration {
  activepiecesPieceId?: string;
  activepiecesActionId?: string;
  activepiecesTriggerId?: string;
  customCode?: string;
  manualInstructions?: string;
  automationScript?: string;
  validationRules: SOPValidationRule[];
  approvalRequired: boolean;
  timeoutMinutes?: number;
  retryCount?: number;
  customProperties: Record<string, any>;
}

/**
 * SOP Step Execution Settings interface
 * Runtime execution settings for SOP steps
 */
export interface SOPStepExecutionSettings {
  async: boolean;
  parallel: boolean;
  skipOnFailure: boolean;
  continueOnError: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  monitoringEnabled: boolean;
  alertsEnabled: boolean;
  customHooks: SOPStepHook[];
}

/**
 * SOP Step Hook interface
 * Custom hooks for step execution events
 */
export interface SOPStepHook {
  id: string;
  event: 'before_execution' | 'after_execution' | 'on_success' | 'on_failure' | 'on_timeout';
  action: 'log' | 'notify' | 'execute_code' | 'call_webhook' | 'update_data';
  configuration: Record<string, any>;
  enabled: boolean;
}

// ============================================================================
// SOP DECISION AND APPROVAL TYPES
// ============================================================================

/**
 * SOP Decision Point interface
 * Defines decision branching in SOP processes
 */
export interface SOPDecisionPoint {
  id: string;
  name: string;
  sopName: string;
  description?: string;
  stepId: string;
  
  // Decision logic
  decisionLogic: SOPDecisionLogic;
  
  // Decision options
  options: SOPDecisionOption[];
  
  // Default behavior
  defaultOption?: string;
  timeoutBehavior: 'default' | 'fail' | 'escalate';
  timeoutMinutes?: number;
  
  // Decision metadata
  decisionMaker?: string;
  requiresJustification: boolean;
  auditRequired: boolean;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * SOP Decision Logic interface
 * Defines the logic for automated decision making
 */
export interface SOPDecisionLogic {
  type: 'automated' | 'manual' | 'hybrid';
  conditions: SOPCondition[];
  evaluationOrder: 'sequential' | 'parallel';
  operatorLogic: 'AND' | 'OR' | 'CUSTOM';
  customLogic?: string;
}

/**
 * SOP Condition interface
 * Individual condition for decision logic
 */
export interface SOPCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex' | 'exists' | 'custom';
  value: any;
  customFunction?: string;
  weight?: number;
}

/**
 * SOP Decision Option interface
 * Possible outcomes of a decision point
 */
export interface SOPDecisionOption {
  id: string;
  name: string;
  sopName: string;
  description?: string;
  nextStepId?: string;
  nextProcessId?: string;
  terminateProcess?: boolean;
  priority: number;
  conditions?: SOPCondition[];
}

/**
 * SOP Approval Gate interface
 * Defines approval requirements in SOP processes
 */
export interface SOPApprovalGate {
  id: string;
  name: string;
  sopName: string;
  description?: string;
  stepId: string;
  
  // Approval configuration
  approvalConfig: SOPApprovalConfiguration;
  
  // Approvers
  approvers: SOPApprover[];
  approvalFlow: SOPApprovalFlow;
  
  // Approval settings
  settings: SOPApprovalSettings;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * SOP Approval Configuration interface
 * Configuration for approval gates
 */
export interface SOPApprovalConfiguration {
  type: 'single' | 'multiple' | 'hierarchy' | 'consensus';
  requiredCount?: number;
  minimumLevel?: number;
  timeoutHours?: number;
  autoApproveConditions?: SOPCondition[];
  escalationRules: SOPEscalationRule[];
}

/**
 * SOP Approver interface
 * Individual approver definition
 */
export interface SOPApprover {
  id: string;
  type: 'user' | 'role' | 'group' | 'external';
  identifier: string;
  name: string;
  email?: string;
  level: number;
  weight?: number;
  backupApprovers: string[];
  isActive: boolean;
}

/**
 * SOP Approval Flow interface
 * Defines the flow of approval process
 */
export interface SOPApprovalFlow {
  type: 'sequential' | 'parallel' | 'conditional';
  stages: SOPApprovalStage[];
  skipConditions?: SOPCondition[];
  fastTrackConditions?: SOPCondition[];
}

/**
 * SOP Approval Stage interface
 * Individual stage in approval flow
 */
export interface SOPApprovalStage {
  id: string;
  name: string;
  order: number;
  approvers: string[];
  requiredApprovals: number;
  timeoutHours?: number;
  escalationRules: SOPEscalationRule[];
  skipConditions?: SOPCondition[];
}

/**
 * SOP Approval Settings interface
 * Additional settings for approval processes
 */
export interface SOPApprovalSettings {
  allowDelegation: boolean;
  requireComments: boolean;
  allowAttachments: boolean;
  sendReminders: boolean;
  reminderIntervalHours: number;
  trackDecisionTime: boolean;
  auditAll: boolean;
  notificationSettings: SOPNotificationSettings;
}

/**
 * SOP Escalation Rule interface
 * Rules for escalating approvals
 */
export interface SOPEscalationRule {
  id: string;
  name: string;
  triggerCondition: 'timeout' | 'rejection' | 'no_response' | 'custom';
  triggerValue?: any;
  action: 'escalate' | 'auto_approve' | 'auto_reject' | 'notify' | 'custom';
  escalateTo?: string[];
  customAction?: string;
  maxEscalations?: number;
  isActive: boolean;
}

// ============================================================================
// SOP EXECUTION TYPES
// ============================================================================

/**
 * SOP Execution Context interface
 * Runtime context for SOP execution
 */
export interface SOPExecutionContext {
  id: string;
  processId: string;
  processName: string;
  version: number;
  
  // Execution metadata
  executionMetadata: SOPExecutionMetadata;
  
  // Current state
  currentState: SOPExecutionState;
  
  // Execution data
  executionData: SOPExecutionData;
  
  // Execution history
  history: SOPExecutionHistoryEntry[];
  
  // Performance metrics
  metrics: SOPExecutionMetrics;
  
  // Error handling
  errors: SOPExecutionError[];
  warnings: SOPExecutionWarning[];
  
  // Compliance tracking
  complianceRecord: SOPComplianceRecord;
  
  // Timestamps
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  pausedAt?: string;
  
  // Additional context
  customContext: Record<string, any>;
}

/**
 * SOP Execution Metadata interface
 * Metadata for SOP execution instances
 */
export interface SOPExecutionMetadata {
  triggeredBy: string;
  triggerType: 'manual' | 'scheduled' | 'event' | 'api' | 'webhook';
  triggerData?: any;
  executionMode: 'production' | 'test' | 'debug';
  environment: string;
  priority: SOPPriority;
  tags: string[];
  correlationId?: string;
  parentExecutionId?: string;
  childExecutionIds: string[];
}

/**
 * SOP Execution State interface
 * Current state of SOP execution
 */
export interface SOPExecutionState {
  status: SOPExecutionStatus;
  currentStepId?: string;
  currentStepName?: string;
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];
  pendingSteps: string[];
  
  // Decision states
  pendingDecisions: string[];
  completedDecisions: SOPDecisionResult[];
  
  // Approval states
  pendingApprovals: string[];
  completedApprovals: SOPApprovalResult[];
  
  // Progress tracking
  progressPercentage: number;
  estimatedCompletionTime?: string;
  
  // State data
  stateData: Record<string, any>;
  variables: Record<string, any>;
}

/**
 * SOP Execution Data interface
 * Data associated with SOP execution
 */
export interface SOPExecutionData {
  input: Record<string, any>;
  output?: Record<string, any>;
  stepData: Record<string, any>;
  intermediateResults: Record<string, any>;
  customData: Record<string, any>;
  
  // File attachments
  attachments: SOPAttachment[];
  
  // External references
  externalReferences: SOPExternalReference[];
}

/**
 * SOP Attachment interface
 * File attachments in SOP execution
 */
export interface SOPAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  stepId?: string;
  metadata: Record<string, any>;
}

/**
 * SOP External Reference interface
 * References to external systems or data
 */
export interface SOPExternalReference {
  id: string;
  type: 'system' | 'document' | 'api' | 'database' | 'file';
  identifier: string;
  url?: string;
  metadata: Record<string, any>;
  stepId?: string;
  createdAt: string;
}

/**
 * SOP Execution History Entry interface
 * Individual entry in execution history
 */
export interface SOPExecutionHistoryEntry {
  id: string;
  timestamp: string;
  type: 'step_started' | 'step_completed' | 'step_failed' | 'decision_made' | 'approval_requested' | 'approval_granted' | 'approval_rejected' | 'process_paused' | 'process_resumed' | 'error_occurred' | 'warning_issued';
  stepId?: string;
  userId?: string;
  details: Record<string, any>;
  duration?: number;
}

/**
 * SOP Execution Metrics interface
 * Performance metrics for SOP execution
 */
export interface SOPExecutionMetrics {
  totalDuration?: number;
  stepDurations: Record<string, number>;
  waitTimes: Record<string, number>;
  approvalTimes: Record<string, number>;
  errorCount: number;
  warningCount: number;
  retryCount: number;
  resourceUsage?: SOPResourceUsage;
}

/**
 * SOP Resource Usage interface
 * Resource usage metrics
 */
export interface SOPResourceUsage {
  cpuTime?: number;
  memoryUsage?: number;
  networkCalls?: number;
  storageUsage?: number;
  externalApiCalls?: number;
  customMetrics: Record<string, number>;
}

/**
 * SOP Execution Error interface
 * Error information during execution
 */
export interface SOPExecutionError {
  id: string;
  timestamp: string;
  stepId?: string;
  errorType: 'system' | 'business' | 'validation' | 'timeout' | 'permission' | 'integration';
  errorCode: string;
  message: string;
  details: Record<string, any>;
  stackTrace?: string;
  resolution?: string;
  isResolved: boolean;
}

/**
 * SOP Execution Warning interface
 * Warning information during execution
 */
export interface SOPExecutionWarning {
  id: string;
  timestamp: string;
  stepId?: string;
  warningType: 'performance' | 'data' | 'compliance' | 'business_rule' | 'configuration';
  message: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  isAcknowledged: boolean;
}

// ============================================================================
// SOP DECISION AND APPROVAL RESULT TYPES
// ============================================================================

/**
 * SOP Decision Result interface
 * Result of a decision point execution
 */
export interface SOPDecisionResult {
  decisionPointId: string;
  selectedOptionId: string;
  selectedOptionName: string;
  decisionMaker?: string;
  decisionReason?: string;
  isAutomated: boolean;
  timestamp: string;
  confidenceScore?: number;
  alternativeOptions?: string[];
}

/**
 * SOP Approval Result interface
 * Result of an approval gate execution
 */
export interface SOPApprovalResult {
  approvalGateId: string;
  status: 'approved' | 'rejected' | 'pending' | 'escalated' | 'timeout';
  approvers: SOPApprovalDecision[];
  finalDecision: 'approved' | 'rejected';
  decisionTimestamp: string;
  totalDuration: number;
  escalationCount: number;
  comments?: string;
}

/**
 * SOP Approval Decision interface
 * Individual approver's decision
 */
export interface SOPApprovalDecision {
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'delegated';
  timestamp: string;
  comments?: string;
  attachments: string[];
  delegatedTo?: string;
  duration: number;
}

// ============================================================================
// SOP COMPLIANCE TYPES
// ============================================================================

/**
 * SOP Compliance Configuration interface
 * Compliance settings for SOP processes
 */
export interface SOPComplianceConfig {
  enabled: boolean;
  framework: string[];
  requirements: SOPComplianceRequirement[];
  auditSettings: SOPAuditSettings;
  reportingSettings: SOPReportingSettings;
  retentionPolicy: SOPRetentionPolicy;
}

/**
 * SOP Compliance Requirement interface
 * Individual compliance requirement
 */
export interface SOPComplianceRequirement {
  id: string;
  name: string;
  framework: string;
  type: 'mandatory' | 'recommended' | 'optional';
  description: string;
  validationRules: SOPValidationRule[];
  applicableSteps: string[];
  isActive: boolean;
}

/**
 * SOP Audit Settings interface
 * Settings for audit trail and logging
 */
export interface SOPAuditSettings {
  enabled: boolean;
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
  auditEvents: string[];
  retentionDays: number;
  encryptionEnabled: boolean;
  digitalSignature: boolean;
  immutableStorage: boolean;
}

/**
 * SOP Reporting Settings interface
 * Settings for compliance reporting
 */
export interface SOPReportingSettings {
  enabled: boolean;
  reportTypes: string[];
  scheduleType: 'manual' | 'scheduled' | 'triggered';
  scheduleFrequency?: string;
  recipients: string[];
  reportFormats: string[];
  includeDetails: boolean;
}

/**
 * SOP Retention Policy interface
 * Data retention policy for compliance
 */
export interface SOPRetentionPolicy {
  defaultRetentionDays: number;
  dataCategories: SOPDataCategory[];
  archivalSettings: SOPArchivalSettings;
  deletionSettings: SOPDeletionSettings;
}

/**
 * SOP Data Category interface
 * Data categories for retention policies
 */
export interface SOPDataCategory {
  name: string;
  description: string;
  retentionDays: number;
  archiveAfterDays: number;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  encryptionRequired: boolean;
}

/**
 * SOP Archival Settings interface
 * Settings for data archival
 */
export interface SOPArchivalSettings {
  enabled: boolean;
  archiveLocation: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  indexing: boolean;
  verification: boolean;
}

/**
 * SOP Deletion Settings interface
 * Settings for data deletion
 */
export interface SOPDeletionSettings {
  enabled: boolean;
  secureWipe: boolean;
  verificationRequired: boolean;
  approvalRequired: boolean;
  auditDeletion: boolean;
}

/**
 * SOP Compliance Record interface
 * Compliance tracking record for execution
 */
export interface SOPComplianceRecord {
  executionId: string;
  processId: string;
  overallStatus: SOPComplianceStatus;
  complianceScore: number;
  
  // Requirement tracking
  requirementResults: SOPComplianceRequirementResult[];
  
  // Audit information
  auditTrail: SOPAuditEntry[];
  
  // Violations and remediation
  violations: SOPComplianceViolation[];
  remediationActions: SOPRemediationAction[];
  
  // Review and approval
  reviewStatus: 'not_required' | 'pending' | 'in_progress' | 'completed';
  reviewer?: string;
  reviewDate?: string;
  reviewComments?: string;
  
  // Timestamps
  createdAt: string;
  lastUpdated: string;
}

/**
 * SOP Compliance Requirement Result interface
 * Result of individual compliance requirement check
 */
export interface SOPComplianceRequirementResult {
  requirementId: string;
  requirementName: string;
  status: SOPComplianceStatus;
  score: number;
  checkResults: SOPComplianceCheckResult[];
  evidence: SOPComplianceEvidence[];
  issues: string[];
  recommendations: string[];
}

/**
 * SOP Compliance Check Result interface
 * Result of individual compliance check
 */
export interface SOPComplianceCheckResult {
  checkId: string;
  checkName: string;
  result: 'pass' | 'fail' | 'warning' | 'not_applicable';
  score: number;
  details: Record<string, any>;
  evidence?: string;
  timestamp: string;
}

/**
 * SOP Compliance Evidence interface
 * Evidence for compliance requirements
 */
export interface SOPComplianceEvidence {
  id: string;
  type: 'document' | 'log' | 'screenshot' | 'signature' | 'timestamp' | 'hash';
  description: string;
  reference: string;
  hash?: string;
  timestamp: string;
  verificationStatus: 'verified' | 'unverified' | 'invalid';
}

/**
 * SOP Audit Entry interface
 * Individual audit trail entry
 */
export interface SOPAuditEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure' | 'warning';
  hash?: string;
}

/**
 * SOP Compliance Violation interface
 * Compliance violation information
 */
export interface SOPComplianceViolation {
  id: string;
  requirementId: string;
  violationType: 'process' | 'data' | 'access' | 'timing' | 'documentation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  stepId?: string;
  evidence: SOPComplianceEvidence[];
  isResolved: boolean;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * SOP Remediation Action interface
 * Action to remediate compliance issues
 */
export interface SOPRemediationAction {
  id: string;
  violationId?: string;
  actionType: 'immediate' | 'scheduled' | 'manual' | 'automated';
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: SOPPriority;
  estimatedEffort?: number;
  actualEffort?: number;
  completedAt?: string;
  completedBy?: string;
  results?: string;
}

// ============================================================================
// SOP PIECE CONFIGURATION TYPES
// ============================================================================

/**
 * SOP Piece Configuration interface
 * Configuration for SOP pieces in Activepieces
 */
export interface SOPPieceConfig {
  id: string;
  name: string;
  sopName: string;
  displayName: string;
  sopDisplayName: string;
  description: string;
  sopDescription: string;
  version: string;
  
  // Activepieces integration
  activepiecesVersion: string;
  activepiecesCompatibility: string[];
  
  // Piece metadata
  metadata: SOPPieceMetadata;
  
  // Properties
  properties: Record<string, SOPProperty>;
  
  // Actions and triggers
  actions: Record<string, SOPActionConfig>;
  triggers: Record<string, SOPTriggerConfig>;
  
  // SOP-specific configuration
  sopConfiguration: SOPSpecificConfig;
  
  // Validation and compliance
  validation: SOPPieceValidation;
  compliance: SOPPieceCompliance;
  
  // Integration settings
  integrationSettings: SOPIntegrationSettings;
  
  // Error handling
  errorHandling: SOPErrorHandlingConfig;
  
  // Monitoring and logging
  monitoring: SOPMonitoringConfig;
}

/**
 * SOP Piece Metadata interface
 * Metadata for SOP pieces
 */
export interface SOPPieceMetadata {
  category: string;
  tags: string[];
  author: string;
  organization?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  supportEmail?: string;
  
  // SOP-specific metadata
  businessFunction: string;
  regulatoryScope: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dataClassification: string[];
  
  // Compatibility
  minActivepiecesVersion: string;
  supportedEnvironments: string[];
  dependencies: string[];
}

/**
 * SOP Action Configuration interface
 * Configuration for SOP actions
 */
export interface SOPActionConfig {
  id: string;
  name: string;
  sopName: string;
  displayName: string;
  sopDisplayName: string;
  description: string;
  sopDescription: string;
  
  // Action properties
  properties: Record<string, SOPProperty>;
  
  // Execution configuration
  executionConfig: SOPActionExecutionConfig;
  
  // SOP-specific settings
  sopSettings: SOPActionSettings;
  
  // Validation and compliance
  validation: SOPActionValidation;
  
  // Error handling
  errorHandling: SOPErrorHandlingConfig;
}

/**
 * SOP Trigger Configuration interface
 * Configuration for SOP triggers
 */
export interface SOPTriggerConfig {
  id: string;
  name: string;
  sopName: string;
  displayName: string;
  sopDisplayName: string;
  description: string;
  sopDescription: string;
  
  // Trigger type
  type: 'webhook' | 'polling' | 'schedule' | 'event' | 'manual';
  
  // Trigger properties
  properties: Record<string, SOPProperty>;
  
  // Trigger configuration
  triggerConfig: SOPTriggerSettings;
  
  // SOP-specific settings
  sopSettings: SOPTriggerSOPSettings;
  
  // Validation and compliance
  validation: SOPTriggerValidation;
}

/**
 * SOP Action Execution Configuration interface
 * Execution settings for SOP actions
 */
export interface SOPActionExecutionConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  async: boolean;
  requiresAuth: boolean;
  rateLimited: boolean;
  cacheable: boolean;
  idempotent: boolean;
}

/**
 * SOP Action Settings interface
 * SOP-specific settings for actions
 */
export interface SOPActionSettings {
  requiresApproval: boolean;
  auditRequired: boolean;
  complianceChecks: string[];
  businessValidation: boolean;
  dataEncryption: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  notificationSettings: SOPNotificationSettings;
}

/**
 * SOP Trigger Settings interface
 * Configuration settings for SOP triggers
 */
export interface SOPTriggerSettings {
  pollInterval?: number;
  scheduleExpression?: string;
  webhookSettings?: SOPWebhookSettings;
  eventFilters?: SOPEventFilter[];
  deduplization: boolean;
  bufferSize?: number;
  batchProcessing?: boolean;
}

/**
 * SOP Webhook Settings interface
 * Settings for webhook triggers
 */
export interface SOPWebhookSettings {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authentication: SOPWebhookAuth;
  headers?: Record<string, string>;
  validation?: SOPWebhookValidation;
  responseSettings: SOPWebhookResponse;
}

/**
 * SOP Webhook Authentication interface
 * Authentication settings for webhooks
 */
export interface SOPWebhookAuth {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'signature' | 'oauth';
  config: Record<string, any>;
  secretsRequired: string[];
}

/**
 * SOP Webhook Validation interface
 * Validation settings for webhook data
 */
export interface SOPWebhookValidation {
  enabled: boolean;
  schema?: any;
  rules: SOPValidationRule[];
  rejectInvalid: boolean;
  logInvalid: boolean;
}

/**
 * SOP Webhook Response interface
 * Response settings for webhooks
 */
export interface SOPWebhookResponse {
  successStatus: number;
  errorStatus: number;
  successBody?: any;
  errorBody?: any;
  headers?: Record<string, string>;
  timeout: number;
}

/**
 * SOP Event Filter interface
 * Filter for event-based triggers
 */
export interface SOPEventFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'regex' | 'exists';
  value: any;
  caseSensitive?: boolean;
}

// ============================================================================
// SOP INTEGRATION AND NOTIFICATION TYPES
// ============================================================================

/**
 * SOP Integration Settings interface
 * Settings for external system integrations
 */
export interface SOPIntegrationSettings {
  enabledIntegrations: string[];
  integrationConfigs: Record<string, SOPIntegrationConfig>;
  defaultTimeout: number;
  defaultRetries: number;
  circuitBreakerEnabled: boolean;
  healthCheckInterval: number;
}

/**
 * SOP Integration Configuration interface
 * Configuration for individual integrations
 */
export interface SOPIntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file_system' | 'message_queue' | 'email' | 'custom';
  enabled: boolean;
  connectionConfig: Record<string, any>;
  authConfig: SOPIntegrationAuth;
  timeoutSettings: SOPTimeoutSettings;
  errorHandling: SOPErrorHandlingConfig;
  monitoring: SOPMonitoringConfig;
}

/**
 * SOP Integration Authentication interface
 * Authentication configuration for integrations
 */
export interface SOPIntegrationAuth {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth' | 'certificate' | 'custom';
  config: Record<string, any>;
  refreshSettings?: SOPAuthRefreshSettings;
  secretsManagement: SOPSecretsConfig;
}

/**
 * SOP Timeout Settings interface
 * Timeout configuration for integrations
 */
export interface SOPTimeoutSettings {
  connection: number;
  read: number;
  write: number;
  total: number;
  retryBackoff: 'linear' | 'exponential' | 'fixed';
  maxRetries: number;
}

/**
 * SOP Notification Settings interface
 * Configuration for notifications
 */
export interface SOPNotificationSettings {
  enabled: boolean;
  channels: SOPNotificationChannel[];
  templates: Record<string, SOPNotificationTemplate>;
  rules: SOPNotificationRule[];
  throttling: SOPNotificationThrottling;
}

/**
 * SOP Notification Channel interface
 * Individual notification channel configuration
 */
export interface SOPNotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook' | 'push' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  recipients: SOPNotificationRecipient[];
  priority: SOPPriority;
}

/**
 * SOP Notification Recipient interface
 * Notification recipient configuration
 */
export interface SOPNotificationRecipient {
  id: string;
  type: 'user' | 'role' | 'group' | 'external';
  identifier: string;
  name: string;
  preferences: SOPNotificationPreferences;
  active: boolean;
}

/**
 * SOP Notification Preferences interface
 * User notification preferences
 */
export interface SOPNotificationPreferences {
  channels: string[];
  events: string[];
  frequency: 'immediate' | 'batched' | 'digest';
  quietHours?: SOPQuietHours;
  formatPreference: 'text' | 'html' | 'markdown';
}

/**
 * SOP Quiet Hours interface
 * Quiet hours configuration for notifications
 */
export interface SOPQuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  weekdays: number[];
  emergencyOverride: boolean;
}

/**
 * SOP Notification Template interface
 * Template for notifications
 */
export interface SOPNotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  format: 'text' | 'html' | 'markdown';
  variables: string[];
  localization: Record<string, SOPLocalizedTemplate>;
}

/**
 * SOP Localized Template interface
 * Localized notification template
 */
export interface SOPLocalizedTemplate {
  subject: string;
  body: string;
  variables: Record<string, string>;
}

/**
 * SOP Notification Rule interface
 * Rule for when to send notifications
 */
export interface SOPNotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: SOPCondition[];
  channels: string[];
  template: string;
  recipients: string[];
  priority: SOPPriority;
  throttling?: SOPNotificationThrottling;
}

/**
 * SOP Notification Throttling interface
 * Throttling configuration for notifications
 */
export interface SOPNotificationThrottling {
  enabled: boolean;
  maxPerMinute?: number;
  maxPerHour?: number;
  maxPerDay?: number;
  cooldownMinutes?: number;
  groupByRecipient: boolean;
  groupByTemplate: boolean;
}

// ============================================================================
// SOP ERROR HANDLING AND MONITORING TYPES
// ============================================================================

/**
 * SOP Error Handling Configuration interface
 * Error handling configuration
 */
export interface SOPErrorHandlingConfig {
  strategy: 'fail_fast' | 'retry' | 'fallback' | 'ignore' | 'custom';
  maxRetries: number;
  retryDelay: number;
  retryBackoff: 'linear' | 'exponential' | 'fixed';
  fallbackActions: SOPFallbackAction[];
  errorMapping: SOPErrorMapping[];
  alerting: SOPErrorAlerting;
  logging: SOPErrorLogging;
}

/**
 * SOP Fallback Action interface
 * Fallback action configuration
 */
export interface SOPFallbackAction {
  id: string;
  name: string;
  condition: SOPCondition[];
  action: 'execute_step' | 'call_webhook' | 'send_notification' | 'set_variable' | 'custom';
  config: Record<string, any>;
  priority: number;
}

/**
 * SOP Error Mapping interface
 * Error code mapping and handling
 */
export interface SOPErrorMapping {
  errorCode: string;
  errorPattern?: string;
  action: 'retry' | 'fail' | 'fallback' | 'ignore';
  message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notifyUsers: boolean;
  escalate: boolean;
}

/**
 * SOP Error Alerting interface
 * Error alerting configuration
 */
export interface SOPErrorAlerting {
  enabled: boolean;
  channels: string[];
  thresholds: SOPAlertThreshold[];
  escalationRules: SOPEscalationRule[];
  suppressDuplicates: boolean;
  cooldownMinutes: number;
}

/**
 * SOP Alert Threshold interface
 * Threshold configuration for alerts
 */
export interface SOPAlertThreshold {
  metric: 'error_count' | 'error_rate' | 'response_time' | 'custom';
  operator: 'greater_than' | 'less_than' | 'equals';
  value: number;
  timeWindow: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * SOP Error Logging interface
 * Error logging configuration
 */
export interface SOPErrorLogging {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  includeStackTrace: boolean;
  includeContext: boolean;
  maxLogSize: number;
  retentionDays: number;
  structured: boolean;
}

/**
 * SOP Monitoring Configuration interface
 * Monitoring and observability configuration
 */
export interface SOPMonitoringConfig {
  enabled: boolean;
  metricsCollection: SOPMetricsCollection;
  healthChecks: SOPHealthCheck[];
  performance: SOPPerformanceMonitoring;
  tracing: SOPTracingConfig;
  dashboards: SOPDashboardConfig[];
}

/**
 * SOP Metrics Collection interface
 * Metrics collection configuration
 */
export interface SOPMetricsCollection {
  enabled: boolean;
  interval: number;
  metrics: string[];
  customMetrics: SOPCustomMetric[];
  aggregation: SOPMetricsAggregation;
  export: SOPMetricsExport;
}

/**
 * SOP Custom Metric interface
 * Custom metric definition
 */
export interface SOPCustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  collection: 'automatic' | 'manual';
  config: Record<string, any>;
}

/**
 * SOP Metrics Aggregation interface
 * Metrics aggregation settings
 */
export interface SOPMetricsAggregation {
  enabled: boolean;
  intervals: number[];
  functions: ('sum' | 'avg' | 'min' | 'max' | 'count')[];
  retention: SOPMetricsRetention;
}

/**
 * SOP Metrics Retention interface
 * Metrics retention policy
 */
export interface SOPMetricsRetention {
  raw: number;
  aggregated: number;
  longTerm: number;
  archival: boolean;
}

/**
 * SOP Metrics Export interface
 * Metrics export configuration
 */
export interface SOPMetricsExport {
  enabled: boolean;
  format: 'prometheus' | 'json' | 'csv' | 'custom';
  endpoint?: string;
  interval: number;
  filters: SOPMetricsFilter[];
}

/**
 * SOP Metrics Filter interface
 * Filter for metrics export
 */
export interface SOPMetricsFilter {
  metric: string;
  labels?: Record<string, string>;
  operator: 'include' | 'exclude';
}

/**
 * SOP Health Check interface
 * Health check configuration
 */
export interface SOPHealthCheck {
  id: string;
  name: string;
  type: 'endpoint' | 'database' | 'queue' | 'file' | 'custom';
  config: Record<string, any>;
  interval: number;
  timeout: number;
  retries: number;
  thresholds: SOPHealthThreshold[];
  enabled: boolean;
}

/**
 * SOP Health Threshold interface
 * Health check threshold configuration
 */
export interface SOPHealthThreshold {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals';
  value: number;
  severity: 'warning' | 'critical';
}

/**
 * SOP Performance Monitoring interface
 * Performance monitoring configuration
 */
export interface SOPPerformanceMonitoring {
  enabled: boolean;
  sampling: number;
  thresholds: SOPPerformanceThreshold[];
  profiling: boolean;
  memoryTracking: boolean;
  resourceTracking: boolean;
}

/**
 * SOP Performance Threshold interface
 * Performance threshold configuration
 */
export interface SOPPerformanceThreshold {
  metric: 'response_time' | 'throughput' | 'error_rate' | 'memory_usage' | 'cpu_usage';
  warning: number;
  critical: number;
  action: 'log' | 'alert' | 'scale' | 'circuit_breaker';
}

/**
 * SOP Tracing Configuration interface
 * Distributed tracing configuration
 */
export interface SOPTracingConfig {
  enabled: boolean;
  sampler: 'always' | 'never' | 'probability' | 'rate_limit';
  samplerConfig?: Record<string, any>;
  propagation: string[];
  exporters: SOPTracingExporter[];
  attributes: Record<string, string>;
}

/**
 * SOP Tracing Exporter interface
 * Tracing exporter configuration
 */
export interface SOPTracingExporter {
  name: string;
  type: 'jaeger' | 'zipkin' | 'otlp' | 'console';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * SOP Dashboard Configuration interface
 * Dashboard configuration
 */
export interface SOPDashboardConfig {
  id: string;
  name: string;
  type: 'process' | 'system' | 'business' | 'compliance';
  widgets: SOPWidgetConfig[];
  layout: SOPDashboardLayout;
  permissions: string[];
  refresh: number;
}

/**
 * SOP Widget Configuration interface
 * Dashboard widget configuration
 */
export interface SOPWidgetConfig {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'alert' | 'custom';
  title: string;
  config: Record<string, any>;
  position: SOPWidgetPosition;
  size: SOPWidgetSize;
}

/**
 * SOP Widget Position interface
 * Widget position on dashboard
 */
export interface SOPWidgetPosition {
  x: number;
  y: number;
}

/**
 * SOP Widget Size interface
 * Widget size configuration
 */
export interface SOPWidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * SOP Dashboard Layout interface
 * Dashboard layout configuration
 */
export interface SOPDashboardLayout {
  type: 'grid' | 'flex' | 'fixed';
  columns?: number;
  gap?: number;
  responsive: boolean;
}

// ============================================================================
// SOP PROCESS METRICS TYPES
// ============================================================================

/**
 * SOP Process Metrics interface
 * Performance metrics for SOP processes
 */
export interface SOPProcessMetrics {
  executionCount: number;
  successRate: number;
  averageDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
  failureRate: number;
  timeoutRate: number;
  
  // Step-level metrics
  stepMetrics: Record<string, SOPStepMetrics>;
  
  // Approval metrics
  averageApprovalTime: number;
  approvalSuccessRate: number;
  escalationRate: number;
  
  // Compliance metrics
  complianceScore: number;
  violationCount: number;
  auditPassRate: number;
  
  // Resource metrics
  resourceUtilization: SOPResourceMetrics;
  
  // Business metrics
  businessMetrics: SOPBusinessMetrics;
  
  // Trend data
  trends: SOPMetricsTrend[];
  
  // Last updated
  lastUpdated: string;
}

/**
 * SOP Step Metrics interface
 * Metrics for individual process steps
 */
export interface SOPStepMetrics {
  executionCount: number;
  successRate: number;
  averageDuration: number;
  failureRate: number;
  retryRate: number;
  skipRate: number;
  errorDistribution: Record<string, number>;
  performanceTrend: number[];
}

/**
 * SOP Resource Metrics interface
 * Resource utilization metrics
 */
export interface SOPResourceMetrics {
  cpuUtilization: number;
  memoryUtilization: number;
  networkUtilization: number;
  storageUtilization: number;
  concurrentExecutions: number;
  queueLength: number;
  customResources: Record<string, number>;
}

/**
 * SOP Business Metrics interface
 * Business-specific metrics
 */
export interface SOPBusinessMetrics {
  costPerExecution?: number;
  timeToValue?: number;
  customerSatisfaction?: number;
  businessImpact?: number;
  roiMetrics?: SOPROIMetrics;
  customBusinessMetrics: Record<string, number>;
}

/**
 * SOP ROI Metrics interface
 * Return on Investment metrics
 */
export interface SOPROIMetrics {
  implementationCost: number;
  operationalCost: number;
  timeSavings: number;
  costSavings: number;
  revenueImpact: number;
  paybackPeriod: number;
  netPresentValue: number;
}

/**
 * SOP Metrics Trend interface
 * Trend data for metrics
 */
export interface SOPMetricsTrend {
  metric: string;
  period: 'hour' | 'day' | 'week' | 'month';
  data: SOPTrendDataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

/**
 * SOP Trend Data Point interface
 * Individual data point in trend
 */
export interface SOPTrendDataPoint {
  timestamp: string;
  value: number;
  count?: number;
}

// ============================================================================
// ADDITIONAL SUPPORT TYPES
// ============================================================================

/**
 * SOP Auth Refresh Settings interface
 * Settings for authentication token refresh
 */
export interface SOPAuthRefreshSettings {
  enabled: boolean;
  refreshThreshold: number;
  maxRetries: number;
  refreshEndpoint?: string;
  refreshTokenField?: string;
}

/**
 * SOP Secrets Configuration interface
 * Configuration for secrets management
 */
export interface SOPSecretsConfig {
  provider: 'environment' | 'vault' | 'aws_secrets' | 'azure_keyvault' | 'kubernetes' | 'custom';
  config: Record<string, any>;
  encryption: boolean;
  rotation: SOPSecretsRotation;
}

/**
 * SOP Secrets Rotation interface
 * Configuration for secrets rotation
 */
export interface SOPSecretsRotation {
  enabled: boolean;
  interval: number;
  notifyBefore: number;
  autoRotate: boolean;
}

/**
 * SOP Trigger SOP Settings interface
 * SOP-specific settings for triggers
 */
export interface SOPTriggerSOPSettings {
  requiresAuth: boolean;
  auditRequired: boolean;
  complianceChecks: string[];
  dataValidation: boolean;
  deduplication: boolean;
  filtering: SOPTriggerFilter[];
}

/**
 * SOP Trigger Filter interface
 * Filter configuration for triggers
 */
export interface SOPTriggerFilter {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'range';
  value: any;
  caseSensitive?: boolean;
}

/**
 * SOP Action Validation interface
 * Validation configuration for actions
 */
export interface SOPActionValidation {
  enabled: boolean;
  inputValidation: SOPValidationRule[];
  outputValidation: SOPValidationRule[];
  businessRules: SOPBusinessRule[];
  schemaValidation: boolean;
}

/**
 * SOP Trigger Validation interface
 * Validation configuration for triggers
 */
export interface SOPTriggerValidation {
  enabled: boolean;
  payloadValidation: SOPValidationRule[];
  businessRules: SOPBusinessRule[];
  schemaValidation: boolean;
  duplicateDetection: boolean;
}

/**
 * SOP Business Rule interface
 * Business rule definition
 */
export interface SOPBusinessRule {
  id: string;
  name: string;
  description: string;
  condition: SOPCondition[];
  action: 'allow' | 'deny' | 'transform' | 'flag';
  severity: 'info' | 'warning' | 'error';
  enabled: boolean;
}

/**
 * SOP Piece Validation interface
 * Validation settings for SOP pieces
 */
export interface SOPPieceValidation {
  enabled: boolean;
  configValidation: SOPValidationRule[];
  runtimeValidation: SOPValidationRule[];
  schemaValidation: boolean;
  complianceValidation: boolean;
}

/**
 * SOP Piece Compliance interface
 * Compliance settings for SOP pieces
 */
export interface SOPPieceCompliance {
  enabled: boolean;
  requirements: string[];
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
  dataRetention: number;
  encryption: boolean;
  digitalSignature: boolean;
}

/**
 * SOP Specific Configuration interface
 * SOP-specific configuration for pieces
 */
export interface SOPSpecificConfig {
  terminologyMapping: Record<string, string>;
  workflowIntegration: boolean;
  approvalWorkflow: boolean;
  complianceTracking: boolean;
  auditLogging: boolean;
  performanceMonitoring: boolean;
  businessRules: SOPBusinessRule[];
  customization: SOPCustomizationConfig;
}

/**
 * SOP Customization Configuration interface
 * Configuration for SOP customizations
 */
export interface SOPCustomizationConfig {
  allowCustomFields: boolean;
  customFields: SOPCustomField[];
  allowCustomActions: boolean;
  customActions: SOPCustomAction[];
  allowCustomValidation: boolean;
  customValidation: SOPValidationRule[];
  uiCustomizations: SOPUICustomization[];
}

/**
 * SOP Custom Field interface
 * Custom field definition
 */
export interface SOPCustomField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  required: boolean;
  defaultValue?: any;
  validation?: SOPValidationRule[];
  displayConfig: SOPFieldDisplayConfig;
}

/**
 * SOP Field Display Configuration interface
 * Display configuration for custom fields
 */
export interface SOPFieldDisplayConfig {
  label: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  position: number;
  visible: boolean;
  readonly: boolean;
  conditional?: SOPCondition[];
}

/**
 * SOP Custom Action interface
 * Custom action definition
 */
export interface SOPCustomAction {
  id: string;
  name: string;
  description: string;
  handler: string;
  parameters: SOPProperty[];
  permissions: string[];
  enabled: boolean;
}

/**
 * SOP UI Customization interface
 * UI customization configuration
 */
export interface SOPUICustomization {
  target: 'form' | 'list' | 'detail' | 'dashboard';
  type: 'css' | 'javascript' | 'template';
  content: string;
  enabled: boolean;
  priority: number;
}

// ============================================================================
// EXPORT TYPE UNIONS AND UTILITY TYPES
// ============================================================================

/**
 * All SOP Step Types union
 */
export type AllSOPStepTypes = SOPProcessStep | SOPDecisionPoint | SOPApprovalGate;

/**
 * All SOP Configuration Types union  
 */
export type AllSOPConfigs = SOPPieceConfig | SOPActionConfig | SOPTriggerConfig;

/**
 * All SOP Result Types union
 */
export type AllSOPResults = SOPDecisionResult | SOPApprovalResult | SOPComplianceRequirementResult;

/**
 * All SOP Metrics Types union
 */
export type AllSOPMetrics = SOPProcessMetrics | SOPStepMetrics | SOPExecutionMetrics;

/**
 * Utility type for SOP Property Value
 */
export type SOPPropertyValue<T = any> = T;

/**
 * Utility type for SOP Context Data
 */
export type SOPContextData<T = Record<string, any>> = T;

/**
 * Utility type for SOP Configuration
 */
export type SOPConfig<T = Record<string, any>> = T & {
  sopEnabled?: boolean;
  sopVersion?: string;
  sopCompatibility?: string[];
};

// ============================================================================
// TYPE VALIDATION SCHEMAS (using @sinclair/typebox)
// ============================================================================

/**
 * TypeBox schema for SOP Process validation
 */
export const SOPProcessSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  sopName: Type.String(),
  description: Type.Optional(Type.String()),
  sopDescription: Type.Optional(Type.String()),
  version: Type.Number(),
  status: Type.Enum(SOPProcessStatus),
  priority: Type.Enum(SOPPriority),
  category: Type.String(),
  tags: Type.Array(Type.String()),
  createdAt: Type.String(),
  updatedAt: Type.String()
});

/**
 * TypeBox schema for SOP Property validation
 */
export const SOPPropertySchema = Type.Object({
  id: Type.String(),
  displayName: Type.String(),
  description: Type.Optional(Type.String()),
  required: Type.Optional(Type.Boolean()),
  type: Type.Union([
    Type.Literal('string'),
    Type.Literal('number'),
    Type.Literal('boolean'),
    Type.Literal('object'),
    Type.Literal('array'),
    Type.Literal('file'),
    Type.Literal('date'),
    Type.Literal('email'),
    Type.Literal('url')
  ]),
  defaultValue: Type.Optional(Type.Any()),
  sopLabel: Type.Optional(Type.String()),
  sopDescription: Type.Optional(Type.String()),
  complianceRequired: Type.Optional(Type.Boolean()),
  auditTrail: Type.Optional(Type.Boolean())
});

/**
 * Type definitions for SOP Process validation
 */
export type ValidSOPProcess = Static<typeof SOPProcessSchema>;
export type ValidSOPProperty = Static<typeof SOPPropertySchema>;

// ============================================================================
// FINAL EXPORTS
// ============================================================================

// Export all enums
export {
  SOPProcessStatus,
  SOPStepType,
  SOPExecutionStatus,
  SOPComplianceStatus,
  SOPPriority
};

// Export main interfaces (already exported above)
// This comment serves as a marker for the comprehensive type system completion