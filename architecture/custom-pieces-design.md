# Custom SOP Pieces Design

## Overview

Custom pieces are the core building blocks of the SOP Designer Tool. They represent the specific workflow elements that clients use to design their standard operating procedures. Each piece follows the Activepieces framework while being tailored for SOP creation.

## SOP Piece Categories

### 1. Process Category
Basic workflow steps that make up the core procedure logic.

#### ProcessStep Piece
```typescript
@Piece({
  displayName: 'Process Step',
  description: 'A standard operating procedure step with instructions and validation',
  logoUrl: '/assets/sop/icons/process-step.svg',
  version: '1.0.0',
  categories: ['sop', 'process'],
  minimumSupportedRelease: '0.20.0'
})
export class ProcessStepPiece {
  
  @PieceAction({
    displayName: 'Execute Process Step',
    description: 'Execute a documented procedure step'
  })
  static async executeStep(context: ActionContext<ProcessStepConfig>): Promise<ProcessStepResult> {
    const { stepTitle, instructions, checklistItems, estimatedTime } = context.propsValue;
    
    return {
      stepId: generateStepId(),
      title: stepTitle,
      instructions: instructions,
      checklist: checklistItems.map(item => ({ item, completed: false })),
      startTime: new Date(),
      estimatedDuration: estimatedTime,
      status: 'in_progress'
    };
  }
}

interface ProcessStepConfig {
  stepTitle: Property.ShortText({
    displayName: 'Step Title',
    description: 'Brief title for this process step',
    required: true
  });
  
  instructions: Property.LongText({
    displayName: 'Step Instructions', 
    description: 'Detailed instructions for completing this step',
    required: true
  });
  
  checklistItems: Property.Array({
    displayName: 'Checklist Items',
    description: 'Optional checklist items for this step'
  });
  
  estimatedTime: Property.Number({
    displayName: 'Estimated Time (minutes)',
    description: 'Expected time to complete this step',
    required: false,
    defaultValue: 5
  });
}
```

#### DecisionPoint Piece
```typescript
@Piece({
  displayName: 'Decision Point',
  description: 'A conditional decision point in the SOP with multiple paths',
  logoUrl: '/assets/sop/icons/decision-point.svg',
  version: '1.0.0',
  categories: ['sop', 'process', 'logic']
})
export class DecisionPointPiece {
  
  @PieceAction({
    displayName: 'Process Decision',
    description: 'Evaluate decision criteria and determine next path'
  })
  static async processDecision(context: ActionContext<DecisionConfig>): Promise<DecisionResult> {
    const { decisionTitle, criteria, options } = context.propsValue;
    
    return {
      decisionId: generateDecisionId(),
      title: decisionTitle,
      criteria: criteria,
      availableOptions: options,
      requiresHumanInput: true,
      timestamp: new Date()
    };
  }
}

interface DecisionConfig {
  decisionTitle: Property.ShortText({
    displayName: 'Decision Title',
    description: 'What decision needs to be made?',
    required: true
  });
  
  criteria: Property.LongText({
    displayName: 'Decision Criteria',
    description: 'What factors should be considered in this decision?',
    required: true
  });
  
  options: Property.Array({
    displayName: 'Decision Options',
    description: 'Available options for this decision',
    required: true
  });
}
```

### 2. Human Category
Steps that require human interaction, approval, or input.

#### ApprovalGate Piece
```typescript
@Piece({
  displayName: 'Approval Gate',
  description: 'Require approval from designated personnel before proceeding',
  logoUrl: '/assets/sop/icons/approval-gate.svg',
  version: '1.0.0',
  categories: ['sop', 'human', 'approval']
})
export class ApprovalGatePiece {
  
  @PieceAction({
    displayName: 'Request Approval',
    description: 'Submit request for approval and wait for response'
  })
  static async requestApproval(context: ActionContext<ApprovalConfig>): Promise<ApprovalResult> {
    const { approvalTitle, approverRoles, approvalCriteria, escalationTime } = context.propsValue;
    
    return {
      approvalId: generateApprovalId(),
      title: approvalTitle,
      requiredApprovers: approverRoles,
      criteria: approvalCriteria,
      status: 'pending',
      submittedAt: new Date(),
      escalatesAt: new Date(Date.now() + escalationTime * 60000),
      approvalUrl: generateApprovalUrl()
    };
  }
}

interface ApprovalConfig {
  approvalTitle: Property.ShortText({
    displayName: 'Approval Request Title',
    description: 'What needs to be approved?',
    required: true
  });
  
  approverRoles: Property.MultiSelectDropdown({
    displayName: 'Required Approver Roles',
    description: 'Who can approve this request?',
    required: true,
    options: {
      options: [
        { label: 'Manager', value: 'manager' },
        { label: 'Department Head', value: 'dept_head' },
        { label: 'Quality Assurance', value: 'qa' },
        { label: 'Compliance Officer', value: 'compliance' },
        { label: 'Executive', value: 'executive' }
      ]
    }
  });
  
  approvalCriteria: Property.LongText({
    displayName: 'Approval Criteria',
    description: 'What criteria should be evaluated for approval?',
    required: true
  });
  
  escalationTime: Property.Number({
    displayName: 'Escalation Time (hours)',
    description: 'Hours before approval request escalates',
    defaultValue: 24
  });
}
```

#### DataForm Piece
```typescript
@Piece({
  displayName: 'Data Collection Form',
  description: 'Collect structured data input from users',
  logoUrl: '/assets/sop/icons/data-form.svg',
  version: '1.0.0',
  categories: ['sop', 'human', 'data']
})
export class DataFormPiece {
  
  @PieceAction({
    displayName: 'Collect Data',
    description: 'Display form and collect user input'
  })
  static async collectData(context: ActionContext<DataFormConfig>): Promise<DataFormResult> {
    const { formTitle, fields, validationRules } = context.propsValue;
    
    return {
      formId: generateFormId(),
      title: formTitle,
      fields: fields.map(field => ({ ...field, value: null })),
      validation: validationRules,
      status: 'awaiting_input',
      formUrl: generateFormUrl(),
      createdAt: new Date()
    };
  }
}

interface DataFormConfig {
  formTitle: Property.ShortText({
    displayName: 'Form Title',
    description: 'Title for the data collection form',
    required: true
  });
  
  fields: Property.Array({
    displayName: 'Form Fields',
    description: 'Fields to collect data',
    required: true
  });
  
  validationRules: Property.Json({
    displayName: 'Validation Rules',
    description: 'JSON schema for validating collected data',
    required: false
  });
}
```

### 3. Integration Category
Steps that interact with external systems or send notifications.

#### Notification Piece
```typescript
@Piece({
  displayName: 'Notification',
  description: 'Send notifications via email, Slack, or other channels',
  logoUrl: '/assets/sop/icons/notification.svg',
  version: '1.0.0',
  categories: ['sop', 'integration', 'notification']
})
export class NotificationPiece {
  
  @PieceAction({
    displayName: 'Send Notification',
    description: 'Send notification to specified recipients'
  })
  static async sendNotification(context: ActionContext<NotificationConfig>): Promise<NotificationResult> {
    const { notificationType, recipients, subject, message, priority } = context.propsValue;
    
    // Integration with actual notification services would go here
    return {
      notificationId: generateNotificationId(),
      type: notificationType,
      recipients: recipients,
      subject: subject,
      content: message,
      priority: priority,
      status: 'sent',
      sentAt: new Date()
    };
  }
}

interface NotificationConfig {
  notificationType: Property.StaticDropdown({
    displayName: 'Notification Type',
    required: true,
    options: {
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Slack', value: 'slack' },
        { label: 'Microsoft Teams', value: 'teams' },
        { label: 'SMS', value: 'sms' }
      ]
    }
  });
  
  recipients: Property.Array({
    displayName: 'Recipients',
    description: 'Who should receive this notification?',
    required: true
  });
  
  subject: Property.ShortText({
    displayName: 'Subject/Title',
    description: 'Notification subject or title',
    required: true
  });
  
  message: Property.LongText({
    displayName: 'Message',
    description: 'Notification content',
    required: true
  });
  
  priority: Property.StaticDropdown({
    displayName: 'Priority',
    defaultValue: 'normal',
    options: {
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
      ]
    }
  });
}
```

#### DocumentStorage Piece
```typescript
@Piece({
  displayName: 'Document Storage',
  description: 'Save or retrieve documents from storage systems',
  logoUrl: '/assets/sop/icons/document-storage.svg',
  version: '1.0.0',
  categories: ['sop', 'integration', 'documents']
})
export class DocumentStoragePiece {
  
  @PieceAction({
    displayName: 'Store Document',
    description: 'Save document to designated storage location'
  })
  static async storeDocument(context: ActionContext<DocumentStorageConfig>): Promise<DocumentStorageResult> {
    const { storageLocation, documentName, documentType, metadata } = context.propsValue;
    
    return {
      documentId: generateDocumentId(),
      name: documentName,
      type: documentType,
      location: storageLocation,
      metadata: metadata,
      storedAt: new Date(),
      accessUrl: generateDocumentUrl(),
      version: '1.0'
    };
  }
}

interface DocumentStorageConfig {
  storageLocation: Property.StaticDropdown({
    displayName: 'Storage Location',
    required: true,
    options: {
      options: [
        { label: 'SharePoint', value: 'sharepoint' },
        { label: 'Google Drive', value: 'gdrive' },
        { label: 'Local Storage', value: 'local' },
        { label: 'AWS S3', value: 's3' }
      ]
    }
  });
  
  documentName: Property.ShortText({
    displayName: 'Document Name',
    description: 'Name for the stored document',
    required: true
  });
  
  documentType: Property.StaticDropdown({
    displayName: 'Document Type',
    required: true,
    options: {
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'Word Document', value: 'docx' },
        { label: 'Excel Spreadsheet', value: 'xlsx' },
        { label: 'Text File', value: 'txt' }
      ]
    }
  });
  
  metadata: Property.Json({
    displayName: 'Document Metadata',
    description: 'Additional metadata for the document',
    required: false
  });
}
```

### 4. Compliance Category
Steps that ensure regulatory compliance and quality control.

#### ComplianceCheck Piece
```typescript
@Piece({
  displayName: 'Compliance Check',
  description: 'Validate compliance with regulatory requirements',
  logoUrl: '/assets/sop/icons/compliance-check.svg',
  version: '1.0.0',
  categories: ['sop', 'compliance', 'validation']
})
export class ComplianceCheckPiece {
  
  @PieceAction({
    displayName: 'Perform Compliance Check',
    description: 'Validate process against compliance requirements'
  })
  static async performComplianceCheck(context: ActionContext<ComplianceConfig>): Promise<ComplianceResult> {
    const { complianceFramework, checklistItems, documentation } = context.propsValue;
    
    return {
      checkId: generateComplianceId(),
      framework: complianceFramework,
      checklist: checklistItems.map(item => ({ item, status: 'pending' })),
      documentationRequired: documentation,
      status: 'in_progress',
      startedAt: new Date(),
      complianceScore: 0
    };
  }
}

interface ComplianceConfig {
  complianceFramework: Property.StaticDropdown({
    displayName: 'Compliance Framework',
    required: true,
    options: {
      options: [
        { label: 'ISO 9001', value: 'iso9001' },
        { label: 'HIPAA', value: 'hipaa' },
        { label: 'SOX', value: 'sox' },
        { label: 'GDPR', value: 'gdpr' },
        { label: 'FDA 21 CFR Part 11', value: 'fda_cfr11' },
        { label: 'SOC 2', value: 'soc2' }
      ]
    }
  });
  
  checklistItems: Property.Array({
    displayName: 'Compliance Checklist',
    description: 'Items to verify for compliance',
    required: true
  });
  
  documentation: Property.Array({
    displayName: 'Required Documentation',
    description: 'Documents that must be provided for compliance',
    required: false
  });
}
```

#### QualityGate Piece
```typescript
@Piece({
  displayName: 'Quality Gate',
  description: 'Quality control checkpoint with pass/fail criteria',
  logoUrl: '/assets/sop/icons/quality-gate.svg',
  version: '1.0.0',
  categories: ['sop', 'compliance', 'quality']
})
export class QualityGatePiece {
  
  @PieceAction({
    displayName: 'Execute Quality Check',
    description: 'Perform quality control validation'
  })
  static async executeQualityCheck(context: ActionContext<QualityGateConfig>): Promise<QualityGateResult> {
    const { qualityStandard, measurements, acceptanceCriteria } = context.propsValue;
    
    return {
      qualityCheckId: generateQualityId(),
      standard: qualityStandard,
      measurements: measurements.map(m => ({ ...m, actualValue: null, passed: false })),
      criteria: acceptanceCriteria,
      status: 'awaiting_measurements',
      startedAt: new Date(),
      overallResult: 'pending'
    };
  }
}

interface QualityGateConfig {
  qualityStandard: Property.ShortText({
    displayName: 'Quality Standard',
    description: 'Which quality standard applies?',
    required: true
  });
  
  measurements: Property.Array({
    displayName: 'Quality Measurements',
    description: 'What measurements need to be taken?',
    required: true
  });
  
  acceptanceCriteria: Property.LongText({
    displayName: 'Acceptance Criteria',
    description: 'What criteria must be met to pass this quality gate?',
    required: true
  });
}
```

## Piece Development Framework

### Base Piece Structure
```typescript
// All SOP pieces follow this base structure:
export abstract class BaseSopPiece {
  protected generateId(): string {
    return `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  protected logActivity(activity: string, context: any): void {
    // Consistent logging across all pieces
    console.log(`[SOP] ${activity}:`, context);
  }
  
  protected validateRequired(value: any, fieldName: string): void {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
  }
}
```

### Property Types for SOP Context
```typescript
// Custom property types for SOP-specific needs:
export const SopProperty = {
  Role: (config: any) => Property.StaticDropdown({
    ...config,
    options: {
      options: [
        { label: 'Manager', value: 'manager' },
        { label: 'Team Lead', value: 'team_lead' },
        { label: 'Specialist', value: 'specialist' },
        { label: 'Quality Assurance', value: 'qa' },
        { label: 'Compliance Officer', value: 'compliance' }
      ]
    }
  }),
  
  Priority: (config: any) => Property.StaticDropdown({
    ...config,
    options: {
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' }
      ]
    }
  }),
  
  Duration: (config: any) => Property.Number({
    ...config,
    description: config.description || 'Duration in minutes'
  })
};
```

### Piece Registration System
```typescript
// Register all SOP pieces in a central location:
export const SOP_PIECES = [
  ProcessStepPiece,
  DecisionPointPiece,
  ApprovalGatePiece,
  DataFormPiece,
  NotificationPiece,
  DocumentStoragePiece,
  ComplianceCheckPiece,
  QualityGatePiece
];

export function registerSopPieces(): void {
  SOP_PIECES.forEach(piece => {
    // Register with Activepieces framework
    pieceManager.register(piece);
  });
}
```

## Implementation Guidelines

### Development Standards
1. **TypeScript First**: All pieces must be written in TypeScript with proper types
2. **Error Handling**: Comprehensive error handling with meaningful messages
3. **Validation**: Input validation for all required fields
4. **Logging**: Consistent logging for debugging and audit trails
5. **Testing**: Unit tests for each piece's core functionality

### UI Integration
```typescript
// Each piece needs corresponding UI components:
interface SopPieceUI {
  icon: string;                    // SVG icon for the piece
  category: string;                // Category in the pieces palette
  description: string;             // Tooltip description
  configComponent: Component;      // Configuration UI component
  displayComponent: Component;     // Canvas display component
}
```

### Export Integration
Each piece must support export to the SOP specification format:

```typescript
interface PieceExportData {
  pieceType: string;
  configuration: any;
  connections: Connection[];
  metadata: {
    position: { x: number, y: number };
    title: string;
    description: string;
  };
}
```

This design provides a comprehensive set of building blocks for SOP creation while maintaining consistency with the Activepieces framework and supporting the export requirements for automation specification generation.