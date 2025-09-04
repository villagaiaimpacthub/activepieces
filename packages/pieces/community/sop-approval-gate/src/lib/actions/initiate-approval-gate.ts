/**
 * Initiate Approval Gate Action
 * 
 * Creates and initiates a new approval workflow with the specified configuration,
 * approvers, and escalation rules. This is the primary action for starting
 * approval processes within SOP workflows.
 */

import { createAction, Property } from '@activepieces/pieces-framework';
import { SOPApprovalGatePiece, ApprovalGateConfig, ApprovalRequest } from '../approval-gate-piece';
import { SOPPriority } from 'sop-framework';

export const initiateApprovalGate = createAction({
  name: 'initiate-approval-gate',
  displayName: 'Initiate Approval Gate',
  description: 'Create and start a new approval workflow with multi-level approval support',
  
  props: {
    // Basic approval information
    title: Property.ShortText({
      displayName: 'Approval Title',
      description: 'Clear, concise title for the approval request',
      required: true
    }),
    
    description: Property.LongText({
      displayName: 'Approval Description', 
      description: 'Detailed explanation of what requires approval and why',
      required: true
    }),
    
    category: Property.ShortText({
      displayName: 'Approval Category',
      description: 'Category or type of approval (e.g., budget, policy, operational)',
      required: false,
      defaultValue: 'general'
    }),
    
    priority: Property.StaticDropdown({
      displayName: 'Priority Level',
      description: 'Priority level for this approval request',
      required: true,
      defaultValue: SOPPriority.NORMAL,
      options: {
        options: [
          { label: 'Low', value: SOPPriority.LOW },
          { label: 'Normal', value: SOPPriority.NORMAL },
          { label: 'High', value: SOPPriority.HIGH },
          { label: 'Urgent', value: SOPPriority.URGENT },
          { label: 'Critical', value: SOPPriority.CRITICAL }
        ]
      }
    }),

    // Approval workflow configuration
    approvalType: Property.StaticDropdown({
      displayName: 'Approval Workflow Type',
      description: 'Type of approval workflow to execute',
      required: true,
      defaultValue: 'single',
      options: {
        options: [
          { 
            label: 'Single Approver', 
            value: 'single'
          },
          { 
            label: 'Sequential Approval', 
            value: 'sequential'
          },
          { 
            label: 'Parallel Approval', 
            value: 'parallel'
          },
          { 
            label: 'Consensus Approval', 
            value: 'consensus'
          },
          { 
            label: 'Conditional Approval', 
            value: 'conditional'
          }
        ]
      }
    }),

    // Approvers configuration
    approvers: Property.Array({
      displayName: 'Approvers List',
      description: 'List of users, roles, or groups who can approve this request',
      required: true
    }),

    requiredApprovals: Property.Number({
      displayName: 'Required Approvals Count',
      description: 'Number of approvals needed (for parallel/consensus workflows)',
      required: false,
      validators: [{ type: 'min', value: 1 }]
    }),

    consensusThreshold: Property.Number({
      displayName: 'Consensus Threshold',
      description: 'Percentage of approvers needed for consensus (0.1 = 10%, 0.5 = 50%, etc.)',
      required: false,
      defaultValue: 0.6,
      validators: [
        { type: 'min', value: 0.1 },
        { type: 'max', value: 1.0 }
      ]
    }),

    // Request data and attachments
    requestData: Property.Object({
      displayName: 'Request Data',
      description: 'Additional structured data to include with the approval request',
      required: false
    }),

    attachments: Property.Array({
      displayName: 'File Attachments',
      description: 'Documents, images, or other files relevant to the approval',
      required: false
    }),

    // Timeline and deadlines
    dueDate: Property.DateTime({
      displayName: 'Due Date',
      description: 'When this approval should be completed',
      required: false
    }),

    approvalTimeoutHours: Property.Number({
      displayName: 'Approval Timeout (Hours)',
      description: 'Number of hours before the approval times out',
      required: false,
      defaultValue: 24,
      validators: [{ type: 'min', value: 1 }]
    }),

    // Escalation configuration
    escalationChain: Property.Array({
      displayName: 'Escalation Chain',
      description: 'List of users to escalate to if approval times out',
      required: false
    }),

    autoEscalateOnTimeout: Property.Checkbox({
      displayName: 'Auto-Escalate on Timeout',
      description: 'Automatically escalate when approval times out',
      required: false,
      defaultValue: true
    }),

    // Notification settings
    notificationChannels: Property.MultiSelectDropdown({
      displayName: 'Notification Channels',
      description: 'Channels to use for approval notifications',
      required: false,
      defaultValue: ['email'],
      options: {
        options: [
          { label: 'Email', value: 'email' },
          { label: 'SMS', value: 'sms' },
          { label: 'Slack', value: 'slack' },
          { label: 'Microsoft Teams', value: 'teams' },
          { label: 'Push Notification', value: 'push' },
          { label: 'Webhook', value: 'webhook' }
        ]
      }
    }),

    reminderIntervals: Property.Array({
      displayName: 'Reminder Intervals (Hours)',
      description: 'Hours after initial request to send reminders (e.g., [6, 12, 18])',
      required: false
    }),

    // Integration settings
    enableWebhooks: Property.Checkbox({
      displayName: 'Enable Webhook Notifications',
      description: 'Send HTTP webhooks for approval events',
      required: false,
      defaultValue: false
    }),

    webhookUrls: Property.Array({
      displayName: 'Webhook URLs',
      description: 'HTTP endpoints to notify of approval events',
      required: false
    }),

    callbackUrl: Property.ShortText({
      displayName: 'Callback URL',
      description: 'URL to redirect to after approval completion',
      required: false
    }),

    // SOP-specific settings
    sopId: Property.ShortText({
      displayName: 'SOP ID',
      description: 'Standard Operating Procedure identifier',
      required: false
    }),

    complianceRequired: Property.Checkbox({
      displayName: 'Compliance Validation Required',
      description: 'Enable additional compliance checks for this approval',
      required: false,
      defaultValue: true
    }),

    auditLevel: Property.StaticDropdown({
      displayName: 'Audit Detail Level',
      description: 'Level of detail to capture in audit trails',
      required: false,
      defaultValue: 'standard',
      options: {
        options: [
          { label: 'Basic', value: 'basic' },
          { label: 'Standard', value: 'standard' },
          { label: 'Detailed', value: 'detailed' },
          { label: 'Comprehensive', value: 'comprehensive' }
        ]
      }
    }),

    // Advanced options
    allowDelegation: Property.Checkbox({
      displayName: 'Allow Delegation',
      description: 'Allow approvers to delegate their approval to someone else',
      required: false,
      defaultValue: false
    }),

    requireComments: Property.Checkbox({
      displayName: 'Require Comments',
      description: 'Require approvers to provide comments with their decision',
      required: false,
      defaultValue: false
    }),

    enableParallelBranching: Property.Checkbox({
      displayName: 'Enable Parallel Branching',
      description: 'Allow multiple approval branches to run simultaneously',
      required: false,
      defaultValue: false
    })
  },

  async run({ propsValue }) {
    try {
      // Create approval gate configuration
      const config: ApprovalGateConfig = {
        displayName: 'SOP Approval Gate',
        description: propsValue.description,
        sopPieceType: 'APPROVAL_GATE' as any,
        sopCategory: 'APPROVAL_WORKFLOWS' as any,
        priority: propsValue.priority as SOPPriority,
        
        // Approval workflow settings
        approvalType: propsValue.approvalType as any,
        requiredApprovals: propsValue.requiredApprovals,
        consensusThreshold: propsValue.consensusThreshold,
        
        // Timeout and escalation
        approvalTimeoutHours: propsValue.approvalTimeoutHours || 24,
        escalationChain: propsValue.escalationChain || [],
        autoEscalateOnTimeout: propsValue.autoEscalateOnTimeout ?? true,
        
        // Notifications
        notificationChannels: propsValue.notificationChannels || ['email'],
        reminderIntervals: propsValue.reminderIntervals || [],
        
        // Integration
        enableWebhooks: propsValue.enableWebhooks || false,
        webhookUrls: propsValue.webhookUrls,
        callbackUrl: propsValue.callbackUrl,
        
        // SOP-specific
        complianceRequired: propsValue.complianceRequired ?? true,
        auditTrailRequired: true,
        tags: ['approval', 'sop', 'workflow'],
        department: 'operations' // Could be made configurable
      };

      // Create and initialize the approval gate piece
      const approvalGate = new SOPApprovalGatePiece(config);
      
      // Execute the approval gate with the provided properties
      const approvalRequest = await approvalGate.execute(propsValue, 'system');
      
      // Return comprehensive result
      return {
        success: true,
        approvalRequest: {
          requestId: approvalRequest.requestId,
          title: approvalRequest.title,
          description: approvalRequest.description,
          status: approvalRequest.status,
          priority: approvalRequest.priority,
          category: approvalRequest.category,
          requestedBy: approvalRequest.requestedBy,
          requestedAt: approvalRequest.requestedAt,
          dueDate: approvalRequest.dueDate,
          approvalType: approvalRequest.approvalType,
          requiredApprovals: approvalRequest.requiredApprovals,
          approversCount: approvalRequest.approvers.length,
          sopId: approvalRequest.sopId,
          workflowId: approvalRequest.workflowId
        },
        approvers: approvalRequest.approvers.map(approver => ({
          id: approver.id,
          name: approver.name,
          type: approver.type,
          level: approver.level,
          notificationChannels: approver.notificationPreferences.channels
        })),
        timeline: {
          createdAt: approvalRequest.requestedAt,
          dueDate: approvalRequest.dueDate,
          timeoutHours: config.approvalTimeoutHours,
          reminderSchedule: config.reminderIntervals
        },
        integrations: {
          webhooksEnabled: config.enableWebhooks,
          callbackUrl: config.callbackUrl,
          notificationChannels: config.notificationChannels
        },
        metadata: {
          sopFrameworkVersion: '1.0.0',
          approvalGateVersion: config.version || '1.0.0',
          complianceEnabled: config.complianceRequired,
          auditEnabled: config.auditTrailRequired
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'ApprovalGateInitiationError',
          timestamp: new Date().toISOString(),
          details: {
            approvalType: propsValue.approvalType,
            approversCount: Array.isArray(propsValue.approvers) ? propsValue.approvers.length : 0,
            hasEscalationChain: Array.isArray(propsValue.escalationChain) && propsValue.escalationChain.length > 0
          }
        }
      };
    }
  }
});