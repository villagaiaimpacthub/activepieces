/**
 * Process Approval Response Action
 * 
 * Processes individual approval responses from approvers, updates the approval
 * workflow state, and determines if the approval process is complete or requires
 * further action such as escalation.
 */

import { createAction, Property } from '@activepieces/pieces-framework';
import { SOPApprovalGatePiece, ApprovalResponse } from '../approval-gate-piece';

export const processApprovalResponse = createAction({
  name: 'process-approval-response',
  displayName: 'Process Approval Response',
  description: 'Process an individual approval response and update workflow state',
  
  props: {
    // Request identification
    requestId: Property.ShortText({
      displayName: 'Approval Request ID',
      description: 'Unique identifier of the approval request',
      required: true
    }),

    // Approver information
    approverId: Property.ShortText({
      displayName: 'Approver ID',
      description: 'Unique identifier of the person providing approval',
      required: true
    }),

    approverName: Property.ShortText({
      displayName: 'Approver Name',
      description: 'Full name of the approver',
      required: false
    }),

    approverEmail: Property.ShortText({
      displayName: 'Approver Email',
      description: 'Email address of the approver',
      required: false
    }),

    // Approval decision
    decision: Property.StaticDropdown({
      displayName: 'Approval Decision',
      description: 'The approval decision made by the approver',
      required: true,
      options: {
        options: [
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Delegated', value: 'delegated' },
          { label: 'Abstained', value: 'abstained' }
        ]
      }
    }),

    // Decision context
    comments: Property.LongText({
      displayName: 'Comments',
      description: 'Comments or justification for the approval decision',
      required: false
    }),

    confidence: Property.Number({
      displayName: 'Confidence Level',
      description: 'Confidence in the decision (0.0 to 1.0)',
      required: false,
      validators: [
        { type: 'min', value: 0.0 },
        { type: 'max', value: 1.0 }
      ]
    }),

    // Delegation (if applicable)
    delegatedTo: Property.ShortText({
      displayName: 'Delegated To',
      description: 'User ID to delegate approval to (if decision is "delegated")',
      required: false
    }),

    delegatedReason: Property.ShortText({
      displayName: 'Delegation Reason',
      description: 'Reason for delegating the approval',
      required: false
    }),

    // Supporting information
    attachments: Property.Array({
      displayName: 'Supporting Attachments',
      description: 'Additional files or documents supporting the decision',
      required: false
    }),

    reviewTime: Property.Number({
      displayName: 'Review Time (Minutes)',
      description: 'Time spent reviewing the request',
      required: false,
      validators: [{ type: 'min', value: 0 }]
    }),

    // Metadata
    ipAddress: Property.ShortText({
      displayName: 'IP Address',
      description: 'IP address from which the response was submitted',
      required: false
    }),

    userAgent: Property.ShortText({
      displayName: 'User Agent',
      description: 'Browser/client information',
      required: false
    }),

    location: Property.Object({
      displayName: 'Geographic Location',
      description: 'Geographic location information (if available)',
      required: false
    }),

    // Workflow control
    forceComplete: Property.Checkbox({
      displayName: 'Force Complete Workflow',
      description: 'Force completion of approval workflow regardless of other pending approvals',
      required: false,
      defaultValue: false
    }),

    bypassEscalation: Property.Checkbox({
      displayName: 'Bypass Escalation',
      description: 'Skip escalation even if configured for this approval type',
      required: false,
      defaultValue: false
    }),

    // Notification settings
    notifyOtherApprovers: Property.Checkbox({
      displayName: 'Notify Other Approvers',
      description: 'Send notifications to other approvers about this decision',
      required: false,
      defaultValue: true
    }),

    notifyRequester: Property.Checkbox({
      displayName: 'Notify Requester',
      description: 'Send notification to the original requester',
      required: false,
      defaultValue: true
    }),

    // Audit settings
    auditLevel: Property.StaticDropdown({
      displayName: 'Audit Detail Level',
      description: 'Level of audit detail to capture for this response',
      required: false,
      defaultValue: 'standard',
      options: {
        options: [
          { label: 'Basic', value: 'basic' },
          { label: 'Standard', value: 'standard' },
          { label: 'Detailed', value: 'detailed' },
          { label: 'Forensic', value: 'forensic' }
        ]
      }
    })
  },

  async run({ propsValue }) {
    try {
      // Validate required delegation fields
      if (propsValue.decision === 'delegated' && !propsValue.delegatedTo) {
        throw new Error('Delegated approval requires "delegatedTo" field');
      }

      // Create approval response object
      const approvalResponse: ApprovalResponse = {
        responseId: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        approverId: propsValue.approverId,
        approverName: propsValue.approverName || propsValue.approverId,
        decision: propsValue.decision as any,
        timestamp: new Date().toISOString(),
        comments: propsValue.comments,
        attachments: propsValue.attachments || [],
        confidence: propsValue.confidence,
        delegatedTo: propsValue.delegatedTo,
        ipAddress: propsValue.ipAddress,
        userAgent: propsValue.userAgent
      };

      // Process the response (in real implementation, this would involve database operations)
      const processingResult = await processApprovalWorkflowResponse(
        propsValue.requestId,
        approvalResponse,
        {
          forceComplete: propsValue.forceComplete,
          bypassEscalation: propsValue.bypassEscalation,
          notifyOtherApprovers: propsValue.notifyOtherApprovers,
          notifyRequester: propsValue.notifyRequester,
          auditLevel: propsValue.auditLevel || 'standard'
        }
      );

      return {
        success: true,
        response: {
          responseId: approvalResponse.responseId,
          requestId: propsValue.requestId,
          approverId: approvalResponse.approverId,
          decision: approvalResponse.decision,
          timestamp: approvalResponse.timestamp,
          processedAt: new Date().toISOString()
        },
        workflowStatus: processingResult.workflowStatus,
        nextActions: processingResult.nextActions,
        notifications: processingResult.notifications,
        auditInfo: {
          auditLevel: propsValue.auditLevel,
          auditEntries: processingResult.auditEntries?.length || 0,
          complianceFlags: processingResult.complianceFlags || []
        },
        metadata: {
          reviewTime: propsValue.reviewTime,
          hasAttachments: (propsValue.attachments?.length || 0) > 0,
          isDelegation: propsValue.decision === 'delegated',
          confidenceScore: propsValue.confidence,
          location: propsValue.location
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'ApprovalResponseProcessingError',
          timestamp: new Date().toISOString(),
          context: {
            requestId: propsValue.requestId,
            approverId: propsValue.approverId,
            decision: propsValue.decision
          }
        }
      };
    }
  }
});

/**
 * Process approval workflow response (placeholder for real implementation)
 */
async function processApprovalWorkflowResponse(
  requestId: string,
  response: ApprovalResponse,
  options: {
    forceComplete?: boolean;
    bypassEscalation?: boolean;
    notifyOtherApprovers?: boolean;
    notifyRequester?: boolean;
    auditLevel?: string;
  }
): Promise<{
  workflowStatus: string;
  nextActions: string[];
  notifications: Array<{ type: string; recipients: string[]; message: string }>;
  auditEntries?: Array<{ action: string; timestamp: string; details: any }>;
  complianceFlags?: string[];
}> {
  
  // Simulate workflow processing
  const isApproved = response.decision === 'approved';
  const isRejected = response.decision === 'rejected';
  const isDelegated = response.decision === 'delegated';
  
  let workflowStatus = 'in_progress';
  const nextActions: string[] = [];
  const notifications: Array<{ type: string; recipients: string[]; message: string }> = [];
  
  // Determine workflow status
  if (options.forceComplete || isApproved) {
    workflowStatus = isApproved ? 'approved' : 'completed';
  } else if (isRejected) {
    workflowStatus = 'rejected';
  } else if (isDelegated) {
    workflowStatus = 'delegated';
    nextActions.push(`notify_delegate:${response.delegatedTo}`);
  }

  // Determine next actions
  if (!options.forceComplete && workflowStatus === 'in_progress') {
    nextActions.push('check_remaining_approvals');
    nextActions.push('evaluate_escalation_rules');
  }

  if (workflowStatus === 'approved' || workflowStatus === 'rejected') {
    nextActions.push('complete_workflow');
    nextActions.push('send_completion_notifications');
  }

  // Generate notifications
  if (options.notifyOtherApprovers) {
    notifications.push({
      type: 'approver_decision',
      recipients: ['other_approvers'],
      message: `${response.approverName} has ${response.decision} the approval request`
    });
  }

  if (options.notifyRequester) {
    notifications.push({
      type: 'decision_update',
      recipients: ['requester'],
      message: `Your approval request has received a decision: ${response.decision}`
    });
  }

  // Generate audit entries
  const auditEntries = [{
    action: 'approval_response_processed',
    timestamp: new Date().toISOString(),
    details: {
      requestId,
      approverId: response.approverId,
      decision: response.decision,
      hasComments: !!response.comments,
      confidence: response.confidence,
      auditLevel: options.auditLevel
    }
  }];

  // Check for compliance flags
  const complianceFlags: string[] = [];
  if (response.decision === 'rejected' && !response.comments) {
    complianceFlags.push('REJECTION_WITHOUT_JUSTIFICATION');
  }
  if (response.confidence && response.confidence < 0.5) {
    complianceFlags.push('LOW_CONFIDENCE_DECISION');
  }

  return {
    workflowStatus,
    nextActions,
    notifications,
    auditEntries,
    complianceFlags
  };
}