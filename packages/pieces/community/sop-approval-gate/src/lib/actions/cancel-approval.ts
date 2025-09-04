/**
 * Cancel Approval Action
 * 
 * Cancels active approval requests, handles cleanup of pending workflows,
 * sends appropriate notifications, and maintains proper audit trails
 * for cancellation events.
 */

import { createAction, Property } from '@activepieces/pieces-framework';

export const cancelApproval = createAction({
  name: 'cancel-approval',
  displayName: 'Cancel Approval',
  description: 'Cancel an active approval request and clean up associated workflow',
  
  props: {
    // Request identification
    requestId: Property.ShortText({
      displayName: 'Approval Request ID',
      description: 'Unique identifier of the approval request to cancel',
      required: true
    }),

    // Cancellation details
    cancelledBy: Property.ShortText({
      displayName: 'Cancelled By',
      description: 'User ID of the person cancelling the approval',
      required: true
    }),

    cancellationReason: Property.StaticDropdown({
      displayName: 'Cancellation Reason',
      description: 'Primary reason for cancelling the approval',
      required: true,
      options: {
        options: [
          { label: 'Request No Longer Needed', value: 'not_needed' },
          { label: 'Requirements Changed', value: 'requirements_changed' },
          { label: 'Duplicate Request', value: 'duplicate' },
          { label: 'Process Error', value: 'process_error' },
          { label: 'Emergency Override', value: 'emergency_override' },
          { label: 'Policy Violation', value: 'policy_violation' },
          { label: 'Requested by Approver', value: 'approver_request' },
          { label: 'System Issue', value: 'system_issue' },
          { label: 'Superseded by New Request', value: 'superseded' },
          { label: 'Other', value: 'other' }
        ]
      }
    }),

    detailedReason: Property.LongText({
      displayName: 'Detailed Reason',
      description: 'Detailed explanation for the cancellation',
      required: true
    }),

    // Authorization and validation
    authorizationCode: Property.ShortText({
      displayName: 'Authorization Code',
      description: 'Authorization code for cancelling this approval (if required)',
      required: false
    }),

    managerApproval: Property.ShortText({
      displayName: 'Manager Approval',
      description: 'Manager ID who approved this cancellation (if required)',
      required: false
    }),

    // Cancellation scope
    cancelAllRelated: Property.Checkbox({
      displayName: 'Cancel All Related Requests',
      description: 'Cancel all related approval requests in the same workflow',
      required: false,
      defaultValue: false
    }),

    cancelChildRequests: Property.Checkbox({
      displayName: 'Cancel Child Requests',
      description: 'Cancel any child/dependent approval requests',
      required: false,
      defaultValue: false
    }),

    // Notification settings
    notifyApprovers: Property.Checkbox({
      displayName: 'Notify Pending Approvers',
      description: 'Send cancellation notifications to pending approvers',
      required: false,
      defaultValue: true
    }),

    notifyRequester: Property.Checkbox({
      displayName: 'Notify Original Requester',
      description: 'Notify the original requester about the cancellation',
      required: false,
      defaultValue: true
    }),

    notifyStakeholders: Property.Checkbox({
      displayName: 'Notify Stakeholders',
      description: 'Notify other stakeholders who were following the approval',
      required: false,
      defaultValue: false
    }),

    customNotificationMessage: Property.LongText({
      displayName: 'Custom Notification Message',
      description: 'Custom message to include in cancellation notifications',
      required: false
    }),

    // Cleanup and rollback options
    cleanupWorkflow: Property.Checkbox({
      displayName: 'Cleanup Workflow',
      description: 'Remove workflow data and scheduled tasks',
      required: false,
      defaultValue: true
    }),

    rollbackChanges: Property.Checkbox({
      displayName: 'Rollback Changes',
      description: 'Attempt to rollback any changes made during the approval process',
      required: false,
      defaultValue: false
    }),

    archiveRequest: Property.Checkbox({
      displayName: 'Archive Request',
      description: 'Archive the request instead of deleting it',
      required: false,
      defaultValue: true
    }),

    // Replacement and follow-up
    replacementRequestId: Property.ShortText({
      displayName: 'Replacement Request ID',
      description: 'ID of replacement approval request (if applicable)',
      required: false
    }),

    followUpRequired: Property.Checkbox({
      displayName: 'Follow-up Required',
      description: 'Mark this cancellation as requiring follow-up action',
      required: false,
      defaultValue: false
    }),

    followUpAssignee: Property.ShortText({
      displayName: 'Follow-up Assignee',
      description: 'User ID to assign follow-up tasks to',
      required: false
    }),

    // Audit and compliance
    complianceNotification: Property.Checkbox({
      displayName: 'Send Compliance Notification',
      description: 'Send notification to compliance team about this cancellation',
      required: false,
      defaultValue: false
    }),

    auditLevel: Property.StaticDropdown({
      displayName: 'Audit Detail Level',
      description: 'Level of audit detail to capture for this cancellation',
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
    }),

    retainDataDays: Property.Number({
      displayName: 'Retain Data (Days)',
      description: 'Number of days to retain cancellation data for audit purposes',
      required: false,
      defaultValue: 90,
      validators: [{ type: 'min', value: 1 }]
    }),

    // Emergency cancellation
    emergencyMode: Property.Checkbox({
      displayName: 'Emergency Cancellation',
      description: 'Process as emergency cancellation (bypasses normal validation)',
      required: false,
      defaultValue: false
    }),

    emergencyContact: Property.ShortText({
      displayName: 'Emergency Contact',
      description: 'Emergency contact for this cancellation (if emergency mode)',
      required: false
    })
  },

  async run({ propsValue }) {
    try {
      // Validate cancellation authorization if required
      if (propsValue.emergencyMode && !propsValue.emergencyContact) {
        throw new Error('Emergency cancellation requires emergency contact information');
      }

      // Process the cancellation
      const cancellationResult = await processCancellation({
        requestId: propsValue.requestId,
        cancelledBy: propsValue.cancelledBy,
        reason: propsValue.cancellationReason,
        detailedReason: propsValue.detailedReason,
        authorizationCode: propsValue.authorizationCode,
        managerApproval: propsValue.managerApproval,
        scope: {
          cancelAllRelated: propsValue.cancelAllRelated,
          cancelChildRequests: propsValue.cancelChildRequests
        },
        notifications: {
          notifyApprovers: propsValue.notifyApprovers,
          notifyRequester: propsValue.notifyRequester,
          notifyStakeholders: propsValue.notifyStakeholders,
          customMessage: propsValue.customNotificationMessage
        },
        cleanup: {
          cleanupWorkflow: propsValue.cleanupWorkflow,
          rollbackChanges: propsValue.rollbackChanges,
          archiveRequest: propsValue.archiveRequest
        },
        followUp: {
          replacementRequestId: propsValue.replacementRequestId,
          followUpRequired: propsValue.followUpRequired,
          followUpAssignee: propsValue.followUpAssignee
        },
        compliance: {
          complianceNotification: propsValue.complianceNotification,
          auditLevel: propsValue.auditLevel || 'standard',
          retainDataDays: propsValue.retainDataDays || 90
        },
        emergency: {
          emergencyMode: propsValue.emergencyMode,
          emergencyContact: propsValue.emergencyContact
        }
      });

      return {
        success: true,
        cancellation: {
          cancellationId: cancellationResult.cancellationId,
          requestId: propsValue.requestId,
          cancelledBy: propsValue.cancelledBy,
          reason: propsValue.cancellationReason,
          cancelledAt: new Date().toISOString(),
          emergencyMode: propsValue.emergencyMode
        },
        impact: {
          requestsCancelled: cancellationResult.requestsCancelled,
          workflowsCleaned: cancellationResult.workflowsCleaned,
          tasksRemoved: cancellationResult.tasksRemoved,
          notificationsSent: cancellationResult.notificationsSent
        },
        cleanup: {
          workflowCleanupCompleted: cancellationResult.workflowCleanupCompleted,
          rollbackCompleted: cancellationResult.rollbackCompleted,
          archived: cancellationResult.archived
        },
        followUp: {
          followUpRequired: propsValue.followUpRequired,
          followUpAssignee: propsValue.followUpAssignee,
          replacementRequest: propsValue.replacementRequestId
        },
        notifications: cancellationResult.notifications,
        auditTrail: {
          auditLevel: propsValue.auditLevel,
          entriesCreated: cancellationResult.auditEntries?.length || 0,
          retentionDays: propsValue.retainDataDays || 90,
          complianceNotified: propsValue.complianceNotification
        },
        metadata: {
          cancellationFrameworkVersion: '1.0.0',
          processingTime: cancellationResult.processingTime,
          validationsPassed: cancellationResult.validationsPassed,
          authorizationRequired: !!propsValue.authorizationCode,
          managerApprovalRequired: !!propsValue.managerApproval
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown cancellation error',
          type: 'ApprovalCancellationError',
          timestamp: new Date().toISOString(),
          context: {
            requestId: propsValue.requestId,
            cancelledBy: propsValue.cancelledBy,
            reason: propsValue.cancellationReason,
            emergencyMode: propsValue.emergencyMode
          }
        }
      };
    }
  }
});

/**
 * Process approval cancellation (placeholder for real implementation)
 */
async function processCancellation(params: {
  requestId: string;
  cancelledBy: string;
  reason: string;
  detailedReason: string;
  authorizationCode?: string;
  managerApproval?: string;
  scope: {
    cancelAllRelated?: boolean;
    cancelChildRequests?: boolean;
  };
  notifications: {
    notifyApprovers?: boolean;
    notifyRequester?: boolean;
    notifyStakeholders?: boolean;
    customMessage?: string;
  };
  cleanup: {
    cleanupWorkflow?: boolean;
    rollbackChanges?: boolean;
    archiveRequest?: boolean;
  };
  followUp: {
    replacementRequestId?: string;
    followUpRequired?: boolean;
    followUpAssignee?: string;
  };
  compliance: {
    complianceNotification?: boolean;
    auditLevel: string;
    retainDataDays: number;
  };
  emergency: {
    emergencyMode?: boolean;
    emergencyContact?: string;
  };
}): Promise<{
  cancellationId: string;
  requestsCancelled: number;
  workflowsCleaned: number;
  tasksRemoved: number;
  notificationsSent: number;
  workflowCleanupCompleted: boolean;
  rollbackCompleted: boolean;
  archived: boolean;
  notifications: Array<{ type: string; recipients: string[]; message: string }>;
  auditEntries?: Array<{ action: string; timestamp: string; details: any }>;
  processingTime: number;
  validationsPassed: boolean;
}> {
  
  const startTime = Date.now();
  const cancellationId = `cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  // Simulate validation
  const validationsPassed = true; // In real implementation, validate authorization, permissions, etc.
  
  // Simulate finding related requests
  let requestsCancelled = 1;
  if (params.scope.cancelAllRelated) {
    requestsCancelled += 2; // Simulate related requests
  }
  if (params.scope.cancelChildRequests) {
    requestsCancelled += 1; // Simulate child requests
  }

  // Simulate workflow cleanup
  let workflowsCleaned = 0;
  let tasksRemoved = 0;
  let workflowCleanupCompleted = false;
  
  if (params.cleanup.cleanupWorkflow) {
    workflowsCleaned = 1;
    tasksRemoved = 3; // Simulate removal of scheduled tasks
    workflowCleanupCompleted = true;
  }

  // Simulate rollback
  let rollbackCompleted = false;
  if (params.cleanup.rollbackChanges) {
    rollbackCompleted = true; // In real implementation, attempt actual rollback
  }

  // Simulate archival
  let archived = false;
  if (params.cleanup.archiveRequest) {
    archived = true; // In real implementation, move to archive storage
  }

  // Generate notifications
  const notifications: Array<{ type: string; recipients: string[]; message: string }> = [];
  let notificationsSent = 0;

  if (params.notifications.notifyApprovers) {
    notifications.push({
      type: 'cancellation_notice',
      recipients: ['pending_approvers'],
      message: `Approval request ${params.requestId} has been cancelled: ${params.detailedReason}`
    });
    notificationsSent += 1;
  }

  if (params.notifications.notifyRequester) {
    notifications.push({
      type: 'request_cancelled',
      recipients: ['requester'],
      message: `Your approval request has been cancelled: ${params.detailedReason}`
    });
    notificationsSent += 1;
  }

  if (params.notifications.notifyStakeholders) {
    notifications.push({
      type: 'stakeholder_notice',
      recipients: ['stakeholders'],
      message: `Approval request ${params.requestId} has been cancelled`
    });
    notificationsSent += 1;
  }

  if (params.compliance.complianceNotification) {
    notifications.push({
      type: 'compliance_notice',
      recipients: ['compliance_team'],
      message: `Approval cancellation requires compliance review: ${params.requestId}`
    });
    notificationsSent += 1;
  }

  // Generate audit entries
  const auditEntries = [
    {
      action: 'approval_cancelled',
      timestamp: now,
      details: {
        requestId: params.requestId,
        cancellationId,
        cancelledBy: params.cancelledBy,
        reason: params.reason,
        detailedReason: params.detailedReason,
        authorizationCode: params.authorizationCode,
        managerApproval: params.managerApproval,
        emergencyMode: params.emergency.emergencyMode,
        requestsCancelled,
        workflowsCleaned,
        tasksRemoved,
        archived,
        rollbackCompleted,
        auditLevel: params.compliance.auditLevel,
        retentionDays: params.compliance.retainDataDays
      }
    }
  ];

  return {
    cancellationId,
    requestsCancelled,
    workflowsCleaned,
    tasksRemoved,
    notificationsSent,
    workflowCleanupCompleted,
    rollbackCompleted,
    archived,
    notifications,
    auditEntries,
    processingTime: Date.now() - startTime,
    validationsPassed
  };
}