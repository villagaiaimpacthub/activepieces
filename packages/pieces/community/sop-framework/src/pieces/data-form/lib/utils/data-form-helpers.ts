/**
 * Data Form Helpers - Utility functions for form processing and data manipulation
 * 
 * This module provides helper functions for form generation, data transformation,
 * file handling, and integration with external systems.
 */

import {
    DataFormField,
    DataFormConfig,
    DataFormFieldType,
    ValidationRuleType,
    FormSubmissionData,
    DataFormResult,
    FormProcessingMode,
    DataFormError,
    DataFormErrorType,
    FormDisplayMode,
    FormSubmissionStatus
} from '../common/data-form-types';
import { SOPExecutionContext, SOPComplianceStatus } from '../../../../types/sop-types';
import { nanoid } from 'nanoid';

/**
 * Form generation options
 */
export interface FormGenerationOptions {
    includeMetadata?: boolean;
    generateIds?: boolean;
    validateConfiguration?: boolean;
    optimizeForPerformance?: boolean;
    includeAnalytics?: boolean;
    theme?: any;
    localization?: Record<string, string>;
}

/**
 * Data transformation options
 */
export interface DataTransformationOptions {
    sanitizeData?: boolean;
    validateTypes?: boolean;
    preserveOriginal?: boolean;
    includeMetadata?: boolean;
    encryptSensitive?: boolean;
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
    uploadPath: string;
    generateThumbnails?: boolean;
    virusScan?: boolean;
    watermark?: boolean;
}

/**
 * Data Form Helpers Class
 */
export class DataFormHelpers {
    /**
     * Generate a unique form ID
     */
    public static generateFormId(prefix: string = 'form'): string {
        return `${prefix}_${nanoid()}`;
    }

    /**
     * Generate a unique field ID
     */
    public static generateFieldId(fieldName: string, prefix: string = 'field'): string {
        const sanitizedName = fieldName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return `${prefix}_${sanitizedName}_${nanoid(8)}`;
    }

    /**
     * Generate a unique submission ID
     */
    public static generateSubmissionId(formId: string): string {
        return `${formId}_submission_${nanoid()}`;
    }

    /**
     * Create a basic form configuration
     */
    public static createBasicFormConfig(
        title: string,
        description?: string,
        options: FormGenerationOptions = {}
    ): DataFormConfig {
        const now = new Date().toISOString();
        
        return {
            id: this.generateFormId(),
            title,
            description: description || '',
            version: '1.0.0',
            fields: [],
            displayMode: FormDisplayMode.FORM,
            layout: {
                columns: 1,
                spacing: 'medium',
                responsive: true
            },
            allowDraft: true,
            allowMultipleSubmissions: false,
            requiresApproval: false,
            validateOnChange: true,
            validateOnSubmit: true,
            showValidationSummary: true,
            encryptSubmissions: false,
            tags: [],
            createdAt: now,
            updatedAt: now,
            createdBy: 'system'
        };
    }

    /**
     * Create a field configuration
     */
    public static createField(
        name: string,
        label: string,
        type: DataFormFieldType,
        required: boolean = false,
        options: Partial<DataFormField> = {}
    ): DataFormField {
        return {
            id: this.generateFieldId(name),
            name,
            label,
            type,
            required,
            disabled: false,
            readonly: false,
            hidden: false,
            validationRules: [],
            complianceRequired: false,
            auditTrail: true,
            encryptData: false,
            columnSpan: 1,
            rowSpan: 1,
            ...options
        };
    }

    /**
     * Create common field types with pre-configured settings
     */
    public static createTextField(
        name: string,
        label: string,
        required: boolean = false,
        maxLength?: number
    ): DataFormField {
        const field = this.createField(name, label, DataFormFieldType.TEXT, required);
        
        if (maxLength) {
            field.maxLength = maxLength;
            field.validationRules.push({
                id: nanoid(),
                type: ValidationRuleType.MAX_LENGTH,
                value: maxLength,
                message: `${label} cannot exceed ${maxLength} characters`,
                severity: 'error',
                conditions: []
            });
        }
        
        return field;
    }

    public static createEmailField(
        name: string = 'email',
        label: string = 'Email Address',
        required: boolean = true
    ): DataFormField {
        const field = this.createField(name, label, DataFormFieldType.EMAIL, required);
        
        field.validationRules.push({
            id: nanoid(),
            type: ValidationRuleType.EMAIL_FORMAT,
            message: `${label} must be a valid email address`,
            severity: 'error',
            conditions: []
        });
        
        return field;
    }

    public static createPhoneField(
        name: string = 'phone',
        label: string = 'Phone Number',
        required: boolean = false
    ): DataFormField {
        const field = this.createField(name, label, DataFormFieldType.PHONE, required);
        
        field.validationRules.push({
            id: nanoid(),
            type: ValidationRuleType.PHONE_FORMAT,
            message: `${label} must be a valid phone number`,
            severity: 'error',
            conditions: []
        });
        
        return field;
    }

    public static createSelectField(
        name: string,
        label: string,
        options: Array<{ label: string; value: string | number }>,
        required: boolean = false
    ): DataFormField {
        const field = this.createField(name, label, DataFormFieldType.SELECT, required);
        
        field.options = options.map(opt => ({
            label: opt.label,
            value: opt.value,
            disabled: false
        }));
        
        return field;
    }

    public static createDateField(
        name: string,
        label: string,
        required: boolean = false,
        minDate?: string,
        maxDate?: string
    ): DataFormField {
        const field = this.createField(name, label, DataFormFieldType.DATE, required);
        
        if (minDate || maxDate) {
            field.validationRules.push({
                id: nanoid(),
                type: ValidationRuleType.DATE_RANGE,
                value: [minDate, maxDate],
                message: `${label} must be within the specified date range`,
                severity: 'error',
                conditions: []
            });
        }
        
        return field;
    }

    public static createFileUploadField(
        name: string,
        label: string,
        config: Partial<FileUploadConfig>,
        required: boolean = false
    ): DataFormField {
        const field = this.createField(name, label, DataFormFieldType.FILE_UPLOAD, required);
        
        field.acceptedFileTypes = config.allowedTypes || ['*/*'];
        field.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB default
        field.maxFiles = config.maxFiles || 1;
        
        // Add file type validation
        if (config.allowedTypes) {
            field.validationRules.push({
                id: nanoid(),
                type: ValidationRuleType.FILE_TYPE,
                value: config.allowedTypes,
                message: `${label} must be one of the allowed file types: ${config.allowedTypes.join(', ')}`,
                severity: 'error',
                conditions: []
            });
        }
        
        // Add file size validation
        field.validationRules.push({
            id: nanoid(),
            type: ValidationRuleType.FILE_SIZE,
            value: field.maxFileSize,
            message: `${label} file size cannot exceed ${this.formatFileSize(field.maxFileSize)}`,
            severity: 'error',
            conditions: []
        });
        
        return field;
    }

    /**
     * Transform form data for different purposes
     */
    public static transformFormData(
        submissionData: Record<string, any>,
        fields: DataFormField[],
        options: DataTransformationOptions = {}
    ): Record<string, any> {
        const transformed: Record<string, any> = {};
        
        for (const field of fields) {
            const value = submissionData[field.name];
            
            if (value !== undefined && value !== null) {
                let transformedValue = value;
                
                // Type validation and conversion
                if (options.validateTypes) {
                    transformedValue = this.convertValueByType(value, field.type);
                }
                
                // Data sanitization
                if (options.sanitizeData) {
                    transformedValue = this.sanitizeValue(transformedValue, field.type);
                }
                
                // Encryption for sensitive data
                if (options.encryptSensitive && field.encryptData) {
                    transformedValue = this.encryptValue(transformedValue);
                }
                
                transformed[field.name] = transformedValue;
                
                // Include metadata if requested
                if (options.includeMetadata) {
                    transformed[`${field.name}_metadata`] = {
                        fieldId: field.id,
                        fieldType: field.type,
                        encrypted: field.encryptData,
                        transformedAt: new Date().toISOString()
                    };
                }
            }
        }
        
        return transformed;
    }

    /**
     * Convert value based on field type
     */
    private static convertValueByType(value: any, fieldType: DataFormFieldType): any {
        switch (fieldType) {
            case DataFormFieldType.NUMBER:
            case DataFormFieldType.CURRENCY:
            case DataFormFieldType.PERCENTAGE:
                return Number(value);
                
            case DataFormFieldType.BOOLEAN:
            case DataFormFieldType.CHECKBOX:
                return Boolean(value);
                
            case DataFormFieldType.DATE:
            case DataFormFieldType.DATETIME:
                return new Date(value).toISOString();
                
            case DataFormFieldType.JSON:
                return typeof value === 'string' ? JSON.parse(value) : value;
                
            case DataFormFieldType.MULTI_SELECT:
                return Array.isArray(value) ? value : [value];
                
            default:
                return String(value);
        }
    }

    /**
     * Sanitize value based on field type
     */
    private static sanitizeValue(value: any, fieldType: DataFormFieldType): any {
        switch (fieldType) {
            case DataFormFieldType.TEXT:
            case DataFormFieldType.LONG_TEXT:
                return String(value)
                    .replace(/<script[^>]*>.*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, '')
                    .trim();
                    
            case DataFormFieldType.EMAIL:
                return String(value).toLowerCase().trim();
                
            case DataFormFieldType.PHONE:
                return String(value).replace(/[^\d+\-\s\(\)]/g, '');
                
            case DataFormFieldType.URL:
                return String(value).trim();
                
            default:
                return value;
        }
    }

    /**
     * Basic encryption for sensitive values (use proper encryption in production)
     */
    private static encryptValue(value: any): string {
        // This is a placeholder - implement proper encryption in production
        return Buffer.from(String(value)).toString('base64');
    }

    /**
     * Format file size for display
     */
    public static formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Generate form schema for external integrations
     */
    public static generateFormSchema(config: DataFormConfig): any {
        return {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            title: config.title,
            description: config.description,
            properties: config.fields.reduce((props, field) => {
                props[field.name] = this.fieldToJsonSchema(field);
                return props;
            }, {} as Record<string, any>),
            required: config.fields.filter(f => f.required).map(f => f.name),
            additionalProperties: false
        };
    }

    /**
     * Convert field to JSON Schema property
     */
    private static fieldToJsonSchema(field: DataFormField): any {
        const schema: any = {
            title: field.label,
            description: field.description
        };

        switch (field.type) {
            case DataFormFieldType.TEXT:
            case DataFormFieldType.LONG_TEXT:
            case DataFormFieldType.EMAIL:
            case DataFormFieldType.PHONE:
            case DataFormFieldType.URL:
                schema.type = 'string';
                if (field.minLength) schema.minLength = field.minLength;
                if (field.maxLength) schema.maxLength = field.maxLength;
                if (field.pattern) schema.pattern = field.pattern;
                break;
                
            case DataFormFieldType.NUMBER:
            case DataFormFieldType.CURRENCY:
            case DataFormFieldType.PERCENTAGE:
                schema.type = 'number';
                if (field.min !== undefined) schema.minimum = field.min;
                if (field.max !== undefined) schema.maximum = field.max;
                break;
                
            case DataFormFieldType.BOOLEAN:
            case DataFormFieldType.CHECKBOX:
                schema.type = 'boolean';
                break;
                
            case DataFormFieldType.DATE:
            case DataFormFieldType.DATETIME:
                schema.type = 'string';
                schema.format = field.type === DataFormFieldType.DATE ? 'date' : 'date-time';
                break;
                
            case DataFormFieldType.SELECT:
                schema.type = 'string';
                schema.enum = field.options?.map(opt => opt.value) || [];
                break;
                
            case DataFormFieldType.MULTI_SELECT:
                schema.type = 'array';
                schema.items = {
                    type: 'string',
                    enum: field.options?.map(opt => opt.value) || []
                };
                break;
                
            case DataFormFieldType.JSON:
                schema.type = 'object';
                break;
                
            case DataFormFieldType.FILE_UPLOAD:
                schema.type = 'array';
                schema.items = {
                    type: 'object',
                    properties: {
                        fileName: { type: 'string' },
                        fileSize: { type: 'number' },
                        fileType: { type: 'string' },
                        uploadUrl: { type: 'string' }
                    }
                };
                break;
                
            default:
                schema.type = 'string';
        }

        return schema;
    }

    /**
     * Create form submission data structure
     */
    public static createSubmissionData(
        formConfig: DataFormConfig,
        submittedData: Record<string, any>,
        submittedBy: string,
        validationResults: any[] = []
    ): FormSubmissionData {
        const now = new Date().toISOString();
        
        return {
            submissionId: this.generateSubmissionId(formConfig.id),
            formId: formConfig.id,
            formVersion: formConfig.version,
            data: submittedData,
            status: FormSubmissionStatus.SUBMITTED,
            submittedBy,
            submittedAt: now,
            validationResults: validationResults.map(result => ({
                fieldId: result.fieldId,
                isValid: result.isValid,
                errors: result.errors || [],
                warnings: result.warnings || []
            })),
            auditTrail: [{
                timestamp: now,
                action: 'form_submitted',
                userId: submittedBy,
                details: {
                    formId: formConfig.id,
                    formVersion: formConfig.version,
                    fieldsSubmitted: Object.keys(submittedData).length
                }
            }]
        };
    }

    /**
     * Merge form configurations (useful for form versioning)
     */
    public static mergeFormConfigs(
        baseConfig: DataFormConfig,
        overrides: Partial<DataFormConfig>
    ): DataFormConfig {
        return {
            ...baseConfig,
            ...overrides,
            fields: overrides.fields || baseConfig.fields,
            layout: {
                ...baseConfig.layout,
                ...overrides.layout
            },
            theme: {
                ...baseConfig.theme,
                ...overrides.theme
            },
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Calculate form complexity score
     */
    public static calculateFormComplexity(config: DataFormConfig): number {
        let complexity = 0;
        
        // Base complexity from number of fields
        complexity += config.fields.length * 2;
        
        // Additional complexity for field types
        config.fields.forEach(field => {
            switch (field.type) {
                case DataFormFieldType.TEXT:
                case DataFormFieldType.EMAIL:
                case DataFormFieldType.PHONE:
                    complexity += 1;
                    break;
                case DataFormFieldType.SELECT:
                case DataFormFieldType.RADIO:
                    complexity += 2 + (field.options?.length || 0) * 0.1;
                    break;
                case DataFormFieldType.MULTI_SELECT:
                case DataFormFieldType.CHECKBOX:
                    complexity += 3 + (field.options?.length || 0) * 0.1;
                    break;
                case DataFormFieldType.FILE_UPLOAD:
                    complexity += 4;
                    break;
                case DataFormFieldType.TABLE:
                case DataFormFieldType.JSON:
                    complexity += 5;
                    break;
                case DataFormFieldType.SIGNATURE:
                    complexity += 3;
                    break;
                default:
                    complexity += 1;
            }
            
            // Additional complexity for validation rules
            complexity += field.validationRules.length * 0.5;
            
            // Additional complexity for conditional logic
            if (field.showConditions) {
                complexity += field.showConditions.length * 1.5;
            }
        });
        
        // Additional complexity for sections
        if (config.sections) {
            complexity += config.sections.length * 1.5;
        }
        
        return Math.round(complexity);
    }

    /**
     * Extract form analytics data
     */
    public static extractAnalyticsData(
        submissions: FormSubmissionData[],
        config: DataFormConfig
    ): any {
        if (submissions.length === 0) {
            return null;
        }
        
        const totalSubmissions = submissions.length;
        const completedSubmissions = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'APPROVED').length;
        
        return {
            formId: config.id,
            totalSubmissions,
            completionRate: (completedSubmissions / totalSubmissions) * 100,
            averageCompletionTime: this.calculateAverageCompletionTime(submissions),
            mostActiveFields: this.getMostActiveFields(submissions, config.fields),
            commonValidationErrors: this.getCommonValidationErrors(submissions),
            generatedAt: new Date().toISOString()
        };
    }

    private static calculateAverageCompletionTime(submissions: FormSubmissionData[]): number {
        const completionTimes = submissions
            .filter(s => s.submittedAt && s.auditTrail.length > 0)
            .map(s => {
                const startTime = new Date(s.auditTrail[0].timestamp).getTime();
                const endTime = new Date(s.submittedAt).getTime();
                return endTime - startTime;
            });
        
        return completionTimes.length > 0 ?
            completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length :
            0;
    }

    private static getMostActiveFields(
        submissions: FormSubmissionData[],
        fields: DataFormField[]
    ): Array<{ fieldName: string; completionRate: number }> {
        return fields.map(field => ({
            fieldName: field.name,
            completionRate: (submissions.filter(s => 
                s.data[field.name] !== undefined && s.data[field.name] !== null && s.data[field.name] !== ''
            ).length / submissions.length) * 100
        })).sort((a, b) => b.completionRate - a.completionRate);
    }

    private static getCommonValidationErrors(
        submissions: FormSubmissionData[]
    ): Array<{ error: string; count: number }> {
        const errorCounts = new Map<string, number>();
        
        submissions.forEach(submission => {
            submission.validationResults.forEach(result => {
                result.errors.forEach(error => {
                    const count = errorCounts.get(error) || 0;
                    errorCounts.set(error, count + 1);
                });
            });
        });
        
        return Array.from(errorCounts.entries())
            .map(([error, count]) => ({ error, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Create error object
     */
    public static createError(
        type: DataFormErrorType,
        message: string,
        fieldId?: string,
        details?: any
    ): DataFormError {
        return {
            type,
            message,
            fieldId,
            details,
            timestamp: new Date().toISOString(),
            recoverable: this.isRecoverableError(type),
            retryable: this.isRetryableError(type)
        };
    }

    private static isRecoverableError(type: DataFormErrorType): boolean {
        const recoverableErrors = [
            DataFormErrorType.VALIDATION_ERROR,
            DataFormErrorType.DATA_COLLECTION_ERROR,
            DataFormErrorType.FILE_UPLOAD_ERROR
        ];
        return recoverableErrors.includes(type);
    }

    private static isRetryableError(type: DataFormErrorType): boolean {
        const retryableErrors = [
            DataFormErrorType.STORAGE_ERROR,
            DataFormErrorType.INTEGRATION_ERROR,
            DataFormErrorType.TIMEOUT_ERROR
        ];
        return retryableErrors.includes(type);
    }
}