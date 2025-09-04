/**
 * Process Step Helpers - Utility functions for Process Step operations
 */

import { 
    ProcessStepConfig, 
    ProcessStepResult, 
    ProcessStepError, 
    ProcessStepErrorType,
    StepExecutionMetrics,
    OutputFormat 
} from '../common/process-step-types';
import {
    SOPExecutionState,
    SOPComplianceStatus,
    SOPPriority,
    SOPExecutionContext
} from '../../../../types/sop-types';

/**
 * Process Step Validation Helpers
 */
export class ProcessStepValidator {
    /**
     * Validate step configuration
     */
    static validateStepConfig(config: Partial<ProcessStepConfig>): ProcessStepError[] {
        const errors: ProcessStepError[] = [];
        const now = new Date().toISOString();

        if (!config.title || config.title.trim().length === 0) {
            errors.push({
                type: ProcessStepErrorType.VALIDATION_ERROR,
                message: 'Step title is required and cannot be empty',
                timestamp: now,
                recoverable: true,
                retryable: false
            });
        }

        if (!config.instructions || config.instructions.trim().length === 0) {
            errors.push({
                type: ProcessStepErrorType.VALIDATION_ERROR,
                message: 'Step instructions are required and cannot be empty',
                timestamp: now,
                recoverable: true,
                retryable: false
            });
        }

        if (config.estimatedDuration !== undefined && config.estimatedDuration <= 0) {
            errors.push({
                type: ProcessStepErrorType.VALIDATION_ERROR,
                message: 'Estimated duration must be a positive number',
                timestamp: now,
                recoverable: true,
                retryable: false
            });
        }

        return errors;
    }

    /**
     * Validate input data against schema
     */
    static validateInputData(inputData: any, schema?: any): ProcessStepError[] {
        const errors: ProcessStepError[] = [];
        const now = new Date().toISOString();

        if (!inputData) {
            return []; // Input data is optional
        }

        // Basic type validation
        if (typeof inputData !== 'object') {
            errors.push({
                type: ProcessStepErrorType.VALIDATION_ERROR,
                message: 'Input data must be an object',
                timestamp: now,
                recoverable: true,
                retryable: false
            });
        }

        // Schema validation (simplified - in production use proper JSON schema validator)
        if (schema && typeof inputData === 'object') {
            const missingFields = this.validateRequiredFields(inputData, schema);
            errors.push(...missingFields);
        }

        return errors;
    }

    /**
     * Validate required fields
     */
    private static validateRequiredFields(data: any, schema: any): ProcessStepError[] {
        const errors: ProcessStepError[] = [];
        const now = new Date().toISOString();

        if (schema.required && Array.isArray(schema.required)) {
            for (const field of schema.required) {
                if (!(field in data) || data[field] === null || data[field] === undefined) {
                    errors.push({
                        type: ProcessStepErrorType.VALIDATION_ERROR,
                        message: `Required field '${field}' is missing or null`,
                        details: { field, expectedType: schema.properties?.[field]?.type },
                        timestamp: now,
                        recoverable: true,
                        retryable: false
                    });
                }
            }
        }

        return errors;
    }

    /**
     * Validate success criteria
     */
    static validateSuccessCriteria(output: any, criteria: string[]): boolean {
        if (!criteria || criteria.length === 0) {
            return true; // No criteria means success
        }

        for (const criterion of criteria) {
            if (!this.evaluateCriterion(output, criterion)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate individual criterion
     */
    private static evaluateCriterion(output: any, criterion: string): boolean {
        const lowerCriterion = criterion.toLowerCase();

        // Built-in criteria
        if (lowerCriterion === 'output_not_null' && output === null) {
            return false;
        }

        if (lowerCriterion === 'output_not_empty' && (!output || (typeof output === 'object' && Object.keys(output).length === 0))) {
            return false;
        }

        if (lowerCriterion.startsWith('output_has_field:')) {
            const fieldName = lowerCriterion.split(':')[1];
            return output && typeof output === 'object' && fieldName in output;
        }

        if (lowerCriterion === 'output_is_boolean' && typeof output !== 'boolean') {
            return false;
        }

        if (lowerCriterion === 'output_is_true' && output !== true) {
            return false;
        }

        // Default: criterion passes
        return true;
    }
}

/**
 * Process Step Execution Helpers
 */
export class ProcessStepExecutor {
    /**
     * Create execution metrics
     */
    static createExecutionMetrics(
        executionId: string,
        stepTitle: string,
        startTime: string,
        inputData?: any
    ): StepExecutionMetrics {
        return {
            executionId,
            stepTitle,
            startTime,
            status: SOPExecutionState.PENDING,
            complianceStatus: SOPComplianceStatus.PENDING_REVIEW,
            retryCount: 0,
            escalationLevel: 0,
            inputDataSize: inputData ? JSON.stringify(inputData).length : 0,
            auditTrailEntries: 1 // Initial entry
        };
    }

    /**
     * Update execution metrics
     */
    static updateExecutionMetrics(
        metrics: StepExecutionMetrics,
        updates: Partial<StepExecutionMetrics>
    ): StepExecutionMetrics {
        return {
            ...metrics,
            ...updates,
            duration: updates.endTime ? 
                new Date(updates.endTime).getTime() - new Date(metrics.startTime).getTime() : 
                metrics.duration
        };
    }

    /**
     * Format output based on specified format
     */
    static formatOutput(data: any, format: OutputFormat | string): any {
        switch (format) {
            case OutputFormat.JSON:
                return typeof data === 'string' ? JSON.parse(data) : data;
            
            case OutputFormat.TEXT:
                return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
            
            case OutputFormat.BOOLEAN:
                return Boolean(data);
            
            case OutputFormat.FILE:
                return {
                    fileGenerated: true,
                    fileName: `step_output_${Date.now()}.json`,
                    content: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data),
                    mimeType: 'application/json'
                };
            
            case OutputFormat.CUSTOM:
            default:
                return data;
        }
    }

    /**
     * Calculate execution statistics
     */
    static calculateExecutionStats(metrics: StepExecutionMetrics): any {
        const stats = {
            totalDuration: metrics.duration || 0,
            validationTime: metrics.validationTime || 0,
            processingTime: metrics.processingTime || 0,
            auditTrailSize: metrics.auditTrailEntries,
            dataProcessed: {
                inputSize: metrics.inputDataSize || 0,
                outputSize: metrics.outputDataSize || 0
            },
            performance: {
                retryCount: metrics.retryCount,
                escalationLevel: metrics.escalationLevel,
                status: metrics.status,
                complianceStatus: metrics.complianceStatus
            }
        };

        // Calculate efficiency metrics
        if (metrics.duration) {
            (stats.performance as any).executionEfficiency = metrics.processingTime ? (metrics.processingTime / metrics.duration) : 0;
            (stats.performance as any).validationOverhead = metrics.validationTime ? (metrics.validationTime / metrics.duration) : 0;
        }

        return stats;
    }
}

/**
 * Process Step Audit Helpers
 */
export class ProcessStepAuditor {
    /**
     * Create audit trail entry
     */
    static createAuditEntry(
        action: string,
        userId: string,
        details: Record<string, any> = {}
    ): any {
        return {
            timestamp: new Date().toISOString(),
            action,
            userId,
            details: {
                ...details,
                auditId: this.generateAuditId(),
                source: 'process-step-piece'
            }
        };
    }

    /**
     * Generate unique audit ID
     */
    private static generateAuditId(): string {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create compliance audit entry
     */
    static createComplianceAuditEntry(
        userId: string,
        complianceStatus: SOPComplianceStatus,
        checks: any[] = []
    ): any {
        return this.createAuditEntry('compliance_check', userId, {
            complianceStatus,
            checksPerformed: checks.length,
            checkResults: checks,
            complianceTimestamp: new Date().toISOString()
        });
    }

    /**
     * Create error audit entry
     */
    static createErrorAuditEntry(
        userId: string,
        error: ProcessStepError,
        stepId?: string
    ): any {
        return this.createAuditEntry('error_occurred', userId, {
            errorType: error.type,
            errorMessage: error.message,
            errorCode: error.code,
            stepId,
            recoverable: error.recoverable,
            retryable: error.retryable,
            errorDetails: error.details
        });
    }

    /**
     * Create performance audit entry
     */
    static createPerformanceAuditEntry(
        userId: string,
        metrics: StepExecutionMetrics
    ): any {
        return this.createAuditEntry('performance_recorded', userId, {
            executionTime: metrics.duration,
            validationTime: metrics.validationTime,
            processingTime: metrics.processingTime,
            retryCount: metrics.retryCount,
            escalationLevel: metrics.escalationLevel,
            dataSize: {
                input: metrics.inputDataSize,
                output: metrics.outputDataSize
            }
        });
    }

    /**
     * Summarize audit trail
     */
    static summarizeAuditTrail(auditTrail: any[]): any {
        const summary = {
            totalEntries: auditTrail.length,
            actions: {} as Record<string, number>,
            timeline: {
                firstEntry: auditTrail.length > 0 ? auditTrail[0].timestamp : null,
                lastEntry: auditTrail.length > 0 ? auditTrail[auditTrail.length - 1].timestamp : null
            },
            users: new Set<string>(),
            errors: 0,
            complianceChecks: 0
        };

        for (const entry of auditTrail) {
            // Count actions
            summary.actions[entry.action] = (summary.actions[entry.action] || 0) + 1;
            
            // Track users
            summary.users.add(entry.userId);
            
            // Count errors
            if (entry.action === 'error_occurred') {
                summary.errors++;
            }
            
            // Count compliance checks
            if (entry.action === 'compliance_check') {
                summary.complianceChecks++;
            }
        }

        return {
            ...summary,
            uniqueUsers: Array.from(summary.users),
            users: undefined // Remove Set object
        };
    }
}

/**
 * Process Step State Manager
 */
export class ProcessStepStateManager {
    /**
     * Determine next state based on current state and event
     */
    static getNextState(
        currentState: SOPExecutionState,
        event: string,
        hasErrors: boolean = false
    ): SOPExecutionState {
        switch (currentState) {
            case SOPExecutionState.PENDING:
                if (event === 'start') return SOPExecutionState.IN_PROGRESS;
                if (event === 'cancel') return SOPExecutionState.CANCELLED;
                break;
                
            case SOPExecutionState.IN_PROGRESS:
                if (hasErrors) return SOPExecutionState.FAILED;
                if (event === 'complete') return SOPExecutionState.COMPLETED;
                if (event === 'pause') return SOPExecutionState.PAUSED;
                if (event === 'require_approval') return SOPExecutionState.WAITING_APPROVAL;
                if (event === 'escalate') return SOPExecutionState.ESCALATED;
                break;
                
            case SOPExecutionState.WAITING_APPROVAL:
                if (event === 'approve') return SOPExecutionState.APPROVED;
                if (event === 'reject') return SOPExecutionState.REJECTED;
                if (event === 'timeout') return SOPExecutionState.ESCALATED;
                break;
                
            case SOPExecutionState.APPROVED:
                return SOPExecutionState.COMPLETED;
                
            case SOPExecutionState.REJECTED:
                return SOPExecutionState.FAILED;
                
            case SOPExecutionState.PAUSED:
                if (event === 'resume') return SOPExecutionState.IN_PROGRESS;
                if (event === 'cancel') return SOPExecutionState.CANCELLED;
                break;
                
            case SOPExecutionState.ESCALATED:
                if (event === 'resolve') return SOPExecutionState.IN_PROGRESS;
                if (event === 'complete') return SOPExecutionState.COMPLETED;
                break;
        }
        
        return currentState; // No state change
    }

    /**
     * Check if state transition is valid
     */
    static isValidTransition(
        fromState: SOPExecutionState,
        toState: SOPExecutionState
    ): boolean {
        const validTransitions: Record<SOPExecutionState, SOPExecutionState[]> = {
            [SOPExecutionState.PENDING]: [
                SOPExecutionState.IN_PROGRESS,
                SOPExecutionState.CANCELLED
            ],
            [SOPExecutionState.IN_PROGRESS]: [
                SOPExecutionState.COMPLETED,
                SOPExecutionState.FAILED,
                SOPExecutionState.PAUSED,
                SOPExecutionState.WAITING_APPROVAL,
                SOPExecutionState.ESCALATED
            ],
            [SOPExecutionState.WAITING_APPROVAL]: [
                SOPExecutionState.APPROVED,
                SOPExecutionState.REJECTED,
                SOPExecutionState.ESCALATED
            ],
            [SOPExecutionState.APPROVED]: [
                SOPExecutionState.COMPLETED
            ],
            [SOPExecutionState.REJECTED]: [
                SOPExecutionState.FAILED,
                SOPExecutionState.IN_PROGRESS // Allow retry after rejection
            ],
            [SOPExecutionState.PAUSED]: [
                SOPExecutionState.IN_PROGRESS,
                SOPExecutionState.CANCELLED
            ],
            [SOPExecutionState.ESCALATED]: [
                SOPExecutionState.IN_PROGRESS,
                SOPExecutionState.COMPLETED,
                SOPExecutionState.FAILED
            ],
            [SOPExecutionState.COMPLETED]: [], // Terminal state
            [SOPExecutionState.FAILED]: [
                SOPExecutionState.IN_PROGRESS // Allow retry
            ],
            [SOPExecutionState.CANCELLED]: [] // Terminal state
        };

        return validTransitions[fromState]?.includes(toState) || false;
    }

    /**
     * Get available actions for current state
     */
    static getAvailableActions(state: SOPExecutionState): string[] {
        const actions: Record<SOPExecutionState, string[]> = {
            [SOPExecutionState.PENDING]: ['start', 'cancel'],
            [SOPExecutionState.IN_PROGRESS]: ['complete', 'pause', 'fail', 'require_approval', 'escalate'],
            [SOPExecutionState.WAITING_APPROVAL]: ['approve', 'reject'],
            [SOPExecutionState.APPROVED]: ['complete'],
            [SOPExecutionState.REJECTED]: ['retry', 'fail'],
            [SOPExecutionState.PAUSED]: ['resume', 'cancel'],
            [SOPExecutionState.ESCALATED]: ['resolve', 'complete', 'fail'],
            [SOPExecutionState.COMPLETED]: [],
            [SOPExecutionState.FAILED]: ['retry'],
            [SOPExecutionState.CANCELLED]: []
        };

        return actions[state] || [];
    }
}