/**
 * Data Form Action
 * 
 * Core action for handling dynamic form creation, data collection, validation,
 * and compliance checking within SOP workflows. This action supports multiple
 * processing modes and comprehensive form management capabilities.
 */

import { createAction, Property, Validators } from '@activepieces/pieces-framework';
import { BaseSoPiece, BaseSoPieceConfig } from '../../../../framework/base-sop-piece';
import { 
    SOPPieceType, 
    SOPPieceCategory, 
    SOPPriority, 
    SOPExecutionState,
    SOPComplianceStatus,
    SOPExecutionContext
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
    stepDescriptionProp
} from '../../../../common/sop-props';
import {
    DataFormConfig,
    DataFormField,
    DataFormResult,
    FormProcessingMode,
    FormSubmissionData,
    DataFormError,
    DataFormErrorType
} from '../common/data-form-types';
import { DataFormValidator } from '../validation/data-form-validator';
import { DataFormHelpers } from '../utils/data-form-helpers';
import { nanoid } from 'nanoid';

/**
 * Data Form Piece Configuration Interface
 */
interface DataFormPieceConfig extends BaseSoPieceConfig {
    allowFileUploads?: boolean;
    maxFormComplexity?: number;
    enableAnalytics?: boolean;
    enableAutoSave?: boolean;
    encryptionRequired?: boolean;
}

/**
 * Data Form Properties Interface
 */
interface DataFormProps {
    sopMetadata: any;
    priority: SOPPriority;
    assignedTo?: string;
    dueDate?: string;
    enableComplianceCheck: boolean;
    enableAuditTrail: boolean;
    customVariables: Record<string, any>;
    tags: string[];
    notes?: string;
    
    // Data Form specific properties
    processingMode: FormProcessingMode;
    formConfiguration: DataFormConfig;
    submissionData?: Record<string, any>;
    validationMode: 'strict' | 'lenient' | 'compliance-only';
    generateFormSchema?: boolean;
    includeAnalytics?: boolean;
    autoSave?: boolean;
    encryptSensitiveData?: boolean;
    complianceFrameworks?: string[];
    approvalWorkflow?: {
        required: boolean;
        approvers: string[];
        timeoutHours: number;
    };
    fileUploadConfig?: {
        maxFileSize: number;
        allowedTypes: string[];
        maxFiles: number;
        generateThumbnails: boolean;
    };
    integrationEndpoints?: Array<{
        name: string;
        url: string;
        method: string;
        headers?: Record<string, string>;
    }>;
}

/**
 * Data Form Piece Implementation
 */
class DataFormPiece extends BaseSoPiece {
    private validator: DataFormValidator;
    private formHelpers: typeof DataFormHelpers;
    
    constructor(config: DataFormPieceConfig) {
        super({
            ...config,
            sopPieceType: SOPPieceType.DATA_VALIDATION,
            sopCategory: SOPPieceCategory.PROCESS_MANAGEMENT,
            complianceRequired: true,
            auditTrailRequired: true
        });
        
        this.validator = new DataFormValidator();
        this.formHelpers = DataFormHelpers;
    }

    /**
     * Get Data Form specific properties
     */
    protected getSOPSpecificProperties() {
        return {
            // Core Processing Configuration
            processingMode: Property.StaticDropdown({
                displayName: 'Processing Mode',
                description: 'How the form should be processed',
                required: true,
                defaultValue: FormProcessingMode.COLLECT,
                options: {
                    options: [
                        { label: 'Collect Data', value: FormProcessingMode.COLLECT },
                        { label: 'Validate Data', value: FormProcessingMode.VALIDATE },
                        { label: 'Display Form', value: FormProcessingMode.DISPLAY },
                        { label: 'Generate Form', value: FormProcessingMode.GENERATE },
                        { label: 'Migrate Data', value: FormProcessingMode.MIGRATE }
                    ]
                }
            }),
            
            formConfiguration: Property.Json({
                displayName: 'Form Configuration',
                description: 'Complete form definition including fields, validation rules, and layout',
                required: true,
                validators: [Validators.object]
            }),
            
            submissionData: Property.Object({
                displayName: 'Submission Data',
                description: 'Data to be validated or processed (for validation/processing modes)',
                required: false,
                defaultValue: {}
            }),
            
            validationMode: Property.StaticDropdown({
                displayName: 'Validation Mode',
                description: 'Level of validation strictness',
                required: false,
                defaultValue: 'strict',
                options: {
                    options: [
                        { label: 'Strict - All rules enforced', value: 'strict' },
                        { label: 'Lenient - Warnings only', value: 'lenient' },
                        { label: 'Compliance Only', value: 'compliance-only' }
                    ]
                }
            }),
            
            // Form Generation Options
            generateFormSchema: Property.Checkbox({
                displayName: 'Generate JSON Schema',
                description: 'Generate JSON Schema for the form (useful for integrations)',
                required: false,
                defaultValue: false
            }),
            
            includeAnalytics: Property.Checkbox({
                displayName: 'Include Analytics',
                description: 'Generate form analytics and usage statistics',
                required: false,
                defaultValue: false
            }),
            
            autoSave: Property.Checkbox({
                displayName: 'Enable Auto-Save',
                description: 'Automatically save form data as draft during collection',
                required: false,
                defaultValue: true
            }),
            
            encryptSensitiveData: Property.Checkbox({
                displayName: 'Encrypt Sensitive Data',
                description: 'Encrypt fields marked as sensitive',
                required: false,
                defaultValue: false
            }),
            
            // Compliance Configuration
            complianceFrameworks: Property.Array({
                displayName: 'Compliance Frameworks',
                description: 'Compliance frameworks to validate against (e.g., GDPR, HIPAA, PCI)',
                required: false
            }),
            
            // Approval Workflow
            approvalWorkflow: Property.Object({
                displayName: 'Approval Workflow',
                description: 'Configure approval requirements for form submissions',
                required: false,
                defaultValue: {
                    required: false,
                    approvers: [],
                    timeoutHours: 48
                }
            }),
            
            // File Upload Configuration
            fileUploadConfig: Property.Object({
                displayName: 'File Upload Configuration',
                description: 'Configuration for file upload fields',
                required: false,
                defaultValue: {
                    maxFileSize: 10 * 1024 * 1024, // 10MB
                    allowedTypes: ['image/*', 'application/pdf', 'text/*'],
                    maxFiles: 5,
                    generateThumbnails: false
                }
            }),
            
            // Integration Configuration
            integrationEndpoints: Property.Array({
                displayName: 'Integration Endpoints',
                description: 'External systems to send form data to',
                required: false
            }),
            
            // Data Processing Options
            dataTransformations: Property.Array({
                displayName: 'Data Transformations',
                description: 'Data transformation rules to apply to submitted data',
                required: false
            }),
            
            // Security Options
            securitySettings: Property.Object({
                displayName: 'Security Settings',
                description: 'Additional security configuration',
                required: false,
                defaultValue: {
                    requireHttps: true,
                    enableCsrfProtection: true,
                    maxSubmissionsPerUser: 10,
                    maxSubmissionsPerHour: 100
                }
            }),
            
            // Notification Configuration
            notificationConfig: Property.Object({
                displayName: 'Notification Configuration',
                description: 'Configure notifications for form events',
                required: false,
                defaultValue: {
                    onSubmission: {
                        enabled: true,
                        recipients: [],
                        template: 'default'
                    },
                    onApproval: {
                        enabled: true,
                        recipients: [],
                        template: 'default'
                    },
                    onValidationError: {
                        enabled: false,
                        recipients: [],
                        template: 'default'
                    }
                }
            }),
            
            // Theme and Customization
            themeConfig: Property.Object({
                displayName: 'Theme Configuration',
                description: 'Visual theme and styling options',
                required: false,
                defaultValue: {
                    primaryColor: '#0066cc',
                    secondaryColor: '#f0f0f0',
                    fontFamily: 'system-ui',
                    borderRadius: '4px',
                    customCSS: ''
                }
            })
        };
    }

    /**
     * Main execution method
     */
    async execute(propsValue: DataFormProps, executedBy: string): Promise<DataFormResult> {
        const startTime = Date.now();
        
        try {
            // Create execution context
            const context = this.createExecutionContext(propsValue, executedBy);
            
            // Execute pre-run hooks
            await this.executePreRunHooks(context, propsValue);
            
            // Validate form configuration
            await this.validateFormConfiguration(propsValue.formConfiguration);
            
            // Update state to IN_PROGRESS
            context.currentState = SOPExecutionState.IN_PROGRESS;
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'form_processing_started',
                userId: executedBy,
                details: {
                    formId: propsValue.formConfiguration.id,
                    processingMode: propsValue.processingMode,
                    validationMode: propsValue.validationMode,
                    fieldsCount: propsValue.formConfiguration.fields.length
                }
            });
            
            // Process based on mode
            let result: DataFormResult;
            
            switch (propsValue.processingMode) {
                case FormProcessingMode.COLLECT:
                    result = await this.handleDataCollection(context, propsValue);
                    break;
                    
                case FormProcessingMode.VALIDATE:
                    result = await this.handleDataValidation(context, propsValue);
                    break;
                    
                case FormProcessingMode.DISPLAY:
                    result = await this.handleFormDisplay(context, propsValue);
                    break;
                    
                case FormProcessingMode.GENERATE:
                    result = await this.handleFormGeneration(context, propsValue);
                    break;
                    
                case FormProcessingMode.MIGRATE:
                    result = await this.handleDataMigration(context, propsValue);
                    break;
                    
                default:
                    throw new Error(`Unknown processing mode: ${propsValue.processingMode}`);
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Execute post-run hooks
            await this.executePostRunHooks(context, result);
            
            return result;
            
        } catch (error: any) {
            // Create error context if not already created
            const context = this.createExecutionContext(propsValue, executedBy);
            await this.handleExecutionError(context, error);
            
            return {
                success: false,
                executionId: context.executionId,
                sopId: context.sopMetadata.sopId,
                formId: propsValue.formConfiguration.id,
                executionTime: Date.now() - startTime,
                formGenerated: false,
                dataCollected: false,
                validationPassed: false,
                validationResults: [],
                complianceStatus: SOPComplianceStatus.NON_COMPLIANT,
                auditTrail: context.auditTrail,
                error: error.message,
                metadata: {
                    executedBy,
                    failedAt: new Date().toISOString(),
                    priority: propsValue.priority || SOPPriority.NORMAL,
                    formVersion: propsValue.formConfiguration.version,
                    processingMode: propsValue.processingMode
                }
            };
        }
    }

    /**
     * Handle data collection mode
     */
    private async handleDataCollection(
        context: SOPExecutionContext,
        props: DataFormProps
    ): Promise<DataFormResult> {
        // In a real implementation, this would present the form to users
        // For this implementation, we'll simulate data collection
        
        const formConfig = props.formConfiguration;
        const submissionData = props.submissionData || {};
        
        // Generate form if schema is requested
        let formSchema = undefined;
        if (props.generateFormSchema) {
            formSchema = this.formHelpers.generateFormSchema(formConfig);
        }
        
        // Validate collected data if any
        const validationResults = [];
        let validationPassed = true;
        
        if (Object.keys(submissionData).length > 0) {
            const validationContext = {
                formId: formConfig.id,
                formVersion: formConfig.version,
                userId: context.executedBy,
                timestamp: new Date().toISOString(),
                allFieldValues: submissionData,
                complianceFrameworks: props.complianceFrameworks,
                validationMode: props.validationMode
            };
            
            const validationResult = await this.validator.validateForm(
                formConfig.fields,
                submissionData,
                validationContext
            );
            
            validationPassed = validationResult.isValid;
            
            // Convert validation results
            validationResults.push(
                ...formConfig.fields.map(field => ({
                    fieldId: field.id,
                    fieldName: field.name,
                    isValid: !validationResult.errors.some(e => e.field === field.name),
                    errors: validationResult.errors
                        .filter(e => e.field === field.name)
                        .map(e => e.message),
                    warnings: validationResult.warnings
                        .filter(w => w.field === field.name)
                        .map(w => w.message)
                }))
            );
        }
        
        // Create submission record if data was provided
        let submissionId = undefined;
        if (Object.keys(submissionData).length > 0) {
            submissionId = this.formHelpers.generateSubmissionId(formConfig.id);
            
            // Log data collection
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'data_collected',
                userId: context.executedBy,
                details: {
                    submissionId,
                    fieldsSubmitted: Object.keys(submissionData).length,
                    validationPassed,
                    errorCount: validationResults.reduce((sum, r) => sum + r.errors.length, 0)
                }
            });
        }
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            formId: formConfig.id,
            submissionId,
            executionTime: 0, // Will be calculated later
            formGenerated: true,
            dataCollected: Object.keys(submissionData).length > 0,
            validationPassed,
            collectedData: Object.keys(submissionData).length > 0 ? submissionData : undefined,
            validationResults,
            complianceStatus: props.enableComplianceCheck ? 
                (validationPassed ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT) :
                SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                formVersion: formConfig.version,
                processingMode: props.processingMode
            }
        };
    }

    /**
     * Handle data validation mode
     */
    private async handleDataValidation(
        context: SOPExecutionContext,
        props: DataFormProps
    ): Promise<DataFormResult> {
        const formConfig = props.formConfiguration;
        const submissionData = props.submissionData || {};
        
        if (Object.keys(submissionData).length === 0) {
            throw new Error('Submission data is required for validation mode');
        }
        
        // Create validation context
        const validationContext = {
            formId: formConfig.id,
            formVersion: formConfig.version,
            userId: context.executedBy,
            timestamp: new Date().toISOString(),
            allFieldValues: submissionData,
            complianceFrameworks: props.complianceFrameworks,
            validationMode: props.validationMode
        };
        
        // Perform comprehensive validation
        const validationResult = await this.validator.validateForm(
            formConfig.fields,
            submissionData,
            validationContext
        );
        
        // Convert validation results
        const validationResults = formConfig.fields.map(field => ({
            fieldId: field.id,
            fieldName: field.name,
            isValid: !validationResult.errors.some(e => e.field === field.name),
            errors: validationResult.errors
                .filter(e => e.field === field.name)
                .map(e => e.message),
            warnings: validationResult.warnings
                .filter(w => w.field === field.name)
                .map(w => w.message)
        }));
        
        // Determine compliance status
        let complianceStatus = SOPComplianceStatus.EXEMPT;
        let complianceResults = undefined;
        
        if (props.enableComplianceCheck && props.complianceFrameworks) {
            complianceResults = validationResult.complianceChecks.map(check => ({
                framework: check.rule,
                status: check.status,
                details: check.message
            }));
            
            const allCompliant = complianceResults.every(r => r.status === SOPComplianceStatus.COMPLIANT);
            complianceStatus = allCompliant ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT;
        }
        
        // Log validation completion
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'data_validated',
            userId: context.executedBy,
            details: {
                validationPassed: validationResult.isValid,
                errorCount: validationResult.errors.length,
                warningCount: validationResult.warnings.length,
                complianceChecks: props.complianceFrameworks?.length || 0
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            formId: formConfig.id,
            executionTime: 0,
            formGenerated: false,
            dataCollected: false,
            validationPassed: validationResult.isValid,
            validationResults,
            complianceStatus,
            complianceResults,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                formVersion: formConfig.version,
                processingMode: props.processingMode
            }
        };
    }

    /**
     * Handle form display mode
     */
    private async handleFormDisplay(
        context: SOPExecutionContext,
        props: DataFormProps
    ): Promise<DataFormResult> {
        const formConfig = props.formConfiguration;
        
        // Generate form schema for display
        const formSchema = props.generateFormSchema ? 
            this.formHelpers.generateFormSchema(formConfig) : undefined;
        
        // Calculate form complexity
        const formComplexity = this.formHelpers.calculateFormComplexity(formConfig);
        
        // Log form display
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'form_displayed',
            userId: context.executedBy,
            details: {
                formId: formConfig.id,
                fieldsCount: formConfig.fields.length,
                formComplexity,
                displayMode: formConfig.displayMode
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            formId: formConfig.id,
            executionTime: 0,
            formGenerated: true,
            dataCollected: false,
            validationPassed: true,
            validationResults: [],
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                formVersion: formConfig.version,
                processingMode: props.processingMode,
                formComplexity
            }
        };
    }

    /**
     * Handle form generation mode
     */
    private async handleFormGeneration(
        context: SOPExecutionContext,
        props: DataFormProps
    ): Promise<DataFormResult> {
        const formConfig = props.formConfiguration;
        
        // Generate JSON schema
        const formSchema = this.formHelpers.generateFormSchema(formConfig);
        
        // Generate analytics if requested
        let analytics = undefined;
        if (props.includeAnalytics) {
            // In a real implementation, this would gather actual analytics data
            analytics = {
                formId: formConfig.id,
                generatedAt: new Date().toISOString(),
                fieldsCount: formConfig.fields.length,
                estimatedCompletionTime: formConfig.fields.length * 30, // 30 seconds per field
                complexity: this.formHelpers.calculateFormComplexity(formConfig)
            };
        }
        
        // Log form generation
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'form_generated',
            userId: context.executedBy,
            details: {
                formId: formConfig.id,
                schemaGenerated: true,
                analyticsIncluded: !!analytics,
                fieldsProcessed: formConfig.fields.length
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            formId: formConfig.id,
            executionTime: 0,
            formGenerated: true,
            dataCollected: false,
            validationPassed: true,
            validationResults: [],
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                formVersion: formConfig.version,
                processingMode: props.processingMode,
                generatedSchema: formSchema,
                analytics
            }
        };
    }

    /**
     * Handle data migration mode
     */
    private async handleDataMigration(
        context: SOPExecutionContext,
        props: DataFormProps
    ): Promise<DataFormResult> {
        // Data migration logic would go here
        // This is a placeholder for complex migration scenarios
        
        const formConfig = props.formConfiguration;
        
        // Log migration attempt
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'data_migration_started',
            userId: context.executedBy,
            details: {
                formId: formConfig.id,
                migrationMode: 'placeholder'
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            formId: formConfig.id,
            executionTime: 0,
            formGenerated: false,
            dataCollected: false,
            validationPassed: true,
            validationResults: [],
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                formVersion: formConfig.version,
                processingMode: props.processingMode
            }
        };
    }

    /**
     * Validate form configuration
     */
    private async validateFormConfiguration(config: DataFormConfig): Promise<void> {
        if (!config.id || !config.title || !config.fields) {
            throw new Error('Invalid form configuration: id, title, and fields are required');
        }
        
        if (config.fields.length === 0) {
            throw new Error('Form must have at least one field');
        }
        
        // Validate field configurations
        const fieldIds = new Set();
        const fieldNames = new Set();
        
        for (const field of config.fields) {
            if (!field.id || !field.name || !field.label || !field.type) {
                throw new Error(`Invalid field configuration: ${field.name || 'unknown'} - id, name, label, and type are required`);
            }
            
            if (fieldIds.has(field.id)) {
                throw new Error(`Duplicate field ID: ${field.id}`);
            }
            
            if (fieldNames.has(field.name)) {
                throw new Error(`Duplicate field name: ${field.name}`);
            }
            
            fieldIds.add(field.id);
            fieldNames.add(field.name);
        }
    }

    /**
     * Get piece configuration for Activepieces
     */
    public getPieceConfiguration(): any {
        const baseProps = this.getCommonSOPProperties();
        const specificProps = this.getSOPSpecificProperties();
        
        return {
            displayName: 'Data Form',
            description: 'Handle dynamic form creation, data collection, validation, and compliance checking',
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

    /**
     * Custom pre-run hook for data form
     */
    protected async onPreRun(context: SOPExecutionContext, propsValue: DataFormProps): Promise<void> {
        // Validate form configuration early
        await this.validateFormConfiguration(propsValue.formConfiguration);
        
        // Log form processing start
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'data_form_initialized',
            userId: context.executedBy,
            details: {
                formId: propsValue.formConfiguration.id,
                processingMode: propsValue.processingMode,
                validationMode: propsValue.validationMode,
                fieldsCount: propsValue.formConfiguration.fields.length,
                complianceFrameworks: propsValue.complianceFrameworks || []
            }
        });
    }

    /**
     * Custom post-run hook for data form
     */
    protected async onPostRun(context: SOPExecutionContext, result: DataFormResult): Promise<void> {
        // Log completion
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'data_form_completed',
            userId: context.executedBy,
            details: {
                success: result.success,
                formId: result.formId,
                executionTime: result.executionTime,
                validationPassed: result.validationPassed,
                complianceStatus: result.complianceStatus
            }
        });
        
        // Handle notifications if configured
        // In a real implementation, this would send notifications based on the result
    }
}

/**
 * Create the Data Form action
 */
export const dataFormAction = createAction({
    name: 'sop_data_form',
    displayName: 'Process Data Form',
    description: 'Handle dynamic form creation, data collection, validation, and compliance checking within SOP workflows',
    
    props: {
        // Core Processing Configuration
        processingMode: Property.StaticDropdown({
            displayName: 'Processing Mode',
            description: 'How the form should be processed',
            required: true,
            defaultValue: FormProcessingMode.COLLECT,
            options: {
                options: [
                    { label: 'Collect Data', value: FormProcessingMode.COLLECT },
                    { label: 'Validate Data', value: FormProcessingMode.VALIDATE },
                    { label: 'Display Form', value: FormProcessingMode.DISPLAY },
                    { label: 'Generate Form', value: FormProcessingMode.GENERATE },
                    { label: 'Migrate Data', value: FormProcessingMode.MIGRATE }
                ]
            }
        }),
        
        formConfiguration: Property.Json({
            displayName: 'Form Configuration',
            description: 'Complete form definition including fields, validation rules, and layout',
            required: true,
            validators: [Validators.object]
        }),
        
        submissionData: Property.Object({
            displayName: 'Submission Data',
            description: 'Data to be validated or processed',
            required: false,
            defaultValue: {}
        }),
        
        validationMode: Property.StaticDropdown({
            displayName: 'Validation Mode',
            description: 'Level of validation strictness',
            required: false,
            defaultValue: 'strict',
            options: {
                options: [
                    { label: 'Strict - All rules enforced', value: 'strict' },
                    { label: 'Lenient - Warnings only', value: 'lenient' },
                    { label: 'Compliance Only', value: 'compliance-only' }
                ]
            }
        }),
        
        generateFormSchema: Property.Checkbox({
            displayName: 'Generate JSON Schema',
            description: 'Generate JSON Schema for the form',
            required: false,
            defaultValue: false
        }),
        
        complianceFrameworks: Property.Array({
            displayName: 'Compliance Frameworks',
            description: 'Compliance frameworks to validate against',
            required: false
        }),
        
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
        notificationSettings: notificationSettingsProp,
        escalationSettings: escalationSettingsProp,
        errorHandling: errorHandlingProp,
        stepDescription: stepDescriptionProp
    },
    
    async run(context) {
        const { propsValue, run: { id: executionId } } = context;
        
        // Create Data Form piece instance
        const dataFormPiece = new DataFormPiece({
            displayName: 'Data Form',
            description: propsValue.stepDescription || 'SOP Data Form processing',
            sopPieceType: SOPPieceType.DATA_VALIDATION,
            sopCategory: SOPPieceCategory.PROCESS_MANAGEMENT,
            priority: propsValue.priority,
            complianceRequired: propsValue.enableComplianceCheck,
            auditTrailRequired: propsValue.enableAuditTrail,
            tags: propsValue.tags || [],
            allowFileUploads: true,
            maxFormComplexity: 1000,
            enableAnalytics: true,
            enableAutoSave: true,
            encryptionRequired: false
        });
        
        // Execute the data form processing
        const result = await dataFormPiece.execute(propsValue, 'system_user'); // In real implementation, get actual user ID
        
        return result;
    }
});