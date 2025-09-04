/**
 * Process Step Action
 * 
 * Core action for executing SOP process steps with comprehensive validation,
 * audit logging, compliance checking, and error handling.
 */

import { createAction, Property } from '@activepieces/pieces-framework';
import { BaseSoPiece, BaseSoPieceConfig } from '../../../../framework/base-sop-piece';
import { 
    SOPPieceType, 
    SOPPieceCategory, 
    SOPPriority, 
    SOPExecutionState,
    SOPComplianceStatus 
} from '../../../../types/sop-types';
import {
    sopPriorityProp,
    assignedToProp,
    dueDateProp,
    enableComplianceCheckProp,
    enableAuditTrailProp,
    customVariablesProp,
    tagsProp,
    notesProp,
    timeoutProp,
    retryAttemptsProp,
    notificationSettingsProp,
    escalationSettingsProp,
    errorHandlingProp,
    inputDataProp,
    stepDescriptionProp
} from '../../../../common/sop-props';

/**
 * Process Step Configuration
 */
interface ProcessStepConfig {
    title: string;
    instructions: string;
    inputSchema?: any;
    outputSchema?: any;
    validationRules?: string[];
    requiredPermissions?: string[];
    estimatedDuration?: number;
}

/**
 * Process Step Implementation extending BaseSoPiece
 */
class ProcessStepPiece extends BaseSoPiece {
    constructor(config: BaseSoPieceConfig) {
        super({
            ...config,
            sopPieceType: SOPPieceType.PROCESS_STEP,
            sopCategory: SOPPieceCategory.PROCESS_MANAGEMENT,
            complianceRequired: true,
            auditTrailRequired: true
        });
    }

    /**
     * Get Process Step specific properties
     */
    protected getSOPSpecificProperties() {
        return {
            // Core Process Step Configuration
            stepTitle: Property.ShortText({
                displayName: 'Step Title',
                description: 'Clear, descriptive title for this process step',
                required: true,
                placeholder: 'e.g., Validate Customer Information'
            }),
            
            instructions: Property.LongText({
                displayName: 'Step Instructions',
                description: 'Detailed instructions for completing this step',
                required: true,
                placeholder: 'Provide step-by-step instructions...'
            }),
            
            inputData: inputDataProp,
            
            // Process Step Specific Options
            requiresApproval: Property.Checkbox({
                displayName: 'Requires Approval',
                description: 'Whether this step requires approval before proceeding',
                required: false,
                defaultValue: false
            }),
            
            approvers: Property.Array({
                displayName: 'Approvers',
                description: 'List of users who can approve this step',
                required: false
            }),
            
            skipConditions: Property.Array({
                displayName: 'Skip Conditions',
                description: 'Conditions under which this step can be skipped',
                required: false
            }),
            
            successCriteria: Property.Array({
                displayName: 'Success Criteria',
                description: 'Criteria that define successful completion',
                required: false
            }),
            
            failureCriteria: Property.Array({
                displayName: 'Failure Criteria',
                description: 'Criteria that indicate step failure',
                required: false
            }),
            
            estimatedDuration: Property.Number({
                displayName: 'Estimated Duration (minutes)',
                description: 'Expected time to complete this step',
                required: false,
                defaultValue: 30
            }),
            
            requiresDocumentation: Property.Checkbox({
                displayName: 'Requires Documentation',
                description: 'Whether completion evidence must be documented',
                required: false,
                defaultValue: false
            }),
            
            documentationTemplate: Property.LongText({
                displayName: 'Documentation Template',
                description: 'Template for documenting step completion',
                required: false,
                placeholder: 'What evidence should be captured?'
            }),
            
            outputFormat: Property.StaticDropdown({
                displayName: 'Output Format',
                description: 'Expected format of step output',
                required: false,
                defaultValue: 'json',
                options: {
                    options: [
                        { label: 'JSON Data', value: 'json' },
                        { label: 'Text/String', value: 'text' },
                        { label: 'File/Document', value: 'file' },
                        { label: 'Boolean (Success/Fail)', value: 'boolean' },
                        { label: 'Custom Format', value: 'custom' }
                    ]
                }
            }),
            
            validationRules: Property.Array({
                displayName: 'Validation Rules',
                description: 'Custom validation rules for this step',
                required: false
            })
        };
    }

    /**
     * Main execution method
     */
    async execute(propsValue: any, executedBy: string): Promise<any> {
        const startTime = Date.now();
        
        try {
            // Create execution context
            const context = this.createExecutionContext(propsValue, executedBy);
            
            // Execute pre-run hooks
            await this.executePreRunHooks(context, propsValue);
            
            // Validate execution context and properties
            const validationResult = await this.validateExecution(context, propsValue);
            
            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
            }
            
            // Update state to IN_PROGRESS
            context.currentState = SOPExecutionState.IN_PROGRESS;
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'step_started',
                userId: executedBy,
                details: {
                    stepTitle: propsValue.stepTitle,
                    estimatedDuration: propsValue.estimatedDuration,
                    inputDataSize: JSON.stringify(propsValue.inputData || {}).length
                }
            });
            
            // Check if approval is required
            if (propsValue.requiresApproval) {
                return await this.handleApprovalWorkflow(context, propsValue);
            }
            
            // Process the step
            const result = await this.processStep(context, propsValue);
            
            // Validate output if success criteria defined
            if (propsValue.successCriteria && propsValue.successCriteria.length > 0) {
                const outputValid = await this.validateStepOutput(result, propsValue.successCriteria);
                if (!outputValid) {
                    throw new Error('Step output did not meet success criteria');
                }
            }
            
            // Execute post-run hooks
            await this.executePostRunHooks(context, result);
            
            // Return structured result
            return {
                success: true,
                executionId: context.executionId,
                sopId: context.sopMetadata.sopId,
                stepTitle: propsValue.stepTitle,
                executionTime: Date.now() - startTime,
                result: result,
                complianceStatus: context.complianceStatus,
                auditTrail: context.auditTrail,
                metadata: {
                    executedBy,
                    completedAt: new Date().toISOString(),
                    priority: propsValue.priority || SOPPriority.NORMAL,
                    tags: propsValue.tags || []
                }
            };
            
        } catch (error: any) {
            // Create context for error handling if not already created
            const context = this.createExecutionContext(propsValue, executedBy);
            await this.handleExecutionError(context, error);
            
            return {
                success: false,
                executionId: context.executionId,
                sopId: context.sopMetadata.sopId,
                stepTitle: propsValue.stepTitle,
                executionTime: Date.now() - startTime,
                error: error.message,
                complianceStatus: SOPComplianceStatus.NON_COMPLIANT,
                auditTrail: context.auditTrail,
                metadata: {
                    executedBy,
                    failedAt: new Date().toISOString(),
                    priority: propsValue.priority || SOPPriority.NORMAL
                }
            };
        }
    }

    /**
     * Process the actual step logic
     */
    private async processStep(context: any, propsValue: any): Promise<any> {
        // Core step processing logic
        const stepData = {
            stepId: context.executionId,
            title: propsValue.stepTitle,
            instructions: propsValue.instructions,
            inputData: propsValue.inputData || {},
            executedBy: context.executedBy,
            timestamp: new Date().toISOString()
        };
        
        // Add processing audit trail
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'step_processed',
            userId: context.executedBy,
            details: {
                processingCompleted: true,
                dataProcessed: Object.keys(stepData.inputData).length > 0
            }
        });
        
        // Simulate step processing based on output format
        switch (propsValue.outputFormat) {
            case 'json':
                return {
                    processedData: stepData.inputData,
                    processingMetadata: {
                        processedAt: new Date().toISOString(),
                        stepCompleted: true
                    }
                };
                
            case 'text':
                return `Step '${stepData.title}' completed successfully at ${stepData.timestamp}`;
                
            case 'boolean':
                return true;
                
            case 'file':
                return {
                    fileGenerated: true,
                    fileName: `step_${context.executionId}_output.json`,
                    content: JSON.stringify(stepData, null, 2)
                };
                
            default:
                return stepData;
        }
    }

    /**
     * Handle approval workflow
     */
    private async handleApprovalWorkflow(context: any, propsValue: any): Promise<any> {
        context.currentState = SOPExecutionState.WAITING_APPROVAL;
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'approval_requested',
            userId: context.executedBy,
            details: {
                approvers: propsValue.approvers || [],
                stepTitle: propsValue.stepTitle
            }
        });
        
        return {
            success: true,
            status: 'waiting_approval',
            executionId: context.executionId,
            stepTitle: propsValue.stepTitle,
            approvers: propsValue.approvers || [],
            message: 'Step is pending approval',
            auditTrail: context.auditTrail
        };
    }

    /**
     * Validate step output against success criteria
     */
    private async validateStepOutput(output: any, successCriteria: string[]): Promise<boolean> {
        // Basic validation logic - can be extended
        for (const criterion of successCriteria) {
            // Simple string-based validation
            if (criterion.includes('output_not_null') && !output) {
                return false;
            }
            if (criterion.includes('output_has_data') && (!output || Object.keys(output).length === 0)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get piece configuration for Activepieces
     */
    public getPieceConfiguration(): any {
        const baseProps = this.getCommonSOPProperties();
        const specificProps = this.getSOPSpecificProperties();
        
        return {
            displayName: 'Process Step',
            description: 'Execute a process step within an SOP workflow',
            props: {
                ...baseProps,
                ...specificProps,
                // Additional common props
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
                errorHandling: errorHandlingProp,
                stepDescription: stepDescriptionProp
            }
        };
    }
}

/**
 * Create the Process Step action
 */
export const processStepAction = createAction({
    name: 'sop_process_step',
    displayName: 'Execute Process Step',
    description: 'Execute a process step within an SOP workflow with full compliance and audit tracking',
    
    props: {
        // Core Step Configuration
        stepTitle: Property.ShortText({
            displayName: 'Step Title',
            description: 'Clear, descriptive title for this process step',
            required: true,
            placeholder: 'e.g., Validate Customer Information'
        }),
        
        instructions: Property.LongText({
            displayName: 'Step Instructions',
            description: 'Detailed instructions for completing this step',
            required: true,
            placeholder: 'Provide step-by-step instructions...'
        }),
        
        inputData: inputDataProp,
        
        // SOP Common Properties
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
        
        // Process Step Specific
        requiresApproval: Property.Checkbox({
            displayName: 'Requires Approval',
            description: 'Whether this step requires approval before proceeding',
            required: false,
            defaultValue: false
        }),
        
        approvers: Property.Array({
            displayName: 'Approvers',
            description: 'List of users who can approve this step',
            required: false
        }),
        
        successCriteria: Property.Array({
            displayName: 'Success Criteria',
            description: 'Criteria that define successful completion',
            required: false
        }),
        
        estimatedDuration: Property.Number({
            displayName: 'Estimated Duration (minutes)',
            description: 'Expected time to complete this step',
            required: false,
            defaultValue: 30
        }),
        
        outputFormat: Property.StaticDropdown({
            displayName: 'Output Format',
            description: 'Expected format of step output',
            required: false,
            defaultValue: 'json',
            options: {
                options: [
                    { label: 'JSON Data', value: 'json' },
                    { label: 'Text/String', value: 'text' },
                    { label: 'File/Document', value: 'file' },
                    { label: 'Boolean (Success/Fail)', value: 'boolean' },
                    { label: 'Custom Format', value: 'custom' }
                ]
            }
        }),
        
        requiresDocumentation: Property.Checkbox({
            displayName: 'Requires Documentation',
            description: 'Whether completion evidence must be documented',
            required: false,
            defaultValue: false
        }),
        
        notificationSettings: notificationSettingsProp,
        escalationSettings: escalationSettingsProp,
        errorHandling: errorHandlingProp,
        stepDescription: stepDescriptionProp
    },
    
    async run(context) {
        const { propsValue, run: { id: executionId } } = context;
        
        // Create Process Step piece instance
        const processStepPiece = new ProcessStepPiece({
            displayName: 'Process Step',
            description: propsValue.stepDescription || 'SOP Process Step execution',
            sopPieceType: SOPPieceType.PROCESS_STEP,
            sopCategory: SOPPieceCategory.PROCESS_MANAGEMENT,
            priority: propsValue.priority,
            complianceRequired: propsValue.enableComplianceCheck,
            auditTrailRequired: propsValue.enableAuditTrail,
            tags: propsValue.tags || []
        });
        
        // Execute the step
        const result = await processStepPiece.execute(propsValue, 'system_user'); // In real implementation, get actual user ID
        
        return result;
    }
});