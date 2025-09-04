/**
 * Escalate Approval Action
 * 
 * Escalates approval requests to higher authority levels when timeouts occur,
 * rejections happen, or manual escalation is requested. Manages escalation
 * chains and ensures proper notification and audit trails.
 */

import { createAction, Property } from '@activepieces/pieces-framework';
import { SOPPriority } from 'sop-framework';

export const escalateApproval = createAction({
  name: 'escalate-approval',
  displayName: 'Escalate Approval',
  description: 'Escalate approval request to higher authority or next level in chain',
  
  props: {
    // Request identification
    requestId: Property.ShortText({
      displayName: 'Approval Request ID',
      description: 'Unique identifier of the approval request to escalate',
      required: true
    }),

    // Escalation trigger
    escalationTrigger: Property.StaticDropdown({
      displayName: 'Escalation Trigger',
      description: 'Reason for escalating this approval',
      required: true,
      options: {
        options: [
          { label: 'Timeout - No Response', value: 'timeout_no_response' },
          { label: 'Timeout - Partial Response', value: 'timeout_partial' },
          { label: 'Rejection - Requires Review', value: 'rejection_review' },
          { label: 'Manual Escalation', value: 'manual_escalation' },
          { label: 'System Error', value: 'system_error' },
          { label: 'Compliance Issue', value: 'compliance_issue' },
          { label: 'Policy Violation', value: 'policy_violation' },
          { label: 'Conflict of Interest', value: 'conflict_interest' }
        ]
      }
    }),

    // Escalation details
    escalationReason: Property.LongText({
      displayName: 'Escalation Reason',
      description: 'Detailed explanation of why this approval is being escalated',
      required: true
    }),

    escalatedBy: Property.ShortText({
      displayName: 'Escalated By',
      description: 'User ID or system component that initiated the escalation',
      required: true
    }),

    // Escalation target
    escalationTarget: Property.StaticDropdown({
      displayName: 'Escalation Target',
      description: 'How to determine who to escalate to',
      required: true,
      defaultValue: 'next_level',
      options: {
        options: [
          { label: 'Next Level in Chain', value: 'next_level' },
          { label: 'Specific Users', value: 'specific_users' },
          { label: 'Department Head', value: 'department_head' },
          { label: 'Executive Team', value: 'executive_team' },
          { label: 'Compliance Officer', value: 'compliance_officer' },
          { label: 'Custom Escalation', value: 'custom' }
        ]
      }
    }),

    escalateTo: Property.Array({
      displayName: 'Escalate To (User IDs)',
      description: 'Specific users to escalate to (if escalation target is "specific_users")',
      required: false
    }),

    escalationLevel: Property.Number({
      displayName: 'Escalation Level',
      description: 'Current escalation level (1 = first escalation, 2 = second, etc.)',
      required: false,
      defaultValue: 1,
      validators: [{ type: 'min', value: 1 }]
    }),

    maxEscalationLevel: Property.Number({
      displayName: 'Maximum Escalation Level',
      description: 'Maximum number of escalation levels before auto-handling',
      required: false,
      defaultValue: 3,
      validators: [{ type: 'min', value: 1 }]
    }),

    // Priority and urgency
    escalatedPriority: Property.StaticDropdown({
      displayName: 'Escalated Priority',
      description: 'Priority level for the escalated approval (usually higher)',
      required: false,
      options: {
        options: [
          { label: 'Normal', value: SOPPriority.NORMAL },
          { label: 'High', value: SOPPriority.HIGH },
          { label: 'Urgent', value: SOPPriority.URGENT },
          { label: 'Critical', value: SOPPriority.CRITICAL }
        ]
      }
    }),

    // Timeout settings for escalated approval
    escalationTimeoutHours: Property.Number({
      displayName: 'Escalation Timeout (Hours)',
      description: 'Hours before escalated approval times out',
      required: false,
      defaultValue: 12,
      validators: [{ type: 'min', value: 1 }]
    }),

    // Notification settings
    notifyOriginalApprovers: Property.Checkbox({
      displayName: 'Notify Original Approvers',
      description: 'Notify original approvers that request has been escalated',
      required: false,
      defaultValue: true
    }),

    notifyRequester: Property.Checkbox({
      displayName: 'Notify Requester',
      description: 'Notify the original requester about the escalation',
      required: false,
      defaultValue: true
    }),

    escalationMessage: Property.LongText({
      displayName: 'Custom Escalation Message',
      description: 'Custom message to include in escalation notifications',
      required: false
    }),

    // Action on max escalation
    actionOnMaxEscalation: Property.StaticDropdown({
      displayName: 'Action on Maximum Escalation',
      description: 'What to do if maximum escalation level is reached',
      required: false,
      defaultValue: 'auto_approve',
      options: {
        options: [
          { label: 'Auto Approve', value: 'auto_approve' },
          { label: 'Auto Reject', value: 'auto_reject' },
          { label: 'Mark as Expired', value: 'mark_expired' },
          { label: 'Route to Admin', value: 'route_admin' },
          { label: 'Suspend Process', value: 'suspend_process' }
        ]
      }
    }),

    // Audit and compliance
    complianceCheck: Property.Checkbox({
      displayName: 'Perform Compliance Check',
      description: 'Run compliance validation during escalation',
      required: false,
      defaultValue: true
    }),

    auditDetails: Property.Object({
      displayName: 'Additional Audit Details',
      description: 'Additional details to capture in audit trail',
      required: false
    }),

    // Advanced options
    preserveOriginalApprovers: Property.Checkbox({
      displayName: 'Preserve Original Approvers',
      description: 'Keep original approvers in the workflow along with escalated approvers',
      required: false,
      defaultValue: false
    }),

    resetApprovalCount: Property.Checkbox({
      displayName: 'Reset Approval Count',
      description: 'Reset the approval count when escalating',
      required: false,
      defaultValue: true
    }),

    escalatonChainOverride: Property.Array({
      displayName: 'Escalation Chain Override',
      description: 'Override the default escalation chain for this specific escalation',
      required: false
    })
  },

  async run({ propsValue }) {
    try {
      // Validate escalation parameters
      if (propsValue.escalationTarget === 'specific_users' && (!propsValue.escalateTo || propsValue.escalateTo.length === 0)) {
        throw new Error('Escalation target "specific_users" requires "escalateTo" field with user IDs');
      }

      if (propsValue.escalationLevel > propsValue.maxEscalationLevel) {
        throw new Error(`Escalation level ${propsValue.escalationLevel} exceeds maximum of ${propsValue.maxEscalationLevel}`);
      }

      // Process the escalation
      const escalationResult = await processEscalation({
        requestId: propsValue.requestId,
        trigger: propsValue.escalationTrigger,
        reason: propsValue.escalationReason,
        escalatedBy: propsValue.escalatedBy,
        target: propsValue.escalationTarget,
        escalateTo: propsValue.escalateTo,
        level: propsValue.escalationLevel,
        maxLevel: propsValue.maxEscalationLevel,
        priority: propsValue.escalatedPriority,
        timeoutHours: propsValue.escalationTimeoutHours || 12,
        customMessage: propsValue.escalationMessage,
        options: {
          notifyOriginalApprovers: propsValue.notifyOriginalApprovers,
          notifyRequester: propsValue.notifyRequester,
          complianceCheck: propsValue.complianceCheck,
          preserveOriginalApprovers: propsValue.preserveOriginalApprovers,
          resetApprovalCount: propsValue.resetApprovalCount,
          actionOnMaxEscalation: propsValue.actionOnMaxEscalation,
          auditDetails: propsValue.auditDetails
        }
      });

      return {
        success: true,
        escalation: {
          escalationId: escalationResult.escalationId,
          requestId: propsValue.requestId,
          trigger: propsValue.escalationTrigger,
          level: propsValue.escalationLevel,
          escalatedAt: new Date().toISOString(),
          escalatedBy: propsValue.escalatedBy
        },
        newApprovers: escalationResult.newApprovers,
        workflow: {
          status: escalationResult.workflowStatus,
          priority: propsValue.escalatedPriority,
          timeoutAt: escalationResult.newTimeoutAt,
          maxEscalationReached: propsValue.escalationLevel >= propsValue.maxEscalationLevel
        },
        notifications: escalationResult.notifications,
        auditTrail: {
          entriesCreated: escalationResult.auditEntries?.length || 0,
          complianceFlags: escalationResult.complianceFlags || [],
          escalationChain: escalationResult.escalationChain
        },
        nextActions: escalationResult.nextActions,
        metadata: {
          escalationFrameworkVersion: '1.0.0',
          processingTime: escalationResult.processingTime,
          isMaxEscalation: propsValue.escalationLevel >= propsValue.maxEscalationLevel,
          escalationMethod: propsValue.escalationTarget
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown escalation error',
          type: 'EscalationProcessingError',
          timestamp: new Date().toISOString(),
          context: {
            requestId: propsValue.requestId,
            escalationTrigger: propsValue.escalationTrigger,
            escalationLevel: propsValue.escalationLevel,
            escalationTarget: propsValue.escalationTarget
          }
        }
      };
    }
  }
});

/**
 * Process escalation logic (placeholder for real implementation)
 */
async function processEscalation(params: {
  requestId: string;
  trigger: string;
  reason: string;
  escalatedBy: string;
  target: string;
  escalateTo?: string[];
  level: number;
  maxLevel: number;
  priority?: string;
  timeoutHours: number;
  customMessage?: string;
  options: {
    notifyOriginalApprovers?: boolean;
    notifyRequester?: boolean;
    complianceCheck?: boolean;
    preserveOriginalApprovers?: boolean;
    resetApprovalCount?: boolean;
    actionOnMaxEscalation?: string;
    auditDetails?: any;
  };
}): Promise<{
  escalationId: string;
  newApprovers: Array<{ id: string; name: string; type: string; level: number }>;
  workflowStatus: string;
  newTimeoutAt: string;
  notifications: Array<{ type: string; recipients: string[]; message: string }>;
  auditEntries?: Array<{ action: string; timestamp: string; details: any }>;
  complianceFlags?: string[];
  escalationChain: string[];
  nextActions: string[];
  processingTime: number;
}> {
  
  const startTime = Date.now();
  const escalationId = `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  // Determine new approvers based on escalation target
  let newApprovers: Array<{ id: string; name: string; type: string; level: number }> = [];
  
  switch (params.target) {
    case 'specific_users':
      newApprovers = (params.escalateTo || []).map((userId, index) => ({
        id: userId,
        name: `User ${userId}`,
        type: 'user',
        level: params.level
      }));
      break;
    case 'next_level':
      newApprovers = [{
        id: 'manager_001',
        name: 'Department Manager',
        type: 'role',
        level: params.level
      }];
      break;
    case 'department_head':
      newApprovers = [{
        id: 'dept_head_001',
        name: 'Department Head',
        type: 'role',
        level: params.level
      }];
      break;
    case 'executive_team':
      newApprovers = [{
        id: 'executive_001',
        name: 'Executive Team',
        type: 'group',
        level: params.level
      }];
      break;
    default:
      newApprovers = [{
        id: 'escalation_default',
        name: 'Default Escalation Handler',
        type: 'role',
        level: params.level
      }];
  }

  // Calculate new timeout
  const newTimeout = new Date();
  newTimeout.setHours(newTimeout.getHours() + params.timeoutHours);
  
  // Determine workflow status
  let workflowStatus = 'escalated';
  if (params.level >= params.maxLevel) {
    switch (params.options.actionOnMaxEscalation) {
      case 'auto_approve':
        workflowStatus = 'auto_approved';
        break;
      case 'auto_reject':
        workflowStatus = 'auto_rejected';
        break;
      case 'mark_expired':
        workflowStatus = 'expired';
        break;
      case 'suspend_process':
        workflowStatus = 'suspended';
        break;
      default:
        workflowStatus = 'max_escalation_reached';
    }
  }

  // Generate notifications
  const notifications: Array<{ type: string; recipients: string[]; message: string }> = [];
  
  if (params.options.notifyOriginalApprovers) {
    notifications.push({
      type: 'escalation_notice',
      recipients: ['original_approvers'],
      message: `Approval request ${params.requestId} has been escalated due to: ${params.reason}`
    });
  }

  if (params.options.notifyRequester) {
    notifications.push({
      type: 'escalation_update',
      recipients: ['requester'],
      message: `Your approval request has been escalated to level ${params.level}`
    });
  }

  // Notify new approvers
  notifications.push({
    type: 'escalated_approval_request',
    recipients: newApprovers.map(a => a.id),
    message: `An approval request has been escalated to you: ${params.reason}`
  });

  // Generate audit entries
  const auditEntries = [
    {
      action: 'approval_escalated',
      timestamp: now,
      details: {
        requestId: params.requestId,
        escalationId,
        trigger: params.trigger,
        reason: params.reason,
        escalatedBy: params.escalatedBy,
        level: params.level,
        maxLevel: params.maxLevel,
        newApprovers: newApprovers.map(a => a.id),
        ...params.options.auditDetails
      }
    }
  ];

  // Check compliance flags
  const complianceFlags: string[] = [];
  if (params.options.complianceCheck) {
    if (params.level >= params.maxLevel) {
      complianceFlags.push('MAX_ESCALATION_REACHED');
    }
    if (params.trigger === 'timeout_no_response') {
      complianceFlags.push('APPROVAL_TIMEOUT_ESCALATION');
    }
  }

  // Build escalation chain
  const escalationChain = [
    `Level ${params.level}: ${params.trigger}`,
    `Target: ${params.target}`,
    `Approvers: ${newApprovers.length}`
  ];

  // Determine next actions
  const nextActions: string[] = [];
  if (workflowStatus === 'escalated') {
    nextActions.push('notify_escalated_approvers');
    nextActions.push('set_escalation_timeout');
  } else if (workflowStatus.startsWith('auto_')) {
    nextActions.push('complete_workflow');
    nextActions.push('send_completion_notifications');
  }

  return {
    escalationId,
    newApprovers,
    workflowStatus,
    newTimeoutAt: newTimeout.toISOString(),
    notifications,
    auditEntries,
    complianceFlags,
    escalationChain,
    nextActions,
    processingTime: Date.now() - startTime
  };
}