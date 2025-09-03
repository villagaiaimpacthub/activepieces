/**
 * SOP Workflow Helper Functions
 * Specialized utilities for SOP workflow management, decision routing, and approval handling
 */

import { logger } from './logger';
import { SOPExecutionContext, SOPDecision, SOPStep, ProcessingResult } from './sop-process-utilities';

// Workflow management interfaces
export interface WorkflowState {
  execution_id: string;
  process_id: string;
  current_step_id?: string;
  previous_step_id?: string;
  status: 'initialized' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
  data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalGate {
  id: string;
  step_id: string;
  execution_id: string;
  approver_id?: string;
  approval_type: 'single' | 'multiple' | 'sequential';
  required_approvers: string[];
  current_approvers: string[];
  approval_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  timeout_at?: Date;
  created_at: Date;
}

export interface DecisionRoute {
  condition: string;
  next_step_id: string;
  metadata?: Record<string, any>;
}

export interface WorkflowTransition {
  from_step_id: string;
  to_step_id: string;
  condition?: string;
  transition_type: 'automatic' | 'conditional' | 'approval' | 'manual';
  metadata?: Record<string, any>;
}

/**
 * SOP Workflow Helper Class
 */
export class SOPWorkflowHelpers {
  private static workflowStates = new Map<string, WorkflowState>();
  private static approvalGates = new Map<string, ApprovalGate>();
  private static activeDecisions = new Map<string, SOPDecision>();

  /**
   * Initializes workflow execution
   */
  static initializeWorkflow(
    processId: string,
    userId?: string,
    initialData?: Record<string, any>
  ): WorkflowState {
    const executionId = this.generateId();
    
    const workflowState: WorkflowState = {
      execution_id: executionId,
      process_id: processId,
      status: 'initialized',
      data: initialData || {},
      metadata: {
        initiated_by: userId,
        initialization_timestamp: new Date().toISOString()
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    this.workflowStates.set(executionId, workflowState);
    
    logger.info('Workflow initialized', {
      execution_id: executionId,
      process_id: processId,
      user_id: userId
    });

    return workflowState;
  }

  /**
   * Advances workflow to next step
   */
  static async advanceWorkflow(
    executionId: string,
    nextStepId: string,
    stepResult?: ProcessingResult
  ): Promise<ProcessingResult> {
    try {
      const workflowState = this.workflowStates.get(executionId);
      if (!workflowState) {
        return {
          success: false,
          error: `Workflow state not found: ${executionId}`
        };
      }

      // Update workflow state
      workflowState.previous_step_id = workflowState.current_step_id;
      workflowState.current_step_id = nextStepId;
      workflowState.status = 'running';
      workflowState.updated_at = new Date();

      // Merge step result data
      if (stepResult?.success && stepResult.data) {
        workflowState.data = {
          ...workflowState.data,
          ...stepResult.data
        };
      }

      // Update metadata
      workflowState.metadata.last_transition = {
        from: workflowState.previous_step_id,
        to: nextStepId,
        timestamp: new Date().toISOString(),
        result: stepResult?.success ? 'success' : 'failed'
      };

      this.workflowStates.set(executionId, workflowState);

      logger.info('Workflow advanced', {
        execution_id: executionId,
        from_step: workflowState.previous_step_id,
        to_step: nextStepId
      });

      return {
        success: true,
        data: workflowState
      };
    } catch (error) {
      logger.error('Failed to advance workflow', { execution_id: executionId, error });
      return {
        success: false,
        error: `Workflow advancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Handles SOP decision points
   */
  static async handleSOPDecision(
    decision: SOPDecision,
    context: SOPExecutionContext,
    routes: DecisionRoute[]
  ): Promise<ProcessingResult> {
    try {
      logger.info('Processing SOP decision', {
        decision_id: decision.id,
        decision_type: decision.decision_type,
        step_id: decision.step_id
      });

      // Store decision for tracking
      this.activeDecisions.set(decision.id, decision);

      let result: ProcessingResult;
      
      switch (decision.decision_type) {
        case 'approval':
          result = await this.handleApprovalDecision(decision, context);
          break;
        case 'conditional':
          result = await this.handleConditionalDecision(decision, context, routes);
          break;
        case 'routing':
          result = await this.handleRoutingDecision(decision, context, routes);
          break;
        default:
          throw new Error(`Unknown decision type: ${decision.decision_type}`);
      }

      // Update decision result
      decision.timestamp = new Date();
      this.activeDecisions.set(decision.id, decision);

      return result;
    } catch (error) {
      logger.error('Decision handling failed', {
        decision_id: decision.id,
        error
      });
      return {
        success: false,
        error: `Decision handling error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Handles approval decisions
   */
  private static async handleApprovalDecision(
    decision: SOPDecision,
    context: SOPExecutionContext
  ): Promise<ProcessingResult> {
    const approvalConfig = decision.decision_data;
    
    const approvalGate: ApprovalGate = {
      id: this.generateId(),
      step_id: decision.step_id,
      execution_id: context.execution_id,
      approval_type: approvalConfig.approval_type || 'single',
      required_approvers: approvalConfig.required_approvers || [],
      current_approvers: [],
      approval_data: decision.decision_data,
      status: 'pending',
      timeout_at: approvalConfig.timeout_hours 
        ? new Date(Date.now() + approvalConfig.timeout_hours * 60 * 60 * 1000)
        : undefined,
      created_at: new Date()
    };

    this.approvalGates.set(approvalGate.id, approvalGate);

    return {
      success: true,
      data: {
        approval_gate_id: approvalGate.id,
        status: 'pending_approval',
        required_approvers: approvalGate.required_approvers,
        timeout_at: approvalGate.timeout_at
      },
      metadata: {
        requires_approval: true,
        approval_type: approvalGate.approval_type
      }
    };
  }

  /**
   * Handles conditional decisions
   */
  private static async handleConditionalDecision(
    decision: SOPDecision,
    context: SOPExecutionContext,
    routes: DecisionRoute[]
  ): Promise<ProcessingResult> {
    const conditions = decision.decision_data.conditions || [];
    const inputData = context.input_data || {};

    for (const condition of conditions) {
      if (this.evaluateCondition(condition, inputData)) {
        const matchingRoute = routes.find(route => route.condition === condition.name);
        if (matchingRoute) {
          decision.result = 'conditional';
          decision.next_step_id = matchingRoute.next_step_id;
          
          return {
            success: true,
            data: {
              condition_met: condition.name,
              next_step_id: matchingRoute.next_step_id,
              condition_result: true
            }
          };
        }
      }
    }

    // No condition met, use default route
    const defaultRoute = routes.find(route => route.condition === 'default');
    if (defaultRoute) {
      decision.result = 'conditional';
      decision.next_step_id = defaultRoute.next_step_id;
      
      return {
        success: true,
        data: {
          condition_met: 'default',
          next_step_id: defaultRoute.next_step_id,
          condition_result: false
        }
      };
    }

    return {
      success: false,
      error: 'No matching condition and no default route specified'
    };
  }

  /**
   * Handles routing decisions
   */
  private static async handleRoutingDecision(
    decision: SOPDecision,
    context: SOPExecutionContext,
    routes: DecisionRoute[]
  ): Promise<ProcessingResult> {
    const routingData = decision.decision_data;
    const selectedRoute = routingData.selected_route;
    
    if (!selectedRoute) {
      return {
        success: false,
        error: 'No route selected for routing decision'
      };
    }

    const route = routes.find(r => r.condition === selectedRoute);
    if (!route) {
      return {
        success: false,
        error: `Route not found: ${selectedRoute}`
      };
    }

    decision.result = 'route';
    decision.next_step_id = route.next_step_id;
    
    return {
      success: true,
      data: {
        selected_route: selectedRoute,
        next_step_id: route.next_step_id
      }
    };
  }

  /**
   * Processes approval gate response
   */
  static async processSOPApproval(
    approvalGateId: string,
    approverId: string,
    approved: boolean,
    comments?: string
  ): Promise<ProcessingResult> {
    try {
      const approvalGate = this.approvalGates.get(approvalGateId);
      if (!approvalGate) {
        return {
          success: false,
          error: `Approval gate not found: ${approvalGateId}`
        };
      }

      if (approvalGate.status !== 'pending') {
        return {
          success: false,
          error: `Approval gate already processed: ${approvalGate.status}`
        };
      }

      // Check if approver is authorized
      if (approvalGate.required_approvers.length > 0 && 
          !approvalGate.required_approvers.includes(approverId)) {
        return {
          success: false,
          error: 'Approver not authorized for this approval gate'
        };
      }

      // Record approval
      const approvalRecord = {
        approver_id: approverId,
        approved,
        comments,
        timestamp: new Date().toISOString()
      };

      approvalGate.approval_data.approvals = approvalGate.approval_data.approvals || [];
      approvalGate.approval_data.approvals.push(approvalRecord);
      approvalGate.current_approvers.push(approverId);

      // Determine if approval is complete
      const approvalResult = this.evaluateApprovalCompletion(approvalGate);
      approvalGate.status = approvalResult.status;

      this.approvalGates.set(approvalGateId, approvalGate);

      logger.info('Approval processed', {
        approval_gate_id: approvalGateId,
        approver_id: approverId,
        approved,
        final_status: approvalGate.status
      });

      return {
        success: true,
        data: {
          approval_gate_id: approvalGateId,
          approval_status: approvalGate.status,
          approval_complete: approvalResult.complete,
          next_action: approvalResult.next_action
        },
        metadata: {
          approval_record: approvalRecord,
          total_approvals: approvalGate.current_approvers.length
        }
      };
    } catch (error) {
      logger.error('Approval processing failed', {
        approval_gate_id: approvalGateId,
        error
      });
      return {
        success: false,
        error: `Approval processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Evaluates if approval is complete
   */
  private static evaluateApprovalCompletion(approvalGate: ApprovalGate): {
    status: 'pending' | 'approved' | 'rejected' | 'timeout';
    complete: boolean;
    next_action: string;
  } {
    const approvals = approvalGate.approval_data.approvals || [];
    const approvedCount = approvals.filter((a: any) => a.approved).length;
    const rejectedCount = approvals.filter((a: any) => !a.approved).length;
    
    // Check timeout
    if (approvalGate.timeout_at && new Date() > approvalGate.timeout_at) {
      return {
        status: 'timeout',
        complete: true,
        next_action: 'handle_timeout'
      };
    }

    switch (approvalGate.approval_type) {
      case 'single':
        if (approvedCount > 0) {
          return {
            status: 'approved',
            complete: true,
            next_action: 'continue_workflow'
          };
        }
        if (rejectedCount > 0) {
          return {
            status: 'rejected',
            complete: true,
            next_action: 'handle_rejection'
          };
        }
        break;
      
      case 'multiple':
        const requiredApprovals = approvalGate.required_approvers.length;
        if (approvedCount >= requiredApprovals) {
          return {
            status: 'approved',
            complete: true,
            next_action: 'continue_workflow'
          };
        }
        if (rejectedCount > 0) {
          return {
            status: 'rejected',
            complete: true,
            next_action: 'handle_rejection'
          };
        }
        break;
      
      case 'sequential':
        const nextRequiredApprover = approvalGate.required_approvers[
          approvalGate.current_approvers.length
        ];
        
        if (!nextRequiredApprover) {
          // All sequential approvals complete
          if (rejectedCount === 0) {
            return {
              status: 'approved',
              complete: true,
              next_action: 'continue_workflow'
            };
          } else {
            return {
              status: 'rejected',
              complete: true,
              next_action: 'handle_rejection'
            };
          }
        }
        
        // Check if current sequential approver rejected
        const lastApproval = approvals[approvals.length - 1];
        if (lastApproval && !lastApproval.approved) {
          return {
            status: 'rejected',
            complete: true,
            next_action: 'handle_rejection'
          };
        }
        break;
    }

    return {
      status: 'pending',
      complete: false,
      next_action: 'wait_for_approval'
    };
  }

  /**
   * Gets workflow state
   */
  static getWorkflowState(executionId: string): WorkflowState | undefined {
    return this.workflowStates.get(executionId);
  }

  /**
   * Gets approval gate
   */
  static getApprovalGate(approvalGateId: string): ApprovalGate | undefined {
    return this.approvalGates.get(approvalGateId);
  }

  /**
   * Gets active decision
   */
  static getActiveDecision(decisionId: string): SOPDecision | undefined {
    return this.activeDecisions.get(decisionId);
  }

  /**
   * Lists pending approvals for user
   */
  static getPendingApprovalsForUser(userId: string): ApprovalGate[] {
    return Array.from(this.approvalGates.values()).filter(gate => 
      gate.status === 'pending' && 
      (gate.required_approvers.length === 0 || gate.required_approvers.includes(userId))
    );
  }

  /**
   * Lists active workflows
   */
  static getActiveWorkflows(): WorkflowState[] {
    return Array.from(this.workflowStates.values()).filter(state => 
      ['initialized', 'running', 'waiting'].includes(state.status)
    );
  }

  /**
   * Completes workflow
   */
  static completeWorkflow(
    executionId: string,
    result: ProcessingResult
  ): ProcessingResult {
    const workflowState = this.workflowStates.get(executionId);
    if (!workflowState) {
      return {
        success: false,
        error: `Workflow state not found: ${executionId}`
      };
    }

    workflowState.status = result.success ? 'completed' : 'failed';
    workflowState.updated_at = new Date();
    workflowState.metadata.completion_result = result;
    workflowState.metadata.completed_at = new Date().toISOString();

    if (result.data) {
      workflowState.data = {
        ...workflowState.data,
        ...result.data
      };
    }

    this.workflowStates.set(executionId, workflowState);

    logger.info('Workflow completed', {
      execution_id: executionId,
      success: result.success,
      final_status: workflowState.status
    });

    return {
      success: true,
      data: workflowState
    };
  }

  /**
   * Cancels workflow
   */
  static cancelWorkflow(
    executionId: string,
    reason: string,
    userId?: string
  ): ProcessingResult {
    const workflowState = this.workflowStates.get(executionId);
    if (!workflowState) {
      return {
        success: false,
        error: `Workflow state not found: ${executionId}`
      };
    }

    workflowState.status = 'cancelled';
    workflowState.updated_at = new Date();
    workflowState.metadata.cancellation = {
      reason,
      cancelled_by: userId,
      cancelled_at: new Date().toISOString()
    };

    this.workflowStates.set(executionId, workflowState);

    // Cancel related approval gates
    Array.from(this.approvalGates.values())
      .filter(gate => gate.execution_id === executionId && gate.status === 'pending')
      .forEach(gate => {
        gate.status = 'timeout'; // Use timeout status for cancelled
        this.approvalGates.set(gate.id, gate);
      });

    logger.info('Workflow cancelled', {
      execution_id: executionId,
      reason,
      cancelled_by: userId
    });

    return {
      success: true,
      data: workflowState
    };
  }

  /**
   * Evaluates condition expression
   */
  private static evaluateCondition(condition: any, data: any): boolean {
    try {
      const field = condition.field;
      const operator = condition.operator;
      const value = condition.value;
      const dataValue = data[field];

      switch (operator) {
        case 'equals':
          return dataValue === value;
        case 'not_equals':
          return dataValue !== value;
        case 'greater_than':
          return Number(dataValue) > Number(value);
        case 'greater_than_or_equal':
          return Number(dataValue) >= Number(value);
        case 'less_than':
          return Number(dataValue) < Number(value);
        case 'less_than_or_equal':
          return Number(dataValue) <= Number(value);
        case 'contains':
          return String(dataValue).includes(String(value));
        case 'starts_with':
          return String(dataValue).startsWith(String(value));
        case 'ends_with':
          return String(dataValue).endsWith(String(value));
        case 'exists':
          return dataValue !== undefined && dataValue !== null;
        case 'not_exists':
          return dataValue === undefined || dataValue === null;
        case 'in_array':
          return Array.isArray(value) && value.includes(dataValue);
        case 'regex_match':
          return new RegExp(value).test(String(dataValue));
        default:
          logger.warn(`Unknown condition operator: ${operator}`);
          return false;
      }
    } catch (error) {
      logger.error('Condition evaluation failed', { condition, error });
      return false;
    }
  }

  /**
   * Generates unique ID
   */
  private static generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup completed workflows (call periodically)
   */
  static cleanupCompletedWorkflows(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    // Clean workflow states
    for (const [id, state] of this.workflowStates.entries()) {
      if (['completed', 'failed', 'cancelled'].includes(state.status) && 
          state.updated_at < cutoffTime) {
        this.workflowStates.delete(id);
        cleanedCount++;
      }
    }

    // Clean approval gates
    for (const [id, gate] of this.approvalGates.entries()) {
      if (['approved', 'rejected', 'timeout'].includes(gate.status) &&
          gate.created_at < cutoffTime) {
        this.approvalGates.delete(id);
      }
    }

    // Clean decisions
    for (const [id, decision] of this.activeDecisions.entries()) {
      if (decision.timestamp < cutoffTime) {
        this.activeDecisions.delete(id);
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} completed workflows`);
    }

    return cleanedCount;
  }
}
