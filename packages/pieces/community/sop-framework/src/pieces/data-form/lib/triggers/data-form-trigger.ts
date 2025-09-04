/**
 * Data Form Trigger
 * 
 * Triggers for data form events including submissions, validation failures,
 * approval workflows, and compliance violations. Enables reactive SOP workflows
 * based on form interactions and data collection events.
 */

import { createTrigger, Property, TriggerStrategy } from '@activepieces/pieces-framework';
import { 
    DataFormConfig,
    FormSubmissionData,
    FormSubmissionStatus,
    DataFormResult,
    FormProcessingMode 
} from '../common/data-form-types';
import { 
    SOPExecutionState, 
    SOPComplianceStatus, 
    SOPPriority 
} from '../../../../types/sop-types';
import { nanoid } from 'nanoid';

/**
 * Form event types for triggering
 */
export enum FormEventType {
    FORM_SUBMITTED = 'FORM_SUBMITTED',
    FORM_VALIDATED = 'FORM_VALIDATED',
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
    APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
    APPROVAL_GRANTED = 'APPROVAL_GRANTED',
    APPROVAL_DENIED = 'APPROVAL_DENIED',
    FORM_DRAFT_SAVED = 'FORM_DRAFT_SAVED',
    FILE_UPLOADED = 'FILE_UPLOADED',
    FORM_EXPIRED = 'FORM_EXPIRED',
    DATA_EXPORTED = 'DATA_EXPORTED',
    FORM_ANALYTICS_UPDATED = 'FORM_ANALYTICS_UPDATED'
}

/**
 * Form event payload structure
 */
export interface FormEventPayload {
    eventType: FormEventType;
    timestamp: string;
    eventId: string;
    formId: string;
    formTitle: string;
    submissionId?: string;
    userId: string;
    
    // Event-specific data
    submissionData?: FormSubmissionData;
    validationResults?: any[];
    complianceResults?: any[];
    approvalWorkflow?: any;
    fileInfo?: {
        fieldId: string;
        fileName: string;
        fileSize: number;
        fileType: string;
        uploadUrl: string;
    };
    
    // Context information
    sopContext?: {
        sopId: string;
        executionId: string;
        priority: SOPPriority;
        assignedTo?: string;
        tags?: string[];
    };
    
    // Metadata
    metadata: {
        triggeredBy: string;
        processingMode: FormProcessingMode;
        executionTime?: number;
        retryCount?: number;
        escalationLevel?: number;
        formVersion: string;
        userAgent?: string;
        ipAddress?: string;
    };
}

/**
 * Form submission trigger - triggers when a form is submitted
 */
export const formSubmissionTrigger = createTrigger({
    name: 'form_submission',
    displayName: 'Form Submission',
    description: 'Trigger when a form is submitted by a user',
    
    props: {
        formId: Property.ShortText({
            displayName: 'Form ID',
            description: 'ID of the form to monitor for submissions',
            required: true,
            placeholder: 'form_12345'
        }),
        
        includeValidationResults: Property.Checkbox({
            displayName: 'Include Validation Results',
            description: 'Include field validation results in the trigger payload',
            required: false,
            defaultValue: true
        }),
        
        includeSubmissionData: Property.Checkbox({
            displayName: 'Include Submission Data',
            description: 'Include the actual form data in the trigger payload',
            required: false,
            defaultValue: true
        }),
        
        filterByStatus: Property.MultiSelectDropdown({
            displayName: 'Filter by Status',
            description: 'Only trigger for specific submission statuses',
            required: false,
            options: {
                options: [
                    { label: 'Draft', value: FormSubmissionStatus.DRAFT },
                    { label: 'Submitted', value: FormSubmissionStatus.SUBMITTED },
                    { label: 'Validated', value: FormSubmissionStatus.VALIDATED },
                    { label: 'Approved', value: FormSubmissionStatus.APPROVED },
                    { label: 'Rejected', value: FormSubmissionStatus.REJECTED },
                    { label: 'Requires Revision', value: FormSubmissionStatus.REQUIRES_REVISION }
                ]
            }
        }),
        
        filterByUser: Property.Array({
            displayName: 'Filter by User',
            description: 'Only trigger for submissions from specific users',
            required: false
        }),
        
        minimumPriority: Property.StaticDropdown({
            displayName: 'Minimum Priority',
            description: 'Only trigger for submissions with this priority or higher',
            required: false,
            options: {
                options: [
                    { label: 'Low', value: SOPPriority.LOW },
                    { label: 'Normal', value: SOPPriority.NORMAL },
                    { label: 'High', value: SOPPriority.HIGH },
                    { label: 'Urgent', value: SOPPriority.URGENT },
                    { label: 'Critical', value: SOPPriority.CRITICAL }
                ]
            }
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        // In a real implementation, this would register webhooks or set up polling
        // For this example, we'll simulate the webhook registration
        const { propsValue } = context;
        
        console.log(`Enabling form submission trigger for form: ${propsValue.formId}`);
        
        // Return webhook URL or polling configuration
        return {
            webhookUrl: `${context.webhookUrl}/form-submission`,
            formId: propsValue.formId,
            filters: {
                status: propsValue.filterByStatus,
                users: propsValue.filterByUser,
                minimumPriority: propsValue.minimumPriority
            }
        };
    },
    
    async onDisable(context) {
        console.log('Disabling form submission trigger');
        // Cleanup webhook registration
    },
    
    async run(context) {
        const { propsValue, payload } = context;
        
        // Validate webhook payload
        if (!payload || !payload.eventType || payload.eventType !== FormEventType.FORM_SUBMITTED) {
            return [];
        }
        
        // Apply filters
        const formPayload = payload as FormEventPayload;
        
        // Filter by form ID
        if (formPayload.formId !== propsValue.formId) {
            return [];
        }
        
        // Filter by status
        if (propsValue.filterByStatus && propsValue.filterByStatus.length > 0) {
            const submissionStatus = formPayload.submissionData?.status;
            if (!submissionStatus || !propsValue.filterByStatus.includes(submissionStatus)) {
                return [];
            }
        }
        
        // Filter by user
        if (propsValue.filterByUser && propsValue.filterByUser.length > 0) {
            if (!propsValue.filterByUser.includes(formPayload.userId)) {
                return [];
            }
        }
        
        // Filter by priority
        if (propsValue.minimumPriority && formPayload.sopContext?.priority) {
            const priorityLevels = {
                [SOPPriority.LOW]: 1,
                [SOPPriority.NORMAL]: 2,
                [SOPPriority.HIGH]: 3,
                [SOPPriority.URGENT]: 4,
                [SOPPriority.CRITICAL]: 5
            };
            
            const currentPriority = priorityLevels[formPayload.sopContext.priority];
            const minimumPriority = priorityLevels[propsValue.minimumPriority];
            
            if (currentPriority < minimumPriority) {
                return [];
            }
        }
        
        // Prepare trigger payload
        const triggerPayload = {
            ...formPayload,
            // Remove sensitive data if not requested
            submissionData: propsValue.includeSubmissionData ? formPayload.submissionData : undefined,
            validationResults: propsValue.includeValidationResults ? formPayload.validationResults : undefined
        };
        
        return [triggerPayload];
    }
});

/**
 * Validation failure trigger - triggers when form validation fails
 */
export const validationFailureTrigger = createTrigger({
    name: 'validation_failure',
    displayName: 'Validation Failure',
    description: 'Trigger when form validation fails',
    
    props: {
        formId: Property.ShortText({
            displayName: 'Form ID',
            description: 'ID of the form to monitor for validation failures',
            required: true
        }),
        
        errorThreshold: Property.Number({
            displayName: 'Error Threshold',
            description: 'Minimum number of validation errors to trigger',
            required: false,
            defaultValue: 1
        }),
        
        specificFields: Property.Array({
            displayName: 'Specific Fields',
            description: 'Only trigger for validation errors on these fields',
            required: false
        }),
        
        errorTypes: Property.Array({
            displayName: 'Error Types',
            description: 'Only trigger for specific types of validation errors',
            required: false
        }),
        
        includeErrorDetails: Property.Checkbox({
            displayName: 'Include Error Details',
            description: 'Include detailed validation error information',
            required: false,
            defaultValue: true
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        const { propsValue } = context;
        console.log(`Enabling validation failure trigger for form: ${propsValue.formId}`);
        
        return {
            webhookUrl: `${context.webhookUrl}/validation-failure`,
            formId: propsValue.formId,
            filters: {
                errorThreshold: propsValue.errorThreshold,
                specificFields: propsValue.specificFields,
                errorTypes: propsValue.errorTypes
            }
        };
    },
    
    async onDisable(context) {
        console.log('Disabling validation failure trigger');
    },
    
    async run(context) {
        const { propsValue, payload } = context;
        
        if (!payload || payload.eventType !== FormEventType.VALIDATION_FAILED) {
            return [];
        }
        
        const formPayload = payload as FormEventPayload;
        
        // Filter by form ID
        if (formPayload.formId !== propsValue.formId) {
            return [];
        }
        
        // Count validation errors
        const errorCount = formPayload.validationResults?.reduce(
            (count, result) => count + result.errors.length, 0
        ) || 0;
        
        // Check error threshold
        if (errorCount < propsValue.errorThreshold) {
            return [];
        }
        
        // Filter by specific fields
        if (propsValue.specificFields && propsValue.specificFields.length > 0) {
            const hasRelevantErrors = formPayload.validationResults?.some(
                result => propsValue.specificFields.includes(result.fieldName) && result.errors.length > 0
            );
            
            if (!hasRelevantErrors) {
                return [];
            }
        }
        
        // Prepare trigger payload
        const triggerPayload = {
            ...formPayload,
            errorCount,
            validationResults: propsValue.includeErrorDetails ? formPayload.validationResults : undefined
        };
        
        return [triggerPayload];
    }
});

/**
 * Compliance violation trigger - triggers when compliance violations are detected
 */
export const complianceViolationTrigger = createTrigger({
    name: 'compliance_violation',
    displayName: 'Compliance Violation',
    description: 'Trigger when compliance violations are detected in form data',
    
    props: {
        formId: Property.ShortText({
            displayName: 'Form ID',
            description: 'ID of the form to monitor for compliance violations',
            required: true
        }),
        
        complianceFrameworks: Property.MultiSelectDropdown({
            displayName: 'Compliance Frameworks',
            description: 'Monitor violations for specific compliance frameworks',
            required: false,
            options: {
                options: [
                    { label: 'GDPR', value: 'gdpr' },
                    { label: 'HIPAA', value: 'hipaa' },
                    { label: 'PCI DSS', value: 'pci' },
                    { label: 'SOX', value: 'sox' },
                    { label: 'ISO 27001', value: 'iso27001' }
                ]
            }
        }),
        
        severityLevel: Property.StaticDropdown({
            displayName: 'Minimum Severity',
            description: 'Minimum severity level to trigger',
            required: false,
            defaultValue: 'medium',
            options: {
                options: [
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                    { label: 'Critical', value: 'critical' }
                ]
            }
        }),
        
        immediateEscalation: Property.Checkbox({
            displayName: 'Immediate Escalation',
            description: 'Trigger immediate escalation for compliance violations',
            required: false,
            defaultValue: false
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        const { propsValue } = context;
        console.log(`Enabling compliance violation trigger for form: ${propsValue.formId}`);
        
        return {
            webhookUrl: `${context.webhookUrl}/compliance-violation`,
            formId: propsValue.formId,
            filters: {
                complianceFrameworks: propsValue.complianceFrameworks,
                severityLevel: propsValue.severityLevel,
                immediateEscalation: propsValue.immediateEscalation
            }
        };
    },
    
    async onDisable(context) {
        console.log('Disabling compliance violation trigger');
    },
    
    async run(context) {
        const { propsValue, payload } = context;
        
        if (!payload || payload.eventType !== FormEventType.COMPLIANCE_VIOLATION) {
            return [];
        }
        
        const formPayload = payload as FormEventPayload;
        
        // Filter by form ID
        if (formPayload.formId !== propsValue.formId) {
            return [];
        }
        
        // Filter by compliance frameworks
        if (propsValue.complianceFrameworks && propsValue.complianceFrameworks.length > 0) {
            const hasRelevantViolation = formPayload.complianceResults?.some(
                result => propsValue.complianceFrameworks.includes(result.framework) && 
                         result.status === SOPComplianceStatus.NON_COMPLIANT
            );
            
            if (!hasRelevantViolation) {
                return [];
            }
        }
        
        // Prepare trigger payload with escalation flags
        const triggerPayload = {
            ...formPayload,
            escalationRequired: propsValue.immediateEscalation,
            severityLevel: propsValue.severityLevel,
            complianceFrameworks: propsValue.complianceFrameworks
        };
        
        return [triggerPayload];
    }
});

/**
 * Approval workflow trigger - triggers for approval workflow events
 */
export const approvalWorkflowTrigger = createTrigger({
    name: 'approval_workflow',
    displayName: 'Approval Workflow Event',
    description: 'Trigger for approval workflow events (requested, granted, denied)',
    
    props: {
        formId: Property.ShortText({
            displayName: 'Form ID',
            description: 'ID of the form to monitor for approval events',
            required: true
        }),
        
        eventTypes: Property.MultiSelectDropdown({
            displayName: 'Event Types',
            description: 'Which approval events to monitor',
            required: false,
            defaultValue: [FormEventType.APPROVAL_REQUESTED],
            options: {
                options: [
                    { label: 'Approval Requested', value: FormEventType.APPROVAL_REQUESTED },
                    { label: 'Approval Granted', value: FormEventType.APPROVAL_GRANTED },
                    { label: 'Approval Denied', value: FormEventType.APPROVAL_DENIED }
                ]
            }
        }),
        
        approverFilter: Property.Array({
            displayName: 'Approver Filter',
            description: 'Only trigger for specific approvers',
            required: false
        }),
        
        timeoutThreshold: Property.Number({
            displayName: 'Timeout Threshold (hours)',
            description: 'Trigger if approval is pending longer than this',
            required: false
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        const { propsValue } = context;
        console.log(`Enabling approval workflow trigger for form: ${propsValue.formId}`);
        
        return {
            webhookUrl: `${context.webhookUrl}/approval-workflow`,
            formId: propsValue.formId,
            eventTypes: propsValue.eventTypes,
            approverFilter: propsValue.approverFilter,
            timeoutThreshold: propsValue.timeoutThreshold
        };
    },
    
    async onDisable(context) {
        console.log('Disabling approval workflow trigger');
    },
    
    async run(context) {
        const { propsValue, payload } = context;
        
        if (!payload || !propsValue.eventTypes?.includes(payload.eventType)) {
            return [];
        }
        
        const formPayload = payload as FormEventPayload;
        
        // Filter by form ID
        if (formPayload.formId !== propsValue.formId) {
            return [];
        }
        
        // Filter by approver
        if (propsValue.approverFilter && propsValue.approverFilter.length > 0) {
            const approverInvolved = formPayload.approvalWorkflow?.approvers?.some(
                (approver: any) => propsValue.approverFilter.includes(approver.userId)
            );
            
            if (!approverInvolved) {
                return [];
            }
        }
        
        return [formPayload];
    }
});

/**
 * File upload trigger - triggers when files are uploaded to forms
 */
export const fileUploadTrigger = createTrigger({
    name: 'file_upload',
    displayName: 'File Upload',
    description: 'Trigger when files are uploaded to form fields',
    
    props: {
        formId: Property.ShortText({
            displayName: 'Form ID',
            description: 'ID of the form to monitor for file uploads',
            required: true
        }),
        
        fileTypes: Property.Array({
            displayName: 'File Types',
            description: 'Only trigger for specific file types (e.g., pdf, jpg, png)',
            required: false
        }),
        
        minFileSize: Property.Number({
            displayName: 'Minimum File Size (bytes)',
            description: 'Only trigger for files larger than this size',
            required: false
        }),
        
        maxFileSize: Property.Number({
            displayName: 'Maximum File Size (bytes)',
            description: 'Only trigger for files smaller than this size',
            required: false
        }),
        
        specificFields: Property.Array({
            displayName: 'Specific Fields',
            description: 'Only trigger for uploads to specific form fields',
            required: false
        }),
        
        virusScanRequired: Property.Checkbox({
            displayName: 'Virus Scan Required',
            description: 'Only trigger after virus scanning is complete',
            required: false,
            defaultValue: false
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        const { propsValue } = context;
        console.log(`Enabling file upload trigger for form: ${propsValue.formId}`);
        
        return {
            webhookUrl: `${context.webhookUrl}/file-upload`,
            formId: propsValue.formId,
            filters: {
                fileTypes: propsValue.fileTypes,
                minFileSize: propsValue.minFileSize,
                maxFileSize: propsValue.maxFileSize,
                specificFields: propsValue.specificFields,
                virusScanRequired: propsValue.virusScanRequired
            }
        };
    },
    
    async onDisable(context) {
        console.log('Disabling file upload trigger');
    },
    
    async run(context) {
        const { propsValue, payload } = context;
        
        if (!payload || payload.eventType !== FormEventType.FILE_UPLOADED) {
            return [];
        }
        
        const formPayload = payload as FormEventPayload;
        
        // Filter by form ID
        if (formPayload.formId !== propsValue.formId) {
            return [];
        }
        
        // Filter by file type
        if (propsValue.fileTypes && propsValue.fileTypes.length > 0) {
            const fileExtension = formPayload.fileInfo?.fileName.split('.').pop()?.toLowerCase();
            if (!fileExtension || !propsValue.fileTypes.includes(fileExtension)) {
                return [];
            }
        }
        
        // Filter by file size
        const fileSize = formPayload.fileInfo?.fileSize || 0;
        if (propsValue.minFileSize && fileSize < propsValue.minFileSize) {
            return [];
        }
        if (propsValue.maxFileSize && fileSize > propsValue.maxFileSize) {
            return [];
        }
        
        // Filter by field
        if (propsValue.specificFields && propsValue.specificFields.length > 0) {
            if (!formPayload.fileInfo?.fieldId || 
                !propsValue.specificFields.includes(formPayload.fileInfo.fieldId)) {
                return [];
            }
        }
        
        return [formPayload];
    }
});

/**
 * Form analytics trigger - triggers when form analytics are updated
 */
export const formAnalyticsTrigger = createTrigger({
    name: 'form_analytics',
    displayName: 'Form Analytics Update',
    description: 'Trigger when form analytics data is updated',
    
    props: {
        formId: Property.ShortText({
            displayName: 'Form ID',
            description: 'ID of the form to monitor for analytics updates',
            required: true
        }),
        
        updateFrequency: Property.StaticDropdown({
            displayName: 'Update Frequency',
            description: 'How often to trigger analytics updates',
            required: false,
            defaultValue: 'daily',
            options: {
                options: [
                    { label: 'Hourly', value: 'hourly' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' }
                ]
            }
        }),
        
        metricsThreshold: Property.Object({
            displayName: 'Metrics Threshold',
            description: 'Trigger when certain metrics exceed thresholds',
            required: false,
            defaultValue: {
                minSubmissions: 10,
                minCompletionRate: 80,
                maxAbandonmentRate: 20
            }
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        const { propsValue } = context;
        console.log(`Enabling form analytics trigger for form: ${propsValue.formId}`);
        
        return {
            webhookUrl: `${context.webhookUrl}/form-analytics`,
            formId: propsValue.formId,
            updateFrequency: propsValue.updateFrequency,
            metricsThreshold: propsValue.metricsThreshold
        };
    },
    
    async onDisable(context) {
        console.log('Disabling form analytics trigger');
    },
    
    async run(context) {
        const { propsValue, payload } = context;
        
        if (!payload || payload.eventType !== FormEventType.FORM_ANALYTICS_UPDATED) {
            return [];
        }
        
        const formPayload = payload as FormEventPayload;
        
        // Filter by form ID
        if (formPayload.formId !== propsValue.formId) {
            return [];
        }
        
        // Apply threshold filters if configured
        // This would check analytics data against thresholds
        
        return [formPayload];
    }
});