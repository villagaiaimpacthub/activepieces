/**
 * Approval Request Trigger
 * 
 * Triggers when a new approval request is created or when an existing approval
 * request requires attention from a specific approver. Enables reactive workflows
 * based on approval events.
 */

import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';

export const approvalRequestTrigger = createTrigger({
  name: 'approval-request-trigger',
  displayName: 'Approval Request Trigger',
  description: 'Triggers when new approval requests are created or require attention',
  
  type: TriggerStrategy.WEBHOOK,
  
  props: {
    // Trigger scope
    triggerScope: Property.StaticDropdown({
      displayName: 'Trigger Scope',
      description: 'What type of approval events should trigger this workflow',
      required: true,
      defaultValue: 'new_requests',
      options: {
        options: [
          { label: 'New Approval Requests', value: 'new_requests' },
          { label: 'Assigned to Me', value: 'assigned_to_me' },
          { label: 'My Department', value: 'my_department' },
          { label: 'Specific Categories', value: 'specific_categories' },
          { label: 'High Priority Only', value: 'high_priority' },
          { label: 'All Approval Events', value: 'all_events' }
        ]
      }
    }),

    // User/approver filter
    approverId: Property.ShortText({
      displayName: 'Approver ID',
      description: 'Trigger only for approval requests assigned to this approver (for "assigned_to_me" scope)',
      required: false
    }),

    // Department filter
    department: Property.ShortText({
      displayName: 'Department',
      description: 'Trigger only for approval requests from this department (for "my_department" scope)',
      required: false
    }),

    // Category filters
    categories: Property.Array({
      displayName: 'Categories',
      description: 'Trigger only for approval requests in these categories (for "specific_categories" scope)',
      required: false
    }),

    // Priority filters
    minimumPriority: Property.StaticDropdown({
      displayName: 'Minimum Priority',
      description: 'Minimum priority level to trigger on',
      required: false,
      defaultValue: 'NORMAL',
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

    // SOP filters
    sopIds: Property.Array({
      displayName: 'SOP IDs',
      description: 'Trigger only for approval requests from specific SOPs',
      required: false
    }),

    sopCategories: Property.Array({
      displayName: 'SOP Categories',
      description: 'Trigger only for approval requests from SOPs in these categories',
      required: false
    }),

    // Event type filters
    eventTypes: Property.MultiSelectDropdown({
      displayName: 'Event Types',
      description: 'Types of approval events to trigger on',
      required: false,
      defaultValue: ['request_created'],
      options: {
        options: [
          { label: 'Request Created', value: 'request_created' },
          { label: 'Approver Assigned', value: 'approver_assigned' },
          { label: 'Deadline Approaching', value: 'deadline_approaching' },
          { label: 'Request Reassigned', value: 'request_reassigned' },
          { label: 'Priority Changed', value: 'priority_changed' },
          { label: 'Escalation Triggered', value: 'escalation_triggered' },
          { label: 'Reminder Sent', value: 'reminder_sent' }
        ]
      }
    }),

    // Time-based filters
    businessHoursOnly: Property.Checkbox({
      displayName: 'Business Hours Only',
      description: 'Trigger only during business hours',
      required: false,
      defaultValue: false
    }),

    excludeWeekends: Property.Checkbox({
      displayName: 'Exclude Weekends',
      description: 'Do not trigger on weekends',
      required: false,
      defaultValue: false
    }),

    // Notification delays
    immediateResponse: Property.Checkbox({
      displayName: 'Immediate Response Required',
      description: 'Trigger immediately for requests requiring immediate response',
      required: false,
      defaultValue: true
    }),

    batchingEnabled: Property.Checkbox({
      displayName: 'Enable Batching',
      description: 'Batch multiple approval requests together',
      required: false,
      defaultValue: false
    }),

    batchingIntervalMinutes: Property.Number({
      displayName: 'Batching Interval (Minutes)',
      description: 'Minutes to wait before processing batched requests',
      required: false,
      defaultValue: 15,
      validators: [{ type: 'min', value: 1 }]
    }),

    // Advanced filters
    requestAmountThreshold: Property.Number({
      displayName: 'Request Amount Threshold',
      description: 'Trigger only for requests above this monetary amount',
      required: false,
      validators: [{ type: 'min', value: 0 }]
    }),

    requesterRoles: Property.Array({
      displayName: 'Requester Roles',
      description: 'Trigger only for requests from users with these roles',
      required: false
    }),

    excludeAutomatedRequests: Property.Checkbox({
      displayName: 'Exclude Automated Requests',
      description: 'Do not trigger for system-generated/automated requests',
      required: false,
      defaultValue: false
    }),

    // Webhook configuration
    webhookPath: Property.ShortText({
      displayName: 'Custom Webhook Path',
      description: 'Custom path for the webhook endpoint (optional)',
      required: false
    }),

    authenticationRequired: Property.Checkbox({
      displayName: 'Require Authentication',
      description: 'Require authentication for webhook calls',
      required: false,
      defaultValue: true
    }),

    // Response handling
    acknowledgmentRequired: Property.Checkbox({
      displayName: 'Require Acknowledgment',
      description: 'Require acknowledgment that the trigger was processed',
      required: false,
      defaultValue: false
    }),

    retryOnFailure: Property.Checkbox({
      displayName: 'Retry on Failure',
      description: 'Retry trigger if initial processing fails',
      required: false,
      defaultValue: true
    }),

    maxRetries: Property.Number({
      displayName: 'Maximum Retries',
      description: 'Maximum number of retry attempts',
      required: false,
      defaultValue: 3,
      validators: [
        { type: 'min', value: 1 },
        { type: 'max', value: 10 }
      ]
    })
  },

  // Webhook registration
  async onEnable(context) {
    // Register webhook endpoint for approval request events
    const webhookId = `approval_request_${context.propsValue.triggerScope}_${Date.now()}`;
    const webhookPath = context.propsValue.webhookPath || `/approval-request/${webhookId}`;
    
    // In real implementation, this would register with the approval system
    console.log(`Registering approval request trigger webhook: ${webhookPath}`);
    
    // Store webhook configuration for later use
    const webhookConfig = {
      webhookId,
      webhookPath,
      triggerScope: context.propsValue.triggerScope,
      filters: {
        approverId: context.propsValue.approverId,
        department: context.propsValue.department,
        categories: context.propsValue.categories,
        minimumPriority: context.propsValue.minimumPriority,
        sopIds: context.propsValue.sopIds,
        sopCategories: context.propsValue.sopCategories,
        eventTypes: context.propsValue.eventTypes,
        requestAmountThreshold: context.propsValue.requestAmountThreshold,
        requesterRoles: context.propsValue.requesterRoles,
        excludeAutomatedRequests: context.propsValue.excludeAutomatedRequests
      },
      timing: {
        businessHoursOnly: context.propsValue.businessHoursOnly,
        excludeWeekends: context.propsValue.excludeWeekends,
        immediateResponse: context.propsValue.immediateResponse,
        batchingEnabled: context.propsValue.batchingEnabled,
        batchingIntervalMinutes: context.propsValue.batchingIntervalMinutes
      },
      security: {
        authenticationRequired: context.propsValue.authenticationRequired
      },
      reliability: {
        acknowledgmentRequired: context.propsValue.acknowledgmentRequired,
        retryOnFailure: context.propsValue.retryOnFailure,
        maxRetries: context.propsValue.maxRetries
      }
    };

    // Return webhook URL for external system registration
    return {
      webhookId,
      webhookUrl: `${context.webhookUrl}${webhookPath}`,
      configuration: webhookConfig
    };
  },

  // Webhook deregistration
  async onDisable(context) {
    // Unregister webhook endpoint
    console.log(`Deregistering approval request trigger webhook`);
    
    // In real implementation, this would clean up webhook registrations
    return {
      success: true,
      message: 'Approval request trigger disabled successfully'
    };
  },

  // Process incoming webhook
  async run(context) {
    const { body, headers, queryParams } = context.payload;
    
    try {
      // Validate webhook authentication if required
      if (context.propsValue.authenticationRequired) {
        if (!validateWebhookAuthentication(headers)) {
          throw new Error('Invalid webhook authentication');
        }
      }

      // Parse and validate the incoming approval request event
      const approvalEvent = parseApprovalRequestEvent(body);
      
      // Apply filters to determine if this event should trigger the workflow
      const shouldTrigger = await evaluateTriggerFilters(approvalEvent, context.propsValue);
      
      if (!shouldTrigger) {
        return {
          success: true,
          triggered: false,
          reason: 'Event did not match trigger filters',
          event: approvalEvent
        };
      }

      // Handle batching if enabled
      if (context.propsValue.batchingEnabled && !approvalEvent.requiresImmediate) {
        return await handleBatchedTrigger(approvalEvent, context);
      }

      // Process immediate trigger
      return await processImmediateTrigger(approvalEvent, context);

    } catch (error) {
      console.error('Error processing approval request trigger:', error);
      
      // Handle retry logic if enabled
      if (context.propsValue.retryOnFailure) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          shouldRetry: true,
          retryAfter: 60000 // 1 minute
        };
      }
      
      throw error;
    }
  },

  // Sample data for testing
  sampleData: {
    requestId: 'req_001_sample',
    title: 'Sample Budget Approval Request',
    description: 'Sample approval request for testing the trigger',
    category: 'budget',
    priority: 'HIGH',
    requestedBy: 'john.doe@company.com',
    requestedAt: '2025-01-03T10:00:00Z',
    dueDate: '2025-01-10T17:00:00Z',
    assignedTo: 'manager@company.com',
    amount: 50000,
    department: 'marketing',
    sopId: 'sop_budget_001',
    workflowId: 'wf_001',
    eventType: 'request_created',
    metadata: {
      source: 'sop_approval_gate_trigger',
      triggerVersion: '1.0.0'
    }
  }
});

/**
 * Validate webhook authentication
 */
function validateWebhookAuthentication(headers: Record<string, any>): boolean {
  // In real implementation, validate signature, API key, etc.
  return true;
}

/**
 * Parse approval request event from webhook payload
 */
function parseApprovalRequestEvent(body: any): any {
  // In real implementation, parse and validate the event structure
  return {
    requestId: body.requestId,
    title: body.title,
    description: body.description,
    category: body.category,
    priority: body.priority,
    requestedBy: body.requestedBy,
    requestedAt: body.requestedAt,
    dueDate: body.dueDate,
    assignedTo: body.assignedTo,
    amount: body.amount,
    department: body.department,
    sopId: body.sopId,
    workflowId: body.workflowId,
    eventType: body.eventType,
    requiresImmediate: body.priority === 'CRITICAL' || body.priority === 'URGENT',
    isAutomated: body.requestedBy?.includes('system') || body.source === 'automated'
  };
}

/**
 * Evaluate whether the event should trigger the workflow
 */
async function evaluateTriggerFilters(event: any, filters: any): Promise<boolean> {
  // Check trigger scope
  if (filters.triggerScope === 'assigned_to_me' && event.assignedTo !== filters.approverId) {
    return false;
  }
  
  if (filters.triggerScope === 'my_department' && event.department !== filters.department) {
    return false;
  }
  
  if (filters.triggerScope === 'specific_categories' && 
      filters.categories && !filters.categories.includes(event.category)) {
    return false;
  }
  
  if (filters.triggerScope === 'high_priority' && 
      !['HIGH', 'URGENT', 'CRITICAL'].includes(event.priority)) {
    return false;
  }

  // Check priority threshold
  const priorityLevels = { 'LOW': 1, 'NORMAL': 2, 'HIGH': 3, 'URGENT': 4, 'CRITICAL': 5 };
  const eventPriorityLevel = priorityLevels[event.priority] || 0;
  const minPriorityLevel = priorityLevels[filters.minimumPriority] || 0;
  
  if (eventPriorityLevel < minPriorityLevel) {
    return false;
  }

  // Check amount threshold
  if (filters.requestAmountThreshold && 
      (event.amount || 0) < filters.requestAmountThreshold) {
    return false;
  }

  // Check automated request exclusion
  if (filters.excludeAutomatedRequests && event.isAutomated) {
    return false;
  }

  // Check event types
  if (filters.eventTypes && !filters.eventTypes.includes(event.eventType)) {
    return false;
  }

  // Check time-based filters
  if (filters.businessHoursOnly || filters.excludeWeekends) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    if (filters.businessHoursOnly && (hour < 9 || hour >= 17)) {
      return false;
    }
    
    if (filters.excludeWeekends && (day === 0 || day === 6)) {
      return false;
    }
  }

  return true;
}

/**
 * Handle batched trigger processing
 */
async function handleBatchedTrigger(event: any, context: any): Promise<any> {
  // In real implementation, this would add to batch queue
  return {
    success: true,
    triggered: true,
    batched: true,
    event: event,
    batchProcessingIn: context.propsValue.batchingIntervalMinutes
  };
}

/**
 * Process immediate trigger
 */
async function processImmediateTrigger(event: any, context: any): Promise<any> {
  return {
    success: true,
    triggered: true,
    immediate: true,
    event: event,
    triggeredAt: new Date().toISOString()
  };
}