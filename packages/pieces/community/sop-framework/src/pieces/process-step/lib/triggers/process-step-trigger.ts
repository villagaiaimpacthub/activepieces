/**
 * Process Step Trigger
 * 
 * Triggers workflow execution when SOP process steps reach specific states
 * or events occur within the step lifecycle.
 */

import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import { 
    SOPExecutionState,
    SOPComplianceStatus,
    SOPPriority 
} from '../../../../types/sop-types';

export const processStepTrigger = createTrigger({
    name: 'process_step_trigger',
    displayName: 'Process Step Event',
    description: 'Triggers when SOP process step events occur (started, completed, failed, etc.)',
    
    props: {
        eventType: Property.StaticMultiSelectDropdown({
            displayName: 'Trigger Events',
            description: 'Select which step events should trigger this workflow',
            required: true,
            options: {
                options: [
                    { label: 'Step Started', value: 'step_started' },
                    { label: 'Step Completed', value: 'step_completed' },
                    { label: 'Step Failed', value: 'step_failed' },
                    { label: 'Step Paused', value: 'step_paused' },
                    { label: 'Approval Required', value: 'approval_required' },
                    { label: 'Approval Granted', value: 'approval_granted' },
                    { label: 'Approval Rejected', value: 'approval_rejected' },
                    { label: 'Escalation Triggered', value: 'escalation_triggered' },
                    { label: 'Compliance Check Failed', value: 'compliance_failed' },
                    { label: 'Timeout Occurred', value: 'timeout_occurred' },
                    { label: 'Retry Attempted', value: 'retry_attempted' }
                ]
            }
        }),
        
        stepTitleFilter: Property.ShortText({
            displayName: 'Step Title Filter',
            description: 'Only trigger for steps with titles containing this text (optional)',
            required: false,
            placeholder: 'Leave empty to trigger for all steps'
        }),
        
        priorityFilter: Property.StaticMultiSelectDropdown({
            displayName: 'Priority Filter',
            description: 'Only trigger for steps with these priority levels',
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
        }),
        
        assigneeFilter: Property.ShortText({
            displayName: 'Assignee Filter',
            description: 'Only trigger for steps assigned to this user (optional)',
            required: false,
            placeholder: 'user@company.com or user ID'
        }),
        
        tagFilter: Property.Array({
            displayName: 'Tag Filter',
            description: 'Only trigger for steps with these tags (optional)',
            required: false
        }),
        
        complianceStatusFilter: Property.StaticMultiSelectDropdown({
            displayName: 'Compliance Status Filter',
            description: 'Only trigger for steps with these compliance statuses',
            required: false,
            options: {
                options: [
                    { label: 'Compliant', value: SOPComplianceStatus.COMPLIANT },
                    { label: 'Non-Compliant', value: SOPComplianceStatus.NON_COMPLIANT },
                    { label: 'Pending Review', value: SOPComplianceStatus.PENDING_REVIEW },
                    { label: 'Requires Attention', value: SOPComplianceStatus.REQUIRES_ATTENTION },
                    { label: 'Exempt', value: SOPComplianceStatus.EXEMPT }
                ]
            }
        }),
        
        includeAuditTrail: Property.Checkbox({
            displayName: 'Include Audit Trail',
            description: 'Include complete audit trail in trigger payload',
            required: false,
            defaultValue: true
        }),
        
        includeCustomVariables: Property.Checkbox({
            displayName: 'Include Custom Variables',
            description: 'Include custom variables in trigger payload',
            required: false,
            defaultValue: false
        })
    },
    
    sampleData: {
        eventType: 'step_completed',
        timestamp: new Date().toISOString(),
        executionId: 'exec_123456789',
        sopId: 'sop_987654321',
        stepDetails: {
            title: 'Validate Customer Information',
            description: 'Verify customer details and documentation',
            assignedTo: 'user@company.com',
            priority: SOPPriority.HIGH,
            state: SOPExecutionState.COMPLETED,
            complianceStatus: SOPComplianceStatus.COMPLIANT,
            tags: ['validation', 'customer-onboarding'],
            estimatedDuration: 30,
            actualDuration: 25,
            inputData: {
                customerId: '12345',
                customerName: 'John Doe'
            },
            outputData: {
                validationResult: 'passed',
                documentsVerified: true
            }
        },
        executionContext: {
            executedBy: 'user@company.com',
            startedAt: '2024-01-15T10:00:00.000Z',
            completedAt: '2024-01-15T10:25:00.000Z',
            escalationLevel: 0,
            retryCount: 0
        },
        auditTrail: [
            {
                timestamp: '2024-01-15T10:00:00.000Z',
                action: 'step_started',
                userId: 'user@company.com',
                details: {
                    stepTitle: 'Validate Customer Information',
                    estimatedDuration: 30
                }
            },
            {
                timestamp: '2024-01-15T10:25:00.000Z',
                action: 'step_completed',
                userId: 'user@company.com',
                details: {
                    actualDuration: 25,
                    result: 'success'
                }
            }
        ],
        customVariables: {
            department: 'Customer Service',
            workflow: 'Customer Onboarding'
        }
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async onEnable(context) {
        // In a real implementation, this would register webhook with SOP system
        // For now, we'll return the webhook URL that would be used
        return {
            webhookUrl: `${context.webhookUrl}/sop-process-step-events`,
            message: 'Process Step trigger enabled. Configure your SOP system to send events to this webhook.'
        };
    },
    
    async onDisable(context) {
        // In a real implementation, this would unregister the webhook
        return {
            message: 'Process Step trigger disabled'
        };
    },
    
    async run(context) {
        const { body } = context.payload;
        const { propsValue } = context;
        
        // Validate that this is a Process Step event
        if (!body || !body.eventType || !body.executionId) {
            return [];
        }
        
        // Apply event type filter
        if (!propsValue.eventType.includes(body.eventType)) {
            return [];
        }
        
        // Apply step title filter
        if (propsValue.stepTitleFilter && body.stepDetails?.title) {
            const titleMatch = body.stepDetails.title
                .toLowerCase()
                .includes(propsValue.stepTitleFilter.toLowerCase());
            if (!titleMatch) {
                return [];
            }
        }
        
        // Apply priority filter
        if (propsValue.priorityFilter && propsValue.priorityFilter.length > 0) {
            if (!propsValue.priorityFilter.includes(body.stepDetails?.priority)) {
                return [];
            }
        }
        
        // Apply assignee filter
        if (propsValue.assigneeFilter && body.stepDetails?.assignedTo) {
            if (!body.stepDetails.assignedTo.toLowerCase()
                .includes(propsValue.assigneeFilter.toLowerCase())) {
                return [];
            }
        }
        
        // Apply tag filter
        if (propsValue.tagFilter && propsValue.tagFilter.length > 0) {
            const stepTags = body.stepDetails?.tags || [];
            const hasMatchingTag = propsValue.tagFilter.some(tag => 
                stepTags.includes(tag)
            );
            if (!hasMatchingTag) {
                return [];
            }
        }
        
        // Apply compliance status filter
        if (propsValue.complianceStatusFilter && propsValue.complianceStatusFilter.length > 0) {
            if (!propsValue.complianceStatusFilter.includes(body.stepDetails?.complianceStatus)) {
                return [];
            }
        }
        
        // Build trigger payload based on configuration
        const triggerPayload: any = {
            eventType: body.eventType,
            timestamp: body.timestamp || new Date().toISOString(),
            executionId: body.executionId,
            sopId: body.sopId,
            stepDetails: body.stepDetails,
            executionContext: body.executionContext
        };
        
        // Include audit trail if requested
        if (propsValue.includeAuditTrail && body.auditTrail) {
            triggerPayload.auditTrail = body.auditTrail;
        }
        
        // Include custom variables if requested
        if (propsValue.includeCustomVariables && body.customVariables) {
            triggerPayload.customVariables = body.customVariables;
        }
        
        // Add trigger metadata
        triggerPayload.triggerMetadata = {
            triggeredAt: new Date().toISOString(),
            filterApplied: {
                eventType: propsValue.eventType,
                stepTitleFilter: propsValue.stepTitleFilter || null,
                priorityFilter: propsValue.priorityFilter || null,
                assigneeFilter: propsValue.assigneeFilter || null,
                tagFilter: propsValue.tagFilter || null,
                complianceStatusFilter: propsValue.complianceStatusFilter || null
            }
        };
        
        return [triggerPayload];
    }
});