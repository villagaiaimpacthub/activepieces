/**
 * Escalation Trigger
 * 
 * Triggers when approval requests are escalated due to timeouts, rejections,
 * or manual escalation requests. Enables reactive workflows for handling
 * escalated approvals and alert notifications.
 */

import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';

export const escalationTrigger = createTrigger({
  name: 'escalation-trigger',
  displayName: 'Escalation Trigger',
  description: 'Triggers when approval requests are escalated to higher authority levels',
  
  type: TriggerStrategy.WEBHOOK,
  
  props: {
    // Escalation type filters
    escalationTypes: Property.MultiSelectDropdown({
      displayName: 'Escalation Types',
      description: 'Types of escalations to monitor',
      required: true,
      defaultValue: ['timeout_escalation'],
      options: {
        options: [
          { label: 'Timeout Escalation', value: 'timeout_escalation' },
          { label: 'Rejection Escalation', value: 'rejection_escalation' },
          { label: 'Manual Escalation', value: 'manual_escalation' },
          { label: 'System Escalation', value: 'system_escalation' },
          { label: 'Policy Escalation', value: 'policy_escalation' },
          { label: 'Compliance Escalation', value: 'compliance_escalation' },
          { label: 'Emergency Escalation', value: 'emergency_escalation' },
          { label: 'Conflict Resolution', value: 'conflict_resolution' }
        ]
      }
    }),

    // Escalation level filters
    escalationLevels: Property.MultiSelectDropdown({
      displayName: 'Escalation Levels',
      description: 'Escalation levels to monitor (1 = first level, 2 = second level, etc.)',
      required: false,
      options: {
        options: [
          { label: 'Level 1 (First Escalation)', value: '1' },
          { label: 'Level 2 (Second Escalation)', value: '2' },
          { label: 'Level 3 (Third Escalation)', value: '3' },
          { label: 'Level 4 (Fourth Escalation)', value: '4' },
          { label: 'Level 5+ (Maximum Escalation)', value: '5+' }
        ]
      }
    }),

    minimumEscalationLevel: Property.Number({
      displayName: 'Minimum Escalation Level',
      description: 'Trigger only for escalations at or above this level',
      required: false,
      defaultValue: 1,
      validators: [
        { type: 'min', value: 1 },
        { type: 'max', value: 10 }
      ]
    }),

    // Urgency and priority filters
    urgencyLevels: Property.MultiSelectDropdown({
      displayName: 'Priority Levels for Escalation',
      description: 'Monitor escalations only for these priority levels',
      required: false,
      options: {
        options: [
          { label: 'Low Priority', value: 'LOW' },
          { label: 'Normal Priority', value: 'NORMAL' },
          { label: 'High Priority', value: 'HIGH' },
          { label: 'Urgent', value: 'URGENT' },
          { label: 'Critical', value: 'CRITICAL' }
        ]
      }
    }),

    emergencyOnly: Property.Checkbox({
      displayName: 'Emergency Escalations Only',
      description: 'Monitor only emergency escalations',
      required: false,
      defaultValue: false
    }),

    // Scope and context filters
    monitorScope: Property.StaticDropdown({
      displayName: 'Monitor Scope',
      description: 'Scope of approval requests to monitor for escalations',
      required: true,
      defaultValue: 'all_escalations',
      options: {
        options: [
          { label: 'All Escalations', value: 'all_escalations' },
          { label: 'My Escalations', value: 'my_escalations' },
          { label: 'My Department', value: 'my_department' },
          { label: 'Specific Categories', value: 'specific_categories' },
          { label: 'Specific SOPs', value: 'specific_sops' },
          { label: 'Executive Level', value: 'executive_level' },
          { label: 'Compliance Required', value: 'compliance_required' }
        ]
      }
    }),

    // User and role filters
    escalatedBy: Property.ShortText({
      displayName: 'Escalated By (User ID)',
      description: 'Monitor only escalations initiated by this user',
      required: false
    }),

    escalatedTo: Property.ShortText({
      displayName: 'Escalated To (User/Role ID)',
      description: 'Monitor only escalations directed to this user or role',
      required: false
    }),

    escalationRoles: Property.Array({
      displayName: 'Escalation Roles',
      description: 'Monitor escalations involving these roles',
      required: false
    }),

    // Department and organizational filters
    departments: Property.Array({
      displayName: 'Departments',
      description: 'Monitor escalations from these departments',
      required: false
    }),

    businessUnits: Property.Array({
      displayName: 'Business Units',
      description: 'Monitor escalations from these business units',
      required: false
    }),

    // Category and process filters
    categories: Property.Array({
      displayName: 'Request Categories',
      description: 'Monitor escalations for requests in these categories',
      required: false
    }),

    sopIds: Property.Array({
      displayName: 'SOP IDs',
      description: 'Monitor escalations for specific SOP processes',
      required: false
    }),

    workflowTypes: Property.Array({
      displayName: 'Workflow Types',
      description: 'Monitor escalations for specific workflow types',
      required: false
    }),

    // Amount and value filters
    amountThreshold: Property.Number({
      displayName: 'Amount Threshold',
      description: 'Monitor escalations only for requests above this amount',
      required: false,
      validators: [{ type: 'min', value: 0 }]
    }),

    highValueOnly: Property.Checkbox({
      displayName: 'High Value Requests Only',
      description: 'Monitor escalations only for high-value requests',
      required: false,
      defaultValue: false
    }),

    // Timing filters
    escalationTimeThreshold: Property.Number({
      displayName: 'Escalation Time Threshold (Minutes)',
      description: 'Monitor escalations that occur within this time from request creation',
      required: false,
      validators: [{ type: 'min', value: 1 }]
    }),

    includeWeekendEscalations: Property.Checkbox({
      displayName: 'Include Weekend Escalations',
      description: 'Include escalations that occur on weekends',
      required: false,
      defaultValue: true
    }),

    includeAfterHoursEscalations: Property.Checkbox({
      displayName: 'Include After-Hours Escalations',
      description: 'Include escalations that occur outside business hours',
      required: false,
      defaultValue: true
    }),

    // Chain and hierarchy filters
    maxEscalationsOnly: Property.Checkbox({
      displayName: 'Maximum Escalations Only',
      description: 'Trigger only when escalation reaches maximum level',
      required: false,
      defaultValue: false
    }),

    escalationChainBreaks: Property.Checkbox({
      displayName: 'Monitor Chain Breaks',
      description: 'Trigger when escalation chain is broken or incomplete',
      required: false,
      defaultValue: false
    }),

    // Auto-escalation filters
    includeAutoEscalations: Property.Checkbox({
      displayName: 'Include Auto-Escalations',
      description: 'Include system-triggered automatic escalations',
      required: false,
      defaultValue: true
    }),

    manualEscalationsOnly: Property.Checkbox({
      displayName: 'Manual Escalations Only',
      description: 'Monitor only manually triggered escalations',
      required: false,
      defaultValue: false
    }),

    // Notification and response settings
    immediateAlert: Property.Checkbox({
      displayName: 'Immediate Alert',
      description: 'Send immediate alerts for escalations',
      required: false,
      defaultValue: true
    }),

    alertRecipients: Property.Array({
      displayName: 'Alert Recipients',
      description: 'Additional recipients for escalation alerts',
      required: false
    }),

    // Data enrichment options
    includeEscalationChain: Property.Checkbox({
      displayName: 'Include Escalation Chain',
      description: 'Include complete escalation chain information',
      required: false,
      defaultValue: true
    }),

    includeOriginalRequest: Property.Checkbox({
      displayName: 'Include Original Request',
      description: 'Include original approval request details',
      required: false,
      defaultValue: true
    }),

    includeApprovalHistory: Property.Checkbox({
      displayName: 'Include Approval History',
      description: 'Include complete approval history leading to escalation',
      required: false,
      defaultValue: false
    }),

    includePerformanceMetrics: Property.Checkbox({
      displayName: 'Include Performance Metrics',
      description: 'Include timing and performance metrics',
      required: false,
      defaultValue: false
    }),

    // Advanced filtering
    customEscalationLogic: Property.LongText({
      displayName: 'Custom Escalation Logic',
      description: 'Custom JavaScript logic for advanced escalation filtering',
      required: false
    }),

    skipDuplicateEscalations: Property.Checkbox({
      displayName: 'Skip Duplicate Escalations',
      description: 'Skip escalations for requests already escalated recently',
      required: false,
      defaultValue: true
    }),

    deduplicationMinutes: Property.Number({
      displayName: 'Deduplication Window (Minutes)',
      description: 'Minutes to wait before processing another escalation for the same request',
      required: false,
      defaultValue: 15,
      validators: [{ type: 'min', value: 1 }]
    }),

    // Compliance and audit
    complianceEscalationsOnly: Property.Checkbox({
      displayName: 'Compliance Escalations Only',
      description: 'Monitor only compliance-related escalations',
      required: false,
      defaultValue: false
    }),

    auditRequired: Property.Checkbox({
      displayName: 'Audit Required',
      description: 'Monitor only escalations that require audit attention',
      required: false,
      defaultValue: false
    }),

    // Escalation outcome prediction
    includeOutcomePrediction: Property.Checkbox({
      displayName: 'Include Outcome Prediction',
      description: 'Include AI-based escalation outcome predictions',
      required: false,
      defaultValue: false
    })
  },

  async onEnable(context) {
    const webhookId = `escalation_${context.propsValue.monitorScope}_${Date.now()}`;
    const webhookPath = `/escalation/${webhookId}`;
    
    console.log(`Registering escalation trigger: ${webhookPath}`);
    
    const webhookConfig = {
      webhookId,
      webhookPath,
      escalationFilters: {
        types: context.propsValue.escalationTypes,
        levels: context.propsValue.escalationLevels,
        minimumLevel: context.propsValue.minimumEscalationLevel,
        urgencyLevels: context.propsValue.urgencyLevels,
        emergencyOnly: context.propsValue.emergencyOnly
      },
      scopeFilters: {
        scope: context.propsValue.monitorScope,
        escalatedBy: context.propsValue.escalatedBy,
        escalatedTo: context.propsValue.escalatedTo,
        escalationRoles: context.propsValue.escalationRoles,
        departments: context.propsValue.departments,
        businessUnits: context.propsValue.businessUnits,
        categories: context.propsValue.categories,
        sopIds: context.propsValue.sopIds,
        workflowTypes: context.propsValue.workflowTypes
      },
      thresholdFilters: {
        amountThreshold: context.propsValue.amountThreshold,
        highValueOnly: context.propsValue.highValueOnly,
        escalationTimeThreshold: context.propsValue.escalationTimeThreshold,
        maxEscalationsOnly: context.propsValue.maxEscalationsOnly
      },
      inclusionSettings: {
        includeWeekendEscalations: context.propsValue.includeWeekendEscalations,
        includeAfterHoursEscalations: context.propsValue.includeAfterHoursEscalations,
        includeAutoEscalations: context.propsValue.includeAutoEscalations,
        manualEscalationsOnly: context.propsValue.manualEscalationsOnly,
        escalationChainBreaks: context.propsValue.escalationChainBreaks
      },
      dataEnrichment: {
        includeEscalationChain: context.propsValue.includeEscalationChain,
        includeOriginalRequest: context.propsValue.includeOriginalRequest,
        includeApprovalHistory: context.propsValue.includeApprovalHistory,
        includePerformanceMetrics: context.propsValue.includePerformanceMetrics,
        includeOutcomePrediction: context.propsValue.includeOutcomePrediction
      },
      alertSettings: {
        immediateAlert: context.propsValue.immediateAlert,
        alertRecipients: context.propsValue.alertRecipients
      },
      complianceSettings: {
        complianceEscalationsOnly: context.propsValue.complianceEscalationsOnly,
        auditRequired: context.propsValue.auditRequired
      },
      deduplication: {
        enabled: context.propsValue.skipDuplicateEscalations,
        windowMinutes: context.propsValue.deduplicationMinutes
      },
      customLogic: context.propsValue.customEscalationLogic
    };

    return {
      webhookId,
      webhookUrl: `${context.webhookUrl}${webhookPath}`,
      configuration: webhookConfig
    };
  },

  async onDisable(context) {
    console.log(`Deregistering escalation trigger`);
    return {
      success: true,
      message: 'Escalation trigger disabled successfully'
    };
  },

  async run(context) {
    const { body, headers } = context.payload;
    
    try {
      // Parse the escalation event
      const escalationEvent = parseEscalationEvent(body);
      
      // Apply filters to determine if this event should trigger
      const shouldTrigger = await evaluateEscalationFilters(escalationEvent, context.propsValue);
      
      if (!shouldTrigger) {
        return {
          success: true,
          triggered: false,
          reason: 'Escalation did not match trigger filters',
          event: escalationEvent
        };
      }

      // Check for deduplication
      if (context.propsValue.skipDuplicateEscalations) {
        const isDuplicate = await checkEscalationDeduplication(escalationEvent, context.propsValue);
        if (isDuplicate) {
          return {
            success: true,
            triggered: false,
            reason: 'Duplicate escalation within deduplication window',
            event: escalationEvent
          };
        }
      }

      // Enrich escalation event with additional data
      const enrichedEvent = await enrichEscalationEvent(escalationEvent, context.propsValue);

      // Process the escalation trigger
      return await processEscalationTrigger(enrichedEvent, context);

    } catch (error) {
      console.error('Error processing escalation trigger:', error);
      throw error;
    }
  },

  sampleData: {
    escalationId: 'esc_001_sample',
    requestId: 'req_001_sample',
    title: 'Budget Approval - Escalated to Executive Level',
    escalationType: 'timeout_escalation',
    escalationLevel: 2,
    escalatedAt: '2025-01-03T16:00:00Z',
    escalatedBy: 'system',
    escalatedFrom: 'dept_manager@company.com',
    escalatedTo: 'director@company.com',
    escalationReason: 'Approval timeout after 24 hours',
    originalRequest: {
      requestId: 'req_001_sample',
      title: 'Q4 Marketing Budget Approval',
      category: 'budget',
      priority: 'HIGH',
      amount: 75000,
      requestedBy: 'marketing_manager@company.com',
      requestedAt: '2025-01-02T10:00:00Z',
      department: 'marketing',
      sopId: 'sop_budget_001'
    },
    escalationChain: [
      {
        level: 1,
        escalatedTo: 'dept_manager@company.com',
        escalatedAt: '2025-01-02T10:00:00Z',
        status: 'timeout',
        timeoutAfter: 1440 // minutes
      },
      {
        level: 2,
        escalatedTo: 'director@company.com',
        escalatedAt: '2025-01-03T16:00:00Z',
        status: 'pending',
        dueAt: '2025-01-04T16:00:00Z'
      }
    ],
    metrics: {
      totalEscalationTime: 1800, // minutes from original request
      escalationCount: 2,
      timeToFirstEscalation: 1440,
      currentResponseTime: 360,
      isMaxEscalation: false,
      estimatedResolutionTime: 720
    },
    compliance: {
      requiresAudit: true,
      complianceFlags: ['HIGH_VALUE_ESCALATION', 'EXECUTIVE_APPROVAL_REQUIRED'],
      regulatoryImpact: 'moderate'
    },
    prediction: {
      outcomeConfidence: 0.75,
      predictedOutcome: 'approved_with_conditions',
      riskFactors: ['budget_constraints', 'timing_pressure'],
      recommendedActions: ['schedule_meeting', 'provide_additional_context']
    },
    metadata: {
      source: 'sop_approval_gate_escalation_trigger',
      triggerVersion: '1.0.0',
      eventId: 'evt_esc_001',
      isEmergency: false,
      businessHoursEscalation: false
    }
  }
});

/**
 * Parse escalation event from webhook payload
 */
function parseEscalationEvent(body: any): any {
  return {
    escalationId: body.escalationId,
    requestId: body.requestId,
    title: body.title,
    escalationType: body.escalationType,
    escalationLevel: body.escalationLevel,
    escalatedAt: body.escalatedAt || new Date().toISOString(),
    escalatedBy: body.escalatedBy,
    escalatedFrom: body.escalatedFrom,
    escalatedTo: body.escalatedTo,
    escalationReason: body.escalationReason,
    originalRequest: body.originalRequest,
    escalationChain: body.escalationChain || [],
    metrics: body.metrics,
    compliance: body.compliance,
    prediction: body.prediction,
    isEmergency: body.isEmergency || false,
    isAutoEscalation: body.escalatedBy === 'system' || body.isAutomatic,
    businessHoursEscalation: isBusinessHours(body.escalatedAt),
    weekendEscalation: isWeekend(body.escalatedAt)
  };
}

/**
 * Evaluate whether the escalation should trigger the workflow
 */
async function evaluateEscalationFilters(event: any, filters: any): Promise<boolean> {
  // Check escalation types
  if (!filters.escalationTypes.includes(event.escalationType)) {
    return false;
  }

  // Check escalation levels
  if (filters.escalationLevels && filters.escalationLevels.length > 0) {
    const levelMatch = filters.escalationLevels.some(level => {
      if (level === '5+') return event.escalationLevel >= 5;
      return event.escalationLevel === parseInt(level);
    });
    if (!levelMatch) return false;
  }

  // Check minimum escalation level
  if (event.escalationLevel < filters.minimumEscalationLevel) {
    return false;
  }

  // Check emergency only filter
  if (filters.emergencyOnly && !event.isEmergency) {
    return false;
  }

  // Check urgency levels
  if (filters.urgencyLevels && filters.urgencyLevels.length > 0 &&
      !filters.urgencyLevels.includes(event.originalRequest?.priority)) {
    return false;
  }

  // Check scope filters
  if (filters.monitorScope === 'my_escalations' && 
      event.escalatedTo !== filters.escalatedTo) {
    return false;
  }

  if (filters.monitorScope === 'my_department' && 
      !filters.departments?.includes(event.originalRequest?.department)) {
    return false;
  }

  if (filters.monitorScope === 'executive_level' && 
      event.escalationLevel < 3) {
    return false;
  }

  if (filters.monitorScope === 'compliance_required' && 
      !event.compliance?.requiresAudit) {
    return false;
  }

  // Check user filters
  if (filters.escalatedBy && event.escalatedBy !== filters.escalatedBy) {
    return false;
  }

  if (filters.escalatedTo && event.escalatedTo !== filters.escalatedTo) {
    return false;
  }

  // Check category filters
  if (filters.categories && filters.categories.length > 0 &&
      !filters.categories.includes(event.originalRequest?.category)) {
    return false;
  }

  // Check SOP ID filters
  if (filters.sopIds && filters.sopIds.length > 0 &&
      !filters.sopIds.includes(event.originalRequest?.sopId)) {
    return false;
  }

  // Check amount threshold
  if (filters.amountThreshold && 
      (event.originalRequest?.amount || 0) < filters.amountThreshold) {
    return false;
  }

  // Check high value only
  if (filters.highValueOnly && (event.originalRequest?.amount || 0) < 100000) {
    return false;
  }

  // Check max escalations only
  if (filters.maxEscalationsOnly && !event.metrics?.isMaxEscalation) {
    return false;
  }

  // Check manual escalations only
  if (filters.manualEscalationsOnly && event.isAutoEscalation) {
    return false;
  }

  // Check auto escalations inclusion
  if (!filters.includeAutoEscalations && event.isAutoEscalation) {
    return false;
  }

  // Check time-based filters
  if (!filters.includeWeekendEscalations && event.weekendEscalation) {
    return false;
  }

  if (!filters.includeAfterHoursEscalations && !event.businessHoursEscalation) {
    return false;
  }

  // Check escalation time threshold
  if (filters.escalationTimeThreshold && event.metrics?.timeToFirstEscalation &&
      event.metrics.timeToFirstEscalation > filters.escalationTimeThreshold) {
    return false;
  }

  // Check compliance filters
  if (filters.complianceEscalationsOnly && !event.compliance?.requiresAudit) {
    return false;
  }

  if (filters.auditRequired && !event.compliance?.requiresAudit) {
    return false;
  }

  // Apply custom logic if provided
  if (filters.customEscalationLogic) {
    try {
      const customResult = eval(`(function(event) { ${filters.customEscalationLogic} })`)(event);
      if (!customResult) return false;
    } catch (error) {
      console.warn('Custom escalation logic error:', error);
    }
  }

  return true;
}

/**
 * Check for escalation deduplication
 */
async function checkEscalationDeduplication(event: any, filters: any): Promise<boolean> {
  // In real implementation, check against recent escalations cache
  return false;
}

/**
 * Enrich escalation event with additional data
 */
async function enrichEscalationEvent(event: any, options: any): Promise<any> {
  const enriched = { ...event };

  if (options.includeEscalationChain && !event.escalationChain.length) {
    enriched.escalationChain = await buildEscalationChain(event.requestId);
  }

  if (options.includeApprovalHistory) {
    enriched.approvalHistory = await getApprovalHistory(event.requestId);
  }

  if (options.includePerformanceMetrics) {
    enriched.performanceMetrics = await calculatePerformanceMetrics(event);
  }

  if (options.includeOutcomePrediction) {
    enriched.prediction = await predictEscalationOutcome(event);
  }

  return enriched;
}

/**
 * Process escalation trigger
 */
async function processEscalationTrigger(event: any, context: any): Promise<any> {
  const response = {
    success: true,
    triggered: true,
    event: event,
    triggeredAt: new Date().toISOString(),
    escalationLevel: event.escalationLevel,
    isEmergency: event.isEmergency
  };

  // Send immediate alerts if configured
  if (context.propsValue.immediateAlert) {
    await sendEscalationAlert(event, context.propsValue.alertRecipients);
    response.alertSent = true;
  }

  return response;
}

/**
 * Helper functions
 */
function isBusinessHours(timestamp: string): boolean {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const day = date.getDay();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

function isWeekend(timestamp: string): boolean {
  const date = new Date(timestamp);
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function buildEscalationChain(requestId: string): Promise<any[]> {
  // Mock escalation chain
  return [
    {
      level: 1,
      escalatedTo: 'manager@company.com',
      escalatedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'timeout'
    }
  ];
}

async function getApprovalHistory(requestId: string): Promise<any[]> {
  // Mock approval history
  return [
    {
      approver: 'initial_approver@company.com',
      decision: 'no_response',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ];
}

async function calculatePerformanceMetrics(event: any): Promise<any> {
  return {
    averageEscalationTime: 1200, // minutes
    escalationRate: 0.25,
    resolutionProbability: 0.80
  };
}

async function predictEscalationOutcome(event: any): Promise<any> {
  return {
    outcomeConfidence: 0.75,
    predictedOutcome: 'approved',
    estimatedResolutionTime: 480 // minutes
  };
}

async function sendEscalationAlert(event: any, recipients: string[]): Promise<void> {
  console.log(`Sending escalation alert for ${event.requestId} to:`, recipients);
}