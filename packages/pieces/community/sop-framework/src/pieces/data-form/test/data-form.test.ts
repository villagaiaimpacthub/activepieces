/**
 * Data Form Test Suite
 * 
 * Comprehensive tests for the Data Form piece including validation,
 * form generation, data collection, compliance checking, and integration.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
    DataFormField,
    DataFormConfig,
    DataFormFieldType,
    ValidationRuleType,
    FormProcessingMode,
    FormSubmissionStatus,
    DataFormHelpers
} from '../lib/common/data-form-types';
import { DataFormValidator } from '../lib/validation/data-form-validator';
import { DataFormHelpers as Helpers } from '../lib/utils/data-form-helpers';
import { SOPPriority, SOPComplianceStatus } from '../../../types/sop-types';

describe('Data Form Piece', () => {
    let validator: DataFormValidator;
    let sampleFormConfig: DataFormConfig;
    let sampleFields: DataFormField[];
    
    beforeEach(() => {
        validator = new DataFormValidator();
        
        // Create sample fields for testing
        sampleFields = [
            Helpers.createTextField('firstName', 'First Name', true, 50),
            Helpers.createTextField('lastName', 'Last Name', true, 50),
            Helpers.createEmailField('email', 'Email Address', true),
            Helpers.createPhoneField('phone', 'Phone Number', false),
            Helpers.createSelectField('department', 'Department', [
                { label: 'Engineering', value: 'engineering' },
                { label: 'Marketing', value: 'marketing' },
                { label: 'Sales', value: 'sales' }
            ], true),
            Helpers.createDateField('startDate', 'Start Date', true),
            Helpers.createFileUploadField('resume', 'Resume', {
                maxFileSize: 5 * 1024 * 1024,
                allowedTypes: ['application/pdf', 'application/msword'],
                maxFiles: 1
            }, false)
        ];
        
        // Create sample form configuration
        sampleFormConfig = {
            ...Helpers.createBasicFormConfig(
                'Employee Onboarding Form',
                'Complete form for new employee onboarding'
            ),
            fields: sampleFields,
            requiresApproval: true,
            approvers: ['hr@company.com', 'manager@company.com'],
            complianceFrameworks: ['gdpr'],
            encryptSubmissions: true
        };
    });
    
    describe('Form Configuration', () => {
        it('should create valid form configuration', () => {
            expect(sampleFormConfig.id).toBeDefined();
            expect(sampleFormConfig.title).toBe('Employee Onboarding Form');
            expect(sampleFormConfig.fields).toHaveLength(7);
            expect(sampleFormConfig.version).toBe('1.0.0');
        });
        
        it('should generate unique field IDs', () => {
            const fieldIds = sampleFields.map(f => f.id);
            const uniqueIds = new Set(fieldIds);
            expect(uniqueIds.size).toBe(fieldIds.length);
        });
        
        it('should validate required fields configuration', () => {
            const requiredFields = sampleFields.filter(f => f.required);
            expect(requiredFields).toHaveLength(4); // firstName, lastName, email, department, startDate
        });
        
        it('should calculate form complexity correctly', () => {
            const complexity = Helpers.calculateFormComplexity(sampleFormConfig);
            expect(complexity).toBeGreaterThan(0);
            expect(typeof complexity).toBe('number');
        });
    });
    
    describe('Field Types and Validation', () => {
        it('should create text field with proper validation', () => {
            const textField = Helpers.createTextField('testField', 'Test Field', true, 100);
            
            expect(textField.type).toBe(DataFormFieldType.TEXT);
            expect(textField.required).toBe(true);
            expect(textField.maxLength).toBe(100);
            expect(textField.validationRules).toHaveLength(1);
            expect(textField.validationRules[0].type).toBe(ValidationRuleType.MAX_LENGTH);
        });
        
        it('should create email field with email validation', () => {
            const emailField = Helpers.createEmailField();
            
            expect(emailField.type).toBe(DataFormFieldType.EMAIL);
            expect(emailField.validationRules).toHaveLength(1);
            expect(emailField.validationRules[0].type).toBe(ValidationRuleType.EMAIL_FORMAT);
        });
        
        it('should create select field with options', () => {
            const options = [{ label: 'Option 1', value: 'opt1' }];
            const selectField = Helpers.createSelectField('test', 'Test', options);
            
            expect(selectField.type).toBe(DataFormFieldType.SELECT);
            expect(selectField.options).toHaveLength(1);
            expect(selectField.options![0].label).toBe('Option 1');
        });
        
        it('should create file upload field with proper constraints', () => {
            const fileField = Helpers.createFileUploadField('upload', 'Upload', {
                maxFileSize: 1024,
                allowedTypes: ['image/jpeg'],
                maxFiles: 3
            });
            
            expect(fileField.type).toBe(DataFormFieldType.FILE_UPLOAD);
            expect(fileField.maxFileSize).toBe(1024);
            expect(fileField.acceptedFileTypes).toEqual(['image/jpeg']);
            expect(fileField.maxFiles).toBe(3);
            expect(fileField.validationRules).toHaveLength(2); // file type + file size
        });
    });
    
    describe('Data Validation', () => {
        it('should validate required fields', async () => {
            const testData = {
                firstName: 'John',
                lastName: '', // Missing required field
                email: 'john@example.com',
                department: 'engineering'
            };
            
            const context = {
                formId: sampleFormConfig.id,
                formVersion: sampleFormConfig.version,
                userId: 'test-user',
                timestamp: new Date().toISOString(),
                allFieldValues: testData,
                validationMode: 'strict' as const
            };
            
            const result = await validator.validateForm(sampleFields, testData, context);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2); // lastName required + startDate required
            expect(result.errors.some(e => e.field === 'lastName')).toBe(true);
        });
        
        it('should validate email format', async () => {
            const testData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email', // Invalid format
                department: 'engineering',
                startDate: '2023-01-01'
            };
            
            const context = {
                formId: sampleFormConfig.id,
                formVersion: sampleFormConfig.version,
                userId: 'test-user',
                timestamp: new Date().toISOString(),
                allFieldValues: testData,
                validationMode: 'strict' as const
            };
            
            const result = await validator.validateForm(sampleFields, testData, context);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.field === 'email')).toBe(true);
        });
        
        it('should pass validation for valid data', async () => {
            const testData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1-555-123-4567',
                department: 'engineering',
                startDate: '2023-01-01'
            };
            
            const context = {
                formId: sampleFormConfig.id,
                formVersion: sampleFormConfig.version,
                userId: 'test-user',
                timestamp: new Date().toISOString(),
                allFieldValues: testData,
                validationMode: 'strict' as const
            };
            
            const result = await validator.validateForm(sampleFields, testData, context);
            
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        it('should validate custom validation rules', async () => {
            // Add custom validation rule to a field
            const fieldWithCustomRule = { ...sampleFields[0] };
            fieldWithCustomRule.validationRules.push({
                id: 'custom-rule',
                type: ValidationRuleType.CUSTOM,
                customFunction: 'value.length >= 2 && value.length <= 20',
                message: 'First name must be between 2 and 20 characters',
                severity: 'error'
            });
            
            const fieldsWithCustom = [fieldWithCustomRule, ...sampleFields.slice(1)];
            
            const testData = {
                firstName: 'J', // Too short according to custom rule
                lastName: 'Doe',
                email: 'john.doe@example.com',
                department: 'engineering',
                startDate: '2023-01-01'
            };
            
            const context = {
                formId: sampleFormConfig.id,
                formVersion: sampleFormConfig.version,
                userId: 'test-user',
                timestamp: new Date().toISOString(),
                allFieldValues: testData,
                validationMode: 'strict' as const
            };
            
            const result = await validator.validateForm(fieldsWithCustom, testData, context);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('between 2 and 20 characters'))).toBe(true);
        });
    });
    
    describe('Data Transformation', () => {
        it('should transform form data correctly', () => {
            const rawData = {
                firstName: '  John  ',
                lastName: '  Doe  ',
                email: 'JOHN.DOE@EXAMPLE.COM',
                phone: '(555) 123-4567',
                department: 'engineering'
            };
            
            const transformed = Helpers.transformFormData(rawData, sampleFields, {
                sanitizeData: true,
                validateTypes: true
            });
            
            expect(transformed.firstName).toBe('John');
            expect(transformed.lastName).toBe('Doe');
            expect(transformed.email).toBe('john.doe@example.com');
            expect(transformed.phone).toBe('5551234567');
        });
        
        it('should handle type conversions', () => {
            const numberField = Helpers.createField('age', 'Age', DataFormFieldType.NUMBER);
            const booleanField = Helpers.createField('active', 'Active', DataFormFieldType.BOOLEAN);
            const fields = [numberField, booleanField];
            
            const rawData = {
                age: '25',
                active: 'true'
            };
            
            const transformed = Helpers.transformFormData(rawData, fields, {
                validateTypes: true
            });
            
            expect(typeof transformed.age).toBe('number');
            expect(transformed.age).toBe(25);
            expect(typeof transformed.active).toBe('boolean');
            expect(transformed.active).toBe(true);
        });
    });
    
    describe('Form Schema Generation', () => {
        it('should generate valid JSON schema', () => {
            const schema = Helpers.generateFormSchema(sampleFormConfig);
            
            expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
            expect(schema.type).toBe('object');
            expect(schema.title).toBe('Employee Onboarding Form');
            expect(schema.properties).toBeDefined();
            
            // Check required fields
            expect(schema.required).toContain('firstName');
            expect(schema.required).toContain('lastName');
            expect(schema.required).toContain('email');
            
            // Check field types
            expect(schema.properties.firstName.type).toBe('string');
            expect(schema.properties.email.type).toBe('string');
            expect(schema.properties.department.enum).toEqual(['engineering', 'marketing', 'sales']);
        });
        
        it('should handle complex field types in schema', () => {
            const schema = Helpers.generateFormSchema(sampleFormConfig);
            
            // Date field should have date format
            expect(schema.properties.startDate.format).toBe('date');
            
            // Select field should have enum
            expect(schema.properties.department.enum).toBeDefined();
            
            // File upload should be array type
            expect(schema.properties.resume.type).toBe('array');
            expect(schema.properties.resume.items.type).toBe('object');
        });
    });
    
    describe('Submission Data Creation', () => {
        it('should create proper submission data structure', () => {
            const formData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                department: 'engineering',
                startDate: '2023-01-01'
            };
            
            const submission = Helpers.createSubmissionData(
                sampleFormConfig,
                formData,
                'user123'
            );
            
            expect(submission.submissionId).toBeDefined();
            expect(submission.formId).toBe(sampleFormConfig.id);
            expect(submission.formVersion).toBe(sampleFormConfig.version);
            expect(submission.submittedBy).toBe('user123');
            expect(submission.status).toBe(FormSubmissionStatus.SUBMITTED);
            expect(submission.data).toEqual(formData);
            expect(submission.auditTrail).toHaveLength(1);
        });
    });
    
    describe('Compliance Validation', () => {
        it('should validate GDPR compliance', async () => {
            // Add GDPR metadata to email field
            const gdprField = { ...sampleFields[2] }; // email field
            gdprField.metadata = { gdprConsent: true, containsPII: true };
            gdprField.complianceRequired = true;
            
            const fieldsWithCompliance = [gdprField];
            
            const testData = {
                email: 'john.doe@example.com'
            };
            
            const context = {
                formId: sampleFormConfig.id,
                formVersion: sampleFormConfig.version,
                userId: 'test-user',
                timestamp: new Date().toISOString(),
                allFieldValues: testData,
                complianceFrameworks: ['gdpr'],
                validationMode: 'strict' as const
            };
            
            const result = await validator.validateForm(fieldsWithCompliance, testData, context);
            
            expect(result.complianceChecks).toBeDefined();
            expect(result.complianceChecks.length).toBeGreaterThan(0);
        });
        
        it('should handle encryption requirements', () => {
            const sensitiveField = Helpers.createField('ssn', 'SSN', DataFormFieldType.TEXT, true, {
                encryptData: true,
                complianceRequired: true,
                metadata: { containsPII: true, encryptionRequired: true }
            });
            
            expect(sensitiveField.encryptData).toBe(true);
            expect(sensitiveField.complianceRequired).toBe(true);
            expect(sensitiveField.metadata?.containsPII).toBe(true);
        });
    });
    
    describe('Error Handling', () => {
        it('should create appropriate error objects', () => {
            const error = Helpers.createError(
                'VALIDATION_ERROR',
                'Field validation failed',
                'field123',
                { fieldName: 'email', value: 'invalid' }
            );
            
            expect(error.type).toBe('VALIDATION_ERROR');
            expect(error.message).toBe('Field validation failed');
            expect(error.fieldId).toBe('field123');
            expect(error.recoverable).toBe(true);
            expect(error.timestamp).toBeDefined();
        });
    });
    
    describe('Analytics and Metrics', () => {
        it('should extract basic analytics from submissions', () => {
            const submissions = [
                Helpers.createSubmissionData(sampleFormConfig, { firstName: 'John' }, 'user1'),
                Helpers.createSubmissionData(sampleFormConfig, { firstName: 'Jane', lastName: 'Smith' }, 'user2')
            ];
            
            const analytics = Helpers.extractAnalyticsData(submissions, sampleFormConfig);
            
            expect(analytics).toBeDefined();
            expect(analytics.formId).toBe(sampleFormConfig.id);
            expect(analytics.totalSubmissions).toBe(2);
            expect(analytics.mostActiveFields).toBeDefined();
        });
    });
    
    describe('Integration Support', () => {
        it('should merge form configurations correctly', () => {
            const baseConfig = sampleFormConfig;
            const overrides = {
                title: 'Updated Form Title',
                description: 'Updated description',
                layout: {
                    columns: 2,
                    spacing: 'large',
                    responsive: true
                }
            };
            
            const merged = Helpers.mergeFormConfigs(baseConfig, overrides);
            
            expect(merged.title).toBe('Updated Form Title');
            expect(merged.description).toBe('Updated description');
            expect(merged.layout.columns).toBe(2);
            expect(merged.layout.spacing).toBe('large');
            expect(merged.fields).toEqual(baseConfig.fields); // Should preserve original fields
        });
    });
    
    describe('File Size Formatting', () => {
        it('should format file sizes correctly', () => {
            expect(Helpers.formatFileSize(1024)).toBe('1 KB');
            expect(Helpers.formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(Helpers.formatFileSize(1536)).toBe('1.5 KB');
            expect(Helpers.formatFileSize(0)).toBe('0 Bytes');
        });
    });
    
    describe('ID Generation', () => {
        it('should generate unique IDs', () => {
            const id1 = Helpers.generateFormId('test');
            const id2 = Helpers.generateFormId('test');
            
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^test_/);
            expect(id2).toMatch(/^test_/);
        });
        
        it('should generate field IDs based on name', () => {
            const fieldId = Helpers.generateFieldId('firstName', 'field');
            
            expect(fieldId).toMatch(/^field_firstname_/);
        });
    });
});