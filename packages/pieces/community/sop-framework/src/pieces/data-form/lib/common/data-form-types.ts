/**
 * Data Form Types - Specific types and interfaces for Data Form pieces
 * 
 * This file defines the comprehensive type system for dynamic form creation,
 * data collection, validation, and compliance checking within SOP workflows.
 */

import { Static, Type } from '@sinclair/typebox';
import { 
    SOPExecutionState, 
    SOPComplianceStatus, 
    SOPPriority,
    SOPExecutionContext 
} from '../../../../types/sop-types';

/**
 * Data Form Field Types
 */
export enum DataFormFieldType {
    TEXT = 'TEXT',
    LONG_TEXT = 'LONG_TEXT',
    NUMBER = 'NUMBER',
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
    URL = 'URL',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    TIME = 'TIME',
    BOOLEAN = 'BOOLEAN',
    CHECKBOX = 'CHECKBOX',
    RADIO = 'RADIO',
    SELECT = 'SELECT',
    MULTI_SELECT = 'MULTI_SELECT',
    FILE_UPLOAD = 'FILE_UPLOAD',
    SIGNATURE = 'SIGNATURE',
    RATING = 'RATING',
    SLIDER = 'SLIDER',
    COLOR = 'COLOR',
    CURRENCY = 'CURRENCY',
    PERCENTAGE = 'PERCENTAGE',
    JSON = 'JSON',
    TABLE = 'TABLE',
    SECTION = 'SECTION',
    DIVIDER = 'DIVIDER',
    HTML = 'HTML'
}

/**
 * Data Form Validation Rules
 */
export enum ValidationRuleType {
    REQUIRED = 'REQUIRED',
    MIN_LENGTH = 'MIN_LENGTH',
    MAX_LENGTH = 'MAX_LENGTH',
    MIN_VALUE = 'MIN_VALUE',
    MAX_VALUE = 'MAX_VALUE',
    PATTERN = 'PATTERN',
    EMAIL_FORMAT = 'EMAIL_FORMAT',
    PHONE_FORMAT = 'PHONE_FORMAT',
    URL_FORMAT = 'URL_FORMAT',
    DATE_RANGE = 'DATE_RANGE',
    FILE_TYPE = 'FILE_TYPE',
    FILE_SIZE = 'FILE_SIZE',
    CUSTOM = 'CUSTOM',
    UNIQUE = 'UNIQUE',
    DEPENDENT = 'DEPENDENT',
    CONDITIONAL = 'CONDITIONAL'
}

/**
 * Form Submission Status
 */
export enum FormSubmissionStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    VALIDATED = 'VALIDATED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REQUIRES_REVISION = 'REQUIRES_REVISION',
    ARCHIVED = 'ARCHIVED'
}

/**
 * Form Display Mode
 */
export enum FormDisplayMode {
    FORM = 'FORM',
    WIZARD = 'WIZARD',
    TABLE = 'TABLE',
    CARDS = 'CARDS',
    READONLY = 'READONLY'
}

/**
 * Data Form Field Option
 */
export const DataFormFieldOption = Type.Object({
    label: Type.String({ description: 'Display label for the option' }),
    value: Type.Union([Type.String(), Type.Number(), Type.Boolean()], { description: 'Option value' }),
    description: Type.Optional(Type.String({ description: 'Optional description for the option' })),
    disabled: Type.Optional(Type.Boolean({ description: 'Whether option is disabled', default: false })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: 'Additional option metadata' }))
});

export type DataFormFieldOption = Static<typeof DataFormFieldOption>;

/**
 * Data Form Validation Rule
 */
export const DataFormValidationRule = Type.Object({
    id: Type.String({ description: 'Unique rule identifier' }),
    type: Type.Enum(ValidationRuleType, { description: 'Validation rule type' }),
    value: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Boolean(), Type.Array(Type.Unknown())], { description: 'Rule value/configuration' })),
    message: Type.String({ description: 'Validation error message' }),
    severity: Type.Union([Type.Literal('error'), Type.Literal('warning'), Type.Literal('info')], { default: 'error', description: 'Validation severity level' }),
    conditions: Type.Optional(Type.Array(Type.Object({
        field: Type.String(),
        operator: Type.String(),
        value: Type.Unknown()
    })), { description: 'Conditions for applying this rule' }),
    customFunction: Type.Optional(Type.String({ description: 'Custom validation function (for CUSTOM type)' }))
});

export type DataFormValidationRule = Static<typeof DataFormValidationRule>;

/**
 * Data Form Field Configuration
 */
export const DataFormField = Type.Object({
    id: Type.String({ description: 'Unique field identifier' }),
    name: Type.String({ description: 'Field name (for form submission)' }),
    label: Type.String({ description: 'Display label' }),
    type: Type.Enum(DataFormFieldType, { description: 'Field type' }),
    description: Type.Optional(Type.String({ description: 'Field description/help text' })),
    placeholder: Type.Optional(Type.String({ description: 'Placeholder text' })),
    defaultValue: Type.Optional(Type.Unknown({ description: 'Default field value' })),
    required: Type.Boolean({ description: 'Whether field is required', default: false }),
    disabled: Type.Boolean({ description: 'Whether field is disabled', default: false }),
    readonly: Type.Boolean({ description: 'Whether field is readonly', default: false }),
    hidden: Type.Boolean({ description: 'Whether field is hidden', default: false }),
    
    // Field-specific configurations
    options: Type.Optional(Type.Array(DataFormFieldOption), { description: 'Options for select/radio/checkbox fields' }),
    min: Type.Optional(Type.Number({ description: 'Minimum value (for number/date fields)' })),
    max: Type.Optional(Type.Number({ description: 'Maximum value (for number/date fields)' })),
    step: Type.Optional(Type.Number({ description: 'Step value (for number/slider fields)' })),
    maxLength: Type.Optional(Type.Number({ description: 'Maximum text length' })),
    minLength: Type.Optional(Type.Number({ description: 'Minimum text length' })),
    pattern: Type.Optional(Type.String({ description: 'Regex pattern for validation' })),
    
    // File upload specific
    acceptedFileTypes: Type.Optional(Type.Array(Type.String()), { description: 'Accepted file types for uploads' }),
    maxFileSize: Type.Optional(Type.Number({ description: 'Maximum file size in bytes' })),
    maxFiles: Type.Optional(Type.Number({ description: 'Maximum number of files' })),
    
    // Layout and styling
    width: Type.Optional(Type.Union([Type.String(), Type.Number()]), { description: 'Field width (CSS or percentage)' }),
    columnSpan: Type.Optional(Type.Number({ description: 'Grid column span', default: 1 })),
    rowSpan: Type.Optional(Type.Number({ description: 'Grid row span', default: 1 })),
    cssClass: Type.Optional(Type.String({ description: 'Custom CSS class' })),
    style: Type.Optional(Type.Record(Type.String(), Type.String()), { description: 'Inline styles' }),
    
    // Validation
    validationRules: Type.Array(DataFormValidationRule, { description: 'Field validation rules' }),
    
    // Conditional logic
    showConditions: Type.Optional(Type.Array(Type.Object({
        field: Type.String(),
        operator: Type.String(),
        value: Type.Unknown()
    })), { description: 'Conditions for showing this field' }),
    
    // Compliance and audit
    complianceRequired: Type.Boolean({ description: 'Whether field requires compliance validation', default: false }),
    auditTrail: Type.Boolean({ description: 'Whether to track changes to this field', default: true }),
    encryptData: Type.Boolean({ description: 'Whether to encrypt field data at rest', default: false }),
    
    // Metadata
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Additional field metadata' }),
    helpText: Type.Optional(Type.String({ description: 'Extended help text' })),
    tooltipText: Type.Optional(Type.String({ description: 'Tooltip text' })),
    
    // Integration points
    dataSource: Type.Optional(Type.Object({
        type: Type.String(),
        endpoint: Type.Optional(Type.String()),
        query: Type.Optional(Type.String()),
        transform: Type.Optional(Type.String())
    }), { description: 'External data source configuration' })
});

export type DataFormField = Static<typeof DataFormField>;

/**
 * Data Form Section
 */
export const DataFormSection = Type.Object({
    id: Type.String({ description: 'Unique section identifier' }),
    title: Type.String({ description: 'Section title' }),
    description: Type.Optional(Type.String({ description: 'Section description' })),
    fields: Type.Array(Type.String(), { description: 'Array of field IDs in this section' }),
    collapsible: Type.Boolean({ description: 'Whether section can be collapsed', default: false }),
    collapsed: Type.Boolean({ description: 'Whether section is initially collapsed', default: false }),
    required: Type.Boolean({ description: 'Whether all fields in section are required', default: false }),
    showConditions: Type.Optional(Type.Array(Type.Object({
        field: Type.String(),
        operator: Type.String(),
        value: Type.Unknown()
    })), { description: 'Conditions for showing this section' }),
    cssClass: Type.Optional(Type.String({ description: 'Custom CSS class' })),
    order: Type.Number({ description: 'Section display order', default: 0 })
});

export type DataFormSection = Static<typeof DataFormSection>;

/**
 * Data Form Configuration
 */
export const DataFormConfig = Type.Object({
    id: Type.String({ description: 'Unique form identifier' }),
    title: Type.String({ description: 'Form title' }),
    description: Type.Optional(Type.String({ description: 'Form description' })),
    version: Type.String({ description: 'Form version', default: '1.0.0' }),
    
    // Form structure
    fields: Type.Array(DataFormField, { description: 'Form fields configuration' }),
    sections: Type.Optional(Type.Array(DataFormSection), { description: 'Form sections configuration' }),
    
    // Display configuration
    displayMode: Type.Enum(FormDisplayMode, { description: 'Form display mode', default: FormDisplayMode.FORM }),
    layout: Type.Object({
        columns: Type.Number({ description: 'Number of grid columns', default: 1 }),
        spacing: Type.String({ description: 'Grid spacing', default: 'medium' }),
        responsive: Type.Boolean({ description: 'Whether layout is responsive', default: true })
    }, { description: 'Form layout configuration' }),
    
    // Submission configuration
    allowDraft: Type.Boolean({ description: 'Allow saving as draft', default: true }),
    allowMultipleSubmissions: Type.Boolean({ description: 'Allow multiple submissions', default: false }),
    requiresApproval: Type.Boolean({ description: 'Whether submissions require approval', default: false }),
    approvers: Type.Optional(Type.Array(Type.String()), { description: 'List of approver user IDs' }),
    
    // Validation configuration
    validateOnChange: Type.Boolean({ description: 'Validate fields on change', default: true }),
    validateOnSubmit: Type.Boolean({ description: 'Validate all fields on submit', default: true }),
    showValidationSummary: Type.Boolean({ description: 'Show validation summary', default: true }),
    
    // Security and compliance
    encryptSubmissions: Type.Boolean({ description: 'Encrypt form submissions', default: false }),
    retentionPeriodDays: Type.Optional(Type.Number({ description: 'Data retention period in days' })),
    complianceFrameworks: Type.Optional(Type.Array(Type.String()), { description: 'Applicable compliance frameworks' }),
    
    // Integration
    webhooks: Type.Optional(Type.Array(Type.Object({
        url: Type.String(),
        events: Type.Array(Type.String()),
        headers: Type.Optional(Type.Record(Type.String(), Type.String()))
    })), { description: 'Webhook configurations' }),
    
    // Theming and customization
    theme: Type.Optional(Type.Object({
        primaryColor: Type.Optional(Type.String()),
        secondaryColor: Type.Optional(Type.String()),
        fontFamily: Type.Optional(Type.String()),
        customCSS: Type.Optional(Type.String())
    }), { description: 'Form theme configuration' }),
    
    // Metadata
    tags: Type.Array(Type.String(), { description: 'Form tags for categorization' }),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Additional form metadata' }),
    createdAt: Type.String({ format: 'date-time', description: 'Form creation timestamp' }),
    updatedAt: Type.String({ format: 'date-time', description: 'Form last update timestamp' }),
    createdBy: Type.String({ description: 'Form creator user ID' })
});

export type DataFormConfig = Static<typeof DataFormConfig>;

/**
 * Form Submission Data
 */
export const FormSubmissionData = Type.Object({
    submissionId: Type.String({ description: 'Unique submission identifier' }),
    formId: Type.String({ description: 'Form identifier' }),
    formVersion: Type.String({ description: 'Form version at time of submission' }),
    
    // Submission data
    data: Type.Record(Type.String(), Type.Unknown(), { description: 'Submitted form data' }),
    files: Type.Optional(Type.Array(Type.Object({
        fieldId: Type.String(),
        fileName: Type.String(),
        fileSize: Type.Number(),
        fileType: Type.String(),
        uploadUrl: Type.String(),
        checksum: Type.Optional(Type.String())
    })), { description: 'Uploaded files' }),
    
    // Submission metadata
    status: Type.Enum(FormSubmissionStatus, { description: 'Submission status' }),
    submittedBy: Type.String({ description: 'Submitter user ID' }),
    submittedAt: Type.String({ format: 'date-time', description: 'Submission timestamp' }),
    lastModifiedAt: Type.Optional(Type.String({ format: 'date-time', description: 'Last modification timestamp' })),
    
    // Validation results
    validationResults: Type.Array(Type.Object({
        fieldId: Type.String(),
        isValid: Type.Boolean(),
        errors: Type.Array(Type.String()),
        warnings: Type.Array(Type.String())
    }), { description: 'Field validation results' }),
    
    // Approval workflow
    approvalWorkflow: Type.Optional(Type.Object({
        status: Type.Union([Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected')]),
        approvers: Type.Array(Type.Object({
            userId: Type.String(),
            status: Type.Union([Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected')]),
            timestamp: Type.Optional(Type.String({ format: 'date-time' })),
            comments: Type.Optional(Type.String())
        })),
        finalDecision: Type.Optional(Type.Object({
            decision: Type.Union([Type.Literal('approved'), Type.Literal('rejected')]),
            decidedBy: Type.String(),
            decidedAt: Type.String({ format: 'date-time' }),
            comments: Type.Optional(Type.String())
        }))
    }), { description: 'Approval workflow data' }),
    
    // Audit trail
    auditTrail: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        action: Type.String(),
        userId: Type.String(),
        details: Type.Record(Type.String(), Type.Unknown()),
        ipAddress: Type.Optional(Type.String()),
        userAgent: Type.Optional(Type.String())
    }), { description: 'Submission audit trail' }),
    
    // Compliance
    complianceChecks: Type.Optional(Type.Array(Type.Object({
        framework: Type.String(),
        status: Type.Enum(SOPComplianceStatus),
        checkedAt: Type.String({ format: 'date-time' }),
        details: Type.Optional(Type.String())
    })), { description: 'Compliance validation results' })
});

export type FormSubmissionData = Static<typeof FormSubmissionData>;

/**
 * Data Form Execution Result
 */
export const DataFormResult = Type.Object({
    success: Type.Boolean({ description: 'Whether form processing was successful' }),
    executionId: Type.String({ description: 'Unique execution identifier' }),
    sopId: Type.String({ description: 'SOP identifier' }),
    formId: Type.String({ description: 'Form identifier' }),
    submissionId: Type.Optional(Type.String({ description: 'Submission identifier (if data was submitted)' })),
    
    executionTime: Type.Number({ description: 'Total execution time in milliseconds' }),
    
    // Form processing results
    formGenerated: Type.Boolean({ description: 'Whether form was successfully generated' }),
    dataCollected: Type.Boolean({ description: 'Whether data was collected' }),
    validationPassed: Type.Boolean({ description: 'Whether all validation passed' }),
    
    // Collected data
    collectedData: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Collected form data' }),
    uploadedFiles: Type.Optional(Type.Array(Type.Object({
        fieldId: Type.String(),
        fileName: Type.String(),
        fileUrl: Type.String()
    })), { description: 'Information about uploaded files' }),
    
    // Validation results
    validationResults: Type.Array(Type.Object({
        fieldId: Type.String(),
        fieldName: Type.String(),
        isValid: Type.Boolean(),
        errors: Type.Array(Type.String()),
        warnings: Type.Array(Type.String())
    }), { description: 'Detailed validation results' }),
    
    // Compliance results
    complianceStatus: Type.Enum(SOPComplianceStatus, { description: 'Overall compliance status' }),
    complianceResults: Type.Optional(Type.Array(Type.Object({
        framework: Type.String(),
        status: Type.Enum(SOPComplianceStatus),
        details: Type.Optional(Type.String())
    })), { description: 'Detailed compliance results' }),
    
    // Audit trail
    auditTrail: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        action: Type.String(),
        userId: Type.String(),
        details: Type.Record(Type.String(), Type.Unknown())
    }), { description: 'Complete audit trail for this execution' }),
    
    // Error information
    error: Type.Optional(Type.String({ description: 'Error message if execution failed' })),
    
    // Metadata
    metadata: Type.Object({
        executedBy: Type.String(),
        completedAt: Type.Optional(Type.String({ format: 'date-time' })),
        failedAt: Type.Optional(Type.String({ format: 'date-time' })),
        priority: Type.Enum(SOPPriority),
        tags: Type.Optional(Type.Array(Type.String())),
        formVersion: Type.String(),
        processingMode: Type.Union([Type.Literal('collect'), Type.Literal('validate'), Type.Literal('display')]),
        retryCount: Type.Optional(Type.Number()),
        escalationLevel: Type.Optional(Type.Number())
    }, { description: 'Execution metadata' })
});

export type DataFormResult = Static<typeof DataFormResult>;

/**
 * Data Form Processing Mode
 */
export enum FormProcessingMode {
    COLLECT = 'COLLECT',           // Collect data from users
    VALIDATE = 'VALIDATE',         // Validate existing data
    DISPLAY = 'DISPLAY',          // Display form in readonly mode
    GENERATE = 'GENERATE',        // Generate form definition
    MIGRATE = 'MIGRATE'           // Migrate data between form versions
}

/**
 * Data Form Error Types
 */
export enum DataFormErrorType {
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    DATA_COLLECTION_ERROR = 'DATA_COLLECTION_ERROR',
    FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
    COMPLIANCE_ERROR = 'COMPLIANCE_ERROR',
    APPROVAL_ERROR = 'APPROVAL_ERROR',
    STORAGE_ERROR = 'STORAGE_ERROR',
    INTEGRATION_ERROR = 'INTEGRATION_ERROR',
    SECURITY_ERROR = 'SECURITY_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

/**
 * Data Form Error Details
 */
export const DataFormError = Type.Object({
    type: Type.Enum(DataFormErrorType, { description: 'Error type' }),
    message: Type.String({ description: 'Error message' }),
    code: Type.Optional(Type.String({ description: 'Error code' })),
    fieldId: Type.Optional(Type.String({ description: 'Field ID where error occurred' })),
    details: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Error details' }),
    timestamp: Type.String({ format: 'date-time', description: 'When error occurred' }),
    recoverable: Type.Boolean({ description: 'Whether error is recoverable' }),
    retryable: Type.Boolean({ description: 'Whether operation can be retried' }),
    userMessage: Type.Optional(Type.String({ description: 'User-friendly error message' })),
    technicalDetails: Type.Optional(Type.String({ description: 'Technical error details for debugging' })
);

export type DataFormError = Static<typeof DataFormError>;

/**
 * Form Analytics Data
 */
export const FormAnalytics = Type.Object({
    formId: Type.String({ description: 'Form identifier' }),
    period: Type.Object({
        startDate: Type.String({ format: 'date-time' }),
        endDate: Type.String({ format: 'date-time' })
    }, { description: 'Analytics period' }),
    
    // Usage statistics
    totalViews: Type.Number({ description: 'Total form views' }),
    totalSubmissions: Type.Number({ description: 'Total submissions' }),
    completionRate: Type.Number({ description: 'Form completion rate percentage' }),
    averageCompletionTime: Type.Number({ description: 'Average completion time in seconds' }),
    abandonmentRate: Type.Number({ description: 'Form abandonment rate percentage' }),
    
    // Field-level analytics
    fieldAnalytics: Type.Array(Type.Object({
        fieldId: Type.String(),
        fieldName: Type.String(),
        completionRate: Type.Number(),
        errorRate: Type.Number(),
        averageTimeSpent: Type.Number(),
        mostCommonValues: Type.Optional(Type.Array(Type.Object({
            value: Type.Unknown(),
            count: Type.Number(),
            percentage: Type.Number()
        })))
    }), { description: 'Per-field analytics' }),
    
    // Validation analytics
    validationErrors: Type.Array(Type.Object({
        fieldId: Type.String(),
        errorType: Type.String(),
        count: Type.Number(),
        percentage: Type.Number()
    }), { description: 'Validation error statistics' }),
    
    // Performance metrics
    performanceMetrics: Type.Object({
        averageLoadTime: Type.Number(),
        averageValidationTime: Type.Number(),
        averageSubmissionTime: Type.Number(),
        errorRate: Type.Number()
    }, { description: 'Form performance metrics' })
});

export type FormAnalytics = Static<typeof FormAnalytics>;