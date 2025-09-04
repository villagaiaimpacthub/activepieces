/**
 * Query Approval Status Action
 * 
 * Retrieves current status and detailed information about approval requests,
 * including progress, pending approvers, escalation history, and audit trails.
 */

import { createAction, Property } from '@activepieces/pieces-framework';

export const queryApprovalStatus = createAction({
  name: 'query-approval-status',
  displayName: 'Query Approval Status',
  description: 'Get current status and detailed information about an approval request',
  
  props: {
    // Request identification
    requestId: Property.ShortText({
      displayName: 'Approval Request ID',
      description: 'Unique identifier of the approval request to query',
      required: false
    }),

    // Alternative lookup methods
    sopId: Property.ShortText({
      displayName: 'SOP ID',
      description: 'Query by SOP process identifier',
      required: false
    }),

    workflowId: Property.ShortText({
      displayName: 'Workflow ID',
      description: 'Query by workflow instance identifier',
      required: false
    }),

    requestedBy: Property.ShortText({
      displayName: 'Requested By',
      description: 'Query approvals requested by specific user',
      required: false
    }),

    // Query filters
    status: Property.MultiSelectDropdown({
      displayName: 'Status Filter',
      description: 'Filter by specific approval statuses',
      required: false,
      options: {
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Escalated', value: 'escalated' },
          { label: 'Timeout', value: 'timeout' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Delegated', value: 'delegated' }
        ]
      }
    }),

    priority: Property.MultiSelectDropdown({
      displayName: 'Priority Filter',
      description: 'Filter by priority levels',
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

    // Date range filters
    createdAfter: Property.DateTime({
      displayName: 'Created After',
      description: 'Show only requests created after this date',
      required: false
    }),

    createdBefore: Property.DateTime({
      displayName: 'Created Before',
      description: 'Show only requests created before this date',
      required: false
    }),

    dueDateAfter: Property.DateTime({
      displayName: 'Due Date After',
      description: 'Show only requests with due date after this date',
      required: false
    }),

    dueDateBefore: Property.DateTime({
      displayName: 'Due Date Before',
      description: 'Show only requests with due date before this date',
      required: false
    }),

    // Approver filters
    pendingApproverId: Property.ShortText({
      displayName: 'Pending Approver ID',
      description: 'Show requests pending approval from specific user',
      required: false
    }),

    approvedBy: Property.ShortText({
      displayName: 'Approved By',
      description: 'Show requests approved by specific user',
      required: false
    }),

    // Response detail level
    includeAuditTrail: Property.Checkbox({
      displayName: 'Include Audit Trail',
      description: 'Include detailed audit trail in response',
      required: false,
      defaultValue: false
    }),

    includeApprovalHistory: Property.Checkbox({
      displayName: 'Include Approval History',
      description: 'Include complete approval response history',
      required: false,
      defaultValue: true
    }),

    includeAttachments: Property.Checkbox({
      displayName: 'Include Attachments',
      description: 'Include attachment information in response',
      required: false,
      defaultValue: false
    }),

    includeEscalationHistory: Property.Checkbox({
      displayName: 'Include Escalation History',
      description: 'Include escalation history and chain',
      required: false,
      defaultValue: false
    }),

    // Pagination and limits
    limit: Property.Number({
      displayName: 'Result Limit',
      description: 'Maximum number of results to return',
      required: false,
      defaultValue: 50,
      validators: [
        { type: 'min', value: 1 },
        { type: 'max', value: 1000 }
      ]
    }),

    offset: Property.Number({
      displayName: 'Result Offset',
      description: 'Number of results to skip (for pagination)',
      required: false,
      defaultValue: 0,
      validators: [{ type: 'min', value: 0 }]
    }),

    // Sorting
    sortBy: Property.StaticDropdown({
      displayName: 'Sort By',
      description: 'Field to sort results by',
      required: false,
      defaultValue: 'created_date',
      options: {
        options: [
          { label: 'Created Date', value: 'created_date' },
          { label: 'Due Date', value: 'due_date' },
          { label: 'Priority', value: 'priority' },
          { label: 'Status', value: 'status' },
          { label: 'Last Updated', value: 'last_updated' },
          { label: 'Title', value: 'title' }
        ]
      }
    }),

    sortOrder: Property.StaticDropdown({
      displayName: 'Sort Order',
      description: 'Sort order for results',
      required: false,
      defaultValue: 'desc',
      options: {
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' }
        ]
      }
    }),

    // Analytics options
    includeAnalytics: Property.Checkbox({
      displayName: 'Include Analytics',
      description: 'Include performance analytics and metrics',
      required: false,
      defaultValue: false
    }),

    includeTimeMetrics: Property.Checkbox({
      displayName: 'Include Time Metrics',
      description: 'Include timing metrics (response times, escalation times, etc.)',
      required: false,
      defaultValue: false
    })
  },

  async run({ propsValue }) {
    try {
      // Build query parameters
      const queryParams = {
        requestId: propsValue.requestId,
        sopId: propsValue.sopId,
        workflowId: propsValue.workflowId,
        requestedBy: propsValue.requestedBy,
        status: propsValue.status,
        priority: propsValue.priority,
        createdAfter: propsValue.createdAfter,
        createdBefore: propsValue.createdBefore,
        dueDateAfter: propsValue.dueDateAfter,
        dueDateBefore: propsValue.dueDateBefore,
        pendingApproverId: propsValue.pendingApproverId,
        approvedBy: propsValue.approvedBy,
        limit: propsValue.limit || 50,
        offset: propsValue.offset || 0,
        sortBy: propsValue.sortBy || 'created_date',
        sortOrder: propsValue.sortOrder || 'desc'
      };

      // Query approval requests
      const queryResult = await queryApprovalRequests(queryParams, {
        includeAuditTrail: propsValue.includeAuditTrail,
        includeApprovalHistory: propsValue.includeApprovalHistory,
        includeAttachments: propsValue.includeAttachments,
        includeEscalationHistory: propsValue.includeEscalationHistory,
        includeAnalytics: propsValue.includeAnalytics,
        includeTimeMetrics: propsValue.includeTimeMetrics
      });

      return {
        success: true,
        query: {
          executedAt: new Date().toISOString(),
          parameters: queryParams,
          resultsFound: queryResult.total,
          resultsReturned: queryResult.requests.length
        },
        requests: queryResult.requests,
        pagination: {
          total: queryResult.total,
          limit: propsValue.limit || 50,
          offset: propsValue.offset || 0,
          hasNext: (propsValue.offset || 0) + (propsValue.limit || 50) < queryResult.total,
          hasPrev: (propsValue.offset || 0) > 0
        },
        summary: queryResult.summary,
        analytics: queryResult.analytics || undefined,
        metadata: {
          queryFrameworkVersion: '1.0.0',
          queryExecutionTime: queryResult.executionTime,
          includeFlags: {
            auditTrail: propsValue.includeAuditTrail,
            approvalHistory: propsValue.includeApprovalHistory,
            attachments: propsValue.includeAttachments,
            escalationHistory: propsValue.includeEscalationHistory,
            analytics: propsValue.includeAnalytics,
            timeMetrics: propsValue.includeTimeMetrics
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown query error',
          type: 'ApprovalQueryError',
          timestamp: new Date().toISOString(),
          queryParameters: {
            hasRequestId: !!propsValue.requestId,
            hasSopId: !!propsValue.sopId,
            hasWorkflowId: !!propsValue.workflowId,
            hasFilters: !!(propsValue.status || propsValue.priority || propsValue.requestedBy)
          }
        }
      };
    }
  }
});

/**
 * Query approval requests (placeholder for real implementation)
 */
async function queryApprovalRequests(
  params: any,
  options: {
    includeAuditTrail?: boolean;
    includeApprovalHistory?: boolean;
    includeAttachments?: boolean;
    includeEscalationHistory?: boolean;
    includeAnalytics?: boolean;
    includeTimeMetrics?: boolean;
  }
): Promise<{
  total: number;
  requests: any[];
  summary: any;
  analytics?: any;
  executionTime: number;
}> {
  
  const startTime = Date.now();
  
  // Simulate database query with mock data
  const mockRequests = [
    {
      requestId: 'req_001',
      title: 'Budget Approval - Q4 Marketing',
      description: 'Approval for Q4 marketing budget allocation',
      status: 'pending',
      priority: 'HIGH',
      category: 'budget',
      requestedBy: 'user_marketing_manager',
      requestedAt: '2025-01-03T10:00:00Z',
      dueDate: '2025-01-10T17:00:00Z',
      approvalType: 'sequential',
      requiredApprovals: 2,
      currentApprovals: 0,
      pendingApprovers: [
        { id: 'user_finance_director', name: 'Finance Director', level: 1 },
        { id: 'user_cfo', name: 'CFO', level: 2 }
      ],
      escalationLevel: 0,
      sopId: 'sop_budget_001',
      workflowId: 'wf_001',
      lastActivity: '2025-01-03T10:00:00Z'
    },
    {
      requestId: 'req_002',
      title: 'Policy Change Approval',
      description: 'Approval for new remote work policy',
      status: 'in_progress',
      priority: 'NORMAL',
      category: 'policy',
      requestedBy: 'user_hr_manager',
      requestedAt: '2025-01-02T14:00:00Z',
      dueDate: '2025-01-15T17:00:00Z',
      approvalType: 'parallel',
      requiredApprovals: 3,
      currentApprovals: 1,
      pendingApprovers: [
        { id: 'user_legal_counsel', name: 'Legal Counsel', level: 1 },
        { id: 'user_operations_director', name: 'Operations Director', level: 1 }
      ],
      escalationLevel: 0,
      sopId: 'sop_policy_001',
      workflowId: 'wf_002',
      lastActivity: '2025-01-03T09:00:00Z'
    }
  ];

  // Apply filters
  let filteredRequests = mockRequests;
  
  if (params.requestId) {
    filteredRequests = filteredRequests.filter(r => r.requestId === params.requestId);
  }
  
  if (params.status && params.status.length > 0) {
    filteredRequests = filteredRequests.filter(r => params.status.includes(r.status));
  }
  
  if (params.priority && params.priority.length > 0) {
    filteredRequests = filteredRequests.filter(r => params.priority.includes(r.priority));
  }

  if (params.requestedBy) {
    filteredRequests = filteredRequests.filter(r => r.requestedBy === params.requestedBy);
  }

  // Apply pagination
  const total = filteredRequests.length;
  const paginatedRequests = filteredRequests.slice(params.offset, params.offset + params.limit);

  // Enhance requests with additional data based on options
  const enhancedRequests = paginatedRequests.map(request => {
    const enhanced: any = { ...request };

    if (options.includeApprovalHistory) {
      enhanced.approvalHistory = [
        {
          responseId: 'resp_001',
          approverId: 'user_dept_manager',
          decision: 'approved',
          timestamp: '2025-01-03T09:00:00Z',
          comments: 'Approved with minor budget adjustments'
        }
      ];
    }

    if (options.includeAuditTrail) {
      enhanced.auditTrail = [
        {
          timestamp: request.requestedAt,
          action: 'approval_request_created',
          userId: request.requestedBy,
          details: { initialPriority: request.priority }
        }
      ];
    }

    if (options.includeAttachments) {
      enhanced.attachments = [
        {
          id: 'att_001',
          name: 'budget_proposal.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedAt: request.requestedAt
        }
      ];
    }

    if (options.includeEscalationHistory) {
      enhanced.escalationHistory = [];
    }

    if (options.includeTimeMetrics) {
      enhanced.timeMetrics = {
        timeToFirstResponse: null,
        averageResponseTime: null,
        totalProcessingTime: Date.now() - new Date(request.requestedAt).getTime(),
        escalationTime: null
      };
    }

    return enhanced;
  });

  // Generate summary
  const summary = {
    totalRequests: total,
    byStatus: {
      pending: filteredRequests.filter(r => r.status === 'pending').length,
      in_progress: filteredRequests.filter(r => r.status === 'in_progress').length,
      approved: filteredRequests.filter(r => r.status === 'approved').length,
      rejected: filteredRequests.filter(r => r.status === 'rejected').length,
      escalated: filteredRequests.filter(r => r.status === 'escalated').length
    },
    byPriority: {
      LOW: filteredRequests.filter(r => r.priority === 'LOW').length,
      NORMAL: filteredRequests.filter(r => r.priority === 'NORMAL').length,
      HIGH: filteredRequests.filter(r => r.priority === 'HIGH').length,
      URGENT: filteredRequests.filter(r => r.priority === 'URGENT').length,
      CRITICAL: filteredRequests.filter(r => r.priority === 'CRITICAL').length
    },
    avgProcessingTime: 24.5, // hours
    escalationRate: 0.15 // 15%
  };

  // Generate analytics if requested
  let analytics;
  if (options.includeAnalytics) {
    analytics = {
      trends: {
        requestVolume: {
          thisWeek: 15,
          lastWeek: 12,
          growth: 25
        },
        approvalRate: {
          thisWeek: 0.85,
          lastWeek: 0.82,
          change: 0.03
        }
      },
      performance: {
        averageResponseTime: 18.5, // hours
        escalationRate: 0.15,
        timeoutRate: 0.05
      },
      topCategories: [
        { category: 'budget', count: 8 },
        { category: 'policy', count: 5 },
        { category: 'operational', count: 3 }
      ]
    };
  }

  return {
    total,
    requests: enhancedRequests,
    summary,
    analytics,
    executionTime: Date.now() - startTime
  };
}