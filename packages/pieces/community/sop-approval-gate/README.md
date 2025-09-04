# SOP Approval Gate

Comprehensive approval workflow management piece for Standard Operating Procedure (SOP) processes with multi-level approval support, escalation chains, and complete audit trails.

## Overview

The SOP Approval Gate piece provides enterprise-grade approval workflow capabilities for Activepieces, designed specifically for SOP compliance and governance requirements. It supports complex approval scenarios including sequential approvals, parallel approvals, consensus-based decisions, and automated escalation management.

## Features

### Approval Workflow Types
- **Single Approver**: Simple one-person approval
- **Sequential Approval**: Multiple approvers in sequence
- **Parallel Approval**: Multiple approvers simultaneously
- **Consensus Approval**: Majority or unanimous approval
- **Conditional Approval**: Rules-based approval routing

### Escalation Management
- **Timeout-based Escalation**: Automatic escalation on approval timeouts
- **Manual Escalation**: User-triggered escalation to higher authority
- **Chain Escalation**: Multi-level escalation chains with customizable rules
- **Emergency Escalation**: Fast-track escalation for critical requests

### Audit and Compliance
- **Complete Audit Trails**: Full history of all approval actions and decisions
- **Compliance Validation**: Automated compliance checks and reporting
- **Digital Signatures**: Cryptographic proof of approval decisions
- **Retention Management**: Configurable data retention for regulatory compliance

### Notification System
- **Multi-channel Notifications**: Email, SMS, Slack, Teams, webhooks
- **Customizable Templates**: Personalized notification messages
- **Reminder System**: Automated reminders for pending approvals
- **Escalation Alerts**: Immediate notifications for escalated requests

## Actions

### 1. Initiate Approval Gate
Creates and starts a new approval workflow.

**Key Properties:**
- `title`: Clear approval request title
- `description`: Detailed explanation of what needs approval
- `approvalType`: Type of approval workflow (single, sequential, parallel, consensus, conditional)
- `approvers`: List of approvers with roles and contact information
- `priority`: Priority level (LOW, NORMAL, HIGH, URGENT, CRITICAL)
- `dueDate`: When approval should be completed
- `escalationChain`: Users to escalate to on timeout
- `notificationChannels`: Channels for notifications (email, SMS, etc.)

**Example:**
```typescript
{
  title: "Q4 Marketing Budget Approval",
  description: "Approval required for Q4 marketing budget allocation of $75,000",
  approvalType: "sequential",
  approvers: [
    {
      id: "dept_manager",
      name: "Department Manager",
      email: "manager@company.com",
      level: 1
    },
    {
      id: "cfo",
      name: "Chief Financial Officer", 
      email: "cfo@company.com",
      level: 2
    }
  ],
  priority: "HIGH",
  dueDate: "2025-01-10T17:00:00Z",
  approvalTimeoutHours: 24,
  escalationChain: ["director@company.com", "ceo@company.com"],
  notificationChannels: ["email", "slack"]
}
```

### 2. Process Approval Response
Processes individual approval responses and updates workflow state.

**Key Properties:**
- `requestId`: Approval request ID
- `approverId`: ID of person providing approval
- `decision`: Approval decision (approved, rejected, delegated, abstained)
- `comments`: Comments supporting the decision
- `confidence`: Confidence level in the decision (0.0 to 1.0)
- `delegatedTo`: User to delegate to (if delegating)

### 3. Escalate Approval
Escalates approval requests to higher authority levels.

**Key Properties:**
- `requestId`: Request to escalate
- `escalationTrigger`: Reason for escalation (timeout, rejection, manual, etc.)
- `escalationReason`: Detailed explanation
- `escalatedBy`: Who initiated the escalation
- `escalationTarget`: How to determine escalation recipient
- `escalatedPriority`: New priority level for escalated approval

### 4. Query Approval Status
Retrieves current status and details of approval requests.

**Key Properties:**
- `requestId`: Specific request ID to query
- `status`: Filter by status (pending, approved, rejected, etc.)
- `priority`: Filter by priority level
- `includeAuditTrail`: Include detailed audit trail
- `includeApprovalHistory`: Include complete approval history

### 5. Cancel Approval
Cancels active approval requests with proper cleanup.

**Key Properties:**
- `requestId`: Request to cancel
- `cancelledBy`: Who is cancelling the request
- `cancellationReason`: Reason for cancellation
- `notifyApprovers`: Notify pending approvers
- `cleanupWorkflow`: Remove workflow data and tasks

### 6. Bulk Approval Process
Process multiple approval requests simultaneously.

**Key Properties:**
- `requestIds`: Array of request IDs to process
- `operation`: Bulk operation (approve, reject, delegate, cancel, etc.)
- `decision`: Decision to apply to all requests
- `maxBatchSize`: Maximum requests per batch
- `continueOnError`: Continue processing if some fail

### 7. Configure Approval Workflow
Create reusable approval workflow templates.

**Key Properties:**
- `workflowName`: Template name
- `workflowType`: Structure type (single_stage, multi_stage_sequential, etc.)
- `stages`: Configuration for each approval stage
- `escalationRules`: Rules for escalating approvals
- `validationRules`: Rules for validating requests

## Triggers

### 1. Approval Request Trigger
Triggers when new approval requests are created or assigned.

**Configuration:**
- `triggerScope`: What events to monitor (new_requests, assigned_to_me, etc.)
- `categories`: Only trigger for specific categories
- `minimumPriority`: Minimum priority level to trigger
- `businessHoursOnly`: Only trigger during business hours

### 2. Approval Status Change Trigger
Triggers when approval status changes (approved, rejected, etc.).

**Configuration:**
- `statusChanges`: Status changes to monitor
- `decisionTypes`: Types of decisions to monitor
- `includeApprovalHistory`: Include history in trigger data
- `deduplicationWindow`: Prevent duplicate triggers

### 3. Escalation Trigger
Triggers when approvals are escalated to higher levels.

**Configuration:**
- `escalationTypes`: Types of escalations to monitor
- `escalationLevels`: Specific escalation levels to monitor
- `emergencyOnly`: Only trigger for emergency escalations
- `includeEscalationChain`: Include chain information

## Integration Examples

### Basic Budget Approval
```typescript
// Initiate a budget approval
await initiateApprovalGate.run({
  propsValue: {
    title: "Monthly Budget Approval - Marketing",
    description: "Approval for monthly marketing budget of $25,000",
    approvalType: "sequential",
    approvers: [
      { id: "marketing_manager", name: "Marketing Manager", level: 1 },
      { id: "finance_director", name: "Finance Director", level: 2 }
    ],
    priority: "NORMAL",
    approvalTimeoutHours: 48,
    enableComplianceCheck: true,
    notificationChannels: ["email"]
  }
});
```

### High-Value Purchase Approval
```typescript
// Initiate high-value purchase approval with consensus
await initiateApprovalGate.run({
  propsValue: {
    title: "Capital Equipment Purchase - $150,000",
    description: "Approval for new manufacturing equipment purchase",
    approvalType: "consensus",
    approvers: [
      { id: "operations_director", name: "Operations Director" },
      { id: "finance_director", name: "Finance Director" },
      { id: "ceo", name: "CEO" }
    ],
    consensusThreshold: 0.67,
    priority: "HIGH",
    approvalTimeoutHours: 72,
    escalationChain: ["board_chair"],
    complianceRequired: true,
    auditLevel: "comprehensive"
  }
});
```

### Emergency Approval Process
```typescript
// Handle emergency approval with immediate escalation
await initiateApprovalGate.run({
  propsValue: {
    title: "Emergency System Maintenance Approval",
    description: "Urgent approval needed for critical system maintenance",
    approvalType: "single",
    approvers: [{ id: "it_director", name: "IT Director" }],
    priority: "CRITICAL",
    approvalTimeoutHours: 2,
    escalationChain: ["cto", "ceo"],
    autoEscalateOnTimeout: true,
    notificationChannels: ["email", "sms", "slack"]
  }
});
```

## SOP Framework Integration

The Approval Gate piece extends the BaseSoPiece framework and integrates seamlessly with other SOP components:

```typescript
import { SOPApprovalGatePiece, ApprovalGateConfig } from '@activepieces/piece-sop-approval-gate';

// Create custom approval gate with SOP compliance
const approvalGate = new SOPApprovalGatePiece({
  displayName: 'Budget Approval Gate',
  description: 'Corporate budget approval workflow',
  sopCategory: 'APPROVAL_WORKFLOWS',
  priority: SOPPriority.HIGH,
  complianceRequired: true,
  auditTrailRequired: true,
  approvalType: 'hierarchical',
  escalationChain: ['finance_director', 'cfo', 'ceo']
});
```

## Best Practices

### 1. Approval Workflow Design
- **Keep it Simple**: Start with simple workflows and add complexity as needed
- **Clear Ownership**: Assign clear ownership and backup approvers
- **Reasonable Timeouts**: Set appropriate timeout periods for each approval level
- **Escalation Paths**: Define clear escalation chains with business context

### 2. Compliance and Audit
- **Enable Audit Trails**: Always enable audit trails for regulated processes
- **Document Decisions**: Require comments for rejection and high-value approvals
- **Retention Policies**: Set appropriate data retention periods
- **Regular Reviews**: Periodically review and update approval workflows

### 3. Performance Optimization
- **Batch Processing**: Use bulk operations for high-volume scenarios
- **Parallel Approvals**: Use parallel approval for independent approvers
- **Smart Routing**: Implement conditional routing to reduce approval overhead
- **Metrics Monitoring**: Monitor approval times and bottlenecks

### 4. User Experience
- **Clear Instructions**: Provide clear, actionable approval instructions
- **Mobile-Friendly**: Ensure approval interfaces work on mobile devices
- **Status Visibility**: Keep requesters informed of approval progress
- **Easy Escalation**: Make it easy to escalate when appropriate

## Error Handling

The piece includes comprehensive error handling:

- **Validation Errors**: Clear messages for configuration issues
- **Timeout Handling**: Automatic escalation or fallback behaviors
- **Network Failures**: Retry logic for external integrations
- **Data Consistency**: Transaction-safe approval state management

## Security Considerations

- **Authentication**: All approval actions are authenticated and authorized
- **Data Encryption**: Sensitive approval data is encrypted in transit and at rest
- **Access Control**: Role-based access control for approval workflows
- **Audit Logging**: All actions are logged for security auditing

## Compatibility

- **Activepieces**: Version 0.68.0 and above
- **SOP Framework**: Version 0.1.0 and above
- **Node.js**: Version 16.0.0 and above
- **TypeScript**: Version 5.0.0 and above

## Support and Documentation

For additional support and documentation:
- Review the SOP Framework documentation
- Check the Activepieces community forum
- Submit issues via GitHub
- Contact the SOP Team for enterprise support

## License

MIT License - see LICENSE file for details.