/**
 * Data Form Validator - Comprehensive validation engine for form data
 * 
 * This module provides advanced validation capabilities for form fields,
 * including built-in validators, custom validation functions, conditional
 * validation, and compliance checking.
 */

import {
    DataFormField,
    DataFormValidationRule,
    ValidationRuleType,
    DataFormError,
    DataFormErrorType,
    FormSubmissionData
} from '../common/data-form-types';
import { SOPValidationResult, SOPComplianceStatus } from '../../../../types/sop-types';
import { SOPValidationFramework } from '../../../../framework/sop-validation-framework';

/**
 * Field validation result
 */
export interface FieldValidationResult {
    fieldId: string;
    fieldName: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    value: any;
    sanitizedValue?: any;
}

/**
 * Form validation context
 */
export interface FormValidationContext {
    formId: string;
    formVersion: string;
    submissionId?: string;
    userId: string;
    timestamp: string;
    allFieldValues: Record<string, any>;
    previousValues?: Record<string, any>;
    complianceFrameworks?: string[];
    customValidators?: Record<string, Function>;
    validationMode: 'strict' | 'lenient' | 'compliance-only';
}

/**
 * Data Form Validator Class
 */
export class DataFormValidator {
    private sopValidationFramework: SOPValidationFramework;
    private customValidators: Map<string, Function>;
    private complianceValidators: Map<string, Function>;

    constructor() {
        this.sopValidationFramework = new SOPValidationFramework();
        this.customValidators = new Map();
        this.complianceValidators = new Map();
        this.initializeBuiltInValidators();
        this.initializeComplianceValidators();
    }

    /**
     * Initialize built-in validators
     */
    private initializeBuiltInValidators(): void {
        // Email validator
        this.customValidators.set('email', (value: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });

        // Phone validator
        this.customValidators.set('phone', (value: string) => {
            const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        });

        // URL validator
        this.customValidators.set('url', (value: string) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });

        // Credit card validator (basic Luhn algorithm)
        this.customValidators.set('creditcard', (value: string) => {
            const num = value.replace(/\s/g, '');
            if (!/^\d+$/.test(num)) return false;
            
            let sum = 0;
            let isEven = false;
            
            for (let i = num.length - 1; i >= 0; i--) {
                let digit = parseInt(num[i]);
                
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                
                sum += digit;
                isEven = !isEven;
            }
            
            return sum % 10 === 0;
        });

        // JSON validator
        this.customValidators.set('json', (value: string) => {
            try {
                JSON.parse(value);
                return true;
            } catch {
                return false;
            }
        });

        // Date range validator
        this.customValidators.set('daterange', (value: string, config: { min?: string, max?: string }) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) return false;
            
            if (config.min && date < new Date(config.min)) return false;
            if (config.max && date > new Date(config.max)) return false;
            
            return true;
        });

        // File type validator
        this.customValidators.set('filetype', (files: FileList | File[], allowedTypes: string[]) => {
            const fileArray = files instanceof FileList ? Array.from(files) : files;
            return fileArray.every(file => 
                allowedTypes.some(type => 
                    file.type.match(type.replace('*', '.*'))
                )
            );
        });

        // File size validator
        this.customValidators.set('filesize', (files: FileList | File[], maxSizeBytes: number) => {
            const fileArray = files instanceof FileList ? Array.from(files) : files;
            return fileArray.every(file => file.size <= maxSizeBytes);
        });
    }

    /**
     * Initialize compliance validators
     */
    private initializeComplianceValidators(): void {
        // GDPR compliance validator
        this.complianceValidators.set('gdpr', (field: DataFormField, value: any) => {
            // Check for personal data handling compliance
            if (field.type === 'EMAIL' || field.type === 'PHONE') {
                return field.metadata?.gdprConsent === true;
            }
            return true;
        });

        // HIPAA compliance validator
        this.complianceValidators.set('hipaa', (field: DataFormField, value: any) => {
            // Check for health information compliance
            if (field.metadata?.containsPHI) {
                return field.encryptData === true;
            }
            return true;
        });

        // PCI DSS compliance validator
        this.complianceValidators.set('pci', (field: DataFormField, value: any) => {
            // Check for payment card data compliance
            if (field.type === 'CURRENCY' || field.metadata?.containsCardData) {
                return field.encryptData === true && field.metadata?.pciCompliant === true;
            }
            return true;
        });

        // SOX compliance validator
        this.complianceValidators.set('sox', (field: DataFormField, value: any) => {
            // Check for financial reporting compliance
            if (field.metadata?.financialData) {
                return field.auditTrail === true && field.metadata?.soxCompliant === true;
            }
            return true;
        });
    }

    /**
     * Register custom validator
     */
    public registerValidator(name: string, validator: Function): void {
        this.customValidators.set(name, validator);
    }

    /**
     * Register compliance validator
     */
    public registerComplianceValidator(framework: string, validator: Function): void {
        this.complianceValidators.set(framework, validator);
    }

    /**
     * Validate a single field
     */
    public async validateField(
        field: DataFormField,
        value: any,
        context: FormValidationContext
    ): Promise<FieldValidationResult> {
        const result: FieldValidationResult = {
            fieldId: field.id,
            fieldName: field.name,
            isValid: true,
            errors: [],
            warnings: [],
            value: value
        };

        try {
            // Skip validation if field is disabled or hidden
            if (field.disabled || field.hidden) {
                return result;
            }

            // Check field conditions
            if (field.showConditions && !this.evaluateConditions(field.showConditions, context.allFieldValues)) {
                return result; // Field not shown, skip validation
            }

            // Apply validation rules
            for (const rule of field.validationRules) {
                const ruleResult = await this.validateRule(rule, field, value, context);
                
                if (!ruleResult.isValid) {
                    result.isValid = false;
                    if (ruleResult.severity === 'error') {
                        result.errors.push(ruleResult.message);
                    } else {
                        result.warnings.push(ruleResult.message);
                    }
                }
            }

            // Apply built-in type validation
            const typeValidation = await this.validateFieldType(field, value);
            if (!typeValidation.isValid) {
                result.isValid = false;
                result.errors.push(...typeValidation.errors);
            }

            // Sanitize value if validation passed
            if (result.isValid) {
                result.sanitizedValue = this.sanitizeValue(field, value);
            }

        } catch (error) {
            result.isValid = false;
            result.errors.push(`Validation error: ${error.message}`);
        }

        return result;
    }

    /**
     * Validate entire form
     */
    public async validateForm(
        fields: DataFormField[],
        submissionData: Record<string, any>,
        context: FormValidationContext
    ): Promise<SOPValidationResult> {
        const fieldResults: FieldValidationResult[] = [];
        const complianceChecks: any[] = [];

        // Validate each field
        for (const field of fields) {
            const fieldValue = submissionData[field.name];
            const fieldResult = await this.validateField(field, fieldValue, {
                ...context,
                allFieldValues: submissionData
            });
            fieldResults.push(fieldResult);
        }

        // Run compliance checks if required
        if (context.complianceFrameworks) {
            for (const framework of context.complianceFrameworks) {
                const complianceResult = await this.validateCompliance(
                    framework,
                    fields,
                    submissionData,
                    context
                );
                complianceChecks.push(complianceResult);
            }
        }

        // Run cross-field validation
        const crossFieldValidation = await this.validateCrossFieldRules(fields, submissionData, context);
        
        // Combine all results
        const allErrors = fieldResults
            .filter(r => !r.isValid)
            .flatMap(r => r.errors.map(error => ({
                field: r.fieldName,
                message: error,
                code: 'VALIDATION_ERROR',
                severity: 'error' as const
            })));

        const allWarnings = fieldResults
            .flatMap(r => r.warnings.map(warning => ({
                field: r.fieldName,
                message: warning,
                code: 'VALIDATION_WARNING'
            })));

        // Add cross-field validation errors
        allErrors.push(...crossFieldValidation.errors);
        allWarnings.push(...crossFieldValidation.warnings);

        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            complianceChecks
        };
    }

    /**
     * Validate a single validation rule
     */
    private async validateRule(
        rule: DataFormValidationRule,
        field: DataFormField,
        value: any,
        context: FormValidationContext
    ): Promise<{ isValid: boolean; severity: string; message: string }> {
        // Check rule conditions
        if (rule.conditions && !this.evaluateConditions(rule.conditions, context.allFieldValues)) {
            return { isValid: true, severity: rule.severity, message: rule.message };
        }

        let isValid = true;

        switch (rule.type) {
            case ValidationRuleType.REQUIRED:
                isValid = this.validateRequired(value);
                break;

            case ValidationRuleType.MIN_LENGTH:
                isValid = this.validateMinLength(value, rule.value as number);
                break;

            case ValidationRuleType.MAX_LENGTH:
                isValid = this.validateMaxLength(value, rule.value as number);
                break;

            case ValidationRuleType.MIN_VALUE:
                isValid = this.validateMinValue(value, rule.value as number);
                break;

            case ValidationRuleType.MAX_VALUE:
                isValid = this.validateMaxValue(value, rule.value as number);
                break;

            case ValidationRuleType.PATTERN:
                isValid = this.validatePattern(value, rule.value as string);
                break;

            case ValidationRuleType.EMAIL_FORMAT:
                isValid = this.customValidators.get('email')!(value);
                break;

            case ValidationRuleType.PHONE_FORMAT:
                isValid = this.customValidators.get('phone')!(value);
                break;

            case ValidationRuleType.URL_FORMAT:
                isValid = this.customValidators.get('url')!(value);
                break;

            case ValidationRuleType.DATE_RANGE:
                isValid = this.customValidators.get('daterange')!(value, rule.value);
                break;

            case ValidationRuleType.FILE_TYPE:
                isValid = this.customValidators.get('filetype')!(value, rule.value as string[]);
                break;

            case ValidationRuleType.FILE_SIZE:
                isValid = this.customValidators.get('filesize')!(value, rule.value as number);
                break;

            case ValidationRuleType.CUSTOM:
                if (rule.customFunction) {
                    isValid = await this.evaluateCustomValidation(
                        rule.customFunction,
                        value,
                        context.allFieldValues,
                        context
                    );
                }
                break;

            case ValidationRuleType.UNIQUE:
                isValid = await this.validateUniqueness(field, value, context);
                break;

            case ValidationRuleType.DEPENDENT:
                isValid = this.validateDependentField(field, value, context.allFieldValues, rule.value);
                break;

            case ValidationRuleType.CONDITIONAL:
                isValid = this.validateConditionalRule(field, value, context.allFieldValues, rule.value);
                break;

            default:
                throw new Error(`Unknown validation rule type: ${rule.type}`);
        }

        return {
            isValid,
            severity: rule.severity,
            message: rule.message
        };
    }

    /**
     * Validate field type
     */
    private async validateFieldType(
        field: DataFormField,
        value: any
    ): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        if (value === null || value === undefined || value === '') {
            if (field.required) {
                errors.push(`${field.label} is required`);
            }
            return { isValid: errors.length === 0, errors };
        }

        switch (field.type) {
            case 'NUMBER':
                if (isNaN(Number(value))) {
                    errors.push(`${field.label} must be a valid number`);
                }
                break;

            case 'EMAIL':
                if (!this.customValidators.get('email')!(value)) {
                    errors.push(`${field.label} must be a valid email address`);
                }
                break;

            case 'PHONE':
                if (!this.customValidators.get('phone')!(value)) {
                    errors.push(`${field.label} must be a valid phone number`);
                }
                break;

            case 'URL':
                if (!this.customValidators.get('url')!(value)) {
                    errors.push(`${field.label} must be a valid URL`);
                }
                break;

            case 'DATE':
            case 'DATETIME':
                if (isNaN(new Date(value).getTime())) {
                    errors.push(`${field.label} must be a valid date`);
                }
                break;

            case 'JSON':
                if (!this.customValidators.get('json')!(value)) {
                    errors.push(`${field.label} must be valid JSON`);
                }
                break;

            case 'BOOLEAN':
                if (typeof value !== 'boolean') {
                    errors.push(`${field.label} must be true or false`);
                }
                break;

            // Add more type validations as needed
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Basic validation methods
     */
    private validateRequired(value: any): boolean {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }

    private validateMinLength(value: any, minLength: number): boolean {
        if (value === null || value === undefined) return true;
        return String(value).length >= minLength;
    }

    private validateMaxLength(value: any, maxLength: number): boolean {
        if (value === null || value === undefined) return true;
        return String(value).length <= maxLength;
    }

    private validateMinValue(value: any, minValue: number): boolean {
        if (value === null || value === undefined) return true;
        return Number(value) >= minValue;
    }

    private validateMaxValue(value: any, maxValue: number): boolean {
        if (value === null || value === undefined) return true;
        return Number(value) <= maxValue;
    }

    private validatePattern(value: any, pattern: string): boolean {
        if (value === null || value === undefined) return true;
        return new RegExp(pattern).test(String(value));
    }

    /**
     * Evaluate conditions for conditional logic
     */
    private evaluateConditions(
        conditions: Array<{ field: string; operator: string; value: any }>,
        formData: Record<string, any>
    ): boolean {
        return conditions.every(condition => {
            const fieldValue = formData[condition.field];
            
            switch (condition.operator) {
                case 'equals':
                    return fieldValue === condition.value;
                case 'not_equals':
                    return fieldValue !== condition.value;
                case 'greater_than':
                    return Number(fieldValue) > Number(condition.value);
                case 'less_than':
                    return Number(fieldValue) < Number(condition.value);
                case 'contains':
                    return String(fieldValue).includes(String(condition.value));
                case 'exists':
                    return fieldValue !== null && fieldValue !== undefined;
                default:
                    return false;
            }
        });
    }

    /**
     * Evaluate custom validation function
     */
    private async evaluateCustomValidation(
        customFunction: string,
        value: any,
        formData: Record<string, any>,
        context: FormValidationContext
    ): Promise<boolean> {
        try {
            // Create safe evaluation context
            const evalContext = {
                value,
                formData,
                context,
                // Add utility functions
                isEmail: this.customValidators.get('email'),
                isPhone: this.customValidators.get('phone'),
                isUrl: this.customValidators.get('url')
            };

            // Evaluate custom function
            const result = new Function('ctx', `
                const { value, formData, context, isEmail, isPhone, isUrl } = ctx;
                return ${customFunction};
            `)(evalContext);

            return Boolean(result);
        } catch (error) {
            throw new Error(`Custom validation function failed: ${error.message}`);
        }
    }

    /**
     * Validate uniqueness (would typically check against database)
     */
    private async validateUniqueness(
        field: DataFormField,
        value: any,
        context: FormValidationContext
    ): Promise<boolean> {
        // In a real implementation, this would check against a database or external service
        // For now, we'll simulate the check
        return true; // Placeholder - implement actual uniqueness check
    }

    /**
     * Validate dependent field rules
     */
    private validateDependentField(
        field: DataFormField,
        value: any,
        formData: Record<string, any>,
        dependencyConfig: any
    ): boolean {
        const dependentField = dependencyConfig.field;
        const dependentValue = formData[dependentField];
        
        // Simple dependency validation - can be extended
        if (dependencyConfig.requiresValue && !dependentValue) {
            return false;
        }
        
        return true;
    }

    /**
     * Validate conditional rules
     */
    private validateConditionalRule(
        field: DataFormField,
        value: any,
        formData: Record<string, any>,
        conditionConfig: any
    ): boolean {
        // Evaluate condition and apply validation accordingly
        const conditionMet = this.evaluateConditions(conditionConfig.conditions, formData);
        
        if (conditionMet) {
            // Apply conditional validation logic
            return conditionConfig.validation ? 
                this.evaluateConditions([conditionConfig.validation], { ...formData, [field.name]: value }) :
                true;
        }
        
        return true;
    }

    /**
     * Validate cross-field rules
     */
    private async validateCrossFieldRules(
        fields: DataFormField[],
        submissionData: Record<string, any>,
        context: FormValidationContext
    ): Promise<{ errors: any[]; warnings: any[] }> {
        const errors: any[] = [];
        const warnings: any[] = [];

        // Example cross-field validations
        // Password confirmation
        const passwordField = fields.find(f => f.name === 'password');
        const confirmPasswordField = fields.find(f => f.name === 'confirmPassword');
        
        if (passwordField && confirmPasswordField) {
            const password = submissionData.password;
            const confirmPassword = submissionData.confirmPassword;
            
            if (password && confirmPassword && password !== confirmPassword) {
                errors.push({
                    field: 'confirmPassword',
                    message: 'Password confirmation does not match password',
                    code: 'PASSWORD_MISMATCH',
                    severity: 'error'
                });
            }
        }

        // Date range validation
        const startDateField = fields.find(f => f.name === 'startDate');
        const endDateField = fields.find(f => f.name === 'endDate');
        
        if (startDateField && endDateField) {
            const startDate = new Date(submissionData.startDate);
            const endDate = new Date(submissionData.endDate);
            
            if (startDate && endDate && startDate > endDate) {
                errors.push({
                    field: 'endDate',
                    message: 'End date must be after start date',
                    code: 'DATE_RANGE_INVALID',
                    severity: 'error'
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Validate compliance requirements
     */
    private async validateCompliance(
        framework: string,
        fields: DataFormField[],
        submissionData: Record<string, any>,
        context: FormValidationContext
    ): Promise<any> {
        const validator = this.complianceValidators.get(framework.toLowerCase());
        
        if (!validator) {
            return {
                rule: framework,
                status: SOPComplianceStatus.EXEMPT,
                message: `No validator found for compliance framework: ${framework}`
            };
        }

        const complianceResults = [];
        
        for (const field of fields) {
            if (field.complianceRequired) {
                const fieldValue = submissionData[field.name];
                const isCompliant = validator(field, fieldValue);
                
                complianceResults.push({
                    field: field.name,
                    compliant: isCompliant,
                    framework
                });
            }
        }

        const overallCompliant = complianceResults.every(r => r.compliant);
        
        return {
            rule: framework,
            status: overallCompliant ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            message: overallCompliant ? 
                `Form is compliant with ${framework}` : 
                `Form has compliance violations for ${framework}`,
            details: complianceResults
        };
    }

    /**
     * Sanitize field value
     */
    private sanitizeValue(field: DataFormField, value: any): any {
        if (value === null || value === undefined) {
            return value;
        }

        switch (field.type) {
            case 'TEXT':
            case 'LONG_TEXT':
                // Basic HTML sanitization (in production, use a proper sanitization library)
                return String(value)
                    .replace(/<script[^>]*>.*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, '')
                    .trim();

            case 'EMAIL':
                return String(value).toLowerCase().trim();

            case 'PHONE':
                return String(value).replace(/[^\d+]/g, '');

            case 'NUMBER':
                return Number(value);

            case 'BOOLEAN':
                return Boolean(value);

            case 'JSON':
                try {
                    return JSON.parse(String(value));
                } catch {
                    return value;
                }

            default:
                return value;
        }
    }

    /**
     * Generate validation report
     */
    public generateValidationReport(
        validationResult: SOPValidationResult,
        fields: DataFormField[]
    ): any {
        return {
            summary: {
                isValid: validationResult.isValid,
                totalErrors: validationResult.errors.length,
                totalWarnings: validationResult.warnings.length,
                complianceChecks: validationResult.complianceChecks.length
            },
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            complianceResults: validationResult.complianceChecks,
            fieldSummary: fields.map(field => ({
                fieldId: field.id,
                fieldName: field.name,
                fieldType: field.type,
                required: field.required,
                hasErrors: validationResult.errors.some(e => e.field === field.name),
                hasWarnings: validationResult.warnings.some(w => w.field === field.name)
            })),
            generatedAt: new Date().toISOString()
        };
    }
}