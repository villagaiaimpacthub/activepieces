/**
 * SOP Approval Gate Piece
 * 
 * Comprehensive approval management piece that extends the BaseSoPiece framework
 * to provide multi-level approval workflows, escalation management, and complete
 * audit trails for SOP processes.
 */

import { Property } from '@activepieces/pieces-framework';
import { 
  BaseSoPiece, 
  BaseSoPieceConfig,
  SOPPieceType,
  SOPPieceCategory,
  SOPPriority,
  SOPExecutionContext,
  SOPExecutionState,
  SOPComplianceStatus
} from 'sop-framework';
import { nanoid } from 'nanoid';

/**
 * Approval Gate specific configuration interface
 */
export interface ApprovalGateConfig extends BaseSoPieceConfig {
  // Approval workflow settings
  approvalType: 'single' | 'sequential' | 'parallel' | 'consensus' | 'conditional';
  requiredApprovals?: number;
  consensusThreshold?: number;
  
  // Timeout and escalation settings
  approvalTimeoutHours: number;
  escalationChain: string[];
  autoEscalateOnTimeout: boolean;
  
  // Notification settings
  notificationChannels: string[];
  reminderIntervals: number[];
  
  // Integration settings
  enableWebhooks: boolean;
  webhookUrls?: string[];
  callbackUrl?: string;
}

/**
 * Approval request data structure
 */
export interface ApprovalRequest {
  requestId: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  dueDate?: string;
  priority: SOPPriority;
  category: string;
  
  // Approval details
  approvers: ApprovalParticipant[];
  approvalType: string;
  requiredApprovals: number;
  
  // Request data
  requestData: Record<string, any>;
  attachments: AttachmentInfo[];
  
  // Current state
  status: ApprovalStatus;
  currentStage?: number;
  approvalResponses: ApprovalResponse[];
  
  // Workflow metadata
  workflowId?: string;
  sopId?: string;
  processInstanceId?: string;
}

/**
 * Approval participant information
 */
export interface ApprovalParticipant {
  id: string;
  type: 'user' | 'role' | 'group';
  name: string;
  email?: string;
  level: number;
  weight?: number;
  canDelegate: boolean;
  backups: string[];
  notificationPreferences: {
    channels: string[];
    frequency: 'immediate' | 'batched' | 'digest';
    quietHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

/**
 * Individual approval response
 */
export interface ApprovalResponse {
  responseId: string;
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'delegated' | 'abstained';
  timestamp: string;
  comments?: string;
  attachments: AttachmentInfo[];
  confidence?: number;
  delegatedTo?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Attachment information
 */
export interface AttachmentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata: Record<string, any>;
}

/**
 * Approval status enumeration
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  DELEGATED = 'delegated'
}

/**
 * Escalation rule configuration
 */
export interface EscalationRule {
  id: string;
  name: string;
  trigger: 'timeout' | 'rejection' | 'no_response' | 'custom';
  triggerValue?: any;
  action: 'escalate' | 'auto_approve' | 'auto_reject' | 'notify';
  escalateTo: string[];
  maxEscalations: number;
  enabled: boolean;
}

/**
 * Approval notification data
 */
export interface ApprovalNotification {
  type: 'request' | 'reminder' | 'escalation' | 'response' | 'completion';
  recipients: string[];
  subject: string;
  message: string;
  requestId: string;
  priority: SOPPriority;
  scheduledFor?: string;
  channels: string[];
}

/**
 * SOP Approval Gate Piece implementation
 */
export class SOPApprovalGatePiece extends BaseSoPiece {
  private readonly config: ApprovalGateConfig;
  
  constructor(config: ApprovalGateConfig) {
    // Initialize base SOP piece with approval-specific configuration
    super({
      displayName: config.displayName || 'Approval Gate',
      description: config.description || 'Multi-level approval workflow management',
      sopPieceType: SOPPieceType.APPROVAL_GATE,
      sopCategory: SOPPieceCategory.APPROVAL_WORKFLOWS,
      priority: config.priority || SOPPriority.HIGH,
      complianceRequired: config.complianceRequired ?? true,
      auditTrailRequired: config.auditTrailRequired ?? true,
      approversRequired: true,
      customValidationRules: config.customValidationRules,
      integrationPoints: config.integrationPoints || ['webhook', 'email', 'sms'],
      tags: config.tags || ['approval', 'workflow', 'gate'],
      department: config.department,
      version: config.version || '1.0.0'
    });
    
    this.config = config;
  }

  /**
   * Main execution method for approval gate initiation
   */
  public async execute(propsValue: any, executedBy: string): Promise<ApprovalRequest> {
    try {
      // Create execution context
      const context = this.createExecutionContext(propsValue, executedBy);
      
      // Validate execution parameters
      const validation = await this.validateExecution(context, propsValue);
      if (!validation.isValid) {
        throw new Error(`Approval Gate validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      // Execute pre-run hooks
      await this.executePreRunHooks(context, propsValue);
      
      // Create approval request
      const approvalRequest = await this.createApprovalRequest(propsValue, executedBy, context);
      
      // Process the approval workflow
      const result = await this.processApprovalWorkflow(approvalRequest, context);
      
      // Execute post-run hooks
      await this.executePostRunHooks(context, result);
      
      return result;
    } catch (error) {
      const context = this.createExecutionContext(propsValue, executedBy);
      await this.handleExecutionError(context, error as Error);
      throw error;
    }
  }

  /**
   * Create approval request from properties
   */
  private async createApprovalRequest(
    propsValue: any, 
    executedBy: string,
    context: SOPExecutionContext
  ): Promise<ApprovalRequest> {
    const now = new Date().toISOString();
    const requestId = nanoid();
    
    // Process approvers configuration
    const approvers = await this.processApproversConfiguration(propsValue.approvers || []);
    
    // Calculate required approvals based on type
    const requiredApprovals = this.calculateRequiredApprovals(
      propsValue.approvalType || 'single',
      approvers.length,
      propsValue.requiredApprovals,
      propsValue.consensusThreshold
    );
    
    const approvalRequest: ApprovalRequest = {
      requestId,
      title: propsValue.title || 'Approval Required',
      description: propsValue.description || 'Please review and approve this request',
      requestedBy: executedBy,
      requestedAt: now,
      dueDate: propsValue.dueDate ? new Date(propsValue.dueDate).toISOString() : undefined,
      priority: propsValue.priority || SOPPriority.NORMAL,
      category: propsValue.category || 'general',
      
      // Approval configuration
      approvers,
      approvalType: propsValue.approvalType || 'single',
      requiredApprovals,
      
      // Request data
      requestData: propsValue.requestData || {},
      attachments: await this.processAttachments(propsValue.attachments || []),
      
      // Current state
      status: ApprovalStatus.PENDING,
      currentStage: 1,
      approvalResponses: [],
      
      // Workflow metadata
      workflowId: context.sopMetadata.sopId,
      sopId: context.sopMetadata.sopId,
      processInstanceId: context.executionId
    };
    
    // Update execution context with approval request data
    context.variables.approvalRequest = approvalRequest;
    context.auditTrail.push({
      timestamp: now,
      action: 'approval_request_created',
      userId: executedBy,
      details: {
        requestId,
        approvalType: approvalRequest.approvalType,
        requiredApprovals,
        approversCount: approvers.length
      }
    });
    
    return approvalRequest;
  }

  /**
   * Process approvers configuration
   */
  private async processApproversConfiguration(approversConfig: any[]): Promise<ApprovalParticipant[]> {
    return approversConfig.map((approver, index) => ({
      id: approver.id || nanoid(),
      type: approver.type || 'user',
      name: approver.name,
      email: approver.email,
      level: approver.level || (index + 1),
      weight: approver.weight || 1,
      canDelegate: approver.canDelegate ?? false,
      backups: approver.backups || [],
      notificationPreferences: {
        channels: approver.notificationChannels || ['email'],
        frequency: approver.notificationFrequency || 'immediate',
        quietHours: approver.quietHours
      }
    }));
  }

  /**
   * Calculate required approvals based on approval type
   */
  private calculateRequiredApprovals(
    approvalType: string,
    approversCount: number,
    explicitRequired?: number,
    consensusThreshold?: number
  ): number {
    switch (approvalType) {
      case 'single':
        return 1;
      case 'sequential':
        return approversCount;
      case 'parallel':
        return explicitRequired || approversCount;
      case 'consensus':
        return Math.ceil(approversCount * (consensusThreshold || 0.6));
      case 'conditional':
        return explicitRequired || 1;
      default:
        return 1;
    }
  }

  /**
   * Process file attachments
   */
  private async processAttachments(attachments: any[]): Promise<AttachmentInfo[]> {
    return attachments.map(attachment => ({
      id: attachment.id || nanoid(),
      name: attachment.name,
      type: attachment.type || 'application/octet-stream',
      size: attachment.size || 0,
      url: attachment.url,
      uploadedBy: attachment.uploadedBy,
      uploadedAt: attachment.uploadedAt || new Date().toISOString(),
      metadata: attachment.metadata || {}
    }));
  }

  /**
   * Process approval workflow
   */
  private async processApprovalWorkflow(
    approvalRequest: ApprovalRequest,
    context: SOPExecutionContext
  ): Promise<ApprovalRequest> {
    // Update execution state
    context.currentState = SOPExecutionState.WAITING_APPROVAL;
    
    // Send notifications to approvers
    await this.sendApprovalNotifications(approvalRequest, 'request');
    
    // Set up timeout handling if configured
    if (this.config.approvalTimeoutHours > 0) {
      await this.scheduleApprovalTimeout(approvalRequest);
    }
    
    // If webhooks are enabled, send webhook notifications
    if (this.config.enableWebhooks && this.config.webhookUrls) {
      await this.sendWebhookNotifications(approvalRequest, 'request');
    }
    
    // Update audit trail
    context.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: 'approval_workflow_initiated',
      userId: approvalRequest.requestedBy,
      details: {
        requestId: approvalRequest.requestId,
        approvers: approvalRequest.approvers.map(a => a.id),
        timeoutHours: this.config.approvalTimeoutHours
      }
    });
    
    return approvalRequest;
  }

  /**
   * Send approval notifications
   */
  private async sendApprovalNotifications(
    approvalRequest: ApprovalRequest,
    type: 'request' | 'reminder' | 'escalation' | 'response' | 'completion'
  ): Promise<void> {
    for (const approver of approvalRequest.approvers) {
      const notification: ApprovalNotification = {
        type,
        recipients: [approver.id],
        subject: this.generateNotificationSubject(approvalRequest, type),
        message: this.generateNotificationMessage(approvalRequest, type, approver),
        requestId: approvalRequest.requestId,
        priority: approvalRequest.priority,
        channels: approver.notificationPreferences.channels
      };
      
      // Send notification through configured channels
      await this.sendNotification(notification);
    }
  }

  /**
   * Generate notification subject line
   */
  private generateNotificationSubject(
    approvalRequest: ApprovalRequest,
    type: string
  ): string {
    const typeLabels = {
      'request': 'Approval Required',
      'reminder': 'Approval Reminder',
      'escalation': 'Escalated Approval',
      'response': 'Approval Response',
      'completion': 'Approval Complete'
    };
    
    return `${typeLabels[type] || 'Approval'}: ${approvalRequest.title}`;
  }

  /**
   * Generate notification message
   */
  private generateNotificationMessage(
    approvalRequest: ApprovalRequest,
    type: string,
    approver: ApprovalParticipant
  ): string {
    const baseMessage = `
Hello ${approver.name},

An approval request requires your attention:

Title: ${approvalRequest.title}
Description: ${approvalRequest.description}
Priority: ${approvalRequest.priority}
Requested by: ${approvalRequest.requestedBy}
Due Date: ${approvalRequest.dueDate || 'Not specified'}

Request Details:
${JSON.stringify(approvalRequest.requestData, null, 2)}

Please review and provide your approval decision.

Request ID: ${approvalRequest.requestId}
    `;
    
    return baseMessage.trim();
  }

  /**
   * Send notification through configured channels
   */
  private async sendNotification(notification: ApprovalNotification): Promise<void> {
    // Implementation would integrate with notification services
    // For now, we'll log the notification (in real implementation, this would send actual notifications)
    console.log(`Sending ${notification.type} notification to:`, notification.recipients);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Channels: ${notification.channels.join(', ')}`);
  }

  /**
   * Schedule approval timeout handling
   */
  private async scheduleApprovalTimeout(approvalRequest: ApprovalRequest): Promise<void> {
    const timeoutDate = new Date();
    timeoutDate.setHours(timeoutDate.getHours() + this.config.approvalTimeoutHours);
    
    // In a real implementation, this would schedule a job or timer
    console.log(`Approval timeout scheduled for ${timeoutDate.toISOString()}`);
  }

  /**
   * Send webhook notifications
   */
  private async sendWebhookNotifications(
    approvalRequest: ApprovalRequest,
    eventType: string
  ): Promise<void> {
    if (!this.config.webhookUrls) return;
    
    const webhookPayload = {
      event: `approval_${eventType}`,
      timestamp: new Date().toISOString(),
      data: {
        requestId: approvalRequest.requestId,
        status: approvalRequest.status,
        approvalRequest: approvalRequest
      }
    };
    
    for (const webhookUrl of this.config.webhookUrls) {
      try {
        // In real implementation, this would make HTTP requests to webhook URLs
        console.log(`Sending webhook to ${webhookUrl}:`, webhookPayload);
      } catch (error) {
        console.error(`Failed to send webhook to ${webhookUrl}:`, error);
      }
    }
  }

  /**
   * Get SOP-specific properties for approval gates
   */
  protected getSOPSpecificProperties(): Record<string, any> {
    return {
      title: Property.ShortText({
        displayName: 'Approval Title',
        description: 'Title of the approval request',
        required: true
      }),
      description: Property.LongText({
        displayName: 'Approval Description',
        description: 'Detailed description of what needs approval',
        required: true
      }),
      approvalType: Property.StaticDropdown({
        displayName: 'Approval Type',
        description: 'Type of approval workflow',
        required: true,
        defaultValue: 'single',
        options: {
          options: [
            { label: 'Single Approver', value: 'single' },
            { label: 'Sequential Approval', value: 'sequential' },
            { label: 'Parallel Approval', value: 'parallel' },
            { label: 'Consensus Approval', value: 'consensus' },
            { label: 'Conditional Approval', value: 'conditional' }
          ]
        }
      }),
      approvers: Property.Array({
        displayName: 'Approvers',
        description: 'List of people who need to approve this request',
        required: true
      }),
      requiredApprovals: Property.Number({
        displayName: 'Required Approvals',
        description: 'Number of approvals required (for parallel/consensus types)',
        required: false
      }),
      consensusThreshold: Property.Number({
        displayName: 'Consensus Threshold',
        description: 'Percentage of approvers needed for consensus (0.0 to 1.0)',
        required: false,
        validators: [
          { type: 'min', value: 0 },
          { type: 'max', value: 1 }
        ]
      }),
      requestData: Property.Object({
        displayName: 'Request Data',
        description: 'Additional data to include with the approval request',
        required: false
      }),
      attachments: Property.Array({
        displayName: 'Attachments',
        description: 'Files or documents to attach to the approval request',
        required: false
      }),
      approvalTimeoutHours: Property.Number({
        displayName: 'Approval Timeout (Hours)',
        description: 'Hours before approval request times out',
        required: false,
        defaultValue: 24
      }),
      escalationChain: Property.Array({
        displayName: 'Escalation Chain',
        description: 'Users to escalate to if approval times out',
        required: false
      }),
      notificationChannels: Property.MultiSelectDropdown({
        displayName: 'Notification Channels',
        description: 'Channels to use for notifications',
        required: false,
        defaultValue: ['email'],
        options: {
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Slack', value: 'slack' },
            { label: 'Microsoft Teams', value: 'teams' },
            { label: 'Webhook', value: 'webhook' }
          ]
        }
      }),
      enableWebhooks: Property.Checkbox({
        displayName: 'Enable Webhooks',
        description: 'Send webhook notifications for approval events',
        required: false,
        defaultValue: false
      }),
      webhookUrls: Property.Array({
        displayName: 'Webhook URLs',
        description: 'URLs to send webhook notifications to',
        required: false
      })
    };
  }

  /**
   * Get piece configuration for Activepieces
   */
  public getPieceConfiguration(): any {
    return {
      displayName: this.config.displayName,
      description: this.config.description,
      category: this.getActivepiecesCategory(),
      logoUrl: 'https://cdn.activepieces.com/pieces/sop-approval-gate.svg',
      properties: {
        ...this.getCommonSOPProperties(),
        ...this.getSOPSpecificProperties()
      },
      metadata: this.metadata
    };
  }

  /**
   * Process approval response (for external API calls)
   */
  public async processApprovalResponse(
    requestId: string,
    approverId: string,
    decision: 'approved' | 'rejected' | 'delegated',
    comments?: string,
    attachments?: AttachmentInfo[],
    delegatedTo?: string
  ): Promise<ApprovalResponse> {
    const response: ApprovalResponse = {
      responseId: nanoid(),
      approverId,
      approverName: approverId, // Would be resolved from user service
      decision,
      timestamp: new Date().toISOString(),
      comments,
      attachments: attachments || [],
      delegatedTo
    };

    // Log the response
    console.log(`Processing approval response for request ${requestId}:`, response);

    return response;
  }

  /**
   * Check approval status (for external queries)
   */
  public async queryApprovalStatus(requestId: string): Promise<ApprovalRequest | null> {
    // In real implementation, this would query the database
    // For now, return null indicating not found
    console.log(`Querying approval status for request: ${requestId}`);
    return null;
  }

  /**
   * Escalate approval to next level
   */
  public async escalateApproval(requestId: string, reason: string): Promise<boolean> {
    console.log(`Escalating approval request ${requestId}. Reason: ${reason}`);
    // In real implementation, this would update the approval request and notify escalation chain
    return true;
  }

  /**
   * Cancel approval request
   */
  public async cancelApproval(requestId: string, reason: string): Promise<boolean> {
    console.log(`Cancelling approval request ${requestId}. Reason: ${reason}`);
    // In real implementation, this would mark the request as cancelled
    return true;
  }
}