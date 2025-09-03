# Phase 3: Custom SOP Pieces Implementation (Week 3)

## Objective
Implement custom SOP-specific workflow pieces that clients use to design their standard operating procedures, following the Activepieces pieces framework.

## Tasks Overview

### Day 11: Pieces Framework Setup

#### 11.1 Create SOP Pieces Package Structure
```bash
# Create SOP pieces package
mkdir -p packages/pieces/sop
cd packages/pieces/sop

# Initialize npm package
npm init -y

# Install dependencies
npm install @activepieces/pieces-framework
npm install --save-dev typescript @types/node

# Create directory structure
mkdir -p src/lib/{process,human,integration,compliance}
mkdir -p src/lib/common/{types,utils,validators}
```

#### 11.2 Package Configuration
```json
// packages/pieces/sop/package.json
{
  "name": "@sop-tool/pieces",
  "version": "1.0.0",
  "description": "Custom SOP workflow pieces",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "jest"
  },
  "dependencies": {
    "@activepieces/pieces-framework": "^0.20.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

#### 11.3 TypeScript Configuration
```json
// packages/pieces/sop/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Day 12: Common Types and Utilities

#### 12.1 SOP Common Types
```typescript
// packages/pieces/sop/src/lib/common/types/sop.types.ts
export interface SopStepResult {
  stepId: string;
  title: string;
  status: SopStepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

export enum SopStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

export interface SopApprovalResult {
  approvalId: string;
  status: ApprovalStatus;
  approver?: string;
  approvedAt?: Date;
  comments?: string;
  escalationLevel: number;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved', 
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  EXPIRED = 'expired'
}

export interface SopDataForm {
  formId: string;
  fields: FormField[];
  submittedData?: Record<string, any>;
  validationErrors?: ValidationError[];
  status: FormStatus;
}

export enum FormStatus {
  AWAITING_INPUT = 'awaiting_input',
  SUBMITTED = 'submitted',
  VALIDATED = 'validated',
  REJECTED = 'rejected'
}

export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  options?: FieldOption[];
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  FILE = 'file'
}
```

#### 12.2 SOP Utilities
```typescript
// packages/pieces/sop/src/lib/common/utils/sop.utils.ts
export class SopUtils {
  
  static generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  static generateApprovalId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  static generateFormId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  static calculateDuration(startTime: Date, endTime?: Date): number {
    const end = endTime || new Date();
    return Math.round((end.getTime() - startTime.getTime()) / 1000); // seconds
  }
  
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
  
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static sanitizeInput(input: string): string {
    // Basic HTML sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
}
```

#### 12.3 SOP Validators
```typescript
// packages/pieces/sop/src/lib/common/validators/sop.validators.ts
import { Property } from '@activepieces/pieces-framework';

export class SopValidators {
  
  static requiredText(displayName: string, description?: string) {
    return Property.ShortText({
      displayName,
      description,
      required: true,
      validators: [
        (value: string) => {
          if (!value || value.trim().length === 0) {
            return `${displayName} is required`;
          }
          if (value.length > 255) {
            return `${displayName} must be less than 255 characters`;
          }
          return undefined;
        }
      ]
    });
  }
  
  static requiredLongText(displayName: string, description?: string) {
    return Property.LongText({
      displayName,
      description,
      required: true,
      validators: [
        (value: string) => {
          if (!value || value.trim().length === 0) {
            return `${displayName} is required`;
          }
          return undefined;
        }
      ]
    });
  }
  
  static positiveNumber(displayName: string, description?: string, defaultValue?: number) {
    return Property.Number({
      displayName,
      description,
      required: false,
      defaultValue,
      validators: [
        (value: number) => {
          if (value !== undefined && value < 0) {
            return `${displayName} must be a positive number`;
          }
          return undefined;
        }
      ]
    });
  }
  
  static emailList(displayName: string, description?: string) {
    return Property.Array({
      displayName,
      description,
      required: false,
      validators: [
        (value: string[]) => {
          if (value) {
            const invalidEmails = value.filter(email => !SopUtils.validateEmail(email));
            if (invalidEmails.length > 0) {
              return `Invalid email addresses: ${invalidEmails.join(', ')}`;
            }
          }
          return undefined;
        }
      ]
    });
  }
}
```

### Day 13: Process Category Pieces

#### 13.1 Process Step Piece
```typescript
// packages/pieces/sop/src/lib/process/process-step.piece.ts
import { createPiece, PieceAuth, createAction, Property } from '@activepieces/pieces-framework';
import { SopUtils, SopStepResult, SopStepStatus, SopValidators } from '../common';

export const processStepPiece = createPiece({
  displayName: 'Process Step',
  description: 'A standard operating procedure step with instructions and validation',
  logoUrl: '/assets/sop/icons/process-step.svg',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0',
  auth: PieceAuth.None(),
  actions: [
    createAction({
      name: 'execute_process_step',
      displayName: 'Execute Process Step',
      description: 'Execute a documented procedure step with validation',
      props: {
        stepTitle: SopValidators.requiredText(
          'Step Title',
          'Brief descriptive title for this process step'
        ),
        instructions: SopValidators.requiredLongText(
          'Step Instructions',
          'Detailed instructions for completing this step'
        ),
        estimatedTime: SopValidators.positiveNumber(
          'Estimated Time (minutes)',
          'Expected time to complete this step',
          5
        ),
        checklistItems: Property.Array({
          displayName: 'Checklist Items',
          description: 'Optional checklist items to verify step completion',
          required: false
        }),
        requiresSignoff: Property.Checkbox({
          displayName: 'Requires Sign-off',
          description: 'Does this step require verification or sign-off?',
          required: false,
          defaultValue: false
        }),
        category: Property.StaticDropdown({
          displayName: 'Step Category',
          description: 'Categorize this step for organization',
          required: false,
          defaultValue: 'general',
          options: {
            options: [
              { label: 'General', value: 'general' },
              { label: 'Preparation', value: 'preparation' },
              { label: 'Execution', value: 'execution' },
              { label: 'Validation', value: 'validation' },
              { label: 'Documentation', value: 'documentation' }
            ]
          }
        })
      },
      
      async run(context) {
        const { stepTitle, instructions, estimatedTime, checklistItems, requiresSignoff, category } = context.propsValue;
        
        const stepId = SopUtils.generateStepId();
        const startTime = new Date();
        
        // Create checklist with completion status
        const checklist = (checklistItems || []).map((item: string) => ({
          item: item,
          completed: false,
          completedAt: null,
          completedBy: null
        }));
        
        const result: SopStepResult = {
          stepId,
          title: stepTitle,
          status: SopStepStatus.IN_PROGRESS,
          startTime,
          metadata: {
            instructions,
            estimatedTime,
            checklist,
            requiresSignoff,
            category,
            stepType: 'process_step'
          }
        };
        
        // Log step initiation
        console.log(`[SOP Step] Started: ${stepTitle} (${stepId})`);
        
        return {
          success: true,
          stepResult: result,
          message: `Process step "${stepTitle}" initiated successfully`,
          nextAction: requiresSignoff ? 'awaiting_signoff' : 'completed'
        };
      }
    })
  ]
});
```

#### 13.2 Decision Point Piece
```typescript
// packages/pieces/sop/src/lib/process/decision-point.piece.ts
import { createPiece, PieceAuth, createAction, Property } from '@activepieces/pieces-framework';
import { SopUtils, SopValidators } from '../common';

export const decisionPointPiece = createPiece({
  displayName: 'Decision Point',
  description: 'A conditional decision point in the SOP with multiple outcome paths',
  logoUrl: '/assets/sop/icons/decision-point.svg',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0',
  auth: PieceAuth.None(),
  actions: [
    createAction({
      name: 'process_decision',
      displayName: 'Process Decision',
      description: 'Evaluate decision criteria and determine the appropriate path forward',
      props: {
        decisionTitle: SopValidators.requiredText(
          'Decision Title',
          'What decision needs to be made at this point?'
        ),
        decisionCriteria: SopValidators.requiredLongText(
          'Decision Criteria',
          'What factors should be considered when making this decision?'
        ),
        decisionOptions: Property.Array({
          displayName: 'Available Options',
          description: 'List the available options or outcomes for this decision',
          required: true
        }),
        defaultOption: Property.ShortText({
          displayName: 'Default Option',
          description: 'Default option if no specific choice is made',
          required: false
        }),
        timeoutMinutes: SopValidators.positiveNumber(
          'Decision Timeout (minutes)',
          'How long to wait for a decision before using the default option',
          60
        ),
        requiresJustification: Property.Checkbox({
          displayName: 'Requires Justification',
          description: 'Should the decision maker provide justification for their choice?',
          required: false,
          defaultValue: false
        })
      },
      
      async run(context) {
        const { 
          decisionTitle, 
          decisionCriteria, 
          decisionOptions, 
          defaultOption, 
          timeoutMinutes, 
          requiresJustification 
        } = context.propsValue;
        
        const decisionId = SopUtils.generateStepId();
        const startTime = new Date();
        
        const result = {
          decisionId,
          title: decisionTitle,
          criteria: decisionCriteria,
          availableOptions: decisionOptions,
          defaultOption,
          status: 'awaiting_decision',
          startTime,
          timeoutAt: new Date(Date.now() + (timeoutMinutes * 60 * 1000)),
          requiresJustification,
          metadata: {
            decisionType: 'manual_decision',
            stepType: 'decision_point'
          }
        };
        
        console.log(`[SOP Decision] Started: ${decisionTitle} (${decisionId})`);
        
        return {
          success: true,
          decisionResult: result,
          message: `Decision point "${decisionTitle}" created successfully`,
          nextAction: 'awaiting_decision',
          // This would typically integrate with a decision UI component
          decisionUrl: `/sop/decisions/${decisionId}`
        };
      }
    })
  ]
});
```

### Day 14: Human Category Pieces

#### 14.1 Approval Gate Piece
```typescript
// packages/pieces/sop/src/lib/human/approval-gate.piece.ts
import { createPiece, PieceAuth, createAction, Property } from '@activepieces/pieces-framework';
import { SopUtils, SopApprovalResult, ApprovalStatus, SopValidators } from '../common';

export const approvalGatePiece = createPiece({
  displayName: 'Approval Gate',
  description: 'Require approval from designated personnel before proceeding with the SOP',
  logoUrl: '/assets/sop/icons/approval-gate.svg',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0',
  auth: PieceAuth.None(),
  actions: [
    createAction({
      name: 'request_approval',
      displayName: 'Request Approval',
      description: 'Submit a request for approval and manage the approval workflow',
      props: {
        approvalTitle: SopValidators.requiredText(
          'Approval Title',
          'What needs to be approved?'
        ),
        approvalDescription: SopValidators.requiredLongText(
          'Approval Description',
          'Detailed description of what is being submitted for approval'
        ),
        requiredApprovers: Property.MultiSelectDropdown({
          displayName: 'Required Approver Roles',
          description: 'Select the roles that can approve this request',
          required: true,
          options: {
            options: [
              { label: 'Manager', value: 'manager' },
              { label: 'Department Head', value: 'dept_head' },
              { label: 'Team Lead', value: 'team_lead' },
              { label: 'Quality Assurance', value: 'qa' },
              { label: 'Compliance Officer', value: 'compliance' },
              { label: 'Executive', value: 'executive' },
              { label: 'Subject Matter Expert', value: 'sme' }
            ]
          }
        }),
        approvalCriteria: SopValidators.requiredLongText(
          'Approval Criteria',
          'What criteria should approvers evaluate?'
        ),
        escalationTimeHours: SopValidators.positiveNumber(
          'Escalation Time (hours)',
          'Hours before approval request escalates to the next level',
          24
        ),
        maxEscalationLevels: Property.Number({
          displayName: 'Maximum Escalation Levels',
          description: 'How many escalation levels before auto-approval or failure?',
          required: false,
          defaultValue: 2
        }),
        allowDelegation: Property.Checkbox({
          displayName: 'Allow Delegation',
          description: 'Can approvers delegate this approval to others?',
          required: false,
          defaultValue: true
        }),
        requireComments: Property.Checkbox({
          displayName: 'Require Comments',
          description: 'Must approvers provide comments with their decision?',
          required: false,
          defaultValue: false
        })
      },
      
      async run(context) {
        const {
          approvalTitle,
          approvalDescription,
          requiredApprovers,
          approvalCriteria,
          escalationTimeHours,
          maxEscalationLevels,
          allowDelegation,
          requireComments
        } = context.propsValue;
        
        const approvalId = SopUtils.generateApprovalId();
        const submittedAt = new Date();
        const escalatesAt = new Date(Date.now() + (escalationTimeHours * 60 * 60 * 1000));
        
        const approvalResult: SopApprovalResult = {
          approvalId,
          status: ApprovalStatus.PENDING,
          escalationLevel: 0
        };
        
        const approvalRequest = {
          approvalId,
          title: approvalTitle,
          description: approvalDescription,
          requiredApprovers,
          criteria: approvalCriteria,
          status: ApprovalStatus.PENDING,
          submittedAt,
          escalatesAt,
          escalationLevel: 0,
          maxEscalationLevels,
          allowDelegation,
          requireComments,
          metadata: {
            stepType: 'approval_gate',
            approvalType: 'manual_approval'
          }
        };
        
        console.log(`[SOP Approval] Requested: ${approvalTitle} (${approvalId})`);
        
        // In a real implementation, this would:
        // 1. Store the approval request in database
        // 2. Send notifications to required approvers
        // 3. Create approval workflow tasks
        // 4. Set up escalation timers
        
        return {
          success: true,
          approvalResult,
          approvalRequest,
          message: `Approval request "${approvalTitle}" submitted successfully`,
          nextAction: 'awaiting_approval',
          approvalUrl: `/sop/approvals/${approvalId}`
        };
      }
    })
  ]
});
```

#### 14.2 Data Collection Form Piece
```typescript
// packages/pieces/sop/src/lib/human/data-form.piece.ts
import { createPiece, PieceAuth, createAction, Property } from '@activepieces/pieces-framework';
import { SopUtils, SopDataForm, FormStatus, FormField, FieldType, SopValidators } from '../common';

export const dataFormPiece = createPiece({
  displayName: 'Data Collection Form',
  description: 'Collect structured data input from users as part of the SOP process',
  logoUrl: '/assets/sop/icons/data-form.svg',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0',
  auth: PieceAuth.None(),
  actions: [
    createAction({
      name: 'collect_data',
      displayName: 'Collect Data',
      description: 'Display a form and collect structured user input',
      props: {
        formTitle: SopValidators.requiredText(
          'Form Title',
          'Title for the data collection form'
        ),
        formDescription: Property.LongText({
          displayName: 'Form Description',
          description: 'Instructions or description for form users',
          required: false
        }),
        fields: Property.Json({
          displayName: 'Form Fields Configuration',
          description: 'JSON configuration for form fields',
          required: true,
          defaultValue: JSON.stringify([
            {
              name: 'name',
              label: 'Full Name',
              type: 'text',
              required: true
            },
            {
              name: 'email',
              label: 'Email Address',
              type: 'email',
              required: true
            }
          ], null, 2)
        }),
        submitButtonText: Property.ShortText({
          displayName: 'Submit Button Text',
          description: 'Text for the form submit button',
          required: false,
          defaultValue: 'Submit'
        }),
        allowMultipleSubmissions: Property.Checkbox({
          displayName: 'Allow Multiple Submissions',
          description: 'Can users submit the form multiple times?',
          required: false,
          defaultValue: false
        }),
        timeoutMinutes: SopValidators.positiveNumber(
          'Form Timeout (minutes)',
          'Minutes before the form expires (0 = no timeout)',
          0
        ),
        validationRules: Property.Json({
          displayName: 'Validation Rules',
          description: 'Additional validation rules in JSON format',
          required: false
        })
      },
      
      async run(context) {
        const {
          formTitle,
          formDescription,
          fields,
          submitButtonText,
          allowMultipleSubmissions,
          timeoutMinutes,
          validationRules
        } = context.propsValue;
        
        const formId = SopUtils.generateFormId();
        const createdAt = new Date();
        const expiresAt = timeoutMinutes > 0 ? 
          new Date(Date.now() + (timeoutMinutes * 60 * 1000)) : null;
        
        // Parse and validate field configuration
        let formFields: FormField[] = [];
        try {
          const fieldConfig = typeof fields === 'string' ? JSON.parse(fields) : fields;
          formFields = fieldConfig.map((field: any, index: number) => ({
            id: `field_${index}`,
            name: field.name,
            type: field.type as FieldType,
            label: field.label,
            required: field.required || false,
            defaultValue: field.defaultValue,
            validation: field.validation,
            options: field.options
          }));
        } catch (error) {
          throw new Error(`Invalid form fields configuration: ${error.message}`);
        }
        
        const dataForm: SopDataForm = {
          formId,
          fields: formFields,
          status: FormStatus.AWAITING_INPUT
        };
        
        const formDefinition = {
          formId,
          title: formTitle,
          description: formDescription,
          fields: formFields,
          submitButtonText,
          allowMultipleSubmissions,
          status: FormStatus.AWAITING_INPUT,
          createdAt,
          expiresAt,
          validationRules: validationRules ? JSON.parse(validationRules) : undefined,
          metadata: {
            stepType: 'data_form',
            formType: 'structured_input'
          }
        };
        
        console.log(`[SOP Data Form] Created: ${formTitle} (${formId})`);
        
        return {
          success: true,
          formResult: dataForm,
          formDefinition,
          message: `Data collection form "${formTitle}" created successfully`,
          nextAction: 'awaiting_input',
          formUrl: `/sop/forms/${formId}`
        };
      }
    })
  ]
});
```

### Day 15: Integration and Compliance Pieces

#### 15.1 Notification Piece
```typescript
// packages/pieces/sop/src/lib/integration/notification.piece.ts
import { createPiece, PieceAuth, createAction, Property } from '@activepieces/pieces-framework';
import { SopUtils, SopValidators } from '../common';

export const notificationPiece = createPiece({
  displayName: 'Notification',
  description: 'Send notifications via email, Slack, Teams, or other channels during SOP execution',
  logoUrl: '/assets/sop/icons/notification.svg',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0',
  auth: PieceAuth.None(),
  actions: [
    createAction({
      name: 'send_notification',
      displayName: 'Send Notification',
      description: 'Send a notification to specified recipients through selected channels',
      props: {
        notificationTitle: SopValidators.requiredText(
          'Notification Title',
          'Title or subject line for the notification'
        ),
        message: SopValidators.requiredLongText(
          'Message Content',
          'The notification message content'
        ),
        notificationChannels: Property.MultiSelectDropdown({
          displayName: 'Notification Channels',
          description: 'Select the channels to send notifications through',
          required: true,
          options: {
            options: [
              { label: 'Email', value: 'email' },
              { label: 'Slack', value: 'slack' },
              { label: 'Microsoft Teams', value: 'teams' },
              { label: 'SMS', value: 'sms' },
              { label: 'In-App Notification', value: 'in_app' },
              { label: 'Webhook', value: 'webhook' }
            ]
          }
        }),
        recipients: Property.Array({
          displayName: 'Recipients',
          description: 'List of recipients (emails, usernames, phone numbers, etc.)',
          required: true
        }),
        priority: Property.StaticDropdown({
          displayName: 'Priority Level',
          description: 'Priority level for this notification',
          required: false,
          defaultValue: 'normal',
          options: {
            options: [
              { label: 'Low', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' }
            ]
          }
        }),
        includeSOPContext: Property.Checkbox({
          displayName: 'Include SOP Context',
          description: 'Include information about the current SOP execution in the notification',
          required: false,
          defaultValue: true
        }),
        deliveryDelay: SopValidators.positiveNumber(
          'Delivery Delay (minutes)',
          'Delay notification delivery by specified minutes (0 = immediate)',
          0
        ),
        requireDeliveryConfirmation: Property.Checkbox({
          displayName: 'Require Delivery Confirmation',
          description: 'Wait for delivery confirmation before proceeding?',
          required: false,
          defaultValue: false
        })
      },
      
      async run(context) {
        const {
          notificationTitle,
          message,
          notificationChannels,
          recipients,
          priority,
          includeSOPContext,
          deliveryDelay,
          requireDeliveryConfirmation
        } = context.propsValue;
        
        const notificationId = SopUtils.generateStepId();
        const scheduledAt = deliveryDelay > 0 ? 
          new Date(Date.now() + (deliveryDelay * 60 * 1000)) : new Date();
        
        const notification = {
          notificationId,
          title: notificationTitle,
          content: message,
          channels: notificationChannels,
          recipients,
          priority,
          includeSOPContext,
          scheduledAt,
          status: deliveryDelay > 0 ? 'scheduled' : 'sending',
          requireDeliveryConfirmation,
          metadata: {
            stepType: 'notification',
            notificationType: 'sop_notification'
          }
        };
        
        console.log(`[SOP Notification] Created: ${notificationTitle} (${notificationId})`);
        
        // In real implementation, this would:
        // 1. Queue the notification for delivery
        // 2. Handle different channel-specific formatting
        // 3. Track delivery status
        // 4. Retry failed deliveries
        
        return {
          success: true,
          notification,
          message: `Notification "${notificationTitle}" ${deliveryDelay > 0 ? 'scheduled' : 'sent'} successfully`,
          nextAction: requireDeliveryConfirmation ? 'awaiting_delivery_confirmation' : 'completed',
          estimatedDelivery: scheduledAt.toISOString()
        };
      }
    })
  ]
});
```

#### 15.2 Compliance Check Piece
```typescript
// packages/pieces/sop/src/lib/compliance/compliance-check.piece.ts
import { createPiece, PieceAuth, createAction, Property } from '@activepieces/pieces-framework';
import { SopUtils, SopValidators } from '../common';

export const complianceCheckPiece = createPiece({
  displayName: 'Compliance Check',
  description: 'Validate compliance with regulatory requirements and industry standards',
  logoUrl: '/assets/sop/icons/compliance-check.svg',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0',
  auth: PieceAuth.None(),
  actions: [
    createAction({
      name: 'perform_compliance_check',
      displayName: 'Perform Compliance Check',
      description: 'Execute compliance validation against specified requirements and standards',
      props: {
        complianceFramework: Property.MultiSelectDropdown({
          displayName: 'Compliance Framework(s)',
          description: 'Select the compliance frameworks to validate against',
          required: true,
          options: {
            options: [
              { label: 'ISO 9001 (Quality Management)', value: 'iso9001' },
              { label: 'ISO 27001 (Information Security)', value: 'iso27001' },
              { label: 'HIPAA (Healthcare)', value: 'hipaa' },
              { label: 'SOX (Financial)', value: 'sox' },
              { label: 'GDPR (Data Protection)', value: 'gdpr' },
              { label: 'FDA 21 CFR Part 11', value: 'fda_cfr11' },
              { label: 'SOC 2 (Security)', value: 'soc2' },
              { label: 'PCI DSS (Payment)', value: 'pci_dss' },
              { label: 'Custom Framework', value: 'custom' }
            ]
          }
        }),
        checkTitle: SopValidators.requiredText(
          'Compliance Check Title',
          'Brief title for this compliance validation'
        ),
        checklistItems: Property.Array({
          displayName: 'Compliance Checklist',
          description: 'List of items to verify for compliance',
          required: true
        }),
        requiredDocuments: Property.Array({
          displayName: 'Required Documentation',
          description: 'Documents that must be provided or verified',
          required: false
        }),
        minimumPassScore: Property.Number({
          displayName: 'Minimum Pass Score (%)',
          description: 'Minimum percentage of checklist items that must pass',
          required: false,
          defaultValue: 100
        }),
        allowPartialCompliance: Property.Checkbox({
          displayName: 'Allow Partial Compliance',
          description: 'Can the process continue with partial compliance?',
          required: false,
          defaultValue: false
        }),
        escalateFailures: Property.Checkbox({
          displayName: 'Escalate Failures',
          description: 'Automatically escalate compliance failures to management?',
          required: false,
          defaultValue: true
        }),
        auditTrailRequired: Property.Checkbox({
          displayName: 'Audit Trail Required',
          description: 'Maintain detailed audit trail for this compliance check?',
          required: false,
          defaultValue: true
        })
      },
      
      async run(context) {
        const {
          complianceFramework,
          checkTitle,
          checklistItems,
          requiredDocuments,
          minimumPassScore,
          allowPartialCompliance,
          escalateFailures,
          auditTrailRequired
        } = context.propsValue;
        
        const checkId = SopUtils.generateStepId();
        const startedAt = new Date();
        
        // Initialize checklist with pending status
        const checklist = (checklistItems || []).map((item: string, index: number) => ({
          id: `check_${index}`,
          item,
          status: 'pending',
          evidence: null,
          verifiedBy: null,
          verifiedAt: null,
          comments: null
        }));
        
        const complianceCheck = {
          checkId,
          title: checkTitle,
          frameworks: complianceFramework,
          checklist,
          requiredDocuments: requiredDocuments || [],
          minimumPassScore,
          allowPartialCompliance,
          escalateFailures,
          auditTrailRequired,
          status: 'in_progress',
          startedAt,
          currentScore: 0,
          metadata: {
            stepType: 'compliance_check',
            complianceType: 'regulatory_validation',
            totalItems: checklist.length
          }
        };
        
        console.log(`[SOP Compliance] Started: ${checkTitle} (${checkId})`);
        
        return {
          success: true,
          complianceResult: complianceCheck,
          message: `Compliance check "${checkTitle}" initiated successfully`,
          nextAction: 'awaiting_validation',
          checkUrl: `/sop/compliance/${checkId}`,
          frameworks: complianceFramework,
          totalItems: checklist.length
        };
      }
    })
  ]
});
```

### Day 16: Piece Registration and Testing

#### 16.1 SOP Pieces Index
```typescript
// packages/pieces/sop/src/index.ts
export { processStepPiece } from './lib/process/process-step.piece';
export { decisionPointPiece } from './lib/process/decision-point.piece';
export { approvalGatePiece } from './lib/human/approval-gate.piece';
export { dataFormPiece } from './lib/human/data-form.piece';
export { notificationPiece } from './lib/integration/notification.piece';
export { complianceCheckPiece } from './lib/compliance/compliance-check.piece';

// Export common types and utilities
export * from './lib/common/types/sop.types';
export * from './lib/common/utils/sop.utils';
export * from './lib/common/validators/sop.validators';

// Main pieces array for registration
export const SOP_PIECES = [
  processStepPiece,
  decisionPointPiece,
  approvalGatePiece,
  dataFormPiece,
  notificationPiece,
  complianceCheckPiece
];
```

#### 16.2 Piece Registration Service
```typescript
// packages/ui/frontend/src/app/modules/sop/services/sop-pieces.service.ts
import { Injectable } from '@angular/core';
import { SOP_PIECES } from '@sop-tool/pieces';

@Injectable({
  providedIn: 'root'
})
export class SopPiecesService {
  
  private registeredPieces: Map<string, any> = new Map();
  
  constructor() {
    this.registerSopPieces();
  }
  
  private registerSopPieces(): void {
    SOP_PIECES.forEach(piece => {
      this.registeredPieces.set(piece.name, piece);
      console.log(`[SOP Pieces] Registered: ${piece.displayName}`);
    });
  }
  
  getAvailablePieces(): any[] {
    return Array.from(this.registeredPieces.values());
  }
  
  getPieceByName(name: string): any | null {
    return this.registeredPieces.get(name) || null;
  }
  
  getPiecesByCategory(category: string): any[] {
    return this.getAvailablePieces().filter(piece => 
      piece.categories && piece.categories.includes(category)
    );
  }
  
  searchPieces(searchTerm: string): any[] {
    const term = searchTerm.toLowerCase();
    return this.getAvailablePieces().filter(piece =>
      piece.displayName.toLowerCase().includes(term) ||
      piece.description.toLowerCase().includes(term)
    );
  }
}
```

## Testing and Integration

### Unit Tests
```typescript
// packages/pieces/sop/src/lib/process/process-step.piece.test.ts
import { processStepPiece } from './process-step.piece';

describe('ProcessStepPiece', () => {
  it('should execute process step successfully', async () => {
    const context = {
      propsValue: {
        stepTitle: 'Test Step',
        instructions: 'Test instructions',
        estimatedTime: 10,
        checklistItems: ['Item 1', 'Item 2'],
        requiresSignoff: false,
        category: 'general'
      }
    };
    
    const action = processStepPiece.actions[0];
    const result = await action.run(context);
    
    expect(result.success).toBe(true);
    expect(result.stepResult.title).toBe('Test Step');
    expect(result.stepResult.metadata.checklist).toHaveLength(2);
  });
});
```

## Deliverables

1. **8 Custom SOP Pieces** - Complete implementation of workflow pieces
2. **Common Types and Utilities** - Shared functionality across pieces
3. **Validation Framework** - Input validation and error handling
4. **Registration System** - Integration with Activepieces framework
5. **Unit Tests** - Test coverage for all pieces
6. **Documentation** - Usage guides for each piece

Phase 3 provides the core workflow building blocks that clients use to design their SOPs, following the Activepieces framework while being tailored specifically for standard operating procedure creation.