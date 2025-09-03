/**
 * Common SOP Properties - Reusable property definitions for SOP pieces
 */

import { Property } from '@activepieces/pieces-framework';
import { SOPPriority, SOPExecutionState, SOPComplianceStatus } from '../types/sop-types';

/**
 * Common SOP priority property
 */
export const sopPriorityProp = Property.StaticDropdown({
    displayName: 'Priority',
    description: 'Priority level for this SOP step',
    required: false,
    defaultValue: SOPPriority.NORMAL,
    options: {
        options: [
            { label: 'Low', value: SOPPriority.LOW },
            { label: 'Normal', value: SOPPriority.NORMAL },
            { label: 'High', value: SOPPriority.HIGH },
            { label: 'Urgent', value: SOPPriority.URGENT },
            { label: 'Critical', value: SOPPriority.CRITICAL }
        ]
    }
});

/**
 * User assignment property
 */
export const assignedToProp = Property.ShortText({
    displayName: 'Assigned To',
    description: 'User ID or email of person assigned to this step',
    required: false,
    placeholder: 'user@company.com or user123'
});

/**
 * Due date property
 */
export const dueDateProp = Property.DateTime({
    displayName: 'Due Date',
    description: 'When this step should be completed',
    required: false
});

/**
 * Compliance check enablement property
 */
export const enableComplianceCheckProp = Property.Checkbox({
    displayName: 'Enable Compliance Check',
    description: 'Enable compliance validation for this step',
    required: false,
    defaultValue: false
});

/**
 * Audit trail enablement property
 */
export const enableAuditTrailProp = Property.Checkbox({
    displayName: 'Enable Audit Trail',
    description: 'Enable audit trail logging for this step',
    required: false,
    defaultValue: true
});

/**
 * Custom variables property
 */
export const customVariablesProp = Property.Object({
    displayName: 'Custom Variables',
    description: 'Custom variables for this SOP instance (key-value pairs)',
    required: false,
    defaultValue: {}
});

/**
 * Tags property
 */
export const tagsProp = Property.Array({
    displayName: 'Tags',
    description: 'Tags for categorization and filtering',
    required: false
});

/**
 * Notes property
 */
export const notesProp = Property.LongText({
    displayName: 'Notes',
    description: 'Additional notes or comments for this step',
    required: false,
    placeholder: 'Enter any relevant notes or instructions...'
});

/**
 * Timeout property
 */
export const timeoutProp = Property.Number({
    displayName: 'Timeout (minutes)',
    description: 'Maximum time allowed for this step to complete',
    required: false,
    defaultValue: 60
});

/**
 * Retry attempts property
 */
export const retryAttemptsProp = Property.Number({
    displayName: 'Retry Attempts',
    description: 'Number of times to retry this step if it fails',
    required: false,
    defaultValue: 0
});

/**
 * Notification settings property
 */
export const notificationSettingsProp = Property.Object({
    displayName: 'Notification Settings',
    description: 'Configure notifications for this step',
    required: false,
    defaultValue: {
        enabled: true,
        onStart: false,
        onComplete: true,
        onError: true,
        onTimeout: true,
        recipients: []
    }
});

/**
 * Escalation settings property
 */
export const escalationSettingsProp = Property.Object({
    displayName: 'Escalation Settings',
    description: 'Configure escalation rules for this step',
    required: false,
    defaultValue: {
        enabled: false,
        timeoutMinutes: 24 * 60, // 24 hours
        escalateTo: [],
        escalationLevels: 1
    }
});

/**
 * Approval settings property
 */
export const approvalSettingsProp = Property.Object({
    displayName: 'Approval Settings',
    description: 'Configure approval requirements for this step',
    required: false,
    defaultValue: {
        required: false,
        approvers: [],
        minimumApprovals: 1,
        timeoutHours: 48,
        allowSelfApproval: false
    }
});

/**
 * Data validation rules property
 */
export const dataValidationRulesProp = Property.Array({
    displayName: 'Data Validation Rules',
    description: 'Custom validation rules for input data',
    required: false
});

/**
 * Error handling configuration property
 */
export const errorHandlingProp = Property.Object({
    displayName: 'Error Handling',
    description: 'Configure how errors should be handled',
    required: false,
    defaultValue: {
        continueOnError: false,
        logErrors: true,
        notifyOnError: true,
        errorActions: []
    }
});

/**
 * Input data property
 */
export const inputDataProp = Property.Object({
    displayName: 'Input Data',
    description: 'Data to be processed by this step',
    required: true,
    defaultValue: {}
});

/**
 * Expected output property
 */
export const expectedOutputProp = Property.Object({
    displayName: 'Expected Output',
    description: 'Expected output structure (for validation)',
    required: false,
    defaultValue: {}
});

/**
 * Dependencies property
 */
export const dependenciesProp = Property.Array({
    displayName: 'Dependencies',
    description: 'List of step IDs that must complete before this step',
    required: false
});

/**
 * Conditions property
 */
export const conditionsProp = Property.Array({
    displayName: 'Execution Conditions',
    description: 'Conditions that must be met for this step to execute',
    required: false
});

/**
 * Parallel execution property
 */
export const allowParallelProp = Property.Checkbox({
    displayName: 'Allow Parallel Execution',
    description: 'Allow this step to run in parallel with other steps',
    required: false,
    defaultValue: false
});

/**
 * Step description property
 */
export const stepDescriptionProp = Property.LongText({
    displayName: 'Step Description',
    description: 'Detailed description of what this step does',
    required: false,
    placeholder: 'Describe the purpose and functionality of this step...'
});

/**
 * Success criteria property
 */
export const successCriteriaProp = Property.Array({
    displayName: 'Success Criteria',
    description: 'Criteria that define successful completion of this step',
    required: false
});

/**
 * Compliance requirements property
 */
export const complianceRequirementsProp = Property.Array({
    displayName: 'Compliance Requirements',
    description: 'Specific compliance rules that apply to this step',
    required: false
});

/**
 * Attachments property
 */
export const attachmentsProp = Property.Array({
    displayName: 'Attachments',
    description: 'Files or documents attached to this step',
    required: false
});

/**
 * Reference links property
 */
export const referenceLinksProp = Property.Array({
    displayName: 'Reference Links',
    description: 'Links to relevant documentation or resources',
    required: false
});

/**
 * Execution context property
 */
export const executionContextProp = Property.Object({
    displayName: 'Execution Context',
    description: 'Additional context information for execution',
    required: false,
    defaultValue: {}
});

/**
 * Monitoring settings property
 */
export const monitoringSettingsProp = Property.Object({
    displayName: 'Monitoring Settings',
    description: 'Configure monitoring and alerting for this step',
    required: false,
    defaultValue: {
        enabled: false,
        metrics: [],
        alerts: []
    }
});

/**
 * SOP metadata property
 */
export const sopMetadataProp = Property.Json({
    displayName: 'SOP Metadata',
    description: 'Standard Operating Procedure metadata',
    required: false,
    defaultValue: {
        version: '1.0.0',
        category: 'PROCESS_MANAGEMENT',
        pieceType: 'PROCESS_STEP',
        priority: SOPPriority.NORMAL,
        complianceRequired: false,
        auditTrailRequired: true
    }
});

/**
 * Collection of all common SOP properties
 */
export const commonSOPProps = {
    sopMetadata: sopMetadataProp,
    priority: sopPriorityProp,
    assignedTo: assignedToProp,
    dueDate: dueDateProp,
    enableComplianceCheck: enableComplianceCheckProp,
    enableAuditTrail: enableAuditTrailProp,
    customVariables: customVariablesProp,
    tags: tagsProp,
    notes: notesProp,
    timeout: timeoutProp,
    retryAttempts: retryAttemptsProp,
    notificationSettings: notificationSettingsProp,
    escalationSettings: escalationSettingsProp,
    approvalSettings: approvalSettingsProp,
    errorHandling: errorHandlingProp,
    allowParallel: allowParallelProp,
    stepDescription: stepDescriptionProp,
    executionContext: executionContextProp
};

/**
 * Essential SOP properties (minimal set)
 */
export const essentialSOPProps = {
    sopMetadata: sopMetadataProp,
    priority: sopPriorityProp,
    assignedTo: assignedToProp,
    enableAuditTrail: enableAuditTrailProp,
    notes: notesProp
};

/**
 * Advanced SOP properties (for complex workflows)
 */
export const advancedSOPProps = {
    ...commonSOPProps,
    dataValidationRules: dataValidationRulesProp,
    dependencies: dependenciesProp,
    conditions: conditionsProp,
    successCriteria: successCriteriaProp,
    complianceRequirements: complianceRequirementsProp,
    attachments: attachmentsProp,
    referenceLinks: referenceLinksProp,
    monitoringSettings: monitoringSettingsProp
};