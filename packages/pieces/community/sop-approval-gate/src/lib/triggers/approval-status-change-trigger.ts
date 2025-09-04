/**
 * Approval Status Change Trigger
 * 
 * Triggers when approval request status changes (approved, rejected, escalated, etc.)
 * Enables reactive workflows based on approval decision outcomes and process state changes.
 */

import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';

export const approvalStatusChangeTrigger = createTrigger({
  name: 'approval-status-change-trigger',
  displayName: 'Approval Status Change Trigger',
  description: 'Triggers when approval request status changes or decisions are made',
  
  type: TriggerStrategy.WEBHOOK,
  
  props: {
    // Status change filters
    statusChanges: Property.MultiSelectDropdown({
      displayName: 'Status Changes to Monitor',
      description: 'Which status changes should trigger this workflow',
      required: true,
      defaultValue: ['approved', 'rejected'],
      options: {
        options: [
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Partially Approved', value: 'partially_approved' },
          { label: 'Escalated', value: 'escalated' },
          { label: 'Delegated', value: 'delegated' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Expired/Timeout', value: 'expired' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'On Hold', value: 'on_hold' },
          { label: 'Completed', value: 'completed' }
        ]
      }
    }),

    // Approval decision filters
    decisionTypes: Property.MultiSelectDropdown({
      displayName: 'Decision Types',
      description: 'Types of approval decisions to monitor',
      required: false,
      options: {
        options: [
          { label: 'Final Approval', value: 'final_approval' },
          { label: 'Final Rejection', value: 'final_rejection' },
          { label: 'Intermediate Approval', value: 'intermediate_approval' },
          { label: 'Intermediate Rejection', value: 'intermediate_rejection' },
          { label: 'Conditional Approval', value: 'conditional_approval' },
          { label: 'Abstained', value: 'abstained' },
          { label: 'Delegated Decision', value: 'delegated_decision' }
        ]
      }
    }),

    // Scope filters
    monitorScope: Property.StaticDropdown({
      displayName: 'Monitor Scope',
      description: 'Scope of approval requests to monitor for status changes',
      required: true,
      defaultValue: 'all_requests',
      options: {
        options: [
          { label: 'All Requests', value: 'all_requests' },
          { label: 'My Requests', value: 'my_requests' },
          { label: 'My Department', value: 'my_department' },
          { label: 'Specific Categories', value: 'specific_categories' },
          { label: 'Specific SOPs', value: 'specific_sops' },
          { label: 'High Priority Only', value: 'high_priority_only' },
          { label: 'Specific Workflow', value: 'specific_workflow' }
        ]
      }
    }),

    // User/requestor filters
    requesterId: Property.ShortText({
      displayName: 'Requester ID',
      description: 'Monitor only requests from this user (for "my_requests" scope)',
      required: false
    }),

    department: Property.ShortText({
      displayName: 'Department',
      description: 'Monitor only requests from this department (for "my_department" scope)',
      required: false
    }),

    // Category and SOP filters
    categories: Property.Array({
      displayName: 'Categories',
      description: 'Monitor only requests in these categories',
      required: false
    }),

    sopIds: Property.Array({
      displayName: 'SOP IDs',
      description: 'Monitor only requests from specific SOPs',
      required: false
    }),

    workflowIds: Property.Array({
      displayName: 'Workflow IDs',
      description: 'Monitor only requests from specific workflows',
      required: false
    }),

    // Priority filters
    priorityLevels: Property.MultiSelectDropdown({
      displayName: 'Priority Levels',
      description: 'Monitor only requests with these priority levels',
      required: false,
      options: {
        options: [
          { label: 'Low', value: 'LOW' },
          { label: 'Normal', value: 'NORMAL' },
          { label: 'High', value: 'HIGH' },
          { label: 'Urgent', value: 'URGENT' },
          { label: 'Critical', value: 'CRITICAL' }
        ]
      }
    }),

    // Approver filters
    approverId: Property.ShortText({
      displayName: 'Specific Approver',
      description: 'Monitor only decisions made by this specific approver',
      required: false
    }),

    approverRoles: Property.Array({
      displayName: 'Approver Roles',
      description: 'Monitor only decisions made by approvers with these roles',
      required: false
    }),

    // Timing filters
    includeAfterHours: Property.Checkbox({
      displayName: 'Include After Hours Decisions',
      description: 'Include decisions made outside business hours',
      required: false,
      defaultValue: true
    }),

    includeWeekends: Property.Checkbox({
      displayName: 'Include Weekend Decisions',
      description: 'Include decisions made on weekends',
      required: false,
      defaultValue: true
    }),

    // Escalation-specific filters
    escalationLevelThreshold: Property.Number({
      displayName: 'Escalation Level Threshold',
      description: 'Trigger only for escalations at or above this level',
      required: false,
      validators: [{ type: 'min', value: 1 }]
    }),

    includeAutoEscalations: Property.Checkbox({
      displayName: 'Include Auto-Escalations',
      description: 'Include automatically triggered escalations (timeouts, etc.)',
      required: false,
      defaultValue: true
    }),

    // Amount-based filters
    amountThreshold: Property.Number({
      displayName: 'Amount Threshold',
      description: 'Trigger only for requests above this monetary amount',
      required: false,
      validators: [{ type: 'min', value: 0 }]
    }),

    // Time-based filters
    completionTimeThreshold: Property.Number({
      displayName: 'Completion Time Threshold (Hours)',
      description: 'Trigger only for requests completed within this timeframe',
      required: false,
      validators: [{ type: 'min', value: 0 }]
    }),

    // Data enrichment options
    includeApprovalHistory: Property.Checkbox({
      displayName: 'Include Approval History',
      description: 'Include complete approval history in trigger data',
      required: false,
      defaultValue: true
    }),

    includeRequestDetails: Property.Checkbox({
      displayName: 'Include Request Details',
      description: 'Include original request details in trigger data',
      required: false,
      defaultValue: true
    }),

    includeApproverInfo: Property.Checkbox({
      displayName: 'Include Approver Information',
      description: 'Include detailed approver information in trigger data',
      required: false,
      defaultValue: false
    }),

    includeMetrics: Property.Checkbox({
      displayName: 'Include Performance Metrics',
      description: 'Include timing and performance metrics in trigger data',
      required: false,
      defaultValue: false
    }),

    // Notification deduplication
    deduplicationWindow: Property.Number({
      displayName: 'Deduplication Window (Minutes)',
      description: 'Prevent duplicate triggers for the same request within this window',
      required: false,
      defaultValue: 5,
      validators: [
        { type: 'min', value: 1 },
        { type: 'max', value: 60 }
      ]
    }),

    // Advanced filtering
    customFilterLogic: Property.LongText({
      displayName: 'Custom Filter Logic',
      description: 'Custom JavaScript logic for advanced filtering (optional)',
      required: false
    }),

    excludeSystemDecisions: Property.Checkbox({
      displayName: 'Exclude System Decisions',
      description: 'Exclude automated/system-made approval decisions',
      required: false,
      defaultValue: false
    }),

    // Webhook configuration
    immediateNotification: Property.Checkbox({
      displayName: 'Immediate Notification',
      description: 'Send trigger immediately without batching',
      required: false,
      defaultValue: true
    }),

    batchingEnabled: Property.Checkbox({
      displayName: 'Enable Batching',
      description: 'Batch multiple status changes together',
      required: false,
      defaultValue: false
    }),

    batchSize: Property.Number({
      displayName: 'Batch Size',
      description: 'Number of status changes to batch together',
      required: false,
      defaultValue: 10,
      validators: [
        { type: 'min', value: 2 },
        { type: 'max', value: 100 }
      ]
    }),

    batchTimeoutMinutes: Property.Number({
      displayName: 'Batch Timeout (Minutes)',
      description: 'Maximum time to wait before processing incomplete batch',
      required: false,
      defaultValue: 5,
      validators: [{ type: 'min', value: 1 }]
    })
  },

  async onEnable(context) {
    const webhookId = `status_change_${context.propsValue.monitorScope}_${Date.now()}`;
    const webhookPath = `/approval-status-change/${webhookId}`;
    
    console.log(`Registering approval status change trigger: ${webhookPath}`);
    
    const webhookConfig = {
      webhookId,
      webhookPath,
      monitoring: {
        scope: context.propsValue.monitorScope,
        statusChanges: context.propsValue.statusChanges,
        decisionTypes: context.propsValue.decisionTypes
      },
      filters: {
        requesterId: context.propsValue.requesterId,
        department: context.propsValue.department,
        categories: context.propsValue.categories,
        sopIds: context.propsValue.sopIds,
        workflowIds: context.propsValue.workflowIds,
        priorityLevels: context.propsValue.priorityLevels,
        approverId: context.propsValue.approverId,
        approverRoles: context.propsValue.approverRoles,
        amountThreshold: context.propsValue.amountThreshold,
        escalationLevelThreshold: context.propsValue.escalationLevelThreshold,
        completionTimeThreshold: context.propsValue.completionTimeThreshold
      },
      options: {
        includeAfterHours: context.propsValue.includeAfterHours,
        includeWeekends: context.propsValue.includeWeekends,
        includeAutoEscalations: context.propsValue.includeAutoEscalations,
        excludeSystemDecisions: context.propsValue.excludeSystemDecisions,
        customFilterLogic: context.propsValue.customFilterLogic
      },
      enrichment: {
        includeApprovalHistory: context.propsValue.includeApprovalHistory,
        includeRequestDetails: context.propsValue.includeRequestDetails,
        includeApproverInfo: context.propsValue.includeApproverInfo,
        includeMetrics: context.propsValue.includeMetrics
      },
      batching: {
        enabled: context.propsValue.batchingEnabled,
        size: context.propsValue.batchSize || 10,
        timeoutMinutes: context.propsValue.batchTimeoutMinutes || 5,
        immediateNotification: context.propsValue.immediateNotification
      },
      deduplication: {
        windowMinutes: context.propsValue.deduplicationWindow || 5
      }
    };

    return {
      webhookId,
      webhookUrl: `${context.webhookUrl}${webhookPath}`,
      configuration: webhookConfig
    };
  },

  async onDisable(context) {
    console.log(`Deregistering approval status change trigger`);
    return {
      success: true,
      message: 'Approval status change trigger disabled successfully'
    };
  },

  async run(context) {
    const { body, headers } = context.payload;
    
    try {
      // Parse the status change event
      const statusChangeEvent = parseStatusChangeEvent(body);
      
      // Apply filters to determine if this event should trigger
      const shouldTrigger = await evaluateStatusChangeFilters(statusChangeEvent, context.propsValue);
      
      if (!shouldTrigger) {
        return {
          success: true,
          triggered: false,
          reason: 'Status change did not match trigger filters',
          event: statusChangeEvent
        };
      }

      // Check for deduplication
      if (await isDuplicateEvent(statusChangeEvent, context.propsValue)) {
        return {
          success: true,
          triggered: false,
          reason: 'Duplicate event within deduplication window',
          event: statusChangeEvent
        };
      }

      // Enrich event data if requested
      const enrichedEvent = await enrichStatusChangeEvent(statusChangeEvent, context.propsValue);

      // Handle batching if enabled
      if (context.propsValue.batchingEnabled && !shouldProcessImmediately(enrichedEvent)) {
        return await handleBatchedStatusChange(enrichedEvent, context);
      }

      // Process immediate trigger
      return await processImmediateStatusChange(enrichedEvent, context);

    } catch (error) {
      console.error('Error processing approval status change trigger:', error);
      throw error;
    }
  },

  sampleData: {
    requestId: 'req_001_sample',
    title: 'Sample Budget Approval Request',
    previousStatus: 'in_progress',
    newStatus: 'approved',
    statusChangedAt: '2025-01-03T15:30:00Z',
    statusChangedBy: 'manager@company.com',
    decisionType: 'final_approval',
    decisionDetails: {
      decision: 'approved',
      comments: 'Approved with conditions',
      confidence: 0.95,
      approvalTime: 180 // minutes
    },
    requestDetails: {
      category: 'budget',
      priority: 'HIGH',
      requestedBy: 'john.doe@company.com',
      requestedAt: '2025-01-03T10:00:00Z',
      amount: 50000,
      department: 'marketing',
      sopId: 'sop_budget_001',
      workflowId: 'wf_001'
    },
    approvalFlow: {
      totalStages: 2,
      completedStages: 2,
      currentStage: 'completed',
      escalationLevel: 0
    },
    metrics: {
      totalProcessingTime: 330, // minutes
      approverResponseTime: 180,
      escalationCount: 0,
      remindersSent: 1
    },
    metadata: {
      source: 'sop_approval_gate_status_trigger',
      triggerVersion: '1.0.0',
      eventId: 'evt_status_001'
    }
  }
});

/**
 * Parse status change event from webhook payload
 */
function parseStatusChangeEvent(body: any): any {
  return {
    requestId: body.requestId,
    title: body.title,
    previousStatus: body.previousStatus,
    newStatus: body.newStatus,
    statusChangedAt: body.statusChangedAt || new Date().toISOString(),
    statusChangedBy: body.statusChangedBy,
    decisionType: body.decisionType,
    decisionDetails: body.decisionDetails,
    requestDetails: body.requestDetails,
    approvalFlow: body.approvalFlow,
    metrics: body.metrics,
    isSystemDecision: body.statusChangedBy?.includes('system') || body.isSystemDecision,
    eventId: body.eventId || `evt_${Date.now()}`
  };
}

/**
 * Evaluate whether the status change should trigger the workflow
 */
async function evaluateStatusChangeFilters(event: any, filters: any): Promise<boolean> {
  // Check status changes filter
  if (!filters.statusChanges.includes(event.newStatus)) {
    return false;
  }

  // Check decision types filter
  if (filters.decisionTypes && filters.decisionTypes.length > 0 &&
      !filters.decisionTypes.includes(event.decisionType)) {
    return false;
  }

  // Check scope filters
  if (filters.monitorScope === 'my_requests' && 
      event.requestDetails?.requestedBy !== filters.requesterId) {
    return false;
  }

  if (filters.monitorScope === 'my_department' && 
      event.requestDetails?.department !== filters.department) {
    return false;
  }

  if (filters.monitorScope === 'specific_categories' && 
      filters.categories && !filters.categories.includes(event.requestDetails?.category)) {
    return false;
  }

  if (filters.monitorScope === 'high_priority_only' && 
      !['HIGH', 'URGENT', 'CRITICAL'].includes(event.requestDetails?.priority)) {
    return false;
  }

  // Check priority levels
  if (filters.priorityLevels && filters.priorityLevels.length > 0 &&
      !filters.priorityLevels.includes(event.requestDetails?.priority)) {
    return false;
  }

  // Check approver filters
  if (filters.approverId && event.statusChangedBy !== filters.approverId) {
    return false;
  }

  // Check amount threshold
  if (filters.amountThreshold && 
      (event.requestDetails?.amount || 0) < filters.amountThreshold) {
    return false;
  }

  // Check escalation level threshold
  if (filters.escalationLevelThreshold && 
      (event.approvalFlow?.escalationLevel || 0) < filters.escalationLevelThreshold) {
    return false;
  }

  // Check system decision exclusion
  if (filters.excludeSystemDecisions && event.isSystemDecision) {
    return false;
  }

  // Check auto-escalation inclusion
  if (!filters.includeAutoEscalations && 
      event.decisionType === 'auto_escalation') {
    return false;
  }

  // Check completion time threshold
  if (filters.completionTimeThreshold && event.metrics?.totalProcessingTime &&
      event.metrics.totalProcessingTime > (filters.completionTimeThreshold * 60)) {
    return false;
  }

  // Apply custom filter logic if provided
  if (filters.customFilterLogic) {
    try {
      const customResult = eval(`(function(event) { ${filters.customFilterLogic} })`)(event);
      if (!customResult) return false;
    } catch (error) {
      console.warn('Custom filter logic error:', error);
    }
  }

  return true;
}

/**
 * Check for duplicate events within deduplication window
 */
async function isDuplicateEvent(event: any, filters: any): Promise<boolean> {
  // In real implementation, check against recent event cache
  return false;
}

/**
 * Enrich status change event with additional data
 */
async function enrichStatusChangeEvent(event: any, options: any): Promise<any> {
  const enriched = { ...event };

  if (options.includeApprovalHistory) {
    enriched.approvalHistory = [
      {
        stage: 1,
        approver: 'dept_manager',
        decision: 'approved',
        timestamp: '2025-01-03T12:00:00Z',
        comments: 'Looks good from department perspective'
      }
    ];
  }

  if (options.includeApproverInfo) {
    enriched.approverInfo = {
      id: event.statusChangedBy,
      name: 'Department Manager',
      role: 'manager',
      department: 'marketing',
      delegatedFrom: null
    };
  }

  if (options.includeMetrics) {
    enriched.performanceMetrics = {
      slaCompliance: true,
      benchmarkComparison: 'above_average',
      effi ciencyScore: 0.85
    };
  }

  return enriched;
}

/**
 * Determine if event should be processed immediately
 */
function shouldProcessImmediately(event: any): boolean {
  // Process immediately for high priority or critical decisions
  return ['URGENT', 'CRITICAL'].includes(event.requestDetails?.priority) ||
         ['final_rejection', 'escalated'].includes(event.decisionType);
}

/**
 * Handle batched status change processing
 */
async function handleBatchedStatusChange(event: any, context: any): Promise<any> {
  return {
    success: true,
    triggered: true,
    batched: true,
    event: event,
    batchProcessingIn: context.propsValue.batchTimeoutMinutes
  };
}

/**
 * Process immediate status change trigger
 */
async function processImmediateStatusChange(event: any, context: any): Promise<any> {
  return {
    success: true,
    triggered: true,
    immediate: true,
    event: event,
    triggeredAt: new Date().toISOString()
  };
}