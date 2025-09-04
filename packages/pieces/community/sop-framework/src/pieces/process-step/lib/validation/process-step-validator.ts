/**
 * Process Step Validator - Comprehensive validation for Process Step pieces
 */

import { 
    ProcessStepConfig, 
    ProcessStepError, 
    ProcessStepErrorType,
    StepValidationContext 
} from '../common/process-step-types';
import {
    SOPValidationResult,
    SOPExecutionContext,
    SOPComplianceStatus
} from '../../../../types/sop-types';
import { ProcessStepValidator as BaseValidator } from '../utils/process-step-helpers';

/**
 * Enhanced Process Step Validator with SOP-specific validations
 */
export class ProcessStepValidator {
    private static readonly MAX_TITLE_LENGTH = 200;
    private static readonly MAX_INSTRUCTIONS_LENGTH = 10000;
    private static readonly MIN_ESTIMATED_DURATION = 1;
    private static readonly MAX_ESTIMATED_DURATION = 10080; // 1 week in minutes

    /**
     * Comprehensive step validation
     */
    static async validateProcessStep(
        context: StepValidationContext
    ): Promise<SOPValidationResult> {
        const errors: any[] = [];
        const warnings: any[] = [];
        const complianceChecks: any[] = [];

        try {
            // Basic configuration validation
            const configErrors = this.validateStepConfiguration(context.stepConfig);
            errors.push(...configErrors);

            // Input data validation
            const inputErrors = this.validateInputData(
                context.inputData,
                context.stepConfig.inputSchema
            );
            errors.push(...inputErrors);

            // Context validation
            const contextErrors = this.validateExecutionContext(context.executionContext);
            errors.push(...contextErrors);

            // Custom rules validation
            if (context.customRules && !context.skipValidation) {
                const customErrors = await this.validateCustomRules(
                    context.inputData,
                    context.customRules
                );
                errors.push(...customErrors);
            }

            // Compliance validation
            const complianceResult = this.validateCompliance(context);
            complianceChecks.push(...complianceResult.checks);
            if (complianceResult.errors.length > 0) {
                errors.push(...complianceResult.errors);
            }

            // Security validation
            const securityWarnings = this.validateSecurity(context);
            warnings.push(...securityWarnings);

            // Performance validation
            const performanceWarnings = this.validatePerformance(context.stepConfig);
            warnings.push(...performanceWarnings);

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                complianceChecks
            };

        } catch (error: any) {
            return {
                isValid: false,
                errors: [{
                    field: 'validation_system',
                    message: `Validation system error: ${error.message}`,
                    code: 'VALIDATION_SYSTEM_ERROR',
                    severity: 'error' as const
                }],
                warnings: [],
                complianceChecks: []
            };
        }
    }

    /**
     * Validate step configuration
     */
    private static validateStepConfiguration(config: ProcessStepConfig): any[] {
        const errors: any[] = [];

        // Title validation
        if (!config.title || config.title.trim().length === 0) {
            errors.push({
                field: 'stepTitle',
                message: 'Step title is required',
                code: 'MISSING_TITLE',
                severity: 'error' as const
            });
        } else if (config.title.length > this.MAX_TITLE_LENGTH) {
            errors.push({
                field: 'stepTitle',
                message: `Step title must be ${this.MAX_TITLE_LENGTH} characters or less`,
                code: 'TITLE_TOO_LONG',
                severity: 'error' as const
            });
        }

        // Instructions validation
        if (!config.instructions || config.instructions.trim().length === 0) {
            errors.push({
                field: 'instructions',
                message: 'Step instructions are required',
                code: 'MISSING_INSTRUCTIONS',
                severity: 'error' as const
            });
        } else if (config.instructions.length > this.MAX_INSTRUCTIONS_LENGTH) {
            errors.push({
                field: 'instructions',
                message: `Instructions must be ${this.MAX_INSTRUCTIONS_LENGTH} characters or less`,
                code: 'INSTRUCTIONS_TOO_LONG',
                severity: 'error' as const
            });
        }

        // Duration validation
        if (config.estimatedDuration !== undefined) {
            if (config.estimatedDuration < this.MIN_ESTIMATED_DURATION) {
                errors.push({
                    field: 'estimatedDuration',
                    message: `Estimated duration must be at least ${this.MIN_ESTIMATED_DURATION} minute`,
                    code: 'DURATION_TOO_SHORT',
                    severity: 'error' as const
                });
            } else if (config.estimatedDuration > this.MAX_ESTIMATED_DURATION) {
                errors.push({
                    field: 'estimatedDuration',
                    message: `Estimated duration cannot exceed ${this.MAX_ESTIMATED_DURATION} minutes`,
                    code: 'DURATION_TOO_LONG',
                    severity: 'error' as const
                });
            }
        }

        // Validation rules format check
        if (config.validationRules && Array.isArray(config.validationRules)) {
            for (let i = 0; i < config.validationRules.length; i++) {
                if (typeof config.validationRules[i] !== 'string') {
                    errors.push({
                        field: 'validationRules',
                        message: `Validation rule at index ${i} must be a string`,
                        code: 'INVALID_VALIDATION_RULE',
                        severity: 'error' as const
                    });
                }
            }
        }

        return errors;
    }

    /**
     * Validate input data
     */
    private static validateInputData(inputData: any, schema?: any): any[] {
        const errors: any[] = [];

        if (inputData === null || inputData === undefined) {
            return []; // Input data is optional
        }

        // Basic type check
        if (typeof inputData !== 'object' || Array.isArray(inputData)) {
            errors.push({
                field: 'inputData',
                message: 'Input data must be an object',
                code: 'INVALID_INPUT_TYPE',
                severity: 'error' as const
            });
            return errors;
        }

        // Schema validation
        if (schema) {
            const schemaErrors = this.validateAgainstSchema(inputData, schema);
            errors.push(...schemaErrors);
        }

        // Size check
        try {
            const dataSize = JSON.stringify(inputData).length;
            const MAX_SIZE = 1024 * 1024; // 1MB limit
            if (dataSize > MAX_SIZE) {
                errors.push({
                    field: 'inputData',
                    message: `Input data size (${dataSize} bytes) exceeds maximum allowed (${MAX_SIZE} bytes)`,
                    code: 'INPUT_DATA_TOO_LARGE',
                    severity: 'error' as const
                });
            }
        } catch (error) {
            errors.push({
                field: 'inputData',
                message: 'Input data contains circular references or invalid JSON',
                code: 'INVALID_INPUT_DATA',
                severity: 'error' as const
            });
        }

        return errors;
    }

    /**
     * Validate against JSON schema (simplified)
     */
    private static validateAgainstSchema(data: any, schema: any): any[] {
        const errors: any[] = [];

        if (!schema || typeof schema !== 'object') {
            return errors;
        }

        // Check required fields
        if (schema.required && Array.isArray(schema.required)) {
            for (const field of schema.required) {
                if (!(field in data) || data[field] === null || data[field] === undefined) {
                    errors.push({
                        field: 'inputData',
                        message: `Required field '${field}' is missing`,
                        code: 'MISSING_REQUIRED_FIELD',
                        severity: 'error' as const
                    });
                }
            }
        }

        // Check field types (basic validation)
        if (schema.properties) {
            for (const [field, fieldSchema] of Object.entries(schema.properties as Record<string, any>)) {
                if (field in data && fieldSchema.type) {
                    const actualType = typeof data[field];
                    const expectedType = fieldSchema.type;
                    
                    if (this.getJSType(actualType) !== expectedType) {
                        errors.push({
                            field: 'inputData',
                            message: `Field '${field}' has type '${actualType}' but expected '${expectedType}'`,
                            code: 'INVALID_FIELD_TYPE',
                            severity: 'error' as const
                        });
                    }
                }
            }
        }

        return errors;
    }

    /**
     * Map JavaScript types to JSON schema types
     */
    private static getJSType(jsType: string): string {
        const typeMap: Record<string, string> = {
            'string': 'string',
            'number': 'number',
            'boolean': 'boolean',
            'object': 'object'
        };
        return typeMap[jsType] || 'unknown';
    }

    /**
     * Validate execution context
     */
    private static validateExecutionContext(context: SOPExecutionContext): any[] {
        const errors: any[] = [];

        if (!context.executionId) {
            errors.push({
                field: 'executionContext',
                message: 'Execution ID is required',
                code: 'MISSING_EXECUTION_ID',
                severity: 'error' as const
            });
        }

        if (!context.executedBy) {
            errors.push({
                field: 'executionContext',
                message: 'Executed by user ID is required',
                code: 'MISSING_EXECUTED_BY',
                severity: 'error' as const
            });
        }

        if (!context.sopMetadata || !context.sopMetadata.sopId) {
            errors.push({
                field: 'executionContext',
                message: 'SOP metadata with SOP ID is required',
                code: 'MISSING_SOP_METADATA',
                severity: 'error' as const
            });
        }

        // Validate audit trail structure
        if (!Array.isArray(context.auditTrail)) {
            errors.push({
                field: 'executionContext',
                message: 'Audit trail must be an array',
                code: 'INVALID_AUDIT_TRAIL',
                severity: 'error' as const
            });
        }

        return errors;
    }

    /**
     * Validate custom rules
     */
    private static async validateCustomRules(
        inputData: any,
        customRules: string[]
    ): Promise<any[]> {
        const errors: any[] = [];

        for (const rule of customRules) {
            try {
                const ruleResult = await this.evaluateCustomRule(inputData, rule);
                if (!ruleResult.passed) {
                    errors.push({
                        field: 'inputData',
                        message: ruleResult.message || `Custom rule failed: ${rule}`,
                        code: 'CUSTOM_RULE_FAILED',
                        severity: 'error' as const
                    });
                }
            } catch (error: any) {
                errors.push({
                    field: 'customRules',
                    message: `Error evaluating custom rule '${rule}': ${error.message}`,
                    code: 'CUSTOM_RULE_ERROR',
                    severity: 'error' as const
                });
            }
        }

        return errors;
    }

    /**
     * Evaluate custom rule (simplified implementation)
     */
    private static async evaluateCustomRule(
        data: any,
        rule: string
    ): Promise<{ passed: boolean; message?: string }> {
        const lowerRule = rule.toLowerCase().trim();

        // Built-in rule patterns
        if (lowerRule === 'data_not_empty') {
            return {
                passed: data && Object.keys(data).length > 0,
                message: 'Input data cannot be empty'
            };
        }

        if (lowerRule.startsWith('required_field:')) {
            const fieldName = rule.substring(15).trim();
            return {
                passed: data && fieldName in data && data[fieldName] !== null && data[fieldName] !== undefined,
                message: `Field '${fieldName}' is required`
            };
        }

        if (lowerRule.startsWith('min_length:')) {
            const parts = rule.split(':');
            if (parts.length === 3) {
                const fieldName = parts[1].trim();
                const minLength = parseInt(parts[2].trim(), 10);
                const fieldValue = data?.[fieldName];
                
                if (typeof fieldValue === 'string') {
                    return {
                        passed: fieldValue.length >= minLength,
                        message: `Field '${fieldName}' must be at least ${minLength} characters long`
                    };
                }
            }
        }

        // Default: rule passes (unknown rules are ignored)
        return { passed: true };
    }

    /**
     * Validate compliance requirements
     */
    private static validateCompliance(context: StepValidationContext): {
        checks: any[];
        errors: any[];
    } {
        const checks: any[] = [];
        const errors: any[] = [];

        // Basic compliance check
        checks.push({
            rule: 'audit_trail_enabled',
            status: context.executionContext.auditTrail ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            message: context.executionContext.auditTrail ? 'Audit trail is enabled' : 'Audit trail is required for compliance'
        });

        // Step configuration compliance
        checks.push({
            rule: 'step_instructions_provided',
            status: context.stepConfig.instructions ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            message: context.stepConfig.instructions ? 'Step instructions are provided' : 'Step instructions are required'
        });

        // Required permissions check
        if (context.stepConfig.requiredPermissions && context.stepConfig.requiredPermissions.length > 0) {
            checks.push({
                rule: 'required_permissions_defined',
                status: SOPComplianceStatus.COMPLIANT,
                message: `Required permissions defined: ${context.stepConfig.requiredPermissions.join(', ')}`
            });
        }

        // Add errors for non-compliant checks
        for (const check of checks) {
            if (check.status === SOPComplianceStatus.NON_COMPLIANT) {
                errors.push({
                    field: 'compliance',
                    message: check.message,
                    code: `COMPLIANCE_${check.rule.toUpperCase()}`,
                    severity: 'error' as const
                });
            }
        }

        return { checks, errors };
    }

    /**
     * Validate security requirements
     */
    private static validateSecurity(context: StepValidationContext): any[] {
        const warnings: any[] = [];

        // Check for sensitive data patterns in input
        if (context.inputData && typeof context.inputData === 'object') {
            const sensitiveFields = this.detectSensitiveFields(context.inputData);
            if (sensitiveFields.length > 0) {
                warnings.push({
                    field: 'inputData',
                    message: `Potentially sensitive fields detected: ${sensitiveFields.join(', ')}`,
                    code: 'SENSITIVE_DATA_WARNING'
                });
            }
        }

        // Check for required permissions
        if (!context.stepConfig.requiredPermissions || context.stepConfig.requiredPermissions.length === 0) {
            warnings.push({
                field: 'requiredPermissions',
                message: 'No required permissions specified - consider adding permission checks',
                code: 'NO_PERMISSIONS_WARNING'
            });
        }

        return warnings;
    }

    /**
     * Detect sensitive field patterns
     */
    private static detectSensitiveFields(data: any): string[] {
        const sensitivePatterns = [
            /password/i,
            /secret/i,
            /token/i,
            /key/i,
            /credential/i,
            /ssn/i,
            /social.*security/i,
            /credit.*card/i,
            /bank.*account/i
        ];

        const sensitiveFields: string[] = [];
        
        for (const key in data) {
            if (sensitivePatterns.some(pattern => pattern.test(key))) {
                sensitiveFields.push(key);
            }
        }

        return sensitiveFields;
    }

    /**
     * Validate performance characteristics
     */
    private static validatePerformance(config: ProcessStepConfig): any[] {
        const warnings: any[] = [];

        // Long duration warning
        if (config.estimatedDuration && config.estimatedDuration > 480) { // > 8 hours
            warnings.push({
                field: 'estimatedDuration',
                message: `Long duration step (${config.estimatedDuration} minutes) - consider breaking into smaller steps`,
                code: 'LONG_DURATION_WARNING'
            });
        }

        // Complex validation rules warning
        if (config.validationRules && config.validationRules.length > 10) {
            warnings.push({
                field: 'validationRules',
                message: `Many validation rules (${config.validationRules.length}) may impact performance`,
                code: 'MANY_VALIDATION_RULES_WARNING'
            });
        }

        return warnings;
    }
}