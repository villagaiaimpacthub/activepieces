# SOP Data Form Piece

The **SOP Data Form Piece** is a comprehensive solution for dynamic form creation, data collection, validation, and compliance checking within Standard Operating Procedure workflows. This piece extends the BaseSoPiece framework and provides enterprise-grade form management capabilities.

## Features

### 🎯 **Core Capabilities**
- **Dynamic Form Generation**: Create forms programmatically with 20+ field types
- **Real-time Validation**: Advanced validation engine with custom rules and cross-field validation
- **Compliance Integration**: Built-in support for GDPR, HIPAA, PCI DSS, SOX, and custom frameworks
- **File Upload Management**: Secure file handling with virus scanning and type validation
- **Approval Workflows**: Integrated approval processes with escalation support
- **Audit Trails**: Comprehensive logging of all form interactions and data changes

### 📊 **Processing Modes**
1. **COLLECT** - Present forms to users and collect data
2. **VALIDATE** - Validate existing data against form rules
3. **DISPLAY** - Show forms in read-only mode
4. **GENERATE** - Generate form schemas and configurations
5. **MIGRATE** - Handle data migration between form versions

### 🔧 **Field Types Supported**
- **Text Fields**: TEXT, LONG_TEXT, EMAIL, PHONE, URL
- **Numeric Fields**: NUMBER, CURRENCY, PERCENTAGE, RATING, SLIDER
- **Date/Time**: DATE, DATETIME, TIME
- **Selection**: SELECT, MULTI_SELECT, RADIO, CHECKBOX
- **Advanced**: FILE_UPLOAD, SIGNATURE, JSON, TABLE, HTML
- **Layout**: SECTION, DIVIDER

## Quick Start

### Basic Form Creation

```typescript
import { DataFormHelpers, DataFormFieldType } from './lib/utils/data-form-helpers';

// Create a simple contact form
const form = DataFormHelpers.createBasicFormConfig(
  'Contact Form',
  'Please fill out your contact information'
);

// Add fields
form.fields = [
  DataFormHelpers.createTextField('firstName', 'First Name', true, 50),
  DataFormHelpers.createTextField('lastName', 'Last Name', true, 50),
  DataFormHelpers.createEmailField('email', 'Email Address', true),
  DataFormHelpers.createPhoneField('phone', 'Phone Number', false),
  DataFormHelpers.createSelectField('department', 'Department', [
    { label: 'Sales', value: 'sales' },
    { label: 'Support', value: 'support' },
    { label: 'Engineering', value: 'engineering' }
  ], true)
];
```

### Advanced Form with Validation

```typescript
import { ValidationRuleType } from './lib/common/data-form-types';

// Create field with custom validation
const passwordField = DataFormHelpers.createField(
  'password',
  'Password',
  DataFormFieldType.TEXT,
  true,
  {
    validationRules: [
      {
        id: 'password-strength',
        type: ValidationRuleType.PATTERN,
        value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
        message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
        severity: 'error'
      },
      {
        id: 'custom-validation',
        type: ValidationRuleType.CUSTOM,
        customFunction: 'value !== "password123" && value !== "123456"',
        message: 'Password is too common',
        severity: 'error'
      }
    ]
  }
);
```

### Compliance-Enabled Form

```typescript
// Create form with GDPR compliance
const gdprForm = DataFormHelpers.createBasicFormConfig(
  'GDPR Compliant Form',
  'This form complies with GDPR requirements'
);

gdprForm.complianceFrameworks = ['gdpr'];
gdprForm.encryptSubmissions = true;

// Add compliant fields
const emailField = DataFormHelpers.createEmailField('email', 'Email Address', true);
emailField.complianceRequired = true;
emailField.encryptData = true;
emailField.metadata = {
  containsPII: true,
  gdprConsent: true,
  dataRetentionDays: 365
};
```

## Usage Examples

### 1. Employee Onboarding Form

```typescript
const onboardingForm: DataFormConfig = {
  id: 'employee-onboarding',
  title: 'Employee Onboarding Form',
  description: 'Complete this form to begin the onboarding process',
  version: '1.0.0',
  fields: [
    DataFormHelpers.createTextField('firstName', 'First Name', true),
    DataFormHelpers.createTextField('lastName', 'Last Name', true),
    DataFormHelpers.createEmailField('workEmail', 'Work Email', true),
    DataFormHelpers.createPhoneField('phone', 'Phone Number', true),
    DataFormHelpers.createDateField('startDate', 'Start Date', true),
    DataFormHelpers.createSelectField('department', 'Department', [
      { label: 'Engineering', value: 'eng' },
      { label: 'Marketing', value: 'mkt' },
      { label: 'Sales', value: 'sales' },
      { label: 'HR', value: 'hr' }
    ], true),
    DataFormHelpers.createFileUploadField('documents', 'Required Documents', {
      maxFileSize: 10 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxFiles: 5
    }, true)
  ],
  requiresApproval: true,
  approvers: ['hr@company.com'],
  displayMode: 'WIZARD',
  layout: {
    columns: 2,
    spacing: 'medium',
    responsive: true
  },
  complianceFrameworks: ['gdpr'],
  encryptSubmissions: true,
  tags: ['hr', 'onboarding', 'employee'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'hr-system'
};
```

### 2. Incident Report Form

```typescript
const incidentForm: DataFormConfig = {
  id: 'incident-report',
  title: 'Security Incident Report',
  description: 'Report security incidents immediately',
  version: '1.0.0',
  fields: [
    DataFormHelpers.createTextField('reporterName', 'Reporter Name', true),
    DataFormHelpers.createEmailField('reporterEmail', 'Reporter Email', true),
    DataFormHelpers.createField('incidentDate', 'Incident Date/Time', DataFormFieldType.DATETIME, true),
    DataFormHelpers.createSelectField('severity', 'Severity Level', [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Critical', value: 'critical' }
    ], true),
    DataFormHelpers.createField('description', 'Incident Description', DataFormFieldType.LONG_TEXT, true),
    DataFormHelpers.createField('affectedSystems', 'Affected Systems', DataFormFieldType.MULTI_SELECT, false, {
      options: [
        { label: 'Web Application', value: 'web' },
        { label: 'Database', value: 'db' },
        { label: 'File Server', value: 'files' },
        { label: 'Email System', value: 'email' }
      ]
    }),
    DataFormHelpers.createFileUploadField('evidence', 'Evidence Files', {
      maxFileSize: 50 * 1024 * 1024,
      allowedTypes: ['image/*', 'application/pdf', 'text/*'],
      maxFiles: 10
    }, false)
  ],
  requiresApproval: false,
  displayMode: 'FORM',
  layout: { columns: 1, spacing: 'medium', responsive: true },
  validateOnChange: true,
  validateOnSubmit: true,
  auditTrailRequired: true,
  tags: ['security', 'incident', 'urgent'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'security-team'
};
```

### 3. Customer Feedback Form

```typescript
const feedbackForm: DataFormConfig = {
  id: 'customer-feedback',
  title: 'Customer Feedback Survey',
  description: 'Help us improve our services',
  version: '1.0.0',
  fields: [
    DataFormHelpers.createTextField('customerName', 'Name (Optional)', false),
    DataFormHelpers.createEmailField('customerEmail', 'Email (Optional)', false),
    DataFormHelpers.createField('serviceRating', 'Overall Service Rating', DataFormFieldType.RATING, true, {
      min: 1,
      max: 5,
      defaultValue: 3
    }),
    DataFormHelpers.createField('recommendationScore', 'Likelihood to Recommend (1-10)', DataFormFieldType.SLIDER, true, {
      min: 1,
      max: 10,
      step: 1
    }),
    DataFormHelpers.createSelectField('category', 'Feedback Category', [
      { label: 'Product Quality', value: 'quality' },
      { label: 'Customer Service', value: 'service' },
      { label: 'Pricing', value: 'pricing' },
      { label: 'Website/App', value: 'digital' },
      { label: 'Other', value: 'other' }
    ], true),
    DataFormHelpers.createField('comments', 'Additional Comments', DataFormFieldType.LONG_TEXT, false, {
      maxLength: 1000,
      placeholder: 'Please share any additional feedback...'
    }),
    DataFormHelpers.createField('allowFollowup', 'Allow follow-up contact?', DataFormFieldType.CHECKBOX, false)
  ],
  displayMode: 'FORM',
  layout: { columns: 1, spacing: 'large', responsive: true },
  allowMultipleSubmissions: false,
  tags: ['feedback', 'customer', 'survey'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'marketing-team'
};
```

## Validation System

### Built-in Validation Rules

```typescript
const validationRules = [
  // Required field
  {
    id: 'required',
    type: ValidationRuleType.REQUIRED,
    message: 'This field is required',
    severity: 'error'
  },
  // Length validation
  {
    id: 'min-length',
    type: ValidationRuleType.MIN_LENGTH,
    value: 3,
    message: 'Must be at least 3 characters',
    severity: 'error'
  },
  // Pattern matching
  {
    id: 'phone-pattern',
    type: ValidationRuleType.PATTERN,
    value: '^[+]?[1-9]?[0-9]{7,15}$',
    message: 'Please enter a valid phone number',
    severity: 'error'
  },
  // Custom validation
  {
    id: 'age-check',
    type: ValidationRuleType.CUSTOM,
    customFunction: 'value >= 18 && value <= 120',
    message: 'Age must be between 18 and 120',
    severity: 'error'
  },
  // Conditional validation
  {
    id: 'conditional',
    type: ValidationRuleType.CONDITIONAL,
    conditions: [{ field: 'hasLicense', operator: 'equals', value: true }],
    value: { validation: { field: 'licenseNumber', operator: 'exists', value: true } },
    message: 'License number is required when you have a license',
    severity: 'error'
  }
];
```

### Cross-Field Validation

The validator automatically handles common cross-field validations:

- **Password Confirmation**: Ensures password and confirm password match
- **Date Range Validation**: Ensures start date is before end date
- **Dependent Fields**: Fields that become required based on other field values

## Compliance Features

### GDPR Compliance

```typescript
// Configure GDPR-compliant field
const gdprField = {
  id: 'personal-email',
  name: 'email',
  label: 'Email Address',
  type: DataFormFieldType.EMAIL,
  required: true,
  complianceRequired: true,
  encryptData: true,
  metadata: {
    containsPII: true,
    gdprConsent: true,
    dataRetentionDays: 365,
    dataProcessingBasis: 'consent',
    rightToErasure: true
  }
};
```

### HIPAA Compliance

```typescript
// Configure HIPAA-compliant field
const healthField = {
  id: 'health-info',
  name: 'medicalHistory',
  label: 'Medical History',
  type: DataFormFieldType.LONG_TEXT,
  required: false,
  complianceRequired: true,
  encryptData: true,
  metadata: {
    containsPHI: true,
    hipaaCompliant: true,
    accessRestrictions: ['medical-staff', 'patient-owner']
  }
};
```

## Trigger Events

The Data Form Piece provides comprehensive triggers for reactive workflows:

### Form Submission Trigger
```typescript
// Triggers when a form is submitted
formSubmissionTrigger.onEnable({
  propsValue: {
    formId: 'contact-form',
    includeValidationResults: true,
    includeSubmissionData: true,
    filterByStatus: ['SUBMITTED', 'VALIDATED'],
    minimumPriority: SOPPriority.NORMAL
  }
});
```

### Validation Failure Trigger
```typescript
// Triggers when validation fails
validationFailureTrigger.onEnable({
  propsValue: {
    formId: 'contact-form',
    errorThreshold: 3,
    specificFields: ['email', 'phone'],
    includeErrorDetails: true
  }
});
```

### Compliance Violation Trigger
```typescript
// Triggers on compliance violations
complianceViolationTrigger.onEnable({
  propsValue: {
    formId: 'personal-data-form',
    complianceFrameworks: ['gdpr', 'hipaa'],
    severityLevel: 'high',
    immediateEscalation: true
  }
});
```

## Integration Examples

### Activepieces Workflow Integration

```typescript
// Use in Activepieces workflow
const workflowStep = {
  name: 'process_employee_form',
  displayName: 'Process Employee Onboarding',
  piece: '@sparc/sop-data-form',
  action: 'sop_data_form',
  settings: {
    processingMode: FormProcessingMode.COLLECT,
    formConfiguration: onboardingForm,
    validationMode: 'strict',
    complianceFrameworks: ['gdpr'],
    generateFormSchema: true,
    enableComplianceCheck: true,
    enableAuditTrail: true,
    priority: SOPPriority.HIGH
  }
};
```

### API Integration

```typescript
// Submit form data via API
const submitFormData = async (formId: string, data: Record<string, any>) => {
  const response = await fetch('/api/forms/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Form-ID': formId
    },
    body: JSON.stringify({
      formId,
      data,
      processingMode: FormProcessingMode.COLLECT,
      validationMode: 'strict'
    })
  });
  
  return response.json();
};
```

## Advanced Features

### Dynamic Field Generation

```typescript
// Generate fields based on external data
const generateDynamicForm = (productCategories: string[]) => {
  const form = DataFormHelpers.createBasicFormConfig(
    'Product Interest Form',
    'Tell us about your product interests'
  );
  
  // Add dynamic category fields
  form.fields = productCategories.map(category => 
    DataFormHelpers.createField(
      `interest_${category.toLowerCase()}`,
      `Interest in ${category}`,
      DataFormFieldType.RATING,
      false,
      { min: 1, max: 5, defaultValue: 1 }
    )
  );
  
  return form;
};
```

### Conditional Field Display

```typescript
// Field that shows based on another field's value
const conditionalField = DataFormHelpers.createTextField(
  'companyName',
  'Company Name',
  true
);

conditionalField.showConditions = [
  {
    field: 'employmentStatus',
    operator: 'equals',
    value: 'employed'
  }
];
```

### Multi-Step Forms (Wizard Mode)

```typescript
const wizardForm = DataFormHelpers.createBasicFormConfig(
  'Multi-Step Application',
  'Complete your application in steps'
);

wizardForm.displayMode = FormDisplayMode.WIZARD;
wizardForm.sections = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic personal details',
    fields: ['firstName', 'lastName', 'email'],
    collapsible: false,
    order: 1
  },
  {
    id: 'employment',
    title: 'Employment Details',
    description: 'Your work information',
    fields: ['company', 'position', 'salary'],
    collapsible: false,
    order: 2
  }
];
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- data-form
```

The test suite covers:
- Form configuration validation
- Field type creation and validation
- Data transformation and sanitization
- Compliance validation
- Error handling
- Schema generation
- Analytics extraction

## Configuration Reference

### DataFormConfig
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | Unique form identifier |
| title | string | ✓ | Form title |
| description | string |  | Form description |
| version | string | ✓ | Form version |
| fields | DataFormField[] | ✓ | Form fields |
| displayMode | FormDisplayMode |  | How form is displayed |
| layout | object |  | Form layout configuration |
| requiresApproval | boolean |  | Whether approval is needed |
| complianceFrameworks | string[] |  | Compliance frameworks |
| encryptSubmissions | boolean |  | Encrypt form data |

### DataFormField
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | ✓ | Unique field identifier |
| name | string | ✓ | Field name for data |
| label | string | ✓ | Display label |
| type | DataFormFieldType | ✓ | Field type |
| required | boolean |  | Whether field is required |
| validationRules | ValidationRule[] |  | Validation rules |
| complianceRequired | boolean |  | Compliance validation needed |
| encryptData | boolean |  | Encrypt field data |

## Best Practices

### Security
1. **Always encrypt PII**: Set `encryptData: true` for sensitive fields
2. **Use HTTPS**: Ensure secure transmission
3. **Validate file uploads**: Check file types and scan for viruses
4. **Implement rate limiting**: Prevent abuse

### Performance
1. **Optimize form complexity**: Keep forms under 50 fields when possible
2. **Use pagination**: Break large forms into sections
3. **Lazy load**: Load form sections on demand
4. **Cache validation rules**: Reuse common validation patterns

### User Experience
1. **Progressive disclosure**: Show fields based on user choices
2. **Clear error messages**: Provide actionable error feedback
3. **Auto-save**: Save draft data automatically
4. **Mobile responsive**: Ensure forms work on all devices

### Compliance
1. **Document data usage**: Clearly state how data will be used
2. **Implement retention policies**: Automatically delete old data
3. **Provide data access**: Allow users to view their data
4. **Enable data deletion**: Support right to erasure

## Support

For questions, issues, or contributions:
- Review the test suite for usage examples
- Check the type definitions for detailed API documentation
- Follow SOP framework patterns for consistency
- Ensure all compliance requirements are met

The Data Form Piece is designed to be the most comprehensive form management solution for enterprise SOP workflows, providing the flexibility and security needed for modern business processes.