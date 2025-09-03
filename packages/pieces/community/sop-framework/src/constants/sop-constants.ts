/**
 * SOP Framework Constants
 */

import { SOPPriority, SOPExecutionState, SOPComplianceStatus } from '../types/sop-types';

/**
 * Framework Version Information
 */
export const SOP_FRAMEWORK = {
    NAME: 'SOP Framework',
    VERSION: '0.1.0',
    DESCRIPTION: 'Foundational framework for Standard Operating Procedure workflow components',
    AUTHOR: 'SOP Framework Team',
    REPOSITORY: 'https://github.com/activepieces/sop-framework'
} as const;

/**
 * Default Configuration Values
 */
export const SOP_DEFAULTS = {
    PRIORITY: SOPPriority.NORMAL,
    AUDIT_TRAIL_ENABLED: true,
    COMPLIANCE_CHECK_ENABLED: false,
    NOTIFICATION_ENABLED: true,
    TIMEOUT_MINUTES: 60,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    MAX_AUDIT_ENTRIES: 1000,
    MAX_HISTORY_ENTRIES: 100,
    DEFAULT_ESCALATION_TIMEOUT: 24 * 60 // 24 hours in minutes
} as const;

/**
 * Execution State Transitions
 */
export const SOP_STATE_TRANSITIONS: Record<SOPExecutionState, SOPExecutionState[]> = {
    [SOPExecutionState.PENDING]: [
        SOPExecutionState.IN_PROGRESS,
        SOPExecutionState.CANCELLED
    ],
    [SOPExecutionState.IN_PROGRESS]: [
        SOPExecutionState.WAITING_APPROVAL,
        SOPExecutionState.ESCALATED,
        SOPExecutionState.COMPLETED,
        SOPExecutionState.FAILED,
        SOPExecutionState.PAUSED,
        SOPExecutionState.CANCELLED
    ],
    [SOPExecutionState.WAITING_APPROVAL]: [
        SOPExecutionState.APPROVED,
        SOPExecutionState.REJECTED,
        SOPExecutionState.ESCALATED,
        SOPExecutionState.CANCELLED
    ],
    [SOPExecutionState.APPROVED]: [
        SOPExecutionState.IN_PROGRESS,
        SOPExecutionState.COMPLETED
    ],
    [SOPExecutionState.REJECTED]: [
        SOPExecutionState.CANCELLED,
        SOPExecutionState.PENDING // Allow restart
    ],
    [SOPExecutionState.ESCALATED]: [
        SOPExecutionState.IN_PROGRESS,
        SOPExecutionState.WAITING_APPROVAL,
        SOPExecutionState.CANCELLED
    ],
    [SOPExecutionState.COMPLETED]: [], // Terminal state
    [SOPExecutionState.FAILED]: [
        SOPExecutionState.PENDING // Allow restart
    ],
    [SOPExecutionState.CANCELLED]: [
        SOPExecutionState.PENDING // Allow restart
    ],
    [SOPExecutionState.PAUSED]: [
        SOPExecutionState.IN_PROGRESS,
        SOPExecutionState.CANCELLED
    ]
};

/**
 * Priority Levels with Numeric Values
 */
export const SOP_PRIORITY_LEVELS: Record<SOPPriority, number> = {
    [SOPPriority.LOW]: 1,
    [SOPPriority.NORMAL]: 2,
    [SOPPriority.HIGH]: 3,
    [SOPPriority.URGENT]: 4,
    [SOPPriority.CRITICAL]: 5
};

/**
 * Compliance Status Hierarchy
 */
export const SOP_COMPLIANCE_HIERARCHY: Record<SOPComplianceStatus, number> = {
    [SOPComplianceStatus.COMPLIANT]: 1,
    [SOPComplianceStatus.PENDING_REVIEW]: 2,
    [SOPComplianceStatus.REQUIRES_ATTENTION]: 3,
    [SOPComplianceStatus.EXEMPT]: 4,
    [SOPComplianceStatus.NON_COMPLIANT]: 5
};

/**
 * Validation Error Codes
 */
export const SOP_ERROR_CODES = {
    // Basic Validation Errors
    MISSING_METADATA_FIELD: 'MISSING_METADATA_FIELD',
    INVALID_EXECUTION_STATE: 'INVALID_EXECUTION_STATE',
    MISSING_EXECUTOR: 'MISSING_EXECUTOR',
    EMPTY_AUDIT_TRAIL: 'EMPTY_AUDIT_TRAIL',
    INVALID_AUDIT_ORDER: 'INVALID_AUDIT_ORDER',
    
    // Compliance Errors
    COMPLIANCE_GDPR: 'COMPLIANCE_GDPR',
    COMPLIANCE_SOX: 'COMPLIANCE_SOX',
    COMPLIANCE_HIPAA: 'COMPLIANCE_HIPAA',
    COMPLIANCE_PCI: 'COMPLIANCE_PCI',
    
    // Execution Errors
    EXECUTION_TIMEOUT: 'EXECUTION_TIMEOUT',
    EXECUTION_FAILED: 'EXECUTION_FAILED',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    RULE_EXECUTION_ERROR: 'RULE_EXECUTION_ERROR',
    COMPLIANCE_RULE_ERROR: 'COMPLIANCE_RULE_ERROR',
    CUSTOM_VALIDATION_ERROR: 'CUSTOM_VALIDATION_ERROR',
    
    // Framework Errors
    PIECE_NOT_FOUND: 'PIECE_NOT_FOUND',
    REGISTRY_ERROR: 'REGISTRY_ERROR',
    INTEGRATION_ERROR: 'INTEGRATION_ERROR',
    FRAMEWORK_ERROR: 'FRAMEWORK_ERROR'
} as const;

/**
 * Event Types
 */
export const SOP_EVENT_TYPES = {
    // Workflow Events
    WORKFLOW_INITIALIZED: 'workflow_initialized',
    WORKFLOW_STATE_UPDATED: 'workflow_state_updated',
    WORKFLOW_COMPLETED: 'workflow_completed',
    WORKFLOW_FAILED: 'workflow_failed',
    
    // Execution Events
    EXECUTION_STARTED: 'execution_started',
    EXECUTION_COMPLETED: 'execution_completed',
    EXECUTION_FAILED: 'execution_failed',
    EXECUTION_CANCELLED: 'execution_cancelled',
    
    // Step Events
    STEP_STARTED: 'step_started',
    STEP_COMPLETED: 'step_completed',
    STEP_FAILED: 'step_failed',
    STEP_SKIPPED: 'step_skipped',
    
    // Data Events
    VARIABLE_UPDATED: 'variable_updated',
    SHARED_DATA_UPDATED: 'shared_data_updated',
    
    // Notification Events
    NOTIFICATION_ADDED: 'notification_added',
    NOTIFICATION_READ: 'notification_read',
    
    // Approval Events
    APPROVAL_REQUESTED: 'approval_requested',
    APPROVAL_GRANTED: 'approval_granted',
    APPROVAL_DENIED: 'approval_denied',
    APPROVAL_EXPIRED: 'approval_expired',
    
    // Escalation Events
    ESCALATION_CREATED: 'escalation_created',
    ESCALATION_RESOLVED: 'escalation_resolved',
    
    // Registry Events
    PIECE_REGISTERED: 'piece_registered',
    PIECE_UNREGISTERED: 'piece_unregistered',
    PIECE_STATE_CHANGED: 'piece_state_changed',
    REGISTRY_CLEARED: 'registry_cleared',
    
    // Validation Events
    VALIDATION_STARTED: 'validation_started',
    VALIDATION_COMPLETED: 'validation_completed',
    VALIDATION_FAILED: 'validation_failed',
    COMPLIANCE_CHECK_STARTED: 'compliance_check_started',
    COMPLIANCE_CHECK_COMPLETED: 'compliance_check_completed'
} as const;

/**
 * Common Regular Expressions
 */
export const SOP_REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    URL: /^https?:\/\/.+/,
    SOP_ID: /^sop-[a-zA-Z0-9\-_]{8,}$/,
    VERSION: /^\d+\.\d+\.\d+$/,
    USER_ID: /^[a-zA-Z0-9\-_]{1,50}$/
} as const;

/**
 * File Size Limits (in bytes)
 */
export const SOP_FILE_LIMITS = {
    MAX_ATTACHMENT_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_LOG_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_EXPORT_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_TOTAL_ATTACHMENTS: 500 * 1024 * 1024 // 500MB
} as const;

/**
 * Timeout Values (in milliseconds)
 */
export const SOP_TIMEOUTS = {
    DEFAULT_EXECUTION: 60 * 1000, // 1 minute
    LONG_EXECUTION: 300 * 1000, // 5 minutes
    VALIDATION: 10 * 1000, // 10 seconds
    COMPLIANCE_CHECK: 30 * 1000, // 30 seconds
    HOOK_EXECUTION: 5 * 1000, // 5 seconds
    DATABASE_QUERY: 30 * 1000, // 30 seconds
    API_CALL: 60 * 1000 // 1 minute
} as const;

/**
 * Cache Configuration
 */
export const SOP_CACHE = {
    MAX_ENTRIES: 1000,
    TTL_MINUTES: 60,
    CLEANUP_INTERVAL_MINUTES: 15
} as const;

/**
 * Logging Configuration
 */
export const SOP_LOGGING = {
    MAX_LOG_ENTRIES: 10000,
    LOG_LEVELS: ['debug', 'info', 'warn', 'error'] as const,
    DEFAULT_LEVEL: 'info' as const,
    STRUCTURED_LOGGING: true
} as const;

/**
 * Metrics and Monitoring
 */
export const SOP_METRICS = {
    COLLECTION_INTERVAL_MS: 60000, // 1 minute
    RETENTION_DAYS: 30,
    BATCH_SIZE: 100,
    MAX_SAMPLES: 1440 // 24 hours of 1-minute samples
} as const;

/**
 * Security Configuration
 */
export const SOP_SECURITY = {
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 30,
    SESSION_TIMEOUT_MINUTES: 480, // 8 hours
    PASSWORD_MIN_LENGTH: 8,
    REQUIRE_MFA: false
} as const;

/**
 * Integration Limits
 */
export const SOP_INTEGRATION_LIMITS = {
    MAX_CONCURRENT_EXECUTIONS: 100,
    MAX_QUEUE_SIZE: 1000,
    MAX_RETRY_ATTEMPTS: 5,
    MAX_WEBHOOK_RETRIES: 3,
    MAX_API_CALLS_PER_MINUTE: 1000
} as const;