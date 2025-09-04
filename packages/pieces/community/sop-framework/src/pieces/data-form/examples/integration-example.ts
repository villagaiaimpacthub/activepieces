/**
 * Data Form Integration Examples
 * 
 * This file demonstrates various integration patterns and use cases
 * for the SOP Data Form piece in real-world scenarios.
 */

import {
    DataFormConfig,
    DataFormFieldType,
    ValidationRuleType,
    FormProcessingMode,
    FormSubmissionStatus
} from '../lib/common/data-form-types';
import { DataFormHelpers } from '../lib/utils/data-form-helpers';
import { dataFormAction } from '../lib/actions/data-form-action';
import { SOPPriority } from '../../../../types/sop-types';

/**
 * Example 1: Healthcare Patient Intake Form
 * Demonstrates HIPAA compliance, file uploads, and approval workflows
 */
export const createPatientIntakeForm = (): DataFormConfig => {
    const form = DataFormHelpers.createBasicFormConfig(
        'Patient Intake Form',
        'Complete medical intake form for new patients'
    );

    form.fields = [
        // Personal Information Section
        DataFormHelpers.createTextField('firstName', 'First Name', true, 50),
        DataFormHelpers.createTextField('lastName', 'Last Name', true, 50),
        DataFormHelpers.createDateField('dateOfBirth', 'Date of Birth', true),
        DataFormHelpers.createTextField('ssn', 'Social Security Number', true, 11),
        
        // Contact Information
        DataFormHelpers.createTextField('address', 'Address', true, 200),
        DataFormHelpers.createPhoneField('phone', 'Primary Phone', true),
        DataFormHelpers.createEmailField('email', 'Email Address', false),
        
        // Medical Information
        DataFormHelpers.createField('medicalHistory', 'Medical History', DataFormFieldType.LONG_TEXT, false, {
            maxLength: 2000,
            placeholder: 'Please describe your medical history, current medications, allergies, etc.'
        }),
        
        DataFormHelpers.createField('emergencyContact', 'Emergency Contact Name', DataFormFieldType.TEXT, true),
        DataFormHelpers.createPhoneField('emergencyPhone', 'Emergency Contact Phone', true),
        
        // Insurance Information
        DataFormHelpers.createTextField('insuranceProvider', 'Insurance Provider', false, 100),
        DataFormHelpers.createTextField('policyNumber', 'Policy Number', false, 50),
        
        // Required Documents
        DataFormHelpers.createFileUploadField('insuranceCard', 'Insurance Card', {
            maxFileSize: 5 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
            maxFiles: 2
        }, false),
        
        DataFormHelpers.createFileUploadField('idDocument', 'Government ID', {
            maxFileSize: 5 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
            maxFiles: 1
        }, true)
    ];

    // Configure HIPAA compliance
    form.fields.forEach(field => {
        if (['firstName', 'lastName', 'dateOfBirth', 'ssn', 'address', 'phone', 'email', 'medicalHistory'].includes(field.name)) {
            field.complianceRequired = true;
            field.encryptData = true;
            field.metadata = {
                containsPHI: true,
                hipaaCompliant: true,
                accessRestrictions: ['medical-staff', 'patient-owner']
            };
        }
    });

    form.complianceFrameworks = ['hipaa'];
    form.encryptSubmissions = true;
    form.requiresApproval = true;
    form.approvers = ['medical-staff@hospital.com'];
    form.displayMode = 'WIZARD';
    
    // Create form sections
    form.sections = [
        {
            id: 'personal-info',
            title: 'Personal Information',
            description: 'Basic personal and contact details',
            fields: ['firstName', 'lastName', 'dateOfBirth', 'ssn', 'address', 'phone', 'email'],
            collapsible: false,
            collapsed: false,
            required: true,
            order: 1
        },
        {
            id: 'medical-info',
            title: 'Medical Information',
            description: 'Medical history and emergency contacts',
            fields: ['medicalHistory', 'emergencyContact', 'emergencyPhone'],
            collapsible: false,
            collapsed: false,
            required: false,
            order: 2
        },
        {
            id: 'insurance',
            title: 'Insurance & Documentation',
            description: 'Insurance information and required documents',
            fields: ['insuranceProvider', 'policyNumber', 'insuranceCard', 'idDocument'],
            collapsible: false,
            collapsed: false,
            required: false,
            order: 3
        }
    ];

    form.tags = ['healthcare', 'patient-intake', 'hipaa', 'medical'];
    
    return form;
};

/**
 * Example 2: Financial Services KYC (Know Your Customer) Form
 * Demonstrates financial compliance, document verification, and risk assessment
 */
export const createKYCForm = (): DataFormConfig => {
    const form = DataFormHelpers.createBasicFormConfig(
        'Know Your Customer (KYC) Verification',
        'Complete this form to verify your identity for financial services'
    );

    form.fields = [
        // Identity Verification
        DataFormHelpers.createTextField('fullName', 'Full Legal Name', true, 100),
        DataFormHelpers.createDateField('dateOfBirth', 'Date of Birth', true),
        DataFormHelpers.createTextField('nationality', 'Nationality', true, 50),
        DataFormHelpers.createTextField('countryOfResidence', 'Country of Residence', true, 50),
        
        // Address Information
        DataFormHelpers.createTextField('streetAddress', 'Street Address', true, 200),
        DataFormHelpers.createTextField('city', 'City', true, 50),
        DataFormHelpers.createTextField('state', 'State/Province', true, 50),
        DataFormHelpers.createTextField('postalCode', 'Postal Code', true, 20),
        
        // Contact Information
        DataFormHelpers.createPhoneField('phoneNumber', 'Phone Number', true),
        DataFormHelpers.createEmailField('emailAddress', 'Email Address', true),
        
        // Employment Information
        DataFormHelpers.createSelectField('employmentStatus', 'Employment Status', [
            { label: 'Employed', value: 'employed' },
            { label: 'Self-Employed', value: 'self-employed' },
            { label: 'Unemployed', value: 'unemployed' },
            { label: 'Retired', value: 'retired' },
            { label: 'Student', value: 'student' }
        ], true),
        
        DataFormHelpers.createTextField('employer', 'Employer Name', false, 100),
        DataFormHelpers.createTextField('jobTitle', 'Job Title', false, 100),
        
        // Financial Information
        DataFormHelpers.createSelectField('annualIncome', 'Annual Income Range', [
            { label: 'Under $25,000', value: 'under-25k' },
            { label: '$25,000 - $50,000', value: '25k-50k' },
            { label: '$50,000 - $100,000', value: '50k-100k' },
            { label: '$100,000 - $250,000', value: '100k-250k' },
            { label: 'Over $250,000', value: 'over-250k' }
        ], true),
        
        DataFormHelpers.createSelectField('sourceOfFunds', 'Primary Source of Funds', [
            { label: 'Salary/Wages', value: 'salary' },
            { label: 'Business Income', value: 'business' },
            { label: 'Investments', value: 'investments' },
            { label: 'Inheritance', value: 'inheritance' },
            { label: 'Other', value: 'other' }
        ], true),
        
        // Risk Assessment
        DataFormHelpers.createSelectField('investmentExperience', 'Investment Experience', [
            { label: 'No Experience', value: 'none' },
            { label: 'Limited (< 2 years)', value: 'limited' },
            { label: 'Moderate (2-5 years)', value: 'moderate' },
            { label: 'Experienced (5+ years)', value: 'experienced' }
        ], true),
        
        DataFormHelpers.createSelectField('riskTolerance', 'Risk Tolerance', [
            { label: 'Conservative', value: 'conservative' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Aggressive', value: 'aggressive' }
        ], true),
        
        // PEP (Politically Exposed Person) Check
        DataFormHelpers.createField('isPEP', 'Are you a Politically Exposed Person?', DataFormFieldType.RADIO, true, {
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false }
            ]
        }),
        
        DataFormHelpers.createField('pepDetails', 'PEP Details', DataFormFieldType.LONG_TEXT, false, {
            showConditions: [{ field: 'isPEP', operator: 'equals', value: true }]
        }),
        
        // Document Upload
        DataFormHelpers.createFileUploadField('governmentId', 'Government Issued ID', {
            maxFileSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
            maxFiles: 2
        }, true),
        
        DataFormHelpers.createFileUploadField('proofOfAddress', 'Proof of Address', {
            maxFileSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
            maxFiles: 1
        }, true),
        
        DataFormHelpers.createFileUploadField('bankStatement', 'Recent Bank Statement', {
            maxFileSize: 10 * 1024 * 1024,
            allowedTypes: ['application/pdf'],
            maxFiles: 1
        }, false)
    ];

    // Configure financial compliance
    form.fields.forEach(field => {
        if (['fullName', 'dateOfBirth', 'nationality', 'streetAddress', 'phoneNumber', 'emailAddress'].includes(field.name)) {
            field.complianceRequired = true;
            field.encryptData = true;
        }
    });

    form.complianceFrameworks = ['aml', 'kyc', 'gdpr'];
    form.encryptSubmissions = true;
    form.requiresApproval = true;
    form.approvers = ['compliance@bank.com', 'kyc-team@bank.com'];
    form.tags = ['kyc', 'financial-services', 'compliance', 'aml'];
    
    return form;
};

/**
 * Example 3: Employee Performance Review Form
 * Demonstrates multi-rater feedback, rating scales, and analytics
 */
export const createPerformanceReviewForm = (): DataFormConfig => {
    const form = DataFormHelpers.createBasicFormConfig(
        'Annual Performance Review',
        'Comprehensive performance evaluation form'
    );

    form.fields = [
        // Employee Information
        DataFormHelpers.createTextField('employeeName', 'Employee Name', true, 100),
        DataFormHelpers.createTextField('employeeId', 'Employee ID', true, 20),
        DataFormHelpers.createTextField('department', 'Department', true, 50),
        DataFormHelpers.createTextField('position', 'Job Title', true, 100),
        DataFormHelpers.createDateField('reviewPeriodStart', 'Review Period Start', true),
        DataFormHelpers.createDateField('reviewPeriodEnd', 'Review Period End', true),
        
        // Reviewer Information
        DataFormHelpers.createTextField('reviewerName', 'Reviewer Name', true, 100),
        DataFormHelpers.createSelectField('reviewerRelationship', 'Relationship to Employee', [
            { label: 'Direct Manager', value: 'manager' },
            { label: 'Skip-Level Manager', value: 'skip-manager' },
            { label: 'Peer', value: 'peer' },
            { label: 'Direct Report', value: 'report' },
            { label: 'Self-Review', value: 'self' }
        ], true),
        
        // Performance Ratings
        DataFormHelpers.createField('overallPerformance', 'Overall Performance', DataFormFieldType.RATING, true, {
            min: 1,
            max: 5,
            step: 1,
            defaultValue: 3
        }),
        
        DataFormHelpers.createField('technicalSkills', 'Technical Skills', DataFormFieldType.RATING, true, {
            min: 1,
            max: 5,
            step: 1
        }),
        
        DataFormHelpers.createField('communication', 'Communication Skills', DataFormFieldType.RATING, true, {
            min: 1,
            max: 5,
            step: 1
        }),
        
        DataFormHelpers.createField('teamwork', 'Teamwork & Collaboration', DataFormFieldType.RATING, true, {
            min: 1,
            max: 5,
            step: 1
        }),
        
        DataFormHelpers.createField('leadership', 'Leadership Potential', DataFormFieldType.RATING, true, {
            min: 1,
            max: 5,
            step: 1
        }),
        
        DataFormHelpers.createField('punctuality', 'Punctuality & Reliability', DataFormFieldType.RATING, true, {
            min: 1,
            max: 5,
            step: 1
        }),
        
        // Qualitative Feedback
        DataFormHelpers.createField('achievements', 'Key Achievements', DataFormFieldType.LONG_TEXT, true, {
            maxLength: 1000,
            placeholder: 'Describe the employee\'s major accomplishments during this review period'
        }),
        
        DataFormHelpers.createField('areasForImprovement', 'Areas for Improvement', DataFormFieldType.LONG_TEXT, true, {
            maxLength: 1000,
            placeholder: 'Identify specific areas where the employee can improve'
        }),
        
        DataFormHelpers.createField('developmentGoals', 'Development Goals', DataFormFieldType.LONG_TEXT, true, {
            maxLength: 1000,
            placeholder: 'Set specific, measurable goals for the next review period'
        }),
        
        DataFormHelpers.createField('additionalComments', 'Additional Comments', DataFormFieldType.LONG_TEXT, false, {
            maxLength: 500,
            placeholder: 'Any additional feedback or observations'
        }),
        
        // Future Planning
        DataFormHelpers.createSelectField('promotionRecommendation', 'Promotion Recommendation', [
            { label: 'Strongly Recommend', value: 'strongly-recommend' },
            { label: 'Recommend', value: 'recommend' },
            { label: 'Not Ready', value: 'not-ready' },
            { label: 'Need More Time', value: 'more-time' }
        ], true),
        
        DataFormHelpers.createSelectField('salaryRecommendation', 'Salary Adjustment Recommendation', [
            { label: 'Significant Increase (>10%)', value: 'significant' },
            { label: 'Moderate Increase (5-10%)', value: 'moderate' },
            { label: 'Standard Increase (2-5%)', value: 'standard' },
            { label: 'No Increase', value: 'none' }
        ], true)
    ];

    // Add cross-field validation
    const overallRatingField = form.fields.find(f => f.name === 'overallPerformance')!;
    overallRatingField.validationRules.push({
        id: 'consistent-ratings',
        type: ValidationRuleType.CUSTOM,
        customFunction: `
            const ratings = [formData.technicalSkills, formData.communication, formData.teamwork, formData.leadership, formData.punctuality];
            const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            return Math.abs(value - avg) <= 1.5; // Overall rating should be within 1.5 points of average
        `,
        message: 'Overall performance rating should be consistent with individual skill ratings',
        severity: 'warning'
    });

    form.requiresApproval = true;
    form.approvers = ['hr@company.com'];
    form.tags = ['hr', 'performance-review', 'employee-evaluation'];
    form.includeAnalytics = true;
    
    return form;
};

/**
 * Example 4: Incident Report Form with Real-time Validation
 * Demonstrates urgent processing, file attachments, and escalation
 */
export const createIncidentReportForm = (): DataFormConfig => {
    const form = DataFormHelpers.createBasicFormConfig(
        'Security Incident Report',
        'Report security incidents immediately - High Priority'
    );

    form.fields = [
        // Incident Details
        DataFormHelpers.createTextField('reporterName', 'Reporter Name', true, 100),
        DataFormHelpers.createEmailField('reporterEmail', 'Reporter Email', true),
        DataFormHelpers.createPhoneField('reporterPhone', 'Reporter Phone', false),
        
        DataFormHelpers.createField('incidentDateTime', 'Incident Date & Time', DataFormFieldType.DATETIME, true),
        DataFormHelpers.createTextField('incidentLocation', 'Incident Location', true, 200),
        
        DataFormHelpers.createSelectField('incidentType', 'Incident Type', [
            { label: 'Security Breach', value: 'breach' },
            { label: 'Data Loss', value: 'data-loss' },
            { label: 'Unauthorized Access', value: 'unauthorized-access' },
            { label: 'Malware/Virus', value: 'malware' },
            { label: 'Phishing Attempt', value: 'phishing' },
            { label: 'Physical Security', value: 'physical' },
            { label: 'Other', value: 'other' }
        ], true),
        
        DataFormHelpers.createSelectField('severityLevel', 'Severity Level', [
            { label: 'Low - Minor incident, no immediate threat', value: 'low' },
            { label: 'Medium - Moderate impact, limited exposure', value: 'medium' },
            { label: 'High - Significant impact, potential data exposure', value: 'high' },
            { label: 'Critical - Major breach, immediate action required', value: 'critical' }
        ], true),
        
        DataFormHelpers.createField('incidentDescription', 'Detailed Description', DataFormFieldType.LONG_TEXT, true, {
            maxLength: 2000,
            placeholder: 'Provide a detailed description of what happened, when it was discovered, and any immediate actions taken'
        }),
        
        // Impact Assessment
        DataFormHelpers.createField('affectedSystems', 'Affected Systems', DataFormFieldType.MULTI_SELECT, false, {
            options: [
                { label: 'Email System', value: 'email' },
                { label: 'File Servers', value: 'file-servers' },
                { label: 'Database', value: 'database' },
                { label: 'Web Applications', value: 'web-apps' },
                { label: 'Network Infrastructure', value: 'network' },
                { label: 'Workstations', value: 'workstations' },
                { label: 'Mobile Devices', value: 'mobile' }
            ]
        }),
        
        DataFormHelpers.createField('dataCompromised', 'Was sensitive data compromised?', DataFormFieldType.RADIO, true, {
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false },
                { label: 'Unknown', value: 'unknown' }
            ]
        }),
        
        DataFormHelpers.createField('dataTypes', 'Types of Data Compromised', DataFormFieldType.MULTI_SELECT, false, {
            showConditions: [{ field: 'dataCompromised', operator: 'equals', value: true }],
            options: [
                { label: 'Personal Information (PII)', value: 'pii' },
                { label: 'Financial Data', value: 'financial' },
                { label: 'Health Information (PHI)', value: 'phi' },
                { label: 'Intellectual Property', value: 'ip' },
                { label: 'Customer Data', value: 'customer' },
                { label: 'Employee Data', value: 'employee' }
            ]
        }),
        
        // Evidence and Documentation
        DataFormHelpers.createFileUploadField('evidenceFiles', 'Evidence Files', {
            maxFileSize: 100 * 1024 * 1024, // 100MB
            allowedTypes: ['image/*', 'application/pdf', 'text/*', 'application/zip'],
            maxFiles: 10
        }, false),
        
        DataFormHelpers.createField('witnessInformation', 'Witness Information', DataFormFieldType.LONG_TEXT, false, {
            maxLength: 500,
            placeholder: 'Names and contact information of any witnesses'
        }),
        
        // Immediate Actions
        DataFormHelpers.createField('immediateActions', 'Immediate Actions Taken', DataFormFieldType.LONG_TEXT, true, {
            maxLength: 1000,
            placeholder: 'Describe any immediate containment or remediation actions taken'
        }),
        
        DataFormHelpers.createField('lawEnforcementNotified', 'Law Enforcement Notified?', DataFormFieldType.RADIO, true, {
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false },
                { label: 'Not Applicable', value: 'na' }
            ]
        }),
        
        DataFormHelpers.createField('additionalNotes', 'Additional Notes', DataFormFieldType.LONG_TEXT, false, {
            maxLength: 1000,
            placeholder: 'Any additional information that might be relevant'
        })
    ];

    // Add escalation rules based on severity
    const severityField = form.fields.find(f => f.name === 'severityLevel')!;
    severityField.validationRules.push({
        id: 'auto-escalate-critical',
        type: ValidationRuleType.CUSTOM,
        customFunction: 'value === "critical"',
        message: 'Critical incidents require immediate escalation',
        severity: 'info'
    });

    form.requiresApproval = false; // Incidents need immediate processing
    form.tags = ['security', 'incident', 'urgent', 'compliance'];
    form.validateOnChange = true;
    form.encryptSubmissions = true;
    
    return form;
};

/**
 * Example Usage: Integrating with Activepieces Workflow
 */
export const integrateWithActivepieces = async () => {
    // Create a patient intake form
    const patientForm = createPatientIntakeForm();
    
    // Configure the action
    const actionConfig = {
        processingMode: FormProcessingMode.COLLECT,
        formConfiguration: patientForm,
        validationMode: 'strict' as const,
        complianceFrameworks: ['hipaa'],
        generateFormSchema: true,
        includeAnalytics: true,
        enableComplianceCheck: true,
        enableAuditTrail: true,
        priority: SOPPriority.HIGH,
        assignedTo: 'medical-intake@hospital.com',
        tags: ['patient-care', 'intake', 'medical'],
        customVariables: {
            departmentCode: 'MED-001',
            facilityId: 'HOSP-MAIN'
        }
    };
    
    // Execute the action (in a real Activepieces workflow)
    try {
        const result = await dataFormAction.run({
            propsValue: actionConfig,
            run: { id: 'test-execution' }
        } as any);
        
        console.log('Form processing result:', result);
        
        if (result.success) {
            console.log('✅ Form processed successfully');
            console.log(`📊 Form ID: ${result.formId}`);
            console.log(`⏱️ Processing time: ${result.executionTime}ms`);
            console.log(`✔️ Validation passed: ${result.validationPassed}`);
            console.log(`🔒 Compliance status: ${result.complianceStatus}`);
        } else {
            console.log('❌ Form processing failed:', result.error);
        }
        
    } catch (error) {
        console.error('Form processing error:', error);
    }
};

/**
 * Example: Custom Validation Functions
 */
export const customValidationExamples = {
    // Validate that end date is after start date
    dateRangeValidation: `
        const startDate = new Date(formData.startDate);
        const endDate = new Date(value);
        return endDate > startDate;
    `,
    
    // Validate credit card number using Luhn algorithm
    creditCardValidation: `
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
    `,
    
    // Validate password strength
    passwordStrengthValidation: `
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        return value.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
    `,
    
    // Validate business hours
    businessHoursValidation: `
        const time = new Date(value);
        const hours = time.getHours();
        const day = time.getDay();
        
        // Monday = 1, Sunday = 0
        const isWeekday = day >= 1 && day <= 5;
        const isBusinessHours = hours >= 9 && hours <= 17;
        
        return isWeekday && isBusinessHours;
    `
};

/**
 * Example: Form Analytics and Reporting
 */
export const analyticsExample = () => {
    // Sample form submissions for analytics
    const sampleSubmissions = [
        DataFormHelpers.createSubmissionData(
            createPatientIntakeForm(),
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                phone: '+1-555-123-4567'
            },
            'user1'
        ),
        DataFormHelpers.createSubmissionData(
            createPatientIntakeForm(),
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@email.com'
            },
            'user2'
        )
    ];
    
    // Extract analytics
    const analytics = DataFormHelpers.extractAnalyticsData(
        sampleSubmissions,
        createPatientIntakeForm()
    );
    
    console.log('Form Analytics:', analytics);
};

// Export all examples
export default {
    createPatientIntakeForm,
    createKYCForm,
    createPerformanceReviewForm,
    createIncidentReportForm,
    integrateWithActivepieces,
    customValidationExamples,
    analyticsExample
};