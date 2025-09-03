/**
 * Base SOP Piece - Abstract foundation class for all SOP workflow components
 * 
 * This class provides the foundational infrastructure that all SOP pieces extend from,
 * including common patterns, validation, execution context, and integration helpers.
 */

import { createAction, createTrigger, Property, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { SOPWorkflowContext } from './sop-workflow-context';
import { SOPValidationFramework, SOPValidationRule } from './sop-validation-framework';
import { SOPExecutionEngine } from './sop-execution-engine';
import { SOPIntegrationHelpers } from './sop-integration-helpers';
import {
    SOPPieceType,
    SOPPieceCategory,
    SOPMetadata,
    SOPExecutionContext,
    SOPValidationResult,
    SOPConfiguration,
    SOPPriority,
    SOPExecutionState,
    SOPComplianceStatus
} from '../types/sop-types';
import { nanoid } from 'nanoid';

/**
 * Base configuration interface for SOP pieces
 */
export interface BaseSoPieceConfig {
    displayName: string;
    description: string;
    sopPieceType: SOPPieceType;
    sopCategory: SOPPieceCategory;
    priority?: SOPPriority;
    complianceRequired?: boolean;
    auditTrailRequired?: boolean;
    approversRequired?: boolean;
    customValidationRules?: SOPValidationRule[];
    integrationPoints?: string[];
    tags?: string[];
    department?: string;
    version?: string;
}

/**
 * Abstract base class for all SOP pieces
 */
export abstract class BaseSoPiece {
    protected readonly config: BaseSoPieceConfig;
    protected readonly workflowContext: SOPWorkflowContext;
    protected readonly validationFramework: SOPValidationFramework;
    protected readonly executionEngine: SOPExecutionEngine;
    protected readonly integrationHelpers: SOPIntegrationHelpers;
    protected readonly metadata: SOPMetadata;

    constructor(config: BaseSoPieceConfig) {
        this.config = config;
        this.workflowContext = new SOPWorkflowContext();
        this.validationFramework = new SOPValidationFramework();
        this.executionEngine = new SOPExecutionEngine();
        this.integrationHelpers = new SOPIntegrationHelpers();
        
        // Initialize SOP metadata
        this.metadata = this.createSOPMetadata(config);
        
        // Register custom validation rules if provided
        if (config.customValidationRules) {
            config.customValidationRules.forEach(rule => {
                this.validationFramework.registerRule(rule);
            });
        }
    }

    /**
     * Create SOP metadata from configuration
     */
    private createSOPMetadata(config: BaseSoPieceConfig): SOPMetadata {
        const now = new Date().toISOString();
        return {
            sopId: nanoid(),
            version: config.version || '1.0.0',
            title: config.displayName,
            description: config.description,
            category: config.sopCategory,
            pieceType: config.sopPieceType,
            priority: config.priority || SOPPriority.NORMAL,
            complianceRequired: config.complianceRequired || false,
            auditTrailRequired: config.auditTrailRequired || true,
            tags: config.tags || [],
            createdAt: now,
            updatedAt: now,
            createdBy: 'system', // Will be overridden at runtime
            department: config.department,
            approvers: config.approversRequired ? [] : undefined
        };
    }

    /**
     * Get common SOP properties that all pieces should include
     */
    protected getCommonSOPProperties() {
        return {
            sopMetadata: Property.Json({
                displayName: 'SOP Metadata',
                description: 'Standard Operating Procedure metadata',
                required: false,
                defaultValue: this.metadata
            }),
            priority: Property.StaticDropdown({
                displayName: 'Priority',
                description: 'Priority level for this SOP step',
                required: false,
                defaultValue: this.config.priority || SOPPriority.NORMAL,
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
            assignedTo: Property.ShortText({
                displayName: 'Assigned To',
                description: 'User ID or email of person assigned to this step',
                required: false
            }),
            dueDate: Property.DateTime({
                displayName: 'Due Date',
                description: 'When this step should be completed',
                required: false
            }),
            enableComplianceCheck: Property.Checkbox({
                displayName: 'Enable Compliance Check',
                description: 'Enable compliance validation for this step',
                required: false,
                defaultValue: this.config.complianceRequired
            }),
            enableAuditTrail: Property.Checkbox({
                displayName: 'Enable Audit Trail',
                description: 'Enable audit trail logging for this step',
                required: false,
                defaultValue: this.config.auditTrailRequired
            }),
            customVariables: Property.Object({
                displayName: 'Custom Variables',
                description: 'Custom variables for this SOP instance',
                required: false
            }),
            tags: Property.Array({
                displayName: 'Tags',
                description: 'Tags for categorization and filtering',
                required: false
            }),
            notes: Property.LongText({
                displayName: 'Notes',
                description: 'Additional notes or comments for this step',
                required: false
            })
        };
    }

    /**
     * Create execution context for this SOP piece
     */
    protected createExecutionContext(propsValue: any, executedBy: string): SOPExecutionContext {
        const now = new Date().toISOString();
        return {
            executionId: nanoid(),
            sopMetadata: propsValue.sopMetadata || this.metadata,
            currentState: SOPExecutionState.PENDING,
            startedAt: now,
            executedBy,
            assignedTo: propsValue.assignedTo,
            escalationLevel: 0,
            complianceStatus: SOPComplianceStatus.PENDING_REVIEW,
            auditTrail: [{
                timestamp: now,
                action: 'execution_started',
                userId: executedBy,
                details: {
                    sopId: this.metadata.sopId,
                    pieceType: this.metadata.pieceType,
                    priority: propsValue.priority || this.metadata.priority
                }
            }],
            variables: propsValue.customVariables || {},
            attachments: []
        };
    }

    /**
     * Validate SOP execution context and properties
     */
    protected async validateExecution(context: SOPExecutionContext, propsValue: any): Promise<SOPValidationResult> {
        // Basic validation
        const basicValidation = await this.validationFramework.validateBasic(context, propsValue);
        
        // Compliance validation if required
        let complianceValidation: SOPValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            complianceChecks: []
        };
        
        if (propsValue.enableComplianceCheck) {
            complianceValidation = await this.validationFramework.validateCompliance(context, propsValue);
        }
        
        // Custom validation rules
        const customValidation = await this.validationFramework.validateCustomRules(context, propsValue);
        
        // Combine all validation results
        return this.combineValidationResults([basicValidation, complianceValidation, customValidation]);
    }

    /**
     * Combine multiple validation results
     */
    private combineValidationResults(results: SOPValidationResult[]): SOPValidationResult {
        return results.reduce((combined, result) => ({
            isValid: combined.isValid && result.isValid,
            errors: [...combined.errors, ...result.errors],
            warnings: [...combined.warnings, ...result.warnings],
            complianceChecks: [...combined.complianceChecks, ...result.complianceChecks]
        }), {
            isValid: true,
            errors: [],
            warnings: [],
            complianceChecks: []
        });
    }

    /**
     * Execute pre-run hooks
     */
    protected async executePreRunHooks(context: SOPExecutionContext, propsValue: any): Promise<void> {
        // Update audit trail
        if (propsValue.enableAuditTrail) {
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'pre_execution_validation',
                userId: context.executedBy,
                details: {
                    validationEnabled: true,
                    complianceCheckEnabled: propsValue.enableComplianceCheck
                }
            });
        }
        
        // Initialize workflow context
        this.workflowContext.initialize(context);
        
        // Execute custom pre-run logic (to be overridden by subclasses)
        await this.onPreRun(context, propsValue);
    }

    /**
     * Execute post-run hooks
     */
    protected async executePostRunHooks(context: SOPExecutionContext, result: any): Promise<void> {
        // Update execution state
        context.currentState = SOPExecutionState.COMPLETED;
        context.completedAt = new Date().toISOString();
        
        // Update audit trail
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'execution_completed',
            userId: context.executedBy,
            details: {
                result: typeof result === 'object' ? JSON.stringify(result) : String(result),
                executionTime: this.calculateExecutionTime(context.startedAt, context.completedAt!)
            }
        });
        
        // Update workflow context
        this.workflowContext.updateState(context);
        
        // Execute custom post-run logic (to be overridden by subclasses)
        await this.onPostRun(context, result);
    }

    /**
     * Calculate execution time in milliseconds
     */
    private calculateExecutionTime(startTime: string, endTime: string): number {
        return new Date(endTime).getTime() - new Date(startTime).getTime();
    }

    /**
     * Handle execution errors
     */
    protected async handleExecutionError(context: SOPExecutionContext, error: Error): Promise<void> {
        // Update execution state
        context.currentState = SOPExecutionState.FAILED;
        
        // Add error to audit trail
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'execution_failed',
            userId: context.executedBy,
            details: {
                error: error.message,
                stack: error.stack,
                sopId: context.sopMetadata.sopId
            }
        });
        
        // Execute custom error handling (to be overridden by subclasses)
        await this.onExecutionError(context, error);
    }

    /**
     * Get SOP-specific Activepieces category
     */
    protected getActivepiecesCategory(): PieceCategory {
        // Map SOP categories to Activepieces categories
        const categoryMap: Record<SOPPieceCategory, PieceCategory> = {
            [SOPPieceCategory.PROCESS_MANAGEMENT]: PieceCategory.PRODUCTIVITY,
            [SOPPieceCategory.APPROVAL_WORKFLOWS]: PieceCategory.PRODUCTIVITY,
            [SOPPieceCategory.COMPLIANCE]: PieceCategory.BUSINESS_INTELLIGENCE,
            [SOPPieceCategory.QUALITY_ASSURANCE]: PieceCategory.BUSINESS_INTELLIGENCE,
            [SOPPieceCategory.DOCUMENTATION]: PieceCategory.CONTENT_AND_FILES,
            [SOPPieceCategory.AUDIT_TRAIL]: PieceCategory.BUSINESS_INTELLIGENCE,
            [SOPPieceCategory.DECISION_SUPPORT]: PieceCategory.BUSINESS_INTELLIGENCE,
            [SOPPieceCategory.ESCALATION]: PieceCategory.COMMUNICATION
        };
        
        return categoryMap[this.config.sopCategory] || PieceCategory.PRODUCTIVITY;
    }

    /**
     * Abstract methods to be implemented by concrete SOP pieces
     */
    
    /**
     * Called before execution starts - override for custom pre-run logic
     */
    protected async onPreRun(context: SOPExecutionContext, propsValue: any): Promise<void> {
        // Default implementation - can be overridden
    }
    
    /**
     * Called after execution completes - override for custom post-run logic
     */
    protected async onPostRun(context: SOPExecutionContext, result: any): Promise<void> {
        // Default implementation - can be overridden
    }
    
    /**
     * Called when execution fails - override for custom error handling
     */
    protected async onExecutionError(context: SOPExecutionContext, error: Error): Promise<void> {
        // Default implementation - can be overridden
        throw error; // Re-throw by default
    }

    /**
     * Main execution method - must be implemented by subclasses
     */
    public abstract execute(propsValue: any, executedBy: string): Promise<any>;
    
    /**
     * Get the piece configuration for Activepieces
     */
    public abstract getPieceConfiguration(): any;
    
    /**
     * Get SOP-specific properties for this piece type
     */
    protected abstract getSOPSpecificProperties(): Record<string, any>;
}