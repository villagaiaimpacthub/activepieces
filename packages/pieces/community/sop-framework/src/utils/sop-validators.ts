/**
 * SOP Validation Utilities
 */

import {
    SOPExecutionContext,
    SOPMetadata,
    SOPExecutionState,
    SOPPriority,
    SOPComplianceStatus
} from '../types/sop-types';
import { SOP_REGEX } from '../constants/sop-constants';

/**
 * Validation Result Interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate SOP Metadata
 */
export function validateSOPMetadata(metadata: SOPMetadata): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // Required fields
    if (!metadata.sopId) {
        result.errors.push('SOP ID is required');
    } else if (!SOP_REGEX.SOP_ID.test(metadata.sopId)) {
        result.errors.push('SOP ID format is invalid');
    }

    if (!metadata.title || metadata.title.trim().length === 0) {
        result.errors.push('SOP title is required');
    }

    if (!metadata.createdBy) {
        result.errors.push('Creator information is required');
    }

    if (!metadata.version) {
        result.errors.push('Version is required');
    } else if (!SOP_REGEX.VERSION.test(metadata.version)) {
        result.errors.push('Version format should be semantic (e.g., 1.0.0)');
    }

    // Date validations
    try {
        new Date(metadata.createdAt);
    } catch {
        result.errors.push('Invalid created date format');
    }

    try {
        new Date(metadata.updatedAt);
    } catch {
        result.errors.push('Invalid updated date format');
    }

    // Warnings for optional but recommended fields
    if (!metadata.description || metadata.description.trim().length === 0) {
        result.warnings.push('SOP description is recommended for better documentation');
    }

    if (!metadata.department) {
        result.warnings.push('Department assignment is recommended for better organization');
    }

    if (!metadata.tags || metadata.tags.length === 0) {
        result.warnings.push('Tags are recommended for better categorization');
    }

    // Consistency checks
    const createdDate = new Date(metadata.createdAt);
    const updatedDate = new Date(metadata.updatedAt);
    if (createdDate > updatedDate) {
        result.errors.push('Updated date cannot be before created date');
    }

    if (metadata.complianceRequired && (!metadata.approvers || metadata.approvers.length === 0)) {
        result.warnings.push('Compliance-required SOPs should have designated approvers');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Execution Context
 */
export function validateExecutionContext(context: SOPExecutionContext): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // Required fields
    if (!context.executionId) {
        result.errors.push('Execution ID is required');
    }

    if (!context.sopMetadata) {
        result.errors.push('SOP metadata is required');
    } else {
        const metadataValidation = validateSOPMetadata(context.sopMetadata);
        result.errors.push(...metadataValidation.errors.map(e => `Metadata: ${e}`));
        result.warnings.push(...metadataValidation.warnings.map(w => `Metadata: ${w}`));
    }

    if (!context.executedBy) {
        result.errors.push('Executor information is required');
    }

    // State validation
    if (!Object.values(SOPExecutionState).includes(context.currentState)) {
        result.errors.push('Invalid execution state');
    }

    // Date validations
    try {
        new Date(context.startedAt);
    } catch {
        result.errors.push('Invalid start date format');
    }

    if (context.completedAt) {
        try {
            const completedDate = new Date(context.completedAt);
            const startDate = new Date(context.startedAt);
            if (completedDate < startDate) {
                result.errors.push('Completion date cannot be before start date');
            }
        } catch {
            result.errors.push('Invalid completion date format');
        }
    }

    // Audit trail validation
    if (context.sopMetadata?.auditTrailRequired && context.auditTrail.length === 0) {
        result.errors.push('Audit trail is required but empty');
    }

    // Validate audit trail chronological order
    for (let i = 1; i < context.auditTrail.length; i++) {
        const prevTime = new Date(context.auditTrail[i - 1].timestamp);
        const currTime = new Date(context.auditTrail[i].timestamp);
        if (currTime < prevTime) {
            result.errors.push('Audit trail entries are not in chronological order');
        }
    }

    // Compliance validation
    if (!Object.values(SOPComplianceStatus).includes(context.complianceStatus)) {
        result.errors.push('Invalid compliance status');
    }

    // Escalation level validation
    if (context.escalationLevel < 0 || context.escalationLevel > 5) {
        result.warnings.push('Unusual escalation level (typically 0-5)');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate User Assignment
 */
export function validateUserAssignment(assignedTo?: string, executedBy?: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (assignedTo && !executedBy) {
        result.warnings.push('Step is assigned but no executor specified');
    }

    if (executedBy && assignedTo && executedBy !== assignedTo) {
        result.warnings.push('Executor differs from assigned user - may require authorization');
    }

    // User ID format validation (basic)
    if (assignedTo && !SOP_REGEX.USER_ID.test(assignedTo)) {
        result.errors.push('Assigned user ID format is invalid');
    }

    if (executedBy && !SOP_REGEX.USER_ID.test(executedBy)) {
        result.errors.push('Executor user ID format is invalid');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Priority Level
 */
export function validatePriority(priority: SOPPriority): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!Object.values(SOPPriority).includes(priority)) {
        result.errors.push('Invalid priority level');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Timeout Configuration
 */
export function validateTimeout(timeout: number): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (timeout < 0) {
        result.errors.push('Timeout cannot be negative');
    }

    if (timeout === 0) {
        result.warnings.push('Zero timeout means no timeout limit');
    }

    if (timeout > 86400000) { // 24 hours in milliseconds
        result.warnings.push('Timeout exceeds 24 hours - consider if this is intentional');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Retry Configuration
 */
export function validateRetryConfig(maxAttempts: number, delay: number): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (maxAttempts < 0) {
        result.errors.push('Max retry attempts cannot be negative');
    }

    if (maxAttempts > 10) {
        result.warnings.push('High retry count may cause excessive delays');
    }

    if (delay < 0) {
        result.errors.push('Retry delay cannot be negative');
    }

    if (delay > 300000) { // 5 minutes
        result.warnings.push('Long retry delay may cause workflow timeouts');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Email Address
 */
export function validateEmail(email: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!email) {
        result.errors.push('Email address is required');
    } else if (!SOP_REGEX.EMAIL.test(email)) {
        result.errors.push('Invalid email address format');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!url) {
        result.errors.push('URL is required');
    } else if (!SOP_REGEX.URL.test(url)) {
        result.errors.push('Invalid URL format');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate File Size
 */
export function validateFileSize(size: number, maxSize: number): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (size < 0) {
        result.errors.push('File size cannot be negative');
    }

    if (size > maxSize) {
        result.errors.push(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    if (size === 0) {
        result.warnings.push('File is empty');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate JSON String
 */
export function validateJsonString(jsonStr: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!jsonStr) {
        result.errors.push('JSON string is required');
        result.isValid = false;
        return result;
    }

    try {
        JSON.parse(jsonStr);
    } catch (error) {
        result.errors.push(`Invalid JSON format: ${error.message}`);
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Array Length
 */
export function validateArrayLength(array: any[], minLength?: number, maxLength?: number): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (!Array.isArray(array)) {
        result.errors.push('Value must be an array');
        result.isValid = false;
        return result;
    }

    if (minLength !== undefined && array.length < minLength) {
        result.errors.push(`Array must have at least ${minLength} items`);
    }

    if (maxLength !== undefined && array.length > maxLength) {
        result.errors.push(`Array cannot have more than ${maxLength} items`);
    }

    if (array.length === 0 && minLength === undefined) {
        result.warnings.push('Array is empty');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate String Length
 */
export function validateStringLength(str: string, minLength?: number, maxLength?: number): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (typeof str !== 'string') {
        result.errors.push('Value must be a string');
        result.isValid = false;
        return result;
    }

    if (minLength !== undefined && str.length < minLength) {
        result.errors.push(`String must be at least ${minLength} characters long`);
    }

    if (maxLength !== undefined && str.length > maxLength) {
        result.errors.push(`String cannot be longer than ${maxLength} characters`);
    }

    if (str.trim().length === 0) {
        result.warnings.push('String is empty or contains only whitespace');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Number Range
 */
export function validateNumberRange(num: number, min?: number, max?: number): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (typeof num !== 'number' || isNaN(num)) {
        result.errors.push('Value must be a valid number');
        result.isValid = false;
        return result;
    }

    if (min !== undefined && num < min) {
        result.errors.push(`Number must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
        result.errors.push(`Number cannot be greater than ${max}`);
    }

    if (!Number.isInteger(num) && (min !== undefined || max !== undefined)) {
        result.warnings.push('Number is not an integer');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Date Range
 */
export function validateDateRange(date: string | Date, minDate?: string | Date, maxDate?: string | Date): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    let dateObj: Date;
    try {
        dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
        }
    } catch {
        result.errors.push('Invalid date format');
        result.isValid = false;
        return result;
    }

    if (minDate) {
        const minDateObj = new Date(minDate);
        if (dateObj < minDateObj) {
            result.errors.push(`Date cannot be before ${minDateObj.toISOString()}`);
        }
    }

    if (maxDate) {
        const maxDateObj = new Date(maxDate);
        if (dateObj > maxDateObj) {
            result.errors.push(`Date cannot be after ${maxDateObj.toISOString()}`);
        }
    }

    const now = new Date();
    if (dateObj > now) {
        result.warnings.push('Date is in the future');
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Validate Required Field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (value === undefined || value === null || value === '') {
        result.errors.push(`${fieldName} is required`);
    }

    if (Array.isArray(value) && value.length === 0) {
        result.errors.push(`${fieldName} cannot be empty`);
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
        result.errors.push(`${fieldName} cannot be empty`);
    }

    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const combined: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    for (const result of results) {
        combined.errors.push(...result.errors);
        combined.warnings.push(...result.warnings);
        if (!result.isValid) {
            combined.isValid = false;
        }
    }

    return combined;
}

/**
 * Create validation summary
 */
export function createValidationSummary(result: ValidationResult): string {
    const parts: string[] = [];
    
    if (result.isValid) {
        parts.push('✅ Validation passed');
    } else {
        parts.push('❌ Validation failed');
    }

    if (result.errors.length > 0) {
        parts.push(`\n🚨 Errors (${result.errors.length}):`);
        result.errors.forEach((error, index) => {
            parts.push(`  ${index + 1}. ${error}`);
        });
    }

    if (result.warnings.length > 0) {
        parts.push(`\n⚠️ Warnings (${result.warnings.length}):`);
        result.warnings.forEach((warning, index) => {
            parts.push(`  ${index + 1}. ${warning}`);
        });
    }

    return parts.join('\n');
}