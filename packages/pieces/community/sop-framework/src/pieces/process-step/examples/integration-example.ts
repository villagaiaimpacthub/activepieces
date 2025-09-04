/**
 * Process Step Integration Example
 * 
 * Complete example demonstrating how to use the SOP Process Step piece
 * in real-world scenarios with various configuration options.
 */

import { sopProcessStep } from '../index';
import { processStepAction } from '../lib/actions/process-step-action';
import { processStepTrigger } from '../lib/triggers/process-step-trigger';
import {
    SOPPriority,
    SOPExecutionState,
    SOPComplianceStatus
} from '../../../types/sop-types';

/**
 * Example 1: Basic Customer Validation Process Step
 */
export const customerValidationExample = {
    name: 'Customer Validation Step',
    description: 'Validate customer information and documentation',
    
    // Configuration for the Process Step action
    actionConfig: {
        stepTitle: 'Validate Customer Information',
        instructions: `
            1. Review customer personal information for accuracy
            2. Verify provided identification documents
            3. Check customer against compliance databases
            4. Validate contact information (phone, email, address)
            5. Document any discrepancies or issues found
            6. Mark customer as verified or flag for additional review
        `,
        inputData: {
            customerId: '{{trigger.customerId}}',
            customerName: '{{trigger.customerName}}',
            email: '{{trigger.email}}',
            phone: '{{trigger.phone}}',
            documents: [
                {
                    type: 'government_id',
                    documentId: '{{trigger.govIdNumber}}',
                    verified: false
                },
                {
                    type: 'proof_of_address',
                    documentId: '{{trigger.addressProof}}',
                    verified: false
                }
            ],
            customerRiskProfile: '{{trigger.riskProfile}}'
        },
        priority: SOPPriority.HIGH,
        assignedTo: '{{trigger.assignedAgent}}',
        estimatedDuration: 30,
        enableComplianceCheck: true,
        enableAuditTrail: true,
        successCriteria: [
            'output_not_null',
            'output_has_field:validationResult',
            'output_has_field:documentsVerified'
        ],
        validationRules: [
            'required_field:customerId',
            'required_field:customerName',
            'data_not_empty'
        ],
        outputFormat: 'json',
        tags: ['customer-onboarding', 'compliance', 'validation'],
        notificationSettings: {
            enabled: true,
            onStart: false,
            onComplete: true,
            onError: true,
            recipients: ['{{trigger.assignedAgent}}', 'supervisor@company.com']
        },
        escalationSettings: {
            enabled: true,
            timeoutMinutes: 60,
            escalateTo: ['supervisor@company.com'],
            escalationLevels: 2
        },
        errorHandling: {
            continueOnError: false,
            logErrors: true,
            notifyOnError: true,
            errorActions: ['escalate', 'notify_supervisor']
        }
    },
    
    // Expected output structure
    expectedOutput: {
        success: true,
        executionId: 'exec_customer_val_123',
        sopId: 'sop_customer_onboarding',
        stepTitle: 'Validate Customer Information',
        result: {
            customerId: 'customer_123',
            validationResult: 'passed',
            documentsVerified: true,
            complianceChecks: {
                identityVerified: true,
                addressVerified: true,
                riskAssessment: 'low',
                complianceStatus: 'compliant'
            },
            issues: [],
            nextSteps: ['proceed_to_account_setup']
        },
        complianceStatus: SOPComplianceStatus.COMPLIANT,
        metadata: {
            executedBy: 'agent@company.com',
            completedAt: '2024-01-15T10:30:00.000Z',
            priority: SOPPriority.HIGH,
            tags: ['customer-onboarding', 'compliance']
        }
    }
};

/**
 * Example 2: Approval-Required Payment Processing Step
 */
export const paymentProcessingExample = {
    name: 'Large Payment Processing',
    description: 'Process high-value payments requiring manager approval',
    
    actionConfig: {
        stepTitle: 'Process Large Payment',
        instructions: `
            1. Verify payment details and amounts
            2. Check account balance and limits
            3. Validate beneficiary information
            4. Review for fraud indicators
            5. If amount exceeds $10,000, require manager approval
            6. Process payment through secure gateway
            7. Generate transaction receipt and audit records
        `,
        inputData: {
            paymentId: '{{trigger.paymentId}}',
            fromAccount: '{{trigger.fromAccount}}',
            toAccount: '{{trigger.toAccount}}',
            amount: '{{trigger.amount}}',
            currency: '{{trigger.currency}}',
            purpose: '{{trigger.purpose}}',
            requestedBy: '{{trigger.requestedBy}}'
        },
        priority: SOPPriority.URGENT,
        estimatedDuration: 45,
        requiresApproval: true,
        approvers: ['finance.manager@company.com', 'operations.director@company.com'],
        successCriteria: [
            'approval_granted',
            'payment_processed',
            'output_has_field:transactionId'
        ],
        validationRules: [
            'required_field:paymentId',
            'required_field:amount',
            'min_value:amount:0'
        ],
        enableComplianceCheck: true,
        complianceRequirements: [
            'anti_money_laundering_check',
            'sanctions_screening',
            'transaction_monitoring'
        ],
        outputFormat: 'json',
        tags: ['payment-processing', 'high-value', 'approval-required'],
        timeout: 120, // 2 hours for approval
        retryAttempts: 2,
        customVariables: {
            paymentChannel: 'wire_transfer',
            riskLevel: 'high',
            regulatoryReporting: true
        }
    },
    
    expectedOutput: {
        success: true,
        status: 'waiting_approval',
        executionId: 'exec_payment_456',
        stepTitle: 'Process Large Payment',
        approvers: ['finance.manager@company.com'],
        message: 'Payment is pending manager approval',
        auditTrail: [
            {
                timestamp: '2024-01-15T14:00:00.000Z',
                action: 'step_started',
                userId: 'cashier@company.com'
            },
            {
                timestamp: '2024-01-15T14:05:00.000Z',
                action: 'approval_requested',
                userId: 'cashier@company.com',
                details: {
                    amount: 25000,
                    approvers: ['finance.manager@company.com']
                }
            }
        ]
    }
};

/**
 * Example 3: Document Generation with Validation Step
 */
export const documentGenerationExample = {
    name: 'Contract Document Generation',
    description: 'Generate legal contract document with validation',
    
    actionConfig: {
        stepTitle: 'Generate Customer Contract',
        instructions: `
            1. Collect all required customer and product information
            2. Select appropriate contract template based on product type
            3. Populate template with customer-specific data
            4. Validate all mandatory fields are completed
            5. Run legal compliance checks on contract terms
            6. Generate final PDF document
            7. Store document in secure document management system
            8. Send notification to customer and sales team
        `,
        inputData: {
            customerId: '{{steps.customer_validation.result.customerId}}',
            productType: '{{trigger.productType}}',
            contractTerms: {
                duration: '{{trigger.contractDuration}}',
                value: '{{trigger.contractValue}}',
                paymentTerms: '{{trigger.paymentTerms}}',
                specialConditions: '{{trigger.specialConditions}}'
            },
            customerDetails: '{{steps.customer_validation.result}}',
            salesRepresentative: '{{trigger.salesRep}}'
        },
        priority: SOPPriority.NORMAL,
        estimatedDuration: 20,
        outputFormat: 'file',
        successCriteria: [
            'document_generated',
            'compliance_validated',
            'output_has_field:documentId'
        ],
        validationRules: [
            'required_field:customerId',
            'required_field:productType',
            'required_field:contractTerms'
        ],
        requiresDocumentation: true,
        documentationTemplate: `
            Document Generation Record:
            - Template Used: [CONTRACT_TEMPLATE_ID]
            - Customer ID: [CUSTOMER_ID]
            - Generated At: [TIMESTAMP]
            - Generated By: [USER_ID]
            - Compliance Checks: [PASS/FAIL]
            - Document Storage Location: [DOCUMENT_URL]
            - Quality Review Status: [PENDING/APPROVED]
        `,
        tags: ['document-generation', 'contracts', 'legal'],
        customVariables: {
            documentType: 'customer_contract',
            templateVersion: '2.1',
            complianceReviewRequired: true
        }
    },
    
    expectedOutput: {
        success: true,
        executionId: 'exec_doc_gen_789',
        result: {
            fileGenerated: true,
            fileName: 'customer_contract_123_20240115.pdf',
            documentId: 'doc_contract_abc123',
            documentUrl: 'https://docs.company.com/contracts/doc_contract_abc123.pdf',
            complianceValidation: {
                status: 'passed',
                checksPerformed: [
                    'mandatory_fields_check',
                    'legal_terms_validation',
                    'regulatory_compliance_check'
                ]
            },
            metadata: {
                templateUsed: 'standard_service_contract_v2.1',
                generatedAt: '2024-01-15T15:30:00.000Z',
                fileSize: '245KB',
                documentHash: 'sha256:abc123...'
            }
        }
    }
};

/**
 * Example 4: Process Step Event Trigger Configuration
 */
export const eventTriggerExample = {
    name: 'Customer Onboarding Process Monitoring',
    description: 'Monitor customer onboarding process steps for completion and errors',
    
    triggerConfig: {
        eventType: [
            'step_completed',
            'step_failed',
            'approval_required',
            'compliance_failed'
        ],
        stepTitleFilter: 'Customer',
        priorityFilter: [SOPPriority.HIGH, SOPPriority.URGENT],
        tagFilter: ['customer-onboarding', 'compliance'],
        includeAuditTrail: true,
        includeCustomVariables: true
    },
    
    // Example trigger payload
    exampleTriggerPayload: {
        eventType: 'step_completed',
        timestamp: '2024-01-15T16:00:00.000Z',
        executionId: 'exec_customer_val_123',
        sopId: 'sop_customer_onboarding',
        stepDetails: {
            title: 'Validate Customer Information',
            assignedTo: 'agent@company.com',
            priority: SOPPriority.HIGH,
            state: SOPExecutionState.COMPLETED,
            complianceStatus: SOPComplianceStatus.COMPLIANT,
            tags: ['customer-onboarding', 'compliance'],
            estimatedDuration: 30,
            actualDuration: 28
        },
        customVariables: {
            customerType: 'business',
            onboardingChannel: 'web_application',
            riskProfile: 'standard'
        },
        auditTrail: [
            {
                timestamp: '2024-01-15T15:30:00.000Z',
                action: 'step_started',
                userId: 'agent@company.com'
            },
            {
                timestamp: '2024-01-15T16:00:00.000Z',
                action: 'step_completed',
                userId: 'agent@company.com',
                details: {
                    result: 'success',
                    validationsPassed: 5
                }
            }
        ]
    }
};

/**
 * Example 5: Workflow Integration - Multi-Step SOP Process
 */
export const multiStepWorkflowExample = {
    name: 'Complete Customer Onboarding SOP',
    description: 'End-to-end customer onboarding process with multiple steps',
    
    workflow: [
        {
            stepName: 'customer_validation',
            piece: sopProcessStep,
            config: customerValidationExample.actionConfig
        },
        {
            stepName: 'risk_assessment',
            piece: sopProcessStep,
            config: {
                stepTitle: 'Assess Customer Risk Profile',
                instructions: 'Evaluate customer risk based on validation results',
                inputData: '{{steps.customer_validation.result}}',
                priority: SOPPriority.HIGH,
                estimatedDuration: 15,
                successCriteria: ['risk_profile_assigned'],
                tags: ['risk-assessment', 'customer-onboarding']
            }
        },
        {
            stepName: 'account_setup',
            piece: sopProcessStep,
            config: {
                stepTitle: 'Setup Customer Account',
                instructions: 'Create customer account and configure services',
                inputData: {
                    customerData: '{{steps.customer_validation.result}}',
                    riskProfile: '{{steps.risk_assessment.result.riskProfile}}'
                },
                priority: SOPPriority.NORMAL,
                estimatedDuration: 25,
                requiresApproval: false,
                tags: ['account-setup', 'customer-onboarding']
            }
        },
        {
            stepName: 'contract_generation',
            piece: sopProcessStep,
            config: documentGenerationExample.actionConfig
        },
        {
            stepName: 'welcome_notification',
            piece: sopProcessStep,
            config: {
                stepTitle: 'Send Welcome Notification',
                instructions: 'Send welcome email and account details to customer',
                inputData: {
                    customerEmail: '{{steps.customer_validation.result.email}}',
                    accountDetails: '{{steps.account_setup.result}}',
                    contractDocument: '{{steps.contract_generation.result.documentUrl}}'
                },
                priority: SOPPriority.LOW,
                estimatedDuration: 5,
                outputFormat: 'boolean',
                tags: ['notification', 'customer-onboarding']
            }
        }
    ],
    
    // Monitoring configuration for the entire workflow
    monitoring: {
        triggers: [
            {
                name: 'onboarding_completion_monitor',
                config: {
                    eventType: ['step_completed', 'step_failed'],
                    tagFilter: ['customer-onboarding'],
                    includeAuditTrail: true
                }
            },
            {
                name: 'compliance_failure_alert',
                config: {
                    eventType: ['compliance_failed'],
                    priorityFilter: [SOPPriority.HIGH, SOPPriority.URGENT],
                    includeAuditTrail: true
                }
            }
        ]
    }
};

/**
 * Usage Instructions and Integration Notes
 */
export const integrationNotes = {
    overview: `
        The SOP Process Step piece is designed to be used as building blocks
        for complex Standard Operating Procedure workflows. Each step provides:
        
        1. Comprehensive input/output data handling
        2. Built-in validation and compliance checking
        3. Complete audit trail and state management
        4. Error handling with retry and escalation
        5. Optional approval workflows
        6. Event-driven triggers for monitoring
    `,
    
    bestPractices: [
        'Always define clear step titles and detailed instructions',
        'Use appropriate priority levels for proper workflow management',
        'Enable audit trail for compliance and troubleshooting',
        'Define success criteria for automated validation',
        'Configure appropriate timeout and retry settings',
        'Use tags consistently for monitoring and reporting',
        'Set up escalation rules for critical process steps',
        'Configure notifications for stakeholder awareness',
        'Test validation rules thoroughly before production use',
        'Monitor process performance and optimize as needed'
    ],
    
    commonPatterns: {
        sequentialProcessing: 'Chain steps using output from previous steps as input',
        parallelProcessing: 'Use multiple steps with allowParallel flag for concurrent execution',
        conditionalExecution: 'Use skipConditions to implement conditional logic',
        approvalWorkflows: 'Configure requiresApproval for steps needing human review',
        errorHandling: 'Set up retry logic and escalation for robust error handling',
        complianceTracking: 'Enable compliance checking for regulated processes',
        performanceMonitoring: 'Use triggers to monitor step execution and performance'
    },
    
    troubleshooting: {
        validationErrors: 'Check input data format and required fields',
        timeoutIssues: 'Increase timeout values or optimize step processing',
        approvalDelays: 'Configure appropriate escalation timeouts',
        complianceFailures: 'Review compliance rules and data requirements',
        performanceIssues: 'Monitor execution metrics and optimize step logic'
    }
};

// Export all examples
export const processStepExamples = {
    customerValidation: customerValidationExample,
    paymentProcessing: paymentProcessingExample,
    documentGeneration: documentGenerationExample,
    eventTrigger: eventTriggerExample,
    multiStepWorkflow: multiStepWorkflowExample,
    integrationNotes
};