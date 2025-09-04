# SOP Process Step Piece

The SOP Process Step Piece is the foundational concrete implementation of individual process steps within Standard Operating Procedure (SOP) workflows. This piece provides comprehensive execution tracking, compliance validation, audit capabilities, and error handling for business process automation.

## Overview

This piece extends the BaseSoPiece framework to provide:
- **Individual Task Execution**: Execute specific tasks within SOP workflows
- **Compliance Tracking**: Built-in compliance validation and reporting
- **Audit Trail**: Complete execution logging and audit capabilities
- **Error Handling**: Comprehensive error handling with retry logic
- **Approval Workflows**: Optional approval gates for critical steps
- **State Management**: Full lifecycle state tracking

## Features

### Core Functionality
- ✅ **Process Step Execution** - Execute individual workflow steps with full context
- ✅ **Input/Output Management** - Structured data handling and transformation
- ✅ **Validation System** - Multi-layer validation with custom rules
- ✅ **Audit Logging** - Complete execution audit trail
- ✅ **Error Handling** - Retry logic and escalation procedures
- ✅ **State Tracking** - Full step lifecycle management

### SOP Integration
- ✅ **BaseSoPiece Extension** - Built on GROUP G foundation framework
- ✅ **SOP Type System** - Full integration with SOP types and interfaces
- ✅ **Compliance Framework** - Automated compliance checking
- ✅ **Workflow Context** - Integration with SOPWorkflowContext
- ✅ **Execution Engine** - Powered by SOPExecutionEngine

### Activepieces Integration
- ✅ **Native Piece Structure** - Follows Activepieces piece patterns
- ✅ **Property System** - Rich configuration properties
- ✅ **Trigger Support** - Event-driven workflow triggers
- ✅ **Action Framework** - Comprehensive action implementation
- ✅ **Category Mapping** - Proper Activepieces categorization

## Usage

### Basic Process Step

```typescript
// Configure a simple process step
const stepConfig = {
  stepTitle: "Validate Customer Information",
  instructions: "Verify customer details and required documentation",
  inputData: {
    customerId: "12345",
    customerName: "John Doe",
    documents: ["id", "proof_of_address"]
  },
  priority: SOPPriority.HIGH,
  estimatedDuration: 30,
  enableAuditTrail: true,
  enableComplianceCheck: true
}
```

### Advanced Process Step with Approval

```typescript
// Configure step requiring approval
const approvalStepConfig = {
  stepTitle: "Approve Credit Limit Increase",
  instructions: "Review customer credit history and approve limit increase",
  inputData: {
    customerId: "12345",
    currentLimit: 5000,
    requestedLimit: 10000,
    creditScore: 750
  },
  requiresApproval: true,
  approvers: ["manager@company.com", "credit.officer@company.com"],
  successCriteria: ["approval_granted", "limit_updated"],
  priority: SOPPriority.URGENT,
  estimatedDuration: 60
}
```

### Custom Validation Rules

```typescript
// Process step with custom validation
const validatedStepConfig = {
  stepTitle: "Process Payment",
  instructions: "Process customer payment and update account",
  inputData: {
    paymentAmount: 1500,
    paymentMethod: "credit_card",
    accountId: "acc_123"
  },
  validationRules: [
    "required_field:paymentAmount",
    "min_value:paymentAmount:1",
    "required_field:accountId"
  ],
  successCriteria: ["payment_processed", "account_updated"],
  outputFormat: "json"
}
```

## Configuration Properties

### Core Properties
- **stepTitle** - Clear, descriptive title for the process step
- **instructions** - Detailed step-by-step instructions
- **inputData** - Data to be processed by this step
- **priority** - Priority level (Low, Normal, High, Urgent, Critical)
- **estimatedDuration** - Expected completion time in minutes

### SOP Properties
- **enableComplianceCheck** - Enable compliance validation
- **enableAuditTrail** - Enable audit trail logging (default: true)
- **assignedTo** - User responsible for step execution
- **dueDate** - When step should be completed
- **customVariables** - Custom variables for step instance
- **tags** - Tags for categorization and filtering

### Advanced Features
- **requiresApproval** - Whether step requires approval before proceeding
- **approvers** - List of users who can approve this step
- **successCriteria** - Criteria defining successful completion
- **failureCriteria** - Criteria indicating step failure
- **skipConditions** - Conditions allowing step to be skipped
- **validationRules** - Custom validation rules
- **outputFormat** - Expected output format (JSON, Text, File, Boolean)

### Error Handling
- **retryAttempts** - Number of retry attempts on failure
- **timeout** - Maximum execution time in minutes
- **errorHandling** - Error handling configuration
- **escalationSettings** - Escalation rules and procedures

## Triggers

### Process Step Event Trigger

Responds to step lifecycle events:
- `step_started` - Step execution begins
- `step_completed` - Step completes successfully
- `step_failed` - Step execution fails
- `step_paused` - Step is paused
- `approval_required` - Step requires approval
- `approval_granted` - Step approval granted
- `approval_rejected` - Step approval rejected
- `escalation_triggered` - Step escalated
- `compliance_failed` - Compliance check failed
- `timeout_occurred` - Step timeout occurred

### Trigger Configuration
```typescript
{
  eventType: ["step_completed", "step_failed"],
  priorityFilter: [SOPPriority.HIGH, SOPPriority.URGENT],
  assigneeFilter: "user@company.com",
  tagFilter: ["critical", "customer-facing"],
  includeAuditTrail: true,
  includeCustomVariables: true
}
```

## Validation Framework

### Built-in Validations
- **Configuration Validation** - Step title, instructions, duration limits
- **Input Data Validation** - Type checking, required fields, size limits
- **Schema Validation** - JSON schema compliance
- **Security Validation** - Sensitive data detection
- **Performance Validation** - Duration and complexity warnings

### Custom Validation Rules
- `data_not_empty` - Ensure input data is not empty
- `required_field:fieldName` - Require specific field
- `min_length:fieldName:N` - Minimum string length
- Custom rule patterns can be extended

### Compliance Checks
- Audit trail enablement
- Step instructions provided
- Required permissions defined
- Custom compliance rules

## Output Examples

### Successful Execution
```json
{
  "success": true,
  "executionId": "exec_abc123",
  "sopId": "sop_def456",
  "stepTitle": "Validate Customer Information",
  "executionTime": 25000,
  "result": {
    "validationResult": "passed",
    "documentsVerified": true,
    "customerStatus": "verified"
  },
  "complianceStatus": "COMPLIANT",
  "auditTrail": [
    {
      "timestamp": "2024-01-15T10:00:00.000Z",
      "action": "step_started",
      "userId": "user@company.com",
      "details": {
        "stepTitle": "Validate Customer Information",
        "estimatedDuration": 30
      }
    }
  ],
  "metadata": {
    "executedBy": "user@company.com",
    "completedAt": "2024-01-15T10:25:00.000Z",
    "priority": "HIGH",
    "tags": ["validation", "customer"]
  }
}
```

### Approval Required
```json
{
  "success": true,
  "status": "waiting_approval",
  "executionId": "exec_xyz789",
  "stepTitle": "Approve Credit Limit Increase",
  "approvers": ["manager@company.com"],
  "message": "Step is pending approval",
  "auditTrail": [...]
}
```

### Execution Error
```json
{
  "success": false,
  "executionId": "exec_error123",
  "sopId": "sop_def456",
  "stepTitle": "Process Payment",
  "executionTime": 5000,
  "error": "Validation failed: Required field 'paymentAmount' is missing",
  "complianceStatus": "NON_COMPLIANT",
  "auditTrail": [...],
  "metadata": {
    "executedBy": "user@company.com",
    "failedAt": "2024-01-15T10:05:00.000Z",
    "priority": "NORMAL"
  }
}
```

## Integration with SOP Framework

This piece is built on the GROUP G foundation and integrates seamlessly with:

- **BaseSoPiece** - Extends the base SOP piece class
- **SOPWorkflowContext** - Maintains workflow state and context
- **SOPValidationFramework** - Comprehensive validation system
- **SOPExecutionEngine** - Core execution engine
- **SOP Types** - Complete type system integration
- **SOP Utilities** - Common utilities and helpers

## Error Handling

### Error Types
- `VALIDATION_ERROR` - Input validation failures
- `EXECUTION_ERROR` - Step execution failures
- `TIMEOUT_ERROR` - Step timeout exceeded
- `PERMISSION_ERROR` - Insufficient permissions
- `COMPLIANCE_ERROR` - Compliance validation failures
- `APPROVAL_ERROR` - Approval workflow errors
- `ESCALATION_ERROR` - Escalation procedure failures

### Recovery Strategies
- Automatic retry with configurable attempts
- Escalation to higher authority levels
- Fallback to alternative execution paths
- Manual intervention workflows

## Performance Considerations

- Input data size limits (1MB maximum)
- Execution timeout management
- Efficient audit trail storage
- Optimized validation processing
- Memory-safe operations

## Compliance and Audit

### Audit Trail Features
- Complete execution history
- User action tracking
- State transition logging
- Error and exception recording
- Performance metrics capture

### Compliance Integration
- Automated compliance checking
- Rule-based validation
- Regulatory requirement tracking
- Evidence collection and storage
- Audit report generation

## Development and Extension

The Process Step Piece provides a solid foundation for creating specialized SOP pieces. The architecture supports:

- Custom validation rule development
- Extended error handling strategies
- Specialized output formatters
- Custom approval workflows
- Integration with external systems

## Version

Current version: **0.1.0**

Built with:
- SOP Framework v0.1.0
- Activepieces Framework v0.52.0+
- TypeScript 5.0+

---

This Process Step Piece represents the first concrete implementation of the SOP Framework, providing a robust foundation for Standard Operating Procedure automation within Activepieces workflows.