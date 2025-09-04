/**
 * SOP Validation Framework - Comprehensive validation system for SOP workflows
 * 
 * This class provides validation capabilities for SOP pieces, including
 * basic validation, compliance checking, and custom rule validation.
 */

import {
    SOPExecutionContext,
    SOPValidationResult,
    SOPComplianceStatus,
    SOPExecutionState,
    SOPPriority
} from '../types/sop-types';
import { nanoid } from 'nanoid';

/**
 * Validation Rule Interface
 */
export interface SOPValidationRule {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'compliance' | 'business' | 'security' | 'custom';
    severity: 'error' | 'warning' | 'info';
    enabled: boolean;
    validate: (context: SOPExecutionContext, data: any) => Promise<SOPValidationRuleResult>;
    conditions?: SOPValidationCondition[];
    metadata?: Record<string, any>;
}

/**
 * Validation Rule Result
 */
export interface SOPValidationRuleResult {
    isValid: boolean;
    message?: string;
    code?: string;
    field?: string;
    details?: Record<string, any>;
}

/**
 * Validation Condition Interface
 */
export interface SOPValidationCondition {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greater' | 'less' | 'exists' | 'notExists';
    value: any;
    caseSensitive?: boolean;
}

/**
 * Compliance Rule Interface
 */
export interface SOPComplianceRule {
    id: string;
    name: string;
    description: string;
    regulation: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    autoFix?: boolean;
    validate: (context: SOPExecutionContext, data: any) => Promise<SOPComplianceCheckResult>;
    remediation?: {
        description: string;
        actions: string[];
        documentation?: string;
    };
}

/**
 * Compliance Check Result
 */
export interface SOPComplianceCheckResult {
    status: SOPComplianceStatus;
    message?: string;
    evidence?: any;
    recommendations?: string[];
    autoFixApplied?: boolean;
}

/**
 * Validation Context
 */
export interface SOPValidationContext {
    executionContext: SOPExecutionContext;
    data: any;
    timestamp: string;
    validatorVersion: string;
    customRules: SOPValidationRule[];
    complianceRules: SOPComplianceRule[];
    skipConditions?: string[];
}

/**
 * SOP Validation Framework
 */
export class SOPValidationFramework {
    private validationRules: Map<string, SOPValidationRule> = new Map();
    private complianceRules: Map<string, SOPComplianceRule> = new Map();
    private validationHistory: Array<{
        timestamp: string;
        context: SOPExecutionContext;
        result: SOPValidationResult;
    }> = [];
    private version: string = '1.0.0';

    constructor() {
        this.initializeDefaultRules();
    }

    /**
     * Initialize default validation rules
     */
    private initializeDefaultRules(): void {
        // Basic validation rules
        this.registerRule({
            id: 'required_metadata',
            name: 'Required Metadata',
            description: 'Ensures all required SOP metadata fields are present',
            category: 'basic',
            severity: 'error',
            enabled: true,
            validate: async (context, data) => {
                const metadata = context.sopMetadata;
                const requiredFields = ['sopId', 'title', 'category', 'pieceType', 'createdBy'];
                
                for (const field of requiredFields) {
                    if (!metadata[field]) {
                        return {
                            isValid: false,
                            message: `Required metadata field '${field}' is missing`,
                            code: 'MISSING_METADATA_FIELD',
                            field
                        };
                    }
                }
                
                return { isValid: true };
            }
        });

        this.registerRule({
            id: 'valid_execution_state',
            name: 'Valid Execution State',
            description: 'Validates that the execution state is valid',
            category: 'basic',
            severity: 'error',
            enabled: true,
            validate: async (context, data) => {
                const validStates = Object.values(SOPExecutionState);
                if (!validStates.includes(context.currentState)) {
                    return {
                        isValid: false,
                        message: `Invalid execution state: ${context.currentState}`,
                        code: 'INVALID_EXECUTION_STATE',
                        field: 'currentState'
                    };
                }
                return { isValid: true };
            }
        });

        this.registerRule({
            id: 'valid_user_assignment',
            name: 'Valid User Assignment',
            description: 'Validates user assignments and permissions',
            category: 'security',
            severity: 'warning',
            enabled: true,
            validate: async (context, data) => {
                if (context.assignedTo && !context.executedBy) {
                    return {
                        isValid: false,
                        message: 'Step is assigned but no executor specified',
                        code: 'MISSING_EXECUTOR',
                        field: 'executedBy'
                    };
                }
                return { isValid: true };
            }
        });

        this.registerRule({
            id: 'audit_trail_integrity',
            name: 'Audit Trail Integrity',
            description: 'Validates audit trail completeness and integrity',
            category: 'compliance',
            severity: 'error',
            enabled: true,
            validate: async (context, data) => {
                if (context.sopMetadata.auditTrailRequired && context.auditTrail.length === 0) {
                    return {
                        isValid: false,
                        message: 'Audit trail is required but empty',
                        code: 'EMPTY_AUDIT_TRAIL',
                        field: 'auditTrail'
                    };
                }
                
                // Check audit trail chronological order
                for (let i = 1; i < context.auditTrail.length; i++) {
                    const prev = new Date(context.auditTrail[i - 1].timestamp);
                    const curr = new Date(context.auditTrail[i].timestamp);
                    if (curr < prev) {
                        return {
                            isValid: false,
                            message: 'Audit trail entries are not in chronological order',
                            code: 'INVALID_AUDIT_ORDER',
                            field: 'auditTrail'
                        };
                    }
                }
                
                return { isValid: true };
            }
        });

        // Initialize default compliance rules
        this.registerComplianceRule({
            id: 'gdpr_data_processing',
            name: 'GDPR Data Processing Compliance',
            description: 'Ensures GDPR compliance for data processing activities',
            regulation: 'GDPR',
            category: 'Data Privacy',
            severity: 'critical',
            validate: async (context, data) => {
                // Basic GDPR check - in practice this would be more comprehensive
                const hasPersonalData = this.checkForPersonalData(data);
                const hasConsent = this.checkForConsent(context, data);
                
                if (hasPersonalData && !hasConsent) {
                    return {
                        status: SOPComplianceStatus.NON_COMPLIANT,
                        message: 'Processing personal data without proper consent documentation',
                        recommendations: [
                            'Obtain explicit consent before processing personal data',
                            'Document the legal basis for processing',
                            'Ensure data subject rights are respected'
                        ]
                    };
                }
                
                return {
                    status: SOPComplianceStatus.COMPLIANT,
                    message: 'GDPR compliance requirements met'
                };
            },
            remediation: {
                description: 'Implement GDPR compliance measures',
                actions: [
                    'Add consent management',
                    'Implement data subject rights',
                    'Add privacy impact assessment'
                ]
            }
        });

        this.registerComplianceRule({
            id: 'sox_approval_requirements',
            name: 'SOX Approval Requirements',
            description: 'Ensures SOX compliance for financial processes',
            regulation: 'SOX',
            category: 'Financial Controls',
            severity: 'high',
            validate: async (context, data) => {
                // Check if this is a financial process requiring SOX compliance
                const isFinancialProcess = this.isFinancialProcess(context, data);
                
                if (isFinancialProcess) {
                    const hasRequiredApprovals = context.sopMetadata.approvers && 
                                                context.sopMetadata.approvers.length >= 2;
                    
                    if (!hasRequiredApprovals) {
                        return {
                            status: SOPComplianceStatus.NON_COMPLIANT,
                            message: 'Financial process requires multiple approvals per SOX requirements',
                            recommendations: [
                                'Add at least two independent approvers',
                                'Implement segregation of duties',
                                'Document approval workflow'
                            ]
                        };
                    }
                }
                
                return {
                    status: SOPComplianceStatus.COMPLIANT,
                    message: 'SOX compliance requirements met'
                };
            }
        });
    }

    /**
     * Register validation rule
     */
    public registerRule(rule: SOPValidationRule): void {
        this.validationRules.set(rule.id, rule);
    }

    /**
     * Register compliance rule
     */
    public registerComplianceRule(rule: SOPComplianceRule): void {
        this.complianceRules.set(rule.id, rule);
    }

    /**
     * Validate basic SOP execution requirements
     */
    public async validateBasic(context: SOPExecutionContext, data: any): Promise<SOPValidationResult> {
        const result: SOPValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            complianceChecks: []
        };

        const basicRules = Array.from(this.validationRules.values())
            .filter(rule => rule.category === 'basic' && rule.enabled);

        for (const rule of basicRules) {
            try {
                const ruleResult = await rule.validate(context, data);
                
                if (!ruleResult.isValid) {
                    const error = {
                        field: ruleResult.field || 'unknown',
                        message: ruleResult.message || 'Validation failed',
                        code: ruleResult.code || 'VALIDATION_ERROR',
                        severity: rule.severity as 'error' | 'warning' | 'info'
                    };
                    
                    if (rule.severity === 'error') {
                        result.errors.push(error);
                        result.isValid = false;
                    } else if (rule.severity === 'warning') {
                        result.warnings.push({
                            field: error.field,
                            message: error.message,
                            code: error.code
                        });
                    }
                }
            } catch (error) {
                console.error(`Error executing validation rule ${rule.name}:`, error);
                result.errors.push({
                    field: 'validation',
                    message: `Validation rule error: ${error instanceof Error ? error.message : String(error)}`,
                    code: 'RULE_EXECUTION_ERROR',
                    severity: 'error'
                });
                result.isValid = false;
            }
        }

        return result;
    }

    /**
     * Validate compliance requirements
     */
    public async validateCompliance(context: SOPExecutionContext, data: any): Promise<SOPValidationResult> {
        const result: SOPValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            complianceChecks: []
        };

        const complianceRules = Array.from(this.complianceRules.values());

        for (const rule of complianceRules) {
            try {
                const checkResult = await rule.validate(context, data);
                
                result.complianceChecks.push({
                    rule: rule.name,
                    status: checkResult.status,
                    message: checkResult.message
                });
                
                if (checkResult.status === SOPComplianceStatus.NON_COMPLIANT) {
                    const severity = rule.severity === 'critical' ? 'error' : 'warning';
                    
                    const complianceError = {
                        field: 'compliance',
                        message: checkResult.message || `${rule.name} compliance check failed`,
                        code: `COMPLIANCE_${rule.id.toUpperCase()}`,
                        severity: severity as 'error' | 'warning' | 'info'
                    };
                    
                    if (severity === 'error') {
                        result.errors.push(complianceError);
                        result.isValid = false;
                    } else {
                        result.warnings.push({
                            field: complianceError.field,
                            message: complianceError.message,
                            code: complianceError.code
                        });
                    }
                }
            } catch (error) {
                console.error(`Error executing compliance rule ${rule.name}:`, error);
                result.errors.push({
                    field: 'compliance',
                    message: `Compliance rule error: ${error instanceof Error ? error.message : String(error)}`,
                    code: 'COMPLIANCE_RULE_ERROR',
                    severity: 'error'
                });
                result.isValid = false;
            }
        }

        return result;
    }

    /**
     * Validate custom rules
     */
    public async validateCustomRules(context: SOPExecutionContext, data: any): Promise<SOPValidationResult> {
        const result: SOPValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            complianceChecks: []
        };

        const customRules = Array.from(this.validationRules.values())
            .filter(rule => rule.category === 'custom' && rule.enabled);

        for (const rule of customRules) {
            try {
                // Check conditions first
                if (rule.conditions && !this.evaluateConditions(rule.conditions, context, data)) {
                    continue; // Skip this rule if conditions are not met
                }

                const ruleResult = await rule.validate(context, data);
                
                if (!ruleResult.isValid) {
                    const error = {
                        field: ruleResult.field || 'custom',
                        message: ruleResult.message || 'Custom validation failed',
                        code: ruleResult.code || 'CUSTOM_VALIDATION_ERROR',
                        severity: rule.severity as 'error' | 'warning' | 'info'
                    };
                    
                    if (rule.severity === 'error') {
                        result.errors.push(error);
                        result.isValid = false;
                    } else if (rule.severity === 'warning') {
                        result.warnings.push({
                            field: error.field,
                            message: error.message,
                            code: error.code
                        });
                    }
                }
            } catch (error) {
                console.error(`Error executing custom rule ${rule.name}:`, error);
            }
        }

        return result;
    }

    /**
     * Validate complete execution context
     */
    public async validateExecution(context: SOPExecutionContext): Promise<SOPValidationResult> {
        const basicResult = await this.validateBasic(context, context.variables);
        const complianceResult = await this.validateCompliance(context, context.variables);
        const customResult = await this.validateCustomRules(context, context.variables);
        
        // Combine results
        const combinedResult: SOPValidationResult = {
            isValid: basicResult.isValid && complianceResult.isValid && customResult.isValid,
            errors: [...basicResult.errors, ...complianceResult.errors, ...customResult.errors],
            warnings: [...basicResult.warnings, ...complianceResult.warnings, ...customResult.warnings],
            complianceChecks: [...basicResult.complianceChecks, ...complianceResult.complianceChecks, ...customResult.complianceChecks]
        };
        
        // Store in history
        this.validationHistory.push({
            timestamp: new Date().toISOString(),
            context: { ...context },
            result: combinedResult
        });
        
        return combinedResult;
    }

    /**
     * Evaluate validation conditions
     */
    private evaluateConditions(conditions: SOPValidationCondition[], context: SOPExecutionContext, data: any): boolean {
        return conditions.every(condition => this.evaluateCondition(condition, context, data));
    }

    /**
     * Evaluate single condition
     */
    private evaluateCondition(condition: SOPValidationCondition, context: SOPExecutionContext, data: any): boolean {
        let value: any;
        
        // Get value from context or data
        if (condition.field.startsWith('context.')) {
            const field = condition.field.substring(8);
            value = this.getNestedValue(context, field);
        } else {
            value = this.getNestedValue(data, condition.field);
        }
        
        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'notEquals':
                return value !== condition.value;
            case 'contains':
                return String(value).includes(String(condition.value));
            case 'notContains':
                return !String(value).includes(String(condition.value));
            case 'greater':
                return Number(value) > Number(condition.value);
            case 'less':
                return Number(value) < Number(condition.value);
            case 'exists':
                return value !== undefined && value !== null;
            case 'notExists':
                return value === undefined || value === null;
            default:
                return false;
        }
    }

    /**
     * Get nested value from object
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Check if data contains personal information (simplified)
     */
    private checkForPersonalData(data: any): boolean {
        if (!data || typeof data !== 'object') return false;
        
        const personalDataFields = ['email', 'firstName', 'lastName', 'phone', 'ssn', 'address'];
        const dataString = JSON.stringify(data).toLowerCase();
        
        return personalDataFields.some(field => dataString.includes(field));
    }

    /**
     * Check for consent documentation
     */
    private checkForConsent(context: SOPExecutionContext, data: any): boolean {
        // Simplified consent check
        return context.variables?.consent === true || data?.consent === true;
    }

    /**
     * Check if this is a financial process
     */
    private isFinancialProcess(context: SOPExecutionContext, data: any): boolean {
        const financialKeywords = ['payment', 'invoice', 'financial', 'accounting', 'audit', 'expense'];
        const contextString = JSON.stringify(context).toLowerCase();
        const dataString = JSON.stringify(data).toLowerCase();
        
        return financialKeywords.some(keyword => 
            contextString.includes(keyword) || dataString.includes(keyword)
        );
    }

    /**
     * Get validation rules
     */
    public getValidationRules(): SOPValidationRule[] {
        return Array.from(this.validationRules.values());
    }

    /**
     * Get compliance rules
     */
    public getComplianceRules(): SOPComplianceRule[] {
        return Array.from(this.complianceRules.values());
    }

    /**
     * Get validation history
     */
    public getValidationHistory(limit?: number): Array<{
        timestamp: string;
        context: SOPExecutionContext;
        result: SOPValidationResult;
    }> {
        const history = [...this.validationHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * Clear validation history
     */
    public clearHistory(): void {
        this.validationHistory = [];
    }

    /**
     * Get framework version
     */
    public getVersion(): string {
        return this.version;
    }
}